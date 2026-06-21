import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Table, Card, Typography, Tag, Button, Space, Input, Statistic, Row, Col,
  Tooltip, Tabs, DatePicker,
} from 'antd'
import {
  SearchOutlined, EnvironmentOutlined,
  CarOutlined, UserOutlined, EyeOutlined, StopOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import api from '../../services/api'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const TaksiOrders = () => {
  const [search, setSearch] = useState('')
  const [type, setType] = useState<string | undefined>()
  const [status, setStatus] = useState<string | undefined>()
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null)
  const [page, setPage] = useState(1)

  const params: any = { page, limit: 20 }
  if (search) params.search = search
  if (type) params.type = type
  if (status) params.status = status
  if (dateRange?.[0]) params.dateFrom = dateRange[0].startOf('day').toISOString()
  if (dateRange?.[1]) params.dateTo = dateRange[1].endOf('day').toISOString()

  const { data, isLoading } = useQuery({
    queryKey: ['taksi-orders', params],
    queryFn: async () => {
      const res = await api.get('/orders', { params })
      return res.data
    },
  })

  const { data: stats } = useQuery({
    queryKey: ['taksi-stats'],
    queryFn: async () => {
      const res = await api.get('/orders/stats')
      return res.data
    },
    refetchInterval: 10_000,
  })

  const orders = data?.data || []
  const pagination = data?.pagination

  const columns: any[] = [
    {
      title: 'Turi',
      dataIndex: 'type',
      width: 100,
      render: (t: string) => t === 'DRIVER'
        ? <Tag icon={<CarOutlined />} color="green">Haydovchi</Tag>
        : <Tag icon={<UserOutlined />} color="orange">Yo'lovchi</Tag>,
    },
    {
      title: "Yo'nalish",
      key: 'route',
      width: 200,
      render: (_: any, r: any) => (
        <Space size={4}>
          <EnvironmentOutlined style={{ color: '#fa8c16' }} />
          <Text>{r.cargoFrom || '—'}</Text>
          <Text type="secondary">→</Text>
          <Text>{r.cargoTo || '—'}</Text>
        </Space>
      ),
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      width: 140,
      render: (p: string) => p ? <Text copyable={{ text: p }}>{p}</Text> : '—',
    },
    {
      title: 'Xabar',
      dataIndex: 'messageText',
      ellipsis: true,
      render: (t: string) => <Text style={{ fontSize: 12 }}>{(t || '').substring(0, 80)}</Text>,
    },
    {
      title: 'Guruh',
      dataIndex: 'groupTitle',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Sana',
      dataIndex: 'messageDate',
      width: 130,
      render: (d: string) => d ? dayjs(d).format('DD.MM HH:mm') : '—',
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 80,
      render: (_: any, r: any) => (
        <Space>
          <Tooltip title="Ko'rish"><Button size="small" icon={<EyeOutlined />} /></Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Title level={3} style={{ marginBottom: 16 }}>
        🚕 Yo'lovchilar va Haydovchilar
      </Title>

      {/* Statistika */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card size="small"><Statistic title="Bugun" value={stats?.today || 0} valueStyle={{ color: '#fa8c16' }} /></Card>
        </Col>
        <Col span={4}>
          <Card size="small"><Statistic title="Yangi" value={stats?.new || 0} valueStyle={{ color: '#1677ff' }} /></Card>
        </Col>
        <Col span={4}>
          <Card size="small"><Statistic title="Yo'lovchi" value={stats?.cargo || 0} prefix={<UserOutlined />} /></Card>
        </Col>
        <Col span={4}>
          <Card size="small"><Statistic title="Haydovchi" value={stats?.driver || 0} prefix={<CarOutlined />} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
        <Col span={4}>
          <Card size="small"><Statistic title="Haftalik" value={stats?.thisWeek || 0} /></Card>
        </Col>
        <Col span={4}>
          <Card size="small"><Statistic title="Jami" value={stats?.total || 0} /></Card>
        </Col>
      </Row>

      {/* Filtrlar */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="Qidirish..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            style={{ width: 220 }}
            allowClear
          />
          <RangePicker
            value={dateRange}
            onChange={v => { setDateRange(v as any); setPage(1) }}
            format="DD.MM.YYYY"
            size="small"
          />
        </Space>
      </Card>

      {/* Tur tablari */}
      <Tabs
        size="small"
        onChange={key => { setType(key === 'all' ? undefined : key); setPage(1) }}
        items={[
          { key: 'all', label: `Barchasi (${stats?.total || 0})` },
          { key: 'CARGO', label: `Yo'lovchilar (${stats?.cargo || 0})` },
          { key: 'DRIVER', label: `Haydovchilar (${stats?.driver || 0})` },
        ]}
        style={{ marginBottom: 8 }}
      />

      <Tabs
        size="small"
        onChange={key => { setStatus(key === 'all' ? undefined : key); setPage(1) }}
        items={[
          { key: 'all', label: 'Barchasi' },
          { key: 'NEW', label: `Yangi (${stats?.new || 0})` },
          { key: 'CONTACTED', label: `Bog'lanilgan (${stats?.contacted || 0})` },
          { key: 'COMPLETED', label: `Bajarilgan (${stats?.completed || 0})` },
          { key: 'REJECTED', label: `Rad etilgan (${stats?.rejected || 0})` },
        ]}
        style={{ marginBottom: 8 }}
      />

      {/* Jadval */}
      <Card>
        <Table
          columns={columns}
          dataSource={orders}
          loading={isLoading}
          rowKey="id"
          size="small"
          scroll={{ x: 900 }}
          pagination={{
            current: pagination?.page || 1,
            total: pagination?.total || 0,
            pageSize: 20,
            showTotal: total => `Jami: ${total}`,
            onChange: p => setPage(p),
          }}
        />
      </Card>
    </div>
  )
}

export default TaksiOrders
