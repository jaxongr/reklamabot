class ChatRoom {
  final String id;
  final String type;
  final String? name;
  final DateTime createdAt;
  final ChatMessage? lastMessage;
  final int unreadCount;
  final List<ChatParticipant> participants;

  const ChatRoom({
    required this.id,
    required this.type,
    this.name,
    required this.createdAt,
    this.lastMessage,
    this.unreadCount = 0,
    this.participants = const [],
  });

  factory ChatRoom.fromJson(Map<String, dynamic> json) {
    // Backend returns messages[] array with last message, not lastMessage
    ChatMessage? lastMsg;
    if (json['lastMessage'] != null) {
      lastMsg = ChatMessage.fromJson(json['lastMessage'] as Map<String, dynamic>);
    } else if (json['messages'] is List && (json['messages'] as List).isNotEmpty) {
      final msgData = (json['messages'] as List).first as Map<String, dynamic>;
      lastMsg = ChatMessage.fromJson(msgData);
    }

    // Backend returns _count.messages for message count
    int unread = json['unreadCount'] as int? ?? 0;
    if (unread == 0 && json['_count'] is Map) {
      unread = (json['_count'] as Map)['messages'] as int? ?? 0;
    }

    return ChatRoom(
      id: json['id'] as String,
      type: json['type'] as String? ?? 'DISPATCHER_SUPPORT',
      name: json['name'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
      lastMessage: lastMsg,
      unreadCount: unread,
      participants: (json['participants'] as List<dynamic>?)
              ?.map((e) => ChatParticipant.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

class ChatMessage {
  final String id;
  final String roomId;
  final String senderId;
  final String? senderName;
  final String content;
  final String type;
  final DateTime createdAt;

  const ChatMessage({
    required this.id,
    required this.roomId,
    required this.senderId,
    this.senderName,
    required this.content,
    this.type = 'TEXT',
    required this.createdAt,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] as String? ?? '',
      roomId: json['roomId'] as String? ?? json['chatRoomId'] as String? ?? '',
      senderId: json['senderId'] as String? ?? '',
      senderName: json['senderName'] as String? ?? json['sender']?['firstName'] as String?,
      content: json['content'] as String? ?? json['message'] as String? ?? '',
      type: json['type'] as String? ?? 'TEXT',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
        'roomId': roomId,
        'content': content,
        'type': type,
      };
}

class ChatParticipant {
  final String id;
  final String userId;
  final String? userName;
  final String role;

  const ChatParticipant({
    required this.id,
    required this.userId,
    this.userName,
    this.role = 'MEMBER',
  });

  factory ChatParticipant.fromJson(Map<String, dynamic> json) {
    return ChatParticipant(
      id: json['id'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      userName: json['user']?['firstName'] as String? ?? json['userName'] as String?,
      role: json['role'] as String? ?? 'MEMBER',
    );
  }
}
