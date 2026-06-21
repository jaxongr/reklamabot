import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ChildProcess, fork } from 'child_process';
import * as path from 'path';
import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { computeCheck } from 'telegram/Password';
import { PrismaService } from '../common/prisma.service';
import { ConfigService } from '@nestjs/config';
import { TgSmsSessionStatus, TgSmsMessageStatus } from '@prisma/client';
import { MonitorService } from '../monitor/monitor.service';
import * as https from 'https';

interface PendingAuth {
  client: TelegramClient;
  phone: string;
  phoneCodeHash: string;
  sessionId: string;
}

@Injectable()
export class TelegramSmsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramSmsService.name);
  private readonly pendingAuths = new Map<string, PendingAuth>();
  private readonly apiId: number;
  private readonly apiHash: string;

  // Child process
  private child: ChildProcess | null = null;
  private childReady = false;
  private readonly pendingRequests = new Map<
    string,
    { resolve: (v: any) => void; reject: (e: Error) => void; timer: NodeJS.Timeout }
  >();
  private requestIdCounter = 0;
  private readonly connectedSessions = new Set<string>();

  // Round-robin index for session rotation
  private roundRobinIndex = 0;
  private readonly botToken: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(forwardRef(() => MonitorService))
    private readonly monitorService: MonitorService,
  ) {
    this.apiId = parseInt(this.config.get<string>('TELEGRAM_API_ID') || '0');
    this.apiHash = this.config.get<string>('TELEGRAM_API_HASH') || '';
    this.botToken = this.config.get<string>('TELEGRAM_BOT_TOKEN') || '';
  }

  /**
   * Send message via Bot API (works with any user who started the bot)
   */
  private sendViaBotApi(chatId: string, text: string): Promise<{ ok: boolean; messageId?: number; error?: string }> {
    return new Promise((resolve) => {
      if (!this.botToken) {
        resolve({ ok: false, error: 'BOT_TOKEN not configured' });
        return;
      }
      const payload = JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' });
      const req = https.request(
        {
          hostname: 'api.telegram.org',
          path: `/bot${this.botToken}/sendMessage`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
        },
        (res) => {
          let data = '';
          res.on('data', (c) => (data += c));
          res.on('end', () => {
            try {
              const json = JSON.parse(data);
              if (json.ok) {
                resolve({ ok: true, messageId: json.result?.message_id });
              } else {
                resolve({ ok: false, error: json.description || 'Bot API error' });
              }
            } catch {
              resolve({ ok: false, error: 'Bot API parse error' });
            }
          });
        },
      );
      req.on('error', (e) => resolve({ ok: false, error: e.message }));
      req.write(payload);
      req.end();
    });
  }

  async onModuleInit() {
    this.logger.log('TelegramSms Service initialized');
    if (!this.apiId || !this.apiHash) {
      this.logger.warn('TELEGRAM_API_ID or TELEGRAM_API_HASH not configured');
      return;
    }
    this.spawnChild();
    setTimeout(() => this.loadActiveSessions(), 5000);
  }

  async onModuleDestroy() {
    for (const [, pending] of this.pendingAuths) {
      try { await pending.client.disconnect(); } catch {}
    }
    this.pendingAuths.clear();

    if (this.child) {
      try { await this.sendToChild('disconnectAll'); } catch {}
      this.child.kill();
      this.child = null;
    }
  }

  // ============================================================
  // CHILD PROCESS MANAGEMENT
  // ============================================================

  private spawnChild() {
    const childPath = path.join(__dirname, 'telegram-sms-worker.js');
    this.logger.log(`Spawning TG SMS child process: ${childPath}`);

    this.child = fork(childPath, [String(this.apiId), this.apiHash], {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    });

    this.child.on('message', (msg: any) => this.handleChildMessage(msg));

    this.child.on('error', (err) => {
      this.logger.error(`TG SMS child error: ${err.message}`);
    });

    this.child.on('exit', (code) => {
      this.logger.warn(`TG SMS child exited with code ${code}`);
      this.childReady = false;
      this.connectedSessions.clear();

      for (const [, pending] of this.pendingRequests) {
        clearTimeout(pending.timer);
        pending.reject(new Error('Child process exited'));
      }
      this.pendingRequests.clear();

      if (code !== 0) {
        setTimeout(() => {
          this.logger.log('Restarting TG SMS child process...');
          this.spawnChild();
          setTimeout(() => this.loadActiveSessions(), 3000);
        }, 5000);
      }
    });

    this.childReady = true;
  }

  private handleChildMessage(msg: any) {
    if (msg.type === 'response') {
      const pending = this.pendingRequests.get(msg.id);
      if (pending) {
        clearTimeout(pending.timer);
        this.pendingRequests.delete(msg.id);
        if (msg.success) pending.resolve(msg.data);
        else pending.reject(new Error(msg.error || 'Child request failed'));
      }
    } else if (msg.type === 'log') {
      if (msg.level === 'error') this.logger.error(`[SMS-W] ${msg.message}`);
      else if (msg.level === 'warn') this.logger.warn(`[SMS-W] ${msg.message}`);
      else this.logger.log(`[SMS-W] ${msg.message}`);
    }
  }

  private sendToChild(type: string, data: Record<string, any> = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.child || !this.childReady) {
        reject(new Error('TG SMS child process not running'));
        return;
      }
      const id = String(++this.requestIdCounter);
      const timer = setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('TG SMS child request timeout (60s)'));
        }
      }, 60_000);
      this.pendingRequests.set(id, { resolve, reject, timer });
      this.child!.send({ type, id, ...data });
    });
  }

  // ============================================================
  // SESSION LOADING
  // ============================================================

  private async loadActiveSessions() {
    // FROZEN/SPAM sessionlarni qayta ACTIVE qilish (server restart'da cooldown yo'qolgan)
    await this.prisma.telegramSmsSession.updateMany({
      where: {
        status: { in: [TgSmsSessionStatus.FROZEN, TgSmsSessionStatus.SPAM] },
        isEnabled: true,
      },
      data: {
        status: TgSmsSessionStatus.ACTIVE,
        spamType: null,
        spamDetectedAt: null,
        spamExpectedEnd: null,
      },
    });

    const sessions = await this.prisma.telegramSmsSession.findMany({
      where: {
        status: TgSmsSessionStatus.ACTIVE,
        isEnabled: true,
        sessionString: { not: { equals: null } },
      },
    });

    this.logger.log(`Loading ${sessions.length} TG SMS sessions...`);

    for (const session of sessions) {
      try {
        await this.sendToChild('connect', {
          sessionId: session.id,
          sessionString: session.sessionString,
        });
        this.connectedSessions.add(session.id);
        this.logger.log(`TG SMS session connected: ${session.id} (${session.phone})`);

        // Auto-setup profile: name + icon
        await this.sendToChild('setupProfile', {
          sessionId: session.id,
          firstName: "YO'LDA menejer",
          lastName: '',
          photoPath: require('path').join(process.cwd(), 'profile-icon.png'),
        }).catch((e: any) => this.logger.warn(`Profile setup: ${e.message}`));
      } catch (error: any) {
        this.logger.error(`TG SMS session load failed: ${session.id} - ${error.message}`);
        if (error.message.includes('SESSION_REVOKED') || error.message.includes('AUTH_KEY')) {
          await this.prisma.telegramSmsSession.update({
            where: { id: session.id },
            data: { status: TgSmsSessionStatus.BANNED, lastError: error.message },
          });
        }
      }
    }
  }

  // ============================================================
  // AUTH FLOW (session ulash)
  // ============================================================

  async sendCode(phone: string, name?: string): Promise<{ sessionId: string; phoneCodeHash: string }> {
    // Check if phone already exists
    const existing = await this.prisma.telegramSmsSession.findUnique({ where: { phone } });
    if (existing && existing.status === TgSmsSessionStatus.ACTIVE) {
      throw new BadRequestException('Bu raqam allaqachon ulangan');
    }

    const session = existing
      ? await this.prisma.telegramSmsSession.update({
          where: { id: existing.id },
          data: { name: name || existing.name, status: TgSmsSessionStatus.PENDING },
        })
      : await this.prisma.telegramSmsSession.create({
          data: { phone, name: name || `TG SMS ${phone.slice(-4)}`, status: TgSmsSessionStatus.PENDING },
        });

    const stringSession = new StringSession('');
    const client = new TelegramClient(stringSession, this.apiId, this.apiHash, {
      connectionRetries: 5,
      requestRetries: 3,
      autoReconnect: true,
    });

    await client.connect();

    try {
      let result: any;
      try {
        result = await client.invoke(
          new Api.auth.SendCode({
            phoneNumber: phone,
            apiId: this.apiId,
            apiHash: this.apiHash,
            settings: new Api.CodeSettings({}),
          }),
        );
      } catch (err: any) {
        // DC migration — gramJS buni avtomatik handle qilishi kerak
        // lekin ba'zan qilmaydi, shuning uchun qo'lda _switchDC chaqiramiz
        const migMatch = err.errorMessage?.match(/PHONE_MIGRATE_(\d+)/);
        if (migMatch) {
          const dcId = parseInt(migMatch[1]);
          this.logger.log(`Phone DC migrate: ${phone} -> DC${dcId}`);
          await (client as any)._switchDC(dcId);
          result = await client.invoke(
            new Api.auth.SendCode({
              phoneNumber: phone,
              apiId: this.apiId,
              apiHash: this.apiHash,
              settings: new Api.CodeSettings({}),
            }),
          );
        } else {
          throw err;
        }
      }

      const phoneCodeHash = (result as any).phoneCodeHash;

      this.pendingAuths.set(session.id, { client, phone, phoneCodeHash, sessionId: session.id });

      this.logger.log(`TG SMS code sent: ${phone}, session: ${session.id}`);
      return { sessionId: session.id, phoneCodeHash };
    } catch (error: any) {
      await client.disconnect().catch(() => {});
      if (!existing) {
        await this.prisma.telegramSmsSession.delete({ where: { id: session.id } }).catch(() => {});
      }
      throw new BadRequestException(`Kod yuborishda xatolik: ${error.message}`);
    }
  }

  async signIn(sessionId: string, code: string, password?: string): Promise<{ success: boolean }> {
    const pending = this.pendingAuths.get(sessionId);
    if (!pending) throw new BadRequestException('Auth jarayoni topilmadi. Qayta kod yuboring.');

    const { client, phone, phoneCodeHash } = pending;

    try {
      if (password && !code) {
        const srpPassword = await client.invoke(new Api.account.GetPassword());
        await client.invoke(
          new Api.auth.CheckPassword({
            password: await computeCheck(srpPassword, password),
          }),
        );
      } else {
        try {
          await client.invoke(
            new Api.auth.SignIn({
              phoneNumber: phone,
              phoneCodeHash,
              phoneCode: code,
            }),
          );
        } catch (error: any) {
          if (error.errorMessage === 'SESSION_PASSWORD_NEEDED') {
            if (!password) throw new Error('2FA_REQUIRED');
            const srpPassword = await client.invoke(new Api.account.GetPassword());
            await client.invoke(
              new Api.auth.CheckPassword({
                password: await computeCheck(srpPassword, password),
              }),
            );
          } else if (error.errorMessage === 'PHONE_CODE_EXPIRED') {
            throw new Error('PHONE_CODE_EXPIRED');
          } else {
            throw error;
          }
        }
      }

      // Save session string
      const sessionString = (client.session as StringSession).save();

      await this.prisma.telegramSmsSession.update({
        where: { id: sessionId },
        data: {
          sessionString,
          status: TgSmsSessionStatus.ACTIVE,
        },
      });

      // Disconnect auth client, connect in child process
      await client.disconnect().catch(() => {});
      this.pendingAuths.delete(sessionId);

      // Connect in child
      try {
        await this.sendToChild('connect', { sessionId, sessionString });
        this.connectedSessions.add(sessionId);

        // Auto-setup profile: name = "YO'LDA menejer" + icon
        await this.sendToChild('setupProfile', {
          sessionId,
          firstName: "YO'LDA menejer",
          lastName: '',
          photoPath: require('path').join(process.cwd(), 'profile-icon.png'),
        }).catch((e: any) => this.logger.warn(`Profile setup: ${e.message}`));
      } catch (e: any) {
        this.logger.warn(`Child connect after auth: ${e.message}`);
      }

      this.logger.log(`TG SMS session activated: ${sessionId}`);
      return { success: true };
    } catch (error: any) {
      if (error.message === '2FA_REQUIRED') throw new BadRequestException('2FA parol kerak');
      if (error.message === 'PHONE_CODE_EXPIRED') throw new BadRequestException('Kod muddati tugagan');
      throw new BadRequestException(`Kirish xatolik: ${error.message}`);
    }
  }

  // ============================================================
  // SESSION MANAGEMENT
  // ============================================================

  async getSessions() {
    return this.prisma.telegramSmsSession.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        phone: true,
        name: true,
        status: true,
        messagesSent: true,
        messagesFailed: true,
        lastUsedAt: true,
        lastError: true,
        spamDetectedAt: true,
        spamType: true,
        spamExpectedEnd: true,
        isEnabled: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    });
  }

  async toggleSession(sessionId: string, enabled: boolean) {
    const session = await this.prisma.telegramSmsSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session topilmadi');

    await this.prisma.telegramSmsSession.update({
      where: { id: sessionId },
      data: { isEnabled: enabled },
    });

    if (!enabled && this.connectedSessions.has(sessionId)) {
      await this.sendToChild('disconnect', { sessionId }).catch(() => {});
      this.connectedSessions.delete(sessionId);
    } else if (enabled && session.status === TgSmsSessionStatus.ACTIVE && session.sessionString) {
      try {
        await this.sendToChild('connect', { sessionId, sessionString: session.sessionString });
        this.connectedSessions.add(sessionId);
      } catch {}
    }

    return { success: true };
  }

  async deleteSession(sessionId: string) {
    if (this.connectedSessions.has(sessionId)) {
      await this.sendToChild('disconnect', { sessionId }).catch(() => {});
      this.connectedSessions.delete(sessionId);
    }
    await this.prisma.telegramSmsSession.delete({ where: { id: sessionId } });
    return { success: true };
  }

  async reconnectSession(sessionId: string) {
    const session = await this.prisma.telegramSmsSession.findUnique({ where: { id: sessionId } });
    if (!session?.sessionString) throw new BadRequestException('Session string yo\'q');

    // Disconnect first
    if (this.connectedSessions.has(sessionId)) {
      await this.sendToChild('disconnect', { sessionId }).catch(() => {});
      this.connectedSessions.delete(sessionId);
    }

    // Reconnect
    await this.sendToChild('connect', { sessionId, sessionString: session.sessionString });
    this.connectedSessions.add(sessionId);

    await this.prisma.telegramSmsSession.update({
      where: { id: sessionId },
      data: {
        status: TgSmsSessionStatus.ACTIVE,
        spamDetectedAt: null,
        spamType: null,
        lastError: null,
      },
    });

    return { success: true };
  }

  async checkSpamStatus(sessionId: string) {
    if (!this.connectedSessions.has(sessionId)) {
      throw new BadRequestException('Session ulanmagan');
    }

    try {
      const result = await this.sendToChild('checkSpamBot', { sessionId });
      const { spamStatus, text, expectedEnd } = result;

      if (spamStatus === 'SPAM' || spamStatus === 'BANNED') {
        await this.prisma.telegramSmsSession.update({
          where: { id: sessionId },
          data: {
            status: spamStatus === 'BANNED' ? TgSmsSessionStatus.BANNED : TgSmsSessionStatus.SPAM,
            spamDetectedAt: new Date(),
            spamType: spamStatus,
            spamExpectedEnd: expectedEnd ? new Date(expectedEnd) : null,
          },
        });
      } else {
        await this.prisma.telegramSmsSession.update({
          where: { id: sessionId },
          data: {
            status: TgSmsSessionStatus.ACTIVE,
            spamDetectedAt: null,
            spamType: null,
            spamExpectedEnd: null,
          },
        });
      }

      return { spamStatus, text, expectedEnd };
    } catch (error: any) {
      return { spamStatus: 'ERROR', text: error.message, expectedEnd: null };
    }
  }

  // ============================================================
  // TARGET LISTS
  // ============================================================

  async getDriverTargets() {
    return this.prisma.driverProfile.findMany({
      where: { user: { telegramId: { not: '' } } },
      select: {
        id: true,
        fullName: true,
        phone: true,
        vehicleType: true,
        lastCity: true,
        user: { select: { telegramId: true } },
      },
      orderBy: { fullName: 'asc' },
    });
  }

  async getOrderTargets(params: { type?: string; search?: string; limit?: number }) {
    const where: any = { senderTelegramId: { not: { equals: null } } };
    if (params.type) where.type = params.type;
    if (params.search) {
      where.OR = [
        { phone: { contains: params.search } },
        { cargoFrom: { contains: params.search, mode: 'insensitive' } },
        { cargoTo: { contains: params.search, mode: 'insensitive' } },
        { senderName: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.order.findMany({
      where,
      select: {
        id: true,
        senderTelegramId: true,
        senderName: true,
        phone: true,
        cargoFrom: true,
        cargoTo: true,
        type: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: params.limit || 100,
    });
  }

  async getBlockedTargets() {
    return this.prisma.blockedUser.findMany({
      where: { isActive: true, senderTelegramId: { not: '' } },
      select: {
        id: true,
        senderTelegramId: true,
        senderName: true,
        senderUsername: true,
        phone: true,
        reason: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllTargets() {
    const [drivers, orders, blocked] = await Promise.all([
      this.prisma.driverProfile.findMany({
        where: { user: { telegramId: { not: '' } } },
        select: { fullName: true, phone: true, user: { select: { telegramId: true, username: true } } },
        take: 2000,
      }),
      this.prisma.order.findMany({
        where: { senderTelegramId: { not: { equals: null } } },
        select: { senderTelegramId: true, senderUsername: true, senderName: true, phone: true, cargoFrom: true, cargoTo: true, type: true },
        orderBy: { createdAt: 'desc' },
        take: 5000,
      }),
      this.prisma.blockedUser.findMany({
        where: { isActive: true, senderTelegramId: { not: '' } },
        select: { senderTelegramId: true, senderUsername: true, senderName: true, phone: true },
      }),
    ]);

    const seen = new Set<string>();
    const targets: Array<{ telegramId: string; name: string; phone?: string; username?: string; source: string }> = [];

    for (const d of drivers) {
      const tgId = d.user?.telegramId;
      if (!tgId || seen.has(tgId)) continue;
      seen.add(tgId);
      targets.push({ telegramId: tgId, name: d.fullName || d.phone || 'Haydovchi', phone: d.phone || undefined, username: d.user?.username || undefined, source: 'Haydovchi' });
    }
    for (const o of orders) {
      if (!o.senderTelegramId || seen.has(o.senderTelegramId)) continue;
      seen.add(o.senderTelegramId);
      const route = [o.cargoFrom, o.cargoTo].filter(Boolean).join(' -> ');
      targets.push({
        telegramId: o.senderTelegramId,
        name: o.senderName || route || 'Order',
        phone: o.phone || undefined,
        username: o.senderUsername || undefined,
        source: o.type === 'DRIVER' ? 'Haydovchi order' : 'Yuk order',
      });
    }
    for (const b of blocked) {
      if (!b.senderTelegramId || seen.has(b.senderTelegramId)) continue;
      seen.add(b.senderTelegramId);
      targets.push({ telegramId: b.senderTelegramId, name: b.senderName || b.phone || 'Bloklangan', phone: b.phone || undefined, username: b.senderUsername || undefined, source: 'Bloklangan' });
    }

    return targets;
  }

  /**
   * Send to ALL unique telegram users
   */
  async sendToAll(message: string, sentById: string) {
    const targets = await this.getAllTargets();
    return this.sendBulk(targets, message, { category: 'GENERAL', sentById });
  }

  // ============================================================
  // SENDING MESSAGES
  // ============================================================

  /**
   * Get next available session for sending (round-robin)
   */
  private async getNextSession(): Promise<{ id: string; sessionString: string } | null> {
    const sessions = await this.prisma.telegramSmsSession.findMany({
      where: {
        status: TgSmsSessionStatus.ACTIVE,
        isEnabled: true,
        sessionString: { not: { equals: null } },
      },
      orderBy: { createdAt: 'asc' },
    });

    this.logger.debug(`getNextSession: ${sessions.length} ta faol session topildi`);

    if (sessions.length === 0) {
      // Debug: barcha sessionlarni ko'rish
      const all = await this.prisma.telegramSmsSession.findMany({
        select: { id: true, status: true, isEnabled: true, sessionString: true },
      });
      this.logger.warn(`Faol session yo'q! DB dagi sessionlar: ${JSON.stringify(all.map(s => ({ id: s.id.slice(0, 8), status: s.status, enabled: s.isEnabled, hasString: !!s.sessionString })))}`);
      return null;
    }

    // Round-robin
    this.roundRobinIndex = this.roundRobinIndex % sessions.length;
    const session = sessions[this.roundRobinIndex];
    this.roundRobinIndex++;

    return { id: session.id, sessionString: session.sessionString! };
  }

  /**
   * Send a single DM to a Telegram user
   */
  async sendDm(
    targetTelegramId: string,
    message: string,
    options: {
      category?: string;
      referenceId?: string;
      sentById?: string;
      targetName?: string;
      targetPhone?: string;
      targetUsername?: string;
      monitorSessionId?: string;
      sourceGroupId?: string;
      sourceMessageId?: string;
      senderAccessHash?: string;
    } = {},
  ): Promise<{ success: boolean; messageId?: string; error?: string; sessionId?: string }> {
    // Create message log
    const msgLog = await this.prisma.telegramSmsMessage.create({
      data: {
        targetTelegramId,
        targetPhone: options.targetPhone,
        targetName: options.targetName,
        message,
        category: options.category || 'GENERAL',
        referenceId: options.referenceId,
        sentById: options.sentById,
        status: TgSmsMessageStatus.PENDING,
      },
    });

    // === STRATEGY: Phone import → Username → getEntity(ID) ===

    this.logger.log(`TG SMS yuborish: target=${targetTelegramId}, phone=${options.targetPhone || '-'}, username=${options.targetUsername || '-'}`);

    const session = await this.getNextSession();
    if (!session) {
      this.logger.warn(`TG SMS: faol session yo'q!`);
      await this.prisma.telegramSmsMessage.update({
        where: { id: msgLog.id },
        data: { status: TgSmsMessageStatus.FAILED, errorMessage: 'Faol session yo\'q' },
      });
      return { success: false, error: 'Faol TG SMS session yo\'q' };
    }

    // Ensure connected
    if (!this.connectedSessions.has(session.id)) {
      try {
        await this.sendToChild('connect', { sessionId: session.id, sessionString: session.sessionString });
        this.connectedSessions.add(session.id);
      } catch (e: any) {
        await this.prisma.telegramSmsMessage.update({
          where: { id: msgLog.id },
          data: { status: TgSmsMessageStatus.FAILED, errorMessage: `Session ulash xatolik: ${e.message}` },
        });
        return { success: false, error: e.message };
      }
    }

    try {
      let result: any;
      try {
        result = await this.sendToChild('sendDm', {
          sessionId: session.id,
          targetId: targetTelegramId,
          targetUsername: options.targetUsername || undefined,
          targetPhone: options.targetPhone || undefined,
          targetAccessHash: options.senderAccessHash || undefined,
          message,
        });
      } catch (firstErr: any) {
        // PEER_INVALID — user topilmadi (phone Telegramda yo'q yoki entity cache'da yo'q)
        if (firstErr.message?.startsWith('PEER_INVALID:')) {
          this.logger.warn(`PEER_INVALID: ${targetTelegramId} — fallback urinish...`);

          // Fallback 1: Guruh xabaridan sender'ni topish (TG SMS session guruhda bo'lsa)
          if (options.sourceGroupId && options.sourceMessageId) {
            try {
              this.logger.log(`Guruh xabar fallback: group=${options.sourceGroupId}, msg=${options.sourceMessageId}`);
              result = await this.sendToChild('sendDmViaGroupMsg', {
                sessionId: session.id,
                targetId: targetTelegramId,
                sourceGroupId: options.sourceGroupId,
                sourceMessageId: options.sourceMessageId,
                message,
              });
              if (result?.messageId) {
                this.logger.log(`Guruh xabar fallback muvaffaqiyatli: target=${targetTelegramId}`);
              }
            } catch (groupErr: any) {
              this.logger.warn(`Guruh xabar fallback xato: ${groupErr.message}`);
              // Fallback 2: Monitor session'dan accessHash olish
              try {
                const resolved = await this.monitorService.resolveUser(targetTelegramId, options.monitorSessionId);
                if (resolved?.accessHash) {
                  this.logger.log(`AccessHash fallback: ${targetTelegramId} -> ${resolved.accessHash.slice(0, 8)}...`);
                  result = await this.sendToChild('sendDm', {
                    sessionId: session.id,
                    targetId: targetTelegramId,
                    targetAccessHash: resolved.accessHash,
                    message,
                  });
                } else {
                  throw new Error(`PEER_INVALID: barcha fallback'lar ishlamadi`);
                }
              } catch (ahErr: any) {
                this.logger.warn(`AccessHash fallback xato: ${ahErr.message}`);
                throw ahErr;
              }
            }
          } else {
            // sourceGroupId yo'q — faqat accessHash urinish
            try {
              const resolved = await this.monitorService.resolveUser(targetTelegramId, options.monitorSessionId);
              if (resolved?.accessHash) {
                this.logger.log(`AccessHash fallback: ${targetTelegramId} -> ${resolved.accessHash.slice(0, 8)}...`);
                result = await this.sendToChild('sendDm', {
                  sessionId: session.id,
                  targetId: targetTelegramId,
                  targetAccessHash: resolved.accessHash,
                  message,
                });
              } else {
                throw firstErr;
              }
            } catch (ahErr: any) {
              throw ahErr;
            }
          }
        } else {
          throw firstErr;
        }
      }

      await this.prisma.telegramSmsMessage.update({
        where: { id: msgLog.id },
        data: {
          sessionId: session.id,
          status: TgSmsMessageStatus.SENT,
          telegramMsgId: result?.messageId,
          deliveredAt: new Date(),
        },
      });

      await this.prisma.telegramSmsSession.update({
        where: { id: session.id },
        data: { messagesSent: { increment: 1 }, lastUsedAt: new Date() },
      });

      this.logger.log(`TG SMS yuborildi: target=${targetTelegramId}, session=${session.id}`);
      return { success: true, messageId: msgLog.id, sessionId: session.id };
    } catch (error: any) {
      const errMsg = error.message || '';

      // Handle CHANNEL_INVALID / GROUP_ACCESS_DENIED — silent skip (retry foydasiz)
      if (errMsg.startsWith('CHANNEL_INVALID:') || errMsg.startsWith('GROUP_ACCESS_DENIED:')) {
        this.logger.warn(`[SMS] ${errMsg} — guruh invalid, skip`);
      }

      // Handle spam/peer_flood — session ni FROZEN QILMAYMIZ, faqat log
      if (errMsg.startsWith('SPAM:')) {
        this.logger.warn(`Session ${session.id} SPAM xato: ${errMsg} — davom etamiz`);
      }

      // Handle session dead
      if (errMsg.startsWith('SESSION_DEAD:')) {
        await this.prisma.telegramSmsSession.update({
          where: { id: session.id },
          data: {
            status: TgSmsSessionStatus.BANNED,
            lastError: errMsg,
            lastErrorAt: new Date(),
          },
        });
        this.connectedSessions.delete(session.id);
      }

      // Handle flood wait
      if (errMsg.startsWith('FLOOD_WAIT:')) {
        const waitSec = parseInt(errMsg.split(':')[1]) || 60;
        await this.prisma.telegramSmsSession.update({
          where: { id: session.id },
          data: {
            status: TgSmsSessionStatus.FROZEN,
            spamType: 'FLOOD',
            spamDetectedAt: new Date(),
            spamExpectedEnd: new Date(Date.now() + waitSec * 1000),
            lastError: errMsg,
          },
        });

        // Auto-unfreeze after wait
        setTimeout(async () => {
          await this.prisma.telegramSmsSession.update({
            where: { id: session.id },
            data: {
              status: TgSmsSessionStatus.ACTIVE,
              spamType: null,
              spamDetectedAt: null,
              spamExpectedEnd: null,
            },
          }).catch(() => {});
        }, (waitSec + 5) * 1000);
      }

      // Update message as failed
      await this.prisma.telegramSmsMessage.update({
        where: { id: msgLog.id },
        data: {
          sessionId: session.id,
          status: errMsg.startsWith('SPAM:') ? TgSmsMessageStatus.SPAM_BLOCKED : TgSmsMessageStatus.FAILED,
          errorMessage: errMsg,
        },
      });

      await this.prisma.telegramSmsSession.update({
        where: { id: session.id },
        data: { messagesFailed: { increment: 1 }, lastErrorAt: new Date(), lastError: errMsg },
      });

      return { success: false, error: errMsg, messageId: msgLog.id };
    }
  }

  private async handleSpamDetection(sessionId: string, errMsg: string) {
    // PEER_FLOOD — vaqtinchalik cheklov, 5 daqiqadan keyin qayta urinish
    const cooldownMinutes = 5;
    await this.prisma.telegramSmsSession.update({
      where: { id: sessionId },
      data: {
        status: TgSmsSessionStatus.FROZEN,
        spamDetectedAt: new Date(),
        spamType: 'PEER_FLOOD',
        spamExpectedEnd: new Date(Date.now() + cooldownMinutes * 60_000),
        lastError: errMsg,
        lastErrorAt: new Date(),
        // isEnabled saqlanadi — o'chirilmaydi!
      },
    });
    this.logger.warn(`Session ${sessionId} PEER_FLOOD — ${cooldownMinutes} min cooldown`);

    // Avtomatik qayta ACTIVE qilish
    setTimeout(async () => {
      try {
        const sess = await this.prisma.telegramSmsSession.findUnique({ where: { id: sessionId } });
        if (sess?.status === TgSmsSessionStatus.FROZEN) {
          await this.prisma.telegramSmsSession.update({
            where: { id: sessionId },
            data: {
              status: TgSmsSessionStatus.ACTIVE,
              spamDetectedAt: null,
              spamType: null,
              spamExpectedEnd: null,
            },
          });
          this.logger.log(`Session ${sessionId} PEER_FLOOD cooldown tugadi, qayta ACTIVE`);
        }
      } catch {}
    }, cooldownMinutes * 60_000);
  }

  /**
   * Bulk send to multiple targets
   */
  async sendBulk(
    targets: Array<{ telegramId: string; name?: string; phone?: string; username?: string }>,
    message: string,
    options: { category?: string; sentById?: string; delayMs?: number } = {},
  ) {
    const results = [];
    const delay = options.delayMs || 5000; // 5s default — PEER_FLOOD dan himoya

    for (const target of targets) {
      const result = await this.sendDm(target.telegramId, message, {
        category: options.category,
        sentById: options.sentById,
        targetName: target.name,
        targetPhone: target.phone,
        targetUsername: target.username,
      });
      results.push({ telegramId: target.telegramId, name: target.name, ...result });

      if (targets.indexOf(target) < targets.length - 1) {
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    return results;
  }

  /**
   * Send to drivers
   */
  async sendToDrivers(message: string, sentById: string, driverIds?: string[]) {
    const where: any = { user: { telegramId: { not: '' } } };
    if (driverIds?.length) where.id = { in: driverIds };

    const drivers = await this.prisma.driverProfile.findMany({
      where,
      select: { id: true, fullName: true, phone: true, user: { select: { telegramId: true, username: true } } },
    });

    const targets = drivers
      .filter((d) => d.user.telegramId)
      .map((d) => ({
        telegramId: d.user.telegramId,
        name: d.fullName || d.phone || 'Haydovchi',
        phone: d.phone || undefined,
        username: d.user.username || undefined,
      }));

    return this.sendBulk(targets, message, { category: 'DRIVER', sentById });
  }

  /**
   * Send to order contacts (by senderTelegramId)
   */
  async sendToOrders(message: string, sentById: string, orderIds: string[]) {
    const orders = await this.prisma.order.findMany({
      where: { id: { in: orderIds }, senderTelegramId: { not: { equals: null } } },
      select: {
        id: true,
        senderTelegramId: true,
        senderUsername: true,
        senderName: true,
        phone: true,
        cargoFrom: true,
        cargoTo: true,
      },
    });

    const seen = new Set<string>();
    const targets: Array<{ telegramId: string; name?: string; phone?: string; username?: string }> = [];

    for (const o of orders) {
      if (!o.senderTelegramId || seen.has(o.senderTelegramId)) continue;
      seen.add(o.senderTelegramId);
      const route = [o.cargoFrom, o.cargoTo].filter(Boolean).join(' -> ');
      targets.push({
        telegramId: o.senderTelegramId,
        name: o.senderName || route || o.phone || 'Order',
        phone: o.phone || undefined,
        username: o.senderUsername || undefined,
      });
    }

    return this.sendBulk(targets, message, { category: 'ORDER', sentById });
  }

  /**
   * Send to blocked user contacts
   */
  async sendToBlocked(message: string, sentById: string, blockedIds?: string[]) {
    const where: any = { isActive: true, senderTelegramId: { not: '' } };
    if (blockedIds?.length) where.id = { in: blockedIds };

    const blocked = await this.prisma.blockedUser.findMany({
      where,
      select: { id: true, senderTelegramId: true, senderUsername: true, senderName: true, phone: true },
    });

    const seen = new Set<string>();
    const targets: Array<{ telegramId: string; name?: string; phone?: string; username?: string }> = [];

    for (const b of blocked) {
      if (!b.senderTelegramId || seen.has(b.senderTelegramId)) continue;
      seen.add(b.senderTelegramId);
      targets.push({
        telegramId: b.senderTelegramId,
        name: b.senderName || b.phone || 'Bloklangan',
        phone: b.phone || undefined,
        username: b.senderUsername || undefined,
      });
    }

    return this.sendBulk(targets, message, { category: 'BLOCKED', sentById });
  }

  // ============================================================
  // MESSAGE HISTORY & STATS
  // ============================================================

  async getHistory(params: {
    page?: number;
    limit?: number;
    category?: string;
    status?: TgSmsMessageStatus;
    sessionId?: string;
    search?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.category) where.category = params.category;
    if (params.status) where.status = params.status;
    if (params.sessionId) where.sessionId = params.sessionId;
    if (params.search) {
      where.OR = [
        { targetName: { contains: params.search, mode: 'insensitive' } },
        { targetTelegramId: { contains: params.search } },
        { targetPhone: { contains: params.search } },
        { message: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.telegramSmsMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          session: { select: { phone: true, name: true } },
        },
      }),
      this.prisma.telegramSmsMessage.count({ where }),
    ]);

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalMessages,
      sentCount,
      failedCount,
      spamCount,
      todayCount,
      activeSessions,
      totalSessions,
      spamSessions,
    ] = await Promise.all([
      this.prisma.telegramSmsMessage.count(),
      this.prisma.telegramSmsMessage.count({ where: { status: { in: [TgSmsMessageStatus.SENT, TgSmsMessageStatus.DELIVERED] } } }),
      this.prisma.telegramSmsMessage.count({ where: { status: TgSmsMessageStatus.FAILED } }),
      this.prisma.telegramSmsMessage.count({ where: { status: TgSmsMessageStatus.SPAM_BLOCKED } }),
      this.prisma.telegramSmsMessage.count({ where: { createdAt: { gte: today } } }),
      this.prisma.telegramSmsSession.count({ where: { status: TgSmsSessionStatus.ACTIVE, isEnabled: true } }),
      this.prisma.telegramSmsSession.count(),
      this.prisma.telegramSmsSession.count({ where: { status: { in: [TgSmsSessionStatus.SPAM, TgSmsSessionStatus.BANNED] } } }),
    ]);

    return {
      totalMessages,
      sentCount,
      failedCount,
      spamCount,
      todayCount,
      activeSessions,
      totalSessions,
      spamSessions,
      connectedNow: this.connectedSessions.size,
    };
  }

  // ============================================================
  // AUTO-SMS CONFIG (Telegram SMS uchun)
  // ============================================================

  async getAutoConfig() {
    const raw = await this.prisma.systemConfig.findUnique({ where: { key: 'tg_sms_auto_config' } });
    if (raw?.value) {
      try { return JSON.parse(raw.value); } catch {}
    }
    return {
      orderEnabled: false,
      orderTemplate: 'Sizning yuk e\'loningiz topildi! {marshrut}. Biz bilan bog\'laning.',
      driverOrderEnabled: false,
      driverOrderTemplate: 'Sizning haydovchi e\'loningiz topildi! {marshrut}.',
      blockedEnabled: false,
      blockedTemplate: 'Hurmatli {ism}, sizning e\'loningiz bloklandi. Sabab: {sabab}.',
    };
  }

  async setAutoConfig(config: any) {
    await this.prisma.systemConfig.upsert({
      where: { key: 'tg_sms_auto_config' },
      update: { value: JSON.stringify(config) },
      create: { key: 'tg_sms_auto_config', value: JSON.stringify(config), type: 'JSON' },
    });
    return config;
  }

  /**
   * Auto-send on blocked user (called from message-filter service)
   */
  async onNewBlockedUser(data: {
    senderTelegramId: string;
    senderName?: string | null;
    senderUsername?: string | null;
    phone?: string | null;
    reason: string;
    monitorSessionId?: string;
    sourceGroupId?: string;
    sourceMessageId?: string;
    senderAccessHash?: string;
  }) {
    if (!data.senderTelegramId || data.senderTelegramId.startsWith('phone_')) return;

    const config = await this.getAutoConfig();
    if (!config.blockedEnabled) return;

    let msg = config.blockedTemplate || '';
    if (!msg.trim()) return;

    msg = msg
      .replace(/{ism}/g, data.senderName || 'Foydalanuvchi')
      .replace(/{sabab}/g, data.reason || 'qoidabuzarlik');

    await this.sendDm(data.senderTelegramId, msg, {
      category: 'BLOCKED',
      targetName: data.senderName || 'Blocked user',
      targetPhone: data.phone || undefined,
      targetUsername: data.senderUsername || undefined,
      monitorSessionId: data.monitorSessionId,
      sourceGroupId: data.sourceGroupId,
      sourceMessageId: data.sourceMessageId,
      senderAccessHash: data.senderAccessHash,
    }).catch((e) => this.logger.error(`TG Auto-SMS blocked error: ${e.message}`));
  }

  /**
   * Auto-send on new order (called from monitor service)
   */
  async onNewOrder(order: {
    senderTelegramId?: string | null;
    senderUsername?: string | null;
    type: string;
    cargoFrom?: string | null;
    cargoTo?: string | null;
    senderName?: string | null;
    phone?: string | null;
    monitorSessionId?: string;
    sourceGroupId?: string;
    sourceMessageId?: string;
    senderAccessHash?: string;
  }) {
    if (!order.senderTelegramId) return;

    const config = await this.getAutoConfig();
    const isDriver = order.type === 'DRIVER';

    if (isDriver && !config.driverOrderEnabled) return;
    if (!isDriver && !config.orderEnabled) return;

    let msg = isDriver ? (config.driverOrderTemplate || '') : (config.orderTemplate || '');
    if (!msg.trim()) return;

    const route = [order.cargoFrom, order.cargoTo].filter(Boolean).join(' -> ');
    msg = msg
      .replace(/{marshrut}/g, route || 'belgilanmagan')
      .replace(/{tur}/g, isDriver ? 'Haydovchi' : 'Yuk')
      .replace(/{ism}/g, order.senderName || 'Foydalanuvchi');

    await this.sendDm(order.senderTelegramId, msg, {
      category: isDriver ? 'DRIVER' : 'ORDER',
      targetName: order.senderName || route || 'Order',
      targetPhone: order.phone || undefined,
      targetUsername: order.senderUsername || undefined,
      monitorSessionId: order.monitorSessionId,
      sourceGroupId: order.sourceGroupId,
      sourceMessageId: order.sourceMessageId,
      senderAccessHash: order.senderAccessHash,
    }).catch((e) => this.logger.error(`TG Auto-SMS error: ${e.message}`));
  }
}
