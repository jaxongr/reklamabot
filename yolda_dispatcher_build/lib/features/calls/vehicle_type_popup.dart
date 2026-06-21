import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/theme.dart';
import '../../core/providers/providers.dart';

class VehicleTypePopup {
  static GlobalKey<NavigatorState>? navKey;

  static void show(Ref ref, {required String callId, required String phone}) {
    final context = navKey?.currentContext;
    if (context == null) return;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _PopupContent(ref: ref, callId: callId, phone: phone),
    );
  }
}

class _PopupContent extends StatefulWidget {
  final Ref ref;
  final String callId;
  final String phone;
  const _PopupContent({required this.ref, required this.callId, required this.phone});
  @override
  State<_PopupContent> createState() => _PopupContentState();
}

class _PopupContentState extends State<_PopupContent> {
  String? _vehicleType;
  String? _capacity;
  String? _senderRole;

  final _vehicles = const ['FURA','KAMAZ','ISUZU','GAZEL','MAN','MERCEDES','SCANIA','VOLVO','DAF','HOWO','SHACMAN','LABO','DAMAS','TENTLI','REFRIJERATOR'];

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      padding: EdgeInsets.only(left: 24, right: 24, top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Center(child: Container(width: 40, height: 4,
            decoration: BoxDecoration(color: AppTheme.cardBorder, borderRadius: BorderRadius.circular(2)))),
          const SizedBox(height: 16),
          const Text('Qo\'ng\'iroq tasnifi', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          Text(widget.phone, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 14)),
          const SizedBox(height: 20),
          const Text('Mashina turi', style: TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Wrap(spacing: 8, runSpacing: 8,
            children: _vehicles.map((v) => ChoiceChip(
              label: Text(v), selected: _vehicleType == v,
              onSelected: (_) => setState(() => _vehicleType = v),
            )).toList()),
          const SizedBox(height: 16),
          const Text('Sig\'imi (ixtiyoriy)', style: TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          TextField(decoration: const InputDecoration(hintText: 'Masalan: 20 tonna, 45 kub'),
            onChanged: (v) => _capacity = v),
          const SizedBox(height: 16),
          const Text('Rol', style: TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Row(children: [
            _buildRoleBtn('CARGO_OWNER', 'Yuk sohibi', Icons.inventory_2),
            const SizedBox(width: 8),
            _buildRoleBtn('DRIVER', 'Haydovchi', Icons.local_shipping),
            const SizedBox(width: 8),
            _buildRoleBtn('SPAM', 'Spam', Icons.block),
          ]),
          const SizedBox(height: 24),
          ElevatedButton(onPressed: _save, child: const Text('Saqlash')),
          const SizedBox(height: 8),
          TextButton(onPressed: () => Navigator.pop(context), child: const Text("O'tkazib yuborish")),
        ],
      ),
    );
  }

  Widget _buildRoleBtn(String value, String label, IconData icon) {
    final selected = _senderRole == value;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _senderRole = value),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: selected ? AppTheme.primary : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: selected ? AppTheme.primary : AppTheme.cardBorder),
          ),
          child: Column(children: [
            Icon(icon, color: selected ? Colors.white : AppTheme.primary, size: 20),
            const SizedBox(height: 4),
            Text(label, style: TextStyle(color: selected ? Colors.white : AppTheme.primary,
              fontSize: 12, fontWeight: FontWeight.w600)),
          ]),
        ),
      ),
    );
  }

  Future<void> _save() async {
    try {
      await widget.ref.read(callsServiceProvider).classify(widget.callId,
        vehicleType: _vehicleType, vehicleCapacity: _capacity, senderRole: _senderRole);
    } catch (_) {}
    if (mounted) Navigator.pop(context);
  }
}
