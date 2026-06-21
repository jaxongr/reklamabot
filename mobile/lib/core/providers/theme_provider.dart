import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _kThemeKey = 'app_theme_mode';

class ThemeModeNotifier extends StateNotifier<ThemeMode> {
  ThemeModeNotifier() : super(ThemeMode.light) {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(_kThemeKey);
    if (saved == 'dark') {
      state = ThemeMode.dark;
    }
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    state = mode;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kThemeKey, mode == ThemeMode.dark ? 'dark' : 'light');
  }

  void toggle() {
    setThemeMode(state == ThemeMode.light ? ThemeMode.dark : ThemeMode.light);
  }
}

final themeModeProvider = StateNotifierProvider<ThemeModeNotifier, ThemeMode>((ref) {
  return ThemeModeNotifier();
});
