import {
  Controller,
  Get,
  Query,
  UseGuards,
  Param,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { RouteAnalyticsService } from './route-analytics.service';
import { PriceEstimationService } from './price-estimation.service';
import { SurgePricingService } from './surge-pricing.service';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly routeAnalyticsService: RouteAnalyticsService,
    private readonly priceEstimationService: PriceEstimationService,
    private readonly surgePricingService: SurgePricingService,
    private readonly exportService: ExportService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const [dashboard, trends] = await Promise.all([
      this.analyticsService.getDashboardStats(),
      this.analyticsService.getGrowthTrends(startDate, endDate),
    ]);

    return { ...dashboard, trends };
  }

  @Get('users')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get user analytics' })
  async getUserStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getUserStats(startDate, endDate);
  }

  @Get('ads')
  @ApiOperation({ summary: 'Get ad analytics' })
  async getAdStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getAdStats(startDate, endDate);
  }

  @Get('posts')
  @ApiOperation({ summary: 'Get post analytics' })
  async getPostStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getPostStats(startDate, endDate);
  }

  @Get('revenue')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get revenue analytics' })
  async getRevenueStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getRevenueStats(startDate, endDate);
  }

  // Task 3: Yo'nalish analitikasi
  @Get('routes')
  @ApiOperation({ summary: "Top yo'nalishlar" })
  async getTopRoutes(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('limit') limit?: string,
  ) {
    return this.routeAnalyticsService.getTopRoutes(
      dateFrom, dateTo,
      limit ? parseInt(limit) : 20,
    );
  }

  // Task 6: Mashina turi statistikasi
  @Get('vehicle-types')
  @ApiOperation({ summary: 'Mashina turi statistikasi' })
  async getVehicleTypeStats(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.routeAnalyticsService.getVehicleTypeStats(dateFrom, dateTo);
  }

  // Task 7: Kun-yo'nalish analitikasi (heatmap)
  @Get('day-routes')
  @ApiOperation({ summary: "Kun-yo'nalish analitikasi" })
  async getDayRouteAnalytics(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('limit') limit?: string,
  ) {
    return this.routeAnalyticsService.getDayRouteAnalytics(
      dateFrom, dateTo,
      limit ? parseInt(limit) : 15,
    );
  }

  // Top guruhlar
  @Get('top-groups')
  @ApiOperation({ summary: 'Top guruhlar statistikasi' })
  async getTopGroups(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('limit') limit?: string,
  ) {
    return this.routeAnalyticsService.getTopGroups(
      dateFrom, dateTo,
      limit ? parseInt(limit) : 30,
    );
  }

  // Guruh kalendar
  @Get('group-calendar')
  @ApiOperation({ summary: 'Guruh orderlari kalendar bo\'yicha' })
  async getGroupCalendar(
    @Query('groupTelegramId') groupTelegramId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.routeAnalyticsService.getGroupCalendar(groupTelegramId, dateFrom, dateTo);
  }

  // Top telefon raqamlar
  @Get('top-phones')
  @ApiOperation({ summary: 'Top telefon raqamlar' })
  async getTopPhones(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('limit') limit?: string,
  ) {
    return this.routeAnalyticsService.getTopPhones(
      dateFrom, dateTo,
      limit ? parseInt(limit) : 30,
    );
  }

  // Session samaradorligi
  @Get('session-stats')
  @ApiOperation({ summary: 'Kuzatuv session statistikasi' })
  async getSessionStats(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.routeAnalyticsService.getSessionStats(dateFrom, dateTo);
  }

  // Yangi vs qaytgan
  @Get('sender-retention')
  @ApiOperation({ summary: 'Yangi vs qaytgan yuboruvchilar' })
  async getSenderRetention(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.routeAnalyticsService.getSenderRetention(dateFrom, dateTo);
  }

  // Spam deteksiya
  @Get('spam-phones')
  @ApiOperation({ summary: 'Spam raqamlar' })
  async getSpamPhones(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('minOrders') minOrders?: string,
  ) {
    return this.routeAnalyticsService.getSpamPhones(
      dateFrom, dateTo,
      minOrders ? parseInt(minOrders) : 5,
    );
  }

  // Guruh qiymati/samaradorligi
  @Get('group-efficiency')
  @ApiOperation({ summary: 'Guruh samaradorligi' })
  async getGroupEfficiency(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('limit') limit?: string,
  ) {
    return this.routeAnalyticsService.getGroupEfficiency(
      dateFrom, dateTo,
      limit ? parseInt(limit) : 50,
    );
  }

  // Task 11: Narx taxmini
  @Get('price-estimate')
  @ApiOperation({ summary: 'Narx taxmini' })
  async estimatePrice(
    @Query('from') fromCity: string,
    @Query('to') toCity: string,
    @Query('vehicleType') vehicleType?: string,
  ) {
    return this.priceEstimationService.estimatePrice(fromCity, toCity, vehicleType);
  }

  // Task 12: Surge yo'nalishlar
  @Get('surge')
  @ApiOperation({ summary: "Surge yo'nalishlar" })
  async getSurgeRoutes() {
    return this.surgePricingService.getSurgeRoutes();
  }

  @Get('surge/check')
  @ApiOperation({ summary: "Surge tekshirish" })
  async checkSurge(
    @Query('from') fromCity: string,
    @Query('to') toCity: string,
  ) {
    return this.surgePricingService.checkSurge(fromCity, toCity);
  }

  @Get('user-activity')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Foydalanuvchi faollik statistikasi (kunlik)' })
  async getUserActivity(@Query('days') days?: string) {
    return this.analyticsService.getUserActivityStats(parseInt(days || '30'));
  }

  // Task 8: Eksport
  @Get('export/:entity')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Ma'lumot eksport" })
  async exportData(
    @Param('entity') entity: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Res() res?: Response,
  ) {
    let data: any[];
    let filename: string;

    switch (entity) {
      case 'orders':
        data = await this.exportService.exportOrders(dateFrom, dateTo);
        filename = 'buyurtmalar';
        break;
      case 'drivers':
        data = await this.exportService.exportDrivers(dateFrom, dateTo);
        filename = 'haydovchilar';
        break;
      case 'offers':
        data = await this.exportService.exportOffers(dateFrom, dateTo);
        filename = 'takliflar';
        break;
      case 'payments':
        data = await this.exportService.exportPayments(dateFrom, dateTo);
        filename = 'tolovlar';
        break;
      default:
        data = [];
        filename = 'data';
    }

    // JSON qaytarish — frontend CSV/XLSX ga konvert qiladi
    res!.setHeader('Content-Type', 'application/json');
    res!.setHeader('Content-Disposition', `attachment; filename=${filename}.json`);
    return res!.json(data);
  }
}
