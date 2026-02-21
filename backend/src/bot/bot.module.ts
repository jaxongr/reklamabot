import { Module } from '@nestjs/common';
import { BotController } from './bot.controller';
import { TelegramBotService } from './telegram-bot.service';
import { PostsModule } from '../posts/posts.module';
import { TelegramModule } from '../telegram/telegram.module';
import { PaymentsModule } from '../payments/payments.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [PostsModule, TelegramModule, PaymentsModule, SubscriptionsModule],
  controllers: [BotController],
  providers: [TelegramBotService],
  exports: [TelegramBotService],
})
export class BotModule {}
