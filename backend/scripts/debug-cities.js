const { PrismaClient } = require('@prisma/client');
const { findCitiesInText, findCity } = require('../dist/src/monitor/data/city-distances');
const p = new PrismaClient();

(async () => {
  const since = new Date(Date.now() - 15 * 86400000);
  const orders = await p.order.findMany({
    where: { createdAt: { gte: since }, cargoFrom: { not: null }, cargoTo: null },
    select: { messageText: true, cargoFrom: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });

  console.log('Debug: findCitiesInText results for untouched orders\n');
  orders.forEach((o, i) => {
    const cities = findCitiesInText(o.messageText || '');
    const txt = (o.messageText || '').substring(0, 100).replace(/\n/g, ' ');
    console.log(`${i + 1}. [${o.cargoFrom}→?]  found=[${cities.map(c => c.name).join(', ')}]`);
    console.log(`   ${txt}`);
  });
  await p.$disconnect();
})();
