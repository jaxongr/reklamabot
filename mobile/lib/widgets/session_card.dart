import 'package:flutter/material.dart';
import '../config/silk_theme.dart';
import '../core/models/session_model.dart';

/// A card widget displaying a single Telegram session's info.
class SessionCard extends StatelessWidget {
  final SessionModel session;
  final VoidCallback? onTap;
  final VoidCallback? onSync;
  final VoidCallback? onFreeze;
  final VoidCallback? onDelete;

  const SessionCard({
    super.key,
    required this.session,
    this.onTap,
    this.onSync,
    this.onFreeze,
    this.onDelete,
  });

  Color get _statusColor {
    if (session.isFrozen) return SilkTheme.brand2;
    switch (session.status) {
      case SessionStatus.active:
        return SilkTheme.success;
      case SessionStatus.inactive:
        return SilkTheme.muted2;
      case SessionStatus.frozen:
        return SilkTheme.brand2;
      case SessionStatus.banned:
        return SilkTheme.danger;
      case SessionStatus.deleted:
        return SilkTheme.muted2;
    }
  }

  IconData get _statusIcon {
    if (session.isFrozen) return Icons.ac_unit;
    switch (session.status) {
      case SessionStatus.active:
        return Icons.check_circle;
      case SessionStatus.inactive:
        return Icons.remove_circle_outline;
      case SessionStatus.frozen:
        return Icons.ac_unit;
      case SessionStatus.banned:
        return Icons.block;
      case SessionStatus.deleted:
        return Icons.delete_outline;
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: SilkTheme.surfaceOf(context),
          borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
          border: Border.all(
            color: SilkTheme.borderOf(context),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header row
            Row(
              children: [
                // Phone icon with status
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: _statusColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(SilkTheme.radiusSmall),
                  ),
                  child: Icon(
                    Icons.phone_android,
                    color: _statusColor,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 12),
                // Name and phone
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
                      if (session.phone != null) ...[
                        const SizedBox(height: 2),
                        Text(
                          session.phone!,
                          style: TextStyle(
                            fontSize: 13,
                            color: SilkTheme.mutedOf(context),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                // Status badge
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: _statusColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(_statusIcon, size: 14, color: _statusColor),
                      const SizedBox(width: 4),
                      Text(
                        session.statusLabel,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: _statusColor,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 14),

            // Stats row
            Row(
              children: [
                _buildStatChip(
                  context,
                  Icons.group_outlined,
                  '${session.totalGroups} guruh',
                ),
                const SizedBox(width: 12),
                _buildStatChip(
                  context,
                  Icons.check_circle_outline,
                  '${session.activeGroups} faol',
                ),
                if (session.isPremium) ...[
                  const SizedBox(width: 12),
                  _buildStatChip(
                    context,
                    Icons.star,
                    'Premium',
                    color: SilkTheme.accent2,
                  ),
                ],
              ],
            ),

            const SizedBox(height: 12),

            // Action buttons
            Row(
              children: [
                if (onSync != null)
                  _buildActionButton(
                    icon: Icons.sync,
                    label: 'Sinxronlash',
                    onTap: onSync!,
                  ),
                if (onFreeze != null) ...[
                  const SizedBox(width: 8),
                  _buildActionButton(
                    icon: session.isFrozen ? Icons.play_arrow : Icons.ac_unit,
                    label: session.isFrozen ? 'Eritish' : 'Muzlatish',
                    onTap: onFreeze!,
                    color: SilkTheme.brand2,
                  ),
                ],
                const Spacer(),
                if (onDelete != null)
                  _buildActionButton(
                    icon: Icons.delete_outline,
                    label: "O'chirish",
                    onTap: onDelete!,
                    color: SilkTheme.danger,
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatChip(BuildContext context, IconData icon, String text, {Color? color}) {
    final c = color ?? SilkTheme.mutedOf(context);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: c),
        const SizedBox(width: 4),
        Text(
          text,
          style: TextStyle(fontSize: 12, color: c, fontWeight: FontWeight.w500),
        ),
      ],
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    Color? color,
  }) {
    final c = color ?? SilkTheme.brand;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: c.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: c),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: c,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
