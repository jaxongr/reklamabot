import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma.service';
import { PaymentStatus, SubscriptionPlan, Prisma } from '@prisma/client';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly adminChatId: string;
  private readonly botToken: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly config: ConfigService,
  ) {
    this.adminChatId = this.config.get('ADMIN_PAYMENT_CHAT_ID') || '5475915736';
    this.botToken = this.config.get('TELEGRAM_BOT_TOKEN') || '';
  }

  async create(userId: string, amount: number, planType: SubscriptionPlan, extra?: {
    currency?: string;
    cardNumber?: string;
    receiptImage?: string;
    transactionId?: string;
  }) {
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount,
        currency: extra?.currency || 'UZS',
        status: PaymentStatus.PENDING,
        planType,
        cardNumber: extra?.cardNumber,
        receiptImage: extra?.receiptImage,
        transactionId: extra?.transactionId,
      },
    });

    this.logger.log(`Payment created: ${payment.id} for user ${userId}`);

    // Telegram ga chek yuborish (admin chatga)
    this.sendPaymentNotification(payment, userId).catch(e =>
      this.logger.warn(`Telegram notification failed: ${e.message}`),
    );

    return payment;
  }

  private async sendPaymentNotification(payment: any, userId: string) {
    this.logger.log(`Sending payment notification: botToken=${this.botToken ? 'YES' : 'NO'}, chatId=${this.adminChatId}`);
    if (!this.botToken || !this.adminChatId) {
      this.logger.warn('Bot token or admin chat ID missing, skipping notification');
      return;
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Noma\'lum';
    const username = user?.username ? `@${user.username}` : '';

    const planLabels: Record<string, string> = {
      STARTER: 'Starter (50,000)',
      BUSINESS: 'Business (150,000)',
      PREMIUM: 'Premium (300,000)',
      ENTERPRISE: 'Enterprise (500,000)',
    };

    const text = [
      `💰 *Yangi to'lov so'rovi*`,
      ``,
      `👤 *Foydalanuvchi:* ${name} ${username}`,
      `📋 *Tarif:* ${planLabels[payment.planType] || payment.planType}`,
      `💵 *Summa:* ${payment.amount?.toLocaleString()} UZS`,
      `🆔 *Payment ID:* \`${payment.id}\``,
      ``,
      `📅 ${new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}`,
    ].join('\n');

    const botUrl = `https://api.telegram.org/bot${this.botToken}`;
    const replyMarkup = JSON.stringify({
      inline_keyboard: [[
        { text: '✅ Tasdiqlash', callback_data: `pay_approve_${payment.id}` },
        { text: '❌ Rad etish', callback_data: `pay_reject_${payment.id}` },
      ]],
    });

    const { execSync } = require('child_process');

    // Chek rasmi bilan yuborish (curl + multipart)
    if (payment.receiptImage) {
      const filePath = require('path').join(process.cwd(), payment.receiptImage);
      const fs = require('fs');
      if (fs.existsSync(filePath)) {
        try {
          const cmd = `curl -s -X POST "${botUrl}/sendPhoto" ` +
            `-F "chat_id=${this.adminChatId}" ` +
            `-F "photo=@${filePath}" ` +
            `-F "caption=${text.replace(/"/g, '\\"')}" ` +
            `-F "parse_mode=Markdown" ` +
            `-F 'reply_markup=${replyMarkup}'`;
          const result = execSync(cmd, { timeout: 15000 }).toString();
          this.logger.log(`Payment photo sent: ${JSON.parse(result).ok ? 'OK' : 'FAIL'}`);
          return;
        } catch (e) {
          this.logger.warn(`curl sendPhoto failed: ${(e as any).message}`);
        }
      } else {
        this.logger.warn(`Receipt file not found: ${filePath}`);
      }
    }

    // Rasmsiz — faqat matn
    try {
      const cmd = `curl -s -X POST "${botUrl}/sendMessage" ` +
        `-d "chat_id=${this.adminChatId}" ` +
        `-d "text=${encodeURIComponent(text)}" ` +
        `-d "parse_mode=Markdown" ` +
        `-d 'reply_markup=${replyMarkup}'`;
      execSync(cmd, { timeout: 15000 });
    } catch {}
  }

  async findAll(params?: {
    status?: PaymentStatus;
    skip?: number;
    take?: number;
    userId?: string;
  }) {
    const where: Prisma.PaymentWhereInput = {};

    if (params?.status) {
      where.status = params.status;
    }

    if (params?.userId) {
      where.userId = params.userId;
    }

    const { skip = 0, take = 50 } = params || {};

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              telegramId: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data,
      meta: { total, skip, take, hasMore: skip + take < total },
    };
  }

  async findByUser(userId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return { data: payments, total: payments.length };
  }

  async approve(id: string, adminId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment is not pending');
    }

    const updated = await this.prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.APPROVED,
        verifiedBy: adminId,
        verifiedAt: new Date(),
      },
    });

    // Activate subscription
    if (payment.planType) {
      try {
        await this.subscriptionsService.create(payment.userId, payment.planType);
      } catch (e) {
        this.logger.warn(`Subscription create failed: ${(e as any).message}`);
      }
    }

    // Balans to'ldirish
    try {
      await this.prisma.balanceTransaction.create({
        data: {
          userId: payment.userId,
          amount: payment.amount,
          type: 'TOP_UP',
          description: `To'lov tasdiqlandi: ${payment.amount} UZS (${payment.planType || 'Balans'})`,
          referenceId: payment.id,
        },
      });
      // Haydovchi profil balansini yangilash
      await this.prisma.driverProfile.updateMany({
        where: { userId: payment.userId },
        data: { balance: { increment: payment.amount } },
      });
    } catch (e) {
      this.logger.warn(`Balance topup failed: ${(e as any).message}`);
    }

    this.logger.log(`Payment ${id} approved by admin ${adminId}, amount: ${payment.amount}`);
    return updated;
  }

  async reject(id: string, adminId: string, reason: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment is not pending');
    }

    const updated = await this.prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.REJECTED,
        verifiedBy: adminId,
        verifiedAt: new Date(),
        rejectReason: reason,
      },
    });

    this.logger.log(`Payment ${id} rejected by admin ${adminId}: ${reason}`);
    return updated;
  }

  async getStatistics() {
    const [
      totalPayments,
      pendingPayments,
      approvedPayments,
      rejectedPayments,
      totalRevenue,
      pendingRevenue,
      todayPayments,
    ] = await Promise.all([
      this.prisma.payment.count(),
      this.prisma.payment.count({ where: { status: PaymentStatus.PENDING } }),
      this.prisma.payment.count({ where: { status: PaymentStatus.APPROVED } }),
      this.prisma.payment.count({ where: { status: PaymentStatus.REJECTED } }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: PaymentStatus.APPROVED },
      }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: PaymentStatus.PENDING },
      }),
      this.prisma.payment.count({
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
    ]);

    return {
      total: totalPayments,
      pending: pendingPayments,
      approved: approvedPayments,
      rejected: rejectedPayments,
      totalRevenue: totalRevenue._sum.amount || 0,
      pendingRevenue: pendingRevenue._sum.amount || 0,
      today: todayPayments,
    };
  }

  async expirePending(olderThanHours: number = 48) {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - olderThanHours);

    const result = await this.prisma.payment.updateMany({
      where: {
        status: PaymentStatus.PENDING,
        createdAt: { lte: cutoff },
      },
      data: { status: PaymentStatus.EXPIRED },
    });

    this.logger.log(`Expired ${result.count} pending payments`);
    return result.count;
  }
}
