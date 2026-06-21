import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/silk_theme.dart';
import '../../core/models/notification.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/loading_indicator.dart';
import 'notifications_provider.dart';

/// Notifications screen with unread indicators, time ago, pull-to-refresh.
class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() =>
      _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(notificationsProvider.notifier).loadNotifications();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(notificationsProvider);

    return Scaffold(
      appBar: CustomAppBar(
        title: 'Bildirishnomalar',
        showBack: true,
        actions: [
          if (state.unreadCount > 0)
            TextButton(
              onPressed: () =>
                  ref.read(notificationsProvider.notifier).markAllAsRead(),
              style: TextButton.styleFrom(
                foregroundColor: SilkTheme.brand,
                textStyle: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
              child: const Text('Hammasini o\'qish'),
            ),
        ],
      ),
      backgroundColor: SilkTheme.bgOf(context),
      body: _buildBody(state),
    );
  }

  Widget _buildBody(NotificationsState state) {
    if (state.isLoading && state.notifications.isEmpty) {
      return const ShimmerLoading(itemCount: 6, itemHeight: 90);
    }

    if (state.error != null && state.notifications.isEmpty) {
      return ErrorState(
        message: state.error!,
        onRetry: () =>
            ref.read(notificationsProvider.notifier).loadNotifications(),
      );
    }

    if (state.notifications.isEmpty) {
      return const EmptyState(
        icon: Icons.notifications_none_outlined,
        title: 'Bildirishnomalar yo\'q',
        subtitle: 'Hozircha hech qanday bildirishnoma kelmagan.',
      );
    }

    return RefreshIndicator(
      color: SilkTheme.brand,
      onRefresh: () =>
          ref.read(notificationsProvider.notifier).loadNotifications(),
      child: ListView.separated(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        itemCount: state.notifications.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (context, index) {
          final notification = state.notifications[index];
          return _NotificationCard(notification: notification);
        },
      ),
    );
  }
}

/// Single notification card with left border indicator and unread dot.
class _NotificationCard extends ConsumerWidget {
  final AppNotification notification;

  const _NotificationCard({required this.notification});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isUnread = !notification.isRead;

    return GestureDetector(
      onTap: () {
        if (isUnread) {
          ref
              .read(notificationsProvider.notifier)
              .markAsRead(notification.id);
        }
      },
      child: Container(
        decoration: BoxDecoration(
          color: SilkTheme.surfaceOf(context),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: SilkTheme.borderOf(context)),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(14),
          child: Container(
            decoration: BoxDecoration(
              border: Border(
                left: BorderSide(
                  width: 3,
                  color: isUnread ? SilkTheme.brand : Colors.transparent,
                ),
              ),
            ),
            padding: const EdgeInsets.all(14),
            child: Stack(
              children: [
                // Content
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title
                    Padding(
                      padding: EdgeInsets.only(right: isUnread ? 16 : 0),
                      child: Text(
                        notification.title,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight:
                              isUnread ? FontWeight.w600 : FontWeight.w500,
                          color: SilkTheme.inkOf(context),
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),

                    if (notification.body.isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Text(
                        notification.body,
                        style: TextStyle(
                          fontSize: 13,
                          color: SilkTheme.mutedOf(context),
                          height: 1.4,
                        ),
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],

                    const SizedBox(height: 8),

                    // Time ago
                    Text(
                      _formatTimeAgo(notification.createdAt),
                      style: TextStyle(
                        fontSize: 12,
                        color: SilkTheme.mutedOf(context),
                      ),
                    ),
                  ],
                ),

                // Unread dot
                if (isUnread)
                  Positioned(
                    top: 0,
                    right: 0,
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: SilkTheme.brand,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// Format time difference in Uzbek.
  String _formatTimeAgo(DateTime dateTime) {
    final now = DateTime.now();
    final diff = now.difference(dateTime);

    if (diff.inSeconds < 60) {
      return 'Hozirgina';
    } else if (diff.inMinutes < 60) {
      return '${diff.inMinutes} daq oldin';
    } else if (diff.inHours < 24) {
      return '${diff.inHours} soat oldin';
    } else if (diff.inDays == 1) {
      return 'Kecha';
    } else if (diff.inDays < 7) {
      return '${diff.inDays} kun oldin';
    } else if (diff.inDays < 30) {
      final weeks = (diff.inDays / 7).floor();
      return '$weeks hafta oldin';
    } else if (diff.inDays < 365) {
      final months = (diff.inDays / 30).floor();
      return '$months oy oldin';
    } else {
      final years = (diff.inDays / 365).floor();
      return '$years yil oldin';
    }
  }
}
