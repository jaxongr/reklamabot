"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CARGO_KEYWORDS = exports.VEHICLE_TYPES = exports.DRIVER_KEYWORDS = exports.FOREIGN_DESTINATIONS = exports.FEMALE_NAMES = exports.DISPATCHER_KEYWORDS = void 0;
exports.classifyOrderScope = classifyOrderScope;
/**
 * Dispatcher/logist kalit so'zlari — username yoki ismda bo'lsa BLOCK
 */
exports.DISPATCHER_KEYWORDS = [
    // O'zbek
    'logist', 'logistik', 'logistika', 'lagist', 'lagistik', 'lagistika',
    'dispetcher', 'dispatcher', 'dispcher', 'dispechir', 'dispechr', 'dispatchr',
    'ekspeditor', 'ekspedit', 'yetkazish', 'tashuvchi', 'transport',
    'cargo', 'kargo', 'gruz', 'yuk markaz', 'perevoz', 'perevozk',
    'dostavka', 'dostavki', 'tirkama', 'avtopark',
    'furalar_bor', 'furalar bor',
    // Rus
    'логист', 'логистик', 'логистика', 'диспетчер', 'диспатчер',
    'экспедит', 'перевоз', 'грузоперевоз', 'транспорт', 'карго',
    'груз', 'грузов', 'доставк', 'автопарк', 'прицеп',
    'дальнобой', 'рейс', 'фура', 'тягач', 'газель',
    // Ingliz
    'logistics', 'freight', 'shipping', 'trucker', 'trucking',
    'hauling', 'carrier', 'forwarding', 'forwarder',
    'broker', 'dispatch',
];
/**
 * Ayol ismlari — fake account detector (profilada bo'lsa BLOCK)
 */
exports.FEMALE_NAMES = [
    // O'zbek ayol ismlari
    'nilufar', 'gulnora', 'maftuna', 'dilnoza', 'shahlo',
    'feruza', 'nodira', 'zulfiya', 'barno', 'munira',
    'dilorom', 'hulkar', 'xurshida', 'yulduz', 'sevara',
    'mohira', 'nasiba', 'aziza', 'zuhra', 'iroda',
    'malika', 'kamola', 'dildora', 'sabohat', 'saodat',
    'muazzam', 'umida', 'ra\'no', 'rano', 'shoira',
    'adolat', 'marguba', 'manzura', 'nargiza', 'zarnigor',
    'madina', 'mohichehra', 'nozima', 'oydin', 'mavluda',
    'mahbuba', 'zilola', 'nafisa', 'habiba', 'robiya',
    'mohigul', 'mohinur', 'mohlaroyim', 'mushtariy', 'munavvar',
    'sarvinoz', 'sevinch', 'shahnoza', 'shaxlo', 'sitora',
    'turgunoy', 'tursunoy', 'xilola', 'xurshid', 'yoqut',
    'ziyoda', 'zulayho', 'fotima', 'odinaxon', 'oybarchin',
    'gulbahor', 'gulchehra', 'gulsanam', 'hulkaroy', 'komila',
    // Qo'shimcha ayol ismlari (yangi)
    'ruxshona', 'dilafruz', 'dilshoda', 'zebo', 'raxima',
    'saidaxon', 'ruqiya', 'parizoda', 'xurliy', 'guli',
    'intizor', 'sevil', 'shaxnoza', 'durdona', 'charos',
    'gavhar', 'xayriniso', 'marxabo', 'xulkar', 'oisha',
    'oysha', 'oysha', 'zarina', 'farzona', 'barcha',
    'gulandom', 'xurmo', 'muxlisa', 'dilrabo', 'sadoqat',
    'baxtigul', 'oydinoy', 'xolida', 'maxliyo', 'shoista',
    // Cyrillic O'zbek
    'мохигул', 'мохинур', 'нилуфар', 'гулнора', 'мафтуна',
    'дилноза', 'шахло', 'феруза', 'нодира', 'зулфия',
    'малика', 'мадина', 'зухра', 'азиза', 'умида',
    'насиба', 'фотима', 'севинч', 'шахноза', 'сарвиноз',
    'зиёда', 'ситора', 'гулбахор', 'гулчехра', 'комила',
    // Qo'shimcha kirill (yangi)
    'дилшода', 'рухшона', 'дилафруз', 'зебо', 'рахима',
    'руқия', 'паризода', 'хурлий', 'саидахон', 'интизор',
    'севиля', 'севилья', 'гавхар', 'хайриниса', 'зарина',
    // Rus ayol ismlari
    'елена', 'ольга', 'наташа', 'наталья', 'анна',
    'мария', 'марина', 'ирина', 'татьяна', 'светлана',
    'екатерина', 'катя', 'оксана', 'юлия', 'алина',
    'дарья', 'полина', 'виктория', 'вика', 'кристина',
    'диана', 'лилия', 'людмила', 'галина', 'нина',
    'валентина', 'лариса', 'тамара', 'надежда', 'вера',
    // -ova/-eva familiya suffixlari (ayol belgisi)
    // NOT: Bu familiya suffixlari — ismlar orasida to'g'ri kelmaydi,
    // ular alohida tekshiriladi (Rule 3 kengaytmasi)
];
/**
 * Xorijiy manzillar — O'zbekistondan tashqari joylar (xabarda bo'lsa BLOCK)
 */
