const fs = require('fs');
const data = fs.readFileSync(process.argv[2], 'utf-8').trim();
const orders = JSON.parse(data);

console.log('TOTAL ORDERS:', orders.length);
console.log('');

// 1. Chala yo'nalishlar
console.log('=== CHALA YO\'NALISHLAR (cargoTo = null yoki cargoFrom = null) ===');
const incomplete = orders.filter(o => !o.cargoFrom || !o.cargoTo);
incomplete.forEach(o => {
  console.log(`ID: ${o.id.slice(-8)} | FROM: ${o.cargoFrom || 'NULL'} | TO: ${o.cargoTo || 'NULL'} | Sender: ${o.senderName} | Type: ${o.type} | Scope: ${o.scope}`);
});
console.log('Chala:', incomplete.length);
console.log('');

// 2. From == To
console.log('=== FROM == TO (noto\'g\'ri) ===');
const sameCity = orders.filter(o => o.cargoFrom && o.cargoTo && o.cargoFrom === o.cargoTo);
sameCity.forEach(o => {
  console.log(`ID: ${o.id.slice(-8)} | FROM: ${o.cargoFrom} | TO: ${o.cargoTo} | Sender: ${o.senderName}`);
});
console.log('Same city:', sameCity.length);
console.log('');

// 3. Ayol ismlari
console.log('=== AYOL ISMLARI ===');
const femaleNames = ['nilufar','gulnora','maftuna','dilnoza','shahlo','feruza','nodira','zulfiya','barno','munira','dilorom','hulkar','xurshida','yulduz','sevara','mohira','nasiba','aziza','zuhra','iroda','malika','kamola','dildora','sabohat','saodat','muazzam','umida','rano','shoira','adolat','marguba','manzura','nargiza','zarnigor','madina','mohichehra','nozima','oydin','mavluda','mahbuba','zilola','nafisa','habiba','robiya','mohigul','mohinur','mohlaroyim','mushtariy','munavvar','sarvinoz','sevinch','shahnoza','shaxlo','sitora','turgunoy','tursunoy','xilola','yoqut','ziyoda','zulayho','fotima','odinaxon','oybarchin','gulbahor','gulchehra','gulsanam','hulkaroy','komila'];
const femaleNamesCyr = ['\u043c\u043e\u0445\u0438\u0433\u0443\u043b','\u043c\u043e\u0445\u0438\u043d\u0443\u0440','\u043d\u0438\u043b\u0443\u0444\u0430\u0440','\u0433\u0443\u043b\u043d\u043e\u0440\u0430','\u043c\u0430\u0444\u0442\u0443\u043d\u0430','\u0434\u0438\u043b\u043d\u043e\u0437\u0430','\u0448\u0430\u0445\u043b\u043e','\u0444\u0435\u0440\u0443\u0437\u0430','\u043d\u043e\u0434\u0438\u0440\u0430','\u0437\u0443\u043b\u0444\u0438\u044f','\u043c\u0430\u043b\u0438\u043a\u0430','\u043c\u0430\u0434\u0438\u043d\u0430','\u0437\u0443\u0445\u0440\u0430','\u0430\u0437\u0438\u0437\u0430','\u0443\u043c\u0438\u0434\u0430','\u043d\u0430\u0441\u0438\u0431\u0430','\u0444\u043e\u0442\u0438\u043c\u0430','\u0441\u0435\u0432\u0438\u043d\u0447','\u0448\u0430\u0445\u043d\u043e\u0437\u0430','\u0441\u0430\u0440\u0432\u0438\u043d\u043e\u0437','\u0437\u0438\u0451\u0434\u0430','\u0441\u0438\u0442\u043e\u0440\u0430','\u0433\u0443\u043b\u0431\u0430\u0445\u043e\u0440','\u0433\u0443\u043b\u0447\u0435\u0445\u0440\u0430','\u043a\u043e\u043c\u0438\u043b\u0430'];
const femaleNamesRu = ['\u0435\u043b\u0435\u043d\u0430','\u043e\u043b\u044c\u0433\u0430','\u043d\u0430\u0442\u0430\u0448\u0430','\u043d\u0430\u0442\u0430\u043b\u044c\u044f','\u0430\u043d\u043d\u0430','\u043c\u0430\u0440\u0438\u044f','\u043c\u0430\u0440\u0438\u043d\u0430','\u0438\u0440\u0438\u043d\u0430','\u0442\u0430\u0442\u044c\u044f\u043d\u0430','\u0441\u0432\u0435\u0442\u043b\u0430\u043d\u0430','\u0435\u043a\u0430\u0442\u0435\u0440\u0438\u043d\u0430','\u043a\u0430\u0442\u044f','\u043e\u043a\u0441\u0430\u043d\u0430','\u044e\u043b\u0438\u044f','\u0430\u043b\u0438\u043d\u0430','\u0434\u0430\u0440\u044c\u044f','\u043f\u043e\u043b\u0438\u043d\u0430','\u0432\u0438\u043a\u0442\u043e\u0440\u0438\u044f','\u0432\u0438\u043a\u0430','\u043a\u0440\u0438\u0441\u0442\u0438\u043d\u0430','\u0434\u0438\u0430\u043d\u0430','\u043b\u0438\u043b\u0438\u044f','\u043b\u044e\u0434\u043c\u0438\u043b\u0430','\u0433\u0430\u043b\u0438\u043d\u0430','\u043d\u0438\u043d\u0430','\u0432\u0430\u043b\u0435\u043d\u0442\u0438\u043d\u0430','\u043b\u0430\u0440\u0438\u0441\u0430','\u0442\u0430\u043c\u0430\u0440\u0430','\u043d\u0430\u0434\u0435\u0436\u0434\u0430','\u0432\u0435\u0440\u0430'];
const allFemale = [...femaleNames, ...femaleNamesCyr, ...femaleNamesRu];

const femaleOrders = [];
orders.forEach(o => {
  const name = (o.senderName || '').toLowerCase().trim();
  const firstName = name.split(/\s+/)[0];
  for (const fn of allFemale) {
    if (firstName === fn || firstName.startsWith(fn)) {
      femaleOrders.push(o);
      console.log(`ID: ${o.id.slice(-8)} | Name: ${o.senderName} | TgID: ${o.senderTelegramId} | Match: ${fn}`);
      break;
    }
  }
});
console.log('Female senders:', femaleOrders.length);
console.log('');

// 4. Stats
const scopeStats = {};
const typeStats = {};
orders.forEach(o => {
  scopeStats[o.scope] = (scopeStats[o.scope] || 0) + 1;
  typeStats[o.type] = (typeStats[o.type] || 0) + 1;
});
console.log('=== SCOPE STATS ===', JSON.stringify(scopeStats));
console.log('=== TYPE STATS ===', JSON.stringify(typeStats));
