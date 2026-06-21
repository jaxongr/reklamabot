import 'package:socket_io_client/socket_io_client.dart' as io;
import '../../config/api_config.dart';
import '../api/api_client.dart';

typedef EventHandler = void Function(dynamic data);

class SocketService {
  final ApiClient _api;
  io.Socket? _socket;
  final Map<String, List<EventHandler>> _handlers = {};

  SocketService(this._api);

  void connect() {
    if (_socket?.connected == true) return;
    _socket = io.io(
      ApiConfig.wsUrl,
      io.OptionBuilder()
        .setTransports(['websocket'])
        .setAuth({'token': _api.token})
        .disableAutoConnect()
        .build(),
    );
    _socket!.onAny((event, data) {
      final list = _handlers[event];
      if (list != null) for (final h in list) h(data);
    });
    _socket!.connect();
  }

  void on(String event, EventHandler handler) => _handlers.putIfAbsent(event, () => []).add(handler);
  void off(String event, EventHandler handler) => _handlers[event]?.remove(handler);
  void emit(String event, dynamic data) => _socket?.emit(event, data);
  void disconnect() {
    _socket?.disconnect(); _socket?.dispose(); _socket = null; _handlers.clear();
  }
  bool get isConnected => _socket?.connected ?? false;
}
