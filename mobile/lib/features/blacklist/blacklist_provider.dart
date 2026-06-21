import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/api_config.dart';
import '../../core/api/api_client.dart';
import '../../core/models/session_model.dart';

/// Qora ro'yxatdagi guruh modeli (backend dan keladi)
class BlacklistedGroup {
  final String groupTelegramId;
  final String title;
  final String? sessionId;
  final DateTime? addedAt;

  const BlacklistedGroup({
    required this.groupTelegramId,
    required this.title,
    this.sessionId,
    this.addedAt,
  });

  factory BlacklistedGroup.fromJson(Map<String, dynamic> json) {
    return BlacklistedGroup(
      groupTelegramId: json['groupTelegramId'] as String,
      title: json['title'] as String? ?? '',
      sessionId: json['sessionId'] as String?,
      addedAt: json['addedAt'] != null
          ? DateTime.tryParse(json['addedAt'] as String)
          : null,
    );
  }
}

/// Ekran uchun guruh (session info + blacklist holati bilan)
class GroupWithBlacklist {
  final GroupModel group;
  final String sessionName;
  final bool isBlacklisted;

  const GroupWithBlacklist({
    required this.group,
    required this.sessionName,
    this.isBlacklisted = false,
  });

  GroupWithBlacklist copyWith({bool? isBlacklisted}) {
    return GroupWithBlacklist(
      group: group,
      sessionName: sessionName,
      isBlacklisted: isBlacklisted ?? this.isBlacklisted,
    );
  }
}

class BlacklistState {
  final List<GroupWithBlacklist> allGroups;
  final List<SessionModel> sessions;
  final Set<String> blacklistedIds;
  final String? selectedSessionId;
  final bool isLoading;
  final String? error;
  final bool isSaving;

  const BlacklistState({
    this.allGroups = const [],
    this.sessions = const [],
    this.blacklistedIds = const {},
    this.selectedSessionId,
    this.isLoading = false,
    this.error,
    this.isSaving = false,
  });

  List<GroupWithBlacklist> get filteredGroups {
    if (selectedSessionId == null || selectedSessionId!.isEmpty) {
      return allGroups;
    }
    return allGroups
        .where((g) => g.group.sessionId == selectedSessionId)
        .toList();
  }

  int get blacklistedCount => blacklistedIds.length;

  BlacklistState copyWith({
    List<GroupWithBlacklist>? allGroups,
    List<SessionModel>? sessions,
    Set<String>? blacklistedIds,
    String? selectedSessionId,
    bool? isLoading,
    String? error,
    bool? isSaving,
    bool clearSession = false,
  }) {
    return BlacklistState(
      allGroups: allGroups ?? this.allGroups,
      sessions: sessions ?? this.sessions,
      blacklistedIds: blacklistedIds ?? this.blacklistedIds,
      selectedSessionId:
          clearSession ? null : (selectedSessionId ?? this.selectedSessionId),
      isLoading: isLoading ?? this.isLoading,
      error: error,
      isSaving: isSaving ?? this.isSaving,
    );
  }
}

class BlacklistNotifier extends StateNotifier<BlacklistState> {
  final ApiClient _api;

  BlacklistNotifier(this._api) : super(const BlacklistState()) {
    loadAll();
  }

