import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as bcrypt from 'bcrypt';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const TelegramBot = require('node-telegram-bot-api');

@Injectable()
export class DriverBotService implements OnModuleInit {
  private readonly logger = new Logger('DriverBot');
  private bot: any;

  // User state tracking: chatId → state
  private userStates = new Map<number, {
    step: 'awaiting_phone' | 'awaiting_password';
    phone?: string;
    profileId?: string;
    driverName?: string;
  }>();

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    const token = process.env.DRIVER_BOT_TOKEN || '8790291087:AAGsM_0cUqSRai41mtyBeJtrO6BIH8tElm8';

    try {
      this.bot = new TelegramBot(token, { polling: true });
      this.setupHandlers();
      this.logger.log('YO\'LDA Driver Bot ishga tushdi');
    } catch (e) {
      this.logger.error(`Bot ishga tushmadi: ${e.message}`);
    }
  }

  private setupHandlers() {
    // /start va /start reset
    this.bot.onText(/\/start(.*)/, async (msg: any, match: any) => {
      const chatId = msg.chat.id;
      const telegramId = String(msg.from.id);
      const param = (match[1] || '').trim();

      try {
        // Har doim telefon so'rash — Telegram raqam boshqa bo'lishi mumkin
        this.userStates.set(chatId, { step: 'awaiting_phone' });
        await this.bot.sendMessage(chatId,
          'Assalomu alaykum! 🚛\n\nYO\'LDA Driver botiga xush kelibsiz.\n\nIlovadagi telefon raqamingizni yuboring yoki kontaktni ulashing:',
          {
            reply_markup: {
              keyboard: [[{ text: '📱 Kontaktni ulashish', request_contact: true }]],
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          },
        );
      } catch (e) {
        this.logger.error(`/start xato: ${e.message}`);
        await this.bot.sendMessage(chatId, 'Xatolik yuz berdi. Qayta urinib ko\'ring.').catch(() => {});
      }
    });

    // Callback query — inline tugmalar
    this.bot.on('callback_query', async (query: any) => {
      const chatId = query.message.chat.id;
      const data = query.data;

      try {
        await this.bot.answerCallbackQuery(query.id);

        if (data === 'reset_password') {
          this.userStates.set(chatId, { step: 'awaiting_phone' });
          await this.bot.sendMessage(chatId,
            'Ilovadagi telefon raqamingizni yuboring yoki kontaktni ulashing:',
            {
              reply_markup: {
                keyboard: [[{ text: '📱 Kontaktni ulashish', request_contact: true }]],
                resize_keyboard: true,
                one_time_keyboard: true,
              },
            },
          );
        }
      } catch (e) {
        this.logger.error(`Callback xato: ${e.message}`);
      }
    });

    // Kontakt ulashish
    this.bot.on('contact', async (msg: any) => {
      const chatId = msg.chat.id;
      const phone = msg.contact.phone_number;

      try {
        await this._handlePhone(chatId, phone, String(msg.from.id));
      } catch (e) {
        this.logger.error(`Contact xato: ${e.message}`);
      }
    });

    // Oddiy xabar — parol yoki telefon raqam
    this.bot.on('message', async (msg: any) => {
      if (msg.contact || msg.text?.startsWith('/')) return; // contact va commandlar skip

      const chatId = msg.chat.id;
      const text = msg.text?.trim() || '';
      const state = this.userStates.get(chatId);

      if (!state) return;

      try {
        if (state.step === 'awaiting_phone') {
          // Telefon raqam keldi
          const phone = text.replace(/[\s\-\(\)]/g, '');
          if (phone.length >= 9) {
            await this._handlePhone(chatId, phone, String(msg.from.id));
          } else {
            await this.bot.sendMessage(chatId, 'Telefon raqam noto\'g\'ri. Qayta kiriting yoki kontaktni ulashing.');
          }
        } else if (state.step === 'awaiting_password') {
          // Yangi parol keldi
          if (text.length < 6) {
            await this.bot.sendMessage(chatId, '⚠️ Parol kamida 6 ta belgidan iborat bo\'lishi kerak. Qayta yozing:');
            return;
          }

          // Parolni saqlash
          const passwordHash = await bcrypt.hash(text, 10);
          await this.prisma.driverProfile.update({
            where: { id: state.profileId },
            data: { passwordHash },
          });

          // Xabarni o'chirish (parol ko'rinmasligi uchun)
          try {
            await this.bot.deleteMessage(chatId, msg.message_id);
          } catch (_) {}

          this.userStates.delete(chatId);

          await this.bot.sendMessage(chatId,
            `✅ Hurmatli ${state.driverName}, parolingiz muvaffaqiyatli yangilandi!\n\n` +
            `Ilovaga qaytib telefon raqam va yangi parol bilan kiring.\n\n` +
            `📱 Telefon: ${state.phone}\n🔑 Parol: yangi parolingiz`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: '📱 Ilovani ochish', url: 'https://play.google.com/store/apps/details?id=uz.yolda.driver' }],
                ],
                remove_keyboard: true,
              },
            },
          );
        }
      } catch (e) {
        this.logger.error(`Message xato: ${e.message}`);
        await this.bot.sendMessage(chatId, 'Xatolik yuz berdi. Qayta urinib ko\'ring.').catch(() => {});
      }
    });
  }

  /**
   * Telefon raqam bilan haydovchini topish
   */
  private async _handlePhone(chatId: number, rawPhone: string, telegramId: string) {
    let phone = rawPhone.replace(/[\s\-\(\)]/g, '');
    if (!phone.startsWith('+')) phone = '+' + phone;
    if (phone.startsWith('+998') === false && phone.length === 10) phone = '+998' + phone;

    // DB dan topish
    const profile = await this.prisma.driverProfile.findFirst({
      where: {
        OR: [
          { phone },
          { phone: phone.replace('+', '') },
          { phone: { endsWith: phone.slice(-9) } },
        ],
      },
      include: { user: true },
    });

    if (!profile) {
      await this.bot.sendMessage(chatId,
        '❌ Bu raqam bilan haydovchi topilmadi.\n\nAvval ilovadan ro\'yxatdan o\'ting.',
        { reply_markup: { remove_keyboard: true } },
      );
      this.userStates.delete(chatId);
      return;
    }

    // Telegram ID ni yangilash (agar hali bog'lanmagan bo'lsa)
    if (profile.user && !profile.user.telegramId?.startsWith(String(telegramId))) {
      // Telegram ID ni saqlash — keyingi safar /start da avtomatik taniydi
    }

    const name = profile.fullName || profile.user?.firstName || 'Haydovchi';

    this.userStates.set(chatId, {
      step: 'awaiting_password',
      phone: profile.phone,
      profileId: profile.id,
      driverName: name,
    });

    await this.bot.sendMessage(chatId,
      `Hurmatli ${name}, sizni topdik! ✅\n\nYangi parolni yozing (kamida 6 ta belgi):`,
      { reply_markup: { remove_keyboard: true } },
    );
  }
}
