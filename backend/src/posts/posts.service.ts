import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { TelegramService } from '../telegram/telegram.service';
import { Post, PostStatus, AdStatus, Prisma } from '@prisma/client';
import { randomInt } from 'crypto';

interface PostDistributionConfig {
  adIds: string[];
  intervalMin: number; // seconds
  intervalMax: number; // seconds
  groupInterval: number; // milliseconds
  usePriorityGroups?: boolean;
  selectedSessions?: string[];
  combineWith3LineBreak?: boolean;
}

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);
  private readonly activePosts = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramService: TelegramService,
  ) {}

  /**
   * Create new post distribution task
   */
  async createPost(
    adId: string,
    userId: string,
    config: Partial<PostDistributionConfig>,
  ): Promise<Post> {
    // Get ad
    const ad = await this.prisma.ad.findUnique({
      where: { id: adId },
    });

    if (!ad) {
      throw new NotFoundException('Ad not found');
    }

    if (ad.status !== AdStatus.ACTIVE) {
      throw new Error('Ad is not active');
    }

    // Get user's sessions
    const sessions = await this.prisma.session.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        isFrozen: false,
        ...(config.selectedSessions && { id: { in: config.selectedSessions } }),
      },
      include: {
        groups: {
          where: {
            isActive: true,
            isSkipped: false,
            ...(config.usePriorityGroups && { isPriority: true }),
          },
        },
      },
    });

    if (sessions.length === 0) {
      throw new Error('No active sessions available');
    }

    // Flatten all groups
    const allGroups = sessions.flatMap(s => s.groups);
    const totalGroups = allGroups.length;

    if (totalGroups === 0) {
      throw new Error('No groups available for posting');
    }

    // Create post record
    const post = await this.prisma.post.create({
      data: {
        adId,
        userId,
        sessionId: sessions[0].id, // Primary session
        totalGroups,
        status: PostStatus.PENDING,
      },
    });

    this.logger.log(`Created post: ${post.id} for ${totalGroups} groups`);
    return post;
  }

  /**
   * Start post distribution
   */
  async startDistribution(postId: string): Promise<void> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        ad: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Get groups to post to
    const groups = await this.getTargetGroups(post);

    // Update post status
    await this.prisma.post.update({
      where: { id: postId },
      data: {
        status: PostStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
    });

    // Start distribution process
    this.distributeContent(post, groups);
  }

  /**
   * Get target groups for posting
   */
  private async getTargetGroups(post: Post & { ad: any }) {
    const { ad, sessionId } = post;

    // Get session
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        groups: {
          where: {
            isActive: true,
            isSkipped: false,
          },
        },
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    let groups = session.groups;

    // Filter by ad settings
    if (ad.selectedGroups && ad.selectedGroups.length > 0) {
      groups = groups.filter(g => ad.selectedGroups.includes(g.id));
    }

    // Sort: priority groups first, then by activity
    groups.sort((a, b) => {
      if (a.isPriority && !b.isPriority) return -1;
      if (!a.isPriority && b.isPriority) return 1;
      return b.activityScore - a.activityScore;
    });

    return groups;
  }

  /**
   * Distribute content to groups
   */
  private async distributeContent(
    post: Post & { ad: any },
    groups: any[],
  ): Promise<void> {
    const { ad } = post;
    const content = await this.prepareContent(post, ad);

    let completedCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];

      try {
        // Check if post is paused
        const currentPost = await this.prisma.post.findUnique({
          where: { id: post.id },
        });

        if (currentPost?.status === PostStatus.PAUSED) {
          this.logger.log(`Post ${post.id} paused at group ${i}`);
          break;
        }

        // Check group restrictions
        if (group.hasRestrictions) {
          if (group.restrictionUntil && group.restrictionUntil > new Date()) {
            this.logger.log(`Group ${group.id} has restrictions, skipping`);
            skippedCount++;
            continue;
          }
        }

        // Check if group requires manual invite
        if (group.requiresInvite) {
          this.logger.log(`Group ${group.id} requires manual invite, skipping`);
          skippedCount++;
          continue;
        }

        // Send message
        await this.sendMessageToGroup(post.id, group, content);

        // Update post history
        await this.prisma.postHistory.create({
          data: {
            postId: post.id,
            groupId: group.id,
            userId: post.userId,
            status: 'SENT',
            sentAt: new Date(),
          },
        });

        completedCount++;

        // Update post progress
        await this.prisma.post.update({
          where: { id: post.id },
          data: {
            completedGroups: completedCount,
            lastGroupIndex: i,
          },
        });

        // Wait before next group (anti-ban)
        if (i < groups.length - 1) {
          const delay = this.calculateDelay(ad.groupInterval);
          await this.sleep(delay);
        }

      } catch (error) {
        this.logger.error(`Failed to send to group ${group.id}:`, error);
        failedCount++;

        // Record failure
        await this.prisma.postHistory.create({
          data: {
            postId: post.id,
            groupId: group.id,
            userId: post.userId,
            status: 'FAILED',
            failedAt: new Date(),
            errorMessage: error.message,
          },
        });

        // Check if too many failures
        if (failedCount > groups.length * 0.3) {
          // More than 30% failures, might be frozen
          await this.handlePotentialFreeze(post);
          break;
        }
      }
    }

    // Mark post as completed
    await this.prisma.post.update({
      where: { id: post.id },
      data: {
        status: PostStatus.COMPLETED,
        completedAt: new Date(),
        failedGroups: failedCount,
        skippedGroups: skippedCount,
      },
    });

    this.logger.log(`Post ${post.id} completed: ${completedCount}/${groups.length}`);
  }

  /**
   * Prepare content with ad and brand advertisement
   */
  private async prepareContent(post: Post, ad: any): Promise<string> {
    let content = ad.content;

    // Add brand advertisement if enabled
    const user = await this.prisma.user.findUnique({
      where: { id: post.userId },
    });

    if (user?.brandAdEnabled && user.brandAdText) {
      content += '\n\n' + user.brandAdText;
    }

    return content;
  }

  /**
   * Calculate delay between posts (anti-ban)
   */
  private calculateDelay(baseInterval: number): number {
    // Add randomness to avoid detection
    const variation = randomInt(500, 2000); // 0.5-2 seconds random
    return baseInterval * 1000 + variation;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Send message to group via Telegram API
   */
  private async sendMessageToGroup(
    postId: string,
    group: any,
    content: string,
  ): Promise<void> {
    this.logger.log(`Sending message to group ${group.id} (${group.telegramId})`);

    // Find which session this group belongs to
    const dbGroup = await this.prisma.group.findUnique({
      where: { id: group.id },
      include: { session: true },
    });

    if (!dbGroup || !dbGroup.session) {
      throw new Error(`Group ${group.id} not found or has no session`);
    }

    await this.telegramService.sendMessage(
      dbGroup.sessionId,
      dbGroup.telegramId,
      content,
    );
  }

  /**
   * Handle potential freeze
   */
  private async handlePotentialFreeze(post: Post): Promise<void> {
    this.logger.warn(`Potential freeze detected for post ${post.id}`);

    // Mark session as frozen temporarily
    const unfreezeAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await this.prisma.session.update({
      where: { id: post.sessionId },
      data: {
        isFrozen: true,
        frozenAt: new Date(),
        unfreezeAt,
        freezeCount: { increment: 1 },
      },
    });

    // Update post status
    await this.prisma.post.update({
      where: { id: post.id },
      data: {
        status: PostStatus.PAUSED,
        pausedAt: new Date(),
      },
    });
  }

  /**
   * Pause post distribution
   */
  async pausePost(postId: string): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.status !== PostStatus.IN_PROGRESS) {
      throw new Error('Post is not in progress');
    }

    const updatedPost = await this.prisma.post.update({
      where: { id: postId },
      data: {
        status: PostStatus.PAUSED,
        pausedAt: new Date(),
        lastPausedAt: new Date(),
      },
    });

    // Clear any active timers
    const timer = this.activePosts.get(postId);
    if (timer) {
      clearTimeout(timer);
      this.activePosts.delete(postId);
    }

    this.logger.log(`Post ${postId} paused`);
    return updatedPost;
  }

  /**
   * Resume post distribution
   */
  async resumePost(postId: string): Promise<void> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        ad: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.status !== PostStatus.PAUSED) {
      throw new Error('Post is not paused');
    }

    // Check if 10 minutes have passed since last pause
    if (post.lastPausedAt) {
      const timeSincePause = Date.now() - post.lastPausedAt.getTime();
      const tenMinutes = 10 * 60 * 1000;

      if (timeSincePause < tenMinutes) {
        const waitTime = Math.ceil((tenMinutes - timeSincePause) / 1000 / 60);
        throw new Error(`Please wait ${waitTime} more minutes before resuming`);
      }
    }

    // Resume from where we left off
    const groups = await this.getTargetGroups(post);
    const startIndex = post.lastGroupIndex || 0;
    const remainingGroups = groups.slice(startIndex + 1);

    await this.prisma.post.update({
      where: { id: postId },
      data: {
        status: PostStatus.IN_PROGRESS,
      },
    });

    this.logger.log(`Resuming post ${postId} from group ${startIndex + 1}`);
    this.distributeContent(post, remainingGroups);
  }

  /**
   * Cancel post distribution
   */
  async cancelPost(postId: string): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const updatedPost = await this.prisma.post.update({
      where: { id: postId },
      data: {
        status: PostStatus.CANCELLED,
      },
    });

    // Clear any active timers
    const timer = this.activePosts.get(postId);
    if (timer) {
      clearTimeout(timer);
      this.activePosts.delete(postId);
    }

    this.logger.log(`Post ${postId} cancelled`);
    return updatedPost;
  }

  /**
   * Get post status
   */
  async getStatus(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        ad: true,
        histories: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const progress = post.totalGroups > 0
      ? (post.completedGroups / post.totalGroups) * 100
      : 0;

    return {
      post: {
        id: post.id,
        status: post.status,
        totalGroups: post.totalGroups,
        completedGroups: post.completedGroups,
        failedGroups: post.failedGroups,
        skippedGroups: post.skippedGroups,
        progress: Math.round(progress * 100) / 100,
        startedAt: post.startedAt,
        completedAt: post.completedAt,
        pausedAt: post.pausedAt,
      },
      ad: {
        id: post.ad.id,
        title: post.ad.title,
        content: post.ad.content,
      },
      recentHistory: post.histories,
    };
  }

  /**
   * Get all posts for user
   */
  async getUserPosts(userId: string, params?: {
    status?: PostStatus;
    adId?: string;
    limit?: number;
  }) {
    const where: Prisma.PostWhereInput = {
      userId,
      ...(params?.status && { status: params.status }),
      ...(params?.adId && { adId: params.adId }),
    };

    const posts = await this.prisma.post.findMany({
      where,
      include: {
        ad: true,
        _count: {
          select: { histories: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: params?.limit || 50,
    });

    return {
      data: posts,
      total: posts.length,
    };
  }

  /**
   * Delete post
   */
  async remove(postId: string): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Only allow deleting cancelled or completed posts
    if (post.status !== PostStatus.CANCELLED && post.status !== PostStatus.COMPLETED) {
      throw new Error('Can only delete completed or cancelled posts');
    }

    // Soft delete
    const deletedPost = await this.prisma.post.update({
      where: { id: postId },
      data: {
        status: PostStatus.CANCELLED,
      },
    });

    this.logger.log(`Post ${postId} deleted`);
    return deletedPost;
  }

  /**
   * Retry failed posts
   */
  async retryFailed(postId: string): Promise<void> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        ad: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Get failed histories
    const failedHistories = await this.prisma.postHistory.findMany({
      where: {
        postId,
        status: 'FAILED',
      },
    });

    if (failedHistories.length === 0) {
      throw new Error('No failed posts to retry');
    }

    // Reset post for retry
    await this.prisma.post.update({
      where: { id: postId },
      data: {
        status: PostStatus.PENDING,
        completedGroups: { decrement: failedHistories.length },
        failedGroups: 0,
      },
    });

    // Retry failed posts
    for (const history of failedHistories) {
      try {
        const group = await this.prisma.group.findUnique({
          where: { id: history.groupId },
        });

        if (group) {
          const content = await this.prepareContent(post, post.ad);
          await this.sendMessageToGroup(postId, group, content);

          await this.prisma.postHistory.update({
            where: { id: history.id },
            data: {
              status: 'SENT',
              sentAt: new Date(),
              failedAt: null,
              errorMessage: null,
            },
          });

          await this.prisma.post.update({
            where: { id: postId },
            data: { completedGroups: { increment: 1 } },
          });
        }
      } catch (error) {
        this.logger.error(`Retry failed for group ${history.groupId}:`, error);
      }
    }
  }

  /**
   * Schedule post for later
   */
  async schedulePost(
    adId: string,
    userId: string,
    scheduledFor: Date,
    config: Partial<PostDistributionConfig>,
  ): Promise<Post> {
    // Create ad as scheduled
    const ad = await this.prisma.ad.update({
      where: { id: adId },
      data: {
        isScheduled: true,
        scheduledFor,
      },
    });

    // Create post
    const post = await this.createPost(adId, userId, config);

    // Calculate delay until scheduled time
    const now = new Date();
    const delay = scheduledFor.getTime() - now.getTime();

    if (delay > 0) {
      const timer = setTimeout(async () => {
        try {
          await this.startDistribution(post.id);
        } catch (error) {
          this.logger.error(`Scheduled post ${post.id} failed:`, error);
        }
      }, delay);

      this.activePosts.set(post.id, timer);
    }

    this.logger.log(`Post ${post.id} scheduled for ${scheduledFor}`);
    return post;
  }

  /**
   * Get statistics
   */
  async getStatistics(userId?: string) {
    const where: Prisma.PostWhereInput = userId ? { userId } : {};

    const [
      totalPosts,
      inProgressPosts,
      completedPosts,
      failedPosts,
      todayPosts,
    ] = await Promise.all([
      this.prisma.post.count({ where }),
      this.prisma.post.count({ where: { ...where, status: PostStatus.IN_PROGRESS } }),
      this.prisma.post.count({ where: { ...where, status: PostStatus.COMPLETED } }),
      this.prisma.post.count({ where: { ...where, status: PostStatus.FAILED } }),
      this.prisma.post.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      total: totalPosts,
      inProgress: inProgressPosts,
      completed: completedPosts,
      failed: failedPosts,
      today: todayPosts,
    };
  }
}
