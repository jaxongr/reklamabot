const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const s = await p.telegramSmsSession.findFirst();
  console.log('Status:', s.status);
  console.log('isEnabled:', s.isEnabled);
  console.log('sessionString null?:', s.sessionString === null);
  console.log('sessionString empty?:', s.sessionString === '');
  console.log('sessionString length:', s.sessionString ? s.sessionString.length : 'NULL');
  await p.$disconnect();
})();
