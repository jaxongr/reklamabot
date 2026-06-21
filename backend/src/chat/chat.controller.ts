import { Controller, Get, Post, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, ChatRoomType } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  @ApiOperation({ summary: 'Mening xonalarim' })
  async getUserRooms(@Request() req: any) {
    return this.chatService.getUserRooms(req.user.userId);
  }

  @Get('rooms/all')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Barcha xonalar (admin)' })
  async getAllRooms(
    @Query('type') type?: ChatRoomType,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.chatService.getAllRooms(
      type,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Post('rooms')
  @ApiOperation({ summary: 'Xona yaratish' })
  async createRoom(
    @Body() body: { name: string; type: ChatRoomType; participantIds: string[] },
  ) {
    return this.chatService.createRoom(body.name, body.type, body.participantIds);
  }

  @Post('rooms/support')
  @ApiOperation({ summary: 'Support xonasi olish/yaratish' })
  async getOrCreateSupportRoom(
    @Request() req: any,
    @Body() body: { type: ChatRoomType },
  ) {
    return this.chatService.getOrCreateSupportRoom(req.user.userId, body.type);
  }

  @Get('rooms/:id/messages')
  @ApiOperation({ summary: 'Xona xabarlari' })
  async getRoomMessages(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.chatService.getRoomMessages(
      id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Post('rooms/:id/messages')
  @ApiOperation({ summary: 'Xabar yuborish' })
  async sendMessage(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { message: string },
  ) {
    return this.chatService.sendMessage(id, req.user.userId, body.message);
  }
}
