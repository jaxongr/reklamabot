/// Order type enum.
enum OrderType {
  cargo('CARGO'),
  driver('DRIVER');

  final String value;
  const OrderType(this.value);

  static OrderType fromString(String s) {
    return OrderType.values.firstWhere(
      (e) => e.value == s,
      orElse: () => OrderType.cargo,
    );
  }

  String get label {
    switch (this) {
      case OrderType.cargo:
        return 'Yuk';
      case OrderType.driver:
        return 'Haydovchi';
    }
  }
}

/// Order status enum.
enum OrderStatus {
  newOrder('NEW'),
  viewed('VIEWED'),
  contacted('CONTACTED'),
  completed('COMPLETED'),
  rejected('REJECTED');

  final String value;
  const OrderStatus(this.value);

  static OrderStatus fromString(String s) {
    return OrderStatus.values.firstWhere(
      (e) => e.value == s,
      orElse: () => OrderStatus.newOrder,
    );
  }

  String get label {
    switch (this) {
      case OrderStatus.newOrder:
        return 'Yangi';
      case OrderStatus.viewed:
        return "Ko'rilgan";
      case OrderStatus.contacted:
        return "Bog'lanilgan";
      case OrderStatus.completed:
        return 'Bajarilgan';
      case OrderStatus.rejected:
        return 'Rad etilgan';
    }
  }
}

/// Order scope enum.
enum OrderScope {
  internal('INTERNAL'),
  import_('IMPORT'),
  export_('EXPORT');

  final String value;
  const OrderScope(this.value);

  static OrderScope fromString(String s) {
    return OrderScope.values.firstWhere(
      (e) => e.value == s,
      orElse: () => OrderScope.internal,
    );
  }

  String get label {
    switch (this) {
      case OrderScope.internal:
        return 'Ichki';
      case OrderScope.import_:
        return 'Import';
      case OrderScope.export_:
        return 'Eksport';
    }
  }
}

/// Order model for cargo/delivery orders parsed from Telegram groups.
class Order {
  final String id;
  final String? userId;
  final String messageText;
  final String groupTitle;
  final String? groupTelegramId;
  final String? senderName;
  final String? senderUsername;
  final String? senderPhone;
  final String? senderTelegramId;
  final DateTime? messageDate;
  final String? cargoFrom;
  final String? cargoTo;
  final String? cargoType;
  final String? cargoWeight;
  final String? price;
  final String? phone;
  final int? distance;
  final OrderType type;
  final String? vehicleType;
  final String? vehicleCapacity;
  final String? notes;
  final OrderStatus status;
  final int senderTodayAds;
  final int senderTotalAds;
  final DateTime createdAt;
  final DateTime updatedAt;

  // New fields for 25 tasks
  final OrderScope scope;
  final bool isManual;
  final bool isForSale;
  final String? salePrice;
  final String? acceptedById;
  final DateTime? acceptedAt;
  final String? acceptedStatus;
  final double? closedAmount;
  final DateTime? closedAt;
  final double? surgeMultiplier;
  final DateTime? surgeExpiresAt;
  final int broadcastCount;
  final int blockedByCount;

  const Order({
    required this.id,
    this.userId,
    required this.messageText,
    required this.groupTitle,
    this.groupTelegramId,
    this.senderName,
    this.senderUsername,
    this.senderPhone,
    this.senderTelegramId,
    this.messageDate,
    this.cargoFrom,
    this.cargoTo,
    this.cargoType,
    this.cargoWeight,
    this.price,
    this.phone,
    this.distance,
    this.type = OrderType.cargo,
    this.vehicleType,
    this.vehicleCapacity,
    this.notes,
    this.status = OrderStatus.newOrder,
    this.senderTodayAds = 0,
    this.senderTotalAds = 0,
    required this.createdAt,
    required this.updatedAt,
    this.scope = OrderScope.internal,
    this.isManual = false,
    this.isForSale = false,
    this.salePrice,
    this.acceptedById,
    this.acceptedAt,
    this.acceptedStatus,
    this.closedAmount,
    this.closedAt,
    this.surgeMultiplier,
    this.surgeExpiresAt,
    this.broadcastCount = 0,
    this.blockedByCount = 0,
  });

