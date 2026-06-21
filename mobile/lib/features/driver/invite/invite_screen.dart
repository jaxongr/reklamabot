import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../config/silk_theme.dart';
import 'invite_provider.dart';

/// Haydovchi taklif (referral) tizimi sahifasi
class InviteScreen extends ConsumerWidget {
  const InviteScreen({super.key});

  void _copyCode(BuildContext context, String code) {
    Clipboard.setData(ClipboardData(text: code));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Kod nusxalandi!'),
        backgroundColor: SilkTheme.success,
        duration: Duration(seconds: 1),
      ),
    );
  }

  void _shareText(BuildContext context, String code, String platform) {
    Clipboard.setData(ClipboardData(
      text:
          "Yo'lda ilovasiga qo'shiling! Mening taklif kodom: $code. Yuklab oling: https://yolda.uz/app",
    ));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$platform uchun nusxalandi'),
        backgroundColor: SilkTheme.success,
        duration: const Duration(seconds: 1),
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(inviteProvider);

    return Scaffold(
      backgroundColor: SilkTheme.bg,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text("Do'stni taklif qilish"),
      ),
      body: state.isLoading && state.referralCode == null
          ? const Center(
              child: CircularProgressIndicator(color: SilkTheme.brand),
            )
          : state.error != null && state.referralCode == null
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.error_outline,
                          size: 48, color: SilkTheme.muted),
                      const SizedBox(height: 12),
                      Text(
                        state.error!,
                        style: const TextStyle(color: SilkTheme.muted),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () {
                          ref.read(inviteProvider.notifier).loadReferralCode();
                          ref.read(inviteProvider.notifier).loadStats();
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: SilkTheme.brand,
                          foregroundColor: Colors.white,
                        ),
                        child: const Text('Qayta yuklash'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  color: SilkTheme.brand,
                  onRefresh: () async {
                    await Future.wait([
                      ref.read(inviteProvider.notifier).loadReferralCode(),
                      ref.read(inviteProvider.notifier).loadStats(),
                    ]);
                  },
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        const SizedBox(height: 12),

                        // ── Gift emoji ──
                        const Text(
                          '\u{1F381}',
                          style: TextStyle(fontSize: 56),
                        ),
                        const SizedBox(height: 16),

                        // ── Title ──
                        const Text(
                          'Taklif qiling — bonus oling!',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: SilkTheme.ink,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 10),

                        // ── Description ──
                        const Text(
                          "Do'stingizni taklif qiling va har bir ro'yxatdan o'tgan do'stingiz uchun 100,000 UZS bonus oling!",
                          style: TextStyle(
                            fontSize: 14,
                            color: SilkTheme.muted,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 24),

                        // ── Invite code card ──
                        _buildCodeCard(context, state),
                        const SizedBox(height: 20),

                        // ── Share buttons ──
                        if (state.referralCode != null)
                          Row(
                            children: [
                              Expanded(
                                child: _ShareButton(
                                  label: 'WhatsApp',
                                  icon: Icons.message,
                                  color: const Color(0xFF25D366),
                                  onTap: () => _shareText(
                                      context, state.referralCode!, 'WhatsApp'),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: _ShareButton(
                                  label: 'Telegram',
                                  icon: Icons.send,
                                  color: const Color(0xFF0088CC),
                                  onTap: () => _shareText(
                                      context, state.referralCode!, 'Telegram'),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: _ShareButton(
                                  label: 'SMS',
                                  icon: Icons.sms,
                                  color: SilkTheme.brand,
                                  onTap: () => _shareText(
                                      context, state.referralCode!, 'SMS'),
                                ),
                              ),
                            ],
                          ),
                        const SizedBox(height: 24),

                        // ── Statistics section ──
                        Row(
                          children: [
                            Expanded(
                              child: _StatBox(
                                value: '${state.totalInvites}',
                                label: 'Yuborilgan',
                                icon: Icons.send,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _StatBox(
                                value: '${state.activeInvites}',
                                label: "Ro'yxatdan o'tgan",
                                icon: Icons.person_add,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _StatBox(
                                value: _formatBonus(state.bonusEarned),
                                label: 'Jami bonus',
                                icon: Icons.monetization_on,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildCodeCard(BuildContext context, InviteState state) {
    final code = state.referralCode;

    if (code == null) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(
            color: SilkTheme.brand,
            width: 1.5,
            strokeAlign: BorderSide.strokeAlignInside,
          ),
          borderRadius: BorderRadius.circular(14),
          color: SilkTheme.brand.withValues(alpha: 0.04),
        ),
        child: const Center(
          child: Text(
            'Kod yuklanmoqda...',
            style: TextStyle(
              fontSize: 16,
              color: SilkTheme.muted,
            ),
          ),
        ),
      );
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(
          color: SilkTheme.brand,
          width: 1.5,
          strokeAlign: BorderSide.strokeAlignInside,
        ),
        borderRadius: BorderRadius.circular(14),
        color: SilkTheme.brand.withValues(alpha: 0.04),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            code,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w800,
              color: SilkTheme.brand,
              letterSpacing: 2,
            ),
          ),
          const SizedBox(width: 16),
          GestureDetector(
            onTap: () => _copyCode(context, code),
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: SilkTheme.brand.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.copy,
                color: SilkTheme.brand,
                size: 20,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatBonus(double amount) {
    if (amount >= 1000000) {
      return '${(amount / 1000000).toStringAsFixed(1)}M';
    } else if (amount >= 1000) {
      return '${(amount / 1000).toStringAsFixed(0)}K';
    }
    return amount.toStringAsFixed(0);
  }
}

/// Ulashish tugmasi
class _ShareButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _ShareButton({
    required this.label,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(icon, color: Colors.white, size: 22),
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Statistika qutisi
class _StatBox extends StatelessWidget {
  final String value;
  final String label;
  final IconData icon;

  const _StatBox({
    required this.value,
    required this.label,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: SilkTheme.bg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Icon(icon, color: SilkTheme.brand, size: 20),
          const SizedBox(height: 6),
          Text(
            value,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: SilkTheme.brand,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              color: SilkTheme.muted,
            ),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
