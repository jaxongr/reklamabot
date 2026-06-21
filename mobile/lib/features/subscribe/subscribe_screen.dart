import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';

import '../../config/api_config.dart';
import '../../config/silk_theme.dart';
import '../../core/api/api_client.dart';
import '../../widgets/custom_app_bar.dart';
import '../auth/auth_provider.dart';
import '../driver/driver_provider.dart';

/// Subscription plans screen — loads plans from API and allows purchase.
/// Haydovchi va dispetcher uchun alohida API ishlatadi.
class SubscribeScreen extends ConsumerStatefulWidget {
  const SubscribeScreen({super.key});

  @override
  ConsumerState<SubscribeScreen> createState() => _SubscribeScreenState();
}

class _SubscribeScreenState extends ConsumerState<SubscribeScreen> {
  List<Map<String, dynamic>> _plans = [];
  Map<String, dynamic>? _mySubscription;
  bool _isLoading = true;
  String? _error;

  bool get _isDriver {
    final authState = ref.read(authStateProvider);
    return authState.user?.role.value == 'DRIVER';
  }

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final api = ref.read(apiClientProvider);

      if (_isDriver) {
        // Haydovchi — driver API
        final results = await Future.wait([
          api.get(ApiConfig.driverSubscriptionPlans),
          api.get(ApiConfig.driverSubscriptionMy),
        ]);

        final plansData = results[0].data;
        final mySubData = results[1].data;

        List<Map<String, dynamic>> plans = [];
        if (plansData is List) {
          plans = plansData
              .map((e) => e is Map<String, dynamic> ? e : <String, dynamic>{})
              .where((e) => e.isNotEmpty)
              .toList();
        }

        setState(() {
          _plans = plans;
          _mySubscription = mySubData is Map<String, dynamic> ? mySubData : null;
          _isLoading = false;
        });
      } else {
        // Dispetcher — eski API
        final results = await Future.wait([
          api.get('${ApiConfig.subscriptions}/plans'),
          api.get('${ApiConfig.subscriptions}/my'),
        ]);

        final plansData = results[0].data;
        final mySubData = results[1].data;

        List<Map<String, dynamic>> plans = [];
        if (plansData is List) {
          plans = plansData
              .map((e) => e is Map<String, dynamic> ? e : <String, dynamic>{})
              .where((e) => e.isNotEmpty)
              .toList();
        }

        Map<String, dynamic>? mySub;
        if (mySubData is Map<String, dynamic> && mySubData['planType'] != null) {
          mySub = mySubData;
        }

        setState(() {
          _plans = plans;
          _mySubscription = mySub;
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
        _error = "Ma'lumotlarni yuklashda xatolik";
      });
    }
  }

  Future<void> _purchasePlan(Map<String, dynamic> plan) async {
    final planType = plan['type'] as String?;
    final planName = plan['name'] as String? ?? planType ?? '';
    final price = (plan['price'] as num?)?.toInt() ?? 0;
    if (planType == null) return;

    if (_isDriver) {
      // Haydovchi — balansdan yechish (eski flow)
      await _driverPurchase(planType, planName, price);
    } else {
      // Dispetcher — chek yuklash flow
      await _dispatcherPayment(planType, planName, price);
    }
  }

  /// Haydovchi — balansdan yechish
  Future<void> _driverPurchase(String planType, String planName, int price) async {
    final balance = _mySubscription?['balance'] as num? ?? 0;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Obuna sotib olish', style: TextStyle(fontWeight: FontWeight.w700, color: SilkTheme.inkOf(context))),
        content: Text(
          'Balansingizdan ${_formatPrice(price)} UZS yechiladi.\n'
          'Hozirgi balans: ${_formatPrice(balance.toInt())} UZS\n\n'
          '$planName rejasiga o\'tishni xohlaysizmi?',
          style: TextStyle(color: SilkTheme.inkOf(context), fontSize: 14),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: Text('Bekor qilish', style: TextStyle(color: SilkTheme.mutedOf(context)))),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: SilkTheme.accent, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
            child: const Text("Ha, sotib olish"),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;

    showDialog(context: context, barrierDismissible: false, builder: (_) => const Center(child: CircularProgressIndicator(color: SilkTheme.brand)));
    try {
      final api = ref.read(apiClientProvider);
      await api.post(ApiConfig.driverSubscriptionPurchase, data: {'planType': planType});
      ref.read(driverProfileProvider.notifier).loadProfile();
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$planName rejasi muvaffaqiyatli sotib olindi!'), backgroundColor: SilkTheme.success, behavior: SnackBarBehavior.floating));
        _loadData();
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString().contains('Balans') ? "Balansingizda mablag' yetarli emas" : "Xatolik yuz berdi"), backgroundColor: SilkTheme.danger, behavior: SnackBarBehavior.floating));
      }
    }
  }

  /// Dispetcher — chek yuklash bilan to'lov
  Future<void> _dispatcherPayment(String planType, String planName, int price) async {
    File? receiptFile;

    // To'lov oynasi — karta raqamlari + chek yuklash
    final result = await showModalBottomSheet<File?>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _PaymentSheet(
        planName: planName,
        price: price,
        onPickImage: () async {
          final picker = ImagePicker();
          final source = await showDialog<ImageSource>(
            context: ctx,
            builder: (c) => AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: const Text('Chek yuklash'),
              content: Column(mainAxisSize: MainAxisSize.min, children: [
                ListTile(leading: const Icon(Icons.camera_alt, color: SilkTheme.brand), title: const Text('Kameradan'), onTap: () => Navigator.pop(c, ImageSource.camera)),
                ListTile(leading: const Icon(Icons.photo_library, color: SilkTheme.brand), title: const Text('Galereyadan'), onTap: () => Navigator.pop(c, ImageSource.gallery)),
              ]),
            ),
          );
          if (source == null) return null;
          final xfile = await picker.pickImage(source: source, maxWidth: 1200, imageQuality: 85);
          return xfile != null ? File(xfile.path) : null;
        },
      ),
    );

    if (result == null || !mounted) return;
    receiptFile = result;

    // Yuklash
    showDialog(context: context, barrierDismissible: false, builder: (_) => const Center(child: CircularProgressIndicator(color: SilkTheme.brand)));

    try {
      final api = ref.read(apiClientProvider);

      // 1. Chek rasmini yuklash
      String? receiptUrl;
      if (receiptFile.existsSync()) {
        final formData = FormData.fromMap({
          'file': await MultipartFile.fromFile(receiptFile.path, filename: 'chek_${DateTime.now().millisecondsSinceEpoch}.jpg'),
        });
        final uploadRes = await api.post('/upload/receipt', data: formData);
        receiptUrl = uploadRes.data is Map ? (uploadRes.data['url'] ?? uploadRes.data['path']) : uploadRes.data?.toString();
      }

      // 2. To'lov yaratish
      await api.post('/payments', data: {
        'amount': price,
        'planType': planType,
        'receiptImage': receiptUrl,
      });

      if (mounted) {
        Navigator.pop(context); // Loading yopish
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: const Text("To'lov yuborildi! Admin tekshirib tasdiqlagandan keyin obuna faollashadi."),
          backgroundColor: SilkTheme.success,
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 4),
        ));
        _loadData();
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("To'lov yuborishda xatolik: $e"), backgroundColor: SilkTheme.danger, behavior: SnackBarBehavior.floating));
      }
    }
  }

  String _formatPrice(int price) {
    final str = price.toString();
    final buffer = StringBuffer();
    for (var i = 0; i < str.length; i++) {
      if (i > 0 && (str.length - i) % 3 == 0) {
        buffer.write(' ');
      }
      buffer.write(str[i]);
    }
    return buffer.toString();
  }

  @override
  Widget build(BuildContext context) {
    final accentColor = _isDriver ? SilkTheme.accent : SilkTheme.brand;

    return Scaffold(
      appBar: const CustomAppBar(
        title: 'Obuna rejalari',
        showBack: true,
      ),
      backgroundColor: SilkTheme.bgOf(context),
      body: _isLoading
          ? Center(
              child: CircularProgressIndicator(color: accentColor),
            )
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.error_outline,
                          size: 48, color: SilkTheme.mutedOf(context)),
                      const SizedBox(height: 12),
                      Text(
                        _error!,
                        style: TextStyle(color: SilkTheme.mutedOf(context)),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadData,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: accentColor,
                          foregroundColor: Colors.white,
                        ),
                        child: const Text('Qayta yuklash'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  color: accentColor,
                  onRefresh: _loadData,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
                    child: Column(
                      children: [
                        // Driver subscription status card
                        if (_isDriver && _mySubscription != null)
                          _buildDriverStatusCard(),
                        for (int i = 0; i < _plans.length; i++) ...[
                          if (i > 0 || (_isDriver && _mySubscription != null))
                            const SizedBox(height: 16),
                          _buildPlanCard(_plans[i]),
                        ],
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildDriverStatusCard() {
    final isActive = _mySubscription?['active'] as bool? ?? false;
    final isExpired = _mySubscription?['expired'] as bool? ?? false;
    final endDateStr = _mySubscription?['endDate'] as String?;
    final balance = (_mySubscription?['balance'] as num?)?.toInt() ?? 0;

    String statusText;
    Color statusColor;
    if (isActive) {
      statusText = 'Faol';
      statusColor = SilkTheme.success;
    } else if (isExpired) {
      statusText = 'Muddati tugagan';
      statusColor = SilkTheme.danger;
    } else {
      statusText = 'Faol emas';
      statusColor = SilkTheme.accent2;
    }

    String? endDateFormatted;
    if (endDateStr != null) {
      try {
        final dt = DateTime.parse(endDateStr).toLocal();
        endDateFormatted = '${dt.day.toString().padLeft(2, '0')}.${dt.month.toString().padLeft(2, '0')}.${dt.year}';
      } catch (_) {}
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        gradient: isActive ? SilkTheme.heroGradient : null,
        color: isActive ? null : SilkTheme.surfaceOf(context),
        borderRadius: BorderRadius.circular(16),
        border: isActive ? null : Border.all(color: SilkTheme.borderOf(context)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                isActive ? Icons.verified : Icons.info_outline,
                color: isActive ? Colors.white : statusColor,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'Obuna holati: $statusText',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: isActive ? Colors.white : SilkTheme.inkOf(context),
                ),
              ),
            ],
          ),
          if (endDateFormatted != null) ...[
            const SizedBox(height: 6),
            Text(
              'Amal qilish: $endDateFormatted gacha',
              style: TextStyle(
                fontSize: 13,
                color: isActive
                    ? Colors.white.withValues(alpha: 0.8)
                    : SilkTheme.mutedOf(context),
              ),
            ),
          ],
          const SizedBox(height: 6),
          Text(
            'Balans: ${_formatPrice(balance)} UZS',
            style: TextStyle(
              fontSize: 13,
              color: isActive
                  ? Colors.white.withValues(alpha: 0.8)
                  : SilkTheme.mutedOf(context),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlanCard(Map<String, dynamic> plan) {
    final planType = plan['type'] as String? ?? '';
    final name = plan['name'] as String? ?? planType;
    final price = (plan['price'] as num?)?.toInt() ?? 0;
    final currency = plan['currency'] as String? ?? 'UZS';
    final isFree = price == 0;
    final accentColor = _isDriver ? SilkTheme.accent : SilkTheme.brand;

    // Check if this is the current plan (for dispatcher)
    final currentPlanType = _mySubscription?['planType'] as String?;
    final isCurrent = currentPlanType == planType;

    // For driver — check if subscription active
    final isDriverActive = _isDriver && (_mySubscription?['active'] as bool? ?? false);

    // Build features list
    final features = <String>[];

    if (_isDriver) {
      // Driver plans have features array
      final planFeatures = plan['features'] as List?;
      if (planFeatures != null) {
        for (final f in planFeatures) {
          features.add(f.toString());
        }
      }
      // Duration
      final days = plan['days'] as int?;
      if (days != null) {
        features.add('$days kun');
      }
    } else {
      // Dispatcher plans
      final maxAds = plan['maxAds'];
      final maxSessions = plan['maxSessions'];
      final maxGroups = plan['maxGroups'];
      final minInterval = plan['minInterval'];

      if (maxAds != null) {
        features.add(maxAds == -1
            ? 'Cheksiz e\'lonlar'
            : '$maxAds ta e\'lon');
      }
      if (maxSessions != null) {
        features.add(maxSessions == -1
            ? 'Cheksiz sessiyalar'
            : '$maxSessions ta sessiya');
      }
      if (maxGroups != null) {
        features.add(maxGroups == -1
            ? 'Cheksiz guruhlar'
            : '$maxGroups ta guruh');
      }
      if (minInterval != null) {
        final min = (minInterval as num).toInt();
        if (min < 120) {
          features.add('Tez interval (${min}s)');
        } else {
          features.add('Interval: ${(min / 60).toStringAsFixed(0)} min');
        }
      }
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: SilkTheme.surfaceOf(context),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isCurrent ? accentColor : SilkTheme.borderOf(context),
          width: isCurrent ? 2 : 1,
        ),
      ),
      child: Stack(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Plan name
              Text(
                name,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: SilkTheme.inkOf(context),
                ),
              ),

              const SizedBox(height: 8),

              // Price
              Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text(
                    isFree
                        ? '0 $currency'
                        : '${_formatPrice(price)} $currency',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                      color: isFree
                          ? SilkTheme.mutedOf(context)
                          : accentColor,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Features list
              ...features.map((feature) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.check,
                          size: 18,
                          color: SilkTheme.success,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            feature,
                            style: TextStyle(
                              fontSize: 14,
                              color: SilkTheme.inkOf(context),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ),
                  )),

              const SizedBox(height: 12),

              // Button
              SizedBox(
                width: double.infinity,
                height: 44,
                child: (isCurrent || (isDriverActive && _isDriver))
                    ? OutlinedButton(
                        onPressed: null,
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(
                            color: SilkTheme.mutedOf(context),
                            width: 1,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          disabledForegroundColor: SilkTheme.mutedOf(context),
                        ),
                        child: Text(
                          isDriverActive ? 'Obuna faol' : 'Joriy reja',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      )
                    : isFree
                        ? OutlinedButton(
                            onPressed: null,
                            style: OutlinedButton.styleFrom(
                              side: BorderSide(
                                color: SilkTheme.mutedOf(context),
                                width: 1,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              disabledForegroundColor: SilkTheme.mutedOf(context),
                            ),
                            child: const Text(
                              'Bepul',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          )
                        : OutlinedButton(
                            onPressed: () => _purchasePlan(plan),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: accentColor,
                              side: BorderSide(
                                color: accentColor,
                                width: 1.5,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: const Text(
                              'Sotib olish',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
              ),
            ],
          ),

          // Badge
          if (isCurrent || isDriverActive)
            Positioned(
              top: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: accentColor,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  isDriverActive ? 'FAOL' : 'JORIY',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

/// To'lov bottom sheet — karta raqamlari + chek yuklash
class _PaymentSheet extends StatefulWidget {
  final String planName;
  final int price;
  final Future<File?> Function() onPickImage;

  const _PaymentSheet({required this.planName, required this.price, required this.onPickImage});

  @override
  State<_PaymentSheet> createState() => _PaymentSheetState();
}

class _PaymentSheetState extends State<_PaymentSheet> {
  File? _receipt;

  @override
  Widget build(BuildContext context) {
    final priceStr = widget.price.toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+$)'), (m) => '${m[1]} ');

    return DraggableScrollableSheet(
      initialChildSize: 0.7,
      minChildSize: 0.4,
      maxChildSize: 0.9,
      builder: (context, sc) => Container(
        decoration: BoxDecoration(
          color: SilkTheme.surfaceOf(context),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: ListView(
          controller: sc,
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
          children: [
            // Handle
            Center(child: Container(margin: const EdgeInsets.only(top: 12, bottom: 20), width: 40, height: 4, decoration: BoxDecoration(color: SilkTheme.borderOf(context), borderRadius: BorderRadius.circular(2)))),

            // Header
            Text("To'lov — ${widget.planName}", style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: SilkTheme.inkOf(context))),
            const SizedBox(height: 4),
            Text('$priceStr UZS', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: SilkTheme.brand)),
            const SizedBox(height: 20),

            // Karta raqamlari
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: SilkTheme.bgOf(context), borderRadius: BorderRadius.circular(16)),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text("To'lov uchun karta raqamlari:", style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: SilkTheme.inkOf(context))),
                const SizedBox(height: 12),
                _cardRow('Uzcard', '8600 1234 5678 9012'),
                const SizedBox(height: 8),
                _cardRow('Humo', '9860 1234 5678 9012'),
                const SizedBox(height: 12),
                Text("Karta egasi: Yo'lda LLC", style: TextStyle(fontSize: 12, color: SilkTheme.muted2Of(context))),
              ]),
            ),

            const SizedBox(height: 16),

            // Qadamlar
            _stepRow('1', "Yuqoridagi kartaga $priceStr UZS o'tkazing"),
            const SizedBox(height: 8),
            _stepRow('2', "To'lov chekini rasmga oling yoki screenshotini saqlang"),
            const SizedBox(height: 8),
            _stepRow('3', "Chekni pastdagi tugma orqali yuklang"),

            const SizedBox(height: 20),

            // Chek yuklash
            GestureDetector(
              onTap: () async {
                final file = await widget.onPickImage();
                if (file != null) setState(() => _receipt = file);
              },
              child: Container(
                height: _receipt != null ? 200 : 120,
                decoration: BoxDecoration(
                  color: SilkTheme.bgOf(context),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: _receipt != null ? SilkTheme.success : SilkTheme.borderOf(context), width: _receipt != null ? 2 : 1),
                ),
                child: _receipt != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(14),
                        child: Stack(children: [
                          Image.file(_receipt!, width: double.infinity, height: 200, fit: BoxFit.cover),
                          Positioned(top: 8, right: 8, child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(color: SilkTheme.success, shape: BoxShape.circle),
                            child: const Icon(Icons.check, size: 16, color: Colors.white),
                          )),
                          Positioned(bottom: 8, left: 8, child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(8)),
                            child: const Text('Qayta tanlash uchun bosing', style: TextStyle(color: Colors.white, fontSize: 11)),
                          )),
                        ]),
                      )
                    : Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                        Icon(Icons.cloud_upload_outlined, size: 40, color: SilkTheme.brand.withValues(alpha: 0.6)),
                        const SizedBox(height: 8),
                        Text("Chek rasmini yuklang", style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: SilkTheme.mutedOf(context))),
                        const SizedBox(height: 4),
                        Text('Kamera yoki galereyadan', style: TextStyle(fontSize: 12, color: SilkTheme.muted2Of(context))),
                      ]),
              ),
            ),

            const SizedBox(height: 20),

            // Yuborish tugmasi
            SizedBox(
              height: 50,
              child: ElevatedButton(
                onPressed: _receipt != null ? () => Navigator.pop(context, _receipt) : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: SilkTheme.brand,
                  foregroundColor: Colors.white,
                  disabledBackgroundColor: SilkTheme.brand.withValues(alpha: 0.3),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: Text(_receipt != null ? "To'lovni yuborish" : "Avval chek yuklang", style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _cardRow(String type, String number) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(color: SilkTheme.surfaceOf(context), borderRadius: BorderRadius.circular(10), border: Border.all(color: SilkTheme.borderOf(context))),
      child: Row(children: [
        Text(type, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: SilkTheme.inkOf(context))),
        const Spacer(),
        SelectableText(number, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: SilkTheme.brand, letterSpacing: 1.5)),
      ]),
    );
  }

  Widget _stepRow(String num, String text) {
    return Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Container(
        width: 24, height: 24,
        decoration: BoxDecoration(color: SilkTheme.brand.withValues(alpha: 0.1), shape: BoxShape.circle),
        alignment: Alignment.center,
        child: Text(num, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: SilkTheme.brand)),
      ),
      const SizedBox(width: 10),
      Expanded(child: Text(text, style: TextStyle(fontSize: 13, color: SilkTheme.mutedOf(context), height: 1.4))),
    ]);
  }
}
