const { PrismaClient } = require('../node_modules/.prisma/client');
const p = new PrismaClient();

const FOREIGN = ['москва','moskva','moscow','питер','петербург','peterburg','новосибирск','novosibirsk','казань','kazan','екатеринбург','yekaterinburg','красноярск','krasnoyarsk','челябинск','chelyabinsk','омск','omsk','самара','samara','ростов','rostov','уфа','ufa','волгоград','volgograd','пермь','perm','воронеж','voronezh','тюмень','tyumen','краснодар','krasnodar','сочи','sochi','нижний новгород','nizhniy novgorod','хабаровск','владивосток','иркутск','новокузнецк','барнаул','ставрополь','stavropol','тамбов','tambov','серпухов','serpukhov','ворсино','vorsino','егорьевск','yegorievsk','орехово','orekhovo','шарья','sharya','рязань','ryazan','тула','tula','калуга','kaluga','брянск','bryansk','курск','kursk','белгород','belgorod','липецк','lipetsk','пенза','penza','саратов','saratov','оренбург','orenburg','ульяновск','ulyanovsk','ижевск','izhevsk','тольятти','tolyatti','набережные челны','naberezhnye chelny','астрахань','astrakhan','махачкала','makhachkala','владикавказ','vladikavkaz','грозный','grozny','нальчик','nalchik','элиста','elista','кисловодск','kislovodsk','пятигорск','pyatigorsk','минводы','минеральные воды','mineralnye vody','новороссийск','novorossiysk','анапа','anapa','геленджик','gelendzhik','таганрог','taganrog','подольск','podolsk','мытищи','mytishchi','балашиха','люберцы','lyubertsy','домодедово','domodedovo','внуково','vnukovo','вологда','vologda','кострома','kostroma','ярославль','yaroslavl','иваново','ivanovo','владимир','vladimir','тверь','tver','мурманск','murmansk','архангельск','arkhangelsk','сургут','surgut','нижневартовск','nizhnevartovsk','томск','tomsk','кемерово','kemerovo','чита','chita','улан-удэ','ulan-ude','якутск','yakutsk','магадан','magadan','алматы','almaty','астана','astana','нур-султан','nursultan','шымкент','shymkent','караганда','karaganda','актау','aktau','актобе','aktobe','атырау','atyrau','тараз','taraz','павлодар','pavlodar','семей','semey','костанай','kostanay','кызылорда','kyzylorda','туркестан','turkestan','turkiston','хоргос','khorgos','xorgos','ашхабад','ashgabat','ашгабат','мары','mary','туркменабад','turkmenabat','дашогуз','dashoguz','балканабад','balkanabat','бишкек','bishkek','ош','osh','жалал-абад','жалалабад','jalolobod','jalal-abad','каракол','karakol','нарын','naryn','токмок','tokmok','душанбе','dushanbe','худжанд','khujand','xujand','куляб','kulob','курган-тюбе','qurghonteppa','истаравшан','istaravshan','бохтар','bokhtar','стамбул','istanbul','анкара','ankara','дубай','dubai','абу-даби','минск','minsk','киев','kiev','kyiv','литва','litva','латвия','latviya','грузия','gruziya','georgia','тбилиси','tbilisi','азербайджан','ozarbayjon','баку','baku','иран','iran','тегеран','tehran','афганистан','afganistan','кабул','kabul','пакистан','pakistan','карачи','karachi','индия','india','мумбаи','mumbai','китай','xitoy','china','пекин','beijing','урумчи','urumqi','кашгар','kashgar','россия','rossiya','russia','рф','казахстан','kazakhstan','qozogiston','туркменистан','turkmenistan','кыргызстан','kyrgyzstan','qirgiziston','таджикистан','tajikistan','tojikiston','турция','turkey','turkiya'];

