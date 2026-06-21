import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';

import '../../config/api_config.dart';
import '../../core/api/api_client.dart';
import '../../core/models/driver_profile.dart';
import '../../core/models/order.dart';

// ============================================================
// DRIVER PROFILE PROVIDER
// ============================================================

class DriverProfileState {
  final DriverProfile? profile;
  final bool isLoading;
  final String? error;

  const DriverProfileState({this.profile, this.isLoading = false, this.error});

  DriverProfileState copyWith({DriverProfile? profile, bool? isLoading, String? error}) {
    return DriverProfileState(
      profile: profile ?? this.profile,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class DriverProfileNotifier extends StateNotifier<DriverProfileState> {
  final ApiClient _api;

  DriverProfileNotifier(this._api) : super(const DriverProfileState()) {
    loadProfile();
  }

  Future<void> loadProfile() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _api.get(ApiConfig.driverProfile);
      final profile = DriverProfile.fromJson(response.data as Map<String, dynamic>);
      state = DriverProfileState(profile: profile);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Profil yuklanmadi');
    }
  }

  Future<void> updateProfile(Map<String, dynamic> data) async {
    try {
      final response = await _api.patch(ApiConfig.driverProfile, data: data);
      final profile = DriverProfile.fromJson(response.data as Map<String, dynamic>);
      state = DriverProfileState(profile: profile);
    } catch (e) {
      state = state.copyWith(error: 'Profil yangilanmadi');
    }
  }

  Future<void> setOnline(bool isOnline) async {
    try {
      await _api.patch(ApiConfig.driverOnline, data: {'isOnline': isOnline});
      if (state.profile != null) {
        state = DriverProfileState(
          profile: DriverProfile.fromJson({
            ...state.profile!.toJson(),
            'isOnline': isOnline,
          }),
        );
      }
    } catch (e) {
      state = state.copyWith(error: 'Status o\'zgartirilmadi');
    }
  }

  Future<void> updateLocation(double lat, double lng) async {
    try {
      await _api.patch(ApiConfig.driverLocation, data: {'lat': lat, 'lng': lng});
    } catch (_) {}
  }
}

final driverProfileProvider =
    StateNotifierProvider<DriverProfileNotifier, DriverProfileState>((ref) {
  final api = ref.read(apiClientProvider);
  return DriverProfileNotifier(api);
});

// ============================================================
// DRIVER ORDERS PROVIDER
// ============================================================

class DriverOrdersState {
  final List<Map<String, dynamic>> orders;
  final bool isLoading;
  final String? error;
  final int total;

  const DriverOrdersState({
    this.orders = const [],
    this.isLoading = false,
    this.error,
    this.total = 0,
  });
}

class DriverOrdersNotifier extends StateNotifier<DriverOrdersState> {
  final ApiClient _api;

  DriverOrdersNotifier(this._api) : super(const DriverOrdersState());

  Future<void> loadOrders({String? type, String? scope, bool nearMe = false, int page = 1}) async {
    state = DriverOrdersState(isLoading: true, orders: state.orders, total: state.total);
    try {
      final params = <String, dynamic>{'page': page.toString(), 'limit': '50'};
      if (type != null) params['type'] = type;
      if (scope != null) params['scope'] = scope;
      if (nearMe) params['nearMe'] = 'true';

      final response = await _api.get(ApiConfig.driverOrders, queryParameters: params);
      final data = response.data as Map<String, dynamic>;
      final items = (data['data'] as List?)?.cast<Map<String, dynamic>>() ?? [];
      final pagination = data['pagination'] as Map<String, dynamic>?;

      state = DriverOrdersState(
        orders: items,
        total: pagination?['total'] as int? ?? items.length,
      );
    } catch (e) {
      state = DriverOrdersState(error: 'Yuklar yuklanmadi', orders: state.orders);
    }
  }

  /// Orderlarni tozalash (offline bo'lganda)
  void clearOrders() {
    state = const DriverOrdersState();
  }

  /// Yangi orderni reload qilmasdan ro'yxatga qo'shish
  void addOrderLocally(Order order) {
    final orderMap = order.toJson();
    state = DriverOrdersState(
      orders: [orderMap, ...state.orders],
      total: state.total + 1,
    );
  }

