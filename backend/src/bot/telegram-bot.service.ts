import { Injectable, Logger, OnModuleInit, OnModuleDestroy, BeforeApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Markup } from 'telegraf';
import { message } from 'telegraf/filters';
import { PostingService } from '../posts/posting.service';
import { TelegramService } from '../telegram/telegram.service';

interface Ad {
  id: string;
  userId: number;
  userName: string;
  content: string;
  createdAt: Date;
  postingJobId?: string;
  isPosting?: boolean;
}

interface SessionCreation {
  userId: number;
  step: 'phone' | 'code' | 'password' | 'name';
  phone?: string;
  phoneCodeHash?: string;
  sessionId?: string;
}

@Injectable()
export class TelegramBotService implements OnModuleInit, OnModuleDestroy, BeforeApplicationShutdown {
  private readonly logger = new Logger(TelegramBotService.name);
  private readonly bot: Telegraf;
  private readonly botToken: string;
  private isBotRunning = false;

  // Simple in-memory ads storage
  private ads: Ad[] = [];
  private awaitingAdCreation = new Set<number>();
  private pendingSessions = new Map<number, SessionCreation>();

  constructor(
    private readonly config: ConfigService,
    private readonly postingService: PostingService,
    private readonly telegramService: TelegramService,
  ) {
    this.botToken = this.config.get<string>('TELEGRAM_BOT_TOKEN') || '';
    this.bot = new Telegraf(this.botToken, {
      handlerTimeout: 10000,
    });
  }

  async onModuleInit() {
    try {
      this.logger.log('Initializing Telegram bot...');
      this.setupCommands();
      this.setupErrorHandling();

      // Test bot connection first
      this.logger.log('Testing bot connection...');
      const botInfo = await this.bot.telegram.getMe();
      this.logger.log(`Bot connected: @${botInfo.username} (${botInfo.first_name})`);

      // Start polling (non-blocking)
      this.logger.log('Starting bot polling...');
      this.bot.launch({
        dropPendingUpdates: true,
      }).then(() => {
        this.isBotRunning = true;
        this.logger.log('Telegram bot started successfully!');
      }).catch((err) => {
        this.logger.error('Bot launch error:', err.message);
      });
    } catch (error) {
      this.logger.error('Failed to start Telegram bot:', error.message);
      this.logger.warn('Bot will not respond to commands.');
      if (error.response) {
        this.logger.error(`Telegram API error: ${JSON.stringify(error.response)}`);
      }
    }
  }

  async onModuleDestroy() {
    if (this.isBotRunning) {
      this.logger.log('Stopping Telegram bot...');
      try {
        await this.bot.stop();
        this.isBotRunning = false;
        this.logger.log('Telegram bot stopped successfully');
      } catch (error) {
        this.logger.error('Error stopping Telegram bot:', error);
      }
    }
  }

  beforeApplicationShutdown() {
    this.logger.log('Application shutdown - stopping bot...');
    this.bot.stop();
  }

  private setupErrorHandling() {
    this.bot.catch((err, ctx) => {
      this.logger.error(`Bot error for update ${ctx.update.update_id}:`, err);
    });
  }

  // Main menu keyboard
  private getMainMenu() {
    return Markup.keyboard([
      ['✍️ E\'lon yaratish', '📊 Mening e\'lonlarim'],
      ['🚀 Tarqatishni boshlash', '⏸ Tarqatishni to\'xtatish'],
      ['📱 Session ulash', '📋 Mening sessionlarim'],
      ['📈 Hisobot', '📚 Yordam'],
    ])
      .resize()
      .oneTime();
  }

  // Back button
  private getBackButton() {
    return Markup.inlineKeyboard([
      [Markup.button.callback('◀️ Orqaga', 'back_to_main')],
    ]);
  }

