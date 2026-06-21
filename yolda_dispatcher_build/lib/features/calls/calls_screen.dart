import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../core/providers/providers.dart';

class CallsScreen extends ConsumerStatefulWidget {
  const CallsScreen({super.key});
  @override
  ConsumerState<CallsScreen> createState() => _CallsScreenState();
}

class _CallsScreenState extends ConsumerState<CallsScreen> {
  List<dynamic> _items = [];
  bool _loading = false;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final items = await ref.read(callsServiceProvider).history();
      setState(() { _items = items; _loading = false; });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgBody,
      appBar: AppBar(title: const Text("Qo'ng'iroqlar")),
      body: RefreshIndicator(
        onRefresh: _load,
        color: AppTheme.primary,
        child: _items.isEmpty && _loading
            ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
            : _items.isEmpty
                ? const Center(child: Text('Qo\'ng\'iroqlar tarixi bo\'sh', style: TextStyle(color: AppTheme.textSecondary)))
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: _items.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (_, i) => _CallTile(item: _items[i] as Map<String, dynamic>),
                  ),
      ),
    );
  }
}

class _CallTile extends StatelessWidget {
  final Map<String, dynamic> item;
  const _CallTile({required this.item});

  @override
  Widget build(BuildContext context) {
    final direction = item['direction'] as String?;
    final phone = item['phone'] as String?;
    final duration = (item['durationSec'] as int?) ?? 0;
    final vehicleType = item['vehicleType'] as String?;
    final senderRole = item['senderRole'] as String?;
    final startedAt = item['startedAt'] != null ? DateTime.tryParse(item['startedAt']) : null;
    final voiceSent = (item['voiceSent'] as bool?) ?? false;
    final isInbound = direction == 'INBOUND';

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: Colors.white,
        borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
        border: Border.all(color: AppTheme.cardBorder)),
      child: Row(children: [
        Container(width: 40, height: 40,
          decoration: BoxDecoration(color: (isInbound ? AppTheme.infoColor : AppTheme.successColor).withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(20)),
          child: Icon(isInbound ? Icons.call_received : Icons.call_made,
            color: isInbound ? AppTheme.infoColor : AppTheme.successColor)),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(phone ?? '—', style: const TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 2),
          Row(children: [
            if (startedAt != null)
              Text(DateFormat('HH:mm · dd.MM').format(startedAt),
                style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
            if (duration > 0) ...[
              const Text(' · ', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
              Text('${duration ~/ 60}:${(duration % 60).toString().padLeft(2, '0')}',
                style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
            ],
          ]),
          if (vehicleType != null || senderRole != null)
            Padding(padding: const EdgeInsets.only(top: 4),
              child: Wrap(spacing: 4, children: [
                if (vehicleType != null)
                  Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                    decoration: BoxDecoration(color: AppTheme.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(4)),
                    child: Text(vehicleType, style: const TextStyle(fontSize: 10, color: AppTheme.primary, fontWeight: FontWeight.w600))),
                if (senderRole != null)
                  Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                    decoration: BoxDecoration(
                      color: senderRole == 'SPAM' ? AppTheme.errorColor.withValues(alpha: 0.1) : AppTheme.accent.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(4)),
                    child: Text(senderRole, style: TextStyle(fontSize: 10,
                      color: senderRole == 'SPAM' ? AppTheme.errorColor : AppTheme.accent,
                      fontWeight: FontWeight.w600))),
              ])),
        ])),
        if (voiceSent) const Icon(Icons.mic, color: AppTheme.successColor, size: 18),
      ]),
    );
  }
}
