import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Silk Road design tokens — FAQAT dispatcher app uchun.
/// Driver app `AppTheme` dan foydalanadi, tegilmaydi.
///
/// Manba: yolda-pro.html (warm beige + teal + terracotta + saffron).
class SilkTheme {
  SilkTheme._();

  // ── Light palette ──
  static const Color bg = Color(0xFFF5EFE2);
  static const Color bg2 = Color(0xFFEFE7D8);
  static const Color surface = Color(0xFFFFFEFC);
  static const Color border = Color(0xFFE4DCC9);
  static const Color ink = Color(0xFF15100A);
  static const Color ink2 = Color(0xFF2A2318);
  static const Color muted = Color(0xFF6B5E47);
  static const Color muted2 = Color(0xFF9A8B6F);
  static const Color soft = Color(0xFFEFE7D8);

  // ── Brand + accents ──
  static const Color brand = Color(0xFF0C4A48);
  static const Color brand2 = Color(0xFF1A6B68);
  static const Color accent = Color(0xFFC7502A);
  static const Color accent2 = Color(0xFFE8B440);
  static const Color success = Color(0xFF2F7D6B);
  static const Color danger = Color(0xFFB43B20);

  // ── Dark palette ──
  static const Color darkBg = Color(0xFF0F0D0A);
  static const Color darkBg2 = Color(0xFF181510);
  static const Color darkSurface = Color(0xFF1E1A13);
  static const Color darkBorder = Color(0xFF2F2A1F);
  static const Color darkInk = Color(0xFFF5EFE2);
  static const Color darkInk2 = Color(0xFFE4DCC9);
  static const Color darkMuted = Color(0xFF9A8B6F);
  static const Color darkMuted2 = Color(0xFF6B5E47);
  static const Color darkSoft = Color(0xFF252015);
  static const Color darkBrand = Color(0xFF2A9D9A);
  static const Color darkBrand2 = Color(0xFF3BC0BC);
  static const Color darkAccent = Color(0xFFE87050);
  static const Color darkAccent2 = Color(0xFFF0C060);
  static const Color darkSuccess = Color(0xFF4AAE95);
  static const Color darkDanger = Color(0xFFD85A3F);

  // ── Context-aware helpers ──
  static bool isDark(BuildContext c) =>
      Theme.of(c).brightness == Brightness.dark;

  static Color bgOf(BuildContext c) => isDark(c) ? darkBg : bg;
  static Color bg2Of(BuildContext c) => isDark(c) ? darkBg2 : bg2;
  static Color surfaceOf(BuildContext c) =>
      isDark(c) ? darkSurface : surface;
  static Color borderOf(BuildContext c) =>
      isDark(c) ? darkBorder : border;
  static Color inkOf(BuildContext c) => isDark(c) ? darkInk : ink;
  static Color ink2Of(BuildContext c) => isDark(c) ? darkInk2 : ink2;
  static Color mutedOf(BuildContext c) => isDark(c) ? darkMuted : muted;
  static Color muted2Of(BuildContext c) =>
      isDark(c) ? darkMuted2 : muted2;
  static Color softOf(BuildContext c) => isDark(c) ? darkSoft : soft;
  static Color brandOf(BuildContext c) => isDark(c) ? darkBrand : brand;
  static Color brand2Of(BuildContext c) =>
      isDark(c) ? darkBrand2 : brand2;
  static Color accentOf(BuildContext c) =>
      isDark(c) ? darkAccent : accent;
  static Color accent2Of(BuildContext c) =>
      isDark(c) ? darkAccent2 : accent2;
  static Color successOf(BuildContext c) =>
      isDark(c) ? darkSuccess : success;
  static Color dangerOf(BuildContext c) =>
      isDark(c) ? darkDanger : danger;

  // ── Border radius ──
  static const double radiusXS = 6.0;
  static const double radiusSmall = 8.0;
  static const double radiusMedium = 12.0;
  static const double radiusBtn = 14.0;
  static const double radiusLarge = 16.0;
  static const double radiusRoute = 18.0;
  static const double radiusChat = 20.0;
  static const double radiusCard = 24.0;
  static const double radiusMap = 28.0;
  static const double radiusHero = 32.0;

