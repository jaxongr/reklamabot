import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma.service';
import { PostsService } from '../posts/posts.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { PaymentsService } from '../payments/payments.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly postsService: PostsService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly paymentsService: PaymentsService,
    private readonly analyticsService: AnalyticsService,
    private readonly sessionsService: SessionsService,
  ) {}

  async onModuleInit() {
    this.logger.log('Scheduler initialized');
  }

  /**
   * Check scheduled ads - every minute
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledAds() {
    try {
      const now = new Date();

      const scheduledAds = await this.prisma.ad.findMany({
        where: {
          isScheduled: true,
          scheduledFor: { lte: now },
          status: { in: ['ACTIVE', 'PAUSED'] },
        },
      });

      for (const ad of scheduledAds) {
        const user = await this.prisma.user.findUnique({
          where: { id: ad.userId },
        });

        if (!user) continue;

        try {
          const post = await this.prisma.post.create({
            data: {
              adId: ad.id,
              userId: ad.userId,
              sessionId: ad.sessionId || '',
              totalGroups: 0,
              status: 'PENDING',
            },
          });

          await this.postsService.startDistribution(post.id);

          await this.prisma.ad.update({
            where: { id: ad.id },
            data: {
              status: 'ACTIVE',
              lastScheduledAt: new Date(),
            },
          });

          this.logger.log(`Scheduled ad ${ad.id} posted`);
        } catch (error: any) {
          this.logger.error(`Failed to post scheduled ad ${ad.id}:`, error);
          await this.prisma.ad.update({
            where: { id: ad.id },
            data: { status: 'PAUSED', lastError: error.message },
          });
        }
      }
    } catch (error) {
      this.logger.error('Scheduled ads cron error:', error);
    }
  }

  /**
   * Check expired subscriptions - every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredSubscriptions() {
    try {
      const count = await this.subscriptionsService.checkExpired();
      if (count > 0) {
        this.logger.log(`Expired ${count} subscriptions`);
      }
    } catch (error) {
      this.logger.error('Subscription expiry check failed:', error);
    }
  }

  /**
   * Expire old pending payments - every 6 hours
   */
  @Cron('0 */6 * * *')
  async handleExpiredPayments() {
    try {
      const count = await this.paymentsService.expirePending(48);
      if (count > 0) {
        this.logger.log(`Expired ${count} pending payments`);
      }
    } catch (error) {
      this.logger.error('Payment expiry check failed:', error);
    }
  }

  /**
   * Generate daily statistics - every day at midnight
   */
  @Cron('0 0 * * *')
  async handleDailyStats() {
    try {
      await this.analyticsService.generateDailyStats();
      this.logger.log('Daily statistics generated');
    } catch (error) {
      this.logger.error('Daily stats generation failed:', error);
    }
  }

  /**
   * Cleanup frozen sessions - every day at 3 AM
   */
  @Cron('0 3 * * *')
  async handleFrozenSessions() {
    try {
      const count = await this.sessionsService.cleanupFrozenSessions(7);
      if (count > 0) {
        this.logger.log(`Unfroze ${count} old frozen sessions`);
      }
    } catch (error) {
      this.logger.error('Frozen session cleanup failed:', error);
    }
  }
}
