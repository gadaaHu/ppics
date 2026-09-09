import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_drawer.dart';
import '../../core/widgets/stat_card.dart';
import '../auth/auth_provider.dart';

class LeaderDashboard extends StatefulWidget {
  const LeaderDashboard({super.key});

  @override
  State<LeaderDashboard> createState() => _LeaderDashboardState();
}

class _LeaderDashboardState extends State<LeaderDashboard> {
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
      // Mock stats for cooperative leader
      _stats = {
        'coop_members': 150,
        'families': 12,
        'pending_evaluations': 5,
        'active_plans': 3,
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
        title: const Text('Cooperative Dashboard'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: CircleAvatar(
              radius: 16,
              backgroundColor: AppTheme.roleColor(auth.role),
              child: Text(
                auth.fullName.isNotEmpty ? auth.fullName[0].toUpperCase() : 'L',
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
                          'Cooperative Overview',
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
                              title: 'Members',
                              value: '${_stats?['coop_members'] ?? 0}',
                              icon: Icons.people_outline,
                              color: AppTheme.primaryBlue,
                              onTap: () {},
                            ),
                            StatCard(
                              title: 'Families',
                              value: '${_stats?['families'] ?? 0}',
                              icon: Icons.family_restroom_outlined,
                              color: AppTheme.accentTeal,
                              onTap: () {},
                            ),
                            StatCard(
                              title: 'Evaluations',
                              value: '${_stats?['pending_evaluations'] ?? 0}',
                              icon: Icons.assignment_turned_in_outlined,
                              color: AppTheme.warningAmber,
                              subtitle: 'Pending review',
                              onTap: () {},
                            ),
                            StatCard(
                              title: 'Active Plans',
                              value: '${_stats?['active_plans'] ?? 0}',
                              icon: Icons.next_plan_outlined,
                              color: AppTheme.successGreen,
                              onTap: () {},
                            ),
                          ],
                        ),
                        const SizedBox(height: 32),
                        const Text(
                          'Tasks',
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
                                title: const Text('Review Payments'),
                                trailing: const Icon(Icons.chevron_right),
                                onTap: () {},
                              ),
                              const Divider(height: 1),
                              ListTile(
                                leading: const Icon(Icons.person_add_outlined, color: AppTheme.primaryBlue),
                                title: const Text('Add Cooperative Member'),
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
