/**
 * Fix orders from last 3 days:
 * 1. Fill incomplete routes (cargoFrom/cargoTo)
 * 2. Block non-cargo ads (vehicle sales, rentals, job postings)
 * 3. Fix driver ads wrongly classified as CARGO
 * 4. Fix import/export misclassification
 */
const { PrismaClient, OrderType, OrderStatus } = require('@prisma/client');
const prisma = new PrismaClient();

// === NON-CARGO PATTERNS — yuk tashish bilan bog'liq emas ===
const NON_CARGO_PATTERNS = [
  // Mashina sotish
  /сотилади|сотлади|sotiladi|sotladi|продается|продаю|продам|продаётся/i,
  // Mashina sotish — yil + probeg
  /(?:йили?\s*20[12]\d|20[12]\d\s*йили?|yili?\s*20[12]\d)\s.*?(?:пр[ао]бег|probeg|холат|xolat|кредит|narx|нарх)/i,
  // Mashina ijarasi
  /(?:ижарага|ijaraga|арендага|arendaga)\s+(?:\d|берам|олам|бор|kerak|керак)/i,
  // Ishchi izlash (shofir/shofer kerak — yuk bilan bog'liq emas)
  /(?:шофир|шофёр|шофер|шоферр|шафёр|shofir|shofer|shofyor|shopir|haydovchi|ҳайдовчи|хайдовчи|водитель)\s+(?:керак|kerak|нужен|требуется|ищем|izlayapman|kk\b)/i,
  // Gruzchik izlash
  /(?:грузчик|gruzchik|юкчи|yukchi)\s+(?:керак|kerak|нужен|ишлари|bor\b|бор\b)/i,
  // 15 та бола кере... грузчик
  /\d+\s*та\s*бола.*(?:грузчик|gruzchik)/i,
  // Butka/tent xizmatlari
  /(?:tent\s*butka|тент\s*бутка)\s*(?:хизмат|xizmat|сифат|sifat)/i,
  // Asbob/instrument optom sotish
  /(?:клуч|ключ|kluch|nabor)\s.*?(?:оптом|optom)/i,
  // Adblue/kimyoviy
  /\badblue\b/i,
  // Electric/xizmat reklama (yo'nalishsiz)
  /\b(?:anvar\s*electric|электрик\s*хизмат)\b/i,
  // Mashina topib beraman (broker)
  /(?:mashina|машина|мошина)\s+(?:топиб|topib)\s+(?:берам|beram)/i,
  // Yuk topib beraman (broker)
  /(?:yuk|юк)\s+(?:топиб|topib)\s+(?:берам|beram)/i,
  // Katalizator
  /катализатор|katalizator/i,
  // Vulkanizatsiya
  /вулканизатсия|vulkanizatsiya/i,
  // Kanalizatsiya truba tashash (qurilish, yuk emas)
  /канализаци|kanalizatsi/i,
  // Pul ayirboshlash
  /(?:рубл|рубил|rubl).*(?:перевод|перевот|ayirbosh)/i,
  // Mexmonxona/yotoqxona
  /(?:мехмонхона|mexmonxona|yotoqxona|ётоқхона)/i,
];

