import 'dart:async';
import 'dart:developer' as dev;
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:latlong2/latlong.dart';
import '../../core/api/api_client.dart';
import '../../core/models/order.dart';
import '../../core/data/uzbekistan_cities.dart';

/// Online haydovchi ma'lumoti (GPS bilan).
class OnlineDriver {
  final String id;
  final String? fullName;
  final String? vehicleType;
  final String? vehicleNumber;
  final double lat;
  final double lng;
  final String? lastCity;
  final String? phone;
  final bool isVerified;

  const OnlineDriver({
    required this.id,
    this.fullName,
    this.vehicleType,
    this.vehicleNumber,
    required this.lat,
    required this.lng,
    this.lastCity,
    this.phone,
    this.isVerified = false,
  });

  factory OnlineDriver.fromJson(Map<String, dynamic> json) {
    return OnlineDriver(
      id: json['id'] ?? '',
      fullName: json['fullName'],
      vehicleType: json['vehicleType'],
      vehicleNumber: json['vehicleNumber'],
      lat: (json['lastLat'] ?? 0).toDouble(),
      lng: (json['lastLng'] ?? 0).toDouble(),
      lastCity: json['lastCity'],
      phone: json['phone'],
      isVerified: json['isVerified'] ?? false,
    );
  }
}

/// OSRM dan olingan yo'l ma'lumoti.
class RouteInfo {
  final List<LatLng> points;
  final double distanceKm;
  final double durationMin;

  const RouteInfo({
    required this.points,
    required this.distanceKm,
    required this.durationMin,
  });

  String get distanceText => '${distanceKm.round()} km';

  String get durationText {
    final h = durationMin ~/ 60;
    final m = (durationMin % 60).round();
    if (h == 0) return '$m min';
    if (m == 0) return '$h soat';
    return '$h soat $m min';
  }
}

/// Shahar bo'yicha guruhlangan e'lonlar.
class CityCluster {
  final String cityName;
  final LatLng coord;
  final List<Order> orders;

  const CityCluster({
    required this.cityName,
    required this.coord,
    required this.orders,
  });

  int get cargoCount => orders.where((o) => o.type == OrderType.cargo).length;
  int get driverCount => orders.where((o) => o.type == OrderType.driver).length;
}

/// Xarita holati.
class MapState {
  final List<Order> cargoOrders;
  final List<Order> driverOrders;
  final List<OnlineDriver> onlineDrivers;
  final bool isLoading;
  final String? error;
  final Order? selectedOrder;
  final RouteInfo? routeInfo;
  final bool routeLoading;

  const MapState({
    this.cargoOrders = const [],
    this.driverOrders = const [],
    this.onlineDrivers = const [],
    this.isLoading = false,
    this.error,
    this.selectedOrder,
    this.routeInfo,
    this.routeLoading = false,
  });

  bool get hasRoute => selectedOrder != null && routeInfo != null;

  MapState copyWith({
    List<Order>? cargoOrders,
    List<Order>? driverOrders,
    List<OnlineDriver>? onlineDrivers,
    bool? isLoading,
    String? error,
    Order? selectedOrder,
    RouteInfo? routeInfo,
    bool? routeLoading,
    bool clearSelected = false,
  }) {
    return MapState(
      cargoOrders: cargoOrders ?? this.cargoOrders,
      driverOrders: driverOrders ?? this.driverOrders,
      onlineDrivers: onlineDrivers ?? this.onlineDrivers,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      selectedOrder: clearSelected ? null : (selectedOrder ?? this.selectedOrder),
      routeInfo: clearSelected ? null : (routeInfo ?? this.routeInfo),
      routeLoading: routeLoading ?? this.routeLoading,
    );
  }

  /// Shahar bo'yicha guruhlash (klaster).
  List<CityCluster> get clusters {
    final map = <String, List<Order>>{};
    for (final o in [...cargoOrders, ...driverOrders]) {
      final key = (o.cargoFrom ?? '').toLowerCase().trim();
      if (key.isEmpty) continue;
      map.putIfAbsent(key, () => []).add(o);
    }
    final result = <CityCluster>[];
    for (final entry in map.entries) {
      final coord = findCityCoord(entry.key);
      if (coord == null) continue;
      final name = entry.value.first.cargoFrom ?? entry.key;
      result.add(CityCluster(cityName: name, coord: coord, orders: entry.value));
    }
    result.sort((a, b) => b.orders.length.compareTo(a.orders.length));
    return result;
  }
}

