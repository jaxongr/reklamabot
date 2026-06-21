import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../config/silk_theme.dart';
import '../../core/models/order.dart';
import '../../widgets/custom_app_bar.dart';
import 'marketplace_provider.dart';

class CreateOrderScreen extends ConsumerStatefulWidget {
  const CreateOrderScreen({super.key});

  @override
  ConsumerState<CreateOrderScreen> createState() => _CreateOrderScreenState();
}

class _CreateOrderScreenState extends ConsumerState<CreateOrderScreen> {
  final _formKey = GlobalKey<FormState>();
  final _fromController = TextEditingController();
  final _toController = TextEditingController();
  final _vehicleTypeController = TextEditingController();
  final _cargoWeightController = TextEditingController();
  final _phoneController = TextEditingController(text: '+998');
  final _priceController = TextEditingController();
  final _salePriceController = TextEditingController();
  final _messageController = TextEditingController();

  OrderType _selectedType = OrderType.cargo;
  OrderScope _selectedScope = OrderScope.internal;
  bool _isForSale = false;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _fromController.dispose();
    _toController.dispose();
    _vehicleTypeController.dispose();
    _cargoWeightController.dispose();
    _phoneController.dispose();
    _priceController.dispose();
    _salePriceController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Watch price estimate when from/to are both filled
    final fromText = _fromController.text.trim();
    final toText = _toController.text.trim();
    final priceEstimate = (fromText.isNotEmpty && toText.isNotEmpty)
        ? ref.watch(priceEstimateProvider(
            (from: fromText, to: toText)))
        : null;

