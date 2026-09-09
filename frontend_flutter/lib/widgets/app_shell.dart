import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';

class AppShell extends StatelessWidget {
  final Widget child;
  final String currentRoute;
  final Widget? floatingActionButton;

  const AppShell({super.key, required this.child, required this.currentRoute, this.floatingActionButton});

  static const _navItems = [
    _NavItem(icon: Icons.dashboard, label: 'Dashboard', route: '/dashboard'),
    _NavItem(icon: Icons.people, label: 'Members', route: '/members'),
    _NavItem(icon: Icons.event, label: 'Events', route: '/events'),
    _NavItem(icon: Icons.fact_check, label: 'Attendance', route: '/attendance'),
    _NavItem(icon: Icons.newspaper, label: 'News', route: '/news'),
    _NavItem(icon: Icons.photo_library, label: 'Gallery', route: '/gallery'),
    _NavItem(icon: Icons.school, label: 'E-Learning', route: '/elearning'),
    _NavItem(icon: Icons.library_books, label: 'Publications', route: '/publications'),
    _NavItem(icon: Icons.account_tree, label: 'Hierarchy', route: '/hierarchy'),
    _NavItem(icon: Icons.description, label: 'Plans', route: '/plans'),
    _NavItem(icon: Icons.payment, label: 'Payments', route: '/payments'),
    _NavItem(icon: Icons.assessment, label: 'Evaluations', route: '/evaluations'),
    _NavItem(icon: Icons.admin_panel_settings, label: 'Users', route: '/users'),
    _NavItem(icon: Icons.settings, label: 'Settings', route: '/settings'),
  ];

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final isWide = MediaQuery.of(context).size.width >= 800;

    final scaffold = Scaffold(
      appBar: isWide
          ? null
          : AppBar(
              title: Text(_getTitle(currentRoute)),
              actions: [
                IconButton(
                  icon: const Icon(Icons.logout),
                  onPressed: () async {
                    await auth.logout();
                    if (context.mounted) context.go('/login');
                  },
                ),
              ],
            ),
      drawer: isWide ? null : _buildDrawer(context, auth),
      body: child,
      floatingActionButton: floatingActionButton,
    );

    if (!isWide) return scaffold;

    return Scaffold(
      body: Row(
        children: [
          _buildSideNav(context, auth),
          Expanded(child: child),
        ],
      ),
      floatingActionButton: floatingActionButton,
    );
  }

  Widget _buildSideNav(BuildContext context, AuthProvider auth) {
    return Container(
      width: 250,
      decoration: BoxDecoration(
        color: AppTheme.primaryDark,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: const Offset(4, 0),
          )
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.fromLTRB(24, 48, 24, 32),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppTheme.primaryLight, AppTheme.primary],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(color: AppTheme.primary.withValues(alpha: 0.4), blurRadius: 8, offset: const Offset(0, 4))
                    ],
                  ),
                  child: const Icon(Icons.people_alt, color: Colors.white, size: 24),
                ).animate().scale(delay: 200.ms, curve: Curves.easeOutBack),
                const SizedBox(width: 16),
                const Expanded(
                  child: Text(
                    'ICSPP',
                    style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold, letterSpacing: 1),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 8),
              children: _navItems.map((item) {
                final isSelected = currentRoute == item.route;
                int index = _navItems.indexOf(item);
                return Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  decoration: BoxDecoration(
                    gradient: isSelected
                        ? LinearGradient(colors: [Colors.white.withValues(alpha: 0.2), Colors.white.withValues(alpha: 0.05)])
                        : null,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: ListTile(
                    leading: Icon(item.icon, color: isSelected ? Colors.white : Colors.white70, size: 22),
                    title: Text(
                      item.label,
                      style: TextStyle(
                        color: isSelected ? Colors.white : Colors.white70,
                        fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                        fontSize: 14,
                      ),
                    ),
                    onTap: () => context.go(item.route),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    dense: true,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
                  ),
                ).animate().fadeIn(delay: (100 + (index * 20)).ms).slideX(begin: -0.1, end: 0);
              }).toList(),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                const Divider(color: Colors.white24, height: 1),
                const SizedBox(height: 16),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                  ),
                  child: ListTile(
                    leading: const CircleAvatar(
                      backgroundColor: Colors.white24,
                      child: Icon(Icons.person, color: Colors.white70),
                    ),
                    title: Text(
                      auth.currentUser?['username'] ?? 'User',
                      style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                    subtitle: Text(
                      auth.currentUser?['role']?.toUpperCase() ?? '',
                      style: const TextStyle(color: AppTheme.primaryLight, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                    onTap: () => context.go('/profile'),
                    trailing: IconButton(
                      icon: const Icon(Icons.logout, color: Colors.white54, size: 20),
                      onPressed: () async {
                        await auth.logout();
                        if (context.mounted) context.go('/login');
                      },
                    ),
                    dense: true,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDrawer(BuildContext context, AuthProvider auth) {
    return Drawer(
      child: Column(
        children: [
          DrawerHeader(
            decoration: const BoxDecoration(
              gradient: LinearGradient(colors: [AppTheme.primaryDark, AppTheme.primary]),
            ),
            child: InkWell(
              onTap: () {
                Navigator.pop(context);
                context.go('/profile');
              },
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(12)),
                    child: const Icon(Icons.people_alt, color: Colors.white, size: 36),
                  ),
                  const SizedBox(width: 16),
                  Column(
                     mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('ICSPP', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                      Text(auth.currentUser?['username'] ?? '', style: const TextStyle(color: Colors.white70, fontSize: 14)),
                    ],
                  ),
                ],
              ),
            ),
          ),
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: _navItems.map((item) => ListTile(
                leading: Icon(item.icon, color: currentRoute == item.route ? AppTheme.primary : AppTheme.textSecondary),
                title: Text(item.label, style: TextStyle(fontWeight: currentRoute == item.route ? FontWeight.bold : FontWeight.normal)),
                selected: currentRoute == item.route,
                selectedTileColor: AppTheme.primary.withValues(alpha: 0.1),
                onTap: () {
                  Navigator.pop(context);
                  context.go(item.route);
                },
              )).toList(),
            ),
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout, color: AppTheme.danger),
            title: const Text('Logout', style: TextStyle(color: AppTheme.danger, fontWeight: FontWeight.bold)),
            onTap: () async {
              await auth.logout();
              if (context.mounted) context.go('/login');
            },
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  String _getTitle(String route) {
    return switch (route) {
      '/dashboard' => 'Dashboard',
      '/members' => 'Members',
      '/news' => 'News',
      '/gallery' => 'Gallery',
      '/payments' => 'Payments',
      '/evaluations' => 'Evaluations',
      '/settings' => 'Settings',
      '/events' => 'Events',
      '/attendance' => 'Attendance',
      '/elearning' => 'E-Learning',
      '/publications' => 'Publications',
      '/hierarchy' => 'Hierarchy',
      '/plans' => 'Plans',
      '/users' => 'Users',
      _ => 'ICSPP',
    };
  }
}

class _NavItem {
  final IconData icon;
  final String label;
  final String route;
  const _NavItem({required this.icon, required this.label, required this.route});
}
