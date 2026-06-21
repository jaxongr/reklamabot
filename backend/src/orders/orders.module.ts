import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PostsModule } from '../posts/posts.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [PostsModule, GatewayModule],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
