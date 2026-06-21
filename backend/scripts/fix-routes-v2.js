/**
 * Fix orders v2:
 * 1. REJECT non-cargo spam (phone only, reklama, ish izlash)
 * 2. Fix missing cargoTo from message text
 * 3. Fix swapped from/to (Sirdaryodan Namanganga → from should be Sirdaryo)
 */
const { PrismaClient } = require('@prisma/client');
const { findCity, findCitiesInText } = require('../dist/src/monitor/data/city-distances');
const prisma = new PrismaClient();

// Spam patterns — yuk tashish bilan bog'liq emas
const SPAM_PATTERNS = [
  /^\+?998[\s.-]?\d[\d\s.-]*$/, // Faqat telefon raqam
  /^[\d\s.+()-]{7,20}$/, // Faqat raqamlar
  /маклер|maklor|маклёр/i,
  /продаже\s+квартир|kvartira.*sotil/i,
  /разнорабоч|уборка\s+ишлари|магазин\s+ичида/i, // Ishchi izlash
  /^\S+\s+\S+$/i, // Faqat 2 so'z (ism + raqam)
  /клуч\s+набор|kluch\s+nabor|optom\s+narx/i,
  /кампуютерчи|электирик|электрик/i,
  /перфоратор|отбойни|biton\s+buzamiz/i,
  /MDF.*akfa|eshik.*derazalar/i,
  /kriditga\s+ayfon|кредитга\s+айфон/i,
  /группага\s+кушиб|гурупа.*кушиб/i,
  /топ?рунне?р.*\$|Toprunner/i,
  /тел\s+к[иу]вориn?|тел\s+қилинг\s*$/i,
  /номери\s+керак|nomer.*kerak\s*$/i,
  /рақамн[иу]/i,
  /зилда\s+кл[иі]нец/i,
  /gʻizorlik\s+kamzchilar/i,
  /машинник\s+булар/i,
];

// City typo map for route recovery
const TYPO_CITIES = {
  // Toshkent
  'тошкетн': 'Toshkent', 'тошкна': 'Toshkent', 'тошкедан': 'Toshkent',
  'тошкнт': 'Toshkent', 'towken': 'Toshkent', 'toshkn': 'Toshkent',
  'тошкэнт': 'Toshkent', 'тошент': 'Toshkent', 'ташкин': 'Toshkent',
  'toshkna': 'Toshkent', 'тошке': 'Toshkent', 'toshknan': 'Toshkent',
  'buhrdani': 'Buxoro', 'buhrdan': 'Buxoro',
  // Navoiy
  'навойга': 'Navoiy', 'навойи': 'Navoiy',
  // Fargona
  'фаргонг': "Farg'ona", 'forganga': "Farg'ona", 'фаргонга': "Farg'ona",
  'forgana': "Farg'ona",
  // Namangan
  'намгана': 'Namangan', 'namganga': 'Namangan', 'намонгон': 'Namangan',
  'намангана': 'Namangan',
  // Jizzax
  'жизга': 'Jizzax', 'jizga': 'Jizzax', 'жизах': 'Jizzax',
  // Surxondaryo
  'сурхондаре': 'Surxondaryo', 'сурходарё': 'Surxondaryo',
  'сурхандаярога': 'Surxondaryo', 'сурходарйога': 'Surxondaryo',
  'сурхандарё': 'Surxondaryo',
  // Qashqadaryo
  'кашкадаре': 'Qashqadaryo', 'qashqdaro': 'Qashqadaryo',
  'қашқадарё': 'Qashqadaryo',
  // Qoraqalpoq
  'коракалпок': "Qoraqalpog'iston", 'qoraqalpoq': "Qoraqalpog'iston",
  'қорақалпоғ': "Qoraqalpog'iston", 'караколпок': "Qoraqalpog'iston",
  // Shahrisabz
  'шахризапск': 'Shahrisabz', 'shahrisabiz': 'Shahrisabz',
  'шахрисаб': 'Shahrisabz',
  // Xorazm
  'хоразим': 'Xorazm', 'xorazim': 'Xorazm', 'хоразимг': 'Xorazm',
  'хазорис': 'Xorazm',
  // Mongiyt
  'монгит': "Mo'ynoq", 'мангит': 'Mangit',
  // Andijon
  'андижонага': 'Andijon', 'андижанага': 'Andijon', 'анжонд': 'Andijon',
};

function findCityFromTypo(raw) {
  if (!raw) return null;
  const lower = raw.toLowerCase().trim();
  // Direct lookup
  const direct = findCity(lower);
  if (direct) return direct.name;
  // Typo map
  for (const [typo, city] of Object.entries(TYPO_CITIES)) {
    if (lower.includes(typo)) return city;
  }
  return null;
}

