/// Media type matching the backend enum.
enum MediaType {
  text('TEXT'),
  photo('PHOTO'),
  video('VIDEO'),
  document('DOCUMENT'),
  album('ALBUM');

  final String value;
  const MediaType(this.value);

  static MediaType fromString(String s) {
    return MediaType.values.firstWhere(
      (e) => e.value == s,
      orElse: () => MediaType.text,
    );
  }
}

/// Ad status matching the backend enum.
enum AdStatus {
  draft('DRAFT'),
  active('ACTIVE'),
  paused('PAUSED'),
  closed('CLOSED'),
  soldOut('SOLD_OUT'),
  archived('ARCHIVED');

  final String value;
  const AdStatus(this.value);

  static AdStatus fromString(String s) {
    return AdStatus.values.firstWhere(
      (e) => e.value == s,
      orElse: () => AdStatus.draft,
    );
  }

  String get label {
    switch (this) {
      case AdStatus.draft:
        return 'Qoralama';
      case AdStatus.active:
        return 'Faol';
      case AdStatus.paused:
        return 'Pauza';
      case AdStatus.closed:
        return 'Yopilgan';
      case AdStatus.soldOut:
        return 'Sotilgan';
      case AdStatus.archived:
        return 'Arxivlangan';
    }
  }
}

/// Ad model matching the backend Ad schema.
class Ad {
  final String id;
  final String userId;
  final String title;
  final String? description;
  final String content;
  final List<String> mediaUrls;
  final MediaType mediaType;
  final AdStatus status;
  final double? price;
  final String currency;
  final bool negotiable;
  final int? totalQuantity;
  final int soldQuantity;
  final bool isSold;
  final DateTime? soldAt;
  final String? closedReason;
  final bool brandAdEnabled;
  final String? brandAdText;
  final int? displayNumber;
  final List<String> selectedSessions;
  final List<String> selectedGroups;
  final int intervalMin;
  final int intervalMax;
  final int groupInterval;
  final bool isPriority;
  final int viewCount;
  final int clickCount;
  final int shareCount;
  final String createdBy;
  final String? closedBy;
  final DateTime? scheduledFor;
  final bool isScheduled;
  final String? lastError;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Ad({
    required this.id,
    required this.userId,
    required this.title,
    this.description,
    required this.content,
    this.mediaUrls = const [],
    this.mediaType = MediaType.text,
    this.status = AdStatus.draft,
    this.price,
    this.currency = 'UZS',
    this.negotiable = false,
    this.totalQuantity,
    this.soldQuantity = 0,
    this.isSold = false,
    this.soldAt,
    this.closedReason,
    this.brandAdEnabled = false,
    this.brandAdText,
    this.displayNumber,
    this.selectedSessions = const [],
    this.selectedGroups = const [],
    this.intervalMin = 300,
    this.intervalMax = 900,
    this.groupInterval = 3,
    this.isPriority = false,
    this.viewCount = 0,
    this.clickCount = 0,
    this.shareCount = 0,
    required this.createdBy,
    this.closedBy,
    this.scheduledFor,
    this.isScheduled = false,
    this.lastError,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Ad.fromJson(Map<String, dynamic> json) {
    return Ad(
      id: json['id'] as String,
      userId: json['userId'] as String? ?? '',
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
      content: json['content'] as String? ?? '',
      mediaUrls: (json['mediaUrls'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      mediaType: MediaType.fromString(json['mediaType'] as String? ?? 'TEXT'),
      status: AdStatus.fromString(json['status'] as String? ?? 'DRAFT'),
      price: (json['price'] as num?)?.toDouble(),
      currency: json['currency'] as String? ?? 'UZS',
      negotiable: json['negotiable'] as bool? ?? false,
      totalQuantity: json['totalQuantity'] as int?,
      soldQuantity: json['soldQuantity'] as int? ?? 0,
      isSold: json['isSold'] as bool? ?? false,
      soldAt: json['soldAt'] != null
          ? DateTime.tryParse(json['soldAt'] as String)
          : null,
      closedReason: json['closedReason'] as String?,
      brandAdEnabled: json['brandAdEnabled'] as bool? ?? false,
      brandAdText: json['brandAdText'] as String?,
      displayNumber: json['displayNumber'] as int?,
      selectedSessions: (json['selectedSessions'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      selectedGroups: (json['selectedGroups'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      intervalMin: json['intervalMin'] as int? ?? 300,
      intervalMax: json['intervalMax'] as int? ?? 900,
      groupInterval: json['groupInterval'] as int? ?? 3,
      isPriority: json['isPriority'] as bool? ?? false,
      viewCount: json['viewCount'] as int? ?? 0,
      clickCount: json['clickCount'] as int? ?? 0,
      shareCount: json['shareCount'] as int? ?? 0,
      createdBy: json['createdBy'] as String? ?? '',
      closedBy: json['closedBy'] as String?,
      scheduledFor: json['scheduledFor'] != null
          ? DateTime.tryParse(json['scheduledFor'] as String)
          : null,
      isScheduled: json['isScheduled'] as bool? ?? false,
      lastError: json['lastError'] as String?,
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
      'userId': userId,
      'title': title,
      'description': description,
      'content': content,
      'mediaUrls': mediaUrls,
      'mediaType': mediaType.value,
      'status': status.value,
      'price': price,
      'currency': currency,
      'negotiable': negotiable,
      'totalQuantity': totalQuantity,
      'soldQuantity': soldQuantity,
      'isSold': isSold,
      'brandAdEnabled': brandAdEnabled,
      'brandAdText': brandAdText,
      'selectedSessions': selectedSessions,
      'selectedGroups': selectedGroups,
      'intervalMin': intervalMin,
      'intervalMax': intervalMax,
      'groupInterval': groupInterval,
      'isPriority': isPriority,
      'createdBy': createdBy,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
