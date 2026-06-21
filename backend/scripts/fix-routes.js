/**
 * Barcha orderlarni qayta parse qilib yo'nalishlarni tuzatish.
 * - A=B bir xil bo'lganlarni tuzatish
 * - Yo'nalishsizlarni tuzatish
 * - Faqat FROM bo'lganlarni TO ni topish
 * - Yuk bilan bog'liq bo'lmaganlarni o'chirish
 */

const { PrismaClient } = require('@prisma/client');
const { findCitiesInText, calculateDistance } = require('../dist/src/monitor/data/city-distances');

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL || 'postgresql://reklama_user:reklama_password@localhost:5434/reklama_bot?schema=public' } },
});

// Yuk bilan bog'liq emas — o'chirish kerak
const SPAM_PATTERNS = [
  'катализатор', 'katalizator', 'аккумулятор бор оптом', 'кудук кав',
  'металлом оламиз', 'metallom olamiz', 'fast food', 'мехмонхона', 'mexmonxona',
  'вулканизатсия', 'перфоратор', 'затирка', 'автокран хизмат', 'грузчик бор',
  'mashina topib beraman', 'yuk topib beraman', 'карта перевот', 'кафел 100',
  'kriditga ayfon', 'kriditga telefon', 'вишка мошин', 'электрик',
  'клик номеримиз', 'firibgar', 'aldanib', 'reklama tarqatmang',
  'сомон ва беда прес', 'tent butka xizmat', 'засипка',
];

async function main() {
  console.log('=== ORDER ROUTE FIX SCRIPT ===');

  // 1. Spam orderlarni o'chirish
  console.log('\n--- SPAM O\'CHIRISH ---');
  let deletedCount = 0;
  for (const pattern of SPAM_PATTERNS) {
    const result = await prisma.$executeRawUnsafe(
      `DELETE FROM "Order" WHERE LOWER("messageText") LIKE $1 AND "cargoFrom" IS NULL AND "cargoTo" IS NULL`,
      `%${pattern.toLowerCase()}%`
    );
    if (result > 0) {
      console.log(`  "${pattern}" → ${result} ta o'chirildi`);
      deletedCount += result;
    }
  }
  console.log(`  Jami o'chirildi: ${deletedCount}`);

  // 2. A=B bir xil va yo'nalishsiz orderlarni qayta parse
  console.log('\n--- YO\'NALISH TUZATISH ---');

  const problemOrders = await prisma.order.findMany({
    where: {
      OR: [
        { cargoFrom: null, cargoTo: null },
        { cargoFrom: { not: null }, cargoTo: null },
        { // A=B bir xil
          NOT: { cargoFrom: null },
          NOT: { cargoTo: null },
        },
      ],
    },
    select: { id: true, messageText: true, cargoFrom: true, cargoTo: true },
  });

  // A=B orderlarni alohida olish
  const sameAB = await prisma.$queryRaw`
    SELECT id, "messageText", "cargoFrom", "cargoTo"
    FROM "Order"
    WHERE "cargoFrom" IS NOT NULL AND "cargoTo" IS NOT NULL AND "cargoFrom" = "cargoTo"`;

  const noRoute = await prisma.order.findMany({
    where: { cargoFrom: null, cargoTo: null },
    select: { id: true, messageText: true },
  });

  const onlyFrom = await prisma.order.findMany({
    where: { cargoFrom: { not: null }, cargoTo: null },
    select: { id: true, messageText: true, cargoFrom: true },
  });

  console.log(`  A=B bir xil: ${sameAB.length}`);
  console.log(`  Yo'nalishsiz: ${noRoute.length}`);
  console.log(`  Faqat FROM: ${onlyFrom.length}`);

  let fixedSameAB = 0;
  let fixedNoRoute = 0;
  let fixedOnlyFrom = 0;

  // 2a. A=B tuzatish
  for (const order of sameAB) {
    const cities = findCitiesInText(order.messageText);
    if (cities.length >= 2 && cities[0].name !== cities[1].name) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          cargoFrom: cities[0].name,
          cargoTo: cities[1].name,
          distance: Math.round(calculateDistance(cities[0].name, cities[1].name)) || undefined,
        },
      });
      fixedSameAB++;
    }
  }
  console.log(`  A=B tuzatildi: ${fixedSameAB}/${sameAB.length}`);

  // 2b. Yo'nalishsiz tuzatish
  for (const order of noRoute) {
    const cities = findCitiesInText(order.messageText);
    if (cities.length >= 2) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          cargoFrom: cities[0].name,
          cargoTo: cities[1].name,
          distance: Math.round(calculateDistance(cities[0].name, cities[1].name)) || undefined,
        },
      });
      fixedNoRoute++;
    } else if (cities.length === 1) {
      await prisma.order.update({
        where: { id: order.id },
        data: { cargoFrom: cities[0].name },
      });
    }
  }
  console.log(`  Yo'nalishsiz tuzatildi: ${fixedNoRoute}/${noRoute.length}`);

  // 2c. Faqat FROM — TO ni topish
  for (const order of onlyFrom) {
    const cities = findCitiesInText(order.messageText);
    if (cities.length >= 2) {
      const from = cities[0].name;
      const to = cities[1].name;
      if (from !== to) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            cargoFrom: from,
            cargoTo: to,
            distance: Math.round(calculateDistance(cities[0].name, cities[1].name)) || undefined,
          },
        });
        fixedOnlyFrom++;
      }
    }
  }
  console.log(`  Faqat FROM tuzatildi: ${fixedOnlyFrom}/${onlyFrom.length}`);

  // 3. Yakuniy statistika
  const final = await prisma.$queryRawUnsafe(`
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN "cargoFrom" IS NOT NULL AND "cargoTo" IS NOT NULL AND "cargoFrom" != "cargoTo" THEN 1 END) as good,
      COUNT(CASE WHEN "cargoFrom" = "cargoTo" THEN 1 END) as same_ab,
      COUNT(CASE WHEN "cargoFrom" IS NOT NULL AND "cargoTo" IS NULL THEN 1 END) as only_from,
      COUNT(CASE WHEN "cargoFrom" IS NULL AND "cargoTo" IS NULL THEN 1 END) as no_route
    FROM "Order"`);

  console.log('\n=== YAKUNIY NATIJA ===');
  console.log(final[0]);
  console.log(`\nJami tuzatildi: ${fixedSameAB + fixedNoRoute + fixedOnlyFrom}`);
  console.log(`Spam o'chirildi: ${deletedCount}`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
