const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

(async () => {
  // Find the user 
  const user = await p.user.findFirst({ where: { telegramId: "5772668259" } });
  
  // Get last 5 accepted orders for this user - check if blockedByCount is populated by the service
  const orders = await p.order.findMany({
    where: { acceptedById: user.id },
    orderBy: { acceptedAt: "desc" },
    take: 5,
    select: { id: true, senderName: true, senderTelegramId: true },
  });
  
  console.log("Accepted orders:");
  for (const o of orders) {
    // Check how many blocks this sender has
    const blockCount = await p.blockedUser.count({
      where: { senderTelegramId: o.senderTelegramId || "", isActive: true },
    });
    console.log("  ", o.senderName, "| senderTgId:", o.senderTelegramId, "| blocks:", blockCount);
  }
  
  // Also check latest marketplace orders
  const marketOrders = await p.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, senderName: true, senderTelegramId: true },
  });
  
  console.log("\nMarketplace orders (last 10):");
  for (const o of marketOrders) {
    const blockCount = await p.blockedUser.count({
      where: { senderTelegramId: o.senderTelegramId || "", isActive: true },
    });
    if (blockCount > 0) {
      console.log("  ** BLOCKED **", o.senderName, "| senderTgId:", o.senderTelegramId, "| blocks:", blockCount);
    } else {
      console.log("  ", o.senderName, "| senderTgId:", o.senderTelegramId, "| blocks: 0");
    }
  }
  
  await p.$disconnect();
})();
