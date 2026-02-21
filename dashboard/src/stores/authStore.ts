import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

interface User {
  id: string
  telegramId: string
  username: string
  firstName: string
  lastName: string
  role: 'USER' | 'ADMIN' | 'DISPATCHER' | 'SUPER_ADMIN'
  isActive: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (telegramId: string, authData: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (telegramId, authData) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/login', { telegramId, authData })
          const { user, accessToken, refreshToken } = response.data

          localStorage.setItem('token', accessToken)
          localStorage.setItem('refreshToken', refreshToken)

          set({ user, token: accessToken, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        set({ user: null, token: null })
      },
    }),
    {
      name: 'auth-storage',
    },
  ),
)