    return Scaffold(
      appBar: const CustomAppBar(
        title: 'Buyurtma yaratish',
        showBack: true,
      ),
      backgroundColor: SilkTheme.bg,
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Type selector
            _buildSectionLabel('Turi'),
            const SizedBox(height: 8),
            SegmentedButton<OrderType>(
              segments: const [
                ButtonSegment(
                  value: OrderType.cargo,
                  label: Text('Yuk'),
                  icon: Icon(Icons.inventory_2_outlined),
                ),
                ButtonSegment(
                  value: OrderType.driver,
                  label: Text('Haydovchi'),
                  icon: Icon(Icons.local_shipping),
                ),
              ],
              selected: {_selectedType},
              onSelectionChanged: (v) {
                setState(() => _selectedType = v.first);
              },
              style: ButtonStyle(
                shape: WidgetStatePropertyAll(
                  RoundedRectangleBorder(
                    borderRadius:
                        BorderRadius.circular(SilkTheme.radiusMedium),
                  ),
                ),
              ),
            ),

            const SizedBox(height: 20),

            // Scope selector
            _buildSectionLabel('Yo\'nalish turi'),
            const SizedBox(height: 8),
            SegmentedButton<OrderScope>(
              segments: const [
                ButtonSegment(
                  value: OrderScope.internal,
                  label: Text('Ichki'),
                ),
                ButtonSegment(
                  value: OrderScope.import_,
                  label: Text('Import'),
                ),
                ButtonSegment(
                  value: OrderScope.export_,
                  label: Text('Eksport'),
                ),
              ],
              selected: {_selectedScope},
              onSelectionChanged: (v) {
                setState(() => _selectedScope = v.first);
              },
              style: ButtonStyle(
                shape: WidgetStatePropertyAll(
                  RoundedRectangleBorder(
                    borderRadius:
                        BorderRadius.circular(SilkTheme.radiusMedium),
                  ),
                ),
              ),
            ),

            const SizedBox(height: 20),

            // From city
            _buildSectionLabel('Qayerdan'),
            const SizedBox(height: 8),
            TextFormField(
              controller: _fromController,
              decoration: const InputDecoration(
                hintText: 'Masalan: Toshkent',
                prefixIcon: Icon(Icons.location_on_outlined),
              ),
              textCapitalization: TextCapitalization.words,
              onChanged: (_) => setState(() {}),
            ),

            const SizedBox(height: 16),

            // To city
            _buildSectionLabel('Qayerga'),
            const SizedBox(height: 8),
            TextFormField(
              controller: _toController,
              decoration: const InputDecoration(
                hintText: 'Masalan: Samarqand',
                prefixIcon: Icon(Icons.flag_outlined),
              ),
              textCapitalization: TextCapitalization.words,
              onChanged: (_) => setState(() {}),
            ),

            // Price estimate card
            if (priceEstimate != null)
              priceEstimate.when(
                data: (data) {
                  if (data == null) return const SizedBox.shrink();
                  return _buildPriceEstimateCard(data);
                },
                loading: () => Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: SilkTheme.brand.withValues(alpha: 0.05),
                      borderRadius:
                          BorderRadius.circular(SilkTheme.radiusMedium),
                      border: Border.all(
                        color: SilkTheme.brand.withValues(alpha: 0.2),
                      ),
                    ),
                    child: const Row(
                      children: [
                        SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                        SizedBox(width: 12),
                        Text(
                          'Narx tahlili yuklanmoqda...',
                          style: TextStyle(
                            fontSize: 13,
                            color: SilkTheme.muted,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                error: (_, __) => const SizedBox.shrink(),
              ),

            const SizedBox(height: 16),

            // Vehicle type
            _buildSectionLabel('Transport turi'),
            const SizedBox(height: 8),
            TextFormField(
              controller: _vehicleTypeController,
              decoration: const InputDecoration(
                hintText: 'Masalan: Fura, Kamaz, Damas',
                prefixIcon: Icon(Icons.directions_car_outlined),
              ),
              textCapitalization: TextCapitalization.words,
            ),

            const SizedBox(height: 16),

            // Cargo weight
            _buildSectionLabel('Yuk og\'irligi'),
            const SizedBox(height: 8),
            TextFormField(
              controller: _cargoWeightController,
              decoration: const InputDecoration(
                hintText: 'Masalan: 20 tonna',
                prefixIcon: Icon(Icons.scale_outlined),
              ),
            ),

            const SizedBox(height: 16),

            // Phone
            _buildSectionLabel('Telefon raqam'),
            const SizedBox(height: 8),
            TextFormField(
              controller: _phoneController,
              decoration: const InputDecoration(
                hintText: '+998901234567',
                prefixIcon: Icon(Icons.phone_outlined),
              ),
              keyboardType: TextInputType.phone,
              validator: (v) {
                if (v == null || v.trim().isEmpty) {
                  return 'Telefon raqamni kiriting';
                }
                final cleaned = v.replaceAll(RegExp(r'[\s\-\(\)]'), '');
                if (!RegExp(r'^\+998\d{9}$').hasMatch(cleaned)) {
                  return 'Noto\'g\'ri format. Masalan: +998901234567';
                }
                return null;
              },
            ),

            const SizedBox(height: 16),

            // Price
            _buildSectionLabel('Narx'),
            const SizedBox(height: 8),
            TextFormField(
              controller: _priceController,
              decoration: const InputDecoration(
                hintText: 'Masalan: 5000000',
                prefixIcon: Icon(Icons.payments_outlined),
                suffixText: 'so\'m',
              ),
              keyboardType: TextInputType.number,
            ),

            const SizedBox(height: 16),

            // Sale price
            _buildSectionLabel('Sotish narxi (ixtiyoriy)'),
            const SizedBox(height: 8),
            TextFormField(
              controller: _salePriceController,
              decoration: const InputDecoration(
                hintText: 'Sotish narxini kiriting',
                prefixIcon: Icon(Icons.sell_outlined),
                suffixText: 'so\'m',
              ),
              keyboardType: TextInputType.number,
            ),

            const SizedBox(height: 20),

            // For sale toggle
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: SilkTheme.surface,
                borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
                border: Border.all(
                  color: SilkTheme.border.withValues(alpha: 0.5),
                ),
              ),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: _isForSale
                          ? SilkTheme.success.withValues(alpha: 0.1)
                          : SilkTheme.bg,
                      borderRadius:
                          BorderRadius.circular(SilkTheme.radiusSmall),
                    ),
                    child: Icon(
                      Icons.storefront,
                      color: _isForSale
                          ? SilkTheme.success
                          : SilkTheme.muted2,
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Sotuvga qo\'yish',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w500,
                            color: SilkTheme.ink,
                          ),
                        ),
                        Text(
                          'Boshqa foydalanuvchilar ko\'radi',
                          style: TextStyle(
                            fontSize: 12,
                            color: SilkTheme.muted2,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Switch(
                    value: _isForSale,
                    onChanged: (v) => setState(() => _isForSale = v),
                    activeColor: SilkTheme.success,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Message text
            _buildSectionLabel('Xabar matni'),
            const SizedBox(height: 8),
            TextFormField(
              controller: _messageController,
              decoration: const InputDecoration(
                hintText: 'Buyurtma haqida batafsil yozing...',
                alignLabelWithHint: true,
              ),
              maxLines: 5,
              minLines: 3,
              textCapitalization: TextCapitalization.sentences,
              validator: (v) {
                if (v == null || v.trim().isEmpty) {
                  return 'Xabar matnini kiriting';
                }
                if (v.trim().length < 10) {
                  return 'Kamida 10 ta belgi kiriting';
                }
                return null;
              },
            ),

            const SizedBox(height: 32),

            // Submit button
            SizedBox(
              height: 50,
              child: ElevatedButton.icon(
                onPressed: _isSubmitting ? null : _onSubmit,
                icon: _isSubmitting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.add_circle_outline),
                label: Text(
                    _isSubmitting ? 'Yaratilmoqda...' : 'Buyurtma yaratish'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: SilkTheme.brand,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius:
                        BorderRadius.circular(SilkTheme.radiusMedium),
                  ),
                  textStyle: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionLabel(String text) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: SilkTheme.ink,
      ),
    );
  }

  Widget _buildPriceEstimateCard(Map<String, dynamic> data) {
    final numberFormat = NumberFormat('#,###', 'uz');
    final avgPrice = data['avgPrice'] as num?;
    final minPrice = data['minPrice'] as num?;
    final maxPrice = data['maxPrice'] as num?;
    final count = data['count'] as int?;

    if (avgPrice == null) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: SilkTheme.brand.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
          border: Border.all(
            color: SilkTheme.brand.withValues(alpha: 0.2),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.analytics_outlined,
                    size: 18, color: SilkTheme.brand),
                const SizedBox(width: 8),
                const Text(
                  'Narx tahlili',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: SilkTheme.brand,
                  ),
                ),
                const Spacer(),
                if (count != null)
                  Text(
                    '$count ta buyurtma asosida',
                    style: const TextStyle(
                      fontSize: 11,
                      color: SilkTheme.muted2,
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildEstimateItem(
                  'Min',
                  minPrice != null
                      ? '${numberFormat.format(minPrice.toInt())} so\'m'
                      : '---',
                ),
                Container(
                  width: 1,
                  height: 30,
                  color: SilkTheme.border,
                ),
                _buildEstimateItem(
                  'O\'rtacha',
                  '${numberFormat.format(avgPrice.toInt())} so\'m',
                  isBold: true,
                ),
                Container(
                  width: 1,
                  height: 30,
                  color: SilkTheme.border,
                ),
                _buildEstimateItem(
                  'Max',
                  maxPrice != null
                      ? '${numberFormat.format(maxPrice.toInt())} so\'m'
                      : '---',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEstimateItem(String label, String value,
      {bool isBold = false}) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            color: SilkTheme.muted2,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            fontSize: 13,
            fontWeight: isBold ? FontWeight.w700 : FontWeight.w500,
            color:
                isBold ? SilkTheme.brand : SilkTheme.ink,
          ),
        ),
      ],
    );
  }

