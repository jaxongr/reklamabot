import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, Req, Res,
  UseGuards, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AccountingService } from './accounting.service';
import { AccountingEntryType } from '@prisma/client';
import type { Response } from 'express';

@Controller('accounting')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  // ==================== SUMMARY ====================

  @Get('summary')
  async getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy?: 'day' | 'month',
  ) {
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;
    return this.accountingService.getSummary(start, end, groupBy || 'month');
  }

  // ==================== ENTRIES ====================

  @Get('entries')
  async getEntries(
    @Query('type') type?: AccountingEntryType,
    @Query('categoryId') categoryId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) take?: number,
  ) {
    return this.accountingService.getEntries({
      type,
      categoryId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      skip,
      take,
    });
  }

  @Post('entries')
  async createEntry(@Body() body: {
    type: AccountingEntryType;
    categoryId: string;
    amount: number;
    currency?: string;
    description?: string;
    date: string;
    referenceId?: string;
    referenceType?: string;
  }, @Req() req: any) {
    return this.accountingService.createEntry(
      { ...body, date: new Date(body.date) },
      req.user.userId,
    );
  }

  @Put('entries/:id')
  async updateEntry(@Param('id') id: string, @Body() body: {
    categoryId?: string;
    amount?: number;
    description?: string;
    date?: string;
  }) {
    return this.accountingService.updateEntry(id, {
      ...body,
      date: body.date ? new Date(body.date) : undefined,
    });
  }

  @Delete('entries/:id')
  async deleteEntry(@Param('id') id: string) {
    return this.accountingService.deleteEntry(id);
  }

  // ==================== CATEGORIES ====================

  @Get('categories')
  async getCategories(@Query('type') type?: AccountingEntryType) {
    return this.accountingService.getCategories(type);
  }

  @Post('categories')
  async createCategory(@Body() body: {
    name: string;
    type: AccountingEntryType;
    icon?: string;
    color?: string;
  }) {
    return this.accountingService.createCategory(body);
  }

  @Put('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() body: {
    name?: string;
    icon?: string;
    color?: string;
  }) {
    return this.accountingService.updateCategory(id, body);
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    return this.accountingService.deleteCategory(id);
  }

  // ==================== CHART DATA ====================

  @Get('chart-data')
  async getChartData(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy?: 'day' | 'month',
    @Query('type') type?: AccountingEntryType,
  ) {
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : now;
    return this.accountingService.getChartData(start, end, groupBy || 'month', type);
  }

  // ==================== PAYMENT ANALYTICS ====================

  @Get('payments')
  async getPaymentAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;
    return this.accountingService.getPaymentAnalytics(start, end);
  }

  // ==================== SYNC ====================

  @Post('sync')
  async sync(@Req() req: any) {
    return this.accountingService.syncFromSources(req.user.userId);
  }

  // ==================== EXPORT ====================

  @Get('export')
  async exportData(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('type') type?: AccountingEntryType,
    @Res() res?: Response,
  ) {
    const csv = await this.accountingService.exportEntries(
      new Date(startDate),
      new Date(endDate),
      type,
    );
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=buxgalteriya_${startDate}_${endDate}.csv`);
    // UTF-8 BOM for Excel
    res.send('\ufeff' + csv);
  }
}
