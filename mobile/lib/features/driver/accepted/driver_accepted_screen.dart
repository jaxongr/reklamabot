import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../config/theme.dart';
import '../driver_provider.dart';

class DriverAcceptedScreen extends ConsumerStatefulWidget {
  const DriverAcceptedScreen({super.key});

  @override
  ConsumerState<DriverAcceptedScreen> createState() =>
      _DriverAcceptedScreenState();
}

class _DriverAcceptedScreenState extends ConsumerState<DriverAcceptedScreen> {
  String _filter = 'active'; // active, completed, cancelled

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(driverAcceptedProvider.notifier).loadOrders(status: _filter);
    });
  }

  void _changeFilter(String filter) {
    setState(() => _filter = filter);
    ref.read(driverAcceptedProvider.notifier).loadOrders(status: filter);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(driverAcceptedProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FC),
      appBar: AppBar(
        title: const Text('Qabul qilinganlar'),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1A1A2E),
        elevation: 0,
        scrolledUnderElevation: 0,
        surfaceTintColor: Colors.transparent,
      ),
      body: Column(
        children: [
          // Filter pills
          Container(
            color: AppTheme.cardBgOf(context),
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Row(
              children: [
                _FilterPill(
                  label: 'Faol',
                  isSelected: _filter == 'active',
                  onTap: () => _changeFilter('active'),
                  color: AppTheme.driverPrimary,
                ),
                const SizedBox(width: 8),
                _FilterPill(
                  label: 'Bajarilgan',
                  isSelected: _filter == 'completed',
                  onTap: () => _changeFilter('completed'),
                  color: AppTheme.successColor,
                ),
                const SizedBox(width: 8),
                _FilterPill(
                  label: 'Bekor',
                  isSelected: _filter == 'cancelled',
                  onTap: () => _changeFilter('cancelled'),
                  color: AppTheme.errorColor,
                ),
              ],
            ),
          ),
          // Content
          Expanded(
            child: RefreshIndicator(
              color: AppTheme.driverPrimary,
              onRefresh: () => ref
                  .read(driverAcceptedProvider.notifier)
                  .loadOrders(status: _filter),
              child: state.isLoading && state.orders.isEmpty
                  ? const Center(
                      child: CircularProgressIndicator(
                          color: AppTheme.driverPrimary))
                  : state.orders.isEmpty
                      ? _buildEmpty()
                      : ListView.separated(
                          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                          itemCount: state.orders.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: 10),
                          itemBuilder: (context, index) {
                            return _AcceptedOrderCard(
                              order: state.orders[index],
                              filter: _filter,
                            );
                          },
                        ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmpty() {
    final icon = _filter == 'active'
        ? Icons.assignment_outlined
        : _filter == 'completed'
            ? Icons.check_circle_outline
            : Icons.cancel_outlined;
    final text = _filter == 'active'
        ? 'Faol zakazlar yo\'q'
        : _filter == 'completed'
            ? 'Bajarilgan zakazlar yo\'q'
            : 'Bekor qilingan zakazlar yo\'q';

    return ListView(
      children: [
        SizedBox(height: MediaQuery.of(context).size.height * 0.25),
        Icon(icon, size: 64, color: AppTheme.textHintOf(context)),
        const SizedBox(height: 16),
        Text(
          text,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 16,
            color: AppTheme.textSecondaryOf(context),
          ),
        ),
      ],
    );
  }
}

class _FilterPill extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;
  final Color color;

  const _FilterPill({
    required this.label,
    required this.isSelected,
    required this.onTap,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? color : AppTheme.bgBodyOf(context),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? color : AppTheme.cardBorderOf(context),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color:
                isSelected ? Colors.white : AppTheme.textSecondaryOf(context),
          ),
        ),
      ),
    );
  }
}

// ============================================================
// ACCEPTED ORDER CARD — Full details + phone + tracking
// ============================================================

class _AcceptedOrderCard extends ConsumerWidget {
  final Map<String, dynamic> order;
  final String filter;

