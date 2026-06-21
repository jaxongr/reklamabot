import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TelegramSmsService } from './telegram-sms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, TgSmsMessageStatus } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Telegram SMS')
@ApiBearerAuth()
@Controller('telegram-sms')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class TelegramSmsController {
  constructor(private readonly tgSmsService: TelegramSmsService) {}

  // ============================================================
  // SESSION MANAGEMENT
  // ============================================================

  @Get('sessions')
  @ApiOperation({ summary: 'TG SMS sessionlar ro\'yxati' })
  getSessions() {
    return this.tgSmsService.getSessions();
  }

  @Post('sessions/send-code')
  @ApiOperation({ summary: 'Yangi session uchun kod yuborish' })
  sendCode(@Body() body: { phone: string; name?: string }) {
    return this.tgSmsService.sendCode(body.phone, body.name);
  }

  @Post('sessions/:id/sign-in')
  @ApiOperation({ summary: 'Session kod bilan kirish' })
  signIn(
    @Param('id') id: string,
    @Body() body: { code: string; password?: string },
  ) {
    return this.tgSmsService.signIn(id, body.code, body.password);
  }

  @Patch('sessions/:id/toggle')
  @ApiOperation({ summary: 'Sessionni yoqish/o\'chirish' })
  toggleSession(
    @Param('id') id: string,
    @Body() body: { enabled: boolean },
  ) {
    return this.tgSmsService.toggleSession(id, body.enabled);
  }

  @Post('sessions/:id/reconnect')
  @ApiOperation({ summary: 'Sessionni qayta ulash' })
  reconnectSession(@Param('id') id: string) {
    return this.tgSmsService.reconnectSession(id);
  }

  @Post('sessions/:id/check-spam')
  @ApiOperation({ summary: 'SpamBot tekshirish' })
  checkSpam(@Param('id') id: string) {
    return this.tgSmsService.checkSpamStatus(id);
  }

  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Sessionni o\'chirish' })
  deleteSession(@Param('id') id: string) {
    return this.tgSmsService.deleteSession(id);
  }

  // ============================================================
  // TARGET LISTS (ro'yxatlar — SMS uchun)
  // ============================================================

  @Get('targets/drivers')
  @ApiOperation({ summary: 'Haydovchilar ro\'yxati (TG SMS uchun)' })
  getDriverTargets() {
    return this.tgSmsService.getDriverTargets();
  }

  @Get('targets/orders')
  @ApiOperation({ summary: 'Orderlar ro\'yxati (TG SMS uchun)' })
  getOrderTargets(
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ) {
    return this.tgSmsService.getOrderTargets({ type, search, limit: limit ? parseInt(limit) : 100 });
  }

  @Get('targets/blocked')
  @ApiOperation({ summary: 'Bloklangan foydalanuvchilar (TG SMS uchun)' })
  getBlockedTargets() {
    return this.tgSmsService.getBlockedTargets();
  }

  @Get('targets/all')
  @ApiOperation({ summary: 'Barcha TG foydalanuvchilar' })
  getAllTargets() {
    return this.tgSmsService.getAllTargets();
  }

  // ============================================================
  // SENDING MESSAGES
  // ============================================================

  @Post('send/all')
  @ApiOperation({ summary: 'Barchaga TG xabar' })
  sendToAll(
    @Request() req: any,
    @Body() body: { message: string },
  ) {
    return this.tgSmsService.sendToAll(body.message, req.user.userId);
  }

  @Post('send')
  @ApiOperation({ summary: 'Bitta xabar yuborish' })
  sendDm(
    @Request() req: any,
    @Body() body: {
      targetTelegramId: string;
      message: string;
      category?: string;
      targetName?: string;
      targetPhone?: string;
      targetUsername?: string;
    },
  ) {
    return this.tgSmsService.sendDm(body.targetTelegramId, body.message, {
      category: body.category,
      sentById: req.user.userId,
      targetName: body.targetName,
      targetPhone: body.targetPhone,
      targetUsername: body.targetUsername,
    });
  }

  @Post('send/drivers')
  @ApiOperation({ summary: 'Haydovchilarga TG xabar' })
  sendToDrivers(
    @Request() req: any,
    @Body() body: { message: string; driverIds?: string[] },
  ) {
    return this.tgSmsService.sendToDrivers(body.message, req.user.userId, body.driverIds);
  }

  @Post('send/orders')
  @ApiOperation({ summary: 'Order egalariga TG xabar' })
  sendToOrders(
    @Request() req: any,
    @Body() body: { message: string; orderIds: string[] },
  ) {
    return this.tgSmsService.sendToOrders(body.message, req.user.userId, body.orderIds);
  }

  @Post('send/blocked')
  @ApiOperation({ summary: 'Bloklangan foydalanuvchilarga TG xabar' })
  sendToBlocked(
    @Request() req: any,
    @Body() body: { message: string; blockedIds?: string[] },
  ) {
    return this.tgSmsService.sendToBlocked(body.message, req.user.userId, body.blockedIds);
  }

  // ============================================================
  // HISTORY & STATS
  // ============================================================

  @Get('history')
  @ApiOperation({ summary: 'Xabar tarixi' })
  getHistory(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('status') status?: TgSmsMessageStatus,
    @Query('sessionId') sessionId?: string,
    @Query('search') search?: string,
  ) {
    return this.tgSmsService.getHistory({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
      category,
      status,
      sessionId,
      search,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'TG SMS statistikasi' })
  getStats() {
    return this.tgSmsService.getStats();
  }

  // ============================================================
  // AUTO CONFIG
  // ============================================================

  @Get('auto-config')
  @ApiOperation({ summary: 'Avto TG SMS konfiguratsiya' })
  getAutoConfig() {
    return this.tgSmsService.getAutoConfig();
  }

  @Post('auto-config')
  @ApiOperation({ summary: 'Avto TG SMS konfiguratsiya saqlash' })
  setAutoConfig(@Body() body: any) {
    return this.tgSmsService.setAutoConfig(body);
  }
}
