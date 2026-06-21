import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../core/providers/providers.dart';
import 'geofence_controller.dart';

class HomeShell extends ConsumerStatefulWidget {
  final Widget child;
  const HomeShell({super.key, required this.child});
  @override
  ConsumerState<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends ConsumerState<HomeShell> {
  late final GeofenceController _geofenceController;

  @override
  void initState() {
    super.initState();
    _geofenceController = GeofenceController(ref);
    WidgetsBinding.instance.addPostFrameCallback((_) => _geofenceController.start());
  }

  @override
  void dispose() {
    _geofenceController.stop();
    super.dispose();
  }

  int _indexForLocation(String loc) {
    if (loc.startsWith('/accepted')) return 1;
    if (loc.startsWith('/calls')) return 2;
    if (loc.startsWith('/settings')) return 3;
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    final idx = _indexForLocation(location);
    final geofence = ref.watch(geofenceStatusProvider);
    final dispatcher = ref.watch(dispatcherProvider);
    final showingGeofenceWarning = dispatcher.workMode == 'GEOFENCED' && !geofence.insideZone;

    return Scaffold(
      backgroundColor: AppTheme.bgBody,
      body: Column(
        children: [
          if (showingGeofenceWarning) _buildZoneWarning(),
          Expanded(child: widget.child),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -2))],
        ),
        child: SafeArea(
          child: NavigationBar(
            selectedIndex: idx,
            onDestinationSelected: (i) {
              if (i == 0) context.go('/home');
              if (i == 1) context.go('/accepted');
              if (i == 2) context.go('/calls');
              if (i == 3) context.go('/settings');
            },
            backgroundColor: Colors.white,
            indicatorColor: AppTheme.primary.withValues(alpha: 0.1),
            destinations: const [
              NavigationDestination(icon: Icon(Icons.list_alt_outlined), selectedIcon: Icon(Icons.list_alt, color: AppTheme.primary), label: "E'lonlar"),
              NavigationDestination(icon: Icon(Icons.check_circle_outline), selectedIcon: Icon(Icons.check_circle, color: AppTheme.accent), label: "Qabul qilingan"),
              NavigationDestination(icon: Icon(Icons.phone_outlined), selectedIcon: Icon(Icons.phone, color: AppTheme.primary), label: "Qo'ng'iroqlar"),
              NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person, color: AppTheme.primary), label: "Profil"),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildZoneWarning() => Container(
    color: AppTheme.warningColor,
    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
    child: const Row(children: [
      Icon(Icons.location_off, color: Colors.white, size: 18),
      SizedBox(width: 8),
      Expanded(child: Text("Siz belgilangan zona tashqarisidasiz — ilova uxlamoqda",
        style: TextStyle(color: Colors.white, fontWeight: FontWeight.w500))),
    ]),
  );
}
