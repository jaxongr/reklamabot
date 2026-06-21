/**
 * Fix orders with missing cargoFrom/cargoTo by re-parsing messageText.
 *
 * Usage: cd /root/reklamabot/backend && node scripts/fix-missing-routes.js
 *
 * Uses compiled city-distances.js for findCity/findCitiesInText.
 */

const { PrismaClient } = require("@prisma/client");
const { findCity, findCitiesInText, calculateDistance } = require("../dist/src/monitor/data/city-distances");

const prisma = new PrismaClient();

function parseRoute(text) {
  if (!text || text.length < 5) return null;

  const normalizedText = text.replace(/[\u02BB\u02BC\u2018\u2019\u0060\u02BD\u02BE\u02C8\u02CA]/g, "'");

  let cargoFrom = null;
  let cargoTo = null;

  // 1. Arrow pattern: Toshkent → Samarqand
  const routeMatch = normalizedText.match(
    /([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']+(?:\s+[A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']+){0,2})\s*[-–—→➡►>⏩]\s*([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']+(?:\s+[A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']+){0,2})/,
  );
  if (routeMatch) {
    cargoFrom = routeMatch[1].trim();
    cargoTo = routeMatch[2].trim();
  }

  const WBE = '(?![a-zA-Zа-яА-ЯўқғҳёЎҚҒҲЁ])';
  const LETTER = "[A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']";

  // 2. dan...ga pattern
  if (!cargoFrom) {
    const danGaMatch = normalizedText.match(
      new RegExp(`(${LETTER}+(?:\\s+${LETTER}+){0,1})\\s*(?:dan|дан)\\s+[\\s\\S]*?(${LETTER}+(?:\\s+${LETTER}+){0,1})\\s*(?:ga|га|ge|ге|qa)${WBE}`, 'i'),
    );
    if (danGaMatch) {
      cargoFrom = danGaMatch[1].trim();
      cargoTo = danGaMatch[2].trim();
    }
  }

  // 3. Attached form: Toshkentdan Samarqandga
  if (!cargoFrom) {
    const attachedMatch = normalizedText.match(
      new RegExp(`(${LETTER}{3,})(?:дан|дин|ден|dan|din|den)[\\s\\S]+?(${LETTER}{3,})(?:га|ге|го|гача|qa|ка|ga|ge|go|gacha)${WBE}`, 'i'),
    );
    if (attachedMatch) {
      cargoFrom = attachedMatch[1].trim();
      cargoTo = attachedMatch[2].trim();
    }
  }

  // 4. From-only
  if (!cargoFrom) {
    const fromOnlyMatch = normalizedText.match(
      new RegExp(`(${LETTER}{3,})(?:дан|дин|ден|dan|din|den)${WBE}`, 'i'),
    );
    if (fromOnlyMatch) cargoFrom = fromOnlyMatch[1].trim();
  }

  // 5. To-only
  if (!cargoTo) {
    const toOnlyMatch = normalizedText.match(
      new RegExp(`(${LETTER}{3,})(?:га|ге|го|гача|qa|ка|ga|ge|go|gacha)${WBE}`, 'i'),
    );
    if (toOnlyMatch) cargoTo = toOnlyMatch[1].trim();
  }

  // Normalize via city DB
  if (cargoFrom) {
    const cityFrom = findCity(cargoFrom);
    cargoFrom = cityFrom ? cityFrom.name : null;
  }
  if (cargoTo) {
    const cityTo = findCity(cargoTo);
    cargoTo = cityTo ? cityTo.name : null;
  }

  // FALLBACK: findCitiesInText
  if (!cargoFrom || !cargoTo) {
    const citiesInText = findCitiesInText(normalizedText);
    if (citiesInText.length >= 2) {
      if (!cargoFrom) cargoFrom = citiesInText[0].name;
      if (!cargoTo) cargoTo = citiesInText[1].name;
    } else if (citiesInText.length === 1) {
      if (!cargoFrom) cargoFrom = citiesInText[0].name;
    }
  }

  if (!cargoFrom && !cargoTo) return null;

  // Distance
  let distance = null;
  if (cargoFrom && cargoTo) {
    distance = calculateDistance(cargoFrom, cargoTo);
  }

  return { cargoFrom, cargoTo, distance };
}

async function main() {
  console.log("=== Yo'nalishi yo'q orderlarni tuzatish ===\n");

  // 1. Statistika
  const total = await prisma.order.count();
  const noFrom = await prisma.order.count({ where: { OR: [{ cargoFrom: null }, { cargoFrom: "" }] } });
  const noTo = await prisma.order.count({ where: { OR: [{ cargoTo: null }, { cargoTo: "" }] } });
  console.log(`Jami orderlar: ${total}`);
  console.log(`cargoFrom yo'q: ${noFrom}`);
  console.log(`cargoTo yo'q: ${noTo}`);
  console.log("---\n");

  // 2. Yo'nalishi yo'q orderlarni olish
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { cargoFrom: null },
        { cargoFrom: "" },
        { cargoTo: null },
        { cargoTo: "" },
      ],
    },
    select: { id: true, messageText: true, cargoFrom: true, cargoTo: true },
  });

  console.log(`Qayta ishlash kerak: ${orders.length} ta order\n`);

  let fixedBoth = 0;
  let fixedFrom = 0;
  let fixedTo = 0;
  let noFix = 0;

  for (const order of orders) {
    const parsed = parseRoute(order.messageText || "");
    if (!parsed) {
      noFix++;
      continue;
    }

    const updates = {};
    const needFrom = !order.cargoFrom || order.cargoFrom === "";
    const needTo = !order.cargoTo || order.cargoTo === "";

    if (needFrom && parsed.cargoFrom) {
      updates.cargoFrom = parsed.cargoFrom;
    }
    if (needTo && parsed.cargoTo) {
      updates.cargoTo = parsed.cargoTo;
    }
    if (parsed.distance && updates.cargoFrom && updates.cargoTo) {
      updates.distance = parsed.distance;
    }
    // Agar hech narsa topilmasa
    if (Object.keys(updates).length === 0) {
      noFix++;
      continue;
    }

    await prisma.order.update({
      where: { id: order.id },
      data: updates,
    });

    if (updates.cargoFrom && updates.cargoTo) {
      fixedBoth++;
    } else if (updates.cargoFrom) {
      fixedFrom++;
    } else if (updates.cargoTo) {
      fixedTo++;
    }
  }

  console.log("=== NATIJA ===");
  console.log(`Ikkala yo'nalish tuzatildi: ${fixedBoth}`);
  console.log(`Faqat cargoFrom tuzatildi: ${fixedFrom}`);
  console.log(`Faqat cargoTo tuzatildi: ${fixedTo}`);
  console.log(`Tuzatib bo'lmadi: ${noFix}`);
  console.log(`Jami qayta ishlandi: ${orders.length}`);

  // Yangi statistika
  const newNoFrom = await prisma.order.count({ where: { OR: [{ cargoFrom: null }, { cargoFrom: "" }] } });
  const newNoTo = await prisma.order.count({ where: { OR: [{ cargoTo: null }, { cargoTo: "" }] } });
  console.log(`\n--- YANGI holat ---`);
  console.log(`cargoFrom yo'q: ${noFrom} → ${newNoFrom}`);
  console.log(`cargoTo yo'q: ${noTo} → ${newNoTo}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
