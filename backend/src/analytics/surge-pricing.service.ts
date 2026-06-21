import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SurgePricingService {
  private readonly logger = new Logger(SurgePricingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Task 12: Surge tekshirish
   */
  async checkSurge(fromCity: string, toCity: string): Promise<{
    surgeMultiplier: number;
    orderCount: number;
    offerCount: number;
    isSurge: boolean;
  }> {
    const cacheKey = `surge:${fromCity}:${toCity}`;
    try {
      const cached = await this.redis.get<any>(cacheKey);
      if (cached) return cached;
    } catch {}

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const hour = new Date().getHours();

    const demand = await this.prisma.routeDemand.findUnique({
      where: {
        fromCity_toCity_date_hour: {
          fromCity,
          toCity,
          date: today,
          hour,
        },
      },
    });

    const result = {
      surgeMultiplier: demand?.surgeMultiplier || 1.0,
      orderCount: demand?.orderCount || 0,
      offerCount: demand?.offerCount || 0,
      isSurge: (demand?.surgeMultiplier || 1.0) > 1.2,
    };

    try { await this.redis.set(cacheKey, result, 300); } catch {}
    return result;
  }

  /**
   * Soatlik talab/taklif yangilanishi
   */
  @Cron(CronExpression.EVERY_HOUR)
  async updateRouteDemand() {
    this.logger.log('Yo\'nalish talabi yangilanmoqda...');

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const hour = now.getHours();

    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // So'nggi 1 soatdagi orderlarni yo'nalishlar bo'yicha guruhlash
    const orderRoutes = await this.prisma.order.groupBy({
      by: ['cargoFrom', 'cargoTo'],
      where: {
        cargoFrom: { not: null },
        cargoTo: { not: null },
        createdAt: { gte: oneHourAgo },
      },
      _count: { id: true },
    });

    // So'nggi 1 soatdagi offerlarni guruhlash
    const offerRoutes = await this.prisma.driverOffer.groupBy({
      by: ['fromCity', 'toCity'],
      where: {
        status: 'ACTIVE',
        createdAt: { gte: oneHourAgo },
      },
      _count: { id: true },
    });

    const offerMap = new Map<string, number>();
    for (const offer of offerRoutes) {
      offerMap.set(`${offer.fromCity}:${offer.toCity}`, offer._count.id);
    }

    for (const route of orderRoutes) {
      if (!route.cargoFrom || !route.cargoTo) continue;

      const orderCount = route._count.id;
      const offerCount = offerMap.get(`${route.cargoFrom}:${route.cargoTo}`) || 0;

      // Surge hisoblash: talab/taklif nisbati
      let surgeMultiplier = 1.0;
      if (offerCount > 0) {
        const ratio = orderCount / offerCount;
        if (ratio > 3) surgeMultiplier = 2.0;
        else if (ratio > 2) surgeMultiplier = 1.5;
        else if (ratio > 1.5) surgeMultiplier = 1.3;
      } else if (orderCount > 5) {
        surgeMultiplier = 1.5;
      }

      await this.prisma.routeDemand.upsert({
        where: {
          fromCity_toCity_date_hour: {
            fromCity: route.cargoFrom,
            toCity: route.cargoTo,
            date: today,
            hour,
          },
        },
        update: {
          orderCount,
          offerCount,
          surgeMultiplier,
        },
        create: {
          fromCity: route.cargoFrom,
          toCity: route.cargoTo,
          date: today,
          hour,
          orderCount,
          offerCount,
          surgeMultiplier,
        },
      });

      // Surge buyurtmalarni yangilash
      if (surgeMultiplier > 1.0) {
        await this.prisma.order.updateMany({
          where: {
            cargoFrom: route.cargoFrom,
            cargoTo: route.cargoTo,
            createdAt: { gte: oneHourAgo },
            surgeMultiplier: { equals: 1.0 },
          },
          data: {
            surgeMultiplier,
            surgeExpiresAt: new Date(now.getTime() + 10 * 60 * 1000), // 10 daqiqa
          },
        });
      }
    }

    this.logger.log(`Yo'nalish talabi yangilandi: ${orderRoutes.length} yo'nalish`);
  }

  /**
   * Surge ma'lumotlarini olish
   */
  async getSurgeRoutes() {
    const now = new Date();
    return this.prisma.order.findMany({
      where: {
        surgeMultiplier: { gt: 1.0 },
        surgeExpiresAt: { gt: now },
      },
      select: {
        id: true,
        cargoFrom: true,
        cargoTo: true,
        surgeMultiplier: true,
        surgeExpiresAt: true,
      },
      orderBy: { surgeMultiplier: 'desc' },
      take: 50,
    });
  }
}
