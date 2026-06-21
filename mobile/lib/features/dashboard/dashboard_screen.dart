import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../config/api_config.dart';
import '../../config/routes.dart';
import '../../config/silk_theme.dart';
import '../../core/api/api_client.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/stat_card.dart';
import '../../widgets/loading_indicator.dart';
import '../auth/auth_provider.dart';

/// Dashboard stats state.
class DashboardStats {
  final int activeSessions;
  final int totalGroups;
  final int messagesSentToday;
  final int activePostings;
  final int totalAds;
  final int activeAds;
  final int totalOrders;
  final int newOrders;
  final List<Map<String, dynamic>> recentActivity;

  const DashboardStats({
    this.activeSessions = 0,
    this.totalGroups = 0,
    this.messagesSentToday = 0,
    this.activePostings = 0,
    this.totalAds = 0,
    this.activeAds = 0,
    this.totalOrders = 0,
    this.newOrders = 0,
    this.recentActivity = const [],
  });
}

/// Dashboard data state.
class DashboardState {
  final DashboardStats? stats;
  final bool isLoading;
  final String? error;

  const DashboardState({this.stats, this.isLoading = false, this.error});

  DashboardState copyWith({
    DashboardStats? stats,
    bool? isLoading,
    String? error,
  }) {
    return DashboardState(
      stats: stats ?? this.stats,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Dashboard notifier to fetch stats from the backend.
class DashboardNotifier extends StateNotifier<DashboardState> {
  final ApiClient _api;

  DashboardNotifier(this._api) : super(const DashboardState()) {
    loadStats();
  }

  Future<void> loadStats() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      // Fetch all stats in parallel for speed
      final adStatsFuture = _api.get(ApiConfig.adsDashboardStats);
      final sessionsFuture = _api.get(ApiConfig.sessions);
      final postStatsFuture = _api.get(ApiConfig.postStatistics).then<Map<String, dynamic>?>(
        (r) => r.data as Map<String, dynamic>?,
      ).catchError((_) => <String, dynamic>{});
      final orderStatsFuture = _api.get(ApiConfig.orderStats).then<Map<String, dynamic>?>(
        (r) => r.data as Map<String, dynamic>?,
      ).catchError((_) => <String, dynamic>{});

      final adStatsRes = await adStatsFuture;
      final sessionsRes = await sessionsFuture;
      final postStats = await postStatsFuture ?? {};
      final orderStats = await orderStatsFuture ?? {};

      final adStats = adStatsRes.data as Map<String, dynamic>? ?? {};

      final sessionsList = sessionsRes.data is List
          ? sessionsRes.data as List
          : (sessionsRes.data as Map<String, dynamic>?)?['data'] as List? ?? [];

      int activeSessions = 0;
      int totalGroups = 0;
      for (final s in sessionsList) {
        final session = s as Map<String, dynamic>;
        if (session['status'] == 'ACTIVE' && session['isFrozen'] != true) {
          activeSessions++;
        }
        totalGroups += (session['totalGroups'] as int? ?? 0);
      }

      int messagesSentToday = 0;
      int activePostings = 0;
      messagesSentToday = postStats['sentToday'] as int? ??
          postStats['successfulPosts'] as int? ??
          0;
      activePostings = postStats['activePostings'] as int? ??
          postStats['inProgress'] as int? ??
          0;

      int totalOrders = 0;
      int newOrders = 0;
      totalOrders = orderStats['total'] as int? ?? 0;
      newOrders = orderStats['new'] as int? ?? orderStats['newOrders'] as int? ?? 0;

      state = DashboardState(
        stats: DashboardStats(
          activeSessions: activeSessions,
          totalGroups: totalGroups,
          messagesSentToday: messagesSentToday,
          activePostings: activePostings,
          totalAds: adStats['totalAds'] as int? ?? 0,
          activeAds: adStats['activeAds'] as int? ?? 0,
          totalOrders: totalOrders,
          newOrders: newOrders,
        ),
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Ma\'lumotlarni yuklashda xatolik: ${e.toString()}',
      );
    }
  }
}

final dashboardProvider =
    StateNotifierProvider<DashboardNotifier, DashboardState>((ref) {
  final api = ref.read(apiClientProvider);
  return DashboardNotifier(api);
});

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashState = ref.watch(dashboardProvider);
    final authState = ref.watch(authStateProvider);
    final dateFormat = DateFormat('dd MMMM, yyyy');

