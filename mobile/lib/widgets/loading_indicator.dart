import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../config/silk_theme.dart';

/// Shimmer loading indicator for list items.
class ShimmerLoading extends StatelessWidget {
  final int itemCount;
  final double itemHeight;
  final EdgeInsets padding;

  const ShimmerLoading({
    super.key,
    this.itemCount = 5,
    this.itemHeight = 100,
    this.padding = const EdgeInsets.symmetric(horizontal: 16),
  });

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: SilkTheme.bg2,
      highlightColor: SilkTheme.surface,
      child: ListView.separated(
        padding: padding,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: itemCount,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (_, __) => _ShimmerCard(height: itemHeight),
      ),
    );
  }
}

class _ShimmerCard extends StatelessWidget {
  final double height;

  const _ShimmerCard({required this.height});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        color: SilkTheme.surfaceOf(context),
        borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: SilkTheme.surfaceOf(context),
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      height: 14,
                      width: 140,
                      decoration: BoxDecoration(
                        color: SilkTheme.surfaceOf(context),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Container(
                      height: 12,
                      width: 100,
                      decoration: BoxDecoration(
                        color: SilkTheme.surfaceOf(context),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                width: 70,
                height: 24,
                decoration: BoxDecoration(
                  color: SilkTheme.surfaceOf(context),
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ],
          ),
          const Spacer(),
          Row(
            children: [
              Container(
                height: 12,
                width: 80,
                decoration: BoxDecoration(
                  color: SilkTheme.surfaceOf(context),
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              const SizedBox(width: 16),
              Container(
                height: 12,
                width: 60,
                decoration: BoxDecoration(
                  color: SilkTheme.surfaceOf(context),
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// A full-screen shimmer loading for dashboard stat cards.
class ShimmerStatCards extends StatelessWidget {
  final int count;

  const ShimmerStatCards({super.key, this.count = 4});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: SilkTheme.bg2,
      highlightColor: SilkTheme.surface,
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1.4,
        ),
        itemCount: count,
        itemBuilder: (context, __) => Container(
          decoration: BoxDecoration(
            color: SilkTheme.surfaceOf(context),
            borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
          ),
        ),
      ),
    );
  }
}

/// Empty state widget.
class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? action;

  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.action,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: SilkTheme.bg,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 40, color: SilkTheme.muted2),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: SilkTheme.ink,
              ),
              textAlign: TextAlign.center,
            ),
            if (subtitle != null) ...[
              const SizedBox(height: 8),
              Text(
                subtitle!,
                style: const TextStyle(
                  fontSize: 14,
                  color: SilkTheme.muted,
                ),
                textAlign: TextAlign.center,
              ),
            ],
            if (action != null) ...[
              const SizedBox(height: 20),
              action!,
            ],
          ],
        ),
      ),
    );
  }
}

/// Error state widget.
class ErrorState extends StatelessWidget {
  final String message;
  final VoidCallback? onRetry;

  const ErrorState({
    super.key,
    required this.message,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: SilkTheme.danger.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.error_outline,
                size: 40,
                color: SilkTheme.danger,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Xatolik yuz berdi',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: SilkTheme.ink,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              message,
              style: const TextStyle(
                fontSize: 14,
                color: SilkTheme.muted,
              ),
              textAlign: TextAlign.center,
            ),
            if (onRetry != null) ...[
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh, size: 18),
                label: const Text('Qayta urinish'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
