const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

(async () => {
  // Get all manually blocked senderTelegramIds
  const manualBlocks = await p.blockedUser.findMany({
    where: { reason: "MANUAL_BLOCK", isActive: true },
    select: { senderTelegramId: true, senderName: true },
    orderBy: { createdAt: "desc" },
  });
  console.log("Jami manual bloklar:", manualBlocks.length);

  // Check if these senders have recent orders
  const tgIds = [...new Set(manualBlocks.map(b => b.senderTelegramId))];
  const ordersWithBlocked = await p.order.findMany({
    where: {
      senderTelegramId: { in: tgIds },
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    select: { id: true, senderName: true, senderTelegramId: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  console.log("\nBloklangan senderlarning so'nggi 24 soatdagi orderlari:", ordersWithBlocked.length);
  ordersWithBlocked.forEach(o => {
    const block = manualBlocks.find(b => b.senderTelegramId === o.senderTelegramId);
    console.log("  ", o.senderName, "| tgId:", o.senderTelegramId, "| blocked as:", block?.senderName);
  });

  // Count orders per blocked sender
  for (const tgId of tgIds.slice(0, 5)) {
    const count = await p.order.count({ where: { senderTelegramId: tgId } });
    const block = manualBlocks.find(b => b.senderTelegramId === tgId);
    const blockCount = await p.blockedUser.count({ where: { senderTelegramId: tgId, isActive: true } });
    console.log("\n  Sender:", block?.senderName, "| tgId:", tgId, "| orders:", count, "| blocked by:", blockCount, "users");
  }

  await p.$disconnect();
})();
