import 'dart:async';
import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:socket_io_client/socket_io_client.dart' as io;

import '../../config/api_config.dart';
import 'api_client.dart';

/// WebSocket event types received from the backend.
enum WsEventType {
  postingProgress,
  postingComplete,
  postingError,
  postingUpdate,
  postingCommand,
  sessionStatus,
  sessionUpdate,
  orderNew,
  orderUpdate,
  orderStats,
  deviceStatus,
  notification,
  findDriverProgress,
  tgDispatcherNew,
  dispatcherAdNew,
  wsConnected,
  unknown,
}

/// Parsed WebSocket event.
class WsEvent {
  final WsEventType type;
  final Map<String, dynamic> data;

  const WsEvent({required this.type, required this.data});

  factory WsEvent.fromType(String eventStr, Map<String, dynamic> data) {
    WsEventType type;
    switch (eventStr) {
      case 'posting:progress':
        type = WsEventType.postingProgress;
      case 'posting:complete':
        type = WsEventType.postingComplete;
      case 'posting:error':
        type = WsEventType.postingError;
      case 'posting:update':
        type = WsEventType.postingUpdate;
      case 'posting:command':
        type = WsEventType.postingCommand;
      case 'session:status':
        type = WsEventType.sessionStatus;
      case 'session:update':
        type = WsEventType.sessionUpdate;
      case 'order:new':
        type = WsEventType.orderNew;
      case 'order:update':
        type = WsEventType.orderUpdate;
      case 'order:stats':
        type = WsEventType.orderStats;
      case 'device:status':
        type = WsEventType.deviceStatus;
      case 'notification':
        type = WsEventType.notification;
      case 'find-driver:progress':
        type = WsEventType.findDriverProgress;
      case 'ws:connected':
        type = WsEventType.wsConnected;
      case 'tgDispatcher:new':
        type = WsEventType.tgDispatcherNew;
      case 'dispatcherAd:new':
        type = WsEventType.dispatcherAdNew;
      default:
        type = WsEventType.unknown;
    }
    return WsEvent(type: type, data: data);
  }
}

/// Socket.IO client for real-time communication with backend.
class WebSocketClient {
  final FlutterSecureStorage _storage;

  io.Socket? _socket;
  bool _isConnected = false;
  bool _shouldReconnect = true;

  final StreamController<WsEvent> _eventController =
      StreamController<WsEvent>.broadcast();

  /// Stream of parsed WebSocket events.
  Stream<WsEvent> get events => _eventController.stream;

  bool get isConnected => _isConnected;

  WebSocketClient(this._storage);

  /// Connect to the Socket.IO server.
  Future<void> connect() async {
    if (_isConnected && _socket != null) return;

    try {
      final token = await _storage.read(key: StorageKeys.accessToken);
      final baseUrl = await _storage.read(key: StorageKeys.baseUrl) ??
          ApiConfig.defaultBaseUrl;

      // Rolni aniqlash — driver bo'lsa 'driver', aks holda 'mobile'
      final selectedRole = await _storage.read(key: StorageKeys.selectedRole);
      final deviceType = selectedRole == 'DRIVER' ? 'driver' : 'mobile';

      // Disconnect existing socket if any
      _socket?.dispose();

      _socket = io.io(
        baseUrl,
        io.OptionBuilder()
            .setTransports(['websocket'])
            .setAuth({'token': token ?? ''})
            .setQuery({'deviceType': deviceType})
            .disableAutoConnect()
            .enableReconnection()
            .setReconnectionDelay(1000)
            .setReconnectionDelayMax(5000)
            .setReconnectionAttempts(100)
            .build(),
      );

      _socket!.onConnect((_) {
        _isConnected = true;
        // Emit internal reconnect event — broadcast provider buni tinglaydi
        _eventController.add(WsEvent.fromType('ws:connected', {}));
      });

      _socket!.onDisconnect((_) {
        _isConnected = false;
      });

      _socket!.onConnectError((error) {
        _isConnected = false;
        final errStr = error.toString().toLowerCase();
        if (errStr.contains("jwt") ||
            errStr.contains("401") ||
            errStr.contains("unauthorized") ||
            errStr.contains("expired")) {
          // Token eskirgan — avval YANGILAB, keyin qayta ulanamiz.
          // Aks holda eski token bilan abadiy auth-fail bo'lib, live order kelmaydi.
          Future.delayed(const Duration(seconds: 2), () async {
            if (!_shouldReconnect) return;
            await _refreshAccessToken();
            if (_shouldReconnect) reconnect();
          });
        }
      });

      _socket!.onError((error) {
        _isConnected = false;
      });

      // Listen to all relevant events
      final events = [
        'posting:progress',
        'posting:complete',
        'posting:error',
        'posting:update',
        'posting:command',
        'session:status',
        'session:update',
        'order:new',
        'order:update',
        'order:stats',
        'device:status',
        'notification',
        'find-driver:progress',
        // Driver-specific events
        'driver:privateOrder',
        'driver:orderAccepted',
        'driver:trackingUpdate',
        'tgDispatcher:new',
        'dispatcherAd:new',
      ];

      for (final event in events) {
        _socket!.on(event, (data) {
          try {
            // Socket.IO may deliver Map<dynamic, dynamic> — safely cast
            final Map<String, dynamic> map;
            if (data is Map) {
              map = Map<String, dynamic>.from(data);
            } else {
              map = <String, dynamic>{};
            }
            _eventController.add(WsEvent.fromType(event, map));
          } catch (_) {}
        });
      }

      _socket!.connect();
    } catch (_) {
      _isConnected = false;
    }
  }

