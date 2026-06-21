/// Route path constants for the Yo'lda app navigation.
class AppRoutes {
  AppRoutes._();

  // ── Auth ──
  static const String login = '/login';
  static const String roleSelect = '/role-select';

  // ── Dispatcher shell (5 bottom tabs) ──
  static const String home = '/home';
  static const String accepted = '/accepted';
  static const String dispatcherSearch = '/search';
  static const String dispatcherMap = '/map';
  static const String chat = '/chat';
  static String chatRoom(String id) => '/chat/$id';
  static const String balance = '/balance';

  // ── Driver shell (5 bottom tabs) ──
  static const String driverHome = '/driver/home';
  static const String driverAccepted = '/driver/accepted';
  static const String driverOffer = '/driver/offer';
  static const String driverChat = '/driver/chat';
  static String driverChatRoom(String id) => '/driver/chat/$id';
  static const String driverBalance = '/driver/balance';

  // ── Standalone screens (push-only, no bottom nav) ──
  static const String archive = '/archive';
  static const String notifications = '/notifications';
  static String orderDetail(String id) => '/orders/$id';
  static const String support = '/support';
  static String supportDetail(String id) => '/support/$id';
  static const String subscribe = '/subscribe';
  static const String settingsPage = '/settings-page';

  // ── Driver profile (bottom tab) ──
  static const String driverProfileTab = '/driver/profile';

  // ── Driver-specific standalone ──
  static const String driverPhotos = '/driver/photos';
  static const String driverInvite = '/driver/invite';

  // ── Dispatcher-specific standalone ──
  static const String dispatcherCreate = '/dispatcher/create';
  static const String dispatcherTestr = '/dispatcher/testr';
  static const String dispatcherSms = '/dispatcher/sms';
  static const String dispatcherNumbers = '/dispatcher/numbers';
  static const String dispatcherPosting = '/dispatcher/posting';
  static const String dispatcherCreateAd = '/dispatcher/create-ad';
  static const String dispatcherMyAds = '/dispatcher/my-ads';
  static const String dispatcherDriverOffers = '/dispatcher/driver-offers';
  static const String dispatcherBlacklist = '/dispatcher/blacklist';
  static const String dispatcherSessions = '/dispatcher/sessions';
  static const String addSession = '/dispatcher/sessions/add';
  static const String dispatcherStats = '/dispatcher/stats';
  static const String dispatcherProfile = '/dispatcher/profile';
  static String dispatcherMatchDrivers(String adId) => '/dispatcher/match-drivers/$adId';
  static const String driverRegister = '/driver/register';
  static const String driverBalanceTopup = '/driver/balance-topup';

  // ── Legacy (backward compat) ──
  static const String dashboard = '/home';
  static const String orders = '/home';
  static const String driverOrders = '/driver/home';
  static const String driverProfile = '/driver/profile';
  static const String driverSettings = '/driver/profile';
  static const String settings = '/settings-page';
  static const String marketplace = '/home';
}
