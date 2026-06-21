import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../App'
import { logout } from '../api'
import { tg } from '../telegram'

interface Props {
  onClose: () => void
}

export default function Drawer({ onClose }: Props) {
  const navigate = useNavigate()
  const { user } = useAppContext()
  const isDriver = user?.role === 'DRIVER'

  const go = (path: string) => {
    onClose()
    navigate(path)
  }

  const handleLogout = () => {
    onClose()
    logout()
    tg?.close()
  }

  const name = user?.firstName || user?.username || 'Foydalanuvchi'
  const initial = name[0]?.toUpperCase() || '?'

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    DISPATCHER: 'Dispetcher',
    DRIVER: 'Haydovchi',
    USER: 'Foydalanuvchi',
  }

  return (
    <div className="drawer">
      {/* Header */}
      <div className="drawer-header">
        <div className="drawer-avatar">{initial}</div>
        <div>
          <div className="drawer-name">{name} {user?.lastName || ''}</div>
          <div className="drawer-role">{roleLabels[user?.role] || 'Foydalanuvchi'}</div>
        </div>
      </div>

      <div className="drawer-divider" />

      {/* Common items */}
      <div className="drawer-items">
        <button className="drawer-item" onClick={() => go('/')}>
          <span className="drawer-icon">🏠</span> Asosiy
        </button>
        <button className="drawer-item" onClick={() => go('/accepted')}>
          <span className="drawer-icon">✅</span> Qabul qilinganlar
        </button>
        <button className="drawer-item" onClick={() => go('/balance')}>
          <span className="drawer-icon">💰</span> Balans
        </button>

        <div className="drawer-divider" />

        {/* Dispatcher items */}
        {!isDriver && (
          <>
            <button className="drawer-item" onClick={() => go('/sessions')}>
              <span className="drawer-icon">📱</span> Sessiyalar
            </button>
            <button className="drawer-item" onClick={() => go('/map')}>
              <span className="drawer-icon">🗺️</span> Harita
            </button>
            <button className="drawer-item" onClick={() => go('/posting')}>
              <span className="drawer-icon">📢</span> Tarqatish
            </button>
            <button className="drawer-item" onClick={() => go('/create-ad')}>
              <span className="drawer-icon">✍️</span> E'lon yaratish
            </button>
            <div className="drawer-divider" />
          </>
        )}

        <button className="drawer-item" onClick={() => go('/profile')}>
          <span className="drawer-icon">👤</span> Profil
        </button>
      </div>

      {/* Logout */}
      <div className="drawer-footer">
        <button className="drawer-item drawer-logout" onClick={handleLogout}>
          <span className="drawer-icon">🚪</span> Chiqish
        </button>
      </div>
    </div>
  )
}
