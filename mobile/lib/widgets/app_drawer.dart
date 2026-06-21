import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../config/silk_theme.dart';
import '../config/strings.dart';
import '../core/providers/lang_provider.dart';
import '../features/auth/auth_provider.dart';

/// Side drawer for both dispatcher and driver shells — Silk Road edition.
class AppDrawer extends ConsumerWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Til o'zgarganda drawer ham rebuild bo'ladi
    ref.watch(langProvider);
    final authState = ref.watch(authStateProvider);
    final user = authState.user;
    final isDriver = user?.role.value == 'DRIVER';

    return Drawer(
      backgroundColor: SilkTheme.bgOf(context),
      width: 300,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.horizontal(right: Radius.circular(0)),
      ),
      child: SafeArea(
        child: Column(
          children: [
            // ── Header with close button ──
            _DrawerHeader(
              name: user?.displayName ?? AppStrings.foydalanuvchi,
              subtitle: user?.phoneNumber ??
                  (user?.username != null ? '@${user!.username}' : ''),
              onClose: () => Navigator.of(context).pop(),
            ),

            Divider(color: SilkTheme.borderOf(context), height: 1, thickness: 1),

            // ── Menu items ──
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 8),
                children: [
                  _DrawerItem(
                    icon: Icons.home_outlined,
                    label: AppStrings.asosiy,
                    onTap: () => _navigateTab(
                      context,
                      isDriver ? '/driver/home' : '/home',
                    ),
                  ),
                  _DrawerItem(
                    icon: Icons.assignment_turned_in_outlined,
                    label: AppStrings.qabulQilinganlar,
                    onTap: () => _navigateTab(
                      context,
                      isDriver ? '/driver/accepted' : '/accepted',
                    ),
                  ),
                  _DrawerItem(
                    icon: Icons.archive_outlined,
                    label: AppStrings.arxiv,
                    onTap: () => _navigatePush(context, '/archive'),
                  ),
                  _DrawerItem(
                    icon: Icons.account_balance_wallet_outlined,
                    label: AppStrings.balans,
                    onTap: () => _navigateTab(
                      context,
                      isDriver ? '/driver/balance' : '/balance',
                    ),
                  ),
                  _DrawerItem(
                    icon: Icons.chat_bubble_outline,
                    label: AppStrings.chat,
                    onTap: () => _navigateTab(
                      context,
                      isDriver ? '/driver/chat' : '/chat',
                    ),
                  ),

                  _DrawerDivider(),

                  // Role-specific items
                  if (isDriver) ...[
                    _DrawerItem(
                      icon: Icons.camera_alt_outlined,
                      label: AppStrings.fotokontrol,
                      onTap: () => _navigatePush(context, '/driver/photos'),
                    ),
                    _DrawerItem(
                      icon: Icons.card_giftcard_outlined,
                      label: AppStrings.dostniTaklif,
                      onTap: () => _navigatePush(context, '/driver/invite'),
                    ),
                  ] else ...[
                    _DrawerItem(
                      icon: Icons.search_outlined,
                      label: AppStrings.topish,
                      onTap: () => _navigatePush(context, '/search'),
                    ),
                    _DrawerItem(
                      icon: Icons.sim_card_outlined,
                      label: AppStrings.sessiyaQoshish,
                      onTap: () =>
                          _navigatePush(context, '/dispatcher/sessions'),
                    ),
                    _DrawerItem(
                      icon: Icons.add_circle_outline,
                      label: "E'lon yaratish",
                      onTap: () =>
                          _navigatePush(context, '/dispatcher/create-ad'),
                    ),
                    _DrawerItem(
                      icon: Icons.list_alt_outlined,
                      label: "Mening e'lonlarim",
                      onTap: () =>
                          _navigatePush(context, '/dispatcher/my-ads'),
                    ),
                    _DrawerItem(
                      icon: Icons.local_offer_outlined,
                      label: 'Haydovchi takliflari',
                      onTap: () =>
                          _navigatePush(context, '/dispatcher/driver-offers'),
                    ),
                    _DrawerItem(
                      icon: Icons.campaign_outlined,
                      label: AppStrings.elonTarqatish,
                      onTap: () =>
                          _navigatePush(context, '/dispatcher/posting'),
                    ),
                    _DrawerItem(
                      icon: Icons.block_outlined,
                      label: AppStrings.qoraRoyxat,
                      onTap: () =>
                          _navigatePush(context, '/dispatcher/blacklist'),
                    ),
                    _DrawerItem(
                      icon: Icons.calculate_outlined,
                      label: AppStrings.testrKalkulyator,
                      onTap: () => _navigatePush(context, '/dispatcher/testr'),
                    ),
                    _DrawerItem(
                      icon: Icons.add_box_outlined,
                      label: AppStrings.buyurtmaYaratish,
                      onTap: () => _navigatePush(context, '/dispatcher/create'),
                    ),
                    _DrawerItem(
                      icon: Icons.phone_android_outlined,
                      label: AppStrings.raqamlarBoshqaruvi,
                      onTap: () =>
                          _navigatePush(context, '/dispatcher/numbers'),
                    ),
                    _DrawerItem(
                      icon: Icons.sms_outlined,
                      label: AppStrings.smsYuborish,
                      onTap: () => _navigatePush(context, '/dispatcher/sms'),
                    ),
                  ],

                  _DrawerDivider(),

                  _DrawerItem(
                    icon: Icons.person_outline,
                    label: 'Profil',
                    onTap: () => _navigatePush(
                      context,
                      isDriver ? '/driver/profile' : '/dispatcher/profile',
                    ),
                  ),
                  if (!isDriver)
                    _DrawerItem(
                      icon: Icons.bar_chart_rounded,
                      label: 'Statistika',
                      onTap: () =>
                          _navigatePush(context, '/dispatcher/stats'),
                    ),

                  _DrawerDivider(),

                  _DrawerItem(
                    icon: Icons.workspace_premium_outlined,
                    label: AppStrings.obuna,
                    onTap: () => _navigatePush(context, '/subscribe'),
                  ),
                  _DrawerItem(
                    icon: Icons.notifications_outlined,
                    label: AppStrings.bildirishnomalar,
                    onTap: () => _navigatePush(context, '/notifications'),
                  ),
                  _DrawerItem(
                    icon: Icons.help_outline,
                    label: AppStrings.texYordam,
                    onTap: () => _navigatePush(context, '/support'),
                  ),
                  _DrawerItem(
                    icon: Icons.settings_outlined,
                    label: AppStrings.sozlamalar,
                    onTap: () => _navigatePush(context, '/settings-page'),
                  ),

                  _DrawerDivider(),

                  // Dark mode toggle (UI only — actual logic unchanged)
                  _DarkModeToggle(),
                ],
              ),
            ),

            // ── Logout ──
            Divider(color: SilkTheme.borderOf(context), height: 1, thickness: 1),
            _LogoutButton(
              onTap: () async {
                Navigator.of(context).pop();
                final confirmed = await showDialog<bool>(
                  context: context,
                  builder: (_) => AlertDialog(
                    backgroundColor: SilkTheme.surfaceOf(context),
                    title: Text(
                      "Ilovadan chiqish",
                      style: SilkTheme.body(
                        fontSize: 17,
                        fontWeight: FontWeight.w600,
                        color: SilkTheme.inkOf(context),
                      ),
                    ),
                    content: Text(
                      "Rostdan ham chiqib ketmoqchimisiz?",
                      style: SilkTheme.body(
                        fontSize: 14,
                        color: SilkTheme.mutedOf(context),
                      ),
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(SilkTheme.radiusCard),
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context, false),
                        child: Text(
                          "Yo'q",
                          style: TextStyle(
                            color: SilkTheme.mutedOf(context),
                          ),
                        ),
                      ),
                      TextButton(
                        onPressed: () => Navigator.pop(context, true),
                        child: Text(
                          "Ha, chiqaman",
                          style: TextStyle(
                            color: SilkTheme.dangerOf(context),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
                if (confirmed == true) {
                  ref.read(authStateProvider.notifier).logout();
                }
              },
            ),

            // ── Footer ──
            Padding(
              padding: const EdgeInsets.symmetric(
                  horizontal: 20, vertical: 14),
              child: Text(
                "YO'LDA v2.1.0 · Silk Road Edition",
                style: SilkTheme.body(
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  color: SilkTheme.muted2Of(context),
                  letterSpacing: 0.3,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Navigate via go (switches bottom tab).
  void _navigateTab(BuildContext context, String path) {
    Navigator.of(context).pop();
    context.go(path);
  }

  /// Navigate via push (full-screen overlay, no bottom nav).
  void _navigatePush(BuildContext context, String path) {
    Navigator.of(context).pop();
    context.push(path);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Private widgets
// ─────────────────────────────────────────────────────────────────────────────

class _DrawerHeader extends StatelessWidget {
  final String name;
  final String subtitle;
  final VoidCallback onClose;

  const _DrawerHeader({
    required this.name,
    required this.subtitle,
    required this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    final initial = name.isNotEmpty ? name.characters.first.toUpperCase() : 'Y';
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 12, 20),
      child: Row(
        children: [
          // Avatar — accent2 (saffron) background, ink text
          Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: SilkTheme.accent2Of(context),
            ),
            alignment: Alignment.center,
            child: Text(
              initial,
              style: SilkTheme.display(
                fontSize: 22,
                fontWeight: FontWeight.w700,
                color: SilkTheme.inkOf(context),
                letterSpacing: -0.3,
              ),
            ),
          ),
          const SizedBox(width: 14),
          // Name + phone/username
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: SilkTheme.display(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: SilkTheme.inkOf(context),
                    letterSpacing: -0.2,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (subtitle.isNotEmpty) ...[
                  const SizedBox(height: 3),
                  Text(
                    subtitle,
                    style: SilkTheme.body(
                      fontSize: 12,
                      color: SilkTheme.mutedOf(context),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            ),
          ),
          // Close button (X)
          IconButton(
            onPressed: onClose,
            icon: Icon(
              Icons.close_rounded,
              size: 20,
              color: SilkTheme.mutedOf(context),
            ),
            splashRadius: 20,
          ),
        ],
      ),
    );
  }
}

class _DrawerItem extends StatefulWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _DrawerItem({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  State<_DrawerItem> createState() => _DrawerItemState();
}

class _DrawerItemState extends State<_DrawerItem> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) => setState(() => _pressed = false),
      onTapCancel: () => setState(() => _pressed = false),
      onTap: widget.onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 120),
        color: _pressed
            ? SilkTheme.softOf(context)
            : Colors.transparent,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        child: Row(
          children: [
            Icon(
              widget.icon,
              size: 20,
              color: SilkTheme.mutedOf(context),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                widget.label,
                style: SilkTheme.body(
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                  color: SilkTheme.inkOf(context),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DrawerDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: Divider(
        color: SilkTheme.borderOf(context),
        height: 1,
        thickness: 1,
      ),
    );
  }
}

class _DarkModeToggle extends StatefulWidget {
  @override
  State<_DarkModeToggle> createState() => _DarkModeToggleState();
}

class _DarkModeToggleState extends State<_DarkModeToggle> {
  // UI-only state: real dark mode control lives in theme provider.
  bool _on = false;

  @override
  void initState() {
    super.initState();
    // Reflect current brightness on first build.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) setState(() => _on = SilkTheme.isDark(context));
    });
  }

  @override
  Widget build(BuildContext context) {
    final on = SilkTheme.isDark(context);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      child: Row(
        children: [
          Icon(
            Icons.nightlight_outlined,
            size: 20,
            color: SilkTheme.mutedOf(context),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Text(
              'Tungi rejim',
              style: SilkTheme.body(
                fontSize: 15,
                fontWeight: FontWeight.w500,
                color: SilkTheme.inkOf(context),
              ),
            ),
          ),
          Switch(
            value: on || _on,
            onChanged: (v) {
              // UI only — real theme toggle is handled elsewhere.
              setState(() => _on = v);
            },
            activeColor: SilkTheme.surfaceOf(context),
            activeTrackColor: SilkTheme.brandOf(context),
            inactiveThumbColor: SilkTheme.surfaceOf(context),
            inactiveTrackColor: SilkTheme.borderOf(context),
            trackOutlineColor: WidgetStateProperty.all(
              SilkTheme.borderOf(context),
            ),
          ),
        ],
      ),
    );
  }
}

class _LogoutButton extends StatelessWidget {
  final VoidCallback onTap;

  const _LogoutButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        child: Row(
          children: [
            Icon(
              Icons.logout,
              size: 20,
              color: SilkTheme.dangerOf(context),
            ),
            const SizedBox(width: 14),
            Text(
              AppStrings.chiqish,
              style: SilkTheme.body(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: SilkTheme.dangerOf(context),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
