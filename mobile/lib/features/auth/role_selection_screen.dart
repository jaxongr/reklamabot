import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../config/routes.dart';
import '../../config/silk_theme.dart';
import '../../core/api/api_client.dart';
import '../../widgets/silk/ikat_background.dart';

class RoleSelectionScreen extends ConsumerWidget {
  const RoleSelectionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final storage = ref.read(secureStorageProvider);
    final size = MediaQuery.of(context).size;

    return Scaffold(
      body: Stack(
        children: [
          // Silk Road teal → ink gradient
          const Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: SilkTheme.heroGradient,
              ),
            ),
          ),
          // Saffron accent overlay
          const Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: SilkTheme.accentOverlay,
              ),
            ),
          ),
          // Terracotta overlay
          const Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: SilkTheme.terracottaOverlay,
              ),
            ),
          ),
          // Ikat hexagon pattern
          const Positioned.fill(
            child: IkatBackground(
              stroke: SilkTheme.accent2,
              opacity: 0.08,
              tile: 80,
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 28),
              child: Column(
                children: [
                  SizedBox(height: size.height * 0.10),

                  // Brand "YO'LDA" — Instrument Serif italic
                  Text(
                    "YO'LDA",
                    style: GoogleFonts.instrumentSerif(
                      fontSize: 72,
                      fontStyle: FontStyle.italic,
                      color: const Color(0xFFF5EFE2),
                      letterSpacing: -2.88,
                      height: 1.0,
                    ).copyWith(
                      fontFamilyFallback: const [
                        'Noto Sans',
                        'Roboto',
                        'sans-serif',
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  // Gold accent line
                  Container(
                    width: 60,
                    height: 1,
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          Color(0x00E8B440),
                          Color(0xFFE8B440),
                          Color(0x00E8B440),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'SILK ROAD LOGISTICS',
                    style: SilkTheme.body(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: SilkTheme.accent2,
                      letterSpacing: 4.4,
                    ),
                  ),
                  const SizedBox(height: 40),
                  Text(
                    'Ilovaga qanday kirmoqchisiz?',
                    style: SilkTheme.body(
                      fontSize: 14,
                      color: Colors.white.withOpacity(0.6),
                    ),
                  ),

                  SizedBox(height: size.height * 0.05),

                  // Driver card
                  _RoleCard(
                    icon: Icons.local_shipping_rounded,
                    title: 'Haydovchi',
                    subtitle: 'Yuklar, takliflar, GPS tracking',
                    accentColor: SilkTheme.accent2,
                    onTap: () async {
                      await storage.write(
                        key: StorageKeys.selectedRole,
                        value: 'DRIVER',
                      );
                      if (context.mounted) context.go(AppRoutes.login);
                    },
                  ),
                  const SizedBox(height: 10),
                  // Driver register link
                  GestureDetector(
                    onTap: () => context.push(AppRoutes.driverRegister),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            Icons.person_add_rounded,
                            size: 16,
                            color: SilkTheme.accent2,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            "Haydovchi sifatida ro'yxatdan o'tish",
                            style: SilkTheme.body(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: SilkTheme.accent2,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  // Dispatcher card
                  _RoleCard(
                    icon: Icons.headset_mic_rounded,
                    title: 'Dispetcher',
                    subtitle: "Sessiyalar, e'lonlar, tarqatish",
                    accentColor: SilkTheme.accent,
                    onTap: () async {
                      await storage.write(
                        key: StorageKeys.selectedRole,
                        value: 'DISPATCHER',
                      );
                      if (context.mounted) context.go(AppRoutes.login);
                    },
                  ),

                  const Spacer(),

                  Text(
                    "YO'LDA v2.5.0 · Silk Road Edition",
                    style: SilkTheme.body(
                      fontSize: 11,
                      color: Colors.white.withOpacity(0.35),
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color accentColor;
  final VoidCallback onTap;

  const _RoleCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.accentColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white.withOpacity(0.08),
      borderRadius: BorderRadius.circular(SilkTheme.radiusCard),
      child: InkWell(
        borderRadius: BorderRadius.circular(SilkTheme.radiusCard),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(SilkTheme.radiusCard),
            border: Border.all(
              color: Colors.white.withOpacity(0.12),
              width: 1,
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 56,
                height: 56,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: accentColor.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(icon, color: accentColor, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: SilkTheme.display(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                        letterSpacing: -0.18,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: SilkTheme.body(
                        fontSize: 13,
                        color: Colors.white.withOpacity(0.6),
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                width: 36,
                height: 36,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: accentColor.withOpacity(0.2),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.arrow_forward_rounded,
                  color: accentColor,
                  size: 20,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
