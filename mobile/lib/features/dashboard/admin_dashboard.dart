import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_drawer.dart';
import '../../core/widgets/stat_card.dart';
import '../auth/auth_provider.dart';
import '../../services/api_client.dart';
import '../../config/api_config.dart';

class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
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
      // Typically, there would be an admin dashboard stats endpoint
      // Mocking some stats for now
      _stats = {
        'total_members': 1205,
        'active_events': 4,
        'pending_payments': 23,
        'districts': 5,
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
        title: const Text('Admin Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () {},
          ),
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: CircleAvatar(
              radius: 16,
              backgroundColor: AppTheme.roleColor(auth.role),
              child: Text(
                auth.fullName.isNotEmpty ? auth.fullName[0].toUpperCase() : 'A',
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
                        const Text(
                          'System Overview',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
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
                              title: 'Total Members',
                              value: '${_stats?['total_members'] ?? 0}',
                              icon: Icons.people_outline,
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
                              title: 'Active Events',
                              value: '${_stats?['active_events'] ?? 0}',
                              icon: Icons.event_outlined,
                              color: AppTheme.accentTeal,
                              onTap: () {},
                            ),
                            StatCard(
                              title: 'Districts',
                              value: '${_stats?['districts'] ?? 0}',
                              icon: Icons.map_outlined,
                              color: AppTheme.successGreen,
                              onTap: () {},
                            ),
                          ],
                        ),
                        const SizedBox(height: 32),
                        const Text(
                          'Management Shortcuts',
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
                                leading: const Icon(Icons.person_add_outlined, color: AppTheme.primaryBlue),
                                title: const Text('Add New Member'),
                                trailing: const Icon(Icons.chevron_right),
                                onTap: () {},
                              ),
                              const Divider(height: 1),
                              ListTile(
                                leading: const Icon(Icons.account_tree_outlined, color: AppTheme.primaryBlue),
                                title: const Text('Hierarchy Setup'),
                                trailing: const Icon(Icons.chevron_right),
                                onTap: () {},
                              ),
                              const Divider(height: 1),
                              ListTile(
                                leading: const Icon(Icons.qr_code_scanner, color: AppTheme.primaryBlue),
                                title: const Text('Barcode Attendance'),
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