  String get route {
    final from = cargoFrom ?? '---';
    final to = cargoTo ?? '---';
    return '$from \u2192 $to';
  }

  String get distanceText {
    if (distance == null) return '---';
    return '$distance km';
  }

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] as String,
      userId: json['userId'] as String?,
      messageText: json['messageText'] as String? ?? '',
      groupTitle: json['groupTitle'] as String? ?? '',
      groupTelegramId: json['groupTelegramId'] as String?,
      senderName: json['senderName'] as String?,
      senderUsername: json['senderUsername'] as String?,
      senderPhone: json['senderPhone'] as String?,
      senderTelegramId: json['senderTelegramId'] as String?,
      messageDate: json['messageDate'] != null
          ? DateTime.tryParse(json['messageDate'] as String)?.toLocal()
          : null,
      cargoFrom: json['cargoFrom'] as String?,
      cargoTo: json['cargoTo'] as String?,
      cargoType: json['cargoType'] as String?,
      cargoWeight: json['cargoWeight'] as String?,
      price: json['price'] as String?,
      phone: json['phone'] as String?,
      distance: json['distance'] as int?,
      type: OrderType.fromString(json['type'] as String? ?? 'CARGO'),
      vehicleType: json['vehicleType'] as String?,
      vehicleCapacity: json['vehicleCapacity'] as String?,
      notes: json['notes'] as String?,
      status: OrderStatus.fromString(json['status'] as String? ?? 'NEW'),
      senderTodayAds: json['senderTodayAds'] as int? ?? 0,
      senderTotalAds: json['senderTotalAds'] as int? ?? 0,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String).toLocal()
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String).toLocal()
          : DateTime.now(),
      scope: OrderScope.fromString(json['scope'] as String? ?? 'INTERNAL'),
      isManual: json['isManual'] as bool? ?? false,
      isForSale: json['isForSale'] as bool? ?? false,
      salePrice: json['salePrice'] as String?,
      acceptedById: json['acceptedById'] as String?,
      acceptedAt: json['acceptedAt'] != null
          ? DateTime.tryParse(json['acceptedAt'] as String)?.toLocal()
          : null,
      acceptedStatus: json['acceptedStatus'] as String?,
      closedAmount: (json['closedAmount'] as num?)?.toDouble(),
      closedAt: json['closedAt'] != null
          ? DateTime.tryParse(json['closedAt'] as String)
          : null,
      surgeMultiplier: (json['surgeMultiplier'] as num?)?.toDouble(),
      surgeExpiresAt: json['surgeExpiresAt'] != null
          ? DateTime.tryParse(json['surgeExpiresAt'] as String)
          : null,
      broadcastCount: json['broadcastCount'] as int? ?? 0,
      blockedByCount: json['blockedByCount'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'messageText': messageText,
      'groupTitle': groupTitle,
      'groupTelegramId': groupTelegramId,
      'senderName': senderName,
      'senderUsername': senderUsername,
      'senderPhone': senderPhone,
      'senderTelegramId': senderTelegramId,
      'messageDate': messageDate?.toIso8601String(),
      'cargoFrom': cargoFrom,
      'cargoTo': cargoTo,
      'cargoType': cargoType,
      'cargoWeight': cargoWeight,
      'price': price,
      'phone': phone,
      'distance': distance,
      'type': type.value,
      'vehicleType': vehicleType,
      'vehicleCapacity': vehicleCapacity,
      'notes': notes,
      'status': status.value,
      'senderTodayAds': senderTodayAds,
      'senderTotalAds': senderTotalAds,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
