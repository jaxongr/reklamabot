/**
 * 15-day route backfill — Oxirgi 15 kundagi chala yo'nalishli orderlarni to'ldirish
 *
 * Farqlar `fix-routes-final.js` dan:
 *  - 3 kun emas, 15 kun
 *  - Status filtri YO'Q (NEW/VIEWED/CONTACTED/COMPLETED/REJECTED — barchasi)
 *  - SPAM REJECT logikasi YO'Q — faqat to'ldiriladi, status o'zgarmaydi
 *  - Faqat `cargoFrom IS NULL OR cargoTo IS NULL` orderlar
 *
 * Ishga tushirish (server):
 *   node scripts/fix-routes-15days.js          # DRY RUN
 *   node scripts/fix-routes-15days.js --apply  # YOZADI
 */
const { PrismaClient } = require('@prisma/client');
const { findCity, findCitiesInText } = require('../dist/src/monitor/data/city-distances');
const prisma = new PrismaClient();

// ==================== TYPO MAP (fix-routes-final.js dan) ====================
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
  // Chimboy (Qoraqalpogiston)
  'шымбай': 'Chimboy', 'shimboy': 'Chimboy', 'чимбой': 'Chimboy',
  // Jomboy (Samarqand)
  'жом': 'Jomboy', 'jom': 'Jomboy',
  // Korateppa
  'коратепа': "Qo'rg'ontepa", 'каратепа': "Qo'rg'ontepa",
  // Abu Sahiy (Toshkent bazaar)
  'абу сахий': 'Toshkent',
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
  const norm = text.replace(/[ʻʼ‘’`]/g, "'").replace(/\./g, ' ').replace(/\s+/g, ' ');

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
  const since = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: since },
      OR: [{ cargoFrom: null }, { cargoTo: null }],
    },
    select: { id: true, messageText: true, cargoFrom: true, cargoTo: true, type: true, status: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`\n📦 Oxirgi 15 kun, chala yo'nalishli orderlar: ${orders.length}`);
  console.log(`   (cargoFrom IS NULL OR cargoTo IS NULL)\n`);

  let fromAdd = 0, toAdd = 0, swapped = 0, untouched = 0;
  const updates = [];

  for (const o of orders) {
    const route = extractRoute(o.messageText || '');
    const upd = {};

    if (!o.cargoFrom && route.from) {
      if (route.from !== o.cargoTo) { upd.cargoFrom = route.from; fromAdd++; }
    }
    if (!o.cargoTo && route.to) {
      const ef = upd.cargoFrom || o.cargoFrom;
      if (route.to !== ef) { upd.cargoTo = route.to; toAdd++; }
    }

    // Swap detection: cargoFrom topilgan, cargoTo yo'q
    // lekin parser cargoFrom = mavjud cargoTo deb topgan → swap
    if (o.cargoFrom && !o.cargoTo && !upd.cargoTo && route.from && route.to) {
      if (o.cargoFrom === route.to && route.from !== route.to) {
        upd.cargoFrom = route.from;
        upd.cargoTo = route.to;
        swapped++;
      }
    }

    if (Object.keys(upd).length > 0) {
      updates.push({ id: o.id, data: upd, before: { from: o.cargoFrom, to: o.cargoTo }, text: o.messageText, createdAt: o.createdAt });
    } else {
      untouched++;
    }
  }

  console.log(`✅ To'ldiriladigan: ${updates.length}`);
  console.log(`   — cargoFrom qo'shildi: ${fromAdd}`);
  console.log(`   — cargoTo   qo'shildi: ${toAdd}`);
  console.log(`   — Swap (from↔to): ${swapped}`);
  console.log(`❌ Parser hech narsa topa olmadi: ${untouched}\n`);

  // Status bo'yicha taqsimot
  const byStatus = {};
  for (const o of orders) byStatus[o.status] = (byStatus[o.status] || 0) + 1;
  console.log(`📊 Status taqsimoti (jami):`);
  for (const [s, n] of Object.entries(byStatus)) console.log(`   ${s}: ${n}`);

  // Birinchi 30 ta o'zgarish namunalari
  console.log('\n--- TO\'LDIRILADIGAN NAMUNALAR (1-30) ---');
  updates.slice(0, 30).forEach((u, i) => {
    const f = u.data.cargoFrom ? `F→${u.data.cargoFrom}` : '';
    const t = u.data.cargoTo ? `T→${u.data.cargoTo}` : '';
    const date = u.createdAt.toISOString().slice(0, 10);
    const snippet = (u.text || '').substring(0, 80).replace(/\n/g, ' ');
    console.log(`${i + 1}. [${date}] [${u.before.from || '?'}→${u.before.to || '?'}] ${f} ${t}`);
    console.log(`     ${snippet}`);
  });

  if (!process.argv.includes('--apply')) {
    console.log(`\n⚠️  DRY RUN! Yozish uchun: node scripts/fix-routes-15days.js --apply`);
    await prisma.$disconnect();
    return;
  }

  console.log(`\n🔄 ${updates.length} ta order yangilanmoqda...`);
  let done = 0;
  for (const { id, data } of updates) {
    await prisma.order.update({ where: { id }, data });
    done++;
    if (done % 100 === 0) console.log(`   ${done}/${updates.length}...`);
  }
  console.log(`✅ ${done} ta order muvaffaqiyatli yangilandi`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
