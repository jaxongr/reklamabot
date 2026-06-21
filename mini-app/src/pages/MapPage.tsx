import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../App'
import { getOrders, getOnlineDrivers, getRoute } from '../api'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface CityCluster {
  city: string
  coord: [number, number]
  orders: any[]
  cargoCount: number
  driverCount: number
}

// Shahar koordinatalari
const CITIES: Record<string, [number, number]> = {
  'toshkent': [41.2995, 69.2401], 'samarqand': [39.6542, 66.9597], 'buxoro': [39.7681, 64.4556],
  'navoiy': [40.1003, 65.3792], 'andijon': [40.7821, 72.3442], 'fargona': [40.3834, 71.7870],
  'namangan': [40.9983, 71.6726], 'qarshi': [38.8606, 65.7981], 'termiz': [37.2241, 67.2783],
  'nukus': [42.4628, 59.6003], 'urganch': [41.5533, 60.6336], 'jizzax': [40.1158, 67.8422],
  'guliston': [40.4897, 68.7842], 'chirchiq': [41.4689, 69.5828], 'olmaliq': [40.8453, 69.5983],
  'angren': [41.0167, 70.1436], 'bekobod': [40.2214, 69.2692], 'ohangaron': [41.0667, 69.6333],
  'kattaqorgon': [39.8986, 66.2561], 'urgut': [39.4000, 67.2333], 'shahrisabz': [39.0547, 66.8297],
  'denov': [38.2714, 67.8936], 'kokand': [40.5286, 70.9425], 'margilon': [40.4703, 71.7147],
  'xiva': [41.3786, 60.3639], 'kogon': [39.7278, 64.5514], 'kitob': [39.1331, 66.8578],
  'asaka': [40.6406, 72.2378], 'shahrixon': [40.7167, 72.0500], 'chust': [41.0003, 71.2333],
  'sirdaryo': [40.8500, 68.6667], 'zarafshon': [41.5750, 64.1850], 'turtkul': [41.5500, 60.9167],
  'moskva': [55.7558, 37.6173], 'almaty': [43.2220, 76.8512], 'shymkent': [42.3417, 69.5967],
  'bishkek': [42.8746, 74.5698], 'dushanbe': [38.5598, 68.7740],
}

