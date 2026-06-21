import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SystemConfigService, PaymentCard, SubscriptionPlanConfig, BlacklistedGroup } from './system-config.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole, ConfigType } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Config')
@ApiBearerAuth()
@Controller('config')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SystemConfigController {
  constructor(private readonly configService: SystemConfigService) {}

  @Get('payment-cards')
  @Public()
  @ApiOperation({ summary: "To'lov kartalarini olish" })
  async getPaymentCards() {
    return this.configService.getPaymentCards();
  }

  // ============================================================
  // GLOBAL FREE MODE — hammasi tekin ishlaydi
  // Mobile va Dashboard chaqirib oladi
  // ============================================================

  @Get('free-mode')
  @Public()
  @ApiOperation({ summary: 'Global Free Mode holati (mobile + dashboard)' })
  async getFreeMode() {
    const freeMode = await this.configService.getFreeMode();
    return { freeMode };
  }

  @Put('free-mode')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Global Free Mode yoqish/o\'chirish (admin)' })
  async setFreeMode(@Body() body: { enabled: boolean }) {
    await this.configService.setFreeMode(!!body.enabled);
    return { success: true, freeMode: !!body.enabled };
  }

  // ============================================================
  // APP VERSION CHECK (force update)
  // ============================================================

  @Get('app-version')
  @Public()
  @ApiOperation({ summary: 'Ilova versiyasi (force-update) — driver/dispatcher' })
  async getAppVersion() {
    const raw = await this.configService.get('app_versions');
    let parsed: any = null;
    if (raw) {
      try { parsed = JSON.parse(raw); } catch (_) { parsed = null; }
    }
    return parsed || {
      driver: { minVersionCode: 29, latestVersionName: '3.4.0', forceUpdate: false, updateUrl: 'https://play.google.com/store/apps/details?id=uz.yolda.driver', message: '' },
      dispatcher: { minVersionCode: 29, latestVersionName: '3.4.0', forceUpdate: false, updateUrl: 'https://t.me/yoldadispatcherbot', message: '' },
    };
  }

  @Put('app-version')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Ilova versiyalarini yangilash (admin)' })
  async setAppVersion(@Body() body: {
    driver?: { minVersionCode: number; latestVersionName: string; forceUpdate: boolean; updateUrl?: string; message?: string };
    dispatcher?: { minVersionCode: number; latestVersionName: string; forceUpdate: boolean; updateUrl?: string; message?: string };
  }) {
    await this.configService.set('app_versions', JSON.stringify(body));
    return { success: true };
  }

  @Put('payment-cards')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "To'lov kartalarini yangilash (admin)" })
  async updatePaymentCards(@Body() body: { cards: PaymentCard[] }) {
    await this.configService.setPaymentCards(body.cards);
    return { success: true };
  }

  @Get('subscription-plans')
  @Public()
  @ApiOperation({ summary: 'Obuna tariflarini olish' })
  async getSubscriptionPlans() {
    return this.configService.getSubscriptionPlans();
  }

  @Put('subscription-plans')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Obuna tariflarini yangilash (admin)' })
  async updateSubscriptionPlans(@Body() body: { plans: SubscriptionPlanConfig[] }) {
    await this.configService.setSubscriptionPlans(body.plans);
    return { success: true };
  }

  @Get('driver-trial-days')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Haydovchi sinov obuna davrini olish' })
  async getDriverTrialDays() {
    const days = await this.configService.getDriverTrialDays();
    return { days };
  }

  @Put('driver-trial-days')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Haydovchi sinov obuna davrini sozlash' })
  async setDriverTrialDays(@Body() body: { days: number }) {
    await this.configService.setDriverTrialDays(body.days);
    return { success: true, days: body.days };
  }

  @Get('filter-rules')
  @ApiOperation({ summary: 'Filtr qoidalarini olish' })
  async getFilterRules(@Request() req: any) {
    // Try user-specific rules first, then global
    const userRules = await this.configService.getFilterRules(req.user.userId);
    if (userRules) return userRules;
    const globalRules = await this.configService.getFilterRules();
    return globalRules || {
      keywords: [],
      excludeKeywords: [],
      enabled: false,
    };
  }

  @Put('filter-rules')
  @ApiOperation({ summary: 'Filtr qoidalarini saqlash' })
  async setFilterRules(
    @Request() req: any,
    @Body() body: {
      keywords: string[];
      excludeKeywords: string[];
      minPrice?: number;
      maxPrice?: number;
      regions?: string[];
      cargoTypes?: string[];
      enabled: boolean;
    },
  ) {
    await this.configService.setFilterRules(body, req.user.userId);
    return { success: true };
  }

  @Get('filter-rules/global')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Global filtr qoidalarini olish (admin)' })
  async getGlobalFilterRules() {
    const rules = await this.configService.getFilterRules();
    return rules || {
      keywords: [],
      excludeKeywords: [],
      enabled: false,
    };
  }

  @Put('filter-rules/global')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Global filtr qoidalarini saqlash (admin)' })
  async setGlobalFilterRules(@Body() body: {
    keywords: string[];
    excludeKeywords: string[];
    minPrice?: number;
    maxPrice?: number;
    regions?: string[];
    cargoTypes?: string[];
    enabled: boolean;
  }) {
    await this.configService.setFilterRules(body);
    return { success: true };
  }

  // ============================================================
  // BLACKLISTED GROUPS (Qora ro'yxat)
  // ============================================================

  @Get('blacklisted-groups')
  @ApiOperation({ summary: 'Qora ro\'yxatdagi guruhlarni olish' })
  async getBlacklistedGroups(@Request() req: any) {
    return this.configService.getBlacklistedGroups(req.user.userId);
  }

  @Post('blacklisted-groups')
  @ApiOperation({ summary: 'Guruhni qora ro\'yxatga qo\'shish' })
  async addToBlacklist(
    @Request() req: any,
    @Body() body: { groupTelegramId: string; title: string; sessionId?: string },
  ) {
    const group: BlacklistedGroup = {
      groupTelegramId: body.groupTelegramId,
      title: body.title,
      sessionId: body.sessionId,
      addedAt: new Date().toISOString(),
    };
    return this.configService.addToBlacklist(req.user.userId, group);
  }

  @Delete('blacklisted-groups/:groupTelegramId')
  @ApiOperation({ summary: 'Guruhni qora ro\'yxatdan olib tashlash' })
  async removeFromBlacklist(
    @Request() req: any,
    @Param('groupTelegramId') groupTelegramId: string,
  ) {
    return this.configService.removeFromBlacklist(req.user.userId, groupTelegramId);
  }

  @Put('blacklisted-groups')
  @ApiOperation({ summary: 'Qora ro\'yxatni to\'liq yangilash' })
  async setBlacklistedGroups(
    @Request() req: any,
    @Body() body: { groups: BlacklistedGroup[] },
  ) {
    await this.configService.setBlacklistedGroups(req.user.userId, body.groups);
    return { success: true };
  }

  @Get(':key')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Config olish (admin)' })
  async getConfig(@Param('key') key: string) {
    const value = await this.configService.get(key);
    return { key, value };
  }

  @Put(':key')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Config saqlash (admin)' })
  async setConfig(
    @Param('key') key: string,
    @Body() body: { value: string; type?: ConfigType; description?: string },
  ) {
    return this.configService.set(key, body.value, body.type, body.description);
  }
}
