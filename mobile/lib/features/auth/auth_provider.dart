import 'package:flutter/foundation.dart';
import '../../services/auth_service.dart';
import '../../services/storage_service.dart';

enum AuthStatus { unknown, authenticated, unauthenticated }

class AuthProvider extends ChangeNotifier {
  AuthStatus _status = AuthStatus.unknown;
  Map<String, dynamic>? _user;
  String? _error;
  bool _loading = false;

  AuthStatus get status => _status;
  Map<String, dynamic>? get user => _user;
  String? get error => _error;
  bool get loading => _loading;

  bool get isAuthenticated => _status == AuthStatus.authenticated;
  String get role => _user?['role'] ?? 'member';
  bool get isAdmin => role == 'admin';
  bool get isLeader => role == 'leader';
  bool get isFamilyLeader => role == 'family_leader';
  bool get isMember => role == 'member' || _user?['is_member'] == true;
  String get fullName => _user?['full_name'] ?? _user?['username'] ?? 'User';
  String? get photoUrl => _user?['photo_url'] ?? _user?['photo'];

  /// Called on app startup to restore session
  Future<void> initialize() async {
    _loading = true;
    notifyListeners();

    try {
      final hasSession = await AuthService.hasSession();
      if (hasSession) {
        final profile = await AuthService.getProfile();
        _user = {
          ...profile,
          'is_member': profile['is_member'] == true || profile['role'] == 'member',
        };
        _status = AuthStatus.authenticated;
      } else {
        _status = AuthStatus.unauthenticated;
      }
    } catch (_) {
      await StorageService.clearAll();
      _status = AuthStatus.unauthenticated;
    }

    _loading = false;
    notifyListeners();
  }

  /// Login with username and password
  Future<bool> login(String username, String password) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await AuthService.login(username, password);
      _user = result['user'] as Map<String, dynamic>;
      _status = AuthStatus.authenticated;
      _loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
      _status = AuthStatus.unauthenticated;
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  /// Logout and clear session
  Future<void> logout() async {
    await AuthService.logout();
    _user = null;
    _status = AuthStatus.unauthenticated;
    notifyListeners();
  }

  /// Update local user data (e.g. after profile edit)
  void updateUser(Map<String, dynamic> updated) {
    _user = {...?_user, ...updated};
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
