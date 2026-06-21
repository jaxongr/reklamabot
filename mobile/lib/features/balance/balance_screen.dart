import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';

import '../../config/silk_theme.dart';
import '../../core/api/api_client.dart';
import '../../core/models/balance.dart';
import '../../widgets/app_scaffold.dart';
import '../../widgets/silk/hero_card.dart';
import '../../widgets/silk/silk_section_head.dart';
import '../../widgets/silk/silk_tabs.dart';
import 'balance_provider.dart';

/// Balans — bottom nav tab screen (Silk Road style).
class BalanceScreen extends ConsumerStatefulWidget {
  const BalanceScreen({super.key});

  @override
  ConsumerState<BalanceScreen> createState() => _BalanceScreenState();
}

class _BalanceScreenState extends ConsumerState<BalanceScreen> {
  String _txFilter = 'Barchasi';

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(balanceProvider.notifier).loadBalance();
      ref.read(balanceProvider.notifier).loadTransactions();
    });
  }

  Future<void> _onRefresh() async {
    await ref.read(balanceProvider.notifier).loadBalance();
    await ref.read(balanceProvider.notifier).loadTransactions();
  }

  String _formatNumber(num amount) {
    final intAmount = amount.toInt().abs();
    final s = intAmount.toString();
    final buf = StringBuffer();
    final len = s.length;
    for (var i = 0; i < len; i++) {
      if (i > 0 && (len - i) % 3 == 0) buf.write(' ');
      buf.write(s[i]);
    }
    return buf.toString();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(balanceProvider);
    final bg = SilkTheme.bgOf(context);
    final surface = SilkTheme.surfaceOf(context);
    final border = SilkTheme.borderOf(context);
    final ink = SilkTheme.inkOf(context);
    final muted = SilkTheme.mutedOf(context);

    // Income/expense aggregation
    double income = 0, expense = 0;
    for (final tx in state.transactions) {
      if (tx.isCredit) {
        income += tx.amount.abs();
      } else {
        expense += tx.amount.abs();
      }
    }

    // Filtered list
    final filtered = switch (_txFilter) {
      'Kirim' => state.transactions.where((t) => t.isCredit).toList(),
      'Chiqim' => state.transactions.where((t) => !t.isCredit).toList(),
      _ => state.transactions,
    };

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: bg,
        elevation: 0,
        scrolledUnderElevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: Icon(Icons.menu, color: ink),
          onPressed: () {
            ref.read(scaffoldKeyProvider).currentState?.openDrawer();
          },
        ),
        title: Text('Balans', style: SilkTheme.screenTitle(context)),
      ),
      body: state.isLoading && state.transactions.isEmpty
          ? Center(
              child: CircularProgressIndicator(
                color: SilkTheme.brandOf(context),
              ),
            )
          : RefreshIndicator(
              color: SilkTheme.brandOf(context),
              onRefresh: _onRefresh,
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: EdgeInsets.zero,
                children: [
                  // ── Hero balance card ──
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 4, 20, 0),
                    child: HeroCard(
                      label: 'Joriy balans',
                      balance: state.balance.toInt(),
                      onRefill: _showTopUpSheet,
                    ),
                  ),

                  // ── Summary grid (Kirim + Chiqim) ──
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Row(
                      children: [
                        Expanded(
                          child: _summaryCard(
                            context,
                            label: 'KIRIM',
                            amount: _formatNumber(income),
                            icon: Icons.arrow_downward_rounded,
                            color: SilkTheme.successOf(context),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _summaryCard(
                            context,
                            label: 'CHIQIM',
                            amount: _formatNumber(expense),
                            icon: Icons.arrow_upward_rounded,
                            color: SilkTheme.dangerOf(context),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 28),

                  // ── Section head ──
                  SilkSectionHead(
                    title: 'Tranzaksiyalar',
                    sub: '${filtered.length} ta yozuv',
                  ),

                  const SizedBox(height: 16),

                  // ── Pill tabs ──
                  SilkPillTabs(
                    tabs: const ['Barchasi', 'Kirim', 'Chiqim'],
                    value: _txFilter,
                    onChanged: (v) => setState(() => _txFilter = v),
                  ),

                  const SizedBox(height: 16),

                  // ── Transactions list ──
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
                    child: filtered.isEmpty
                        ? _emptyTransactions(context)
                        : Container(
                            decoration: BoxDecoration(
                              color: surface,
                              borderRadius:
                                  BorderRadius.circular(SilkTheme.radiusCard),
                              border: Border.all(color: border, width: 1),
                            ),
                            child: Column(
                              children: [
                                for (var i = 0; i < filtered.length; i++) ...[
                                  if (i > 0)
                                    Divider(
                                      height: 1,
                                      thickness: 1,
                                      color: border,
                                    ),
                                  _transactionRow(
                                    context,
                                    filtered[i],
                                    muted: muted,
                                  ),
                                ],
                              ],
                            ),
                          ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _summaryCard(
    BuildContext context, {
    required String label,
    required String amount,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: SilkTheme.surfaceOf(context),
        borderRadius: BorderRadius.circular(SilkTheme.radiusLarge + 2),
        border: Border.all(color: SilkTheme.borderOf(context), width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                alignment: Alignment.center,
                child: Icon(icon, size: 15, color: color),
              ),
              const SizedBox(width: 8),
              Text(
                label,
                style: SilkTheme.label(context).copyWith(
                  letterSpacing: 1.2,
                  color: SilkTheme.muted2Of(context),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Flexible(
                child: Text(
                  amount,
                  overflow: TextOverflow.ellipsis,
                  style: SilkTheme.display(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: SilkTheme.inkOf(context),
                    letterSpacing: -0.4,
                  ),
                ),
              ),
              const SizedBox(width: 4),
              Padding(
                padding: const EdgeInsets.only(bottom: 3),
                child: Text(
                  "so'm",
                  style: SilkTheme.body(
                    fontSize: 11,
                    color: SilkTheme.muted2Of(context),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _transactionRow(
    BuildContext context,
    BalanceTransaction tx, {
    required Color muted,
  }) {
    final isCredit = tx.isCredit;
    final color = isCredit
        ? SilkTheme.successOf(context)
        : SilkTheme.dangerOf(context);
    final icon = isCredit
        ? Icons.arrow_downward_rounded
        : Icons.arrow_upward_rounded;
    final prefix = isCredit ? '+' : '-';
    final amountStr = _formatNumber(tx.amount.abs());
    final dateStr = DateFormat('dd.MM.yyyy HH:mm').format(tx.createdAt);
    final label = tx.description ?? tx.reason ?? tx.typeLabel;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          // Icon bubble
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            alignment: Alignment.center,
            child: Icon(icon, color: color, size: 16),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: SilkTheme.cardName(context).copyWith(fontSize: 13),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  dateStr,
                  style: SilkTheme.body(
                    fontSize: 11,
                    color: SilkTheme.muted2Of(context),
                  ),
                ),
              ],
            ),
          ),
          Text(
            "$prefix$amountStr so'm",
            style: SilkTheme.mono(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _emptyTransactions(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(32),
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: SilkTheme.surfaceOf(context),
        borderRadius: BorderRadius.circular(SilkTheme.radiusCard),
        border: Border.all(color: SilkTheme.borderOf(context), width: 1),
      ),
      child: Column(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: SilkTheme.softOf(context),
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.receipt_long_outlined,
              size: 28,
              color: SilkTheme.muted2Of(context),
            ),
          ),
          const SizedBox(height: 14),
          Text(
            "Tranzaksiyalar yo'q",
            style: SilkTheme.cardName(context).copyWith(fontSize: 15),
          ),
          const SizedBox(height: 4),
          Text(
            'Hozircha hech qanday tranzaksiya mavjud emas',
            style: SilkTheme.body(
              fontSize: 12,
              color: SilkTheme.mutedOf(context),
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  void _showTopUpSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _TopUpPaymentSheet(
        onSuccess: () {
          ref.read(balanceProvider.notifier).loadBalance();
        },
        apiClient: ref.read(apiClientProvider),
      ),
    );
  }
}

/// Balans to'ldirish — chek yuklash bilan (Silk Road style)
class _TopUpPaymentSheet extends StatefulWidget {
  final VoidCallback onSuccess;
  final ApiClient apiClient;

  const _TopUpPaymentSheet({required this.onSuccess, required this.apiClient});

  @override
  State<_TopUpPaymentSheet> createState() => _TopUpPaymentSheetState();
}

class _TopUpPaymentSheetState extends State<_TopUpPaymentSheet> {
  final _amountController = TextEditingController();
  File? _receipt;
  bool _sending = false;

  Future<void> _pickImage() async {
    final source = await showDialog<ImageSource>(
      context: context,
      builder: (c) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(SilkTheme.radiusCard),
        ),
        backgroundColor: SilkTheme.surfaceOf(context),
        title: Text(
          'Chek yuklash',
          style: SilkTheme.display(
            fontSize: 17,
            fontWeight: FontWeight.w600,
            color: SilkTheme.inkOf(context),
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: Icon(Icons.camera_alt_outlined,
                  color: SilkTheme.brandOf(context)),
              title: const Text('Kameradan'),
              onTap: () => Navigator.pop(c, ImageSource.camera),
            ),
            ListTile(
              leading: Icon(Icons.photo_library_outlined,
                  color: SilkTheme.brandOf(context)),
              title: const Text('Galereyadan'),
              onTap: () => Navigator.pop(c, ImageSource.gallery),
            ),
          ],
        ),
      ),
    );
    if (source == null) return;
    final xfile = await ImagePicker()
        .pickImage(source: source, maxWidth: 1200, imageQuality: 85);
    if (xfile != null) setState(() => _receipt = File(xfile.path));
  }

  Future<void> _submit() async {
    final amount = double.tryParse(_amountController.text);
    if (amount == null || amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("To'g'ri summa kiriting")),
      );
      return;
    }
    if (_receipt == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Chek rasmini yuklang")),
      );
      return;
    }

    setState(() => _sending = true);
    try {
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(
          _receipt!.path,
          filename: 'chek_${DateTime.now().millisecondsSinceEpoch}.jpg',
        ),
      });
      final uploadRes =
          await widget.apiClient.post('/upload/receipt', data: formData);
      final receiptUrl = uploadRes.data is Map
          ? (uploadRes.data['url'] ?? uploadRes.data['path'])
          : uploadRes.data?.toString();

      await widget.apiClient.post('/payments', data: {
        'amount': amount,
        'planType': 'STARTER',
        'receiptImage': receiptUrl,
      });

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
                "To'lov yuborildi! Admin tekshirib tasdiqlagandan keyin balans to'ldiriladi."),
            duration: Duration(seconds: 4),
          ),
        );
        widget.onSuccess();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _sending = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Xatolik: $e")),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final surface = SilkTheme.surfaceOf(context);
    final border = SilkTheme.borderOf(context);
    final ink = SilkTheme.inkOf(context);
    final bg = SilkTheme.bgOf(context);
    final brand = SilkTheme.brandOf(context);

    return DraggableScrollableSheet(
      initialChildSize: 0.78,
      minChildSize: 0.4,
      maxChildSize: 0.95,
      builder: (context, sc) => Container(
        decoration: BoxDecoration(
          color: bg,
          borderRadius: const BorderRadius.vertical(
            top: Radius.circular(SilkTheme.radiusHero),
          ),
          border: Border(top: BorderSide(color: border)),
        ),
        child: ListView(
          controller: sc,
          padding: EdgeInsets.fromLTRB(
              20, 0, 20, MediaQuery.of(context).viewInsets.bottom + 24),
          children: [
            // Drag handle
            Center(
              child: Container(
                margin: const EdgeInsets.only(top: 12, bottom: 20),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),

            Text(
              "Balansni to'ldirish",
              style: SilkTheme.display(
                fontSize: 22,
                fontWeight: FontWeight.w600,
                color: ink,
                letterSpacing: -0.22,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Chek rasmini yuklang — admin tasdiqlaydi',
              style: SilkTheme.body(
                fontSize: 12,
                color: SilkTheme.mutedOf(context),
              ),
            ),
            const SizedBox(height: 18),

            // Karta raqamlari
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: surface,
                borderRadius: BorderRadius.circular(SilkTheme.radiusLarge),
                border: Border.all(color: border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "TO'LOV UCHUN KARTA",
                    style: SilkTheme.label(context).copyWith(letterSpacing: 1.2),
                  ),
                  const SizedBox(height: 10),
                  _cardTile('Uzcard', '8600 1234 5678 9012'),
                  const SizedBox(height: 6),
                  _cardTile('Humo', '9860 1234 5678 9012'),
                  const SizedBox(height: 10),
                  Text(
                    "Karta egasi: Yo'lda LLC",
                    style: SilkTheme.body(
                      fontSize: 11,
                      color: SilkTheme.muted2Of(context),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Summa
            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'Summa (UZS)',
                prefixIcon: const Icon(Icons.payments_outlined),
                hintText: '50 000',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(SilkTheme.radiusBtn),
                ),
              ),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              children: [10000, 50000, 100000, 200000]
                  .map(
                    (a) => ActionChip(
                      label: Text('${(a ~/ 1000)}k'),
                      onPressed: () =>
                          _amountController.text = a.toString(),
                      backgroundColor: surface,
                      side: BorderSide(color: border),
                    ),
                  )
                  .toList(),
            ),

            const SizedBox(height: 16),

            // Chek yuklash
            GestureDetector(
              onTap: _pickImage,
              child: Container(
                height: _receipt != null ? 200 : 110,
                decoration: BoxDecoration(
                  color: surface,
                  borderRadius: BorderRadius.circular(SilkTheme.radiusLarge),
                  border: Border.all(
                    color: _receipt != null
                        ? SilkTheme.successOf(context)
                        : border,
                    width: _receipt != null ? 2 : 1,
                  ),
                ),
                child: _receipt != null
                    ? ClipRRect(
                        borderRadius:
                            BorderRadius.circular(SilkTheme.radiusLarge - 2),
                        child: Stack(
                          children: [
                            Image.file(
                              _receipt!,
                              width: double.infinity,
                              height: 200,
                              fit: BoxFit.cover,
                            ),
                            Positioned(
                              top: 8,
                              right: 8,
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: BoxDecoration(
                                  color: SilkTheme.successOf(context),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.check_rounded,
                                  size: 14,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ],
                        ),
                      )
                    : Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.cloud_upload_outlined,
                            size: 34,
                            color: SilkTheme.mutedOf(context),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            "Chek rasmini yuklang",
                            style: SilkTheme.body(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: SilkTheme.mutedOf(context),
                            ),
                          ),
                        ],
                      ),
              ),
            ),

            const SizedBox(height: 20),

            SizedBox(
              height: 52,
              child: ElevatedButton(
                onPressed: _sending ? null : (_receipt != null ? _submit : null),
                style: ElevatedButton.styleFrom(
                  backgroundColor: ink,
                  foregroundColor: bg,
                  disabledBackgroundColor: ink.withOpacity(0.3),
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
                child: _sending
                    ? SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: bg,
                        ),
                      )
                    : Text(
                        _receipt != null
                            ? "To'lovni yuborish"
                            : "Avval chek yuklang",
                        style: SilkTheme.body(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: bg,
                        ),
                      ),
              ),
            ),
            // reference brand to avoid unused warning
            SizedBox(height: 0, child: Opacity(opacity: 0, child: Text('', style: TextStyle(color: brand)))),
          ],
        ),
      ),
    );
  }

  Widget _cardTile(String type, String number) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: SilkTheme.bgOf(context),
        borderRadius: BorderRadius.circular(SilkTheme.radiusBtn),
        border: Border.all(color: SilkTheme.borderOf(context)),
      ),
      child: Row(
        children: [
          Text(
            type,
            style: SilkTheme.body(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: SilkTheme.mutedOf(context),
            ),
          ),
          const Spacer(),
          SelectableText(
            number,
            style: SilkTheme.mono(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: SilkTheme.inkOf(context),
              letterSpacing: 1,
            ),
          ),
        ],
      ),
    );
  }
}
