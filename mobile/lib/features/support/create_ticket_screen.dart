import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../config/theme.dart';
import '../../widgets/custom_app_bar.dart';
import 'support_provider.dart';

class CreateTicketScreen extends ConsumerStatefulWidget {
  const CreateTicketScreen({super.key});

  @override
  ConsumerState<CreateTicketScreen> createState() => _CreateTicketScreenState();
}

class _CreateTicketScreenState extends ConsumerState<CreateTicketScreen> {
  final _formKey = GlobalKey<FormState>();
  final _subjectController = TextEditingController();
  final _descriptionController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _subjectController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(
        title: 'Yangi tiket',
        showBack: true,
      ),
      backgroundColor: AppTheme.backgroundColor,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Info card
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppTheme.infoColor.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                  border: Border.all(
                    color: AppTheme.infoColor.withValues(alpha: 0.2),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.info_outline,
                      size: 20,
                      color: AppTheme.infoColor,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Muammo yoki savolingizni batafsil yozing. '
                        'Biz tez orada javob beramiz.',
                        style: TextStyle(
                          fontSize: 13,
                          color: AppTheme.infoColor,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Subject field
              Text(
                'Mavzu',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _subjectController,
                textCapitalization: TextCapitalization.sentences,
                decoration: const InputDecoration(
                  hintText: 'Masalan: To\'lov muammosi',
                  prefixIcon: Icon(
                    Icons.subject,
                    color: AppTheme.textHint,
                    size: 20,
                  ),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Mavzuni kiriting';
                  }
                  if (value.trim().length < 3) {
                    return 'Mavzu kamida 3 ta belgidan iborat bo\'lishi kerak';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 20),

              // Description field
              Text(
                'Tavsif',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _descriptionController,
                textCapitalization: TextCapitalization.sentences,
                maxLines: 6,
                minLines: 4,
                decoration: const InputDecoration(
                  hintText: 'Muammoingizni batafsil tavsiflang...',
                  alignLabelWithHint: true,
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Tavsifni kiriting';
                  }
                  if (value.trim().length < 10) {
                    return 'Tavsif kamida 10 ta belgidan iborat bo\'lishi kerak';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 32),

              // Submit button
              SizedBox(
                height: 50,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submitTicket,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.white,
                    disabledBackgroundColor:
                        AppTheme.primaryColor.withValues(alpha: 0.5),
                    shape: RoundedRectangleBorder(
                      borderRadius:
                          BorderRadius.circular(AppTheme.radiusMedium),
                    ),
                  ),
                  child: _isSubmitting
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            color: Colors.white,
                          ),
                        )
                      : const Text(
                          'Tiket yaratish',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _submitTicket() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    final ticket = await ref.read(supportProvider.notifier).createTicket(
          _subjectController.text.trim(),
          _descriptionController.text.trim(),
        );

    if (mounted) {
      setState(() => _isSubmitting = false);

      if (ticket != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Tiket muvaffaqiyatli yaratildi'),
            backgroundColor: AppTheme.successColor,
          ),
        );
        context.pop();
      } else {
        final error = ref.read(supportProvider).error;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error ?? 'Tiket yaratishda xatolik'),
            backgroundColor: AppTheme.errorColor,
          ),
        );
      }
    }
  }
}
