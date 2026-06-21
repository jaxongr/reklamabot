import 'package:flutter/material.dart';

import '../../config/silk_theme.dart';

/// Repeating ikat hexagon pattern — CustomPainter (no SVG dep).
/// Matches yolda-pro.html background.
class IkatBackground extends StatelessWidget {
  final Color stroke;
  final double opacity;
  final double tile;

  const IkatBackground({
    super.key,
    this.stroke = SilkTheme.accent2,
    this.opacity = 0.06,
    this.tile = 60,
  });

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: CustomPaint(
        painter: _IkatPainter(
          stroke: stroke.withOpacity(opacity),
          tile: tile,
        ),
        size: Size.infinite,
      ),
    );
  }
}

class _IkatPainter extends CustomPainter {
  final Color stroke;
  final double tile;

  _IkatPainter({required this.stroke, required this.tile});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = stroke
      ..style = PaintingStyle.stroke
      ..strokeWidth = 0.8
      ..isAntiAlias = true;

    final t = tile;
    final h = t / 2; // half tile → 30 in a 60px tile
    final q = t / 4; // quarter → 15

    final cols = (size.width / t).ceil() + 1;
    final rows = (size.height / t).ceil() + 1;

    for (var ry = 0; ry < rows; ry++) {
      for (var cx = 0; cx < cols; cx++) {
        final ox = cx * t;
        final oy = ry * t;
        _drawCell(canvas, paint, ox, oy, t, h, q);
      }
    }
  }

  void _drawCell(Canvas c, Paint p, double ox, double oy, double t, double h, double q) {
    // Diamond 1: top-center → right-quarter → center → left-quarter
    final d1 = Path()
      ..moveTo(ox + h, oy)
      ..lineTo(ox + h + q, oy + q)
      ..lineTo(ox + h, oy + h)
      ..lineTo(ox + h - q, oy + q)
      ..close();
    // Diamond 2: left side
    final d2 = Path()
      ..moveTo(ox, oy + h)
      ..lineTo(ox + q, oy + h + q)
      ..lineTo(ox + h, oy + h)
      ..lineTo(ox + q, oy + h - q)
      ..close();
    // Diamond 3: right side
    final d3 = Path()
      ..moveTo(ox + h, oy + h)
      ..lineTo(ox + h + q, oy + h + q)
      ..lineTo(ox + t, oy + h)
      ..lineTo(ox + h + q, oy + h - q)
      ..close();
    // Diamond 4: bottom
    final d4 = Path()
      ..moveTo(ox + h, oy + h)
      ..lineTo(ox + h + q, oy + h + q)
      ..lineTo(ox + h, oy + t)
      ..lineTo(ox + h - q, oy + h + q)
      ..close();

    c.drawPath(d1, p);
    c.drawPath(d2, p);
    c.drawPath(d3, p);
    c.drawPath(d4, p);
  }

  @override
  bool shouldRepaint(covariant _IkatPainter old) =>
      old.stroke != stroke || old.tile != tile;
}
