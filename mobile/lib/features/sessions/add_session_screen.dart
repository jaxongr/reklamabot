import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../config/silk_theme.dart';
import '../../widgets/custom_app_bar.dart';
import 'sessions_provider.dart';

class AddSessionScreen extends ConsumerStatefulWidget {
  const AddSessionScreen({super.key});

  @override
  ConsumerState<AddSessionScreen> createState() => _AddSessionScreenState();
}

class _AddSessionScreenState extends ConsumerState<AddSessionScreen> {
  final _phoneController = TextEditingController();
  final _codeController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _phoneController.dispose();
    _codeController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final addState = ref.watch(addSessionProvider);

    return Scaffold(
      appBar: CustomAppBar(
        title: 'Sessiya qo\'shish',
        showBack: true,
        onBack: () {
          ref.read(addSessionProvider.notifier).reset();
          if (context.canPop()) {
            context.pop();
          } else {
            context.go('/home');
          }
        },
      ),
      backgroundColor: SilkTheme.bg,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Progress indicator
            _buildProgressBar(addState.step),
            const SizedBox(height: 32),

            // Step content
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              child: _buildStepContent(addState),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressBar(AddSessionStep step) {
    final steps = [
      ('Telefon', AddSessionStep.phone),
      ('Kod', AddSessionStep.code),
      ('Sinxron', AddSessionStep.syncing),
      ('Tayyor', AddSessionStep.done),
    ];

    return Row(
      children: steps.asMap().entries.map((entry) {
        final i = entry.key;
        final s = entry.value;
        final isActive = step.index >= s.$2.index;
        final isCurrent = step == s.$2 || (step == AddSessionStep.password && s.$2 == AddSessionStep.code);

        return Expanded(
          child: Row(
            children: [
              if (i > 0)
                Expanded(
                  child: Container(
                    height: 2,
                    color: isActive
                        ? SilkTheme.brand
                        : SilkTheme.border,
                  ),
                ),
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: isActive
                      ? SilkTheme.brand
                      : SilkTheme.border,
                  shape: BoxShape.circle,
                  border: isCurrent
                      ? Border.all(
                          color: SilkTheme.brand,
                          width: 2,
                        )
                      : null,
                ),
                child: Center(
                  child: isActive && step.index > s.$2.index
                      ? const Icon(Icons.check, color: Colors.white, size: 16)
                      : Text(
                          '${i + 1}',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: isActive ? Colors.white : SilkTheme.muted2,
                          ),
                        ),
                ),
              ),
              if (i < steps.length - 1)
                Expanded(
                  child: Container(
                    height: 2,
                    color: step.index > s.$2.index
                        ? SilkTheme.brand
                        : SilkTheme.border,
                  ),
                ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildStepContent(AddSessionState state) {
    switch (state.step) {
      case AddSessionStep.phone:
        return _buildPhoneStep(state);
      case AddSessionStep.code:
        return _buildCodeStep(state);
      case AddSessionStep.password:
        return _buildPasswordStep(state);
      case AddSessionStep.syncing:
        return _buildSyncingStep();
      case AddSessionStep.done:
        return _buildDoneStep();
    }
  }

  Widget _buildPhoneStep(AddSessionState state) {
    return Column(
      key: const ValueKey('phone'),
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Illustration
        Center(
          child: Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              color: SilkTheme.brand.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.phone_android,
              size: 48,
              color: SilkTheme.brand,
            ),
          ),
        ),
        const SizedBox(height: 24),

        const Center(
          child: Text(
            'Telefon raqamni kiriting',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: SilkTheme.ink,
            ),
          ),
        ),
        const SizedBox(height: 8),
        const Center(
          child: Text(
            'Telegram akkountingiz telefon raqamini kiriting.\nShu raqamga tasdiqlash kodi yuboriladi.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: SilkTheme.muted,
            ),
          ),
        ),
        const SizedBox(height: 32),

        TextFormField(
          controller: _phoneController,
          keyboardType: TextInputType.phone,
          style: const TextStyle(fontSize: 18, letterSpacing: 1),
          decoration: InputDecoration(
            labelText: 'Telefon raqam',
            hintText: '+998901234567',
            prefixIcon: const Icon(Icons.phone, color: SilkTheme.brand),
            filled: true,
            fillColor: SilkTheme.surface,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
            ),
          ),
        ),

        if (state.error != null) ...[
          const SizedBox(height: 12),
          _buildErrorBox(state.error!),
        ],

        const SizedBox(height: 24),

        SizedBox(
          height: 52,
          child: ElevatedButton(
            onPressed: state.isLoading
                ? null
                : () {
                    final phone = _phoneController.text.trim();
                    if (phone.isEmpty) return;
                    ref.read(addSessionProvider.notifier).sendPhone(phone);
                  },
            child: state.isLoading
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      color: Colors.white,
                    ),
                  )
                : const Text('Davom etish'),
          ),
        ),
      ],
    );
  }

  Widget _buildCodeStep(AddSessionState state) {
    return Column(
      key: const ValueKey('code'),
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Center(
          child: Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              color: SilkTheme.brand.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.sms_outlined,
              size: 48,
              color: SilkTheme.brand,
            ),
          ),
        ),
        const SizedBox(height: 24),

        const Center(
          child: Text(
            'Tasdiqlash kodi',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: SilkTheme.ink,
            ),
          ),
        ),
        const SizedBox(height: 8),
        Center(
          child: Text(
            'Telegram ${state.phone} raqamiga\ntasdiqlash kodi yuborildi.',
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 14,
              color: SilkTheme.muted,
            ),
          ),
        ),
        const SizedBox(height: 32),

        TextFormField(
          controller: _codeController,
          keyboardType: TextInputType.number,
          style: const TextStyle(
            fontSize: 24,
            letterSpacing: 8,
            fontWeight: FontWeight.w600,
          ),
          textAlign: TextAlign.center,
          maxLength: 6,
          decoration: InputDecoration(
            hintText: '------',
            counterText: '',
            filled: true,
            fillColor: SilkTheme.surface,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
            ),
          ),
        ),

        if (state.error != null) ...[
          const SizedBox(height: 12),
          _buildErrorBox(state.error!),
        ],

        const SizedBox(height: 24),

        SizedBox(
          height: 52,
          child: ElevatedButton(
            onPressed: state.isLoading
                ? null
                : () {
                    final code = _codeController.text.trim();
                    if (code.isEmpty) return;
                    ref.read(addSessionProvider.notifier).sendCode(code);
                  },
            child: state.isLoading
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      color: Colors.white,
                    ),
                  )
                : const Text('Tasdiqlash'),
          ),
        ),
      ],
    );
  }

  Widget _buildPasswordStep(AddSessionState state) {
    return Column(
      key: const ValueKey('password'),
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Center(
          child: Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              color: SilkTheme.accent2.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.lock_outline,
              size: 48,
              color: SilkTheme.accent2,
            ),
          ),
        ),
        const SizedBox(height: 24),

        const Center(
          child: Text(
            'Ikki bosqichli parol',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: SilkTheme.ink,
            ),
          ),
        ),
        const SizedBox(height: 8),
        const Center(
          child: Text(
            'Akkountingizda 2FA yoqilgan.\nIltimos, parolni kiriting.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: SilkTheme.muted,
            ),
          ),
        ),
        const SizedBox(height: 32),

        TextFormField(
          controller: _passwordController,
          obscureText: true,
          decoration: InputDecoration(
            labelText: 'Parol',
            prefixIcon: const Icon(Icons.lock_outline, color: SilkTheme.accent2),
            filled: true,
            fillColor: SilkTheme.surface,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
            ),
          ),
        ),

        if (state.error != null) ...[
          const SizedBox(height: 12),
          _buildErrorBox(state.error!),
        ],

        const SizedBox(height: 24),

        SizedBox(
          height: 52,
          child: ElevatedButton(
            onPressed: state.isLoading
                ? null
                : () {
                    final pw = _passwordController.text.trim();
                    if (pw.isEmpty) return;
                    ref.read(addSessionProvider.notifier).sendPassword(pw);
                  },
            child: state.isLoading
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      color: Colors.white,
                    ),
                  )
                : const Text('Tasdiqlash'),
          ),
        ),
      ],
    );
  }

  Widget _buildSyncingStep() {
    return Column(
      key: const ValueKey('syncing'),
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const SizedBox(height: 40),
        SizedBox(
          width: 80,
          height: 80,
          child: CircularProgressIndicator(
            strokeWidth: 4,
            color: SilkTheme.brand,
            backgroundColor: SilkTheme.brand.withValues(alpha: 0.15),
          ),
        ),
        const SizedBox(height: 32),
        const Text(
          'Guruhlar sinxronlanmoqda...',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: SilkTheme.ink,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Bu bir necha daqiqa vaqt olishi mumkin.\nIltimos, kutib turing.',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 14,
            color: SilkTheme.muted,
          ),
        ),
      ],
    );
  }

  Widget _buildDoneStep() {
    return Column(
      key: const ValueKey('done'),
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: 20),
        Center(
          child: Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              color: SilkTheme.success.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.check_circle,
              size: 56,
              color: SilkTheme.success,
            ),
          ),
        ),
        const SizedBox(height: 24),
        const Center(
          child: Text(
            'Sessiya muvaffaqiyatli ulandi!',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: SilkTheme.ink,
            ),
          ),
        ),
        const SizedBox(height: 8),
        const Center(
          child: Text(
            'Endi siz bu sessiya orqali\nreklama tarqatishingiz mumkin.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: SilkTheme.muted,
            ),
          ),
        ),
        const SizedBox(height: 40),
        SizedBox(
          height: 52,
          child: ElevatedButton(
            onPressed: () {
              ref.read(addSessionProvider.notifier).reset();
              ref.read(sessionsProvider.notifier).loadSessions();
              context.pop();
            },
            child: const Text('Sessiyalarga qaytish'),
          ),
        ),
      ],
    );
  }

  Widget _buildErrorBox(String error) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: SilkTheme.danger.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(SilkTheme.radiusSmall),
        border: Border.all(
          color: SilkTheme.danger.withValues(alpha: 0.3),
        ),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline,
              color: SilkTheme.danger, size: 20),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              error,
              style: const TextStyle(
                fontSize: 13,
                color: SilkTheme.danger,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
