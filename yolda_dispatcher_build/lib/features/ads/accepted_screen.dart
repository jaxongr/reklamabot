import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../core/providers/providers.dart';

class AcceptedScreen extends ConsumerStatefulWidget {
  const AcceptedScreen({super.key});
  @override
  ConsumerState<AcceptedScreen> createState() => _AcceptedScreenState();
}

class _AcceptedScreenState extends ConsumerState<AcceptedScreen> {
  List<dynamic> _items = [];
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final api = ref.read(apiClientProvider);
      final r = await api.dio.get('/ads/accepted');
      setState(() { _items = List<dynamic>.from(r.data); _loading = false; });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  Future<void> _unaccept(String orderId) async {
    try {
      final api = ref.read(apiClientProvider);
      await api.dio.post('/ads/$orderId/unaccept');
      setState(() => _items.removeWhere((i) => i['id'] == orderId));
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgBody,
      appBar: AppBar(title: const Text('Qabul qilingan')),
      body: RefreshIndicator(
        onRefresh: _load,
        color: AppTheme.primary,
        child: _loading && _items.isEmpty
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
          : _items.isEmpty
            ? ListView(children: const [
                SizedBox(height: 200),
                Center(child: Icon(Icons.inbox_outlined, size: 64, color: AppTheme.textHint)),
                SizedBox(height: 16),
                Center(child: Text('Qabul qilingan e\'lon yo\'q', style: TextStyle(color: AppTheme.textSecondary))),
              ])
            : ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: _items.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (_, i) => _AcceptedCard(
                  item: _items[i] as Map<String, dynamic>,
                  onRemove: () => _unaccept(_items[i]['id'] as String),
                ),
              ),
      ),
    );
  }
}

class _AcceptedCard extends ConsumerWidget {
  final Map<String, dynamic> item;
  final VoidCallback onRemove;
  const _AcceptedCard({required this.item, required this.onRemove});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final phone = (item['phone'] as String?) ?? '';
    final from = (item['cargoFrom'] as String?) ?? '—';
    final to = (item['cargoTo'] as String?) ?? '—';
    final vehicleType = (item['vehicleType'] as String?);
    final senderName = (item['senderName'] as String?) ?? '';
    final acceptedAt = item['acceptedAt'] != null ? DateTime.tryParse(item['acceptedAt'].toString()) : null;
    final calledAt = item['calledAt'];

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
        border: Border.all(color: AppTheme.accent.withValues(alpha: 0.4), width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: AppTheme.accent.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Text('✓ Qabul qilingan',
                style: TextStyle(color: AppTheme.accent, fontSize: 11, fontWeight: FontWeight.w700)),
            ),
            const Spacer(),
            if (acceptedAt != null)
              Text(DateFormat('HH:mm').format(acceptedAt),
                style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
          ]),
          const SizedBox(height: 10),
          if (senderName.isNotEmpty)
            Text(senderName, style: const TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 6),
          Row(children: [
            const Icon(Icons.circle, size: 8, color: AppTheme.primary),
            const SizedBox(width: 6),
            Expanded(child: Text(from, style: const TextStyle(fontWeight: FontWeight.w600))),
            const Icon(Icons.arrow_forward, size: 14, color: AppTheme.textHint),
            const SizedBox(width: 6),
            Expanded(child: Text(to, style: const TextStyle(fontWeight: FontWeight.w600))),
          ]),
          if (vehicleType != null) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppTheme.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(vehicleType, style: const TextStyle(color: AppTheme.primary, fontSize: 12, fontWeight: FontWeight.w600)),
            ),
          ],
          const SizedBox(height: 12),
          Row(children: [
            Expanded(
              child: ElevatedButton.icon(
                icon: Icon(calledAt != null ? Icons.check : Icons.phone, size: 16),
                label: Text(phone, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                onPressed: phone.isEmpty ? null : () => launchUrl(Uri.parse('tel:$phone')),
              ),
            ),
            const SizedBox(width: 8),
            IconButton(
              onPressed: onRemove,
              icon: const Icon(Icons.close, size: 18),
              tooltip: 'Voz kechish',
              style: IconButton.styleFrom(
                backgroundColor: AppTheme.errorColor.withValues(alpha: 0.1),
                foregroundColor: AppTheme.errorColor,
              ),
            ),
          ]),
        ],
      ),
    );
  }
}
