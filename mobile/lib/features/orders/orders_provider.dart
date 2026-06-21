import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/api_config.dart';
import '../../core/api/api_client.dart';
import '../../core/api/websocket_client.dart';
import '../../core/models/order.dart';
import '../../core/services/notification_service.dart';
import '../../features/auth/auth_provider.dart';

/// State for orders list.
class OrdersState {
  final List<Order> orders;
  final bool isLoading;
  final String? error;
  final OrderStatus? filterStatus;
  final OrderType? filterType;
  final OrderScope? filterScope;
  final String? searchQuery;
  final String? cargoFrom;
  final String? cargoTo;
  final String? vehicleType;
  final int page;
  final int total;

  const OrdersState({
    this.orders = const [],
    this.isLoading = false,
    this.error,
    this.filterStatus,
    this.filterType,
    this.filterScope,
    this.searchQuery,
    this.cargoFrom,
    this.cargoTo,
    this.vehicleType,
    this.page = 1,
    this.total = 0,
  });

  OrdersState copyWith({
    List<Order>? orders,
    bool? isLoading,
    String? error,
    OrderStatus? filterStatus,
    OrderType? filterType,
    OrderScope? filterScope,
    String? searchQuery,
    String? cargoFrom,
    String? cargoTo,
    String? vehicleType,
    int? page,
    int? total,
    bool clearFilter = false,
    bool clearType = false,
    bool clearScope = false,
    bool clearCargoFrom = false,
    bool clearCargoTo = false,
    bool clearVehicleType = false,
  }) {
    return OrdersState(
      orders: orders ?? this.orders,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      filterStatus: clearFilter ? null : (filterStatus ?? this.filterStatus),
      filterType: clearType ? null : (filterType ?? this.filterType),
      filterScope: clearScope ? null : (filterScope ?? this.filterScope),
      searchQuery: searchQuery ?? this.searchQuery,
      cargoFrom: clearCargoFrom ? null : (cargoFrom ?? this.cargoFrom),
      cargoTo: clearCargoTo ? null : (cargoTo ?? this.cargoTo),
      vehicleType: clearVehicleType ? null : (vehicleType ?? this.vehicleType),
      page: page ?? this.page,
      total: total ?? this.total,
    );
  }

  List<Order> get filteredOrders {
    var result = orders;

    if (searchQuery != null && searchQuery!.isNotEmpty) {
      final q = searchQuery!.toLowerCase();
      result = result.where((o) {
        return (o.cargoFrom?.toLowerCase().contains(q) ?? false) ||
            (o.cargoTo?.toLowerCase().contains(q) ?? false) ||
            (o.cargoType?.toLowerCase().contains(q) ?? false) ||
            (o.senderName?.toLowerCase().contains(q) ?? false) ||
            (o.groupTitle.toLowerCase().contains(q)) ||
            (o.phone?.toLowerCase().contains(q) ?? false) ||
            (o.messageText.toLowerCase().contains(q));
      }).toList();
    }

    return result;
  }
}

/// Notifier for orders management.
class OrdersNotifier extends StateNotifier<OrdersState> {
  final ApiClient _api;
  final Ref _ref;
  StreamSubscription<WsEvent>? _wsSub;
  Timer? _searchDebounce;

  OrdersNotifier(this._api, WebSocketClient ws, this._ref) : super(const OrdersState()) {
    loadOrders();
    // Real-time yangi orderlarni tinglash
    _wsSub = ws.events
        .where((e) => e.type == WsEventType.orderNew)
        .listen(_onNewOrder);
  }

  void _onNewOrder(WsEvent event) {
    try {
      // Linya o'chiq bo'lsa — yangi real-time orderlarni qo'shmaslik
      final user = _ref.read(authStateProvider).user;
      if (user != null && !user.isLineActive) return;

      final order = Order.fromJson(event.data);

      // Lokal bildirishnoma ko'rsatish — yangi yuk kelganda
      _showLocalNotification(order);

      // Filtrga mos kelmasa, faqat total yangilash
      final matchesStatus =
          state.filterStatus == null || order.status == state.filterStatus;
      final matchesType =
          state.filterType == null || order.type == state.filterType;
      final matchesScope =
          state.filterScope == null || order.scope == state.filterScope;
      if (matchesStatus && matchesType && matchesScope) {
        state = state.copyWith(
          orders: [order, ...state.orders],
          total: state.total + 1,
        );
      } else {
        state = state.copyWith(total: state.total + 1);
      }
    } catch (e) {
      // ignore parse error
    }
  }

