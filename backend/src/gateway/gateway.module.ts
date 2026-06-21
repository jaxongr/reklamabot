import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AppGateway } from './app.gateway';
import { ChatModule } from '../chat/chat.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'default-secret',
      }),
    }),
    forwardRef(() => ChatModule),
    NotificationsModule,
  ],
  providers: [AppGateway],
  exports: [AppGateway],
})
export class GatewayModule {}
