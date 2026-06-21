import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../core/providers/providers.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});
  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _phoneCtrl = TextEditingController();
  final _codeCtrl = TextEditingController();
  bool _codeSent = false;
  bool _loading = false;
  String? _error;

  Future<void> _requestCode() async {
    setState(() { _loading = true; _error = null; });
    try {
      await ref.read(authServiceProvider).requestCode(_phoneCtrl.text.trim());
      setState(() { _codeSent = true; _loading = false; });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Kod yuborildi (administratordan so\'rang)')));
    } catch (e) {
      setState(() { _error = _cleanError(e); _loading = false; });
    }
  }

  Future<void> _login() async {
    setState(() { _loading = true; _error = null; });
    try {
      final result = await ref.read(authServiceProvider).login(_phoneCtrl.text.trim(), _codeCtrl.text.trim());
      ref.read(dispatcherProvider.notifier).setDispatcher(result['dispatcher']);
      if (!mounted) return;
      context.go('/permissions');
    } catch (e) {
      setState(() { _error = _cleanError(e); _loading = false; });
    }
  }

  String _cleanError(dynamic e) {
    final s = e.toString();
    if (s.contains('404')) return 'Server topilmadi';
    if (s.contains('timeout')) return 'Internet aloqasi sekin';
    final match = RegExp(r'message":"([^"]+)"').firstMatch(s);
    if (match != null) return match.group(1)!;
    return 'Xatolik yuz berdi';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppTheme.primaryGradient),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 80, height: 80,
                    decoration: BoxDecoration(gradient: AppTheme.accentGradient,
                      borderRadius: BorderRadius.circular(20)),
                    child: const Icon(Icons.phone_in_talk_outlined, color: Colors.white, size: 44),
                  ),
                  const SizedBox(height: 20),
                  const Text("YO'LDA", style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900, letterSpacing: 4)),
                  const Text("DISPATCHER", style: TextStyle(color: AppTheme.accent, fontSize: 12, letterSpacing: 6, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 48),
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
                    child: Column(
                      children: [
                        const Align(alignment: Alignment.centerLeft,
                          child: Text('Telefon raqam', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14))),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _phoneCtrl, keyboardType: TextInputType.phone,
                          enabled: !_codeSent && !_loading,
                          decoration: const InputDecoration(hintText: '+998901234567',
                            prefixIcon: Icon(Icons.phone_outlined)),
                        ),
                        if (_codeSent) ...[
                          const SizedBox(height: 16),
                          const Align(alignment: Alignment.centerLeft,
                            child: Text('Tasdiqlash kodi', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14))),
                          const SizedBox(height: 8),
                          TextField(
                            controller: _codeCtrl, keyboardType: TextInputType.number,
                            enabled: !_loading,
                            decoration: const InputDecoration(hintText: '123456',
                              prefixIcon: Icon(Icons.lock_outline)),
                          ),
                        ],
                        if (_error != null) ...[
                          const SizedBox(height: 12),
                          Text(_error!, style: const TextStyle(color: AppTheme.errorColor, fontSize: 13)),
                        ],
                        const SizedBox(height: 20),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _loading ? null : (_codeSent ? _login : _requestCode),
                            child: _loading
                              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                              : Text(_codeSent ? 'Kirish' : 'Kod yuborish'),
                          ),
                        ),
                        if (_codeSent) ...[
                          const SizedBox(height: 8),
                          TextButton(
                            onPressed: () => setState(() { _codeSent = false; _codeCtrl.clear(); }),
                            child: const Text('Boshqa raqam kiritish'),
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
