import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { TelegramService } from '../telegram/telegram.service';
import { SystemConfigService } from '../common/system-config.service';

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
  safeMode: boolean;
  // Live progress
  onProgress?: () => void;
  nextRoundAt?: Date;
  currentRound?: number;
  perSessionStats: Map<string, SessionPostingStats>;
  // Message tracking
  postIds?: Map<string, string>; // sessionId → Post.id
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

interface SessionPostingStats {
  name: string;
  sent: number;
  failed: number;
  skipped: number;
  totalGroups: number;
}

interface GroupInfo {
  id: string;
  telegramId: string;
  name: string;
  sessionId: string;
  sessionName: string;
  lastPostAt?: Date | null;
}

// ==================== BROADCAST BOT INTERVALLAR ====================
//
// Oddiy rejim: 0.3-6 sekund (guruhlar orasida), 5 daqiqa (round orasida)
// Himoyalangan rejim: 1-15 sekund (guruhlar orasida), 10 daqiqa (round orasida)
//
// WRITE_FORBIDDEN / USER_BANNED / ADD_USER → doimiy block (tashlab o'tish)
// SLOWMODE → vaqti tugaguncha tashlab o'tish, keyin qayta yuborish
// FLOOD_WAIT → kichik: skip, katta: guruh block

// Oddiy rejim (loop posting — ehtiyotkor)
const NORMAL_MIN_DELAY = 300;     // 0.3s
const NORMAL_MAX_DELAY = 6000;    // 6s
const NORMAL_ROUND_PAUSE = 5 * 60 * 1000; // 5 daqiqa

// BroadcastOnce rejimi (findDriver — tezkor, 1 round)
// Telegram anti-spam: juda tez yuborsa SLOWMODE_WAIT beradi
// 3-5s orasida — xavfsiz va barqaror
const BROADCAST_MIN_DELAY = 1200;  // 1.2s
const BROADCAST_MAX_DELAY = 2500;  // 2.5s

// Himoyalangan rejim
const SAFE_MIN_DELAY = 1000;      // 1s
const SAFE_MAX_DELAY = 15000;     // 15s
const SAFE_ROUND_PAUSE = 10 * 60 * 1000; // 10 daqiqa

// FLOOD thresholds
const NORMAL_FLOOD_MAX_WAIT = 300;  // 5 daqiqa
const SAFE_FLOOD_MAX_WAIT = 600;    // 10 daqiqa

// Zero-width belgilar (xabar variatsiyasi — ban himoyasi)
const INVISIBLE_CHARS = ['\u200B', '\u200C', '\u200D', '\uFEFF'];

// Progress har N ta guruhda yangilanadi
const PROGRESS_EVERY_N = 1;

@Injectable()
export class PostingService {
  private readonly logger = new Logger(PostingService.name);
  private activeJobs = new Map<string, PostingJob>();
  private jobTimers = new Map<string, NodeJS.Timeout>();

  // Bloklangan guruhlar (broadcast bot kabi — in-memory Set)
  // sessionId → Set<groupTelegramId>
  private blockedGroups = new Map<string, Set<string>>();

  // Master/tobe broadcast uchun
  // slaveUserId → broadcastId (unique — yangi broadcast eskisini to'xtatadi)
  private activeBroadcasts = new Map<string, string>();

  // BroadcastOnce cancel uchun: userId → cancelled flag
  private broadcastOnceCancelled = new Set<string>();

  // BroadcastOnce faol holati: userId → progress (mobile reconnect uchun)
  private broadcastOnceStatus = new Map<string, {
    orderId: string;
    sent: number;
    failed: number;
    skipped: number;
    total: number;
    sessionCount: number;
    uniqueGroupsSent: number;
    status: 'in_progress' | 'completed';
    startedAt: number;
  }>();