  /// Yangi yuk kelganda lokal bildirishnoma
  void _showLocalNotification(Order order) {
    try {
      final from = order.cargoFrom ?? '';
      final to = order.cargoTo ?? '';
      String title;
      if (order.type == OrderType.driver) {
        title = 'Haydovchi taklifi';
      } else {
        title = 'Yangi yuk';
      }
      if (from.isNotEmpty && to.isNotEmpty) {
        title += ': $from → $to';
      } else if (from.isNotEmpty) {
        title += ': $from';
      }

      final parts = <String>[];
      if (order.vehicleType != null) parts.add(order.vehicleType!);
      if (order.cargoWeight != null) parts.add(order.cargoWeight!);
      if (order.price != null) parts.add(order.price!);
      final desc = parts.isNotEmpty ? parts.join(' | ') : order.groupTitle;

      NotificationService.showNewOrder(
        id: order.id.hashCode,
        title: title,
        description: desc,
      );
    } catch (_) {
      // ignore notification error
    }
  }

  /// Linya holatini tekshirish
  bool get isLineActive {
    final user = _ref.read(authStateProvider).user;
    return user?.isLineActive ?? true;
  }

  /// Yangi e'lonlarni yangilash (linya qayta yoqilganda)
  Future<void> refresh() async {
    await loadOrders();
  }

  /// Linya o'chirilganda — orderlar ro'yxatini tozalash
  void clearOrders() {
    state = const OrdersState();
  }

  @override
  void dispose() {
    _searchDebounce?.cancel();
    _wsSub?.cancel();
    super.dispose();
  }

  Future<void> loadOrders() async {
    // Eski e'lonlarni saqlab qolish — loading paytida ham ko'rinadi
    state = state.copyWith(isLoading: true, error: null);
    try {
      final queryParams = <String, String>{
        'page': state.page.toString(),
        'limit': '100',
      };
      if (state.filterStatus != null) {
        queryParams['status'] = state.filterStatus!.value;
      }
      if (state.filterType != null) {
        queryParams['type'] = state.filterType!.value;
      }
      if (state.filterScope != null) {
        queryParams['scope'] = state.filterScope!.value;
      }
      if (state.searchQuery != null && state.searchQuery!.isNotEmpty) {
        queryParams['search'] = state.searchQuery!;
      }
      if (state.cargoFrom != null && state.cargoFrom!.isNotEmpty) {
        queryParams['cargoFrom'] = state.cargoFrom!;
      }
      if (state.cargoTo != null && state.cargoTo!.isNotEmpty) {
        queryParams['cargoTo'] = state.cargoTo!;
      }
      if (state.vehicleType != null && state.vehicleType!.isNotEmpty) {
        queryParams['vehicleType'] = state.vehicleType!;
      }

      final response = await _api.get(
        ApiConfig.orders,
        queryParameters: queryParams,
      );

      final data = response.data;
      List<dynamic> list;
      int total = 0;

      if (data is Map<String, dynamic>) {
        list = (data['data'] as List?) ?? [];
        final pagination = data['pagination'] as Map<String, dynamic>?;
        total = pagination?['total'] as int? ?? list.length;
      } else if (data is List) {
        list = data;
        total = list.length;
      } else {
        list = [];
      }

      final newOrders = list.map((e) {
        return Order.fromJson(e as Map<String, dynamic>);
      }).toList();

      // Har doim yangi natijalarni ko'rsatish — filter o'zgarganda bo'sh bo'lishi mumkin
      state = state.copyWith(
        orders: newOrders,
        isLoading: false,
        total: total,
      );
    } catch (e) {
      print('ORDERS ERROR: $e');
      // Xatolikda eski e'lonlarni saqlab qolish
      state = state.copyWith(
        isLoading: false,
        error: state.orders.isEmpty ? 'Buyurtmalarni yuklashda xatolik: $e' : null,
      );
    }
  }

  void setFilter(OrderStatus? status) {
    if (status == null) {
      state = state.copyWith(clearFilter: true, page: 1);
    } else {
      state = state.copyWith(filterStatus: status, page: 1);
    }
    loadOrders();
  }

  void setTypeFilter(OrderType? type) {
    if (type == null) {
      state = state.copyWith(clearType: true, page: 1);
    } else {
      state = state.copyWith(filterType: type, page: 1);
    }
    loadOrders();
  }

  void setScopeFilter(OrderScope? scope) {
    if (scope == null) {
      state = state.copyWith(clearScope: true, page: 1);
    } else {
      state = state.copyWith(filterScope: scope, page: 1);
    }
    loadOrders();
  }

