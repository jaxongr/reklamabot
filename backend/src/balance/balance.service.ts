import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { BalanceTransactionType } from '@prisma/client';

@Injectable()
export class BalanceService {
  private readonly logger = new Logger(BalanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Task 19: Balans olish (haydovchi + dispetcher)
   */
  async getBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, dispatcherBalance: true, driverProfile: { select: { balance: true } } },
    });

    if (!user) return { balance: 0 };

    if (user.role === 'DRIVER' && user.driverProfile) {
      return { balance: user.driverProfile.balance };
    }

    return { balance: user.dispatcherBalance };
  }

  /**
   * Balans to'ldirish
   */
  async topUp(userId: string, amount: number, description?: string) {
    if (amount <= 0) throw new BadRequestException('Miqdor musbat bo\'lishi kerak');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, driverProfile: { select: { id: true } } },
    });

    if (!user) throw new BadRequestException('Foydalanuvchi topilmadi');

    // Tranzaksiya yaratish
    await this.prisma.balanceTransaction.create({
      data: {
        userId,
        amount,
        type: BalanceTransactionType.TOP_UP,
        description: description || 'Balans to\'ldirish',
      },
    });

    // Balans yangilash
    if (user.role === 'DRIVER' && user.driverProfile) {
      await this.prisma.driverProfile.update({
        where: { id: user.driverProfile.id },
        data: { balance: { increment: amount } },
      });
    } else {
      await this.prisma.user.update({
        where: { id: userId },
        data: { dispatcherBalance: { increment: amount } },
      });
    }

    this.logger.log(`Balans to'ldirildi: ${userId} +${amount}`);
    return { success: true, amount };
  }

  /**
   * Tranzaksiyalar tarixi
   */
  async getTransactions(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.balanceTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.balanceTransaction.count({ where: { userId } }),
    ]);

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
