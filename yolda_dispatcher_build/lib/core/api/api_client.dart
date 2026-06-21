import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../config/api_config.dart';

class ApiClient {
  late Dio _dio;
  String? _token;

  ApiClient() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConfig.baseUrl,
      connectTimeout: ApiConfig.connectTimeout,
      receiveTimeout: ApiConfig.receiveTimeout,
      contentType: 'application/json',
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        if (_token == null) {
          final prefs = await SharedPreferences.getInstance();
          _token = prefs.getString('yolda_token');
        }
        if (_token != null && _token!.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $_token';
        }
        handler.next(options);
      },
    ));
  }

  Future<void> setToken(String? token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    if (token != null) {
      await prefs.setString('yolda_token', token);
    } else {
      await prefs.remove('yolda_token');
    }
  }

  String? get token => _token;
  Dio get dio => _dio;
}
