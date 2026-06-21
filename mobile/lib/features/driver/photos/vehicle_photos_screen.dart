import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../../config/silk_theme.dart';
import 'photos_provider.dart';

/// Foto turi ma'lumotlari
enum _PhotoSlot {
  front('FRONT', 'Old tomondan'),
  back('BACK', 'Orqa tomondan'),
  left('LEFT', 'Chap yondan'),
  right('RIGHT', "O'ng yondan"),
  interior('INTERIOR', 'Yuk xonasi ichi'),
  exterior('EXTERIOR', 'Tashqi ko\'rinish');

  final String type;
  final String label;
  const _PhotoSlot(this.type, this.label);
}

/// Mashina fotolarini yuklash sahifasi — Fotokontrol
/// 6 ta foto turi: FRONT, BACK, LEFT, RIGHT, INTERIOR, EXTERIOR
class VehiclePhotosScreen extends ConsumerStatefulWidget {
  const VehiclePhotosScreen({super.key});

  @override
  ConsumerState<VehiclePhotosScreen> createState() =>
      _VehiclePhotosScreenState();
}

class _VehiclePhotosScreenState extends ConsumerState<VehiclePhotosScreen> {
  final ImagePicker _picker = ImagePicker();
  final Map<String, File?> _photos = {};
  bool _isUploading = false;

  int get _selectedCount =>
      _photos.values.where((f) => f != null).length;

  Future<void> _pickPhoto(_PhotoSlot slot) async {
    final source = await _showPickerSheet();
    if (source == null) return;

    try {
      final image = await _picker.pickImage(
        source: source,
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );
      if (image == null) return;

      setState(() {
        _photos[slot.type] = File(image.path);
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Foto tanlashda xatolik'),
            backgroundColor: SilkTheme.danger,
          ),
        );
      }
    }
  }

  Future<ImageSource?> _showPickerSheet() async {
    return showModalBottomSheet<ImageSource>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: SilkTheme.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Surat tanlang',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: SilkTheme.ink,
                ),
              ),
              const SizedBox(height: 16),
              ListTile(
                leading: Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: SilkTheme.brand.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.camera_alt_outlined,
                    color: SilkTheme.brand,
                  ),
                ),
                title: const Text(
                  'Kamera',
                  style: TextStyle(
                    fontWeight: FontWeight.w500,
                    color: SilkTheme.ink,
                  ),
                ),
                onTap: () => Navigator.pop(ctx, ImageSource.camera),
              ),
              ListTile(
                leading: Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: SilkTheme.brand.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.photo_library_outlined,
                    color: SilkTheme.brand,
                  ),
                ),
                title: const Text(
                  'Galereya',
                  style: TextStyle(
                    fontWeight: FontWeight.w500,
                    color: SilkTheme.ink,
                  ),
                ),
                onTap: () => Navigator.pop(ctx, ImageSource.gallery),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _removePhoto(_PhotoSlot slot) {
    setState(() {
      _photos[slot.type] = null;
    });
  }

  Future<void> _uploadPhotos() async {
    if (_selectedCount == 0) return;

    setState(() => _isUploading = true);

    final notifier = ref.read(vehiclePhotosProvider.notifier);
    int success = 0;
    int failed = 0;

    // Tanlangan har bir suratni real API orqali yuklash
    for (final entry in _photos.entries) {
      final file = entry.value;
      if (file == null) continue;
      final ok = await notifier.uploadPhoto(entry.key, file.path);
      if (ok) {
        success++;
      } else {
        failed++;
      }
    }

    if (!mounted) return;
    setState(() => _isUploading = false);

    if (failed == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('$success ta surat muvaffaqiyatli yuborildi'),
          backgroundColor: SilkTheme.success,
        ),
      );
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("$success ta yuborildi, $failed ta xatolik. Qayta urinib ko'ring"),
          backgroundColor: SilkTheme.danger,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SilkTheme.bg,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Fotokontrol'),
      ),
      body: Column(
        children: [
          // ── Tavsif ──
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Text(
              'Mashiningiz suratlarini yuklang. Barcha 6 ta surat talab qilinadi.',
              style: const TextStyle(
                fontSize: 14,
                color: SilkTheme.muted,
              ),
            ),
          ),

          // ── 2x3 Grid ──
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.95,
              ),
              itemCount: _PhotoSlot.values.length,
              itemBuilder: (context, index) {
                final slot = _PhotoSlot.values[index];
                final file = _photos[slot.type];
                return _buildPhotoSlot(slot, file);
              },
            ),
          ),

          // ── Yuborish tugmasi ──
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
            child: SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed:
                    (_selectedCount >= 1 && !_isUploading) ? _uploadPhotos : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: SilkTheme.brand,
                  foregroundColor: Colors.white,
                  disabledBackgroundColor: SilkTheme.brand.withValues(alpha: 0.4),
                  disabledForegroundColor: Colors.white70,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isUploading
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          color: Colors.white,
                        ),
                      )
                    : Text(
                        'Suratlarni yuborish ($_selectedCount/6)',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPhotoSlot(_PhotoSlot slot, File? file) {
    final hasPhoto = file != null;

    return GestureDetector(
      onTap: hasPhoto ? null : () => _pickPhoto(slot),
      child: Container(
        decoration: BoxDecoration(
          color: SilkTheme.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: hasPhoto
                ? SilkTheme.success.withValues(alpha: 0.5)
                : SilkTheme.border,
            width: hasPhoto ? 2 : 1.5,
            strokeAlign: BorderSide.strokeAlignInside,
          ),
        ),
        clipBehavior: Clip.antiAlias,
        child: hasPhoto
            ? Stack(
                fit: StackFit.expand,
                children: [
                  Image.file(
                    file,
                    fit: BoxFit.cover,
                  ),
                  // Overlay label
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      color: Colors.black.withValues(alpha: 0.5),
                      child: Text(
                        slot.label,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                  // Remove button
                  Positioned(
                    top: 6,
                    right: 6,
                    child: GestureDetector(
                      onTap: () => _removePhoto(slot),
                      child: Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          color: SilkTheme.danger.withValues(alpha: 0.9),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.close,
                          color: Colors.white,
                          size: 16,
                        ),
                      ),
                    ),
                  ),
                ],
              )
            : _buildEmptySlot(slot),
      ),
    );
  }

  Widget _buildEmptySlot(_PhotoSlot slot) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(
          Icons.camera_alt_outlined,
          color: SilkTheme.brand,
          size: 32,
        ),
        const SizedBox(height: 8),
        Text(
          slot.label,
          style: const TextStyle(
            fontSize: 12,
            color: SilkTheme.muted,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}
