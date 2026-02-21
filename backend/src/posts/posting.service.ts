import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ConfigService } from '@nestjs/config';
import { TelegramService } from '../telegram/telegram.service';

interface PostingJob {
  id: string;
  adId: string;
  adContent: string;
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
  groupName: string;
  groupId: string;
  status: 'success' | 'failed' | 'skipped';
  reason?: string;
  duration?: number;
}

interface GroupInfo {
  id: string;
  name: string;
  sessionId: string;
  lastAdPosted?: Date;
  skipReason?: string;
}

@Injectable()
export class PostingService {
  private readonly logger = new Logger(PostingService.name);
  private activeJobs = new Map<string, PostingJob>();
  private postingIntervals = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly telegramService: TelegramService,
  ) {}

  /**
   * Start posting ad to all groups from all sessions
   */
  async startPosting(adId: string, adContent: string, userId: string): Promise<PostingJob> {
    // Get all active sessions with their groups
    const sessions = await this.prisma.session.findMany({
      where: {
        status: 'ACTIVE',
        isFrozen: false,
      },
      include: {
        groups: true,
      },
    });

    if (sessions.length === 0) {
      throw new Error('Faol session topilmadi. Iltimos, avval session ulang.');
    }

    // Collect all groups
    const allGroups: GroupInfo[] = [];
    for (const session of sessions) {
      for (const group of session.groups) {
        allGroups.push({
          id: group.id,
          name: group.title || 'Unknown',
          sessionId: session.id,
          lastAdPosted: group.lastPostAt,
          skipReason: this.shouldSkipGroup(group),
        });
      }
    }

    if (allGroups.length === 0) {
      throw new Error('Guruhlar topilmadi. Iltimos, avval guruhlarni sinxronlang.');
    }

    // Create job
    const jobId = `job_${Date.now()}`;
    const job: PostingJob = {
      id: jobId,
      adId,
      adContent,
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

    // Start posting in background
    this.runPostingJob(jobId, allGroups);

    return job;
  }

  /**
   * Determine if a group should be skipped
   */
  private shouldSkipGroup(group: any): string | undefined {
    // Skip if marked as skipped
    if (group.isSkipped) {
      return group.skipReason || 'Skip qilingan';
    }

    // Skip if group is inactive
    if (group.isActive === false) {
      return 'Guruh nofaol';
    }

    // Skip if recently posted (within 24 hours)
    if (group.lastPostAt) {
      const hoursSinceLastPost = (Date.now() - group.lastPostAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastPost < 24) {
        return `So'nggi ${Math.floor(hoursSinceLastPost)} soat oldin e'lon yuborilgan`;
      }
    }

    return undefined;
  }

  /**
   * Run posting job with delays and rounds
   */
  private async runPostingJob(jobId: string, groups: GroupInfo[]): Promise<void> {
    const job = this.activeJobs.get(jobId);
    if (!job) return;

    this.logger.log(`Starting posting job ${jobId} for ${groups.length} groups`);

    // Shuffle groups for random order
    const shuffledGroups = this.shuffleArray([...groups]);

    // First round
    await this.postRound(job, shuffledGroups);

    // Continue with rounds if not stopped
    const interval = setInterval(async () => {
      const currentJob = this.activeJobs.get(jobId);
      if (!currentJob || currentJob.status === 'stopped') {
        clearInterval(interval);
        this.postingIntervals.delete(jobId);
        return;
      }

      if (currentJob.stopRequested) {
        currentJob.status = 'stopped';
        currentJob.endTime = new Date();
        clearInterval(interval);
        this.postingIntervals.delete(jobId);
        this.logger.log(`Job ${jobId} stopped`);
        return;
      }

      if (currentJob.pauseRequested) {
        this.logger.log(`Job ${jobId} paused`);
        return;
      }

      // Shuffle again for new round
      const reshuffledGroups = this.shuffleArray([...groups]);
      await this.postRound(currentJob, reshuffledGroups);
    }, this.getRandomRoundDelay());

    this.postingIntervals.set(jobId, interval);
  }

  /**
   * Post one round to all groups
   */
  private async postRound(job: PostingJob, groups: GroupInfo[]): Promise<void> {
    const startTime = Date.now();

    for (const group of groups) {
      if (job.stopRequested || job.status === 'stopped') {
        break;
      }

      // Check if should skip
      const skipReason = this.shouldSkipGroupById(group, job.logs);
      if (skipReason) {
        job.skippedGroups++;
        job.logs.push({
          timestamp: new Date(),
          sessionId: group.sessionId,
          groupName: group.name,
          groupId: group.id,
          status: 'skipped',
          reason: skipReason,
        });
        this.logger.log(`Skipped group ${group.name}: ${skipReason}`);
        continue;
      }

      // Post to group
      const result = await this.postToGroup(job, group);
      if (result.success) {
        job.postedGroups++;
      } else {
        job.failedGroups++;
      }

      job.logs.push(result.log);

      // Random delay between posts (0.5 - 5 seconds)
      if (groups.indexOf(group) < groups.length - 1) {
        await this.delay(this.getRandomPostDelay());
      }
    }

    const duration = Date.now() - startTime;
    job.roundsCompleted++;
    this.logger.log(
      `Round ${job.roundsCompleted} completed in ${Math.floor(duration / 1000)}s. ` +
      `Posted: ${job.postedGroups}, Failed: ${job.failedGroups}, Skipped: ${job.skippedGroups}`
    );
  }

  /**
   * Check if group should be skipped based on logs
   */
  private shouldSkipGroupById(group: GroupInfo, logs: PostingLog[]): string | undefined {
    // Check if already posted in this round
    const alreadyPosted = logs.some(
      log => log.groupId === group.id && log.status === 'success' && this.isWithinHours(log.timestamp, 1)
    );

    if (alreadyPosted) {
      return 'Bu roundda allaqachon yuborilgan';
    }

    return group.skipReason;
  }

  /**
   * Check if timestamp is within X hours
   */
  private isWithinHours(timestamp: Date, hours: number): boolean {
    const diff = Date.now() - timestamp.getTime();
    return diff < hours * 60 * 60 * 1000;
  }

  /**
   * Post to a single group using real Telegram API
   */
  private async postToGroup(job: PostingJob, group: GroupInfo): Promise<{
    success: boolean;
    log: PostingLog;
  }> {
    const startTime = Date.now();

    try {
      this.logger.log(`Posting to group ${group.name} (${group.id})`);

      // Get the group's telegram ID from database
      const dbGroup = await this.prisma.group.findUnique({
        where: { id: group.id },
      });

      if (!dbGroup) {
        throw new Error('Group not found in database');
      }

      // Send message via TelegramService
      const result = await this.telegramService.sendMessage(
        group.sessionId,
        dbGroup.telegramId,
        job.adContent,
      );

      // Update group's last post timestamp
      await this.prisma.group.update({
        where: { id: group.id },
        data: { lastPostAt: new Date() },
      });

      const duration = Date.now() - startTime;

      return {
        success: true,
        log: {
          timestamp: new Date(),
          sessionId: group.sessionId,
          groupName: group.name,
          groupId: group.id,
          status: 'success',
          duration,
        },
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Handle specific errors
      if (error.message?.startsWith('FLOOD_WAIT:')) {
        const waitSeconds = parseInt(error.message.split(':')[1]);
        this.logger.warn(`Flood wait ${waitSeconds}s - pausing job ${job.id}`);
        job.pauseRequested = true;
        job.status = 'paused';
      }

      if (error.message?.startsWith('WRITE_FORBIDDEN:')) {
        // Mark group as having restrictions
        await this.prisma.group.update({
          where: { id: group.id },
          data: {
            hasRestrictions: true,
            isSkipped: true,
            skipReason: 'Yozish taqiqlangan',
          },
        });
      }

      if (error.message?.startsWith('SESSION_DEAD:')) {
        // Session is dead, stop the entire job
        job.stopRequested = true;
      }

      return {
        success: false,
        log: {
          timestamp: new Date(),
          sessionId: group.sessionId,
          groupName: group.name,
          groupId: group.id,
          status: 'failed',
          reason: error.message,
          duration,
        },
      };
    }
  }

  /**
   * Get random post delay between 0.5 and 5 seconds
   */
  private getRandomPostDelay(): number {
    return Math.random() * 4500 + 500; // 500ms to 5000ms
  }

  /**
   * Get random round delay between 5 and 15 minutes
   */
  private getRandomRoundDelay(): number {
    return Math.random() * 600000 + 300000; // 5min to 15min in ms
  }

  /**
   * Shuffle array
   */
  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get job status
   */
  getJob(jobId: string): PostingJob | undefined {
    return this.activeJobs.get(jobId);
  }

  /**
   * Get all jobs for user
   */
  getUserJobs(userId: string): PostingJob[] {
    return Array.from(this.activeJobs.values());
  }

  /**
   * Stop job
   */
  stopJob(jobId: string): void {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.stopRequested = true;
      this.logger.log(`Stop requested for job ${jobId}`);
    }
  }

  /**
   * Pause job
   */
  pauseJob(jobId: string): void {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.pauseRequested = true;
      job.status = 'paused';
      this.logger.log(`Pause requested for job ${jobId}`);
    }
  }

  /**
   * Resume job
   */
  resumeJob(jobId: string): void {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.pauseRequested = false;
      job.status = 'running';
      this.logger.log(`Resumed job ${jobId}`);
    }
  }

  /**
   * Get job logs
   */
  getJobLogs(jobId: string): PostingLog[] {
    const job = this.activeJobs.get(jobId);
    return job?.logs || [];
  }

  /**
   * Get job statistics
   */
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

    return {
      totalGroups: job.totalGroups,
      postedGroups: job.postedGroups,
      failedGroups: job.failedGroups,
      skippedGroups: job.skippedGroups,
      roundsCompleted: job.roundsCompleted,
      duration,
      successRate: job.totalGroups > 0 ? (job.postedGroups / job.totalGroups) * 100 : 0,
    };
  }

  /**
   * Cleanup completed jobs
   */
  cleanupJob(jobId: string): void {
    const interval = this.postingIntervals.get(jobId);
    if (interval) {
      clearInterval(interval);
      this.postingIntervals.delete(jobId);
    }
    this.activeJobs.delete(jobId);
    this.logger.log(`Cleaned up job ${jobId}`);
  }
}
