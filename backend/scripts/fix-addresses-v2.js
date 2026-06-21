const { findCitiesInText, findCity } = require("../dist/src/monitor/data/city-distances");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Extended fuzzy aliases
const extraAliases = {
  // G'uzor
  "гизор": "G'uzor", "гузор": "G'uzor", "guzor": "G'uzor", "ғузор": "G'uzor", "muzrabot": "G'uzor",
  // Navoiy
  "навои": "Navoiy", "наваи": "Navoiy", "навой": "Navoiy", "навий": "Navoiy", "naviy": "Navoiy",
  // Beshariq
  "бешарка": "Beshariq", "бешариқ": "Beshariq", "бешарик": "Beshariq",
  // Yazyavan
  "йозавон": "Yazyavan", "yozavon": "Yazyavan", "язяван": "Yazyavan",
  // Zarafshon
  "zarafwon": "Zarafshon", "зарафшан": "Zarafshon", "зарафшон": "Zarafshon",
  // Qashqadaryo
  "қашақдарё": "Qashqadaryo", "кашкадарья": "Qashqadaryo", "qashaqdary": "Qashqadaryo",
  "кашкадар": "Qashqadaryo", "қашқадар": "Qashqadaryo", "кашкадарё": "Qashqadaryo",
  // Kasbi
  "касби": "Kasbi",
  // Oltinsoy
  "олтинсай": "Oltinsoy", "олтинсой": "Oltinsoy",
  // Angren
  "ангирен": "Angren", "ангрен": "Angren",
  // Sardoba
  "сардоба": "Sardoba",
  // Xorazm
  "хоразим": "Xorazm", "xorazim": "Xorazm",
  // Toshkent
  "тошкенд": "Toshkent", "тошкин": "Toshkent", "тошкен": "Toshkent", "таошкен": "Toshkent",
  "towkent": "Toshkent", "tashkon": "Toshkent", "ташкен": "Toshkent", "ташкет": "Toshkent",
  // Sergeli
  "сергили": "Sergeli",
  // Gijduvon
  "гижду": "Gijduvon", "гиждув": "Gijduvon",
  // Payshanba
  "пайшанба": "Payshanba",
  // Beruniy
  "беруний": "Beruniy",
  // Qoraqalpogiston
  "қорақолпоқ": "Qoraqalpogiston", "каракалпак": "Qoraqalpogiston", "каракалпог": "Qoraqalpogiston",
  "қорақалпоқ": "Qoraqalpogiston", "qaroqolpoq": "Qoraqalpogiston", "qoraqolpoq": "Qoraqalpogiston",
  "карақалпоқ": "Qoraqalpogiston", "qaraqalpaq": "Qoraqalpogiston",
  // Urganch
  "уроанч": "Urganch", "ургенч": "Urganch",
  // Yakkabog
  "яккабоқ": "Yakkabog", "яккабог": "Yakkabog", "yakkaboq": "Yakkabog",
  // Bekobod
  "бекобод": "Bekobod", "бекабад": "Bekobod", "bekaobod": "Bekobod",
  // Denov
  "денов": "Denov", "денау": "Denov",
  // Kattaqorgon
  "каттакурган": "Kattaqo'rg'on", "каттакургон": "Kattaqo'rg'on",
  // Surxondaryo
  "сурхандарё": "Surxondaryo", "сурхондарё": "Surxondaryo", "сухандарё": "Surxondaryo",
  "surxandary": "Surxondaryo", "surxondary": "Surxondaryo",
  // Chirchiq
  "чирчик": "Chirchiq",
  // Olmaliq
  "олмалик": "Olmaliq",
  // Qo'qon
  "коканд": "Qo'qon", "қоқон": "Qo'qon", "кокон": "Qo'qon",
  // Sirdaryo
  "сирдарё": "Sirdaryo", "сирдарья": "Sirdaryo", "sirdaro": "Sirdaryo",
  // Nukus
  "нукус": "Nukus",
  // Xiva
  "хива": "Xiva",
  // Marg'ilon
  "маргилон": "Marg'ilon", "маргелан": "Marg'ilon",
  // Rishton
  "риштон": "Rishton",
  // Kogon
  "когон": "Kogon", "каган": "Kogon",
  // Romitan
  "ромитан": "Romitan",
  // Vobkent
  "вобкент": "Vobkent",
  // Turtkul
  "турткул": "Turtkul",
  // Qo'ng'irot
  "кунгирот": "Qo'ng'irot", "кунград": "Qo'ng'irot", "кунгрот": "Qo'ng'irot", "kungrot": "Qo'ng'irot",
  // Ohangaron
  "огонгарон": "Ohangaron", "агрен": "Ohangaron",
  // Muborak
  "муборак": "Muborak",
  // Ishtixon
  "иштихон": "Ishtixon",
  // Urgut
  "ургут": "Urgut",
  // Dehhonobod
  "деконобод": "Dehhonobod", "деҳонобод": "Dehhonobod", "дехонобод": "Dehhonobod", "дехканабад": "Dehhonobod",
  "dehqonobod": "Dehhonobod",
  // Kitob
  "китоб": "Kitob", "китов": "Kitob",
  // Yangiyo'l
  "янги йол": "Yangiyo'l", "янгийул": "Yangiyo'l", "янгиюл": "Yangiyo'l", "yangi yol": "Yangiyo'l",
  // Uchqo'rgon
  "учкоргон": "Uchqo'rg'on", "учқоргон": "Uchqo'rg'on", "учкурган": "Uchqo'rg'on",
  // Begovot
  "беговот": "Begovot", "begovot": "Begovot", "беговат": "Begovot",
  // Gazalkent
  "газалкент": "Gazalkent",
  // Xo'jaobod
  "хўжаобод": "Xo'jaobod", "хожаобод": "Xo'jaobod", "xojabod": "Xo'jaobod", "xöjabod": "Xo'jaobod",
  // Bo'ka
  "бука": "Bo'ka",
  // Asaka
  "асака": "Asaka",
  // Qamashi
  "камаши": "Qamashi", "камши": "Qamashi",
  // Nishon
  "нишон": "Nishon",
  // Samarqand (misspelling)
  "samarqant": "Samarqand", "самаркан": "Samarqand",
  // Jizzax
  "жиззак": "Jizzax", "джизак": "Jizzax",
  // Farg'ona
  "фаргона": "Farg'ona", "фергана": "Farg'ona", "forgon": "Farg'ona",
  // Buxoro
  "бухоро": "Buxoro", "бухара": "Buxoro",
  // Andijon
  "андижон": "Andijon", "андижан": "Andijon",
  // Namangan
  "наманган": "Namangan",
  // Qarshi
  "қарши": "Qarshi", "карши": "Qarshi",
  // Termiz
  "термиз": "Termiz", "термез": "Termiz",
  // Koson
  "косон": "Koson",
  // Chelak
  "челак": "Chelak",
  // Narpay
  "нарпай": "Narpay",
  // Payariq
  "пайариқ": "Payariq",
  // Jomboy
  "жомбой": "Jomboy",
  // Chimboy
  "чимбой": "Chimboy",
  // Sho'rchi
  "шурчи": "Sho'rchi",
  // Qumqo'rg'on
  "кумкурган": "Qumqo'rg'on",
  // Guliston
  "гулстон": "Guliston", "гулистон": "Guliston",
  // Qarovulbozor
  "қоровулбоз": "Qarovulbozor", "qaravulbozor": "Qarovulbozor", "qarovul bozor": "Qarovulbozor",
  "qaravul bozor": "Qarovulbozor", "karavul bozor": "Qarovulbozor",
  // Ulyanovsky = foreign
  "ульяанск": "FOREIGN", "ульяновск": "FOREIGN",
  // Iran
  "incheburun": "FOREIGN", "иран": "FOREIGN",
  // Russia related
  "россия": "FOREIGN", "москва": "FOREIGN", "казахстан": "FOREIGN",
  "кемеров": "FOREIGN", "красноярск": "FOREIGN", "кираснояр": "FOREIGN",
  "санкт": "FOREIGN",
  // Bo'stonliq
  "бустонлик": "Bo'stonliq", "bostanliq": "Bo'stonliq",
};

