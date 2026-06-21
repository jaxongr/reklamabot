import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import type {
  Ad,
  User,
  Session,
  Post,
  Payment,
  Group,
  DashboardStats,
  PaginatedResponse,
  ListResponse,
  PostStatistics,
  PaymentStatistics,
  Subscription,
  PlanDetails,
  PaymentCard,
  AdStatus,
  PostStatus,
  PaymentStatus,
  SessionStatus,
  MonitorSession,
  MonitorStats,
  Order,
  OrderStatus,
  OrderType,
  OrderStats,
  FilterRules,
  BlockedUser,
  BlockedUsersStats,
  DriverProfile,
  DriverOfferItem,
  PrivateOrderItem,
  DriverStats,
  DriverMapItem,
  DispatcherLocation,
  RouteAnalytics,
  VehicleTypeStat,
  DayRouteAnalytics,
  PriceEstimate,
  Notification,
  UserNotification,
  NotificationTarget,
  ChatRoom,
  ChatRoomType,
  ChatMessage,
  SupportTicket,
  SupportTicketStatus,
  SmsLog,
  SmsStats,
  VehiclePhoto,
} from '../types'

// ===================== ADS =====================

export const useAds = (params?: { status?: AdStatus; search?: string; skip?: number; take?: number }) =>
  useQuery<PaginatedResponse<Ad>>({
    queryKey: ['ads', params],
    queryFn: async () => {
      const response = await api.get('/ads', { params })
      return response.data
    },
  })

export const useAd = (id: string) =>
  useQuery<Ad>({
    queryKey: ['ads', id],
    queryFn: async () => {
      const response = await api.get(`/ads/${id}`)
      return response.data
    },
    enabled: !!id,
  })

export const useAdStats = () =>
  useQuery({
    queryKey: ['ads', 'stats'],
    queryFn: async () => {
      const response = await api.get('/ads/stats')
      return response.data
    },
  })

export const useCreateAd = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Ad>) => {
      const response = await api.post('/ads', data)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ads'] }),
  })
}

export const useUpdateAd = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Ad> & { id: string }) => {
      const response = await api.patch(`/ads/${id}`, data)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ads'] }),
  })
}

export const useDeleteAd = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/ads/${id}`)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ads'] }),
  })
}

export const usePublishAd = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/ads/${id}/publish`)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ads'] }),
  })
}

export const usePauseAd = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/ads/${id}/pause`)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ads'] }),
  })
}

export const useDuplicateAd = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/ads/${id}/duplicate`)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ads'] }),
  })
}

// ===================== SESSIONS =====================

export const useSessions = (params?: { status?: SessionStatus }) =>
  useQuery<ListResponse<Session>>({
    queryKey: ['sessions', params],
    queryFn: async () => {
      const response = await api.get('/sessions', { params })
      return response.data
    },
  })

export const useSession = (id: string) =>
  useQuery<Session>({
    queryKey: ['sessions', id],
    queryFn: async () => {
      const response = await api.get(`/sessions/${id}`)
      return response.data
    },
    enabled: !!id,
  })

export const useCreateSession = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name?: string; phone?: string; sessionString?: string }) => {
      const response = await api.post('/sessions', data)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
  })
}

export const useDeleteSession = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/sessions/${id}`)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
  })
}

// ===================== GROUPS =====================

export const useGroups = (sessionId: string, params?: { active?: boolean; priority?: boolean }) =>
  useQuery<ListResponse<Group>>({
    queryKey: ['groups', sessionId, params],
    queryFn: async () => {
      const response = await api.get(`/sessions/${sessionId}/groups`, { params })
      return response.data
    },
    enabled: !!sessionId,
  })

// ===================== POSTS =====================

export const usePosts = (params?: { status?: PostStatus; adId?: string; limit?: number }) =>
  useQuery<ListResponse<Post>>({
    queryKey: ['posts', params],
    queryFn: async () => {
      const response = await api.get('/posts', { params })
      return response.data
    },
  })

export const usePostStatistics = () =>
  useQuery<PostStatistics>({
    queryKey: ['posts', 'statistics'],
    queryFn: async () => {
      const response = await api.get('/posts/statistics')
      return response.data
    },
  })

export const useCreatePost = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { adId: string; usePriorityGroups?: boolean; selectedSessions?: string[] }) => {
      const response = await api.post('/posts', data)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  })
}

export const useStartPost = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/posts/${id}/start`)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  })
}

export const usePausePost = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/posts/${id}/pause`)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  })
}

export const useResumePost = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/posts/${id}/resume`)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  })
}

export const useCancelPost = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/posts/${id}/cancel`)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  })
}

export const useRetryPost = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/posts/${id}/retry`)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  })
}

// ===================== PAYMENTS =====================

export const usePayments = (params?: { status?: PaymentStatus; skip?: number; take?: number }) =>
  useQuery<PaginatedResponse<Payment>>({
    queryKey: ['payments', params],
    queryFn: async () => {
      const response = await api.get('/payments', { params })
      return response.data
    },
  })

export const useMyPayments = () =>
  useQuery<ListResponse<Payment>>({
    queryKey: ['payments', 'my'],
    queryFn: async () => {
      const response = await api.get('/payments/my')
      return response.data
    },
  })

export const usePaymentStatistics = () =>
  useQuery<PaymentStatistics>({
    queryKey: ['payments', 'statistics'],
    queryFn: async () => {
      const response = await api.get('/payments/statistics')
      return response.data
    },
  })

