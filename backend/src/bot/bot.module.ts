import { Module } from '@nestjs/common';
import { BotController } from './bot.controller';
import { TelegramBotService } from './telegram-bot.service';
import { PostsModule } from '../posts/posts.module';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [PostsModule, TelegramModule],
  controllers: [BotController],
  providers: [TelegramBotService],
  exports: [TelegramBotService],
})
export class BotModule {}
