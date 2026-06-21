import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { PublicController } from './public.controller';
import { AppService } from './app.service';
import { DriverBotService } from './bot/driver-bot.service';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PaymentsModule } from './payments/payments.module';
import { SessionsModule } from './sessions/sessions.module';
import { AdsModule } from './ads/ads.module';
import { PostsModule } from './posts/posts.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { TelegramModule } from './telegram/telegram.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { BotModule } from './bot/bot.module';
import { LocationsModule } from './locations/locations.module';
import { GatewayModule } from './gateway/gateway.module';
import { MonitorModule } from './monitor/monitor.module';
import { OrdersModule } from './orders/orders.module';
import { DriversModule } from './drivers/drivers.module';
import { SmsModule } from './sms/sms.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ChatModule } from './chat/chat.module';
import { SupportModule } from './support/support.module';
import { BalanceModule } from './balance/balance.module';
import { TelegramSmsModule } from './telegram-sms/telegram-sms.module';
import { AccountingModule } from './accounting/accounting.module';
import { YoldaDispatcherModule } from './yolda_dispatcher/yolda-dispatcher.module';
import { CargoBotModule } from './cargo-bot/cargo-bot.module';
import { TaksiBotModule } from './taksi-bot/taksi-bot.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.THROTTLE_TTL || '60', 10) * 1000,
      limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
    }]),
    CommonModule,
    AuthModule,
    UsersModule,
    SubscriptionsModule,
    PaymentsModule,
    SessionsModule,
    AdsModule,
    PostsModule,
    AnalyticsModule,
    TelegramModule,
    SchedulerModule,
    BotModule,
    LocationsModule,
    GatewayModule,
    MonitorModule,
    OrdersModule,
    DriversModule,
    SmsModule,
    NotificationsModule,
    ChatModule,
    SupportModule,
    BalanceModule,
    TelegramSmsModule,
    AccountingModule,
    YoldaDispatcherModule,
    CargoBotModule,
    TaksiBotModule,
  ],
  controllers: [AppController, PublicController],
  providers: [AppService, DriverBotService],
})
export class AppModule {}
