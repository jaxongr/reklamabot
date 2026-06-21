// Enums
export type UserRole = 'USER' | 'ADMIN' | 'DISPATCHER' | 'SUPER_ADMIN' | 'DRIVER'
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

// ===================== MONITOR & ORDERS =====================

export type MonitorSessionStatus = 'PENDING' | 'CONNECTING' | 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'DELETED'
export type OrderStatus = 'NEW' | 'VIEWED' | 'CONTACTED' | 'COMPLETED' | 'REJECTED'
export type OrderType = 'CARGO' | 'DRIVER'
export type OrderScope = 'INTERNAL' | 'IMPORT' | 'EXPORT'
export type AcceptedOrderStatus = 'ACCEPTED' | 'IN_PROGRESS' | 'CLOSED' | 'CANCELLED'
export type NotificationTarget = 'ALL' | 'DRIVERS' | 'DISPATCHERS'
export type ChatRoomType = 'DISPATCHER_SUPPORT' | 'DRIVER_SUPPORT' | 'DISPATCHER_GROUP' | 'DRIVER_GROUP'
export type SupportTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
export type SmsStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED'
export type BlockReason =
  | 'DISPATCHER_NAME'
  | 'FEMALE_NAME'
  | 'REPEATED_CHARS'
  | 'FOREIGN_DESTINATION'
  | 'MULTIPLE_MENTIONS'
  | 'LONG_MESSAGE'
  | 'EXCESSIVE_EMOJI'
  | 'EXCESSIVE_NEWLINES'
  | 'USER_MULTI_GROUP'
  | 'USER_SPAM_RATE'
  | 'PHONE_MULTI_GROUP'
  | 'PHONE_SUPER_SPAM'
  | 'MANUAL_BLOCK'

export interface MonitorSession {
  id: string
  userId: string
  name?: string
  phone: string
  status: MonitorSessionStatus
  totalGroups: number
  messagesRead: number
  ordersFound: number
  blocksFound: number
  lastMessageAt?: string
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  userId: string
  messageText: string
  groupTitle: string
  groupTelegramId: string
  senderName?: string
  senderUsername?: string
  senderPhone?: string
  messageDate: string
  cargoFrom?: string
  cargoTo?: string
  cargoType?: string
  cargoWeight?: string
  price?: string
  phone?: string
  distance?: number
  type: OrderType
  vehicleType?: string
  vehicleCapacity?: string
  status: OrderStatus
  notes?: string
  monitorSessionId?: string
  senderTodayAds?: number
  senderTotalAds?: number
  senderTelegramId?: string
  // New fields
  scope?: OrderScope
  isManual?: boolean
  manualCreatedBy?: string
  isForSale?: boolean
  salePrice?: string
  acceptedById?: string
  acceptedAt?: string
  acceptedStatus?: AcceptedOrderStatus
  originalPhone?: string
  swappedPhone?: string
  closedAmount?: number
  closedAt?: string
  closedById?: string
  surgeMultiplier?: number
  surgeExpiresAt?: string
  blockedByCount?: number
  createdAt: string
  updatedAt: string
}

export interface OrderStats {
  total: number
  today: number
  thisWeek: number
  new: number
  viewed: number
  contacted: number
  completed: number
  rejected: number
  cargo: number
  driver: number
  internal?: number
  import?: number
  export?: number
}

export interface BlockedUser {
  id: string
  userId: string
  senderTelegramId: string
  senderName?: string
  senderUsername?: string
  reason: BlockReason
  ruleNumber: number
  messageText?: string
  groupTitle?: string
  phone?: string
  isActive: boolean
  createdAt: string
}

export interface BlockedUsersStats {
  total: number
  today: number
  thisWeek: number
  byReason: Record<string, number>
}

export interface FilterRules {
  keywords: string[]
  excludeKeywords: string[]
  minPrice?: number
  maxPrice?: number
  regions?: string[]
  cargoTypes?: string[]
  enabled: boolean
}

export interface MonitorStats {
  totalSessions: number
  activeSessions: number
  totalOrders: number
  newOrders: number
}

// ===================== DRIVERS =====================

export type OfferStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'COMPLETED'
export type PrivateOrderStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type TransactionType = 'TOP_UP' | 'COMMISSION' | 'REFUND' | 'SUBSCRIPTION'

export interface DriverProfile {
  id: string
  userId: string
  fullName?: string
  phone?: string
  vehicleType?: string
  vehicleCapacity?: string
  vehicleNumber?: string
  licensePhotoUrl?: string
  vehiclePassportUrl?: string
  isVerified: boolean
  verifiedAt?: string
  verifiedBy?: string
  isOnline: boolean
  lastLat?: number
  lastLng?: number
  lastLocationAt?: string
  lastCity?: string
  balance: number
  subscriptionActive: boolean
  subscriptionEndDate?: string
  createdAt: string
  updatedAt: string
  user?: { id: string; telegramId: string; username?: string; firstName?: string; lastName?: string }
  transactions?: DriverTransaction[]
  offers?: DriverOfferItem[]
}

export interface DriverOfferItem {
  id: string
  driverId: string
  fromCity: string
  toCity: string
  vehicleType: string
  vehicleCapacity?: string
  phone: string
  description?: string
  price?: string
  status: OfferStatus
  createdAt: string
  driverProfile?: { fullName?: string; vehicleType?: string; isVerified: boolean }
}

