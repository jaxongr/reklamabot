import 'package:flutter/material.dart';

import '../../config/silk_theme.dart';

/// LINYA badge — yashil pulse bilan "faol" indikatori.
class LinyaBadge extends StatefulWidget {
  final bool active;
  final VoidCallback? onTap;

  const LinyaBadge({super.key, required this.active, this.onTap});

  @override
  State<LinyaBadge> createState() => _LinyaBadgeState();
}

class _LinyaBadgeState extends State<LinyaBadge>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final success = SilkTheme.successOf(context);
    final color = widget.active ? success : SilkTheme.muted2Of(context);

    return GestureDetector(
      onTap: widget.onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: color.withOpacity(0.10),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: color.withOpacity(0.30), width: 1),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: 10,
              height: 10,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  if (widget.active)
                    AnimatedBuilder(
                      animation: _ctrl,
                      builder: (_, __) {
                        final t = _ctrl.value;
                        return Transform.scale(
                          scale: 0.9 + (2.4 - 0.9) * t,
                          child: Opacity(
                            opacity: (0.6 * (1 - t)).clamp(0.0, 1.0),
                            child: Container(
                              width: 6,
                              height: 6,
                              decoration: BoxDecoration(
                                color: color,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  Container(
                    width: 6,
                    height: 6,
                    decoration: BoxDecoration(
                      color: color,
                      shape: BoxShape.circle,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 6),
            Text(
              'LINYA',
              style: SilkTheme.pill(color),
            ),
          ],
        ),
      ),
    );
  }
}
