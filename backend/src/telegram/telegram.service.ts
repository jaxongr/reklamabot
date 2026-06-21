import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { computeCheck } from 'telegram/Password';
import { ChildProcess, fork } from 'child_process';
import * as path from 'path';
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
  private readonly pendingAuths = new Map<string, PendingAuth>();
  private readonly apiId: number;
  private readonly apiHash: string;

  // ===== CHILD PROCESS =====
  private child: ChildProcess | null = null;
  private childReady = false;
  private readonly pendingRequests = new Map<string, { resolve: (v: any) => void; reject: (e: Error) => void; timer: NodeJS.Timeout }>();
  private requestIdCounter = 0;
  private readonly connectedSessions = new Set<string>();

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

    this.spawnChild();

    try {
      await this.loadActiveSessions();
    } catch (error) {
      this.logger.warn('Sessionlarni yuklashda xatolik: ' + error.message);
    }
  }

  async onModuleDestroy() {
    // Disconnect pending auth clients (main thread)
    for (const [, pending] of this.pendingAuths) {
      try { await pending.client.disconnect(); } catch {}
    }
    this.pendingAuths.clear();

    // Terminate child process
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
    const childPath = path.join(__dirname, 'telegram-worker.js');
    this.logger.log(`Spawning telegram posting child process: ${childPath}`);

    this.child = fork(childPath, [String(this.apiId), this.apiHash], {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    });

    this.child.on('message', (msg: any) => this.handleChildMessage(msg));

    this.child.on('error', (err) => {
      this.logger.error(`Telegram child process error: ${err.message}`);
    });

    this.child.on('exit', (code) => {
      this.logger.warn(`Telegram child process exited with code ${code}`);
      this.childReady = false;
      this.connectedSessions.clear();

      for (const [, pending] of this.pendingRequests) {
        clearTimeout(pending.timer);
        pending.reject(new Error('Child process exited'));
      }
      this.pendingRequests.clear();

      // Auto-restart
      if (code !== 0) {
        setTimeout(() => {
          this.logger.log('Restarting telegram child process...');
          this.spawnChild();
          setTimeout(() => {
            this.loadActiveSessions().catch((err) =>
              this.logger.warn('Session reload after child restart: ' + err.message),
            );
          }, 2000);
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
        if (msg.success) {
          pending.resolve(msg.data);
        } else {
          pending.reject(new Error(msg.error || 'Child request failed'));
        }
      }
    } else if (msg.type === 'log') {
      if (msg.level === 'error') this.logger.error(`[Worker] ${msg.message}`);
      else if (msg.level === 'warn') this.logger.warn(`[Worker] ${msg.message}`);
      else this.logger.log(`[Worker] ${msg.message}`);
    }
  }

  private sendToChild(type: string, data: Record<string, any> = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.child || !this.childReady) {
        reject(new Error('Child process not running'));
        return;
      }
      const id = String(++this.requestIdCounter);
      const timer = setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Child request timeout (120s)'));
        }
      }, 120_000);
      this.pendingRequests.set(id, { resolve, reject, timer });
      this.child.send({ type, id, ...data });
    });
  }

  // ============================================================
  // AUTH FLOW (main thread — brief, short-lived)
  // ============================================================

  async sendCode(userId: string, phone: string, sessionName?: string): Promise<{
    sessionId: string;
    phoneCodeHash: string;
  }> {
    const session = await this.prisma.session.create({
      data: {
        userId,
        name: sessionName || `Session ${phone.slice(-4)}`,
        phone,
        status: SessionStatus.INACTIVE,
      },
    });

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
      const codeType = (result as any).type?.className || 'unknown';

      this.pendingAuths.set(session.id, {
        client,
        phone,
        phoneCodeHash,
        sessionId: session.id,
      });

      this.logger.log(`Kod yuborildi: ${phone}, session: ${session.id}, type: ${codeType}`);
      return { sessionId: session.id, phoneCodeHash };
    } catch (error) {
      await this.prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      await client.disconnect().catch(() => {});
      this.logger.error(`Kod yuborishda xatolik: ${error.message}`);
      throw new Error(`Kod yuborishda xatolik: ${error.message}`);
    }
  }

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
      if (password && !code) {
        this.logger.log(`2FA parol bilan kirish: ${sessionId}`);
        const srpPassword = await client.invoke(new Api.account.GetPassword());
        await client.invoke(
          new Api.auth.CheckPassword({
            password: await computeCheck(srpPassword, password),
          }),
        );
        this.logger.log(`2FA muvaffaqiyatli: ${sessionId}`);
      } else {
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

          if (error.errorMessage === 'SESSION_PASSWORD_NEEDED') {
            if (!password) throw new Error('2FA_REQUIRED');
            const srpPassword = await client.invoke(new Api.account.GetPassword());
            await client.invoke(
              new Api.auth.CheckPassword({
                password: await computeCheck(srpPassword, password),
              }),
            );
          } else if (error.errorMessage === 'PHONE_CODE_INVALID') {
            throw new Error('Kod noto\'g\'ri. Qayta tekshiring.');
          } else if (error.errorMessage === 'PHONE_CODE_EXPIRED') {
            this.logger.log(`Kod muddati o'tgan, qayta yuborilmoqda: ${phone}`);
            try {
              const resendResult = await client.invoke(
                new Api.auth.ResendCode({
                  phoneNumber: phone,
                  phoneCodeHash,
                }),
              );
              const newHash = (resendResult as any).phoneCodeHash;
              this.pendingAuths.set(sessionId, {
                client, phone, phoneCodeHash: newHash, sessionId,
              });
              throw new Error('RESEND_CODE');
            } catch (resendError: any) {
              if (resendError.message === 'RESEND_CODE') throw resendError;
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

      // Save session string
      const sessionString = (client.session as StringSession).save();

      await this.prisma.session.update({
        where: { id: sessionId },
        data: { sessionString, status: SessionStatus.ACTIVE },
      });

      // Disconnect auth client from main thread
      try { await client.disconnect(); } catch {}
      this.pendingAuths.delete(sessionId);

      // Connect in worker for long-running usage
      await this.sendToChild('connect', { sessionId, sessionString });
      this.connectedSessions.add(sessionId);

      // Sync groups
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
      await this.prisma.session.delete({ where: { id: sessionId } }).catch(() => {});

      this.logger.error(`Sign in xatolik: ${error.errorMessage || error.message}`);
      throw new Error(`Kirishda xatolik: ${error.errorMessage || error.message}`);
    }
  }

  // ============================================================
  // SESSION MANAGEMENT (via worker)
  // ============================================================

  private async loadActiveSessions(): Promise<void> {
    const sessions = await this.prisma.session.findMany({
      where: {
        status: SessionStatus.ACTIVE,
        isFrozen: false,
        sessionString: { not: null },
      },
    });

    this.logger.log(`${sessions.length} ta faol session yuklanmoqda...`);

    // Parallel ulash — 5 tadan batch
    for (let i = 0; i < sessions.length; i += 5) {
      const batch = sessions.slice(i, i + 5);
      await Promise.allSettled(
        batch.map(session =>
          this.connectSession(session.id)
            .then(() => this.logger.log(`Session yuklandi: ${session.id} (${session.name})`))
            .catch(error => this.logger.error(`Session yuklanmadi ${session.id}: ${error.message}`))
        ),
      );
    }
  }

  async connectSession(sessionId: string): Promise<void> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session?.sessionString) {
      throw new Error('Session yoki session string topilmadi');
    }

    if (session.isFrozen) {
      throw new Error('Session muzlatilgan — avval eritib oling');
    }

    // Already connected?
    if (this.connectedSessions.has(sessionId)) {
      try {
        const connected = await this.sendToChild('isConnected', { sessionId });
        if (connected) return;
      } catch {}
    }

    try {
      await this.sendToChild('connect', { sessionId, sessionString: session.sessionString });
      this.connectedSessions.add(sessionId);
      this.logger.log(`Session ulandi (worker): ${sessionId}`);
    } catch (error) {
      this.logger.error(`Session ulashda xatolik ${sessionId}: ${error.message}`);

      if (error.message?.includes('AUTH_KEY_UNREGISTERED') || error.message?.includes('SESSION_REVOKED')) {
        await this.markSessionDead(sessionId);
      }

      throw error;
    }
  }

  async disconnectSession(sessionId: string): Promise<void> {
    if (this.connectedSessions.has(sessionId)) {
      try { await this.sendToChild('disconnect', { sessionId }); } catch {}
      this.connectedSessions.delete(sessionId);
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { status: SessionStatus.INACTIVE },
    });

    this.logger.log(`Session uzildi: ${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (this.connectedSessions.has(sessionId)) {
      try { await this.sendToChild('disconnect', { sessionId }); } catch {}
      this.connectedSessions.delete(sessionId);
    }

    // Clean up pending auth
    const pending = this.pendingAuths.get(sessionId);
    if (pending) {
      try { await pending.client.disconnect(); } catch {}
      this.pendingAuths.delete(sessionId);
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { status: SessionStatus.DELETED },
    });

    this.logger.log(`Session o'chirildi: ${sessionId}`);
  }

  private async markSessionDead(sessionId: string): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.DELETED,
        sessionString: null,
        isFrozen: true,
        frozenAt: new Date(),
        freezeCount: { increment: 1 },
      },
    });
    this.connectedSessions.delete(sessionId);
    this.logger.warn(`Session o'lgan deb belgilandi (DELETED): ${sessionId}`);
  }

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

  // ============================================================
  // MESSAGING (via worker)
  // ============================================================

  async sendMessage(
    sessionId: string,
    groupTelegramId: string,
    messageText: string,
  ): Promise<{ messageId?: number }> {
    if (!this.connectedSessions.has(sessionId)) {
      throw new Error(`Session ${sessionId} ulangan emas`);
    }

    try {
      const result = await this.sendToChild('sendMessage', {
        sessionId,
        peer: groupTelegramId,
        message: messageText,
      });
      return { messageId: result?.messageId };
    } catch (error: any) {
      const msg = error.message || '';

      // Parse error types from worker
      if (msg.startsWith('FLOOD_WAIT:')) {
        const waitSeconds = parseInt(msg.split(':')[1]) || 60;
        this.logger.warn(`FLOOD_WAIT ${waitSeconds}s — session: ${sessionId}`);
        throw new Error(`FLOOD_WAIT:${waitSeconds}`);
      }
      if (msg.startsWith('SLOWMODE_WAIT:')) {
        const waitSeconds = parseInt(msg.split(':')[1]) || 300;
        this.logger.warn(`SLOWMODE_WAIT ${waitSeconds}s — group: ${groupTelegramId}`);
        throw new Error(`SLOWMODE_WAIT:${waitSeconds}`);
      }
      if (msg.startsWith('WRITE_FORBIDDEN:')) {
        const parts = msg.split(':');
        this.logger.warn(`WRITE_FORBIDDEN [${parts[1]}] — session: ${sessionId}, group: ${groupTelegramId}`);
        throw error;
      }
      if (msg.startsWith('PEER_INVALID:')) {
        throw new Error(`CHANNEL_INVALID:${groupTelegramId}`);
      }

      // Session dead
      if (msg.includes('AUTH_KEY_UNREGISTERED') || msg.includes('SESSION_REVOKED')) {
        await this.markSessionDead(sessionId);
        throw new Error(`SESSION_DEAD:${sessionId}`);
      }

      throw error;
    }
  }

  async deleteMessage(
    sessionId: string,
    chatId: string,
    messageId: number,
  ): Promise<boolean> {
    if (!this.connectedSessions.has(sessionId)) {
      this.logger.warn(`Session ${sessionId} ulangan emas — xabar o'chirilmadi`);
      return false;
    }

    try {
      return await this.sendToChild('deleteMessage', { sessionId, chatId, messageId });
    } catch {
      return false;
    }
  }

  async deleteAdMessages(
    postHistories: Array<{
      messageId: number | null;
      groupTelegramId: string;
      sessionId: string;
    }>,
  ): Promise<{ deleted: number; failed: number }> {
    let deleted = 0;
    let failed = 0;

    const bySession = new Map<string, Array<{ messageId: number; chatId: string }>>();
    for (const h of postHistories) {
      if (!h.messageId) continue;
      const existing = bySession.get(h.sessionId) || [];
      existing.push({ messageId: h.messageId, chatId: h.groupTelegramId });
      bySession.set(h.sessionId, existing);
    }

    const tasks = Array.from(bySession.entries()).map(async ([sessionId, messages]) => {
      for (const msg of messages) {
        const success = await this.deleteMessage(sessionId, msg.chatId, msg.messageId);
        if (success) deleted++;
        else failed++;
        await new Promise(r => setTimeout(r, 200));
      }
    });

    await Promise.allSettled(tasks);

    this.logger.log(`E'lon xabarlari o'chirildi: ${deleted} muvaffaqiyat, ${failed} xato`);
    return { deleted, failed };
  }

  // ============================================================
  // GROUP SYNC (dialogs from worker, DB in main thread)
  // ============================================================

  async syncGroups(sessionId: string): Promise<number> {
    if (!this.connectedSessions.has(sessionId)) {
      throw new Error('Session ulangan emas');
    }

    try {
      const dialogResult = await this.sendToChild('getDialogs', { sessionId, limit: 500 });
      const groups: Array<{
        telegramId: string;
        title: string;
        username: string | null;
        type: 'GROUP' | 'SUPERGROUP' | 'CHANNEL';
        memberCount: number | null;
      }> = [];

      for (const d of dialogResult.groups) {
        groups.push({
          telegramId: d.id,
          title: d.title || 'Nomsiz',
          username: null,
          type: d.isChannel ? 'CHANNEL' : (d.isGroup ? 'GROUP' : 'GROUP'),
          memberCount: null,
        });
      }

      // DB operations
      const telegramGroupIds = new Set(groups.map(g => g.telegramId));

      const existingGroups = await this.prisma.group.findMany({
        where: { sessionId },
        select: { id: true, telegramId: true },
      });
      const existingIds = new Set(existingGroups.map(g => g.telegramId));

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

      const staleGroups = existingGroups.filter(g => !telegramGroupIds.has(g.telegramId));
      if (staleGroups.length > 0) {
        await this.prisma.group.deleteMany({
          where: { id: { in: staleGroups.map(g => g.id) } },
        });
        this.logger.log(`${staleGroups.length} ta eskirgan guruh o'chirildi`);
      }

      await this.prisma.group.updateMany({
        where: { sessionId, isSkipped: true },
        data: { isSkipped: false, hasRestrictions: false, skipReason: null },
      });

      const totalGroups = await this.prisma.group.count({ where: { sessionId } });
      const activeGroups = await this.prisma.group.count({
        where: { sessionId, isActive: true, isSkipped: false },
      });

      await this.prisma.session.update({
        where: { id: sessionId },
        data: { totalGroups, activeGroups, lastSyncAt: new Date() },
      });

      this.logger.log(`Guruhlar sinxronlandi: ${sessionId} — jami: ${totalGroups}, yangi: ${newGroups.length}, o'chirildi: ${staleGroups.length}`);
      return totalGroups;
    } catch (error) {
      this.logger.error(`Guruhlar sinxronlashda xatolik: ${error.message}`);
      throw error;
    }
  }

  // ============================================================
  // QUERY / STATUS (no gramJS needed)
  // ============================================================

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

  isClientConnected(sessionId: string): boolean {
    return this.connectedSessions.has(sessionId);
  }

  getConnectedCount(): number {
    return this.connectedSessions.size;
  }

  async checkSessionConnection(sessionId: string): Promise<{
    connected: boolean;
    error?: string;
  }> {
    if (!this.connectedSessions.has(sessionId)) {
      return { connected: false, error: 'Client topilmadi' };
    }

    try {
      const connected = await this.sendToChild('isConnected', { sessionId });
      return { connected };
    } catch (error: any) {
      return { connected: false, error: error.message };
    }
  }

  async checkAllSessionConnections(sessionIds: string[]): Promise<
    Array<{ sessionId: string; connected: boolean; error?: string }>
  > {
    const results = await Promise.allSettled(
      sessionIds.map(async (sessionId) => {
        const status = await this.checkSessionConnection(sessionId);
        return { sessionId, ...status };
      }),
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return {
        sessionId: sessionIds[index],
        connected: false,
        error: result.reason?.message || 'Tekshirishda xatolik',
      };
    });
  }

  hasPendingAuth(sessionId: string): boolean {
    return this.pendingAuths.has(sessionId);
  }

  async cancelPendingAuth(sessionId: string): Promise<void> {
    const pending = this.pendingAuths.get(sessionId);
    if (pending) {
      await pending.client.disconnect().catch(() => {});
      this.pendingAuths.delete(sessionId);
    }
    await this.prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
  }

  /**
   * Resolve user accessHash from monitor session entity cache.
   * Used by TG SMS service when it can't resolve user by phone.
   */
  async resolveUser(telegramId: string): Promise<{ id: string; accessHash: string } | null> {
    if (!this.child || !this.childReady) return null;
    try {
      const result = await this.sendToChild('resolveUser', { telegramId });
      return result || null;
    } catch {
      return null;
    }
  }
}
