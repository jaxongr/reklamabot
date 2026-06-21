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

  /**
   * Global Free Mode — hammasi tekin ishlaydi (subscription tekshirilmaydi)
   * Default: true (hozir hammasi tekin)
   * Admin o'chirsa — obuna talab qilinadi
   */
  async getFreeMode(): Promise<boolean> {
    const value = await this.get('free_mode');
    // Default: TRUE — hozir hammasi tekin ishlaydi
    if (value === null) return true;
    return value === 'true' || value === '1';
  }

  async setFreeMode(enabled: boolean) {
    return this.set(
      'free_mode',
      enabled ? 'true' : 'false',
      ConfigType.BOOLEAN,
      'Global Free Mode — hammasi tekin (true) yoki obuna talab (false)',
    );
  }

  /**
   * Yangi haydovchi uchun bepul sinov obuna davri (kun)
   * Default: 30 kun (1 oy)
   */
  async getDriverTrialDays(): Promise<number> {
    const value = await this.get('driver_trial_days');
    return value ? parseInt(value, 10) : 30;
  }

  async setDriverTrialDays(days: number) {
    return this.set(
      'driver_trial_days',
      String(days),
      ConfigType.NUMBER,
      'Yangi haydovchi uchun bepul sinov obuna davri (kun)',
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

  // ============================================================
  // BLACKLISTED GROUPS (Qora ro'yxat — e'lon tarqatilmaydigan guruhlar)
  // ============================================================

  async getBlacklistedGroups(userId: string): Promise<BlacklistedGroup[]> {
    const value = await this.get(`blacklisted_groups_${userId}`);
    if (!value) return [];
    try {
      return JSON.parse(value) as BlacklistedGroup[];
    } catch {
      return [];
    }
  }

  async setBlacklistedGroups(userId: string, groups: BlacklistedGroup[]) {
    return this.set(
      `blacklisted_groups_${userId}`,
      JSON.stringify(groups),
      ConfigType.JSON,
      `Qora ro'yxat guruhlari (user: ${userId})`,
    );
  }

  async addToBlacklist(userId: string, group: BlacklistedGroup) {
    const groups = await this.getBlacklistedGroups(userId);
    const exists = groups.find(g => g.groupTelegramId === group.groupTelegramId);
    if (exists) return groups;
    groups.push(group);
    await this.setBlacklistedGroups(userId, groups);
    return groups;
  }

  async removeFromBlacklist(userId: string, groupTelegramId: string) {
    const groups = await this.getBlacklistedGroups(userId);
    const filtered = groups.filter(g => g.groupTelegramId !== groupTelegramId);
    await this.setBlacklistedGroups(userId, filtered);
    return filtered;
  }

  async isBlacklisted(userId: string, groupTelegramId: string): Promise<boolean> {
    const groups = await this.getBlacklistedGroups(userId);
    return groups.some(g => g.groupTelegramId === groupTelegramId);
  }

  // ============================================================
  // FILTER RULES (Kuzatuv filtr qoidalari)
  // ============================================================

  async getFilterRules(userId?: string): Promise<FilterRules | null> {
    const key = userId ? `filter_rules_${userId}` : 'filter_rules_global';
    const value = await this.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as FilterRules;
    } catch {
      return null;
    }
  }

  async setFilterRules(rules: FilterRules, userId?: string) {
    const key = userId ? `filter_rules_${userId}` : 'filter_rules_global';
    return this.set(
      key,
      JSON.stringify(rules),
      ConfigType.JSON,
      userId
        ? `Filtr qoidalari (user: ${userId})`
        : 'Global filtr qoidalari',
    );
  }
}

export interface FilterRules {
  keywords: string[];
  excludeKeywords: string[];
  minPrice?: number;
  maxPrice?: number;
  regions?: string[];
  cargoTypes?: string[];
  enabled: boolean;
}

export interface BlacklistedGroup {
  groupTelegramId: string;
  title: string;
  sessionId?: string;
  addedAt?: string; // ISO date
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
