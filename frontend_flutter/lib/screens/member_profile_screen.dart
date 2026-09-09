import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class MemberProfileScreen extends StatefulWidget {
  const MemberProfileScreen({super.key});

  @override
  State<MemberProfileScreen> createState() => _MemberProfileScreenState();
}

class _MemberProfileScreenState extends State<MemberProfileScreen> {
  final _apiService = ApiService();
  bool _isLoading = true;
  bool _isUploadingFace = false;
  Map<String, dynamic>? _profileData;
  String? _errorMessage;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await _apiService.getMemberProfile();
      if (response.data['success']) {
        setState(() {
          _profileData = response.data['data'];
        });
      } else {
        setState(() {
          _errorMessage = response.data['message'];
        });
      }
    } on DioException catch (e) {
      if (e.response?.statusCode == 403) {
        _fetchUserProfile();
      } else {
        setState(() {
          _errorMessage = 'Failed to load profile. Ensure you are logged in.';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  Future<void> _fetchUserProfile() async {
    try {
      final response = await _apiService.getProfile();
      if (response.data['success']) {
        setState(() {
          _profileData = response.data['data'];
        });
      } else {
        setState(() {
          _errorMessage = response.data['message'];
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
      });
    }
  }

  Future<void> _registerFace() async {
    try {
      final XFile? image = await _picker.pickImage(
        source: ImageSource.gallery,
      );
      
      if (image == null) return;

      setState(() => _isUploadingFace = true);

      final multipartFile = await MultipartFile.fromFile(image.path, filename: 'face.jpg');
      final memberId = _profileData?['member_id'];

      final response = await _apiService.trainFace(memberId, multipartFile);
      
      if (mounted) {
        if (response.data['success']) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Face registered successfully!'), backgroundColor: AppTheme.success),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(response.data['message'] ?? 'Failed to register face'), backgroundColor: AppTheme.danger),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        String msg = 'An error occurred.';
        if (e is DioException) {
          msg = e.response?.data?['detail'] ?? e.message;
        }
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $msg'), backgroundColor: AppTheme.danger));
      }
    } finally {
      if (mounted) setState(() => _isUploadingFace = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());

    if (_errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(_errorMessage!, style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: _fetchProfile, child: const Text('Retry'))
          ],
        ),
      );
    }

    final isMember = _profileData?['is_member'] == true || _profileData?['role'] == 'member';
    
    return Scaffold(
      appBar: AppBar(title: const Text('My Profile')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: isMember ? _buildMemberProfile() : _buildUserProfile(),
      ),
    );
  }

  Widget _buildUserProfile() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const CircleAvatar(radius: 50, child: Icon(Icons.person, size: 50)),
        const SizedBox(height: 24),
        _buildInfoTile('Username', _profileData?['username'] ?? ''),
        _buildInfoTile('Full Name', _profileData?['full_name'] ?? ''),
        _buildInfoTile('Role', _profileData?['role'] ?? ''),
        const SizedBox(height: 32),
        ElevatedButton.icon(
          onPressed: _showChangePasswordDialog,
          icon: const Icon(Icons.lock),
          label: const Text('Change Password'),
        )
      ],
    );
  }

  Widget _buildMemberProfile() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Center(
          child: CircleAvatar(
            radius: 60,
            backgroundImage: _profileData?['photo_url'] != null 
                ? NetworkImage('${ApiService.baseUrl}${_profileData!['photo_url']}')
                : null,
            child: _profileData?['photo_url'] == null ? const Icon(Icons.person, size: 60) : null,
          ),
        ),
        const SizedBox(height: 32),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Personal Information', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const Divider(),
                _buildInfoTile('Name', _profileData?['full_name'] ?? 'N/A'),
                _buildInfoTile('Phone', _profileData?['phone'] ?? 'N/A'),
                _buildInfoTile('ID', 'M${_profileData?['member_id'] ?? 'N/A'}'),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Statistics', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const Divider(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildStatCol('Attendance', _profileData?['total_attendance']?.toString() ?? '0'),
                    _buildStatCol('Documents', _profileData?['total_documents']?.toString() ?? '0'),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 32),
        Center(
          child: Wrap(
            spacing: 16,
            runSpacing: 16,
            alignment: WrapAlignment.center,
            children: [
              ElevatedButton.icon(
                onPressed: _showChangePasswordDialog,
                icon: const Icon(Icons.lock),
                label: const Text('Change Password'),
              ),
              ElevatedButton.icon(
                onPressed: _isUploadingFace ? null : _registerFace,
                icon: _isUploadingFace ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.face),
                label: const Text('Register Face (AI)'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.accent,
                  foregroundColor: Colors.white,
                ),
              ),
            ],
          ),
        )
      ],
    );
  }

  Widget _buildStatCol(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.primary)),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(color: Colors.grey)),
      ],
    );
  }

  Widget _buildInfoTile(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(label, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
          ),
          Expanded(child: Text(value, style: const TextStyle(fontSize: 16))),
        ],
      ),
    );
  }

  void _showChangePasswordDialog() {
    final currentPasswordController = TextEditingController();
    final newPasswordController = TextEditingController();
    final isMember = _profileData?['is_member'] == true || _profileData?['role'] == 'member';

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Change Password'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: currentPasswordController, obscureText: true, decoration: const InputDecoration(labelText: 'Current Password')),
            TextField(controller: newPasswordController, obscureText: true, decoration: const InputDecoration(labelText: 'New Password')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              if (currentPasswordController.text.isEmpty || newPasswordController.text.length < 6) return;
              Navigator.pop(ctx);
              try {
                Response response;
                if (isMember) {
                  response = await _apiService.changeMemberPassword(currentPasswordController.text, newPasswordController.text);
                } else {
                  response = await _apiService.changeUserPassword(currentPasswordController.text, newPasswordController.text);
                }
                if (mounted && response.data['success']) {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Password changed successfully')));
                }
              } catch (e) {
                if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
              }
            },
            child: const Text('Save'),
          )
        ],
      ),
    );
  }
}
