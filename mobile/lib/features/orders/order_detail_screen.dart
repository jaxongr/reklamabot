import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../config/strings.dart';
import '../../config/theme.dart';
import '../../core/models/order.dart';
import '../../core/providers/lang_provider.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/loading_indicator.dart';
import 'orders_provider.dart';

class OrderDetailScreen extends ConsumerWidget {
  final String orderId;

  const OrderDetailScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.watch(langProvider);
    final orderAsync = ref.watch(orderDetailProvider(orderId));

    return Scaffold(
      appBar: CustomAppBar(
        title: AppStrings.buyurtmaTafsilotlari,
        showBack: true,
      ),
      backgroundColor: AppTheme.backgroundColor,
      body: orderAsync.when(
        data: (order) {
          if (order == null) {
            return ErrorState(message: AppStrings.buyurtmaTopilmadi);
          }
          return _buildContent(context, ref, order);
        },
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppTheme.primaryColor),
        ),
        error: (e, _) => ErrorState(
          message: e.toString(),
          onRetry: () => ref.invalidate(orderDetailProvider(orderId)),
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context, WidgetRef ref, Order order) {
    final dateFormat = DateFormat('dd.MM.yyyy HH:mm');
    final statusColor = _getStatusColor(order.status);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Status + Type header
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
                    border: Border.all(
                      color: statusColor.withValues(alpha: 0.2),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        _getStatusIcon(order.status),
                        size: 28,
                        color: statusColor,
                      ),
                      const SizedBox(width: 12),
                      Text(
                        order.status.label,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: statusColor,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                decoration: BoxDecoration(
                  color: (order.type == OrderType.driver
                          ? const Color(0xFFFA8C16)
                          : AppTheme.infoColor)
                      .withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
                  border: Border.all(
                    color: (order.type == OrderType.driver
                            ? const Color(0xFFFA8C16)
                            : AppTheme.infoColor)
                        .withValues(alpha: 0.2),
                  ),
                ),
                child: Column(
                  children: [
                    Icon(
                      order.type == OrderType.driver
                          ? Icons.local_shipping
                          : Icons.inventory_2_outlined,
                      size: 24,
                      color: order.type == OrderType.driver
                          ? const Color(0xFFFA8C16)
                          : AppTheme.infoColor,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      order.type.label,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: order.type == OrderType.driver
                            ? const Color(0xFFFA8C16)
                            : AppTheme.infoColor,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 20),

          // Route section
          _buildSection(
            AppStrings.yonalish,
            Icons.route,
            [
              _buildDetailRow(AppStrings.qayerdan, order.cargoFrom ?? '---'),
              _buildDetailRow(AppStrings.qayerga, order.cargoTo ?? '---'),
              if (order.distance != null)
                _buildDetailRow(AppStrings.masofa, '${order.distance} km'),
            ],
          ),

          const SizedBox(height: 16),

          // Cargo / Vehicle section
          _buildSection(
            order.type == OrderType.driver
                ? AppStrings.mashinaMalumotlari
                : AppStrings.yukMalumotlari,
            order.type == OrderType.driver
                ? Icons.directions_car
                : Icons.local_shipping_outlined,
            [
              if (order.vehicleType != null)
                _buildDetailRow(AppStrings.mashinaTuri, order.vehicleType!),
              if (order.vehicleCapacity != null)
                _buildDetailRow(AppStrings.sigimi, order.vehicleCapacity!),
              if (order.cargoType != null)
                _buildDetailRow(AppStrings.yukTuri, order.cargoType!),
              if (order.cargoWeight != null)
                _buildDetailRow(AppStrings.ogirlik, order.cargoWeight!),
              if (order.vehicleType == null &&
                  order.vehicleCapacity == null &&
                  order.cargoType == null &&
                  order.cargoWeight == null)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Text(
                    AppStrings.malumotYoq,
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppTheme.textHint,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ),
            ],
          ),

          const SizedBox(height: 16),

          // Price section
          if (order.price != null && order.price!.isNotEmpty)
            _buildSection(
              AppStrings.narx,
              Icons.payments_outlined,
              [
                _buildDetailRow(AppStrings.summa, order.price!),
              ],
            ),

          if (order.price != null && order.price!.isNotEmpty)
            const SizedBox(height: 16),

          // Contact section
          if (order.phone != null ||
              order.senderName != null ||
              order.senderUsername != null)
            _buildSection(
              AppStrings.aloqa,
              Icons.person_outline,
              [
                if (order.senderName != null)
                  _buildDetailRow(AppStrings.ism, order.senderName!),
                if (order.senderUsername != null)
                  _buildUsernameRow(context, order.senderUsername!),
                if (order.phone != null)
                  _buildPhoneRow(context, order.phone!),
              ],
            ),

          if (order.phone != null ||
              order.senderName != null ||
              order.senderUsername != null)
            const SizedBox(height: 16),

          // Sender statistics
          if (order.senderTodayAds > 0 || order.senderTotalAds > 0)
            _buildSection(
              AppStrings.jonatuvchiStatistikasi,
              Icons.analytics_outlined,
              [
                _buildDetailRow(
                    AppStrings.bugungiElonlar, '${order.senderTodayAds} ta'),
                _buildDetailRow(
                    AppStrings.jamiElonlar, '${order.senderTotalAds} ta'),
                if (order.senderTotalAds > 10)
                  Padding(
                    padding: const EdgeInsets.only(top: 6),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.warningColor.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.verified_user,
                              size: 14, color: AppTheme.warningColor),
                          const SizedBox(width: 4),
                          Text(
                            AppStrings.faolJonatuvchi,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: AppTheme.warningColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),

          if (order.senderTodayAds > 0 || order.senderTotalAds > 0)
            const SizedBox(height: 16),

          // Group section
          _buildSection(
            AppStrings.guruh,
            Icons.group_outlined,
            [
              _buildDetailRow(AppStrings.nomi, order.groupTitle),
            ],
          ),

          const SizedBox(height: 16),

          // Message text
          _buildSection(
            AppStrings.xabarMatni,
            Icons.message_outlined,
            [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.backgroundColor,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: SelectableText(
                  order.messageText,
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppTheme.textPrimary,
                    height: 1.5,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Dates section
          _buildSection(
            AppStrings.sanalar,
            Icons.calendar_today_outlined,
            [
              if (order.messageDate != null)
                _buildDetailRow(
                  AppStrings.xabarSanasi,
                  dateFormat.format(order.messageDate!),
                ),
              _buildDetailRow(
                AppStrings.yaratilgan,
                dateFormat.format(order.createdAt),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Action buttons
          _buildActions(context, ref, order),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildActions(BuildContext context, WidgetRef ref, Order order) {
    return Column(
      children: [
        // Phone call button
        if (order.phone != null)
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () async {
                final uri = Uri.parse('tel:${order.phone}');
                if (await canLaunchUrl(uri)) {
                  await launchUrl(uri);
                }
              },
              icon: const Icon(Icons.phone, size: 18),
              label: Text(AppStrings.qongiroqQilish(order.phone!)),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.successColor,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                ),
              ),
            ),
          ),

        if (order.phone != null) const SizedBox(height: 12),

        // Status action buttons
        Row(
          children: [
            if (order.status != OrderStatus.completed)
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    _showConfirmDialog(
                      context,
                      AppStrings.buyurtmaniBarjarilganDebBelgilash,
                      () {
                        ref
                            .read(ordersProvider.notifier)
                            .updateStatus(order.id, OrderStatus.completed);
                        Navigator.of(context).pop();
                      },
                    );
                  },
                  icon: const Icon(Icons.check, size: 18),
                  label: Text(AppStrings.bajarildi),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.successColor.withValues(alpha: 0.15),
                    foregroundColor: AppTheme.successColor,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius:
                          BorderRadius.circular(AppTheme.radiusMedium),
                    ),
                  ),
                ),
              ),
            if (order.status != OrderStatus.completed &&
                order.status != OrderStatus.contacted)
              const SizedBox(width: 12),
            if (order.status != OrderStatus.contacted &&
                order.status != OrderStatus.completed)
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    ref
                        .read(ordersProvider.notifier)
                        .updateStatus(order.id, OrderStatus.contacted);
                    Navigator.of(context).pop();
                  },
                  icon: const Icon(Icons.phone_in_talk, size: 18),
                  label: Text(AppStrings.boglandim),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF722ED1).withValues(alpha: 0.15),
                    foregroundColor: const Color(0xFF722ED1),
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius:
                          BorderRadius.circular(AppTheme.radiusMedium),
                    ),
                  ),
                ),
              ),
          ],
        ),

