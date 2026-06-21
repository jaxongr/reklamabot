import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../config/routes.dart';
import '../../config/theme.dart';
import '../../core/models/order.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/order_card.dart';
import '../../widgets/loading_indicator.dart';
import 'orders_provider.dart';

class OrdersScreen extends ConsumerStatefulWidget {
  const OrdersScreen({super.key});

  @override
  ConsumerState<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends ConsumerState<OrdersScreen> {
  final _searchController = TextEditingController();
  bool _showSearch = false;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ordersState = ref.watch(ordersProvider);

    return Scaffold(
      appBar: CustomAppBar(
        title: 'Buyurtmalar',
        actions: [
          IconButton(
            icon: Icon(
              _showSearch ? Icons.close : Icons.search,
              color: AppTheme.textSecondary,
            ),
            onPressed: () {
              setState(() {
                _showSearch = !_showSearch;
                if (!_showSearch) {
                  _searchController.clear();
                  ref.read(ordersProvider.notifier).setSearch('');
                }
              });
            },
          ),
          IconButton(
            icon: const Icon(Icons.refresh, color: AppTheme.textSecondary),
            onPressed: () => ref.read(ordersProvider.notifier).loadOrders(),
          ),
          IconButton(
            icon: const Icon(Icons.assignment_turned_in, color: AppTheme.driverPrimary),
            tooltip: 'Qabul qilinganlar',
            onPressed: () => context.go('${AppRoutes.orders}/accepted'),
          ),
          IconButton(
            icon: const Icon(Icons.block, color: AppTheme.errorColor),
            tooltip: 'Bloklangan',
            onPressed: () => context.go('${AppRoutes.orders}/blocked'),
          ),
        ],
        bottom: _showSearch
            ? PreferredSize(
                preferredSize: const Size.fromHeight(56),
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
                  child: TextField(
                    controller: _searchController,
                    onChanged: (v) =>
                        ref.read(ordersProvider.notifier).setSearch(v),
                    decoration: InputDecoration(
                      hintText: 'Qidirish...',
                      prefixIcon:
                          const Icon(Icons.search, color: AppTheme.textHint),
                      filled: true,
                      fillColor: AppTheme.backgroundColor,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 10,
                      ),
                      border: OutlineInputBorder(
                        borderRadius:
                            BorderRadius.circular(AppTheme.radiusMedium),
                        borderSide: BorderSide.none,
                      ),
                    ),
                    autofocus: true,
                  ),
                ),
              )
            : null,
      ),
      backgroundColor: AppTheme.backgroundColor,
      body: RefreshIndicator(
        color: AppTheme.primaryColor,
        onRefresh: () => ref.read(ordersProvider.notifier).loadOrders(),
        child: Column(
          children: [
            // Scope filter (Import/Eksport/Ichki)
            _buildScopeChips(ordersState),
            // Type filter chips
            _buildTypeChips(ordersState),
            // Status filter chips
            _buildFilterChips(ordersState),
            // Orders list
            Expanded(
              child: _buildBody(context, ref, ordersState),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScopeChips(OrdersState state) {
    return SizedBox(
      height: 44,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        children: [
          _buildScopeChip('Barchasi', null, state.filterScope),
          const SizedBox(width: 8),
          _buildScopeChip('Ichki', OrderScope.internal, state.filterScope),
          const SizedBox(width: 8),
          _buildScopeChip('Import', OrderScope.import_, state.filterScope),
          const SizedBox(width: 8),
          _buildScopeChip('Eksport', OrderScope.export_, state.filterScope),
        ],
      ),
    );
  }

  Widget _buildScopeChip(
    String label,
    OrderScope? scope,
    OrderScope? currentFilter,
  ) {
    final isSelected = currentFilter == scope;
    return GestureDetector(
      onTap: () => ref.read(ordersProvider.notifier).setScopeFilter(scope),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF1890FF) : AppTheme.surfaceColor,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? const Color(0xFF1890FF) : AppTheme.dividerColor,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: isSelected ? Colors.white : AppTheme.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildTypeChips(OrdersState state) {
    return SizedBox(
      height: 44,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        children: [
          _buildTypeChip('Barchasi', null, state.filterType),
          const SizedBox(width: 8),
          _buildTypeChip('Yuk', OrderType.cargo, state.filterType),
          const SizedBox(width: 8),
          _buildTypeChip('Haydovchi', OrderType.driver, state.filterType),
        ],
      ),
    );
  }

  Widget _buildTypeChip(
    String label,
    OrderType? type,
    OrderType? currentFilter,
  ) {
    final isSelected = currentFilter == type;
    return GestureDetector(
      onTap: () => ref.read(ordersProvider.notifier).setTypeFilter(type),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.warningColor : AppTheme.surfaceColor,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppTheme.warningColor : AppTheme.dividerColor,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: isSelected ? Colors.white : AppTheme.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildFilterChips(OrdersState state) {
    return SizedBox(
      height: 44,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        children: [
          _buildFilterChip('Barchasi', null, state.filterStatus),
          const SizedBox(width: 8),
          _buildFilterChip('Yangi', OrderStatus.newOrder, state.filterStatus),
          const SizedBox(width: 8),
          _buildFilterChip("Ko'rilgan", OrderStatus.viewed, state.filterStatus),
          const SizedBox(width: 8),
          _buildFilterChip(
              "Bog'lanilgan", OrderStatus.contacted, state.filterStatus),
          const SizedBox(width: 8),
          _buildFilterChip(
              'Bajarilgan', OrderStatus.completed, state.filterStatus),
          const SizedBox(width: 8),
          _buildFilterChip(
              'Rad etilgan', OrderStatus.rejected, state.filterStatus),
        ],
      ),
    );
  }

  Widget _buildFilterChip(
    String label,
    OrderStatus? status,
    OrderStatus? currentFilter,
  ) {
    final isSelected = currentFilter == status;
    return GestureDetector(
      onTap: () => ref.read(ordersProvider.notifier).setFilter(status),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primaryColor : AppTheme.surfaceColor,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppTheme.primaryColor : AppTheme.dividerColor,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: isSelected ? Colors.white : AppTheme.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildBody(
    BuildContext context,
    WidgetRef ref,
    OrdersState state,
  ) {
    if (state.isLoading && state.orders.isEmpty) {
      return const ShimmerLoading(itemCount: 4, itemHeight: 140);
    }

    if (state.error != null && state.orders.isEmpty) {
      return ErrorState(
        message: state.error!,
        onRetry: () => ref.read(ordersProvider.notifier).loadOrders(),
      );
    }

    final filtered = state.filteredOrders;

    if (filtered.isEmpty) {
      if (state.orders.isEmpty) {
        return const EmptyState(
          icon: Icons.list_alt_outlined,
          title: 'Buyurtma topilmadi',
          subtitle: 'Hozircha hech qanday buyurtma yo\'q.',
        );
      }
      return const EmptyState(
        icon: Icons.filter_list_off,
        title: 'Natija topilmadi',
        subtitle: 'Filtr yoki qidiruv bo\'yicha natija yo\'q.',
      );
    }

    return ListView.builder(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
      itemCount: filtered.length + 1,
      itemBuilder: (context, index) {
        if (index == 0) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Text(
              '${state.total} ta buyurtma',
              style: const TextStyle(
                fontSize: 13,
                color: AppTheme.textHint,
              ),
            ),
          );
        }

        final order = filtered[index - 1];
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: OrderCard(
            order: order,
            onTap: () => context.go(AppRoutes.orderDetail(order.id)),
          ),
        );
      },
    );
  }
}
