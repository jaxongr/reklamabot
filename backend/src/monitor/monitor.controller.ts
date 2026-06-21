import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MonitorService } from './monitor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Monitor')
@ApiBearerAuth()
@Controller('monitor')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonitorController {
  constructor(private readonly monitorService: MonitorService) {}

  @Get('sessions')
  @ApiOperation({ summary: 'Kuzatuv sessionlarini olish' })
  async getSessions(@Request() req: any, @Query('module') module?: string) {
    return this.monitorService.getSessions(req.user.userId, req.user.role, module || 'LOGISTIKA');
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Bitta kuzatuv sessionini olish' })
  async getSession(@Param('id') id: string) {
    return this.monitorService.getSession(id);
  }

  @Post('sessions/send-code')
  @ApiOperation({ summary: 'Kuzatuv session uchun kod yuborish' })
  async sendCode(
    @Request() req: any,
    @Body() body: { phone: string; name?: string; module?: string },
  ) {
    return this.monitorService.sendCode(req.user.userId, body.phone, body.name, body.module || 'LOGISTIKA');
  }

  @Post('sessions/:id/sign-in')
  @ApiOperation({ summary: 'Kuzatuv session sign in' })
  async signIn(
    @Param('id') id: string,
    @Body() body: { code: string; password?: string },
  ) {
    return this.monitorService.signIn(id, body.code, body.password);
  }

  @Delete('sessions/:id')
  @ApiOperation({ summary: "Kuzatuv sessionni o'chirish" })
  async deleteSession(@Param('id') id: string) {
    return this.monitorService.deleteSession(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Kuzatuv statistikasi' })
  async getStats(@Request() req: any, @Query('module') module?: string) {
    return this.monitorService.getStats(req.user.userId, req.user.role, module || 'LOGISTIKA');
  }

  @Get('sessions/:id/status')
  @ApiOperation({ summary: 'Session ulanish holati' })
  async getSessionStatus(@Param('id') id: string) {
    return {
      connected: this.monitorService.isConnected(id),
      hasPendingAuth: this.monitorService.hasPendingAuth(id),
    };
  }

  @Post('sessions/:id/sync-groups')
  @ApiOperation({ summary: "Guruhlarni qo'lda sinxronlash" })
  async syncGroups(@Param('id') id: string) {
    return this.monitorService.manualSyncGroups(id);
  }

  // ===== PRIORITY GURUHLAR =====

  @Get('priority-groups')
  @ApiOperation({ summary: 'Asosiy guruhlar ro\'yxati' })
  async getPriorityGroups() {
    return this.monitorService.getPriorityGroupsList();
  }

  @Post('priority-groups')
  @ApiOperation({ summary: 'Asosiy guruhga qo\'shish' })
  async addPriorityGroup(@Body() body: { groupTelegramId: string }) {
    return this.monitorService.addPriorityGroup(body.groupTelegramId);
  }

  @Delete('priority-groups/:groupTelegramId')
  @ApiOperation({ summary: 'Asosiy guruhdan o\'chirish' })
  async removePriorityGroup(@Param('groupTelegramId') groupTelegramId: string) {
    return this.monitorService.removePriorityGroup(groupTelegramId);
  }

  @Post('priority-groups/sync-all')
  @ApiOperation({ summary: 'Barcha sessionlarni priority guruhlarga avto-qo\'shish' })
  async syncPriorityGroupsToAll() {
    return this.monitorService.triggerPrioritySync();
  }
}
