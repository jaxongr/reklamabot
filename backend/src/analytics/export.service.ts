import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Task 8: Buyurtmalar eksporti (JSON formatda — CSV konversiya frontendda)
   */
  async exportOrders(dateFrom?: string, dateTo?: string) {
    const where: any = {};
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const orders = await this.prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10000,
    });

    return orders.map((o) => ({
      id: o.id,
      sana: o.createdAt.toISOString().split('T')[0],
      turi: o.type,
      scope: o.scope,
      qayerdan: o.cargoFrom || '',
      qayerga: o.cargoTo || '',
      yukTuri: o.cargoType || '',
      ogirlik: o.cargoWeight || '',
      mashinaTuri: o.vehicleType || '',
      narx: o.price || '',
      telefon: o.phone || '',
      guruh: o.groupTitle,
      yuboruvchi: o.senderName || '',
      status: o.status,
      masofa: o.distance || '',
      yopilganNarx: o.closedAmount || '',
    }));
  }

  /**
   * Haydovchilar eksporti
   */
  async exportDrivers(dateFrom?: string, dateTo?: string) {
    const where: any = {};
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const drivers = await this.prisma.driverProfile.findMany({
      where,
      include: { user: { select: { telegramId: true, username: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10000,
    });

    return drivers.map((d) => ({
      id: d.id,
      ism: d.fullName || '',
      telefon: d.phone || '',
      mashinaTuri: d.vehicleType || '',
      sigimi: d.vehicleCapacity || '',
      raqam: d.vehicleNumber || '',
      shahar: d.lastCity || '',
      tasdiqlangan: d.isVerified ? 'Ha' : 'Yo\'q',
      onlayn: d.isOnline ? 'Ha' : 'Yo\'q',
      balans: d.balance,
      telegramId: d.user?.telegramId || '',
      username: d.user?.username || '',
      yaratilgan: d.createdAt.toISOString().split('T')[0],
    }));
  }

  /**
   * Takliflar eksporti
   */
  async exportOffers(dateFrom?: string, dateTo?: string) {
    const where: any = {};
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const offers = await this.prisma.driverOffer.findMany({
      where,
      include: { driver: { select: { firstName: true, username: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10000,
    });

    return offers.map((o) => ({
      id: o.id,
      qayerdan: o.fromCity,
      qayerga: o.toCity,
      mashinaTuri: o.vehicleType,
      sigimi: o.vehicleCapacity || '',
      telefon: o.phone,
      narx: o.price || '',
      status: o.status,
      haydovchi: o.driver?.firstName || '',
      yaratilgan: o.createdAt.toISOString().split('T')[0],
    }));
  }

  /**
   * To'lovlar eksporti
   */
  async exportPayments(dateFrom?: string, dateTo?: string) {
    const where: any = {};
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const payments = await this.prisma.payment.findMany({
      where,
      include: { user: { select: { firstName: true, telegramId: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10000,
    });

    return payments.map((p) => ({
      id: p.id,
      miqdor: p.amount,
      valyuta: p.currency,
      status: p.status,
      reja: p.planType || '',
      karta: p.cardNumber || '',
      foydalanuvchi: p.user?.firstName || '',
      telegramId: p.user?.telegramId || '',
      sana: p.createdAt.toISOString().split('T')[0],
    }));
  }
}
