import { Controller, Get, Post, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { YoldaAdsService } from './yolda-ads.service';
import { YoldaDispatcherGuard } from '../auth/yolda-dispatcher.guard';

@ApiTags('Yolda Dispatcher — Ads')
@Controller('yolda-dispatcher/ads')
@UseGuards(YoldaDispatcherGuard)
@ApiBearerAuth()
export class YoldaAdsController {
  constructor(private readonly ads: YoldaAdsService) {}

  @Get('feed')
  @ApiOperation({ summary: 'Filtrlangan e\'lonlar feed' })
  feed(
    @Req() req: any,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('vehicleType') vehicleType?: string,
    @Query('scope') scope?: 'INTERNAL' | 'IMPORT' | 'EXPORT',
  ) {
    return this.ads.feed({
      dispatcherId: req.yoldaDispatcherId,
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
      vehicleType,
      scope,
    });
  }

  @Post(':id/viewed')
  @ApiOperation({ summary: 'E\'lon ko\'rilgan deb belgilash' })
  async markViewed(@Param('id') id: string) {
    await this.ads.markViewed(id);
    return { ok: true };
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'E\'lonni qabul qilish' })
  async accept(@Req() req: any, @Param('id') id: string) {
    return this.ads.accept(req.yoldaDispatcherId, id);
  }

  @Post(':id/unaccept')
  @ApiOperation({ summary: 'E\'lonni qabul qilishdan voz kechish' })
  async unaccept(@Req() req: any, @Param('id') id: string) {
    return this.ads.unaccept(req.yoldaDispatcherId, id);
  }

  @Get('accepted')
  @ApiOperation({ summary: 'Qabul qilingan e\'lonlar' })
  async accepted(@Req() req: any) {
    return this.ads.acceptedList(req.yoldaDispatcherId);
  }
}
