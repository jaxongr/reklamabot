import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../config/theme.dart';
import '../../../core/models/order.dart';

/// Xaritada hududni bosganda ko'rinadigan bottom sheet.
/// 24 soat ichidagi orderlarni ko'rsatadi.
class RegionOrdersSheet extends StatelessWidget {
  final String regionName;
  final List<Order> orders;

  const RegionOrdersSheet({
    super.key,
    required this.regionName,
    required this.orders,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = AppTheme.isDark(context);

    return DraggableScrollableSheet(
      initialChildSize: 0.45,
      minChildSize: 0.2,
      maxChildSize: 0.85,
      builder: (context, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: AppTheme.cardBgOf(context),
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(AppTheme.radiusXLarge),
            ),
          ),
          child: Column(
            children: [
              // Handle
              Container(
                margin: const EdgeInsets.only(top: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppTheme.cardBorderOf(context),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),

              // Header
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                child: Row(
                  children: [
                    Icon(
                      Icons.location_on,
                      color: AppTheme.primary,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        regionName,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.textPrimaryOf(context),
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppTheme.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                      ),
                      child: Text(
                        '${orders.length} ta',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.primary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              Divider(color: AppTheme.cardBorderOf(context), height: 1),

              // Order list
              Expanded(
                child: orders.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.inbox_outlined,
                              size: 48,
                              color: AppTheme.textHintOf(context),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              "Bu hududda e'lon topilmadi",
                              style: TextStyle(
                                color: AppTheme.textSecondaryOf(context),
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView.separated(
                        controller: scrollController,
                        padding: const EdgeInsets.all(16),
                        itemCount: orders.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (_, i) => _OrderCard(order: orders[i]),
                      ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _OrderCard extends StatelessWidget {
  final Order order;

  const _OrderCard({required this.order});

  @override
  Widget build(BuildContext context) {
    final isDriver = order.type == OrderType.driver;
    final typeColor = isDriver ? AppTheme.accent : AppTheme.primary;
    final timeAgo = order.messageDate != null ? _formatTimeAgo(order.messageDate!) : '';

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.cardBgOf(context),
        borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
        border: Border.all(color: AppTheme.cardBorderOf(context)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top row: type + time
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: typeColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                ),
                child: Text(
                  isDriver ? 'Haydovchi' : 'Yuk',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: typeColor,
                  ),
                ),
              ),
              if (order.vehicleType != null) ...[
                const SizedBox(width: 6),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppTheme.textHintOf(context).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                  ),
                  child: Text(
                    order.vehicleType!,
                    style: TextStyle(
                      fontSize: 10,
                      color: AppTheme.textSecondaryOf(context),
                    ),
                  ),
                ),
              ],
              const Spacer(),
              Text(
                timeAgo,
                style: TextStyle(
                  fontSize: 11,
                  color: AppTheme.textHintOf(context),
                ),
              ),
            ],
          ),

          const SizedBox(height: 8),

          // Route
          Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: AppTheme.primary,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  order.cargoFrom ?? '—',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: AppTheme.textPrimaryOf(context),
                  ),
                ),
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.only(left: 3.5),
            child: Container(
              width: 1,
              height: 12,
              color: AppTheme.cardBorderOf(context),
            ),
          ),
          Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: AppTheme.accent,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  order.cargoTo ?? '—',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: AppTheme.textPrimaryOf(context),
                  ),
                ),
              ),
            ],
          ),

          // Price + phone
          if (order.price != null || order.phone != null) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                if (order.price != null)
                  Text(
                    order.price!,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.primary,
                    ),
                  ),
                const Spacer(),
                if (order.phone != null)
                  Text(
                    order.phone!,
                    style: TextStyle(
                      fontSize: 12,
                      color: AppTheme.textSecondaryOf(context),
                    ),
                  ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  String _formatTimeAgo(DateTime date) {
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 60) return '${diff.inMinutes} min';
    if (diff.inHours < 24) return '${diff.inHours} soat';
    return DateFormat('dd.MM HH:mm').format(date);
  }
}