  // SLOWMODE guruhlar: groupTelegramId → timestamp (qachon qayta yuborish mumkin)
  // Vaqti tugasa — keyingi roundda yuboriladi
  private slowmodeGroups = new Map<string, number>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramService: TelegramService,
    private readonly systemConfigService: SystemConfigService,
  ) {}

  // ==================== ANTI-BAN HELPERS ====================

  /**
   * Xabar oxiriga ko'rinmas belgilar qo'shish (har guruhga unique)
   * Telegram hash tekshiruvidan o'tadi — bir xil xabar yuborilmaydi
   */
  private addMessageVariation(text: string, groupIndex: number): string {
    let suffix = '';
    let idx = groupIndex;
    for (let i = 0; i < 4; i++) {
      suffix += INVISIBLE_CHARS[idx % INVISIBLE_CHARS.length];
      idx = Math.floor(idx / INVISIBLE_CHARS.length) + i + 1;
    }
    const extraCount = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < extraCount; i++) {
      suffix += INVISIBLE_CHARS[Math.floor(Math.random() * INVISIBLE_CHARS.length)];
    }
    return text + suffix;
  }

  /**
   * SLOWMODE guruh vaqti tugadimi tekshirish
   */
  private isSlowmodeExpired(groupKey: string): boolean {
    const until = this.slowmodeGroups.get(groupKey);
    if (!until) return true; // slowmode yo'q = o'tish mumkin
    if (Date.now() >= until) {
      this.slowmodeGroups.delete(groupKey);
      return true; // vaqti tugadi
    }
    return false; // hali kutish kerak
  }

  /**
   * SLOWMODE guruhni belgilash
   */
  private markSlowmode(groupKey: string, waitSeconds: number): void {
    this.slowmodeGroups.set(groupKey, Date.now() + waitSeconds * 1000);
  }

  // ==================== BLOCKED GROUPS ====================

  private isGroupBlocked(sessionId: string, groupTelegramId: string): boolean {
    const blocked = this.blockedGroups.get(sessionId);
    return blocked ? blocked.has(groupTelegramId) : false;
  }

  private blockGroup(sessionId: string, groupTelegramId: string): void {
    if (!this.blockedGroups.has(sessionId)) {
      this.blockedGroups.set(sessionId, new Set());
    }
    this.blockedGroups.get(sessionId)!.add(groupTelegramId);
  }

  /** Bloklangan guruhlar sonini olish */
  getBlockedCount(sessionId?: string): number {
    if (sessionId) {
      return this.blockedGroups.get(sessionId)?.size || 0;
    }
    let total = 0;
    for (const set of this.blockedGroups.values()) {
      total += set.size;
    }
    return total;
  }

  /** Bloklangan guruhlarni tozalash (yangi tarqatish uchun) */
  clearBlockedGroups(sessionId?: string): void {
    if (sessionId) {
      this.blockedGroups.delete(sessionId);
    } else {
      this.blockedGroups.clear();
    }
  }

  // ==================== ASOSIY TARQATISH ====================

  async startPosting(
    adId: string,
    adContent: string,
    userId: string,
    sessionIds?: string[],
    safeMode: boolean = false,
  ): Promise<PostingJob> {
    const where: any = {
      userId,
      status: 'ACTIVE',
      isFrozen: false,
      sessionString: { not: null },
    };

    if (sessionIds && sessionIds.length > 0) {
      where.id = { in: sessionIds };
    }

    const sessions = await this.prisma.session.findMany({
      where,
      include: {
        groups: {
          where: { isActive: true },
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

    // Qora ro'yxatdagi guruhlarni olish
    const blacklistedGroups = await this.systemConfigService.getBlacklistedGroups(userId);
    const blacklistedIds = new Set(blacklistedGroups.map(g => g.groupTelegramId));

    // Barcha ulangan sessionlardagi guruhlarni yig'ish
    const allGroups: GroupInfo[] = [];
    for (const session of connectedSessions) {
      for (const group of session.groups) {
        // Bloklangan guruhlarni o'tkazib yuborish
        if (this.isGroupBlocked(session.id, group.telegramId)) continue;
        // Qora ro'yxatdagi guruhlarni o'tkazib yuborish
        if (blacklistedIds.has(group.telegramId)) continue;

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

    // Per-session statistika
    const perSessionStats = new Map<string, SessionPostingStats>();
    for (const session of connectedSessions) {
      const groupCount = allGroups.filter(g => g.sessionId === session.id).length;
      perSessionStats.set(session.id, {
        name: session.name || session.phone || 'Session',
        sent: 0,
        failed: 0,
        skipped: 0,
        totalGroups: groupCount,
      });
    }

    const modeLabel = safeMode ? 'HIMOYALANGAN' : 'ODDIY';
    const minDelay = safeMode ? SAFE_MIN_DELAY : NORMAL_MIN_DELAY;
    const maxDelay = safeMode ? SAFE_MAX_DELAY : NORMAL_MAX_DELAY;
    const roundPause = safeMode ? SAFE_ROUND_PAUSE : NORMAL_ROUND_PAUSE;

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
      safeMode,
      perSessionStats,
    };

    this.activeJobs.set(jobId, job);

    this.logger.log(
      `🚀 Tarqatish boshlandi [${modeLabel}]: ${jobId}\n` +
      `   Sessions: ${connectedSessions.length}\n` +
      `   Guruhlar: ${allGroups.length}\n` +
      `   Delay: ${minDelay / 1000}-${maxDelay / 1000}s\n` +
      `   Round pauza: ${roundPause / 60000} daqiqa`,
    );

    // Background da ishga tushirish
    this.runPostingLoop(jobId, allGroups, connectedSessions.map(s => s.id));

    return job;
  }

  /**
   * Asosiy tarqatish tsikli — cheksiz roundlar (to'xtatilguncha)
   * Broadcast bot logikasi: group replacement, flood=skip
   */
  private async runPostingLoop(jobId: string, initialGroups: GroupInfo[], sessionIds: string[]): Promise<void> {
    const job = this.activeJobs.get(jobId);
    if (!job) return;

    const roundPause = job.safeMode ? SAFE_ROUND_PAUSE : NORMAL_ROUND_PAUSE;

    while (true) {
      if (job.stopRequested) {
        job.status = 'stopped';
        job.endTime = new Date();
        job.nextRoundAt = undefined;
        this.emitProgress(job);
        this.logger.log(`⏹ Job to'xtatildi: ${jobId}`);
        this.cleanupJob(jobId);
        return;
      }

      if (job.pauseRequested) {
        job.status = 'paused';
        await this.delay(5000);
        continue;
      }

      // ===== GROUP REPLACEMENT (broadcast bot line 671-682) =====
      // Har round boshida: blocked guruhlarni olib tashlash, yangilarini qo'shish
      const groups = await this.getGroupsWithReplacement(initialGroups, sessionIds);

      if (groups.length === 0) {
        this.logger.warn(`🛑 Barcha guruhlar bloklangan. To'xtatildi: ${jobId}`);
        job.status = 'stopped';
        job.endTime = new Date();
        job.nextRoundAt = undefined;
        this.emitProgress(job);
        this.cleanupJob(jobId);
        return;
      }

      // Guruhlarni aralashtirish (har round yangi tartib)
      const shuffled = this.shuffleArray([...groups]);

      // Round boshlash
      job.currentRound = job.roundsCompleted + 1;
      job.totalGroups = shuffled.length;
      this.emitProgress(job);
      await this.postRound(job, shuffled);

      if (job.stopRequested) {
        job.status = 'stopped';
        job.endTime = new Date();
        job.nextRoundAt = undefined;
        this.emitProgress(job);
        break;
      }

      job.roundsCompleted++;
      job.currentRound = job.roundsCompleted;

      this.logger.log(
        `🔄 Round #${job.roundsCompleted} tugadi. ` +
        `✅${job.postedGroups} ❌${job.failedGroups} ⏭${job.skippedGroups}`,
      );

      // Round orasidagi pauza (broadcast bot kabi — daqiqama-daqiqa)
      this.logger.log(`⏸ ${roundPause / 60000} daqiqa pauza...`);

      const pauseEnd = Date.now() + roundPause;
      job.nextRoundAt = new Date(pauseEnd);
      this.emitProgress(job);

      while (Date.now() < pauseEnd) {
        if (job.stopRequested) break;
        await this.delay(2000);
      }
      job.nextRoundAt = undefined;
    }
  }

  /**
   * Group replacement logikasi (broadcast bot kabi)
   * Blocked guruhlar o'rniga DB dan yangilarini olish
   */
  private async getGroupsWithReplacement(
    selectedGroups: GroupInfo[],
    sessionIds: string[],
  ): Promise<GroupInfo[]> {
    // 1. Bloklangan guruhlarni filtrlash
    const activeGroups = selectedGroups.filter(
      g => !this.isGroupBlocked(g.sessionId, g.telegramId),
    );

    const blockedCount = selectedGroups.length - activeGroups.length;
    if (blockedCount === 0) return activeGroups;

    // 2. Har bir session uchun extra guruhlar olish
    const selectedTelegramIds = new Set(selectedGroups.map(g => g.telegramId));
    const extraGroups: GroupInfo[] = [];

    for (const sessionId of sessionIds) {
      const sessionBlocked = this.blockedGroups.get(sessionId);
      const sessionSelectedCount = selectedGroups.filter(g => g.sessionId === sessionId).length;
      const sessionActiveCount = activeGroups.filter(g => g.sessionId === sessionId).length;
      const neededExtra = sessionSelectedCount - sessionActiveCount;

      if (neededExtra <= 0) continue;

      // DB dan extra guruhlar olish (tanlanganlarda yo'q, active, not blocked)
      const blockedIds = sessionBlocked ? Array.from(sessionBlocked) : [];
      const dbGroups = await this.prisma.group.findMany({
        where: {
          sessionId,
          isActive: true,
          isSkipped: false,
          telegramId: {
            notIn: [...Array.from(selectedTelegramIds), ...blockedIds],
          },
        },
        take: neededExtra,
        include: {
          session: { select: { name: true, phone: true } },
        },
      });

      for (const g of dbGroups) {
        extraGroups.push({
          id: g.id,
          telegramId: g.telegramId,
          name: g.title || 'Nomsiz',
          sessionId: g.sessionId,
          sessionName: g.session?.name || g.session?.phone || 'Session',
          lastPostAt: g.lastPostAt,
        });
      }
    }

    if (extraGroups.length > 0) {
      this.logger.log(
        `🔄 Group replacement: ${blockedCount} blocked, ${extraGroups.length} yangi qo'shildi`,
      );
    }

    return [...activeGroups, ...extraGroups];
  }

  /**
   * Bitta round — barcha sessionlar PARALLEL
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
      `🔄 Round #${(job.roundsCompleted || 0) + 1} boshlandi — ` +
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
    this.emitProgress(job);

    this.logger.log(
      `✅ Round — ${roundDuration}s — Yuborildi: ${totalPosted}`,
    );
  }

  /**
   * Bitta session guruhlariga ketma-ket yuborish
   * - Tezlik avvalgidek (0.3-6s oddiy, 1-15s xavfsiz)
   * - SLOWMODE guruhlar vaqti tugaguncha tashlab o'tiladi
   * - Bloklangan guruhlar tashlab o'tiladi
   */
  private async postSessionGroups(
    job: PostingJob,
    sessionId: string,
    groups: GroupInfo[],
  ): Promise<number> {
    let messageCount = 0;
    const minDelay = job.safeMode ? SAFE_MIN_DELAY : NORMAL_MIN_DELAY;
    const maxDelay = job.safeMode ? SAFE_MAX_DELAY : NORMAL_MAX_DELAY;
    let processedCount = 0;

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
      const sessionStat = job.perSessionStats.get(group.sessionId);

      // Bloklangan guruhni o'tkazish
      if (this.isGroupBlocked(group.sessionId, group.telegramId)) {
        job.skippedGroups++;
        if (sessionStat) sessionStat.skipped++;
        processedCount++;
        continue;
      }

      // SLOWMODE vaqti tugamagan guruhni tashlab o'tish
      const slowKey = `${group.sessionId}:${group.telegramId}`;
      if (!this.isSlowmodeExpired(slowKey)) {
        job.skippedGroups++;
        if (sessionStat) sessionStat.skipped++;
        processedCount++;
        continue;
      }

      // Xabar yuborish (variatsiya bilan)
      const result = await this.postToGroup(job, group, i);
      if (result.success) {
        job.postedGroups++;
        messageCount++;
        if (sessionStat) sessionStat.sent++;
      } else if (result.log.status === 'skipped') {
        job.skippedGroups++;
        if (sessionStat) sessionStat.skipped++;
      } else {
        job.failedGroups++;
        if (sessionStat) sessionStat.failed++;
      }
      job.logs.push(result.log);

      // Loglar chegaralash
      if (job.logs.length > 500) {
        job.logs = job.logs.slice(-300);
      }

      processedCount++;

      // Progress har PROGRESS_EVERY_N ta guruhda
      if (processedCount % PROGRESS_EVERY_N === 0 || processedCount === groups.length) {
        this.emitProgress(job);
      }

      // Delay (avvalgidek)
      if (i < groups.length - 1 && !job.stopRequested) {
        const delay = this.getRandomDelay(minDelay, maxDelay);
        await this.delay(delay);
      }
    }

    return messageCount;
  }

  /**
   * Bitta guruhga xabar yuborish
   * ANTI-BAN: FLOOD_WAIT = DOIM KUTISH, xabar variatsiyasi
   */
  private async postToGroup(
    job: PostingJob,
    group: GroupInfo,
    groupIndex: number = 0,
  ): Promise<{ success: boolean; log: PostingLog }> {
    const startTime = Date.now();

    try {
      // Session ulangan mi
      if (!this.telegramService.isClientConnected(group.sessionId)) {
        try {
          await this.telegramService.connectSession(group.sessionId);
        } catch {
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

      // Xabar variatsiyasi — har guruhga unique invisible chars
      const variedMessage = this.addMessageVariation(job.adContent, groupIndex + Date.now() % 1000);

      const sendResult = await this.telegramService.sendMessage(
        group.sessionId,
        group.telegramId,
        variedMessage,
      );

      // DB yangilash
      await this.prisma.group.update({
        where: { id: group.id },
        data: { lastPostAt: new Date() },
      }).catch(() => {});

      // MessageId saqlash — keyinroq o'chirish uchun
      if (sendResult?.messageId) {
        this.savePostHistory(job, group, sendResult.messageId).catch(() => {});
      }

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

      // ======== FLOOD_WAIT — skip (tezlikni sekinlashtirmaslik) ========
      if (errorMsg.startsWith('FLOOD_WAIT:')) {
        const waitSeconds = parseInt(errorMsg.split(':')[1]) || 60;
        const maxWait = job.safeMode ? SAFE_FLOOD_MAX_WAIT : NORMAL_FLOOD_MAX_WAIT;

        if (waitSeconds > maxWait) {
          // Katta flood — guruhni bloklash
          this.blockGroup(group.sessionId, group.telegramId);
          this.logger.warn(
            `🚫 FLOOD_WAIT ${waitSeconds}s > ${maxWait}s — guruh bloklandi: ${group.name}`,
          );
        } else {
          // Oddiy flood — SKIP
          this.logger.warn(`⏭ FLOOD_WAIT ${waitSeconds}s — SKIP: ${group.name}`);
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

      // ======== YOZISH TAQIQLANGAN (broadcast bot kabi — doimiy block) ========
      if (
        errorMsg.includes('WRITE_FORBIDDEN') ||
        errorMsg.includes('CHAT_WRITE_FORBIDDEN') ||
        errorMsg.includes('USER_BANNED') ||
        errorMsg.includes('CHANNEL_PRIVATE') ||
        errorMsg.includes('CHAT_ADMIN_REQUIRED') ||
        errorMsg.includes('need to add') ||
        errorMsg.includes('ADD_USER') ||
        errorMsg.includes('INVITE')
      ) {
        this.blockGroup(group.sessionId, group.telegramId);
        this.logger.log(`🚫 Bloklandi: ${group.name} — ${errorMsg}`);

        return {
          success: false,
          log: {
            timestamp: new Date(),
            sessionId: group.sessionId,
            sessionName: group.sessionName,
            groupName: group.name,
            groupId: group.id,
            status: 'skipped',
            reason: errorMsg,
          },
        };
      }

      // ======== SLOWMODE — vaqti tugaguncha tashlab o'tish, keyin qayta yuborish ========
      if (errorMsg.includes('SLOWMODE_WAIT') || errorMsg.includes('slowmode')) {
        // SLOWMODE_WAIT:300 dan vaqtni olish
        const slowMatch = errorMsg.match(/(\d+)/);
        const slowSeconds = slowMatch ? parseInt(slowMatch[1]) : 300;
        const slowKey = `${group.sessionId}:${group.telegramId}`;
        this.markSlowmode(slowKey, slowSeconds);
        this.logger.log(`⏳ SLOWMODE ${slowSeconds}s — tashlab o'tildi, keyingi roundda qayta: ${group.name}`);

        return {
          success: false,
          log: {
            timestamp: new Date(),
            sessionId: group.sessionId,
            sessionName: group.sessionName,
            groupName: group.name,
            groupId: group.id,
            status: 'skipped',
            reason: `Slowmode ${slowSeconds}s`,
          },
        };
      }

      // ======== CHANNEL_INVALID ========
      if (errorMsg.includes('CHANNEL_INVALID')) {
        this.blockGroup(group.sessionId, group.telegramId);

        return {
          success: false,
          log: {
            timestamp: new Date(),
            sessionId: group.sessionId,
            sessionName: group.sessionName,
            groupName: group.name,
            groupId: group.id,
            status: 'skipped',
            reason: 'Kanal yaroqsiz',
          },
        };
      }

      // ======== SESSION O'LGAN ========
      if (errorMsg.startsWith('SESSION_DEAD:')) {
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

      // ======== CHAT_RESTRICTED ========
      if (
        errorMsg.includes('CHAT_RESTRICTED') ||
        errorMsg.includes('CHAT_SEND_PLAIN_FORBIDDEN') ||
        errorMsg.includes('CHAT_GUEST_SEND_FORBIDDEN') ||
        errorMsg.includes('PREMIUM_ACCOUNT_REQUIRED')
      ) {
        this.blockGroup(group.sessionId, group.telegramId);

        return {
          success: false,
          log: {
            timestamp: new Date(),
            sessionId: group.sessionId,
            sessionName: group.sessionName,
            groupName: group.name,
            groupId: group.id,
            status: 'skipped',
            reason: 'Cheklangan guruh',
          },
        };
      }

      // ======== BOSHQA XATOLAR ========
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

  // ==================== BROADCAST ONCE (Haydovchi topish) ====================

  /**
   * Bir martalik tarqatish — barcha guruxlarga 1 ta round
   * Haydovchi topish uchun ishlatiladi
   */
  async broadcastOnce(
    content: string,
    userId: string,
    orderId?: string,
    onProgress?: (payload: {
      status: 'in_progress' | 'completed' | 'error';
      sent: number;
      failed: number;
      skipped: number;
      total: number;
      sessionCount: number;
      uniqueGroupsSent: number;
    }) => void,
  ): Promise<{ sent: number; failed: number; skipped: number; total: number; sessionCount: number; uniqueGroupsSent: number }> {
    // 1. Foydalanuvchi ulagan faol sessionlarni topish
    const sessions = await this.prisma.session.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        isFrozen: false,
        sessionString: { not: null },
      },
      include: {
        groups: { where: { isActive: true } },
      },
    });

    if (sessions.length === 0) {
      throw new Error('Faol session topilmadi. Avval session ulang.');
    }

    // 2. Ulash — PARALLEL (10+ session tezkor)
    await Promise.allSettled(
      sessions.map((session) =>
        !this.telegramService.isClientConnected(session.id)
          ? this.telegramService.connectSession(session.id).catch((error) => {
              this.logger.warn(`BroadcastOnce session ulanmadi: ${session.id} — ${error.message}`);
            })
          : Promise.resolve(),
      ),
    );

    const connectedSessions = sessions.filter(s =>
      this.telegramService.isClientConnected(s.id),
    );

    if (connectedSessions.length === 0) {
      throw new Error('Hech bir session ulanmadi.');
    }

    // 3. Qora ro'yxatni olish
    const blacklistedGroups = await this.systemConfigService.getBlacklistedGroups(userId);
    const blacklistedIds = new Set(blacklistedGroups.map(g => g.groupTelegramId));

    // 4. Guruhlarni yig'ish — HAR BIR guruh uchun BARCHA sessionlar
    // Agar Session A fail bo'lsa → Session B, Session C orqali urinish
    const groupSessionsMap = new Map<string, { groupId: string; telegramId: string; name: string; sessions: string[] }>();
    const sessionNames = new Map<string, string>();
    for (const session of connectedSessions) {
      sessionNames.set(session.id, session.name || session.phone || 'Session');
      for (const group of session.groups) {
        // Qora ro'yxatdagi guruhlarni o'tkazib yuborish
        if (blacklistedIds.has(group.telegramId)) continue;

        const existing = groupSessionsMap.get(group.telegramId);
        if (existing) {
          if (!existing.sessions.includes(session.id)) {
            existing.sessions.push(session.id);
          }
        } else {
          groupSessionsMap.set(group.telegramId, {
            groupId: group.id,
            telegramId: group.telegramId,
            name: group.title || 'Nomsiz',
            sessions: [session.id],
          });
        }
      }
    }
    const allGroups = Array.from(groupSessionsMap.values());

    if (allGroups.length === 0) {
      throw new Error('Guruhlar topilmadi.');
    }

    // 4. Shuffle + 1 round
    const shuffled = this.shuffleArray([...allGroups]);
    const progress = { sent: 0, failed: 0, skipped: 0 };
    const sentGroupIds = new Set<string>();
    const totalGroups = shuffled.length;
    const sessionCount = connectedSessions.length;

    // Cancel flag tozalash
    this.broadcastOnceCancelled.delete(userId);
    const isCancelled = () => this.broadcastOnceCancelled.has(userId);

    this.logger.log(
      `📢 BroadcastOnce boshlandi: ${totalGroups} guruh, ${sessionCount} session`,
    );

    // Helper: emit progress + status saqlash
    const emitProgress = (status: 'in_progress' | 'completed' | 'error' = 'in_progress') => {
      const payload = {
        status: status as 'in_progress' | 'completed',
        sent: progress.sent,
        failed: progress.failed,
        skipped: progress.skipped,
        total: totalGroups,
        sessionCount,
        uniqueGroupsSent: sentGroupIds.size,
      };
      this.broadcastOnceStatus.set(userId, {
        orderId: orderId || '',
        ...payload,
        startedAt: Date.now(),
      });
      if (onProgress) {
        onProgress(payload);
      }
    };

    emitProgress('in_progress');

    // DB batch update uchun
    const sentGroupDbIds: string[] = [];
    // Retry uchun — SLOWMODE bo'lgan guruhlar
    const retryGroups: { telegramId: string; groupId: string; name: string; failedSessionId: string; otherSessions: string[]; slowSec: number }[] = [];

    // Per-session yuborish sanagichi — round-robin uchun
    const sessionSendCount = new Map<string, number>();
    for (const s of connectedSessions) {
      sessionSendCount.set(s.id, 0);
    }

    // Session tanlash — eng kam yuborgan sessionni tanlash (round-robin)
    const pickBestSession = (sessionIds: string[]): string[] => {
      const connected = sessionIds.filter(id => this.telegramService.isClientConnected(id));
      // Eng kam ishlatilganini birinchi qo'yish
      connected.sort((a, b) => (sessionSendCount.get(a) || 0) - (sessionSendCount.get(b) || 0));
      return connected;
    };

    // BAN bo'lgan guruhlarni DB da deactivate qilish uchun
    const deactivateGroupIds: string[] = [];

    // ═══════════════════════ 1-PASS ═══════════════════════
    // Sequential yuborish — har bir guruhdan keyin progress emit
    const floodedSessions = new Set<string>(); // FLOOD_WAIT olgan sessionlar

    for (let i = 0; i < shuffled.length; i++) {
      if (isCancelled()) break;

      const group = shuffled[i];
      if (sentGroupIds.has(group.telegramId)) continue;

      let sent = false;
      let slowmodeInfo: { sessionId: string; slowSec: number } | null = null;
      let bannedCount = 0;

      // Sessionlarni round-robin tartibda sinash (FLOOD olganlarini chetlashtirish)
      const orderedSessions = pickBestSession(group.sessions)
        .filter(sid => !floodedSessions.has(sid));

      if (orderedSessions.length === 0) {
        progress.skipped++;
        emitProgress('in_progress');
        continue;
      }

      for (const sessionId of orderedSessions) {
        if (sent) break;

        try {
          const variedMessage = this.addMessageVariation(content, i + Date.now() % 1000);
          await this.telegramService.sendMessage(sessionId, group.telegramId, variedMessage);
          progress.sent++;
          sentGroupIds.add(group.telegramId);
          sentGroupDbIds.push(group.groupId);
          sessionSendCount.set(sessionId, (sessionSendCount.get(sessionId) || 0) + 1);
          sent = true;
        } catch (error: any) {
          const errorMsg = error.message || '';

          if (errorMsg.includes('SLOWMODE_WAIT') || errorMsg.includes('slowmode')) {
            const secMatch = errorMsg.match(/(\d+)/);
            const waitSec = secMatch ? parseInt(secMatch[1]) : 60;
            if (!slowmodeInfo || waitSec < slowmodeInfo.slowSec) {
              slowmodeInfo = { sessionId, slowSec: waitSec };
            }
          } else if (errorMsg.includes('FLOOD_WAIT')) {
            const secMatch = errorMsg.match(/(\d+)/);
            const waitSec = secMatch ? parseInt(secMatch[1]) : 60;
            this.logger.warn(`📢 FLOOD_WAIT ${waitSec}s — session ${sessionId.slice(-6)}`);
            floodedSessions.add(sessionId);
            if (!slowmodeInfo || waitSec < slowmodeInfo.slowSec) {
              slowmodeInfo = { sessionId, slowSec: waitSec };
            }
          } else if (
            errorMsg.includes('USER_BANNED') ||
            errorMsg.includes('WRITE_FORBIDDEN') ||
            errorMsg.includes('CHANNEL_PRIVATE') ||
            errorMsg.includes('CHAT_ADMIN_REQUIRED') ||
            errorMsg.includes('CHANNEL_INVALID') ||
            errorMsg.includes('CHAT_RESTRICTED') ||
            errorMsg.includes('CHAT_SEND_PLAIN_FORBIDDEN') ||
            errorMsg.includes('CHAT_GUEST_SEND_FORBIDDEN')
          ) {
            bannedCount++;
            continue;
          } else {
            progress.failed++;
            sent = true;
          }
        }
      }

      // Hech bir session yubora olmadi
      if (!sent) {
        if (slowmodeInfo && slowmodeInfo.slowSec <= 300) {
          retryGroups.push({
            telegramId: group.telegramId,
            groupId: group.groupId,
            name: group.name,
            failedSessionId: slowmodeInfo.sessionId,
            otherSessions: group.sessions.filter(s => s !== slowmodeInfo!.sessionId),
            slowSec: slowmodeInfo.slowSec,
          });
        } else if (bannedCount > 0 && bannedCount >= orderedSessions.length) {
          // Barcha sessionlarda BAN/INVALID — guruhni deaktivatsiya
          deactivateGroupIds.push(group.groupId);
          progress.skipped++;
        } else {
          progress.skipped++;
        }
      }

      // Har bir guruhdan keyin progress emit (mobile sanashi uchun)
      emitProgress('in_progress');

      // Delay — Telegram anti-spam dan himoya
      if (i < shuffled.length - 1 && sent) {
        await this.delay(this.getRandomDelay(BROADCAST_MIN_DELAY, BROADCAST_MAX_DELAY));
      }
    }

    // Barcha sessionlarda BAN/FORBIDDEN guruhlarni DB da isActive=false
    if (deactivateGroupIds.length > 0) {
      this.logger.warn(
        `📢 BroadcastOnce: ${deactivateGroupIds.length} ta guruh barcha sessionlarda BAN — isActive=false`,
      );
      this.prisma.group.updateMany({
        where: { id: { in: deactivateGroupIds } },
        data: { isActive: false },
      }).catch(() => {});
    }

    this.logger.log(
      `📢 BroadcastOnce 1-pass: ✅${progress.sent} ⏭${progress.skipped} ❌${progress.failed} / ${totalGroups}, retry=${retryGroups.length}`,
    );

    // ═══════════════════════ RETRY ROUND ═══════════════════════
    // SLOWMODE guruhlarni kutib qayta yuborish
    if (retryGroups.length > 0 && !isCancelled()) {
      const sortedRetry = [...retryGroups].sort((a, b) => a.slowSec - b.slowSec);
      const minSec = sortedRetry[0]?.slowSec || 30;
      const maxSec = sortedRetry[sortedRetry.length - 1]?.slowSec || 60;

      this.logger.log(
        `📢 BroadcastOnce RETRY: ${retryGroups.length} ta guruh (${minSec}-${maxSec}s slowmode)`,
      );
      emitProgress('in_progress');

      let retrySent = 0;
      let retrySkipped = 0;
      const retryStartTime = Date.now();

      for (let i = 0; i < sortedRetry.length; i++) {
        if (isCancelled()) {
          progress.skipped += sortedRetry.length - i;
          retrySkipped += sortedRetry.length - i;
          break;
        }

        const rg = sortedRetry[i];
        if (sentGroupIds.has(rg.telegramId)) continue;

        // Slowmode kutish
        const elapsedMs = Date.now() - retryStartTime;
        const waitMs = Math.max(0, rg.slowSec * 1000 - elapsedMs + 3000);

        if (waitMs > 300000) {
          progress.skipped++;
          retrySkipped++;
          continue;
        }

        if (waitMs > 0) {
          await this.delay(waitMs);
        }

        // Original session bilan qayta sinash
        let sent = false;
        const sessionsToTry = [rg.failedSessionId, ...rg.otherSessions];

        for (const sessionId of sessionsToTry) {
          if (sent) break;
          if (!this.telegramService.isClientConnected(sessionId)) continue;

          try {
            const variedMessage = this.addMessageVariation(content, i + Date.now() % 1000);
            await this.telegramService.sendMessage(sessionId, rg.telegramId, variedMessage);
            progress.sent++;
            retrySent++;
            sentGroupIds.add(rg.telegramId);
            sentGroupDbIds.push(rg.groupId);
            sent = true;
          } catch {
            // Retry da ham fail — keyingi session
          }
        }

        if (!sent) {
          progress.skipped++;
          retrySkipped++;
        }

        emitProgress('in_progress');
      }

      this.logger.log(
        `📢 BroadcastOnce RETRY tugadi: ✅${retrySent} ⏭${retrySkipped} / ${retryGroups.length}`,
      );
    }

    // Batch DB update — bir marta barcha guruhlar uchun
    if (sentGroupDbIds.length > 0) {
      this.prisma.group.updateMany({
        where: { id: { in: sentGroupDbIds } },
        data: { lastPostAt: new Date() },
      }).catch(() => {});
    }

    this.logger.log(
      `📢 BroadcastOnce tugadi: ✅${progress.sent} ❌${progress.failed} ⏭${progress.skipped} / ${totalGroups}`,
    );

    // Emit completed
    emitProgress('completed');

    // 60s keyin in-memory state tozalash
    setTimeout(() => this.broadcastOnceStatus.delete(userId), 60_000);

    return {
      sent: progress.sent,
      failed: progress.failed,
      skipped: progress.skipped,
      total: totalGroups,
      sessionCount,
      uniqueGroupsSent: sentGroupIds.size,
    };
  }

  // ==================== MASTER/TOBE BROADCAST ====================

  /**
   * Master broadcast — barcha tobe'lar orqali tarqatish
   * Broadcast bot masterBroadcast ning to'liq logikasi
   */
  async masterBroadcast(
    masterUserId: string,
    message: string,
    safeMode: boolean = false,
    reportCallback?: (text: string) => void,
  ): Promise<{ readyCount: number; totalSlaves: number; totalGroups: number }> {
    // Master ning barcha tobe'larini olish
    const tobes = await this.prisma.user.findMany({
      where: { masterId: masterUserId },
      include: {
        sessions: {
          where: { status: 'ACTIVE', sessionString: { not: null } },
          include: {
            groups: { where: { isActive: true } },
          },
        },
      },
    });

    if (tobes.length === 0) {
      throw new Error('Sizga ulangan tobe akkauntlar yo\'q!');
    }

    // Tayyor tobe'lar: session + groups bor
    const readyTobes = tobes.filter(
      t => t.sessions.length > 0 && t.sessions.some(s => s.groups.length > 0),
    );

    if (readyTobes.length === 0) {
      throw new Error(
        `Tayyor tobe akkauntlar yo'q!\n` +
        `Jami tobe'lar: ${tobes.length} ta\n` +
        `Tobe'lar session ulashi va guruhlar tanlashi kerak.`,
      );
    }

    const totalGroups = readyTobes.reduce(
      (sum, t) => sum + t.sessions.reduce((s, sess) => s + sess.groups.length, 0),
      0,
    );

    // Har bir tobe uchun broadcastMessage saqlash va slaveBroadcast boshlash
    for (const tobe of readyTobes) {
      // broadcastMessage yangilash
      await this.prisma.user.update({
        where: { id: tobe.id },
        data: { broadcastMessage: message },
      });

      // slaveBroadcast async ishga tushirish
      this.slaveBroadcast(tobe.id, message, safeMode, reportCallback).catch(err => {
        this.logger.error(`Slave broadcast xatolik (${tobe.id}): ${err.message}`);
      });
    }

    return {
      readyCount: readyTobes.length,
      totalSlaves: tobes.length,
      totalGroups,
    };
  }

  /**
   * Slave broadcast — bitta tobe uchun cheksiz tarqatish
   * Broadcast bot startSlaveBroadcast ning to'liq logikasi
   */
  async slaveBroadcast(
    slaveUserId: string,
    message: string,
    safeMode: boolean = false,
    reportCallback?: (text: string) => void,
  ): Promise<{ totalRounds: number; totalSent: number; totalFailed: number }> {
    const pauseMinutes = safeMode ? 10 : 5;
    const minDelay = safeMode ? SAFE_MIN_DELAY : NORMAL_MIN_DELAY;
    const maxDelay = safeMode ? SAFE_MAX_DELAY : NORMAL_MAX_DELAY;

    // Unikal broadcast ID — yangi broadcast eskisini avtomatik to'xtatadi
    const broadcastId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    this.activeBroadcasts.set(slaveUserId, broadcastId);

    let roundCount = 0;
    let totalSent = 0;
    let totalFailed = 0;

    this.logger.log(`[SLAVE ${slaveUserId}] Broadcast ${broadcastId} boshlandi (${safeMode ? 'SAFE' : 'NORMAL'})`);

    const isActive = () => this.activeBroadcasts.get(slaveUserId) === broadcastId;

    try {
      // Slave sessionlarini olish va ulash
      const sessions = await this.prisma.session.findMany({
        where: { userId: slaveUserId, status: 'ACTIVE', sessionString: { not: null } },
        include: { groups: { where: { isActive: true } } },
      });

      if (sessions.length === 0) {
        this.logger.warn(`[SLAVE ${slaveUserId}] Session topilmadi`);
        return { totalRounds: 0, totalSent: 0, totalFailed: 0 };
      }

      // Sessionlarni ulash
      for (const session of sessions) {
        if (!this.telegramService.isClientConnected(session.id)) {
          try {
            await this.telegramService.connectSession(session.id);
          } catch (err) {
            this.logger.warn(`[SLAVE ${slaveUserId}] Session ulanmadi: ${session.id}`);
          }
        }
      }

      // CHEKSIZ LOOP — master to'xtatguncha yoki yangi broadcast boshlanguncha
      while (isActive()) {
        roundCount++;
        let sent = 0;
        let failed = 0;
        const roundStart = Date.now();

        this.logger.log(`[SLAVE ${slaveUserId}] Round ${roundCount} boshlandi`);

        // Barcha sessiyalardan guruhlarni yig'ish (blocked olib tashlash)
        for (const session of sessions) {
          if (!isActive()) break;
          if (!this.telegramService.isClientConnected(session.id)) continue;

          const sessionBlocked = this.blockedGroups.get(session.id) || new Set();
          const groupsToSend = session.groups.filter(g => !sessionBlocked.has(g.telegramId));

          for (let gi = 0; gi < this.shuffleArray([...groupsToSend]).length; gi++) {
            if (!isActive()) break;
            const group = groupsToSend[gi];

            // SLOWMODE vaqti tugamagan — tashlab o'tish
            const slowKey = `${session.id}:${group.telegramId}`;
            if (!this.isSlowmodeExpired(slowKey)) continue;

            try {
              // Xabar variatsiyasi (ban himoyasi)
              const variedMessage = this.addMessageVariation(message, gi + Date.now() % 1000);
              await this.telegramService.sendMessage(session.id, group.telegramId, variedMessage);
              sent++;
            } catch (err: any) {
              const errMsg = err.message || '';

              // Bloklash logikasi (doimiy block)
              if (
                errMsg.includes('WRITE_FORBIDDEN') ||
                errMsg.includes('USER_BANNED') ||
                errMsg.includes('CHANNEL_PRIVATE') ||
                errMsg.includes('CHAT_ADMIN_REQUIRED') ||
                errMsg.includes('need to add') ||
                errMsg.includes('ADD_USER') ||
                errMsg.includes('INVITE')
              ) {
                this.blockGroup(session.id, group.telegramId);
              } else if (errMsg.startsWith('FLOOD_WAIT:')) {
                const waitSec = parseInt(errMsg.split(':')[1]) || 60;
                const maxWait = safeMode ? SAFE_FLOOD_MAX_WAIT : NORMAL_FLOOD_MAX_WAIT;
                if (waitSec > maxWait) {
                  this.blockGroup(session.id, group.telegramId);
                }
                // FLOOD = SKIP
              } else if (errMsg.includes('SLOWMODE_WAIT') || errMsg.includes('slowmode')) {
                // SLOWMODE — vaqtli tashlab o'tish
                const slowMatch = errMsg.match(/(\d+)/);
                const slowSec = slowMatch ? parseInt(slowMatch[1]) : 300;
                this.markSlowmode(slowKey, slowSec);
              } else if (errMsg.includes('SESSION_DEAD')) {
                this.logger.error(`[SLAVE ${slaveUserId}] Session o'lgan: ${session.id}`);
                break;
              }

              failed++;
            }

            // Delay (avvalgidek)
            await this.delay(this.getRandomDelay(minDelay, maxDelay));
          }
        }

        const duration = Math.round((Date.now() - roundStart) / 1000);
        totalSent += sent;
        totalFailed += failed;

        this.logger.log(
          `[SLAVE ${slaveUserId}] Round ${roundCount} tugadi: sent=${sent}, failed=${failed}, ${duration}s`,
        );

        // Masterga round hisoboti
        if (reportCallback) {
          reportCallback(
            `📊 Tobe ${roundCount}-raund\n\n` +
            `📤 Yuborildi: ${sent}\n` +
            `❌ Xato: ${failed}\n` +
            `⏱ ${duration} sek\n` +
            `⏳ Keyingi: ${pauseMinutes} daq`,
          );
        }

        if (!isActive()) break;

        // PAUZA (broadcast bot kabi — daqiqama-daqiqa)
        for (let m = 0; m < pauseMinutes; m++) {
          if (!isActive()) break;
          await this.delay(60000);
        }
      }
    } catch (error: any) {
      this.logger.error(`[SLAVE ${slaveUserId}] Broadcast xatolik: ${error.message}`);
    }

    // Tozalash
    if (isActive()) {
      this.activeBroadcasts.delete(slaveUserId);
    }

    this.logger.log(
      `[SLAVE ${slaveUserId}] Broadcast ${broadcastId} to'xtatildi. Roundlar: ${roundCount}`,
    );

    return { totalRounds: roundCount, totalSent, totalFailed };
  }

  /**
   * Master barcha tobe'larni to'xtatish
   */
  async stopAllSlaves(masterUserId: string): Promise<number> {
    const tobes = await this.prisma.user.findMany({
      where: { masterId: masterUserId },
      select: { id: true },
    });

    let stoppedCount = 0;
    for (const tobe of tobes) {
      if (this.activeBroadcasts.has(tobe.id)) {
        this.activeBroadcasts.delete(tobe.id);
        stoppedCount++;
      }
    }

    // Master ning o'z job'larini ham to'xtatish
    const masterJobs = this.getUserJobs(masterUserId);
    for (const job of masterJobs) {
      if (job.status === 'running' || job.status === 'paused') {
        this.stopJob(job.id);
        stoppedCount++;
      }
    }

    return stoppedCount;
  }

  /**
   * Slave broadcast faolmi
   */
  isSlaveBroadcasting(slaveUserId: string): boolean {
    return this.activeBroadcasts.has(slaveUserId);
  }

  /**
   * BroadcastOnce ni to'xtatish (user dan cancel)
   */
  cancelBroadcastOnce(userId: string): boolean {
    this.broadcastOnceCancelled.add(userId);
    this.broadcastOnceStatus.delete(userId);
    this.logger.log(`📢 BroadcastOnce CANCEL: userId=${userId}`);
    return true;
  }

  /**
   * BroadcastOnce faol holatini olish (mobile reconnect uchun)
   */
  getBroadcastOnceStatus(userId: string) {
    return this.broadcastOnceStatus.get(userId) || null;
  }

  /**
   * BroadcastOnce orderId ni to'ldirish (orders.controller dan)
   */
  setBroadcastOnceOrderId(userId: string, orderId: string) {
    const state = this.broadcastOnceStatus.get(userId);
    if (state) {
      state.orderId = orderId;
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

  /**
   * Yuborilgan xabar ID ni PostHistory ga saqlash (o'chirish uchun)
   */
  private async savePostHistory(job: PostingJob, group: GroupInfo, messageId: number): Promise<void> {
    // Post yoq bo'lsa yaratish (session uchun bitta Post)
    let postId = job.postIds?.get(group.sessionId);
    if (!postId) {
      const post = await this.prisma.post.create({
        data: {
          adId: job.adId,
          userId: job.userId,
          sessionId: group.sessionId,
          status: 'IN_PROGRESS',
          totalGroups: job.totalGroups,
          startedAt: job.startTime,
        },
      });
      postId = post.id;
      if (!job.postIds) job.postIds = new Map();
      job.postIds.set(group.sessionId, postId);
    }

    await this.prisma.postHistory.create({
      data: {
        postId,
        groupId: group.id,
        userId: job.userId,
        messageId,
        status: 'SENT',
        sentAt: new Date(),
      },
    });
  }

  /**
   * Safe onProgress chaqirish
   */
  private emitProgress(job: PostingJob): void {
    try {
      job.onProgress?.();
    } catch (err) {
      this.logger.warn(`onProgress xatolik: ${err}`);
    }
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
    currentRound?: number;
    duration: number;
    successRate: number;
    status: string;
    safeMode: boolean;
    blockedGroups: number;
    nextRoundAt?: Date;
    perSessionStats: Array<{ id: string; name: string; sent: number; failed: number; skipped: number; totalGroups: number }>;
  } | undefined {
    const job = this.activeJobs.get(jobId);
    if (!job) return undefined;

    const duration = job.endTime
      ? job.endTime.getTime() - job.startTime.getTime()
      : Date.now() - job.startTime.getTime();

    const totalAttempts = job.postedGroups + job.failedGroups;

    const perSessionStats = Array.from(job.perSessionStats.entries()).map(([id, s]) => ({
      id, ...s,
    }));

    return {
      totalGroups: job.totalGroups,
      postedGroups: job.postedGroups,
      failedGroups: job.failedGroups,
      skippedGroups: job.skippedGroups,
      roundsCompleted: job.roundsCompleted,
      currentRound: job.currentRound,
      duration,
      successRate: totalAttempts > 0 ? (job.postedGroups / totalAttempts) * 100 : 0,
      status: job.status,
      safeMode: job.safeMode,
      blockedGroups: this.getBlockedCount(),
      nextRoundAt: job.nextRoundAt,
      perSessionStats,
    };
  }

  /**
   * Job ga onProgress callback o'rnatish
   */
  setJobProgressCallback(jobId: string, callback: () => void): void {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.onProgress = callback;
    }
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
