import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  final _storage = const FlutterSecureStorage();

  Map<String, dynamic>? _currentUser;
  bool _isLoading = false;
  String? _error;

  Map<String, dynamic>? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isLoggedIn => _currentUser != null;
  bool get isAdmin => _currentUser?['role'] == 'admin';
  bool get isMember => _currentUser?['is_member'] == true;

  Future<bool> login(String username, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _api.login(username, password);
      final data = response.data;
      if (data['success'] == true) {
        await _storage.write(key: 'auth_token', value: data['token']);
        _currentUser = data['user'];
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      _error = _parseError(e);
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<void> loadUser() async {
    final token = await _storage.read(key: 'auth_token');
    if (token == null) return;
    try {
      final response = await _api.getProfile();
      if (response.data['success'] == true) {
        _currentUser = response.data['data'];
        notifyListeners();
      }
    } catch (_) {
      await logout();
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'auth_token');
    _currentUser = null;
    notifyListeners();
  }

  String _parseError(dynamic e) {
    if (e is Exception) {
      final str = e.toString();
      if (str.contains('401')) return 'Invalid credentials';
      if (str.contains('403')) return 'Access denied';
      if (str.contains('500')) return 'Server error';
    }
    return 'Something went wrong. Please try again.';
  }
}
