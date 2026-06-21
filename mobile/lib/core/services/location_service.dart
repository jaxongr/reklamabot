import 'dart:async';
import 'dart:convert';
import 'dart:developer' as dev;
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../../config/api_config.dart';
import '../../features/auth/auth_provider.dart';
import '../../features/driver/driver_provider.dart';
import '../api/api_client.dart';
import '../api/websocket_client.dart';
import '../models/user.dart';

// ============================================================
// FOREGROUND TASK — GPS background tracking
// Driver + Dispetcher (va boshqa autentifikatsiya qilingan rollar)
// ============================================================

const String _kPrefsToken = 'gps_access_token';
const String _kPrefsBaseUrl = 'gps_base_url';
const String _kPrefsRole = 'gps_user_role'; // DRIVER / DISPATCHER / USER / ...
const String _kPrefsLineActive = 'gps_line_active'; // "1" = yoqiq, "0" = o'chiq

@pragma('vm:entry-point')
void startCallback() {
  FlutterForegroundTask.setTaskHandler(GpsTaskHandler());
}

class GpsTaskHandler extends TaskHandler {
  String? _token;
  String _baseUrl = ApiConfig.defaultBaseUrl;
  String _role = 'USER';
  bool _lineActive = true;
  int _successCount = 0;
  int _errorCount = 0;
  int _totalSent = 0;
  // Dispatcher uchun: 500m+ harakatdan keyin yangilash (bir joyda o'tirsa, yubormaslik)
  Position? _lastBgSentPosition;
  static const double _dispatcherMinMoveBg = 500.0;

  @override
  Future<void> onStart(DateTime timestamp, TaskStarter starter) async {
    dev.log('[GPS] Task started at ${DateTime.now()}');
    await _loadPrefs();
    await _sendLocation();
  }

  @override
  void onRepeatEvent(DateTime timestamp) {
    _sendLocation();
  }

  @override
  Future<void> onDestroy(DateTime timestamp) async {
    dev.log('[GPS] Destroyed. Total: $_totalSent, OK: $_successCount, Err: $_errorCount');
  }

  @override
  void onReceiveData(Object data) {
    if (data is Map) {
      if (data['token'] != null) _token = data['token'] as String;
      if (data['baseUrl'] != null) _baseUrl = data['baseUrl'] as String;
      if (data['role'] != null) _role = data['role'] as String;
      if (data['lineActive'] != null) _lineActive = data['lineActive'] as bool;
    }
  }

  Future<void> _loadPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _token = prefs.getString(_kPrefsToken);
      final url = prefs.getString(_kPrefsBaseUrl);
      if (url != null && url.isNotEmpty) _baseUrl = url;
      _role = prefs.getString(_kPrefsRole) ?? 'USER';
      _lineActive = (prefs.getString(_kPrefsLineActive) ?? '1') == '1';
    } catch (e) {
      dev.log('[GPS] Prefs load err: $e');
    }
  }

  /// Online status ping — linya o'chiq bo'lsa ham backend foydalanuvchini onlayn deb biladi.
  Future<void> _pingOnlineStatus() async {
    if (_token == null) await _loadPrefs();
    if (_token == null) return;
    try {
      await http.patch(
        Uri.parse('$_baseUrl${ApiConfig.apiPrefix}/users/me/ping'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_token',
        },
      ).timeout(const Duration(seconds: 5));
    } catch (_) {}
  }

  /// Rolga qarab endpoint tanlash.
  /// - DRIVER  → /drivers/location (eski endpoint — DriverProfile.lastLat/lng ga yoziladi)
  /// - boshqa  → /users/me/location (yangi endpoint — User.lastLat/lng ga yoziladi)
  String _endpointForRole() {
    if (_role == 'DRIVER') {
      return '$_baseUrl${ApiConfig.apiPrefix}${ApiConfig.driverLocation}';
    }
    return '$_baseUrl${ApiConfig.apiPrefix}${ApiConfig.userLocation}';
  }

  Future<void> _sendLocation() async {
    _totalSent++;

    // Linya o'chiq bo'lsa GPS yubormaslik (lekin foreground service ishlab tursin —
    // FCM push, online status va yangi e'lonlar uchun)
    if (!_lineActive) {
      FlutterForegroundTask.updateService(
        notificationTitle: "YO'LDA — Onlayn (linya o'chiq)",
        notificationText: "Yangi xabarlarni qabul qiladi",
      );
      // Online ping (token qisqa bo'lsa ham, hech bo'lmaganda bekor qilingan request)
      await _pingOnlineStatus();
      return;
    }

    try {
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10),
        ),
      );

      FlutterForegroundTask.updateService(
        notificationTitle: "YO'LDA — Joylashuvingiz yo'naltirilmoqda",
        notificationText:
            '${position.latitude.toStringAsFixed(4)}, ${position.longitude.toStringAsFixed(4)} • #$_totalSent',
      );

      // Main isolate ga yuborish (ilova ochiq bo'lganda)
      FlutterForegroundTask.sendDataToMain({
        'lat': position.latitude,
        'lng': position.longitude,
      });

      // API ga to'g'ridan yuborish (ilova yopiq bo'lsa ham ishlaydi)
      if (_token == null) await _loadPrefs();
      if (_token == null) {
        _errorCount++;
        dev.log('[GPS] No token!');
        return;
      }

      // Dispatcher uchun: agar 500m'dan kam harakat qilgan bo'lsa — yangilamaslik
      // (dispatcherlar odatda bir joyda o'tiradi)
      if (_role != 'DRIVER' && _lastBgSentPosition != null) {
        final distance = Geolocator.distanceBetween(
          _lastBgSentPosition!.latitude,
          _lastBgSentPosition!.longitude,
          position.latitude,
          position.longitude,
        );
        if (distance < _dispatcherMinMoveBg) {
          // Joy o'zgarmagan — faqat online ping yuboramiz
          await _pingOnlineStatus();
          return;
        }
      }

      try {
        final response = await http.patch(
          Uri.parse(_endpointForRole()),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $_token',
          },
          body: jsonEncode({
            'lat': position.latitude,
            'lng': position.longitude,
          }),
        ).timeout(const Duration(seconds: 8));

        if (response.statusCode == 200 || response.statusCode == 201) {
          _successCount++;
          _lastBgSentPosition = position;
        } else if (response.statusCode == 401) {
          // Token eskirgan — prefs qayta yuklash
          await _loadPrefs();
          _errorCount++;
        } else {
          _errorCount++;
        }
      } catch (e) {
        _errorCount++;
        await _loadPrefs();
      }
    } catch (e) {
      _errorCount++;
    }
  }
}

