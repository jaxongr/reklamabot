import 'package:flutter/material.dart';
import '../config/silk_theme.dart';

/// A styled app bar with optional actions and back button.
class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final List<Widget>? actions;
  final bool showBack;
  final VoidCallback? onBack;
  final Widget? leading;
  final double elevation;
  final Color? backgroundColor;
  final PreferredSizeWidget? bottom;

  const CustomAppBar({
    super.key,
    required this.title,
    this.actions,
    this.showBack = false,
    this.onBack,
    this.leading,
    this.elevation = 0,
    this.backgroundColor,
    this.bottom,
  });

  @override
  Size get preferredSize => Size.fromHeight(
        kToolbarHeight + (bottom?.preferredSize.height ?? 0),
      );

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: Text(
        title,
        style: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: SilkTheme.inkOf(context),
        ),
      ),
      leading: leading ??
          (showBack
              ? IconButton(
                  icon: const Icon(Icons.arrow_back_ios_new, size: 20),
                  onPressed: onBack ?? () => Navigator.of(context).pop(),
                )
              : null),
      actions: actions,
      elevation: elevation,
      scrolledUnderElevation: 0.5,
      backgroundColor: backgroundColor ?? SilkTheme.surfaceOf(context),
      surfaceTintColor: Colors.transparent,
      bottom: bottom,
    );
  }
}
