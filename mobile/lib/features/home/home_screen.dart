import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../config/silk_theme.dart';
import '../../widgets/app_scaffold.dart';
import '../../widgets/silk/hero_card.dart';
import '../../widgets/silk/silk_order_card.dart';
import '../../widgets/silk/silk_section_head.dart';
import '../../widgets/silk/silk_tabs.dart';
import '../../widgets/silk/linya_badge.dart';
import '../auth/auth_provider.dart';
import '../balance/balance_provider.dart';
import '../notifications/notifications_provider.dart';
import '../orders/orders_provider.dart';
import '../orders/accepted_orders_provider.dart';
import '../../config/strings.dart';
import '../../core/models/order.dart';
import '../../core/providers/lang_provider.dart';
import '../../core/services/location_service.dart';
import 'widgets/city_autocomplete_field.dart';
import '../dispatcher/profile_completion_screen.dart';
import '../../core/services/auth_service.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen>
    with TickerProviderStateMixin {
  bool _filterOpen = false;
  String _activeFilter = 'barchasi';

  // TextField controllers (qo'lda yozish)
  final _fromController = TextEditingController();
  final _toController = TextEditingController();
  Timer? _fromDebounce;
  Timer? _toDebounce;

  // Dropdown values
  String? _vehicleTypeFilter;
  String? _weightFilter;

  late AnimationController _animController;

  // ── Filter pill label ↔ internal key mapping ──
  static const Map<String, String> _filterKeyToLabel = {
    'barchasi': 'Barchasi',
    'yuklar': 'Yuklar',
    'haydovchilar': 'Haydovchilar',
    'import': 'Import',
    'eksport': 'Eksport',
  };

  static const Map<String, String> _filterLabelToKey = {
    'Barchasi': 'barchasi',
    'Yuklar': 'yuklar',
    'Haydovchilar': 'haydovchilar',
    'Import': 'import',
    'Eksport': 'eksport',
  };

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );

    Future.microtask(() async {
      ref.read(ordersProvider.notifier).loadOrders();
      _animController.forward();
      // Dispetcher GPS background tracking — avtomatik (linya yoqiq bo'lsa yuboradi)
      try {
        await ref.read(locationServiceProvider).startTracking();
      } catch (_) {}
    });
  }

  @override
  void dispose() {
    _animController.dispose();
    _fromController.dispose();
    _toController.dispose();
    _fromDebounce?.cancel();
    _toDebounce?.cancel();
    super.dispose();
  }

  bool get _isDriver {
    final user = ref.read(authStateProvider).user;
    return user?.role.value == 'DRIVER';
  }

  String get _roleName => _isDriver ? AppStrings.haydovchi : AppStrings.dispetcher;

  void _onFilterPill(String filter) {
    setState(() => _activeFilter = filter);
    final notifier = ref.read(ordersProvider.notifier);
    switch (filter) {
      case 'barchasi':
        notifier.setTypeFilter(null);
        notifier.setScopeFilter(null);
        break;
      case 'yuklar':
        notifier.setScopeFilter(null);
        notifier.setTypeFilter(OrderType.cargo);
        break;
      case 'haydovchilar':
        notifier.setScopeFilter(null);
        notifier.setTypeFilter(OrderType.driver);
        break;
      case 'import':
        notifier.setTypeFilter(null);
        notifier.setScopeFilter(OrderScope.import_);
        break;
      case 'eksport':
        notifier.setTypeFilter(null);
        notifier.setScopeFilter(OrderScope.export_);
        break;
    }
  }

  Future<void> _onRefresh() async {
    await ref.read(ordersProvider.notifier).loadOrders();
    // Accept dan keyin accepted tab ham yangilansin
    ref.read(acceptedOrdersProvider.notifier).refresh();
    _animController.reset();
    _animController.forward();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    ref.watch(langProvider);
    final ordersState = ref.watch(ordersProvider);

    // Dispetcher profil to'ldirishi kerakmi?
    // FAQAT firstName tekshiriladi — phoneNumber ixtiyoriy (Telegram'da yo'q bo'lishi mumkin)
    final user = authState.user;
    if (user != null && !_isDriver &&
        (user.firstName == null || user.firstName!.isEmpty)) {
      return ProfileCompletionScreen(
        onComplete: () async {
          // Auth profilni serverdan qayta yuklash
          try {
            final authService = ref.read(authServiceProvider);
            final updatedUser = await authService.getProfile();
            ref.read(authStateProvider.notifier).refreshUser(updatedUser);
          } catch (_) {
            // getProfile xato bersa ham — force refresh qilish
            // Sahifani qayta yuklash uchun authState'ni invalidate qilish
            ref.invalidate(authStateProvider);
          }
          if (mounted) setState(() {});
          try { ref.read(ordersProvider.notifier).loadOrders(); } catch (_) {}
        },
      );
    }

    return Scaffold(
      backgroundColor: SilkTheme.bgOf(context),
      appBar: _buildAppBar(),
      body: RefreshIndicator(
        color: SilkTheme.brandOf(context),
        onRefresh: _onRefresh,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(
            parent: BouncingScrollPhysics(),
          ),
          padding: EdgeInsets.zero,
          children: [
            // 1. Hero balance card
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 4, 20, 0),
              child: _HeroBalanceCard(isDriver: _isDriver),
            ),

            // 2. Section header
            SilkSectionHead(
              title: AppStrings.buyurtmalar,
              sub: _subCountText(ordersState),
              filterIcon: Icons.tune,
              onFilterTap: () => setState(() => _filterOpen = !_filterOpen),
            ),
            const SizedBox(height: 14),

            // 3. Filter pill tabs
            SilkPillTabs(
              tabs: const ['Barchasi', 'Yuklar', 'Haydovchilar', 'Import', 'Eksport'],
              value: _filterKeyToLabel[_activeFilter] ?? 'Barchasi',
              onChanged: (label) {
                final key = _filterLabelToKey[label];
                if (key != null) _onFilterPill(key);
              },
            ),
            const SizedBox(height: 14),

            // 4. Expanded Filter Panel
            if (_filterOpen) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: _buildExpandedFilterPanel(),
              ),
              const SizedBox(height: 14),
            ],

            // 5. Order Cards / States
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
              child: _buildOrdersList(ordersState),
            ),
          ],
        ),
      ),
    );
  }

  String _subCountText(OrdersState ordersState) {
    final count = ordersState.filteredOrders.length;
    return "$count ta faol e'lon";
  }

  PreferredSizeWidget _buildAppBar() {
    final unreadCount = ref.watch(unreadNotificationCountProvider);
    final ink = SilkTheme.inkOf(context);
    final danger = SilkTheme.dangerOf(context);
    final surface = SilkTheme.surfaceOf(context);
    final bg = SilkTheme.bgOf(context);

    return AppBar(
      backgroundColor: bg,
      elevation: 0,
      surfaceTintColor: Colors.transparent,
      scrolledUnderElevation: 0,
      leading: IconButton(
        icon: Icon(Icons.menu_rounded, color: ink, size: 24),
        onPressed: () {
          ref.read(scaffoldKeyProvider).currentState?.openDrawer();
        },
      ),
      title: Text(
        "YO'LDA",
        style: SilkTheme.display(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: ink,
          letterSpacing: 1.5,
        ),
      ),
      actions: [
        // LINYA toggle
        _buildLineToggle(),
        const SizedBox(width: 6),
        // Notification bell
        Padding(
          padding: const EdgeInsets.only(right: 8),
          child: Stack(
            children: [
              Material(
                color: surface,
                borderRadius: BorderRadius.circular(SilkTheme.radiusBtn),
                child: InkWell(
                  borderRadius: BorderRadius.circular(SilkTheme.radiusBtn),
                  onTap: () => context.push('/notifications'),
                  child: Container(
                    width: 42,
                    height: 42,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: SilkTheme.borderOf(context),
                        width: 1,
                      ),
                      borderRadius:
                          BorderRadius.circular(SilkTheme.radiusBtn),
                    ),
                    child: Icon(
                      Icons.notifications_outlined,
                      color: ink,
                      size: 20,
                    ),
                  ),
                ),
              ),
              if (unreadCount > 0)
                Positioned(
                  right: 4,
                  top: 4,
                  child: Container(
                    padding: const EdgeInsets.all(2),
                    constraints:
                        const BoxConstraints(minWidth: 18, minHeight: 18),
                    decoration: BoxDecoration(
                      color: danger,
                      shape: BoxShape.circle,
                      border: Border.all(color: bg, width: 1.5),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      unreadCount > 99 ? '99+' : unreadCount.toString(),
                      style: SilkTheme.body(
                        fontSize: 9,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildLineToggle() {
    final user = ref.watch(authStateProvider).user;
    final isLineActive = user?.isLineActive ?? true;

    return LinyaBadge(
      active: isLineActive,
      onTap: () async {
        final newStatus = !isLineActive;
        await ref.read(authStateProvider.notifier).setLineStatus(newStatus);
        // Background GPS task'ga linya holatini xabardor qilish
        try {
          await ref.read(locationServiceProvider).updateLineStatus(newStatus);
        } catch (_) {}
        if (newStatus) {
          // Linya yoqildi — e'lonlarni qayta yuklash
          ref.read(ordersProvider.notifier).loadOrders();
        } else {
          // Linya o'chirildi — orderlar ro'yxatini tozalash
          ref.read(ordersProvider.notifier).clearOrders();
        }
      },
    );
  }

  Widget _buildExpandedFilterPanel() {
    final notifier = ref.read(ordersProvider.notifier);
    final surface = SilkTheme.surfaceOf(context);
    final border = SilkTheme.borderOf(context);
    final muted = SilkTheme.mutedOf(context);

    return AnimatedSize(
      duration: const Duration(milliseconds: 250),
      curve: Curves.easeInOut,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: surface,
          border: Border.all(color: border, width: 1),
          borderRadius: BorderRadius.circular(SilkTheme.radiusCard),
        ),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: CityAutocompleteField(
                    label: AppStrings.qayerdan,
                    hint: AppStrings.shaharNomi,
                    controller: _fromController,
                    onChanged: (v) {
                      _fromDebounce?.cancel();
                      _fromDebounce = Timer(const Duration(milliseconds: 500), () {
                        notifier.setCargoFrom(v.isEmpty ? null : v);
                      });
                    },
                    onCitySelected: (city) {
                      _fromDebounce?.cancel();
                      notifier.setCargoFrom(city);
                    },
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: CityAutocompleteField(
                    label: AppStrings.qayerga,
                    hint: AppStrings.shaharNomi,
                    controller: _toController,
                    onChanged: (v) {
                      _toDebounce?.cancel();
                      _toDebounce = Timer(const Duration(milliseconds: 500), () {
                        notifier.setCargoTo(v.isEmpty ? null : v);
                      });
                    },
                    onCitySelected: (city) {
                      _toDebounce?.cancel();
                      notifier.setCargoTo(city);
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildDropdown(
                    label: AppStrings.mashinaTuri,
                    hint: AppStrings.barchasi,
                    value: _vehicleTypeFilter,
                    items: const ['Tentli', 'Refrijerator', 'Bortli', 'Konteyner', 'Fura', 'Kamaz', 'MAN', 'Volvo', 'Scania', 'DAF', 'HOWO', 'Isuzu', 'Gazel', 'Porter', 'Labo', 'Damas', 'Samosval'],
                    onChanged: (v) {
                      setState(() => _vehicleTypeFilter = v);
                      notifier.setVehicleTypeFilter(v);
                    },
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildDropdown(
                    label: AppStrings.ogirlik,
                    hint: AppStrings.barchasi,
                    value: _weightFilter,
                    items: const ['5-15t', '15-25t', '25t+'],
                    onChanged: (v) => setState(() => _weightFilter = v),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            // Tozalash tugmasi
            SizedBox(
              width: double.infinity,
              child: TextButton.icon(
                onPressed: () {
                  _fromController.clear();
                  _toController.clear();
                  _fromDebounce?.cancel();
                  _toDebounce?.cancel();
                  setState(() {
                    _vehicleTypeFilter = null;
                    _weightFilter = null;
                  });
                  notifier.setCargoFrom(null);
                  notifier.setCargoTo(null);
                  notifier.setVehicleTypeFilter(null);
                },
                icon: const Icon(Icons.clear_all, size: 18),
                label: Text(AppStrings.filtrlarniTozalash),
                style: TextButton.styleFrom(
                  foregroundColor: muted,
                  textStyle: SilkTheme.body(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDropdown({
    required String label,
    required String hint,
    required String? value,
    required List<String> items,
    required ValueChanged<String?> onChanged,
  }) {
    final bg = SilkTheme.bgOf(context);
    final border = SilkTheme.borderOf(context);
    final ink = SilkTheme.inkOf(context);
    final muted = SilkTheme.mutedOf(context);
    final muted2 = SilkTheme.muted2Of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: SilkTheme.body(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: muted,
          ),
        ),
        const SizedBox(height: 4),
        Container(
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(SilkTheme.radiusBtn),
            border: Border.all(color: border),
          ),
          child: DropdownButtonFormField<String>(
            value: value,
            isExpanded: true,
            decoration: const InputDecoration(
              border: InputBorder.none,
              enabledBorder: InputBorder.none,
              focusedBorder: InputBorder.none,
              contentPadding:
                  EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              isDense: true,
            ),
            hint: Text(
              hint,
              style: SilkTheme.body(fontSize: 12, color: muted2),
            ),
            style: SilkTheme.body(fontSize: 12, color: ink),
            dropdownColor: SilkTheme.surfaceOf(context),
            icon: Icon(Icons.keyboard_arrow_down, size: 18, color: muted),
            items: items.map((e) {
              return DropdownMenuItem(value: e, child: Text(e));
            }).toList(),
            onChanged: onChanged,
          ),
        ),
      ],
    );
  }

  Widget _buildOrdersList(OrdersState ordersState) {
    // Linya o'chiq — maxsus holat ko'rsatish
    final user = ref.watch(authStateProvider).user;
    if (user != null && !user.isLineActive) {
      return _buildLineOffState();
    }

    // Faqat birinchi yuklashda loading ko'rsatish
    if (ordersState.isLoading && ordersState.orders.isEmpty) {
      return _buildLoadingState();
    }

    // Xatolik faqat e'lonlar umuman bo'lmaganda ko'rsatiladi
    if (ordersState.error != null && ordersState.orders.isEmpty) {
      return _buildErrorState(ordersState.error!);
    }

    List<Order> displayOrders = ordersState.filteredOrders;

    // Client-side filter: Import/Eksport
    if (_activeFilter == 'import_eksport') {
      displayOrders = displayOrders
          .where((o) =>
              o.scope == OrderScope.import_ || o.scope == OrderScope.export_)
          .toList();
    }

    // Client-side filter: og'irlik
    if (_weightFilter != null) {
      displayOrders = displayOrders.where((o) {
        if (o.cargoWeight == null) return false;
        final w = o.cargoWeight!.toLowerCase();
        // Raqamni ajratib olish
        final nums = RegExp(r'(\d+)').allMatches(w);
        if (nums.isEmpty) return false;
        final firstNum = int.tryParse(nums.first.group(1)!) ?? 0;
        switch (_weightFilter) {
          case '5-15t':
            return firstNum >= 5 && firstNum <= 15;
          case '15-25t':
            return firstNum > 15 && firstNum <= 25;
          case '25t+':
            return firstNum > 25;
          default:
            return true;
        }
      }).toList();
    }

    if (displayOrders.isEmpty && !ordersState.isLoading) {
      return _buildEmptyState();
    }

    return Column(
      children: List.generate(displayOrders.length, (index) {
        final order = displayOrders[index];
        return TweenAnimationBuilder<double>(
          key: ValueKey(order.id),
          tween: Tween(begin: 0.0, end: 1.0),
          duration: Duration(milliseconds: 400 + (index * 80).clamp(0, 400)),
          curve: Curves.easeOutCubic,
          builder: (context, value, child) {
            return Transform.translate(
              offset: Offset(0, 20 * (1 - value)),
              child: Opacity(opacity: value, child: child),
            );
          },
          child: Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: _buildSilkCard(order),
          ),
        );
      }),
    );
  }

  Widget _buildSilkCard(Order order) {
    final acceptedState = ref.watch(acceptedOrdersProvider);
    final activeCount = acceptedState.activeCount;

    final name = order.senderName ?? AppStrings.nomalum;
    final initial = name.isNotEmpty ? name[0].toUpperCase() : '?';

    final vehicle = order.vehicleType ?? '—';
    final time = _formatTime(order.messageDate ?? order.createdAt);
    final weight = order.cargoWeight ?? '—';
    final distance = order.distance != null ? '${order.distance} km' : '—';

    String scopeLabel;
    switch (order.scope) {
      case OrderScope.import_:
        scopeLabel = 'IMPORT';
        break;
      case OrderScope.export_:
        scopeLabel = 'EKSPORT';
        break;
      case OrderScope.internal:
        scopeLabel = 'ICHKI';
        break;
    }

    return SilkOrderCard(
      initial: initial,
      name: name,
      vehicle: vehicle,
      fromCity: order.cargoFrom ?? '—',
      toCity: order.cargoTo ?? '—',
      time: time,
      weight: weight,
      distance: distance,
      scope: scopeLabel,
      deal: order.price ?? AppStrings.kelishiladi,
      accepted: activeCount,
      total: 10,
      rating: 4.8,
      isDriver: order.type == OrderType.driver,
      onTap: () => _showOrderDetail(context, order),
      onAccept: order.status == OrderStatus.newOrder
          ? () => _handleAccept(order.id)
          : null,
    );
  }

  String _formatTime(DateTime date) {
    return DateFormat('dd MMM, HH:mm').format(date);
  }

  Future<void> _handleAccept(String orderId) async {
    final error =
        await ref.read(ordersProvider.notifier).acceptOrder(orderId);
    if (!mounted) return;
    final success = error == null;
    if (success) {
      // Accepted tab ni yangilash
      ref.read(acceptedOrdersProvider.notifier).refresh();
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          success ? AppStrings.buyurtmaQabulQilindi : error!,
        ),
        backgroundColor: success
            ? SilkTheme.successOf(context)
            : SilkTheme.dangerOf(context),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(SilkTheme.radiusBtn),
        ),
      ),
    );
  }

  void _showOrderDetail(BuildContext context, Order order) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: SilkTheme.surfaceOf(context),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(SilkTheme.radiusHero),
        ),
      ),
      builder: (ctx) => _OrderDetailSheet(order: order),
    );
  }

  Widget _buildLoadingState() {
    return SizedBox(
      height: 300,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: 36,
              height: 36,
              child: CircularProgressIndicator(
                strokeWidth: 3,
                valueColor:
                    AlwaysStoppedAnimation<Color>(SilkTheme.brandOf(context)),
              ),
            ),
            const SizedBox(height: 14),
            Text(
              AppStrings.yuklanmoqda,
              style: SilkTheme.body(
                fontSize: 14,
                color: SilkTheme.mutedOf(context),
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState(String error) {
    final danger = SilkTheme.dangerOf(context);
    return SizedBox(
      height: 300,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: danger.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(
                Icons.error_outline_rounded,
                color: danger,
                size: 28,
              ),
            ),
            const SizedBox(height: 14),
            Text(
              error,
              style: SilkTheme.body(
                fontSize: 14,
                color: SilkTheme.inkOf(context),
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 14),
            TextButton.icon(
              onPressed: _onRefresh,
              icon: const Icon(Icons.refresh_rounded, size: 18),
              label: Text(AppStrings.qaytaYuklash),
              style: TextButton.styleFrom(
                foregroundColor: SilkTheme.brandOf(context),
                textStyle: SilkTheme.body(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLineOffState() {
    final danger = SilkTheme.dangerOf(context);
    final ink = SilkTheme.inkOf(context);
    final muted = SilkTheme.mutedOf(context);
    final bg = SilkTheme.bgOf(context);
    return SizedBox(
      height: 300,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: danger.withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Icon(
                Icons.pause_circle_outline_rounded,
                color: danger,
                size: 36,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              AppStrings.linyaOchirilgan,
              style: SilkTheme.display(
                fontSize: 17,
                color: ink,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              AppStrings.yangiElonlarKelmaydi,
              textAlign: TextAlign.center,
              style: SilkTheme.body(
                fontSize: 13,
                color: muted,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 20),
            Material(
              color: ink,
              borderRadius: BorderRadius.circular(999),
              child: InkWell(
                borderRadius: BorderRadius.circular(999),
                onTap: () async {
                  await ref
                      .read(authStateProvider.notifier)
                      .setLineStatus(true);
                  ref.read(ordersProvider.notifier).loadOrders();
                },
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 22, vertical: 12),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.play_arrow_rounded, size: 18, color: bg),
                      const SizedBox(width: 8),
                      Text(
                        AppStrings.linyaniYoqish,
                        style: SilkTheme.body(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: bg,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    final surface = SilkTheme.surfaceOf(context);
    final border = SilkTheme.borderOf(context);
    final muted = SilkTheme.mutedOf(context);
    final ink = SilkTheme.inkOf(context);
    return SizedBox(
      height: 300,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: surface,
                border: Border.all(color: border, width: 1),
                borderRadius: BorderRadius.circular(18),
              ),
              child: Icon(
                Icons.inbox_outlined,
                color: muted,
                size: 32,
              ),
            ),
            const SizedBox(height: 14),
            Text(
              AppStrings.buyurtmalarTopilmadi,
              style: SilkTheme.display(
                fontSize: 15,
                color: ink,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              AppStrings.hozirchaBuyurtmalarYoq,
              style: SilkTheme.body(
                fontSize: 13,
                color: muted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Hero balance card with quick actions ──
class _HeroBalanceCard extends ConsumerWidget {
  final bool isDriver;
  const _HeroBalanceCard({required this.isDriver});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final balanceState = ref.watch(balanceProvider);
    final balance = balanceState.balance.toInt();

    return HeroCard(
      label: AppStrings.hamyonBalansi,
      balance: balance,
      onRefill: () => context.push('/balance'),
      trendText: 'oxirgi 7 kun',
      trendChip: '+12.4%',
      quickActions: isDriver
          ? []
          : [
              QuickAction(
                icon: Icons.add_circle_outline,
                label: "Yangi e'lon",
                onTap: () => context.push('/dispatcher/create-ad'),
              ),
              QuickAction(
                icon: Icons.bar_chart,
                label: 'Statistika',
                onTap: () => context.push('/dispatcher/stats'),
              ),
              QuickAction(
                icon: Icons.people_outline,
                label: 'Haydovchilar',
                onTap: () => context.push('/dispatcher/driver-offers'),
              ),
            ],
    );
  }
}

// ── Order Detail Bottom Sheet ──
class _OrderDetailSheet extends ConsumerStatefulWidget {
  final Order order;

  const _OrderDetailSheet({required this.order});

  @override
  ConsumerState<_OrderDetailSheet> createState() => _OrderDetailSheetState();
}

class _OrderDetailSheetState extends ConsumerState<_OrderDetailSheet> {
  bool _accepted = false;
  bool _accepting = false;

  Future<void> _handleAccept() async {
    setState(() => _accepting = true);
    final error =
        await ref.read(ordersProvider.notifier).acceptOrder(widget.order.id);
    if (!mounted) return;
    final success = error == null;
    setState(() {
      _accepting = false;
      if (success) _accepted = true;
    });
    if (success) {
      ref.read(acceptedOrdersProvider.notifier).refresh();
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          success
              ? AppStrings.buyurtmaQabulQilindi
              : error!,
        ),
        backgroundColor: success
            ? SilkTheme.successOf(context)
            : SilkTheme.dangerOf(context),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(SilkTheme.radiusBtn),
        ),
      ),
    );
  }

  Future<void> _callPhone() async {
    final phone = widget.order.phone;
    if (phone == null) return;
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    final order = widget.order;
    final dateFormat = DateFormat('dd MMM yyyy, HH:mm');
    final displayDate = order.messageDate ?? order.createdAt;
    final isNew = order.status == OrderStatus.newOrder && !_accepted;

    final bg = SilkTheme.bgOf(context);
    final surface = SilkTheme.surfaceOf(context);
    final border = SilkTheme.borderOf(context);
    final ink = SilkTheme.inkOf(context);
    final muted = SilkTheme.mutedOf(context);
    final brand = SilkTheme.brandOf(context);
    final accent = SilkTheme.accentOf(context);
    final success = SilkTheme.successOf(context);
    final danger = SilkTheme.dangerOf(context);

    return DraggableScrollableSheet(
      initialChildSize: 0.7,
      maxChildSize: 0.95,
      minChildSize: 0.5,
      expand: false,
      builder: (context, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: surface,
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(SilkTheme.radiusHero),
            ),
          ),
          child: SingleChildScrollView(
            controller: scrollController,
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Drag handle
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: border,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // Accepted badge
                if (_accepted)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: success.withOpacity(0.1),
                      borderRadius:
                          BorderRadius.circular(SilkTheme.radiusBtn),
                      border: Border.all(
                        color: success.withOpacity(0.3),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.check_circle, color: success, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          AppStrings.qabulQilindi,
                          style: SilkTheme.body(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: success,
                          ),
                        ),
                      ],
                    ),
                  ),

                // Route header
                Row(
                  children: [
                    Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        color: brand,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: brand.withOpacity(0.3),
                          width: 2,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        order.cargoFrom ?? '---',
                        style: SilkTheme.display(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: ink,
                        ),
                      ),
                    ),
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.only(left: 5),
                  child: Container(
                    width: 2,
                    height: 24,
                    color: border,
                  ),
                ),
                Row(
                  children: [
                    Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        color: accent,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: accent.withOpacity(0.3),
                          width: 2,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        order.cargoTo ?? '---',
                        style: SilkTheme.display(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: ink,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Info cards
                _DetailRow(icon: Icons.person_outline, label: AppStrings.yuboruvchi, value: order.senderName ?? AppStrings.nomalum),
                if (order.phone != null)
                  _DetailRow(
                    icon: Icons.phone_outlined,
                    label: AppStrings.telefon,
                    value: order.phone!,
                    isPhone: true,
                    onPhoneTap: _callPhone,
                  ),
                _DetailRow(icon: Icons.schedule_outlined, label: AppStrings.sana, value: dateFormat.format(displayDate)),
                if (order.vehicleType != null)
                  _DetailRow(icon: Icons.local_shipping_outlined, label: AppStrings.mashinaTuri, value: order.vehicleType!),
                if (order.cargoWeight != null)
                  _DetailRow(icon: Icons.scale_outlined, label: AppStrings.ogirlik, value: order.cargoWeight!),
                if (order.cargoType != null)
                  _DetailRow(icon: Icons.inventory_2_outlined, label: AppStrings.yukTuri, value: order.cargoType!),
                if (order.distance != null)
                  _DetailRow(icon: Icons.straighten_outlined, label: AppStrings.masofa, value: '${order.distance} km'),
                _DetailRow(icon: Icons.public_outlined, label: AppStrings.tur, value: order.scope.label),
                _DetailRow(icon: Icons.payments_outlined, label: AppStrings.narx, value: order.price ?? AppStrings.kelishiladi),

                if (order.messageText.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  Text(
                    AppStrings.xabarMatni,
                    style: SilkTheme.body(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: muted,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: bg,
                      borderRadius:
                          BorderRadius.circular(SilkTheme.radiusLarge),
                      border: Border.all(color: border),
                    ),
                    child: Text(
                      order.messageText,
                      style: SilkTheme.body(
                        fontSize: 14,
                        color: ink,
                        height: 1.5,
                      ),
                    ),
                  ),
                ],

                const SizedBox(height: 24),

                // Call button (after accepted)
                if (_accepted && order.phone != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton.icon(
                        onPressed: _callPhone,
                        icon: const Icon(Icons.phone, size: 20),
                        label: Text(
                          AppStrings.qongiroqQilish(order.phone!),
                          style: SilkTheme.body(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: success,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(
                                SilkTheme.radiusBtn),
                          ),
                        ),
                      ),
                    ),
                  ),

                // Accept button
                if (isNew)
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: _accepting ? null : _handleAccept,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ink,
                        foregroundColor: bg,
                        shape: RoundedRectangleBorder(
                          borderRadius:
                              BorderRadius.circular(SilkTheme.radiusBtn),
                        ),
                      ),
                      child: _accepting
                          ? SizedBox(
                              width: 22,
                              height: 22,
                              child: CircularProgressIndicator(
                                strokeWidth: 2.5,
                                valueColor:
                                    AlwaysStoppedAnimation<Color>(bg),
                              ),
                            )
                          : Text(
                              AppStrings.qabulQilish,
                              style: SilkTheme.body(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: bg,
                              ),
                            ),
                    ),
                  ),

                // Block sender button
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  height: 44,
                  child: OutlinedButton.icon(
                    onPressed: _handleBlock,
                    icon: const Icon(Icons.block, size: 18),
                    label: Text(
                      AppStrings.yuboruvchiniBlocklash,
                      style: SilkTheme.body(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: danger,
                      side: BorderSide(color: danger, width: 1),
                      shape: RoundedRectangleBorder(
                        borderRadius:
                            BorderRadius.circular(SilkTheme.radiusBtn),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _handleBlock() async {
    final surface = SilkTheme.surfaceOf(context);
    final ink = SilkTheme.inkOf(context);
    final muted = SilkTheme.mutedOf(context);
    final danger = SilkTheme.dangerOf(context);
    final success = SilkTheme.successOf(context);

    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(SilkTheme.radiusLarge),
        ),
        title: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: danger.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(Icons.block, color: danger, size: 22),
            ),
            const SizedBox(width: 10),
            Text(
              AppStrings.bloklash,
              style: SilkTheme.display(
                fontSize: 17,
                fontWeight: FontWeight.w700,
                color: ink,
              ),
            ),
          ],
        ),
        content: Text(
          AppStrings.bloklashOgohlantirish(
              widget.order.senderName ?? AppStrings.nomalum),
          style: SilkTheme.body(
            fontSize: 14,
            color: muted,
            height: 1.4,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(
              AppStrings.bekor,
              style: SilkTheme.body(color: muted),
            ),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: danger,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: Text(AppStrings.bloklash),
          ),
        ],
      ),
    );

    if (confirm != true || !mounted) return;

    final ok = await ref
        .read(ordersProvider.notifier)
        .blockSender(widget.order);
    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(ok
            ? AppStrings.yuboruvchiBloklandi
            : AppStrings.xatolikYuzBerdi),
        backgroundColor: ok ? success : danger,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(SilkTheme.radiusBtn),
        ),
      ),
    );

    if (ok) Navigator.pop(context);
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final bool isPhone;
  final VoidCallback? onPhoneTap;

  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
    this.isPhone = false,
    this.onPhoneTap,
  });

  @override
  Widget build(BuildContext context) {
    final brand = SilkTheme.brandOf(context);
    final accent = SilkTheme.accentOf(context);
    final ink = SilkTheme.inkOf(context);
    final muted = SilkTheme.mutedOf(context);
    final success = SilkTheme.successOf(context);
    final soft = SilkTheme.softOf(context);

    final iconColor = isPhone ? accent : brand;
    final valueColor = isPhone ? accent : ink;

    final row = Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: isPhone ? accent.withOpacity(0.1) : soft,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              isPhone ? Icons.phone : icon,
              size: 18,
              color: iconColor,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: SilkTheme.body(
                    fontSize: 11,
                    color: muted,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: SilkTheme.body(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: valueColor,
                    // underline for phone
                  ).copyWith(
                    decoration: isPhone ? TextDecoration.underline : null,
                  ),
                ),
              ],
            ),
          ),
          if (isPhone)
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: success.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(Icons.call, size: 16, color: success),
            ),
        ],
      ),
    );

    if (isPhone && onPhoneTap != null) {
      return GestureDetector(onTap: onPhoneTap, child: row);
    }
    return row;
  }
}
