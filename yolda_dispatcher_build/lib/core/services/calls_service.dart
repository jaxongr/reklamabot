import 'dart:io';
import 'package:dio/dio.dart';
import '../api/api_client.dart';

class CallsService {
  final ApiClient _api;
  CallsService(this._api);

  Future<Map<String, dynamic>> startCall({
    required String phone,
    required String direction,
    double? lat, double? lng, String? zoneId,
  }) async {
    final r = await _api.dio.post('/calls/start', data: {
      'phone': phone, 'direction': direction,
      if (lat != null) 'lat': lat,
      if (lng != null) 'lng': lng,
      if (zoneId != null) 'zoneId': zoneId,
    });
    return Map<String, dynamic>.from(r.data);
  }

  Future<void> endCall(String callId, int durationSec) async {
    await _api.dio.post('/calls/$callId/end', data: {'durationSec': durationSec});
  }

  Future<void> classify(String callId, {
    String? vehicleType, String? vehicleCapacity, String? senderRole, String? notes,
  }) async {
    await _api.dio.patch('/calls/$callId/classify', data: {
      if (vehicleType != null) 'vehicleType': vehicleType,
      if (vehicleCapacity != null) 'vehicleCapacity': vehicleCapacity,
      if (senderRole != null) 'senderRole': senderRole,
      if (notes != null) 'notes': notes,
    });
  }

  Future<Map<String, dynamic>> uploadVoice(String callId, File voiceFile) async {
    final form = FormData.fromMap({
      'voice': await MultipartFile.fromFile(voiceFile.path, filename: voiceFile.path.split('/').last),
    });
    final r = await _api.dio.post('/calls/$callId/voice', data: form);
    return Map<String, dynamic>.from(r.data);
  }

  Future<List<dynamic>> history({int limit = 50, String? direction, String? phone}) async {
    final r = await _api.dio.get('/calls/history', queryParameters: {
      'limit': limit,
      if (direction != null) 'direction': direction,
      if (phone != null) 'phone': phone,
    });
    return List<dynamic>.from(r.data);
  }

  Future<Map<String, dynamic>> checkBlocklist(String phone) async {
    final r = await _api.dio.get('/blocklist/check', queryParameters: {'phone': phone});
    return Map<String, dynamic>.from(r.data);
  }
}
