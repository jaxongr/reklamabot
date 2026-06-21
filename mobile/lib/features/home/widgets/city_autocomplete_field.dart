import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../config/silk_theme.dart';
import '../providers/city_suggestions_provider.dart';

/// Shahar autocomplete field — takliflar dropdown bilan.
class CityAutocompleteField extends ConsumerStatefulWidget {
  final String label;
  final String hint;
  final TextEditingController controller;
  final ValueChanged<String> onChanged;
  final ValueChanged<String> onCitySelected;

  const CityAutocompleteField({
    super.key,
    required this.label,
    required this.hint,
    required this.controller,
    required this.onChanged,
    required this.onCitySelected,
  });

  @override
  ConsumerState<CityAutocompleteField> createState() =>
      _CityAutocompleteFieldState();
}

class _CityAutocompleteFieldState
    extends ConsumerState<CityAutocompleteField> {
  final _focusNode = FocusNode();
  final _layerLink = LayerLink();
  OverlayEntry? _overlayEntry;
  Timer? _debounce;
  String _query = '';
  bool _isSelecting = false;

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(_onFocusChange);
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _focusNode.removeListener(_onFocusChange);
    _focusNode.dispose();
    _removeOverlay();
    super.dispose();
  }

  void _onFocusChange() {
    if (!_focusNode.hasFocus) {
      // Kichik kechikish — tanlash eventini qo'ldan chiqarmaslik uchun
      Future.delayed(const Duration(milliseconds: 200), () {
        if (!_isSelecting) _removeOverlay();
      });
    }
  }

  void _onTextChanged(String value) {
    widget.onChanged(value);
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () {
      if (mounted) {
        setState(() => _query = value.trim());
        if (value.trim().length >= 2) {
          _showOverlay();
        } else {
          _removeOverlay();
        }
      }
    });
  }

  void _onCityTap(CitySuggestion city) {
    _isSelecting = true;
    widget.controller.text = city.name;
    widget.controller.selection = TextSelection.collapsed(
      offset: city.name.length,
    );
    widget.onCitySelected(city.name);
    _removeOverlay();
    _focusNode.unfocus();
    Future.delayed(const Duration(milliseconds: 100), () {
      _isSelecting = false;
    });
  }

  void _showOverlay() {
    _removeOverlay();
    if (_query.length < 2) return;

    final overlay = Overlay.of(context);
    final renderBox = context.findRenderObject() as RenderBox?;
    if (renderBox == null) return;

    _overlayEntry = OverlayEntry(
      builder: (ctx) => Positioned(
        width: renderBox.size.width,
        child: CompositedTransformFollower(
          link: _layerLink,
          showWhenUnlinked: false,
          offset: Offset(0, renderBox.size.height + 4),
          child: Material(
            elevation: 4,
            borderRadius: BorderRadius.circular(SilkTheme.radiusMedium),
            color: SilkTheme.surface,
            child: _SuggestionsList(
              query: _query,
              onTap: _onCityTap,
            ),
          ),
        ),
      ),
    );
    overlay.insert(_overlayEntry!);
  }

  void _removeOverlay() {
    _overlayEntry?.remove();
    _overlayEntry = null;
  }

  @override
  Widget build(BuildContext context) {
    return CompositedTransformTarget(
      link: _layerLink,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            widget.label,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: SilkTheme.muted,
            ),
          ),
          const SizedBox(height: 4),
          Container(
            decoration: BoxDecoration(
              color: SilkTheme.bg,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: SilkTheme.border),
            ),
            child: TextField(
              controller: widget.controller,
              focusNode: _focusNode,
              onChanged: _onTextChanged,
              style: const TextStyle(
                fontSize: 12,
                color: SilkTheme.ink,
              ),
              decoration: InputDecoration(
                hintText: widget.hint,
                hintStyle: const TextStyle(
                  fontSize: 12,
                  color: SilkTheme.muted,
                ),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 10,
                ),
                isDense: true,
                suffixIcon: widget.controller.text.isNotEmpty
                    ? GestureDetector(
                        onTap: () {
                          widget.controller.clear();
                          widget.onChanged('');
                          _removeOverlay();
                          setState(() => _query = '');
                        },
                        child: const Icon(
                          Icons.close,
                          size: 16,
                          color: SilkTheme.muted,
                        ),
                      )
                    : null,
                suffixIconConstraints: const BoxConstraints(
                  maxHeight: 30,
                  maxWidth: 30,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Takliflar ro'yxati — overlay ichida.
class _SuggestionsList extends ConsumerWidget {
  final String query;
  final ValueChanged<CitySuggestion> onTap;

  const _SuggestionsList({required this.query, required this.onTap});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final suggestionsAsync = ref.watch(citySuggestionsProvider(query));

    return suggestionsAsync.when(
      loading: () => const Padding(
        padding: EdgeInsets.all(12),
        child: Center(
          child: SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              color: SilkTheme.brand,
            ),
          ),
        ),
      ),
      error: (_, __) => const SizedBox.shrink(),
      data: (suggestions) {
        if (suggestions.isEmpty) return const SizedBox.shrink();

        return ConstrainedBox(
          constraints: const BoxConstraints(maxHeight: 200),
          child: ListView.separated(
            shrinkWrap: true,
            padding: const EdgeInsets.symmetric(vertical: 4),
            itemCount: suggestions.length,
            separatorBuilder: (_, __) => const Divider(
              height: 1,
              thickness: 0.5,
              indent: 12,
              endIndent: 12,
              color: SilkTheme.border,
            ),
            itemBuilder: (_, index) {
              final city = suggestions[index];
              return InkWell(
                onTap: () => onTap(city),
                borderRadius: BorderRadius.circular(SilkTheme.radiusSmall),
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 10,
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.location_on_outlined,
                        size: 16,
                        color: SilkTheme.brand,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          city.displayName,
                          style: const TextStyle(
                            fontSize: 13,
                            color: SilkTheme.ink,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        );
      },
    );
  }
}
