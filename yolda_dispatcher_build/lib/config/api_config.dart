class ApiConfig {
  static const String baseUrl = 'http://185.207.251.184:3010/api/v1/yolda-dispatcher';
  static const String wsUrl = 'http://185.207.251.184:3010/yolda-dispatcher';
  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 20);
}