function findAllFuzzy(text) {
  const lower = text.toLowerCase();
  const found = [];
  const usedCities = new Set();

  for (const [key, city] of Object.entries(extraAliases)) {
    if (usedCities.has(city)) continue;
    if (lower.includes(key)) {
      found.push(city);
      usedCities.add(city);
    }
  }
  return found.filter(c => c !== "FOREIGN");
}

function findCityInWord(word) {
  if (!word || word.length < 2) return null;

  const found = findCity(word);
  if (found) return found.name;

  const lower = word.toLowerCase();
  for (const [key, city] of Object.entries(extraAliases)) {
    if (lower.includes(key) || (key.length > 3 && key.includes(lower))) {
      return city === "FOREIGN" ? null : city;
    }
  }

  // Strip suffixes
  const stripped = lower
    .replace(/(дан|дин|ден|dan|din|den|га|ге|го|гача|ga|ge|go|ka|нинг|ning|даги|dagi)$/i, "")
    .trim();
  if (stripped !== lower && stripped.length > 2) {
    const found2 = findCity(stripped);
    if (found2) return found2.name;
    for (const [key, city] of Object.entries(extraAliases)) {
      if (stripped.includes(key) || (key.length > 3 && key.includes(stripped))) {
        return city === "FOREIGN" ? null : city;
      }
    }
  }

  return null;
}