class MapNotifier extends StateNotifier<MapState> {
  final ApiClient _api;
  final Dio _osrmDio = Dio(BaseOptions(
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));
  Timer? _refreshTimer;

  MapNotifier(this._api) : super(const MapState());

  /// Barcha xarita datalarni yuklash.
  Future<void> loadMapData() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final now = DateTime.now();
      final from24h = now.subtract(const Duration(hours: 24)).toIso8601String();

      final results = await Future.wait([
        _api.get('/orders', queryParameters: {
          'type': 'CARGO',
          'limit': '5000',
          'dateFrom': from24h,
        }),
        _api.get('/orders', queryParameters: {
          'type': 'DRIVER',
          'limit': '5000',
        }),
        _api.get('/drivers/admin/map/online'),
      ]);

      final cargoData = results[0].data;
      final driverData = results[1].data;
      final onlineData = results[2].data;

      final cargoOrders = ((cargoData is Map ? cargoData['data'] : cargoData) as List? ?? [])
          .map((j) => Order.fromJson(j as Map<String, dynamic>))
          .toList();

      // Haydovchi e'lonlarini uniqlash — har senderdan faqat oxirgi e'lon
      final allDriverOrders = ((driverData is Map ? driverData['data'] : driverData) as List? ?? [])
          .map((j) => Order.fromJson(j as Map<String, dynamic>))
          .toList();
      final driverMap = <String, Order>{};
      for (final o in allDriverOrders) {
        final key = o.senderTelegramId ?? o.phone ?? o.id;
        final existing = driverMap[key];
        if (existing == null || (o.messageDate != null && existing.messageDate != null && o.messageDate!.isAfter(existing.messageDate!))) {
          driverMap[key] = o;
        }
      }
      final driverOrders = driverMap.values.toList();

      final onlineDrivers = (onlineData is List ? onlineData : (onlineData as Map)['data'] ?? [])
          .map<OnlineDriver>((j) => OnlineDriver.fromJson(j as Map<String, dynamic>))
          .where((d) => d.lat != 0 && d.lng != 0)
          .toList();

