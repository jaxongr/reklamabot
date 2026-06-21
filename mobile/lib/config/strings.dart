/// Ilova tili — lotincha yoki kirilcha.
enum AppLang { latin, cyrillic }

/// Barcha UI stringlarni lotincha/kirilcha almashish uchun.
/// Foydalanish: AppStrings.orders (providerdagi til asosida qaytaradi)
class AppStrings {
  AppStrings._();

  static AppLang _lang = AppLang.latin;

  static AppLang get currentLang => _lang;

  static void setLang(AppLang lang) => _lang = lang;

  static bool get isLatin => _lang == AppLang.latin;

  // ── Bottom navigation ──
  static String get asosiy => isLatin ? 'Asosiy' : 'Асосий';
  static String get qabul => isLatin ? 'Qabul' : 'Қабул';
  static String get topish => isLatin ? 'Topish' : 'Топиш';
  static String get taklif => isLatin ? 'Taklif' : 'Таклиф';
  static String get chat => 'Chat';
  static String get balans => isLatin ? 'Balans' : 'Баланс';

  // ── AppBar / Headers ──
  static String get buyurtmalar => isLatin ? 'Buyurtmalar' : 'Буюртмалар';
  static String get qabulQilinganlar =>
      isLatin ? 'Qabul qilinganlar' : 'Қабул қилинганлар';

  // ── Map ──
  static String get harita => isLatin ? 'Harita' : 'Ҳарита';

  // ── Filter pills ──
  static String get barchasi => isLatin ? 'Barchasi' : 'Барчаси';
  static String get yuklar => isLatin ? 'Yuklar' : 'Юклар';
  static String get haydovchilar => isLatin ? 'Haydovchilar' : 'Ҳайдовчилар';
  static String get import_ => 'Import';
  static String get eksport => 'Eksport';
  static String get importEksport =>
      isLatin ? 'Import/Eksport' : 'Импорт/Экспорт';
  static String get ichkiYuklar =>
      isLatin ? 'Ichki yuklar' : 'Ички юклар';
  static String get haydovchiTaklifi =>
      isLatin ? 'Haydovchi taklifi' : 'Ҳайдовчи таклифи';

  // ── Filter panel ──
  static String get qayerdan => isLatin ? 'Qayerdan' : 'Қаердан';
  static String get qayerga => isLatin ? 'Qayerga' : 'Қаерга';
  static String get shaharNomi =>
      isLatin ? 'Shahar nomi...' : 'Шаҳар номи...';
  static String get mashinaTuri =>
      isLatin ? 'Mashina turi' : 'Машина тури';
  static String get ogirlik => isLatin ? "Og'irlik" : 'Оғирлик';
  static String get filtrlarniTozalash =>
      isLatin ? 'Filtrlarni tozalash' : 'Филтрларни тозалаш';

  // ── Drawer ──
  static String get arxiv => isLatin ? 'Arxiv' : 'Архив';
  static String get elonTarqatish =>
      isLatin ? "E'lon tarqatish" : 'Эълон тарқатиш';
  static String get testrKalkulyator =>
      isLatin ? 'Testr (Kalkulyator)' : 'Тестр (Калькулятор)';
  static String get buyurtmaYaratish =>
      isLatin ? 'Buyurtma yaratish' : 'Буюртма яратиш';
  static String get raqamlarBoshqaruvi =>
      isLatin ? 'Raqamlar boshqaruvi' : 'Рақамлар бошқаруви';
  static String get smsYuborish =>
      isLatin ? 'SMS yuborish' : 'СМС юбориш';
  static String get qoraRoyxat =>
      isLatin ? "Qora ro'yxat" : 'Қора рўйхат';
  static String get qoraRoyxatTushuntirish =>
      isLatin
          ? "Belgilangan guruhlarga e'lon tarqatilmaydi"
          : "Белгиланган гуруҳларга эълон тарқатилмайди";
  static String get obuna => isLatin ? 'Obuna' : 'Обуна';
  static String get bildirishnomalar =>
      isLatin ? 'Bildirishnomalar' : 'Билдиришномалар';
  static String get texYordam =>
      isLatin ? 'Tex yordam' : 'Тех ёрдам';
  static String get sozlamalar => isLatin ? 'Sozlamalar' : 'Созламалар';
  static String get chiqish => isLatin ? 'Chiqish' : 'Чиқиш';
  static String get fotokontrol => isLatin ? 'Fotokontrol' : 'Фотоконтрол';
  static String get dostniTaklif =>
      isLatin ? "Do'stni taklif qilish" : 'Дўстни таклиф қилиш';

