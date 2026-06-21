import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../config/theme.dart';
import '../../core/providers/providers.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});
  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _boot());
  }

  Future<void> _boot() async {
    await Future.delayed(const Duration(milliseconds: 600));
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('yolda_token');
    if (!mounted) return;
    if (token == null || token.isEmpty) { context.go('/login'); return; }
    try {
      final auth = ref.read(authServiceProvider);
      final me = await auth.me();
      ref.read(dispatcherProvider.notifier).setDispatcher(me);
      if (!mounted) return;
      // Birinchi ishga tushirishda permissions ekraniga
      final permsShown = prefs.getBool('perms_shown') ?? false;
      if (!permsShown) {
        await prefs.setBool('perms_shown', true);
        context.go('/permissions');
      } else {
        context.go('/home');
      }
    } catch (_) {
      await prefs.remove('yolda_token');
      if (!mounted) return;
      context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppTheme.primaryGradient),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 100, height: 100,
                decoration: BoxDecoration(gradient: AppTheme.accentGradient,
                  borderRadius: BorderRadius.circular(24)),
                child: const Icon(Icons.phone_in_talk_outlined, color: Colors.white, size: 56),
              ),
              const SizedBox(height: 28),
              const Text("YO'LDA", style: TextStyle(color: Colors.white, fontSize: 40, fontWeight: FontWeight.w900, letterSpacing: 4)),
              const Text("DISPATCHER", style: TextStyle(color: AppTheme.accent, fontSize: 14, fontWeight: FontWeight.w600, letterSpacing: 8)),
              const SizedBox(height: 48),
              const CircularProgressIndicator(valueColor: AlwaysStoppedAnimation<Color>(AppTheme.accent)),
            ],
          ),
        ),
      ),
    );
  }
}
