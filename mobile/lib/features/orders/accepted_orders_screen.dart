import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../config/strings.dart';
import '../../config/theme.dart';
import '../../core/models/order.dart';
import '../../core/providers/lang_provider.dart';
import 'accepted_orders_provider.dart';

/// Qabul qilingan yuklar sahifasi — alohida bo'lim
class AcceptedOrdersScreen extends ConsumerStatefulWidget {
  const AcceptedOrdersScreen({super.key});

  @override
  ConsumerState<AcceptedOrdersScreen> createState() => _AcceptedOrdersScreenState();
}

class _AcceptedOrdersScreenState extends ConsumerState<AcceptedOrdersScreen> {
  String _statusFilter = 'ALL'; // ALL, ACTIVE, CLOSED

  @override
  Widget build(BuildContext context) {
    ref.watch(langProvider);
    final state = ref.watch(acceptedOrdersProvider);

    final filteredOrders = _statusFilter == 'ALL'
        ? state.orders
        : _statusFilter == 'ACTIVE'
            ? state.orders.where((o) =>
                o.acceptedStatus == 'ACCEPTED' || o.acceptedStatus == 'IN_PROGRESS').toList()
            : state.orders.where((o) => o.acceptedStatus == 'CLOSED').toList();

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        title: Text(AppStrings.qabulQilinganYuklar),
        backgroundColor: AppTheme.cardBgOf(context),
        foregroundColor: AppTheme.textPrimary,
        elevation: 0.5,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(acceptedOrdersProvider.notifier).refresh(),
          ),
        ],
      ),
      body: Column(
        children: [
          // ── Statistika ──
          Container(
            padding: const EdgeInsets.all(16),
            color: AppTheme.cardBgOf(context),
            child: Row(
              children: [
                _StatBadge(
                  icon: Icons.assignment_outlined,
                  label: AppStrings.jami,
                  value: '${state.total}',
                  color: AppTheme.infoColor,
                ),
                const SizedBox(width: 10),
                _StatBadge(
                  icon: Icons.pending_actions,
                  label: AppStrings.faol,
                  value: '${state.activeCount}',
                  color: AppTheme.driverPrimary,
                ),
                const SizedBox(width: 10),
                _StatBadge(
                  icon: Icons.check_circle_outline,
                  label: AppStrings.yopilgan,
                  value: '${state.closedCount}',
                  color: AppTheme.accentPurple,
                ),
              ],
            ),
          ),

          // ── Filtr chiplar ──
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: AppTheme.cardBgOf(context),
            child: Row(
              children: [
                _FilterChip(
                  label: AppStrings.barchasi,
                  isSelected: _statusFilter == 'ALL',
                  onTap: () => setState(() => _statusFilter = 'ALL'),
                ),
                const SizedBox(width: 8),
                _FilterChip(
                  label: AppStrings.faol,
                  isSelected: _statusFilter == 'ACTIVE',
                  color: AppTheme.driverPrimary,
                  onTap: () => setState(() => _statusFilter = 'ACTIVE'),
                ),
                const SizedBox(width: 8),
                _FilterChip(
                  label: AppStrings.yopilgan,
                  isSelected: _statusFilter == 'CLOSED',
                  color: AppTheme.accentPurple,
                  onTap: () => setState(() => _statusFilter = 'CLOSED'),
                ),
              ],
            ),
          ),

          const Divider(height: 1),

          // ── Ro'yxat ──
          Expanded(
            child: state.isLoading
                ? const Center(child: CircularProgressIndicator())
                : filteredOrders.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.inbox_outlined, size: 56, color: AppTheme.textHint.withValues(alpha: 0.5)),
                            const SizedBox(height: 16),
                            Text(
                              AppStrings.qabulQilinganYuklarYoq,
                              style: const TextStyle(fontSize: 16, color: AppTheme.textSecondary),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              AppStrings.buyurtmaSahifasidanYukQabulQiling,
                              style: const TextStyle(fontSize: 13, color: AppTheme.textHint),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: () => ref.read(acceptedOrdersProvider.notifier).refresh(),
                        child: ListView.builder(
                          padding: const EdgeInsets.all(12),
                          itemCount: filteredOrders.length,
                          itemBuilder: (context, index) => _AcceptedOrderCard(
                            order: filteredOrders[index],
                            onCloseDeal: _showCloseDealDialog,
                            onCancel: (id) async {
                              final success = await ref.read(acceptedOrdersProvider.notifier).cancelAccepted(id);
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(success ? AppStrings.bekorQilindi : AppStrings.xatolikYuzBerdi),
                                    backgroundColor: success ? AppTheme.successColor : AppTheme.errorColor,
                                  ),
                                );
                              }
                            },
                            onFindDriver: (order) => _handleFindDriver(order),
                          ),
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Future<void> _handleFindDriver(Order order) async {
    // Confirmation dialog
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(AppStrings.haydovchiTopish),
        content: Text(AppStrings.tarqatmoqchimisiz),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(AppStrings.bekor),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.accent),
            child: Text(AppStrings.tarqatish),
          ),
        ],
      ),
    );

    if (confirmed != true || !mounted) return;

    // Loading
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const Center(child: CircularProgressIndicator(color: AppTheme.accent)),
    );

    final result = await ref.read(acceptedOrdersProvider.notifier).findDriver(order.id);

    if (mounted) Navigator.pop(context); // close loading

    if (mounted) {
      if (result != null) {
        final sent = result['sent'] ?? 0;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(AppStrings.taGuruhgaYuborildi(sent as int)),
            backgroundColor: AppTheme.successColor,
          ),
        );
      } else {
        final error = ref.read(acceptedOrdersProvider).error;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error ?? AppStrings.xatolikYuzBerdi),
            backgroundColor: AppTheme.errorColor,
          ),
        );
      }
    }
  }

  void _showCloseDealDialog(Order order) {
    final amountCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 20, right: 20, top: 20,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40, height: 4,
                decoration: BoxDecoration(
                  color: AppTheme.dividerColor,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              AppStrings.yukniYopish,
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 8),
            Text(
              '${order.cargoFrom ?? "—"} → ${order.cargoTo ?? "—"}',
              style: const TextStyle(fontSize: 14, color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: amountCtrl,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: AppStrings.summaSom,
                prefixIcon: const Icon(Icons.payments_outlined),
                hintText: AppStrings.masalanSumma,
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: () async {
                  final amount = double.tryParse(amountCtrl.text);
                  if (amount == null || amount <= 0) {
                    ScaffoldMessenger.of(ctx).showSnackBar(
                      SnackBar(
                        content: Text(AppStrings.togriSummaKiriting),
                        backgroundColor: AppTheme.warningColor,
                      ),
                    );
                    return;
                  }
                  Navigator.pop(ctx);
                  final success = await ref.read(acceptedOrdersProvider.notifier).closeDeal(order.id, amount);
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(success ? AppStrings.bitimYopildi : AppStrings.xatolikYuzBerdi),
                        backgroundColor: success ? AppTheme.successColor : AppTheme.errorColor,
                      ),
                    );
                  }
                },
                style: ElevatedButton.styleFrom(backgroundColor: AppTheme.driverPrimary),
                child: Text(AppStrings.yopish, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AcceptedOrderCard extends StatelessWidget {
  final Order order;
  final void Function(Order) onCloseDeal;
  final void Function(String) onCancel;
  final void Function(Order) onFindDriver;

  const _AcceptedOrderCard({
    required this.order,
    required this.onCloseDeal,
    required this.onCancel,
    required this.onFindDriver,
  });

  @override
  Widget build(BuildContext context) {
    final from = order.cargoFrom ?? '—';
    final to = order.cargoTo ?? '—';
    final isClosed = order.acceptedStatus == 'CLOSED';
    final dateStr = order.acceptedAt != null
        ? DateFormat('dd.MM.yyyy HH:mm').format(order.acceptedAt!)
        : order.createdAt != null
            ? DateFormat('dd.MM.yyyy HH:mm').format(order.createdAt!)
            : '';

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: AppTheme.cardBgOf(context),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isClosed ? AppTheme.accentPurple.withValues(alpha: 0.3) : AppTheme.driverPrimary.withValues(alpha: 0.3),
          width: 1,
        ),
        boxShadow: const [AppTheme.cardShadow],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: isClosed
                  ? AppTheme.accentPurple.withValues(alpha: 0.05)
                  : AppTheme.driverPrimary.withValues(alpha: 0.05),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
            ),
            child: Row(
              children: [
                // Type badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: order.type == OrderType.cargo
                        ? AppTheme.infoColor.withValues(alpha: 0.1)
                        : AppTheme.accentOrange.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    order.type == OrderType.cargo ? AppStrings.yuk : AppStrings.haydovchiNomi,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: order.type == OrderType.cargo ? AppTheme.infoColor : AppTheme.accentOrange,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '$from → $to',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppTheme.textPrimary),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                // Status badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: isClosed
                        ? AppTheme.accentPurple.withValues(alpha: 0.12)
                        : AppTheme.driverPrimary.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    isClosed ? AppStrings.yopilgan : AppStrings.faol,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: isClosed ? AppTheme.accentPurple : AppTheme.driverPrimary,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Details
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Info chips
                Wrap(
                  spacing: 12,
                  runSpacing: 6,
                  children: [
                    if (order.vehicleType != null && order.vehicleType!.isNotEmpty)
                      _DetailChip(icon: Icons.local_shipping, text: order.vehicleType!),
                    if (order.cargoWeight != null && order.cargoWeight!.isNotEmpty)
                      _DetailChip(icon: Icons.scale, text: order.cargoWeight!),
                    if (order.price != null && order.price!.isNotEmpty)
                      _DetailChip(icon: Icons.payments, text: order.price!),
                    if (order.closedAmount != null)
                      _DetailChip(
                        icon: Icons.price_check,
                        text: '${order.closedAmount!.toStringAsFixed(0)} ${AppStrings.som}',
                        color: AppTheme.driverPrimary,
                      ),
                  ],
                ),

                if (order.phone != null && order.phone!.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  InkWell(
                    onTap: () => launchUrl(Uri.parse('tel:${order.phone}')),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.phone, size: 16, color: AppTheme.driverPrimary),
                        const SizedBox(width: 6),
                        Text(
                          order.phone!,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.driverPrimary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                // Date
                if (dateStr.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(
                    '${AppStrings.qabulQilinganVaqt}: $dateStr',
                    style: const TextStyle(fontSize: 12, color: AppTheme.textHint),
                  ),
                ],

                // Actions
                if (!isClosed) ...[
                  const SizedBox(height: 12),
                  // Haydovchi topish tugmasi
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () => onFindDriver(order),
                      icon: const Icon(Icons.search, size: 18),
                      label: Text(AppStrings.haydovchiTopish),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.accent,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => onCancel(order.id),
                          icon: const Icon(Icons.close, size: 16),
                          label: Text(AppStrings.bekor),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppTheme.errorColor,
                            side: const BorderSide(color: AppTheme.errorColor),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        flex: 2,
                        child: ElevatedButton.icon(
                          onPressed: () => onCloseDeal(order),
                          icon: const Icon(Icons.check_circle_outline, size: 18),
                          label: Text(AppStrings.yukniYopish),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.driverPrimary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatBadge extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatBadge({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(height: 4),
            Text(
              value,
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: color),
            ),
            Text(
              label,
              style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
            ),
          ],
        ),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final Color? color;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.isSelected,
    this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final activeColor = color ?? AppTheme.infoColor;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected ? activeColor : Colors.grey.shade100,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: isSelected ? Colors.white : AppTheme.textSecondary,
          ),
        ),
      ),
    );
  }
}

class _DetailChip extends StatelessWidget {
  final IconData icon;
  final String text;
  final Color? color;

  const _DetailChip({required this.icon, required this.text, this.color});

  @override
  Widget build(BuildContext context) {
    final c = color ?? AppTheme.textSecondary;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: c),
        const SizedBox(width: 4),
        Text(text, style: TextStyle(fontSize: 12, color: c, fontWeight: FontWeight.w500)),
      ],
    );
  }
}
