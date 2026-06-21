import { useEffect, useRef, useMemo } from 'react'
import { Card, Tag, Space, Spin, Badge } from 'antd'
import { EnvironmentOutlined, ReloadOutlined } from '@ant-design/icons'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useOnlineDriversMap } from '../../hooks/useApi'
import type { DriverMapItem } from '../../types'

// Fix default marker icons (leaflet npm issue)
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const UZBEKISTAN_CENTER: [number, number] = [41.3111, 69.2797]

const createDriverIcon = (isVerified: boolean) =>
  L.divIcon({
    className: 'driver-marker',
    html: `<div style="
      background: ${isVerified ? '#52c41a' : '#faad14'};
      width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      font-size: 16px; cursor: pointer;
    ">🚛</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })

// Component to handle map resize when tab becomes visible
const MapResizer = () => {
  const map = useMap()
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      map.invalidateSize()
    })
    observer.observe(map.getContainer())
    // Also invalidate on mount with small delay for tab switch
    const timer = setTimeout(() => map.invalidateSize(), 200)
    return () => {
      observer.disconnect()
      clearTimeout(timer)
    }
  }, [map])
  return null
}

// Component to fit bounds when drivers change
const FitBounds = ({ drivers }: { drivers: DriverMapItem[] }) => {
  const map = useMap()
  const prevCountRef = useRef(0)

  useEffect(() => {
    const withLocation = drivers.filter(d => d.lastLat != null && d.lastLng != null)
    if (withLocation.length > 0 && withLocation.length !== prevCountRef.current) {
      const bounds = L.latLngBounds(withLocation.map(d => [d.lastLat!, d.lastLng!]))
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 })
      prevCountRef.current = withLocation.length
    }
  }, [drivers, map])

  return null
}

const DriverMapPopup = ({ driver }: { driver: DriverMapItem }) => (
  <div style={{ minWidth: 200, lineHeight: 1.7, fontSize: 13 }}>
    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
      {driver.fullName || "Noma'lum"}
    </div>
    <div>🚛 {driver.vehicleType || '—'} | {driver.vehicleCapacity || '—'}</div>
    <div>📍 {driver.lastCity || '—'}</div>
    <div>📞 {driver.phone || '—'}</div>
    <div>🔢 {(driver as any).vehicleNumber || '—'}</div>
    <div style={{ marginTop: 4 }}>
      {driver.isVerified
        ? <Tag color="green" style={{ margin: 0 }}>Tasdiqlangan</Tag>
        : <Tag color="orange" style={{ margin: 0 }}>Moderatsiyada</Tag>
      }
    </div>
  </div>
)

const DriverMap = () => {
  const { data: drivers, isLoading, refetch } = useOnlineDriversMap()

  const driversWithLocation = useMemo(
    () => (drivers || []).filter((d: DriverMapItem) => d.lastLat != null && d.lastLng != null),
    [drivers]
  )

  const onlineCount = drivers?.length || 0

  return (
    <Card>
      <Space style={{ marginBottom: 12 }}>
        <EnvironmentOutlined />
        <span style={{ fontWeight: 500 }}>
          Online haydovchilar: {onlineCount}
        </span>
        <Badge count={driversWithLocation.length} showZero style={{ backgroundColor: '#52c41a' }}>
          <Tag color="green">Xaritada</Tag>
        </Badge>
        <Tag color="orange">Moderatsiyada</Tag>
        <a onClick={() => refetch()} style={{ marginLeft: 8, cursor: 'pointer' }}>
          <ReloadOutlined /> Yangilash
        </a>
      </Space>

      {isLoading ? (
        <div style={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin size="large" />
        </div>
      ) : (
        <div style={{ height: 500, borderRadius: 8, overflow: 'hidden', border: '1px solid #d9d9d9' }}>
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
            {driversWithLocation.length > 0 && <FitBounds drivers={driversWithLocation} />}
            {driversWithLocation.map((driver: DriverMapItem) => (
              <Marker
                key={driver.id || `${driver.lastLat}-${driver.lastLng}`}
                position={[driver.lastLat!, driver.lastLng!]}
                icon={createDriverIcon(driver.isVerified)}
              >
                <Popup>
                  <DriverMapPopup driver={driver} />
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </Card>
  )
}

export default DriverMap
