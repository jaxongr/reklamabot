import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/silk_theme.dart';
import '../../core/api/api_client.dart';

class DispatcherStatsScreen extends ConsumerStatefulWidget {
  const DispatcherStatsScreen({super.key});

  @override
  ConsumerState<DispatcherStatsScreen> createState() =>
      _DispatcherStatsScreenState();
}

class _DispatcherStatsScreenState
    extends ConsumerState<DispatcherStatsScreen> {
  Map<String, dynamic>? _stats;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    setState(() => _loading = true);
    try {
      final api = ref.read(apiClientProvider);
      final res = await api.get('/ads/stats');
      setState(() {
        _stats = res.data is Map<String, dynamic> ? res.data : {};
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SilkTheme.bgOf(context),
      appBar: AppBar(
        backgroundColor: SilkTheme.bgOf(context),
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new,
              size: 20, color: SilkTheme.inkOf(context)),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Statistika', style: SilkTheme.screenTitle(context)),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh, color: SilkTheme.inkOf(context)),
            onPressed: _loadStats,
          ),
        ],
      ),
      body: _loading
          ? Center(
              child: CircularProgressIndicator(
                color: SilkTheme.brandOf(context),
              ),
            )
          : RefreshIndicator(
              onRefresh: _loadStats,
              color: SilkTheme.brandOf(context),
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 40),
                children: [
                  _heroRevenue(context),
                  const SizedBox(height: 24),
                  _sectionTitle(context, "Umumiy ko'rsatkichlar"),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _statCard(
                          context,
                          "JAMI E'LONLAR",
                          '${_stats?['totalAds'] ?? 0}',
                          Icons.campaign_outlined,
                          SilkTheme.brandOf(context),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _statCard(
                          context,
                          "FAOL E'LONLAR",
                          '${_stats?['activeAds'] ?? 0}',
                          Icons.check_circle_outline,
                          SilkTheme.successOf(context),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: _statCard(
                          context,
                          'JAMI TARQATISH',
                          '${_stats?['totalPosts'] ?? 0}',
                          Icons.send_outlined,
                          SilkTheme.accentOf(context),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _statCard(
                          context,
                          'YUBORILGAN',
                          '${_stats?['sentMessages'] ?? 0}',
                          Icons.done_all,
                          SilkTheme.accent2Of(context),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  _sectionTitle(context, 'Sessiyalar'),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _statCard(
                          context,
                          'JAMI SESSIYA',
                          '${_stats?['totalSessions'] ?? 0}',
                          Icons.devices,
                          SilkTheme.brandOf(context),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _statCard(
                          context,
                          'FAOL SESSIYA',
                          '${_stats?['activeSessions'] ?? 0}',
                          Icons.wifi,
                          SilkTheme.successOf(context),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: _statCard(
                          context,
                          'JAMI GURUH',
                          '${_stats?['totalGroups'] ?? 0}',
                          Icons.group_outlined,
                          SilkTheme.accentOf(context),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _statCard(
                          context,
                          'TOPILGAN YUKLAR',
                          '${_stats?['totalOrders'] ?? 0}',
                          Icons.inventory_2_outlined,
                          SilkTheme.accent2Of(context),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  _sectionTitle(context, 'Moliyaviy'),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _statCard(
                          context,
                          'OBUNA',
                          _stats?['subscriptionPlan'] ?? "Yo'q",
                          Icons.star_outline,
                          SilkTheme.accent2Of(context),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _statCard(
                          context,
                          'BALANS',
                          _formatMoney(_stats?['balance'] ?? 0),
                          Icons.wallet,
                          SilkTheme.brandOf(context),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
    );
  }

  // Hero "Daromad" card — HTML analytics.chart-card look
  Widget _heroRevenue(BuildContext context) {
    final revenue = _stats?['revenue'] ?? 0;

    // Real trend ma'lumoti (backend: oxirgi 7 kunlik e'lon faolligi)
    final trendRaw = (_stats?['trend'] as List?) ?? const [];
    final trend =
        trendRaw.map((e) => (e is num) ? e.toDouble() : 0.0).toList();
    final hasTrend = trend.length >= 2 && trend.any((v) => v > 0);
    final maxV = hasTrend
        ? trend.reduce((a, b) => a > b ? a : b)
        : 1.0;
    // 0.1..0.95 oralig'iga normallashtirish (chart chiroyli ko'rinishi uchun)
    final normalized = trend
        .map((v) => maxV > 0 ? (0.1 + 0.85 * (v / maxV)) : 0.1)
        .toList();

    final growthRaw = _stats?['growthPercent'];
    final growth = (growthRaw is num) ? growthRaw.toDouble() : 0.0;
    final hasGrowth = growthRaw is num;
    final positive = growth >= 0;
    final growthColor =
        positive ? SilkTheme.successOf(context) : SilkTheme.dangerOf(context);
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: SilkTheme.surfaceOf(context),
        borderRadius: BorderRadius.circular(SilkTheme.radiusCard),
        border: Border.all(color: SilkTheme.borderOf(context), width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('DAROMAD', style: SilkTheme.label(context)),
          const SizedBox(height: 6),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                _formatMoney(revenue),
                style: SilkTheme.display(
                  fontSize: 32,
                  fontWeight: FontWeight.w600,
                  color: SilkTheme.inkOf(context),
                  letterSpacing: -0.64,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          if (hasGrowth)
            Row(
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: growthColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(positive ? Icons.trending_up : Icons.trending_down,
                          size: 10, color: growthColor),
                      const SizedBox(width: 4),
                      Text(
                        '${positive ? '+' : ''}${growth.toStringAsFixed(1)}%',
                        style: SilkTheme.body(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: growthColor,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  "o'tgan haftadan",
                  style: SilkTheme.body(
                    fontSize: 12,
                    color: SilkTheme.mutedOf(context),
                  ),
                ),
              ],
            ),
          const SizedBox(height: 18),
          // Oxirgi 7 kunlik e'lon faolligi trendi (real ma'lumot)
          SizedBox(
            height: 70,
            child: hasTrend
                ? CustomPaint(
                    painter: _TrendLinePainter(
                      lineColor: SilkTheme.brandOf(context),
                      fillColor: SilkTheme.brandOf(context).withOpacity(0.12),
                      dotColor: SilkTheme.brandOf(context),
                      surface: SilkTheme.surfaceOf(context),
                      data: normalized,
                    ),
                    size: Size.infinite,
                  )
                : Center(
                    child: Text(
                      "Faollik ma'lumoti hali to'planmoqda",
                      style: SilkTheme.body(
                        fontSize: 12,
                        color: SilkTheme.mutedOf(context),
                      ),
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _sectionTitle(BuildContext context, String text) =>
      Text(text, style: SilkTheme.sectionTitle(context));

  Widget _statCard(BuildContext context, String label, String value,
      IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: SilkTheme.surfaceOf(context),
        borderRadius: BorderRadius.circular(SilkTheme.radiusLarge),
        border: Border.all(color: SilkTheme.borderOf(context), width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 30,
            height: 30,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 14),
          ),
          const SizedBox(height: 10),
          Text(label, style: SilkTheme.label(context)),
          const SizedBox(height: 4),
          Text(
            value,
            style: SilkTheme.display(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: SilkTheme.inkOf(context),
            ),
          ),
        ],
      ),
    );
  }

  String _formatMoney(dynamic v) {
    final n = (v is num) ? v.toInt() : int.tryParse(v.toString()) ?? 0;
    if (n == 0) return "0 so'm";
    final s = n.toString();
    final buf = StringBuffer();
    for (var i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 == 0) buf.write(' ');
      buf.write(s[i]);
    }
    return "${buf.toString()} so'm";
  }
}

class _TrendLinePainter extends CustomPainter {
  final Color lineColor;
  final Color fillColor;
  final Color dotColor;
  final Color surface;

  /// 0..1 oralig'ida normallashtirilgan real trend nuqtalari
  final List<double> data;

  _TrendLinePainter({
    required this.lineColor,
    required this.fillColor,
    required this.dotColor,
    required this.surface,
    required this.data,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (data.length < 2) return;
    final pts = <Offset>[];
    for (var i = 0; i < data.length; i++) {
      final x = (i / (data.length - 1)) * size.width;
      final y = size.height - (data[i] * size.height);
      pts.add(Offset(x, y));
    }

    // Smooth path
    final path = Path()..moveTo(pts.first.dx, pts.first.dy);
    for (var i = 0; i < pts.length - 1; i++) {
      final p = pts[i];
      final n = pts[i + 1];
      final c1 = Offset(p.dx + (n.dx - p.dx) / 2, p.dy);
      final c2 = Offset(p.dx + (n.dx - p.dx) / 2, n.dy);
      path.cubicTo(c1.dx, c1.dy, c2.dx, c2.dy, n.dx, n.dy);
    }

    // Fill
    final fillPath = Path.from(path)
      ..lineTo(pts.last.dx, size.height)
      ..lineTo(pts.first.dx, size.height)
      ..close();
    canvas.drawPath(
      fillPath,
      Paint()..color = fillColor,
    );
    // Line
    canvas.drawPath(
      path,
      Paint()
        ..color = lineColor
        ..strokeWidth = 2.5
        ..style = PaintingStyle.stroke
        ..strokeJoin = StrokeJoin.round,
    );
    // Dots
    for (final p in pts) {
      canvas.drawCircle(p, 3, Paint()..color = dotColor);
      canvas.drawCircle(
        p,
        2,
        Paint()..color = surface,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _TrendLinePainter old) =>
      old.lineColor != lineColor || old.data != data;
}
