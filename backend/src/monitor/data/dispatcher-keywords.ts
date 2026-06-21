/**
 * Dispatcher/logist kalit so'zlari — username yoki ismda bo'lsa BLOCK
 */
export const DISPATCHER_KEYWORDS: string[] = [
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
export const FEMALE_NAMES: string[] = [
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
export const FOREIGN_DESTINATIONS: string[] = [
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
  'афганистан', 'afganistan', 'афгонистон', 'afgoniston', 'кабул', 'kabul',
  'мозори шариф', 'мазори шариф', 'mazori sharif', 'mozori sharif',
  'пакистан', 'pakistan', 'карачи', 'karachi',
  'индия', 'india', 'мумбаи', 'mumbai',
  'китай', 'xitoy', 'china', 'пекин', 'beijing',
  'урумчи', 'urumqi', 'кашгар', 'kashgar',
  // Polsha, Belarus, boshqalar
  'польша', 'polsha', 'poland', 'полша',
  'белорусь', 'белоруссия', 'беларусь', 'беларус', 'belarus', 'belorusiya',
  'белорусия', 'билоруся', 'bilorusiya', 'bilorusya',
  // Rossiya — qo'shimcha shahar variantlari
  'лесосибирск', 'lesosibirsk',
  'краснадар', 'krasnadar', // typo of krasnodar
  'тверь', 'тверъ',
  // Yallama (chegara punkti)
  'яллама', 'ялама', 'yallama', 'yalama',
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
export const DRIVER_KEYWORDS: string[] = [
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

  // === QO'SHIMCHA — typo/colloquial ===
  // "busa" = "bolsa" colloquial
  'yuk busa olamiz', 'yuk busa olaman', 'yuk busa olamz',
  'юк буса оламиз', 'юк буса оламан',
  // Shofer/shafyor/shopir bor = haydovchi bor
  'shafyor bor', 'шафёр бор', 'шафер бор',
  'shopir bor', 'шопир бор', 'шопер бор',
  'shofyor bor', 'шофёор бор',
  'shofer bor', 'шофер бор', 'шоферр бор',
  'шафёр бор', 'шофёр бор',
  // Zakazga = for orders
  'zakazga bor', 'заказга бор',
  'zakazga mashina', 'заказга машина',
  'zakazga fura', 'заказга фура',
  'zakazga isuzu', 'заказга исузу',
  'zakazga labo', 'заказга лабо',
  'zakaz olaman', 'заказ оламан',
  'zakaz olamiz', 'заказ оламиз',
  // Xizmat ko'rsatish
  'xizmat bor', 'хизмат бор',
  'xizmat ko\'rsat', 'хизмат кўрсат',
  'opketaman', 'оп кетаман', 'олиб кетаман',
  'olib ketaman', 'олиб бораман', 'olib boraman',
  'yuklarini olib', 'юкларини олиб',
  'usti ochiq', 'усти очиқ', 'усти очик',
];

/**
 * Unicode-aware word boundary — \b Kirilchada ISHLAMAYDI!
 * JavaScript \b faqat ASCII [a-zA-Z0-9_] bilan ishlaydi
 * Kiril harflar uchun lookbehind/lookahead kerak
 */
const WB = '(?<![a-zA-Zа-яА-ЯўқғҳёЎҚҒҲЁ])';
const WBE = '(?![a-zA-Zа-яА-ЯўқғҳёЎҚҒҲЁ])';

/**
 * Mashina turlari — driver type aniqlash
 * \b O'RNIGA Unicode-aware boundary ishlatiladi!
 */
export const VEHICLE_TYPES: Array<{ pattern: RegExp; type: string }> = [
  // Yirik yuk mashinalari
  { pattern: new RegExp(`${WB}(?:fura|фура|furalar|фуралар|furra|trailer|трейлер|тягач|tyagach|odinochka|одиночка|padushka|подушка)${WBE}`, 'i'), type: 'Fura' },
  { pattern: new RegExp(`${WB}(?:kamaz|камаз|камаs)${WBE}`, 'i'), type: 'Kamaz' },
  { pattern: new RegExp(`${WB}man${WBE}`, 'i'), type: 'MAN' },
  { pattern: new RegExp(`${WB}ман${WBE}`, 'i'), type: 'MAN' },
  { pattern: new RegExp(`${WB}(?:volvo|вольво)${WBE}`, 'i'), type: 'Volvo' },
  { pattern: new RegExp(`${WB}(?:scania|скания|skaniya|сканиа)${WBE}`, 'i'), type: 'Scania' },
  { pattern: new RegExp(`${WB}(?:daf|даф)${WBE}`, 'i'), type: 'DAF' },
  { pattern: new RegExp(`${WB}(?:mercedes|мерседес|актрос|actros|atego|атего)${WBE}`, 'i'), type: 'Mercedes' },
  { pattern: new RegExp(`${WB}(?:iveco|ивеко)${WBE}`, 'i'), type: 'Iveco' },
  { pattern: new RegExp(`${WB}(?:howo|хово|sinotruk|синотрук)${WBE}`, 'i'), type: 'HOWO' },
  { pattern: new RegExp(`${WB}(?:shacman|шакман|шахман|шачман|чакман|chakman)${WBE}`, 'i'), type: 'Shacman' },
  { pattern: new RegExp(`${WB}(?:dongfeng|донгфенг|донфенг)${WBE}`, 'i'), type: 'Dongfeng' },
  // O'rtacha yuk mashinalari
  { pattern: new RegExp(`${WB}(?:isuzu|isuszu|isuzi|isizu|isusu|исузу|изузу|исузи|исузий|izuzu|есузу|есузий|эсузу)${WBE}`, 'i'), type: 'Isuzu' },
  { pattern: new RegExp(`${WB}(?:gazel|газель|газел)${WBE}`, 'i'), type: 'Gazel' },
  { pattern: new RegExp(`${WB}(?:hyundai|хюндай|хундай|портер|porter|хёндай)${WBE}`, 'i'), type: 'Porter' },
  { pattern: new RegExp(`${WB}(?:mitsubishi|митсубиши|кантер|canter|fuso|фусо)${WBE}`, 'i'), type: 'Canter' },
  { pattern: new RegExp(`${WB}(?:foton|фотон)${WBE}`, 'i'), type: 'Foton' },
  { pattern: new RegExp(`${WB}(?:jac|жак|джак)${WBE}`, 'i'), type: 'JAC' },
  // Kichik yuk mashinalari
  { pattern: new RegExp(`${WB}(?:labo|лабо)${WBE}`, 'i'), type: 'Labo' },
  { pattern: new RegExp(`${WB}(?:damas|дамас)${WBE}`, 'i'), type: 'Damas' },
  { pattern: new RegExp(`${WB}(?:largus|ларгус)${WBE}`, 'i'), type: 'Largus' },
  // Kuzov turi
  { pattern: new RegExp(`${WB}(?:tent(?:li|ovka|ofka)?|тент(?:ов(?:ка|ый))?|тентофка|тетофка|tentofka|shtora(?:lik)?|штора|шторка|шторкали|shtoralik|плошадка|площадка)${WBE}`, 'i'), type: 'Tentli' },
  { pattern: new RegExp(`${WB}(?:ref(?:ka|ri)?|реф(?:ка|а|ри|рижератор)?)${WBE}`, 'i'), type: 'Refrijerator' },
  { pattern: new RegExp(`${WB}(?:samosval|самосвал|tanar|танар)${WBE}`, 'i'), type: 'Samosval' },
  { pattern: new RegExp(`${WB}(?:bortovoy|бортовой|bort|борт|shalandra|шаландра|шаланда)${WBE}`, 'i'), type: 'Bortovoy' },
  { pattern: new RegExp(`${WB}(?:konteyner|контейнер|container)${WBE}`, 'i'), type: 'Konteyner' },
  { pattern: new RegExp(`${WB}(?:avtovoz|автовоз|car\\s*carrier)${WBE}`, 'i'), type: 'Avtovoz' },
  { pattern: new RegExp(`${WB}(?:cisterna|цистерна|tanker|танкер|benzovoz|бензовоз)${WBE}`, 'i'), type: 'Sisterna' },
  { pattern: new RegExp(`${WB}(?:evakuator|эвакуатор)${WBE}`, 'i'), type: 'Evakuator' },
  { pattern: new RegExp(`${WB}(?:manipulyator|манипулятор|kran|кран)${WBE}`, 'i'), type: 'Manipulyator' },
  { pattern: new RegExp(`${WB}(?:lowboy|лоубой|tral|трал)${WBE}`, 'i'), type: 'Tral' },
  // Qo'shimcha turlar
  { pattern: new RegExp(`${WB}(?:sprinter|спринтер)${WBE}`, 'i'), type: 'Sprinter' },
  { pattern: new RegExp(`${WB}(?:pritsep|прицеп|pirisip|присеп|тиркама)${WBE}`, 'i'), type: 'Pritsep' },
];

/**
 * Yuk (cargo) e'lon belgilari — "birinchi qo'l" yuk beruvchi xabarlar
 * Bu so'zlardan kamida BITTASI topilishi kerak
 */
export const CARGO_KEYWORDS: string[] = [
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
const UZBEK_CITIES = new Set([
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
// Qisqa so'zlar — boshqa so'zlar ichida false positive berishi mumkin
// "иран" → "гиранула" ichida, "тула" → "формула" ichida, "мары" → "самары" ichida
const SHORT_FOREIGN_WORDS = new Set([
  'иран', 'iran', 'тула', 'tula', 'мары', 'mary', 'ош', 'osh',
  'уфа', 'ufa', 'рф', 'омск', 'omsk', 'чита', 'chita',
  'литва', 'litva', 'актау', 'aktau',
]);

function containsForeign(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase().trim();
  // Agar matn aniq O'zbekiston shahri bo'lsa — xorijiy emas
  if (UZBEK_CITIES.has(lower)) return false;

  for (const dest of FOREIGN_DESTINATIONS) {
    const d = dest.toLowerCase();
    if (d.length <= 3 || SHORT_FOREIGN_WORDS.has(d)) {
      // Qisqa/muammoli so'zlar — faqat so'z chegarasida
      const re = new RegExp('(^|\\s|[,;.!?/()>\\-])' + d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|\\s|[,;.!?/()>\\-])', 'i');
      if (re.test(lower)) return true;
    } else {
      // 4+ harfli so'zlar — oddiy includes (UZ whitelist himoya qiladi)
      if (lower.includes(d)) return true;
    }
  }
  return false;
}

export function classifyOrderScope(
  cargoFrom?: string,
  cargoTo?: string,
  messageText?: string,
): 'INTERNAL' | 'IMPORT' | 'EXPORT' {
  if (!cargoFrom && !cargoTo && !messageText) return 'INTERNAL';

  const fromIsUzbek = isUzbekCity(cargoFrom);
  const toIsUzbek = isUzbekCity(cargoTo);

  // Agar ikkala manzil ham O'zbekiston shahri — aniq INTERNAL
  if (fromIsUzbek && toIsUzbek) return 'INTERNAL';

  // containsForeign YOKI "noma'lum shahar" (mavjud lekin UZ emas) → xorijiy
  const fromIsForeign = !!cargoFrom && !fromIsUzbek && (containsForeign(cargoFrom) || isKnownForeignCity(cargoFrom));
  const toIsForeign = !!cargoTo && !toIsUzbek && (containsForeign(cargoTo) || isKnownForeignCity(cargoTo));

  // Agar yo'nalishlardan biri xorijiy bo'lsa
  if (fromIsForeign && !toIsForeign) return 'IMPORT';
  if (!fromIsForeign && toIsForeign) return 'EXPORT';
  if (fromIsForeign && toIsForeign) return 'EXPORT';

  // Xabar matni ichida xorijiy manzil qidirish
  if (messageText && containsForeign(messageText)) {
    // Agar cargoFrom O'zbekiston shahri → text'da foreign bor → EXPORT
    if (cargoFrom && fromIsUzbek) return 'EXPORT';
    // Agar cargoTo O'zbekiston shahri → text'da foreign bor → IMPORT
    if (cargoTo && toIsUzbek) return 'IMPORT';
    // Agar faqat from bor (UZ emas) → IMPORT
    if (cargoFrom && !fromIsUzbek) return 'IMPORT';
    return 'IMPORT';
  }

  return 'INTERNAL';
}

/**
 * Ma'lum xorijiy shaharlar — city-distances.ts da bor lekin UZ emas
 * Bu shaharlar resolved name sifatida keladi (masalan "Polsha", "Lesosibirsk")
 */
const KNOWN_FOREIGN_CITIES = new Set([
  // Rossiya
  'moskva', 'peterburg', 'novosibirsk', 'kazan', 'yekaterinburg',
  'krasnoyarsk', 'chelyabinsk', 'omsk', 'samara', 'rostov',
  'ufa', 'volgograd', 'perm', 'voronezh', 'tyumen', 'krasnodar',
  'sochi', 'nizhniy novgorod', 'stavropol', 'tambov', 'ryazan',
  'tula', 'kaluga', 'bryansk', 'kursk', 'belgorod', 'lipetsk',
  'penza', 'saratov', 'orenburg', 'ulyanovsk', 'izhevsk',
  'astrakhan', 'makhachkala', 'vladikavkaz', 'grozny',
  'surgut', 'tomsk', 'kemerovo', 'barnaul', 'irkutsk',
  'lesosibirsk', 'novorossiysk', 'serpukhov', 'vorsino',
  'podolsk', 'vologda', 'kostroma', 'yaroslavl', 'ivanovo',
  'vladimir', 'tver', 'murmansk', 'arkhangelsk', 'yakutsk',
  'chita', 'magadan', 'taganrog',
  // Qozog'iston
  'almaty', 'astana', 'shymkent', 'karaganda', 'aktau', 'aktobe',
  'atyrau', 'taraz', 'pavlodar', 'semey', 'kostanay', 'kyzylorda',
  'turkestan', 'saryagash', 'khorgos',
  // Turkmaniston
  'ashgabat', 'mary', 'turkmenabat', 'dashoguz', 'balkanabat',
  // Qirg'iziston
  'bishkek', 'osh', 'karakol', 'naryn', 'tokmok',
  // Tojikiston
  'dushanbe', 'khujand', 'kulob', 'bokhtar', 'istaravshan',
  // Boshqa
  'istanbul', 'ankara', 'dubai', 'minsk', 'tbilisi', 'baku',
  'polsha', 'belarus', 'litva', 'latviya',
  // Xitoy/Eron
  'urumqi', 'kashgar', 'tehran',
]);

function isKnownForeignCity(text?: string): boolean {
  if (!text) return false;
  return KNOWN_FOREIGN_CITIES.has(text.toLowerCase().trim());
}

function isUzbekCity(text?: string): boolean {
  if (!text) return false;
  return UZBEK_CITIES.has(text.toLowerCase().trim());
}

// ============================================================
// SHAHARLARARO TAKSI — haydovchi (GM/UzAuto yengil mashina) e'lonlari
// Bu so'zlar xabarda bo'lsa → DRIVER (haydovchi) deb olinadi
// ============================================================
export const TAXI_DRIVER_KEYWORDS: string[] = [
  // GM / UzAuto / Chevrolet yengil mashinalar (Latin)
  'cobalt', 'kobalt', 'gentra', 'jentra', 'nexia', 'neksiya', 'neksia',
  'spark', 'spak', 'lacetti', 'lasetti', 'matiz', 'malibu', 'malibo',
  'captiva', 'kaptiva', 'tracker', 'treker', 'onix', 'oniks', 'tahoe',
  'equinox', 'epica', 'damas', 'labo', 'ravon', 'chevrolet', 'shevrolet',
  // Kiril
  'кобальт', 'джентра', 'нексия', 'спарк', 'ласетти', 'малибу', 'каптива',
  'трекер', 'оникс', 'дамас', 'лабо', 'равон', 'шевроле', 'матиз',
  // Taksi haydovchi iboralari
  'joy bor', 'joylar bor', "bo'sh joy", 'bosh joy', 'joy bosh',
  'olib ketaman', 'olib ketyapman', 'olib ketamiz',
  'pochta olaman', 'pochta olib ketaman', 'pochta bor',
  'taksi', 'taxi', 'haydovchiman', 'haydovchi bor',
  'жой бор', 'бўш жой', 'олиб кетаман', 'почта оламан', 'такси',
];
