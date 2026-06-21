import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../config/api_config.dart';
import '../../config/routes.dart';
import '../../config/silk_theme.dart';
import '../../core/api/api_client.dart';

/// Mening e'lonlarim — dispetcher yaratgan e'lonlar ro'yxati
class MyAdsScreen extends ConsumerStatefulWidget {
  const MyAdsScreen({super.key});

  @override
  ConsumerState<MyAdsScreen> createState() => _MyAdsScreenState();
}

class _MyAdsScreenState extends ConsumerState<MyAdsScreen> {
  List<Map<String, dynamic>> _ads = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadAds();
  }

  Future<void> _loadAds() async {
    setState(() => _isLoading = true);
    try {
      final api = ref.read(apiClientProvider);
      final response = await api.get(ApiConfig.ads, queryParameters: {
        'take': '50',
        'skip': '0',
      });
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
        _ads = items.cast<Map<String, dynamic>>();
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _deleteAd(String id) async {
    try {
      final api = ref.read(apiClientProvider);
      await api.delete(ApiConfig.adById(id));
      _loadAds();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("E'lon o'chirildi"), backgroundColor: SilkTheme.success),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Xatolik"), backgroundColor: SilkTheme.danger),
        );
      }
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
        title: const Text("Mening e'lonlarim"),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadAds,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final result = await context.push('/dispatcher/create-ad');
          if (result == true) _loadAds();
        },
        backgroundColor: SilkTheme.brand,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text("Yangi e'lon"),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator(color: SilkTheme.brand, strokeWidth: 2.5))
          : _ads.isEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.campaign_outlined, size: 64, color: SilkTheme.muted2Of(context)),
                      const SizedBox(height: 12),
                      Text(
                        "E'lonlar yo'q",
                        style: TextStyle(fontSize: 16, color: SilkTheme.mutedOf(context)),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        "Yangi e'lon yarating — haydovchilar ko'radi",
                        style: TextStyle(fontSize: 13, color: SilkTheme.muted2Of(context)),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadAds,
                  color: SilkTheme.brand,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: _ads.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final ad = _ads[index];
                      return _AdCard(
                        ad: ad,
                        onDelete: () => _deleteAd(ad['id'] as String),
                        onFindDrivers: () => context.push(
                          AppRoutes.dispatcherMatchDrivers(ad['id'] as String),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}

class _AdCard extends StatelessWidget {
  final Map<String, dynamic> ad;
  final VoidCallback onDelete;
  final VoidCallback onFindDrivers;

  const _AdCard({required this.ad, required this.onDelete, required this.onFindDrivers});

  @override
  Widget build(BuildContext context) {
    final title = ad['title'] as String? ?? '';
    final content = ad['content'] as String? ?? ad['description'] as String? ?? '';
    final from = ad['cargoFrom'] as String? ?? '';
    final to = ad['cargoTo'] as String? ?? '';
    final vehicle = ad['vehicleType'] as String? ?? '';
    final rawPrice = ad['price'];
    final price = rawPrice != null ? _formatPrice(rawPrice) : '';
    final status = ad['status'] as String? ?? 'DRAFT';
    final createdAt = ad['createdAt'] as String?;

    final statusColor = switch (status) {
      'ACTIVE' => SilkTheme.success,
      'PAUSED' => SilkTheme.accent2,
      'CLOSED' => SilkTheme.danger,
      _ => SilkTheme.muted2,
    };
    final statusLabel = switch (status) {
      'ACTIVE' => 'Faol',
      'PAUSED' => 'To\'xtatilgan',
      'CLOSED' => 'Yopilgan',
      'DRAFT' => 'Qoralama',
      _ => status,
    };

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
          // Status + vaqt
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  statusLabel,
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: statusColor),
                ),
              ),
              const Spacer(),
              if (createdAt != null)
                Text(
                  _timeAgo(createdAt),
                  style: TextStyle(fontSize: 11, color: SilkTheme.muted2Of(context)),
                ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: () {
                  showDialog(
                    context: context,
                    builder: (_) => AlertDialog(
                      title: const Text("O'chirish"),
                      content: const Text("Bu e'lonni o'chirishni xohlaysizmi?"),
                      actions: [
                        TextButton(onPressed: () => Navigator.pop(context), child: const Text("Yo'q")),
                        TextButton(
                          onPressed: () { Navigator.pop(context); onDelete(); },
                          child: const Text("Ha", style: TextStyle(color: SilkTheme.danger)),
                        ),
                      ],
                    ),
                  );
                },
                child: Icon(Icons.delete_outline, size: 18, color: SilkTheme.muted2Of(context)),
              ),
            ],
          ),

          const SizedBox(height: 8),

          // Title
          if (title.isNotEmpty)
            Text(
              title,
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: SilkTheme.inkOf(context)),
            ),

          // Marshrut
          if (from.isNotEmpty || to.isNotEmpty) ...[
            const SizedBox(height: 6),
            Row(
              children: [
                Container(width: 8, height: 8, decoration: BoxDecoration(color: SilkTheme.brand, shape: BoxShape.circle)),
                const SizedBox(width: 6),
                Text(
                  '$from → $to',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: SilkTheme.inkOf(context)),
                ),
              ],
            ),
          ],

          // Content
          if (content.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              content,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(fontSize: 13, color: SilkTheme.mutedOf(context)),
            ),
          ],

          // Info
          const SizedBox(height: 8),
          Wrap(
            spacing: 6,
            runSpacing: 4,
            children: [
              if (vehicle.isNotEmpty) _chip(context, Icons.local_shipping_outlined, vehicle),
              if ((ad['cargoWeight'] ?? '').toString().isNotEmpty)
                _chip(context, Icons.scale_outlined, '${ad['cargoWeight']} t'),
              if (price.isNotEmpty) _chip(context, Icons.payments_outlined, price),
            ],
          ),

          // Mos haydovchi topish
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: onFindDrivers,
              icon: const Icon(Icons.person_search, size: 16),
              label: const Text('Mos haydovchi topish'),
              style: OutlinedButton.styleFrom(
                foregroundColor: SilkTheme.brand,
                side: BorderSide(color: SilkTheme.brand.withValues(alpha: 0.45)),
                padding: const EdgeInsets.symmetric(vertical: 8),
                textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ),
        ],
      ),
    );
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

  String _formatPrice(dynamic p) {
    final n = (p is num) ? p.toInt() : int.tryParse(p.toString()) ?? 0;
    if (n <= 0) return '';
    final s = n.toString();
    final buf = StringBuffer();
    for (var i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 == 0) buf.write(' ');
      buf.write(s[i]);
    }
    return '${buf.toString()} so\'m';
  }

  String _timeAgo(String iso) {
    try {
      final d = DateTime.parse(iso);
      final diff = DateTime.now().difference(d);
      if (diff.inMinutes < 1) return 'hozirgina';
      if (diff.inMinutes < 60) return '${diff.inMinutes} daqiqa oldin';
      if (diff.inHours < 24) return '${diff.inHours} soat oldin';
      return '${diff.inDays} kun oldin';
    } catch (_) {
      return '';
    }
  }
}
