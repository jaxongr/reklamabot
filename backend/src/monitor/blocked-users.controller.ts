import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MessageFilterService } from './message-filter.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BlockReason } from '@prisma/client';

@ApiTags('Blocked Users')
@ApiBearerAuth()
@Controller('blocked-users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BlockedUsersController {
  constructor(private readonly filterService: MessageFilterService) {}

  @Get()
  @ApiOperation({ summary: 'Bloklangan foydalanuvchilar ro\'yxati' })
  async getBlockedUsers(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('reason') reason?: BlockReason,
  ) {
    const role = req.user.role;
    const canSeeAll = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'DISPATCHER';
    return this.filterService.getBlockedUsers({
      userId: canSeeAll ? undefined : req.user.userId,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      search,
      reason,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Bloklash statistikasi' })
  async getStats(@Request() req: any) {
    const role = req.user.role;
    const canSeeAll = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'DISPATCHER';
    return this.filterService.getBlockStats(canSeeAll ? undefined : req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Foydalanuvchini qo\'lda bloklash (orderdan)' })
  async blockUser(
    @Request() req: any,
    @Body() body: {
      senderTelegramId: string;
      senderName?: string;
      senderUsername?: string;
      phone?: string;
      messageText?: string;
      groupTitle?: string;
      groupTelegramId?: string;
    },
  ) {
    return this.filterService.manualBlock({
      userId: req.user.userId,
      senderTelegramId: body.senderTelegramId,
      senderName: body.senderName,
      senderUsername: body.senderUsername,
      phone: body.phone,
      messageText: body.messageText || '',
      groupTitle: body.groupTitle || '',
      groupTelegramId: body.groupTelegramId || '',
    });
  }

  @Patch(':id/unblock')
  @ApiOperation({ summary: 'Foydalanuvchini blokdan chiqarish' })
  async unblock(@Param('id') id: string) {
    return this.filterService.unblockUser(id);
  }

  @Get('whitelist')
  @ApiOperation({ summary: 'Oq ro\'yxatni olish' })
  async getWhitelist(@Request() req: any) {
    return this.filterService.getWhitelistEntries(req.user.userId);
  }

  @Post('whitelist')
  @ApiOperation({ summary: 'Oq ro\'yxatga qo\'shish' })
  async addToWhitelist(@Body() body: { entry: string }) {
    return this.filterService.addToWhitelist(body.entry);
  }

  @Delete('whitelist/:entry')
  @ApiOperation({ summary: 'Oq ro\'yxatdan o\'chirish' })
  async removeFromWhitelist(@Param('entry') entry: string) {
    return this.filterService.removeFromWhitelist(entry);
  }
}
