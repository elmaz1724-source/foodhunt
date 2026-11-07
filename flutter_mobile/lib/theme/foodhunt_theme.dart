import 'package:flutter/material.dart';

/// FOODHUNT Soft Discovery design tokens.
///
/// Independent of third-party delivery apps. The same semantic tokens can
/// eventually be shared by a design system for Web, iOS, and Android.
abstract final class FoodHuntColors {
  static const canvas = Color(0xFFFAF8F5);
  static const paper = Color(0xFFFFFFFF);
  static const peach = Color(0xFFE78663);
  static const peachPale = Color(0xFFFFF0E8);
  static const darkText = Color(0xFF242521);
  static const mutedText = Color(0xFF797D76);
  static const border = Color(0xFFEAE6DE);
  static const sage = Color(0xFF76A485);

  static const darkCanvas = Color(0xFF17191B);
  static const darkPaper = Color(0xFF232629);
  static const darkTextSoft = Color(0xFFF7F4F1);
  static const darkBorder = Color(0xFF383B3C);
}

abstract final class FoodHuntRadii {
  static const double small = 16;
  static const double medium = 22;
  static const double large = 30;
  static const double pill = 99;
}

abstract final class FoodHuntTheme {
  static ThemeData light() => _build(Brightness.light);
  static ThemeData dark() => _build(Brightness.dark);

  static ThemeData _build(Brightness brightness) {
    final dark = brightness == Brightness.dark;
    final canvas = dark ? FoodHuntColors.darkCanvas : FoodHuntColors.canvas;
    final paper = dark ? FoodHuntColors.darkPaper : FoodHuntColors.paper;
    final text = dark ? FoodHuntColors.darkTextSoft : FoodHuntColors.darkText;
    final border = dark ? FoodHuntColors.darkBorder : FoodHuntColors.border;
    final accent = dark ? const Color(0xFFF9AB84) : FoodHuntColors.peach;

    final scheme = ColorScheme.fromSeed(
      seedColor: accent,
      brightness: brightness,
    ).copyWith(
      primary: accent,
      onPrimary: const Color(0xFF271F1C),
      surface: paper,
      onSurface: text,
      outline: border,
      surfaceContainerLowest: canvas,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: scheme,
      scaffoldBackgroundColor: canvas,
      appBarTheme: AppBarTheme(
        backgroundColor: canvas,
        foregroundColor: text,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: paper,
        elevation: 0,
        indicatorColor: dark ? const Color(0xFF44312B) : FoodHuntColors.peachPale,
        height: 74,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: paper,
        hintStyle: TextStyle(color: dark ? const Color(0xFFAFA8A2) : FoodHuntColors.mutedText),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(FoodHuntRadii.pill),
          borderSide: BorderSide(color: border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(FoodHuntRadii.pill),
          borderSide: BorderSide(color: border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(FoodHuntRadii.pill),
          borderSide: BorderSide(color: accent, width: 1.6),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(0, 52),
          padding: const EdgeInsets.symmetric(horizontal: 22),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(FoodHuntRadii.pill),
          ),
          textStyle: const TextStyle(fontWeight: FontWeight.w800),
        ),
      ),
      cardColor: paper,
      dividerColor: border,
      textTheme: TextTheme(
        headlineLarge: TextStyle(
          fontSize: 34,
          height: 1.1,
          fontWeight: FontWeight.w800,
          letterSpacing: -1.5,
          color: text,
        ),
        headlineSmall: TextStyle(
          fontSize: 24,
          height: 1.12,
          fontWeight: FontWeight.w800,
          letterSpacing: -.6,
          color: text,
        ),
        titleMedium: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w800,
          color: text,
        ),
        bodyMedium: TextStyle(
          fontSize: 14,
          height: 1.55,
          color: text,
        ),
      ),
    );
  }
}
