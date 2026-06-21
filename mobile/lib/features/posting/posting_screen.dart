import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/silk_theme.dart';
import '../../core/models/ad.dart';
import '../../core/services/posting_service.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/loading_indicator.dart';
import 'posting_provider.dart';

class PostingScreen extends ConsumerWidget {
  const PostingScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final postingState = ref.watch(postingProvider);

    return Scaffold(
      appBar: CustomAppBar(
        title: 'Tarqatish',
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: SilkTheme.muted),
            onPressed: () => ref.read(postingProvider.notifier).loadData(),
          ),
        ],
      ),
      backgroundColor: SilkTheme.bg,
      body: RefreshIndicator(
        color: SilkTheme.brand,
        onRefresh: () => ref.read(postingProvider.notifier).loadData(),
        child: _buildBody(context, ref, postingState),
      ),
    );
  }

  Widget _buildBody(
    BuildContext context,
    WidgetRef ref,
    PostingState state,
  ) {
    if (state.isLoading && state.ads.isEmpty) {
      return const ShimmerLoading(itemCount: 3, itemHeight: 200);
    }

    if (state.error != null && state.ads.isEmpty) {
      return ErrorState(
        message: state.error!,
        onRetry: () => ref.read(postingProvider.notifier).loadData(),
      );
    }

    if (state.ads.isEmpty) {
      return const EmptyState(
        icon: Icons.send_outlined,
        title: 'E\'lon topilmadi',
        subtitle: 'Tarqatish uchun avval faol e\'lon yarating.',
      );
    }

    // Separate active and inactive postings
    final activeAds = state.ads
        .where((ad) => state.activeJobs.containsKey(ad.id))
        .toList();
    final availableAds = state.ads
        .where((ad) => !state.activeJobs.containsKey(ad.id))
        .toList();

    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(16),
      children: [
        // Active postings section
        if (activeAds.isNotEmpty) ...[
          _buildSectionHeader(
            'Faol tarqatishlar',
            '${activeAds.length} ta',
            SilkTheme.success,
          ),
          const SizedBox(height: 12),
          ...activeAds.map((ad) {
            final job = state.activeJobs[ad.id]!;
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _buildActivePostingCard(context, ref, ad, job),
            );
          }),
          const SizedBox(height: 20),
        ],

        // Available ads section
        if (availableAds.isNotEmpty) ...[
          _buildSectionHeader(
            'Tarqatish uchun e\'lonlar',
            '${availableAds.length} ta',
            SilkTheme.brand,
          ),
          const SizedBox(height: 12),
          ...availableAds.map((ad) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _buildAvailableAdCard(context, ref, ad),
              )),
        ],

        const SizedBox(height: 80),
      ],
    );
  }

  Widget _buildSectionHeader(String title, String count, Color color) {
    return Row(
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w600,
            color: SilkTheme.ink,
          ),
        ),
        const SizedBox(width: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            count,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: color,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildActivePostingCard(
    BuildContext context,
    WidgetRef ref,
    Ad ad,
    PostingJob job,
  ) {
    final progress = job.progress;
    final progressPercent = (progress * 100).round();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: SilkTheme.surface,
        borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
        border: Border.all(
          color: SilkTheme.success.withValues(alpha: 0.3),
        ),
        boxShadow: [
          BoxShadow(
            color: SilkTheme.success.withValues(alpha: 0.06),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: SilkTheme.success.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(SilkTheme.radiusSmall),
                ),
                child: const Icon(
                  Icons.play_circle_filled,
                  color: SilkTheme.success,
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      ad.title,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: SilkTheme.ink,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      job.isRunning ? 'Tarqatilmoqda...' : job.status,
                      style: TextStyle(
                        fontSize: 13,
                        color: job.isRunning
                            ? SilkTheme.success
                            : SilkTheme.muted,
                      ),
                    ),
                  ],
                ),
              ),
              // Stop button
              IconButton(
                onPressed: () => _confirmStop(context, ref, ad),
                icon: Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: SilkTheme.danger.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(SilkTheme.radiusSmall),
                  ),
                  child: const Icon(
                    Icons.stop_rounded,
                    color: SilkTheme.danger,
                    size: 22,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 8,
              backgroundColor: SilkTheme.border,
              valueColor:
                  const AlwaysStoppedAnimation<Color>(SilkTheme.success),
            ),
          ),

          const SizedBox(height: 10),

          // Progress details
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '$progressPercent%',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: SilkTheme.success,
                ),
              ),
              Row(
                children: [
                  _buildProgressStat(
                    Icons.check_circle_outline,
                    '${job.completedGroups}',
                    SilkTheme.success,
                  ),
                  const SizedBox(width: 12),
                  if (job.failedGroups > 0)
                    _buildProgressStat(
                      Icons.error_outline,
                      '${job.failedGroups}',
                      SilkTheme.danger,
                    ),
                  const SizedBox(width: 12),
                  _buildProgressStat(
                    Icons.group_outlined,
                    '${job.totalGroups}',
                    SilkTheme.muted,
                  ),
                ],
              ),
            ],
          ),

          if (job.lastError != null) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: SilkTheme.danger.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Row(
                children: [
                  const Icon(Icons.warning_amber,
                      size: 14, color: SilkTheme.danger),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      job.lastError!,
                      style: const TextStyle(
                        fontSize: 12,
                        color: SilkTheme.danger,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildProgressStat(IconData icon, String value, Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: color),
        const SizedBox(width: 3),
        Text(
          value,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: color,
          ),
        ),
      ],
    );
  }

  Widget _buildAvailableAdCard(
    BuildContext context,
    WidgetRef ref,
    Ad ad,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: SilkTheme.surface,
        borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
        border: Border.all(
          color: SilkTheme.border.withValues(alpha: 0.5),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: SilkTheme.brand.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(SilkTheme.radiusSmall),
                ),
                child: Icon(
                  ad.mediaType == MediaType.text
                      ? Icons.text_fields
                      : Icons.image_outlined,
                  color: SilkTheme.brand,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      ad.title,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: SilkTheme.ink,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      ad.status.label,
                      style: TextStyle(
                        fontSize: 13,
                        color: ad.status == AdStatus.active
                            ? SilkTheme.success
                            : SilkTheme.muted,
                      ),
                    ),
                  ],
                ),
              ),
              if (ad.isPriority)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: SilkTheme.accent2.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.star,
                          size: 12, color: SilkTheme.accent2),
                      const SizedBox(width: 3),
                      const Text(
                        'Ustuvor',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: SilkTheme.accent2,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),

          const SizedBox(height: 12),

          // Content preview
          Text(
            ad.content,
            style: const TextStyle(
              fontSize: 13,
              color: SilkTheme.muted,
              height: 1.4,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),

          const SizedBox(height: 12),

          // Action button
          SizedBox(
            width: double.infinity,
            height: 42,
            child: ElevatedButton.icon(
              onPressed: () {
                _confirmStart(context, ref, ad);
              },
              icon: const Icon(Icons.play_arrow, size: 20),
              label: const Text('Tarqatishni boshlash'),
              style: ElevatedButton.styleFrom(
                backgroundColor: SilkTheme.brand,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(SilkTheme.radiusSmall),
                ),
                textStyle: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _confirmStart(BuildContext context, WidgetRef ref, Ad ad) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Tarqatishni boshlash'),
        content: Text(
          '"${ad.title}" e\'lonini barcha guruhlarga tarqatishni boshlamoqchimisiz?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Bekor qilish'),
          ),
          ElevatedButton(
            onPressed: () {
              ref.read(postingProvider.notifier).startPosting(ad.id);
              Navigator.of(ctx).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Tarqatish boshlandi!'),
                  backgroundColor: SilkTheme.success,
                ),
              );
            },
            child: const Text('Boshlash'),
          ),
        ],
      ),
    );
  }

  void _confirmStop(BuildContext context, WidgetRef ref, Ad ad) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Tarqatishni to\'xtatish'),
        content: Text(
          '"${ad.title}" tarqatishni to\'xtatmoqchimisiz?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Bekor qilish'),
          ),
          ElevatedButton(
            onPressed: () {
              ref.read(postingProvider.notifier).stopPosting(ad.id);
              Navigator.of(ctx).pop();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: SilkTheme.danger,
            ),
            child: const Text('To\'xtatish'),
          ),
        ],
      ),
    );
  }
}
