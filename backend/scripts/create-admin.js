const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function main() {
  const hash = crypto.createHash('sha256').update('admin123').digest('hex');

  const user = await prisma.user.upsert({
    where: { telegramId: '0000000001' },
    update: {
      role: 'SUPER_ADMIN',
      username: 'admin',
      isActive: true,
      status: 'ACTIVE',
      brandAdText: hash
    },
    create: {
      telegramId: '0000000001',
      username: 'admin',
      firstName: 'Admin',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      isActive: true,
      brandAdText: hash,
    },
  });

  console.log('Admin yaratildi:', user.id, user.username, user.role);

  // Dispatcher ham yaratish
  const dispatcher = await prisma.user.upsert({
    where: { telegramId: '0000000002' },
    update: {
      role: 'DISPATCHER',
      username: 'dispatcher',
      isActive: true,
      status: 'ACTIVE',
      brandAdText: hash
    },
    create: {
      telegramId: '0000000002',
      username: 'dispatcher',
      firstName: 'Dispatcher',
      role: 'DISPATCHER',
      status: 'ACTIVE',
      isActive: true,
      brandAdText: hash,
    },
  });

  console.log('Dispatcher yaratildi:', dispatcher.id, dispatcher.username, dispatcher.role);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
