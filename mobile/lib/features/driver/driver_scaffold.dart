import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:permission_handler/permission_handler.dart';

import '../../config/theme.dart';
import '../../core/api/websocket_client.dart';

/// Driver app scaffold — bottom navigation + permission requests
class DriverScaffold extends ConsumerStatefulWidget {
  final StatefulNavigationShell navigationShell;

  const DriverScaffold({super.key, required this.navigationShell});

  @override
  ConsumerState<DriverScaffold> createState() => _DriverScaffoldState();
}

class _DriverScaffoldState extends ConsumerState<DriverScaffold> {
  bool _permissionsRequested = false;

  @override
  void initState() {
    super.initState();
    // WebSocket ulash
    Future.microtask(() => ref.read(wsClientProvider));
    // Ruxsatlarni so'rash
    Future.delayed(const Duration(milliseconds: 500), _requestPermissions);
  }

  Future<void> _requestPermissions() async {
    if (_permissionsRequested) return;
    _permissionsRequested = true;

    // 1. Bildirishnoma
    try {
      await Permission.notification.request();
    } catch (_) {}

    // 2. PROMINENT DISCLOSURE (Google Play talabi) — fonda joylashuv
    // yig'ishdan OLDIN foydalanuvchiga aniq tushuntirib, rozilik olamiz.
    final locationAlreadyGranted = await Permission.location.isGranted;
    bool locationConsent = locationAlreadyGranted;
    if (!locationAlreadyGranted && mounted) {
      locationConsent = await _showLocationDisclosure();
    }

    if (locationConsent) {
      // 2a. GPS (asosiy)
      try {
        await Permission.location.request();
      } catch (_) {}

      // 2b. Background GPS (fonda kuzatish) — disclosure'dan keyin
      try {
        await Permission.locationAlways.request();
      } catch (_) {}
    }

    // 4. Kamera (mashina/hujjat foto)
    try {
      await Permission.camera.request();
    } catch (_) {}

    // 5. Batareya optimizatsiya — REQUEST_IGNORE_BATTERY_OPTIMIZATIONS
    // manifest da bo'lishi SHART, aks holda dialog chiqmaydi
    try {
      final batteryStatus = await Permission.ignoreBatteryOptimizations.status;
      if (!batteryStatus.isGranted) {
        final result = await Permission.ignoreBatteryOptimizations.request();
        // Agar system dialog chiqmagan yoki rad etilgan bo'lsa
        if (!result.isGranted) {
          // FlutterForegroundTask orqali urinish (to'g'ridan-to'g'ri Intent ochadi)
          try {
            final ignoring = await FlutterForegroundTask.isIgnoringBatteryOptimizations;
            if (!ignoring) {
              await FlutterForegroundTask.requestIgnoreBatteryOptimization();
            }
          } catch (_) {}
        }
      }
    } catch (_) {
      // Fallback — FlutterForegroundTask bilan urinish
      try {
        await FlutterForegroundTask.requestIgnoreBatteryOptimization();
      } catch (_) {}
    }

    // 6. Ruxsat rad etilgan bo'lsa — ogohlantirish
    await _checkCriticalPermissions();
  }

