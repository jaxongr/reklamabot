import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../config/theme.dart';
import '../driver_provider.dart';

class DriverOffersScreen extends ConsumerStatefulWidget {
  const DriverOffersScreen({super.key});

  @override
  ConsumerState<DriverOffersScreen> createState() => _DriverOffersScreenState();
}

class _DriverOffersScreenState extends ConsumerState<DriverOffersScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(driverOffersProvider.notifier).loadMyOffers());
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(driverOffersProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FC),
      appBar: AppBar(
        title: const Text('Takliflarim'),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1A1A2E),
        elevation: 0,
        scrolledUnderElevation: 0.5,
        surfaceTintColor: Colors.transparent,
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.go('/driver/offers/create'),
        backgroundColor: const Color(0xFF4CAF50),
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Yangi taklif'),
      ),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : state.myOffers.isEmpty
              ? const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.local_offer_outlined, size: 48, color: Colors.grey),
                      SizedBox(height: 12),
                      Text('Takliflar yo\'q', style: TextStyle(color: Colors.grey)),
                      SizedBox(height: 4),
                      Text(
                        'Haydovchi sifatida taklif yarating',
                        style: TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: () => ref.read(driverOffersProvider.notifier).loadMyOffers(),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: state.myOffers.length,
                    itemBuilder: (context, index) {
                      final offer = state.myOffers[index];
                      final isActive = offer.status == 'ACTIVE';
                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0.5,
                        child: Padding(
                          padding: const EdgeInsets.all(14),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      '${offer.fromCity} → ${offer.toCity}',
                                      style: const TextStyle(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: isActive
                                          ? const Color(0xFF4CAF50).withValues(alpha: 0.1)
                                          : Colors.grey.withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      isActive ? 'Faol' : offer.status,
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w500,
                                        color: isActive ? const Color(0xFF4CAF50) : Colors.grey,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Wrap(
                                spacing: 12,
                                children: [
                                  Text('${offer.vehicleType}', style: const TextStyle(fontSize: 13)),
                                  if (offer.vehicleCapacity != null)
                                    Text(offer.vehicleCapacity!, style: const TextStyle(fontSize: 13, color: Colors.grey)),
                                  if (offer.price != null)
                                    Text(offer.price!, style: const TextStyle(fontSize: 13, color: Color(0xFF4CAF50))),
                                ],
                              ),
                              if (offer.description != null) ...[
                                const SizedBox(height: 4),
                                Text(
                                  offer.description!,
                                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                              if (isActive) ...[
                                const SizedBox(height: 8),
                                Align(
                                  alignment: Alignment.centerRight,
                                  child: TextButton.icon(
                                    onPressed: () {
                                      ref.read(driverOffersProvider.notifier).cancelOffer(offer.id);
                                    },
                                    icon: const Icon(Icons.cancel_outlined, size: 16),
                                    label: const Text('Bekor qilish'),
                                    style: TextButton.styleFrom(foregroundColor: Colors.red),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
