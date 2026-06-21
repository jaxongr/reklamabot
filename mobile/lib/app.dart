import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'app_config.dart';
import 'config/routes.dart';
import 'config/theme.dart';
import 'config/silk_theme.dart';
import 'core/api/api_client.dart';
import 'core/providers/theme_provider.dart';
import 'features/auth/auth_provider.dart';
import 'features/auth/login_screen.dart';
import 'features/auth/role_selection_screen.dart';

// New Yo'lda screens
import 'features/home/home_screen.dart';
import 'features/accepted/accepted_screen.dart';
import 'features/chat/chat_screen.dart';
import 'features/chat/chat_room_screen.dart';
import 'features/balance/balance_screen.dart';
import 'features/archive/archive_screen.dart';
import 'features/notifications/notifications_screen.dart';
import 'features/support/support_screen.dart';
import 'features/support/ticket_detail_screen.dart';
import 'features/subscribe/subscribe_screen.dart';
import 'features/settings/settings_screen.dart';
import 'features/driver/photos/vehicle_photos_screen.dart';
import 'features/driver/invite/invite_screen.dart';
import 'features/dispatcher/create_order_screen.dart';
import 'features/dispatcher/testr_screen.dart';
import 'features/dispatcher/sms_screen.dart';
import 'features/dispatcher/numbers_screen.dart';
import 'features/search/search_screen.dart';
import 'features/map/map_screen.dart';
import 'features/offer/offer_tab_screen.dart';
import 'features/posting/posting_screen.dart';
import 'features/sessions/sessions_screen.dart';
import 'features/sessions/add_session_screen.dart';
import 'features/driver/registration/driver_registration_screen.dart';
import 'features/blacklist/blacklist_screen.dart';
import 'features/auth/driver_login_screen.dart';
import 'features/dispatcher/create_ad_screen.dart';
import 'features/dispatcher/matching_drivers_screen.dart';
import 'features/dispatcher/my_ads_screen.dart';
import 'features/dispatcher/driver_offers_screen.dart';
import 'features/dispatcher/statistics_screen.dart';
import 'features/dispatcher/dispatcher_profile_screen.dart';
import 'features/orders/order_detail_screen.dart';

// Unified scaffold
import 'widgets/app_scaffold.dart';

// Driver screens
import 'features/driver/driver_scaffold.dart';
import 'features/driver/orders/driver_orders_screen.dart';
import 'features/driver/accepted/driver_accepted_screen.dart';
import 'features/driver/profile/driver_profile_screen.dart';
import 'features/driver/more/driver_more_screen.dart';

// FCM token registrar
import 'core/services/fcm_token_registrar.dart';
import 'core/services/fcm_service.dart';
import 'core/services/version_check_service.dart';
import 'core/api/api_client.dart';

// Provider to track selected role
final selectedRoleProvider = FutureProvider<String?>((ref) async {
  final storage = ref.read(secureStorageProvider);
  return storage.read(key: StorageKeys.selectedRole);
});

