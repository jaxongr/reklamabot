import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../config/api_config.dart';
import '../../../core/api/api_client.dart';

// ============================================================
// VEHICLE PHOTOS STATE
// ============================================================

class VehiclePhotosState {
  /// type -> url mapping (e.g., 'FRONT' -> 'https://...')
  final Map<String, String?> photos;
  final bool isUploading;
  final String? error;

  const VehiclePhotosState({
    this.photos = const {},
    this.isUploading = false,
    this.error,
  });

  VehiclePhotosState copyWith({
    Map<String, String?>? photos,
    bool? isUploading,
    String? error,
  }) {
    return VehiclePhotosState(
      photos: photos ?? this.photos,
      isUploading: isUploading ?? this.isUploading,
      error: error,
    );
  }
}

// ============================================================
// VEHICLE PHOTOS NOTIFIER
// ============================================================

class VehiclePhotosNotifier extends StateNotifier<VehiclePhotosState> {
  final ApiClient _api;

  VehiclePhotosNotifier(this._api) : super(const VehiclePhotosState()) {
    loadPhotos();
  }

  /// GET /drivers/photos - barcha mashina fotolarini olish
  Future<void> loadPhotos() async {
    try {
      final response = await _api.get(ApiConfig.driverPhotos);
      final data = response.data;

      final Map<String, String?> photos = {};

      if (data is Map<String, dynamic>) {
        // Agar {FRONT: 'url', BACK: 'url', ...} formatida kelsa
        if (data.containsKey('photos')) {
          final photosData = data['photos'];
          if (photosData is Map<String, dynamic>) {
            for (final entry in photosData.entries) {
              photos[entry.key] = entry.value as String?;
            }
          } else if (photosData is List) {
            for (final item in photosData) {
              if (item is Map<String, dynamic>) {
                final type = item['type'] as String?;
                final url = item['url'] as String?;
                if (type != null) photos[type] = url;
              }
            }
          }
        } else {
          // To'g'ridan-to'g'ri map formatida
          for (final entry in data.entries) {
            if (entry.value is String?) {
              photos[entry.key] = entry.value as String?;
            }
          }
        }
      } else if (data is List) {
        for (final item in data) {
          if (item is Map<String, dynamic>) {
            final type = item['type'] as String?;
            final url = item['url'] as String?;
            if (type != null) photos[type] = url;
          }
        }
      }

      state = state.copyWith(photos: photos);
    } catch (e) {
      state = state.copyWith(error: 'Fotolarni yuklashda xatolik');
    }
  }

  /// Fotoni yuklash — 2 bosqichli:
  /// 1) POST /upload/receipt (multipart 'file') → { url }
  /// 2) POST /drivers/photos/$type (JSON { url }) — backend shu formatni kutadi
  Future<bool> uploadPhoto(String type, String filePath) async {
    state = state.copyWith(isUploading: true, error: null);
    try {
      // 1-bosqich: faylni serverga yuklab URL olish
      final fileName = filePath.split(RegExp(r'[\\/]')).last;
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(filePath, filename: fileName),
      });
      final uploadResp = await _api.dio.post(
        ApiConfig.uploadReceipt,
        data: formData,
        options: Options(contentType: 'multipart/form-data'),
      );

      String? uploadedUrl;
      final upData = uploadResp.data;
      if (upData is Map<String, dynamic>) {
        uploadedUrl = upData['url'] as String?;
      } else if (upData is String) {
        uploadedUrl = upData;
      }
      if (uploadedUrl == null || uploadedUrl.isEmpty) {
        state = state.copyWith(
          isUploading: false,
          error: 'Fayl serverga yuklanmadi',
        );
        return false;
      }

      // 2-bosqich: URL ni driver foto sifatida ro'yxatdan o'tkazish
      await _api.post(
        ApiConfig.driverPhotoUpload(type),
        data: {'url': uploadedUrl},
      );

      // Lokal state yangilash
      final updatedPhotos = Map<String, String?>.from(state.photos);
      updatedPhotos[type] = uploadedUrl;
      state = state.copyWith(photos: updatedPhotos, isUploading: false);

      return true;
    } catch (e) {
      state = state.copyWith(
        isUploading: false,
        error: 'Foto yuklashda xatolik',
      );
      return false;
    }
  }
}

// ============================================================
// PROVIDER
// ============================================================

final vehiclePhotosProvider =
    StateNotifierProvider<VehiclePhotosNotifier, VehiclePhotosState>((ref) {
  final api = ref.read(apiClientProvider);
  return VehiclePhotosNotifier(api);
});
