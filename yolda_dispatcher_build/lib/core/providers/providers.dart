import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api/api_client.dart';
import '../services/auth_service.dart';
import '../services/ads_service.dart';
import '../services/calls_service.dart';
import '../services/geofence_service.dart';
import '../services/socket_service.dart';

final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());
final authServiceProvider = Provider<AuthService>((ref) => AuthService(ref.read(apiClientProvider)));
final adsServiceProvider = Provider<AdsService>((ref) => AdsService(ref.read(apiClientProvider)));
final callsServiceProvider = Provider<CallsService>((ref) => CallsService(ref.read(apiClientProvider)));
final geofenceServiceProvider = Provider<GeofenceService>((ref) => GeofenceService(ref.read(apiClientProvider)));
final socketServiceProvider = Provider<SocketService>((ref) => SocketService(ref.read(apiClientProvider)));

class DispatcherState {
  final String? id;
  final String? phone;
  final String? fullName;
  final String? workMode;
  final bool isLoggedIn;

  DispatcherState({this.id, this.phone, this.fullName, this.workMode, this.isLoggedIn = false});
  factory DispatcherState.empty() => DispatcherState();
  factory DispatcherState.fromJson(Map<String, dynamic> json) => DispatcherState(
    id: json['id']?.toString(), phone: json['phone']?.toString(),
    fullName: json['fullName']?.toString(), workMode: json['workMode']?.toString(),
    isLoggedIn: true,
  );
  DispatcherState copyWith({String? id, String? phone, String? fullName, String? workMode, bool? isLoggedIn}) =>
    DispatcherState(id: id ?? this.id, phone: phone ?? this.phone, fullName: fullName ?? this.fullName,
      workMode: workMode ?? this.workMode, isLoggedIn: isLoggedIn ?? this.isLoggedIn);
}

class DispatcherNotifier extends StateNotifier<DispatcherState> {
  DispatcherNotifier() : super(DispatcherState.empty());
  void setDispatcher(Map<String, dynamic> data) => state = DispatcherState.fromJson(data);
  void logout() => state = DispatcherState.empty();
}

final dispatcherProvider = StateNotifierProvider<DispatcherNotifier, DispatcherState>((_) => DispatcherNotifier());

class GeofenceStatus {
  final bool insideZone;
  final String? currentZoneId;
  final String? currentZoneName;
  final double? lat;
  final double? lng;
  final bool gpsEnabled;

  GeofenceStatus({this.insideZone = false, this.currentZoneId, this.currentZoneName, this.lat, this.lng, this.gpsEnabled = false});
  GeofenceStatus copyWith({bool? insideZone, String? currentZoneId, String? currentZoneName, double? lat, double? lng, bool? gpsEnabled}) =>
    GeofenceStatus(insideZone: insideZone ?? this.insideZone, currentZoneId: currentZoneId ?? this.currentZoneId,
      currentZoneName: currentZoneName ?? this.currentZoneName, lat: lat ?? this.lat, lng: lng ?? this.lng,
      gpsEnabled: gpsEnabled ?? this.gpsEnabled);
}

class GeofenceNotifier extends StateNotifier<GeofenceStatus> {
  GeofenceNotifier() : super(GeofenceStatus());
  void update(GeofenceStatus s) => state = s;
  void setInside(bool v, {String? zoneId, String? zoneName}) =>
    state = state.copyWith(insideZone: v, currentZoneId: zoneId, currentZoneName: zoneName);
  void setPosition(double lat, double lng) =>
    state = state.copyWith(lat: lat, lng: lng, gpsEnabled: true);
}

final geofenceStatusProvider = StateNotifierProvider<GeofenceNotifier, GeofenceStatus>((_) => GeofenceNotifier());
