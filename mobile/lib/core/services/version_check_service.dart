import 'package:flutter/material.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../app_config.dart';
import '../../config/theme.dart';
import '../api/api_client.dart';

class AppVersionInfo {
  final int minVersionCode;
  final String latestVersionName;
  final bool forceUpdate;
  final String updateUrl;
  final String message;

  const AppVersionInfo({
    required this.minVersionCode,
    required this.latestVersionName,
    required this.forceUpdate,
    required this.updateUrl,
    required this.message,
  });

  factory AppVersionInfo.fromJson(Map<String, dynamic> json) {
    return AppVersionInfo(
      minVersionCode: (json['minVersionCode'] as num?)?.toInt() ?? 0,
      latestVersionName: json['latestVersionName'] as String? ?? '',
      forceUpdate: json['forceUpdate'] as bool? ?? false,
      updateUrl: json['updateUrl'] as String? ?? '',
      message: json['message'] as String? ?? '',
    );
  }
}

class VersionCheckService {
  static Future<void> checkAndShowDialog(BuildContext context, ApiClient api) async {
    try {
      final response = await api.get('/config/app-version');
      final data = response.data as Map<String, dynamic>;
      final key = isDriverApp ? 'driver' : 'dispatcher';
      final json = data[key] as Map<String, dynamic>?;
      if (json == null) return;
      final remote = AppVersionInfo.fromJson(json);

      final packageInfo = await PackageInfo.fromPlatform();
      final currentCode = int.tryParse(packageInfo.buildNumber) ?? 0;

      if (currentCode < remote.minVersionCode) {
        if (context.mounted) _showUpdateDialog(context, remote, force: remote.forceUpdate);
      }
    } catch (_) {
      // Network error — silently skip
    }
  }

  static void _showUpdateDialog(BuildContext context, AppVersionInfo info, {required bool force}) {
    showDialog<void>(
      context: context,
      barrierDismissible: !force,
      builder: (ctx) {
        return WillPopScope(
          onWillPop: () async => !force,
          child: AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            backgroundColor: AppTheme.cardBgOf(ctx),
            title: Row(
              children: [
                Icon(Icons.system_update, color: AppTheme.primary, size: 28),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    "Yangilanish mavjud",
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      color: AppTheme.textPrimaryOf(ctx),
                    ),
                  ),
                ),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  info.message.isNotEmpty
                      ? info.message
                      : "Yangi versiya (${info.latestVersionName}) mavjud. Iltimos, ilovani yangilang — keyin ishlaydi.",
                  style: TextStyle(
                    fontSize: 14,
                    color: AppTheme.textSecondaryOf(ctx),
                    height: 1.5,
                  ),
                ),
                if (force) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppTheme.errorColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.warning_amber_rounded, color: AppTheme.errorColor, size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            "Eski versiya bilan ishlash to'xtatildi",
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppTheme.errorColor,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
            actions: [
              if (!force)
                TextButton(
                  onPressed: () => Navigator.of(ctx).pop(),
                  child: Text("Keyinroq", style: TextStyle(color: AppTheme.textSecondaryOf(ctx))),
                ),
              ElevatedButton.icon(
                onPressed: () async {
                  if (info.updateUrl.isNotEmpty) {
                    final uri = Uri.parse(info.updateUrl);
                    await launchUrl(uri, mode: LaunchMode.externalApplication);
                  }
                },
                icon: const Icon(Icons.download_rounded, size: 18),
                label: const Text("Yangilash"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
