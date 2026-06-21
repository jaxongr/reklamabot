import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import 'app.dart';
import 'app_config.dart';
import 'core/services/notification_service.dart';
import 'core/services/fcm_service.dart';
import 'core/services/location_service.dart';

final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
    FlutterLocalNotificationsPlugin();

Future<void> main() async {
  // DRIVER mode
  appMode = AppMode.driver;

  WidgetsFlutterBinding.ensureInitialized();
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );
  await NotificationService.initialize(flutterLocalNotificationsPlugin);
  await FcmService.initialize();
  LocationService.initForegroundTask();

  runApp(
    const ProviderScope(
      child: ReklamaBotApp(),
    ),
  );
}
