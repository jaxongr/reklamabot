/**
 * FINAL route fix — barcha qolgan chala orderlarni to'g'rilash
 * FROM ONLY → cargoTo qo'shish
 * NO ROUTE → reject yoki route aniqlash
 * Massive typo map + fallback city detection
 */
const { PrismaClient } = require('@prisma/client');
const { findCity, findCitiesInText } = require('../dist/src/monitor/data/city-distances');
const prisma = new PrismaClient();

// ==================== REJECT PATTERNS ====================
const REJECT = [
  /^\+?[\d\s.+()-]{5,25}$/,
  /^[\d\s.+()-]+\s*\w{0,12}$/,
  /маклер|маклёр|продаж.*квартир/i,
  /электирик|электрик|кампуютерч|перфоратор|затирка/i,
  /biton\s*buzamiz|MDF.*akfa|eshik.*derazalar/i,
  /kriditga\s+ayfon|optom\s+narx|kluch\s+nabor/i,
  /номери\s+керак|nomer.*kerak$|NOMERI\s+KERAK/i,
  /разнорабоч|уборка\s+ишлари|бола.*магазин/i,
  /иш\s+кидир|ish\s+kidir/i,
  /https?:\/\/ok\.ru|@\w+_bot/i,
  /группа.*админ.*контакт/i,
  /марка\s+спарк|генетра.*позиц|gentra.*poz/i,
  /TELEFONDAN.*TIKLASH|RASM.*VIDEOLAR.*TIKLASH/i,
  /шенрае\s+хизмати|кучат\s+чикарамиз/i,
  /лэтснза\s+питофка/i,
  /adblue.*evro.*optom/i,
  /канализаци.*труба/i,
  /юк\s+топиб\s+бер[аи]м/i,
  /уругʻлар\s+керакми/i,
  /вичточк.*элик?тирик/i,
  /маклер.*продаж/i,
  /В\s+с\s+правам\s+бор\s+машина\s+керак\s+ишлаш/i,
  /юк\s+маркази.*группа/i,
  /рақамн[иу]\s+егаси/i,
  /Топ?рунне?р.*\$/i,
  /тел\s*к[иу]б\s*юбор\s*$/i,
  /^тел\s*килинг/i,
  /галофка.*сотиб\s+олам/i,
  /uzkorgaz\s+qop\s+sotib/i,
  /группaдaкилaр.*юк\s+булсa\s+aйтинглa/i,
  /юк\s+бир\s+экан$/i,
  /юки\s+бор\s+мижозлар$/i,
  /бу\s+юкни\s+егаси/i,
  /AssalomAlekum\s+yuk\s+markazi/i,
  /Akalar.*ISUZI.*NOMERI\s+KERAK/i,
];

function shouldReject(text) {
  const t = text.trim();
  if (t.length < 20 && /^\+?[\d\s.+()-]*$/.test(t)) return true;
  for (const p of REJECT) { if (p.test(t)) return true; }
  return false;
}

