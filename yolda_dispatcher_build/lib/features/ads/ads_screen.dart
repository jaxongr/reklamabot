import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../core/providers/providers.dart';

class AdsScreen extends ConsumerStatefulWidget {
  const AdsScreen({super.key});
  @override
  ConsumerState<AdsScreen> createState() => _AdsScreenState();
}

class _AdsScreenState extends ConsumerState<AdsScreen> {
  final List<Map<String, dynamic>> _items = [];
  final Set<String> _ids = {};
  bool _loading = false;
  bool _firstLoaded = false;
  String? _cursor;
  String? _error;
  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    _load(refresh: true);
    _connectWebSocket();
    _refreshTimer = Timer.periodic(const Duration(seconds: 30), (_) => _load(refresh: true, silent: true));
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  void _connectWebSocket() {
    final socket = ref.read(socketServiceProvider);
    socket.connect();
    socket.on('ads:new', (data) {
      if (!mounted) return;
      if (data is Map && data['id'] != null) {
        final id = data['id'] as String;
        if (!_ids.contains(id)) {
          setState(() {
            _items.insert(0, Map<String, dynamic>.from(data as Map));
            _ids.add(id);
            if (_items.length > 200) {
              final removed = _items.removeLast();
              _ids.remove(removed['id']);
            }
          });
        }
      }
    });
  }

