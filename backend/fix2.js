const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
async function main() {
  await p.session.update({
    where: { id: "cmlwz3gy9000311zi2c5hxmz0" },
    data: { status: "DELETED", sessionString: null }
  });
  console.log("Session 1814 DELETED");
  const d = await p.group.deleteMany({
    where: { sessionId: "cmlwz3gy9000311zi2c5hxmz0" }
  });
  console.log("Deleted", d.count, "groups from dead session");
  await p.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
