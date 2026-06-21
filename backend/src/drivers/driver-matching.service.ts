import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { AppGateway } from '../gateway/app.gateway';
import { FcmService } from '../notifications/fcm.service';
import { findCity } from '../monitor/data/city-distances';

@Injectable()
export class DriverMatchingService {
  private readonly logger = new Logger(DriverMatchingService.name);

  private cachedCities: Array<{ name: string; lat: number; lng: number }> | null = null;
  private cachedCitiesAt = 0;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    @Inject(forwardRef(() => AppGateway)) private readonly gateway: AppGateway,
    private readonly fcmService: FcmService,
  ) {}

  /**
   * Yangi order kelganda yaqindagi haydovchilarga taklif yuborish.
   * monitor.service.ts dan chaqiriladi.
   */
  async matchDriversToOrder(order: any) {
    try {
      if (order.type !== 'CARGO' || !order.cargoFrom) return;

      // 1. Order shahrining koordinatasini topish
      const cityCoord = await this.getCityCoord(order.cargoFrom);
      if (!cityCoord) return;

      // 2. Online, obunali, tasdiqlangan, GPS bor haydovchilarni olish
      const drivers = await this.prisma.driverProfile.findMany({
        where: {
          isOnline: true,
          subscriptionActive: true,
          isVerified: true,
          lastLat: { not: null },
          lastLng: { not: null },
        },
        select: {
          userId: true,
          fullName: true,
          vehicleType: true,
          lastLat: true,
          lastLng: true,
          lastCity: true,
        },
      });

      if (drivers.length === 0) return;

      // 3. 50km ichidagi haydovchilarni filtrlash
      const matched: typeof drivers = [];
      for (const driver of drivers) {
        if (!driver.lastLat || !driver.lastLng) continue;

        const dist = this.haversineDistance(
          driver.lastLat, driver.lastLng,
          cityCoord.lat, cityCoord.lng,
        );

        if (dist > 50) continue; // 50km dan uzoq

        // Mashina turi mos kelishini tekshirish
        if (order.vehicleType && driver.vehicleType) {
          const orderVehicle = order.vehicleType.toLowerCase();
          const driverVehicle = driver.vehicleType.toLowerCase();
          // Fura/tent/ref kabi umumiy turlarni moslashtirish
          if (!driverVehicle.includes(orderVehicle) && !orderVehicle.includes(driverVehicle)) {
            continue;
          }
        }

        matched.push(driver);
      }

      if (matched.length === 0) return;

      // 4. Spam oldini olish — har haydovchiga soatiga max 5 ta notification
      const notifKey = (userId: string) => `driver:match:${userId}`;
      const filteredDrivers: typeof drivers = [];

      for (const d of matched) {
        const count = await this.redis.get<number>(notifKey(d.userId));
        if (count && count >= 5) continue;
        filteredDrivers.push(d);
        // Counter oshirish
        const current = (count || 0) + 1;
        await this.redis.set(notifKey(d.userId), current, 3600); // 1 soat TTL
      }

      if (filteredDrivers.length === 0) return;

      // 5. Notification yuborish
      const route = `${order.cargoFrom} → ${order.cargoTo || '?'}`;
      const vehicle = order.vehicleType || '';
      const price = order.price || '';
      const title = 'Sizga mos yuk topildi!';
      const body = `${route}${vehicle ? ', ' + vehicle : ''}${price ? ', ' + price : ''}`;

      for (const driver of filteredDrivers) {
        // WebSocket
        this.gateway.sendToDriver(driver.userId, 'driver:matchedOrder', {
          orderId: order.id,
          cargoFrom: order.cargoFrom,
          cargoTo: order.cargoTo,
          vehicleType: order.vehicleType,
          price: order.price,
          phone: order.phone,
          distance: order.distance,
          messageText: order.messageText?.substring(0, 200),
        });

        // FCM push (async, fire-and-forget)
        this.fcmService.sendToUser(driver.userId, title, body, {
          type: 'MATCHED_ORDER',
          orderId: order.id,
        }).catch(() => {});
      }

      this.logger.log(
        `Smart match: ${order.cargoFrom}→${order.cargoTo || '?'} — ` +
        `${filteredDrivers.length}/${matched.length} haydovchiga yuborildi`,
      );
    } catch (e) {
      this.logger.warn(`Smart match xatosi: ${(e as any).message}`);
    }
  }

  /**
   * Har 5 daqiqada: yetib borayotgan haydovchilarga keyingi yuk taklifi.
   * ON_WAY statusdagi orderlar → manzilga 60km qolsa → o'sha shahardagi yuklar.
   */
  @Cron('*/5 * * * *')
  async checkApproachingDrivers() {
    try {
      // Qabul qilingan va yo'lda bo'lgan orderlar
      const activeOrders = await this.prisma.order.findMany({
        where: {
          acceptedById: { not: null },
          acceptedStatus: 'ON_WAY',
          cargoTo: { not: null },
        },
        select: {
          id: true,
          cargoTo: true,
          acceptedById: true,
        },
      });

      if (activeOrders.length === 0) return;

      for (const activeOrder of activeOrders) {
        const driverId = activeOrder.acceptedById!;
        const destCity = activeOrder.cargoTo!;

        // Haydovchi profili
        const driver = await this.prisma.driverProfile.findUnique({
          where: { userId: driverId },
          select: { lastLat: true, lastLng: true, userId: true, vehicleType: true },
        });

        if (!driver?.lastLat || !driver?.lastLng) continue;

        // Manzil koordinatasi
        const destCoord = await this.getCityCoord(destCity);
        if (!destCoord) continue;

        // Masofani hisoblash
        const distToDest = this.haversineDistance(
          driver.lastLat, driver.lastLng,
          destCoord.lat, destCoord.lng,
        );

        // 60km dan uzoq — hali yetib bormagan
        if (distToDest > 60) continue;

        // Allaqachon taklif yuborilganmi? (Redis dedup)
        const dedupKey = `driver:predict:${driverId}:${destCity}`;
        const alreadySent = await this.redis.get(dedupKey);
        if (alreadySent) continue;

        // O'sha shahardagi yangi yuklar
        const suggestedOrders = await this.prisma.order.findMany({
          where: {
            cargoFrom: { contains: destCity, mode: 'insensitive' },
            status: 'NEW',
            acceptedById: null,
            type: 'CARGO',
            createdAt: { gte: new Date(Date.now() - 24 * 3600000) },
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            cargoFrom: true,
            cargoTo: true,
            vehicleType: true,
            price: true,
            phone: true,
          },
        });

        if (suggestedOrders.length === 0) continue;

        // Dedup — 6 soat ichida qayta yubormaslik
        await this.redis.set(dedupKey, true, 6 * 3600);

        // Notification
        const title = `Yetib borasiz! ${destCity} da yuklar bor`;
        const body = `${suggestedOrders.length} ta yuk: ${suggestedOrders[0].cargoFrom}→${suggestedOrders[0].cargoTo || '?'}`;

        this.gateway.sendToDriver(driverId, 'driver:suggestedOrders', {
          destinationCity: destCity,
          orders: suggestedOrders,
        });

        this.fcmService.sendToUser(driverId, title, body, {
          type: 'SUGGESTED_ORDERS',
          city: destCity,
        }).catch(() => {});

        this.logger.log(
          `Predictive match: ${driverId} → ${destCity} — ${suggestedOrders.length} ta yuk taklif qilindi`,
        );
      }
    } catch (e) {
      this.logger.warn(`Predictive match xatosi: ${(e as any).message}`);
    }
  }

  // ─── Helpers ───

  private async getCityCoord(cityName: string): Promise<{ lat: number; lng: number } | null> {
    // Avval city-distances dan qidirish
    const found = findCity(cityName);
    if (found) return { lat: found.lat, lng: found.lng };

    // Location jadvalidan
    const cities = await this.getCachedCities();
    const normalized = cityName.toLowerCase().trim();
    for (const c of cities) {
      if (c.name.toLowerCase().includes(normalized) || normalized.includes(c.name.toLowerCase())) {
        return { lat: c.lat, lng: c.lng };
      }
    }
    return null;
  }

  private async getCachedCities() {
    const now = Date.now();
    if (this.cachedCities && now - this.cachedCitiesAt < 10 * 60_000) {
      return this.cachedCities;
    }
    const locations = await this.prisma.location.findMany({
      where: { lat: { not: null }, lng: { not: null } },
      select: { name: true, lat: true, lng: true },
    });
    this.cachedCities = locations.filter(l => l.lat != null && l.lng != null) as any;
    this.cachedCitiesAt = now;
    return this.cachedCities;
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