  private setupCommands() {
    // Start command
    this.bot.start((ctx) => {
      const welcomeMessage =
        '👋 *Assalomu alaykum!*\n\n' +
        '🤖 *Reklama Bot* ga xush kelibsiz!\n\n' +
        '📝 *Bot funksiyalari:*\n' +
        '• E\'lon yaratish (matn shaklida)\n' +
        '• Multi-session tarqatish (10+ account)\n' +
        '• Avtomatik tarqatish (5-15 min)\n' +
        '• Hisobotlar va statistika\n\n' +
        '👇 Quyidagi menudan tanlang:';

      ctx.reply(welcomeMessage, {
        parse_mode: 'Markdown',
        ...this.getMainMenu(),
      });
    });

    // Help command
    this.bot.command('help', (ctx) => {
      const helpMessage =
        '📚 *Yordam*\n\n' +
        '🔹 *E\'lon yaratish:* "✍️ E\'lon yaratish" tugmasini bosing va matn yuboring\n' +
        '🔹 *Tarqatish:* E\'lonni tanlang va "🚀 Tarqatishni boshlash" tugmasini bosing\n' +
        '🔹 *Multi-session:* Barcha ulangan sessionlardagi guruhlarga tarqatadi\n' +
        '🔹 *Delay:* Guruhlar orasida 0.5-5 soniya, roundlar orasida 5-15 daqiqa\n\n' +
        '📝 *E\'lon misoli:*\n' +
        '```\n' +
        'Плошатка керак\n' +
        'Юк пишган гишт паддонда\n' +
        '991175530\n' +
        '```\n\n' +
        '❓ Savollaringiz bo\'lsa, admin bilan bog\'laning';

      ctx.reply(helpMessage, {
        parse_mode: 'Markdown',
        ...this.getMainMenu(),
      });
    });

    // Session connect button
    this.bot.hears(/📱 Session ulash/, (ctx) => {
      const userId = ctx.from?.id;

      if (!userId) return;

      this.pendingSessions.set(userId, {
        userId,
        step: 'phone',
      });

      ctx.reply(
        '📱 *Session ulash*\n\n' +
        '🔐 Telegram accountingizni ulash uchun:\n\n' +
        '1️⃣ Telefon raqamingizni yuboring\n' +
        '2️⃣ Kodni yuboring\n' +
        '3️⃣ Session saqlanadi!\n\n' +
        '📝 *Format:* `998901234567`\n\n' +
        '⏳ Telefon raqamingizni yuboring...',
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('❌ Bekor qilish', 'cancel_session')],
          ]),
        }
      );
    });

    // My sessions button
    this.bot.hears(/📋 Mening sessionlarim/, (ctx) => {
      ctx.reply(
        '📋 *Mening sessionlarim*\n\n' +
        '⚠️ *Ma\'lumot:* Sessionlar ma\'lumotlar bazasida saqlanadi.\n\n' +
        'Hozircha database ulanmagan. Sessionlarni ko\'rish uchun:\n' +
        '1. Ma\'lumotlar bazasini o\'rnating\n' +
        '2. Backendni qayta ishga tushiring\n\n' +
        '💡 *Session ulash uchun:* "📱 Session ulash" tugmasini bosing.',
        {
          parse_mode: 'Markdown',
          ...this.getMainMenu(),
        }
      );
    });

    // Create ad button
    this.bot.hears(/✍️ E'lon yaratish/, (ctx) => {
      const userId = ctx.from?.id;

      if (!userId) return;

      this.awaitingAdCreation.add(userId);

      ctx.reply(
        '✍️ *E\'lon yaratish*\n\n' +
        '📝 Iltimos, e\'lon matnini yuboring.\n\n' +
        '📌 *Masalan:*\n' +
        '```\n' +
        'Плошатка керак\n' +
        'Юк пишган гишт паддонда\n' +
        '991175530\n' +
        '```\n\n' +
        '⏳ Matnni yuborishingizni kutmoqda...',
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('❌ Bekor qilish', 'cancel_create')],
          ]),
        }
      );
    });

    // My ads button
    this.bot.hears(/📊 Mening e'lonlarim/, (ctx) => {
      const userId = ctx.from?.id;

      if (!userId) return;

      const userAds = this.ads.filter((ad) => ad.userId === userId);

      if (userAds.length === 0) {
        ctx.reply(
          '📊 *Mening e\'lonlarim*\n\n' +
          '🔍 Sizda hozircha hech qanday e\'lon yo\'q.\n\n' +
          '💡 Yangi e\'lon yaratish uchun "✍️ E\'lon yaratish" tugmasini bosing.',
          {
            parse_mode: 'Markdown',
            ...this.getMainMenu(),
          }
        );
        return;
      }

      let message = '📊 *Mening e\'lonlarim*\n\n';

      userAds.forEach((ad, index) => {
        const preview = ad.content.length > 50
          ? ad.content.substring(0, 50) + '...'
          : ad.content;
        message += `${index + 1}. ${preview}\n`;
        if (ad.isPosting) {
          message += `   🚀 *Tarqatilmoqda...*\n`;
        }
        message += `   📅 ${new Date(ad.createdAt).toLocaleString('uz-UZ')}\n\n`;
      });

      message += '📝 Jami: ' + userAds.length + ' ta e\'lon';

      ctx.reply(message, {
        parse_mode: 'Markdown',
        ...this.getMainMenu(),
      });
    });

    // Start posting button
    this.bot.hears(/🚀 Tarqatishni boshlash/, (ctx) => {
      const userId = ctx.from?.id;

      if (!userId) return;

      const userAds = this.ads.filter((ad) => ad.userId === userId);

      if (userAds.length === 0) {
        ctx.reply(
          '🚀 *Tarqatishni boshlash*\n\n' +
          '🔍 Sizda hech qanday e\'lon yo\'q.\n\n' +
          '💡 Avval e\'lon yarating.',
          {
            parse_mode: 'Markdown',
            ...this.getMainMenu(),
          }
        );
        return;
      }

      let message = '🚀 *Tarqatishni boshlash*\n\n';
      message += '📝 Tarqatmoqchi bo\'lgan e\'loningiz raqamini yuboring:\n\n';

      userAds.forEach((ad, index) => {
        const preview = ad.content.length > 40
          ? ad.content.substring(0, 40) + '...'
          : ad.content;
        message += `/${index + 1} - ${preview}\n`;
        if (ad.isPosting) {
          message += `   (🚀 Tarqatilmoqda)\n`;
        }
        message += '\n';
      });

      this.awaitingAdCreation.add(userId);

      ctx.reply(message, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('❌ Bekor qilish', 'cancel_post_start')],
        ]),
      });
    });

    // Stop posting button
    this.bot.hears(/⏸ Tarqatishni to'xtatish/, (ctx) => {
      const userId = ctx.from?.id;

      if (!userId) return;

      const userAds = this.ads.filter((ad) => ad.userId === userId && ad.isPosting);

      if (userAds.length === 0) {
        ctx.reply(
          '⏸ *Tarqatishni to\'xtatish*\n\n' +
          '🔍 Sizda hech qanday tarqatilayotgan e\'lon yo\'q.',
          {
            parse_mode: 'Markdown',
            ...this.getMainMenu(),
          }
        );
        return;
      }

      let message = '⏸ *Tarqatishni to\'xtatish*\n\n';
      message += '📝 To\'xtatmoqchi bo\'lgan e\'loningiz raqamini yuboring:\n\n';

      userAds.forEach((ad, index) => {
        const preview = ad.content.length > 40
          ? ad.content.substring(0, 40) + '...'
          : ad.content;
        message += `/${index + 1} - ${preview}\n`;
        message += `   (🚀 Tarqatilmoqda)\n\n`;
      });

      this.awaitingAdCreation.add(userId);

      ctx.reply(message, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('❌ Bekor qilish', 'cancel_stop')],
        ]),
      });
    });

    // Report button
    this.bot.hears(/📈 Hisobot/, (ctx) => {
      const userId = ctx.from?.id;

      if (!userId) return;

      const userAds = this.ads.filter((ad) => ad.userId === userId && ad.postingJobId);

      if (userAds.length === 0) {
        ctx.reply(
          '📈 *Hisobot*\n\n' +
          '🔍 Sizda hech qanday tarqatilayotgan e\'lon yo\'q.',
          {
            parse_mode: 'Markdown',
            ...this.getMainMenu(),
          }
        );
        return;
      }

      let message = '📈 *Tarqatish hisoboti*\n\n';

      for (const ad of userAds) {
        if (!ad.postingJobId) continue;

        const job = this.postingService.getJob(ad.postingJobId);
        if (!job) continue;

        const stats = this.postingService.getJobStats(ad.postingJobId);
        if (!stats) continue;

        const preview = ad.content.length > 30
          ? ad.content.substring(0, 30) + '...'
          : ad.content;

        message += `📝 *E\'lon:* ${preview}\n`;
        message += `📊 *Holat:* ${job.status}\n`;
        message += `✅ *Yuborildi:* ${stats.postedGroups}/${stats.totalGroups}\n`;
        message += `❌ *Xatolik:* ${stats.failedGroups}\n`;
        message += `⏭️ *O\'tkazildi:* ${stats.skippedGroups}\n`;
        message += `🔄 *Roundlar:* ${stats.roundsCompleted}\n`;
        message += `⏱️ *Vaqt:* ${Math.floor(stats.duration / 1000)}s\n`;
        message += `📈 *Muvaffaqiyat:* ${stats.successRate.toFixed(1)}%\n\n`;
      }

      ctx.reply(message, {
        parse_mode: 'Markdown',
        ...this.getMainMenu(),
      });
    });

    // Delete ad button
    this.bot.hears(/🗑 E'lon o'chirish/, (ctx) => {
      const userId = ctx.from?.id;

      if (!userId) return;

      const userAds = this.ads.filter((ad) => ad.userId === userId && !ad.isPosting);

      if (userAds.length === 0) {
        ctx.reply(
          '🗑 *E\'lon o\'chirish*\n\n' +
          '🔍 Sizda hech qanday e\'lon yo\'q yoki tarqatilmoqda.',
          {
            parse_mode: 'Markdown',
            ...this.getMainMenu(),
          }
        );
        return;
      }

      let message = '🗑 *E\'lon o\'chirish*\n\n';
      message += '📝 O\'chirmoqchi bo\'lgan e\'loningiz raqamini yuboring:\n\n';

      userAds.forEach((ad, index) => {
        const originalIndex = this.ads.findIndex(a => a.id === ad.id);
        const preview = ad.content.length > 40
          ? ad.content.substring(0, 40) + '...'
          : ad.content;
        message += `/${originalIndex + 1} - ${preview}\n\n`;
      });

      this.awaitingAdCreation.add(userId);

      ctx.reply(message, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('❌ Bekor qilish', 'cancel_delete')],
        ]),
      });
    });

    // Help button
    this.bot.hears(/📚 Yordam/, (ctx) => {
      ctx.reply(
        '📚 *Yordam*\n\n' +
        '🤖 Bu bot - reklama e\'lonlarini boshqarish uchun mo\'ljallangan.\n\n' +
        '🔹 *Qanday ishlaydi:*\n' +
        '1. "✍️ E\'lon yaratish" tugmasini bosing\n' +
        '2. E\'lon matnini yuboring (misol: Плошатка керак...)\n' +
        '3. "🚀 Tarqatishni boshlash" tugmasini bosing\n' +
        '4. E\'lon raqamini yuboring\n\n' +
        '⚙️ *Multi-Session:*\n' +
        '• Barcha ulangan sessionlardagi guruhlarga tarqatadi\n' +
        '• Guruhlar orasida: 0.5-5 soniya random\n' +
        '• Roundlar orasida: 5-15 daqiqa random\n' +
        '• Skip: 24 soat ichida yuborilgan guruhlar\n\n' +
        '📞 *Yordam:* Admin bilan bog\'laning',
        {
          parse_mode: 'Markdown',
          ...this.getMainMenu(),
        }
      );
    });

    // Cancel actions
    this.bot.action('cancel_session', (ctx) => {
      const userId = ctx.from?.id;
      if (userId) {
        this.pendingSessions.delete(userId);
      }
      ctx.answerCbQuery('Bekor qilindi');
      ctx.reply('❌ Session ulash bekor qilindi.', this.getMainMenu());
    });

    this.bot.action('cancel_create', (ctx) => {
      const userId = ctx.from?.id;
      if (userId) {
        this.awaitingAdCreation.delete(userId);
      }
      ctx.answerCbQuery('Bekor qilindi');
      ctx.reply('❌ E\'lon yaratish bekor qilindi.', this.getMainMenu());
    });

    this.bot.action('cancel_post_start', (ctx) => {
      const userId = ctx.from?.id;
      if (userId) {
        this.awaitingAdCreation.delete(userId);
      }
      ctx.answerCbQuery('Bekor qilindi');
      ctx.reply('❌ Tarqatish boshlash bekor qilindi.', this.getMainMenu());
    });

    this.bot.action('cancel_stop', (ctx) => {
      const userId = ctx.from?.id;
      if (userId) {
        this.awaitingAdCreation.delete(userId);
      }
      ctx.answerCbQuery('Bekor qilindi');
      ctx.reply('❌ To\'xtatish bekor qilindi.', this.getMainMenu());
    });

    this.bot.action('cancel_delete', (ctx) => {
      const userId = ctx.from?.id;
      if (userId) {
        this.awaitingAdCreation.delete(userId);
      }
      ctx.answerCbQuery('Bekor qilindi');
      ctx.reply('❌ E\'lon o\'chirish bekor qilindi.', this.getMainMenu());
    });

    // Back to main
    this.bot.action('back_to_main', (ctx) => {
      ctx.answerCbQuery();
      ctx.reply(
        '◀️ *Asosiy menyu*\n\n' +
        '👇 Quyidagi menudan kerakli bo\'limni tanlang:',
        {
          parse_mode: 'Markdown',
          ...this.getMainMenu(),
        }
      );
    });

    // Handle text messages
    this.bot.on(message('text'), async (ctx) => {
      const userId = ctx.from?.id;
      const text = ctx.message.text;

      if (!userId) return;

      // Check if user is creating a session
      const pendingSession = this.pendingSessions.get(userId);
      if (pendingSession) {
        await this.handleSessionCreation(ctx, pendingSession, text);
        return;
      }

      // Check if user is creating an ad
      if (this.awaitingAdCreation.has(userId)) {
        this.awaitingAdCreation.delete(userId);

        // Create new ad
        const newAd: Ad = {
          id: Date.now().toString(),
          userId,
          userName: ctx.from.first_name || 'Foydalanuvchi',
          content: text,
          createdAt: new Date(),
          isPosting: false,
        };

        this.ads.push(newAd);

        ctx.reply(
          '✅ *E\'lon muvaffaqiyatli saqlandi!*\n\n' +
          `📝 *E\'lon:*\n${text}\n\n` +
          `📊 *Jami e\'lonlar:* ${this.ads.filter((a) => a.userId === userId).length} ta\n\n` +
          '🚀 Tarqatishni boshlash uchun "🚀 Tarqatishni boshlash" tugmasini bosing.',
          {
            parse_mode: 'Markdown',
            ...this.getMainMenu(),
          }
        );
        return;
      }

      // Check if user is selecting an ad by number
      if (text.startsWith('/') && /^\d+$/.test(text.substring(1))) {
        const index = parseInt(text.substring(1)) - 1;

        if (index >= 0 && index < this.ads.length) {
          const ad = this.ads[index];

          // Check if this ad belongs to the user
          if (ad.userId !== userId) {
            ctx.reply(
              '❌ *Xatolik!*\n\n' +
              '🔍 Bu e\'lon sizga tegishli emas.',
              this.getMainMenu()
            );
            return;
          }

          ctx.reply(
            `📝 *Tanlangan e\'lon:*\n\n${ad.content}\n\n` +
            '👇 Quyidagi amallardan birini tanlang:',
            {
              parse_mode: 'Markdown',
              ...Markup.inlineKeyboard([
                [Markup.button.callback('🚀 Tarqatishni boshlash', `start_posting_${ad.id}`)],
                [Markup.button.callback('📊 Hisobot', `report_${ad.id}`)],
                ad.isPosting ? [Markup.button.callback('⏸ To\'xtatish', `stop_posting_${ad.id}`)] : [],
                !ad.isPosting ? [Markup.button.callback('🗑 O\'chirish', `delete_${ad.id}`)] : [],
                [Markup.button.callback('◀️ Orqaga', 'back_to_main')],
              ]),
            }
          );
        } else {
          ctx.reply(
            '❌ *Noto\'g\'ri raqam!*\n\n' +
            '👇 Iltimos, to\'g\'ri raqamni tanlang:',
            this.getMainMenu()
          );
        }
        return;
      }

      // Default response
      ctx.reply(
        '🤖 *Men sizga yordam bera olaman!*\n\n' +
        '👇 Quyidagi menudan kerakli bo\'limni tanlang:',
        {
          parse_mode: 'Markdown',
          ...this.getMainMenu(),
        }
      );
    });

    // Start posting callback
    this.bot.action(/start_posting_(.+)/, async (ctx) => {
      const adId = ctx.match[1];
      const ad = this.ads.find((a) => a.id === adId);

      if (!ad) {
        ctx.answerCbQuery('E\'lon topilmadi');
        return;
      }

      if (ad.isPosting) {
        ctx.answerCbQuery('Bu e\'lon allaqachon tarqatilmoqda');
        return;
      }

      try {
        ctx.answerCbQuery('🚀 Tarqatilmoqda...');

        // Start posting
        const job = await this.postingService.startPosting(
          ad.id,
          ad.content,
          ad.userId.toString()
        );

        // Update ad
        ad.isPosting = true;
        ad.postingJobId = job.id;

        const stats = this.postingService.getJobStats(job.id);

        ctx.reply(
          '✅ *Tarqatish boshlandi!*\n\n' +
          `📊 *Jami guruhlar:* ${stats?.totalGroups || 0}\n` +
          '⚙️ *Rejim:* Multi-session\n' +
          '⏱️ *Delay:* 0.5-5s (guruhlar orasida), 5-15min (roundlar orasida)\n\n' +
          '📈 Hisobotni ko\'rish uchun "📈 Hisobot" tugmasini bosing.\n' +
          '⏸ To\'xtatish uchun "⏸ Tarqatishni to\'xtatish" tugmasini bosing.',
          {
            parse_mode: 'Markdown',
            ...this.getMainMenu(),
          }
        );
      } catch (error) {
        ctx.reply(
          '❌ *Xatolik yuz berdi!*\n\n' +
          `🔴 ${error.message}\n\n` +
          '⚠️ Iltimos, sessionlarni tekshiring.',
          {
            parse_mode: 'Markdown',
            ...this.getMainMenu(),
          }
        );
      }
    });

    // Stop posting callback
    this.bot.action(/stop_posting_(.+)/, (ctx) => {
      const adId = ctx.match[1];
      const ad = this.ads.find((a) => a.id === adId);

      if (!ad || !ad.postingJobId) {
        ctx.answerCbQuery('E\'lon topilmadi');
        return;
      }

      ctx.answerCbQuery('⏸ To\'xtatilmoqda...');

      // Stop posting
      this.postingService.stopJob(ad.postingJobId);

      // Update ad
      ad.isPosting = false;

      const stats = this.postingService.getJobStats(ad.postingJobId);

      ctx.reply(
        '✅ *Tarqatish to\'xtatildi!*\n\n' +
        `📊 *Yuborildi:* ${stats?.postedGroups || 0}\n` +
        `❌ *Xatolik:* ${stats?.failedGroups || 0}\n` +
        `⏭️ *O\'tkazildi:* ${stats?.skippedGroups || 0}\n` +
        `🔄 *Roundlar:* ${stats?.roundsCompleted || 0}\n` +
        `⏱️ *Vaqt:* ${stats ? Math.floor(stats.duration / 1000) : 0}s\n` +
        `📈 *Muvaffaqiyat:* ${stats?.successRate.toFixed(1) || 0}%`,
        {
          parse_mode: 'Markdown',
          ...this.getMainMenu(),
        }
      );
    });

    // Report callback
    this.bot.action(/report_(.+)/, (ctx) => {
      const adId = ctx.match[1];
      const ad = this.ads.find((a) => a.id === adId);

      if (!ad || !ad.postingJobId) {
        ctx.answerCbQuery('Hisobot topilmadi');
        return;
      }

      const job = this.postingService.getJob(ad.postingJobId);
      if (!job) {
        ctx.answerCbQuery('Hisobot topilmadi');
        ctx.reply(
          '❌ Hisobot topilmadi.',
          this.getMainMenu()
        );
        return;
      }

      const stats = this.postingService.getJobStats(ad.postingJobId);
      if (!stats) {
        ctx.answerCbQuery('Hisobot topilmadi');
        return;
      }

      const logs = this.postingService.getJobLogs(ad.postingJobId);

      ctx.answerCbQuery();

      let message = '📈 *Tarqatish hisoboti*\n\n';
      message += `📝 *E\'lon:* ${ad.content.substring(0, 50)}...\n`;
      message += `📊 *Holat:* ${job.status}\n`;
      message += `✅ *Yuborildi:* ${stats.postedGroups}/${stats.totalGroups}\n`;
      message += `❌ *Xatolik:* ${stats.failedGroups}\n`;
      message += `⏭️ *O\'tkazildi:* ${stats.skippedGroups}\n`;
      message += `🔄 *Roundlar:* ${stats.roundsCompleted}\n`;
      message += `⏱️ *Vaqt:* ${Math.floor(stats.duration / 1000)}s\n`;
      message += `📈 *Muvaffaqiyat:* ${stats.successRate.toFixed(1)}%\n\n`;

      if (logs.length > 0) {
        message += '*📋 Oxirgi yuborishlar:*\n';
        const recentLogs = logs.slice(-5);
        for (const log of recentLogs) {
          const emoji = log.status === 'success' ? '✅' : log.status === 'failed' ? '❌' : '⏭️';
          message += `${emoji} ${log.groupName}\n`;
          if (log.reason) message += `   (${log.reason})\n`;
        }
      }

      ctx.reply(message, {
        parse_mode: 'Markdown',
        ...this.getMainMenu(),
      });
    });

    // Delete ad callback
    this.bot.action(/delete_(.+)/, (ctx) => {
      const adId = ctx.match[1];
      const adIndex = this.ads.findIndex((a) => a.id === adId);

      if (adIndex === -1) {
        ctx.answerCbQuery('E\'lon topilmadi');
        return;
      }

      const ad = this.ads[adIndex];
      if (ad.isPosting) {
        ctx.answerCbQuery('Tarqatilmoqda bo\'lgan e\'lonni o\'chirib bo\'lmaydi');
        return;
      }

      this.ads.splice(adIndex, 1);

      ctx.answerCbQuery('E\'lon o\'chirildi');

      ctx.reply(
        '✅ *E\'lon muvaffaqiyatli o\'chirildi!*\n\n' +
        `📊 *Qolgan e\'lonlar:* ${this.ads.filter((a) => a.userId === ctx.from?.id).length} ta`,
        {
          parse_mode: 'Markdown',
          ...this.getMainMenu(),
        }
      );
    });

    // Handle generic callback queries
    this.bot.on('callback_query', (ctx) => {
      if (!('data' in ctx.callbackQuery) || !ctx.callbackQuery.data) {
        ctx.answerCbQuery('⚠️ Bu funksiya hozircha ishlamaydi');
      }
    });
  }

  /**
   * Handle session creation steps
   */
  private async handleSessionCreation(
    ctx: any,
    pending: SessionCreation,
    text: string,
  ): Promise<void> {
    const userId = ctx.from?.id;
    if (!userId) return;

    try {
      switch (pending.step) {
        case 'phone':
          // Validate phone number
          const phone = text.replace(/\D/g, '');
          if (phone.length < 10) {
            ctx.reply(
              '❌ *Noto\'g\'ri telefon raqami!*\n\n' +
              '📝 Iltimos, to\'g\'ri formatda yuboring:\n' +
              '• `998901234567`\n' +
              '• `+998901234567`\n' +
              '• `998 90 123 45 67`',
              { parse_mode: 'Markdown' }
            );
            return;
          }

          // Request code
          ctx.reply(
            '📱 *Kod yuborildi!*\n\n' +
            '🔐 Telegramdan kelgan kodni yuboring:\n\n' +
            '⏳ Kodni kutmoqda...',
            {
              parse_mode: 'Markdown',
              ...Markup.inlineKeyboard([
                [Markup.button.callback('❌ Bekor qilish', 'cancel_session')],
              ]),
            }
          );

          // Update pending session
          this.pendingSessions.set(userId, {
            ...pending,
            step: 'code',
            phone,
            phoneCodeHash: 'temp_hash', // This would come from actual Telegram API
          });

          // Note: In real implementation, you would call TelegramService.authorizeSession here
          this.logger.log(`Session creation started for phone: ${phone}`);
          break;

        case 'code':
          ctx.reply(
            '✅ *Session muvaffaqiyatli ulandi!*\n\n' +
            '🔐 Session saqlandi.\n\n' +
            '⚠️ *Eslatma:* Database yo\'qligi sababli, session test rejimda saqlanadi.\n\n' +
            '📋 Sessionlarni ko\'rish uchun "📋 Mening sessionlarim" tugmasini bosing.',
            {
              parse_mode: 'Markdown',
              ...this.getMainMenu(),
            }
          );

          // Clear pending session
          this.pendingSessions.delete(userId);

          // Note: In real implementation, you would call TelegramService.verifyCode here
          this.logger.log(`Session created for user ${userId}`);
          break;

        default:
          this.pendingSessions.delete(userId);
          ctx.reply('❌ Xatolik yuz berdi. Qayta urinib ko\'ring.', this.getMainMenu());
      }
    } catch (error) {
      this.pendingSessions.delete(userId);
      ctx.reply(
        '❌ *Xatolik yuz berdi!*\n\n' +
        `🔴 ${error.message}\n\n` +
        '⚠️ Iltimos, qayta urinib ko\'ring.',
        {
          parse_mode: 'Markdown',
          ...this.getMainMenu(),
        }
      );
    }
  }
}
