import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'features/auth/auth_provider.dart';
import 'features/auth/splash_screen.dart';
import 'features/auth/login_screen.dart';

import 'features/dashboard/member_dashboard.dart';
import 'features/dashboard/admin_dashboard.dart';
import 'features/dashboard/leader_dashboard.dart';
import 'features/dashboard/family_leader_dashboard.dart';
import 'features/profile/profile_screen.dart';
import 'features/e_learning/courses_screen.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>();

final GoRouter appRouter = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/',
  redirect: (context, state) {
    final auth = context.read<AuthProvider>();
    final isGoingToLogin = state.matchedLocation == '/login';
    final isSplash = state.matchedLocation == '/';

    // Allow splash screen to handle its own initialization and routing
    if (isSplash) return null;

    if (auth.status == AuthStatus.unauthenticated && !isGoingToLogin) {
      return '/login';
    }

    if (auth.status == AuthStatus.authenticated && isGoingToLogin) {
      // Redirect to appropriate dashboard based on role
      switch (auth.role) {
        case 'admin':
          return '/admin/dashboard';
        case 'leader':
          return '/leader/dashboard';
        case 'family_leader':
          return '/family-leader/dashboard';
        default:
          return '/member/dashboard';
      }
    }

    // Role-based route guarding
    final location = state.matchedLocation;
    if (location.startsWith('/admin') && !auth.isAdmin) {
      return _fallbackDashboard(auth.role);
    }
    if (location.startsWith('/leader') && !auth.isLeader) {
      return _fallbackDashboard(auth.role);
    }
    if (location.startsWith('/family-leader') && !auth.isFamilyLeader && !auth.isAdmin) {
      return _fallbackDashboard(auth.role);
    }

    return null;
  },
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    // ── Member Routes ──────────────────────────────────────────────────────────
    GoRoute(
      path: '/member/dashboard',
      builder: (context, state) => const MemberDashboard(),
    ),
    GoRoute(
      path: '/member/profile',
      builder: (context, state) => const ProfileScreen(),
    ),
    GoRoute(
      path: '/member/e-learning',
      builder: (context, state) => const CoursesScreen(),
    ),
    // ── Admin Routes ───────────────────────────────────────────────────────────
    GoRoute(
      path: '/admin/dashboard',
      builder: (context, state) => const AdminDashboard(),
    ),
    // ── Leader Routes ──────────────────────────────────────────────────────────
    GoRoute(
      path: '/leader/dashboard',
      builder: (context, state) => const LeaderDashboard(),
    ),
    // ── Family Leader Routes ───────────────────────────────────────────────────
    GoRoute(
      path: '/family-leader/dashboard',
      builder: (context, state) => const FamilyLeaderDashboard(),
    ),
  ],
);

String _fallbackDashboard(String role) {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'leader':
      return '/leader/dashboard';
    case 'family_leader':
      return '/family-leader/dashboard';
    default:
      return '/member/dashboard';
  }
}
