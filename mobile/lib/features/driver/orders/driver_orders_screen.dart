import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../config/theme.dart';
import '../../../core/api/websocket_client.dart';
import '../../../core/models/order.dart';
import '../../../core/models/driver_profile.dart';
import '../../../core/services/location_service.dart';
import '../driver_provider.dart';
import '../pending_verification_screen.dart';
import '../../../core/data/uzbekistan_cities.dart';
import '../../../widgets/rating_widget.dart';
import '../../../config/api_config.dart';
import '../../../core/api/api_client.dart';

class DriverOrdersScreen extends ConsumerStatefulWidget {
  const DriverOrdersScreen({super.key});

  @override
  ConsumerState<DriverOrdersScreen> createState() => _DriverOrdersScreenState();
}

class _DriverOrdersScreenState extends ConsumerState<DriverOrdersScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Tab 0: Telegram yuklar filtrlari
  bool _nearMe = true; // Default: yaqindagi yuklar
  String? _scopeFilter;
  String? _typeFilter;
  bool _filterOpen = false;
  String _activeFilter = 'barchasi';
  final _fromController = TextEditingController();
  final _toController = TextEditingController();
  String? _vehicleTypeFilter;

  // Tab 1: Dispetcher yuklari filtrlari
  bool _dFilterOpen = false;
  String? _dScopeFilter;
  final _dFromController = TextEditingController();
  final _dToController = TextEditingController();
  String? _dVehicleTypeFilter;

  // Tab 2: YO'LDA yuklari filtrlari
  bool _yFilterOpen = false;
  final _yFromController = TextEditingController();
  final _yToController = TextEditingController();
  String? _yVehicleTypeFilter;

  // Badge count
  int _newTelegramCount = 0;
  int _newDispatcherCount = 0;
  int _newTgDispatcherCount = 0;
  int _newYoldaCount = 0;

  StreamSubscription<WsEvent>? _wsSub;
  Timer? _reloadDebounce;
  Timer? _autoRefreshTimer; // har 5 daqiqada avtomatik refresh
  String? _lastKnownCity; // GPS shahar o'zgarganda reload qilish uchun

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 5, vsync: this);
    _tabController.addListener(() {
      if (_tabController.index == 1) setState(() => _newTelegramCount = 0);
      if (_tabController.index == 2) setState(() => _newDispatcherCount = 0);
      if (_tabController.index == 3) setState(() => _newTgDispatcherCount = 0);
      if (_tabController.index == 4) setState(() => _newYoldaCount = 0);
    });
    Future.microtask(() {
      _loadAllWithCity();
      _listenToWebSocket();
      _startAutoRefresh();
    });
  }

  /// Har 5 daqiqada keshni yangilash (smooth, scroll buzilmaydi)
  void _startAutoRefresh() {
    _autoRefreshTimer?.cancel();
    _autoRefreshTimer = Timer.periodic(const Duration(minutes: 5), (_) {
      if (mounted) _loadAllWithCity();
    });
  }

  /// Haydovchi shahri bo'yicha barcha providerlarni yuklash
  /// Telegram dispatcher e'lonlari — DOIM hamma yuklar, _nearMe toggle faqat UI filter
  void _loadAllWithCity() {
    final profile = ref.read(driverProfileProvider).profile;
    final city = profile?.lastCity ?? '';
    // Driver orders: _nearMe yoqilgan bo'lsa shahar filtri
    ref.read(driverOrdersProvider.notifier).loadOrders(nearMe: _nearMe && city.isNotEmpty);
    ref.read(dispatcherAdsProvider.notifier).loadAds();
    // Telegram dispatcher: DOIM hamma yuklarni yuklaymiz (filter UI'da bo'ladi)
    // hoursAgo: 24 soat (oldingi 12 yo'q ekan, 24 ko'proq yuk ko'rsatadi)
    ref.read(telegramDispatcherProvider.notifier).loadOrders(hoursAgo: 24);
  }

  /// Debounce bilan reload — ko'p event kelsa faqat 1 marta yuklaydi
  void _debouncedReload() {
    _reloadDebounce?.cancel();
    _reloadDebounce = Timer(const Duration(seconds: 2), _loadAllWithCity);
  }

  void _listenToWebSocket() {
    final wsClient = ref.read(wsClientProvider);
    _wsSub = wsClient.events.listen((event) {
      // Yangi yukni list'ga TEPADAN qo'shish (reload qilmasdan, scroll buzilmaydi)
      if (event.type == WsEventType.orderNew) {
        final data = event.data;
        if (data.isNotEmpty && data['id'] != null) {
          // Yangi yukni provider list'iga prepend qilamiz — UI o'zi yangilanadi
          ref.read(driverOrdersProvider.notifier).addOrderMapLocally(data);
        }
        if (mounted) setState(() => _newTelegramCount++);
        return;
      }
      if (event.type == WsEventType.dispatcherAdNew) {
        final data = event.data;
        if (data.isNotEmpty && data['id'] != null) {
          ref.read(dispatcherAdsProvider.notifier).addAdLocally(data);
        }
        if (mounted) setState(() => _newDispatcherCount++);
        return;
      }
      if (event.type == WsEventType.tgDispatcherNew) {
        final data = event.data;
        if (data.isNotEmpty && data['id'] != null) {
          ref.read(telegramDispatcherProvider.notifier).addOrderLocally(data);
        }
        if (mounted) setState(() => _newTgDispatcherCount++);
      }
    });
  }

  @override
  void dispose() {
    _wsSub?.cancel();
    _reloadDebounce?.cancel();
    _autoRefreshTimer?.cancel();
    _tabController.dispose();
    _fromController.dispose();
    _toController.dispose();
    _dFromController.dispose();
    _dToController.dispose();
    _yFromController.dispose();
    _yToController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ordersState = ref.watch(driverOrdersProvider);
    final privateState = ref.watch(privateOrdersProvider);
    final profileState = ref.watch(driverProfileProvider);

    // GPS shahar o'zgarganda avtomatik reload (kesh stale bo'lmasin)
    final currentCity = profileState.profile?.lastCity ?? '';
    if (_lastKnownCity != null && _lastKnownCity != currentCity) {
      _lastKnownCity = currentCity;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _loadAllWithCity();
      });
    } else {
      _lastKnownCity ??= currentCity;
    }

    // Admin tasdiqlamaguncha — kuting ekrani
    if (profileState.profile != null && !profileState.profile!.isVerified) {
      return const PendingVerificationScreen();
    }

    // Profil bo'sh (bot orqali ro'yxatdan o'tgan) — ma'lumotlarni to'ldirish
    if (profileState.profile != null &&
        (profileState.profile!.fullName == null || profileState.profile!.fullName!.isEmpty) &&
        (profileState.profile!.vehicleType == null || profileState.profile!.vehicleType!.isEmpty)) {
      return Scaffold(
        backgroundColor: AppTheme.bgBodyOf(context),
        body: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.person_add_rounded, size: 64, color: AppTheme.primary),
                  const SizedBox(height: 16),
                  Text(
                    "Ma'lumotlarni to'ldiring",
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: AppTheme.textPrimaryOf(context)),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "Ilovadan foydalanish uchun mashina va shaxsiy ma'lumotlarni kiriting",
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 14, color: AppTheme.textSecondaryOf(context)),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: () => context.push('/driver/register'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text("Ma'lumotlarni kiritish", style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppTheme.bgBodyOf(context),
      appBar: AppBar(
        backgroundColor: AppTheme.cardBgOf(context),
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        scrolledUnderElevation: 0.5,
        title: Text(
          "YO'LDA",
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w800,
            color: AppTheme.textPrimaryOf(context),
            letterSpacing: 1.5,
          ),
        ),
        actions: [
          // Online/Offline toggle — dispatcher ilovasidek pill
          if (profileState.profile != null)
            GestureDetector(
              onTap: () async {
                final newVal = !profileState.profile!.isOnline;
                ref.read(driverProfileProvider.notifier).setOnline(newVal);
                final locationService = ref.read(locationServiceProvider);
                if (newVal) {
                  // Online — yuklar yuklash + GPS
                  ref.read(driverOrdersProvider.notifier).loadOrders();
                  ref.read(dispatcherAdsProvider.notifier).loadAds();
                  final started = await locationService.startTracking();
                  if (!started && context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: const Text('GPS ruxsati berilmagan'),
                        backgroundColor: AppTheme.warningColor,
                        behavior: SnackBarBehavior.floating,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    );
                    ref.read(driverProfileProvider.notifier).setOnline(false);
                  }
                } else {
                  // Offline — yuklar tozalash + GPS to'xtatish
                  ref.read(driverOrdersProvider.notifier).clearOrders();
                  ref.read(dispatcherAdsProvider.notifier).loadAds(); // bo'sh
                  locationService.stopTracking();
                }
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                margin: const EdgeInsets.only(right: 8),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: profileState.profile!.isOnline
                      ? AppTheme.successColor
                      : AppTheme.errorColor,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: (profileState.profile!.isOnline
                              ? AppTheme.successColor
                              : AppTheme.errorColor)
                          .withValues(alpha: 0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white,
                        boxShadow: profileState.profile!.isOnline
                            ? [BoxShadow(color: Colors.white.withValues(alpha: 0.6), blurRadius: 6, spreadRadius: 1)]
                            : null,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      profileState.profile!.isOnline ? 'Online' : 'Offline',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          // Notification
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: AppTheme.textPrimary, size: 24),
            onPressed: () => context.push('/notifications'),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(44),
          child: Container(
            decoration: BoxDecoration(
              color: AppTheme.cardBgOf(context),
              border: Border(bottom: BorderSide(color: AppTheme.dividerOf(context), width: 0.5)),
            ),
            child: TabBar(
              controller: _tabController,
              isScrollable: true,
              tabAlignment: TabAlignment.start,
              labelColor: AppTheme.primary,
              unselectedLabelColor: AppTheme.textHintOf(context),
              labelStyle: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
              unselectedLabelStyle: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w400,
              ),
              indicatorColor: AppTheme.primary,
              indicatorWeight: 2.5,
              indicatorSize: TabBarIndicatorSize.label,
              dividerColor: Colors.transparent,
              labelPadding: const EdgeInsets.symmetric(horizontal: 12),
              tabs: [
                const Tab(text: 'Hammasi'),
                _badgeTab('Telegram yukchi', _newTelegramCount),
                _badgeTab("YO'LDA dispetcher", _newDispatcherCount),
                _badgeTab('Telegram dispetcher', _newTgDispatcherCount),
                Tab(
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text("YO'LDA yuklari"),
                      if (_newYoldaCount > 0) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppTheme.errorColor,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            '$_newYoldaCount',
                            style: const TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.w700),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildAllTab(ordersState),
          _buildOrdersTab(ordersState),
          _buildDispatcherAdsTab(),
          _buildTelegramDispatcherTab(),
          _buildNearbyOrdersTab(),
        ],
      ),
    );
  }

  // ============================================================
  // HAMMASI TAB — barcha yuklar birgalikda
  // ============================================================
  Widget _buildAllTab(dynamic ordersState) {
    final profileState = ref.watch(driverProfileProvider);
    // Offline holatda — "Smena tugadi" xabari
    if (profileState.profile != null && !profileState.profile!.isOnline) {
      return _buildShiftEndedScreen();
    }
    // Online — barcha yuklar ko'rsatiladi. GPS/lastCity butun ekranni
    // BLOKLAMAYDI — u faqat "yaqin" (nearMe) filtri uchun ishlatiladi.

    final telegramOrders = (ordersState.orders as List<Map<String, dynamic>>);
    final dispatcherState = ref.watch(dispatcherAdsProvider);
    final tgDispState = ref.watch(telegramDispatcherProvider);

    final allItems = <Map<String, dynamic>>[];
    final seenIds = <String>{};
    for (final o in telegramOrders) {
      final id = o['id'] as String? ?? '';
      if (id.isNotEmpty && !seenIds.contains(id)) {
        seenIds.add(id);
        allItems.add({...o, '_source': 'telegram'});
      }
    }
    for (final a in dispatcherState.ads) {
      final id = a['id'] as String? ?? '';
      if (id.isNotEmpty && !seenIds.contains(id)) {
        seenIds.add(id);
        allItems.add({...a, '_source': 'dispatcher'});
      }
    }
    for (final t in tgDispState.orders) {
      final id = t['id'] as String? ?? '';
      if (id.isNotEmpty && !seenIds.contains(id)) {
        seenIds.add(id);
        allItems.add({...t, '_source': 'tg_dispatcher'});
      }
    }

    allItems.sort((a, b) {
      final aTime = a['createdAt'] as String? ?? '';
      final bTime = b['createdAt'] as String? ?? '';
      return bTime.compareTo(aTime);
    });

    // Scope filtr
    var filtered = allItems;
    if (_scopeFilter != null) {
      filtered = allItems.where((o) => o['scope'] == _scopeFilter).toList();
    }

    // Yaqindagi yuklar — faqat _nearMe yoqilgan bo'lsa filter qilamiz
    if (_nearMe) {
      final profileState = ref.read(driverProfileProvider);
      final lastCity = profileState.profile?.lastCity?.toLowerCase() ?? '';
      if (lastCity.isNotEmpty) {
        filtered = filtered.where((o) {
          final from = (o['cargoFrom'] as String? ?? '').toLowerCase();
          final to = (o['cargoTo'] as String? ?? '').toLowerCase();
          return from.contains(lastCity) || lastCity.contains(from) ||
                 to.contains(lastCity) || lastCity.contains(to);
        }).toList();
      }
    }

    // Qidiruv filtrlari (cargoFrom, cargoTo)
    final fromText = _fromController.text.trim().toLowerCase();
    if (fromText.isNotEmpty) {
      filtered = filtered.where((o) =>
        (o['cargoFrom'] as String? ?? '').toLowerCase().contains(fromText)
      ).toList();
    }
    final toText = _toController.text.trim().toLowerCase();
    if (toText.isNotEmpty) {
      filtered = filtered.where((o) =>
        (o['cargoTo'] as String? ?? '').toLowerCase().contains(toText)
      ).toList();
    }

    final isLoading = ordersState.isLoading || dispatcherState.isLoading || tgDispState.isLoading;

    return Column(
      children: [
        // Sarlavha + pills
        Container(
          padding: const EdgeInsets.fromLTRB(16, 12, 8, 8),
          color: AppTheme.cardBgOf(context),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text('Yuklar', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: AppTheme.textPrimaryOf(context))),
                  const Spacer(),
                  Material(
                    color: Colors.transparent,
                    child: InkWell(
                      borderRadius: BorderRadius.circular(10),
                      onTap: () => setState(() => _filterOpen = !_filterOpen),
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: _filterOpen ? AppTheme.primary.withValues(alpha: 0.1) : AppTheme.bgBodyOf(context),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(Icons.search, size: 20, color: _filterOpen ? AppTheme.primary : AppTheme.textSecondaryOf(context)),
                      ),
                    ),
                  ),
                  SizedBox(
                    width: 36,
                    child: IconButton(
                      icon: Icon(Icons.refresh, size: 20, color: AppTheme.textSecondaryOf(context)),
                      padding: EdgeInsets.zero,
                      onPressed: () {
                        ref.read(driverOrdersProvider.notifier).loadOrders(scope: _scopeFilter, nearMe: _nearMe);
                        ref.read(dispatcherAdsProvider.notifier).loadAds();
                        ref.read(telegramDispatcherProvider.notifier).loadOrders();
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildPill('Barchasi', _scopeFilter == null, () {
                      setState(() => _scopeFilter = null);
                    }),
                    const SizedBox(width: 8),
                    _buildPill('Ichki', _scopeFilter == 'INTERNAL', () {
                      setState(() => _scopeFilter = 'INTERNAL');
                    }),
                    const SizedBox(width: 8),
                    _buildPill('Import', _scopeFilter == 'IMPORT', () {
                      setState(() => _scopeFilter = 'IMPORT');
                    }),
                    const SizedBox(width: 8),
                    _buildPill('Eksport', _scopeFilter == 'EXPORT', () {
                      setState(() => _scopeFilter = 'EXPORT');
                    }),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              // Yaqindagi / Hamma toggle — aniq ko'rinadigan
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: AppTheme.bgBodyOf(context),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.cardBorderOf(context)),
                ),
                child: Row(
                  children: [
                    Icon(
                      _nearMe ? Icons.near_me : Icons.public,
                      size: 20,
                      color: AppTheme.primary,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        _nearMe ? 'Yaqindagi yuklar' : 'Barcha yuklar',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.textPrimaryOf(context),
                        ),
                      ),
                    ),
                    Switch(
                      value: _nearMe,
                      onChanged: (val) {
                        setState(() => _nearMe = val);
                        ref.read(driverOrdersProvider.notifier).loadOrders(scope: _scopeFilter, nearMe: val);
                        final city = ref.read(driverProfileProvider).profile?.lastCity ?? '';
                        ref.read(telegramDispatcherProvider.notifier).loadOrders(
                          cargoFrom: val && city.isNotEmpty ? city : null,
                        );
                      },
                      activeColor: AppTheme.primary,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 4),
            ],
          ),
        ),

        // Filtr panel
        if (_filterOpen)
          Container(
            margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppTheme.cardBgOf(context),
              border: Border.all(color: AppTheme.cardBorderOf(context)),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(child: _buildFilterInput(controller: _fromController, label: 'Qayerdan', hint: 'A shahar...', icon: Icons.trip_origin, iconColor: AppTheme.primary)),
                    const SizedBox(width: 10),
                    Expanded(child: _buildFilterInput(controller: _toController, label: 'Qayerga', hint: 'B shahar...', icon: Icons.location_on, iconColor: AppTheme.accent)),
                  ],
                ),
              ],
            ),
          ),

        // Ro'yxat
        Expanded(
          child: isLoading && filtered.isEmpty
              ? Center(child: CircularProgressIndicator(color: AppTheme.primary, strokeWidth: 2.5))
              : filtered.isEmpty
                  ? const _EmptyState(icon: Icons.inbox_outlined, message: "Yuklar yo'q")
                  : RefreshIndicator(
                      color: AppTheme.primary,
                      onRefresh: () async => _loadAllWithCity(),
                      child: ListView.separated(
                        key: const PageStorageKey<String>('driver_all_list'),
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                        itemCount: filtered.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (context, index) {
                          final item = filtered[index];
                          final source = item['_source'] as String?;
                          if (source == 'dispatcher') {
                            return _DispatcherAdCard(
                              ad: item,
                              onChat: () async {
                                final roomId = await ref.read(dispatcherAdsProvider.notifier).startChat(item['id'] as String);
                                if (roomId != null && context.mounted) context.push('/driver/chat/$roomId');
                              },
                            );
                          }
                          return _OrderCard(order: item);
                        },
                      ),
                    ),
        ),
      ],
    );
  }

  // ============================================================
  // YUKLAR TAB — dispatcher ilovasidek filtrli
  // ============================================================
  Widget _buildOrdersTab(dynamic ordersState) {
    // Filtrlash
    var orders = ordersState.orders as List<Map<String, dynamic>>;

    // Scope filtr
    if (_scopeFilter != null) {
      orders = orders.where((o) => o['scope'] == _scopeFilter).toList();
    }

    // A nuqta (cargoFrom) filtr
    final fromText = _fromController.text.trim().toLowerCase();
    if (fromText.isNotEmpty) {
      orders = orders.where((o) =>
        (o['cargoFrom'] as String? ?? '').toLowerCase().contains(fromText)
      ).toList();
    }

    // B nuqta (cargoTo) filtr
    final toText = _toController.text.trim().toLowerCase();
    if (toText.isNotEmpty) {
      orders = orders.where((o) =>
        (o['cargoTo'] as String? ?? '').toLowerCase().contains(toText)
      ).toList();
    }

    // Mashina turi filtr
    if (_vehicleTypeFilter != null) {
      orders = orders.where((o) =>
        (o['vehicleType'] as String? ?? '').toLowerCase().contains(_vehicleTypeFilter!.toLowerCase())
      ).toList();
    }

    return Column(
      children: [
        // Filtr sarlavha + tune icon
        Container(
          padding: const EdgeInsets.fromLTRB(16, 12, 8, 4),
          color: AppTheme.cardBgOf(context),
          child: Column(
            children: [
              Row(
                children: [
                  Text(
                    'Yuklar',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.textPrimaryOf(context),
                    ),
                  ),
                  const Spacer(),
                  Material(
                    color: Colors.transparent,
                    child: InkWell(
                      borderRadius: BorderRadius.circular(10),
                      onTap: () => setState(() => _filterOpen = !_filterOpen),
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: _filterOpen
                              ? AppTheme.primary.withValues(alpha: 0.1)
                              : AppTheme.bgBodyOf(context),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(
                          Icons.search,
                          size: 20,
                          color: _filterOpen
                              ? AppTheme.primary
                              : AppTheme.textSecondaryOf(context),
                        ),
                      ),
                    ),
                  ),
                  SizedBox(
                    width: 36,
                    child: IconButton(
                      icon: Icon(Icons.refresh, size: 20, color: AppTheme.textSecondaryOf(context)),
                      padding: EdgeInsets.zero,
                      onPressed: () => ref.read(driverOrdersProvider.notifier).loadOrders(nearMe: _nearMe),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              // Filter pills
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildPill('Barchasi', _activeFilter == 'barchasi', () {
                      setState(() { _activeFilter = 'barchasi'; _scopeFilter = null; });
                      ref.read(driverOrdersProvider.notifier).loadOrders(nearMe: _nearMe);
                    }),
                    const SizedBox(width: 8),
                    _buildPill('Ichki', _activeFilter == 'ichki', () {
                      setState(() { _activeFilter = 'ichki'; _scopeFilter = 'INTERNAL'; });
                      ref.read(driverOrdersProvider.notifier).loadOrders(scope: 'INTERNAL', nearMe: _nearMe);
                    }),
                    const SizedBox(width: 8),
                    _buildPill('Import', _activeFilter == 'import', () {
                      setState(() { _activeFilter = 'import'; _scopeFilter = 'IMPORT'; });
                      ref.read(driverOrdersProvider.notifier).loadOrders(scope: 'IMPORT', nearMe: _nearMe);
                    }),
                    const SizedBox(width: 8),
                    _buildPill('Eksport', _activeFilter == 'eksport', () {
                      setState(() { _activeFilter = 'eksport'; _scopeFilter = 'EXPORT'; });
                      ref.read(driverOrdersProvider.notifier).loadOrders(scope: 'EXPORT', nearMe: _nearMe);
                    }),
                    const SizedBox(width: 8),
                    _buildPill('Yaqin', _nearMe, () {
                      final newVal = !_nearMe;
                      setState(() => _nearMe = newVal);
                      ref.read(driverOrdersProvider.notifier).loadOrders(nearMe: newVal);
                    }, icon: Icons.near_me_outlined),
                  ],
                ),
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),

        // Kengaytirilgan filtr panel
        if (_filterOpen)
          Container(
            margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppTheme.cardBgOf(context),
              border: Border.all(color: AppTheme.cardBorderOf(context)),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: _buildFilterInput(
                        controller: _fromController,
                        label: 'Qayerdan',
                        hint: 'A shahar...',
                        icon: Icons.trip_origin,
                        iconColor: AppTheme.primary,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _buildFilterInput(
                        controller: _toController,
                        label: 'Qayerga',
                        hint: 'B shahar...',
                        icon: Icons.location_on,
                        iconColor: AppTheme.accent,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Mashina turi', style: TextStyle(fontSize: 12, color: AppTheme.textSecondaryOf(context))),
                          const SizedBox(height: 4),
                          Container(
                            height: 40,
                            padding: const EdgeInsets.symmetric(horizontal: 10),
                            decoration: BoxDecoration(
                              color: AppTheme.bgBodyOf(context),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: AppTheme.cardBorderOf(context)),
                            ),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<String>(
                                value: _vehicleTypeFilter,
                                isExpanded: true,
                                hint: Text('Barchasi', style: TextStyle(fontSize: 13, color: AppTheme.textHintOf(context))),
                                style: TextStyle(fontSize: 13, color: AppTheme.textPrimaryOf(context)),
                                items: ['Tentli', 'Ref', 'Bortli', 'Fura', 'Kamaz', 'MAN', 'HOWO', 'Isuzu', 'Gazel', 'Samosval']
                                    .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                                    .toList(),
                                onChanged: (v) => setState(() => _vehicleTypeFilter = v),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: TextButton.icon(
                    onPressed: () {
                      _fromController.clear();
                      _toController.clear();
                      setState(() { _vehicleTypeFilter = null; });
                    },
                    icon: const Icon(Icons.clear_all, size: 18),
                    label: const Text('Tozalash'),
                    style: TextButton.styleFrom(
                      foregroundColor: AppTheme.textSecondaryOf(context),
                      textStyle: const TextStyle(fontSize: 13),
                    ),
                  ),
                ),
              ],
            ),
          ),

        // Orderlar ro'yxati
        Expanded(
          child: ordersState.isLoading
              ? Center(child: CircularProgressIndicator(color: AppTheme.primary, strokeWidth: 2.5))
              : orders.isEmpty
                  ? _EmptyState(icon: Icons.inbox_outlined, message: "Yuklar yo'q")
                  : RefreshIndicator(
                      color: AppTheme.primary,
                      onRefresh: () async =>
                          ref.read(driverOrdersProvider.notifier).loadOrders(nearMe: _nearMe),
                      child: ListView.separated(
                        key: const PageStorageKey<String>('driver_telegram_orders_list'),
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                        itemCount: orders.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (context, index) => _OrderCard(order: orders[index]),
                      ),
                    ),
        ),
      ],
    );
  }

  Widget _buildPill(String label, bool isActive, VoidCallback onTap, {IconData? icon}) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: isActive ? AppTheme.primary : AppTheme.bgBodyOf(context),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isActive ? AppTheme.primary : AppTheme.dividerOf(context),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(icon, size: 14, color: isActive ? Colors.white : AppTheme.textSecondaryOf(context)),
              const SizedBox(width: 4),
            ],
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                color: isActive ? Colors.white : AppTheme.textSecondaryOf(context),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildShiftEndedScreen() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 96,
              height: 96,
              decoration: BoxDecoration(
                color: AppTheme.errorColor.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.bedtime_rounded, size: 56, color: AppTheme.errorColor),
            ),
            const SizedBox(height: 20),
            Text(
              "Ish smenangizni tugatdingiz",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: AppTheme.textPrimaryOf(context),
              ),
            ),
            const SizedBox(height: 10),
            Text(
              "Yangi buyurtmalar to'xtatildi.\nIshlashni boshlash uchun yuqorida 'Online' tugmasini bosing.",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: AppTheme.textSecondaryOf(context),
                height: 1.5,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {
                ref.read(driverProfileProvider.notifier).setOnline(true);
                final locationService = ref.read(locationServiceProvider);
                locationService.startTracking();
                _loadAllWithCity();
              },
              icon: const Icon(Icons.power_settings_new, size: 20),
              label: const Text("Ishni boshlash"),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.successColor,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGpsRequiredScreen() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.location_off_outlined, size: 64, color: AppTheme.textHintOf(context)),
            const SizedBox(height: 16),
            Text(
              'GPS yoqilmagan',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppTheme.textPrimaryOf(context),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Sizga yaqin yuklarni ko\'rsatish uchun GPS yoqing va Profil sahifada "Online" tugmasini bosing.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: AppTheme.textSecondaryOf(context),
                height: 1.4,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () async {
                // Joylashuv ruxsatini so'rab, kuzatuvni boshlaymiz va Online qilamiz
                await Permission.location.request();
                await Permission.locationAlways.request();
                final locationService = ref.read(locationServiceProvider);
                final started = await locationService.startTracking();
                if (started) {
                  ref.read(driverProfileProvider.notifier).setOnline(true);
                  ref.read(driverOrdersProvider.notifier).loadOrders();
                  ref.read(dispatcherAdsProvider.notifier).loadAds();
                  if (context.mounted) setState(() {});
                } else if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text(
                          'GPS ruxsatini bering: Sozlamalar > Ilovalar > YO\'LDA > Ruxsatlar > Joylashuv > "Doimo ruxsat"'),
                    ),
                  );
                }
              },
              icon: const Icon(Icons.location_on, size: 18),
              label: const Text('GPS yoqish'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.driverPrimary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Tab _badgeTab(String label, int count) {
    return Tab(
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(label),
          if (count > 0) ...[
            const SizedBox(width: 4),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
              decoration: BoxDecoration(color: AppTheme.errorColor, borderRadius: BorderRadius.circular(8)),
              child: Text('$count', style: const TextStyle(fontSize: 9, color: Colors.white, fontWeight: FontWeight.w700)),
            ),
          ],
        ],
      ),
    );
  }

  List<String> _citySuggestions = [];

  Widget _buildFilterInput({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    required Color iconColor,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(fontSize: 12, color: AppTheme.textSecondaryOf(context))),
        const SizedBox(height: 4),
        SizedBox(
          height: 40,
          child: TextField(
            controller: controller,
            onChanged: (val) {
              setState(() {
                _citySuggestions = searchCities(val);
              });
            },
            style: TextStyle(fontSize: 13, color: AppTheme.textPrimaryOf(context)),
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: TextStyle(fontSize: 13, color: AppTheme.textHintOf(context)),
              prefixIcon: Icon(icon, size: 16, color: iconColor),
              prefixIconConstraints: const BoxConstraints(minWidth: 36),
              filled: true,
              fillColor: AppTheme.bgBodyOf(context),
              contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide(color: AppTheme.cardBorderOf(context)),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide(color: AppTheme.cardBorderOf(context)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide(color: AppTheme.primary, width: 1.5),
              ),
            ),
          ),
        ),
        // Autocomplete dropdown
        if (_citySuggestions.isNotEmpty && controller.text.isNotEmpty)
          Container(
            constraints: const BoxConstraints(maxHeight: 150),
            margin: const EdgeInsets.only(top: 2),
            decoration: BoxDecoration(
              color: AppTheme.cardBgOf(context),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppTheme.cardBorderOf(context)),
              boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 6)],
            ),
            child: ListView.builder(
              shrinkWrap: true,
              padding: EdgeInsets.zero,
              itemCount: _citySuggestions.length,
              itemBuilder: (_, i) => InkWell(
                onTap: () {
                  controller.text = _citySuggestions[i];
                  setState(() => _citySuggestions = []);
                  FocusScope.of(context).unfocus();
                },
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  child: Text(
                    _citySuggestions[i],
                    style: TextStyle(fontSize: 13, color: AppTheme.textPrimaryOf(context)),
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }

  // ============================================================
  // DISPETCHER YUKLARI TAB
  // ============================================================
  Widget _buildDispatcherAdsTab() {
    final adsState = ref.watch(dispatcherAdsProvider);
    var ads = adsState.ads;

    // Filtrlash
    final dFrom = _dFromController.text.trim().toLowerCase();
    if (dFrom.isNotEmpty) {
      ads = ads.where((a) =>
        (a['cargoFrom'] as String? ?? '').toLowerCase().contains(dFrom)
      ).toList();
    }
    final dTo = _dToController.text.trim().toLowerCase();
    if (dTo.isNotEmpty) {
      ads = ads.where((a) =>
        (a['cargoTo'] as String? ?? '').toLowerCase().contains(dTo)
      ).toList();
    }
    if (_dVehicleTypeFilter != null) {
      ads = ads.where((a) =>
        (a['vehicleType'] as String? ?? '').toLowerCase().contains(_dVehicleTypeFilter!.toLowerCase())
      ).toList();
    }

    // Scope filtr ham
    if (_dScopeFilter != null) {
      // Dispetcher ads da scope yo'q — lekin cargoFrom/cargoTo bor
      // Scope ni client-side filter sifatida ishlatamiz
    }

    return Column(
      children: [
        // Filtr sarlavha + pills
        Container(
          padding: const EdgeInsets.fromLTRB(16, 12, 8, 4),
          color: AppTheme.cardBgOf(context),
          child: Column(
            children: [
              Row(
                children: [
                  Text(
                    "Dispetcher e'lonlari",
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textPrimaryOf(context),
                ),
              ),
              const Spacer(),
              Material(
                color: Colors.transparent,
                child: InkWell(
                  borderRadius: BorderRadius.circular(10),
                  onTap: () => setState(() => _dFilterOpen = !_dFilterOpen),
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: _dFilterOpen
                          ? AppTheme.primary.withValues(alpha: 0.1)
                          : AppTheme.bgBodyOf(context),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      Icons.search,
                      size: 20,
                      color: _dFilterOpen
                          ? AppTheme.primary
                          : AppTheme.textSecondaryOf(context),
                    ),
                  ),
                ),
              ),
              SizedBox(
                width: 36,
                child: IconButton(
                  icon: Icon(Icons.refresh, size: 20, color: AppTheme.textSecondaryOf(context)),
                  padding: EdgeInsets.zero,
                  onPressed: () => ref.read(dispatcherAdsProvider.notifier).loadAds(),
                ),
              ),
            ],
          ),
              const SizedBox(height: 8),
              // Pills
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildPill('Barchasi', _dScopeFilter == null, () {
                      setState(() => _dScopeFilter = null);
                    }),
                    const SizedBox(width: 8),
                    _buildPill('Ichki', _dScopeFilter == 'INTERNAL', () {
                      setState(() => _dScopeFilter = 'INTERNAL');
                    }),
                    const SizedBox(width: 8),
                    _buildPill('Import', _dScopeFilter == 'IMPORT', () {
                      setState(() => _dScopeFilter = 'IMPORT');
                    }),
                    const SizedBox(width: 8),
                    _buildPill('Eksport', _dScopeFilter == 'EXPORT', () {
                      setState(() => _dScopeFilter = 'EXPORT');
                    }),
                    const SizedBox(width: 8),
                    _buildPill('Yaqin', _nearMe, () {
                      final newVal = !_nearMe;
                      setState(() => _nearMe = newVal);
                      ref.read(driverOrdersProvider.notifier).loadOrders(scope: _scopeFilter, nearMe: newVal);
                    }, icon: Icons.near_me_outlined),
                  ],
                ),
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),

        // Kengaytirilgan filtr
        if (_dFilterOpen)
          Container(
            margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppTheme.cardBgOf(context),
              border: Border.all(color: AppTheme.cardBorderOf(context)),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: _buildFilterInput(
                        controller: _dFromController,
                        label: 'Qayerdan',
                        hint: 'A shahar...',
                        icon: Icons.trip_origin,
                        iconColor: AppTheme.primary,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _buildFilterInput(
                        controller: _dToController,
                        label: 'Qayerga',
                        hint: 'B shahar...',
                        icon: Icons.location_on,
                        iconColor: AppTheme.accent,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Mashina turi', style: TextStyle(fontSize: 12, color: AppTheme.textSecondaryOf(context))),
                          const SizedBox(height: 4),
                          Container(
                            height: 40,
                            padding: const EdgeInsets.symmetric(horizontal: 10),
                            decoration: BoxDecoration(
                              color: AppTheme.bgBodyOf(context),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: AppTheme.cardBorderOf(context)),
                            ),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<String>(
                                value: _dVehicleTypeFilter,
                                isExpanded: true,
                                hint: Text('Barchasi', style: TextStyle(fontSize: 13, color: AppTheme.textHintOf(context))),
                                style: TextStyle(fontSize: 13, color: AppTheme.textPrimaryOf(context)),
                                items: ['Tentli', 'Ref', 'Bortli', 'Fura', 'Kamaz', 'MAN', 'HOWO', 'Isuzu', 'Gazel', 'Samosval']
                                    .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                                    .toList(),
                                onChanged: (v) => setState(() => _dVehicleTypeFilter = v),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: TextButton.icon(
                    onPressed: () {
                      _dFromController.clear();
                      _dToController.clear();
                      setState(() { _dVehicleTypeFilter = null; });
                    },
                    icon: const Icon(Icons.clear_all, size: 18),
                    label: const Text('Tozalash'),
                    style: TextButton.styleFrom(
                      foregroundColor: AppTheme.textSecondaryOf(context),
                    ),
                  ),
                ),
              ],
            ),
          ),

        // E'lonlar ro'yxati
        Expanded(
          child: adsState.isLoading
              ? Center(child: CircularProgressIndicator(color: AppTheme.primary, strokeWidth: 2.5))
              : ads.isEmpty
                  ? _EmptyState(icon: Icons.campaign_outlined, message: "Dispetcher e'lonlari yo'q")
                  : RefreshIndicator(
                      color: AppTheme.primary,
                      onRefresh: () async => ref.read(dispatcherAdsProvider.notifier).loadAds(),
                      child: ListView.separated(
                        key: const PageStorageKey<String>('driver_dispatcher_ads_list'),
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                        itemCount: ads.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (context, index) {
                          final ad = ads[index];
                          return _DispatcherAdCard(
                            ad: ad,
                            onChat: () async {
                              final roomId = await ref.read(dispatcherAdsProvider.notifier).startChat(ad['id'] as String);
                              if (roomId != null && context.mounted) {
                                context.push('/driver/chat/$roomId');
                              }
                            },
                          );
                        },
                      ),
                    ),
        ),
      ],
    );
  }

  // ============================================================
  // TELEGRAM DISPETCHER TAB — bloklangan senderlar e'lonlari
  // ============================================================
  // Telegram dispetcher filtrlari
  String? _tdScopeFilter;

  Widget _buildTelegramDispatcherTab() {
    // Offline bo'lsa — smena tugadi; online bo'lsa yuklar ko'rsatiladi.
    // lastCity butun ekranni BLOKLAMAYDI.
    final profileState2 = ref.watch(driverProfileProvider);
    if (profileState2.profile != null && !profileState2.profile!.isOnline) {
      return _buildShiftEndedScreen();
    }

    final state = ref.watch(telegramDispatcherProvider);
    var orders = state.orders;

    // Client-side scope filtr
    if (_tdScopeFilter != null) {
      orders = orders.where((o) => o['scope'] == _tdScopeFilter).toList();
    }
    // Yaqin filtr BACKEND da qilinadi (cargoFrom = lastCity)

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.fromLTRB(16, 12, 8, 8),
          color: AppTheme.cardBgOf(context),
          child: Column(
            children: [
              Row(
                children: [
                  Text("Telegram dispetcher", style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: AppTheme.textPrimaryOf(context))),
                  const Spacer(),
                  SizedBox(
                    width: 36,
                    child: IconButton(
                      icon: Icon(Icons.refresh, size: 20, color: AppTheme.textSecondaryOf(context)),
                      padding: EdgeInsets.zero,
                      onPressed: () {
                        final city = ref.read(driverProfileProvider).profile?.lastCity ?? '';
                        ref.read(telegramDispatcherProvider.notifier).loadOrders(
                          hoursAgo: _tdScopeFilter != null ? 24 : 12,
                          cargoFrom: city.isNotEmpty ? city : null,
                        );
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildPill('Barchasi', _tdScopeFilter == null, () {
                      setState(() => _tdScopeFilter = null);
                    }),
                    const SizedBox(width: 8),
                    _buildPill('Ichki', _tdScopeFilter == 'INTERNAL', () {
                      setState(() => _tdScopeFilter = 'INTERNAL');
                    }),
                    const SizedBox(width: 8),
                    _buildPill('Import', _tdScopeFilter == 'IMPORT', () {
                      setState(() => _tdScopeFilter = 'IMPORT');
                    }),
                    const SizedBox(width: 8),
                    _buildPill('Eksport', _tdScopeFilter == 'EXPORT', () {
                      setState(() => _tdScopeFilter = 'EXPORT');
                    }),
                  ],
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: state.isLoading
              ? Center(child: CircularProgressIndicator(color: AppTheme.primary, strokeWidth: 2.5))
              : orders.isEmpty
                  ? _EmptyState(
                      icon: Icons.campaign_outlined,
                      message: state.error ?? "Telegram dispetcher yuklari yo'q",
                    )
                  : RefreshIndicator(
                      color: AppTheme.primary,
                      onRefresh: () async {
                        final city = ref.read(driverProfileProvider).profile?.lastCity ?? '';
                        await ref.read(telegramDispatcherProvider.notifier).loadOrders(
                          hoursAgo: _tdScopeFilter != null ? 24 : 12,
                          cargoFrom: city.isNotEmpty ? city : null,
                        );
                        setState(() => _newTgDispatcherCount = 0);
                      },
                      child: ListView.separated(
                        key: const PageStorageKey<String>('driver_tg_dispatcher_list'),
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                        itemCount: orders.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (context, index) => _OrderCard(order: {...orders[index], '_source': 'tg_dispatcher'}),
                      ),
                    ),
        ),
      ],
    );
  }

  // ============================================================
  // YO'LDA YUKLARI TAB — 100km radius
  // ============================================================
  Widget _buildNearbyOrdersTab() {
    // YO'LDA yuklari — mijozlar bot/app yaratilganda ishlaydi
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.rocket_launch_outlined, size: 64, color: AppTheme.textHintOf(context)),
            const SizedBox(height: 16),
            Text(
              "Tez kunda!",
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: AppTheme.textPrimaryOf(context)),
            ),
            const SizedBox(height: 8),
            Text(
              "YO'LDA yuklari — mijozlar ilovasi\ntayyor bo'lganda ishlaydi",
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 14, color: AppTheme.textSecondaryOf(context), height: 1.5),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNearbyOrdersTabOld() {
    final nearbyState = ref.watch(nearbyOrdersProvider);
    var orders = nearbyState.orders;

    final yFrom = _yFromController.text.trim().toLowerCase();
    if (yFrom.isNotEmpty) {
      orders = orders.where((o) =>
        (o['cargoFrom'] as String? ?? '').toLowerCase().contains(yFrom)
      ).toList();
    }
    final yTo = _yToController.text.trim().toLowerCase();
    if (yTo.isNotEmpty) {
      orders = orders.where((o) =>
        (o['cargoTo'] as String? ?? '').toLowerCase().contains(yTo)
      ).toList();
    }
    if (_yVehicleTypeFilter != null) {
      orders = orders.where((o) =>
        (o['vehicleType'] as String? ?? '').toLowerCase().contains(_yVehicleTypeFilter!.toLowerCase())
      ).toList();
    }

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.fromLTRB(16, 12, 8, 4),
          color: AppTheme.cardBgOf(context),
          child: Column(
            children: [
              Row(
                children: [
                  Text(
                    "YO'LDA yuklari (100km)",
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.textPrimaryOf(context),
                    ),
                  ),
                  const Spacer(),
                  Material(
                    color: Colors.transparent,
                    child: InkWell(
                      borderRadius: BorderRadius.circular(10),
                      onTap: () => setState(() => _yFilterOpen = !_yFilterOpen),
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: _yFilterOpen
                              ? AppTheme.primary.withValues(alpha: 0.1)
                              : AppTheme.bgBodyOf(context),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(Icons.search, size: 20,
                          color: _yFilterOpen ? AppTheme.primary : AppTheme.textSecondaryOf(context)),
                      ),
                    ),
                  ),
                  SizedBox(
                    width: 36,
                    child: IconButton(
                      icon: Icon(Icons.refresh, size: 20, color: AppTheme.textSecondaryOf(context)),
                      padding: EdgeInsets.zero,
                      onPressed: () => ref.read(nearbyOrdersProvider.notifier).loadOrders(),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              // Pills
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildPill('Barchasi', true, () {}),
                    const SizedBox(width: 8),
                    _buildPill('Ichki', false, () {}),
                    const SizedBox(width: 8),
                    _buildPill('Import', false, () {}),
                    const SizedBox(width: 8),
                    _buildPill('Eksport', false, () {}),
                  ],
                ),
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),

        if (_yFilterOpen)
          Container(
            margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppTheme.cardBgOf(context),
              border: Border.all(color: AppTheme.cardBorderOf(context)),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(child: _buildFilterInput(controller: _yFromController, label: 'Qayerdan', hint: 'A shahar...', icon: Icons.trip_origin, iconColor: AppTheme.primary)),
                    const SizedBox(width: 10),
                    Expanded(child: _buildFilterInput(controller: _yToController, label: 'Qayerga', hint: 'B shahar...', icon: Icons.location_on, iconColor: AppTheme.accent)),
                  ],
                ),
                const SizedBox(height: 10),
                Row(children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Mashina turi', style: TextStyle(fontSize: 12, color: AppTheme.textSecondaryOf(context))),
                        const SizedBox(height: 4),
                        Container(
                          height: 40,
                          padding: const EdgeInsets.symmetric(horizontal: 10),
                          decoration: BoxDecoration(
                            color: AppTheme.bgBodyOf(context),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppTheme.cardBorderOf(context)),
                          ),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              value: _yVehicleTypeFilter,
                              isExpanded: true,
                              hint: Text('Barchasi', style: TextStyle(fontSize: 13, color: AppTheme.textHintOf(context))),
                              style: TextStyle(fontSize: 13, color: AppTheme.textPrimaryOf(context)),
                              items: ['Tentli', 'Ref', 'Bortli', 'Fura', 'Kamaz', 'MAN', 'HOWO', 'Isuzu', 'Gazel', 'Samosval']
                                  .map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
                              onChanged: (v) => setState(() => _yVehicleTypeFilter = v),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ]),
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: TextButton.icon(
                    onPressed: () { _yFromController.clear(); _yToController.clear(); setState(() => _yVehicleTypeFilter = null); },
                    icon: const Icon(Icons.clear_all, size: 18),
                    label: const Text('Tozalash'),
                    style: TextButton.styleFrom(foregroundColor: AppTheme.textSecondaryOf(context)),
                  ),
                ),
              ],
            ),
          ),

        Expanded(
          child: nearbyState.isLoading
              ? Center(child: CircularProgressIndicator(color: AppTheme.primary, strokeWidth: 2.5))
              : orders.isEmpty
                  ? _EmptyState(
                      icon: Icons.location_off_outlined,
                      message: nearbyState.error ?? "Yaqinda yuklar yo'q\n(GPS yoqing va 100km radiusda qidiring)",
                    )
                  : RefreshIndicator(
                      color: AppTheme.primary,
                      onRefresh: () async => ref.read(nearbyOrdersProvider.notifier).loadOrders(),
                      child: ListView.separated(
                        key: const PageStorageKey<String>('driver_nearby_list'),
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                        itemCount: orders.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (context, index) {
                          final order = orders[index];
                          final dist = order['distance'] as int?;
                          return Stack(
                            children: [
                              _OrderCard(order: order),
                              if (dist != null)
                                Positioned(
                                  top: 8,
                                  right: 8,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: AppTheme.accent.withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: AppTheme.accent.withValues(alpha: 0.3)),
                                    ),
                                    child: Text(
                                      '${dist}km',
                                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.accent),
                                    ),
                                  ),
                                ),
                            ],
                          );
                        },
                      ),
                    ),
        ),
      ],
    );
  }
}