  /// Send a message to the Socket.IO server.
  void send(String event, Map<String, dynamic> data) {
    if (_isConnected && _socket != null) {
      _socket!.emit(event, data);
    }
  }

  /// Emit posting progress to backend (mobile → dashboard).
  void emitPostingProgress(Map<String, dynamic> data) {
    send('posting:progress', data);
  }

  /// Emit session status to backend (mobile → dashboard).
  void emitSessionStatus(Map<String, dynamic> data) {
    send('session:status', data);
  }

  /// Access tokenni yangilash (refresh token bilan). WS auth eskirganda chaqiriladi.
  /// Yangi token storage'ga yoziladi — keyingi connect() shuni o'qiydi.
  Future<bool> _refreshAccessToken() async {
    try {
      final refreshToken =
          await _storage.read(key: StorageKeys.refreshToken);
      if (refreshToken == null) return false;
      final resp = await http
          .post(
            Uri.parse(
                '${ApiConfig.defaultBaseUrl}${ApiConfig.apiPrefix}${ApiConfig.refreshToken}'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'refreshToken': refreshToken}),
          )
          .timeout(const Duration(seconds: 15));
      if (resp.statusCode == 200) {
        final data = jsonDecode(resp.body) as Map<String, dynamic>;
        final newAccess = data['accessToken'] as String?;
        final newRefresh = data['refreshToken'] as String?;
        if (newAccess != null && newAccess.isNotEmpty) {
          await _storage.write(
              key: StorageKeys.accessToken, value: newAccess);
          if (newRefresh != null && newRefresh.isNotEmpty) {
            await _storage.write(
                key: StorageKeys.refreshToken, value: newRefresh);
          }
          return true;
        }
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  /// Force reconnect — dispose old socket, create fresh connection with new token.
  Future<void> reconnect() async {
    _socket?.dispose();
    _socket = null;
    _isConnected = false;
    await Future.delayed(const Duration(milliseconds: 500));
    await connect();
  }

  /// Disconnect from the Socket.IO server.
  Future<void> disconnect() async {
    _shouldReconnect = false;
    _socket?.dispose();
    _socket = null;
    _isConnected = false;
  }

  /// Dispose all resources.
  void dispose() {
    disconnect();
    _eventController.close();
  }
}

/// Provider for the WebSocket client — auto-connects on creation.
final wsClientProvider = Provider<WebSocketClient>((ref) {
  final storage = ref.read(secureStorageProvider);
  final client = WebSocketClient(storage);
  // Auto-connect when provider is first accessed (user is authenticated by this point)
  client.connect();
  ref.onDispose(() => client.dispose());
  return client;
});