  void setCargoFrom(String? from) {
    if (from == null) {
      state = state.copyWith(clearCargoFrom: true, page: 1);
    } else {
      state = state.copyWith(cargoFrom: from, page: 1);
    }
    loadOrders();
  }

  void setCargoTo(String? to) {
    if (to == null) {
      state = state.copyWith(clearCargoTo: true, page: 1);
    } else {
      state = state.copyWith(cargoTo: to, page: 1);
    }
    loadOrders();
  }

  void setVehicleTypeFilter(String? vehicleType) {
    if (vehicleType == null) {
      state = state.copyWith(clearVehicleType: true, page: 1);
    } else {
      state = state.copyWith(vehicleType: vehicleType, page: 1);
    }
    loadOrders();
  }

  /// Returns null on success, error message string on failure.
  Future<String?> acceptOrder(String orderId) async {
    try {
      await _api.post(ApiConfig.orderAccept(orderId));
      // Update order locally — change status to CONTACTED
      final updatedOrders = state.orders.map((o) {
        if (o.id == orderId) {
          return Order(
            id: o.id,
            userId: o.userId,
            messageText: o.messageText,
            groupTitle: o.groupTitle,
            groupTelegramId: o.groupTelegramId,
            senderName: o.senderName,
            senderUsername: o.senderUsername,
            senderPhone: o.senderPhone,
            senderTelegramId: o.senderTelegramId,
            messageDate: o.messageDate,
            cargoFrom: o.cargoFrom,
            cargoTo: o.cargoTo,
            cargoType: o.cargoType,
            cargoWeight: o.cargoWeight,
            price: o.price,
            phone: o.phone,
            distance: o.distance,
            type: o.type,
            vehicleType: o.vehicleType,
            vehicleCapacity: o.vehicleCapacity,
            notes: o.notes,
            status: OrderStatus.contacted,
            senderTodayAds: o.senderTodayAds,
            senderTotalAds: o.senderTotalAds,
            createdAt: o.createdAt,
            updatedAt: DateTime.now(),
            scope: o.scope,
            isManual: o.isManual,
            isForSale: o.isForSale,
            salePrice: o.salePrice,
            acceptedAt: DateTime.now(),
            closedAmount: o.closedAmount,
            closedAt: o.closedAt,
            surgeMultiplier: o.surgeMultiplier,
            surgeExpiresAt: o.surgeExpiresAt,
          );
        }
        return o;
      }).toList();
      state = state.copyWith(orders: updatedOrders);
      return null; // success
    } catch (e) {
      final msg = e.toString();
      if (msg.contains('Maksimal 10')) {
        return 'Maksimal 10 ta buyurtma! Avval bitta yoping yoki bekor qiling.';
      }
      return 'Qabul qilishda xatolik';
    }
  }

  void setSearch(String query) {
    _searchDebounce?.cancel();
    // Darhol client-side filter uchun state yangilash
    state = state.copyWith(searchQuery: query, page: 1);
    // Server-side search — debounce 400ms
    _searchDebounce = Timer(const Duration(milliseconds: 400), () {
      loadOrders();
    });
  }

  Future<void> updateStatus(String orderId, OrderStatus newStatus) async {
    try {
      await _api.patch(
        ApiConfig.orderStatus(orderId),
        data: {'status': newStatus.value},
      );
      // Refresh
      loadOrders();
    } catch (_) {}
  }

  Future<bool> blockSender(Order order) async {
    try {
      await _api.post(
        '/blocked-users',
        data: {
          'senderTelegramId': order.senderTelegramId ?? '',
          'senderName': order.senderName,
          'senderUsername': order.senderUsername,
          'phone': order.phone,
          'messageText': order.messageText,
          'groupTitle': order.groupTitle,
          'groupTelegramId': order.groupTelegramId,
        },
      );
      loadOrders();
      return true;
    } catch (_) {
      return false;
    }
  }
}

/// Provider for orders state.
final ordersProvider =
    StateNotifierProvider<OrdersNotifier, OrdersState>((ref) {
  final api = ref.read(apiClientProvider);
  final ws = ref.read(wsClientProvider);
  return OrdersNotifier(api, ws, ref);
});

/// Provider for a single order detail.
final orderDetailProvider =
    FutureProvider.family<Order?, String>((ref, orderId) async {
  final ordersState = ref.read(ordersProvider);
  final cached = ordersState.orders.where((o) => o.id == orderId).firstOrNull;
  if (cached != null) return cached;

  try {
    final api = ref.read(apiClientProvider);
    final response = await api.get(ApiConfig.orderById(orderId));
    final json = response.data as Map<String, dynamic>;
    return Order.fromJson(json);
  } catch (_) {
    return null;
  }
});