// ============================================================
// DISPETCHER AD CARD
// ============================================================

class _DispatcherAdCard extends ConsumerWidget {
  final Map<String, dynamic> ad;
  final VoidCallback onChat;

  const _DispatcherAdCard({required this.ad, required this.onChat});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final from = ad['cargoFrom'] as String? ?? '';
    final to = ad['cargoTo'] as String? ?? '';
    final vehicle = ad['vehicleType'] as String? ?? '';
    final weight = ad['cargoWeight'] as String? ?? '';
    final rawPrice = ad['price'];
    final price = rawPrice != null ? rawPrice.toString() : '';
    final phone = ad['phone'] as String? ?? '';
    final dispatcher = ad['dispatcherName'] as String? ?? 'Dispetcher';
    final content = ad['content'] as String? ?? '';
    final createdAt = ad['createdAt'] as String?;
    final dispatcherId = ad['dispatcherId'] as String? ?? '';
    final rating = (ad['rating'] as num?)?.toDouble() ?? 0;
    final ratingCount = ad['ratingCount'] as int? ?? 0;

    return Container(
      decoration: BoxDecoration(
        color: AppTheme.cardBgOf(context),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.dividerOf(context)),
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Dispetcher nomi + vaqt
          Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: AppTheme.primary.withValues(alpha: 0.1),
                child: Text(
                  dispatcher.isNotEmpty ? dispatcher[0].toUpperCase() : 'D',
                  style: const TextStyle(
                    color: AppTheme.primary,
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      dispatcher,
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                        color: AppTheme.textPrimaryOf(context),
                      ),
                    ),
                    if (rating > 0)
                      RatingStars(rating: rating, count: ratingCount, size: 12),
                  ],
                ),
              ),
              if (createdAt != null)
                Text(
                  _timeAgoShort(createdAt),
                  style: TextStyle(fontSize: 11, color: AppTheme.textHintOf(context)),
                ),
            ],
          ),
          const SizedBox(height: 10),

          // Marshrut A → B
          if (from.isNotEmpty || to.isNotEmpty)
            Row(
              children: [
                Container(width: 8, height: 8, decoration: BoxDecoration(color: AppTheme.primary, shape: BoxShape.circle)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '$from → $to',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppTheme.textPrimaryOf(context)),
                  ),
                ),
              ],
            ),

          if (content.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              content,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(fontSize: 13, color: AppTheme.textSecondaryOf(context)),
            ),
          ],

          const SizedBox(height: 10),

          // Info chips
          if (vehicle.isNotEmpty || weight.isNotEmpty || price.isNotEmpty || phone.isNotEmpty)
            Wrap(
              spacing: 6,
              runSpacing: 4,
              children: [
                if (vehicle.isNotEmpty)
                  _InfoChip(icon: Icons.local_shipping_outlined, text: vehicle),
                if (weight.isNotEmpty)
                  _InfoChip(icon: Icons.fitness_center, text: '${weight}t'),
                if (price.isNotEmpty)
                  _InfoChip(icon: Icons.payments_outlined, text: price),
                if (phone.isNotEmpty)
                  _InfoChip(icon: Icons.phone_outlined, text: phone),
              ],
            ),

          const SizedBox(height: 10),

          // Tugmalar
          Row(
            children: [
              // Baholash
              SizedBox(
                height: 34,
                child: OutlinedButton.icon(
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (_) => RatingDialog(
                        userName: dispatcher,
                        onRate: (score, comment) async {
                          try {
                            final api = ref.read(apiClientProvider);
                            await api.post(ApiConfig.rateUser, data: {
                              'toUserId': dispatcherId,
                              'score': score,
                              'comment': comment,
                            });
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Baholandi!'), backgroundColor: AppTheme.successColor),
                              );
                            }
                          } catch (_) {}
                        },
                      ),
                    );
                  },
                  icon: const Icon(Icons.star_outline_rounded, size: 16),
                  label: const Text('Baho', style: TextStyle(fontSize: 12)),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFFF59E0B),
                    side: const BorderSide(color: Color(0xFFF59E0B)),
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
              const SizedBox(width: 6),
              // Qo'ng'iroq tugma (telefon raqam bo'lsa)
              if (phone.isNotEmpty)
                SizedBox(
                  height: 34,
                  child: OutlinedButton.icon(
                    onPressed: () => launchUrl(Uri.parse('tel:$phone')),
                    icon: const Icon(Icons.phone_outlined, size: 16),
                    label: const Text('Aloqa', style: TextStyle(fontSize: 12)),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.successColor,
                      side: const BorderSide(color: AppTheme.successColor),
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),
              if (phone.isNotEmpty)
                const SizedBox(width: 6),
              // Chat tugma
              SizedBox(
                height: 34,
                child: ElevatedButton.icon(
                  onPressed: onChat,
                  icon: const Icon(Icons.chat_outlined, size: 16),
                  label: const Text('Yozish', style: TextStyle(fontSize: 13)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _timeAgoShort(String iso) {
    try {
      final d = DateTime.parse(iso);
      final diff = DateTime.now().difference(d);
      if (diff.inMinutes < 1) return 'hozirgina';
      if (diff.inMinutes < 60) return '${diff.inMinutes}d';
      if (diff.inHours < 24) return '${diff.inHours}s';
      return '${diff.inDays}k';
    } catch (_) {
      return '';
    }
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String text;
  final bool highlight;

  const _InfoChip({required this.icon, required this.text, this.highlight = false});

  @override
  Widget build(BuildContext context) {
    final color = highlight ? AppTheme.primary : AppTheme.textSecondaryOf(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: highlight
            ? AppTheme.primary.withValues(alpha: 0.06)
            : AppTheme.bgBodyOf(context),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 4),
          Text(text, style: TextStyle(fontSize: 11, fontWeight: highlight ? FontWeight.w600 : FontWeight.w400, color: color)),
        ],
      ),
    );
  }
}

// ============================================================
// (Eski TelegramOrdersTab — endi ishlatilmaydi)
// ============================================================

class _TelegramOrdersTab extends StatelessWidget {
  final List<Map<String, dynamic>> orders;
  final bool isLoading;
  final bool nearMe;
  final String? scopeFilter;
  final String? typeFilter;
  final ValueChanged<bool> onNearMeChanged;
  final ValueChanged<String?> onScopeChanged;
  final ValueChanged<String?> onTypeChanged;
  final VoidCallback onRefresh;

  const _TelegramOrdersTab({
    required this.orders,
    required this.isLoading,
    required this.nearMe,
    required this.scopeFilter,
    required this.typeFilter,
    required this.onNearMeChanged,
    required this.onScopeChanged,
    required this.onTypeChanged,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    var filteredOrders = scopeFilter == null
        ? orders
        : orders.where((o) => o['scope'] == scopeFilter).toList();

    return Column(
      children: [
        // Filter bar
        _FilterBar(
          nearMe: nearMe,
          scopeFilter: scopeFilter,
          typeFilter: typeFilter,
          onNearMeChanged: onNearMeChanged,
          onScopeChanged: onScopeChanged,
          onTypeChanged: onTypeChanged,
          onRefresh: onRefresh,
        ),
        // Orders list
        Expanded(
          child: isLoading
              ? const Center(
                  child: CircularProgressIndicator(
                    color: AppTheme.driverPrimary,
                    strokeWidth: 2.5,
                  ),
                )
              : filteredOrders.isEmpty
                  ? _EmptyState(
                      icon: Icons.inbox_outlined,
                      message: 'Hozircha yuklar yo\'q',
                    )
                  : RefreshIndicator(
                      color: AppTheme.driverPrimary,
                      onRefresh: () async => onRefresh(),
                      child: ListView.separated(
                        key: const PageStorageKey<String>('driver_telegram_orders_tab_list'),
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                        itemCount: filteredOrders.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (context, index) =>
                            _OrderCard(order: filteredOrders[index]),
                      ),
                    ),
        ),
      ],
    );
  }
}

// ============================================================
// FILTER BAR
// ============================================================

class _FilterBar extends StatelessWidget {
  final bool nearMe;
  final String? scopeFilter;
  final String? typeFilter;
  final ValueChanged<bool> onNearMeChanged;
  final ValueChanged<String?> onScopeChanged;
  final ValueChanged<String?> onTypeChanged;
  final VoidCallback onRefresh;

  const _FilterBar({
    required this.nearMe,
    required this.scopeFilter,
    required this.typeFilter,
    required this.onNearMeChanged,
    required this.onScopeChanged,
    required this.onTypeChanged,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 10, 8, 10),
      color: AppTheme.cardBgOf(context),
      child: Row(
        children: [
          // NearMe toggle
          _NearMeChip(
            isActive: nearMe,
            onTap: () => onNearMeChanged(!nearMe),
          ),
          const SizedBox(width: 8),
          // Scope filter chips
          Expanded(
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _ScopeChip(label: 'Barchasi', value: null, selected: scopeFilter, onTap: onScopeChanged),
                  const SizedBox(width: 6),
                  _ScopeChip(label: 'Ichki', value: 'INTERNAL', selected: scopeFilter, onTap: onScopeChanged),
                  const SizedBox(width: 6),
                  _ScopeChip(label: 'Import', value: 'IMPORT', selected: scopeFilter, onTap: onScopeChanged),
                  const SizedBox(width: 6),
                  _ScopeChip(label: 'Eksport', value: 'EXPORT', selected: scopeFilter, onTap: onScopeChanged),
                ],
              ),
            ),
          ),
          // Refresh
          SizedBox(
            width: 36,
            height: 36,
            child: IconButton(
              icon: const Icon(Icons.refresh_outlined, size: 20),
              color: AppTheme.textSecondaryOf(context),
              padding: EdgeInsets.zero,
              onPressed: onRefresh,
            ),
          ),
        ],
      ),
    );
  }
}

