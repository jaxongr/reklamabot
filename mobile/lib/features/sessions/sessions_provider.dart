import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/api_config.dart';
import '../../core/api/api_client.dart';
import '../../core/models/session_model.dart';

/// State for the sessions list.
class SessionsState {
  final List<SessionModel> sessions;
  final bool isLoading;
  final String? error;
  final Map<String, bool> connectionStatus; // sessionId -> isConnected

  const SessionsState({
    this.sessions = const [],
    this.isLoading = false,
    this.error,
    this.connectionStatus = const {},
  });

  SessionsState copyWith({
    List<SessionModel>? sessions,
    bool? isLoading,
    String? error,
    Map<String, bool>? connectionStatus,
  }) {
    return SessionsState(
      sessions: sessions ?? this.sessions,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      connectionStatus: connectionStatus ?? this.connectionStatus,
    );
  }
}

/// State for adding a new session.
class AddSessionState {
  final String phone;
  final AddSessionStep step;
  final bool isLoading;
  final String? error;
  final String? sessionId;

  const AddSessionState({
    this.phone = '',
    this.step = AddSessionStep.phone,
    this.isLoading = false,
    this.error,
    this.sessionId,
  });

  AddSessionState copyWith({
    String? phone,
    AddSessionStep? step,
    bool? isLoading,
    String? error,
    String? sessionId,
  }) {
    return AddSessionState(
      phone: phone ?? this.phone,
      step: step ?? this.step,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      sessionId: sessionId ?? this.sessionId,
    );
  }
}

enum AddSessionStep {
  phone,
  code,
  password,
  syncing,
  done,
}

/// Notifier for sessions list management.
class SessionsNotifier extends StateNotifier<SessionsState> {
  final ApiClient _api;

  SessionsNotifier(this._api) : super(const SessionsState()) {
    loadSessions();
  }

  Future<void> loadSessions() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _api.get(ApiConfig.sessions);
      final data = response.data;
      List<dynamic> list;
      if (data is List) {
        list = data;
      } else if (data is Map<String, dynamic>) {
        list = (data['data'] as List?) ?? [];
      } else {
        list = [];
      }

      final sessions = list
          .map((e) => SessionModel.fromJson(e as Map<String, dynamic>))
          .toList();

      state = state.copyWith(sessions: sessions, isLoading: false);

      // Load connection status in background
      _loadConnectionStatus();
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Sessiyalarni yuklashda xatolik',
      );
    }
  }

  Future<void> _loadConnectionStatus() async {
    try {
      final response = await _api.get(ApiConfig.connectionStatus);
      final data = response.data;
      if (data is Map<String, dynamic>) {
        final status = <String, bool>{};
        data.forEach((key, value) {
          if (value is bool) {
            status[key] = value;
          } else if (value is Map) {
            status[key] = value['connected'] == true;
          }
        });
        state = state.copyWith(connectionStatus: status);
      }
    } catch (_) {
      // Non-critical, ignore
    }
  }

  Future<void> syncSession(String sessionId) async {
    try {
      await _api.post(ApiConfig.sessionSync(sessionId));
      await loadSessions();
    } catch (e) {
      state = state.copyWith(error: 'Sinxronlashda xatolik');
    }
  }

  Future<void> freezeSession(String sessionId) async {
    try {
      await _api.post(ApiConfig.sessionFreeze(sessionId));
      await loadSessions();
    } catch (e) {
      state = state.copyWith(error: 'Muzlatishda xatolik');
    }
  }

  Future<void> unfreezeSession(String sessionId) async {
    try {
      await _api.post(ApiConfig.sessionUnfreeze(sessionId));
      await loadSessions();
    } catch (e) {
      state = state.copyWith(error: 'Eritishda xatolik');
    }
  }

  Future<void> deleteSession(String sessionId) async {
    try {
      await _api.delete(ApiConfig.sessionById(sessionId));
      state = state.copyWith(
        sessions:
            state.sessions.where((s) => s.id != sessionId).toList(),
      );
    } catch (e) {
      state = state.copyWith(error: 'O\'chirishda xatolik');
    }
  }
}

/// Notifier for the add session flow.
class AddSessionNotifier extends StateNotifier<AddSessionState> {
  final ApiClient _api;
  String? _lastCode; // oxirgi yuborilgan kod (2FA uchun kerak)

  AddSessionNotifier(this._api) : super(const AddSessionState());

  void setPhone(String phone) {
    state = state.copyWith(phone: phone);
  }

