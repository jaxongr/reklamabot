import '../api/api_client.dart';

class AdsService {
  final ApiClient _api;
  AdsService(this._api);

  Future<Map<String, dynamic>> fetchFeed({String? cursor, int limit = 30, String? vehicleType}) async {
    final r = await _api.dio.get('/ads/feed', queryParameters: {
      if (cursor != null) 'cursor': cursor,
      'limit': limit,
      if (vehicleType != null) 'vehicleType': vehicleType,
    });
    return Map<String, dynamic>.from(r.data);
  }

  Future<void> markViewed(String id) async => await _api.dio.post('/ads/$id/viewed');

  Future<Map<String, dynamic>> requestDriver({String? orderId, String? requestedPhone, Map<String, dynamic>? orderSnapshot}) async {
    final r = await _api.dio.post('/requests', data: {
      if (orderId != null) 'orderId': orderId,
      if (requestedPhone != null) 'requestedPhone': requestedPhone,
      if (orderSnapshot != null) 'orderSnapshot': orderSnapshot,
    });
    return Map<String, dynamic>.from(r.data);
  }
}
