import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/app_shell.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final _api = ApiService();
  Map<String, dynamic>? _stats;
  List _latestNews = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    setState(() => _loading = true);
    try {
      final results = await Future.wait([
        _api.getMembers(),
        _api.getLatestNews(limit: 3),
        _api.getPayments(),
        _api.getEvaluations(),
        _api.getEvents(),
      ]);
      setState(() {
        _stats = {
          'members': (results[0].data['data'] as List?)?.length ?? 0,
          'news': results[1].data['pagination']?['total'] ?? (results[1].data['data'] as List?)?.length ?? 0,
          'payments': (results[2].data['data'] as List?)?.length ?? 0,
          'evaluations': (results[3].data['data'] as List?)?.length ?? 0,
          'events': (results[4].data['data'] as List?)?.length ?? 0,
        };
        _latestNews = results[1].data['data'] ?? [];
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final role = auth.currentUser?['role'] ?? 'member';
    final name = auth.currentUser?['full_name'] ?? auth.currentUser?['username'] ?? 'User';

    return AppShell(
      currentRoute: '/dashboard',
      child: RefreshIndicator(
        onRefresh: _loadStats,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome banner
              Container(
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppTheme.primaryDark, AppTheme.primaryLight],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(color: AppTheme.primary.withValues(alpha: 0.3), blurRadius: 15, offset: const Offset(0, 8))
                  ],
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Welcome back, $name!',
                              style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: -0.5)),
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
                            ),
                            child: Text(role.toUpperCase(),
                                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1)),
                          ),
                        ],
                      ),
                    ),
                    const Icon(Icons.local_activity, color: Colors.white30, size: 80)
                        .animate(onPlay: (controller) => controller.repeat(reverse: true))
                        .moveY(begin: -5, end: 5, duration: 2000.ms),
                  ],
                ),
              ).animate().fadeIn(duration: 600.ms).slideY(begin: 0.1, end: 0),
              
              const SizedBox(height: 40),

              // Stats cards
              const Text('Overview', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
              const SizedBox(height: 16),
              if (_loading)
                const Center(child: CircularProgressIndicator())
              else
                Wrap(
                  spacing: 20,
                  runSpacing: 20,
                  children: [
                    _StatCard(label: 'Total Members', value: '${_stats?['members'] ?? 0}', icon: Icons.people, color: AppTheme.primary, route: '/members', delay: 100),
                    _StatCard(label: 'News Articles', value: '${_stats?['news'] ?? 0}', icon: Icons.newspaper, color: AppTheme.success, route: '/news', delay: 200),
                    _StatCard(label: 'Payments', value: '${_stats?['payments'] ?? 0}', icon: Icons.payment, color: AppTheme.warning, route: '/payments', delay: 300),
                    _StatCard(label: 'Evaluations', value: '${_stats?['evaluations'] ?? 0}', icon: Icons.assessment, color: const Color(0xFF7B1FA2), route: '/evaluations', delay: 400),
                    _StatCard(label: 'Events', value: '${_stats?['events'] ?? 0}', icon: Icons.event, color: AppTheme.accent, route: '/events', delay: 500),
                  ],
                ),
              const SizedBox(height: 40),

              // Quick links for role-based navigation
              const Text('Quick Access', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
              const SizedBox(height: 16),
              Wrap(
                spacing: 16,
                runSpacing: 16,
                children: _quickLinksForRole(role),
              ),

              // Latest news
              if (_latestNews.isNotEmpty) ...[
                const SizedBox(height: 40),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Latest News', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                    TextButton.icon(
                      onPressed: () => context.go('/news'), 
                      icon: const Text('View All'), 
                      label: const Icon(Icons.arrow_forward, size: 16),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                ..._latestNews.map((n) {
                  int index = _latestNews.indexOf(n);
                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                      side: const BorderSide(color: AppTheme.border, width: 1),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(n['news_title'] ?? '', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(color: AppTheme.background, borderRadius: BorderRadius.circular(20)),
                                child: Text(n['newsdate'] ?? '', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11, fontWeight: FontWeight.w600)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(n['news_des'] ?? '', maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 14)),
                        ],
                      ),
                    ),
                  ).animate().fadeIn(delay: (600 + (index * 100)).ms).slideY(begin: 0.1, end: 0);
                }),
              ],
            ],
          ),
        ),
      ),
    );
  }

  List<Widget> _quickLinksForRole(String role) {
    final allLinks = [
      if (['admin', 'leader', 'family_leader'].contains(role))
        _QuickLink(icon: Icons.people, label: 'Members', route: '/members', delay: 100),
      if (['admin', 'leader'].contains(role)) ...[
        _QuickLink(icon: Icons.event, label: 'Events', route: '/events', delay: 150),
        _QuickLink(icon: Icons.fact_check, label: 'Attendance', route: '/attendance', delay: 200),
        _QuickLink(icon: Icons.description, label: 'Plans', route: '/plans', delay: 250),
        _QuickLink(icon: Icons.admin_panel_settings, label: 'Users', route: '/users', delay: 300),
      ],
      _QuickLink(icon: Icons.school, label: 'E-Learning', route: '/elearning', delay: 350),
      _QuickLink(icon: Icons.library_books, label: 'Publications', route: '/publications', delay: 400),
      _QuickLink(icon: Icons.photo_library, label: 'Gallery', route: '/gallery', delay: 450),
      _QuickLink(icon: Icons.account_circle, label: 'My Profile', route: '/profile', delay: 500),
    ];
    return allLinks;
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  final String route;
  final int delay;

  const _StatCard({required this.label, required this.value, required this.icon, required this.color, required this.route, required this.delay});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => context.go(route),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        width: 220,
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppTheme.border, width: 1.5),
          boxShadow: [
            BoxShadow(color: color.withValues(alpha: 0.05), blurRadius: 20, offset: const Offset(0, 10))
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(16)),
              child: Icon(icon, color: color, size: 30),
            ),
            const SizedBox(width: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(value, style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: color, letterSpacing: -1)),
                Text(label, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13, fontWeight: FontWeight.w600)),
              ],
            ),
          ],
        ),
      ),
    ).animate().fadeIn(delay: delay.ms).scale(curve: Curves.easeOutBack);
  }
}

class _QuickLink extends StatelessWidget {
  final IconData icon;
  final String label;
  final String route;
  final int delay;
  
  const _QuickLink({required this.icon, required this.label, required this.route, required this.delay});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => context.go(route),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        width: 110,
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 8),
        decoration: BoxDecoration(
          color: AppTheme.background,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.border, width: 1.5),
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 5, offset: Offset(0,2))],
              ),
              child: Icon(icon, color: AppTheme.primary, size: 28),
            ),
            const SizedBox(height: 12),
            Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.textPrimary), textAlign: TextAlign.center),
          ],
        ),
      ),
    ).animate().fadeIn(delay: delay.ms).slideY(begin: 0.1, end: 0);
  }
}
