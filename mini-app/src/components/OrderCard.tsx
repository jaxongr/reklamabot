import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { acceptOrder } from '../api'
import { haptic, hapticSuccess, hapticError } from '../telegram'

interface Order {
  id: string
  senderName?: string
  groupTitle?: string
  cargoFrom?: string
  cargoTo?: string
  type: string
  status: string
  scope?: string
  phone?: string
  price?: string
  distance?: number
  vehicleType?: string
  vehicleCapacity?: string
  cargoWeight?: string
  messageDate?: string
  createdAt: string
}

function timeAgo(date: string): string {
  const d = date || ''
  if (!d) return ''
  const diff = Date.now() - new Date(d).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'hozirgina'
  if (min < 60) return `${min} min`
  const hours = Math.floor(min / 60)
  if (hours < 24) return `${hours} soat`
  return `${Math.floor(hours / 24)} kun`
}

interface Props {
  order: Order
  onAccepted?: () => void
}

export default function OrderCard({ order, onAccepted }: Props) {
  const navigate = useNavigate()
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const isDriver = order.type === 'DRIVER'

  const handleAccept = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setAccepting(true)
    try {
      await acceptOrder(order.id)
      hapticSuccess()
      setAccepted(true)
      onAccepted?.()
    } catch (err: any) {
      console.error(err)
      hapticError()
      const msg = err?.response?.data?.message || 'Xatolik'
      alert(msg)
    }
    setAccepting(false)
  }

  if (accepted) {
    return (
      <div className="card" style={{ opacity: 0.6, pointerEvents: 'none' }}>
        <div style={{ textAlign: 'center', padding: 12, color: 'var(--success)' }}>
          ✅ Qabul qilindi
        </div>
      </div>
    )
  }

  return (
    <div
      className="card"
      onClick={() => {
        haptic()
        navigate(`/order/${order.id}`)
      }}
    >
      {/* Header */}
      <div className="card-header">
        <div className="card-sender">
          <div className={`avatar ${isDriver ? 'avatar-driver' : 'avatar-cargo'}`}>
            {(order.senderName || '?')[0].toUpperCase()}
          </div>
          <div>
            <div className="sender-name">{order.senderName || 'Noma\'lum'}</div>
            <div className="sender-group">{order.groupTitle || ''}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span className={`tag ${isDriver ? 'tag-driver' : 'tag-cargo'}`}>
            {isDriver ? 'Haydovchi' : 'Yuk'}
          </span>
          {order.vehicleType && (
            <span style={{ fontSize: 11, color: 'var(--hint)' }}>{order.vehicleType}</span>
          )}
        </div>
      </div>

      {/* Route */}
      {(order.cargoFrom || order.cargoTo) && (
        <div className="route">
          <div className="route-dots">
            <div className="route-dot route-dot-from" />
            <div className="route-line" />
            <div className="route-dot route-dot-to" />
          </div>
          <div className="route-cities">
            <div className="route-city">{order.cargoFrom || '-'}</div>
            <div className="route-city">{order.cargoTo || '-'}</div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="info-row">
        <span className="info-item">{timeAgo(order.messageDate || order.createdAt)}</span>
        {order.distance && <span className="info-item">{order.distance} km</span>}
        {order.cargoWeight && <span className="info-item">{order.cargoWeight}</span>}
        {order.vehicleCapacity && <span className="info-item">{order.vehicleCapacity}</span>}
        {order.scope && order.scope !== 'INTERNAL' && (
          <span className={`tag tag-${order.scope?.toLowerCase()}`}>{order.scope}</span>
        )}
      </div>

      {/* Bottom: Price + Accept */}
      <div className="card-bottom">
        {order.price && <span className="price">{order.price}</span>}
        <button
          className="btn btn-sm btn-accent"
          onClick={handleAccept}
          disabled={accepting}
        >
          {accepting ? '...' : 'Qabul qilish'}
        </button>
      </div>
    </div>
  )
}
