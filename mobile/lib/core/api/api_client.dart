import 'dart:async';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:dio/io.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:package_info_plus/package_info_plus.dart';

import '../../config/api_config.dart';

/// Keys used in secure storage for tokens and settings.
class StorageKeys {
  StorageKeys._();
  static const String accessToken = 'access_token';
  static const String refreshToken = 'refresh_token';
  static const String baseUrl = 'base_url';
  static const String userId = 'user_id';
  static const String telegramId = 'telegram_id';
  static const String selectedRole = 'selected_role';
}


/// Global auth failure stream — JwtInterceptor emits, AuthNotifier listens.
/// When refresh token fails, app must redirect to login.
final _authFailureController = StreamController<void>.broadcast();
Stream<void> get authFailureStream => _authFailureController.stream;
/// Secure storage provider (singleton).
final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );
});

/// Dio HTTP client provider with JWT interceptor.
/// Xiaomi/MIUI va boshqa muammoli telefonlar uchun moslashtirilgan
final dioProvider = Provider<Dio>((ref) {
  final storage = ref.read(secureStorageProvider);
  final dio = Dio(BaseOptions(
    baseUrl: '${ApiConfig.defaultBaseUrl}${ApiConfig.apiPrefix}',
    connectTimeout: const Duration(milliseconds: ApiConfig.connectTimeout),
    receiveTimeout: const Duration(milliseconds: ApiConfig.receiveTimeout),
    sendTimeout: const Duration(milliseconds: ApiConfig.connectTimeout),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // User-Agent qo'shamiz (ba'zi MIUI versiyalarda default UA bloklanadi)
      'User-Agent': 'YOLDA-Mobile/1.0 Dart/Dio',
    },
    // HTTP status'ni hech qachon throw qilmaymiz — interceptor o'zi hal qiladi
    validateStatus: (status) => status != null && status < 600,
  ));

  // Custom HttpClient — MIUI/Xiaomi'da SSL muammolarini hal qilish uchun
  (dio.httpClientAdapter as IOHttpClientAdapter).createHttpClient = () {
    final client = HttpClient();
    // SSL sertifikat tekshirishi — agar default trust store ishlamasa,
    // hostname tekshiruvi orqali xavfsiz tarzda ruxsat beramiz
    client.badCertificateCallback = (X509Certificate cert, String host, int port) {
      // Faqat o'z domenimizga ruxsat
      return host == 'logistikapro.uz' || host.endsWith('.logistikapro.uz');
    };
    client.connectionTimeout = const Duration(seconds: 20);
    client.idleTimeout = const Duration(seconds: 60);
    // HTTP/2 ni o'chirish — ba'zi MIUI versiyalarda muammo
    client.autoUncompress = true;
    return client;
  };

  dio.interceptors.add(
    JwtInterceptor(dio: dio, storage: storage),
  );

  return dio;
});

/// Provider for the configured API client.
final apiClientProvider = Provider<ApiClient>((ref) {
  final dio = ref.read(dioProvider);
  final storage = ref.read(secureStorageProvider);
  return ApiClient(dio: dio, storage: storage);
});

/// JWT interceptor that attaches the access token and handles 401 refresh.
/// Uses QueuedInterceptor to prevent race conditions during token refresh.
class JwtInterceptor extends QueuedInterceptor {
  final Dio dio;
  final FlutterSecureStorage storage;
  bool _isRefreshing = false;

  // Bir vaqtning o'zida kelgan 401'lar bitta refresh'ni kutsin (refresh token
  // rotatsiyasi tufayli ikki marta refresh = ikkinchisi xato = keraksiz logout).
  Future<bool>? _refreshFuture;

  // In-memory token cache to avoid slow encrypted storage reads
  String? _cachedToken;

  // App version cache — har requestda X-App-Version yuborish uchun (version tracking)
  static String? _appVersion;
  static String? _appBuild;

  JwtInterceptor({required this.dio, required this.storage});

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // Re-read from storage only when cache is empty (first call or after login)
    if (_cachedToken == null) {
      _cachedToken = await storage.read(key: StorageKeys.accessToken);
    }

    if (_cachedToken != null) {
      options.headers['Authorization'] = 'Bearer $_cachedToken';
    }

    // App versiyasini bir marta o'qib keshlash (PackageInfo plugin o'zi keshlaydi)
    if (_appVersion == null) {
      try {
        final info = await PackageInfo.fromPlatform();
        _appVersion = info.version;
        _appBuild = info.buildNumber;
      } catch (_) {
        // PackageInfo o'qib bo'lmasa — versiyasiz davom etamiz
      }
    }
    if (_appVersion != null) {
      options.headers['X-App-Version'] = _appVersion;
      options.headers['X-App-Build'] = _appBuild;
      options.headers['X-App-Platform'] = Platform.isAndroid ? 'android' : 'ios';
    }

