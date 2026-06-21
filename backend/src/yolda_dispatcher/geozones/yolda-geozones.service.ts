import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { YoldaGateway } from '../yolda-dispatcher.gateway';

@Injectable()
export class YoldaGeoZonesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: YoldaGateway,
  ) {}

  async list() {
    return this.prisma.yoldaGeoZone.findMany({
      orderBy: { createdAt: 'desc' },
      include: { assignments: { include: { dispatcher: { select: { id: true, fullName: true, phone: true } } } } },
    });
  }

  async getForDispatcher(dispatcherId: string) {
    const dispatcher = await this.prisma.yoldaDispatcher.findUnique({ where: { id: dispatcherId } });
    if (!dispatcher) throw new NotFoundException();

    if (dispatcher.workMode === 'ANYWHERE') return [];

    const [assigned, global] = await Promise.all([
      this.prisma.yoldaGeoZoneAssignment.findMany({
        where: { dispatcherId, zone: { isActive: true } },
        include: { zone: true },
      }),
      this.prisma.yoldaGeoZone.findMany({
        where: { isActive: true, isGlobal: true },
      }),
    ]);
    const zones = [...assigned.map((a) => a.zone), ...global];
    // unique
    const seen = new Set<string>();
    return zones.filter((z) => (seen.has(z.id) ? false : (seen.add(z.id), true)));
  }

  async create(input: {
    name: string;
    type: 'POLYGON' | 'CIRCLE';
    coordinates: any;
    centerLat: number;
    centerLng: number;
    radiusMeters?: number;
    color?: string;
    isGlobal?: boolean;
    description?: string;
    createdById: string;
  }) {
    const zone = await this.prisma.yoldaGeoZone.create({ data: input });
    this.gateway.emitZoneUpdate(null, { type: 'CREATED', zone });
    return zone;
  }

  async update(id: string, input: any) {
    const zone = await this.prisma.yoldaGeoZone.update({ where: { id }, data: input });
    this.gateway.emitZoneUpdate(null, { type: 'UPDATED', zone });
    return zone;
  }

  async delete(id: string) {
    await this.prisma.yoldaGeoZone.update({ where: { id }, data: { isActive: false } });
    this.gateway.emitZoneUpdate(null, { type: 'DELETED', zoneId: id });
    return { ok: true };
  }

  async assignToDispatcher(zoneId: string, dispatcherId: string) {
    await this.prisma.yoldaGeoZoneAssignment.upsert({
      where: { dispatcherId_zoneId: { dispatcherId, zoneId } },
      create: { dispatcherId, zoneId },
      update: {},
    });
    return { ok: true };
  }

  async unassignFromDispatcher(zoneId: string, dispatcherId: string) {
    await this.prisma.yoldaGeoZoneAssignment.deleteMany({
      where: { dispatcherId, zoneId },
    });
    return { ok: true };
  }
}
