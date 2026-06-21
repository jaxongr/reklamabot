import 'package:flutter/material.dart';
import '../config/silk_theme.dart';

/// A dashboard statistics card with icon, value, and label.
class StatCard extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;
  final Color? iconColor;
  final Color? iconBackgroundColor;
  final VoidCallback? onTap;

  const StatCard({
    super.key,
    required this.icon,
    required this.value,
    required this.label,
    this.iconColor,
    this.iconBackgroundColor,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveIconColor = iconColor ?? SilkTheme.brand;
    final effectiveBgColor =
        iconBackgroundColor ?? effectiveIconColor.withValues(alpha: 0.1);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: SilkTheme.surfaceOf(context),
          borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
          border: Border.all(
            color: SilkTheme.borderOf(context),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: effectiveBgColor,
                borderRadius: BorderRadius.circular(SilkTheme.radiusSmall),
              ),
              child: Icon(icon, color: effectiveIconColor, size: 22),
            ),
            const SizedBox(height: 12),
            Text(
              value,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w700,
                color: SilkTheme.inkOf(context),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                color: SilkTheme.mutedOf(context),
                fontWeight: FontWeight.w400,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
