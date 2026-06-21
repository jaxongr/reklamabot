import { useState, useEffect } from 'react'
import { getProfile } from '../api'
import { getTelegramUser, tg } from '../telegram'

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  DISPATCHER: 'Dispetcher',
  DRIVER: 'Haydovchi',
  USER: 'Foydalanuvchi',
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const tgUser = getTelegramUser()

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    )
  }

  const name = profile?.firstName || tgUser?.first_name || 'Foydalanuvchi'
  const initial = name[0]?.toUpperCase() || '?'

  return (
    <div className="page">
      <div className="profile-header">
        <div className="profile-avatar">{initial}</div>
        <div className="profile-name">{name} {profile?.lastName || tgUser?.last_name || ''}</div>
        <div className="profile-role">{roleLabels[profile?.role] || profile?.role || 'Foydalanuvchi'}</div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {profile?.telegramId && (
          <div className="profile-item">
            <span className="profile-item-label">Telegram ID</span>
            <span className="profile-item-value">{profile.telegramId}</span>
          </div>
        )}
        {(profile?.username || tgUser?.username) && (
          <div className="profile-item">
            <span className="profile-item-label">Username</span>
            <span className="profile-item-value">@{profile?.username || tgUser?.username}</span>
          </div>
        )}
        {profile?.phoneNumber && (
          <div className="profile-item">
            <span className="profile-item-label">Telefon</span>
            <span className="profile-item-value">{profile.phoneNumber}</span>
          </div>
        )}
        <div className="profile-item">
          <span className="profile-item-label">Til</span>
          <span className="profile-item-value">{profile?.language || tgUser?.language_code || 'uz'}</span>
        </div>
        <div className="profile-item">
          <span className="profile-item-label">Status</span>
          <span className="profile-item-value">
            <span className={`tag ${profile?.status === 'ACTIVE' ? 'tag-new' : 'tag-viewed'}`}>
              {profile?.status || 'ACTIVE'}
            </span>
          </span>
        </div>
        <div className="profile-item">
          <span className="profile-item-label">Ro'yxatdan o'tgan</span>
          <span className="profile-item-value">
            {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('uz-UZ') : '—'}
          </span>
        </div>
      </div>

      {/* Close Mini App */}
      <button
        className="btn btn-outline"
        style={{ marginTop: 16 }}
        onClick={() => tg?.close()}
      >
        Mini App ni yopish
      </button>
    </div>
  )
}
