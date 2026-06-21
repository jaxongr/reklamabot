import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/api_config.dart';
import '../../core/api/api_client.dart';

class BlockedUser {
  final String id;
  final String senderTelegramId;
  final String? senderName;
  final String? senderUsername;
  final String reason;
  final int ruleNumber;
  final String? messageText;
  final String? groupTitle;
  final String? phone;
  final bool isActive;
  final DateTime createdAt;

  BlockedUser({
    required this.id,
    required this.senderTelegramId,
    this.senderName,
    this.senderUsername,
    required this.reason,
    required this.ruleNumber,
    this.messageText,
    this.groupTitle,
    this.phone,
    required this.isActive,
    required this.createdAt,
  });

  factory BlockedUser.fromJson(Map<String, dynamic> json) {
    return BlockedUser(
      id: json['id'] as String,
      senderTelegramId: json['senderTelegramId'] as String,
      senderName: json['senderName'] as String?,
      senderUsername: json['senderUsername'] as String?,
      reason: json['reason'] as String? ?? 'UNKNOWN',
      ruleNumber: json['ruleNumber'] as int? ?? 0,
      messageText: json['messageText'] as String?,
      groupTitle: json['groupTitle'] as String?,
      phone: json['phone'] as String?,
      isActive: json['isActive'] as bool? ?? true,
      createdAt: DateTime.tryParse(json['createdAt'] as String? ?? '') ?? DateTime.now(),
    );
  }
}

class BlockedState {
  final List<BlockedUser> items;
  final int total;
  final bool isLoading;
  final String? error;

  const BlockedState({
    this.items = const [],
    this.total = 0,
    this.isLoading = false,
    this.error,
  });

  BlockedState copyWith({
    List<BlockedUser>? items,
    int? total,
    bool? isLoading,
    String? error,
  }) {
    return BlockedState(
      items: items ?? this.items,
      total: total ?? this.total,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class BlockedNotifier extends StateNotifier<BlockedState> {
  final ApiClient _api;

  BlockedNotifier(this._api) : super(const BlockedState()) {
    loadBlocked();
  }

  Future<void> loadBlocked() async {
    state = state.copyWith(isLoading: true);
    try {
      final response = await _api.get(
        ApiConfig.blockedUsers,
        queryParameters: {'limit': '50', 'page': '1'},
      );
      final data = response.data;

      List<dynamic> list;
      int total = 0;

      if (data is Map<String, dynamic>) {
        list = (data['items'] as List?) ?? (data['data'] as List?) ?? [];
        total = data['total'] as int? ??
            (data['pagination'] as Map?)?['total'] as int? ??
            list.length;
      } else if (data is List) {
        list = data;
        total = list.length;
      } else {
        list = [];
      }

      state = state.copyWith(
        items: list.map((e) => BlockedUser.fromJson(e as Map<String, dynamic>)).toList(),
        total: total,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Yuklashda xatolik',
      );
    }
  }

  Future<bool> unblock(String id) async {
    try {
      await _api.patch(ApiConfig.unblockUser(id));
      loadBlocked();
      return true;
    } catch (_) {
      return false;
    }
  }
}

final blockedProvider =
    StateNotifierProvider<BlockedNotifier, BlockedState>((ref) {
  final api = ref.read(apiClientProvider);
  return BlockedNotifier(api);
});
