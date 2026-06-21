import { Module, forwardRef } from '@nestjs/common';
import { TelegramSmsService } from './telegram-sms.service';
import { TelegramSmsController } from './telegram-sms.controller';
import { MonitorModule } from '../monitor/monitor.module';

@Module({
  imports: [forwardRef(() => MonitorModule)],
  providers: [TelegramSmsService],
  controllers: [TelegramSmsController],
  exports: [TelegramSmsService],
})
export class TelegramSmsModule {}
