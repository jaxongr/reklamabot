import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/silk_theme.dart';

/// Dispetcher — SMS yuborish sahifasi (SemySMS integratsiya)
class SmsScreen extends ConsumerStatefulWidget {
  const SmsScreen({super.key});

  @override
  ConsumerState<SmsScreen> createState() => _SmsScreenState();
}

class _SmsScreenState extends ConsumerState<SmsScreen> {
  String? _recipient;
  String? _template;
  final _messageController = TextEditingController(
    text: 'Hurmatli mijoz, yangi yuk mavjud. Batafsil: +998 94 564 22 33',
  );
  bool _isSending = false;

  static const _recipients = [
    "Filtrdan o'tgan barcha",
    'Tanlangan kontaktlar',
    'Raqam kiritish',
  ];

  static const _templates = [
    'Yangi yuk mavjud',
    "Narx o'zgardi",
    'Maxsus taklif',
    'Boshqa',
  ];

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _sendSms() async {
    if (_messageController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Xabar matnini kiriting'),
          backgroundColor: SilkTheme.accent2,
        ),
      );
      return;
    }

    setState(() => _isSending = true);

    // TODO: implement actual SemySMS API call
    await Future.delayed(const Duration(seconds: 2));

    setState(() => _isSending = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('SMS muvaffaqiyatli yuborildi'),
          backgroundColor: SilkTheme.success,
        ),
      );
    }
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
        title: const Text('SMS yuborish'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // ── Description ──
          const Text(
            'SemySMS integratsiya orqali SMS xabar yuboring',
            style: TextStyle(
              fontSize: 14,
              color: SilkTheme.muted,
            ),
          ),
          const SizedBox(height: 20),

          // ── Kimga ──
          _buildLabel('Kimga'),
          const SizedBox(height: 6),
          DropdownButtonFormField<String>(
            value: _recipient,
            decoration: const InputDecoration(
              hintText: 'Qabul qiluvchini tanlang',
            ),
            items: _recipients
                .map((r) => DropdownMenuItem(value: r, child: Text(r)))
                .toList(),
            onChanged: (v) => setState(() => _recipient = v),
          ),
          const SizedBox(height: 14),

          // ── Shablon ──
          _buildLabel('Shablon'),
          const SizedBox(height: 6),
          DropdownButtonFormField<String>(
            value: _template,
            decoration: const InputDecoration(
              hintText: 'Shablonni tanlang',
            ),
            items: _templates
                .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                .toList(),
            onChanged: (v) {
              setState(() => _template = v);
              // Update message text based on template
              switch (v) {
                case 'Yangi yuk mavjud':
                  _messageController.text =
                      'Hurmatli mijoz, yangi yuk mavjud. Batafsil: +998 94 564 22 33';
                  break;
                case "Narx o'zgardi":
                  _messageController.text =
                      "Hurmatli mijoz, narx o'zgardi. Batafsil: +998 94 564 22 33";
                  break;
                case 'Maxsus taklif':
                  _messageController.text =
                      'Hurmatli mijoz, siz uchun maxsus taklif! Batafsil: +998 94 564 22 33';
                  break;
                case 'Boshqa':
                  _messageController.text = '';
                  break;
              }
            },
          ),
          const SizedBox(height: 14),

          // ── Xabar matni ──
          _buildLabel('Xabar matni'),
          const SizedBox(height: 6),
          TextFormField(
            controller: _messageController,
            maxLines: 4,
            decoration: const InputDecoration(
              hintText: 'Xabar matnini kiriting...',
            ),
          ),
          const SizedBox(height: 24),

          // ── Yuborish ──
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton.icon(
              onPressed: _isSending ? null : _sendSms,
              icon: _isSending
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(Icons.send, size: 20),
              label: Text(
                _isSending ? 'Yuborilmoqda...' : 'SMS yuborish',
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: SilkTheme.brand,
                foregroundColor: Colors.white,
                disabledBackgroundColor:
                    SilkTheme.brand.withValues(alpha: 0.4),
                disabledForegroundColor: Colors.white70,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
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