  /// Google Play "Prominent Disclosure" — fonda joylashuv yig'ishdan oldin
  /// foydalanuvchiga aniq tushuntirib, roziligini olamiz.
  Future<bool> _showLocationDisclosure() async {
    if (!mounted) return false;
    final result = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        title: Row(
          children: const [
            Icon(Icons.location_on, color: AppTheme.primary),
            SizedBox(width: 8),
            Expanded(child: Text('Joylashuv ruxsati')),
          ],
        ),
        content: const SingleChildScrollView(
          child: Text(
            "YO'LDA ilovasi sizga eng yaqin yuk buyurtmalarini ko'rsatish va "
            "dispetcherlarga joylashuvingizni real vaqtda yetkazib berish uchun "
            "joylashuv (GPS) ma'lumotlaringizni to'playdi.\n\n"
            "Bu ma'lumot ilova YOPIQ yoki ISHLATILMAYOTGAN bo'lganda ham "
            "(fonda) to'planadi — siz yo'lda bo'lганingizda buyurtmalarni "
            "to'g'ri taqsimlash uchun.\n\n"
            "Joylashuv faqat shu maqsadda ishlatiladi va uchinchi shaxslarga "
            "sotilmaydi. Batafsil: logistikapro.uz/privacy.html\n\n"
            "Davom etish uchun rozilik bering.",
            style: TextStyle(height: 1.5),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text("Yo'q"),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primary,
              foregroundColor: Colors.white,
            ),
            child: const Text('Roziman, davom etish'),
          ),
        ],
      ),
    );
    return result ?? false;
  }

  Future<void> _checkCriticalPermissions() async {
    if (!mounted) return;

    final gps = await Permission.location.isGranted;
    final battery = await Permission.ignoreBatteryOptimizations.isGranted;

    if (!gps) {
      _showPermissionWarning(
        'GPS ruxsati berilmagan. Ilova to\'g\'ri ishlamasligi mumkin.',
        'GPS yoqish',
        () => openAppSettings(),
      );
    } else if (!battery) {
      _showPermissionWarning(
        'Fonda ishlash uchun batareya optimizatsiyasini o\'chiring',
        'Sozlamalar',
        () => openAppSettings(),
      );
    }
  }

  void _showPermissionWarning(String message, String buttonLabel, VoidCallback onTap) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppTheme.warningColor,
        duration: const Duration(seconds: 10),
        action: SnackBarAction(
          label: buttonLabel,
          textColor: Colors.white,
          onPressed: onTap,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Orqaga bosganda ilova fonga ketadi — GPS davom etadi
    // Faqat "Offline" tugma yoki "Chiqish" bosganda GPS o'chadi
    return Scaffold(
      body: widget.navigationShell,
      bottomNavigationBar: _DriverBottomBar(
        currentIndex: widget.navigationShell.currentIndex,
        onTap: (index) {
          widget.navigationShell.goBranch(
            index,
            initialLocation: index == widget.navigationShell.currentIndex,
          );
        },
      ),
    );
  }
}

class _DriverBottomBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const _DriverBottomBar({
    required this.currentIndex,
    required this.onTap,
  });

  static const _items = [
    _NavItem(
      icon: Icons.local_shipping_outlined,
      activeIcon: Icons.local_shipping_rounded,
      label: 'Yuklar',
    ),
    _NavItem(
      icon: Icons.handshake_outlined,
      activeIcon: Icons.handshake_rounded,
      label: 'Takliflar',
    ),
    _NavItem(
      icon: Icons.check_circle_outline,
      activeIcon: Icons.check_circle_rounded,
      label: 'Qabul',
    ),
    _NavItem(
      icon: Icons.person_outlined,
      activeIcon: Icons.person_rounded,
      label: 'Profil',
    ),
    _NavItem(
      icon: Icons.menu_rounded,
      activeIcon: Icons.menu_rounded,
      label: 'Menyu',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: AppTheme.driverPrimary.withValues(alpha: 0.06),
            blurRadius: 16,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 68,
          child: Row(
            children: List.generate(_items.length, (index) {
              final item = _items[index];
              final isSelected = currentIndex == index;

              return Expanded(
                child: GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () => onTap(index),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 4),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppTheme.driverPrimary.withValues(alpha: 0.1)
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Icon(
                          isSelected ? item.activeIcon : item.icon,
                          size: 24,
                          color: isSelected
                              ? AppTheme.driverPrimary
                              : const Color(0xFFB0B0B0),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        item.label,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight:
                              isSelected ? FontWeight.w700 : FontWeight.w400,
                          color: isSelected
                              ? AppTheme.driverPrimary
                              : const Color(0xFFB0B0B0),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;

  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
  });
}
