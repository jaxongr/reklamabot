import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../config/api_config.dart';
import '../../../core/api/api_client.dart';

/// City suggestion model from backend.
class CitySuggestion {
  final String name;
  final String nameRu;

  const CitySuggestion({required this.name, required this.nameRu});

  factory CitySuggestion.fromJson(Map<String, dynamic> json) {
    return CitySuggestion(
      name: json['name'] as String? ?? '',
      nameRu: json['nameRu'] as String? ?? '',
    );
  }

  /// Display format: "Toshkent (Ташкент)" yoki faqat "Toshkent"
  String get displayName {
    if (nameRu.isNotEmpty && nameRu != name) {
      return '$name ($nameRu)';
    }
    return name;
  }
}

/// Fetches city suggestions from backend for autocomplete.
final citySuggestionsProvider =
    FutureProvider.family<List<CitySuggestion>, String>((ref, query) async {
  if (query.trim().length < 2) return [];

  final api = ref.read(apiClientProvider);
  final response = await api.get(
    ApiConfig.citySuggestions,
    queryParameters: {'q': query.trim()},
  );

  final data = response.data;
  if (data is List) {
    return data
        .map((e) => CitySuggestion.fromJson(e as Map<String, dynamic>))
        .toList();
  }
  return [];
});
