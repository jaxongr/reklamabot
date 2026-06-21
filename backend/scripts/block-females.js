const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const today = new Date(); today.setHours(0,0,0,0);

  const femaleNames = [
    "ruxshona","dilafruz","dilshoda","zebo","raxima","saidaxon","ruqiya",
    "parizoda","xurliy","guli","intizor","sevil","mohigul","shahnoza",
    "aziza","дилшода","севиля","рухшона","руқия","паризода","хурлий",
    "саидахон","nilufar","gulnora","maftuna","dilnoza","shahlo","feruza",
    "nodira","zulfiya","malika","madina","fotima","нилуфар","гулнора","малика"
  ];

  const orders = await p.order.findMany({
    where: { createdAt: { gte: today } },
    select: {
      id: true, userId: true, senderName: true, senderTelegramId: true,
      senderUsername: true, phone: true, messageText: true,
      groupTitle: true, groupTelegramId: true
    }
  });

  const toBlock = [];
  for (const o of orders) {
    const name = (o.senderName || "").toLowerCase().trim();
    const firstName = name.split(/\s+/)[0].replace(/[^\p{L}\p{N}]/gu, "");

    // -ova/-eva familiya tekshirish
    const hasOva = /\w+(ova|eva|ovna|evna)\b/i.test(name) || /\w+(ова|ева|овна|евна)/i.test(name);

    let matched = false;
    for (const fn of femaleNames) {
      if (firstName === fn || firstName.startsWith(fn)) { matched = true; break; }
    }

    if (!matched && hasOva) {
      const manNames = ["murod","sardor","bahodir","jamshid","sherzod","dilshod","farxod","mansur","rustam","alisher","obid","мурод","сардор"];
      if (!manNames.some(m => firstName.startsWith(m))) matched = true;
    }

    if (matched && o.senderTelegramId) {
      toBlock.push({
        userId: o.userId,
        senderTelegramId: o.senderTelegramId,
        senderName: o.senderName,
        senderUsername: o.senderUsername || null,
        phone: o.phone || null,
        messageText: (o.messageText || "").substring(0, 500),
        groupTitle: o.groupTitle || "",
        groupTelegramId: o.groupTelegramId || ""
      });
    }
  }

  // Unique by senderTelegramId
  const seen = new Set();
  const unique = toBlock.filter(b => {
    if (seen.has(b.senderTelegramId)) return false;
    seen.add(b.senderTelegramId);
    return true;
  });

  console.log("Found", unique.length, "female senders to block:");
  unique.forEach(b => console.log(`  ${b.senderName} | TgID: ${b.senderTelegramId}`));

  // Allaqachon bloklangan senderlarni tekshirish
  const existing = await p.blockedUser.findMany({
    where: {
      senderTelegramId: { in: unique.map(u => u.senderTelegramId) },
      isActive: true
    },
    select: { senderTelegramId: true }
  });
  const existingIds = new Set(existing.map(e => e.senderTelegramId));

  const newBlocks = unique.filter(u => !existingIds.has(u.senderTelegramId));
  console.log("\nAlready blocked:", existingIds.size);
  console.log("New to block:", newBlocks.length);

  // Bloklash
  for (const b of newBlocks) {
    await p.blockedUser.create({
      data: {
        userId: b.userId,
        senderTelegramId: b.senderTelegramId,
        senderName: b.senderName,
        senderUsername: b.senderUsername,
        phone: b.phone,
        reason: "FEMALE_NAME",
        ruleNumber: 3,
        messageText: b.messageText,
        groupTitle: b.groupTitle,
        groupTelegramId: b.groupTelegramId,
        isActive: true,
      }
    });
    console.log(`  BLOCKED: ${b.senderName} (${b.senderTelegramId})`);
  }

  // Bugungi bloklangan senderlarning orderlarini o'chirish
  if (newBlocks.length > 0) {
    const deleted = await p.order.deleteMany({
      where: {
        senderTelegramId: { in: newBlocks.map(b => b.senderTelegramId) },
        createdAt: { gte: today }
      }
    });
    console.log(`\nDeleted ${deleted.count} orders from blocked senders`);
  }

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
