import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../config/routes.dart';
import '../../config/silk_theme.dart';
import '../../core/models/order.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/loading_indicator.dart';
import 'marketplace_provider.dart';

class MarketplaceScreen extends ConsumerStatefulWidget {
  const MarketplaceScreen({super.key});

  @override
  ConsumerState<MarketplaceScreen> createState() => _MarketplaceScreenState();
}

class _MarketplaceScreenState extends ConsumerState<MarketplaceScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(marketplaceProvider);

    return Scaffold(
      appBar: CustomAppBar(
        title: 'Marketplace',
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: SilkTheme.muted),
            onPressed: () => ref.read(marketplaceProvider.notifier).refresh(),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: SilkTheme.brand,
          unselectedLabelColor: SilkTheme.muted2,
          indicatorColor: SilkTheme.brand,
          indicatorWeight: 3,
          labelStyle: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
          unselectedLabelStyle: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
          tabs: const [
            Tab(text: 'Sotuvdagilar'),
            Tab(text: 'Mening buyurtmalarim'),
          ],
        ),
      ),
      backgroundColor: SilkTheme.bg,
      body: TabBarView(
        controller: _tabController,
        children: [
          _ForSaleTab(state: state),
          _MyOrdersTab(state: state),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push(AppRoutes.marketplaceCreate),
        backgroundColor: SilkTheme.brand,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Yangi buyurtma'),
      ),
    );
  }
}

// ─────────────────────────────────────────────
// Tab 1: For-sale orders
// ─────────────────────────────────────────────

class _ForSaleTab extends ConsumerWidget {
  final MarketplaceState state;

  const _ForSaleTab({required this.state});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (state.isLoading && state.orders.isEmpty) {
      return const ShimmerLoading(itemCount: 4, itemHeight: 160);
    }

    if (state.error != null && state.orders.isEmpty) {
      return ErrorState(
        message: state.error!,
        onRetry: () => ref.read(marketplaceProvider.notifier).loadOrders(),
      );
    }

    if (state.orders.isEmpty) {
      return const EmptyState(
        icon: Icons.storefront_outlined,
        title: 'Sotuvdagi buyurtma yo\'q',
        subtitle: 'Hozircha sotuvga qo\'yilgan buyurtma mavjud emas.',
      );
    }

    return RefreshIndicator(
      color: SilkTheme.brand,
      onRefresh: () => ref.read(marketplaceProvider.notifier).loadOrders(),
      child: ListView.builder(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
        itemCount: state.orders.length,
        itemBuilder: (context, index) {
          final order = state.orders[index];
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: _ForSaleOrderCard(order: order),
          );
        },
      ),
    );
  }
}

class _ForSaleOrderCard extends ConsumerWidget {
  final Order order;

