import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Card,
  Table,
  DatePicker,
  Button,
  Space,
  Tag,
  Typography,
  Input,
  Statistic,
  Row,
  Col,
  message,
  Tooltip,
  Tabs,
} from 'antd'
import {
  DownloadOutlined,
  PhoneOutlined,
  CopyOutlined,
  UserOutlined,
  CarOutlined,
  TruckOutlined,
  StopOutlined,
  CheckCircleOutlined,
  InboxOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import api from '../../services/api'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

interface PhoneRecord {
  phone: string
  adsCount: number
  lastSenderName: string | null
  lastUsername: string | null
  lastType: string
  lastDate: string
  lastFrom: string | null
  lastTo: string | null
  isBlocked: boolean
  blockCount: number
}

const UniquePhones = () => {
  const [activeTab, setActiveTab] = useState<string>('ALL')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  const [cargoFrom, setCargoFrom] = useState('')
  const [cargoTo, setCargoTo] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  const isBlockedMode = activeTab === 'BLOCKED'

  const buildParams = () => {
    const params: Record<string, string> = {
      page: String(page),
      limit: String(pageSize),
    }
    if (!isBlockedMode && activeTab && activeTab !== 'ALL') params.type = activeTab
    if (dateRange?.[0]) params.dateFrom = dateRange[0].startOf('day').toISOString()
    if (dateRange?.[1]) params.dateTo = dateRange[1].endOf('day').toISOString()
    if (!isBlockedMode && cargoFrom.trim()) params.cargoFrom = cargoFrom.trim()
    if (!isBlockedMode && cargoTo.trim()) params.cargoTo = cargoTo.trim()
    return params
  }

  const { data, isLoading } = useQuery({
    queryKey: ['unique-phones', activeTab, dateRange?.map(d => d?.toISOString()), cargoFrom, cargoTo, page, pageSize],
    queryFn: async () => {
      const params = buildParams()
      const endpoint = isBlockedMode ? '/orders/blocked-phones' : '/orders/unique-phones'
      const res = await api.get(endpoint, { params })
      return res.data as {
        data: PhoneRecord[]
        pagination: { total: number; page: number; limit: number; totalPages: number }
      }
    },
  })

  // Statistikalar uchun — har bir tab sonini olish
  const { data: statsAll } = useQuery({
    queryKey: ['unique-phones-stats-all'],
    queryFn: async () => {
      const res = await api.get('/orders/unique-phones', { params: { limit: '1' } })
      return res.data?.pagination?.total || 0
    },
    staleTime: 60_000,
  })
  const { data: statsCargo } = useQuery({
    queryKey: ['unique-phones-stats-cargo'],
    queryFn: async () => {
      const res = await api.get('/orders/unique-phones', { params: { type: 'CARGO', limit: '1' } })
      return res.data?.pagination?.total || 0
    },
    staleTime: 60_000,
  })
  const { data: statsDriver } = useQuery({
    queryKey: ['unique-phones-stats-driver'],
    queryFn: async () => {
      const res = await api.get('/orders/unique-phones', { params: { type: 'DRIVER', limit: '1' } })
      return res.data?.pagination?.total || 0
    },
    staleTime: 60_000,
  })
  const { data: statsBlocked } = useQuery({
    queryKey: ['unique-phones-stats-blocked'],
    queryFn: async () => {
      const res = await api.get('/orders/blocked-phones', { params: { limit: '1' } })
      return res.data?.pagination?.total || 0
    },
    staleTime: 60_000,
  })

  const handleExport = async () => {
    try {
      const params: Record<string, string> = {}
      if (!isBlockedMode && activeTab && activeTab !== 'ALL') params.type = activeTab
      if (dateRange?.[0]) params.dateFrom = dateRange[0].startOf('day').toISOString()
      if (dateRange?.[1]) params.dateTo = dateRange[1].endOf('day').toISOString()
      if (!isBlockedMode && cargoFrom.trim()) params.cargoFrom = cargoFrom.trim()
      if (!isBlockedMode && cargoTo.trim()) params.cargoTo = cargoTo.trim()

      const endpoint = isBlockedMode ? '/orders/blocked-phones/export' : '/orders/unique-phones/export'
      const res = await api.get(endpoint, { params, responseType: 'blob' })
      const blob = new Blob([res.data], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const typeLabel = isBlockedMode ? 'bloklangan' : activeTab === 'CARGO' ? 'yuk_egasi' : activeTab === 'DRIVER' ? 'haydovchi' : 'barcha'
      a.href = url
      a.download = `unikal_raqamlar_${typeLabel}_${dayjs().format('YYYY-MM-DD')}.txt`
      a.click()
      URL.revokeObjectURL(url)
      message.success(`${data?.pagination?.total || 0} ta raqam yuklab olindi`)
    } catch {
      message.error('Eksport xatosi')
    }
  }

  const copyAll = async () => {
    if (!data?.data?.length) return
    const phones = data.data.map(r => r.phone).join('\n')
    await navigator.clipboard.writeText(phones)
    message.success(`${data.data.length} ta raqam nusxalandi`)
  }

  const columns: any[] = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (_: any, __: any, i: number) => (page - 1) * pageSize + i + 1,
    },
    {
      title: 'Telefon raqam',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => (
        <Space>
          <PhoneOutlined />
          <Text strong copyable>{phone}</Text>
        </Space>
      ),
    },
    {
      title: "E'lonlar soni",
      dataIndex: 'adsCount',
      key: 'adsCount',
      width: 120,
      sorter: (a: PhoneRecord, b: PhoneRecord) => a.adsCount - b.adsCount,
      render: (count: number) => (
        <Tag color={count >= 10 ? 'red' : count >= 5 ? 'orange' : 'blue'}>{count} ta</Tag>
      ),
    },
    {
      title: 'Turi',
      dataIndex: 'lastType',
      key: 'lastType',
      width: 120,
      render: (t: string) =>
        t === 'DRIVER' ? (
          <Tag icon={<CarOutlined />} color="green">Haydovchi</Tag>
        ) : (
          <Tag icon={<InboxOutlined />} color="blue">Yuk egasi</Tag>
        ),
    },
    {
      title: 'Holati',
      key: 'status',
      width: 140,
      filters: [
        { text: 'Bloklangan', value: true },
        { text: 'Faol', value: false },
      ],
      onFilter: (value: any, rec: PhoneRecord) => rec.isBlocked === value,
      render: (_: any, rec: PhoneRecord) =>
        rec.isBlocked ? (
          <Tooltip title={`${rec.blockCount} marta bloklangan`}>
            <Tag color="red" icon={<StopOutlined />}>Bloklangan ({rec.blockCount})</Tag>
          </Tooltip>
        ) : (
          <Tag color="green" icon={<CheckCircleOutlined />}>Faol</Tag>
        ),
    },
    {
      title: 'Ism',
      dataIndex: 'lastSenderName',
      key: 'lastSenderName',
      ellipsis: true,
      render: (name: string | null, rec: PhoneRecord) => (
        <Space direction="vertical" size={0}>
          {name && <Text>{name}</Text>}
          {rec.lastUsername && <Text type="secondary" style={{ fontSize: 12 }}>@{rec.lastUsername}</Text>}
        </Space>
      ),
    },
    {
      title: "Yo'nalish",
      key: 'route',
      render: (_: any, rec: PhoneRecord) =>
        rec.lastFrom || rec.lastTo ? (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {rec.lastFrom || '?'} → {rec.lastTo || '?'}
          </Text>
        ) : '—',
    },
    {
      title: "So'nggi sana",
      dataIndex: 'lastDate',
      key: 'lastDate',
      width: 140,
      render: (d: string) => d ? dayjs(d).format('DD.MM.YYYY HH:mm') : '—',
    },
  ]

  // Bloklangan tab uchun — qo'shimcha blok soni ustuni
  const blockedColumns: any[] = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (_: any, __: any, i: number) => (page - 1) * pageSize + i + 1,
    },
    {
      title: 'Telefon raqam',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => (
        <Space>
          <PhoneOutlined />
          <Text strong copyable>{phone}</Text>
        </Space>
      ),
    },
    {
      title: "E'lonlar soni",
      dataIndex: 'adsCount',
      key: 'adsCount',
      width: 120,
      sorter: (a: PhoneRecord, b: PhoneRecord) => a.adsCount - b.adsCount,
      render: (count: number) => (
        <Tag color={count >= 10 ? 'red' : count >= 5 ? 'orange' : 'blue'}>{count} ta</Tag>
      ),
    },
    {
      title: 'Blok soni',
      dataIndex: 'blockCount',
      key: 'blockCount',
      width: 100,
      sorter: (a: PhoneRecord, b: PhoneRecord) => a.blockCount - b.blockCount,
      render: (count: number) => (
        <Tag color="red" icon={<StopOutlined />}>{count}</Tag>
      ),
    },
    {
      title: 'Ism',
      dataIndex: 'lastSenderName',
      key: 'lastSenderName',
      ellipsis: true,
      render: (name: string | null, rec: PhoneRecord) => (
        <Space direction="vertical" size={0}>
          {name && <Text>{name}</Text>}
          {rec.lastUsername && <Text type="secondary" style={{ fontSize: 12 }}>@{rec.lastUsername}</Text>}
        </Space>
      ),
    },
    {
      title: "So'nggi sana",
      dataIndex: 'lastDate',
      key: 'lastDate',
      width: 140,
      render: (d: string) => d ? dayjs(d).format('DD.MM.YYYY HH:mm') : '—',
    },
  ]

  const tabItems = [
    {
      key: 'ALL',
      label: <span><UserOutlined /> Barchasi <Tag>{statsAll ?? '...'}</Tag></span>,
    },
    {
      key: 'CARGO',
      label: <span><TruckOutlined /> Yukchilar <Tag color="blue">{statsCargo ?? '...'}</Tag></span>,
    },
    {
      key: 'DRIVER',
      label: <span><CarOutlined /> Haydovchilar <Tag color="green">{statsDriver ?? '...'}</Tag></span>,
    },
    {
      key: 'BLOCKED',
      label: <span><StopOutlined /> Dispetcherlar <Tag color="red">{statsBlocked ?? '...'}</Tag></span>,
    },
  ]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        <PhoneOutlined /> Unikal telefon raqamlar
      </Title>

      {/* Statistika */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card><Statistic title="Yukchilar + Haydovchilar" value={statsAll ?? 0} prefix={<UserOutlined />} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="Yukchilar" value={statsCargo ?? 0} prefix={<TruckOutlined />} valueStyle={{ color: '#1677ff' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="Haydovchilar" value={statsDriver ?? 0} prefix={<CarOutlined />} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="Dispetcherlar" value={statsBlocked ?? 0} prefix={<StopOutlined />} valueStyle={{ color: '#ff4d4f' }} /></Card>
        </Col>
      </Row>

      {/* Tablar */}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => { setActiveTab(key); setPage(1) }}
        items={tabItems}
        style={{ marginBottom: 8 }}
      />

      {/* Filtrlar */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap size="middle">
          <RangePicker
            value={dateRange}
            onChange={(v) => { setDateRange(v as any); setPage(1) }}
            format="DD.MM.YYYY"
            placeholder={['Boshlanish', 'Tugash']}
          />
          {!isBlockedMode && (
            <>
              <Input
                placeholder="Qayerdan"
                value={cargoFrom}
                onChange={e => setCargoFrom(e.target.value)}
                onPressEnter={() => setPage(1)}
                style={{ width: 140 }}
                allowClear
              />
              <Input
                placeholder="Qayerga"
                value={cargoTo}
                onChange={e => setCargoTo(e.target.value)}
                onPressEnter={() => setPage(1)}
                style={{ width: 140 }}
                allowClear
              />
            </>
          )}
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
            TXT yuklash
          </Button>
          <Tooltip title="Joriy sahifadagi raqamlarni nusxalash">
            <Button icon={<CopyOutlined />} onClick={copyAll}>
              Nusxalash
            </Button>
          </Tooltip>
        </Space>
      </Card>

      {/* Jadval */}
      <Card>
        <Table
          columns={isBlockedMode ? blockedColumns : columns}
          dataSource={data?.data || []}
          rowKey="phone"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize,
            total: data?.pagination?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ['20', '50', '100', '200'],
            showTotal: (total) => `Jami: ${total} ta unikal raqam`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps) },
          }}
          size="middle"
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  )
}

export default UniquePhones
