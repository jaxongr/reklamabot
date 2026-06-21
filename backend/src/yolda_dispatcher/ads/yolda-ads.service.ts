import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

/**
 * Yolda Dispatcher uchun e'lon feed.
 *
 * FAQAT filtrlangan Order'lar ko'rsatiladi:
 *   - Message-filter'dan o'tgan (BlockedUser emas)
 *   - 24 soat ichida
 *   - Status = NEW yoki VIEWED (yopilmagan)
 *   - Phone mavjud
 *
 * Qo'shimcha: Yo'lda (haydovchi) app'da qabul qilingan e'lonlar ham.
 * Bu `DriverOffer`'da `ACCEPTED` status bo'lsa — shu yo'lda haydovchi mavjud degani.
 */
@Injectable()
export class YoldaAdsService {
  constructor(private readonly prisma: PrismaService) {}

  async feed(params: {
    dispatcherId: string;
    cursor?: string;
    limit?: number;
    vehicleType?: string;
    scope?: 'INTERNAL' | 'IMPORT' | 'EXPORT';
  }) {
    const limit = Math.min(params.limit || 30, 100);
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Allaqachon qabul qilingan order'larni chiqarib tashlash
    let excludeIds: string[] = [];
    try {
      const accepted: Array<{ orderId: string }> = await this.prisma.$queryRaw`
        SELECT "orderId" FROM "YoldaAcceptedOrder" WHERE "dispatcherId" = ${params.dispatcherId}
      `;
      excludeIds = accepted.map((a) => a.orderId);
    } catch {}

    const where: any = {
      createdAt: { gte: since },
      phone: { not: null },
      status: { in: ['NEW', 'VIEWED'] },
      ...(excludeIds.length ? { id: { notIn: excludeIds } } : {}),
    };
    if (params.vehicleType) where.vehicleType = params.vehicleType;
    if (params.scope) where.scope = params.scope;

    if (params.cursor) {
      where.createdAt = { gte: since, lt: new Date(params.cursor) };
    }

    const orders = await this.prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true, type: true, cargoFrom: true, cargoTo: true,
        vehicleType: true, vehicleCapacity: true, phone: true, price: true,
        messageText: true, senderName: true, senderTodayAds: true, senderTotalAds: true,
        groupTitle: true, scope: true, createdAt: true, status: true,
      },
    });

    return {
      items: orders,
      nextCursor: orders.length === limit ? orders[orders.length - 1].createdAt.toISOString() : null,
    };
  }

  async accept(dispatcherId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Order topilmadi');

    const { v4: uuid } = await import('uuid').catch(async () => ({ v4: () => `acc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}` }));
    const id = typeof uuid === 'function' ? uuid() : `acc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    await this.prisma.$executeRaw`
      INSERT INTO "YoldaAcceptedOrder" (id, "dispatcherId", "orderId", status, "acceptedAt")
      VALUES (${id}, ${dispatcherId}, ${orderId}, 'ACCEPTED', NOW())
      ON CONFLICT ("dispatcherId", "orderId") DO NOTHING
    `;
    return { ok: true };
  }

  async acceptedList(dispatcherId: string) {
    const accepted: any[] = await this.prisma.$queryRaw`
      SELECT ao.id AS "accId", ao."acceptedAt", ao."calledAt", ao.status AS "accStatus",
             o.id, o."cargoFrom", o."cargoTo", o."vehicleType", o."vehicleCapacity",
             o.phone, o.price, o."messageText", o."senderName",
             o."senderTodayAds", o."senderTotalAds", o."groupTitle",
             o.scope, o."createdAt", o.status
      FROM "YoldaAcceptedOrder" ao
      JOIN "Order" o ON o.id = ao."orderId"
      WHERE ao."dispatcherId" = ${dispatcherId}
      ORDER BY ao."acceptedAt" DESC
      LIMIT 100
    `;
    return accepted;
  }

  async unaccept(dispatcherId: string, orderId: string) {
    await this.prisma.$executeRaw`
      DELETE FROM "YoldaAcceptedOrder"
      WHERE "dispatcherId" = ${dispatcherId} AND "orderId" = ${orderId}
    `;
    return { ok: true };
  }

  async markViewed(orderId: string) {
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'VIEWED' as any },
    }).catch(() => {});
  }
}
