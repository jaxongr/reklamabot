import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/api_config.dart';
import '../../core/api/api_client.dart';
import '../../core/api/websocket_client.dart';

/// Broadcast progress status.
enum BroadcastStatus { idle, sending, completed, error }

/// Per-order broadcast result (persistent — survives banner auto-clear).
class BroadcastResult {
  final int sent;
  final int total;
  final int failed;
  final int skipped;
  final int sessionCount;
  final int uniqueGroupsSent;
  final DateTime completedAt;

  const BroadcastResult({
    required this.sent,
    required this.total,
    required this.failed,
    required this.skipped,
    required this.sessionCount,
    required this.uniqueGroupsSent,
    required this.completedAt,
  });
}

/// State for real-time broadcast progress tracking.
class BroadcastProgressState {
  final BroadcastStatus status;
  final int sent;
  final int total;
  final int failed;
  final int skipped;
  final int sessionCount;
  final int uniqueGroupsSent;
  final String? orderId;
  final DateTime? cooldownUntil;
  final int cooldownSeconds;
  final String? errorMessage;
  /// Per-order completed broadcast results (persistent).
  final Map<String, BroadcastResult> lastResults;

  const BroadcastProgressState({
    this.status = BroadcastStatus.idle,
    this.sent = 0,
    this.total = 0,
    this.failed = 0,
    this.skipped = 0,
    this.sessionCount = 0,
    this.uniqueGroupsSent = 0,
    this.orderId,
    this.cooldownUntil,
    this.cooldownSeconds = 0,
    this.errorMessage,
    this.lastResults = const {},
  });

  bool get isSending => status == BroadcastStatus.sending;
  bool get isCompleted => status == BroadcastStatus.completed;
  bool get isError => status == BroadcastStatus.error;
  bool get isIdle => status == BroadcastStatus.idle;
  bool get hasCooldown => cooldownSeconds > 0;

  double get progressPercent =>
      total > 0 ? (sent / total).clamp(0.0, 1.0) : 0.0;

  String get cooldownFormatted {
    final m = cooldownSeconds ~/ 60;
    final s = cooldownSeconds % 60;
    return '$m:${s.toString().padLeft(2, '0')}';
  }

  BroadcastProgressState copyWith({
    BroadcastStatus? status,
    int? sent,
    int? total,
    int? failed,
    int? skipped,
    int? sessionCount,
    int? uniqueGroupsSent,
    String? orderId,
    DateTime? cooldownUntil,
    int? cooldownSeconds,
    String? errorMessage,
    Map<String, BroadcastResult>? lastResults,
  }) {
    return BroadcastProgressState(
      status: status ?? this.status,
      sent: sent ?? this.sent,
      total: total ?? this.total,
      failed: failed ?? this.failed,
      skipped: skipped ?? this.skipped,
      sessionCount: sessionCount ?? this.sessionCount,
      uniqueGroupsSent: uniqueGroupsSent ?? this.uniqueGroupsSent,
      orderId: orderId ?? this.orderId,
      cooldownUntil: cooldownUntil ?? this.cooldownUntil,
      cooldownSeconds: cooldownSeconds ?? this.cooldownSeconds,
      errorMessage: errorMessage ?? this.errorMessage,
      lastResults: lastResults ?? this.lastResults,
    );
  }
}

/// Notifier that listens to WS find-driver:progress events and manages cooldown.
class BroadcastProgressNotifier extends StateNotifier<BroadcastProgressState> {
  final WebSocketClient _ws;
  final ApiClient _api;
  StreamSubscription<WsEvent>? _wsSub;
  Timer? _cooldownTimer;
  Timer? _autoClearTimer;

  Timer? _staleTimer;

  BroadcastProgressNotifier(this._ws, this._api) : super(const BroadcastProgressState()) {
    _listenWs();
    // App ochilganda serverdan faol broadcast bor-yo'qligini tekshirish
    // Kechikish bilan — auth token tayyor bo'lishi uchun
    _checkWithRetry();
  }

