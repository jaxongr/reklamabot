/// API configuration constants for the Reklama Bot backend.
class ApiConfig {
  ApiConfig._();

  /// Default base URL - can be overridden via settings
  static const String defaultBaseUrl = 'https://logistikapro.uz';

  /// API prefix
  static const String apiPrefix = '/api/v1';

  /// Auth endpoints
  static const String login = '/auth/login';
  static const String driverLogin = '/auth/driver-login';
  static const String driverLoginPassword = '/auth/driver-login-password';
  static const String driverSetPassword = '/auth/driver-set-password';
  static const String driverSendCode = '/auth/driver-send-code';
  static const String refreshToken = '/auth/refresh';
  static const String logout = '/auth/logout';
  static const String profile = '/auth/profile';

  /// Session endpoints
  static const String sessions = '/sessions';
  static String sessionById(String id) => '/sessions/$id';
  static const String sessionSendCode = '/sessions/send-code';
  static String sessionSignIn(String id) => '/sessions/$id/sign-in';
  static String sessionSync(String id) => '/sessions/$id/sync';
  static String sessionFreeze(String id) => '/sessions/$id/freeze';
  static String sessionUnfreeze(String id) => '/sessions/$id/unfreeze';
  static String sessionGroups(String id) => '/sessions/$id/groups';
  static String sessionStatistics(String id) => '/sessions/$id/statistics';
  static const String connectionStatus = '/sessions/connection-status';

  /// Ads endpoints
  static const String ads = '/ads';
  static String adById(String id) => '/ads/$id';
  static String adPublish(String id) => '/ads/$id/publish';
  static String adPause(String id) => '/ads/$id/pause';
  static String adClose(String id) => '/ads/$id/close';
  static String adDuplicate(String id) => '/ads/$id/duplicate';
  static String adStatistics(String id) => '/ads/$id/statistics';
  static const String adsDashboardStats = '/ads/stats';

  /// Posts / Posting endpoints
  static const String posts = '/posts';
  static String postById(String id) => '/posts/$id';
  static String postStart(String id) => '/posts/$id/start';
  static String postPause(String id) => '/posts/$id/pause';
  static String postResume(String id) => '/posts/$id/resume';
  static String postCancel(String id) => '/posts/$id/cancel';
  static String postRetry(String id) => '/posts/$id/retry';
  static String startPosting(String adId) => '/posts/start-posting/$adId';
  static String stopPosting(String adId) => '/posts/stop-posting/$adId';
  static String postingStatus(String adId) => '/posts/posting-status/$adId';
  static const String postStatistics = '/posts/statistics';

  /// Analytics endpoints
  static const String analyticsDashboard = '/analytics/dashboard';
  static const String analyticsUsers = '/analytics/users';
  static const String analyticsAds = '/analytics/ads';
  static const String analyticsPosts = '/analytics/posts';
  static const String analyticsRoutes = '/analytics/routes';
  static const String analyticsVehicleTypes = '/analytics/vehicle-types';
  static const String analyticsDayRoutes = '/analytics/day-routes';
  static const String analyticsPriceEstimate = '/analytics/price-estimate';

  /// Users endpoints
  static const String users = '/users';
  static const String userAdPhones = '/users/ad-phones';
  static const String userLineStatus = '/users/line-status';
  static const String userLocation = '/users/me/location';
  static const String adminDispatchersOnline = '/users/admin/dispatchers/online';

  /// Payments endpoints
  static const String payments = '/payments';

  /// Subscriptions endpoints
  static const String subscriptions = '/subscriptions';

  /// Orders endpoints
  static const String orders = '/orders';
  static String orderById(String id) => '/orders/$id';
  static String orderStatus(String id) => '/orders/$id/status';
  static String orderAccept(String id) => '/orders/$id/accept';
  static String orderCloseDeal(String id) => '/orders/$id/close-deal';
  static String orderFindDriver(String id) => '/orders/$id/find-driver';
  static const String orderStats = '/orders/stats';
  static const String ordersForSale = '/orders/for-sale';
  static const String ordersAccepted = '/orders/accepted';
  static const String ordersClosedDeals = '/orders/closed-deals';
  static const String ordersMyOrders = '/orders/my';
  static const String ordersStopBroadcast = '/orders/stop-broadcast';
  static const String ordersBroadcastStatus = '/orders/broadcast-status';
  static const String citySuggestions = '/orders/city-suggestions';

