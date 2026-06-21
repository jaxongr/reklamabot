import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../config/api_config.dart';
import '../../config/silk_theme.dart';
import '../../core/api/api_client.dart';

// O'zbekiston shaharlari
const _cities = [
  'Toshkent', 'Samarqand', 'Buxoro', 'Navoiy', 'Andijon',
  "Farg'ona", 'Namangan', 'Qarshi', 'Termiz', 'Nukus',
  'Urganch', 'Jizzax', 'Guliston', 'Chirchiq', 'Olmaliq',
  'Angren', 'Shahrisabz', 'Denov', 'Kattaqorgon', "Qo'qon",
  "Marg'ilon", 'Quvasoy', 'Rishton', 'Chust', 'Pop',
  'Xiva', 'Urgut', 'Kitob', "Yakkabog'", 'Chiroqchi',
  'Buvayda', 'Yozyovon', "Qo'rg'ontepa", 'Bekobod', 'Nurafshon',
  'Ohangaron', 'Yangiyul', 'Chinoz', 'Sergeli', 'Parkent',
  'Kogon', 'Muborak', 'Navbahor', 'Nurota', 'Zarafshon',
  'Gazli', 'Turtkul', "Qo'ng'irot", 'Kungrad', 'Xonqa',
  'Shovot', 'Gurlan', 'Asaka', 'Xonobod', 'Baliqchi',
  'Oltiariq', 'Toshloq', 'Yangiyer', 'Boyovut', 'Mirzaobod',
  'Sardoba', 'Hovos', 'Zomin', 'Forish', 'Dashtobod',
  'Boysun', 'Sherobod', "Sho'rchi", "Jarqo'rg'on", 'Koson',
  'Romitan', 'Jondor', 'Shofirkon', "G'ijduvon", 'Peshku',
  'Vodil', 'Begavot', "Dehqonobod", 'Qamashi', 'Narpay',
  'Jomboy', 'Toyloq', 'Ishtixon', 'Pastdarg\'om', 'Chelak',
  'Gagarin', 'Konimex', 'Oqoltin', 'Oltinsoy',
  // Xorijiy
  'Moskva', 'Shymkent', 'Saryagash', 'Almaty', 'Bishkek',
  'Dushanbe', 'Khujand', 'Polsha', 'Belarus', 'Krasnodar',
];

/// Summa formatlash — 1000 ajratgich
class _ThousandFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(TextEditingValue old, TextEditingValue newValue) {
    final text = newValue.text.replaceAll(' ', '');
    if (text.isEmpty) return newValue;
    if (int.tryParse(text) == null) return old;
    final formatted = _format(text);
    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }

  static String _format(String digits) {
    final buf = StringBuffer();
    for (var i = 0; i < digits.length; i++) {
      if (i > 0 && (digits.length - i) % 3 == 0) buf.write(' ');
      buf.write(digits[i]);
    }
    return buf.toString();
  }
}

/// Dispetcher — E'lon yaratish (haydovchilar ko'radi)
class CreateAdScreen extends ConsumerStatefulWidget {
  const CreateAdScreen({super.key});

  @override
  ConsumerState<CreateAdScreen> createState() => _CreateAdScreenState();
}

