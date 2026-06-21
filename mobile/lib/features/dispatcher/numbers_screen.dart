import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/api_config.dart';
import '../../config/silk_theme.dart';
import '../../core/api/api_client.dart';

/// Dispetcher — E'lon uchun raqamlar sahifasi.
/// Raqamlar backendda saqlanadi: GET/PATCH /users/ad-phones
class NumbersScreen extends ConsumerStatefulWidget {
  const NumbersScreen({super.key});

  @override
  ConsumerState<NumbersScreen> createState() => _NumbersScreenState();
}

class _NumbersScreenState extends ConsumerState<NumbersScreen> {
  final _newNumberController = TextEditingController();

  final List<String> _numbers = [];
  bool _isLoading = true;
  bool _isSaving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadNumbers();
  }

  @override
  void dispose() {
    _newNumberController.dispose();
    super.dispose();
  }

  /// Backenddan raqamlarni yuklash
  Future<void> _loadNumbers() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final api = ref.read(apiClientProvider);
      final resp = await api.get(ApiConfig.userAdPhones);
      final data = resp.data;
      final List<String> loaded = [];
      if (data is List) {
        for (final item in data) {
          if (item is String && item.trim().isNotEmpty) loaded.add(item);
        }
      }
      if (!mounted) return;
      setState(() {
        _numbers
          ..clear()
          ..addAll(loaded);
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _error = 'Raqamlarni yuklab bo\'lmadi';
      });
    }
  }

  /// O'zgargan ro'yxatni backendga saqlash
  Future<bool> _persist() async {
    setState(() => _isSaving = true);
    try {
      final api = ref.read(apiClientProvider);
      await api.patch(ApiConfig.userAdPhones, data: {'phones': _numbers});
      if (mounted) setState(() => _isSaving = false);
      return true;
    } catch (e) {
      if (mounted) setState(() => _isSaving = false);
      return false;
    }
  }

  Future<void> _addNumber() async {
    final number = _newNumberController.text.trim();
    if (number.isEmpty) return;
    if (_numbers.contains(number)) {
      _toast('Bu raqam allaqachon mavjud', SilkTheme.accent2);
      return;
    }

    setState(() {
      _numbers.add(number);
      _newNumberController.clear();
    });

    final ok = await _persist();
    if (!mounted) return;
    if (ok) {
      _toast('Raqam qo\'shildi', SilkTheme.success);
    } else {
      // Saqlanmasa — orqaga qaytaramiz
      setState(() => _numbers.remove(number));
      _toast('Saqlashda xatolik. Qayta urinib ko\'ring', SilkTheme.danger);
    }
  }

  Future<void> _removeNumber(int index) async {
    if (index < 0 || index >= _numbers.length) return;
    final removed = _numbers[index];
    setState(() => _numbers.removeAt(index));

    final ok = await _persist();
    if (!mounted) return;
    if (ok) {
      _toast('$removed o\'chirildi', SilkTheme.danger);
    } else {
      // Saqlanmasa — qaytaramiz
      setState(() => _numbers.insert(index.clamp(0, _numbers.length), removed));
      _toast('O\'chirishni saqlab bo\'lmadi', SilkTheme.danger);
    }
  }

  void _toast(String text, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(text),
        backgroundColor: color,
        duration: const Duration(seconds: 1),
      ),
    );
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
        title: const Text("E'lon uchun raqamlar"),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: SilkTheme.brand))
          : RefreshIndicator(
              color: SilkTheme.brand,
              onRefresh: _loadNumbers,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // ── Description ──
                  const Text(
                    "Buyurtma qabul qilganda sizning raqamingiz bilan almashtiriladi",
                    style: TextStyle(
                      fontSize: 14,
                      color: SilkTheme.muted,
                    ),
                  ),
                  const SizedBox(height: 16),

                  if (_error != null) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: SilkTheme.danger.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.error_outline,
                              color: SilkTheme.danger, size: 20),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(_error!,
                                style: const TextStyle(
                                    color: SilkTheme.danger, fontSize: 13)),
                          ),
                          TextButton(
                            onPressed: _loadNumbers,
                            child: const Text('Qayta'),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],

                  // ── Empty holat ──
                  if (_numbers.isEmpty && _error == null)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 24),
                      child: Center(
                        child: Text(
                          "Hali raqam qo'shilmagan",
                          style: TextStyle(
                            color: SilkTheme.muted,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ),

                  // ── Numbers list ──
                  ..._numbers.asMap().entries.map((entry) {
                    final index = entry.key;
                    final number = entry.value;
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 12),
                        decoration: BoxDecoration(
                          color: SilkTheme.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: SilkTheme.border,
                            width: 1,
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: SilkTheme.brand.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(
                                Icons.phone,
                                color: SilkTheme.brand,
                                size: 20,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                number,
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w500,
                                  color: SilkTheme.ink,
                                ),
                              ),
                            ),
                            IconButton(
                              onPressed:
                                  _isSaving ? null : () => _removeNumber(index),
                              icon: const Icon(
                                Icons.delete_outline,
                                color: SilkTheme.danger,
                                size: 22,
                              ),
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(
                                minWidth: 36,
                                minHeight: 36,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }),
                  const SizedBox(height: 8),

                  // ── Add number section ──
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _newNumberController,
                          keyboardType: TextInputType.phone,
                          decoration: const InputDecoration(
                            hintText: 'Yangi raqam...',
                          ),
                          onFieldSubmitted: (_) => _addNumber(),
                        ),
                      ),
                      const SizedBox(width: 10),
                      SizedBox(
                        height: 48,
                        child: ElevatedButton(
                          onPressed: _isSaving ? null : _addNumber,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: SilkTheme.brand,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            padding: const EdgeInsets.symmetric(horizontal: 18),
                          ),
                          child: _isSaving
                              ? const SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2.5,
                                    color: Colors.white,
                                  ),
                                )
                              : const Text(
                                  "Qo'shish",
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // ── Info card ──
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: SilkTheme.brand.withValues(alpha: 0.06),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(
                          Icons.info_outline,
                          color: SilkTheme.brand,
                          size: 20,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            "Buyurtma qabul qilganingizda, yuk egasining raqami sizning e'lon raqamingiz bilan almashtiriladi",
                            style: TextStyle(
                              fontSize: 13,
                              color: SilkTheme.ink.withValues(alpha: 0.8),
                              height: 1.4,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
