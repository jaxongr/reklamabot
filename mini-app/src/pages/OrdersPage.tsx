import { useState, useEffect, useCallback } from 'react'
import { getOrders, getOrderStats } from '../api'
import OrderCard from '../components/OrderCard'
import { useAppContext } from '../App'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')
  const [search, setSearch] = useState('')
  const { setDrawerOpen } = useAppContext()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [ordersRes, statsRes] = await Promise.all([
        getOrders({
          type: (filter === 'CARGO' || filter === 'DRIVER') ? filter : undefined,
          scope: (filter === 'IMPORT' || filter === 'EXPORT') ? filter : undefined,
          take: 50,
          search: search || undefined,
        }),
        getOrderStats(),
      ])
      setOrders(ordersRes.data || ordersRes || [])
      setStats(statsRes)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }, [filter, search])

  useEffect(() => { load() }, [load])

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <button className="menu-btn" onClick={() => setDrawerOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--tg-theme-text-color, #333)">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
        <h1 className="page-title">Buyurtmalar</h1>
        <button className="icon-btn" onClick={load}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--tg-theme-hint-color, #999)">
            <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.today || 0}</div>
            <div className="stat-label">Bugun</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.new || 0}</div>
            <div className="stat-label">Yangi</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.cargo || 0}</div>
            <div className="stat-label">Yuk</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.driver || 0}</div>
            <div className="stat-label">Haydovchi</div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--tg-theme-hint-color, #999)" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Shahar, telefon qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
        />
      </div>

      {/* Filters */}
      <div className="filters">
        {[
          { key: '', label: 'Barchasi' },
          { key: 'CARGO', label: 'Yuklar' },
          { key: 'DRIVER', label: 'Haydovchilar' },
          { key: 'IMPORT', label: 'Import' },
          { key: 'EXPORT', label: 'Eksport' },
        ].map((f) => (
          <button
            key={f.key}
            className={`filter-btn ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div className="loading"><div className="spinner" /><span>Yuklanmoqda...</span></div>
      ) : orders.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📦</div>
          <div className="empty-text">Buyurtma topilmadi</div>
        </div>
      ) : (
        orders.map((order: any) => (
          <OrderCard key={order.id} order={order} onAccepted={load} />
        ))
      )}
    </div>
  )
}
