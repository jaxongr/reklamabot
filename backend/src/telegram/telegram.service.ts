import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { computeCheck } from 'telegram/Password';
import { PrismaService } from '../common/prisma.service';
import { ConfigService } from '@nestjs/config';
import { SessionStatus } from '@prisma/client';

interface PendingAuth {
  client: TelegramClient;
  phone: string;
  phoneCodeHash: string;
  sessionId: string;
}

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private readonly clients = new Map<string, TelegramClient>();
  private readonly pendingAuths = new Map<string, PendingAuth>();
  private readonly apiId: number;
  private readonly apiHash: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.apiId = parseInt(this.config.get<string>('TELEGRAM_API_ID') || '0');
    this.apiHash = this.config.get<string>('TELEGRAM_API_HASH') || '';
  }

  async onModuleInit() {
    this.logger.log(`Telegram Service initialized (API ID: ${this.apiId})`);
    if (!this.apiId || !this.apiHash) {
      this.logger.warn('TELEGRAM_API_ID yoki TELEGRAM_API_HASH sozlanmagan!');
      return;
    }
    try {
      await this.loadActiveSessions();
    } catch (error) {
      this.logger.warn('Sessionlarni yuklashda xatolik: ' + error.message);
    }
  }

  async onModuleDestroy() {
    for (const [sessionId, client] of this.clients) {
      try {
        await client.disconnect();
        this.logger.log(`Session uzildi: ${sessionId}`);
      } catch (error) {
        this.logger.error(`Session uzishda xatolik ${sessionId}:`, error.message);
      }
    }
    this.clients.clear();
  }

  /**
   * 1-qadam: Telefon raqamga kod yuborish
   */
  async sendCode(userId: string, phone: string, sessionName?: string): Promise<{
    sessionId: string;
    phoneCodeHash: string;
  }> {
    // DB da session yaratish
    const session = await this.prisma.session.create({
      data: {
        userId,
        name: sessionName || `Session ${phone.slice(-4)}`,
        phone,
        status: SessionStatus.INACTIVE,
      },
    });

    // Yangi TelegramClient yaratish
    const stringSession = new StringSession('');
    const client = new TelegramClient(stringSession, this.apiId, this.apiHash, {
      connectionRetries: 5,
      requestRetries: 3,
    });

    await client.connect();
    this.logger.log(`Client ulandi, kod yuborilmoqda: ${phone}`);

    try {
      const result = await client.invoke(
        new Api.auth.SendCode({
          phoneNumber: phone,
          apiId: this.apiId,
          apiHash: this.apiHash,
          settings: new Api.CodeSettings({}),
        }),
      );

      const phoneCodeHash = (result as any).phoneCodeHash;

      // Pending auth ni saqlash
      this.pendingAuths.set(session.id, {
        client,
        phone,
        phoneCodeHash,
        sessionId: session.id,
      });

      this.logger.log(`Kod yuborildi: ${phone}, session: ${session.id}`);

      return {
        sessionId: session.id,
        phoneCodeHash,
      };
    } catch (error) {
      // Xatolik bo'lsa sessionni o'chirish
      await this.prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      await client.disconnect().catch(() => {});
      this.logger.error(`Kod yuborishda xatolik: ${error.message}`);
      throw new Error(`Kod yuborishda xatolik: ${error.message}`);
    }
  }

  /**
   * 2-qadam: Kodni tasdiqlash va sign in
   */
  async signIn(sessionId: string, code: string, password?: string): Promise<{
    success: boolean;
    groupsCount: number;
  }> {
    const pending = this.pendingAuths.get(sessionId);
    if (!pending) {
      throw new Error('Auth jarayoni topilmadi. Qayta telefon raqam yuboring.');
    }

    const { client, phone, phoneCodeHash } = pending;

    try {
      // Faqat parol kelgan bo'lsa — 2FA checkPassword
      if (password && !code) {
        this.logger.log(`2FA parol bilan kirish: ${sessionId}`);
        const srpPassword = await client.invoke(new Api.account.GetPassword());
        const passwordSrpResult = await client.invoke(
          new Api.auth.CheckPassword({
            password: await computeCheck(srpPassword, password),
          }),
        );
        this.logger.log(`2FA muvaffaqiyatli: ${sessionId}`);
      } else {
        // Kod bilan sign in
        this.logger.log(`Kod bilan sign in: ${sessionId}, kod: ${code}`);
        try {
          await client.invoke(
            new Api.auth.SignIn({
              phoneNumber: phone,
              phoneCodeHash,
              phoneCode: code,
            }),
          );
        } catch (error: any) {
          this.logger.error(`SignIn xatolik: errorMessage=${error.errorMessage}, message=${error.message}`);

          // 2FA parol kerak
          if (error.errorMessage === 'SESSION_PASSWORD_NEEDED') {
            if (!password) {
              throw new Error('2FA_REQUIRED');
            }
            // 2FA parol bilan checkPassword
            const srpPassword = await client.invoke(new Api.account.GetPassword());
            await client.invoke(
              new Api.auth.CheckPassword({
                password: await computeCheck(srpPassword, password),
              }),
            );
          } else if (error.errorMessage === 'PHONE_CODE_INVALID') {
            throw new Error('Kod noto\'g\'ri. Qayta tekshiring.');
          } else if (error.errorMessage === 'PHONE_CODE_EXPIRED') {
            // Kodni qayta yuborish
            this.logger.log(`Kod muddati o'tgan, qayta yuborilmoqda: ${phone}`);
            try {
              const resendResult = await client.invoke(
                new Api.auth.ResendCode({
                  phoneNumber: phone,
                  phoneCodeHash,
                }),
              );
              const newHash = (resendResult as any).phoneCodeHash;
              // Pending auth ni yangilash
              this.pendingAuths.set(sessionId, {
                client,
                phone,
                phoneCodeHash: newHash,
                sessionId,
              });
              throw new Error('RESEND_CODE');
            } catch (resendError: any) {
              if (resendError.message === 'RESEND_CODE') throw resendError;
              // Resend ham ishlamasa — tozalash
              this.logger.error(`Kodni qayta yuborishda xatolik: ${resendError.message}`);
              this.pendingAuths.delete(sessionId);
              await client.disconnect().catch(() => {});
              await this.prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
              throw new Error('Kod muddati o\'tgan. Qayta telefon raqam yuboring.');
            }
          } else {
            throw error;
          }
        }
      }

      // Session string ni saqlash
      const sessionString = (client.session as StringSession).save();

      // DB ni yangilash
      await this.prisma.session.update({
        where: { id: sessionId },
        data: {
          sessionString,
          status: SessionStatus.ACTIVE,
        },
      });

      // Clientni ro'yxatga olish
      this.clients.set(sessionId, client);
      this.pendingAuths.delete(sessionId);

      // Guruhlarni sinxronlash
      const groupsCount = await this.syncGroups(sessionId);

      this.logger.log(`Session muvaffaqiyatli ulandi: ${sessionId}, guruhlar: ${groupsCount}`);

      return { success: true, groupsCount };
    } catch (error: any) {
      if (error.message === '2FA_REQUIRED') throw error;
      if (error.message === 'RESEND_CODE') throw error;
      if (error.message.includes('Kod noto\'g\'ri')) throw error;
      if (error.message.includes('Kod muddati')) throw error;

      this.pendingAuths.delete(sessionId);
      await client.disconnect().catch(() => {});

      // Xatolik bo'lsa sessionni o'chirish
      await this.prisma.session.delete({ where: { id: sessionId } }).catch(() => {});

      this.logger.error(`Sign in xatolik: ${error.errorMessage || error.message}`);
      throw new Error(`Kirishda xatolik: ${error.errorMessage || error.message}`);
    }
  }

  /**
   * Guruhlarni Telegram dan sinxronlash
   */
  async syncGroups(sessionId: string): Promise<number> {
    const client = this.clients.get(sessionId);
    if (!client) {
      throw new Error('Session ulangan emas');
    }

    try {
      const dialogs = await client.getDialogs({ limit: 500 });
      const groups: Array<{
        telegramId: string;
        title: string;
        username: string | null;
        type: 'GROUP' | 'SUPERGROUP' | 'CHANNEL';
        memberCount: number | null;
      }> = [];

      for (const dialog of dialogs) {
        // Faqat guruhlar va supergruhlar
        if (dialog.isGroup || dialog.isChannel) {
          const entity = dialog.entity as any;
          let type: 'GROUP' | 'SUPERGROUP' | 'CHANNEL' = 'GROUP';

          if (dialog.isChannel && entity?.megagroup) {
            type = 'SUPERGROUP';
          } else if (dialog.isChannel) {
            type = 'CHANNEL';
          }

          // Channellarda admin bo'lmasa yozolmaymiz — o'tkazib yuboramiz
          if (type === 'CHANNEL' && !entity?.adminRights && !entity?.creator) {
            continue;
          }

          groups.push({
            telegramId: dialog.id?.toString() || '',
            title: dialog.title || 'Nomsiz',
            username: entity?.username || null,
            type,
            memberCount: entity?.participantsCount || null,
          });
        }
      }

      // Mavjud guruhlarni olish
      const existingGroups = await this.prisma.group.findMany({
        where: { sessionId },
        select: { telegramId: true },
      });
      const existingIds = new Set(existingGroups.map(g => g.telegramId));

      // Yangi guruhlarni qo'shish
      const newGroups = groups.filter(g => !existingIds.has(g.telegramId));

      if (newGroups.length > 0) {
        await this.prisma.group.createMany({
          data: newGroups.map(g => ({
            sessionId,
            telegramId: g.telegramId,
            title: g.title,
            username: g.username,
            type: g.type,
            memberCount: g.memberCount,
          })),
          skipDuplicates: true,
        });
      }

      // Session statistikasini yangilash
      const totalGroups = await this.prisma.group.count({ where: { sessionId } });
      const activeGroups = await this.prisma.group.count({
        where: { sessionId, isActive: true, isSkipped: false },
      });

      await this.prisma.session.update({
        where: { id: sessionId },
        data: {
          totalGroups,
          activeGroups,
          lastSyncAt: new Date(),
        },
      });

      this.logger.log(`Guruhlar sinxronlandi: ${sessionId} — jami: ${totalGroups}, yangi: ${newGroups.length}`);
      return totalGroups;
    } catch (error) {
      this.logger.error(`Guruhlar sinxronlashda xatolik: ${error.message}`);
      throw error;
    }
  }

  /**
   * Barcha faol sessionlarni yuklash (server qayta ishga tushganda)
   */
  private async loadActiveSessions(): Promise<void> {
    const sessions = await this.prisma.session.findMany({
      where: {
        status: SessionStatus.ACTIVE,
        isFrozen: false,
        sessionString: { not: null },
      },
    });

    this.logger.log(`${sessions.length} ta faol session yuklanmoqda...`);

    for (const session of sessions) {
      try {
        await this.connectSession(session.id);
        this.logger.log(`Session yuklandi: ${session.id} (${session.name})`);
      } catch (error) {
        this.logger.error(`Session yuklanmadi ${session.id}: ${error.message}`);
      }
    }
  }

  /**
   * Mavjud sessionni qayta ulash (sessionString bilan)
   */
  async connectSession(sessionId: string): Promise<void> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session?.sessionString) {
      throw new Error('Session yoki session string topilmadi');
    }

    // Agar allaqachon ulangan bo'lsa — qayta ulamaymiz
    if (this.clients.has(sessionId)) {
      const existing = this.clients.get(sessionId)!;
      if (existing.connected) return;
      // Uzilgan bo'lsa — o'chirib qayta ulaymiz
      try { await existing.disconnect(); } catch {}
      this.clients.delete(sessionId);
    }

    const stringSession = new StringSession(session.sessionString);
    const client = new TelegramClient(stringSession, this.apiId, this.apiHash, {
      connectionRetries: 5,
      requestRetries: 3,
    });

    try {
      await client.connect();

      // Session hali ham ishlayaptimi tekshiramiz
      await client.getMe();

      this.clients.set(sessionId, client);
      this.logger.log(`Session ulandi: ${sessionId}`);
    } catch (error) {
      await client.disconnect().catch(() => {});
      this.logger.error(`Session ulashda xatolik ${sessionId}: ${error.message}`);

      // AUTH_KEY_UNREGISTERED bo'lsa — session o'lgan
      if (error.message?.includes('AUTH_KEY_UNREGISTERED') || error.message?.includes('SESSION_REVOKED')) {
        await this.markSessionDead(sessionId);
      }

      throw error;
    }
  }

  /**
   * Sessionni uzish
   */
  async disconnectSession(sessionId: string): Promise<void> {
    const client = this.clients.get(sessionId);
    if (client) {
      try {
        await client.disconnect();
      } catch {}
      this.clients.delete(sessionId);
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { status: SessionStatus.INACTIVE },
    });

    this.logger.log(`Session uzildi: ${sessionId}`);
  }

  /**
   * Sessionni o'chirish (DB dan ham)
   */
  async deleteSession(sessionId: string): Promise<void> {
    const client = this.clients.get(sessionId);
    if (client) {
      try { await client.disconnect(); } catch {}
      this.clients.delete(sessionId);
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { status: SessionStatus.DELETED },
    });

    this.logger.log(`Session o'chirildi: ${sessionId}`);
  }

  /**
   * O'lgan sessionni belgilash
   */
  private async markSessionDead(sessionId: string): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.BANNED,
        isFrozen: true,
        frozenAt: new Date(),
        freezeCount: { increment: 1 },
      },
    });
    this.logger.warn(`Session o'lgan deb belgilandi: ${sessionId}`);
  }

  /**
   * Frozen session
   */
  async markSessionFrozen(sessionId: string): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        isFrozen: true,
        frozenAt: new Date(),
        freezeCount: { increment: 1 },
      },
    });
    this.logger.warn(`Session muzlatildi: ${sessionId}`);
  }

  /**
   * Guruhga xabar yuborish
   */
  async sendMessage(
    sessionId: string,
    groupTelegramId: string,
    messageText: string,
  ): Promise<{ messageId?: number }> {
    const client = this.clients.get(sessionId);
    if (!client) {
      throw new Error(`Session ${sessionId} ulangan emas`);
    }

    if (!client.connected) {
      throw new Error(`Session ${sessionId} aloqa uzilgan`);
    }

    try {
      const result = await client.sendMessage(groupTelegramId, {
        message: messageText,
      });

      return { messageId: result?.id };
    } catch (error: any) {
      // FLOOD_WAIT
      if (error.errorMessage?.includes('FLOOD_WAIT') || error.message?.includes('FLOOD_WAIT')) {
        const match = (error.errorMessage || error.message).match(/(\d+)/);
        const waitSeconds = match ? parseInt(match[1]) : 60;
        this.logger.warn(`FLOOD_WAIT ${waitSeconds}s — session: ${sessionId}`);
        throw new Error(`FLOOD_WAIT:${waitSeconds}`);
      }

      // SLOWMODE
      if (error.errorMessage?.includes('SLOWMODE_WAIT') || error.seconds) {
        const waitSeconds = error.seconds || 300;
        this.logger.warn(`SLOWMODE_WAIT ${waitSeconds}s — group: ${groupTelegramId}`);
        throw new Error(`SLOWMODE_WAIT:${waitSeconds}`);
      }

      // Yozish taqiqlangan
      if (
        error.errorMessage?.includes('CHAT_WRITE_FORBIDDEN') ||
        error.errorMessage?.includes('USER_BANNED_IN_CHANNEL') ||
        error.errorMessage?.includes('CHANNEL_PRIVATE')
      ) {
        throw new Error(`WRITE_FORBIDDEN:${groupTelegramId}`);
      }

      // Cheklangan guruh
      if (
        error.errorMessage?.includes('CHAT_RESTRICTED') ||
        error.errorMessage?.includes('CHAT_SEND_PLAIN_FORBIDDEN') ||
        error.errorMessage?.includes('CHAT_GUEST_SEND_FORBIDDEN') ||
        error.errorMessage?.includes('PREMIUM_ACCOUNT_REQUIRED') ||
        error.errorMessage?.includes('CHAT_SEND_MEDIA_FORBIDDEN')
      ) {
        throw new Error(`CHAT_RESTRICTED:${groupTelegramId}`);
      }

      // Session o'lgan
      if (
        error.errorMessage?.includes('AUTH_KEY_UNREGISTERED') ||
        error.errorMessage?.includes('SESSION_REVOKED')
      ) {
        await this.markSessionDead(sessionId);
        this.clients.delete(sessionId);
        throw new Error(`SESSION_DEAD:${sessionId}`);
      }

      throw error;
    }
  }

  /**
   * Foydalanuvchining ulangan sessionlari
   */
  async getUserSessions(userId: string) {
    return this.prisma.session.findMany({
      where: {
        userId,
        status: { not: SessionStatus.DELETED },
      },
      include: {
        _count: { select: { groups: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Session ulangan va ishlayaptimi
   */
  isClientConnected(sessionId: string): boolean {
    const client = this.clients.get(sessionId);
    return !!client && client.connected;
  }

  /**
   * Ulangan sessionlar soni
   */
  getConnectedCount(): number {
    let count = 0;
    for (const [, client] of this.clients) {
      if (client.connected) count++;
    }
    return count;
  }

  /**
   * Pending auth bormi
   */
  hasPendingAuth(sessionId: string): boolean {
    return this.pendingAuths.has(sessionId);
  }

  /**
   * Pending auth ni bekor qilish
   */
  async cancelPendingAuth(sessionId: string): Promise<void> {
    const pending = this.pendingAuths.get(sessionId);
    if (pending) {
      await pending.client.disconnect().catch(() => {});
      this.pendingAuths.delete(sessionId);
    }
    await this.prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
  }
}
