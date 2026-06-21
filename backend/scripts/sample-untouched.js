/**
 * Sample untouched orders — last 15 days, route missing, no fix applied
 * Show 50 to see patterns
 */
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  const since = new Date(Date.now() - 15 * 86400000);
  const orders = await p.order.findMany({
    where: {
      createdAt: { gte: since },
      OR: [{ cargoFrom: null }, { cargoTo: null }],
    },
    select: { id: true, messageText: true, cargoFrom: true, cargoTo: true, type: true, createdAt: true, groupTitle: true },
    orderBy: { createdAt: 'desc' },
    take: 80,
  });

  console.log(`Sample of ${orders.length} untouched orders:\n`);
  orders.forEach((o, i) => {
    const date = o.createdAt.toISOString().slice(0, 10);
    const txt = (o.messageText || '').substring(0, 150).replace(/\n/g, ' | ');
    console.log(`${i + 1}. [${date}] [${o.cargoFrom || '?'}→${o.cargoTo || '?'}] (${o.type})`);
    console.log(`   ${txt}`);
  });
  await p.$disconnect();
})();