  // ── Spacing ──
  static const double s4 = 4.0;
  static const double s8 = 8.0;
  static const double s12 = 12.0;
  static const double s16 = 16.0;
  static const double s20 = 20.0;
  static const double s24 = 24.0;
  static const double s32 = 32.0;

  // ── Gradients ──
  static const LinearGradient heroGradient = LinearGradient(
    colors: [brand, ink],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient accentOverlay = LinearGradient(
    colors: [Color(0x40E8B440), Color(0x00E8B440)],
    begin: Alignment.topRight,
    end: Alignment.centerLeft,
  );

  static const LinearGradient terracottaOverlay = LinearGradient(
    colors: [Color(0x2EC7502A), Color(0x00C7502A)],
    begin: Alignment.bottomLeft,
    end: Alignment.center,
  );

  static const LinearGradient supportAvatar = LinearGradient(
    colors: [accent, accent2],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // ── Shadows ──
  static const BoxShadow cardShadow = BoxShadow(
    color: Color(0x05000000),
    blurRadius: 8,
    offset: Offset(0, 2),
  );

  static const BoxShadow heroShadow = BoxShadow(
    color: Color(0x400C4A48),
    blurRadius: 40,
    offset: Offset(0, 20),
    spreadRadius: -10,
  );

  // ── Font helpers ──
  static const List<String> _fontFallback = ['Noto Sans', 'Roboto', 'sans-serif'];

  static TextStyle display({
    double? fontSize,
    FontWeight fontWeight = FontWeight.w600,
    Color? color,
    double? letterSpacing,
    double? height,
  }) =>
      GoogleFonts.bricolageGrotesque(
        fontSize: fontSize,
        fontWeight: fontWeight,
        color: color,
        letterSpacing: letterSpacing,
        height: height,
      ).copyWith(fontFamilyFallback: _fontFallback);

  static TextStyle body({
    double? fontSize,
    FontWeight fontWeight = FontWeight.w400,
    Color? color,
    double? letterSpacing,
    double? height,
  }) =>
      GoogleFonts.inter(
        fontSize: fontSize,
        fontWeight: fontWeight,
        color: color,
        letterSpacing: letterSpacing,
        height: height,
      ).copyWith(fontFamilyFallback: _fontFallback);

  static TextStyle mono({
    double? fontSize,
    FontWeight fontWeight = FontWeight.w500,
    Color? color,
    double? letterSpacing,
  }) =>
      GoogleFonts.jetBrainsMono(
        fontSize: fontSize,
        fontWeight: fontWeight,
        color: color,
        letterSpacing: letterSpacing,
      ).copyWith(fontFamilyFallback: _fontFallback);

  // ── Typography presets ──
  static TextStyle heroAmount() => display(
        fontSize: 38,
        fontWeight: FontWeight.w600,
        color: Colors.white,
        letterSpacing: -0.76,
        height: 1.0,
      );

  static TextStyle sectionTitle(BuildContext c) => display(
        fontSize: 22,
        fontWeight: FontWeight.w600,
        color: inkOf(c),
        letterSpacing: -0.22,
      );

  static TextStyle screenTitle(BuildContext c) => display(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: inkOf(c),
        letterSpacing: -0.4,
      );

  static TextStyle cardName(BuildContext c) => body(
        fontSize: 15,
        fontWeight: FontWeight.w600,
        color: inkOf(c),
      );

  static TextStyle cardCity(BuildContext c) => body(
        fontSize: 15,
        fontWeight: FontWeight.w600,
        color: inkOf(c),
      );

  static TextStyle cardMeta(BuildContext c) => body(
        fontSize: 12,
        color: mutedOf(c),
      );

  static TextStyle cardPrice(BuildContext c) => display(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: inkOf(c),
        letterSpacing: -0.14,
      );

  static TextStyle pill(Color color) => body(
        fontSize: 10,
        fontWeight: FontWeight.w700,
        color: color,
        letterSpacing: 0.8,
      );

  static TextStyle label(BuildContext c) => body(
        fontSize: 10,
        fontWeight: FontWeight.w600,
        color: mutedOf(c),
        letterSpacing: 0.8,
      );

  static TextStyle btn() => body(
        fontSize: 13,
        fontWeight: FontWeight.w600,
      );

  // ── Full light theme ──
  static ThemeData get lightTheme {
    final TextStyle geistBase = GoogleFonts.inter();
    final geist = TextTheme(
      displayLarge: geistBase.copyWith(fontSize: 57, fontWeight: FontWeight.w400),
      displayMedium: geistBase.copyWith(fontSize: 45, fontWeight: FontWeight.w400),
      displaySmall: geistBase.copyWith(fontSize: 36, fontWeight: FontWeight.w400),
      headlineLarge: geistBase.copyWith(fontSize: 32, fontWeight: FontWeight.w400),
      headlineMedium: geistBase.copyWith(fontSize: 28, fontWeight: FontWeight.w400),
      headlineSmall: geistBase.copyWith(fontSize: 24, fontWeight: FontWeight.w400),
      titleLarge: geistBase.copyWith(fontSize: 22, fontWeight: FontWeight.w500),
      titleMedium: geistBase.copyWith(fontSize: 16, fontWeight: FontWeight.w500),
      titleSmall: geistBase.copyWith(fontSize: 14, fontWeight: FontWeight.w500),
      bodyLarge: geistBase.copyWith(fontSize: 16, fontWeight: FontWeight.w400),
      bodyMedium: geistBase.copyWith(fontSize: 14, fontWeight: FontWeight.w400),
      bodySmall: geistBase.copyWith(fontSize: 12, fontWeight: FontWeight.w400),
      labelLarge: geistBase.copyWith(fontSize: 14, fontWeight: FontWeight.w500),
      labelMedium: geistBase.copyWith(fontSize: 12, fontWeight: FontWeight.w500),
      labelSmall: geistBase.copyWith(fontSize: 11, fontWeight: FontWeight.w500),
    );
    final disp = GoogleFonts.bricolageGrotesque();

    TextStyle _fb(TextStyle? s) =>
        (s ?? const TextStyle()).copyWith(fontFamilyFallback: _fontFallback);

    final tt = geist.copyWith(
      displayLarge: disp.copyWith(
        color: ink, fontWeight: FontWeight.w700, fontSize: 38,
        letterSpacing: -0.76, height: 1.0, fontFamilyFallback: _fontFallback,
      ),
      displayMedium: disp.copyWith(
        color: ink, fontWeight: FontWeight.w600, fontSize: 28,
        letterSpacing: -0.56, fontFamilyFallback: _fontFallback,
      ),
      displaySmall: disp.copyWith(
        color: ink, fontWeight: FontWeight.w600, fontSize: 22,
        letterSpacing: -0.22, fontFamilyFallback: _fontFallback,
      ),
      headlineLarge: disp.copyWith(
        color: ink, fontWeight: FontWeight.w700, fontSize: 26,
        fontFamilyFallback: _fontFallback,
      ),
      headlineMedium: disp.copyWith(
        color: ink, fontWeight: FontWeight.w600, fontSize: 22,
        letterSpacing: -0.22, fontFamilyFallback: _fontFallback,
      ),
      headlineSmall: disp.copyWith(
        color: ink, fontWeight: FontWeight.w600, fontSize: 20,
        letterSpacing: -0.4, fontFamilyFallback: _fontFallback,
      ),
      titleLarge: disp.copyWith(
        color: ink, fontWeight: FontWeight.w600, fontSize: 17,
        fontFamilyFallback: _fontFallback,
      ),
      titleMedium: _fb(geist.titleMedium).copyWith(
        color: ink, fontWeight: FontWeight.w600, fontSize: 15,
      ),
      titleSmall: _fb(geist.titleSmall).copyWith(
        color: ink, fontWeight: FontWeight.w500, fontSize: 13,
      ),
      bodyLarge: _fb(geist.bodyLarge).copyWith(color: ink, fontSize: 15),
      bodyMedium: _fb(geist.bodyMedium).copyWith(color: muted, fontSize: 13),
      bodySmall: _fb(geist.bodySmall).copyWith(color: muted2, fontSize: 11),
      labelLarge: _fb(geist.labelLarge).copyWith(
        color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13,
      ),
      labelMedium: _fb(geist.labelMedium).copyWith(
        color: ink, fontWeight: FontWeight.w600, fontSize: 11,
      ),
      labelSmall: _fb(geist.labelSmall).copyWith(
        color: muted, fontWeight: FontWeight.w500, fontSize: 10,
        letterSpacing: 0.8,
      ),
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: const ColorScheme(
        brightness: Brightness.light,
        primary: brand,
        onPrimary: bg,
        secondary: accent,
        onSecondary: bg,
        tertiary: accent2,
        onTertiary: ink,
        surface: surface,
        onSurface: ink,
        surfaceContainerHighest: soft,
        error: danger,
        onError: bg,
        outline: border,
        outlineVariant: border,
      ),
      scaffoldBackgroundColor: bg,
      cardColor: surface,
      dividerColor: border,
      textTheme: tt,
      appBarTheme: AppBarTheme(
        elevation: 0,
        scrolledUnderElevation: 0,
        backgroundColor: bg,
        foregroundColor: ink,
        centerTitle: false,
        titleTextStyle: disp.copyWith(
          color: ink, fontSize: 20, fontWeight: FontWeight.w600,
          letterSpacing: -0.4, fontFamilyFallback: _fontFallback,
        ),
        surfaceTintColor: Colors.transparent,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: bg,
        elevation: 0,
        selectedItemColor: brand,
        unselectedItemColor: muted2,
        type: BottomNavigationBarType.fixed,
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusCard),
          side: const BorderSide(color: border, width: 1),
        ),
        color: surface,
        margin: EdgeInsets.zero,
        surfaceTintColor: Colors.transparent,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: ink,
          foregroundColor: bg,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 13),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(999),
          ),
          textStyle: btn(),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: ink,
          backgroundColor: surface,
          side: const BorderSide(color: border, width: 1),
          padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 13),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radiusBtn),
          ),
          textStyle: btn(),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: brand,
          textStyle: btn(),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surface,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusBtn),
          borderSide: const BorderSide(color: border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusBtn),
          borderSide: const BorderSide(color: border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusBtn),
          borderSide: const BorderSide(color: brand, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusBtn),
          borderSide: const BorderSide(color: danger, width: 1.5),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusBtn),
          borderSide: const BorderSide(color: danger, width: 2),
        ),
        hintStyle: body(color: muted2, fontSize: 14),
        labelStyle: body(color: muted, fontSize: 14),
      ),
      navigationBarTheme: NavigationBarThemeData(
        height: 68,
        backgroundColor: bg,
        indicatorColor: Colors.transparent,
        labelTextStyle: WidgetStateProperty.resolveWith((st) {
          final sel = st.contains(WidgetState.selected);
          return body(
            fontSize: 11,
            fontWeight: sel ? FontWeight.w600 : FontWeight.w500,
            color: sel ? brand : muted2,
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((st) {
          final sel = st.contains(WidgetState.selected);
          return IconThemeData(color: sel ? ink : muted2, size: 22);
        }),
        surfaceTintColor: Colors.transparent,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: soft,
        selectedColor: ink,
        secondarySelectedColor: ink,
        labelStyle: body(fontSize: 13, color: muted),
        secondaryLabelStyle: body(fontSize: 13, color: bg),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(999),
          side: const BorderSide(color: border),
        ),
        side: const BorderSide(color: border),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusCard),
        ),
        surfaceTintColor: Colors.transparent,
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: bg,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(radiusHero)),
        ),
        surfaceTintColor: Colors.transparent,
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: ink,
        contentTextStyle: body(color: bg, fontSize: 13, fontWeight: FontWeight.w600),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusBtn),
        ),
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: brand,
        linearTrackColor: bg2,
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: ink,
        foregroundColor: bg,
        elevation: 0,
        shape: CircleBorder(),
      ),
      dividerTheme: const DividerThemeData(
        color: border,
        space: 1,
        thickness: 1,
      ),
    );
  }

  // ── Full dark theme ──
  static ThemeData get darkTheme {
    final TextStyle geistBase = GoogleFonts.inter(color: darkInk);
    final geist = TextTheme(
      displayLarge: geistBase.copyWith(fontSize: 57, fontWeight: FontWeight.w400),
      displayMedium: geistBase.copyWith(fontSize: 45, fontWeight: FontWeight.w400),
      displaySmall: geistBase.copyWith(fontSize: 36, fontWeight: FontWeight.w400),
      headlineLarge: geistBase.copyWith(fontSize: 32, fontWeight: FontWeight.w400),
      headlineMedium: geistBase.copyWith(fontSize: 28, fontWeight: FontWeight.w400),
      headlineSmall: geistBase.copyWith(fontSize: 24, fontWeight: FontWeight.w400),
      titleLarge: geistBase.copyWith(fontSize: 22, fontWeight: FontWeight.w500),
      titleMedium: geistBase.copyWith(fontSize: 16, fontWeight: FontWeight.w500),
      titleSmall: geistBase.copyWith(fontSize: 14, fontWeight: FontWeight.w500),
      bodyLarge: geistBase.copyWith(fontSize: 16, fontWeight: FontWeight.w400),
      bodyMedium: geistBase.copyWith(fontSize: 14, fontWeight: FontWeight.w400),
      bodySmall: geistBase.copyWith(fontSize: 12, fontWeight: FontWeight.w400),
      labelLarge: geistBase.copyWith(fontSize: 14, fontWeight: FontWeight.w500),
      labelMedium: geistBase.copyWith(fontSize: 12, fontWeight: FontWeight.w500),
      labelSmall: geistBase.copyWith(fontSize: 11, fontWeight: FontWeight.w500),
    );
    final disp = GoogleFonts.bricolageGrotesque();

    TextStyle _fb(TextStyle? s) =>
        (s ?? const TextStyle()).copyWith(fontFamilyFallback: _fontFallback);

    final tt = geist.copyWith(
      displayLarge: disp.copyWith(
        color: darkInk, fontWeight: FontWeight.w700, fontSize: 38,
        letterSpacing: -0.76, height: 1.0, fontFamilyFallback: _fontFallback,
      ),
      displayMedium: disp.copyWith(
        color: darkInk, fontWeight: FontWeight.w600, fontSize: 28,
        letterSpacing: -0.56, fontFamilyFallback: _fontFallback,
      ),
      displaySmall: disp.copyWith(
        color: darkInk, fontWeight: FontWeight.w600, fontSize: 22,
        letterSpacing: -0.22, fontFamilyFallback: _fontFallback,
      ),
      headlineLarge: disp.copyWith(
        color: darkInk, fontWeight: FontWeight.w700, fontSize: 26,
        fontFamilyFallback: _fontFallback,
      ),
      headlineMedium: disp.copyWith(
        color: darkInk, fontWeight: FontWeight.w600, fontSize: 22,
        letterSpacing: -0.22, fontFamilyFallback: _fontFallback,
      ),
      headlineSmall: disp.copyWith(
        color: darkInk, fontWeight: FontWeight.w600, fontSize: 20,
        letterSpacing: -0.4, fontFamilyFallback: _fontFallback,
      ),
      titleLarge: disp.copyWith(
        color: darkInk, fontWeight: FontWeight.w600, fontSize: 17,
        fontFamilyFallback: _fontFallback,
      ),
      titleMedium: _fb(geist.titleMedium).copyWith(
        color: darkInk, fontWeight: FontWeight.w600, fontSize: 15,
      ),
      titleSmall: _fb(geist.titleSmall).copyWith(
        color: darkInk, fontWeight: FontWeight.w500, fontSize: 13,
      ),
      bodyLarge: _fb(geist.bodyLarge).copyWith(color: darkInk, fontSize: 15),
      bodyMedium: _fb(geist.bodyMedium).copyWith(color: darkMuted, fontSize: 13),
      bodySmall: _fb(geist.bodySmall).copyWith(color: darkMuted2, fontSize: 11),
      labelLarge: _fb(geist.labelLarge).copyWith(
        color: darkBg, fontWeight: FontWeight.w600, fontSize: 13,
      ),
      labelMedium: _fb(geist.labelMedium).copyWith(
        color: darkInk, fontWeight: FontWeight.w600, fontSize: 11,
      ),
      labelSmall: _fb(geist.labelSmall).copyWith(
        color: darkMuted, fontWeight: FontWeight.w500, fontSize: 10,
        letterSpacing: 0.8,
      ),
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: const ColorScheme(
        brightness: Brightness.dark,
        primary: darkBrand,
        onPrimary: darkBg,
        secondary: darkAccent,
        onSecondary: darkBg,
        tertiary: darkAccent2,
        onTertiary: darkBg,
        surface: darkSurface,
        onSurface: darkInk,
        surfaceContainerHighest: darkSoft,
        error: darkDanger,
        onError: darkBg,
        outline: darkBorder,
        outlineVariant: darkBorder,
      ),
      scaffoldBackgroundColor: darkBg,
      cardColor: darkSurface,
      dividerColor: darkBorder,
      textTheme: tt,
      appBarTheme: AppBarTheme(
        elevation: 0,
        scrolledUnderElevation: 0,
        backgroundColor: darkBg,
        foregroundColor: darkInk,
        centerTitle: false,
        titleTextStyle: disp.copyWith(
          color: darkInk, fontSize: 20, fontWeight: FontWeight.w600,
          letterSpacing: -0.4, fontFamilyFallback: _fontFallback,
        ),
        surfaceTintColor: Colors.transparent,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: darkBg,
        elevation: 0,
        selectedItemColor: darkBrand,
        unselectedItemColor: darkMuted2,
        type: BottomNavigationBarType.fixed,
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusCard),
          side: const BorderSide(color: darkBorder, width: 1),
        ),
        color: darkSurface,
        margin: EdgeInsets.zero,
        surfaceTintColor: Colors.transparent,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: darkInk,
          foregroundColor: darkBg,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 13),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(999),
          ),
          textStyle: btn(),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: darkInk,
          backgroundColor: darkSurface,
          side: const BorderSide(color: darkBorder, width: 1),
          padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 13),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radiusBtn),
          ),
          textStyle: btn(),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: darkBrand,
          textStyle: btn(),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: darkSurface,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusBtn),
          borderSide: const BorderSide(color: darkBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusBtn),
          borderSide: const BorderSide(color: darkBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusBtn),
          borderSide: const BorderSide(color: darkBrand, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusBtn),
          borderSide: const BorderSide(color: darkDanger, width: 1.5),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusBtn),
          borderSide: const BorderSide(color: darkDanger, width: 2),
        ),
        hintStyle: body(color: darkMuted2, fontSize: 14),
        labelStyle: body(color: darkMuted, fontSize: 14),
      ),
      navigationBarTheme: NavigationBarThemeData(
        height: 68,
        backgroundColor: darkBg,
        indicatorColor: Colors.transparent,
        labelTextStyle: WidgetStateProperty.resolveWith((st) {
          final sel = st.contains(WidgetState.selected);
          return body(
            fontSize: 11,
            fontWeight: sel ? FontWeight.w600 : FontWeight.w500,
            color: sel ? darkBrand : darkMuted2,
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((st) {
          final sel = st.contains(WidgetState.selected);
          return IconThemeData(
            color: sel ? darkInk : darkMuted2,
            size: 22,
          );
        }),
        surfaceTintColor: Colors.transparent,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: darkSoft,
        selectedColor: darkInk,
        secondarySelectedColor: darkInk,
        labelStyle: body(fontSize: 13, color: darkMuted),
        secondaryLabelStyle: body(fontSize: 13, color: darkBg),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(999),
          side: const BorderSide(color: darkBorder),
        ),
        side: const BorderSide(color: darkBorder),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: darkSurface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusCard),
        ),
        surfaceTintColor: Colors.transparent,
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: darkBg,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(radiusHero)),
        ),
        surfaceTintColor: Colors.transparent,
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: darkSurface,
        contentTextStyle: body(color: darkInk, fontSize: 13, fontWeight: FontWeight.w600),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusBtn),
        ),
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: darkBrand,
        linearTrackColor: darkBorder,
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: darkInk,
        foregroundColor: darkBg,
        elevation: 0,
        shape: CircleBorder(),
      ),
      dividerTheme: const DividerThemeData(
        color: darkBorder,
        space: 1,
        thickness: 1,
      ),
    );
  }
}
