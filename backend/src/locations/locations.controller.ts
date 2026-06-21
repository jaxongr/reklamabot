import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  Body,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('search')
  async search(@Query('q') query: string) {
    if (!query || query.length < 2) {
      return [];
    }
    return this.locationsService.search(query);
  }

  @Get('distance')
  async distance(@Query('from') from: string, @Query('to') to: string) {
    if (!from || !to) {
      return { distance: null, message: 'from va to parametrlari kerak' };
    }
    return this.locationsService.calculateDistance(from, to);
  }

  @Get()
  async findAll(@Query('region') region?: string) {
    return this.locationsService.findAll(region);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async create(@Body() body: { name: string; region: string; type?: string; lat?: number; lng?: number }) {
    return this.locationsService.create(body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async remove(@Param('id') id: string) {
    return this.locationsService.remove(id);
  }

  @Post('seed')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async seed() {
    return this.locationsService.seed();
  }
}
