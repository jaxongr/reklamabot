import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { computeCheck } from 'telegram/Password';
import { ChildProcess, fork } from 'child_process';
import * as path from 'path';
import { PrismaService } from '../common/prisma.service';
import { SystemConfigService } from '../common/system-config.service';
import { ConfigService } from '@nestjs/config';
import { AppGateway } from '../gateway/app.gateway';
import { YoldaGateway } from '../yolda_dispatcher/yolda-dispatcher.gateway';
import { MessageFilterService } from './message-filter.service';
import { MonitorSessionStatus, OrderStatus, OrderType, ConfigType } from '@prisma/client';
import { DRIVER_KEYWORDS, TAXI_DRIVER_KEYWORDS, VEHICLE_TYPES, CARGO_KEYWORDS, classifyOrderScope } from './data/dispatcher-keywords';
import { calculateDistance, normalizeCityName, findCity, findCitiesInText } from './data/city-distances';
import { SmsService } from '../sms/sms.service';
import { TelegramSmsService } from '../telegram-sms/telegram-sms.service';
import { DriverMatchingService } from '../drivers/driver-matching.service';
import { CargoBotService } from '../cargo-bot/cargo-bot.service';
import { TaksiBotService } from '../taksi-bot/taksi-bot.service';

interface FilterRules {
  keywords: string[];
  excludeKeywords: string[];
  minPrice?: number;
  maxPrice?: number;
  regions?: string[];
  cargoTypes?: string[];
  enabled: boolean;
}

interface PendingMonitorAuth {
  client: TelegramClient;
  phone: string;
  phoneCodeHash: string;
  monitorSessionId: string;
}

interface ParsedCargo {
  cargoFrom?: string;
  cargoTo?: string;
  cargoType?: string;
  cargoWeight?: string;
  price?: string;
  phone?: string;
  distance?: number;
}

/** Data sent from worker thread for each new message */
interface WorkerMessageData {
  text: string;
  chatId: string;
  chatTitle: string;
  groupTelegramId: string;
  groupUsername?: string;
  messageId?: string;
  senderId: string | null;
  senderAccessHash?: string;
  senderFirstName?: string;
  senderLastName?: string;
  senderUsername?: string;
  date: number;
}

const MAX_MONITOR_SESSIONS = 20;