  const _AcceptedOrderCard({required this.order, required this.filter});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final from = order['cargoFrom'] as String? ?? '\u2014';
    final to = order['cargoTo'] as String? ?? '\u2014';
    final status = order['acceptedStatus'] as String? ?? 'ACCEPTED';
    final phone = order['phone'] as String? ?? order['senderPhone'] as String?;
    final vehicleType = order['vehicleType'] as String?;
    final vehicleCapacity = order['vehicleCapacity'] as String?;
    final weight = order['cargoWeight'] as String?;
    final price = order['price'] as String?;
    final orderId = order['id'] as String;
    final isCargo = order['type'] == 'CARGO';
    final typeLabel = isCargo ? 'Yuk' : 'Haydovchi';
    final scope = order['scope'] as String? ?? 'INTERNAL';
    final messageText = order['messageText'] as String? ?? '';
    final sender = order['senderName'] as String? ?? '';
    final senderUsername = order['senderUsername'] as String? ?? '';
    final groupTitle = order['groupTitle'] as String? ?? '';
    final createdAt = order['createdAt'] as String?;
    final cargoType = order['cargoType'] as String? ?? '';

    return GestureDetector(
      onTap: () => _showOrderDetail(context, ref),
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.cardBgOf(context),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppTheme.dividerOf(context), width: 1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header: type + scope + status + time
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 12, 14, 0),
              child: Row(
                children: [
                  _TypeBadge(label: typeLabel, isCargo: isCargo),
                  const SizedBox(width: 6),
                  _ScopeBadge(scope: scope),
                  const SizedBox(width: 6),
                  _StatusBadge(status: status),
                  const Spacer(),
                  if (createdAt != null)
                    Text(
                      _timeAgo(createdAt),
                      style: TextStyle(
                        fontSize: 11,
                        color: AppTheme.textHintOf(context),
                      ),
                    ),
                ],
              ),
            ),

            const SizedBox(height: 10),

            // Route: FROM -> TO
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        width: 10,
                        height: 10,
                        decoration: const BoxDecoration(
                          color: AppTheme.driverPrimary,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          from,
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.textPrimaryOf(context),
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  Padding(
                    padding: const EdgeInsets.only(left: 4),
                    child: Column(
                      children: List.generate(
                        2,
                        (_) => Container(
                          width: 2,
                          height: 4,
                          margin: const EdgeInsets.symmetric(vertical: 1),
                          decoration: BoxDecoration(
                            color: AppTheme.textHintOf(context)
                                .withValues(alpha: 0.4),
                            borderRadius: BorderRadius.circular(1),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Row(
                    children: [
                      Container(
                        width: 10,
                        height: 10,
                        decoration: const BoxDecoration(
                          color: AppTheme.accent,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          to,
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.textPrimaryOf(context),
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 10),

            // Info chips: vehicle, weight, price, cargoType
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              child: Wrap(
                spacing: 10,
                runSpacing: 6,
                children: [
                  if (vehicleType != null && vehicleType.isNotEmpty)
                    _InfoChip(
                      icon: Icons.local_shipping_outlined,
                      text: vehicleCapacity != null &&
                              vehicleCapacity.isNotEmpty
                          ? '$vehicleType ($vehicleCapacity)'
                          : vehicleType,
                    ),
                  if (weight != null && weight.isNotEmpty)
                    _InfoChip(icon: Icons.scale_outlined, text: weight),
                  if (cargoType.isNotEmpty)
                    _InfoChip(
                        icon: Icons.inventory_2_outlined, text: cargoType),
                  if (price != null && price.isNotEmpty)
                    _InfoChip(
                      icon: Icons.payments_outlined,
                      text: price,
                      highlight: true,
                    ),
                ],
              ),
            ),

            // Message text preview
            if (messageText.isNotEmpty) ...[
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                child: Text(
                  messageText.replaceAll(RegExp(r'\s+'), ' ').trim(),
                  style: TextStyle(
                    fontSize: 12.5,
                    color: AppTheme.textSecondaryOf(context),
                    height: 1.4,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],

            // Sender info
            if (sender.isNotEmpty || groupTitle.isNotEmpty) ...[
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                child: Row(
                  children: [
                    if (sender.isNotEmpty) ...[
                      Icon(Icons.person_outlined,
                          size: 14, color: AppTheme.textHintOf(context)),
                      const SizedBox(width: 4),
                      Flexible(
                        child: Text(
                          sender,
                          style: TextStyle(
                            fontSize: 12,
                            color: AppTheme.textSecondaryOf(context),
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                    if (groupTitle.isNotEmpty && sender.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 6),
                        child: Text(
                          '\u2022',
                          style: TextStyle(
                            fontSize: 10,
                            color: AppTheme.textHintOf(context),
                          ),
                        ),
                      ),
                    if (groupTitle.isNotEmpty)
                      Flexible(
                        child: Text(
                          groupTitle,
                          style: TextStyle(
                            fontSize: 11,
                            color: AppTheme.textHintOf(context),
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 10),
            Divider(
                height: 1,
                color: AppTheme.dividerOf(context),
                indent: 14,
                endIndent: 14),

            // Phone call button + tracking actions
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 10, 14, 12),
              child: Column(
                children: [
                  // Phone call row
                  if (phone != null && phone.isNotEmpty)
                    Row(
                      children: [
                        // Call button
                        Expanded(
                          child: GestureDetector(
                            onTap: () async {
                              final uri = Uri.parse('tel:$phone');
                              if (await canLaunchUrl(uri)) {
                                await launchUrl(uri);
                              }
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 14, vertical: 10),
                              decoration: BoxDecoration(
                                color: AppTheme.successColor
                                    .withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: AppTheme.successColor
                                      .withValues(alpha: 0.3),
                                ),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.phone,
                                      size: 18,
                                      color: AppTheme.successColor),
                                  const SizedBox(width: 8),
                                  Text(
                                    phone,
                                    style: const TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w600,
                                      color: AppTheme.successColor,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        // Copy button
                        GestureDetector(
                          onTap: () {
                            Clipboard.setData(ClipboardData(text: phone));
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: const Text('Raqam nusxalandi'),
                                behavior: SnackBarBehavior.floating,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                duration: const Duration(seconds: 1),
                              ),
                            );
                          },
                          child: Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: AppTheme.textHintOf(context)
                                  .withValues(alpha: 0.08),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(Icons.copy,
                                size: 18,
                                color: AppTheme.textSecondaryOf(context)),
                          ),
                        ),
                      ],
                    ),

                  // Tracking action buttons (only for active filter)
                  if (filter == 'active') ...[
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        // Cancel button
                        Expanded(
                          flex: 1,
                          child: OutlinedButton(
                            onPressed: () =>
                                _confirmCancel(context, ref, orderId),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppTheme.errorColor,
                              side:
                                  const BorderSide(color: AppTheme.errorColor),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                              padding:
                                  const EdgeInsets.symmetric(vertical: 10),
                            ),
                            child: const Text('Bekor',
                                style: TextStyle(fontSize: 13)),
                          ),
                        ),
                        const SizedBox(width: 10),
                        // Next status button
                        if (_nextStatus(status) != null)
                          Expanded(
                            flex: 2,
                            child: ElevatedButton.icon(
                              onPressed: () =>
                                  _updateStatus(context, ref, orderId, status),
                              icon: Icon(_nextStatusIcon(status), size: 18),
                              label: Text(
                                _nextStatusLabel(status),
                                style: const TextStyle(
                                    fontSize: 13, fontWeight: FontWeight.w600),
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: _nextStatusColor(status),
                                foregroundColor: Colors.white,
                                elevation: 0,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                padding:
                                    const EdgeInsets.symmetric(vertical: 10),
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
      ),
    );
  }

  String? _nextStatus(String current) {
    switch (current) {
      case 'ACCEPTED':
        return 'ON_WAY';
      case 'ON_WAY':
        return 'ARRIVED';
      case 'ARRIVED':
        return 'COMPLETED';
      default:
        return null;
    }
  }

  String _nextStatusLabel(String current) {
    switch (current) {
      case 'ACCEPTED':
        return "Yo'lga chiqdim";
      case 'ON_WAY':
        return 'Yetib bordim';
      case 'ARRIVED':
        return 'Topshirdim';
      default:
        return '';
    }
  }

  IconData _nextStatusIcon(String current) {
    switch (current) {
      case 'ACCEPTED':
        return Icons.directions_car;
      case 'ON_WAY':
        return Icons.location_on;
      case 'ARRIVED':
        return Icons.check_circle;
      default:
        return Icons.arrow_forward;
    }
  }

  Color _nextStatusColor(String current) {
    switch (current) {
      case 'ACCEPTED':
        return AppTheme.driverPrimary;
      case 'ON_WAY':
        return AppTheme.accent;
      case 'ARRIVED':
        return AppTheme.successColor;
      default:
        return AppTheme.driverPrimary;
    }
  }

  void _updateStatus(BuildContext context, WidgetRef ref, String orderId,
      String current) async {
    final next = _nextStatus(current);
    if (next == null) return;

    final success = await ref
        .read(driverAcceptedProvider.notifier)
        .updateTracking(orderId, next);
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content:
              Text(success ? 'Status yangilandi' : 'Xatolik yuz berdi'),
          backgroundColor:
              success ? AppTheme.successColor : AppTheme.errorColor,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      );
    }
  }

  void _confirmCancel(
      BuildContext context, WidgetRef ref, String orderId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Bekor qilish'),
        content: const Text('Zakazni bekor qilmoqchimisiz?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text("Yo'q"),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: AppTheme.errorColor),
            child: const Text('Ha, bekor'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final success = await ref
          .read(driverAcceptedProvider.notifier)
          .cancelOrder(orderId);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
                success ? 'Zakaz bekor qilindi' : 'Xatolik yuz berdi'),
            backgroundColor:
                success ? AppTheme.successColor : AppTheme.errorColor,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        );
      }
    }
  }

  void _showOrderDetail(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _AcceptedOrderDetailSheet(
        order: order,
        filter: filter,
        ref: ref,
      ),
    );
  }

  String _timeAgo(String iso) {
    try {
      final dt = DateTime.parse(iso).toLocal();
      final now = DateTime.now();
      final diff = now.difference(dt);
      if (diff.inMinutes < 1) return 'hozirgina';
      if (diff.inMinutes < 60) return '${diff.inMinutes} daq';
      if (diff.inHours < 24) return '${diff.inHours} soat';
      if (diff.inDays < 7) return '${diff.inDays} kun';
      return '${dt.day}.${dt.month.toString().padLeft(2, '0')}';
    } catch (_) {
      return '';
    }
  }
}

// ============================================================
// FULL ORDER DETAIL BOTTOM SHEET (for accepted orders)
// ============================================================

class _AcceptedOrderDetailSheet extends StatelessWidget {
  final Map<String, dynamic> order;
  final String filter;
  final WidgetRef ref;

  const _AcceptedOrderDetailSheet({
    required this.order,
    required this.filter,
    required this.ref,
  });

  @override
  Widget build(BuildContext context) {
    final from = order['cargoFrom'] ?? '\u2014';
    final to = order['cargoTo'] ?? '\u2014';
    final isCargo = order['type'] == 'CARGO';
    final typeLabel = isCargo ? 'Yuk' : 'Haydovchi';
    final weight = order['cargoWeight'] as String? ?? '';
    final phone = order['phone'] as String? ?? order['senderPhone'] as String? ?? '';
    final price = order['price'] as String? ?? '';
    final vehicle = order['vehicleType'] as String? ?? '';
    final vehicleCapacity = order['vehicleCapacity'] as String? ?? '';
    final sender = order['senderName'] as String? ?? '';
    final senderUsername = order['senderUsername'] as String? ?? '';
    final scope = order['scope'] as String? ?? 'INTERNAL';
    final messageText = order['messageText'] as String? ?? '';
    final createdAt = order['createdAt'] as String?;
    final groupTitle = order['groupTitle'] as String? ?? '';
    final cargoType = order['cargoType'] as String? ?? '';
    final status = order['acceptedStatus'] as String? ?? 'ACCEPTED';
    final distance = order['distance'];
    final senderTodayAds = order['senderTodayAds'] ?? 0;
    final senderTotalAds = order['senderTotalAds'] ?? 0;

    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (context, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: AppTheme.cardBgOf(context),
            borderRadius:
                const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              // Handle
              Padding(
                padding: const EdgeInsets.only(top: 10, bottom: 4),
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color:
                        AppTheme.textHintOf(context).withValues(alpha: 0.3),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              // Header
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
                child: Row(
                  children: [
                    _TypeBadge(label: typeLabel, isCargo: isCargo),
                    const SizedBox(width: 8),
                    _ScopeBadge(scope: scope),
                    const SizedBox(width: 8),
                    _StatusBadge(status: status),
                    const Spacer(),
                    if (createdAt != null)
                      Text(
                        _formatDateTime(createdAt),
                        style: TextStyle(
                          fontSize: 12,
                          color: AppTheme.textHintOf(context),
                        ),
                      ),
                  ],
                ),
              ),
              Divider(height: 1, color: AppTheme.dividerOf(context)),

              // Scrollable content
              Expanded(
                child: SingleChildScrollView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Route card
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppTheme.bgBodyOf(context),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 12,
                                  height: 12,
                                  decoration: const BoxDecoration(
                                    color: AppTheme.driverPrimary,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    from,
                                    style: TextStyle(
                                      fontSize: 17,
                                      fontWeight: FontWeight.w600,
                                      color: AppTheme.textPrimaryOf(context),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            Padding(
                              padding: const EdgeInsets.only(left: 5),
                              child: Column(
                                children: List.generate(
                                  3,
                                  (_) => Container(
                                    width: 2,
                                    height: 5,
                                    margin: const EdgeInsets.symmetric(
                                        vertical: 1.5),
                                    decoration: BoxDecoration(
                                      color: AppTheme.textHintOf(context)
                                          .withValues(alpha: 0.3),
                                      borderRadius: BorderRadius.circular(1),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            Row(
                              children: [
                                Container(
                                  width: 12,
                                  height: 12,
                                  decoration: const BoxDecoration(
                                    color: AppTheme.accent,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    to,
                                    style: TextStyle(
                                      fontSize: 17,
                                      fontWeight: FontWeight.w600,
                                      color: AppTheme.textPrimaryOf(context),
                                    ),
                                  ),
                                ),
                                if (distance != null && distance > 0)
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: AppTheme.driverPrimary
                                          .withValues(alpha: 0.08),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      '$distance km',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w500,
                                        color: AppTheme.driverPrimary,
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Details grid
                      Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        children: [
                          if (vehicle.isNotEmpty)
                            _DetailTile(
                              icon: Icons.local_shipping_outlined,
                              label: 'Mashina',
                              value: vehicleCapacity.isNotEmpty
                                  ? '$vehicle ($vehicleCapacity)'
                                  : vehicle,
                            ),
                          if (weight.isNotEmpty)
                            _DetailTile(
                              icon: Icons.scale_outlined,
                              label: 'Og\'irlik',
                              value: weight,
                            ),
                          if (cargoType.isNotEmpty)
                            _DetailTile(
                              icon: Icons.inventory_2_outlined,
                              label: 'Yuk turi',
                              value: cargoType,
                            ),
                          if (price.isNotEmpty)
                            _DetailTile(
                              icon: Icons.payments_outlined,
                              label: 'Narx',
                              value: price,
                              highlight: true,
                            ),
                        ],
                      ),

                      // Full message text
                      if (messageText.isNotEmpty) ...[
                        const SizedBox(height: 16),
                        Text(
                          'Xabar matni',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.textPrimaryOf(context),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: AppTheme.bgBodyOf(context),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: SelectableText(
                            messageText,
                            style: TextStyle(
                              fontSize: 13.5,
                              color: AppTheme.textPrimaryOf(context),
                              height: 1.5,
                            ),
                          ),
                        ),
                      ],

                      // Sender info
                      const SizedBox(height: 16),
                      Text(
                        'Yuboruvchi',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.textPrimaryOf(context),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppTheme.bgBodyOf(context),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (sender.isNotEmpty)
                              _SenderRow(
                                  icon: Icons.person_outlined, text: sender),
                            if (senderUsername.isNotEmpty) ...[
                              const SizedBox(height: 6),
                              _SenderRow(
                                  icon: Icons.alternate_email,
                                  text: '@$senderUsername'),
                            ],
                            if (groupTitle.isNotEmpty) ...[
                              const SizedBox(height: 6),
                              _SenderRow(
                                  icon: Icons.group_outlined,
                                  text: groupTitle),
                            ],
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                _StatChip(
                                  label: 'Bugun',
                                  value: '$senderTodayAds ta e\'lon',
                                ),
                                const SizedBox(width: 8),
                                _StatChip(
                                  label: 'Jami',
                                  value: '$senderTotalAds ta e\'lon',
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Bottom: Phone call + actions
              Container(
                padding: EdgeInsets.fromLTRB(
                    20, 12, 20, MediaQuery.of(context).padding.bottom + 12),
                decoration: BoxDecoration(
                  color: AppTheme.cardBgOf(context),
                  border: Border(
                    top: BorderSide(
                        color: AppTheme.dividerOf(context), width: 0.5),
                  ),
                ),
                child: Column(
                  children: [
                    // Phone call button — prominent
                    if (phone.isNotEmpty)
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () async {
                                final uri = Uri.parse('tel:$phone');
                                if (await canLaunchUrl(uri)) {
                                  await launchUrl(uri);
                                }
                              },
                              icon:
                                  const Icon(Icons.phone, size: 20),
                              label: Text(
                                'Qo\'ng\'iroq: $phone',
                                style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600),
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.successColor,
                                foregroundColor: Colors.white,
                                elevation: 0,
                                padding:
                                    const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          GestureDetector(
                            onTap: () {
                              Clipboard.setData(
                                  ClipboardData(text: phone));
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content:
                                      const Text('Raqam nusxalandi'),
                                  behavior: SnackBarBehavior.floating,
                                  shape: RoundedRectangleBorder(
                                    borderRadius:
                                        BorderRadius.circular(8),
                                  ),
                                  duration:
                                      const Duration(seconds: 1),
                                ),
                              );
                            },
                            child: Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: AppTheme.textHintOf(context)
                                    .withValues(alpha: 0.08),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(Icons.copy,
                                  size: 20,
                                  color:
                                      AppTheme.textSecondaryOf(context)),
                            ),
                          ),
                        ],
                      ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  String _formatDateTime(String iso) {
    try {
      final dt = DateTime.parse(iso).toLocal();
      final months = [
        'yan', 'fev', 'mar', 'apr', 'may', 'iyn',
        'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'
      ];
      return '${dt.day} ${months[dt.month - 1]}, ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return '';
    }
  }
}

// ============================================================
// SHARED WIDGETS
// ============================================================

class _StatusBadge extends StatelessWidget {
  final String status;

  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    Color color;
    String label;
    switch (status) {
      case 'ACCEPTED':
        color = AppTheme.driverPrimary;
        label = 'Qabul qilindi';
        break;
      case 'ON_WAY':
        color = AppTheme.warningColor;
        label = "Yo'lda";
        break;
      case 'ARRIVED':
        color = AppTheme.accent;
        label = 'Yetib bordi';
        break;
      case 'COMPLETED':
        color = AppTheme.successColor;
        label = 'Bajarildi';
        break;
      case 'CANCELLED':
        color = AppTheme.errorColor;
        label = 'Bekor';
        break;
      default:
        color = AppTheme.textHintOf(context);
        label = status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}

class _TypeBadge extends StatelessWidget {
  final String label;
  final bool isCargo;

  const _TypeBadge({required this.label, required this.isCargo});

  @override
  Widget build(BuildContext context) {
    final color = isCargo ? AppTheme.accentBlue : AppTheme.driverPrimary;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w500,
          color: color,
        ),
      ),
    );
  }
}

class _ScopeBadge extends StatelessWidget {
  final String scope;

  const _ScopeBadge({required this.scope});

  @override
  Widget build(BuildContext context) {
    Color color;
    String label;
    switch (scope) {
      case 'IMPORT':
        color = AppTheme.successColor;
        label = 'Import';
        break;
      case 'EXPORT':
        color = AppTheme.warningColor;
        label = 'Eksport';
        break;
      default:
        color = AppTheme.infoColor;
        label = 'Ichki';
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w500,
          color: color,
        ),
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String text;
  final bool highlight;

  const _InfoChip(
      {required this.icon, required this.text, this.highlight = false});

  @override
  Widget build(BuildContext context) {
    final color = highlight
        ? AppTheme.driverPrimary
        : AppTheme.textSecondaryOf(context);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: color.withValues(alpha: 0.7)),
        const SizedBox(width: 4),
        Text(
          text,
          style: TextStyle(
            fontSize: 13,
            fontWeight: highlight ? FontWeight.w600 : FontWeight.w400,
            color: color,
          ),
        ),
      ],
    );
  }
}

class _DetailTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final bool highlight;

  const _DetailTile({
    required this.icon,
    required this.label,
    required this.value,
    this.highlight = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: highlight
            ? AppTheme.driverPrimary.withValues(alpha: 0.06)
            : AppTheme.bgBodyOf(context),
        borderRadius: BorderRadius.circular(10),
        border: highlight
            ? Border.all(
                color: AppTheme.driverPrimary.withValues(alpha: 0.15))
            : null,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 16,
            color: highlight
                ? AppTheme.driverPrimary
                : AppTheme.textHintOf(context),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 10,
                  color: AppTheme.textHintOf(context),
                ),
              ),
              Text(
                value,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: highlight
                      ? AppTheme.driverPrimary
                      : AppTheme.textPrimaryOf(context),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SenderRow extends StatelessWidget {
  final IconData icon;
  final String text;

  const _SenderRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 14, color: AppTheme.textHintOf(context)),
        const SizedBox(width: 6),
        Expanded(
          child: Text(
            text,
            style: TextStyle(
              fontSize: 13,
              color: AppTheme.textSecondaryOf(context),
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}

class _StatChip extends StatelessWidget {
  final String label;
  final String value;

  const _StatChip({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppTheme.driverPrimary.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        '$label: $value',
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w500,
          color: AppTheme.driverPrimary,
        ),
      ),
    );
  }
}