exports.FOREIGN_DESTINATIONS = [
    // Rossiya shaharlari
    'москва', 'moskva', 'moscow', 'питер', 'петербург', 'peterburg',
    'новосибирск', 'novosibirsk', 'казань', 'kazan',
    'екатеринбург', 'yekaterinburg', 'красноярск', 'krasnoyarsk',
    'челябинск', 'chelyabinsk', 'омск', 'omsk', 'самара', 'samara',
    'ростов', 'rostov', 'уфа', 'ufa', 'волгоград', 'volgograd',
    'пермь', 'perm', 'воронеж', 'voronezh', 'тюмень', 'tyumen',
    'краснодар', 'krasnodar', 'сочи', 'sochi',
    'нижний новгород', 'nizhniy novgorod', 'хабаровск',
    'владивосток', 'иркутск', 'новокузнецк', 'барнаул',
    // Rossiya — qo'shimcha shaharlar
    'ставрополь', 'stavropol', 'тамбов', 'tambov',
    'серпухов', 'serpukhov', 'ворсино', 'vorsino',
    'егорьевск', 'yegorievsk', 'орехово', 'orekhovo',
    'шарья', 'sharya', 'рязань', 'ryazan',
    'тула', 'tula', 'калуга', 'kaluga',
    'брянск', 'bryansk', 'курск', 'kursk',
    'белгород', 'belgorod', 'липецк', 'lipetsk',
    'пенза', 'penza', 'саратов', 'saratov',
    'оренбург', 'orenburg', 'ульяновск', 'ulyanovsk',
    'ижевск', 'izhevsk', 'тольятти', 'tolyatti',
    'набережные челны', 'naberezhnye chelny',
    'астрахань', 'astrakhan', 'махачкала', 'makhachkala',
    'владикавказ', 'vladikavkaz', 'грозный', 'grozny',
    'нальчик', 'nalchik', 'элиста', 'elista',
    'кисловодск', 'kislovodsk', 'пятигорск', 'pyatigorsk',
    'минводы', 'минеральные воды', 'mineralnye vody',
    'новороссийск', 'novorossiysk', 'анапа', 'anapa',
    'геленджик', 'gelendzhik', 'таганрог', 'taganrog',
    'подольск', 'podolsk', 'мытищи', 'mytishchi',
    'балашиха', 'балашиха', 'люберцы', 'lyubertsy',
    'домодедово', 'domodedovo', 'внуково', 'vnukovo',
    'вологда', 'vologda', 'кострома', 'kostroma',
    'ярославль', 'yaroslavl', 'иваново', 'ivanovo',
    'владимир', 'vladimir', 'тверь', 'tver',
    'мурманск', 'murmansk', 'архангельск', 'arkhangelsk',
    'сургут', 'surgut', 'нижневартовск', 'nizhnevartovsk',
    'томск', 'tomsk', 'кемерово', 'kemerovo',
    'чита', 'chita', 'улан-удэ', 'ulan-ude',
    'якутск', 'yakutsk', 'магадан', 'magadan',
    // Qozog'iston
    'алматы', 'almaty', 'астана', 'astana', 'нур-султан', 'nursultan',
    'шымкент', 'shymkent', 'караганда', 'karaganda',
    'актау', 'aktau', 'актобе', 'aktobe',
    'атырау', 'atyrau', 'тараз', 'taraz',
    'павлодар', 'pavlodar', 'семей', 'semey',
    'костанай', 'kostanay', 'кызылорда', 'kyzylorda',
    'туркестан', 'turkestan', 'turkiston',
    'хоргос', 'khorgos', 'xorgos',
    // Turkmaniston
    'ашхабад', 'ashgabat', 'ашгабат',
    'мары', 'mary', 'туркменабад', 'turkmenabat',
    'дашогуз', 'dashoguz', 'балканабад', 'balkanabat',
    // Qirg'iziston
    'бишкек', 'bishkek',
    'ош', 'osh', 'жалал-абад', 'жалалабад', 'jalolobod', 'jalal-abad',
    'каракол', 'karakol', 'нарын', 'naryn',
    'токмок', 'tokmok',
    // Tojikiston
    'душанбе', 'dushanbe',
    'худжанд', 'khujand', 'xujand',
    'куляб', 'kulob', 'курган-тюбе', 'qurghonteppa',
    'истаравшан', 'istaravshan', 'бохтар', 'bokhtar',
    // Boshqa
    'стамбул', 'istanbul', 'анкара', 'ankara',
    'дубай', 'dubai', 'абу-даби',
    'минск', 'minsk', 'киев', 'kiev', 'kyiv',
    'литва', 'litva', 'латвия', 'latviya',
    'грузия', 'gruziya', 'georgia', 'тбилиси', 'tbilisi',
    'азербайджан', 'ozarbayjon', 'баку', 'baku',
    'иран', 'iran', 'тегеран', 'tehran',
    'афганистан', 'afganistan', 'кабул', 'kabul',
    'пакистан', 'pakistan', 'карачи', 'karachi',
    'индия', 'india', 'мумбаи', 'mumbai',
    'китай', 'xitoy', 'china', 'пекин', 'beijing',
    'урумчи', 'urumqi', 'кашгар', 'kashgar',
    // Umumiy
    'россия', 'rossiya', 'russia', 'рф',
    'казахстан', 'kazakhstan', 'qozogiston',
    'туркменистан', 'turkmenistan',
    'кыргызстан', 'kyrgyzstan', 'qirgiziston',
    'таджикистан', 'tajikistan', 'tojikiston',
    'турция', 'turkey', 'turkiya',
];
/**
 * Haydovchi e'lonlari — transport taklif qiluvchi xabarlar
 * "mashina bor", "fura bo'sh", "haydovchiman" kabi
 */
