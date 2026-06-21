import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSessions, deleteSession, freezeSession, unfreezeSession, syncSessionGroups } from '../api'
import { useAppContext } from '../App'
import { haptic } from '../telegram'

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const navigate = useNavigate()
  const { setDrawerOpen } = useAppContext()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getSessions()
      setSessions(Array.isArray(res) ? res : res.data || [])
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: string) => {
    if (!confirm('Sessiyani o\'chirmoqchimisiz?')) return
    setActionId(id)
    try {
      await deleteSession(id)
      setSessions(prev => prev.filter(s => s.id !== id))
      haptic()
    } catch (e) {
      alert('Xatolik yuz berdi')
    }
    setActionId(null)
  }

  const handleFreeze = async (id: string, frozen: boolean) => {
    setActionId(id)
    try {
      if (frozen) await unfreezeSession(id)
      else await freezeSession(id)
      await load()
      haptic()
    } catch (e) {
      alert('Xatolik yuz berdi')
    }
    setActionId(null)
  }

  const handleSync = async (id: string) => {
    setActionId(id)
    try {
      const res = await syncSessionGroups(id)
      alert(`Sync muvaffaqiyatli! ${res.totalGroups || 0} guruh topildi`)
      haptic()
    } catch (e: any) {
      alert(e.response?.data?.message || 'Sync xatolik')
    }
    setActionId(null)
  }

  const statusColors: Record<string, string> = {
    ACTIVE: 'var(--success)',
    PENDING: 'var(--warning)',
    EXPIRED: 'var(--danger)',
    BANNED: 'var(--danger)',
  }

  return (
    <div className="page">
      <div className="page-header">
        <button className="menu-btn" onClick={() => setDrawerOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--tg-theme-text-color, #333)">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
        <h1 className="page-title">Sessiyalar</h1>
        <button className="icon-btn" onClick={load}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--tg-theme-hint-color, #999)">
            <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /><span>Yuklanmoqda...</span></div>
      ) : (
        <>
          {/* Sessions list */}
          {sessions.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📱</div>
              <div className="empty-text">Sessiya topilmadi</div>
              <div className="empty-sub">Telegram sessiya ulash uchun qo'shish tugmasini bosing</div>
            </div>
          ) : (
            sessions.map((s: any) => (
              <div key={s.id} className="card session-card">
                <div className="session-header">
                  <div>
                    <div className="session-name">{s.name || s.phone || 'Sessiya'}</div>
                    <div className="session-phone">{s.phone || '—'}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {s.isFrozen && <span className="tag" style={{ background: '#E0F2FE', color: '#0284C7' }}>Muzlatilgan</span>}
                    <span className="session-status" style={{ color: statusColors[s.status] || '#999' }}>
                      {s.status}
                    </span>
                  </div>
                </div>

                <div className="session-info">
                  <span>Guruhlar: {s.totalGroups || 0}</span>
                  {s.isPremium && <span className="tag" style={{ background: '#FEF3C7', color: '#D97706' }}>Premium</span>}
                </div>

                <div className="session-actions">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleSync(s.id)}
                    disabled={actionId === s.id || s.isFrozen}
                  >
                    Sync
                  </button>
                  <button
                    className="btn btn-sm"
                    style={{ background: s.isFrozen ? 'var(--accent)' : '#0EA5E9', color: '#fff' }}
                    onClick={() => handleFreeze(s.id, s.isFrozen)}
                    disabled={actionId === s.id}
                  >
                    {s.isFrozen ? 'Eritish' : 'Muzlatish'}
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(s.id)}
                    disabled={actionId === s.id}
                  >
                    O'chirish
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Add session button */}
          <button
            className="btn btn-primary"
            style={{ marginTop: 16 }}
            onClick={() => navigate('/sessions/add')}
          >
            + Sessiya qo'shish
          </button>
        </>
      )}
    </div>
  )
}
