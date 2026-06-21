import { Module } from '@nestjs/common';
import { TaksiBotService } from './taksi-bot.service';
import { TaksiBotController } from './taksi-bot.controller';

@Module({
  providers: [TaksiBotService],
  controllers: [TaksiBotController],
  exports: [TaksiBotService],
})
export class TaksiBotModule {}
