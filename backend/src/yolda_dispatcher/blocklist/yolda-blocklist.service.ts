import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class YoldaBlocklistService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.yoldaCallBlocklist.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async add(phone: string, reason: string | undefined, addedById: string) {
    const clean = phone.replace(/[^+\d]/g, '');
    return this.prisma.yoldaCallBlocklist.upsert({
      where: { phone: clean },
      create: { phone: clean, reason, addedById },
      update: { reason },
    });
  }

  async remove(phone: string) {
    await this.prisma.yoldaCallBlocklist.deleteMany({ where: { phone } });
    return { ok: true };
  }

  async check(phone: string) {
    const clean = phone.replace(/[^+\d]/g, '');
    const item = await this.prisma.yoldaCallBlocklist.findUnique({ where: { phone: clean } });
    return { blocked: !!item, reason: item?.reason || null };
  }

  async bulkCheck(phones: string[]) {
    const clean = phones.map((p) => p.replace(/[^+\d]/g, ''));
    const items = await this.prisma.yoldaCallBlocklist.findMany({
      where: { phone: { in: clean } },
    });
    return items.map((i) => i.phone);
  }
}
