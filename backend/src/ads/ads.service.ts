import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { TelegramService } from '../telegram/telegram.service';
import { Ad, AdStatus, Prisma, MediaType } from '@prisma/client';

interface CreateAdDto {
  title?: string;
  description?: string;
  content?: string;
  mediaUrls?: string[];
  mediaType?: MediaType;
  price?: number | string;
  currency?: string;
  totalQuantity?: number;
  brandAdEnabled?: boolean;
  brandAdText?: string;
  selectedGroups?: string[];
  intervalMin?: number;
  intervalMax?: number;
  groupInterval?: number;
  isPriority?: boolean;
  cargoFrom?: string;
  cargoTo?: string;
  cargoWeight?: string;
  vehicleType?: string;
  status?: string;
}

interface UpdateAdDto {
  title?: string;
  description?: string;
  content?: string;
  mediaUrls?: string[];
  mediaType?: MediaType;
  price?: number;
  currency?: string;
  totalQuantity?: number;
  brandAdEnabled?: boolean;
  brandAdText?: string;
  selectedGroups?: string[];
  intervalMin?: number;
  intervalMax?: number;
  groupInterval?: number;
  isPriority?: boolean;
  status?: AdStatus;
}

@Injectable()
export class AdsService {
  private readonly logger = new Logger(AdsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramService: TelegramService,
  ) {}

  /**
   * Create new ad
   */
  async create(userId: string, data: CreateAdDto): Promise<Ad> {
    try {
      const ad = await this.prisma.ad.create({
        data: {
          userId,
          createdBy: userId,
          title: data.title || '',
          description: data.description,
          content: data.content || data.title || '',
          mediaUrls: data.mediaUrls || [],
          mediaType: data.mediaType,
          price: data.price != null ? Number(data.price) || 0 : undefined,
          currency: data.currency,
          totalQuantity: data.totalQuantity,
          brandAdEnabled: data.brandAdEnabled,
          brandAdText: data.brandAdText,
          selectedGroups: data.selectedGroups || [],
          intervalMin: data.intervalMin,
          intervalMax: data.intervalMax,
          groupInterval: data.groupInterval,
          isPriority: data.isPriority,
          cargoFrom: data.cargoFrom,
          cargoTo: data.cargoTo,
          cargoWeight: data.cargoWeight ? Number(data.cargoWeight) || 0 : undefined,
          vehicleType: data.vehicleType,
          status: (data.status as AdStatus) || AdStatus.DRAFT,
        },
      });

      this.logger.log(`Ad created: ${ad.id}`);
      return ad;
    } catch (error) {
      this.logger.error('Failed to create ad', error);
      throw error;
    }
  }

