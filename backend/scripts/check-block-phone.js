const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

(async () => {
  // 1. Check if sender with phone +998901827705 is blocked
  const blocks = await p.blockedUser.findMany({
    where: {
      OR: [
        { phone: { contains: "901827705" } },
        { senderTelegramId: { contains: "901827705" } },
      ],
    },
    select: { id: true, senderName: true, senderTelegramId: true, phone: true, reason: true, isActive: true, createdAt: true, userId: true },
  });
  console.log("Blocks for 901827705:", blocks.length);
  blocks.forEach(b => console.log("  ", b.senderName, "| tgId:", b.senderTelegramId, "| phone:", b.phone, "| reason:", b.reason, "| active:", b.isActive, "| at:", b.createdAt));

  // 2. Check orders with this phone
  const orders = await p.order.findMany({
    where: {
      OR: [
        { phone: { contains: "901827705" } },
        { senderPhone: { contains: "901827705" } },
      ],
    },
    select: { id: true, senderName: true, senderTelegramId: true, phone: true, senderPhone: true, cargoFrom: true, cargoTo: true },
    take: 5,
  });
  console.log("\nOrders with 901827705:", orders.length);
  orders.forEach(o => console.log("  ", o.senderName, "| tgId:", o.senderTelegramId, "| phone:", o.phone, "| senderPhone:", o.senderPhone, "| from:", o.cargoFrom, "| to:", o.cargoTo));

  // 3. Check last 5 manual blocks
  const recent = await p.blockedUser.findMany({
    where: { reason: "MANUAL_BLOCK", isActive: true },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { senderName: true, senderTelegramId: true, phone: true, createdAt: true },
  });
  console.log("\nLast 5 manual blocks:");
  recent.forEach(b => console.log("  ", b.senderName, "| tgId:", b.senderTelegramId, "| phone:", b.phone, "| at:", b.createdAt));

  // 4. Test cargoFrom filter with "toshkent" (Latin)
  const filterResult = await p.order.count({
    where: { cargoFrom: { contains: "toshkent", mode: "insensitive" } },
  });
  console.log("\nFilter 'toshkent' (Latin, case-insensitive):", filterResult, "ta");

  // 5. Check PM2 log for block errors
  await p.$disconnect();
})();
