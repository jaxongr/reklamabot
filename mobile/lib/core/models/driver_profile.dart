class DriverProfile {
  final String id;
  final String userId;
  final String? fullName;
  final String? phone;
  final String? vehicleType;
  final String? vehicleCapacity;
  final String? vehicleNumber;
  final String? licensePhotoUrl;
  final String? vehiclePassportUrl;
  final bool isVerified;
  final DateTime? verifiedAt;
  final bool isOnline;
  final double? lastLat;
  final double? lastLng;
  final DateTime? lastLocationAt;
  final String? lastCity;
  final double balance;
  final bool subscriptionActive;
  final DateTime? subscriptionEndDate;
  final DateTime createdAt;
  final DateTime updatedAt;

  const DriverProfile({
    required this.id,
    required this.userId,
    this.fullName,
    this.phone,
    this.vehicleType,
    this.vehicleCapacity,
    this.vehicleNumber,
    this.licensePhotoUrl,
    this.vehiclePassportUrl,
    this.isVerified = false,
    this.verifiedAt,
    this.isOnline = false,
    this.lastLat,
    this.lastLng,
    this.lastLocationAt,
    this.lastCity,
    this.balance = 0,
    this.subscriptionActive = false,
    this.subscriptionEndDate,
    required this.createdAt,
    required this.updatedAt,
  });

  factory DriverProfile.fromJson(Map<String, dynamic> json) {
    return DriverProfile(
      id: json['id'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      fullName: json['fullName'] as String?,
      phone: json['phone'] as String?,
      vehicleType: json['vehicleType'] as String?,
      vehicleCapacity: json['vehicleCapacity'] as String?,
      vehicleNumber: json['vehicleNumber'] as String?,
      licensePhotoUrl: json['licensePhotoUrl'] as String?,
      vehiclePassportUrl: json['vehiclePassportUrl'] as String?,
      isVerified: json['isVerified'] as bool? ?? false,
      verifiedAt: json['verifiedAt'] != null
          ? DateTime.tryParse(json['verifiedAt'] as String)
          : null,
      isOnline: json['isOnline'] as bool? ?? false,
      lastLat: (json['lastLat'] as num?)?.toDouble(),
      lastLng: (json['lastLng'] as num?)?.toDouble(),
      lastLocationAt: json['lastLocationAt'] != null
          ? DateTime.tryParse(json['lastLocationAt'] as String)
          : null,
      lastCity: json['lastCity'] as String?,
      balance: (json['balance'] as num?)?.toDouble() ?? 0,
      subscriptionActive: json['subscriptionActive'] as bool? ?? false,
      subscriptionEndDate: json['subscriptionEndDate'] != null
          ? DateTime.tryParse(json['subscriptionEndDate'] as String)
          : null,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String).toLocal()
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String).toLocal()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'fullName': fullName,
      'phone': phone,
      'vehicleType': vehicleType,
      'vehicleCapacity': vehicleCapacity,
      'vehicleNumber': vehicleNumber,
      'licensePhotoUrl': licensePhotoUrl,
      'vehiclePassportUrl': vehiclePassportUrl,
      'isVerified': isVerified,
      'isOnline': isOnline,
      'lastLat': lastLat,
      'lastLng': lastLng,
      'lastCity': lastCity,
      'balance': balance,
      'subscriptionActive': subscriptionActive,
    };
  }
}

class DriverOffer {
  final String id;
  final String driverId;
  final String fromCity;
  final String toCity;
  final String vehicleType;
  final String? vehicleCapacity;
  final String phone;
  final String? description;
  final String? price;
  final String status;
  final DateTime createdAt;
  // Included from backend when fetching all offers
  final String? driverFullName;
  final String? driverVehicleType;
  final String? driverVehicleCapacity;
  final bool driverIsVerified;

  const DriverOffer({
    required this.id,
    required this.driverId,
    required this.fromCity,
    required this.toCity,
    required this.vehicleType,
    this.vehicleCapacity,
    required this.phone,
    this.description,
    this.price,
    this.status = 'ACTIVE',
    required this.createdAt,
    this.driverFullName,
    this.driverVehicleType,
    this.driverVehicleCapacity,
    this.driverIsVerified = false,
  });

  factory DriverOffer.fromJson(Map<String, dynamic> json) {
    final dp = json['driverProfile'] as Map<String, dynamic>?;
    return DriverOffer(
      id: json['id'] as String? ?? '',
      driverId: json['driverId'] as String? ?? '',
      fromCity: json['fromCity'] as String? ?? '',
      toCity: json['toCity'] as String? ?? '',
      vehicleType: json['vehicleType'] as String? ?? '',
      vehicleCapacity: json['vehicleCapacity'] as String?,
      phone: json['phone'] as String? ?? '',
      description: json['description'] as String?,
      price: json['price'] as String?,
      status: json['status'] as String? ?? 'ACTIVE',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String).toLocal()
          : DateTime.now(),
      driverFullName: dp?['fullName'] as String?,
      driverVehicleType: dp?['vehicleType'] as String?,
      driverVehicleCapacity: dp?['vehicleCapacity'] as String?,
      driverIsVerified: dp?['isVerified'] as bool? ?? false,
    );
  }
}

class PrivateOrder {
  final String id;
  final String? driverId;
  final String fromCity;
  final String toCity;
  final String? cargoType;
  final String? cargoWeight;
  final String? price;
  final String phone;
  final String? description;
  final double commissionAmount;
  final bool commissionPaid;
  final String status;
  final DateTime createdAt;

  const PrivateOrder({
    required this.id,
    this.driverId,
    required this.fromCity,
    required this.toCity,
    this.cargoType,
    this.cargoWeight,
    this.price,
    required this.phone,
    this.description,
    this.commissionAmount = 0,
    this.commissionPaid = false,
    this.status = 'PENDING',
    required this.createdAt,
  });

  factory PrivateOrder.fromJson(Map<String, dynamic> json) {
    return PrivateOrder(
      id: json['id'] as String? ?? '',
      driverId: json['driverId'] as String?,
      fromCity: json['fromCity'] as String? ?? '',
      toCity: json['toCity'] as String? ?? '',
      cargoType: json['cargoType'] as String?,
      cargoWeight: json['cargoWeight'] as String?,
      price: json['price'] as String?,
      phone: json['phone'] as String? ?? '',
      description: json['description'] as String?,
      commissionAmount: (json['commissionAmount'] as num?)?.toDouble() ?? 0,
      commissionPaid: json['commissionPaid'] as bool? ?? false,
      status: json['status'] as String? ?? 'PENDING',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String).toLocal()
          : DateTime.now(),
    );
  }
}
