import { Module, forwardRef } from '@nestjs/common';
import { MonitorService } from './monitor.service';
import { MonitorController } from './monitor.controller';
import { BlockedUsersController } from './blocked-users.controller';
import { MessageFilterService } from './message-filter.service';
import { GatewayModule } from '../gateway/gateway.module';
import { SmsModule } from '../sms/sms.module';
import { TelegramSmsModule } from '../telegram-sms/telegram-sms.module';
import { DriversModule } from '../drivers/drivers.module';
import { YoldaDispatcherModule } from '../yolda_dispatcher/yolda-dispatcher.module';
import { CargoBotModule } from '../cargo-bot/cargo-bot.module';
import { TaksiBotModule } from '../taksi-bot/taksi-bot.module';

@Module({
  imports: [GatewayModule, SmsModule, forwardRef(() => TelegramSmsModule), DriversModule, YoldaDispatcherModule, CargoBotModule, TaksiBotModule],
  providers: [MonitorService, MessageFilterService],
  controllers: [MonitorController, BlockedUsersController],
  exports: [MonitorService, MessageFilterService],
})
export class MonitorModule {}
