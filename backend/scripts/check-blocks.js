const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

(async () => {
  const total = await p.blockedUser.count({ where: { isActive: true } });
  console.log("Total active blocked users:", total);

  const manual = await p.blockedUser.findMany({
    where: { reason: "MANUAL_BLOCK", isActive: true },
    select: { senderTelegramId: true, senderName: true, userId: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  console.log("\nManual blocks:");
  for (const b of manual) {
    console.log("  ", b.senderName, "| senderTgId:", b.senderTelegramId, "| userId:", b.userId.substring(0, 12), "| at:", b.createdAt);
  }

  const blockCounts = await p.blockedUser.groupBy({
    by: ["senderTelegramId"],
    where: { isActive: true },
    _count: { userId: true },
    orderBy: { _count: { userId: "desc" } },
    take: 10,
  });
  console.log("\nTop blocked senders:");
  for (const b of blockCounts) {
    console.log("  senderTgId:", b.senderTelegramId, "| blocked by:", b._count.userId, "users");
  }

  const orders = await p.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, senderName: true, senderTelegramId: true },
  });
  console.log("\nLast 5 orders:");
  for (const o of orders) {
    console.log("  ", o.senderName, "| senderTgId:", o.senderTelegramId);
  }

  await p.$disconnect();
})();
