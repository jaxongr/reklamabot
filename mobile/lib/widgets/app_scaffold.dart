import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../app_config.dart';
import '../config/silk_theme.dart';
import '../config/strings.dart';
import '../config/theme.dart';
import '../core/api/websocket_client.dart';
import '../core/providers/lang_provider.dart';
import '../features/auth/auth_provider.dart';
import '../features/chat/chat_provider.dart';
import 'app_drawer.dart';

/// Global scaffold key — allows opening drawer from any screen.
final scaffoldKeyProvider = Provider<GlobalKey<ScaffoldState>>(
  (ref) => GlobalKey<ScaffoldState>(),
);

/// Unified scaffold for both dispatcher and driver shells.
/// Provides side drawer, bottom navigation bar, and WebSocket init.
class AppScaffold extends ConsumerWidget {
  final StatefulNavigationShell navigationShell;

  const AppScaffold({
    super.key,
    required this.navigationShell,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Initialize WebSocket connection on first build.
    ref.read(wsClientProvider);

    // Load chat rooms once so unread badge updates from app start.
    ref.listen<int?>(authStateProvider.select((s) => s.user?.id.hashCode), (
      prev,
      next,
    ) {
      if (next != null && prev != next) {
        Future.microtask(() => ref.read(chatProvider.notifier).loadRooms());
      }
    });

    return Scaffold(
      key: ref.read(scaffoldKeyProvider),
      drawer: const AppDrawer(),
      body: navigationShell,
      bottomNavigationBar: _BottomNavBar(
        currentIndex: navigationShell.currentIndex,
        onTap: (index) {
          navigationShell.goBranch(
            index,
            initialLocation: index == navigationShell.currentIndex,
          );
        },
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Bottom navigation bar — role-aware, 5 tabs
// ─────────────────────────────────────────────────────────────────────────────

class _BottomNavBar extends ConsumerWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const _BottomNavBar({
    required this.currentIndex,
    required this.onTap,
  });

  static List<_NavItem> _dispatcherItems() => [
    _NavItem(icon: Icons.home_outlined, activeIcon: Icons.home, label: AppStrings.asosiy),
    _NavItem(icon: Icons.assignment_outlined, activeIcon: Icons.assignment, label: AppStrings.qabul),
    _NavItem(icon: Icons.map_outlined, activeIcon: Icons.map, label: AppStrings.harita),
    _NavItem(icon: Icons.chat_bubble_outline, activeIcon: Icons.chat_bubble, label: AppStrings.chat),
    _NavItem(icon: Icons.account_balance_wallet_outlined, activeIcon: Icons.account_balance_wallet, label: AppStrings.balans),
  ];

  static List<_NavItem> _driverItems() => [
    _NavItem(icon: Icons.home_outlined, activeIcon: Icons.home, label: AppStrings.asosiy),
    _NavItem(icon: Icons.assignment_outlined, activeIcon: Icons.assignment, label: AppStrings.qabul),
    _NavItem(icon: Icons.local_offer_outlined, activeIcon: Icons.local_offer, label: AppStrings.taklif),
    _NavItem(icon: Icons.chat_bubble_outline, activeIcon: Icons.chat_bubble, label: AppStrings.chat),
    _NavItem(icon: Icons.account_balance_wallet_outlined, activeIcon: Icons.account_balance_wallet, label: AppStrings.balans),
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Til o'zgarganda bottom nav ham rebuild bo'ladi
    ref.watch(langProvider);
    final user = ref.watch(authStateProvider).user;
    final isDriver = user?.role.value == 'DRIVER';
    final items = isDriver ? _driverItems() : _dispatcherItems();
    // Chat tab — chat indeksini topib, unread count ko'rsatish uchun
    final chatIdx = items.indexWhere((it) =>
        it.icon == Icons.chat_bubble_outline);
    final unread = ref.watch(totalUnreadProvider);

    // Dispatcher — Silk Road; Driver — original.
    final useSilk = isDispatcherApp;
    final bg = useSilk ? SilkTheme.bgOf(context) : AppTheme.cardBgOf(context);
    final borderColor = useSilk ? SilkTheme.borderOf(context) : AppTheme.cardBorderOf(context);
    final activeColor = useSilk ? SilkTheme.inkOf(context) : AppTheme.primary;
    final activeBrand = useSilk ? SilkTheme.brandOf(context) : AppTheme.primary;
    final inactive = useSilk ? SilkTheme.muted2Of(context) : const Color(0xFFAAAAAA);

    return Container(
      decoration: BoxDecoration(
        color: bg,
        border: Border(
          top: BorderSide(color: borderColor, width: 0.5),
        ),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 68,
          child: Row(
            children: List.generate(items.length, (index) {
              final item = items[index];
              final isSelected = currentIndex == index;

              final showBadge = index == chatIdx && unread > 0;

              return Expanded(
                child: GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () => onTap(index),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Stack(
                        clipBehavior: Clip.none,
                        children: [
                          Icon(
                            isSelected ? item.activeIcon : item.icon,
                            size: 22,
                            color: isSelected ? activeColor : inactive,
                          ),
                          if (showBadge)
                            Positioned(
                              top: -4,
                              right: -8,
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 5,
                                  vertical: 1,
                                ),
                                constraints: const BoxConstraints(
                                  minWidth: 16,
                                  minHeight: 16,
                                ),
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  color: useSilk
                                      ? SilkTheme.accentOf(context)
                                      : AppTheme.errorColor,
                                  borderRadius: BorderRadius.circular(999),
                                  border: Border.all(
                                    color: bg,
                                    width: 1.5,
                                  ),
                                ),
                                child: Text(
                                  unread > 99 ? '99+' : '$unread',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 9,
                                    fontWeight: FontWeight.w700,
                                    height: 1.0,
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        item.label,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight:
                              isSelected ? FontWeight.w600 : FontWeight.w500,
                          color: isSelected ? activeBrand : inactive,
                        ),
                      ),
                      if (useSilk) ...[
                        const SizedBox(height: 4),
                        Container(
                          height: 2,
                          width: 18,
                          decoration: BoxDecoration(
                            color: isSelected ? activeBrand : Colors.transparent,
                            borderRadius: BorderRadius.circular(999),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;

  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
  });
}