// ============================================================
// LOCATION SERVICE — main isolate
// ============================================================

class LocationService {
  final DriverProfileNotifier? _profileNotifier;
  final WebSocketClient _wsClient;
  final Ref _ref;
  bool _isTracking = false;
  Position? _lastPosition;

  LocationService(this._ref, this._profileNotifier, this._wsClient);

  bool get isTracking => _isTracking;
  Position? get lastPosition => _lastPosition;

  static void initForegroundTask() {
    FlutterForegroundTask.init(
      androidNotificationOptions: AndroidNotificationOptions(
        channelId: 'gps_tracking',
        channelName: "YO'LDA fonda ishlamoqda",
        channelDescription:
            "Yangi e'lonlarni qabul qilish va joylashuvni kuzatish",
        channelImportance: NotificationChannelImportance.HIGH,
        priority: NotificationPriority.HIGH,
        enableVibration: false,
        playSound: false,
        showWhen: false,
      ),
      iosNotificationOptions: const IOSNotificationOptions(
        showNotification: true,
        playSound: false,
      ),
      foregroundTaskOptions: ForegroundTaskOptions(
        // Har 10 sekundda GPS yuborish + online ping
        eventAction: ForegroundTaskEventAction.repeat(10000),
        autoRunOnBoot: true,
        autoRunOnMyPackageReplaced: true,
        allowWakeLock: true,
        allowWifiLock: true,
      ),
    );
  }

  /// Android battery optimization'ni o'chirish so'rovi.
  /// Foydalanuvchi roziligini olishi kerak — bu fonda doimiy ishlash uchun zarur.
  Future<bool> requestBatteryOptimizationExemption() async {
    try {
      final isIgnored =
          await FlutterForegroundTask.isIgnoringBatteryOptimizations;
      if (isIgnored) return true;
      // System dialog chiqaradi — foydalanuvchi tasdiqlasa true
      return await FlutterForegroundTask.requestIgnoreBatteryOptimization();
    } catch (_) {
      return false;
    }
  }

  /// Notification permission so'rash (Android 13+ uchun zarur)
  Future<bool> requestNotificationPermission() async {
    try {
      final status =
          await FlutterForegroundTask.checkNotificationPermission();
      if (status == NotificationPermission.granted) return true;
      final result =
          await FlutterForegroundTask.requestNotificationPermission();
      return result == NotificationPermission.granted;
    } catch (_) {
      return false;
    }
  }

