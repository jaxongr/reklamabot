import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../config/silk_theme.dart';
import '../../core/api/api_client.dart';
import '../../core/models/chat.dart';
import '../../widgets/loading_indicator.dart';
import '../auth/auth_provider.dart';
import 'chat_provider.dart';

/// Individual chat conversation screen.
class ChatRoomScreen extends ConsumerStatefulWidget {
  final String roomId;

  const ChatRoomScreen({super.key, required this.roomId});

  @override
  ConsumerState<ChatRoomScreen> createState() => _ChatRoomScreenState();
}

class _ChatRoomScreenState extends ConsumerState<ChatRoomScreen> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  final _focusNode = FocusNode();
  String? _currentUserId;
  final _isSending = ValueNotifier<bool>(false);

  @override
  void initState() {
    super.initState();
    Future.microtask(() async {
      ref.read(chatProvider.notifier).setCurrentRoom(widget.roomId);
      ref.read(chatProvider.notifier).loadMessages(widget.roomId);

      // Get current user ID from auth state
      final user = ref.read(authStateProvider).user;
      if (user != null) {
        _currentUserId = user.id;
      } else {
        // Fallback to secure storage
        final storage = ref.read(secureStorageProvider);
        _currentUserId = await storage.read(key: StorageKeys.userId);
      }
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    _focusNode.dispose();
    _isSending.dispose();
    ref.read(chatProvider.notifier).setCurrentRoom(null);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final chatState = ref.watch(chatProvider);
    final messages = chatState.messages[widget.roomId] ?? [];
    final room =
        chatState.rooms.where((r) => r.id == widget.roomId).firstOrNull;

    final roomName = room?.name ?? _getRoomTypeName(room?.type ?? '');

    return Scaffold(
      backgroundColor: SilkTheme.bgOf(context),
      appBar: AppBar(
        backgroundColor: SilkTheme.surfaceOf(context),
        elevation: 0,
        scrolledUnderElevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new,
              size: 20, color: SilkTheme.inkOf(context)),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          roomName,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: SilkTheme.inkOf(context),
          ),
        ),
      ),
      body: Column(
        children: [
          // ── Messages list ──
          Expanded(
            child: _buildMessagesList(chatState, messages),
          ),

          // ── Input bar ──
          _buildInputBar(),
        ],
      ),
    );
  }

  Widget _buildMessagesList(
      ChatState chatState, List<ChatMessage> messages) {
    if (chatState.isLoading && messages.isEmpty) {
      return const ShimmerLoading(itemCount: 6, itemHeight: 60);
    }

    if (chatState.error != null && messages.isEmpty) {
      return ErrorState(
        message: chatState.error!,
        onRetry: () =>
            ref.read(chatProvider.notifier).loadMessages(widget.roomId),
      );
    }

    if (messages.isEmpty) {
      return const EmptyState(
        icon: Icons.chat_outlined,
        title: 'Xabarlar yo\'q',
        subtitle: 'Birinchi xabarni yuboring!',
      );
    }

    return ListView.builder(
      controller: _scrollController,
      reverse: true,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      itemCount: messages.length,
      itemBuilder: (context, index) {
        final message = messages[index];
        final isOwn = _isOwnMessage(message);

        return _MessageBubble(
          key: ValueKey(message.id),
          message: message,
          isOwn: isOwn,
        );
      },
    );
  }

  Widget _buildInputBar() {
    return Container(
      padding: EdgeInsets.only(
        left: 12,
        right: 8,
        top: 8,
        bottom: MediaQuery.of(context).padding.bottom + 8,
      ),
      decoration: BoxDecoration(
        color: SilkTheme.surfaceOf(context),
        border: Border(
          top: BorderSide(color: SilkTheme.borderOf(context), width: 0.5),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _messageController,
              focusNode: _focusNode,
              textCapitalization: TextCapitalization.sentences,
              maxLines: 4,
              minLines: 1,
              decoration: InputDecoration(
                hintText: 'Xabar yozing...',
                hintStyle: TextStyle(
                  color: SilkTheme.muted2Of(context),
                  fontSize: 15,
                ),
                filled: true,
                fillColor: SilkTheme.bgOf(context),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 10,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: BorderSide.none,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: BorderSide.none,
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: BorderSide.none,
                ),
              ),
              onSubmitted: (_) => _sendMessage(),
            ),
          ),
          const SizedBox(width: 8),
          ValueListenableBuilder<bool>(
            valueListenable: _isSending,
            builder: (context, sending, _) => sending
                ? const SizedBox(
                    width: 40,
                    height: 40,
                    child: Padding(
                      padding: EdgeInsets.all(8),
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: SilkTheme.brand,
                      ),
                    ),
                  )
                : CircleAvatar(
                    radius: 20,
                    backgroundColor: SilkTheme.brand,
                    child: IconButton(
                      onPressed: _sendMessage,
                      icon: const Icon(
                        Icons.send_rounded,
                        color: Colors.white,
                        size: 18,
                      ),
                      padding: EdgeInsets.zero,
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Future<void> _sendMessage() async {
    final content = _messageController.text.trim();
    if (content.isEmpty || _isSending.value) return;

    _isSending.value = true;

    final success = await ref
        .read(chatProvider.notifier)
        .sendMessage(widget.roomId, content);

    if (success) {
      _messageController.clear();
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          0,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Xabar yuborishda xatolik'),
            backgroundColor: SilkTheme.danger,
          ),
        );
      }
    }

    _isSending.value = false;
  }

  bool _isOwnMessage(ChatMessage message) {
    if (_currentUserId == null) return false;
    return message.senderId == _currentUserId;
  }

  String _getRoomTypeName(String type) {
    switch (type) {
      case 'DISPATCHER_SUPPORT':
        return 'Qo\'llab-quvvatlash';
      case 'DRIVER_SUPPORT':
        return 'Haydovchi yordami';
      case 'DIRECT':
        return 'Shaxsiy chat';
      default:
        return 'Chat';
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Message bubble
// ─────────────────────────────────────────────────────────────────────────────

class _MessageBubble extends StatelessWidget {
  final ChatMessage message;
  final bool isOwn;

  const _MessageBubble({
    super.key,
    required this.message,
    required this.isOwn,
  });

  @override
  Widget build(BuildContext context) {
    final timeStr = DateFormat('HH:mm').format(message.createdAt);
    final maxWidth = MediaQuery.of(context).size.width * 0.75;

    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        mainAxisAlignment:
            isOwn ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          ConstrainedBox(
            constraints: BoxConstraints(maxWidth: maxWidth),
            child: Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 14,
                vertical: 10,
              ),
              decoration: BoxDecoration(
                color: isOwn
                    ? SilkTheme.brand
                    : SilkTheme.bgOf(context),
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(16),
                  topRight: const Radius.circular(16),
                  bottomLeft: Radius.circular(isOwn ? 16 : 4),
                  bottomRight: Radius.circular(isOwn ? 4 : 16),
                ),
              ),
              child: Column(
                crossAxisAlignment:
                    isOwn ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                children: [
                  // Sender name (only for other messages)
                  if (!isOwn && message.senderName != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Text(
                        message.senderName!,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: SilkTheme.brand,
                        ),
                      ),
                    ),

                  // Content
                  Text(
                    message.content,
                    style: TextStyle(
                      fontSize: 15,
                      color: isOwn ? Colors.white : SilkTheme.inkOf(context),
                      height: 1.35,
                    ),
                  ),

                  const SizedBox(height: 4),

                  // Time
                  Text(
                    timeStr,
                    style: TextStyle(
                      fontSize: 10,
                      color: isOwn
                          ? Colors.white.withValues(alpha: 0.7)
                          : SilkTheme.muted2Of(context),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
