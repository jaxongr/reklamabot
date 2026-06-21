import { Injectable, Logger, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ChatRoomType } from '@prisma/client';
import { AppGateway } from '../gateway/app.gateway';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => AppGateway))
    private readonly gateway: AppGateway,
  ) {}

  /**
   * Task 17: Chat xonasi yaratish
   */
  async createRoom(name: string, type: ChatRoomType, participantIds: string[]) {
    const room = await this.prisma.chatRoom.create({
      data: {
        name,
        type,
        participants: {
          create: participantIds.map((userId, i) => ({
            userId,
            isAdmin: i === 0, // Birinchi ishtirokchi admin
          })),
        },
      },
      include: { participants: { include: { user: { select: { id: true, firstName: true, username: true } } } } },
    });

    return room;
  }

  /**
   * Foydalanuvchi xonalari
   */
  async getUserRooms(userId: string) {
    const rooms = await this.prisma.chatRoom.findMany({
      where: {
        isActive: true,
        participants: { some: { userId } },
      },
      include: {
        participants: {
          include: { user: { select: { id: true, firstName: true, username: true } } },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { message: true, createdAt: true, sender: { select: { firstName: true } } },
        },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return rooms;
  }

  /**
   * Xona xabarlari
   */
  async getRoomMessages(roomId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: { chatRoomId: roomId, isDeleted: false },
        include: { sender: { select: { id: true, firstName: true, username: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.chatMessage.count({ where: { chatRoomId: roomId, isDeleted: false } }),
    ]);

    return {
      data: messages.reverse(),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Xabar yuborish
   */
  async sendMessage(roomId: string, senderId: string, message: string) {
    const room = await this.prisma.chatRoom.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Chat xonasi topilmadi');

    const msg = await this.prisma.chatMessage.create({
      data: { chatRoomId: roomId, senderId, message },
      include: { sender: { select: { id: true, firstName: true, username: true, role: true } } },
    });

    // Xona updatedAt yangilash
    await this.prisma.chatRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() },
    });

    // WS broadcast + FCM push (REST orqali yuborilganda ham real-time bo'lsin)
    try {
      this.gateway.emitChatMessage(roomId, msg);

      const participants = await this.getRoomParticipants(roomId);
      const senderName =
        (msg as any)?.sender?.firstName ||
        (msg as any)?.sender?.username ||
        'Foydalanuvchi';
      for (const participant of participants) {
        if (participant.userId !== senderId) {
          this.gateway.sendChatFcmPush(
            participant.userId,
            senderName,
            message,
            roomId,
            senderId,
          );
        }
      }
    } catch (e) {
      this.logger.error(`Chat broadcast/FCM xatosi: ${e.message}`);
    }

    return msg;
  }

  /**
   * Support xonasi yaratish (yoki mavjudini qaytarish)
   */
  async getOrCreateSupportRoom(userId: string, type: ChatRoomType) {
    // Mavjud xonani qidirish
    const existing = await this.prisma.chatRoom.findFirst({
      where: {
        type,
        isActive: true,
        participants: { some: { userId } },
      },
      include: {
        participants: {
          include: { user: { select: { id: true, firstName: true, username: true } } },
        },
      },
    });

    if (existing) return existing;

    // Yangi xona yaratish
    return this.createRoom(`Support: ${userId}`, type, [userId]);
  }

  /**
   * Chat room ishtirokchilari (FCM uchun)
   */
  async getRoomParticipants(roomId: string) {
    return this.prisma.chatParticipant.findMany({
      where: { chatRoomId: roomId },
      select: { userId: true },
    });
  }

  /**
   * Admin: Barcha chat xonalari
   */
  async getAllRooms(type?: ChatRoomType, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const where: any = { isActive: true };
    if (type) where.type = type;

    const [data, total] = await Promise.all([
      this.prisma.chatRoom.findMany({
        where,
        include: {
          participants: {
            include: { user: { select: { id: true, firstName: true, username: true } } },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          _count: { select: { messages: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.chatRoom.count({ where }),
    ]);

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