class _NearMeChip extends StatelessWidget {
  final bool isActive;
  final VoidCallback onTap;

  const _NearMeChip({required this.isActive, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isActive
              ? AppTheme.driverPrimary.withValues(alpha: 0.1)
              : AppTheme.bgBodyOf(context),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isActive ? AppTheme.driverPrimary : AppTheme.dividerOf(context),
            width: 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.near_me_outlined,
              size: 14,
              color: isActive ? AppTheme.driverPrimary : AppTheme.textHintOf(context),
            ),
            const SizedBox(width: 4),
            Text(
              'Yaqin',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: isActive ? AppTheme.driverPrimary : AppTheme.textSecondaryOf(context),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ScopeChip extends StatelessWidget {
  final String label;
  final String? value;
  final String? selected;
  final ValueChanged<String?> onTap;

  const _ScopeChip({
    required this.label,
    required this.value,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isSelected = selected == value;
    return GestureDetector(
      onTap: () => onTap(value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected
              ? AppTheme.driverPrimary
              : AppTheme.bgBodyOf(context),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? AppTheme.driverPrimary : AppTheme.dividerOf(context),
            width: 1,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
            color: isSelected ? Colors.white : AppTheme.textSecondaryOf(context),
          ),
        ),
      ),
    );
  }
}

// ============================================================
// ORDER CARD — Full info with tap to open detail
// ============================================================

class _OrderCard extends ConsumerWidget {
  final Map<String, dynamic> order;

  const _OrderCard({required this.order});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final from = order['cargoFrom'] ?? '\u2014';
    final to = order['cargoTo'] ?? '\u2014';
    final isCargo = order['type'] == 'CARGO';
    final isAdditionalCargo = order['isAdditionalCargo'] == true;
    final typeLabel = isAdditionalCargo ? "Qo'shimcha" : (isCargo ? 'Yuk' : 'Haydovchi');
    final weight = order['cargoWeight'] as String? ?? '';
    final phone = order['phone'] as String? ?? '';
    final price = order['price'] as String? ?? '';
    final vehicle = order['vehicleType'] as String? ?? '';
    final vehicleCapacity = order['vehicleCapacity'] as String? ?? '';
    final sender = order['senderName'] as String? ?? '';
    final scope = order['scope'] as String? ?? 'INTERNAL';
    final messageText = order['messageText'] as String? ?? '';
    final createdAt = order['createdAt'] as String?;
    final groupTitle = order['groupTitle'] as String? ?? '';
    final distance = order['distance'];
    final acceptedById = order['acceptedById'] as String?;
    final isAccepted = acceptedById != null;
    final source = order['_source'] as String? ?? '';

    return GestureDetector(
      onTap: () => _showOrderDetail(context),
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.cardBgOf(context),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppTheme.dividerOf(context), width: 1),
        ),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top row: type badge + scope badge + vehicle badge + time
              Row(
                children: [
                  _TypeBadge(label: typeLabel, isCargo: isCargo, isAdditional: isAdditionalCargo),
                  const SizedBox(width: 6),
                  _ScopeBadge(scope: scope),
                  if (source == 'tg_dispatcher') ...[
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.orange.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.campaign_outlined, size: 12, color: Colors.orange),
                          SizedBox(width: 3),
                          Text('TG Disp', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Colors.orange)),
                        ],
                      ),
                    ),
                  ],
                  if (vehicle.isNotEmpty) ...[
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppTheme.textSecondaryOf(context).withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.local_shipping_outlined, size: 12, color: AppTheme.textSecondaryOf(context)),
                          const SizedBox(width: 3),
                          Text(
                            vehicleCapacity.isNotEmpty ? '$vehicle $vehicleCapacity' : vehicle,
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: AppTheme.textSecondaryOf(context)),
                          ),
                        ],
                      ),
                    ),
                  ],
                  const Spacer(),
                  if (createdAt != null)
                    Text(
                      _timeAgo(createdAt),
                      style: TextStyle(
                        fontSize: 11,
                        color: AppTheme.textHintOf(context),
                      ),
                    ),
                ],
              ),

              const SizedBox(height: 10),

              // Route: FROM → TO with dots
              Row(
                children: [
                  // A dot (primary)
                  Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      color: AppTheme.driverPrimary,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      from,
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.textPrimaryOf(context),
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              // Dotted line
              Padding(
                padding: const EdgeInsets.only(left: 4),
                child: Column(
                  children: List.generate(2, (_) => Container(
                    width: 2,
                    height: 4,
                    margin: const EdgeInsets.symmetric(vertical: 1),
                    decoration: BoxDecoration(
                      color: AppTheme.textHintOf(context).withValues(alpha: 0.4),
                      borderRadius: BorderRadius.circular(1),
                    ),
                  )),
                ),
              ),
              Row(
                children: [
                  // B dot (accent)
                  Container(
                    width: 10,
                    height: 10,
                    decoration: const BoxDecoration(
                      color: AppTheme.accent,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      to,
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.textPrimaryOf(context),
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  if (distance != null && distance > 0)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppTheme.textHintOf(context).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        '$distance km',
                        style: TextStyle(
                          fontSize: 11,
                          color: AppTheme.textSecondaryOf(context),
                        ),
                      ),
                    ),
                ],
              ),

              const SizedBox(height: 10),

              // Info chips row
              Wrap(
                spacing: 10,
                runSpacing: 6,
                children: [
                  if (weight.isNotEmpty)
                    _InfoChip(icon: Icons.scale_outlined, text: weight),
                  if (price.isNotEmpty)
                    _InfoChip(
                      icon: Icons.payments_outlined,
                      text: price,
                    ),
                  if (phone.isNotEmpty)
                    _InfoChip(
                      icon: Icons.phone_outlined,
                      text: phone,
                    ),
                ],
              ),

              // Message text preview (max 2 lines)
              if (messageText.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(
                  messageText.replaceAll(RegExp(r'\s+'), ' ').trim(),
                  style: TextStyle(
                    fontSize: 12.5,
                    color: AppTheme.textSecondaryOf(context),
                    height: 1.4,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],

              // Bottom: sender + group + phone actions
              const SizedBox(height: 10),
              Divider(height: 1, color: AppTheme.dividerOf(context)),
              const SizedBox(height: 10),
              Row(
                children: [
                  // Sender info
                  if (sender.isNotEmpty) ...[
                    Icon(Icons.person_outlined, size: 14, color: AppTheme.textHintOf(context)),
                    const SizedBox(width: 4),
                    Flexible(
                      child: Text(
                        sender,
                        style: TextStyle(
                          fontSize: 12,
                          color: AppTheme.textSecondaryOf(context),
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                  if (groupTitle.isNotEmpty && sender.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 6),
                      child: Text(
                        '\u2022',
                        style: TextStyle(
                          fontSize: 10,
                          color: AppTheme.textHintOf(context),
                        ),
                      ),
                    ),
                  if (groupTitle.isNotEmpty)
                    Flexible(
                      child: Text(
                        groupTitle,
                        style: TextStyle(
                          fontSize: 11,
                          color: AppTheme.textHintOf(context),
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  const Spacer(),
                  // Accept button (only if not already accepted)
                  if (!isAccepted)
                    _ActionButton(
                      icon: Icons.check_circle_outline,
                      label: 'Qabul',
                      color: AppTheme.driverPrimary,
                      onTap: () => _handleAccept(context, ref),
                    ),
                  // Already accepted badge
                  if (isAccepted)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.textHintOf(context).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'Qabul qilingan',
                        style: TextStyle(
                          fontSize: 11,
                          color: AppTheme.textHintOf(context),
                        ),
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _handleAccept(BuildContext context, WidgetRef ref) async {
    final profileState = ref.read(driverProfileProvider);
    final profile = profileState.profile;

    // Local subscription check
    if (profile != null && !profile.subscriptionActive) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Obuna faollashtirilmagan. Avval obunani faollashtiring.'),
          backgroundColor: AppTheme.warningColor,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          action: SnackBarAction(
            label: 'Obuna',
            textColor: Colors.white,
            onPressed: () => context.push('/subscribe'),
          ),
        ),
      );
      return;
    }

    // Confirm dialog
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Zakazni qabul qilish'),
        content: const Text('Bu zakazni qabul qilmoqchimisiz?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text("Yo'q"),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: AppTheme.driverPrimary),
            child: const Text('Ha, qabul'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    final orderId = order['id'] as String;
    final error = await ref.read(driverAcceptedProvider.notifier).acceptOrder(orderId);

    if (!context.mounted) return;

    if (error == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Zakaz qabul qilindi!'),
          backgroundColor: AppTheme.successColor,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
      );
      // Reload orders to reflect changes
      ref.read(driverOrdersProvider.notifier).loadOrders();
    } else if (error == 'subscription') {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Obuna faollashtirilmagan'),
          backgroundColor: AppTheme.warningColor,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          action: SnackBarAction(
            label: 'Obuna',
            textColor: Colors.white,
            onPressed: () => context.push('/subscribe'),
          ),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error),
          backgroundColor: AppTheme.errorColor,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
      );
    }
  }

  void _showOrderDetail(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _OrderDetailSheet(order: order),
    );
  }
}

// ============================================================
// ORDER DETAIL BOTTOM SHEET
// ============================================================

class _OrderDetailSheet extends StatelessWidget {
  final Map<String, dynamic> order;

  const _OrderDetailSheet({required this.order});

  @override
  Widget build(BuildContext context) {
    final from = order['cargoFrom'] ?? '\u2014';
    final to = order['cargoTo'] ?? '\u2014';
    final isCargo = order['type'] == 'CARGO';
    final isAdditionalCargo = order['isAdditionalCargo'] == true;
    final typeLabel = isAdditionalCargo ? "Qo'shimcha yuk" : (isCargo ? 'Yuk' : 'Haydovchi');
    final weight = order['cargoWeight'] as String? ?? '';
    final phone = order['phone'] as String? ?? '';
    final price = order['price'] as String? ?? '';
    final vehicle = order['vehicleType'] as String? ?? '';
    final vehicleCapacity = order['vehicleCapacity'] as String? ?? '';
    final sender = order['senderName'] as String? ?? '';
    final senderUsername = order['senderUsername'] as String? ?? '';
    final scope = order['scope'] as String? ?? 'INTERNAL';
    final messageText = order['messageText'] as String? ?? '';
    final createdAt = order['createdAt'] as String?;
    final groupTitle = order['groupTitle'] as String? ?? '';
    final distance = order['distance'];
    final cargoType = order['cargoType'] as String? ?? '';
    final senderTodayAds = order['senderTodayAds'] ?? 0;
    final senderTotalAds = order['senderTotalAds'] ?? 0;
    final senderPhone = order['senderPhone'] as String? ?? '';

    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (context, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: AppTheme.cardBgOf(context),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              // Handle
              Padding(
                padding: const EdgeInsets.only(top: 10, bottom: 4),
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppTheme.textHintOf(context).withValues(alpha: 0.3),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              // Header
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
                child: Row(
                  children: [
                    _TypeBadge(label: typeLabel, isCargo: isCargo, isAdditional: isAdditionalCargo),
                    const SizedBox(width: 8),
                    _ScopeBadge(scope: scope),
                    const Spacer(),
                    if (createdAt != null)
                      Text(
                        _formatDateTime(createdAt),
                        style: TextStyle(
                          fontSize: 12,
                          color: AppTheme.textHintOf(context),
                        ),
                      ),
                  ],
                ),
              ),
              Divider(height: 1, color: AppTheme.dividerOf(context)),

              // Scrollable content
              Expanded(
                child: SingleChildScrollView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Route card
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppTheme.bgBodyOf(context),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 12,
                                  height: 12,
                                  decoration: const BoxDecoration(
                                    color: AppTheme.driverPrimary,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    from,
                                    style: TextStyle(
                                      fontSize: 17,
                                      fontWeight: FontWeight.w600,
                                      color: AppTheme.textPrimaryOf(context),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            Padding(
                              padding: const EdgeInsets.only(left: 5),
                              child: Column(
                                children: List.generate(3, (_) => Container(
                                  width: 2,
                                  height: 5,
                                  margin: const EdgeInsets.symmetric(vertical: 1.5),
                                  decoration: BoxDecoration(
                                    color: AppTheme.textHintOf(context).withValues(alpha: 0.3),
                                    borderRadius: BorderRadius.circular(1),
                                  ),
                                )),
                              ),
                            ),
                            Row(
                              children: [
                                Container(
                                  width: 12,
                                  height: 12,
                                  decoration: const BoxDecoration(
                                    color: AppTheme.accent,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    to,
                                    style: TextStyle(
                                      fontSize: 17,
                                      fontWeight: FontWeight.w600,
                                      color: AppTheme.textPrimaryOf(context),
                                    ),
                                  ),
                                ),
                                if (distance != null && distance > 0)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: AppTheme.driverPrimary.withValues(alpha: 0.08),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      '$distance km',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w500,
                                        color: AppTheme.driverPrimary,
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Details grid
                      Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        children: [
                          if (vehicle.isNotEmpty)
                            _DetailTile(
                              icon: Icons.local_shipping_outlined,
                              label: 'Mashina',
                              value: vehicleCapacity.isNotEmpty
                                  ? '$vehicle ($vehicleCapacity)'
                                  : vehicle,
                            ),
                          if (weight.isNotEmpty)
                            _DetailTile(
                              icon: Icons.scale_outlined,
                              label: 'Og\'irlik',
                              value: weight,
                            ),
                          if (cargoType.isNotEmpty)
                            _DetailTile(
                              icon: Icons.inventory_2_outlined,
                              label: 'Yuk turi',
                              value: cargoType,
                            ),
                          if (price.isNotEmpty)
                            _DetailTile(
                              icon: Icons.payments_outlined,
                              label: 'Narx',
                              value: price,
                                                          ),
                        ],
                      ),

                      // Full message text
                      if (messageText.isNotEmpty) ...[
                        const SizedBox(height: 16),
                        Text(
                          'Xabar matni',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.textPrimaryOf(context),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: AppTheme.bgBodyOf(context),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: SelectableText(
                            messageText,
                            style: TextStyle(
                              fontSize: 13.5,
                              color: AppTheme.textPrimaryOf(context),
                              height: 1.5,
                            ),
                          ),
                        ),
                      ],

                      // Sender info
                      const SizedBox(height: 16),
                      Text(
                        'Yuboruvchi',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.textPrimaryOf(context),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppTheme.bgBodyOf(context),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (sender.isNotEmpty)
                              _SenderRow(icon: Icons.person_outlined, text: sender),
                            if (senderUsername.isNotEmpty) ...[
                              const SizedBox(height: 6),
                              _SenderRow(icon: Icons.alternate_email, text: '@$senderUsername'),
                            ],
                            if (groupTitle.isNotEmpty) ...[
                              const SizedBox(height: 6),
                              _SenderRow(icon: Icons.group_outlined, text: groupTitle),
                            ],
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                _StatChip(
                                  label: 'Bugun',
                                  value: '$senderTodayAds ta e\'lon',
                                ),
                                const SizedBox(width: 8),
                                _StatChip(
                                  label: 'Jami',
                                  value: '$senderTotalAds ta e\'lon',
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Bottom info — telefon raqam
              Container(
                padding: EdgeInsets.fromLTRB(20, 12, 20, MediaQuery.of(context).padding.bottom + 12),
                decoration: BoxDecoration(
                  color: AppTheme.cardBgOf(context),
                  border: Border(
                    top: BorderSide(color: AppTheme.dividerOf(context), width: 0.5),
                  ),
                ),
                child: Row(
                  children: [
                    if (phone.isNotEmpty || senderPhone.isNotEmpty)
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppTheme.driverPrimary.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.phone_outlined, size: 18, color: AppTheme.driverPrimary),
                              const SizedBox(width: 8),
                              SelectableText(
                                phone.isNotEmpty ? phone : senderPhone,
                                style: const TextStyle(
                                  fontSize: 15,
                                  color: AppTheme.driverPrimary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    if (phone.isEmpty && senderPhone.isEmpty)
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppTheme.warningColor.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.lock_outlined, size: 16, color: AppTheme.warningColor),
                              const SizedBox(width: 8),
                              const Text(
                                'Telefon raqam topilmadi',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: AppTheme.warningColor,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  String _formatDateTime(String iso) {
    try {
      final dt = DateTime.parse(iso).toLocal();
      final months = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'];
      return '${dt.day} ${months[dt.month - 1]}, ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return '';
    }
  }
}

// ============================================================
// BADGES & CHIPS
// ============================================================

class _TypeBadge extends StatelessWidget {
  final String label;
  final bool isCargo;
  final bool isAdditional;

  const _TypeBadge({required this.label, required this.isCargo, this.isAdditional = false});

  @override
  Widget build(BuildContext context) {
    final color = isAdditional ? AppTheme.warningColor : (isCargo ? AppTheme.accentBlue : AppTheme.driverPrimary);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w500,
          color: color,
        ),
      ),
    );
  }
}

class _ScopeBadge extends StatelessWidget {
  final String scope;

  const _ScopeBadge({required this.scope});

  @override
  Widget build(BuildContext context) {
    Color color;
    String label;
    switch (scope) {
      case 'IMPORT':
        color = AppTheme.successColor;
        label = 'Import';
        break;
      case 'EXPORT':
        color = AppTheme.warningColor;
        label = 'Eksport';
        break;
      default:
        color = AppTheme.infoColor;
        label = 'Ichki';
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w500,
          color: color,
        ),
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: color),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ============================================================
// DETAIL SHEET HELPERS
// ============================================================

class _DetailTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final bool highlight;

  const _DetailTile({
    required this.icon,
    required this.label,
    required this.value,
    this.highlight = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: highlight
            ? AppTheme.driverPrimary.withValues(alpha: 0.06)
            : AppTheme.bgBodyOf(context),
        borderRadius: BorderRadius.circular(10),
        border: highlight
            ? Border.all(color: AppTheme.driverPrimary.withValues(alpha: 0.15))
            : null,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 16,
            color: highlight ? AppTheme.driverPrimary : AppTheme.textHintOf(context),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 10,
                  color: AppTheme.textHintOf(context),
                ),
              ),
              Text(
                value,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: highlight
                      ? AppTheme.driverPrimary
                      : AppTheme.textPrimaryOf(context),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SenderRow extends StatelessWidget {
  final IconData icon;
  final String text;

  const _SenderRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 14, color: AppTheme.textHintOf(context)),
        const SizedBox(width: 6),
        Expanded(
          child: Text(
            text,
            style: TextStyle(
              fontSize: 13,
              color: AppTheme.textSecondaryOf(context),
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}

class _StatChip extends StatelessWidget {
  final String label;
  final String value;

  const _StatChip({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppTheme.driverPrimary.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        '$label: $value',
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w500,
          color: AppTheme.driverPrimary,
        ),
      ),
    );
  }
}

class _BottomAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _BottomAction({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 46,
      child: OutlinedButton.icon(
        onPressed: onTap,
        icon: Icon(icon, size: 16),
        label: Text(
          label,
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
        ),
        style: OutlinedButton.styleFrom(
          foregroundColor: color,
          side: BorderSide(color: color.withValues(alpha: 0.3)),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }
}

// ============================================================
// PRIVATE ORDERS TAB
// ============================================================

class _PrivateOrdersTab extends StatelessWidget {
  final List orders;
  final bool isLoading;
  final Future<bool> Function(String) onAccept;
  final Function(String) onReject;
  final VoidCallback onRefresh;

  const _PrivateOrdersTab({
    required this.orders,
    required this.isLoading,
    required this.onAccept,
    required this.onReject,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Center(
        child: CircularProgressIndicator(
          color: AppTheme.driverPrimary,
          strokeWidth: 2.5,
        ),
      );
    }

    if (orders.isEmpty) {
      return _EmptyState(
        icon: Icons.assignment_outlined,
        message: 'Maxsus buyurtmalar yo\'q',
      );
    }

    return RefreshIndicator(
      color: AppTheme.driverPrimary,
      onRefresh: () async => onRefresh(),
      child: ListView.separated(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        itemCount: orders.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (context, index) {
          final order = orders[index] as PrivateOrder;
          return _PrivateOrderCard(
            order: order,
            onAccept: () async {
              final success = await onAccept(order.id);
              if (!success && context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: const Text('Balans yetarli emas'),
                    backgroundColor: AppTheme.errorColor,
                    behavior: SnackBarBehavior.floating,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                );
              }
            },
            onReject: () => onReject(order.id),
          );
        },
      ),
    );
  }
}

class _PrivateOrderCard extends StatelessWidget {
  final PrivateOrder order;
  final VoidCallback onAccept;
  final VoidCallback onReject;

  const _PrivateOrderCard({
    required this.order,
    required this.onAccept,
    required this.onReject,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.cardBgOf(context),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.dividerOf(context), width: 1),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Route with dots
            Row(
              children: [
                Container(
                  width: 10,
                  height: 10,
                  decoration: const BoxDecoration(
                    color: AppTheme.driverPrimary,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    order.fromCity,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textPrimaryOf(context),
                    ),
                  ),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.only(left: 4),
              child: Column(
                children: List.generate(2, (_) => Container(
                  width: 2,
                  height: 4,
                  margin: const EdgeInsets.symmetric(vertical: 1),
                  decoration: BoxDecoration(
                    color: AppTheme.textHintOf(context).withValues(alpha: 0.4),
                    borderRadius: BorderRadius.circular(1),
                  ),
                )),
              ),
            ),
            Row(
              children: [
                Container(
                  width: 10,
                  height: 10,
                  decoration: const BoxDecoration(
                    color: AppTheme.accent,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    order.toCity,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textPrimaryOf(context),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Details
            Wrap(
              spacing: 10,
              runSpacing: 6,
              children: [
                if (order.cargoType != null && order.cargoType!.isNotEmpty)
                  _InfoChip(icon: Icons.inventory_2_outlined, text: order.cargoType!),
                if (order.cargoWeight != null && order.cargoWeight!.isNotEmpty)
                  _InfoChip(icon: Icons.scale_outlined, text: order.cargoWeight!),
                if (order.price != null && order.price!.isNotEmpty)
                  _InfoChip(icon: Icons.payments_outlined, text: order.price!, highlight: true),
              ],
            ),

            // Commission
            if (order.commissionAmount > 0) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.warningColor.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  'Komissiya: ${order.commissionAmount.toStringAsFixed(0)} UZS',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: AppTheme.warningColor,
                  ),
                ),
              ),
            ],

            // Description
            if (order.description != null && order.description!.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                order.description!,
                style: TextStyle(
                  fontSize: 13,
                  color: AppTheme.textSecondaryOf(context),
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],

            const SizedBox(height: 12),
            Divider(height: 1, color: AppTheme.dividerOf(context)),
            const SizedBox(height: 12),

            // Action buttons
            Row(
              children: [
                Expanded(
                  child: SizedBox(
                    height: 42,
                    child: OutlinedButton(
                      onPressed: onReject,
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.errorColor,
                        side: const BorderSide(color: AppTheme.errorColor, width: 1),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        padding: EdgeInsets.zero,
                      ),
                      child: const Text(
                        'Rad etish',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  flex: 2,
                  child: SizedBox(
                    height: 42,
                    child: ElevatedButton.icon(
                      onPressed: onAccept,
                      icon: const Icon(Icons.check_circle_outline, size: 18),
                      label: const Text(
                        'Qabul qilish',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.driverPrimary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        padding: EdgeInsets.zero,
                      ),
                    ),
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

// ============================================================
// EMPTY STATE
// ============================================================

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String message;

  const _EmptyState({required this.icon, required this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48, color: AppTheme.textHintOf(context).withValues(alpha: 0.5)),
            const SizedBox(height: 12),
            Text(
              message,
              style: TextStyle(
                fontSize: 14,
                color: AppTheme.textHintOf(context),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

// ============================================================
// TIME AGO HELPER (top-level for use by _OrderCard)
// ============================================================

String _timeAgo(String iso) {
  try {
    final dt = DateTime.parse(iso);
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 1) return 'hozirgina';
    if (diff.inMinutes < 60) return '${diff.inMinutes} daq';
    if (diff.inHours < 24) return '${diff.inHours} soat';
    if (diff.inDays < 7) return '${diff.inDays} kun';
    return '${dt.day}.${dt.month.toString().padLeft(2, '0')}';
  } catch (_) {
    return '';
  }
}
