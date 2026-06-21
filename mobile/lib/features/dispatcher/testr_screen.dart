import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../config/api_config.dart';
import '../../config/silk_theme.dart';
import '../../core/api/api_client.dart';

/// Dispetcher — Testr narx kalkulyator sahifasi
class TestrScreen extends ConsumerStatefulWidget {
  const TestrScreen({super.key});

  @override
  ConsumerState<TestrScreen> createState() => _TestrScreenState();
}

class _TestrScreenState extends ConsumerState<TestrScreen> {
  String? _fromCity;
  String? _toCity;
  String? _vehicleType;
  final _weightController = TextEditingController();

  bool _showResult = false;
  bool _isLoading = false;
  int _estimatedPrice = 0;
  int _minPrice = 0;
  int _maxPrice = 0;
  int _basedOnOrders = 0;
  String _confidence = '';

  static const _cities = [
    'Toshkent',
    'Samarqand',
    "Farg'ona",
    'Andijon',
    'Buxoro',
    'Qashqadaryo',
    'Xorazm',
    'Navoiy',
    'Jizzax',
    'Surxondaryo',
    'Sirdaryo',
    'Namangan',
  ];

  static const _vehicleTypes = [
    'Tentli',
    'Refrijerator',
    'Bortli',
    'Konteyner',
    'Samosval',
  ];

  @override
  void dispose() {
    _weightController.dispose();
    super.dispose();
  }

  Future<void> _calculate() async {
    if (_fromCity == null || _toCity == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Yo'nalishni tanlang"),
          backgroundColor: SilkTheme.accent2,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final api = ref.read(apiClientProvider);
      final body = <String, dynamic>{
        'cargoFrom': _fromCity,
        'cargoTo': _toCity,
      };
      if (_vehicleType != null) {
        body['vehicleType'] = _vehicleType;
      }
      final weight = double.tryParse(_weightController.text);
      if (weight != null && weight > 0) {
        body['cargoWeight'] = weight;
      }

      final response = await api.post(
        ApiConfig.analyticsPriceEstimate,
        data: body,
      );

      final data = response.data;
      if (data is Map<String, dynamic>) {
        setState(() {
          _estimatedPrice =
              (data['estimatedPrice'] as num?)?.toInt() ?? 0;
          _minPrice = (data['minPrice'] as num?)?.toInt() ?? 0;
          _maxPrice = (data['maxPrice'] as num?)?.toInt() ?? 0;
          _basedOnOrders = (data['basedOnOrders'] as num?)?.toInt() ?? 0;
          _confidence = (data['confidence'] as String?) ?? '';
          _showResult = true;
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text("Natija olinmadi"),
              backgroundColor: SilkTheme.danger,
            ),
          );
        }
      }
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("Xatolik: ${_parseError(e)}"),
            backgroundColor: SilkTheme.danger,
          ),
        );
      }
    }
  }

  String _parseError(dynamic e) {
    if (e.toString().contains('DioException')) {
      return "Server bilan bog'lanishda xatolik";
    }
    return "Narxni hisoblashda xatolik";
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
    return Scaffold(
      backgroundColor: SilkTheme.bg,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Testr — Narx kalkulyator'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // ── Description ──
          const Text(
            "Yo'nalish va mashina turi asosida taxminiy narxni hisoblang",
            style: TextStyle(
              fontSize: 14,
              color: SilkTheme.muted,
            ),
          ),
          const SizedBox(height: 20),

          // ── Qayerdan ──
          _buildLabel('Qayerdan'),
          const SizedBox(height: 6),
          DropdownButtonFormField<String>(
            value: _fromCity,
            decoration: const InputDecoration(
              hintText: 'Shaharni tanlang',
            ),
            items: _cities
                .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                .toList(),
            onChanged: (v) => setState(() => _fromCity = v),
          ),
          const SizedBox(height: 14),

          // ── Qayerga ──
          _buildLabel('Qayerga'),
          const SizedBox(height: 6),
          DropdownButtonFormField<String>(
            value: _toCity,
            decoration: const InputDecoration(
              hintText: 'Shaharni tanlang',
            ),
            items: _cities
                .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                .toList(),
            onChanged: (v) => setState(() => _toCity = v),
          ),
          const SizedBox(height: 14),

          // ── Mashina turi / Og'irlik ──
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildLabel('Mashina turi'),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      value: _vehicleType,
                      decoration: const InputDecoration(
                        hintText: 'Turi',
                      ),
                      items: _vehicleTypes
                          .map((t) =>
                              DropdownMenuItem(value: t, child: Text(t)))
                          .toList(),
                      onChanged: (v) => setState(() => _vehicleType = v),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildLabel("Og'irlik"),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _weightController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        hintText: '0',
                        suffixText: 't',
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // ── Hisoblash ──
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              onPressed: _isLoading ? null : _calculate,
              style: ElevatedButton.styleFrom(
                backgroundColor: SilkTheme.brand,
                foregroundColor: Colors.white,
                disabledBackgroundColor: SilkTheme.brand.withValues(alpha: 0.5),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: _isLoading
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text(
                      'Hisoblash',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
            ),
          ),
          const SizedBox(height: 20),

          // ── Result card ──
          if (_showResult) _buildResultCard(),
        ],
      ),
    );
  }

  Widget _buildResultCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: SilkTheme.heroGradient,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Stack(
        children: [
          // Decorative circles
          Positioned(
            top: -20,
            right: -20,
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
            ),
          ),
          Positioned(
            bottom: -30,
            left: -15,
            child: Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.06),
                shape: BoxShape.circle,
              ),
            ),
          ),

          // Content
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Taxminiy narx',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.white.withValues(alpha: 0.7),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                '${_formatPrice(_estimatedPrice)} UZS',
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'min ${_formatPrice(_minPrice)} — max ${_formatPrice(_maxPrice)}',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.white.withValues(alpha: 0.7),
                ),
              ),
              if (_basedOnOrders > 0 || _confidence.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(
                  '${_basedOnOrders > 0 ? '$_basedOnOrders ta buyurtma asosida' : ''}${_confidence.isNotEmpty ? ' • $_confidence' : ''}',
                  style: TextStyle(
                    fontSize: 11,
                    color: Colors.white.withValues(alpha: 0.6),
                  ),
                ),
              ],
              const SizedBox(height: 16),

              // Action buttons
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => context.push('/dispatcher/create'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.24),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Text(
                          'Buyurtma yaratish',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        // Qayta hisoblash
                        _calculate();
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: SilkTheme.success.withValues(alpha: 0.8),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.refresh,
                              color: Colors.white,
                              size: 16,
                            ),
                            SizedBox(width: 4),
                            Text(
                              'Qayta hisoblash',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w600,
        color: SilkTheme.ink,
      ),
    );
  }
}