  /// WebSocket'dan kelgan order Map'ni reload qilmasdan list'ga TEPADAN qo'shish
  /// Duplicate tekshiruvi — agar shu ID allaqachon bo'lsa qo'shilmaydi
  void addOrderMapLocally(Map<String, dynamic> order) {
    final id = order['id'] as String? ?? '';
    if (id.isEmpty) return;
    // Duplicate check
    final exists = state.orders.any((o) => (o['id'] as String? ?? '') == id);
    if (exists) return;
    state = DriverOrdersState(
      orders: [order, ...state.orders],
      total: state.total + 1,
    );
  }
}

final driverOrdersProvider =
    StateNotifierProvider<DriverOrdersNotifier, DriverOrdersState>((ref) {
  final api = ref.read(apiClientProvider);
  return DriverOrdersNotifier(api);
});

// ============================================================
// DISPETCHER ADS PROVIDER (haydovchi uchun dispetcher e'lonlari)
// ============================================================

class DispatcherAdsState {
  final List<Map<String, dynamic>> ads;
  final bool isLoading;
  final String? error;
  final int total;

  const DispatcherAdsState({
    this.ads = const [],
    this.isLoading = false,
    this.error,
    this.total = 0,
  });
}

class DispatcherAdsNotifier extends StateNotifier<DispatcherAdsState> {
  final ApiClient _api;

  DispatcherAdsNotifier(this._api) : super(const DispatcherAdsState());

  Future<void> loadAds({
    String? cargoFrom,
    String? cargoTo,
    String? vehicleType,
    String? scope,
    int page = 1,
  }) async {
    state = DispatcherAdsState(isLoading: true, ads: state.ads, total: state.total);
    try {
      final params = <String, dynamic>{'page': page.toString(), 'limit': '20'};
      if (cargoFrom != null) params['cargoFrom'] = cargoFrom;
      if (cargoTo != null) params['cargoTo'] = cargoTo;
      if (vehicleType != null) params['vehicleType'] = vehicleType;
      if (scope != null) params['scope'] = scope;

      final response = await _api.get('/drivers/dispatcher-ads', queryParameters: params);
      final data = response.data as Map<String, dynamic>;
      final items = (data['data'] as List?)?.cast<Map<String, dynamic>>() ?? [];
      final pagination = data['pagination'] as Map<String, dynamic>?;

      state = DispatcherAdsState(
        ads: items,
        total: pagination?['total'] as int? ?? items.length,
      );
    } catch (e) {
      state = DispatcherAdsState(error: "E'lonlar yuklanmadi", ads: state.ads);
    }
  }

  Future<String?> startChat(String adId) async {
    try {
      final response = await _api.post('/drivers/dispatcher-ads/$adId/chat');
      final data = response.data as Map<String, dynamic>;
      return data['roomId'] as String?;
    } catch (_) {
      return null;
    }
  }

  /// WebSocket'dan yangi e'lonni list'ga tepadan qo'shish
  void addAdLocally(Map<String, dynamic> ad) {
    final id = ad['id'] as String? ?? '';
    if (id.isEmpty) return;
    final exists = state.ads.any((a) => (a['id'] as String? ?? '') == id);
    if (exists) return;
    state = DispatcherAdsState(
      ads: [ad, ...state.ads],
      total: state.total + 1,
    );
  }
}

final dispatcherAdsProvider =
    StateNotifierProvider<DispatcherAdsNotifier, DispatcherAdsState>((ref) {
  final api = ref.read(apiClientProvider);
  return DispatcherAdsNotifier(api);
});

// ============================================================
// TELEGRAM DISPATCHER PROVIDER (Bloklangan senderlar e'lonlari)
// ============================================================

class TelegramDispatcherState {
  final List<Map<String, dynamic>> orders;
  final bool isLoading;
  final String? error;
  final int total;

  const TelegramDispatcherState({
    this.orders = const [],
    this.isLoading = false,
    this.error,
    this.total = 0,
  });
}

class TelegramDispatcherNotifier extends StateNotifier<TelegramDispatcherState> {
  final ApiClient _api;

  TelegramDispatcherNotifier(this._api) : super(const TelegramDispatcherState());

  Future<void> loadOrders({String? scope, String? cargoFrom, String? cargoTo, int hoursAgo = 12, int page = 1}) async {
    state = TelegramDispatcherState(isLoading: true, orders: state.orders, total: state.total);
    try {
      final params = <String, dynamic>{'page': page.toString(), 'limit': '20', 'hoursAgo': hoursAgo.toString()};
      if (scope != null) params['scope'] = scope;
      if (cargoFrom != null) params['cargoFrom'] = cargoFrom;
      if (cargoTo != null) params['cargoTo'] = cargoTo;

      final response = await _api.get('/drivers/orders/telegram-dispatcher', queryParameters: params);
      final data = response.data as Map<String, dynamic>;
      final items = (data['data'] as List?)?.cast<Map<String, dynamic>>() ?? [];
      final pagination = data['pagination'] as Map<String, dynamic>?;

      state = TelegramDispatcherState(
        orders: items,
        total: pagination?['total'] as int? ?? items.length,
      );
    } catch (e) {
      state = TelegramDispatcherState(error: 'Yuklanmadi', orders: state.orders);
    }
  }

