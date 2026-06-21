import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../config/api_config.dart';
import '../../config/silk_theme.dart';
import '../../core/api/api_client.dart';
import '../../core/models/driver_profile.dart';
import '../../core/models/session_model.dart';
import '../../widgets/app_scaffold.dart';
import '../sessions/sessions_provider.dart';

// ============================================================
// DISPATCHER OFFERS PROVIDER — barcha haydovchi takliflari
// ============================================================

class DispatcherOffersState {
  final List<DriverOffer> offers;
  final bool isLoading;
  final String? error;

  const DispatcherOffersState({
    this.offers = const [],
    this.isLoading = false,
    this.error,
  });
}

class DispatcherOffersNotifier extends StateNotifier<DispatcherOffersState> {
  final ApiClient _api;

  DispatcherOffersNotifier(this._api) : super(const DispatcherOffersState());

  Future<void> loadOffers() async {
    state = DispatcherOffersState(isLoading: true, offers: state.offers);
    try {
      final response = await _api.get(
        ApiConfig.driverOffers,
        queryParameters: {'status': 'ACTIVE', 'limit': '50'},
      );
      final data = response.data as Map<String, dynamic>;
      final items = (data['data'] as List?)
              ?.map((e) => DriverOffer.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [];
      state = DispatcherOffersState(offers: items);
    } catch (e) {
      state = DispatcherOffersState(
        error: 'Takliflar yuklanmadi',
        offers: state.offers,
      );
    }
  }
}

final dispatcherOffersProvider =
    StateNotifierProvider<DispatcherOffersNotifier, DispatcherOffersState>(
        (ref) {
  final api = ref.read(apiClientProvider);
  return DispatcherOffersNotifier(api);
});

// ============================================================
// SEARCH SCREEN
// ============================================================

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(sessionsProvider.notifier).loadSessions();
      ref.read(dispatcherOffersProvider.notifier).loadOffers();
    });
  }

  Future<void> _onRefresh() async {
    await Future.wait([
      ref.read(sessionsProvider.notifier).loadSessions(),
      ref.read(dispatcherOffersProvider.notifier).loadOffers(),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    final sessionsState = ref.watch(sessionsProvider);
    final offersState = ref.watch(dispatcherOffersProvider);

    return Scaffold(
      backgroundColor: SilkTheme.bgOf(context),
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.menu),
          onPressed: () {
            ref.read(scaffoldKeyProvider).currentState?.openDrawer();
          },
        ),
        title: const Text('Haydovchi topish'),
        backgroundColor: SilkTheme.surfaceOf(context),
        foregroundColor: SilkTheme.inkOf(context),
        elevation: 0,
        scrolledUnderElevation: 0,
        surfaceTintColor: Colors.transparent,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _onRefresh,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddSessionSheet(context),
        child: const Icon(Icons.add),
      ),
      body: RefreshIndicator(
        onRefresh: _onRefresh,
        color: SilkTheme.brand,
        child: _buildBody(sessionsState, offersState),
      ),
    );
  }

  Widget _buildBody(
      SessionsState sessionsState, DispatcherOffersState offersState) {
    if (sessionsState.isLoading &&
        sessionsState.sessions.isEmpty &&
        offersState.isLoading &&
        offersState.offers.isEmpty) {
      return const Center(
        child: CircularProgressIndicator(color: SilkTheme.brand),
      );
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // ── Haydovchi takliflari bo'limi ──
        _buildOffersSectionHeader(offersState),
        const SizedBox(height: 10),
        _buildOffersList(offersState),

        const SizedBox(height: 24),

        // ── Sessiyalar bo'limi ──
        _buildSessionsSectionHeader(sessionsState),
        const SizedBox(height: 10),
        _buildSessionsList(sessionsState),
      ],
    );
  }

  // ══════════════════════════════════════════════════════════════
  // OFFERS SECTION
  // ══════════════════════════════════════════════════════════════

  Widget _buildOffersSectionHeader(DispatcherOffersState state) {
    return Row(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: SilkTheme.accent.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child:
              const Icon(Icons.local_shipping, size: 16, color: SilkTheme.accent),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            'Haydovchi takliflari (${state.offers.length})',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: SilkTheme.inkOf(context),
            ),
          ),
        ),
        if (state.isLoading)
          const SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              color: SilkTheme.accent,
            ),
          ),
      ],
    );
  }

  Widget _buildOffersList(DispatcherOffersState state) {
    if (state.offers.isEmpty && !state.isLoading) {
      return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: SilkTheme.surfaceOf(context),
          border: Border.all(color: SilkTheme.borderOf(context)),
          borderRadius: BorderRadius.circular(SilkTheme.radiusLarge),
        ),
        child: Column(
          children: [
            Icon(Icons.local_shipping_outlined,
                color: SilkTheme.mutedOf(context), size: 28),
            const SizedBox(height: 8),
            Text(
              'Hozircha takliflar yo\'q',
              style: TextStyle(
                fontSize: 13,
                color: SilkTheme.mutedOf(context),
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Haydovchilar taklif yaratganda bu yerda ko\'rinadi',
              style: TextStyle(
                fontSize: 12,
                color: SilkTheme.muted2Of(context),
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      children: state.offers.map((offer) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: _OfferCard(offer: offer),
        );
      }).toList(),
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SESSIONS SECTION
  // ══════════════════════════════════════════════════════════════

  Widget _buildSessionsSectionHeader(SessionsState state) {
    return Row(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: SilkTheme.brand.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Icon(Icons.sim_card_outlined,
              size: 16, color: SilkTheme.brand),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            'Sessiyalar (${state.sessions.length})',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: SilkTheme.inkOf(context),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSessionsList(SessionsState state) {
    if (state.sessions.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: SilkTheme.surfaceOf(context),
          border: Border.all(color: SilkTheme.borderOf(context)),
          borderRadius: BorderRadius.circular(SilkTheme.radiusLarge),
        ),
        child: Column(
          children: [
            Icon(Icons.sim_card_outlined,
                color: SilkTheme.mutedOf(context), size: 28),
            const SizedBox(height: 8),
            Text(
              'Sessiyalar topilmadi',
              style: TextStyle(
                fontSize: 13,
                color: SilkTheme.mutedOf(context),
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              "Sessiya qo'shish uchun + tugmasini bosing",
              style: TextStyle(
                fontSize: 12,
                color: SilkTheme.muted2Of(context),
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      children: state.sessions.map((session) {
        final isConnected = state.connectionStatus[session.id] ?? false;
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: _SessionCard(
            session: session,
            isConnected: isConnected,
            onSync: () =>
                ref.read(sessionsProvider.notifier).syncSession(session.id),
            onFreeze: () => session.isFrozen
                ? ref
                    .read(sessionsProvider.notifier)
                    .unfreezeSession(session.id)
                : ref
                    .read(sessionsProvider.notifier)
                    .freezeSession(session.id),
            onDelete: () => _confirmDelete(session),
          ),
        );
      }).toList(),
    );
  }

  void _confirmDelete(SessionModel session) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("Sessiyani o'chirish"),
        content:
            Text("${session.displayName} sessiyasini o'chirishni xohlaysizmi?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Bekor qilish'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              ref
                  .read(sessionsProvider.notifier)
                  .deleteSession(session.id);
            },
            style: TextButton.styleFrom(foregroundColor: SilkTheme.danger),
            child: const Text("O'chirish"),
          ),
        ],
      ),
    );
  }

  void _showAddSessionSheet(BuildContext context) {
    ref.read(addSessionProvider.notifier).reset();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      isDismissible: false,
      enableDrag: false,
      backgroundColor: SilkTheme.surfaceOf(context),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => const _AddSessionSheet(),
    );
  }
}

// ══════════════════════════════════════════════════════════════
// OFFER CARD
// ══════════════════════════════════════════════════════════════

class _OfferCard extends StatelessWidget {
  final DriverOffer offer;

  const _OfferCard({required this.offer});

  @override
  Widget build(BuildContext context) {
    final timeAgo = _timeAgo(offer.createdAt);

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: SilkTheme.surfaceOf(context),
        border: Border.all(color: SilkTheme.borderOf(context)),
        borderRadius: BorderRadius.circular(SilkTheme.radiusLarge),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Driver info row
          Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: SilkTheme.accent.withValues(alpha: 0.1),
                child: Text(
                  (offer.driverFullName ?? 'H').substring(0, 1).toUpperCase(),
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: SilkTheme.accent,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            offer.driverFullName ?? 'Haydovchi',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: SilkTheme.inkOf(context),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (offer.driverIsVerified) ...[
                          const SizedBox(width: 4),
                          const Icon(Icons.verified,
                              size: 14, color: SilkTheme.accent),
                        ],
                      ],
                    ),
                    Text(
                      offer.driverVehicleType ?? offer.vehicleType,
                      style: TextStyle(
                        fontSize: 12,
                        color: SilkTheme.mutedOf(context),
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                timeAgo,
                style: TextStyle(
                  fontSize: 11,
                  color: SilkTheme.muted2Of(context),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Route row with dots
          Row(
            children: [
              Column(
                children: [
                  Container(
                    width: 10,
                    height: 10,
                    decoration: const BoxDecoration(
                      color: SilkTheme.brand,
                      shape: BoxShape.circle,
                    ),
                  ),
                  Container(
                    width: 1,
                    height: 16,
                    color: SilkTheme.muted2Of(context),
                  ),
                  Container(
                    width: 10,
                    height: 10,
                    decoration: const BoxDecoration(
                      color: SilkTheme.accent,
                      shape: BoxShape.circle,
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      offer.fromCity,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: SilkTheme.inkOf(context),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      offer.toCity,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: SilkTheme.inkOf(context),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Info chips: vehicle capacity, price
          Row(
            children: [
              if (offer.vehicleCapacity != null &&
                  offer.vehicleCapacity!.isNotEmpty)
                _InfoChip(
                  icon: Icons.scale_outlined,
                  label: offer.vehicleCapacity!,
                ),
              if (offer.price != null && offer.price!.isNotEmpty) ...[
                if (offer.vehicleCapacity != null &&
                    offer.vehicleCapacity!.isNotEmpty)
                  const SizedBox(width: 10),
                _InfoChip(
                  icon: Icons.payments_outlined,
                  label: offer.price!,
                  color: SilkTheme.success,
                ),
              ],
              const Spacer(),
              // Call button
              GestureDetector(
                onTap: () => _callDriver(offer.phone),
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: SilkTheme.success.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.phone,
                          size: 14, color: SilkTheme.success),
                      const SizedBox(width: 4),
                      Text(
                        offer.phone,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: SilkTheme.success,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Description
          if (offer.description != null && offer.description!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              offer.description!,
              style: TextStyle(
                fontSize: 12,
                color: SilkTheme.mutedOf(context),
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ],
      ),
    );
  }

  void _callDriver(String phone) async {
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) {
      launchUrl(uri);
    }
  }

  String _timeAgo(DateTime date) {
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 1) return 'hozirgina';
    if (diff.inMinutes < 60) return '${diff.inMinutes} daq';
    if (diff.inHours < 24) return '${diff.inHours} soat';
    return '${diff.inDays} kun';
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _InfoChip({
    required this.icon,
    required this.label,
    this.color = SilkTheme.muted,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: color),
        const SizedBox(width: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: color,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}

// ══════════════════════════════════════════════════════════════
// SESSION CARD
// ══════════════════════════════════════════════════════════════

class _SessionCard extends StatelessWidget {
  final SessionModel session;
  final bool isConnected;
  final VoidCallback onSync;
  final VoidCallback onFreeze;
  final VoidCallback onDelete;

  const _SessionCard({
    required this.session,
    required this.isConnected,
    required this.onSync,
    required this.onFreeze,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final isFrozen = session.isFrozen || session.status == SessionStatus.frozen;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: SilkTheme.surfaceOf(context),
        border: Border.all(color: SilkTheme.borderOf(context)),
        borderRadius: BorderRadius.circular(SilkTheme.radiusLarge),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top row: name + status
          Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundColor: isFrozen
                    ? SilkTheme.brand2.withValues(alpha: 0.1)
                    : isConnected
                        ? SilkTheme.success.withValues(alpha: 0.1)
                        : SilkTheme.muted.withValues(alpha: 0.1),
                child: Icon(
                  isFrozen
                      ? Icons.ac_unit
                      : isConnected
                          ? Icons.wifi
                          : Icons.wifi_off,
                  size: 18,
                  color: isFrozen
                      ? SilkTheme.brand2
                      : isConnected
                          ? SilkTheme.success
                          : SilkTheme.muted,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      session.displayName,
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: SilkTheme.inkOf(context),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (session.phone != null)
                      Text(
                        session.phone!,
                        style: TextStyle(
                          fontSize: 12,
                          color: SilkTheme.mutedOf(context),
                        ),
                      ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isFrozen
                      ? SilkTheme.brand2.withValues(alpha: 0.1)
                      : isConnected
                          ? SilkTheme.success.withValues(alpha: 0.1)
                          : SilkTheme.accent2.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  isFrozen ? 'Muzlatilgan' : session.statusLabel,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: isFrozen
                        ? SilkTheme.brand2
                        : isConnected
                            ? SilkTheme.success
                            : SilkTheme.accent2,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Info row
          Row(
            children: [
              _InfoChip(
                icon: Icons.group_outlined,
                label: '${session.activeGroups}/${session.totalGroups} guruh',
              ),
              const SizedBox(width: 12),
              if (session.isPremium)
                const _InfoChip(
                  icon: Icons.star,
                  label: 'Premium',
                  color: SilkTheme.accent2,
                ),
            ],
          ),
          const SizedBox(height: 12),

          // Action buttons
          Row(
            children: [
              Expanded(
                child: _ActionButton(
                  icon: Icons.sync,
                  label: 'Sinxron',
                  onTap: onSync,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _ActionButton(
                  icon: isFrozen ? Icons.play_arrow : Icons.ac_unit,
                  label: isFrozen ? 'Yoqish' : 'Muzlatish',
                  color: isFrozen ? SilkTheme.success : SilkTheme.brand2,
                  onTap: onFreeze,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _ActionButton(
                  icon: Icons.delete_outline,
                  label: "O'chirish",
                  color: SilkTheme.danger,
                  onTap: onDelete,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color? color;
  final VoidCallback onTap;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.onTap,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final c = color ?? SilkTheme.brand;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: c.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 16, color: c),
              if (label.isNotEmpty) ...[
                const SizedBox(width: 4),
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: c,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

// ══════════════════════════════════════════════════════════════
// ADD SESSION BOTTOM SHEET
// ══════════════════════════════════════════════════════════════

class _AddSessionSheet extends ConsumerStatefulWidget {
  const _AddSessionSheet();

  @override
  ConsumerState<_AddSessionSheet> createState() => _AddSessionSheetState();
}

class _AddSessionSheetState extends ConsumerState<_AddSessionSheet> {
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
    final state = ref.watch(addSessionProvider);

    return Padding(
      padding: EdgeInsets.fromLTRB(
        20,
        16,
        20,
        MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Handle + close button
          Row(
            children: [
              const Spacer(),
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: SilkTheme.borderOf(context),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Expanded(
                child: Align(
                  alignment: Alignment.centerRight,
                  child: GestureDetector(
                    onTap: () {
                      ref.read(addSessionProvider.notifier).reset();
                      Navigator.pop(context);
                    },
                    child: Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: SilkTheme.borderOf(context),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(Icons.close,
                          size: 18, color: SilkTheme.mutedOf(context)),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          Text(
            _stepTitle(state.step),
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: SilkTheme.inkOf(context),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            _stepSubtitle(state.step),
            style: TextStyle(
                fontSize: 13, color: SilkTheme.mutedOf(context)),
          ),
          const SizedBox(height: 20),

          if (state.error != null)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: SilkTheme.danger.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                state.error!,
                style: const TextStyle(
                  fontSize: 13,
                  color: SilkTheme.danger,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),

          if (state.step == AddSessionStep.done)
            _buildDoneStep()
          else
            _buildInputStep(state),
        ],
      ),
    );
  }

  Widget _buildInputStep(AddSessionState state) {
    final TextEditingController controller;
    final String hint;
    final TextInputType keyboardType;

    switch (state.step) {
      case AddSessionStep.phone:
        controller = _phoneController;
        hint = '+998901234567';
        keyboardType = TextInputType.phone;
        break;
      case AddSessionStep.code:
        controller = _codeController;
        hint = 'Telegram kodi';
        keyboardType = TextInputType.number;
        break;
      case AddSessionStep.password:
        controller = _passwordController;
        hint = '2FA parol';
        keyboardType = TextInputType.visiblePassword;
        break;
      default:
        return const SizedBox.shrink();
    }

    return Column(
      children: [
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          autofocus: true,
          obscureText: state.step == AddSessionStep.password,
          decoration: InputDecoration(
            hintText: hint,
            prefixIcon: Icon(
              state.step == AddSessionStep.phone
                  ? Icons.phone
                  : state.step == AddSessionStep.code
                      ? Icons.lock_outline
                      : Icons.key,
            ),
          ),
        ),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton(
            onPressed: state.isLoading ? null : () => _onSubmit(state.step),
            child: state.isLoading
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      valueColor: AlwaysStoppedAnimation(Colors.white),
                    ),
                  )
                : Text(
                    state.step == AddSessionStep.phone
                        ? 'Kod yuborish'
                        : 'Tasdiqlash',
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
          ),
        ),
      ],
    );
  }

  Widget _buildDoneStep() {
    return Column(
      children: [
        Container(
          width: 64,
          height: 64,
          decoration: BoxDecoration(
            color: SilkTheme.success.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(18),
          ),
          child: const Icon(Icons.check_circle,
              color: SilkTheme.success, size: 36),
        ),
        const SizedBox(height: 14),
        Text(
          "Sessiya muvaffaqiyatli qo'shildi!",
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: SilkTheme.inkOf(context),
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 20),
        SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton(
            onPressed: () {
              ref.read(addSessionProvider.notifier).reset();
              ref.read(sessionsProvider.notifier).loadSessions();
              Navigator.pop(context);
            },
            child: const Text(
              'Tayyor',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
            ),
          ),
        ),
      ],
    );
  }

  void _onSubmit(AddSessionStep step) {
    switch (step) {
      case AddSessionStep.phone:
        final phone = _phoneController.text.trim();
        if (phone.isEmpty) return;
        ref.read(addSessionProvider.notifier).sendPhone(phone);
        break;
      case AddSessionStep.code:
        final code = _codeController.text.trim();
        if (code.isEmpty) return;
        ref.read(addSessionProvider.notifier).sendCode(code);
        break;
      case AddSessionStep.password:
        final password = _passwordController.text.trim();
        if (password.isEmpty) return;
        ref.read(addSessionProvider.notifier).sendPassword(password);
        break;
      default:
        break;
    }
  }

  String _stepTitle(AddSessionStep step) {
    switch (step) {
      case AddSessionStep.phone:
        return "Sessiya qo'shish";
      case AddSessionStep.code:
        return 'Kodni kiriting';
      case AddSessionStep.password:
        return '2FA parolni kiriting';
      case AddSessionStep.syncing:
        return 'Sinxronlanmoqda...';
      case AddSessionStep.done:
        return 'Tayyor!';
    }
  }

  String _stepSubtitle(AddSessionStep step) {
    switch (step) {
      case AddSessionStep.phone:
        return 'Telegram telefon raqamingizni kiriting';
      case AddSessionStep.code:
        return 'Telegramga yuborilgan kodni kiriting';
      case AddSessionStep.password:
        return 'Ikki bosqichli tasdiqlash parolini kiriting';
      case AddSessionStep.syncing:
        return 'Guruhlar sinxronlanmoqda...';
      case AddSessionStep.done:
        return "Sessiya muvaffaqiyatli qo'shildi";
    }
  }
}
