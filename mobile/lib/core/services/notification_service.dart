import 'package:flutter_local_notifications/flutter_local_notifications.dart';

/// Service for local notifications (posting progress, new orders, etc.).
class NotificationService {
  NotificationService._();

  static FlutterLocalNotificationsPlugin? _plugin;

  /// Initialize the notification service.
  static Future<void> initialize(
    FlutterLocalNotificationsPlugin plugin,
  ) async {
    _plugin = plugin;

    const androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const initSettings = InitializationSettings(
      android: androidSettings,
    );

    await plugin.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    // Create notification channels
    await _createChannels(plugin);
  }

  static Future<void> _createChannels(
    FlutterLocalNotificationsPlugin plugin,
  ) async {
    final android = plugin.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>();

    if (android != null) {
      await android.createNotificationChannel(
        const AndroidNotificationChannel(
          'posting_progress',
          'Tarqatish jarayoni',
          description: 'Tarqatish jarayoni haqida bildirishnomalar',
          importance: Importance.low,
          showBadge: false,
        ),
      );

      await android.createNotificationChannel(
        const AndroidNotificationChannel(
          'posting_complete',
          'Tarqatish tugadi',
          description: 'Tarqatish tugagani haqida bildirishnomalar',
          importance: Importance.high,
        ),
      );

      await android.createNotificationChannel(
        const AndroidNotificationChannel(
          'orders',
          'Buyurtmalar',
          description: 'Yangi buyurtmalar haqida bildirishnomalar',
          importance: Importance.defaultImportance,
        ),
      );

      await android.createNotificationChannel(
        const AndroidNotificationChannel(
          'general',
          'Umumiy',
          description: 'Umumiy bildirishnomalar',
          importance: Importance.defaultImportance,
        ),
      );

      await android.createNotificationChannel(
        const AndroidNotificationChannel(
          'fcm_push',
          'Push bildirishnomalar',
          description: 'Firebase push bildirishnomalar',
          importance: Importance.high,
        ),
      );
    }
  }

  static void _onNotificationTapped(NotificationResponse response) {
    // Handle notification tap - navigate to appropriate screen
    // This can be extended with a callback or event bus
  }

  /// Show a posting progress notification (ongoing).
  static Future<void> showPostingProgress({
    required int id,
    required String adTitle,
    required int completed,
    required int total,
  }) async {
    if (_plugin == null) return;

    final progress = total > 0 ? (completed / total * 100).round() : 0;

    await _plugin!.show(
      id,
      'Tarqatish jarayonida',
      '$adTitle - $completed/$total guruh ($progress%)',
      NotificationDetails(
        android: AndroidNotificationDetails(
          'posting_progress',
          'Tarqatish jarayoni',
          channelDescription: 'Tarqatish jarayoni haqida bildirishnomalar',
          importance: Importance.low,
          priority: Priority.low,
          ongoing: true,
          autoCancel: false,
          showProgress: true,
          maxProgress: total,
          progress: completed,
          icon: '@mipmap/ic_launcher',
        ),
      ),
    );
  }

  /// Show a posting completed notification.
  static Future<void> showPostingComplete({
    required int id,
    required String adTitle,
    required int totalSent,
    required int totalFailed,
  }) async {
    if (_plugin == null) return;

    // Cancel the progress notification
    await _plugin!.cancel(id);

    await _plugin!.show(
      id + 10000,
      'Tarqatish tugadi',
      '$adTitle - $totalSent ta guruhga yuborildi'
          '${totalFailed > 0 ? ', $totalFailed ta xato' : ''}',
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'posting_complete',
          'Tarqatish tugadi',
          channelDescription: 'Tarqatish tugagani haqida bildirishnomalar',
          importance: Importance.high,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
        ),
      ),
    );
  }

  /// Show a new order notification.
  static Future<void> showNewOrder({
    required int id,
    required String title,
    required String description,
  }) async {
    if (_plugin == null) return;

    await _plugin!.show(
      id + 20000,
      title,
      description,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'orders',
          'Buyurtmalar',
          channelDescription: 'Yangi buyurtmalar haqida bildirishnomalar',
          importance: Importance.defaultImportance,
          priority: Priority.defaultPriority,
          icon: '@mipmap/ic_launcher',
        ),
      ),
    );
  }

  /// Show a general notification.
  static Future<void> showGeneral({
    required int id,
    required String title,
    required String body,
  }) async {
    if (_plugin == null) return;

    await _plugin!.show(
      id + 30000,
      title,
      body,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'general',
          'Umumiy',
          channelDescription: 'Umumiy bildirishnomalar',
          importance: Importance.defaultImportance,
          priority: Priority.defaultPriority,
          icon: '@mipmap/ic_launcher',
        ),
      ),
    );
  }

  /// Cancel a specific notification.
  static Future<void> cancel(int id) async {
    await _plugin?.cancel(id);
  }

  /// Cancel all notifications.
  static Future<void> cancelAll() async {
    await _plugin?.cancelAll();
  }
}
