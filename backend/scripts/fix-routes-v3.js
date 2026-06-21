/**
 * Fix orders v3 — Qolgan barcha muammolarni to'g'rilash
 * 1. REJECT: spam, reklama, mashina sotish, ishchi izlash
 * 2. Route fix: typo shaharlaar, teskari from/to
 * 3. cargoTo qo'shish: matndagi shaharlarni aniqlash
 */
const { PrismaClient } = require('@prisma/client');
const { findCity, findCitiesInText } = require('../dist/src/monitor/data/city-distances');
const prisma = new PrismaClient();

// ===== SPAM / NON-CARGO =====
const REJECT_PATTERNS = [
  // Faqat raqam / ism
  /^\+?[\d\s.+()-]{5,25}$/,
  /^\+?998[\s.-]?\d[\d\s.-]+\s*\w{0,15}$/,
  // Reklama
  /маклер|маклёр/i,
  /квартир.*продаж|kvartira.*sot/i,
  /электирик|электрик|электрик\.сам/i,
  /кампуютерчи|устони\s+номер|перфоратор|отбойни/i,
  /biton\s*buzamiz|MDF.*akfa|eshik.*derazalar/i,
  /kriditga\s+ayfon|кредитга\s+айфон/i,
  /оптом\s+нарх|optom\s+narx|kluch\s+nabor/i,
  /рақамн[иу]|номери\s+керак|nomer.*kerak$/i,
  // Ish izlash
  /разнорабоч|уборка\s+ишлари|бола.*магазин|магазин.*бола/i,
  /ish\s+kidirv|иш\s+кидир/i,
  // Bot / link spam
  /https?:\/\/ok\.ru|@lorry_filter_bot/i,
  /группа.*админ.*контакт|grupo.*admin/i,
  // Mashina sotish
  /марка\s+спарк|позиция.*автомат.*бензин|gentra.*poz/i,
  /давлат\s+раками.*тушиб\s+колган|суюнчи/i,
  // Umuman ma'nosiz
  /тел\s*кил[иу]нг?\s*$/i,
  /мана\s+шу\s+номерни/i,
  /TELEFONDAN.*TIKLASH\s+XIZMATI/i,
  /шенрае\s+хизмати|кучат\s+чикарамиз/i,
  /лэтснза\s+питофка/i,
  /рекл.*тарқатманг|iltimos.*reklama/i,
  /adblue.*evro.*optom/i,
  /канализаци.*труба.*ташаш/i,
  /юк\s+топиб\s+бер[аи]м/i,
  /gruzchik.*xizmat|грузчик.*хизмат/i,
  /Toprunner.*\$/i,
  /katta.*isuzini.*galofka.*kerak.*sotib/i,
  /юк\s+маркази.*группа.*админ/i,
];

function shouldReject(text) {
  const t = text.trim();
  if (t.length < 20 && /^\+?[\d\s.+()-]+$/.test(t)) return true;
  if (t.length < 25 && !/yuk|юк|юук|бор|bor|керак|kerak|tonna|тонн/i.test(t)) return true;
  for (const p of REJECT_PATTERNS) {
    if (p.test(t)) return true;
  }
  return false;
}

