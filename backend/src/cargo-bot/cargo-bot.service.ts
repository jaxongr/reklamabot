import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { SystemConfigService } from '../common/system-config.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const TelegramBot = require('node-telegram-bot-api');

const FLOW_KEY = 'cargo_bot_flow_active';

// Reply-klaviatura tugmalari (chat pastida doimiy turadi)
const BTN_ACCEPT = '✅ Qabul qilish';
const BTN_STOP = "⏸ Yuklarni to'xtatish";
const BTN_START = '▶️ Yuklarni boshlash';
const BTN_ACCEPTED = '📋 Olingan yuklar';

interface SentRef {
  chatId: string;
  messageId: number;
}

/**
 * Yuk tarqatuvchi bot (@Yukchibor_bot).
 * - Faqat ruxsatli (isAllowed) + /start qilgan userlarga yangi CARGO yuklarni yuboradi.
 * - Barcha boshqaruv pastki (reply) klaviaturada: Qabul qilish / To'xtatish / Boshlash / Olingan yuklar.
 * - "Qabul qilish" — birinchi bosgan oladi (eksklyuziv).
 * - "Olingan yuklar" — qabul qilingan yuklar alohida-alohida xabar bo'lib chiqadi.
 */
@Injectable()
export class CargoBotService implements OnModuleInit {
  private readonly logger = new Logger('CargoBot');
  private bot: any = null;
  private botUsername = '';
  // orderId -> yuborilgan xabarlar (boshqa userlarda tugmani o'chirish uchun)
  private readonly sentMessages = new Map<string, SentRef[]>();
  // telegramId -> oxirgi taklif qilingan orderId (reply-tugma "Qabul qilish" uchun)
  private readonly lastOffered = new Map<string, string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly systemConfig: SystemConfigService,
  ) {}

  onModuleInit() {
    const token = process.env.CARGO_BOT_TOKEN;
    if (!token) {
      this.logger.warn("CARGO_BOT_TOKEN o'rnatilmagan — yuk bot o'chirilgan");
      return;
    }
    try {
      this.bot = new TelegramBot(token, { polling: true });
      this.setupHandlers();
      this.bot
        .getMe()
        .then((me: any) => {
          this.botUsername = me.username;
          this.logger.log(`Yuk bot @${me.username} ishga tushdi`);
        })
        .catch(() => {});
    } catch (e: any) {
      this.logger.error(`Yuk bot ishga tushmadi: ${e.message}`);
    }

    // Muddati tugagan ruxsatlarni avtomatik o'chirish (har 5 daqiqada)
    setInterval(() => {
      this.prisma.cargoBotUser
        .updateMany({
          where: { isAllowed: true, NOT: { expiresAt: null }, expiresAt: { lt: new Date() } },
          data: { isAllowed: false },
        })
        .then((r) => {
          if (r.count > 0) this.logger.log(`${r.count} ta ruxsat muddati tugadi — o'chirildi`);
        })
        .catch(() => {});
    }, 5 * 60 * 1000);
  }

  // ─────────────────────────── Handlers ───────────────────────────
  private setupHandlers() {
    this.bot.onText(/\/start/, (msg: any) => {
      this.handleStart(msg).catch(() => {});
    });

    // Reply-klaviatura tugmalari (matn xabarlari)
    this.bot.on('message', (msg: any) => {
      const text: string = (msg.text || '').trim();
      if (!text || text.startsWith('/start')) return;
      const tgId = String(msg.from.id);
      const chatId = String(msg.chat.id);

      if (text === BTN_ACCEPT) {
        this.acceptLastOffered(chatId, tgId).catch(() => {});
      } else if (text === BTN_STOP) {
        this.handleFlowToggle(chatId, tgId, false).catch(() => {});
      } else if (text === BTN_START) {
        this.handleFlowToggle(chatId, tgId, true).catch(() => {});
      } else if (text === BTN_ACCEPTED || /\/mening/.test(text)) {
        this.sendMyAccepted(chatId, tgId).catch(() => {});
      }
    });

    this.bot.on('callback_query', (q: any) => {
      this.handleCallback(q).catch(() => {});
    });
    this.bot.on('polling_error', () => {});
  }

  private replyKeyboard() {
    return {
      reply_markup: {
        keyboard: [[{ text: BTN_ACCEPT }], [{ text: BTN_STOP }, { text: BTN_START }], [{ text: BTN_ACCEPTED }]],
        resize_keyboard: true,
      },
    };
  }

  private async handleStart(msg: any) {
    const tgId = String(msg.from.id);
    const chatId = String(msg.chat.id);
    const name =
      [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ') ||
      msg.from.username ||
      null;

    const existing = await this.prisma.cargoBotUser.findUnique({ where: { telegramId: tgId } });
    if (existing) {
      await this.prisma.cargoBotUser.update({
        where: { telegramId: tgId },
        data: { chatId, hasStarted: true, name: existing.name || name },
      });
      if (existing.isAllowed) {
        await this.bot.sendMessage(
          chatId,
          `✅ <b>Xush kelibsiz!</b>\n\nYangi yuklar shu yerga real vaqtda kelib turadi.\n\nPastdagi tugmalar:\n${BTN_ACCEPT} — oxirgi kelgan yukni olish\n${BTN_STOP} / ${BTN_START} — yuklar oqimini boshqarish\n${BTN_ACCEPTED} — siz olgan yuklar`,
          { parse_mode: 'HTML', ...this.replyKeyboard() },
        );
      } else {
        await this.sendNoAccess(chatId, tgId);
      }
      return;
    }

    await this.prisma.cargoBotUser.create({
      data: { telegramId: tgId, chatId, name, isAllowed: false, hasStarted: true },
    });
    await this.sendNoAccess(chatId, tgId);
  }

  private async sendNoAccess(chatId: string, tgId: string) {
    await this.bot.sendMessage(
      chatId,
      `⛔ Sizda hali ruxsat yo'q.\n\n🆔 Sizning ID: <code>${tgId}</code>\n\nBu ID ni administratorga yuboring — u sizga ruxsat bergach, yuklar kela boshlaydi.`,
      { parse_mode: 'HTML' },
    );
  }

  private async isAllowed(tgId: string): Promise<boolean> {
    const u = await this.prisma.cargoBotUser.findUnique({ where: { telegramId: tgId } });
    if (!u || !u.isAllowed) return false;
    // Muddat tugagan bo'lsa — avtomatik to'xtaydi
    if (u.expiresAt && u.expiresAt.getTime() <= Date.now()) return false;
    return true;
  }

  // ── Oqimni boshqarish (reply tugma orqali) ──
  private async handleFlowToggle(chatId: string, tgId: string, active: boolean) {
    if (!(await this.isAllowed(tgId))) {
      await this.bot.sendMessage(chatId, "⛔ Sizda ruxsat yo'q").catch(() => {});
      return;
    }
    await this.setFlowActive(active);
    await this.bot
      .sendMessage(
        chatId,
        active ? '▶️ Yuklar oqimi YONIQ — yangi yuklar kela boshlaydi.' : "⏸ Yuklar oqimi TO'XTATILDI.",
        this.replyKeyboard(),
      )
      .catch(() => {});
  }

  // ── Callback (inline tugma) orqali qabul ──
  private async handleCallback(q: any) {
    const data: string = q.data || '';
    const tgId = String(q.from.id);
    const chatId = String(q.message?.chat?.id ?? '');
    const messageId = q.message?.message_id;

    if (data.startsWith('acc:')) {
      const orderId = data.slice(4);
      const r = await this.claimOrder(orderId, tgId);
      if (r.status === 'noaccess') {
        await this.bot.answerCallbackQuery(q.id, { text: "⛔ Sizda ruxsat yo'q", show_alert: true }).catch(() => {});
        return;
      }
      if (r.status === 'ok') {
        await this.bot.answerCallbackQuery(q.id, { text: '✅ Qabul qildingiz!' }).catch(() => {});
        await this.afterClaim(r.order, chatId);
      } else {
        await this.bot
          .answerCallbackQuery(q.id, {
            text: r.status === 'mine' ? '✅ Siz allaqachon qabul qilgansiz' : '⛔ Bu yukni boshqa haydovchi oldi',
            show_alert: true,
          })
          .catch(() => {});
        await this.markTaken(orderId);
      }
    } else if (data.startsWith('blk:')) {
      await this.handleBlock(data.slice(4), tgId, q, chatId, messageId);
    } else if (data === 'taken' || data === 'blocked') {
      await this.bot.answerCallbackQuery(q.id, { text: 'Bu yuk allaqachon yopilgan' }).catch(() => {});
    }
  }

  // ── "Dispecher" — senderni bloklash (bu senderdan qaytib e'lon kelmaydi) ──
  private async handleBlock(orderId: string, tgId: string, q: any, chatId: string, messageId: number) {
    if (!(await this.isAllowed(tgId))) {
      await this.bot.answerCallbackQuery(q.id, { text: "⛔ Sizda ruxsat yo'q", show_alert: true }).catch(() => {});
      return;
    }
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      await this.bot.answerCallbackQuery(q.id, { text: 'Yuk topilmadi' }).catch(() => {});
      return;
    }
    const sid = (order.senderTelegramId || '').toString();
    const phone = this.orderPhone(order);
    if (!sid && !phone) {
      await this.bot
        .answerCallbackQuery(q.id, { text: 'Yuboruvchi aniqlanmadi — bloklab bo\'lmadi', show_alert: true })
        .catch(() => {});
      return;
    }

    try {
      const exists = sid
        ? await this.prisma.blockedUser.findFirst({ where: { senderTelegramId: sid, isActive: true } })
        : await this.prisma.blockedUser.findFirst({ where: { phone, isActive: true } });
      if (!exists) {
        await this.prisma.blockedUser.create({
          data: {
            userId: order.userId,
            senderTelegramId: sid,
            senderName: order.senderName || null,
            senderUsername: order.senderUsername || null,
            reason: 'MANUAL_BLOCK',
            ruleNumber: 0,
            messageText: order.messageText || '',
            groupTitle: order.groupTitle || '',
            groupTelegramId: order.groupTelegramId || '',
            phone: phone || null,
            monitorSessionId: order.monitorSessionId || null,
          },
        });
      }
    } catch {
      /* ignore */
    }

    await this.bot
      .answerCallbackQuery(q.id, {
        text: "🚫 Dispecher bloklandi — bu yuboruvchidan boshqa e'lon kelmaydi",
        show_alert: true,
      })
      .catch(() => {});
    try {
      await this.bot.editMessageReplyMarkup(
        { inline_keyboard: [[{ text: '🚫 Dispecher bloklandi', callback_data: 'blocked' }]] },
        { chat_id: chatId, message_id: messageId },
      );
    } catch {
      /* ignore */
    }
  }

  // Manba havolasi (original e'lon) — t.me/c/<short>/<messageId>
  private sourceLink(o: any): string | null {
    const mid = o?.messageId;
    if (!mid) return null;
    // Public guruh (username bor) — havola HAMMA uchun ochiladi
    const uname = (o?.groupUsername || '').toString().trim().replace(/^@/, '');
    if (uname && /^[A-Za-z0-9_]+$/.test(uname)) return `https://t.me/${uname}/${mid}`;
    // Aks holda — t.me/c/ (faqat guruh a'zolari uchun)
    const gid = (o?.groupTelegramId || '').toString();
    if (!gid) return null;
    const short = gid.startsWith('-100') ? gid.slice(4) : gid.replace(/^-/, '');
    if (!/^\d+$/.test(short)) return null;
    return `https://t.me/c/${short}/${mid}`;
  }

  // ── Reply-tugma "Qabul qilish" — oxirgi taklif qilingan yukni oladi ──
  private async acceptLastOffered(chatId: string, tgId: string) {
    const orderId = this.lastOffered.get(tgId);
    if (!orderId) {
      await this.bot.sendMessage(chatId, '🤷 Hozircha yangi yuk yo\'q.', this.replyKeyboard()).catch(() => {});
      return;
    }
    const r = await this.claimOrder(orderId, tgId);
    if (r.status === 'noaccess') {
      await this.bot.sendMessage(chatId, "⛔ Sizda ruxsat yo'q").catch(() => {});
      return;
    }
    if (r.status === 'ok') {
      const phone = this.orderPhone(r.order);
      await this.bot
        .sendMessage(chatId, `✅ <b>Yuk qabul qilindi!</b>${phone ? `\n📞 Mijoz: ${phone}` : ''}`, {
          parse_mode: 'HTML',
          ...this.replyKeyboard(),
        })
        .catch(() => {});
      await this.afterClaim(r.order, chatId);
    } else {
      await this.bot
        .sendMessage(
          chatId,
          r.status === 'mine' ? '✅ Siz buni allaqachon qabul qilgansiz' : '⛔ Bu yukni boshqa haydovchi oldi',
          this.replyKeyboard(),
        )
        .catch(() => {});
    }
  }

  // ── Eksklyuziv claim ──
  private async claimOrder(
    orderId: string,
    tgId: string,
  ): Promise<{ status: 'ok' | 'taken' | 'mine' | 'noaccess' | 'notfound'; order?: any }> {
    if (!(await this.isAllowed(tgId))) return { status: 'noaccess' };
    const res = await this.prisma.order.updateMany({
      where: { id: orderId, acceptedById: null },
      data: { acceptedById: tgId, acceptedAt: new Date(), acceptedStatus: 'ACCEPTED', status: 'CONTACTED' },
    });
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return { status: 'notfound' };
    if (res.count === 0) return { status: order.acceptedById === tgId ? 'mine' : 'taken', order };
    return { status: 'ok', order };
  }

  // Qabuldan keyin: qabul qilgan userning xabarini yangilash + boshqalarникini "olingan" qilish
  private async afterClaim(order: any, chatId: string) {
    const phone = this.orderPhone(order);
    const acceptedText =
      this.formatOrder(order) + `\n\n✅ <b>SIZ QABUL QILDINGIZ</b>` + (phone ? `\n📞 Mijoz: ${phone}` : '');
    const refs = this.sentMessages.get(order.id) || [];
    const mine = refs.find((r) => r.chatId === chatId);
    if (mine) {
      try {
        await this.bot.editMessageText(acceptedText, {
          chat_id: chatId,
          message_id: mine.messageId,
          parse_mode: 'HTML',
        });
      } catch {
        /* ignore */
      }
    }
    await this.markTaken(order.id, chatId, mine?.messageId);
  }

  private async markTaken(orderId: string, exceptChatId?: string, exceptMsgId?: number) {
    const arr = this.sentMessages.get(orderId) || [];
    for (const m of arr) {
      if (exceptChatId && m.chatId === exceptChatId && m.messageId === exceptMsgId) continue;
      try {
        await this.bot.editMessageReplyMarkup(
          { inline_keyboard: [[{ text: '❌ Boshqa haydovchi oldi', callback_data: 'taken' }]] },
          { chat_id: m.chatId, message_id: m.messageId },
        );
      } catch {
        /* eski xabar bo'lishi mumkin */
      }
    }
    this.sentMessages.delete(orderId);
  }

  // ── Olingan yuklar — alohida-alohida xabar bo'lib chiqadi ──
  private async sendMyAccepted(chatId: string, tgId: string) {
    const orders = await this.prisma.order.findMany({
      where: { acceptedById: tgId },
      orderBy: { acceptedAt: 'desc' },
      take: 30,
    });
    if (!orders.length) {
      await this.bot.sendMessage(chatId, '📋 Siz hali yuk qabul qilmagansiz.', this.replyKeyboard()).catch(() => {});
      return;
    }
    await this.bot
      .sendMessage(chatId, `📋 <b>Siz olgan yuklar: ${orders.length} ta</b>`, { parse_mode: 'HTML' })
      .catch(() => {});
    for (const o of orders) {
      let t = `✅ <b>OLINGAN YUK</b>\n\n` + this.formatOrderBody(o);
      if (o.acceptedAt) t += `\n\n🕒 Olingan: ${new Date(o.acceptedAt).toLocaleString('uz')}`;
      await this.bot.sendMessage(chatId, t, { parse_mode: 'HTML' }).catch(() => {});
    }
  }

  // ─────────────────────────── Broadcast ───────────────────────────
  async broadcastOrder(order: any): Promise<void> {
    if (!this.bot || !order) return;
    if (order.type && order.type !== 'CARGO') return;
    if (!(await this.isFlowActive())) return;

    const users = await this.prisma.cargoBotUser.findMany({
      where: {
        isAllowed: true,
        hasStarted: true,
        NOT: { chatId: null },
        // Muddati tugamaganlar (yoki muddatsizlar)
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
    if (!users.length) return;

    const text = this.formatOrder(order);
    const sent: SentRef[] = [];

    const link = this.sourceLink(order);
    for (const u of users) {
      const ref = await this.sendOrderMessage(String(u.chatId), text, order.id, link, u.telegramId);
      if (ref) {
        sent.push(ref);
        this.lastOffered.set(u.telegramId, order.id);
      }
    }
    if (sent.length) this.sentMessages.set(order.id, sent);
  }

  private async sendOrderMessage(
    chatId: string,
    text: string,
    orderId: string,
    link: string | null,
    telegramId: string,
  ): Promise<SentRef | null> {
    const row2: any[] = [];
    if (link) row2.push({ text: '📍 Manba', url: link });
    row2.push({ text: '🚫 Dispecher', callback_data: 'blk:' + orderId });
    const markup = {
      inline_keyboard: [[{ text: BTN_ACCEPT, callback_data: 'acc:' + orderId }], row2],
    };
    try {
      const m = await this.bot.sendMessage(chatId, text, { parse_mode: 'HTML', reply_markup: markup });
      return { chatId, messageId: m.message_id };
    } catch (e: any) {
      const em = String(e?.message || '');
      if (em.includes('403') || em.includes('blocked') || em.includes('chat not found')) {
        try {
          await this.prisma.cargoBotUser.update({ where: { telegramId }, data: { hasStarted: false } });
        } catch {
          /* ignore */
        }
        return null;
      }
      if (em.toLowerCase().includes('parse')) {
        try {
          const m = await this.bot.sendMessage(chatId, this.stripHtml(text), { reply_markup: markup });
          return { chatId, messageId: m.message_id };
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  private formatOrder(o: any): string {
    return `🚚 <b>YANGI YUK</b>\n\n` + this.formatOrderBody(o);
  }

  private formatOrderBody(o: any): string {
    const route = [o?.cargoFrom, o?.cargoTo].filter(Boolean).join(' → ') || "Yo'nalish ko'rsatilmagan";
    let t = `📍 <b>${this.esc(route)}</b>\n`;
    if (o?.cargoType) t += `📦 Yuk: ${this.esc(o.cargoType)}\n`;
    if (o?.cargoWeight) t += `⚖️ Vazn: ${this.esc(o.cargoWeight)}\n`;
    if (o?.vehicleType) t += `🚛 Mashina: ${this.esc(o.vehicleType)}\n`;
    if (o?.price) t += `💰 Narx: ${this.esc(o.price)}\n`;
    if (o?.distance) t += `🛣 Masofa: ${o.distance} km\n`;
    const uname = (o?.senderUsername || '').toString().trim().replace(/^@/, '');
    const sid = (o?.senderTelegramId || '').toString().trim();
    const sname = o?.senderName ? this.esc(o.senderName) : 'Yuboruvchi';
    if (uname) {
      // @username bor — bosilsa yuboruvchining lichkasi ochiladi
      t += `👤 Yuboruvchi: <a href="https://t.me/${this.esc(uname)}">@${this.esc(uname)}</a>\n`;
    } else if (sid) {
      // username yo'q — Telegram ID orqali lichkaga havola
      t += `👤 Yuboruvchi: <a href="tg://user?id=${this.esc(sid)}">${sname}</a>\n`;
    } else if (o?.senderName) {
      t += `👤 Yuboruvchi: ${this.esc(o.senderName)}\n`;
    }
    const phone = this.orderPhone(o);
    if (phone) t += `📞 <b>${phone}</b>\n`;
    if (o?.groupTitle) t += `🗂 Guruh: ${this.esc(o.groupTitle)}\n`;
    const full = (o?.messageText || '').toString().trim();
    if (full) {
      const clipped = full.length > 3000 ? full.slice(0, 3000) + '…' : full;
      t += `\n📝 <b>E'lon matni:</b>\n${this.esc(clipped)}`;
    }
    return t;
  }

  private senderUsername(o: any): string {
    const u = (o?.senderUsername || '').toString().trim();
    if (!u) return '';
    return u.startsWith('@') ? u : '@' + u;
  }

  private orderPhone(o: any): string {
    return (o?.phone || o?.senderPhone || '').toString().trim();
  }

  private esc(s: string): string {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  private stripHtml(s: string): string {
    return String(s).replace(/<[^>]*>/g, '');
  }

  // ─────────────────────────── Flow + Dashboard API ───────────────────────────
  async isFlowActive(): Promise<boolean> {
    const v = await this.systemConfig.get(FLOW_KEY);
    return v === null ? true : v === 'true';
  }

  async setFlowActive(active: boolean) {
    await this.systemConfig.set(FLOW_KEY, active ? 'true' : 'false');
    return { active };
  }

  async listUsers() {
    return this.prisma.cargoBotUser.findMany({ orderBy: { createdAt: 'desc' } });
  }

  private expiryFromDays(days?: number): Date | null {
    return days && days > 0 ? new Date(Date.now() + days * 86400000) : null;
  }

  async addUser(telegramId: string, name?: string, days?: number) {
    const tgId = String(telegramId).trim();
    const expiresAt = this.expiryFromDays(days);
    return this.prisma.cargoBotUser.upsert({
      where: { telegramId: tgId },
      update: { isAllowed: true, expiresAt, ...(name ? { name } : {}) },
      create: { telegramId: tgId, name: name || null, isAllowed: true, expiresAt },
    });
  }

  // Mavjud foydalanuvchining amal qilish muddatini tahrirlash (necha kun)
  async updateUserDuration(id: string, days?: number) {
    return this.prisma.cargoBotUser.update({
      where: { id },
      data: { isAllowed: true, expiresAt: this.expiryFromDays(days) },
    });
  }

  async removeUser(id: string) {
    await this.prisma.cargoBotUser.delete({ where: { id } });
    return { ok: true };
  }

  async getAccepted() {
    const orders = await this.prisma.order.findMany({
      where: { NOT: { acceptedById: null }, acceptedStatus: { not: null } },
      orderBy: { acceptedAt: 'desc' },
      take: 200,
    });
    const ids = [...new Set(orders.map((o) => o.acceptedById).filter(Boolean))] as string[];
    const users = ids.length
      ? await this.prisma.cargoBotUser.findMany({ where: { telegramId: { in: ids } } })
      : [];
    const nameMap = new Map(users.map((u) => [u.telegramId, u.name]));
    return orders.map((o) => ({
      id: o.id,
      cargoFrom: o.cargoFrom,
      cargoTo: o.cargoTo,
      cargoType: o.cargoType,
      cargoWeight: o.cargoWeight,
      price: o.price,
      phone: o.phone || o.senderPhone,
      senderUsername: o.senderUsername,
      acceptedById: o.acceptedById,
      acceptedByName: o.acceptedById ? nameMap.get(o.acceptedById) || null : null,
      acceptedAt: o.acceptedAt,
      acceptedStatus: o.acceptedStatus,
    }));
  }

  async getInfo() {
    const allowedCount = await this.prisma.cargoBotUser.count({ where: { isAllowed: true } });
    return {
      username: this.botUsername || null,
      running: !!this.bot,
      flowActive: await this.isFlowActive(),
      allowedCount,
    };
  }
}
