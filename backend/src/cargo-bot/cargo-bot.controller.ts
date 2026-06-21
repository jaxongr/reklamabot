import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CargoBotService } from './cargo-bot.service';

@ApiTags('cargo-bot')
@Controller('cargo-bot')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class CargoBotController {
  constructor(private readonly cargoBot: CargoBotService) {}

  @Get('info')
  @ApiOperation({ summary: 'Yuk bot holati' })
  info() {
    return this.cargoBot.getInfo();
  }

  @Get('users')
  @ApiOperation({ summary: 'Ruxsat berilgan foydalanuvchilar' })
  users() {
    return this.cargoBot.listUsers();
  }

  @Post('users')
  @ApiOperation({ summary: "Telegram ID ga ruxsat berish (days = necha kun, bo'sh = muddatsiz)" })
  addUser(@Body() body: { telegramId: string; name?: string; days?: number }) {
    return this.cargoBot.addUser(body.telegramId, body.name, body.days);
  }

  @Put('users/:id')
  @ApiOperation({ summary: "Foydalanuvchi muddatini tahrirlash (days)" })
  updateUser(@Param('id') id: string, @Body() body: { days?: number }) {
    return this.cargoBot.updateUserDuration(id, body.days);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: "Ruxsatni olib tashlash" })
  removeUser(@Param('id') id: string) {
    return this.cargoBot.removeUser(id);
  }

  @Get('flow')
  @ApiOperation({ summary: 'Yuklar oqimi holati' })
  async flow() {
    return { active: await this.cargoBot.isFlowActive() };
  }

  @Put('flow')
  @ApiOperation({ summary: "Yuklar oqimini boshlash/to'xtatish" })
  setFlow(@Body() body: { active: boolean }) {
    return this.cargoBot.setFlowActive(!!body.active);
  }

  @Get('accepted')
  @ApiOperation({ summary: 'Qabul qilingan yuklar' })
  accepted() {
    return this.cargoBot.getAccepted();
  }
}