const UZ = new Set(['toshkent','тошкент','ташкент','tashkent','samarqand','самарканд','самарқанд','samarkand','buxoro','бухара','бухоро','bukhara','navoiy','навои','navoi','andijon','андижан','андижон','andijan',"farg'ona",'фергана','фаргона','фарғона','fergana','fargona','namangan','наманган','qarshi','карши','қарши','karshi','termiz','термез','термиз','termez','nukus','нукус','urganch','ургенч','urgench','jizzax','джизак','жиззах','jizzakh','guliston','гулистон','гулистан','gulistan','qashqadaryo','қашқадарё','кашкадарья','kashkadarya','surxondaryo','сурхандарья','surkhandarya','xorazm','хорезм','khorezm','sirdaryo','сырдарья','syrdarya','bekobod','бекабад','bekabad','chirchiq','чирчик','chirchik','olmaliq','алмалык','almalyk','angren','ангрен','nurafshon','нурафшон','ohangaron','ахангаран','yangiyul','янгиюль',"yangiyo'l",'chinoz','чиноз','sergeli','сергели','parkent','паркент','shahrisabz','шахрисабз','kitob','китаб','китоб','koson','касан','косон','chiroqchi','чирокчи','чироқчи','denov','денау','денов','urgut','ургут','kattaqorgon','каттакурган','каттақўрғон','kogon','каган','коган',"qo'qon",'коканд','қўқон','kokand','margilan','маргилан',"marg'ilon",'quvasoy','кувасай','rishton','риштан','риштон','pop','поп','uchqorgon','учкурган','учқўрғон','chust','чуст','vodil','водил','buvayda','бувайда','yozyovon','язъяван','ёзёвон','dehqonobod','дехканабад','деҳқонобод','angor','ангор','jomboy','жомбой','джамбай','toyloq','тойлоқ','тайлак',"qo'rg'ontepa",'кургантепа','курғонтепа','xiva','хива','khiva',"sho'rchi",'шурчи','шўрчи','boysun','байсун','бойсун','sherobod','шерабад','шеробод','muborak','мубарек','муборак','navbahor','навбахор','nurota','нурата','нурота','karmana','кармана','zarafshon','зарафшан','зарафшон','gazli','газли','turtkul','тўрткўл','турткуль','kungrad','кунград','қўнғирот','xonqa','ханка','хонқа','shovot','шават','шовот','qorovulbozor','каравулбазар','қоровулбозор','zomin','зомин','dustlik','дустлик','paxtaobod','пахтаобод','пахтаабад','asaka','асака','xonobod','ханабад','хонобод','baliqchi','балыкчи','балиқчи','jalaquduq','жалакудук','жалақудуқ','oltiariq','алтиарик','олтиариқ','toshloq','ташлак','тошлоқ','yangiyer','янгиер','boyovut','бояут','боёвут','mirzaobod','мирзаабад','мирзаобод','oqoltin','акалтын','оқолтин','sardoba','сардоба','xovos','хавост','ховос','rohat','рохат','zangiota','зангиота','toytepa','тойтепа','piskent','пскент','gazalkent','газалкент']);

function isUzCity(text) {
  if (!text) return false;
  return UZ.has(text.toLowerCase().trim());
}

function containsForeign(text) {
  if (!text) return false;
  const lower = text.toLowerCase().trim();
  if (UZ.has(lower)) return false;
  for (const d of FOREIGN) {
    if (d.length <= 3) {
      const re = new RegExp('(^|\\s|[,;.!?/()>\\-])' + d + '($|\\s|[,;.!?/()>\\-])', 'i');
      if (re.test(lower)) return true;
    } else {
      if (lower.includes(d)) return true;
    }
  }
  return false;
}

function classify(f, t, msg) {
  if (!f && !t && !msg) return 'INTERNAL';
  const fuz = isUzCity(f);
  const tuz = isUzCity(t);
  if (fuz && tuz) return 'INTERNAL';
  const ff = !!f && !fuz && containsForeign(f);
  const tf = !!t && !tuz && containsForeign(t);
  if (ff && !tf) return 'IMPORT';
  if (!ff && tf) return 'EXPORT';
  if (ff && tf) return 'EXPORT';
  if (msg && containsForeign(msg)) {
    if (f && !ff) return 'EXPORT';
    return 'IMPORT';
  }
  return 'INTERNAL';
}

async function main() {
  const orders = await p.order.findMany({
    select: { id: true, cargoFrom: true, cargoTo: true, scope: true, messageText: true }
  });
  let fixed = 0;
  for (const o of orders) {
    const correct = classify(o.cargoFrom, o.cargoTo, o.messageText);
    if (o.scope !== correct) {
      await p.order.update({ where: { id: o.id }, data: { scope: correct } });
      fixed++;
      if (fixed <= 15) {
        console.log('FIX:', o.scope, '->', correct, '|', (o.cargoFrom || '?').substring(0, 15), '->', (o.cargoTo || '?').substring(0, 15));
      }
    }
  }
  console.log('\nJami:', fixed, '/', orders.length, 'ta order tuzatildi');
  await p.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
