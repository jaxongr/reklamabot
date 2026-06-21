import { Module, forwardRef } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { GatewayModule } from '../gateway/gateway.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [forwardRef(() => GatewayModule), NotificationsModule],
  providers: [ChatService],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
