import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../config/silk_theme.dart';
import '../../core/models/chat.dart';
import '../../widgets/app_scaffold.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/silk/ikat_background.dart';
import '../auth/auth_provider.dart';
import 'chat_provider.dart';

/// Chat rooms list — Silk Road edition.
class ChatScreen extends ConsumerStatefulWidget {
  const ChatScreen({super.key});

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(chatProvider.notifier).loadRooms();
    });
  }

  @override
  Widget build(BuildContext context) {
    final chatState = ref.watch(chatProvider);

    return Scaffold(
      backgroundColor: SilkTheme.bgOf(context),
      appBar: AppBar(
        backgroundColor: SilkTheme.bgOf(context),
        elevation: 0,
        scrolledUnderElevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: Icon(Icons.menu, color: SilkTheme.inkOf(context)),
          onPressed: () {
            ref.read(scaffoldKeyProvider).currentState?.openDrawer();
          },
        ),
        title: Text(
          'Chat',
          style: SilkTheme.screenTitle(context),
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.search, color: SilkTheme.inkOf(context)),
            onPressed: () {},
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: RefreshIndicator(
        color: SilkTheme.brandOf(context),
        onRefresh: () => ref.read(chatProvider.notifier).loadRooms(),
        child: _buildBody(chatState),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _createSupportRoom,
        backgroundColor: SilkTheme.inkOf(context),
        foregroundColor: SilkTheme.bgOf(context),
        elevation: 0,
        child: const Icon(Icons.add, size: 22),
      ),
    );
  }

  Widget _buildBody(ChatState chatState) {
    if (chatState.isLoading && chatState.rooms.isEmpty) {
      return const ShimmerLoading(itemCount: 5, itemHeight: 80);
    }

    if (chatState.error != null && chatState.rooms.isEmpty) {
      return ErrorState(
        message: chatState.error!,
        onRetry: () => ref.read(chatProvider.notifier).loadRooms(),
      );
    }

    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 120),
      children: [
        if (chatState.rooms.isEmpty) ...[
          const SizedBox(height: 40),
          EmptyState(
            icon: Icons.chat_bubble_outline,
            title: 'Chatlar yo\'q',
            subtitle: 'Hozircha hech qanday chat mavjud emas.',
            action: ElevatedButton.icon(
              onPressed: _createSupportRoom,
              icon: const Icon(Icons.add, size: 18),
              label: const Text('Chat boshlash'),
            ),
          ),
        ] else ...[
          for (final room in chatState.rooms) ...[
            _ChatRoomCard(
              room: room,
              onTap: () {
                final isDriver =
                    ref.read(authStateProvider).user?.role.value == 'DRIVER';
                final path = isDriver
                    ? '/driver/chat/${room.id}'
                    : '/chat/${room.id}';
                context.push(path);
              },
            ),
            const SizedBox(height: 10),
          ],
        ],
        const SizedBox(height: 14),
        _AiAssistantCard(onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('AI yordamchi tez orada')),
          );
        }),
      ],
    );
  }

  Future<void> _createSupportRoom() async {
    final isDriver = ref.read(authStateProvider).user?.role.value == 'DRIVER';
    final type = isDriver ? 'DRIVER_SUPPORT' : 'DISPATCHER_SUPPORT';
    final room = await ref.read(chatProvider.notifier).createRoom(type);
    if (room != null && mounted) {
      final path = isDriver ? '/driver/chat/${room.id}' : '/chat/${room.id}';
      context.push(path);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Silk Road chat row
// ─────────────────────────────────────────────────────────────────────────────

class _ChatRoomCard extends StatelessWidget {
  final ChatRoom room;
  final VoidCallback onTap;

  const _ChatRoomCard({required this.room, required this.onTap});

  bool get _isSupport =>
      room.type == 'DISPATCHER_SUPPORT' || room.type == 'DRIVER_SUPPORT';

  @override
  Widget build(BuildContext context) {
    final lastMsg = room.lastMessage;
    final timeStr = lastMsg != null ? _formatTime(lastMsg.createdAt) : '';
    final preview = lastMsg?.content ?? 'Yangi chat';
    final unread = room.unreadCount > 0;

    return Material(
      color: SilkTheme.surfaceOf(context),
      borderRadius: BorderRadius.circular(SilkTheme.radiusChat),
      child: InkWell(
        borderRadius: BorderRadius.circular(SilkTheme.radiusChat),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            border: Border.all(color: SilkTheme.borderOf(context), width: 1),
            borderRadius: BorderRadius.circular(SilkTheme.radiusChat),
          ),
          child: Row(
            children: [
              _buildAvatar(context),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            room.name ?? 'Qo\'llab-quvvatlash',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: SilkTheme.cardName(context),
                          ),
                        ),
                        if (timeStr.isNotEmpty)
                          Text(
                            timeStr,
                            style: SilkTheme.body(
                              fontSize: 11,
                              color: SilkTheme.muted2Of(context),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 3),
                    Text(
                      preview,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: SilkTheme.body(
                        fontSize: 13,
                        color: unread
                            ? SilkTheme.inkOf(context)
                            : SilkTheme.mutedOf(context),
                        fontWeight: unread ? FontWeight.w500 : FontWeight.w400,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Icon(
                Icons.chevron_right,
                size: 18,
                color: SilkTheme.muted2Of(context),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAvatar(BuildContext context) {
    if (_isSupport) {
      return Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              gradient: SilkTheme.supportAvatar,
            ),
            child: const Icon(
              Icons.support_agent,
              color: Colors.white,
              size: 22,
            ),
          ),
          if (room.unreadCount > 0) _buildUnread(context),
        ],
      );
    }
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Container(
          width: 48,
          height: 48,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: SilkTheme.softOf(context),
            border: Border.all(color: SilkTheme.borderOf(context), width: 1),
          ),
          child: Icon(
            _getRoomIcon(room.type),
            color: SilkTheme.mutedOf(context),
            size: 20,
          ),
        ),
        if (room.unreadCount > 0) _buildUnread(context),
      ],
    );
  }

  Widget _buildUnread(BuildContext context) {
    return Positioned(
      top: -2,
      right: -2,
      child: Container(
        width: 22,
        height: 22,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: SilkTheme.accentOf(context),
          shape: BoxShape.circle,
          border: Border.all(color: SilkTheme.surfaceOf(context), width: 2),
        ),
        child: Text(
          room.unreadCount > 99 ? '99+' : room.unreadCount.toString(),
          style: SilkTheme.mono(
            fontSize: 10,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
      ),
    );
  }

  String _formatTime(DateTime dateTime) {
    final now = DateTime.now();
    final diff = now.difference(dateTime);

    if (diff.inMinutes < 1) return 'hozir';
    if (diff.inHours < 1) return '${diff.inMinutes} daq';
    if (diff.inDays < 1) return DateFormat('HH:mm').format(dateTime);
    if (diff.inDays < 7) return DateFormat('EEE').format(dateTime);
    return DateFormat('dd.MM').format(dateTime);
  }

  IconData _getRoomIcon(String type) {
    switch (type) {
      case 'DISPATCHER_SUPPORT':
        return Icons.headset_mic_outlined;
      case 'DRIVER_SUPPORT':
        return Icons.support_agent;
      case 'DIRECT':
        return Icons.person_outline;
      default:
        return Icons.chat_bubble_outline;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AI assistant gradient card
// ─────────────────────────────────────────────────────────────────────────────

class _AiAssistantCard extends StatelessWidget {
  final VoidCallback onTap;
  const _AiAssistantCard({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(SilkTheme.radiusCard),
        boxShadow: const [SilkTheme.cardShadow],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(SilkTheme.radiusCard),
        child: Stack(
          children: [
            const Positioned.fill(
              child: DecoratedBox(
                decoration: BoxDecoration(gradient: SilkTheme.heroGradient),
              ),
            ),
            const Positioned.fill(
              child: IkatBackground(
                stroke: SilkTheme.accent2,
                opacity: 0.06,
                tile: 60,
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(22),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.auto_awesome,
                      color: SilkTheme.accent2, size: 24),
                  const SizedBox(height: 14),
                  Text(
                    'AI Yordamchi',
                    style: SilkTheme.display(
                      fontSize: 17,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                      letterSpacing: -0.17,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    "Savolingiz bo'lsa, men yordamga tayyorman",
                    style: SilkTheme.body(
                      fontSize: 12,
                      color: Colors.white.withOpacity(0.6),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Material(
                    color: const Color(0xFFF5EFE2),
                    borderRadius: BorderRadius.circular(999),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(999),
                      onTap: onTap,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 18,
                          vertical: 9,
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'Savol berish',
                              style: SilkTheme.body(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: SilkTheme.brand,
                              ),
                            ),
                            const SizedBox(width: 6),
                            const Icon(Icons.arrow_forward,
                                size: 12, color: SilkTheme.brand),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