class _CreateAdScreenState extends ConsumerState<CreateAdScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleCtrl = TextEditingController();
  final _contentCtrl = TextEditingController();
  final _fromCtrl = TextEditingController();
  final _toCtrl = TextEditingController();
  final _weightCtrl = TextEditingController();
  final _priceCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  String? _vehicleType;
  bool _isSubmitting = false;

  static const _phoneKey = 'dispatcher_phone';

  static const _vehicleTypes = [
    'Tentli', 'Refrijerator', 'Bortli', 'Konteyner', 'Samosval',
    'Fura', 'Kamaz', 'MAN', 'HOWO', 'Isuzu', 'Gazel', 'Porter', 'Labo',
    'Scania', 'Volvo', 'DAF', 'Mercedes', 'Shacman', 'Dongfeng',
  ];

  @override
  void initState() {
    super.initState();
    _loadSavedPhone();
  }

  Future<void> _loadSavedPhone() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(_phoneKey);
    if (saved != null && saved.isNotEmpty) {
      _phoneCtrl.text = saved;
    }
  }

  Future<void> _savePhone(String phone) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_phoneKey, phone);
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    _contentCtrl.dispose();
    _fromCtrl.dispose();
    _toCtrl.dispose();
    _weightCtrl.dispose();
    _priceCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);
    try {
      final api = ref.read(apiClientProvider);
      final priceRaw = _priceCtrl.text.replaceAll(' ', '').trim();
      final phone = _phoneCtrl.text.trim();

      // Telefon raqamni saqlash (keyingi safar avtomatik to'ldiriladi)
      if (phone.isNotEmpty) _savePhone(phone);

      // Content'ga telefon raqamni qo'shish
      var content = _contentCtrl.text.trim().isEmpty ? _titleCtrl.text.trim() : _contentCtrl.text.trim();
      if (phone.isNotEmpty) content += '\nTel: $phone';

      await api.post(ApiConfig.ads, data: {
        'title': _titleCtrl.text.trim(),
        'content': content,
        'cargoFrom': _fromCtrl.text.trim(),
        'cargoTo': _toCtrl.text.trim(),
        'vehicleType': _vehicleType,
        'cargoWeight': _weightCtrl.text.trim().isEmpty ? null : _weightCtrl.text.trim(),
        'price': priceRaw.isEmpty ? null : priceRaw,
        'status': 'ACTIVE',
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("E'lon muvaffaqiyatli yaratildi!"),
            backgroundColor: SilkTheme.success,
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("Xatolik: ${e.toString().length > 80 ? e.toString().substring(0, 80) : e}"),
            backgroundColor: SilkTheme.danger,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  bool get _hasInput =>
      _titleCtrl.text.trim().isNotEmpty ||
      _contentCtrl.text.trim().isNotEmpty ||
      _fromCtrl.text.trim().isNotEmpty ||
      _toCtrl.text.trim().isNotEmpty;

  Future<bool> _onWillPop() async {
    if (!_hasInput) return true;
    final result = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text("Chiqishni xohlaysizmi?"),
        content: const Text("Kiritilgan ma'lumotlar saqlanmaydi."),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text("Yo'q, qolaman"),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text("Ha, chiqaman", style: TextStyle(color: SilkTheme.danger)),
          ),
        ],
      ),
    );
    return result ?? false;
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (didPop) return;
        final shouldPop = await _onWillPop();
        if (shouldPop && mounted) Navigator.pop(context);
      },
      child: Scaffold(
      backgroundColor: SilkTheme.bgOf(context),
      appBar: AppBar(
        backgroundColor: SilkTheme.surfaceOf(context),
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20),
          onPressed: () async {
            final shouldPop = await _onWillPop();
            if (shouldPop && mounted) Navigator.pop(context);
          },
        ),
        title: const Text("E'lon yaratish"),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: SilkTheme.brand.withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: SilkTheme.brand.withValues(alpha: 0.15)),
              ),
              child: Row(
                children: [
                  Icon(Icons.campaign_rounded, color: SilkTheme.brand, size: 24),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      "Bu e'lon haydovchilar ilovasida ko'rinadi",
                      style: TextStyle(
                        fontSize: 13,
                        color: SilkTheme.mutedOf(context),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Sarlavha
            _label("Sarlavha"),
            const SizedBox(height: 6),
            TextFormField(
              controller: _titleCtrl,
              decoration: _inputDecor("Masalan: Toshkent-Buxoro yuk bor"),
              validator: (v) => (v == null || v.trim().isEmpty) ? "Sarlavha kiriting" : null,
            ),

            const SizedBox(height: 14),

            // Batafsil
            _label("Batafsil ma'lumot"),
            const SizedBox(height: 6),
            TextFormField(
              controller: _contentCtrl,
              maxLines: 3,
              decoration: _inputDecor("Yuk haqida batafsil yozing..."),
            ),

            const SizedBox(height: 14),

            // Qayerdan → Qayerga (Autocomplete)
            Row(
              children: [
                Expanded(child: _cityField("Qayerdan", _fromCtrl, required: true)),
                Padding(
                  padding: const EdgeInsets.only(top: 22, left: 8, right: 8),
                  child: Icon(Icons.arrow_forward, color: SilkTheme.muted2Of(context), size: 20),
                ),
                Expanded(child: _cityField("Qayerga", _toCtrl, required: true)),
              ],
            ),

            const SizedBox(height: 14),

            // Telefon raqam
            _label("Telefon raqam"),
            const SizedBox(height: 6),
            TextFormField(
              controller: _phoneCtrl,
              keyboardType: TextInputType.phone,
              decoration: _inputDecor("+998 90 123 45 67").copyWith(
                prefixIcon: const Icon(Icons.phone_outlined, size: 20),
                suffixIcon: _phoneCtrl.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.check_circle, color: SilkTheme.success, size: 20),
                        onPressed: null,
                      )
                    : null,
              ),
              validator: (v) => (v == null || v.trim().isEmpty) ? "Telefon raqam kiriting" : null,
            ),

            const SizedBox(height: 14),

            // Mashina turi
            _label("Mashina turi"),
            const SizedBox(height: 6),
            DropdownButtonFormField<String>(
              value: _vehicleType,
              decoration: _inputDecor("Tanlang"),
              items: _vehicleTypes.map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
              onChanged: (v) => setState(() => _vehicleType = v),
            ),

            const SizedBox(height: 14),

            // Og'irlik + Narx
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _label("Og'irligi (tonna)"),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: _weightCtrl,
                        keyboardType: TextInputType.number,
                        decoration: _inputDecor("25"),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _label("Narxi (so'm)"),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: _priceCtrl,
                        keyboardType: TextInputType.number,
                        inputFormatters: [
                          FilteringTextInputFormatter.allow(RegExp(r'[\d ]')),
                          _ThousandFormatter(),
                        ],
                        decoration: _inputDecor("5 000 000"),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),
          ],
        ),
      ),
      // Tugma pastda — klaviatura va navigation bar ustida
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
          child: SizedBox(
            height: 50,
            child: ElevatedButton(
              onPressed: _isSubmitting ? null : _submit,
              style: ElevatedButton.styleFrom(
                backgroundColor: SilkTheme.brand,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: _isSubmitting
                  ? const SizedBox(
                      width: 22, height: 22,
                      child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white),
                    )
                  : const Text(
                      "E'lon yaratish",
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                    ),
            ),
          ),
        ),
      ),
      ),  // PopScope yopish
    );
  }

  /// Shahar autocomplete field
  Widget _cityField(String label, TextEditingController ctrl, {bool required = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _label(label),
        const SizedBox(height: 6),
        Autocomplete<String>(
          optionsBuilder: (textEditingValue) {
            final q = textEditingValue.text.toLowerCase().trim();
            if (q.isEmpty) return const Iterable<String>.empty();
            return _cities.where((c) => c.toLowerCase().contains(q));
          },
          onSelected: (v) => ctrl.text = v,
          fieldViewBuilder: (context, textCtrl, focusNode, onFieldSubmitted) {
            // Sync controllers
            textCtrl.text = ctrl.text;
            textCtrl.addListener(() {
              if (ctrl.text != textCtrl.text) ctrl.text = textCtrl.text;
            });
            return TextFormField(
              controller: textCtrl,
              focusNode: focusNode,
              decoration: _inputDecor("Shahar"),
              validator: required ? (v) => (v == null || v.trim().isEmpty) ? "Kiriting" : null : null,
              onFieldSubmitted: (_) => onFieldSubmitted(),
            );
          },
          optionsViewBuilder: (context, onSelected, options) {
            return Align(
              alignment: Alignment.topLeft,
              child: Material(
                elevation: 4,
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  constraints: const BoxConstraints(maxHeight: 200, maxWidth: 250),
                  decoration: BoxDecoration(
                    color: SilkTheme.surfaceOf(context),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: SilkTheme.borderOf(context)),
                  ),
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    shrinkWrap: true,
                    itemCount: options.length,
                    itemBuilder: (_, i) {
                      final opt = options.elementAt(i);
                      return ListTile(
                        dense: true,
                        visualDensity: VisualDensity.compact,
                        leading: Icon(Icons.location_on_outlined, size: 18, color: SilkTheme.brand),
                        title: Text(opt, style: const TextStyle(fontSize: 14)),
                        onTap: () => onSelected(opt),
                      );
                    },
                  ),
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _label(String text) => Text(
    text,
    style: TextStyle(
      fontSize: 13,
      fontWeight: FontWeight.w600,
      color: SilkTheme.inkOf(context),
    ),
  );

  InputDecoration _inputDecor(String hint) => InputDecoration(
    hintText: hint,
    hintStyle: TextStyle(color: SilkTheme.muted2Of(context)),
    filled: true,
    fillColor: SilkTheme.surfaceOf(context),
    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: BorderSide(color: SilkTheme.borderOf(context)),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: BorderSide(color: SilkTheme.borderOf(context)),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: SilkTheme.brand, width: 1.5),
    ),
  );
}
