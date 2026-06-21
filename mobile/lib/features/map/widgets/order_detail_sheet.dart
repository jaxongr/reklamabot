import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../config/theme.dart';
import '../../../core/data/uzbekistan_cities.dart';
import '../../../core/models/order.dart';
import '../map_provider.dart';

/// Xaritada orderni bosganda chiqadigan to'liq ma'lumot sheet.
class OrderDetailSheet extends ConsumerWidget {
  final Order order;
  final VoidCallback onClose;
  final VoidCallback onAccept;

  const OrderDetailSheet({
    super.key,
    required this.order,
    required this.onClose,
    required this.onAccept,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDriver = order.type == OrderType.driver;
    final typeColor = isDriver ? AppTheme.accent : AppTheme.primary;
    final mapState = ref.watch(mapProvider);
    final route = mapState.routeInfo;
    final km = route?.distanceKm;
    final time = route?.durationText;

    return DraggableScrollableSheet(
      initialChildSize: 0.55,
      minChildSize: 0.3,
      maxChildSize: 0.85,
      builder: (context, sc) {
        return Container(
          decoration: BoxDecoration(
            color: AppTheme.cardBgOf(context),
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(AppTheme.radiusXLarge),
            ),
          ),
          child: ListView(
            controller: sc,
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
            children: [
              // Handle
              Center(
                child: Container(
                  margin: const EdgeInsets.only(top: 12, bottom: 16),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppTheme.cardBorderOf(context),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // Turi + vaqt
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: typeColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          isDriver ? Icons.local_shipping : Icons.inventory_2,
                          size: 14,
                          color: typeColor,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          isDriver ? 'Haydovchi' : 'Yuk',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: typeColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (order.vehicleType != null) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                      decoration: BoxDecoration(
                        color: AppTheme.textHintOf(context).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                      ),
                      child: Text(
                        order.vehicleType!,
                        style: TextStyle(fontSize: 11, color: AppTheme.textSecondaryOf(context)),
                      ),
                    ),
                  ],
                  if (order.scope == OrderScope.import_ || order.scope == OrderScope.export_) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                      decoration: BoxDecoration(
                        color: AppTheme.warningColor.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                      ),
                      child: Text(
                        order.scope == OrderScope.import_ ? 'Import' : 'Eksport',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: AppTheme.warningColor),
                      ),
                    ),
                  ],
                  const Spacer(),
                  if (order.messageDate != null)
                    Text(
                      _formatTime(order.messageDate!),
                      style: TextStyle(fontSize: 12, color: AppTheme.textHintOf(context)),
                    ),
                ],
              ),

              const SizedBox(height: 16),

              // Yo'nalish
              _buildRoute(context, km, time),

              const SizedBox(height: 16),

              // Ma'lumotlar
              _buildInfoGrid(context),

              const SizedBox(height: 16),

              // Xabar matni
              if (order.messageText.isNotEmpty) ...[
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppTheme.bgBodyOf(context),
                    borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                  ),
                  child: Text(
                    order.messageText,
                    style: TextStyle(
                      fontSize: 13,
                      color: AppTheme.textSecondaryOf(context),
                      height: 1.4,
                    ),
                    maxLines: 8,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // Tugmalar
              Row(
                children: [
                  // Qo'ng'iroq
                  if (order.phone != null)
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _callPhone(order.phone!),
                        icon: const Icon(Icons.phone, size: 18),
                        label: Text(order.phone!),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppTheme.primary,
                          side: const BorderSide(color: AppTheme.primary),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                    ),
                  if (order.phone != null) const SizedBox(width: 10),
                  // Qabul qilish
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: onAccept,
                      icon: const Icon(Icons.check, size: 18),
                      label: const Text('Qabul qilish'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildRoute(BuildContext context, double? km, String? time) {
    final isRouteLoading = false; // route allaqachon yuklangan
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.bgBodyOf(context),
        borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
      ),
      child: Column(
        children: [
          // A nuqta
          Row(
            children: [
              Container(
                width: 10, height: 10,
                decoration: const BoxDecoration(color: AppTheme.primary, shape: BoxShape.circle),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  order.cargoFrom ?? '—',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textPrimaryOf(context),
                  ),
                ),
              ),
            ],
          ),
          // Chiziq + masofa
          Padding(
            padding: const EdgeInsets.only(left: 4.5),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Container(width: 1, height: 28, color: AppTheme.cardBorderOf(context)),
                if (km != null) ...[
                  const SizedBox(width: 14),
                  const Icon(Icons.route, size: 14, color: AppTheme.primary),
                  const SizedBox(width: 4),
                  Text(
                    '${km.round()} km',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppTheme.primary),
                  ),
                  const SizedBox(width: 10),
                  Icon(Icons.access_time, size: 14, color: AppTheme.textSecondaryOf(context)),
                  const SizedBox(width: 4),
                  Text(
                    '~$time',
                    style: TextStyle(fontSize: 13, color: AppTheme.textSecondaryOf(context)),
                  ),
                ],
              ],
            ),
          ),
          // B nuqta
          Row(
            children: [
              Container(
                width: 10, height: 10,
                decoration: const BoxDecoration(color: AppTheme.accent, shape: BoxShape.circle),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  order.cargoTo ?? '—',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textPrimaryOf(context),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoGrid(BuildContext context) {
    final items = <_InfoItem>[];

    if (order.price != null) {
      items.add(_InfoItem(icon: Icons.payments, label: 'Narx', value: order.price!, color: AppTheme.successColor));
    }
    if (order.cargoWeight != null) {
      items.add(_InfoItem(icon: Icons.fitness_center, label: "Og'irlik", value: order.cargoWeight!));
    }
    if (order.cargoType != null) {
      items.add(_InfoItem(icon: Icons.category, label: 'Yuk turi', value: order.cargoType!));
    }
    if (order.vehicleCapacity != null) {
      items.add(_InfoItem(icon: Icons.straighten, label: 'Sig\'im', value: order.vehicleCapacity!));
    }
    if (order.senderName != null) {
      items.add(_InfoItem(icon: Icons.person, label: 'Yuboruvchi', value: order.senderName!));
    }
    if (order.groupTitle.isNotEmpty) {
      items.add(_InfoItem(icon: Icons.group, label: 'Guruh', value: order.groupTitle));
    }
    if (order.distance != null) {
      items.add(_InfoItem(icon: Icons.map, label: 'Masofa', value: '${order.distance} km'));
    }

    if (items.isEmpty) return const SizedBox();

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: items.map((item) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
          decoration: BoxDecoration(
            color: (item.color ?? AppTheme.primary).withValues(alpha: 0.06),
            borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(item.icon, size: 14, color: item.color ?? AppTheme.textSecondaryOf(context)),
              const SizedBox(width: 6),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(item.label, style: TextStyle(fontSize: 10, color: AppTheme.textHintOf(context))),
                  Text(
                    item.value,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: item.color ?? AppTheme.textPrimaryOf(context),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Future<void> _callPhone(String phone) async {
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  String _formatTime(DateTime d) {
    final diff = DateTime.now().difference(d);
    if (diff.inMinutes < 60) return '${diff.inMinutes} min oldin';
    if (diff.inHours < 24) return '${diff.inHours} soat oldin';
    return DateFormat('dd.MM HH:mm').format(d);
  }
}

class _InfoItem {
  final IconData icon;
  final String label;
  final String value;
  final Color? color;

  const _InfoItem({
    required this.icon,
    required this.label,
    required this.value,
    this.color,
  });
}
