const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

(async () => {
  // Find user by telegramId
  const user = await p.user.findFirst({
    where: { telegramId: "5772668259" },
    select: { id: true, firstName: true, telegramId: true },
  });
  if (!user) {
    console.log("User topilmadi!");
    await p.$disconnect();
    return;
  }
  console.log("User:", user.firstName, "| DB ID:", user.id);

  // User's sessions
  const sessions = await p.session.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, phone: true, status: true, totalGroups: true, activeGroups: true, _count: { select: { groups: true } } },
  });

  console.log("\n--- SESSIONLAR ---");
  for (const s of sessions) {
    const dbActiveGroups = await p.group.count({ where: { sessionId: s.id, isActive: true } });
    const dbTotalGroups = await p.group.count({ where: { sessionId: s.id } });
    console.log(
      s.id.substring(0,12), "|",
      s.name || s.phone, "|",
      s.status, "|",
      "DB groups:", dbTotalGroups, "|",
      "DB active:", dbActiveGroups, "|",
      "cached total:", s.totalGroups, "|",
      "cached active:", s.activeGroups
    );
  }

  // Total unique active groups across user's sessions
  const allGroups = await p.group.findMany({
    where: {
      session: { userId: user.id },
      isActive: true,
    },
    select: { telegramId: true, sessionId: true },
  });

  const uniqueGroups = new Set(allGroups.map(g => g.telegramId));
  console.log("\nJami unique faol guruhlar:", uniqueGroups.size);
  console.log("Jami guruhlar (dublikat bilan):", allGroups.length);

  // Group per session
  const sessGroupMap = {};
  for (const g of allGroups) {
    sessGroupMap[g.sessionId] = (sessGroupMap[g.sessionId] || 0) + 1;
  }
  for (const [sid, count] of Object.entries(sessGroupMap)) {
    console.log("  Session", sid.substring(0,12), ":", count, "ta guruh");
  }

  await p.$disconnect();
})();
