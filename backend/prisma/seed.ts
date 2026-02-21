import { PrismaClient, UserRole, UserStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create SUPER_ADMIN user
  const admin = await prisma.user.upsert({
    where: { telegramId: '0000000001' },
    update: {},
    create: {
      telegramId: '0000000001',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'SuperAdmin',
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      isActive: true,
      language: 'uz',
    },
  });

  console.log('Admin user created:', admin.id, admin.username);

  // Create DISPATCHER user
  const dispatcher = await prisma.user.upsert({
    where: { telegramId: '0000000002' },
    update: {},
    create: {
      telegramId: '0000000002',
      username: 'dispatcher',
      firstName: 'Dispatcher',
      role: UserRole.DISPATCHER,
      status: UserStatus.ACTIVE,
      isActive: true,
      language: 'uz',
    },
  });

  console.log('Dispatcher user created:', dispatcher.id, dispatcher.username);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
