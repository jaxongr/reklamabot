const { findCitiesInText, findCity } = require("../dist/src/monitor/data/city-distances");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Massive fuzzy aliases for common misspellings in Uzbek cargo messages
const extraAliases = {
  // G'uzor variants
  "гизор": "G'uzor", "гузор": "G'uzor", "guzor": "G'uzor", "gizor": "G'uzor", "ғузор": "G'uzor",
  // Navoiy
  "навои": "Navoiy", "наваи": "Navoiy", "навой": "Navoiy", "navoiy": "Navoiy",
  // Guliston
  "гулстон": "Guliston", "gulston": "Guliston", "гулистон": "Guliston",
  // Beshariq
  "бешарка": "Beshariq", "бешариқ": "Beshariq", "бешарик": "Beshariq", "beshariq": "Beshariq",
  // Yazyavan
  "йозавон": "Yazyavan", "yozavon": "Yazyavan", "язяван": "Yazyavan", "yazovon": "Yazyavan",
  // Zarafshon
  "zarafwon": "Zarafshon", "зарафшан": "Zarafshon", "зарафшон": "Zarafshon", "zarafshon": "Zarafshon",
  // Qashqadaryo
  "қашақдарё": "Qashqadaryo", "kashkadarya": "Qashqadaryo", "кашкадарья": "Qashqadaryo",
  "қашқадарёо": "Qashqadaryo", "қашақдарёо": "Qashqadaryo", "qashaqdary": "Qashqadaryo",
  "кашкадар": "Qashqadaryo", "қашқадар": "Qashqadaryo", "qashqadary": "Qashqadaryo",
  // Kasbi
  "касби": "Kasbi", "kasbi": "Kasbi",
  // Oltinsoy
  "олтинсай": "Oltinsoy", "олтинсой": "Oltinsoy",
  // Toyloq
  "тойлок": "Toyloq", "тойлоқ": "Toyloq", "toyloq": "Toyloq",
  // Angren
  "ангирен": "Angren", "ангрен": "Angren",
  // Sardoba
  "сардоба": "Sardoba", "sardoba": "Sardoba",
  // Xorazm
  "хоразим": "Xorazm", "xorazim": "Xorazm", "хоразм": "Xorazm",
  // Toshkent
  "тошкенд": "Toshkent", "тошкин": "Toshkent", "тошкен": "Toshkent",
  // Sergeli
  "сергили": "Sergeli", "серглди": "Sergeli", "серлеги": "Sergeli",
  // Gijduvon
  "гижду": "Gijduvon", "гиждув": "Gijduvon", "gijduv": "Gijduvon",
  // Payshanba
  "пайш": "Payshanba", "пайшанба": "Payshanba",
  // Beruniy
  "берун": "Beruniy", "беруний": "Beruniy",
  // Qoraqalpog'iston
  "қорақолпоқ": "Qoraqalpogiston", "qoraqolpoq": "Qoraqalpogiston", "каракалпак": "Qoraqalpogiston",
  "қорақалпоқ": "Qoraqalpogiston", "каракалпог": "Qoraqalpogiston",
  // Urganch
  "уроанч": "Urganch", "ургенч": "Urganch", "urgach": "Urganch",
  // Yakkaboq
  "яккабоқ": "Yakkabog", "яккабог": "Yakkabog", "yakkaboq": "Yakkabog",
  // Mirishkor
  "миришкор": "Mirishkor", "mirishkor": "Mirishkor",
  // Bulung'ur
  "булунгур": "Bulung'ur", "булунғур": "Bulung'ur",
  // Qorovulbozor
  "қоровулбоз": "Qorovulbozor",
  // Dehhonobod
  "деҳонобод": "Dehhonobod", "дехонобод": "Dehhonobod", "дехканабад": "Dehhonobod",
  // Shahrisabz
  "шахрисабз": "Shahrisabz", "шахрисаб": "Shahrisabz",
  // Samarqand
  "самарканд": "Samarqand", "самаркан": "Samarqand",
  // Buxoro
  "бухоро": "Buxoro", "бухара": "Buxoro",
  // Fargona
  "фаргона": "Farg'ona", "фергана": "Farg'ona",
  // Andijon
  "андижон": "Andijon", "андижан": "Andijon",
  // Namangan
  "наманган": "Namangan",
  // Jizzax
  "жиззах": "Jizzax", "джизак": "Jizzax", "жиззак": "Jizzax",
  // Qarshi
  "қарши": "Qarshi", "карши": "Qarshi", "қарш": "Qarshi",
  // Termiz
  "термиз": "Termiz", "термез": "Termiz",
  // Nukus
  "нукус": "Nukus",
  // Qo'qon
  "коканд": "Qo'qon", "қоқон": "Qo'qon", "кокон": "Qo'qon", "коқон": "Qo'qon", "qoqon": "Qo'qon",
  // Sirdaryo
  "сирдарё": "Sirdaryo", "сирдарья": "Sirdaryo",
  // Surxondaryo
  "сурхандарё": "Surxondaryo", "сурхондарё": "Surxondaryo",
  // Chirchiq
  "чирчик": "Chirchiq",
  // Olmaliq
  "олмалик": "Olmaliq",
  // Chust
  "чуст": "Chust",
  // Pop
  "поп": "Pop",
  // Xiva
  "хива": "Xiva",
  // Kattaqorgon
  "каттакурган": "Kattaqo'rg'on", "каттакургон": "Kattaqo'rg'on",
  // Bekobod
  "бекобод": "Bekobod", "бекабад": "Bekobod",
  // Denov
  "денов": "Denov", "денау": "Denov",
  // Kitob
  "китоб": "Kitob",
  // Oqoltin
  "оқолтин": "Oqoltin", "ок олтин": "Oqoltin",
  // Qorasuv
  "қорасув": "Qorasuv", "коросув": "Qorasuv",
  // Xonobod
  "хонобод": "Xonobod", "ханабад": "Xonobod",
  // Karmana
  "кармана": "Karmana",
  // Bektemir
  "бекатемир": "Bektemir", "бектемир": "Bektemir",
  // Chortoq
  "чортоқ": "Chortoq", "чарток": "Chortoq",
  // Kosonsoy
  "косонсой": "Kosonsoy",
  // Yangiyo'l
  "янгийул": "Yangiyo'l", "янгиюл": "Yangiyo'l",
  // Bo'ka
  "бука": "Bo'ka", "бўка": "Bo'ka",
  // Asaka
  "асака": "Asaka",
  // Sho'rchi
  "шурчи": "Sho'rchi", "шўрчи": "Sho'rchi",
  // Qumqo'rg'on
  "кумкурган": "Qumqo'rg'on", "кумкургон": "Qumqo'rg'on",
  // Marg'ilon
  "маргилон": "Marg'ilon", "маргелан": "Marg'ilon",
  // Rishton
  "риштон": "Rishton", "ришдон": "Rishton",
  // Kogon
  "когон": "Kogon", "каган": "Kogon",
  // Olot
  "олот": "Olot",
  // Romitan
  "ромитан": "Romitan",
  // Vobkent
  "вобкент": "Vobkent", "вабкент": "Vobkent",
  // Gazli
  "газли": "Gazli",
  // Uchquduq
  "учкудук": "Uchquduq", "учқудуқ": "Uchquduq",
  // Chimboy
  "чимбой": "Chimboy",
  // Mo'ynoq
  "муйнок": "Mo'ynoq", "мўйноқ": "Mo'ynoq",
  // Turtkul
  "турткул": "Turtkul", "тўрткўл": "Turtkul",
  // Xo'jayli
  "хужайли": "Xo'jayli", "хўжайли": "Xo'jayli",
  // Qo'ng'irot
  "кунгирот": "Qo'ng'irot", "кунград": "Qo'ng'irot", "қўнғирот": "Qo'ng'irot",
  // Ayroportka = airport area (Qashqadaryo)
  "аирапорт": "Qashqadaryo",
  // Aggron / Ohangaron
  "агрен": "Ohangaron", "огонгарон": "Ohangaron", "ohangar": "Ohangaron",
  // Beshkent
  "бешкент": "Beshkent", "beshkent": "Beshkent",
  // Koson
  "косон": "Koson", "koson": "Koson",
  // Muborak
  "муборак": "Muborak", "muborak": "Muborak",
  // Ishtixon
  "иштихон": "Ishtixon", "ishtixon": "Ishtixon",
  // Jomboy
  "жомбой": "Jomboy", "jomboy": "Jomboy",
  // Chelak
  "челак": "Chelak",
  // Urgut
  "ургут": "Urgut", "urgut": "Urgut",
  // Payariq
  "пайариқ": "Payariq", "пайарик": "Payariq",
  // Narpay
  "нарпай": "Narpay",
};