// ==================== CITY RESOLUTION ====================
// Kengaytirilgan typo xaritasi — 200+ variant
const TYPO = {
  // Toshkent
  'тошкна': 'Toshkent', 'тошкнт': 'Toshkent', 'тошкетн': 'Toshkent',
  'тошкэнт': 'Toshkent', 'тошкент': 'Toshkent', 'тошкнга': 'Toshkent',
  'тошке': 'Toshkent', 'тошкенж': 'Toshkent', 'тошкегт': 'Toshkent',
  'тошкита': 'Toshkent', 'тоскент': 'Toshkent', 'тосхке': 'Toshkent',
  'тишкент': 'Toshkent', 'тищкент': 'Toshkent', 'тощкент': 'Toshkent',
  'тогкент': 'Toshkent', 'тоshке': 'Toshkent', 'вокенит': 'Toshkent',
  'toshkna': 'Toshkent', 'toshkn': 'Toshkent', 'toskent': 'Toshkent',
  'tosken': 'Toshkent', 'towkan': 'Toshkent', 'toshke': 'Toshkent',
  'toshknan': 'Toshkent', 'toskna': 'Toshkent', 'toshknad': 'Toshkent',
  'тошконт': 'Toshkent', 'тоwкент': 'Toshkent',
  // Samarqand
  'самаркан': 'Samarqand', 'самарканн': 'Samarqand', 'самаркад': 'Samarqand',
  'samarkan': 'Samarqand', 'samarkad': 'Samarqand', 'самарқан': 'Samarqand',
  // Buxoro
  'бухара': 'Buxoro', 'бухрда': 'Buxoro', 'бухор': 'Buxoro', 'буха': 'Buxoro',
  'buhrd': 'Buxoro', 'buhor': 'Buxoro', 'buxor': 'Buxoro', 'буход': 'Buxoro',
  // Navoiy
  'навойга': 'Navoiy', 'навои': 'Navoiy', 'наноеи': 'Navoiy', 'навоеи': 'Navoiy',
  'наноий': 'Navoiy', 'навойи': 'Navoiy',
  // Fargona
  'фаргонга': "Farg'ona", 'forganga': "Farg'ona", 'форганга': "Farg'ona",
  'фаргон': "Farg'ona", "фарг'он": "Farg'ona", 'форгана': "Farg'ona",
  // Namangan
  'намганга': 'Namangan', 'namganga': 'Namangan', 'намонгон': 'Namangan',
  'намангана': 'Namangan', 'намаган': 'Namangan', 'намгана': 'Namangan',
  // Andijon
  'андижонга': 'Andijon', 'андижанага': 'Andijon', 'анжон': 'Andijon',
  'андижн': 'Andijon', 'андижо': 'Andijon',
  // Jizzax
  'жизга': 'Jizzax', 'jizga': 'Jizzax', 'жизах': 'Jizzax', 'жзах': 'Jizzax',
  'жизак': 'Jizzax', 'jizah': 'Jizzax',
  // Surxondaryo
  'сурхондаре': 'Surxondaryo', 'сурходарё': 'Surxondaryo', 'сурхандарё': 'Surxondaryo',
  'сурхадарё': 'Surxondaryo', 'суихондаёр': 'Surxondaryo', 'сурахандар': 'Surxondaryo',
  // Qashqadaryo
  'кашкадаре': 'Qashqadaryo', 'кашкадарё': 'Qashqadaryo', 'qashqdaro': 'Qashqadaryo',
  'kashqadare': 'Qashqadaryo',
  // Qoraqalpogiston
  'коракалпок': "Qoraqalpog'iston", 'караколпок': "Qoraqalpog'iston",
  'кораколпок': "Qoraqalpog'iston", 'қорақалпоғ': "Qoraqalpog'iston",
  // Shahrisabz
  'шахризабс': 'Shahrisabz', 'shahrisabiz': 'Shahrisabz', 'шахрисаб': 'Shahrisabz',
  // Xorazm
  'хоразим': 'Xorazm', 'xorazim': 'Xorazm', 'хоразима': 'Xorazm',
  'хазорис': 'Xorazm', 'xarzim': 'Xorazm', 'харазим': 'Xorazm', 'хорзим': 'Xorazm',
  // Sirdaryo
  'срдарйо': 'Sirdaryo', 'сирдаре': 'Sirdaryo', 'сирдарйо': 'Sirdaryo',
  // Qo'qon
  'кокон': "Qo'qon", 'quqon': "Qo'qon", 'куко': "Qo'qon", 'qoqon': "Qo'qon",
  // Nukus
  'нукиса': 'Nukus', 'нокис': 'Nukus', 'нукис': 'Nukus', 'нукса': 'Nukus',
  // Termiz
  'тогкент': 'Toshkent',
  // Shahrixon
  'шахрихо': 'Shahrixon', 'shaxrixo': 'Shahrixon',
  // Yakkabog
  'якабог': "Yakkabog'", 'yakabog': "Yakkabog'",
  // Qamashi
  'камачи': 'Qamashi', 'qamachi': 'Qamashi',
  // Chiroqchi
  'чирогч': 'Chiroqchi', 'chiroqch': 'Chiroqchi',
  // Denov
  'денов': 'Denov', 'дено': 'Denov',
  // Zangiota
  'зангиота': 'Zangiota', 'зангаота': 'Zangiota', 'zangiata': 'Zangiota',
  // Bekabad
  'бекабо': 'Bekobod', 'begabo': 'Begavot',
  // Yozyovon
  'ёзёвон': 'Yozyovon', 'yozyuvon': 'Yozyovon', 'язъяван': 'Yozyovon',
  // Shymboy (Qoraqalpogiston)
  'шымбай': 'Chimboy', 'shimboy': 'Chimboy', 'чимбой': 'Chimboy',
  // Jom (Samarqand)
  'жом': 'Jomboy', 'jom': 'Jomboy',
  // Korateppa
  'коратепа': "Qo'rg'ontepa", 'каратепа': "Qo'rg'ontepa",
  // Abu Sahiy
  'абу сахий': 'Toshkent', // Abu Sahiy bazaar = Toshkent
  // Sobraxim / O'rtasaroy (Toshkent)
  'собрахимов': 'Toshkent', 'ортасарой': 'Toshkent',
  // Food city (Toshkent)
  'фуд сити': 'Toshkent', 'food siti': 'Toshkent', 'food citi': 'Toshkent',
  'футсида': 'Toshkent',
  // Hazratishoh (Toshkent)
  'хазратишох': 'Toshkent',
  // 40let / Jomiy (Toshkent districts)
  '40лет': 'Toshkent', 'жомий': 'Toshkent', 'жоми': 'Toshkent',
  // Shofoyz / Shofoyiz (Qashqadaryo)
  'шофойз': 'Shahrisabz', 'шофоиз': 'Shahrisabz',
  // Mozori Sharif
  'мозори': 'Mozori Sharif', 'мазори': 'Mozori Sharif',
  // Yallama
  'яллама': 'Saryagash', 'ялама': 'Saryagash',
  // Dashtobod
  'даштабод': 'Dashtobod', 'dashtabod': 'Dashtobod',
  // Konlikol
  'конли': 'Konlikol', 'конлик': 'Konlikol',
};

