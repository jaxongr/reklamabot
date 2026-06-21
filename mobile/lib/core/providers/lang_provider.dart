import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../config/strings.dart';

const _kLangKey = 'app_lang';

class LangNotifier extends StateNotifier<AppLang> {
  LangNotifier() : super(AppLang.latin) {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(_kLangKey);
    if (saved == 'cyrillic') {
      state = AppLang.cyrillic;
      AppStrings.setLang(AppLang.cyrillic);
    }
  }

  Future<void> setLang(AppLang lang) async {
    state = lang;
    AppStrings.setLang(lang);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kLangKey, lang == AppLang.cyrillic ? 'cyrillic' : 'latin');
  }

  void toggle() {
    setLang(state == AppLang.latin ? AppLang.cyrillic : AppLang.latin);
  }
}

final langProvider = StateNotifierProvider<LangNotifier, AppLang>((ref) {
  return LangNotifier();
});
