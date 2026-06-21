import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../config/api_config.dart';
import '../../config/silk_theme.dart';
import '../../core/api/api_client.dart';

/// Dispetcher — Buyurtma yaratish sahifasi
class CreateOrderScreen extends ConsumerStatefulWidget {
  const CreateOrderScreen({super.key});

  @override
  ConsumerState<CreateOrderScreen> createState() => _CreateOrderScreenState();
}

class _CreateOrderScreenState extends ConsumerState<CreateOrderScreen> {
  final _formKey = GlobalKey<FormState>();

  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _weightController = TextEditingController();
  final _priceController = TextEditingController();
  final _noteController = TextEditingController();

  String? _fromCity;
  String? _toCity;
  String? _vehicleType;
  bool _isSubmitting = false;

  static const _cities = [
    'Toshkent',
    'Samarqand',
    "Farg'ona",
    'Andijon',
    'Buxoro',
    'Qashqadaryo',
    'Xorazm',
    'Navoiy',
    'Jizzax',
    'Surxondaryo',
    'Sirdaryo',
    'Namangan',
  ];

  static const _vehicleTypes = [
    'Tentli',
    'Refrijerator',
    'Bortli',
    'Konteyner',
    'Samosval',
  ];

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _weightController.dispose();
    _priceController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    try {
      final api = ref.read(apiClientProvider);
      await api.post(
        ApiConfig.orders,
        data: {
          'senderName': _nameController.text.trim(),
          'phone': _phoneController.text.trim(),
          'cargoFrom': _fromCity,
          'cargoTo': _toCity,
          'vehicleType': _vehicleType,
          'weight': _weightController.text.trim(),
          'price': _priceController.text.trim(),
          'note': _noteController.text.trim(),
        },
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Buyurtma muvaffaqiyatli yaratildi'),
            backgroundColor: SilkTheme.success,
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Buyurtma yaratishda xatolik'),
            backgroundColor: SilkTheme.danger,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SilkTheme.bg,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Buyurtma yaratish'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // ── Yuk egasi ismi ──
            _buildLabel('Yuk egasi ismi'),
            const SizedBox(height: 6),
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(
                hintText: 'Ism kiriting',
              ),
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Ismni kiriting' : null,
            ),
            const SizedBox(height: 14),

            // ── Telefon raqami ──
            _buildLabel('Telefon raqami'),
            const SizedBox(height: 6),
            TextFormField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                hintText: '+998 XX XXX XX XX',
              ),
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Raqam kiriting' : null,
            ),
            const SizedBox(height: 14),

            // ── Qayerdan / Qayerga ──
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildLabel('Qayerdan'),
                      const SizedBox(height: 6),
                      DropdownButtonFormField<String>(
                        value: _fromCity,
                        decoration: const InputDecoration(
                          hintText: 'Shahar',
                        ),
                        items: _cities
                            .map((c) =>
                                DropdownMenuItem(value: c, child: Text(c)))
                            .toList(),
                        onChanged: (v) => setState(() => _fromCity = v),
                        validator: (v) => v == null ? 'Tanlang' : null,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildLabel('Qayerga'),
                      const SizedBox(height: 6),
                      DropdownButtonFormField<String>(
                        value: _toCity,
                        decoration: const InputDecoration(
                          hintText: 'Shahar',
                        ),
                        items: _cities
                            .map((c) =>
                                DropdownMenuItem(value: c, child: Text(c)))
                            .toList(),
                        onChanged: (v) => setState(() => _toCity = v),
                        validator: (v) => v == null ? 'Tanlang' : null,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // ── Mashina turi / Og'irlik ──
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildLabel('Mashina turi'),
                      const SizedBox(height: 6),
                      DropdownButtonFormField<String>(
                        value: _vehicleType,
                        decoration: const InputDecoration(
                          hintText: 'Turi',
                        ),
                        items: _vehicleTypes
                            .map((t) =>
                                DropdownMenuItem(value: t, child: Text(t)))
                            .toList(),
                        onChanged: (v) => setState(() => _vehicleType = v),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildLabel("Og'irlik"),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: _weightController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          hintText: '0',
                          suffixText: 't',
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // ── Narx ──
            _buildLabel('Narx (UZS)'),
            const SizedBox(height: 6),
            TextFormField(
              controller: _priceController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                hintText: 'Narxni kiriting',
              ),
            ),
            const SizedBox(height: 14),

            // ── Izoh ──
            _buildLabel("Qo'shimcha izoh"),
            const SizedBox(height: 6),
            TextFormField(
              controller: _noteController,
              maxLines: 3,
              decoration: const InputDecoration(
                hintText: 'Izoh...',
              ),
            ),
            const SizedBox(height: 20),

            // ── E'lon qilish ──
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: SilkTheme.brand,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          color: Colors.white,
                        ),
                      )
                    : const Text(
                        "E'lon qilish",
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
              ),
            ),
            const SizedBox(height: 8),

            // ── Testr narx ──
            SizedBox(
              width: double.infinity,
              height: 52,
              child: OutlinedButton(
                onPressed: () => context.push('/dispatcher/testr'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: SilkTheme.brand,
                  side: const BorderSide(color: SilkTheme.brand, width: 1.5),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'Testr narx',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w600,
        color: SilkTheme.ink,
      ),
    );
  }
}
