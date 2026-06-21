import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../config/strings.dart';
import '../config/silk_theme.dart';
import '../core/models/order.dart';
import '../core/providers/lang_provider.dart';
import 'package:intl/intl.dart';

/// A card widget displaying order/cargo information.
class OrderCard extends StatelessWidget {
  final Order order;
  final VoidCallback? onTap;
  final Future<void> Function(String)? onAccept;

  const OrderCard({
    super.key,
    required this.order,
    this.onTap,
    this.onAccept,
  });

  Color get _statusColor {
    switch (order.status) {
      case OrderStatus.newOrder:
        return SilkTheme.brand;
      case OrderStatus.viewed:
        return const Color(0xFFFA8C16);
      case OrderStatus.contacted:
        return const Color(0xFF722ED1);
      case OrderStatus.completed:
        return SilkTheme.success;
      case OrderStatus.rejected:
        return SilkTheme.danger;
    }
  }

  Color get _typeColor {
    return order.type == OrderType.driver
        ? const Color(0xFFFA8C16)
        : SilkTheme.brand;
  }

  IconData get _typeIcon {
    return order.type == OrderType.driver
        ? Icons.local_shipping
        : Icons.inventory_2_outlined;
  }

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('dd.MM HH:mm');

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: SilkTheme.surfaceOf(context),
          borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
          border: Border.all(
            color: SilkTheme.borderOf(context).withValues(alpha: 0.5),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Route + Status + Type
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Type icon
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: _typeColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(SilkTheme.radiusSmall),
                  ),
                  child: Icon(
                    _typeIcon,
                    color: _typeColor,
                    size: 22,
                  ),
                ),
                const SizedBox(width: 12),
                // Route text
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        order.route,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: SilkTheme.ink,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (order.distance != null) ...[
                        const SizedBox(height: 2),
                        Text(
                          order.distanceText,
                          style: const TextStyle(
                            fontSize: 12,
                            color: SilkTheme.muted2,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                // Surge indicator
                if (order.surgeMultiplier != null && order.surgeMultiplier! > 1)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                    margin: const EdgeInsets.only(right: 4),
                    decoration: BoxDecoration(
                      color: Colors.orange.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.local_fire_department, size: 12, color: Colors.deepOrange),
                        const SizedBox(width: 2),
                        Text(
                          '${order.surgeMultiplier!.toStringAsFixed(1)}x',
                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Colors.deepOrange),
                        ),
                      ],
                    ),
                  ),
                // Scope badge
                if (order.scope != OrderScope.internal)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                    margin: const EdgeInsets.only(right: 4),
                    decoration: BoxDecoration(
                      color: Colors.purple.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      order.scope.label,
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w500, color: Colors.purple),
                    ),
                  ),
                // Status badge
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: _statusColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    order.status.label,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: _statusColor,
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // Info chips
            Wrap(
              spacing: 8,
              runSpacing: 6,
              children: [
                if (order.price != null && order.price!.isNotEmpty)
                  _buildInfoChip(Icons.payments_outlined, order.price!),
                if (order.vehicleType != null)
                  _buildInfoChip(
                      Icons.directions_car_outlined, order.vehicleType!),
                if (order.cargoWeight != null)
                  _buildInfoChip(Icons.scale_outlined, order.cargoWeight!),
                if (order.phone != null)
                  _buildInfoChip(Icons.phone_outlined, order.phone!),
                // Type badge
                _buildInfoChip(
                  _typeIcon,
                  order.type.label,
                ),
              ],
            ),

            // Action buttons: Telegram + Qo'ng'iroq + Qabul
            const SizedBox(height: 10),
            Row(
              children: [
                // Telegram yozish — username yoki telegramId orqali
                if (order.senderUsername != null && order.senderUsername!.isNotEmpty ||
                    order.senderTelegramId != null && order.senderTelegramId!.isNotEmpty)
                  Expanded(
                    child: SizedBox(
                      height: 38,
                      child: OutlinedButton.icon(
                        onPressed: () {
                          Uri uri;
                          if (order.senderUsername != null && order.senderUsername!.isNotEmpty) {
                            uri = Uri.parse('https://t.me/${order.senderUsername}');
                          } else {
                            uri = Uri.parse('tg://user?id=${order.senderTelegramId}');
                          }
                          launchUrl(uri, mode: LaunchMode.externalApplication);
                        },
                        icon: const Icon(Icons.send_rounded, size: 16),
                        label: const Text('Yozish', style: TextStyle(fontSize: 13)),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF0088CC),
                          side: const BorderSide(color: Color(0xFF0088CC), width: 1.2),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          padding: const EdgeInsets.symmetric(horizontal: 8),
                        ),
                      ),
                    ),
                  ),
                if (order.senderUsername != null && order.senderUsername!.isNotEmpty ||
                    order.senderTelegramId != null && order.senderTelegramId!.isNotEmpty)
                  const SizedBox(width: 8),
                // Qo'ng'iroq
                if (order.phone != null && order.phone!.isNotEmpty)
                  Expanded(
                    child: SizedBox(
                      height: 38,
                      child: OutlinedButton.icon(
                        onPressed: () {
                          final uri = Uri.parse('tel:${order.phone}');
                          launchUrl(uri);
                        },
                        icon: const Icon(Icons.phone_outlined, size: 16),
                        label: const Text("Qo'ng'iroq", style: TextStyle(fontSize: 13)),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: SilkTheme.success,
                          side: const BorderSide(color: SilkTheme.success, width: 1.2),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          padding: const EdgeInsets.symmetric(horizontal: 8),
                        ),
                      ),
                    ),
                  ),
                if (order.phone != null && order.phone!.isNotEmpty && onAccept != null && order.status == OrderStatus.newOrder)
                  const SizedBox(width: 8),
                // Qabul qilish
                if (onAccept != null && order.status == OrderStatus.newOrder)
                  Expanded(
                    child: SizedBox(
                      height: 38,
                      child: ElevatedButton.icon(
                        onPressed: () => onAccept!(order.id),
                        icon: const Icon(Icons.check_circle_outline, size: 16),
                        label: Text(AppStrings.qabulQilish, style: const TextStyle(fontSize: 13)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: SilkTheme.brand,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          padding: const EdgeInsets.symmetric(horizontal: 8),
                        ),
                      ),
                    ),
                  ),
              ],
            ),

            const SizedBox(height: 10),
            const Divider(height: 1, color: SilkTheme.border),
            const SizedBox(height: 10),

            // Bottom row: group + date
            Row(
              children: [
                const Icon(Icons.group_outlined,
                    size: 14, color: SilkTheme.muted2),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    order.groupTitle,
                    style: const TextStyle(
                      fontSize: 12,
                      color: SilkTheme.muted2,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const Spacer(),
                Text(
                  dateFormat.format(order.messageDate ?? order.createdAt),
                  style: const TextStyle(
                    fontSize: 12,
                    color: SilkTheme.muted2,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: SilkTheme.bg,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: SilkTheme.muted),
          const SizedBox(width: 4),
          Text(
            text,
            style: const TextStyle(
              fontSize: 12,
              color: SilkTheme.muted,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