  /// WebSocket'dan yangi yukni list'ga tepadan qo'shish
  void addOrderLocally(Map<String, dynamic> order) {
    final id = order['id'] as String? ?? '';
    if (id.isEmpty) return;
    final exists = state.orders.any((o) => (o['id'] as String? ?? '') == id);
    if (exists) return;
    state = TelegramDispatcherState(
      orders: [order, ...state.orders],
      total: state.total + 1,
    );
  }
}

final telegramDispatcherProvider =
    StateNotifierProvider<TelegramDispatcherNotifier, TelegramDispatcherState>((ref) {
  final api = ref.read(apiClientProvider);
  return TelegramDispatcherNotifier(api);
});

// ============================================================
// NEARBY ORDERS PROVIDER (YO'LDA yuklari — 100km radius)
// ============================================================

class NearbyOrdersState {
  final List<Map<String, dynamic>> orders;
  final bool isLoading;
  final String? error;
  final int total;

  const NearbyOrdersState({
    this.orders = const [],
    this.isLoading = false,
    this.error,
    this.total = 0,
  });
}

class NearbyOrdersNotifier extends StateNotifier<NearbyOrdersState> {
  final ApiClient _api;

  NearbyOrdersNotifier(this._api) : super(const NearbyOrdersState());

  Future<void> loadOrders({
    String? cargoFrom,
    String? cargoTo,
    String? vehicleType,
    int page = 1,
  }) async {
    state = NearbyOrdersState(isLoading: true, orders: state.orders, total: state.total);
    try {
      final params = <String, dynamic>{'page': page.toString(), 'limit': '20'};
      if (cargoFrom != null) params['cargoFrom'] = cargoFrom;
      if (cargoTo != null) params['cargoTo'] = cargoTo;
      if (vehicleType != null) params['vehicleType'] = vehicleType;

      final response = await _api.get('/drivers/orders/nearby', queryParameters: params);
      final data = response.data as Map<String, dynamic>;
      final items = (data['data'] as List?)?.cast<Map<String, dynamic>>() ?? [];
      final pagination = data['pagination'] as Map<String, dynamic>?;

      state = NearbyOrdersState(
        orders: items,
        total: pagination?['total'] as int? ?? items.length,
      );
    } catch (e) {
      state = NearbyOrdersState(error: 'Yuklanmadi', orders: state.orders);
    }
  }
}

final nearbyOrdersProvider =
    StateNotifierProvider<NearbyOrdersNotifier, NearbyOrdersState>((ref) {
  final api = ref.read(apiClientProvider);
  return NearbyOrdersNotifier(api);
});

// ============================================================
// DRIVER ACCEPTED ORDERS PROVIDER (Telegram zakazlar qabul qilish + treking)
// ============================================================

class DriverAcceptedState {
  final List<Map<String, dynamic>> orders;
  final bool isLoading;
  final String? error;

  const DriverAcceptedState({
    this.orders = const [],
    this.isLoading = false,
    this.error,
  });
}

class DriverAcceptedNotifier extends StateNotifier<DriverAcceptedState> {
  final ApiClient _api;

  DriverAcceptedNotifier(this._api) : super(const DriverAcceptedState());

  Future<void> loadOrders({String? status}) async {
    state = DriverAcceptedState(isLoading: true, orders: state.orders);
    try {
      final params = <String, dynamic>{};
      if (status != null) params['status'] = status;

      final response = await _api.get(
        ApiConfig.driverAcceptedOrders,
        queryParameters: params,
      );
      final items = (response.data as List?)?.cast<Map<String, dynamic>>() ?? [];
      state = DriverAcceptedState(orders: items);
    } catch (e) {
      state = DriverAcceptedState(error: 'Yuklanmadi', orders: state.orders);
    }
  }

  Future<String?> acceptOrder(String orderId) async {
    try {
      await _api.post(ApiConfig.driverAcceptOrder(orderId));
      await loadOrders(status: 'active');
      return null;
    } on DioException catch (e) {
      if (e.response?.data is Map) {
        final raw = (e.response?.data as Map)['message'];
        final msg = raw is String
            ? raw
            : (raw is List && raw.isNotEmpty ? raw.join(', ') : 'Xatolik');
        if (msg.contains('Obuna')) return 'subscription';
        return msg;
      }
      return 'Server xatosi: ${e.response?.statusCode ?? "tarmoq aloqasi yo'q"}';
    } catch (e) {
      return 'Xatolik: $e';
    }
  }

