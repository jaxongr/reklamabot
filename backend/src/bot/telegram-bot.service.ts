import { Injectable, Logger, OnModuleInit, OnModuleDestroy, BeforeApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Markup } from 'telegraf';
import { message } from 'telegraf/filters';
import { PostingService } from '../posts/posting.service';
import { TelegramService } from '../telegram/telegram.service';
import { PrismaService } from '../common/prisma.service';
import { SystemConfigService } from '../common/system-config.service';
import { PaymentsService } from '../payments/payments.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { SubscriptionPlan } from '@prisma/client';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join, extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as https from 'https';
import * as http from 'http';

// ==================== INTERFACES ====================

interface SessionCreation {
  step: 'phone' | 'code' | 'password';
  phone?: string;
  sessionId?: string;
}

interface SubscriptionFlow {
  step: 'select_plan' | 'awaiting_receipt';
  selectedPlan?: SubscriptionPlan;
  amount?: number;
}

interface PostingState {
  step: 'select_ad';
}

const PLAN_INFO: Record<string, { name: string; price: number; emoji: string; features: string[] }> = {
  STARTER: {
    name: 'Starter',
    price: 50000,
    emoji: '🟢',
    features: ['5 ta e\'lon', '1 ta session', '50 ta guruh'],
  },
  BUSINESS: {
    name: 'Business',
    price: 150000,
    emoji: '🔵',
    features: ['20 ta e\'lon', '3 ta session', '200 ta guruh'],
  },
  PREMIUM: {
    name: 'Premium',
    price: 300000,
    emoji: '🟡',
    features: ['50 ta e\'lon', '5 ta session', '500 ta guruh'],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 500000,
    emoji: '🔴',
    features: ['Cheksiz e\'lon', '10 ta session', 'Cheksiz guruh'],
  },
};

@Injectable()
export class TelegramBotService implements OnModuleInit, OnModuleDestroy, BeforeApplicationShutdown {
  private readonly logger = new Logger(TelegramBotService.name);
  private readonly bot: Telegraf;
  private readonly botToken: string;
  private isBotRunning = false;

  // Foydalanuvchi holatlari
  private pendingSessions = new Map<number, SessionCreation>();
  private subscriptionFlows = new Map<number, SubscriptionFlow>();
  private awaitingAdText = new Set<number>();

