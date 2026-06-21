const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const withPhone = await p.order.count({ where: { senderTelegramId: { not: { equals: null } }, phone: { not: { equals: null } } } });
  const noPhone = await p.order.count({ where: { senderTelegramId: { not: { equals: null } }, phone: { equals: null } } });
  console.log('Orders with tgId+phone:', withPhone, '| No phone:', noPhone);

  const sample = await p.order.findMany({
    where: { senderTelegramId: { not: { equals: null } }, phone: { not: { equals: null } }, senderUsername: { equals: null } },
    select: { senderTelegramId: true, phone: true, senderName: true },
    take: 5, orderBy: { createdAt: 'desc' },
  });
  console.log('\nSample (no username, has phone):');
  sample.forEach(o => console.log('  tgId:', o.senderTelegramId, '| phone:', o.phone, '| name:', o.senderName));

  // Blocked with phone
  const blockedWithPhone = await p.blockedUser.count({ where: { phone: { not: '' }, senderTelegramId: { not: '' } } });
  console.log('\nBlocked with tgId+phone:', blockedWithPhone);

  await p.$disconnect();
})();
