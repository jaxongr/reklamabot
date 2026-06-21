import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../core/native/call_recorder.dart';
import '../../core/providers/providers.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});
  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool _accessibilityEnabled = false;
  bool _overlayGranted = false;
  bool _rooted = false;
  int _androidVersion = 0;

  @override
  void initState() { super.initState(); _check(); }

  Future<void> _check() async {
    final results = await Future.wait([
      CallRecorder.isAccessibilityEnabled(),
      CallRecorder.canDrawOverlays(),
      CallRecorder.isRooted(),
      CallRecorder.androidVersion(),
    ]);
    setState(() {
      _accessibilityEnabled = results[0] as bool;
      _overlayGranted = results[1] as bool;
      _rooted = results[2] as bool;
      _androidVersion = results[3] as int;
    });
  }

  @override
  Widget build(BuildContext context) {
    final dispatcher = ref.watch(dispatcherProvider);
    final geofence = ref.watch(geofenceStatusProvider);

    return Scaffold(
      backgroundColor: AppTheme.bgBody,
      appBar: AppBar(title: const Text("Profil va sozlamalar")),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(AppTheme.radiusLarge)),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                CircleAvatar(radius: 30, backgroundColor: AppTheme.accent,
                  child: Text((dispatcher.fullName ?? '?').isNotEmpty ? dispatcher.fullName![0].toUpperCase() : '?',
                    style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold))),
                const SizedBox(width: 12),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(dispatcher.fullName ?? 'Dispatcher',
                    style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 4),
                  Text(dispatcher.phone ?? '',
                    style: const TextStyle(color: AppTheme.accent, fontWeight: FontWeight.w600)),
                ])),
              ]),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(AppTheme.radiusSmall)),
                child: Row(children: [
                  Icon(dispatcher.workMode == 'ANYWHERE' ? Icons.public : Icons.location_on,
                    color: Colors.white, size: 16),
                  const SizedBox(width: 6),
                  Text(dispatcher.workMode == 'ANYWHERE' ? 'Hamma joyda ishlash' : 'Faqat zona ichida',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
                ]),
              ),
            ]),
          ),
          const SizedBox(height: 20),
          _sectionTitle('Holat'),
          _statusTile('GPS', geofence.gpsEnabled, 'Lokatsiya ruxsati'),
          _statusTile('Zonada', geofence.insideZone, geofence.currentZoneName ?? 'Zona tashqarisida'),
          _statusTile('Accessibility', _accessibilityEnabled, 'Qo\'ng\'iroq yozish uchun',
            onTap: () => CallRecorder.openAccessibilitySettings()),
          _statusTile('Overlay', _overlayGranted, 'Popup ko\'rsatish uchun',
            onTap: () => CallRecorder.requestOverlayPermission()),
          const SizedBox(height: 20),
          _sectionTitle('Telefon ma\'lumoti'),
          _infoTile('Android versiya', _androidVersion.toString()),
          _infoTile('Root', _rooted ? 'Ha ✓' : 'Yo\'q'),
          const SizedBox(height: 20),
          Container(
            decoration: BoxDecoration(color: Colors.white,
              borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
              border: Border.all(color: AppTheme.cardBorder)),
            child: ListTile(
              leading: const Icon(Icons.logout, color: AppTheme.errorColor),
              title: const Text('Chiqish', style: TextStyle(color: AppTheme.errorColor)),
              onTap: _logout,
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionTitle(String title) => Padding(
    padding: const EdgeInsets.only(left: 4, bottom: 8),
    child: Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13,
      color: AppTheme.textSecondary, letterSpacing: 0.5)),
  );

  Widget _statusTile(String label, bool status, String desc, {VoidCallback? onTap}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(color: Colors.white,
        borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
        border: Border.all(color: AppTheme.cardBorder)),
      child: ListTile(
        leading: Icon(status ? Icons.check_circle : Icons.cancel,
          color: status ? AppTheme.successColor : AppTheme.errorColor),
        title: Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(desc),
        trailing: onTap != null ? const Icon(Icons.chevron_right) : null,
        onTap: onTap,
      ),
    );
  }

  Widget _infoTile(String label, String value) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(color: Colors.white,
        borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
        border: Border.all(color: AppTheme.cardBorder)),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text(label, style: const TextStyle(color: AppTheme.textSecondary)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
      ]),
    );
  }

  Future<void> _logout() async {
    await ref.read(authServiceProvider).logout();
    ref.read(dispatcherProvider.notifier).logout();
    if (mounted) context.go('/login');
  }
}