function findCoord(city?: string | null): [number, number] | null {
  if (!city) return null
  const key = city.toLowerCase().trim().replace(/[''ʻʼ]/g, "'")
  if (CITIES[key]) return CITIES[key]
  const noApos = key.replace(/'/g, '')
  for (const [k, v] of Object.entries(CITIES)) {
    if (k.replace(/'/g, '') === noApos) return v
  }
  for (const [k, v] of Object.entries(CITIES)) {
    if (k.length >= 5 && (k.startsWith(key) || key.startsWith(k))) return v
  }
  return null
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} soat`
  return new Date(d).toLocaleDateString('uz', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const layerGroup = useRef<L.LayerGroup | null>(null)
  const routeLayer = useRef<L.LayerGroup | null>(null)
  const navigate = useNavigate()
  const { setDrawerOpen } = useAppContext()

  const [clusters, setClusters] = useState<CityCluster[]>([])
  const [onlineDrivers, setOnlineDrivers] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [sheetOrders, setSheetOrders] = useState<any[] | null>(null)
  const [sheetCity, setSheetCity] = useState('')

  // Datani yuklash
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const from24h = new Date(Date.now() - 86400000).toISOString()
      const [cargoRes, driverRes, onlineRes] = await Promise.all([
        getOrders({ type: 'CARGO', limit: 5000, dateFrom: from24h }),
        getOrders({ type: 'DRIVER', limit: 5000 }),
        getOnlineDrivers(),
      ])
      const cargoOrders = cargoRes?.data || []
      const allDriverOrders = driverRes?.data || []

      // Haydovchi uniqlash
      const driverMap = new Map()
      for (const o of allDriverOrders) {
        const key = o.senderTelegramId || o.phone || o.id
        const existing = driverMap.get(key)
        if (!existing || new Date(o.messageDate) > new Date(existing.messageDate)) {
          driverMap.set(key, o)
        }
      }
      const driverOrders = Array.from(driverMap.values())

      // Klasterga guruhlash
      const cityMap = new Map<string, any[]>()
      for (const o of [...cargoOrders, ...driverOrders]) {
        const key = (o.cargoFrom || '').toLowerCase().trim()
        if (!key || !findCoord(key)) continue
        if (!cityMap.has(key)) cityMap.set(key, [])
        cityMap.get(key)!.push(o)
      }
      const cls: CityCluster[] = []
      for (const [key, orders] of cityMap) {
        const coord = findCoord(key)!
        const city = orders[0]?.cargoFrom || key
        cls.push({
          city,
          coord,
          orders,
          cargoCount: orders.filter((o: any) => o.type === 'CARGO').length,
          driverCount: orders.filter((o: any) => o.type === 'DRIVER').length,
        })
      }
      cls.sort((a, b) => b.orders.length - a.orders.length)
      setClusters(cls)

      const online = (Array.isArray(onlineRes) ? onlineRes : onlineRes?.data || [])
        .filter((d: any) => d.lastLat && d.lastLng)
      setOnlineDrivers(online)
    } catch (e) {
      console.error('Map load error:', e)
    }
    setLoading(false)
  }, [])

  // Xarita init
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return
    const map = L.map(mapRef.current, {
      center: [41.0, 64.5],
      zoom: 6,
      minZoom: 4,
      maxZoom: 15,
      zoomControl: false,
    })
    L.tileLayer('https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png', {
      maxZoom: 19,
      attribution: '',
    }).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    layerGroup.current = L.layerGroup().addTo(map)
    routeLayer.current = L.layerGroup().addTo(map)
    mapInstance.current = map
    loadData()

    return () => { map.remove(); mapInstance.current = null }
  }, [])

  // Markerlarni yangilash
  useEffect(() => {
    if (!layerGroup.current) return
    layerGroup.current.clearLayers()
    if (selectedOrder) return // Route ko'rinayotganda klasterlar yashirin

    const filtered = clusters.map(c => {
      let orders = c.orders
      if (filter === 'cargo') orders = orders.filter((o: any) => o.type === 'CARGO')
      else if (filter === 'driver') orders = orders.filter((o: any) => o.type === 'DRIVER')
      return { ...c, orders }
    }).filter(c => c.orders.length > 0)

    for (const c of filtered) {
      const count = c.orders.length
      const size = count > 50 ? 48 : count > 20 ? 40 : count > 5 ? 34 : 28
      const color = c.driverCount > 0 && c.cargoCount > 0 ? '#6B46C1' : c.driverCount > 0 ? '#2DD4A8' : '#6B46C1'

      const icon = L.divIcon({
        className: '',
        iconSize: [size + 16, size + 16],
        iconAnchor: [(size + 16) / 2, (size + 16) / 2],
        html: `<div style="display:flex;flex-direction:column;align-items:center">
          <div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px">${count}</div>
          <div style="font-size:9px;font-weight:600;margin-top:1px;color:#1A1A2E;text-shadow:0 0 3px #fff">${c.city}</div>
        </div>`,
      })
      L.marker(c.coord, { icon }).on('click', () => {
        setSheetCity(c.city)
        setSheetOrders(c.orders)
        mapInstance.current?.setView(c.coord, 9)
      }).addTo(layerGroup.current!)
    }

    // Online haydovchilar
    if (filter === 'all' || filter === 'online') {
      for (const d of onlineDrivers) {
        const icon = L.divIcon({
          className: '',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          html: `<div style="width:36px;height:36px;border-radius:50%;background:#16A34A;border:2px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 8px rgba(22,163,74,0.4)">
            <svg width="18" height="18" fill="#fff" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
          </div>`,
        })
        L.marker([d.lastLat, d.lastLng], { icon })
          .bindTooltip(`${d.fullName || 'Haydovchi'} • ${d.vehicleType || ''}`)
          .addTo(layerGroup.current!)
      }
    }
  }, [clusters, onlineDrivers, filter, selectedOrder])

  // Order tanlash va route chizish
  const selectOrder = async (order: any) => {
    setSheetOrders(null)
    setSelectedOrder(order)
    setRouteInfo(null)
    routeLayer.current?.clearLayers()

    const from = findCoord(order.cargoFrom)
    const to = findCoord(order.cargoTo)
    if (!from || !to) return

    // A va B markerlar
    const iconA = L.divIcon({
      className: '', iconSize: [70, 40], iconAnchor: [35, 40],
      html: `<div style="display:flex;flex-direction:column;align-items:center"><div style="background:#6B46C1;color:#fff;padding:2px 8px;border-radius:8px;font-size:11px;font-weight:600;white-space:nowrap">${order.cargoFrom || 'A'}</div><div style="color:#6B46C1;font-size:20px">📍</div></div>`,
    })
    const iconB = L.divIcon({
      className: '', iconSize: [70, 40], iconAnchor: [35, 40],
      html: `<div style="display:flex;flex-direction:column;align-items:center"><div style="background:#2DD4A8;color:#fff;padding:2px 8px;border-radius:8px;font-size:11px;font-weight:600;white-space:nowrap">${order.cargoTo || 'B'}</div><div style="color:#2DD4A8;font-size:20px">📍</div></div>`,
    })
    L.marker(from, { icon: iconA }).addTo(routeLayer.current!)
    L.marker(to, { icon: iconB }).addTo(routeLayer.current!)

    // OSRM route
    try {
      const data = await getRoute(from[0], from[1], to[0], to[1])
      if (data?.code === 'Ok' && data.routes?.[0]) {
        const r = data.routes[0]
        const coords = r.geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number])
        L.polyline(coords, { color: '#6B46C1', weight: 4 }).addTo(routeLayer.current!)
        setRouteInfo({ distance: r.distance / 1000, duration: r.duration / 60 })
        mapInstance.current?.fitBounds(L.latLngBounds(coords), { padding: [40, 40] })
      } else {
        // Fallback — to'g'ri chiziq
        L.polyline([from, to], { color: '#6B46C1', weight: 3, dashArray: '8,4' }).addTo(routeLayer.current!)
        mapInstance.current?.fitBounds(L.latLngBounds([from, to]), { padding: [40, 40] })
      }
    } catch {
      L.polyline([from, to], { color: '#6B46C1', weight: 3, dashArray: '8,4' }).addTo(routeLayer.current!)
      mapInstance.current?.fitBounds(L.latLngBounds([from, to]), { padding: [40, 40] })
    }
  }

  const clearRoute = () => {
    setSelectedOrder(null)
    setRouteInfo(null)
    routeLayer.current?.clearLayers()
    mapInstance.current?.setView([41.0, 64.5], 6)
  }

  const durationText = (min: number) => {
    const h = Math.floor(min / 60)
    const m = Math.round(min % 60)
    if (h === 0) return `${m} min`
    if (m === 0) return `${h} soat`
    return `${h} soat ${m} min`
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <button className="hamburger" onClick={() => setDrawerOpen(true)}>☰</button>
        <h1 className="page-title">Harita</h1>
        <button className="refresh-btn" onClick={loadData}>{loading ? '⏳' : '🔄'}</button>
      </div>

      {/* Xarita */}
      <div style={{ position: 'relative', height: 'calc(100vh - 130px)' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

        {/* Filtr chiplari */}
        {!selectedOrder && (
          <div style={{ position: 'absolute', top: 8, left: 8, right: 8, zIndex: 1000, display: 'flex', gap: 6, overflowX: 'auto' }}>
            {[['Barchasi', 'all'], ['Yuklar', 'cargo'], ['Haydovchilar', 'driver'], ['Online', 'online']].map(([label, key]) => (
              <button key={key} onClick={() => setFilter(key)}
                style={{ padding: '6px 14px', borderRadius: 12, border: `1px solid ${filter === key ? '#6B46C1' : '#E5E5E5'}`, background: filter === key ? '#6B46C1' : 'rgba(255,255,255,0.95)', color: filter === key ? '#fff' : '#1A1A2E', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer' }}>
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Route info card */}
        {selectedOrder && (
          <div style={{ position: 'absolute', top: 8, left: 8, right: 8, zIndex: 1000, background: 'var(--bg)', borderRadius: 16, border: '1px solid var(--border)', padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <span className={`order-tag ${selectedOrder.type === 'DRIVER' ? 'tag-driver' : 'tag-cargo'}`}>
                {selectedOrder.type === 'DRIVER' ? 'Haydovchi' : 'Yuk'}
              </span>
              {selectedOrder.vehicleType && <span style={{ fontSize: 11, color: 'var(--hint)' }}>{selectedOrder.vehicleType}</span>}
              {selectedOrder.messageDate && <span style={{ fontSize: 10, color: 'var(--hint)' }}>{timeAgo(selectedOrder.messageDate)}</span>}
              <div style={{ flex: 1 }} />
              <button onClick={clearRoute} style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 14 }}>✕</button>
            </div>

            {/* Yo'nalish */}
            <div style={{ background: 'var(--bg-body)', borderRadius: 12, padding: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#6B46C1' }} />
                <span style={{ fontWeight: 600, fontSize: 14 }}>{selectedOrder.cargoFrom || '—'}</span>
              </div>
              <div style={{ marginLeft: 4.5, borderLeft: '1.5px dashed var(--border)', height: 16, display: 'flex', alignItems: 'center', paddingLeft: 12 }}>
                {routeInfo && (
                  <span style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                    <span style={{ background: 'rgba(107,70,193,0.1)', padding: '2px 8px', borderRadius: 20, fontWeight: 700, color: '#6B46C1' }}>
                      {Math.round(routeInfo.distance)} km
                    </span>
                    <span style={{ color: 'var(--hint)' }}>{durationText(routeInfo.duration)}</span>
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2DD4A8' }} />
                <span style={{ fontWeight: 600, fontSize: 14 }}>{selectedOrder.cargoTo || '—'}</span>
              </div>
            </div>

            {/* Ma'lumotlar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {selectedOrder.price && <span className="info-tag green">{selectedOrder.price}</span>}
              {selectedOrder.cargoWeight && <span className="info-tag">{selectedOrder.cargoWeight}</span>}
              {selectedOrder.senderName && <span className="info-tag">{selectedOrder.senderName}</span>}
            </div>

            {/* Xabar */}
            {selectedOrder.messageText && (
              <div style={{ fontSize: 12, color: 'var(--hint)', marginTop: 8, lineHeight: 1.5, maxHeight: 60, overflow: 'hidden' }}>
                {selectedOrder.messageText}
              </div>
            )}

            {/* Tugmalar */}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {selectedOrder.phone && (
                <a href={`tel:${selectedOrder.phone}`} className="btn-outline" style={{ flex: 1, textAlign: 'center' }}>
                  📞 {selectedOrder.phone}
                </a>
              )}
              <button className="btn-primary" style={{ flex: 1 }}>✓ Qabul qilish</button>
            </div>
          </div>
        )}

        {/* Cluster sheet */}
        {sheetOrders && !selectedOrder && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000, background: 'var(--bg)', borderRadius: '20px 20px 0 0', maxHeight: '50vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 20px 8px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 18, fontWeight: 600 }}>{sheetCity}</span>
              <span className="count-badge">{sheetOrders.length} ta</span>
              <div style={{ flex: 1 }} />
              <button onClick={() => setSheetOrders(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--hint)' }}>✕</button>
            </div>
            <div style={{ overflowY: 'auto', padding: 12, flex: 1 }}>
              {sheetOrders.map((o: any) => (
                <div key={o.id} className="order-mini-card" onClick={() => selectOrder(o)}>
                  <div className={`mini-icon ${o.type === 'DRIVER' ? 'icon-driver' : 'icon-cargo'}`}>
                    {o.type === 'DRIVER' ? '🚛' : '📦'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{o.cargoFrom || '—'} → {o.cargoTo || '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--hint)', display: 'flex', gap: 4 }}>
                      {o.vehicleType && <span>{o.vehicleType}</span>}
                      {o.price && <span style={{ fontWeight: 600, color: '#6B46C1' }}>{o.price}</span>}
                      {o.messageDate && <span style={{ marginLeft: 'auto' }}>{timeAgo(o.messageDate)}</span>}
                    </div>
                  </div>
                  <span style={{ color: '#6B46C1' }}>›</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
