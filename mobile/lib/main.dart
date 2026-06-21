import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import 'app.dart';
import 'core/services/notification_service.dart';
import 'core/services/fcm_service.dart';
import 'core/services/location_service.dart';

final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
    FlutterLocalNotificationsPlugin();

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set preferred orientations
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Set system UI overlay style (initial — updated dynamically by theme)
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  // Initialize notifications
  await NotificationService.initialize(flutterLocalNotificationsPlugin);

  // Initialize FCM (Firebase Cloud Messaging)
  await FcmService.initialize();

  // Initialize foreground GPS task (dispatcher uchun ham — joylashuv yo'naltirish)
  // Driver app'da main_driver.dart o'zi chaqiradi
  LocationService.initForegroundTask();

  runApp(
    const ProviderScope(
      child: ReklamaBotApp(),
    ),
  );
}
