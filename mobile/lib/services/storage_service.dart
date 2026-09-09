import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class StorageService {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
  );

  static const _tokenKey = 'auth_token';
  static const _roleKey = 'user_role';
  static const _userIdKey = 'user_id';
  static const _userNameKey = 'user_name';
  static const _userFullNameKey = 'user_full_name';
  static const _isMemberKey = 'is_member';

  // ── Token ─────────────────────────────────────────────────────────────────
  static Future<void> setToken(String token) =>
      _storage.write(key: _tokenKey, value: token);

  static Future<String?> getToken() => _storage.read(key: _tokenKey);

  static Future<void> deleteToken() => _storage.delete(key: _tokenKey);

  // ── User Role ─────────────────────────────────────────────────────────────
  static Future<void> setRole(String role) =>
      _storage.write(key: _roleKey, value: role);

  static Future<String?> getRole() => _storage.read(key: _roleKey);

  // ── User Info ─────────────────────────────────────────────────────────────
  static Future<void> setUserId(String id) =>
      _storage.write(key: _userIdKey, value: id);

  static Future<String?> getUserId() => _storage.read(key: _userIdKey);

  static Future<void> setUserName(String name) =>
      _storage.write(key: _userNameKey, value: name);

  static Future<String?> getUserName() => _storage.read(key: _userNameKey);

  static Future<void> setUserFullName(String name) =>
      _storage.write(key: _userFullNameKey, value: name);

  static Future<String?> getUserFullName() =>
      _storage.read(key: _userFullNameKey);

  static Future<void> setIsMember(bool isMember) =>
      _storage.write(key: _isMemberKey, value: isMember.toString());

  static Future<bool> getIsMember() async {
    final val = await _storage.read(key: _isMemberKey);
    return val == 'true';
  }

  // ── Clear All ─────────────────────────────────────────────────────────────
  static Future<void> clearAll() => _storage.deleteAll();
}
