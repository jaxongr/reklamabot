const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const today = new Date(); today.setHours(0,0,0,0);
  const same = await p.order.findMany({
    where: { createdAt: { gte: today }, NOT: [{ cargoFrom: null }, { cargoTo: null }] },
    select: { id: true, cargoFrom: true, cargoTo: true, messageText: true },
  });
  const sameCity = same.filter(o => o.cargoFrom === o.cargoTo);
  console.log('FROM==TO:', sameCity.length);
  sameCity.forEach(o => {
    const msg = (o.messageText || '').substring(0, 120).replace(/\n/g, ' ');
    console.log(o.id.slice(-8) + ' | ' + o.cargoFrom + ' | ' + msg);
  });
  await p.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