        if (order.status != OrderStatus.rejected) const SizedBox(height: 12),

        if (order.status != OrderStatus.rejected)
          SizedBox(
            width: double.infinity,
            child: TextButton.icon(
              onPressed: () {
                _showConfirmDialog(
                  context,
                  AppStrings.buyurtmaniRadEtish,
                  () {
                    ref
                        .read(ordersProvider.notifier)
                        .updateStatus(order.id, OrderStatus.rejected);
                    Navigator.of(context).pop();
                  },
                );
              },
              icon: const Icon(Icons.close, size: 16),
              label: Text(AppStrings.radEtish),
              style: TextButton.styleFrom(
                foregroundColor: AppTheme.errorColor,
              ),
            ),
          ),

        const SizedBox(height: 16),
        const Divider(),
        const SizedBox(height: 8),

        // Block sender button
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: () {
              _showConfirmDialog(
                context,
                AppStrings.bloklaysizmi(order.senderName ?? order.phone ?? 'Sender'),
                () async {
                  final success = await ref
                      .read(ordersProvider.notifier)
                      .blockSender(order);
                  if (success) {
                    // Orderni ham reject qilish
                    await ref
                        .read(ordersProvider.notifier)
                        .updateStatus(order.id, OrderStatus.rejected);
                  }
                  if (context.mounted) {
                    Navigator.of(context).pop();
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(success
                            ? AppStrings.senderBloklandi
                            : AppStrings.bloklashdaXatolik),
                        backgroundColor:
                            success ? AppTheme.successColor : AppTheme.errorColor,
                      ),
                    );
                  }
                },
              );
            },
            icon: const Icon(Icons.block, size: 18),
            label: Text(AppStrings.senderniBloklash),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.errorColor,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
              ),
            ),
          ),
        ),
      ],
    );
  }

  void _showConfirmDialog(
      BuildContext context, String message, VoidCallback onConfirm) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(AppStrings.tasdiqlash),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text(AppStrings.bekorQilish),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              onConfirm();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryColor,
              foregroundColor: Colors.white,
            ),
            child: Text(AppStrings.ha),
          ),
        ],
      ),
    );
  }

  Widget _buildUsernameRow(BuildContext context, String username) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 110,
            child: Text(
              AppStrings.username,
              style: const TextStyle(
                fontSize: 14,
                color: AppTheme.textSecondary,
              ),
            ),
          ),
          Expanded(
            child: GestureDetector(
              onTap: () async {
                final uri = Uri.parse('https://t.me/$username');
                if (await canLaunchUrl(uri)) {
                  await launchUrl(uri, mode: LaunchMode.externalApplication);
                }
              },
              child: Text(
                '@$username',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: AppTheme.infoColor,
                  decoration: TextDecoration.underline,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPhoneRow(BuildContext context, String phone) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 110,
            child: Text(
              AppStrings.telefon,
              style: const TextStyle(
                fontSize: 14,
                color: AppTheme.textSecondary,
              ),
            ),
          ),
          Expanded(
            child: GestureDetector(
              onTap: () {
                Clipboard.setData(ClipboardData(text: phone));
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(AppStrings.telefonNusxalandi),
                    duration: const Duration(seconds: 1),
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              },
              child: Row(
                children: [
                  Text(
                    phone,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: AppTheme.primaryColor,
                    ),
                  ),
                  const SizedBox(width: 6),
                  const Icon(Icons.copy, size: 14, color: AppTheme.textHint),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSection(String title, IconData icon, List<Widget> children) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.cardColor,
        borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
        border: Border.all(
          color: AppTheme.dividerColor.withValues(alpha: 0.5),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 18, color: AppTheme.primaryColor),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...children,
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 110,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 14,
                color: AppTheme.textSecondary,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: AppTheme.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(OrderStatus status) {
    switch (status) {
      case OrderStatus.newOrder:
        return AppTheme.infoColor;
      case OrderStatus.viewed:
        return const Color(0xFFFA8C16);
      case OrderStatus.contacted:
        return const Color(0xFF722ED1);
      case OrderStatus.completed:
        return AppTheme.successColor;
      case OrderStatus.rejected:
        return AppTheme.errorColor;
    }
  }

  IconData _getStatusIcon(OrderStatus status) {
    switch (status) {
      case OrderStatus.newOrder:
        return Icons.fiber_new;
      case OrderStatus.viewed:
        return Icons.visibility;
      case OrderStatus.contacted:
        return Icons.phone_in_talk;
      case OrderStatus.completed:
        return Icons.check_circle;
      case OrderStatus.rejected:
        return Icons.cancel;
    }
  }
}
