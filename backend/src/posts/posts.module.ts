import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostingService } from './posting.service';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [TelegramModule],
  providers: [PostsService, PostingService],
  controllers: [PostsController],
  exports: [PostsService, PostingService],
})
export class PostsModule {}
