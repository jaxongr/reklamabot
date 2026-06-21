import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'features/auth/login_screen.dart';
import 'features/auth/splash_screen.dart';
import 'features/auth/permissions_screen.dart';
import 'features/home/home_shell.dart';
import 'features/ads/ads_screen.dart';
import 'features/ads/accepted_screen.dart';
import 'features/calls/calls_screen.dart';
import 'features/settings/settings_screen.dart';

final appRouter = GoRouter(
  initialLocation: '/splash',
  redirect: (ctx, state) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('yolda_token');
    final isAuth = token != null && token.isNotEmpty;
    final isSplash = state.matchedLocation == '/splash';
    final isLogin = state.matchedLocation == '/login';
    final isPerms = state.matchedLocation == '/permissions';
    if (isSplash || isPerms) return null;
    if (!isAuth && !isLogin) return '/login';
    if (isAuth && isLogin) return '/permissions';
    return null;
  },
  routes: [
    GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
    GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
    GoRoute(path: '/permissions', builder: (_, __) => const PermissionsScreen()),
    ShellRoute(
      builder: (ctx, state, child) => HomeShell(child: child),
      routes: [
        GoRoute(path: '/home', builder: (_, __) => const AdsScreen()),
        GoRoute(path: '/accepted', builder: (_, __) => const AcceptedScreen()),
        GoRoute(path: '/calls', builder: (_, __) => const CallsScreen()),
        GoRoute(path: '/settings', builder: (_, __) => const SettingsScreen()),
      ],
    ),
  ],
);
