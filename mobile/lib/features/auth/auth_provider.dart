import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../config/api_config.dart';
import '../../core/api/api_client.dart';
import '../../core/models/user.dart';
import '../../core/services/auth_service.dart';

/// Authentication state.
class AuthState {
  final User? user;
  final bool isAuthenticated;
  final bool isLoading;
  final String? error;

  const AuthState({
    this.user,
    this.isAuthenticated = false,
    this.isLoading = false,
    this.error,
  });

  AuthState copyWith({
    User? user,
    bool? isAuthenticated,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      user: user ?? this.user,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Auth state notifier.
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;
  final FlutterSecureStorage _storage;
  final ApiClient _apiClient;
  StreamSubscription<void>? _authFailureSub;

  AuthNotifier(this._authService, this._storage, this._apiClient) : super(const AuthState()) {
    _checkAuth();
    // Auth failure (refresh token expired) → auto logout
    _authFailureSub = authFailureStream.listen((_) {
      logout();
    });
  }

  @override
  void dispose() {
    _authFailureSub?.cancel();
    super.dispose();
  }

  /// Check if user is already authenticated from stored tokens.
  Future<void> _checkAuth() async {
    state = state.copyWith(isLoading: true);
    try {
      final isAuth = await _authService.isAuthenticated();
      if (isAuth) {
        try {
          final user = await _authService.getProfile();
          state = AuthState(
            user: user,
            isAuthenticated: true,
            isLoading: false,
          );
        } catch (_) {
          // Token might be expired, try refresh
          final refreshed = await _authService.refreshToken();
          if (refreshed) {
            final user = await _authService.getProfile();
            state = AuthState(
              user: user,
              isAuthenticated: true,
              isLoading: false,
            );
          } else {
            state = const AuthState(isLoading: false);
          }
        }
      } else {
        state = const AuthState(isLoading: false);
      }
    } catch (_) {
      state = const AuthState(isLoading: false);
    }
  }

  /// Login with Telegram ID and auth data.
  Future<void> login({
    required String telegramId,
    required String authData,
    String? role,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final result = await _authService.login(
        telegramId: telegramId,
        authData: authData,
        role: role,
      );

      // Save selected role
      if (role != null) {
        await _storage.write(key: 'selected_role', value: role);
      }

      state = AuthState(
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _parseError(e),
      );
    }
  }

  /// Driver login — telefon + kod
  Future<void> driverLogin({
    required String phone,
    required String code,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final result = await _authService.driverLogin(
        phone: phone,
        code: code,
      );
      await _storage.write(key: 'selected_role', value: 'DRIVER');
      state = AuthState(
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _parseDriverError(e),
      );
    }
  }

  /// Telefon + parol bilan kirish
  Future<dynamic> driverLoginWithPassword({
    required String phone,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final result = await _authService.driverLoginWithPassword(
        phone: phone,
        password: password,
      );

      // Parol yaratish kerak
      if (result is Map && result['needsPassword'] == true) {
        state = state.copyWith(isLoading: false);
        return result;
      }

      final authResult = result as AuthResult;
      await _storage.write(key: 'selected_role', value: 'DRIVER');
      state = AuthState(
        user: authResult.user,
        isAuthenticated: true,
        isLoading: false,
      );
      return null;
    } on DioException catch (e) {
      String msg = 'Xatolik yuz berdi';
      if (e.response?.data is Map) {
        msg = (e.response!.data as Map)['message'] as String? ?? msg;
      }
      state = state.copyWith(isLoading: false, error: msg);
      return null;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _parseDriverError(e),
      );
      return null;
    }
  }

  String _parseDriverError(dynamic error) {
    final msg = error.toString();
    if (msg.contains('SocketException') || msg.contains('Connection refused')) {
      return 'Serverga ulanib bo\'lmadi. Internetni tekshiring.';
    }
    if (msg.contains('tasdiqlanmagan')) {
      return 'Akkauntingiz hali tasdiqlanmagan. Admin tasdiqlashini kuting.';
    }
    if (msg.contains('topilmadi')) {
      return 'Bu raqam bilan haydovchi topilmadi. Avval ro\'yxatdan o\'ting.';
    }
    if (msg.contains('noto\'g\'ri') || msg.contains('eskirgan')) {
      return 'Kod noto\'g\'ri yoki eskirgan. Yangi kod oling.';
    }
    if (msg.contains('bloklangan')) {
      return 'Akkauntingiz bloklangan.';
    }
    if (msg.contains('401') || msg.contains('Unauthorized')) {
      return 'Kod noto\'g\'ri yoki eskirgan.';
    }
    return 'Xatolik yuz berdi. Qayta urinib ko\'ring.';
  }

  /// Get saved selected role.
  Future<String?> getSelectedRole() async {
    return _storage.read(key: 'selected_role');
  }

  /// Linya holatini o'zgartirish
  Future<void> setLineStatus(bool isLineActive) async {
    try {
      await _apiClient.patch(
        ApiConfig.userLineStatus,
        data: {'isLineActive': isLineActive},
      );
      // Lokal state yangilash
      if (state.user != null) {
        state = state.copyWith(
          user: state.user!.copyWith(isLineActive: isLineActive),
        );
      }
    } catch (_) {
      // Xatolik bo'lsa asl holatni tiklash
    }
  }

  /// Profil yangilanganida state yangilash
  void refreshUser(User updatedUser) {
    state = state.copyWith(user: updatedUser);
  }

  /// Eski xato xabarini tozalash (login ekrani ochilganda)
  void clearError() {
    if (state.error != null) {
      state = state.copyWith(error: null);
    }
  }

  /// Logout and clear all state.
  Future<void> logout() async {
    await _authService.logout();
    state = const AuthState();
  }

  /// Update the backend API base URL.
  Future<void> setBaseUrl(String url) async {
    await _authService.setBaseUrl(url);
  }

  /// Get the current base URL.
  Future<String> getBaseUrl() async {
    return _authService.getBaseUrl();
  }

  String _parseError(dynamic error) {
    // Diagnostika: debug uchun batafsil chiqarish
    debugPrint('[AUTH ERROR] $error');
    if (error is DioException) {
      debugPrint('[AUTH] DioException type=${error.type} message=${error.message} responseStatus=${error.response?.statusCode}');
      debugPrint('[AUTH] error.error=${error.error}');
    }
    // Dio v5 — error tipi orqali aniq xato xabari
    if (error is DioException) {
      // Backend'dan kelgan aniq xato xabari (eng aniq)
      final responseData = error.response?.data;
      if (responseData is Map && responseData['message'] is String) {
        final backendMsg = responseData['message'] as String;
        // Backend specific xabarlarni o'tkazib yuborish
        if (backendMsg.contains('Kod topilmadi') || backendMsg.contains('eskirgan')) {
          return 'Login kod noto\'g\'ri yoki eskirgan. Botdan /app bosib yangi kod oling.';
        }
        if (backendMsg.contains('topilmadi')) {
          return 'Foydalanuvchi topilmadi. Telegram ID ni tekshiring.';
        }
        return backendMsg;
      }

      // Dio xato tipiga qarab
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.sendTimeout:
        case DioExceptionType.receiveTimeout:
          return 'Server javob bermayapti. Internet tezligini tekshirib qayta urining.';
        case DioExceptionType.badCertificate:
          return 'SSL sertifikat xatoligi. Telefoningiz vaqtini to\'g\'rilab qayta urining.';
        case DioExceptionType.badResponse:
          final code = error.response?.statusCode ?? 0;
          if (code == 401) return 'Login kod noto\'g\'ri yoki eskirgan.';
          if (code == 403) return 'Ruxsat berilmagan.';
          if (code == 404) return 'Foydalanuvchi topilmadi.';
          if (code == 429) return 'Juda ko\'p urinish. Bir necha daqiqa kuting.';
          if (code >= 500) return 'Server xatosi ($code). Qayta urinib ko\'ring.';
          return 'Server xatosi: $code';
        case DioExceptionType.cancel:
          return 'So\'rov bekor qilindi.';
        case DioExceptionType.connectionError:
          return 'Internet aloqangiz uzilgan yoki sustlashgan. Wi-Fi/3G/4G ulanishingizni tekshiring.';
        case DioExceptionType.unknown:
          // Aniqroq sabab — error.error (asosiy exception)
          final innerErr = error.error?.toString() ?? '';
          if (innerErr.contains('HandshakeException') || innerErr.contains('CERTIFICATE')) {
            return 'SSL sertifikat xatosi. Telefon vaqti to\'g\'rimi yoki "Sana va vaqt" sozlamasida "Avtomatik"ni yoqing.';
          }
          if (innerErr.contains('SocketException') || innerErr.contains('Failed host lookup')) {
            return 'Domen topilmadi. Internet aloqangizni tekshiring yoki DNS ni o\'zgartiring.';
          }
          if (innerErr.contains('FormatException')) {
            return 'Server javobini o\'qib bo\'lmadi. Qaytadan urinib ko\'ring.';
          }
          if (innerErr.isNotEmpty) return 'Xato: $innerErr';
          return 'Ulanish xatosi: ${error.message ?? 'noma\'lum'}. Wi-Fi/Mobil internetni tekshiring.';
      }
    }

    // Boshqa xatoliklar
    final msg = error.toString();
    if (msg.contains('SocketException') || msg.contains('Connection refused') || msg.contains('Connection timed out')) {
      return 'Serverga ulanib bo\'lmadi. Internet aloqangizni tekshiring.';
    }
    if (msg.contains('HandshakeException')) {
      return 'SSL/TLS xato. Telefon vaqti to\'g\'rimi tekshiring.';
    }
    return 'Xatolik yuz berdi: $msg';
  }
}

/// Provider for auth state.
final authStateProvider =
    StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final authService = ref.read(authServiceProvider);
  final storage = ref.read(secureStorageProvider);
  final apiClient = ref.read(apiClientProvider);
  return AuthNotifier(authService, storage, apiClient);
});