export const useCreatePayment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { amount: number; planType: string; currency?: string; receiptImage?: string }) => {
      const response = await api.post('/payments', data)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  })
}

export const useApprovePayment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/payments/${id}/approve`)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  })
}

export const useRejectPayment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await api.post(`/payments/${id}/reject`, { reason })
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  })
}

// ===================== SYSTEM CONFIG =====================

export const usePaymentCards = () =>
  useQuery<PaymentCard[]>({
    queryKey: ['config', 'payment-cards'],
    queryFn: async () => {
      const response = await api.get('/config/payment-cards')
      return response.data
    },
  })

export const useUpdatePaymentCards = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (cards: PaymentCard[]) => {
      const response = await api.put('/config/payment-cards', { cards })
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['config', 'payment-cards'] }),
  })
}

// ===================== UPLOAD =====================

export const useUploadReceipt = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const response = await api.post('/upload/receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data as { url: string; filename: string; size: number }
    },
  })
}

// ===================== ANALYTICS =====================

export const useDashboardStats = (params?: { startDate?: string; endDate?: string }) =>
  useQuery<DashboardStats>({
    queryKey: ['analytics', 'dashboard', params],
    queryFn: async () => {
      const response = await api.get('/analytics/dashboard', { params })
      return response.data
    },
  })

// ===================== SUBSCRIPTIONS =====================

export const useSubscriptionPlans = () =>
  useQuery<Array<PlanDetails & { type: string }>>({
    queryKey: ['subscriptions', 'plans'],
    queryFn: async () => {
      const response = await api.get('/subscriptions/plans')
      return response.data
    },
  })

export const useMySubscription = () =>
  useQuery<Subscription | null>({
    queryKey: ['subscriptions', 'my'],
    queryFn: async () => {
      const response = await api.get('/subscriptions/my')
      return response.data
    },
  })

export const useConfigSubscriptionPlans = () =>
  useQuery<Array<PlanDetails & { type: string }> | null>({
    queryKey: ['config', 'subscription-plans'],
    queryFn: async () => {
      const response = await api.get('/config/subscription-plans')
      return response.data
    },
  })

export const useUpdateSubscriptionPlans = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (plans: Array<PlanDetails & { type: string }>) => {
      const response = await api.put('/config/subscription-plans', { plans })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'subscription-plans'] })
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'plans'] })
    },
  })
}

// ===================== USER =====================

export const useProfile = () =>
  useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const response = await api.get('/users/profile')
      return response.data
    },
  })

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { firstName?: string; lastName?: string; username?: string; phoneNumber?: string }) => {
      const user = useAuthStore.getState().user
      if (!user) throw new Error('Not authenticated')
      const response = await api.patch(`/users/${user.id}`, data)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user'] }),
  })
}

// Import authStore for profile update
import { useAuthStore } from '../stores/authStore'

// ===================== USERS MANAGEMENT =====================

export const useUsers = (params?: { search?: string; role?: string; skip?: number; take?: number }) =>
  useQuery<PaginatedResponse<User>>({
    queryKey: ['users', params],
    queryFn: async () => {
      const response = await api.get('/users', { params })
      return response.data
    },
  })

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const response = await api.patch(`/users/${id}/role`, { role })
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

export const useToggleUserActive = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch(`/users/${id}/toggle-active`)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

// ===================== SESSION STATUS =====================

export const useSessionStatuses = () =>
  useQuery<Array<{ sessionId: string; connected: boolean; error?: string }>>({
    queryKey: ['sessions', 'connection-status'],
    queryFn: async () => {
      const response = await api.get('/sessions/connection-status')
      return response.data
    },
  })

// ===================== POSTING COMMANDS =====================

export const useStartPosting = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (adId: string) => {
      const response = await api.post(`/posts/start-posting/${adId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['ads'] })
    },
  })
}

export const useStopPosting = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (adId: string) => {
      const response = await api.post(`/posts/stop-posting/${adId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['ads'] })
    },
  })
}

export const usePostingStatus = (adId: string) =>
  useQuery({
    queryKey: ['posts', 'posting-status', adId],
    queryFn: async () => {
      const response = await api.get(`/posts/posting-status/${adId}`)
      return response.data
    },
    enabled: !!adId,
    refetchInterval: 5000,
  })

// ===================== MONITOR SESSIONS =====================

export const useMonitorSessions = (module: string = 'LOGISTIKA') =>
  useQuery<MonitorSession[]>({
    queryKey: ['monitor', 'sessions', module],
    queryFn: async () => {
      const response = await api.get('/monitor/sessions', { params: { module } })
      return response.data
    },
  })

export const useMonitorStats = (module: string = 'LOGISTIKA') =>
  useQuery<MonitorStats>({
    queryKey: ['monitor', 'stats', module],
    queryFn: async () => {
      const response = await api.get('/monitor/stats', { params: { module } })
      return response.data
    },
  })

export const useMonitorSendCode = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { phone: string; name?: string; module?: string }) => {
      const response = await api.post('/monitor/sessions/send-code', data)
      return response.data as { monitorSessionId: string; phoneCodeHash: string }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['monitor'] }),
  })
}

export const useMonitorSignIn = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, code, password }: { id: string; code: string; password?: string }) => {
      const response = await api.post(`/monitor/sessions/${id}/sign-in`, { code, password })
      return response.data as { success: boolean; needPassword?: boolean }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['monitor'] }),
  })
}

export const useDeleteMonitorSession = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/monitor/sessions/${id}`)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['monitor'] }),
  })
}