  // ── Home screen ──
  static String get linya => 'LINYA';
  static String get ochiq => isLatin ? "O'CHIQ" : 'ЎЧИҚ';
  static String get haydovchi => isLatin ? 'haydovchi' : 'ҳайдовчи';
  static String get dispetcher => isLatin ? 'dispetcher' : 'диспетчер';
  static String get yangiYuk => isLatin ? 'Yangi yuk' : 'Янги юк';
  static String get haydovchiTaklifiBildirish =>
      isLatin ? 'Haydovchi taklifi' : 'Ҳайдовчи таклифи';

  // ── Order card ──
  static String get qabulQilish =>
      isLatin ? 'Qabul qilish' : 'Қабул қилиш';
  static String get bloklash => isLatin ? 'Bloklash' : 'Блоклаш';
  static String get batafsil => isLatin ? 'Batafsil' : 'Батафсил';
  static String get qongiroq =>
      isLatin ? "Qo'ng'iroq" : 'Қўнғироқ';

  // ── Settings ──
  static String get tilAlmashish =>
      isLatin ? 'Til almashish' : 'Тил алмашиш';
  static String get lotincha => 'Lotincha';
  static String get kirilcha => 'Кириллча';
  static String get tungiRejim =>
      isLatin ? 'Tungi rejim' : 'Тунги режим';
  static String get yorug => isLatin ? "Yorug'" : 'Ёруғ';
  static String get tungi => isLatin ? 'Tungi' : 'Тунги';
  static String get keshTozalash =>
      isLatin ? 'Kesh tozalash' : 'Кеш тозалаш';
  static String get keshTozalandi =>
      isLatin ? 'Kesh tozalandi' : 'Кеш тозаланди';
  static String get ilovaHaqida =>
      isLatin ? 'Ilova haqida' : 'Илова ҳақида';
  static String get versiya => isLatin ? 'Versiya' : 'Версия';
  static String get xizmatlar => isLatin ? 'Xizmatlar' : 'Хизматлар';
  static String get yordamMarkazi =>
      isLatin ? 'Yordam markazi' : 'Ёрдам маркази';
  static String get mashinaFotolari =>
      isLatin ? 'Mashina fotolari' : 'Машина фотолари';
  static String get taklifTizimi =>
      isLatin ? 'Taklif tizimi' : 'Таклиф тизими';

  // ── Common ──
  static String get bekorQilish =>
      isLatin ? 'Bekor qilish' : 'Бекор қилиш';
  static String get bekor => isLatin ? 'Bekor' : 'Бекор';
  static String get ha => isLatin ? 'Ha' : 'Ҳа';
  static String get yoq => isLatin ? "Yo'q" : 'Йўқ';
  static String get saqlash => isLatin ? 'Saqlash' : 'Сақлаш';
  static String get yuborish => isLatin ? 'Yuborish' : 'Юбориш';
  static String get tasdiqlash => isLatin ? 'Tasdiqlash' : 'Тасдиқлаш';
  static String get xatolik => isLatin ? 'Xatolik' : 'Хатолик';
  static String get hisobdanChiqish =>
      isLatin ? 'Hisobdan chiqish' : 'Ҳисобдан чиқиш';
  static String get hisobdanChiqmoqchimisiz =>
      isLatin ? 'Hisobingizdan chiqmoqchimisiz?' : 'Ҳисобингиздан чиқмоқчимисиз?';
  static String get foydalanuvchi =>
      isLatin ? 'Foydalanuvchi' : 'Фойдаланувчи';
  static String get malumotTopilmadi =>
      isLatin ? "Ma'lumot topilmadi" : 'Маълумот топилмади';
  static String get qaytaYuklash =>
      isLatin ? 'Qayta yuklash' : 'Қайта юклаш';
  static String get yuklashXatolik =>
      isLatin ? 'Yuklashda xatolik' : 'Юклашда хатолик';
  static String get haydovchiTopish =>
      isLatin ? 'Haydovchi topish' : 'Ҳайдовчи топиш';
  static String get guruhlargaYuborilmoqda =>
      isLatin ? "Guruhlarga yuborilmoqda..." : 'Гуруҳларга юборилмоқда...';

