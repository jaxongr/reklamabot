import { Module } from '@nestjs/common';
import { AdsService } from './ads.service';
import { AdsController } from './ads.controller';
import { TelegramModule } from '../telegram/telegram.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [TelegramModule, GatewayModule],
  providers: [AdsService],
  controllers: [AdsController],
  exports: [AdsService],
})
export class AdsModule {}
