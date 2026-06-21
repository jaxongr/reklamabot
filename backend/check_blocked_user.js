const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const b = await p.blockedUser.findFirst({ where: { senderTelegramId: '8239974952' } });
  if (b) {
    console.log('ID:', b.senderTelegramId);
    console.log('Name:', b.senderName);
    console.log('Username:', b.senderUsername);
    console.log('Phone:', b.phone);
    console.log('Reason:', b.reason);
  } else {
    console.log('NOT FOUND');
  }
  // Also check TG SMS history for this target
  const h = await p.telegramSmsHistory.findMany({ where: { targetTelegramId: '8239974952' }, take: 5 });
  console.log('History:', JSON.stringify(h, null, 2));
  await p.$disconnect();
})();
