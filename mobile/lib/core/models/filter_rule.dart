/// Filter field — what part of the message/order to match against.
enum FilterField {
  cargoFrom('cargoFrom'),
  cargoTo('cargoTo'),
  cargoType('cargoType'),
  vehicleType('vehicleType'),
  price('price'),
  weight('weight'),
  groupTitle('groupTitle'),
  messageText('messageText');

  final String value;
  const FilterField(this.value);

  static FilterField fromString(String s) {
    return FilterField.values.firstWhere(
      (e) => e.value == s,
      orElse: () => FilterField.messageText,
    );
  }

  String get label {
    switch (this) {
      case FilterField.cargoFrom:
        return 'Qayerdan';
      case FilterField.cargoTo:
        return 'Qayerga';
      case FilterField.cargoType:
        return 'Yuk turi';
      case FilterField.vehicleType:
        return 'Mashina turi';
      case FilterField.price:
        return 'Narx';
      case FilterField.weight:
        return 'Vazn';
      case FilterField.groupTitle:
        return 'Guruh nomi';
      case FilterField.messageText:
        return 'Xabar matni';
    }
  }
}

/// Filter operator — how the field value is compared.
enum FilterOperator {
  contains('contains'),
  equals('equals'),
  startsWith('startsWith'),
  endsWith('endsWith'),
  greaterThan('greaterThan'),
  lessThan('lessThan');

  final String value;
  const FilterOperator(this.value);

  static FilterOperator fromString(String s) {
    return FilterOperator.values.firstWhere(
      (e) => e.value == s,
      orElse: () => FilterOperator.contains,
    );
  }

  String get label {
    switch (this) {
      case FilterOperator.contains:
        return "O'z ichiga oladi";
      case FilterOperator.equals:
        return 'Teng';
      case FilterOperator.startsWith:
        return 'Boshlanadi';
      case FilterOperator.endsWith:
        return 'Tugaydi';
      case FilterOperator.greaterThan:
        return 'Katta';
      case FilterOperator.lessThan:
        return 'Kichik';
    }
  }
}

/// A single filter rule used for filtering orders from monitored groups.
class FilterRule {
  final String id;
  final String? name;
  final FilterField field;
  final FilterOperator operator;
  final String value;
  final bool isActive;
  final DateTime createdAt;

  const FilterRule({
    required this.id,
    this.name,
    required this.field,
    required this.operator,
    required this.value,
    this.isActive = true,
    required this.createdAt,
  });

  factory FilterRule.fromJson(Map<String, dynamic> json) {
    return FilterRule(
      id: json['id'] as String,
      name: json['name'] as String?,
      field: FilterField.fromString(json['field'] as String? ?? 'messageText'),
      operator:
          FilterOperator.fromString(json['operator'] as String? ?? 'contains'),
      value: json['value'] as String? ?? '',
      isActive: json['isActive'] as bool? ?? true,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'field': field.value,
      'operator': operator.value,
      'value': value,
      'isActive': isActive,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