// ===================== PRIORITY GROUPS =====================

export const usePriorityGroups = () =>
  useQuery<Array<{ groupTelegramId: string; title?: string; addedAt?: string }>>({
    queryKey: ['monitor', 'priority-groups'],
    queryFn: async () => {
      const response = await api.get('/monitor/priority-groups')
      return response.data
    },
  })

export const useAddPriorityGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (groupTelegramId: string) => {
      const response = await api.post('/monitor/priority-groups', { groupTelegramId })
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['monitor', 'priority-groups'] }),
  })
}

export const useRemovePriorityGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (groupTelegramId: string) => {
      const response = await api.delete(`/monitor/priority-groups/${groupTelegramId}`)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['monitor', 'priority-groups'] }),
  })
}

export const useSyncPriorityGroupsToAll = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/monitor/priority-groups/sync-all')
      return response.data as { ok: boolean; message: string }
    },
  })
}

// ===================== ORDERS =====================

export const useOrders = (params?: {
  status?: OrderStatus
  type?: OrderType
  scope?: string
  search?: string
  cargoFrom?: string
  cargoTo?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
  module?: string
}) =>
  useQuery<{ data: Order[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>({
    queryKey: ['orders', params],
    queryFn: async () => {
      const response = await api.get('/orders', { params })
      return response.data
    },
  })

export const useOrder = (id: string) =>
  useQuery<Order>({
    queryKey: ['orders', id],
    queryFn: async () => {
      const response = await api.get(`/orders/${id}`)
      return response.data
    },
    enabled: !!id,
  })

export const useOrderStats = (module: string = 'LOGISTIKA') =>
  useQuery<OrderStats>({
    queryKey: ['order-stats', module],
    queryFn: async () => {
      const response = await api.get('/orders/stats', { params: { module } })
      return response.data
    },
    refetchInterval: 10_000,
  })

export const useAllAcceptedOrders = (params?: {
  status?: string
  search?: string
  page?: number
  limit?: number
}) =>
  useQuery<{
    data: (Order & { driver?: { userId: string; fullName: string; phone: string; vehicleType: string; vehicleNumber: string; isVerified: boolean } })[]
    stats: { totalAccepted: number; activeCount: number; completedCount: number; cancelledCount: number }
    pagination: { total: number; page: number; limit: number; totalPages: number }
  }>({
    queryKey: ['orders', 'all-accepted', params],
    queryFn: async () => {
      const response = await api.get('/orders/all-accepted', { params })
      return response.data
    },
  })

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: OrderStatus; notes?: string }) => {
      const response = await api.patch(`/orders/${id}/status`, { status, notes })
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })
}

export const useDeleteOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/orders/${id}`)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })
}

export const useBlockSender = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      senderTelegramId: string
      senderName?: string
      senderUsername?: string
      phone?: string
      messageText?: string
      groupTitle?: string
      groupTelegramId?: string
    }) => {
      const response = await api.post('/blocked-users', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-users'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

// ===================== BLOCKED USERS =====================

export const useBlockedUsers = (params?: {
  search?: string
  reason?: string
  page?: number
  limit?: number
}) =>
  useQuery<{ data: BlockedUser[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>({
    queryKey: ['blocked-users', params],
    queryFn: async () => {
      const response = await api.get('/blocked-users', { params })
      const raw = response.data
      // Backend: { items, total, page, limit, totalPages }
      return {
        data: raw.items || raw.data || [],
        pagination: raw.pagination || {
          total: raw.total || 0,
          page: raw.page || 1,
          limit: raw.limit || 20,
          totalPages: raw.totalPages || 1,
        },
      }
    },
  })

export const useBlockedUsersStats = () =>
  useQuery<BlockedUsersStats>({
    queryKey: ['blocked-users', 'stats'],
    queryFn: async () => {
      const response = await api.get('/blocked-users/stats')
      return response.data
    },
  })

export const useUnblockUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch(`/blocked-users/${id}/unblock`)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blocked-users'] }),
  })
}

export const useBlockedWhitelist = () =>
  useQuery<string[]>({
    queryKey: ['blocked-users', 'whitelist'],
    queryFn: async () => {
      const response = await api.get('/blocked-users/whitelist')
      return response.data
    },
  })

export const useAddToWhitelist = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (entry: string) => {
      const response = await api.post('/blocked-users/whitelist', { entry })
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blocked-users'] }),
  })
}

export const useRemoveFromWhitelist = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (entry: string) => {
      const response = await api.delete(`/blocked-users/whitelist/${entry}`)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blocked-users'] }),
  })
}

// ===================== FILTER RULES =====================

export const useFilterRules = () =>
  useQuery<FilterRules>({
    queryKey: ['config', 'filter-rules'],
    queryFn: async () => {
      const response = await api.get('/config/filter-rules')
      return response.data
    },
  })

export const useUpdateFilterRules = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (rules: FilterRules) => {
      const response = await api.put('/config/filter-rules', rules)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['config', 'filter-rules'] }),
  })
}

// ===================== DRIVERS =====================

export const useDrivers = (params?: {
  search?: string
  isOnline?: boolean
  isVerified?: boolean
  page?: number
  limit?: number
}) =>
  useQuery<{ data: DriverProfile[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>({
    queryKey: ['drivers', params],
    queryFn: async () => {
      const response = await api.get('/drivers/admin/list', { params })
      return response.data
    },
  })

export const useDriver = (id: string) =>
  useQuery<DriverProfile>({
    queryKey: ['drivers', id],
    queryFn: async () => {
      const response = await api.get(`/drivers/admin/${id}`)
      return response.data
    },
    enabled: !!id,
  })

export const useDriverStats = () =>
  useQuery<DriverStats>({
    queryKey: ['drivers', 'stats'],
    queryFn: async () => {
      const response = await api.get('/drivers/admin/stats/overview')
      return response.data
    },
  })

export const useOnlineDriversMap = () =>
  useQuery<DriverMapItem[]>({
    queryKey: ['drivers', 'map', 'online'],
    queryFn: async () => {
      const response = await api.get('/drivers/admin/map/online')
      return response.data
    },
    refetchInterval: 15000,
  })

/**
 * Admin xaritasi uchun online dispetcherlar (oxirgi 5 daqiqada GPS yuborganlar)
 */
export const useOnlineDispatchersMap = (thresholdMinutes = 5) =>
  useQuery<DispatcherLocation[]>({
    queryKey: ['dispatchers', 'map', 'online', thresholdMinutes],
    queryFn: async () => {
      const response = await api.get('/users/admin/dispatchers/online', {
        params: { thresholdMinutes },
      })
      return response.data
    },
    refetchInterval: 10000, // har 10 sekund — live tracking
    staleTime: 5000,
  })

export const useVerifyDriver = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/drivers/admin/${id}/verify`)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
  })
}

