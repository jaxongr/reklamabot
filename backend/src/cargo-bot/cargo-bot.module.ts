import { Module } from '@nestjs/common';
import { CargoBotService } from './cargo-bot.service';
import { CargoBotController } from './cargo-bot.controller';

@Module({
  providers: [CargoBotService],
  controllers: [CargoBotController],
  exports: [CargoBotService],
})
export class CargoBotModule {}
