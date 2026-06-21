import { useQuery } from '@tanstack/react-query'
import api from '../services/api'

export interface PaymentChannelStats {
  count: number
  approved: number
  rejected: number
  pending: number
  total: number
}

export interface PaymentItem {
  id: string
  amount: number
  currency: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
  planType: string | null
  channel: string
  user: {
    id: string
    name: string
    username: string | null
    telegramId: string
  }
  verifiedBy: string | null
  verifiedAt: string | null
  rejectReason: string | null
  receiptImage: string | null
  transactionId: string | null
  cardNumber: string | null
  createdAt: string
}

export interface PaymentAnalytics {
  payments: PaymentItem[]
  channelStats: Record<string, PaymentChannelStats>
  summary: {
    total: number
    approved: number
    rejected: number
    pending: number
    totalApproved: number
    totalPending: number
  }
}

export const usePaymentAnalytics = (params?: { startDate?: string; endDate?: string }) =>
  useQuery<PaymentAnalytics>({
    queryKey: ['accounting', 'payments', params],
    queryFn: async () => (await api.get('/accounting/payments', { params })).data,
  })