@Injectable()
export class MonitorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MonitorService.name);
  private readonly pendingAuths = new Map<string, PendingMonitorAuth>();
  // Duplikat tekshiruv: phone+groupId → timestamp (barcha sessionlar uchun umumiy)
  private readonly recentOrders = new Map<string, number>();
  private readonly MAX_DEDUP_ENTRIES = 20_000; // Map hajmi cheklangan — 20K dan oshsa eskilari tozalanadi
  private readonly DEDUP_TTL = 60 * 60_000; // 1 soat (matn va sender dedup uchun)
  private dedupCleanupInterval: NodeJS.Timeout;
  // Diagnostika counters — har 5 daqiqada log qiladi
  private diagCounters = { total: 0, excludeKw: 0, noKeyword: 0, noPhone: 0, phoneDup: 0, senderDup: 0, textDup: 0, dbDup: 0, blocked: 0, created: 0 };
  private diagInterval: NodeJS.Timeout;
  // Per-session diagnostics
  private readonly perSessionDiag = new Map<string, { total: number; created: number; phoneDup: number; noPhone: number; noKeyword: number; selfDup?: number; otherDup?: number }>();
  // Phone dedup owner tracking (diagnostika uchun)
  private readonly phoneDedupOwner = new Map<string, string>();
  // Sender stats in-memory tracker (cleanup har 6 soatda)
  private readonly senderStats = new Map<string, { today: number; total: number; date: string }>();
  private readonly MAX_SENDER_STATS = 10_000;
  // MonitorSession cache (har xabar uchun DB query qilmaslik uchun)
  private readonly sessionCache = new Map<string, { userId: string; businessModule: string; cachedAt: number }>();
  private readonly SESSION_CACHE_TTL = 5 * 60_000;
  private groupSyncInterval: NodeJS.Timeout;
  private readonly GROUP_SYNC_INTERVAL = 30 * 60_000;
  private readonly apiId: number;
  private readonly apiHash: string;

  // ===== CHILD PROCESSES (har session uchun alohida) =====
  private readonly childProcesses = new Map<string, ChildProcess>();
  private readonly pendingRequests = new Map<string, { resolve: (v: any) => void; reject: (e: Error) => void; timer: NodeJS.Timeout }>();
  private requestIdCounter = 0;
  // Track which sessions are connected
  private readonly connectedSessions = new Set<string>();
  // Track last message received from worker per session (for health monitoring)
  private readonly lastWorkerActivity = new Map<string, number>();
  private healthCheckInterval: NodeJS.Timeout;
  private readonly HEALTH_CHECK_INTERVAL = 3 * 60_000;
  private readonly SESSION_STALE_THRESHOLD = 5 * 60_000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly systemConfig: SystemConfigService,
    private readonly gateway: AppGateway,
    private readonly messageFilter: MessageFilterService,
    private readonly smsService: SmsService,
    private readonly telegramSmsService: TelegramSmsService,
    private readonly driverMatching: DriverMatchingService,
    private readonly yoldaGateway: YoldaGateway,
    private readonly cargoBot: CargoBotService,
    private readonly taksiBot: TaksiBotService,
  ) {
    this.apiId = parseInt(this.config.get<string>('TELEGRAM_API_ID') || '0');
    this.apiHash = this.config.get<string>('TELEGRAM_API_HASH') || '';

    // Duplikat cleanup har 2 minutda
    this.dedupCleanupInterval = setInterval(() => {
      const now = Date.now();
      const phoneTTL = 4 * 60 * 60_000;
      let cleaned = 0;
      for (const [key, ts] of this.recentOrders) {
        const ttl = key.startsWith('phone_') ? phoneTTL : this.DEDUP_TTL;
        if (now - ts > ttl) { this.recentOrders.delete(key); cleaned++; }
      }
      // Hard limit — agar hali ham katta bo'lsa, eng eskilarini tozalash
      if (this.recentOrders.size > this.MAX_DEDUP_ENTRIES) {
        const entries = [...this.recentOrders.entries()].sort((a, b) => a[1] - b[1]);
        const toRemove = entries.slice(0, entries.length - this.MAX_DEDUP_ENTRIES);
        for (const [key] of toRemove) this.recentOrders.delete(key);
        cleaned += toRemove.length;
      }
      // SenderStats cleanup — eskilarini tozalash
      const todayStr = new Date().toISOString().slice(0, 10);
      for (const [key, val] of this.senderStats) {
        if (val.date !== todayStr) this.senderStats.delete(key);
      }
      if (this.senderStats.size > this.MAX_SENDER_STATS) {
        const oldest = [...this.senderStats.keys()].slice(0, this.senderStats.size - this.MAX_SENDER_STATS);
        for (const key of oldest) this.senderStats.delete(key);
      }
      if (cleaned > 0 || this.senderStats.size > 1000) {
        this.logger.debug(`Cleanup: dedup=${this.recentOrders.size} (cleaned ${cleaned}), senderStats=${this.senderStats.size}`);
      }
    }, 2 * 60_000);
  }

  async onModuleInit() {
    this.logger.log('Monitor Service initialized');

    // Diagnostika: har 5 daqiqada qayerda nechta xabar filtrlanyotganini log qilish
    this.diagInterval = setInterval(() => {
      const d = this.diagCounters;
      if (d.total > 0) {
        this.logger.log(
          `[DIAG 5min] total=${d.total} | excludeKw=${d.excludeKw} noKeyword=${d.noKeyword} noPhone=${d.noPhone} ` +
          `phoneDup=${d.phoneDup} senderDup=${d.senderDup} textDup=${d.textDup} dbDup=${d.dbDup} ` +
          `blocked=${d.blocked} | CREATED=${d.created}`
        );
        // Per-session breakdown
        for (const [sid, sd] of this.perSessionDiag) {
          if (sd.total > 0) {
            this.logger.log(
              `[DIAG session ${sid.slice(-8)}] total=${sd.total} created=${sd.created} phoneDup=${sd.phoneDup}(self=${sd.selfDup||0},other=${sd.otherDup||0}) noPhone=${sd.noPhone} noKeyword=${sd.noKeyword}`
            );
          }
        }
        this.phoneDedupOwner.clear();
        this.diagCounters = { total: 0, excludeKw: 0, noKeyword: 0, noPhone: 0, phoneDup: 0, senderDup: 0, textDup: 0, dbDup: 0, blocked: 0, created: 0 };
        this.perSessionDiag.clear();
      }
    }, 5 * 60_000);
    if (!this.apiId || !this.apiHash) {
      this.logger.warn('TELEGRAM_API_ID yoki TELEGRAM_API_HASH sozlanmagan!');
      return;
    }

    // Sessionlarni 5s kechiktirish
    setTimeout(() => {
      this.loadActiveSessions().catch((error) => {
        this.logger.warn('Monitor sessionlarni yuklashda xatolik: ' + error.message);
      });
    }, 5000);

    // Har 30 minutda barcha aktiv sessionlar guruhlarini sinxronlash
    this.groupSyncInterval = setInterval(() => {
      this.syncAllSessionGroups().catch((err) =>
        this.logger.warn(`Guruh sinxronlash xatolik: ${err.message}`),
      );
    }, this.GROUP_SYNC_INTERVAL);

    // Har 3 minutda session health check
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck().catch((err) =>
        this.logger.warn(`Health check xatolik: ${err.message}`),
      );
    }, this.HEALTH_CHECK_INTERVAL);
  }

  async onModuleDestroy() {
    clearInterval(this.dedupCleanupInterval);
    clearInterval(this.groupSyncInterval);
    clearInterval(this.healthCheckInterval);
    clearInterval(this.diagInterval);

    // Disconnect pending auth clients (main thread)
    for (const [, pending] of this.pendingAuths) {
      try { await pending.client.disconnect(); } catch {}
    }
    this.pendingAuths.clear();

    // Kill all child processes
    for (const [sid, child] of this.childProcesses) {
      try {
        await this.sendToSession(sid, 'disconnect');
      } catch {}
      child.kill();
    }
    this.childProcesses.clear();
    this.connectedSessions.clear();
  }

  // ============================================================
  // CHILD PROCESS MANAGEMENT (har session uchun alohida process)
  // ============================================================

  /**
   * Spawn a dedicated child process for a specific session
   */
  private spawnSessionProcess(sessionId: string): ChildProcess {
    const childPath = path.join(__dirname, 'monitor-worker.js');

    const child = fork(childPath, [String(this.apiId), this.apiHash, sessionId], {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    });

    child.on('message', (msg: any) => this.handleChildMessage(sessionId, msg));

    child.on('error', (err) => {
      this.logger.error(`Worker [${sessionId.slice(-8)}] error: ${err.message}`);
    });

    child.on('exit', (code) => {
      this.logger.warn(`Worker [${sessionId.slice(-8)}] exited (code ${code})`);
      this.childProcesses.delete(sessionId);
      this.connectedSessions.delete(sessionId);

      // Reject pending requests for this session
      for (const [id, pending] of this.pendingRequests) {
        if (id.startsWith(sessionId + '_')) {
          clearTimeout(pending.timer);
          pending.reject(new Error('Child process exited'));
          this.pendingRequests.delete(id);
        }
      }

      // Auto-restart if session is still ACTIVE
      if (code !== 0 && code !== null) {
        setTimeout(async () => {
          try {
            const session = await this.prisma.monitorSession.findUnique({
              where: { id: sessionId },
              select: { status: true, sessionString: true },
            });
            if (session?.status === MonitorSessionStatus.ACTIVE && session.sessionString) {
              this.logger.log(`Auto-restart worker [${sessionId.slice(-8)}]`);
              await this.connectSessionInWorker(sessionId, session.sessionString);
            }
          } catch (err) {
            this.logger.warn(`Auto-restart failed [${sessionId.slice(-8)}]: ${err.message}`);
          }
        }, 5000);
      }
    });

    this.childProcesses.set(sessionId, child);
    return child;
  }

  private handleChildMessage(sessionId: string, msg: any) {
    switch (msg.type) {
      case 'response': {
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
        break;
      }
      case 'newMessage':
        this.handleWorkerNewMessage(msg.sessionId, msg.data).catch((err) => {
          this.logger.error(`Message processing error [${sessionId.slice(-8)}]: ${err.message}`);
        });
        break;
      case 'heartbeat':
        this.lastWorkerActivity.set(sessionId, Date.now());
        break;
      case 'log':
        if (msg.level === 'error') this.logger.error(`[W] ${msg.message}`);
        else if (msg.level === 'warn') this.logger.warn(`[W] ${msg.message}`);
        else this.logger.log(`[W] ${msg.message}`);
        break;
    }
  }

  /**
   * Send command to a specific session's worker process
   */
  private sendToSession(sessionId: string, type: string, data: Record<string, any> = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const child = this.childProcesses.get(sessionId);
      if (!child) {
        reject(new Error(`No worker process for session ${sessionId.slice(-8)}`));
        return;
      }
      const id = `${sessionId}_${++this.requestIdCounter}`;
      const timeoutMs = (type === 'connect' || type === 'getDialogs') ? 120_000 : 60_000;
      const timer = setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Worker request timeout (${timeoutMs / 1000}s)`));
        }
      }, timeoutMs);
      this.pendingRequests.set(id, { resolve, reject, timer });
      child.send({ type, id, ...data });
    });
  }

  // ============================================================
  // SESSION MANAGEMENT (uses worker for gramJS)
  // ============================================================

  /**
   * Load active monitor sessions on startup — sends them to worker
   * Batch parallel (3 tadan) + retry mexanizmi
   */
  private async loadActiveSessions() {
    const sessions = await this.prisma.monitorSession.findMany({
      where: { status: MonitorSessionStatus.ACTIVE },
    });

    this.logger.log(`${sessions.length} ta aktiv monitor session topildi`);

    const validSessions = sessions.filter(s => s.sessionString);
    const BATCH_SIZE = 5;
    const BATCH_DELAY = 5_000; // Batchlar orasida 5s (15s juda sekin edi)
    const failedSessions: typeof validSessions = [];

    // 1-bosqich: Batch parallel ulash
    for (let batchStart = 0; batchStart < validSessions.length; batchStart += BATCH_SIZE) {
      const batch = validSessions.slice(batchStart, batchStart + BATCH_SIZE);

      const results = await Promise.allSettled(
        batch.map(session =>
          this.connectSessionInWorker(session.id, session.sessionString!)
            .then(() => ({ id: session.id, ok: true }))
            .catch(error => {
              this.logger.warn(`Monitor session ${session.id} ulanmadi: ${error.message}`);
              return { id: session.id, ok: false, session };
            }),
        ),
      );

      // Xato bo'lganlarga retry uchun saqlash
      for (const r of results) {
        if (r.status === 'fulfilled' && !r.value.ok && (r.value as any).session) {
          failedSessions.push((r.value as any).session);
        }
      }

      // Keyingi batch dan oldin kutish (oxirgi batch bundan mustasno)
      if (batchStart + BATCH_SIZE < validSessions.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }

    this.logger.log(
      `Monitor sessions: ${this.connectedSessions.size} ulandi, ${failedSessions.length} xato`,
    );

    // 2-bosqich: Xato bo'lganlarni 30s dan keyin qayta ulash (retry)
    if (failedSessions.length > 0) {
      this.logger.log(`${failedSessions.length} ta session 30s dan keyin qayta ulanadi...`);
      setTimeout(async () => {
        for (const session of failedSessions) {
          try {
            await this.connectSessionInWorker(session.id, session.sessionString!);
            this.logger.log(`Retry muvaffaqiyatli: ${session.id}`);
          } catch (error) {
            this.logger.error(`Retry ham xato: ${session.id} — ${error.message}`);
            // Faqat retry ham ishlamasa INACTIVE
            await this.prisma.monitorSession.update({
              where: { id: session.id },
              data: { status: MonitorSessionStatus.INACTIVE },
            }).catch(() => {});
          }
          // Retrylar orasida 10s
          await new Promise(resolve => setTimeout(resolve, 10_000));
        }
        this.logger.log(`Retry tugadi. Jami ulangan: ${this.connectedSessions.size}`);
      }, 30_000);
    }

    // Dastlabki guruh sinxronlash — 2 minutdan keyin
    setTimeout(() => {
      this.syncAllSessionGroups().catch((err) =>
        this.logger.warn(`Guruh sinxronlash xatolik: ${err.message}`),
      );
    }, 2 * 60_000);

    // Priority guruh auto-join — 3 minutdan keyin (sessiyalar sync bo'lgach)
    setTimeout(() => {
      this.syncPriorityGroupsToAllSessions().catch((err) =>
        this.logger.warn(`Priority auto-join xatolik: ${err.message}`),
      );
    }, 3 * 60_000);

    // Keyingi takrorlash — har 1 soatda
    setInterval(() => {
      this.syncPriorityGroupsToAllSessions().catch((err) =>
        this.logger.warn(`Priority auto-join xatolik: ${err.message}`),
      );
    }, 60 * 60_000);
  }

  /**
   * Connect a session in the worker thread
   */
  private async connectSessionInWorker(sessionId: string, sessionString: string) {
    // Kill existing process if any
    const existing = this.childProcesses.get(sessionId);
    if (existing) {
      try { existing.kill(); } catch {}
      this.childProcesses.delete(sessionId);
    }

    // Spawn new process for this session
    this.spawnSessionProcess(sessionId);

    // Send connect command
    await this.sendToSession(sessionId, 'connect', { sessionString });
    this.connectedSessions.add(sessionId);
    this.lastWorkerActivity.set(sessionId, Date.now());
    this.logger.log(`Monitor session ulandi: ${sessionId.slice(-8)}`);
  }

  /**
   * Get all monitor sessions for a user
   */
  async getSessions(userId: string, role?: string, businessModule = 'LOGISTIKA') {
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
    return this.prisma.monitorSession.findMany({
      where: {
        ...(isAdmin ? {} : { userId }),
        businessModule: businessModule as any,
        status: { not: MonitorSessionStatus.DELETED },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get single monitor session
   */
  async getSession(id: string) {
    return this.prisma.monitorSession.findUnique({ where: { id } });
  }

  /**
   * Step 1: Send auth code to phone for monitor session
   * Auth runs in MAIN THREAD (short-lived, doesn't block for long)
   */
  async sendCode(userId: string, phone: string, name?: string, businessModule = 'LOGISTIKA'): Promise<{
    monitorSessionId: string;
    phoneCodeHash: string;
  }> {
    const count = await this.prisma.monitorSession.count({
      where: {
        userId,
        status: { in: [MonitorSessionStatus.ACTIVE, MonitorSessionStatus.CONNECTING, MonitorSessionStatus.PENDING] },
      },
    });

    if (count >= MAX_MONITOR_SESSIONS) {
      throw new Error(`Maksimal ${MAX_MONITOR_SESSIONS} ta kuzatuv session ruxsat etiladi`);
    }

    const session = await this.prisma.monitorSession.create({
      data: {
        userId,
        name: name || `Monitor ${phone.slice(-4)}`,
        phone,
        status: MonitorSessionStatus.CONNECTING,
        businessModule: businessModule as any,
      },
    });

    const stringSession = new StringSession('');
    const client = new TelegramClient(stringSession, this.apiId, this.apiHash, {
      connectionRetries: 3,
      requestRetries: 2,
      useWSS: true,
      floodSleepThreshold: 60,
    });

    (client as any)._errorHandler = (err: any) => {
      const msg = err?.message || '';
      if (msg === 'TIMEOUT' || msg === 'Not connected') return;
      this.logger.error(`gramJS auth error: ${msg}`);
    };

    await client.connect();
    this.logger.log(`Monitor client ulandi, kod yuborilmoqda: ${phone}`);

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

      this.pendingAuths.set(session.id, {
        client,
        phone,
        phoneCodeHash,
        monitorSessionId: session.id,
      });

      return { monitorSessionId: session.id, phoneCodeHash };
    } catch (error) {
      await client.disconnect();
      await this.prisma.monitorSession.update({
        where: { id: session.id },
        data: { status: MonitorSessionStatus.INACTIVE },
      });
      throw error;
    }
  }

  /**
   * Step 2: Sign in with code
   * Auth runs in MAIN THREAD, then session is handed to worker for listening
   */
  async signIn(monitorSessionId: string, code: string, password?: string): Promise<{
    success: boolean;
    needPassword?: boolean;
  }> {
    const pending = this.pendingAuths.get(monitorSessionId);
    if (!pending) {
      throw new Error('Auth sessiya topilmadi. Qaytadan kod yuboring.');
    }

    try {
      await pending.client.invoke(
        new Api.auth.SignIn({
          phoneNumber: pending.phone,
          phoneCodeHash: pending.phoneCodeHash,
          phoneCode: code,
        }),
      );
    } catch (error: any) {
      if (error.errorMessage === 'SESSION_PASSWORD_NEEDED') {
        if (!password) {
          return { success: false, needPassword: true };
        }

        const passwordResult = await pending.client.invoke(new Api.account.GetPassword());
        const srp = await computeCheck(passwordResult, password);
        await pending.client.invoke(new Api.auth.CheckPassword({ password: srp }));
      } else if (error.errorMessage === 'PHONE_CODE_EXPIRED') {
        this.pendingAuths.delete(monitorSessionId);
        throw new Error('Kod muddati tugagan. Qaytadan kod yuboring.');
      } else {
        throw error;
      }
    }

    // Save session string
    const sessionString = (pending.client.session as any).save();

    await this.prisma.monitorSession.update({
      where: { id: monitorSessionId },
      data: {
        sessionString,
        status: MonitorSessionStatus.ACTIVE,
      },
    });

    // Disconnect auth client from main thread (free main event loop)
    try { await pending.client.disconnect(); } catch {}
    this.pendingAuths.delete(monitorSessionId);

    // Connect in worker thread for listening
    await this.connectSessionInWorker(monitorSessionId, sessionString);

    // Sync groups count via worker
    try {
      const result = await this.sendToSession(monitorSessionId, 'getDialogs');
      await this.prisma.monitorSession.update({
        where: { id: monitorSessionId },
        data: { totalGroups: result.total },
      });
    } catch (error) {
      this.logger.warn(`Guruhlar sanashda xatolik: ${error.message}`);
    }

    this.logger.log(`Monitor session muvaffaqiyatli ulandi: ${monitorSessionId}`);
    return { success: true };
  }

  // ============================================================
  // MESSAGE HANDLING (runs in main thread, data from worker)
  // ============================================================

  /**
   * Handle pre-extracted message from worker thread
   * All gramJS calls already done in worker — here we do DB ops, filtering, parsing
   */
  private async handleWorkerNewMessage(monitorSessionId: string, data: WorkerMessageData) {
    // Track activity — har bir xabar kelganda yangilanadi
    this.lastWorkerActivity.set(monitorSessionId, Date.now());

    const text = data.text;
    const textLower = text.toLowerCase();
    const groupTelegramId = data.groupTelegramId;
    const chatTitle = data.chatTitle || '';

    // ===== 0. PRIORITY GURUH TEKSHIRUV =====
    const priorityGroups = await this.getPriorityGroups();
    const normalizedGroupId = this.normalizeGroupId(groupTelegramId);
    const isPriority = priorityGroups.has(normalizedGroupId);

    if (isPriority && chatTitle) {
      this.updatePriorityGroupTitle(groupTelegramId, chatTitle).catch(() => {});
    }

    // ===== 1. CARGO KEYWORD FILTER =====
    this.diagCounters.total++;
    // Per-session diag
    if (!this.perSessionDiag.has(monitorSessionId)) {
      this.perSessionDiag.set(monitorSessionId, { total: 0, created: 0, phoneDup: 0, noPhone: 0, noKeyword: 0 });
    }
    const psd = this.perSessionDiag.get(monitorSessionId)!;
    psd.total++;
    const rules = await this.getFilterRules(monitorSessionId);

    // Modul (LOGISTIKA / TAKSI) — taksida raqamsiz va keyword'siz ham order yaratiladi
    const sess = await this.getCachedSession(monitorSessionId);
    const businessModule = sess?.businessModule || 'LOGISTIKA';
    const isTaksi = businessModule === 'TAKSI';

    if (rules?.enabled && rules.excludeKeywords?.length) {
      for (const keyword of rules.excludeKeywords) {
        if (textLower.includes(keyword.toLowerCase())) { this.diagCounters.excludeKw++; return; }
      }
    }

    if (!isPriority) {
      const userKeywords = (rules?.enabled && rules.keywords?.length) ? rules.keywords : null;
      // Taksi: foydalanuvchi keyword bermasa — keyword sharti qo'yilmaydi (barcha xabardan order)
      const keywordsToCheck = userKeywords || (isTaksi ? null : [...CARGO_KEYWORDS, ...DRIVER_KEYWORDS]);

      if (keywordsToCheck) {
        let keywordMatch = false;
        for (const keyword of keywordsToCheck) {
          if (textLower.includes(keyword.toLowerCase())) {
            keywordMatch = true;
            break;
          }
        }
        if (!keywordMatch) { this.diagCounters.noKeyword++; psd.noKeyword++; return; }
      }
    }

    // ===== 2. PARSE — telefon raqam =====
    const parsed = this.parseCargoInfo(text);
    // Logistika: raqamsiz e'londan order yaratilmaydi. Taksi: raqamsiz ham yaratiladi.
    if (!parsed.phone && !isTaksi) { this.diagCounters.noPhone++; psd.noPhone++; return; }

    // Keyword match'dan o'tgan xabar — messagesRead ni oshir (dedup bo'lsa ham)
    this.incrementMessagesRead(monitorSessionId).catch(() => {});

    // ===== 2b. BLOKLANGAN SENDER — Telegram dispetcher sifatida saqlash =====
    if (await this.messageFilter.isBlockedSender(data.senderId || '', parsed.phone || '')) {
      this.diagCounters.blocked++;

      // TelegramDispatcherAd dedup — bir xil telefon/sender 2 soat ichida qayta saqlanmaydi
      const now2b = Date.now();
      const tgAdKey = parsed.phone
        ? `tgad_phone_${parsed.phone}`
        : data.senderId ? `tgad_sender_${data.senderId}` : null;
      if (tgAdKey) {
        const existing = this.recentOrders.get(tgAdKey);
        if (existing && now2b - existing < 2 * 60 * 60_000) return; // 2h dedup
        this.recentOrders.set(tgAdKey, now2b);
      }

      // Bloklangan sender e'lonini TelegramDispatcherAd ga saqlash (max 10K)
      try {
        const count = await this.prisma.telegramDispatcherAd.count();
        if (count >= 10000) {
          // Eng eskilarini o'chirish (500 tadan)
          const oldest = await this.prisma.telegramDispatcherAd.findMany({
            orderBy: { createdAt: 'asc' },
            take: 500,
            select: { id: true },
          });
          await this.prisma.telegramDispatcherAd.deleteMany({
            where: { id: { in: oldest.map(o => o.id) } },
          });
        }
        const cleanStr = (s: string) => s.replace(/\x00/g, '').replace(/\\x[0-9a-fA-F]{2}/g, '').substring(0, 500);
        const createdAd = await this.prisma.telegramDispatcherAd.create({
          data: {
            messageText: cleanStr(data.text || ''),
            cargoFrom: parsed.cargoFrom || null,
            cargoTo: parsed.cargoTo || null,
            vehicleType: (parsed as any).vehicleType || null,
            vehicleCapacity: (parsed as any).vehicleCapacity || null,
            phone: parsed.phone || null,
            senderName: cleanStr(data.senderFirstName || ''),
            senderTelegramId: data.senderId ? String(data.senderId) : null,
            groupTitle: cleanStr(data.chatTitle || ''),
            groupTelegramId: data.groupTelegramId ? String(data.groupTelegramId) : null,
            scope: (parsed as any).scope || 'INTERNAL',
          },
        });
        // WebSocket orqali haydovchilarga TO'LIQ MA'LUMOT yuborish (real-time append uchun)
        try {
          this.gateway?.server?.to('device:driver')?.emit('tgDispatcher:new', createdAd);
        } catch (_) {}
      } catch (e) {
        // Silent — bloklangan e'lon saqlanmasa ham muammo emas
      }
      return;
    }

    // ===== 3. GLOBAL DUPLIKAT TEKSHIRUV =====
    const now = Date.now();

    // 3a. Telefon bo'yicha IN-MEMORY dedup — 30 daqiqa (odamlar har 30-80 minutda qayta joylaydi)
    // Oldin 4 soat edi — global dedup tufayli boshqa sessionlar o'z e'lonlarini saqlamay qolayotgan edi
    const PHONE_DEDUP_TTL = 30 * 60_000; // 30 daqiqa
    if (parsed.phone) {
      const phoneDedupKey = `phone_${parsed.phone}`;
      const existingPhone = this.recentOrders.get(phoneDedupKey);
      if (existingPhone && now - existingPhone < PHONE_DEDUP_TTL) {
        this.diagCounters.phoneDup++; psd.phoneDup++;
        // Kim birinchi yozgan?
        const owner = this.phoneDedupOwner.get(parsed.phone);
        if (owner === monitorSessionId) {
          if (!psd['selfDup']) psd['selfDup'] = 0;
          psd['selfDup']++;
        } else {
          if (!psd['otherDup']) psd['otherDup'] = 0;
          psd['otherDup']++;
        }
        return;
      }
      this.recentOrders.set(phoneDedupKey, now);
      this.phoneDedupOwner.set(parsed.phone, monitorSessionId);
    }

    // 3b. Sender bo'yicha GLOBAL dedup — 1 soat (bir odam 1 soatda faqat 1 order)
    if (data.senderId) {
      const senderDedupKey = `sender_${data.senderId}`;
      const existingSender = this.recentOrders.get(senderDedupKey);
      if (existingSender && now - existingSender < 60 * 60_000) { this.diagCounters.senderDup++; return; }
      this.recentOrders.set(senderDedupKey, now);
    }

    // 3c. Xabar matni bo'yicha dedup
    const textHash = text.trim().substring(0, 100).toLowerCase().replace(/\s+/g, ' ');
    const textDedupKey = `text_${this.simpleHash(textHash)}`;
    const existingText = this.recentOrders.get(textDedupKey);
    if (existingText && now - existingText < this.DEDUP_TTL) { this.diagCounters.textDup++; return; }
    this.recentOrders.set(textDedupKey, now);

    // 3d. DB dedup — HAR DOIM (restart dan keyin ham, cross-process ham)
    // phone indekslangan — tez ishlaydi. 4h → 30min
    if (parsed.phone) {
      const dedupSince = new Date(now - 30 * 60_000);
      const dbPhoneDup = await this.prisma.order.findFirst({
        where: {
          phone: parsed.phone,
          createdAt: { gte: dedupSince },
        },
        select: { id: true },
      });
      if (dbPhoneDup) {
        this.recentOrders.set(`phone_${parsed.phone}`, now);
        this.diagCounters.dbDup++;
        return;
      }
    }

    // ===== 4. SESSION/USER MA'LUMOTLARI =====
    const userId = await this.getCachedSessionUserId(monitorSessionId);
    if (!userId) return;

    const senderTelegramId = data.senderId || undefined;
    const senderName = data.senderFirstName;
    const senderLastName = data.senderLastName;
    const senderUsername = data.senderUsername;
    const fullSenderName = [senderName, senderLastName].filter(Boolean).join(' ');
    const groupTitle = chatTitle || 'Noma\'lum guruh';

    // ===== 5. AVTOMATIK BLOKLASH FILTERI =====
    const filterResult = await this.messageFilter.filterMessage({
      messageText: text,
      groupTitle,
      groupTelegramId,
      messageId: data.messageId,
      senderAccessHash: data.senderAccessHash,
      sender: {
        telegramId: senderTelegramId || '',
        firstName: senderName,
        lastName: senderLastName,
        username: senderUsername,
      },
      phone: parsed.phone,
      monitorSessionId,
      userId,
      businessModule,
    });

    if (filterResult.blocked) {
      this.diagCounters.blocked++;
      await this.prisma.monitorSession.update({
        where: { id: monitorSessionId },
        data: {
          messagesRead: { increment: 1 },
          lastMessageAt: new Date(),
        },
      });
      return;
    }

    // ===== 6. HAYDOVCHI / CARGO TURI =====
    const driverInfo = this.detectDriverAd(textLower, isTaksi);
    const orderType = driverInfo.isDriver ? OrderType.DRIVER : OrderType.CARGO;

    let vehicleType = driverInfo.vehicleType;
    let vehicleCapacity = driverInfo.capacity;
    if (!vehicleType) {
      for (const vt of VEHICLE_TYPES) {
        if (vt.pattern.test(textLower)) {
          vehicleType = vt.type;
          break;
        }
      }
    }
    if (!vehicleCapacity) {
      const capMatch = textLower.match(/(\d+[\d.,]*)\s*(?:tonna?(?:lik|li)?|tunna?(?:lik|li)?|tonn?|tn|kub(?:a?lik?|a)?|kg|klo|тонн?(?:а(?:ли[кк])?)?|тунн?(?:а(?:ли[кк])?)?|куб(?:а?ли[кк]?|а)?|кг|тн|т(?![а-яА-ЯўқғҳёЎҚҒҲЁa-zA-Z])|t(?![a-zA-Zа-яА-ЯўқғҳёЎҚҒҲЁ]))/i);
      if (capMatch) vehicleCapacity = capMatch[0].trim();
    }

    // ===== 7. SENDER STATISTIKASI =====
    let senderTodayAds = 0;
    let senderTotalAds = 0;
    if (senderTelegramId) {
      const stats = await this.trackSenderStats(senderTelegramId);
      senderTodayAds = stats.today;
      senderTotalAds = stats.total;
    }

    // ===== 8. ORDER YARATISH =====
    const sanitize = (s: string) => s
      .replace(/\x00/g, '')
      .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/\\x[0-9a-fA-F]{0,2}/g, '')
      .replace(/\\/g, '/');

    // Scope klassifikatsiya (INTERNAL / IMPORT / EXPORT)
    const scope = classifyOrderScope(parsed.cargoFrom, parsed.cargoTo, text);

    // Qo'shimcha yuk (dogruz) aniqlash
    const additionalCargoPatterns = /qo['']?shimcha\s*yuk|dogru[sz]|dagruz|дополнит|догруз|do['']?gruz|pustoy|пустой/i;
    const isAdditionalCargo = additionalCargoPatterns.test(text);

    this.diagCounters.created++;
    psd.created++;
    const order = await this.prisma.order.create({
      data: {
        userId,
        messageText: sanitize(text),
        groupTitle: sanitize(groupTitle),
        groupTelegramId,
        senderName: fullSenderName ? sanitize(fullSenderName) : undefined,
        senderUsername: senderUsername ? sanitize(senderUsername) : undefined,
        senderTelegramId,
        messageDate: new Date(data.date * 1000),
        messageId: data.messageId ? parseInt(data.messageId, 10) || undefined : undefined,
        groupUsername: data.groupUsername || undefined,
        cargoFrom: parsed.cargoFrom,
        cargoTo: parsed.cargoTo,
        cargoType: parsed.cargoType,
        cargoWeight: parsed.cargoWeight,
        price: parsed.price,
        phone: parsed.phone,
        distance: parsed.distance,
        type: orderType,
        vehicleType,
        vehicleCapacity,
        senderTodayAds,
        senderTotalAds,
        status: OrderStatus.NEW,
        monitorSessionId,
        scope,
        isAdditionalCargo,
        businessModule: businessModule as any,
      },
    });

    // Update stats
    await this.prisma.monitorSession.update({
      where: { id: monitorSessionId },
      data: {
        ordersFound: { increment: 1 },
        messagesRead: { increment: 1 },
        lastMessageAt: new Date(),
      },
    });

    // Emit to dashboard via WebSocket + FCM push (offline userlarga)
    this.gateway.emitNewOrderWithFcm(userId, order);

    // Yolda Dispatcher app'larga real-time yuborish
    try {
      this.yoldaGateway.emitNewAd({
        id: order.id,
        type: order.type,
        cargoFrom: order.cargoFrom,
        cargoTo: order.cargoTo,
        vehicleType: order.vehicleType,
        vehicleCapacity: order.vehicleCapacity,
        phone: order.phone,
        price: order.price,
        messageText: order.messageText,
        senderName: order.senderName,
        senderTodayAds: order.senderTodayAds,
        senderTotalAds: order.senderTotalAds,
        groupTitle: order.groupTitle,
        scope: order.scope,
        createdAt: order.createdAt,
        status: order.status,
      });
    } catch {}

    // Smart matching: yaqindagi haydovchilarga taklif
    this.driverMatching?.matchDriversToOrder(order).catch(() => {});

    // Yuk tarqatuvchi bot (@Yukchibor_bot) — ruxsatli foydalanuvchilarga real vaqtda
    this.cargoBot?.broadcastOrder(order).catch(() => {});

    // Shaharlararo taksi bot — TAKSI orderlarni guruhga yuboradi (token/guruh berilgach)
    this.taksiBot?.broadcastOrder(order).catch(() => {});

    // Auto-SMS: yangi order topilganda avtomatik SMS yuborish
    this.smsService.onNewOrder({
      phone: parsed.phone,
      type: orderType,
      cargoFrom: parsed.cargoFrom,
      cargoTo: parsed.cargoTo,
      groupTitle,
    }).catch(() => {});

    // Auto-TG SMS: Telegram DM orqali habar yuborish
    this.telegramSmsService.onNewOrder({
      senderTelegramId,
      senderUsername: senderUsername || null,
      type: orderType,
      cargoFrom: parsed.cargoFrom,
      cargoTo: parsed.cargoTo,
      senderName: fullSenderName || senderUsername || null,
      phone: parsed.phone,
      monitorSessionId,
      sourceGroupId: data.groupTelegramId,
      sourceMessageId: data.messageId,
      senderAccessHash: data.senderAccessHash || undefined,
    }).catch(() => {});

    const distStr = parsed.distance ? ` | ${parsed.distance} km` : '';
    const routeStr = parsed.cargoFrom && parsed.cargoTo
      ? ` | ${parsed.cargoFrom} → ${parsed.cargoTo}`
      : '';
    this.logger.log(
      `Yangi ${orderType}: ${parsed.phone}${routeStr}${distStr} | ${groupTitle}`,
    );
  }

  // ============================================================
  // PARSING & DETECTION (pure computation, no gramJS)
  // ============================================================

  /**
   * Haydovchi e'lonini aniqlash
   */
  private detectDriverAd(textLower: string, isTaksi = false): {
    isDriver: boolean;
    vehicleType?: string;
    capacity?: string;
  } {
    // Yangi qatorlarni bo'shliqqa almashtirish — "yuk bolsa\nolamiz" → "yuk bolsa olamiz"
    textLower = textLower.replace(/\n+/g, ' ').replace(/\s+/g, ' ')
      // Combining diacritical marks — "бу́лса" → "булса", "бу́ш" → "буш"
      .replace(/[\u0300-\u036F]/g, '')
      // Math Monospace/Bold/Sans Unicode → oddiy ASCII
      .replace(/[\u{1D400}-\u{1D7FF}]/gu, (ch) => {
        const cp = ch.codePointAt(0)!;
        if (cp >= 0x1D41A && cp <= 0x1D433) return String.fromCharCode(cp - 0x1D41A + 97);
        if (cp >= 0x1D44E && cp <= 0x1D467) return String.fromCharCode(cp - 0x1D44E + 97);
        if (cp >= 0x1D482 && cp <= 0x1D49B) return String.fromCharCode(cp - 0x1D482 + 97);
        if (cp >= 0x1D5BA && cp <= 0x1D5D3) return String.fromCharCode(cp - 0x1D5BA + 97);
        if (cp >= 0x1D5EE && cp <= 0x1D607) return String.fromCharCode(cp - 0x1D5EE + 97);
        if (cp >= 0x1D68A && cp <= 0x1D6A3) return String.fromCharCode(cp - 0x1D68A + 97);
        return ch;
      });
    let vehicleType: string | undefined;
    for (const vt of VEHICLE_TYPES) {
      if (vt.pattern.test(textLower)) {
        vehicleType = vt.type;
        break;
      }
    }

    let driverKeywordMatch = false;
    for (const keyword of DRIVER_KEYWORDS) {
      if (textLower.includes(keyword)) {
        driverKeywordMatch = true;
        break;
      }
    }

    // Taksi: GM/UzAuto yengil mashinalar yoki taksi haydovchi iboralari → DRIVER
    let taxiDriverMatch = false;
    if (isTaksi) {
      for (const keyword of TAXI_DRIVER_KEYWORDS) {
        if (textLower.includes(keyword)) {
          taxiDriverMatch = true;
          break;
        }
      }
    }

    const strongDriverPatterns = [
      // === LATIN O'ZBEK ===
      // Mashina/transport taklif
      'mashina bor', 'moshina bor', 'mashina bo\'sh', 'mashina bosh',
      'moshina bo\'sh', 'moshina bosh', 'mashina tayyor', 'moshina tayyor',
      'mashina chiqyapti', 'mashina ketyapti', 'mashina chiqadi', 'mashina ketadi',
      'mashina chiqmoqda', 'mashinam bor', 'moshinam bor',
      'transport bor', 'transportim bor', 'transport tayyor',
      // Fura taklif
      'fura bor', 'fura bo\'sh', 'fura bosh', 'fura tayyor',
      'fura chiqyapti', 'fura ketyapti', 'fura chiqadi', 'furam bor',
      // Yuk olish — asosiy
      'yuk olaman', 'yuk olamiz', 'yuk olamz', 'yuk oladi',
      'yuk olib ketaman', 'yuk olib ketamiz', 'yuk olib boraman',
      'yuk qabul qilaman', 'yuk qabul qilamiz',
      'yuk tashiyman', 'yuk tashiymiz', 'yuk tashiydi',
      'yuk tashib beraman', 'yuk tashib beramiz',
      'yuk eltaman', 'yuk eltamiz', 'yuk olib kelaman',
      // Yuk bolsa — barcha variantlar
      'yuk bolsa olamiz', 'yuk bolsa olaman', 'yuk bolsa olamz',
      'yuk bo\'lsa olamiz', 'yuk bo\'lsa olaman',
      'yuklar bolsa', 'yuklar bo\'lsa', 'yuklar bolsa olamiz',
      'yuk bersa olamiz', 'yuk bersa olaman', 'yuklar bersa',
      'yuk bolsa tashiymiz', 'yuk bolsa tashiyman',
      'yuk bolsa chiqamiz', 'yuk bolsa chiqaman',
      // Yuk kerak / izlash
      'yuk kerak', 'yuklar kerak', 'yuk izlayman', 'yuk izlayapmiz',
      'yuk qidiraman', 'yuk qidiryapmiz', 'yuk qidiramiz',
      'yukka chiqaman', 'yukka chiqamiz', 'yukka chiqmoqchiman',
      'yukka tayyormiz', 'yukka tayyorman', 'yukka tayyor',
      'yukka ketaman', 'yukka ketamiz',
      // Haydovchi / shofer
      'haydovchiman', 'haydovchimiz', 'shoferman', 'shofermiz',
      'men haydovchi', 'biz haydovchi',
      // Bo'sh transport
      'bo\'sh mashina', 'bosh mashina', 'bo\'sh transport', 'bosh transport',
      'bo\'sh fura', 'bosh fura', 'bo\'sh isuzu', 'bosh isuzu',
      'bo\'sh kamaz', 'bosh kamaz', 'bo\'sh tent', 'bosh tent',
      // Ortish / yuklash tayyor
      'ortishga tayyor', 'yuklashga tayyor', 'yuklay olamiz', 'yuklay olaman',
      'ortish mumkin', 'yuklash mumkin',
      // Qaytish / ketish
      'bosh qaytaman', 'bo\'sh qaytaman', 'bosh qaytamiz', 'bo\'sh qaytamiz',
      'bosh ketaman', 'bo\'sh ketaman', 'bosh ketamiz', 'bo\'sh ketamiz',
      'bosh boraman', 'bo\'sh boraman', 'bosh boramiz', 'bo\'sh boramiz',
      'boshiga ketaman', 'bo\'shiga ketaman',

      // === KIRILL O'ZBEK ===
      // Mashina/transport
      'машина бор', 'мошина бор', 'машина бўш', 'мошина бўш',
      'машина буш', 'мошина буш', 'машина бош', 'мошина бош',
      'машина тайёр', 'мошина тайёр', 'машинам бор', 'мошинам бор',
      'машина чиқяпти', 'машина кетяпти', 'машина чиқади', 'машина кетади',
      'транспорт бор', 'транспортим бор', 'транспорт тайёр',
      // Фура
      'фура бор', 'фура бўш', 'фура буш', 'фура бош', 'фура тайёр',
      'фура чиқяпти', 'фура кетяпти', 'фура чиқади', 'фурам бор',
      // Юк олиш — асосий
      'юк оламан', 'юк оламиз', 'юк олади', 'юк оламз',
      'юк олиб кетаман', 'юк олиб кетамиз', 'юк олиб бораман',
      'юк қабул қиламан', 'юк қабул қиламиз',
      'юк ташийман', 'юк ташиймиз', 'юк ташийди',
      'юк ташиб бераман', 'юк ташиб берамиз',
      'юк элтаман', 'юк элтамиз', 'юк олиб келаман',
      // Юк бўлса / болса / булса — барча вариантлар
      'юк бўлса оламиз', 'юк бўлса оламан', 'юклар бўлса оламиз', 'юклар бўлса оламан',
      'юк булса оламиз', 'юк булса олам', 'юклар булса оламиз', 'юклар булса',
      'юк болса оламиз', 'юк болса оламан', 'юклар болса оламиз', 'юклар болса',
      'юк бўлса ташиймиз', 'юк болса ташиймиз', 'юк булса ташиймиз',
      'юк бўлса чиқамиз', 'юк болса чиқамиз', 'юк булса чиқамиз',
      'юк берса оламиз', 'юк берса оламан', 'юклар берса',
      'юк берса ташиймиз', 'юклар берса оламиз',
      // Юк керак / излаш
      'юк керак', 'юклар керак', 'юк излайман', 'юк излаяпмиз',
      'юк қидираман', 'юк қидиряпмиз', 'юк қидирамиз',
      'юкка чиқаман', 'юкка чиқамиз', 'юкка чиқмоқчиман',
      'юкка тайёрмиз', 'юкка тайёрман', 'юкка тайёр',
      'юкка кетаман', 'юкка кетамиз',
      // Ҳайдовчи / шофер
      'ҳайдовчиман', 'ҳайдовчимиз', 'шоферман', 'шофермиз',
      'мен ҳайдовчи', 'биз ҳайдовчи',
      'хайдовчиман', 'хайдовчимиз',
      // Бўш транспорт
      'бўш машина', 'бўш фура', 'бўш транспорт',
      'буш машина', 'буш фура', 'бош машина', 'бош фура',
      'бўш исузу', 'бўш камаз', 'бўш тент',
      // Ортиш / юклаш тайёр
      'ортишга тайёр', 'юклашга тайёр', 'юклай оламиз', 'юклай оламан',
      'ортиш мумкин', 'юклаш мумкин',
      // Қайтиш / кетиш
      'бўш қайтаман', 'бўш қайтамиз', 'буш қайтаман', 'буш қайтамиз',
      'бош қайтаман', 'бош қайтамиз', 'бош кетаман', 'бош кетамиз',
      'бўш кетаман', 'бўш кетамиз', 'бўш бораман', 'бўш борамиз',
      'бошига кетаман', 'бўшига кетаман',

      // === РУССКИЙ ===
      // Машина/транспорт
      'машина есть', 'машина свободн', 'машина пустая', 'машина готова',
      'фура есть', 'фура свободн', 'фура пустая', 'фура готова',
      'газель есть', 'газель свободн', 'газель пустая', 'газель готова',
      'камаз есть', 'камаз свободен', 'камаз пустой', 'камаз готов',
      'свободная машина', 'пустая машина', 'свободная фура', 'пустая фура',
      // Груз взять / искать
      'возьму груз', 'возьмем груз', 'возьмём груз',
      'беру груз', 'берем груз', 'берём груз',
      'заберу груз', 'заберем груз',
      'ищу груз', 'ищем груз', 'нужен груз', 'нужны грузы',
      'ищу загрузку', 'ищем загрузку', 'нужна загрузка',
      'ищу попутный', 'попутный груз',
      'готов к погрузке', 'готовы к погрузке',
      'готов к загрузке', 'готовы к загрузке',
      'подам машину', 'подам фуру', 'подадим машину',
      // Водитель
      'я водитель', 'я шофер', 'я шофёр',
      'мы водители', 'мы шоферы',
      // Еду — маршрут
      'еду пустой', 'еду пустая', 'еду порожний', 'еду порожняком',
      'едем пустые', 'едем порожняком',
      'иду пустой', 'идем пустые', 'идём пустые',
      'машина идет', 'машина идёт', 'машина едет',
      'фура идет', 'фура идёт', 'фура едет',
      'грузы возьмем', 'грузы возьму', 'грузы беру', 'грузы берем',

      // === QO'SHIMCHA — typo/colloquial variantlar ===
      // "yuk busa olamiz" = "yuk bolsa olamiz" colloquial
      'yuk busa olam', 'юк буса олам',
      'yuk bulsa olam', 'юк булса олам',
      // "shafyor/shafor/shofyor/shopir bor" — haydovchi bor
      'shafyor bor', 'шафёр бор', 'шафер бор',
      'shopir bor', 'шопир бор',
      'shofyor bor', 'шофёор бор', 'шофёр бор',
      'shofer bor', 'шофер бор', 'шоферр бор',
      'shafor bor', 'шафор бор',
      'shafyorim bor', 'шафёрим бор',
      // "ШАФЕР БОР", "ШОФЁОР БОР" — typos
      'шафёр бор', 'шафёор б��р',
      // "zakazga bor" — transport available for orders
      'zakazga', 'заказга',
      'zakaz olamiz', 'заказ оламиз',
      'zakaz olaman', 'заказ оламан',
      'zakaz qabul', 'заказ қабул',
      // "yuk yuklayman" = transport owner offering service
      'yuk yuklayman', 'юк юклайман',
      // Vehicle + "kerak" inversion (Isuzu bor yuk kerak)
      // Handled by strongMatch pattern below
      // "profisanal shopir" — professional driver available
      'profisanal', 'профессионал',
      'профисанал', 'професионал',
      'tajribali', 'тажрибали', 'тажрибал',
      // "mashina chiqadi" — vehicle departing
      'moshina chiqadi', 'мошина чиқади',
      // "bo'sh qaytaman" — returning empty (various typos)
      'bush qaytaman', 'буш қайтаман',
      'bush ketaman', 'буш кетаман',
    ];
    let strongMatch = false;
    for (const kw of strongDriverPatterns) {
      if (textLower.includes(kw)) {
        strongMatch = true;
        break;
      }
    }

    // "xizmat" + vehicle type = DRIVER (haydovchi o'z mashinasini taklif qilyapti)
    if (!strongMatch && vehicleType) {
      if (/xizmat|хизмат|usti\s+ochiq|усти\s+очиқ|opketaman|олиб\s+кетаман|olib\s+ketaman|олиб\s+борам|olib\s+boram/i.test(textLower)) {
        strongMatch = true;
      }
    }

    // Regex-based strong patterns: "[vehicle] bor ... yuk kerak" = DRIVER
    if (!strongMatch && vehicleType) {
      const vehicleBorYukKerak = /(?:исуз[иу]|фура|камаз|газел|лабо|дамас|шакман|хово|тент|портер|isuzu?i?|fura|kamaz|gazel|labo|damas|shacman|howo|tent|porter)\s+(?:бор|бўш|буш|бош|bor|bo'sh|bosh)\b/i;
      const hasYukKerak = /юу?к\s*кера[кг]|yu+k\s*kera[kg]|юу?к\s*изл|yuk\s*izl|юу?к\s*қидир|yuk\s*qidir/i;
      if (vehicleBorYukKerak.test(textLower) && hasYukKerak.test(textLower)) {
        strongMatch = true;
      }
    }

    const isDriver = strongMatch || (driverKeywordMatch && !!vehicleType) || taxiDriverMatch;

    if (!isDriver) return { isDriver: false };

    let capacity: string | undefined;
    const capMatch = textLower.match(/(\d+[\d.,]*)\s*(?:tonna?(?:lik|li)?|tunna?(?:lik|li)?|tonn?|tn|kub(?:a?lik?|a)?|kg|klo|тонн?(?:а(?:ли[кк])?)?|тунн?(?:а(?:ли[кк])?)?|куб(?:а?ли[кк]?|а)?|кг|тн|т(?![а-яА-ЯўқғҳёЎҚҒҲЁa-zA-Z])|t(?![a-zA-Zа-яА-ЯўқғҳёЎҚҒҲЁ]))/i);
    if (capMatch) {
      capacity = capMatch[0].trim();
    }

    return { isDriver: true, vehicleType, capacity };
  }

  /**
   * Parse cargo info from message text
   */
  private parseCargoInfo(text: string): ParsedCargo {
    const result: ParsedCargo = {};

    const normalizedText = text.replace(/[\u02BB\u02BC\u2018\u2019\u0060\u02BD\u02BE\u02C8\u02CA]/g, "'");

    // ===== TELEFON RAQAM =====
    const phonePatterns = [
      /\+?998[\s.-]?\(?(\d{2})\)?[\s.-]?(\d{3})[\s.-]?(\d{2})[\s.-]?(\d{2})/,
      /\b(\d{2})[\s.-]?(\d{3})[\s.-]?(\d{2})[\s.-]?(\d{2})\b/,
    ];
    for (const pattern of phonePatterns) {
      const match = text.match(pattern);
      if (match) {
        const digits = match[0].replace(/[\s.()\-+]/g, '');
        let normalized: string;
        if (digits.length === 9 && /^[0-9]/.test(digits)) {
          normalized = '998' + digits;
        } else if (digits.length >= 12) {
          normalized = digits.slice(-12);
        } else if (digits.length >= 9) {
          normalized = '998' + digits.slice(-9);
        } else {
          continue;
        }
        if (normalized.startsWith('998') && normalized.length === 12) {
          result.phone = '+' + normalized;
        }
        break;
      }
    }

    // ===== OG'IRLIK (avval — narxdan oldin, chunki "25 tonna" narx emas) =====
    const weightMatch = text.match(
      /(\d+[\d.,]*)\s*(?:tonna?(?:lik|li|gacha)?|tunna?(?:lik|li)?|tonn?(?:alik|ali|o)?|tn|kub(?:a?lik?|a(?:li[кк])?)?|kg|klo|тонн?(?:а(?:ли[кк]|гача)?|о)?|тунн?(?:а(?:ли[кк])?)?|куб(?:а?ли[кк]?|а)?|кг|тн|т(?![а-яА-ЯўқғҳёЎҚҒҲЁa-zA-Z])|t(?![a-zA-Zа-яА-ЯўқғҳёЎҚҒҲЁ]))/i,
    );
    if (weightMatch) {
      // Standardized format: "25 t", "150 kg", "22 kub"
      const numStr = weightMatch[1].replace(/\s/g, '').replace(',', '.');
      const num = parseFloat(numStr);
      const unitPart = weightMatch[0].substring(weightMatch[1].length).trim().toLowerCase();
      if (!isNaN(num)) {
        if (/kg|кг|klo/i.test(unitPart)) {
          result.cargoWeight = `${num} kg`;
        } else if (/kub|куб/i.test(unitPart)) {
          result.cargoWeight = `${num} kub`;
        } else {
          result.cargoWeight = `${num} t`;
        }
      }
    }

    // ===== NARX =====
    // Telefon raqamni narx deb olmaslik uchun: narx so'zdan keyin keladi yoki valyuta belgisi bor
    // Narx telefon raqamdan farqlanadi: 9 raqamdan kam YOKI valyuta so'zi/belgisi bor
    const pricePatterns: { re: RegExp; type: 'sum' | 'usd' | 'unit' }[] = [
      // $1500, $ 1500
      { re: /\$\s*(\d[\d\s.,]*\d|\d+)/i, type: 'usd' },
      // 1500$, 6000 $
      { re: /(\d[\d\s.,]*\d|\d+)\s*\$/i, type: 'usd' },
      // 1500 dollar, 6000 доллар
      { re: /(\d[\d\s.,]*\d|\d+)\s*(?:dollar|доллар|долл)/i, type: 'usd' },
      // 5 mln, 3млн, 1.5 million
      { re: /(\d[\d.,]*)\s*(?:mln|млн|million|миллион)/i, type: 'sum' },
      // 500 ming, 800 минг
      { re: /(\d[\d\s.,]*\d|\d+)\s*(?:ming|минг)/i, type: 'sum' },
      // 1 600 000 so'm, 500000 сум
      { re: /(\d[\d\s.,]*\d|\d+)\s*(?:so'm|som|sum|сом|сум|сўм|сумгач)/i, type: 'sum' },
      // Narxi: ..., Фрахт: ..., yo'l haqi ...
      { re: /(?:narx[iu]?|фрахт|fraxt|yo'l\s*(?:haqi|haqqi)|йўл\s*кир[оа])\s*[:=]?\s*(\d[\d\s.,]*\d|\d+)\b/i, type: 'sum' },
    ];

    for (const { re, type } of pricePatterns) {
      const pm = text.match(re);
      if (pm) {
        const rawNum = (pm[1] || pm[0].replace(/[$\s]/g, '')).replace(/\s/g, '').replace(',', '.');
        const num = parseFloat(rawNum);
        if (isNaN(num) || num <= 0) continue;
        // Telefon raqam filtr: 9+ raqamli son narx emas (998901234567 kabi)
        const digitCount = rawNum.replace(/[^0-9]/g, '').length;
        if (digitCount >= 9 && type !== 'usd') continue;
        // Format
        if (type === 'usd') {
          result.price = `${num} $`;
        } else {
          // mln → so'mga aylantirish
          if (/mln|млн|million|миллион/i.test(pm[0])) {
            result.price = `${num} mln so'm`;
          } else if (/ming|минг/i.test(pm[0])) {
            const full = num * 1000;
            if (full >= 1_000_000) {
              result.price = `${full / 1_000_000} mln so'm`;
            } else {
              result.price = `${num} ming so'm`;
            }
          } else {
            // Raw number — formatlab chiqarish
            if (num >= 1_000_000) {
              result.price = `${(num / 1_000_000).toFixed(1).replace('.0', '')} mln so'm`;
            } else if (num >= 1000) {
              result.price = `${(num / 1000).toFixed(0)} ming so'm`;
            } else {
              result.price = `${num} so'm`;
            }
          }
        }
        break;
      }
    }

    // ===== YO'NALISH (MARSHRUT) =====
    const routeMatch = normalizedText.match(
      /([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']+(?:\s+[A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']+){0,2})\s*[-–—→➡►>⏩]\s*([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']+(?:\s+[A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']+){0,2})/,
    );
    if (routeMatch) {
      result.cargoFrom = routeMatch[1].trim();
      result.cargoTo = routeMatch[2].trim();
    }

    const WBE = '(?![a-zA-Zа-яА-ЯўқғҳёЎҚҒҲЁ])';
    const LETTER = '[A-ZА-ЯЎҚҒҲa-zа-яўқғҳ\']';

    if (!result.cargoFrom) {
      const danGaMatch = normalizedText.match(
        new RegExp(`(${LETTER}+(?:\\s+${LETTER}+){0,1})\\s*(?:dan|дан)\\s+[\\s\\S]*?(${LETTER}+(?:\\s+${LETTER}+){0,1})\\s*(?:ga|га|ge|ге|go|го|qa|ка|гача|gacha)${WBE}`, 'i'),
      );
      if (danGaMatch) {
        result.cargoFrom = danGaMatch[1].trim();
        result.cargoTo = danGaMatch[2].trim();
      }
    }

    if (!result.cargoFrom) {
      const attachedMatch = normalizedText.match(
        new RegExp(`(${LETTER}{3,})(?:дан|дин|ден|dan|din|den)[\\s\\S]+?(${LETTER}{3,})(?:га|ге|го|гача|qa|ка|ga|ge|go|gacha)${WBE}`, 'i'),
      );
      if (attachedMatch) {
        result.cargoFrom = attachedMatch[1].trim();
        result.cargoTo = attachedMatch[2].trim();
      }
    }

    if (!result.cargoFrom) {
      const fromOnlyMatch = normalizedText.match(
        new RegExp(`(${LETTER}{3,})(?:дан|дин|ден|dan|din|den)${WBE}`, 'i'),
      );
      if (fromOnlyMatch) result.cargoFrom = fromOnlyMatch[1].trim();
    }
    // toOnlyMatch MUSTAQIL — cargoFrom topilsa ham cargoTo izlanishi kerak
    if (!result.cargoTo) {
      const toOnlyMatch = normalizedText.match(
        new RegExp(`(${LETTER}{3,})(?:га|ге|го|гача|qa|ка|ga|ge|go|gacha)${WBE}`, 'i'),
      );
      if (toOnlyMatch) result.cargoTo = toOnlyMatch[1].trim();
    }

    if (result.cargoFrom) {
      const cityFrom = findCity(result.cargoFrom);
      result.cargoFrom = cityFrom ? cityFrom.name : undefined;
    }
    if (result.cargoTo) {
      const cityTo = findCity(result.cargoTo);
      result.cargoTo = cityTo ? cityTo.name : undefined;
    }

    // FALLBACK: findCitiesInText
    if (!result.cargoFrom || !result.cargoTo) {
      const citiesInText = findCitiesInText(normalizedText);
      if (citiesInText.length >= 2) {
        if (!result.cargoFrom) result.cargoFrom = citiesInText[0].name;
        if (!result.cargoTo) {
          // Birinchi shahardan farqli shaharni topish
          const fromName = result.cargoFrom;
          const diffCity = citiesInText.find(c => c.name !== fromName);
          result.cargoTo = diffCity ? diffCity.name : citiesInText[1].name;
        }
      } else if (citiesInText.length === 1) {
        if (!result.cargoFrom) result.cargoFrom = citiesInText[0].name;
      }
    }

    // cargoFrom = cargoTo fix: agar ikkalasi bir xil bo'lsa → bittasini olib tashlash
    // (masalan "Chirchiqdan Jizzaxga" → Jizzax, Jizzax → faqat from qoldirish)
    if (result.cargoFrom && result.cargoTo && result.cargoFrom === result.cargoTo) {
      // Matnda "dan" va "ga" suffix bilan yana izlash
      const citiesInText = findCitiesInText(normalizedText);
      const uniqueCities = [...new Map(citiesInText.map(c => [c.name, c])).values()];
      if (uniqueCities.length >= 2) {
        result.cargoFrom = uniqueCities[0].name;
        result.cargoTo = uniqueCities[1].name;
      } else {
        // Faqat bitta shahar topilgan — cargoTo ni o'chirish
        result.cargoTo = undefined;
      }
    }

    // Masofa hisoblash
    if (result.cargoFrom && result.cargoTo) {
      const dist = calculateDistance(result.cargoFrom, result.cargoTo);
      if (dist !== null) {
        result.distance = dist;
      }
    }

    // ===== YUK TURI =====
    const typePatterns = [
      { pattern: /(?:bug'doy|пшениц|g'alla)/i, type: "Bug'doy" },
      { pattern: /(?:paxta|хлопок|cotton)/i, type: 'Paxta' },
      { pattern: /(?:ko'mir|уголь|coal)/i, type: "Ko'mir" },
      { pattern: /(?:sement|цемент|cement)/i, type: 'Sement' },
      { pattern: /(?:temir|металл|metal|armat)/i, type: 'Temir' },
      { pattern: /(?:meva|фрукт|fruit|sabzavot|овощ)/i, type: 'Meva-sabzavot' },
      { pattern: /(?:un\b|мука|flour)/i, type: 'Un' },
      { pattern: /(?:yog'|масл|oil)/i, type: "Yog'" },
      { pattern: /(?:qurilish|строй|construction)/i, type: 'Qurilish materiallari' },
      { pattern: /(?:shifer|шифер)/i, type: 'Shifer' },
      { pattern: /(?:kirpich|кирпич)/i, type: 'G\'isht' },
      { pattern: /(?:qum\b|pesok|песок)/i, type: 'Qum' },
      { pattern: /(?:shag'al|щебень|sheben)/i, type: "Shag'al" },
      { pattern: /(?:don\b|зерно|grain)/i, type: 'Don' },
      { pattern: /(?:guruch|рис|rice)/i, type: 'Guruch' },
      { pattern: /(?:kartoshka|картошка|kartofil)/i, type: 'Kartoshka' },
      { pattern: /(?:piyoz|лук|onion)/i, type: 'Piyoz' },
    ];

    for (const { pattern, type } of typePatterns) {
      if (pattern.test(text)) {
        result.cargoType = type;
        break;
      }
    }

    return result;
  }

  // ============================================================
  // UTILITY & STATS (DB only, no gramJS)
  // ============================================================

  /**
   * Sender statistikasi — DB + in-memory cache
   */
  private async trackSenderStats(senderTelegramId: string): Promise<{ today: number; total: number }> {
    const todayStr = new Date().toISOString().slice(0, 10);
    const existing = this.senderStats.get(senderTelegramId);

    if (existing) {
      if (existing.date === todayStr) {
        existing.today++;
      } else {
        existing.today = 1;
        existing.date = todayStr;
      }
      existing.total++;
      return { today: existing.today, total: existing.total };
    }

    // Birinchi marta — DB dan olish, lekin parallel count emas, tezroq findMany
    try {
      const todayStart = new Date(todayStr + 'T00:00:00.000Z');
      const totalCount = await this.prisma.order.count({
        where: { senderTelegramId },
      });
      // Bugungi sonni alohida so'ramasdan, total dan taxminlaymiz (optimallashtirish)
      const stats = { today: 1, total: totalCount + 1, date: todayStr };
      this.senderStats.set(senderTelegramId, stats);
      return { today: stats.today, total: stats.total };
    } catch {
      const stats = { today: 1, total: 1, date: todayStr };
      this.senderStats.set(senderTelegramId, stats);
      return { today: 1, total: 1 };
    }
  }

  /**
   * MonitorSession userId — cached
   */
  private async getCachedSession(
    monitorSessionId: string,
  ): Promise<{ userId: string; businessModule: string } | null> {
    const now = Date.now();
    const cached = this.sessionCache.get(monitorSessionId);
    if (cached && now - cached.cachedAt < this.SESSION_CACHE_TTL) {
      return { userId: cached.userId, businessModule: cached.businessModule };
    }

    const session = await this.prisma.monitorSession.findUnique({
      where: { id: monitorSessionId },
      select: { userId: true, businessModule: true },
    });
    if (!session) return null;

    this.sessionCache.set(monitorSessionId, {
      userId: session.userId,
      businessModule: session.businessModule,
      cachedAt: now,
    });
    return { userId: session.userId, businessModule: session.businessModule };
  }

  private async getCachedSessionUserId(monitorSessionId: string): Promise<string | null> {
    const s = await this.getCachedSession(monitorSessionId);
    return s?.userId ?? null;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return hash.toString(36);
  }

  /**
   * messagesRead ni oshirish — dedup bo'lgan xabarlar uchun ham
   */
  private async incrementMessagesRead(monitorSessionId: string) {
    await this.prisma.monitorSession.update({
      where: { id: monitorSessionId },
      data: {
        messagesRead: { increment: 1 },
        lastMessageAt: new Date(),
      },
    });
  }

  // ============================================================
  // HEALTH CHECK — o'lik sessionlarni aniqlash va qayta ulash
  // ============================================================

  /**
   * Har 3 minutda:
   * 1. Worker da har session connected mi tekshirish
   * 2. Uzoq vaqt xabar olmagan sessionlarni reconnect qilish
   * 3. DB da ACTIVE lekin worker da yo'q sessionlarni ulash
   */
  private async performHealthCheck() {
    if (this.connectedSessions.size === 0) return;
    const now = Date.now();

    // 1. Worker process yo'q bo'lgan sessionlarni qayta ulash
    for (const sessionId of [...this.connectedSessions]) {
      const child = this.childProcesses.get(sessionId);
      if (!child) {
        this.logger.warn(`Health: [${sessionId.slice(-8)}] process yo'q — reconnect`);
        await this.reconnectSession(sessionId);
        continue;
      }

      // Health check so'rash
      try {
        const health = await this.sendToSession(sessionId, 'healthCheck');
        if (!health.connected) {
          this.logger.warn(`Health: [${sessionId.slice(-8)}] disconnected — reconnect`);
          await this.reconnectSession(sessionId);
        }
      } catch {
        this.logger.warn(`Health: [${sessionId.slice(-8)}] ping failed — reconnect`);
        await this.reconnectSession(sessionId);
      }
    }

    // 2. DB da ACTIVE lekin ulanmagan sessionlarni ulash
    const activeSessions = await this.prisma.monitorSession.findMany({
      where: { status: MonitorSessionStatus.ACTIVE },
      select: { id: true, sessionString: true },
    });

    for (const session of activeSessions) {
      if (!this.connectedSessions.has(session.id) && session.sessionString) {
        this.logger.log(`Health: [${session.id.slice(-8)}] ACTIVE lekin ulanmagan — ulanadi`);
        try {
          await this.connectSessionInWorker(session.id, session.sessionString);
        } catch (err) {
          this.logger.warn(`Health: [${session.id.slice(-8)}] ulashda xatolik: ${err.message}`);
        }
      }
    }

    this.logger.log(`Health: ${this.connectedSessions.size} session, ${this.childProcesses.size} process`);
  }

  /**
   * Send DM via a connected monitor session (has entity cache for group members).
   * Used by TelegramSmsService for users without username.
   */
  async sendDmViaMonitor(
    targetId: string,
    targetUsername: string | undefined,
    message: string,
    targetPhone?: string,
    specificSessionId?: string,
  ): Promise<{ success: boolean; messageId?: number; error?: string }> {
    // If specific session requested, try it first
    const sessionsToTry: string[] = [];
    if (specificSessionId && this.connectedSessions.has(specificSessionId)) {
      sessionsToTry.push(specificSessionId);
    }
    // Then try remaining connected sessions
    for (const sid of this.connectedSessions) {
      if (!sessionsToTry.includes(sid)) sessionsToTry.push(sid);
    }

    for (const sessionId of sessionsToTry) {
      try {
        this.logger.log(`Monitor DM urinish: target=${targetId}, session=${sessionId.slice(-8)}`);
        const result = await this.sendToSession(sessionId, 'sendDm', {
          targetId,
          targetUsername: targetUsername || undefined,
          targetPhone: targetPhone || undefined,
          message,
        });
        this.logger.log(`Monitor DM natija: ${JSON.stringify(result)}`);
        if (result?.messageId) {
          this.logger.log(`Monitor DM yuborildi: target=${targetId}, session=${sessionId.slice(-8)}`);
          return { success: true, messageId: result.messageId };
        }
      } catch (err: any) {
        this.logger.warn(`Monitor DM xato (${sessionId.slice(-8)}): ${err.message}`);
      }
    }
    return { success: false, error: 'Hech bir monitor session userni topa olmadi' };
  }

  private async reconnectSession(sessionId: string) {
    // Kill old process
    const oldChild = this.childProcesses.get(sessionId);
    if (oldChild) {
      try { oldChild.kill(); } catch {}
      this.childProcesses.delete(sessionId);
    }
    this.connectedSessions.delete(sessionId);

    // Reload from DB
    try {
      const session = await this.prisma.monitorSession.findUnique({
        where: { id: sessionId },
        select: { sessionString: true, status: true },
      });
      if (session?.sessionString && session.status === MonitorSessionStatus.ACTIVE) {
        await this.connectSessionInWorker(sessionId, session.sessionString);
        this.logger.log(`Reconnect OK: [${sessionId.slice(-8)}]`);
      }
    } catch (err) {
      this.logger.error(`Reconnect failed [${sessionId.slice(-8)}]: ${err.message}`);
    }
  }

  // Filter rules cache
  private filterRulesCache: FilterRules | null = null;
  private filterRulesCacheTime = 0;
  private readonly FILTER_RULES_CACHE_TTL = 2 * 60_000;

  private async getFilterRules(monitorSessionId: string): Promise<FilterRules | null> {
    const now = Date.now();
    if (this.filterRulesCache !== undefined && now - this.filterRulesCacheTime < this.FILTER_RULES_CACHE_TTL) {
      return this.filterRulesCache;
    }

    const userId = await this.getCachedSessionUserId(monitorSessionId);
    if (!userId) return null;

    const rulesStr = await this.systemConfig.get(`filter_rules_${userId}`);
    if (!rulesStr) {
      const globalRules = await this.systemConfig.get('filter_rules_global');
      if (!globalRules) {
        this.filterRulesCache = null;
        this.filterRulesCacheTime = now;
        return null;
      }
      try {
        this.filterRulesCache = JSON.parse(globalRules);
      } catch {
        this.filterRulesCache = null;
      }
      this.filterRulesCacheTime = now;
      return this.filterRulesCache;
    }

    try {
      this.filterRulesCache = JSON.parse(rulesStr);
    } catch {
      this.filterRulesCache = null;
    }
    this.filterRulesCacheTime = now;
    return this.filterRulesCache;
  }

  // ============================================================
  // GROUP SYNC (via worker)
  // ============================================================

  private async syncSessionGroups(sessionId: string) {
    try {
      const result = await this.sendToSession(sessionId, 'getDialogs');
      await this.prisma.monitorSession.update({
        where: { id: sessionId },
        data: { totalGroups: result.total },
      });
      this.logger.debug(`Guruhlar sinxronlandi: ${sessionId.slice(-8)} → ${result.total} ta`);
    } catch (error) {
      this.logger.warn(`Guruh sinxronlash xatolik (${sessionId.slice(-8)}): ${error.message}`);
    }
  }

  private async syncAllSessionGroups() {
    for (const sessionId of this.connectedSessions) {
      await this.syncSessionGroups(sessionId);
    }
    this.logger.log(`${this.connectedSessions.size} ta session guruxlari sinxronlandi`);
  }

  async manualSyncGroups(sessionId: string) {
    if (!this.connectedSessions.has(sessionId)) {
      throw new Error('Session ulanmagan');
    }
    await this.syncSessionGroups(sessionId);
    const session = await this.prisma.monitorSession.findUnique({
      where: { id: sessionId },
    });
    return { totalGroups: session?.totalGroups || 0 };
  }

  // ============================================================
  // PRIORITY GURUHLAR
  // ============================================================

  private priorityGroupsCache: Set<string> | null = null;
  private priorityGroupsCacheTime = 0;
  private readonly PRIORITY_CACHE_TTL = 60_000;

  private normalizeGroupId(id: string): string {
    let s = id.trim();
    if (s.startsWith('-100') && s.length > 4) return s.substring(4);
    if (s.startsWith('-') && s.length > 1) return s.substring(1);
    return s;
  }

  private async getPriorityGroups(): Promise<Set<string>> {
    const now = Date.now();
    if (this.priorityGroupsCache && now - this.priorityGroupsCacheTime < this.PRIORITY_CACHE_TTL) {
      return this.priorityGroupsCache;
    }

    try {
      const raw = await this.systemConfig.get('monitor_priority_groups');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const ids = parsed.map((item: any) => {
            const rawId = typeof item === 'string' ? item : item.groupTelegramId;
            return this.normalizeGroupId(rawId);
          });
          this.priorityGroupsCache = new Set(ids);
        } else {
          this.priorityGroupsCache = new Set();
        }
      } else {
        this.priorityGroupsCache = new Set();
      }
    } catch {
      this.priorityGroupsCache = new Set();
    }

    this.priorityGroupsCacheTime = now;
    return this.priorityGroupsCache;
  }

  async getPriorityGroupsList(): Promise<Array<{ groupTelegramId: string; title: string }>> {
    const raw = await this.systemConfig.get('monitor_priority_groups');
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((item: any) => {
        if (typeof item === 'string') {
          return { groupTelegramId: item, title: '' };
        }
        return { groupTelegramId: item.groupTelegramId, title: item.title || '' };
      });
    } catch {
      return [];
    }
  }

  private async savePriorityGroupsList(list: Array<{ groupTelegramId: string; title: string }>) {
    await this.systemConfig.set(
      'monitor_priority_groups',
      JSON.stringify(list),
      'JSON' as any,
      'Monitor priority guruhlar',
    );
    this.priorityGroupsCache = null;
  }

  /**
   * Telegram guruh nomini aniqlash — worker orqali
   */
  private async resolveGroupTitle(groupTelegramId: string): Promise<string> {
    for (const sessionId of this.connectedSessions) {
      try {
        const title = await this.sendToSession(sessionId, 'resolveGroupTitle', { groupTelegramId });
        if (title) return title;
      } catch { /* try next */ }
    }
    return '';
  }

  async addPriorityGroup(groupTelegramId: string) {
    const list = await this.getPriorityGroupsList();
    const normalizedId = this.normalizeGroupId(groupTelegramId);
    const exists = list.some((g) => this.normalizeGroupId(g.groupTelegramId) === normalizedId);
    if (!exists) {
      const title = await this.resolveGroupTitle(groupTelegramId);
      list.push({ groupTelegramId: normalizedId, title: title || '' });
      await this.savePriorityGroupsList(list);
      this.logger.log(`Priority guruh qo'shildi: ${normalizedId} (${title || 'nomi topilmadi'})`);

      // Fon rejimda — barcha sessionlarga auto-join
      setTimeout(() => {
        this.syncPriorityGroupsToAllSessions().catch((e) =>
          this.logger.warn(`Priority auto-join (add) xato: ${e.message}`),
        );
      }, 2000);
    }
    return list;
  }

  // ============================================================
  // PRIORITY GROUPS AUTO-JOIN
  // ============================================================

  private prioritySyncInProgress = false;

  /**
   * Barcha aktiv sessionlarni barcha priority guruhlarga avto-qo'shish.
   * Donor session (guruhda bor) invite-link chiqaradi → yetishmayotgan sessionlar qo'shiladi.
   */
  async syncPriorityGroupsToAllSessions(): Promise<void> {
    if (this.prioritySyncInProgress) {
      this.logger.debug('Priority sync hali ishlayapti, o\'tkazib yuborildi');
      return;
    }
    this.prioritySyncInProgress = true;

    try {
      const list = await this.getPriorityGroupsList();
      if (!list.length) return;
      if (this.connectedSessions.size < 2) {
        this.logger.debug(`Priority sync: ${this.connectedSessions.size} ta session ulangan, kamida 2 ta kerak`);
        return;
      }

      // 1-qadam: har session qaysi guruhlarda borligini olish + phone/username
      const sessionGroups = new Map<string, Set<string>>();
      const sessionInfo = new Map<string, { phone?: string; username?: string | null }>();

      // DB'dan session phone olish
      const dbSessions = await this.prisma.monitorSession.findMany({
        where: { id: { in: Array.from(this.connectedSessions) } },
        select: { id: true, phone: true },
      });
      for (const s of dbSessions) {
        sessionInfo.set(s.id, { phone: s.phone || undefined });
      }

      for (const sid of this.connectedSessions) {
        try {
          const ids: string[] = await this.sendToSession(sid, 'getJoinedGroupIds');
          sessionGroups.set(sid, new Set(ids.map((i) => this.normalizeGroupId(i))));
        } catch (e: any) {
          this.logger.warn(`getJoinedGroupIds ${sid.slice(-8)}: ${e.message}`);
        }
      }

      let joined = 0;
      let skippedAll = 0;
      let failed = 0;

      // 2-qadam: har priority guruh bo'yicha
      for (const pg of list) {
        const normPgId = this.normalizeGroupId(pg.groupTelegramId);
        const donors: string[] = [];
        const missing: string[] = [];

        for (const sid of this.connectedSessions) {
          const set = sessionGroups.get(sid);
          if (!set) continue;
          if (set.has(normPgId)) donors.push(sid);
          else missing.push(sid);
        }

        if (!missing.length) {
          skippedAll++;
          continue;
        }
        if (!donors.length) {
          this.logger.warn(`Priority "${pg.title || normPgId}" — donor session yo'q (hech kim bu guruhda emas)`);
          failed++;
          continue;
        }

        // 3-qadam: yetishmayotgan sessionlarni qo'shish
        // STRATEGIYA:
        //   1) Donor session TARGET session'ni telefon/username orqali TO'G'RIDAN-TO'G'RI qo'shadi
        //      (admin tasdiqi kerak emas, USER_ALREADY_PARTICIPANT bo'lsa ham OK)
        //   2) Agar direct invite ishlamasa (CHAT_ADMIN_REQUIRED va h.k.), invite-link/username fallback

        let cachedInvite: { hash?: string; link?: string; username?: string } | null = null;

        for (const missingSid of missing) {
          const targetInfo = sessionInfo.get(missingSid);
          let success = false;
          let alreadyIn = false;
          let lastError = '';

          // Method 1: Direct invite via donor (admin tasdiqsiz)
          if (targetInfo?.phone || targetInfo?.username) {
            for (const donorSid of donors) {
              try {
                const result = await this.sendToSession(donorSid, 'inviteUserToGroup', {
                  groupTelegramId: pg.groupTelegramId,
                  targetPhone: targetInfo?.phone,
                  targetUsername: targetInfo?.username,
                });
                if (result?.already) alreadyIn = true;
                success = true;
                this.logger.log(
                  `✅ ${donorSid.slice(-8)} → ${missingSid.slice(-8)} ni "${pg.title || normPgId}" ga qo'shdi (direct)`,
                );
                break;
              } catch (e: any) {
                lastError = e.message || '';
                // CHAT_ADMIN_REQUIRED, USERS_TOO_MUCH — keyingi donorni sinab ko'rish shart emas
                if (
                  lastError.includes('CHAT_ADMIN_REQUIRED') ||
                  lastError.includes('USERS_TOO_MUCH') ||
                  lastError.includes('USER_PRIVACY_RESTRICTED')
                ) {
                  break;
                }
              }
            }
          }

          // Method 2: Invite link / username (fallback)
          if (!success) {
            if (!cachedInvite) {
              for (const donorSid of donors) {
                try {
                  cachedInvite = await this.sendToSession(donorSid, 'exportInvite', {
                    groupTelegramId: pg.groupTelegramId,
                  });
                  if (cachedInvite?.hash || cachedInvite?.username) break;
                } catch {
                  // davom etamiz
                }
              }
            }

            if (cachedInvite?.hash) {
              try {
                const r = await this.sendToSession(missingSid, 'joinByInvite', {
                  inviteHash: cachedInvite.hash,
                });
                success = true;
                if (r?.already) alreadyIn = true;
                this.logger.log(
                  `✅ ${missingSid.slice(-8)} → "${pg.title || normPgId}" ga qo'shildi (invite-link)`,
                );
              } catch (e: any) {
                lastError = e.message || lastError;
              }
            } else if (cachedInvite?.username) {
              try {
                const r = await this.sendToSession(missingSid, 'joinByUsername', {
                  username: cachedInvite.username,
                });
                success = true;
                if (r?.already) alreadyIn = true;
                this.logger.log(
                  `✅ ${missingSid.slice(-8)} → "${pg.title || normPgId}" ga qo'shildi (username)`,
                );
              } catch (e: any) {
                lastError = e.message || lastError;
              }
            }
          }

          if (success && !alreadyIn) {
            joined++;
            sessionGroups.get(missingSid)?.add(normPgId);
            // Flood'dan qochish — har qo'shilish orasida 45s
            await new Promise((r) => setTimeout(r, 45_000));
          } else if (success && alreadyIn) {
            sessionGroups.get(missingSid)?.add(normPgId);
          } else {
            this.logger.warn(`❌ ${missingSid.slice(-8)} → "${pg.title}": ${lastError}`);
            failed++;

            // FLOOD — bu session uchun 5 min kutish
            if (
              lastError.includes('FLOOD_WAIT') ||
              lastError.includes('PEER_FLOOD') ||
              lastError.includes('TOO_MANY_CHANNELS')
            ) {
              this.logger.warn(`${missingSid.slice(-8)}: flood, 5 min kutilmoqda`);
              await new Promise((r) => setTimeout(r, 5 * 60_000));
            }
          }
        }
      }

      this.logger.log(
        `Priority sync: ${joined} yangi qo'shildi, ${skippedAll} guruhda hammasi bor, ${failed} xato`,
      );
    } finally {
      this.prioritySyncInProgress = false;
    }
  }

  /**
   * Manual trigger — dashboard tugmasidan
   */
  async triggerPrioritySync() {
    if (this.prioritySyncInProgress) {
      return { ok: false, message: 'Sync hozir ishlayapti' };
    }
    this.syncPriorityGroupsToAllSessions().catch((e) =>
      this.logger.warn(`Manual priority sync: ${e.message}`),
    );
    return { ok: true, message: 'Sync boshlandi (fon rejimda)' };
  }

  async removePriorityGroup(groupTelegramId: string) {
    const list = await this.getPriorityGroupsList();
    const normalizedId = this.normalizeGroupId(groupTelegramId);
    const filtered = list.filter((g) => this.normalizeGroupId(g.groupTelegramId) !== normalizedId);
    await this.savePriorityGroupsList(filtered);
    return filtered;
  }

  private async updatePriorityGroupTitle(groupTelegramId: string, title: string) {
    const list = await this.getPriorityGroupsList();
    const normalizedId = this.normalizeGroupId(groupTelegramId);
    const group = list.find((g) => this.normalizeGroupId(g.groupTelegramId) === normalizedId);
    if (group && !group.title && title) {
      group.title = title;
      await this.savePriorityGroupsList(list);
      this.logger.log(`Priority guruh nomi yangilandi: ${normalizedId} → ${title}`);
    }
  }

  // ============================================================
  // SESSION CRUD
  // ============================================================

  /**
   * Delete monitor session — disconnect in worker + DB update
   */
  async deleteSession(id: string) {
    // Kill worker process
    if (this.connectedSessions.has(id)) {
      const child = this.childProcesses.get(id);
      if (child) {
        try {
          await this.sendToSession(id, 'disconnect');
        } catch {}
        try { child.kill(); } catch {}
        this.childProcesses.delete(id);
      }
      this.connectedSessions.delete(id);
      this.lastWorkerActivity.delete(id);
    }

    // Clean up pending auth (main thread)
    const pending = this.pendingAuths.get(id);
    if (pending) {
      try { await pending.client.disconnect(); } catch {}
      this.pendingAuths.delete(id);
    }

    return this.prisma.monitorSession.update({
      where: { id },
      data: { status: MonitorSessionStatus.DELETED },
    });
  }

  /**
   * Get session stats
   */
  async getStats(userId: string, role?: string, businessModule = 'LOGISTIKA') {
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
    const scope: any = { businessModule, ...(isAdmin ? {} : { userId }) };
    const [totalSessions, activeSessions, totalOrders, newOrders] = await Promise.all([
      this.prisma.monitorSession.count({
        where: { ...scope, status: { not: MonitorSessionStatus.DELETED } },
      }),
      this.prisma.monitorSession.count({
        where: { ...scope, status: MonitorSessionStatus.ACTIVE },
      }),
      this.prisma.order.count({ where: { ...scope } }),
      this.prisma.order.count({ where: { ...scope, status: OrderStatus.NEW } }),
    ]);

    return { totalSessions, activeSessions, totalOrders, newOrders };
  }

  /**
   * Check if a session is connected (local tracking, no worker call)
   */
  isConnected(sessionId: string): boolean {
    return this.connectedSessions.has(sessionId);
  }

  /**
   * Check if there's a pending auth
   */
  hasPendingAuth(sessionId: string): boolean {
    return this.pendingAuths.has(sessionId);
  }

  /**
   * Resolve user accessHash from monitor session entity caches.
   * If specificSessionId given, tries it first (most likely to have the entity).
   * Then tries remaining connected sessions.
   */
  async resolveUser(telegramId: string, specificSessionId?: string): Promise<{ id: string; accessHash: string } | null> {
    const sessionsToTry: string[] = [];
    if (specificSessionId && this.childProcesses.has(specificSessionId)) {
      sessionsToTry.push(specificSessionId);
    }
    for (const [sid] of this.childProcesses) {
      if (!sessionsToTry.includes(sid)) sessionsToTry.push(sid);
    }

    this.logger.log(`resolveUser: ${telegramId}, sessions=${sessionsToTry.length}, specific=${specificSessionId?.slice(-8) || 'none'}`);

    for (const sessionId of sessionsToTry) {
      try {
        const result = await this.sendToSession(sessionId, 'resolveUser', { telegramId });
        if (result?.accessHash) {
          this.logger.log(`resolveUser OK: ${telegramId} -> session ${sessionId.slice(-8)}, hash=${result.accessHash.slice(0, 8)}...`);
          return result;
        }
      } catch (err: any) {
        this.logger.debug(`resolveUser miss: ${telegramId} @ ${sessionId.slice(-8)} — ${err.message}`);
      }
    }
    this.logger.warn(`resolveUser FAIL: ${telegramId} — hech bir sessionda topilmadi`);
    return null;
  }

}