    return Scaffold(
      appBar: CustomAppBar(
        title: 'Boshqaruv paneli',
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: SilkTheme.muted),
            onPressed: () =>
                ref.read(dashboardProvider.notifier).loadStats(),
          ),
        ],
      ),
      backgroundColor: SilkTheme.bg,
      body: RefreshIndicator(
        color: SilkTheme.brand,
        onRefresh: () => ref.read(dashboardProvider.notifier).loadStats(),
        child: dashState.isLoading && dashState.stats == null
            ? _buildLoadingState()
            : dashState.error != null && dashState.stats == null
                ? _buildErrorState(dashState.error!, ref)
                : _buildContent(context, dashState, authState, dateFormat),
      ),
    );
  }

  Widget _buildLoadingState() {
    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 8),
          const ShimmerStatCards(count: 4),
          const SizedBox(height: 24),
          ShimmerLoading(itemCount: 3, itemHeight: 72, padding: EdgeInsets.zero),
        ],
      ),
    );
  }

  Widget _buildErrorState(String error, WidgetRef ref) {
    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      child: SizedBox(
        height: 400,
        child: ErrorState(
          message: error,
          onRetry: () => ref.read(dashboardProvider.notifier).loadStats(),
        ),
      ),
    );
  }

  Widget _buildContent(
    BuildContext context,
    DashboardState dashState,
    AuthState authState,
    DateFormat dateFormat,
  ) {
    final stats = dashState.stats ?? const DashboardStats();

    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Greeting
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [SilkTheme.brand, SilkTheme.brand2],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(SilkTheme.radiusLarge),
              boxShadow: [
                BoxShadow(
                  color: SilkTheme.brand.withValues(alpha: 0.3),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Salom, ${authState.user?.displayName ?? 'Foydalanuvchi'}!',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  dateFormat.format(DateTime.now()),
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.white.withValues(alpha: 0.8),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    _buildGreetingStat(
                      '${stats.newOrders}',
                      'Yangi buyurtmalar',
                    ),
                    const SizedBox(width: 24),
                    _buildGreetingStat(
                      '${stats.activeSessions}',
                      'Faol sessiyalar',
                    ),
                    const SizedBox(width: 24),
                    _buildGreetingStat(
                      _formatNumber(stats.totalGroups),
                      'Guruhlar',
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Stats grid
          const Text(
            'Umumiy ko\'rsatkichlar',
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w600,
              color: SilkTheme.ink,
            ),
          ),
          const SizedBox(height: 12),

          GridView.count(
            crossAxisCount: 2,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 1.35,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            children: [
              StatCard(
                icon: Icons.phone_android,
                value: '${stats.activeSessions}',
                label: 'Faol sessiyalar',
                iconColor: SilkTheme.success,
              ),
              StatCard(
                icon: Icons.group,
                value: _formatNumber(stats.totalGroups),
                label: 'Jami guruhlar',
                iconColor: SilkTheme.brand,
              ),
              StatCard(
                icon: Icons.list_alt,
                value: _formatNumber(stats.totalOrders),
                label: 'Jami buyurtmalar',
                iconColor: SilkTheme.brand,
              ),
              StatCard(
                icon: Icons.fiber_new,
                value: '${stats.newOrders}',
                label: 'Yangi buyurtmalar',
                iconColor: SilkTheme.accent2,
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Quick actions
          const Text(
            'Tezkor amallar',
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w600,
              color: SilkTheme.ink,
            ),
          ),
          const SizedBox(height: 12),

          _buildQuickAction(
            context,
            icon: Icons.add_circle_outline,
            title: 'Yangi sessiya ulash',
            subtitle: 'Telefon raqam orqali Telegram sessiya qo\'shish',
            color: SilkTheme.success,
            onTap: () {
              context.go(AppRoutes.addSession);
            },
          ),
          const SizedBox(height: 10),
          _buildQuickAction(
            context,
            icon: Icons.play_circle_outline,
            title: 'Tarqatishni boshlash',
            subtitle: 'E\'lonni guruhlarga yuborishni boshlash',
            color: SilkTheme.brand,
            onTap: () {
              context.go(AppRoutes.posting);
            },
          ),
          const SizedBox(height: 10),
          _buildQuickAction(
            context,
            icon: Icons.list_alt,
            title: 'Buyurtmalar',
            subtitle: 'Kuzatuv sessionlaridan topilgan buyurtmalar',
            color: SilkTheme.brand,
            onTap: () {
              context.go(AppRoutes.orders);
            },
          ),

          const SizedBox(height: 24),

          // System status
          const Text(
            'Tizim holati',
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w600,
              color: SilkTheme.ink,
            ),
          ),
          const SizedBox(height: 12),

          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: SilkTheme.surface,
              borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
              border: Border.all(
                color: SilkTheme.border.withValues(alpha: 0.5),
              ),
            ),
            child: Column(
              children: [
                _buildStatusRow(
                  'Server ulanish',
                  'Ulangan',
                  SilkTheme.success,
                ),
                const Divider(height: 20, color: SilkTheme.border),
                _buildStatusRow(
                  'Faol sessiyalar',
                  '${stats.activeSessions} ta',
                  stats.activeSessions > 0
                      ? SilkTheme.success
                      : SilkTheme.accent2,
                ),
                const Divider(height: 20, color: SilkTheme.border),
                _buildStatusRow(
                  'Tarqatish holati',
                  stats.activePostings > 0
                      ? '${stats.activePostings} ta ishlayapti'
                      : 'Faol emas',
                  stats.activePostings > 0
                      ? SilkTheme.success
                      : SilkTheme.muted2,
                ),
                const Divider(height: 20, color: SilkTheme.border),
                _buildStatusRow(
                  'Jami e\'lonlar',
                  '${stats.totalAds} ta',
                  SilkTheme.brand,
                ),
              ],
            ),
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildGreetingStat(String value, String label) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          value,
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.white.withValues(alpha: 0.8),
          ),
        ),
      ],
    );
  }

  Widget _buildQuickAction(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: SilkTheme.surface,
          borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
          border: Border.all(
            color: SilkTheme.border.withValues(alpha: 0.5),
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(SilkTheme.radiusSmall),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: SilkTheme.ink,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 12,
                      color: SilkTheme.muted,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.chevron_right,
              color: SilkTheme.muted2,
              size: 22,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusRow(String label, String value, Color color) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            color: SilkTheme.muted,
          ),
        ),
        Row(
          children: [
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: color,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 6),
            Text(
              value,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: color,
              ),
            ),
          ],
        ),
      ],
    );
  }

  String _formatNumber(int number) {
    if (number >= 1000000) {
      return '${(number / 1000000).toStringAsFixed(1)}M';
    }
    if (number >= 1000) {
      return '${(number / 1000).toStringAsFixed(1)}K';
    }
    return number.toString();
  }
}
