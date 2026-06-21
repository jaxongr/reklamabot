import axios from 'axios'
import { getInitData } from './telegram'

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
})

let token: string | null = null
let refreshToken: string | null = null
let currentUser: any = null

export function setTokens(access: string, refresh?: string) {
  token = access
  localStorage.setItem('mini_token', access)
  if (refresh) {
    refreshToken = refresh
    localStorage.setItem('mini_refresh', refresh)
  }
}

export function getToken(): string | null {
  if (token) return token
  token = localStorage.getItem('mini_token')
  return token
}

export function setUser(u: any) {
  currentUser = u
  if (u) localStorage.setItem('mini_user', JSON.stringify(u))
}

export function getUser(): any {
  if (currentUser) return currentUser
  try {
    const s = localStorage.getItem('mini_user')
    if (s) currentUser = JSON.parse(s)
  } catch {}
  return currentUser
}

export function logout() {
  token = null
  refreshToken = null
  currentUser = null
  localStorage.removeItem('mini_token')
  localStorage.removeItem('mini_refresh')
  localStorage.removeItem('mini_user')
}

// Auth interceptor
api.interceptors.request.use((config) => {
  const t = getToken()
  if (t) config.headers.Authorization = `Bearer ${t}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response?.status === 401) {
      token = null
      localStorage.removeItem('mini_token')
      await authViaTelegram()
    }
    return Promise.reject(error)
  },
)

// ============================================================
// AUTH
// ============================================================

export async function authViaTelegram(): Promise<boolean> {
  const initData = getInitData()
  if (!initData) return false
  try {
    const { data } = await axios.post(`${API_BASE}/auth/telegram-webapp`, { initData })
    if (data.access_token) {
      setTokens(data.access_token, data.refresh_token)
      setUser(data.user)
      return true
    }
  } catch (e) {
    console.error('Telegram auth failed:', e)
  }
  return false
}

export async function getProfile() {
  const { data } = await api.get('/auth/me')
  return data
}

// ============================================================
// ORDERS (Monitor orders)
// ============================================================

export async function getOrders(params: {
  type?: string
  status?: string
  skip?: number
  take?: number
  limit?: number
  search?: string
  scope?: string
  dateFrom?: string
}) {
  const { data } = await api.get('/orders', { params })
  return data
}

export async function getOrder(id: string) {
  const { data } = await api.get(`/orders/${id}`)
  return data
}

export async function acceptOrder(id: string) {
  const { data } = await api.post(`/orders/${id}/accept`)
  return data
}

export async function getOrderStats() {
  const { data } = await api.get('/orders/stats')
  return data
}

export async function getMyOrders(params?: { status?: string }) {
  const { data } = await api.get('/orders/accepted', { params })
  return data
}

// ============================================================
// SESSIONS
// ============================================================

export async function getSessions() {
  const { data } = await api.get('/sessions')
  return data
}

export async function getSessionConnectionStatus() {
  const { data } = await api.get('/sessions/connection-status')
  return data
}

export async function sendSessionCode(phone: string, name?: string) {
  const { data } = await api.post('/sessions/send-code', { phone, name })
  return data
}

export async function signInSession(sessionId: string, code?: string, password?: string) {
  const { data } = await api.post(`/sessions/${sessionId}/sign-in`, { code, password })
  return data
}

export async function deleteSession(id: string) {
  const { data } = await api.delete(`/sessions/${id}`)
  return data
}

export async function syncSessionGroups(id: string) {
  const { data } = await api.post(`/sessions/${id}/sync`)
  return data
}

export async function freezeSession(id: string) {
  const { data } = await api.post(`/sessions/${id}/freeze`)
  return data
}

export async function unfreezeSession(id: string) {
  const { data } = await api.post(`/sessions/${id}/unfreeze`)
  return data
}

// ============================================================
// ADS (E'lonlar)
// ============================================================

export async function getAds(params?: { status?: string; search?: string }) {
  const { data } = await api.get('/ads', { params })
  return data
}

export async function createAd(body: {
  title: string
  content: string
  mediaUrls?: string[]
  mediaType?: string
}) {
  const { data } = await api.post('/ads', body)
  return data
}

export async function deleteAd(id: string) {
  const { data } = await api.delete(`/ads/${id}`)
  return data
}

export async function getAdStats() {
  const { data } = await api.get('/ads/stats')
  return data
}

// ============================================================
// POSTING (Tarqatish)
// ============================================================

export async function getPosts(params?: { status?: string; adId?: string }) {
  const { data } = await api.get('/posts', { params })
  return data
}

export async function createPost(body: {
  adId: string
  selectedSessions?: string[]
  usePriorityGroups?: boolean
}) {
  const { data } = await api.post('/posts', body)
  return data
}

export async function stopPost(id: string) {
  const { data } = await api.post(`/posts/${id}/stop`)
  return data
}

export async function getPostingStatus() {
  const { data } = await api.get('/posts/active')
  return data
}

// ============================================================
// BALANCE
// ============================================================

export async function getBalance() {
  const { data } = await api.get('/balance')
  return data
}

export async function getTransactions() {
  const { data } = await api.get('/balance/transactions')
  return data
}

// ============================================================
// MAP (Harita)
// ============================================================

export async function getOnlineDrivers() {
  const { data } = await api.get('/drivers/admin/map/online')
  return data
}

export async function getRoute(fromLat: number, fromLng: number, toLat: number, toLng: number) {
  const coords = `${fromLng},${fromLat};${toLng},${toLat}`
  const { data } = await api.get('/orders/route', { params: { coords } })
  return data
}

export default api