exports.DRIVER_KEYWORDS = [
    // === LATIN O'ZBEK — mashina/transport taklif ===
    'mashina bor', 'moshina bor', 'mashina bo\'sh', 'moshina bo\'sh',
    'mashina bosh', 'moshina bosh', 'mashina tayyor', 'moshina tayyor',
    'mashina chiqyapti', 'mashina ketyapti', 'mashina chiqadi', 'mashina ketadi',
    'mashinam bor', 'moshinam bor', 'mashina chiqmoqda',
    'transport bor', 'transportim bor', 'transport tayyor',
    // Fura
    'fura bor', 'fura bo\'sh', 'fura bosh', 'fura tayyor',
    'fura chiqyapti', 'fura ketyapti', 'fura chiqadi', 'furam bor',
    // Transport turlari + bor/bo'sh
    'isuzu bor', 'isuzu bo\'sh', 'isuzu bosh', 'isuzu tayyor', 'isuzum bor',
    'gazel bor', 'gazel bo\'sh', 'gazel bosh', 'gazel tayyor', 'gazelim bor',
    'labo bor', 'labo bo\'sh', 'labo bosh', 'labom bor',
    'damas bor', 'damas bo\'sh', 'damas bosh', 'damasim bor',
    'kamaz bor', 'kamaz bo\'sh', 'kamaz bosh', 'kamaz tayyor', 'kamazim bor',
    'man bor', 'man bo\'sh', 'man bosh',
    'volvo bor', 'volvo bo\'sh', 'volvo bosh',
    'scania bor', 'skaniya bor', 'scania bo\'sh',
    'tent bor', 'tent bo\'sh', 'tent bosh', 'tent tayyor',
    'refka bor', 'ref bor', 'ref bo\'sh', 'ref tayyor',
    'sprinter bor', 'sprinter bo\'sh', 'sprinterim bor',
    'howo bor', 'howo bo\'sh', 'shacman bor', 'shacman bo\'sh',
    'porter bor', 'porter bo\'sh', 'porterim bor',
    // Yuk olish
    'yuk olaman', 'yuk olamiz', 'yuk oladi', 'yuk olamz',
    'yuk olib ketaman', 'yuk olib ketamiz', 'yuk olib boraman',
    'yuk qabul qilaman', 'yuk qabul qilamiz',
    'yuk tashiyman', 'yuk tashiymiz', 'yuk tashiydi',
    'yuk tashib beraman', 'yuk tashib beramiz',
    'yuk eltaman', 'yuk eltamiz',
    // Yuk bolsa — barcha variantlar
    'yuk bolsa olamiz', 'yuk bolsa olaman', 'yuk bolsa olamz',
    'yuk bo\'lsa olamiz', 'yuk bo\'lsa olaman',
    'yuklar bolsa', 'yuklar bo\'lsa', 'yuklar bolsa olamiz',
    'yuk bersa olamiz', 'yuk bersa olaman', 'yuklar bersa',
    'yuk bolsa tashiymiz', 'yuk bolsa tashiyman',
    'yuk bolsa chiqamiz', 'yuk bolsa chiqaman',
    'yuk bolsa ketamiz', 'yuk bolsa boraman',
    // Yuk kerak / izlash
    'yuk kerak', 'yuklar kerak', 'yuk izlayman', 'yuk izlayapmiz',
    'yuk qidiraman', 'yuk qidiryapmiz', 'yuk qidiramiz',
    'yukka chiqaman', 'yukka chiqamiz', 'yukka chiqmoqchiman',
    'yukka tayyormiz', 'yukka tayyorman', 'yukka tayyor',
    'yukka ketaman', 'yukka ketamiz', 'yukka boraman',
    // Haydovchi / shofer
    'haydovchiman', 'haydovchimiz', 'shoferman', 'shofermiz',
    'men haydovchi', 'biz haydovchi',
    // Bo'sh transport
    'bo\'sh mashina', 'bosh mashina', 'bo\'sh transport', 'bosh transport',
    'bo\'sh fura', 'bosh fura', 'bo\'sh isuzu', 'bosh isuzu',
    'bo\'sh kamaz', 'bosh kamaz', 'bo\'sh tent', 'bosh tent',
    'bo\'sh gazel', 'bosh gazel', 'bo\'sh ref', 'bosh ref',
    // Bo'sh qaytish
    'bosh qaytaman', 'bo\'sh qaytaman', 'bosh qaytamiz', 'bo\'sh qaytamiz',
    'bosh ketaman', 'bo\'sh ketaman', 'bosh ketamiz', 'bo\'sh ketamiz',
    'bosh boraman', 'bo\'sh boraman', 'bosh boramiz', 'bo\'sh boramiz',
    // Ortish / yuklash
    'ortishga tayyor', 'yuklashga tayyor', 'yuklay olamiz', 'yuklay olaman',
    'ortish mumkin', 'yuklash mumkin',
    // Avtomobil
    'avtomobil bor', 'avto bor', 'tirkama bor', 'tirkamali',
    // Chiqish / ketish
    'chiqaman yuk', 'ketaman yuk', 'boraman yuk',
    'chiqamiz yuk', 'ketamiz yuk', 'boramiz yuk',
    'chiqyapman', 'ketyapman', 'borayapman',
    // === РУССКИЙ ===
    'машина есть', 'машина свободна', 'машина свободн', 'машина пустая', 'машина готова',
    'фура есть', 'фура свободна', 'фура свободн', 'фура пустая', 'фура готова',
    'газель есть', 'газель свободна', 'газель пустая', 'газель готова',
    'камаз есть', 'камаз свободен', 'камаз пустой', 'камаз готов',
    'тент есть', 'тент свободен', 'тент пустой', 'тент готов',
    'реф есть', 'реф свободен', 'рефка есть', 'рефка свободна',
    'борт есть', 'борт свободен', 'борт готов',
    'исузу есть', 'исузу свободен', 'исузу пустой',
    // Груз взять / искать
    'возьму груз', 'возьмем груз', 'возьмём груз',
    'беру груз', 'берем груз', 'берём груз',
    'заберу груз', 'заберем груз', 'заберём груз',
    'ищу груз', 'ищем груз', 'нужен груз', 'нужны грузы',
    'ищу загрузку', 'ищем загрузку', 'нужна загрузка',
    'ищу попутный', 'попутный груз',
    'готов к погрузке', 'готовы к погрузке',
    'готов к загрузке', 'готовы к загрузке',
    'подам машину', 'подам фуру', 'подадим машину', 'подадим фуру',
    // Водитель
    'я водитель', 'я шофер', 'я шофёр',
    'мы водители', 'мы шоферы', 'мы шофёры',
    // Свободная
    'свободная машина', 'пустая машина', 'свободная фура', 'пустая фура',
    'свободный тент', 'пустой тент', 'свободный борт', 'пустой борт',
    // Еду/иду пустой
    'еду пустой', 'еду пустая', 'еду порожний', 'еду порожняком',
    'едем пустые', 'едем порожняком', 'едем порожние',
    'иду пустой', 'идем пустые', 'идём пустые',
    'машина идет', 'машина идёт', 'машина едет',
    'фура идет', 'фура идёт', 'фура едет',
    'грузы возьму', 'грузы возьмем', 'грузы беру', 'грузы берем',
    'догружу', 'догрузим', 'догрузимся', 'подгружу', 'подгрузим',
    'стою в', 'стоим в', 'стою на', 'стоим на',
    'выезжаю', 'выезжаем', 'отправляюсь', 'отправляемся',
    // === KIRILL O'ZBEK ===
    'машина бор', 'мошина бор', 'машина бўш', 'мошина бўш',
    'машина буш', 'мошина буш', 'машина бош', 'мошина бош',
    'машина тайёр', 'мошина тайёр', 'машинам бор', 'мошинам бор',
    'машина чиқяпти', 'машина кетяпти', 'машина чиқади', 'машина кетади',
    'транспорт бор', 'транспортим бор', 'транспорт тайёр',
    // Фура
    'фура бор', 'фура бўш', 'фура буш', 'фура бош', 'фура тайёр',
    'фура чиқяпти', 'фура кетяпти', 'фура чиқади', 'фурам бор',
    // Транспорт + бор/бўш
    'исузу бор', 'исузу бўш', 'исузум бор', 'исузу тайёр',
    'газел бор', 'газел бўш', 'газел тайёр',
    'камаз бор', 'камаз бўш', 'камаз тайёр', 'камазим бор',
    'лабо бор', 'лабо бўш', 'лабом бор',
    'дамас бор', 'дамас бўш', 'дамасим бор',
    'тент бор', 'тент бўш', 'тент тайёр',
    'рефка бор', 'реф бор', 'реф бўш', 'реф тайёр',
    'спринтер бор', 'спринтер бўш', 'спринтерим бор',
    'хово бор', 'хово бўш', 'шакман бор', 'шакман бўш',
    'портер бор', 'портер бўш', 'портерим бор',
    // Юк олиш
    'юк оламан', 'юк оламиз', 'юк олади', 'юк оламз',
    'юк олиб кетаман', 'юк олиб кетамиз', 'юк олиб бораман',
    'юк қабул қиламан', 'юк қабул қиламиз',
    'юк ташийман', 'юк ташиймиз', 'юк ташийди',
    'юк ташиб бераман', 'юк ташиб берамиз',
    'юк элтаман', 'юк элтамиз', 'юк олиб келаман',
    // Юк бўлса / болса / булса
    'юклар бўлса оламиз', 'юклар бўлса оламан', 'юклар булса оламиз', 'юклар булса',
    'юк бўлса оламиз', 'юк бўлса оламан', 'юк булса оламиз', 'юк булса олам',
    'юк болса оламиз', 'юк болса оламан', 'юклар болса оламиз', 'юклар болса',
    'юк бўлса ташиймиз', 'юк болса ташиймиз', 'юк булса ташиймиз',
    'юк бўлса чиқамиз', 'юк болса чиқамиз', 'юк булса чиқамиз',
    'юк берса оламиз', 'юк берса оламан', 'юклар берса',
    'юк берса ташиймиз', 'юклар берса оламиз',
    'юк болса кетамиз', 'юк болса бораман',
    // Юк керак / излаш
    'юк керак', 'юклар керак', 'юк излайман', 'юк излаяпмиз',
    'юк қидираман', 'юк қидиряпмиз', 'юк қидирамиз',
    'юкка чиқаман', 'юкка чиқамиз', 'юкка чиқмоқчиман',
    'юкка тайёрмиз', 'юкка тайёрман', 'юкка тайёр',
    'юкка кетаман', 'юкка кетамиз', 'юкка бораман',
    // Ҳайдовчи / шофер
    'ҳайдовчиман', 'ҳайдовчимиз', 'шоферман', 'шофермиз',
    'мен ҳайдовчи', 'биз ҳайдовчи',
    'хайдовчиман', 'хайдовчимиз',
    // Бўш транспорт
    'бўш машина', 'бўш фура', 'бўш транспорт',
    'буш машина', 'буш фура', 'бош машина', 'бош фура',
    'бўш исузу', 'бўш камаз', 'бўш тент',
    'бўш газел', 'бўш реф', 'бош реф',
    // Ортиш / юклаш
    'ортишга тайёр', 'юклашга тайёр', 'юклай оламиз', 'юклай оламан',
    'ортиш мумкин', 'юклаш мумкин',
    // Бўш қайтиш
    'бўш қайтаман', 'бўш қайтамиз', 'буш қайтаман', 'буш қайтамиз',
    'бош қайтаман', 'бош қайтамиз', 'бош кетаман', 'бош кетамиз',
    'бўш кетаман', 'бўш кетамиз', 'бўш бораман', 'бўш борамиз',
    'бошига кетаман', 'бўшига кетаман',
    // Чиқиш / кетиш
    'чиқаман юк', 'кетаман юк', 'бораман юк',
    'чиқамиз юк', 'кетамиз юк', 'борамиз юк',
    'тиркама бор', 'тиркамали',
];
/**
 * Unicode-aware word boundary — \b Kirilchada ISHLAMAYDI!
 * JavaScript \b faqat ASCII [a-zA-Z0-9_] bilan ishlaydi
 * Kiril harflar uchun lookbehind/lookahead kerak
 */
