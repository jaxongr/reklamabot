import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../config/api_config.dart';
import '../../config/silk_theme.dart';
import '../../core/api/api_client.dart';

/// Dispetcher e'loni uchun mos haydovchilar ekrani.
/// 3 manba: App haydovchilar (GPS), Taklif haydovchilari, Telegram haydovchilari.
class MatchingDriversScreen extends ConsumerStatefulWidget {
  final String adId;

  const MatchingDriversScreen({super.key, required this.adId});

  @override
  ConsumerState<MatchingDriversScreen> createState() => _MatchingDriversScreenState();
}

class _MatchingDriversScreenState extends ConsumerState<MatchingDriversScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  Map<String, dynamic>? _data;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final api = ref.read(apiClientProvider);
      final response = await api.get(ApiConfig.matchDriversForAd(widget.adId));
      setState(() {
        _data = response.data as Map<String, dynamic>;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  List<Tab> _buildTabs() {
    final appCount  = (_data?['appDrivers']      as List?)?.length ?? 0;
    final offCount  = (_data?['offerDrivers']     as List?)?.length ?? 0;
    final tgCount   = (_data?['telegramDrivers']  as List?)?.length ?? 0;
    final allCount  = (_data?['total'] as num?)?.toInt() ?? 0;
    return [
      Tab(text: 'Hammasi ($allCount)'),
      Tab(text: 'App ($appCount)'),
      Tab(text: 'Taklif ($offCount)'),
      Tab(text: 'TG ($tgCount)'),
    ];
  }

  @override
  Widget build(BuildContext context) {
    final hasData = !_isLoading && _error == null && _data != null;

    return Scaffold(
      backgroundColor: SilkTheme.bgOf(context),
      appBar: AppBar(
        backgroundColor: SilkTheme.surfaceOf(context),
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Mos Haydovchilar'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, size: 22),
            onPressed: _loadData,
          ),
        ],
        bottom: hasData
            ? TabBar(
                controller: _tabController,
                labelColor: SilkTheme.brand,
                unselectedLabelColor: SilkTheme.mutedOf(context),
                indicatorColor: SilkTheme.brand,
                labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                unselectedLabelStyle: const TextStyle(fontSize: 12),
                tabs: _buildTabs(),
              )
            : null,
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return Center(
        child: CircularProgressIndicator(color: SilkTheme.brand, strokeWidth: 2.5),
      );
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.error_outline, size: 52, color: SilkTheme.danger),
              const SizedBox(height: 12),
              Text(
                'Xatolik yuz berdi',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: SilkTheme.inkOf(context),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                _error!,
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: SilkTheme.mutedOf(context)),
              ),
              const SizedBox(height: 20),
              FilledButton.icon(
                onPressed: _loadData,
                icon: const Icon(Icons.refresh, size: 16),
                label: const Text('Qayta yuklash'),
                style: FilledButton.styleFrom(backgroundColor: SilkTheme.brand),
              ),
            ],
          ),
        ),
      );
    }

    if (_data == null) return const SizedBox.shrink();

    final ad         = _data!['ad'] as Map<String, dynamic>?;
    final all        = (_data!['all']             as List?)?.cast<Map<String, dynamic>>() ?? [];
    final appDrivers = (_data!['appDrivers']      as List?)?.cast<Map<String, dynamic>>() ?? [];
    final offDrivers = (_data!['offerDrivers']    as List?)?.cast<Map<String, dynamic>>() ?? [];
    final tgDrivers  = (_data!['telegramDrivers'] as List?)?.cast<Map<String, dynamic>>() ?? [];

    return Column(
      children: [
        if (ad != null) _AdSummaryCard(ad: ad),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: [
              _DriverList(drivers: all,        onRefresh: _loadData),
              _DriverList(drivers: appDrivers, onRefresh: _loadData),
              _DriverList(drivers: offDrivers, onRefresh: _loadData),
              _DriverList(drivers: tgDrivers,  onRefresh: _loadData),
            ],
          ),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Ad summary card at top
// ─────────────────────────────────────────────────────────────────────────────

class _AdSummaryCard extends StatelessWidget {
  final Map<String, dynamic> ad;

  const _AdSummaryCard({required this.ad});

  @override
  Widget build(BuildContext context) {
    final title   = ad['title'] as String? ?? "E'lon";
    final from    = ad['cargoFrom'] as String? ?? '';
    final to      = ad['cargoTo']  as String? ?? '';
    final vehicle = ad['vehicleType'] as String? ?? '';

    return Container(
      margin: const EdgeInsets.fromLTRB(12, 10, 12, 0),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: SilkTheme.surfaceOf(context),
        borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
        border: Border.all(color: SilkTheme.borderOf(context)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: SilkTheme.brand.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(Icons.local_shipping_outlined, color: SilkTheme.brand, size: 20),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: SilkTheme.inkOf(context),
                  ),
                ),
                if (from.isNotEmpty || to.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(
                    '${from.isNotEmpty ? from : '?'} → ${to.isNotEmpty ? to : '?'}',
                    style: TextStyle(fontSize: 12, color: SilkTheme.mutedOf(context)),
                  ),
                ],
                if (vehicle.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(
                    vehicle,
                    style: TextStyle(fontSize: 11, color: SilkTheme.accent, fontWeight: FontWeight.w500),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Driver list (one tab's content)
// ─────────────────────────────────────────────────────────────────────────────

class _DriverList extends StatelessWidget {
  final List<Map<String, dynamic>> drivers;
  final Future<void> Function() onRefresh;

  const _DriverList({required this.drivers, required this.onRefresh});

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: onRefresh,
      color: SilkTheme.brand,
      child: drivers.isEmpty
          ? CustomScrollView(
              // Bo'sh holat ham pull-to-refresh qilsin
              physics: const AlwaysScrollableScrollPhysics(),
              slivers: [
                SliverFillRemaining(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.search_off, size: 52, color: SilkTheme.muted2Of(context)),
                      const SizedBox(height: 12),
                      Text(
                        'Mos haydovchi topilmadi',
                        style: TextStyle(fontSize: 15, color: SilkTheme.mutedOf(context)),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Talab qilingan mashina turiga mos\nhaydovchi hozir mavjud emas',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 12, color: SilkTheme.muted2Of(context)),
                      ),
                    ],
                  ),
                ),
              ],
            )
          : ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(12, 10, 12, 20),
              itemCount: drivers.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, i) => _MatchDriverCard(driver: drivers[i]),
            ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Single driver card
// ─────────────────────────────────────────────────────────────────────────────

class _MatchDriverCard extends StatelessWidget {
  final Map<String, dynamic> driver;

  const _MatchDriverCard({required this.driver});

  @override
  Widget build(BuildContext context) {
    final source      = driver['source'] as String? ?? '';
    final totalScore  = (driver['totalScore'] as num?)?.toInt() ?? 0;
    final vehicleType = driver['vehicleType'] as String? ?? '';
    final vehicleCap  = driver['vehicleCapacity'] as String? ?? '';
    final phone       = driver['phone'] as String? ?? '';

    final isApp      = source == 'APP';
    final isOffer    = source == 'OFFER';
    final isTelegram = source == 'TELEGRAM';

    final name = isApp
        ? (driver['fullName'] as String? ?? 'Haydovchi')
        : isTelegram
            ? (driver['senderName'] as String? ?? 'Haydovchi')
            : 'Haydovchi';

    final fromCity = (driver['fromCity'] as String?) ?? (driver['lastCity'] as String?) ?? '';
    final toCity   = driver['toCity'] as String? ?? '';
    final isOnline = driver['isOnline'] as bool? ?? false;
    final distKm   = driver['distKm'] as num?;

    // Score color
    final scoreColor = totalScore >= 80
        ? SilkTheme.success
        : totalScore >= 55
            ? SilkTheme.accent2
            : SilkTheme.muted;

    // Source styling
    final Color srcColor;
    final IconData srcIcon;
    final String srcLabel;
    if (isApp) {
      srcColor = SilkTheme.brand;
      srcIcon  = Icons.phone_android;
      srcLabel = 'App';
    } else if (isOffer) {
      srcColor = SilkTheme.success;
      srcIcon  = Icons.assignment_outlined;
      srcLabel = 'Taklif';
    } else {
      srcColor = SilkTheme.accent;
      srcIcon  = Icons.send;
      srcLabel = 'Telegram';
    }

    // Vehicle label
    final vehicleLabel = [
      if (driver['vehicleBrand'] != null && (driver['vehicleBrand'] as String).isNotEmpty)
        driver['vehicleBrand'] as String,
      if (vehicleType.isNotEmpty) vehicleType,
    ].join(' ');

    final capacityLabel = vehicleCap.isNotEmpty ? '$vehicleCap t' : '';

    return Container(
      decoration: BoxDecoration(
        color: SilkTheme.surfaceOf(context),
        borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
        border: Border.all(color: SilkTheme.borderOf(context)),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Header: source badge + score + online ──────────────────────
          Row(
            children: [
              _Badge(
                color: srcColor,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(srcIcon, size: 11, color: srcColor),
                    const SizedBox(width: 3),
                    Text(srcLabel, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: srcColor)),
                  ],
                ),
              ),
              const SizedBox(width: 6),
              _Badge(
                color: scoreColor,
                child: Text(
                  '$totalScore%',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: scoreColor),
                ),
              ),
              const Spacer(),
              if (isApp) ...[
                Container(
                  width: 7, height: 7,
                  decoration: BoxDecoration(
                    color: isOnline ? SilkTheme.success : SilkTheme.muted2,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 4),
                Text(
                  isOnline ? 'Online' : 'Offline',
                  style: TextStyle(
                    fontSize: 10,
                    color: isOnline ? SilkTheme.success : SilkTheme.muted2Of(context),
                  ),
                ),
              ],
            ],
          ),

          const SizedBox(height: 9),

          // ── Driver identity ────────────────────────────────────────────
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: SilkTheme.brand.withValues(alpha: 0.1),
                child: Text(
                  name.isNotEmpty ? name[0].toUpperCase() : 'H',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: SilkTheme.brand,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: SilkTheme.inkOf(context),
                      ),
                    ),
                    if (vehicleLabel.isNotEmpty || capacityLabel.isNotEmpty)
                      Text(
                        [vehicleLabel, capacityLabel].where((s) => s.isNotEmpty).join(' · '),
                        style: TextStyle(fontSize: 11, color: SilkTheme.mutedOf(context)),
                      ),
                    if (isApp && (driver['vehicleNumber'] as String? ?? '').isNotEmpty)
                      Text(
                        driver['vehicleNumber'] as String,
                        style: TextStyle(
                          fontSize: 11,
                          color: SilkTheme.muted2Of(context),
                          letterSpacing: 0.5,
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),

          // ── Route / Location ───────────────────────────────────────────
          if (fromCity.isNotEmpty || toCity.isNotEmpty) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.route_outlined, size: 14, color: SilkTheme.muted2Of(context)),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    toCity.isNotEmpty ? '$fromCity → $toCity' : fromCity,
                    style: TextStyle(fontSize: 12, color: SilkTheme.mutedOf(context)),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (distKm != null) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: SilkTheme.accent.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      '${distKm.toInt()} km',
                      style: const TextStyle(
                        fontSize: 11,
                        color: SilkTheme.accent,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ],

          // ── Phone + call button ────────────────────────────────────────
          if (phone.isNotEmpty) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.phone_outlined, size: 14, color: SilkTheme.muted2Of(context)),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    phone,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: SilkTheme.inkOf(context),
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: () => _call(phone),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: SilkTheme.success.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.phone, size: 13, color: SilkTheme.success),
                        SizedBox(width: 4),
                        Text(
                          "Qo'ng'iroq",
                          style: TextStyle(
                            fontSize: 11,
                            color: SilkTheme.success,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ],

          // ── Offer price ────────────────────────────────────────────────
          if (isOffer && (driver['price'] as String? ?? '').isNotEmpty) ...[
            const SizedBox(height: 6),
            Row(
              children: [
                Icon(Icons.payments_outlined, size: 13, color: SilkTheme.muted2Of(context)),
                const SizedBox(width: 6),
                Text(
                  driver['price'] as String,
                  style: TextStyle(
                    fontSize: 12,
                    color: SilkTheme.mutedOf(context),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ],

          // ── Telegram message preview ───────────────────────────────────
          if (isTelegram && (driver['messageText'] as String? ?? '').isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              driver['messageText'] as String,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 11,
                color: SilkTheme.muted2Of(context),
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Future<void> _call(String phone) async {
    final uri = Uri.parse('tel:$phone');
    try {
      await launchUrl(uri);
    } catch (_) {}
  }
}

// ── Helper badge widget ────────────────────────────────────────────────────

class _Badge extends StatelessWidget {
  final Color color;
  final Widget child;

  const _Badge({required this.color, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(5),
      ),
      child: child,
    );
  }
}
