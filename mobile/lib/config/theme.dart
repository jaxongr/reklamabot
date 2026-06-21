import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Yo'lda app theme — unified premium design.
class AppTheme {
  AppTheme._();

  // ── Primary & Accent (Silk Road palette — Dispatcher bilan moslashtirilgan) ──
  static const Color primary = Color(0xFF0C4A48);
  static const Color primaryLight = Color(0xFF1A6B68);
  static const Color primaryDeep = Color(0xFF083634);
  static const Color accent = Color(0xFFC7502A);

  // ── Backward-compatible aliases ──
  static const Color primaryColor = primary;
  static const Color driverPrimary = primary;
  static const Color driverLight = Color(0xFF1A6B68);
  static const Color driverDark = Color(0xFF083634);
  static const Color accentOrange = warningColor;
  static const Color accentBlue = infoColor;
  static const Color accentPurple = primary;
  static const Color accentTeal = primaryLight;

  // ── Text colors ──
  static const Color textPrimary = Color(0xFF15100A);
  static const Color textSecondary = Color(0xFF6B5E47);
  static const Color textHint = Color(0xFF9A8B6F);

  // ── Background & Surface (Silk Road warm beige) ──
  static const Color bgBody = Color(0xFFF5EFE2);
  static const Color backgroundColor = bgBody;
  static const Color surfaceColor = Color(0xFFFFFEFC);
  static const Color cardBg = Color(0xFFFFFEFC);
  static const Color cardColor = cardBg;
  static const Color cardBorder = Color(0xFFE4DCC9);

  // ── Status colors ──
  static const Color errorColor = Color(0xFFB43B20);
  static const Color successColor = Color(0xFF2F7D6B);
  static const Color warningColor = Color(0xFFE8B440);
  static const Color infoColor = Color(0xFF0C4A48);

  // ── Misc ──
  static const Color dividerColor = cardBorder;
  static const Color shimmerBase = Color(0xFFEFE7D8);
  static const Color shimmerHighlight = Color(0xFFF5EFE2);
  static const Color frozenColor = Color(0xFF6B5E47);

  // ── Dark mode colors (Silk Road dark palette) ──
  static const Color darkBgBody = Color(0xFF0F0D0A);
  static const Color darkCardBg = Color(0xFF1E1A13);
  static const Color darkCardBorder = Color(0xFF2F2A1F);
  static const Color darkSurface = Color(0xFF181510);
  static const Color darkTextPrimary = Color(0xFFF5EFE2);
  static const Color darkTextSecondary = Color(0xFF9A8B6F);
  static const Color darkTextHint = Color(0xFF6B5E47);
  static const Color darkPrimary = Color(0xFF2A9D9A);
  static const Color darkDivider = Color(0xFF2F2A1F);

  // ── Context-aware helpers ──
  static Color bgBodyOf(BuildContext ctx) =>
      Theme.of(ctx).brightness == Brightness.dark ? darkBgBody : bgBody;
  static Color cardBgOf(BuildContext ctx) =>
      Theme.of(ctx).brightness == Brightness.dark ? darkCardBg : cardBg;
  static Color cardBorderOf(BuildContext ctx) =>
      Theme.of(ctx).brightness == Brightness.dark ? darkCardBorder : cardBorder;
  static Color textPrimaryOf(BuildContext ctx) =>
      Theme.of(ctx).brightness == Brightness.dark ? darkTextPrimary : textPrimary;
  static Color textSecondaryOf(BuildContext ctx) =>
      Theme.of(ctx).brightness == Brightness.dark ? darkTextSecondary : textSecondary;
  static Color textHintOf(BuildContext ctx) =>
      Theme.of(ctx).brightness == Brightness.dark ? darkTextHint : textHint;
  static Color surfaceOf(BuildContext ctx) =>
      Theme.of(ctx).brightness == Brightness.dark ? darkSurface : surfaceColor;
  static Color dividerOf(BuildContext ctx) =>
      Theme.of(ctx).brightness == Brightness.dark ? darkDivider : dividerColor;
  static bool isDark(BuildContext ctx) =>
      Theme.of(ctx).brightness == Brightness.dark;

