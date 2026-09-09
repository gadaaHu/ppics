import '../config/api_config.dart';
import 'api_client.dart';
import 'storage_service.dart';

class AuthService {
  /// Login – returns the user map on success, throws on failure
  static Future<Map<String, dynamic>> login(String username, String password) async {
    final response = await ApiClient.post(
      kLoginEndpoint,
      data: {'username': username, 'password': password},
    );

    if (response['success'] == true) {
      final token = response['token'] as String;
      final user = response['user'] as Map<String, dynamic>;
      final stats = response['stats'];

      // Persist credentials
      await StorageService.setToken(token);
      await StorageService.setRole(user['role'] ?? 'member');
      await StorageService.setUserId(user['user_id']?.toString() ?? '');
      await StorageService.setUserName(user['username'] ?? '');
      await StorageService.setUserFullName(user['full_name'] ?? '');
      final isMember = user['is_member'] == true || user['role'] == 'member';
      await StorageService.setIsMember(isMember);

      return {
        'user': {
          ...user,
          'is_member': isMember,
          'stats': stats,
        },
        'token': token,
      };
    } else {
      throw Exception(response['message'] ?? 'Login failed');
    }
  }

  /// Logout – clears session
  static Future<void> logout() async {
    try {
      await ApiClient.post(kLogoutEndpoint);
    } catch (_) {
      // Ignore errors on logout
    } finally {
      await StorageService.clearAll();
    }
  }

  /// Get current user profile
  static Future<Map<String, dynamic>> getProfile() async {
    final response = await ApiClient.get(kProfileEndpoint);
    if (response['success'] == true) {
      return response['data'] as Map<String, dynamic>;
    }
    throw Exception(response['message'] ?? 'Failed to load profile');
  }

  /// Check if there is a valid stored session
  static Future<bool> hasSession() async {
    final token = await StorageService.getToken();
    return token != null && token.isNotEmpty;
  }
}
