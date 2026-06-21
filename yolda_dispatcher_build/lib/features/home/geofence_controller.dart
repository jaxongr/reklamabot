import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import '../../core/providers/providers.dart';
import '../calls/call_listener.dart';

class GeofenceController {
  final Ref _ref;
  StreamSubscription<Position>? _sub;
  CallListener? _callListener;

  GeofenceController(this._ref);

  Future<void> start() async {
    final dispatcher = _ref.read(dispatcherProvider);
    final geofence = _ref.read(geofenceServiceProvider);

    await geofence.fetchMyZones();
    final hasPermission = await geofence.ensurePermission();
    _ref.read(geofenceStatusProvider.notifier).update(
      _ref.read(geofenceStatusProvider).copyWith(gpsEnabled: hasPermission));

    if (dispatcher.workMode == 'ANYWHERE') {
      _ref.read(geofenceStatusProvider.notifier).setInside(true);
      _startCallListener();
    }
    if (!hasPermission) return;

    _sub = geofence.watchPosition().listen((pos) async {
      _ref.read(geofenceStatusProvider.notifier).setPosition(pos.latitude, pos.longitude);
      _ref.read(authServiceProvider).updateLocation(pos.latitude, pos.longitude).catchError((_) {});

      if (dispatcher.workMode == 'GEOFENCED') {
        final zone = geofence.findZoneFor(pos.latitude, pos.longitude);
        final inside = zone != null;
        _ref.read(geofenceStatusProvider.notifier).setInside(inside,
          zoneId: zone?['id'] as String?, zoneName: zone?['name'] as String?);
        if (inside) _startCallListener(); else _stopCallListener();
      }
    });

    _ref.read(socketServiceProvider).connect();
  }

  void _startCallListener() {
    _callListener ??= CallListener(_ref);
    _callListener!.start();
  }

  void _stopCallListener() => _callListener?.stop();

  void stop() {
    _sub?.cancel();
    _stopCallListener();
  }
}
