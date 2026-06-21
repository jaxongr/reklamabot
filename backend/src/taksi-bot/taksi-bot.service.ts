import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { SystemConfigService } from '../common/system-config.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const TelegramBot = require('node-telegram-bot-api');

const FLOW_KEY = 'taksi_bot_flow_active';
const GROUP_KEY = 'taksi_bot_group_id';

/**
 * Shaharlararo TAKSI boti — TAKSI buyurtmalarini bitta GURUHGA yuboradi.
 * Token: env TAKSI_BOT_TOKEN. Guruh: env TAKSI_BOT_GROUP_ID yoki SystemConfig `taksi_bot_group_id`.
 * Token/guruh berilmasa — bot o'chiq (inert) turadi. Keyin token+guruh berilganda ishlaydi.
 */
@Injectable()
export class TaksiBotService implements OnModuleInit {
  private readonly logger = new Logger('TaksiBot');
  private bot: any = null;
  private botUsername = '';

  constructor(
    private readonly prisma: PrismaService,
    private readonly systemConfig: SystemConfigService,
  ) {}

  onModuleInit() {
    const token = process.env.TAKSI_BOT_TOKEN;
    if (!token) {
      this.logger.warn("TAKSI_BOT_TOKEN o'rnatilmagan — taksi bot o'chiq (token berilgach ishlaydi)");
      return;
    }
    try {
      this.bot = new TelegramBot(token, { polling: true });
      this.bot.on('polling_error', () => {});
      this.bot
        .getMe()
        .then((me: any) => {
          this.botUsername = me.username;
          this.logger.log(`Taksi bot @${me.username} ishga tushdi`);
        })
        .catch(() => {});
    } catch (e: any) {
      this.logger.error(`Taksi bot ishga tushmadi: ${e.message}`);
    }
  }

  // Guruh ID — env yoki SystemConfig
  private async getGroupId(): Promise<string | null> {
    const fromEnv = process.env.TAKSI_BOT_GROUP_ID;
    if (fromEnv) return fromEnv.trim();
    const fromDb = await this.systemConfig.get(GROUP_KEY);
    return fromDb ? fromDb.trim() : null;
  }

  async isFlowActive(): Promise<boolean> {
    const v = await this.systemConfig.get(FLOW_KEY);
    return v === null ? true : v === 'true';
  }

  /**
   * Yangi TAKSI order yaratilganda chaqiriladi (monitor.service'dan).
   */
  async broadcastOrder(order: any): Promise<void> {
    if (!this.bot || !order) return;
    if (order.businessModule !== 'TAKSI') return;
    if (!(await this.isFlowActive())) return;
    const groupId = await this.getGroupId();
    if (!groupId) return;

    const text = this.formatOrder(order);
    const link = this.sourceLink(order);
    const reply_markup = link
      ? { inline_keyboard: [[{ text: '📍 Manba', url: link }]] }
      : undefined;
    try {
      await this.bot.sendMessage(groupId, text, { parse_mode: 'HTML', reply_markup });
    } catch (e: any) {
      const em = String(e?.message || '');
      if (em.toLowerCase().includes('parse')) {
        try {
          await this.bot.sendMessage(groupId, this.stripHtml(text), { reply_markup });
        } catch {
          /* ignore */
        }
      }
    }
  }

  private formatOrder(o: any): string {
    const isDriver = o?.type === 'DRIVER';
    const route = [o?.cargoFrom, o?.cargoTo].filter(Boolean).join(' → ') || "Yo'nalish ko'rsatilmagan";
    let t = isDriver ? `🚗 <b>HAYDOVCHI</b>\n\n` : `🧍 <b>YO'LOVCHI</b>\n\n`;
    t += `📍 <b>${this.esc(route)}</b>\n`;
    if (o?.vehicleType) t += `🚙 Mashina: ${this.esc(o.vehicleType)}\n`;
    if (o?.price) t += `💰 Narx: ${this.esc(o.price)}\n`;
    if (o?.distance) t += `🛣 Masofa: ${o.distance} km\n`;
    const uname = (o?.senderUsername || '').toString().trim().replace(/^@/, '');
    if (uname) t += `👤 Yuboruvchi: @${this.esc(uname)}\n`;
    const phone = (o?.phone || o?.senderPhone || '').toString().trim();
    if (phone) t += `📞 <b>${phone}</b>\n`;
    const full = (o?.messageText || '').toString().trim();
    if (full) {
      const clipped = full.length > 3000 ? full.slice(0, 3000) + '…' : full;
      t += `\n📝 ${this.esc(clipped)}`;
    }
    return t;
  }

  private sourceLink(o: any): string | null {
    const mid = o?.messageId;
    if (!mid) return null;
    const uname = (o?.groupUsername || '').toString().trim().replace(/^@/, '');
    if (uname && /^[A-Za-z0-9_]+$/.test(uname)) return `https://t.me/${uname}/${mid}`;
    const gid = (o?.groupTelegramId || '').toString();
    if (!gid) return null;
    const short = gid.startsWith('-100') ? gid.slice(4) : gid.replace(/^-/, '');
    if (!/^\d+$/.test(short)) return null;
    return `https://t.me/c/${short}/${mid}`;
  }

  private esc(s: string): string {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  private stripHtml(s: string): string {
    return String(s).replace(/<[^>]*>/g, '');
  }

  // ── Dashboard API ──
  async setGroup(groupId: string) {
    await this.systemConfig.set(GROUP_KEY, String(groupId).trim());
    return { groupId };
  }

  async setFlowActive(active: boolean) {
    await this.systemConfig.set(FLOW_KEY, active ? 'true' : 'false');
    return { active };
  }

  async getInfo() {
    return {
      username: this.botUsername || null,
      running: !!this.bot,
      tokenSet: !!process.env.TAKSI_BOT_TOKEN,
      groupId: await this.getGroupId(),
      flowActive: await this.isFlowActive(),
    };
  }
}
