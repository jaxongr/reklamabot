import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/silk_theme.dart';
import '../../core/api/api_client.dart';
import '../auth/auth_provider.dart';
import '../../core/services/auth_service.dart';

class DispatcherProfileScreen extends ConsumerStatefulWidget {
  const DispatcherProfileScreen({super.key});

  @override
  ConsumerState<DispatcherProfileScreen> createState() => _DispatcherProfileScreenState();
}

class _DispatcherProfileScreenState extends ConsumerState<DispatcherProfileScreen> {
  final _firstNameCtrl = TextEditingController();
  final _lastNameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  String _gender = 'MALE';
  bool _saving = false;
  bool _loaded = false;

  @override
  void dispose() {
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  void _loadFromUser() {
    if (_loaded) return;
    final user = ref.read(authStateProvider).user;
    if (user != null) {
      _firstNameCtrl.text = user.firstName ?? '';
      _lastNameCtrl.text = user.lastName ?? '';
      _phoneCtrl.text = user.phoneNumber ?? '';
      // gender User modelda yo'q — default MALE
      _loaded = true;
    }
  }

  Future<void> _save() async {
    if (_firstNameCtrl.text.trim().isEmpty) {
      _showMsg('Ismingizni kiriting', true);
      return;
    }
    setState(() => _saving = true);
    try {
      final api = ref.read(apiClientProvider);
      await api.patch('/users/me', data: {
        'firstName': _firstNameCtrl.text.trim(),
        'lastName': _lastNameCtrl.text.trim().isEmpty ? null : _lastNameCtrl.text.trim(),
        'phoneNumber': _phoneCtrl.text.trim(),
        'gender': _gender,
      });

      // Refresh auth state
      try {
        final authService = ref.read(authServiceProvider);
        final updated = await authService.getProfile();
        ref.read(authStateProvider.notifier).refreshUser(updated);
      } catch (_) {}

      _showMsg("Ma'lumotlar saqlandi!", false);
    } catch (e) {
      _showMsg("Xato: $e", true);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  void _showMsg(String msg, bool isError) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: isError ? SilkTheme.danger : SilkTheme.success,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    final user = authState.user;
    _loadFromUser();

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
        title: const Text("Profil"),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Avatar + info header
          Center(
            child: Column(
              children: [
                CircleAvatar(
                  radius: 44,
                  backgroundColor: SilkTheme.brand.withValues(alpha: 0.1),
                  child: Text(
                    (user?.firstName ?? 'D')[0].toUpperCase(),
                    style: TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: SilkTheme.brand),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  [user?.firstName, user?.lastName].where((e) => e != null && e.isNotEmpty).join(' '),
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: SilkTheme.inkOf(context)),
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: SilkTheme.brand.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    user?.role == 'SUPER_ADMIN' ? 'Super Admin' : user?.role == 'ADMIN' ? 'Admin' : 'Dispetcher',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: SilkTheme.brand),
                  ),
                ),
                if (user?.telegramId != null) ...[
                  const SizedBox(height: 4),
                  Text('ID: ${user!.telegramId}', style: TextStyle(fontSize: 11, color: SilkTheme.muted2Of(context))),
                ],
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Form
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: SilkTheme.surfaceOf(context),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: SilkTheme.borderOf(context)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _label('Ism'),
                const SizedBox(height: 6),
                _input(_firstNameCtrl, 'Ismingiz', Icons.person_rounded),

                const SizedBox(height: 14),
                _label('Familiya'),
                const SizedBox(height: 6),
                _input(_lastNameCtrl, 'Familiyangiz', Icons.person_outlined),

                const SizedBox(height: 14),
                _label('Telefon raqam'),
                const SizedBox(height: 6),
                _input(_phoneCtrl, '+998 90 123 45 67', Icons.phone_rounded, keyboardType: TextInputType.phone),

                const SizedBox(height: 16),
                _label('Jins'),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(child: _genderCard(Icons.male_rounded, 'Erkak', 'MALE')),
                    const SizedBox(width: 12),
                    Expanded(child: _genderCard(Icons.female_rounded, 'Ayol', 'FEMALE')),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Info cards
          _infoTile(Icons.calendar_today_outlined, "Ro'yxatdan o'tgan",
            _formatDate(user!.createdAt)),
          _infoTile(Icons.star_outline, 'Obuna', "—"),

          const SizedBox(height: 24),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
          child: SizedBox(
            height: 50,
            child: ElevatedButton(
              onPressed: _saving ? null : _save,
              style: ElevatedButton.styleFrom(
                backgroundColor: SilkTheme.brand,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: _saving
                  ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
                  : const Text('Saqlash', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
            ),
          ),
        ),
      ),
    );
  }

  Widget _label(String text) => Text(text,
    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: SilkTheme.inkOf(context)));

  Widget _input(TextEditingController ctrl, String hint, IconData icon, {TextInputType? keyboardType}) {
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
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: SilkTheme.borderOf(context))),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: SilkTheme.borderOf(context))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: SilkTheme.brand, width: 1.5)),
      ),
    );
  }

  Widget _genderCard(IconData icon, String label, String value) {
    final sel = _gender == value;
    return GestureDetector(
      onTap: () => setState(() => _gender = value),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: sel ? SilkTheme.brand.withValues(alpha: 0.08) : SilkTheme.bgOf(context),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: sel ? SilkTheme.brand : SilkTheme.borderOf(context), width: sel ? 1.5 : 1),
        ),
        child: Column(
          children: [
            Icon(icon, size: 28, color: sel ? SilkTheme.brand : SilkTheme.muted2Of(context)),
            const SizedBox(height: 6),
            Text(label, style: TextStyle(fontSize: 14, fontWeight: sel ? FontWeight.w600 : FontWeight.w400, color: sel ? SilkTheme.brand : SilkTheme.mutedOf(context))),
          ],
        ),
      ),
    );
  }

  Widget _infoTile(IconData icon, String label, String value) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: SilkTheme.surfaceOf(context),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: SilkTheme.borderOf(context)),
      ),
      child: Row(
        children: [
          Icon(icon, size: 20, color: SilkTheme.mutedOf(context)),
          const SizedBox(width: 12),
          Text(label, style: TextStyle(fontSize: 14, color: SilkTheme.mutedOf(context))),
          const Spacer(),
          Text(value, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: SilkTheme.inkOf(context))),
        ],
      ),
    );
  }

  String _formatDate(DateTime d) => '${d.day.toString().padLeft(2, '0')}.${d.month.toString().padLeft(2, '0')}.${d.year}';
}
