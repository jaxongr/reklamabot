import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../config/routes.dart';
import '../../config/silk_theme.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/session_card.dart';
import '../../widgets/loading_indicator.dart';
import 'sessions_provider.dart';

class SessionsScreen extends ConsumerWidget {
  const SessionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sessionsState = ref.watch(sessionsProvider);

    return Scaffold(
      appBar: CustomAppBar(
        title: 'Sessiyalar',
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: SilkTheme.muted),
            onPressed: () =>
                ref.read(sessionsProvider.notifier).loadSessions(),
          ),
        ],
      ),
      backgroundColor: SilkTheme.bg,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.go(AppRoutes.addSession),
        backgroundColor: SilkTheme.brand,
        foregroundColor: Colors.white,
        elevation: 2,
        icon: const Icon(Icons.add),
        label: const Text(
          'Sessiya qo\'shish',
          style: TextStyle(fontWeight: FontWeight.w600),
        ),
      ),
      body: RefreshIndicator(
        color: SilkTheme.brand,
        onRefresh: () => ref.read(sessionsProvider.notifier).loadSessions(),
        child: _buildBody(context, ref, sessionsState),
      ),
    );
  }

  Widget _buildBody(
    BuildContext context,
    WidgetRef ref,
    SessionsState state,
  ) {
    if (state.isLoading && state.sessions.isEmpty) {
      return const ShimmerLoading(itemCount: 4, itemHeight: 160);
    }

    if (state.error != null && state.sessions.isEmpty) {
      return ErrorState(
        message: state.error!,
        onRetry: () => ref.read(sessionsProvider.notifier).loadSessions(),
      );
    }

    if (state.sessions.isEmpty) {
      return EmptyState(
        icon: Icons.phone_android_outlined,
        title: 'Sessiya topilmadi',
        subtitle:
            'Telegram sessiya ulash uchun pastdagi tugmani bosing',
        action: ElevatedButton.icon(
          onPressed: () => context.go(AppRoutes.addSession),
          icon: const Icon(Icons.add, size: 18),
          label: const Text('Sessiya qo\'shish'),
        ),
      );
    }

    return ListView.builder(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
      itemCount: state.sessions.length + 1, // +1 for header
      itemBuilder: (context, index) {
        if (index == 0) {
          return _buildHeader(state);
        }

        final session = state.sessions[index - 1];
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: SessionCard(
            session: session,
            onTap: () {
              _showSessionDetails(context, ref, session);
            },
            onSync: session.isFrozen
                ? null
                : () {
                    ref
                        .read(sessionsProvider.notifier)
                        .syncSession(session.id);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Sinxronlash boshlandi...'),
                        duration: Duration(seconds: 2),
                      ),
                    );
                  },
            onFreeze: () {
              if (session.isFrozen) {
                ref.read(sessionsProvider.notifier).unfreezeSession(session.id);
              } else {
                ref.read(sessionsProvider.notifier).freezeSession(session.id);
              }
            },
            onDelete: () {
              _confirmDelete(context, ref, session.id, session.displayName);
            },
          ),
        );
      },
    );
  }

  Widget _buildHeader(SessionsState state) {
    final activeCount =
        state.sessions.where((s) => s.status.value == 'ACTIVE' && !s.isFrozen).length;
    final frozenCount = state.sessions.where((s) => s.isFrozen).length;
    final totalGroups =
        state.sessions.fold<int>(0, (sum, s) => sum + s.totalGroups);

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          _buildHeaderChip(
            '$activeCount faol',
            SilkTheme.success,
          ),
          const SizedBox(width: 8),
          if (frozenCount > 0) ...[
            _buildHeaderChip(
              '$frozenCount muzlatilgan',
              SilkTheme.brand2,
            ),
            const SizedBox(width: 8),
          ],
          _buildHeaderChip(
            '$totalGroups guruh',
            SilkTheme.brand,
          ),
          const Spacer(),
          Text(
            '${state.sessions.length} ta',
            style: const TextStyle(
              fontSize: 13,
              color: SilkTheme.muted2,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderChip(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: color,
        ),
      ),
    );
  }

  void _showSessionDetails(
    BuildContext context,
    WidgetRef ref,
    dynamic session,
  ) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.45,
        minChildSize: 0.3,
        maxChildSize: 0.7,
        expand: false,
        builder: (_, controller) => Padding(
          padding: const EdgeInsets.all(20),
          child: ListView(
            controller: controller,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: SilkTheme.border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                session.displayName,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: SilkTheme.ink,
                ),
              ),
              const SizedBox(height: 8),
              if (session.phone != null)
                _detailRow('Telefon', session.phone!),
              _detailRow('Holat', session.statusLabel),
              _detailRow('Jami guruhlar', '${session.totalGroups}'),
              _detailRow('Faol guruhlar', '${session.activeGroups}'),
              _detailRow('Premium', session.isPremium ? 'Ha' : 'Yo\'q'),
              if (session.isFrozen)
                _detailRow('Muzlatilgan', 'Ha (${session.freezeCount} marta)'),
              _detailRow(
                'Yaratilgan',
                _formatDate(session.createdAt),
              ),
              if (session.lastSyncAt != null)
                _detailRow(
                  'Oxirgi sinxron',
                  _formatDate(session.lastSyncAt!),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 14,
              color: SilkTheme.muted,
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: SilkTheme.ink,
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}.${date.month.toString().padLeft(2, '0')}.${date.year} ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
  }

  void _confirmDelete(
    BuildContext context,
    WidgetRef ref,
    String sessionId,
    String name,
  ) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Sessiyani o\'chirish'),
        content: Text('$name sessiyasini o\'chirmoqchimisiz?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Bekor qilish'),
          ),
          ElevatedButton(
            onPressed: () {
              ref.read(sessionsProvider.notifier).deleteSession(sessionId);
              Navigator.of(ctx).pop();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: SilkTheme.danger,
            ),
            child: const Text('O\'chirish'),
          ),
        ],
      ),
    );
  }
}
