import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as admin from 'firebase-admin';
import * as fs from 'fs';

@Injectable()
export class FcmService implements OnModuleInit {
  private readonly logger = new Logger(FcmService.name);
  private isInitialized = false;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.initFirebase();
  }

  private initFirebase() {
    try {
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

      if (!serviceAccountPath) {
        this.logger.warn(
          'FIREBASE_SERVICE_ACCOUNT_PATH topilmadi — FCM push o\'chirilgan',
        );
        return;
      }

      if (!fs.existsSync(serviceAccountPath)) {
        this.logger.warn(
          `Firebase service account fayl topilmadi: ${serviceAccountPath}`,
        );
        return;
      }

      const serviceAccount = JSON.parse(
        fs.readFileSync(serviceAccountPath, 'utf8'),
      );

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      this.isInitialized = true;
      this.logger.log('Firebase Admin SDK muvaffaqiyatli ishga tushirildi');
    } catch (error) {
      this.logger.error(`Firebase init xatosi: ${error.message}`);
    }
  }

  /**
   * Bitta foydalanuvchiga push notification yuborish
   */
  async sendToUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<boolean> {
    if (!this.isInitialized) return false;

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { fcmToken: true },
      });

      if (!user?.fcmToken) return false;

      await admin.messaging().send({
        token: user.fcmToken,
        notification: { title, body },
        data: data || {},
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'general',
          },
        },
      });

      return true;
    } catch (error) {
      await this.handleSendError(error, userId);
      return false;
    }
  }

  /**
   * Bir nechta foydalanuvchiga batch push (500 tadan)
   */
  async sendToUsers(
    userIds: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<{ success: number; failed: number }> {
    if (!this.isInitialized || userIds.length === 0) {
      return { success: 0, failed: 0 };
    }

    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds }, fcmToken: { not: null } },
      select: { id: true, fcmToken: true },
    });

    const tokens = users
      .map((u) => u.fcmToken)
      .filter((t): t is string => !!t);

    if (tokens.length === 0) return { success: 0, failed: 0 };

    let totalSuccess = 0;
    let totalFailed = 0;
    const invalidTokenUserIds: string[] = [];

    // Firebase batch limit: 500
    const batchSize = 500;
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize);

      try {
        const response = await admin.messaging().sendEachForMulticast({
          tokens: batch,
          notification: { title, body },
          data: data || {},
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
              channelId: 'general',
            },
          },
        });

        totalSuccess += response.successCount;
        totalFailed += response.failureCount;

        // Yaroqsiz tokenlarni aniqlash
        response.responses.forEach((resp, idx) => {
          if (
            resp.error &&
            (resp.error.code === 'messaging/invalid-registration-token' ||
              resp.error.code === 'messaging/registration-token-not-registered')
          ) {
            const tokenIdx = i + idx;
            const user = users.find((u) => u.fcmToken === tokens[tokenIdx]);
            if (user) invalidTokenUserIds.push(user.id);
          }
        });
      } catch (error) {
        this.logger.error(`FCM batch xatosi: ${error.message}`);
        totalFailed += batch.length;
      }
    }

    // Yaroqsiz tokenlarni tozalash
    if (invalidTokenUserIds.length > 0) {
      await this.clearInvalidTokens(invalidTokenUserIds);
    }

    this.logger.log(
      `FCM batch: ${totalSuccess} muvaffaqiyat, ${totalFailed} xato (${tokens.length} tokendan)`,
    );

    return { success: totalSuccess, failed: totalFailed };
  }

  /**
   * WebSocket'ga ulanmagan (offline) foydalanuvchilarga push
   * @param onlyLineActive — true bo'lsa faqat linya yoqiq foydalanuvchilarga (e'lonlar uchun)
   */
  async sendToOfflineUsers(
    title: string,
    body: string,
    data: Record<string, string>,
    connectedUserIds: Set<string>,
    onlyLineActive: boolean = false,
  ): Promise<void> {
    if (!this.isInitialized) return;

    try {
      // FCM tokeni bor lekin WS ga ulanmagan foydalanuvchilarni topish
      const where: any = {
        fcmToken: { not: null },
        isActive: true,
        id: connectedUserIds.size > 0
          ? { notIn: Array.from(connectedUserIds) }
          : undefined,
      };
      // E'lon bildirishnomasi — faqat linya yoqiq userlarga
      if (onlyLineActive) {
        where.isLineActive = true;
      }

      const offlineUsers = await this.prisma.user.findMany({
        where,
        select: { id: true, fcmToken: true },
      });

      if (offlineUsers.length === 0) return;

      const offlineIds = offlineUsers.map((u) => u.id);
      await this.sendToUsers(offlineIds, title, body, data);
    } catch (error) {
      this.logger.error(`sendToOfflineUsers xatosi: ${error.message}`);
    }
  }

  /**
   * Faqat yaqindagi haydovchilarga push (cargoFrom shahri bilan lastCity solishtiriladi)
   */
  async sendToNearbyDrivers(
    title: string,
    body: string,
    data: Record<string, string>,
    cargoFrom: string | null,
    connectedUserIds: Set<string>,
  ): Promise<void> {
    if (!this.isInitialized) return;

    try {
      // Yaqin haydovchilarni topish: lastCity = cargoFrom yoki online haydovchilar
      const fromCity = cargoFrom?.toLowerCase().trim();

      const drivers = await this.prisma.driverProfile.findMany({
        where: {
          isOnline: true,
          isVerified: true,
          user: {
            fcmToken: { not: null },
            isActive: true,
            id: connectedUserIds.size > 0
              ? { notIn: Array.from(connectedUserIds) }
              : undefined,
          },
          // Agar cargoFrom bor bo'lsa, lastCity bilan solishtirish
          ...(fromCity ? {
            OR: [
              { lastCity: { contains: fromCity, mode: 'insensitive' as any } },
              // Yaqin viloyat uchun lastCity bo'sh bo'lsa ham yuborish
              { lastCity: null },
            ],
          } : {}),
        },
        select: { userId: true },
      });

      if (drivers.length === 0) return;

      const driverUserIds = drivers.map((d) => d.userId);
      await this.sendToUsers(driverUserIds, title, body, data);
      this.logger.log(`FCM nearby drivers: ${driverUserIds.length} ta haydovchiga yuborildi (${fromCity || 'barcha'})`);
    } catch (error) {
      this.logger.error(`sendToNearbyDrivers xatosi: ${error.message}`);
    }
  }

  /**
   * Xatolikni qayta ishlash — invalid tokenlarni tozalash
   */
  private async handleSendError(error: any, userId: string) {
    const code = error?.code || error?.errorInfo?.code;
    if (
      code === 'messaging/invalid-registration-token' ||
      code === 'messaging/registration-token-not-registered'
    ) {
      this.logger.warn(`Yaroqsiz FCM token tozalandi: userId=${userId}`);
      await this.prisma.user.update({
        where: { id: userId },
        data: { fcmToken: null },
      });
    } else {
      this.logger.error(
        `FCM xatosi (userId=${userId}): ${error.message || error}`,
      );
    }
  }

  /**
   * Yaroqsiz tokenlarni batch tozalash
   */
  private async clearInvalidTokens(userIds: string[]) {
    try {
      await this.prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { fcmToken: null },
      });
      this.logger.warn(
        `${userIds.length} ta yaroqsiz FCM token tozalandi`,
      );
    } catch (error) {
      this.logger.error(`Token tozalash xatosi: ${error.message}`);
    }
  }
}
