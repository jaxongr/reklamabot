import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../config/silk_theme.dart';
import '../../core/models/order.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/loading_indicator.dart';
import '../auth/auth_provider.dart';
import '../orders/orders_provider.dart';
import '../orders/accepted_orders_provider.dart';

/// Archive screen — dispatchers see all orders; drivers see only their accepted orders.
class ArchiveScreen extends ConsumerStatefulWidget {
  const ArchiveScreen({super.key});

  @override
  ConsumerState<ArchiveScreen> createState() => _ArchiveScreenState();
}

class _ArchiveScreenState extends ConsumerState<ArchiveScreen> {
  DateTime? _dateFrom;
  DateTime? _dateTo;
  int _activeFilter = 0;

  bool get _isDriver {
    final user = ref.read(authStateProvider).user;
    return user?.role.value == 'DRIVER';
  }

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      if (_isDriver) {
        ref.read(acceptedOrdersProvider.notifier).loadAccepted();
      } else {
        ref.read(ordersProvider.notifier).loadOrders();
      }
    });
  }

  Future<void> _onRefresh() async {
    if (_isDriver) {
      await ref.read(acceptedOrdersProvider.notifier).loadAccepted();
    } else {
      await ref.read(ordersProvider.notifier).loadOrders();
    }
  }

  Future<void> _pickDate({required bool isFrom}) async {
    final now = DateTime.now();
    final initial = isFrom ? (_dateFrom ?? now) : (_dateTo ?? now);
    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(2024),
      lastDate: now,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: Theme.of(context).colorScheme.copyWith(
                  primary: SilkTheme.brand,
                  onPrimary: Colors.white,
                ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        if (isFrom) {
          _dateFrom = picked;
        } else {
          _dateTo = picked;
        }
      });
    }
  }

  /// Filter labels depend on role
  List<String> get _filterLabels {
    if (_isDriver) {
      return ['Barchasi', 'Faol', 'Bajarilgan', 'Bekor'];
    }
    return ['Barchasi', 'Shaxsiy', 'Yopilgan'];
  }

  List<Order> _applyLocalFilters(List<Order> orders) {
    var result = orders;

    // Date range filter
    if (_dateFrom != null) {
      result = result.where((o) {
        final date = o.messageDate ?? o.createdAt;
        return date.isAfter(_dateFrom!.subtract(const Duration(days: 1)));
      }).toList();
    }
    if (_dateTo != null) {
      result = result.where((o) {
        final date = o.messageDate ?? o.createdAt;
        return date.isBefore(_dateTo!.add(const Duration(days: 1)));
      }).toList();
    }

    if (_isDriver) {
      // Driver filters by acceptedStatus
      switch (_activeFilter) {
        case 1: // Faol — accepted/in_progress
          result = result
              .where((o) =>
                  o.acceptedStatus == 'ACCEPTED' ||
                  o.acceptedStatus == 'IN_PROGRESS')
              .toList();
          break;
        case 2: // Bajarilgan — closed
          result = result
              .where((o) => o.acceptedStatus == 'CLOSED')
              .toList();
          break;
        case 3: // Bekor — cancelled
          result = result
              .where((o) => o.acceptedStatus == 'CANCELLED')
              .toList();
          break;
      }
    } else {
      // Dispatcher filters
      switch (_activeFilter) {
        case 1: // Shaxsiy
          result = result.where((o) => o.isManual).toList();
          break;
        case 2: // Yopilgan
          result = result
              .where((o) =>
                  o.status == OrderStatus.completed ||
                  o.status == OrderStatus.rejected)
              .toList();
          break;
      }
    }

    // Sort newest first
    result.sort((a, b) {
      final dateA = a.messageDate ?? a.createdAt;
      final dateB = b.messageDate ?? b.createdAt;
      return dateB.compareTo(dateA);
    });

    return result;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(
        title: 'Arxiv',
        showBack: true,
      ),
      backgroundColor: SilkTheme.bgOf(context),
      body: Column(
        children: [
          _buildDateRangeRow(),
          _buildFilterPills(),
          Expanded(child: _buildBody()),
        ],
      ),
    );
  }

  Widget _buildBody() {
    if (_isDriver) {
      return _buildDriverBody();
    }
    return _buildDispatcherBody();
  }

  Widget _buildDriverBody() {
    final state = ref.watch(acceptedOrdersProvider);

    if (state.isLoading && state.orders.isEmpty) {
      return const ShimmerLoading(itemCount: 5, itemHeight: 100);
    }

    if (state.error != null && state.orders.isEmpty) {
      return ErrorState(
        message: state.error!,
        onRetry: () => ref.read(acceptedOrdersProvider.notifier).loadAccepted(),
      );
    }

    final filtered = _applyLocalFilters(state.orders);

    if (filtered.isEmpty) {
      return const EmptyState(
        icon: Icons.archive_outlined,
        title: 'Arxivda buyurtma yo\'q',
        subtitle: 'Qabul qilgan buyurtmalaringiz\nbu yerda ko\'rinadi.',
      );
    }

    return RefreshIndicator(
      color: SilkTheme.brand,
      onRefresh: _onRefresh,
      child: ListView.separated(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        itemCount: filtered.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (context, index) {
          return _ArchiveOrderCard(
            order: filtered[index],
            isDriver: true,
          );
        },
      ),
    );
  }

  Widget _buildDispatcherBody() {
    final state = ref.watch(ordersProvider);

    if (state.isLoading && state.orders.isEmpty) {
      return const ShimmerLoading(itemCount: 5, itemHeight: 100);
    }

    if (state.error != null && state.orders.isEmpty) {
      return ErrorState(
        message: state.error!,
        onRetry: () => ref.read(ordersProvider.notifier).loadOrders(),
      );
    }

    final filtered = _applyLocalFilters(state.orders);

    if (filtered.isEmpty) {
      return const EmptyState(
        icon: Icons.archive_outlined,
        title: 'Arxivda buyurtma yo\'q',
        subtitle: 'Tanlangan filtrlar bo\'yicha\nbuyurtmalar topilmadi.',
      );
    }

    return RefreshIndicator(
      color: SilkTheme.brand,
      onRefresh: _onRefresh,
      child: ListView.separated(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        itemCount: filtered.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (context, index) {
          return _ArchiveOrderCard(
            order: filtered[index],
            isDriver: false,
          );
        },
      ),
    );
  }

  Widget _buildDateRangeRow() {
    final dateFormat = DateFormat('dd.MM.yyyy');

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: Row(
        children: [
          Expanded(
            child: _DateField(
              label: _dateFrom != null
                  ? dateFormat.format(_dateFrom!)
                  : 'Dan',
              onTap: () => _pickDate(isFrom: true),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _DateField(
              label: _dateTo != null
                  ? dateFormat.format(_dateTo!)
                  : 'Gacha',
              onTap: () => _pickDate(isFrom: false),
            ),
          ),
          if (_dateFrom != null || _dateTo != null) ...[
            const SizedBox(width: 8),
            GestureDetector(
              onTap: () {
                setState(() {
                  _dateFrom = null;
                  _dateTo = null;
                });
              },
              child: Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: SilkTheme.danger.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.close,
                  size: 18,
                  color: SilkTheme.danger,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildFilterPills() {
    final labels = _filterLabels;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      child: Row(
        children: List.generate(labels.length, (index) {
          final isActive = _activeFilter == index;
          return Padding(
            padding: EdgeInsets.only(right: index < labels.length - 1 ? 8 : 0),
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _activeFilter = index;
                });
              },
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: isActive
                      ? SilkTheme.brand
                      : SilkTheme.bgOf(context),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  labels[index],
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: isActive
                        ? Colors.white
                        : SilkTheme.mutedOf(context),
                  ),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}

/// Date field widget with calendar icon.
class _DateField extends StatelessWidget {
  final String label;
  final VoidCallback onTap;

  const _DateField({
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 44,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        decoration: BoxDecoration(
          color: SilkTheme.surfaceOf(context),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: SilkTheme.borderOf(context)),
        ),
        child: Row(
          children: [
            Icon(
              Icons.calendar_today_outlined,
              size: 16,
              color: SilkTheme.mutedOf(context),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  color: SilkTheme.mutedOf(context),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Archive order card with role-aware status display.
class _ArchiveOrderCard extends StatelessWidget {
  final Order order;
  final bool isDriver;

  const _ArchiveOrderCard({
    required this.order,
    required this.isDriver,
  });

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('dd.MM.yyyy HH:mm');
    final dateStr =
        dateFormat.format(order.messageDate ?? order.createdAt);

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: SilkTheme.surfaceOf(context),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: SilkTheme.borderOf(context)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Route
          Row(
            children: [
              Expanded(
                child: Text(
                  order.route,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: SilkTheme.inkOf(context),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              _buildStatusBadge(),
            ],
          ),

          const SizedBox(height: 10),

          // Info row: date, weight, vehicleType, price
          Wrap(
            spacing: 12,
            runSpacing: 6,
            children: [
              _buildInfoItem(context, Icons.access_time, dateStr),
              if (order.cargoWeight != null && order.cargoWeight!.isNotEmpty)
                _buildInfoItem(context, Icons.scale_outlined, order.cargoWeight!),
              if (order.vehicleType != null && order.vehicleType!.isNotEmpty)
                _buildInfoItem(
                    context, Icons.local_shipping_outlined, order.vehicleType!),
              if (order.price != null && order.price!.isNotEmpty)
                _buildInfoItem(context, Icons.payments_outlined, order.price!),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBadge() {
    Color color;
    String label;

    if (isDriver) {
      // Driver — show acceptedStatus
      switch (order.acceptedStatus) {
        case 'ACCEPTED':
        case 'IN_PROGRESS':
          color = SilkTheme.brand;
          label = 'Faol';
          break;
        case 'CLOSED':
          color = SilkTheme.success;
          label = 'Bajarilgan';
          break;
        case 'CANCELLED':
          color = SilkTheme.danger;
          label = 'Bekor';
          break;
        default:
          color = SilkTheme.brand;
          label = order.status.label;
      }
    } else {
      // Dispatcher — show order status
      switch (order.status) {
        case OrderStatus.completed:
          color = SilkTheme.success;
          break;
        case OrderStatus.rejected:
          color = SilkTheme.danger;
          break;
        case OrderStatus.contacted:
          color = SilkTheme.brand;
          break;
        case OrderStatus.viewed:
          color = SilkTheme.accent2;
          break;
        default:
          color = SilkTheme.brand;
      }
      label = order.status.label;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
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

  Widget _buildInfoItem(BuildContext context, IconData icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 13, color: SilkTheme.mutedOf(context)),
        const SizedBox(width: 4),
        Text(
          text,
          style: TextStyle(
            fontSize: 12,
            color: SilkTheme.mutedOf(context),
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
