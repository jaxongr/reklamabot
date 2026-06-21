const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const cfg = await p.systemConfig.findUnique({ where: { key: 'tg_sms_auto_config' } });
  console.log('Config:', cfg?.value || 'NOT FOUND');
  const sessions = await p.telegramSmsSession.findMany({ select: { id: true, phone: true, status: true, isEnabled: true } });
  console.log('Sessions:', JSON.stringify(sessions, null, 2));
  await p.$disconnect();
})();
