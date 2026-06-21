import 'dart:async';
import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/native/call_recorder.dart';
import '../../core/providers/providers.dart';
import 'vehicle_type_popup.dart';

class CallListener {
  final Ref _ref;
  StreamSubscription<Map<String, dynamic>>? _sub;
  String? _currentPhone;
  String? _currentDirection;
  String? _currentCallId;
  DateTime? _startTime;
  bool _recordingActive = false;

  CallListener(this._ref);

  void start() {
    if (_sub != null) return;
    _sub = CallRecorder.callEvents().listen(_onEvent);
  }

  void stop() {
    _sub?.cancel();
    _sub = null;
    _stopRecording();
  }

  Future<void> _onEvent(Map<String, dynamic> event) async {
    final state = (event['state'] as String?) ?? '';
    final phone = event['phone'] as String?;

    switch (state) {
      case 'INCOMING_RING':
      case 'OUTGOING_DIALING':
        _currentPhone = phone;
        _currentDirection = state == 'INCOMING_RING' ? 'INBOUND' : 'OUTBOUND';
        await _startCallServer(phone ?? '', _currentDirection!);
        break;
      case 'OFFHOOK':
      case 'ACTIVE':
        if (!_recordingActive && _currentCallId != null) {
          await _startRecording();
          _startTime = DateTime.now();
        }
        break;
      case 'IDLE':
      case 'ENDED':
        if (_recordingActive) {
          final path = await _stopRecording();
          final duration = _startTime != null ? DateTime.now().difference(_startTime!).inSeconds : 0;

          if (_currentCallId != null) {
            _ref.read(callsServiceProvider).endCall(_currentCallId!, duration).catchError((_) {});

            if (path != null && await File(path).exists()) {
              final file = File(path);
              try {
                await _ref.read(callsServiceProvider).uploadVoice(_currentCallId!, file);
              } catch (_) {}
              try { await file.delete(); } catch (_) {}
            }
            VehicleTypePopup.show(_ref, callId: _currentCallId!, phone: _currentPhone ?? '');
          }
          _currentPhone = null;
          _currentCallId = null;
          _startTime = null;
        }
        break;
    }
  }

  Future<void> _startCallServer(String phone, String direction) async {
    try {
      final bl = await _ref.read(callsServiceProvider).checkBlocklist(phone);
      if (bl['blocked'] == true) return;
    } catch (_) {}

    try {
      final geo = _ref.read(geofenceStatusProvider);
      final result = await _ref.read(callsServiceProvider).startCall(
        phone: phone, direction: direction,
        lat: geo.lat, lng: geo.lng, zoneId: geo.currentZoneId,
      );
      _currentCallId = result['callId'] as String?;
    } catch (_) {}
  }

  Future<void> _startRecording() async {
    try {
      await CallRecorder.startRecording(audioSource: 'VOICE_RECOGNITION');
      _recordingActive = true;
    } catch (_) {}
  }

  Future<String?> _stopRecording() async {
    _recordingActive = false;
    try {
      return await CallRecorder.stopRecording();
    } catch (_) {
      return null;
    }
  }
}
