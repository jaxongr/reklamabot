import { Injectable, Logger, OnModuleInit, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AccountingEntryType, Prisma } from '@prisma/client';

const DEFAULT_CATEGORIES = [
  // INCOME
  { name: 'Obuna to\'lovlari', type: 'INCOME' as const, icon: 'CrownOutlined', color: '#52c41a', isSystem: true },
  { name: 'Buyurtma komissiyalari', type: 'INCOME' as const, icon: 'DollarOutlined', color: '#1890ff', isSystem: true },
  { name: 'Balans to\'ldirish', type: 'INCOME' as const, icon: 'WalletOutlined', color: '#13c2c2', isSystem: true },
  { name: 'Boshqa kirim', type: 'INCOME' as const, icon: 'PlusCircleOutlined', color: '#722ed1', isSystem: false },
  // EXPENSE
  { name: 'SMS xarajatlari', type: 'EXPENSE' as const, icon: 'MessageOutlined', color: '#fa541c', isSystem: true },
  { name: 'Server xarajatlari', type: 'EXPENSE' as const, icon: 'CloudServerOutlined', color: '#eb2f96', isSystem: true },
  { name: 'Ish haqi', type: 'EXPENSE' as const, icon: 'TeamOutlined', color: '#f5222d', isSystem: true },
  { name: 'Reklama xarajatlari', type: 'EXPENSE' as const, icon: 'NotificationOutlined', color: '#fa8c16', isSystem: true },
  { name: 'Telegram Premium', type: 'EXPENSE' as const, icon: 'SendOutlined', color: '#2f54eb', isSystem: true },
  { name: 'Boshqa chiqim', type: 'EXPENSE' as const, icon: 'MinusCircleOutlined', color: '#8c8c8c', isSystem: false },
];

@Injectable()
export class AccountingService implements OnModuleInit {
  private readonly logger = new Logger(AccountingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedCategories();
  }

  private async seedCategories() {
    for (const cat of DEFAULT_CATEGORIES) {
      await this.prisma.accountingCategory.upsert({
        where: { name_type: { name: cat.name, type: cat.type } },
        update: {},
        create: cat,
      });
    }
    this.logger.log('Buxgalteriya kategoriyalari tayyor');
  }

  // ==================== SUMMARY ====================

  async getSummary(startDate: Date, endDate: Date, groupBy: 'day' | 'month' = 'month') {
    const entries = await this.prisma.accountingEntry.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      select: { type: true, amount: true, date: true },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const breakdownMap = new Map<string, { income: number; expense: number }>();

    for (const e of entries) {
      if (e.type === 'INCOME') totalIncome += e.amount;
      else totalExpense += e.amount;

      const period = groupBy === 'day'
        ? e.date.toISOString().slice(0, 10)
        : e.date.toISOString().slice(0, 7);

      if (!breakdownMap.has(period)) breakdownMap.set(period, { income: 0, expense: 0 });
      const b = breakdownMap.get(period)!;
      if (e.type === 'INCOME') b.income += e.amount;
      else b.expense += e.amount;
    }

    const breakdown = Array.from(breakdownMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([period, data]) => ({
        period,
        income: Math.round(data.income),
        expense: Math.round(data.expense),
        profit: Math.round(data.income - data.expense),
      }));

    return {
      totalIncome: Math.round(totalIncome),
      totalExpense: Math.round(totalExpense),
      profit: Math.round(totalIncome - totalExpense),
      breakdown,
    };
  }

  // ==================== ENTRIES ====================

  async getEntries(params: {
    type?: AccountingEntryType;
    categoryId?: string;
    startDate?: Date;
    endDate?: Date;
    skip?: number;
    take?: number;
  }) {
    const where: Prisma.AccountingEntryWhereInput = {};
    if (params.type) where.type = params.type;
    if (params.categoryId) where.categoryId = params.categoryId;
    if (params.startDate || params.endDate) {
      where.date = {};
      if (params.startDate) where.date.gte = params.startDate;
      if (params.endDate) where.date.lte = params.endDate;
    }

    const [data, total] = await Promise.all([
      this.prisma.accountingEntry.findMany({
        where,
        include: { category: true, createdBy: { select: { id: true, firstName: true, username: true } } },
        orderBy: { date: 'desc' },
        skip: params.skip || 0,
        take: params.take || 50,
      }),
      this.prisma.accountingEntry.count({ where }),
    ]);

    return { data, total, skip: params.skip || 0, take: params.take || 50 };
  }

