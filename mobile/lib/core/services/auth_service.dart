import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../config/api_config.dart';
import '../api/api_client.dart';
import '../models/user.dart';

/// Service for authentication operations.
class AuthService {
  final ApiClient _api;
  final FlutterSecureStorage _storage;

  AuthService({required ApiClient api, required FlutterSecureStorage storage})
      : _api = api,
        _storage = storage;

  /// Login with Telegram ID and auth data.
  Future<AuthResult> login({
    required String telegramId,
    required String authData,
    String? role,
  }) async {
    final body = <String, dynamic>{
      'telegramId': telegramId,
      'authData': authData,
    };
    if (role != null) body['role'] = role;

    final response = await _api.post(
      ApiConfig.login,
      data: body,
    );

    final data = response.data as Map<String, dynamic>;
    final accessToken = data['accessToken'] as String;
    final refreshToken = data['refreshToken'] as String;
    final userJson = data['user'] as Map<String, dynamic>;
    final user = User.fromJson(userJson);

    // Persist tokens
    await _storage.write(key: StorageKeys.accessToken, value: accessToken);
    await _storage.write(key: StorageKeys.refreshToken, value: refreshToken);
    await _storage.write(key: StorageKeys.userId, value: user.id);
    await _storage.write(key: StorageKeys.telegramId, value: user.telegramId);

    return AuthResult(user: user, accessToken: accessToken, refreshToken: refreshToken);
  }

  /// Driver login — telefon + parol
  Future<dynamic> driverLoginWithPassword({
    required String phone,
    required String password,
  }) async {
    await _storage.delete(key: StorageKeys.accessToken);
    await _storage.delete(key: StorageKeys.refreshToken);

    final baseUrl = await getBaseUrl();
    final dio = Dio(BaseOptions(
      baseUrl: '$baseUrl${ApiConfig.apiPrefix}',
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 30),
    ));

    final response = await dio.post(
      ApiConfig.driverLoginPassword,
      data: {'phone': phone, 'password': password},
    );

    final data = response.data as Map<String, dynamic>;

    // Parol hali qo'yilmagan
    if (data['needsPassword'] == true) {
      return data;
    }

    final accessToken = data['accessToken'] as String;
    final refreshToken = data['refreshToken'] as String;
    final userJson = data['user'] as Map<String, dynamic>;
    final user = User.fromJson(userJson);

    await _storage.write(key: StorageKeys.accessToken, value: accessToken);
    await _storage.write(key: StorageKeys.refreshToken, value: refreshToken);
    await _storage.write(key: StorageKeys.userId, value: user.id);
    await _storage.write(key: StorageKeys.selectedRole, value: 'DRIVER');

    return AuthResult(user: user, accessToken: accessToken, refreshToken: refreshToken);
  }

  /// Driver parol qo'yish
  Future<bool> driverSetPassword({
    required String phone,
    required String password,
  }) async {
    final baseUrl = await getBaseUrl();
    final dio = Dio(BaseOptions(
      baseUrl: '$baseUrl${ApiConfig.apiPrefix}',
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 30),
    ));
    final response = await dio.post(
      ApiConfig.driverSetPassword,
      data: {'phone': phone, 'password': password},
    );
    return (response.data as Map<String, dynamic>)['success'] == true;
  }

  /// Driver login — telefon + kod (eski usul, backward compatible)
  Future<AuthResult> driverLogin({
    required String phone,
    required String code,
  }) async {
    // Avval eski tokenlarni tozalash (bloklangandan keyin muammo bo'lmasin)
    await _storage.delete(key: StorageKeys.accessToken);
    await _storage.delete(key: StorageKeys.refreshToken);

    // Auth interceptorsiz to'g'ridan Dio bilan yuborish
    final baseUrl = await getBaseUrl();
    final dio = Dio(BaseOptions(
      baseUrl: '$baseUrl${ApiConfig.apiPrefix}',
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 30),
    ));
    final response = await dio.post(
      ApiConfig.driverLogin,
      data: {'phone': phone, 'code': code},
    );

    final data = response.data as Map<String, dynamic>;
    final accessToken = data['accessToken'] as String;
    final refreshToken = data['refreshToken'] as String;
    final userJson = data['user'] as Map<String, dynamic>;
    final user = User.fromJson(userJson);

    await _storage.write(key: StorageKeys.accessToken, value: accessToken);
    await _storage.write(key: StorageKeys.refreshToken, value: refreshToken);
    await _storage.write(key: StorageKeys.userId, value: user.id);
    await _storage.write(key: StorageKeys.selectedRole, value: 'DRIVER');

    return AuthResult(user: user, accessToken: accessToken, refreshToken: refreshToken);
  }

  /// Get current user profile.
  Future<User> getProfile() async {
    final response = await _api.get(ApiConfig.profile);
    final data = response.data as Map<String, dynamic>;
    return User.fromJson(data);
  }

  /// Check if user has a valid stored session.
  Future<bool> isAuthenticated() async {
    final token = await _storage.read(key: StorageKeys.accessToken);
    return token != null && token.isNotEmpty;
  }

  /// Refresh the access token using the stored refresh token.
  Future<bool> refreshToken() async {
    final refresh = await _storage.read(key: StorageKeys.refreshToken);
    if (refresh == null) return false;

    try {
      final response = await _api.post(
        ApiConfig.refreshToken,
        data: {'refreshToken': refresh},
      );

      final data = response.data as Map<String, dynamic>;
      await _storage.write(
        key: StorageKeys.accessToken,
        value: data['accessToken'] as String,
      );
      await _storage.write(
        key: StorageKeys.refreshToken,
        value: data['refreshToken'] as String,
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  /// Logout and clear all stored tokens.
  Future<void> logout() async {
    try {
      await _api.post(ApiConfig.logout);
    } catch (_) {
      // Ignore logout API errors, clear local state anyway
    }
    await _storage.delete(key: StorageKeys.accessToken);
    await _storage.delete(key: StorageKeys.refreshToken);
    await _storage.delete(key: StorageKeys.userId);
    await _storage.delete(key: StorageKeys.telegramId);
  }

  /// Get the stored base URL.
  Future<String> getBaseUrl() async {
    return await _storage.read(key: StorageKeys.baseUrl) ??
        ApiConfig.defaultBaseUrl;
  }

  /// Set a custom base URL.
  Future<void> setBaseUrl(String url) async {
    await _storage.write(key: StorageKeys.baseUrl, value: url);
  }
}

/// Auth result returned after a successful login.
class AuthResult {
  final User user;
  final String accessToken;
  final String refreshToken;

  const AuthResult({
    required this.user,
    required this.accessToken,
    required this.refreshToken,
  });
}

/// Provider for the auth service.
final authServiceProvider = Provider<AuthService>((ref) {
  final api = ref.read(apiClientProvider);
  final storage = ref.read(secureStorageProvider);
  return AuthService(api: api, storage: storage);
});
