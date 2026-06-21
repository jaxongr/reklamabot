import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../config/api_config.dart';
import '../../config/silk_theme.dart';
import '../../core/api/api_client.dart';
import '../../core/api/websocket_client.dart';
import '../../core/models/order.dart';

import '../../widgets/app_scaffold.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/silk/silk_live_route.dart';
import '../../widgets/silk/silk_tabs.dart';
import '../orders/accepted_orders_provider.dart';
import 'broadcast_progress_provider.dart';

/// Qabul qilinganlar — bottom nav tab screen (Silk Road design).
class AcceptedScreen extends ConsumerStatefulWidget {
  const AcceptedScreen({super.key});

  @override
  ConsumerState<AcceptedScreen> createState() => _AcceptedScreenState();
}

class _AcceptedScreenState extends ConsumerState<AcceptedScreen> {
  String _tab = 'Faol';

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(acceptedOrdersProvider.notifier).loadAccepted();
    });
  }

  Future<void> _onRefresh() async {
    await ref.read(acceptedOrdersProvider.notifier).refresh();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(acceptedOrdersProvider);

    // Broadcast tugaganda orderlarni yangilash (broadcastCount uchun)
    ref.listen(broadcastProgressProvider, (prev, next) {
      if (prev?.status == BroadcastStatus.sending &&
          next.status == BroadcastStatus.completed) {
        ref.read(acceptedOrdersProvider.notifier).loadAccepted();
      }
    });

    return Scaffold(
      backgroundColor: SilkTheme.bgOf(context),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
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
          'Qabul qilinganlar',
          style: SilkTheme.display(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: SilkTheme.inkOf(context),
            letterSpacing: -0.4,
          ),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: SilkSegmentedTabs(
              tabs: const ['Faol', 'Yopilgan', 'Bekor'],
              value: _tab,
              counts: {
                'Faol': state.activeCount,
                'Yopilgan': state.closedCount,
                'Bekor': state.cancelledCount,
              },
              onChanged: (v) => setState(() => _tab = v),
            ),
          ),
        ),
      ),
      body: Column(
        children: [
          // Real-time broadcast progress banner
          _buildProgressBanner(),
          Expanded(
            child: _buildOrderList(state, filter: _tabFilterKey),
          ),
        ],
      ),
    );
  }

  String get _tabFilterKey {
    switch (_tab) {
      case 'Faol':
        return 'faol';
      case 'Yopilgan':
        return 'yopilgan';
      case 'Bekor':
        return 'bekor';
      default:
        return 'faol';
    }
  }

  Widget _buildOrderList(AcceptedOrdersState state, {required String filter}) {
    if (state.isLoading && state.orders.isEmpty) {
      return const ShimmerLoading(itemCount: 4, itemHeight: 200);
    }

    if (state.error != null && state.orders.isEmpty) {
      return ErrorState(
        message: state.error!,
        onRetry: () => ref.read(acceptedOrdersProvider.notifier).loadAccepted(),
      );
    }

    final List<Order> filtered;
    switch (filter) {
      case 'faol':
        filtered = state.orders
            .where((o) =>
                o.acceptedStatus == 'ACCEPTED' ||
                o.acceptedStatus == 'IN_PROGRESS')
            .toList();
        break;
      case 'yopilgan':
        filtered = state.orders
            .where((o) => o.acceptedStatus == 'CLOSED')
            .toList();
        break;
      case 'bekor':
        filtered = state.orders
            .where((o) => o.acceptedStatus == 'CANCELLED')
            .toList();
        break;
      default:
        filtered = [];
    }

    if (filtered.isEmpty && !state.isLoading) {
      final emptyConfig = {
        'faol': {
          'icon': Icons.assignment_outlined,
          'title': 'Faol yuklar yo\'q',
          'subtitle': 'Buyurtmalar sahifasidan yuk qabul qiling',
        },
        'yopilgan': {
          'icon': Icons.check_circle_outline,
          'title': 'Yopilgan yuklar yo\'q',
          'subtitle': 'Hozircha yopilgan bitimlar mavjud emas',
        },
        'bekor': {
          'icon': Icons.cancel_outlined,
          'title': 'Bekor qilingan yuklar yo\'q',
          'subtitle': 'Bekor qilingan buyurtmalar shu yerda ko\'rinadi',
        },
      };
      final cfg = emptyConfig[filter]!;
      return _SilkEmpty(
        icon: cfg['icon'] as IconData,
        title: cfg['title'] as String,
        subtitle: cfg['subtitle'] as String,
      );
    }

    return RefreshIndicator(
      color: SilkTheme.brandOf(context),
      backgroundColor: SilkTheme.surfaceOf(context),
      onRefresh: _onRefresh,
      child: ListView.separated(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
        itemCount: filtered.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final order = filtered[index];
          if (filter == 'faol') {
            return _ActiveOrderCard(
              order: order,
              onTap: () => _showOrderDetail(order),
              onCloseDeal: () => _showCloseDealSheet(order),
              onCancel: () => _confirmCancel(order),
              onCall: order.phone != null ? () => _callPhone(order.phone!) : null,
              onFindDriver: () => _findDriver(order),
              onBlock: () => _confirmBlock(order),
            );
          }
          if (filter == 'bekor') {
            return _CancelledOrderCard(
              order: order,
              onTap: () => _showOrderDetail(order),
            );
          }
          return _ClosedOrderCard(
            order: order,
            onTap: () => _showOrderDetail(order),
          );
        },
      ),
    );
  }

  void _callPhone(String phone) async {
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) {
      launchUrl(uri);
    }
  }

  /// Real-time progress banner widget.
  Widget _buildProgressBanner() {
    final bp = ref.watch(broadcastProgressProvider);
    // Idle + cooldown yo'q = hech narsa ko'rsatmaslik
    if (bp.isIdle && !bp.hasCooldown) return const SizedBox.shrink();

    final isSending = bp.isSending;
    final isCompleted = bp.isCompleted;
    final isError = bp.isError;
    final surface = SilkTheme.surfaceOf(context);
    final border = SilkTheme.borderOf(context);
    final brand = SilkTheme.brandOf(context);
    final accent2 = SilkTheme.accent2Of(context);
    final success = SilkTheme.successOf(context);
    final danger = SilkTheme.dangerOf(context);

    // Idle holat + cooldown bor = faqat cooldown ko'rsatish
    if (bp.isIdle && bp.hasCooldown) {
      return Container(
        margin: const EdgeInsets.fromLTRB(20, 4, 20, 4),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: surface,
          borderRadius: BorderRadius.circular(SilkTheme.radiusLarge),
          border: Border.all(color: border),
        ),
        child: Row(
          children: [
            Icon(Icons.timer_outlined, size: 16, color: accent2),
            const SizedBox(width: 8),
            Text(
              'Keyingi tarqatish: ${bp.cooldownFormatted}',
              style: SilkTheme.body(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: accent2,
              ),
            ),
          ],
        ),
      );
    }

    Color bannerColor;
    IconData bannerIcon;
    String title;

    if (isError) {
      bannerColor = danger;
      bannerIcon = Icons.error_outline;
      title = bp.errorMessage ?? 'Xatolik yuz berdi';
    } else if (isCompleted) {
      bannerColor = success;
      bannerIcon = Icons.check_circle_outline;
      title = 'Tarqatish yakunlandi!';
    } else {
      bannerColor = brand;
      bannerIcon = Icons.send_outlined;
      title = 'Guruhlarga yuborilmoqda...';
    }

    return Container(
      margin: const EdgeInsets.fromLTRB(20, 4, 20, 4),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: surface,
        borderRadius: BorderRadius.circular(SilkTheme.radiusLarge),
        border: Border.all(color: border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header row: icon + title + stop button
          Row(
            children: [
              if (isSending)
                SizedBox(
                  width: 20, height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.5,
                    color: bannerColor,
                  ),
                )
              else
                Icon(bannerIcon, color: bannerColor, size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  title,
                  style: SilkTheme.body(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: bannerColor,
                  ),
                ),
              ),
              if (isSending)
                Material(
                  color: Colors.transparent,
                  child: InkWell(
                    borderRadius: BorderRadius.circular(SilkTheme.radiusSmall),
                    onTap: () async {
                      await ref.read(acceptedOrdersProvider.notifier).stopBroadcast();
                      if (context.mounted) {
                        ref.read(broadcastProgressProvider.notifier).reset();
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: danger.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(SilkTheme.radiusSmall),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.stop_circle_outlined, size: 16, color: danger),
                          const SizedBox(width: 4),
                          Text(
                            'To\'xtatish',
                            style: SilkTheme.body(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: danger,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          ),
          // Progress bar (only while sending)
          if (isSending && bp.total > 0) ...[
            const SizedBox(height: 10),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: bp.progressPercent,
                minHeight: 6,
                backgroundColor: border,
                color: brand,
              ),
            ),
          ],
          // Stats chips
          if (bp.total > 0) ...[
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 6,
              children: [
                _StatChip(
                  icon: Icons.check_circle_outline,
                  label: '${bp.sent} yuborildi',
                ),
                if (bp.skipped > 0)
                  _StatChip(
                    icon: Icons.skip_next_outlined,
                    label: '${bp.skipped} o\'tkazildi',
                  ),
                if (bp.failed > 0)
                  _StatChip(
                    icon: Icons.error_outline,
                    label: '${bp.failed} xato',
                  ),
                if (bp.sessionCount > 0)
                  _StatChip(
                    icon: Icons.sim_card_outlined,
                    label: '${bp.sessionCount} session',
                  ),
                _StatChip(
                  icon: Icons.group_outlined,
                  label: '${bp.total} jami',
                ),
              ],
            ),
          ],
          // Cooldown timer
          if (bp.hasCooldown) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: accent2.withOpacity(0.15),
                borderRadius: BorderRadius.circular(SilkTheme.radiusSmall),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.timer_outlined, size: 14, color: accent2),
                  const SizedBox(width: 4),
                  Text(
                    'Keyingi tarqatish: ${bp.cooldownFormatted}',
                    style: SilkTheme.body(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: accent2,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  /// Lokal saqlangan e'lon raqamini olish — userId bo'yicha (har bir user o'z raqami)
  Future<String?> _getSavedPhone() async {
    final storage = ref.read(secureStorageProvider);
    final userId = await storage.read(key: StorageKeys.userId);
    final key = userId != null ? 'ad_phone_$userId' : 'ad_phone_number';
    final phone = await storage.read(key: key);

    // Eski global kalit bor-yo'qligini tekshirish (migration)
    if (phone == null && userId != null) {
      final oldPhone = await storage.read(key: 'ad_phone_number');
      if (oldPhone != null) {
        // Eski global raqamni yangi user-specific kalitga ko'chirish
        await storage.write(key: key, value: oldPhone);
        await storage.delete(key: 'ad_phone_number');
        return oldPhone;
      }
    }

    // Lokal bo'sh — serverdan olish
    if (phone == null) {
      try {
        final api = ref.read(apiClientProvider);
        final resp = await api.get(ApiConfig.userAdPhones);
        final phones = resp.data;
        if (phones is List && phones.isNotEmpty) {
          final serverPhone = phones[0].toString();
          await storage.write(key: key, value: serverPhone);
          return serverPhone;
        }
      } catch (_) {}
    }

    return phone;
  }

  /// Raqamni lokal + serverda saqlash — userId bo'yicha
  Future<void> _savePhone(String phone) async {
    final storage = ref.read(secureStorageProvider);
    final userId = await storage.read(key: StorageKeys.userId);
    final key = userId != null ? 'ad_phone_$userId' : 'ad_phone_number';
    await storage.write(key: key, value: phone);

    // Serverga ham saqlash — boshqa qurilmada ham ishlashi uchun
    try {
      final api = ref.read(apiClientProvider);
      await api.patch(ApiConfig.userAdPhones, data: {'phones': [phone]});
    } catch (_) {}
  }

  /// Haydovchi topish
  Future<void> _findDriver(Order order) async {
    // 1. Lokal saqlangan raqamni olish (user-specific)
    String? adPhone = await _getSavedPhone();

    // Raqam yo'q — faqat birinchi marta so'raydi
    if (adPhone == null || adPhone.isEmpty) {
      final phone = await _askAdPhone();
      if (phone == null || phone.isEmpty || !mounted) return;
      await _savePhone(phone);
      adPhone = phone;
    }

    if (!mounted) return;

    final brand = SilkTheme.brandOf(context);
    final ink = SilkTheme.inkOf(context);
    final muted = SilkTheme.mutedOf(context);
    final danger = SilkTheme.dangerOf(context);

    // 2. Tasdiqlash (raqamni o'zgartirish imkoniyati bilan)
    final dialogResult = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: SilkTheme.surfaceOf(ctx),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(SilkTheme.radiusCard)),
        title: Row(
          children: [
            Icon(Icons.search, color: brand, size: 24),
            const SizedBox(width: 8),
            Text('Haydovchi topish', style: SilkTheme.display(fontSize: 18, fontWeight: FontWeight.w700, color: ink)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(order.route, style: SilkTheme.body(fontSize: 15, fontWeight: FontWeight.w600, color: ink)),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.phone, size: 16, color: brand),
                const SizedBox(width: 6),
                Expanded(child: Text(adPhone!, style: SilkTheme.body(fontSize: 14, color: brand, fontWeight: FontWeight.w500))),
                GestureDetector(
                  onTap: () => Navigator.pop(ctx, 'change'),
                  child: Text('O\'zgartirish', style: SilkTheme.body(fontSize: 12, color: muted).copyWith(decoration: TextDecoration.underline)),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text('Barcha guruhlarga yuboriladi.', style: SilkTheme.body(fontSize: 13, color: muted)),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, 'cancel'),
            child: Text('Bekor', style: SilkTheme.body(color: muted)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, 'send'),
            style: ElevatedButton.styleFrom(
              backgroundColor: brand,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(SilkTheme.radiusBtn)),
            ),
            child: const Text('Yuborish'),
          ),
        ],
      ),
    );

    if (dialogResult == 'change') {
      // Raqamni o'zgartirish
      final newPhone = await _askAdPhone();
      if (newPhone == null || newPhone.isEmpty || !mounted) return;
      await _savePhone(newPhone);
      // Qayta dialog ko'rsatish
      return _findDriver(order);
    }
    if (dialogResult != 'send' || !mounted) return;

    // 3. WS ulanishni tekshirish — uzilgan bo'lsa qayta ulash
    final ws = ref.read(wsClientProvider);
    if (!ws.isConnected) {
      await ws.reconnect();
    }

    // 4. Banner darhol ko'rsatish (API dan OLDIN)
    ref.read(broadcastProgressProvider.notifier).startBroadcast(order.id, null);

    // 5. API chaqirish
    try {
      final result = await ref.read(acceptedOrdersProvider.notifier).findDriver(order.id, phone: adPhone);
      if (mounted && result != null) {
        // API javobidagi totalGroups va sessionCount — banner darhol to'g'ri ko'rsatsin
        final totalGroups = (result['totalGroups'] as num?)?.toInt() ?? 0;
        final sessionCount = (result['sessionCount'] as num?)?.toInt() ?? 0;
        final cooldownUntil = result['cooldownUntil'] as String?;

        ref.read(broadcastProgressProvider.notifier).startBroadcast(
          order.id,
          cooldownUntil,
          totalGroups: totalGroups,
          sessionCount: sessionCount,
        );
      } else if (mounted && result == null) {
        final error = ref.read(acceptedOrdersProvider).error ?? 'Xatolik';
        ref.read(broadcastProgressProvider.notifier).setError(error);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error), backgroundColor: danger, behavior: SnackBarBehavior.floating, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(SilkTheme.radiusBtn))),
        );
      }
    } catch (e) {
      if (mounted) {
        ref.read(broadcastProgressProvider.notifier).setError(e.toString());
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Xatolik: ${e.toString().length > 60 ? e.toString().substring(0, 60) : e}'), backgroundColor: danger, behavior: SnackBarBehavior.floating, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(SilkTheme.radiusBtn))),
        );
      }
    }
  }

  /// E'lon uchun raqam so'rash dialogi — faqat 1 marta chiqadi
  Future<String?> _askAdPhone() {
    final ctrl = TextEditingController(text: '+998');
    final brand = SilkTheme.brandOf(context);
    final ink = SilkTheme.inkOf(context);
    final muted = SilkTheme.mutedOf(context);
    return showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: SilkTheme.surfaceOf(ctx),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(SilkTheme.radiusCard)),
        title: Row(
          children: [
            Icon(Icons.phone, color: brand, size: 24),
            const SizedBox(width: 8),
            Expanded(child: Text('E\'lon uchun raqam', style: SilkTheme.display(fontSize: 18, fontWeight: FontWeight.w700, color: ink))),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Bir marta kiritasiz — doim shu raqam almashtirib tarqatiladi.',
              style: SilkTheme.body(fontSize: 13, color: muted, height: 1.4),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: ctrl,
              keyboardType: TextInputType.phone,
              style: SilkTheme.body(fontSize: 14, color: ink),
              decoration: InputDecoration(
                hintText: '+998901234567',
                prefixIcon: const Icon(Icons.phone_outlined),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(SilkTheme.radiusBtn)),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(SilkTheme.radiusBtn),
                  borderSide: BorderSide(color: brand, width: 2),
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, null),
            child: Text('Bekor', style: SilkTheme.body(color: muted)),
          ),
          ElevatedButton(
            onPressed: () {
              final p = ctrl.text.trim();
              if (p.length >= 12) Navigator.pop(ctx, p);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: brand,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(SilkTheme.radiusBtn)),
            ),
            child: const Text('Saqlash'),
          ),
        ],
      ),
    );
  }

  void _showOrderDetail(Order order) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: SilkTheme.surfaceOf(context),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(SilkTheme.radiusHero)),
      ),
      builder: (ctx) => _OrderDetailSheet(
        order: order,
        onCloseDeal: () {
          Navigator.pop(ctx);
          _showCloseDealSheet(order);
        },
        onCancel: () {
          Navigator.pop(ctx);
          _confirmCancel(order);
        },
        onCall: order.phone != null ? () => _callPhone(order.phone!) : null,
        onFindDriver: () {
          Navigator.pop(ctx);
          _findDriver(order);
        },
        onBlock: () {
          Navigator.pop(ctx);
          _confirmBlock(order);
        },
        isClosed: order.acceptedStatus == 'CLOSED',
      ),
    );
  }

  void _confirmBlock(Order order) {
    final ink = SilkTheme.inkOf(context);
    final muted = SilkTheme.mutedOf(context);
    final danger = SilkTheme.dangerOf(context);
    final success = SilkTheme.successOf(context);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: SilkTheme.surfaceOf(ctx),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(SilkTheme.radiusCard)),
        title: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: danger.withOpacity(0.1),
                borderRadius: BorderRadius.circular(SilkTheme.radiusSmall),
              ),
              child: Icon(Icons.block, color: danger, size: 22),
            ),
            const SizedBox(width: 10),
            Text('Yuboruvchini bloklash',
                style: SilkTheme.display(fontSize: 17, fontWeight: FontWeight.w700, color: ink)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${order.senderName ?? "Noma\'lum"} bloklansa, uning e\'lonlari boshqa qabul qilinmaydi.',
              style: SilkTheme.body(fontSize: 14, color: muted, height: 1.4),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Bekor', style: SilkTheme.body(color: muted)),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              final success2 = await ref.read(acceptedOrdersProvider.notifier).blockSender(order);
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(success2 ? 'Yuboruvchi bloklandi' : 'Xatolik yuz berdi'),
                    backgroundColor: success2 ? success : danger,
                    behavior: SnackBarBehavior.floating,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(SilkTheme.radiusBtn)),
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: danger,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(SilkTheme.radiusBtn)),
            ),
            child: const Text('Bloklash'),
          ),
        ],
      ),
    );
  }

  void _confirmCancel(Order order) {
    final ink = SilkTheme.inkOf(context);
    final muted = SilkTheme.mutedOf(context);
    final danger = SilkTheme.dangerOf(context);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: SilkTheme.surfaceOf(ctx),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(SilkTheme.radiusCard)),
        title: Text('Bekor qilish', style: SilkTheme.display(fontSize: 17, fontWeight: FontWeight.w700, color: ink)),
        content: Text(
          'Bu buyurtmani bekor qilmoqchimisiz? Buyurtma qaytadan boshqa dispecherlarga ko\'rinadi.',
          style: SilkTheme.body(fontSize: 14, color: muted, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Yo\'q', style: SilkTheme.body(color: muted)),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              _cancelOrder(order.id);
            },
            child: Text(
              'Ha, bekor qilish',
              style: SilkTheme.body(color: danger, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  void _showCloseDealSheet(Order order) {
    final amountController = TextEditingController();
    final ink = SilkTheme.inkOf(context);
    final muted = SilkTheme.mutedOf(context);
    final border = SilkTheme.borderOf(context);
    final success = SilkTheme.successOf(context);
    final danger = SilkTheme.dangerOf(context);
    final accent2 = SilkTheme.accent2Of(context);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: SilkTheme.surfaceOf(context),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(SilkTheme.radiusHero)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 12,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Bitim narxini kiriting',
              style: SilkTheme.display(fontSize: 20, fontWeight: FontWeight.w700, color: ink),
            ),
            const SizedBox(height: 8),
            Text(
              order.route,
              style: SilkTheme.body(fontSize: 14, color: muted),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: amountController,
              keyboardType: TextInputType.number,
              autofocus: true,
              style: SilkTheme.body(fontSize: 14, color: ink),
              decoration: const InputDecoration(
                labelText: 'Summa (UZS)',
                prefixIcon: Icon(Icons.payments_outlined),
                hintText: 'Masalan: 5000000',
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: () async {
                  final amount = double.tryParse(amountController.text);
                  if (amount == null || amount <= 0) {
                    ScaffoldMessenger.of(ctx).showSnackBar(
                      SnackBar(
                        content: const Text('To\'g\'ri summa kiriting'),
                        backgroundColor: accent2,
                      ),
                    );
                    return;
                  }
                  Navigator.pop(ctx);
                  final ok = await ref
                      .read(acceptedOrdersProvider.notifier)
                      .closeDeal(order.id, amount);
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          ok
                              ? 'Bitim muvaffaqiyatli yopildi!'
                              : 'Xatolik yuz berdi',
                        ),
                        backgroundColor: ok ? success : danger,
                      ),
                    );
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: success,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(SilkTheme.radiusBtn),
                  ),
                ),
                child: Text(
                  'Tasdiqlash',
                  style: SilkTheme.body(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _cancelOrder(String orderId) async {
    final ok = await ref
        .read(acceptedOrdersProvider.notifier)
        .cancelAccepted(orderId);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(ok ? 'Bekor qilindi' : 'Xatolik yuz berdi'),
          backgroundColor:
              ok ? SilkTheme.successOf(context) : SilkTheme.dangerOf(context),
        ),
      );
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Active order card — Silk Road rcv-card design
// ─────────────────────────────────────────────────────────────────────────────

class _ActiveOrderCard extends ConsumerWidget {
  final Order order;
  final VoidCallback onTap;
  final VoidCallback onCloseDeal;
  final VoidCallback onCancel;
  final VoidCallback? onCall;
  final VoidCallback onFindDriver;
  final VoidCallback onBlock;

  const _ActiveOrderCard({
    required this.order,
    required this.onTap,
    required this.onCloseDeal,
    required this.onCancel,
    this.onCall,
    required this.onFindDriver,
    required this.onBlock,
  });

  bool get _isLive => order.acceptedStatus == 'IN_PROGRESS';

  void _showBroadcastStats(BuildContext context, Order order, BroadcastProgressState bp) {
    final lastResult = bp.lastResults[order.id];
    final ink = SilkTheme.inkOf(context);
    final muted = SilkTheme.mutedOf(context);
    final border = SilkTheme.borderOf(context);
    final brand = SilkTheme.brandOf(context);
    final bg = SilkTheme.bgOf(context);
    final success = SilkTheme.successOf(context);
    final accent2 = SilkTheme.accent2Of(context);
    final danger = SilkTheme.dangerOf(context);

    showModalBottomSheet(
      context: context,
      backgroundColor: SilkTheme.surfaceOf(context),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(SilkTheme.radiusHero)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40, height: 4,
                decoration: BoxDecoration(
                  color: border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Container(
                    width: 44, height: 44,
                    decoration: BoxDecoration(
                      color: brand.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
                    ),
                    child: Icon(Icons.campaign, size: 24, color: brand),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Tarqatish statistikasi',
                          style: SilkTheme.display(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: ink,
                          ),
                        ),
                        Text(
                          order.route,
                          style: SilkTheme.body(fontSize: 13, color: muted),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              // Total broadcast count
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: brand.withOpacity(0.06),
                  borderRadius: BorderRadius.circular(SilkTheme.radiusLarge),
                  border: Border.all(color: brand.withOpacity(0.15)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.repeat, size: 20, color: brand),
                    const SizedBox(width: 8),
                    Text(
                      '${order.broadcastCount} marta tarqatilgan',
                      style: SilkTheme.body(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: brand,
                      ),
                    ),
                  ],
                ),
              ),
              // Last result stats
              if (lastResult != null) ...[
                const SizedBox(height: 16),
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Oxirgi tarqatish:',
                    style: SilkTheme.body(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: muted,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    _buildStatTile(
                      context,
                      Icons.check_circle_outline,
                      '${lastResult.sent}',
                      'Yuborildi',
                      success,
                    ),
                    const SizedBox(width: 8),
                    _buildStatTile(
                      context,
                      Icons.skip_next_outlined,
                      '${lastResult.skipped}',
                      'O\'tkazildi',
                      accent2,
                    ),
                    const SizedBox(width: 8),
                    _buildStatTile(
                      context,
                      Icons.error_outline,
                      '${lastResult.failed}',
                      'Xato',
                      danger,
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    _buildStatTile(
                      context,
                      Icons.group_outlined,
                      '${lastResult.total}',
                      'Jami guruh',
                      brand,
                    ),
                    const SizedBox(width: 8),
                    _buildStatTile(
                      context,
                      Icons.sim_card_outlined,
                      '${lastResult.sessionCount}',
                      'Session',
                      brand,
                    ),
                    const SizedBox(width: 8),
                    _buildStatTile(
                      context,
                      Icons.access_time,
                      '${lastResult.completedAt.hour}:${lastResult.completedAt.minute.toString().padLeft(2, '0')}',
                      'Vaqt',
                      muted,
                    ),
                  ],
                ),
              ],
              if (lastResult == null) ...[
                const SizedBox(height: 16),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: bg,
                    borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
                  ),
                  child: Text(
                    'Oxirgi tarqatish ma\'lumotlari mavjud emas.\nIlova qayta ochilgandan keyin ma\'lumotlar ko\'rinmaydi.',
                    textAlign: TextAlign.center,
                    style: SilkTheme.body(
                      fontSize: 13,
                      color: muted,
                      height: 1.4,
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 8),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatTile(BuildContext context, IconData icon, String value, String label, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.06),
          borderRadius: BorderRadius.circular(SilkTheme.radiusSmall),
          border: Border.all(color: color.withOpacity(0.15)),
        ),
        child: Column(
          children: [
            Icon(icon, size: 18, color: color),
            const SizedBox(height: 4),
            Text(
              value,
              style: SilkTheme.body(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: color,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: SilkTheme.body(
                fontSize: 10,
                color: SilkTheme.mutedOf(context),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bp = ref.watch(broadcastProgressProvider);
    final isThisOrder = bp.orderId == order.id;
    // Cooldown GLOBAL — 3 daqiqa BARCHA orderlar uchun (akkaunt himoyasi)
    final isCooldown = bp.hasCooldown;
    // Spinning faqat SHU order uchun
    final isBroadcasting = isThisOrder && bp.isSending;

    final dateStr = order.acceptedAt != null
        ? DateFormat('dd.MM.yyyy HH:mm').format(order.acceptedAt!)
        : order.createdAt != null
            ? DateFormat('dd.MM.yyyy HH:mm').format(order.createdAt)
            : '';

    final surface = SilkTheme.surfaceOf(context);
    final border = SilkTheme.borderOf(context);
    final ink = SilkTheme.inkOf(context);
    final muted = SilkTheme.mutedOf(context);
    final muted2 = SilkTheme.muted2Of(context);
    final soft = SilkTheme.softOf(context);
    final brand = SilkTheme.brandOf(context);
    final accent = SilkTheme.accentOf(context);
    final accent2 = SilkTheme.accent2Of(context);
    final success = SilkTheme.successOf(context);
    final danger = SilkTheme.dangerOf(context);
    final bg = SilkTheme.bgOf(context);

    final statusLabel = _isLive
        ? 'Yo\'lda'
        : 'Faol';

    return Material(
      color: surface,
      borderRadius: BorderRadius.circular(SilkTheme.radiusCard),
      child: InkWell(
        borderRadius: BorderRadius.circular(SilkTheme.radiusCard),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            border: Border.all(color: border, width: 1),
            borderRadius: BorderRadius.circular(SilkTheme.radiusCard),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Head: avatar + name + date + notif + status ──
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Avatar
                  Container(
                    width: 46,
                    height: 46,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: soft,
                      border: Border.all(color: border, width: 1),
                    ),
                    child: Text(
                      (order.senderName ?? '?')[0].toUpperCase(),
                      style: SilkTheme.display(
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                        color: ink,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          order.senderName ?? 'Noma\'lum',
                          style: SilkTheme.cardName(context),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (dateStr.isNotEmpty) ...[
                          const SizedBox(height: 2),
                          Text(
                            dateStr,
                            style: SilkTheme.body(
                              fontSize: 11,
                              color: muted2,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Notif / broadcast counter
                  if (order.broadcastCount > 0)
                    GestureDetector(
                      onTap: () => _showBroadcastStats(context, order, bp),
                      child: Container(
                        margin: const EdgeInsets.only(right: 6),
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: soft,
                          borderRadius: BorderRadius.circular(SilkTheme.radiusSmall),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.campaign_outlined, size: 10, color: muted),
                            const SizedBox(width: 3),
                            Text(
                              '${order.broadcastCount}',
                              style: SilkTheme.mono(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: muted,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  if (order.blockedByCount > 0)
                    Container(
                      margin: const EdgeInsets.only(right: 6),
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: danger.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(SilkTheme.radiusSmall),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.block, size: 10, color: danger),
                          const SizedBox(width: 3),
                          Text(
                            '${order.blockedByCount}',
                            style: SilkTheme.mono(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: danger,
                            ),
                          ),
                        ],
                      ),
                    ),
                  // Status pill
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 5),
                    decoration: BoxDecoration(
                      color: accent2.withOpacity(0.20),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      statusLabel.toUpperCase(),
                      style: SilkTheme.pill(accent),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // ── Route: Live (if IN_PROGRESS) or vertical ──
              if (_isLive)
                SilkLiveRoute(
                  fromCity: order.cargoFrom ?? '---',
                  toCity: order.cargoTo ?? '---',
                )
              else
                _VerticalRoute(
                  from: order.cargoFrom ?? '---',
                  to: order.cargoTo ?? '---',
                  brand: brand,
                  accent: accent,
                  border: border,
                  ink: ink,
                ),

              // ── Tags row: scope + weight + phone (right) ──
              Padding(
                padding: const EdgeInsets.only(top: 14, bottom: 4),
                child: Row(
                  children: [
                    _Tag(label: order.scope.label, soft: soft, muted: muted),
                    if (order.cargoWeight != null && order.cargoWeight!.isNotEmpty) ...[
                      const SizedBox(width: 8),
                      _Tag(label: order.cargoWeight!, soft: soft, muted: muted),
                    ],
                    if (order.vehicleType != null && order.vehicleType!.isNotEmpty) ...[
                      const SizedBox(width: 8),
                      _Tag(label: order.vehicleType!, soft: soft, muted: muted),
                    ],
                    const Spacer(),
                    if (order.phone != null && order.phone!.isNotEmpty)
                      GestureDetector(
                        onTap: onCall,
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.phone, size: 12, color: muted),
                            const SizedBox(width: 6),
                            Text(
                              order.phone!,
                              style: SilkTheme.body(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: ink,
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),

              // ── Last broadcast report (persistent per-order) ──
              if (bp.lastResults.containsKey(order.id)) ...[
                const SizedBox(height: 12),
                _LastBroadcastReport(result: bp.lastResults[order.id]!),
              ],

              const SizedBox(height: 12),

              // ── Main action: Haydovchi topish (brand→ink gradient) ──
              _MainActionBtn(
                onTap: (isCooldown || isBroadcasting) ? null : onFindDriver,
                label: isBroadcasting
                    ? 'Yuborilmoqda...'
                    : isCooldown
                        ? 'Kutish: ${bp.cooldownFormatted}'
                        : 'Haydovchi topish',
                icon: isBroadcasting
                    ? null
                    : isCooldown
                        ? Icons.timer_outlined
                        : Icons.local_shipping_outlined,
                loading: isBroadcasting,
                bg: bg,
                brand: brand,
                ink: ink,
                muted: muted2,
              ),

              const SizedBox(height: 8),

              // ── Secondary grid: 3 buttons ──
              Row(
                children: [
                  if (onCall != null) ...[
                    Expanded(
                      child: _SecBtn(
                        icon: Icons.phone,
                        label: 'Aloqa',
                        onTap: onCall,
                        surface: surface,
                        border: border,
                        ink: ink,
                      ),
                    ),
                    const SizedBox(width: 8),
                  ],
                  Expanded(
                    child: _SecBtn(
                      icon: Icons.check,
                      label: 'Yopish',
                      onTap: onCloseDeal,
                      surface: success,
                      border: success,
                      ink: Colors.white,
                      filled: true,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _SecBtn(
                      icon: Icons.close,
                      label: 'Bekor',
                      onTap: onCancel,
                      surface: surface,
                      border: danger.withOpacity(0.35),
                      ink: danger,
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Block (icon only)
                  _SecBtn(
                    icon: Icons.block,
                    label: '',
                    onTap: onBlock,
                    surface: surface,
                    border: danger.withOpacity(0.35),
                    ink: danger,
                    iconOnly: true,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Closed order card — Silk compact
// ─────────────────────────────────────────────────────────────────────────────

class _ClosedOrderCard extends StatelessWidget {
  final Order order;
  final VoidCallback onTap;

  const _ClosedOrderCard({required this.order, required this.onTap});

  String _formatAmount(double? amount) {
    if (amount == null) return '---';
    final formatter = NumberFormat('#,###', 'uz');
    return '${formatter.format(amount.toInt())} UZS';
  }

  @override
  Widget build(BuildContext context) {
    final surface = SilkTheme.surfaceOf(context);
    final border = SilkTheme.borderOf(context);
    final ink = SilkTheme.inkOf(context);
    final muted = SilkTheme.mutedOf(context);
    final muted2 = SilkTheme.muted2Of(context);
    final soft = SilkTheme.softOf(context);
    final success = SilkTheme.successOf(context);

    final dateStr = order.closedAt != null
        ? DateFormat('dd.MM.yyyy HH:mm').format(order.closedAt!)
        : order.createdAt != null
            ? DateFormat('dd.MM.yyyy HH:mm').format(order.createdAt)
            : '';

    return Material(
      color: surface,
      borderRadius: BorderRadius.circular(SilkTheme.radiusCard),
      child: InkWell(
        borderRadius: BorderRadius.circular(SilkTheme.radiusCard),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            border: Border.all(color: border, width: 1),
            borderRadius: BorderRadius.circular(SilkTheme.radiusCard),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Head
              Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: success.withOpacity(0.15),
                      shape: BoxShape.circle,
                    ),
                    alignment: Alignment.center,
                    child: Icon(Icons.check, size: 20, color: success),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          order.senderName ?? 'Noma\'lum',
                          style: SilkTheme.cardName(context),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (dateStr.isNotEmpty)
                          Text(
                            dateStr,
                            style: SilkTheme.body(fontSize: 11, color: muted2),
                          ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 5),
                    decoration: BoxDecoration(
                      color: success.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      'YOPILGAN',
                      style: SilkTheme.pill(success),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 14),

              // Route
              Row(
                children: [
                  _dot(SilkTheme.brandOf(context)),
                  const SizedBox(width: 8),
                  Flexible(child: Text(order.cargoFrom ?? order.route, style: SilkTheme.cardCity(context), maxLines: 1, overflow: TextOverflow.ellipsis)),
                  const SizedBox(width: 8),
                  Icon(Icons.arrow_forward, size: 14, color: muted),
                  const SizedBox(width: 8),
                  Flexible(child: Text(order.cargoTo ?? '---', style: SilkTheme.cardCity(context), maxLines: 1, overflow: TextOverflow.ellipsis)),
                  const SizedBox(width: 8),
                  _dot(SilkTheme.accentOf(context)),
                ],
              ),

              const SizedBox(height: 14),
              Container(height: 1, color: border),
              const SizedBox(height: 14),

              // Amount
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('BITIM SUMMASI', style: SilkTheme.label(context)),
                        const SizedBox(height: 2),
                        Text(
                          _formatAmount(order.closedAmount),
                          style: SilkTheme.display(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: ink,
                            letterSpacing: -0.3,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: soft,
                      borderRadius: BorderRadius.circular(SilkTheme.radiusXS),
                    ),
                    child: Text(
                      order.scope.label,
                      style: SilkTheme.mono(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: muted,
                        letterSpacing: 0.5,
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

  Widget _dot(Color c) => Container(
        width: 10,
        height: 10,
        decoration: BoxDecoration(color: c, shape: BoxShape.circle),
      );
}

// ─────────────────────────────────────────────────────────────────────────────
// Cancelled order card
// ─────────────────────────────────────────────────────────────────────────────

class _CancelledOrderCard extends StatelessWidget {
  final Order order;
  final VoidCallback onTap;

  const _CancelledOrderCard({required this.order, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final surface = SilkTheme.surfaceOf(context);
    final border = SilkTheme.borderOf(context);
    final muted = SilkTheme.mutedOf(context);
    final muted2 = SilkTheme.muted2Of(context);
    final danger = SilkTheme.dangerOf(context);

    final dateStr = order.createdAt != null
        ? DateFormat('dd.MM.yyyy HH:mm').format(order.createdAt)
        : '';

    return Material(
      color: surface,
      borderRadius: BorderRadius.circular(SilkTheme.radiusCard),
      child: InkWell(
        borderRadius: BorderRadius.circular(SilkTheme.radiusCard),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            border: Border.all(color: border, width: 1),
            borderRadius: BorderRadius.circular(SilkTheme.radiusCard),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: danger.withOpacity(0.12),
                      shape: BoxShape.circle,
                    ),
                    alignment: Alignment.center,
                    child: Icon(Icons.close, size: 20, color: danger),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          order.senderName ?? 'Noma\'lum',
                          style: SilkTheme.cardName(context),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (dateStr.isNotEmpty)
                          Text(
                            dateStr,
                            style: SilkTheme.body(fontSize: 11, color: muted2),
                          ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 5),
                    decoration: BoxDecoration(
                      color: danger.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      'BEKOR',
                      style: SilkTheme.pill(danger),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 14),

              Row(
                children: [
                  Icon(Icons.route, size: 15, color: muted),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      order.route,
                      style: SilkTheme.cardCity(context),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
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
}

// ─────────────────────────────────────────────────────────────────────────────
// Order detail bottom sheet
// ─────────────────────────────────────────────────────────────────────────────

class _OrderDetailSheet extends StatelessWidget {
  final Order order;
  final VoidCallback? onCloseDeal;
  final VoidCallback? onCancel;
  final VoidCallback? onCall;
  final VoidCallback? onFindDriver;
  final VoidCallback? onBlock;
  final bool isClosed;

  const _OrderDetailSheet({
    required this.order,
    this.onCloseDeal,
    this.onCancel,
    this.onCall,
    this.onFindDriver,
    this.onBlock,
    this.isClosed = false,
  });

  @override
  Widget build(BuildContext context) {
    final ink = SilkTheme.inkOf(context);
    final muted = SilkTheme.mutedOf(context);
    final border = SilkTheme.borderOf(context);
    final soft = SilkTheme.softOf(context);
    final brand = SilkTheme.brandOf(context);
    final success = SilkTheme.successOf(context);
    final accent2 = SilkTheme.accent2Of(context);
    final danger = SilkTheme.dangerOf(context);
    final accent = SilkTheme.accentOf(context);

    final dateStr = order.createdAt != null
        ? DateFormat('dd.MM.yyyy HH:mm').format(order.createdAt)
        : '';
    final acceptedStr = order.acceptedAt != null
        ? DateFormat('dd.MM.yyyy HH:mm').format(order.acceptedAt!)
        : '';

    return DraggableScrollableSheet(
      initialChildSize: 0.7,
      minChildSize: 0.4,
      maxChildSize: 0.92,
      expand: false,
      builder: (ctx, scrollCtrl) {
        return Column(
          children: [
            // Drag handle
            Padding(
              padding: const EdgeInsets.only(top: 12, bottom: 8),
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),

            Expanded(
              child: ListView(
                controller: scrollCtrl,
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                children: [
                  // Title
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          'Buyurtma tafsilotlari',
                          style: SilkTheme.display(
                            fontSize: 20,
                            fontWeight: FontWeight.w700,
                            color: ink,
                            letterSpacing: -0.4,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 5),
                        decoration: BoxDecoration(
                          color: isClosed
                              ? success.withOpacity(0.15)
                              : accent2.withOpacity(0.20),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          isClosed ? 'YOPILGAN' : 'FAOL',
                          style: SilkTheme.pill(isClosed ? success : accent),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Sender info
                  _DetailRow(
                    icon: Icons.person,
                    label: 'Jo\'natuvchi',
                    value: order.senderName ?? 'Noma\'lum',
                  ),
                  if (order.senderUsername != null)
                    _DetailRow(
                      icon: Icons.alternate_email,
                      label: 'Username',
                      value: '@${order.senderUsername}',
                    ),
                  if (order.groupTitle.isNotEmpty)
                    _DetailRow(
                      icon: Icons.group,
                      label: 'Guruh',
                      value: order.groupTitle,
                    ),

                  const _Divider(),

                  // Route
                  _DetailRow(
                    icon: Icons.location_on,
                    label: 'Qayerdan',
                    value: order.cargoFrom ?? '---',
                  ),
                  _DetailRow(
                    icon: Icons.flag,
                    label: 'Qayerga',
                    value: order.cargoTo ?? '---',
                  ),
                  if (order.distance != null)
                    _DetailRow(
                      icon: Icons.straighten,
                      label: 'Masofa',
                      value: '${order.distance} km',
                    ),

                  const _Divider(),

                  // Cargo details
                  if (order.cargoType != null && order.cargoType!.isNotEmpty)
                    _DetailRow(
                      icon: Icons.inventory_2,
                      label: 'Yuk turi',
                      value: order.cargoType!,
                    ),
                  if (order.cargoWeight != null && order.cargoWeight!.isNotEmpty)
                    _DetailRow(
                      icon: Icons.scale,
                      label: 'Og\'irlik',
                      value: order.cargoWeight!,
                    ),
                  if (order.vehicleType != null && order.vehicleType!.isNotEmpty)
                    _DetailRow(
                      icon: Icons.local_shipping,
                      label: 'Mashina turi',
                      value: order.vehicleType!,
                    ),
                  if (order.vehicleCapacity != null &&
                      order.vehicleCapacity!.isNotEmpty)
                    _DetailRow(
                      icon: Icons.compress,
                      label: 'Yuk sig\'imi',
                      value: order.vehicleCapacity!,
                    ),
                  if (order.price != null && order.price!.isNotEmpty)
                    _DetailRow(
                      icon: Icons.payments,
                      label: 'Narx',
                      value: order.price!,
                    ),

                  const _Divider(),

                  // Phone
                  if (order.phone != null && order.phone!.isNotEmpty)
                    GestureDetector(
                      onTap: onCall,
                      child: _DetailRow(
                        icon: Icons.phone,
                        label: 'Telefon',
                        value: order.phone!,
                        isHighlighted: true,
                      ),
                    ),

                  // Scope / type
                  _DetailRow(icon: Icons.public, label: 'Scope', value: order.scope.label),
                  _DetailRow(icon: Icons.category, label: 'Turi', value: order.type.label),

                  const _Divider(),

                  // Dates
                  if (dateStr.isNotEmpty)
                    _DetailRow(icon: Icons.calendar_today, label: 'Yaratilgan', value: dateStr),
                  if (acceptedStr.isNotEmpty)
                    _DetailRow(icon: Icons.check_circle, label: 'Qabul qilingan', value: acceptedStr),

                  // Closed info
                  if (isClosed && order.closedAmount != null) ...[
                    const _Divider(),
                    _DetailRow(
                      icon: Icons.monetization_on,
                      label: 'Yopilgan narx',
                      value:
                          '${NumberFormat('#,###', 'uz').format(order.closedAmount!.toInt())} UZS',
                      isHighlighted: true,
                    ),
                    if (order.closedAt != null)
                      _DetailRow(
                        icon: Icons.event_available,
                        label: 'Yopilgan sana',
                        value: DateFormat('dd.MM.yyyy HH:mm').format(order.closedAt!),
                      ),
                  ],

                  // Original message
                  if (order.messageText.isNotEmpty) ...[
                    const _Divider(),
                    const SizedBox(height: 4),
                    Text(
                      'Asl xabar:',
                      style: SilkTheme.body(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: muted,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: soft,
                        borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
                        border: Border.all(color: border),
                      ),
                      child: Text(
                        order.messageText,
                        style: SilkTheme.body(
                          fontSize: 13,
                          color: ink,
                          height: 1.5,
                        ),
                      ),
                    ),
                  ],

                  const SizedBox(height: 20),

                  // Action buttons (only for active orders)
                  if (!isClosed) ...[
                    // Haydovchi topish — primary full width
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [brand, ink],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(SilkTheme.radiusLarge),
                        ),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            borderRadius: BorderRadius.circular(SilkTheme.radiusLarge),
                            onTap: onFindDriver,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.local_shipping_outlined, size: 18, color: Colors.white),
                                const SizedBox(width: 8),
                                Text(
                                  'Haydovchi topish',
                                  style: SilkTheme.body(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    // Call button
                    if (onCall != null)
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: OutlinedButton.icon(
                          onPressed: onCall,
                          icon: Icon(Icons.phone, size: 18, color: ink),
                          label: Text(
                            'Qo\'ng\'iroq qilish',
                            style: SilkTheme.body(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: ink,
                            ),
                          ),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: ink,
                            backgroundColor: SilkTheme.surfaceOf(context),
                            side: BorderSide(color: border),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(SilkTheme.radiusLarge),
                            ),
                          ),
                        ),
                      ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: SizedBox(
                            height: 48,
                            child: ElevatedButton.icon(
                              onPressed: onCloseDeal,
                              icon: const Icon(Icons.check, size: 18),
                              label: Text(
                                'Yopish',
                                style: SilkTheme.body(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white),
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: success,
                                foregroundColor: Colors.white,
                                elevation: 0,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(SilkTheme.radiusLarge),
                                ),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: SizedBox(
                            height: 48,
                            child: OutlinedButton.icon(
                              onPressed: onCancel,
                              icon: Icon(Icons.close, size: 18, color: danger),
                              label: Text(
                                'Bekor qilish',
                                style: SilkTheme.body(fontSize: 13, fontWeight: FontWeight.w600, color: danger),
                              ),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: danger,
                                backgroundColor: SilkTheme.surfaceOf(context),
                                side: BorderSide(color: danger.withOpacity(0.35)),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(SilkTheme.radiusLarge),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    // Block sender button
                    if (onBlock != null) ...[
                      const SizedBox(height: 10),
                      SizedBox(
                        width: double.infinity,
                        height: 46,
                        child: OutlinedButton.icon(
                          onPressed: onBlock,
                          icon: Icon(Icons.block, size: 18, color: danger.withOpacity(0.75)),
                          label: Text(
                            'Yuboruvchini bloklash',
                            style: SilkTheme.body(fontSize: 13, fontWeight: FontWeight.w600, color: danger.withOpacity(0.85)),
                          ),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: danger.withOpacity(0.85),
                            backgroundColor: SilkTheme.surfaceOf(context),
                            side: BorderSide(color: danger.withOpacity(0.25)),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(SilkTheme.radiusLarge),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ],
                ],
              ),
            ),
          ],
        );
      },
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — Silk variants
// ─────────────────────────────────────────────────────────────────────────────

class _VerticalRoute extends StatelessWidget {
  final String from;
  final String to;
  final Color brand;
  final Color accent;
  final Color border;
  final Color ink;

  const _VerticalRoute({
    required this.from,
    required this.to,
    required this.brand,
    required this.accent,
    required this.border,
    required this.ink,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            _dot(brand),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                from,
                style: SilkTheme.cardCity(context),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        Padding(
          padding: const EdgeInsets.only(left: 4, top: 4, bottom: 4),
          child: SizedBox(
            height: 14,
            child: _DottedVertical(color: border),
          ),
        ),
        Row(
          children: [
            _dot(accent),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                to,
                style: SilkTheme.cardCity(context),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _dot(Color c) => Container(
        width: 10,
        height: 10,
        decoration: BoxDecoration(color: c, shape: BoxShape.circle),
      );
}

class _DottedVertical extends StatelessWidget {
  final Color color;
  const _DottedVertical({required this.color});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (ctx, c) {
      const dot = 2.0;
      const gap = 3.0;
      final count = (c.maxHeight / (dot + gap)).floor();
      return Column(
        children: List.generate(
          count,
          (_) => Padding(
            padding: const EdgeInsets.only(bottom: gap),
            child: Container(width: 2, height: dot, color: color),
          ),
        ),
      );
    });
  }
}

class _Tag extends StatelessWidget {
  final String label;
  final Color soft;
  final Color muted;

  const _Tag({required this.label, required this.soft, required this.muted});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: soft,
        borderRadius: BorderRadius.circular(SilkTheme.radiusSmall),
      ),
      child: Text(
        label,
        style: SilkTheme.body(fontSize: 11, color: muted),
      ),
    );
  }
}

class _MainActionBtn extends StatelessWidget {
  final VoidCallback? onTap;
  final String label;
  final IconData? icon;
  final bool loading;
  final Color bg;
  final Color brand;
  final Color ink;
  final Color muted;

  const _MainActionBtn({
    required this.onTap,
    required this.label,
    this.icon,
    this.loading = false,
    required this.bg,
    required this.brand,
    required this.ink,
    required this.muted,
  });

  @override
  Widget build(BuildContext context) {
    final enabled = onTap != null;
    return SizedBox(
      width: double.infinity,
      height: 46,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: enabled
              ? LinearGradient(
                  colors: [brand, ink],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : null,
          color: enabled ? null : muted.withOpacity(0.25),
          borderRadius: BorderRadius.circular(SilkTheme.radiusLarge),
          boxShadow: enabled
              ? [
                  BoxShadow(
                    color: brand.withOpacity(0.25),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ]
              : null,
        ),
        child: Material(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(SilkTheme.radiusLarge),
          child: InkWell(
            borderRadius: BorderRadius.circular(SilkTheme.radiusLarge),
            onTap: onTap,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (loading)
                  const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                else if (icon != null)
                  Icon(icon, size: 16, color: enabled ? Colors.white : muted),
                const SizedBox(width: 8),
                Text(
                  label,
                  style: SilkTheme.body(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: enabled ? Colors.white : muted,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _SecBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final Color surface;
  final Color border;
  final Color ink;
  final bool filled;
  final bool iconOnly;

  const _SecBtn({
    required this.icon,
    required this.label,
    required this.onTap,
    required this.surface,
    required this.border,
    required this.ink,
    this.filled = false,
    this.iconOnly = false,
  });

  @override
  Widget build(BuildContext context) {
    final child = Container(
      padding: iconOnly
          ? const EdgeInsets.all(11)
          : const EdgeInsets.symmetric(vertical: 11, horizontal: 6),
      decoration: BoxDecoration(
        color: surface,
        border: Border.all(color: border, width: 1),
        borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: ink),
          if (!iconOnly && label.isNotEmpty) ...[
            const SizedBox(width: 6),
            Flexible(
              child: Text(
                label,
                overflow: TextOverflow.ellipsis,
                style: SilkTheme.body(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: ink,
                ),
              ),
            ),
          ],
        ],
      ),
    );
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
        onTap: onTap,
        child: child,
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final bool isHighlighted;

  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
    this.isHighlighted = false,
  });

  @override
  Widget build(BuildContext context) {
    final ink = SilkTheme.inkOf(context);
    final muted = SilkTheme.mutedOf(context);
    final brand = SilkTheme.brandOf(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        children: [
          Icon(
            icon,
            size: 18,
            color: isHighlighted ? brand : muted,
          ),
          const SizedBox(width: 10),
          Text(
            '$label: ',
            style: SilkTheme.body(fontSize: 14, color: muted),
          ),
          Expanded(
            child: Text(
              value,
              style: SilkTheme.body(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: isHighlighted ? brand : ink,
              ).copyWith(
                decoration: isHighlighted ? TextDecoration.underline : null,
              ),
              textAlign: TextAlign.end,
            ),
          ),
        ],
      ),
    );
  }
}

class _Divider extends StatelessWidget {
  const _Divider();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Divider(color: SilkTheme.borderOf(context), height: 1),
    );
  }
}

/// Persistent per-order last broadcast report — shown on order card.
class _LastBroadcastReport extends StatelessWidget {
  final BroadcastResult result;

  const _LastBroadcastReport({required this.result});

  @override
  Widget build(BuildContext context) {
    final timeStr = '${result.completedAt.hour}:${result.completedAt.minute.toString().padLeft(2, '0')}';
    final muted = SilkTheme.mutedOf(context);
    final muted2 = SilkTheme.muted2Of(context);
    final success = SilkTheme.successOf(context);
    final accent2 = SilkTheme.accent2Of(context);
    final danger = SilkTheme.dangerOf(context);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: success.withOpacity(0.06),
        borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
        border: Border.all(color: success.withOpacity(0.15)),
      ),
      child: Row(
        children: [
          Icon(Icons.check_circle_outline, size: 16, color: success),
          const SizedBox(width: 8),
          Expanded(
            child: Text.rich(
              TextSpan(
                style: SilkTheme.body(fontSize: 12, color: muted),
                children: [
                  TextSpan(
                    text: '${result.sent}',
                    style: SilkTheme.body(fontWeight: FontWeight.w700, color: success, fontSize: 12),
                  ),
                  const TextSpan(text: ' yuborildi'),
                  if (result.skipped > 0) ...[
                    const TextSpan(text: ' · '),
                    TextSpan(
                      text: '${result.skipped}',
                      style: SilkTheme.body(fontWeight: FontWeight.w700, color: accent2, fontSize: 12),
                    ),
                    const TextSpan(text: ' skip'),
                  ],
                  if (result.failed > 0) ...[
                    const TextSpan(text: ' · '),
                    TextSpan(
                      text: '${result.failed}',
                      style: SilkTheme.body(fontWeight: FontWeight.w700, color: danger, fontSize: 12),
                    ),
                    const TextSpan(text: ' xato'),
                  ],
                ],
              ),
            ),
          ),
          Text(
            timeStr,
            style: SilkTheme.mono(fontSize: 11, color: muted2),
          ),
        ],
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _StatChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    final brand = SilkTheme.brandOf(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: brand.withOpacity(0.08),
        borderRadius: BorderRadius.circular(SilkTheme.radiusSmall),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: brand),
          const SizedBox(width: 4),
          Text(
            label,
            style: SilkTheme.body(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: brand,
            ),
          ),
        ],
      ),
    );
  }
}

/// Silk-styled empty state — replaces EmptyState for this screen.
class _SilkEmpty extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;

  const _SilkEmpty({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    final ink = SilkTheme.inkOf(context);
    final muted = SilkTheme.mutedOf(context);
    final soft = SilkTheme.softOf(context);
    final border = SilkTheme.borderOf(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: soft,
                shape: BoxShape.circle,
                border: Border.all(color: border, width: 1),
              ),
              child: Icon(icon, size: 36, color: muted),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              style: SilkTheme.display(
                fontSize: 17,
                fontWeight: FontWeight.w700,
                color: ink,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 6),
            Text(
              subtitle,
              style: SilkTheme.body(fontSize: 13, color: muted),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
