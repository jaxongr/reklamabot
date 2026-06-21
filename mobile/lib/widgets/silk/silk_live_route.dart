import 'package:flutter/material.dart';

import '../../config/silk_theme.dart';

/// Live truck tracking — yolda-pro.html .route-live.
/// Animates progress bar and truck emoji horizontally (3s, infinite alternate).
class SilkLiveRoute extends StatefulWidget {
  final String fromCity;
  final String toCity;
  final String etaText;

  const SilkLiveRoute({
    super.key,
    required this.fromCity,
    required this.toCity,
    this.etaText = '≈ 2 soat 15 daq qoldi',
  });

  @override
  State<SilkLiveRoute> createState() => _SilkLiveRouteState();
}

class _SilkLiveRouteState extends State<SilkLiveRoute>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _progress;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3000),
    )..repeat(reverse: true);
    _progress = Tween<double>(begin: 0.35, end: 0.65).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final soft = SilkTheme.softOf(context);
    final border = SilkTheme.borderOf(context);
    final brand = SilkTheme.brandOf(context);
    final accent = SilkTheme.accentOf(context);
    final ink = SilkTheme.inkOf(context);
    final muted = SilkTheme.mutedOf(context);

    return Container(
      decoration: BoxDecoration(
        color: soft,
        borderRadius: BorderRadius.circular(SilkTheme.radiusRoute),
        border: Border.all(color: border, width: 1),
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Track + truck
          SizedBox(
            height: 36,
            child: LayoutBuilder(
              builder: (ctx, c) {
                final w = c.maxWidth;
                return AnimatedBuilder(
                  animation: _progress,
                  builder: (_, __) {
                    final pct = _progress.value;
                    return Stack(
                      children: [
                        Positioned(
                          top: 20,
                          left: 0,
                          right: 0,
                          child: Container(
                            height: 4,
                            decoration: BoxDecoration(
                              color: border,
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                        ),
                        Positioned(
                          top: 20,
                          left: 0,
                          child: Container(
                            height: 4,
                            width: w * pct,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [brand, accent],
                              ),
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                        ),
                        Positioned(
                          left: (w * pct) - 14,
                          top: 6,
                          child: const Text('🚚', style: TextStyle(fontSize: 20)),
                        ),
                      ],
                    );
                  },
                );
              },
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  _dot(brand),
                  const SizedBox(width: 6),
                  Text(widget.fromCity, style: SilkTheme.cardCity(context)),
                ],
              ),
              Row(
                children: [
                  Text(widget.toCity, style: SilkTheme.cardCity(context)),
                  const SizedBox(width: 6),
                  _dot(accent),
                ],
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            widget.etaText,
            style: SilkTheme.mono(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: muted,
            ),
          ),
        ],
      ),
    );
  }

  Widget _dot(Color c) => Container(
        width: 10,
        height: 10,
        decoration: BoxDecoration(color: c, shape: BoxShape.circle),
      );
}
