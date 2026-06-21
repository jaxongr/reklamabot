import { useLocation, useNavigate } from 'react-router-dom'
import { haptic } from '../telegram'

interface Props {
  isDriver: boolean
}

const dispatcherTabs = [
  { path: '/', label: 'Asosiy', icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' },
  { path: '/accepted', label: 'Qabul', icon: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' },
  { path: '/map', label: 'Harita', icon: 'M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z' },
  { path: '/sessions', label: 'Sessiya', icon: 'M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z' },
  { path: '/profile', label: 'Profil', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
]

const driverTabs = [
  { path: '/', label: 'Asosiy', icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' },
  { path: '/accepted', label: 'Qabul', icon: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' },
  { path: '/balance', label: 'Balans', icon: 'M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z' },
  { path: '/profile', label: 'Profil', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
]

export default function BottomNav({ isDriver }: Props) {
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname

  // Hide on detail/sub pages
  if (path.includes('/order/') || path.includes('/sessions/add') || path.includes('/create-ad')) {
    return null
  }

  const tabs = isDriver ? driverTabs : dispatcherTabs

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const isActive = tab.path === '/' ? path === '/' : path.startsWith(tab.path)
        return (
          <button
            key={tab.path}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => { haptic(); navigate(tab.path) }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d={tab.icon} />
            </svg>
            <span>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