  const _ForSaleOrderCard({required this.order});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dateFormat = DateFormat('dd.MM HH:mm');
    final hasSurge = order.surgeMultiplier != null && order.surgeMultiplier! > 1;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: SilkTheme.surface,
        borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
        border: Border.all(
          color: hasSurge
              ? SilkTheme.accent2.withValues(alpha: 0.5)
              : SilkTheme.border.withValues(alpha: 0.5),
        ),
        boxShadow: const [SilkTheme.cardShadow],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Route + Type badge
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: _typeColor(order.type).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(SilkTheme.radiusSmall),
                ),
                child: Icon(
                  order.type == OrderType.driver
                      ? Icons.local_shipping
                      : Icons.inventory_2_outlined,
                  color: _typeColor(order.type),
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      order.route,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: SilkTheme.ink,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (order.scope != OrderScope.internal)
                      Text(
                        order.scope.label,
                        style: const TextStyle(
                          fontSize: 12,
                          color: SilkTheme.muted2,
                        ),
                      ),
                  ],
                ),
              ),
              // Type badge
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: _typeColor(order.type).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  order.type.label,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: _typeColor(order.type),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Price row
          Row(
            children: [
              if (order.price != null && order.price!.isNotEmpty) ...[
                _buildInfoChip(Icons.payments_outlined, order.price!),
                const SizedBox(width: 8),
              ],
              if (order.salePrice != null && order.salePrice!.isNotEmpty) ...[
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: SilkTheme.success.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.sell_outlined,
                          size: 14, color: SilkTheme.success),
                      const SizedBox(width: 4),
                      Text(
                        '${order.salePrice} so\'m',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: SilkTheme.success,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
              ],
              if (hasSurge)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: SilkTheme.accent2.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.trending_up,
                          size: 14, color: SilkTheme.accent2),
                      const SizedBox(width: 4),
                      Text(
                        'x${order.surgeMultiplier!.toStringAsFixed(1)}',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: SilkTheme.accent2,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),

          if (order.vehicleType != null || order.cargoWeight != null) ...[
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 6,
              children: [
                if (order.vehicleType != null)
                  _buildInfoChip(
                      Icons.directions_car_outlined, order.vehicleType!),
                if (order.cargoWeight != null)
                  _buildInfoChip(Icons.scale_outlined, order.cargoWeight!),
              ],
            ),
          ],

          const SizedBox(height: 12),
          const Divider(height: 1, color: SilkTheme.border),
          const SizedBox(height: 12),

          // Bottom: date + accept button
          Row(
            children: [
              const Icon(Icons.access_time, size: 14, color: SilkTheme.muted2),
              const SizedBox(width: 4),
              Text(
                dateFormat.format(order.createdAt),
                style: const TextStyle(
                  fontSize: 12,
                  color: SilkTheme.muted2,
                ),
              ),
              const Spacer(),
              SizedBox(
                height: 34,
                child: ElevatedButton.icon(
                  onPressed: () => _onAccept(context, ref),
                  icon: const Icon(Icons.check, size: 16),
                  label: const Text('Qabul qilish'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: SilkTheme.success,
                    foregroundColor: Colors.white,
                    padding:
                        const EdgeInsets.symmetric(horizontal: 14, vertical: 0),
                    textStyle: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius:
                          BorderRadius.circular(SilkTheme.radiusSmall),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _onAccept(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(SilkTheme.radiusLarge),
        ),
        title: const Text('Tasdiqlash'),
        content: Text(
          '${order.route} yo\'nalishi bo\'yicha buyurtmani qabul qilmoqchimisiz?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Bekor qilish'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Qabul qilish'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final success =
          await ref.read(marketplaceProvider.notifier).acceptOrder(order.id);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(success
                ? 'Buyurtma muvaffaqiyatli qabul qilindi'
                : 'Buyurtmani qabul qilishda xatolik'),
            backgroundColor: success ? SilkTheme.success : SilkTheme.danger,
          ),
        );
      }
    }
  }

  Color _typeColor(OrderType type) {
    return type == OrderType.driver
        ? const Color(0xFFFA8C16)
        : SilkTheme.brand;
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

// ─────────────────────────────────────────────
// Tab 2: My manual orders
// ─────────────────────────────────────────────

class _MyOrdersTab extends ConsumerWidget {
  final MarketplaceState state;

  const _MyOrdersTab({required this.state});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (state.isLoading && state.myOrders.isEmpty) {
      return const ShimmerLoading(itemCount: 4, itemHeight: 140);
    }

    if (state.error != null && state.myOrders.isEmpty) {
      return ErrorState(
        message: state.error!,
        onRetry: () => ref.read(marketplaceProvider.notifier).loadMyOrders(),
      );
    }

    return RefreshIndicator(
      color: SilkTheme.brand,
      onRefresh: () => ref.read(marketplaceProvider.notifier).refresh(),
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
        children: [
          // Stats row
          _StatsRow(state: state),
          const SizedBox(height: 16),

          // Orders list
          if (state.myOrders.isEmpty)
            const Padding(
              padding: EdgeInsets.only(top: 40),
              child: EmptyState(
                icon: Icons.receipt_long_outlined,
                title: 'Buyurtma yo\'q',
                subtitle:
                    'Siz hali birorta ham buyurtma yaratmagansiz.\nYangi buyurtma yaratish uchun "+" tugmasini bosing.',
              ),
            )
          else
            ...state.myOrders.map(
              (order) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _MyOrderCard(order: order),
              ),
            ),
        ],
      ),
    );
  }
}

class _StatsRow extends StatelessWidget {
  final MarketplaceState state;

  const _StatsRow({required this.state});

