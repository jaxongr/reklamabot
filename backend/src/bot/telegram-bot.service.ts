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
import { LocationsService } from '../locations/locations.service';
import { appLoginCodes } from '../auth/app-login-codes';
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
  step: 'select_ad' | 'select_sessions';
  adId?: string;
  selectedSessions?: string[];
  mode?: 'normal' | 'safe'; // normal = oddiy rejim, safe = himoyalangan rejim
}

interface DriverRegistration {
  step: 'fullName' | 'phone' | 'vehicleType' | 'vehicleCapacity' | 'licensePhoto' | 'vehiclePassport' | 'otp';
  fullName?: string;
  phone?: string;
  vehicleType?: string;
  vehicleCapacity?: string;
  licensePhotoUrl?: string;
  vehiclePassportUrl?: string;
}

interface AdCloseFlow {
  step: 'select_ad' | 'confirm_or_edit' | 'editing' | 'amount' | 'cargo_from' | 'cargo_to' | 'cargo_type' | 'cargo_weight' | 'vehicle_type';
  adId?: string;
  editedContent?: string;
  closedAmount?: number;
  cargoFrom?: string;
  cargoTo?: string;
  cargoType?: string;
  cargoWeight?: number;
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
  private pendingRegistrations = new Set<string>(); // telegramId lar
  private adCloseFlows = new Map<number, AdCloseFlow>();
  private postingFlows = new Map<number, PostingState>();
  private driverRegistrations = new Map<number, DriverRegistration>();

  // Mobile app login kodlari — alohida modulda (circular dependency oldini olish)