function resolveCity(raw) {
  if (!raw) return null;
  const lower = raw.toLowerCase().trim().replace(/[.,:;!?]/g, '');

  const std = findCity(lower);
  if (std) return std.name;

  for (const [k, v] of Object.entries(TYPO)) {
    if (lower === k || lower.startsWith(k) || lower.includes(k)) return v;
  }

  // Suffix strip
  for (const suf of ['дан','dan','din','ден','га','ga','ge','ге','гача','ка','qa','ни','да','daq']) {
    if (lower.endsWith(suf) && lower.length > suf.length + 2) {
      const base = lower.slice(0, -suf.length);
      const c = findCity(base);
      if (c) return c.name;
      for (const [k, v] of Object.entries(TYPO)) {
        if (base === k || base.startsWith(k)) return v;
      }
      const base2 = base + suf[0];
      const c2 = findCity(base2);
      if (c2) return c2.name;
    }
  }
  return null;
}

function extractRoute(text) {
  const norm = text.replace(/[\u02BB\u02BC\u2018\u2019\u0060]/g, "'").replace(/\./g, ' ').replace(/\s+/g, ' ');

  // Arrow
  const arrow = norm.match(/([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']{2,}(?:\s+[A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']+){0,2})\s*[-–—→➡►>⏩]\s*([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']{2,}(?:\s+[A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']+){0,2})/);
  if (arrow) {
    const f = resolveCity(arrow[1]); const t = resolveCity(arrow[2]);
    if (f || t) return { from: f, to: t };
  }

  // dan...ga
  const danGa = norm.match(/([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']{3,})(?:дан|дин|ден|dan|din|den)\s[\s\S]*?([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']{3,})(?:га|ге|го|гача|qa|ка|ga|ge|go|gacha)\b/i);
  if (danGa) {
    const f = resolveCity(danGa[1]); const t = resolveCity(danGa[2]);
    if (f || t) return { from: f, to: t };
  }

  // Attached
  const att = norm.match(/([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']{3,}(?:дан|дин|ден|dan|din|den))\b[\s\S]+?([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']{3,}(?:га|ге|го|гача|qa|ка|ga|ge|go|gacha))\b/i);
  if (att) {
    const f = resolveCity(att[1]); const t = resolveCity(att[2]);
    if (f || t) return { from: f, to: t };
  }

  // Separate from/to
  let from = null, to = null;
  const fm = norm.match(/([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']{3,})(?:дан|дин|ден|dan|din|den)\b/i);
  if (fm) from = resolveCity(fm[1]);
  const tm = norm.match(/([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']{3,})(?:га|ге|го|гача|qa|ка|ga|ge|go|gacha)\b/i);
  if (tm) to = resolveCity(tm[1]);
  if (from || to) return { from, to };

  // Fallback
  const cities = findCitiesInText(norm);
  const unique = [...new Map(cities.map(c => [c.name, c])).values()];
  if (unique.length >= 2) return { from: unique[0].name, to: unique[1].name };
  if (unique.length === 1) return { from: unique[0].name, to: null };
  return { from: null, to: null };
}

async function main() {
  const t = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: t }, status: 'NEW', OR: [{ cargoTo: null }, { cargoFrom: null }] },
    select: { id: true, messageText: true, cargoFrom: true, cargoTo: true, type: true },
  });

  console.log(`Chala orderlar: ${orders.length}\n`);
  let rejected = 0, fixed = 0, fromAdd = 0, toAdd = 0, swapped = 0;
  const updates = [];

  for (const o of orders) {
    const text = o.messageText;

    // Reject spam (no routes)
    if (!o.cargoFrom && !o.cargoTo && shouldReject(text)) {
      updates.push({ id: o.id, data: { status: 'REJECTED' }, t: 'rej' });
      rejected++;
      continue;
    }

    const route = extractRoute(text);
    const upd = {};

    if (!o.cargoFrom && route.from) {
      if (route.from !== o.cargoTo) { upd.cargoFrom = route.from; fromAdd++; }
    }
    if (!o.cargoTo && route.to) {
      const ef = upd.cargoFrom || o.cargoFrom;
      if (route.to !== ef) { upd.cargoTo = route.to; toAdd++; }
    }

    // Swap detection
    if (o.cargoFrom && !o.cargoTo && !upd.cargoTo && route.from && route.to) {
      if (o.cargoFrom === route.to && route.from !== route.to) {
        upd.cargoFrom = route.from; upd.cargoTo = route.to; swapped++;
      }
    }

    if (Object.keys(upd).length > 0) {
      updates.push({ id: o.id, data: upd, t: 'fix' });
      fixed++;
    }
  }

  console.log(`REJECT: ${rejected}`);
  console.log(`Route fix: ${fixed} (from:${fromAdd}, to:${toAdd}, swap:${swapped})`);

  console.log('\n--- REJECT (first 20) ---');
  updates.filter(u => u.t === 'rej').slice(0, 20).forEach((u, i) => {
    const o = orders.find(x => x.id === u.id);
    console.log(`${i+1}. ${o.messageText.substring(0, 90).replace(/\n/g, ' ')}`);
  });
  console.log('\n--- FIXES (first 40) ---');
  updates.filter(u => u.t === 'fix').slice(0, 40).forEach((u, i) => {
    const o = orders.find(x => x.id === u.id);
    const f = u.data.cargoFrom ? `F→${u.data.cargoFrom}` : '';
    const t = u.data.cargoTo ? `T→${u.data.cargoTo}` : '';
    console.log(`${i+1}. [${o.cargoFrom||'?'}→${o.cargoTo||'?'}] ${f} ${t} | ${o.messageText.substring(0, 90).replace(/\n/g, ' ')}`);
  });

  if (!process.argv.includes('--apply')) {
    console.log('\n⚠️  DRY RUN! node scripts/fix-routes-final.js --apply');
    await prisma.$disconnect(); return;
  }
  console.log('\n🔄 Qo\'llanmoqda...');
  for (const { id, data } of updates) await prisma.order.update({ where: { id }, data });
  console.log(`✅ ${updates.length} ta order yangilandi`);
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
