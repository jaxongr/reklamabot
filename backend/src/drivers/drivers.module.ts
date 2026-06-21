import { Module, forwardRef } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { DriverMatchingService } from './driver-matching.service';
import { GatewayModule } from '../gateway/gateway.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthModule } from '../auth/auth.module';
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [GatewayModule, NotificationsModule, ScheduleModule.forRoot(), forwardRef(() => AuthModule), SmsModule],
  controllers: [DriversController],
  providers: [DriversService, DriverMatchingService],
  exports: [DriversService, DriverMatchingService],
})
export class DriversModule {}
