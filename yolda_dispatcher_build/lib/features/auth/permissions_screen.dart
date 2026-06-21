import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../config/theme.dart';
import '../../core/native/call_recorder.dart';

class PermissionsScreen extends ConsumerStatefulWidget {
  const PermissionsScreen({super.key});
  @override
  ConsumerState<PermissionsScreen> createState() => _PermissionsScreenState();
}

class _PermissionsScreenState extends ConsumerState<PermissionsScreen> {
  final _states = <String, bool>{};
  bool _checking = false;

  final _permissions = [
    ('location', Icons.location_on_outlined, 'Joylashuv', 'Geo zona aniqlash uchun', Permission.locationWhenInUse),
    ('locationAlways', Icons.my_location, 'Fon joylashuv', 'Arqa fonda GPS kuzatuv', Permission.locationAlways),
    ('phone', Icons.phone_outlined, 'Telefon', 'Qo\'ng\'iroq holatini o\'qish', Permission.phone),
    ('microphone', Icons.mic_outlined, 'Mikrofon', 'Qo\'ng\'iroq yozish', Permission.microphone),
    ('sms', Icons.sms_outlined, 'SMS', 'Karta raqam tekshirish', Permission.sms),
    ('notification', Icons.notifications_outlined, 'Bildirishnomalar', 'Admin javoblari', Permission.notification),
  ];

  @override
  void initState() {
    super.initState();
    _check();
  }

  Future<void> _check() async {
    for (final p in _permissions) {
      _states[p.$1] = (await p.$5.status).isGranted;
    }
    setState(() {});
  }

  Future<void> _requestAll() async {
    setState(() => _checking = true);
    for (final p in _permissions) {
      final status = await p.$5.request();
      _states[p.$1] = status.isGranted;
      setState(() {});
    }
    setState(() => _checking = false);
  }

  Future<void> _continue() async {
    if (mounted) context.go('/home');
  }

  Future<void> _openAccessibility() async {
    await CallRecorder.openAccessibilitySettings();
  }

  Future<void> _openOverlay() async {
    await CallRecorder.requestOverlayPermission();
  }

  @override
  Widget build(BuildContext context) {
    final granted = _states.values.where((v) => v).length;
    final total = _permissions.length;
    final allCritical = (_states['location'] ?? false) &&
                        (_states['phone'] ?? false) &&
                        (_states['microphone'] ?? false);

    return Scaffold(
      backgroundColor: AppTheme.bgBody,
      body: SafeArea(
        child: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(gradient: AppTheme.primaryGradient),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Ruxsatlar",
                    style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  Text("Ilova ishlashi uchun $granted/$total ruxsat",
                    style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 14)),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  ..._permissions.map((p) => _permTile(p)),
                  const SizedBox(height: 16),
                  _statusTile(
                    Icons.accessibility_outlined,
                    'Accessibility',
                    'Qo\'ng\'iroq yozish uchun (qo\'lda yoqiladi)',
                    _openAccessibility,
                  ),
                  _statusTile(
                    Icons.picture_in_picture_alt_outlined,
                    'Overlay',
                    'Popup ko\'rsatish uchun (qo\'lda yoqiladi)',
                    _openOverlay,
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(children: [
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    icon: _checking
                        ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Icon(Icons.security_outlined),
                    label: const Text('Barcha ruxsatlarni so\'rash'),
                    onPressed: _checking ? null : _requestAll,
                  ),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: TextButton(
                    onPressed: allCritical ? _continue : null,
                    child: Text(allCritical ? 'Davom etish ✓' : 'Asosiy ruxsatlarni bering'),
                  ),
                ),
              ]),
            ),
          ],
        ),
      ),
    );
  }

  Widget _permTile((String, IconData, String, String, Permission) p) {
    final granted = _states[p.$1] ?? false;
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
        border: Border.all(color: AppTheme.cardBorder),
      ),
      child: ListTile(
        leading: Container(
          width: 40, height: 40,
          decoration: BoxDecoration(
            color: (granted ? AppTheme.successColor : AppTheme.warningColor).withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(p.$2, color: granted ? AppTheme.successColor : AppTheme.warningColor),
        ),
        title: Text(p.$3, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(p.$4, style: const TextStyle(fontSize: 12)),
        trailing: Icon(
          granted ? Icons.check_circle : Icons.arrow_forward_ios,
          color: granted ? AppTheme.successColor : AppTheme.textHint,
          size: 18,
        ),
        onTap: granted ? null : () async {
          final s = await p.$5.request();
          setState(() => _states[p.$1] = s.isGranted);
        },
      ),
    );
  }

  Widget _statusTile(IconData icon, String title, String desc, VoidCallback onTap) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
        border: Border.all(color: AppTheme.cardBorder),
      ),
      child: ListTile(
        leading: Container(
          width: 40, height: 40,
          decoration: BoxDecoration(
            color: AppTheme.accent.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: AppTheme.accent),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(desc, style: const TextStyle(fontSize: 12)),
        trailing: const Icon(Icons.chevron_right, size: 18),
        onTap: onTap,
      ),
    );
  }
}
