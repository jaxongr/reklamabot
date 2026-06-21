import '../api/api_client.dart';

class AuthService {
  final ApiClient _api;
  AuthService(this._api);

  Future<void> requestCode(String phone) async {
    await _api.dio.post('/auth/request-code', data: {'phone': phone});
  }

  Future<Map<String, dynamic>> login(String phone, String code, {Map<String, dynamic>? deviceInfo}) async {
    final r = await _api.dio.post('/auth/login', data: {
      'phone': phone, 'code': code,
      if (deviceInfo != null) 'deviceInfo': deviceInfo,
    });
    final data = r.data as Map<String, dynamic>;
    await _api.setToken(data['token'] as String);
    return data;
  }

  Future<Map<String, dynamic>> me() async {
    final r = await _api.dio.get('/auth/me');
    return Map<String, dynamic>.from(r.data);
  }

  Future<void> updateLocation(double lat, double lng, {String? zoneId}) async {
    await _api.dio.post('/auth/location', data: {
      'lat': lat, 'lng': lng,
      if (zoneId != null) 'zoneId': zoneId,
    });
  }

  Future<void> logout() async => _api.setToken(null);
  bool get isLoggedIn => _api.token != null && _api.token!.isNotEmpty;
}
