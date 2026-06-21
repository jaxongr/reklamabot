import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma.service';
import { SystemConfigService } from '../common/system-config.service';
import { AppGateway } from '../gateway/app.gateway';
import { findCity } from '../monitor/data/city-distances';

// ===== Kirill → Lotin transliteratsiya xaritasi =====
const CYR_TO_LAT: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
  'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'x', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sh',
  'ъ': "'", 'ы': 'i', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  'ў': "o'", 'қ': 'q', 'ғ': "g'", 'ҳ': 'h',
};

/**
 * Ism-familiyani normalizatsiya qilish:
 * 1. Kirill → Lotin transliteratsiya
 * 2. Har bir so'zning bosh harfi katta
 * 3. Ortiqcha bo'shliqlar olib tashlanadi
 */
export function normalizeName(raw: string): string {
  if (!raw) return '';
  let result = '';
  const lower = raw.trim();
  for (const ch of lower) {
    const lc = ch.toLowerCase();
    if (CYR_TO_LAT[lc] !== undefined) {
      // Kirill harf — agar original katta harf bo'lsa
      const mapped = CYR_TO_LAT[lc];
      if (ch !== lc && mapped.length > 0) {
        result += mapped[0].toUpperCase() + mapped.slice(1);
      } else {
        result += mapped;
      }
    } else {
      result += ch;
    }
  }
  // Har bir so'zni capitalize qilish + ortiqcha bo'shliq tozalash
  return result
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Telefon raqamni +998XXXXXXXXX formatga keltirish
 */
export function normalizePhone(raw: string): string {
  if (!raw) return '';
  // Faqat raqamlarni olish
  let digits = raw.replace(/\D/g, '');
  // 8 bilan boshlansa va 13 raqam → 8998... → 998...
  if (digits.length === 13 && digits.startsWith('8998')) {
    digits = digits.slice(1);
  }
  // 998 bilan boshlanib 12 raqam → to'g'ri
  if (digits.length === 12 && digits.startsWith('998')) {
    return '+' + digits;
  }
  // 9 raqam (90, 91, 93, 94, 95, 97, 99...) → 998 qo'shish
  if (digits.length === 9 && /^[3-9]/.test(digits)) {
    return '+998' + digits;
  }
  // 10 raqam va 998 bilan boshlanmasa → oxirgi 9 raqamni olish
  if (digits.length === 10) {
    return '+998' + digits.slice(-9);
  }
  // Boshqa holat — imkon qadar +998 format
  if (digits.length >= 9 && digits.length <= 12) {
    if (!digits.startsWith('998')) {
      digits = '998' + digits.slice(digits.length - 9);
    }
    return '+' + digits;
  }
  return '+' + digits;
}

@Injectable()
export class DriversService {
  private readonly logger = new Logger(DriversService.name);
  private cachedCities: Array<{ name: string; lat: number; lng: number }> | null = null;
  private cachedCitiesAt = 0;

  constructor(
    private readonly prisma: PrismaService,
    private readonly systemConfig: SystemConfigService,
    @Inject(forwardRef(() => AppGateway)) private readonly gateway: AppGateway,
  ) {}

  private async getCachedCities() {
    const now = Date.now();
    // Cache for 10 minutes
    if (this.cachedCities && now - this.cachedCitiesAt < 10 * 60_000) {
      return this.cachedCities;
    }
    const locations = await this.prisma.location.findMany({
      where: { type: 'CITY', lat: { not: null }, lng: { not: null } },
      select: { name: true, lat: true, lng: true },
    });
    this.cachedCities = locations.filter(l => l.lat != null && l.lng != null) as any;
    this.cachedCitiesAt = now;
    return this.cachedCities!;
  }

  // ============================================================
  // PROFIL
  // ============================================================

  async getProfile(userId: string) {
    const profile = await this.prisma.driverProfile.findUnique({
      where: { userId },
      include: { user: { select: { telegramId: true, username: true, firstName: true, lastName: true } } },
    });
    if (!profile) {
      throw new NotFoundException('Haydovchi profili topilmadi');
    }
    return profile;
  }

  async updateProfile(userId: string, data: {
    fullName?: string;
    phone?: string;
    vehicleType?: string;
    vehicleCapacity?: string;
    vehicleNumber?: string;
    licensePhotoUrl?: string;
    vehiclePassportUrl?: string;
  }) {
    const profile = await this.prisma.driverProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Haydovchi profili topilmadi');
    }
    return this.prisma.driverProfile.update({
      where: { userId },
      data,
    });
  }

  // ============================================================
  // ONLINE / OFFLINE
  // ============================================================

  async setOnlineStatus(userId: string, isOnline: boolean) {
    return this.prisma.driverProfile.update({
      where: { userId },
      data: { isOnline },
    });
  }

  // ============================================================
  // GPS JOYLASHUV
  // ============================================================

  async updateLocation(userId: string, lat: number, lng: number) {
    // Eng yaqin shahar topish (cached)
    let lastCity: string | null = null;
    try {
      const cities = await this.getCachedCities();
      let minDist = Infinity;
      for (const loc of cities) {
        const dist = this.haversineDistance(lat, lng, loc.lat, loc.lng);
        if (dist < minDist) {
          minDist = dist;
          lastCity = loc.name;
        }
      }
    } catch (e) {
      this.logger.warn('Shahar topishda xatolik:', e.message);
    }

    return this.prisma.driverProfile.update({
      where: { userId },
      data: {
        lastLat: lat,
        lastLng: lng,
        lastLocationAt: new Date(),
        lastCity,
      },
    });
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // ============================================================
  // BUYURTMALAR (Telegram yuklar)
  // ============================================================

  async getOrders(userId: string, params: {
    type?: string;
    cargoFrom?: string;
    cargoTo?: string;
    scope?: string;
    page?: number;
    limit?: number;
    nearMe?: boolean;
  }) {
    const { type, cargoFrom, cargoTo, scope, page = 1, limit = 20, nearMe } = params;

    const where: any = {};
    if (type) where.type = type;
    if (scope) where.scope = scope;
    if (cargoFrom) where.cargoFrom = { contains: cargoFrom, mode: 'insensitive' };
    if (cargoTo) where.cargoTo = { contains: cargoTo, mode: 'insensitive' };

    // GPS bo'yicha filtr
    if (nearMe) {
      const profile = await this.prisma.driverProfile.findUnique({ where: { userId } });
      if (profile?.lastCity) {
        where.cargoFrom = { contains: profile.lastCity, mode: 'insensitive' };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    // Telefon raqamni yashirish — faqat o'zi qabul qilgan zakazlarda ko'rinadi
    const phoneRegex = /(\+?\d[\d\s\-()]{7,15}\d)/g;
    const sanitized = data.map(order => {
      if (order.acceptedById === userId) return order;
      const { phone, senderPhone, ...rest } = order as any;
      // messageText'dagi telefon raqamlarni ham yashirish
      let cleanMessageText = rest.messageText;
      if (cleanMessageText) {
        cleanMessageText = cleanMessageText.replace(phoneRegex, '** *** ** **');
      }
      return { ...rest, phone: null, senderPhone: null, messageText: cleanMessageText };
    });

    return {
      data: sanitized,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderById(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Buyurtma topilmadi');
    return order;
  }

  // ============================================================
  // TAKLIFLAR (Driver Offers)
  // ============================================================

  async createOffer(userId: string, data: {
    fromCity: string;
    toCity: string;
    vehicleType?: string;
    vehicleCapacity?: string;
    phone?: string;
    description?: string;
    price?: string;
  }) {
    const profile = await this.prisma.driverProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Haydovchi profili topilmadi');

    // Profildan fallback qiymatlar olish
    const phone = data.phone?.trim() || profile.phone || '';
    const vehicleType = data.vehicleType?.trim() || profile.vehicleType || '';

    const offer = await this.prisma.driverOffer.create({
      data: {
        driverId: userId,
        driverProfileId: profile.id,
        fromCity: data.fromCity,
        toCity: data.toCity,
        vehicleType,
        vehicleCapacity: data.vehicleCapacity || profile.vehicleCapacity || null,
        phone,
        description: data.description || null,
        price: data.price || null,
      },
      include: {
        driverProfile: { select: { fullName: true, vehicleType: true, vehicleCapacity: true, isVerified: true } },
      },
    });

    // WebSocket — dashboardga yangi taklif haqida xabar berish
    this.gateway.emitNewDriverOffer(offer);

    return offer;
  }

  async getOffers(params: {
    status?: string;
    fromCity?: string;
    toCity?: string;
    page?: number;
    limit?: number;
  }) {
    const { status = 'ACTIVE', fromCity, toCity, page = 1, limit = 20 } = params;

    const where: any = {};
    if (status) where.status = status;
    if (fromCity) where.fromCity = { contains: fromCity, mode: 'insensitive' };
    if (toCity) where.toCity = { contains: toCity, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.driverOffer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          driverProfile: { select: { fullName: true, vehicleType: true, vehicleCapacity: true, isVerified: true } },
        },
      }),
      this.prisma.driverOffer.count({ where }),
    ]);

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getMyOffers(userId: string) {
    return this.prisma.driverOffer.findMany({
      where: { driverId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancelOffer(userId: string, offerId: string) {
    const offer = await this.prisma.driverOffer.findUnique({ where: { id: offerId } });
    if (!offer) throw new NotFoundException('Taklif topilmadi');
    if (offer.driverId !== userId) throw new ForbiddenException('Bu taklif sizga tegishli emas');

    return this.prisma.driverOffer.update({
      where: { id: offerId },
      data: { status: 'CANCELLED' },
    });
  }

  // ============================================================
  // MAXSUS BUYURTMALAR (Private Orders)
  // ============================================================

  async getAvailablePrivateOrders(userId: string) {
    return this.prisma.privateOrder.findMany({
      where: {
        OR: [
          { driverId: null, status: 'PENDING' },
          { driverId: userId, status: 'PENDING' },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async acceptPrivateOrder(userId: string, orderId: string) {
    const order = await this.prisma.privateOrder.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Buyurtma topilmadi');
    if (order.status !== 'PENDING') throw new BadRequestException('Buyurtma allaqachon qabul qilingan');

    // Komissiya tekshirish
    const commission = order.commissionAmount || 0;
    if (commission > 0) {
      const profile = await this.prisma.driverProfile.findUnique({ where: { userId } });
      if (!profile) throw new NotFoundException('Profil topilmadi');
      if (profile.balance < commission) {
        throw new BadRequestException(`Balans yetarli emas. Kerakli: ${commission} UZS, Balans: ${profile.balance} UZS`);
      }

      // Balans yechish + tranzaksiya
      await this.prisma.$transaction([
        this.prisma.driverProfile.update({
          where: { userId },
          data: { balance: { decrement: commission } },
        }),
        this.prisma.driverTransaction.create({
          data: {
            driverProfileId: profile.id,
            amount: -commission,
            type: 'COMMISSION',
            description: `Buyurtma #${orderId} komissiyasi`,
            referenceId: orderId,
          },
        }),
        this.prisma.privateOrder.update({
          where: { id: orderId },
          data: {
            driverId: userId,
            status: 'ACCEPTED',
            commissionPaid: true,
          },
        }),
      ]);
    } else {
      await this.prisma.privateOrder.update({
        where: { id: orderId },
        data: { driverId: userId, status: 'ACCEPTED' },
      });
    }

    return { success: true, message: 'Buyurtma qabul qilindi' };
  }

  async rejectPrivateOrder(userId: string, orderId: string) {
    const order = await this.prisma.privateOrder.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Buyurtma topilmadi');

    return this.prisma.privateOrder.update({
      where: { id: orderId },
      data: { status: 'REJECTED' },
    });
  }

  // ============================================================
  // TELEGRAM ZAKAZ QABUL QILISH + TREKING
  // ============================================================

  async acceptTelegramOrder(userId: string, orderId: string) {
    // 1. Profilni olish
    const profile = await this.prisma.driverProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Haydovchi profili topilmadi');

    // 2. Obuna tekshirish (active + muddati o'tmagan)
    if (!profile.subscriptionActive) {
      throw new BadRequestException('Obuna faollashtirilmagan. Avval obunani faollashtiring.');
    }
    // Muddati o'tgan bo'lsa — avtomatik deaktivatsiya
    if (profile.subscriptionEndDate && new Date(profile.subscriptionEndDate) < new Date()) {
      await this.prisma.driverProfile.update({
        where: { userId },
        data: { subscriptionActive: false },
      });
      throw new BadRequestException('Obuna muddati tugagan. Yangilang.');
    }

    // 3. Faol zakazlar soni (max 10)
    const activeCount = await this.prisma.order.count({
      where: {
        acceptedById: userId,
        acceptedStatus: { in: ['ACCEPTED', 'ON_WAY', 'ARRIVED'] },
      },
    });
    if (activeCount >= 10) {
      throw new BadRequestException('Maksimal 10 ta faol zakaz. Avval mavjudlarni yakunlang.');
    }

    // 4. Atomik qabul qilish (concurrent acceptance handling)
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Buyurtma topilmadi');
    if (order.acceptedById) {
      throw new BadRequestException('Bu zakaz allaqachon qabul qilingan');
    }

    // 5. Qabul qilish (atomik — acceptedById null bo'lsa)
    try {
      const updated = await this.prisma.order.updateMany({
        where: { id: orderId, acceptedById: null },
        data: {
          acceptedById: userId,
          acceptedAt: new Date(),
          acceptedStatus: 'ACCEPTED',
          status: 'CONTACTED',
        },
      });

      if (updated.count === 0) {
        throw new BadRequestException('Bu zakaz allaqachon qabul qilingan');
      }
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException('Qabul qilishda xatolik yuz berdi');
    }

    const acceptedOrder = await this.prisma.order.findUnique({ where: { id: orderId } });

    // WebSocket — dashboardga xabar berish
    if (acceptedOrder) {
      this.gateway.emitOrderAccepted(acceptedOrder);
    }

    return acceptedOrder;
  }

  async updateTrackingStatus(userId: string, orderId: string, status: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Buyurtma topilmadi');
    if (order.acceptedById !== userId) {
      throw new ForbiddenException('Bu zakaz sizga tegishli emas');
    }

    // Status o'tish validatsiyasi
    const VALID_TRANSITIONS: Record<string, string[]> = {
      'ACCEPTED': ['ON_WAY', 'CANCELLED'],
      'ON_WAY': ['ARRIVED', 'CANCELLED'],
      'ARRIVED': ['COMPLETED', 'CANCELLED'],
    };

    const currentStatus = order.acceptedStatus || 'ACCEPTED';
    const allowed = VALID_TRANSITIONS[currentStatus];
    if (!allowed?.includes(status)) {
      throw new BadRequestException(`${currentStatus} dan ${status} ga o'tish mumkin emas`);
    }

    const updateData: any = { acceptedStatus: status };
    if (status === 'COMPLETED') {
      updateData.status = 'COMPLETED';
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    // WebSocket — tracking yangilanishi haqida dashboard'ga xabar berish
    this.gateway.broadcastToDashboards('driver:trackingUpdate', {
      orderId,
      status,
      acceptedById: userId,
      timestamp: new Date().toISOString(),
    });

    return updatedOrder;
  }

  async getMyAcceptedOrders(userId: string, statusFilter?: string) {
    const where: any = { acceptedById: userId };

    if (statusFilter === 'active') {
      where.acceptedStatus = { in: ['ACCEPTED', 'ON_WAY', 'ARRIVED'] };
    } else if (statusFilter === 'completed') {
      where.acceptedStatus = 'COMPLETED';
    } else if (statusFilter === 'cancelled') {
      where.acceptedStatus = 'CANCELLED';
    } else if (statusFilter) {
      where.acceptedStatus = statusFilter;
    }

    return this.prisma.order.findMany({
      where,
      orderBy: { acceptedAt: 'desc' },
    });
  }

  // ============================================================
  // ADMIN — Haydovchilar boshqaruvi
  // ============================================================

  async getAllDrivers(params: {
    search?: string;
    isOnline?: boolean;
    isVerified?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { search, isOnline, isVerified, page = 1, limit = 20 } = params;

    const where: any = {};
    if (isOnline !== undefined) where.isOnline = isOnline;
    if (isVerified !== undefined) where.isVerified = isVerified;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { vehicleNumber: { contains: search, mode: 'insensitive' } },
        { user: { telegramId: { contains: search } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.driverProfile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, telegramId: true, username: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.driverProfile.count({ where }),
    ]);

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getDriverById(driverProfileId: string) {
    const profile = await this.prisma.driverProfile.findUnique({
      where: { id: driverProfileId },
      include: {
        user: { select: { id: true, telegramId: true, username: true, firstName: true, lastName: true } },
        transactions: { orderBy: { createdAt: 'desc' }, take: 50 },
        offers: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!profile) throw new NotFoundException('Haydovchi topilmadi');
    return profile;
  }

  async adminUpdateProfile(driverProfileId: string, data: {
    fullName?: string;
    phone?: string;
    vehicleType?: string;
    vehicleBrand?: string;
    vehicleCapacity?: string;
    vehicleNumber?: string;
    bodyType?: string;
  }) {
    const profile = await this.prisma.driverProfile.findUnique({ where: { id: driverProfileId } });
    if (!profile) throw new NotFoundException('Haydovchi topilmadi');

    const updateData: any = {};
    if (data.fullName !== undefined) updateData.fullName = normalizeName(data.fullName);
    if (data.phone !== undefined) updateData.phone = normalizePhone(data.phone);
    if (data.vehicleType !== undefined) updateData.vehicleType = data.vehicleType;
    if (data.vehicleBrand !== undefined) updateData.vehicleBrand = data.vehicleBrand;
    if (data.vehicleCapacity !== undefined) updateData.vehicleCapacity = data.vehicleCapacity;
    if (data.vehicleNumber !== undefined) updateData.vehicleNumber = data.vehicleNumber;
    if (data.bodyType !== undefined) updateData.bodyType = data.bodyType;

    return this.prisma.driverProfile.update({
      where: { id: driverProfileId },
      data: updateData,
      include: { user: { select: { telegramId: true, username: true, firstName: true, lastName: true } } },
    });
  }

  async verifyDriver(driverProfileId: string, adminId: string) {
    return this.prisma.driverProfile.update({
      where: { id: driverProfileId },
      data: { isVerified: true, verifiedAt: new Date(), verifiedBy: adminId },
    });
  }

  async updateDriverBalance(driverProfileId: string, amount: number, description: string) {
    const profile = await this.prisma.driverProfile.findUnique({ where: { id: driverProfileId } });
    if (!profile) throw new NotFoundException('Haydovchi topilmadi');

    const type = amount >= 0 ? 'TOP_UP' : 'COMMISSION';

    await this.prisma.$transaction([
      this.prisma.driverProfile.update({
        where: { id: driverProfileId },
        data: { balance: { increment: amount } },
      }),
      this.prisma.driverTransaction.create({
        data: {
          driverProfileId,
          amount,
          type: type as any,
          description,
        },
      }),
    ]);

    return { success: true };
  }

  async toggleSubscription(driverProfileId: string, active: boolean, days?: number) {
    const data: any = { subscriptionActive: active };
    if (active && days) {
      data.subscriptionEndDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }
    if (!active) {
      data.subscriptionEndDate = null;
    }
    return this.prisma.driverProfile.update({
      where: { id: driverProfileId },
      data,
    });
  }

  // ============================================================
  // HAYDOVCHI OBUNA TIZIMI
  // ============================================================

  async getDriverSubscriptionPlans() {
    // Haydovchi obuna rejalari — system config dan yoki hardcoded
    const configPlans = await this.systemConfig.get('driver_subscription_plans');
    if (configPlans) {
      try {
        return JSON.parse(configPlans);
      } catch {}
    }

    // Default rejalar
    return [
      {
        type: 'MONTHLY',
        name: 'Oylik obuna',
        price: 50000,
        currency: 'UZS',
        days: 30,
        features: [
          'Telegram yuklarni qabul qilish',
          'Telefon raqamini ko\'rish',
          'Treking tizimi',
          'Cheksiz qabul',
        ],
      },
      {
        type: 'QUARTERLY',
        name: '3 oylik obuna',
        price: 120000,
        currency: 'UZS',
        days: 90,
        features: [
          'Telegram yuklarni qabul qilish',
          'Telefon raqamini ko\'rish',
          'Treking tizimi',
          'Cheksiz qabul',
          '20% tejash',
        ],
      },
      {
        type: 'YEARLY',
        name: 'Yillik obuna',
        price: 400000,
        currency: 'UZS',
        days: 365,
        features: [
          'Telegram yuklarni qabul qilish',
          'Telefon raqamini ko\'rish',
          'Treking tizimi',
          'Cheksiz qabul',
          '33% tejash',
        ],
      },
    ];
  }

  async getMySubscription(userId: string) {
    const profile = await this.prisma.driverProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profil topilmadi');

    // Muddati tekshirish
    if (profile.subscriptionActive && profile.subscriptionEndDate && new Date(profile.subscriptionEndDate) < new Date()) {
      await this.prisma.driverProfile.update({
        where: { userId },
        data: { subscriptionActive: false },
      });
      return {
        active: false,
        endDate: profile.subscriptionEndDate,
        expired: true,
        balance: profile.balance,
      };
    }

    return {
      active: profile.subscriptionActive,
      endDate: profile.subscriptionEndDate,
      expired: false,
      balance: profile.balance,
    };
  }

  async purchaseSubscription(userId: string, planType: string) {
    const profile = await this.prisma.driverProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profil topilmadi');

    // Reja topish
    const plans = await this.getDriverSubscriptionPlans();
    const plan = plans.find((p: any) => p.type === planType);
    if (!plan) throw new BadRequestException('Noto\'g\'ri reja turi');

    // Balans tekshirish
    if (profile.balance < plan.price) {
      throw new BadRequestException(
        `Balans yetarli emas. Kerakli: ${plan.price} UZS, Balans: ${profile.balance} UZS`,
      );
    }

    // Tranzaksiya: balans yechish + obuna faollashtirish
    const endDate = new Date(Date.now() + plan.days * 24 * 60 * 60 * 1000);

    await this.prisma.$transaction([
      this.prisma.driverProfile.update({
        where: { userId },
        data: {
          balance: { decrement: plan.price },
          subscriptionActive: true,
          subscriptionEndDate: endDate,
        },
      }),
      this.prisma.driverTransaction.create({
        data: {
          driverProfileId: profile.id,
          amount: -plan.price,
          type: 'SUBSCRIPTION',
          description: `${plan.name} sotib olindi`,
        },
      }),
    ]);

    return {
      success: true,
      message: `${plan.name} muvaffaqiyatli sotib olindi!`,
      endDate,
    };
  }

  // ============================================================
  // ADMIN — Maxsus buyurtma yaratish
  // ============================================================

  async createPrivateOrder(data: {
    createdById: string;
    driverId?: string;
    fromCity: string;
    toCity: string;
    cargoType?: string;
    cargoWeight?: string;
    price?: string;
    phone: string;
    description?: string;
    commissionAmount?: number;
  }) {
    return this.prisma.privateOrder.create({ data: data as any });
  }

  async getAllPrivateOrders(params: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, page = 1, limit = 20 } = params;
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.privateOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.privateOrder.count({ where }),
    ]);

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ============================================================
  // STATS
  // ============================================================

  async getDriverStats() {
    const [totalDrivers, onlineDrivers, verifiedDrivers, totalOffers, activeOffers] = await Promise.all([
      this.prisma.driverProfile.count(),
      this.prisma.driverProfile.count({ where: { isOnline: true } }),
      this.prisma.driverProfile.count({ where: { isVerified: true } }),
      this.prisma.driverOffer.count(),
      this.prisma.driverOffer.count({ where: { status: 'ACTIVE' } }),
    ]);

    return { totalDrivers, onlineDrivers, verifiedDrivers, totalOffers, activeOffers };
  }

  // Har 5 daqiqada — 30 daqiqa GPS yangilanmagan driverlarni offline qilish
  @Cron('*/5 * * * *')
  async cleanupStaleDrivers() {
    const cutoff = new Date(Date.now() - 30 * 60 * 1000); // 30 daqiqa
    const result = await this.prisma.driverProfile.updateMany({
      where: {
        isOnline: true,
        OR: [
          { lastLocationAt: { lt: cutoff } },
          { lastLocationAt: null },
        ],
      },
      data: { isOnline: false },
    });
    if (result.count > 0) {
      this.logger.log(`[Cleanup] ${result.count} ta eskirgan driver offline qilindi`);
    }
  }

  async getOnlineDriversForMap() {
    return this.prisma.driverProfile.findMany({
      where: { isOnline: true, lastLat: { not: null }, lastLng: { not: null } },
      select: {
        id: true,
        fullName: true,
        vehicleType: true,
        vehicleCapacity: true,
        vehicleNumber: true,
        lastLat: true,
        lastLng: true,
        lastCity: true,
        lastLocationAt: true,
        isVerified: true,
        phone: true,
        user: { select: { telegramId: true, username: true } },
      },
    });
  }

  // ============================================================
  // Task 9: TAKLIF TIZIMI (Referral)
  // ============================================================

  async generateReferralCode(userId: string) {
    const profile = await this.prisma.driverProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profil topilmadi');

    if (profile.referralCode) return { code: profile.referralCode };

    const code = `DR${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    await this.prisma.driverProfile.update({
      where: { userId },
      data: { referralCode: code },
    });

    return { code };
  }

  async processInvite(code: string, invitedUserId: string) {
    const inviterProfile = await this.prisma.driverProfile.findFirst({
      where: { referralCode: code },
    });

    if (!inviterProfile) throw new NotFoundException('Taklif kodi topilmadi');
    if (inviterProfile.userId === invitedUserId) throw new BadRequestException("O'zingizni taklif qila olmaysiz");

    // Invite yaratish
    const invite = await this.prisma.driverInvite.create({
      data: {
        inviterProfileId: inviterProfile.id,
        invitedUserId,
        code,
        isUsed: true,
        usedAt: new Date(),
      },
    });

    // Referrer profilini yangilash
    await this.prisma.driverProfile.update({
      where: { userId: invitedUserId },
      data: { referredById: inviterProfile.userId },
    });

    return invite;
  }

  async getInviteStats(userId: string) {
    const profile = await this.prisma.driverProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profil topilmadi');

    const [totalInvites, usedInvites, totalReward] = await Promise.all([
      this.prisma.driverInvite.count({ where: { inviterProfileId: profile.id } }),
      this.prisma.driverInvite.count({ where: { inviterProfileId: profile.id, isUsed: true } }),
      this.prisma.driverInvite.aggregate({
        where: { inviterProfileId: profile.id, rewardGiven: true },
        _sum: { rewardAmount: true },
      }),
    ]);

    return {
      referralCode: profile.referralCode,
      totalInvites,
      usedInvites,
      totalReward: totalReward._sum.rewardAmount || 0,
    };
  }

  // ============================================================
  // Task 21: FOTOKONTROL
  // ============================================================

  async uploadVehiclePhoto(userId: string, type: string, url: string) {
    const profile = await this.prisma.driverProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profil topilmadi');

    return this.prisma.vehiclePhoto.upsert({
      where: {
        driverProfileId_type: { driverProfileId: profile.id, type: type as any },
      },
      update: { url, isApproved: false, approvedBy: null, approvedAt: null, rejectionReason: null },
      create: { driverProfileId: profile.id, type: type as any, url },
    });
  }

  async getVehiclePhotos(userId: string) {
    const profile = await this.prisma.driverProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profil topilmadi');

    return this.prisma.vehiclePhoto.findMany({
      where: { driverProfileId: profile.id },
      orderBy: { type: 'asc' },
    });
  }

  async getPendingPhotos(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.vehiclePhoto.findMany({
        where: { isApproved: false },
        include: {
          driverProfile: {
            select: { fullName: true, vehicleType: true, phone: true, user: { select: { telegramId: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.vehiclePhoto.count({ where: { isApproved: false } }),
    ]);

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async approvePhoto(photoId: string, adminId: string) {
    return this.prisma.vehiclePhoto.update({
      where: { id: photoId },
      data: { isApproved: true, approvedBy: adminId, approvedAt: new Date() },
    });
  }

  async rejectPhoto(photoId: string, reason: string) {
    return this.prisma.vehiclePhoto.update({
      where: { id: photoId },
      data: { rejectionReason: reason },
    });
  }

  // ============================================================
  // Task 23: HAYDOVCHI ULASH
  // ============================================================

  async linkDriverToOrder(orderId: string, driverProfileId: string) {
    const profile = await this.prisma.driverProfile.findUnique({
      where: { id: driverProfileId },
      select: { userId: true, phone: true },
    });
    if (!profile) throw new NotFoundException('Haydovchi topilmadi');

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        acceptedById: profile.userId,
        acceptedAt: new Date(),
        acceptedStatus: 'ACCEPTED',
        status: 'CONTACTED',
      },
    });
  }

  async getAvailableDrivers(cargoFrom?: string) {
    const where: any = { isOnline: true };
    if (cargoFrom) {
      where.lastCity = { contains: cargoFrom, mode: 'insensitive' };
    }

    return this.prisma.driverProfile.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        vehicleType: true,
        vehicleCapacity: true,
        phone: true,
        lastCity: true,
        isVerified: true,
      },
      orderBy: { lastLocationAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Botsiz ro'yxatdan o'tish — app dan form to'ldiradi.
   * Admin dashboard dan tasdiqlaydi (isVerified: true).
   */
  // ============================================================
  // REYTING TIZIMI
  // ============================================================

  async rateUser(fromUserId: string, data: {
    toUserId: string;
    score: number;
    comment?: string;
    orderId?: string;
  }) {
    if (data.score < 1 || data.score > 5) {
      throw new BadRequestException('Baho 1 dan 5 gacha bo\'lishi kerak');
    }
    if (fromUserId === data.toUserId) {
      throw new BadRequestException('O\'zingizni baholay olmaysiz');
    }

    const rating = await this.prisma.userRating.upsert({
      where: {
        fromUserId_toUserId_orderId: {
          fromUserId,
          toUserId: data.toUserId,
          orderId: data.orderId || '',
        },
      },
      update: { score: data.score, comment: data.comment },
      create: {
        fromUserId,
        toUserId: data.toUserId,
        score: data.score,
        comment: data.comment,
        orderId: data.orderId,
      },
    });

    return rating;
  }

  async getUserRating(userId: string) {
    const ratings = await this.prisma.userRating.findMany({
      where: { toUserId: userId },
      select: { score: true },
    });

    if (ratings.length === 0) {
      return { average: 0, count: 0 };
    }

    const sum = ratings.reduce((acc, r) => acc + r.score, 0);
    return {
      average: Math.round((sum / ratings.length) * 10) / 10,
      count: ratings.length,
    };
  }

  // ============================================================
  // DISPETCHER E'LONLARI (haydovchilar uchun)
  // ============================================================

  async getDispatcherAds(params: {
    page: number;
    limit: number;
    cargoFrom?: string;
    cargoTo?: string;
    vehicleType?: string;
    scope?: string;
  }) {
    const { page, limit, cargoFrom, cargoTo, vehicleType, scope } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'ACTIVE',
    };

    if (cargoFrom) {
      where.cargoFrom = { contains: cargoFrom, mode: 'insensitive' };
    }
    if (cargoTo) {
      where.cargoTo = { contains: cargoTo, mode: 'insensitive' };
    }
    if (vehicleType) {
      where.vehicleType = { contains: vehicleType, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.ad.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              phoneNumber: true,
            },
          },
        },
      }),
      this.prisma.ad.count({ where }),
    ]);

    // Dispetcher reytinglarini batch olish
    const userIds = [...new Set(data.map((ad) => ad.userId))];
    const ratings = await this.prisma.userRating.groupBy({
      by: ['toUserId'],
      where: { toUserId: { in: userIds } },
      _avg: { score: true },
      _count: { score: true },
    });
    const ratingMap = new Map(ratings.map((r) => [r.toUserId, {
      average: Math.round((r._avg.score || 0) * 10) / 10,
      count: r._count.score,
    }]));

    return {
      data: data.map((ad) => {
        const r = ratingMap.get(ad.userId);
        return {
          id: ad.id,
          title: ad.title || '',
          content: ad.content || ad.description || '',
          cargoFrom: ad.cargoFrom || '',
          cargoTo: ad.cargoTo || '',
          cargoWeight: ad.cargoWeight != null ? String(ad.cargoWeight) : '',
          vehicleType: ad.vehicleType || '',
          price: ad.price != null ? String(ad.price) : '',
          phone: ad.user?.phoneNumber || '',
          dispatcherName: [ad.user?.firstName, ad.user?.lastName].filter(Boolean).join(' ') || 'Dispetcher',
          dispatcherId: ad.userId,
          rating: r?.average || 0,
          ratingCount: r?.count || 0,
          createdAt: ad.createdAt.toISOString(),
        };
      }),
      pagination: { page, limit, total },
    };
  }

  async getDispatcherAdsCount() {
    const count = await this.prisma.ad.count({
      where: { status: 'ACTIVE' },
    });
    return { count };
  }

  async getTelegramDispatcherOrders(userId: string, params: {
    page: number;
    limit: number;
    scope?: string;
    cargoFrom?: string;
    cargoTo?: string;
    hoursAgo?: number;
  }) {
    const { page, limit, scope, cargoFrom, cargoTo, hoursAgo = 12 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (scope) where.scope = scope;
    if (cargoFrom) where.cargoFrom = { contains: cargoFrom, mode: 'insensitive' };
    if (cargoTo) where.cargoTo = { contains: cargoTo, mode: 'insensitive' };

    // Vaqt filtri: default 12 soat, qidiruvda 24 soat
    where.createdAt = { gte: new Date(Date.now() - hoursAgo * 60 * 60 * 1000) };

    const [data, total] = await Promise.all([
      this.prisma.telegramDispatcherAd.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.telegramDispatcherAd.count({ where }),
    ]);

    return {
      data: data.map((d) => ({
        ...d,
        createdAt: d.createdAt.toISOString(),
      })),
      pagination: { page, limit, total },
    };
  }

  async getNearbyOrders(userId: string, params: {
    page: number;
    limit: number;
    cargoFrom?: string;
    cargoTo?: string;
    vehicleType?: string;
  }) {
    const { page, limit, cargoFrom, cargoTo, vehicleType } = params;
    const skip = (page - 1) * limit;

    // Haydovchi GPS joylashuvini olish
    const profile = await this.prisma.driverProfile.findFirst({
      where: { userId },
      select: { lastLat: true, lastLng: true, lastCity: true },
    });

    if (!profile?.lastLat || !profile?.lastLng) {
      return { data: [], pagination: { page, limit, total: 0 } };
    }

    // ACTIVE e'lonlarni olish (dashboard + dispetcher app dan yaratilgan)
    const where: any = { status: 'ACTIVE' };
    if (cargoFrom) where.cargoFrom = { contains: cargoFrom, mode: 'insensitive' };
    if (cargoTo) where.cargoTo = { contains: cargoTo, mode: 'insensitive' };
    if (vehicleType) where.vehicleType = { contains: vehicleType, mode: 'insensitive' };

    const allAds = await this.prisma.ad.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, phoneNumber: true } },
      },
    });

    // Shaharlar koordinatalarini olish
    const cities = await this.getCachedCities();
    const cityMap = new Map<string, { lat: number; lng: number }>();
    for (const c of cities) {
      cityMap.set(c.name.toLowerCase(), { lat: c.lat, lng: c.lng });
    }

    // 100km ichidagilarni filtrlash
    const nearbyAds = [];
    for (const ad of allAds) {
      if (!ad.cargoFrom) continue;
      const cityKey = ad.cargoFrom.toLowerCase().trim();
      const cityCoord = cityMap.get(cityKey);
      if (!cityCoord) continue;

      const dist = this.haversineDistance(
        profile.lastLat, profile.lastLng,
        cityCoord.lat, cityCoord.lng,
      );

      if (dist <= 100) {
        nearbyAds.push({
          id: ad.id,
          title: ad.title || '',
          content: ad.content || ad.description || '',
          cargoFrom: ad.cargoFrom || '',
          cargoTo: ad.cargoTo || '',
          cargoWeight: ad.cargoWeight != null ? String(ad.cargoWeight) : '',
          vehicleType: ad.vehicleType || '',
          price: ad.price != null ? String(ad.price) : '',
          phone: ad.user?.phoneNumber || '',
          dispatcherName: [ad.user?.firstName, ad.user?.lastName].filter(Boolean).join(' ') || 'Dispetcher',
          dispatcherId: ad.userId,
          distance: Math.round(dist),
          createdAt: ad.createdAt.toISOString(),
        });
      }
    }

    nearbyAds.sort((a, b) => a.distance - b.distance);

    // Reytinglar
    const nearbyUserIds = [...new Set(nearbyAds.map((a) => a.dispatcherId))];
    const nearbyRatings = await this.prisma.userRating.groupBy({
      by: ['toUserId'],
      where: { toUserId: { in: nearbyUserIds } },
      _avg: { score: true },
      _count: { score: true },
    });
    const nearbyRatingMap = new Map(nearbyRatings.map((r) => [r.toUserId, {
      average: Math.round((r._avg.score || 0) * 10) / 10,
      count: r._count.score,
    }]));

    const total = nearbyAds.length;
    const paginated = nearbyAds.slice(skip, skip + limit).map((a) => {
      const r = nearbyRatingMap.get(a.dispatcherId);
      return { ...a, rating: r?.average || 0, ratingCount: r?.count || 0 };
    });

    return { data: paginated, pagination: { page, limit, total } };
  }

  async startChatWithDispatcher(driverUserId: string, adId: string) {
    // E'lonni topish
    const ad = await this.prisma.ad.findUnique({
      where: { id: adId },
      select: { userId: true, title: true, cargoFrom: true, cargoTo: true },
    });
    if (!ad) throw new NotFoundException("E'lon topilmadi");

    // Mavjud chat bor-yo'qligini tekshirish (DIRECT tipda, ikki user orasida)
    const existingRoom = await this.prisma.chatRoom.findFirst({
      where: {
        type: 'DIRECT',
        participants: {
          every: {
            userId: { in: [driverUserId, ad.userId] },
          },
        },
      },
      include: {
        participants: { include: { user: { select: { id: true, firstName: true } } } },
      },
    });

    if (existingRoom) {
      return { roomId: existingRoom.id, isNew: false };
    }

    // Yangi chat yaratish
    const roomName = ad.title || `${ad.cargoFrom || ''} → ${ad.cargoTo || ''}`;
    const room = await this.prisma.chatRoom.create({
      data: {
        name: roomName,
        type: 'DIRECT',
        participants: {
          create: [
            { userId: driverUserId, isAdmin: false },
            { userId: ad.userId, isAdmin: false },
          ],
        },
      },
    });

    return { roomId: room.id, isNew: true };
  }

  // ============================================================
  // RO'YXATDAN O'TISH
  // ============================================================

  async registerDriver(data: {
    fullName: string;
    phone: string;
    password?: string;
    passportNumber?: string;
    birthDate?: string;
    vehicleType: string;
    vehicleBrand?: string;
    vehicleModel?: string;
    vehicleColor?: string;
    vehicleNumber?: string;
    vehicleYear?: string;
    vehicleCapacity?: string;
    bodyType?: string;
    region?: string;
    district?: string;
  }) {
    // Ism va telefon normalizatsiya
    const fullName = normalizeName(data.fullName);
    const phone = normalizePhone(data.phone);
    if (!phone || phone.length < 10) {
      throw new BadRequestException('Noto\'g\'ri telefon raqam');
    }

    // Mashina raqami majburiy
    if (!data.vehicleNumber || data.vehicleNumber.trim().length < 4) {
      throw new BadRequestException('Mashina davlat raqamini kiriting');
    }

    // Mavjud telefon tekshirish
    const existingPhone = await this.prisma.driverProfile.findFirst({
      where: { phone },
    });
    if (existingPhone) {
      throw new BadRequestException('Bu telefon raqam bilan haydovchi allaqachon ro\'yxatdan o\'tgan');
    }

    // Mashina raqami unique tekshirish
    const vehicleNum = data.vehicleNumber?.toUpperCase().trim();
    if (vehicleNum) {
      const existingVehicle = await this.prisma.driverProfile.findFirst({
        where: { vehicleNumber: vehicleNum },
      });
      if (existingVehicle) {
        throw new BadRequestException('Bu mashina raqami bilan haydovchi allaqachon ro\'yxatdan o\'tgan');
      }
    }

    // User yaratish
    const nameParts = fullName.split(' ');
    const user = await this.prisma.user.create({
      data: {
        telegramId: `app_${phone}_${Date.now()}`,
        firstName: nameParts[0] || fullName,
        lastName: nameParts.slice(1).join(' ') || undefined,
        role: 'DRIVER',
        phoneNumber: phone,
      },
    });

    // DriverProfile yaratish — batafsil mashina ma'lumotlari
    const profile = await this.prisma.driverProfile.create({
      data: {
        userId: user.id,
        fullName,
        phone,
        passportNumber: data.passportNumber,
        birthDate: data.birthDate,
        vehicleType: data.vehicleType,
        vehicleBrand: data.vehicleBrand,
        vehicleModel: data.vehicleModel,
        vehicleColor: data.vehicleColor,
        vehicleNumber: data.vehicleNumber?.toUpperCase().trim(),
        vehicleYear: data.vehicleYear,
        vehicleCapacity: data.vehicleCapacity,
        bodyType: data.bodyType,
        region: data.region,
        district: data.district,
        // Avtomatik tasdiqlash — admin tasdig'i talab qilinmaydi
        isVerified: true,
        verifiedAt: new Date(),
        balance: 0,
        passwordHash: data.password ? await require('bcrypt').hash(data.password, 10) : null,
      },
    });

    // Bepul sinov obuna — avtomatik yoqish
    try {
      const trialDays = await this.systemConfig.getDriverTrialDays();
      if (trialDays > 0) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + trialDays);
        await this.prisma.driverProfile.update({
          where: { id: profile.id },
          data: { subscriptionActive: true, subscriptionEndDate: endDate },
        });
        this.logger.log(`Bepul sinov obuna: ${trialDays} kun — ${fullName}`);
      }
    } catch (e) {
      this.logger.warn(`Trial obuna xato: ${e.message}`);
    }

    this.logger.log(
      `Yangi haydovchi: ${fullName} | ${phone} | ${data.vehicleBrand || ''} ${data.vehicleNumber || ''} — avtomatik tasdiqlandi`,
    );

    // Admin'ga Telegram orqali xabar yuborish
    try {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const adminChatId = process.env.ADMIN_PAYMENT_CHAT_ID || '5475915736';
      if (botToken && adminChatId) {
        const text = `🚛 <b>Yangi haydovchi ro'yxatdan o'tdi!</b>\n\n` +
          `👤 Ism: <b>${data.fullName}</b>\n` +
          `📱 Tel: <code>${phone}</code>\n` +
          `🚗 Mashina: ${data.vehicleBrand || ''} ${data.vehicleType || ''}\n` +
          `🔢 Raqam: <code>${data.vehicleNumber || '-'}</code>\n` +
          `📦 Sig'imi: ${data.vehicleCapacity || '-'}\n` +
          `📍 Hudud: ${data.region || '-'}, ${data.district || '-'}`;
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const body = JSON.stringify({
          chat_id: adminChatId,
          text,
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: [[{ text: '✅ Tasdiqlash', callback_data: `verify_driver_${user.id}` }]] },
        });
        fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }).catch(() => {});
      }
    } catch (_) {}

    return {
      userId: user.id,
      profileId: profile.id,
      message: 'Ro\'yxatdan o\'tdingiz! Hisobingiz tasdiqlandi — ilovadan darhol foydalanishingiz mumkin.',
      isVerified: true,
    };
  }

  // ============================================================
  // MOS HAYDOVCHI TOPISH (E'lon uchun — dispetcher UI)
  // ============================================================

  async matchForAd(adId: string): Promise<any> {
    const ad = await this.prisma.ad.findUnique({ where: { id: adId } });
    if (!ad) throw new NotFoundException("E'lon topilmadi");

    const adVehicle = (ad.vehicleType ?? '').toLowerCase().trim();
    const adFrom    = (ad.cargoFrom ?? '').toLowerCase().trim();
    const adTo      = (ad.cargoTo ?? '').toLowerCase().trim();

    // ── Mashina guruhlari: bir guruhdan bo'lsa → mos, boshqasi → emas ──────
    const VEHICLE_GROUPS: Record<string, string[]> = {
      HEAVY:        ['fura', 'kamaz', 'man', 'volvo', 'scania', 'daf', 'mercedes', 'howo', 'shacman', 'dongfeng', 'iveco', 'actros', 'renault'],
      MEDIUM:       ['isuzu', 'gazel', 'porter', 'labo', 'lorri', 'bongo'],
      SMALL:        ['damas'],
      TENT:         ['tentli', 'tent', 'tenti'],
      REFRIGERATOR: ['refrijerator', 'ref', 'refrigerator', 'sovutgich'],
      FLATBED:      ['bortli', 'bort', 'platforma'],
      CONTAINER:    ['konteyner', 'container'],
      TIPPER:       ['samosval', 'tipper'],
      CRANE:        ['kran', 'manipulyator'],
      TANKER:       ['tanker', 'tsisterna'],
      LOWBOY:       ['trallar', 'trailer', 'lowboy', 'tral'],
    };

    const getGroup = (v: string): string | null => {
      const lower = v.toLowerCase();
      for (const [g, kws] of Object.entries(VEHICLE_GROUPS)) {
        if (kws.some(k => lower.includes(k))) return g;
      }
      return null;
    };

    const adGroup = adVehicle ? getGroup(adVehicle) : null;

    /** Mashina moslik balli: 100 = aniq, 80 = bir guruh, 0 = mos emas / ma'lumot yo'q */
    const calcVehicleScore = (driverVehicle: string | null | undefined): number => {
      if (!adVehicle) return 50;                          // e'londa talab yo'q → neutral
      if (!driverVehicle?.trim()) return 0;               // haydovchida mashina yo'q → exclude
      const dv = driverVehicle.toLowerCase();
      if (dv.includes(adVehicle) || adVehicle.includes(dv)) return 100; // aniq mos
      const dg = getGroup(dv);
      if (!dg) return 0;
      if (adGroup && dg === adGroup) return 80;           // bir guruh
      return 0;                                           // boshqa guruh
    };

    /**
     * Yo'nalish moslik balli: 0-100
     *
     * QOIDA: cargoFrom (asosiy to'chka) mos bo'lishi 100% SHART.
     * Agar e'londa cargoFrom bor, lekin haydovchi fromCity mos kelmasa → 0 → EXCLUDE.
     * cargoTo (borish manzili) — bonus ball (+40).
     *
     * Misol:
     *   E'lon: Buxoro → Namangan
     *   Haydovchi fromCity=Shahrisabz → 0 → EXCLUDE (Shahrisabz != Buxoro)
     *   Haydovchi fromCity=Buxoro     → 60 → O'TADI
     *   Haydovchi fromCity=Buxoro, toCity=Namangan → 100 → TO'LIQ MOS
     */
    const calcRouteScore = (from: string | null | undefined, to: string | null | undefined): number => {
      if (!adFrom && !adTo) return 50;   // e'londa yo'nalish yo'q → neutral

      const f = (from ?? '').toLowerCase().trim();
      const t = (to ?? '').toLowerCase().trim();

      if (adFrom) {
        // Asosiy to'chka (FROM) mos bo'lishi 100% SHART
        const fromMatch = f.length > 0 && (f.includes(adFrom) || adFrom.includes(f));
        if (!fromMatch) return 0; // EXCLUDE — asosiy shahar mos emas

        // FROM mos → 60 ball baza + TO mos bo'lsa +40 bonus
        const toMatch = adTo && t.length > 0 && (t.includes(adTo) || adTo.includes(t));
        return toMatch ? 100 : 60;
      }

      // Faqat adTo bor (adFrom yo'q)
      const toMatch = t.length > 0 && (t.includes(adTo) || adTo.includes(t));
      return toMatch ? 60 : 0;
    };

    const calcTotal = (vs: number, rs: number) => Math.round(vs * 0.65 + rs * 0.35);
    const hasRouteReq = !!(adFrom || adTo);
    const MIN_SCORE = 35;

    // ── Manba 1: App haydovchilari (DriverProfile) ─────────────────────────
    const profiles = await this.prisma.driverProfile.findMany({
      where: { isVerified: true },
      select: {
        id: true, userId: true, fullName: true, phone: true,
        vehicleType: true, vehicleBrand: true, vehicleModel: true,
        bodyType: true, vehicleCapacity: true, vehicleNumber: true,
        isOnline: true, lastLat: true, lastLng: true, lastCity: true,
        subscriptionActive: true, region: true,
      },
    });

    const fromCoord = adFrom ? await this.getCityCoordCached(ad.cargoFrom ?? '') : null;

    const appDrivers = profiles
      .map(d => {
        const vs = calcVehicleScore(d.vehicleType);
        if (vs === 0) return null;
        let distKm: number | null = null;
        if (d.lastLat && d.lastLng && fromCoord) {
          distKm = Math.round(this.haversineDistSync(d.lastLat, d.lastLng, fromCoord.lat, fromCoord.lng));
        }
        const rs = calcRouteScore(d.lastCity, null);
        // E'londa yo'nalish bor, lekin haydovchi hech qaysi shaharga mos emas → exclude
        if (hasRouteReq && rs === 0) return null;
        const ts = calcTotal(vs, rs);
        if (ts < MIN_SCORE) return null;
        return {
          source: 'APP' as const,
          driverProfileId: d.id,
          userId: d.userId,
          fullName: d.fullName ?? 'Haydovchi',
          phone: d.phone,
          vehicleType: d.vehicleType,
          vehicleBrand: d.vehicleBrand,
          vehicleModel: d.vehicleModel,
          bodyType: d.bodyType,
          vehicleCapacity: d.vehicleCapacity,
          vehicleNumber: d.vehicleNumber,
          isOnline: d.isOnline,
          lastCity: d.lastCity,
          region: d.region,
          distKm,
          vehicleScore: vs,
          routeScore: rs,
          totalScore: ts,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 20);

    // ── Manba 2: Haydovchi takliflari (DriverOffer) ─────────────────────────
    const now = new Date();
    const rawOffers = await this.prisma.driverOffer.findMany({
      where: {
        status: 'ACTIVE' as any,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      select: {
        id: true, driverId: true, fromCity: true, toCity: true,
        vehicleType: true, vehicleCapacity: true, phone: true,
        price: true, description: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    const offerDrivers = rawOffers
      .map(o => {
        const vs = calcVehicleScore(o.vehicleType);
        if (vs === 0) return null;
        const rs = calcRouteScore(o.fromCity, o.toCity);
        if (hasRouteReq && rs === 0) return null;
        const ts = calcTotal(vs, rs);
        if (ts < MIN_SCORE) return null;
        return {
          source: 'OFFER' as const,
          offerId: o.id,
          userId: o.driverId,
          phone: o.phone,
          vehicleType: o.vehicleType,
          vehicleCapacity: o.vehicleCapacity,
          fromCity: o.fromCity,
          toCity: o.toCity,
          price: o.price,
          description: o.description,
          createdAt: o.createdAt,
          vehicleScore: vs,
          routeScore: rs,
          totalScore: ts,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 20);

    // ── Manba 3: Telegram haydovchilari (Order type=DRIVER, so'nggi 7 kun) ─
    const cutoff = new Date(Date.now() - 7 * 24 * 3600_000); // 7 kun
    const tgOrders = await this.prisma.order.findMany({
      where: { type: 'DRIVER' as any, createdAt: { gte: cutoff } },
      select: {
        id: true, senderName: true, phone: true,
        vehicleType: true, vehicleCapacity: true,
        cargoFrom: true, cargoTo: true,
        messageText: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 300,
    });

    const seenPhones = new Set<string>();
    const telegramDrivers = tgOrders
      .map(o => {
        if (o.phone) {
          if (seenPhones.has(o.phone)) return null;
          seenPhones.add(o.phone);
        }
        const vs = calcVehicleScore(o.vehicleType);
        if (vs === 0) return null;
        const rs = calcRouteScore(o.cargoFrom, o.cargoTo);
        if (hasRouteReq && rs === 0) return null;
        const ts = calcTotal(vs, rs);
        if (ts < MIN_SCORE) return null;
        return {
          source: 'TELEGRAM' as const,
          orderId: o.id,
          senderName: o.senderName,
          phone: o.phone,
          vehicleType: o.vehicleType,
          vehicleCapacity: o.vehicleCapacity,
          fromCity: o.cargoFrom,
          toCity: o.cargoTo,
          messageText: (o.messageText ?? '').substring(0, 200),
          createdAt: o.createdAt,
          vehicleScore: vs,
          routeScore: rs,
          totalScore: ts,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 30);

    // ── Umumiy top-50 ───────────────────────────────────────────────────────
    const all = [...appDrivers, ...offerDrivers, ...telegramDrivers]
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 50);

    return {
      ad: {
        id: ad.id,
        title: ad.title,
        vehicleType: ad.vehicleType,
        cargoFrom: ad.cargoFrom,
        cargoTo: ad.cargoTo,
        cargoWeight: ad.cargoWeight,
      },
      total: all.length,
      appDrivers,
      offerDrivers,
      telegramDrivers,
      all,
    };
  }

  private async getCityCoordCached(cityName: string): Promise<{ lat: number; lng: number } | null> {
    const found = findCity(cityName);
    if (found) return { lat: found.lat, lng: found.lng };
    const cities = await this.getCachedCities();
    const norm = cityName.toLowerCase().trim();
    for (const c of cities) {
      if (c.name.toLowerCase().includes(norm) || norm.includes(c.name.toLowerCase())) {
        return { lat: c.lat, lng: c.lng };
      }
    }
    return null;
  }

  private haversineDistSync(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
