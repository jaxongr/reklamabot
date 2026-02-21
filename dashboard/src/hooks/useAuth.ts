import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'

export const useAuth = () => {
  const { user, token, isLoading, login, logout } = useAuthStore()
  const navigate = useNavigate()

  const isAuthenticated = !!token

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  const handleLogout = useCallback(() => {
    logout()
    navigate('/login')
  }, [logout, navigate])

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    logout: handleLogout,
  }
}
