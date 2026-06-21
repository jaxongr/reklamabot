import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/api_config.dart';
import '../../core/api/api_client.dart';
import '../../core/models/support.dart';

/// State for support tickets.
class SupportState {
  final List<SupportTicket> tickets;
  final SupportTicket? currentTicket;
  final List<SupportMessage> currentMessages;
  final bool isLoading;
  final String? error;

  const SupportState({
    this.tickets = const [],
    this.currentTicket,
    this.currentMessages = const [],
    this.isLoading = false,
    this.error,
  });

  SupportState copyWith({
    List<SupportTicket>? tickets,
    SupportTicket? currentTicket,
    List<SupportMessage>? currentMessages,
    bool? isLoading,
    String? error,
    bool clearCurrentTicket = false,
    bool clearError = false,
  }) {
    return SupportState(
      tickets: tickets ?? this.tickets,
      currentTicket:
          clearCurrentTicket ? null : (currentTicket ?? this.currentTicket),
      currentMessages: currentMessages ?? this.currentMessages,
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

/// Notifier for support ticket management.
class SupportNotifier extends StateNotifier<SupportState> {
  final ApiClient _api;

  SupportNotifier(this._api) : super(const SupportState());

  /// Load all support tickets.
  Future<void> loadTickets() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final response = await _api.get(ApiConfig.supportTickets);
      final data = response.data;

      List<dynamic> list;
      if (data is Map<String, dynamic>) {
        list = (data['data'] as List?) ?? [];
      } else if (data is List) {
        list = data;
      } else {
        list = [];
      }

      final tickets = list
          .map((e) => SupportTicket.fromJson(e as Map<String, dynamic>))
          .toList();

      // Sort by updatedAt descending (newest first)
      tickets.sort((a, b) => b.updatedAt.compareTo(a.updatedAt));

      state = state.copyWith(tickets: tickets, isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Tiketlarni yuklashda xatolik',
      );
    }
  }

  /// Create a new support ticket.
  Future<SupportTicket?> createTicket(
    String subject,
    String description,
  ) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final response = await _api.post(
        ApiConfig.supportTickets,
        data: {
          'subject': subject,
          'message': description,
        },
      );

      final data = response.data;
      if (data is Map<String, dynamic>) {
        final ticket = SupportTicket.fromJson(data);
        final updatedTickets = [ticket, ...state.tickets];
        state = state.copyWith(tickets: updatedTickets, isLoading: false);
        return ticket;
      }

      state = state.copyWith(isLoading: false);
      return null;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Tiket yaratishda xatolik',
      );
      return null;
    }
  }

  /// Load messages for a specific ticket.
  Future<void> loadMessages(String ticketId) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      // Find ticket in local state
      final ticket = state.tickets
          .where((t) => t.id == ticketId)
          .firstOrNull;

      final response = await _api.get(ApiConfig.supportMessages(ticketId));
      final data = response.data;

      List<dynamic> list;
      if (data is Map<String, dynamic>) {
        list = (data['data'] as List?) ?? [];
      } else if (data is List) {
        list = data;
      } else {
        list = [];
      }

      final messages = list
          .map((e) => SupportMessage.fromJson(e as Map<String, dynamic>))
          .toList();

      // Sort newest first (for reversed ListView)
      messages.sort((a, b) => b.createdAt.compareTo(a.createdAt));

      state = state.copyWith(
        currentTicket: ticket,
        currentMessages: messages,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Xabarlarni yuklashda xatolik',
      );
    }
  }

  /// Send a message to a ticket.
  Future<bool> sendMessage(String ticketId, String content) async {
    try {
      final response = await _api.post(
        ApiConfig.supportMessages(ticketId),
        data: {'message': content},
      );

      final data = response.data;
      if (data is Map<String, dynamic>) {
        final message = SupportMessage.fromJson(data);

        // Prepend to messages list (newest first)
        final updatedMessages = [message, ...state.currentMessages];
        state = state.copyWith(currentMessages: updatedMessages);
      }

      return true;
    } catch (_) {
      return false;
    }
  }

  /// Set current ticket for detail view.
  void setCurrentTicket(SupportTicket? ticket) {
    state = state.copyWith(
      currentTicket: ticket,
      clearCurrentTicket: ticket == null,
      currentMessages: ticket == null ? const [] : state.currentMessages,
    );
  }
}

/// Provider for support state.
final supportProvider =
    StateNotifierProvider<SupportNotifier, SupportState>((ref) {
  final api = ref.read(apiClientProvider);
  return SupportNotifier(api);
});
