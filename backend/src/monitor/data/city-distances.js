"use strict";
/**
 * Shaharlar koordinatalari bazasi — O'zbekiston + Rossiya + MDH + xalqaro
 * 600+ shahar, haversine formula bilan masofa hisoblash
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CITIES = void 0;
exports.findCity = findCity;
exports.findCitiesInText = findCitiesInText;
exports.calculateDistance = calculateDistance;
exports.normalizeCityName = normalizeCityName;
exports.CITIES = [
    // =====================================================================================
    //                              O'ZBEKISTON (~200 shahar/tuman)
    // =====================================================================================
    // --- Viloyat markazlari ---
    { name: 'Toshkent', aliases: ['toshkent', 'тошкент', 'ташкент', 'tashkent', 'ташк', 'тош', 'тошк', 'тошкен', 'ташкен', 'тошкенд', 'toshken', 'tashken', 'тошкант', 'тошканд', 'toshkant', 'tashkant', 'тоshkent', 'тошкет', 'тошкенг', 'тошкинт', 'тошкінт', 'toshket', 'tashket', 'towkent', 'towken', 'тошкенд', 'ташкенд', 'toshent', 'тошент', 'тошкэнт', 'ташкэнт', 'тошкэн', 'ташкэн', 'toshkeng', 'toshkin', 'тошкин', 'тошкін', 'towkin', 'ташкін', 'toshkint', 'тошкінт', 'toahkent', 'тоахкент', 'toshkentan', 'тошкентан', 'tawkent', 'tawken', 'тошкенада', 'тощкент', 'тошкедан', 'toshknt', 'тошкнт', 'toshkenta', 'тошконг'], lat: 41.2995, lng: 69.2401 },
    { name: 'Samarqand', aliases: ['samarqand', 'самарканд', 'самарқанд', 'samarkand', 'самар', 'samarqant', 'самарқант', 'самаркант', 'самаркан', 'samarkan', 'samarqon', 'самарқон', 'самарконд', 'samarkond', 'samarqond', 'самарқонд', 'самаркенд', 'samarkend', 'самарканда', 'самқанд', 'самрқанд', 'самаранд', 'samarqad', 'самаркад', 'самарқад', 'samarqan', 'самарқан', 'samarkad', 'самарканг', 'samarkang', 'samarqang', 'samarqat', 'самарқат', 'самаркат', 'samarkat', 'samarqam', 'самарқам', 'самаркам', 'samarkam', 'самкан', 'samkan', 'samrqat', 'самрқат', 'самркат', 'samarqnd', 'самарқнд', 'samarqa', 'самарқа', 'samarwand', 'самарткант', 'samarqamd'], lat: 39.6542, lng: 66.9597 },
    { name: 'Buxoro', aliases: ['buxoro', 'бухара', 'бухоро', 'bukhara', 'бухар', 'buhoro', 'бухоро', 'бухоpо', 'bukhoro', 'букхара', 'бухаро', 'бухора', 'бухро', 'buxaro', 'буxоро', 'бухоро', 'buxora', 'буксора', 'бухсора', 'бухорга', 'boxoro', 'buxaraga'], lat: 39.7681, lng: 64.4556 },
    { name: 'Navoiy', aliases: ['navoiy', 'навои', 'navoi', 'навое', 'навоий', 'навоі', 'навой', 'navoiy', 'навоиий', 'навоїй', 'навоі', 'навоий', 'новоий', 'новои', 'novoy', 'новой', 'навоі', 'navoyi', 'novoiy', 'новоій', 'новоий', 'novoyi', 'новойи', 'навойі'], lat: 40.1003, lng: 65.3792 },
    { name: 'Andijon', aliases: ['andijon', 'андижан', 'andijan', 'андижон', 'андиж', 'анжон', 'anjón', 'anjon', 'андижан', 'andjon', 'андижон', 'андіжон', 'андижін', 'андижён', 'андиган', 'андигон', 'andigon', 'andigan', 'андижн', 'andizhan', 'андіжан', 'адижон', 'antijon', 'антижон', 'antijón', 'andijón', 'anjijon', 'анжонд', 'анджон', 'adijon'], lat: 40.7821, lng: 72.3442 },
    { name: "Farg'ona", aliases: ["farg'ona", 'фергана', 'фаргона', 'фарғона', 'fergana', 'fargona', 'фаргана', 'фарг', 'фарғ', 'фарғана', 'фарона', 'фаргано', 'фергона', 'fergona', 'фарғоно', 'фаргоно', 'парғона', 'паргона', 'фаргна', 'фергна', 'фарг\'она', 'водий', 'vodiy', 'forgona', 'форгона', 'forgano', 'форгано', 'фаргондан', 'фагона', 'фархона', 'fargandani'], lat: 40.3834, lng: 71.7870 },
    { name: 'Namangan', aliases: ['namangan', 'наманган', 'намган', 'наманг', 'наман', 'номонгон', 'намонгон', 'намангон', 'namangon', 'наманган', 'наманґан', 'наманкан', 'намнган', 'наманг\'он', 'namagan', 'намаган', 'naman', 'наман', 'намангага', 'nomongon'], lat: 40.9983, lng: 71.6726 },
    { name: 'Qarshi', aliases: ['qarshi', 'карши', 'қарши', 'karshi', 'қарші', 'qarsi', 'карси', 'қарси', 'каршы', 'қаршы', 'qarşi', 'карші', 'qarwi', 'қарwi', 'карви', 'qarsh', 'қарш', 'карш'], lat: 38.8606, lng: 65.7981 },
    { name: 'Termiz', aliases: ['termiz', 'термез', 'termez', 'tirmiz', 'термиз', 'тирмиз', 'тирмез', 'термиз', 'тармиз', 'тармез', 'tarmiz', 'термиc', 'термі', 'термез', 'teremez', 'teremiz', 'теремез', 'теремиз', 'тиримиз', 'tеrmez', 'тирмез'], lat: 37.2241, lng: 67.2783 },
    { name: 'Nukus', aliases: ['nukus', 'нукус', 'qaraqalpogiston', 'қарақалпоғистон', 'каракалпакстан', 'каракалпак', 'qaraqalpoq', 'karakalpak', 'каракалпакия', 'нукис', 'нокис', 'нокус', 'nukis', 'nokis', 'нўкус', 'нукуc', 'nukys', 'нукіс', 'қорақалпоғ', 'қорақалпоғистон', 'karakalpakstan', 'qoraqalpog\'iston'], lat: 42.4628, lng: 59.6003 },
    { name: 'Urganch', aliases: ['urganch', 'ургенч', 'urgench', 'ўрганч', 'урганч', 'ургонч', 'ургенч', 'ургинч', 'urgonch', 'urginch', 'ургенч', 'ургенчь', 'ургенш', 'ўрғанч'], lat: 41.5533, lng: 60.6336 },
    { name: 'Jizzax', aliases: ['jizzax', 'джизак', 'жиззах', 'жизза', 'jizzakh', 'жиззак', 'жиззақ', 'жизах', 'жиззох', 'jizzox', 'jizax', 'джизах', 'дизак', 'жиззаx', 'джіззак', 'жиззаҳ', 'jizzah', 'жиззаh', 'jizah', 'жизаh', 'жизах', 'жізах', 'jizzа', 'жизахт', 'жиззаг', 'jizaxx'], lat: 40.1158, lng: 67.8422 },
    { name: 'Guliston', aliases: ['guliston', 'гулистон', 'гулистан', 'gulistan', 'гулстон', 'гулстан', 'гулістон', 'гулистон', 'гулистін', 'guliston', 'гулисан', 'гулістан', 'guluston', 'гулустон', 'гулустан'], lat: 40.4897, lng: 68.7842 },
    // --- Toshkent viloyati ---
    { name: 'Sergeli', aliases: ['sergeli', 'сергели', 'сергили', 'серг', 'сергэли', 'сергелі', 'sergili', 'sergilik', 'сергилик'], lat: 41.2200, lng: 69.2200 },
    { name: 'Chirchiq', aliases: ['chirchiq', 'чирчик', 'chirchik', 'чирчиқ', 'чирчік', 'chirchik', 'чирчіқ', 'чирч', 'chirch', 'чирчек', 'чирчак'], lat: 41.4689, lng: 69.5828 },
    { name: 'Olmaliq', aliases: ['olmaliq', 'алмалык', 'almalyk', 'олмалиқ', 'олмалік', 'алмалик', 'олмалик', 'almalik', 'olmalik', 'алмалиқ', 'алмалық'], lat: 40.8453, lng: 69.5983 },
    { name: 'Angren', aliases: ['angren', 'ангрен', 'ангрін', 'ohangaron', 'ангрэн', 'онгрен', 'angen', 'анген', 'ангін', 'angеn', 'ангирен', 'angiren', 'ангірен', 'angirin', 'ангирін'], lat: 41.0167, lng: 70.1436 },
    { name: 'Nurafshon', aliases: ['nurafshon', 'нурафшон', 'nurafshan', 'нурафшан', 'нурафшін', 'нурафш', 'nurash', 'нурофшон', 'нурафшён'], lat: 41.0514, lng: 69.3292 },
    { name: 'Bekobod', aliases: ['bekobod', 'бекабад', 'bekabad', 'bekabot', 'bekabod', 'бекобод', 'бекабот', 'бекобот', 'бекабід', 'бекобат', 'бекобід', 'бекоbot', 'бекабод', 'bekobat', 'bekabat', 'bekobot', 'бекобад', 'bekobоd', 'bekabob', 'бекабоб', 'бекобоб'], lat: 40.2214, lng: 69.2692 },
    { name: 'Ohangaron', aliases: ['ohangaron', 'ахангаран', 'ahangaran', 'охонгарон', 'охангарон', 'oxongoron', 'oxongaron', 'oxangaron', 'оҳангарон', 'аhангаран', 'охонгорон', 'ahongaron', 'ohongaron', 'ахангоран', 'oxangoron', 'ohongoron', 'охонгорон', 'ахонгорон', 'охонгоронга', 'ohangrang', 'охангранг', 'оhангранг'], lat: 41.0667, lng: 69.6333 },
    { name: 'Yangiyul', aliases: ['yangiyul', 'янгиюль', "yangiyo'l", "yangiyo'l", 'янгійўл', 'янгійул', 'yangiyl', 'янгиюл', 'yangiyol', 'янгийўл', 'янгийул', 'yangiul', 'янгіюль'], lat: 41.1158, lng: 69.0461 },
    { name: 'Toytepa', aliases: ['toytepa', 'тойтепа', 'tuytepa', 'тўйтепа', 'тойтепо', 'тўйтепо', 'тойтіпа', 'тойтэпа', 'tuytepo', 'тойтепа'], lat: 41.1667, lng: 69.3167 },
    { name: 'Parkent', aliases: ['parkent', 'паркент', 'поркент', 'поркент', 'паркінт', 'паркенд', 'parkend', 'parkant', 'паркант'], lat: 41.2931, lng: 69.6747 },
    { name: 'Piskent', aliases: ['piskent', 'пскент', 'pskent', 'пискент', 'пискенд', 'пискант', 'пискінт', 'piksent', 'пискент'], lat: 41.0667, lng: 69.3500 },
    { name: 'Chinoz', aliases: ['chinoz', 'чиноз', 'чинос', 'чиназ', 'chinaz', 'чиноз', 'чінос', 'чінoz'], lat: 40.9333, lng: 68.7667 },
    { name: "Bo'ka", aliases: ["bo'ka", 'бука', 'buka', 'boka', 'бўка', 'бока', 'бока', 'бўко', 'бўка', 'бука'], lat: 40.8050, lng: 68.6860 },
    { name: "Bo'stonliq", aliases: ["bo'stonliq", 'бостанлык', 'bostanliq', 'bostanlyk', 'бўстонлиқ', 'босtонлиқ', 'бўстанлиқ', 'bostonliq', 'бостонлик', 'bostanlik', 'бостонлиқ', 'бустанлик', 'бустанлық'], lat: 41.5500, lng: 69.9833 },
    { name: 'Gazalkent', aliases: ['gazalkent', 'газалкент', "g'azalkent", 'ғазалкент', 'газалкенд', 'gazalkend', 'ғазалкенд', 'газалкант', 'gazalkant', 'газолкент', 'gazolkent', 'ғозалкент', 'козалкент'], lat: 41.5618, lng: 69.7710 },
    { name: 'Rohat', aliases: ['rohat', 'рохат', 'рўхат', 'рохот', 'рохід', 'roxat', 'рохат', 'rohot', 'roxot'], lat: 41.1667, lng: 69.6667 },
    { name: 'Zangiota', aliases: ['zangiota', 'зангиота', 'зангиата', 'зангиато', 'зангіота', 'зангата', 'зангіата', 'зангиёта', 'зангеота', 'zangiata', 'zangota', 'зангота', 'зангот'], lat: 41.2167, lng: 69.1000 },
    { name: 'Qibray', aliases: ['qibray', 'кибрай', 'kibray', 'қибрай', 'кыбрай', 'қібрай', 'кібрай', 'киброй', 'qibroy'], lat: 41.3833, lng: 69.4667 },
    { name: "Qo'yliq", aliases: ["qo'yliq", 'куйлюк', 'quyliq', 'qoyliq', 'қўйлиқ', 'куйлик', 'kuyluk', 'кўйлиқ', 'қойлиқ', 'қойлик', 'qoylik', 'qoyliq', 'куйлюк'], lat: 41.0833, lng: 69.4833 },
    { name: "Oqqo'rg'on", aliases: ["oqqo'rg'on", 'аккурган', 'oqqorgon', 'akkurgan', 'оққўрғон', 'оққоргон', 'okkurgon', 'okkurgan', 'акқурган', 'аккурғон', 'оқкурган', 'oqkurgan', 'аккургон', 'аққўрғон'], lat: 41.0667, lng: 69.0500 },
    { name: "O'rtachirchiq", aliases: ["o'rtachirchiq", 'уртачирчик', 'ortachirchiq', 'ўртачирчиқ', 'уртачирчиқ', 'ортачирчик', 'ортачирчиқ', 'ortachirchik', 'уртачірчік', 'ўрточирчиқ'], lat: 41.3000, lng: 69.4333 },
    { name: 'Kelesh', aliases: ['kelesh', 'келес', 'келис', 'keles', 'келеш', 'килес', 'кілес', 'келес'], lat: 41.2500, lng: 69.3000 },
    { name: 'Nazarbek', aliases: ['nazarbek', 'назарбек', 'назарбік', 'нозарбек', 'nozarbek', 'nazarbik', 'назарбик', 'нозарбик'], lat: 41.2300, lng: 69.2500 },
    { name: 'Kukdala', aliases: ['kukdala', 'кукдала', 'kukdola', 'кукдола', 'кўкдала', 'кўкдола', 'кукдална'], lat: 40.8200, lng: 69.6300 },
    { name: 'Sobir Rahimov', aliases: ['sobir rahimov', 'сабир рахимов', 'собир рахимов', 'sabirrakhimov', 'собиррахимов', 'сабиррахимов', 'сабир рохимов', 'собир рохимов', 'собіррахімов'], lat: 41.3200, lng: 69.2800 },
    { name: 'Otchopor', aliases: ['otchopor', 'отчопар', 'отчопор', 'очопар', 'очопор', 'ўтчопар', 'отшопар', 'отчопір'], lat: 41.2800, lng: 69.4200 },
    { name: 'Bektemir', aliases: ['bektemir', 'бектемир', 'бектемір', 'бектімір', 'бектимир', 'bektеmir', 'бектамир', 'bektamir'], lat: 41.2400, lng: 69.3300 },
    { name: 'Yunusobod', aliases: ['yunusobod', 'юнусобод', 'юнусабад', 'юнсабод', 'yunsabod', 'юнусобот', 'юнусобід', 'yunusabad', 'юнусобад', 'юнусабод'], lat: 41.3400, lng: 69.2800 },
    { name: 'Olmazor', aliases: ['olmazor', 'олмазор', 'олмазар', 'olmazar', 'олмозор', 'олмозар', 'олмазір'], lat: 41.3300, lng: 69.2100 },
    { name: 'Zarkent', aliases: ['zarkent', 'заркент', 'зоркент', 'заркенд', 'зоркенд', 'заркант', 'заркінт'], lat: 41.5600, lng: 69.8500 },
    { name: 'Lutfobod', aliases: ['lutfobod', 'лутфобод', 'лутфабад', 'лутфобот', 'лутфабат', 'lutfabad', 'lutfobot', 'лютфобод'], lat: 41.4800, lng: 69.5800 },
    { name: 'Gagarin', aliases: ['gagarin', 'гагарин', 'гагарін', 'гогарин'], lat: 41.2500, lng: 69.3500 },
    { name: 'Fud Siti', aliases: ['fud siti', 'fudsiti', 'футсити', 'фут сити', 'фуд сити', 'фудсити', 'fut siti', 'futciti', 'фот сити', 'food sity', 'fodsiti', 'food city', 'foodcity'], lat: 41.2457, lng: 69.3478 },
    // --- Andijon viloyati ---
    { name: 'Asaka', aliases: ['asaka', 'асака', 'ассака', 'assaka', 'осака', 'osaka', 'асока', 'асако', 'асақа'], lat: 40.6406, lng: 72.2378 },
    { name: "Xo'jaobod", aliases: ["xo'jaobod", 'ходжаабад', 'khodjaabad', 'xojaobod', 'хўжаобод', 'хўжаабад', 'хожаобод', 'хожаабад', 'xojaobot', 'хўжаобот', 'хожаобот', 'ходжаабат', 'xo\'jaobot', 'хўжообод', 'khojaobod', 'khojaabad', 'xujabot', 'xujabod', 'хужабод', 'хужабот', 'хўжабод', 'хўжабот', 'xujobot', 'xujobod'], lat: 40.6833, lng: 72.0333 },
    { name: 'Shahrixon', aliases: ['shahrixon', 'шахрихан', 'shahrikhan', 'шаҳрихон', 'шахрихон', 'шахрікхон', 'shahrihan', 'шахрихін', 'шахрихон', 'shahrhon', 'шахрхон', 'shahrihon', 'shaxrixon', 'шахріхон', 'шахрихін', 'shaxrihon', 'шаxрихон'], lat: 40.7167, lng: 72.0500 },
    { name: 'Xonobod', aliases: ['xonobod', 'ханабад', 'khanabad', 'xanabad', 'хонобод', 'хонобот', 'хонабад', 'хоноbot', 'xonobot', 'ханабат', 'хонабот', 'khanabat', 'хонобад', 'xonabad', 'хонобід'], lat: 40.8000, lng: 72.1500 },
    { name: 'Marhamat', aliases: ['marhamat', 'мархамат', 'марҳамат', 'мархамад', 'marxamat', 'маrхамат', 'мархомат', 'мархамот', 'мархамат'], lat: 40.8333, lng: 72.3167 },
    { name: "Oltinko'l", aliases: ["oltinko'l", 'алтынкуль', 'oltinkol', 'altynkul', 'олтинкўл', 'олтинкол', 'олтинкул', 'altinkol', 'altinkul', 'алтинкуль', 'олтинкуль', 'алтинкул', 'олтінкўл', 'олтинкол'], lat: 40.8000, lng: 72.2833 },
    { name: 'Baliqchi', aliases: ['baliqchi', 'балыкчи', 'balikchi', 'балиқчи', 'баликчи', 'балиқчі', 'балыкчы', 'баликчі', 'болиқчи', 'baliqch'], lat: 40.8833, lng: 72.5833 },
    { name: "Bo'z", aliases: ["bo'z", 'буз', 'boz', 'buz', 'бўз', 'боз', 'бос', 'бўс'], lat: 40.6500, lng: 72.1500 },
    { name: 'Jalaquduq', aliases: ['jalaquduq', 'джалакудук', 'jalakuduk', 'жалақудуқ', 'жалакудук', 'жалақудук', 'жолақудуқ', 'jalokuduq', 'джалакудуқ', 'жалакудуқ', 'жалақидиқ', 'jalaqudiq'], lat: 40.9833, lng: 72.2833 },
    { name: 'Paxtaobod', aliases: ['paxtaobod', 'пахтаабад', 'pakhtaabad', 'пахтаобод', 'пахтаобот', 'пахтаабат', 'paxtaobot', 'pakhtaabat', 'пахтообод', 'pahtaobod', 'pahtaabad', 'поxтаобод'], lat: 40.6167, lng: 72.3000 },
    { name: 'Izboskan', aliases: ['izboskan', 'избоскан', 'izbaskan', 'избоскон', 'избаскан', 'избоскін', 'избасқан', 'избоскан'], lat: 40.9000, lng: 72.0667 },
    { name: "Ulug'nor", aliases: ["ulug'nor", 'улугнор', 'ulugnor', 'улуғнор', 'улугнар', 'улугнір', 'ulugnar', 'улугнор', 'улуғнор', 'улугнўр', 'улуг\'нор'], lat: 40.7500, lng: 72.4167 },
    { name: 'Xasanboy', aliases: ['xasanboy', 'хасанбой', 'хасанбай', 'xasanbay', 'xasanboj', 'хасанбоой', 'хасанбій', 'хосанбой', 'xasanboe', 'хвсанбой'], lat: 40.6300, lng: 72.1800 },
    { name: "Qo'rg'ontepa", aliases: ["qo'rg'ontepa", 'кургантепа', 'qorgontepa', 'kurgantepa', 'қўрғонтепа', 'кўрғонтепа', 'қоргонтепа', 'кургонтепа', 'коргонтепа', 'kurgontepa', 'кургантепо', 'қоргонтепо', 'кургантипа', 'қўрғонтіпа'], lat: 40.7500, lng: 72.0833 },
    { name: 'Qorasuv', aliases: ['qorasuv', 'карасу', 'karasu', 'қорасув', 'коросув', 'корасув', 'korasuv', 'коросуф', 'қорасуф', 'korasuw', 'қоросув', 'қорасуб', 'корасуб', 'karasuw', 'қоросуб'], lat: 40.7300, lng: 72.0900 },
    { name: 'Buloqboshi', aliases: ['buloqboshi', 'булокбоши', 'булоқбоши', 'булокбаши', 'bulokboshi', 'булоқбаши', 'булоқбошы', 'булокбашы'], lat: 40.6200, lng: 72.3600 },
    // --- Farg'ona viloyati ---
    { name: "Qo'qon", aliases: ["qo'qon", 'коканд', 'kokand', 'quqon', 'кукон', 'куқон', 'кўқон', 'қўқон', 'қоқон', 'kokon', 'qqon', 'кокан', 'куқон', 'коқон', 'кокинд', 'қўқан', 'кўқан', 'коканда', 'кокант', 'коқанд', 'qoqon', 'qoqan', 'quqan', 'koqon', 'koqan', 'kukon', 'kukон', 'кокон', 'қуқон', 'қуқан', 'koqond', 'кокон'], lat: 40.5286, lng: 70.9425 },
    { name: "Marg'ilon", aliases: ["marg'ilon", 'маргилан', 'маргилон', 'марғилон', 'margilan', 'margilon', 'маргілон', 'маргелан', 'margelan', 'маргілан', 'маргін', 'марг', 'марғ', 'маргиілон', 'маргілон', 'маргилін', 'margulon', 'маргулон'], lat: 40.4703, lng: 71.7147 },
    { name: 'Toshloq', aliases: ['toshloq', 'тошлок', 'тошлоқ', 'тошлақ', 'тошлік', 'ташлак', 'tashlak', 'tashloq', 'toshlok', 'тошлок'], lat: 40.5667, lng: 71.8500 },
    { name: 'Quva', aliases: ['quva', 'кува', 'kuva', 'қува', 'кўва', 'кова', 'ківа', 'ківа', 'кувва', 'kuvva', 'кўва'], lat: 40.5178, lng: 72.0714 },
    { name: 'Rishton', aliases: ['rishton', 'риштан', 'rishtan', 'риштон', 'ріштон', 'рыштон', 'rishtón', 'ріштан', 'ріштон'], lat: 40.3833, lng: 71.2833 },
    { name: 'Beshariq', aliases: ['beshariq', 'бешарик', 'besharik', 'бешариқ', 'бешарық', 'бешорик', 'бішарік', 'бешарік', 'бишарик'], lat: 40.4500, lng: 70.5667 },
    { name: 'Oltiariq', aliases: ['oltiariq', 'алтыарык', 'altiariq', 'altiarik', 'олтиариқ', 'олтиарик', 'алтиарик', 'алтиарық', 'олтіарік', 'олтиорик', 'олтиарық', 'oltariq', 'олтарик', 'олтариқ'], lat: 40.4500, lng: 71.4667 },
    { name: "Bag'dod", aliases: ["bag'dod", 'багдад', 'bagdod', 'bagdad', 'бағдод', 'бағдот', 'бағдад', 'бакдод', 'бакдат', 'бағдід', 'багдот', 'бағдот', 'bogdod', 'бағдод', 'bagdot', 'богдод', 'богдот', 'bogdot'], lat: 40.3833, lng: 71.2167 },
    { name: 'Buvayda', aliases: ['buvayda', 'бувайда', 'buvaydi', 'бувайди', 'бувойда', 'бувайдо', 'бувайді', 'бувойді', 'бувайда'], lat: 40.5167, lng: 70.9167 },
    { name: "Dang'ara", aliases: ["dang'ara", 'дангара', 'dangara', 'данғара', 'дангора', 'данғора', 'данғоро', 'дангоро', 'дангаро', 'данғаро', 'дангір', 'данг\'ара'], lat: 40.5833, lng: 70.9333 },
    { name: 'Furqat', aliases: ['furqat', 'фуркат', 'фурқат', 'фурқот', 'фуркот', 'фурқід', 'фуркід', 'фуркет'], lat: 40.3000, lng: 71.8500 },
    { name: "So'x", aliases: ["so'x", 'сох', 'sokh', 'sox', 'сўх', 'сох', 'сох', 'сўx', 'сух', 'sukh'], lat: 39.9667, lng: 71.1333 },
    { name: "Uchko'prik", aliases: ["uchko'prik", 'учкуприк', 'uchkuprik', 'учкўприк', 'учкоприк', 'учкўпрік', 'учкуприк', 'uchkoprik', 'учкупрік', 'учкоприк'], lat: 40.5333, lng: 71.0500 },
    { name: 'Yozyovon', aliases: ['yozyovon', 'язъяван', 'yazyavan', 'ёзёвон', 'язяван', 'язявон', 'ёзявон', 'yozyavan', 'язяван', 'ёзёвон', 'ёзёвін', 'йозйовон', 'язявін', 'yazyavon', 'язявон'], lat: 40.6667, lng: 71.7333 },
    { name: "Qo'shtepa", aliases: ["qo'shtepa", 'кошрабат', 'qoshtepa', 'kushtepa', 'қўштепа', 'қоштепа', 'коштепа', 'кўштепа', 'кўштіпа', 'коштіпа', 'қоштіпа', 'qoshtepo', 'koshtеpa', 'қўштепо'], lat: 40.5500, lng: 71.6333 },
    { name: 'Shursuv', aliases: ['shursuv', 'шурсув', 'шурсуф', 'шурсўв', 'шурсів', 'шурсав', 'shursuf', 'шурсуб', 'shorsuv', 'shorsuy', 'шорсув', 'шорсуй', 'shorsuf'], lat: 40.5100, lng: 70.9000 },
    { name: 'Yaypan', aliases: ['yaypan', 'яйпан', 'yoypan', 'ёйпан', 'яйпон', 'ёйпон', 'яйпін', 'яйпен', 'яйпін', 'йайпан', 'яйпан'], lat: 40.3800, lng: 70.8000 },
    { name: 'Quvasoy', aliases: ['quvasoy', 'кувасой', 'кувасай', 'kuvasoy', 'куваcой', 'кувасої', 'kuvosoy', 'кувосой', 'кувасой', 'quvasay', 'kuvasay', 'quvosoy'], lat: 40.3028, lng: 71.6833 },
    { name: 'Vodil', aliases: ['vodil', 'водил', 'водиль', 'вадил', 'воділ', 'vodiy', 'водий', 'водін', 'ваділ', 'вадил'], lat: 40.5333, lng: 71.7000 },
    { name: 'Chimyon', aliases: ['chimyon', 'чимён', 'чимион', 'chimion', 'чимйон', 'chimyen', 'чимьон', 'чимён'], lat: 40.0700, lng: 71.0700 },
    { name: 'Tashmora', aliases: ['tashmora', 'ташмора', 'ташморе', 'tashmore'], lat: 40.6000, lng: 71.4000 },
    // --- Namangan viloyati ---
    { name: 'Chust', aliases: ['chust', 'чуст', 'чўст', 'чуст', 'чист', 'chist', 'чуcт', 'чўсд', 'чуcд', 'чуст'], lat: 41.0003, lng: 71.2333 },
    { name: 'Pop', aliases: ['pop', 'поп', 'пап', 'пўп', 'пoп', 'поп'], lat: 40.8833, lng: 71.1000 },
    { name: 'Kosonsoy', aliases: ['kosonsoy', 'касансай', 'kasansay', 'косонсой', 'касансой', 'косансой', 'кассансай', 'касонсой', 'kosonsay', 'касансоі', 'касонсай', 'кассонсой'], lat: 41.2350, lng: 71.5400 },
    { name: 'Chortoq', aliases: ['chortoq', 'чартак', 'chartak', 'chortak', 'чортоқ', 'чортак', 'чартоқ', 'чортік', 'чартак', 'чартік', 'чортоқ'], lat: 41.0667, lng: 71.5833 },
    { name: 'Mingbuloq', aliases: ['mingbuloq', 'мингбулак', 'mingbulak', 'мингбулоқ', 'мингбулақ', 'мінгбулак', 'мінгбулоқ', 'мингбулік', 'мингбулок', 'mingbulok', 'мингбулоқ'], lat: 41.1167, lng: 70.8500 },
    { name: 'Norin', aliases: ['norin', 'нарын', 'naryn', 'норін', 'норин', 'нарин', 'narin', 'норін', 'нарын'], lat: 41.0833, lng: 71.3333 },
    { name: "To'raqo'rg'on", aliases: ["to'raqo'rg'on", 'турақурган', 'turaqorgon', 'turakurgan', 'тўрақўрғон', 'торақоргон', 'тўракўрғон', 'турақургон', 'турокургон', 'turakurgon', 'тўрақўрғін', 'торакоргон', 'тўроқўрғон', 'turaqurgon'], lat: 41.0500, lng: 71.5167 },
    { name: "Uchqo'rg'on", aliases: ["uchqo'rg'on", 'учкурган', 'uchqorgon', 'uchkurgan', 'учқўрғон', 'учқоргон', 'учкургон', 'учкўрғон', 'учқоргон', 'uchkurgon', 'учкурғон', 'учкургін', 'учқўрғін'], lat: 41.1167, lng: 71.0500 },
    { name: "Yangiqo'rg'on", aliases: ["yangiqo'rg'on", 'янгикурган', 'yangiqorgon', 'yangikurgan', 'янгиқўрғон', 'янгиқоргон', 'янгикургон', 'янгікурган', 'янгікўрғон', 'yangikurgon', 'янгикурғон', 'янгикургін', 'янгіқоргон'], lat: 41.2000, lng: 71.7167 },
    { name: 'Uychi', aliases: ['uychi', 'учи', 'уччи', 'уйчи', 'уйчі', 'ўйчи', 'uychi', 'ўйчі', 'уйче'], lat: 41.0830, lng: 71.1670 },
    // --- Samarqand viloyati ---
    { name: 'Kattaqorgon', aliases: ['kattaqorgon', 'каттакурган', 'kattakurgan', 'каттақўрғон', 'каттакоргон', 'каттақоргон', 'каттакургон', 'каттақургон', 'каттақўрғін', 'каттакурғон', 'каттакоргін', 'kattakurgon', 'kattaqurgon', 'каттакўрғон', 'қаттақўрғон', 'каттақорғон', 'kataqurgon', 'катақурғон', 'катакургон', 'katakurgon', 'kattaquron', 'каттақурон', 'каттакурон', 'kattakuron', 'каттакуран', 'каттакўрон', 'kattaqurон'], lat: 39.9000, lng: 66.2567 },
    { name: 'Urgut', aliases: ['urgut', 'ургут', 'ургуд', 'ўргут', 'ургат', 'ургіт', 'ургут', 'urgud', 'ургўт'], lat: 39.4000, lng: 67.2333 },
    { name: "Bulung'ur", aliases: ["bulung'ur", 'булунгур', 'bulungur', 'булунғур', 'булуңғўр', 'булуңгур', 'булонгур', 'булунгір', 'булунғір', 'булінгур', 'булуngur', 'булнгир', 'булнґир', 'булнгур', 'bulungor', 'булунгор', 'bulunfur', 'булунфур', 'булунфір', 'bulingir', 'булинғир'], lat: 39.7667, lng: 67.2667 },
    { name: 'Toyloq', aliases: ['toyloq', 'тойлок', 'taylak', 'тойлоқ', 'тойлак', 'тайлок', 'тойлік', 'toyloq', 'тойлок', 'тойлоқ'], lat: 39.5167, lng: 67.1833 },
    { name: 'Ishtixon', aliases: ['ishtixon', 'иштихан', 'ishtikhan', 'иштиҳон', 'иштихон', 'іштіхон', 'иштіхон', 'иштихін', 'иштехон', 'ishtihon', 'иштихан', 'иштихён'], lat: 39.9167, lng: 66.5333 },
    { name: 'Jomboy', aliases: ['jomboy', 'джамбай', 'jambay', 'жомбой', 'жомбай', 'джамбой', 'жамбай', 'жомбой', 'жомбій', 'жамбой', 'жамбій', 'джамбої', 'jonboy', 'жонбой', 'жонбай', 'jamboy', 'жамбой'], lat: 39.7167, lng: 67.1833 },
    { name: 'Narpay', aliases: ['narpay', 'нарпай', 'нарпой', 'нарпій', 'нарпей', 'нарпой', 'нарпай'], lat: 39.9167, lng: 66.5833 },
    { name: 'Nurobod', aliases: ['nurobod', 'нурабад', 'nurabad', 'нуробод', 'нуробот', 'нурабат', 'нурабід', 'нуробід', 'нуробод', 'nurobot', 'nurabat'], lat: 39.5500, lng: 67.5667 },
    { name: 'Oqdaryo', aliases: ['oqdaryo', 'акдарья', 'akdarya', 'оқдарё', 'оқдарья', 'акдарё', 'oqdare', 'акдаря', 'оқдаря', 'оқдарьо', 'акдарє', 'акдарьо'], lat: 39.6167, lng: 67.0333 },
    { name: "Pastdarg'om", aliases: ["pastdarg'om", 'пастдаргом', 'pastdargom', 'пастдарғом', 'постдаргом', 'пастдаргам', 'пастдарғам', 'пастдарғім', 'пастдаргім', 'пасдаргом', 'pastdarg\'om'], lat: 39.5667, lng: 66.7167 },
    { name: 'Payariq', aliases: ['payariq', 'пайарик', 'payarik', 'пайариқ', 'пайарық', 'пайорик', 'пайоріқ', 'пайариқ', 'пайорық', 'паярик', 'паяриқ'], lat: 39.8333, lng: 67.0333 },
    { name: 'Koshrabot', aliases: ['koshrabot', 'кошрабат', 'кўшработ', 'қўшработ', 'koshrabat', 'qoshrabot', 'қўшработ', 'қошработ', 'кошработ', 'кушработ', 'кошработ', 'qoshrabat', 'кошрабод', 'кошрабід'], lat: 39.9667, lng: 66.0667 },
    { name: 'Tavaksoy', aliases: ['tavaksoy', 'товоксой', 'товаксой', 'tavoksoy', 'tavaksay', 'товоксай', 'товаксай', 'тавоксой', 'тавоксай', 'тавоқсой'], lat: 39.5833, lng: 67.0833 },
    { name: 'Ortasaroy', aliases: ['ortasaroy', 'ортасарой', 'ортасарай', 'ортосарой', 'ortasaray', 'ортасаройдан', 'ортасорой'], lat: 39.7500, lng: 67.1000 },
    { name: 'Hazrati Dovud', aliases: ['hazrati dovud', 'хазрат довут', 'хазрати довут', 'хазрати довуд', 'xazrat dovut', 'hazrat dovut', 'hazrat dovud', 'ҳазрати довуд', 'ҳазрати довут', 'хазрати довід', 'хазрат давут', 'хазрат довуд', 'ҳазрат довут', 'ҳазрат довуд'], lat: 39.6833, lng: 67.3167 },
    { name: 'Sobir Rahimov', aliases: ['sobir rahimov', 'собирахимов', 'собир рахимов', 'sobirrohimov', 'sobirahimov', 'собір рахімов', 'собир роҳимов', 'собирраҳимов', 'собир рахимов'], lat: 41.3500, lng: 69.2800 },
    { name: "Bo'g'dod", aliases: ["bo'g'dod", 'богдод', 'богдот', 'bogdod', 'bogdot', 'бўғдод', 'бўғдот', 'бўғдід', 'бугдод', 'бўгдод', 'бугдот', 'bogdod', 'бўгдот'], lat: 41.0833, lng: 69.5167 },
    { name: 'Loyish', aliases: ['loyish', 'лоиш', 'лоеиш', 'loyishdan', 'лойиш'], lat: 39.6800, lng: 66.8000 },
    // --- Buxoro viloyati ---
    { name: 'Kogon', aliases: ['kogon', 'каган', 'kagan', 'коган', 'когон', 'каган', 'кагон', 'когін', 'когон', 'кагін'], lat: 39.7278, lng: 64.5514 },
    { name: 'Shofirkon', aliases: ['shofirkon', 'шафиркан', 'shafirkan', 'шофиркон', 'шофирқон', 'шафіркан', 'шофіркон', 'шафиркон', 'шафирқон', 'шофрікон', 'шофіркан', 'shofirqon', 'шофірқон'], lat: 40.1197, lng: 64.5017 },
    { name: 'Romitan', aliases: ['romitan', 'ромитан', 'ромитон', 'ромітан', 'ромітон', 'ромитін', 'румитан', 'romitón', 'ромитан'], lat: 39.9333, lng: 64.3833 },
    { name: "G'ijduvon", aliases: ["g'ijduvon", 'гиждуван', 'gijduvon', 'gijduvan', 'гиждувон', 'ғижжувон', 'ғижжуван', 'ғиждувон', 'гиждувін', 'гіждуван', 'ғижд', 'гижд', 'гиждувін', 'ғижджувон', 'гижжувон', 'gijduvón', 'gijdivon', 'гиждивон', 'ғиждивон', 'ijduvon', 'ижжувон', 'ижд', 'gijdonvon', 'гиждонвон'], lat: 40.1033, lng: 64.6817 },
    { name: 'Vobkent', aliases: ['vobkent', 'вабкент', 'вобкент', 'вобкенд', 'вабкенд', 'вобкінт', 'вабкінт', 'вобкант', 'вабкант', 'вобкент', 'вобкент'], lat: 40.0333, lng: 64.5167 },
    { name: 'Jondor', aliases: ['jondor', 'жондор', 'zhondor', 'жандор', 'жондар', 'жондір', 'жондір', 'жондор', 'жондўр', 'жандар', 'джондор'], lat: 39.7333, lng: 64.2833 },
    { name: 'Olot', aliases: ['olot', 'алат', 'олот', 'олат', 'алот', 'алід', 'олід', 'олод', 'алад', 'олод'], lat: 39.5500, lng: 64.0500 },
    { name: 'Peshku', aliases: ['peshku', 'пешку', 'пішку', 'пешко', 'пешкў', 'пешку', 'пешки', 'пишку'], lat: 39.5333, lng: 63.5667 },
    { name: 'Qorovulbozor', aliases: ['qorovulbozor', 'каракуль', 'karakul', 'qoravulbozor', 'қоровулбозор', 'коровулбозор', 'каравулбазар', 'коравулбозор', 'қоравулбозор', 'коровулбазар', 'каравулбозор', 'qorovulbazar'], lat: 39.5833, lng: 64.2000 },
    { name: "Qorako'l", aliases: ["qorako'l", 'каракуль', 'qorakol', 'қоракўл', 'қоракол', 'коракол', 'коракўл', 'каракул', 'коракул', 'қорокўл', 'караколь', 'коракуль', "qarako'l", 'qarakol', 'қаракўл', 'қаракол', 'каракол', 'караколь'], lat: 39.5167, lng: 63.8500 },
    // --- Navoiy viloyati ---
    { name: 'Zarafshon', aliases: ['zarafshon', 'зарафшан', 'zarafshan', 'зарафшон', 'зарофшон', 'зарафшін', 'зарафшон', 'заравшон', 'заравшан', 'заруфшон', 'zaravshon', 'zaravshan', 'зарафшін'], lat: 41.5750, lng: 64.1850 },
    { name: 'Gazli', aliases: ['gazli', 'газли', 'газлі', 'ғазли', 'ғазлі', 'газлы', 'газлий', 'ғазлий'], lat: 40.1333, lng: 63.4500 },
    { name: 'Uchquduq', aliases: ['uchquduq', 'учкудук', 'uchkuduk', 'учқудуқ', 'учқудік', 'учкудық', 'учқудук', 'учкідук', 'учкудіқ', 'учкўдук', 'учкудуқ'], lat: 42.1583, lng: 63.5567 },
    { name: 'Muborak', aliases: ['muborak', 'мубарек', 'mubarek', 'муборак', 'мубарак', 'мўборак', 'мубарік', 'муборік', 'муборок', 'мубарок', 'мубарік'], lat: 39.1728, lng: 65.2589 },
    { name: 'Nurota', aliases: ['nurota', 'нурата', 'nurata', 'нурото', 'нўрота', 'нуроta', 'нурота', 'нурато', 'нурото', 'нўрато'], lat: 40.5667, lng: 65.6833 },
    { name: 'Xatirchi', aliases: ['xatirchi', 'хатырчи', 'khatirchi', 'хатирчи', 'ҳатирчи', 'хатірчі', 'хатирчі', 'хатырчы', 'ҳатирчі', 'хатирчи', 'hatirchi', 'xatrchi', 'хатрчи', 'хатрчі', 'hatrchi'], lat: 40.2167, lng: 65.7667 },
    { name: 'Qiziltepa', aliases: ['qiziltepa', 'кызылтепа', 'kyzyltepa', 'кизилтепа', 'қизилтепа', 'кізілтепа', 'қизилтіпа', 'кизилтіпа', 'қизилтепо', 'кизилтепо', 'кызылтіпа', 'қизілтепа'], lat: 40.0333, lng: 65.2833 },
    { name: 'Konimex', aliases: ['konimex', 'конимех', 'konimekh', 'конимех', 'конимекс', 'конімех', 'конімекс', 'конимех', 'конимекх', 'кўнимех', 'конімеx'], lat: 40.2833, lng: 65.0167 },
    { name: 'Navbahor', aliases: ['navbahor', 'навбахор', 'навбаҳор', 'навбахар', 'навбахір', 'навбохор', 'навбаhor', 'навбаҳір', 'навбаxор', 'навбохар'], lat: 40.0833, lng: 65.4333 },
    { name: 'Tomdi', aliases: ['tomdi', 'тамды', 'tamdy', 'томди', 'тамді', 'томді', 'тамди', 'тамдi', 'тўмди', 'тамды'], lat: 41.3333, lng: 64.7167 },
    // --- Qashqadaryo viloyati ---
    { name: 'Shahrisabz', aliases: ['shahrisabz', 'шахрисабз', 'shaxrisabz', 'шаҳрисабз', 'шахрісабз', 'шахрисабс', 'шахрісабс', 'shahrisabs', 'шахрисобз', 'шаҳрисобз', 'шахрисабіз', 'шахрисавз', 'шахрісобз', 'шахрисабез', 'шахрісабез', 'shahrisabez', 'shaxrisabez', 'shaxrisabiz', 'шахрисабиз'], lat: 39.0547, lng: 66.8297 },
    { name: 'Kitob', aliases: ['kitob', 'китаб', 'kitab', 'ктоб', 'китоб', 'кітоб', 'кітаб', 'кітоб', 'китап', 'китоп', 'kітob', 'китід', 'kitop'], lat: 39.1331, lng: 66.8578 },
    { name: 'Qamashi', aliases: ['qamashi', 'камаши', 'qamshi', 'камши', 'qamasi', 'қамаши', 'камоши', 'қамоши', 'камашы', 'қамошы', 'камаші', 'қамаші', 'камашій', 'қамашій'], lat: 38.8333, lng: 65.6333 },
    { name: "G'uzor", aliases: ["g'uzor", 'гузар', 'guzor', 'guzar', 'ғузор', 'ғузар', 'гузір', 'ғузір', 'гузер', 'ғузер', 'гўзор', 'ғўзор', 'гузор', 'кузор', 'кузар'], lat: 38.6167, lng: 66.2500 },
    { name: 'Beshkent', aliases: ['beshkent', 'бешкент', 'бешкенд', 'бешкант', 'бешкінт', 'бишкент', 'бішкент', 'бешкенд', 'beshkend', 'бешкант'], lat: 38.7333, lng: 65.9167 },
    { name: "Yakkabog'", aliases: ["yakkabog'", 'яккабаг', 'yakkabog', 'yakkabag', 'яккабоғ', 'яккабағ', 'яккабок', 'яккабак', 'яккабоғ', 'яккабіг', 'яккобоғ', 'яққабоғ', 'яккабог', 'яккабаг', 'яккобог'], lat: 38.9833, lng: 66.3167 },
    { name: 'Koson', aliases: ['koson', 'касан', 'kasan', 'қосон', 'касон', 'қасон', 'қасан', 'косон', 'косін', 'касін', 'косін', 'касін', 'kason', 'касон'], lat: 39.0500, lng: 65.5167 },
    { name: 'Nishon', aliases: ['nishon', 'нишан', 'nishan', 'нішон', 'нішан', 'нишін', 'нишон', 'нішін', 'нишін', 'нишон', 'нышан'], lat: 38.5333, lng: 65.5333 },
    { name: 'Dehqonobod', aliases: ['dehqonobod', 'дехканабад', 'dehkanabad', 'дехконобод', 'дехканабот', 'дехканобод', 'деҳқонобод', 'деҳқонобот', 'дехконобот', 'дехканабод', 'дехканобот', 'dehqonobot', 'дехқонобод', 'дехқонобот', 'дехконабод', 'дехконабат', 'dehkonobod', 'dehkonabad'], lat: 38.3500, lng: 66.5000 },
    { name: 'Chiroqchi', aliases: ['chiroqchi', 'чиракчи', 'chirakchi', 'чироқчи', 'чирақчи', 'чіроқчі', 'чіракчі', 'чирокчи', 'чирақчі', 'чиракчы', 'чіракчы', 'chrokch', 'чрокч'], lat: 38.9667, lng: 66.5667 },
    { name: 'Mirishkor', aliases: ['mirishkor', 'миришкор', 'миришкар', 'мирішкор', 'мирішкар', 'миришкір', 'мирішкір', 'міришкор', 'мирышкор', 'миришкор', 'mirshkor', 'міршкор', 'міршкар', 'мирш'], lat: 38.8500, lng: 65.4000 },
    { name: 'Kasbi', aliases: ['kasbi', 'касби', 'қасби', 'касбі', 'қасбі', 'касбий', 'қасбий'], lat: 38.9500, lng: 65.4500 },
    { name: 'Qashqadaryo', aliases: ['qashqadaryo', 'кашкадарья', 'кашкадарё', 'қашқадарё', 'kashkadarya', 'кашкадар', 'қашқадарьо', 'кашкадарьо', 'кашкадір', 'қашқадаря', 'кошқадарё', 'кашкадарья', 'қошқадарё', 'кашкадарё', 'кашкадарйо', 'кашкадарега', 'кашкадарйога', 'кашкадарийо', 'kashqadaryo', 'qashqadariya', 'кошкадарья', 'кашкадаре', 'кашкадарьога', 'кашкадареога', 'кашкадарео', 'кашқадарё', 'qashqadarе', 'кашкадарйа', 'qashqadryo', 'кашкадрё', 'қашқадрё', 'кашкадрёо', 'кашкадрйо', 'qawqadaryo', 'qashaqadaryo'], lat: 38.8606, lng: 65.7981 },
    { name: 'Esaboy', aliases: ['esaboy', 'эсабой', 'эсабій', 'эсобой', 'есабой', 'есобой', 'исабой', 'эсабай'], lat: 38.4500, lng: 65.8000 },
    { name: 'Chiyal', aliases: ['chiyal', 'чиял', 'чіял', 'chiyol', 'чийал', 'чиёл', 'чийол'], lat: 38.5500, lng: 66.0500 },
    { name: 'Talimarjon', aliases: ['talimarjon', 'талимаржон', 'талимарджан', 'талімарджан', 'талимаржан', 'talimarjan', 'talimarjan', 'талимаржін', 'талімаржон'], lat: 38.4300, lng: 65.6200 },
    // --- Surxondaryo viloyati ---
    { name: 'Surxondaryo', aliases: ['surxondaryo', 'сурхондарё', 'сурхондарйо', 'сурхондаря', 'сурхандарья', 'сурхондарь', 'surxandarya', 'surkhandarya', 'сурхандаре', 'сурхан', 'сурхандарю', 'сурхондарю', 'сурхондарьо', 'surxondare', 'сурхондарьё', 'сурхон', 'сурхонд', 'surhondaryo', 'surhon', 'surxon', 'сурхандарё', 'сурхондарйа', 'сурхандарйо', 'surxandaryo', 'сурханд', 'сурхандаре', 'сурхандарюо', 'сурхондарюо', 'сурхандарьо', 'surxandaryuo', 'surhandaryo', 'сурхандарьо', 'surxodaryo', 'сурхударё', 'сурхударьо', 'сурхондаре', 'сурхадарйо', 'surgondaryo', 'surxandayo'], lat: 37.9400, lng: 67.5700 },
    { name: 'Denov', aliases: ['denov', 'денов', 'денау', 'denau', 'дінов', 'дінав', 'денав', 'денів', 'дєнов', 'дено', 'дэнов', 'дінау', 'динов', 'дінов', 'dinov', 'deynov', 'дейнов', 'дейнав', 'dеynov', 'dinav', 'динав'], lat: 38.2714, lng: 67.8936 },
    { name: 'Boysun', aliases: ['boysun', 'байсун', 'бойсун', 'baysun', 'бойсін', 'байсін', 'бойсўн', 'байсўн', 'бойсен', 'байсен', 'бойсон', 'бойсан'], lat: 38.2019, lng: 67.2000 },
    { name: "Sho'rchi", aliases: ["sho'rchi", 'шурчи', 'shurchi', 'shorchi', 'шўрчи', 'шўрчі', 'шорчи', 'шорчі', 'шурчі', 'шурч', 'шорч', 'шурчы'], lat: 37.9833, lng: 67.7833 },
    { name: "Jarqo'rg'on", aliases: ["jarqo'rg'on", 'джаркурган', 'jarqorgon', 'jarkurgan', 'жарқўрғон', 'жарқоргон', 'жаркургон', 'жарқурғон', 'джарқурғон', 'жаркурган', 'жаркургін', 'жаркурғон', 'жарқоргін', 'жарқўрғін', 'джаркургон', 'жаркоргон', 'жаркоргін', 'jarkorgon', 'жаркорган'], lat: 37.5000, lng: 67.4167 },
    { name: 'Sherobod', aliases: ['sherobod', 'шерабад', 'sherabad', 'шеробод', 'шерабод', 'шеробот', 'шерабат', 'шерабід', 'шеробід', 'шеробат', 'sherobot', 'sherabat', 'шэробод', 'шэрабад', 'sherabot', 'шеработ'], lat: 37.6500, lng: 67.0167 },
    { name: 'Oltinsoy', aliases: ['oltinsoy', 'алтынсай', 'altinsoy', 'олтинсой', 'алтинсой', 'олтинсай', 'олтінсой', 'алтынсой', 'олтинсій', 'алтинсай', 'олтинсай'], lat: 38.3333, lng: 67.6667 },
    { name: 'Muzrobod', aliases: ['muzrobod', 'музрабад', 'muzrabad', 'музробод', 'музробот', 'музрабат', 'музрабід', 'музробід', 'музробат', 'muzrobot', 'muzrabat', 'мўзробод', 'мўзрабод', 'музрабод'], lat: 38.1833, lng: 67.4333 },
    { name: 'Qiziriq', aliases: ['qiziriq', 'кизирик', 'kizirik', 'қизириқ', 'кізірік', 'кизирық', 'қизирык', 'кизирік', 'қизирік', 'кизирич', 'кизирек'], lat: 37.7500, lng: 67.2667 },
    { name: 'Sariosiy', aliases: ['sariosiy', 'сариасия', 'sariasia', 'сариосий', 'сариасий', 'сарі-осий', 'сариосиё', 'сариасиё', 'сариосій', 'сариосія', 'сариасія', 'сариосе', 'саросийо', 'саросиё', 'саросий', 'sarosiy', 'sarosiyo'], lat: 37.3667, lng: 67.8000 },
    { name: 'Angor', aliases: ['angor', 'ангор', 'ангір', 'ангар', 'ангор', 'ангўр', 'онгор', 'ангор'], lat: 37.5167, lng: 67.6667 },
    { name: 'Pachkamar', aliases: ['pachkamar', 'пачкамар', 'пачкамор', 'pachkamor', 'пачқамар'], lat: 37.4700, lng: 67.0200 },
    { name: 'Bandixon', aliases: ['bandixon', 'бандихан', 'bandikhan', 'бандихон', 'бандіхон', 'бандіхан', 'бандихін', 'бандехан', 'бандехон', 'bandihon', 'бандыхан', 'бандихін'], lat: 37.8667, lng: 67.5333 },
    { name: 'Uzun', aliases: ['uzun', 'узун', 'ўзун', 'узін', 'ўзін', 'узин', 'узун'], lat: 38.0833, lng: 67.7333 },
    { name: "Kumqo'rg'on", aliases: ["kumqo'rg'on", 'кумкурган', 'kumqorgon', 'kumkurgan', 'кумқўрғон', 'кумқоргон', 'кумкургон', 'кумқургон', 'кумкурғон', 'кумқўрғін', 'кумкургін', 'кўмқўрғон', 'kumkurgon', 'кумқоргін'], lat: 37.7833, lng: 67.7167 },
    // --- Jizzax viloyati ---
    { name: "G'allaorol", aliases: ["g'allaorol", 'галляарал', 'gallaorol', 'gallaaral', 'ғаллаорол', 'галлаорол', 'галлаарал', 'ғалаорол', 'галлаорол', 'ғаллаарал', 'gallaarol', 'галларол', 'ғалларол'], lat: 40.4833, lng: 68.1167 },
    { name: 'Mirzachul', aliases: ['mirzachul', 'мирзачуль', 'mirzachol', 'мирзачўл', 'мирзачол', 'мирзачул', 'мірзачуль', 'мирзочул', 'мирзочўл', 'мирзачіл', 'мирзачул'], lat: 40.3333, lng: 67.9667 },
    { name: 'Arnasoy', aliases: ['arnasoy', 'арнасай', 'arnasay', 'арносой', 'арнасій', 'арнасой', 'арнасій', 'арнасай', 'орнасой', 'орнасай'], lat: 40.6167, lng: 68.2000 },
    { name: 'Baxmal', aliases: ['baxmal', 'бахмал', 'бахмол', 'баxмал', 'бахмал', 'бахмол', 'бахмел', 'бахміл', 'бахмаl'], lat: 39.8833, lng: 68.2833 },
    { name: "Do'stlik", aliases: ["do'stlik", 'дустлик', 'dustlik', 'dostlik', 'дўстлик', 'дўстлік', 'достлик', 'достлік', 'дустлік', 'достлык', 'дўстлық', 'дустлык'], lat: 40.5500, lng: 68.0500 },
    { name: 'Forish', aliases: ['forish', 'фариш', 'farish', 'фориж', 'фориш', 'форіш', 'фаріш', 'форіш', 'форишь', 'фариж', 'фариш'], lat: 40.3833, lng: 68.4500 },
    { name: 'Paxtakor', aliases: ['paxtakor', 'пахтакор', 'пахтакор', 'пахтакар', 'пахтокор', 'пахтакір', 'pahtakor', 'пахтакор', 'поxтакор', 'паxтакор', 'paxtokor'], lat: 40.3000, lng: 67.6500 },
    { name: 'Yangiobod', aliases: ['yangiobod', 'янгиабад', 'yangiabad', 'янгиобод', 'янгіобод', 'янгіабад', 'янгиобот', 'янгиабат', 'yangiobot', 'yangiabat', 'янгиобід', 'янгіобід'], lat: 39.8500, lng: 68.4000 },
    { name: 'Zafarobod', aliases: ['zafarobod', 'зафарабад', 'zafarabad', 'зафаробод', 'зафаробот', 'зафарабат', 'зафаробід', 'зафарабід', 'zafarobot', 'zafarabat', 'зафоробод', 'зафоробот'], lat: 40.5333, lng: 68.5167 },
    { name: 'Zarbdor', aliases: ['zarbdor', 'зарбдар', 'zarbdar', 'зарбдор', 'зарбдір', 'зарбдор', 'зарбдор', 'зарбдор', 'зарбдор'], lat: 40.6167, lng: 68.4333 },
    { name: 'Zomin', aliases: ['zomin', 'замин', 'zamin', 'зомин', 'зомін', 'замін', 'зомін', 'замын', 'зоmin', 'зомин'], lat: 39.9500, lng: 68.4000 },
    { name: 'Dashtobod', aliases: ['dashtobod', 'даштобод', 'даштабад', 'dashtabad', 'даштобот', 'даштабат', 'дашт', 'даштобід', 'даштабід', 'даштобад', 'доштобод', 'доштабад'], lat: 40.1200, lng: 67.9300 },
    // --- Sirdaryo viloyati ---
    { name: 'Sirdaryo', aliases: ['sirdaryo', 'сырдарья', 'сирдарё', 'syrdarya', 'sirdarya', 'сирдарьо', 'сирдарья', 'сирдарё', 'сірдарё', 'сырдаря', 'сирдаря', 'сирдарьё', 'сирдорё', 'сырдарьо', 'сирдорьо', 'сирдарйо', 'сирдарйога', 'сирдаре', 'сирдарьога', 'сирдайо', 'sirdarе', 'сирдайё', 'сирдорья', 'сиржарйо', 'сирдрё', 'sirdsryo'], lat: 40.8500, lng: 68.6667 },
    { name: 'Boyovut', aliases: ['boyovut', 'баяут', 'bayavut', 'bayaut', 'boyavud', 'boyavut', 'бояуд', 'бояут', 'бойовут', 'бояўт', 'бояівут', 'бояуть', 'бояўд', 'boyovud', 'бойовуд', 'бойовід', 'байавут', 'байовут', 'баёвут', 'bayovut', 'bayavud', 'бойавут', 'бойовуд', 'баявут'], lat: 40.3667, lng: 68.7833 },
    { name: 'Hovos', aliases: ['hovos', 'хавос', 'xovos', 'хавас', 'khavas', 'ҳовос', 'ховос', 'хавіс', 'ҳавос', 'хавос', 'ховас', 'ҳавас', 'хавас', 'hovos'], lat: 40.2500, lng: 68.9167 },
    { name: 'Mirzaobod', aliases: ['mirzaobod', 'мирзаабад', 'mirzaabad', 'мирзаобод', 'мирзаобот', 'мирзаабат', 'мирзаобід', 'мирзаабід', 'mirzaobot', 'mirzaabat', 'мирзообод', 'мирзообот'], lat: 40.7167, lng: 68.5833 },
    { name: 'Oqoltin', aliases: ['oqoltin', 'акалтин', 'akaltin', 'оқолтин', 'оқолтін', 'акалтін', 'околтин', 'акалтын', 'околтин', 'okoltin', 'акалтин'], lat: 40.6500, lng: 68.3833 },
    { name: 'Sardoba', aliases: ['sardoba', 'сардоба', 'сардобо', 'сардабо', 'сардоба', 'сардоб', 'сардоба'], lat: 40.1667, lng: 68.3833 },
    { name: 'Sayxunobod', aliases: ['sayxunobod', 'сайхунабад', 'saykhunabad', 'сайхунобод', 'сайхунобот', 'сайхунабат', 'сайхунобід', 'сайхунабід', 'sayxunobot', 'saykhunabat', 'сайхўнобод', 'сайхўнабад'], lat: 40.6000, lng: 68.8667 },
    { name: 'Mirbozor', aliases: ['mirbozor', 'мирбозор', 'мирбазар', 'мирбозір', 'мирбазір', 'мирбозар', 'мирбозор', 'мірбозор', 'мірбазар', 'мирбозір', 'mirbazor', 'мирбазор', 'мирбозір', 'мирбазір'], lat: 40.5170, lng: 68.3170 },
    { name: 'Yangiyer', aliases: ['yangiyer', 'янгиер', 'янгийер', 'янгиёр', 'yangiеr', 'янгіер', 'янгіёр', 'yangier', 'янгйер', 'янгіер'], lat: 40.2700, lng: 68.8200 },
    { name: 'Begavot', aliases: ['begavot', 'бегавот', 'бегават', 'begavat', 'бегавід', 'бегавод', 'бегавут', 'begavut'], lat: 40.3800, lng: 68.7000 },
    // --- Xorazm viloyati ---
    { name: 'Xorazm', aliases: ['xorazm', 'хоразм', 'хорезм', 'khorezm', 'horazm', 'хоразим', 'хорезим', 'хорізм', 'хорезім', 'хоразім', 'хорезм', 'хоразм', 'хорозм', 'хорізім', 'xorazim', 'horazim', 'khorazm', 'khorazim', 'харазм', 'харзим', 'хоразимг', 'harazim', 'хоразимдсн'], lat: 41.5500, lng: 60.6300 },
    { name: 'Xiva', aliases: ['xiva', 'хива', 'khiva', 'ҳива', 'хіва', 'хива', 'хыва', 'hiva', 'хіво', 'хиво'], lat: 41.3786, lng: 60.3639 },
    { name: 'Pitnak', aliases: ['pitnak', 'питнак', 'pitnaq', 'пітнак', 'питнақ', 'пітнақ', 'питнок', 'питнік', 'питнак'], lat: 41.3450, lng: 60.6483 },
    { name: 'Xonqa', aliases: ['xonqa', 'ханка', 'xanka', 'khanka', 'хонқа', 'хонка', 'хонқо', 'хонко', 'хінка', 'ханко', 'хонка'], lat: 41.5167, lng: 60.7667 },
    { name: "Bog'ot", aliases: ["bog'ot", 'багат', 'bogot', 'bagat', 'боғот', 'боғат', 'богот', 'богат', 'бағат', 'бағот', 'богід', 'бағід', 'богод', 'богад'], lat: 41.6167, lng: 60.7667 },
    { name: 'Gurlan', aliases: ['gurlan', 'гурлан', 'gurlen', 'ғурлан', 'гурлон', 'ғурлон', 'гурлін', 'ғурлін', 'гурлен', 'ғурлен', 'гурлан'], lat: 41.5833, lng: 60.6500 },
    { name: 'Hazorasp', aliases: ['hazorasp', 'хазарасп', 'hazarasp', 'ҳазорасп', 'хозорасп', 'хазарасп', 'хозорасп', 'хазарасб', 'ҳазарасп', 'хазороcп', 'хазарісп', 'хозарасп', 'xazarasb', 'хазарасб', 'хозарасб', 'хозораcб'], lat: 41.3333, lng: 61.0667 },
    { name: "Qo'shko'pir", aliases: ["qo'shko'pir", 'кошкупыр', 'qoshkopir', 'koshkupir', 'қўшкўпир', 'қошкопир', 'кошкупір', 'қўшкўпір', 'қошкўпир', 'кўшкўпир', 'кошкопир', 'кушкупир', 'кошкупир', 'qoshkupir'], lat: 41.5333, lng: 60.3167 },
    { name: 'Shovot', aliases: ['shovot', 'шават', 'shavat', 'шовот', 'шовід', 'шавід', 'шовод', 'шавад', 'шавот', 'шовот', 'шавот', 'шовід'], lat: 41.6167, lng: 60.5167 },
    { name: 'Yangiariq', aliases: ['yangiariq', 'янгиарык', 'yangiarik', 'янгиариқ', 'янгіарық', 'янгіарік', 'янгиарик', 'янгіариқ', 'янгиорик', 'янгиорық', 'янгиарік'], lat: 41.3500, lng: 60.6500 },
    { name: 'Yangibozor', aliases: ['yangibozor', 'янгибазар', 'yangibazar', 'янгибозор', 'янгибозір', 'янгібозор', 'янгібазар', 'янгибозар', 'янгибазір', 'янгибозор'], lat: 41.7500, lng: 60.7667 },
    { name: "Tuproqqal'a", aliases: ["tuproqqal'a", 'топраккала', 'tuproqqala', 'toprakkala', 'тупроққала', 'тупроққал\'а', 'тупроккала', 'тупрокқала', 'топраккало', 'тупроққало', 'тупроқкала', 'тупроккала'], lat: 41.6167, lng: 60.7000 },
    // --- Qoraqalpog'iston ---
    { name: "Qo'ng'irot", aliases: ["qo'ng'irot", 'кунград', 'кунгирот', 'қўнғирот', 'kungrad', 'kungirot', 'qongirot', 'кунгрод', 'кунгирод', 'кўнғирот', 'кунгірот', 'қонғирот', 'кунгирот', 'қўнғірот', 'кунграт', 'кунгират', 'қўнғирод', 'конгирот', 'qungirot', 'кунгирот'], lat: 43.0761, lng: 58.6908 },
    { name: 'Turtkul', aliases: ['turtkul', 'турткуль', "to'rtko'l", 'тўрткўл', 'тўрткол', 'торткол', 'тўрткуль', 'турткол', 'торткуль', 'тўртқўл', 'тўрткул', 'тўрткіл', 'турткіл', 'турткул', 'торткул', 'turtkol', 'tortkul', 'tortkol', 'turkul', 'туркул', 'туркуль'], lat: 41.5500, lng: 60.9167 },
    { name: 'Beruniy', aliases: ['beruniy', 'беруни', 'берунی', 'берунів', 'берунії', 'берунии', 'берунний', 'беруній', 'берўний', 'берунай'], lat: 41.6833, lng: 60.7500 },
    { name: 'Chimboy', aliases: ['chimboy', 'чимбай', 'chimbay', 'чимбой', 'чімбой', 'чімбай', 'чимбій', 'чімбій', 'чимбай', 'чимбей'], lat: 42.9333, lng: 59.7667 },
    { name: 'Mangit', aliases: ['mangit', 'манғит', 'мангит', 'mangit', 'мангт', 'манг\'ит', 'мангіт', 'мангід', 'mangut', 'мангут'], lat: 42.1167, lng: 60.0667 },
    { name: "Ellikqal'a", aliases: ["ellikqal'a", 'элликкала', 'ellikkala', 'ellikqala', 'элликқала', 'елліққала', 'элликқал\'а', 'елликкала', 'еллікқала', 'эллік-кала', 'элликкало', 'элликала'], lat: 41.7500, lng: 61.0667 },
    { name: 'Kegeyli', aliases: ['kegeyli', 'кегейли', 'кегейлі', 'кегайли', 'кегейлі', 'кегейлы', 'кегейлий', 'кагейли', 'кегейлі'], lat: 42.7833, lng: 59.6000 },
    { name: "Mo'ynoq", aliases: ["mo'ynoq", 'муйнак', 'moynoq', 'muynak', 'мўйноқ', 'мойноқ', 'муйноқ', 'мўйнок', 'мойнок', 'муйнок', 'мўйнақ', 'муйнақ', 'муйнік'], lat: 43.7667, lng: 58.6833 },
    { name: "Qanliko'l", aliases: ["qanliko'l", 'канлыкуль', 'qanlikol', 'kanlikul', 'қанликўл', 'қанликол', 'канликол', 'қонликўл', 'канликуль', 'қанлікўл', 'канлыкўл', 'қанликул'], lat: 42.1000, lng: 59.3667 },
    { name: "Qorao'zak", aliases: ["qorao'zak", 'караузяк', 'qaraozak', 'karauzak', 'қораўзак', 'қораозак', 'караозак', 'қороўзак', 'караўзак', 'корозак', 'қараўзак', 'караузак', 'қораўзік'], lat: 42.5667, lng: 59.6333 },
    { name: 'Shumanay', aliases: ['shumanay', 'шуманай', 'шуманой', 'шуманій', 'шўманай', 'шуманай', 'шуманей', 'шуманой', 'шўманой'], lat: 42.7000, lng: 59.5333 },
    { name: "Taxtako'pir", aliases: ["taxtako'pir", 'тахтакупыр', 'taxtakopir', 'takhtakupir', 'тахтакўпир', 'тахтакопир', 'тахтакупір', 'тахтакўпір', 'тахтокўпир', 'тахтакўпир', 'тахтакопір', 'тахтакупир', 'tahtakopir'], lat: 42.5167, lng: 59.0167 },
    { name: "Xo'jayli", aliases: ["xo'jayli", 'ходжейли', 'xojayli', 'khodjeyli', 'хўжайли', 'хожайли', 'ходжайли', 'хўжайлі', 'ходжейлі', 'хожайлі', 'ходжейлий', 'хўжейли', 'хожейли', 'хўжайлий', 'худжайли', 'худжайли', 'худжейли', 'хўджайли', 'xujayli', 'xudjayli'], lat: 42.4000, lng: 59.4500 },
    { name: 'Amudaryo', aliases: ['amudaryo', 'амударья', 'амударё', 'амударьо', 'амударя', 'амўдарё', 'амударьё', 'амідарья', 'амудорьо', 'амўдарьо'], lat: 41.7000, lng: 60.8500 },
    { name: 'Borsakelmas', aliases: ['borsakelmas', 'борсакелмас', 'борсакелмос', 'борсакілмас', 'борсакелмес', 'борсакелмос', 'борсакелмас'], lat: 42.0500, lng: 59.5000 },
    // =====================================================================================
    //                              ROSSIYA (~350 shahar)
    // =====================================================================================
    // --- Markaz federal okrugi ---
    { name: 'Moskva', aliases: ['moskva', 'москва', 'moscow', 'мск', 'моск', 'maskva', 'maskiva', 'маскива', 'маскова', 'масква', 'mascova', 'maskuva', 'маскува', 'москов', 'москову', 'москова', 'маскав', 'маскву', 'moscov', 'moskow', 'maskow'], lat: 55.7558, lng: 37.6173 },
    { name: 'Podolsk', aliases: ['podolsk', 'подольск'], lat: 55.4311, lng: 37.5453 },
    { name: 'Balashikha', aliases: ['balashikha', 'балашиха'], lat: 55.7960, lng: 37.9581 },
    { name: 'Khimki', aliases: ['khimki', 'химки'], lat: 55.8970, lng: 37.4297 },
    { name: 'Mytishchi', aliases: ['mytishchi', 'мытищи'], lat: 55.9116, lng: 37.7308 },
    { name: 'Korolev', aliases: ['korolev', 'королёв', 'королев'], lat: 55.9164, lng: 37.8547 },
    { name: 'Lyubertsy', aliases: ['lyubertsy', 'люберцы'], lat: 55.6786, lng: 37.8983 },
    { name: 'Elektrostal', aliases: ['elektrostal', 'электросталь'], lat: 55.7840, lng: 38.4647 },
    { name: 'Kolomna', aliases: ['kolomna', 'коломна'], lat: 55.0794, lng: 38.7783 },
    { name: 'Serpukhov', aliases: ['serpukhov', 'серпухов'], lat: 54.9137, lng: 37.4066 },
    { name: 'Odintsovo', aliases: ['odintsovo', 'одинцово'], lat: 55.6780, lng: 37.2636 },
    { name: 'Domodedovo', aliases: ['domodedovo', 'домодедово'], lat: 55.4370, lng: 37.7667 },
    { name: 'Noginsk', aliases: ['noginsk', 'ногинск'], lat: 55.8651, lng: 38.4417 },
    { name: 'Shchyolkovo', aliases: ['shchyolkovo', 'щёлково', 'щелково'], lat: 55.9223, lng: 37.9716 },
    { name: 'Ramenskoye', aliases: ['ramenskoye', 'раменское'], lat: 55.5672, lng: 38.2303 },
    { name: 'Pushkino', aliases: ['pushkino', 'пушкино'], lat: 56.0106, lng: 37.8472 },
    { name: 'Zhukovsky', aliases: ['zhukovsky', 'жуковский'], lat: 55.5953, lng: 38.1153 },
    { name: 'Obninsk', aliases: ['obninsk', 'обнинск'], lat: 55.0968, lng: 36.6101 },
    // --- Oblasti markazlari (Markaz) ---
    { name: 'Voronezh', aliases: ['voronezh', 'воронеж', 'ворон'], lat: 51.6720, lng: 39.1843 },
    { name: 'Tula', aliases: ['tula', 'тула'], lat: 54.1930, lng: 37.6174 },
    { name: 'Ryazan', aliases: ['ryazan', 'рязань', 'рязан'], lat: 54.6269, lng: 39.6916 },
    { name: 'Lipetsk', aliases: ['lipetsk', 'липецк'], lat: 52.6031, lng: 39.5708 },
    { name: 'Tambov', aliases: ['tambov', 'тамбов'], lat: 52.7212, lng: 41.4523 },
    { name: 'Kursk', aliases: ['kursk', 'курск'], lat: 51.7373, lng: 36.1874 },
    { name: 'Belgorod', aliases: ['belgorod', 'белгород'], lat: 50.5997, lng: 36.5862 },
    { name: 'Bryansk', aliases: ['bryansk', 'брянск'], lat: 53.2521, lng: 34.3717 },
    { name: 'Ivanovo', aliases: ['ivanovo', 'иваново'], lat: 56.9997, lng: 40.9739 },
    { name: 'Yaroslavl', aliases: ['yaroslavl', 'ярославль'], lat: 57.6261, lng: 39.8845 },
    { name: 'Kostroma', aliases: ['kostroma', 'кострома'], lat: 57.7677, lng: 40.9269 },
    { name: 'Vladimir', aliases: ['vladimir', 'владимир'], lat: 56.1366, lng: 40.3966 },
    { name: 'Kaluga', aliases: ['kaluga', 'калуга'], lat: 54.5293, lng: 36.2754 },
    { name: 'Tver', aliases: ['tver', 'тверь'], lat: 56.8587, lng: 35.9176 },
    { name: 'Smolensk', aliases: ['smolensk', 'смоленск'], lat: 54.7818, lng: 32.0401 },
    { name: 'Orel', aliases: ['orel', 'орёл', 'орел'], lat: 52.9651, lng: 36.0785 },
    // Markazdagi muhim shaharlar
    { name: 'Stary Oskol', aliases: ['stary oskol', 'старый оскол'], lat: 51.2967, lng: 37.8417 },
    { name: 'Yelets', aliases: ['yelets', 'елец'], lat: 52.6249, lng: 38.5010 },
    { name: 'Novomoskovsk', aliases: ['novomoskovsk', 'новомосковск'], lat: 54.0100, lng: 38.2854 },
    { name: 'Murom', aliases: ['murom', 'муром'], lat: 55.5750, lng: 42.0426 },
    { name: 'Kovrov', aliases: ['kovrov', 'ковров'], lat: 56.3572, lng: 41.3192 },
    { name: 'Dzerzhinsk', aliases: ['dzerzhinsk', 'дзержинск'], lat: 56.2476, lng: 43.4400 },
    { name: 'Arzamas', aliases: ['arzamas', 'арзамас'], lat: 55.3947, lng: 43.8146 },
    { name: 'Rybinsk', aliases: ['rybinsk', 'рыбинск'], lat: 58.0493, lng: 38.8372 },
    { name: 'Kineshma', aliases: ['kineshma', 'кинешма'], lat: 57.4408, lng: 42.1544 },
    { name: 'Michurinsk', aliases: ['michurinsk', 'мичуринск'], lat: 52.8978, lng: 40.4903 },
    { name: 'Rossosh', aliases: ['rossosh', 'россошь'], lat: 50.1978, lng: 39.5775 },
    { name: 'Gubkin', aliases: ['gubkin', 'губкин'], lat: 51.2833, lng: 37.5333 },
    { name: 'Klintsy', aliases: ['klintsy', 'клинцы'], lat: 52.7538, lng: 32.2369 },
    { name: 'Cherepovets', aliases: ['cherepovets', 'череповец'], lat: 59.1269, lng: 37.9096 },
    { name: 'Velikiye Luki', aliases: ['velikiye luki', 'великие луки'], lat: 56.3403, lng: 30.5456 },
    { name: 'Roslavl', aliases: ['roslavl', 'рославль'], lat: 53.9536, lng: 32.8569 },
    { name: 'Borisoglebsk', aliases: ['borisoglebsk', 'борисоглебск'], lat: 51.3678, lng: 42.0867 },
    // --- Severo-Zapad ---
    { name: 'Sankt-Peterburg', aliases: ['peterburg', 'петербург', 'питер', 'спб', 'санкт-петербург', 'spb'], lat: 59.9343, lng: 30.3351 },
    { name: 'Kaliningrad', aliases: ['kaliningrad', 'калининград'], lat: 54.7104, lng: 20.4522 },
    { name: 'Murmansk', aliases: ['murmansk', 'мурманск'], lat: 68.9585, lng: 33.0827 },
    { name: 'Pskov', aliases: ['pskov', 'псков'], lat: 57.8136, lng: 28.3496 },
    { name: 'Vologda', aliases: ['vologda', 'вологда'], lat: 59.2205, lng: 39.8915 },
    { name: 'Arkhangelsk', aliases: ['arkhangelsk', 'архангельск'], lat: 64.5401, lng: 40.5433 },
    { name: 'Petrozavodsk', aliases: ['petrozavodsk', 'петрозаводск'], lat: 61.7891, lng: 34.3596 },
    { name: 'Veliky Novgorod', aliases: ['novgorod', 'новгород', 'великий новгород'], lat: 58.5244, lng: 31.2712 },
    { name: 'Syktyvkar', aliases: ['syktyvkar', 'сыктывкар'], lat: 61.6688, lng: 50.8364 },
    { name: 'Severodvinsk', aliases: ['severodvinsk', 'северодвинск'], lat: 64.5580, lng: 39.8381 },
    { name: 'Ukhta', aliases: ['ukhta', 'ухта'], lat: 63.5700, lng: 53.6833 },
    { name: 'Apatity', aliases: ['apatity', 'апатиты'], lat: 67.5682, lng: 33.4062 },
    // --- Yug (Janubiy federal okrug) ---
    { name: 'Rostov-na-Donu', aliases: ['rostov', 'ростов', 'ростов-на-дону', 'рнд'], lat: 47.2357, lng: 39.7015 },
    { name: 'Volgograd', aliases: ['volgograd', 'волгоград', 'влг', 'волгогр'], lat: 48.7080, lng: 44.5133 },
    { name: 'Krasnodar', aliases: ['krasnodar', 'краснодар', 'крд'], lat: 45.0355, lng: 38.9753 },
    { name: 'Astrakhan', aliases: ['astrakhan', 'астрахань', 'астрах'], lat: 46.3497, lng: 48.0408 },
    { name: 'Sochi', aliases: ['sochi', 'сочи'], lat: 43.5853, lng: 39.7231 },
    { name: 'Taganrog', aliases: ['taganrog', 'таганрог'], lat: 47.2361, lng: 38.8969 },
    { name: 'Shakhty', aliases: ['shakhty', 'шахты'], lat: 47.7089, lng: 40.2139 },
    { name: 'Novocherkassk', aliases: ['novocherkassk', 'новочеркасск'], lat: 47.4225, lng: 40.0939 },
    { name: 'Volgodonsk', aliases: ['volgodonsk', 'волгодонск'], lat: 47.5159, lng: 42.1534 },
    { name: 'Bataysk', aliases: ['bataysk', 'батайск'], lat: 47.1372, lng: 39.7452 },
    { name: 'Volzhsky', aliases: ['volzhsky', 'волжский'], lat: 48.7862, lng: 44.7510 },
    { name: 'Kamyshin', aliases: ['kamyshin', 'камышин'], lat: 50.0975, lng: 45.4067 },
    { name: 'Novorossiysk', aliases: ['novorossiysk', 'новороссийск', 'новорос'], lat: 44.7239, lng: 37.7686 },
    { name: 'Armavir', aliases: ['armavir', 'армавир'], lat: 44.9892, lng: 41.1233 },
    { name: 'Anapa', aliases: ['anapa', 'анапа'], lat: 44.8941, lng: 37.3158 },
    { name: 'Yeysk', aliases: ['yeysk', 'ейск'], lat: 46.7117, lng: 38.2745 },
    { name: 'Kropotkin', aliases: ['kropotkin', 'кропоткин'], lat: 45.4372, lng: 40.5753 },
    { name: 'Elista', aliases: ['elista', 'элиста'], lat: 46.3083, lng: 44.2700 },
    { name: 'Maykop', aliases: ['maykop', 'майкоп'], lat: 44.6098, lng: 40.1006 },
    // --- Kavkaz ---
    { name: 'Stavropol', aliases: ['stavropol', 'ставрополь', 'ставр'], lat: 45.0428, lng: 41.9734 },
    { name: 'Makhachkala', aliases: ['makhachkala', 'махачкала', 'махач', 'maxachkala', 'махачкала', 'махачкола', 'maxachkola'], lat: 42.9849, lng: 47.5047 },
    { name: 'Grozny', aliases: ['grozny', 'грозный', 'грозн'], lat: 43.3178, lng: 45.6946 },
    { name: 'Vladikavkaz', aliases: ['vladikavkaz', 'владикавказ'], lat: 43.0205, lng: 44.6819 },
    { name: 'Pyatigorsk', aliases: ['pyatigorsk', 'пятигорск'], lat: 44.0486, lng: 43.0594 },
    { name: 'Kislovodsk', aliases: ['kislovodsk', 'кисловодск'], lat: 43.9136, lng: 42.7181 },
    { name: 'Yessentuki', aliases: ['yessentuki', 'ессентуки'], lat: 44.0444, lng: 42.8600 },
    { name: 'Mineralnye Vody', aliases: ['mineralnye vody', 'минеральные воды', 'минводы', 'мин.воды'], lat: 44.2167, lng: 43.1333 },
    { name: 'Nevinnomyssk', aliases: ['nevinnomyssk', 'невинномысск'], lat: 44.6300, lng: 41.9439 },
    { name: 'Nalchik', aliases: ['nalchik', 'нальчик'], lat: 43.4981, lng: 43.6194 },
    { name: 'Cherkessk', aliases: ['cherkessk', 'черкесск'], lat: 44.2233, lng: 42.0579 },
    { name: 'Derbent', aliases: ['derbent', 'дербент'], lat: 42.0688, lng: 48.2892 },
    { name: 'Kaspiysk', aliases: ['kaspiysk', 'каспийск'], lat: 42.8817, lng: 47.6392 },
    { name: 'Khasavyurt', aliases: ['khasavyurt', 'хасавюрт'], lat: 43.2514, lng: 46.5867 },
    { name: 'Beslan', aliases: ['beslan', 'беслан'], lat: 43.1867, lng: 44.5425 },
    { name: 'Budennovsk', aliases: ['budennovsk', 'будённовск', 'буденновск'], lat: 44.7839, lng: 44.1672 },
    { name: 'Georgievsk', aliases: ['georgievsk', 'георгиевск'], lat: 44.1533, lng: 43.4700 },
    // --- Volga federal okrugi ---
    { name: 'Kazan', aliases: ['kazan', 'казань', 'казан'], lat: 55.8304, lng: 49.0661 },
    { name: 'Samara', aliases: ['samara', 'самара'], lat: 53.1959, lng: 50.1002 },
    { name: 'Ufa', aliases: ['ufa', 'уфа'], lat: 54.7388, lng: 55.9721 },
    { name: 'Nijniy Novgorod', aliases: ['nizhniy novgorod', 'нижний новгород', 'нижний', 'н.новгород'], lat: 56.2965, lng: 43.9361 },
    { name: 'Perm', aliases: ['perm', 'пермь', 'перм'], lat: 58.0105, lng: 56.2502 },
    { name: 'Krasnokamsk', aliases: ['krasnokamsk', 'краснокамск', 'краснокамс', 'красноками', 'красногамск'], lat: 58.0800, lng: 55.7500 },
    { name: 'Saratov', aliases: ['saratov', 'саратов', 'saratif', 'саратиф', 'sarotov', 'саротов'], lat: 51.5924, lng: 45.9607 },
    { name: 'Tolyatti', aliases: ['tolyatti', 'тольятти', 'тольяти'], lat: 53.5303, lng: 49.3461 },
    { name: 'Izhevsk', aliases: ['izhevsk', 'ижевск'], lat: 56.8527, lng: 53.2114 },
    { name: 'Ulyanovsk', aliases: ['ulyanovsk', 'ульяновск', 'улянский', 'ульяновс', 'ўляновск'], lat: 54.3145, lng: 48.4027 },
    { name: 'Penza', aliases: ['penza', 'пенза'], lat: 53.1958, lng: 45.0185 },
    { name: 'Orenburg', aliases: ['orenburg', 'оренбург'], lat: 51.7685, lng: 55.0968 },
    { name: 'Kirov', aliases: ['kirov', 'киров'], lat: 58.6036, lng: 49.6680 },
    { name: 'Cheboksary', aliases: ['cheboksary', 'чебоксары'], lat: 56.1322, lng: 47.2519 },
    { name: 'Naberezhnye Chelny', aliases: ['chelny', 'челны', 'набережные челны', 'наб.челны'], lat: 55.7000, lng: 52.3167 },
    { name: 'Yoshkar-Ola', aliases: ['yoshkar-ola', 'йошкар-ола'], lat: 56.6344, lng: 47.9025 },
    { name: 'Saransk', aliases: ['saransk', 'саранск'], lat: 54.1833, lng: 45.1833 },
    // Volga region shaharlari
    { name: 'Sterlitamak', aliases: ['sterlitamak', 'стерлитамак'], lat: 53.6244, lng: 55.9507 },
    { name: 'Salavat', aliases: ['salavat', 'салават'], lat: 53.3617, lng: 55.9328 },
    { name: 'Neftekamsk', aliases: ['neftekamsk', 'нефтекамск'], lat: 56.0881, lng: 54.2664 },
    { name: 'Oktyabrsky', aliases: ['oktyabrsky', 'октябрьский'], lat: 54.4833, lng: 53.4667 },
    { name: 'Engels', aliases: ['engels', 'энгельс'], lat: 51.4988, lng: 46.1264 },
    { name: 'Balakovo', aliases: ['balakovo', 'балаково'], lat: 52.0282, lng: 47.8007 },
    { name: 'Balashov', aliases: ['balashov', 'балашов'], lat: 51.5500, lng: 43.1667 },
    { name: 'Orsk', aliases: ['orsk', 'орск'], lat: 51.2294, lng: 58.4711 },
    { name: 'Novotroitsk', aliases: ['novotroitsk', 'новотроицк'], lat: 51.2006, lng: 58.3108 },
    { name: 'Buzuluk', aliases: ['buzuluk', 'бузулук'], lat: 52.7883, lng: 52.2617 },
    { name: 'Almetyevsk', aliases: ['almetyevsk', 'альметьевск', 'альметевск'], lat: 54.9000, lng: 52.3000 },
    { name: 'Nizhnekamsk', aliases: ['nizhnekamsk', 'нижнекамск'], lat: 55.6383, lng: 51.8228 },
    { name: 'Bugulma', aliases: ['bugulma', 'бугульма'], lat: 54.5397, lng: 52.7953 },
    { name: 'Yelabuga', aliases: ['yelabuga', 'елабуга'], lat: 55.7600, lng: 52.0425 },
    { name: 'Kuznetsk', aliases: ['kuznetsk', 'кузнецк'], lat: 53.1167, lng: 46.6000 },
    { name: 'Dimitrovgrad', aliases: ['dimitrovgrad', 'димитровград'], lat: 54.2139, lng: 49.6194 },
    { name: 'Novocheboksarsk', aliases: ['novocheboksarsk', 'новочебоксарск'], lat: 56.1100, lng: 47.4792 },
    { name: 'Votkinsk', aliases: ['votkinsk', 'воткинск'], lat: 57.0496, lng: 53.9872 },
    { name: 'Glazov', aliases: ['glazov', 'глазов'], lat: 58.1397, lng: 52.6575 },
    { name: 'Sarapul', aliases: ['sarapul', 'сарапул'], lat: 56.4747, lng: 53.7987 },
    { name: 'Berezniki', aliases: ['berezniki', 'березники'], lat: 59.4091, lng: 56.8203 },
    { name: 'Solikamsk', aliases: ['solikamsk', 'соликамск'], lat: 59.6308, lng: 56.7626 },
    { name: 'Kungur', aliases: ['kungur', 'кунгур'], lat: 57.4297, lng: 56.9456 },
    { name: 'Syzran', aliases: ['syzran', 'сызрань', 'сызран'], lat: 53.1553, lng: 48.4739 },
    { name: 'Kirovo-Chepetsk', aliases: ['kirovo-chepetsk', 'кирово-чепецк'], lat: 58.5539, lng: 50.0403 },
    // --- Ural federal okrugi ---
    { name: 'Yekaterinburg', aliases: ['yekaterinburg', 'екатеринбург', 'екб', 'екатер', 'ekatrenburg', 'екатренбург', 'екатрінбург', 'екатеренбург', 'ekatrinburg', 'екатринбург', 'ekaterinburg'], lat: 56.8389, lng: 60.6057 },
    { name: 'Chelyabinsk', aliases: ['chelyabinsk', 'челябинск', 'челяб'], lat: 55.1644, lng: 61.4368 },
    { name: 'Tyumen', aliases: ['tyumen', 'тюмень', 'тюмен'], lat: 57.1522, lng: 65.5272 },
    { name: 'Magnitogorsk', aliases: ['magnitogorsk', 'магнитогорск', 'магнит'], lat: 53.3935, lng: 59.0386 },
    { name: 'Kurgan', aliases: ['kurgan', 'курган'], lat: 55.4519, lng: 65.3347 },
    { name: 'Surgut', aliases: ['surgut', 'сургут'], lat: 61.2500, lng: 73.3833 },
    { name: 'Nizhnevartovsk', aliases: ['nizhnevartovsk', 'нижневартовск'], lat: 60.9344, lng: 76.5531 },
    { name: 'Noyabrsk', aliases: ['noyabrsk', 'ноябрьск'], lat: 63.2011, lng: 75.4439 },
    { name: 'Nefteyugansk', aliases: ['nefteyugansk', 'нефтеюганск'], lat: 61.0989, lng: 72.6033 },
    { name: 'Tobolsk', aliases: ['tobolsk', 'тобольск'], lat: 58.1986, lng: 68.2542 },
    { name: 'Nizhny Tagil', aliases: ['nizhny tagil', 'нижний тагил', 'тагил'], lat: 57.9100, lng: 59.9733 },
    { name: 'Kamensk-Uralsky', aliases: ['kamensk-uralsky', 'каменск-уральский'], lat: 56.4181, lng: 61.9322 },
    { name: 'Pervouralsk', aliases: ['pervouralsk', 'первоуральск'], lat: 56.9039, lng: 59.9441 },
    { name: 'Serov', aliases: ['serov', 'серов'], lat: 59.6006, lng: 60.5747 },
    { name: 'Miass', aliases: ['miass', 'миасс'], lat: 55.0450, lng: 60.1081 },
    { name: 'Zlatoust', aliases: ['zlatoust', 'златоуст'], lat: 55.1710, lng: 59.6512 },
    { name: 'Kopeysk', aliases: ['kopeysk', 'копейск'], lat: 55.1167, lng: 61.6167 },
    { name: 'Ishim', aliases: ['ishim', 'ишим'], lat: 56.1122, lng: 69.4867 },
    { name: 'Shadrinsk', aliases: ['shadrinsk', 'шадринск'], lat: 56.0837, lng: 63.6304 },
    { name: 'Kogalym', aliases: ['kogalym', 'когалым'], lat: 62.2667, lng: 74.4833 },
    { name: 'Langepas', aliases: ['langepas', 'лангепас'], lat: 61.2533, lng: 75.2153 },
    { name: 'Megion', aliases: ['megion', 'мегион'], lat: 61.0333, lng: 76.1000 },
    { name: 'Novy Urengoy', aliases: ['novy urengoy', 'новый уренгой', 'уренгой'], lat: 66.0833, lng: 76.6333 },
    { name: 'Noyabrsk', aliases: ['noyabrsk', 'ноябрьск'], lat: 63.2011, lng: 75.4439 },
    // --- Sibiriya ---
    { name: 'Novosibirsk', aliases: ['novosibirsk', 'новосибирск', 'новосиб', 'нск', 'навасибирск', 'навасибирскидан', 'новосібірск'], lat: 55.0084, lng: 82.9357 },
    { name: 'Omsk', aliases: ['omsk', 'омск'], lat: 54.9885, lng: 73.3242 },
    { name: 'Krasnoyarsk', aliases: ['krasnoyarsk', 'красноярск', 'крск'], lat: 56.0153, lng: 92.8932 },
    { name: 'Barnaul', aliases: ['barnaul', 'барнаул'], lat: 53.3548, lng: 83.7698 },
    { name: 'Tomsk', aliases: ['tomsk', 'томск'], lat: 56.4884, lng: 84.9481 },
    { name: 'Kemerovo', aliases: ['kemerovo', 'кемерово'], lat: 55.3333, lng: 86.0833 },
    { name: 'Novokuznetsk', aliases: ['novokuznetsk', 'новокузнецк', 'навакузнетиск', 'навакузнецк', 'новакузнецк'], lat: 53.7596, lng: 87.1216 },
    { name: 'Irkutsk', aliases: ['irkutsk', 'иркутск'], lat: 52.2978, lng: 104.2964 },
    { name: 'Norilsk', aliases: ['norilsk', 'норильск'], lat: 69.3535, lng: 88.2027 },
    { name: 'Chita', aliases: ['chita', 'чита'], lat: 52.0515, lng: 113.4712 },
    { name: 'Berdsk', aliases: ['berdsk', 'бердск'], lat: 54.7608, lng: 83.0929 },
    { name: 'Iskitim', aliases: ['iskitim', 'искитим'], lat: 54.6422, lng: 83.3044 },
    { name: 'Achinsk', aliases: ['achinsk', 'ачинск'], lat: 56.2694, lng: 90.4958 },
    { name: 'Kansk', aliases: ['kansk', 'канск'], lat: 56.2019, lng: 95.7186 },
    { name: 'Minusinsk', aliases: ['minusinsk', 'минусинск'], lat: 53.7106, lng: 91.6833 },
    { name: 'Lesosibirsk', aliases: ['lesosibirsk', 'лесосибирск'], lat: 58.2353, lng: 92.4781 },
    { name: 'Biysk', aliases: ['biysk', 'бийск'], lat: 52.5367, lng: 85.2136 },
    { name: 'Rubtsovsk', aliases: ['rubtsovsk', 'рубцовск'], lat: 51.5167, lng: 81.2167 },
    { name: 'Seversk', aliases: ['seversk', 'северск'], lat: 56.6033, lng: 84.8867 },
    { name: 'Prokopyevsk', aliases: ['prokopyevsk', 'прокопьевск'], lat: 53.8833, lng: 86.7167 },
    { name: 'Belovo', aliases: ['belovo', 'белово'], lat: 54.4167, lng: 86.3000 },
    { name: 'Leninsk-Kuznetsky', aliases: ['leninsk-kuznetsky', 'ленинск-кузнецкий', 'ленинск'], lat: 54.6517, lng: 86.1747 },
    { name: 'Mezhdurechensk', aliases: ['mezhdurechensk', 'междуреченск'], lat: 53.6833, lng: 88.0667 },
    { name: 'Angarsk', aliases: ['angarsk', 'ангарск'], lat: 52.5167, lng: 103.9167 },
    { name: 'Bratsk', aliases: ['bratsk', 'братск'], lat: 56.1525, lng: 101.6200 },
    { name: 'Ust-Ilimsk', aliases: ['ust-ilimsk', 'усть-илимск'], lat: 57.9333, lng: 102.7333 },
    { name: 'Ulan-Ude', aliases: ['ulan-ude', 'улан-удэ', 'улан удэ'], lat: 51.8333, lng: 107.5833 },
    { name: 'Abakan', aliases: ['abakan', 'абакан'], lat: 53.7150, lng: 91.4292 },
    { name: 'Kyzyl', aliases: ['kyzyl', 'кызыл'], lat: 51.7100, lng: 94.4500 },
    { name: 'Gorno-Altaysk', aliases: ['gorno-altaysk', 'горно-алтайск'], lat: 51.9583, lng: 85.9603 },
    // --- Dalny Vostok ---
    { name: 'Vladivostok', aliases: ['vladivostok', 'владивосток', 'влад'], lat: 43.1155, lng: 131.8855 },
    { name: 'Khabarovsk', aliases: ['khabarovsk', 'хабаровск', 'хабар'], lat: 48.4827, lng: 135.0838 },
    { name: 'Yakutsk', aliases: ['yakutsk', 'якутск'], lat: 62.0397, lng: 129.7422 },
    { name: 'Blagoveshchensk', aliases: ['blagoveshchensk', 'благовещенск'], lat: 50.2581, lng: 127.5359 },
    { name: 'Yuzhno-Sakhalinsk', aliases: ['yuzhno-sakhalinsk', 'южно-сахалинск'], lat: 46.9641, lng: 142.7285 },
    { name: 'Komsomolsk', aliases: ['komsomolsk', 'комсомольск', 'комсомольск-на-амуре'], lat: 50.5506, lng: 137.0079 },
    { name: 'Nakhodka', aliases: ['nakhodka', 'находка'], lat: 42.8240, lng: 132.8825 },
    { name: 'Ussuriysk', aliases: ['ussuriysk', 'уссурийск'], lat: 43.7986, lng: 131.9528 },
    { name: 'Petropavlovsk-Kamchatsky', aliases: ['petropavlovsk-kamchatsky', 'петропавловск-камчатский', 'камчатка'], lat: 53.0452, lng: 158.6511 },
    { name: 'Magadan', aliases: ['magadan', 'магадан'], lat: 59.5680, lng: 150.8086 },
    { name: 'Neryungri', aliases: ['neryungri', 'нерюнгри'], lat: 56.6536, lng: 124.7114 },
    { name: 'Birobidzhan', aliases: ['birobidzhan', 'биробиджан'], lat: 48.7972, lng: 132.9211 },
    // =====================================================================================
    //                              QOZOG'ISTON (~25 shahar)
    // =====================================================================================
    { name: 'Almaty', aliases: ['almaty', 'алматы', 'алма-ата', 'alma-ata', 'алмата', 'almata', 'олмаота', 'алматі'], lat: 43.2220, lng: 76.8512 },
    { name: 'Astana', aliases: ['astana', 'астана', 'нур-султан', 'nursultan', 'nur-sultan'], lat: 51.1694, lng: 71.4491 },
    { name: 'Shymkent', aliases: ['shymkent', 'шымкент', 'чимкент', 'chimkent', 'шимкент', 'чемкент', 'шимкен', 'чимкен', 'чемкен', 'shimken', 'chimken', 'чімкент', 'шімкент'], lat: 42.3417, lng: 69.5969 },
    { name: 'Saryagash', aliases: ['saryagash', 'сарыагаш', 'сариагач', 'sariagach', 'сариагаш', 'сарыагач', 'sariogach', 'сариогач', 'сарагаш', 'сарағаш', 'saragash', 'сарағош'], lat: 41.4667, lng: 69.1667 },
    { name: 'Karaganda', aliases: ['karaganda', 'караганда', 'караганд', 'qaraghandy'], lat: 49.8047, lng: 73.1094 },
    { name: 'Aktobe', aliases: ['aktobe', 'актобе', 'актюбинск', 'aqtobe'], lat: 50.2839, lng: 57.1670 },
    { name: 'Taraz', aliases: ['taraz', 'тараз', 'жамбыл'], lat: 42.9000, lng: 71.3667 },
    { name: 'Pavlodar', aliases: ['pavlodar', 'павлодар'], lat: 52.2873, lng: 76.9674 },
    { name: 'Ust-Kamenogorsk', aliases: ['ust-kamenogorsk', 'усть-каменогорск', 'оскемен', 'oskemen'], lat: 49.9714, lng: 82.6059 },
    { name: 'Semey', aliases: ['semey', 'семей', 'семипалатинск'], lat: 50.4111, lng: 80.2275 },
    { name: 'Atyrau', aliases: ['atyrau', 'атырау'], lat: 47.1167, lng: 51.9000 },
    { name: 'Kostanay', aliases: ['kostanay', 'костанай', 'кустанай'], lat: 53.2198, lng: 63.6354 },
    { name: 'Petropavlovsk KZ', aliases: ['петропавловск', 'petropavl'], lat: 54.8660, lng: 69.1355 },
    { name: 'Kyzylorda', aliases: ['kyzylorda', 'кызылорда', 'кзылорда'], lat: 44.8488, lng: 65.5228 },
    { name: 'Aktau', aliases: ['aktau', 'актау'], lat: 43.6359, lng: 51.1696 },
    { name: 'Turkestan', aliases: ['turkestan', 'туркестан', 'turkiston'], lat: 43.3017, lng: 68.2514 },
    { name: 'Taldykorgan', aliases: ['taldykorgan', 'талдыкорган'], lat: 45.0164, lng: 78.3733 },
    { name: 'Kokshetau', aliases: ['kokshetau', 'кокшетау', 'кокчетав'], lat: 53.2841, lng: 69.3953 },
    { name: 'Ekibastuz', aliases: ['ekibastuz', 'экибастуз'], lat: 51.7333, lng: 75.3167 },
    { name: 'Rudny', aliases: ['rudny', 'рудный'], lat: 52.9667, lng: 63.1333 },
    { name: 'Temirtau', aliases: ['temirtau', 'темиртау'], lat: 50.0500, lng: 72.9667 },
    { name: 'Zhanaozen', aliases: ['zhanaozen', 'жанаозен', 'жана-озен'], lat: 43.3500, lng: 52.8667 },
    // =====================================================================================
    //                              QIRG'IZISTON
    // =====================================================================================
    { name: 'Bishkek', aliases: ['bishkek', 'бишкек'], lat: 42.8746, lng: 74.5698 },
    { name: 'Osh', aliases: ['osh', 'ош'], lat: 40.5283, lng: 72.7985 },
    { name: 'Jalal-Abad', aliases: ['jalal-abad', 'джалал-абад', 'жалал-абад'], lat: 40.9333, lng: 73.0017 },
    { name: 'Karakol', aliases: ['karakol', 'каракол'], lat: 42.4875, lng: 78.3936 },
    { name: 'Tokmok', aliases: ['tokmok', 'токмок'], lat: 42.7667, lng: 75.3000 },
    { name: 'Batken', aliases: ['batken', 'баткен'], lat: 40.0628, lng: 70.8189 },
    { name: 'Naryn', aliases: ['naryn', 'нарын'], lat: 41.4286, lng: 76.0000 },
    { name: 'Talas', aliases: ['talas', 'талас'], lat: 42.5194, lng: 72.2431 },
    { name: 'Balykchy', aliases: ['balykchy', 'балыкчы', 'балыкчи'], lat: 42.4614, lng: 76.1869 },
    { name: 'Kara-Balta', aliases: ['kara-balta', 'кара-балта'], lat: 42.8153, lng: 73.8486 },
    // =====================================================================================
    //                              TOJIKISTON
    // =====================================================================================
    { name: 'Tojikiston', aliases: ['tojikiston', 'тожикистон', 'тожикистан', 'таджикистан', 'tajikistan', 'тоджикистон', 'тажикистон', 'тажикистан', 'тажікістан', 'тожикстон', 'тоджикстан', 'тожикістон', 'тажикістон'], lat: 38.5598, lng: 68.7740 },
    { name: 'Dushanbe', aliases: ['dushanbe', 'душанбе', 'душанби', 'дўшанбе', 'dushambe', 'дўшанби', 'дущанбе', 'дущанби'], lat: 38.5598, lng: 68.7740 },
    { name: 'Khujand', aliases: ['khujand', 'худжанд', 'хужанд', 'ленинабад', 'хўжанд', 'худжанд'], lat: 40.2833, lng: 69.6333 },
    { name: 'Kulob', aliases: ['kulob', 'куляб', 'кулоб', 'кўлоб', 'кулёб'], lat: 38.5419, lng: 69.7842 },
    { name: 'Bokhtar', aliases: ['bokhtar', 'бохтар', 'курган-тюбе', 'кургантюбе', 'бўхтор'], lat: 37.8367, lng: 68.7800 },
    { name: 'Istaravshan', aliases: ['istaravshan', 'истаравшан', 'ура-тюбе', 'уратюбе'], lat: 39.9142, lng: 69.0000 },
    { name: 'Konibodom', aliases: ['konibodom', 'канибадам', 'конибодом', 'конібодом'], lat: 40.2833, lng: 70.4167 },
    { name: 'Tursunzoda', aliases: ['tursunzoda', 'турсунзаде', 'турсунзода'], lat: 38.5125, lng: 68.2292 },
    { name: 'Panjakent', aliases: ['panjakent', 'пенджикент', 'панджакент', 'панжакент'], lat: 39.4933, lng: 67.6078 },
    { name: 'Jalolobod', aliases: ['jalolobod', 'жалолобод', 'жалалабад', 'jalalabad', 'жалолобот', 'жалалобод', 'жалолабод', 'жалалабат', 'jalolabad', 'жалолобад', 'жалалобот', 'жалолободга', 'жалалободга'], lat: 40.9333, lng: 73.0000 },
    // =====================================================================================
    //                              TURKMANISTON
    // =====================================================================================
    { name: 'Ashgabat', aliases: ['ashgabat', 'ашхабад', 'ашгабат', 'ashxabod', 'ашхабод', 'ошхабад', 'ошкабот', 'ашкабот', 'ашкабод', 'ашхабот', 'ashqabod', 'ashkabod', 'ашгобат', 'ашгабод'], lat: 37.9601, lng: 58.3261 },
    { name: 'Turkmenabat', aliases: ['turkmenabat', 'туркменабад', 'чарджоу', 'turkmenabad'], lat: 39.0733, lng: 63.5786 },
    { name: 'Mary', aliases: ['mary', 'мары'], lat: 37.5936, lng: 61.8303 },
    { name: 'Dashoguz', aliases: ['dashoguz', 'дашогуз', 'ташауз'], lat: 41.8363, lng: 59.9666 },
    { name: 'Turkmenbashi', aliases: ['turkmenbashi', 'туркменбаши', 'красноводск'], lat: 40.0189, lng: 52.9689 },
    { name: 'Balkanabat', aliases: ['balkanabat', 'балканабат', 'небитдаг'], lat: 39.5117, lng: 54.3614 },
    // =====================================================================================
    //                              TURKIYA
    // =====================================================================================
    { name: 'Istanbul', aliases: ['istanbul', 'стамбул', 'истанбул', 'истамбул', 'істамбул'], lat: 41.0082, lng: 28.9784 },
    { name: 'Ankara', aliases: ['ankara', 'анкара'], lat: 39.9334, lng: 32.8597 },
    { name: 'Izmir', aliases: ['izmir', 'измир'], lat: 38.4189, lng: 27.1287 },
    { name: 'Antalya', aliases: ['antalya', 'анталия', 'анталья'], lat: 36.8969, lng: 30.7133 },
    { name: 'Bursa', aliases: ['bursa', 'бурса'], lat: 40.1828, lng: 29.0665 },
    { name: 'Trabzon', aliases: ['trabzon', 'трабзон'], lat: 41.0027, lng: 39.7168 },
    { name: 'Mersin', aliases: ['mersin', 'мерсин'], lat: 36.8121, lng: 34.6415 },
    { name: 'Gebze', aliases: ['gebze', 'гебзе'], lat: 40.8027, lng: 29.4307 },
    { name: 'Konya', aliases: ['konya', 'конья'], lat: 37.8713, lng: 32.4846 },
    { name: 'Adana', aliases: ['adana', 'адана'], lat: 37.0000, lng: 35.3213 },
    { name: 'Gaziantep', aliases: ['gaziantep', 'газиантеп'], lat: 37.0662, lng: 37.3833 },
    { name: 'Kayseri', aliases: ['kayseri', 'кайсери'], lat: 38.7312, lng: 35.4787 },
    // =====================================================================================
    //                              GRUZIYA
    // =====================================================================================
    { name: 'Tbilisi', aliases: ['tbilisi', 'тбилиси'], lat: 41.7151, lng: 44.8271 },
    { name: 'Batumi', aliases: ['batumi', 'батуми'], lat: 41.6168, lng: 41.6367 },
    { name: 'Kutaisi', aliases: ['kutaisi', 'кутаиси'], lat: 42.2679, lng: 42.6946 },
    // =====================================================================================
    //                              OZARBAYJON
    // =====================================================================================
    { name: 'Baku', aliases: ['baku', 'баку'], lat: 40.4093, lng: 49.8671 },
    { name: 'Ganja', aliases: ['ganja', 'гянджа'], lat: 40.6828, lng: 46.3606 },
    { name: 'Sumgait', aliases: ['sumgait', 'сумгаит'], lat: 40.5856, lng: 49.6317 },
    // =====================================================================================
    //                              ARMANISTON
    // =====================================================================================
    { name: 'Yerevan', aliases: ['yerevan', 'ереван'], lat: 40.1792, lng: 44.4991 },
    { name: 'Gyumri', aliases: ['gyumri', 'гюмри'], lat: 40.7894, lng: 43.8472 },
    // =====================================================================================
    //                              UKRAINA
    // =====================================================================================
    { name: 'Kyiv', aliases: ['kyiv', 'киев', 'kiev'], lat: 50.4501, lng: 30.5234 },
    { name: 'Kharkiv', aliases: ['kharkiv', 'харьков', 'kharkov'], lat: 49.9935, lng: 36.2304 },
    { name: 'Odesa', aliases: ['odesa', 'одесса', 'odessa'], lat: 46.4825, lng: 30.7233 },
    { name: 'Dnipro', aliases: ['dnipro', 'днепр', 'днепропетровск'], lat: 48.4647, lng: 35.0462 },
    { name: 'Lviv', aliases: ['lviv', 'львов', 'львів'], lat: 49.8397, lng: 24.0297 },
    { name: 'Zaporizhzhia', aliases: ['zaporizhzhia', 'запорожье'], lat: 47.8388, lng: 35.1396 },
    // =====================================================================================
    //                              BELARUS
    // =====================================================================================
    { name: 'Belarus', aliases: ['belarus', 'белорусь', 'белоруссия', 'беларусь', 'беларус', 'belorusiya', 'белорусия'], lat: 53.9045, lng: 27.5615 },
    { name: 'Minsk', aliases: ['minsk', 'минск'], lat: 53.9045, lng: 27.5615 },
    { name: 'Borisov', aliases: ['borisov', 'борисов', 'борісов', 'борисаф', 'борисоф'], lat: 54.2300, lng: 28.5000 },
    { name: 'Gomel', aliases: ['gomel', 'гомель'], lat: 52.4411, lng: 30.9878 },
    { name: 'Brest', aliases: ['brest', 'брест'], lat: 52.0975, lng: 23.6877 },
    { name: 'Grodno', aliases: ['grodno', 'гродно'], lat: 53.6693, lng: 23.8131 },
    { name: 'Vitebsk', aliases: ['vitebsk', 'витебск'], lat: 55.1904, lng: 30.2049 },
    { name: 'Mogilev', aliases: ['mogilev', 'могилёв', 'могилев'], lat: 53.9045, lng: 30.3449 },
    // =====================================================================================
    //                              XITOY (chegara)
    // =====================================================================================
    { name: 'Urumqi', aliases: ['urumqi', 'урумчи', 'urumchi'], lat: 43.8256, lng: 87.6168 },
    { name: 'Kashgar', aliases: ['kashgar', 'кашгар', 'каши'], lat: 39.4547, lng: 75.9797 },
    { name: 'Khorgos', aliases: ['khorgos', 'хоргос', 'коргас', 'xorgos', 'харгос', 'horgos'], lat: 44.2167, lng: 80.4167 },
    // =====================================================================================
    //                              AFGANISTON
    // =====================================================================================
    { name: 'Mazari-Sharif', aliases: ['mazari-sharif', 'мазари-шариф', 'мазар'], lat: 36.7069, lng: 67.1130 },
    { name: 'Kabul', aliases: ['kabul', 'кабул'], lat: 34.5553, lng: 69.2075 },
    { name: 'Hayraton', aliases: ['hayraton', 'хайратон', 'hairatan'], lat: 37.2417, lng: 67.5733 },
    { name: 'Herat', aliases: ['herat', 'герат'], lat: 34.3529, lng: 62.2040 },
    { name: "Afg'oniston", aliases: ['afganistan', 'авганистан', 'ауганистан', 'ауганыстан', 'afghanistan'], lat: 34.5300, lng: 69.1700 },
    // =====================================================================================
    //                              ERON
    // =====================================================================================
    { name: 'Tehran', aliases: ['tehran', 'тегеран'], lat: 35.6892, lng: 51.3890 },
    { name: 'Mashhad', aliases: ['mashhad', 'мешхед', 'мешхад'], lat: 36.2605, lng: 59.6168 },
    { name: 'Isfahan', aliases: ['isfahan', 'исфахан'], lat: 32.6546, lng: 51.6680 },
    { name: 'Bandar Abbas', aliases: ['bandar abbas', 'бандар-аббас', 'бандарабас'], lat: 27.1865, lng: 56.2808 },
    // =====================================================================================
    //                              BAA
    // =====================================================================================
    { name: 'Dubai', aliases: ['dubai', 'дубай', 'дубаи'], lat: 25.2048, lng: 55.2708 },
    { name: 'Abu Dhabi', aliases: ['abu dhabi', 'абу-даби', 'абу даби'], lat: 24.4539, lng: 54.3773 },
    { name: 'Sharjah', aliases: ['sharjah', 'шарджа'], lat: 25.3463, lng: 55.4209 },
    // =====================================================================================
    //                              POKISTON
    // =====================================================================================
    { name: 'Islamabad', aliases: ['islamabad', 'исламабад'], lat: 33.6844, lng: 73.0479 },
    { name: 'Karachi', aliases: ['karachi', 'карачи'], lat: 24.8607, lng: 67.0011 },
    { name: 'Lahore', aliases: ['lahore', 'лахор'], lat: 31.5204, lng: 74.3587 },
    { name: 'Peshawar', aliases: ['peshawar', 'пешавар'], lat: 34.0151, lng: 71.5249 },
    // =====================================================================================
    //                              HINDISTON
    // =====================================================================================
    { name: 'Delhi', aliases: ['delhi', 'дели', 'нью-дели'], lat: 28.7041, lng: 77.1025 },
    { name: 'Mumbai', aliases: ['mumbai', 'мумбаи', 'бомбей'], lat: 19.0760, lng: 72.8777 },
    // =====================================================================================
    //                              YEVROPA (Boltiq, Polsha, Germaniya)
    // =====================================================================================
    { name: 'Litva', aliases: ['litva', 'литва', 'lithuania', 'lietuva'], lat: 54.6872, lng: 25.2797 },
    { name: 'Vilnyus', aliases: ['vilnyus', 'вильнюс', 'vilnius'], lat: 54.6872, lng: 25.2797 },
    { name: 'Latviya', aliases: ['latviya', 'латвия', 'latvia'], lat: 56.9496, lng: 24.1052 },
    { name: 'Riga', aliases: ['riga', 'рига'], lat: 56.9496, lng: 24.1052 },
    { name: 'Estoniya', aliases: ['estoniya', 'эстония', 'estonia'], lat: 59.4370, lng: 24.7536 },
    { name: 'Tallinn', aliases: ['tallinn', 'таллин', 'таллинн'], lat: 59.4370, lng: 24.7536 },
    { name: 'Polsha', aliases: ['polsha', 'польша', 'poland'], lat: 52.2297, lng: 21.0122 },
    { name: 'Varshava', aliases: ['varshava', 'варшава', 'warsaw', 'warszawa'], lat: 52.2297, lng: 21.0122 },
    { name: 'Germaniya', aliases: ['germaniya', 'германия', 'germany'], lat: 52.5200, lng: 13.4050 },
    { name: 'Berlin', aliases: ['berlin', 'берлин'], lat: 52.5200, lng: 13.4050 },
    { name: 'Finlandiya', aliases: ['finlandiya', 'финляндия', 'finland'], lat: 60.1699, lng: 24.9384 },
    { name: 'Koreya', aliases: ['koreya', 'корея', 'korea'], lat: 37.5665, lng: 126.9780 },
];
/**
 * Haversine formula — 2 nuqta orasidagi masofani km da hisoblash
 */
