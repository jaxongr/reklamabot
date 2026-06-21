import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { initTelegram, getInitData, getTelegramUser } from './telegram'
import { authViaTelegram, getToken, getUser, logout } from './api'

import BottomNav from './components/BottomNav'
import Drawer from './components/Drawer'
import OrdersPage from './pages/OrdersPage'
import OrderDetail from './pages/OrderDetail'
import AcceptedPage from './pages/AcceptedPage'
import SessionsPage from './pages/SessionsPage'
import AddSessionPage from './pages/AddSessionPage'
import PostingPage from './pages/PostingPage'
import CreateAdPage from './pages/CreateAdPage'
import BalancePage from './pages/BalancePage'
import ProfilePage from './pages/ProfilePage'
import MapPage from './pages/MapPage'

interface AppContextType {
  user: any
  setUser: (u: any) => void
  drawerOpen: boolean
  setDrawerOpen: (v: boolean) => void
}

export const AppContext = createContext<AppContextType>({
  user: null,
  setUser: () => {},
  drawerOpen: false,
  setDrawerOpen: () => {},
})

export const useAppContext = () => useContext(AppContext)

function AppContent() {
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    initTelegram()

    async function init() {
      // Already have token?
      if (getToken()) {
        setUser(getUser())
        setAuthed(true)
        setLoading(false)
        return
      }

      // Auth via Telegram initData
      const initData = getInitData()
      if (initData) {
        const ok = await authViaTelegram()
        if (ok) {
          setUser(getUser())
          setAuthed(true)
          setLoading(false)
          return
        }
      }

      const tgUser = getTelegramUser()
      if (!tgUser) {
        setError('Bu ilova faqat Telegram ichida ishlaydi')
      } else {
        setError('Avtorizatsiyada xatolik yuz berdi')
      }
      setLoading(false)
    }

    init()
  }, [])

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner" />
        <span className="loading-text">Yuklanmoqda...</span>
      </div>
    )
  }

  if (error || !authed) {
    return (
      <div className="center-screen">
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <div className="error-title">{error || 'Avtorizatsiya kerak'}</div>
        <div className="error-sub">Iltimos, Telegram bot orqali Mini App ni oching</div>
      </div>
    )
  }

  const isDriver = user?.role === 'DRIVER'

  return (
    <AppContext.Provider value={{ user, setUser, drawerOpen, setDrawerOpen }}>
      <div className="app-container">
        {/* Drawer overlay */}
        {drawerOpen && (
          <>
            <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />
            <Drawer onClose={() => setDrawerOpen(false)} />
          </>
        )}

        <Routes>
          {/* Common routes */}
          <Route path="/" element={<OrdersPage />} />
          <Route path="/order/:id" element={<OrderDetail />} />
          <Route path="/accepted" element={<AcceptedPage />} />
          <Route path="/balance" element={<BalancePage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Map */}
          <Route path="/map" element={<MapPage />} />

          {/* Dispatcher routes */}
          {!isDriver && (
            <>
              <Route path="/sessions" element={<SessionsPage />} />
              <Route path="/sessions/add" element={<AddSessionPage />} />
              <Route path="/posting" element={<PostingPage />} />
              <Route path="/create-ad" element={<CreateAdPage />} />
            </>
          )}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <BottomNav isDriver={isDriver} />
      </div>
    </AppContext.Provider>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/mini">
      <AppContent />
    </BrowserRouter>
  )
}