var WB = '(?<![a-zA-Zа-яА-ЯўқғҳёЎҚҒҲЁ])';
var WBE = '(?![a-zA-Zа-яА-ЯўқғҳёЎҚҒҲЁ])';
/**
 * Mashina turlari — driver type aniqlash
 * \b O'RNIGA Unicode-aware boundary ishlatiladi!
 */
exports.VEHICLE_TYPES = [
    // Yirik yuk mashinalari
    { pattern: new RegExp("".concat(WB, "(?:fura|\u0444\u0443\u0440\u0430|furalar|\u0444\u0443\u0440\u0430\u043B\u0430\u0440|furra|trailer|\u0442\u0440\u0435\u0439\u043B\u0435\u0440|\u0442\u044F\u0433\u0430\u0447|tyagach|odinochka|\u043E\u0434\u0438\u043D\u043E\u0447\u043A\u0430|padushka|\u043F\u043E\u0434\u0443\u0448\u043A\u0430)").concat(WBE), 'i'), type: 'Fura' },
    { pattern: new RegExp("".concat(WB, "(?:kamaz|\u043A\u0430\u043C\u0430\u0437|\u043A\u0430\u043C\u0430s)").concat(WBE), 'i'), type: 'Kamaz' },
    { pattern: new RegExp("".concat(WB, "man").concat(WBE), 'i'), type: 'MAN' },
    { pattern: new RegExp("".concat(WB, "\u043C\u0430\u043D").concat(WBE), 'i'), type: 'MAN' },
    { pattern: new RegExp("".concat(WB, "(?:volvo|\u0432\u043E\u043B\u044C\u0432\u043E)").concat(WBE), 'i'), type: 'Volvo' },
    { pattern: new RegExp("".concat(WB, "(?:scania|\u0441\u043A\u0430\u043D\u0438\u044F|skaniya|\u0441\u043A\u0430\u043D\u0438\u0430)").concat(WBE), 'i'), type: 'Scania' },
    { pattern: new RegExp("".concat(WB, "(?:daf|\u0434\u0430\u0444)").concat(WBE), 'i'), type: 'DAF' },
    { pattern: new RegExp("".concat(WB, "(?:mercedes|\u043C\u0435\u0440\u0441\u0435\u0434\u0435\u0441|\u0430\u043A\u0442\u0440\u043E\u0441|actros|atego|\u0430\u0442\u0435\u0433\u043E)").concat(WBE), 'i'), type: 'Mercedes' },
    { pattern: new RegExp("".concat(WB, "(?:iveco|\u0438\u0432\u0435\u043A\u043E)").concat(WBE), 'i'), type: 'Iveco' },
    { pattern: new RegExp("".concat(WB, "(?:howo|\u0445\u043E\u0432\u043E|sinotruk|\u0441\u0438\u043D\u043E\u0442\u0440\u0443\u043A)").concat(WBE), 'i'), type: 'HOWO' },
    { pattern: new RegExp("".concat(WB, "(?:shacman|\u0448\u0430\u043A\u043C\u0430\u043D|\u0448\u0430\u0445\u043C\u0430\u043D|\u0448\u0430\u0447\u043C\u0430\u043D|\u0447\u0430\u043A\u043C\u0430\u043D|chakman)").concat(WBE), 'i'), type: 'Shacman' },
    { pattern: new RegExp("".concat(WB, "(?:dongfeng|\u0434\u043E\u043D\u0433\u0444\u0435\u043D\u0433|\u0434\u043E\u043D\u0444\u0435\u043D\u0433)").concat(WBE), 'i'), type: 'Dongfeng' },
    // O'rtacha yuk mashinalari
    { pattern: new RegExp("".concat(WB, "(?:isuzu|isuszu|isuzi|isizu|isusu|\u0438\u0441\u0443\u0437\u0443|\u0438\u0437\u0443\u0437\u0443|\u0438\u0441\u0443\u0437\u0438|\u0438\u0441\u0443\u0437\u0438\u0439|izuzu|\u0435\u0441\u0443\u0437\u0443|\u0435\u0441\u0443\u0437\u0438\u0439|\u044D\u0441\u0443\u0437\u0443)").concat(WBE), 'i'), type: 'Isuzu' },
    { pattern: new RegExp("".concat(WB, "(?:gazel|\u0433\u0430\u0437\u0435\u043B\u044C|\u0433\u0430\u0437\u0435\u043B)").concat(WBE), 'i'), type: 'Gazel' },
    { pattern: new RegExp("".concat(WB, "(?:hyundai|\u0445\u044E\u043D\u0434\u0430\u0439|\u0445\u0443\u043D\u0434\u0430\u0439|\u043F\u043E\u0440\u0442\u0435\u0440|porter|\u0445\u0451\u043D\u0434\u0430\u0439)").concat(WBE), 'i'), type: 'Porter' },
    { pattern: new RegExp("".concat(WB, "(?:mitsubishi|\u043C\u0438\u0442\u0441\u0443\u0431\u0438\u0448\u0438|\u043A\u0430\u043D\u0442\u0435\u0440|canter|fuso|\u0444\u0443\u0441\u043E)").concat(WBE), 'i'), type: 'Canter' },
    { pattern: new RegExp("".concat(WB, "(?:foton|\u0444\u043E\u0442\u043E\u043D)").concat(WBE), 'i'), type: 'Foton' },
    { pattern: new RegExp("".concat(WB, "(?:jac|\u0436\u0430\u043A|\u0434\u0436\u0430\u043A)").concat(WBE), 'i'), type: 'JAC' },
    // Kichik yuk mashinalari
    { pattern: new RegExp("".concat(WB, "(?:labo|\u043B\u0430\u0431\u043E)").concat(WBE), 'i'), type: 'Labo' },
    { pattern: new RegExp("".concat(WB, "(?:damas|\u0434\u0430\u043C\u0430\u0441)").concat(WBE), 'i'), type: 'Damas' },
    { pattern: new RegExp("".concat(WB, "(?:largus|\u043B\u0430\u0440\u0433\u0443\u0441)").concat(WBE), 'i'), type: 'Largus' },
    // Kuzov turi
    { pattern: new RegExp("".concat(WB, "(?:tent(?:li|ovka|ofka)?|\u0442\u0435\u043D\u0442(?:\u043E\u0432(?:\u043A\u0430|\u044B\u0439))?|\u0442\u0435\u043D\u0442\u043E\u0444\u043A\u0430|\u0442\u0435\u0442\u043E\u0444\u043A\u0430|tentofka|shtora(?:lik)?|\u0448\u0442\u043E\u0440\u0430|\u0448\u0442\u043E\u0440\u043A\u0430|\u0448\u0442\u043E\u0440\u043A\u0430\u043B\u0438|shtoralik|\u043F\u043B\u043E\u0448\u0430\u0434\u043A\u0430|\u043F\u043B\u043E\u0449\u0430\u0434\u043A\u0430)").concat(WBE), 'i'), type: 'Tentli' },
    { pattern: new RegExp("".concat(WB, "(?:ref(?:ka|ri)?|\u0440\u0435\u0444(?:\u043A\u0430|\u0430|\u0440\u0438|\u0440\u0438\u0436\u0435\u0440\u0430\u0442\u043E\u0440)?)").concat(WBE), 'i'), type: 'Refrijerator' },
    { pattern: new RegExp("".concat(WB, "(?:samosval|\u0441\u0430\u043C\u043E\u0441\u0432\u0430\u043B|tanar|\u0442\u0430\u043D\u0430\u0440)").concat(WBE), 'i'), type: 'Samosval' },
    { pattern: new RegExp("".concat(WB, "(?:bortovoy|\u0431\u043E\u0440\u0442\u043E\u0432\u043E\u0439|bort|\u0431\u043E\u0440\u0442|shalandra|\u0448\u0430\u043B\u0430\u043D\u0434\u0440\u0430|\u0448\u0430\u043B\u0430\u043D\u0434\u0430)").concat(WBE), 'i'), type: 'Bortovoy' },
    { pattern: new RegExp("".concat(WB, "(?:konteyner|\u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440|container)").concat(WBE), 'i'), type: 'Konteyner' },
    { pattern: new RegExp("".concat(WB, "(?:avtovoz|\u0430\u0432\u0442\u043E\u0432\u043E\u0437|car\\s*carrier)").concat(WBE), 'i'), type: 'Avtovoz' },
    { pattern: new RegExp("".concat(WB, "(?:cisterna|\u0446\u0438\u0441\u0442\u0435\u0440\u043D\u0430|tanker|\u0442\u0430\u043D\u043A\u0435\u0440|benzovoz|\u0431\u0435\u043D\u0437\u043E\u0432\u043E\u0437)").concat(WBE), 'i'), type: 'Sisterna' },
    { pattern: new RegExp("".concat(WB, "(?:evakuator|\u044D\u0432\u0430\u043A\u0443\u0430\u0442\u043E\u0440)").concat(WBE), 'i'), type: 'Evakuator' },
    { pattern: new RegExp("".concat(WB, "(?:manipulyator|\u043C\u0430\u043D\u0438\u043F\u0443\u043B\u044F\u0442\u043E\u0440|kran|\u043A\u0440\u0430\u043D)").concat(WBE), 'i'), type: 'Manipulyator' },
    { pattern: new RegExp("".concat(WB, "(?:lowboy|\u043B\u043E\u0443\u0431\u043E\u0439|tral|\u0442\u0440\u0430\u043B)").concat(WBE), 'i'), type: 'Tral' },
    // Qo'shimcha turlar
    { pattern: new RegExp("".concat(WB, "(?:sprinter|\u0441\u043F\u0440\u0438\u043D\u0442\u0435\u0440)").concat(WBE), 'i'), type: 'Sprinter' },
    { pattern: new RegExp("".concat(WB, "(?:pritsep|\u043F\u0440\u0438\u0446\u0435\u043F|pirisip|\u043F\u0440\u0438\u0441\u0435\u043F|\u0442\u0438\u0440\u043A\u0430\u043C\u0430)").concat(WBE), 'i'), type: 'Pritsep' },
];
/**
 * Yuk (cargo) e'lon belgilari — "birinchi qo'l" yuk beruvchi xabarlar
 * Bu so'zlardan kamida BITTASI topilishi kerak
 */
