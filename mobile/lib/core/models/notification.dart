class AppNotification {
  final String id;
  final String title;
  final String body;
  final String? target;
  final String? data;
  final bool isRead;
  final DateTime createdAt;

  const AppNotification({
    required this.id,
    required this.title,
    required this.body,
    this.target,
    this.data,
    this.isRead = false,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    // Server userNotification formatda qaytaradi: { id, isRead, notification: { title, message, target } }
    final nested = json['notification'] as Map<String, dynamic>?;
    return AppNotification(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? nested?['title'] as String? ?? '',
      body: json['body'] as String? ?? json['message'] as String? ?? nested?['message'] as String? ?? nested?['body'] as String? ?? '',
      target: json['target'] as String? ?? nested?['target'] as String?,
      data: json['data'] as String?,
      isRead: json['isRead'] as bool? ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String).toLocal()
          : DateTime.now(),
    );
  }
}
