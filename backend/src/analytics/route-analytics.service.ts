import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';

@Injectable()
export class RouteAnalyticsService {
  private readonly logger = new Logger(RouteAnalyticsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Task 3: Top yo'nalishlar
   */
  async getTopRoutes(dateFrom?: string, dateTo?: string, limit: number = 20) {
    const cacheKey = `analytics:top_routes:${dateFrom || 'all'}:${dateTo || 'all'}:${limit}`;
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return cached;
    } catch {}

    const where: any = {
      cargoFrom: { not: null },
      cargoTo: { not: null },
    };

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const routes = await this.prisma.order.groupBy({
      by: ['cargoFrom', 'cargoTo'],
      where,
      _count: { id: true },
      _avg: { distance: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    const result = routes.map((r, i) => ({
      rank: i + 1,
      from: r.cargoFrom,
      to: r.cargoTo,
      count: r._count.id,
      avgDistance: Math.round(r._avg.distance || 0),
    }));

    try { await this.redis.set(cacheKey, result, 300); } catch {}
    return result;
  }

  /**
   * Task 6: Mashina turi statistikasi
   */
  async getVehicleTypeStats(dateFrom?: string, dateTo?: string) {
    const cacheKey = `analytics:vehicle_stats:${dateFrom || 'all'}:${dateTo || 'all'}`;
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return cached;
    } catch {}

    const where: any = {
      vehicleType: { not: null },
    };

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const stats = await this.prisma.order.groupBy({
      by: ['vehicleType'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const total = stats.reduce((sum, s) => sum + s._count.id, 0);
    const result = stats.map((s) => ({
      vehicleType: s.vehicleType,
      count: s._count.id,
      percentage: total > 0 ? Math.round((s._count.id / total) * 1000) / 10 : 0,
    }));

    try { await this.redis.set(cacheKey, result, 300); } catch {}
    return result;
  }

  /**
   * Task 7: Kun-yo'nalish analitikasi (heatmap)
   */
  async getDayRouteAnalytics(dateFrom?: string, dateTo?: string, limit: number = 15) {
    const cacheKey = `analytics:day_route:${dateFrom || 'all'}:${dateTo || 'all'}`;
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return cached;
    } catch {}

    const where: any = {
      cargoFrom: { not: null },
      cargoTo: { not: null },
    };

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    // Top yo'nalishlarni topish
    const topRoutes = await this.prisma.order.groupBy({
      by: ['cargoFrom', 'cargoTo'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    // Har bir yo'nalish uchun hafta kunlari bo'yicha hisoblash
    const routeKeys = topRoutes.map((r) => `${r.cargoFrom}→${r.cargoTo}`);
    const heatmapData: Record<string, number[]> = {};

    for (const route of topRoutes) {
      const key = `${route.cargoFrom}→${route.cargoTo}`;
      heatmapData[key] = [0, 0, 0, 0, 0, 0, 0]; // Dush-Yak

      // Hafta kunlari uchun raw SQL
      const orders = await this.prisma.order.findMany({
        where: {
          ...where,
          cargoFrom: route.cargoFrom,
          cargoTo: route.cargoTo,
        },
        select: { createdAt: true },
      });

      for (const order of orders) {
        const day = order.createdAt.getDay(); // 0=Sunday
        const idx = day === 0 ? 6 : day - 1; // 0=Monday
        heatmapData[key][idx]++;
      }
    }

    const dayNames = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'];
    const result = {
      routes: routeKeys,
      days: dayNames,
      data: heatmapData,
    };

    try { await this.redis.set(cacheKey, result, 600); } catch {}
    return result;
  }

  /**
   * Top guruhlar — qaysi guruh eng ko'p order yaratadi
   */
  async getTopGroups(dateFrom?: string, dateTo?: string, limit: number = 30) {
    const cacheKey = `analytics:top_groups:${dateFrom || 'all'}:${dateTo || 'all'}:${limit}`;
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return cached;
    } catch {}

    const where: any = {};
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const groups = await this.prisma.order.groupBy({
      by: ['groupTelegramId', 'groupTitle'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    const total = groups.reduce((sum, g) => sum + g._count.id, 0);
    const result = groups.map((g, i) => ({
      rank: i + 1,
      groupTelegramId: g.groupTelegramId,
      groupTitle: g.groupTitle || 'Noma\'lum',
      count: g._count.id,
      percentage: total > 0 ? Math.round((g._count.id / total) * 1000) / 10 : 0,
    }));

    try { await this.redis.set(cacheKey, result, 300); } catch {}
    return result;
  }

  /**
   * Guruh orderlari kalendar bo'yicha — tanlangan guruh uchun kunlik orderlar
   */
  async getGroupCalendar(groupTelegramId: string, dateFrom?: string, dateTo?: string) {
    const cacheKey = `analytics:group_calendar:${groupTelegramId}:${dateFrom || 'all'}:${dateTo || 'all'}`;
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return cached;
    } catch {}

    const where: any = { groupTelegramId };
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const orders = await this.prisma.order.findMany({
      where,
      select: { createdAt: true },
    });

    // Kunlik hisoblash
    const daily: Record<string, number> = {};
    for (const o of orders) {
      const key = o.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
      daily[key] = (daily[key] || 0) + 1;
    }

    const result = Object.entries(daily)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    try { await this.redis.set(cacheKey, result, 300); } catch {}
    return result;
  }

  /**
   * Top telefon raqamlar — eng ko'p e'lon joylagan raqamlar
   */
  async getTopPhones(dateFrom?: string, dateTo?: string, limit: number = 30) {
    const cacheKey = `analytics:top_phones:${dateFrom || 'all'}:${dateTo || 'all'}:${limit}`;
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return cached;
    } catch {}

    const where: any = { phone: { not: null } };
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const phones = await this.prisma.order.groupBy({
      by: ['phone'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    // Har bir raqam uchun yo'nalishlar va guruhlar sonini olish
    const result = await Promise.all(
      phones.map(async (p, i) => {
        const phoneOrders = await this.prisma.order.findMany({
          where: { ...where, phone: p.phone },
          select: {
            cargoFrom: true,
            cargoTo: true,
            groupTitle: true,
            groupTelegramId: true,
            senderName: true,
            senderUsername: true,
            type: true,
          },
        });

        const routes = new Set<string>();
        const groups = new Set<string>();
        let senderName = '';
        let senderUsername = '';
        let cargoCount = 0;
        let driverCount = 0;

        for (const o of phoneOrders) {
          if (o.cargoFrom && o.cargoTo) routes.add(`${o.cargoFrom}-${o.cargoTo}`);
          if (o.groupTelegramId) groups.add(o.groupTelegramId);
          if (o.senderName && !senderName) senderName = o.senderName;
          if (o.senderUsername && !senderUsername) senderUsername = o.senderUsername;
          if (o.type === 'CARGO') cargoCount++;
          else driverCount++;
        }

        return {
          rank: i + 1,
          phone: p.phone,
          senderName: senderName || undefined,
          senderUsername: senderUsername || undefined,
          totalOrders: p._count.id,
          uniqueRoutes: routes.size,
          uniqueGroups: groups.size,
          cargoCount,
          driverCount,
          topRoutes: [...routes].slice(0, 5),
        };
      }),
    );

    try { await this.redis.set(cacheKey, result, 300); } catch {}
    return result;
  }

  /**
   * #6 Session dashboard — har bir kuzatuv session samaradorligi
   */
  async getSessionStats(dateFrom?: string, dateTo?: string) {
    const cacheKey = `analytics:session_stats:${dateFrom || 'all'}:${dateTo || 'all'}`;
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return cached;
    } catch {}

    const sessions = await this.prisma.monitorSession.findMany({
      where: { status: { in: ['ACTIVE', 'DELETED'] } },
      select: {
        id: true,
        phone: true,
        status: true,
        messagesRead: true,
        ordersFound: true,
        totalGroups: true,
        createdAt: true,
        lastMessageAt: true,
      },
    });

    const where: any = {};
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const result = await Promise.all(
      sessions.map(async (s) => {
        // Tanlangan davrdagi orderlar
        const periodOrders = await this.prisma.order.count({
          where: { ...where, monitorSessionId: s.id },
        });

        // Bugungi orderlar
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayOrders = await this.prisma.order.count({
          where: { monitorSessionId: s.id, createdAt: { gte: today } },
        });

        // Oxirgi 1 soatdagi orderlar
        const lastHour = new Date(Date.now() - 60 * 60 * 1000);
        const hourlyOrders = await this.prisma.order.count({
          where: { monitorSessionId: s.id, createdAt: { gte: lastHour } },
        });

        // Unikal guruhlar soni (orderlardan)
        const uniqueGroups = await this.prisma.order.groupBy({
          by: ['groupTelegramId'],
          where: { ...where, monitorSessionId: s.id },
        });

        // Konversiya foizi
        const conversionRate = s.messagesRead > 0
          ? Math.round((s.ordersFound / s.messagesRead) * 10000) / 100
          : 0;

        return {
          id: s.id,
          phone: s.phone,
          status: s.status,
          totalGroups: s.totalGroups,
          messagesRead: s.messagesRead,
          ordersFound: s.ordersFound,
          periodOrders,
          todayOrders,
          hourlyOrders,
          activeGroups: uniqueGroups.length,
          conversionRate,
          lastMessageAt: s.lastMessageAt,
          createdAt: s.createdAt,
        };
      }),
    );

    // Soatlik order taqsimoti — oxirgi 24 soat
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const hourlyData: Record<string, number[]> = {};

    for (const s of sessions) {
      if (s.status !== 'ACTIVE') continue;
      const orders = await this.prisma.order.findMany({
        where: { monitorSessionId: s.id, createdAt: { gte: last24h } },
        select: { createdAt: true },
      });
      const hours = new Array(24).fill(0);
      for (const o of orders) {
        const h = o.createdAt.getHours();
        hours[h]++;
      }
      hourlyData[s.id.slice(-8)] = hours;
    }

    try { await this.redis.set(cacheKey, { sessions: result, hourlyData }, 120); } catch {}
    return { sessions: result, hourlyData };
  }

  /**
   * #7 Yangi vs qaytgan yuboruvchilar
   */
  async getSenderRetention(dateFrom?: string, dateTo?: string) {
    const cacheKey = `analytics:sender_retention:${dateFrom || 'all'}:${dateTo || 'all'}`;
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return cached;
    } catch {}

    const startDate = dateFrom ? new Date(dateFrom) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = dateTo ? new Date(dateTo) : new Date();
    endDate.setHours(23, 59, 59, 999);

    // Tanlangan davrdagi orderlar
    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        phone: { not: null },
      },
      select: { phone: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Tanlangan davrdan OLDIN order bergan telefonlar
    const previousPhones = await this.prisma.order.findMany({
      where: {
        createdAt: { lt: startDate },
        phone: { not: null },
      },
      select: { phone: true },
      distinct: ['phone'],
    });
    const knownPhones = new Set(previousPhones.map((p) => p.phone));

    // Kunlik yangi vs qaytgan
    const daily: Record<string, { newCount: number; returningCount: number; total: number }> = {};
    const seenInPeriod = new Set<string>();

    for (const o of orders) {
      const day = o.createdAt.toISOString().slice(0, 10);
      if (!daily[day]) daily[day] = { newCount: 0, returningCount: 0, total: 0 };
      daily[day].total++;

      if (!seenInPeriod.has(o.phone!)) {
        seenInPeriod.add(o.phone!);
        if (knownPhones.has(o.phone!)) {
          daily[day].returningCount++;
        } else {
          daily[day].newCount++;
          knownPhones.add(o.phone!); // endi tanilgan
        }
      }
    }

    const dailyData = Object.entries(daily)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Jami
    let totalNew = 0, totalReturning = 0;
    for (const d of dailyData) {
      totalNew += d.newCount;
      totalReturning += d.returningCount;
    }

    const result = {
      daily: dailyData,
      summary: {
        totalNew,
        totalReturning,
        totalUnique: totalNew + totalReturning,
        newPercentage: totalNew + totalReturning > 0
          ? Math.round((totalNew / (totalNew + totalReturning)) * 100)
          : 0,
      },
    };

    try { await this.redis.set(cacheKey, result, 300); } catch {}
    return result;
  }

  /**
   * #8 Spam deteksiya — 1 kunda ko'p e'lon bergan raqamlar
   */
  async getSpamPhones(dateFrom?: string, dateTo?: string, minOrders: number = 5) {
    const cacheKey = `analytics:spam_phones:${dateFrom || 'all'}:${dateTo || 'all'}:${minOrders}`;
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return cached;
    } catch {}

    const startDate = dateFrom ? new Date(dateFrom) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const endDate = dateTo ? new Date(dateTo) : new Date();
    endDate.setHours(23, 59, 59, 999);

    const phones = await this.prisma.order.groupBy({
      by: ['phone'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
        phone: { not: null },
      },
      _count: { id: true },
      having: { id: { _count: { gte: minOrders } } },
      orderBy: { _count: { id: 'desc' } },
    });

    const result = await Promise.all(
      phones.map(async (p) => {
        const orders = await this.prisma.order.findMany({
          where: {
            phone: p.phone,
            createdAt: { gte: startDate, lte: endDate },
          },
          select: {
            groupTitle: true,
            groupTelegramId: true,
            senderName: true,
            senderUsername: true,
            cargoFrom: true,
            cargoTo: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        });

        const groups = new Set(orders.map((o) => o.groupTelegramId));
        const routes = new Set(
          orders
            .filter((o) => o.cargoFrom && o.cargoTo)
            .map((o) => `${o.cargoFrom} → ${o.cargoTo}`),
        );

        // Vaqt oralig'i
        const first = orders[orders.length - 1]?.createdAt;
        const last = orders[0]?.createdAt;
        const spanHours = first && last
          ? Math.round((last.getTime() - first.getTime()) / (60 * 60 * 1000) * 10) / 10
          : 0;

        return {
          phone: p.phone,
          count: p._count.id,
          senderName: orders[0]?.senderName || '',
          senderUsername: orders[0]?.senderUsername || '',
          uniqueGroups: groups.size,
          uniqueRoutes: routes.size,
          routes: [...routes].slice(0, 5),
          spanHours,
          ordersPerHour: spanHours > 0 ? Math.round((p._count.id / spanHours) * 10) / 10 : p._count.id,
        };
      }),
    );

    try { await this.redis.set(cacheKey, result, 300); } catch {}
    return result;
  }

  /**
   * #11 Guruh qiymati — har bir guruhning soatlik samaradorligi
   */
  async getGroupEfficiency(dateFrom?: string, dateTo?: string, limit: number = 50) {
    const cacheKey = `analytics:group_efficiency:${dateFrom || 'all'}:${dateTo || 'all'}:${limit}`;
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return cached;
    } catch {}

    const startDate = dateFrom ? new Date(dateFrom) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = dateTo ? new Date(dateTo) : new Date();
    endDate.setHours(23, 59, 59, 999);

    const totalHours = Math.max(1, (endDate.getTime() - startDate.getTime()) / (60 * 60 * 1000));

    const groups = await this.prisma.order.groupBy({
      by: ['groupTelegramId', 'groupTitle'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    const result = await Promise.all(
      groups.map(async (g) => {
        // Unikal telefon raqamlar (haqiqiy unikal orderlar)
        const uniquePhones = await this.prisma.order.groupBy({
          by: ['phone'],
          where: {
            groupTelegramId: g.groupTelegramId,
            createdAt: { gte: startDate, lte: endDate },
            phone: { not: null },
          },
        });

        // Unikal yo'nalishlar
        const uniqueRoutes = await this.prisma.order.groupBy({
          by: ['cargoFrom', 'cargoTo'],
          where: {
            groupTelegramId: g.groupTelegramId,
            createdAt: { gte: startDate, lte: endDate },
            cargoFrom: { not: null },
            cargoTo: { not: null },
          },
        });

        const ordersPerHour = Math.round((g._count.id / totalHours) * 100) / 100;
        const uniqueRatio = g._count.id > 0
          ? Math.round((uniquePhones.length / g._count.id) * 100)
          : 0;

        return {
          groupTelegramId: g.groupTelegramId,
          groupTitle: g.groupTitle || 'Noma\'lum',
          totalOrders: g._count.id,
          uniquePhones: uniquePhones.length,
          uniqueRoutes: uniqueRoutes.length,
          ordersPerHour,
          uniqueRatio,
          efficiency: Math.round(ordersPerHour * uniqueRatio) / 100, // soatlik unikal order
        };
      }),
    );

    // Efficiency bo'yicha tartiblash
    result.sort((a, b) => b.efficiency - a.efficiency);

    try { await this.redis.set(cacheKey, result, 300); } catch {}
    return result;
  }
}
