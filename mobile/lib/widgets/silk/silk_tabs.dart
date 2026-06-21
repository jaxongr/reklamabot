import 'package:flutter/material.dart';

import '../../config/silk_theme.dart';

/// Horizontal scrollable pill tabs — yolda-pro.html .tabs.
class SilkPillTabs extends StatelessWidget {
  final List<String> tabs;
  final String value;
  final ValueChanged<String> onChanged;
  final Map<String, int>? counts;

  const SilkPillTabs({
    super.key,
    required this.tabs,
    required this.value,
    required this.onChanged,
    this.counts,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 42,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: tabs.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (ctx, i) {
          final t = tabs[i];
          final active = t == value;
          final ink = SilkTheme.inkOf(context);
          final surface = SilkTheme.surfaceOf(context);
          final bg = SilkTheme.bgOf(context);
          return Material(
            color: active ? ink : surface,
            borderRadius: BorderRadius.circular(999),
            child: InkWell(
              borderRadius: BorderRadius.circular(999),
              onTap: () => onChanged(t),
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 18, vertical: 9),
                decoration: BoxDecoration(
                  border: Border.all(
                    color: active ? ink : SilkTheme.borderOf(context),
                    width: 1,
                  ),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      t,
                      style: SilkTheme.body(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: active ? bg : SilkTheme.mutedOf(context),
                      ),
                    ),
                    if (counts != null && counts![t] != null) ...[
                      const SizedBox(width: 6),
                      Text(
                        '${counts![t]}',
                        style: SilkTheme.mono(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: (active ? bg : SilkTheme.mutedOf(context))
                              .withOpacity(0.7),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

/// Equal-width segmented tabs (3-4 tabs with counts).
class SilkSegmentedTabs extends StatelessWidget {
  final List<String> tabs;
  final String value;
  final ValueChanged<String> onChanged;
  final Map<String, int>? counts;

  const SilkSegmentedTabs({
    super.key,
    required this.tabs,
    required this.value,
    required this.onChanged,
    this.counts,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        children: [
          for (var i = 0; i < tabs.length; i++) ...[
            if (i > 0) const SizedBox(width: 8),
            Expanded(child: _segment(context, tabs[i])),
          ],
        ],
      ),
    );
  }

  Widget _segment(BuildContext context, String t) {
    final active = t == value;
    final ink = SilkTheme.inkOf(context);
    final surface = SilkTheme.surfaceOf(context);
    final bg = SilkTheme.bgOf(context);
    return Material(
      color: active ? ink : surface,
      borderRadius: BorderRadius.circular(999),
      child: InkWell(
        borderRadius: BorderRadius.circular(999),
        onTap: () => onChanged(t),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 11),
          decoration: BoxDecoration(
            border: Border.all(
              color: active ? ink : SilkTheme.borderOf(context),
              width: 1,
            ),
            borderRadius: BorderRadius.circular(999),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                t,
                style: SilkTheme.body(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: active ? bg : SilkTheme.mutedOf(context),
                ),
              ),
              if (counts != null && counts![t] != null) ...[
                const SizedBox(width: 6),
                Text(
                  '(${counts![t]})',
                  style: SilkTheme.mono(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: (active ? bg : SilkTheme.mutedOf(context))
                        .withOpacity(0.7),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
