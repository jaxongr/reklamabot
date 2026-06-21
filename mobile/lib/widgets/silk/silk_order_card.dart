import 'package:flutter/material.dart';

import '../../config/silk_theme.dart';

/// Silk Road style order card — yolda-pro.html .order-card.
class SilkOrderCard extends StatelessWidget {
  final String initial;
  final String name;
  final String vehicle;
  final String fromCity;
  final String toCity;
  final String time;
  final String weight;
  final String distance;
  final String scope;            // ICHKI / TASHQI
  final String deal;             // Price text
  final int accepted;
  final int total;
  final double rating;
  final bool isDriver;           // Driver vs cargo badge
  final VoidCallback? onTap;
  final VoidCallback? onAccept;

  const SilkOrderCard({
    super.key,
    required this.initial,
    required this.name,
    required this.vehicle,
    required this.fromCity,
    required this.toCity,
    required this.time,
    required this.weight,
    required this.distance,
    required this.scope,
    required this.deal,
    this.accepted = 0,
    this.total = 10,
    this.rating = 5.0,
    this.isDriver = false,
    this.onTap,
    this.onAccept,
  });

  @override
  Widget build(BuildContext context) {
    final surface = SilkTheme.surfaceOf(context);
    final border = SilkTheme.borderOf(context);
    final ink = SilkTheme.inkOf(context);
    final muted = SilkTheme.mutedOf(context);
    final muted2 = SilkTheme.muted2Of(context);
    final soft = SilkTheme.softOf(context);
    final brand = SilkTheme.brandOf(context);
    final accent = SilkTheme.accentOf(context);
    final success = SilkTheme.successOf(context);
    final bg = SilkTheme.bgOf(context);
    final accent2 = SilkTheme.accent2Of(context);

    final disabled = accepted >= total;

    return Material(
      color: surface,
      borderRadius: BorderRadius.circular(SilkTheme.radiusCard),
      child: InkWell(
        borderRadius: BorderRadius.circular(SilkTheme.radiusCard),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            border: Border.all(color: border, width: 1),
            borderRadius: BorderRadius.circular(SilkTheme.radiusCard),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Head row
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildAvatar(surface, border, soft, ink, success, accent),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: SilkTheme.cardName(context),
                        ),
                        const SizedBox(height: 3),
                        Row(
                          children: [
                            if (isDriver)
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 7, vertical: 2),
                                decoration: BoxDecoration(
                                  color: success.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  'HAYDOVCHI',
                                  style: SilkTheme.body(
                                    fontSize: 9,
                                    fontWeight: FontWeight.w700,
                                    color: success,
                                    letterSpacing: 0.45,
                                  ),
                                ),
                              ),
                            if (isDriver) const SizedBox(width: 6),
                            Flexible(
                              child: Text(
                                vehicle,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: SilkTheme.body(
                                  fontSize: 11,
                                  color: muted,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  // Rating
                  Icon(Icons.star, size: 11, color: accent2),
                  const SizedBox(width: 2),
                  Text(
                    rating.toStringAsFixed(1),
                    style: SilkTheme.body(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: muted,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              // Route horizontal
              Row(
                children: [
                  _dot(brand),
                  const SizedBox(width: 8),
                  Text(fromCity, style: SilkTheme.cardCity(context)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _DashLine(color: border),
                  ),
                  const SizedBox(width: 8),
                  Text(toCity, style: SilkTheme.cardCity(context)),
                  const SizedBox(width: 8),
                  _dot(accent),
                ],
              ),
              const SizedBox(height: 16),
              // Meta row
              Row(
                children: [
                  _metaItem(Icons.access_time, time, muted2, muted),
                  const SizedBox(width: 16),
                  _metaItem(Icons.scale_outlined, weight, muted2, muted),
                  const SizedBox(width: 16),
                  Expanded(child: _metaItem(Icons.alt_route, distance, muted2, muted)),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: soft,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      scope,
                      style: SilkTheme.mono(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: muted,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Container(height: 1, color: border),
              const SizedBox(height: 16),
              // Footer row
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'NARX',
                          style: SilkTheme.body(
                            fontSize: 10,
                            fontWeight: FontWeight.w500,
                            color: muted2,
                            letterSpacing: 0.8,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(deal, style: SilkTheme.cardPrice(context)),
                      ],
                    ),
                  ),
                  Material(
                    color: disabled ? muted2 : ink,
                    borderRadius: BorderRadius.circular(999),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(999),
                      onTap: disabled ? null : onAccept,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 22, vertical: 11),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'Qabul',
                              style: SilkTheme.body(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: bg,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              '$accepted/$total',
                              style: SilkTheme.mono(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: bg.withOpacity(0.7),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAvatar(Color surface, Color border, Color soft, Color ink,
      Color success, Color accent) {
    return SizedBox(
      width: 50,
      height: 50,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            width: 46,
            height: 46,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                colors: [soft, soft],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              border: Border.all(color: border, width: 1),
            ),
            child: Text(
              initial,
              style: SilkTheme.display(
                fontSize: 17,
                fontWeight: FontWeight.w700,
                color: ink,
              ),
            ),
          ),
          Positioned(
            right: -2,
            bottom: -2,
            child: Container(
              width: 18,
              height: 18,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: isDriver ? success : accent,
                shape: BoxShape.circle,
                border: Border.all(color: surface, width: 2),
              ),
              child: Icon(
                isDriver ? Icons.local_shipping : Icons.check,
                size: 9,
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _dot(Color color) => Container(
        width: 10,
        height: 10,
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.15),
              blurRadius: 0,
              spreadRadius: 3,
            ),
          ],
        ),
      );

  Widget _metaItem(IconData icon, String text, Color iconColor, Color textColor) =>
      Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: iconColor),
          const SizedBox(width: 6),
          Text(
            text,
            style: SilkTheme.body(fontSize: 12, color: textColor),
          ),
        ],
      );
}

class _DashLine extends StatelessWidget {
  final Color color;
  const _DashLine({required this.color});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (ctx, c) {
        const dash = 4.0;
        const gap = 4.0;
        final count = (c.maxWidth / (dash + gap)).floor();
        return Row(
          children: List.generate(
            count,
            (_) => Padding(
              padding: const EdgeInsets.only(right: gap),
              child: Container(width: dash, height: 2, color: color),
            ),
          ),
        );
      },
    );
  }
}
