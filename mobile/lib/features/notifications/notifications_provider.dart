import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/api_config.dart';
import '../../core/api/api_client.dart';
import '../../core/api/websocket_client.dart';
import '../../core/models/notification.dart';

/// Notifications state.
class NotificationsState {
  final List<AppNotification> notifications;
  final int unreadCount;
  final bool isLoading;
  final String? error;

  const NotificationsState({
    this.notifications = const [],
    this.unreadCount = 0,
    this.isLoading = false,
    this.error,
  });

  NotificationsState copyWith({
    List<AppNotification>? notifications,
    int? unreadCount,
    bool? isLoading,
    String? error,
  }) {
    return NotificationsState(
      notifications: notifications ?? this.notifications,
      unreadCount: unreadCount ?? this.unreadCount,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Notifier for notifications management.
class NotificationsNotifier extends StateNotifier<NotificationsState> {
  final ApiClient _api;
  StreamSubscription<WsEvent>? _wsSub;

  NotificationsNotifier(this._api, WebSocketClient ws)
      : super(const NotificationsState()) {
    loadNotifications();
    // Listen for real-time notifications via WebSocket
    _wsSub = ws.events
        .where((e) => e.type == WsEventType.notification)
        .listen(_onNewNotification);
  }

  void _onNewNotification(WsEvent event) {
    try {
      final notification = AppNotification.fromJson(event.data);
      state = state.copyWith(
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      );
    } catch (_) {
      // Ignore parse errors for malformed notification data
    }
  }

  @override
  void dispose() {
    _wsSub?.cancel();
    super.dispose();
  }

  /// Load all notifications from the server.
  Future<void> loadNotifications() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _api.get(ApiConfig.notifications);
      final data = response.data;

      List<dynamic> list;
      if (data is Map<String, dynamic>) {
        list = (data['data'] as List?) ?? (data['notifications'] as List?) ?? [];
      } else if (data is List) {
        list = data;
      } else {
        list = [];
      }

      final notifications = list
          .map((e) => AppNotification.fromJson(e as Map<String, dynamic>))
          .toList();

      final unreadCount =
          notifications.where((n) => !n.isRead).length;

      state = state.copyWith(
        notifications: notifications,
        unreadCount: unreadCount,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Bildirishnomalarni yuklashda xatolik',
      );
    }
  }

  /// Mark a single notification as read.
  Future<void> markAsRead(String id) async {
    try {
      await _api.patch(ApiConfig.notificationRead(id));

      final updated = state.notifications.map((n) {
        if (n.id == id && !n.isRead) {
          return AppNotification(
            id: n.id,
            title: n.title,
            body: n.body,
            target: n.target,
            data: n.data,
            isRead: true,
            createdAt: n.createdAt,
          );
        }
        return n;
      }).toList();

      final unreadCount = updated.where((n) => !n.isRead).length;

      state = state.copyWith(
        notifications: updated,
        unreadCount: unreadCount,
      );
    } catch (_) {
      // Silently fail — not critical
    }
  }

  /// Mark all notifications as read.
  Future<void> markAllAsRead() async {
    // Collect unread IDs before optimistic update
    final unreadIds = state.notifications
        .where((n) => !n.isRead)
        .map((n) => n.id)
        .toList();

    if (unreadIds.isEmpty) return;

    // Optimistically update UI
    final updated = state.notifications.map((n) {
      if (!n.isRead) {
        return AppNotification(
          id: n.id,
          title: n.title,
          body: n.body,
          target: n.target,
          data: n.data,
          isRead: true,
          createdAt: n.createdAt,
        );
      }
      return n;
    }).toList();

    state = state.copyWith(
      notifications: updated,
      unreadCount: 0,
    );

    // Mark each unread notification on the server
    for (final id in unreadIds) {
      try {
        await _api.patch(ApiConfig.notificationRead(id));
      } catch (_) {
        // Continue even if individual requests fail
      }
    }
  }
}

/// Provider for notifications state.
final notificationsProvider =
    StateNotifierProvider<NotificationsNotifier, NotificationsState>((ref) {
  final api = ref.read(apiClientProvider);
  final ws = ref.read(wsClientProvider);
  return NotificationsNotifier(api, ws);
});

/// Provider for unread notification count (for badges).
final unreadNotificationCountProvider = Provider<int>((ref) {
  return ref.watch(notificationsProvider).unreadCount;
});
