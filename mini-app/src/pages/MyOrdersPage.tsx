import { useState, useEffect } from 'react'
import { getMyOrders } from '../api'
import OrderCard from '../components/OrderCard'

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyOrders()
      .then((res) => setOrders(res.data || res || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Qabul qilingan</h1>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner" />
          <span>Yuklanmoqda...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">✅</div>
          <div className="empty-text">Qabul qilingan buyurtmalar yo'q</div>
        </div>
      ) : (
        orders.map((order: any) => (
          <OrderCard key={order.id} order={order} />
        ))
      )}
    </div>
  )
}