  /// Retrylar bilan tekshirish — 1s, 4s, 10s keyin
  void _checkWithRetry() {
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) _checkActiveBroadcast(retryOnIdle: true);
    });
  }

  int _retryCount = 0;

  /// Serverdan faol broadcast status'ini tekshirish (app qayta ochilganda)
  Future<void> _checkActiveBroadcast({bool retryOnIdle = false}) async {
    try {
      final resp = await _api.get(ApiConfig.ordersBroadcastStatus);
      final data = resp.data as Map<String, dynamic>?;
      if (data == null) {
        if (retryOnIdle && _retryCount < 2) _scheduleRetry();
        return;
      }

      final status = data['status'] as String?;
      if (status == 'in_progress') {
        _retryCount = 0;
        state = state.copyWith(
          status: BroadcastStatus.sending,
          orderId: data['orderId'] as String?,
          sent: (data['sent'] as num?)?.toInt() ?? 0,
          failed: (data['failed'] as num?)?.toInt() ?? 0,
          skipped: (data['skipped'] as num?)?.toInt() ?? 0,
          total: (data['total'] as num?)?.toInt() ?? 0,
          sessionCount: (data['sessionCount'] as num?)?.toInt() ?? 0,
          uniqueGroupsSent: (data['uniqueGroupsSent'] as num?)?.toInt() ?? 0,
        );
        _resetStaleTimer();
      } else if (status == 'completed') {
        _retryCount = 0;
        final sentCount = (data['sent'] as num?)?.toInt() ?? 0;
        final totalCount = (data['total'] as num?)?.toInt() ?? 0;
        final failedCount = (data['failed'] as num?)?.toInt() ?? 0;
        final skippedCount = (data['skipped'] as num?)?.toInt() ?? 0;
        final sessCount = (data['sessionCount'] as num?)?.toInt() ?? 0;
        final uniqueCount = (data['uniqueGroupsSent'] as num?)?.toInt() ?? 0;
        final eventOrderId = data['orderId'] as String?;

        final updatedResults = Map<String, BroadcastResult>.from(state.lastResults);
        if (eventOrderId != null) {
          updatedResults[eventOrderId] = BroadcastResult(
            sent: sentCount,
            total: totalCount,
            failed: failedCount,
            skipped: skippedCount,
            sessionCount: sessCount,
            uniqueGroupsSent: uniqueCount,
            completedAt: DateTime.now(),
          );
        }

        state = state.copyWith(
          status: BroadcastStatus.completed,
          orderId: eventOrderId,
          sent: sentCount,
          failed: failedCount,
          skipped: skippedCount,
          total: totalCount,
          sessionCount: sessCount,
          uniqueGroupsSent: uniqueCount,
          lastResults: updatedResults,
        );
        // Auto-clear after 8s
        _autoClearTimer?.cancel();
        _autoClearTimer = Timer(const Duration(seconds: 8), () {
          if (mounted) {
            state = BroadcastProgressState(
              status: BroadcastStatus.idle,
              lastResults: state.lastResults,
            );
          }
        });
      } else {
        // idle — retry qilish mumkin (token hali tayyor emas yoki WS ulanmagan)
        if (retryOnIdle && _retryCount < 2) _scheduleRetry();
      }
    } catch (_) {
      // Xatolik — retry qilish
      if (retryOnIdle && _retryCount < 2) _scheduleRetry();
    }
  }

  void _scheduleRetry() {
    _retryCount++;
    final delay = _retryCount == 1 ? 3 : 8;
    Future.delayed(Duration(seconds: delay), () {
      if (mounted && state.isIdle) {
        _checkActiveBroadcast(retryOnIdle: true);
      }
    });
  }

  StreamSubscription<WsEvent>? _reconnectSub;

  void _listenWs() {
    _wsSub = _ws.events
        .where((e) => e.type == WsEventType.findDriverProgress)
        .listen(_handleProgress);

    // WS qayta ulanganda — serverdan broadcast status tekshirish
    _reconnectSub = _ws.events
        .where((e) => e.type == WsEventType.wsConnected)
        .listen((_) {
      if (mounted && state.isIdle) {
        _checkActiveBroadcast();
      }
    });
  }

  /// Stale timer — agar 90s ichida hech qanday WS event kelmasa, serverdan qayta tekshirish
  void _resetStaleTimer() {
    _staleTimer?.cancel();
    if (state.isSending) {
      _staleTimer = Timer(const Duration(seconds: 90), () {
        if (mounted && state.isSending) {
          // 90s ichida hech narsa kelmadi — serverdan qayta so'rash
          _checkActiveBroadcast();
        }
      });
    }
  }

  void _handleProgress(WsEvent event) {
    final d = event.data;
    final statusStr = d['status'] as String? ?? 'in_progress';

    // orderId har doim event'dan olinadi (backend barcha eventlarda yuboradi)
    final eventOrderId = d['orderId'] as String? ?? state.orderId;

    if (statusStr == 'completed') {
      _staleTimer?.cancel();
      final sentCount = (d['sent'] as num?)?.toInt() ?? state.sent;
      final failedCount = (d['failed'] as num?)?.toInt() ?? state.failed;
      final skippedCount = (d['skipped'] as num?)?.toInt() ?? state.skipped;
      final totalCount = (d['total'] as num?)?.toInt() ?? state.total;
      final sessCount = (d['sessionCount'] as num?)?.toInt() ?? state.sessionCount;
      final uniqueCount = (d['uniqueGroupsSent'] as num?)?.toInt() ?? state.uniqueGroupsSent;

      // Save persistent result for this order
      final updatedResults = Map<String, BroadcastResult>.from(state.lastResults);
      if (eventOrderId != null) {
        updatedResults[eventOrderId!] = BroadcastResult(
          sent: sentCount,
          total: totalCount,
          failed: failedCount,
          skipped: skippedCount,
          sessionCount: sessCount,
          uniqueGroupsSent: uniqueCount,
          completedAt: DateTime.now(),
        );
      }

      state = state.copyWith(
        status: BroadcastStatus.completed,
        orderId: eventOrderId,
        sent: sentCount,
        failed: failedCount,
        skipped: skippedCount,
        total: totalCount,
        sessionCount: sessCount,
        uniqueGroupsSent: uniqueCount,
        lastResults: updatedResults,
      );
      // Auto-clear banner after 8 seconds (cooldown saqlash)
      _autoClearTimer?.cancel();
      _autoClearTimer = Timer(const Duration(seconds: 8), () {
        if (mounted) {
          // Cooldown davom etsa — faqat status idle, lekin cooldown qolsin
          state = BroadcastProgressState(
            status: BroadcastStatus.idle,
            orderId: state.orderId,
            cooldownUntil: state.cooldownUntil,
            cooldownSeconds: state.cooldownSeconds,
            lastResults: state.lastResults,
          );
        }
      });
    } else if (statusStr == 'error') {
      _staleTimer?.cancel();
      state = state.copyWith(
        status: BroadcastStatus.error,
        orderId: eventOrderId,
        errorMessage: d['error'] as String?,
      );
      _autoClearTimer?.cancel();
      _autoClearTimer = Timer(const Duration(seconds: 6), () {
        if (mounted) {
          state = BroadcastProgressState(
            status: BroadcastStatus.idle,
            orderId: state.orderId,
            cooldownUntil: state.cooldownUntil,
            cooldownSeconds: state.cooldownSeconds,
            lastResults: state.lastResults,
          );
        }
      });
    } else {
      // in_progress
      state = state.copyWith(
        status: BroadcastStatus.sending,
        orderId: eventOrderId,
        sent: (d['sent'] as num?)?.toInt() ?? state.sent,
        failed: (d['failed'] as num?)?.toInt() ?? state.failed,
        skipped: (d['skipped'] as num?)?.toInt() ?? state.skipped,
        total: (d['total'] as num?)?.toInt() ?? state.total,
        sessionCount: (d['sessionCount'] as num?)?.toInt() ?? state.sessionCount,
        uniqueGroupsSent: (d['uniqueGroupsSent'] as num?)?.toInt() ?? state.uniqueGroupsSent,
      );
      // Har bir WS event kelganda stale timer qayta boshlanadi
      _resetStaleTimer();
    }
  }

  /// Called after API responds — sets cooldownUntil and starts timer.
  /// [totalGroups] and [sessionCount] from API response — banner darhol ko'rsatish uchun.
  void startBroadcast(String orderId, String? cooldownUntilIso, {int totalGroups = 0, int sessionCount = 0}) {
    DateTime? cooldownUntil;
    if (cooldownUntilIso != null) {
      cooldownUntil = DateTime.tryParse(cooldownUntilIso);
    }

    state = BroadcastProgressState(
      status: BroadcastStatus.sending,
      orderId: orderId,
      total: totalGroups,
      sessionCount: sessionCount,
      cooldownUntil: cooldownUntil,
      cooldownSeconds: cooldownUntil != null
          ? cooldownUntil.difference(DateTime.now()).inSeconds.clamp(0, 300)
          : 0,
      lastResults: state.lastResults,
    );

    _startCooldownTimer();
    _resetStaleTimer();
  }

  void _startCooldownTimer() {
    _cooldownTimer?.cancel();
    if (state.cooldownUntil == null) return;

    _cooldownTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) {
        _cooldownTimer?.cancel();
        return;
      }
      final remaining =
          state.cooldownUntil!.difference(DateTime.now()).inSeconds;
      if (remaining <= 0) {
        state = state.copyWith(cooldownSeconds: 0);
        _cooldownTimer?.cancel();
      } else {
        state = state.copyWith(cooldownSeconds: remaining);
      }
    });
  }

  /// API javobidan cooldown olish va timer boshlash.
  void setCooldown(String cooldownUntilIso) {
    final cooldownUntil = DateTime.tryParse(cooldownUntilIso);
    if (cooldownUntil == null) return;

    state = state.copyWith(
      cooldownUntil: cooldownUntil,
      cooldownSeconds: cooldownUntil.difference(DateTime.now()).inSeconds.clamp(0, 300),
    );
    _startCooldownTimer();
  }

  /// API xatolik bo'lganda.
  void setError(String message) {
    state = state.copyWith(
      status: BroadcastStatus.error,
      errorMessage: message,
    );
    _autoClearTimer?.cancel();
    _autoClearTimer = Timer(const Duration(seconds: 6), () {
      if (mounted) {
        state = state.copyWith(status: BroadcastStatus.idle);
      }
    });
  }

  /// Check if a specific order is in cooldown.
  bool isInCooldown() {
    return state.cooldownUntil != null &&
        DateTime.now().isBefore(state.cooldownUntil!);
  }

  /// To'xtatish tugmasi bosilganda — holatni tozalash.
  void reset() {
    _cooldownTimer?.cancel();
    _autoClearTimer?.cancel();
    _staleTimer?.cancel();
    state = const BroadcastProgressState();
  }

  @override
  void dispose() {
    _wsSub?.cancel();
    _reconnectSub?.cancel();
    _cooldownTimer?.cancel();
    _autoClearTimer?.cancel();
    _staleTimer?.cancel();
    super.dispose();
  }
}

/// Provider for broadcast progress — auto-connects to WS events + server status tekshirish.
final broadcastProgressProvider =
    StateNotifierProvider<BroadcastProgressNotifier, BroadcastProgressState>(
        (ref) {
  final ws = ref.read(wsClientProvider);
  final api = ref.read(apiClientProvider);
  return BroadcastProgressNotifier(ws, api);
});
