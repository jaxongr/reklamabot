import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';

import '../../../config/silk_theme.dart';
import '../../../config/api_config.dart';
import '../../../core/api/api_client.dart';
import '../../../core/data/uzbekistan_regions.dart';
import '../../auth/auth_provider.dart';

/// Yo'lda Driver — 4-bosqichli ro'yxatdan o'tish
class DriverRegistrationScreen extends ConsumerStatefulWidget {
  const DriverRegistrationScreen({super.key});

  @override
  ConsumerState<DriverRegistrationScreen> createState() =>
      _DriverRegistrationScreenState();
}

class _DriverRegistrationScreenState
    extends ConsumerState<DriverRegistrationScreen> {
  final _formKey = GlobalKey<FormState>();
  int _currentStep = 0;
  bool _loading = false;
  bool _success = false;

  // Step 1 — Shaxsiy
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _confirmPasswordCtrl = TextEditingController();
  final _passportCtrl = TextEditingController();
  final _birthDateCtrl = TextEditingController();
  final _locationCtrl = TextEditingController();
  String _selectedRegion = '';
  String _selectedDistrict = '';
  List<String> _locationSuggestions = [];

  // Step 2 — Mashina
  String _vehicleType = 'Yuk mashina';
  String _vehicleBrand = '';
  final _vehicleModelCtrl = TextEditingController();
  String _vehicleColor = '';
  final _vehicleNumberCtrl = TextEditingController();
  final _vehicleYearCtrl = TextEditingController();
  final _capacityCtrl = TextEditingController();
  String _bodyType = '';

  static const _vehicleTypes = [
    'Yuk mashina',
    'Yengil yuk',
    'Mikroavtobus',
    'Maxsus texnika',
  ];

  static const _brandsByType = <String, List<String>>{
    'Yuk mashina': [
      'Fura', 'Kamaz', 'MAN', 'Volvo', 'Scania', 'DAF',
      'Mercedes', 'HOWO', 'Shacman', 'Iveco', 'Renault',
      'Dongfeng', 'FAW', 'Foton', 'Fuso', 'Boshqa',
    ],
    'Yengil yuk': [
      'Isuzu', 'Gazel', 'Canter', 'JAC', 'Hyundai',
      'Porter', 'Sprinter', 'Labo', 'Damas', 'Largus',
      'Foton', 'FAW', 'Boshqa',
    ],
    'Mikroavtobus': [
      'Mercedes Sprinter', 'Ford Transit', 'Gazel', 'Isuzu',
      'Hyundai', 'Fiat Ducato', 'Iveco Daily', 'Boshqa',
    ],
    'Maxsus texnika': [
      'Samosval', 'Evakuator', 'Manipulyator', 'Tral',
      'Avtovoz', 'Sisterna', 'Kamaz', 'HOWO', 'Shacman',
      'MAN', 'Volvo', 'Caterpillar', 'JCB', 'Boshqa',
    ],
  };

  List<String> get _vehicleBrands =>
      _brandsByType[_vehicleType] ?? _brandsByType['Yuk mashina']!;

  static const _bodyTypes = [
    'Tentli',
    'Refrijerator',
    'Bortli',
    'Samosval',
    'Konteyner',
    'Sisterna',
    'Izoterm',
    'Platforma',
    'Furgon',
    'Evakuator',
    'Boshqa',
  ];

  static const _colors = [
    {'name': 'Oq', 'color': Color(0xFFF5F5F5)},
    {'name': 'Qora', 'color': Color(0xFF2D2D2D)},
    {'name': "Ko'k", 'color': Color(0xFF2563EB)},
    {'name': 'Qizil', 'color': Color(0xFFDC2626)},
    {'name': 'Yashil', 'color': Color(0xFF16A34A)},
    {'name': 'Sariq', 'color': Color(0xFFF59E0B)},
    {'name': 'Kulrang', 'color': Color(0xFF9CA3AF)},
    {'name': "Ko'k-yashil", 'color': Color(0xFF0D9488)},
  ];

  static const _stepTitles = [
    'Shaxsiy ma\'lumot',
    'Mashina ma\'lumotlari',
    'Qo\'shimcha',
    'Tasdiqlash',
  ];

  static const _stepIcons = [
    Icons.person_rounded,
    Icons.local_shipping_rounded,
    Icons.build_circle_rounded,
    Icons.check_circle_rounded,
  ];

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _passportCtrl.dispose();
    _birthDateCtrl.dispose();
    _locationCtrl.dispose();
    _vehicleModelCtrl.dispose();
    _vehicleNumberCtrl.dispose();
    _vehicleYearCtrl.dispose();
    _capacityCtrl.dispose();
    super.dispose();
  }

  bool _validateCurrentStep() {
    switch (_currentStep) {
      case 0:
        if (_nameCtrl.text.trim().length < 3) {
          _showError("To'liq ismingizni kiriting");
          return false;
        }
        if (_phoneCtrl.text.replaceAll(RegExp(r'\D'), '').length < 9) {
          _showError("Telefon raqamni to'g'ri kiriting");
          return false;
        }
        // Parol validatsiya step 3 da
        // Agar ro'yxatdan tanlamagan bo'lsa lekin matn yozgan bo'lsa — qabul qilish
        if (_selectedRegion.isEmpty && _locationCtrl.text.trim().isNotEmpty) {
          // Matn kiritgan lekin ro'yxatdan tanlamagan — qabul qilamiz
          _selectedDistrict = _locationCtrl.text.trim();
          _selectedRegion = 'Boshqa';
        }
        if (_selectedRegion.isEmpty && _locationCtrl.text.trim().isEmpty) {
          _showError("Joylashuvingizni kiriting");
          return false;
        }
        return true;
      case 1:
        if (_vehicleBrand.isEmpty) {
          _showError('Mashina markasini tanlang');
          return false;
        }
        if (_vehicleNumberCtrl.text.trim().length < 4) {
          _showError('Davlat raqamini kiriting');
          return false;
        }
        return true;
      case 2:
        return true;
      case 3:
        // Parol validatsiya — oxirgi step
        if (_passwordCtrl.text.length < 6) {
          _showError("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
          return false;
        }
        if (_passwordCtrl.text != _confirmPasswordCtrl.text) {
          _showError("Parollar mos kelmadi");
          return false;
        }
        return true;
      default:
        return true;
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: SilkTheme.danger,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(SilkTheme.radiusSmall)),
      ),
    );
  }

  void _nextStep() {
    if (!_validateCurrentStep()) return;
    if (_currentStep < 3) {
      setState(() => _currentStep++);
    } else {
      _submit();
    }
  }

  void _prevStep() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
    } else {
      context.pop();
    }
  }

  Future<void> _submit() async {
    setState(() => _loading = true);
    try {
      final dio = Dio(BaseOptions(
        baseUrl: ApiConfig.defaultBaseUrl + ApiConfig.apiPrefix,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 30),
      ));

      await dio.post('/drivers/register', data: {
        'fullName': _nameCtrl.text.trim(),
        'phone': _phoneCtrl.text.trim(),
        'password': _passwordCtrl.text,
        'passportNumber':
            _passportCtrl.text.trim().isEmpty ? null : _passportCtrl.text.trim(),
        'birthDate':
            _birthDateCtrl.text.trim().isEmpty ? null : _birthDateCtrl.text.trim(),
        'vehicleType': _vehicleType,
        'vehicleBrand': _vehicleBrand,
        'vehicleModel': _vehicleModelCtrl.text.trim().isEmpty
            ? null
            : _vehicleModelCtrl.text.trim(),
        'vehicleColor': _vehicleColor.isEmpty ? null : _vehicleColor,
        'vehicleNumber': _vehicleNumberCtrl.text.trim().toUpperCase(),
        'vehicleYear': _vehicleYearCtrl.text.trim().isEmpty
            ? null
            : _vehicleYearCtrl.text.trim(),
        'vehicleCapacity':
            _capacityCtrl.text.trim().isEmpty ? null : _capacityCtrl.text.trim(),
        'bodyType': _bodyType.isEmpty ? null : _bodyType,
        'region': _selectedRegion.isEmpty ? null : _selectedRegion,
        'district': _selectedDistrict.isEmpty ? null : _selectedDistrict,
      });

      // Avtomatik tasdiqlanadi — admin kutilmaydi. Darhol login qilib kiramiz.
      if (!mounted) return;
      setState(() => _loading = false);
      final regPhone = _phoneCtrl.text.trim();
      final regPass = _passwordCtrl.text;
      try {
        await ref
            .read(authStateProvider.notifier)
            .driverLoginWithPassword(phone: regPhone, password: regPass);
      } catch (_) {}
      if (!mounted) return;
      if (ref.read(authStateProvider).isAuthenticated) {
        context.go('/driver/home');
        return;
      }
      // Auto-login ishlamasa — muvaffaqiyat ekrani (login tugmasi bilan)
      setState(() => _success = true);
    } catch (e) {
      setState(() => _loading = false);
      if (mounted) {
        String msg = "Ro'yxatdan o'tishda xatolik";
        if (e is DioException && e.response?.data is Map) {
          final raw = (e.response?.data as Map)['message'];
          // Backend xabari String yoki validatsiya xatolari ro'yxati bo'lishi mumkin
          if (raw is String && raw.trim().isNotEmpty) {
            msg = raw;
          } else if (raw is List && raw.isNotEmpty) {
            msg = raw.join(', ');
          }
        }
        _showError(msg);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_success) return _buildSuccessScreen();

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded,
              color: SilkTheme.ink),
          onPressed: _prevStep,
        ),
        title: const Text(
          "Ro'yxatdan o'tish",
          style: TextStyle(
            color: SilkTheme.ink,
            fontWeight: FontWeight.w700,
            fontSize: 18,
          ),
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          // Progress bar
          _buildStepIndicator(),

          // Kontent
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
              child: Form(
                key: _formKey,
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 300),
                  child: _buildStepContent(),
                ),
              ),
            ),
          ),

          // Keyingi tugma
          _buildBottomButton(),
        ],
      ),
    );
  }

  Widget _buildStepIndicator() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 16),
      child: Column(
        children: [
          // Step dots
          Row(
            children: List.generate(4, (i) {
              final isActive = i == _currentStep;
              final isDone = i < _currentStep;
              return Expanded(
                child: Container(
                  margin: EdgeInsets.only(right: i < 3 ? 8 : 0),
                  height: 4,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(2),
                    color: isDone
                        ? SilkTheme.accent
                        : isActive
                            ? SilkTheme.brand
                            : SilkTheme.borderOf(context),
                  ),
                ),
              );
            }),
          ),
          const SizedBox(height: 12),
          // Step title
          Row(
            children: [
              Icon(
                _stepIcons[_currentStep],
                color: SilkTheme.brand,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                '${_currentStep + 1}/4 — ${_stepTitles[_currentStep]}',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: SilkTheme.inkOf(context),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStepContent() {
    switch (_currentStep) {
      case 0:
        return _buildStep1Personal(key: const ValueKey('step1'));
      case 1:
        return _buildStep2Vehicle(key: const ValueKey('step2'));
      case 2:
        return _buildStep3Extra(key: const ValueKey('step3'));
      case 3:
        return _buildStep4Confirm(key: const ValueKey('step4'));
      default:
        return const SizedBox.shrink();
    }
  }

  // ========== STEP 1: Shaxsiy ==========
  Widget _buildStep1Personal({Key? key}) {
    return Column(
      key: key,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionCard(
          icon: Icons.badge_rounded,
          title: "Kim siz?",
          subtitle: "Sizni tanib olishimiz uchun",
          children: [
            _buildTextField(
              controller: _nameCtrl,
              label: "To'liq ism-familiya",
              hint: 'Sardor Karimov',
              icon: Icons.person_rounded,
              required: true,
            ),
            const SizedBox(height: 16),
            _buildTextField(
              controller: _phoneCtrl,
              label: 'Telefon raqam',
              hint: '+998 90 123 45 67',
              icon: Icons.phone_rounded,
              keyboardType: TextInputType.phone,
              required: true,
            ),
            const SizedBox(height: 16),
            _buildTextField(
              controller: _passportCtrl,
              label: 'Passport raqami',
              hint: 'AB 1234567',
              icon: Icons.credit_card_rounded,
              textCapitalization: TextCapitalization.characters,
              helperText: 'Xavfsizlik uchun — majburiy emas',
            ),
            const SizedBox(height: 16),
            _buildTextField(
              controller: _birthDateCtrl,
              label: "Tug'ilgan sana",
              hint: '01.01.1990',
              icon: Icons.cake_rounded,
              keyboardType: TextInputType.datetime,
            ),
          ],
        ),

        const SizedBox(height: 16),

        // Manzil
        _sectionCard(
          icon: Icons.location_on_rounded,
          title: "Manzil",
          subtitle: "Qaysi viloyat va tumandan?",
          children: [
            Row(
              children: [
                const Text(
                  'Joylashuv',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF374151),
                  ),
                ),
                const Text(' *',
                    style: TextStyle(color: SilkTheme.danger, fontSize: 13)),
              ],
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _locationCtrl,
              style: TextStyle(
                  fontSize: 15, color: SilkTheme.inkOf(context)),
              decoration: InputDecoration(
                hintText: "Tuman nomini yozing...",
                hintStyle: TextStyle(color: SilkTheme.muted2Of(context)),
                prefixIcon: const Icon(Icons.search_rounded,
                    color: SilkTheme.brand, size: 20),
                suffixIcon: _selectedDistrict.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 18),
                        onPressed: () {
                          _locationCtrl.clear();
                          setState(() {
                            _selectedRegion = '';
                            _selectedDistrict = '';
                            _locationSuggestions = [];
                          });
                        },
                      )
                    : null,
                filled: true,
                fillColor: SilkTheme.bgOf(context),
                contentPadding: const EdgeInsets.symmetric(
                    horizontal: 14, vertical: 14),
                border: OutlineInputBorder(
                  borderRadius:
                      BorderRadius.circular(SilkTheme.radiusMedium),
                  borderSide:
                      BorderSide(color: SilkTheme.borderOf(context)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius:
                      BorderRadius.circular(SilkTheme.radiusMedium),
                  borderSide: BorderSide(
                    color: _selectedDistrict.isNotEmpty
                        ? SilkTheme.accent
                        : SilkTheme.borderOf(context),
                    width: _selectedDistrict.isNotEmpty ? 1.5 : 1,
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius:
                      BorderRadius.circular(SilkTheme.radiusMedium),
                  borderSide: const BorderSide(
                      color: SilkTheme.brand, width: 1.5),
                ),
              ),
              onChanged: (value) {
                setState(() {
                  _locationSuggestions = searchLocations(value);
                  if (value.isEmpty) {
                    _selectedRegion = '';
                    _selectedDistrict = '';
                  }
                });
              },
            ),

            // Tanlangan joy ko'rsatish
            if (_selectedDistrict.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: SilkTheme.accent.withValues(alpha: 0.08),
                    borderRadius:
                        BorderRadius.circular(SilkTheme.radiusSmall),
                    border: Border.all(
                        color: SilkTheme.accent.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle,
                          color: SilkTheme.accent, size: 16),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          '$_selectedDistrict, $_selectedRegion',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: SilkTheme.accent,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

            // Autocomplete variantlari
            if (_locationSuggestions.isNotEmpty &&
                _selectedDistrict.isEmpty)
              Container(
                margin: const EdgeInsets.only(top: 4),
                constraints: const BoxConstraints(maxHeight: 200),
                decoration: BoxDecoration(
                  color: SilkTheme.surfaceOf(context),
                  borderRadius:
                      BorderRadius.circular(SilkTheme.radiusMedium),
                  border:
                      Border.all(color: SilkTheme.borderOf(context)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: ListView.separated(
                  shrinkWrap: true,
                  padding: EdgeInsets.zero,
                  itemCount: _locationSuggestions.length,
                  separatorBuilder: (_, __) => Divider(
                    height: 1,
                    color: SilkTheme.borderOf(context),
                  ),
                  itemBuilder: (context, index) {
                    final loc = _locationSuggestions[index];
                    final parts = loc.split(', ');
                    final district = parts[0];
                    final region =
                        parts.length > 1 ? parts[1] : '';
                    return InkWell(
                      onTap: () {
                        setState(() {
                          _selectedDistrict = district;
                          _selectedRegion = region;
                          _locationCtrl.text = loc;
                          _locationSuggestions = [];
                        });
                        FocusScope.of(context).unfocus();
                      },
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 12),
                        child: Row(
                          children: [
                            Icon(Icons.location_on_outlined,
                                size: 16,
                                color: SilkTheme.mutedOf(context)),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    district,
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w500,
                                      color: SilkTheme
                                          .inkOf(context),
                                    ),
                                  ),
                                  Text(
                                    region,
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: SilkTheme
                                          .mutedOf(context),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
          ],
        ),
      ],
    );
  }

  // ========== STEP 2: Mashina ==========
  Widget _buildStep2Vehicle({Key? key}) {
    return Column(
      key: key,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Mashina toifasi
        _sectionCard(
          icon: Icons.category_rounded,
          title: "Mashina toifasi",
          subtitle: "Qanday transport?",
          children: [
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _vehicleTypes.map((type) {
                final isSelected = _vehicleType == type;
                return GestureDetector(
                  onTap: () => setState(() {
                    _vehicleType = type;
                    _vehicleBrand = ''; // Toifa o'zgarganda markani tozalash
                  }),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? SilkTheme.brand.withValues(alpha: 0.1)
                          : SilkTheme.surfaceOf(context),
                      borderRadius:
                          BorderRadius.circular(SilkTheme.radiusMedium),
                      border: Border.all(
                        color: isSelected
                            ? SilkTheme.brand
                            : SilkTheme.borderOf(context),
                        width: isSelected ? 1.5 : 1,
                      ),
                    ),
                    child: Text(
                      type,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight:
                            isSelected ? FontWeight.w600 : FontWeight.normal,
                        color: isSelected
                            ? SilkTheme.brand
                            : SilkTheme.inkOf(context),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ),

        const SizedBox(height: 16),

        // Marka
        _sectionCard(
          icon: Icons.directions_car_rounded,
          title: "Marka",
          subtitle: "Mashina markasini tanlang",
          children: [
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _vehicleBrands.map((brand) {
                final isSelected = _vehicleBrand == brand;
                return GestureDetector(
                  onTap: () => setState(() => _vehicleBrand = brand),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? SilkTheme.accent.withValues(alpha: 0.12)
                          : SilkTheme.surfaceOf(context),
                      borderRadius:
                          BorderRadius.circular(SilkTheme.radiusSmall),
                      border: Border.all(
                        color: isSelected
                            ? SilkTheme.accent
                            : SilkTheme.borderOf(context),
                        width: isSelected ? 1.5 : 1,
                      ),
                    ),
                    child: Text(
                      brand,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight:
                            isSelected ? FontWeight.w600 : FontWeight.normal,
                        color: isSelected
                            ? SilkTheme.accent
                            : SilkTheme.inkOf(context),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ),

        const SizedBox(height: 16),

        // Raqam va model
        _sectionCard(
          icon: Icons.pin_rounded,
          title: "Mashina tafsilotlari",
          subtitle: null,
          children: [
            _buildTextField(
              controller: _vehicleNumberCtrl,
              label: 'Davlat raqami',
              hint: '01 A 777 BB',
              icon: Icons.confirmation_number_rounded,
              textCapitalization: TextCapitalization.characters,
              required: true,
            ),
            const SizedBox(height: 16),
            _buildTextField(
              controller: _vehicleModelCtrl,
              label: 'Model (ixtiyoriy)',
              hint: 'Masalan: Actros 1845',
              icon: Icons.edit_rounded,
            ),
          ],
        ),
      ],
    );
  }

  // ========== STEP 3: Qo'shimcha ==========
  Widget _buildStep3Extra({Key? key}) {
    return Column(
      key: key,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Rang
        _sectionCard(
          icon: Icons.palette_rounded,
          title: "Mashina rangi",
          subtitle: "Ixtiyoriy",
          children: [
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: _colors.map((c) {
                final name = c['name'] as String;
                final color = c['color'] as Color;
                final isSelected = _vehicleColor == name;
                return GestureDetector(
                  onTap: () => setState(() => _vehicleColor = name),
                  child: Column(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: color,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isSelected
                                ? SilkTheme.brand
                                : SilkTheme.borderOf(context),
                            width: isSelected ? 3 : 1,
                          ),
                          boxShadow: isSelected
                              ? [
                                  BoxShadow(
                                    color:
                                        SilkTheme.brand.withValues(alpha: 0.3),
                                    blurRadius: 8,
                                  )
                                ]
                              : null,
                        ),
                        child: isSelected
                            ? Icon(Icons.check,
                                color: name == 'Qora' || name == "Ko'k"
                                    ? Colors.white
                                    : SilkTheme.brand,
                                size: 20)
                            : null,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        name,
                        style: TextStyle(
                          fontSize: 11,
                          color: SilkTheme.mutedOf(context),
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ],
        ),

        const SizedBox(height: 16),

        // Kuzov turi
        _sectionCard(
          icon: Icons.view_in_ar_rounded,
          title: "Kuzov turi",
          subtitle: "Ixtiyoriy",
          children: [
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _bodyTypes.map((type) {
                final isSelected = _bodyType == type;
                return GestureDetector(
                  onTap: () => setState(() => _bodyType = type),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? SilkTheme.brand.withValues(alpha: 0.1)
                          : SilkTheme.surfaceOf(context),
                      borderRadius:
                          BorderRadius.circular(SilkTheme.radiusSmall),
                      border: Border.all(
                        color: isSelected
                            ? SilkTheme.brand
                            : SilkTheme.borderOf(context),
                      ),
                    ),
                    child: Text(
                      type,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight:
                            isSelected ? FontWeight.w600 : FontWeight.normal,
                        color: isSelected
                            ? SilkTheme.brand
                            : SilkTheme.inkOf(context),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ),

        const SizedBox(height: 16),

        // Yil va sig'im
        _sectionCard(
          icon: Icons.info_outline_rounded,
          title: "Texnik ma'lumot",
          subtitle: "Ixtiyoriy",
          children: [
            _buildTextField(
              controller: _vehicleYearCtrl,
              label: 'Ishlab chiqarilgan yili',
              hint: '2020',
              icon: Icons.calendar_today_rounded,
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),
            _buildTextField(
              controller: _capacityCtrl,
              label: "Yuk sig'imi (tonna)",
              hint: '20',
              icon: Icons.fitness_center_rounded,
              keyboardType: TextInputType.number,
            ),
          ],
        ),
      ],
    );
  }

  // ========== STEP 4: Tasdiqlash ==========
  Widget _buildStep4Confirm({Key? key}) {
    return Column(
      key: key,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Parol yaratish
        Text("Login parol", style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: SilkTheme.inkOf(context))),
        const SizedBox(height: 4),
        Text("Ilovaga kirish uchun parol yarating", style: TextStyle(fontSize: 13, color: SilkTheme.mutedOf(context))),
        const SizedBox(height: 12),
        TextField(
          controller: _passwordCtrl,
          obscureText: true,
          decoration: InputDecoration(
            labelText: 'Parol *',
            hintText: 'Kamida 6 ta belgi',
            prefixIcon: const Icon(Icons.lock_outline, size: 20),
            filled: true,
            fillColor: SilkTheme.bgOf(context),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: SilkTheme.borderOf(context))),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: SilkTheme.borderOf(context))),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: SilkTheme.brand, width: 1.5)),
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _confirmPasswordCtrl,
          obscureText: true,
          decoration: InputDecoration(
            labelText: 'Parolni tasdiqlang *',
            hintText: 'Qayta kiriting',
            prefixIcon: const Icon(Icons.lock_outline, size: 20),
            filled: true,
            fillColor: SilkTheme.bgOf(context),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: SilkTheme.borderOf(context))),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: SilkTheme.borderOf(context))),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: SilkTheme.brand, width: 1.5)),
          ),
        ),
        const SizedBox(height: 20),

        // Ma'lumotlar xulosasi
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [SilkTheme.brand, SilkTheme.brand2],
            ),
            borderRadius: BorderRadius.circular(SilkTheme.radiusCard),
          ),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(Icons.fact_check_rounded,
                    color: Colors.white, size: 26),
              ),
              const SizedBox(width: 14),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("Ma'lumotlarni tekshiring",
                        style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w700)),
                    SizedBox(height: 2),
                    Text("Yuborishdan oldin",
                        style: TextStyle(color: Colors.white70, fontSize: 12)),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        _confirmRow(Icons.person_rounded, 'Ism', _nameCtrl.text),
        _confirmRow(Icons.phone_rounded, 'Telefon', _phoneCtrl.text),
        if (_passportCtrl.text.isNotEmpty)
          _confirmRow(
              Icons.credit_card_rounded, 'Passport', _passportCtrl.text),
        if (_birthDateCtrl.text.isNotEmpty)
          _confirmRow(
              Icons.cake_rounded, "Tug'ilgan sana", _birthDateCtrl.text),
        if (_selectedDistrict.isNotEmpty)
          _confirmRow(Icons.location_on_rounded, 'Joylashuv',
              '$_selectedDistrict, $_selectedRegion'),

        Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Divider(color: SilkTheme.borderOf(context)),
        ),

        _confirmRow(Icons.category_rounded, 'Toifa', _vehicleType),
        _confirmRow(Icons.directions_car_rounded, 'Marka', _vehicleBrand),
        if (_vehicleModelCtrl.text.isNotEmpty)
          _confirmRow(Icons.edit_rounded, 'Model', _vehicleModelCtrl.text),
        _confirmRow(Icons.confirmation_number_rounded, 'Davlat raqami',
            _vehicleNumberCtrl.text.toUpperCase()),
        if (_vehicleColor.isNotEmpty)
          _confirmRow(Icons.palette_rounded, 'Rang', _vehicleColor),
        if (_bodyType.isNotEmpty)
          _confirmRow(Icons.view_in_ar_rounded, 'Kuzov', _bodyType),
        if (_vehicleYearCtrl.text.isNotEmpty)
          _confirmRow(
              Icons.calendar_today_rounded, 'Yili', _vehicleYearCtrl.text),
        if (_capacityCtrl.text.isNotEmpty)
          _confirmRow(
              Icons.fitness_center_rounded, "Sig'im", '${_capacityCtrl.text} t'),

        const SizedBox(height: 16),

        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: SilkTheme.accent2.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
            border: Border.all(
                color: SilkTheme.accent2.withValues(alpha: 0.2)),
          ),
          child: Row(
            children: [
              Icon(Icons.info_outline,
                  color: SilkTheme.accent2, size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  "Ro'yxatdan o'tgach hisobingiz avtomatik tasdiqlanadi va 1 oylik bepul obuna beriladi",
                  style: TextStyle(
                    fontSize: 12,
                    color: SilkTheme.mutedOf(context),
                    height: 1.4,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _confirmRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(icon, size: 18, color: SilkTheme.brand),
          const SizedBox(width: 10),
          Text(
            '$label: ',
            style: TextStyle(
              fontSize: 13,
              color: SilkTheme.mutedOf(context),
            ),
          ),
          Expanded(
            child: Text(
              value.isEmpty ? '—' : value,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: SilkTheme.inkOf(context),
              ),
              textAlign: TextAlign.right,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomButton() {
    final isLast = _currentStep == 3;
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
      decoration: BoxDecoration(
        color: SilkTheme.surfaceOf(context),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SizedBox(
        width: double.infinity,
        height: 52,
        child: DecoratedBox(
          decoration: BoxDecoration(
            gradient: isLast
                ? const LinearGradient(
                    colors: [SilkTheme.accent, Color(0xFF16A34A)])
                : const LinearGradient(
                    colors: [SilkTheme.brand, SilkTheme.brand2]),
            borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
          ),
          child: ElevatedButton(
            onPressed: _loading ? null : _nextStep,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.transparent,
              shadowColor: Colors.transparent,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
              ),
            ),
            child: _loading
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                        strokeWidth: 2.5, color: Colors.white))
                : Text(
                    isLast ? "Yuborish" : "Keyingi",
                    style: const TextStyle(
                        fontSize: 16, fontWeight: FontWeight.w700),
                  ),
          ),
        ),
      ),
    );
  }

  // ========== HELPERS ==========

  Widget _sectionCard({
    required IconData icon,
    required String title,
    String? subtitle,
    required List<Widget> children,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: SilkTheme.surfaceOf(context),
        borderRadius: BorderRadius.circular(SilkTheme.radiusLarge),
        border: Border.all(color: SilkTheme.borderOf(context)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: SilkTheme.brand.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: SilkTheme.brand, size: 20),
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: SilkTheme.inkOf(context),
                    ),
                  ),
                  if (subtitle != null)
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 12,
                        color: SilkTheme.mutedOf(context),
                      ),
                    ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...children,
        ],
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    TextInputType? keyboardType,
    TextCapitalization textCapitalization = TextCapitalization.none,
    bool required = false,
    String? helperText,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: SilkTheme.inkOf(context),
              ),
            ),
            if (required)
              const Text(' *',
                  style: TextStyle(color: SilkTheme.danger, fontSize: 13)),
          ],
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          textCapitalization: textCapitalization,
          style: TextStyle(
              fontSize: 15, color: SilkTheme.inkOf(context)),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(color: SilkTheme.muted2Of(context)),
            helperText: helperText,
            helperStyle: TextStyle(
                fontSize: 11, color: SilkTheme.mutedOf(context)),
            prefixIcon: Icon(icon, color: SilkTheme.brand, size: 20),
            filled: true,
            fillColor: SilkTheme.bgOf(context),
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
              borderSide: BorderSide(color: SilkTheme.borderOf(context)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
              borderSide: BorderSide(color: SilkTheme.borderOf(context)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
              borderSide: const BorderSide(color: SilkTheme.brand, width: 1.5),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSuccessScreen() {
    return Scaffold(
      backgroundColor: SilkTheme.bgOf(context),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 90,
                height: 90,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [SilkTheme.accent, Color(0xFF16A34A)],
                  ),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: SilkTheme.accent.withValues(alpha: 0.3),
                      blurRadius: 20,
                    ),
                  ],
                ),
                child: const Icon(Icons.check_rounded,
                    size: 50, color: Colors.white),
              ),
              const SizedBox(height: 24),
              Text(
                "Muvaffaqiyatli!",
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  color: SilkTheme.inkOf(context),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                "Hisobingiz tayyor!\n\nTelefon raqamingiz va parolingiz bilan\nkirishingiz mumkin.",
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  color: SilkTheme.mutedOf(context),
                  height: 1.6,
                ),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: () => context.go('/login'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: SilkTheme.brand,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                        borderRadius:
                            BorderRadius.circular(SilkTheme.radiusMedium)),
                  ),
                  child: const Text("Kirish sahifasiga",
                      style: TextStyle(
                          fontSize: 16, fontWeight: FontWeight.w600)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
