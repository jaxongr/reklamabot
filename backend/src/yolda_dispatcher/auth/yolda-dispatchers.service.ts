import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

/**
 * Admin dashboard uchun — Yolda Dispatcher akkauntlarini boshqarish
 */
@Injectable()
export class YoldaDispatchersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filter: { isActive?: boolean; search?: string } = {}) {
    const where: any = {};
    if (filter.isActive !== undefined) where.isActive = filter.isActive;
    if (filter.search) {
      where.OR = [
        { phone: { contains: filter.search } },
        { fullName: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    const items = await this.prisma.yoldaDispatcher.findMany({
      where,
      include: {
        zones: { include: { zone: true } },
        _count: { select: { calls: true, driverRequests: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    // User ma'lumotlarini alohida olib, qo'shamiz (User model'ga relation qo'shmaslik uchun)
    const userIds = items.map((i) => i.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, telegramId: true, username: true, firstName: true, lastName: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));
    return items.map((i) => ({ ...i, user: userMap.get(i.userId) || null }));
  }

  async create(input: {
    userId?: string;
    phone: string;
    fullName?: string;
    workMode?: 'GEOFENCED' | 'ANYWHERE';
    zoneIds?: string[];
  }) {
    const cleanPhone = input.phone.replace(/[^+\d]/g, '');

    // Agar userId yo'q bo'lsa — yangi User yaratib olish (telegramId majburiy bo'lgani uchun phone'ni ishlatamiz)
    let userId = input.userId;
    if (!userId) {
      const existing = await this.prisma.user.findFirst({
        where: { phoneNumber: cleanPhone },
      });
      if (existing) {
        userId = existing.id;
      } else {
        const u = await this.prisma.user.create({
          data: {
            telegramId: `yolda_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
            phoneNumber: cleanPhone,
            firstName: input.fullName || 'Yolda Dispatcher',
            role: 'DISPATCHER' as any,
            isActive: true,
            isRegistered: true,
          },
        });
        userId = u.id;
      }
    }

    const existingDispatcher = await this.prisma.yoldaDispatcher.findUnique({
      where: { userId },
    });
    if (existingDispatcher) {
      throw new BadRequestException('Bu foydalanuvchi allaqachon Yolda Dispatcher');
    }

    const dispatcher = await this.prisma.yoldaDispatcher.create({
      data: {
        userId,
        phone: cleanPhone,
        fullName: input.fullName,
        workMode: input.workMode || 'GEOFENCED',
        isActive: true,
      },
    });

    if (input.zoneIds?.length) {
      await this.prisma.yoldaGeoZoneAssignment.createMany({
        data: input.zoneIds.map((zoneId) => ({ dispatcherId: dispatcher.id, zoneId })),
        skipDuplicates: true,
      });
    }

    return dispatcher;
  }

  async update(
    id: string,
    input: {
      fullName?: string;
      workMode?: 'GEOFENCED' | 'ANYWHERE';
      isActive?: boolean;
      zoneIds?: string[];
    },
  ) {
    const d = await this.prisma.yoldaDispatcher.findUnique({ where: { id } });
    if (!d) throw new NotFoundException('Dispatcher topilmadi');

    await this.prisma.yoldaDispatcher.update({
      where: { id },
      data: {
        fullName: input.fullName,
        workMode: input.workMode,
        isActive: input.isActive,
      },
    });

    if (input.zoneIds) {
      await this.prisma.yoldaGeoZoneAssignment.deleteMany({ where: { dispatcherId: id } });
      if (input.zoneIds.length) {
        await this.prisma.yoldaGeoZoneAssignment.createMany({
          data: input.zoneIds.map((zoneId) => ({ dispatcherId: id, zoneId })),
          skipDuplicates: true,
        });
      }
    }

    return this.prisma.yoldaDispatcher.findUnique({
      where: { id },
      include: { zones: { include: { zone: true } } },
    });
  }

  async delete(id: string) {
    await this.prisma.yoldaDispatcher.update({
      where: { id },
      data: { isActive: false },
    });
    return { ok: true };
  }
}
