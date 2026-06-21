import 'package:geolocator/geolocator.dart';
import '../api/api_client.dart';

class GeofenceService {
  final ApiClient _api;
  List<Map<String, dynamic>> _zones = [];

  GeofenceService(this._api);

  Future<List<Map<String, dynamic>>> fetchMyZones() async {
    try {
      final r = await _api.dio.get('/geozones/mine');
      _zones = List<Map<String, dynamic>>.from(r.data);
      return _zones;
    } catch (_) {
      return [];
    }
  }

  Map<String, dynamic>? findZoneFor(double lat, double lng) {
    for (final z in _zones) {
      final type = z['type'] as String;
      if (type == 'CIRCLE') {
        final cLat = (z['centerLat'] as num).toDouble();
        final cLng = (z['centerLng'] as num).toDouble();
        final rM = (z['radiusMeters'] as num?)?.toDouble() ?? 1000;
        final dist = Geolocator.distanceBetween(lat, lng, cLat, cLng);
        if (dist <= rM) return z;
      } else if (type == 'POLYGON') {
        final coords = z['coordinates'] as List<dynamic>;
        final points = coords.map<List<double>>((c) => [(c[1] as num).toDouble(), (c[0] as num).toDouble()]).toList();
        if (_pointInPolygon(lat, lng, points)) return z;
      }
    }
    return null;
  }

  bool _pointInPolygon(double lat, double lng, List<List<double>> polygon) {
    bool inside = false;
    int j = polygon.length - 1;
    for (int i = 0; i < polygon.length; i++) {
      final lat1 = polygon[i][0]; final lng1 = polygon[i][1];
      final lat2 = polygon[j][0]; final lng2 = polygon[j][1];
      if ((lng1 > lng) != (lng2 > lng) && lat < (lat2 - lat1) * (lng - lng1) / (lng2 - lng1) + lat1) {
        inside = !inside;
      }
      j = i;
    }
    return inside;
  }

  Stream<Position> watchPosition() =>
    Geolocator.getPositionStream(locationSettings: const LocationSettings(accuracy: LocationAccuracy.high, distanceFilter: 30));

  Future<bool> ensurePermission() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return false;
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) permission = await Geolocator.requestPermission();
    return permission == LocationPermission.whileInUse || permission == LocationPermission.always;
  }

  List<Map<String, dynamic>> get zones => _zones;
}
