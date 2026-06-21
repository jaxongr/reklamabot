import 'package:flutter/material.dart';

import '../../config/silk_theme.dart';
import 'ikat_background.dart';

/// Hero card — balance/hamyon katta gradient karta.
/// HTML yolda-pro.html'dagi .hero klassi — teal→ink gradient,
/// saffron radial overlay, terracotta radial, ikat pattern.
class HeroCard extends StatefulWidget {
  final String label; // 'Hamyon' yoki 'Joriy balans'
  final int balance;
  final String? trendText;   // "oxirgi 7 kun"
  final String? trendChip;   // "+12.4%"
  final VoidCallback onRefill;
  final List<QuickAction> quickActions;

  HeroCard({
    super.key,
    this.label = 'Hamyon',
    required this.balance,
    this.trendText = 'oxirgi 7 kun',
    this.trendChip = '+12.4%',
    required this.onRefill,
    List<QuickAction>? quickActions,
  }) : quickActions = quickActions ?? [];

  @override
  State<HeroCard> createState() => _HeroCardState();
}

class _HeroCardState extends State<HeroCard>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  int _from = 0;
  int _to = 0;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _to = widget.balance;
    _from = widget.balance;
    _ctrl.value = 1;
  }

  @override
  void didUpdateWidget(covariant HeroCard old) {
    super.didUpdateWidget(old);
    if (widget.balance != _to) {
      _from = _displayValue();
      _to = widget.balance;
      _ctrl
        ..reset()
        ..forward();
    }
  }

  int _displayValue() {
    final t = _ctrl.value;
    final eased = 1 - (1 - t) * (1 - t) * (1 - t);
    return (_from + (_to - _from) * eased).round();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  String _fmt(int n) {
    final s = n.abs().toString();
    final buf = StringBuffer();
    final len = s.length;
    for (var i = 0; i < len; i++) {
      if (i > 0 && (len - i) % 3 == 0) buf.write(' ');
      buf.write(s[i]);
    }
    return (n < 0 ? '-' : '') + buf.toString();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 28),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(SilkTheme.radiusHero),
        boxShadow: const [SilkTheme.heroShadow],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(SilkTheme.radiusHero),
        child: Stack(
          children: [
            // Base teal→ink gradient
            Positioned.fill(
              child: Container(
                decoration: const BoxDecoration(gradient: SilkTheme.heroGradient),
              ),
            ),
            // Saffron (top-right) overlay
            Positioned.fill(
              child: Container(
                decoration: const BoxDecoration(gradient: SilkTheme.accentOverlay),
              ),
            ),
            // Terracotta (bottom-left) overlay
            Positioned.fill(
              child: Container(
                decoration: const BoxDecoration(gradient: SilkTheme.terracottaOverlay),
              ),
            ),
            // Ikat hexagon pattern
            const Positioned.fill(
              child: IkatBackground(
                stroke: SilkTheme.accent2,
                opacity: 0.06,
                tile: 60,
              ),
            ),
            // Content
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Label row
                  Row(
                    children: [
                      Icon(Icons.account_balance_wallet_outlined,
                          size: 12, color: SilkTheme.accent2),
                      const SizedBox(width: 8),
                      Text(
                        widget.label.toUpperCase(),
                        style: SilkTheme.body(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: Colors.white.withOpacity(0.55),
                          letterSpacing: 1.5,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  // Amount + refill button
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            AnimatedBuilder(
                              animation: _ctrl,
                              builder: (_, __) => RichText(
                                text: TextSpan(
                                  children: [
                                    TextSpan(
                                      text: _fmt(_displayValue()),
                                      style: SilkTheme.heroAmount(),
                                    ),
                                    TextSpan(
                                      text: "  so'm",
                                      style: SilkTheme.body(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w500,
                                        color: Colors.white.withOpacity(0.45),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(height: 14),
                            if (widget.trendChip != null)
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 2,
                                    ),
                                    decoration: BoxDecoration(
                                      color: const Color(0x402F7D6B),
                                      borderRadius: BorderRadius.circular(999),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        const Icon(Icons.trending_up,
                                            size: 10, color: Color(0xFF8FD3B8)),
                                        const SizedBox(width: 4),
                                        Text(
                                          widget.trendChip!,
                                          style: SilkTheme.body(
                                            fontSize: 10,
                                            fontWeight: FontWeight.w700,
                                            color: const Color(0xFF8FD3B8),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  if (widget.trendText != null) ...[
                                    const SizedBox(width: 8),
                                    Text(
                                      widget.trendText!,
                                      style: SilkTheme.body(
                                        fontSize: 11,
                                        color: Colors.white.withOpacity(0.6),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                          ],
                        ),
                      ),
                      Material(
                        color: const Color(0xFFF5EFE2),
                        borderRadius: BorderRadius.circular(999),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(999),
                          onTap: widget.onRefill,
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 18, vertical: 11,
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.add, size: 14,
                                    color: SilkTheme.brand),
                                const SizedBox(width: 6),
                                Text(
                                  "To'ldirish",
                                  style: SilkTheme.body(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: SilkTheme.brand,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  // Quick actions
                  if (widget.quickActions.isNotEmpty) ...[
                    const SizedBox(height: 24),
                    Container(height: 1, color: Colors.white.withOpacity(0.1)),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        for (var i = 0; i < widget.quickActions.length; i++) ...[
                          if (i > 0) const SizedBox(width: 8),
                          Expanded(child: _buildQuickBtn(widget.quickActions[i])),
                        ],
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickBtn(QuickAction a) {
    return Material(
      color: Colors.white.withOpacity(0.08),
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: a.onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: Colors.white.withOpacity(0.05),
              width: 1,
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(a.icon, size: 13, color: SilkTheme.accent2),
              const SizedBox(width: 6),
              Flexible(
                child: Text(
                  a.label,
                  overflow: TextOverflow.ellipsis,
                  style: SilkTheme.body(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Hero card'dagi "Yangi e'lon", "Statistika", "Haydovchilar" tugmalari.
class QuickAction {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const QuickAction({
    required this.icon,
    required this.label,
    required this.onTap,
  });
}