exports.CARGO_KEYWORDS = [
    // Yuk bor / kerak
    'yuk bor', 'yuk', 'yuк', 'yuki bor',
    'юк', 'юк бор', 'юклаш',
    'груз', 'груз есть', 'грузим',
    // Tonna / og'irlik
    'tonna', 'tonn', 'тонн', 'тонна', 'ton ',
    // Marshrut belgilari
    '➡', '→', '►', '⬅', '↔',
    // Yuk turlari
    "bug'doy", 'пшениц', "g'alla", 'paxta', 'хлопок',
    "ko'mir", 'уголь', 'sement', 'цемент',
    'temir', 'металл', 'armat', 'meva', 'фрукт',
    'sabzavot', 'овощ', 'un ', 'мука',
    'qurilish', 'строй', 'yog\'', 'масл',
    'shifer', 'шифер', 'kirpich', 'кирпич',
    'qum', 'pesok', 'песок', 'shag\'al', 'щебень',
    // Yuk berish
    'yuklash', 'yukla', 'ortish', 'погруз', 'загруз',
    'ortiladi', 'yuklanadi', 'yuklandi',
    // Narx
    "so'm", 'sum', 'сум', 'сўм', 'dollar', '$', 'usd',
    // O'zbekiston manzillari (Latin)
    'toshkent', 'samarqand', 'buxoro', 'navoiy', 'andijon',
    'farg\'ona', 'fergana', 'namangan', 'qarshi', 'termiz',
    'nukus', 'urganch', 'jizzax', 'guliston', 'denov',
    'chirchiq', 'olmaliq', 'angren', 'kokand', 'marg\'ilon',
    // O'zbekiston manzillari (Rus kiril)
    'ташкент', 'самарканд', 'бухара', 'навои', 'андижан',
    'фергана', 'наманган', 'карши', 'термез',
    'нукус', 'ургенч', 'джизак',
    // O'zbekiston manzillari (O'zbek kiril)
    'тошкент', 'самарқанд', 'бухоро', 'андижон',
    'фарғона', 'наманган', 'қарши', 'термиз',
    'жиззах', 'гулистон', 'денов', 'сурхондарё',
    'қашқадарё', 'навоий', 'хоразм', 'сирдарё',
    // Tel raqam belgilari
    '+998', '998',
    // Haydovchi e'lonlari ham o'tishi kerak (driver filter uchun)
    'mashina bor', 'moshina bor', 'fura bor', 'fura bo\'sh',
    'yuk olaman', 'yuk olamiz', 'haydovchiman', 'shoferman',
    'машина бор', 'фура бор', 'юк оламан',
    'машина есть', 'фура есть', 'возьму груз', 'ищу груз',
    'машина свободн', 'фура свободн',
    'bo\'sh mashina', 'bosh mashina', 'bo\'sh fura', 'bosh fura',
];
/**
 * Buyurtma scope klassifikatsiyasi — INTERNAL / IMPORT / EXPORT
 * FOREIGN_DESTINATIONS da mavjud shahar topilsa → IMPORT/EXPORT
 */
