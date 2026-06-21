import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/api_config.dart';
import '../api/api_client.dart';
import '../api/websocket_client.dart';

/// Information about a currently running posting job.
class PostingJob {
  final String jobId;
  final String adId;
  final String status;
  final int totalGroups;
  final int completedGroups;
  final int failedGroups;
  final int skippedGroups;
  final String? lastError;
  final DateTime? startedAt;

  const PostingJob({
    required this.jobId,
    required this.adId,
    required this.status,
    required this.totalGroups,
    this.completedGroups = 0,
    this.failedGroups = 0,
    this.skippedGroups = 0,
    this.lastError,
    this.startedAt,
  });

  double get progress =>
      totalGroups > 0 ? completedGroups / totalGroups : 0.0;

  bool get isRunning => status == 'running' || status == 'IN_PROGRESS';

  PostingJob copyWith({
    String? status,
    int? completedGroups,
    int? failedGroups,
    int? skippedGroups,
    String? lastError,
  }) {
    return PostingJob(
      jobId: jobId,
      adId: adId,
      status: status ?? this.status,
      totalGroups: totalGroups,
      completedGroups: completedGroups ?? this.completedGroups,
      failedGroups: failedGroups ?? this.failedGroups,
      skippedGroups: skippedGroups ?? this.skippedGroups,
      lastError: lastError ?? this.lastError,
      startedAt: startedAt,
    );
  }

  factory PostingJob.fromJson(Map<String, dynamic> json) {
    return PostingJob(
      jobId: json['jobId'] as String? ?? json['id'] as String? ?? '',
      adId: json['adId'] as String? ?? '',
      status: json['status'] as String? ?? 'unknown',
      totalGroups: json['totalGroups'] as int? ?? 0,
      completedGroups: json['completedGroups'] as int? ?? 0,
      failedGroups: json['failedGroups'] as int? ?? 0,
      skippedGroups: json['skippedGroups'] as int? ?? 0,
      lastError: json['lastError'] as String?,
      startedAt: json['startedAt'] != null
          ? DateTime.tryParse(json['startedAt'] as String)
          : null,
    );
  }
}

/// Service to manage posting operations via REST + WebSocket.
class PostingApiService {
  final ApiClient _api;
  final WebSocketClient _ws;

  final StreamController<PostingJob> _progressController =
      StreamController<PostingJob>.broadcast();
  StreamSubscription? _wsSubscription;

  /// Stream of posting progress updates from WebSocket.
  Stream<PostingJob> get progressStream => _progressController.stream;

  PostingApiService({required ApiClient api, required WebSocketClient ws})
      : _api = api,
        _ws = ws {
    _listenWs();
  }

  void _listenWs() {
    _wsSubscription = _ws.events.listen((event) {
      if (event.type == WsEventType.postingProgress ||
          event.type == WsEventType.postingComplete ||
          event.type == WsEventType.postingError) {
        _progressController.add(PostingJob.fromJson(event.data));
      }
    });
  }

  /// Start posting for an ad.
  Future<PostingJob> startPosting(String adId) async {
    final response = await _api.post(ApiConfig.startPosting(adId));
    return PostingJob.fromJson(response.data as Map<String, dynamic>);
  }

  /// Stop posting for an ad.
  Future<void> stopPosting(String adId) async {
    await _api.post(ApiConfig.stopPosting(adId));
  }

  /// Get current posting status for an ad.
  Future<PostingJob?> getPostingStatus(String adId) async {
    final response = await _api.get(ApiConfig.postingStatus(adId));
    final data = response.data as Map<String, dynamic>;
    if (data['active'] == false) return null;
    return PostingJob.fromJson(data);
  }

  /// Create a new post distribution.
  Future<Map<String, dynamic>> createPost({
    required String adId,
    int? intervalMin,
    int? intervalMax,
    int? groupInterval,
    bool? usePriorityGroups,
    List<String>? selectedSessions,
  }) async {
    final response = await _api.post(
      ApiConfig.posts,
      data: {
        'adId': adId,
        if (intervalMin != null) 'intervalMin': intervalMin,
        if (intervalMax != null) 'intervalMax': intervalMax,
        if (groupInterval != null) 'groupInterval': groupInterval,
        if (usePriorityGroups != null) 'usePriorityGroups': usePriorityGroups,
        if (selectedSessions != null) 'selectedSessions': selectedSessions,
      },
    );
    return response.data as Map<String, dynamic>;
  }

  /// Get all posts for the current user.
  Future<List<Map<String, dynamic>>> getPosts({
    String? status,
    String? adId,
    int? limit,
  }) async {
    final response = await _api.get(
      ApiConfig.posts,
      queryParameters: {
        if (status != null) 'status': status,
        if (adId != null) 'adId': adId,
        if (limit != null) 'limit': limit.toString(),
      },
    );
    final list = response.data as List<dynamic>;
    return list.cast<Map<String, dynamic>>();
  }

  /// Get post statistics.
  Future<Map<String, dynamic>> getPostStatistics() async {
    final response = await _api.get(ApiConfig.postStatistics);
    return response.data as Map<String, dynamic>;
  }

  /// Start a specific post distribution.
  Future<void> startPost(String postId) async {
    await _api.post(ApiConfig.postStart(postId));
  }

  /// Pause a specific post distribution.
  Future<void> pausePost(String postId) async {
    await _api.post(ApiConfig.postPause(postId));
  }

  /// Resume a specific post distribution.
  Future<void> resumePost(String postId) async {
    await _api.post(ApiConfig.postResume(postId));
  }

  /// Cancel a specific post distribution.
  Future<void> cancelPost(String postId) async {
    await _api.post(ApiConfig.postCancel(postId));
  }

  void dispose() {
    _wsSubscription?.cancel();
    _progressController.close();
  }
}

/// Provider for the posting API service.
final postingApiServiceProvider = Provider<PostingApiService>((ref) {
  final api = ref.read(apiClientProvider);
  final ws = ref.read(wsClientProvider);
  final service = PostingApiService(api: api, ws: ws);
  ref.onDispose(() => service.dispose());
  return service;
});
