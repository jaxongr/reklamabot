import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { YoldaDispatchersService } from './yolda-dispatchers.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

/**
 * Admin dashboard uchun — Yolda Dispatcher akkauntlarini boshqarish
 */
@ApiTags('Yolda Dispatcher — Admin')
@Controller('yolda-dispatcher/admin/dispatchers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@ApiBearerAuth()
export class YoldaDispatchersController {
  constructor(private readonly svc: YoldaDispatchersService) {}

  @Get()
  @ApiOperation({ summary: 'Ro\'yxat' })
  list(@Query('isActive') isActive?: string, @Query('search') search?: string) {
    return this.svc.list({
      isActive: isActive === undefined ? undefined : isActive === 'true',
      search,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Yangi dispatcher yaratish' })
  create(
    @Body()
    body: {
      userId?: string;
      phone: string;
      fullName?: string;
      workMode?: 'GEOFENCED' | 'ANYWHERE';
      zoneIds?: string[];
    },
  ) {
    return this.svc.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Dispatcher yangilash' })
  update(
    @Param('id') id: string,
    @Body()
    body: {
      fullName?: string;
      workMode?: 'GEOFENCED' | 'ANYWHERE';
      isActive?: boolean;
      zoneIds?: string[];
    },
  ) {
    return this.svc.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deaktivatsiya' })
  remove(@Param('id') id: string) {
    return this.svc.delete(id);
  }
}