export interface PrivateOrderItem {
  id: string
  createdById: string
  driverId?: string
  fromCity: string
  toCity: string
  cargoType?: string
  cargoWeight?: string
  price?: string
  phone: string
  description?: string
  commissionAmount: number
  commissionPaid: boolean
  status: PrivateOrderStatus
  createdAt: string
}

export interface DriverTransaction {
  id: string
  driverProfileId: string
  amount: number
  type: TransactionType
  description?: string
  referenceId?: string
  createdAt: string
}

export interface DriverStats {
  totalDrivers: number
  onlineDrivers: number
  verifiedDrivers: number
  totalOffers: number
  activeOffers: number
}

export interface DriverMapItem {
  id: string
  fullName?: string
  vehicleType?: string
  vehicleCapacity?: string
  vehicleNumber?: string
  lastLat: number
  lastLng: number
  lastCity?: string
  lastLocationAt?: string
  isVerified: boolean
  phone?: string
  user?: { telegramId: string; username?: string }
}

export interface DispatcherLocation {
  id: string
  firstName?: string | null
  lastName?: string | null
  username?: string | null
  phoneNumber?: string | null
  lastLat: number
  lastLng: number
  lastCity?: string | null
  lastLocationAt?: string | null
  isOnline: boolean
  isLineActive: boolean
  role: 'DISPATCHER'
}

// ===================== ANALYTICS =====================

export interface RouteAnalytics {
  rank: number
  from: string
  to: string
  count: number
  avgDistance: number
}

export interface VehicleTypeStat {
  vehicleType: string
  count: number
  percentage: number
}

export interface DayRouteAnalytics {
  routes: string[]
  days: string[]
  data: Record<string, number[]>
}

export interface PriceEstimate {
  fromCity: string
  toCity: string
  vehicleType?: string
  avgPrice: number
  minPrice: number
  maxPrice: number
  sampleCount: number
  lastCalculated: string
}

// ===================== NOTIFICATIONS =====================

export interface Notification {
  id: string
  title: string
  message: string
  target: NotificationTarget
  sentById?: string
  isActive: boolean
  createdAt: string
  _count?: { userNotifications: number }
}

export interface UserNotification {
  id: string
  notificationId: string
  isRead: boolean
  readAt?: string
  notification: Notification
  createdAt: string
}

// ===================== CHAT =====================

export interface ChatRoom {
  id: string
  name?: string
  type: ChatRoomType
  isActive: boolean
  participants: ChatParticipant[]
  messages?: ChatMessage[]
  _count?: { messages: number }
  createdAt: string
}

export interface ChatParticipant {
  id: string
  userId: string
  isAdmin: boolean
  user: { id: string; firstName?: string; username?: string }
}

export interface ChatMessage {
  id: string
  chatRoomId: string
  senderId: string
  message: string
  isEdited: boolean
  sender: { id: string; firstName?: string; username?: string; role?: UserRole }
  createdAt: string
}

// ===================== SUPPORT =====================

export interface SupportTicket {
  id: string
  userId: string
  subject: string
  status: SupportTicketStatus
  priority: number
  user?: { id: string; firstName?: string; username?: string; telegramId?: string }
  messages?: SupportMessage[]
  _count?: { messages: number }
  createdAt: string
  updatedAt: string
}

export interface SupportMessage {
  id: string
  ticketId: string
  senderId: string
  message: string
  isStaff: boolean
  sender: { id: string; firstName?: string; role?: UserRole }
  createdAt: string
}

// ===================== SMS =====================

export type SmsCategory = 'GENERAL' | 'DRIVER' | 'ORDER' | 'BLOCKED_AD'

export interface SmsLog {
  id: string
  phone: string
  message: string
  status: SmsStatus
  category: SmsCategory
  provider: string
  errorMessage?: string
  sentById?: string
  targetName?: string
  externalId?: string
  createdAt: string
}

export interface SmsStats {
  total: number
  sent: number
  failed: number
  todayCount: number
  byCategory: Record<string, number>
}

// ===================== BALANCE =====================

export interface BalanceTransaction {
  id: string
  userId: string
  amount: number
  type: string
  description?: string
  referenceId?: string
  createdAt: string
}

// ===================== VEHICLE PHOTOS =====================

export interface VehiclePhoto {
  id: string
  driverProfileId: string
  type: string
  url: string
  isApproved: boolean
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
  driverProfile?: { fullName?: string; vehicleType?: string; phone?: string }
  createdAt: string
}

// ==================== ACCOUNTING (Buxgalteriya) ====================

export type AccountingEntryType = 'INCOME' | 'EXPENSE'

export interface AccountingCategory {
  id: string
  name: string
  type: AccountingEntryType
  icon?: string
  color?: string
  isSystem: boolean
  isActive: boolean
}

export interface AccountingEntry {
  id: string
  type: AccountingEntryType
  categoryId: string
  category: AccountingCategory
  amount: number
  currency: string
  description?: string
  date: string
  referenceId?: string
  referenceType?: string
  createdById: string
  createdBy?: { id: string; firstName?: string; username?: string }
  createdAt: string
}

export interface AccountingSummary {
  totalIncome: number
  totalExpense: number
  profit: number
  breakdown: Array<{
    period: string
    income: number
    expense: number
    profit: number
  }>
}

export interface AccountingChartData {
  period: string
  amount: number
  categoryName: string
  type: AccountingEntryType
}