      state = state.copyWith(
        cargoOrders: cargoOrders,
        driverOrders: driverOrders,
        onlineDrivers: onlineDrivers,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  /// Order tanlash va OSRM dan yo'l olish.
  Future<void> selectOrder(Order? order) async {
    if (order == null) {
      state = state.copyWith(clearSelected: true, routeLoading: false);
      return;
    }

    state = state.copyWith(selectedOrder: order, routeInfo: null, routeLoading: true);

    final from = findCityCoord(order.cargoFrom);
    final to = findCityCoord(order.cargoTo);
    if (from == null || to == null) {
      // Koordinata topilmasa — to'g'ri chiziq bilan fallback
      final fallbackKm = (from != null && to != null) ? haversineKm(from, to) : 0.0;
      state = state.copyWith(
        routeInfo: RouteInfo(
          points: [if (from != null) from, if (to != null) to],
          distanceKm: fallbackKm,
          durationMin: fallbackKm,
        ),
        routeLoading: false,
      );
      return;
    }

    try {
      final route = await _fetchOsrmRoute(from, to);
      if (route != null) {
        state = state.copyWith(routeInfo: route, routeLoading: false);
      } else {
        // OSRM ishlamasa — haversine fallback
        final km = haversineKm(from, to);
        state = state.copyWith(
          routeInfo: RouteInfo(
            points: [from, to],
            distanceKm: km,
            durationMin: km,
          ),
          routeLoading: false,
        );
      }
    } catch (_) {
      final km = haversineKm(from, to);
      state = state.copyWith(
        routeInfo: RouteInfo(
          points: [from, to],
          distanceKm: km,
          durationMin: km,
        ),
        routeLoading: false,
      );
    }
  }

  /// O'zbekiston chegarasi ichida ekanini tekshirish.
  bool _isInUzbekistan(LatLng p) {
    return p.latitude >= 37.0 && p.latitude <= 45.6 &&
           p.longitude >= 56.0 && p.longitude <= 73.2;
  }

  /// O'zbekiston ichidagi yo'nalish uchun oraliq waypoint qo'shish.
  /// Qozog'iston orqali o'tmasligi uchun.
  String _buildOsrmCoords(LatLng from, LatLng to) {
    final coords = <String>['${from.longitude},${from.latitude}'];

    // Ikkalasi ham O'zbekistonda va juda uzoq (shimol-g'arb bilan sharq)
    if (_isInUzbekistan(from) && _isInUzbekistan(to)) {
      final latDiff = (from.latitude - to.latitude).abs();
      final lngDiff = (from.longitude - to.longitude).abs();

      // Katta masofa bo'lsa oraliq nuqtalar qo'shish (Qozog'iston orqali o'tmasligi uchun)
      if (lngDiff > 5) {
        // G'arbiy yo'nalish (Xorazm/Nukus) — Buxoro orqali
        if (from.longitude < 62 || to.longitude < 62) {
          coords.add('64.45,39.77'); // Buxoro
          if (from.longitude > 67 || to.longitude > 67) {
            coords.add('65.38,40.10'); // Navoiy
          }
        }
        // Sharqiy yo'nalish — Jizzax/Samarqand orqali
        else if (lngDiff > 3) {
          coords.add('67.84,40.12'); // Jizzax
        }
      }
    }

    coords.add('${to.longitude},${to.latitude}');
    return coords.join(';');
  }

  /// OSRM API — real yo'l bo'yicha route.
  /// Avval to'g'ridan-to'g'ri OSRM, ishlamasa backend proxy orqali.
  Future<RouteInfo?> _fetchOsrmRoute(LatLng from, LatLng to) async {
    final osrmCoords = _buildOsrmCoords(from, to);

    // 1-urinish: to'g'ridan-to'g'ri OSRM
    try {
      final url = 'https://router.project-osrm.org/route/v1/driving/'
          '$osrmCoords'
          '?overview=full&geometries=geojson';

      dev.log('[Map] OSRM request: $url');
      final res = await _osrmDio.get(url);
      dev.log('[Map] OSRM response: ${res.statusCode}');

      if (res.statusCode == 200) {
        final parsed = _parseOsrmResponse(res.data);
        if (parsed != null) {
          dev.log('[Map] OSRM OK: ${parsed.distanceKm.round()} km, ${parsed.points.length} points');
          return parsed;
        }
      }
    } catch (e) {
      dev.log('[Map] OSRM direct failed: $e');
    }

    // 2-urinish: backend proxy orqali
    try {
      final proxyRes = await _api.get('/orders/route', queryParameters: {
        'coords': osrmCoords,
      });
      dev.log('[Map] Backend proxy response: ${proxyRes.statusCode}');
      final parsed = _parseOsrmResponse(proxyRes.data);
      if (parsed != null) {
        dev.log('[Map] Backend proxy OK: ${parsed.distanceKm.round()} km');
        return parsed;
      }
    } catch (e) {
      dev.log('[Map] Backend proxy failed: $e');
    }

    return null;
  }

  RouteInfo? _parseOsrmResponse(dynamic data) {
    try {
      if (data == null) return null;
      final code = data['code'];
      if (code != 'Ok') return null;

      final route = data['routes'][0];
      final distanceM = (route['distance'] as num).toDouble();
      final durationS = (route['duration'] as num).toDouble();

      final coords = route['geometry']['coordinates'] as List;
      final points = coords.map<LatLng>((c) {
        final lng = (c[0] as num).toDouble();
        final lat = (c[1] as num).toDouble();
        return LatLng(lat, lng);
      }).toList();

      return RouteInfo(
        points: points,
        distanceKm: distanceM / 1000,
        durationMin: durationS / 60,
      );
    } catch (e) {
      dev.log('[Map] Parse error: $e');
      return null;
    }
  }

  /// Online haydovchilarni yangilash.
  Future<void> refreshDriverPositions() async {
    try {
      final res = await _api.get('/drivers/admin/map/online');
      final data = res.data;
      final drivers = (data is List ? data : (data as Map)['data'] ?? [])
          .map<OnlineDriver>((j) => OnlineDriver.fromJson(j as Map<String, dynamic>))
          .where((d) => d.lat != 0 && d.lng != 0)
          .toList();
      state = state.copyWith(onlineDrivers: drivers);
    } catch (_) {}
  }

  void startAutoRefresh() {
    _refreshTimer?.cancel();
    _refreshTimer = Timer.periodic(
      const Duration(seconds: 30),
      (_) => refreshDriverPositions(),
    );
  }

  void stopAutoRefresh() {
    _refreshTimer?.cancel();
    _refreshTimer = null;
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    _osrmDio.close();
    super.dispose();
  }
}

final mapProvider = StateNotifierProvider<MapNotifier, MapState>((ref) {
  final api = ref.read(apiClientProvider);
  return MapNotifier(api);
});
