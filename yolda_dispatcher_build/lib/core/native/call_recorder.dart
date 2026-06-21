import 'package:flutter/services.dart';

class CallRecorder {
  static const MethodChannel _channel = MethodChannel('uz.yolda.dispatcher/call_recorder');
  static const EventChannel _events = EventChannel('uz.yolda.dispatcher/call_events');

  static Future<String?> startRecording({String audioSource = 'VOICE_RECOGNITION'}) async {
    try {
      return await _channel.invokeMethod<String>('startRecording', {'audioSource': audioSource});
    } on PlatformException catch (e) {
      throw Exception('Recording start failed: ${e.message}');
    }
  }

  static Future<String?> stopRecording() async {
    try {
      return await _channel.invokeMethod<String>('stopRecording');
    } on PlatformException {
      return null;
    }
  }

  static Future<bool> isRooted() async {
    try { return await _channel.invokeMethod<bool>('isRooted') ?? false; } catch (_) { return false; }
  }

  static Future<int> androidVersion() async {
    try { return await _channel.invokeMethod<int>('androidVersion') ?? 0; } catch (_) { return 0; }
  }

  static Future<bool> isAccessibilityEnabled() async {
    try { return await _channel.invokeMethod<bool>('isAccessibilityEnabled') ?? false; } catch (_) { return false; }
  }

  static Future<void> openAccessibilitySettings() async => await _channel.invokeMethod('openAccessibilitySettings');

  static Stream<Map<String, dynamic>> callEvents() => _events.receiveBroadcastStream().map((event) {
    if (event is Map) return Map<String, dynamic>.from(event);
    return {'state': event.toString()};
  });

  static Future<bool> canDrawOverlays() async {
    try { return await _channel.invokeMethod<bool>('canDrawOverlays') ?? false; } catch (_) { return false; }
  }

  static Future<void> requestOverlayPermission() async => await _channel.invokeMethod('requestOverlayPermission');
}
