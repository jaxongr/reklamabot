class BalanceInfo {
  final double balance;
  final List<BalanceTransaction> transactions;

  const BalanceInfo({
    required this.balance,
    this.transactions = const [],
  });

  factory BalanceInfo.fromJson(Map<String, dynamic> json) {
    return BalanceInfo(
      balance: (json['balance'] as num?)?.toDouble() ?? 0,
      transactions: (json['transactions'] as List<dynamic>?)
              ?.map((e) => BalanceTransaction.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

class BalanceTransaction {
  final String id;
  final String userId;
  final double amount;
  final String type;
  final String? reason;
  final String? description;
  final DateTime createdAt;

  const BalanceTransaction({
    required this.id,
    required this.userId,
    required this.amount,
    required this.type,
    this.reason,
    this.description,
    required this.createdAt,
  });

  factory BalanceTransaction.fromJson(Map<String, dynamic> json) {
    return BalanceTransaction(
      id: json['id'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      amount: (json['amount'] as num?)?.toDouble() ?? 0,
      type: json['type'] as String? ?? 'DEBIT',
      reason: json['reason'] as String?,
      description: json['description'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
    );
  }

  bool get isCredit => type == 'CREDIT';
  String get typeLabel => isCredit ? 'Kirim' : 'Chiqim';
}