  @override
  Widget build(BuildContext context) {
    final numberFormat = NumberFormat('#,###', 'uz');

    return Row(
      children: [
        Expanded(
          child: _StatCard(
            label: 'Jami',
            value: '${state.totalCount}',
            icon: Icons.list_alt,
            color: SilkTheme.brand,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _StatCard(
            label: 'Sotuvda',
            value: '${state.forSaleCount}',
            icon: Icons.storefront,
            color: SilkTheme.accent2,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _StatCard(
            label: 'Yopilgan',
            value: '${state.closedCount}',
            icon: Icons.check_circle_outline,
            color: SilkTheme.success,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _StatCard(
            label: 'Daromad',
            value: state.revenue > 0
                ? numberFormat.format(state.revenue.toInt())
                : '0',
            icon: Icons.account_balance_wallet_outlined,
            color: SilkTheme.brand,
          ),
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      decoration: BoxDecoration(
        color: SilkTheme.surface,
        borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
        border: Border.all(color: SilkTheme.border.withValues(alpha: 0.5)),
      ),
      child: Column(
        children: [
          Icon(icon, size: 20, color: color),
          const SizedBox(height: 6),
          Text(
            value,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: color,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              color: SilkTheme.muted2,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

class _MyOrderCard extends ConsumerWidget {
  final Order order;

  const _MyOrderCard({required this.order});

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

  bool get _isActive =>
      order.status != OrderStatus.completed &&
      order.status != OrderStatus.rejected;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dateFormat = DateFormat('dd.MM HH:mm');

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: SilkTheme.surface,
        borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
        border: Border.all(
          color: SilkTheme.border.withValues(alpha: 0.5),
        ),
        boxShadow: const [SilkTheme.cardShadow],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Route + Status
          Row(
            children: [
              Expanded(
                child: Text(
                  order.route,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: SilkTheme.ink,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
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

          const SizedBox(height: 8),

          // Info chips
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: [
              if (order.price != null && order.price!.isNotEmpty)
                _buildChip(Icons.payments_outlined, order.price!),
              if (order.isForSale)
                _buildChip(Icons.sell_outlined, 'Sotuvda',
                    color: SilkTheme.success),
              if (order.closedAmount != null)
                _buildChip(
                  Icons.check_circle,
                  '${NumberFormat('#,###', 'uz').format(order.closedAmount!.toInt())} so\'m',
                  color: SilkTheme.success,
                ),
              _buildChip(
                order.type == OrderType.driver
                    ? Icons.local_shipping
                    : Icons.inventory_2_outlined,
                order.type.label,
              ),
            ],
          ),

          const SizedBox(height: 10),
          const Divider(height: 1, color: SilkTheme.border),
          const SizedBox(height: 10),

          // Bottom: date + close button
          Row(
            children: [
              const Icon(Icons.access_time, size: 14, color: SilkTheme.muted2),
              const SizedBox(width: 4),
              Text(
                dateFormat.format(order.createdAt),
                style: const TextStyle(fontSize: 12, color: SilkTheme.muted2),
              ),
              const Spacer(),
              if (_isActive)
                SizedBox(
                  height: 32,
                  child: OutlinedButton.icon(
                    onPressed: () => _onClose(context, ref),
                    icon: const Icon(Icons.handshake_outlined, size: 16),
                    label: const Text('Yopish'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: SilkTheme.brand,
                      side: const BorderSide(color: SilkTheme.brand),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 0),
                      textStyle: const TextStyle(
                          fontSize: 13, fontWeight: FontWeight.w600),
                      shape: RoundedRectangleBorder(
                        borderRadius:
                            BorderRadius.circular(SilkTheme.radiusSmall),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _onClose(BuildContext context, WidgetRef ref) async {
    final amountController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(SilkTheme.radiusLarge),
        ),
        title: const Text('Bitimni yopish'),
        content: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${order.route} buyurtmasini qancha summaga yopdingiz?',
                style: const TextStyle(
                  fontSize: 14,
                  color: SilkTheme.muted,
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: amountController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Summa (so\'m)',
                  hintText: 'Masalan: 500000',
                  prefixIcon: Icon(Icons.payments_outlined),
                ),
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Summani kiriting';
                  final num = double.tryParse(v.replaceAll(' ', ''));
                  if (num == null || num <= 0) return 'Noto\'g\'ri summa';
                  return null;
                },
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Bekor qilish'),
          ),
          ElevatedButton(
            onPressed: () {
              if (formKey.currentState?.validate() ?? false) {
                Navigator.pop(ctx, true);
              }
            },
            child: const Text('Yopish'),
          ),
        ],
      ),
    );

    if (confirmed == true && context.mounted) {
      final amount =
          double.parse(amountController.text.replaceAll(' ', ''));
      final success = await ref
          .read(marketplaceProvider.notifier)
          .closeDeal(order.id, amount);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(success
                ? 'Bitim muvaffaqiyatli yopildi'
                : 'Bitimni yopishda xatolik'),
            backgroundColor:
                success ? SilkTheme.success : SilkTheme.danger,
          ),
        );
      }
    }
  }

  Widget _buildChip(IconData icon, String text, {Color? color}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: (color ?? SilkTheme.muted).withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color ?? SilkTheme.muted),
          const SizedBox(width: 4),
          Text(
            text,
            style: TextStyle(
              fontSize: 12,
              color: color ?? SilkTheme.muted,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