/**
 * O'zbekiston shaharlari — scope klassifikatsiyada himoya uchun.
 * Agar cargoFrom/cargoTo shu ro'yxatda bo'lsa → xorijiy emas.
 */
var UZBEK_CITIES = new Set([
    // Viloyat markazlari
    'toshkent', 'тошкент', 'ташкент', 'tashkent',
    'samarqand', 'самарканд', 'самарқанд', 'samarkand',
    'buxoro', 'бухара', 'бухоро', 'bukhara',
    'navoiy', 'навои', 'navoi',
    'andijon', 'андижан', 'андижон', 'andijan',
    "farg'ona", 'фергана', 'фаргона', 'фарғона', 'fergana', 'fargona',
    'namangan', 'наманган',
    'qarshi', 'карши', 'қарши', 'karshi',
    'termiz', 'термез', 'термиз', 'termez',
    'nukus', 'нукус',
    'urganch', 'ургенч', 'urgench',
    'jizzax', 'джизак', 'жиззах', 'jizzakh',
    'guliston', 'гулистон', 'гулистан', 'gulistan',
    // Viloyatlar
    'qashqadaryo', 'қашқадарё', 'кашкадарья', 'kashkadarya',
    'surxondaryo', 'сурхандарья', 'surkhandarya',
    'xorazm', 'хорезм', 'khorezm', 'xorazm',
    'sirdaryo', 'сырдарья', 'syrdarya',
    // Toshkent viloyati shaharlari
    'bekobod', 'бекабад', 'bekabad',
    'chirchiq', 'чирчик', 'chirchik',
    'olmaliq', 'алмалык', 'almalyk',
    'angren', 'ангрен',
    'nurafshon', 'нурафшон',
    'ohangaron', 'ахангаран',
    'yangiyul', 'янгиюль', "yangiyo'l",
    'chinoz', 'чиноз',
    'sergeli', 'сергели',
    'parkent', 'паркент',
    // Boshqa shaharlar
    'shahrisabz', 'шахрисабз',
    'kitob', 'китаб', 'китоб',
    'koson', 'касан', 'косон',
    'chiroqchi', 'чирокчи', 'чироқчи',
    'denov', 'денау', 'денов',
    'urgut', 'ургут',
    'kattaqorgon', 'каттакурган', 'каттақўрғон',
    'kogon', 'каган', 'коган',
    "qo'qon", 'коканд', 'қўқон', 'kokand',
    'margilan', 'маргилан', "marg'ilon",
    'quvasoy', 'кувасай',
    'rishton', 'риштан', 'риштон',
    'pop', 'поп',
    'uchqorgon', 'учкурган', 'учқўрғон',
    'chust', 'чуст',
    'vodil', 'водил',
    'buvayda', 'бувайда',
    'yozyovon', 'язъяван', 'ёзёвон',
    'dehqonobod', 'дехканабад', 'деҳқонобод',
    'angor', 'ангор',
    'jomboy', 'жомбой', 'джамбай',
    'toyloq', 'тойлоқ', 'тайлак',
    "qo'rg'ontepa", 'кургантепа', 'курғонтепа',
    'xiva', 'хива', 'khiva',
    'sho\'rchi', 'шурчи', 'шўрчи',
    'boysun', 'байсун', 'бойсун',
    'sherobod', 'шерабад', 'шеробод',
    'muborak', 'мубарек', 'муборак',
    'navbahor', 'навбахор',
    'nurota', 'нурата', 'нурота',
    'karmana', 'кармана',
    'zarafshon', 'зарафшан', 'зарафшон',
    'gazli', 'газли',
    'turtkul', 'тўрткўл', 'турткуль',
    'kungrad', 'кунград', 'қўнғирот',
    'xonqa', 'ханка', 'хонқа',
    'shovot', 'шават', 'шовот',
    'qorovulbozor', 'каравулбазар', 'қоровулбозор',
    'zomin', 'зомин',
    'dustlik', 'дустлик',
    'paxtaobod', 'пахтаобод', 'пахтаабад',
    'asaka', 'асака',
    'xonobod', 'ханабад', 'хонобод',
    'baliqchi', 'балыкчи', 'балиқчи',
    'jalaquduq', 'жалакудук', 'жалақудуқ',
    'oltiariq', 'алтиарик', 'олтиариқ',
    'toshloq', 'ташлак', 'тошлоқ',
    'yangiyer', 'янгиер',
    'boyovut', 'бояут', 'боёвут',
    'mirzaobod', 'мирзаабад', 'мирзаобод',
    'oqoltin', 'акалтын', 'оқолтин',
    'sardoba', 'сардоба',
    'xovos', 'хавост', 'ховос',
]);
/**
 * Matn ichida xorijiy manzil borligini tekshirish.
 * UZ whitelist bilan himoyalangan — "Toshkent" ichidagi "osh" EMAS.
 * Qisqa so'zlar (osh, ufa, рф) — faqat alohida so'z sifatida topiladi.
 */
