import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_drawer.dart';
import '../../core/widgets/stat_card.dart';
import '../auth/auth_provider.dart';

class FamilyLeaderDashboard extends StatefulWidget {
  const FamilyLeaderDashboard({super.key});

  @override
  State<FamilyLeaderDashboard> createState() => _FamilyLeaderDashboardState();
}

class _FamilyLeaderDashboardState extends State<FamilyLeaderDashboard> {
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
      // Mock stats for family leader
      _stats = {
        'family_members': 5,
        'pending_payments': 1,
        'evaluations': 2,
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

    return Scaffold(
      appBar: AppBar(
        title: const Text('Family Dashboard'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: CircleAvatar(
              radius: 16,
              backgroundColor: AppTheme.roleColor(auth.role),
              child: Text(
                auth.fullName.isNotEmpty ? auth.fullName[0].toUpperCase() : 'F',
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
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
                        Text(
                          'Family Overview',
                          style: TextStyle(
                            fontSize: 16,
                            color: AppTheme.lightTextSecondary,
                          ),
                        ),
                        const SizedBox(height: 16),
                        GridView.count(
                          crossAxisCount: 2,
                          crossAxisSpacing: 16,
                          mainAxisSpacing: 16,
                          childAspectRatio: 0.95,
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          children: [
                            StatCard(
                              title: 'Family Members',
                              value: '${_stats?['family_members'] ?? 0}',
                              icon: Icons.family_restroom,
                              color: AppTheme.primaryBlue,
                              onTap: () {},
                            ),
                            StatCard(
                              title: 'Pending Payments',
                              value: '${_stats?['pending_payments'] ?? 0}',
                              icon: Icons.payments_outlined,
                              color: AppTheme.warningAmber,
                              onTap: () {},
                            ),
                            StatCard(
                              title: 'Evaluations',
                              value: '${_stats?['evaluations'] ?? 0}',
                              icon: Icons.assignment_turned_in_outlined,
                              color: AppTheme.accentTeal,
                              onTap: () {},
                            ),
                          ],
                        ),
                        const SizedBox(height: 32),
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
                                leading: const Icon(Icons.payments_outlined, color: AppTheme.primaryBlue),
                                title: const Text('Approve Payments'),
                                trailing: const Icon(Icons.chevron_right),
                                onTap: () {},
                              ),
                              const Divider(height: 1),
                              ListTile(
                                leading: const Icon(Icons.people_outline, color: AppTheme.primaryBlue),
                                title: const Text('Manage Family Members'),
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
