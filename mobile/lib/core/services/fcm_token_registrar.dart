import 'dart:async';
import 'dart:developer' as developer;

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_client.dart';
import '../../config/api_config.dart';
import '../../features/auth/auth_provider.dart';
import 'fcm_service.dart';

/// FCM tokenni backend'ga yuboruvchi provider.
/// AuthState o'zgarganda va FCM token yangilanganda ishlaydi.
final fcmTokenRegistrarProvider = Provider<FcmTokenRegistrar>((ref) {
  final registrar = FcmTokenRegistrar(ref);
  registrar.start();
  ref.onDispose(() => registrar.dispose());
  return registrar;
});

class FcmTokenRegistrar {
  final Ref _ref;
  StreamSubscription<String?>? _tokenSub;
  bool _isDisposed = false;

  FcmTokenRegistrar(this._ref);

  void start() {
    // Auth state o'zgarganda token yuborish
    _ref.listen<AuthState>(authStateProvider, (prev, next) {
      if (next.isAuthenticated && !_isDisposed) {
        _sendTokenToBackend(FcmService.currentToken);
      }
    });

    // FCM token o'zgarganda ham yuborish
    _tokenSub = FcmService.tokenStream.listen((token) {
      final authState = _ref.read(authStateProvider);
      if (authState.isAuthenticated && !_isDisposed) {
        _sendTokenToBackend(token);
      }
    });

    // Boshlang'ich token — agar allaqachon auth bo'lsa
    final authState = _ref.read(authStateProvider);
    if (authState.isAuthenticated) {
      if (FcmService.currentToken != null) {
        _sendTokenToBackend(FcmService.currentToken);
      } else {
        // Token hali tayyor emas — 5 soniyadan keyin qayta urinish
        Future.delayed(const Duration(seconds: 5), () {
          if (!_isDisposed && FcmService.currentToken != null) {
            _sendTokenToBackend(FcmService.currentToken);
          }
        });
      }
    }
  }

  Future<void> _sendTokenToBackend(String? token) async {
    if (token == null || _isDisposed) return;

    try {
      final apiClient = _ref.read(apiClientProvider);
      await apiClient.patch(
        ApiConfig.fcmToken,
        data: {'token': token},
      );
      developer.log('FCM token backend\'ga yuborildi');
    } catch (e) {
      developer.log('FCM token yuborishda xatolik: $e');
    }
  }

  void dispose() {
    _isDisposed = true;
    _tokenSub?.cancel();
  }
}
