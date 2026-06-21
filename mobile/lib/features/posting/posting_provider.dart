import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/api_config.dart';
import '../../core/api/api_client.dart';
import '../../core/models/ad.dart';
import '../../core/services/posting_service.dart';

/// State for the posting screen.
class PostingState {
  final List<Ad> ads;
  final Map<String, PostingJob> activeJobs; // adId -> job
  final bool isLoading;
  final String? error;

  const PostingState({
    this.ads = const [],
    this.activeJobs = const {},
    this.isLoading = false,
    this.error,
  });

  PostingState copyWith({
    List<Ad>? ads,
    Map<String, PostingJob>? activeJobs,
    bool? isLoading,
    String? error,
  }) {
    return PostingState(
      ads: ads ?? this.ads,
      activeJobs: activeJobs ?? this.activeJobs,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Notifier for posting management.
class PostingNotifier extends StateNotifier<PostingState> {
  final ApiClient _api;
  final PostingApiService _postingService;
  StreamSubscription? _progressSub;

  PostingNotifier(this._api, this._postingService)
      : super(const PostingState()) {
    _listenProgress();
    loadData();
  }

  void _listenProgress() {
    _progressSub = _postingService.progressStream.listen((job) {
      final jobs = Map<String, PostingJob>.from(state.activeJobs);
      jobs[job.adId] = job;
      state = state.copyWith(activeJobs: jobs);
    });
  }

  Future<void> loadData() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      // Load ads
      final adsRes = await _api.get(ApiConfig.ads);
      final adsData = adsRes.data;
      List<dynamic> adsList;
      if (adsData is List) {
        adsList = adsData;
      } else if (adsData is Map<String, dynamic>) {
        adsList = (adsData['data'] as List?) ?? [];
      } else {
        adsList = [];
      }

      final ads = adsList
          .map((e) => Ad.fromJson(e as Map<String, dynamic>))
          .where((ad) =>
              ad.status == AdStatus.active || ad.status == AdStatus.paused)
          .toList();

      // Check posting status for each ad
      final jobs = <String, PostingJob>{};
      for (final ad in ads) {
        try {
          final job = await _postingService.getPostingStatus(ad.id);
          if (job != null) {
            jobs[ad.id] = job;
          }
        } catch (_) {
          // Skip failed status checks
        }
      }

      state = PostingState(
        ads: ads,
        activeJobs: jobs,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Ma\'lumotlarni yuklashda xatolik',
      );
    }
  }

  Future<void> startPosting(String adId) async {
    try {
      final job = await _postingService.startPosting(adId);
      final jobs = Map<String, PostingJob>.from(state.activeJobs);
      jobs[adId] = job;
      state = state.copyWith(activeJobs: jobs);
    } catch (e) {
      state = state.copyWith(error: 'Tarqatishni boshlashda xatolik');
    }
  }

  Future<void> stopPosting(String adId) async {
    try {
      await _postingService.stopPosting(adId);
      final jobs = Map<String, PostingJob>.from(state.activeJobs);
      jobs.remove(adId);
      state = state.copyWith(activeJobs: jobs);
    } catch (e) {
      state = state.copyWith(error: 'Tarqatishni to\'xtatishda xatolik');
    }
  }

  @override
  void dispose() {
    _progressSub?.cancel();
    super.dispose();
  }
}

/// Provider for posting state.
final postingProvider =
    StateNotifierProvider<PostingNotifier, PostingState>((ref) {
  final api = ref.read(apiClientProvider);
  final postingService = ref.read(postingApiServiceProvider);
  return PostingNotifier(api, postingService);
});
