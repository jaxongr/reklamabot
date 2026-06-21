import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/api_config.dart';
import '../../core/api/api_client.dart';
import '../../core/models/order.dart';

/// Marketplace (manual / for-sale orders) state.
class MarketplaceState {
  final List<Order> orders;
  final List<Order> myOrders;
  final Map<String, dynamic> stats;
  final bool isLoading;
  final String? error;

  const MarketplaceState({
    this.orders = const [],
    this.myOrders = const [],
    this.stats = const {},
    this.isLoading = false,
    this.error,
  });

  MarketplaceState copyWith({
    List<Order>? orders,
    List<Order>? myOrders,
    Map<String, dynamic>? stats,
    bool? isLoading,
    String? error,
  }) {
    return MarketplaceState(
      orders: orders ?? this.orders,
      myOrders: myOrders ?? this.myOrders,
      stats: stats ?? this.stats,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  int get totalCount => stats['total'] as int? ?? 0;
  int get forSaleCount => stats['forSale'] as int? ?? 0;
  int get closedCount => stats['closed'] as int? ?? 0;
  double get revenue => (stats['revenue'] as num?)?.toDouble() ?? 0.0;
}

/// Notifier for marketplace operations.
class MarketplaceNotifier extends StateNotifier<MarketplaceState> {
  final ApiClient _api;

  MarketplaceNotifier(this._api) : super(const MarketplaceState()) {
    _initialLoad();
  }

  Future<void> _initialLoad() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await Future.wait([
        _fetchOrders(),
        _fetchMyOrders(),
        _fetchStats(),
      ]);
      state = state.copyWith(isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Ma\'lumotlarni yuklashda xatolik',
      );
    }
  }

  /// Load for-sale orders (public marketplace).
  Future<void> loadOrders() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _fetchOrders();
      state = state.copyWith(isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Sotuvdagi buyurtmalarni yuklashda xatolik',
      );
    }
  }

  Future<void> _fetchOrders() async {
    final response = await _api.get(ApiConfig.ordersForSale);
    final data = response.data;

    List<dynamic> list;
    if (data is Map<String, dynamic>) {
      list = (data['data'] as List?) ?? [];
    } else if (data is List) {
      list = data;
    } else {
      list = [];
    }

    final orders = list
        .map((e) => Order.fromJson(e as Map<String, dynamic>))
        .toList();

    state = state.copyWith(orders: orders);
  }

  /// Load current user's manual orders.
  Future<void> loadMyOrders() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _fetchMyOrders();
      state = state.copyWith(isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Buyurtmalarni yuklashda xatolik',
      );
    }
  }

  Future<void> _fetchMyOrders() async {
    final response = await _api.get(
      ApiConfig.ordersMyOrders,
      queryParameters: {'isManual': 'true'},
    );
    final data = response.data;

    List<dynamic> list;
    if (data is Map<String, dynamic>) {
      list = (data['data'] as List?) ?? [];
    } else if (data is List) {
      list = data;
    } else {
      list = [];
    }

    final myOrders = list
        .map((e) => Order.fromJson(e as Map<String, dynamic>))
        .toList();

    state = state.copyWith(myOrders: myOrders);
  }

  /// Load marketplace stats for manual orders.
  Future<void> loadStats() async {
    try {
      await _fetchStats();
    } catch (_) {
      // Stats load silently fails — not critical
    }
  }

  Future<void> _fetchStats() async {
    final response = await _api.get(
      ApiConfig.orderStats,
      queryParameters: {'isManual': 'true'},
    );
    final data = response.data;

    if (data is Map<String, dynamic>) {
      state = state.copyWith(stats: data);
    }
  }

  /// Create a new manual order.
  Future<bool> createOrder(Map<String, dynamic> data) async {
    try {
      await _api.post(ApiConfig.orders, data: data);
      // Refresh lists after creation
      await Future.wait([
        _fetchMyOrders(),
        _fetchOrders(),
        _fetchStats(),
      ]);
      return true;
    } catch (e) {
      state = state.copyWith(
        error: 'Buyurtma yaratishda xatolik',
      );
      return false;
    }
  }

  /// Close a deal on an order with the given amount.
  Future<bool> closeDeal(String orderId, double amount) async {
    try {
      await _api.post(
        ApiConfig.orderCloseDeal(orderId),
        data: {'amount': amount},
      );
      await Future.wait([
        _fetchMyOrders(),
        _fetchStats(),
      ]);
      return true;
    } catch (e) {
      state = state.copyWith(
        error: 'Bitimni yopishda xatolik',
      );
      return false;
    }
  }

  /// Accept a for-sale order.
  Future<bool> acceptOrder(String orderId) async {
    try {
      await _api.post(ApiConfig.orderAccept(orderId));
      await Future.wait([
        _fetchOrders(),
        _fetchMyOrders(),
        _fetchStats(),
      ]);
      return true;
    } catch (e) {
      state = state.copyWith(
        error: 'Buyurtmani qabul qilishda xatolik',
      );
      return false;
    }
  }

  /// Refresh all marketplace data.
  Future<void> refresh() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await Future.wait([
        _fetchOrders(),
        _fetchMyOrders(),
        _fetchStats(),
      ]);
      state = state.copyWith(isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Ma\'lumotlarni yangilashda xatolik',
      );
    }
  }
}

/// Provider for marketplace state.
final marketplaceProvider =
    StateNotifierProvider<MarketplaceNotifier, MarketplaceState>((ref) {
  final api = ref.read(apiClientProvider);
  return MarketplaceNotifier(api);
});

/// Provider for price estimate based on route.
final priceEstimateProvider =
    FutureProvider.family<Map<String, dynamic>?, ({String from, String to})>(
        (ref, route) async {
  if (route.from.isEmpty || route.to.isEmpty) return null;

  try {
    final api = ref.read(apiClientProvider);
    final response = await api.get(
      ApiConfig.analyticsPriceEstimate,
      queryParameters: {
        'from': route.from,
        'to': route.to,
      },
    );
    final data = response.data;
    if (data is Map<String, dynamic>) {
      return data;
    }
    return null;
  } catch (_) {
    return null;
  }
});
