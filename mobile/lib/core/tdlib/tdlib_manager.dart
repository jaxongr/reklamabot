import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'tdlib_session.dart';

/// Manages multiple TDLib sessions (up to 50).
///
/// This is the central hub for all TDLib-related operations.
/// Currently a placeholder architecture; actual TDLib native calls
/// will be integrated when the .so library is added.
class TdLibManager {
  /// Map of sessionId -> TdLibSession
  final Map<String, TdLibSession> _sessions = {};

  /// Maximum allowed sessions.
  static const int maxSessions = 50;

  /// TDLib API credentials (set from config/env).
  /// TODO: Move to a secure config
  int apiId = 0;
  String apiHash = '';

  /// Get all active sessions.
  List<TdLibSession> get activeSessions =>
      _sessions.values
          .where((s) => s.state == TdLibSessionState.ready)
          .toList();

  /// Get all sessions regardless of state.
  List<TdLibSession> get allSessions => _sessions.values.toList();

  /// Get a session by ID.
  TdLibSession? getSession(String sessionId) => _sessions[sessionId];

  /// Create a new TDLib session.
  Future<TdLibSession> createSession({
    required String sessionId,
    required String phone,
    String? displayName,
  }) async {
    if (_sessions.length >= maxSessions) {
      throw Exception(
        'Maksimal sessiya soni ($maxSessions) ga yetildi',
      );
    }

    if (_sessions.containsKey(sessionId)) {
      return _sessions[sessionId]!;
    }

    final session = TdLibSession(
      sessionId: sessionId,
      phone: phone,
      displayName: displayName,
    );

    await session.initialize();
    _sessions[sessionId] = session;
    return session;
  }

  /// Remove a session and cleanup its resources.
  Future<void> removeSession(String sessionId) async {
    final session = _sessions[sessionId];
    if (session != null) {
      await session.destroy();
      _sessions.remove(sessionId);
    }
  }

  /// Get groups from all active sessions (combined, deduplicated).
  Future<List<Map<String, dynamic>>> getAllGroups() async {
    final allGroups = <Map<String, dynamic>>[];
    final seenIds = <String>{};

    for (final session in activeSessions) {
      final groups = await session.getGroups();
      for (final group in groups) {
        final gid = group['telegramId'] as String? ?? '';
        if (!seenIds.contains(gid)) {
          seenIds.add(gid);
          allGroups.add({...group, 'sessionId': session.sessionId});
        }
      }
    }
    return allGroups;
  }

  /// Send a message using the best available session.
  Future<bool> sendMessage({
    required String chatId,
    required String text,
    List<String>? mediaUrls,
    String? preferredSessionId,
  }) async {
    // Try the preferred session first
    if (preferredSessionId != null) {
      final session = _sessions[preferredSessionId];
      if (session != null && session.state == TdLibSessionState.ready) {
        return session.sendMessage(
          chatId: chatId,
          text: text,
          mediaUrls: mediaUrls,
        );
      }
    }

    // Fall back to any active session
    for (final session in activeSessions) {
      final result = await session.sendMessage(
        chatId: chatId,
        text: text,
        mediaUrls: mediaUrls,
      );
      if (result) return true;
    }

    return false;
  }

  /// Close all sessions and release resources.
  Future<void> closeAll() async {
    for (final session in _sessions.values) {
      await session.close();
    }
    _sessions.clear();
  }

  /// Dispose the manager.
  Future<void> dispose() async {
    await closeAll();
  }
}

/// Provider for the TDLib manager (singleton for the app lifetime).
final tdLibManagerProvider = Provider<TdLibManager>((ref) {
  final manager = TdLibManager();
  ref.onDispose(() => manager.dispose());
  return manager;
});
