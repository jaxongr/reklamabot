import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';

import '../../config/silk_theme.dart';
import '../../core/api/api_client.dart';
import '../../core/models/user.dart';
import '../auth/auth_provider.dart';

/// Dispetcher birinchi kirganida — ism, raqam, jins so'rash
class ProfileCompletionScreen extends ConsumerStatefulWidget {
  final VoidCallback onComplete;

  const ProfileCompletionScreen({super.key, required this.onComplete});

  @override
  ConsumerState<ProfileCompletionScreen> createState() =>
      _ProfileCompletionScreenState();
}

class _ProfileCompletionScreenState
    extends ConsumerState<ProfileCompletionScreen> {
  final _nameCtrl = TextEditingController();
  final _lastNameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  String _gender = 'MALE';
  bool _saving = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _lastNameCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final name = _nameCtrl.text.trim();
    final phone = _phoneCtrl.text.trim();

    if (name.isEmpty) {
      _showError('Ismingizni kiriting');
      return;
    }
    if (phone.replaceAll(RegExp(r'\D'), '').length < 9) {
      _showError('Telefon raqamni kiriting');
      return;
    }

    setState(() => _saving = true);
    try {
      final api = ref.read(apiClientProvider);
      final response = await api.patch('/users/me', data: {
        'firstName': name,
        'lastName': _lastNameCtrl.text.trim().isEmpty ? null : _lastNameCtrl.text.trim(),
        'phoneNumber': phone,
        'gender': _gender,
      });

      final status = response.statusCode ?? 0;
      final body = response.data;

      // Controller 200 qaytarsa ham {error: ...} bo'lishi mumkin
      final hasErrorField = body is Map && body['error'] != null;
      final isOk = status >= 200 && status < 300 && !hasErrorField;

      if (!isOk) {
        // Haqiqiy xato — backend xabari bo'lsa ko'rsatamiz
        String msg = "Ma'lumot saqlanmadi, qayta urinib ko'ring";
        if (body is Map) {
          final raw = body['error'] ?? body['message'];
          if (raw is String && raw.trim().isNotEmpty) {
            msg = raw;
          } else if (raw is List && raw.isNotEmpty) {
            msg = raw.join(', ');
          }
        }
        _showError(msg);
        return;
      }

      // ✅ MUVAFFAQIYAT — server saqladi (2xx, error yo'q).
      // Javobdagi user'ni darhol ishlatamiz (bo'lsa); aks holda onComplete
      // baribir serverdan profilni qayta yuklaydi — shuning uchun BLOKLAMAYMIZ.
      try {
        if (body is Map<String, dynamic> && body['firstName'] != null) {
          ref.read(authStateProvider.notifier).refreshUser(User.fromJson(body));
        }
      } catch (_) {
        // Parse muammosi muhim emas — onComplete profilni qayta yuklaydi
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Ma'lumotlar saqlandi!"),
            backgroundColor: SilkTheme.success,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
      widget.onComplete();
    } on DioException catch (e) {
      final data = e.response?.data;
      String msg;
      if (data is Map) {
        msg = (data['message'] ?? data['error'] ?? e.message).toString();
        // Validation xatolari
        if (data['message'] is List) {
          msg = (data['message'] as List).join(', ');
        }
      } else {
        msg = e.message ?? 'Tarmoq xatosi';
      }
      _showError(msg);
    } catch (e) {
      _showError("Xato: $e");
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: SilkTheme.danger,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SilkTheme.bgOf(context),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 40),

              // Icon
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: SilkTheme.brand.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.person_add_rounded,
                    size: 40, color: SilkTheme.brand),
              ),

              const SizedBox(height: 20),

              Text(
                "Ma'lumotlaringiz",
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                  color: SilkTheme.inkOf(context),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                "Ilovadan foydalanish uchun\nma'lumotlaringizni kiriting",
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  color: SilkTheme.mutedOf(context),
                  height: 1.5,
                ),
              ),

              const SizedBox(height: 32),

              // Forma
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: SilkTheme.surfaceOf(context),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: SilkTheme.borderOf(context)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _label('Ism *'),
                    const SizedBox(height: 6),
                    _input(_nameCtrl, 'Ismingiz', Icons.person_rounded),

                    const SizedBox(height: 14),

                    _label('Familiya'),
                    const SizedBox(height: 6),
                    _input(_lastNameCtrl, 'Familiyangiz', Icons.person_outlined),

                    const SizedBox(height: 14),

                    _label('Telefon raqam *'),
                    const SizedBox(height: 6),
                    _input(_phoneCtrl, '+998 90 123 45 67', Icons.phone_rounded,
                        keyboardType: TextInputType.phone),

                    const SizedBox(height: 18),

                    _label('Jins'),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: _genderCard(
                            icon: Icons.male_rounded,
                            label: 'Erkak',
                            value: 'MALE',
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _genderCard(
                            icon: Icons.female_rounded,
                            label: 'Ayol',
                            value: 'FEMALE',
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Saqlash
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _saving ? null : _save,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: SilkTheme.brand,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _saving
                      ? const SizedBox(
                          width: 22, height: 22,
                          child: CircularProgressIndicator(
                              strokeWidth: 2.5, color: Colors.white))
                      : const Text('Davom etish',
                          style: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.w600)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _label(String text) => Text(
        text,
        style: TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: SilkTheme.inkOf(context),
        ),
      );

  Widget _input(TextEditingController ctrl, String hint, IconData icon,
      {TextInputType? keyboardType}) {
    return TextField(
      controller: ctrl,
      keyboardType: keyboardType,
      style: TextStyle(fontSize: 15, color: SilkTheme.inkOf(context)),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: SilkTheme.muted2Of(context)),
        prefixIcon: Icon(icon, color: SilkTheme.brand, size: 20),
        filled: true,
        fillColor: SilkTheme.bgOf(context),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: SilkTheme.borderOf(context)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: SilkTheme.borderOf(context)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: SilkTheme.brand, width: 1.5),
        ),
      ),
    );
  }

  Widget _genderCard({
    required IconData icon,
    required String label,
    required String value,
  }) {
    final isSelected = _gender == value;
    return GestureDetector(
      onTap: () => setState(() => _gender = value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: isSelected
              ? SilkTheme.brand.withValues(alpha: 0.08)
              : SilkTheme.bgOf(context),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? SilkTheme.brand : SilkTheme.borderOf(context),
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Column(
          children: [
            Icon(icon, size: 28,
                color: isSelected ? SilkTheme.brand : SilkTheme.muted2Of(context)),
            const SizedBox(height: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                color: isSelected
                    ? SilkTheme.brand
                    : SilkTheme.mutedOf(context),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
