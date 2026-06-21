import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { AdStatus, PostStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getDashboardStats() {
    return this.redis.getOrSet('analytics:dashboard', () => this._getDashboardStats(), 120);
  }

  private async _getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      totalAds,
      activeAds,
      totalPosts,
      completedPosts,
      totalRevenue,
      pendingPayments,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.ad.count(),
      this.prisma.ad.count({ where: { status: AdStatus.ACTIVE } }),
      this.prisma.post.count(),
      this.prisma.post.count({ where: { status: PostStatus.COMPLETED } }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: PaymentStatus.APPROVED },
      }),
      this.prisma.payment.count({ where: { status: PaymentStatus.PENDING } }),
    ]);

    const successRate = totalPosts > 0
      ? Math.round((completedPosts / totalPosts) * 100)
      : 0;

    return {
      totalUsers,
      activeUsers,
      totalAds,
      activeAds,
      totalPosts,
      completedPosts,
      successRate,
      totalRevenue: totalRevenue._sum.amount || 0,
      pendingPayments,
    };
  }

  async getUserStats(startDate?: string, endDate?: string) {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    const [totalUsers, newUsers, activeUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { createdAt: dateFilter },
      }),
      this.prisma.user.count({
        where: { isActive: true, createdAt: dateFilter },
      }),
    ]);

    // Previous period for comparison
    const prevFilter = this.buildPrevPeriodFilter(startDate, endDate);
    const prevNewUsers = await this.prisma.user.count({
      where: { createdAt: prevFilter },
    });

    const growth = prevNewUsers > 0
      ? Math.round(((newUsers - prevNewUsers) / prevNewUsers) * 1000) / 10
      : 0;

    return {
      totalUsers,
      newUsers,
      activeUsers,
      growth,
    };
  }

  async getAdStats(startDate?: string, endDate?: string) {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    const [totalAds, activeAds, closedAds, newAds] = await Promise.all([
      this.prisma.ad.count(),
      this.prisma.ad.count({ where: { status: AdStatus.ACTIVE } }),
      this.prisma.ad.count({ where: { status: AdStatus.CLOSED } }),
      this.prisma.ad.count({ where: { createdAt: dateFilter } }),
    ]);

    const prevFilter = this.buildPrevPeriodFilter(startDate, endDate);
    const prevNewAds = await this.prisma.ad.count({
      where: { createdAt: prevFilter },
    });

    const growth = prevNewAds > 0
      ? Math.round(((newAds - prevNewAds) / prevNewAds) * 1000) / 10
      : 0;

    return {
      totalAds,
      activeAds,
      closedAds,
      newAds,
      growth,
    };
  }

  async getPostStats(startDate?: string, endDate?: string) {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    const [totalPosts, completedPosts, failedPosts, newPosts] = await Promise.all([
      this.prisma.post.count(),
      this.prisma.post.count({ where: { status: PostStatus.COMPLETED } }),
      this.prisma.post.count({ where: { status: PostStatus.FAILED } }),
      this.prisma.post.count({ where: { createdAt: dateFilter } }),
    ]);

    const successRate = totalPosts > 0
      ? Math.round((completedPosts / totalPosts) * 100)
      : 0;

    return {
      totalPosts,
      completedPosts,
      failedPosts,
      newPosts,
      successRate,
    };
  }

  async getRevenueStats(startDate?: string, endDate?: string) {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    const [totalRevenue, periodRevenue, pendingRevenue] = await Promise.all([
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: PaymentStatus.APPROVED },
      }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: PaymentStatus.APPROVED,
          createdAt: dateFilter,
        },
      }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: PaymentStatus.PENDING },
      }),
    ]);

    const prevFilter = this.buildPrevPeriodFilter(startDate, endDate);
    const prevRevenue = await this.prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: PaymentStatus.APPROVED,
        createdAt: prevFilter,
      },
    });

    const currentAmount = periodRevenue._sum.amount || 0;
    const prevAmount = prevRevenue._sum.amount || 0;
    const growth = prevAmount > 0
      ? Math.round(((currentAmount - prevAmount) / prevAmount) * 1000) / 10
      : 0;

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      periodRevenue: currentAmount,
      pendingRevenue: pendingRevenue._sum.amount || 0,
      growth,
    };
  }

  async getGrowthTrends(startDate?: string, endDate?: string) {
    const [userStats, adStats, revenueStats] = await Promise.all([
      this.getUserStats(startDate, endDate),
      this.getAdStats(startDate, endDate),
      this.getRevenueStats(startDate, endDate),
    ]);

    return {
      users: { growth: userStats.growth, newUsers: userStats.newUsers },
      ads: { growth: adStats.growth, newAds: adStats.newAds },
      revenue: { growth: revenueStats.growth, periodRevenue: revenueStats.periodRevenue },
    };
  }

  async generateDailyStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsers,
      newUsers,
      totalAds,
      activeAds,
      closedAds,
      totalPosts,
      successfulPosts,
      failedPosts,
      revenue,
      pendingRevenue,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { createdAt: { gte: today } } }),
      this.prisma.ad.count(),
      this.prisma.ad.count({ where: { status: AdStatus.ACTIVE } }),
      this.prisma.ad.count({ where: { status: AdStatus.CLOSED, soldAt: { gte: today } } }),
      this.prisma.post.count({ where: { createdAt: { gte: today } } }),
      this.prisma.post.count({ where: { status: PostStatus.COMPLETED, createdAt: { gte: today } } }),
      this.prisma.post.count({ where: { status: PostStatus.FAILED, createdAt: { gte: today } } }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: PaymentStatus.APPROVED, createdAt: { gte: today } },
      }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: PaymentStatus.PENDING },
      }),
    ]);

    await this.prisma.systemStatistics.upsert({
      where: { id: `stats-${today.toISOString().split('T')[0]}` },
      update: {
        totalUsers,
        activeUsers,
        newUsers,
        totalAds,
        activeAds,
        closedAds,
        totalPosts,
        successfulPosts,
        failedPosts,
        totalRevenue: revenue._sum.amount || 0,
        pendingRevenue: pendingRevenue._sum.amount || 0,
      },
      create: {
        id: `stats-${today.toISOString().split('T')[0]}`,
        date: today,
        totalUsers,
        activeUsers,
        newUsers,
        totalAds,
        activeAds,
        closedAds,
        totalPosts,
        successfulPosts,
        failedPosts,
        totalRevenue: revenue._sum.amount || 0,
        pendingRevenue: pendingRevenue._sum.amount || 0,
      },
    });

    this.logger.log('Daily statistics generated');
  }

  private buildDateFilter(startDate?: string, endDate?: string) {
    if (!startDate && !endDate) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return { gte: thirtyDaysAgo };
    }

    const filter: any = {};
    if (startDate) filter.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.lte = end;
    }
    return filter;
  }

  private buildPrevPeriodFilter(startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date();

    if (!startDate) {
      start.setDate(start.getDate() - 30);
    }

    const duration = end.getTime() - start.getTime();
    const prevEnd = new Date(start.getTime());
    const prevStart = new Date(start.getTime() - duration);

    return { gte: prevStart, lte: prevEnd };
  }

  /**
   * Foydalanuvchi faollik statistikasi — kunlik
   * - Har kuni nechta unikal foydalanuvchi online bo'lgan
   * - O'rtacha sessiya davomiyligi
   * - Dispetcher vs Haydovchi taqsimoti
   */
  async getUserActivityStats(days: number = 30) {
    const cacheKey = `analytics:user-activity:${days}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // 1. Kunlik buyurtmalar soni
    const dailyOrders = await this.prisma.$queryRaw<
      Array<{ day: Date; order_count: bigint; cargo_count: bigint; driver_count: bigint }>
    >`
      SELECT
        DATE("createdAt") as day,
        COUNT(*)::bigint as order_count,
        COUNT(*) FILTER (WHERE "type" = 'CARGO')::bigint as cargo_count,
        COUNT(*) FILTER (WHERE "type" = 'DRIVER')::bigint as driver_count
      FROM "Order"
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY day ASC
    `;

    // 2. Kunlik ilovaga kirgan foydalanuvchilar — lastOnlineAt asosida (eng ishonchli)
    const dailyOnline = await this.prisma.$queryRaw<
      Array<{ day: Date; total_users: bigint; dispatchers: bigint; drivers: bigint; admins: bigint }>
    >`
      SELECT
        DATE("lastOnlineAt") as day,
        COUNT(DISTINCT id)::bigint as total_users,
        COUNT(DISTINCT id) FILTER (WHERE role = 'DISPATCHER')::bigint as dispatchers,
        COUNT(DISTINCT id) FILTER (WHERE role = 'DRIVER')::bigint as drivers,
        COUNT(DISTINCT id) FILTER (WHERE role IN ('ADMIN', 'SUPER_ADMIN'))::bigint as admins
      FROM "User"
      WHERE "lastOnlineAt" >= ${startDate} AND "lastOnlineAt" IS NOT NULL
      GROUP BY DATE("lastOnlineAt")
      ORDER BY day ASC
    `;

    // 3. Hozir online
    const nowOnline = await this.prisma.user.count({ where: { isOnline: true } });
    const nowDispatchers = await this.prisma.user.count({ where: { isOnline: true, role: 'DISPATCHER' } });
    const nowDrivers = await this.prisma.user.count({ where: { isOnline: true, role: 'DRIVER' } });

    // 4. Redis'dan bugungi faollik vaqti (daqiqalar)
    const today = new Date().toISOString().split('T')[0];
    const allUsers = await this.prisma.user.findMany({
      where: { role: { in: ['DISPATCHER', 'DRIVER'] } },
      select: { id: true, role: true },
    });
    let totalMinutes = 0;
    let activeUsersToday = 0;
    for (const u of allUsers) {
      const mins = parseInt(await this.redis.get(`user:activity:${u.id}:${today}`) || '0');
      if (mins > 0) {
        totalMinutes += mins;
        activeUsersToday++;
      }
    }
    const avgMinutesToday = activeUsersToday > 0 ? Math.round(totalMinutes / activeUsersToday) : 0;

    // 5. Umumiy statistika
    const totalRegistered = await this.prisma.user.count({ where: { role: { in: ['DISPATCHER', 'DRIVER'] } } });
    const totalActiveWeek = await this.prisma.user.count({
      where: { lastOnlineAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, role: { in: ['DISPATCHER', 'DRIVER'] } },
    });

    // Merge daily data — online asosiy, orderlar qo'shimcha
    const orderMap = new Map<string, { orderCount: number; cargoCount: number; driverCount: number }>();
    for (const row of dailyOrders) {
      const key = new Date(row.day).toISOString().split('T')[0];
      orderMap.set(key, {
        orderCount: Number(row.order_count),
        cargoCount: Number(row.cargo_count),
        driverCount: Number(row.driver_count),
      });
    }

    const dailyData = dailyOnline.map(row => {
      const key = new Date(row.day).toISOString().split('T')[0];
      const orders = orderMap.get(key) || { orderCount: 0, cargoCount: 0, driverCount: 0 };
      return {
        date: key,
        onlineUsers: Number(row.total_users),
        dispatchers: Number(row.dispatchers),
        drivers: Number(row.drivers),
        admins: Number(row.admins),
        ...orders,
      };
    });

    const result = {
      summary: {
        nowOnline,
        nowDispatchers,
        nowDrivers,
        totalRegistered,
        totalActiveWeek,
        activeUsersToday,
        avgMinutesToday,
      },
      daily: dailyData,
    };

    await this.redis.set(cacheKey, result, 300); // 5 min cache
    return result;
  }
}
