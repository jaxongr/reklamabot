import { Injectable, Inject, Logger, forwardRef } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { SystemConfigService } from '../common/system-config.service';
import { AppGateway } from '../gateway/app.gateway';
import { SmsService } from '../sms/sms.service';
import { TelegramSmsService } from '../telegram-sms/telegram-sms.service';
import { BlockReason } from '@prisma/client';
import {
  DISPATCHER_KEYWORDS,
  FEMALE_NAMES,
  FOREIGN_DESTINATIONS,
} from './data/dispatcher-keywords';
import { findCitiesInText } from './data/city-distances';

export interface SenderInfo {
  telegramId: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

export interface FilterContext {
  messageText: string;
  groupTitle: string;
  groupTelegramId: string;
  messageId?: string;
  senderAccessHash?: string;
  sender: SenderInfo;
  phone?: string;
  monitorSessionId: string;
  userId: string;
  businessModule?: string;
}

export interface FilterResult {
  blocked: boolean;
  reason?: BlockReason;
  ruleNumber?: number;
  description?: string;
}

interface TrackerEntry {
  groups: Set<string>;
  count: number;
  firstSeen: number;
}

@Injectable()
export class MessageFilterService {
  private readonly logger = new Logger(MessageFilterService.name);

  // In-memory trackers
  private readonly userGroupTracker = new Map<string, TrackerEntry>();
  private readonly userMessageTracker = new Map<string, TrackerEntry>();
  private readonly phoneGroupTracker = new Map<string, TrackerEntry>();

  // Rule 14-15: Redis-based route tracker (restart-safe)

  // Whitelist cache
  private whitelistCache: Set<string> | null = null;
  private whitelistCacheTime = 0;
  private readonly WHITELIST_CACHE_TTL = 60_000; // 1 min

  // Blocked users in-memory cache (DB query kamaytirish uchun)
  private blockedIdsCache: Set<string> | null = null;
  private blockedPhonesCache: Set<string> | null = null;
  private blockedCacheTime = 0;
  private readonly BLOCKED_CACHE_TTL = 60_000; // 60 sek (10 sek juda tez — har xabarda DB query)

  // Cleanup interval
  private cleanupInterval: NodeJS.Timeout;
  private readonly TRACKER_TTL = 120_000; // 2 min cleanup

  constructor(
    private readonly prisma: PrismaService,
    private readonly systemConfig: SystemConfigService,
    private readonly gateway: AppGateway,
    private readonly smsService: SmsService,
    @Inject(forwardRef(() => TelegramSmsService))
    private readonly telegramSmsService: TelegramSmsService,
    private readonly redis: RedisService,
  ) {
    this.cleanupInterval = setInterval(() => this.cleanupTrackers(), this.TRACKER_TTL);
  }

  onModuleDestroy() {
    clearInterval(this.cleanupInterval);
  }

  /**
   * Quick check: sender already blocked? (no full rule pipeline)
   * Used BEFORE dedup to catch manually blocked senders immediately.
   */
  async isBlockedSender(telegramId: string, phone: string): Promise<boolean> {
    const { blockedIds, blockedPhones } = await this.getBlockedCache();
    if (telegramId && blockedIds.has(telegramId)) return true;
    if (phone && blockedPhones.has(phone)) return true;
    if (phone && blockedIds.has(`phone_${phone}`)) return true;
    return false;
  }

