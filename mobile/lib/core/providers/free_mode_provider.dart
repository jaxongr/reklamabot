import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_client.dart';

/// Global Free Mode — backend'da `/config/free-mode` orqali boshqariladi
/// true bo'lsa — hamma obuna gating'lar skip qilinadi
class FreeModeNotifier extends StateNotifier<bool> {
  final ApiClient _api;

  FreeModeNotifier(this._api) : super(true) {
    // Default: true (hozir hammasi tekin)
    refresh();
  }

  Future<void> refresh() async {
    try {
      final response = await _api.get('/config/free-mode');
      final data = response.data as Map<String, dynamic>;
      final value = data['freeMode'] as bool? ?? true;
      state = value;
    } catch (_) {
      // Tarmoq xatosi — default true (xavfsiz: hammaga ruxsat)
      state = true;
    }
  }
}

final freeModeProvider =
    StateNotifierProvider<FreeModeNotifier, bool>((ref) {
  final api = ref.read(apiClientProvider);
  return FreeModeNotifier(api);
});
