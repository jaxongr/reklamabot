import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../app_config.dart';
import '../../config/routes.dart';
import '../../config/silk_theme.dart';
import '../../core/api/api_client.dart';
import 'auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen>
    with SingleTickerProviderStateMixin {
  final _telegramIdController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  String _selectedRole = isDriverApp ? 'DRIVER' : 'DISPATCHER';

  // OTP
  final List<TextEditingController> _otpControllers =
      List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _otpFocusNodes =
      List.generate(6, (_) => FocusNode());

  late AnimationController _animController;
  late Animation<Offset> _slideAnim;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _loadRole();

    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );

    _slideAnim = Tween<Offset>(
      begin: const Offset(0, 0.15),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animController,
      curve: Curves.easeOutCubic,
    ));

    _fadeAnim = Tween<double>(begin: 0.0, end: 1.0).animate(CurvedAnimation(
      parent: _animController,
      curve: Curves.easeOut,
    ));

    Future.delayed(const Duration(milliseconds: 200), () {
      if (mounted) _animController.forward();
    });
  }

  Future<void> _loadRole() async {
    final storage = ref.read(secureStorageProvider);
    final role = await storage.read(key: StorageKeys.selectedRole);
    if (role != null && mounted) {
      setState(() => _selectedRole = role);
    }
  }

  @override
  void dispose() {
    _animController.dispose();
    _telegramIdController.dispose();
    for (final c in _otpControllers) {
      c.dispose();
    }
    for (final f in _otpFocusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  String get _otpCode =>
      _otpControllers.map((c) => c.text).join();

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;
    final code = _otpCode;
    if (code.length != 6) return;

    await ref.read(authStateProvider.notifier).login(
          telegramId: _telegramIdController.text.trim(),
          authData: code,
          role: _selectedRole,
        );
  }

  void _onOtpChanged(int index, String value) {
    // Paste handling — 2+ belgi kelsa hammasi paste
    if (value.length > 1) {
      final digits = value.replaceAll(RegExp(r'[^0-9]'), '');
      if (digits.length >= 2) {
        _handlePaste(digits);
        return;
      }
    }
    if (value.length == 1 && index < 5) {
      _otpFocusNodes[index + 1].requestFocus();
    }
    // Check if all 6 digits are filled — auto-login
    if (_otpCode.length == 6) {
      _handleLogin();
    }
  }

  void _onOtpKeyPress(int index, RawKeyEvent event) {
    if (event is RawKeyDownEvent &&
        event.logicalKey == LogicalKeyboardKey.backspace &&
        _otpControllers[index].text.isEmpty &&
        index > 0) {
      _otpControllers[index - 1].clear();
      _otpFocusNodes[index - 1].requestFocus();
    }
  }

  void _handlePaste(String? pastedText) {
    if (pastedText == null) return;
    final digits = pastedText.replaceAll(RegExp(r'[^0-9]'), '');
    if (digits.length >= 6) {
      for (int i = 0; i < 6; i++) {
        _otpControllers[i].text = digits[i];
      }
      _otpFocusNodes[5].requestFocus();
      _handleLogin();
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    final size = MediaQuery.of(context).size;
    final isDriver = _selectedRole == 'DRIVER';

    return Scaffold(
      body: SingleChildScrollView(
        child: SizedBox(
          height: size.height,
          child: Column(
            children: [
              // ── TOP SECTION: Gradient with curve ──
              SizedBox(
                height: size.height * 0.38,
                child: Stack(
                  children: [
                    // Gradient background
                    Container(
                      width: double.infinity,
                      height: double.infinity,
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Color(0xFF0A0A1A),
                            SilkTheme.ink,
                            SilkTheme.ink2,
                          ],
                        ),
                      ),
                    ),
                    // Decorative circles
                    Positioned(
                      top: -40,
                      right: -30,
                      child: Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white.withValues(alpha: 0.05),
                        ),
                      ),
                    ),
                    Positioned(
                      bottom: 40,
                      left: -20,
                      child: Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white.withValues(alpha: 0.05),
                        ),
                      ),
                    ),
                    // Curved bottom
                    Positioned(
                      bottom: 0,
                      left: 0,
                      right: 0,
                      child: ClipPath(
                        clipper: _CurveClipper(),
                        child: Container(
                          height: 40,
                          color: SilkTheme.isDark(context)
                              ? SilkTheme.darkBg
                              : SilkTheme.bg,
                        ),
                      ),
                    ),
                    // Content
                    SafeArea(
                      bottom: false,
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            // Logo
                            Container(
                              width: 72,
                              height: 72,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(22),
                                color: Colors.white.withValues(alpha: 0.15),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.white.withValues(alpha: 0.1),
                                    blurRadius: 30,
                                    spreadRadius: 2,
                                  ),
                                ],
                              ),
                              child: const Icon(
                                Icons.local_shipping_rounded,
                                color: Colors.white,
                                size: 36,
                              ),
                            ),
                            const SizedBox(height: 14),
                            Text(
                              "YO'LDA",
                              style: TextStyle(
                                fontSize: 30,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                                letterSpacing: 2,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              isDriverApp ? 'Haydovchi platformasi' : 'Dispetcher platformasi',
                              style: TextStyle(
                                fontSize: 13,
                                color: Colors.white.withValues(alpha: 0.6),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // ── BOTTOM SECTION: Form ──
              Expanded(
                child: FadeTransition(
                  opacity: _fadeAnim,
                  child: SlideTransition(
                    position: _slideAnim,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 28),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const SizedBox(height: 4),

                            // Role badge + change
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 14, vertical: 7,
                                  ),
                                  decoration: BoxDecoration(
                                    color: isDriver
                                        ? SilkTheme.accent.withValues(alpha: 0.12)
                                        : SilkTheme.brand.withValues(alpha: 0.12),
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(
                                      color: isDriver
                                          ? SilkTheme.accent.withValues(alpha: 0.3)
                                          : SilkTheme.brand.withValues(alpha: 0.3),
                                    ),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        isDriver
                                            ? Icons.local_shipping
                                            : Icons.headset_mic,
                                        size: 16,
                                        color: isDriver
                                            ? SilkTheme.accent
                                            : SilkTheme.brand,
                                      ),
                                      const SizedBox(width: 6),
                                      Text(
                                        isDriver ? 'Haydovchi' : 'Dispetcher',
                                        style: TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w600,
                                          color: isDriver
                                              ? SilkTheme.accent
                                              : SilkTheme.brand,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                // Rol avtomatik — o'zgartirish imkoni yo'q
                              ],
                            ),

                            const SizedBox(height: 20),

                            // Telegram ID field
                            TextFormField(
                              controller: _telegramIdController,
                              keyboardType: TextInputType.number,
                              style: TextStyle(
                                color: SilkTheme.inkOf(context),
                              ),
                              decoration: InputDecoration(
                                labelText: 'Telegram ID',
                                hintText: 'Masalan: 5475915736',
                                prefixIcon: const Icon(
                                  Icons.telegram,
                                  color: SilkTheme.brand,
                                ),
                              ),
                              validator: (value) {
                                if (value == null || value.trim().isEmpty) {
                                  return 'Telegram ID kiriting';
                                }
                                if (!RegExp(r'^\d+$')
                                    .hasMatch(value.trim())) {
                                  return 'Telegram ID faqat raqamlardan iborat';
                                }
                                return null;
                              },
                            ),

                            const SizedBox(height: 12),

                            // Botdan kod olish tugmasi
                            SizedBox(
                              width: double.infinity,
                              child: OutlinedButton.icon(
                                onPressed: () async {
                                  final role = _selectedRole == 'DRIVER' ? 'driver' : 'dispatcher';
                                  final uri = Uri.parse('https://t.me/haydovchibor_bot?start=app_$role');
                                  if (await canLaunchUrl(uri)) {
                                    await launchUrl(uri, mode: LaunchMode.externalApplication);
                                  }
                                },
                                icon: const Icon(Icons.telegram, size: 20),
                                label: const Text('Botdan ID va kod olish'),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: SilkTheme.brand,
                                  side: const BorderSide(color: SilkTheme.brand),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                ),
                              ),
                            ),

                            const SizedBox(height: 20),

                            // OTP label
                            Text(
                              'Login kod',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: SilkTheme.inkOf(context),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              isDriver
                                  ? 'Botga /haydovchi yuboring — 6 raqamli kod olasiz'
                                  : 'Botga /app yuboring — 6 raqamli kod olasiz',
                              style: TextStyle(
                                fontSize: 12,
                                color: SilkTheme.mutedOf(context),
                              ),
                            ),

                            const SizedBox(height: 12),

                            // ── 6 OTP boxes ──
                            Row(
                              mainAxisAlignment:
                                  MainAxisAlignment.spaceBetween,
                              children: List.generate(6, (index) {
                                return SizedBox(
                                  width: 48,
                                  height: 56,
                                  child: RawKeyboardListener(
                                    focusNode: FocusNode(),
                                    onKey: (e) => _onOtpKeyPress(index, e),
                                    child: TextField(
                                      controller: _otpControllers[index],
                                      focusNode: _otpFocusNodes[index],
                                      keyboardType: TextInputType.number,
                                      textAlign: TextAlign.center,
                                      maxLength: null,
                                      style: TextStyle(
                                        fontSize: 22,
                                        fontWeight: FontWeight.w700,
                                        color:
                                            SilkTheme.inkOf(context),
                                      ),
                                      decoration: InputDecoration(
                                        counterText: '',
                                        contentPadding:
                                            const EdgeInsets.symmetric(
                                                vertical: 14),
                                        filled: true,
                                        fillColor: SilkTheme.isDark(context)
                                            ? SilkTheme.darkSurface
                                            : SilkTheme.bg,
                                        border: OutlineInputBorder(
                                          borderRadius:
                                              BorderRadius.circular(12),
                                          borderSide: BorderSide(
                                            color: SilkTheme.borderOf(context),
                                          ),
                                        ),
                                        enabledBorder: OutlineInputBorder(
                                          borderRadius:
                                              BorderRadius.circular(12),
                                          borderSide: BorderSide(
                                            color: SilkTheme.borderOf(context),
                                          ),
                                        ),
                                        focusedBorder: OutlineInputBorder(
                                          borderRadius:
                                              BorderRadius.circular(12),
                                          borderSide: const BorderSide(
                                            color: SilkTheme.brand,
                                            width: 2,
                                          ),
                                        ),
                                      ),
                                      inputFormatters: [
                                        FilteringTextInputFormatter.digitsOnly,
                                        LengthLimitingTextInputFormatter(6),
                                      ],
                                      onChanged: (v) {
                                        if (v.length > 1) {
                                          // Paste — barcha 6 raqamni tarqatish
                                          final digits = v.replaceAll(RegExp(r'[^0-9]'), '');
                                          for (int i = 0; i < 6 && i < digits.length; i++) {
                                            _otpControllers[i].text = digits[i];
                                          }
                                          if (digits.length >= 6) {
                                            _otpFocusNodes[5].requestFocus();
                                            _handleLogin();
                                          } else if (digits.isNotEmpty) {
                                            _otpFocusNodes[digits.length.clamp(0, 5)].requestFocus();
                                          }
                                          return;
                                        }
                                        _onOtpChanged(index, v);
                                      },
                                    ),
                                  ),
                                );
                              }),
                            ),

                            const SizedBox(height: 20),

                            // Error message
                            if (authState.error != null)
                              Container(
                                padding: const EdgeInsets.all(12),
                                margin: const EdgeInsets.only(bottom: 16),
                                decoration: BoxDecoration(
                                  color: SilkTheme.danger
                                      .withValues(alpha: 0.08),
                                  borderRadius: BorderRadius.circular(
                                      SilkTheme.radiusSmall),
                                  border: Border.all(
                                    color: SilkTheme.danger
                                        .withValues(alpha: 0.3),
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.error_outline,
                                        color: SilkTheme.danger,
                                        size: 20),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        authState.error!,
                                        style: const TextStyle(
                                          fontSize: 13,
                                          color: SilkTheme.danger,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                            // ── Gradient login button ──
                            SizedBox(
                              height: 52,
                              child: DecoratedBox(
                                decoration: BoxDecoration(
                                  gradient: SilkTheme.heroGradient,
                                  borderRadius: BorderRadius.circular(
                                      SilkTheme.radiusMedium),
                                  boxShadow: [
                                    BoxShadow(
                                      color: SilkTheme.brand
                                          .withValues(alpha: 0.35),
                                      blurRadius: 12,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: ElevatedButton(
                                  onPressed: authState.isLoading
                                      ? null
                                      : _handleLogin,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.transparent,
                                    shadowColor: Colors.transparent,
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(
                                          SilkTheme.radiusMedium),
                                    ),
                                  ),
                                  child: authState.isLoading
                                      ? const SizedBox(
                                          width: 22,
                                          height: 22,
                                          child:
                                              CircularProgressIndicator(
                                            strokeWidth: 2.5,
                                            color: Colors.white,
                                          ),
                                        )
                                      : const Text(
                                          'Kirish',
                                          style: TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                ),
                              ),
                            ),

                            const SizedBox(height: 14),

                            // ── Botga o'tish link ──
                            Center(
                              child: TextButton.icon(
                                onPressed: () {
                                  // Open bot link
                                },
                                icon: const Icon(Icons.telegram, size: 18),
                                label: Text(
                                  isDriver
                                      ? 'Botga o\'tish (/haydovchi)'
                                      : 'Botga o\'tish (/app)',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color:
                                        SilkTheme.mutedOf(context),
                                  ),
                                ),
                              ),
                            ),

                            const Spacer(),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Custom clipper for curved transition between gradient header and form body.
class _CurveClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    path.moveTo(0, size.height);
    path.lineTo(size.width, size.height);
    path.lineTo(size.width, 0);
    path.quadraticBezierTo(
      size.width / 2, size.height * 1.5,
      0, 0,
    );
    path.close();
    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}