export const useGenerateDriverLoginCode = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/drivers/admin/${id}/login-code`)
      return response.data as { code: string; phone: string; fullName: string; expiresIn: string }
    },
  })
}

export const useUpdateDriverBalance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, amount, description }: { id: string; amount: number; description: string }) => {
      const response = await api.post(`/drivers/admin/${id}/balance`, { amount, description })
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
  })
}

export const useAdminUpdateDriver = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, any> }) => {
      const response = await api.patch(`/drivers/admin/${id}/profile`, data)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
  })
}

export const useToggleDriverSubscription = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, active, days }: { id: string; active: boolean; days?: number }) => {
      const response = await api.post(`/drivers/admin/${id}/subscription`, { active, days })
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
  })
}

export const useDriverOffers = (params?: { status?: string; page?: number; limit?: number }) =>
  useQuery<{ data: DriverOfferItem[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>({
    queryKey: ['driver-offers', params],
    queryFn: async () => {
      const response = await api.get('/drivers/offers', { params })
      return response.data
    },
  })

export const usePrivateOrders = (params?: { status?: string; page?: number; limit?: number }) =>
  useQuery<{ data: PrivateOrderItem[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>({
    queryKey: ['private-orders', params],
    queryFn: async () => {
      const response = await api.get('/drivers/admin/private-orders', { params })
      return response.data
    },
  })

export const useCreatePrivateOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<PrivateOrderItem>) => {
      const response = await api.post('/drivers/admin/private-orders', data)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['private-orders'] }),
  })
}

// ===================== ANALYTICS — ROUTES (Task 3) =====================

export const useTopRoutes = (params?: { dateFrom?: string; dateTo?: string; limit?: number }) =>
  useQuery<RouteAnalytics[]>({
    queryKey: ['analytics', 'routes', params],
    queryFn: async () => {
      const response = await api.get('/analytics/routes', { params })
      return response.data
    },
  })

// ===================== ANALYTICS — VEHICLE TYPES (Task 6) =====================

export const useVehicleTypeStats = (params?: { dateFrom?: string; dateTo?: string }) =>
  useQuery<VehicleTypeStat[]>({
    queryKey: ['analytics', 'vehicle-types', params],
    queryFn: async () => {
      const response = await api.get('/analytics/vehicle-types', { params })
      return response.data
    },
  })

// ===================== ANALYTICS — DAY ROUTES (Task 7) =====================

export const useDayRouteAnalytics = (params?: { dateFrom?: string; dateTo?: string; limit?: number }) =>
  useQuery<DayRouteAnalytics>({
    queryKey: ['analytics', 'day-routes', params],
    queryFn: async () => {
      const response = await api.get('/analytics/day-routes', { params })
      return response.data
    },
  })

// ===================== PRICE ESTIMATE (Task 11) =====================

export const usePriceEstimate = (params?: { from: string; to: string; vehicleType?: string }) =>
  useQuery<PriceEstimate>({
    queryKey: ['analytics', 'price-estimate', params],
    queryFn: async () => {
      const response = await api.get('/analytics/price-estimate', { params })
      return response.data
    },
    enabled: !!params?.from && !!params?.to,
  })

// ===================== SURGE (Task 12) =====================

export const useSurgeRoutes = () =>
  useQuery({
    queryKey: ['analytics', 'surge'],
    queryFn: async () => {
      const response = await api.get('/analytics/surge')
      return response.data
    },
  })

// ===================== EXPORT (Task 8) =====================

export const useExportData = () =>
  useMutation({
    mutationFn: async (params: { entity: string; dateFrom?: string; dateTo?: string }) => {
      const response = await api.get(`/analytics/export/${params.entity}`, {
        params: { dateFrom: params.dateFrom, dateTo: params.dateTo },
      })
      return response.data
    },
  })

// ===================== MANUAL ORDER (Task 10) =====================

export const useCreateManualOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/orders', data)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })
}

export const useForSaleOrders = (params?: { page?: number; limit?: number }) =>
  useQuery({
    queryKey: ['orders', 'for-sale', params],
    queryFn: async () => {
      const response = await api.get('/orders/for-sale', { params })
      return response.data
    },
  })

// ===================== ORDER ACCEPT (Task 13) =====================

export const useAcceptOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await api.post(`/orders/${orderId}/accept`)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })
}

export const useAcceptedOrders = (params?: { page?: number; limit?: number }) =>
  useQuery({
    queryKey: ['orders', 'accepted', params],
    queryFn: async () => {
      const response = await api.get('/orders/accepted', { params })
      return response.data
    },
  })

// ===================== CLOSE DEAL (Task 15) =====================

export const useCloseDeal = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { orderId: string; amount: number }) => {
      const response = await api.post(`/orders/${data.orderId}/close-deal`, { amount: data.amount })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['closed-deals'] })
    },
  })
}

export const useClosedDealsApi = (params?: { page?: number; limit?: number }) =>
  useQuery({
    queryKey: ['closed-deals', params],
    queryFn: async () => {
      const response = await api.get('/orders/closed-deals', { params })
      return response.data
    },
  })

// ===================== AD PHONES (Task 14) =====================

export const useAdPhones = () =>
  useQuery<string[]>({
    queryKey: ['users', 'ad-phones'],
    queryFn: async () => {
      const response = await api.get('/users/ad-phones')
      return response.data
    },
  })

export const useUpdateAdPhones = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (phones: string[]) => {
      const response = await api.patch('/users/ad-phones', { phones })
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users', 'ad-phones'] }),
  })
}

// ===================== NOTIFICATIONS (Task 16) =====================

export const useNotifications = (params?: { page?: number; limit?: number }) =>
  useQuery<{ data: UserNotification[]; unreadCount: number; pagination: any }>({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const response = await api.get('/notifications', { params })
      return response.data
    },
  })

export const useAllNotifications = (params?: { page?: number; limit?: number }) =>
  useQuery<{ data: Notification[]; pagination: any }>({
    queryKey: ['notifications', 'all', params],
    queryFn: async () => {
      const response = await api.get('/notifications/all', { params })
      return response.data
    },
  })

export const useSendNotification = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { title: string; message: string; target: NotificationTarget }) => {
      const response = await api.post('/notifications', data)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch(`/notifications/${id}/read`)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

// ===================== CHAT (Task 17) =====================

export const useChatRooms = () =>
  useQuery<ChatRoom[]>({
    queryKey: ['chat', 'rooms'],
    queryFn: async () => {
      const response = await api.get('/chat/rooms')
      return response.data
    },
  })

export const useAllChatRooms = (params?: { type?: ChatRoomType; page?: number; limit?: number }) =>
  useQuery<{ data: ChatRoom[]; pagination: any }>({
    queryKey: ['chat', 'rooms', 'all', params],
    queryFn: async () => {
      const response = await api.get('/chat/rooms/all', { params })
      return response.data
    },
  })

export const useChatMessages = (roomId: string, params?: { page?: number; limit?: number }) =>
  useQuery<{ data: ChatMessage[]; pagination: any }>({
    queryKey: ['chat', 'messages', roomId, params],
    queryFn: async () => {
      const response = await api.get(`/chat/rooms/${roomId}/messages`, { params })
      return response.data
    },
    enabled: !!roomId,
  })

export const useSendChatMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { roomId: string; message: string }) => {
      const response = await api.post(`/chat/rooms/${data.roomId}/messages`, { message: data.message })
      return response.data
    },
    onSuccess: (_, vars) => queryClient.invalidateQueries({ queryKey: ['chat', 'messages', vars.roomId] }),
  })
}

// ===================== SUPPORT (Task 18) =====================

export const useSupportTickets = (params?: { status?: SupportTicketStatus; page?: number; limit?: number }) =>
  useQuery<{ data: SupportTicket[]; pagination: any; stats?: Record<string, number> }>({
    queryKey: ['support', 'tickets', params],
    queryFn: async () => {
      const response = await api.get('/support/tickets/all', { params })
      return response.data
    },
  })

export const useSupportTicket = (id: string) =>
  useQuery<SupportTicket>({
    queryKey: ['support', 'tickets', id],
    queryFn: async () => {
      const response = await api.get(`/support/tickets/${id}`)
      return response.data
    },
    enabled: !!id,
  })

export const useReplySupportTicket = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { ticketId: string; message: string }) => {
      const response = await api.post(`/support/tickets/${data.ticketId}/messages`, { message: data.message })
      return response.data
    },
    onSuccess: (_, vars) => queryClient.invalidateQueries({ queryKey: ['support', 'tickets', vars.ticketId] }),
  })
}

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { ticketId: string; status: SupportTicketStatus }) => {
      const response = await api.patch(`/support/tickets/${data.ticketId}/status`, { status: data.status })
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['support'] }),
  })
}

// ===================== SMS (Task 20) =====================

export type SmsProviderName = 'semysms' | 'sms_gateway'

export const useSendSms = () =>
  useMutation({
    mutationFn: async (data: { phone: string; message: string; category?: string; targetName?: string; provider?: SmsProviderName }) => {
      const response = await api.post('/sms/send', data)
      return response.data
    },
  })

// Drivers SMS
export const useSmsDriversList = () =>
  useQuery<any[]>({
    queryKey: ['sms', 'drivers'],
    queryFn: async () => {
      const response = await api.get('/sms/drivers/list')
      return response.data
    },
  })

export const useSendSmsToDrivers = () =>
  useMutation({
    mutationFn: async (data: { message: string; driverIds?: string[]; provider?: SmsProviderName }) => {
      const response = await api.post('/sms/drivers/send', data)
      return response.data
    },
  })

// Orders SMS
export const useSmsOrdersList = (params?: { type?: string; limit?: number; search?: string }) =>
  useQuery<any[]>({
    queryKey: ['sms', 'orders', params],
    queryFn: async () => {
      const response = await api.get('/sms/orders/list', { params })
      return response.data
    },
  })

export const useSendSmsToOrders = () =>
  useMutation({
    mutationFn: async (data: { message: string; orderIds: string[]; provider?: SmsProviderName }) => {
      const response = await api.post('/sms/orders/send', data)
      return response.data
    },
  })

// Blocked SMS
export const useSmsBlockedList = () =>
  useQuery<any[]>({
    queryKey: ['sms', 'blocked'],
    queryFn: async () => {
      const response = await api.get('/sms/blocked/list')
      return response.data
    },
  })

export const useSendSmsToBlocked = () =>
  useMutation({
    mutationFn: async (data: { message: string; blockedUserIds?: string[]; provider?: SmsProviderName }) => {
      const response = await api.post('/sms/blocked/send', data)
      return response.data
    },
  })

// Auto-SMS Config
export const useSmsAutoConfig = () =>
  useQuery<{
    cargoOrderEnabled: boolean; cargoOrderTemplate: string;
    driverOrderEnabled: boolean; driverOrderTemplate: string;
    blockedEnabled: boolean; blockedTemplate: string;
  }>({
    queryKey: ['sms', 'auto-config'],
    queryFn: async () => {
      const response = await api.get('/sms/auto-config')
      return response.data
    },
  })

export const useSaveAutoConfig = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      cargoOrderEnabled: boolean; cargoOrderTemplate: string;
      driverOrderEnabled: boolean; driverOrderTemplate: string;
      blockedEnabled: boolean; blockedTemplate: string;
    }) => {
      const response = await api.post('/sms/auto-config', data)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sms', 'auto-config'] }),
  })
}

// All phones SMS
export const useSmsAllPhones = () =>
  useQuery<Array<{ phone: string; source: string; name: string }>>({
    queryKey: ['sms', 'all'],
    queryFn: async () => {
      const response = await api.get('/sms/all/list')
      return response.data
    },
  })

export const useSendSmsToAll = () =>
  useMutation({
    mutationFn: async (data: { message: string; provider?: SmsProviderName }) => {
      const response = await api.post('/sms/all/send', data)
      return response.data
    },
  })

// History & Stats
export const useSmsHistory = (params?: { page?: number; limit?: number; category?: string; status?: string; search?: string }) =>
  useQuery<{ data: SmsLog[]; pagination: any }>({
    queryKey: ['sms', 'history', params],
    queryFn: async () => {
      const response = await api.get('/sms/history', { params })
      return response.data
    },
  })

export const useSmsStats = () =>
  useQuery<SmsStats>({
    queryKey: ['sms', 'stats'],
    queryFn: async () => {
      const response = await api.get('/sms/stats')
      return response.data
    },
  })

export const useSmsDevices = () =>
  useQuery<any>({
    queryKey: ['sms', 'devices'],
    queryFn: async () => {
      const response = await api.get('/sms/devices')
      return response.data
    },
  })

// Providers — SemySMS / SMS Gateway
export const useSmsProviders = () =>
  useQuery<{
    defaultProvider: SmsProviderName;
    providers: {
      semysms: { name: string; configured: boolean };
      sms_gateway: { name: string; url: string; apiKey: string; configured: boolean };
    };
  }>({
    queryKey: ['sms', 'providers'],
    queryFn: async () => {
      const response = await api.get('/sms/providers')
      return response.data
    },
  })

export const useSetDefaultProvider = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { provider: SmsProviderName }) => {
      const response = await api.post('/sms/providers/default', data)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sms', 'providers'] }),
  })
}

export const useSetSmsGatewayConfig = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { url?: string; apiKey?: string }) => {
      const response = await api.post('/sms/providers/sms-gateway/config', data)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sms', 'providers'] }),
  })
}

export const useTestSmsGateway = () =>
  useMutation({
    mutationFn: async () => {
      const response = await api.get('/sms/providers/sms-gateway/test')
      return response.data
    },
  })

// ===================== PERMISSIONS (Task 24) =====================

export const usePermissions = (role?: string) =>
  useQuery({
    queryKey: ['permissions', role],
    queryFn: async () => {
      const response = await api.get('/auth/permissions', { params: role ? { role } : {} })
      return response.data
    },
  })

export const useUpdatePermissions = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { role: string; permissions: any[] }) => {
      const response = await api.put('/auth/permissions', data)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['permissions'] }),
  })
}

// ===================== VEHICLE PHOTOS (Task 21) =====================

export const usePendingPhotos = (params?: { page?: number; limit?: number }) =>
  useQuery<{ data: VehiclePhoto[]; pagination: any }>({
    queryKey: ['photos', 'pending', params],
    queryFn: async () => {
      const response = await api.get('/drivers/admin/photos/pending', { params })
      return response.data
    },
  })

export const useApprovePhoto = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch(`/drivers/admin/photos/${id}/approve`)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['photos'] }),
  })
}

export const useRejectPhoto = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { id: string; reason: string }) => {
      const response = await api.patch(`/drivers/admin/photos/${data.id}/reject`, { reason: data.reason })
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['photos'] }),
  })
}

// ===================== DRIVER LINK (Task 23) =====================

export const useLinkDriverToOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { orderId: string; driverProfileId: string }) => {
      const response = await api.post('/drivers/admin/link-to-order', data)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })
}

export const useAvailableDrivers = (cargoFrom?: string) =>
  useQuery({
    queryKey: ['drivers', 'available', cargoFrom],
    queryFn: async () => {
      const response = await api.get('/drivers/admin/available', { params: cargoFrom ? { cargoFrom } : {} })
      return response.data
    },
  })

// ===================== HODIMLAR BOSHQARUVI =====================

export const useStaffList = () =>
  useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const response = await api.get('/users/staff')
      return response.data
    },
  })

export const useCreateStaff = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { username: string; password: string; firstName: string; role: string; phoneNumber?: string }) => {
      const response = await api.post('/users/staff', data)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] }),
  })
}

export const useChangePassword = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { id: string; password: string }) => {
      const response = await api.patch(`/users/${data.id}/password`, { password: data.password })
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] }),
  })
}

export const useChangeRole = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { id: string; role: string }) => {
      const response = await api.patch(`/users/${data.id}/role`, { role: data.role })
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] }),
  })
}

// ===================== MENING BUYURTMALARIM =====================

export const useMyOrders = (params?: { status?: string; page?: number; limit?: number }) =>
  useQuery({
    queryKey: ['my-orders', params],
    queryFn: async () => {
      const response = await api.get('/orders', { params: { ...params, isManual: true } })
      return response.data
    },
  })

export const useMyOrderStats = () =>
  useQuery({
    queryKey: ['my-orders-stats'],
    queryFn: async () => {
      const response = await api.get('/orders/stats', { params: { isManual: true } })
      return response.data
    },
  })

// ============================================================
// TELEGRAM SMS
// ============================================================

export const useTgSmsSessions = () =>
  useQuery({
    queryKey: ['tg-sms', 'sessions'],
    queryFn: async () => {
      const response = await api.get('/telegram-sms/sessions')
      return response.data
    },
  })

export const useTgSmsStats = () =>
  useQuery({
    queryKey: ['tg-sms', 'stats'],
    queryFn: async () => {
      const response = await api.get('/telegram-sms/stats')
      return response.data
    },
  })

export const useTgSmsHistory = (params?: {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  sessionId?: string;
  search?: string;
}) =>
  useQuery({
    queryKey: ['tg-sms', 'history', params],
    queryFn: async () => {
      const response = await api.get('/telegram-sms/history', { params })
      return response.data
    },
  })

export const useTgSmsAutoConfig = () =>
  useQuery({
    queryKey: ['tg-sms', 'auto-config'],
    queryFn: async () => {
      const response = await api.get('/telegram-sms/auto-config')
      return response.data
    },
  })

export const useTgSmsSendCode = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { phone: string; name?: string }) => {
      const response = await api.post('/telegram-sms/sessions/send-code', data)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tg-sms', 'sessions'] }),
  })
}

export const useTgSmsSignIn = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ sessionId, code, password }: { sessionId: string; code: string; password?: string }) => {
      const response = await api.post(`/telegram-sms/sessions/${sessionId}/sign-in`, { code, password })
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tg-sms', 'sessions'] }),
  })
}

export const useTgSmsToggle = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ sessionId, enabled }: { sessionId: string; enabled: boolean }) => {
      const response = await api.patch(`/telegram-sms/sessions/${sessionId}/toggle`, { enabled })
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tg-sms', 'sessions'] }),
  })
}

export const useTgSmsReconnect = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await api.post(`/telegram-sms/sessions/${sessionId}/reconnect`)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tg-sms', 'sessions'] }),
  })
}

export const useTgSmsCheckSpam = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await api.post(`/telegram-sms/sessions/${sessionId}/check-spam`)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tg-sms', 'sessions'] }),
  })
}

export const useTgSmsDelete = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await api.delete(`/telegram-sms/sessions/${sessionId}`)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tg-sms', 'sessions'] }),
  })
}

export const useTgSmsSend = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      targetTelegramId: string;
      message: string;
      category?: string;
      targetName?: string;
    }) => {
      const response = await api.post('/telegram-sms/send', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tg-sms', 'history'] })
      queryClient.invalidateQueries({ queryKey: ['tg-sms', 'stats'] })
    },
  })
}

export const useTgSmsSendDrivers = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { message: string; driverIds?: string[] }) => {
      const response = await api.post('/telegram-sms/send/drivers', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tg-sms', 'history'] })
      queryClient.invalidateQueries({ queryKey: ['tg-sms', 'stats'] })
    },
  })
}

export const useTgSmsSaveAutoConfig = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (config: any) => {
      const response = await api.post('/telegram-sms/auto-config', config)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tg-sms', 'auto-config'] }),
  })
}

// Target lists
export const useTgSmsDriversList = () =>
  useQuery({
    queryKey: ['tg-sms', 'targets', 'drivers'],
    queryFn: async () => {
      const response = await api.get('/telegram-sms/targets/drivers')
      return response.data
    },
  })

export const useTgSmsOrdersList = (params?: { type?: string; search?: string; limit?: number }) =>
  useQuery({
    queryKey: ['tg-sms', 'targets', 'orders', params],
    queryFn: async () => {
      const response = await api.get('/telegram-sms/targets/orders', { params })
      return response.data
    },
  })

export const useTgSmsBlockedList = () =>
  useQuery({
    queryKey: ['tg-sms', 'targets', 'blocked'],
    queryFn: async () => {
      const response = await api.get('/telegram-sms/targets/blocked')
      return response.data
    },
  })

export const useTgSmsAllTargets = () =>
  useQuery({
    queryKey: ['tg-sms', 'targets', 'all'],
    queryFn: async () => {
      const response = await api.get('/telegram-sms/targets/all')
      return response.data
    },
  })

export const useTgSmsSendToAll = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { message: string }) => {
      const response = await api.post('/telegram-sms/send/all', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tg-sms', 'history'] })
      queryClient.invalidateQueries({ queryKey: ['tg-sms', 'stats'] })
    },
  })
}

export const useTgSmsSendToOrders = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { message: string; orderIds: string[] }) => {
      const response = await api.post('/telegram-sms/send/orders', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tg-sms', 'history'] })
      queryClient.invalidateQueries({ queryKey: ['tg-sms', 'stats'] })
    },
  })
}

export const useTgSmsSendToBlocked = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { message: string; blockedIds?: string[] }) => {
      const response = await api.post('/telegram-sms/send/blocked', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tg-sms', 'history'] })
      queryClient.invalidateQueries({ queryKey: ['tg-sms', 'stats'] })
    },
  })
}

// ===================== BLACKLISTED GROUPS (Qora ro'yxat) =====================

export interface BlacklistedGroup {
  groupTelegramId: string
  title: string
  sessionId?: string
  addedAt?: string
}

export const useBlacklistedGroups = () =>
  useQuery<BlacklistedGroup[]>({
    queryKey: ['blacklisted-groups'],
    queryFn: async () => {
      const response = await api.get('/config/blacklisted-groups')
      return response.data
    },
  })

export const useAddToBlacklist = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { groupTelegramId: string; title: string; sessionId?: string }) => {
      const response = await api.post('/config/blacklisted-groups', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blacklisted-groups'] })
    },
  })
}

export const useRemoveFromBlacklist = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (groupTelegramId: string) => {
      const response = await api.delete(`/config/blacklisted-groups/${groupTelegramId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blacklisted-groups'] })
    },
  })
}

