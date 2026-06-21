import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:geolocator/geolocator.dart';

import '../../../config/theme.dart';
import '../../../core/api/api_client.dart';
import '../../../core/services/location_service.dart';
import '../../auth/auth_provider.dart';
import '../driver_provider.dart';

// ═══════════════════════════════════════════════════════════════
// HEADER WAVE PAINTER — subtle decorative curves at top
// ═══════════════════════════════════════════════════════════════

class _HeaderWavePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..style = PaintingStyle.fill
      ..isAntiAlias = true;

    // First layer — very light grey wave
    paint.color = const Color(0xFFF0F2F5);
    final path1 = Path()
      ..moveTo(0, 0)
      ..lineTo(0, size.height * 0.65)
      ..quadraticBezierTo(
        size.width * 0.25,
        size.height * 0.85,
        size.width * 0.5,
        size.height * 0.7,
      )
      ..quadraticBezierTo(
        size.width * 0.75,
        size.height * 0.55,
        size.width,
        size.height * 0.75,
      )
      ..lineTo(size.width, 0)
      ..close();
    canvas.drawPath(path1, paint);

    // Second layer — slightly darker, subtle overlap
    paint.color = const Color(0xFFE8ECF1);
    final path2 = Path()
      ..moveTo(0, 0)
      ..lineTo(0, size.height * 0.45)
      ..quadraticBezierTo(
        size.width * 0.3,
        size.height * 0.65,
        size.width * 0.55,
        size.height * 0.5,
      )
      ..quadraticBezierTo(
        size.width * 0.8,
        size.height * 0.35,
        size.width,
        size.height * 0.55,
      )
      ..lineTo(size.width, 0)
      ..close();
    canvas.drawPath(path2, paint);

    // Decorative circles — very faint
    paint.color = const Color(0x08000000);
    canvas.drawCircle(
      Offset(size.width * 0.85, size.height * 0.2),
      size.width * 0.18,
      paint,
    );
    canvas.drawCircle(
      Offset(size.width * 0.1, size.height * 0.15),
      size.width * 0.12,
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ═══════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════

class DriverProfileScreen extends ConsumerStatefulWidget {
  const DriverProfileScreen({super.key});

  @override
  ConsumerState<DriverProfileScreen> createState() =>
      _DriverProfileScreenState();
}

class _DriverProfileScreenState extends ConsumerState<DriverProfileScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() async {
      await ref.read(driverProfileProvider.notifier).loadProfile();
      _initTracking();
    });
  }

  void _initTracking() {
    final profile = ref.read(driverProfileProvider).profile;
    if (profile != null && profile.isOnline) {
      ref.read(locationServiceProvider).startTracking();
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(driverProfileProvider);
    final profile = state.profile;

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FC),
      body: state.isLoading
          ? const Center(
              child: CircularProgressIndicator(
                color: AppTheme.driverPrimary,
                strokeWidth: 2.5,
              ),
            )
          : profile == null
              ? _buildEmptyState()
              : RefreshIndicator(
                  color: AppTheme.driverPrimary,
                  backgroundColor: AppTheme.cardBgOf(context),
                  onRefresh: () =>
                      ref.read(driverProfileProvider.notifier).loadProfile(),
                  child: ListView(
                    padding: EdgeInsets.zero,
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: [
                      _buildHeader(profile),
                      const SizedBox(height: 8),
                      _buildOnlineToggle(profile),
                      const SizedBox(height: 4),
                      _buildMenuSection(profile),
                      _buildDivider(),
                      _buildSupportSection(),
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
    );
  }

  // ── Empty state ──
  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: const Color(0xFFF5F5F5),
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.person_off_outlined,
              size: 40,
              color: AppTheme.textHintOf(context),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Profil topilmadi',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
              color: AppTheme.textSecondaryOf(context),
            ),
          ),
          const SizedBox(height: 20),
          TextButton.icon(
            onPressed: () =>
                ref.read(driverProfileProvider.notifier).loadProfile(),
            icon: const Icon(Icons.refresh, size: 18),
            label: const Text('Qayta yuklash'),
            style: TextButton.styleFrom(
              foregroundColor: AppTheme.driverPrimary,
              textStyle: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Header with wave pattern + avatar + name ──
  Widget _buildHeader(profile) {
    final topPadding = MediaQuery.of(context).padding.top;

    return Stack(
      children: [
        // Wave decoration background
        CustomPaint(
          painter: _HeaderWavePainter(),
          size: Size(
            MediaQuery.of(context).size.width,
            220 + topPadding,
          ),
        ),

        // Content on top of wave
        Padding(
          padding: EdgeInsets.only(top: topPadding + 16),
          child: Column(
            children: [
              // Top bar with settings icon
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Profil',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textPrimaryOf(context),
                      ),
                    ),
                    _buildIconButton(
                      icon: Icons.settings_outlined,
                      onTap: () => context.push('/settings-page'),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Avatar
              GestureDetector(
                onTap: () => _showEditBottomSheet(),
                child: Stack(
                  children: [
                    Container(
                      width: 84,
                      height: 84,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: AppTheme.driverPrimary.withValues(alpha: 0.25),
                          width: 2.5,
                        ),
                      ),
                      child: Container(
                        margin: const EdgeInsets.all(3),
                        decoration: const BoxDecoration(
                          color: Color(0xFFF5F7FA),
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Text(
                            _getInitial(profile.fullName),
                            style: const TextStyle(
                              fontSize: 32,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.driverPrimary,
                            ),
                          ),
                        ),
                      ),
                    ),

                    // Verified badge
                    if (profile.isVerified)
                      Positioned(
                        bottom: 2,
                        right: 2,
                        child: Container(
                          width: 22,
                          height: 22,
                          decoration: BoxDecoration(
                            color: AppTheme.driverPrimary,
                            shape: BoxShape.circle,
                            border: Border.all(color: AppTheme.cardBgOf(context), width: 2),
                          ),
                          child: const Icon(
                            Icons.check,
                            size: 12,
                            color: Colors.white,
                          ),
                        ),
                      ),

                    // Online indicator
                    if (profile.isOnline)
                      Positioned(
                        top: 4,
                        right: 4,
                        child: Container(
                          width: 14,
                          height: 14,
                          decoration: BoxDecoration(
                            color: const Color(0xFF4CAF50),
                            shape: BoxShape.circle,
                            border: Border.all(color: AppTheme.cardBgOf(context), width: 2.5),
                          ),
                        ),
                      ),
                  ],
                ),
              ),

              const SizedBox(height: 12),

              // Name
              Text(
                profile.fullName ?? 'Noma\'lum',
                style: TextStyle(
                  fontSize: 19,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textPrimaryOf(context),
                  letterSpacing: -0.3,
                ),
              ),

              const SizedBox(height: 6),

              // Reyting yulduzchalar
              FutureBuilder(
                future: _loadRating(),
                builder: (context, snapshot) {
                  if (!snapshot.hasData) return const SizedBox.shrink();
                  final data = snapshot.data as Map<String, dynamic>;
                  final avg = (data['average'] as num?)?.toDouble() ?? 0;
                  final cnt = data['count'] as int? ?? 0;
                  if (avg == 0) return const SizedBox.shrink();
                  return Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      ...List.generate(5, (i) => Icon(
                        i < avg.round() ? Icons.star_rounded : Icons.star_outline_rounded,
                        size: 18,
                        color: i < avg.round() ? const Color(0xFFF59E0B) : const Color(0xFFD1D5DB),
                      )),
                      const SizedBox(width: 6),
                      Text(
                        '$avg ($cnt)',
                        style: TextStyle(fontSize: 13, color: AppTheme.textSecondaryOf(context)),
                      ),
                    ],
                  );
                },
              ),

              const SizedBox(height: 4),

              // Phone
              Text(
                profile.phone ?? '',
                style: TextStyle(
                  fontSize: 14,
                  color: AppTheme.textHintOf(context),
                  fontWeight: FontWeight.w400,
                ),
              ),

              const SizedBox(height: 6),

              // Tap to edit hint
              GestureDetector(
                onTap: () => _showEditBottomSheet(),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Profilni tahrirlash',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppTheme.driverPrimary.withValues(alpha: 0.8),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(width: 2),
                    Icon(
                      Icons.chevron_right,
                      size: 16,
                      color: AppTheme.driverPrimary.withValues(alpha: 0.8),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),
            ],
          ),
        ),
      ],
    );
  }

  // ── Online toggle row with GPS tracking ──
  Widget _buildOnlineToggle(profile) {
    final locationService = ref.read(locationServiceProvider);
    final lastCity = profile.lastCity as String?;
    final lastLocationAt = profile.lastLocationAt as DateTime?;

    String subtitle;
    if (profile.isOnline) {
      if (lastCity != null && lastCity.isNotEmpty) {
        final timeAgo = lastLocationAt != null
            ? _formatTimeAgo(lastLocationAt)
            : '';
        subtitle = '$lastCity${timeAgo.isNotEmpty ? ' \u00B7 $timeAgo' : ''}';
      } else {
        subtitle = 'GPS joylashuv aniqlanmoqda...';
      }
    } else {
      subtitle = 'GPS joylashuv o\'chirilgan';
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: profile.isOnline
                  ? AppTheme.driverPrimary.withValues(alpha: 0.1)
                  : const Color(0xFFF5F5F5),
              shape: BoxShape.circle,
            ),
            child: Icon(
              profile.isOnline ? Icons.gps_fixed : Icons.gps_off,
              size: 18,
              color: profile.isOnline
                  ? AppTheme.driverPrimary
                  : AppTheme.textHintOf(context),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Online holat',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                    color: AppTheme.textPrimaryOf(context),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 12,
                    color: profile.isOnline
                        ? AppTheme.driverPrimary
                        : AppTheme.textHintOf(context),
                  ),
                ),
              ],
            ),
          ),
          SizedBox(
            height: 28,
            child: Switch.adaptive(
              value: profile.isOnline,
              activeColor: AppTheme.driverPrimary,
              onChanged: (val) async {
                ref.read(driverProfileProvider.notifier).setOnline(val);
                if (val) {
                  final started = await locationService.startTracking();
                  if (!started && mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: const Text('GPS ruxsati berilmagan. Sozlamalardan yoqing.'),
                        backgroundColor: AppTheme.warningColor,
                        behavior: SnackBarBehavior.floating,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    );
                    // Revert online status since GPS not available
                    ref.read(driverProfileProvider.notifier).setOnline(false);
                  }
                } else {
                  locationService.stopTracking();
                }
              },
            ),
          ),
        ],
      ),
    );
  }

  String _formatTimeAgo(DateTime dateTime) {
    final diff = DateTime.now().difference(dateTime);
    if (diff.inSeconds < 60) return 'hozirgina';
    if (diff.inMinutes < 60) return '${diff.inMinutes} min oldin';
    if (diff.inHours < 24) return '${diff.inHours} soat oldin';
    return '${diff.inDays} kun oldin';
  }

  // ── Main menu items ──
  Widget _buildMenuSection(profile) {
    return Column(
      children: [
        const SizedBox(height: 8),
        _ProfileMenuItem(
          icon: Icons.account_balance_wallet_outlined,
          title: 'Hamyon',
          trailing: Text(
            '${profile.balance.toStringAsFixed(0)} so\'m',
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppTheme.driverPrimary,
            ),
          ),
          onTap: () => context.push('/subscribe'),
        ),
        _ProfileMenuItem(
          icon: Icons.assignment_turned_in_outlined,
          title: 'Mening yuklarim',
          onTap: () => context.push('/archive'),
        ),
        _ProfileMenuItem(
          icon: Icons.local_shipping_outlined,
          title: 'Mening mashinam',
          subtitle: _buildVehicleSubtitle(profile),
          onTap: () => _showEditBottomSheet(),
        ),
        _ProfileMenuItem(
          icon: Icons.camera_alt_outlined,
          title: 'Mashina fotolari',
          onTap: () => context.push('/driver/photos'),
        ),
        _ProfileMenuItem(
          icon: Icons.people_outlined,
          title: 'Taklif tizimi',
          onTap: () => context.push('/driver/invite'),
        ),
        _ProfileMenuItem(
          icon: Icons.settings_outlined,
          title: 'Sozlamalar',
          onTap: () => context.push('/settings-page'),
        ),
      ],
    );
  }

  // ── Divider between sections ──
  Widget _buildDivider() {
    return const Padding(
      padding: EdgeInsets.symmetric(horizontal: 16),
      child: Divider(
        height: 1,
        thickness: 0.5,
        color: Color(0xFFE8ECF0),
      ),
    );
  }

  // ── Support section ──
  Widget _buildSupportSection() {
    return Column(
      children: [
        _ProfileMenuItem(
          icon: Icons.headset_mic_outlined,
          title: 'Qo\'llab-quvvatlash',
          onTap: () => context.push('/support'),
        ),
        _ProfileMenuItem(
          icon: Icons.chat_bubble_outline,
          title: 'Chat',
          onTap: () => context.push('/notifications'),
        ),
        _ProfileMenuItem(
          icon: Icons.info_outline,
          title: 'Biz haqimizda',
          onTap: () => _showAboutDialog(),
        ),
      ],
    );
  }

  // ── Helper: icon button ──
  Widget _buildIconButton({
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          color: AppTheme.cardBgOf(context).withValues(alpha: 0.9),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, size: 20, color: AppTheme.textSecondaryOf(context)),
      ),
    );
  }

  // ── Helper: get initial letter ──
  Future<Map<String, dynamic>> _loadRating() async {
    try {
      final user = ref.read(authStateProvider).user;
      if (user == null) return {'average': 0, 'count': 0};
      final api = ref.read(apiClientProvider);
      final response = await api.get('/drivers/rating/${user.id}');
      return response.data as Map<String, dynamic>;
    } catch (_) {
      return {'average': 0, 'count': 0};
    }
  }

  String _getInitial(String? name) {
    if (name == null || name.isEmpty) return 'H';
    return name[0].toUpperCase();
  }

  // ── Helper: vehicle subtitle ──
  String? _buildVehicleSubtitle(profile) {
    final parts = <String>[];
    if (profile.vehicleType != null && profile.vehicleType!.isNotEmpty) {
      parts.add(profile.vehicleType!);
    }
    if (profile.vehicleNumber != null && profile.vehicleNumber!.isNotEmpty) {
      parts.add(profile.vehicleNumber!);
    }
    return parts.isEmpty ? null : parts.join(' \u00B7 ');
  }

  // ── About dialog ──
  void _showAboutDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: const Text(
          "yo'lda",
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppTheme.primary,
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Yuk tashish va logistika platformasi',
              style: TextStyle(
                fontSize: 14,
                color: AppTheme.textSecondaryOf(context),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(
                  Icons.verified_outlined,
                  size: 16,
                  color: AppTheme.driverPrimary,
                ),
                const SizedBox(width: 8),
                Text(
                  'Versiya 2.4.0',
                  style: TextStyle(
                    fontSize: 13,
                    color: AppTheme.textHintOf(context),
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text(
              'Yopish',
              style: TextStyle(
                color: AppTheme.driverPrimary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Edit bottom sheet ──
  void _showEditBottomSheet() {
    final profile = ref.read(driverProfileProvider).profile;
    if (profile == null) return;

    final nameCtrl = TextEditingController(text: profile.fullName ?? '');
    final phoneCtrl = TextEditingController(text: profile.phone ?? '');
    final vehicleCtrl = TextEditingController(text: profile.vehicleType ?? '');
    final capacityCtrl =
        TextEditingController(text: profile.vehicleCapacity ?? '');
    final numberCtrl =
        TextEditingController(text: profile.vehicleNumber ?? '');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.cardBgOf(context),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 12,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Handle bar
            Center(
              child: Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFFDDE0E4),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Title
            Text(
              'Profilni tahrirlash',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: AppTheme.textPrimaryOf(context),
              ),
            ),
            const SizedBox(height: 20),

            // Fields
            _EditField(
              controller: nameCtrl,
              label: 'To\'liq ism',
              icon: Icons.person_outlined,
            ),
            const SizedBox(height: 12),
            _EditField(
              controller: phoneCtrl,
              label: 'Telefon raqam',
              icon: Icons.phone_outlined,
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 12),
            _EditField(
              controller: vehicleCtrl,
              label: 'Mashina turi',
              icon: Icons.local_shipping_outlined,
            ),
            const SizedBox(height: 12),
            _EditField(
              controller: capacityCtrl,
              label: 'Yuk sig\'imi (tonnaj)',
              icon: Icons.scale_outlined,
            ),
            const SizedBox(height: 12),
            _EditField(
              controller: numberCtrl,
              label: 'Mashina raqami',
              icon: Icons.confirmation_number_outlined,
              textCapitalization: TextCapitalization.characters,
            ),
            const SizedBox(height: 24),

            // Save button
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: () {
                  ref.read(driverProfileProvider.notifier).updateProfile({
                    'fullName': nameCtrl.text.trim(),
                    'phone': phoneCtrl.text.trim(),
                    'vehicleType': vehicleCtrl.text.trim(),
                    'vehicleCapacity': capacityCtrl.text.trim(),
                    'vehicleNumber': numberCtrl.text.trim(),
                  });
                  Navigator.pop(ctx);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.driverPrimary,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'Saqlash',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// MENU ITEM — flat, clean, Marjon-style
// ═══════════════════════════════════════════════════════════════

class _ProfileMenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? trailing;
  final VoidCallback onTap;

  const _ProfileMenuItem({
    required this.icon,
    required this.title,
    this.subtitle,
    this.trailing,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      splashColor: AppTheme.driverPrimary.withValues(alpha: 0.06),
      highlightColor: AppTheme.driverPrimary.withValues(alpha: 0.03),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
        child: Row(
          children: [
            Icon(
              icon,
              size: 22,
              color: AppTheme.textSecondaryOf(context),
            ),
            const SizedBox(width: 16),
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
            if (trailing != null) ...[
              trailing!,
              const SizedBox(width: 8),
            ],
            const Icon(
              Icons.chevron_right,
              size: 20,
              color: Color(0xFFC4C9CF),
            ),
          ],
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// EDIT FIELD — clean input for bottom sheet
// ═══════════════════════════════════════════════════════════════

class _EditField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final IconData icon;
  final TextInputType? keyboardType;
  final TextCapitalization textCapitalization;

  const _EditField({
    required this.controller,
    required this.label,
    required this.icon,
    this.keyboardType,
    this.textCapitalization = TextCapitalization.none,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      textCapitalization: textCapitalization,
      style: TextStyle(
        fontSize: 15,
        fontWeight: FontWeight.w500,
        color: AppTheme.textPrimaryOf(context),
      ),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(
          fontSize: 14,
          color: AppTheme.textHintOf(context),
          fontWeight: FontWeight.w400,
        ),
        prefixIcon: Icon(
          icon,
          size: 20,
          color: AppTheme.textHintOf(context),
        ),
        filled: true,
        fillColor: const Color(0xFFF7F8FA),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE8ECF0)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE8ECF0)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(
            color: AppTheme.driverPrimary,
            width: 1.5,
          ),
        ),
      ),
    );
  }
}
