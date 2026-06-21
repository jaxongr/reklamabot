import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { YoldaGateway } from '../yolda-dispatcher.gateway';

@Injectable()
export class YoldaRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: YoldaGateway,
  ) {}

  async create(
    dispatcherId: string,
    input: { orderId?: string; requestedPhone?: string; orderSnapshot?: any },
  ) {
    return this.prisma.yoldaDriverRequest.create({
      data: {
        dispatcherId,
        orderId: input.orderId,
        orderSnapshot: input.orderSnapshot,
        requestedPhone: input.requestedPhone,
      },
    });
  }

  async myRequests(dispatcherId: string) {
    return this.prisma.yoldaDriverRequest.findMany({
      where: { dispatcherId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async adminList(status?: string) {
    return this.prisma.yoldaDriverRequest.findMany({
      where: status ? { status: status as any } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        dispatcher: { select: { id: true, fullName: true, phone: true } },
      },
      take: 200,
    });
  }

  async resolve(
    id: string,
    input: { status: 'APPROVED' | 'REJECTED'; adminNote?: string; resolvedById: string },
  ) {
    const r = await this.prisma.yoldaDriverRequest.update({
      where: { id },
      data: {
        status: input.status,
        adminNote: input.adminNote,
        resolvedById: input.resolvedById,
        resolvedAt: new Date(),
      },
    });
    this.gateway.emitDriverRequestResolved(r.dispatcherId, r);
    return r;
  }
}
