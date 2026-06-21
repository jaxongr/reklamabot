import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { YoldaRequestsService } from './yolda-requests.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { YoldaDispatcherGuard } from '../auth/yolda-dispatcher.guard';

@ApiTags('Yolda Dispatcher — Driver Requests')
@Controller('yolda-dispatcher/requests')
export class YoldaRequestsController {
  constructor(private readonly svc: YoldaRequestsService) {}

  @UseGuards(YoldaDispatcherGuard)
  @ApiBearerAuth()
  @Post()
  create(
    @Req() req: any,
    @Body() body: { orderId?: string; requestedPhone?: string; orderSnapshot?: any },
  ) {
    return this.svc.create(req.yoldaDispatcherId, body);
  }

  @UseGuards(YoldaDispatcherGuard)
  @ApiBearerAuth()
  @Get('mine')
  mine(@Req() req: any) {
    return this.svc.myRequests(req.yoldaDispatcherId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @Get('admin')
  adminList(@Query('status') status?: string) {
    return this.svc.adminList(status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @Patch(':id/resolve')
  resolve(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { status: 'APPROVED' | 'REJECTED'; adminNote?: string },
  ) {
    return this.svc.resolve(id, {
      ...body,
      resolvedById: req.user?.userId || req.user?.id,
    });
  }
}
