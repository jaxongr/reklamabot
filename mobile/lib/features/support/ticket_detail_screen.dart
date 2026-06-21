import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:intl/intl.dart';

import '../../config/silk_theme.dart';
import '../../core/api/api_client.dart';
import '../../core/models/support.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/loading_indicator.dart';
import 'support_provider.dart';

class TicketDetailScreen extends ConsumerStatefulWidget {
  final String ticketId;

  const TicketDetailScreen({super.key, required this.ticketId});

  @override
  ConsumerState<TicketDetailScreen> createState() => _TicketDetailScreenState();
}

class _TicketDetailScreenState extends ConsumerState<TicketDetailScreen> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  final _focusNode = FocusNode();
  String? _currentUserId;
  bool _isSending = false;

  @override
  void initState() {
    super.initState();
    Future.microtask(() async {
      ref.read(supportProvider.notifier).loadMessages(widget.ticketId);

      // Read current user ID
      final storage = ref.read(secureStorageProvider);
      _currentUserId = await storage.read(key: StorageKeys.userId);
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final supportState = ref.watch(supportProvider);
    final ticket = supportState.currentTicket;
    final messages = supportState.currentMessages;

    final isClosed = ticket?.status == 'CLOSED';

    return Scaffold(
      appBar: CustomAppBar(
        title: ticket?.subject ?? 'Tiket',
        showBack: true,
        actions: [
          if (ticket != null)
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: _buildAppBarStatusBadge(ticket.status),
            ),
        ],
      ),
      backgroundColor: SilkTheme.bg,
      body: Column(
        children: [
          // Closed ticket banner
          if (isClosed)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 10,
              ),
              color: SilkTheme.muted2.withValues(alpha: 0.1),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.lock_outline,
                    size: 16,
                    color: SilkTheme.muted2,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Tiket yopilgan',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: SilkTheme.muted2,
                    ),
                  ),
                ],
              ),
            ),

          // Ticket info header
          if (ticket != null && ticket.description.isNotEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: SilkTheme.surface,
                border: Border(
                  bottom: BorderSide(
                    color: SilkTheme.border.withValues(alpha: 0.5),
                  ),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    ticket.description,
                    style: const TextStyle(
                      fontSize: 13,
                      color: SilkTheme.muted,
                      height: 1.4,
                    ),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    DateFormat('dd.MM.yyyy HH:mm').format(ticket.createdAt),
                    style: const TextStyle(
                      fontSize: 11,
                      color: SilkTheme.muted2,
                    ),
                  ),
                ],
              ),
            ),

          // Messages list
          Expanded(
            child: _buildMessagesList(supportState, messages),
          ),

          // Input bar (hidden if closed)
          if (!isClosed) _buildInputBar(),
        ],
      ),
    );
  }

  Widget _buildAppBarStatusBadge(String status) {
    final color = _getStatusColor(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Text(
        _getStatusLabel(status),
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }

  Widget _buildMessagesList(
    SupportState supportState,
    List<SupportMessage> messages,
  ) {
    if (supportState.isLoading && messages.isEmpty) {
      return const ShimmerLoading(itemCount: 5, itemHeight: 60);
    }

    if (supportState.error != null && messages.isEmpty) {
      return ErrorState(
        message: supportState.error!,
        onRetry: () => ref
            .read(supportProvider.notifier)
            .loadMessages(widget.ticketId),
      );
    }

    if (messages.isEmpty) {
      return const EmptyState(
        icon: Icons.chat_outlined,
        title: 'Xabarlar yo\'q',
        subtitle: 'Birinchi xabarni yuboring.',
      );
    }

    return ListView.builder(
      controller: _scrollController,
      reverse: true,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      itemCount: messages.length,
      itemBuilder: (context, index) {
        final message = messages[index];
        final isStaff = message.isStaff;
        final isOwn = !isStaff && _isOwnMessage(message);

        // Date separator
        final showDate = index == messages.length - 1 ||
            !_isSameDay(
              messages[index].createdAt,
              messages[index + 1].createdAt,
            );

        return Column(
          children: [
            if (showDate) _buildDateSeparator(message.createdAt),
            _TicketMessageBubble(
              message: message,
              isOwn: isOwn,
              isStaff: isStaff,
            ),
          ],
        );
      },
    );
  }

  Widget _buildDateSeparator(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    String label;
    if (diff.inDays == 0 && now.day == date.day) {
      label = 'Bugun';
    } else if (diff.inDays == 1 ||
        (diff.inDays == 0 && now.day != date.day)) {
      label = 'Kecha';
    } else {
      label = DateFormat('dd MMMM yyyy').format(date);
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: SilkTheme.border.withValues(alpha: 0.5),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: SilkTheme.muted2,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ),
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
        color: SilkTheme.surface,
        border: Border(
          top: BorderSide(
            color: SilkTheme.border.withValues(alpha: 0.5),
          ),
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
                hintText: 'Javob yozing...',
                hintStyle: const TextStyle(
                  color: SilkTheme.muted2,
                  fontSize: 15,
                ),
                filled: true,
                fillColor: SilkTheme.bg,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 10,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(SilkTheme.radiusCard),
                  borderSide: BorderSide.none,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(SilkTheme.radiusCard),
                  borderSide: BorderSide.none,
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(SilkTheme.radiusCard),
                  borderSide: BorderSide.none,
                ),
              ),
              onSubmitted: (_) => _sendMessage(),
            ),
          ),
          const SizedBox(width: 8),
          _isSending
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
              : IconButton(
                  onPressed: _sendMessage,
                  icon: const Icon(Icons.send_rounded),
                  color: SilkTheme.brand,
                  iconSize: 24,
                  style: IconButton.styleFrom(
                    backgroundColor:
                        SilkTheme.brand.withValues(alpha: 0.1),
                    shape: const CircleBorder(),
                    padding: const EdgeInsets.all(10),
                  ),
                ),
        ],
      ),
    );
  }

  Future<void> _sendMessage() async {
    final content = _messageController.text.trim();
    if (content.isEmpty || _isSending) return;

    setState(() => _isSending = true);

    final success = await ref
        .read(supportProvider.notifier)
        .sendMessage(widget.ticketId, content);

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

    if (mounted) setState(() => _isSending = false);
  }

  bool _isOwnMessage(SupportMessage message) {
    if (_currentUserId == null) return false;
    return message.senderId == _currentUserId;
  }

  bool _isSameDay(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'OPEN':
        return SilkTheme.brand;
      case 'IN_PROGRESS':
        return SilkTheme.accent2;
      case 'RESOLVED':
        return SilkTheme.success;
      case 'CLOSED':
        return SilkTheme.muted2;
      default:
        return SilkTheme.muted;
    }
  }

  String _getStatusLabel(String status) {
    switch (status) {
      case 'OPEN':
        return 'Ochiq';
      case 'IN_PROGRESS':
        return 'Jarayonda';
      case 'RESOLVED':
        return 'Hal qilindi';
      case 'CLOSED':
        return 'Yopildi';
      default:
        return status;
    }
  }
}

