import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PriceEstimationService {
  private readonly logger = new Logger(PriceEstimationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Task 11: Narx taxmini
   */
  async estimatePrice(fromCity: string, toCity: string, vehicleType?: string) {
    const cacheKey = `price_estimate:${fromCity}:${toCity}:${vehicleType || 'all'}`;
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return cached;
    } catch {}

    // Avval keshdan qidirish
    const cached = await this.prisma.priceEstimate.findUnique({
      where: {
        fromCity_toCity_vehicleType: {
          fromCity,
          toCity,
          vehicleType: vehicleType || '',
        },
      },
    });

    if (cached && cached.sampleCount > 0) {
      const result = {
        fromCity,
        toCity,
        vehicleType,
        avgPrice: cached.avgPrice,
        minPrice: cached.minPrice,
        maxPrice: cached.maxPrice,
        sampleCount: cached.sampleCount,
        lastCalculated: cached.lastCalculated,
      };
      try { await this.redis.set(cacheKey, result, 3600); } catch {}
      return result;
    }

    // Real-time hisoblash
    return this.calculatePriceEstimate(fromCity, toCity, vehicleType);
  }

  private async calculatePriceEstimate(fromCity: string, toCity: string, vehicleType?: string) {
    const where: any = {
      cargoFrom: { contains: fromCity, mode: 'insensitive' },
      cargoTo: { contains: toCity, mode: 'insensitive' },
      closedAmount: { not: null, gt: 0 },
    };

    if (vehicleType) {
      where.vehicleType = { contains: vehicleType, mode: 'insensitive' };
    }

    const orders = await this.prisma.order.findMany({
      where,
      select: { closedAmount: true },
      orderBy: { closedAt: 'desc' },
      take: 100,
    });

    if (orders.length === 0) {
      return {
        fromCity,
        toCity,
        vehicleType,
        avgPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        sampleCount: 0,
        lastCalculated: new Date(),
      };
    }

    const amounts = orders.map((o) => o.closedAmount!).filter((a) => a > 0);
    const avg = amounts.reduce((s, a) => s + a, 0) / amounts.length;
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);

    const result = {
      fromCity,
      toCity,
      vehicleType: vehicleType || null,
      avgPrice: Math.round(avg),
      minPrice: min,
      maxPrice: max,
      sampleCount: amounts.length,
      lastCalculated: new Date(),
    };

    // Keshga saqlash
    await this.prisma.priceEstimate.upsert({
      where: {
        fromCity_toCity_vehicleType: {
          fromCity,
          toCity,
          vehicleType: vehicleType || '',
        },
      },
      update: {
        avgPrice: result.avgPrice,
        minPrice: result.minPrice,
        maxPrice: result.maxPrice,
        sampleCount: result.sampleCount,
        lastCalculated: new Date(),
      },
      create: {
        fromCity,
        toCity,
        vehicleType: vehicleType || '',
        avgPrice: result.avgPrice,
        minPrice: result.minPrice,
        maxPrice: result.maxPrice,
        sampleCount: result.sampleCount,
      },
    });

    return result;
  }

  /**
   * Kunlik narx keshini yangilash
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async refreshPriceCache() {
    this.logger.log('Narx keshini yangilash boshlandi...');

    const topRoutes = await this.prisma.order.groupBy({
      by: ['cargoFrom', 'cargoTo'],
      where: {
        cargoFrom: { not: null },
        cargoTo: { not: null },
        closedAmount: { not: null, gt: 0 },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 50,
    });

    for (const route of topRoutes) {
      if (route.cargoFrom && route.cargoTo) {
        await this.calculatePriceEstimate(route.cargoFrom, route.cargoTo);
      }
    }

    this.logger.log(`Narx keshi yangilandi: ${topRoutes.length} yo'nalish`);
  }
}