  // ── Order detail / card ──
  static String get buyurtmaTafsilotlari =>
      isLatin ? 'Buyurtma tafsilotlari' : 'Буюртма тафсилотлари';
  static String get yuboruvchi => isLatin ? 'Yuboruvchi' : 'Юборувчи';
  static String get telefon => isLatin ? 'Telefon' : 'Телефон';
  static String get sana => isLatin ? 'Sana' : 'Сана';
  static String get yukTuri => isLatin ? 'Yuk turi' : 'Юк тури';
  static String get masofa => isLatin ? 'Masofa' : 'Масофа';
  static String get tur => isLatin ? 'Tur' : 'Тур';
  static String get narx => isLatin ? 'Narx' : 'Нарх';
  static String get senderniBloklash =>
      isLatin ? 'Senderni bloklash' : 'Сендерни блоклаш';
  static String get yuboruvchiniBlocklash =>
      isLatin ? 'Yuboruvchini bloklash' : 'Юборувчини блоклаш';
  static String get bajarildi => isLatin ? 'Bajarildi' : 'Бажарилди';
  static String get boglandim => isLatin ? "Bog'landim" : 'Боғландим';
  static String get radEtish => isLatin ? 'Rad etish' : 'Рад этиш';
  static String get telefonNusxalandi =>
      isLatin ? 'Telefon nusxalandi' : 'Телефон нусхаланди';
  static String get ozgartirish =>
      isLatin ? "O'zgartirish" : 'Ўзгартириш';

  // ── Accepted orders ──
  static String get qabulQilinganYuklar =>
      isLatin ? 'Qabul qilingan yuklar' : 'Қабул қилинган юклар';
  static String get faol => isLatin ? 'Faol' : 'Фаол';
  static String get yopilgan => isLatin ? 'Yopilgan' : 'Ёпилган';
  static String get jami => isLatin ? 'Jami' : 'Жами';
  static String get yukniYopish =>
      isLatin ? 'Yukni yopish' : 'Юкни ёпиш';
  static String get yopish => isLatin ? 'Yopish' : 'Ёпиш';
  static String get tarqatish => isLatin ? 'Tarqatish' : 'Тарқатиш';
  static String get bekorQilindi =>
      isLatin ? 'Bekor qilindi' : 'Бекор қилинди';
  static String get xatolikYuzBerdi =>
      isLatin ? 'Xatolik yuz berdi' : 'Хатолик юз берди';
  static String get togriSummaKiriting =>
      isLatin ? "To'g'ri summa kiriting" : 'Тўғри сумма киритинг';
  static String get barcha =>
      isLatin ? 'Barcha guruhlarga yuboriladi.' : 'Барча гуруҳларга юборилади.';
  static String get linyaniYoqish =>
      isLatin ? 'Linyani yoqish' : 'Линяни ёқиш';
  static String get qabulQilinganYuklarYoq =>
      isLatin ? "Qabul qilingan yuklar yo'q" : 'Қабул қилинган юклар йўқ';
  static String get buyurtmaSahifasidanYukQabulQiling =>
      isLatin ? 'Buyurtmalar sahifasidan yuk qabul qiling' : 'Буюртмалар саҳифасидан юк қабул қилинг';
  static String get tarqatmoqchimisiz =>
      isLatin ? 'Bu buyurtmani barcha guruxlarga tarqatmoqchimisiz?' : 'Бу буюртмани барча гуруҳларга тарқатмоқчимисиз?';
  static String get bitimYopildi =>
      isLatin ? 'Bitim yopildi!' : 'Битим ёпилди!';
  static String get qabulQilinganVaqt =>
      isLatin ? 'Qabul qilingan' : 'Қабул қилинган';
  static String taGuruhgaYuborildi(int sent) =>
      isLatin ? '$sent ta guruhga yuborildi' : '$sent та гуруҳга юборилди';
  static String get summaSom =>
      isLatin ? "Summa (so'm)" : 'Сумма (сўм)';
  static String get masalanSumma =>
      isLatin ? 'Masalan: 5000000' : 'Масалан: 5000000';
  static String get yuk => isLatin ? 'Yuk' : 'Юк';
  static String get haydovchiNomi => isLatin ? 'Haydovchi' : 'Ҳайдовчи';

