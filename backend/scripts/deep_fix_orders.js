const { PrismaClient } = require('@prisma/client');
const { findCitiesInText, findCity } = require('../dist/src/monitor/data/city-distances');
const { VEHICLE_TYPES } = require('../dist/src/monitor/data/dispatcher-keywords');
const p = new PrismaClient();

// Qo'shimcha shahar alias nomlari — xato yozilganlar uchun
const CITY_ALIASES = {
  'maskava': 'Moskva', 'maskiva': 'Moskva', 'maskuva': 'Moskva', 'moskuva': 'Moskva',
  'maskov': 'Moskva', 'maskva': 'Moskva', 'moskov': 'Moskva', 'mascova': 'Moskva',
  'toshken': 'Toshkent', 'toshkeng': 'Toshkent', 'toshkint': 'Toshkent', 'toshking': 'Toshkent',
  'tashkent': 'Toshkent', 'ташкент': 'Toshkent', 'тошкент': 'Toshkent', 'тошкенд': 'Toshkent',
  'тошкед': 'Toshkent', 'тошкэнт': 'Toshkent', 'тошкэн': 'Toshkent', 'тошкин': 'Toshkent',
  'самарканд': 'Samarqand', 'самаркан': 'Samarqand', 'samarqan': 'Samarqand',
  'samarqat': 'Samarqand', 'samarkant': 'Samarqand', 'самаркат': 'Samarqand',
  'андижон': 'Andijon', 'андижан': 'Andijon', 'andijan': 'Andijon',
  'фаргона': "Farg'ona", 'фергана': "Farg'ona", 'фаргана': "Farg'ona",
  'бухара': 'Buxoro', 'бухоро': 'Buxoro',
  'наманган': 'Namangan', 'намангон': 'Namangan',
  'кукон': "Qo'qon", 'куқон': "Qo'qon", 'қуқон': "Qo'qon", 'qoqon': "Qo'qon", 'kukon': "Qo'qon",
  'карши': 'Qarshi', 'қарши': 'Qarshi',
  'навоий': 'Navoiy', 'новоий': 'Navoiy', 'novoiy': 'Navoiy',
  'термиз': 'Termiz', 'термез': 'Termiz',
  'урганч': 'Urganch', 'ургенч': 'Urganch',
  'хоразм': 'Xorazm', 'хорезм': 'Xorazm',
  'нукус': 'Nukus',
  'жиззах': 'Jizzax', 'джизак': 'Jizzax',
  'гулистон': 'Guliston', 'гулистан': 'Guliston',
  'сурхон': 'Surxondaryo', 'сурхондарё': 'Surxondaryo',
  'денов': 'Denov', 'денау': 'Denov', 'дейнов': 'Denov',
  'каттакурган': "Kattaqo'rg'on", 'катакурган': "Kattaqo'rg'on", 'катақургон': "Kattaqo'rg'on",
  'катақурғон': "Kattaqo'rg'on", 'kataqurgon': "Kattaqo'rg'on",
  'олтиарик': 'Oltiariq', 'oltariq': 'Oltiariq', 'олтиариқ': 'Oltiariq',
  'bekabod': 'Bekobod', 'bekabat': 'Bekobod', 'бекабод': 'Bekobod', 'бекабат': 'Bekobod',
  'olmaliq': 'Olmaliq', 'олмалик': 'Olmaliq', 'олмалиқ': 'Olmaliq',
  'saratov': 'Saratov', 'саратов': 'Saratov', 'саратиф': 'Saratov', 'саратиб': 'Saratov', 'saratif': 'Saratov',
  'almati': 'Almaty', 'алматы': 'Almaty', 'алмата': 'Almaty',
  'казан': 'Kazan', 'kazan': 'Kazan',
  'чимкент': 'Shymkent', 'шымкент': 'Shymkent', 'chimkent': 'Shymkent',
  'сариагач': 'Saryagash', 'сариагаш': 'Saryagash', 'сарыагаш': 'Saryagash',
  'чиял': 'Chiyal', 'чийал': 'Chiyal', 'chiyal': 'Chiyal', 'chiyol': 'Chiyal',
  'ангрен': 'Angren', 'angen': 'Angren', 'анген': 'Angren',
  'рохат': 'Rohat', 'roxat': 'Rohat',
  'коилик': "Qo'yliq", 'қўйлиқ': "Qo'yliq", 'qoyliq': "Qo'yliq", 'qoylik': "Qo'yliq", 'кайлик': "Qo'yliq",
  'худжайли': "Xo'jayli", 'хужайли': "Xo'jayli", 'хўджайли': "Xo'jayli", 'xujayli': "Xo'jayli",
  'шахрисабз': 'Shahrisabz', 'шахрисабиз': 'Shahrisabz',
  'красноярск': 'Krasnoyarsk', 'красноярс': 'Krasnoyarsk',
  'махачкала': 'Makhachkala', 'maxachkala': 'Makhachkala', 'махачкала': 'Makhachkala',
  'оренбург': 'Orenburg',
  'новосибирск': 'Novosibirsk', 'novosibirsk': 'Novosibirsk',
  'ростов': 'Rostov',
  'волгоград': 'Volgograd',
  'екатеринбург': 'Yekaterinburg', 'екб': 'Yekaterinburg',
  'самара': 'Samara',
  'челябинск': 'Chelyabinsk',
  'уфа': 'Ufa',
  'литва': 'Litva', 'латвия': 'Latviya',
  'варганза': 'Kitob',
  'фут сити': 'Toshkent',
  'футсити': 'Toshkent',
  'багдот': "Bag'dod", 'бағдод': "Bag'dod", 'багдад': "Bag'dod",
  'охангарон': 'Ohangaron', 'оханарон': 'Ohangaron', 'oxangaron': 'Ohangaron',
  'тайлак': 'Tayloq', 'тайлоқ': 'Tayloq', 'tayloq': 'Tayloq',
  'булунгур': "Bulung'ur", 'булунғур': "Bulung'ur", 'булонгур': "Bulung'ur",
  'нурота': 'Nurota',
  'хатирчи': 'Xatirchi', 'хатрчи': 'Xatirchi', 'xatrchi': 'Xatirchi',
  'вобкент': 'Vobkent',
  'мангит': 'Mangit',
  'турткул': 'Turtkul', 'турткуль': 'Turtkul',
  'газалкент': 'Gazalkent',
  'товоксой': 'Tavaksoy', 'тавоксой': 'Tavaksoy', 'tavaksoy': 'Tavaksoy',
  'тошлок': 'Toshloq', 'тошлоқ': 'Toshloq',
  'жарқўрғон': "Jarqo'rg'on", 'жаркоргон': "Jarqo'rg'on", 'jarqorgon': "Jarqo'rg'on",
  'чирчик': 'Chirchiq', 'чирчиқ': 'Chirchiq', 'chirchiq': 'Chirchiq',
  'гиждувон': "G'ijduvon", 'гижувон': "G'ijduvon", 'гижди': "G'ijduvon", 'гиждиван': "G'ijduvon",
  'тошкинд': 'Toshkent',
  'водий': "Farg'ona", 'vodiy': "Farg'ona",
  'нуробод': 'Nurobod', 'нуробот': 'Nurobod',
  'тошкенг': 'Toshkent', 'тошкед': 'Toshkent',
};

