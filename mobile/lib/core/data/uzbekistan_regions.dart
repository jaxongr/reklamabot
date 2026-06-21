/// O'zbekiston viloyatlari va tumanlari
/// Ro'yxatdan o'tish uchun autocomplete data

const Map<String, List<String>> uzbekistanRegions = {
  'Toshkent shahri': [
    'Bektemir', 'Chilonzor', 'Yakkasaroy', 'Mirobod', 'Mirzo Ulug\'bek',
    'Sergeli', 'Shayxontohur', 'Olmazor', 'Uchtepa', 'Yunusobod', 'Yashnobod',
  ],
  'Toshkent viloyati': [
    'Bekobod', 'Chirchiq', 'Olmaliq', 'Angren', 'Nurafshon', 'Ohangaron',
    'Yangiyul', 'Bo\'stonliq', 'Bo\'ka', 'Chinoz', 'Qibray',
    'Oqqo\'rg\'on', 'Parkent', 'Piskent', 'Quyi Chirchiq',
    'O\'rta Chirchiq', 'Zangiota', 'Yuqori Chirchiq', 'Toshkent tumani',
  ],
  'Samarqand viloyati': [
    'Samarqand', 'Kattaqo\'rg\'on', 'Urgut', 'Ishtixon', 'Bulungur',
    'Jomboy', 'Narpay', 'Nurobod', 'Oqdaryo', 'Pastdarg\'om',
    'Payariq', 'Paxtachi', 'Qo\'shrabot', 'Toyloq',
  ],
  'Buxoro viloyati': [
    'Buxoro', 'Kogon', 'G\'ijduvon', 'Jondor', 'Olot', 'Peshku',
    'Qorako\'l', 'Qoravulbozor', 'Romitan', 'Shofirkon', 'Vobkent',
  ],
  'Navoiy viloyati': [
    'Navoiy', 'Zarafshon', 'Uchquduq', 'Konimex', 'Karmana',
    'Nurota', 'Qiziltepa', 'Tomdi', 'Xatirchi',
  ],
  'Andijon viloyati': [
    'Andijon', 'Xonobod', 'Asaka', 'Baliqchi', 'Bo\'z',
    'Buloqboshi', 'Jalaquduq', 'Izboskan', 'Marxamat',
    'Oltinko\'l', 'Paxtaobod', 'Qo\'rg\'ontepa', 'Shahrixon',
    'Ulug\'nor', 'Xo\'jaobod',
  ],
  'Farg\'ona viloyati': [
    'Farg\'ona', 'Qo\'qon', 'Marg\'ilon', 'Quvasoy', 'Rishton',
    'Bag\'dod', 'Beshariq', 'Buvayda', 'Dang\'ara', 'Furqat',
    'Oltiariq', 'Qo\'shtepa', 'So\'x', 'Toshloq', 'Uchko\'prik',
    'Yozyovon',
  ],
  'Namangan viloyati': [
    'Namangan', 'Chortoq', 'Chust', 'Kosonsoy', 'Mingbuloq',
    'Norin', 'Pop', 'To\'raqo\'rg\'on', 'Uchqo\'rg\'on',
    'Uychi', 'Yangiqo\'rg\'on',
  ],
  'Qashqadaryo viloyati': [
    'Qarshi', 'Shahrisabz', 'Kitob', 'Chiroqchi', 'Dehqonobod',
    'G\'uzor', 'Kasbi', 'Koson', 'Mirishkor', 'Muborak',
    'Nishon', 'Qamashi', 'Yakkabog\'',
  ],
  'Surxondaryo viloyati': [
    'Termiz', 'Denov', 'Boysun', 'Jarqo\'rg\'on', 'Muzrabot',
    'Oltinsoy', 'Qiziriq', 'Qumqo\'rg\'on', 'Sariosiyo',
    'Sherobod', 'Sho\'rchi', 'Uzun',
  ],
  'Jizzax viloyati': [
    'Jizzax', 'Do\'stlik', 'Arnasoy', 'Baxmal', 'Forish',
    'G\'allaorol', 'Mirzacho\'l', 'Paxtakor', 'Yangiobod',
    'Zafarobod', 'Zarbdor', 'Zomin',
  ],
  'Sirdaryo viloyati': [
    'Guliston', 'Sirdaryo', 'Shirin', 'Boyovut', 'Mirzaobod',
    'Oqoltin', 'Sardoba', 'Sayxunobod', 'Xovos',
  ],
  'Xorazm viloyati': [
    'Urganch', 'Xiva', 'Bog\'ot', 'Gurlan', 'Hazorasp',
    'Qo\'shko\'pir', 'Shovot', 'Tuproqqal\'a', 'Urganch tumani',
    'Yangiariq', 'Yangibozor',
  ],
  'Qoraqalpog\'iston': [
    'Nukus', 'Mo\'ynoq', 'Amudaryo', 'Beruniy', 'Chimboy',
    'Ellikqal\'a', 'Kegeyli', 'Kungirot', 'Nukus tumani',
    'Qanliko\'l', 'Qo\'ng\'irot', 'Shumanay', 'Taxtako\'pir',
    'To\'rtko\'l', 'Xo\'jayli',
  ],
};

/// Barcha viloyat+tuman ro'yxati — autocomplete uchun
/// Format: "Tuman, Viloyat" yoki "Shahar, Viloyat"
List<String> getAllLocations() {
  final list = <String>[];
  for (final entry in uzbekistanRegions.entries) {
    final region = entry.key;
    for (final district in entry.value) {
      list.add('$district, $region');
    }
  }
  return list;
}

/// Qidiruv bo'yicha filtrlash
List<String> searchLocations(String query) {
  if (query.isEmpty) return [];
  final q = query.toLowerCase();
  final all = getAllLocations();
  return all.where((loc) => loc.toLowerCase().contains(q)).take(10).toList();
}
