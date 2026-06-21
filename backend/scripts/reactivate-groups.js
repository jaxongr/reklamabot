const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

(async () => {
  // Session 0312 — barcha guruhlarni qayta faollashtirish
  const sessionId = "cmm98eqkw001";

  // Full session ID
  const session = await p.session.findFirst({
    where: { id: { startsWith: sessionId } },
    select: { id: true, name: true, phone: true, status: true },
  });

  if (!session) {
    console.log("Session topilmadi:", sessionId);
    await p.$disconnect();
    return;
  }

  console.log("Session:", session.id, "|", session.name || session.phone, "|", session.status);

  // Deaktivlangan guruhlar soni
  const inactive = await p.group.count({ where: { sessionId: session.id, isActive: false } });
  const active = await p.group.count({ where: { sessionId: session.id, isActive: true } });
  console.log("Faol:", active, "| Nofaol:", inactive);

  if (inactive === 0) {
    console.log("Nofaol guruhlar yo'q, hech narsa qilish kerak emas.");
    await p.$disconnect();
    return;
  }

  // Qayta faollashtirish
  const result = await p.group.updateMany({
    where: { sessionId: session.id, isActive: false },
    data: { isActive: true },
  });

  console.log(`\n${result.count} ta guruh qayta faollashtirildi!`);

  // Cached counters yangilash
  const newActive = await p.group.count({ where: { sessionId: session.id, isActive: true } });
  const newTotal = await p.group.count({ where: { sessionId: session.id } });
  await p.session.update({
    where: { id: session.id },
    data: { totalGroups: newTotal, activeGroups: newActive },
  });
  console.log("Yangilangan: total:", newTotal, "| active:", newActive);

  // Barcha user sessionlarini ham yangilaymiz
  const userSessions = await p.session.findMany({
    where: { userId: (await p.session.findUnique({ where: { id: session.id }, select: { userId: true } })).userId, status: "ACTIVE" },
    select: { id: true },
  });

  for (const s of userSessions) {
    const sActive = await p.group.count({ where: { sessionId: s.id, isActive: true } });
    const sTotal = await p.group.count({ where: { sessionId: s.id } });
    await p.session.update({
      where: { id: s.id },
      data: { totalGroups: sTotal, activeGroups: sActive },
    });
    console.log("Session", s.id.substring(0,12), ": total:", sTotal, "| active:", sActive);
  }

  await p.$disconnect();
})();