  Future<bool> checkPermission() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) return false;
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) return false;
      }
      if (permission == LocationPermission.deniedForever) return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  /// Token + rol + baseUrl + linya holati — SharedPreferences ga saqlash
  /// (background isolate shu ma'lumotlardan foydalanadi)
  Future<void> _savePrefsForBackground() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      const secureStorage = FlutterSecureStorage();
      final token = await secureStorage.read(key: StorageKeys.accessToken);

      // Rolni aniqlash (auth state'dan)
      String role = 'USER';
      bool lineActive = true;
      try {
        final authState = _ref.read(authStateProvider);
        final user = authState.user;
        if (user != null) {
          role = user.role.value;
          lineActive = user.isLineActive;
        }
      } catch (_) {}

      if (token != null) {
        await prefs.setString(_kPrefsToken, token);
        await prefs.setString(_kPrefsBaseUrl, ApiConfig.defaultBaseUrl);
        await prefs.setString(_kPrefsRole, role);
        await prefs.setString(_kPrefsLineActive, lineActive ? '1' : '0');
        FlutterForegroundTask.sendDataToTask({
          'token': token,
          'baseUrl': ApiConfig.defaultBaseUrl,
          'role': role,
          'lineActive': lineActive,
        });
      }
    } catch (_) {}
  }

  /// Linya holati o'zgarganda chaqirish — background task darhol xabardor bo'ladi
  Future<void> updateLineStatus(bool isLineActive) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_kPrefsLineActive, isLineActive ? '1' : '0');
      FlutterForegroundTask.sendDataToTask({'lineActive': isLineActive});
    } catch (_) {}
  }

  Future<bool> startTracking() async {
    if (_isTracking) return true;

    // Notification permission (Android 13+) — silently ask
    await requestNotificationPermission();
    // Battery optimization exemption — fonda doimiy ishlash uchun
    await requestBatteryOptimizationExemption();

    final hasPermission = await checkPermission();
    if (!hasPermission) return false;

    _isTracking = true;

    await _savePrefsForBackground();

    FlutterForegroundTask.addTaskDataCallback(_onBackgroundData);

    await FlutterForegroundTask.startService(
      serviceId: 256,
      notificationTitle: "YO'LDA — Onlayn",
      notificationText: "Yangi e'lonlar va xabarlarni qabul qilmoqda",
      callback: startCallback,
    );

    await _sendLocation();

    return true;
  }

  void _onBackgroundData(Object data) {
    if (data is Map) {
      final lat = data['lat'] as double?;
      final lng = data['lng'] as double?;
      if (lat != null && lng != null) {
        // DRIVER — DriverProfile ga yozish (agar notifier mavjud bo'lsa)
        _profileNotifier?.updateLocation(lat, lng).catchError((_) {});
        try {
          _wsClient.send('driver:locationUpdate', {'lat': lat, 'lng': lng});
        } catch (_) {}
      }
    }
  }

  Future<void> stopTracking() async {
    _isTracking = false;
    FlutterForegroundTask.removeTaskDataCallback(_onBackgroundData);
    await FlutterForegroundTask.stopService();
  }

  /// Rolga qarab API'ga GPS yuborish (main isolate — ilova ochiq bo'lganda)
  /// Dispatcher uchun: faqat joy 500m+ o'zgarganda yangilanadi (bir joyda o'tirgan dispatcherlar uchun)
  /// Driver uchun: har safar yangilanadi (yo'lda yurib boryapti)
  Position? _lastSentPosition;
  static const double _dispatcherMinMoveMeters = 500.0; // 500m

  Future<void> _sendLocation() async {
    try {
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 15),
        ),
      );
      _lastPosition = position;

      // Rolga qarab yuborish
      UserRole? role;
      try {
        role = _ref.read(authStateProvider).user?.role;
      } catch (_) {}

      if (role == UserRole.driver) {
        _profileNotifier
            ?.updateLocation(position.latitude, position.longitude)
            .catchError((_) {});
        _lastSentPosition = position;
      } else {
        // Dispatcher va boshqalar — bir joyda o'tirgan bo'lishi mumkin
        // Faqat joy 500m+ o'zgarganda yangilash
        if (_lastSentPosition != null) {
          final distance = Geolocator.distanceBetween(
            _lastSentPosition!.latitude,
            _lastSentPosition!.longitude,
            position.latitude,
            position.longitude,
          );
          if (distance < _dispatcherMinMoveMeters) {
            return; // Joy o'zgarmagan — yangilash shart emas
          }
        }
        try {
          final api = _ref.read(apiClientProvider);
          await api.patch(
            ApiConfig.userLocation,
            data: {'lat': position.latitude, 'lng': position.longitude},
          );
          _lastSentPosition = position;
        } catch (_) {}
      }

      try {
        _wsClient.send('driver:locationUpdate', {
          'lat': position.latitude,
          'lng': position.longitude,
        });
      } catch (_) {}
    } catch (_) {}
  }

  Future<void> sendNow() async {
    if (await checkPermission()) await _sendLocation();
  }

  void dispose() => stopTracking();
}

final locationServiceProvider = Provider<LocationService>((ref) {
  // DriverProfileNotifier faqat driver app'da kerak — dispatcher uchun null
  DriverProfileNotifier? notifier;
  try {
    notifier = ref.read(driverProfileProvider.notifier);
  } catch (_) {
    notifier = null;
  }
  final wsClient = ref.read(wsClientProvider);
  final service = LocationService(ref, notifier, wsClient);
  ref.onDispose(() => service.dispose());
  return service;
});
