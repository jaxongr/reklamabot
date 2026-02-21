import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { TelegramService } from '../telegram/telegram.service';

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
}

// Roundlar orasidagi pauza (10 daqiqa)
const ROUND_PAUSE_MS = 10 * 60 * 1000;

// Guruhlar orasidagi random delay (0.5 — 5 soniya)
const MIN_GROUP_DELAY_MS = 500;
const MAX_GROUP_DELAY_MS = 5000;

@Injectable()
export class PostingService {
  private readonly logger = new Logger(PostingService.name);
  private activeJobs = new Map<string, PostingJob>();
  private jobTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramService: TelegramService,
  ) {}

  /**
   * Foydalanuvchining barcha sessionlaridagi guruhlarga e'lon tarqatishni boshlash
   */
  async startPosting(adId: string, adContent: string, userId: string): Promise<PostingJob> {
    // Foydalanuvchining FAOL sessionlarini olish (faqat uning sessionlari)
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

    // Ulangan sessionlarni tekshirish
    const connectedSessions = sessions.filter(s =>
      this.telegramService.isClientConnected(s.id),
    );

    if (connectedSessions.length === 0) {
      // Ulashga harakat qilamiz
      for (const session of sessions) {
        try {
          await this.telegramService.connectSession(session.id);
        } catch (error) {
          this.logger.warn(`Session ulanmadi: ${session.id} — ${error.message}`);
        }
      }

      const retryConnected = sessions.filter(s =>
        this.telegramService.isClientConnected(s.id),
      );

      if (retryConnected.length === 0) {
        throw new Error('Hech bir session ulanmadi. Sessionlarni tekshiring.');
      }
    }

    // Barcha ulangan sessionlardagi guruhlarni yig'ish
    const allGroups: GroupInfo[] = [];
    for (const session of sessions) {
      if (!this.telegramService.isClientConnected(session.id)) continue;

      for (const group of session.groups) {
        allGroups.push({
          id: group.id,
          telegramId: group.telegramId,
          name: group.title || 'Nomsiz',
          sessionId: session.id,
          sessionName: session.name || session.phone || 'Session',
        });
      }
    }

    if (allGroups.length === 0) {
      throw new Error(
        `${sessions.length} ta session bor, lekin guruhlar topilmadi. ` +
        'Avval guruhlarni sinxronlang.',
      );
    }

    // Job yaratish
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
      `Tarqatish boshlandi: ${jobId} — ` +
      `${connectedSessions.length} session, ${allGroups.length} guruh`,
    );

    // Background da ishga tushirish
    this.runPostingLoop(jobId, allGroups);

    return job;
  }

  /**
   * Asosiy tarqatish tsikli: round → 10 min pauza → round → ...
   */
  private async runPostingLoop(jobId: string, groups: GroupInfo[]): Promise<void> {
    const job = this.activeJobs.get(jobId);
    if (!job) return;

    while (true) {
      // Stop tekshirish
      if (job.stopRequested) {
        job.status = 'stopped';
        job.endTime = new Date();
        this.logger.log(`Job to'xtatildi: ${jobId}`);
        break;
      }

      // Pause tekshirish
      if (job.pauseRequested) {
        job.status = 'paused';
        this.logger.log(`Job pauzada: ${jobId}`);
        // Har 5 soniyada pause holatini tekshiramiz
        await this.delay(5000);
        continue;
      }

      // Guruhlarni aralashtirish (har round yangi tartib)
      const shuffled = this.shuffleArray([...groups]);

      // Round boshlash
      await this.postRound(job, shuffled);

      // Stop tekshirish (round tugagandan keyin)
      if (job.stopRequested) {
        job.status = 'stopped';
        job.endTime = new Date();
        this.logger.log(`Job to'xtatildi (round keyin): ${jobId}`);
        break;
      }

      // 10 daqiqa pauza
      this.logger.log(
        `Round #${job.roundsCompleted} tugadi. 10 daqiqa pauza...` +
        ` (Yuborildi: ${job.postedGroups}, Xato: ${job.failedGroups})`,
      );

      // 10 daqiqa kutish (lekin har 2 soniyada stop tekshiramiz)
      const pauseEnd = Date.now() + ROUND_PAUSE_MS;
      while (Date.now() < pauseEnd) {
        if (job.stopRequested) break;
        await this.delay(2000);
      }
    }
  }

  /**
   * Bitta roundda barcha guruhlarga yuborish
   */
  private async postRound(job: PostingJob, groups: GroupInfo[]): Promise<void> {
    const roundStart = Date.now();

    for (let i = 0; i < groups.length; i++) {
      if (job.stopRequested) break;
      if (job.pauseRequested) {
        // Pause bo'lsa — kutamiz
        while (job.pauseRequested && !job.stopRequested) {
          await this.delay(2000);
        }
        if (job.stopRequested) break;
      }

      const group = groups[i];

      // Guruhga yuborish
      const result = await this.postToGroup(job, group);
      if (result.success) {
        job.postedGroups++;
      } else {
        job.failedGroups++;
      }
      job.logs.push(result.log);

      // Oxirgi loglarni chegaralash (xotira uchun)
      if (job.logs.length > 500) {
        job.logs = job.logs.slice(-300);
      }

      // Guruhlar orasida RANDOM delay (0.5 - 5 soniya)
      if (i < groups.length - 1 && !job.stopRequested) {
        const delay = this.getRandomDelay(MIN_GROUP_DELAY_MS, MAX_GROUP_DELAY_MS);
        await this.delay(delay);
      }
    }

    const roundDuration = Math.floor((Date.now() - roundStart) / 1000);
    job.roundsCompleted++;

    this.logger.log(
      `Round #${job.roundsCompleted} tugadi (${roundDuration}s) — ` +
      `Yuborildi: ${job.postedGroups}, Xato: ${job.failedGroups}, O'tkazildi: ${job.skippedGroups}`,
    );
  }

  /**
   * Bitta guruhga xabar yuborish
   */
  private async postToGroup(
    job: PostingJob,
    group: GroupInfo,
  ): Promise<{ success: boolean; log: PostingLog }> {
    const startTime = Date.now();

    try {
      // Session ulangan mi
      if (!this.telegramService.isClientConnected(group.sessionId)) {
        // Qayta ulashga urinish
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

      // Xabar yuborish
      await this.telegramService.sendMessage(
        group.sessionId,
        group.telegramId,
        job.adContent,
      );

      // Guruh last post vaqtini yangilash
      await this.prisma.group.update({
        where: { id: group.id },
        data: { lastPostAt: new Date() },
      }).catch(() => {}); // DB xatolik bo'lsa davom etamiz

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

      // FLOOD_WAIT — session uchun pauza
      if (errorMsg.startsWith('FLOOD_WAIT:')) {
        const waitSeconds = parseInt(errorMsg.split(':')[1]);
        this.logger.warn(`FLOOD_WAIT ${waitSeconds}s — ${group.sessionName}`);
        // Kichik flood bo'lsa — kutamiz
        if (waitSeconds <= 30) {
          await this.delay(waitSeconds * 1000);
        }
        // Katta flood — bu guruhni skip qilamiz
      }

      // Yozish taqiqlangan — guruhni belgilash
      if (errorMsg.startsWith('WRITE_FORBIDDEN:')) {
        await this.prisma.group.update({
          where: { id: group.id },
          data: {
            hasRestrictions: true,
            isSkipped: true,
            skipReason: 'Yozish taqiqlangan',
          },
        }).catch(() => {});
      }

      // Session o'lgan
      if (errorMsg.startsWith('SESSION_DEAD:')) {
        this.logger.error(`Session o'lgan: ${group.sessionId}`);
        // Bu sessionning barcha guruhlarini skip qilmaymiz,
        // boshqa sessiondagi guruhlar davom etadi
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
          reason: errorMsg,
          duration: Date.now() - startTime,
        },
      };
    }
  }

  // ==================== UTILITY METHODS ====================

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
      this.logger.log(`To'xtatish so'raldi: ${jobId}`);
    }
  }

  pauseJob(jobId: string): void {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.pauseRequested = true;
      job.status = 'paused';
      this.logger.log(`Pauza so'raldi: ${jobId}`);
    }
  }

  resumeJob(jobId: string): void {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.pauseRequested = false;
      job.status = 'running';
      this.logger.log(`Davom ettirildi: ${jobId}`);
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
    this.logger.log(`Job tozalandi: ${jobId}`);
  }
}
