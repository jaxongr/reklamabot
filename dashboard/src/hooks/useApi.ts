import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import type {
  Ad,
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
  AdStatus,
  PostStatus,
  PaymentStatus,
  SessionStatus,
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
    mutationFn: async (data: { amount: number; planType: string; currency?: string }) => {
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
