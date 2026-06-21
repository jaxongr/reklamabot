import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { SystemConfigService } from '../common/system-config.service';
import { SmsStatus, SmsCategory } from '@prisma/client';
import {
  SmsProviderStrategy,
  SmsProviderName,
  SemySmsProvider,
  SmsGatewayProvider,
} from './sms-providers';

const SEMYSMS_API = 'https://semysms.net/api/3';
const SEMYSMS_TOKEN = '8350b6625cce837c2b5c5a22e7a8f2a0';
const SMS_GATEWAY_DEFAULT_URL = 'http://185.207.251.184:8086';
const RETRY_INTERVAL_MS = 2 * 60_000; // Har 2 minutda

@Injectable()
export class SmsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SmsService.name);
  private retryInterval?: NodeJS.Timeout;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: SystemConfigService,
  ) {}

  onModuleInit() {
    // Retry cron boshlanadi
    this.retryInterval = setInterval(() => {
      this.retryFailedSms().catch((e) => this.logger.error(`Retry xato: ${e.message}`));
    }, RETRY_INTERVAL_MS);
    this.logger.log('SMS retry cron ishga tushdi (har 2 minutda)');
  }

  onModuleDestroy() {
    if (this.retryInterval) clearInterval(this.retryInterval);
  }

  // ============================================================
  // CORE SMS SENDING
  // ============================================================

  /**
   * SMS yuborish — tanlangan provider orqali (default: semysms)
   */
  async sendSms(
    phone: string,
    message: string,
    options: {
      sentById?: string;
      category?: SmsCategory;
      targetName?: string;
      provider?: SmsProviderName;
    } = {},
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    const { sentById, category = SmsCategory.GENERAL, targetName } = options;
    const providerName = options.provider || (await this.getDefaultProvider());

    const log = await this.prisma.smsLog.create({
      data: {
        phone,
        message,
        sentById,
        category,
        targetName,
        provider: providerName,
        status: SmsStatus.PENDING,
      },
    });

    const provider = await this.getProvider(providerName);
    const result = await provider.send(phone, message);

    if (result.success) {
      await this.prisma.smsLog.update({
        where: { id: log.id },
        data: { status: SmsStatus.SENT, externalId: result.externalId },
      });
      this.logger.log(`SMS yuborildi [${providerName}]: ${phone} [${category}] ${targetName || ''}`);
      return { success: true, id: log.id };
    }

    // Retryable xato aniqlash — qurilma offline, tarmoq xatolari
    const isRetryable = this.isRetryableError(result.error);
    const nextRetryAt = isRetryable ? new Date(Date.now() + 60_000) : null; // 1 min keyin

    await this.prisma.smsLog.update({
      where: { id: log.id },
      data: {
        status: SmsStatus.FAILED,
        errorMessage: result.error,
        retryable: isRetryable,
        nextRetryAt,
      },
    });
    this.logger.warn(`SMS xato [${providerName}]: ${phone} — ${result.error}${isRetryable ? ' (retry qilinadi)' : ''}`);
    return { success: false, error: result.error };
  }

  /**
   * Xato retryable ekanligini aniqlash
   */
  private isRetryableError(error?: string): boolean {
    if (!error) return false;
    const retryablePatterns = [
      /no available device/i,
      /device.*online/i,
      /device.*offline/i,
      /network/i,
      /timeout/i,
      /econnrefused/i,
      /enotfound/i,
      /etimedout/i,
      /fetch.*failed/i,
      /503/,
      /502/,
    ];
    return retryablePatterns.some((p) => p.test(error));
  }

  /**
   * Retry cron — har 2 minutda failed+retryable SMS larni qayta yuboradi
   * FAQAT oxirgi 24 soatdagi xatoliklar — eski SMS lar yuborilmaydi
   */
  async retryFailedSms(): Promise<{ attempted: number; succeeded: number }> {
    const now = new Date();
    const MAX_RETRIES = 10;
    const RETRY_WINDOW_HOURS = 24; // Faqat oxirgi 24 soat
    const retryAfter = new Date(Date.now() - RETRY_WINDOW_HOURS * 60 * 60_000);

    const failedSms = await this.prisma.smsLog.findMany({
      where: {
        status: SmsStatus.FAILED,
        retryable: true,
        retryCount: { lt: MAX_RETRIES },
        createdAt: { gte: retryAfter }, // Faqat oxirgi 24h
        OR: [
          { nextRetryAt: null },
          { nextRetryAt: { lte: now } },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    // Eski retryable SMS larni o'chirish (24h dan oshgan bo'lsa)
    await this.prisma.smsLog.updateMany({
      where: {
        status: SmsStatus.FAILED,
        retryable: true,
        createdAt: { lt: retryAfter },
      },
      data: { retryable: false, nextRetryAt: null },
    });

    // Stuck PENDING tuzatish — 10 min'dan ko'p PENDING bo'lsa, provider ga yuborilgan deb hisoblaymiz
    // (Bu holatlar Prisma update error yuzaga kelsa bo'ladi)
    const stuckThreshold = new Date(Date.now() - 10 * 60_000);
    const stuckResult = await this.prisma.smsLog.updateMany({
      where: {
        status: SmsStatus.PENDING,
        createdAt: { lt: stuckThreshold },
      },
      data: { status: SmsStatus.SENT },
    });
    if (stuckResult.count > 0) {
      this.logger.warn(`[RETRY] ${stuckResult.count} ta stuck PENDING SMS → SENT ga tuzatildi`);
    }

    if (failedSms.length === 0) return { attempted: 0, succeeded: 0 };

    this.logger.log(`[RETRY] ${failedSms.length} ta failed SMS qayta yuboriladi`);

    let succeeded = 0;
    for (const sms of failedSms) {
      try {
        const provider = await this.getProvider(sms.provider as SmsProviderName);
        const result = await provider.send(sms.phone, sms.message);

        if (result.success) {
          await this.prisma.smsLog.update({
            where: { id: sms.id },
            data: {
              status: SmsStatus.SENT,
              externalId: result.externalId,
              errorMessage: null,
              retryable: false,
              nextRetryAt: null,
              retryCount: sms.retryCount + 1,
            },
          });
          succeeded++;
        } else {
          const stillRetryable = this.isRetryableError(result.error) && sms.retryCount + 1 < MAX_RETRIES;
          // Exponential backoff: 1m → 2m → 4m → 8m → 16m → 30m (max)
          const backoffMs = Math.min(60_000 * Math.pow(2, sms.retryCount), 30 * 60_000);
          await this.prisma.smsLog.update({
            where: { id: sms.id },
            data: {
              errorMessage: result.error,
              retryable: stillRetryable,
              retryCount: sms.retryCount + 1,
              nextRetryAt: stillRetryable ? new Date(Date.now() + backoffMs) : null,
            },
          });
        }
      } catch (e: any) {
        this.logger.error(`[RETRY] xato: ${sms.id} — ${e.message}`);
      }
    }

    this.logger.log(`[RETRY] ${succeeded}/${failedSms.length} muvaffaqiyatli qayta yuborildi`);
    return { attempted: failedSms.length, succeeded };
  }

  /**
   * Provider instance olish (cache bilan)
   */
  private async getProvider(name: SmsProviderName): Promise<SmsProviderStrategy> {
    if (name === 'sms_gateway') {
      const url = (await this.configService.get('sms_gateway_url')) || SMS_GATEWAY_DEFAULT_URL;
      const apiKey = await this.configService.get('sms_gateway_api_key');
      if (!apiKey) {
        throw new Error('SMS Gateway API key sozlanmagan. Sozlamalar > SMS > SMS Gateway ga kiriting.');
      }
      return new SmsGatewayProvider(url, apiKey);
    }
    // Default: semysms
    const deviceId = await this.getDeviceId();
    return new SemySmsProvider(SEMYSMS_TOKEN, deviceId);
  }

  /**
   * Default provider olish
   */
  async getDefaultProvider(): Promise<SmsProviderName> {
    const val = await this.configService.get('sms_default_provider');
    return val === 'sms_gateway' ? 'sms_gateway' : 'semysms';
  }

  async setDefaultProvider(provider: SmsProviderName) {
    await this.configService.set('sms_default_provider', provider);
    return { provider };
  }

  async getSmsGatewayConfig() {
    const url = (await this.configService.get('sms_gateway_url')) || SMS_GATEWAY_DEFAULT_URL;
    const apiKey = await this.configService.get('sms_gateway_api_key');
    return {
      url,
      apiKey: apiKey ? '••••' + apiKey.slice(-6) : '',
      configured: Boolean(apiKey),
    };
  }

  async setSmsGatewayConfig(config: { url?: string; apiKey?: string }) {
    if (config.url) await this.configService.set('sms_gateway_url', config.url);
    if (config.apiKey) await this.configService.set('sms_gateway_api_key', config.apiKey);
    return this.getSmsGatewayConfig();
  }

  /**
   * SMS Gateway test — balansni tekshirish orqali ulanish tekshiriladi
   */
  async testSmsGateway(): Promise<{ success: boolean; data?: any; error?: string }> {
    const url = (await this.configService.get('sms_gateway_url')) || SMS_GATEWAY_DEFAULT_URL;
    const apiKey = await this.configService.get('sms_gateway_api_key');
    if (!apiKey) return { success: false, error: 'API key kiritilmagan' };
    try {
      const response = await fetch(`${url}/api/v1/balance`, {
        headers: { 'x-api-key': apiKey },
      });
      const data = await response.json();
      if (response.ok) return { success: true, data };
      return { success: false, error: data.message || `HTTP ${response.status}` };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Bulk SMS yuborish — parallel batchlar bilan (tez)
   * SMS Gateway: 30 parallel (Android navbat — tez qabul qiladi)
   * SemySMS: 10 parallel (api rate limit hurmat)
   */
  async sendBulk(
    recipients: Array<{ phone: string; targetName?: string }>,
    message: string,
    options: { sentById?: string; category?: SmsCategory; provider?: SmsProviderName } = {},
  ) {
    const providerName = options.provider || (await this.getDefaultProvider());
    const concurrency = providerName === 'sms_gateway' ? 30 : 10;

    const results: Array<{ phone: string; targetName?: string; success: boolean; id?: string; error?: string }> = [];
    for (let i = 0; i < recipients.length; i += concurrency) {
      const batch = recipients.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(({ phone, targetName }) =>
          this.sendSms(phone, message, {
            sentById: options.sentById,
            category: options.category,
            targetName,
            provider: providerName,
          }).then((r) => ({ phone, targetName, ...r })),
        ),
      );
      results.push(...batchResults);
    }
    this.logger.log(`Bulk SMS yuborildi [${providerName}]: ${recipients.length} ta, ${results.filter(r => r.success).length} muvaffaqiyatli`);
    return results;
  }

  // ============================================================
  // DRIVERS: Haydovchilarga SMS
  // ============================================================

  /**
   * Haydovchilarga SMS — barcha aktiv haydovchilarga yoki tanlanganlarga
   */
  async sendToDrivers(
    message: string,
    sentById: string,
    driverIds?: string[],
    provider?: SmsProviderName,
  ) {
    const where: any = {
      phone: { not: null },
    };
    if (driverIds?.length) {
      where.id = { in: driverIds };
    }

    const drivers = await this.prisma.driverProfile.findMany({
      where,
      select: { id: true, phone: true, fullName: true },
    });

    const recipients = drivers
      .filter((d) => d.phone)
      .map((d) => ({ phone: d.phone!, targetName: d.fullName || d.phone! }));

    return this.sendBulk(recipients, message, {
      sentById,
      category: SmsCategory.DRIVER,
      provider,
    });
  }

  /**
   * Haydovchi ro'yxati (SMS yuborish uchun)
   */
  async getDriversForSms() {
    return this.prisma.driverProfile.findMany({
      where: {
        phone: { not: null },
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        vehicleType: true,
        lastCity: true,
      },
      orderBy: { fullName: 'asc' },
    });
  }

  // ============================================================
  // ORDERS: Order telefon raqamlariga SMS
  // ============================================================

  /**
   * Orderlar asosida SMS — tanlangan orderlarga SMS yuborish
   */
  async sendToOrders(
    message: string,
    sentById: string,
    orderIds: string[],
    provider?: SmsProviderName,
  ) {
    const orders = await this.prisma.order.findMany({
      where: {
        id: { in: orderIds },
        phone: { not: null },
      },
      select: {
        id: true,
        phone: true,
        cargoFrom: true,
        cargoTo: true,
        groupTitle: true,
        type: true,
      },
    });

    const seen = new Set<string>();
    const recipients: Array<{ phone: string; targetName: string }> = [];

    for (const order of orders) {
      if (!order.phone || seen.has(order.phone)) continue;
      seen.add(order.phone);
      const route = [order.cargoFrom, order.cargoTo].filter(Boolean).join(' → ');
      recipients.push({
        phone: order.phone,
        targetName: route || order.groupTitle || order.phone,
      });
    }

    return this.sendBulk(recipients, message, {
      sentById,
      category: SmsCategory.ORDER,
      provider,
    });
  }

  /**
   * So'nggi orderlar ro'yxati (SMS yuborish uchun filtrlash)
   */
  async getOrdersForSms(params: { type?: string; limit?: number; search?: string }) {
    const where: any = {
      phone: { not: null },
    };
    if (params.type) where.type = params.type;
    if (params.search) {
      where.OR = [
        { phone: { contains: params.search } },
        { cargoFrom: { contains: params.search, mode: 'insensitive' } },
        { cargoTo: { contains: params.search, mode: 'insensitive' } },
        { groupTitle: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.order.findMany({
      where,
      select: {
        id: true,
        phone: true,
        cargoFrom: true,
        cargoTo: true,
        type: true,
        groupTitle: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: params.limit || 100,
    });
  }

  // ============================================================
  // BLOCKED ADS: Bloklangan dispcherlar e'lonlariga SMS
  // ============================================================

  /**
   * Bloklangan foydalanuvchilar e'lonlariga SMS
   */
  async sendToBlockedAds(
    message: string,
    sentById: string,
    blockedUserIds?: string[],
    provider?: SmsProviderName,
  ) {
    const where: any = {
      isActive: true,
      phone: { not: null },
    };
    if (blockedUserIds?.length) {
      where.id = { in: blockedUserIds };
    }

    const blocked = await this.prisma.blockedUser.findMany({
      where,
      select: {
        id: true,
        phone: true,
        senderName: true,
        senderUsername: true,
        reason: true,
      },
    });

    const seen = new Set<string>();
    const recipients: Array<{ phone: string; targetName: string }> = [];

    for (const b of blocked) {
      if (!b.phone || seen.has(b.phone)) continue;
      seen.add(b.phone);
      const name = b.senderName || b.senderUsername || b.phone;
      recipients.push({ phone: b.phone, targetName: name });
    }

    return this.sendBulk(recipients, message, {
      sentById,
      category: SmsCategory.BLOCKED_AD,
      provider,
    });
  }

  /**
   * Bloklangan foydalanuvchilar ro'yxati
   */
  async getBlockedUsersForSms() {
    return this.prisma.blockedUser.findMany({
      where: {
        isActive: true,
        phone: { not: null },
      },
      select: {
        id: true,
        phone: true,
        senderName: true,
        senderUsername: true,
        senderTelegramId: true,
        reason: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ============================================================
  // SMS HISTORY & STATS
  // ============================================================

  /**
   * SMS tarixi — filtrlash bilan
   */
  async getHistory(params: {
    page?: number;
    limit?: number;
    category?: SmsCategory;
    status?: SmsStatus;
    search?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.category) where.category = params.category;
    if (params.status) where.status = params.status;
    if (params.search) {
      where.OR = [
        { phone: { contains: params.search } },
        { targetName: { contains: params.search, mode: 'insensitive' } },
        { message: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.smsLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.smsLog.count({ where }),
    ]);

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * SMS statistikasi
   */
  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, sent, failed, todayCount, byCategory] = await Promise.all([
      this.prisma.smsLog.count(),
      this.prisma.smsLog.count({ where: { status: SmsStatus.SENT } }),
      this.prisma.smsLog.count({ where: { status: SmsStatus.FAILED } }),
      this.prisma.smsLog.count({ where: { createdAt: { gte: today } } }),
      this.prisma.smsLog.groupBy({
        by: ['category'],
        _count: { id: true },
      }),
    ]);

    return {
      total,
      sent,
      failed,
      todayCount,
      byCategory: byCategory.reduce(
        (acc, item) => ({ ...acc, [item.category]: item._count.id }),
        {} as Record<string, number>,
      ),
    };
  }

  // ============================================================
  // SEMYSMS SETTINGS
  // ============================================================

  /**
   * SemySMS qurilmalar ro'yxati
   */
  async getDevices() {
    try {
      const response = await fetch(
        `${SEMYSMS_API}/devices.php?token=${SEMYSMS_TOKEN}`,
      );
      const result = await response.json();
      return result;
    } catch (error: any) {
      this.logger.error(`SemySMS devices error: ${error.message}`);
      return { error: error.message };
    }
  }

  /**
   * SemySMS hisobma'lumotlari
   */
  async getAccountInfo() {
    try {
      const response = await fetch(
        `${SEMYSMS_API}/user.php?token=${SEMYSMS_TOKEN}`,
      );
      return response.json();
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // ============================================================
  // AUTO-SMS: Real vaqtda yangi order/blocked/driver uchun
  // ============================================================

  /**
   * Yangi order topilganda avtomatik SMS yuborish (CARGO yoki DRIVER)
   */
  async onNewOrder(order: {
    phone?: string | null;
    type: string;
    cargoFrom?: string | null;
    cargoTo?: string | null;
    groupTitle?: string;
  }) {
    if (!order.phone) return;

    const config = await this.getAutoSmsConfig();
    const isDriver = order.type === 'DRIVER';

    // Tur bo'yicha tekshirish
    if (isDriver && !config.driverOrderEnabled) return;
    if (!isDriver && !config.cargoOrderEnabled) return;

    // Template tanlash
    let msg = isDriver ? (config.driverOrderTemplate || '') : (config.cargoOrderTemplate || '');
    if (!msg.trim()) return;

    const route = [order.cargoFrom, order.cargoTo].filter(Boolean).join(' → ');
    msg = msg
      .replace(/{marshrut}/g, route || 'belgilanmagan')
      .replace(/{tur}/g, isDriver ? 'Haydovchi' : 'Yuk')
      .replace(/{guruh}/g, order.groupTitle || '');

    const category = isDriver ? SmsCategory.DRIVER : SmsCategory.ORDER;
    await this.sendSms(order.phone, msg, {
      category,
      targetName: route || order.groupTitle || order.phone,
    }).catch((e) => this.logger.error(`Auto-SMS order error: ${e.message}`));
  }

  /**
   * Yangi bloklangan foydalanuvchi topilganda avtomatik SMS
   */
  async onNewBlockedUser(blocked: {
    phone?: string | null;
    senderName?: string | null;
    reason?: string;
  }) {
    if (!blocked.phone) return;

    const config = await this.getAutoSmsConfig();
    if (!config.blockedEnabled) return;

    let msg = config.blockedTemplate || '';
    if (!msg.trim()) return;

    msg = msg
      .replace(/{ism}/g, blocked.senderName || 'Foydalanuvchi')
      .replace(/{sabab}/g, blocked.reason || '');

    await this.sendSms(blocked.phone, msg, {
      category: SmsCategory.BLOCKED_AD,
      targetName: blocked.senderName || blocked.phone,
    }).catch((e) => this.logger.error(`Auto-SMS blocked error: ${e.message}`));
  }

  /**
   * Auto-SMS konfiguratsiya olish
   */
  async getAutoSmsConfig(): Promise<{
    cargoOrderEnabled: boolean;
    cargoOrderTemplate: string;
    driverOrderEnabled: boolean;
    driverOrderTemplate: string;
    blockedEnabled: boolean;
    blockedTemplate: string;
  }> {
    const raw = await this.configService.get('auto_sms_config');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // Backward compat: eski format bo'lsa yangilash
        if ('orderEnabled' in parsed && !('cargoOrderEnabled' in parsed)) {
          return {
            cargoOrderEnabled: parsed.orderEnabled || false,
            cargoOrderTemplate: parsed.orderTemplate || '',
            driverOrderEnabled: false,
            driverOrderTemplate: '',
            blockedEnabled: parsed.blockedEnabled || false,
            blockedTemplate: parsed.blockedTemplate || '',
          };
        }
        return parsed;
      } catch {}
    }
    return {
      cargoOrderEnabled: false,
      cargoOrderTemplate: 'Sizning yuk e\'loningiz topildi! {marshrut}. Biz bilan bog\'laning.',
      driverOrderEnabled: false,
      driverOrderTemplate: 'Sizning haydovchi e\'loningiz topildi! {marshrut}. Biz bilan bog\'laning.',
      blockedEnabled: false,
      blockedTemplate: 'Hurmatli {ism}, sizning e\'loningiz bloklandi. Sabab: {sabab}.',
    };
  }

  /**
   * Auto-SMS konfiguratsiya saqlash
   */
  async setAutoSmsConfig(config: {
    cargoOrderEnabled: boolean;
    cargoOrderTemplate: string;
    driverOrderEnabled: boolean;
    driverOrderTemplate: string;
    blockedEnabled: boolean;
    blockedTemplate: string;
  }) {
    await this.configService.set('auto_sms_config', JSON.stringify(config));
    return config;
  }

  // ============================================================
  // HAMMAGA SMS — barcha noyob raqamlarga
  // ============================================================

  /**
   * Barcha noyob telefon raqamlarini olish
   */
  async getAllPhones() {
    const [orders, blocked, drivers] = await Promise.all([
      this.prisma.order.findMany({
        where: { phone: { not: null } },
        select: { phone: true, cargoFrom: true, cargoTo: true, type: true },
        orderBy: { createdAt: 'desc' },
        take: 5000,
      }),
      this.prisma.blockedUser.findMany({
        where: { isActive: true, phone: { not: null } },
        select: { phone: true, senderName: true },
      }),
      this.prisma.driverProfile.findMany({
        where: { phone: { not: null } },
        select: { phone: true, fullName: true },
      }),
    ]);

    const seen = new Set<string>();
    const phones: Array<{ phone: string; source: string; name: string }> = [];

    for (const o of orders) {
      if (!o.phone || seen.has(o.phone)) continue;
      seen.add(o.phone);
      const route = [o.cargoFrom, o.cargoTo].filter(Boolean).join(' → ');
      phones.push({ phone: o.phone, source: o.type === 'DRIVER' ? 'Haydovchi order' : 'Yuk order', name: route || o.phone });
    }
    for (const b of blocked) {
      if (!b.phone || seen.has(b.phone)) continue;
      seen.add(b.phone);
      phones.push({ phone: b.phone, source: 'Bloklangan', name: b.senderName || b.phone });
    }
    for (const d of drivers) {
      if (!d.phone || seen.has(d.phone)) continue;
      seen.add(d.phone);
      phones.push({ phone: d.phone, source: 'Haydovchi', name: d.fullName || d.phone });
    }

    return phones;
  }

  /**
   * Barcha noyob raqamlarga SMS yuborish
   */
  async sendToAll(message: string, sentById: string, provider?: SmsProviderName) {
    const phones = await this.getAllPhones();
    const recipients = phones.map((p) => ({ phone: p.phone, targetName: p.name }));
    return this.sendBulk(recipients, message, {
      sentById,
      category: SmsCategory.GENERAL,
      provider,
    });
  }

  // ============================================================
  // PRIVATE HELPERS
  // ============================================================

  /**
   * Device ID olish — config yoki birinchi aktiv qurilma
   */
  private async getDeviceId(): Promise<string> {
    const configured = await this.configService.get('sms_device_id');
    if (configured) return configured;

    // Auto-detect: birinchi aktiv qurilmani olish
    try {
      const response = await fetch(
        `${SEMYSMS_API}/devices.php?token=${SEMYSMS_TOKEN}`,
      );
      const result = await response.json();
      // API qaytaradi: { data: [...], count: N, code: 0 }
      const devices = Array.isArray(result) ? result : (result?.data || []);
      if (devices.length > 0) {
        // Aktiv (arxivlanmagan) va so'nggi faol qurilmani tanlash
        const active = devices
          .filter((d: any) => !d.is_arhive && !d.is_archive)
          .sort((a: any, b: any) => new Date(b.date_last_active || 0).getTime() - new Date(a.date_last_active || 0).getTime());
        const device = active[0] || devices[0];
        const deviceId = String(device.id);
        // Cache it
        await this.configService.set('sms_device_id', deviceId);
        this.logger.log(`SemySMS device auto-detected: ${deviceId} (${device.device_name || device.manufacturer}, last active: ${device.date_last_active})`);
        return deviceId;
      }
    } catch (e: any) {
      this.logger.error(`SemySMS device auto-detect error: ${e.message}`);
    }

    return 'active'; // Fallback
  }
}