  constructor(
    private readonly config: ConfigService,
    private readonly postingService: PostingService,
    private readonly telegramService: TelegramService,
    private readonly prisma: PrismaService,
    private readonly systemConfig: SystemConfigService,
    private readonly paymentsService: PaymentsService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly locationsService: LocationsService,
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

      // Mini App menu tugmasini sozlash (launch dan oldin)
      const miniAppUrl = this.getMiniAppUrl();
      if (miniAppUrl) {
        try {
          await this.bot.telegram.setChatMenuButton({
            menuButton: {
              type: 'web_app',
              text: 'Mini App',
              web_app: { url: miniAppUrl },
            },
          });
          this.logger.log(`Mini App menu button sozlandi: ${miniAppUrl}`);
        } catch (e) {
          this.logger.warn(`Mini App menu button sozlanmadi: ${(e as any).message}`);
        }
      }

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

  private getMainMenu(isMaster: boolean = false) {
    if (isMaster) {
      return Markup.keyboard([
        ['✍️ E\'lon yaratish', '📊 Mening e\'lonlarim'],
        ['👥 Tarqatish', '🛡️ Xavfsiz tarqatish'],
        ['👥 Tobe\'larim', '📈 Hisobot'],
        ['🛑 To\'xtatish', '🔒 E\'lon yopish'],
        ['💳 Obuna', '📚 Yordam'],
      ]).resize();
    }
    // Tobe menyu
    return Markup.keyboard([
      ['📱 Session ulash', '📋 Sessionlarim'],
      ['📈 Hisobot', '📚 Yordam'],
    ]).resize();
  }

  /** User master ekanligini tekshirish */
  private async isUserMaster(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isMaster: true },
    });
    return user?.isMaster || false;
  }

  /** User uchun to'g'ri menyu qaytarish */
  private async getMenuForUser(internalUserId: string) {
    const isMaster = await this.isUserMaster(internalUserId);
    return this.getMainMenu(isMaster);
  }

  /** ctx dan foydalanuvchi menyusini qaytarish (tez helper) */
  private async getMenuFromCtx(ctx: any) {
    const tgId = ctx.from?.id?.toString();
    if (!tgId) return this.getMainMenu(false);
    const user = await this.prisma.user.findUnique({
      where: { telegramId: tgId },
      select: { isMaster: true, masterId: true },
    });
    return this.getMainMenu(user?.isMaster && !user?.masterId);
  }

  private getMiniAppUrl(): string | null {
    const url = this.config.get<string>('MINI_APP_URL');
    return url || null;
  }

  private getExpiredMenu() {
    return Markup.keyboard([
      ['💳 Obuna'],
      ['📚 Yordam'],
    ]).resize();
  }

  private getContactRequestKeyboard() {
    return Markup.keyboard([
      [Markup.button.contactRequest('📱 Telefon raqamni ulashish')],
    ]).oneTime().resize();
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
        const refCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        user = await this.prisma.user.create({
          data: {
            telegramId: tgId,
            firstName: ctx.from.first_name,
            lastName: ctx.from.last_name,
            username: ctx.from.username,
            isMaster: true,
            refCode,
          },
          include: { subscription: true },
        });
        this.logger.log(`Yangi foydalanuvchi yaratildi (auto-master): ${tgId}`);
      }

      // Eski userlar migratsiyasi: isMaster=false, masterId=null → auto-master qilish
      if (user && !user.isMaster && !user.masterId && !user.refCode) {
        const newRefCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { isMaster: true, refCode: newRefCode },
          include: { subscription: true },
        });
        this.logger.log(`Eski user auto-master qilindi: ${tgId}`);
      }

      // Mavjud foydalanuvchilar migratsiyasi: sessioni yoki e'loni bor → auto-register
      if (user && !user.isRegistered) {
        const hasActivity =
          (await this.prisma.session.count({ where: { userId: user.id } })) > 0 ||
          (await this.prisma.ad.count({ where: { userId: user.id } })) > 0;
        if (hasActivity) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: { isRegistered: true, registeredAt: user.createdAt },
            include: { subscription: true },
          });
        }
      }

      return user;
    } catch (error) {
      this.logger.error(`Foydalanuvchi olishda xatolik: ${error.message}`);
      return null;
    }
  }

  /**
   * Trial yoki obuna tekshirish
   */
  private async checkAccess(user: any): Promise<{ allowed: boolean; reason?: string }> {
    // Admin/Super Admin — har doim ruxsat
    if (['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
      return { allowed: true };
    }

    // Faol obuna bormi? (o'zida)
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId: user.id, status: 'ACTIVE', endDate: { gt: new Date() } },
    });
    if (subscription) return { allowed: true };

    // Tobe bo'lsa — master obunasini tekshirish
    if (user.masterId) {
      const masterSub = await this.prisma.subscription.findFirst({
        where: { userId: user.masterId, status: 'ACTIVE', endDate: { gt: new Date() } },
      });
      if (masterSub) return { allowed: true };
    }

    // Trial: registeredAt dan 4 soat o'tganmi?
    if (user.registeredAt) {
      const trialEnd = new Date(new Date(user.registeredAt).getTime() + 4 * 60 * 60 * 1000);
      if (new Date() < trialEnd) {
        return { allowed: true };
      }
    }

    return { allowed: false, reason: 'trial_expired' };
  }

  /**
   * Foydalanuvchini olish + ro'yxatdan o'tganini va access tekshirish
   * Feature handlerlardan chaqiriladi. null qaytsa → handler to'xtaydi
   */
  private async getUserWithAccess(ctx: any) {
    const user = await this.getOrCreateUser(ctx);
    if (!user) return null;

    if (!user.isRegistered) {
      this.pendingRegistrations.add(ctx.from.id.toString());
      await ctx.reply(
        '⚠️ Avval ro\'yxatdan o\'ting!\n\nTelefon raqamingizni ulashing:',
        this.getContactRequestKeyboard(),
      );
      return null;
    }

    const access = await this.checkAccess(user);
    if (!access.allowed) {
      await ctx.reply(
        '⏰ *Bepul sinov muddati tugadi!*\n\n' +
        'Botdan foydalanishni davom ettirish uchun obuna sotib oling.',
        { parse_mode: 'Markdown', ...this.getExpiredMenu() },
      );
      return null;
    }

    return user;
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
      const startPayload = (ctx as any).startPayload || '';

      // ===== App login — avtomatik kod berish =====
      if (startPayload && startPayload.startsWith('app')) {
        const telegramId = ctx.from.id.toString();
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        appLoginCodes.set(code, { telegramId, expiresAt: Date.now() + 5 * 60 * 1000 });

        const isDriver = startPayload.includes('driver');
        const roleText = isDriver ? 'Haydovchi' : 'Dispetcher';
        const roleIcon = isDriver ? '🚛' : '📦';

        await ctx.reply(
          `${roleIcon} *${roleText} ilovasiga kirish*\n\n` +
          `🆔 Telegram ID: \`${telegramId}\`\n` +
          `🔑 Login kod: \`${code}\`\n\n` +
          `📱 Ilovada "${roleText}" ni tanlang va kirish uchun ID va kodni kiriting.\n\n` +
          '⏰ Kod 5 daqiqa amal qiladi.',
          { parse_mode: 'Markdown' },
        );
        this.logger.log(`App login kod yaratildi (${roleText}): ${telegramId}`);
        return;
      }

      // ===== Referal orqali tobe bo'lib ulash =====
      if (startPayload && startPayload.startsWith('ref_')) {
        const refCode = startPayload.replace('ref_', '');
        await this.handleRefLink(ctx, refCode);
        return;
      }

      const user = await this.getOrCreateUser(ctx);
      if (!user) return;

      // Ro'yxatdan o'tmagan → telefon so'rash
      if (!user.isRegistered) {
        this.pendingRegistrations.add(ctx.from.id.toString());
        await ctx.reply(
          '👋 *Assalomu alaykum!*\n\n' +
          '🤖 *Reklama Bot* ga xush kelibsiz!\n\n' +
          '📲 Botdan foydalanish uchun telefon raqamingizni ulashing:',
          { parse_mode: 'Markdown', ...this.getContactRequestKeyboard() },
        );
        return;
      }

      // Ro'yxatdan o'tgan → access tekshirish
      const access = await this.checkAccess(user);
      if (!access.allowed) {
        await ctx.reply(
          '👋 *Assalomu alaykum!*\n\n' +
          '⏰ *Bepul sinov muddati tugadi!*\n\n' +
          'Botdan foydalanishni davom ettirish uchun obuna sotib oling.',
          { parse_mode: 'Markdown', ...this.getExpiredMenu() },
        );
        return;
      }

      const menu = await this.getMenuForUser(user.id);

      if ((user as any).isMaster) {
        // Master panel
        const tobes = await this.prisma.user.findMany({
          where: { masterId: user.id },
          include: {
            sessions: { where: { status: 'ACTIVE', sessionString: { not: null } } },
          },
        });
        const readyTobes = tobes.filter(t => t.sessions.length > 0);
        const botInfo = await this.bot.telegram.getMe();
        const refLink = `https://t.me/${botInfo.username}?start=ref_${(user as any).refCode}`;

        await ctx.reply(
          '👑 *MASTER PANEL*\n\n' +
          `👥 Tobe'lar: ${readyTobes.length}/${tobes.length} tayyor\n\n` +
          `📎 *Referal havola:*\n\`${refLink}\`\n\n` +
          'Tobe\'larga yuborib, ular session ulaydi.\n' +
          '👥 Tarqatish — tobe\'lar orqali tarqatish\n\n' +
          '👇 Quyidagi menudan tanlang:',
          { parse_mode: 'Markdown', ...menu },
        );

        // Mini App inline tugma
        const miniAppUrl = this.getMiniAppUrl();
        if (miniAppUrl) {
          await ctx.reply('📱 Mini App orqali buyurtmalarni kuzating:', {
            reply_markup: {
              inline_keyboard: [[
                { text: '📱 Mini App ochish', web_app: { url: miniAppUrl } },
              ]],
            },
          });
        }
      } else {
        // Tobe panel
        await ctx.reply(
          '👋 *Assalomu alaykum!*\n\n' +
          '🤖 *Reklama Bot* ga xush kelibsiz!\n\n' +
          '📝 *Sizning vazifalingiz:*\n' +
          '• 📱 Session ulash\n' +
          '• 📋 Sessionlarni boshqarish\n\n' +
          'Master xabar yuborganda avtomatik tarqatiladi!\n\n' +
          '👇 Quyidagi menudan tanlang:',
          { parse_mode: 'Markdown', ...menu },
        );
      }
    });

    // ========== 📲 /app — MOBILE APP LOGIN KODI ==========
    this.bot.command('app', async (ctx) => {
      try {
        const telegramId = ctx.from.id.toString();

        // 6 raqamli kod generatsiya
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // 5 daqiqa amal muddati
        appLoginCodes.set(code, {
          telegramId,
          expiresAt: Date.now() + 5 * 60 * 1000,
        });

        // Eskirgan kodlarni tozalash
        for (const [k, v] of appLoginCodes) {
          if (v.expiresAt < Date.now()) {
            appLoginCodes.delete(k);
          }
        }

        await ctx.reply(
          '📲 *Mobile ilovaga kirish*\n\n' +
          `🆔 Telegram ID: \`${telegramId}\`\n` +
          `🔑 Login kod: \`${code}\`\n\n` +
          '📱 Ilovada:\n' +
          '1. *Telegram ID* maydoniga ID ni kiriting\n' +
          '2. *Auth ma\'lumot* maydoniga kodni kiriting\n\n' +
          '⏰ Kod 5 daqiqa amal qiladi.',
          { parse_mode: 'Markdown' },
        );

        this.logger.log(`App login kod yaratildi: ${telegramId}`);
      } catch (error) {
        this.logger.error('App login kod xatolik:', error);
        await ctx.reply('❌ Xatolik yuz berdi. Qayta urinib ko\'ring.');
      }
    });

    // ========== 📱 /miniapp — MINI APP OCHISH ==========
    this.bot.command('miniapp', async (ctx) => {
      const miniAppUrl = this.getMiniAppUrl();
      if (!miniAppUrl) {
        await ctx.reply('❌ Mini App hozircha sozlanmagan.');
        return;
      }
      await ctx.reply('📱 *Mini App*\n\nBuyurtmalar, balans va profilni ko\'ring:', {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '📱 Mini App ochish', web_app: { url: miniAppUrl } },
          ]],
        },
      });
    });

    // ========== 🚛 /haydovchi — HAYDOVCHI RO'YXATDAN O'TISH ==========
    this.bot.command('haydovchi', async (ctx) => {
      try {
        const telegramId = ctx.from.id.toString();
        const chatId = ctx.chat.id;

        // Allaqachon haydovchi ekanligini tekshirish
        const existingUser = await this.prisma.user.findUnique({
          where: { telegramId },
          include: { driverProfile: true },
        });

        if (existingUser?.driverProfile) {
          // Allaqachon ro'yxatdan o'tgan — login kod berish
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          appLoginCodes.set(code, {
            telegramId,
            expiresAt: Date.now() + 5 * 60 * 1000,
          });
          await ctx.reply(
            '✅ *Siz allaqachon haydovchi sifatida ro\'yxatdan o\'tgansiz!*\n\n' +
            `🆔 Telegram ID: \`${telegramId}\`\n` +
            `🔑 Login kod: \`${code}\`\n\n` +
            '📱 Ilovada "Haydovchi" ni tanlang va kirish uchun ID va kodni kiriting.\n\n' +
            '⏰ Kod 5 daqiqa amal qiladi.',
            { parse_mode: 'Markdown' },
          );
          return;
        }

        // Yangi ro'yxatdan o'tish flow boshlash
        this.driverRegistrations.set(chatId, { step: 'fullName' });

        await ctx.reply(
          '🚛 *Haydovchi sifatida ro\'yxatdan o\'tish*\n\n' +
          '📝 To\'liq ismingizni kiriting (Familiya Ism):',
          { parse_mode: 'Markdown' },
        );
      } catch (error) {
        this.logger.error('Haydovchi buyrug\'i xatolik:', error);
        await ctx.reply('❌ Xatolik yuz berdi. Qayta urinib ko\'ring.');
      }
    });

    // ========== 📋 /takliflar — HAYDOVCHI TAKLIFLARI ==========
    this.bot.command('takliflar', async (ctx) => {
      try {
        const offers = await this.prisma.driverOffer.findMany({
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            driverProfile: { select: { fullName: true, vehicleType: true, vehicleCapacity: true, isVerified: true, phone: true } },
          },
        });

        if (offers.length === 0) {
          await ctx.reply('📋 Hozircha haydovchi takliflari yo\'q.');
          return;
        }

        let text = '📋 *Oxirgi haydovchi takliflari:*\n\n';
        for (const offer of offers) {
          const name = offer.driverProfile?.fullName || 'Noma\'lum';
          const verified = offer.driverProfile?.isVerified ? '✅' : '';
          text += `🚛 *${offer.fromCity} → ${offer.toCity}* ${verified}\n`;
          text += `👤 ${name} | ${offer.vehicleType}`;
          if (offer.vehicleCapacity) text += ` | ${offer.vehicleCapacity}`;
          text += '\n';
          if (offer.price) text += `💰 ${offer.price}\n`;
          text += `📞 ${offer.phone}\n`;
          if (offer.description) text += `📝 ${offer.description}\n`;
          text += '\n';
        }

        await ctx.reply(text, { parse_mode: 'Markdown' });
      } catch (error) {
        this.logger.error('Takliflar buyrug\'i xatolik:', error);
        await ctx.reply('❌ Xatolik yuz berdi.');
      }
    });

    // ========== 📱 KONTAKT (RO'YXATDAN O'TISH) ==========
    this.bot.on(message('contact'), async (ctx) => {
      const contact = ctx.message.contact;
      const telegramId = ctx.from.id.toString();

      // Xavfsizlik: faqat o'z kontaktini qabul qilish
      if (contact.user_id?.toString() !== telegramId) {
        await ctx.reply('⚠️ Faqat o\'z telefon raqamingizni ulashishingiz mumkin!');
        return;
      }

      // Agar subscription flow da bo'lsa — contact handler emas, text handler ishlaydi
      // Registration uchun tekshirish
      try {
        const user = await this.prisma.user.findUnique({ where: { telegramId } });
        if (!user) {
          await ctx.reply('❌ Xatolik yuz berdi. /start bosing.');
          return;
        }

        if (user.isRegistered) {
          // Allaqachon ro'yxatdan o'tgan
          const access = await this.checkAccess(user);
          if (access.allowed) {
            await ctx.reply('✅ Siz allaqachon ro\'yxatdan o\'tgansiz!', await this.getMenuFromCtx(ctx));
          } else {
            await ctx.reply(
              '⏰ *Bepul sinov muddati tugadi!*\n\nObuna sotib oling.',
              { parse_mode: 'Markdown', ...this.getExpiredMenu() },
            );
          }
          return;
        }

        // DB yangilash — ro'yxatdan o'tkazish
        await this.prisma.user.update({
          where: { telegramId },
          data: {
            phoneNumber: contact.phone_number,
            isRegistered: true,
            registeredAt: new Date(),
          },
        });

        this.pendingRegistrations.delete(telegramId);

        // Ro'yxatdan o'tgan user uchun to'g'ri menyu
        const updatedUser = await this.prisma.user.findUnique({ where: { telegramId } });
        const regMenu = updatedUser ? await this.getMenuForUser(updatedUser.id) : await this.getMenuFromCtx(ctx);

        let regMsg = '✅ *Ro\'yxatdan o\'tdingiz!*\n\n' +
          '🎉 4 soat bepul foydalanishingiz mumkin.\n\n';

        if (updatedUser && (updatedUser as any).isMaster && (updatedUser as any).refCode) {
          const botInfo = await this.bot.telegram.getMe();
          const refLink = `https://t.me/${botInfo.username}?start=ref_${(updatedUser as any).refCode}`;
          regMsg += `📎 *Referal havola:*\n\`${refLink}\`\n\n`;
        }

        regMsg += '👇 Quyidagi menudan tanlang:';

        await ctx.reply(regMsg, { parse_mode: 'Markdown', ...regMenu });
      } catch (error) {
        this.logger.error(`Kontakt saqlashda xatolik: ${error.message}`);
        await ctx.reply('❌ Xatolik yuz berdi. Qayta urinib ko\'ring.');
      }
    });

    // ========== 📱 SESSION ULASH ==========
    this.bot.hears(/📱 Session ulash/, async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) return;

      const user = await this.getUserWithAccess(ctx);
      if (!user) return;

      // Master session ulay olmaydi
      if ((user as any).isMaster && !(user as any).masterId) {
        const menu = await this.getMenuForUser(user.id);
        await ctx.reply('❌ Master session ulay olmaydi.\nTobe\'laringiz session ulaydi.', menu);
        return;
      }

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

    // ========== 📋 SESSIONLARIM (tobe o'z sessionlari) ==========
    this.bot.hears(/📋 (Mening sessionlarim|Sessionlarim)/, async (ctx) => {
      const user = await this.getUserWithAccess(ctx);
      if (!user) return;

      try {
        const sessions = await this.telegramService.getUserSessions(user.id);

        if (sessions.length === 0) {
          const menu = await this.getMenuForUser(user.id);
          ctx.reply(
            '📋 *Sessionlarim*\n\n' +
            '🔍 Sizda hech qanday session yo\'q.\n\n' +
            '💡 "📱 Session ulash" tugmasini bosing.',
            { parse_mode: 'Markdown', ...menu },
          );
          return;
        }

        let msg = '📋 *Sessionlarim*\n\n';

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
        ctx.reply('❌ Xatolik yuz berdi.', await this.getMenuFromCtx(ctx));
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
          { parse_mode: 'Markdown', ...await this.getMenuFromCtx(ctx) },
        );
      } catch (error) {
        ctx.reply(`❌ Sinxronlashda xatolik: ${error.message}`, await this.getMenuFromCtx(ctx));
      }
    });

    this.bot.action(/disconnect_(.+)/, async (ctx) => {
      const sessionId = ctx.match[1];
      ctx.answerCbQuery('🔌 Uzilmoqda...');

      try {
        await this.telegramService.disconnectSession(sessionId);
        ctx.reply('✅ Session uzildi.', await this.getMenuFromCtx(ctx));
      } catch (error) {
        ctx.reply(`❌ Xatolik: ${error.message}`, await this.getMenuFromCtx(ctx));
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
          { parse_mode: 'Markdown', ...await this.getMenuFromCtx(ctx) },
        );
      } catch (error) {
        ctx.reply(`❌ Ulashda xatolik: ${error.message}`, await this.getMenuFromCtx(ctx));
      }
    });

    this.bot.action(/delete_session_(.+)/, async (ctx) => {
      const sessionId = ctx.match[1];
      ctx.answerCbQuery("O'chirilmoqda...");

      try {
        await this.telegramService.deleteSession(sessionId);
        ctx.reply("✅ Session o'chirildi.", await this.getMenuFromCtx(ctx));
      } catch (error) {
        ctx.reply(`❌ Xatolik: ${error.message}`, await this.getMenuFromCtx(ctx));
      }
    });

    // ========== ✍️ E'LON YARATISH ==========
    this.bot.hears(/✍️ E'lon yaratish/, async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) return;

      const user = await this.getUserWithAccess(ctx);
      if (!user) return;

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
      const user = await this.getUserWithAccess(ctx);
      if (!user) return;

      try {
        const ads = await this.prisma.ad.findMany({
          where: { userId: user.id, status: { notIn: ['ARCHIVED', 'CLOSED'] } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        });

        if (ads.length === 0) {
          ctx.reply(
            '📊 *Mening e\'lonlarim*\n\n🔍 E\'lon yo\'q.\n💡 "✍️ E\'lon yaratish" tugmasini bosing.',
            { parse_mode: 'Markdown', ...await this.getMenuFromCtx(ctx) },
          );
          return;
        }

        const isMasterUser = (user as any).isMaster && !(user as any).masterId;
        let msg = '📊 *Mening e\'lonlarim*\n\n';

        const buttons: any[][] = [];
        for (let i = 0; i < ads.length; i++) {
          const ad = ads[i];
          const adChars50 = Array.from(ad.content);
          const preview = adChars50.length > 50 ? adChars50.slice(0, 50).join('') + '...' : ad.content;
          const statusEmoji = ad.status === 'ACTIVE' ? '🟢' : ad.status === 'PAUSED' ? '⏸' : '📝';
          msg += `${i + 1}. ${statusEmoji} ${preview}\n`;
          msg += `   📅 ${new Date(ad.createdAt).toLocaleDateString('uz-UZ')}\n\n`;

          if (isMasterUser) {
            // Master — tobe'lar orqali tarqatish
            buttons.push([
              Markup.button.callback(`👥 Tarqat: #${i + 1}`, `master_broadcast_${ad.id}`),
              Markup.button.callback(`🛡️ Xavfsiz: #${i + 1}`, `master_safe_broadcast_${ad.id}`),
            ]);
            buttons.push([
              Markup.button.callback(`🗑 O'chir: #${i + 1}`, `del_ad_${ad.id}`),
            ]);
          } else {
            buttons.push([
              Markup.button.callback(`🚀 Tarqat: #${i + 1}`, `post_ad_${ad.id}`),
              Markup.button.callback(`🗑 O'chir: #${i + 1}`, `del_ad_${ad.id}`),
            ]);
          }
        }

        buttons.push([Markup.button.callback('◀️ Orqaga', 'back_to_main')]);

        ctx.reply(msg, {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard(buttons),
        });
      } catch (error) {
        ctx.reply('❌ Xatolik yuz berdi.', await this.getMenuFromCtx(ctx));
      }
    });

    // E'lon tanlanganda — session tanlash sahifasi (faqat tobe uchun)
    this.bot.action(/post_ad_(.+)/, async (ctx) => {
      const adId = ctx.match[1];
      const userId = ctx.from?.id;
      if (!userId) return;
      ctx.answerCbQuery();

      const user = await this.getUserWithAccess(ctx);
      if (!user) return;

      // Master o'z sessionlari yo'q — tobe'lar orqali tarqatish kerak
      if ((user as any).isMaster && !(user as any).masterId) {
        const menu = await this.getMenuForUser(user.id);
        await ctx.reply(
          '❌ Master o\'z sessionlari orqali yubora olmaydi.\n' +
          '"👥 Tarqatish" yoki "🛡️ Xavfsiz tarqatish" tugmasini ishlating.',
          menu,
        );
        return;
      }

      try {
        const ad = await this.prisma.ad.findUnique({ where: { id: adId } });
        if (!ad) {
          ctx.reply('❌ E\'lon topilmadi.', await this.getMenuFromCtx(ctx));
          return;
        }

        // Foydalanuvchi sessionlarini ko'rsatish
        const sessions = await this.prisma.session.findMany({
          where: { userId: user.id, status: 'ACTIVE', sessionString: { not: null } },
          include: { _count: { select: { groups: true } } },
        });

        if (sessions.length === 0) {
          ctx.reply('❌ Faol session topilmadi. Avval session ulang.', await this.getMenuFromCtx(ctx));
          return;
        }

        // PostingFlow ni boshlash — default hammasi tanlangan
        this.postingFlows.set(userId, {
          step: 'select_sessions',
          adId,
          selectedSessions: sessions.map(s => s.id),
        });

        let msg = '📱 *Session tanlang:*\n\n';
        msg += '✅ Barcha sessionlar tanlangan. Alohida tanlash uchun bosilg:\n\n';

        const buttons: any[][] = [];

        // Hammasi tanlangan holda
        buttons.push([Markup.button.callback('🔄 Barcha sessionlar ✅', `toggle_all_sessions`)]);

        for (const s of sessions) {
          const label = s.name || s.phone || s.id.slice(0, 8);
          const groupCount = (s as any)._count?.groups || 0;
          buttons.push([
            Markup.button.callback(`📱 ${label} (${groupCount} guruh) ✅`, `toggle_session_${s.id}`),
          ]);
        }

        buttons.push([Markup.button.callback('🚀 Oddiy tarqatish', `start_posting_confirm`)]);
        buttons.push([Markup.button.callback('🛡️ Himoyalangan', `start_safe_posting_confirm`)]);
        buttons.push([Markup.button.callback('◀️ Orqaga', 'back_to_main')]);

        try {
          await ctx.editMessageText(msg, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard(buttons),
          });
        } catch {
          await ctx.reply(msg, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard(buttons),
          }).catch(() => {});
        }
      } catch (error) {
        ctx.reply(`❌ Xatolik: ${error.message}`, await this.getMenuFromCtx(ctx));
      }
    });

    // Session toggle
    this.bot.action(/toggle_session_(.+)/, async (ctx) => {
      const sessionId = ctx.match[1];
      const userId = ctx.from?.id;
      if (!userId) return;
      ctx.answerCbQuery();

      const flow = this.postingFlows.get(userId);
      if (!flow || flow.step !== 'select_sessions') return;

      // Toggle
      const idx = flow.selectedSessions?.indexOf(sessionId) ?? -1;
      if (idx >= 0) {
        flow.selectedSessions!.splice(idx, 1);
      } else {
        flow.selectedSessions = flow.selectedSessions || [];
        flow.selectedSessions.push(sessionId);
      }

      // Qayta render
      await this.renderSessionSelection(ctx, userId);
    });

    // Barcha sessionlarni toggle
    this.bot.action('toggle_all_sessions', async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) return;
      ctx.answerCbQuery();

      const flow = this.postingFlows.get(userId);
      if (!flow || flow.step !== 'select_sessions') return;

      const user = await this.getOrCreateUser(ctx);
      if (!user) return;

      const sessions = await this.prisma.session.findMany({
        where: { userId: user.id, status: 'ACTIVE', sessionString: { not: null } },
      });

      // Agar hammasi tanlangan — hammasini olib tashlash; aks holda hammasini tanlash
      if (flow.selectedSessions?.length === sessions.length) {
        flow.selectedSessions = [];
      } else {
        flow.selectedSessions = sessions.map(s => s.id);
      }

      await this.renderSessionSelection(ctx, userId);
    });

    // Oddiy tarqatishni boshlash (session tanlangandan keyin)
    this.bot.action('start_posting_confirm', async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) return;
      ctx.answerCbQuery('🚀 Oddiy tarqatish boshlanmoqda...');

      const flow = this.postingFlows.get(userId);
      if (!flow || !flow.adId) {
        ctx.reply('❌ Xatolik. Qayta urinib ko\'ring.', await this.getMenuFromCtx(ctx));
        return;
      }

      if (!flow.selectedSessions || flow.selectedSessions.length === 0) {
        ctx.answerCbQuery('⚠️ Kamida 1 ta session tanlang!');
        return;
      }

      const user = await this.getUserWithAccess(ctx);
      if (!user) return;

      try {
        const ad = await this.prisma.ad.findUnique({ where: { id: flow.adId } });
        if (!ad) {
          ctx.reply('❌ E\'lon topilmadi.', await this.getMenuFromCtx(ctx));
          this.postingFlows.delete(userId);
          return;
        }

        const sessionIds = flow.selectedSessions.length > 0 ? flow.selectedSessions : undefined;
        const safeMode = flow.mode === 'safe';
        const job = await this.postingService.startPosting(ad.id, ad.content, user.id, sessionIds, safeMode);

        // E'lon statusini yangilash
        await this.prisma.ad.update({
          where: { id: flow.adId },
          data: { status: 'ACTIVE' },
        });

        this.postingFlows.delete(userId);

        // Live progress xabari yuborish
        const modeLabel = safeMode ? '🛡️ Himoyalangan' : '🚀 Oddiy';
        const chatId = ctx.chat?.id;
        if (chatId) {
          try { ctx.editMessageText(`${modeLabel} tarqatish boshlandi! Quyida live holat:`); } catch {}
          const statusMsg = await ctx.reply(this.formatPostingProgress(job.id));
          this.registerProgressCallback(job.id, chatId, statusMsg.message_id);
        }
        ctx.reply('👇 Asosiy menyu:', await this.getMenuFromCtx(ctx));
      } catch (error) {
        this.postingFlows.delete(userId);
        ctx.reply(`❌ Xatolik: ${error.message}`, await this.getMenuFromCtx(ctx));
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
        ctx.reply("✅ E'lon o'chirildi.", await this.getMenuFromCtx(ctx));
      } catch {
        ctx.reply('❌ Xatolik.', await this.getMenuFromCtx(ctx));
      }
    });

    // ========== 🚀 ODDIY TARQATISH — Eski handler ==========
    this.bot.hears(/🚀 Oddiy tarqatish/, async (ctx) => {
      const user = await this.getOrCreateUser(ctx);
      const menu = user ? await this.getMenuForUser(user.id) : await this.getMenuFromCtx(ctx);
      await ctx.reply('❌ Sizda bu funksiya yo\'q.', menu);
    });

    // ========== 🛡️ HIMOYALANGAN — Eski handler ==========
    this.bot.hears(/🛡️ Himoyalangan$/, async (ctx) => {
      const user = await this.getOrCreateUser(ctx);
      const menu = user ? await this.getMenuForUser(user.id) : await this.getMenuFromCtx(ctx);
      await ctx.reply('❌ Sizda bu funksiya yo\'q.', menu);
    });

    // Himoyalangan — e'lon tanlanganda session tanlash (faqat tobe uchun)
    this.bot.action(/safe_post_ad_(.+)/, async (ctx) => {
      const adId = ctx.match[1];
      const userId = ctx.from?.id;
      if (!userId) return;
      ctx.answerCbQuery();

      const user = await this.getUserWithAccess(ctx);
      if (!user) return;

      // Master o'z sessionlari yo'q
      if ((user as any).isMaster && !(user as any).masterId) {
        const menu = await this.getMenuForUser(user.id);
        await ctx.reply(
          '❌ Master o\'z sessionlari orqali yubora olmaydi.\n' +
          '"🛡️ Xavfsiz tarqatish" tugmasini ishlating.',
          menu,
        );
        return;
      }

      try {
        const ad = await this.prisma.ad.findUnique({ where: { id: adId } });
        if (!ad) {
          ctx.reply('❌ E\'lon topilmadi.', await this.getMenuFromCtx(ctx));
          return;
        }

        const sessions = await this.prisma.session.findMany({
          where: { userId: user.id, status: 'ACTIVE', sessionString: { not: null } },
          include: { _count: { select: { groups: true } } },
        });

        if (sessions.length === 0) {
          ctx.reply('❌ Faol session topilmadi.', await this.getMenuFromCtx(ctx));
          return;
        }

        // PostingFlow — safe mode
        this.postingFlows.set(userId, {
          step: 'select_sessions',
          adId,
          selectedSessions: sessions.map(s => s.id),
          mode: 'safe',
        });

        let msg = '🛡️ *Himoyalangan tarqatish*\n\n';
        msg += '📱 Barcha sessionlar tanlangan:\n\n';

        const buttons: any[][] = [];
        buttons.push([Markup.button.callback('🔄 Barcha sessionlar ✅', 'toggle_all_sessions')]);

        for (const s of sessions) {
          const label = s.name || s.phone || s.id.slice(0, 8);
          const groupCount = (s as any)._count?.groups || 0;
          buttons.push([
            Markup.button.callback(`📱 ${label} (${groupCount} guruh) ✅`, `toggle_session_${s.id}`),
          ]);
        }

        buttons.push([Markup.button.callback('🛡️ Himoyalangan boshlash', 'start_safe_posting_confirm')]);
        buttons.push([Markup.button.callback('◀️ Orqaga', 'back_to_main')]);

        try {
          await ctx.editMessageText(msg, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard(buttons),
          });
        } catch {
          await ctx.reply(msg, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard(buttons),
          }).catch(() => {});
        }
      } catch (error) {
        ctx.reply(`❌ Xatolik: ${error.message}`, await this.getMenuFromCtx(ctx));
      }
    });

    // Himoyalangan tarqatishni boshlash
    this.bot.action('start_safe_posting_confirm', async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) return;
      ctx.answerCbQuery('🛡️ Himoyalangan tarqatish boshlanmoqda...');

      const flow = this.postingFlows.get(userId);
      if (!flow || !flow.adId) {
        ctx.reply('❌ Xatolik. Qayta urinib ko\'ring.', await this.getMenuFromCtx(ctx));
        return;
      }

      if (!flow.selectedSessions || flow.selectedSessions.length === 0) {
        ctx.answerCbQuery('⚠️ Kamida 1 ta session tanlang!');
        return;
      }

      const user = await this.getUserWithAccess(ctx);
      if (!user) return;

      try {
        const ad = await this.prisma.ad.findUnique({ where: { id: flow.adId } });
        if (!ad) {
          ctx.reply('❌ E\'lon topilmadi.', await this.getMenuFromCtx(ctx));
          this.postingFlows.delete(userId);
          return;
        }

        const sessionIds = flow.selectedSessions.length > 0 ? flow.selectedSessions : undefined;
        const job = await this.postingService.startPosting(
          ad.id, ad.content, user.id, sessionIds, true,
        );

        await this.prisma.ad.update({
          where: { id: flow.adId },
          data: { status: 'ACTIVE' },
        });

        this.postingFlows.delete(userId);

        // Live progress xabari yuborish
        const chatId = ctx.chat?.id;
        if (chatId) {
          try { ctx.editMessageText('🛡️ Himoyalangan tarqatish boshlandi! Quyida live holat:'); } catch {}
          const statusMsg = await ctx.reply(this.formatPostingProgress(job.id));
          this.registerProgressCallback(job.id, chatId, statusMsg.message_id);
        }
        ctx.reply('👇 Asosiy menyu:', await this.getMenuFromCtx(ctx));
      } catch (error) {
        this.postingFlows.delete(userId);
        ctx.reply(`❌ Xatolik: ${error.message}`, await this.getMenuFromCtx(ctx));
      }
    });

    // ========== 🛑 TO'XTATISH (birlashtirilgan — master va tobe uchun) ==========
    this.bot.hears(/🛑 To'xtatish/, async (ctx) => {
      const user = await this.getUserWithAccess(ctx);
      if (!user) return;

      const menu = await this.getMenuForUser(user.id);

      if ((user as any).isMaster) {
        // Master — barcha tobe'larni + o'zini to'xtatish
        const stoppedCount = await this.postingService.stopAllSlaves(user.id);

        // O'z joblarini ham to'xtatish
        const ownJobs = this.postingService.getUserJobs(user.id);
        const activeOwnJobs = ownJobs.filter(j => j.status === 'running' || j.status === 'paused');
        for (const job of activeOwnJobs) {
          this.postingService.stopJob(job.id);
        }

        await ctx.reply(
          `🛑 *Barcha tarqatishlar to'xtatildi*\n\n` +
          `To'xtatilgan tobe'lar: ${stoppedCount} ta`,
          { parse_mode: 'Markdown', ...menu },
        );
      } else {
        // Tobe — faqat o'zini to'xtatish
        const jobs = this.postingService.getUserJobs(user.id);
        const activeJobs = jobs.filter(j => j.status === 'running' || j.status === 'paused');

        if (activeJobs.length === 0) {
          ctx.reply(
            '⏸ *To\'xtatish*\n\n🔍 Faol tarqatish yo\'q.',
            { parse_mode: 'Markdown', ...menu },
          );
          return;
        }

        for (const job of activeJobs) {
          this.postingService.stopJob(job.id);
        }

        await ctx.reply('🛑 To\'xtatildi', menu);
      }
    });

    // ========== 📈 HISOBOT ==========
    this.bot.hears(/📈 Hisobot/, async (ctx) => {
      const user = await this.getUserWithAccess(ctx);
      if (!user) return;

      // Session statistikasi
      const sessions = await this.telegramService.getUserSessions(user.id);
      const connectedCount = sessions.filter(s => this.telegramService.isClientConnected(s.id)).length;
      let totalGroupsCount = 0;
      sessions.forEach(s => { totalGroupsCount += s.totalGroups; });

      let msg = '📈 Hisobot\n\n';

      // Har bir session tafsiloti
      msg += '📱 Sessionlar:\n';
      for (const s of sessions) {
        const connected = this.telegramService.isClientConnected(s.id);
        const emoji = connected ? '🟢' : s.isFrozen ? '🔴' : '🟡';
        const name = s.name || s.phone || s.id.slice(0, 8);
        const groupCount = (s as any)._count?.groups || s.totalGroups || 0;
        const activeCount = s.activeGroups || 0;
        msg += `${emoji} ${name} — ${activeCount}/${groupCount} guruh`;
        if (s.isFrozen) msg += ' (Muzlatilgan)';
        msg += '\n';
      }
      msg += `\nJami: ${sessions.length} session, ${connectedCount} ulangan, ${totalGroupsCount} guruh\n`;

      // Barcha joblar (faol + tugagan)
      const jobs = this.postingService.getUserJobs(user.id);

      if (jobs.length > 0) {
        const runningJobs = jobs.filter(j => j.status === 'running' || j.status === 'paused');
        const completedJobs = jobs.filter(j => j.status === 'completed' || j.status === 'stopped');

        // Faol tarqatishlar — to'liq per-session statistika
        for (const job of runningJobs) {
          msg += '\n' + this.formatPostingProgress(job.id) + '\n';
        }

        if (completedJobs.length > 0) {
          msg += '\n📋 Oxirgi tarqatishlar:\n';
          const recent = completedJobs.slice(-5);
          for (const job of recent) {
            const stats = this.postingService.getJobStats(job.id);
            if (!stats) continue;
            const durationMin = Math.floor(stats.duration / 60000);
            const emoji = job.status === 'completed' ? '✅' : '⏹';
            msg += `${emoji} ${stats.postedGroups}/${stats.totalGroups} guruh`;
            msg += ` | ${stats.roundsCompleted} round`;
            msg += ` | ${durationMin} min`;
            msg += ` | ${stats.successRate.toFixed(0)}%\n`;
            // Per-session tafsilot
            for (const s of stats.perSessionStats) {
              msg += `   📱 ${s.name}: ✅${s.sent} ❌${s.failed} ⏭${s.skipped}\n`;
            }
          }
        }
      } else {
        msg += '\nTarqatish yo\'q.\n';
      }

      msg += '\n⏱ Oddiy: 0.3-6s, 5min | Himoyalangan: 1-15s, 10min';

      // Master uchun tobe hisoboti
      if ((user as any).isMaster) {
        const tobes = await this.prisma.user.findMany({
          where: { masterId: user.id },
          include: {
            sessions: {
              where: { status: 'ACTIVE', sessionString: { not: null } },
              include: { _count: { select: { groups: true } } },
            },
          },
        });
        const readyTobes = tobes.filter(t => t.sessions.length > 0);
        const activeSlaves = tobes.filter(t => this.postingService.isSlaveBroadcasting(t.id));
        const tobeGroups = readyTobes.reduce(
          (sum, t) => sum + t.sessions.reduce((s, sess) => s + ((sess as any)._count?.groups || 0), 0),
          0,
        );

        msg += `\n\n👑 MASTER HISOBOT\n`;
        msg += `👥 Tobe'lar: ${readyTobes.length}/${tobes.length} tayyor\n`;
        msg += `🟢 Hozir faol: ${activeSlaves.length}\n`;
        msg += `📋 Tobe guruhlar: ${tobeGroups}\n`;
        msg += `📎 Ref kod: ${(user as any).refCode || '—'}`;
      }

      const menu = await this.getMenuForUser(user.id);
      ctx.reply(msg, menu);
    });

    // ========== 💳 OBUNA ==========
    this.bot.hears(/💳 Obuna/, async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) return;
      this.clearUserState(userId);

      const user = await this.getOrCreateUser(ctx);
      if (!user) return;

      // Tobe obuna boshqara olmaydi
      if (!(user as any).isMaster && (user as any).masterId) {
        const menu = await this.getMenuForUser(user.id);
        await ctx.reply('❌ Obuna faqat masterlar tomonidan boshqariladi.', menu);
        return;
      }

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

    this.bot.action('cancel_subscription', async (ctx) => {
      const userId = ctx.from?.id;
      if (userId) this.subscriptionFlows.delete(userId);
      ctx.answerCbQuery('Bekor qilindi');
      ctx.editMessageText('❌ Obuna bekor qilindi.');
      ctx.reply('👇 Asosiy menyu:', await this.getMenuFromCtx(ctx));
    });

    // ========== 🔒 E'LON YOPISH ==========
    this.bot.hears(/🔒 E'lon yopish/, async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) return;

      const user = await this.getUserWithAccess(ctx);
      if (!user) return;

      this.clearUserState(userId);

      try {
        const ads = await this.prisma.ad.findMany({
          where: { userId: user.id, status: { in: ['ACTIVE', 'DRAFT', 'PAUSED'] } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        });

        if (ads.length === 0) {
          ctx.reply(
            '🔒 *E\'lon yopish*\n\n🔍 Yopiladigan e\'lon yo\'q.',
            { parse_mode: 'Markdown', ...await this.getMenuFromCtx(ctx) },
          );
          return;
        }

        let msg = '🔒 *Yopish uchun e\'lonni tanlang:*\n\n';
        const buttons: any[][] = [];

        for (let i = 0; i < ads.length; i++) {
          const ad = ads[i];
          // UTF-8 safe slicing — surrogate pair buzilmasligi uchun
          const chars = Array.from(ad.content);
          const preview = chars.length > 40 ? chars.slice(0, 40).join('') + '...' : ad.content;
          const statusEmoji = ad.status === 'ACTIVE' ? '🟢' : ad.status === 'PAUSED' ? '⏸' : '📝';
          msg += `${i + 1}. ${statusEmoji} ${preview}\n\n`;
          buttons.push([Markup.button.callback(`🔒 #${i + 1} — Yopish`, `close_ad_${ad.id}`)]);
        }
        buttons.push([Markup.button.callback('◀️ Orqaga', 'back_to_main')]);

        ctx.reply(msg, {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard(buttons),
        });
      } catch (error) {
        ctx.reply('❌ Xatolik yuz berdi.', await this.getMenuFromCtx(ctx));
      }
    });

    // E'lon tanlanganda — mazmuni va amallar ko'rsatish
    this.bot.action(/close_ad_(.+)/, async (ctx) => {
      const adId = ctx.match[1];
      const userId = ctx.from?.id;
      if (!userId) return;
      ctx.answerCbQuery();

      try {
        const ad = await this.prisma.ad.findUnique({ where: { id: adId } });
        if (!ad) {
          ctx.reply('❌ E\'lon topilmadi.', await this.getMenuFromCtx(ctx));
          return;
        }

        // UTF-8 safe slicing
        const chars = Array.from(ad.content);
        const preview = chars.length > 200 ? chars.slice(0, 200).join('') + '...' : ad.content;
        const dealCount = ad.soldQuantity || 0;

        const msgText = `📋 E'lon:\n\n${preview}\n\n` +
          `📅 Yaratilgan: ${new Date(ad.createdAt).toLocaleDateString('uz-UZ')}\n` +
          `📊 Holat: ${ad.status}\n` +
          (dealCount > 0 ? `🔒 Yopilgan yuklar: ${dealCount} ta\n\n` : '\n') +
          '👇 Amalni tanlang:';

        try {
          await ctx.editMessageText(msgText, {
            ...Markup.inlineKeyboard([
              [Markup.button.callback('🔒 Yuk yopish (yangi deal)', `close_confirm_${adId}`)],
              [Markup.button.callback('✏️ Tahrirlash', `edit_close_ad_${adId}`)],
              [Markup.button.callback('🗑 O\'chirish (arxivlash)', `delete_close_ad_${adId}`)],
              [Markup.button.callback('◀️ Orqaga', 'back_to_main')],
            ]),
          });
        } catch {
          await ctx.reply(msgText, {
            ...Markup.inlineKeyboard([
              [Markup.button.callback('🔒 Yuk yopish (yangi deal)', `close_confirm_${adId}`)],
              [Markup.button.callback('✏️ Tahrirlash', `edit_close_ad_${adId}`)],
              [Markup.button.callback('🗑 O\'chirish (arxivlash)', `delete_close_ad_${adId}`)],
              [Markup.button.callback('◀️ Orqaga', 'back_to_main')],
            ]),
          }).catch(() => {});
        }
      } catch {
        ctx.reply('❌ Xatolik.', await this.getMenuFromCtx(ctx));
      }
    });

    // Tahrirlash — matn so'rash
    this.bot.action(/edit_close_ad_(.+)/, async (ctx) => {
      const adId = ctx.match[1];
      const userId = ctx.from?.id;
      if (!userId) return;
      ctx.answerCbQuery();

      this.adCloseFlows.set(userId, { step: 'editing', adId });

      ctx.editMessageText(
        '✏️ *E\'lon tahrirlash*\n\nYangi matnni yuboring:',
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('❌ Bekor qilish', 'back_to_main')],
          ]),
        },
      );
    });

    // O'chirish (arxivlash) + guruhlardan xabarlarni o'chirish
    this.bot.action(/delete_close_ad_(.+)/, async (ctx) => {
      const adId = ctx.match[1];
      ctx.answerCbQuery();

      try {
        await this.prisma.ad.update({
          where: { id: adId },
          data: { status: 'ARCHIVED' },
        });
        ctx.editMessageText('✅ E\'lon arxivlandi. Guruhlardan xabarlar o\'chirilmoqda...').catch(() => {});
        ctx.reply('👇 Asosiy menyu:', await this.getMenuFromCtx(ctx));

        // Guruhlardan xabarlarni o'chirish
        this.deleteAdMessagesInBackground(adId).catch(err =>
          this.logger.error(`Xabar o'chirishda xatolik: ${err.message}`),
        );
      } catch {
        ctx.reply('❌ Xatolik.', await this.getMenuFromCtx(ctx));
      }
    });

    // "Men yopmadim" — e'lonni yopmasdan o'tkazish
    this.bot.action(/skip_close_ad_(.+)/, async (ctx) => {
      ctx.answerCbQuery();
      ctx.editMessageText(
        '✅ E\'lon yopilmadi. Keyinroq yopishingiz mumkin.',
      );
      ctx.reply('👇 Asosiy menyu:', await this.getMenuFromCtx(ctx));
    });

    // Yopish boshlash — avto-parsing + faqat yetishmagan maydonlarni so'rash
    this.bot.action(/close_confirm_(.+)/, async (ctx) => {
      const adId = ctx.match[1];
      const userId = ctx.from?.id;
      if (!userId) return;
      ctx.answerCbQuery();

      try {
        const ad = await this.prisma.ad.findUnique({ where: { id: adId } });
        if (!ad) {
          ctx.reply('❌ E\'lon topilmadi.', await this.getMenuFromCtx(ctx));
          return;
        }

        // E'lon matnidan avto-parsing
        const parsed = await this.parseAdContent(ad.content);

        // Flow boshlash — topilgan ma'lumotlarni oldindan to'ldirish
        const flow: AdCloseFlow = {
          step: 'amount',
          adId,
          cargoFrom: parsed.cargoFrom || undefined,
          cargoTo: parsed.cargoTo || undefined,
          cargoType: parsed.cargoType || undefined,
          cargoWeight: parsed.cargoWeight || undefined,
        };

        // Topilganlarni ko'rsatish
        let foundMsg = '';
        if (parsed.cargoFrom) foundMsg += `📍 Qayerdan: ${parsed.cargoFrom}\n`;
        if (parsed.cargoTo) foundMsg += `📍 Qayerga: ${parsed.cargoTo}\n`;
        if (parsed.cargoType) foundMsg += `📦 Yuk turi: ${parsed.cargoType}\n`;
        if (parsed.cargoWeight) foundMsg += `⚖️ Tonna: ${parsed.cargoWeight}\n`;
        if (parsed.vehicleType) {
          foundMsg += `🚛 Mashina: ${parsed.vehicleType}\n`;
          // vehicleType ni ham saqlash — keyinroq so'ramaslik uchun
          (flow as any).vehicleType = parsed.vehicleType;
        }

        if (foundMsg) {
          foundMsg = '🤖 E\'londan topildi:\n' + foundMsg + '\n';
        }

        this.adCloseFlows.set(userId, flow);

        try {
          await ctx.editMessageText(
            foundMsg +
            '💰 Qancha summaga yoptingiz?\n\n' +
            'Faqat raqam yuboring (masalan: 5000000)',
            Markup.inlineKeyboard([
              [Markup.button.callback('❌ Bekor qilish', 'back_to_main')],
            ]),
          );
        } catch {
          await ctx.reply(
            foundMsg +
            '💰 Qancha summaga yoptingiz?\n\n' +
            'Faqat raqam yuboring (masalan: 5000000)',
            Markup.inlineKeyboard([
              [Markup.button.callback('❌ Bekor qilish', 'back_to_main')],
            ]),
          ).catch(() => {});
        }
      } catch {
        ctx.reply('❌ Xatolik.', await this.getMenuFromCtx(ctx));
      }
    });

    // ========== 👑 MASTER BO'LISH — Har bir user avtomatik master ==========
    this.bot.hears(/👑 Master bo'lish/, async (ctx) => {
      const user = await this.getOrCreateUser(ctx);
      if (!user) return;

      if ((user as any).isMaster) {
        const botInfo = await this.bot.telegram.getMe();
        const refLink = `https://t.me/${botInfo.username}?start=ref_${(user as any).refCode}`;
        const menu = await this.getMenuForUser(user.id);
        await ctx.reply(
          `👑 Siz allaqachon master!\n\n📎 Referal havola:\n\`${refLink}\``,
          { parse_mode: 'Markdown', ...menu },
        );
      } else {
        const menu = await this.getMenuForUser(user.id);
        await ctx.reply('ℹ️ Har bir foydalanuvchi avtomatik master bo\'ladi.', menu);
      }
    });

    // ========== 📤 O'ZIMDAN — O'chirilgan ==========
    this.bot.hears(/📤 O'zimdan$/, async (ctx) => {
      const user = await this.getOrCreateUser(ctx);
      const menu = user ? await this.getMenuForUser(user.id) : await this.getMenuFromCtx(ctx);
      await ctx.reply('❌ Bu funksiya o\'chirilgan. "👥 Tarqatish" tugmasini ishlating.', menu);
    });

    // ========== 🛡️ O'ZIMDAN (XAVFSIZ) — O'chirilgan ==========
    this.bot.hears(/🛡️ O'zimdan \(xavfsiz\)/, async (ctx) => {
      const user = await this.getOrCreateUser(ctx);
      const menu = user ? await this.getMenuForUser(user.id) : await this.getMenuFromCtx(ctx);
      await ctx.reply('❌ Bu funksiya o\'chirilgan. "🛡️ Xavfsiz tarqatish" tugmasini ishlating.', menu);
    });

    // ========== 👥 TARQATISH (Master broadcast oddiy rejimda) ==========
    this.bot.hears(/👥 Tarqatish/, async (ctx) => {
      const user = await this.getUserWithAccess(ctx);
      if (!user) return;

      if (!(user as any).isMaster) {
        await ctx.reply('❌ Siz master emassiz!');
        return;
      }

      // E'lon tanlash
      const ads = await this.prisma.ad.findMany({
        where: { userId: user.id, status: { in: ['DRAFT', 'ACTIVE', 'PAUSED'] } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      if (ads.length === 0) {
        const menu = await this.getMenuForUser(user.id);
        await ctx.reply('🔍 E\'lon yo\'q. Avval e\'lon yarating.', menu);
        return;
      }

      let msg = '👥 *Tarqatish — Oddiy rejim*\n\n';
      msg += '👇 E\'lonni tanlang:\n\n';
      const buttons: any[][] = [];

      for (let i = 0; i < ads.length; i++) {
        const ad = ads[i];
        const adChars = Array.from(ad.content);
        const preview = adChars.length > 40 ? adChars.slice(0, 40).join('') + '...' : ad.content;
        msg += `${i + 1}. ${preview}\n\n`;
        buttons.push([Markup.button.callback(`👥 #${i + 1}`, `master_broadcast_${ad.id}`)]);
      }
      buttons.push([Markup.button.callback('◀️ Orqaga', 'back_to_main')]);

      await ctx.reply(msg, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(buttons),
      });
    });

    // Master broadcast callback — oddiy rejim
    this.bot.action(/master_broadcast_(.+)/, async (ctx) => {
      const adId = ctx.match[1];
      const userId = ctx.from?.id;
      if (!userId) return;
      ctx.answerCbQuery('👥 Tobe\'larga yuborilmoqda...');

      const user = await this.getUserWithAccess(ctx);
      if (!user) return;

      try {
        const ad = await this.prisma.ad.findUnique({ where: { id: adId } });
        if (!ad) {
          ctx.reply('❌ E\'lon topilmadi.');
          return;
        }

        const chatId = ctx.chat?.id;
        const result = await this.postingService.masterBroadcast(
          user.id,
          ad.content,
          false,
          chatId ? (text) => {
            this.bot.telegram.sendMessage(chatId, text).catch(() => {});
          } : undefined,
        );

        const menu = await this.getMenuForUser(user.id);
        await ctx.reply(
          `✅ *Tarqatish boshlandi!*\n\n` +
          `👥 ${result.readyCount}/${result.totalSlaves} ta tobe'ga buyruq yuborildi\n` +
          `📋 Jami guruhlar: ${result.totalGroups}`,
          { parse_mode: 'Markdown', ...menu },
        );
      } catch (error: any) {
        const menu = await this.getMenuForUser(user.id);
        ctx.reply(`❌ ${error.message}`, menu);
      }
    });

    // ========== 🛡️ XAVFSIZ TARQATISH (Master broadcast himoyalangan) ==========
    this.bot.hears(/🛡️ Xavfsiz tarqatish/, async (ctx) => {
      const user = await this.getUserWithAccess(ctx);
      if (!user) return;

      if (!(user as any).isMaster) {
        await ctx.reply('❌ Siz master emassiz!');
        return;
      }

      const ads = await this.prisma.ad.findMany({
        where: { userId: user.id, status: { in: ['DRAFT', 'ACTIVE', 'PAUSED'] } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      if (ads.length === 0) {
        const menu = await this.getMenuForUser(user.id);
        await ctx.reply('🔍 E\'lon yo\'q. Avval e\'lon yarating.', menu);
        return;
      }

      let msg = '🛡️ *Xavfsiz tarqatish — Himoyalangan rejim*\n\n';
      msg += '👇 E\'lonni tanlang:\n\n';
      const buttons: any[][] = [];

      for (let i = 0; i < ads.length; i++) {
        const ad = ads[i];
        const adChars = Array.from(ad.content);
        const preview = adChars.length > 40 ? adChars.slice(0, 40).join('') + '...' : ad.content;
        msg += `${i + 1}. ${preview}\n\n`;
        buttons.push([Markup.button.callback(`🛡️ #${i + 1}`, `master_safe_broadcast_${ad.id}`)]);
      }
      buttons.push([Markup.button.callback('◀️ Orqaga', 'back_to_main')]);

      await ctx.reply(msg, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(buttons),
      });
    });

    // Master broadcast callback — himoyalangan rejim
    this.bot.action(/master_safe_broadcast_(.+)/, async (ctx) => {
      const adId = ctx.match[1];
      const userId = ctx.from?.id;
      if (!userId) return;
      ctx.answerCbQuery('🛡️ Himoyalangan tarqatish...');

      const user = await this.getUserWithAccess(ctx);
      if (!user) return;

      try {
        const ad = await this.prisma.ad.findUnique({ where: { id: adId } });
        if (!ad) {
          ctx.reply('❌ E\'lon topilmadi.');
          return;
        }

        const chatId = ctx.chat?.id;
        const result = await this.postingService.masterBroadcast(
          user.id,
          ad.content,
          true,
          chatId ? (text) => {
            this.bot.telegram.sendMessage(chatId, text).catch(() => {});
          } : undefined,
        );

        const menu = await this.getMenuForUser(user.id);
        await ctx.reply(
          `✅ *Himoyalangan tarqatish boshlandi!*\n\n` +
          `👥 ${result.readyCount}/${result.totalSlaves} ta tobe'ga buyruq yuborildi\n` +
          `📋 Jami guruhlar: ${result.totalGroups}`,
          { parse_mode: 'Markdown', ...menu },
        );
      } catch (error: any) {
        const menu = await this.getMenuForUser(user.id);
        ctx.reply(`❌ ${error.message}`, menu);
      }
    });

    // ========== 👥 TOBE'LARIM ==========
    this.bot.hears(/👥 Tobe'larim/, async (ctx) => {
      const user = await this.getUserWithAccess(ctx);
      if (!user) return;

      if (!(user as any).isMaster) {
        await ctx.reply('❌ Siz master emassiz!');
        return;
      }

      const tobes = await this.prisma.user.findMany({
        where: { masterId: user.id },
        include: {
          sessions: {
            where: { status: 'ACTIVE', sessionString: { not: null } },
            include: { _count: { select: { groups: true } } },
          },
        },
      });

      if (tobes.length === 0) {
        const botInfo = await this.bot.telegram.getMe();
        const refLink = `https://t.me/${botInfo.username}?start=ref_${(user as any).refCode}`;
        const menu = await this.getMenuForUser(user.id);
        await ctx.reply(
          `👥 *Tobe'lar yo'q*\n\n📎 Referal havolani ulashing:\n\`${refLink}\``,
          { parse_mode: 'Markdown', ...menu },
        );
        return;
      }

      let msg = `👥 *Tobe'lar: ${tobes.length} ta*\n\n`;

      const buttons: any[][] = [];
      for (let i = 0; i < tobes.length; i++) {
        const t = tobes[i];
        const hasSession = t.sessions.length > 0;
        const groupCount = t.sessions.reduce((sum, s) => sum + ((s as any)._count?.groups || 0), 0);
        const name = t.firstName || t.username || t.telegramId;
        const isActive = this.postingService.isSlaveBroadcasting(t.id);
        const statusIcon = isActive ? '🟢' : '⚪';

        msg += `${i + 1}. ${statusIcon} ${name}\n`;
        msg += `   Session: ${hasSession ? '✅' : '❌'} | Guruhlar: ${groupCount}\n\n`;

        buttons.push([
          Markup.button.callback(`🗑 O'chirish: ${(name as string).slice(0, 20)}`, `remove_tobe_${t.id}`),
        ]);
      }

      const readyCount = tobes.filter(t => t.sessions.length > 0).length;
      const totalGroups = tobes.reduce(
        (sum, t) => sum + t.sessions.reduce((s, sess) => s + ((sess as any)._count?.groups || 0), 0),
        0,
      );

      msg += `📊 *Tayyor:* ${readyCount}/${tobes.length}\n`;
      msg += `📋 *Jami guruhlar:* ${totalGroups}`;

      buttons.push([Markup.button.callback('◀️ Orqaga', 'back_to_main')]);

      await ctx.reply(msg, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(buttons),
      });
    });

    // Tobe'ni o'chirish (master dan ajratish)
    this.bot.action(/remove_tobe_(.+)/, async (ctx) => {
      const tobeId = ctx.match[1];
      ctx.answerCbQuery();

      const user = await this.getUserWithAccess(ctx);
      if (!user || !(user as any).isMaster) return;

      try {
        const tobe = await this.prisma.user.findUnique({ where: { id: tobeId } });
        if (!tobe || tobe.masterId !== user.id) {
          await ctx.reply('❌ Tobe topilmadi.', await this.getMenuFromCtx(ctx));
          return;
        }

        const tobeName = tobe.firstName || tobe.username || tobe.telegramId;

        // Tobe'ni masterdan ajratish → avtomatik master qilish
        const newRefCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        await this.prisma.user.update({
          where: { id: tobeId },
          data: { masterId: null, isMaster: true, refCode: newRefCode },
        });

        const menu = await this.getMenuForUser(user.id);
        await ctx.reply(
          `✅ *${tobeName}* tobe'likdan o'chirildi.`,
          { parse_mode: 'Markdown', ...menu },
        );
      } catch (error: any) {
        await ctx.reply(`❌ Xatolik: ${error.message}`, await this.getMenuFromCtx(ctx));
      }
    });

    // 🛑 Hammani to'xtatish — eski handler, endi 🛑 To'xtatish ga birlashtirilgan
    this.bot.hears(/🛑 Hammani to'xtatish/, async (ctx) => {
      const user = await this.getUserWithAccess(ctx);
      if (!user) return;
      const menu = await this.getMenuForUser(user.id);
      await ctx.reply('ℹ️ "🛑 To\'xtatish" tugmasini ishlating.', menu);
    });

    // ========== 📚 YORDAM ==========
    this.bot.hears(/📚 Yordam/, async (ctx) => {
      const user = await this.getOrCreateUser(ctx);
      const isMaster = user ? await this.isUserMaster(user.id) : false;
      const menu = user ? await this.getMenuForUser(user.id) : await this.getMenuFromCtx(ctx);

      if (isMaster) {
        ctx.reply(
          '📚 *Yordam (Master)*\n\n' +
          '🔹 *E\'lon yaratish:*\n' +
          '   ✍️ "E\'lon yaratish" → matn yuboring → tayyor!\n\n' +
          '🔹 *Tarqatish:*\n' +
          '   👥 "Tarqatish" — tobe\'lar orqali oddiy rejimda\n' +
          '   🛡️ "Xavfsiz tarqatish" — himoyalangan rejimda\n\n' +
          '🔹 *Tobe qo\'shish:*\n' +
          '   Referal havolani tobe\'larga yuboring\n' +
          '   Ular session ulab, master buyruq beradi\n\n' +
          '🔹 *Rejimlar:*\n' +
          '   🚀 *Oddiy:* 0.3-6 sek, 5 min pauza\n' +
          '   🛡️ *Himoyalangan:* 1-15 sek, 10 min pauza\n\n' +
          '📞 Savol bo\'lsa admin bilan bog\'laning.',
          { parse_mode: 'Markdown', ...menu },
        );
      } else {
        ctx.reply(
          '📚 *Yordam (Tobe)*\n\n' +
          '🔹 *Session ulash:*\n' +
          '   📱 "Session ulash" → telefon raqam → kod → tayyor!\n' +
          '   Bir nechta account ulash mumkin\n\n' +
          '🔹 *Vazifangiz:*\n' +
          '   Session ulang va guruhlaringiz tayyor bo\'lsin\n' +
          '   Master xabar yuborganda avtomatik tarqatiladi\n\n' +
          '📞 Savol bo\'lsa admin bilan bog\'laning.',
          { parse_mode: 'Markdown', ...menu },
        );
      }
    });

    // ========== CANCEL CALLBACKS ==========
    this.bot.action('cancel_session', async (ctx) => {
      const userId = ctx.from?.id;
      if (userId) {
        const pending = this.pendingSessions.get(userId);
        if (pending?.sessionId) {
          this.telegramService.cancelPendingAuth(pending.sessionId).catch(() => {});
        }
        this.pendingSessions.delete(userId);
      }
      ctx.answerCbQuery('Bekor qilindi');
      ctx.reply('❌ Session ulash bekor qilindi.', await this.getMenuFromCtx(ctx));
    });

    this.bot.action('cancel_ad', async (ctx) => {
      const userId = ctx.from?.id;
      if (userId) this.awaitingAdText.delete(userId);
      ctx.answerCbQuery('Bekor qilindi');
      ctx.reply("❌ E'lon yaratish bekor qilindi.", await this.getMenuFromCtx(ctx));
    });

    this.bot.action('back_to_main', async (ctx) => {
      const userId = ctx.from?.id;
      if (userId) this.clearUserState(userId);
      ctx.answerCbQuery();
      const user = await this.getOrCreateUser(ctx);
      const menu = user ? await this.getMenuForUser(user.id) : await this.getMenuFromCtx(ctx);
      ctx.reply('👇 Asosiy menyu:', menu);
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
          ctx.reply('❌ Foydalanuvchi topilmadi.', await this.getMenuFromCtx(ctx));
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
          { parse_mode: 'Markdown', ...await this.getMenuFromCtx(ctx) },
        );
      } catch (error) {
        this.logger.error(`Chek yuklashda xatolik: ${error.message}`);
        this.subscriptionFlows.delete(userId);
        ctx.reply('❌ Xatolik yuz berdi. Qayta urinib ko\'ring.', await this.getMenuFromCtx(ctx));
      }
    });

    // ========== TEXT HANDLER ==========
    this.bot.on(message('text'), async (ctx) => {
      const userId = ctx.from?.id;
      const text = ctx.message.text;
      if (!userId) return;

      // ===== Haydovchi ro'yxatdan o'tish oqimi =====
      const driverReg = this.driverRegistrations.get(ctx.chat.id);
      if (driverReg) {
        await this.handleDriverRegistrationFlow(ctx, driverReg, text);
        return;
      }

      // ===== Session ulash — telefon raqam / kod / parol =====
      const pending = this.pendingSessions.get(userId);
      if (pending) {
        await this.handleSessionFlow(ctx, pending, text);
        return;
      }

      // ===== E'lon yopish oqimi =====
      const closeFlow = this.adCloseFlows.get(userId);
      if (closeFlow) {
        await this.handleAdCloseFlow(ctx, closeFlow, text);
        return;
      }

      // ===== E'lon yaratish =====
      if (this.awaitingAdText.has(userId)) {
        this.awaitingAdText.delete(userId);

        const user = await this.getOrCreateUser(ctx);
        if (!user) {
          ctx.reply('❌ Foydalanuvchi topilmadi.', await this.getMenuFromCtx(ctx));
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

          const isMasterAd = (user as any).isMaster && !(user as any).masterId;
          const adMenu = await this.getMenuForUser(user.id);
          const adHint = isMasterAd
            ? '👥 Tarqatish uchun "👥 Tarqatish" tugmasini bosing.'
            : '📋 "📋 Mening sessionlarim" dan session ulang.';

          ctx.reply(
            '✅ *E\'lon saqlandi!*\n\n' +
            `📝 ${text}\n\n` +
            adHint,
            { parse_mode: 'Markdown', ...adMenu },
          );
        } catch (error) {
          ctx.reply(`❌ Xatolik: ${error.message}`, await this.getMenuFromCtx(ctx));
        }
        return;
      }

      // Default
      const defUser = await this.getOrCreateUser(ctx);
      const defMenu = defUser ? await this.getMenuForUser(defUser.id) : await this.getMenuFromCtx(ctx);
      ctx.reply(
        '👇 Quyidagi menudan tanlang:',
        defMenu,
      );
    });

    // ========== 🚛 HAYDOVCHI — mashina turi tanlash callback ==========
    this.bot.action(/dvt_(.+)/, async (ctx) => {
      const vehicleType = ctx.match[1];
      const chatId = ctx.chat?.id;
      if (!chatId) return;

      const reg = this.driverRegistrations.get(chatId);
      if (!reg || reg.step !== 'vehicleType') {
        await ctx.answerCbQuery('⚠️ Muddati o\'tgan');
        return;
      }

      reg.vehicleType = vehicleType;
      reg.step = 'vehicleCapacity';
      this.driverRegistrations.set(chatId, reg);

      await ctx.answerCbQuery(`${vehicleType} tanlandi`);
      await ctx.editMessageText(
        `✅ Mashina: *${vehicleType}*\n\n⚖️ Yuk sig'imi kiriting (masalan: 20 tonna):`,
        { parse_mode: 'Markdown' },
      );
    });

    // Generic callback
    // Payment approve
    this.bot.action(/pay_approve_(.+)/, async (ctx) => {
      const paymentId = ctx.match[1];
      try {
        const tgId = String(ctx.from?.id);
        const adminUser = await this.prisma.user.findFirst({
          where: { telegramId: tgId, role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
        });
        if (!adminUser) {
          await ctx.answerCbQuery('⛔ Faqat admin tasdiqlashi mumkin');
          return;
        }
        await this.paymentsService.approve(paymentId, adminUser.id);
        await ctx.editMessageCaption(
          (ctx.callbackQuery.message as any)?.caption + '\n\n✅ *TASDIQLANDI* — ' + (adminUser.firstName || 'Admin'),
          { parse_mode: 'Markdown' },
        ).catch(() => {});
        await ctx.answerCbQuery('✅ To\'lov tasdiqlandi!');
      } catch (e: any) {
        await ctx.answerCbQuery(`⚠️ Xato: ${e.message?.slice(0, 50)}`);
      }
    });

    // Driver verify
    this.bot.action(/verify_driver_(.+)/, async (ctx) => {
      const userId = ctx.match[1];
      try {
        const tgId = String(ctx.from?.id);
        const adminUser = await this.prisma.user.findFirst({
          where: { telegramId: tgId, role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
        });
        if (!adminUser) {
          await ctx.answerCbQuery('⛔ Faqat admin tasdiqlashi mumkin');
          return;
        }
        const profile = await this.prisma.driverProfile.findUnique({ where: { userId } });
        if (!profile) {
          await ctx.answerCbQuery('⚠️ Profil topilmadi');
          return;
        }
        await this.prisma.driverProfile.update({
          where: { userId },
          data: { isVerified: true, verifiedAt: new Date(), verifiedBy: adminUser.id },
        });
        await ctx.editMessageText(
          (ctx.callbackQuery.message as any)?.text + '\n\n✅ TASDIQLANDI — ' + (adminUser.firstName || 'Admin'),
          { parse_mode: 'HTML' },
        ).catch(() => {});
        await ctx.answerCbQuery('✅ Haydovchi tasdiqlandi!');
      } catch (e: any) {
        await ctx.answerCbQuery(`⚠️ Xato: ${e.message?.slice(0, 50)}`);
      }
    });

    // Payment reject
    this.bot.action(/pay_reject_(.+)/, async (ctx) => {
      const paymentId = ctx.match[1];
      try {
        const tgId = String(ctx.from?.id);
        const adminUser = await this.prisma.user.findFirst({
          where: { telegramId: tgId, role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
        });
        if (!adminUser) {
          await ctx.answerCbQuery('⛔ Faqat admin tasdiqlashi mumkin');
          return;
        }
        await this.paymentsService.reject(paymentId, adminUser.id, 'Telegram orqali rad etildi');
        await ctx.editMessageCaption(
          (ctx.callbackQuery.message as any)?.caption + '\n\n❌ *RAD ETILDI* — ' + (adminUser.firstName || 'Admin'),
          { parse_mode: 'Markdown' },
        ).catch(() => {});
        await ctx.answerCbQuery('❌ To\'lov rad etildi');
      } catch (e: any) {
        await ctx.answerCbQuery(`⚠️ Xato: ${e.message?.slice(0, 50)}`);
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
            ctx.reply('❌ Foydalanuvchi topilmadi.', await this.getMenuFromCtx(ctx));
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
          // Faqat raqamlarni ajratib olish (harflar, bo'shliqlar, tire olib tashlanadi)
          const code = text.replace(/[^0-9]/g, '');
          if (code.length < 4 || code.length > 6) {
            ctx.reply(
              '❌ Kod 4-6 ta raqamdan iborat bo\'lishi kerak.\n' +
              'Agar kodda harflar bo\'lsa, shunday yuboring — raqamlarni o\'zimiz ajratamiz.\n' +
              'Qayta yuboring:',
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
              { parse_mode: 'Markdown', ...await this.getMenuFromCtx(ctx) },
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
            } else if (error.message === 'RESEND_CODE') {
              // Kod muddati o'tgan — yangi kod yuborildi
              ctx.reply(
                '⏳ *Kod muddati o\'tgan!*\n\n' +
                '📱 Yangi kod qayta yuborildi.\n' +
                'Yangi kodni yuboring:',
                {
                  parse_mode: 'Markdown',
                  ...Markup.inlineKeyboard([
                    [Markup.button.callback('❌ Bekor qilish', 'cancel_session')],
                  ]),
                },
              );
              // step 'code' da qolamiz
            } else if (error.message.includes('noto') || error.message.includes('INVALID')) {
              // Kod noto'g'ri — qayta kiritish imkoniyati
              ctx.reply(
                '❌ *Kod noto\'g\'ri!* Qayta yuboring:',
                {
                  parse_mode: 'Markdown',
                  ...Markup.inlineKeyboard([
                    [Markup.button.callback('❌ Bekor qilish', 'cancel_session')],
                  ]),
                },
              );
            } else {
              this.pendingSessions.delete(userId);
              ctx.reply(`❌ Xatolik: ${error.message}`, await this.getMenuFromCtx(ctx));
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
              { parse_mode: 'Markdown', ...await this.getMenuFromCtx(ctx) },
            );
          } catch (error: any) {
            this.pendingSessions.delete(userId);
            ctx.reply(`❌ Xatolik: ${error.message}`, await this.getMenuFromCtx(ctx));
          }
          break;
        }

        default:
          this.pendingSessions.delete(userId);
          ctx.reply('❌ Xatolik. Qayta urinib ko\'ring.', await this.getMenuFromCtx(ctx));
      }
    } catch (error: any) {
      this.pendingSessions.delete(userId);
      this.logger.error(`Session flow xatolik: ${error.message}`);
      ctx.reply(`❌ Xatolik: ${error.message}`, await this.getMenuFromCtx(ctx));
    }
  }

  // ==================== AD CLOSE FLOW ====================

  // ==================== HAYDOVCHI RO'YXATDAN O'TISH ====================

  private async handleDriverRegistrationFlow(ctx: any, reg: DriverRegistration, text: string): Promise<void> {
    const chatId = ctx.chat.id;
    const telegramId = ctx.from.id.toString();

    try {
      switch (reg.step) {
        case 'fullName': {
          // Kirill→Lotin, Capitalize
          const { normalizeName } = require('../drivers/drivers.service');
          reg.fullName = normalizeName(text.trim());
          reg.step = 'phone';
          this.driverRegistrations.set(chatId, reg);
          await ctx.reply(
            `✅ Ism: *${reg.fullName}*\n\n📞 Telefon raqamingizni kiriting (masalan: +998901234567):`,
            { parse_mode: 'Markdown' },
          );
          break;
        }

        case 'phone': {
          const { normalizePhone } = require('../drivers/drivers.service');
          reg.phone = normalizePhone(text.trim());
          reg.step = 'vehicleType';
          this.driverRegistrations.set(chatId, reg);

          const vehicleKeyboard = {
            reply_markup: {
              inline_keyboard: [
                [{ text: '🚛 Fura', callback_data: 'dvt_Fura' }, { text: '🚚 Kamaz', callback_data: 'dvt_Kamaz' }],
                [{ text: '🚛 MAN', callback_data: 'dvt_MAN' }, { text: '🚛 Volvo', callback_data: 'dvt_Volvo' }],
                [{ text: '🚛 Scania', callback_data: 'dvt_Scania' }, { text: '🚛 DAF', callback_data: 'dvt_DAF' }],
                [{ text: '🚛 Mercedes', callback_data: 'dvt_Mercedes' }, { text: '🚛 HOWO', callback_data: 'dvt_HOWO' }],
                [{ text: '🚛 Shacman', callback_data: 'dvt_Shacman' }, { text: '🚛 Dongfeng', callback_data: 'dvt_Dongfeng' }],
                [{ text: '🚛 Iveco', callback_data: 'dvt_Iveco' }, { text: '🚛 Renault', callback_data: 'dvt_Renault' }],
                [{ text: '🚛 FAW', callback_data: 'dvt_FAW' }, { text: '🚛 Foton', callback_data: 'dvt_Foton' }],
                [{ text: '🚐 Isuzu', callback_data: 'dvt_Isuzu' }, { text: '🚐 Gazel', callback_data: 'dvt_Gazel' }],
                [{ text: '🚐 Canter', callback_data: 'dvt_Canter' }, { text: '🚐 JAC', callback_data: 'dvt_JAC' }],
                [{ text: '🚐 Porter', callback_data: 'dvt_Porter' }, { text: '🚐 Sprinter', callback_data: 'dvt_Sprinter' }],
                [{ text: '🚗 Labo', callback_data: 'dvt_Labo' }, { text: '🚗 Damas', callback_data: 'dvt_Damas' }],
                [{ text: '📦 Yuk mashina', callback_data: 'dvt_Yuk mashina' }, { text: '📦 Boshqa', callback_data: 'dvt_Boshqa' }],
              ],
            },
          };
          await ctx.reply(
            '✅ Telefon saqlandi!\n\n🚛 Mashina turini tanlang:',
            vehicleKeyboard,
          );
          break;
        }

        case 'vehicleType':
          reg.vehicleType = text.trim();
          reg.step = 'vehicleCapacity';
          this.driverRegistrations.set(chatId, reg);
          await ctx.reply(
            `✅ Mashina: *${reg.vehicleType}*\n\n⚖️ Yuk sig'imi (tonnaj) kiriting (masalan: 20 tonna):`,
            { parse_mode: 'Markdown' },
          );
          break;

        case 'vehicleCapacity':
          reg.vehicleCapacity = text.trim();
          reg.step = 'otp';
          this.driverRegistrations.set(chatId, reg);

          // Foydalanuvchini yaratish yoki yangilash
          let user = await this.prisma.user.findUnique({ where: { telegramId } });
          if (!user) {
            const nameParts = (reg.fullName || '').split(' ');
            user = await this.prisma.user.create({
              data: {
                telegramId,
                role: 'DRIVER',
                firstName: nameParts[0] || reg.fullName,
                lastName: nameParts.slice(1).join(' ') || undefined,
                phoneNumber: reg.phone,
                isRegistered: true,
                registeredAt: new Date(),
              },
            });
          } else {
            user = await this.prisma.user.update({
              where: { telegramId },
              data: {
                role: 'DRIVER',
                phoneNumber: reg.phone || user.phoneNumber,
                isRegistered: true,
                registeredAt: user.registeredAt || new Date(),
              },
            });
          }

          // DriverProfile yaratish
          const existingProfile = await this.prisma.driverProfile.findUnique({ where: { userId: user.id } });
          // Bepul sinov obuna
          let trialDays = 30;
          try { trialDays = await this.systemConfig.getDriverTrialDays(); } catch {}
          const trialEnd = trialDays > 0 ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000) : undefined;

          if (!existingProfile) {
            await this.prisma.driverProfile.create({
              data: {
                userId: user.id,
                fullName: reg.fullName,
                phone: reg.phone,
                vehicleType: reg.vehicleType,
                vehicleCapacity: reg.vehicleCapacity,
                ...(trialEnd ? { subscriptionActive: true, subscriptionEndDate: trialEnd } : {}),
              },
            });
          } else {
            await this.prisma.driverProfile.update({
              where: { userId: user.id },
              data: {
                fullName: reg.fullName,
                phone: reg.phone,
                vehicleType: reg.vehicleType,
                vehicleCapacity: reg.vehicleCapacity,
                // Obuna faqat yangi profil uchun, mavjud bo'lsa o'zgartirmaymiz
              },
            });
          }

          // Admin'ga yangi haydovchi haqida xabar yuborish
          const adminChatId = process.env.ADMIN_PAYMENT_CHAT_ID || '5475915736';
          try {
            await this.bot.telegram.sendMessage(adminChatId,
              `🚛 <b>Yangi haydovchi ro'yxatdan o'tdi!</b>\n\n` +
              `👤 Ism: <b>${reg.fullName}</b>\n` +
              `📱 Tel: <code>${reg.phone}</code>\n` +
              `🚗 Mashina: ${reg.vehicleType || 'Ko\'rsatilmagan'}\n` +
              `📦 Sig'imi: ${reg.vehicleCapacity || '-'}\n` +
              `🆔 Telegram ID: <code>${telegramId}</code>`,
              {
                parse_mode: 'HTML',
                reply_markup: {
                  inline_keyboard: [[
                    { text: '✅ Tasdiqlash', callback_data: `verify_driver_${user.id}` },
                  ]],
                },
              },
            );
          } catch (_) {}

          // OTP kod yaratish
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          appLoginCodes.set(code, {
            telegramId,
            expiresAt: Date.now() + 5 * 60 * 1000,
          });

          this.driverRegistrations.delete(chatId);

          await ctx.reply(
            '✅ *Ro\'yxatdan o\'tish muvaffaqiyatli!*\n\n' +
            '📋 *Sizning ma\'lumotlaringiz:*\n' +
            `👤 Ism: ${reg.fullName}\n` +
            `📞 Tel: ${reg.phone}\n` +
            `🚛 Mashina: ${reg.vehicleType}\n` +
            `⚖️ Tonnaj: ${reg.vehicleCapacity}\n\n` +
            '━━━━━━━━━━━━━━━━━━━━━━\n\n' +
            '📲 *Ilovaga kirish uchun:*\n\n' +
            `🆔 Telegram ID: \`${telegramId}\`\n` +
            `🔑 Login kod: \`${code}\`\n\n` +
            '📱 Ilovada "Haydovchi" ni tanlang va yuqoridagi ma\'lumotlarni kiriting.\n\n' +
            '⏰ Kod 5 daqiqa amal qiladi.',
            { parse_mode: 'Markdown' },
          );
          break;

        default:
          this.driverRegistrations.delete(chatId);
          await ctx.reply('❌ Noma\'lum qadam. /haydovchi buyrug\'ini qayta yuboring.');
      }
    } catch (error) {
      this.logger.error('Driver registration flow xatolik:', error);
      this.driverRegistrations.delete(chatId);
      await ctx.reply('❌ Xatolik yuz berdi. /haydovchi buyrug\'ini qayta yuboring.');
    }
  }

  private async handleAdCloseFlow(ctx: any, flow: AdCloseFlow, text: string): Promise<void> {
    const userId = ctx.from?.id;
    if (!userId) return;

    try {
      switch (flow.step) {
        case 'editing': {
          // Matnni yangilash
          if (!flow.adId) break;
          await this.prisma.ad.update({
            where: { id: flow.adId },
            data: { content: text, title: text.slice(0, 50) },
          });
          this.adCloseFlows.delete(userId);
          ctx.reply(
            '✅ *E\'lon matni yangilandi!*\n\n' +
            `📝 ${text.length > 100 ? text.slice(0, 100) + '...' : text}`,
            { parse_mode: 'Markdown', ...await this.getMenuFromCtx(ctx) },
          );
          break;
        }

        case 'amount': {
          const amount = parseFloat(text.replace(/[^\d.]/g, ''));
          if (isNaN(amount) || amount <= 0) {
            ctx.reply('❌ Noto\'g\'ri summa. Faqat raqam yuboring (masalan: 5000000):');
            return;
          }
          flow.closedAmount = amount;
          // Keyingi bo'sh maydonni topish
          this.advanceCloseFlow(ctx, userId, flow);
          break;
        }

        case 'cargo_from': {
          const fromMatch = await this.locationsService.matchLocation(text.trim());
          flow.cargoFrom = fromMatch ? fromMatch.name : text.trim();
          if (fromMatch) {
            ctx.reply(`✅ ${fromMatch.name} (${fromMatch.region})`);
          }
          this.advanceCloseFlow(ctx, userId, flow);
          break;
        }

        case 'cargo_to': {
          const toMatch = await this.locationsService.matchLocation(text.trim());
          flow.cargoTo = toMatch ? toMatch.name : text.trim();
          if (toMatch) {
            ctx.reply(`✅ ${toMatch.name} (${toMatch.region})`);
          }
          this.advanceCloseFlow(ctx, userId, flow);
          break;
        }

        case 'cargo_type': {
          flow.cargoType = text.trim();
          this.advanceCloseFlow(ctx, userId, flow);
          break;
        }

        case 'cargo_weight': {
          const weight = parseFloat(text.replace(/[^\d.]/g, ''));
          if (isNaN(weight) || weight <= 0) {
            ctx.reply('❌ Noto\'g\'ri qiymat. Faqat raqam yuboring:');
            return;
          }
          flow.cargoWeight = weight;
          this.advanceCloseFlow(ctx, userId, flow);
          break;
        }

        case 'vehicle_type': {
          const vehicleType = text.trim();
          await this.finalizeCloseFlow(ctx, userId, flow, vehicleType);
          break;
        }

        default:
          this.adCloseFlows.delete(userId);
          ctx.reply('❌ Xatolik. Qayta urinib ko\'ring.', await this.getMenuFromCtx(ctx));
      }
    } catch (error: any) {
      this.adCloseFlows.delete(userId);
      ctx.reply(`❌ Xatolik: ${error.message}`, await this.getMenuFromCtx(ctx));
    }
  }

  /**
   * E'lon xabarlarini background da o'chirish (bot service dan)
   */
  private async deleteAdMessagesInBackground(adId: string): Promise<void> {
    try {
      const histories = await this.prisma.postHistory.findMany({
        where: {
          post: { adId },
          status: 'SENT',
          messageId: { not: null },
        },
        include: {
          group: { select: { telegramId: true, sessionId: true } },
        },
      });

      this.logger.log(`E'lon xabarlari topildi: ${histories.length} ta (adId: ${adId})`);
      if (histories.length === 0) return;

      const messagesToDelete = histories
        .filter(h => h.messageId && h.group)
        .map(h => ({
          messageId: h.messageId,
          groupTelegramId: h.group.telegramId,
          sessionId: h.group.sessionId,
        }));

      if (messagesToDelete.length > 0) {
        const result = await this.telegramService.deleteAdMessages(messagesToDelete);
        this.logger.log(`E'lon xabarlari o'chirildi: ${result.deleted}/${messagesToDelete.length} (adId: ${adId})`);
      }
    } catch (error: any) {
      this.logger.error(`E'lon xabarlarini o'chirishda xatolik: ${error.message}`);
    }
  }

  // ==================== AD CLOSE — AUTO-PARSE & ADVANCE ====================

  /**
   * E'lon matnidan ma'lumotlarni avto-ajratish
   */
  private async parseAdContent(content: string): Promise<{
    cargoFrom: string | null;
    cargoTo: string | null;
    cargoType: string | null;
    cargoWeight: number | null;
    vehicleType: string | null;
  }> {
    const result = {
      cargoFrom: null as string | null,
      cargoTo: null as string | null,
      cargoType: null as string | null,
      cargoWeight: null as number | null,
      vehicleType: null as string | null,
    };

    const text = content.toLowerCase();
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

    // 1. Yo'nalish topish (qayerdan → qayerga)
    // Ko'p xil pattern: "→", "-", "dan...ga", "dan-ga", "Shahar1 Shahar2"
    const routePatterns = [
      // "Toshkent → Samarqand", "Toshkent - Samarqand", "Toshkent – Samarqand"
      /([A-Za-zА-Яа-яЎўҚқҒғҲҳ''\s]+?)\s*[→➡⟶\-–—=]+[>\s]*\s*([A-Za-zА-Яа-яЎўҚқҒғҲҳ''\s]+)/i,
      // "Toshkentdan Samarqandga", "Toshkent dan Samarqand ga"
      /([A-Za-zА-Яа-яЎўҚқҒғҲҳ''\s]+?)\s*dan\s+([A-Za-zА-Яа-яЎўҚқҒғҲҳ''\s]+?)\s*ga\b/i,
      // "Toshkentdan Samarqanga" (qisqartirilgan)
      /([A-Za-zА-Яа-яЎўҚқҒғҲҳ''\s]+?)dan\s+([A-Za-zА-Яа-яЎўҚқҒғҲҳ''\s]+?)ga\b/i,
      // "Toshkent Samarqand yo'nalish/marshrut"
      /([A-Za-zА-Яа-яЎўҚқҒғҲҳ''\s]+?)\s+([A-Za-zА-Яа-яЎўҚқҒғҲҳ''\s]+?)\s+(?:yo.?nalish|marshrut|yonalish)/i,
    ];

    for (const pattern of routePatterns) {
      const match = content.match(pattern);
      if (match) {
        // "dan" qo'shimchasini olib tashlash (Toshkentdan → Toshkent)
        const fromRaw = match[1].trim().replace(/dan$/i, '').trim();
        const toRaw = match[2].trim().replace(/ga$/i, '').replace(/ga\b.*$/i, '').trim();
        // Location bazadan tekshirish
        const fromMatch = await this.locationsService.matchLocation(fromRaw);
        const toMatch = await this.locationsService.matchLocation(toRaw);
        if (fromMatch) result.cargoFrom = fromMatch.name;
        if (toMatch) result.cargoTo = toMatch.name;
        if (result.cargoFrom || result.cargoTo) break;
      }
    }

    // Agar route pattern topilmasa, har bir so'zni location sifatida tekshirish
    if (!result.cargoFrom && !result.cargoTo) {
      // So'zlarni ajratish + "dan"/"ga" qo'shimchalarini tozalash
      const rawWords = content.split(/[\s,\n\-→➡]+/).filter(w => w.length >= 3);
      const words = rawWords.map(w => w.replace(/^(dan|ga)$/i, '').replace(/(dan|ga)$/i, '').trim()).filter(w => w.length >= 3);

      const foundLocations: string[] = [];
      for (const word of words) {
        if (foundLocations.length >= 2) break;
        const match = await this.locationsService.matchLocation(word.trim());
        if (match && !foundLocations.includes(match.name)) {
          foundLocations.push(match.name);
        }
      }
      if (foundLocations.length >= 2) {
        result.cargoFrom = foundLocations[0];
        result.cargoTo = foundLocations[1];
      } else if (foundLocations.length === 1) {
        result.cargoFrom = foundLocations[0];
      }
    }

    // 2. Tonna topish (ko'p xil yozuv bilan)
    const weightPatterns = [
      /(\d+(?:[.,]\d+)?)\s*(?:tonna?|тонн?а?)/i,        // "20 tonna", "20тонна"
      /(\d+(?:[.,]\d+)?)\s*(?:tn\b|t\b|т\b)/i,           // "20t", "20tn", "20т"
      /(\d+(?:[.,]\d+)?)\s*(?:tonn?a?|tona)/i,            // "20tona", "20tonna"
      /(?:tonna?|тонн?а?)\s*[:=]?\s*(\d+(?:[.,]\d+)?)/i,  // "tonna: 20", "тонна 20"
    ];
    for (const pattern of weightPatterns) {
      const match = text.match(pattern);
      if (match) {
        result.cargoWeight = parseFloat(match[1].replace(',', '.'));
        break;
      }
    }

    // 3. Mashina turi topish (xatoli yozuvlar bilan)
    const vehicleTypes: Record<string, string[]> = {
      'Fura': ['fu+ra', 'фу+ра', 'trailer', 'тент', 'tent', 'fura', 'furo', 'fyra', 'phura'],
      'Isuzu': ['is[uo]z[uo]', 'исузу', 'izuzu', 'isuzi', 'isizu', 'isusu'],
      'Gazel': ['gaz[eiao]l', 'газел', 'gazelle', 'gazel', 'gazil', 'gasel'],
      'Kamaz': ['k[ao]m[ao]z', 'камаз', 'kamaz', 'kamas', 'kamoz'],
      'Daf': ['\\bdaf\\b', 'даф'],
      'Man': ['\\bman\\b', '\\bман\\b'],
      'Volvo': ['vol[bv]o', 'вольво', 'wolvo'],
      'Scania': ['scan[iy]a', 'скания', 'skaniya', 'skania'],
      'Howo': ['ho[vw]o', 'хово', 'havo'],
      'Shacman': ['sha[ck]man', 'шакман', 'shakman', 'shachman', 'shacmen'],
      'Samosvall': ['sam[oa]sval', 'самосвал', 'samasval'],
      'Ref': ['ref\\b', 'реф\\b', 'refr[ie]', 'рефри', 'refka'],
      'Labo': ['\\blabo\\b', 'лабо', 'damas', 'дамас'],
      'Sprinter': ['spr[ie]nter', 'спринтер'],
      'Bortovoy': ['bort[oa]v', 'бортов', 'bortovoy'],
    };
    for (const [type, patterns] of Object.entries(vehicleTypes)) {
      for (const p of patterns) {
        if (new RegExp(p, 'i').test(text)) {
          result.vehicleType = type;
          break;
        }
      }
      if (result.vehicleType) break;
    }

    // 4. Yuk turi topish (xatoli yozuvlar bilan)
    const cargoTypes: Record<string, string[]> = {
      'G\'isht': ['g.?isht', 'gisht', 'кирпич', 'kirpich', 'kisht', 'gisth'],
      'Sement': ['se?ment', 'cement', 'цемент', 'semint', 'ciment'],
      'Qum': ['\\bqum\\b', 'песок', 'pesok', '\\bkum\\b'],
      'Shag\'al': ['shag.?al', 'щебен', 'sheben', 'shagal', 'shagel'],
      'Meva': ['meva', 'фрукт', 'frukt', 'miva'],
      'Sabzavot': ['sabz[ao]vot', 'овощ', 'sabzivot'],
      'Paxta': ['p[ao]xta', 'хлопок', 'cotton', 'pahta', 'pakta'],
      'Bug\'doy': ['bug.?doy', 'пшениц', 'wheat', 'bugdoy', 'bugday'],
      'Un': ['\\bun\\b', 'мука', 'flour'],
      'Yog\'och': ['yog.?och', 'древесин', 'les\\b', 'лес\\b', 'yogoch', 'yogach'],
      'Temir': ['temir', 'металл', 'metall', 'iron', 'timir'],
      'Ko\'mir': ['ko.?mir', 'уголь', 'coal', 'komir', 'kumir'],
      'Ploshchadka': ['ploshch?adka', 'площадк', 'ploshadka', 'ploshchatka'],
      'Armattura': ['armat[uy]ra', 'арматур'],
      'Don': ['\\bdon\\b', 'зерно', 'zerno'],
      'Guruch': ['gur[iu]ch', 'рис\\b'],
      'Kartoshka': ['kart[oa]shk', 'картошк', 'kartofka'],
      'Piyoz': ['piy[oa]z', 'лук\\b'],
      'Suv': ['\\bsuv\\b', 'вод[аы]'],
      'Moy': ['\\bmoy\\b', 'масло', 'yog'],
    };
    for (const [type, patterns] of Object.entries(cargoTypes)) {
      for (const p of patterns) {
        if (new RegExp(p, 'i').test(text)) {
          result.cargoType = type;
          break;
        }
      }
      if (result.cargoType) break;
    }

    return result;
  }

  /**
   * Yopish oqimini keyingi bo'sh maydon ga otkzish
   * Agar maydon allaqachon to'ldirilgan bo'lsa, o'tkazib yuboradi
   */
  private async advanceCloseFlow(ctx: any, userId: number, flow: AdCloseFlow): Promise<void> {
    // Maydonlar ketma-ketligi
    const steps: Array<{ field: keyof AdCloseFlow; step: AdCloseFlow['step']; prompt: string }> = [
      { field: 'cargoFrom', step: 'cargo_from', prompt: '📍 Qayerdan?\n\nMasalan: Toshkent' },
      { field: 'cargoTo', step: 'cargo_to', prompt: '📍 Qayerga?\n\nMasalan: Samarqand' },
      { field: 'cargoType', step: 'cargo_type', prompt: '📦 Yuk turi?\n\nMasalan: G\'isht, Sement' },
      { field: 'cargoWeight', step: 'cargo_weight', prompt: '⚖️ Nechchi tonna?\n\nFaqat raqam yuboring (masalan: 20)' },
      { field: 'vehicleType' as any, step: 'vehicle_type', prompt: '🚛 Qanday mashinaga ortildi?\n\nMasalan: Fura, Isuzu, Gazel, Kamaz' },
    ];

    // Birinchi bo'sh maydonni topish
    for (const s of steps) {
      const value = (flow as any)[s.field];
      if (!value) {
        flow.step = s.step;
        this.adCloseFlows.set(userId, flow);
        ctx.reply(s.prompt);
        return;
      }
    }

    // Barcha maydonlar to'ldirilgan — vehicle_type step ga yuborish
    // (vehicle_type handler flow ni tugatadi)
    flow.step = 'vehicle_type';
    this.adCloseFlows.set(userId, flow);
    // Agar vehicleType ham bor bo'lsa — to'g'ridan-to'g'ri yopamiz
    if ((flow as any).vehicleType) {
      await this.finalizeCloseFlow(ctx, userId, flow, (flow as any).vehicleType);
    } else {
      ctx.reply('🚛 Qanday mashinaga ortildi?\n\nMasalan: Fura, Isuzu, Gazel, Kamaz');
    }
  }

  /**
   * Yuk yopish oqimini tugatish (yakuniy qadam)
   */
  private async finalizeCloseFlow(ctx: any, userId: number, flow: AdCloseFlow, vehicleType: string): Promise<void> {
    const user = await this.getOrCreateUser(ctx);
    if (!user || !flow.adId) {
      this.adCloseFlows.delete(userId);
      ctx.reply('❌ Xatolik.', await this.getMenuFromCtx(ctx));
      return;
    }

    try {
      const ad = await this.prisma.ad.findUnique({ where: { id: flow.adId } });
      if (!ad) {
        this.adCloseFlows.delete(userId);
        ctx.reply('❌ E\'lon topilmadi.', await this.getMenuFromCtx(ctx));
        return;
      }

      // Masofani avto-hisoblash (OSRM)
      let autoDistance: number | null = null;
      if (flow.cargoFrom && flow.cargoTo) {
        try {
          const distResult = await this.locationsService.calculateDistance(flow.cargoFrom, flow.cargoTo);
          autoDistance = distResult.distance;
        } catch { /* ignore */ }
      }

      // YANGI deal yaratish
      await this.prisma.ad.create({
        data: {
          userId: user.id,
          title: `${flow.cargoFrom || ''} → ${flow.cargoTo || ''}`,
          content: ad.content,
          mediaType: 'TEXT',
          status: 'CLOSED',
          isSold: true,
          soldAt: new Date(),
          soldQuantity: 1,
          closedBy: user.id,
          closedAmount: flow.closedAmount,
          cargoFrom: flow.cargoFrom,
          cargoTo: flow.cargoTo,
          cargoType: flow.cargoType,
          cargoWeight: flow.cargoWeight,
          vehicleType,
          distance: autoDistance,
          createdBy: user.id,
        },
      });

      // Asl e'lonni CLOSED qilish + soldQuantity oshirish
      await this.prisma.ad.update({
        where: { id: flow.adId },
        data: {
          status: 'CLOSED',
          isSold: true,
          soldAt: new Date(),
          soldQuantity: { increment: 1 },
        },
      }).catch(() => {});

      this.adCloseFlows.delete(userId);

      const distText = autoDistance ? `📏 Masofa: ${autoDistance} km\n` : '';
      ctx.reply(
        '✅ Yuk yopildi!\n\n' +
        `💰 Summa: ${flow.closedAmount?.toLocaleString()} UZS\n` +
        `📍 Marshrut: ${flow.cargoFrom} → ${flow.cargoTo}\n` +
        distText +
        `📦 Yuk turi: ${flow.cargoType}\n` +
        `⚖️ Tonna: ${flow.cargoWeight}\n` +
        `🚛 Mashina: ${vehicleType}\n\n` +
        '🔄 Guruhlardan xabarlar o\'chirilmoqda...',
        await this.getMenuFromCtx(ctx),
      );

      // Guruhlardan xabarlarni o'chirish
      this.deleteAdMessagesInBackground(flow.adId).catch(err =>
        this.logger.error(`Xabar o'chirishda xatolik: ${err.message}`),
      );
    } catch (error: any) {
      this.adCloseFlows.delete(userId);
      ctx.reply(`❌ Xatolik: ${error.message}`, await this.getMenuFromCtx(ctx));
    }
  }

  // ==================== SESSION SELECTION RENDER ====================

  private async renderSessionSelection(ctx: any, userId: number): Promise<void> {
    const flow = this.postingFlows.get(userId);
    if (!flow) return;

    const user = await this.getOrCreateUser(ctx);
    if (!user) return;

    const sessions = await this.prisma.session.findMany({
      where: { userId: user.id, status: 'ACTIVE', sessionString: { not: null } },
      include: { _count: { select: { groups: true } } },
    });

    const allSelected = flow.selectedSessions?.length === sessions.length;

    let msg = '📱 *Session tanlang:*\n\n';
    msg += `Tanlangan: ${flow.selectedSessions?.length || 0} / ${sessions.length}\n\n`;

    const buttons: any[][] = [];
    buttons.push([
      Markup.button.callback(
        `🔄 Barcha sessionlar ${allSelected ? '✅' : '⬜'}`,
        'toggle_all_sessions',
      ),
    ]);

    for (const s of sessions) {
      const label = s.name || s.phone || s.id.slice(0, 8);
      const groupCount = (s as any)._count?.groups || 0;
      const isSelected = flow.selectedSessions?.includes(s.id);
      buttons.push([
        Markup.button.callback(
          `📱 ${label} (${groupCount} guruh) ${isSelected ? '✅' : '⬜'}`,
          `toggle_session_${s.id}`,
        ),
      ]);
    }

    // Mode ga qarab tugma ko'rsatish
    if (flow.mode === 'safe') {
      buttons.push([Markup.button.callback('🛡️ Himoyalangan boshlash', 'start_safe_posting_confirm')]);
    } else {
      buttons.push([Markup.button.callback('🚀 Oddiy tarqatishni boshlash', 'start_posting_confirm')]);
    }
    buttons.push([Markup.button.callback('◀️ Orqaga', 'back_to_main')]);

    try {
      await ctx.editMessageText(msg, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(buttons),
      });
    } catch {
      // editMessageText might fail if message is not modified
    }
  }

  // ==================== LIVE PROGRESS ====================

  /**
   * Tarqatish holatini formatlash (plain text, Markdown yo'q)
   */
  private formatPostingProgress(jobId: string): string {
    const stats = this.postingService.getJobStats(jobId);
    if (!stats) return '📈 Tarqatish holati: ma\'lumot yo\'q';

    const durationMin = Math.floor(stats.duration / 60000);
    const durationSec = Math.floor((stats.duration % 60000) / 1000);

    let msg = '';

    // Status
    if (stats.status === 'running') {
      msg += `🟢 Tarqatish davom etmoqda (Round ${stats.currentRound || stats.roundsCompleted})\n\n`;
    } else if (stats.status === 'completed') {
      msg += '✅ Tarqatish tugadi!\n\n';
    } else if (stats.status === 'stopped') {
      msg += '⏹ Tarqatish to\'xtatildi\n\n';
    } else if (stats.status === 'paused') {
      msg += '⏸ Tarqatish pauzada\n\n';
    }

    // Per-session stats
    if (stats.perSessionStats.length > 0) {
      msg += '📱 Sessionlar:\n';
      for (const s of stats.perSessionStats) {
        const total = s.sent + s.failed + s.skipped;
        const pct = s.totalGroups > 0 ? Math.floor((s.sent / s.totalGroups) * 100) : 0;
        msg += `  ${s.sent > 0 ? '🟢' : '⏳'} ${s.name}\n`;
        msg += `    ✅ ${s.sent} yuborildi`;
        if (s.failed > 0) msg += ` | ❌ ${s.failed} xato`;
        if (s.skipped > 0) msg += ` | ⏭ ${s.skipped} skip`;
        msg += ` (${total}/${s.totalGroups}`;
        if (pct > 0) msg += `, ${pct}%`;
        msg += ')\n';
      }
      msg += '\n';
    }

    // Overall stats
    msg += `📊 Jami: ${stats.postedGroups}/${stats.totalGroups} guruh\n`;
    if (stats.failedGroups > 0) msg += `❌ Xato: ${stats.failedGroups}\n`;
    if (stats.skippedGroups > 0) msg += `⏭ Skip: ${stats.skippedGroups}\n`;
    msg += `🔄 Roundlar: ${stats.roundsCompleted}\n`;
    msg += `⏱ Muddat: ${durationMin}m ${durationSec}s\n`;

    if (stats.successRate > 0) {
      msg += `📈 Muvaffaqiyat: ${stats.successRate.toFixed(1)}%\n`;
    }

    // Keyingi round info
    if (stats.nextRoundAt) {
      const remaining = Math.max(0, stats.nextRoundAt.getTime() - Date.now());
      const remainMin = Math.floor(remaining / 60000);
      const remainSec = Math.floor((remaining % 60000) / 1000);
      const nextTime = stats.nextRoundAt.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
      msg += `\n⏳ Keyingi round: ${nextTime} (${remainMin}m ${remainSec}s qoldi)`;
    }

    // Interval info — broadcast bot kabi
    if (stats.safeMode) {
      msg += '\n\n🛡️ Rejim: HIMOYALANGAN\n';
      msg += '⏱ Interval: 1-15s (guruh), 10 min (round)';
    } else {
      msg += '\n\n🚀 Rejim: ODDIY\n';
      msg += '⏱ Interval: 0.3-6s (guruh), 5 min (round)';
    }
    if (stats.blockedGroups > 0) {
      msg += `\n🚫 Bloklangan: ${stats.blockedGroups} ta guruh`;
    }

    return msg;
  }

  /**
   * Job ga progress callback o'rnatish — xabar tahrirlaydi
   */
  private registerProgressCallback(jobId: string, chatId: number, messageId: number): void {
    this.postingService.setJobProgressCallback(jobId, () => {
      const text = this.formatPostingProgress(jobId);
      this.bot.telegram.editMessageText(chatId, messageId, undefined, text).catch(() => {});
    });
  }

  // ==================== STATE CLEANUP ====================

  private clearUserState(userId: number) {
    this.pendingSessions.delete(userId);
    this.subscriptionFlows.delete(userId);
    this.awaitingAdText.delete(userId);
    this.pendingRegistrations.delete(userId.toString());
    this.adCloseFlows.delete(userId);
    this.postingFlows.delete(userId);
  }

  // ==================== MASTER/TOBE — REFERAL LINK ====================

  /**
   * /start ref_XXX — Tobe sifatida master ga ulash
   */
  private async handleRefLink(ctx: any, refCode: string): Promise<void> {
    const tgId = ctx.from?.id?.toString();
    if (!tgId) return;

    // Master topish
    const master = await this.prisma.user.findFirst({
      where: { refCode, isMaster: true },
    });

    if (!master) {
      await ctx.reply('❌ Noto\'g\'ri referal havola!');
      return;
    }

    // User olish yoki yaratish
    let user = await this.prisma.user.findUnique({
      where: { telegramId: tgId },
    });

    if (!user) {
      // Yangi user — tobe sifatida yaratish
      user = await this.prisma.user.create({
        data: {
          telegramId: tgId,
          firstName: ctx.from.first_name,
          lastName: ctx.from.last_name,
          username: ctx.from.username,
          masterId: master.id,
        },
      });

      await ctx.reply(
        `✅ *Siz tobe sifatida ulangingiz!*\n\n` +
        `👑 Master: ${master.firstName || master.username || 'Anonim'}\n\n` +
        `*Endi qilishingiz kerak:*\n` +
        `1️⃣ Telefon raqamingizni ulashing\n` +
        `2️⃣ Session ulang\n\n` +
        `Master xabar yuborganda avtomatik tarqatiladi!`,
        { parse_mode: 'Markdown', ...this.getContactRequestKeyboard() },
      );
      this.pendingRegistrations.add(tgId);
      return;
    }

    // Mavjud user — master ga ulash
    if (user.masterId === master.id) {
      await ctx.reply('✅ Siz allaqachon bu masterga ulangansiz!');
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { masterId: master.id, isMaster: false },
      });

      if (user.masterId && user.masterId !== master.id) {
        await ctx.reply(
          `✅ *Master o'zgartirildi!*\n\n👑 Yangi master: ${master.firstName || master.username || 'Anonim'}`,
          { parse_mode: 'Markdown' },
        );
      } else {
        await ctx.reply(
          `✅ *Siz tobe sifatida ulangingiz!*\n\n👑 Master: ${master.firstName || master.username || 'Anonim'}`,
          { parse_mode: 'Markdown' },
        );
      }
    }

    // Access tekshirish va menu ko'rsatish
    if (user.isRegistered) {
      const access = await this.checkAccess(user);
      if (access.allowed) {
        const menu = await this.getMenuForUser(user.id);
        await ctx.reply('👇 Asosiy menyu:', menu);
      } else {
        await ctx.reply(
          '⏰ *Bepul sinov muddati tugadi!*\n\nObuna sotib oling.',
          { parse_mode: 'Markdown', ...this.getExpiredMenu() },
        );
      }
    } else {
      this.pendingRegistrations.add(tgId);
      await ctx.reply(
        '📲 Botdan foydalanish uchun telefon raqamingizni ulashing:',
        this.getContactRequestKeyboard(),
      );
    }
  }
}
