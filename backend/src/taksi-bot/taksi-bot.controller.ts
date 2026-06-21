import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TaksiBotService } from './taksi-bot.service';

@ApiTags('taksi-bot')
@Controller('taksi-bot')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class TaksiBotController {
  constructor(private readonly taksiBot: TaksiBotService) {}

  @Get('info')
  @ApiOperation({ summary: 'Taksi bot holati' })
  info() {
    return this.taksiBot.getInfo();
  }

  @Put('group')
  @ApiOperation({ summary: "Taksi guruh ID sini o'rnatish" })
  setGroup(@Body() body: { groupId: string }) {
    return this.taksiBot.setGroup(body.groupId);
  }

  @Put('flow')
  @ApiOperation({ summary: "Taksi oqimini boshlash/to'xtatish" })
  setFlow(@Body() body: { active: boolean }) {
    return this.taksiBot.setFlowActive(!!body.active);
  }
}
