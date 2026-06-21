/**
 * Fix existing orders:
 * 1. Scope: INTERNAL → IMPORT/EXPORT where foreign city detected
 * 2. Same city cargoFrom=cargoTo → remove cargoTo
 * 3. Block remaining non-cargo ads
 * 4. Fix CARGO → DRIVER misclassification
 */
const { PrismaClient } = require('@prisma/client');
const { classifyOrderScope } = require('../dist/src/monitor/data/dispatcher-keywords');
const prisma = new PrismaClient();

// Non-cargo patterns
const NON_CARGO_PATTERNS = [
  /(?:комната|komnata|койка|koyka|квартира|kvartira)\s/i,
  /(?:moyka|мойка)\s+(?:ochildi|очилди)/i,
  /(?:машеник|мошенник|mashennik|moshennik)/i,
  /reklama\s+tarqatmang|реклама\s+тарқатманг/i,
  /номери\s+керак|nomeri\s+kerak/i,
  /(?:yuk\s+yuklash\s+tushirish|юк\s+юклаш\s+тушириш)/i,
  /5\s*tunalik.*shopir\s+kerak|shopir\s+kerak.*5\s*tunalik/i,
  /(?:шофир|шофёр|шофер|shofir|shofer|shofyor|shopir|haydovchi|водитель)\s+(?:керак|kerak|нужен|требуется)/i,
  /(?:сотилади|сотлади|sotiladi|sotladi|продается|продаю|продам)/i,
  /(?:ижарага|ijaraga|арендага|arendaga)/i,
  /(?:йили?\s*20[12]\d|20[12]\d\s*йили?).*?(?:пр[ао]бег|probeg|холат|xolat)/i,
  /(?:грузчик|gruzchik)\s+(?:керак|kerak|ишлари|нужен|хизмат|xizmat)/i,
  /tent\s*butka|тент\s*бутка/i,
];

