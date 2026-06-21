import 'package:permission_handler/permission_handler.dart';

class PermissionsHelper {
  /// Birinchi login'dan keyin barcha kerakli ruxsatlarni ketma-ket so'raydi
  static Future<Map<Permission, PermissionStatus>> requestAll() async {
    final statuses = await [
      Permission.location,
      Permission.locationWhenInUse,
      Permission.locationAlways,
      Permission.phone,
      Permission.microphone,
      Permission.notification,
    ].request();
    return statuses;
  }

  static Future<bool> hasAllCritical() async {
    final loc = await Permission.locationWhenInUse.status;
    final mic = await Permission.microphone.status;
    final phone = await Permission.phone.status;
    return loc.isGranted && mic.isGranted && phone.isGranted;
  }
}
