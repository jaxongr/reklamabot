import { Controller, Get, Post, Body, Query, Request, UseGuards } from '@nestjs/common';
import { SmsService } from './sms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, SmsCategory, SmsStatus } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { SmsProviderName } from './sms-providers';

@ApiTags('SMS')
@ApiBearerAuth()
@Controller('sms')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  // ============================================================
  // GENERAL SMS
  // ============================================================

  @Post('send')
  @ApiOperation({ summary: 'Bitta SMS yuborish' })
  async sendSms(
    @Request() req: any,
    @Body() body: { phone: string; message: string; category?: SmsCategory; targetName?: string; provider?: SmsProviderName },
  ) {
    return this.smsService.sendSms(body.phone, body.message, {
      sentById: req.user.userId,
      category: body.category,
      targetName: body.targetName,
      provider: body.provider,
    });
  }

  // ============================================================
  // DRIVERS SMS
  // ============================================================

  @Get('drivers/list')
  @ApiOperation({ summary: 'Haydovchilar ro\'yxati (SMS uchun)' })
  async getDriversForSms() {
    return this.smsService.getDriversForSms();
  }

  @Post('drivers/send')
  @ApiOperation({ summary: 'Haydovchilarga SMS yuborish' })
  async sendToDrivers(
    @Request() req: any,
    @Body() body: { message: string; driverIds?: string[]; provider?: SmsProviderName },
  ) {
    return this.smsService.sendToDrivers(body.message, req.user.userId, body.driverIds, body.provider);
  }

  // ============================================================
  // ORDERS SMS
  // ============================================================

  @Get('orders/list')
  @ApiOperation({ summary: 'Orderlar ro\'yxati (SMS uchun)' })
  async getOrdersForSms(
    @Query('type') type?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.smsService.getOrdersForSms({
      type,
      limit: limit ? parseInt(limit) : 100,
      search,
    });
  }

  @Post('orders/send')
  @ApiOperation({ summary: 'Order telefon raqamlariga SMS yuborish' })
  async sendToOrders(
    @Request() req: any,
    @Body() body: { message: string; orderIds: string[]; provider?: SmsProviderName },
  ) {
    return this.smsService.sendToOrders(body.message, req.user.userId, body.orderIds, body.provider);
  }

  // ============================================================
  // BLOCKED ADS SMS
  // ============================================================

  @Get('blocked/list')
  @ApiOperation({ summary: 'Bloklangan foydalanuvchilar (SMS uchun)' })
  async getBlockedForSms() {
    return this.smsService.getBlockedUsersForSms();
  }

  @Post('blocked/send')
  @ApiOperation({ summary: 'Bloklangan foydalanuvchilarga SMS yuborish' })
  async sendToBlocked(
    @Request() req: any,
    @Body() body: { message: string; blockedUserIds?: string[]; provider?: SmsProviderName },
  ) {
    return this.smsService.sendToBlockedAds(body.message, req.user.userId, body.blockedUserIds, body.provider);
  }

  // ============================================================
  // AUTO-SMS CONFIG
  // ============================================================

  @Get('auto-config')
  @ApiOperation({ summary: 'Avto-SMS konfiguratsiya olish' })
  async getAutoConfig() {
    return this.smsService.getAutoSmsConfig();
  }

  @Post('auto-config')
  @ApiOperation({ summary: 'Avto-SMS konfiguratsiya saqlash' })
  async setAutoConfig(
    @Body() body: {
      cargoOrderEnabled: boolean;
      cargoOrderTemplate: string;
      driverOrderEnabled: boolean;
      driverOrderTemplate: string;
      blockedEnabled: boolean;
      blockedTemplate: string;
    },
  ) {
    return this.smsService.setAutoSmsConfig(body);
  }

  // ============================================================
  // HAMMAGA SMS
  // ============================================================

  @Get('all/list')
  @ApiOperation({ summary: 'Barcha noyob telefon raqamlari' })
  async getAllPhones() {
    return this.smsService.getAllPhones();
  }

  @Post('all/send')
  @ApiOperation({ summary: 'Barcha raqamlarga SMS yuborish' })
  async sendToAll(
    @Request() req: any,
    @Body() body: { message: string; provider?: SmsProviderName },
  ) {
    return this.smsService.sendToAll(body.message, req.user.userId, body.provider);
  }

  // ============================================================
  // HISTORY & STATS
  // ============================================================

  @Get('history')
  @ApiOperation({ summary: 'SMS tarixi' })
  async getHistory(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: SmsCategory,
    @Query('status') status?: SmsStatus,
    @Query('search') search?: string,
  ) {
    return this.smsService.getHistory({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
      category,
      status,
      search,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'SMS statistikasi' })
  async getStats() {
    return this.smsService.getStats();
  }

  // ============================================================
  // SEMYSMS SETTINGS
  // ============================================================

  @Get('devices')
  @ApiOperation({ summary: 'SemySMS qurilmalar ro\'yxati' })
  async getDevices() {
    return this.smsService.getDevices();
  }

  @Get('account')
  @ApiOperation({ summary: 'SemySMS hisob ma\'lumotlari' })
  async getAccountInfo() {
    return this.smsService.getAccountInfo();
  }

  // ============================================================
  // PROVIDER SETTINGS
  // ============================================================

  @Get('providers')
  @ApiOperation({ summary: 'Barcha SMS provider holatlari' })
  async getProviders() {
    const [defaultProvider, gateway] = await Promise.all([
      this.smsService.getDefaultProvider(),
      this.smsService.getSmsGatewayConfig(),
    ]);
    return {
      defaultProvider,
      providers: {
        semysms: { name: 'SemySMS', configured: true },
        sms_gateway: { name: 'SMS Gateway', ...gateway },
      },
    };
  }

  @Post('providers/default')
  @ApiOperation({ summary: 'Default provider o\'zgartirish' })
  async setDefaultProvider(@Body() body: { provider: SmsProviderName }) {
    return this.smsService.setDefaultProvider(body.provider);
  }

  @Post('providers/sms-gateway/config')
  @ApiOperation({ summary: 'SMS Gateway konfiguratsiya' })
  async setSmsGatewayConfig(@Body() body: { url?: string; apiKey?: string }) {
    return this.smsService.setSmsGatewayConfig(body);
  }

  @Get('providers/sms-gateway/test')
  @ApiOperation({ summary: 'SMS Gateway ulanishni tekshirish' })
  async testSmsGateway() {
    return this.smsService.testSmsGateway();
  }

  @Post('retry')
  @ApiOperation({ summary: 'Failed+retryable SMS larni hoziroq qayta yuborish' })
  async retryFailedSms() {
    return this.smsService.retryFailedSms();
  }
}
