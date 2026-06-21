import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../config/silk_theme.dart';
import '../../widgets/custom_app_bar.dart';
import 'blocked_provider.dart';

class BlockedScreen extends ConsumerWidget {
  const BlockedScreen({super.key});

  static const _reasonLabels = {
    'DISPATCHER_NAME': 'Dispatcher',
    'FEMALE_NAME': 'Ayol ismi',
    'REPEATED_CHARS': 'Takror belgilar',
    'FOREIGN_DESTINATION': 'Xorijiy manzil',
    'MULTIPLE_MENTIONS': 'Ko\'p @mention',
    'LONG_MESSAGE': 'Spam/Uzun xabar',
    'EXCESSIVE_EMOJI': 'Ko\'p emoji',
    'EXCESSIVE_NEWLINES': 'Ko\'p bo\'sh qator',
    'USER_MULTI_GROUP': 'Ko\'p guruhda',
    'USER_SPAM_RATE': 'Spam tezlik',
    'PHONE_MULTI_GROUP': 'Telefon spam',
    'PHONE_SUPER_SPAM': 'Super spam',
    'MANUAL_BLOCK': 'Qo\'lda bloklangan',
  };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(blockedProvider);

    return Scaffold(
      appBar: const CustomAppBar(title: 'Bloklangan'),
      backgroundColor: SilkTheme.bg,
      body: Column(
        children: [
          // Stats header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            margin: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
              boxShadow: [SilkTheme.cardShadow],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStat('Jami', state.total, SilkTheme.danger),
                _buildStat(
                  'Faol',
                  state.items.where((b) => b.isActive).length,
                  SilkTheme.accent2,
                ),
              ],
            ),
          ),

          // List
          Expanded(
            child: state.isLoading
                ? const Center(child: CircularProgressIndicator())
                : state.items.isEmpty
                    ? const Center(
                        child: Text(
                          'Bloklangan foydalanuvchilar yo\'q',
                          style: TextStyle(color: SilkTheme.muted),
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: () => ref.read(blockedProvider.notifier).loadBlocked(),
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: state.items.length,
                          itemBuilder: (context, index) {
                            return _buildBlockedCard(context, ref, state.items[index]);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildStat(String label, int value, Color color) {
    return Column(
      children: [
        Text(
          '$value',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(color: SilkTheme.muted, fontSize: 12)),
      ],
    );
  }

  Widget _buildBlockedCard(BuildContext context, WidgetRef ref, BlockedUser user) {
    final dateStr = DateFormat('dd.MM HH:mm').format(user.createdAt);
    final reasonLabel = _reasonLabels[user.reason] ?? user.reason;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
        border: Border(
          left: BorderSide(
            color: user.isActive ? SilkTheme.danger : SilkTheme.muted,
            width: 3,
          ),
        ),
        boxShadow: [SilkTheme.cardShadow],
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Expanded(
                  child: Text(
                    user.senderName ?? user.senderUsername ?? user.senderTelegramId,
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: SilkTheme.danger.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    reasonLabel,
                    style: TextStyle(
                      color: SilkTheme.danger,
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),

            // Info
            if (user.phone != null)
              Text(user.phone!, style: const TextStyle(fontSize: 13, color: SilkTheme.muted)),
            if (user.groupTitle != null && user.groupTitle!.isNotEmpty)
              Text(
                user.groupTitle!,
                style: const TextStyle(fontSize: 12, color: SilkTheme.muted),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            if (user.messageText != null && user.messageText!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  user.messageText!,
                  style: const TextStyle(fontSize: 12, color: SilkTheme.muted),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),

            const SizedBox(height: 8),
            // Footer
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(dateStr, style: const TextStyle(fontSize: 11, color: SilkTheme.muted)),
                if (user.isActive)
                  SizedBox(
                    height: 28,
                    child: TextButton(
                      onPressed: () async {
                        final confirmed = await showDialog<bool>(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            title: const Text('Blokdan chiqarish'),
                            content: Text('${user.senderName ?? user.senderTelegramId}ni blokdan chiqarish?'),
                            actions: [
                              TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Yo\'q')),
                              TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Ha')),
                            ],
                          ),
                        );
                        if (confirmed == true) {
                          final success = await ref.read(blockedProvider.notifier).unblock(user.id);
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(success ? 'Blokdan chiqarildi' : 'Xatolik'),
                                backgroundColor: success ? SilkTheme.success : SilkTheme.danger,
                              ),
                            );
                          }
                        }
                      },
                      style: TextButton.styleFrom(
                        foregroundColor: SilkTheme.brand,
                        padding: const EdgeInsets.symmetric(horizontal: 8),
                      ),
                      child: const Text('Blokdan chiqarish', style: TextStyle(fontSize: 12)),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
