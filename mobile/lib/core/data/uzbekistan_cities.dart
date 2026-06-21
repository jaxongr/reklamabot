import 'package:latlong2/latlong.dart';
import 'dart:math' as math;

/// O'zbekiston va MDH shaharlarining koordinatalari (100% aniq).
/// Manba: Google Maps / OpenStreetMap.
const Map<String, List<double>> _cityCoords = {
  // ═══ Viloyat markazlari ═══
  'toshkent': [41.2995, 69.2401],
  'samarqand': [39.6542, 66.9597],
  'buxoro': [39.7681, 64.4556],
  'navoiy': [40.1003, 65.3792],
  'andijon': [40.7821, 72.3442],
  "farg'ona": [40.3834, 71.7870],
  'fargona': [40.3834, 71.7870],
  'fergana': [40.3834, 71.7870],
  'namangan': [40.9983, 71.6726],
  'qarshi': [38.8606, 65.7981],
  'termiz': [37.2241, 67.2783],
  'nukus': [42.4628, 59.6003],
  'urganch': [41.5533, 60.6336],
  'jizzax': [40.1158, 67.8422],
  'guliston': [40.4897, 68.7842],

  // ═══ Toshkent viloyati ═══
  'chirchiq': [41.4689, 69.5828],
  'olmaliq': [40.8453, 69.5983],
  'angren': [41.0167, 70.1436],
  'bekobod': [40.2214, 69.2692],
  'ohangaron': [41.0667, 69.6333],
  'nurafshon': [41.0514, 69.3292],
  'yangiyul': [41.1158, 69.0461],
  'chinoz': [40.9333, 68.7667],
  'sergeli': [41.2200, 69.2200],
  'parkent': [41.2931, 69.6747],
  'piskent': [41.0667, 69.3500],
  'gazalkent': [41.5618, 69.7710],
  'zangiota': [41.2167, 69.1000],
  'bektemir': [41.2400, 69.3300],
  'yunusobod': [41.3400, 69.2800],
  'kukdala': [40.8200, 69.6300],

  // ═══ Samarqand viloyati ═══
  "kattaqo'rg'on": [39.8986, 66.2561],
  'kattaqorgon': [39.8986, 66.2561],
  'kattakurgan': [39.8986, 66.2561],
  'urgut': [39.4000, 67.2333],
  'ishtixon': [39.9167, 66.5333],
  'jomboy': [39.7167, 67.1833],
  "bulung'ur": [39.7667, 67.2667],
  'bulungur': [39.7667, 67.2667],
  'shahrisabz': [39.0547, 66.8297],
  'payariq': [39.8333, 67.0333],
  'narpay': [39.9167, 66.5833],
  'nurobod': [39.5500, 67.5667],
  'toyloq': [39.5167, 67.1833],

  // ═══ Buxoro viloyati ═══
  'kogon': [39.7278, 64.5514],
  "g'ijduvon": [40.1033, 64.6817],
  'gijduvon': [40.1033, 64.6817],
  'shofirkon': [40.1197, 64.5017],
  'romitan': [39.9333, 64.3833],
  'vobkent': [40.0333, 64.5167],
  'olot': [39.5500, 64.0500],
  "qorako'l": [39.5167, 63.8500],

  // ═══ Farg'ona viloyati ═══
  "qo'qon": [40.5286, 70.9425],
  'quqon': [40.5286, 70.9425],
  'kokand': [40.5286, 70.9425],
  "marg'ilon": [40.4703, 71.7147],
  'margilon': [40.4703, 71.7147],
  'rishton': [40.3833, 71.2833],
  'quva': [40.5178, 72.0714],
  'beshariq': [40.4500, 70.5667],
  'oltiariq': [40.4500, 71.4667],
  'quvasoy': [40.3028, 71.6833],
  'vodil': [40.5333, 71.7000],
  'chimyon': [40.0700, 71.0700],

  // ═══ Andijon viloyati ═══
  'asaka': [40.6406, 72.2378],
  "xo'jaobod": [40.6833, 72.0333],
  'shahrixon': [40.7167, 72.0500],
  'xonobod': [40.8000, 72.1500],
  'marhamat': [40.8333, 72.3167],
  'baliqchi': [40.8833, 72.5833],
  'qorasuv': [40.7300, 72.0900],

  // ═══ Namangan viloyati ═══
  'chust': [41.0003, 71.2333],
  'pop': [40.8833, 71.1000],
  'kosonsoy': [41.2350, 71.5400],
  'chortoq': [41.0667, 71.5833],

  // ═══ Navoiy viloyati ═══
  'zarafshon': [41.5750, 64.1850],
  'uchquduq': [42.1583, 63.5567],
  'muborak': [39.1728, 65.2589],
  'nurota': [40.5667, 65.6833],
  'qiziltepa': [40.0333, 65.2833],

  // ═══ Qashqadaryo viloyati ═══
  'kitob': [39.1331, 66.8578],
  "g'uzor": [38.6167, 66.2500],
  'guzor': [38.6167, 66.2500],
  'beshkent': [38.7333, 65.9167],
  'koson': [39.0500, 65.5167],
  'qamashi': [38.8333, 65.6333],
  'chiroqchi': [38.9667, 66.5667],
  'talimarjon': [38.4300, 65.6200],

  // ═══ Surxondaryo viloyati ═══
  'denov': [38.2714, 67.8936],
  'boysun': [38.2019, 67.2000],
  'sherobod': [37.6500, 67.0167],
  "jarqo'rg'on": [37.5000, 67.4167],
  'oltinsoy': [38.3333, 67.6667],

  // ═══ Jizzax viloyati ═══
  'zafarobod': [40.5333, 68.5167],
  'zomin': [39.9500, 68.4000],
  'mirzachul': [40.3333, 67.9667],
  'dashtobod': [40.1200, 67.9300],

  // ═══ Sirdaryo viloyati ═══
  'sirdaryo': [40.8500, 68.6667],
  'boyovut': [40.3667, 68.7833],
  'yangiyer': [40.2700, 68.8200],
  'hovos': [40.2500, 68.9167],

  // ═══ Xorazm viloyati ═══
  'xiva': [41.3786, 60.3639],
  'hazorasp': [41.3333, 61.0667],
  'shovot': [41.6167, 60.5167],
  'gurlan': [41.5833, 60.6500],

  // ═══ Qoraqalpog'iston ═══
  "qo'ng'irot": [43.0761, 58.6908],
  'turtkul': [41.5500, 60.9167],
  'beruniy': [41.6833, 60.7500],
  'chimboy': [42.9333, 59.7667],

  // ═══ Rossiya ═══
  'moskva': [55.7558, 37.6173],
  'yekaterinburg': [56.8389, 60.6057],
  'kazan': [55.7887, 49.1221],
  'novosibirsk': [55.0084, 82.9357],
  'krasnoyarsk': [56.0153, 92.8932],
  'tyumen': [57.1522, 65.5272],
  'chelyabinsk': [55.1644, 61.4368],
  'omsk': [54.9885, 73.3242],
  'samara': [53.1959, 50.1001],
  'ufa': [54.7388, 55.9721],
  'perm': [58.0105, 56.2502],
  'rostov': [47.2357, 39.7015],
  'krasnodar': [45.0355, 38.9753],
  'sankt-peterburg': [59.9311, 30.3609],
  'volgograd': [48.7080, 44.5133],
  'krasnokamsk': [58.0800, 55.7500],

  // ═══ MDH ═══
  'almaty': [43.2220, 76.8512],
  'astana': [51.1801, 71.4460],
  'shymkent': [42.3417, 69.5967],
  'saryagash': [41.4694, 68.8039],
  'bishkek': [42.8746, 74.5698],
  'osh': [40.5283, 72.7985],
  'dushanbe': [38.5598, 68.7740],
  'ashgabat': [37.9601, 58.3261],

  // ═══ Boshqa ═══
  'istanbul': [41.0082, 28.9784],
  'borisov': [54.2300, 28.5000],
};

