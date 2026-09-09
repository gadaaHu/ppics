import 'package:dio/dio.dart';
import '../config/api_config.dart';
import 'storage_service.dart';

class ApiClient {
  static Dio? _dio;

  static Dio get instance {
    _dio ??= _createDio();
    return _dio!;
  }

  static Dio _createDio() {
    final dio = Dio(BaseOptions(
      baseUrl: kApiUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      sendTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    // ── Request Interceptor: inject token ──────────────────────────────────
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await StorageService.getToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            // Token expired – clear stored session
            await StorageService.clearAll();
            // Let the error propagate – the router guard will redirect to login
          }
          return handler.next(error);
        },
      ),
    );

    // ── Logging (debug only) ──────────────────────────────────────────────
    dio.interceptors.add(LogInterceptor(
      requestHeader: false,
      requestBody: true,
      responseBody: true,
      error: true,
    ));

    return dio;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  static Future<Map<String, dynamic>> get(String path,
      {Map<String, dynamic>? queryParams}) async {
    final response = await instance.get(path, queryParameters: queryParams);
    return response.data as Map<String, dynamic>;
  }

  static Future<Map<String, dynamic>> post(String path,
      {dynamic data}) async {
    final response = await instance.post(path, data: data);
    return response.data as Map<String, dynamic>;
  }

  static Future<Map<String, dynamic>> put(String path,
      {dynamic data}) async {
    final response = await instance.put(path, data: data);
    return response.data as Map<String, dynamic>;
  }

  static Future<Map<String, dynamic>> patch(String path,
      {dynamic data}) async {
    final response = await instance.patch(path, data: data);
    return response.data as Map<String, dynamic>;
  }

  static Future<Map<String, dynamic>> delete(String path) async {
    final response = await instance.delete(path);
    return response.data as Map<String, dynamic>;
  }

  static Future<Map<String, dynamic>> postFormData(
      String path, FormData formData) async {
    final response = await instance.post(
      path,
      data: formData,
      options: Options(contentType: 'multipart/form-data'),
    );
    return response.data as Map<String, dynamic>;
  }
}
