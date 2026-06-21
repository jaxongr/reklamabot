import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../config/silk_theme.dart';
import '../../core/models/support.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/loading_indicator.dart';
import 'support_provider.dart';

/// Combined support/help screen with ticket creation form and ticket list.
class SupportScreen extends ConsumerStatefulWidget {
  const SupportScreen({super.key});

  @override
  ConsumerState<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends ConsumerState<SupportScreen> {
  final _descriptionController = TextEditingController();
  String? _selectedIssueType;
  bool _isSubmitting = false;

  static const _issueTypes = [
    'Ilova xatosi',
    'To\'lov muammosi',
    'Buyurtma bilan muammo',
    'Boshqa',
  ];

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(supportProvider.notifier).loadTickets();
    });
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _submitTicket() async {
    if (_selectedIssueType == null || _selectedIssueType!.isEmpty) {
      _showSnackbar('Muammo turini tanlang', isError: true);
      return;
    }
    final description = _descriptionController.text.trim();
    if (description.isEmpty) {
      _showSnackbar('Tavsifni yozing', isError: true);
      return;
    }

    setState(() => _isSubmitting = true);

    final ticket = await ref
        .read(supportProvider.notifier)
        .createTicket(_selectedIssueType!, description);

    setState(() => _isSubmitting = false);

    if (ticket != null) {
      _descriptionController.clear();
      setState(() => _selectedIssueType = null);
      _showSnackbar('So\'rov muvaffaqiyatli yuborildi');
    } else {
      _showSnackbar('Yuborishda xatolik yuz berdi', isError: true);
    }
  }

  void _showSnackbar(String message, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? SilkTheme.danger : SilkTheme.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final supportState = ref.watch(supportProvider);

    return Scaffold(
      appBar: const CustomAppBar(
        title: 'Qo\'llab-quvvatlash',
        showBack: true,
      ),
      backgroundColor: SilkTheme.bgOf(context),
      body: RefreshIndicator(
        color: SilkTheme.brand,
        onRefresh: () => ref.read(supportProvider.notifier).loadTickets(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header section
              _buildHeader(),

              const SizedBox(height: 24),

              // Issue type dropdown
              _buildDropdown(),

              const SizedBox(height: 14),

              // Description textarea
              TextFormField(
                controller: _descriptionController,
                maxLines: 4,
                decoration: const InputDecoration(
                  hintText: 'Batafsil yozing...',
                  alignLabelWithHint: true,
                ),
              ),

              const SizedBox(height: 16),

              // Submit button
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submitTicket,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: SilkTheme.brand,
                    foregroundColor: Colors.white,
                    disabledBackgroundColor:
                        SilkTheme.brand.withValues(alpha: 0.5),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isSubmitting
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text(
                          'Yuborish',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                ),
              ),

              const SizedBox(height: 24),

              // Submitted tickets header
              Text(
                'Yuborilgan so\'rovlar',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: SilkTheme.inkOf(context),
                ),
              ),

              const SizedBox(height: 12),

              // Tickets list
              _buildTicketsList(supportState),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Center(
      child: Column(
        children: [
          const Text(
            '\u{1F6DF}',
            style: TextStyle(fontSize: 48),
          ),
          const SizedBox(height: 12),
          Text(
            'Qanday yordam kerak?',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: SilkTheme.inkOf(context),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Muammo yoki savolingiz bo\'lsa,\npastdagi formani to\'ldiring.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: SilkTheme.mutedOf(context),
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDropdown() {
    return DropdownButtonFormField<String>(
      value: _selectedIssueType,
      hint: const Text('Muammo turini tanlang'),
      decoration: InputDecoration(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
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
          borderSide: const BorderSide(color: SilkTheme.brand, width: 2),
        ),
        filled: true,
        fillColor: SilkTheme.surfaceOf(context),
      ),
      items: _issueTypes
          .map((type) => DropdownMenuItem(
                value: type,
                child: Text(type),
              ))
          .toList(),
      onChanged: (value) {
        setState(() => _selectedIssueType = value);
      },
    );
  }

  Widget _buildTicketsList(SupportState supportState) {
    if (supportState.isLoading && supportState.tickets.isEmpty) {
      return const ShimmerLoading(itemCount: 3, itemHeight: 80);
    }

    if (supportState.tickets.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 24),
        child: Center(
          child: Text(
            'Hozircha so\'rovlar yo\'q',
            style: TextStyle(
              fontSize: 14,
              color: SilkTheme.mutedOf(context),
            ),
          ),
        ),
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: supportState.tickets.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final ticket = supportState.tickets[index];
        return _TicketCard(
          ticket: ticket,
          onTap: () {
            ref.read(supportProvider.notifier).setCurrentTicket(ticket);
            context.push('/support/${ticket.id}');
          },
        );
      },
    );
  }
}

/// A ticket card with status badge.
class _TicketCard extends StatelessWidget {
  final SupportTicket ticket;
  final VoidCallback onTap;

  const _TicketCard({required this.ticket, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final dateStr = DateFormat('dd.MM.yyyy').format(ticket.createdAt);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: SilkTheme.surfaceOf(context),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: SilkTheme.borderOf(context)),
        ),
        child: Row(
          children: [
            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    ticket.subject,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: SilkTheme.inkOf(context),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    dateStr,
                    style: TextStyle(
                      fontSize: 12,
                      color: SilkTheme.mutedOf(context),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(width: 12),

            // Status badge
            _buildStatusBadge(context, ticket.status),

            const SizedBox(width: 8),

            Icon(
              Icons.chevron_right,
              size: 18,
              color: SilkTheme.mutedOf(context),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(BuildContext context, String status) {
    Color color;
    String label;

    switch (status) {
      case 'OPEN':
        color = SilkTheme.accent2;
        label = 'Ko\'rilmoqda';
        break;
      case 'IN_PROGRESS':
        color = SilkTheme.brand;
        label = 'Jarayonda';
        break;
      case 'RESOLVED':
        color = SilkTheme.success;
        label = 'Hal qilindi';
        break;
      case 'CLOSED':
        color = SilkTheme.mutedOf(context);
        label = 'Yopilgan';
        break;
      default:
        color = SilkTheme.mutedOf(context);
        label = status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}
