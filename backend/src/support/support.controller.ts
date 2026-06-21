import { Controller, Get, Post, Patch, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, SupportTicketStatus } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Support')
@ApiBearerAuth()
@Controller('support')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  @ApiOperation({ summary: 'Tiket yaratish' })
  async createTicket(
    @Request() req: any,
    @Body() body: { subject: string; message: string },
  ) {
    return this.supportService.createTicket(req.user.userId, body.subject, body.message);
  }

  @Get('tickets')
  @ApiOperation({ summary: 'Mening tiketlarim' })
  async getUserTickets(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.supportService.getUserTickets(
      req.user.userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('tickets/all')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Barcha tiketlar (admin)' })
  async getAllTickets(
    @Query('status') status?: SupportTicketStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.supportService.getAllTickets(
      status,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Tiket tafsilotlari' })
  async getTicketWithMessages(@Param('id') id: string) {
    return this.supportService.getTicketWithMessages(id);
  }

  @Post('tickets/:id/messages')
  @ApiOperation({ summary: 'Tiketga javob' })
  async addMessage(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { message: string },
  ) {
    const role = req.user.role;
    const isStaff = role === 'ADMIN' || role === 'SUPER_ADMIN';
    return this.supportService.addMessage(id, req.user.userId, body.message, isStaff);
  }

  @Patch('tickets/:id/status')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Tiket statusini o\'zgartirish' })
  async updateTicketStatus(
    @Param('id') id: string,
    @Body() body: { status: SupportTicketStatus },
  ) {
    return this.supportService.updateTicketStatus(id, body.status);
  }
}
