const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

(async () => {
  // Check unique cargoFrom values that contain "toshkent" or "tash" or Тош
  const tashOrders = await p.order.findMany({
    where: {
      OR: [
        { cargoFrom: { contains: "tosh", mode: "insensitive" } },
        { cargoFrom: { contains: "тош", mode: "insensitive" } },
        { cargoFrom: { contains: "tash", mode: "insensitive" } },
      ],
    },
    select: { cargoFrom: true },
    take: 50,
  });
  
  const uniqueFrom = [...new Set(tashOrders.map(o => o.cargoFrom))];
  console.log("cargoFrom containing tosh/тош/tash:", uniqueFrom.length, "ta");
  uniqueFrom.forEach(v => console.log("  ", v));
  
  // Check how many orders have NULL cargoFrom
  const nullFrom = await p.order.count({ where: { cargoFrom: null } });
  const emptyFrom = await p.order.count({ where: { cargoFrom: "" } });
  const totalOrders = await p.order.count();
  console.log("\nTotal orders:", totalOrders);
  console.log("cargoFrom = null:", nullFrom);
  console.log("cargoFrom = '':", emptyFrom);
  
  // Test the exact API filter
  const apiResult = await p.order.count({
    where: { cargoFrom: { contains: "toshkent", mode: "insensitive" } },
  });
  console.log("\nAPI filter 'toshkent' (contains, case-insensitive):", apiResult, "ta");
  
  // More variants
  const variants = ["Тошкент", "Toshkent", "Ташкент", "toshkent", "тош"];
  for (const v of variants) {
    const count = await p.order.count({
      where: { cargoFrom: { contains: v, mode: "insensitive" } },
    });
    console.log(`  '${v}': ${count} ta`);
  }

  // Most common cargoFrom values
  const topFrom = await p.$queryRaw`
    SELECT "cargoFrom", COUNT(*) as cnt 
    FROM "Order" 
    WHERE "cargoFrom" IS NOT NULL AND "cargoFrom" != ''
    GROUP BY "cargoFrom" 
    ORDER BY cnt DESC 
    LIMIT 20
  `;
  console.log("\nTop 20 cargoFrom:");
  topFrom.forEach(r => console.log(`  ${r.cargoFrom}: ${r.cnt}`));

  await p.$disconnect();
})();
