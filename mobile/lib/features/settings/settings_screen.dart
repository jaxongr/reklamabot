import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../config/strings.dart';
import '../../config/silk_theme.dart';
import '../../core/database/local_db.dart';
import '../../core/providers/lang_provider.dart';
import '../../core/providers/theme_provider.dart';
import '../auth/auth_provider.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool _notificationsEnabled = true;

  void _openUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    final isDriver = authState.user?.role.value == 'DRIVER';
    final currentLang = ref.watch(langProvider);
    final currentTheme = ref.watch(themeModeProvider);

    return Scaffold(
      backgroundColor: SilkTheme.bgOf(context),
      appBar: AppBar(
        title: Text(
          AppStrings.sozlamalar,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: SilkTheme.inkOf(context),
          ),
        ),
        backgroundColor: SilkTheme.surfaceOf(context),
        elevation: 0,
        scrolledUnderElevation: 0,
        surfaceTintColor: Colors.transparent,
      ),
      body: ListView(
        padding: EdgeInsets.zero,
        children: [
          // -- Profile card --
          _ProfileCard(authState: authState, isDriver: isDriver),

          const SizedBox(height: 8),

          // -- Til almashish section --
          _SectionHeader(title: AppStrings.tilAlmashish),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Container(
              decoration: BoxDecoration(
                color: SilkTheme.surfaceOf(context),
                borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
                border: Border.all(color: SilkTheme.borderOf(context), width: 1),
              ),
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Icon(Icons.translate_rounded, size: 22, color: SilkTheme.muted2Of(context)),
                  const SizedBox(width: 14),
                  Expanded(
                    child: SegmentedButton<AppLang>(
                      segments: const [
                        ButtonSegment(
                          value: AppLang.latin,
                          label: Text('Lotincha'),
                        ),
                        ButtonSegment(
                          value: AppLang.cyrillic,
                          label: Text('Кириллча'),
                        ),
                      ],
                      selected: {currentLang},
                      onSelectionChanged: (selection) {
                        ref.read(langProvider.notifier).setLang(selection.first);
                      },
                      style: ButtonStyle(
                        backgroundColor: WidgetStateProperty.resolveWith((states) {
                          if (states.contains(WidgetState.selected)) {
                            return SilkTheme.brand;
                          }
                          return Colors.transparent;
                        }),
                        foregroundColor: WidgetStateProperty.resolveWith((states) {
                          if (states.contains(WidgetState.selected)) {
                            return Colors.white;
                          }
                          return SilkTheme.inkOf(context);
                        }),
                        textStyle: WidgetStateProperty.all(
                          const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                        ),
                        shape: WidgetStateProperty.all(
                          RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(SilkTheme.radiusSmall),
                          ),
                        ),
                        side: WidgetStateProperty.all(
                          BorderSide(color: SilkTheme.borderOf(context)),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 8),

          // -- Tungi rejim section --
          _SectionHeader(title: AppStrings.tungiRejim),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Container(
              decoration: BoxDecoration(
                color: SilkTheme.surfaceOf(context),
                borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
                border: Border.all(color: SilkTheme.borderOf(context), width: 1),
              ),
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Icon(
                    currentTheme == ThemeMode.dark
                        ? Icons.dark_mode_rounded
                        : Icons.light_mode_rounded,
                    size: 22,
                    color: SilkTheme.muted2Of(context),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: SegmentedButton<ThemeMode>(
                      segments: [
                        ButtonSegment(
                          value: ThemeMode.light,
                          label: Text(AppStrings.yorug),
                        ),
                        ButtonSegment(
                          value: ThemeMode.dark,
                          label: Text(AppStrings.tungi),
                        ),
                      ],
                      selected: {currentTheme},
                      onSelectionChanged: (selection) {
                        ref.read(themeModeProvider.notifier).setThemeMode(selection.first);
                      },
                      style: ButtonStyle(
                        backgroundColor: WidgetStateProperty.resolveWith((states) {
                          if (states.contains(WidgetState.selected)) {
                            return SilkTheme.brand;
                          }
                          return Colors.transparent;
                        }),
                        foregroundColor: WidgetStateProperty.resolveWith((states) {
                          if (states.contains(WidgetState.selected)) {
                            return Colors.white;
                          }
                          return SilkTheme.inkOf(context);
                        }),
                        textStyle: WidgetStateProperty.all(
                          const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                        ),
                        shape: WidgetStateProperty.all(
                          RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(SilkTheme.radiusSmall),
                          ),
                        ),
                        side: WidgetStateProperty.all(
                          BorderSide(color: SilkTheme.borderOf(context)),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 8),

          // -- Xizmatlar section --
          _SectionHeader(title: AppStrings.xizmatlar),
          _SectionCard(
            children: [
              _MenuItem(
                icon: Icons.notifications_none_rounded,
                title: AppStrings.bildirishnomalar,
                onTap: () => context.push('/notifications'),
              ),
              const _MenuDivider(),
              _MenuItem(
                icon: Icons.chat_bubble_outline_rounded,
                title: AppStrings.chat,
                onTap: () => context.go(
                  isDriver ? '/driver/chat' : '/chat',
                ),
              ),
              const _MenuDivider(),
              _MenuItem(
                icon: Icons.help_outline_rounded,
                title: AppStrings.yordamMarkazi,
                onTap: () => context.push('/support'),
              ),
              const _MenuDivider(),
              _MenuItem(
                icon: Icons.account_balance_wallet_outlined,
                title: AppStrings.balans,
                onTap: () => context.go(
                  isDriver ? '/driver/balance' : '/balance',
                ),
              ),
              if (isDriver) ...[
                const _MenuDivider(),
                _MenuItem(
                  icon: Icons.photo_camera_outlined,
                  title: AppStrings.mashinaFotolari,
                  onTap: () => context.push('/driver/photos'),
                ),
                const _MenuDivider(),
                _MenuItem(
                  icon: Icons.people_outline_rounded,
                  title: AppStrings.taklifTizimi,
                  onTap: () => context.push('/driver/invite'),
                ),
              ],
            ],
          ),

          const SizedBox(height: 8),

          // -- Sozlamalar section --
          _SectionHeader(title: AppStrings.sozlamalar),
          _SectionCard(
            children: [
              _ToggleMenuItem(
                icon: Icons.notifications_active_outlined,
                title: AppStrings.bildirishnomalar,
                value: _notificationsEnabled,
                onChanged: (val) => setState(() => _notificationsEnabled = val),
              ),
              const _MenuDivider(),
              _MenuItem(
                icon: Icons.delete_outline_rounded,
                title: AppStrings.keshTozalash,
                onTap: () => _clearCache(),
              ),
            ],
          ),

          const SizedBox(height: 8),

          // -- Ilova haqida section --
          _SectionHeader(title: AppStrings.ilovaHaqida),
          _SectionCard(
            children: [
              _InfoRow(label: AppStrings.versiya, value: '3.4.14'),
              const _MenuDivider(),
              _InfoRow(label: 'Build', value: '23'),
              const _MenuDivider(),
              _MenuItem(
                icon: Icons.privacy_tip_outlined,
                title: 'Maxfiylik siyosati',
                onTap: () => _openUrl('https://logistikapro.uz/privacy.html'),
              ),
              const _MenuDivider(),
              _MenuItem(
                icon: Icons.description_outlined,
                title: 'Foydalanish shartlari',
                onTap: () => _openUrl('https://logistikapro.uz/terms.html'),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // -- Logout button --
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: SizedBox(
              width: double.infinity,
              height: 48,
              child: OutlinedButton(
                onPressed: () => _confirmLogout(context),
                style: OutlinedButton.styleFrom(
                  foregroundColor: SilkTheme.danger,
                  side: const BorderSide(color: SilkTheme.danger, width: 1),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
                  ),
                ),
                child: Text(
                  AppStrings.chiqish,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ),

          const SizedBox(height: 48),
        ],
      ),
    );
  }

  Future<void> _clearCache() async {
    final localDb = ref.read(localDbProvider);
    await localDb.clearAll();

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(AppStrings.keshTozalandi),
          backgroundColor: SilkTheme.success,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(SilkTheme.radiusSmall),
          ),
          margin: const EdgeInsets.all(16),
        ),
      );
    }
  }

  void _confirmLogout(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: SilkTheme.surfaceOf(context),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: SilkTheme.borderOf(context),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 24),
              const Icon(
                Icons.logout_rounded,
                size: 40,
                color: SilkTheme.danger,
              ),
              const SizedBox(height: 16),
              Text(
                AppStrings.hisobdanChiqish,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: SilkTheme.inkOf(context),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                AppStrings.hisobdanChiqmoqchimisiz,
                style: TextStyle(
                  fontSize: 14,
                  color: SilkTheme.mutedOf(context),
                ),
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: SizedBox(
                      height: 48,
                      child: OutlinedButton(
                        onPressed: () => Navigator.of(ctx).pop(),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: SilkTheme.inkOf(context),
                          side: BorderSide(
                            color: SilkTheme.borderOf(context),
                            width: 1,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(
                              SilkTheme.radiusMedium,
                            ),
                          ),
                        ),
                        child: Text(
                          AppStrings.bekorQilish,
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: SizedBox(
                      height: 48,
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.of(ctx).pop();
                          ref.read(authStateProvider.notifier).logout();
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: SilkTheme.danger,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(
                              SilkTheme.radiusMedium,
                            ),
                          ),
                        ),
                        child: Text(
                          AppStrings.chiqish,
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
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
}

// ---------------------------------------------------------------------------
// Profile card
// ---------------------------------------------------------------------------

class _ProfileCard extends StatelessWidget {
  final AuthState authState;
  final bool isDriver;

  const _ProfileCard({required this.authState, required this.isDriver});

  @override
  Widget build(BuildContext context) {
    final user = authState.user;
    final initial = (user?.displayName ?? 'U')[0].toUpperCase();
    final avatarBg = SilkTheme.brand.withValues(alpha: 0.1);
    final avatarFg = SilkTheme.brand;

    return InkWell(
      onTap: () {},
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            // Avatar
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: avatarBg,
                borderRadius: BorderRadius.circular(14),
              ),
              alignment: Alignment.center,
              child: Text(
                initial,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: avatarFg,
                ),
              ),
            ),
            const SizedBox(width: 14),
            // Name + username
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    user?.displayName ?? AppStrings.foydalanuvchi,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: SilkTheme.inkOf(context),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (user?.username != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      '@${user!.username}',
                      style: TextStyle(
                        fontSize: 14,
                        color: SilkTheme.mutedOf(context),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            ),
            Icon(
              Icons.chevron_right_rounded,
              size: 22,
              color: SilkTheme.muted2Of(context),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 6),
      child: Text(
        title.toUpperCase(),
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: SilkTheme.muted2Of(context),
          letterSpacing: 0.6,
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Section card container
// ---------------------------------------------------------------------------

class _SectionCard extends StatelessWidget {
  final List<Widget> children;
  const _SectionCard({required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: SilkTheme.surfaceOf(context),
        borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
        border: Border.all(color: SilkTheme.borderOf(context), width: 1),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: children,
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Menu item (icon | text | chevron)
// ---------------------------------------------------------------------------

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;

  const _MenuItem({
    required this.icon,
    required this.title,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Icon(icon, size: 22, color: SilkTheme.muted2Of(context)),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w400,
                  color: SilkTheme.inkOf(context),
                ),
              ),
            ),
            Icon(
              Icons.chevron_right_rounded,
              size: 20,
              color: SilkTheme.muted2Of(context),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Toggle menu item (icon | text | switch)
// ---------------------------------------------------------------------------

class _ToggleMenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _ToggleMenuItem({
    required this.icon,
    required this.title,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Icon(icon, size: 22, color: SilkTheme.muted2Of(context)),
          const SizedBox(width: 14),
          Expanded(
            child: Text(
              title,
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w400,
                color: SilkTheme.inkOf(context),
              ),
            ),
          ),
          SizedBox(
            height: 28,
            child: Switch.adaptive(
              value: value,
              onChanged: onChanged,
              activeColor: SilkTheme.success,
              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Info row (label ... value)
// ---------------------------------------------------------------------------

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w400,
              color: SilkTheme.mutedOf(context),
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w500,
              color: SilkTheme.inkOf(context),
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Thin divider inset to align with text (after icon + spacing)
// ---------------------------------------------------------------------------

class _MenuDivider extends StatelessWidget {
  const _MenuDivider();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 52),
      child: Divider(height: 1, thickness: 0.5, color: SilkTheme.borderOf(context)),
    );
  }
}
