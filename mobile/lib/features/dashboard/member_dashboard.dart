import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_drawer.dart';
import '../../core/widgets/stat_card.dart';
import '../auth/auth_provider.dart';
import '../../services/api_client.dart';
import '../../config/api_config.dart';

class MemberDashboard extends StatefulWidget {
  const MemberDashboard({super.key});

  @override
  State<MemberDashboard> createState() => _MemberDashboardState();
}

class _MemberDashboardState extends State<MemberDashboard> {
  bool _isLoading = true;
  String? _error;
  Map<String, dynamic>? _stats;

  @override
  void initState() {
    super.initState();
    _fetchDashboardData();
  }

  Future<void> _fetchDashboardData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // In the real app, we might want a specific member dashboard endpoint.
      // For now, we'll try to fetch some basic info from profile or use the stats from auth.
      final auth = context.read<AuthProvider>();
      
      // Attempt to fetch fresh profile
      final profile = await ApiClient.get(kProfileEndpoint);
      if (profile['success'] == true) {
        if (mounted) {
          auth.updateUser(profile['data']);
        }
      }

      // Normally we'd fetch specific dashboard stats here.
      // For the template, we'll build some mock stats based on the user data.
      _stats = {
        'payments_status': 'Up to date',
        'active_plans': 2,
        'upcoming_events': 1,
      };
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

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user ?? {};

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: GestureDetector(
              onTap: () => context.push('/member/profile'),
              child: CircleAvatar(
                radius: 16,
                backgroundColor: AppTheme.primaryBlue,
                backgroundImage: auth.photoUrl != null
                    ? NetworkImage(
                        auth.photoUrl!.startsWith('http')
                            ? auth.photoUrl!
                            : '$kBaseUrl/uploads/members/${auth.photoUrl}')
                    : null,
                child: auth.photoUrl == null
                    ? Text(
                        auth.fullName.isNotEmpty ? auth.fullName[0].toUpperCase() : 'U',
                        style: const TextStyle(
                          fontSize: 14,
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      )
                    : null,
              ),
            ),
          ),
        ],
      ),
      drawer: const AppDrawer(),
      body: RefreshIndicator(
        onRefresh: _fetchDashboardData,
        child: _isLoading
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
                          onPressed: _fetchDashboardData,
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  )
                : SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Welcome Section
                        Text(
                          'Welcome back,',
                          style: TextStyle(
                            fontSize: 16,
                            color: AppTheme.lightTextSecondary,
                          ),
                        ),
                        Text(
                          auth.fullName,
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.lightTextPrimary,
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Stats Grid
                        GridView.count(
                          crossAxisCount: 2,
                          crossAxisSpacing: 16,
                          mainAxisSpacing: 16,
                          childAspectRatio: 0.95,
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          children: [
                            StatCard(
                              title: 'Payments',
                              value: _stats?['payments_status'] ?? '-',
                              icon: Icons.payments_outlined,
                              color: AppTheme.successGreen,
                              subtitle: 'Check history',
                              onTap: () {},
                            ),
                            StatCard(
                              title: 'Family Plans',
                              value: '${_stats?['active_plans'] ?? 0}',
                              icon: Icons.assignment_outlined,
                              color: AppTheme.primaryBlue,
                              subtitle: 'Active plans',
                              onTap: () {}, // context.go('/member/family-plans')
                            ),
                            StatCard(
                              title: 'E-Learning',
                              value: '3',
                              icon: Icons.school_outlined,
                              color: AppTheme.warningAmber,
                              subtitle: 'Courses in progress',
                              onTap: () {}, // context.go('/member/e-learning')
                            ),
                            StatCard(
                              title: 'Events',
                              value: '${_stats?['upcoming_events'] ?? 0}',
                              icon: Icons.event_outlined,
                              color: AppTheme.accentTeal,
                              subtitle: 'Upcoming',
                              onTap: () {},
                            ),
                          ],
                        ),

                        const SizedBox(height: 32),
                        
                        // Recent Activity Section
                        const Text(
                          'Quick Actions',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 16),
                        
                        Card(
                          child: Column(
                            children: [
                              ListTile(
                                leading: Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: AppTheme.primaryBlue.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Icon(Icons.qr_code_scanner, color: AppTheme.primaryBlue),
                                ),
                                title: const Text('My ID Card'),
                                subtitle: const Text('View digital member ID'),
                                trailing: const Icon(Icons.chevron_right),
                                onTap: () {},
                              ),
                              const Divider(height: 1),
                              ListTile(
                                leading: Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: AppTheme.accentTeal.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Icon(Icons.photo_library_outlined, color: AppTheme.accentTeal),
                                ),
                                title: const Text('Gallery'),
                                subtitle: const Text('View recent event photos'),
                                trailing: const Icon(Icons.chevron_right),
                                onTap: () {},
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
      ),
    );
  }
}