function extractRoute(text) {
  const result = { from: null, to: null };
  const norm = text.replace(/\n/g, " ");

  // Pattern: (word)dan/дан
  const danPatterns = [
    /(\S+)\s*(?:дан|дин|ден)\b/i,
    /(\S+)\s*(?:dan|din|den)\b/i,
  ];
  // Pattern: (word)ga/га
  const gaPatterns = [
    /(\S+)\s*(?:га|ге|го|гача)\b/i,
    /(\S+)\s*(?:ga|ge|go|gача)\b/i,
  ];
  // Arrow/dash pattern: City - City, City → City
  const arrowMatch = norm.match(/(\S+)\s*[-–—→>]\s*(\S+)/i);

  for (const pat of danPatterns) {
    const m = norm.match(pat);
    if (m) {
      const word = m[1].replace(/[.,!?;:]+$/, "");
      const city = findCityInWord(word);
      if (city) { result.from = city; break; }
    }
  }

  for (const pat of gaPatterns) {
    const m = norm.match(pat);
    if (m) {
      const word = m[1].replace(/[.,!?;:]+$/, "");
      const city = findCityInWord(word);
      if (city && city !== result.from) { result.to = city; break; }
    }
  }

  // Try arrow pattern for missing
  if (arrowMatch && (!result.from || !result.to)) {
    const city1 = findCityInWord(arrowMatch[1].replace(/[.,!?;:]+$/, ""));
    const city2 = findCityInWord(arrowMatch[2].replace(/[.,!?;:]+$/, ""));
    if (!result.from && city1) result.from = city1;
    if (!result.to && city2 && city2 !== result.from) result.to = city2;
  }

  return result;
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

  for (const order of orders) {
    const route = extractRoute(order.messageText);
    const cities = findCitiesInText(order.messageText);
    const cityNames = cities.map(c => c.name);
    const fuzzyAll = findAllFuzzy(order.messageText);
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
      if (fixedExamples.length < 25) {
        fixedExamples.push({
          oldFrom: order.cargoFrom, oldTo: order.cargoTo,
          update,
          msg: order.messageText.substring(0, 120).replace(/\n/g, " ")
        });
      }
    }
  }

  console.log("\nFixed:", fixed);
  console.log("\nFixed examples:");
  fixedExamples.forEach(e => console.log(JSON.stringify(e)));

  const remaining = await prisma.order.count({
    where: {
      createdAt: { gte: twoDaysAgo },
      OR: [{ cargoFrom: null }, { cargoTo: null }]
    }
  });
  console.log("\nRemaining unfixed:", remaining);
  console.log("Originally had ~589, now fixed total:", 589 - remaining);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
