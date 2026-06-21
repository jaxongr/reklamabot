class SupportTicket {
  final String id;
  final String userId;
  final String subject;
  final String description;
  final String status;
  final String? priority;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<SupportMessage> messages;

  const SupportTicket({
    required this.id,
    required this.userId,
    required this.subject,
    required this.description,
    this.status = 'OPEN',
    this.priority,
    required this.createdAt,
    required this.updatedAt,
    this.messages = const [],
  });

  factory SupportTicket.fromJson(Map<String, dynamic> json) {
    return SupportTicket(
      id: json['id'] as String,
      userId: json['userId'] as String? ?? '',
      subject: json['subject'] as String? ?? '',
      description: json['description'] as String? ?? '',
      status: json['status'] as String? ?? 'OPEN',
      priority: json['priority']?.toString(),
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : DateTime.now(),
      messages: (json['messages'] as List<dynamic>?)
              ?.map((e) => SupportMessage.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  String get statusLabel {
    switch (status) {
      case 'OPEN':
        return 'Ochiq';
      case 'IN_PROGRESS':
        return 'Jarayonda';
      case 'RESOLVED':
        return 'Hal qilindi';
      case 'CLOSED':
        return 'Yopildi';
      default:
        return status;
    }
  }
}

class SupportMessage {
  final String id;
  final String ticketId;
  final String senderId;
  final String? senderName;
  final String content;
  final bool isStaff;
  final DateTime createdAt;

  const SupportMessage({
    required this.id,
    required this.ticketId,
    required this.senderId,
    this.senderName,
    required this.content,
    this.isStaff = false,
    required this.createdAt,
  });

  factory SupportMessage.fromJson(Map<String, dynamic> json) {
    return SupportMessage(
      id: json['id'] as String? ?? '',
      ticketId: json['ticketId'] as String? ?? json['supportTicketId'] as String? ?? '',
      senderId: json['senderId'] as String? ?? '',
      senderName: json['sender']?['firstName'] as String? ?? json['senderName'] as String?,
      content: json['content'] as String? ?? json['message'] as String? ?? '',
      isStaff: json['isStaff'] as bool? ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
    );
  }
}
