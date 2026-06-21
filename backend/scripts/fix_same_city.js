const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

// Qo'lda tuzatish — matndan aniq ko'rinib turgan yo'nalishlar
const MANUAL_FIXES = {
  // "Gʻijdivondan Samarqandga" → G'ijduvon → Samarqand
  'r1cy2blz': { cargoFrom: "G'ijduvon", cargoTo: 'Samarqand' },
  // "Ohangararondan - denovga"
  'z6idl1uw': { cargoFrom: 'Ohangaron', cargoTo: 'Denov' },
  // "Нуксдан. Бухорога."
  'xnlt3i53': { cargoFrom: 'Nukus', cargoTo: 'Buxoro' },
  // "Qasrshi bishkentdan samarqandga"
  '8rhewl20': { cargoFrom: 'Qarshi', cargoTo: 'Samarqand' },
  // "Jarqurg'ondan Samarqandga"
  '2pjhh9mb': { cargoFrom: "Jarqo'rg'on", cargoTo: 'Samarqand' },
  // "Yurxandaryodan samarqanga"  (Surxondaryo → Samarqand)
  's5jpyxdz': { cargoFrom: 'Surxondaryo', cargoTo: 'Samarqand' },
  // "Кашкадареодан хоразимга"
  'b11g80c7': { cargoFrom: 'Qashqadaryo', cargoTo: 'Xorazm' },
  // "Buvaydan Chiroqchiga"
  'dzgidk6x': { cargoFrom: 'Buvayda', cargoTo: 'Chiroqchi' },
  // "Олтирикдан бухорога"
  '0je69l0m': { cargoFrom: 'Oltiariq', cargoTo: 'Buxoro' },
  // "Hasanboydan Bog'dodga"
  '5prq6tlr': { cargoFrom: 'Hasanboy', cargoTo: "Bog'dod" },
  // "Kukdaladan Fargʻona ga"
  'l677rb8c': { cargoFrom: 'Quva', cargoTo: "Farg'ona" },
  // "Кувасойдан тошкентга"
  '9lf6t9g1': { cargoFrom: 'Quvasoy', cargoTo: 'Toshkent' },
  // "НАВОЙИДАН БУХОРОГА"
  '4gzmof16': { cargoFrom: 'Navoiy', cargoTo: 'Buxoro' },
  // "челябинийкийдан тошкентга"
  'afvy7khy': { cargoFrom: 'Chelyabinsk', cargoTo: 'Toshkent' },
  // "андижонга" (Nazarbe Andijonga)
  'zbch56hi': { cargoFrom: 'Toshkent', cargoTo: 'Andijon' },
  // "анггирендан ко'конга"
  'c47669ng': { cargoFrom: 'Angren', cargoTo: "Qo'qon" },
  // "Жиззахга ором боззорига" - shunchaki Jizzax ichida yuk, FROM yo'q
  // "Бухордан деновга"
  'dxq9dgtv': { cargoFrom: 'Buxoro', cargoTo: 'Denov' },
  // "Jarqurgondan chiroqchiga"
  'nm8ynofn': { cargoFrom: "Jarqo'rg'on", cargoTo: 'Chiroqchi' },
  // "Shaxrisabizdan buhoroga"
  'ytfzv6bf': { cargoFrom: 'Shahrisabz', cargoTo: 'Buxoro' },
  // "Ургнчдан Куконга"
  'l32oom3i': { cargoFrom: 'Urganch', cargoTo: "Qo'qon" },
  // "ВОДНИКДАН - СЕРГЕЛИГА" (Toshkent ichi)
  'oq5fbkeo': { cargoFrom: 'Toshkent', cargoTo: 'Sergeli' },
  // "Qoraqalpoq qonliy koldan toshkentga"
  'iy3gktfe': { cargoFrom: "Qo'ng'irot", cargoTo: 'Toshkent' },
  // "toshindan qashqadaryoga"
  '6uygu7z6': { cargoFrom: 'Toshkent', cargoTo: 'Qashqadaryo' },
  // "Muynoqdan surxandaryoga"
  '5nc5qcv0': { cargoFrom: 'Muynoq', cargoTo: 'Surxondaryo' },
  // "Mebel markazdan Qo'qonga" — yo'nalish aniq emas, o'tkazib yuboramiz
  // "Xorazmga 12.t yuk bor" — faqat TO bor, FROM yo'q
  // "Sadoqata yarim labo' qo'qonga" — yo'nalish noaniq
  // "polni salom kk toshkentga" — yo'nalish noaniq
};

async function main() {
  const today = new Date(); today.setHours(0, 0, 0, 0);

  // Barcha bugungi orderlarni olish
  const allOrders = await p.order.findMany({
    where: { createdAt: { gte: today } },
    select: { id: true, cargoFrom: true, cargoTo: true }
  });

  let fixed = 0;
  for (const o of allOrders) {
    const shortId = o.id.slice(-8);
    if (MANUAL_FIXES[shortId]) {
      const fix = MANUAL_FIXES[shortId];
      await p.order.update({
        where: { id: o.id },
        data: fix
      });
      console.log(`FIXED: ${shortId} | ${fix.cargoFrom} -> ${fix.cargoTo}`);
      fixed++;
    }
  }

  console.log('\nFixed:', fixed);

  // Yakuniy stat
  const total = await p.order.count({ where: { createdAt: { gte: today } } });
  const withBoth = await p.order.count({
    where: { createdAt: { gte: today }, NOT: [{ cargoFrom: null }, { cargoTo: null }] }
  });
  const sameCity = (await p.order.findMany({
    where: { createdAt: { gte: today }, NOT: [{ cargoFrom: null }, { cargoTo: null }] },
    select: { cargoFrom: true, cargoTo: true },
  })).filter(o => o.cargoFrom === o.cargoTo).length;

  console.log('Jami:', total);
  console.log('To\'liq yo\'nalishli:', withBoth, '(' + Math.round(withBoth/total*100) + '%)');
  console.log('FROM == TO qolgan:', sameCity);

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