function resolveCity(word) {
  if (!word) return null;
  const w = word.toLowerCase().replace(/[^a-z\u0400-\u04ff\u2019\u02bb\s]/gi, '').trim();
  if (w.length < 2) return null;

  // Direct findCity lookup
  const direct = findCity(w);
  if (direct) return direct.name;

  // Alias lookup
  for (const [alias, name] of Object.entries(CITY_ALIASES)) {
    if (w === alias || w.startsWith(alias)) return name;
  }

  // Suffix stripping
  const suffixes = ['дан', 'тан', 'тен', 'ден', 'dan', 'tan', 'din', 'га', 'ка', 'ге', 'ge', 'ga', 'ka', 'гача', 'gacha', 'да', 'де', 'до'];
  for (const suf of suffixes) {
    if (w.endsWith(suf) && w.length > suf.length + 2) {
      const base = w.slice(0, -suf.length);
      const c = findCity(base);
      if (c) return c.name;
      if (CITY_ALIASES[base]) return CITY_ALIASES[base];
      // Undosh duplicate
      const c2 = findCity(base + suf[0]);
      if (c2) return c2.name;
      if (CITY_ALIASES[base + suf[0]]) return CITY_ALIASES[base + suf[0]];
    }
  }

  return null;
}

function parseFromToByWords(text) {
  const lower = text.toLowerCase()
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}]/gu, ' ')
    .replace(/[-\u2013\u2014.]+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim();

  const words = lower.split(/\s+/);
  let from = null, to = null;

  for (let i = 0; i < words.length; i++) {
    const w = words[i];

    // FROM: word ending with -дан/-dan
    if (!from && /(?:дан|тан|тен|ден|dan|tan)$/i.test(w)) {
      const city = resolveCity(w);
      if (city) { from = city; continue; }
    }

    // TO: word ending with -га/-ga/-ка
    if (from && !to && /(?:га|ка|ге|ge|ga|ka|гача|gacha)$/i.test(w)) {
      const city = resolveCity(w);
      if (city && city !== from) { to = city; break; }
    }

    // "dan" / "ga" as separate word
    if (i + 1 < words.length) {
      if (!from && (words[i + 1] === 'dan' || words[i + 1] === 'дан')) {
        const city = resolveCity(w);
        if (city) { from = city; i++; continue; }
      }
      if (from && !to && (words[i + 1] === 'ga' || words[i + 1] === 'га' || words[i + 1] === 'gача')) {
        const city = resolveCity(w);
        if (city && city !== from) { to = city; break; }
      }
    }
  }

  // Qayerdan/Qayerga pattern
  if (!from || !to) {
    const qm = /(?:qayerdan|qaerdan)[:\s]+(\S+)\s+(?:qayerga|qaerga)[:\s]+(\S+)/i.exec(lower);
    if (qm) {
      from = from || resolveCity(qm[1]);
      to = to || resolveCity(qm[2]);
    }
  }

  return { from, to };
}

