import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/api_config.dart';
import '../../core/api/api_client.dart';
import '../../core/models/order.dart';

/// State for accepted orders.
class AcceptedOrdersState {
  final List<Order> orders;
  final bool isLoading;
  final String? error;
  final int total;
  final Map<String, dynamic> stats;

  const AcceptedOrdersState({
    this.orders = const [],
    this.isLoading = false,
    this.error,
    this.total = 0,
    this.stats = const {},
  });

  AcceptedOrdersState copyWith({
    List<Order>? orders,
    bool? isLoading,
    String? error,
    int? total,
    Map<String, dynamic>? stats,
  }) {
    return AcceptedOrdersState(
      orders: orders ?? this.orders,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      total: total ?? this.total,
      stats: stats ?? this.stats,
    );
  }

  int get activeCount => orders.where((o) => o.acceptedStatus == 'ACCEPTED' || o.acceptedStatus == 'IN_PROGRESS').length;
  int get closedCount => orders.where((o) => o.acceptedStatus == 'CLOSED').length;
  int get cancelledCount => orders.where((o) => o.acceptedStatus == 'CANCELLED').length;
}

/// Notifier for accepted orders management.
class AcceptedOrdersNotifier extends StateNotifier<AcceptedOrdersState> {
  final ApiClient _api;

  AcceptedOrdersNotifier(this._api) : super(const AcceptedOrdersState()) {
    loadAccepted();
  }

  Future<void> loadAccepted() async {
    // Eski ma'lumotlarni saqlab qolish — loading paytida ham ko'rinadi
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _api.get(ApiConfig.ordersAccepted);
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

      final newOrders = list.map((e) => Order.fromJson(e as Map<String, dynamic>)).toList();

      // Har doim yangi natijalarni ko'rsatish
      state = state.copyWith(
        orders: newOrders,
        isLoading: false,
        total: total,
      );
    } catch (e) {
      // Xatolikda eski ma'lumotlarni saqlab qolish
      state = state.copyWith(
        isLoading: false,
        error: state.orders.isEmpty ? 'Qabul qilingan yuklarni yuklashda xatolik' : null,
      );
    }
  }

  Future<bool> closeDeal(String orderId, double amount) async {
    try {
      await _api.post(
        ApiConfig.orderCloseDeal(orderId),
        data: {'amount': amount},
      );
      await loadAccepted();
      return true;
    } catch (e) {
      state = state.copyWith(error: 'Bitimni yopishda xatolik');
      return false;
    }
  }

  Future<bool> cancelAccepted(String orderId) async {
    try {
      await _api.patch(
        ApiConfig.orderStatus(orderId),
        data: {'status': 'NEW', 'acceptedStatus': 'CANCELLED'},
      );
      await loadAccepted();
      return true;
    } catch (e) {
      state = state.copyWith(error: 'Bekor qilishda xatolik');
      return false;
    }
  }

  Future<Map<String, dynamic>?> findDriver(String orderId, {String? phone}) async {
    try {
      final response = await _api.post(
        ApiConfig.orderFindDriver(orderId),
        data: phone != null ? {'phone': phone} : null,
      );
      // Refresh orders so broadcastCount updates
      loadAccepted();
      return response.data as Map<String, dynamic>;
    } catch (e) {
      // Backend xabarini DioException dan olish
      String errorMsg = 'Haydovchi topishda xatolik';
      try {
        final dynamic dioError = e;
        final data = dioError.response?.data;
        if (data is Map<String, dynamic> && data['message'] != null) {
          errorMsg = data['message'].toString();
        }
      } catch (_) {}

      // Fallback: e.toString() dan qidirish
      final fullMsg = e.toString();
      if (fullMsg.contains('429') || errorMsg.contains('kutish kerak')) {
        errorMsg = '3 daqiqa kutish kerak';
      }

      state = state.copyWith(error: errorMsg);
      return null;
    }
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
      await loadAccepted();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> stopBroadcast() async {
    try {
      await _api.post(ApiConfig.ordersStopBroadcast);
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<void> refresh() async {
    await loadAccepted();
  }
}

/// Provider for accepted orders.
final acceptedOrdersProvider =
    StateNotifierProvider<AcceptedOrdersNotifier, AcceptedOrdersState>((ref) {
  final api = ref.read(apiClientProvider);
  return AcceptedOrdersNotifier(api);
});
