import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color primary = Color(0xFF1A1A2E);
  static const Color primaryLight = Color(0xFF16213E);
  static const Color primaryDark = Color(0xFF0F0F1E);
  static const Color accent = Color(0xFF2DD4A8);
  static const Color accentLight = Color(0xFF5FE3C0);
  static const Color bgBody = Color(0xFFFAF9FE);
  static const Color cardBg = Color(0xFFFFFFFF);
  static const Color cardBorder = Color(0xFFF0EEF5);
  static const Color textPrimary = Color(0xFF1A1A2E);
  static const Color textSecondary = Color(0xFF999999);
  static const Color textHint = Color(0xFFBBBBBB);
  static const Color successColor = Color(0xFF16A34A);
  static const Color warningColor = Color(0xFFF59E0B);
  static const Color errorColor = Color(0xFFEF4444);
  static const Color infoColor = Color(0xFF3B82F6);

  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft, end: Alignment.bottomRight,
    colors: [primary, primaryLight, Color(0xFF0F3460)],
  );
  static const LinearGradient accentGradient = LinearGradient(
    begin: Alignment.topLeft, end: Alignment.bottomRight,
    colors: [accent, accentLight],
  );

  static const double radiusSmall = 8;
  static const double radiusMedium = 12;
  static const double radiusLarge = 16;
  static const double radiusXLarge = 24;
  static const double spacingXS = 4;
  static const double spacingS = 8;
  static const double spacingM = 16;
  static const double spacingL = 24;
  static const double spacingXL = 32;

  static ThemeData get light => ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    primaryColor: primary,
    scaffoldBackgroundColor: bgBody,
    colorScheme: const ColorScheme.light(
      primary: primary, secondary: accent, error: errorColor,
      surface: cardBg, onPrimary: Colors.white, onSecondary: Colors.white, onSurface: textPrimary,
    ),
    textTheme: GoogleFonts.outfitTextTheme().apply(bodyColor: textPrimary, displayColor: textPrimary),
    appBarTheme: AppBarTheme(
      backgroundColor: Colors.transparent, elevation: 0, scrolledUnderElevation: 0,
      centerTitle: false, iconTheme: const IconThemeData(color: textPrimary),
      titleTextStyle: GoogleFonts.outfit(color: textPrimary, fontSize: 18, fontWeight: FontWeight.w600),
    ),
    cardTheme: CardTheme(
      color: cardBg, elevation: 0, margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(radiusLarge),
        side: const BorderSide(color: cardBorder)),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primary, foregroundColor: Colors.white, elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(radiusMedium)),
        textStyle: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w600),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true, fillColor: Colors.white,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(radiusMedium),
        borderSide: const BorderSide(color: cardBorder)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(radiusMedium),
        borderSide: const BorderSide(color: cardBorder)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(radiusMedium),
        borderSide: const BorderSide(color: primary, width: 1.5)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      hintStyle: GoogleFonts.outfit(color: textHint, fontSize: 14),
    ),
  );
}
