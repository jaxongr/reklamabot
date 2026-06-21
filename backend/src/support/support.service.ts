import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { SupportTicketStatus } from '@prisma/client';

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Task 18: Tiket yaratish
   */
  async createTicket(userId: string, subject: string, message: string) {
    const ticket = await this.prisma.supportTicket.create({
      data: {
        userId,
        subject,
        messages: {
          create: { senderId: userId, message, isStaff: false },
        },
      },
      include: { messages: true },
    });

    this.logger.log(`Yangi tiket: #${ticket.id} — ${subject}`);
    return ticket;
  }

  /**
   * Foydalanuvchi tiketlari
   */
  async getUserTickets(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where: { userId },
        include: {
          _count: { select: { messages: true } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.supportTicket.count({ where: { userId } }),
    ]);

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Tiket tafsilotlari + xabarlar
   */
  async getTicketWithMessages(ticketId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: { select: { id: true, firstName: true, username: true, telegramId: true } },
        messages: {
          include: { sender: { select: { id: true, firstName: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) throw new NotFoundException('Tiket topilmadi');
    return ticket;
  }

  /**
   * Tiketga javob
   */
  async addMessage(ticketId: string, senderId: string, message: string, isStaff: boolean = false) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Tiket topilmadi');

    const msg = await this.prisma.supportMessage.create({
      data: { ticketId, senderId, message, isStaff },
      include: { sender: { select: { id: true, firstName: true, role: true } } },
    });

    // Statusni yangilash
    if (isStaff && ticket.status === 'OPEN') {
      await this.prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: SupportTicketStatus.IN_PROGRESS },
      });
    }

    return msg;
  }

  /**
   * Tiket statusini o'zgartirish
   */
  async updateTicketStatus(ticketId: string, status: SupportTicketStatus) {
    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status },
    });
  }

  /**
   * Admin: Barcha tiketlar
   */
  async getAllTickets(status?: SupportTicketStatus, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [data, total, stats] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, username: true } },
          _count: { select: { messages: true } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.supportTicket.count({ where }),
      this.prisma.supportTicket.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    const statusMap: Record<string, number> = {};
    for (const s of stats) statusMap[s.status] = s._count.id;

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      stats: statusMap,
    };
  }
}