  // ── Blocked ──
  static String get blokdanChiqarish =>
      isLatin ? 'Blokdan chiqarish' : 'Блокдан чиқариш';

  // ── Marketplace ──
  static String get yangiBuyurtma =>
      isLatin ? 'Yangi buyurtma' : 'Янги буюртма';
  static String get sotuvda => isLatin ? 'Sotuvda' : 'Сотувда';
  static String get daromad => isLatin ? 'Daromad' : 'Даромад';
  static String get bitimniYopish =>
      isLatin ? 'Bitimni yopish' : 'Битимни ёпиш';

  // ── Notifications ──
  static String get hammasiniOqish =>
      isLatin ? "Hammasini o'qish" : 'Ҳаммасини ўқиш';

  // ── Sessions ──
  static String get sessiyaQoshish =>
      isLatin ? "Sessiya qo'shish" : 'Сессия қўшиш';
  static String get davomEtish =>
      isLatin ? 'Davom etish' : 'Давом этиш';

  // ── Driver ──
  static String get takliflar => isLatin ? 'Takliflar' : 'Таклифлар';
  static String get profil => isLatin ? 'Profil' : 'Профил';
  static String get koproq => isLatin ? "Ko'proq" : 'Кўпроқ';
  static String get ichki => isLatin ? 'Ichki' : 'Ички';

  // ── Posting ──
  static String get tarqatishniBoshlash =>
      isLatin ? 'Tarqatishni boshlash' : 'Тарқатишни бошлаш';
  static String get toxtatish =>
      isLatin ? "To'xtatish" : 'Тўхтатиш';
  static String get boshlash => isLatin ? 'Boshlash' : 'Бошлаш';

