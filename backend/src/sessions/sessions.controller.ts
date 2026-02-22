import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { TelegramService } from '../telegram/telegram.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SessionStatus } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Sessions')
@ApiBearerAuth()
@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly telegramService: TelegramService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user sessions' })
  async findAll(
    @Request() req: any,
    @Query('status') status?: SessionStatus,
    @Query('includeFrozen') includeFrozen?: string,
  ) {
    return this.sessionsService.findAll(req.user.userId, {
      status,
      includeFrozen: includeFrozen === 'true' ? true : includeFrozen === 'false' ? false : undefined,
    });
  }

  @Get('connection-status')
  @ApiOperation({ summary: 'Check all sessions connection status' })
  async getConnectionStatus(@Request() req: any) {
    const sessions = await this.sessionsService.findAll(req.user.userId, {});
    const sessionData = Array.isArray(sessions) ? sessions : (sessions as any).data || [];
    const sessionIds = sessionData.map((s: any) => s.id);
    return this.telegramService.checkAllSessionConnections(sessionIds);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single session' })
  async findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new session' })
  async create(
    @Request() req: any,
    @Body() body: {
      name?: string;
      phone?: string;
      sessionString?: string;
      isPremium?: boolean;
    },
  ) {
    return this.sessionsService.create({
      ...body,
      user: { connect: { id: req.user.userId } },
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update session' })
  async update(
    @Param('id') id: string,
    @Body() body: {
      name?: string;
      phone?: string;
      status?: SessionStatus;
    },
  ) {
    return this.sessionsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete session' })
  async remove(@Param('id') id: string) {
    return this.sessionsService.remove(id);
  }

  @Post(':id/freeze')
  @ApiOperation({ summary: 'Freeze session' })
  async freeze(
    @Param('id') id: string,
    @Body() body: { unfreezeAt?: string },
  ) {
    return this.sessionsService.markFrozen(
      id,
      body.unfreezeAt ? new Date(body.unfreezeAt) : undefined,
    );
  }

  @Post(':id/unfreeze')
  @ApiOperation({ summary: 'Unfreeze session' })
  async unfreeze(@Param('id') id: string) {
    return this.sessionsService.unfreeze(id);
  }

  @Get(':id/groups')
  @ApiOperation({ summary: 'Get session groups' })
  async getGroups(
    @Param('id') id: string,
    @Query('active') active?: string,
    @Query('priority') priority?: string,
    @Query('skip') skip?: string,
  ) {
    return this.sessionsService.getGroups(id, {
      active: active === 'true' ? true : active === 'false' ? false : undefined,
      priority: priority === 'true' ? true : priority === 'false' ? false : undefined,
      skip: skip === 'true' ? true : skip === 'false' ? false : undefined,
    });
  }

  @Get(':id/groups/priority')
  @ApiOperation({ summary: 'Get priority groups' })
  async getPriorityGroups(
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    return this.sessionsService.getPriorityGroups(id, limit ? parseInt(limit) : 50);
  }

  @Post(':id/groups')
  @ApiOperation({ summary: 'Add group to session' })
  async addGroup(
    @Param('id') id: string,
    @Body() body: {
      telegramId: string;
      title: string;
      username?: string;
      type: 'GROUP' | 'SUPERGROUP' | 'CHANNEL';
      memberCount?: number;
    },
  ) {
    return this.sessionsService.addGroup({
      ...body,
      session: { connect: { id } },
    });
  }

  @Post(':id/groups/batch')
  @ApiOperation({ summary: 'Batch add groups' })
  async batchAddGroups(
    @Param('id') id: string,
    @Body() body: {
      groups: Array<{
        telegramId: string;
        title: string;
        username?: string;
        type: 'GROUP' | 'SUPERGROUP' | 'CHANNEL';
        memberCount?: number;
      }>;
    },
  ) {
    return this.sessionsService.batchAddGroups(id, body.groups as any);
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Get session statistics' })
  async getStatistics(@Param('id') id: string) {
    return this.sessionsService.getStatistics(id);
  }
}
