import 'dart:async';
import 'dart:developer' as developer;

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

/// Background message handler — top-level function (required by FCM)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  developer.log('FCM background message: ${message.messageId}');
}

/// Firebase Cloud Messaging service.
/// App yopiq/background bo'lganda push notification qabul qiladi.
class FcmService {
  FcmService._();

  static FirebaseMessaging? _messaging;
  static String? _currentToken;
  static bool _initialized = false;
  static FlutterLocalNotificationsPlugin? _localNotifications;

  /// FCM token (backend'ga yuborish uchun)
  static String? get currentToken => _currentToken;

  /// FCM token stream (token o'zgarganda)
  static final _tokenController = StreamController<String?>.broadcast();
  static Stream<String?> get tokenStream => _tokenController.stream;

  /// Notification tap data (route navigation uchun)
  static RemoteMessage? _pendingNavigation;
  static RemoteMessage? get pendingNavigation => _pendingNavigation;
  static void clearPendingNavigation() => _pendingNavigation = null;

  /// Tap navigation callback (router orqali yo'naltirish uchun).
  /// `app.dart` ichida o'rnatiladi.
  static void Function(RemoteMessage message)? onNotificationTap;

  /// Pending navigation'ni qayta ishlash (router tayyor bo'lganda chaqir).
  static void consumePendingNavigation() {
    final pending = _pendingNavigation;
    if (pending != null && onNotificationTap != null) {
      onNotificationTap!(pending);
      _pendingNavigation = null;
    }
  }

  /// Initialize Firebase + FCM.
  /// Google Play Services yo'q bo'lsa yoki Firebase sozlanmagan bo'lsa — graceful fallback.
  static Future<void> initialize() async {
    if (_initialized) return;

    try {
      developer.log('FCM: Firebase.initializeApp() boshlanmoqda...');
      await Firebase.initializeApp();
      developer.log('FCM: Firebase.initializeApp() muvaffaqiyatli!');
    } catch (e, stack) {
      developer.log('FCM: Firebase init XATO: $e\n$stack');
      return;
    }

    try {
      _messaging = FirebaseMessaging.instance;
      developer.log('FCM: FirebaseMessaging instance olindi');

      // Notification permission so'rash
      final settings = await _messaging!.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );
      developer.log('FCM: Permission status: ${settings.authorizationStatus}');

      if (settings.authorizationStatus == AuthorizationStatus.denied) {
        developer.log('FCM: Foydalanuvchi notification ruxsatini rad etdi');
        // Rad etilsa ham davom etamiz — token olishga urinamiz
      }

      // Background handler
      FirebaseMessaging.onBackgroundMessage(
        _firebaseMessagingBackgroundHandler,
      );

      // Auto-delivery yoqish (fonda ham ishlashi uchun)
      await _messaging!.setAutoInitEnabled(true);
      await _messaging!.setForegroundNotificationPresentationOptions(
        alert: true,
        badge: true,
        sound: true,
      );

      // Token olish (retry bilan)
      developer.log('FCM: Token olish boshlandi...');
      try {
        _currentToken = await _messaging!.getToken();
        developer.log('FCM: 1-urinish token: $_currentToken');
      } catch (e) {
        developer.log('FCM: 1-urinish XATO: $e');
      }

      if (_currentToken == null) {
        await Future.delayed(const Duration(seconds: 3));
        try {
          _currentToken = await _messaging!.getToken();
          developer.log('FCM: 2-urinish token: $_currentToken');
        } catch (e) {
          developer.log('FCM: 2-urinish XATO: $e');
        }
      }

      if (_currentToken == null) {
        await Future.delayed(const Duration(seconds: 5));
        try {
          _currentToken = await _messaging!.getToken();
          developer.log('FCM: 3-urinish token: $_currentToken');
        } catch (e) {
          developer.log('FCM: 3-urinish XATO: $e');
        }
      }

      developer.log('FCM: FINAL token: ${_currentToken != null ? "${_currentToken!.substring(0, 20)}..." : "NULL!"}');
      _tokenController.add(_currentToken);

      // Token refresh
      _messaging!.onTokenRefresh.listen((newToken) {
        _currentToken = newToken;
        _tokenController.add(newToken);
        developer.log('FCM token yangilandi: $newToken');
      });

      // Local notifications plugin ni initialize qilish
      _localNotifications = FlutterLocalNotificationsPlugin();
      await _localNotifications!.initialize(
        const InitializationSettings(
          android: AndroidInitializationSettings('@mipmap/ic_launcher'),
        ),
      );
      // Android notification channel yaratish
      await _localNotifications!
          .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
          ?.createNotificationChannel(const AndroidNotificationChannel(
            'fcm_push',
            'Push bildirishnomalar',
            description: 'Firebase push bildirishnomalar',
            importance: Importance.high,
          ));

      // Foreground messages — local notification ko'rsatish
      FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

      // App background'dan ochilganda (notification tap)
      FirebaseMessaging.onMessageOpenedApp.listen(_handleMessageOpenedApp);

      // App yopiq edi, notification tap orqali ochildi
      final initialMessage = await _messaging!.getInitialMessage();
      if (initialMessage != null) {
        _pendingNavigation = initialMessage;
      }

      _initialized = true;
      developer.log('FCM muvaffaqiyatli ishga tushirildi');
    } catch (e) {
      developer.log('FCM init xatosi (skip): $e');
    }
  }

  /// Foreground'da kelgan xabarni local notification orqali ko'rsatish
  static void _handleForegroundMessage(RemoteMessage message) {
    developer.log('FCM foreground message: ${message.messageId}');

    final notification = message.notification;
    if (notification == null) return;

    // Initialize qilingan plugindan foydalanish
    _localNotifications?.show(
      message.hashCode,
      notification.title ?? '',
      notification.body ?? '',
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'fcm_push',
          'Push bildirishnomalar',
          channelDescription: 'Firebase push bildirishnomalar',
          importance: Importance.high,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
        ),
      ),
    );
  }

  /// Notification tap — app background'dan ochilganda
  static void _handleMessageOpenedApp(RemoteMessage message) {
    developer.log('FCM message opened app: ${message.data}');
    if (onNotificationTap != null) {
      onNotificationTap!(message);
    } else {
      _pendingNavigation = message;
    }
  }

  /// FCM tokenni tozalash (logout'da)
  static Future<void> deleteToken() async {
    try {
      await _messaging?.deleteToken();
      _currentToken = null;
      _tokenController.add(null);
    } catch (e) {
      developer.log('FCM deleteToken xatosi: $e');
    }
  }
}