  // ── Order detail screen ──
  static String get yonalish => isLatin ? "Yo'nalish" : 'Йўналиш';
  static String get mashinaMalumotlari =>
      isLatin ? "Mashina ma'lumotlari" : 'Машина маълумотлари';
  static String get yukMalumotlari =>
      isLatin ? "Yuk ma'lumotlari" : 'Юк маълумотлари';
  static String get sigimi => isLatin ? "Sig'imi" : 'Сиғими';
  static String get malumotYoq =>
      isLatin ? "Ma'lumot yo'q" : 'Маълумот йўқ';
  static String get summa => isLatin ? 'Summa' : 'Сумма';
  static String get aloqa => isLatin ? 'Aloqa' : 'Алоқа';
  static String get ism => isLatin ? 'Ism' : 'Исм';
  static String get username => 'Username';
  static String get jonatuvchiStatistikasi =>
      isLatin ? "Jo'natuvchi statistikasi" : 'Жўнатувчи статистикаси';
  static String get bugungiElonlar =>
      isLatin ? "Bugungi e'lonlar" : 'Бугунги эълонлар';
  static String get jamiElonlar =>
      isLatin ? "Jami e'lonlar" : 'Жами эълонлар';
  static String get faolJonatuvchi =>
      isLatin ? "Faol jo'natuvchi" : 'Фаол жўнатувчи';
  static String get guruh => isLatin ? 'Guruh' : 'Гуруҳ';
  static String get nomi => isLatin ? 'Nomi' : 'Номи';
  static String get xabarMatni =>
      isLatin ? 'Xabar matni' : 'Хабар матни';
  static String get sanalar => isLatin ? 'Sanalar' : 'Саналар';
  static String get xabarSanasi =>
      isLatin ? 'Xabar sanasi' : 'Хабар санаси';
  static String get yaratilgan => isLatin ? 'Yaratilgan' : 'Яратилган';
  static String qongiroqQilish(String phone) =>
      isLatin ? "Qo'ng'iroq qilish: $phone" : 'Қўнғироқ қилиш: $phone';
  static String get buyurtmaniRadEtish =>
      isLatin ? 'Buyurtmani rad etish?' : 'Буюртмани рад этиш?';
  static String get buyurtmaniBarjarilganDebBelgilash =>
      isLatin ? 'Buyurtmani bajarilgan deb belgilash?' : 'Буюртмани бажарилган деб белгилаш?';
  static String bloklaysizmi(String name) =>
      isLatin
          ? '${name}ni bloklaysizmi? Uning barcha keyingi xabarlari bloklanadi.'
          : '${name}ни блоклайсизми? Унинг барча кейинги хабарлари блокланади.';
  static String get senderBloklandi =>
      isLatin ? 'Sender bloklandi va order rad etildi' : 'Сендер блокланди ва ордер рад этилди';
  static String get bloklashdaXatolik =>
      isLatin ? 'Bloklashda xatolik' : 'Блоклашда хатолик';
  static String get buyurtmaTopilmadi =>
      isLatin ? 'Buyurtma topilmadi' : 'Буюртма топилмади';

  // ── Home screen extra ──
  static String get yuklanmoqda => isLatin ? 'Yuklanmoqda...' : 'Юкланмоқда...';
  static String get linyaOchirilgan =>
      isLatin ? "Linya o'chirilgan" : 'Линя ўчирилган';
  static String get yangiElonlarKelmaydi =>
      isLatin ? "Yangi e'lonlar kelmaydi.\nLinyani yoqing va ishlashni davom ettiring."
              : 'Янги эълонлар келмайди.\nЛиняни ёқинг ва ишлашни давом эттиринг.';
  static String get buyurtmalarTopilmadi =>
      isLatin ? 'Buyurtmalar topilmadi' : 'Буюртмалар топилмади';
  static String get hozirchaBuyurtmalarYoq =>
      isLatin ? "Hozircha buyurtmalar yo'q" : 'Ҳозирча буюртмалар йўқ';
  static String get hamyonBalansi =>
      isLatin ? 'Hamyon balansi' : 'Ҳамён баланси';
  static String get toldirish =>
      isLatin ? "To'ldirish" : 'Тўлдириш';
  static String get kelishiladi =>
      isLatin ? 'Kelishiladi' : 'Келишилади';
  static String get nomalum =>
      isLatin ? "Noma'lum" : 'Номаълум';
  static String get buyurtmaQabulQilindi =>
      isLatin ? 'Buyurtma qabul qilindi!' : 'Буюртма қабул қилинди!';
  static String get qabulQilindi =>
      isLatin ? 'Qabul qilindi' : 'Қабул қилинди';
  static String qabulCounter(int count) =>
      '${isLatin ? "Qabul" : "Қабул"} ($count/10)';
  static String bloklashOgohlantirish(String name) =>
      isLatin
          ? "$name bloklansa, uning e'lonlari boshqa qabul qilinmaydi."
          : '$name блокланса, унинг эълонлари бошқа қабул қилинмайди.';
  static String get yuboruvchiBloklandi =>
      isLatin ? 'Yuboruvchi bloklandi' : 'Юборувчи блокланди';
  static String get som => isLatin ? "so'm" : 'сўм';
  static String get testr => 'Testr';
  static String get buyurtmaYaratishNewline =>
      isLatin ? 'Buyurtma\nyaratish' : 'Буюртма\nяратиш';
}
