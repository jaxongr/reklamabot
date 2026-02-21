import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { PostsModule } from '../posts/posts.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { PaymentsModule } from '../payments/payments.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PostsModule,
    SubscriptionsModule,
    PaymentsModule,
    AnalyticsModule,
    SessionsModule,
  ],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
