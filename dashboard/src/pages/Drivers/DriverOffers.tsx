import { useState } from 'react'
import { Card, Table, Tag, Space, Select } from 'antd'
import { useDriverOffers } from '../../hooks/useApi'
import type { DriverOfferItem } from '../../types'

const statusColors: Record<string, string> = {
  ACTIVE: 'green',
  EXPIRED: 'default',
  CANCELLED: 'red',
  COMPLETED: 'blue',
}

const DriverOffers = () => {
  const [status, setStatus] = useState<string | undefined>('ACTIVE')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useDriverOffers({ status, page, limit: 20 })

  const columns = [
    {
      title: 'Yo\'nalish',
      key: 'route',
      render: (_: any, r: DriverOfferItem) => (
        <span style={{ fontWeight: 500 }}>{r.fromCity} → {r.toCity}</span>
      ),
    },
    {
      title: 'Haydovchi',
      key: 'driver',
      render: (_: any, r: DriverOfferItem) => r.driverProfile?.fullName || '—',
    },
    { title: 'Mashina', dataIndex: 'vehicleType', key: 'vehicleType' },
    { title: 'Tonnaj', dataIndex: 'vehicleCapacity', key: 'vehicleCapacity', render: (v: string) => v || '—' },
    { title: 'Narx', dataIndex: 'price', key: 'price', render: (v: string) => v || '—' },
    { title: 'Telefon', dataIndex: 'phone', key: 'phone' },
    {
      title: 'Holat',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => <Tag color={statusColors[v] || 'default'}>{v}</Tag>,
    },
    {
      title: 'Sana',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => new Date(v).toLocaleString('uz'),
    },
  ]

  return (
    <Card>
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="Holat"
          value={status}
          onChange={v => { setStatus(v); setPage(1) }}
          style={{ width: 160 }}
          allowClear
          options={[
            { value: 'ACTIVE', label: 'Faol' },
            { value: 'EXPIRED', label: 'Muddati o\'tgan' },
            { value: 'CANCELLED', label: 'Bekor qilingan' },
            { value: 'COMPLETED', label: 'Tugallangan' },
          ]}
        />
      </Space>
      <Table
        columns={columns}
        dataSource={data?.data || []}
        rowKey="id"
        loading={isLoading}
        size="small"
        pagination={{
          current: page,
          pageSize: 20,
          total: data?.pagination?.total || 0,
          onChange: p => setPage(p),
          showTotal: t => `Jami: ${t}`,
        }}
      />
    </Card>
  )
}

export default DriverOffers
