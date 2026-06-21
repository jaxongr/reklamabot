import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/theme.dart';
import '../auth/auth_provider.dart';
import 'driver_provider.dart';

/// Admin tasdiqlamaguncha ko'rsatiladigan ekran
/// Yuklar, takliflar — hech narsa ko'rinmaydi
class PendingVerificationScreen extends ConsumerWidget {
  const PendingVerificationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FC),
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Soat ikonka
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF3C7),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                        blurRadius: 24,
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.hourglass_top_rounded,
                    size: 48,
                    color: Color(0xFFF59E0B),
                  ),
                ),

                const SizedBox(height: 28),

                const Text(
                  'Tasdiqlash kutilmoqda',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF1A1A2E),
                  ),
                ),

                const SizedBox(height: 12),

                const Text(
                  "Ro'yxatdan muvaffaqiyatli o'tdingiz!\n\n"
                  "Admin ma'lumotlaringizni tekshirib,\n"
                  "akkauntingizni tasdiqlaydi.\n\n"
                  "Tasdiqlangandan keyin telefon raqamingizga\n"
                  "SMS kod yuboriladi.",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: Color(0xFF6B7280),
                    height: 1.6,
                  ),
                ),

                const SizedBox(height: 32),

                // Qayta tekshirish
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.04),
                        blurRadius: 12,
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      const Icon(
                        Icons.refresh_rounded,
                        color: AppTheme.primary,
                        size: 28,
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Admin tasdiqlagandan keyin\nilovani qayta oching',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 13,
                          color: Color(0xFF9CA3AF),
                        ),
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        height: 46,
                        child: ElevatedButton(
                          onPressed: () {
                            // Profile qayta yuklash
                            ref.read(driverProfileProvider.notifier).loadProfile();
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primary,
                            foregroundColor: Colors.white,
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text(
                            'Qayta tekshirish',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // Chiqish
                TextButton(
                  onPressed: () {
                    ref.read(authStateProvider.notifier).logout();
                  },
                  child: const Text(
                    'Chiqish',
                    style: TextStyle(
                      fontSize: 14,
                      color: Color(0xFFEF4444),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