  /// Step 1: Telefon raqam yuborish → Telegram dan kod so'rash.
  Future<void> sendPhone(String phone) async {
    state = state.copyWith(isLoading: true, error: null, phone: phone);
    try {
      final response = await _api.post(
        ApiConfig.sessionSendCode,
        data: {'phone': phone, 'name': 'Session ${phone.substring(phone.length > 4 ? phone.length - 4 : 0)}'},
      );

      final data = response.data as Map<String, dynamic>;
      final sessionId = data['sessionId'] as String;

      state = state.copyWith(
        sessionId: sessionId,
        step: AddSessionStep.code,
        isLoading: false,
      );
    } catch (e) {
      final errMsg = e.toString();
      String errorText;
      if (errMsg.contains('PHONE_NUMBER_INVALID')) {
        errorText = 'Telefon raqam noto\'g\'ri. +998XXXXXXXXX formatda kiriting.';
      } else if (errMsg.contains('FLOOD') || errMsg.contains('flood')) {
        errorText = 'Juda ko\'p urinish. Bir ozdan keyin qayta urinib ko\'ring.';
      } else {
        errorText = 'Telefon raqamni yuborishda xatolik. Qayta urinib ko\'ring.';
      }
      state = state.copyWith(
        isLoading: false,
        error: errorText,
      );
    }
  }

  /// Step 2: Kodni tasdiqlash → Telegram sign-in.
  Future<void> sendCode(String code) async {
    state = state.copyWith(isLoading: true, error: null);
    _lastCode = code;
    try {
      final res = await _api.post(
        ApiConfig.sessionSignIn(state.sessionId!),
        data: {'code': code},
      );

      // Backend xato qaytarishi mumkin (200 status, lekin error field bor)
      final data = res.data;
      if (data is Map && data['error'] != null) {
        final err = data['error'].toString();
        if (err.contains('2FA') || err.contains('PASSWORD')) {
          state = state.copyWith(step: AddSessionStep.password, isLoading: false);
          return;
        }
        if (err.contains('EXPIRED') || err.contains('RESEND')) {
          state = state.copyWith(isLoading: false, error: data['message']?.toString() ?? 'Kod muddati o\'tgan.');
          return;
        }
        state = state.copyWith(isLoading: false, error: data['message']?.toString() ?? 'Xatolik yuz berdi.');
        return;
      }

      // Muvaffaqiyatli — guruhlarni avtomatik sinxronlash
      state = state.copyWith(step: AddSessionStep.syncing, isLoading: true);
      await _syncGroups();
      state = state.copyWith(step: AddSessionStep.done, isLoading: false);
    } catch (e) {
      final errMsg = e.toString();
      if (errMsg.contains('2FA_REQUIRED') || errMsg.contains('PASSWORD')) {
        state = state.copyWith(step: AddSessionStep.password, isLoading: false);
      } else if (errMsg.contains('RESEND_CODE') || errMsg.contains('EXPIRED')) {
        state = state.copyWith(isLoading: false, error: 'Kod muddati o\'tgan. Yangi kod yuborildi.');
      } else {
        state = state.copyWith(isLoading: false, error: 'Kod noto\'g\'ri yoki muddati o\'tgan.');
      }
    }
  }

  /// Step 2.5: 2FA parol yuborish.
  Future<void> sendPassword(String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final res = await _api.post(
        ApiConfig.sessionSignIn(state.sessionId!),
        data: {'code': _lastCode ?? '', 'password': password},
      );

      final data = res.data;
      if (data is Map && data['error'] != null) {
        state = state.copyWith(isLoading: false, error: data['message']?.toString() ?? 'Parol noto\'g\'ri.');
        return;
      }

      // Muvaffaqiyatli — guruhlarni avtomatik sinxronlash
      state = state.copyWith(step: AddSessionStep.syncing, isLoading: true);
      await _syncGroups();
      state = state.copyWith(step: AddSessionStep.done, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Parol noto\'g\'ri. Qayta urinib ko\'ring.');
    }
  }

  /// Guruhlarni avtomatik sinxronlash
  Future<void> _syncGroups() async {
    if (state.sessionId == null) return;
    try {
      await _api.post(ApiConfig.sessionSync(state.sessionId!));
    } catch (_) {
      // Sync xato bersa ham davom etamiz — session yaratilgan
    }
  }

  /// Reset the state to start over.
  void reset() {
    _lastCode = null;
    state = const AddSessionState();
  }
}

/// Provider for sessions list.
final sessionsProvider =
    StateNotifierProvider<SessionsNotifier, SessionsState>((ref) {
  final api = ref.read(apiClientProvider);
  return SessionsNotifier(api);
});

/// Provider for add session flow.
final addSessionProvider =
    StateNotifierProvider.autoDispose<AddSessionNotifier, AddSessionState>(
        (ref) {
  final api = ref.read(apiClientProvider);
  return AddSessionNotifier(api);
});
