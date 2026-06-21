import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { YoldaVoiceUploadService } from './yolda-voice-upload.service';
import { YoldaGateway } from '../yolda-dispatcher.gateway';

@Injectable()
export class YoldaCallsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly voice: YoldaVoiceUploadService,
    private readonly gateway: YoldaGateway,
  ) {}

  /**
   * Qo'ng'iroq boshlandi — log yaratish
   */
  async startCall(
    dispatcherId: string,
    input: {
      phone: string;
      direction: 'INBOUND' | 'OUTBOUND';
      lat?: number;
      lng?: number;
      zoneId?: string;
    },
  ) {
    // Blocklist tekshiruv
    const blocked = await this.prisma.yoldaCallBlocklist.findUnique({
      where: { phone: input.phone.replace(/[^+\d]/g, '') },
    });

    const call = await this.prisma.yoldaCallLog.create({
      data: {
        dispatcherId,
        phone: input.phone.replace(/[^+\d]/g, ''),
        direction: input.direction,
        lat: input.lat,
        lng: input.lng,
        zoneId: input.zoneId,
      },
    });

    // Kiruvchi qo'ng'iroq bo'lsa — dispatcherga popup yuborish
    if (input.direction === 'INBOUND' && !blocked) {
      this.gateway.emitIncomingCallPopup(dispatcherId, {
        phone: call.phone,
        callId: call.id,
      });
    }

    return {
      callId: call.id,
      shouldRecord: !blocked,
      blocked: !!blocked,
    };
  }

  /**
   * Qo'ng'iroq tugadi
   */
  async endCall(
    callId: string,
    input: {
      durationSec?: number;
      endedAt?: Date;
    },
  ) {
    const call = await this.prisma.yoldaCallLog.findUnique({ where: { id: callId } });
    if (!call) throw new NotFoundException('Qo\'ng\'iroq topilmadi');

    return this.prisma.yoldaCallLog.update({
      where: { id: callId },
      data: {
        durationSec: input.durationSec,
        endedAt: input.endedAt || new Date(),
      },
    });
  }

  /**
   * Popup'da mashina turi tanlandi
   */
  async classify(
    callId: string,
    input: {
      vehicleType?: string;
      vehicleCapacity?: string;
      senderRole?: 'CARGO_OWNER' | 'DRIVER' | 'UNKNOWN' | 'SPAM';
      notes?: string;
    },
  ) {
    return this.prisma.yoldaCallLog.update({
      where: { id: callId },
      data: {
        vehicleType: input.vehicleType,
        vehicleCapacity: input.vehicleCapacity,
        senderRole: input.senderRole as any,
        notes: input.notes,
      },
    });
  }

  /**
   * Voice faylni Telegram guruhga yuborish (DB'da saqlanmaydi)
   */
  async uploadVoice(
    callId: string,
    buffer: Buffer,
    filename: string,
    mimeType: string,
  ) {
    const call = await this.prisma.yoldaCallLog.findUnique({
      where: { id: callId },
      include: { dispatcher: true },
    });
    if (!call) throw new NotFoundException('Qo\'ng\'iroq topilmadi');

    try {
      const caption =
        `📞 ${call.direction === 'INBOUND' ? 'Kiruvchi' : 'Chiquvchi'}\n` +
        `☎️ ${call.phone}\n` +
        `👤 ${call.dispatcher.fullName || call.dispatcher.phone}\n` +
        `⏱ ${call.durationSec ? call.durationSec + 's' : '?'}\n` +
        (call.vehicleType ? `🚛 ${call.vehicleType}\n` : '') +
        `🕐 ${call.startedAt.toLocaleString('uz-UZ')}`;

      const result = await this.voice.sendVoiceToGroup(buffer, filename, mimeType, caption);

      await this.prisma.yoldaCallLog.update({
        where: { id: callId },
        data: {
          telegramMsgId: result.messageId ? String(result.messageId) : null,
          telegramGroupId: result.chatId ? String(result.chatId) : null,
          voiceSent: true,
          voiceSentAt: new Date(),
        },
      });

      // Buffer GC'ga tushadi — diskka yozilmagan
      return { ok: true, messageId: result.messageId };
    } catch (e: any) {
      await this.prisma.yoldaCallLog.update({
        where: { id: callId },
        data: { voiceError: e.message?.substring(0, 500) || 'Unknown error' },
      });
      throw e;
    }
  }

  /**
   * Dispatcher tarixi
   */
  async history(
    dispatcherId: string,
    params: { limit?: number; direction?: 'INBOUND' | 'OUTBOUND'; phone?: string },
  ) {
    const limit = Math.min(params.limit || 50, 200);
    return this.prisma.yoldaCallLog.findMany({
      where: {
        dispatcherId,
        ...(params.direction ? { direction: params.direction } : {}),
        ...(params.phone ? { phone: { contains: params.phone } } : {}),
      },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Admin — barcha qo'ng'iroqlar
   */
  async adminList(params: {
    dispatcherId?: string;
    vehicleType?: string;
    senderRole?: string;
    phone?: string;
    from?: string;
    to?: string;
    limit?: number;
    skip?: number;
  }) {
    const where: any = {};
    if (params.dispatcherId) where.dispatcherId = params.dispatcherId;
    if (params.vehicleType) where.vehicleType = params.vehicleType;
    if (params.senderRole) where.senderRole = params.senderRole;
    if (params.phone) where.phone = { contains: params.phone };
    if (params.from || params.to) {
      where.startedAt = {};
      if (params.from) where.startedAt.gte = new Date(params.from);
      if (params.to) where.startedAt.lte = new Date(params.to);
    }

    const [items, total] = await Promise.all([
      this.prisma.yoldaCallLog.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        take: Math.min(params.limit || 50, 200),
        skip: params.skip || 0,
        include: {
          dispatcher: { select: { id: true, fullName: true, phone: true } },
        },
      }),
      this.prisma.yoldaCallLog.count({ where }),
    ]);
    return { items, total };
  }

  async stats(params: { dispatcherId?: string; days?: number }) {
    const days = params.days || 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const where: any = { startedAt: { gte: since } };
    if (params.dispatcherId) where.dispatcherId = params.dispatcherId;

    const [byType, byRole, byDirection, total] = await Promise.all([
      this.prisma.yoldaCallLog.groupBy({
        by: ['vehicleType'],
        where: { ...where, vehicleType: { not: null } },
        _count: true,
      }),
      this.prisma.yoldaCallLog.groupBy({
        by: ['senderRole'],
        where: { ...where, senderRole: { not: null } },
        _count: true,
      }),
      this.prisma.yoldaCallLog.groupBy({
        by: ['direction'],
        where,
        _count: true,
      }),
      this.prisma.yoldaCallLog.count({ where }),
    ]);

    return { byType, byRole, byDirection, total };
  }
}
