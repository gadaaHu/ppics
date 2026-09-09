import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../screens/login_screen.dart';
import '../screens/dashboard_screen.dart';
import '../screens/members_screen.dart';
import '../screens/news_screen.dart';
import '../screens/gallery_screen.dart';
import '../screens/payments_screen.dart';
import '../screens/evaluations_screen.dart';
import '../screens/settings_screen.dart';
import '../screens/events_screen.dart';
import '../screens/attendance_screen.dart';
import '../screens/elearning_screen.dart';
import '../screens/publications_screen.dart';
import '../screens/hierarchy_screen.dart';
import '../screens/plans_screen.dart';
import '../screens/users_screen.dart';
import '../screens/member_registration_screen.dart';
import '../screens/member_profile_screen.dart';
import '../screens/documents_screen.dart';

GoRouter buildRouter(BuildContext context) {
  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final isLoggedIn = auth.isLoggedIn;
      final isLoggingIn = state.matchedLocation == '/login';
      final isRegistering = state.matchedLocation == '/register';

      if (!isLoggedIn && !isLoggingIn && !isRegistering) return '/login';
      if (isLoggedIn && (isLoggingIn || isRegistering)) return '/dashboard';
      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/dashboard', builder: (_, __) => const DashboardScreen()),
      GoRoute(path: '/members', builder: (_, __) => const MembersScreen()),
      GoRoute(path: '/news', builder: (_, __) => const NewsScreen()),
      GoRoute(path: '/gallery', builder: (_, __) => const GalleryScreen()),
      GoRoute(path: '/payments', builder: (_, __) => const PaymentsScreen()),
      GoRoute(path: '/evaluations', builder: (_, __) => const EvaluationsScreen()),
      GoRoute(path: '/settings', builder: (_, __) => const SettingsScreen()),
      // New routes
      GoRoute(path: '/events', builder: (_, __) => const EventsScreen()),
      GoRoute(path: '/attendance', builder: (_, __) => const AttendanceScreen()),
      GoRoute(path: '/elearning', builder: (_, __) => const ELearningScreen()),
      GoRoute(path: '/publications', builder: (_, __) => const PublicationsScreen()),
      GoRoute(path: '/hierarchy', builder: (_, __) => const HierarchyScreen()),
      GoRoute(path: '/plans', builder: (_, __) => const PlansScreen()),
      GoRoute(path: '/users', builder: (_, __) => const UsersScreen()),
      GoRoute(path: '/register', builder: (_, __) => const MemberRegistrationScreen()),
      GoRoute(path: '/profile', builder: (_, __) => const MemberProfileScreen()),
      GoRoute(path: '/documents/cooperative/:id', builder: (_, state) => DocumentsScreen(cooperativeId: int.parse(state.pathParameters['id']!), title: 'Cooperative Documents')),
      GoRoute(path: '/documents/family/:id', builder: (_, state) => DocumentsScreen(familyId: int.parse(state.pathParameters['id']!), title: 'Family Documents')),
    ],
  );
}