  async createEntry(data: {
    type: AccountingEntryType;
    categoryId: string;
    amount: number;
    currency?: string;
    description?: string;
    date: Date;
    referenceId?: string;
    referenceType?: string;
  }, createdById: string) {
    if (data.amount <= 0) throw new BadRequestException('Summa musbat bo\'lishi kerak');

    const category = await this.prisma.accountingCategory.findUnique({ where: { id: data.categoryId } });
    if (!category) throw new NotFoundException('Kategoriya topilmadi');
    if (category.type !== data.type) throw new BadRequestException('Kategoriya turi mos kelmaydi');

    return this.prisma.accountingEntry.create({
      data: {
        ...data,
        currency: data.currency || 'UZS',
        referenceType: data.referenceType || 'MANUAL',
        createdById,
      },
      include: { category: true },
    });
  }

  async updateEntry(id: string, data: {
    categoryId?: string;
    amount?: number;
    description?: string;
    date?: Date;
  }) {
    const entry = await this.prisma.accountingEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException('Yozuv topilmadi');

    return this.prisma.accountingEntry.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async deleteEntry(id: string) {
    const entry = await this.prisma.accountingEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException('Yozuv topilmadi');
    return this.prisma.accountingEntry.delete({ where: { id } });
  }

  // ==================== CATEGORIES ====================

  async getCategories(type?: AccountingEntryType) {
    const where: Prisma.AccountingCategoryWhereInput = { isActive: true };
    if (type) where.type = type;
    return this.prisma.accountingCategory.findMany({ where, orderBy: { name: 'asc' } });
  }

  async createCategory(data: { name: string; type: AccountingEntryType; icon?: string; color?: string }) {
    return this.prisma.accountingCategory.create({ data });
  }

  async updateCategory(id: string, data: { name?: string; icon?: string; color?: string }) {
    return this.prisma.accountingCategory.update({ where: { id }, data });
  }

  async deleteCategory(id: string) {
    const cat = await this.prisma.accountingCategory.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Kategoriya topilmadi');
    if (cat.isSystem) throw new BadRequestException('Tizim kategoriyasini o\'chirish mumkin emas');
    return this.prisma.accountingCategory.update({ where: { id }, data: { isActive: false } });
  }

  // ==================== CHART DATA ====================

  async getChartData(startDate: Date, endDate: Date, groupBy: 'day' | 'month' = 'month', type?: AccountingEntryType) {
    const where: Prisma.AccountingEntryWhereInput = {
      date: { gte: startDate, lte: endDate },
    };
    if (type) where.type = type;

    const entries = await this.prisma.accountingEntry.findMany({
      where,
      include: { category: true },
    });

    const map = new Map<string, number>();
    for (const e of entries) {
      const period = groupBy === 'day'
        ? e.date.toISOString().slice(0, 10)
        : e.date.toISOString().slice(0, 7);
      const key = `${period}|${e.category.name}|${e.type}`;
      map.set(key, (map.get(key) || 0) + e.amount);
    }

    return Array.from(map.entries()).map(([key, amount]) => {
      const [period, categoryName, entryType] = key.split('|');
      return { period, categoryName, type: entryType, amount: Math.round(amount) };
    });
  }

  // ==================== SYNC ====================

  async syncFromSources(createdById: string) {
    let synced = 0;

    // 1. Approved payments → INCOME
    const incomeCategory = await this.prisma.accountingCategory.findFirst({
      where: { name: 'Obuna to\'lovlari', type: 'INCOME' },
    });
    if (incomeCategory) {
      const payments = await this.prisma.payment.findMany({
        where: { status: 'APPROVED' },
        select: { id: true, amount: true, createdAt: true, planType: true },
      });

      for (const p of payments) {
        const exists = await this.prisma.accountingEntry.findFirst({
          where: { referenceType: 'PAYMENT', referenceId: p.id },
        });
        if (!exists) {
          await this.prisma.accountingEntry.create({
            data: {
              type: 'INCOME',
              categoryId: incomeCategory.id,
              amount: p.amount,
              description: `Obuna to'lovi: ${p.planType || 'Noma\'lum'}`,
              date: p.createdAt,
              referenceId: p.id,
              referenceType: 'PAYMENT',
              createdById,
            },
          });
          synced++;
        }
      }
    }

    // 2. Closed orders with closedAmount → INCOME (commission)
    const commissionCategory = await this.prisma.accountingCategory.findFirst({
      where: { name: 'Buyurtma komissiyalari', type: 'INCOME' },
    });
    if (commissionCategory) {
      const orders = await this.prisma.order.findMany({
        where: { closedAmount: { not: null }, closedAt: { not: null } },
        select: { id: true, closedAmount: true, closedAt: true, cargoFrom: true, cargoTo: true },
      });

      for (const o of orders) {
        if (!o.closedAmount || !o.closedAt) continue;
        const exists = await this.prisma.accountingEntry.findFirst({
          where: { referenceType: 'ORDER', referenceId: o.id },
        });
        if (!exists) {
          await this.prisma.accountingEntry.create({
            data: {
              type: 'INCOME',
              categoryId: commissionCategory.id,
              amount: o.closedAmount,
              description: `Buyurtma: ${o.cargoFrom || '?'} → ${o.cargoTo || '?'}`,
              date: o.closedAt,
              referenceId: o.id,
              referenceType: 'ORDER',
              createdById,
            },
          });
          synced++;
        }
      }
    }

    // 3. Subscription history → INCOME
    const subHistories = await this.prisma.subscriptionHistory.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, amount: true, createdAt: true, planType: true },
    });
    if (incomeCategory) {
      for (const sh of subHistories) {
        const exists = await this.prisma.accountingEntry.findFirst({
          where: { referenceType: 'SUBSCRIPTION', referenceId: sh.id },
        });
        if (!exists && sh.amount > 0) {
          await this.prisma.accountingEntry.create({
            data: {
              type: 'INCOME',
              categoryId: incomeCategory.id,
              amount: sh.amount,
              description: `Obuna: ${sh.planType}`,
              date: sh.createdAt,
              referenceId: sh.id,
              referenceType: 'SUBSCRIPTION',
              createdById,
            },
          });
          synced++;
        }
      }
    }

    this.logger.log(`Sinxronlash: ${synced} ta yangi yozuv qo'shildi`);
    return { synced };
  }

  // ==================== EXPORT ====================

  async exportEntries(startDate: Date, endDate: Date, type?: AccountingEntryType) {
    const where: Prisma.AccountingEntryWhereInput = {
      date: { gte: startDate, lte: endDate },
    };
    if (type) where.type = type;

    const entries = await this.prisma.accountingEntry.findMany({
      where,
      include: { category: true, createdBy: { select: { firstName: true, username: true } } },
      orderBy: { date: 'asc' },
    });

    // CSV format
    const header = 'Sana,Turi,Kategoriya,Summa,Valyuta,Tavsif,Manba,Yozgan\n';
    const rows = entries.map(e => {
      const who = e.createdBy?.firstName || e.createdBy?.username || '-';
      return [
        e.date.toISOString().slice(0, 10),
        e.type === 'INCOME' ? 'Kirim' : 'Chiqim',
        e.category.name,
        e.amount,
        e.currency,
        (e.description || '').replace(/,/g, ';'),
        e.referenceType || 'MANUAL',
        who,
      ].join(',');
    }).join('\n');

    return header + rows;
  }

  // ==================== PAYMENT ANALYTICS (To'lovlar tafsiloti) ====================

  /**
   * Barcha to'lovlarni kanal bo'yicha guruhlash bilan olish
   * channel aniqlanishi: transactionId pattern + receiptImage mavjudligi
   */
  async getPaymentAnalytics(startDate: Date, endDate: Date) {
    const payments = await this.prisma.payment.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, username: true, telegramId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Admin ID → name cache
    const adminIds = [...new Set(payments.filter(p => p.verifiedBy).map(p => p.verifiedBy!))];
    const admins = adminIds.length > 0 ? await this.prisma.user.findMany({
      where: { id: { in: adminIds } },
      select: { id: true, firstName: true, username: true },
    }) : [];
    const adminMap = new Map(admins.map(a => [a.id, a.firstName || a.username || a.id]));

    // Kanal aniqlash va to'lovlarni formatlash
    const formatted = payments.map(p => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      planType: p.planType,
      channel: this.detectPaymentChannel(p),
      // Kim to'lagan
      user: {
        id: p.user.id,
        name: [p.user.firstName, p.user.lastName].filter(Boolean).join(' ') || p.user.username || p.user.telegramId,
        username: p.user.username,
        telegramId: p.user.telegramId,
      },
      // Kim tasdiqlagan
      verifiedBy: p.verifiedBy ? adminMap.get(p.verifiedBy) || p.verifiedBy : null,
      verifiedAt: p.verifiedAt,
      rejectReason: p.rejectReason,
      receiptImage: p.receiptImage,
      transactionId: p.transactionId,
      cardNumber: p.cardNumber,
      createdAt: p.createdAt,
    }));

    // Kanal bo'yicha statistika
    const channelStats: Record<string, { count: number; approved: number; rejected: number; pending: number; total: number }> = {};
    for (const p of formatted) {
      if (!channelStats[p.channel]) {
        channelStats[p.channel] = { count: 0, approved: 0, rejected: 0, pending: 0, total: 0 };
      }
      const s = channelStats[p.channel];
      s.count++;
      if (p.status === 'APPROVED') { s.approved++; s.total += p.amount; }
      else if (p.status === 'REJECTED') s.rejected++;
      else if (p.status === 'PENDING') s.pending++;
    }

    // Umumiy statistika
    const totalApproved = formatted.filter(p => p.status === 'APPROVED').reduce((s, p) => s + p.amount, 0);
    const totalPending = formatted.filter(p => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0);

    return {
      payments: formatted,
      channelStats,
      summary: {
        total: formatted.length,
        approved: formatted.filter(p => p.status === 'APPROVED').length,
        rejected: formatted.filter(p => p.status === 'REJECTED').length,
        pending: formatted.filter(p => p.status === 'PENDING').length,
        totalApproved: Math.round(totalApproved),
        totalPending: Math.round(totalPending),
      },
    };
  }

  /**
   * To'lov kanalini aniqlash
   * Hozircha transactionId va receiptImage asosida
   * Keyinchalik Payment.channel field qo'shilganda to'g'ridan-to'g'ri o'qiladi
   */
  private detectPaymentChannel(payment: {
    transactionId?: string | null;
    receiptImage?: string | null;
    cardNumber?: string | null;
  }): string {
    const txId = payment.transactionId?.toLowerCase() || '';
    // Click pattern
    if (txId.startsWith('click_') || txId.includes('click')) return 'Click';
    // Payme pattern
    if (txId.startsWith('payme_') || txId.includes('payme')) return 'Payme';
    // Paynet pattern
    if (txId.startsWith('paynet_') || txId.includes('paynet')) return 'Paynet';
    // Uzum/Uzcard
    if (txId.startsWith('uzum_') || txId.includes('uzum')) return 'Uzum';

    // Receipt bor = qo'lda to'lov (Bot yoki Dashboard)
    if (payment.receiptImage) {
      // Telegram URL = Bot orqali
      if (payment.receiptImage.includes('telegram') || payment.receiptImage.includes('t.me') || payment.receiptImage.includes('api.telegram')) {
        return 'Bot';
      }
      return 'Dashboard';
    }

    // Karta raqam bor, lekin receipt yo'q = to'g'ridan-to'g'ri karta
    if (payment.cardNumber) return 'Karta';

    return 'Noma\'lum';
  }
}