// ===== CITY TYPO MAP =====
const TYPO_MAP = {
  // Toshkent mega typos
  'тошкетн': 'Toshkent', 'тошкна': 'Toshkent', 'тошкедан': 'Toshkent',
  'тошкнт': 'Toshkent', 'towken': 'Toshkent', 'тошкэнт': 'Toshkent',
  'тошкнда': 'Toshkent', 'тошкнга': 'Toshkent', 'тошкега': 'Toshkent',
  'тошкентдна': 'Toshkent', 'тосхкент': 'Toshkent', 'тошкегт': 'Toshkent',
  'тошкенж': 'Toshkent', 'тосхке': 'Toshkent', 'тишке': 'Toshkent',
  'toskent': 'Toshkent', 'tosken': 'Toshkent', 'toskna': 'Toshkent',
  'toshknad': 'Toshkent', 'toshknan': 'Toshkent', 'toshkna': 'Toshkent',
  'toshkn': 'Toshkent', 'тошке': 'Toshkent', 'toshke': 'Toshkent',
  'towkan': 'Toshkent', 'тошкита': 'Toshkent', 'тоскент': 'Toshkent',
  // Navoiy
  'навойга': 'Navoiy', 'навои': 'Navoiy', 'navoyi': 'Navoiy',
  'наноеи': 'Navoiy', 'навоеи': 'Navoiy',
  // Fargona
  'фаргонга': "Farg'ona", 'forganga': "Farg'ona", 'форганга': "Farg'ona",
  'фаргон': "Farg'ona",
  // Namangan
  'намганга': 'Namangan', 'namganga': 'Namangan', 'намонгон': 'Namangan',
  'намангана': 'Namangan', 'намаган': 'Namangan', 'намгана': 'Namangan',
  // Jizzax
  'жизга': 'Jizzax', 'jizga': 'Jizzax', 'жизах': 'Jizzax', 'жзах': 'Jizzax',
  'жизак': 'Jizzax', 'jizah': 'Jizzax', 'jizax': 'Jizzax',
  // Surxondaryo
  'сурхондаре': 'Surxondaryo', 'сурходарё': 'Surxondaryo',
  'сурхандарё': 'Surxondaryo', 'сурхадарё': 'Surxondaryo',
  'сурахандарё': 'Surxondaryo', 'suraxandary': 'Surxondaryo',
  'surxandary': 'Surxondaryo',
  // Qashqadaryo
  'кашкадаре': 'Qashqadaryo', 'qashqdaro': 'Qashqadaryo',
  'қашқадарё': 'Qashqadaryo', 'кашкадарё': 'Qashqadaryo',
  'qashqadare': 'Qashqadaryo',
  // Qoraqalpoq
  'коракалпок': "Qoraqalpog'iston", 'qoraqalpoq': "Qoraqalpog'iston",
  'караколпок': "Qoraqalpog'iston", 'қорақалпоғ': "Qoraqalpog'iston",
  // Shahrisabz
  'шахризапск': 'Shahrisabz', 'shahrisabiz': 'Shahrisabz',
  'шахрисаб': 'Shahrisabz', 'shahrisab': 'Shahrisabz',
  // Xorazm
  'хоразим': 'Xorazm', 'xorazim': 'Xorazm', 'хоразима': 'Xorazm',
  'хазорис': 'Xorazm', 'xarzim': 'Xorazm', 'харазим': 'Xorazm',
  'харазиси': 'Xorazm',
  // Buxoro
  'бухрда': 'Buxoro', 'buhrd': 'Buxoro', 'бухара': 'Buxoro',
  'бухог': 'Buxoro', 'buhor': 'Buxoro', 'буха': 'Buxoro',
  'бухор': 'Buxoro', 'buxor': 'Buxoro',
  // Sirdaryo
  'срдарйо': 'Sirdaryo', 'сирдаре': 'Sirdaryo', 'сирдарйо': 'Sirdaryo',
  // Andijon
  'андижонга': 'Andijon', 'андижанага': 'Andijon', 'анжон': 'Andijon',
  // Qo'qon
  'кокон': "Qo'qon", 'куко': "Qo'qon", 'quqon': "Qo'qon",
  'qoqon': "Qo'qon",
  // Termiz
  'тогкент': 'Toshkent', // "Тогкентдан термизга" — Тогкент = Toshkent
  // Yakkabog'
  'якабог': "Yakkabog'", 'yakabog': "Yakkabog'",
  // Qamashi
  'камачи': 'Qamashi', 'qamachi': 'Qamashi',
  // Mozori Sharif (Afghanistan)
  'мозори': 'Mozori Sharif', 'мазори': 'Mozori Sharif', 'mozori': 'Mozori Sharif',
};

function resolveCity(raw) {
  if (!raw) return null;
  const lower = raw.toLowerCase().trim();

  // 1. Standard findCity
  const std = findCity(lower);
  if (std) return std.name;

  // 2. Typo map
  for (const [typo, city] of Object.entries(TYPO_MAP)) {
    if (lower === typo || lower.startsWith(typo)) return city;
  }

  // 3. Remove common suffixes and retry
  for (const suf of ['дан', 'dan', 'din', 'ден', 'га', 'ga', 'ge', 'ге', 'гача']) {
    if (lower.endsWith(suf) && lower.length > suf.length + 2) {
      const base = lower.slice(0, -suf.length);
      const c = findCity(base);
      if (c) return c.name;
      // Typo map on base
      for (const [typo, city] of Object.entries(TYPO_MAP)) {
        if (base === typo || base.startsWith(typo)) return city;
      }
      // Add first char of suffix back
      const base2 = base + suf[0];
      const c2 = findCity(base2);
      if (c2) return c2.name;
    }
  }

  return null;
}