  constructor(
    private readonly config: ConfigService,
    private readonly postingService: PostingService,
    private readonly telegramService: TelegramService,
    private readonly prisma: PrismaService,
    private readonly systemConfig: SystemConfigService,
    private readonly paymentsService: PaymentsService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {
    this.botToken = this.config.get<string>('TELEGRAM_BOT_TOKEN') || '';
    this.bot = new Telegraf(this.botToken, {
      handlerTimeout: 30000,
    });
  }

  // ==================== LIFECYCLE ====================

  async onModuleInit() {
    try {
      this.logger.log('Telegram bot ishga tushmoqda...');
      this.setupCommands();
      this.setupErrorHandling();

      const botInfo = await this.bot.telegram.getMe();
      this.logger.log(`Bot ulandi: @${botInfo.username} (${botInfo.first_name})`);

      this.bot.launch({ dropPendingUpdates: true }).then(() => {
        this.isBotRunning = true;
        this.logger.log('Telegram bot muvaffaqiyatli ishga tushdi!');
      }).catch((err) => {
        this.logger.error('Bot ishga tushishda xatolik:', err.message);
      });
    } catch (error) {
      this.logger.error('Bot ishga tushirilmadi:', error.message);
    }
  }

  async onModuleDestroy() {
    if (this.isBotRunning) {
      try {
        await this.bot.stop();
        this.isBotRunning = false;
      } catch {}
    }
  }

  beforeApplicationShutdown() {
    this.bot.stop();
  }

  private setupErrorHandling() {
    this.bot.catch((err, ctx) => {
      this.logger.error(`Bot xatolik (${ctx.update.update_id}):`, err);
    });
  }

  // ==================== HELPERS ====================

  private getMainMenu() {
    return Markup.keyboard([
      ['✍️ E\'lon yaratish', '📊 Mening e\'lonlarim'],
      ['🚀 Tarqatishni boshlash', '⏸ Tarqatishni to\'xtatish'],
      ['📱 Session ulash', '📋 Mening sessionlarim'],
      ['💳 Obuna / To\'lov', '📈 Hisobot'],
      ['📚 Yordam'],
    ]).resize();
  }

  /**
   * Foydalanuvchini DB dan topish yoki yaratish
   */
  private async getOrCreateUser(ctx: any) {
    const tgId = ctx.from?.id?.toString();
    if (!tgId) return null;

    try {
      let user = await this.prisma.user.findUnique({
        where: { telegramId: tgId },
        include: { subscription: true },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            telegramId: tgId,
            firstName: ctx.from.first_name,
            lastName: ctx.from.last_name,
            username: ctx.from.username,
          },
          include: { subscription: true },
        });
        this.logger.log(`Yangi foydalanuvchi yaratildi: ${tgId}`);
      }

      return user;
    } catch (error) {
      this.logger.error(`Foydalanuvchi olishda xatolik: ${error.message}`);
      return null;
    }
  }

  private async downloadPhoto(ctx: any): Promise<string> {
    const photos = ctx.message.photo;
    const biggestPhoto = photos[photos.length - 1];
    const file = await ctx.telegram.getFile(biggestPhoto.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${this.botToken}/${file.file_path}`;

    const uploadDir = join(process.cwd(), 'uploads', 'receipts');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const ext = extname(file.file_path || '.jpg') || '.jpg';
    const filename = `${uuidv4()}${ext}`;
    const filePath = join(uploadDir, filename);

    return new Promise((resolve, reject) => {
      const protocol = fileUrl.startsWith('https') ? https : http;
      protocol.get(fileUrl, (response) => {
        const stream = createWriteStream(filePath);
        response.pipe(stream);
        stream.on('finish', () => {
          stream.close();
          resolve(`/uploads/receipts/${filename}`);
        });
        stream.on('error', reject);
      }).on('error', reject);
    });
  }

  // ==================== COMMANDS SETUP ====================

  private setupCommands() {
    // ========== /start ==========
    this.bot.start(async (ctx) => {
      await this.getOrCreateUser(ctx);

      ctx.reply(
        '👋 *Assalomu alaykum!*\n\n' +
        '🤖 *Reklama Bot* ga xush kelibsiz!\n\n' +
        '📝 *Bot funksiyalari:*\n' +
        '• 📱 Session ulash (10+ account)\n' +
        '• ✍️ E\'lon yaratish\n' +
        '• 🚀 Barcha sessionlar orqali tarqatish\n' +
        '• 📈 Hisobot va statistika\n' +
        '• 💳 Obuna va to\'lov\n\n' +
        '👇 Quyidagi menudan tanlang:',
        { parse_mode: 'Markdown', ...this.getMainMenu() },
      );
    });

    // ========== 📱 SESSION ULASH ==========
    this.bot.hears(/📱 Session ulash/, async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) return;

      // Boshqa jarayonlarni tozalash
      this.clearUserState(userId);

      this.pendingSessions.set(userId, { step: 'phone' });

      ctx.reply(
        '📱 *Session ulash*\n\n' +
        'Telegram accountingizni ulash uchun telefon raqamingizni yuboring.\n\n' +
        '📝 *Format:* `+998901234567`\n\n' +
        '⚠️ *Eslatma:* Kod Telegram ilovangizga keladi.\n\n' +
        '⏳ Telefon raqamingizni kutmoqda...',
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('❌ Bekor qilish', 'cancel_session')],
          ]),
        },
      );
    });

    // ========== 📋 MENING SESSIONLARIM ==========
    this.bot.hears(/📋 Mening sessionlarim/, async (ctx) => {
      const user = await this.getOrCreateUser(ctx);
      if (!user) return;

      try {
        const sessions = await this.telegramService.getUserSessions(user.id);

        if (sessions.length === 0) {
          ctx.reply(
            '📋 *Mening sessionlarim*\n\n' +
            '🔍 Sizda hech qanday session yo\'q.\n\n' +
            '💡 "📱 Session ulash" tugmasini bosing.',
            { parse_mode: 'Markdown', ...this.getMainMenu() },
          );
          return;
        }

        let msg = '📋 *Mening sessionlarim*\n\n';

        for (let i = 0; i < sessions.length; i++) {
          const s = sessions[i];
          const connected = this.telegramService.isClientConnected(s.id);
          const statusEmoji = connected ? '🟢' : s.isFrozen ? '🔴' : '🟡';
          const groupCount = (s as any)._count?.groups || 0;

          msg += `${i + 1}. ${statusEmoji} *${s.name || 'Nomsiz'}*\n`;
          msg += `   📞 ${s.phone || '—'}\n`;
          msg += `   📊 ${groupCount} ta guruh\n`;
          msg += `   📅 ${s.status}`;
          if (s.isFrozen) msg += ' (Muzlatilgan)';
          msg += '\n\n';
        }

        msg += `📱 Jami: ${sessions.length} ta session\n`;
        msg += `🟢 Ulangan: ${sessions.filter(s => this.telegramService.isClientConnected(s.id)).length}`;

        // Inline tugmalar
        const buttons: any[][] = [];
        for (const s of sessions) {
          const label = `${s.name || s.phone || s.id.slice(0, 8)}`;
          if (this.telegramService.isClientConnected(s.id)) {
            buttons.push([
              Markup.button.callback(`🔄 Sinxron: ${label}`, `sync_${s.id}`),
              Markup.button.callback(`🔌 Uzish: ${label}`, `disconnect_${s.id}`),
            ]);
          } else if (s.status === 'ACTIVE' && s.sessionString) {
            buttons.push([
              Markup.button.callback(`🔗 Ulash: ${label}`, `reconnect_${s.id}`),
              Markup.button.callback(`🗑 O'chirish: ${label}`, `delete_session_${s.id}`),
            ]);
          } else {
            buttons.push([
              Markup.button.callback(`🗑 O'chirish: ${label}`, `delete_session_${s.id}`),
            ]);
          }
        }
        buttons.push([Markup.button.callback('◀️ Orqaga', 'back_to_main')]);

        ctx.reply(msg, {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard(buttons),
        });
      } catch (error) {
        this.logger.error(`Sessionlar ko'rsatishda xatolik: ${error.message}`);
        ctx.reply('❌ Xatolik yuz berdi.', this.getMainMenu());
      }
    });

    // Session callback'lari
    this.bot.action(/sync_(.+)/, async (ctx) => {
      const sessionId = ctx.match[1];
      ctx.answerCbQuery('🔄 Sinxronlanmoqda...');

      try {
        const count = await this.telegramService.syncGroups(sessionId);
        ctx.reply(
          `✅ *Guruhlar sinxronlandi!*\n\n📊 Jami: ${count} ta guruh`,
          { parse_mode: 'Markdown', ...this.getMainMenu() },
        );
      } catch (error) {
        ctx.reply(`❌ Sinxronlashda xatolik: ${error.message}`, this.getMainMenu());
      }
    });

    this.bot.action(/disconnect_(.+)/, async (ctx) => {
      const sessionId = ctx.match[1];
      ctx.answerCbQuery('🔌 Uzilmoqda...');

      try {
        await this.telegramService.disconnectSession(sessionId);
        ctx.reply('✅ Session uzildi.', this.getMainMenu());
      } catch (error) {
        ctx.reply(`❌ Xatolik: ${error.message}`, this.getMainMenu());
      }
    });

    this.bot.action(/reconnect_(.+)/, async (ctx) => {
      const sessionId = ctx.match[1];
      ctx.answerCbQuery('🔗 Ulanmoqda...');

      try {
        await this.telegramService.connectSession(sessionId);
        const count = await this.telegramService.syncGroups(sessionId);
        ctx.reply(
          `✅ *Session qayta ulandi!*\n📊 ${count} ta guruh`,
          { parse_mode: 'Markdown', ...this.getMainMenu() },
        );
      } catch (error) {
        ctx.reply(`❌ Ulashda xatolik: ${error.message}`, this.getMainMenu());
      }
    });

    this.bot.action(/delete_session_(.+)/, async (ctx) => {
      const sessionId = ctx.match[1];
      ctx.answerCbQuery("O'chirilmoqda...");

      try {
        await this.telegramService.deleteSession(sessionId);
        ctx.reply("✅ Session o'chirildi.", this.getMainMenu());
      } catch (error) {
        ctx.reply(`❌ Xatolik: ${error.message}`, this.getMainMenu());
      }
    });

    // ========== ✍️ E'LON YARATISH ==========
    this.bot.hears(/✍️ E'lon yaratish/, async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) return;

      this.clearUserState(userId);
      this.awaitingAdText.add(userId);

      ctx.reply(
        '✍️ *E\'lon yaratish*\n\n' +
        'E\'lon matnini yuboring:\n\n' +
        '📌 *Misol:*\n```\nPloshchadka kerak\nYuk pishgan g\'isht paddonida\n998901234567\n```\n\n' +
        '⏳ Matnni kutmoqda...',
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('❌ Bekor qilish', 'cancel_ad')],
          ]),
        },
      );
    });

    // ========== 📊 MENING E'LONLARIM ==========
    this.bot.hears(/📊 Mening e'lonlarim/, async (ctx) => {
      const user = await this.getOrCreateUser(ctx);
      if (!user) return;

      try {
        const ads = await this.prisma.ad.findMany({
          where: { userId: user.id, status: { not: 'ARCHIVED' } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        });

        if (ads.length === 0) {
          ctx.reply(
            '📊 *Mening e\'lonlarim*\n\n🔍 E\'lon yo\'q.\n💡 "✍️ E\'lon yaratish" tugmasini bosing.',
            { parse_mode: 'Markdown', ...this.getMainMenu() },
          );
          return;
        }

        let msg = '📊 *Mening e\'lonlarim*\n\n';

        const buttons: any[][] = [];
        for (let i = 0; i < ads.length; i++) {
          const ad = ads[i];
          const preview = ad.content.length > 50 ? ad.content.slice(0, 50) + '...' : ad.content;
          const statusEmoji = ad.status === 'ACTIVE' ? '🟢' : ad.status === 'PAUSED' ? '⏸' : '📝';
          msg += `${i + 1}. ${statusEmoji} ${preview}\n`;
          msg += `   📅 ${new Date(ad.createdAt).toLocaleDateString('uz-UZ')}\n\n`;

          buttons.push([
            Markup.button.callback(`🚀 Tarqat: #${i + 1}`, `post_ad_${ad.id}`),
            Markup.button.callback(`🗑 O'chir: #${i + 1}`, `del_ad_${ad.id}`),
          ]);
        }

        buttons.push([Markup.button.callback('◀️ Orqaga', 'back_to_main')]);

        ctx.reply(msg, {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard(buttons),
        });
      } catch (error) {
        ctx.reply('❌ Xatolik yuz berdi.', this.getMainMenu());
      }
    });

    // E'lon tarqatish callback
    this.bot.action(/post_ad_(.+)/, async (ctx) => {
      const adId = ctx.match[1];
      ctx.answerCbQuery('🚀 Tarqatish boshlanmoqda...');

      const user = await this.getOrCreateUser(ctx);
      if (!user) return;

      try {
        const ad = await this.prisma.ad.findUnique({ where: { id: adId } });
        if (!ad) {
          ctx.reply('❌ E\'lon topilmadi.', this.getMainMenu());
          return;
        }

        const job = await this.postingService.startPosting(ad.id, ad.content, user.id);
        const stats = this.postingService.getJobStats(job.id);

        // E'lon statusini yangilash
        await this.prisma.ad.update({
          where: { id: adId },
          data: { status: 'ACTIVE' },
        });

        ctx.reply(
          '✅ *Tarqatish boshlandi!*\n\n' +
          `📊 *Guruhlar:* ${stats?.totalGroups || 0}\n` +
          '⏱ *Delay:* 0.5-5s (guruh), 10 min (round)\n\n' +
          '📈 "📈 Hisobot" — natijalarni ko\'ring\n' +
          '⏸ "⏸ Tarqatishni to\'xtatish" — to\'xtatish',
          { parse_mode: 'Markdown', ...this.getMainMenu() },
        );
      } catch (error) {
        ctx.reply(`❌ Xatolik: ${error.message}`, this.getMainMenu());
      }
    });

    // E'lonni o'chirish
    this.bot.action(/del_ad_(.+)/, async (ctx) => {
      const adId = ctx.match[1];
      ctx.answerCbQuery("O'chirildi");

      try {
        await this.prisma.ad.update({
          where: { id: adId },
          data: { status: 'ARCHIVED' },
        });
        ctx.reply("✅ E'lon o'chirildi.", this.getMainMenu());
      } catch {
        ctx.reply('❌ Xatolik.', this.getMainMenu());
      }
    });

    // ========== 🚀 TARQATISHNI BOSHLASH ==========
    this.bot.hears(/🚀 Tarqatishni boshlash/, async (ctx) => {
      const user = await this.getOrCreateUser(ctx);
      if (!user) return;

      const ads = await this.prisma.ad.findMany({
        where: { userId: user.id, status: { in: ['DRAFT', 'ACTIVE', 'PAUSED'] } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      if (ads.length === 0) {
        ctx.reply(
          '🚀 *Tarqatish*\n\n🔍 E\'lon yo\'q. Avval e\'lon yarating.',
          { parse_mode: 'Markdown', ...this.getMainMenu() },
        );
        return;
      }

      let msg = '🚀 *Tarqatish uchun e\'lon tanlang:*\n\n';
      const buttons: any[][] = [];

      for (let i = 0; i < ads.length; i++) {
        const ad = ads[i];
        const preview = ad.content.length > 40 ? ad.content.slice(0, 40) + '...' : ad.content;
        msg += `${i + 1}. ${preview}\n\n`;
        buttons.push([Markup.button.callback(`🚀 #${i + 1} — Tarqat`, `post_ad_${ad.id}`)]);
      }
      buttons.push([Markup.button.callback('◀️ Orqaga', 'back_to_main')]);

      ctx.reply(msg, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(buttons),
      });
    });

    // ========== ⏸ TARQATISHNI TO'XTATISH ==========
    this.bot.hears(/⏸ Tarqatishni to'xtatish/, async (ctx) => {
      const user = await this.getOrCreateUser(ctx);
      if (!user) return;

      const jobs = this.postingService.getUserJobs(user.id);
      const activeJobs = jobs.filter(j => j.status === 'running' || j.status === 'paused');

      if (activeJobs.length === 0) {
        ctx.reply(
          '⏸ *To\'xtatish*\n\n🔍 Faol tarqatish yo\'q.',
          { parse_mode: 'Markdown', ...this.getMainMenu() },
        );
        return;
      }

      for (const job of activeJobs) {
        this.postingService.stopJob(job.id);
      }

      const stats = activeJobs.map(j => this.postingService.getJobStats(j.id));

      let totalPosted = 0;
      let totalFailed = 0;
      let totalRounds = 0;

      stats.forEach(s => {
        if (s) {
          totalPosted += s.postedGroups;
          totalFailed += s.failedGroups;
          totalRounds += s.roundsCompleted;
        }
      });

      ctx.reply(
        '✅ *Barcha tarqatishlar to\'xtatildi!*\n\n' +
        `📊 *Yuborildi:* ${totalPosted}\n` +
        `❌ *Xatolik:* ${totalFailed}\n` +
        `🔄 *Roundlar:* ${totalRounds}`,
        { parse_mode: 'Markdown', ...this.getMainMenu() },
      );
    });

    // ========== 📈 HISOBOT ==========
    this.bot.hears(/📈 Hisobot/, async (ctx) => {
      const user = await this.getOrCreateUser(ctx);
      if (!user) return;

      // Session statistikasi
      const sessions = await this.telegramService.getUserSessions(user.id);
      const connectedCount = sessions.filter(s => this.telegramService.isClientConnected(s.id)).length;
      let totalGroups = 0;
      sessions.forEach(s => { totalGroups += s.totalGroups; });

      // Faol joblar
      const jobs = this.postingService.getUserJobs(user.id);
      const activeJobs = jobs.filter(j => j.status === 'running' || j.status === 'paused');

      let msg = '📈 *Hisobot*\n\n';
      msg += `📱 *Sessionlar:* ${sessions.length} (🟢 ${connectedCount} ulangan)\n`;
      msg += `📊 *Guruhlar:* ${totalGroups}\n\n`;

      if (activeJobs.length > 0) {
        msg += '🚀 *Faol tarqatishlar:*\n\n';
        for (const job of activeJobs) {
          const stats = this.postingService.getJobStats(job.id);
          if (!stats) continue;

          const durationMin = Math.floor(stats.duration / 60000);
          msg += `📋 *Job:* ${job.id.slice(0, 12)}...\n`;
          msg += `   ✅ Yuborildi: ${stats.postedGroups}/${stats.totalGroups}\n`;
          msg += `   ❌ Xatolik: ${stats.failedGroups}\n`;
          msg += `   🔄 Roundlar: ${stats.roundsCompleted}\n`;
          msg += `   ⏱ Vaqt: ${durationMin} daqiqa\n`;
          msg += `   📈 Muvaffaqiyat: ${stats.successRate.toFixed(1)}%\n\n`;
        }
      } else {
        msg += '🔍 Faol tarqatish yo\'q.\n';
      }

      ctx.reply(msg, { parse_mode: 'Markdown', ...this.getMainMenu() });
    });

    // ========== 💳 OBUNA / TO'LOV ==========
    this.bot.hears(/💳 Obuna \/ To'lov/, async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) return;
      this.clearUserState(userId);

      const user = await this.getOrCreateUser(ctx);
      if (!user) return;

      let subInfo = '';
      if ((user as any).subscription) {
        const sub = (user as any).subscription;
        const plan = PLAN_INFO[sub.planType];
        const endDate = sub.endDate ? new Date(sub.endDate).toLocaleDateString('uz-UZ') : '—';
        subInfo =
          `\n📋 *Joriy obuna:*\n` +
          `${plan?.emoji || '📦'} *${plan?.name || sub.planType}*\n` +
          `📅 Tugash: ${endDate}\n` +
          `📊 Holat: ${sub.status === 'ACTIVE' ? '✅ Faol' : '❌ ' + sub.status}\n\n`;
      } else {
        subInfo = '\n⚠️ *Faol obuna yo\'q.*\n\n';
      }

      ctx.reply(
        '💳 *Obuna / To\'lov*\n' +
        subInfo +
        '📦 *Tariflar:*\n\n' +
        '🟢 *STARTER* — 50,000 UZS/oy\n   5 e\'lon, 1 session, 50 guruh\n\n' +
        '🔵 *BUSINESS* — 150,000 UZS/oy\n   20 e\'lon, 3 session, 200 guruh\n\n' +
        '🟡 *PREMIUM* — 300,000 UZS/oy\n   50 e\'lon, 5 session, 500 guruh\n\n' +
        '🔴 *ENTERPRISE* — 500,000 UZS/oy\n   Cheksiz e\'lon, 10 session, cheksiz guruh\n\n' +
        '👇 Tarifni tanlang:',
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [
              Markup.button.callback('🟢 Starter 50K', 'plan_STARTER'),
              Markup.button.callback('🔵 Business 150K', 'plan_BUSINESS'),
            ],
            [
              Markup.button.callback('🟡 Premium 300K', 'plan_PREMIUM'),
              Markup.button.callback('🔴 Enterprise 500K', 'plan_ENTERPRISE'),
            ],
            [Markup.button.callback('◀️ Orqaga', 'back_to_main')],
          ]),
        },
      );
    });

    // Plan tanlash
    this.bot.action(/plan_(STARTER|BUSINESS|PREMIUM|ENTERPRISE)/, async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) return;

      const planType = ctx.match[1] as SubscriptionPlan;
      const plan = PLAN_INFO[planType];
      ctx.answerCbQuery(`${plan.name} tanlandi`);

      // Karta ma'lumotlarini olish
      let cardsMsg = '';
      try {
        const cards = await this.systemConfig.getPaymentCards();
        if (cards.length > 0) {
          cardsMsg = '💳 *To\'lov kartalari:*\n\n';
          cards.forEach((card, i) => {
            cardsMsg += `${i + 1}. *${card.bankName}*\n`;
            cardsMsg += `   \`${card.cardNumber}\`\n`;
            cardsMsg += `   ${card.cardHolder}\n`;
            if (card.description) cardsMsg += `   _${card.description}_\n`;
            cardsMsg += '\n';
          });
        } else {
          cardsMsg = '⚠️ Karta ma\'lumotlari hali kiritilmagan.\n\n';
        }
      } catch {
        cardsMsg = '⚠️ Karta olishda xatolik.\n\n';
      }

      this.subscriptionFlows.set(userId, {
        step: 'awaiting_receipt',
        selectedPlan: planType,
        amount: plan.price,
      });

      ctx.editMessageText(
        `${plan.emoji} *${plan.name}* — ${plan.price.toLocaleString()} UZS\n\n` +
        `📦 *Imkoniyatlar:*\n${plan.features.map(f => `   • ${f}`).join('\n')}\n\n` +
        cardsMsg +
        '📸 *Yuqoridagi kartaga pul o\'tkazing va chek rasmini yuboring.*\n\n' +
        '⏳ Chek rasmini kutmoqda...',
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('❌ Bekor qilish', 'cancel_subscription')],
          ]),
        },
      );
    });

    this.bot.action('cancel_subscription', (ctx) => {
      const userId = ctx.from?.id;
      if (userId) this.subscriptionFlows.delete(userId);
      ctx.answerCbQuery('Bekor qilindi');
      ctx.editMessageText('❌ Obuna bekor qilindi.');
      ctx.reply('👇 Asosiy menyu:', this.getMainMenu());
    });

    // ========== 📚 YORDAM ==========
    this.bot.hears(/📚 Yordam/, (ctx) => {
      ctx.reply(
        '📚 *Yordam*\n\n' +
        '🔹 *Session ulash:*\n' +
        '   📱 "Session ulash" → telefon raqam → kod → tayyor!\n' +
        '   Bir nechta account ulash mumkin (10+ ta)\n\n' +
        '🔹 *E\'lon tarqatish:*\n' +
        '   1. E\'lon yaratish\n' +
        '   2. "🚀 Tarqatishni boshlash"\n' +
        '   3. Barcha sessionlardagi guruhlarga yuboriladi\n\n' +
        '🔹 *Vaqtlar:*\n' +
        '   • Guruhlar orasida: 0.5-5 soniya (random)\n' +
        '   • Roundlar orasida: 10 daqiqa pauza\n\n' +
        '🔹 *Obuna:*\n' +
        '   💳 "Obuna / To\'lov" → tarif → chek → admin tasdiqlaydi\n\n' +
        '📞 Savol bo\'lsa admin bilan bog\'laning.',
        { parse_mode: 'Markdown', ...this.getMainMenu() },
      );
    });

    // ========== CANCEL CALLBACKS ==========
    this.bot.action('cancel_session', (ctx) => {
      const userId = ctx.from?.id;
      if (userId) {
        const pending = this.pendingSessions.get(userId);
        if (pending?.sessionId) {
          this.telegramService.cancelPendingAuth(pending.sessionId).catch(() => {});
        }
        this.pendingSessions.delete(userId);
      }
      ctx.answerCbQuery('Bekor qilindi');
      ctx.reply('❌ Session ulash bekor qilindi.', this.getMainMenu());
    });

    this.bot.action('cancel_ad', (ctx) => {
      const userId = ctx.from?.id;
      if (userId) this.awaitingAdText.delete(userId);
      ctx.answerCbQuery('Bekor qilindi');
      ctx.reply("❌ E'lon yaratish bekor qilindi.", this.getMainMenu());
    });

    this.bot.action('back_to_main', (ctx) => {
      const userId = ctx.from?.id;
      if (userId) this.clearUserState(userId);
      ctx.answerCbQuery();
      ctx.reply('👇 Asosiy menyu:', this.getMainMenu());
    });

    // ========== PHOTO HANDLER (chek rasm) ==========
    this.bot.on(message('photo'), async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) return;

      const flow = this.subscriptionFlows.get(userId);
      if (!flow || flow.step !== 'awaiting_receipt') return;

      try {
        const receiptUrl = await this.downloadPhoto(ctx);
        const user = await this.getOrCreateUser(ctx);
        if (!user) {
          ctx.reply('❌ Foydalanuvchi topilmadi.', this.getMainMenu());
          this.subscriptionFlows.delete(userId);
          return;
        }

        await this.paymentsService.create(
          user.id,
          flow.amount!,
          flow.selectedPlan!,
          { receiptImage: receiptUrl },
        );

        this.subscriptionFlows.delete(userId);

        ctx.reply(
          '✅ *To\'lovingiz qabul qilindi!*\n\n' +
          `💰 *Summa:* ${flow.amount!.toLocaleString()} UZS\n` +
          `📦 *Plan:* ${PLAN_INFO[flow.selectedPlan!].name}\n` +
          '📸 *Chek:* Yuklandi\n\n' +
          '⏳ *Admin tasdiqlashini kuting.*\n' +
          'Tasdiqlangandan keyin obuna faollashadi.',
          { parse_mode: 'Markdown', ...this.getMainMenu() },
        );
      } catch (error) {
        this.logger.error(`Chek yuklashda xatolik: ${error.message}`);
        this.subscriptionFlows.delete(userId);
        ctx.reply('❌ Xatolik yuz berdi. Qayta urinib ko\'ring.', this.getMainMenu());
      }
    });

    // ========== TEXT HANDLER ==========
    this.bot.on(message('text'), async (ctx) => {
      const userId = ctx.from?.id;
      const text = ctx.message.text;
      if (!userId) return;

      // ===== Session ulash — telefon raqam / kod / parol =====
      const pending = this.pendingSessions.get(userId);
      if (pending) {
        await this.handleSessionFlow(ctx, pending, text);
        return;
      }

      // ===== E'lon yaratish =====
      if (this.awaitingAdText.has(userId)) {
        this.awaitingAdText.delete(userId);

        const user = await this.getOrCreateUser(ctx);
        if (!user) {
          ctx.reply('❌ Foydalanuvchi topilmadi.', this.getMainMenu());
          return;
        }

        try {
          await this.prisma.ad.create({
            data: {
              userId: user.id,
              title: text.slice(0, 50),
              content: text,
              mediaType: 'TEXT',
              status: 'DRAFT',
              createdBy: user.id,
            },
          });

          ctx.reply(
            '✅ *E\'lon saqlandi!*\n\n' +
            `📝 ${text}\n\n` +
            '🚀 Tarqatish uchun "🚀 Tarqatishni boshlash" tugmasini bosing.',
            { parse_mode: 'Markdown', ...this.getMainMenu() },
          );
        } catch (error) {
          ctx.reply(`❌ Xatolik: ${error.message}`, this.getMainMenu());
        }
        return;
      }

      // Default
      ctx.reply(
        '👇 Quyidagi menudan tanlang:',
        this.getMainMenu(),
      );
    });

    // Generic callback
    this.bot.on('callback_query', (ctx) => {
      if (!('data' in ctx.callbackQuery) || !ctx.callbackQuery.data) {
        ctx.answerCbQuery('⚠️ Noma\'lum buyruq');
      }
    });
  }

  // ==================== SESSION FLOW ====================

  private async handleSessionFlow(ctx: any, pending: SessionCreation, text: string): Promise<void> {
    const userId = ctx.from?.id;
    if (!userId) return;

    try {
      switch (pending.step) {
        case 'phone': {
          // Telefon raqamni validatsiya
          const phone = text.replace(/[\s\-\(\)]/g, '');
          if (!/^\+?\d{10,15}$/.test(phone)) {
            ctx.reply(
              '❌ *Noto\'g\'ri format!*\n\n' +
              'To\'g\'ri format: `+998901234567`\n\n' +
              'Qayta yuboring:',
              { parse_mode: 'Markdown' },
            );
            return;
          }

          const fullPhone = phone.startsWith('+') ? phone : '+' + phone;

          ctx.reply(`📱 *${fullPhone}* ga kod yuborilmoqda...`, { parse_mode: 'Markdown' });

          // Foydalanuvchini olish
          const user = await this.getOrCreateUser(ctx);
          if (!user) {
            ctx.reply('❌ Foydalanuvchi topilmadi.', this.getMainMenu());
            this.pendingSessions.delete(userId);
            return;
          }

          // Real Telegram API orqali kod yuborish
          const result = await this.telegramService.sendCode(user.id, fullPhone);

          this.pendingSessions.set(userId, {
            step: 'code',
            phone: fullPhone,
            sessionId: result.sessionId,
          });

          ctx.reply(
            '✅ *Kod yuborildi!*\n\n' +
            '🔐 Telegram ilovangizga kelgan kodni yuboring:\n\n' +
            '⏳ Kodni kutmoqda...',
            {
              parse_mode: 'Markdown',
              ...Markup.inlineKeyboard([
                [Markup.button.callback('❌ Bekor qilish', 'cancel_session')],
              ]),
            },
          );
          break;
        }

        case 'code': {
          const code = text.replace(/\s/g, '');
          if (!/^\d{5}$/.test(code)) {
            ctx.reply(
              '❌ Kod 5 ta raqamdan iborat bo\'lishi kerak.\nQayta yuboring:',
            );
            return;
          }

          ctx.reply('🔐 Kod tekshirilmoqda...');

          try {
            const result = await this.telegramService.signIn(pending.sessionId!, code);

            this.pendingSessions.delete(userId);

            ctx.reply(
              '✅ *Session muvaffaqiyatli ulandi!*\n\n' +
              `📊 *Guruhlar:* ${result.groupsCount} ta\n\n` +
              '📋 "📋 Mening sessionlarim" — barchani ko\'ring\n' +
              '🚀 Endi e\'lon tarqatishingiz mumkin!',
              { parse_mode: 'Markdown', ...this.getMainMenu() },
            );
          } catch (error: any) {
            if (error.message === '2FA_REQUIRED') {
              this.pendingSessions.set(userId, {
                ...pending,
                step: 'password',
              });
              ctx.reply(
                '🔒 *2FA parol kerak!*\n\n' +
                'Telegram hisobingizning 2FA parolini yuboring:',
                {
                  parse_mode: 'Markdown',
                  ...Markup.inlineKeyboard([
                    [Markup.button.callback('❌ Bekor qilish', 'cancel_session')],
                  ]),
                },
              );
            } else {
              this.pendingSessions.delete(userId);
              ctx.reply(`❌ Xatolik: ${error.message}`, this.getMainMenu());
            }
          }
          break;
        }

        case 'password': {
          ctx.reply('🔒 Parol tekshirilmoqda...');

          try {
            const result = await this.telegramService.signIn(pending.sessionId!, '', text);

            this.pendingSessions.delete(userId);

            ctx.reply(
              '✅ *Session muvaffaqiyatli ulandi!*\n\n' +
              `📊 *Guruhlar:* ${result.groupsCount} ta`,
              { parse_mode: 'Markdown', ...this.getMainMenu() },
            );
          } catch (error: any) {
            this.pendingSessions.delete(userId);
            ctx.reply(`❌ Xatolik: ${error.message}`, this.getMainMenu());
          }
          break;
        }

        default:
          this.pendingSessions.delete(userId);
          ctx.reply('❌ Xatolik. Qayta urinib ko\'ring.', this.getMainMenu());
      }
    } catch (error: any) {
      this.pendingSessions.delete(userId);
      this.logger.error(`Session flow xatolik: ${error.message}`);
      ctx.reply(`❌ Xatolik: ${error.message}`, this.getMainMenu());
    }
  }

  // ==================== STATE CLEANUP ====================

  private clearUserState(userId: number) {
    this.pendingSessions.delete(userId);
    this.subscriptionFlows.delete(userId);
    this.awaitingAdText.delete(userId);
  }
}
