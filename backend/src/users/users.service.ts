import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { User, UserRole, UserStatus, Prisma } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  // GPS shahar topish uchun cache (10 daqiqa)
  private cachedCities: Array<{ name: string; lat: number; lng: number }> | null = null;
  private cachedCitiesAt = 0;

  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // GPS LOCATION (har qanday autentifikatsiya qilingan user uchun)
  // ============================================================

  private async getCachedCities() {
    const now = Date.now();
    if (this.cachedCities && now - this.cachedCitiesAt < 10 * 60_000) {
      return this.cachedCities;
    }
    const locations = await this.prisma.location.findMany({
      where: { type: 'CITY', lat: { not: null }, lng: { not: null } },
      select: { name: true, lat: true, lng: true },
    });
    this.cachedCities = locations.filter(
      (l) => l.lat != null && l.lng != null,
    ) as Array<{ name: string; lat: number; lng: number }>;
    this.cachedCitiesAt = now;
    return this.cachedCities;
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const toRad = (deg: number) => deg * (Math.PI / 180);
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Online ping — foydalanuvchini onlayn deb belgilash + lastOnlineAt yangilash.
   * Mobile foreground service har 10 sekundda chaqiradi.
   */
  async markOnline(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isOnline: true,
        lastOnlineAt: new Date(),
      },
      select: { id: true, isOnline: true, lastOnlineAt: true },
    });
  }

  /**
   * Foydalanuvchi joylashuvini yangilash (har qanday autentifikatsiya qilingan rol)
   */
  async updateMyLocation(userId: string, lat: number, lng: number) {
    // Eng yaqin shahar topish
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
    } catch (e: any) {
      this.logger.warn(`Shahar topishda xatolik: ${e?.message || e}`);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        lastLat: lat,
        lastLng: lng,
        lastLocationAt: new Date(),
        lastCity,
      },
      select: {
        id: true,
        lastLat: true,
        lastLng: true,
        lastLocationAt: true,
        lastCity: true,
      },
    });
  }

  /**
   * Online dispetcherlar — admin xaritasi uchun
   * Filter: role=DISPATCHER, lastLocationAt oxirgi 5 daqiqada
   */
  async getOnlineDispatchers(thresholdMinutes = 5) {
    const since = new Date(Date.now() - thresholdMinutes * 60_000);

    return this.prisma.user.findMany({
      where: {
        role: UserRole.DISPATCHER,
        isActive: true,
        lastLocationAt: { gte: since },
        lastLat: { not: null },
        lastLng: { not: null },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        phoneNumber: true,
        lastLat: true,
        lastLng: true,
        lastCity: true,
        lastLocationAt: true,
        isOnline: true,
        isLineActive: true,
        role: true,
      },
      orderBy: { lastLocationAt: 'desc' },
      take: 1000,
    });
  }

  /**
   * Create a new user
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    try {
      const user = await this.prisma.user.create({
        data,
        include: {
          subscription: true,
        },
      });

      this.logger.log(`User created: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error('Failed to create user', error);
      throw error;
    }
  }

  /**
   * Find all users with pagination and filtering
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    const { skip = 0, take = 50, where, orderBy } = params;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        where,
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          subscription: true,
          sessions: {
            where: { status: { not: 'DELETED' } },
            select: {
              id: true,
              name: true,
              phone: true,
              status: true,
              isFrozen: true,
              totalGroups: true,
              activeGroups: true,
              lastSyncAt: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              ads: true,
              sessions: true,
              payments: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        skip,
        take,
        hasMore: skip + take < total,
      },
    };
  }

  /**
   * Find user by ID
   */
  async findOne(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        subscription: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Find user by Telegram ID
   */
  async findByTelegramId(telegramId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { telegramId },
      include: {
        subscription: true,
      },
    });
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { username: { equals: username, mode: 'insensitive' } },
      include: {
        subscription: true,
      },
    });
  }

  /**
   * Update user
   */
  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data,
        include: {
          subscription: true,
        },
      });

      this.logger.log(`User updated: ${id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to update user: ${id}`, error);
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  /**
   * Update last login time
   */
  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { updatedAt: new Date() },
    });
  }

  /**
   * Delete user (soft delete by setting status to INACTIVE)
   */
  async remove(id: string): Promise<User> {
    return this.update(id, {
      status: UserStatus.SUSPENDED,
      isActive: false,
    });
  }

  /**
   * Change user role
   */
  async changeRole(id: string, role: UserRole): Promise<User> {
    return this.update(id, { role });
  }

  /**
   * Update user subscription status
   */
  async updateSubscriptionStatus(
    id: string,
    status: 'active' | 'suspended' | 'banned',
  ): Promise<User> {
    const userStatus =
      status === 'active'
        ? UserStatus.ACTIVE
        : status === 'suspended'
        ? UserStatus.SUSPENDED
        : UserStatus.BANNED;

    return this.update(id, {
      status: userStatus,
      isActive: status === 'active',
    });
  }

  /**
   * Get user statistics
   */
  async getStatistics(userId: string) {
    const user = await this.findOne(userId);

    const [
      totalAds,
      activeAds,
      closedAds,
      totalPosts,
      totalRevenue,
      activeSessions,
    ] = await Promise.all([
      this.prisma.ad.count({ where: { userId } }),
      this.prisma.ad.count({ where: { userId, status: 'ACTIVE' } }),
      this.prisma.ad.count({ where: { userId, status: 'CLOSED' } }),
      this.prisma.post.count({ where: { userId } }),
      this.prisma.payment.aggregate({
        where: {
          userId,
          status: 'APPROVED',
        },
        _sum: { amount: true },
      }),
      this.prisma.session.count({
        where: { userId, status: 'ACTIVE' },
      }),
    ]);

    return {
      user: {
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        language: user.language,
        role: user.role,
        status: user.status,
        isActive: user.isActive,
        isLineActive: user.isLineActive,
        brandAdText: user.brandAdText,
        brandAdEnabled: user.brandAdEnabled,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      ads: {
        total: totalAds,
        active: activeAds,
        closed: closedAds,
      },
      posts: {
        total: totalPosts,
      },
      revenue: {
        total: totalRevenue._sum.amount || 0,
      },
      sessions: {
        active: activeSessions,
      },
    };
  }

  /**
   * Search users by username or phone
   */
  async search(query: string) {
    return this.findAll({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { phoneNumber: { contains: query } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
  }

  /**
   * Get users by role
   */
  async findByRole(role: UserRole) {
    return this.findAll({
      where: { role },
    });
  }

  /**
   * Get active users
   */
  async findActive() {
    return this.findAll({
      where: {
        isActive: true,
        status: UserStatus.ACTIVE,
      },
    });
  }

  /**
   * Update brand advertisement
   */
  async updateBrandAd(
    userId: string,
    brandAdText: string,
    brandAdEnabled: boolean,
  ): Promise<User> {
    return this.update(userId, {
      brandAdText,
      brandAdEnabled,
    });
  }

  /**
   * Toggle user active status
   */
  async toggleActive(id: string, reason?: string): Promise<User> {
    const user = await this.findOne(id);
    const newActive = !user.isActive;
    return this.prisma.user.update({
      where: { id },
      data: {
        isActive: newActive,
        status: newActive ? UserStatus.ACTIVE : UserStatus.SUSPENDED,
        blockReason: newActive ? null : (reason || 'Admin tomonidan bloklangan'),
        blockedAt: newActive ? null : new Date(),
      },
    });
  }

  /**
   * Batch update users
   */
  async batchUpdate(
    ids: string[],
    data: Prisma.UserUpdateInput,
  ): Promise<{ count: number }> {
    const result = await this.prisma.user.updateMany({
      where: { id: { in: ids } },
      data,
    });

    this.logger.log(`Batch updated ${result.count} users`);
    return { count: result.count };
  }

  /**
   * Get users with expiring subscriptions
   */
  async findExpiringSubscriptions(daysBeforeExpiry: number = 7) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysBeforeExpiry);

    return this.prisma.user.findMany({
      where: {
        subscription: {
          status: 'ACTIVE',
          endDate: {
            lte: expiryDate,
          },
        },
        isActive: true,
      },
      include: {
        subscription: true,
      },
    });
  }

  /**
   * Get dashboard summary for admin
   */
  async getDashboardSummary() {
    const [
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      usersByRole,
      usersWithSubscription,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { isActive: true, status: UserStatus.ACTIVE },
      }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
      }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
      this.prisma.user.count({
        where: {
          subscription: {
            status: 'ACTIVE',
          },
        },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      usersByRole,
      usersWithSubscription,
    };
  }

  /**
   * Linya holatini o'zgartirish
   */
  async setLineStatus(userId: string, isLineActive: boolean) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isLineActive },
      select: { id: true, isLineActive: true },
    });
    this.logger.log(`Linya ${isLineActive ? 'yoqildi' : "o'chirildi"}: userId=${userId}`);
    return user;
  }

  // ============================================================
  // Task 14: E'lon uchun telefon raqamlar
  // ============================================================

  async getAdPhones(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { adPhoneNumbers: true },
    });
    return user?.adPhoneNumbers || [];
  }

  async updateAdPhones(userId: string, phones: string[]) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { adPhoneNumbers: phones },
      select: { adPhoneNumbers: true },
    });
  }

  // ===================== HODIMLAR BOSHQARUVI =====================

  /**
   * Yangi hodim yaratish (username + password + role)
   */
  async createStaff(data: {
    username: string;
    password: string;
    firstName: string;
    lastName?: string;
    role: UserRole;
    phoneNumber?: string;
  }) {
    // Username tekshirish
    const existing = await this.prisma.user.findFirst({
      where: { username: { equals: data.username, mode: 'insensitive' } },
    });
    if (existing) {
      throw new BadRequestException('Bu username allaqachon mavjud');
    }

    const passwordHash = crypto.createHash('sha256').update(data.password).digest('hex');
    const telegramId = `staff_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    return this.prisma.user.create({
      data: {
        telegramId,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        role: data.role,
        status: 'ACTIVE',
        isActive: true,
        brandAdText: passwordHash,
      },
    });
  }

  /**
   * Hodim parolini o'zgartirish
   */
  async changePassword(userId: string, newPassword: string) {
    const passwordHash = crypto.createHash('sha256').update(newPassword).digest('hex');
    return this.prisma.user.update({
      where: { id: userId },
      data: { brandAdText: passwordHash },
      select: { id: true, username: true },
    });
  }

  /**
   * Barcha hodimlar ro'yxati (ADMIN, SUPER_ADMIN, DISPATCHER)
   */
  async getStaffList() {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { telegramId: { startsWith: 'staff_' } },
          { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
        ],
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        status: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIds(ids: string[]) {
    return this.prisma.user.findMany({
      where: { id: { in: ids } },
      select: {
        id: true, firstName: true, lastName: true,
        phoneNumber: true, role: true, lastOnlineAt: true,
      },
    });
  }

  async findAllWithOnlineStatus(where: any) {
    return this.prisma.user.findMany({
      where,
      select: {
        id: true, firstName: true, lastName: true,
        phoneNumber: true, role: true, isOnline: true, lastOnlineAt: true,
        fcmToken: true, createdAt: true,
      },
      orderBy: [{ isOnline: 'desc' }, { lastOnlineAt: 'desc' }],
      take: 500,
    });
  }
}
