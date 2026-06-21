import 'package:flutter/material.dart';

import '../../config/silk_theme.dart';

/// Section header — "Buyurtmalar" + subtitle + optional filter icon button.
class SilkSectionHead extends StatelessWidget {
  final String title;
  final String? sub;
  final IconData? filterIcon;
  final VoidCallback? onFilterTap;

  const SilkSectionHead({
    super.key,
    required this.title,
    this.sub,
    this.filterIcon,
    this.onFilterTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: SilkTheme.sectionTitle(context)),
                if (sub != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    sub!,
                    style: SilkTheme.body(
                      fontSize: 12,
                      color: SilkTheme.mutedOf(context),
                    ),
                  ),
                ],
              ],
            ),
          ),
          if (filterIcon != null && onFilterTap != null)
            Material(
              color: SilkTheme.surfaceOf(context),
              borderRadius: BorderRadius.circular(SilkTheme.radiusBtn),
              child: InkWell(
                borderRadius: BorderRadius.circular(SilkTheme.radiusBtn),
                onTap: onFilterTap,
                child: Container(
                  width: 42,
                  height: 42,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    border: Border.all(
                      color: SilkTheme.borderOf(context),
                      width: 1,
                    ),
                    borderRadius: BorderRadius.circular(SilkTheme.radiusBtn),
                  ),
                  child: Icon(
                    filterIcon,
                    size: 17,
                    color: SilkTheme.inkOf(context),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
