import { Controller, Get, Post, Patch, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, NotificationTarget } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Bildirishnoma yaratish' })
  async create(
    @Request() req: any,
    @Body() body: { title: string; message: string; target: NotificationTarget },
  ) {
    return this.notificationsService.create(body.title, body.message, body.target, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Mening bildirishnomalarim' })
  async getUserNotifications(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.getUserNotifications(
      req.user.userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('all')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Barcha bildirishnomalar (admin)' })
  async getAllNotifications(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.getAllNotifications(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Patch('fcm-token')
  @ApiOperation({ summary: 'FCM tokenni yangilash' })
  async updateFcmToken(
    @Request() req: any,
    @Body() body: { token: string | null },
  ) {
    await this.notificationsService.updateFcmToken(req.user.userId, body.token);
    return { success: true };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: "O'qildi deb belgilash" })
  async markAsRead(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.notificationsService.markAsRead(id, req.user.userId);
  }
}