function findAllFuzzy(text) {
  const lower = text.toLowerCase();
  const found = [];
  const usedKeys = new Set();

  for (const [key, city] of Object.entries(extraAliases)) {
    if (usedKeys.has(city)) continue;
    if (lower.includes(key)) {
      found.push(city);
      usedKeys.add(city);
    }
  }
  return found;
}

function extractRoute(text) {
  const result = { from: null, to: null };

  // Pattern: (word)dan/дан
  const danMatch = text.match(/(\S+)\s*(?:дан|дин|ден|dan|din|den)\b/i);
  // Pattern: (word)ga/га
  const gaMatch = text.match(/(\S+)\s*(?:га|ге|го|гача)\b/i);
  const gaMatch2 = text.match(/(\S+)\s*(?:ga|ge|go|ka)\b/i);

  if (danMatch) {
    const word = danMatch[1].replace(/[.,!?;:]+$/, "");
    const city = findCityInWord(word);
    if (city) result.from = city;
  }

  const gm = gaMatch || gaMatch2;
  if (gm) {
    const word = gm[1].replace(/[.,!?;:]+$/, "");
    const city = findCityInWord(word);
    if (city) result.to = city;
  }

  return result;
}

function findCityInWord(word) {
  // First try exact findCity
  const found = findCity(word);
  if (found) return found.name;

  // Then try fuzzy
  const lower = word.toLowerCase();
  for (const [key, city] of Object.entries(extraAliases)) {
    if (lower.includes(key) || key.includes(lower)) return city;
  }

  // Strip common suffixes and try again
  const stripped = lower
    .replace(/(дан|дин|ден|dan|din|den|га|ге|го|гача|ga|ge|go|ka|нинг|ning)$/i, "")
    .trim();
  if (stripped !== lower) {
    const found2 = findCity(stripped);
    if (found2) return found2.name;
    for (const [key, city] of Object.entries(extraAliases)) {
      if (stripped.includes(key) || key.includes(stripped)) return city;
    }
  }

  return null;
}

