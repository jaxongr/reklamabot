import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { TelegramService } from '../telegram/telegram.service';

// ==================== INTERFACES ====================

interface PostingJob {
  id: string;
  adId: string;
  adContent: string;
  userId: string;
  status: 'running' | 'paused' | 'stopped' | 'completed';
  startTime: Date;
  endTime?: Date;
  totalGroups: number;
  postedGroups: number;
  failedGroups: number;
  skippedGroups: number;
  roundsCompleted: number;
  logs: PostingLog[];
  stopRequested: boolean;
  pauseRequested: boolean;
}

interface PostingLog {
  timestamp: Date;
  sessionId: string;
  sessionName: string;
  groupName: string;
  groupId: string;
  status: 'success' | 'failed' | 'skipped';
  reason?: string;
  duration?: number;
}

interface GroupInfo {
  id: string;
  telegramId: string;
  name: string;
  sessionId: string;
  sessionName: string;
  lastPostAt?: Date | null;
}

interface SessionFloodState {
  floodCount: number;
  lastFloodAt: Date | null;
  messagesSent: number;
  cooldownUntil: Date | null;
  consecutiveErrors: number;
}

// ==================== ANTI-SPAM SOZLAMALARI ====================

// Guruhlar orasidagi delay (soniya)
const MIN_GROUP_DELAY_MS = 5_000;   // 5 soniya minimum
const MAX_GROUP_DELAY_MS = 20_000;  // 20 soniya maximum

// Roundlar orasidagi pauza (daqiqa)
const ROUND_PAUSE_MS = 15 * 60 * 1000; // 15 daqiqa

// Har session uchun xabarlar orasida minimal interval
const MIN_SESSION_INTERVAL_MS = 8_000; // 8 soniya (bitta session uchun)

// Session uchun doimiy xabar limiti (keyin cooldown)
const SESSION_MESSAGE_LIMIT = 30;       // 30 xabar
const SESSION_COOLDOWN_MS = 5 * 60 * 1000; // 5 daqiqa cooldown

// FLOOD_WAIT ogohlantirish chegarasi
const MAX_FLOOD_PER_SESSION = 3;        // 3 ta FLOOD keyin session muzlatiladi
const FLOOD_FREEZE_MS = 30 * 60 * 1000; // 30 daqiqa muzlatish

// Ketma-ket xato chegarasi
const MAX_CONSECUTIVE_ERRORS = 5;       // 5 ta ketma-ket xato = session pauza

// Guruh cooldown — yaqinda yozilgan guruhga qayta yozmaslik
const GROUP_COOLDOWN_MS = 10 * 60 * 1000; // 10 daqiqa

// Periodic uzun pauza (tabiiy ko'rinish uchun)
const LONG_PAUSE_INTERVAL = 10;          // Har 10 ta xabardan keyin
const LONG_PAUSE_MIN_MS = 30_000;        // 30 soniya
const LONG_PAUSE_MAX_MS = 90_000;        // 90 soniya