  Future<void> _onSubmit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;

    setState(() => _isSubmitting = true);

    final data = <String, dynamic>{
      'type': _selectedType.value,
      'scope': _selectedScope.value,
      'cargoFrom': _fromController.text.trim(),
      'cargoTo': _toController.text.trim(),
      'phone': _phoneController.text.trim(),
      'messageText': _messageController.text.trim(),
      'isManual': true,
      'isForSale': _isForSale,
      'groupTitle': 'Mobile',
    };

    final vehicleType = _vehicleTypeController.text.trim();
    if (vehicleType.isNotEmpty) data['vehicleType'] = vehicleType;

    final cargoWeight = _cargoWeightController.text.trim();
    if (cargoWeight.isNotEmpty) data['cargoWeight'] = cargoWeight;

    final price = _priceController.text.trim();
    if (price.isNotEmpty) data['price'] = price;

    final salePrice = _salePriceController.text.trim();
    if (salePrice.isNotEmpty) data['salePrice'] = salePrice;

    final success =
        await ref.read(marketplaceProvider.notifier).createOrder(data);

    setState(() => _isSubmitting = false);

    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Buyurtma muvaffaqiyatli yaratildi'),
            backgroundColor: SilkTheme.success,
          ),
        );
        Navigator.pop(context);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Buyurtma yaratishda xatolik yuz berdi'),
            backgroundColor: SilkTheme.danger,
          ),
        );
      }
    }
  }
}
