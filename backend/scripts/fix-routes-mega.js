/**
 * MEGA fix — qo'lda har bir orderni tahlil qilib to'g'rilash
 * FROM ONLY → cargoTo aniqlash
 * NO ROUTE → route yoki REJECT
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ===== MANUAL FIXES =====
// id prefix → { cargoFrom, cargoTo, type, reject }

const MANUAL_NO_ROUTE = {
  // Route aniqlanadi
  'зангаотадан абу сахий': { from: 'Zangiota', to: 'Toshkent' }, // Abu Sahiy = Toshkent
  'Конли колдан хоразима': { from: 'Konlikol', to: 'Xorazm' },
  'Собрахимовдан Жоми': { from: 'Toshkent', to: 'Toshkent' }, // shahar ichi
  'TOSHKNAN FORGANGA': { from: 'Toshkent', to: "Farg'ona" },
  'TOSHKNADNA NAMGANGA': { from: 'Toshkent', to: 'Namangan' },
  '40летдан (пипе) Жомийга': { from: 'Toshkent', to: 'Toshkent' }, // shahar ichi
  'tow pskendan qawqa doaryoga': { from: 'Piskent', to: "Qashqadaryo" },
  'Шаландага шопр керак тошкента': { from: 'Toshkent', to: 'Toshkent' },
  'Кунгротани  ката кургана': { from: "Qo'ng'irot", to: 'Kattaqorgon' },
  'Хундай портер.*Тошкента иш бор': { from: 'Toshkent', to: 'Toshkent' },
  'Сурхадарйда  талиэатинга': { from: 'Surxondaryo', to: 'Surxondaryo' },
  'янги еулдан тошкегтга': { from: 'Yangiyul', to: 'Toshkent' },
  'Yagi yil saldatskdan yagi tashmiga': { from: 'Toshkent', to: 'Toshkent' }, // mesni
  'dashtabodan qaytamiz': { from: 'Dashtobod', to: null, type: 'DRIVER' },
  'Food citi.*prastoyga': { from: 'Toshkent', to: 'Toshkent' },
  'Sarosyidan Food siyiga': { from: 'Surxondaryo', to: 'Toshkent' },
  'Yuk bor laminat 26 tona oltakn': { from: null, to: 'Oltiariq' },
  'Даштабодан вадега пез бор': { from: 'Dashtobod', to: 'Vodil' },
  'Жзахдан.еук.еогми': { from: 'Jizzax', to: null },
  'Ромтандан.гждвондан.кзлтпа': { from: 'Romitan', to: 'Jizzax' },
  'Denovdam qoraturbagacha': { from: 'Denov', to: "Qo'rg'ontepa" },
  'Tosh misni ish bor': { from: 'Toshkent', to: 'Toshkent' },
  'Urgacha bozarda prastoyga': { from: 'Urganch', to: 'Urganch' },
  'Abusaxidan begabod shahriga': { from: 'Toshkent', to: 'Begavot' },
  'olmasdan yongi yoʻlga': { from: 'Olmaliq', to: 'Yangiyul' },
  'tishkentda yuk.*goʻsh ref': { from: 'Toshkent', to: null },
  'Surxadaryodan yuk olamz': { from: 'Surxondaryo', to: null, type: 'DRIVER' },
  // REJECT — spam/non-cargo
  'Yuk bor 951727199': 'REJECT',
  'yuk bir ekan': 'REJECT',
  'Akalar 20 talik.*elektirik': 'REJECT',
  'Manga shopirlar kere': 'REJECT',
  'Юк бор \\+998 91 890': 'REJECT',
  'Labo kerak srochna  Komiljon': 'REJECT', // shahar yoq
  'Tel qib yubor': 'REJECT',
  'Yuk bor 150 kg pati til': 'REJECT',
  'Namangandi qauerida': 'REJECT',
  'shopir akalar isuzuga yuk bor faqat srochni': 'REJECT',
  'телда гаплашишади.*Месний': 'REJECT',
  'Yuk bor\\+998': 'REJECT',
  'Qoshimcha yuk bor 95 127': 'REJECT',
  'Реф машина керак футсида': 'REJECT',
  'юк бор срочно$': 'REJECT',
  'Ref isuzu kimda bor aloqaga': 'REJECT',
  '2,500 tonalik yuk yetkazamz': 'REJECT',
  'Bu yukni egasi 120 beradi': 'REJECT',
  'YUKI BOR MIJOZLAR': 'REJECT',
  '502774334 йук бор': 'REJECT',
  'Akalar 40.596.JCA': 'REJECT',
  'Ерталабга 96керак': 'REJECT',
  'G\'izorlik Kamzchilar': 'REJECT',
  'Bita bor keldma bilmyman': 'REJECT',
  'Yuk bor  3 tonna  Ikta': 'REJECT', // shahar yoq
  'Требуется фура.*оплата наличными.*777777': 'REJECT', // fake reklama
  '33.337.33.39.elektirik': 'REJECT',
  'Adblue   S 32': 'REJECT',
  'Nomer tasheng nomerim': 'REJECT',
  'Shofir kerka  Nomer': 'REJECT',
  'Канализаци.*труба.*ташаш': 'REJECT',
  'Optim narxlarda urugʻlar kerakmi': 'REJECT',
  'vichtochkga eliktirik': 'REJECT',
  'МЕСНИ.*ИШЛАР.*БОЛСА КИЛАМИЗ': 'REJECT',
  'Manipulyator kerak.*кантенирни': { from: 'Toshkent', to: 'Toshkent' }, // qumariq = Toshkent
  'Bugunga kichiroq gazel': 'REJECT',
};

// FROM ONLY → cargoTo qo'shish (text pattern → to city)
const FROM_ONLY_FIXES = {
  'Jome bozorga.*dekor panel': 'Toshkent', // Jomiy = Toshkent
  'шымбайга жук бар': 'Chimboy',
  'ucqorgondan chustga': { swap: true, from: 'Namangan', to: 'Chust' },
  'Chorvoqdan Samarqandga': { swap: true, from: 'Toshkent', to: 'Samarqand' },
  'Gulistondan.*Yozyovonga': { to: 'Yozyovon' },
  'Тошкантга харакатамиз': { swap: true, from: null, to: 'Toshkent' },
  'Kattaqoʻrgʻonga.*drabilka': { to: "Marg'ilon" }, // Margilodan → Kattaqorgon, FROM wrong
  'shahrisabizga shalanda': { to: 'Shahrisabz' },
  'Yetti tomdan.*Jomga': { to: 'Jomboy' },
  'Кувага Трейлер': { swap: true, from: "Farg'ona", to: 'Quva' },
  'shahrisabzga.*chakman': { swap: true, from: 'Samarqand', to: 'Shahrisabz' },
  'дантошкентга.*оламиз': { to: 'Toshkent' },
  'гулистонга.*тонна юк': { swap: true, from: 'Andijon', to: 'Guliston' },
  'jizzahga fo\'ra kerik': { swap: true, from: "Farg'ona", to: 'Jizzax' },
  'Xorazma DOGRUZ': { to: 'Xorazm' },
  'баликчига картошка': { swap: true, from: 'Toshkent', to: 'Baliqchi' },
  'шофирман.*Бухоро': { type: 'DRIVER' },
  'коратепага трайллир': { to: 'Toshkent' }, // shahar ichi
  'Ангордаг Нукусза': { to: 'Nukus' },
  'oltiariqqa taxta bor': { swap: true, from: 'Toshkent', to: 'Oltiariq' },
  'Samarqandga yuk bor edi': { to: 'Samarqand' },
  'muzrabotan.toshkentga': { swap: true, from: 'Surxondaryo', to: 'Toshkent' },
  'Toshketga yuk bor.*armature': { swap: true, from: 'Namangan', to: 'Toshkent' },
  'тошбулокга 9 т': { to: 'Toshkent' },
  'toshkenta turiman': { type: 'DRIVER' },
  'Gagarindan.*gazzabulok': { to: 'Jizzax' },
  'челакга.*семичка': { swap: true, from: 'Toshkent', to: 'Chelak' },
  'тошкентгa.*болса оламиз': { to: 'Toshkent', type: 'DRIVER' },
  'Horezima 25 ton yuk': { to: 'Xorazm' },
  'buxoroga 25 t silos': { to: 'Buxoro' },
  'kata qurgonga borish': { swap: true, from: 'Samarqand', to: 'Kattaqorgon' },
  'андижонга 35 та кой': { to: 'Andijon' },
  'Denovga 2 tonna yuk': { to: 'Denov' },
  'Oltariqdan yuk bor.*Chakman': { to: null }, // to yoq
  'куконга тент фура': { to: "Qo'qon" },
  'Toshkentga yuk bo\'lsa olamiz': { to: 'Toshkent', type: 'DRIVER' },
  'Джизак  Догруз': { swap: true, from: 'Samarqand', to: 'Jizzax' },
  'навои́и 10 тон': { to: 'Navoiy' },
  'Samarqand chakman faw': { to: 'Samarqand' },
  'бойсун линтяга': { to: 'Boysun' },
  'Киргизга 3 та тент': { to: null, scope: 'EXPORT' },
  'Qoraqalpoqqa 25tonna': { to: "Qoraqalpog'iston" },
  'бегабодга юк бор.*пиез': { to: 'Begavot' },
  'тошкенди чирчига': { to: 'Chirchiq' },
  'хоразима пустое прицеп': { to: 'Xorazm' },
  'бухорого юк бор': { to: 'Buxoro' },
  'Олмалик.*Walanda kerak': { to: 'Olmaliq' },
  'chinozga baliq bor': { swap: true, from: 'Toshkent', to: 'Chinoz' },
  'BEGOVOTGA METOLOM BOR': { to: 'Begavot' },
  'jondorga 2 mostlik': { to: 'Jondor' },
  'Jizzaxga 1 komplekt': { to: 'Jizzax' },
  'gazabulo\'k.*paddom': { to: 'Jizzax' },
  'китобга Чакман керак': { swap: true, from: 'Vodil', to: 'Kitob' },
  'bigobodga mital bor': { to: 'Begavot' },
  'Саросиега дагруз': { to: 'Surxondaryo' },
  'Yakkabog.*tent fura': { to: null },
  'Navoiy buylab': { type: 'DRIVER' },
  'nukusga 600 kelo': { to: 'Nukus' },
  'xatirchiga g\'isht bor': { to: 'Xatirchi' },
  'шрошнига юк бор наманган дан шахрихонга': { swap: true, from: 'Namangan', to: 'Shahrixon' },
  'к,ок,онга йук бор': { to: "Qo'qon" },
  'Жондорга 2 мостлик': { to: 'Jondor' },
  'Samarqandga pochta bor isuzu': { to: 'Samarqand' },
  'Тожикистон.*сементзавод': { to: 'Tojikiston', scope: 'EXPORT' },
  'Namangan  Yuk bor.*Fura kerak': { swap: true, from: 'Sirdaryo', to: 'Namangan' },
  'Qoraqalpoq Plawadka': { to: "Qoraqalpog'iston" },
  'Xorazim yuk bor 25tn': { swap: true, from: "Qo'qon", to: 'Xorazm' },
  'Иштхондан Тошкега': { to: 'Toshkent' },
  'чирчигдан жиззахга': { swap: true, from: 'Chirchiq', to: 'Jizzax' },
  'Chodak sitafor.*toshkentga': { swap: true, from: 'Jizzax', to: 'Toshkent' },
  'норинга туда кишлока': { swap: true, from: 'Toshkent', to: 'Norin' },
  'Sherabotga tuz 20': { swap: true, from: 'Surxondaryo', to: 'Sherobod' },
  'жаркургонга кошимча юк': { to: "Jarqo'rg'on" },
  'NABOHORDAN XATIRCHIGA': { swap: true, from: 'Navbahor', to: 'Xatirchi' },
  'камаз фурага шафёр кере': 'REJECT', // shofer izlash
  'toshkanga maeda.*katta izuze': { to: 'Toshkent' },
  'наманганга чорсуга': { swap: true, from: 'Toshkent', to: 'Namangan' },
  'yettomga yuk bor': { to: 'Jizzax' }, // Yettisom = Jizzax tumani
  'Marĝilonga qowimcha': { to: "Marg'ilon" },
  'navoiyga tel': { to: 'Navoiy' },
  'xarazimga birdman yuk': { to: 'Xorazm' },
  'Moskva yuk bor': { to: 'Moskva', scope: 'EXPORT' },
  'Тошкентдан Харазимга': { to: 'Xorazm' },
  'Yettomga 100 ta': { to: 'Jizzax' },
  'Бахмалга юк бор': { to: 'Baxmal' },
  'samarqanda yengil yuk': { to: 'Samarqand' },
  'bekabotga yul bor': { swap: true, from: 'Jizzax', to: 'Bekobod' },
  'qashqadareo yakaboģga': { to: "Yakkabog'" },
  'nukisдан фура керак': { to: null },
  'xatirchiga 45 tonnali': { swap: true, from: 'Navoiy', to: 'Xatirchi' },
  'Buxoroga 11tonna': { swap: true, from: 'Nurota', to: 'Buxoro' },
  'тошкента.*мака бор': { to: 'Toshkent' },
  'buxoroga fura kerak.*yuk bor': { to: 'Buxoro' },
  'давлат раками.*Тушиб колган': 'REJECT',
  'jomboyda va sochakdagi': 'REJECT',
};

async function main() {
  const t = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  // Get all incomplete orders
  const noRoute = await prisma.order.findMany({
    where: { createdAt: { gte: t }, status: 'NEW', cargoFrom: null, cargoTo: null },
    select: { id: true, messageText: true, type: true },
  });
  const fromOnly = await prisma.order.findMany({
    where: { createdAt: { gte: t }, status: 'NEW', cargoFrom: { not: null }, cargoTo: null },
    select: { id: true, messageText: true, cargoFrom: true, type: true },
  });

  console.log(`No route: ${noRoute.length}, From only: ${fromOnly.length}\n`);

  let fixed = 0, rejected = 0;
  const updates = [];

  // 1. Fix NO ROUTE orders
  for (const o of noRoute) {
    const text = o.messageText;
    for (const [pattern, fix] of Object.entries(MANUAL_NO_ROUTE)) {
      const re = new RegExp(pattern, 'i');
      if (re.test(text)) {
        if (fix === 'REJECT') {
          updates.push({ id: o.id, data: { status: 'REJECTED' }, info: `REJ: ${text.substring(0, 60)}` });
          rejected++;
        } else {
          const upd = {};
          if (fix.from) upd.cargoFrom = fix.from;
          if (fix.to) upd.cargoTo = fix.to;
          if (fix.type) upd.type = fix.type;
          if (Object.keys(upd).length) {
            updates.push({ id: o.id, data: upd, info: `FIX: ${fix.from||'?'}→${fix.to||'?'} | ${text.substring(0, 60)}` });
            fixed++;
          }
        }
        break;
      }
    }
  }

  // 2. Fix FROM ONLY orders
  for (const o of fromOnly) {
    const text = o.messageText;
    for (const [pattern, fix] of Object.entries(FROM_ONLY_FIXES)) {
      const re = new RegExp(pattern, 'i');
      if (re.test(text)) {
        if (fix === 'REJECT') {
          updates.push({ id: o.id, data: { status: 'REJECTED' }, info: `REJ: ${text.substring(0, 60)}` });
          rejected++;
        } else if (typeof fix === 'string') {
          // Simple string = cargoTo
          if (fix !== o.cargoFrom) {
            updates.push({ id: o.id, data: { cargoTo: fix }, info: `TO: ${o.cargoFrom}→${fix} | ${text.substring(0, 60)}` });
            fixed++;
          }
        } else {
          const upd = {};
          if (fix.swap && fix.from) upd.cargoFrom = fix.from;
          if (fix.to && fix.to !== (upd.cargoFrom || o.cargoFrom)) upd.cargoTo = fix.to;
          if (fix.type) upd.type = fix.type;
          if (fix.scope) upd.scope = fix.scope;
          if (Object.keys(upd).length) {
            updates.push({ id: o.id, data: upd, info: `FIX: ${upd.cargoFrom||o.cargoFrom}→${upd.cargoTo||'?'} | ${text.substring(0, 60)}` });
            fixed++;
          }
        }
        break;
      }
    }
  }

  console.log(`Fixed: ${fixed}, Rejected: ${rejected}, Total: ${updates.length}`);
  console.log('\n--- All updates ---');
  updates.forEach((u, i) => console.log(`${i + 1}. ${u.info}`));

  if (!process.argv.includes('--apply')) {
    console.log('\n⚠️  DRY RUN! node scripts/fix-routes-mega.js --apply');
    await prisma.$disconnect(); return;
  }
  console.log('\n🔄 Qo\'llanmoqda...');
  for (const { id, data } of updates) await prisma.order.update({ where: { id }, data });
  console.log(`✅ ${updates.length} ta order yangilandi`);
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
