import { useState, useMemo } from 'react'
import { Card, Button, Table, Tag, Modal, Form, Input, Select, Space, message, Popconfirm, Typography, Radio, InputNumber } from 'antd'
import { PlusOutlined, DeleteOutlined, EnvironmentOutlined, EditOutlined } from '@ant-design/icons'
import { MapContainer, TileLayer, Polygon, Circle, Marker, useMapEvents, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  useYoldaGeoZones,
  useCreateYoldaGeoZone,
  useUpdateYoldaGeoZone,
  useDeleteYoldaGeoZone,
  useYoldaDispatchers,
  useAssignYoldaZone,
  useUnassignYoldaZone,
} from './useYoldaApi'

const { Title, Text } = Typography

// Tashkent markaz
const TASHKENT = { lat: 41.2995, lng: 69.2401 }

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = defaultIcon

function DrawHandler({
  type,
  points,
  setPoints,
  setCircleCenter,
}: {
  type: 'POLYGON' | 'CIRCLE'
  points: [number, number][]
  setPoints: (p: [number, number][]) => void
  setCircleCenter: (c: [number, number] | null) => void
}) {
  useMapEvents({
    click(e) {
      const p: [number, number] = [e.latlng.lat, e.latlng.lng]
      if (type === 'POLYGON') setPoints([...points, p])
      else setCircleCenter(p)
    },
  })
  return null
}

