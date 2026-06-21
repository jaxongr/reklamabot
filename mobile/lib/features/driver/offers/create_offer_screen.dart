import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../config/theme.dart';
import '../driver_provider.dart';

class CreateOfferScreen extends ConsumerStatefulWidget {
  const CreateOfferScreen({super.key});

  @override
  ConsumerState<CreateOfferScreen> createState() => _CreateOfferScreenState();
}

class _CreateOfferScreenState extends ConsumerState<CreateOfferScreen> {
  final _formKey = GlobalKey<FormState>();
  final _fromCityCtrl = TextEditingController();
  final _toCityCtrl = TextEditingController();
  final _priceCtrl = TextEditingController();
  final _descriptionCtrl = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _fromCityCtrl.dispose();
    _toCityCtrl.dispose();
    _priceCtrl.dispose();
    _descriptionCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    final profile = ref.read(driverProfileProvider).profile;

    final success = await ref.read(driverOffersProvider.notifier).createOffer({
      'fromCity': _fromCityCtrl.text.trim(),
      'toCity': _toCityCtrl.text.trim(),
      'vehicleType': profile?.vehicleType ?? 'Fura',
      'vehicleCapacity': profile?.vehicleCapacity,
      'phone': profile?.phone ?? '',
      'price': _priceCtrl.text.trim().isNotEmpty ? _priceCtrl.text.trim() : null,
      'description': _descriptionCtrl.text.trim().isNotEmpty ? _descriptionCtrl.text.trim() : null,
    });

    setState(() => _isSubmitting = false);

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Taklif yaratildi!'), backgroundColor: Color(0xFF4CAF50)),
      );
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final profile = ref.watch(driverProfileProvider).profile;

    return Scaffold(
      backgroundColor: AppTheme.bgBodyOf(context),
      appBar: AppBar(
        title: const Text('Yangi taklif'),
        backgroundColor: AppTheme.cardBgOf(context),
        foregroundColor: AppTheme.textPrimaryOf(context),
        elevation: 0.5,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Auto-filled info
            if (profile != null)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: const Color(0xFF4CAF50).withValues(alpha: 0.06),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.local_shipping, color: Color(0xFF4CAF50), size: 20),
                    const SizedBox(width: 10),
                    Text(
                      '${profile.vehicleType ?? "—"} | ${profile.vehicleCapacity ?? "—"} | ${profile.phone ?? "—"}',
                      style: const TextStyle(fontSize: 13),
                    ),
                  ],
                ),
              ),

            TextFormField(
              controller: _fromCityCtrl,
              decoration: const InputDecoration(
                labelText: 'Qayerdan',
                hintText: 'Masalan: Toshkent',
                prefixIcon: Icon(Icons.location_on_outlined),
              ),
              validator: (v) => v == null || v.trim().isEmpty ? 'Kiriting' : null,
            ),
            const SizedBox(height: 12),

            TextFormField(
              controller: _toCityCtrl,
              decoration: const InputDecoration(
                labelText: 'Qayerga',
                hintText: 'Masalan: Samarqand',
                prefixIcon: Icon(Icons.flag_outlined),
              ),
              validator: (v) => v == null || v.trim().isEmpty ? 'Kiriting' : null,
            ),
            const SizedBox(height: 12),

            TextFormField(
              controller: _priceCtrl,
              decoration: const InputDecoration(
                labelText: 'Narx (ixtiyoriy)',
                hintText: 'Masalan: 2,000,000 UZS',
                prefixIcon: Icon(Icons.payments_outlined),
              ),
            ),
            const SizedBox(height: 12),

            TextFormField(
              controller: _descriptionCtrl,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Izoh (ixtiyoriy)',
                hintText: 'Qo\'shimcha ma\'lumot...',
                prefixIcon: Icon(Icons.notes_outlined),
              ),
            ),

            const SizedBox(height: 24),

            SizedBox(
              height: 50,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4CAF50),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white),
                      )
                    : const Text('Taklif yaratish', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