/// Barcha shahar nomlari (unique, capitalize)
List<String> get allCityNames {
  final names = <String>{};
  for (final key in _cityCoords.keys) {
    // capitalize first letter
    if (key.isNotEmpty) {
      names.add(key[0].toUpperCase() + key.substring(1));
    }
  }
  return names.toList()..sort();
}

/// Qidiruv bo'yicha shaharlarni filtrlash
List<String> searchCities(String query) {
  if (query.isEmpty) return [];
  final q = query.toLowerCase();
  return allCityNames.where((c) => c.toLowerCase().contains(q)).take(8).toList();
}

/// Shahar nomidan koordinata topish.
/// Avval to'g'ridan-to'g'ri, keyin normalizatsiya bilan qidiradi.
LatLng? findCityCoord(String? cityName) {
  if (cityName == null || cityName.isEmpty) return null;
  final key = cityName
      .toLowerCase()
      .trim()
      .replaceAll("'", "'")
      .replaceAll("ʻ", "'")
      .replaceAll("ʼ", "'")
      .replaceAll("'", "'");

  // To'g'ridan-to'g'ri match
  final coords = _cityCoords[key];
  if (coords != null) return LatLng(coords[0], coords[1]);

  // Apostrof olib tashlash bilan
  final noApos = key.replaceAll("'", '');
  for (final entry in _cityCoords.entries) {
    final entryNoApos = entry.key.replaceAll("'", '');
    if (noApos == entryNoApos) {
      return LatLng(entry.value[0], entry.value[1]);
    }
  }

  // Qisqa nom match (5+ harf) — faqat boshi mos kelsa
  if (key.length >= 5) {
    for (final entry in _cityCoords.entries) {
      if (entry.key.length >= 5 && (entry.key.startsWith(key) || key.startsWith(entry.key))) {
        return LatLng(entry.value[0], entry.value[1]);
      }
    }
  }

  return null;
}

/// Ikki nuqta orasidagi masofa (km) — haversine.
double haversineKm(LatLng a, LatLng b) {
  const r = 6371.0;
  final dLat = _toRad(b.latitude - a.latitude);
  final dLng = _toRad(b.longitude - a.longitude);
  final h = math.sin(dLat / 2) * math.sin(dLat / 2) +
      math.cos(_toRad(a.latitude)) *
          math.cos(_toRad(b.latitude)) *
          math.sin(dLng / 2) *
          math.sin(dLng / 2);
  return 2 * r * math.asin(math.sqrt(h));
}

/// Taxminiy yetib borish vaqti (soat).
/// O'rtacha tezlik: 60 km/h.
String estimatedTime(double km) {
  final hours = km / 60;
  if (hours < 1) return '${(hours * 60).round()} min';
  return '${hours.toStringAsFixed(1)} soat';
}

double _toRad(double deg) => deg * math.pi / 180;