/// Message bubble for ticket detail.
class _TicketMessageBubble extends StatelessWidget {
  final SupportMessage message;
  final bool isOwn;
  final bool isStaff;

  const _TicketMessageBubble({
    required this.message,
    required this.isOwn,
    required this.isStaff,
  });

  @override
  Widget build(BuildContext context) {
    final timeStr = DateFormat('HH:mm').format(message.createdAt);
    final maxWidth = MediaQuery.of(context).size.width * 0.75;
    final isRight = isOwn && !isStaff;

    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        mainAxisAlignment:
            isRight ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isRight) const SizedBox(width: 4),
          ConstrainedBox(
            constraints: BoxConstraints(maxWidth: maxWidth),
            child: Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 14,
                vertical: 10,
              ),
              decoration: BoxDecoration(
                color: isRight
                    ? SilkTheme.brand
                    : isStaff
                        ? SilkTheme.brand.withValues(alpha: 0.08)
                        : SilkTheme.surface,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(16),
                  topRight: const Radius.circular(16),
                  bottomLeft: Radius.circular(isRight ? 16 : 4),
                  bottomRight: Radius.circular(isRight ? 4 : 16),
                ),
                border: isRight
                    ? null
                    : Border.all(
                        color: isStaff
                            ? SilkTheme.brand.withValues(alpha: 0.2)
                            : SilkTheme.border.withValues(alpha: 0.5),
                      ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 4,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: isRight
                    ? CrossAxisAlignment.end
                    : CrossAxisAlignment.start,
                children: [
                  // Sender label
                  if (isStaff)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.support_agent,
                            size: 14,
                            color: SilkTheme.brand,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            message.senderName ?? 'Admin',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: SilkTheme.brand,
                            ),
                          ),
                        ],
                      ),
                    ),

                  // Message content
                  Text(
                    message.content,
                    style: TextStyle(
                      fontSize: 15,
                      color: isRight ? Colors.white : SilkTheme.ink,
                      height: 1.35,
                    ),
                  ),

                  const SizedBox(height: 4),

                  // Time
                  Text(
                    timeStr,
                    style: TextStyle(
                      fontSize: 11,
                      color: isRight
                          ? Colors.white.withValues(alpha: 0.7)
                          : SilkTheme.muted2,
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (isRight) const SizedBox(width: 4),
        ],
      ),
    );
  }
}
