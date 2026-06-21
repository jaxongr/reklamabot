import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../config/theme.dart';
import '../driver_provider.dart';

class DriverMoreScreen extends ConsumerWidget {
  const DriverMoreScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileState = ref.watch(driverProfileProvider);
    final profile = profileState.profile;
    final balance = profile?.balance ?? 0;

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FC),
      appBar: AppBar(
        title: const Text("Ko'proq"),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1A1A2E),
        elevation: 0,
        scrolledUnderElevation: 0,
        surfaceTintColor: Colors.transparent,
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(vertical: 8),
        children: [
          // Balance card
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: AppTheme.walletGradient,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.account_balance_wallet_outlined,
                      color: Colors.white,
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Hamyon',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.white.withValues(alpha: 0.8),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${balance.toStringAsFixed(0)} so\'m',
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                  GestureDetector(
                    onTap: () => context.push('/driver/balance-topup'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Text(
                        'To\'ldirish',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Menu items
          _MenuItem(
            icon: Icons.account_balance_wallet_outlined,
            title: 'Balans to\'ldirish',
            subtitle: 'Chek yuborish orqali',
            onTap: () => context.push('/driver/balance-topup'),
          ),
          _MenuItem(
            icon: Icons.card_membership_outlined,
            title: 'Obuna rejalari',
            subtitle: profile?.subscriptionActive == true ? 'Obuna faol' : 'Obuna sotib olish',
            onTap: () => context.push('/subscribe'),
          ),
          _MenuItem(
            icon: Icons.assignment_turned_in_outlined,
            title: 'Mening yuklarim',
            subtitle: 'Qabul qilingan yuklar',
            onTap: () => context.push('/archive'),
          ),
          _MenuItem(
            icon: Icons.camera_alt_outlined,
            title: 'Mashina fotolari',
            subtitle: 'Foto tekshiruv',
            onTap: () => context.push('/driver/photos'),
          ),
          _MenuItem(
            icon: Icons.people_outlined,
            title: 'Taklif tizimi',
            subtitle: 'Do\'stlarni taklif qiling',
            onTap: () => context.push('/driver/invite'),
          ),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Divider(height: 1, color: AppTheme.dividerOf(context)),
          ),

          _MenuItem(
            icon: Icons.notifications_outlined,
            title: 'Bildirishnomalar',
            onTap: () => context.push('/notifications'),
          ),
          _MenuItem(
            icon: Icons.headset_mic_outlined,
            title: 'Qo\'llab-quvvatlash',
            onTap: () => context.push('/support'),
          ),
          _MenuItem(
            icon: Icons.chat_bubble_outline,
            title: 'Chat',
            onTap: () => context.push('/driver/chat'),
          ),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Divider(height: 1, color: AppTheme.dividerOf(context)),
          ),

          _MenuItem(
            icon: Icons.settings_outlined,
            title: 'Sozlamalar',
            onTap: () => context.push('/settings-page'),
          ),
          _MenuItem(
            icon: Icons.info_outline,
            title: 'Ilova haqida',
            subtitle: 'Versiya 2.4.0',
            onTap: () {},
          ),
        ],
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final VoidCallback onTap;

  const _MenuItem({
    required this.icon,
    required this.title,
    this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      splashColor: AppTheme.driverPrimary.withValues(alpha: 0.06),
      highlightColor: AppTheme.driverPrimary.withValues(alpha: 0.03),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        child: Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: AppTheme.driverPrimary.withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, size: 20, color: AppTheme.driverPrimary),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                      color: AppTheme.textPrimaryOf(context),
                    ),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      subtitle!,
                      style: TextStyle(
                        fontSize: 12,
                        color: AppTheme.textHintOf(context),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            Icon(
              Icons.chevron_right,
              size: 20,
              color: AppTheme.textHintOf(context),
            ),
          ],
        ),
      ),
    );
  }
}
