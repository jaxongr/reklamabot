import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma.service';
import { RedisService } from '../../common/redis.service';
import { YoldaConfigService } from '../config/yolda-config.service';

/**
 * Yo'lda dispatcher autentifikatsiyasi.
 *
 * Flow:
 *   1) Admin dashboard'da `YoldaDispatcher` yaratadi (User + telefon raqam)
 *   2) Admin `generateLoginCode(phone)` chaqiradi — SMS/Telegram'ga 6-xonali kod
 *   3) Dispatcher mobile app'da telefon + kod kiritadi → JWT oladi
 */
@Injectable()
export class YoldaAuthService {
  private readonly logger = new Logger('YoldaAuthService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly redis: RedisService,
    private readonly config: YoldaConfigService,
  ) {}

  private async sendCodeToAdmin(phone: string, code: string, dispatcherName?: string) {
    try {
      const token = await this.config.getBotToken();
      if (!token) return;

      // Admin chat IDs — config'dan yoki env'dan
      const adminChatIds = (process.env.YOLDA_ADMIN_CHAT_IDS || '5475915736')
        .split(',').map(s => s.trim()).filter(Boolean);

      const text =
        `🔑 YO'LDA Dispatcher — Login kod\n\n` +
        `📱 ${dispatcherName || 'Dispatcher'}\n` +
        `☎️ ${phone}\n` +
        `🔢 Kod: ${code}\n\n` +
        `⏱ Muddati: 10 daqiqa`;

      for (const chatId of adminChatIds) {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text }),
        }).catch(() => {});
      }
    } catch (e: any) {
      this.logger.warn(`sendCodeToAdmin xato: ${e.message}`);
    }
  }

  private codeKey(phone: string) {
    return `yolda:auth:code:${phone.replace(/[^+\d]/g, '')}`;
  }

  /**
   * 6-xonali kod yaratib, Redis'ga 10 daqiqa TTL bilan saqlaydi
   * (Haqiqiy jo'natishni adminga qoldiramiz — Telegram bot orqali yuborish kerak)
   */
  async generateLoginCode(phone: string): Promise<{ expiresInSec: number; sentToAdmin: boolean }> {
    const cleanPhone = phone.replace(/[^+\d]/g, '');
    const dispatcher = await this.prisma.yoldaDispatcher.findFirst({
      where: { phone: cleanPhone, isActive: true },
    });
    if (!dispatcher) {
      throw new BadRequestException('Bu raqamdagi dispatcher topilmadi yoki faol emas');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redis.set(this.codeKey(cleanPhone), code, 600); // 10 min

    this.logger.log(`Login code for ${cleanPhone}: ${code}`);

    // Avto-yuborish: admin Telegram'iga
    this.sendCodeToAdmin(cleanPhone, code, dispatcher.fullName || undefined).catch(() => {});

    return { expiresInSec: 600, sentToAdmin: true };
  }

  async verifyAndLogin(phone: string, code: string, deviceInfo?: any) {
    const cleanPhone = phone.replace(/[^+\d]/g, '');
    const savedCode = await this.redis.get<string>(this.codeKey(cleanPhone));
    if (!savedCode || savedCode !== code) {
      throw new UnauthorizedException('Kod noto\'g\'ri yoki muddati o\'tgan');
    }

    const dispatcher = await this.prisma.yoldaDispatcher.findFirst({
      where: { phone: cleanPhone, isActive: true },
    });
    if (!dispatcher) throw new UnauthorizedException('Dispatcher topilmadi');

    await this.redis.del(this.codeKey(cleanPhone));

    await this.prisma.yoldaDispatcher.update({
      where: { id: dispatcher.id },
      data: {
        lastSeenAt: new Date(),
        deviceInfo: deviceInfo || undefined,
      },
    });

    const token = this.jwt.sign(
      {
        sub: dispatcher.userId,
        yoldaDispatcherId: dispatcher.id,
        role: 'YOLDA_DISPATCHER',
      },
      { secret: process.env.JWT_SECRET || 'default-secret', expiresIn: '90d' },
    );

    return {
      token,
      dispatcher: {
        id: dispatcher.id,
        phone: dispatcher.phone,
        fullName: dispatcher.fullName,
        workMode: dispatcher.workMode,
      },
    };
  }

  async getProfile(dispatcherId: string) {
    const d = await this.prisma.yoldaDispatcher.findUnique({
      where: { id: dispatcherId },
      include: {
        zones: { include: { zone: true } },
      },
    });
    if (!d) throw new UnauthorizedException('Dispatcher topilmadi');
    return {
      id: d.id,
      phone: d.phone,
      fullName: d.fullName,
      workMode: d.workMode,
      lastLat: d.lastLat,
      lastLng: d.lastLng,
      zones: d.zones.map((a) => a.zone),
    };
  }

  async updateLocation(dispatcherId: string, lat: number, lng: number, zoneId?: string | null) {
    await this.prisma.yoldaDispatcher.update({
      where: { id: dispatcherId },
      data: {
        lastLat: lat,
        lastLng: lng,
        lastSeenAt: new Date(),
        currentZoneId: zoneId ?? null,
      },
    });
  }
}
