import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrder, acceptOrder } from '../api'
import { tg, hapticSuccess, hapticError } from '../telegram'

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getOrder(id)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  // Back button
  useEffect(() => {
    tg?.BackButton?.show()
    const handler = () => navigate(-1)
    tg?.BackButton?.onClick(handler)
    return () => {
      tg?.BackButton?.hide()
      tg?.BackButton?.offClick(handler)
    }
  }, [navigate])

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="empty">
        <div className="empty-icon">❌</div>
        <div className="empty-text">Buyurtma topilmadi</div>
      </div>
    )
  }

  const isDriver = order.type === 'DRIVER'
  const route = [order.cargoFrom, order.cargoTo].filter(Boolean).join(' → ')

  const handleCall = () => {
    if (order.phone) {
      hapticSuccess()
      window.open(`tel:${order.phone}`, '_self')
    }
  }

  return (
    <div className="page">
      {/* Type badge */}
      <div style={{ marginBottom: 12 }}>
        <span className={`tag ${isDriver ? 'tag-driver' : 'tag-cargo'}`} style={{ fontSize: 13, padding: '5px 12px' }}>
          {isDriver ? '🚛 Haydovchi' : '📦 Yuk'}
        </span>
        {order.scope && (
          <span className={`tag tag-${order.scope.toLowerCase()}`} style={{ marginLeft: 8, fontSize: 13, padding: '5px 12px' }}>
            {order.scope}
          </span>
        )}
      </div>

      {/* Route */}
      {(order.cargoFrom || order.cargoTo) && (
        <div className="card">
          <div className="route">
            <div className="route-dots">
              <div className="route-dot route-dot-from" />
              <div className="route-line" />
              <div className="route-dot route-dot-to" />
            </div>
            <div className="route-cities">
              <div>
                <div className="route-city">{order.cargoFrom || '—'}</div>
                <div style={{ fontSize: 12, color: 'var(--tg-theme-hint-color)' }}>Qayerdan</div>
              </div>
              <div>
                <div className="route-city">{order.cargoTo || '—'}</div>
                <div style={{ fontSize: 12, color: 'var(--tg-theme-hint-color)' }}>Qayerga</div>
              </div>
            </div>
          </div>
          {order.distance && (
            <div style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: 'var(--tg-theme-hint-color)' }}>
              📍 {order.distance} km
            </div>
          )}
        </div>
      )}

      {/* Details */}
      <div className="card">
        {order.senderName && (
          <div className="detail-section">
            <div className="detail-label">Yuboruvchi</div>
            <div className="detail-value">{order.senderName}</div>
          </div>
        )}
        {order.groupTitle && (
          <div className="detail-section">
            <div className="detail-label">Guruh</div>
            <div className="detail-value">{order.groupTitle}</div>
          </div>
        )}
        {order.vehicleType && (
          <div className="detail-section">
            <div className="detail-label">Mashina turi</div>
            <div className="detail-value">{order.vehicleType} {order.vehicleCapacity || ''}</div>
          </div>
        )}
        {order.price && (
          <div className="detail-section">
            <div className="detail-label">Narx</div>
            <div className="price">{order.price}</div>
          </div>
        )}
        {order.phone && (
          <div className="detail-section">
            <div className="detail-label">Telefon</div>
            <div className="detail-value" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              {order.phone}
            </div>
          </div>
        )}
        <div className="detail-section">
          <div className="detail-label">Sana</div>
          <div className="detail-value">
            {new Date(order.messageDate || order.createdAt).toLocaleString('uz-UZ')}
          </div>
        </div>
      </div>

      {/* Message text */}
      {order.messageText && (
        <div className="card">
          <div className="detail-label" style={{ marginBottom: 8 }}>Xabar matni</div>
          <div className="detail-message">{order.messageText}</div>
        </div>
      )}

      {/* Actions */}
      <div className="action-buttons">
        {order.phone && (
          <button className="btn btn-call" onClick={handleCall}>
            📞 Qo'ng'iroq
          </button>
        )}
        <button className="btn btn-accent" onClick={async () => {
          try {
            await acceptOrder(order.id)
            hapticSuccess()
            alert('Buyurtma qabul qilindi!')
            navigate('/accepted')
          } catch (err: any) {
            hapticError()
            alert(err?.response?.data?.message || 'Xatolik')
          }
        }}>
          ✓ Qabul qilish
        </button>
      </div>
    </div>
  )
}
