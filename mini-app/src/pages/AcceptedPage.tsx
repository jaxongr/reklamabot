import { useState, useEffect, useCallback } from 'react'
import { getMyOrders, acceptOrder } from '../api'
import OrderCard from '../components/OrderCard'
import { useAppContext } from '../App'

export default function AcceptedPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { setDrawerOpen } = useAppContext()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMyOrders()
      setOrders(res.data || res || [])
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="page">
      <div className="page-header">
        <button className="menu-btn" onClick={() => setDrawerOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--tg-theme-text-color, #333)">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
        <h1 className="page-title">Qabul qilingan</h1>
        <button className="icon-btn" onClick={load}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--tg-theme-hint-color, #999)">
            <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /><span>Yuklanmoqda...</span></div>
      ) : orders.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">✅</div>
          <div className="empty-text">Qabul qilingan buyurtmalar yo'q</div>
          <div className="empty-sub">Buyurtmalarni asosiy sahifadan qabul qiling</div>
        </div>
      ) : (
        orders.map((order: any) => (
          <OrderCard key={order.id} order={order} />
        ))
      )}
    </div>
  )
}