  // ── Gradients (Silk Road palette) ──
  static const LinearGradient walletGradient = LinearGradient(
    colors: [Color(0xFF0C4A48), Color(0xFF1A6B68), Color(0xFF15100A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient primaryGradient = walletGradient;

  static const LinearGradient testrGradient = LinearGradient(
    colors: [Color(0xFFC7502A), Color(0xFFE8B440)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient driverGradient = LinearGradient(
    colors: [Color(0xFF0C4A48), Color(0xFF1A6B68)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient blueGradient = LinearGradient(
    colors: [Color(0xFF0F3460), Color(0xFF16213E)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient purpleGradient = LinearGradient(
    colors: [Color(0xFF1A1A2E), Color(0xFF0F3460)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // ── Shadows ──
  static const BoxShadow cardShadow = BoxShadow(
    color: Color(0x05000000),
    blurRadius: 8,
    offset: Offset(0, 2),
  );

  static const BoxShadow elevatedShadow = BoxShadow(
    color: Color(0x0A000000),
    blurRadius: 16,
    offset: Offset(0, 4),
  );

  // ── Border radius ──
  static const double radiusSmall = 8.0;
  static const double radiusMedium = 12.0;
  static const double radiusLarge = 16.0;
  static const double radiusXLarge = 24.0;

  // ── Spacing ──
  static const double spacingXS = 4.0;
  static const double spacingS = 8.0;
  static const double spacingM = 16.0;
  static const double spacingL = 24.0;
  static const double spacingXL = 32.0;

  // ── Cyrillic fallback — Outfit doesn't support Қ/қ/Ғ/Ҳ/Ў ──
  static const List<String> _fontFallback = ['Noto Sans', 'Roboto', 'sans-serif'];

  /// Apply fontFamilyFallback to every style in TextTheme.
  static TextTheme _withFallback(TextTheme t) => t.copyWith(
    displayLarge: t.displayLarge?.copyWith(fontFamilyFallback: _fontFallback),
    displayMedium: t.displayMedium?.copyWith(fontFamilyFallback: _fontFallback),
    displaySmall: t.displaySmall?.copyWith(fontFamilyFallback: _fontFallback),
    headlineLarge: t.headlineLarge?.copyWith(fontFamilyFallback: _fontFallback),
    headlineMedium: t.headlineMedium?.copyWith(fontFamilyFallback: _fontFallback),
    headlineSmall: t.headlineSmall?.copyWith(fontFamilyFallback: _fontFallback),
    titleLarge: t.titleLarge?.copyWith(fontFamilyFallback: _fontFallback),
    titleMedium: t.titleMedium?.copyWith(fontFamilyFallback: _fontFallback),
    titleSmall: t.titleSmall?.copyWith(fontFamilyFallback: _fontFallback),
    bodyLarge: t.bodyLarge?.copyWith(fontFamilyFallback: _fontFallback),
    bodyMedium: t.bodyMedium?.copyWith(fontFamilyFallback: _fontFallback),
    bodySmall: t.bodySmall?.copyWith(fontFamilyFallback: _fontFallback),
    labelLarge: t.labelLarge?.copyWith(fontFamilyFallback: _fontFallback),
    labelMedium: t.labelMedium?.copyWith(fontFamilyFallback: _fontFallback),
    labelSmall: t.labelSmall?.copyWith(fontFamilyFallback: _fontFallback),
  );

  /// Full light theme definition — Outfit font, Material3.
  static ThemeData get lightTheme {
    final textTheme = _withFallback(GoogleFonts.outfitTextTheme());

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primary,
        primary: primary,
        onPrimary: Colors.white,
        secondary: accent,
        onSecondary: Colors.white,
        surface: surfaceColor,
        error: errorColor,
        brightness: Brightness.light,
      ),
      scaffoldBackgroundColor: bgBody,
      cardColor: cardBg,
      dividerColor: cardBorder,
      textTheme: textTheme.copyWith(
        headlineLarge: textTheme.headlineLarge?.copyWith(
          color: textPrimary,
          fontWeight: FontWeight.w700,
          fontSize: 28,
        ),
        headlineMedium: textTheme.headlineMedium?.copyWith(
          color: textPrimary,
          fontWeight: FontWeight.w600,
          fontSize: 22,
        ),
        headlineSmall: textTheme.headlineSmall?.copyWith(
          color: textPrimary,
          fontWeight: FontWeight.w600,
          fontSize: 18,
        ),
        titleLarge: textTheme.titleLarge?.copyWith(
          color: textPrimary,
          fontWeight: FontWeight.w600,
          fontSize: 16,
        ),
        titleMedium: textTheme.titleMedium?.copyWith(
          color: textPrimary,
          fontWeight: FontWeight.w500,
          fontSize: 14,
        ),
        bodyLarge: textTheme.bodyLarge?.copyWith(
          color: textPrimary,
          fontSize: 16,
        ),
        bodyMedium: textTheme.bodyMedium?.copyWith(
          color: textSecondary,
          fontSize: 14,
        ),
        bodySmall: textTheme.bodySmall?.copyWith(
          color: textHint,
          fontSize: 12,
        ),
        labelLarge: textTheme.labelLarge?.copyWith(
          color: Colors.white,
          fontWeight: FontWeight.w600,
          fontSize: 14,
        ),
      ),
      appBarTheme: AppBarTheme(
        elevation: 0,
        scrolledUnderElevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: textPrimary,
        centerTitle: false,
        titleTextStyle: GoogleFonts.outfit(
          color: textPrimary,
          fontSize: 20,
          fontWeight: FontWeight.w700,
        ),
        surfaceTintColor: Colors.transparent,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        elevation: 0,
        selectedItemColor: primary,
        unselectedItemColor: textHint,
        type: BottomNavigationBarType.fixed,
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusLarge),
          side: const BorderSide(color: cardBorder, width: 1),
        ),
        color: cardBg,
        margin: EdgeInsets.zero,
        surfaceTintColor: Colors.transparent,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radiusMedium),
          ),
          textStyle: GoogleFonts.outfit(
            fontWeight: FontWeight.w600,
            fontSize: 15,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primary,
          side: const BorderSide(color: primary, width: 1.5),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radiusMedium),
          ),
          textStyle: GoogleFonts.outfit(
            fontWeight: FontWeight.w600,
            fontSize: 15,
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: primary,
          textStyle: GoogleFonts.outfit(
            fontWeight: FontWeight.w600,
            fontSize: 14,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMedium),
          borderSide: const BorderSide(color: cardBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMedium),
          borderSide: const BorderSide(color: cardBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMedium),
          borderSide: const BorderSide(color: primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMedium),
          borderSide: const BorderSide(color: errorColor, width: 1.5),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMedium),
          borderSide: const BorderSide(color: errorColor, width: 2),
        ),
        hintStyle: GoogleFonts.outfit(
          color: textHint,
          fontSize: 14,
        ),
        labelStyle: GoogleFonts.outfit(
          color: textSecondary,
          fontSize: 14,
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        height: 64,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return GoogleFonts.outfit(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: primary,
            );
          }
          return GoogleFonts.outfit(
            fontSize: 11,
            fontWeight: FontWeight.w500,
            color: textHint,
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: primary, size: 24);
          }
          return const IconThemeData(color: textHint, size: 24);
        }),
        surfaceTintColor: Colors.transparent,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: primary.withValues(alpha: 0.08),
        selectedColor: primary.withValues(alpha: 0.15),
        labelStyle: GoogleFonts.outfit(
          fontSize: 13,
          fontWeight: FontWeight.w500,
          color: primary,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        side: BorderSide.none,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      ),
      dialogTheme: DialogThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusLarge),
        ),
        surfaceTintColor: Colors.transparent,
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        surfaceTintColor: Colors.transparent,
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusMedium),
        ),
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: primary,
        linearTrackColor: Color(0xFFF0EEF5),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: primary,
        foregroundColor: Colors.white,
        elevation: 2,
        shape: CircleBorder(),
      ),
    );
  }

  /// Full dark theme definition — Outfit font, Material3.
  static ThemeData get darkTheme {
    final textTheme = _withFallback(GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme));

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: ColorScheme.fromSeed(
        seedColor: darkPrimary,
        primary: darkPrimary,
        onPrimary: Colors.white,
        secondary: accent,
        onSecondary: Colors.white,
        surface: darkSurface,
        error: errorColor,
        brightness: Brightness.dark,
      ),
      scaffoldBackgroundColor: darkBgBody,
      cardColor: darkCardBg,
      dividerColor: darkCardBorder,
      textTheme: textTheme.copyWith(
        headlineLarge: textTheme.headlineLarge?.copyWith(
          color: darkTextPrimary,
          fontWeight: FontWeight.w700,
          fontSize: 28,
        ),
        headlineMedium: textTheme.headlineMedium?.copyWith(
          color: darkTextPrimary,
          fontWeight: FontWeight.w600,
          fontSize: 22,
        ),
        headlineSmall: textTheme.headlineSmall?.copyWith(
          color: darkTextPrimary,
          fontWeight: FontWeight.w600,
          fontSize: 18,
        ),
        titleLarge: textTheme.titleLarge?.copyWith(
          color: darkTextPrimary,
          fontWeight: FontWeight.w600,
          fontSize: 16,
        ),
        titleMedium: textTheme.titleMedium?.copyWith(
          color: darkTextPrimary,
          fontWeight: FontWeight.w500,
          fontSize: 14,
        ),
        bodyLarge: textTheme.bodyLarge?.copyWith(
          color: darkTextPrimary,
          fontSize: 16,
        ),
        bodyMedium: textTheme.bodyMedium?.copyWith(
          color: darkTextSecondary,
          fontSize: 14,
        ),
        bodySmall: textTheme.bodySmall?.copyWith(
          color: darkTextHint,
          fontSize: 12,
        ),
        labelLarge: textTheme.labelLarge?.copyWith(
          color: Colors.white,
          fontWeight: FontWeight.w600,
          fontSize: 14,
        ),
      ),
      appBarTheme: AppBarTheme(
        elevation: 0,
        scrolledUnderElevation: 0,
        backgroundColor: darkCardBg,
        foregroundColor: darkTextPrimary,
        centerTitle: false,
        titleTextStyle: GoogleFonts.outfit(
          color: darkTextPrimary,
          fontSize: 20,
          fontWeight: FontWeight.w700,
        ),
        surfaceTintColor: Colors.transparent,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: darkCardBg,
        elevation: 0,
        selectedItemColor: darkPrimary,
        unselectedItemColor: darkTextHint,
        type: BottomNavigationBarType.fixed,
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusLarge),
          side: const BorderSide(color: darkCardBorder, width: 1),
        ),
        color: darkCardBg,
        margin: EdgeInsets.zero,
        surfaceTintColor: Colors.transparent,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: darkPrimary,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radiusMedium),
          ),
          textStyle: GoogleFonts.outfit(
            fontWeight: FontWeight.w600,
            fontSize: 15,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: darkPrimary,
          side: const BorderSide(color: darkPrimary, width: 1.5),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radiusMedium),
          ),
          textStyle: GoogleFonts.outfit(
            fontWeight: FontWeight.w600,
            fontSize: 15,
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: darkPrimary,
          textStyle: GoogleFonts.outfit(
            fontWeight: FontWeight.w600,
            fontSize: 14,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: darkSurface,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMedium),
          borderSide: const BorderSide(color: darkCardBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMedium),
          borderSide: const BorderSide(color: darkCardBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMedium),
          borderSide: const BorderSide(color: darkPrimary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMedium),
          borderSide: const BorderSide(color: errorColor, width: 1.5),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMedium),
          borderSide: const BorderSide(color: errorColor, width: 2),
        ),
        hintStyle: GoogleFonts.outfit(
          color: darkTextHint,
          fontSize: 14,
        ),
        labelStyle: GoogleFonts.outfit(
          color: darkTextSecondary,
          fontSize: 14,
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        height: 64,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return GoogleFonts.outfit(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: darkPrimary,
            );
          }
          return GoogleFonts.outfit(
            fontSize: 11,
            fontWeight: FontWeight.w500,
            color: darkTextHint,
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: darkPrimary, size: 24);
          }
          return const IconThemeData(color: darkTextHint, size: 24);
        }),
        surfaceTintColor: Colors.transparent,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: darkPrimary.withValues(alpha: 0.15),
        selectedColor: darkPrimary.withValues(alpha: 0.25),
        labelStyle: GoogleFonts.outfit(
          fontSize: 13,
          fontWeight: FontWeight.w500,
          color: darkPrimary,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        side: BorderSide.none,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: darkCardBg,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusLarge),
        ),
        surfaceTintColor: Colors.transparent,
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: darkCardBg,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        surfaceTintColor: Colors.transparent,
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusMedium),
        ),
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: darkPrimary,
        linearTrackColor: Color(0xFF2A2A3E),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: darkPrimary,
        foregroundColor: Colors.white,
        elevation: 2,
        shape: CircleBorder(),
      ),
    );
  }
}
