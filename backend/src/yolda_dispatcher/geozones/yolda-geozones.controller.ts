import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { YoldaGeoZonesService } from './yolda-geozones.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { YoldaDispatcherGuard } from '../auth/yolda-dispatcher.guard';

@ApiTags('Yolda Dispatcher — GeoZones')
@Controller('yolda-dispatcher/geozones')
export class YoldaGeoZonesController {
  constructor(private readonly svc: YoldaGeoZonesService) {}

  // Dispatcher — o'z zonalarini ko'rish
  @UseGuards(YoldaDispatcherGuard)
  @ApiBearerAuth()
  @Get('mine')
  getMine(@Req() req: any) {
    return this.svc.getForDispatcher(req.yoldaDispatcherId);
  }

  // Admin — barcha zonalar
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @Get()
  list() {
    return this.svc.list();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @Post()
  create(@Req() req: any, @Body() body: any) {
    return this.svc.create({ ...body, createdById: req.user?.userId || req.user?.id });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.svc.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.delete(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @Post(':zoneId/assign/:dispatcherId')
  assign(@Param('zoneId') zoneId: string, @Param('dispatcherId') dispatcherId: string) {
    return this.svc.assignToDispatcher(zoneId, dispatcherId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @Delete(':zoneId/assign/:dispatcherId')
  unassign(@Param('zoneId') zoneId: string, @Param('dispatcherId') dispatcherId: string) {
    return this.svc.unassignFromDispatcher(zoneId, dispatcherId);
  }
}
