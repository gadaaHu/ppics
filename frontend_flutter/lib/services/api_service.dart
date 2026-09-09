import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:8000';

  final Dio _dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 15),
    headers: {'Content-Type': 'application/json'},
  ));

  final _storage = const FlutterSecureStorage();

  ApiService() {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: 'auth_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) {
        return handler.next(error);
      },
    ));
  }

  // Auth
  Future<Response> login(String username, String password) =>
      _dio.post('/api/auth/login', data: {'username': username, 'password': password});
  
  Future<Response> register(Map<String, dynamic> data) =>
      _dio.post('/api/auth/register', data: data);

  Future<Response> getProfile() => _dio.get('/api/auth/profile');
  Future<Response> updateProfile(Map<String, dynamic> data) => _dio.put('/api/auth/profile', data: data);
  
  Future<Response> changeUserPassword(String currentPassword, String newPassword) =>
      _dio.put('/api/auth/change-password/user', data: {'currentPassword': currentPassword, 'newPassword': newPassword});
      
  Future<Response> changeMemberPassword(String currentPassword, String newPassword) =>
      _dio.put('/api/auth/change-password/member', data: {'currentPassword': currentPassword, 'newPassword': newPassword});
      
  Future<Response> resetMemberPassword(int memberId) =>
      _dio.put('/api/auth/reset-password/$memberId');
      
  Future<Response> getMembersList() => _dio.get('/api/auth/members-list');
  
  // Member Profile
  Future<Response> getMemberProfile() => _dio.get('/api/member/profile/');
  Future<Response> getMemberStats() => _dio.get('/api/member/profile/stats');
  Future<Response> uploadMemberPhoto(FormData data) => _dio.post('/api/member/profile/photo', data: data);

  // Members
  Future<Response> getMembers({String? search, int? districtId, int? cooperativeId}) =>
      _dio.get('/api/members', queryParameters: {
        if (search != null) 'search': search,
        if (districtId != null) 'district_id': districtId,
        if (cooperativeId != null) 'cooperative_id': cooperativeId,
      });

  Future<Response> getMemberById(int id) => _dio.get('/api/members/$id');
  Future<Response> createMember(Map<String, dynamic> data) => _dio.post('/api/members', data: FormData.fromMap(data));
  Future<Response> deleteMember(int id) => _dio.delete('/api/members/$id');
  Future<Response> approveMember(int id) => _dio.put('/api/members/$id/approve');
  Future<Response> getDropdownData() => _dio.get('/api/members/dropdown');

  // News
  Future<Response> getNews({String? search, int page = 1, int limit = 10}) =>
      _dio.get('/api/news', queryParameters: {
        if (search != null) 'search': search,
        'page': page, 'limit': limit,
      });

  Future<Response> createNews(Map<String, dynamic> data) => _dio.post('/api/news', data: FormData.fromMap(data));

  Future<Response> getLatestNews({int limit = 6}) =>
      _dio.get('/api/news/latest', queryParameters: {'limit': limit});

  Future<Response> getNewsById(int id) => _dio.get('/api/news/$id');
  Future<Response> updateNews(int id, Map<String, dynamic> data) => _dio.put('/api/news/$id', data: FormData.fromMap(data));
  Future<Response> deleteNews(int id) => _dio.delete('/api/news/$id');

  // Gallery
  Future<Response> getGallery({String? search, String? date}) =>
      _dio.get('/api/gallery', queryParameters: {
        if (search != null) 'search': search,
        if (date != null) 'date': date,
      });

  Future<Response> getGalleryById(int id) => _dio.get('/api/gallery/$id');
  Future<Response> uploadGallery(FormData data) => _dio.post('/api/gallery/upload', data: data);
  Future<Response> updateGallery(int id, FormData data) => _dio.put('/api/gallery/$id', data: data);
  Future<Response> deleteGallery(int id) => _dio.delete('/api/gallery/$id');
  Future<Response> deleteGalleryByDate(String date) =>
      _dio.delete('/api/gallery/by-date/$date');

  // Payments
  Future<Response> getPayments() => _dio.get('/api/payments');
  Future<Response> getMyPayments() => _dio.get('/api/payments/my-payments');
  Future<Response> createPayment(Map<String, dynamic> data) =>
      _dio.post('/api/payments', data: data);
  Future<Response> approvePayment(int id) => _dio.put('/api/payments/$id/approve');
  Future<Response> deletePayment(int id) => _dio.delete('/api/payments/$id');

  // Evaluations
  Future<Response> getEvaluations() => _dio.get('/api/evaluations');
  Future<Response> getMemberEvaluations(int memberId) =>
      _dio.get('/api/evaluations/member/$memberId');
  Future<Response> createEvaluation(Map<String, dynamic> data) =>
      _dio.post('/api/evaluations', data: data);
  Future<Response> updateEvaluation(int id, Map<String, dynamic> data) =>
      _dio.put('/api/evaluations/$id', data: data);
  Future<Response> approveEvaluation(int id) => _dio.put('/api/evaluations/$id/approve');
  Future<Response> deleteEvaluation(int id) => _dio.delete('/api/evaluations/$id');

  // Settings
  Future<Response> getSettings() => _dio.get('/api/settings');
  Future<Response> updateSettings(Map<String, dynamic> data) =>
      _dio.put('/api/settings', data: data);

  // Users
  Future<Response> getUsers() => _dio.get('/api/users');
  Future<Response> createUser(Map<String, dynamic> data) => _dio.post('/api/users', data: FormData.fromMap(data));
  Future<Response> updateUser(int id, Map<String, dynamic> data) => _dio.put('/api/users/$id', data: FormData.fromMap(data));
  Future<Response> deleteUser(int id) => _dio.delete('/api/users/$id');
  Future<Response> adminResetPassword(int userId, String newPassword) =>
      _dio.put('/api/auth/reset-password/$userId', data: {'newPassword': newPassword});

  // Hierarchy & Organization
  Future<Response> getHierarchy() => _dio.get('/api/hierarchy');
  Future<Response> getDistricts() => _dio.get('/api/districts');
  Future<Response> getCooperatives() => _dio.get('/api/cooperatives');
  Future<Response> getFamilies() => _dio.get('/api/families');
  Future<Response> getPositions() => _dio.get('/api/positions');

  // Events & Attendance
  Future<Response> getEvents() => _dio.get('/api/events');
  Future<Response> createEvent(Map<String, dynamic> data) => _dio.post('/api/events', data: FormData.fromMap(data));
  Future<Response> deleteEvent(int id) => _dio.delete('/api/events/$id');
  
  Future<Response> getAttendance() => _dio.get('/api/attendance');
  Future<Response> recordAttendance(Map<String, dynamic> data) => _dio.post('/api/attendance', data: FormData.fromMap(data));
  Future<Response> getAttendanceStats() => _dio.get('/api/attendance/stats');
  Future<Response> getAttendanceByEvent(int eventId) => _dio.get('/api/attendance/event/$eventId');
  Future<Response> getAttendanceByMember(int memberId) => _dio.get('/api/attendance/member/$memberId');
  Future<Response> scanBarcode(Map<String, dynamic> data) => _dio.post('/api/attendance/scan', data: data);
  
  // Face Recognition Attendance
  Future<Response> trainFace(int memberId, MultipartFile image) => 
      _dio.post('/api/attendance/train-face', data: FormData.fromMap({
        'member_id': memberId,
        'image': image
      }));
      
  Future<Response> recognizeFace(int eventId, MultipartFile frame) => 
      _dio.post('/api/attendance/recognize', data: FormData.fromMap({
        'event_id': eventId,
        'frame': frame
      }));

  // Documents & Plans
  Future<Response> getDocumentTypes() => _dio.get('/api/documents/types');
  Future<Response> getDocumentStats() => _dio.get('/api/documents/stats');
  Future<Response> getFamiliesByCoop(int coopId) => _dio.get('/api/documents/families/$coopId');
  Future<Response> getCooperativeDocuments(int coopId) => _dio.get('/api/documents/cooperative/$coopId');
  Future<Response> getFamilyDocuments(int familyId) => _dio.get('/api/documents/family/$familyId');
  Future<Response> addCooperativeDocument(FormData data) => _dio.post('/api/documents/cooperative', data: data);
  Future<Response> addFamilyDocument(FormData data) => _dio.post('/api/documents/family', data: data);
  Future<Response> deleteCooperativeDocument(int id) => _dio.delete('/api/documents/cooperative/$id');
  Future<Response> deleteFamilyDocument(int id) => _dio.delete('/api/documents/family/$id');

  Future<Response> getPlans() => _dio.get('/api/plans');
  Future<Response> createPlan(Map<String, dynamic> data) => _dio.post('/api/plans', data: FormData.fromMap(data));
  Future<Response> deletePlan(int id) => _dio.delete('/api/plans/$id');

  // Publications & E-Learning
  Future<Response> getPublicationCategories() => _dio.get('/api/publications/categories');
  Future<Response> getPublications() => _dio.get('/api/publications');
  Future<Response> getPublicationById(int id) => _dio.get('/api/publications/$id');
  Future<Response> createPublication(Map<String, dynamic> data) => _dio.post('/api/publications', data: FormData.fromMap(data));
  Future<Response> updatePublication(int id, FormData data) => _dio.put('/api/publications/$id', data: data);
  Future<Response> deletePublication(int id) => _dio.delete('/api/publications/$id');

  Future<Response> getELearningCategories() => _dio.get('/api/elearning/categories');
  Future<Response> getELearning() => _dio.get('/api/elearning');
  Future<Response> getELearningById(int id) => _dio.get('/api/elearning/$id');
  Future<Response> createELearning(Map<String, dynamic> data) => _dio.post('/api/elearning', data: FormData.fromMap(data));
  Future<Response> updateELearning(int id, FormData data) => _dio.put('/api/elearning/$id', data: data);
  Future<Response> deleteELearning(int id) => _dio.delete('/api/elearning/$id');
}
