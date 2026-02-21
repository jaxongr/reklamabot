import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { PaymentStatus, SubscriptionPlan, Prisma } from '@prisma/client';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

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
    return payment;
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
      await this.subscriptionsService.create(payment.userId, payment.planType);
    }

    this.logger.log(`Payment ${id} approved by admin ${adminId}`);
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