    handler.next(options);
  }

  @override
  void onResponse(
    Response response,
    ResponseInterceptorHandler handler,
  ) async {
    // MUHIM: validateStatus < 600 bo'lgani uchun Dio 401'da xato TASHLAMAYDI,
    // ya'ni onError ishlamaydi. Shuning uchun 401'ni shu yerda ushlaymiz:
    // tokenni yangilab, so'rovni qayta yuboramiz. Aks holda token eskirsa
    // foydalanuvchi "Unauthorized" holatida qotib qoladi.
    final isAuthCall =
        response.requestOptions.path.contains('/auth/refresh') ||
        response.requestOptions.path.contains('/auth/login');
    final alreadyRetried =
        response.requestOptions.extra['__retried401'] == true;

    if (response.statusCode == 401 && !isAuthCall && !alreadyRetried) {
      bool refreshed = false;
      try {
        // Dedup: bir vaqtdagi barcha 401'lar shu bitta refresh'ni kutadi
        _refreshFuture ??= _refreshToken().whenComplete(() {
          _refreshFuture = null;
        });
        refreshed = await _refreshFuture!;
      } catch (_) {
        refreshed = false;
      }

      if (refreshed) {
        try {
          final req = response.requestOptions;
          req.headers['Authorization'] = 'Bearer $_cachedToken';
          req.extra['__retried401'] = true;
          // MUHIM: QueuedInterceptor ichida `dio.fetch()` chaqirsak DEADLOCK
          // bo'ladi (qayta-so'rov navbatda bloklanadi va hech qachon tugamaydi
          // → ilova abadiy aylanadi). Shuning uchun qayta-so'rovni ALOHIDA,
          // interceptorsiz Dio bilan yuboramiz (faqat SSL adapterini ulashamiz).
          final retryDio = Dio()
            ..httpClientAdapter = dio.httpClientAdapter
            ..options.validateStatus = (s) => s != null && s < 600;
          final retry = await retryDio.fetch(req);
          handler.resolve(retry);
          return;
        } catch (_) {
          // Qayta yuborish ham muvaffaqiyatsiz — 401'ni o'tkazib yuboramiz
        }
      } else {
        // Refresh ishlamadi (refresh token ham eskirgan) → logout/login
        _authFailureController.add(null);
      }
    }

    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401 && !_isRefreshing) {
      _isRefreshing = true;
      try {
        final refreshed = await _refreshToken();
        _isRefreshing = false;

        if (refreshed) {
          // Retry the failed request with new token
          err.requestOptions.headers['Authorization'] = 'Bearer $_cachedToken';
          final response = await dio.fetch(err.requestOptions);
          handler.resolve(response);
          return;
        }
      } catch (_) {
        _isRefreshing = false;
      }
    }
    handler.next(err);
  }

  /// Update the cached token (called after login or refresh).
  void updateToken(String? token) {
    _cachedToken = token;
  }

  /// Clear the cached token (called on logout).
  void clearToken() {
    _cachedToken = null;
  }

  Future<bool> _refreshToken() async {
    try {
      final refreshToken = await storage.read(key: StorageKeys.refreshToken);
      if (refreshToken == null) return false;

      final response = await Dio().post(
        '${ApiConfig.defaultBaseUrl}${ApiConfig.apiPrefix}${ApiConfig.refreshToken}',
        data: {'refreshToken': refreshToken},
      );

      if (response.statusCode == 200) {
        final data = response.data;
        final newToken = data['accessToken'] as String;
        await storage.write(key: StorageKeys.accessToken, value: newToken);
        await storage.write(
          key: StorageKeys.refreshToken,
          value: data['refreshToken'] as String,
        );
        // Update cache
        _cachedToken = newToken;
        return true;
      }
      return false;
    } catch (_) {
      // Clear tokens on refresh failure
      await storage.delete(key: StorageKeys.accessToken);
      await storage.delete(key: StorageKeys.refreshToken);
      _cachedToken = null;
      return false;
    }
  }
}

/// High-level API client wrapper around Dio.
class ApiClient {
  final Dio dio;
  final FlutterSecureStorage storage;

  ApiClient({required this.dio, required this.storage});

  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    CancelToken? cancelToken,
  }) {
    return dio.get<T>(
      path,
      queryParameters: queryParameters,
      cancelToken: cancelToken,
    );
  }

  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    CancelToken? cancelToken,
  }) {
    return dio.post<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      cancelToken: cancelToken,
    );
  }

  Future<Response<T>> patch<T>(
    String path, {
    dynamic data,
    CancelToken? cancelToken,
  }) {
    return dio.patch<T>(
      path,
      data: data,
      cancelToken: cancelToken,
    );
  }

  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    CancelToken? cancelToken,
  }) {
    return dio.delete<T>(
      path,
      data: data,
      cancelToken: cancelToken,
    );
  }
}
