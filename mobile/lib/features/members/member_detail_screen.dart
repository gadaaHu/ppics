import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../config/api_config.dart';
import '../../services/api_client.dart';
import '../auth/auth_provider.dart';

class MemberDetailScreen extends StatefulWidget {
  final String memberId;

  const MemberDetailScreen({
    super.key,
    required this.memberId,
  });

  @override
  State<MemberDetailScreen> createState() => _MemberDetailScreenState();
}

class _MemberDetailScreenState extends State<MemberDetailScreen> {
  bool _isLoading = true;
  String? _error;
  Map<String, dynamic>? _member;

  @override
  void initState() {
    super.initState();
    _fetchMemberDetails();
  }

  Future<void> _fetchMemberDetails() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final response = await ApiClient.get('$kMembersEndpoint/${widget.memberId}');
      if (response['success'] == true) {
        _member = response['data'];
      } else {
        throw Exception(response['message'] ?? 'Failed to load member details');
      }
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _deleteMember() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Member?'),
        content: const Text('This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.errorRed),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      final response = await ApiClient.delete('$kMembersEndpoint/${widget.memberId}');
      if (response['success'] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Member deleted successfully')),
          );
          context.pop(); // Go back to list
        }
      } else {
        throw Exception(response['message']);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: AppTheme.errorRed),
        );
      }
    }
  }

  Future<void> _approveMember() async {
    try {
      final response = await ApiClient.put('$kMembersEndpoint/${widget.memberId}/approve', {});
      if (response['success'] == true) {
        _fetchMemberDetails();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Member approved')),
          );
        }
      } else {
        throw Exception(response['message']);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: AppTheme.errorRed),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final canEdit = auth.isAdmin || auth.isLeader;
    final canDelete = auth.isAdmin;
    final canApprove = auth.isAdmin || auth.isLeader;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Member Profile'),
        actions: [
          if (canEdit && _member != null)
            IconButton(
              icon: const Icon(Icons.edit_outlined),
              onPressed: () {
                context.push('/admin/members/${widget.memberId}/edit').then((_) => _fetchMemberDetails());
              },
            ),
          if (canDelete && _member != null)
            IconButton(
              icon: const Icon(Icons.delete_outline, color: AppTheme.errorRed),
              onPressed: _deleteMember,
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 48, color: AppTheme.errorRed),
                      const SizedBox(height: 16),
                      Text(_error!),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _fetchMemberDetails,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : _buildMemberDetails(canApprove),
    );
  }

  Widget _buildMemberDetails(bool canApprove) {
    if (_member == null) return const SizedBox.shrink();

    final status = _member!['status'] ?? 'pending';
    final role = _member!['role'] ?? 'member';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          // Avatar
          Center(
            child: CircleAvatar(
              radius: 50,
              backgroundColor: AppTheme.roleColor(role),
              backgroundImage: _member!['photo'] != null
                  ? NetworkImage('$kBaseUrl/uploads/members/${_member!['photo']}')
                  : null,
              child: _member!['photo'] == null
                  ? Text(
                      (_member!['full_name'] ?? 'U')[0].toUpperCase(),
                      style: const TextStyle(
                        fontSize: 32,
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    )
                  : null,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            _member!['full_name'] ?? 'Unknown',
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppTheme.lightTextPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.roleColor(role).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Text(
                  AppTheme.roleLabel(role),
                  style: TextStyle(
                    color: AppTheme.roleColor(role),
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: status == 'approved'
                      ? AppTheme.successGreen.withOpacity(0.1)
                      : AppTheme.warningAmber.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Text(
                  status.toString().toUpperCase(),
                  style: TextStyle(
                    color: status == 'approved' ? AppTheme.successGreen : AppTheme.warningAmber,
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          if (status != 'approved' && canApprove) ...[
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _approveMember,
                icon: const Icon(Icons.check_circle_outline),
                label: const Text('Approve Member'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.successGreen,
                ),
              ),
            ),
            const SizedBox(height: 24),
          ],
          
          // Info Cards
          _buildInfoCard(
            title: 'Personal Information',
            children: [
              _buildInfoRow('Email', _member!['email'] ?? 'Not provided', Icons.email_outlined),
              _buildInfoRow('Phone', _member!['phone'] ?? 'Not provided', Icons.phone_outlined),
              _buildInfoRow('Gender', _member!['gender'] ?? 'Not specified', Icons.person_outline),
              _buildInfoRow('Address', _member!['address'] ?? 'Not specified', Icons.location_on_outlined),
            ],
          ),
          const SizedBox(height: 16),
          _buildInfoCard(
            title: 'Membership Details',
            children: [
              _buildInfoRow('District', _member!['district_name'] ?? 'Not assigned', Icons.map_outlined),
              _buildInfoRow('Cooperative', _member!['cooperative_name'] ?? 'Not assigned', Icons.group_work_outlined),
              _buildInfoRow('Family', _member!['family_name'] ?? 'Not assigned', Icons.family_restroom_outlined),
              _buildInfoRow('Position', _member!['position_name'] ?? 'Member', Icons.badge_outlined),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard({required String title, required List<Widget> children}) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AppTheme.lightBorder),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppTheme.lightTextPrimary,
              ),
            ),
            const SizedBox(height: 16),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppTheme.lightTextMuted),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppTheme.lightTextMuted,
                  ),
                ),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: AppTheme.lightTextPrimary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