function parseVehicleType(text) {
  const lower = text.toLowerCase();
  for (const vt of VEHICLE_TYPES) {
    if (vt.pattern && vt.pattern.test(text)) {
      return vt.type;
    }
  }
  // Qo'shimcha pattern'lar
  if (/исузу|isuzu|исузи|issuzu|esuz/i.test(lower)) return 'Isuzu';
  if (/фура|fura/i.test(lower)) return 'Fura';
  if (/тент|tent/i.test(lower)) return 'Tentli';
  if (/камаз|kamaz|komaz/i.test(lower)) return 'Kamaz';
  if (/газел|gazel/i.test(lower)) return 'Gazel';
  if (/лабо|labo/i.test(lower)) return 'Labo';
  if (/дамас|damas/i.test(lower)) return 'Damas';
  if (/портер|porter/i.test(lower)) return 'Porter';
  if (/спринтер|sprinter|спрентер|спрентор/i.test(lower)) return 'Sprinter';
  if (/самосвал|samosval|танар|tanar/i.test(lower)) return 'Samosval';
  if (/рефри|refri|рефержатор|холодильник/i.test(lower)) return 'Refrijerator';
  if (/автокран|avtokran/i.test(lower)) return 'Kran';
  if (/бонго|bongo/i.test(lower)) return 'Bongo';
  if (/волга|volga/i.test(lower)) return 'Volga';
  if (/ман\b|man\b/i.test(lower)) return 'MAN';
  if (/мега|mega/i.test(lower)) return 'Fura';
  if (/паравоз|paravoz/i.test(lower)) return 'Fura';
  if (/бортовой|bort/i.test(lower)) return 'Bortli';
  if (/контейнер|konteyner/i.test(lower)) return 'Konteyner';
  return null;
}