const YoldaGeoZones = () => {
  const { data: zones, isLoading } = useYoldaGeoZones()
  const { data: dispatchers } = useYoldaDispatchers()
  const createMut = useCreateYoldaGeoZone()
  const updateMut = useUpdateYoldaGeoZone()
  const deleteMut = useDeleteYoldaGeoZone()
  const assignMut = useAssignYoldaZone()
  const unassignMut = useUnassignYoldaZone()

  const [createOpen, setCreateOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form] = Form.useForm()
  const [drawType, setDrawType] = useState<'POLYGON' | 'CIRCLE'>('POLYGON')
  const [points, setPoints] = useState<[number, number][]>([])
  const [circleCenter, setCircleCenter] = useState<[number, number] | null>(null)
  const [circleRadius, setCircleRadius] = useState<number>(1000)

  const handleCreate = async () => {
    const values = await form.validateFields()
    if (drawType === 'POLYGON' && points.length < 3) {
      message.warning('Polygon uchun kamida 3 ta nuqta kerak — xaritada bosing')
      return
    }
    if (drawType === 'CIRCLE' && !circleCenter) {
      message.warning('Doira markazini xaritada bosing')
      return
    }

    let body: any
    if (drawType === 'POLYGON') {
      const lats = points.map((p) => p[0])
      const lngs = points.map((p) => p[1])
      body = {
        name: values.name,
        type: 'POLYGON',
        coordinates: points.map(([lat, lng]) => [lng, lat]), // GeoJSON format [lng, lat]
        centerLat: (Math.min(...lats) + Math.max(...lats)) / 2,
        centerLng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
        color: values.color,
        isGlobal: values.isGlobal,
        description: values.description,
      }
    } else {
      body = {
        name: values.name,
        type: 'CIRCLE',
        coordinates: { lat: circleCenter![0], lng: circleCenter![1], radiusM: circleRadius },
        centerLat: circleCenter![0],
        centerLng: circleCenter![1],
        radiusMeters: circleRadius,
        color: values.color,
        isGlobal: values.isGlobal,
        description: values.description,
      }
    }

    try {
      await createMut.mutateAsync(body)
      message.success('Zona yaratildi')
      setCreateOpen(false)
      setPoints([])
      setCircleCenter(null)
      form.resetFields()
    } catch {
      message.error('Xatolik')
    }
  }

  const allZones = useMemo(() => zones || [], [zones])

  const columns = [
    { title: 'Nom', dataIndex: 'name', key: 'name' },
    {
      title: 'Turi',
      dataIndex: 'type',
      render: (t: string) => <Tag color={t === 'POLYGON' ? 'blue' : 'orange'}>{t}</Tag>,
    },
    {
      title: 'Qamrov',
      dataIndex: 'isGlobal',
      render: (g: boolean) => g ? <Tag color="green">GLOBAL</Tag> : <Tag>Tayinlangan</Tag>,
    },
    {
      title: 'Dispatcherlar',
      dataIndex: 'assignments',
      render: (a: any[]) => a?.length || 0,
    },
    {
      title: 'Faol',
      dataIndex: 'isActive',
      render: (a: boolean) => (a ? <Tag color="green">Ha</Tag> : <Tag color="red">Yo\'q</Tag>),
    },
    {
      title: 'Amal',
      render: (_: any, row: any) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => setEditId(row.id)}
          >
            Dispatcherlar
          </Button>
          <Popconfirm title="O'chirishni tasdiqlang" onConfirm={() => deleteMut.mutateAsync(row.id).then(() => message.success('O\'chirildi'))}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const editingZone = allZones.find((z: any) => z.id === editId)

  return (
    <div>
      <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          <EnvironmentOutlined /> Yo'lda Dispetcher — Geo Zonalar
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          Yangi zona
        </Button>
      </Space>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ height: 400 }}>
          <MapContainer center={[TASHKENT.lat, TASHKENT.lng]} zoom={11} style={{ height: '100%', borderRadius: 8 }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; CARTO &copy; OpenStreetMap'
            />
            {allZones.map((z: any) => {
              const color = z.color || '#6B46C1'
              if (z.type === 'POLYGON') {
                const coords = z.coordinates as number[][]
                const latlngs = coords.map((c) => [c[1], c[0]]) as [number, number][]
                return (
                  <Polygon key={z.id} positions={latlngs} pathOptions={{ color, fillOpacity: 0.2 }}>
                    <Popup>
                      <b>{z.name}</b>
                      <br />
                      {z.description}
                    </Popup>
                  </Polygon>
                )
              }
              return (
                <Circle
                  key={z.id}
                  center={[z.centerLat, z.centerLng]}
                  radius={z.radiusMeters || 1000}
                  pathOptions={{ color, fillOpacity: 0.2 }}
                >
                  <Popup>
                    <b>{z.name}</b>
                    <br />
                    Radius: {z.radiusMeters} m
                  </Popup>
                </Circle>
              )
            })}
          </MapContainer>
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={allZones}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 20 }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Yangi geo zona"
        open={createOpen}
        onOk={handleCreate}
        onCancel={() => {
          setCreateOpen(false)
          setPoints([])
          setCircleCenter(null)
          form.resetFields()
        }}
        confirmLoading={createMut.isPending}
        width={900}
        okText="Saqlash"
        cancelText="Bekor qilish"
      >
        <Form form={form} layout="vertical" initialValues={{ color: '#6B46C1', isGlobal: false }}>
          <Space style={{ width: '100%' }}>
            <Form.Item name="name" label="Nom" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input placeholder="Masalan: Toshkent markazi" />
            </Form.Item>
            <Form.Item name="color" label="Rang">
              <Input type="color" style={{ width: 60 }} />
            </Form.Item>
          </Space>
          <Form.Item name="description" label="Tavsif">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="isGlobal" label="Qamrov">
            <Radio.Group>
              <Radio value={false}>Tayinlangan dispatcherlarga</Radio>
              <Radio value={true}>Barchaga (GLOBAL)</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Zona turi">
            <Radio.Group value={drawType} onChange={(e) => {
              setDrawType(e.target.value)
              setPoints([])
              setCircleCenter(null)
            }}>
              <Radio.Button value="POLYGON">Polygon (xaritada nuqtalar bosing)</Radio.Button>
              <Radio.Button value="CIRCLE">Doira (markaz + radius)</Radio.Button>
            </Radio.Group>
          </Form.Item>
          {drawType === 'CIRCLE' && (
            <Form.Item label="Radius (metr)">
              <InputNumber
                value={circleRadius}
                onChange={(v) => setCircleRadius(Number(v) || 1000)}
                min={100}
                max={100000}
                step={100}
              />
            </Form.Item>
          )}

          <div style={{ height: 350, marginBottom: 8 }}>
            <MapContainer center={[TASHKENT.lat, TASHKENT.lng]} zoom={11} style={{ height: '100%', borderRadius: 8 }}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/voyager/{z}/{x}/{y}{r}.png"
                attribution=""
              />
              <DrawHandler type={drawType} points={points} setPoints={setPoints} setCircleCenter={setCircleCenter} />
              {drawType === 'POLYGON' && points.length >= 3 && (
                <Polygon positions={points} pathOptions={{ color: '#6B46C1' }} />
              )}
              {drawType === 'POLYGON' &&
                points.map((p, i) => <Marker key={i} position={p} />)}
              {drawType === 'CIRCLE' && circleCenter && (
                <Circle center={circleCenter} radius={circleRadius} pathOptions={{ color: '#2DD4A8' }} />
              )}
            </MapContainer>
          </div>
          <Space>
            <Text type="secondary">
              {drawType === 'POLYGON'
                ? `Nuqtalar: ${points.length} (minimum 3 ta)`
                : circleCenter
                ? `Markaz: ${circleCenter[0].toFixed(4)}, ${circleCenter[1].toFixed(4)}`
                : 'Xaritada markazni bosing'}
            </Text>
            <Button size="small" onClick={() => { setPoints([]); setCircleCenter(null) }}>
              Tozalash
            </Button>
          </Space>
        </Form>
      </Modal>

      {/* Assign dispatchers modal */}
      <Modal
        title={editingZone ? `Dispatcherlar: ${editingZone.name}` : ''}
        open={!!editId}
        onCancel={() => setEditId(null)}
        footer={null}
      >
        {editingZone && (
          <>
            <Text type="secondary">Zona uchun dispatcherlarni tayinlang</Text>
            <Select
              mode="multiple"
              style={{ width: '100%', marginTop: 12 }}
              placeholder="Dispatcherlar"
              value={editingZone.assignments?.map((a: any) => a.dispatcher?.id).filter(Boolean)}
              options={(dispatchers || []).map((d: any) => ({
                value: d.id,
                label: `${d.fullName || 'Noma\'lum'} (${d.phone})`,
              }))}
              onChange={async (newIds: string[]) => {
                const currentIds: string[] = editingZone.assignments?.map((a: any) => a.dispatcher?.id).filter(Boolean) || []
                const added = newIds.filter((id) => !currentIds.includes(id))
                const removed = currentIds.filter((id) => !newIds.includes(id))
                for (const d of added) await assignMut.mutateAsync({ zoneId: editingZone.id, dispatcherId: d })
                for (const d of removed) await unassignMut.mutateAsync({ zoneId: editingZone.id, dispatcherId: d })
                message.success('Yangilandi')
              }}
            />
          </>
        )}
      </Modal>
    </div>
  )
}

export default YoldaGeoZones
