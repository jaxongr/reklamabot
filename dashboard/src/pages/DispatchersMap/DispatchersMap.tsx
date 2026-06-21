import { useEffect, useRef, useMemo } from 'react'
import { Card, Tag, Space, Spin, Badge, Typography, Empty } from 'antd'
import { EnvironmentOutlined, ReloadOutlined, WifiOutlined } from '@ant-design/icons'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/uz-latn'
import { useOnlineDispatchersMap } from '../../hooks/useApi'
import type { DispatcherLocation } from '../../types'

dayjs.extend(relativeTime)
dayjs.locale('uz-latn')

// Fix default marker icons (leaflet npm issue)
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const UZBEKISTAN_CENTER: [number, number] = [41.3111, 69.2797]

// Dispetcher uchun — teal/zumrad rang (driver yashil/sariq'dan farq qilish uchun)
const createDispatcherIcon = (isLineActive: boolean) =>
  L.divIcon({
    className: 'dispatcher-marker',
    html: `<div style="
      background: ${isLineActive ? '#13c2c2' : '#8c8c8c'};
      width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      font-size: 16px; cursor: pointer;
    ">📞</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })

// Harita o'lchamini tab ko'rinadigan bo'lganda qayta hisoblash
const MapResizer = () => {
  const map = useMap()
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      map.invalidateSize()
    })
    observer.observe(map.getContainer())
    const timer = setTimeout(() => map.invalidateSize(), 200)
    return () => {
      observer.disconnect()
      clearTimeout(timer)
    }
  }, [map])
  return null
}

// Dispetcher soni o'zgarganda bounds'ga fit qilish (faqat birinchi marta)
const FitBounds = ({ items }: { items: DispatcherLocation[] }) => {
  const map = useMap()
  const prevCountRef = useRef(0)

  useEffect(() => {
    if (items.length > 0 && items.length !== prevCountRef.current) {
      const bounds = L.latLngBounds(items.map(d => [d.lastLat, d.lastLng]))
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 })
      prevCountRef.current = items.length
    }
  }, [items, map])

  return null
}

const getFullName = (d: DispatcherLocation) => {
  const parts = [d.firstName, d.lastName].filter(Boolean)
  if (parts.length > 0) return parts.join(' ')
  return d.username || "Noma'lum"
}

const DispatcherPopup = ({ d }: { d: DispatcherLocation }) => (
  <div style={{ minWidth: 220, lineHeight: 1.7, fontSize: 13 }}>
    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
      📞 {getFullName(d)}
    </div>
    <div>📱 {d.phoneNumber || '—'}</div>
    <div>📍 {d.lastCity || 'Noma\'lum hudud'}</div>
    <div>
      🕒 {d.lastLocationAt ? dayjs(d.lastLocationAt).fromNow() : '—'}
    </div>
    <div style={{ marginTop: 6 }}>
      {d.isLineActive
        ? <Tag color="cyan" style={{ margin: 0 }}>Linya yoqiq</Tag>
        : <Tag color="default" style={{ margin: 0 }}>Linya o'chiq</Tag>
      }
      {d.isOnline && <Tag color="green" style={{ marginLeft: 4 }}>Online</Tag>}
    </div>
  </div>
)

const DispatchersMap = () => {
  const { data, isLoading, refetch, dataUpdatedAt } = useOnlineDispatchersMap(5)

  const items = useMemo<DispatcherLocation[]>(
    () => (data || []).filter(d => d.lastLat != null && d.lastLng != null),
    [data]
  )

  const totalCount = data?.length || 0
  const lineActiveCount = items.filter(d => d.isLineActive).length

  return (
    <Card
      title={
        <Space>
          <EnvironmentOutlined style={{ color: '#13c2c2' }} />
          <Typography.Text strong>Dispetcherlar xaritasi</Typography.Text>
          <Tag color="cyan">{totalCount} online</Tag>
          <Tag color="default">Oxirgi 5 daqiqada</Tag>
        </Space>
      }
      extra={
        <Space>
          <Badge
            count={lineActiveCount}
            showZero
            style={{ backgroundColor: '#13c2c2' }}
          >
            <Tag icon={<WifiOutlined />} color="cyan">Linya yoqiq</Tag>
          </Badge>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {dataUpdatedAt ? `Yangilandi: ${dayjs(dataUpdatedAt).format('HH:mm:ss')}` : ''}
          </Typography.Text>
          <a onClick={() => refetch()} style={{ cursor: 'pointer' }}>
            <ReloadOutlined /> Yangilash
          </a>
        </Space>
      }
    >
      {isLoading ? (
        <div style={{ height: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin size="large" tip="Xarita yuklanmoqda..." />
        </div>
      ) : items.length === 0 ? (
        <div style={{ height: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Empty
            description="Hozir online dispetcherlar yo'q (oxirgi 5 daqiqada GPS yuborilmagan)"
          />
        </div>
      ) : (
        <div style={{ height: 600, borderRadius: 8, overflow: 'hidden', border: '1px solid #d9d9d9' }}>
          <MapContainer
            center={UZBEKISTAN_CENTER}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              maxZoom={20}
            />
            <MapResizer />
            <FitBounds items={items} />
            {items.map(d => (
              <Marker
                key={d.id}
                position={[d.lastLat, d.lastLng]}
                icon={createDispatcherIcon(d.isLineActive)}
              >
                <Popup>
                  <DispatcherPopup d={d} />
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </Card>
  )
}

export default DispatchersMap
