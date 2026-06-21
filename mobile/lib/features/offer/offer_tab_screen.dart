import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../config/silk_theme.dart';
import '../../core/models/driver_profile.dart';
import '../driver/driver_provider.dart';

class OfferTabScreen extends ConsumerStatefulWidget {
  const OfferTabScreen({super.key});

  @override
  ConsumerState<OfferTabScreen> createState() => _OfferTabScreenState();
}

class _OfferTabScreenState extends ConsumerState<OfferTabScreen> {
  final _fromController = TextEditingController();
  final _toController = TextEditingController();
  final _priceController = TextEditingController();
  final _descController = TextEditingController();
  bool _creating = false;

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(driverOffersProvider.notifier).loadMyOffers();
      ref.read(driverProfileProvider.notifier).loadProfile();
    });
  }

  @override
  void dispose() {
    _fromController.dispose();
    _toController.dispose();
    _priceController.dispose();
    _descController.dispose();
    super.dispose();
  }

  Future<void> _onRefresh() async {
    await ref.read(driverOffersProvider.notifier).loadMyOffers();
  }

  Future<void> _createOffer() async {
    final from = _fromController.text.trim();
    final to = _toController.text.trim();
    if (from.isEmpty || to.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text("Qayerdan va Qayerga to'ldiring"),
          backgroundColor: SilkTheme.accent2,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
      return;
    }

    final profile = ref.read(driverProfileProvider).profile;

    setState(() => _creating = true);
    final data = <String, dynamic>{
      'fromCity': from,
      'toCity': to,
      if (_priceController.text.trim().isNotEmpty) 'price': _priceController.text.trim(),
      if (_descController.text.trim().isNotEmpty) 'description': _descController.text.trim(),
      if (profile?.vehicleType != null) 'vehicleType': profile!.vehicleType,
      if (profile?.vehicleCapacity != null) 'vehicleCapacity': profile!.vehicleCapacity,
      if (profile?.phone != null) 'phone': profile!.phone,
    };

    final success = await ref.read(driverOffersProvider.notifier).createOffer(data);
    if (!mounted) return;
    setState(() => _creating = false);

    if (success) {
      _fromController.clear();
      _toController.clear();
      _priceController.clear();
      _descController.clear();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Taklif yaratildi!'),
          backgroundColor: SilkTheme.success,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Taklif yaratishda xatolik'),
          backgroundColor: SilkTheme.danger,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final offersState = ref.watch(driverOffersProvider);
    final profileState = ref.watch(driverProfileProvider);

    return Scaffold(
      backgroundColor: SilkTheme.bgOf(context),
      appBar: AppBar(
        title: const Text('Takliflar'),
        backgroundColor: SilkTheme.surfaceOf(context),
        foregroundColor: SilkTheme.inkOf(context),
        elevation: 0,
        scrolledUnderElevation: 0,
        surfaceTintColor: Colors.transparent,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _onRefresh,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _onRefresh,
        color: SilkTheme.brand,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Create offer card
            _buildCreateCard(profileState.profile),
            const SizedBox(height: 24),

            // My offers header
            Row(
              children: [
                Text(
                  'Mening takliflarim',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: SilkTheme.inkOf(context),
                  ),
                ),
                const Spacer(),
                Text(
                  '${offersState.myOffers.length} ta',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: SilkTheme.mutedOf(context),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Offers list
            if (offersState.isLoading && offersState.myOffers.isEmpty)
              const Padding(
                padding: EdgeInsets.only(top: 40),
                child: Center(
                  child: CircularProgressIndicator(color: SilkTheme.brand),
                ),
              )
            else if (offersState.myOffers.isEmpty)
              _buildEmptyOffers()
            else
              ...offersState.myOffers.map((offer) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: _OfferCard(
                      offer: offer,
                      onCancel: () => _confirmCancel(offer),
                    ),
                  )),
          ],
        ),
      ),
    );
  }

  Widget _buildCreateCard(DriverProfile? profile) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: SilkTheme.surfaceOf(context),
        border: Border.all(color: SilkTheme.borderOf(context)),
        borderRadius: BorderRadius.circular(SilkTheme.radiusLarge),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.local_offer, color: SilkTheme.brand, size: 20),
              const SizedBox(width: 8),
              Text(
                'Taklif ochish',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: SilkTheme.inkOf(context),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // From / To fields
          Row(
            children: [
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: SilkTheme.brand,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: SilkTheme.brand.withValues(alpha: 0.3),
                    width: 2,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: TextField(
                  controller: _fromController,
                  decoration: const InputDecoration(
                    hintText: 'Qayerdan',
                    contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    isDense: true,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: SilkTheme.accent,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: SilkTheme.accent.withValues(alpha: 0.3),
                    width: 2,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: TextField(
                  controller: _toController,
                  decoration: const InputDecoration(
                    hintText: 'Qayerga',
                    contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    isDense: true,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Price + Note
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _priceController,
                  keyboardType: TextInputType.text,
                  decoration: const InputDecoration(
                    hintText: 'Narx (ixtiyoriy)',
                    contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    isDense: true,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: TextField(
                  controller: _descController,
                  decoration: const InputDecoration(
                    hintText: 'Izoh (ixtiyoriy)',
                    contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    isDense: true,
                  ),
                ),
              ),
            ],
          ),

          // Profile auto-fill info
          if (profile != null) ...[
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 6,
              children: [
                if (profile.vehicleType != null)
                  _AutoChip(icon: Icons.local_shipping, label: profile.vehicleType!),
                if (profile.vehicleCapacity != null)
                  _AutoChip(icon: Icons.scale, label: profile.vehicleCapacity!),
                if (profile.phone != null)
                  _AutoChip(icon: Icons.phone, label: profile.phone!),
              ],
            ),
          ],

          const SizedBox(height: 16),

          // Create button
          SizedBox(
            width: double.infinity,
            height: 46,
            child: ElevatedButton(
              onPressed: _creating ? null : _createOffer,
              child: _creating
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        valueColor: AlwaysStoppedAnimation(Colors.white),
                      ),
                    )
                  : const Text(
                      'Taklif yaratish',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyOffers() {
    return SizedBox(
      height: 160,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: SilkTheme.bgOf(context),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(Icons.local_offer_outlined,
                  color: SilkTheme.mutedOf(context), size: 28),
            ),
            const SizedBox(height: 10),
            Text(
              'Hali taklif yo\'q',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: SilkTheme.inkOf(context),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              "Yuqoridagi formadan taklif yarating",
              style: TextStyle(fontSize: 12, color: SilkTheme.mutedOf(context)),
            ),
          ],
        ),
      ),
    );
  }

  void _confirmCancel(DriverOffer offer) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Taklifni bekor qilish'),
        content: Text('${offer.fromCity} → ${offer.toCity} taklifini bekor qilasizmi?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text("Yo'q"),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              ref.read(driverOffersProvider.notifier).cancelOffer(offer.id);
            },
            style: TextButton.styleFrom(foregroundColor: SilkTheme.danger),
            child: const Text('Bekor qilish'),
          ),
        ],
      ),
    );
  }
}