@Injectable()
export class PostingService {
  private readonly logger = new Logger(PostingService.name);
  private activeJobs = new Map<string, PostingJob>();
  private jobTimers = new Map<string, NodeJS.Timeout>();
  private sessionStates = new Map<string, SessionFloodState>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramService: TelegramService,
  ) {}

  // ==================== SESSION FLOOD TRACKING ====================

  private getSessionState(sessionId: string): SessionFloodState {
    if (!this.sessionStates.has(sessionId)) {
      this.sessionStates.set(sessionId, {
        floodCount: 0,
        lastFloodAt: null,
        messagesSent: 0,
        cooldownUntil: null,
        consecutiveErrors: 0,
      });
    }
    return this.sessionStates.get(sessionId)!;
  }

  private isSessionCoolingDown(sessionId: string): boolean {
    const state = this.getSessionState(sessionId);
    if (state.cooldownUntil && state.cooldownUntil > new Date()) {
      return true;
    }
    if (state.cooldownUntil && state.cooldownUntil <= new Date()) {
      // Cooldown tugadi — reset
      state.cooldownUntil = null;
      state.messagesSent = 0;
    }
    return false;
  }

  private recordSuccess(sessionId: string): void {
    const state = this.getSessionState(sessionId);
    state.messagesSent++;
    state.consecutiveErrors = 0;

    // Session message limitga yetdimi?
    if (state.messagesSent >= SESSION_MESSAGE_LIMIT) {
      state.cooldownUntil = new Date(Date.now() + SESSION_COOLDOWN_MS);
      state.messagesSent = 0;
      this.logger.log(
        `Session ${sessionId.slice(0, 8)}... ${SESSION_MESSAGE_LIMIT} xabar yubordi — ` +
        `${SESSION_COOLDOWN_MS / 60000} daqiqa cooldown`,
      );
    }
  }

  private recordFlood(sessionId: string, waitSeconds: number): void {
    const state = this.getSessionState(sessionId);
    state.floodCount++;
    state.lastFloodAt = new Date();
    state.consecutiveErrors++;

    this.logger.warn(
      `FLOOD_WAIT ${waitSeconds}s — session ${sessionId.slice(0, 8)}... ` +
      `(flood #${state.floodCount})`,
    );

    // Ko'p flood = session muzlatish
    if (state.floodCount >= MAX_FLOOD_PER_SESSION) {
      state.cooldownUntil = new Date(Date.now() + FLOOD_FREEZE_MS);
      this.logger.warn(
        `Session ${sessionId.slice(0, 8)}... muzlatildi (${state.floodCount} ta FLOOD). ` +
        `${FLOOD_FREEZE_MS / 60000} daqiqa kutadi.`,
      );
    }
  }

  private recordError(sessionId: string): void {
    const state = this.getSessionState(sessionId);
    state.consecutiveErrors++;

    if (state.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
      // 5 ta ketma-ket xato — session pauza
      state.cooldownUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 min
      state.consecutiveErrors = 0;
      this.logger.warn(
        `Session ${sessionId.slice(0, 8)}... ${MAX_CONSECUTIVE_ERRORS} ta ketma-ket xato — 5 min pauza`,
      );
    }
  }

  // ==================== GURUH COOLDOWN ====================

  private isGroupOnCooldown(group: GroupInfo): boolean {
    if (!group.lastPostAt) return false;
    const lastPost = new Date(group.lastPostAt).getTime();
    return (Date.now() - lastPost) < GROUP_COOLDOWN_MS;
  }

  // ==================== ASOSIY TARQATISH ====================

  async startPosting(adId: string, adContent: string, userId: string): Promise<PostingJob> {
    const sessions = await this.prisma.session.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        isFrozen: false,
        sessionString: { not: null },
      },
      include: {
        groups: {
          where: {
            isActive: true,
            isSkipped: false,
          },
        },
      },
    });

    if (sessions.length === 0) {
      throw new Error('Faol session topilmadi. Iltimos, avval session ulang.');
    }

    // Ulangan sessionlarni tekshirish va ulash
    for (const session of sessions) {
      if (!this.telegramService.isClientConnected(session.id)) {
        try {
          await this.telegramService.connectSession(session.id);
        } catch (error) {
          this.logger.warn(`Session ulanmadi: ${session.id} — ${error.message}`);
        }
      }
    }

    const connectedSessions = sessions.filter(s =>
      this.telegramService.isClientConnected(s.id),
    );

    if (connectedSessions.length === 0) {
      throw new Error('Hech bir session ulanmadi. Sessionlarni tekshiring.');
    }

    // Barcha ulangan sessionlardagi guruhlarni yig'ish
    const allGroups: GroupInfo[] = [];
    for (const session of connectedSessions) {
      for (const group of session.groups) {
        allGroups.push({
          id: group.id,
          telegramId: group.telegramId,
          name: group.title || 'Nomsiz',
          sessionId: session.id,
          sessionName: session.name || session.phone || 'Session',
          lastPostAt: group.lastPostAt,
        });
      }
    }

    if (allGroups.length === 0) {
      throw new Error(
        `${connectedSessions.length} ta session bor, lekin guruhlar topilmadi. ` +
        'Avval guruhlarni sinxronlang.',
      );
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const job: PostingJob = {
      id: jobId,
      adId,
      adContent,
      userId,
      status: 'running',
      startTime: new Date(),
      totalGroups: allGroups.length,
      postedGroups: 0,
      failedGroups: 0,
      skippedGroups: 0,
      roundsCompleted: 0,
      logs: [],
      stopRequested: false,
      pauseRequested: false,
    };

    this.activeJobs.set(jobId, job);

    this.logger.log(
      `🚀 Tarqatish boshlandi: ${jobId}\n` +
      `   Sessions: ${connectedSessions.length}\n` +
      `   Guruhlar: ${allGroups.length}\n` +
      `   Delay: ${MIN_GROUP_DELAY_MS / 1000}-${MAX_GROUP_DELAY_MS / 1000}s\n` +
      `   Round pauza: ${ROUND_PAUSE_MS / 60000} daqiqa\n` +
      `   Session limit: ${SESSION_MESSAGE_LIMIT} xabar → ${SESSION_COOLDOWN_MS / 60000} min cooldown`,
    );

    // Background da ishga tushirish
    this.runPostingLoop(jobId, allGroups);

    return job;
  }

  /**
   * Asosiy tarqatish tsikli
   */
  private async runPostingLoop(jobId: string, groups: GroupInfo[]): Promise<void> {
    const job = this.activeJobs.get(jobId);
    if (!job) return;

    while (true) {
      if (job.stopRequested) {
        job.status = 'stopped';
        job.endTime = new Date();
        this.logger.log(`⏹ Job to'xtatildi: ${jobId}`);
        break;
      }

      if (job.pauseRequested) {
        job.status = 'paused';
        await this.delay(5000);
        continue;
      }

      // Guruhlarni aralashtirish (har round yangi tartib)
      const shuffled = this.shuffleArray([...groups]);

      // Round boshlash
      await this.postRound(job, shuffled);

      if (job.stopRequested) {
        job.status = 'stopped';
        job.endTime = new Date();
        break;
      }

      // Round orasidagi pauza (random 12-18 daqiqa)
      const roundPause = this.getRandomDelay(
        ROUND_PAUSE_MS - 3 * 60_000,
        ROUND_PAUSE_MS + 3 * 60_000,
      );

      this.logger.log(
        `🔄 Round #${job.roundsCompleted} tugadi. ` +
        `${Math.floor(roundPause / 60000)} daqiqa pauza...\n` +
        `   ✅ Yuborildi: ${job.postedGroups}\n` +
        `   ❌ Xato: ${job.failedGroups}\n` +
        `   ⏭ O'tkazildi: ${job.skippedGroups}`,
      );

      // Pauza (har 2 soniyada stop tekshiramiz)
      const pauseEnd = Date.now() + roundPause;
      while (Date.now() < pauseEnd) {
        if (job.stopRequested) break;
        await this.delay(2000);
      }
    }
  }

  /**
   * Bitta round — barcha guruhlarga PARALLEL yuborish (har session o'z guruhlarini)
   */
  private async postRound(job: PostingJob, groups: GroupInfo[]): Promise<void> {
    const roundStart = Date.now();

    // Guruhlarni session bo'yicha guruhlash
    const groupsBySession = new Map<string, GroupInfo[]>();
    for (const group of groups) {
      const existing = groupsBySession.get(group.sessionId) || [];
      existing.push(group);
      groupsBySession.set(group.sessionId, existing);
    }

    this.logger.log(
      `🔄 Round #${job.roundsCompleted + 1} boshlandi — ` +
      `${groupsBySession.size} ta session PARALLEL, jami ${groups.length} guruh`,
    );

    // Barcha sessionlarni parallel ishga tushirish
    const sessionTasks = Array.from(groupsBySession.entries()).map(
      ([sessionId, sessionGroups]) =>
        this.postSessionGroups(job, sessionId, this.shuffleArray([...sessionGroups])),
    );

    const results = await Promise.allSettled(sessionTasks);

    // Natijalarni yig'ish
    let totalPosted = 0;
    for (const result of results) {
      if (result.status === 'fulfilled') {
        totalPosted += result.value;
      } else {
        this.logger.error(`Session task xatolik: ${result.reason}`);
      }
    }

    const roundDuration = Math.floor((Date.now() - roundStart) / 1000);
    job.roundsCompleted++;

    this.logger.log(
      `✅ Round #${job.roundsCompleted} — ${roundDuration}s — ` +
      `Yuborildi: ${totalPosted}`,
    );
  }

  /**
   * Bitta session guruhlariga ketma-ket yuborish (anti-spam delay bilan)
   */
  private async postSessionGroups(
    job: PostingJob,
    sessionId: string,
    groups: GroupInfo[],
  ): Promise<number> {
    let messageCount = 0;

    for (let i = 0; i < groups.length; i++) {
      if (job.stopRequested) break;

      // Pause tekshirish
      if (job.pauseRequested) {
        while (job.pauseRequested && !job.stopRequested) {
          await this.delay(2000);
        }
        if (job.stopRequested) break;
      }

      const group = groups[i];

      // ===== 1. Guruh cooldown tekshirish =====
      if (this.isGroupOnCooldown(group)) {
        job.skippedGroups++;
        job.logs.push({
          timestamp: new Date(),
          sessionId: group.sessionId,
          sessionName: group.sessionName,
          groupName: group.name,
          groupId: group.id,
          status: 'skipped',
          reason: `Cooldown (${GROUP_COOLDOWN_MS / 60000} daqiqa o'tmagan)`,
        });
        continue;
      }

      // ===== 2. Session cooldown tekshirish =====
      if (this.isSessionCoolingDown(group.sessionId)) {
        job.skippedGroups++;
        job.logs.push({
          timestamp: new Date(),
          sessionId: group.sessionId,
          sessionName: group.sessionName,
          groupName: group.name,
          groupId: group.id,
          status: 'skipped',
          reason: 'Session cooldown',
        });
        continue;
      }

      // ===== 3. Xabar yuborish =====
      const result = await this.postToGroup(job, group);
      if (result.success) {
        job.postedGroups++;
        messageCount++;
        this.recordSuccess(group.sessionId);

        // Guruh lastPostAt yangilash
        group.lastPostAt = new Date();
      } else {
        job.failedGroups++;
      }
      job.logs.push(result.log);

      // Loglar chegaralash
      if (job.logs.length > 500) {
        job.logs = job.logs.slice(-300);
      }

      // ===== 4. Anti-spam delaylar =====
      if (i < groups.length - 1 && !job.stopRequested) {
        // Har N xabardan keyin uzun pauza (tabiiy ko'rinish)
        if (messageCount > 0 && messageCount % LONG_PAUSE_INTERVAL === 0) {
          const longPause = this.getRandomDelay(LONG_PAUSE_MIN_MS, LONG_PAUSE_MAX_MS);
          this.logger.log(
            `⏸ Session ${sessionId.slice(0, 8)}... ${messageCount} xabar — ` +
            `${Math.floor(longPause / 1000)}s uzun pauza`,
          );
          await this.delay(longPause);
        } else {
          // Oddiy random delay
          const delay = this.getRandomDelay(MIN_GROUP_DELAY_MS, MAX_GROUP_DELAY_MS);
          await this.delay(delay);
        }
      }
    }

    return messageCount;
  }

  /**
   * Bitta guruhga xabar yuborish (barcha xatolarni boshqaradi)
   */
  private async postToGroup(
    job: PostingJob,
    group: GroupInfo,
  ): Promise<{ success: boolean; log: PostingLog }> {
    const startTime = Date.now();

    try {
      // Session ulangan mi
      if (!this.telegramService.isClientConnected(group.sessionId)) {
        try {
          await this.telegramService.connectSession(group.sessionId);
        } catch {
          this.recordError(group.sessionId);
          return {
            success: false,
            log: {
              timestamp: new Date(),
              sessionId: group.sessionId,
              sessionName: group.sessionName,
              groupName: group.name,
              groupId: group.id,
              status: 'skipped',
              reason: 'Session ulangan emas',
            },
          };
        }
      }

      // Xabar yuborish
      await this.telegramService.sendMessage(
        group.sessionId,
        group.telegramId,
        job.adContent,
      );

      // DB yangilash
      await this.prisma.group.update({
        where: { id: group.id },
        data: { lastPostAt: new Date() },
      }).catch(() => {});

      return {
        success: true,
        log: {
          timestamp: new Date(),
          sessionId: group.sessionId,
          sessionName: group.sessionName,
          groupName: group.name,
          groupId: group.id,
          status: 'success',
          duration: Date.now() - startTime,
        },
      };
    } catch (error: any) {
      const errorMsg = error.message || 'Noma\'lum xatolik';

      // ======== FLOOD_WAIT ========
      if (errorMsg.startsWith('FLOOD_WAIT:')) {
        const waitSeconds = parseInt(errorMsg.split(':')[1]) || 60;
        this.recordFlood(group.sessionId, waitSeconds);

        if (waitSeconds <= 60) {
          // 1 daqiqagacha — kutamiz
          this.logger.log(`⏳ FLOOD_WAIT ${waitSeconds}s kutmoqda...`);
          await this.delay(waitSeconds * 1000);
        } else {
          // Katta flood — session cooldown
          const state = this.getSessionState(group.sessionId);
          state.cooldownUntil = new Date(Date.now() + waitSeconds * 1000);
          this.logger.warn(
            `🚫 FLOOD_WAIT ${waitSeconds}s — session ${group.sessionName} pauzada`,
          );
        }

        return {
          success: false,
          log: {
            timestamp: new Date(),
            sessionId: group.sessionId,
            sessionName: group.sessionName,
            groupName: group.name,
            groupId: group.id,
            status: 'failed',
            reason: `FLOOD_WAIT ${waitSeconds}s`,
            duration: Date.now() - startTime,
          },
        };
      }

      // ======== SLOWMODE_WAIT ========
      if (errorMsg.includes('SLOWMODE_WAIT') || errorMsg.includes('slowmode')) {
        const match = errorMsg.match(/(\d+)/);
        const waitSeconds = match ? parseInt(match[1]) : 300;

        this.logger.log(
          `⏳ SLOWMODE ${waitSeconds}s — guruh: ${group.name}`,
        );

        // Guruhga slowmode belgilash
        await this.prisma.group.update({
          where: { id: group.id },
          data: {
            hasRestrictions: true,
            skipReason: `Slowmode ${waitSeconds}s`,
          },
        }).catch(() => {});

        return {
          success: false,
          log: {
            timestamp: new Date(),
            sessionId: group.sessionId,
            sessionName: group.sessionName,
            groupName: group.name,
            groupId: group.id,
            status: 'skipped',
            reason: `SLOWMODE ${waitSeconds}s`,
          },
        };
      }

      // ======== YOZISH TAQIQLANGAN ========
      if (errorMsg.startsWith('WRITE_FORBIDDEN:')) {
        await this.prisma.group.update({
          where: { id: group.id },
          data: {
            hasRestrictions: true,
            isSkipped: true,
            skipReason: 'Yozish taqiqlangan',
          },
        }).catch(() => {});

        this.logger.log(`🚫 WRITE_FORBIDDEN — guruh: ${group.name}`);

        return {
          success: false,
          log: {
            timestamp: new Date(),
            sessionId: group.sessionId,
            sessionName: group.sessionName,
            groupName: group.name,
            groupId: group.id,
            status: 'skipped',
            reason: 'Yozish taqiqlangan',
          },
        };
      }

      // ======== SESSION O'LGAN ========
      if (errorMsg.startsWith('SESSION_DEAD:')) {
        const state = this.getSessionState(group.sessionId);
        state.cooldownUntil = new Date(Date.now() + 999 * 60 * 60 * 1000); // Doimiy cooldown
        this.logger.error(`💀 Session o'lgan: ${group.sessionName}`);

        return {
          success: false,
          log: {
            timestamp: new Date(),
            sessionId: group.sessionId,
            sessionName: group.sessionName,
            groupName: group.name,
            groupId: group.id,
            status: 'failed',
            reason: 'Session o\'lgan',
          },
        };
      }

      // ======== CHAT_RESTRICTED / MEMBER_REQUIRED ========
      if (
        errorMsg.includes('CHAT_RESTRICTED') ||
        errorMsg.includes('CHAT_SEND_PLAIN_FORBIDDEN') ||
        errorMsg.includes('CHAT_GUEST_SEND_FORBIDDEN') ||
        errorMsg.includes('PREMIUM_ACCOUNT_REQUIRED')
      ) {
        await this.prisma.group.update({
          where: { id: group.id },
          data: {
            hasRestrictions: true,
            isSkipped: true,
            skipReason: 'Cheklangan guruh',
          },
        }).catch(() => {});

        return {
          success: false,
          log: {
            timestamp: new Date(),
            sessionId: group.sessionId,
            sessionName: group.sessionName,
            groupName: group.name,
            groupId: group.id,
            status: 'skipped',
            reason: 'Cheklangan guruh (a\'zo emas/restricted)',
          },
        };
      }

      // ======== BOSHQA XATOLAR ========
      this.recordError(group.sessionId);

      return {
        success: false,
        log: {
          timestamp: new Date(),
          sessionId: group.sessionId,
          sessionName: group.sessionName,
          groupName: group.name,
          groupId: group.id,
          status: 'failed',
          reason: errorMsg,
          duration: Date.now() - startTime,
        },
      };
    }
  }

  // ==================== UTILITY ====================

  private getRandomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==================== JOB MANAGEMENT ====================

  getJob(jobId: string): PostingJob | undefined {
    return this.activeJobs.get(jobId);
  }

  getUserJobs(userId: string): PostingJob[] {
    return Array.from(this.activeJobs.values()).filter(j => j.userId === userId);
  }

  stopJob(jobId: string): void {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.stopRequested = true;
      this.logger.log(`⏹ To'xtatish so'raldi: ${jobId}`);
    }
  }

  pauseJob(jobId: string): void {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.pauseRequested = true;
      job.status = 'paused';
      this.logger.log(`⏸ Pauza so'raldi: ${jobId}`);
    }
  }

  resumeJob(jobId: string): void {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.pauseRequested = false;
      job.status = 'running';
      this.logger.log(`▶ Davom ettirildi: ${jobId}`);
    }
  }

  getJobLogs(jobId: string): PostingLog[] {
    const job = this.activeJobs.get(jobId);
    return job?.logs || [];
  }

  getJobStats(jobId: string): {
    totalGroups: number;
    postedGroups: number;
    failedGroups: number;
    skippedGroups: number;
    roundsCompleted: number;
    duration: number;
    successRate: number;
  } | undefined {
    const job = this.activeJobs.get(jobId);
    if (!job) return undefined;

    const duration = job.endTime
      ? job.endTime.getTime() - job.startTime.getTime()
      : Date.now() - job.startTime.getTime();

    const totalAttempts = job.postedGroups + job.failedGroups;

    return {
      totalGroups: job.totalGroups,
      postedGroups: job.postedGroups,
      failedGroups: job.failedGroups,
      skippedGroups: job.skippedGroups,
      roundsCompleted: job.roundsCompleted,
      duration,
      successRate: totalAttempts > 0 ? (job.postedGroups / totalAttempts) * 100 : 0,
    };
  }

  cleanupJob(jobId: string): void {
    const timer = this.jobTimers.get(jobId);
    if (timer) {
      clearTimeout(timer);
      this.jobTimers.delete(jobId);
    }
    this.activeJobs.delete(jobId);
    this.logger.log(`🗑 Job tozalandi: ${jobId}`);
  }
}
