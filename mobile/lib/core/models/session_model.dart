/// Session status matching the backend enum.
enum SessionStatus {
  active('ACTIVE'),
  inactive('INACTIVE'),
  frozen('FROZEN'),
  banned('BANNED'),
  deleted('DELETED');

  final String value;
  const SessionStatus(this.value);

  static SessionStatus fromString(String s) {
    return SessionStatus.values.firstWhere(
      (e) => e.value == s,
      orElse: () => SessionStatus.inactive,
    );
  }
}

/// Group type matching the backend enum.
enum GroupType {
  group('GROUP'),
  supergroup('SUPERGROUP'),
  channel('CHANNEL');

  final String value;
  const GroupType(this.value);

  static GroupType fromString(String s) {
    return GroupType.values.firstWhere(
      (e) => e.value == s,
      orElse: () => GroupType.group,
    );
  }
}

/// Telegram session model matching the backend Session schema.
class SessionModel {
  final String id;
  final String userId;
  final String? name;
  final SessionStatus status;
  final String? phone;
  final bool isPremium;
  final int totalGroups;
  final int activeGroups;
  final DateTime? lastSyncAt;
  final bool isFrozen;
  final DateTime? frozenAt;
  final DateTime? unfreezeAt;
  final int freezeCount;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool? isConnected; // From connection-status check

  const SessionModel({
    required this.id,
    required this.userId,
    this.name,
    this.status = SessionStatus.active,
    this.phone,
    this.isPremium = false,
    this.totalGroups = 0,
    this.activeGroups = 0,
    this.lastSyncAt,
    this.isFrozen = false,
    this.frozenAt,
    this.unfreezeAt,
    this.freezeCount = 0,
    required this.createdAt,
    required this.updatedAt,
    this.isConnected,
  });

  String get displayName => name ?? phone ?? 'Sessiya';

  String get statusLabel {
    if (isFrozen) return 'Muzlatilgan';
    switch (status) {
      case SessionStatus.active:
        return 'Faol';
      case SessionStatus.inactive:
        return 'Nofaol';
      case SessionStatus.frozen:
        return 'Muzlatilgan';
      case SessionStatus.banned:
        return 'Bloklangan';
      case SessionStatus.deleted:
        return "O'chirilgan";
    }
  }

  factory SessionModel.fromJson(Map<String, dynamic> json) {
    return SessionModel(
      id: json['id'] as String,
      userId: json['userId'] as String? ?? '',
      name: json['name'] as String?,
      status: SessionStatus.fromString(json['status'] as String? ?? 'ACTIVE'),
      phone: json['phone'] as String?,
      isPremium: json['isPremium'] as bool? ?? false,
      totalGroups: json['totalGroups'] as int? ?? 0,
      activeGroups: json['activeGroups'] as int? ?? 0,
      lastSyncAt: json['lastSyncAt'] != null
          ? DateTime.tryParse(json['lastSyncAt'] as String)
          : null,
      isFrozen: json['isFrozen'] as bool? ?? false,
      frozenAt: json['frozenAt'] != null
          ? DateTime.tryParse(json['frozenAt'] as String)
          : null,
      unfreezeAt: json['unfreezeAt'] != null
          ? DateTime.tryParse(json['unfreezeAt'] as String)
          : null,
      freezeCount: json['freezeCount'] as int? ?? 0,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String).toLocal()
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String).toLocal()
          : DateTime.now(),
      isConnected: json['isConnected'] as bool?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'name': name,
      'status': status.value,
      'phone': phone,
      'isPremium': isPremium,
      'totalGroups': totalGroups,
      'activeGroups': activeGroups,
      'lastSyncAt': lastSyncAt?.toIso8601String(),
      'isFrozen': isFrozen,
      'frozenAt': frozenAt?.toIso8601String(),
      'unfreezeAt': unfreezeAt?.toIso8601String(),
      'freezeCount': freezeCount,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

/// Group model matching the backend Group schema.
class GroupModel {
  final String id;
  final String sessionId;
  final String telegramId;
  final String title;
  final String? username;
  final GroupType type;
  final int? memberCount;
  final bool isActive;
  final double activityScore;
  final DateTime? lastPostAt;
  final bool isPriority;
  final int? priorityOrder;
  final bool isSkipped;
  final String? skipReason;

  const GroupModel({
    required this.id,
    required this.sessionId,
    required this.telegramId,
    required this.title,
    this.username,
    this.type = GroupType.group,
    this.memberCount,
    this.isActive = true,
    this.activityScore = 0,
    this.lastPostAt,
    this.isPriority = false,
    this.priorityOrder,
    this.isSkipped = false,
    this.skipReason,
  });

  factory GroupModel.fromJson(Map<String, dynamic> json) {
    return GroupModel(
      id: json['id'] as String,
      sessionId: json['sessionId'] as String? ?? '',
      telegramId: json['telegramId'] as String? ?? '',
      title: json['title'] as String? ?? '',
      username: json['username'] as String?,
      type: GroupType.fromString(json['type'] as String? ?? 'GROUP'),
      memberCount: json['memberCount'] as int?,
      isActive: json['isActive'] as bool? ?? true,
      activityScore: (json['activityScore'] as num?)?.toDouble() ?? 0,
      lastPostAt: json['lastPostAt'] != null
          ? DateTime.tryParse(json['lastPostAt'] as String)
          : null,
      isPriority: json['isPriority'] as bool? ?? false,
      priorityOrder: json['priorityOrder'] as int?,
      isSkipped: json['isSkipped'] as bool? ?? false,
      skipReason: json['skipReason'] as String?,
    );
  }
}