class _AutoChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _AutoChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: SilkTheme.brand.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: SilkTheme.brand),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: SilkTheme.brand.withValues(alpha: 0.8),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Offer Card ──
class _OfferCard extends StatelessWidget {
  final DriverOffer offer;
  final VoidCallback onCancel;

  const _OfferCard({required this.offer, required this.onCancel});

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('dd MMM, HH:mm');
    final isPending = offer.status == 'ACTIVE' || offer.status == 'PENDING';

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: SilkTheme.surfaceOf(context),
        border: Border.all(color: SilkTheme.borderOf(context)),
        borderRadius: BorderRadius.circular(SilkTheme.radiusLarge),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Route row
          Row(
            children: [
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: SilkTheme.brand,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: SilkTheme.brand.withValues(alpha: 0.3),
                    width: 2,
                  ),
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  offer.fromCity,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: SilkTheme.inkOf(context),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: Icon(Icons.arrow_forward, size: 16, color: SilkTheme.mutedOf(context)),
              ),
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: SilkTheme.accent,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: SilkTheme.accent.withValues(alpha: 0.3),
                    width: 2,
                  ),
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  offer.toCity,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: SilkTheme.inkOf(context),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Info row
          Row(
            children: [
              if (offer.vehicleType.isNotEmpty) ...[
                Icon(Icons.local_shipping_outlined,
                    size: 13, color: SilkTheme.muted2Of(context)),
                const SizedBox(width: 4),
                Text(
                  offer.vehicleType,
                  style: TextStyle(
                    fontSize: 11,
                    color: SilkTheme.mutedOf(context),
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(width: 12),
              ],
              Icon(Icons.schedule_rounded,
                  size: 13, color: SilkTheme.muted2Of(context)),
              const SizedBox(width: 4),
              Text(
                dateFormat.format(offer.createdAt),
                style: TextStyle(
                  fontSize: 11,
                  color: SilkTheme.mutedOf(context),
                  fontWeight: FontWeight.w500,
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: isPending
                      ? SilkTheme.success.withValues(alpha: 0.1)
                      : SilkTheme.muted2Of(context).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  isPending ? 'Faol' : offer.status,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: isPending ? SilkTheme.success : SilkTheme.mutedOf(context),
                  ),
                ),
              ),
            ],
          ),

          // Price + cancel
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.only(top: 10),
            decoration: BoxDecoration(
              border: Border(
                top: BorderSide(color: SilkTheme.borderOf(context), width: 1),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    offer.price ?? 'Kelishiladi',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: SilkTheme.inkOf(context),
                    ),
                  ),
                ),
                if (isPending)
                  Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: onCancel,
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: SilkTheme.danger.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          'Bekor qilish',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: SilkTheme.danger,
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