async function main() {
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: twoDaysAgo },
      OR: [{ cargoFrom: null }, { cargoTo: null }]
    },
    select: { id: true, cargoFrom: true, cargoTo: true, messageText: true }
  });

  console.log("Orders to fix:", orders.length);
  let fixed = 0;
  const fixedExamples = [];
  const cantFixExamples = [];

  for (const order of orders) {
    const route = extractRoute(order.messageText);
    const cities = findCitiesInText(order.messageText);
    const cityNames = cities.map(c => c.name);
    const fuzzyAll = findAllFuzzy(order.messageText);

    // Merge all found cities (deduplicated)
    const allCities = [...new Set([...cityNames, ...fuzzyAll])];

    let update = {};

    // Fix cargoFrom
    if (!order.cargoFrom) {
      if (route.from) update.cargoFrom = route.from;
      else if (allCities.length >= 1) update.cargoFrom = allCities[0];
    }

    // Fix cargoTo
    if (!order.cargoTo) {
      const fromCity = order.cargoFrom || update.cargoFrom;

      if (route.to && route.to !== fromCity) {
        update.cargoTo = route.to;
      } else {
        const toCity = allCities.find(c => c !== fromCity);
        if (toCity) update.cargoTo = toCity;
      }
    }

    if (Object.keys(update).length > 0) {
      await prisma.order.update({ where: { id: order.id }, data: update });
      fixed++;
      if (fixedExamples.length < 20) {
        fixedExamples.push({
          oldFrom: order.cargoFrom, oldTo: order.cargoTo,
          update,
          msg: order.messageText.substring(0, 120)
        });
      }
    } else {
      if (cantFixExamples.length < 25) {
        cantFixExamples.push({
          id: order.id,
          from: order.cargoFrom, to: order.cargoTo,
          msg: order.messageText.substring(0, 150),
          foundCities: allCities,
          route
        });
      }
    }
  }

  console.log("\nFixed:", fixed);
  console.log("\nFixed examples:");
  fixedExamples.forEach(e => console.log(JSON.stringify(e)));

  console.log("\nCant fix examples (" + cantFixExamples.length + "):");
  cantFixExamples.forEach(e => console.log(JSON.stringify(e)));

  const remaining = await prisma.order.count({
    where: {
      createdAt: { gte: twoDaysAgo },
      OR: [{ cargoFrom: null }, { cargoTo: null }]
    }
  });
  console.log("\nRemaining unfixed:", remaining);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
