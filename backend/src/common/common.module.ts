import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { RedisService } from './redis.service';
import { SystemConfigService } from './system-config.service';
import { SystemConfigController } from './system-config.controller';
import { UploadController } from './upload.controller';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  providers: [PrismaService, RedisService, SystemConfigService],
  controllers: [SystemConfigController, UploadController],
  exports: [PrismaService, RedisService, SystemConfigService],
})
export class CommonModule {}
