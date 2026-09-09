import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/auth_provider.dart';
import '../theme/app_theme.dart';
import '../../config/api_config.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final role = auth.role;

    return Drawer(
      child: Column(
        children: [
          // ── Header ──────────────────────────────────────────────────────────
          UserAccountsDrawerHeader(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [AppTheme.primaryBlue, AppTheme.accentTeal],
              ),
            ),
            accountName: Text(
              auth.fullName,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            accountEmail: Container(
              margin: const EdgeInsets.only(top: 4),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                AppTheme.roleLabel(role),
                style: const TextStyle(fontSize: 12),
              ),
            ),
            currentAccountPicture: CircleAvatar(
              backgroundColor: Colors.white,
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
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.primaryBlue,
                      ),
                    )
                  : null,
            ),
          ),
          // ── Menu Items ──────────────────────────────────────────────────────
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                if (auth.isAdmin) ..._buildAdminMenu(context),
                if (auth.isLeader) ..._buildLeaderMenu(context),
                if (auth.isFamilyLeader) ..._buildFamilyLeaderMenu(context),
                if (auth.isMember && !auth.isAdmin && !auth.isLeader && !auth.isFamilyLeader)
                  ..._buildMemberMenu(context),
              ],
            ),
          ),
          // ── Footer ──────────────────────────────────────────────────────────
          const Divider(height: 1),
          ListTile(
            leading: const Icon(Icons.logout, color: AppTheme.errorRed),
            title: const Text('Logout', style: TextStyle(color: AppTheme.errorRed)),
            onTap: () async {
              await auth.logout();
              if (context.mounted) context.go('/login');
            },
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  List<Widget> _buildMemberMenu(BuildContext context) {
    return [
      _DrawerItem(
        icon: Icons.dashboard_outlined,
        title: 'Dashboard',
        onTap: () => context.go('/member/dashboard'),
      ),
      _DrawerItem(
        icon: Icons.person_outline,
        title: 'My Profile',
        onTap: () => context.push('/member/profile'),
      ),
      _DrawerItem(
        icon: Icons.people_outline,
        title: 'Members',
        onTap: () {}, // context.go('/member/members')
      ),
      _DrawerItem(
        icon: Icons.assignment_outlined,
        title: 'Family Plans',
        onTap: () {}, // context.go('/member/family-plans')
      ),
      _DrawerItem(
        icon: Icons.school_outlined,
        title: 'E-Learning',
        onTap: () => context.push('/member/e-learning'),
      ),
    ];
  }

  List<Widget> _buildAdminMenu(BuildContext context) {
    return [
      _DrawerItem(
        icon: Icons.dashboard_outlined,
        title: 'Dashboard',
        onTap: () => context.go('/admin/dashboard'),
      ),
      _DrawerItem(
        icon: Icons.people_outline,
        title: 'Members Management',
        onTap: () {},
      ),
      _DrawerItem(
        icon: Icons.account_tree_outlined,
        title: 'Hierarchy',
        onTap: () {},
      ),
      _DrawerItem(
        icon: Icons.event_outlined,
        title: 'Events',
        onTap: () {},
      ),
      _DrawerItem(
        icon: Icons.payments_outlined,
        title: 'Payments',
        onTap: () {},
      ),
    ];
  }

  List<Widget> _buildLeaderMenu(BuildContext context) {
    return [
      _DrawerItem(
        icon: Icons.dashboard_outlined,
        title: 'Dashboard',
        onTap: () => context.go('/leader/dashboard'),
      ),
      _DrawerItem(
        icon: Icons.people_outline,
        title: 'Cooperative Members',
        onTap: () {},
      ),
    ];
  }

  List<Widget> _buildFamilyLeaderMenu(BuildContext context) {
    return [
      _DrawerItem(
        icon: Icons.dashboard_outlined,
        title: 'Dashboard',
        onTap: () => context.go('/family-leader/dashboard'),
      ),
      _DrawerItem(
        icon: Icons.family_restroom_outlined,
        title: 'Family Members',
        onTap: () {},
      ),
    ];
  }
}

class _DrawerItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;

  const _DrawerItem({
    required this.icon,
    required this.title,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: AppTheme.lightTextSecondary),
      title: Text(
        title,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: AppTheme.lightTextPrimary,
        ),
      ),
      onTap: () {
        Navigator.pop(context); // Close drawer
        onTap();
      },
    );
  }
}