  Future<void> loadAll() async {
    state = state.copyWith(isLoading: true);
    try {
      // Parallel: sessions + blacklisted groups
      final results = await Future.wait([
        _api.get(ApiConfig.sessions),
        _api.get(ApiConfig.blacklistedGroups),
      ]);

      // Parse sessions
      final sessionsData = results[0].data;
      List<dynamic> sessionList;
      if (sessionsData is Map<String, dynamic>) {
        sessionList = (sessionsData['data'] as List?) ?? [];
      } else if (sessionsData is List) {
        sessionList = sessionsData;
      } else {
        sessionList = [];
      }
      final sessions = sessionList
          .map((e) => SessionModel.fromJson(e as Map<String, dynamic>))
          .where((s) => s.status == SessionStatus.active && !s.isFrozen)
          .toList();

      // Parse blacklisted groups
      final blacklistData = results[1].data;
      List<dynamic> blacklistList;
      if (blacklistData is List) {
        blacklistList = blacklistData;
      } else {
        blacklistList = [];
      }
      final blacklisted = blacklistList
          .map((e) => BlacklistedGroup.fromJson(e as Map<String, dynamic>))
          .toList();
      final blacklistedIds =
          blacklisted.map((b) => b.groupTelegramId).toSet();

      // Har bir session uchun guruhlarni olish
      final allGroups = <GroupWithBlacklist>[];
      final seenTelegramIds = <String>{};

      for (final session in sessions) {
        try {
          final groupsResponse =
              await _api.get(ApiConfig.sessionGroups(session.id));
          final groupsData = groupsResponse.data;
          List<dynamic> groupsList;
          if (groupsData is Map<String, dynamic>) {
            groupsList = (groupsData['data'] as List?) ?? [];
          } else if (groupsData is List) {
            groupsList = groupsData;
          } else {
            groupsList = [];
          }

          for (final gJson in groupsList) {
            final group =
                GroupModel.fromJson(gJson as Map<String, dynamic>);
            if (!group.isActive || seenTelegramIds.contains(group.telegramId)) {
              continue;
            }
            seenTelegramIds.add(group.telegramId);
            allGroups.add(GroupWithBlacklist(
              group: group,
              sessionName: session.displayName,
              isBlacklisted: blacklistedIds.contains(group.telegramId),
            ));
          }
        } catch (_) {
          // Session guruhlarini olishda xatolik — davom etamiz
        }
      }

      // Blacklisted guruhlarni tepaga chiqarish
      allGroups.sort((a, b) {
        if (a.isBlacklisted != b.isBlacklisted) {
          return a.isBlacklisted ? -1 : 1;
        }
        return a.group.title.compareTo(b.group.title);
      });

      state = state.copyWith(
        allGroups: allGroups,
        sessions: sessions,
        blacklistedIds: blacklistedIds,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Yuklashda xatolik: $e',
      );
    }
  }

  void selectSession(String? sessionId) {
    if (sessionId == null || sessionId.isEmpty) {
      state = state.copyWith(clearSession: true);
    } else {
      state = state.copyWith(selectedSessionId: sessionId);
    }
  }

  Future<bool> toggleBlacklist(GroupWithBlacklist item) async {
    state = state.copyWith(isSaving: true);
    try {
      if (item.isBlacklisted) {
        // Olib tashlash
        await _api.delete(
            ApiConfig.removeBlacklistedGroup(item.group.telegramId));
        final newIds = Set<String>.from(state.blacklistedIds)
          ..remove(item.group.telegramId);
        _updateGroupBlacklistState(item.group.telegramId, false, newIds);
      } else {
        // Qo'shish
        await _api.post(ApiConfig.blacklistedGroups, data: {
          'groupTelegramId': item.group.telegramId,
          'title': item.group.title,
          'sessionId': item.group.sessionId,
        });
        final newIds = Set<String>.from(state.blacklistedIds)
          ..add(item.group.telegramId);
        _updateGroupBlacklistState(item.group.telegramId, true, newIds);
      }
      return true;
    } catch (_) {
      state = state.copyWith(isSaving: false);
      return false;
    }
  }

  void _updateGroupBlacklistState(
      String telegramId, bool isBlacklisted, Set<String> newIds) {
    final updated = state.allGroups.map((g) {
      if (g.group.telegramId == telegramId) {
        return g.copyWith(isBlacklisted: isBlacklisted);
      }
      return g;
    }).toList();

    state = state.copyWith(
      allGroups: updated,
      blacklistedIds: newIds,
      isSaving: false,
    );
  }
}

final blacklistProvider =
    StateNotifierProvider<BlacklistNotifier, BlacklistState>((ref) {
  final api = ref.read(apiClientProvider);
  return BlacklistNotifier(api);
});