  /**
   * Main filter pipeline — 13 qoida
   */
  async filterMessage(ctx: FilterContext): Promise<FilterResult> {
    const { messageText, sender, phone } = ctx;
    const text = messageText;
    const textLower = text.toLowerCase();
    // Taksi (shaharlararo) — Rule 2 (dispetcher nom), 3 (ayol ism), 14 (soxta yo'nalish) qo'llanmaydi
    const isTaksi = ctx.businessModule === 'TAKSI';

    // Whitelist tekshiruv
    const whitelist = await this.getWhitelist();
    if (whitelist.has(sender.telegramId)) {
      return { blocked: false };
    }
    if (phone && whitelist.has(phone)) {
      return { blocked: false };
    }

    // Allaqachon bloklangan — IN-MEMORY CACHE orqali (DB query kamaytirish)
    const { blockedIds, blockedPhones } = await this.getBlockedCache();
    if (sender.telegramId && blockedIds.has(sender.telegramId)) {
      return {
        blocked: true,
        reason: BlockReason.LONG_MESSAGE,
        ruleNumber: 0,
        description: `Avval bloklangan (ID cache)`,
      };
    }
    // Phone bo'yicha ham bloklangan bo'lishi mumkin (phone_+998... yoki to'g'ridan-to'g'ri)
    if (phone && blockedPhones.has(phone)) {
      return {
        blocked: true,
        reason: BlockReason.LONG_MESSAGE,
        ruleNumber: 0,
        description: `Avval bloklangan (telefon cache)`,
      };
    }
    // Phone orqali bloklangan sender — telegramId `phone_+998...` bo'lishi mumkin
    if (phone && blockedIds.has(`phone_${phone}`)) {
      return {
        blocked: true,
        reason: BlockReason.LONG_MESSAGE,
        ruleNumber: 0,
        description: `Avval bloklangan (phone->id cache)`,
      };
    }

    // senderTelegramId bo'sh bo'lsa, faqat telefon tekshirildi, qolgan qoidalar o'tkazilsin
    if (!sender.telegramId) {
      return { blocked: false };
    }

    // ===== RULE 1: SPAM KONTENTI — hashtag, vakansiya, reklamali xabar =====
    // 4+ hashtag
    const hashtagCount = (text.match(/#\S+/g) || []).length;
    if (hashtagCount >= 4) {
      return this.persistBlock(ctx, BlockReason.LONG_MESSAGE, 1,
        `Spam kontenti: ${hashtagCount} ta hashtag`);
    }
    // Vakansiya/reklama/app promo kalit so'zlari
    const spamKeywords = [
      // Vakansiya
      'вакансия', 'vakansiya', 'ищу работу', 'ищу сотрудника',
      'резюме', 'собеседование', 'оклад', 'зарплата',
      'заработок', 'подработка', 'удалённ', 'удаленн', 'фриланс',
      // Reklama/marketing
      'авито', 'avito', 'продвижени', 'трафик',
      'маркетинг', 'smm', 'таргет', 'арбитраж',
      // Kripto/investitsiya
      'криптовалют', 'crypto', 'bitcoin', 'биткоин',
      'инвестиц', 'пассивный доход', 'mlm', 'сетевой',
      // Qimor
      'казино', 'casino', 'ставк', 'букмекер',
      // Ta'lim spam
      'обучение', 'тренинг', 'вебинар', 'марафон',
      // App reklama / agregator
      'agregator', 'агрегатор', 'ilovani yuklab', 'скачайте приложение',
      'yuklab oling', 'скачать', 'скачайте',
      'bonus', 'бонус', 'komissiya', 'комиссия', '0% komissiya', '0% комисси',
      "ro'yxatdan o'ting", 'регистрируйтесь', 'зарегистрируйтесь',
      'промокод', 'promokod', 'promo kod', 'referral', 'реферал',
      'cashback', 'кэшбэк', 'кешбек',
      // Kanalga obuna
      'подписывайтесь', 'obuna bo\'ling', 'kanalga obuna',
      'каналга обуна', 'подписка на канал',
      // Dispatcher xabarlar — yuk emas, dispetcher izlash
      'dispetcher kerak', 'dispetcher kk', 'диспетчер керак', 'диспетчер кк',
      'диспатчер нужен', 'ищем диспетчера', 'нужен диспетчер',
      'logist kerak', 'логист керак', 'логист нужен', 'ищем логиста',
      'lagist no', 'logist no', 'lagis no', 'логист но', 'логист ном', 'логист tel',
      'lagis kerakmas', 'lagist kerakmas', 'logist kerakmas',
      'lagis kerak emas', 'lagist kerak emas', 'logist kerak emas',
      'lagis kmas', 'lagist kmas', 'logist kmas',
      'логист керакмас', 'логист керак эмас', 'логист не нужен',
      'dispetcher kerakmas', 'dispechr kerakmas', 'диспетчер керакмас',
      'dispetcher kerak emas', 'диспетчер керак эмас', 'диспетчер не нужен',
      'ekspeditor kerak', 'экспедитор нужен', 'ищем экспедитора',
      // Mashina sotish e'lonlari — yuk emas
      'sotiladi', 'sotaman', 'sotamiz', 'sotuv',
      'продается', 'продаю', 'продам', 'продаётся',
      'сотилади', 'сотаман', 'сотамиз', 'сотувга',
      'sotip olaman', 'сотиб оламан', 'сотиб оламиз',
      'sotuvga', 'сотувга', 'sotmoqchiman', 'сотмоқчиман',
      // Mashina sotish — $ narx + mashina turi (yuk emas)
      'срочно сот', 'srocno sot',
      // Katalizator sotib olish spam
      'катализатор', 'katalizator',
      // Quduq qazish xizmati
      'кудук кав', 'кудук каз', 'kuduk kav', 'калодис',
      // Firibgarlik ogohlantirishlari
      'фирибгар', 'firibgar', 'алданиб', 'aldanib',
      'клик номер', 'КЛИК НОМЕР',
      // Ijara/arenda
      'ijaraga', 'ижарага', 'arendaga', 'арендага',
      'arenda kerak', 'аренда керак',
      // Akkumulator optom spam (yo'nalishli bo'lsa haqiqiy yuk)
      'аккумулятор бор оптом', 'akkumulator bor optom',
      // Ehtiyot qism / ta'mirlash
      'галофка керак', 'galofka kerak', 'мотор оламиз',
      'документ оламиз', 'дакумит оламиз',
      // Kredit / avtomobil sotish
      'бош тулов', 'bosh tulov', 'кредитга',
      // Ishchi izlash (yuk bilan bog'liq emas)
      'fast food', 'электрик', 'перфоратор', 'затирка',
      // Metallom/temir
      'металлом оламиз', 'metallom olamiz', 'металлом олам',
      // Mashina topib beraman (broker spam)
      'mashina topib beraman', 'машина топиб берам',
      'yuk topib beraman', 'юк топиб берам',
      // Mehmonxona/yotoqxona reklama
      'мехмонхона', 'mexmonxona', 'yotoqxona', 'ётоқхона',
      // Qo'y qirqish va boshqa xizmatlar
      "qo'y qirqamiz", 'кой кирками',
      // Kredit telefon/mashina
      'kriditga ayfon', 'kriditga telefon', 'кредитга айфон',
      // Gruzchik (yuk emas, ishchi)
      'грузчик бор', 'грузчик бол', 'yukchilar diqatiga',
      // Avtokran/vishka
      'автокран хизмат', 'avtokran xizmat', 'вишка мошин',
      // Vulkanizatsiya
      'вулканизатсия', 'vulkanizatsiya',
      // Pul o'tkazish scam
      'карта перевот рубил', 'карта перевод',
      // Kafel/ta'mir
      'кафел 100', 'кафел оли',
      // Mashina sotish — typo variantlari
      'sotladi', 'сотлади', 'sotilad', 'сотилад',
      'sotib oling', 'сотиб олинг',
      'sotuvda', 'сотувда', 'продажа',
      // Mashina sotish belgilari — yil + probeg
      'пробег', 'probeg', 'пробеги', 'прабег',
      // Shofir/shofer kerak = ishchi izlash, yuk emas
      'shofir kerak', 'шофир керак', 'шофёр керак',
      'shofyor kerak', 'шофёр нужен', 'шофер нужен',
      'shofer kerak', 'шофер керак', 'шоферр керак',
      'shofir kk', 'shofer kk', 'шофер кк', 'шофёр кк',
      'shofir kerka', 'шофир керка',
      'требуется водитель', 'нужен водитель', 'ищем водителя',
      'водитель нужен', 'водитель керак',
      'haydovchi kerak', 'ҳайдовчи керак', 'хайдовчи керак',
      // Butka/xizmat reklama
      'butka xizmat', 'бутка хизмат',
      'tent butka', 'тент бутка',
      // Adblue/kimyoviy
      'adblue', 'адблю',
      // Pul ayirboshlash
      'доллар сотаман', 'доллар оламан',
      'dollar sotaman', 'dollar olaman',
      // Zapchast sotish (yuk emas)
      'zapchast sotaman', 'запчаст сотаман',
      'zapchast bor optom', 'запчаст оптом',
      'ehtiyot qism', 'эхтиёт қисм',
      // Gruzchik izlash
      'грузчик керак', 'gruzchik kerak',
      'грузчик кк', 'gruzchik kk',
      'yukchi kerak', 'юкчи керак',
      // Mashina/texnika ijarasi
      'аренда машин', 'arenda mashin',
      'ijaraga beraman', 'ижарага бераман',
      'ijaraga olaman', 'ижарага оламан',
      // Kluch/asbob sotish
      'kluch nabor', 'ключ набор',
      'optom narxida', 'оптом нархида',
      // Mashina nomer/dokument izlash (yuk emas)
      'nomeri kerak', 'номери керак', 'nomerini', 'номерини',
      'гос номер', 'gos nomer', 'texpassport', 'техпаспорт',
      // Moyka/xizmat ochildi
      'moyka ochildi', 'мойка очилди', 'moyka ochildi',
      'avtomoyka', 'автомойка',
      // Scammer/firibgar ogohlantirish
      'машеник', 'мошенник', 'mashennik', 'moshennik',
      'firibgar', 'фирибгар', 'aldamchi', 'алдамчи',
      'reklama tarqatmang', 'реклама тарқатманг',
      // Uy/kvartira/xona ijarasi
      'комната', 'komnata', 'койка', 'koyka',
      'квартира', 'kvartira', 'uy ijara', 'уй ижара',
      // Yuk yuklash/tushirish xizmati (logistik xizmat, yuk emas)
      'yuk yuklash tushirish', 'юк юклаш тушириш',
      'yuk ortamiz tush', 'юк ортамиз туш',
      'грузчик хизмат', 'gruzchik xizmat',
      // Mashina sotish — bosh tulov/kredit (yuk emas)
      'bosh tulov', 'бош тулов', 'бош тўлов',
      'bosh tolov', 'бош толов',
      // Vulkanizatsiya — keng patternlar
      'vulkanizatsa', 'vulkanizas', 'вулканизас', 'вулканизатс',
      'визов вулканизац', 'vyzov vulkaniz', 'вызов вулканиз',
      // Maklер/ko'chmas mulk
      'маклер', 'makler',
      // Metallom sotib olish
      'металлом оламиз', 'metallom olamiz',
      'металлом олам', 'metallom olam',
      // Qarz yopish xizmati
      'қарзларингизни', 'кредит ёпиб',
      'қарзи борми', 'qarzingizni',
      // Xitoy/chet spam
      '抖音', '日赚', '油卡',
      // Samosval/texnika sotish (yuk emas)
      'срочно сотилади', 'sotiladi срочно',
      // Koyka/yotoq
      'койка-место', 'койка место',
      // Na svyazi spam (faqat telefon)
      'на связи +', 'na svyazi',
      // Yozish uchun quyidagi (guruh reklama)
      'yozish uchun quyidagi', 'ёзиш учун',
      // Logist/lagist bn hamkorlik (xizmat)
      'lagislar bn', 'логистлар билан',
      // Foiz/oylik (ish izlash)
      'фоизгами ойликами', 'foizga oylik',
      // Pravaga ish kerak
      'правага иш', 'правага ish',
      // Remont/ta'mir xizmat
      'ремонт хизмат', 'remont xizmat',
      // Elektrik/perforator (ish)
      'электрик хизмат', 'elektrik xizmat',
    ];
    for (const kw of spamKeywords) {
      if (textLower.includes(kw)) {
        return this.persistBlock(ctx, BlockReason.LONG_MESSAGE, 1,
          `Spam kontenti: "${kw}" topildi`);
      }
    }

    // Mashina sotish e'loni — yil + probeg (narx/kredit) — yo'nalish yo'q
    // "Йили 2023 прабеги 170000" yoki "2022 йил 60 куб"
    const vehicleSalePattern = /(?:йили?\s*20[12]\d|20[12]\d\s*йили?|yili?\s*20[12]\d|20[12]\d\s*yili?)\s.*?(?:пр[ао]бег|probeg|холат|xolat|кредит|kredit|нарх|narx|доллар|dollar)/i;
    if (vehicleSalePattern.test(text)) {
      const cities = findCitiesInText(text);
      if (cities.length < 2) {
        return this.persistBlock(ctx, BlockReason.LONG_MESSAGE, 1,
          'Mashina sotish e\'loni (yil + probeg/narx)');
      }
    }

    // Mashina/texnika sotish — mashina brend + $ narx (yo'nalish yo'q)
    // "HOWO MIXSER ... 55 000$" yoki "SHACMAN 2014 ... 39 000$"
    const vehicleBrandSale = /(?:howo|shacman|sinotruk|faw|dongfeng|foton|jac|isuzu\s*(?:nkr|npr|ftr|fvr)|камаз|man\s+tg[sxa]|volvo\s+f[hm]|scania|daf|mercedes|actros|axor)/i;
    if (vehicleBrandSale.test(text) && /\d+[\s.,]*(?:000)?\s*\$/.test(text)) {
      const cities = findCitiesInText(text);
      if (cities.length < 2) {
        return this.persistBlock(ctx, BlockReason.LONG_MESSAGE, 1,
          'Mashina/texnika sotish e\'loni (brend + $ narx)');
      }
    }

    // Telegram link spam (yo'nalishsiz)
    if (/https?:\/\/t\.me\//i.test(text)) {
      const cities = findCitiesInText(text);
      if (cities.length < 2) {
        return this.persistBlock(ctx, BlockReason.LONG_MESSAGE, 1,
          'Telegram link spam (yo\'nalishsiz)');
      }
    }

    // "No log/No logist" xabar oxirida yoki alohida qatorda
    const noLogEndPattern = /\b(?:no\s*log(?:ist)?|но\s*лог(?:ист)?|nо\s*lоg)\s*$/im;
    if (noLogEndPattern.test(text)) {
      return this.persistBlock(ctx, BlockReason.LONG_MESSAGE, 1,
        'No logist pattern (xabar oxirida)');
    }

    // Dispatcher so'z + "kerakmas/kerak emas/no/❌/безовта/шартмас" universal pattern
    const dispatcherNoPattern = /(?:lagis[t]?|logist?|логист|dispechr?|dispetcher|dispichir|диспетчер|диспечир|диспичир|диспечер|экспедитор|ekspeditor)\s*(?:kerakmas|kerak\s*emas|kmas|керакмас|керак\s*эмас|не\s*нужен|no\b|kk\b|❌|безовта|шартмас|kirakmas|kirak\s*emas)/i;
    if (dispatcherNoPattern.test(text)) {
      const match = text.match(dispatcherNoPattern);
      return this.persistBlock(ctx, BlockReason.LONG_MESSAGE, 1,
        `Dispatcher reklama: "${match?.[0]}" topildi`);
    }

    // Dispatcher so'z + emoji (❌🚫⛔🛑✖) — "Log❌", "Лог🚫", "logist❌"
    const dispatcherEmojiPattern = /(?:lagis[t]?|logist?|log|лог(?:ист)?|disp(?:etcher|echr|ichir)?|дисп(?:етчер|ечир|ичир|ечер)?|экспед(?:итор)?|eksped(?:itor)?)\s*[❌🚫⛔🛑✖\u274C\u{1F6AB}\u26D4\u{1F6D1}]/iu;
    if (dispatcherEmojiPattern.test(text)) {
      const match = text.match(dispatcherEmojiPattern);
      return this.persistBlock(ctx, BlockReason.LONG_MESSAGE, 1,
        `Dispatcher emoji: "${match?.[0]}" topildi`);
    }

    // Unicode invisible belgilar (ᅠ, zero-width space) — spam formatlovchi
    const invisibleChars = (text.match(/[\u1160\u3164\u200B\u200C\u200D\u2060\uFEFF\u00A0]/g) || []).length;
    if (invisibleChars >= 3) {
      return this.persistBlock(ctx, BlockReason.LONG_MESSAGE, 1,
        `Spam formatlovchi: ${invisibleChars} ta yashirin belgi`);
    }

    // ===== RULE 2-3: TAKSIда qo'llanmaydi (dispetcher nomi / ayol ismi) =====
    if (!isTaksi) {
    // ===== RULE 2: Dispatcher keyword in username/name =====
    const nameStr = [sender.firstName, sender.lastName, sender.username]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    for (const kw of DISPATCHER_KEYWORDS) {
      if (nameStr.includes(kw)) {
        return this.persistBlock(ctx, BlockReason.DISPATCHER_NAME, 2,
          `Dispatcher so'z: "${kw}" — ${nameStr}`);
      }
    }
    // Nostandart Unicode belgilar (cuneiform, symbols, hieroglyphics) — spam account
    const exoticChars = nameStr.match(/[\u{10000}-\u{1FFFF}]/gu);
    if (exoticChars && exoticChars.length >= 3) {
      return this.persistBlock(ctx, BlockReason.DISPATCHER_NAME, 2,
        `Nostandart Unicode nom: ${exoticChars.length} ta exotic belgi — ${nameStr.substring(0, 50)}`);
    }

    // ===== RULE 3: Ayol ismi profilada =====
    // Emoji va maxsus belgilarni olib tashlash (masalan "🌺Aziza🌺" → "aziza")
    const rawFirstName = (sender.firstName || '').toLowerCase().trim();
    const firstNameLower = rawFirstName
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, '')
      .replace(/[^\p{L}\p{N}\s'-]/gu, '')
      .trim();
    // Familiya suffixlari — -ova, -eva, -ovna — ayol belgisi
    const fullNameLower = nameStr.toLowerCase();
    if (/\b\w+(ova|eva|ovna|evna)\b/.test(fullNameLower) ||
        /\b\w+(ова|ева|овна|евна)\b/.test(fullNameLower)) {
      // Familiyasi ayol shaklida — tekshirish
      const hasManName = ['murod', 'sardor', 'bahodir', 'jamshid', 'sherzod',
        'dilshod', 'farxod', 'baxodir', 'obid', 'mansur', 'rustam', 'alisher',
        'мурод', 'сардор', 'баходир', 'жамшид', 'шерзод', 'дилшод'].some(
          m => firstNameLower.startsWith(m)
        );
      if (!hasManName) {
        return this.persistBlock(ctx, BlockReason.FEMALE_NAME, 3,
          `Ayol familiyasi (-ova/-eva): ${nameStr.substring(0, 50)}`);
      }
    }
    for (const name of FEMALE_NAMES) {
      if (firstNameLower === name || firstNameLower.startsWith(name)) {
        return this.persistBlock(ctx, BlockReason.FEMALE_NAME, 3,
          `Ayol ismi: "${name}" — ${firstNameLower}`);
      }
    }
    } // /if (!isTaksi) — Rule 2-3 tugadi

    // ===== RULE 4: 30+ takrorlanuvchi belgi =====
    if (/(.)\1{29,}/.test(text)) {
      return this.persistBlock(ctx, BlockReason.REPEATED_CHARS, 4,
        'Takrorlanuvchi belgilar');
    }

    // ===== RULE 5: Xorijiy manzil — O'CHIRILGAN =====
    // Rossiya va boshqa mamlakatlar yo'nalishlari ham Order sifatida qabul qilinadi
    // Rule 5 endi ishlamaydi — foydalanuvchi barcha yo'nalishlarni ko'rmoqchi

    // ===== RULE 6: 2+ @mention =====
    const mentions = text.match(/@\w+/g);
    if (mentions && mentions.length >= 2) {
      return this.persistBlock(ctx, BlockReason.MULTIPLE_MENTIONS, 6,
        `${mentions.length} ta mention`);
    }

    // ===== RULE 7: 200+ belgi uzunlik =====
    if (text.length > 200) {
      return this.persistBlock(ctx, BlockReason.LONG_MESSAGE, 7,
        `Xabar uzunligi: ${text.length}`);
    }

    // ===== RULE 8: 3+ emoji =====
    const emojiCount = (text.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu) || []).length;
    if (emojiCount >= 3) {
      return this.persistBlock(ctx, BlockReason.EXCESSIVE_EMOJI, 8,
        `${emojiCount} ta emoji`);
    }

    // ===== RULE 9: 3+ bo'sh qator =====
    const emptyLines = (text.match(/\n\s*\n/g) || []).length;
    if (emptyLines >= 3) {
      return this.persistBlock(ctx, BlockReason.EXCESSIVE_NEWLINES, 9,
        `${emptyLines} ta bo'sh qator`);
    }

    // ===== RULE 10: 12+ guruhda faol (5 min) =====
    const userTracker = this.trackUserGroup(sender.telegramId, ctx.groupTelegramId);
    if (userTracker.groups.size >= 12) {
      return this.persistBlock(ctx, BlockReason.USER_MULTI_GROUP, 10,
        `${userTracker.groups.size} guruhda faol (5 min)`);
    }

    // ===== RULE 11: 10+ xabar (5 min) =====
    const msgTracker = this.trackUserMessage(sender.telegramId);
    if (msgTracker.count >= 10) {
      return this.persistBlock(ctx, BlockReason.USER_SPAM_RATE, 11,
        `${msgTracker.count} ta xabar (5 min)`);
    }

    // ===== RULE 12: Telefon 15+ guruhda (10 min) =====
    if (phone) {
      const phoneTracker = this.trackPhoneGroup(phone, ctx.groupTelegramId, 10);
      if (phoneTracker.groups.size >= 12) {
        return this.persistBlock(ctx, BlockReason.PHONE_MULTI_GROUP, 12,
          `Telefon ${phone} — ${phoneTracker.groups.size} guruhda (10 min)`);
      }

      // ===== RULE 13: Telefon 20+ guruhda (30 min) → SUPER BLOCK =====
      const phoneSuperTracker = this.trackPhoneGroup(`super_${phone}`, ctx.groupTelegramId, 30);
      if (phoneSuperTracker.groups.size >= 20) {
        return this.persistBlock(ctx, BlockReason.PHONE_SUPER_SPAM, 13,
          `SUPER BLOCK: Telefon ${phone} — ${phoneSuperTracker.groups.size} guruhda (30 min)`);
      }
    }

    // ===== RULE 14-15: Soxta ko'p yo'nalish — TAKSIда qo'llanmaydi (haydovchi ko'p yo'nalishda yuradi) =====
    if (!isTaksi && sender.telegramId) {
      const cities = findCitiesInText(text);
      if (cities.length >= 2) {
        const from = cities[0].name;
        const to = cities[1].name;
        const routeKey = `${from}→${to}`;
        const redisKey = `route_tracker:${sender.telegramId}`;

        try {
          // Redis dan oldingi yo'nalishlarni olish
          const existing = await this.redis.get<{ routes: string[]; froms: string[] }>(redisKey);
          const routes = new Set<string>(existing?.routes || []);
          const froms = new Set<string>(existing?.froms || []);

          routes.add(routeKey);
          froms.add(from);

          // Redis ga saqlash (3 kun TTL)
          await this.redis.set(redisKey, {
            routes: Array.from(routes),
            froms: Array.from(froms),
          }, 3 * 24 * 3600); // 3 kun

          // RULE 14: 7+ yo'nalish, 6+ xil A, 6+ xil B (haqiqiy yuk tashuvchilar ham 3-5 yo'nalishda ishlaydi)
          if (routes.size >= 7 && froms.size >= 6) {
            const routesArr = Array.from(routes);
            const allFroms = routesArr.map(r => r.split('→')[0]);
            const allTos = routesArr.map(r => r.split('→')[1]);
            const uniqueFroms = new Set(allFroms);
            const uniqueTos = new Set(allTos);

            const isRoundTrip = routesArr.length === 2 &&
              allFroms[0] === allTos[1] && allFroms[1] === allTos[0];

            if (!isRoundTrip && uniqueFroms.size >= 6 && uniqueTos.size >= 6) {
              return this.persistBlock(ctx, BlockReason.FAKE_MULTI_ROUTE, 14,
                `Soxta ko'p yo'nalish: ${routesArr.slice(0, 5).join(', ')} (${uniqueFroms.size} xil A, ${uniqueTos.size} xil B)`);
            }
          }

          // RULE 15: 12+ butunlay boshqa yo'nalish (oldin 5+ juda past edi)
          if (routes.size >= 12) {
            const routesArr = Array.from(routes);
            return this.persistBlock(ctx, BlockReason.FAKE_MULTI_ROUTE, 15,
              `Dispetcher soxtaligi: ${routes.size} xil yo'nalish (${routesArr.slice(0, 4).join(', ')}...)`);
          }
        } catch (e) {
          // Redis xato — skip, bloklamaslik
        }
      }
    }

    // ===== RULE 16: Salarka/benzin reklama (yo'nalishsiz) =====
    const salarkaPats = ['саларка', 'salarka', 'бензин оптом', 'газ заправка'];
    const hasSalarka = salarkaPats.some(p => textLower.includes(p));
    if (hasSalarka) {
      const cities = findCitiesInText(text);
      // Yo'nalish yo'q — faqat salarka reklama
      if (cities.length < 2) {
        return this.persistBlock(ctx, BlockReason.LONG_MESSAGE, 16,
          `Salarka/benzin reklama (yo'nalishsiz)`);
      }
    }

    // Hammasi o'tdi — track qilish
    return { blocked: false };
  }

  /**
   * Bloklashni DB ga saqlash va WS orqali emit
   */
  private async persistBlock(
    ctx: FilterContext,
    reason: BlockReason,
    ruleNumber: number,
    description: string,
  ): Promise<FilterResult> {
    try {
      // Matndan noto'g'ri belgilarni tozalash (PostgreSQL hex escape xatolik oldini olish)
      const sanitize = (s: string) => s
        .replace(/\x00/g, '')                                  // null bytes
        .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')    // control characters
        .replace(/\\x[0-9a-fA-F]*/g, '')                       // any hex escape sequences
        .replace(/\\u[0-9a-fA-F]*/g, '')                       // unicode escapes
        .replace(/\\/g, '/')                                   // remaining backslashes
        ;

      const safeText = sanitize(ctx.messageText.substring(0, 500));
      const safeGroupTitle = sanitize(ctx.groupTitle || '');

      const safeSenderName = sanitize([ctx.sender.firstName, ctx.sender.lastName].filter(Boolean).join(' ') || '');

      const safeSenderUsername = ctx.sender.username ? sanitize(ctx.sender.username) : null;
      const safePhone = ctx.phone ? sanitize(ctx.phone) : null;
      const safeTelegramId = sanitize(ctx.sender.telegramId || '');
      const safeGroupTelegramId = sanitize(ctx.groupTelegramId || '');

      const blocked = await this.prisma.blockedUser.create({
        data: {
          userId: ctx.userId,
          senderTelegramId: safeTelegramId,
          senderName: safeSenderName || null,
          senderUsername: safeSenderUsername,
          reason,
          ruleNumber,
          messageText: safeText,
          groupTitle: safeGroupTitle,
          groupTelegramId: safeGroupTelegramId,
          phone: safePhone,
          monitorSessionId: ctx.monitorSessionId,
          isActive: true,
        },
      });

      // Update monitor session stats
      await this.prisma.monitorSession.update({
        where: { id: ctx.monitorSessionId },
        data: { blocksFound: { increment: 1 } },
      }).catch(() => {});

      // WS emit
      this.gateway.sendToUser(ctx.userId, 'block:new', {
        id: blocked.id,
        senderTelegramId: ctx.sender.telegramId,
        senderName: blocked.senderName,
        reason,
        ruleNumber,
        groupTitle: ctx.groupTitle,
        phone: ctx.phone,
        description,
        createdAt: blocked.createdAt,
      });

      // Cache invalidate — yangi blok qo'shildi
      this.invalidateBlockedCache();

      // Auto-SMS: bloklangan foydalanuvchiga avtomatik SMS
      this.smsService.onNewBlockedUser({
        phone: ctx.phone,
        senderName: blocked.senderName,
        reason: String(reason),
      }).catch(() => {});

      // Auto-TG SMS: Telegram orqali DM yuborish
      this.telegramSmsService.onNewBlockedUser({
        senderTelegramId: ctx.sender.telegramId,
        senderName: blocked.senderName,
        senderUsername: ctx.sender.username,
        phone: ctx.phone,
        reason: String(reason),
        monitorSessionId: ctx.monitorSessionId,
        sourceGroupId: ctx.groupTelegramId,
        sourceMessageId: ctx.messageId,
        senderAccessHash: ctx.senderAccessHash,
      }).catch(() => {});

      this.logger.log(
        `BLOCKED [Rule ${ruleNumber}] ${reason}: ${description} (user: ${ctx.sender.telegramId})`,
      );
    } catch (error) {
      this.logger.error(`Block saqlashda xatolik: ${error.message}`);
    }

    return { blocked: true, reason, ruleNumber, description };
  }

  // ============================================================
  // IN-MEMORY TRACKERS
  // ============================================================

  private trackUserGroup(telegramId: string, groupId: string): TrackerEntry {
    const key = `ug_${telegramId}`;
    let entry = this.userGroupTracker.get(key);
    const now = Date.now();

    if (!entry || now - entry.firstSeen > 5 * 60_000) {
      entry = { groups: new Set(), count: 0, firstSeen: now };
      this.userGroupTracker.set(key, entry);
    }

    entry.groups.add(groupId);
    entry.count++;
    return entry;
  }

  private trackUserMessage(telegramId: string): TrackerEntry {
    const key = `um_${telegramId}`;
    let entry = this.userMessageTracker.get(key);
    const now = Date.now();

    if (!entry || now - entry.firstSeen > 5 * 60_000) {
      entry = { groups: new Set(), count: 0, firstSeen: now };
      this.userMessageTracker.set(key, entry);
    }

    entry.count++;
    return entry;
  }

  private trackPhoneGroup(phone: string, groupId: string, minutesTtl: number): TrackerEntry {
    const key = `pg_${phone}`;
    let entry = this.phoneGroupTracker.get(key);
    const now = Date.now();

    if (!entry || now - entry.firstSeen > minutesTtl * 60_000) {
      entry = { groups: new Set(), count: 0, firstSeen: now };
      this.phoneGroupTracker.set(key, entry);
    }

    entry.groups.add(groupId);
    entry.count++;
    return entry;
  }

  private cleanupTrackers() {
    const now = Date.now();
    const cleanMap = (map: Map<string, TrackerEntry>, ttlMs: number) => {
      for (const [key, entry] of map) {
        if (now - entry.firstSeen > ttlMs) {
          map.delete(key);
        }
      }
    };

    cleanMap(this.userGroupTracker, 5 * 60_000);
    cleanMap(this.userMessageTracker, 5 * 60_000);
    cleanMap(this.phoneGroupTracker, 30 * 60_000);

    // Route tracker — Redis-based, cleanup kerak emas
  }

  // ============================================================
  // WHITELIST
  // ============================================================

  private async getWhitelist(): Promise<Set<string>> {
    const now = Date.now();
    if (this.whitelistCache && now - this.whitelistCacheTime < this.WHITELIST_CACHE_TTL) {
      return this.whitelistCache;
    }

    try {
      const raw = await this.systemConfig.get('blocked_users_whitelist');
      if (raw) {
        const list: string[] = JSON.parse(raw);
        this.whitelistCache = new Set(list);
      } else {
        this.whitelistCache = new Set();
      }
    } catch {
      this.whitelistCache = new Set();
    }

    this.whitelistCacheTime = now;
    return this.whitelistCache;
  }

  /**
   * Whitelist invalidate (yangilanganda chaqiriladi)
   */
  invalidateWhitelistCache() {
    this.whitelistCache = null;
    this.whitelistCacheTime = 0;
  }

  /**
   * Blocked users in-memory cache — DB query o'rniga Set<string> tekshiruv
   */
  private async getBlockedCache(): Promise<{ blockedIds: Set<string>; blockedPhones: Set<string> }> {
    const now = Date.now();
    if (this.blockedIdsCache && this.blockedPhonesCache && now - this.blockedCacheTime < this.BLOCKED_CACHE_TTL) {
      return { blockedIds: this.blockedIdsCache, blockedPhones: this.blockedPhonesCache };
    }

    try {
      const blocked = await this.prisma.blockedUser.findMany({
        where: { isActive: true },
        select: { senderTelegramId: true, phone: true },
      });

      this.blockedIdsCache = new Set<string>();
      this.blockedPhonesCache = new Set<string>();

      for (const b of blocked) {
        if (b.senderTelegramId) this.blockedIdsCache.add(b.senderTelegramId);
        if (b.phone) this.blockedPhonesCache.add(b.phone);
      }
    } catch {
      this.blockedIdsCache = new Set();
      this.blockedPhonesCache = new Set();
    }

    this.blockedCacheTime = now;
    return { blockedIds: this.blockedIdsCache, blockedPhones: this.blockedPhonesCache };
  }

  /**
   * Blocked cache invalidate (yangi blok yoki unblock qilinganda)
   */
  invalidateBlockedCache() {
    this.blockedIdsCache = null;
    this.blockedPhonesCache = null;
    this.blockedCacheTime = 0;
  }

  // ============================================================
  // BLOCKED USERS CRUD (Controller dan chaqiriladi)
  // ============================================================

  async getBlockedUsers(params: {
    userId?: string;
    page?: number;
    limit?: number;
    search?: string;
    reason?: BlockReason;
  }) {
    const { userId, page = 1, limit = 20, search, reason } = params;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };
    if (userId) where.userId = userId;
    if (reason) where.reason = reason;
    if (search) {
      where.OR = [
        { senderName: { contains: search, mode: 'insensitive' } },
        { senderUsername: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { senderTelegramId: { contains: search } },
        { groupTitle: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.blockedUser.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.blockedUser.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getBlockStats(userId?: string) {
    const baseWhere: any = { isActive: true };
    if (userId) baseWhere.userId = userId;

    const [total, byReason, today, thisWeek] = await Promise.all([
      this.prisma.blockedUser.count({ where: baseWhere }),
      this.prisma.blockedUser.groupBy({
        by: ['reason'],
        where: baseWhere,
        _count: true,
      }),
      this.prisma.blockedUser.count({
        where: {
          ...baseWhere,
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      this.prisma.blockedUser.count({
        where: {
          ...baseWhere,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const reasonStats: Record<string, number> = {};
    byReason.forEach((r) => {
      reasonStats[r.reason] = r._count;
    });

    return { total, today, thisWeek, byReason: reasonStats };
  }

  async manualBlock(data: {
    userId: string;
    senderTelegramId: string;
    senderName?: string;
    senderUsername?: string;
    phone?: string;
    messageText: string;
    groupTitle: string;
    groupTelegramId: string;
  }) {
    // senderTelegramId yoki phone — kamida bittasi bo'lishi shart
    const telegramId = data.senderTelegramId?.trim() || '';
    const phone = data.phone?.trim() || null;

    if (!telegramId && !phone) {
      throw new Error('Bloklash uchun Telegram ID yoki telefon raqam kerak');
    }

    // Allaqachon bloklanganmi?
    const blockWhere: any[] = [];
    if (telegramId) blockWhere.push({ senderTelegramId: telegramId, isActive: true });
    if (phone) blockWhere.push({ phone, isActive: true });
    const existing = await this.prisma.blockedUser.findFirst({
      where: { OR: blockWhere },
    });
    if (existing) {
      this.logger.log(`MANUAL BLOCK: already blocked — ${telegramId || phone}`);
      return existing;
    }

    const sanitize = (s: string) => s
      .replace(/\x00/g, '')
      .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/\\x[0-9a-fA-F]*/g, '')
      .replace(/\\u[0-9a-fA-F]*/g, '')
      .replace(/\\/g, '');

    const blocked = await this.prisma.blockedUser.create({
      data: {
        userId: data.userId,
        senderTelegramId: sanitize(telegramId || `phone_${phone}`),
        senderName: data.senderName ? sanitize(data.senderName) : null,
        senderUsername: data.senderUsername ? sanitize(data.senderUsername) : null,
        reason: 'MANUAL_BLOCK' as any,
        ruleNumber: 0,
        messageText: sanitize(data.messageText.substring(0, 500)),
        groupTitle: sanitize(data.groupTitle),
        groupTelegramId: sanitize(data.groupTelegramId || ''),
        phone: phone ? sanitize(phone) : null,
        isActive: true,
      },
    });

    // Cache invalidate
    this.invalidateBlockedCache();

    // Auto-SMS: bloklangan foydalanuvchiga avtomatik SMS
    this.smsService.onNewBlockedUser({
      phone,
      senderName: blocked.senderName,
      reason: 'MANUAL_BLOCK',
    }).catch(() => {});

    // Auto-TG SMS: Telegram orqali DM yuborish
    if (telegramId && !telegramId.startsWith('phone_')) {
      this.telegramSmsService.onNewBlockedUser({
        senderTelegramId: telegramId,
        senderName: data.senderName,
        senderUsername: data.senderUsername,
        phone,
        reason: 'MANUAL_BLOCK',
      }).catch(() => {});
    }

    this.logger.log(`MANUAL BLOCK: ${data.senderName || telegramId || phone} (phone: ${phone || 'no phone'}, id: ${telegramId || 'no id'})`);

    // WS emit
    try {
      this.gateway.sendToUser(data.userId, 'block:new', {
        id: blocked.id,
        senderTelegramId: blocked.senderTelegramId,
        senderName: blocked.senderName,
        reason: 'MANUAL_BLOCK',
        ruleNumber: 0,
        phone,
      });
    } catch {}

    return blocked;
  }

  async unblockUser(id: string) {
    const result = await this.prisma.blockedUser.update({
      where: { id },
      data: { isActive: false, unblockedAt: new Date() },
    });
    this.invalidateBlockedCache();
    return result;
  }

  async getWhitelistEntries(userId: string): Promise<string[]> {
    const raw = await this.systemConfig.get('blocked_users_whitelist');
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  async addToWhitelist(entry: string) {
    const list = await this.getWhitelistEntries('');
    if (!list.includes(entry)) {
      list.push(entry);
      await this.systemConfig.set(
        'blocked_users_whitelist',
        JSON.stringify(list),
        'JSON' as any,
        'Bloklash oq ro\'yxati',
      );
    }
    this.invalidateWhitelistCache();
    return list;
  }

  async removeFromWhitelist(entry: string) {
    const list = await this.getWhitelistEntries('');
    const filtered = list.filter((e) => e !== entry);
    await this.systemConfig.set(
      'blocked_users_whitelist',
      JSON.stringify(filtered),
      'JSON' as any,
      'Bloklash oq ro\'yxati',
    );
    this.invalidateWhitelistCache();
    return filtered;
  }
}