// Driver patterns
const DRIVER_PATTERNS = [
  /(?:yuk|юк|юу?к)\s+(?:olaman|olamiz|оламан|оламиз|олади)/i,
  /(?:yuk|юк)\s+(?:bolsa|bo'lsa|bulsa|busa|бўлса|болса|булса|буса)\s+(?:olam|олам)/i,
  /(?:yuk|юк|юу?к)\s+(?:kerak|керак)\b/i,
  /(?:mashina|moshina|машина|мошина|fura|фура|isuzu?i?|исуз[иу]|kamaz|камаз|gazel|газел|labo|лабо|tent|тент|howo|хово|shacman|chakman|шакман|чакман|porter|портер)\s+(?:bor|бор|bo'sh|бўш|буш|бош)/i,
  /(?:haydovchiman|ҳайдовчиман|хайдовчиман|shoferman|шоферман)/i,
  /(?:шофёр|шофер|шафёр|шафер|шопир|shofer|shafyor|shopir)\s+(?:бор|bor)/i,
  /(?:возьму|возьмем|беру|берем|заберу)\s+(?:груз|грузы)/i,
  /(?:ищу|ищем|нужен|нужна)\s+(?:груз|грузы|загрузк)/i,
  /(?:еду|едем|иду|идем)\s+(?:пустой|пустая|пустые|порожний|порожняком)/i,
  /(?:бўш|буш|бош|bo'sh|bosh|bush)\s+(?:қайтаман|кетаман|бораман|qaytaman|ketaman|boraman)/i,
  /(?:заказга|zakazga)\s+/i,
  /(?:тажрибали|tajribali).*?(?:шоф|shofer|haydovchi)/i,
  /(?:категория|kategoriya)\s+(?:бор|bor)/i,
];

function isNonCargo(text) {
  // Check if it has a real cargo route indicator
  const hasRoute = /(?:дан|dan|din|ден)[\s\S]+?(?:га|ge|go|ga)\b/i.test(text);
  const hasArrow = /[-–—→➡►>]/.test(text);
  const hasCargo = /(?:yuk\s+bor|юк\s+бор|юк бор|yuk bor|груз\s+есть|груз\s+готов|бор\b)/i.test(text);
  const hasWeight = /\d+\s*(?:tonna?|tonn?|тонн?а?|kub|куб|kg|кг|tn|тн)/i.test(text);

  for (const p of NON_CARGO_PATTERNS) {
    if (p.test(text)) {
      // "shofir kerak" with route/weight/cargo = cargo owner needs truck+driver (valid cargo)
      if (/(?:шофир|шофёр|шофер|шоферр|шафёр|shofir|shofer|shofyor|shopir|водитель|haydovchi)\s+(?:керак|kerak|нужен|требуется|кере|кк\b)/i.test(text)) {
        if (hasRoute || hasArrow || hasCargo || hasWeight) continue;
      }
      // "ijaraga" but with route and cargo = valid
      if (/(?:ижарага|ijaraga|арендага|arendaga)/i.test(text)) {
        if ((hasRoute || hasArrow) && (hasCargo || hasWeight)) continue;
      }
      return true;
    }
  }
  return false;
}

function isDriver(text) {
  for (const p of DRIVER_PATTERNS) {
    if (p.test(text)) return true;
  }
  return false;
}

async function main() {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: threeDaysAgo } },
    select: { id: true, messageText: true, type: true, scope: true, cargoFrom: true, cargoTo: true, status: true, vehicleType: true },
  });

  console.log(`Jami: ${orders.length} ta order\n`);

  let scopeFixed = 0, sameCityFixed = 0, nonCargoBlocked = 0, driverFixed = 0;
  const updates = [];

  for (const order of orders) {
    if (order.status === 'REJECTED') continue;
    const text = order.messageText;
    let update = {};

    // 1. Fix same city
    if (order.cargoFrom && order.cargoTo && order.cargoFrom === order.cargoTo) {
      update.cargoTo = null;
      sameCityFixed++;
    }

    // 2. Fix scope
    const newScope = classifyOrderScope(order.cargoFrom, update.cargoTo !== undefined ? update.cargoTo : order.cargoTo, text);
    if (newScope !== order.scope) {
      update.scope = newScope;
      scopeFixed++;
    }

    // 3. Block non-cargo (but NOT if it has a valid route + cargo pattern)
    if (isNonCargo(text) && !isDriver(text)) {
      update.status = 'REJECTED';
      nonCargoBlocked++;
    }

    // 4. Fix CARGO → DRIVER
    if (order.type === 'CARGO' && isDriver(text) && update.status !== 'REJECTED') {
      // Make sure it's not a "shofer kerak" (hiring) case
      if (!/(?:шофир|шофёр|шофер|shofir|shofer|shofyor|водитель)\s+(?:керак|kerak|нужен|требуется)/i.test(text)) {
        update.type = 'DRIVER';
        driverFixed++;
      }
    }

    if (Object.keys(update).length > 0) {
      updates.push({ id: order.id, update, text: text.substring(0, 100).replace(/\n/g, ' ') });
    }
  }

  console.log(`Scope o'zgartiriladi: ${scopeFixed}`);
  console.log(`Bir xil shahar (From=To) tuzatiladi: ${sameCityFixed}`);
  console.log(`Non-cargo bloklanadi: ${nonCargoBlocked}`);
  console.log(`CARGO → DRIVER: ${driverFixed}`);

  // Show samples
  console.log('\n--- Scope fixes (first 15) ---');
  updates.filter(u => u.update.scope).slice(0, 15).forEach((u, i) => {
    const o = orders.find(x => x.id === u.id);
    console.log(`${i+1}. ${o.scope} → ${u.update.scope} | ${o.cargoFrom || '?'} → ${o.cargoTo || '?'} | ${u.text}`);
  });

  console.log('\n--- Same city fixes (first 10) ---');
  updates.filter(u => u.update.cargoTo === null).slice(0, 10).forEach((u, i) => {
    const o = orders.find(x => x.id === u.id);
    console.log(`${i+1}. ${o.cargoFrom} = ${o.cargoTo} → cargoTo removed | ${u.text}`);
  });

  console.log('\n--- Non-cargo blocked (first 15) ---');
  updates.filter(u => u.update.status === 'REJECTED').slice(0, 15).forEach((u, i) => {
    console.log(`${i+1}. ${u.text}`);
  });

  console.log('\n--- CARGO → DRIVER (first 10) ---');
  updates.filter(u => u.update.type === 'DRIVER').slice(0, 10).forEach((u, i) => {
    const o = orders.find(x => x.id === u.id);
    console.log(`${i+1}. ${o.cargoFrom || '?'} → ${o.cargoTo || '?'} | ${u.text}`);
  });

  if (!process.argv.includes('--apply')) {
    console.log('\n⚠️  DRY RUN! Qo\'llash uchun: node scripts/fix-orders-scope.js --apply');
    await prisma.$disconnect();
    return;
  }

  console.log('\n🔄 O\'zgarishlar qo\'llanmoqda...');
  let applied = 0;
  for (const { id, update } of updates) {
    await prisma.order.update({ where: { id }, data: update });
    applied++;
  }
  console.log(`✅ ${applied} ta order yangilandi`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
