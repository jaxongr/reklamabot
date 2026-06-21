import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/api_config.dart';
import '../../core/api/api_client.dart';
import '../../core/api/websocket_client.dart';
import '../../core/models/chat.dart';

/// State for chat rooms and messages.
class ChatState {
  final List<ChatRoom> rooms;
  final Map<String, List<ChatMessage>> messages;
  final String? currentRoomId;
  final bool isLoading;
  final String? error;

  const ChatState({
    this.rooms = const [],
    this.messages = const {},
    this.currentRoomId,
    this.isLoading = false,
    this.error,
  });

  ChatState copyWith({
    List<ChatRoom>? rooms,
    Map<String, List<ChatMessage>>? messages,
    String? currentRoomId,
    bool? isLoading,
    String? error,
    bool clearCurrentRoom = false,
    bool clearError = false,
  }) {
    return ChatState(
      rooms: rooms ?? this.rooms,
      messages: messages ?? this.messages,
      currentRoomId:
          clearCurrentRoom ? null : (currentRoomId ?? this.currentRoomId),
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

/// Notifier for chat management.
class ChatNotifier extends StateNotifier<ChatState> {
  final ApiClient _api;
  final WebSocketClient _ws;
  StreamSubscription<WsEvent>? _wsSub;

  ChatNotifier(this._api, this._ws) : super(const ChatState()) {
    _listenToWebSocket();
  }

  /// Listen to incoming chat messages via WebSocket.
  void _listenToWebSocket() {
    _wsSub = _ws.events.listen((event) {
      // Listen for raw socket events with 'chat:message' type
      if (event.data.containsKey('roomId') && event.data.containsKey('content')) {
        _onChatMessage(event.data);
      }
    });

    // Also register a direct listener on the underlying socket
    // for 'chat:message' events that may not go through WsEvent enum
    _ws.send('chat:subscribe', {});
  }

  void _onChatMessage(Map<String, dynamic> data) {
    try {
      final message = ChatMessage.fromJson(data);
      final roomId = message.roomId;

      // Add message to the room's messages list
      final currentMessages =
          Map<String, List<ChatMessage>>.from(state.messages);
      final roomMessages = List<ChatMessage>.from(
        currentMessages[roomId] ?? [],
      );

      // Avoid duplicates
      if (roomMessages.any((m) => m.id == message.id)) return;

      roomMessages.insert(0, message);
      currentMessages[roomId] = roomMessages;

      // Update last message in rooms list
      final updatedRooms = state.rooms.map((room) {
        if (room.id == roomId) {
          return ChatRoom(
            id: room.id,
            type: room.type,
            name: room.name,
            createdAt: room.createdAt,
            lastMessage: message,
            unreadCount: room.id == state.currentRoomId
                ? 0
                : room.unreadCount + 1,
            participants: room.participants,
          );
        }
        return room;
      }).toList();

      state = state.copyWith(
        messages: currentMessages,
        rooms: updatedRooms,
      );
    } catch (_) {
      // Ignore parse errors
    }
  }

  @override
  void dispose() {
    _wsSub?.cancel();
    super.dispose();
  }

  /// Load all chat rooms from server.
  Future<void> loadRooms() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final response = await _api.get(ApiConfig.chatRooms);
      final data = response.data;

      List<dynamic> list;
      if (data is Map<String, dynamic>) {
        list = (data['data'] as List?) ?? [];
      } else if (data is List) {
        list = data;
      } else {
        list = [];
      }

      final rooms = list
          .map((e) => ChatRoom.fromJson(e as Map<String, dynamic>))
          .toList();

      // Sort by last message date descending
      rooms.sort((a, b) {
        final aDate = a.lastMessage?.createdAt ?? a.createdAt;
        final bDate = b.lastMessage?.createdAt ?? b.createdAt;
        return bDate.compareTo(aDate);
      });

      state = state.copyWith(rooms: rooms, isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Chatlarni yuklashda xatolik',
      );
    }
  }

  /// Load messages for a specific room.
  Future<void> loadMessages(String roomId) async {
    state = state.copyWith(
      isLoading: true,
      currentRoomId: roomId,
      clearError: true,
    );
    try {
      final response = await _api.get(ApiConfig.chatMessages(roomId));
      final data = response.data;

      List<dynamic> list;
      if (data is Map<String, dynamic>) {
        list = (data['data'] as List?) ?? [];
      } else if (data is List) {
        list = data;
      } else {
        list = [];
      }

      final messages = list
          .map((e) => ChatMessage.fromJson(e as Map<String, dynamic>))
          .toList();

      // Sort newest first (for reversed ListView)
      messages.sort((a, b) => b.createdAt.compareTo(a.createdAt));

      final currentMessages =
          Map<String, List<ChatMessage>>.from(state.messages);
      currentMessages[roomId] = messages;

      // Reset unread count for this room
      final updatedRooms = state.rooms.map((room) {
        if (room.id == roomId) {
          return ChatRoom(
            id: room.id,
            type: room.type,
            name: room.name,
            createdAt: room.createdAt,
            lastMessage: room.lastMessage,
            unreadCount: 0,
            participants: room.participants,
          );
        }
        return room;
      }).toList();

      state = state.copyWith(
        messages: currentMessages,
        rooms: updatedRooms,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Xabarlarni yuklashda xatolik',
      );
    }
  }

  /// Send a text message to a room.
  Future<bool> sendMessage(String roomId, String content) async {
    try {
      final response = await _api.post(
        ApiConfig.chatMessages(roomId),
        data: {'message': content},
      );

      final data = response.data;
      if (data is Map<String, dynamic>) {
        final message = ChatMessage.fromJson(data);
        final currentMessages =
            Map<String, List<ChatMessage>>.from(state.messages);
        final roomMessages = List<ChatMessage>.from(
          currentMessages[roomId] ?? [],
        );

        // Avoid duplicates
        if (!roomMessages.any((m) => m.id == message.id)) {
          roomMessages.insert(0, message);
          currentMessages[roomId] = roomMessages;

          // Update last message in rooms
          final updatedRooms = state.rooms.map((room) {
            if (room.id == roomId) {
              return ChatRoom(
                id: room.id,
                type: room.type,
                name: room.name,
                createdAt: room.createdAt,
                lastMessage: message,
                unreadCount: 0,
                participants: room.participants,
              );
            }
            return room;
          }).toList();

          state = state.copyWith(
            messages: currentMessages,
            rooms: updatedRooms,
          );
        }
      }

      return true;
    } catch (_) {
      return false;
    }
  }

  /// Create or get a support chat room.
  Future<ChatRoom?> createRoom(String type) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final response = await _api.post(
        ApiConfig.chatCreateSupportRoom,
        data: {'type': type},
      );

      final data = response.data;
      if (data is Map<String, dynamic>) {
        final room = ChatRoom.fromJson(data);
        final updatedRooms = [room, ...state.rooms];
        state = state.copyWith(rooms: updatedRooms, isLoading: false);
        return room;
      }

      state = state.copyWith(isLoading: false);
      return null;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Chat yaratishda xatolik',
      );
      return null;
    }
  }

  /// Set current room (used for tracking which room is active).
  void setCurrentRoom(String? roomId) {
    state = state.copyWith(
      currentRoomId: roomId,
      clearCurrentRoom: roomId == null,
    );
  }
}

/// Provider for chat state.
final chatProvider = StateNotifierProvider<ChatNotifier, ChatState>((ref) {
  final api = ref.read(apiClientProvider);
  final ws = ref.read(wsClientProvider);
  return ChatNotifier(api, ws);
});

/// Total unread messages across all chat rooms — used by BottomNav badge.
final totalUnreadProvider = Provider<int>((ref) {
  final rooms = ref.watch(chatProvider.select((s) => s.rooms));
  return rooms.fold<int>(0, (sum, r) => sum + r.unreadCount);
});