function containsForeign(text) {
    if (!text)
        return false;
    var lower = text.toLowerCase().trim();
    // Agar matn aniq O'zbekiston shahri bo'lsa — xorijiy emas
    if (UZBEK_CITIES.has(lower))
        return false;
    for (var _i = 0, FOREIGN_DESTINATIONS_1 = exports.FOREIGN_DESTINATIONS; _i < FOREIGN_DESTINATIONS_1.length; _i++) {
        var dest = FOREIGN_DESTINATIONS_1[_i];
        var d = dest.toLowerCase();
        if (d.length <= 3) {
            // Qisqa so'zlar (osh, ufa, рф) — faqat so'z chegarasida
            var re = new RegExp('(^|\\s|[,;.!?/()>\\-])' + d + '($|\\s|[,;.!?/()>\\-])', 'i');
            if (re.test(lower))
                return true;
        }
        else {
            // 4+ harfli so'zlar — oddiy includes (UZ whitelist himoya qiladi)
            if (lower.includes(d))
                return true;
        }
    }
    return false;
}
function classifyOrderScope(cargoFrom, cargoTo, messageText) {
    if (!cargoFrom && !cargoTo && !messageText)
        return 'INTERNAL';
    var fromIsUzbek = isUzbekCity(cargoFrom);
    var toIsUzbek = isUzbekCity(cargoTo);
    // Agar ikkala manzil ham O'zbekiston shahri — aniq INTERNAL
    if (fromIsUzbek && toIsUzbek)
        return 'INTERNAL';
    var fromIsForeign = !!cargoFrom && !fromIsUzbek && containsForeign(cargoFrom);
    var toIsForeign = !!cargoTo && !toIsUzbek && containsForeign(cargoTo);
    // Agar yo'nalishlardan biri xorijiy bo'lsa
    if (fromIsForeign && !toIsForeign)
        return 'IMPORT';
    if (!fromIsForeign && toIsForeign)
        return 'EXPORT';
    if (fromIsForeign && toIsForeign)
        return 'EXPORT';
    // Xabar matni ichida xorijiy manzil qidirish
    if (messageText && containsForeign(messageText)) {
        if (cargoFrom && !fromIsForeign)
            return 'EXPORT';
        return 'IMPORT';
    }
    return 'INTERNAL';
}
function isUzbekCity(text) {
    if (!text)
        return false;
    return UZBEK_CITIES.has(text.toLowerCase().trim());
}