async function main() {
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const allOrders = await p.order.findMany({
    where: { createdAt: { gte: today } },
    select: {
      id: true, cargoFrom: true, cargoTo: true, messageText: true,
      senderName: true, type: true, vehicleType: true, scope: true
    }
  });
  console.log('Jami orderlar:', allOrders.length);

  let routeFixed = 0;
  let vehicleFixed = 0;
  const unfixable = [];

  for (const o of allOrders) {
    const text = o.messageText || '';
    const updates = {};

    // === YO'NALISH ===
    const needsRouteFix = !o.cargoFrom || !o.cargoTo || o.cargoFrom === o.cargoTo;

    if (needsRouteFix) {
      // Method 1: findCitiesInText (original parser)
      const cities = findCitiesInText(text);
      let from = null, to = null;

      if (cities.length >= 2) {
        // Birinchi ikki xil shaharni topish
        from = cities[0].name;
        for (let i = 1; i < cities.length; i++) {
          if (cities[i].name !== from) { to = cities[i].name; break; }
        }
      }

      // Method 2: Word-based from/to parsing
      if (!from || !to || from === to) {
        const parsed = parseFromToByWords(text);
        if (parsed.from && parsed.to && parsed.from !== parsed.to) {
          from = parsed.from;
          to = parsed.to;
        } else if (parsed.from && !from) {
          from = parsed.from;
        } else if (parsed.to && !to) {
          to = parsed.to;
        }
      }

      // Method 3: CITY_ALIASES bilan qo'shimcha qidirish
      if ((!from || !to) || from === to) {
        const lower = text.toLowerCase().replace(/[\u0300-\u036F]/g, '').replace(/\n/g, ' ');
        const foundAliases = [];
        for (const [alias, name] of Object.entries(CITY_ALIASES)) {
          if (lower.includes(alias)) {
            const idx = lower.indexOf(alias);
            if (!foundAliases.some(f => f.name === name)) {
              foundAliases.push({ name, idx });
            }
          }
        }
        foundAliases.sort((a, b) => a.idx - b.idx);

        if (foundAliases.length >= 2 && foundAliases[0].name !== foundAliases[1].name) {
          if (!from || !to || from === to) {
            from = foundAliases[0].name;
            to = foundAliases[1].name;
          }
        } else if (foundAliases.length === 1) {
          if (!from) from = foundAliases[0].name;
          else if (!to && foundAliases[0].name !== from) to = foundAliases[0].name;
        }
      }

      // Faqat 1 ta topilgan bo'lsa va FROM mavjud bo'lsa
      if (from && !to && cities.length === 1) {
        // cargoFrom bor lekin cargoTo yo'q — from ni saqlaymiz
        if (!o.cargoFrom) updates.cargoFrom = from;
      } else if (from && to && from !== to) {
        if (from !== o.cargoFrom || to !== o.cargoTo) {
          updates.cargoFrom = from;
          updates.cargoTo = to;
        }
      }
    }

    // === MASHINA TURI ===
    if (!o.vehicleType) {
      const vt = parseVehicleType(text);
      if (vt) {
        updates.vehicleType = vt;
        vehicleFixed++;
      }
    }

    // Update
    if (Object.keys(updates).length > 0) {
      await p.order.update({ where: { id: o.id }, data: updates });
      if (updates.cargoFrom || updates.cargoTo) {
        routeFixed++;
        console.log(`ROUTE: ${updates.cargoFrom || o.cargoFrom || '?'} -> ${updates.cargoTo || o.cargoTo || '?'} | ${text.substring(0, 70).replace(/\n/g, ' ')}`);
      }
    } else if (needsRouteFix) {
      unfixable.push({
        id: o.id.slice(-8),
        from: o.cargoFrom,
        to: o.cargoTo,
        msg: text.substring(0, 100).replace(/\n/g, ' ')
      });
    }
  }

  // Yakuniy stat
  const total = await p.order.count({ where: { createdAt: { gte: today } } });
  const withBoth = await p.order.count({
    where: { createdAt: { gte: today }, NOT: [{ cargoFrom: null }, { cargoTo: null }] }
  });
  const sameCityCount = (await p.order.findMany({
    where: { createdAt: { gte: today }, NOT: [{ cargoFrom: null }, { cargoTo: null }] },
    select: { cargoFrom: true, cargoTo: true },
  })).filter(o => o.cargoFrom === o.cargoTo).length;
  const withVehicle = await p.order.count({
    where: { createdAt: { gte: today }, NOT: { vehicleType: null } }
  });

  console.log('\n=== YAKUNIY NATIJA ===');
  console.log('Jami:', total);
  console.log('Yo\'nalish tuzatildi:', routeFixed);
  console.log('Mashina turi tuzatildi:', vehicleFixed);
  console.log('To\'liq yo\'nalishli:', withBoth, '/', total, '(' + Math.round(withBoth / total * 100) + '%)');
  console.log('FROM == TO qolgan:', sameCityCount);
  console.log('Mashina turi bor:', withVehicle, '/', total, '(' + Math.round(withVehicle / total * 100) + '%)');
  console.log('\nTuzatib bo\'lmaydigan (' + unfixable.length + '):');
  unfixable.slice(0, 30).forEach(u => console.log(`  ${u.id} | ${u.from || '?'} -> ${u.to || '?'} | ${u.msg}`));

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
