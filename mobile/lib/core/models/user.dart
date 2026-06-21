/// User roles matching the backend enum.
enum UserRole {
  user('USER'),
  admin('ADMIN'),
  dispatcher('DISPATCHER'),
  superAdmin('SUPER_ADMIN'),
  driver('DRIVER');

  final String value;
  const UserRole(this.value);

  static UserRole fromString(String s) {
    return UserRole.values.firstWhere(
      (e) => e.value == s,
      orElse: () => UserRole.user,
    );
  }
}

/// User status matching the backend enum.
enum UserStatus {
  active('ACTIVE'),
  suspended('SUSPENDED'),
  banned('BANNED');

  final String value;
  const UserStatus(this.value);

  static UserStatus fromString(String s) {
    return UserStatus.values.firstWhere(
      (e) => e.value == s,
      orElse: () => UserStatus.active,
    );
  }
}

/// User model matching the backend Prisma User schema.
class User {
  final String id;
  final String telegramId;
  final String? username;
  final String? firstName;
  final String? lastName;
  final String? phoneNumber;
  final String language;
  final String timezone;
  final UserRole role;
  final UserStatus status;
  final bool isActive;
  final bool isRegistered;
  final DateTime? registeredAt;
  final bool isMaster;
  final String? masterId;
  final String? refCode;
  final bool isLineActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  const User({
    required this.id,
    required this.telegramId,
    this.username,
    this.firstName,
    this.lastName,
    this.phoneNumber,
    this.language = 'uz',
    this.timezone = 'Asia/Tashkent',
    this.role = UserRole.user,
    this.status = UserStatus.active,
    this.isActive = true,
    this.isRegistered = false,
    this.registeredAt,
    this.isMaster = false,
    this.masterId,
    this.refCode,
    this.isLineActive = true,
    required this.createdAt,
    required this.updatedAt,
  });

  User copyWith({bool? isLineActive}) {
    return User(
      id: id,
      telegramId: telegramId,
      username: username,
      firstName: firstName,
      lastName: lastName,
      phoneNumber: phoneNumber,
      language: language,
      timezone: timezone,
      role: role,
      status: status,
      isActive: isActive,
      isRegistered: isRegistered,
      registeredAt: registeredAt,
      isMaster: isMaster,
      masterId: masterId,
      refCode: refCode,
      isLineActive: isLineActive ?? this.isLineActive,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  String get displayName {
    if (firstName != null && lastName != null) {
      return '$firstName $lastName';
    }
    if (firstName != null) return firstName!;
    if (username != null) return '@$username';
    return telegramId;
  }

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String? ?? json['sub'] as String? ?? '',
      telegramId: json['telegramId'] as String? ?? '',
      username: json['username'] as String?,
      firstName: json['firstName'] as String?,
      lastName: json['lastName'] as String?,
      phoneNumber: json['phoneNumber'] as String?,
      language: json['language'] as String? ?? 'uz',
      timezone: json['timezone'] as String? ?? 'Asia/Tashkent',
      role: UserRole.fromString(json['role'] as String? ?? 'USER'),
      status: UserStatus.fromString(json['status'] as String? ?? 'ACTIVE'),
      isActive: json['isActive'] as bool? ?? true,
      isRegistered: json['isRegistered'] as bool? ?? false,
      registeredAt: json['registeredAt'] != null
          ? DateTime.tryParse(json['registeredAt'] as String)
          : null,
      isMaster: json['isMaster'] as bool? ?? false,
      masterId: json['masterId'] as String?,
      refCode: json['refCode'] as String?,
      isLineActive: json['isLineActive'] as bool? ?? true,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'telegramId': telegramId,
      'username': username,
      'firstName': firstName,
      'lastName': lastName,
      'phoneNumber': phoneNumber,
      'language': language,
      'timezone': timezone,
      'role': role.value,
      'status': status.value,
      'isActive': isActive,
      'isRegistered': isRegistered,
      'registeredAt': registeredAt?.toIso8601String(),
      'isMaster': isMaster,
      'masterId': masterId,
      'refCode': refCode,
      'isLineActive': isLineActive,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