  /**
   * Find all ads for user with pagination
   */
  async findAll(userId: string, params?: {
    status?: AdStatus;
    isPriority?: boolean;
    skip?: number;
    take?: number;
    search?: string;
  }) {
    const where: Prisma.AdWhereInput = { userId };

    if (params?.status) {
      where.status = params.status;
    }

    if (params?.isPriority !== undefined) {
      where.isPriority = params.isPriority;
    }

    if (params?.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
        { content: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const { skip = 0, take = 50 } = params || {};

    const [ads, total] = await Promise.all([
      this.prisma.ad.findMany({
        where,
        skip,
        take,
        orderBy: [{ isPriority: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.ad.count({ where }),
    ]);

    return {
      data: ads,
      meta: {
        total,
        skip,
        take,
        hasMore: skip + take < total,
      },
    };
  }

  /**
   * Find ad by ID
   */
  async findOne(id: string): Promise<Ad> {
    const ad = await this.prisma.ad.findUnique({
      where: { id },
      include: {
        creator: true,
        user: true,
        posts: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!ad) {
      throw new NotFoundException('Ad not found');
    }

    return ad;
  }

  /**
   * Update ad
   */
  async update(id: string, userId: string, data: UpdateAdDto): Promise<Ad> {
    // Check ownership
    const ad = await this.findOne(id);
    if (ad.userId !== userId && ad.createdBy !== userId) {
      throw new Error('You can only update your own ads');
    }

    // Don't allow updating closed/sold ads
    if (ad.status === AdStatus.CLOSED || ad.status === AdStatus.SOLD_OUT || ad.status === AdStatus.ARCHIVED) {
      throw new Error('Cannot update closed or sold ads');
    }

    try {
      const updatedAd = await this.prisma.ad.update({
        where: { id },
        data,
      });

      this.logger.log(`Ad updated: ${id}`);
      return updatedAd;
    } catch (error) {
      this.logger.error('Failed to update ad:', error);
      throw error;
    }
  }

  /**
   * Delete ad (soft delete - archive)
   */
  async remove(id: string, userId: string): Promise<Ad> {
    const ad = await this.findOne(id);
    if (ad.userId !== userId && ad.createdBy !== userId) {
      throw new Error('You can only delete your own ads');
    }

    // Soft delete - archive
    const archivedAd = await this.prisma.ad.update({
      where: { id },
      data: {
        status: AdStatus.ARCHIVED,
      },
      });

    this.logger.log(`Ad archived: ${id}`);
    return archivedAd;
  }

  /**
   * Publish ad (make it active)
   */
  async publish(id: string, userId: string): Promise<Ad> {
    const ad = await this.findOne(id);
    if (ad.userId !== userId && ad.createdBy !== userId) {
      throw new Error('You can only publish your own ads');
    }

    if (ad.status !== AdStatus.DRAFT && ad.status !== AdStatus.PAUSED) {
      throw new Error('Ad is not in draft or paused state');
    }

    const updatedAd = await this.prisma.ad.update({
      where: { id },
      data: {
        status: AdStatus.ACTIVE,
      },
      });

    this.logger.log(`Ad published: ${id}`);
    return updatedAd;
  }

  /**
   * Pause ad
   */
  async pause(id: string, userId: string): Promise<Ad> {
    const ad = await this.findOne(id);
    if (ad.userId !== userId && ad.createdBy !== userId) {
      throw new Error('You can only pause your own ads');
    }

    if (ad.status !== AdStatus.ACTIVE) {
      throw new Error('Ad is not active');
    }

    const updatedAd = await this.prisma.ad.update({
      where: { id },
      data: {
        status: AdStatus.PAUSED,
      },
      });

    this.logger.log(`Ad paused: ${id}`);
    return updatedAd;
  }

  /**
   * Close ad (mark as sold) + guruhlardan xabarlarni o'chirish
   */
  async close(id: string, userId: string, data: {
    soldQuantity: number;
    reason?: string;
    closedAmount?: number;
    cargoFrom?: string;
    cargoTo?: string;
    cargoType?: string;
    cargoWeight?: number;
    vehicleType?: string;
    distance?: number;
  }): Promise<Ad> {
    const ad = await this.findOne(id);
    if (ad.userId !== userId && ad.createdBy !== userId) {
      throw new Error('You can only close your own ads');
    }

    // ACTIVE, DRAFT, PAUSED holatdagi e'lonlarni yopish mumkin
    if (![AdStatus.ACTIVE, AdStatus.DRAFT, AdStatus.PAUSED].includes(ad.status as any)) {
      throw new Error('Bu e\'lonni yopib bo\'lmaydi');
    }

    const updatedAd = await this.prisma.ad.update({
      where: { id },
      data: {
        status: AdStatus.CLOSED,
        soldQuantity: data.soldQuantity,
        isSold: true,
        soldAt: new Date(),
        closedBy: userId,
        closedReason: data.reason,
        closedAmount: data.closedAmount,
        cargoFrom: data.cargoFrom,
        cargoTo: data.cargoTo,
        cargoType: data.cargoType,
        cargoWeight: data.cargoWeight,
        vehicleType: data.vehicleType,
        distance: data.distance,
      },
    });

    this.logger.log(`Ad closed: ${id}, sold: ${data.soldQuantity}`);

    // Background da xabarlarni guruhlardan o'chirish (foydalanuvchi kutmasin)
    this.deleteAdMessagesInBackground(id).catch(err =>
      this.logger.error(`E'lon xabarlarini o'chirishda xatolik (ad: ${id}): ${err.message}`),
    );

    return updatedAd;
  }

  /**
   * E'lon xabarlarini background da o'chirish
   */
  private async deleteAdMessagesInBackground(adId: string): Promise<void> {
    // PostHistory dan messageId larni olish
    const histories = await this.prisma.postHistory.findMany({
      where: {
        post: { adId },
        status: 'SENT',
        messageId: { not: null },
      },
      include: {
        group: {
          select: { telegramId: true, sessionId: true },
        },
      },
    });

    if (histories.length === 0) {
      this.logger.log(`E'lon ${adId} uchun o'chiriladigan xabar topilmadi`);
      return;
    }

    const messagesToDelete = histories
      .filter(h => h.messageId && h.group)
      .map(h => ({
        messageId: h.messageId,
        groupTelegramId: h.group.telegramId,
        sessionId: h.group.sessionId,
      }));

    this.logger.log(`E'lon ${adId}: ${messagesToDelete.length} ta xabar o'chirilmoqda...`);

    const result = await this.telegramService.deleteAdMessages(messagesToDelete);
    this.logger.log(
      `E'lon ${adId} xabarlari o'chirildi: ${result.deleted} muvaffaqiyat, ${result.failed} xato`,
    );
  }

  /**
   * Duplicate ad
   */
  async duplicate(id: string, userId: string): Promise<Ad> {
    const ad = await this.findOne(id);
    if (ad.userId !== userId && ad.createdBy !== userId) {
      throw new Error('You can only duplicate your own ads');
    }

    // Create new ad with same content
    const newAd = await this.prisma.ad.create({
      data: {
        title: `${ad.title} (Nusxa)`,
        content: ad.content,
        mediaUrls: ad.mediaUrls,
        mediaType: ad.mediaType,
        price: ad.price,
        currency: ad.currency,
        totalQuantity: ad.totalQuantity,
        brandAdEnabled: ad.brandAdEnabled,
        brandAdText: ad.brandAdText,
        selectedGroups: ad.selectedGroups,
        intervalMin: ad.intervalMin,
        intervalMax: ad.intervalMax,
        groupInterval: ad.groupInterval,
        isPriority: ad.isPriority,
        userId,
        createdBy: userId,
        status: AdStatus.DRAFT,
      },
    });

    this.logger.log(`Ad duplicated: ${newAd.id}`);
    return newAd;
  }

  /**
   * Get ad statistics
   */
  async getStatistics(adId: string) {
    const ad = await this.findOne(adId);

    const [
      totalPosts,
      successfulPosts,
      failedPosts,
      totalViews,
      totalGroups,
    ] = await Promise.all([
      this.prisma.post.count({ where: { adId } }),
      this.prisma.post.count({ where: { adId, status: 'COMPLETED' } }),
      this.prisma.post.count({ where: { adId, status: 'FAILED' } }),
      this.prisma.adStatistics.aggregate({
        _sum: { views: true },
        where: { adId },
      }),
      this.prisma.postHistory.aggregate({
        where: { post: { adId } },
        _count: { groupId: true },
      }),
      ]);

    return {
      ad: {
        id: ad.id,
        title: ad.title,
        status: ad.status,
        price: ad.price,
        currency: ad.currency,
        totalQuantity: ad.totalQuantity,
        soldQuantity: ad.soldQuantity,
        isSold: ad.isSold,
        soldAt: ad.soldAt,
        viewCount: totalViews?._sum?.views || 0,
      },
      posts: {
        total: totalPosts,
        successful: successfulPosts,
        failed: failedPosts,
        successRate: totalPosts > 0 ? Math.round((successfulPosts / totalPosts) * 100) : 0,
      },
      engagement: {
        totalGroups: totalGroups?._count || 0,
      },
    };
  }

  /**
   * Get price analytics for user's ads
   */
  async getPriceAnalytics(userId: string, params?: {
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: Prisma.AdWhereInput = {
      userId,
      status: AdStatus.CLOSED,
      price: { not: null },
    };

    if (params?.startDate || params?.endDate) {
      where.soldAt = {
        ...(params.startDate && { gte: params.startDate }),
        ...(params.endDate && { lte: params.endDate }),
      };
    }

    const ads = await this.prisma.ad.findMany({
      where,
      select: {
        id: true,
        price: true,
        currency: true,
        totalQuantity: true,
        soldQuantity: true,
        soldAt: true,
      },
    });

    if (ads.length === 0) {
      return {
        averagePrice: 0,
        totalRevenue: 0,
        totalItemsSold: 0,
        byCurrency: {},
        priceDistribution: [],
      };
    }

    // Group by currency
    const byCurrency: Record<string, { totalRevenue: number; totalItemsSold: number; averagePrice: number }> = {};
    const priceDistribution: { price: string; count: number; range: string }[] = [];

    for (const ad of ads) {
      const currency = ad.currency || 'UZS';
      const revenue = (ad.price || 0) * (ad.soldQuantity || 0);
      const itemsSold = ad.soldQuantity || 0;

      if (!byCurrency[currency]) {
        byCurrency[currency] = {
          totalRevenue: 0,
          totalItemsSold: 0,
          averagePrice: 0,
        };
      }

      byCurrency[currency].totalRevenue += revenue;
      byCurrency[currency].totalItemsSold += itemsSold;
      byCurrency[currency].averagePrice = byCurrency[currency].totalRevenue / (byCurrency[currency].totalItemsSold || 1);

      if (ad.price) {
        const priceRange = this.getPriceRange(ad.price || 0);
        priceDistribution.push({
          price: String(ad.price || 0),
          count: itemsSold,
          range: priceRange,
        });
      }
    }

    // Calculate average prices
    for (const currency in byCurrency) {
      byCurrency[currency].averagePrice = byCurrency[currency].totalItemsSold > 0
        ? byCurrency[currency].totalRevenue / byCurrency[currency].totalItemsSold
        : 0;
    }

    return {
      averagePrice: Object.values(byCurrency).reduce((sum, c) => sum + c.averagePrice, 0) / Object.keys(byCurrency).length,
      totalRevenue: Object.values(byCurrency).reduce((sum, c) => sum + c.totalRevenue, 0),
      totalItemsSold: Object.values(byCurrency).reduce((sum, c) => sum + c.totalItemsSold, 0),
      byCurrency,
      priceDistribution,
    };
  }

  /**
   * Helper method to get price range
   */
  private getPriceRange(price: number): string {
    if (price < 100000) return '0-100K';
    if (price < 500000) return '100K-500K';
    if (price < 1000000) return '500K-1M';
    if (price < 5000000) return '1M-5M';
    return '5M+';
  }

  /**
   * Dashboard dan qo'lda yopilgan yuk kiritish
   */
  async createManualClosed(userId: string, data: {
    content?: string;
    closedAmount?: number;
    cargoFrom?: string;
    cargoTo?: string;
    cargoType?: string;
    cargoWeight?: number;
    vehicleType?: string;
    distance?: number;
    soldAt?: string;
  }): Promise<Ad> {
    const title = data.cargoFrom && data.cargoTo
      ? `${data.cargoFrom} → ${data.cargoTo}`
      : 'Qo\'lda kiritilgan yuk';

    const ad = await this.prisma.ad.create({
      data: {
        userId,
        createdBy: userId,
        title,
        content: data.content || title,
        mediaType: 'TEXT',
        status: AdStatus.CLOSED,
        isSold: true,
        soldAt: data.soldAt ? new Date(data.soldAt) : new Date(),
        soldQuantity: 1,
        closedBy: userId,
        closedAmount: data.closedAmount,
        cargoFrom: data.cargoFrom,
        cargoTo: data.cargoTo,
        cargoType: data.cargoType,
        cargoWeight: data.cargoWeight,
        vehicleType: data.vehicleType,
        distance: data.distance,
        isManualEntry: true,
      },
    });

    this.logger.log(`Manual closed deal created: ${ad.id}`);
    return ad;
  }

  /**
   * Yopilgan yuklar ro'yxati (barcha yoki userId bo'yicha)
   */
  async findClosed(params?: {
    userId?: string;
    skip?: number;
    take?: number;
    search?: string;
    cargoType?: string;
    startDate?: string;
    endDate?: string;
  }) {
    // Faqat deal recordlarni ko'rsatish (closedAmount bor = deal, yo'q = asl e'lon)
    const where: Prisma.AdWhereInput = {
      status: AdStatus.CLOSED,
      closedAmount: { not: null },
    };

    if (params?.userId) {
      where.userId = params.userId;
    }

    if (params?.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { content: { contains: params.search, mode: 'insensitive' } },
        { cargoFrom: { contains: params.search, mode: 'insensitive' } },
        { cargoTo: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params?.cargoType) {
      where.cargoType = { contains: params.cargoType, mode: 'insensitive' };
    }

    if (params?.startDate || params?.endDate) {
      where.soldAt = {};
      if (params.startDate) (where.soldAt as any).gte = new Date(params.startDate);
      if (params.endDate) (where.soldAt as any).lte = new Date(params.endDate);
    }

    const { skip = 0, take = 50 } = params || {};

    const [ads, total, aggregate] = await Promise.all([
      this.prisma.ad.findMany({
        where,
        skip,
        take,
        orderBy: { soldAt: 'desc' },
        include: { user: { select: { firstName: true, username: true, telegramId: true } } },
      }),
      this.prisma.ad.count({ where }),
      this.prisma.ad.aggregate({
        where,
        _sum: { closedAmount: true, cargoWeight: true },
        _avg: { closedAmount: true, cargoWeight: true },
        _count: true,
      }),
    ]);

    return {
      data: ads,
      meta: { total, skip, take, hasMore: skip + take < total },
      stats: {
        totalDeals: aggregate._count,
        totalAmount: aggregate._sum.closedAmount || 0,
        totalWeight: aggregate._sum.cargoWeight || 0,
        avgAmount: aggregate._avg.closedAmount || 0,
        avgWeight: aggregate._avg.cargoWeight || 0,
      },
    };
  }

  /**
   * Get dashboard stats for user
   */
  async getDashboardStats(userId: string) {
    const totalUsers = await this.prisma.user.count();
    const activeUsers = await this.prisma.user.count({ where: { isActive: true } });
    const totalAds = await this.prisma.ad.count({ where: { userId } });
    const activeAds = await this.prisma.ad.count({ where: { userId, status: 'ACTIVE' } });
    const draftAds = await this.prisma.ad.count({ where: { userId, status: 'DRAFT' } });
    const closedAds = await this.prisma.ad.count({ where: { userId, status: 'CLOSED' } });

    const priceAnalytics = await this.getPriceAnalytics(userId);

    // Oxirgi 7 kunlik e'lon faolligi trendi (grafik uchun real ma'lumot)
    const { trend, growthPercent } = await this.getAdTrend(userId);

    return {
      user: {
        totalUsers,
        activeUsers,
        totalAds,
        activeAds,
        draftAds,
        closedAds,
      },
      revenue: priceAnalytics,
      // Mobil statistika grafigi uchun (additive — eski iste'molchilarga ta'sir qilmaydi)
      trend,
      growthPercent,
    };
  }

  /**
   * Foydalanuvchining oxirgi 7 kunlik e'lon yaratish faolligi.
   * trend: har kun uchun e'lonlar soni (eskidan yangiga, 7 element).
   * growthPercent: shu hafta vs o'tgan hafta o'sishi (%).
   */
  private async getAdTrend(userId: string): Promise<{ trend: number[]; growthPercent: number }> {
    const days = 7;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 14 kunlik oynani bir so'rovda olamiz (shu hafta + o'tgan hafta)
    const windowStart = new Date(startOfToday);
    windowStart.setDate(windowStart.getDate() - (days * 2 - 1));

    const ads = await this.prisma.ad.findMany({
      where: { userId, createdAt: { gte: windowStart } },
      select: { createdAt: true },
    });

    const dayMs = 86400000;
    const buckets: number[] = new Array<number>(days * 2).fill(0);
    for (const a of ads) {
      const d = new Date(a.createdAt);
      d.setHours(0, 0, 0, 0);
      const idx = Math.floor((d.getTime() - windowStart.getTime()) / dayMs);
      if (idx >= 0 && idx < buckets.length) buckets[idx]++;
    }

    const prevWeek: number[] = buckets.slice(0, days); // o'tgan hafta
    const thisWeek: number[] = buckets.slice(days); // shu hafta
    const prevSum = prevWeek.reduce((s, n) => s + n, 0);
    const thisSum = thisWeek.reduce((s, n) => s + n, 0);

    let growthPercent = 0;
    if (prevSum > 0) {
      growthPercent = Math.round(((thisSum - prevSum) / prevSum) * 1000) / 10;
    } else if (thisSum > 0) {
      growthPercent = 100;
    }

    return { trend: thisWeek, growthPercent };
  }
}
