import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/api_config.dart';
import '../../core/api/api_client.dart';
import '../../core/models/balance.dart';

// ============================================================
// BALANCE STATE
// ============================================================

class BalanceState {
  final double balance;
  final List<BalanceTransaction> transactions;
  final bool isLoading;
  final String? error;

  const BalanceState({
    this.balance = 0,
    this.transactions = const [],
    this.isLoading = false,
    this.error,
  });

  BalanceState copyWith({
    double? balance,
    List<BalanceTransaction>? transactions,
    bool? isLoading,
    String? error,
  }) {
    return BalanceState(
      balance: balance ?? this.balance,
      transactions: transactions ?? this.transactions,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

// ============================================================
// BALANCE NOTIFIER
// ============================================================

class BalanceNotifier extends StateNotifier<BalanceState> {
  final ApiClient _api;

  BalanceNotifier(this._api) : super(const BalanceState()) {
    loadBalance();
    loadTransactions();
  }

  /// GET /balance - balans summasini olish
  Future<void> loadBalance() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _api.get(ApiConfig.balance);
      final data = response.data;

      double amount = 0;
      if (data is Map<String, dynamic>) {
        amount = (data['balance'] as num?)?.toDouble() ?? 0;
      } else if (data is num) {
        amount = data.toDouble();
      }

      state = state.copyWith(balance: amount, isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Balansni yuklashda xatolik',
      );
    }
  }

  /// GET /balance/transactions - tranzaksiyalar ro'yxatini olish
  Future<void> loadTransactions() async {
    try {
      final response = await _api.get(ApiConfig.balanceTransactions);
      final data = response.data;

      List<dynamic> list;
      if (data is Map<String, dynamic>) {
        list = (data['data'] as List?) ??
            (data['transactions'] as List?) ??
            (data['items'] as List?) ??
            [];
      } else if (data is List) {
        list = data;
      } else {
        list = [];
      }

      final transactions = list
          .map((e) => BalanceTransaction.fromJson(e as Map<String, dynamic>))
          .toList();

      state = state.copyWith(transactions: transactions);
    } catch (e) {
      state = state.copyWith(error: 'Tranzaksiyalarni yuklashda xatolik');
    }
  }

  /// POST /balance/top-up - balansni to'ldirish
  Future<bool> topUp(double amount) async {
    try {
      await _api.post(ApiConfig.balanceTopUp, data: {'amount': amount});
      // Balans va tranzaksiyalarni qayta yuklash
      await loadBalance();
      await loadTransactions();
      return true;
    } catch (e) {
      state = state.copyWith(error: 'Balansni to\'ldirish xatolik');
      return false;
    }
  }
}

// ============================================================
// PROVIDER
// ============================================================

final balanceProvider =
    StateNotifierProvider<BalanceNotifier, BalanceState>((ref) {
  final api = ref.read(apiClientProvider);
  return BalanceNotifier(api);
});
