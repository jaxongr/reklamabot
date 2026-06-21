import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../config/routes.dart';
import '../../config/silk_theme.dart';
import '../../core/services/auth_service.dart';
import 'auth_provider.dart';

/// YO'LDA Driver — telefon + parol login
class DriverLoginScreen extends ConsumerStatefulWidget {
  const DriverLoginScreen({super.key});

  @override
  ConsumerState<DriverLoginScreen> createState() => _DriverLoginScreenState();
}

class _DriverLoginScreenState extends ConsumerState<DriverLoginScreen>
    with SingleTickerProviderStateMixin {
  final _phoneCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _phoneFocus = FocusNode();
  final _passwordFocus = FocusNode();
  bool _obscurePassword = true;
  bool _needsNewPassword = false;
  final _newPasswordCtrl = TextEditingController();
  final _confirmPasswordCtrl = TextEditingController();

  late AnimationController _animController;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _fadeAnim = CurvedAnimation(parent: _animController, curve: Curves.easeOut);
    _animController.forward();
  }

  @override
  void dispose() {
    _phoneCtrl.dispose();
    _passwordCtrl.dispose();
    _newPasswordCtrl.dispose();
    _confirmPasswordCtrl.dispose();
    _phoneFocus.dispose();
    _passwordFocus.dispose();
    _animController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    final phone = _phoneCtrl.text.trim();
    final password = _passwordCtrl.text;

    if (phone.replaceAll(RegExp(r'\D'), '').length < 9) {
      _showError('Telefon raqamni kiriting');
      return;
    }
    if (password.isEmpty) {
      _showError('Parolni kiriting');
      return;
    }

    final result = await ref.read(authStateProvider.notifier).driverLoginWithPassword(
      phone: phone,
      password: password,
    );

    if (result is Map && result['needsPassword'] == true) {
      setState(() => _needsNewPassword = true);
    }
  }

  Future<void> _handleSetPassword() async {
    final phone = _phoneCtrl.text.trim();
    final newPassword = _newPasswordCtrl.text;
    final confirm = _confirmPasswordCtrl.text;

    if (newPassword.length < 6) {
      _showError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      return;
    }
    if (newPassword != confirm) {
      _showError('Parollar mos kelmadi');
      return;
    }

    try {
      final authService = ref.read(authServiceProvider);
      final success = await authService.driverSetPassword(phone: phone, password: newPassword);
      if (success) {
        setState(() {
          _needsNewPassword = false;
          _passwordCtrl.text = newPassword;
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Parol saqlandi! Endi kiring'),
              backgroundColor: SilkTheme.success,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
        _handleLogin();
      }
    } catch (e) {
      _showError('Parol saqlashda xatolik');
    }
  }

  void _openResetBot() async {
    final url = Uri.parse('https://t.me/yoldadriverbot?start=reset');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: SilkTheme.danger,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FC),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: FadeTransition(
              opacity: _fadeAnim,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  SizedBox(height: size.height * 0.06),

                  // Logo
                  Container(
                    width: 88,
                    height: 88,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(22),
                      boxShadow: [
                        BoxShadow(
                          color: SilkTheme.brand.withValues(alpha: 0.15),
                          blurRadius: 24,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(22),
                      child: Image.asset(
                        'assets/images/app_icon.png',
                        width: 88, height: 88,
                        errorBuilder: (_, __, ___) => Container(
                          width: 88, height: 88,
                          decoration: BoxDecoration(
                            color: SilkTheme.brand,
                            borderRadius: BorderRadius.circular(22),
                          ),
                          child: const Center(
                            child: Text("YO'LDA", style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800)),
                          ),
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),
                  const Text(
                    "YO'LDA",
                    style: TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: SilkTheme.ink, letterSpacing: 2),
                  ),

                  SizedBox(height: size.height * 0.04),

                  // FORMA
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 20, offset: const Offset(0, 4)),
                      ],
                    ),
                    child: _needsNewPassword ? _buildSetPasswordForm() : _buildLoginForm(authState),
                  ),

                  const SizedBox(height: 20),

                  // Parolni unutdim
                  if (!_needsNewPassword)
                    TextButton(
                      onPressed: _openResetBot,
                      child: const Text(
                        'Parolni unutdim?',
                        style: TextStyle(fontSize: 14, color: SilkTheme.brand, fontWeight: FontWeight.w500),
                      ),
                    ),

                  const SizedBox(height: 12),

                  // Ro'yxatdan o'tish
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text("Hisobingiz yo'qmi? ", style: TextStyle(fontSize: 14, color: Color(0xFF9CA3AF))),
                      GestureDetector(
                        onTap: () => context.push(AppRoutes.driverRegister),
                        child: const Text(
                          "Ro'yxatdan o'ting",
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: SilkTheme.brand),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLoginForm(AuthState authState) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Kirish', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: SilkTheme.ink)),
        const SizedBox(height: 4),
        const Text('Telefon raqam va parol bilan kiring', style: TextStyle(fontSize: 13, color: Color(0xFF9CA3AF))),
        const SizedBox(height: 20),

        // Telefon
        const Text('Telefon raqam', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
        const SizedBox(height: 6),
        TextField(
          controller: _phoneCtrl,
          focusNode: _phoneFocus,
          keyboardType: TextInputType.phone,
          style: const TextStyle(fontSize: 15, color: SilkTheme.ink),
          onSubmitted: (_) => _passwordFocus.requestFocus(),
          decoration: _inputDecor('998 XX XXX XX XX', Icons.phone_outlined),
        ),

        const SizedBox(height: 16),

        // Parol
        const Text('Parol', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
        const SizedBox(height: 6),
        TextField(
          controller: _passwordCtrl,
          focusNode: _passwordFocus,
          obscureText: _obscurePassword,
          style: const TextStyle(fontSize: 15, color: SilkTheme.ink),
          onSubmitted: (_) => _handleLogin(),
          decoration: _inputDecor('Parolingiz', Icons.lock_outline).copyWith(
            suffixIcon: IconButton(
              icon: Icon(_obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined, size: 20, color: const Color(0xFF9CA3AF)),
              onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
            ),
          ),
        ),

        const SizedBox(height: 8),

        // Xato
        if (authState.error != null)
          Container(
            padding: const EdgeInsets.all(10),
            margin: const EdgeInsets.only(top: 8),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF2F2),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFFFECACA)),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline, color: Color(0xFFEF4444), size: 16),
                const SizedBox(width: 8),
                Expanded(child: Text(authState.error!, style: const TextStyle(fontSize: 13, color: Color(0xFFDC2626)))),
              ],
            ),
          ),

        const SizedBox(height: 20),

        // Kirish tugma
        SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton(
            onPressed: authState.isLoading ? null : _handleLogin,
            style: ElevatedButton.styleFrom(
              backgroundColor: SilkTheme.brand,
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: authState.isLoading
                ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
                : const Text('Kirish', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
          ),
        ),
      ],
    );
  }

  Widget _buildSetPasswordForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Parol yarating', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: SilkTheme.ink)),
        const SizedBox(height: 4),
        const Text('Birinchi marta kirayapsiz — parol yarating', style: TextStyle(fontSize: 13, color: Color(0xFF9CA3AF))),
        const SizedBox(height: 20),

        const Text('Yangi parol', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
        const SizedBox(height: 6),
        TextField(
          controller: _newPasswordCtrl,
          obscureText: true,
          style: const TextStyle(fontSize: 15),
          decoration: _inputDecor('Kamida 6 belgi', Icons.lock_outline),
        ),

        const SizedBox(height: 16),

        const Text('Parolni tasdiqlang', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
        const SizedBox(height: 6),
        TextField(
          controller: _confirmPasswordCtrl,
          obscureText: true,
          style: const TextStyle(fontSize: 15),
          onSubmitted: (_) => _handleSetPassword(),
          decoration: _inputDecor('Qayta kiriting', Icons.lock_outline),
        ),

        const SizedBox(height: 20),

        SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton(
            onPressed: _handleSetPassword,
            style: ElevatedButton.styleFrom(
              backgroundColor: SilkTheme.brand,
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Saqlash va kirish', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
          ),
        ),
      ],
    );
  }

  InputDecoration _inputDecor(String hint, IconData icon) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(fontSize: 14, color: Color(0xFFBBBBBB)),
      prefixIcon: Icon(icon, size: 20, color: const Color(0xFF9CA3AF)),
      filled: true,
      fillColor: const Color(0xFFF3F4F6),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: SilkTheme.brand, width: 1.5)),
    );
  }
}