// Router provider
final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: AppRoutes.login,
    redirect: (context, state) {
      final isLoggedIn = authState.isAuthenticated;
      final isLoginRoute = state.matchedLocation == AppRoutes.login;
      final isRoleSelect = state.matchedLocation == AppRoutes.roleSelect;

      final isDriverRegister = state.matchedLocation == AppRoutes.driverRegister;
      if (!isLoggedIn && !isLoginRoute && !isRoleSelect && !isDriverRegister) {
        return AppRoutes.login;
      }
      if (isLoggedIn && (isLoginRoute || isRoleSelect)) {
        if (isDriverApp) return AppRoutes.driverHome;
        return AppRoutes.home;
      }
      return null;
    },
    routes: [
      // ── Auth routes ──
      GoRoute(
        path: AppRoutes.roleSelect,
        builder: (context, state) => const RoleSelectionScreen(),
      ),
      GoRoute(
        path: AppRoutes.login,
        builder: (context, state) => isDriverApp
            ? const DriverLoginScreen()
            : const LoginScreen(),
      ),

      // ══════════════════════════════════════════════════════════════
      // DISPATCHER SHELL — 5 bottom tabs
      // ══════════════════════════════════════════════════════════════
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return AppScaffold(navigationShell: navigationShell);
        },
        branches: [
          // Tab 0: Home
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.home,
                builder: (context, state) => const HomeScreen(),
              ),
            ],
          ),
          // Tab 1: Accepted
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.accepted,
                builder: (context, state) => const AcceptedScreen(),
              ),
            ],
          ),
          // Tab 2: Harita (Map)
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.dispatcherMap,
                builder: (context, state) => const MapScreen(),
              ),
            ],
          ),
          // Tab 3: Chat
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.chat,
                builder: (context, state) => const ChatScreen(),
                routes: [
                  GoRoute(
                    path: ':id',
                    builder: (context, state) =>
                        ChatRoomScreen(roomId: state.pathParameters['id']!),
                  ),
                ],
              ),
            ],
          ),
          // Tab 4: Balance
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.balance,
                builder: (context, state) => const BalanceScreen(),
              ),
            ],
          ),
        ],
      ),

      // ══════════════════════════════════════════════════════════════
      // DRIVER SHELL — 4 bottom tabs (Yuklar, Takliflar, Profil, Ko'proq)
      // ══════════════════════════════════════════════════════════════
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return DriverScaffold(navigationShell: navigationShell);
        },
        branches: [
          // Tab 0: Yuklar (Driver Orders)
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.driverHome,
                builder: (context, state) => const DriverOrdersScreen(),
              ),
            ],
          ),
          // Tab 1: Takliflar (Offer)
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.driverOffer,
                builder: (context, state) => const OfferTabScreen(),
              ),
            ],
          ),
          // Tab 2: Qabul qilinganlar (Accepted orders)
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.driverAccepted,
                builder: (context, state) => const DriverAcceptedScreen(),
              ),
            ],
          ),
          // Tab 3: Profil (GPS toggle, online status, profile info)
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.driverProfileTab,
                builder: (context, state) => const DriverProfileScreen(),
              ),
            ],
          ),
          // Tab 4: Ko'proq (Balance, Chat, Settings, etc.)
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.driverBalance,
                builder: (context, state) => const DriverMoreScreen(),
              ),
            ],
          ),
        ],
      ),

      // ══════════════════════════════════════════════════════════════
      // STANDALONE SCREENS (push-only, no bottom nav)
      // ══════════════════════════════════════════════════════════════
      GoRoute(
        path: AppRoutes.archive,
        builder: (context, state) => const ArchiveScreen(),
      ),
      GoRoute(
        path: AppRoutes.notifications,
        builder: (context, state) => const NotificationsScreen(),
      ),
      GoRoute(
        path: AppRoutes.support,
        builder: (context, state) => const SupportScreen(),
      ),
      GoRoute(
        path: '/support/:id',
        builder: (context, state) =>
            TicketDetailScreen(ticketId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: AppRoutes.subscribe,
        builder: (context, state) => const SubscribeScreen(),
      ),
      GoRoute(
        path: AppRoutes.settingsPage,
        builder: (context, state) => const SettingsScreen(),
      ),

      // Driver chat list (standalone — dispatcher shell bilan conflict qilmasligi uchun)
      GoRoute(
        path: '/driver/chat',
        builder: (context, state) => const ChatScreen(),
      ),
      // Driver chat room (standalone)
      GoRoute(
        path: '/driver/chat/:id',
        builder: (context, state) =>
            ChatRoomScreen(roomId: state.pathParameters['id']!),
      ),

      // Driver-specific standalone
      GoRoute(
        path: AppRoutes.driverPhotos,
        builder: (context, state) => const VehiclePhotosScreen(),
      ),
      GoRoute(
        path: AppRoutes.driverInvite,
        builder: (context, state) => const InviteScreen(),
      ),

      // Search (endi standalone — drawer orqali)
      GoRoute(
        path: AppRoutes.dispatcherSearch,
        builder: (context, state) => const SearchScreen(),
      ),

      // Order detail — push notification tap orqali ochiladi
      GoRoute(
        path: '/orders/:id',
        builder: (context, state) =>
            OrderDetailScreen(orderId: state.pathParameters['id']!),
      ),

      // Dispatcher-specific standalone
      GoRoute(
        path: AppRoutes.dispatcherCreate,
        builder: (context, state) => const CreateOrderScreen(),
      ),
      GoRoute(
        path: AppRoutes.dispatcherTestr,
        builder: (context, state) => const TestrScreen(),
      ),
      GoRoute(
        path: AppRoutes.dispatcherSms,
        builder: (context, state) => const SmsScreen(),
      ),
      GoRoute(
        path: AppRoutes.dispatcherNumbers,
        builder: (context, state) => const NumbersScreen(),
      ),
      GoRoute(
        path: AppRoutes.dispatcherPosting,
        builder: (context, state) => const PostingScreen(),
      ),
      GoRoute(
        path: AppRoutes.dispatcherBlacklist,
        builder: (context, state) => const BlacklistScreen(),
      ),
      GoRoute(
        path: AppRoutes.dispatcherCreateAd,
        builder: (context, state) => const CreateAdScreen(),
      ),
      GoRoute(
        path: AppRoutes.dispatcherMyAds,
        builder: (context, state) => const MyAdsScreen(),
      ),
      GoRoute(
        path: '/dispatcher/match-drivers/:adId',
        builder: (context, state) =>
            MatchingDriversScreen(adId: state.pathParameters['adId']!),
      ),
      GoRoute(
        path: AppRoutes.dispatcherDriverOffers,
        builder: (context, state) => const DriverOffersListScreen(),
      ),
      GoRoute(
        path: AppRoutes.dispatcherSessions,
        builder: (context, state) => const SessionsScreen(),
      ),
      GoRoute(
        path: AppRoutes.addSession,
        builder: (context, state) => const AddSessionScreen(),
      ),
      GoRoute(
        path: AppRoutes.dispatcherStats,
        builder: (context, state) => const DispatcherStatsScreen(),
      ),
      GoRoute(
        path: AppRoutes.dispatcherProfile,
        builder: (context, state) => const DispatcherProfileScreen(),
      ),
      GoRoute(
        path: AppRoutes.driverRegister,
        builder: (context, state) => const DriverRegistrationScreen(),
      ),
      GoRoute(
        path: AppRoutes.driverBalanceTopup,
        builder: (context, state) => const BalanceScreen(),
      ),
    ],
  );
});