function extractRoute(text) {
  const norm = text.replace(/[\u02BB\u02BC\u2018\u2019\u0060]/g, "'").replace(/\./g, ' ');

  // Arrow pattern
  const arrow = norm.match(
    /([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']{2,}(?:\s+[A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']+){0,2})\s*[-–—→➡►>⏩]\s*([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']{2,}(?:\s+[A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']+){0,2})/
  );
  if (arrow) {
    const from = resolveCity(arrow[1]);
    const to = resolveCity(arrow[2]);
    if (from || to) return { from, to };
  }

  // dan...ga pattern
  const danGa = norm.match(
    /([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']{3,})(?:дан|дин|ден|dan|din|den)\s[\s\S]*?([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']{3,})(?:га|ге|го|гача|qa|ка|ga|ge|go|gacha)\b/i
  );
  if (danGa) {
    const from = resolveCity(danGa[1]);
    const to = resolveCity(danGa[2]);
    if (from || to) return { from, to };
  }

  // Attached suffix
  const attached = norm.match(
    /([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']{3,}(?:дан|дин|ден|dan|din|den))\b[\s\S]+?([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']{3,}(?:га|ге|го|гача|qa|ка|ga|ge|go|gacha))\b/i
  );
  if (attached) {
    const from = resolveCity(attached[1]);
    const to = resolveCity(attached[2]);
    if (from || to) return { from, to };
  }

  // Separate from/to
  let from = null, to = null;
  const fromM = norm.match(/([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']{3,})(?:дан|дин|ден|dan|din|den)\b/i);
  if (fromM) from = resolveCity(fromM[1]);
  const toM = norm.match(/([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']{3,})(?:га|ге|го|гача|qa|ка|ga|ge|go|gacha)\b/i);
  if (toM) to = resolveCity(toM[1]);

  if (from || to) return { from, to };

  // Fallback: findCitiesInText
  const cities = findCitiesInText(norm);
  const unique = [...new Map(cities.map(c => [c.name, c])).values()];
  if (unique.length >= 2) return { from: unique[0].name, to: unique[1].name };
  if (unique.length === 1) return { from: unique[0].name, to: null };
  return { from: null, to: null };
}

async function main() {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: threeDaysAgo }, status: 'NEW' },
    select: { id: true, messageText: true, cargoFrom: true, cargoTo: true, type: true },
  });

  console.log(`Jami NEW: ${orders.length}\n`);

  let rejected = 0, routeFixed = 0, fromAdded = 0, toAdded = 0, swapped = 0;
  const updates = [];

  for (const o of orders) {
    const text = o.messageText;

    // 1. REJECT spam (only if no routes at all)
    if (!o.cargoFrom && !o.cargoTo && shouldReject(text)) {
      updates.push({ id: o.id, data: { status: 'REJECTED' }, type: 'reject' });
      rejected++;
      continue;
    }

    // 2. Fix routes
    if (!o.cargoFrom || !o.cargoTo) {
      const route = extractRoute(text);
      const upd = {};

      if (!o.cargoFrom && route.from) {
        if (route.from !== o.cargoTo) {
          upd.cargoFrom = route.from;
          fromAdded++;
        }
      }
      if (!o.cargoTo && route.to) {
        const effectiveFrom = upd.cargoFrom || o.cargoFrom;
        if (route.to !== effectiveFrom) {
          upd.cargoTo = route.to;
          toAdded++;
        }
      }

      // 3. Swap detection: existing FROM is actually TO
      if (o.cargoFrom && !o.cargoTo && !upd.cargoTo && route.from && route.to) {
        if (o.cargoFrom === route.to && route.from !== route.to) {
          upd.cargoFrom = route.from;
          upd.cargoTo = route.to;
          swapped++;
        }
      }

      if (Object.keys(upd).length > 0) {
        updates.push({ id: o.id, data: upd, type: 'route' });
        routeFixed++;
      }
    }
  }

  console.log(`REJECTED: ${rejected}`);
  console.log(`Route fixed: ${routeFixed} (from:${fromAdded}, to:${toAdded}, swap:${swapped})`);

  console.log('\n--- REJECTED (first 25) ---');
  updates.filter(u => u.type === 'reject').slice(0, 25).forEach((u, i) => {
    const o = orders.find(x => x.id === u.id);
    console.log(`${i+1}. ${o.messageText.substring(0, 100).replace(/\n/g, ' ')}`);
  });

  console.log('\n--- Route fixes (first 25) ---');
  updates.filter(u => u.type === 'route').slice(0, 25).forEach((u, i) => {
    const o = orders.find(x => x.id === u.id);
    const f = u.data.cargoFrom ? `FROM→${u.data.cargoFrom}` : '';
    const t = u.data.cargoTo ? `TO→${u.data.cargoTo}` : '';
    console.log(`${i+1}. [${o.cargoFrom||'?'}→${o.cargoTo||'?'}] ${f} ${t} | ${o.messageText.substring(0, 100).replace(/\n/g, ' ')}`);
  });

  if (!process.argv.includes('--apply')) {
    console.log('\n⚠️  DRY RUN! Qo\'llash: node scripts/fix-routes-v3.js --apply');
    await prisma.$disconnect();
    return;
  }

  console.log('\n🔄 Qo\'llanmoqda...');
  for (const { id, data } of updates) {
    await prisma.order.update({ where: { id }, data });
  }
  console.log(`✅ ${updates.length} ta order yangilandi`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
