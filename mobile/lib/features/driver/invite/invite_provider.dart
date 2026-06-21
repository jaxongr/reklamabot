import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../config/api_config.dart';
import '../../../core/api/api_client.dart';

// ============================================================
// INVITE STATE
// ============================================================

class InviteState {
  final String? referralCode;
  final Map<String, dynamic> stats;
  final List<Map<String, dynamic>> invitedDrivers;
  final bool isLoading;
  final String? error;

  const InviteState({
    this.referralCode,
    this.stats = const {},
    this.invitedDrivers = const [],
    this.isLoading = false,
    this.error,
  });

  InviteState copyWith({
    String? referralCode,
    Map<String, dynamic>? stats,
    List<Map<String, dynamic>>? invitedDrivers,
    bool? isLoading,
    String? error,
    bool clearReferralCode = false,
  }) {
    return InviteState(
      referralCode: clearReferralCode ? null : (referralCode ?? this.referralCode),
      stats: stats ?? this.stats,
      invitedDrivers: invitedDrivers ?? this.invitedDrivers,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  int get totalInvites => stats['totalInvites'] as int? ?? 0;
  int get activeInvites => stats['activeInvites'] as int? ?? 0;
  double get bonusEarned =>
      (stats['bonusEarned'] as num?)?.toDouble() ?? 0;
}

// ============================================================
// INVITE NOTIFIER
// ============================================================

class InviteNotifier extends StateNotifier<InviteState> {
  final ApiClient _api;

  InviteNotifier(this._api) : super(const InviteState()) {
    loadReferralCode();
    loadStats();
  }

  /// GET /drivers/referral - referral kodni olish
  Future<void> loadReferralCode() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _api.get(ApiConfig.driverReferral);
      final data = response.data;

      String? code;
      List<Map<String, dynamic>> drivers = [];

      if (data is Map<String, dynamic>) {
        code = data['code'] as String? ?? data['referralCode'] as String?;

        // Taklif qilingan haydovchilar ro'yxati
        final invitedList = data['invitedDrivers'] as List? ??
            data['invited'] as List? ??
            [];
        drivers = invitedList
            .map((e) => e is Map<String, dynamic> ? e : <String, dynamic>{})
            .where((e) => e.isNotEmpty)
            .toList();
      } else if (data is String) {
        code = data;
      }

      state = state.copyWith(
        referralCode: code,
        invitedDrivers: drivers,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Referral kodni yuklashda xatolik',
      );
    }
  }

  /// POST /drivers/referral - yangi referral kod yaratish
  Future<bool> generateCode() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _api.post(ApiConfig.driverReferral);
      final data = response.data;

      String? code;
      if (data is Map<String, dynamic>) {
        code = data['code'] as String? ?? data['referralCode'] as String?;
      } else if (data is String) {
        code = data;
      }

      state = state.copyWith(referralCode: code, isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Kod yaratishda xatolik',
      );
      return false;
    }
  }

  /// GET /drivers/invite-stats - taklif statistikasi
  Future<void> loadStats() async {
    try {
      final response = await _api.get(ApiConfig.driverInviteStats);
      final data = response.data;

      if (data is Map<String, dynamic>) {
        state = state.copyWith(stats: data);
      }
    } catch (e) {
      state = state.copyWith(error: 'Statistikani yuklashda xatolik');
    }
  }
}

// ============================================================
// PROVIDER
// ============================================================

final inviteProvider =
    StateNotifierProvider<InviteNotifier, InviteState>((ref) {
  final api = ref.read(apiClientProvider);
  return InviteNotifier(api);
});