class ReklamaBotApp extends ConsumerWidget {
  const ReklamaBotApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    final themeMode = ref.watch(themeModeProvider);
    final isDark = themeMode == ThemeMode.dark;

    // Dynamic system chrome
    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
      systemNavigationBarColor: isDark ? AppTheme.darkCardBg : Colors.white,
      systemNavigationBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
    ));

    // FCM token registrar — auth bo'lganda tokenni backend'ga yuboradi
    ref.watch(fcmTokenRegistrarProvider);

    // FCM tap → router navigatsiyasi
    FcmService.onNotificationTap = (message) {
      try {
        final data = message.data;
        final type = data['type']?.toString();
        if (type == 'chat') {
          final chatRoomId = data['chatRoomId']?.toString();
          if (chatRoomId != null && chatRoomId.isNotEmpty) {
            final route = isDriverApp
                ? AppRoutes.driverChatRoom(chatRoomId)
                : AppRoutes.chatRoom(chatRoomId);
            router.push(route);
          }
        } else if (type == 'new_order' || type == 'order') {
          final orderId = data['orderId']?.toString();
          if (orderId != null && orderId.isNotEmpty) {
            router.push(AppRoutes.orderDetail(orderId));
          } else {
            router.push(isDriverApp ? AppRoutes.driverHome : AppRoutes.home);
          }
        }
      } catch (_) {}
    };

    // App ochilgandan keyin pending notification (cold start tap) ni qayta ishlash
    // + Version check (force update)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      FcmService.consumePendingNavigation();
      final ctx = router.routerDelegate.navigatorKey.currentContext;
      if (ctx != null) {
        VersionCheckService.checkAndShowDialog(ctx, ref.read(apiClientProvider));
      }
    });

    // Dispatcher app → Silk Road tema; Driver app → asl AppTheme (tegilmagan)
    final useSilk = isDispatcherApp;

    return MaterialApp.router(
      title: "YO'LDA",
      debugShowCheckedModeBanner: false,
      theme: useSilk ? SilkTheme.lightTheme : AppTheme.lightTheme,
      darkTheme: useSilk ? SilkTheme.darkTheme : AppTheme.darkTheme,
      themeMode: themeMode,
      routerConfig: router,
    );
  }
}