function haversineKm(lat1, lng1, lat2, lng2) {
    var R = 6371;
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLng = (lng2 - lng1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 1.2); // 1.2x = yo'l bo'yicha taxminiy masofa
}
/**
 * Apostrofe belgilarni normalizatsiya qilish — ʻ ʼ ' ' ` → '
 */
function normalizeApostrophes(text) {
    return text.replace(/[\u02BB\u02BC\u2018\u2019\u0060\u02BD\u02BE\u02C8\u02CA]/g, "'");
}
/**
 * Apostroflarni to'liq olib tashlash — solishtirish uchun
 * "kattaqo'rg'on" → "kattaqorgon", "qo'qon" → "qqon" emas, "qoqon"
 */
function stripApostrophes(text) {
    return text.replace(/['\u02BB\u02BC\u2018\u2019\u0060\u02BD\u02BE\u02C8\u02CA]/g, '');
}
/**
 * Kirill-Lotin gomoglif normalizatsiya — aralash skriptli matnlarni tuzatish
 * Kirilcha A,B,C,E,H,K,M,O,P,T,X → Lotincha ekvivalent
 */
function normalizeCyrLatHomoglyphs(text) {
    var map = {
        'а': 'a', 'в': 'v', 'с': 'c', 'е': 'e', 'н': 'h', 'к': 'k',
        'м': 'm', 'о': 'o', 'р': 'p', 'т': 't', 'х': 'x',
        'А': 'A', 'В': 'V', 'С': 'C', 'Е': 'E', 'Н': 'H', 'К': 'K',
        'М': 'M', 'О': 'O', 'Р': 'P', 'Т': 'T', 'Х': 'X',
    };
    // Faqat matn asosan lotin bo'lganda kirill gomogliflarni almashtiramiz
    var latinCount = (text.match(/[a-zA-Z]/g) || []).length;
    var cyrCount = (text.match(/[а-яА-ЯўқғҳёЎҚҒҲЁ]/g) || []).length;
    if (latinCount <= cyrCount)
        return text; // Asosan kirill — almashtirilmaydi
    return text.replace(/[а-яА-Я]/g, function (ch) { return map[ch] || ch; });
}
/**
 * So'z chegarasini tekshirish — qisqa nomlar boshqa so'z ichida bo'lmasligi kerak
 * Masalan "osh" "toshkent" ichida topilmasligi kerak
 */
function isWordBoundary(text, startIdx, endIdx) {
    var letterRegex = /[a-zа-яўқғҳёіїєґ'0-9]/i;
    var before = startIdx > 0 ? text[startIdx - 1] : ' ';
    var after = endIdx < text.length ? text[endIdx] : ' ';
    return !letterRegex.test(before) && !letterRegex.test(after);
}
/**
 * Keng tarqalgan qo'shimchalar — shahar nomidan ajratish uchun
 */
var CITY_SUFFIXES = [
    // Compound suffixlar (avval tekshiriladi — uzunroq birinchi)
    'данман', 'динман', 'донман', 'danman', 'dinman', 'donman',
    'дамиз', 'димиз', 'damiz', 'dimiz',
    'гача', 'нинг', 'даги',
    'дан', 'дин', 'ден', 'дон', 'тан', 'тин', 'тон',
    'га', 'ге', 'го', 'ка',
    'ни', 'да', 'ий',
    'gacha', 'ning', 'dagi',
    'dan', 'din', 'den', 'don', 'tan', 'tin', 'ton',
    'ga', 'ge', 'go', 'qa',
    'ni', 'da',
];
// ===== PRE-BUILT LOOKUP MAP — O(1) shahar qidirish =====
// Barcha aliaslar (normalized, stripped, homoglyphed) → CityCoord
var _cityLookup = new Map();
var _searchTerms = [];
function _buildLookup() {
    if (_cityLookup.size > 0)
        return;
    for (var _i = 0, CITIES_1 = exports.CITIES; _i < CITIES_1.length; _i++) {
        var city = CITIES_1[_i];
        var normName = normalizeApostrophes(city.name).toLowerCase();
        var strippedName = stripApostrophes(normName);
        // Name va stripped name
        _cityLookup.set(normName, city);
        _cityLookup.set(strippedName, city);
        // Alias + stripped + homoglyphed
        for (var _a = 0, _b = city.aliases; _a < _b.length; _a++) {
            var alias = _b[_a];
            var normAlias = normalizeApostrophes(alias);
            var strippedAlias = stripApostrophes(normAlias);
            var homoAlias = stripApostrophes(normalizeCyrLatHomoglyphs(normAlias));
            _cityLookup.set(normAlias, city);
            _cityLookup.set(strippedAlias, city);
            if (homoAlias !== strippedAlias)
                _cityLookup.set(homoAlias, city);
        }
        // Search termlar — matndagi qidirish uchun
        var allNames = __spreadArray([normName], city.aliases.map(function (a) { return normalizeApostrophes(a); }), true);
        for (var _c = 0, allNames_1 = allNames; _c < allNames_1.length; _c++) {
            var name_1 = allNames_1[_c];
            if (name_1.length < 3)
                continue;
            var nameStripped = stripApostrophes(name_1);
            _searchTerms.push({ term: name_1, city: city, minLen: name_1.length });
            if (nameStripped !== name_1) {
                _searchTerms.push({ term: nameStripped, city: city, minLen: nameStripped.length });
            }
        }
    }
    // Uzunroq termlarni birinchi qidirish (greedy match)
    _searchTerms.sort(function (a, b) { return b.term.length - a.term.length; });
}
// Module yuklanganda lookup quriladi
_buildLookup();
/**
 * Shahar nomini normallashtirish — alias dan asosiy nomga
 * HashMap O(1) lookup + suffix stripping
 */
function findCity(input) {
    var _a, _b, _c, _d;
    var lower = normalizeApostrophes(input).toLowerCase().trim();
    if (lower.length < 2)
        return null;
    // 1. Direct Map lookup — O(1)
    var direct = (_a = _cityLookup.get(lower)) !== null && _a !== void 0 ? _a : _cityLookup.get(stripApostrophes(lower));
    if (direct)
        return direct;
    // 2. Homoglyph normalized
    var homo = stripApostrophes(normalizeCyrLatHomoglyphs(lower));
    var homoMatch = _cityLookup.get(homo);
    if (homoMatch)
        return homoMatch;
    // 3. Suffix stripping (homoglyph normalized ham sinab ko'riladi)
    var homoLower = stripApostrophes(normalizeCyrLatHomoglyphs(lower));
    var variants = homoLower !== homo ? [lower, homoLower] : [lower];
    for (var _i = 0, variants_1 = variants; _i < variants_1.length; _i++) {
        var variant = variants_1[_i];
        for (var _e = 0, CITY_SUFFIXES_1 = CITY_SUFFIXES; _e < CITY_SUFFIXES_1.length; _e++) {
            var suffix = CITY_SUFFIXES_1[_e];
            if (variant.endsWith(suffix) && variant.length >= suffix.length + 2) {
                var base = variant.substring(0, variant.length - suffix.length);
                var m = (_b = _cityLookup.get(base)) !== null && _b !== void 0 ? _b : _cityLookup.get(stripApostrophes(base));
                if (m)
                    return m;
                // Undosh qo'shilishi: "samarqandan" → strip "dan" → "samarqan" + "d" → "samarqand"
                var baseWithFirst = base + suffix[0];
                var m2 = (_c = _cityLookup.get(baseWithFirst)) !== null && _c !== void 0 ? _c : _cityLookup.get(stripApostrophes(baseWithFirst));
                if (m2)
                    return m2;
                // Ikkilangan undosh: "намангангга" → base "наманганг", suf "га" → base[-1]==suf[0] → "наманган"
                if (base.length > 2 && base[base.length - 1] === suffix[0]) {
                    var baseTrimmed = base.substring(0, base.length - 1);
                    var m3 = (_d = _cityLookup.get(baseTrimmed)) !== null && _d !== void 0 ? _d : _cityLookup.get(stripApostrophes(baseTrimmed));
                    if (m3)
                        return m3;
                }
            }
        }
    }
    return null;
}
// Suffixlar — matndagi so'zlardan olib tashlanadigan qo'shimchalar
var _textSuffixes = [
    // Compound suffixlar (uzunroq — avval tekshiriladi)
    'данман', 'динман', 'донман', 'danman', 'dinman', 'donman',
    'дамиз', 'димиз', 'damiz', 'dimiz',
    'даман', 'дан', 'дин', 'ден', 'дон', 'тан', 'тин', 'тон', 'га', 'ге', 'го', 'гача', 'нинг', 'даги', 'да', 'ни', 'ка',
    'daman', 'dan', 'din', 'den', 'don', 'tan', 'tin', 'ton', 'ga', 'ge', 'go', 'qa', 'gacha', 'ning', 'dagi', 'da', 'ni', 'ka',
];
// So'zdan suffix olib tashlash va _cityLookup dan qidirish
function _lookupWord(word) {
    // Direct lookup
    var city = _cityLookup.get(word);
    if (city)
        return city;
    // Stripped apostrophes
    var stripped = stripApostrophes(word);
    if (stripped !== word) {
        city = _cityLookup.get(stripped);
        if (city)
            return city;
    }
    // Homoglyph normalizatsiya (aralash Kirill/Lotin: "тошкентгa" → "тошкентга")
    var homoWord = stripApostrophes(normalizeCyrLatHomoglyphs(word));
    if (homoWord !== word && homoWord !== stripped) {
        city = _cityLookup.get(homoWord);
        if (city)
            return city;
    }
    // Suffix olib tashlash bilan
    // homoWord ham sinab ko'riladi — aralash skriptli suffixlar uchun
    var wordsToTry = homoWord !== word && homoWord !== stripped ? [word, homoWord] : [word];
    for (var _i = 0, wordsToTry_1 = wordsToTry; _i < wordsToTry_1.length; _i++) {
        var w = wordsToTry_1[_i];
        for (var _a = 0, _textSuffixes_1 = _textSuffixes; _a < _textSuffixes_1.length; _a++) {
            var suf = _textSuffixes_1[_a];
            if (w.length >= suf.length + 2 && w.endsWith(suf)) {
                var base = w.substring(0, w.length - suf.length);
                city = _cityLookup.get(base);
                if (city)
                    return city;
                var baseStripped = stripApostrophes(base);
                if (baseStripped !== base) {
                    city = _cityLookup.get(baseStripped);
                    if (city)
                        return city;
                }
                // Undosh qo'shilishi: "samarqandan" → strip "dan" → "samarqan" + "d" → "samarqand"
                var baseWithFirstChar = base + suf[0];
                city = _cityLookup.get(baseWithFirstChar);
                if (city)
                    return city;
                var baseWithFirstStripped = stripApostrophes(baseWithFirstChar);
                if (baseWithFirstStripped !== baseWithFirstChar) {
                    city = _cityLookup.get(baseWithFirstStripped);
                    if (city)
                        return city;
                }
                // Ikkilangan undosh: "намангангга" → strip "га" → "наманганг"
                // base oxiri == suffix boshi → base[-1] olib tashlash → "наманган" → FOUND
                if (base.length > 2 && base[base.length - 1] === suf[0]) {
                    var baseTrimmed = base.substring(0, base.length - 1);
                    city = _cityLookup.get(baseTrimmed);
                    if (city)
                        return city;
                    var baseTrimmedStripped = stripApostrophes(baseTrimmed);
                    if (baseTrimmedStripped !== baseTrimmed) {
                        city = _cityLookup.get(baseTrimmedStripped);
                        if (city)
                            return city;
                    }
                }
            }
        }
    }
    return null;
}
/**
 * Matndagi barcha shaharlarni topish (tartib bo'yicha)
 * OPTIMIZED: Word-based O(1) HashMap lookup — 100x tezroq
 */
function findCitiesInText(text) {
    var _a;
    _buildLookup();
    // Tire, pastki chiziq va boshqa ajratuvchilarni bo'shliqqa almashtirish
    // Aksentli harflarni normalizatsiya qilish (shór → shor, café → cafe)
    var textLower = normalizeApostrophes(text).toLowerCase()
        .replace(/[-–—_/\\|.]+/g, ' ')
        // Emoji va maxsus Unicode belgilarni bo'shliqqa almashtirish
        .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, ' ')
        // Math Monospace / Bold / Italic Unicode → oddiy ASCII (𝙰𝚗𝚍𝚒𝚓𝚘𝚗 → andijon)
        .replace(/[\u{1D400}-\u{1D7FF}]/gu, function (ch) {
        var cp = ch.codePointAt(0);
        // Math Bold A-Z: U+1D400-1D419 → A-Z
        if (cp >= 0x1D400 && cp <= 0x1D419)
            return String.fromCharCode(cp - 0x1D400 + 65);
        // Math Bold a-z: U+1D41A-1D433 → a-z
        if (cp >= 0x1D41A && cp <= 0x1D433)
            return String.fromCharCode(cp - 0x1D41A + 97);
        // Math Italic A-Z: U+1D434-1D44D
        if (cp >= 0x1D434 && cp <= 0x1D44D)
            return String.fromCharCode(cp - 0x1D434 + 65);
        // Math Italic a-z: U+1D44E-1D467
        if (cp >= 0x1D44E && cp <= 0x1D467)
            return String.fromCharCode(cp - 0x1D44E + 97);
        // Math Bold Italic A-Z: U+1D468-1D481
        if (cp >= 0x1D468 && cp <= 0x1D481)
            return String.fromCharCode(cp - 0x1D468 + 65);
        // Math Bold Italic a-z: U+1D482-1D49B
        if (cp >= 0x1D482 && cp <= 0x1D49B)
            return String.fromCharCode(cp - 0x1D482 + 97);
        // Math Sans A-Z: U+1D5A0-1D5B9
        if (cp >= 0x1D5A0 && cp <= 0x1D5B9)
            return String.fromCharCode(cp - 0x1D5A0 + 65);
        // Math Sans a-z: U+1D5BA-1D5D3
        if (cp >= 0x1D5BA && cp <= 0x1D5D3)
            return String.fromCharCode(cp - 0x1D5BA + 97);
        // Math Sans Bold A-Z: U+1D5D4-1D5ED
        if (cp >= 0x1D5D4 && cp <= 0x1D5ED)
            return String.fromCharCode(cp - 0x1D5D4 + 65);
        // Math Sans Bold a-z: U+1D5EE-1D607
        if (cp >= 0x1D5EE && cp <= 0x1D607)
            return String.fromCharCode(cp - 0x1D5EE + 97);
        // Math Monospace A-Z: U+1D670-1D689
        if (cp >= 0x1D670 && cp <= 0x1D689)
            return String.fromCharCode(cp - 0x1D670 + 65);
        // Math Monospace a-z: U+1D68A-1D6A3
        if (cp >= 0x1D68A && cp <= 0x1D6A3)
            return String.fromCharCode(cp - 0x1D68A + 97);
        // Math Monospace 0-9: U+1D7F6-1D7FF
        if (cp >= 0x1D7F6 && cp <= 0x1D7FF)
            return String.fromCharCode(cp - 0x1D7F6 + 48);
        return ch;
    })
        // Combining diacritical marks olib tashlash (бу́лса → булса)
        .replace(/[\u0300-\u036F]/g, '')
        .replace(/[óòôöōő]/g, 'o').replace(/[áàâäãåā]/g, 'a')
        .replace(/[éèêëēė]/g, 'e').replace(/[íìîïīį]/g, 'i')
        .replace(/[úùûüūů]/g, 'u').replace(/[ģğ]/g, 'g').replace(/[ņñ]/g, 'n')
        .replace(/[şš]/g, 'sh').replace(/[çč]/g, 'ch');
    var found = [];
    var usedNames = new Set();
    // Matnni so'zlarga bo'lish
    var wordRegex = /[a-zа-яўқғҳёіїєґ0-9'''ʻ]+/gi;
    var tokens = [];
    var m;
    while ((m = wordRegex.exec(textLower)) !== null) {
        tokens.push({ word: m[0], idx: m.index });
    }
    for (var i = 0; i < tokens.length; i++) {
        var _b = tokens[i], word = _b.word, idx = _b.idx;
        if (word.length < 3)
            continue;
        // 1. Single word lookup
        var city = _lookupWord(word);
        // 2. Two-word combination (e.g., "qizil tepa", "yangi yo'l")
        if (!city && i + 1 < tokens.length && tokens[i + 1].idx - idx - word.length <= 2) {
            var twoWord = word + tokens[i + 1].word;
            city = _lookupWord(twoWord);
            if (!city) {
                city = _lookupWord(word + ' ' + tokens[i + 1].word);
            }
            // 3-word combination (rare, e.g., "yangi qo'rg'on")
            if (!city && i + 2 < tokens.length) {
                var threeWord = twoWord + tokens[i + 2].word;
                city = _lookupWord(threeWord);
            }
        }
        if (city && !usedNames.has(city.name)) {
            found.push({ city: city, index: idx, tokenLen: word.length });
            usedNames.add(city.name);
        }
    }
    // Viloyat+Tuman merging: "Jizzax Paxtakordan" → Jizzax kontekst, Paxtakor haqiqiy joy
    // FAQAT suffix'siz viloyat nomiga ishlaydi (token uzunligi ~ shahar nomi uzunligi)
    // "Samarqanddan" (13 harf) vs "Samarqand" (9 harf) → farq 4 → suffix bor → yo'nalish!
    // "Jizzax" (6 harf) vs "Jizzax" (6 harf) → farq 0 → suffix yo'q → kontekst!
    var filtered = [];
    for (var i = 0; i < found.length; i++) {
        if (i + 1 < found.length && _VILOYAT_NAMES.has(found[i].city.name)) {
            // Viloyat so'zida suffix bormi? Token uzunligi vs shahar nomi uzunligi
            var nameLen = ((_a = found[i].city.aliases[0]) === null || _a === void 0 ? void 0 : _a.length) || found[i].city.name.length;
            var hasSuffix = found[i].tokenLen > nameLen + 1;
            if (!hasSuffix) {
                var dist = haversineKm(found[i].city.lat, found[i].city.lng, found[i + 1].city.lat, found[i + 1].city.lng);
                if (dist < 150) {
                    // Suffix'siz viloyat nomi — kontekst sifatida o'tkazib yuborish
                    continue;
                }
            }
        }
        filtered.push(found[i]);
    }
    return filtered.map(function (f) { return f.city; });
}
// Viloyat nomlari — kontekst sifatida tushib qolishi mumkin
var _VILOYAT_NAMES = new Set([
    'Toshkent', 'Samarqand', 'Buxoro', 'Navoiy', 'Andijon', "Farg'ona",
    'Namangan', 'Jizzax', 'Surxondaryo', 'Qashqadaryo', 'Sirdaryo',
    'Xorazm', 'Nukus',
]);
/**
 * Ikki shahar orasidagi masofani hisoblash
 */
function calculateDistance(from, to) {
    var cityFrom = findCity(from);
    var cityTo = findCity(to);
    if (!cityFrom || !cityTo)
        return null;
    if (cityFrom.name === cityTo.name)
        return 0;
    return haversineKm(cityFrom.lat, cityFrom.lng, cityTo.lat, cityTo.lng);
}
/**
 * Shahar nomini normallashtirilgan ko'rinishda qaytarish
 */
function normalizeCityName(input) {
    var city = findCity(input);
    return city ? city.name : input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}