  Future<bool> updateTracking(String orderId, String status) async {
    try {
      await _api.patch(
        ApiConfig.driverTrackingStatus(orderId),
        data: {'status': status},
      );
      await loadOrders(status: 'active');
      return true;
    } catch (e) {
      state = DriverAcceptedState(error: 'Status yangilanmadi', orders: state.orders);
      return false;
    }
  }

  Future<bool> cancelOrder(String orderId) async {
    return updateTracking(orderId, 'CANCELLED');
  }
}

final driverAcceptedProvider =
    StateNotifierProvider<DriverAcceptedNotifier, DriverAcceptedState>((ref) {
  final api = ref.read(apiClientProvider);
  return DriverAcceptedNotifier(api);
});

// ============================================================
// DRIVER OFFERS PROVIDER
// ============================================================

class DriverOffersState {
  final List<DriverOffer> myOffers;
  final bool isLoading;
  final String? error;

  const DriverOffersState({this.myOffers = const [], this.isLoading = false, this.error});
}

class DriverOffersNotifier extends StateNotifier<DriverOffersState> {
  final ApiClient _api;

  DriverOffersNotifier(this._api) : super(const DriverOffersState());

  Future<void> loadMyOffers() async {
    state = DriverOffersState(isLoading: true, myOffers: state.myOffers);
    try {
      final response = await _api.get(ApiConfig.driverOffersMy);
      final items = (response.data as List?)
              ?.map((e) => DriverOffer.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [];
      state = DriverOffersState(myOffers: items);
    } catch (e) {
      state = DriverOffersState(error: 'Takliflar yuklanmadi', myOffers: state.myOffers);
    }
  }

  Future<bool> createOffer(Map<String, dynamic> data) async {
    try {
      await _api.post(ApiConfig.driverOffersCreate, data: data);
      await loadMyOffers();
      return true;
    } catch (e) {
      state = DriverOffersState(error: 'Taklif yaratilmadi', myOffers: state.myOffers);
      return false;
    }
  }

  Future<void> cancelOffer(String id) async {
    try {
      await _api.delete(ApiConfig.driverOfferCancel(id));
      await loadMyOffers();
    } catch (e) {
      state = DriverOffersState(error: 'Taklif bekor qilinmadi', myOffers: state.myOffers);
    }
  }
}

final driverOffersProvider =
    StateNotifierProvider<DriverOffersNotifier, DriverOffersState>((ref) {
  final api = ref.read(apiClientProvider);
  return DriverOffersNotifier(api);
});

// ============================================================
// PRIVATE ORDERS PROVIDER
// ============================================================

class PrivateOrdersState {
  final List<PrivateOrder> orders;
  final bool isLoading;
  final String? error;

  const PrivateOrdersState({this.orders = const [], this.isLoading = false, this.error});
}

class PrivateOrdersNotifier extends StateNotifier<PrivateOrdersState> {
  final ApiClient _api;

  PrivateOrdersNotifier(this._api) : super(const PrivateOrdersState());

  Future<void> loadOrders() async {
    state = PrivateOrdersState(isLoading: true, orders: state.orders);
    try {
      final response = await _api.get(ApiConfig.driverPrivateOrders);
      final items = (response.data as List?)
              ?.map((e) => PrivateOrder.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [];
      state = PrivateOrdersState(orders: items);
    } catch (e) {
      state = PrivateOrdersState(error: 'Buyurtmalar yuklanmadi', orders: state.orders);
    }
  }

  Future<bool> acceptOrder(String id) async {
    try {
      await _api.post(ApiConfig.driverPrivateOrderAccept(id));
      await loadOrders();
      return true;
    } catch (e) {
      final msg = e.toString().contains('Balans') ? 'Balans yetarli emas' : 'Xatolik yuz berdi';
      state = PrivateOrdersState(error: msg, orders: state.orders);
      return false;
    }
  }

  Future<void> rejectOrder(String id) async {
    try {
      await _api.post(ApiConfig.driverPrivateOrderReject(id));
      await loadOrders();
    } catch (_) {}
  }
}

final privateOrdersProvider =
    StateNotifierProvider<PrivateOrdersNotifier, PrivateOrdersState>((ref) {
  final api = ref.read(apiClientProvider);
  return PrivateOrdersNotifier(api);
});