  /// Blacklisted groups endpoints (Qora ro'yxat)
  static const String blacklistedGroups = '/config/blacklisted-groups';
  static String removeBlacklistedGroup(String telegramId) =>
      '/config/blacklisted-groups/$telegramId';

  /// Rating endpoints
  static const String rateUser = '/drivers/rate';
  static String getUserRating(String userId) => '/drivers/rating/$userId';

  /// Blocked users endpoints
  static const String blockedUsers = '/blocked-users';
  static const String blockedUsersStats = '/blocked-users/stats';
  static String unblockUser(String id) => '/blocked-users/$id/unblock';

  /// Driver matching endpoint (dispetcher e'loni uchun)
  static String matchDriversForAd(String adId) => '/drivers/match-for-ad/$adId';

  /// Driver endpoints
  static const String driverProfile = '/drivers/profile';
  static const String driverOnline = '/drivers/online';
  static const String driverLocation = '/drivers/location';
  static const String driverOrders = '/drivers/orders';
  static String driverOrderById(String id) => '/drivers/orders/$id';
  static String driverAcceptOrder(String id) => '/drivers/orders/$id/accept';
  static String driverTrackingStatus(String id) => '/drivers/orders/$id/tracking';
  static const String driverAcceptedOrders = '/drivers/orders/accepted';
  static const String driverSubscriptionPlans = '/drivers/subscription/plans';
  static const String driverSubscriptionMy = '/drivers/subscription/my';
  static const String driverSubscriptionPurchase = '/drivers/subscription/purchase';
  static const String driverOffers = '/drivers/offers';
  static const String driverOffersCreate = '/drivers/offers';
  static const String driverOffersMy = '/drivers/offers/my';
  static String driverOfferCancel(String id) => '/drivers/offers/$id';
  static const String driverPrivateOrders = '/drivers/private-orders';
  static String driverPrivateOrderAccept(String id) => '/drivers/private-orders/$id/accept';
  static String driverPrivateOrderReject(String id) => '/drivers/private-orders/$id/reject';
  static const String driverPhotos = '/drivers/photos';
  static String driverPhotoUpload(String type) => '/drivers/photos/$type';
  static const String driverReferral = '/drivers/referral';
  static const String driverInviteStats = '/drivers/invite-stats';

  /// Notifications endpoints
  static const String notifications = '/notifications';
  static String notificationRead(String id) => '/notifications/$id/read';
  static const String fcmToken = '/notifications/fcm-token';

  /// Chat endpoints
  static const String chatRooms = '/chat/rooms';
  static String chatRoom(String id) => '/chat/rooms/$id';
  static String chatMessages(String roomId) => '/chat/rooms/$roomId/messages';
  static const String chatCreateRoom = '/chat/rooms';
  static const String chatCreateSupportRoom = '/chat/rooms/support';

  /// Support endpoints
  static const String supportTickets = '/support/tickets';
  static String supportTicket(String id) => '/support/tickets/$id';
  static String supportMessages(String id) => '/support/tickets/$id/messages';

  /// Balance endpoints
  static const String balance = '/balance';
  static const String balanceTopUp = '/balance/top-up';
  static const String balanceTransactions = '/balance/transactions';

  /// File upload endpoint (multipart 'file' → { url })
  static const String uploadReceipt = '/upload/receipt';

  /// WebSocket endpoint
  static const String wsEndpoint = '/ws';

  /// Connection timeout in milliseconds
  static const int connectTimeout = 15000;

  /// Receive timeout in milliseconds
  static const int receiveTimeout = 30000;
}
