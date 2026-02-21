import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { User, UserRole, UserStatus, Prisma } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

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
  async toggleActive(id: string): Promise<User> {
    const user = await this.findOne(id);
    return this.update(id, {
      isActive: !user.isActive,
      status: !user.isActive ? UserStatus.ACTIVE : UserStatus.SUSPENDED,
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
}
