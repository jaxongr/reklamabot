import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../config/silk_theme.dart';
import '../../core/api/api_client.dart';

/// Dispetcher app — haydovchilar takliflarini ko'rish
class DriverOffersListScreen extends ConsumerStatefulWidget {
  const DriverOffersListScreen({super.key});

  @override
  ConsumerState<DriverOffersListScreen> createState() => _DriverOffersListScreenState();
}

class _DriverOffersListScreenState extends ConsumerState<DriverOffersListScreen> {
  List<Map<String, dynamic>> _offers = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    try {
      final api = ref.read(apiClientProvider);
      final response = await api.get('/drivers/offers', queryParameters: {'status': 'ACTIVE', 'limit': '50'});
      final data = response.data;
      List<dynamic> items;
      if (data is Map<String, dynamic>) {
        items = (data['data'] as List?) ?? [];
      } else if (data is List) {
        items = data;
      } else {
        items = [];
      }
      setState(() {
        _offers = items.cast<Map<String, dynamic>>();
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Driver offers error: $e');
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SilkTheme.bgOf(context),
      appBar: AppBar(
        backgroundColor: SilkTheme.surfaceOf(context),
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Haydovchi takliflari'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _load),
        ],
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator(color: SilkTheme.brand, strokeWidth: 2.5))
          : _offers.isEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.local_offer_outlined, size: 64, color: SilkTheme.muted2Of(context)),
                      const SizedBox(height: 12),
                      Text("Takliflar yo'q", style: TextStyle(fontSize: 16, color: SilkTheme.mutedOf(context))),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  color: SilkTheme.brand,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: _offers.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) => _OfferCard(offer: _offers[index]),
                  ),
                ),
    );
  }
}

class _OfferCard extends StatelessWidget {
  final Map<String, dynamic> offer;

  const _OfferCard({required this.offer});

  @override
  Widget build(BuildContext context) {
    final from = offer['fromCity'] as String? ?? '';
    final to = offer['toCity'] as String? ?? '';
    final vehicle = offer['vehicleType'] as String? ?? '';
    final capacity = offer['vehicleCapacity'] as String? ?? '';
    final price = offer['price'] as String? ?? '';
    final phone = offer['phone'] as String? ?? '';
    final desc = offer['description'] as String? ?? '';
    final createdAt = offer['createdAt'] as String?;

    // Driver profile info
    final dp = offer['driverProfile'] as Map<String, dynamic>?;
    final driverName = dp?['fullName'] as String? ?? 'Haydovchi';
    final driverVehicle = dp?['vehicleNumber'] as String? ?? '';

    return Container(
      decoration: BoxDecoration(
        color: SilkTheme.surfaceOf(context),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: SilkTheme.borderOf(context)),
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Driver info
          Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: SilkTheme.accent.withValues(alpha: 0.1),
                child: Text(
                  driverName.isNotEmpty ? driverName[0].toUpperCase() : 'H',
                  style: const TextStyle(color: SilkTheme.accent, fontWeight: FontWeight.w700),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(driverName, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: SilkTheme.inkOf(context))),
                    if (driverVehicle.isNotEmpty)
                      Text(driverVehicle, style: TextStyle(fontSize: 12, color: SilkTheme.mutedOf(context))),
                  ],
                ),
              ),
              if (createdAt != null)
                Text(_timeAgo(createdAt), style: TextStyle(fontSize: 11, color: SilkTheme.muted2Of(context))),
            ],
          ),

          const SizedBox(height: 10),

          // Marshrut
          Row(
            children: [
              Container(width: 8, height: 8, decoration: BoxDecoration(color: SilkTheme.brand, shape: BoxShape.circle)),
              const SizedBox(width: 8),
              Expanded(
                child: Text('$from → $to', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: SilkTheme.inkOf(context))),
              ),
            ],
          ),

          if (desc.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(desc, maxLines: 2, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 13, color: SilkTheme.mutedOf(context))),
          ],

          const SizedBox(height: 10),

          // Info + telefon
          Row(
            children: [
              if (vehicle.isNotEmpty) _chip(context, Icons.local_shipping_outlined, vehicle),
              if (capacity.isNotEmpty) ...[const SizedBox(width: 6), _chip(context, Icons.fitness_center, capacity)],
              if (price.isNotEmpty) ...[const SizedBox(width: 6), _chip(context, Icons.payments_outlined, price)],
              const Spacer(),
              if (phone.isNotEmpty)
                GestureDetector(
                  onTap: () => _call(context, phone),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: SilkTheme.accent.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.phone_outlined, size: 14, color: SilkTheme.accent),
                        const SizedBox(width: 4),
                        Text(phone, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: SilkTheme.accent)),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  /// Haydovchi raqamiga qo'ng'iroq qilish
  Future<void> _call(BuildContext context, String phone) async {
    final cleaned = phone.replaceAll(RegExp(r'[^0-9+]'), '');
    if (cleaned.isEmpty) return;
    final uri = Uri(scheme: 'tel', path: cleaned);
    try {
      final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!ok && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Qo\'ng\'iroqni boshlab bo\'lmadi')),
        );
      }
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Qo\'ng\'iroqni boshlab bo\'lmadi')),
        );
      }
    }
  }

  Widget _chip(BuildContext context, IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: SilkTheme.bgOf(context),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: SilkTheme.mutedOf(context)),
          const SizedBox(width: 4),
          Text(text, style: TextStyle(fontSize: 11, color: SilkTheme.mutedOf(context))),
        ],
      ),
    );
  }

  String _timeAgo(String iso) {
    try {
      final d = DateTime.parse(iso);
      final diff = DateTime.now().difference(d);
      if (diff.inMinutes < 1) return 'hozirgina';
      if (diff.inMinutes < 60) return '${diff.inMinutes}d';
      if (diff.inHours < 24) return '${diff.inHours}s';
      return '${diff.inDays}k';
    } catch (_) {
      return '';
    }
  }
}