  Future<void> _load({bool refresh = true, bool silent = false}) async {
    if (!silent) setState(() { _loading = true; _error = null; });
    try {
      final res = await ref.read(adsServiceProvider).fetchFeed(cursor: refresh ? null : _cursor);
      final rawItems = res['items'] as List<dynamic>;
      final items = rawItems.map((e) => Map<String, dynamic>.from(e as Map)).toList();
      if (!mounted) return;
      setState(() {
        if (refresh) {
          _items.clear();
          _ids.clear();
        }
        for (final it in items) {
          final id = it['id']?.toString();
          if (id != null && !_ids.contains(id)) {
            _items.add(it);
            _ids.add(id);
          }
        }
        _cursor = res['nextCursor']?.toString();
        _loading = false;
        _firstLoaded = true;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _firstLoaded = true;
        _error = e.toString().split(':').take(2).join(':');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final socket = ref.watch(socketServiceProvider);
    return Scaffold(
      backgroundColor: AppTheme.bgBody,
      appBar: AppBar(
        title: const Row(mainAxisSize: MainAxisSize.min, children: [
          Text("YO'LDA ", style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 3)),
          Text("DISPATCHER", style: TextStyle(fontSize: 12, color: AppTheme.accent, letterSpacing: 4)),
        ]),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Row(children: [
              Text('${_items.length}', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
              const SizedBox(width: 6),
              Icon(Icons.circle, size: 10,
                color: socket.isConnected ? AppTheme.successColor : AppTheme.warningColor),
            ]),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => _load(refresh: true),
        color: AppTheme.primary,
        child: _buildBody(),
      ),
    );
  }

  Widget _buildBody() {
    if (!_firstLoaded && _loading) {
      return const Center(child: CircularProgressIndicator(color: AppTheme.primary));
    }
    if (_error != null && _items.isEmpty) {
      return ListView(children: [
        const SizedBox(height: 100),
        const Icon(Icons.error_outline, size: 64, color: AppTheme.errorColor),
        const SizedBox(height: 16),
        Center(child: Text('Xatolik: $_error', style: const TextStyle(color: AppTheme.errorColor), textAlign: TextAlign.center)),
        const SizedBox(height: 16),
        Center(child: ElevatedButton(onPressed: () => _load(refresh: true), child: const Text('Qayta urinish'))),
      ]);
    }
    if (_items.isEmpty) {
      return ListView(children: const [
        SizedBox(height: 120),
        Icon(Icons.inbox_outlined, size: 80, color: AppTheme.textHint),
        SizedBox(height: 16),
        Center(child: Text("E'lon topilmadi", style: TextStyle(color: AppTheme.textSecondary, fontSize: 15))),
        SizedBox(height: 4),
        Center(child: Text("Yangi e'lon kutilmoqda...", style: TextStyle(color: AppTheme.textHint, fontSize: 12))),
      ]);
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _items.length + (_cursor != null ? 1 : 0),
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (ctx, i) {
        if (i == _items.length) {
          return Center(child: Padding(padding: const EdgeInsets.all(16),
            child: _loading
              ? const CircularProgressIndicator(color: AppTheme.primary)
              : TextButton(onPressed: () => _load(refresh: false), child: const Text("Ko'proq"))));
        }
        return _AdCard(item: _items[i]);
      },
    );
  }
}

class _AdCard extends ConsumerWidget {
  final Map<String, dynamic> item;
  const _AdCard({required this.item});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final phone = (item['phone']?.toString() ?? '').trim();
    final text = item['messageText']?.toString() ?? '';
    final from = item['cargoFrom']?.toString() ?? '';
    final to = item['cargoTo']?.toString() ?? '';
    final vehicleType = item['vehicleType']?.toString();
    final capacity = item['vehicleCapacity']?.toString();
    final price = item['price'] is num ? (item['price'] as num).toInt() : null;
    final senderName = item['senderName']?.toString() ?? '';
    final senderTodayAds = item['senderTodayAds'] is int ? item['senderTodayAds'] as int : 0;
    final createdAt = item['createdAt'] != null ? DateTime.tryParse(item['createdAt'].toString()) : null;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
        border: Border.all(color: AppTheme.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: AppTheme.primary.withValues(alpha: 0.1),
              child: Text(senderName.isNotEmpty ? senderName[0].toUpperCase() : '?',
                style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.w700))),
            const SizedBox(width: 10),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(senderName.isEmpty ? 'Noma\'lum' : senderName,
                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                if (createdAt != null)
                  Text(DateFormat('HH:mm · dd.MM').format(createdAt),
                    style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
              ])),
            if (senderTodayAds > 0)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: AppTheme.warningColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(4)),
                child: Text('$senderTodayAds',
                  style: const TextStyle(color: AppTheme.warningColor, fontSize: 11, fontWeight: FontWeight.w700))),
          ]),
          const SizedBox(height: 10),
          if (from.isNotEmpty || to.isNotEmpty)
            Row(children: [
              const Icon(Icons.circle, size: 8, color: AppTheme.primary),
              const SizedBox(width: 6),
              Expanded(child: Text(from.isEmpty ? '—' : from,
                style: const TextStyle(fontWeight: FontWeight.w600))),
              const Icon(Icons.arrow_forward, size: 14, color: AppTheme.textHint),
              const SizedBox(width: 6),
              Expanded(child: Text(to.isEmpty ? '—' : to,
                style: const TextStyle(fontWeight: FontWeight.w600))),
            ]),
          if (vehicleType != null || capacity != null || (price != null && price > 0)) ...[
            const SizedBox(height: 8),
            Wrap(spacing: 6, runSpacing: 6, children: [
              if (vehicleType != null)
                _chip(vehicleType, AppTheme.primary),
              if (capacity != null)
                _chip(capacity, AppTheme.infoColor),
              if (price != null && price > 0)
                _chip('${NumberFormat.decimalPattern('uz').format(price)} so\'m', AppTheme.successColor),
            ]),
          ],
          if (text.isNotEmpty) ...[
            const SizedBox(height: 10),
            Text(text, maxLines: 3, overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 12, color: AppTheme.textPrimary, height: 1.3)),
          ],
          const SizedBox(height: 12),
          Row(children: [
            Expanded(
              child: ElevatedButton.icon(
                icon: const Icon(Icons.check_circle_outline, size: 16),
                label: const Text('Qabul qilish', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                onPressed: () => _accept(context, ref),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.accent,
                  padding: const EdgeInsets.symmetric(vertical: 10),
                ),
              ),
            ),
            const SizedBox(width: 6),
            _iconBtn(Icons.phone, AppTheme.primary,
              () => phone.isEmpty ? null : launchUrl(Uri.parse('tel:$phone')),
              tooltip: phone.isEmpty ? 'Telefon yo\'q' : phone),
            const SizedBox(width: 6),
            _iconBtn(Icons.person_search, AppTheme.infoColor,
              () => _requestDriver(context, ref),
              tooltip: 'Haydovchi topish'),
          ]),
        ],
      ),
    );
  }

  Widget _chip(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(6)),
      child: Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w600)),
    );
  }

  Widget _iconBtn(IconData icon, Color color, VoidCallback? onTap, {String? tooltip}) {
    return Tooltip(
      message: tooltip ?? '',
      child: Material(
        color: color,
        borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
          child: Padding(
            padding: const EdgeInsets.all(10),
            child: Icon(icon, color: Colors.white, size: 18),
          ),
        ),
      ),
    );
  }

  Future<void> _accept(BuildContext context, WidgetRef ref) async {
    try {
      final api = ref.read(apiClientProvider);
      await api.dio.post('/ads/${item['id']}/accept');
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✓ Qabul qilindi — "Qabul qilingan" tabga tushdi'),
            backgroundColor: AppTheme.successColor, duration: Duration(seconds: 2)));
      }
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Xatolik'), backgroundColor: AppTheme.errorColor));
      }
    }
  }

  Future<void> _requestDriver(BuildContext context, WidgetRef ref) async {
    final phone = item['phone']?.toString();
    try {
      await ref.read(adsServiceProvider).requestDriver(
        orderId: item['id']?.toString(),
        requestedPhone: phone, orderSnapshot: item);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('So\'rov yuborildi. Admin javob beradi.'),
            backgroundColor: AppTheme.successColor));
      }
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Xatolik'), backgroundColor: AppTheme.errorColor));
      }
    }
  }
}