// === DRIVER PATTERNS — haydovchi e'lonlari (CARGO → DRIVER ga o'tkazish) ===
const DRIVER_STRONG_PATTERNS = [
  // Mashina/transport taklif
  /(?:mashina|moshina|машина|мошина)\s+(?:bor|бор|bo'sh|бўш|буш|бош|tayyor|тайёр)/i,
  /(?:fura|фура)\s+(?:bor|бор|bo'sh|бўш|буш|бош|tayyor|тайёр)/i,
  /(?:isuzu?i?|исуз[иу])\s+(?:bor|бор|bo'sh|бўш|буш|бош)/i,
  /(?:kamaz|камаз)\s+(?:bor|бор|bo'sh|бўш|буш|бош)/i,
  /(?:gazel|газел)\s+(?:bor|бор|bo'sh|бўш|буш|бош)/i,
  /(?:labo|лабо)\s+(?:bor|бор|bo'sh|бўш|буш|бош)/i,
  /(?:tent|тент)\s+(?:bor|бор|bo'sh|бўш|буш|бош)/i,
  /(?:howo|хово)\s+(?:bor|бор|bo'sh|бўш|буш|бош)/i,
  /(?:shacman|chakman|шакман|чакман)\s+(?:bor|бор|bo'sh|бўш|буш|бош)/i,
  /(?:porter|портер)\s+(?:bor|бор|bo'sh|бўш|буш|бош)/i,
  /(?:sprinter|спринтер)\s+(?:bor|бор|bo'sh|бўш|буш|бош)/i,
  // Yuk olish
  /(?:yuk|юк|юу?к)\s+(?:olaman|olamiz|olamz|оламан|оламиз|олади)/i,
  /(?:yuk|юк)\s+(?:olib|олиб)\s+(?:ketaman|ketamiz|boraman|кетаман|кетамиз|бораман)/i,
  /(?:yuk|юк)\s+(?:tashiyman|tashiymiz|ташийман|ташиймиз)/i,
  /(?:yuk|юк)\s+(?:qabul|қабул)\s+(?:qilaman|qilamiz|қиламан|қиламиз)/i,
  // Yuk bolsa/busa
  /(?:yuk|юк)\s+(?:bolsa|bo'lsa|bulsa|busa|бўлса|болса|булса|буса)\s+(?:olam|олам|tashiy|таший)/i,
  // Yuk kerak + vehicle context
  /(?:yuk|юк|юу?к)\s+(?:kerak|керак|izlay|излай|qidir|қидир)\b/i,
  // Haydovchi / shofer identifiers
  /(?:haydovchiman|ҳайдовчиман|хайдовчиман|shoferman|шоферман|шофёрман)/i,
  /(?:men\s+haydovchi|мен\s+ҳайдовчи|biz\s+haydovchi|биз\s+ҳайдовчи)/i,
  // Shofer/shafyor bor
  /(?:шофёр|шофер|шоферр|шафёр|шафер|шопир|шофёор|shafyor|shofer|shopir|shofyor)\s+(?:бор|bor)/i,
  // Bo'sh qaytish
  /(?:бўш|буш|бош|bo'sh|bosh|bush)\s+(?:қайтаман|қайтамиз|кетаман|кетамиз|бораман|борамиз|qaytaman|qaytamiz|ketaman|ketamiz|boraman|boramiz)/i,
  // Zakazga
  /(?:zakazga|заказга)\s+(?:bor|бор|tayyor|тайёр|mashina|машина|fura|фура|isuzu|исуз|labo|лабо)/i,
  // Russian driver patterns
  /(?:машина|фура|газель|камаз|тент|реф|борт|исузу)\s+(?:есть|свободн|пустая|пустой|готов)/i,
  /(?:возьму|возьмем|возьмём|беру|берем|берём|заберу|заберем)\s+(?:груз|грузы)/i,
  /(?:ищу|ищем|нужен|нужна|нужны)\s+(?:груз|грузы|загрузк)/i,
  /(?:готов|готовы)\s+к\s+(?:погрузке|загрузке)/i,
  /(?:подам|подадим)\s+(?:машину|фуру)/i,
  /(?:еду|едем|иду|идем|идём)\s+(?:пустой|пустая|пустые|порожний|порожняком)/i,
  // "ТАЖРИБАЛИ ШОФЁР БОР" — experienced driver
  /(?:тажрибали|тажрибал|tajribali)\s.*?(?:шоф|shofer|haydovchi|ҳайдовчи)/i,
  // "КАТЕГОРИЯ БОР" — driver with license categories
  /(?:категория|kategoriya)\s+(?:бор|bor)/i,
  // "Узбекистон ичида ... шофёр бор"
  /(?:узбекист|o'zbekist|uzbekist).*?(?:шофёр|шофер|шафёр|шафер|шопир|haydovchi|ҳайдовчи|shofer|shafyor)\s+(?:бор|bor)/i,
];

// === ROUTE FIXING — common typo mappings ===
const CITY_TYPO_MAP = {
  // Toshkent typos
  'тошкетн': 'Toshkent', 'тошкетнд': 'Toshkent', 'тошкент': 'Toshkent',
  'ташке': 'Toshkent', 'ташкен': 'Toshkent', 'tashke': 'Toshkent', 'tosken': 'Toshkent',
  'towkent': 'Toshkent', 'toshket': 'Toshkent', 'тошкет': 'Toshkent',
  'тошкент': 'Toshkent', 'toshken': 'Toshkent', 'тошкен': 'Toshkent',
  'вокенит': 'Toshkent',
  // Navoiy typos
  'навойи': 'Navoiy', 'навои': 'Navoiy', 'navoyi': 'Navoiy',
  // Surxondaryo typos
  'сурхондарё': 'Surxondaryo', 'сурхондарйо': 'Surxondaryo', 'срдорйо': 'Surxondaryo',
  'surxondary': 'Surxondaryo', 'surhondary': 'Surxondaryo',
  // Xorazm typos
  'хораз': 'Xorazm', 'хоразим': 'Xorazm', 'xorazim': 'Xorazm',
  // Qo'qon typos
  'кукон': "Qo'qon", 'коканд': "Qo'qon", 'кокон': "Qo'qon",
  'quqon': "Qo'qon", 'kukon': "Qo'qon",
  // Ohangaron typos
  'охонгарон': 'Ohangaron', 'ахангарон': 'Ohangaron', 'ахангар': 'Ohangaron',
  'охангарон': 'Ohangaron', 'ohangar': 'Ohangaron',
  // Sirdaryo typos
  'сирдарё': 'Sirdaryo', 'сирдорё': 'Sirdaryo', 'сирдарйо': 'Sirdaryo',
  // Samarqand typos
  'самарканн': 'Samarqand', 'samarkan': 'Samarqand', 'самаркан': 'Samarqand',
  // Andijon typos
  'андижон': 'Andijon', 'андижо': 'Andijon',
  // Farg'ona typos
  'фаргона': "Farg'ona", 'фаргрна': "Farg'ona", 'фарган': "Farg'ona",
  // Namangan typos
  'наманга': 'Namangan',
  // Buxoro typos
  'бухоро': 'Buxoro', 'бухара': 'Buxoro',
  // Termiz typos
  'термиз': 'Termiz', 'термез': 'Termiz',
  // Qarshi typos
  'карш': 'Qarshi', 'қарш': 'Qarshi',
  // Denov typos
  'дено': 'Denov', 'денау': 'Denov',
  // Jizzax typos
  'жизак': 'Jizzax', 'жиззак': 'Jizzax', 'жиззах': 'Jizzax', 'жизах': 'Jizzax',
  'jizax': 'Jizzax', 'jizzak': 'Jizzax',
};

// Simple route extraction from text
function extractRoute(text) {
  const lower = text.toLowerCase();

  // Arrow pattern: A → B, A - B
  const arrowMatch = text.match(
    /([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']+(?:\s+[A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']+){0,2})\s*[-–—→➡►>⏩]\s*([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']+(?:\s+[A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']+){0,2})/
  );
  if (arrowMatch) {
    return { from: resolveCity(arrowMatch[1].trim()), to: resolveCity(arrowMatch[2].trim()) };
  }

  // dan...ga pattern
  const danGaMatch = text.match(
    /([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']+(?:\s+[A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']+)?)\s*(?:dan|дан)\s+[\s\S]*?([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']+(?:\s+[A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']+)?)\s*(?:ga|га|ge|ге|qa)\b/i
  );
  if (danGaMatch) {
    return { from: resolveCity(danGaMatch[1].trim()), to: resolveCity(danGaMatch[2].trim()) };
  }

  // Attached suffix: Xdan...Yga
  const attachedMatch = text.match(
    /([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']{3,})(?:дан|дин|ден|dan|din|den)[\s\S]+?([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']{3,})(?:га|ге|го|гача|qa|ка|ga|ge|go|gacha)\b/i
  );
  if (attachedMatch) {
    return { from: resolveCity(attachedMatch[1].trim()), to: resolveCity(attachedMatch[2].trim()) };
  }

  // From only: Xdan
  let from = null, to = null;
  const fromMatch = text.match(/([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']{3,})(?:дан|дин|ден|dan|din|den)\b/i);
  if (fromMatch) from = resolveCity(fromMatch[1].trim());

  const toMatch = text.match(/([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']{3,})(?:га|ге|го|гача|qa|ка|ga|ge|go|gacha)\b/i);
  if (toMatch) to = resolveCity(toMatch[1].trim());

  return { from, to };
}

function resolveCity(raw) {
  if (!raw) return null;
  const lower = raw.toLowerCase().trim();
  // Check typo map
  for (const [typo, city] of Object.entries(CITY_TYPO_MAP)) {
    if (lower === typo || lower.startsWith(typo)) return city;
  }
  return null; // Only return if we KNOW the city from typo map
}

function isNonCargoAd(text) {
  for (const pattern of NON_CARGO_PATTERNS) {
    if (pattern.test(text)) return true;
  }
  return false;
}

function isDriverAd(text) {
  for (const pattern of DRIVER_STRONG_PATTERNS) {
    if (pattern.test(text)) return true;
  }
  return false;
}

// Check if "shofer kerak" is hiring (not driver available)
function isHiringDriver(text) {
  return /(?:шофир|шофёр|шофер|шоферр|шафёр|shofir|shofer|shofyor|shopir|haydovchi|ҳайдовчи|хайдовчи|водитель)\s+(?:керак|kerak|нужен|требуется|ищем)/i.test(text);
}

async function main() {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: threeDaysAgo } },
    select: {
      id: true,
      messageText: true,
      type: true,
      scope: true,
      cargoFrom: true,
      cargoTo: true,
      vehicleType: true,
      status: true,
    },
  });

  console.log(`\n=== Jami: ${orders.length} ta order (oxirgi 3 kun) ===\n`);

  let blocked = 0, driverFixed = 0, routeFixed = 0, scopeFixed = 0;
  const blockedIds = [];
  const driverFixIds = [];
  const routeFixUpdates = [];

  for (const order of orders) {
    const text = order.messageText;

    // 1. Non-cargo ads → REJECTED
    if (isNonCargoAd(text) && !isDriverAd(text)) {
      // But skip "запчаст" if it mentions a real route (yuk zapchast = cargo of spare parts)
      const hasRoute = order.cargoFrom && order.cargoTo;
      const isZapchast = /запчаст|zapchast/i.test(text);
      const isShoferKerak = isHiringDriver(text);

      // Skip if it has a real route AND it's just cargo that happens to be zapchast
      if (isZapchast && hasRoute && !isShoferKerak) continue;

      // Vehicle sales always block
      if (/сотилади|сотлади|sotiladi|sotladi|продается|продаю|продам/i.test(text)) {
        blockedIds.push(order.id);
        blocked++;
        continue;
      }
      // Vehicle year+probeg sales
      if (/(?:йили?\s*20[12]\d|20[12]\d\s*йили?).*?(?:пр[ао]бег|probeg|холат|xolat)/i.test(text)) {
        blockedIds.push(order.id);
        blocked++;
        continue;
      }
      // Hiring driver (not cargo)
      if (isShoferKerak && !hasRoute) {
        blockedIds.push(order.id);
        blocked++;
        continue;
      }
      // Gruzchik hiring
      if (/(?:грузчик|gruzchik).*?(?:керак|kerak|ишлари|нужен)/i.test(text)) {
        blockedIds.push(order.id);
        blocked++;
        continue;
      }
      // Ijaraga (without route)
      if (/(?:ижарага|ijaraga|арендага|arendaga)/i.test(text) && !hasRoute) {
        blockedIds.push(order.id);
        blocked++;
        continue;
      }
      // Tent butka xizmati
      if (/tent\s*butka|тент\s*бутка/i.test(text)) {
        blockedIds.push(order.id);
        blocked++;
        continue;
      }
    }

    // 2. Driver ads classified as CARGO → fix to DRIVER
    if (order.type === 'CARGO' && isDriverAd(text) && !isHiringDriver(text)) {
      driverFixIds.push(order.id);
      driverFixed++;
    }

    // 3. Fix incomplete routes
    if (!order.cargoFrom || !order.cargoTo) {
      const route = extractRoute(text);
      let update = {};
      if (!order.cargoFrom && route.from) {
        // Don't set cargoFrom same as existing cargoTo
        if (route.from !== order.cargoTo) {
          update.cargoFrom = route.from;
        }
      }
      if (!order.cargoTo && route.to) {
        // Don't set cargoTo same as existing cargoFrom or new cargoFrom
        const effectiveFrom = update.cargoFrom || order.cargoFrom;
        if (route.to !== effectiveFrom) {
          update.cargoTo = route.to;
        }
      }
      if (Object.keys(update).length > 0) {
        routeFixUpdates.push({ id: order.id, update });
        routeFixed++;
      }
    }
  }

  console.log(`Bloklanadigan non-cargo ads: ${blocked}`);
  console.log(`CARGO → DRIVER ga o'tkaziladigan: ${driverFixed}`);
  console.log(`Yo'nalishi to'ldiriladigan: ${routeFixed}`);

  // Show samples
  console.log('\n--- Bloklanadigan e\'lonlar (first 20) ---');
  const blockedSamples = orders.filter(o => blockedIds.includes(o.id)).slice(0, 20);
  blockedSamples.forEach((o, i) => {
    console.log(`${i + 1}. [${o.type}] ${o.messageText.substring(0, 100).replace(/\n/g, ' ')}`);
  });

  console.log('\n--- CARGO → DRIVER (first 20) ---');
  const driverSamples = orders.filter(o => driverFixIds.includes(o.id)).slice(0, 20);
  driverSamples.forEach((o, i) => {
    console.log(`${i + 1}. [${o.vehicleType || 'null'}] ${o.cargoFrom || '?'} → ${o.cargoTo || '?'} | ${o.messageText.substring(0, 100).replace(/\n/g, ' ')}`);
  });

  console.log('\n--- Yo\'nalish to\'ldirish (first 20) ---');
  routeFixUpdates.slice(0, 20).forEach((u, i) => {
    const o = orders.find(x => x.id === u.id);
    console.log(`${i + 1}. ${o.cargoFrom || '?'}${u.update.cargoFrom ? '→' + u.update.cargoFrom : ''} → ${o.cargoTo || '?'}${u.update.cargoTo ? '→' + u.update.cargoTo : ''} | ${o.messageText.substring(0, 80).replace(/\n/g, ' ')}`);
  });

  // Ask for confirmation
  const args = process.argv;
  if (!args.includes('--apply')) {
    console.log('\n⚠️  DRY RUN! O\'zgarishlarni qo\'llash uchun: node scripts/fix-orders-3days.js --apply');
    await prisma.$disconnect();
    return;
  }

  console.log('\n🔄 O\'zgarishlar qo\'llanmoqda...');

  // Block non-cargo ads
  if (blockedIds.length > 0) {
    const result = await prisma.order.updateMany({
      where: { id: { in: blockedIds } },
      data: { status: 'REJECTED' },
    });
    console.log(`✅ ${result.count} ta non-cargo e'lon REJECTED qilindi`);
  }

  // Fix driver type
  if (driverFixIds.length > 0) {
    const result = await prisma.order.updateMany({
      where: { id: { in: driverFixIds } },
      data: { type: 'DRIVER' },
    });
    console.log(`✅ ${result.count} ta order CARGO → DRIVER ga o'tkazildi`);
  }

  // Fix routes
  for (const { id, update } of routeFixUpdates) {
    await prisma.order.update({
      where: { id },
      data: update,
    });
  }
  console.log(`✅ ${routeFixUpdates.length} ta orderning yo'nalishi to'ldirildi`);

  console.log('\n✅ Barcha o\'zgarishlar muvaffaqiyatli qo\'llandi!');
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