// ===================== ACCOUNTING (Buxgalteriya) =====================

import type {
  AccountingSummary, AccountingEntry, AccountingCategory,
  AccountingChartData, AccountingEntryType,
} from '../types'

export const useAccountingSummary = (params?: { startDate?: string; endDate?: string; groupBy?: string }) =>
  useQuery<AccountingSummary>({
    queryKey: ['accounting', 'summary', params],
    queryFn: async () => (await api.get('/accounting/summary', { params })).data,
  })

export const useAccountingEntries = (params?: {
  type?: AccountingEntryType; categoryId?: string;
  startDate?: string; endDate?: string; skip?: number; take?: number
}) =>
  useQuery<{ data: AccountingEntry[]; total: number; skip: number; take: number }>({
    queryKey: ['accounting', 'entries', params],
    queryFn: async () => (await api.get('/accounting/entries', { params })).data,
  })

export const useAccountingCategories = (type?: AccountingEntryType) =>
  useQuery<AccountingCategory[]>({
    queryKey: ['accounting', 'categories', type],
    queryFn: async () => (await api.get('/accounting/categories', { params: type ? { type } : {} })).data,
  })

export const useAccountingChartData = (params?: { startDate?: string; endDate?: string; groupBy?: string; type?: string }) =>
  useQuery<AccountingChartData[]>({
    queryKey: ['accounting', 'chart', params],
    queryFn: async () => (await api.get('/accounting/chart-data', { params })).data,
  })

export const useCreateAccountingEntry = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { type: AccountingEntryType; categoryId: string; amount: number; description?: string; date: string }) =>
      (await api.post('/accounting/entries', data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounting'] }),
  })
}

export const useUpdateAccountingEntry = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; categoryId?: string; amount?: number; description?: string; date?: string }) =>
      (await api.put(`/accounting/entries/${id}`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounting'] }),
  })
}

export const useDeleteAccountingEntry = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/accounting/entries/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounting'] }),
  })
}

export const useCreateAccountingCategory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; type: AccountingEntryType; icon?: string; color?: string }) =>
      (await api.post('/accounting/categories', data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounting', 'categories'] }),
  })
}

export const useDeleteAccountingCategory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/accounting/categories/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounting', 'categories'] }),
  })
}

export const useSyncAccounting = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => (await api.post('/accounting/sync')).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounting'] }),
  })
}

export const useExportAccounting = () =>
  useMutation({
    mutationFn: async (params: { startDate: string; endDate: string; type?: string }) => {
      const response = await api.get('/accounting/export', { params, responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `buxgalteriya_${params.startDate}_${params.endDate}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
    },
  })
