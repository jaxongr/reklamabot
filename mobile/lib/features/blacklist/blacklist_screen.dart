import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/strings.dart';
import '../../config/silk_theme.dart';
import 'blacklist_provider.dart';

class BlacklistScreen extends ConsumerWidget {
  const BlacklistScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(blacklistProvider);
    final notifier = ref.read(blacklistProvider.notifier);

    return Scaffold(
      backgroundColor: SilkTheme.bgOf(context),
      appBar: AppBar(
        title: Text(AppStrings.qoraRoyxat),
        backgroundColor: SilkTheme.surfaceOf(context),
        foregroundColor: SilkTheme.inkOf(context),
        elevation: 0,
        actions: [
          if (state.blacklistedCount > 0)
            Center(
              child: Container(
                margin: const EdgeInsets.only(right: SilkTheme.s16),
                padding: const EdgeInsets.symmetric(
                  horizontal: SilkTheme.s8,
                  vertical: SilkTheme.s4,
                ),
                decoration: BoxDecoration(
                  color: SilkTheme.danger.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(SilkTheme.radiusSmall),
                ),
                child: Text(
                  '${state.blacklistedCount} ta bloklangan',
                  style: TextStyle(
                    color: SilkTheme.danger,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
        ],
      ),
      body: state.isLoading
          ? const Center(
              child: CircularProgressIndicator(color: SilkTheme.brand),
            )
          : state.error != null
              ? _ErrorView(
                  error: state.error!,
                  onRetry: () => notifier.loadAll(),
                )
              : Column(
                  children: [
                    // Tushuntirish
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(SilkTheme.s16),
                      color: SilkTheme.accent2.withValues(alpha: 0.08),
                      child: Row(
                        children: [
                          Icon(
                            Icons.info_outline,
                            color: SilkTheme.accent2,
                            size: 20,
                          ),
                          const SizedBox(width: SilkTheme.s8),
                          Expanded(
                            child: Text(
                              AppStrings.qoraRoyxatTushuntirish,
                              style: TextStyle(
                                color: SilkTheme.mutedOf(context),
                                fontSize: 13,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Session filtri
                    if (state.sessions.length > 1)
                      Container(
                        height: 48,
                        padding: const EdgeInsets.symmetric(
                            horizontal: SilkTheme.s16),
                        color: SilkTheme.surfaceOf(context),
                        child: ListView(
                          scrollDirection: Axis.horizontal,
                          children: [
                            _FilterChip(
                              label: AppStrings.barchasi,
                              isSelected: state.selectedSessionId == null,
                              onTap: () => notifier.selectSession(null),
                            ),
                            ...state.sessions.map((s) => _FilterChip(
                                  label: s.displayName,
                                  isSelected:
                                      state.selectedSessionId == s.id,
                                  onTap: () => notifier.selectSession(s.id),
                                )),
                          ],
                        ),
                      ),

                    // Guruhlar ro'yxati
                    Expanded(
                      child: state.filteredGroups.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    Icons.group_off_outlined,
                                    size: 64,
                                    color: SilkTheme.muted2,
                                  ),
                                  const SizedBox(height: SilkTheme.s8),
                                  Text(
                                    "Guruhlar topilmadi",
                                    style: TextStyle(
                                      color: SilkTheme.mutedOf(context),
                                      fontSize: 16,
                                    ),
                                  ),
                                ],
                              ),
                            )
                          : RefreshIndicator(
                              color: SilkTheme.brand,
                              onRefresh: () => notifier.loadAll(),
                              child: ListView.builder(
                                padding: const EdgeInsets.symmetric(
                                  vertical: SilkTheme.s8,
                                ),
                                itemCount: state.filteredGroups.length,
                                itemBuilder: (context, index) {
                                  final item = state.filteredGroups[index];
                                  return _GroupTile(
                                    item: item,
                                    isSaving: state.isSaving,
                                    onToggle: () async {
                                      final ok =
                                          await notifier.toggleBlacklist(item);
                                      if (!ok && context.mounted) {
                                        ScaffoldMessenger.of(context)
                                            .showSnackBar(
                                          const SnackBar(
                                            content:
                                                Text('Xatolik yuz berdi'),
                                            backgroundColor:
                                                SilkTheme.danger,
                                          ),
                                        );
                                      }
                                    },
                                  );
                                },
                              ),
                            ),
                    ),
                  ],
                ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(right: SilkTheme.s8),
        padding: const EdgeInsets.symmetric(
          horizontal: SilkTheme.s16,
          vertical: SilkTheme.s8,
        ),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: isSelected
              ? SilkTheme.brand.withValues(alpha: 0.1)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(SilkTheme.radiusSmall),
          border: Border.all(
            color: isSelected ? SilkTheme.brand : SilkTheme.borderOf(context),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? SilkTheme.brand : SilkTheme.mutedOf(context),
            fontSize: 13,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}

class _GroupTile extends StatelessWidget {
  final GroupWithBlacklist item;
  final bool isSaving;
  final VoidCallback onToggle;

  const _GroupTile({
    required this.item,
    required this.isSaving,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    final group = item.group;
    final isBlacklisted = item.isBlacklisted;

    return Container(
      margin: const EdgeInsets.symmetric(
        horizontal: SilkTheme.s16,
        vertical: SilkTheme.s4,
      ),
      decoration: BoxDecoration(
        color: isBlacklisted
            ? SilkTheme.danger.withValues(alpha: 0.04)
            : SilkTheme.surfaceOf(context),
        borderRadius: BorderRadius.circular(SilkTheme.radiusLarge),
        border: Border.all(
          color: isBlacklisted
              ? SilkTheme.danger.withValues(alpha: 0.2)
              : SilkTheme.borderOf(context),
        ),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(
          horizontal: SilkTheme.s16,
          vertical: SilkTheme.s4,
        ),
        leading: CircleAvatar(
          backgroundColor: isBlacklisted
              ? SilkTheme.danger.withValues(alpha: 0.1)
              : SilkTheme.brand.withValues(alpha: 0.1),
          child: Icon(
            isBlacklisted ? Icons.block : Icons.group_outlined,
            color: isBlacklisted ? SilkTheme.danger : SilkTheme.brand,
            size: 20,
          ),
        ),
        title: Text(
          group.title.isNotEmpty ? group.title : 'Nomsiz guruh',
          style: TextStyle(
            color: SilkTheme.inkOf(context),
            fontSize: 14,
            fontWeight: FontWeight.w500,
            decoration: isBlacklisted ? TextDecoration.lineThrough : null,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: Row(
          children: [
            Text(
              item.sessionName,
              style: TextStyle(
                color: SilkTheme.mutedOf(context),
                fontSize: 12,
              ),
            ),
            if (group.memberCount != null && group.memberCount! > 0) ...[
              Text(
                '  \u2022  ',
                style: TextStyle(color: SilkTheme.muted2, fontSize: 12),
              ),
              Text(
                "${group.memberCount} a'zo",
                style: TextStyle(
                  color: SilkTheme.mutedOf(context),
                  fontSize: 12,
                ),
              ),
            ],
          ],
        ),
        trailing: Switch.adaptive(
          value: isBlacklisted,
          onChanged: isSaving ? null : (_) => onToggle(),
          activeColor: SilkTheme.danger,
          inactiveTrackColor: SilkTheme.borderOf(context),
        ),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String error;
  final VoidCallback onRetry;

  const _ErrorView({required this.error, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.error_outline, size: 64, color: SilkTheme.danger),
          const SizedBox(height: SilkTheme.s8),
          Text(
            error,
            style: TextStyle(
              color: SilkTheme.mutedOf(context),
              fontSize: 14,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: SilkTheme.s16),
          ElevatedButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh),
            label: const Text('Qayta yuklash'),
            style: ElevatedButton.styleFrom(
              backgroundColor: SilkTheme.brand,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
