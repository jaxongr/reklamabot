import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CommonModule } from '../common/common.module';
import { YoldaAuthController } from './auth/yolda-auth.controller';
import { YoldaAuthService } from './auth/yolda-auth.service';
import { YoldaAdsController } from './ads/yolda-ads.controller';
import { YoldaAdsService } from './ads/yolda-ads.service';
import { YoldaCallsController } from './calls/yolda-calls.controller';
import { YoldaCallsService } from './calls/yolda-calls.service';
import { YoldaVoiceUploadService } from './calls/yolda-voice-upload.service';
import { YoldaGeoZonesController } from './geozones/yolda-geozones.controller';
import { YoldaGeoZonesService } from './geozones/yolda-geozones.service';
import { YoldaBlocklistController } from './blocklist/yolda-blocklist.controller';
import { YoldaBlocklistService } from './blocklist/yolda-blocklist.service';
import { YoldaRequestsController } from './requests/yolda-requests.controller';
import { YoldaRequestsService } from './requests/yolda-requests.service';
import { YoldaDispatchersController } from './auth/yolda-dispatchers.controller';
import { YoldaDispatchersService } from './auth/yolda-dispatchers.service';
import { YoldaGateway } from './yolda-dispatcher.gateway';
import { YoldaConfigService } from './config/yolda-config.service';

@Module({
  imports: [
    CommonModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        secret: c.get('JWT_SECRET') || process.env.JWT_SECRET || 'default-secret',
      }),
    }),
  ],
  controllers: [
    YoldaAuthController,
    YoldaAdsController,
    YoldaCallsController,
    YoldaGeoZonesController,
    YoldaBlocklistController,
    YoldaRequestsController,
    YoldaDispatchersController,
  ],
  providers: [
    YoldaAuthService,
    YoldaAdsService,
    YoldaCallsService,
    YoldaVoiceUploadService,
    YoldaGeoZonesService,
    YoldaBlocklistService,
    YoldaRequestsService,
    YoldaDispatchersService,
    YoldaConfigService,
    YoldaGateway,
  ],
  exports: [YoldaGateway],
})
export class YoldaDispatcherModule {}
