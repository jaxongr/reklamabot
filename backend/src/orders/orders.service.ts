import { Injectable, Logger, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { AppGateway } from '../gateway/app.gateway';
import { OrderStatus, OrderType, OrderScope, AcceptedOrderStatus, Prisma } from '@prisma/client';
import { findCity, CITIES } from '../monitor/data/city-distances';

interface OrderFilters {
  module?: string;
  status?: OrderStatus;
  type?: OrderType;
  scope?: OrderScope;
  search?: string;
  cargoFrom?: string;
  cargoTo?: string;
  vehicleType?: string;
  dateFrom?: Date;
  dateTo?: Date;
  isManual?: boolean;
  isForSale?: boolean;
  acceptedById?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    @Inject(forwardRef(() => AppGateway)) private readonly gateway: AppGateway,
  ) {}

  /**
   * Bloklangan senderlarning telegramId lari (cached 60s)
   */
  private blockedIdsCache: string[] | null = null;
  private blockedIdsCacheTime = 0;

  private async getBlockedTelegramIds(): Promise<string[]> {
    const now = Date.now();
    if (this.blockedIdsCache && (now - this.blockedIdsCacheTime) < 60_000) {
      return this.blockedIdsCache;
    }
    const blocked = await this.prisma.blockedUser.findMany({
      where: { isActive: true, senderTelegramId: { not: '' } },
      select: { senderTelegramId: true },
      distinct: ['senderTelegramId'],
    });
    this.blockedIdsCache = blocked.map(b => b.senderTelegramId).filter(Boolean);
    this.blockedIdsCacheTime = now;
    return this.blockedIdsCache;
  }

  /**
   * Kirill → Lotin transliteratsiya (O'zbek shahar nomlari uchun)
   */
  private cyrillicToLatin(text: string): string {
    const map: Record<string, string> = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
      'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
      'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
      'ф': 'f', 'х': 'x', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
      'ъ': '', 'ы': 'i', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
      'ў': 'o\'', 'қ': 'q', 'ғ': 'g\'', 'ҳ': 'h',
      'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
      'Ж': 'J', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
      'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
      'Ф': 'F', 'Х': 'X', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
      'Ъ': '', 'Ы': 'I', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
      'Ў': 'O\'', 'Қ': 'Q', 'Ғ': 'G\'', 'Ҳ': 'H',
    };
    return text.split('').map(c => map[c] ?? c).join('');
  }

  /**
   * Shahar filtri — findCity() orqali kanonik nom + barcha aliaslar bilan qidirish
   * Lotincha/kirilcha/alias — barchasi ishlaydi
   */
  private buildCityFilter(field: 'cargoFrom' | 'cargoTo', value: string): Prisma.OrderWhereInput {
    const trimmed = value.trim();
    // findCity() — kirilcha/lotincha/alias → kanonik nom topadi
    const city = findCity(trimmed);

    if (city) {
      // Kanonik nom + barcha aliaslar bilan qidirish (max 5 ta variant)
      const variants = [city.name, ...city.aliases.slice(0, 4)];
      return {
        OR: variants.map(v => ({ [field]: { contains: v, mode: 'insensitive' as const } })),
      };
    }

    // Shahar topilmasa — oddiy qidirish + transliteratsiya
    const latin = this.cyrillicToLatin(trimmed);
    const hasCyrillic = /[а-яёўқғҳА-ЯЁЎҚҒҲ]/.test(trimmed);
    if (hasCyrillic && latin !== trimmed) {
      return {
        OR: [
          { [field]: { contains: trimmed, mode: 'insensitive' } },
          { [field]: { contains: latin, mode: 'insensitive' } },
        ],
      };
    }
    return { [field]: { contains: trimmed, mode: 'insensitive' } };
  }

  /**
   * Shahar takliflarini olish — autocomplete uchun
   */
  getCitySuggestions(query: string): { name: string; nameRu: string }[] {
    const q = query.toLowerCase().trim();
    if (q.length < 2) return [];

    return CITIES
      .filter(c => {
        if (c.name.toLowerCase().includes(q)) return true;
        return c.aliases.some(a => a.toLowerCase().includes(q));
      })
      .slice(0, 15)
      .map(c => ({
        name: c.name,
        nameRu: c.aliases.find(a => /[а-яёА-ЯЁ]/.test(a)) || c.name,
      }));
  }

  /**
   * Enrich orders with blockedByCount (how many users blocked this sender)
   */
  private async enrichWithBlockedCount(orders: any[]): Promise<any[]> {
    if (orders.length === 0) return orders;

    const senderIds = [...new Set(
      orders
        .map((o: any) => o.senderTelegramId)
        .filter((id: string | null) => id && id.length > 0),
    )];

    if (senderIds.length === 0) {
      return orders.map((o: any) => ({ ...o, blockedByCount: 0 }));
    }

    const blockCounts = await this.prisma.blockedUser.groupBy({
      by: ['senderTelegramId'],
      where: {
        senderTelegramId: { in: senderIds },
        isActive: true,
      },
      _count: { userId: true },
    });

    const countMap = new Map<string, number>();
    for (const item of blockCounts) {
      countMap.set(item.senderTelegramId, item._count.userId);
    }

    return orders.map((o: any) => ({
      ...o,
      blockedByCount: countMap.get(o.senderTelegramId) || 0,
    }));
  }

  /**
   * Get orders with filters and pagination
   */
  async findAll(userId: string | undefined, filters: OrderFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};
    if (userId) {
      where.userId = userId;
    }

    // Modul (LOGISTIKA / TAKSI) — sukut bo'yicha LOGISTIKA (logistika izolyatsiyasi)
    where.businessModule = (filters.module || 'LOGISTIKA') as any;

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    // Task 1-2: Scope filtr
    if (filters.scope) {
      where.scope = filters.scope;
    }

    // Task 4: Mashina turi filtr
    if (filters.vehicleType) {
      where.vehicleType = { contains: filters.vehicleType, mode: 'insensitive' };
    }

    // Task 10: Qo'lda yaratilgan filtr
    if (filters.isManual !== undefined) {
      where.isManual = filters.isManual;
    }

    // Task 10: Sotuvdagilar filtr
    if (filters.isForSale !== undefined) {
      where.isForSale = filters.isForSale;
    }

    // Task 13: Qabul qilinganlar filtr
    if (filters.acceptedById) {
      where.acceptedById = filters.acceptedById;
    }

    if (filters.search) {
      const searchLatin = this.cyrillicToLatin(filters.search);
      const hasCyrillic = /[а-яёўқғҳА-ЯЁЎҚҒҲ]/.test(filters.search);
      const searchTerms = [filters.search];
      if (hasCyrillic && searchLatin !== filters.search) {
        searchTerms.push(searchLatin);
      }

      const orConditions: Prisma.OrderWhereInput[] = [];
      for (const term of searchTerms) {
        orConditions.push(
          { messageText: { contains: term, mode: 'insensitive' } },
          { groupTitle: { contains: term, mode: 'insensitive' } },
          { senderName: { contains: term, mode: 'insensitive' } },
          { senderTelegramId: { equals: term } },
          { cargoFrom: { contains: term, mode: 'insensitive' } },
          { cargoTo: { contains: term, mode: 'insensitive' } },
          { phone: { contains: term, mode: 'insensitive' } },
        );
      }

      where.OR = orConditions;
    }

    if (filters.cargoFrom) {
      where.AND = [...(where.AND as any[] || []), this.buildCityFilter('cargoFrom', filters.cargoFrom)];
    }

    if (filters.cargoTo) {
      where.AND = [...(where.AND as any[] || []), this.buildCityFilter('cargoTo', filters.cargoTo)];
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    const [rawData, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    const data = await this.enrichWithBlockedCount(rawData);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single order by ID
   */
  async findOne(id: string) {
    return this.prisma.order.findUnique({ where: { id } });
  }

  /**
   * Update order status
   */
  async updateStatus(id: string, status: OrderStatus, notes?: string, acceptedStatus?: string) {
    const updateData: any = {
      status,
      ...(notes !== undefined && { notes }),
    };

    // Agar acceptedStatus CANCELLED bo'lsa, faqat statusni o'zgartirish (acceptedById saqlanadi — "Bekor" tabda ko'rinishi uchun)
    if (acceptedStatus === 'CANCELLED') {
      updateData.acceptedStatus = 'CANCELLED';
    } else if (acceptedStatus) {
      updateData.acceptedStatus = acceptedStatus;
    }

    const order = await this.prisma.order.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(`Buyurtma statusi yangilandi: ${id} → ${status}${acceptedStatus ? `, accepted: ${acceptedStatus}` : ''}`);
    return order;
  }

  /**
   * Update order details
   */
  async update(
    id: string,
    data: {
      cargoFrom?: string;
      cargoTo?: string;
      cargoType?: string;
      cargoWeight?: string;
      price?: string;
      phone?: string;
      notes?: string;
      status?: OrderStatus;
    },
  ) {
    return this.prisma.order.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete order
   */
  async remove(id: string) {
    return this.prisma.order.delete({ where: { id } });
  }

  /**
   * Get order statistics for user
   */
  async getStats(userId?: string, businessModule = 'LOGISTIKA') {
    const cacheKey = `order_stats:${businessModule}:${userId || 'all'}`;
    try {
      const cached = await this.redis.get<Record<string, number>>(cacheKey);
      if (cached) return cached;
    } catch {}

    const where: Prisma.OrderWhereInput = {};
    if (userId) where.userId = userId;
    where.businessModule = businessModule as any;

    const [total, byStatus, byType, byScope, today, thisWeek] = await Promise.all([
      this.prisma.order.count({ where }),

      this.prisma.order.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      }),

      this.prisma.order.groupBy({
        by: ['type'],
        where,
        _count: { id: true },
      }),

      // Task 1-2: Scope bo'yicha hisob
      this.prisma.order.groupBy({
        by: ['scope'],
        where,
        _count: { id: true },
      }),

      this.prisma.order.count({
        where: {
          ...where,
          createdAt: {
            // O'zbekiston vaqti (UTC+5) bo'yicha bugun
            gte: (() => {
              const now = new Date();
              const uzNow = new Date(now.getTime() + 5 * 3600000);
              uzNow.setUTCHours(0, 0, 0, 0);
              return new Date(uzNow.getTime() - 5 * 3600000);
            })(),
          },
        },
      }),

      this.prisma.order.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const statusMap: Record<string, number> = {};
    for (const item of byStatus) {
      statusMap[item.status] = item._count.id;
    }

    const typeMap: Record<string, number> = {};
    for (const item of byType) {
      typeMap[item.type] = item._count.id;
    }

    const scopeMap: Record<string, number> = {};
    for (const item of byScope) {
      scopeMap[item.scope] = item._count.id;
    }

    const result = {
      total,
      today,
      thisWeek,
      cargo: typeMap['CARGO'] || 0,
      driver: typeMap['DRIVER'] || 0,
      internal: scopeMap['INTERNAL'] || 0,
      import: scopeMap['IMPORT'] || 0,
      export: scopeMap['EXPORT'] || 0,
      new: statusMap['NEW'] || 0,
      viewed: statusMap['VIEWED'] || 0,
      contacted: statusMap['CONTACTED'] || 0,
      completed: statusMap['COMPLETED'] || 0,
      rejected: statusMap['REJECTED'] || 0,
    };

    try { await this.redis.set(cacheKey, result, 10); } catch {}

    return result;
  }

  /**
   * Batch update status
   */
  async batchUpdateStatus(ids: string[], status: OrderStatus) {
    return this.prisma.order.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });
  }

  /**
   * Get recent orders (for dashboard widget)
   */
  async getRecent(userId: string | undefined, limit: number = 10) {
    const where: Prisma.OrderWhereInput = {};
    if (userId) where.userId = userId;

    const rawData = await this.prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return this.enrichWithBlockedCount(rawData);
  }

  // ============================================================
  // Task 10: Qo'lda buyurtma yaratish
  // ============================================================

  async createManual(
    createdBy: string,
    userId: string,
    data: {
      cargoFrom: string;
      cargoTo: string;
      cargoType?: string;
      cargoWeight?: string;
      price?: string;
      phone?: string;
      vehicleType?: string;
      vehicleCapacity?: string;
      messageText?: string;
      type?: OrderType;
      isForSale?: boolean;
      salePrice?: string;
    },
  ) {
    // Scope klassifikatsiya
    let scope: OrderScope = OrderScope.INTERNAL;
    try {
      const { classifyOrderScope } = require('../monitor/data/dispatcher-keywords');
      scope = classifyOrderScope(data.cargoFrom, data.cargoTo) as OrderScope;
    } catch {}

    const order = await this.prisma.order.create({
      data: {
        userId,
        messageText: data.messageText || `Qo'lda yaratilgan: ${data.cargoFrom} → ${data.cargoTo}`,
        groupTitle: 'Qo\'lda yaratilgan',
        groupTelegramId: 'manual',
        messageDate: new Date(),
        cargoFrom: data.cargoFrom,
        cargoTo: data.cargoTo,
        cargoType: data.cargoType,
        cargoWeight: data.cargoWeight,
        price: data.price,
        phone: data.phone,
        vehicleType: data.vehicleType,
        vehicleCapacity: data.vehicleCapacity,
        type: data.type || OrderType.CARGO,
        status: OrderStatus.NEW,
        scope,
        isManual: true,
        manualCreatedBy: createdBy,
        isForSale: data.isForSale || false,
        salePrice: data.salePrice,
      },
    });

    // WebSocket — mobile/dashboardga yangi order haqida xabar
    this.gateway.emitNewOrder(userId, order);
    this.logger.log(`Qo'lda buyurtma yaratildi va emit qilindi: ${order.id}`);

    return order;
  }

  /**
   * Get for-sale orders
   */
  async getForSaleOrders(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const where: Prisma.OrderWhereInput = {
      isForSale: true,
      status: { not: OrderStatus.COMPLETED },
    };

    const [rawData, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    const data = await this.enrichWithBlockedCount(rawData);

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ============================================================
  // Task 13: Buyurtma qabul qilish
  // ============================================================

  async acceptOrder(orderId: string, userId: string) {
    // Faol qabul qilinganlar sonini tekshirish (max 10)
    const activeCount = await this.prisma.order.count({
      where: {
        acceptedById: userId,
        acceptedStatus: { in: [AcceptedOrderStatus.ACCEPTED, AcceptedOrderStatus.IN_PROGRESS] },
      },
    });

    if (activeCount >= 10) {
      throw new BadRequestException(
        'Maksimal 10 ta buyurtma qabul qilish mumkin. Avval bitta buyurtmani yoping yoki bekor qiling.',
      );
    }

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Buyurtma topilmadi');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        acceptedById: userId,
        acceptedAt: new Date(),
        acceptedStatus: AcceptedOrderStatus.ACCEPTED,
        status: OrderStatus.CONTACTED,
      },
    });

    // Accept notification o'chirilgan

    return updated;
  }

  /**
   * Qabul qilganda yuk egasiga Telegram xabar — dispetcher raqami bilan
   */
  private async sendAcceptNotification(order: any, dispatcherUserId: string) {
    try {
      const dispatcher = await this.prisma.user.findUnique({
        where: { id: dispatcherUserId },
        select: { firstName: true, lastName: true, phoneNumber: true, adPhoneNumbers: true },
      });
      if (!dispatcher) return;

      const dispPhone = dispatcher.adPhoneNumbers?.[0] || dispatcher.phoneNumber;
      const dispName = [dispatcher.firstName, dispatcher.lastName].filter(Boolean).join(' ') || 'Dispetcher';

      if (!order.senderTelegramId || !dispPhone) return;

      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) return;

      const route = [order.cargoFrom, order.cargoTo].filter(Boolean).join(' → ');
      const text = [
        `📦 Sizning e'loningiz qabul qilindi!`,
        ``,
        `🚛 ${route}`,
        order.vehicleType ? `🚗 ${order.vehicleType}` : '',
        order.price ? `💰 ${order.price}` : '',
        ``,
        `👤 Dispetcher: ${dispName}`,
        `📞 Tel: ${dispPhone}`,
      ].filter(Boolean).join('\n');

      const { execSync } = require('child_process');
      execSync(
        `curl -s -X POST "https://api.telegram.org/bot${botToken}/sendMessage" ` +
        `-d "chat_id=${order.senderTelegramId}" ` +
        `-d "text=${encodeURIComponent(text)}" ` +
        `-d "parse_mode=HTML"`,
        { timeout: 10000 },
      );

      this.logger.log(`Accept notification: ${dispName} (${dispPhone}) → sender ${order.senderTelegramId}`);
    } catch (e) {
      this.logger.warn(`Accept notification failed: ${(e as any).message}`);
    }
  }

  async getAcceptedOrders(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const where: Prisma.OrderWhereInput = { acceptedById: userId };

    const [rawData, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { acceptedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    const data = await this.enrichWithBlockedCount(rawData);

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ============================================================
  // DASHBOARD: Barcha qabul qilingan zakazlar (haydovchi ma'lumotlari bilan)
  // ============================================================

  async getAllAcceptedOrders(params: {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const { status, page = 1, limit = 20, search } = params;
    const skip = (page - 1) * limit;
    const where: any = { acceptedById: { not: null } };

    if (status === 'active') {
      where.acceptedStatus = { in: ['ACCEPTED', 'ON_WAY', 'ARRIVED'] };
    } else if (status === 'completed') {
      where.acceptedStatus = 'COMPLETED';
    } else if (status === 'cancelled') {
      where.acceptedStatus = 'CANCELLED';
    } else if (status) {
      where.acceptedStatus = status;
    }

    if (search) {
      where.OR = [
        { cargoFrom: { contains: search, mode: 'insensitive' } },
        { cargoTo: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { senderName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { acceptedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    // Haydovchi profillarni olish
    const driverIds = [...new Set(data.map(o => o.acceptedById).filter(Boolean))];
    const drivers = driverIds.length > 0
      ? await this.prisma.driverProfile.findMany({
          where: { userId: { in: driverIds as string[] } },
          select: { userId: true, fullName: true, phone: true, vehicleType: true, vehicleNumber: true, isVerified: true },
        })
      : [];
    const driverMap = new Map(drivers.map(d => [d.userId, d]));

    const enriched = data.map(order => ({
      ...order,
      driver: driverMap.get(order.acceptedById!) || null,
    }));

    // Statistika
    const [totalAccepted, activeCount, completedCount, cancelledCount] = await Promise.all([
      this.prisma.order.count({ where: { acceptedById: { not: null } } }),
      this.prisma.order.count({ where: { acceptedById: { not: null }, acceptedStatus: { in: ['ACCEPTED', 'ON_WAY', 'ARRIVED'] } } }),
      this.prisma.order.count({ where: { acceptedById: { not: null }, acceptedStatus: 'COMPLETED' } }),
      this.prisma.order.count({ where: { acceptedById: { not: null }, acceptedStatus: 'CANCELLED' } }),
    ]);

    return {
      data: enriched,
      stats: { totalAccepted, activeCount, completedCount, cancelledCount },
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ============================================================
  // Task 15: Yuk yopish
  // ============================================================

  async closeDeal(orderId: string, userId: string, amount: number) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Buyurtma topilmadi');

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        closedAmount: amount,
        closedAt: new Date(),
        closedById: userId,
        acceptedStatus: AcceptedOrderStatus.CLOSED,
        status: OrderStatus.COMPLETED,
      },
    });
  }

  async getClosedDeals(userId?: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const where: Prisma.OrderWhereInput = {
      closedAt: { not: null },
      ...(userId && { closedById: userId }),
    };

    const [data, total, sumResult] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { closedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
      this.prisma.order.aggregate({
        where,
        _sum: { closedAmount: true },
        _avg: { closedAmount: true },
        _count: { id: true },
      }),
    ]);

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      stats: {
        totalDeals: sumResult._count.id,
        totalAmount: sumResult._sum.closedAmount || 0,
        avgAmount: sumResult._avg.closedAmount || 0,
      },
    };
  }

  /**
   * Unikal telefon raqamlar — order, haydovchi, dispetcher
   */
  async getUniquePhones(filters: {
    type?: 'CARGO' | 'DRIVER' | 'ALL';
    dateFrom?: Date;
    dateTo?: Date;
    cargoFrom?: string;
    cargoTo?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {
      phone: { not: null, notIn: ['', ' '] },
    };

    if (filters.type && filters.type !== 'ALL') {
      where.type = filters.type;
    }
    if (filters.dateFrom || filters.dateTo) {
      where.messageDate = {};
      if (filters.dateFrom) where.messageDate.gte = filters.dateFrom;
      if (filters.dateTo) where.messageDate.lte = filters.dateTo;
    }
    if (filters.cargoFrom) {
      where.cargoFrom = { contains: filters.cargoFrom, mode: 'insensitive' };
    }
    if (filters.cargoTo) {
      where.cargoTo = { contains: filters.cargoTo, mode: 'insensitive' };
    }

    // Raw SQL — GROUP BY phone, count ads, blocked status
    const phoneGroups = await this.prisma.$queryRaw<
      Array<{
        phone: string;
        ads_count: bigint;
        last_name: string | null;
        last_username: string | null;
        last_type: string;
        last_date: Date;
        last_from: string | null;
        last_to: string | null;
        is_blocked: boolean;
        block_count: bigint;
      }>
    >`
      SELECT
        o.phone,
        COUNT(*)::bigint as ads_count,
        (ARRAY_AGG(o."senderName" ORDER BY o."messageDate" DESC))[1] as last_name,
        (ARRAY_AGG(o."senderUsername" ORDER BY o."messageDate" DESC))[1] as last_username,
        (ARRAY_AGG(o."type" ORDER BY o."messageDate" DESC))[1] as last_type,
        MAX(o."messageDate") as last_date,
        (ARRAY_AGG(o."cargoFrom" ORDER BY o."messageDate" DESC))[1] as last_from,
        (ARRAY_AGG(o."cargoTo" ORDER BY o."messageDate" DESC))[1] as last_to,
        COALESCE(b.block_count, 0) > 0 as is_blocked,
        COALESCE(b.block_count, 0)::bigint as block_count
      FROM "Order" o
      LEFT JOIN (
        SELECT phone, COUNT(*)::bigint as block_count
        FROM "BlockedUser"
        WHERE phone IS NOT NULL AND phone != '' AND "isActive" = true
        GROUP BY phone
      ) b ON b.phone = o.phone
      WHERE o.phone IS NOT NULL
        AND o.phone != ''
        AND o.phone != ' '
        ${filters.type && filters.type !== 'ALL' ? Prisma.sql`AND o."type" = ${filters.type}::"OrderType"` : Prisma.empty}
        ${filters.dateFrom ? Prisma.sql`AND o."messageDate" >= ${filters.dateFrom}` : Prisma.empty}
        ${filters.dateTo ? Prisma.sql`AND o."messageDate" <= ${filters.dateTo}` : Prisma.empty}
        ${filters.cargoFrom ? Prisma.sql`AND o."cargoFrom" ILIKE ${'%' + filters.cargoFrom + '%'}` : Prisma.empty}
        ${filters.cargoTo ? Prisma.sql`AND o."cargoTo" ILIKE ${'%' + filters.cargoTo + '%'}` : Prisma.empty}
      GROUP BY o.phone, b.block_count
      HAVING COALESCE(b.block_count, 0) = 0
      ORDER BY ads_count DESC
      LIMIT ${limit} OFFSET ${skip}
    `;

    // Umumiy unikal raqamlar soni (bloklangan raqamlarsiz)
    const countResult = await this.prisma.$queryRaw<[{ total: bigint }]>`
      SELECT COUNT(DISTINCT o.phone)::bigint as total
      FROM "Order" o
      WHERE o.phone IS NOT NULL
        AND o.phone != ''
        AND o.phone != ' '
        AND o.phone NOT IN (
          SELECT phone FROM "BlockedUser"
          WHERE phone IS NOT NULL AND phone != '' AND "isActive" = true
        )
        ${filters.type && filters.type !== 'ALL' ? Prisma.sql`AND o."type" = ${filters.type}::"OrderType"` : Prisma.empty}
        ${filters.dateFrom ? Prisma.sql`AND o."messageDate" >= ${filters.dateFrom}` : Prisma.empty}
        ${filters.dateTo ? Prisma.sql`AND o."messageDate" <= ${filters.dateTo}` : Prisma.empty}
        ${filters.cargoFrom ? Prisma.sql`AND o."cargoFrom" ILIKE ${'%' + filters.cargoFrom + '%'}` : Prisma.empty}
        ${filters.cargoTo ? Prisma.sql`AND o."cargoTo" ILIKE ${'%' + filters.cargoTo + '%'}` : Prisma.empty}
    `;

    const total = Number(countResult[0]?.total || 0);

    const data = phoneGroups.map(row => ({
      phone: row.phone,
      adsCount: Number(row.ads_count),
      lastSenderName: row.last_name,
      lastUsername: row.last_username,
      lastType: row.last_type,
      lastDate: row.last_date,
      lastFrom: row.last_from,
      lastTo: row.last_to,
      isBlocked: row.is_blocked || false,
      blockCount: Number(row.block_count || 0),
    }));

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Barcha unikal raqamlar — TXT eksport uchun (faqat raqamlar)
   */
  async getUniquePhonesExport(filters: {
    type?: 'CARGO' | 'DRIVER' | 'ALL';
    dateFrom?: Date;
    dateTo?: Date;
    cargoFrom?: string;
    cargoTo?: string;
  }): Promise<string[]> {
    const phones = await this.prisma.$queryRaw<Array<{ phone: string }>>`
      SELECT DISTINCT o.phone
      FROM "Order" o
      WHERE o.phone IS NOT NULL
        AND o.phone != ''
        AND o.phone != ' '
        AND o.phone NOT IN (
          SELECT phone FROM "BlockedUser"
          WHERE phone IS NOT NULL AND phone != '' AND "isActive" = true
        )
        ${filters.type && filters.type !== 'ALL' ? Prisma.sql`AND o."type" = ${filters.type}::"OrderType"` : Prisma.empty}
        ${filters.dateFrom ? Prisma.sql`AND o."messageDate" >= ${filters.dateFrom}` : Prisma.empty}
        ${filters.dateTo ? Prisma.sql`AND o."messageDate" <= ${filters.dateTo}` : Prisma.empty}
        ${filters.cargoFrom ? Prisma.sql`AND o."cargoFrom" ILIKE ${'%' + filters.cargoFrom + '%'}` : Prisma.empty}
        ${filters.cargoTo ? Prisma.sql`AND o."cargoTo" ILIKE ${'%' + filters.cargoTo + '%'}` : Prisma.empty}
      ORDER BY o.phone
    `;

    return phones.map(r => r.phone);
  }

  /**
   * Bloklangan senderlarning unikal raqamlari (Dispetcher bo'limi)
   */
  async getBlockedPhones(filters: {
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const phoneGroups = await this.prisma.$queryRaw<
      Array<{
        phone: string;
        block_count: bigint;
        ads_count: bigint;
        last_name: string | null;
        last_username: string | null;
        last_date: Date;
        last_reason: string | null;
      }>
    >`
      SELECT
        b.phone,
        COUNT(DISTINCT b.id)::bigint as block_count,
        COALESCE(oc.cnt, 0)::bigint as ads_count,
        (ARRAY_AGG(b."senderName" ORDER BY b."createdAt" DESC))[1] as last_name,
        (ARRAY_AGG(b."senderUsername" ORDER BY b."createdAt" DESC))[1] as last_username,
        MAX(b."createdAt") as last_date,
        (ARRAY_AGG(b."reason" ORDER BY b."createdAt" DESC))[1] as last_reason
      FROM "BlockedUser" b
      LEFT JOIN (
        SELECT phone, COUNT(*)::bigint as cnt
        FROM "Order"
        WHERE phone IS NOT NULL AND phone != ''
        GROUP BY phone
      ) oc ON oc.phone = b.phone
      WHERE b.phone IS NOT NULL
        AND b.phone != ''
        AND b."isActive" = true
        ${filters.dateFrom ? Prisma.sql`AND b."createdAt" >= ${filters.dateFrom}` : Prisma.empty}
        ${filters.dateTo ? Prisma.sql`AND b."createdAt" <= ${filters.dateTo}` : Prisma.empty}
      GROUP BY b.phone, oc.cnt
      ORDER BY block_count DESC
      LIMIT ${limit} OFFSET ${skip}
    `;

    const countResult = await this.prisma.$queryRaw<[{ total: bigint }]>`
      SELECT COUNT(DISTINCT b.phone)::bigint as total
      FROM "BlockedUser" b
      WHERE b.phone IS NOT NULL
        AND b.phone != ''
        AND b."isActive" = true
        ${filters.dateFrom ? Prisma.sql`AND b."createdAt" >= ${filters.dateFrom}` : Prisma.empty}
        ${filters.dateTo ? Prisma.sql`AND b."createdAt" <= ${filters.dateTo}` : Prisma.empty}
    `;

    const total = Number(countResult[0]?.total || 0);

    const data = phoneGroups.map(row => ({
      phone: row.phone,
      adsCount: Number(row.ads_count),
      blockCount: Number(row.block_count),
      isBlocked: true,
      lastSenderName: row.last_name,
      lastUsername: row.last_username,
      lastType: 'BLOCKED',
      lastDate: row.last_date,
      lastFrom: null as string | null,
      lastTo: null as string | null,
      lastReason: row.last_reason,
    }));

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Bloklangan raqamlar — TXT eksport
   */
  async getBlockedPhonesExport(filters: {
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<string[]> {
    const phones = await this.prisma.$queryRaw<Array<{ phone: string }>>`
      SELECT DISTINCT b.phone
      FROM "BlockedUser" b
      WHERE b.phone IS NOT NULL
        AND b.phone != ''
        AND b."isActive" = true
        ${filters.dateFrom ? Prisma.sql`AND b."createdAt" >= ${filters.dateFrom}` : Prisma.empty}
        ${filters.dateTo ? Prisma.sql`AND b."createdAt" <= ${filters.dateTo}` : Prisma.empty}
      ORDER BY b.phone
    `;
    return phones.map(r => r.phone);
  }
}
