import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAds, getPosts, createPost, stopPost, getSessions, deleteAd } from '../api'
import { useAppContext } from '../App'
import { haptic } from '../telegram'

export default function PostingPage() {
  const [ads, setAds] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const navigate = useNavigate()
  const { setDrawerOpen } = useAppContext()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [adsRes, postsRes, sessRes] = await Promise.all([
        getAds({ status: 'ACTIVE' }),
        getPosts().catch(() => []),
        getSessions().catch(() => []),
      ])
      setAds(adsRes.data || adsRes || [])
      const postsData = postsRes.data || postsRes || []
      setPosts(Array.isArray(postsData) ? postsData : [])
      const sessData = sessRes.data || sessRes || []
      setSessions(Array.isArray(sessData) ? sessData : [])
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleStartPost = async (adId: string) => {
    setActionId(adId)
    try {
      const activeSessions = sessions.filter((s: any) => s.status === 'ACTIVE' && !s.isFrozen)
      await createPost({
        adId,
        selectedSessions: activeSessions.map((s: any) => s.id),
      })
      haptic()
      await load()
    } catch (e: any) {
      alert(e.response?.data?.message || 'Tarqatishda xatolik')
    }
    setActionId(null)
  }

  const handleStopPost = async (postId: string) => {
    setActionId(postId)
    try {
      await stopPost(postId)
      haptic()
      await load()
    } catch (e: any) {
      alert(e.response?.data?.message || 'To\'xtatishda xatolik')
    }
    setActionId(null)
  }

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('E\'lonni o\'chirmoqchimisiz?')) return
    setActionId(adId)
    try {
      await deleteAd(adId)
      setAds(prev => prev.filter(a => a.id !== adId))
      haptic()
    } catch (e: any) {
      alert(e.response?.data?.message || 'O\'chirishda xatolik')
    }
    setActionId(null)
  }

  // Group active posts by adId
  const activePostsByAd: Record<string, any> = {}
  posts.forEach((p: any) => {
    if (p.status === 'POSTING' || p.status === 'ACTIVE' || p.status === 'PENDING') {
      activePostsByAd[p.adId] = p
    }
  })

  const activeSessCount = sessions.filter((s: any) => s.status === 'ACTIVE' && !s.isFrozen).length

  return (
    <div className="page">
      <div className="page-header">
        <button className="menu-btn" onClick={() => setDrawerOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--tg-theme-text-color, #333)">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
        <h1 className="page-title">Tarqatish</h1>
        <button className="icon-btn" onClick={load}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--tg-theme-hint-color, #999)">
            <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
        </button>
      </div>

      {/* Session info banner */}
      <div className="info-banner">
        <span>Faol sessiyalar: <strong>{activeSessCount}</strong></span>
        {activeSessCount === 0 && (
          <button className="btn btn-sm btn-accent" onClick={() => navigate('/sessions/add')}>
            + Sessiya ulash
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /><span>Yuklanmoqda...</span></div>
      ) : ads.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📢</div>
          <div className="empty-text">Faol e'lon topilmadi</div>
          <div className="empty-sub">Tarqatish uchun avval e'lon yarating</div>
          <button className="btn btn-primary" style={{ marginTop: 16, width: 'auto', padding: '10px 24px' }} onClick={() => navigate('/create-ad')}>
            + E'lon yaratish
          </button>
        </div>
      ) : (
        <>
          {ads.map((ad: any) => {
            const activePost = activePostsByAd[ad.id]
            return (
              <div key={ad.id} className="card">
                <div className="ad-header">
                  <div className="ad-title">{ad.title}</div>
                  {activePost && <span className="tag tag-new">Faol</span>}
                </div>

                <div className="ad-content">{ad.content?.substring(0, 120)}...</div>

                <div className="ad-stats">
                  <span>Yuborilgan: {ad.totalSent || 0}</span>
                  <span>Guruhlar: {ad.totalGroups || 0}</span>
                </div>

                <div className="session-actions" style={{ marginTop: 10 }}>
                  {activePost ? (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleStopPost(activePost.id)}
                      disabled={actionId === activePost.id}
                    >
                      To'xtatish
                    </button>
                  ) : (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleStartPost(ad.id)}
                      disabled={actionId === ad.id || activeSessCount === 0}
                    >
                      Tarqatish
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-outline"
                    style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                    onClick={() => handleDeleteAd(ad.id)}
                    disabled={!!actionId}
                  >
                    O'chirish
                  </button>
                </div>
              </div>
            )
          })}

          <button className="btn btn-accent" style={{ marginTop: 12 }} onClick={() => navigate('/create-ad')}>
            + Yangi e'lon yaratish
          </button>
        </>
      )}
    </div>
  )
}
