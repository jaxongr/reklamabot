// Enums
export type UserRole = 'USER' | 'ADMIN' | 'DISPATCHER' | 'SUPER_ADMIN'
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED'
export type AdStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'SOLD_OUT' | 'ARCHIVED'
export type PostStatus = 'PENDING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
export type SessionStatus = 'ACTIVE' | 'INACTIVE' | 'FROZEN' | 'BANNED' | 'DELETED'
export type GroupType = 'GROUP' | 'SUPERGROUP' | 'CHANNEL'
export type MediaType = 'TEXT' | 'PHOTO' | 'VIDEO' | 'DOCUMENT' | 'ALBUM'
export type SubscriptionPlan = 'STARTER' | 'BUSINESS' | 'PREMIUM' | 'ENTERPRISE'
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING'
export type DeliveryStatus = 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED' | 'RETRYING'

// Models
export interface User {
  id: string
  telegramId: string
  username?: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  language: string
  role: UserRole
  status: UserStatus
  isActive: boolean
  brandAdText?: string
  brandAdEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface Subscription {
  id: string
  userId: string
  planType: SubscriptionPlan
  status: SubscriptionStatus
  startDate: string
  endDate?: string
  autoRenew: boolean
  maxAds: number
  maxSessions: number
  maxGroups: number
  minInterval: number
  maxInterval: number
  groupInterval: number
  planDetails?: PlanDetails
}

export interface PlanDetails {
  name: string
  price: number
  currency: string
  maxAds: number
  maxSessions: number
  maxGroups: number
  minInterval: number
  maxInterval: number
  groupInterval: number
  durationDays: number
}

export interface Payment {
  id: string
  userId: string
  user?: Pick<User, 'id' | 'telegramId' | 'username' | 'firstName' | 'lastName'>
  amount: number
  currency: string
  status: PaymentStatus
  cardNumber?: string
  receiptImage?: string
  transactionId?: string
  planType?: SubscriptionPlan
  verifiedBy?: string
  verifiedAt?: string
  rejectReason?: string
  createdAt: string
  updatedAt: string
}

export interface Session {
  id: string
  userId: string
  name?: string
  status: SessionStatus
  phone?: string
  isPremium: boolean
  totalGroups: number
  activeGroups: number
  lastSyncAt?: string
  isFrozen: boolean
  frozenAt?: string
  unfreezeAt?: string
  freezeCount: number
  _count?: { groups: number; posts: number }
  createdAt: string
  updatedAt: string
}

export interface Group {
  id: string
  sessionId: string
  telegramId: string
  title: string
  username?: string
  type: GroupType
  memberCount?: number
  hasRestrictions: boolean
  restrictionUntil?: string
  isActive: boolean
  activityScore: number
  lastPostAt?: string
  requiresInvite: boolean
  isSkipped: boolean
  skipReason?: string
  isPriority: boolean
  priorityOrder?: number
  createdAt: string
  updatedAt: string
}

export interface Ad {
  id: string
  userId: string
  title: string
  description?: string
  content: string
  mediaUrls: string[]
  mediaType: MediaType
  status: AdStatus
  price?: number
  currency: string
  negotiable: boolean
  totalQuantity?: number
  soldQuantity: number
  isSold: boolean
  soldAt?: string
  closedReason?: string
  brandAdEnabled: boolean
  brandAdText?: string
  selectedGroups: string[]
  intervalMin: number
  intervalMax: number
  groupInterval: number
  isPriority: boolean
  viewCount: number
  clickCount: number
  shareCount: number
  createdBy: string
  createdAt: string
  updatedAt: string
  _count?: { posts: number }
}

export interface Post {
  id: string
  adId: string
  ad?: Ad
  userId: string
  sessionId: string
  status: PostStatus
  totalGroups: number
  completedGroups: number
  failedGroups: number
  skippedGroups: number
  startedAt?: string
  completedAt?: string
  pausedAt?: string
  lastGroupIndex: number
  createdAt: string
  updatedAt: string
}

export interface PostHistory {
  id: string
  postId: string
  groupId: string
  userId: string
  messageId?: number
  status: DeliveryStatus
  sentAt?: string
  failedAt?: string
  errorCode?: string
  errorMessage?: string
  createdAt: string
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    skip: number
    take: number
    hasMore: boolean
  }
}

export interface ListResponse<T> {
  data: T[]
  total: number
}

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalAds: number
  activeAds: number
  totalPosts: number
  completedPosts: number
  successRate: number
  totalRevenue: number
  pendingPayments: number
  trends?: {
    users: { growth: number; newUsers: number }
    ads: { growth: number; newAds: number }
    revenue: { growth: number; periodRevenue: number }
  }
}

export interface PaymentStatistics {
  total: number
  pending: number
  approved: number
  rejected: number
  totalRevenue: number
  pendingRevenue: number
  today: number
}

export interface PostStatistics {
  total: number
  inProgress: number
  completed: number
  failed: number
  today: number
}

export interface PaymentCard {
  bankName: string
  cardNumber: string
  cardHolder: string
  description?: string
}
