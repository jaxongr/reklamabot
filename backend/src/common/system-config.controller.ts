import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SystemConfigService, PaymentCard, SubscriptionPlanConfig } from './system-config.service';
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
