import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { YoldaBlocklistService } from './yolda-blocklist.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { YoldaDispatcherGuard } from '../auth/yolda-dispatcher.guard';

@ApiTags('Yolda Dispatcher — Blocklist')
@Controller('yolda-dispatcher/blocklist')
export class YoldaBlocklistController {
  constructor(private readonly svc: YoldaBlocklistService) {}

  // Dispatcher — telefon tekshirish
  @UseGuards(YoldaDispatcherGuard)
  @ApiBearerAuth()
  @Get('check')
  check(@Query('phone') phone: string) {
    return this.svc.check(phone);
  }

  @UseGuards(YoldaDispatcherGuard)
  @ApiBearerAuth()
  @Post('bulk-check')
  bulkCheck(@Body() body: { phones: string[] }) {
    return this.svc.bulkCheck(body.phones);
  }

  // Admin CRUD
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @Get()
  list() {
    return this.svc.list();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @Post()
  add(@Req() req: any, @Body() body: { phone: string; reason?: string }) {
    return this.svc.add(body.phone, body.reason, req.user?.userId || req.user?.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @Delete(':phone')
  remove(@Param('phone') phone: string) {
    return this.svc.remove(phone);
  }
}
