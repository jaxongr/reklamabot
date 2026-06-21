import 'package:flutter/material.dart';
import '../config/theme.dart';

/// Yulduzchalar bilan reyting ko'rsatish
class RatingStars extends StatelessWidget {
  final double rating;
  final int count;
  final double size;

  const RatingStars({
    super.key,
    required this.rating,
    this.count = 0,
    this.size = 14,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        ...List.generate(5, (i) {
          final filled = rating >= i + 1;
          final half = rating >= i + 0.5 && rating < i + 1;
          return Icon(
            filled ? Icons.star_rounded : half ? Icons.star_half_rounded : Icons.star_outline_rounded,
            size: size,
            color: filled || half ? const Color(0xFFF59E0B) : const Color(0xFFD1D5DB),
          );
        }),
        if (count > 0) ...[
          const SizedBox(width: 4),
          Text(
            '($count)',
            style: TextStyle(
              fontSize: size * 0.75,
              color: AppTheme.textSecondaryOf(context),
            ),
          ),
        ],
      ],
    );
  }
}

/// Baholash dialog
class RatingDialog extends StatefulWidget {
  final String userName;
  final Function(int score, String? comment) onRate;

  const RatingDialog({
    super.key,
    required this.userName,
    required this.onRate,
  });

  @override
  State<RatingDialog> createState() => _RatingDialogState();
}

class _RatingDialogState extends State<RatingDialog> {
  int _score = 0;
  final _commentCtrl = TextEditingController();

  @override
  void dispose() {
    _commentCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: Text(
        '${widget.userName} ni baholang',
        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
        textAlign: TextAlign.center,
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Yulduzchalar
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(5, (i) {
              return GestureDetector(
                onTap: () => setState(() => _score = i + 1),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: Icon(
                    i < _score ? Icons.star_rounded : Icons.star_outline_rounded,
                    size: 40,
                    color: i < _score ? const Color(0xFFF59E0B) : const Color(0xFFD1D5DB),
                  ),
                ),
              );
            }),
          ),
          const SizedBox(height: 16),
          // Izoh
          TextField(
            controller: _commentCtrl,
            maxLines: 2,
            decoration: InputDecoration(
              hintText: 'Izoh (ixtiyoriy)',
              hintStyle: TextStyle(color: AppTheme.textHintOf(context)),
              filled: true,
              fillColor: AppTheme.bgBodyOf(context),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide.none,
              ),
            ),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Bekor'),
        ),
        ElevatedButton(
          onPressed: _score == 0
              ? null
              : () {
                  widget.onRate(_score, _commentCtrl.text.trim().isEmpty ? null : _commentCtrl.text.trim());
                  Navigator.pop(context);
                },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.primary,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          child: const Text('Baholash'),
        ),
      ],
    );
  }
}
