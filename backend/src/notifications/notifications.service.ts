import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { NotificationTarget } from '@prisma/client';
import { FcmService } from './fcm.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fcmService: FcmService,
  ) {}

  /**
   * Task 16: Bildirishnoma yaratish
   */
  async create(title: string, message: string, target: NotificationTarget, sentById: string) {
    const notification = await this.prisma.notification.create({
      data: { title, message, target, sentById },
    });

    // Tegishli foydalanuvchilarga userNotification yaratish
    const userWhere: any = { isActive: true };
    if (target === 'DRIVERS') {
      userWhere.role = 'DRIVER';
    } else if (target === 'DISPATCHERS') {
      userWhere.role = { in: ['DISPATCHER', 'ADMIN', 'SUPER_ADMIN'] };
    }

    const users = await this.prisma.user.findMany({
      where: userWhere,
      select: { id: true },
    });

    if (users.length > 0) {
      await this.prisma.userNotification.createMany({
        data: users.map((u) => ({
          userId: u.id,
          notificationId: notification.id,
        })),
        skipDuplicates: true,
      });
    }

    this.logger.log(`Bildirishnoma yuborildi: "${title}" → ${users.length} ta foydalanuvchi`);

    // FCM push ham yuborish — barcha qabul qiluvchilarga
    if (users.length > 0) {
      const userIds = users.map((u) => u.id);
      this.fcmService.sendToUsers(
        userIds,
        title,
        message.length > 200 ? message.substring(0, 200) + '...' : message,
        { type: 'admin_notification', notificationId: notification.id },
      ).catch((err) => {
        this.logger.error(`FCM admin notification xatosi: ${err.message}`);
      });
    }

    return { notification, recipientCount: users.length };
  }

  /**
   * Foydalanuvchi bildirishnomalari
   */
  async getUserNotifications(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [data, total, unreadCount] = await Promise.all([
      this.prisma.userNotification.findMany({
        where: { userId },
        include: { notification: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.userNotification.count({ where: { userId } }),
      this.prisma.userNotification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      data,
      unreadCount,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * O'qildi deb belgilash
   */
  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.userNotification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * FCM tokenni yangilash
   */
  async updateFcmToken(userId: string, token: string | null) {
    // Eski tokenni boshqa foydalanuvchilarda tozalash (bitta qurilma — bitta token)
    if (token) {
      await this.prisma.user.updateMany({
        where: { fcmToken: token, id: { not: userId } },
        data: { fcmToken: null },
      });
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { fcmToken: token },
    });

    this.logger.log(`FCM token yangilandi: userId=${userId}`);
  }

  /**
   * Barcha bildirishnomalar (admin)
   */
  async getAllNotifications(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: { select: { userNotifications: true } },
        },
      }),
      this.prisma.notification.count(),
    ]);

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
