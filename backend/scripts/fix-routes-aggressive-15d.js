/**
 * Agressiv route backfill — 15 kun
 *
 * STRATEGIYA:
 *  - Faqat: cargoFrom IS NOT NULL VA cargoTo IS NULL (eng ko'p case)
 *  - findCitiesInText butun matnga
 *  - cargoFrom dan farqli birinchi shahar = cargoTo
 *  - Agar cargoFrom matnda topilmasa → cargoFrom ham noto'g'ri, hech narsa qilmaymiz
 *
 * Ishga tushirish:
 *   node scripts/fix-routes-aggressive-15d.js          # DRY RUN
 *   node scripts/fix-routes-aggressive-15d.js --apply  # YOZADI
 */
const { PrismaClient } = require('@prisma/client');
const { findCity, findCitiesInText } = require('../dist/src/monitor/data/city-distances');
const prisma = new PrismaClient();

function pickCargoTo(text, currentFrom) {
  const norm = (text || '').replace(/[ʻʼ‘’`]/g, "'").replace(/\s+/g, ' ');
  const cities = findCitiesInText(norm);
  if (!cities || cities.length === 0) return null;

  // 1) Aniq destination — "ga/га/qa/гача" suffix bilan
  const toMatch = norm.match(/([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']{3,})(?:га|ге|го|гача|qa|ка|ga|ge|go|gacha|cha|ча)\b/i);
  if (toMatch) {
    const candidate = findCity(toMatch[1].toLowerCase());
    if (candidate && candidate.name !== currentFrom) return candidate.name;
  }

  // 2) Fallback: birinchi farqli shahar
  const unique = [...new Map(cities.map(c => [c.name, c])).values()];
  const diff = unique.find(c => c.name !== currentFrom);
  return diff ? diff.name : null;
}

async function main() {
  const since = new Date(Date.now() - 15 * 86400000);
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: since },
      cargoFrom: { not: null },
      cargoTo: null,
    },
    select: { id: true, messageText: true, cargoFrom: true, type: true, status: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`\n📦 cargoFrom set, cargoTo NULL: ${orders.length}\n`);

  const updates = [];
  let noCity = 0;

  for (const o of orders) {
    const to = pickCargoTo(o.messageText, o.cargoFrom);
    if (to) {
      updates.push({ id: o.id, data: { cargoTo: to }, from: o.cargoFrom, text: o.messageText, createdAt: o.createdAt });
    } else {
      noCity++;
    }
  }

  console.log(`✅ cargoTo to'ldirilishi mumkin: ${updates.length}`);
  console.log(`❌ Matnda farqli shahar topilmadi: ${noCity}\n`);

  console.log('--- NAMUNALAR (1-40) ---');
  updates.slice(0, 40).forEach((u, i) => {
    const date = u.createdAt.toISOString().slice(0, 10);
    const snippet = (u.text || '').substring(0, 90).replace(/\n/g, ' ');
    console.log(`${i + 1}. [${date}] [${u.from}→?]  T→${u.data.cargoTo}`);
    console.log(`     ${snippet}`);
  });

  if (!process.argv.includes('--apply')) {
    console.log(`\n⚠️  DRY RUN! Yozish uchun: node scripts/fix-routes-aggressive-15d.js --apply`);
    await prisma.$disconnect();
    return;
  }

  console.log(`\n🔄 ${updates.length} ta order yangilanmoqda...`);
  let done = 0;
  for (const { id, data } of updates) {
    await prisma.order.update({ where: { id }, data });
    done++;
    if (done % 200 === 0) console.log(`   ${done}/${updates.length}...`);
  }
  console.log(`✅ ${done} ta order muvaffaqiyatli yangilandi`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
