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
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AdsService } from './ads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, AdStatus, MediaType } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Ads')
@ApiBearerAuth()
@Controller('ads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new ad' })
  async create(@Request() req: any, @Body() body: {
    title: string;
    description?: string;
    content: string;
    mediaUrls: string[];
    mediaType: MediaType;
    price?: number;
    currency?: string;
    totalQuantity?: number;
    brandAdEnabled?: boolean;
    brandAdText?: string;
    selectedGroups?: string[];
    intervalMin?: number;
    intervalMax?: number;
    groupInterval?: number;
    isPriority?: boolean;
  }) {
    return this.adsService.create(req.user.userId, body);
  }

  @Get()
  @ApiOperation({ summary: 'Get ads list with pagination' })
  async findAll(
    @Request() req: any,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) take: number,
    @Query('status') status?: AdStatus,
    @Query('search') search?: string,
    @Query('isPriority') isPriority?: string,
  ) {
    return this.adsService.findAll(req.user.userId, {
      skip,
      take,
      status,
      search,
      isPriority: isPriority === 'true' ? true : isPriority === 'false' ? false : undefined,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard stats' })
  async getDashboardStats(@Request() req: any) {
    return this.adsService.getDashboardStats(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single ad' })
  async findOne(@Param('id') id: string) {
    return this.adsService.findOne(id);
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Get ad statistics' })
  async getStatistics(@Param('id') id: string) {
    return this.adsService.getStatistics(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update ad' })
  async update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: {
      title?: string;
      description?: string;
      content?: string;
      mediaUrls?: string[];
      mediaType?: MediaType;
      price?: number;
      currency?: string;
      totalQuantity?: number;
      brandAdEnabled?: boolean;
      brandAdText?: string;
      selectedGroups?: string[];
      intervalMin?: number;
      intervalMax?: number;
      groupInterval?: number;
      isPriority?: boolean;
      status?: AdStatus;
    },
  ) {
    return this.adsService.update(id, req.user.userId, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete ad (archive)' })
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.adsService.remove(id, req.user.userId);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish ad' })
  async publish(@Param('id') id: string, @Request() req: any) {
    return this.adsService.publish(id, req.user.userId);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause ad' })
  async pause(@Param('id') id: string, @Request() req: any) {
    return this.adsService.pause(id, req.user.userId);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Close ad' })
  async close(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { soldQuantity: number; reason?: string },
  ) {
    return this.adsService.close(
      id,
      req.user.userId,
      body.soldQuantity,
      req.user.userId,
      body.reason,
    );
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate ad' })
  async duplicate(@Param('id') id: string, @Request() req: any) {
    return this.adsService.duplicate(id, req.user.userId);
  }
}
