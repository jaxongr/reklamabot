import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { YoldaAuthService } from './yolda-auth.service';
import { YoldaDispatcherGuard } from './yolda-dispatcher.guard';
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('Yolda Dispatcher — Auth')
@Controller('yolda-dispatcher/auth')
export class YoldaAuthController {
  constructor(private readonly auth: YoldaAuthService) {}

  @Public()
  @Post('request-code')
  @ApiOperation({ summary: 'Login kod so\'rash (admin tomonidan yaratilgan raqam uchun)' })
  async requestCode(@Body() body: { phone: string }) {
    return this.auth.generateLoginCode(body.phone);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Kod bilan login' })
  async login(@Body() body: { phone: string; code: string; deviceInfo?: any }) {
    return this.auth.verifyAndLogin(body.phone, body.code, body.deviceInfo);
  }

  @UseGuards(YoldaDispatcherGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Dispetcher profili' })
  async me(@Req() req: any) {
    return this.auth.getProfile(req.yoldaDispatcherId);
  }

  @UseGuards(YoldaDispatcherGuard)
  @ApiBearerAuth()
  @Post('location')
  @ApiOperation({ summary: 'Joylashuv yangilash' })
  async location(
    @Req() req: any,
    @Body() body: { lat: number; lng: number; zoneId?: string | null },
  ) {
    await this.auth.updateLocation(req.yoldaDispatcherId, body.lat, body.lng, body.zoneId);
    return { ok: true };
  }
}