function extractRouteFromText(text) {
  const norm = text.replace(/[\u02BB\u02BC\u2018\u2019\u0060]/g, "'");

  // 1. Arrow pattern
  const arrow = norm.match(
    /([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']+(?:\s+[A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']+){0,2})\s*[-–—→➡►>⏩]\s*([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']+(?:\s+[A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']+){0,2})/
  );
  if (arrow) {
    const from = findCityFromTypo(arrow[1]) || findCityFromTypo(arrow[1].replace(/дан$|dan$|din$/i, ''));
    const to = findCityFromTypo(arrow[2]) || findCityFromTypo(arrow[2].replace(/га$|ge$|go$|ga$/i, ''));
    if (from || to) return { from, to };
  }

  // 2. Attached suffix: Xdan...Yga
  const attached = norm.match(
    /([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']{3,})(?:дан|дин|ден|dan|din|den)[\s\S]+?([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']{3,})(?:га|ге|го|гача|qa|ка|ga|ge|go|gacha)\b/i
  );
  if (attached) {
    const from = findCityFromTypo(attached[1]);
    const to = findCityFromTypo(attached[2]);
    if (from || to) return { from, to };
  }

  // 3. From only
  let from = null, to = null;
  const fromMatch = norm.match(/([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']{3,})(?:дан|дин|ден|dan|din|den)\b/i);
  if (fromMatch) from = findCityFromTypo(fromMatch[1]);

  const toMatch = norm.match(/([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']{3,})(?:га|ге|го|гача|qa|ка|ga|ge|go|gacha)\b/i);
  if (toMatch) to = findCityFromTypo(toMatch[1]);

  // 4. Fallback: findCitiesInText
  if (!from && !to) {
    const cities = findCitiesInText(norm);
    const unique = [...new Map(cities.map(c => [c.name, c])).values()];
    if (unique.length >= 2) {
      from = unique[0].name;
      to = unique[1].name;
    } else if (unique.length === 1) {
      from = unique[0].name;
    }
  }

  return { from, to };
}

function isSpam(text) {
  const trimmed = text.trim();
  // Too short
  if (trimmed.length < 15) return true;
  // Only phone number
  if (/^\+?[\d\s.()-]{7,20}$/.test(trimmed)) return true;
  // Spam patterns
  for (const p of SPAM_PATTERNS) {
    if (p.test(trimmed)) return true;
  }
  return false;
}

async function main() {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: threeDaysAgo }, status: 'NEW' },
    select: { id: true, messageText: true, cargoFrom: true, cargoTo: true, type: true, vehicleType: true },
  });

  console.log(`Jami NEW orderlar: ${orders.length}\n`);

  let spamBlocked = 0, routeFixed = 0, fromFixed = 0, toFixed = 0, swapFixed = 0;
  const updates = [];

  for (const order of orders) {
    const text = order.messageText;
    let update = {};

    // 1. Spam detection — route yo'q va spam pattern
    if (!order.cargoFrom && !order.cargoTo && isSpam(text)) {
      updates.push({ id: order.id, update: { status: 'REJECTED' }, reason: 'spam' });
      spamBlocked++;
      continue;
    }

    // 2. Fix missing routes
    if (!order.cargoFrom || !order.cargoTo) {
      const route = extractRouteFromText(text);

      if (!order.cargoFrom && route.from) {
        if (route.from !== order.cargoTo) {
          update.cargoFrom = route.from;
          fromFixed++;
        }
      }
      if (!order.cargoTo && route.to) {
        const effectiveFrom = update.cargoFrom || order.cargoFrom;
        if (route.to !== effectiveFrom) {
          update.cargoTo = route.to;
          toFixed++;
        }
      }

      // If we found both and existing had only one
      if (order.cargoFrom && !order.cargoTo && !update.cargoTo && route.from && route.to) {
        // Check if existing cargoFrom is actually the TO (swapped)
        // e.g., "Sirdaryodan Namanganga" but cargoFrom=Namangan
        if (route.to && findCity(order.cargoFrom.toLowerCase())?.name === route.to) {
          // Swapped — the existing "from" is actually the "to"
          if (route.from && route.from !== route.to) {
            update.cargoFrom = route.from;
            update.cargoTo = route.to;
            swapFixed++;
          }
        }
      }
    }

    if (Object.keys(update).length > 0) {
      updates.push({ id: order.id, update, reason: 'route' });
      routeFixed++;
    }
  }

  console.log(`Spam bloklanadi: ${spamBlocked}`);
  console.log(`Yo'nalish tuzatiladi: ${routeFixed} (from: ${fromFixed}, to: ${toFixed}, swap: ${swapFixed})`);

  // Show samples
  console.log('\n--- Spam (first 20) ---');
  updates.filter(u => u.reason === 'spam').slice(0, 20).forEach((u, i) => {
    const o = orders.find(x => x.id === u.id);
    console.log(`${i+1}. ${o.messageText.substring(0, 100).replace(/\n/g, ' ')}`);
  });

  console.log('\n--- Route fixes (first 30) ---');
  updates.filter(u => u.reason === 'route').slice(0, 30).forEach((u, i) => {
    const o = orders.find(x => x.id === u.id);
    const f = u.update.cargoFrom ? `FROM→${u.update.cargoFrom}` : '';
    const t = u.update.cargoTo ? `TO→${u.update.cargoTo}` : '';
    console.log(`${i+1}. [${o.cargoFrom||'?'}→${o.cargoTo||'?'}] ${f} ${t} | ${o.messageText.substring(0, 100).replace(/\n/g, ' ')}`);
  });

  if (!process.argv.includes('--apply')) {
    console.log('\n⚠️  DRY RUN! Qo\'llash: node scripts/fix-routes-v2.js --apply');
    await prisma.$disconnect();
    return;
  }

  console.log('\n🔄 Qo\'llanmoqda...');
  let applied = 0;
  for (const { id, update } of updates) {
    await prisma.order.update({ where: { id }, data: update });
    applied++;
  }
  console.log(`✅ ${applied} ta order yangilandi`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
