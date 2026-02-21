import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ConfigType } from '@prisma/client';

export interface PaymentCard {
  bankName: string;
  cardNumber: string;
  cardHolder: string;
  description?: string;
}

@Injectable()
export class SystemConfigService {
  private readonly logger = new Logger(SystemConfigService.name);

  constructor(private readonly prisma: PrismaService) {}

  async get(key: string): Promise<string | null> {
    const config = await this.prisma.systemConfig.findUnique({
      where: { key },
    });
    return config?.value ?? null;
  }

  async set(
    key: string,
    value: string,
    type: ConfigType = ConfigType.STRING,
    description?: string,
  ) {
    const config = await this.prisma.systemConfig.upsert({
      where: { key },
      update: { value, type, description },
      create: { key, value, type, description },
    });

    this.logger.log(`Config updated: ${key}`);
    return config;
  }

  async getAll() {
    return this.prisma.systemConfig.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async getPaymentCards(): Promise<PaymentCard[]> {
    const value = await this.get('payment_cards');
    if (!value) return [];
    try {
      return JSON.parse(value) as PaymentCard[];
    } catch {
      return [];
    }
  }

  async setPaymentCards(cards: PaymentCard[]) {
    return this.set(
      'payment_cards',
      JSON.stringify(cards),
      ConfigType.JSON,
      "To'lov uchun karta ma'lumotlari",
    );
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlanConfig[] | null> {
    const value = await this.get('subscription_plans');
    if (!value) return null;
    try {
      return JSON.parse(value) as SubscriptionPlanConfig[];
    } catch {
      return null;
    }
  }

  async setSubscriptionPlans(plans: SubscriptionPlanConfig[]) {
    return this.set(
      'subscription_plans',
      JSON.stringify(plans),
      ConfigType.JSON,
      'Obuna tariflari sozlamalari',
    );
  }
}

export interface SubscriptionPlanConfig {
  type: string;
  name: string;
  price: number;
  currency: string;
  maxAds: number;
  maxSessions: number;
  maxGroups: number;
  minInterval: number;
  maxInterval: number;
  groupInterval: number;
  durationDays: number;
}
