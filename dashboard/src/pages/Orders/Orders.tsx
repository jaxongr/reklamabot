import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { useModule } from '../../contexts/ModuleContext'
import {
  Table,
  Card,
  Typography,
  Tag,
  Button,
  Space,
  message,
  Modal,
  Input,
  Select,
  Statistic,
  Row,
  Col,
  Tooltip,
  Drawer,
  Descriptions,
  Badge,
  Tabs,
  DatePicker,
  Form,
  InputNumber,
  Switch,
} from 'antd'
import {
  ShoppingCartOutlined,
  EyeOutlined,
  PhoneOutlined,
  DeleteOutlined,
  CheckOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  UserOutlined,
  MessageOutlined,
  CarOutlined,
  InboxOutlined,
  StopOutlined,
  ThunderboltOutlined,
  PlusOutlined,
  LikeOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import styled from 'styled-components'
import {
  useOrders,
  useOrderStats,
  useUpdateOrderStatus,
  useDeleteOrder,
  useBlockSender,
  useCreateManualOrder,
  useAcceptOrder,
  usePriceEstimate,
} from '../../hooks/useApi'
import { useSocketEvent } from '../../hooks/useSocket'
import type { Order, OrderStatus, OrderType, OrderScope } from '../../types'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'

const { Title, Text, Paragraph } = Typography
const { RangePicker } = DatePicker

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`

const StatsRow = styled(Row)`
  margin-bottom: 24px;
`

const MessageText = styled(Paragraph)`
  max-width: 300px;
  margin: 0 !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const RouteCell = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
`

const LiveDot = styled.span<{ $active?: boolean }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $active }) => ($active ? '#52c41a' : '#d9d9d9')};
  margin-right: 6px;
  animation: ${({ $active }) => ($active ? 'pulse 1.5s infinite' : 'none')};

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.5); }
    70% { box-shadow: 0 0 0 6px rgba(82, 196, 26, 0); }
    100% { box-shadow: 0 0 0 0 rgba(82, 196, 26, 0); }
  }
`

const SpeedCard = styled(Card)<{ $highlight?: boolean }>`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: border-color 0.3s;
  border-color: ${({ $highlight }) => ($highlight ? '#52c41a' : undefined)};
`

const FilterRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 16px;
`

const statusColors: Record<OrderStatus, string> = {
  NEW: 'blue',
  VIEWED: 'orange',
  CONTACTED: 'purple',
  COMPLETED: 'green',
  REJECTED: 'red',
}

const statusLabels: Record<OrderStatus, string> = {
  NEW: 'Yangi',
  VIEWED: "Ko'rilgan",
  CONTACTED: "Bog'lanilgan",
  COMPLETED: 'Bajarilgan',
  REJECTED: 'Rad etilgan',
}

const quickDates = [
  { label: 'Bugun', value: () => [dayjs().startOf('day'), dayjs().endOf('day')] },
  { label: 'Kecha', value: () => [dayjs().subtract(1, 'day').startOf('day'), dayjs().subtract(1, 'day').endOf('day')] },
  { label: 'Bu hafta', value: () => [dayjs().startOf('week'), dayjs().endOf('day')] },
  { label: 'Bu oy', value: () => [dayjs().startOf('month'), dayjs().endOf('day')] },
]

const Orders = () => {
  const [filters, setFilters] = useState<{
    status?: OrderStatus
    type?: OrderType
    scope?: OrderScope
    search?: string
    dateFrom?: string
    dateTo?: string
    page: number
    limit: number
  }>({ page: 1, limit: 20 })

  const { module } = useModule()
  const { data, isLoading } = useOrders({ ...filters, module })
  const { data: stats } = useOrderStats(module)
  const updateStatusMutation = useUpdateOrderStatus()
  const deleteMutation = useDeleteOrder()
  const blockMutation = useBlockSender()
  const createManualMutation = useCreateManualOrder()
  const acceptMutation = useAcceptOrder()

  const [detailDrawer, setDetailDrawer] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [senderFilter, setSenderFilter] = useState<string>('')
  const [senderName, setSenderName] = useState<string>('')
  const [createForm] = Form.useForm()

  // Narx taxmini uchun
  const [estimateFrom, setEstimateFrom] = useState('')
  const [estimateTo, setEstimateTo] = useState('')
  const { data: priceEstimate } = usePriceEstimate(
    estimateFrom && estimateTo ? { from: estimateFrom, to: estimateTo } : undefined
  )

  // ===== ORDER TEZLIK INDIKATOR =====
  const [recentCount, setRecentCount] = useState(0)
  const [lastOrderTime, setLastOrderTime] = useState<Date | null>(null)
  const [isLive, setIsLive] = useState(false)
  const orderTimestamps = useRef<number[]>([])
  const liveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!data?.data?.length || initializedRef.current) return
    initializedRef.current = true
    const now = Date.now()
    const fiveMinAgo = now - 5 * 60_000
    const recentOrders = data.data.filter((o: Order) => {
      const t = new Date(o.messageDate || o.createdAt).getTime()
      return t > fiveMinAgo
    })
    if (recentOrders.length > 0) {
      orderTimestamps.current = recentOrders.map((o: Order) =>
        new Date(o.messageDate || o.createdAt).getTime()
      )
      setRecentCount(orderTimestamps.current.length)
      const latest = recentOrders[0]
      setLastOrderTime(new Date(latest.messageDate || latest.createdAt))
      setIsLive(true)
      if (liveTimeout.current) clearTimeout(liveTimeout.current)
      liveTimeout.current = setTimeout(() => setIsLive(false), 30_000)
    }
  }, [data])

  useEffect(() => {
    const interval = setInterval(() => {
      const fiveMinAgo = Date.now() - 5 * 60_000
      orderTimestamps.current = orderTimestamps.current.filter(t => t > fiveMinAgo)
      setRecentCount(orderTimestamps.current.length)
    }, 30_000)
    return () => clearInterval(interval)
  }, [])

  useSocketEvent('order:new', (_order: any) => {
    const now = Date.now()
    orderTimestamps.current.push(now)
    const fiveMinAgo = now - 5 * 60_000
    orderTimestamps.current = orderTimestamps.current.filter(t => t > fiveMinAgo)
    setRecentCount(orderTimestamps.current.length)
    setLastOrderTime(new Date())
    setIsLive(true)
    if (liveTimeout.current) clearTimeout(liveTimeout.current)
    liveTimeout.current = setTimeout(() => setIsLive(false), 30_000)
  })

  const hourlyRate = recentCount > 0 ? Math.round((recentCount / 5) * 60) : 0

  // ===== HANDLERS =====

  const handleAcceptOrder = async (order: Order) => {
    try {
      await acceptMutation.mutateAsync(order.id)
      message.success('Buyurtma qabul qilindi!')
      if (selectedOrder?.id === order.id) {
        setSelectedOrder({ ...order, status: 'CONTACTED' as OrderStatus })
      }
    } catch {
      message.error('Qabul qilishda xatolik')
    }
  }

  const handleBlockSender = (order: Order) => {
    if (!order.senderTelegramId) {
      message.warning('Sender ID mavjud emas')
      return
    }
    Modal.confirm({
      title: 'Senderni bloklash',
      content: `${order.senderName || order.senderUsername || order.phone || 'Noma\'lum'} bloklansimi?`,
      okText: 'Bloklash',
      okType: 'danger',
      cancelText: 'Bekor qilish',
      onOk: async () => {
        try {
          await blockMutation.mutateAsync({
            senderTelegramId: order.senderTelegramId!,
            senderName: order.senderName,
            senderUsername: order.senderUsername,
            phone: order.phone,
            messageText: order.messageText,
            groupTitle: order.groupTitle,
            groupTelegramId: order.groupTelegramId,
          })
          await updateStatusMutation.mutateAsync({ id: order.id, status: 'REJECTED' as OrderStatus, notes: 'Sender bloklandi' })
          message.success('Sender bloklandi')
          setDetailDrawer(false)
          setSelectedOrder(null)
        } catch {
          message.error('Bloklashda xatolik')
        }
      },
    })
  }

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status })
      message.success('Status yangilandi')
    } catch {
      message.error('Xatolik yuz berdi')
    }
  }

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Buyurtmani o'chirish",
      content: "Rostdan ham shu buyurtmani o'chirmoqchimisiz?",
      okText: "Ha, o'chirish",
      okType: 'danger',
      cancelText: 'Bekor qilish',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id)
          message.success("Buyurtma o'chirildi")
        } catch {
          message.error('Xatolik yuz berdi')
        }
      },
    })
  }

  const handleCreateOrder = async (values: any) => {
    try {
      await createManualMutation.mutateAsync(values)
      message.success('Buyurtma yaratildi!')
      setCreateModalOpen(false)
      createForm.resetFields()
    } catch {
      message.error('Yaratishda xatolik')
    }
  }

  const showDetail = (order: Order) => {
    setSelectedOrder(order)
    setDetailDrawer(true)
    if (order.status === 'NEW') {
      updateStatusMutation.mutate({ id: order.id, status: 'VIEWED' })
    }
  }

  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setFilters(prev => ({
        ...prev,
        dateFrom: dates[0]!.startOf('day').toISOString(),
        dateTo: dates[1]!.endOf('day').toISOString(),
        page: 1,
      }))
    } else {
      setFilters(prev => ({ ...prev, dateFrom: undefined, dateTo: undefined, page: 1 }))
    }
  }

  const columns = [
    {
      title: 'Turi',
      key: 'type',
      width: 100,
      render: (_: any, record: Order) => (
        <Space size={2} direction="vertical">
          {record.type === 'DRIVER' ? (
            <Tag color="orange" icon={<CarOutlined />}>Hayd</Tag>
          ) : (
            <Tag color="blue" icon={<InboxOutlined />}>Yuk</Tag>
          )}
          {record.surgeMultiplier && record.surgeMultiplier > 1 && (
            <Tag color="volcano" icon={<ThunderboltOutlined />}>
              Surge {record.surgeMultiplier}x
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Guruh',
      dataIndex: 'groupTitle',
      key: 'groupTitle',
      width: 160,
      ellipsis: true,
      render: (title: string) => (
        <Text ellipsis style={{ maxWidth: 140 }}>{title}</Text>
      ),
    },
    {
      title: "Yo'nalish",
      key: 'route',
      width: 250,
      render: (_: any, record: Order) => {
        if (record.cargoFrom || record.cargoTo) {
          return (
            <RouteCell>
              <EnvironmentOutlined style={{ color: '#52c41a', flexShrink: 0 }} />
              <Text strong style={{ whiteSpace: 'nowrap' }}>{record.cargoFrom || '?'}</Text>
              <Text type="secondary" style={{ whiteSpace: 'nowrap' }}>→</Text>
              <Text strong style={{ whiteSpace: 'nowrap' }}>{record.cargoTo || '?'}</Text>
              {record.distance && (
                <Tag color="cyan" style={{ marginLeft: 4, flexShrink: 0 }}>{record.distance} km</Tag>
              )}
            </RouteCell>
          )
        }
        return <Text type="secondary">—</Text>
      },
    },
    {
      title: 'Mashina',
      key: 'vehicleType',
      width: 100,
      render: (_: any, record: Order) => {
        if (record.vehicleType) {
          return <Tag color="geekblue">{record.vehicleType}</Tag>
        }
        return '—'
      },
    },
    {
      title: "Og'irlik",
      dataIndex: 'cargoWeight',
      key: 'cargoWeight',
      width: 90,
      render: (weight: string) => weight ? <Tag color="orange">{weight}</Tag> : '—',
    },
    {
      title: 'Xabar',
      dataIndex: 'messageText',
      key: 'messageText',
      width: 200,
      render: (text: string) => (
        <MessageText ellipsis={{ rows: 2 }}>{text}</MessageText>
      ),
    },
    {
      title: 'Narx',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: string, record: Order) => {
        if (!price) return '—'
        return (
          <Space direction="vertical" size={0}>
            <Text strong>{price}</Text>
            {record.surgeMultiplier && record.surgeMultiplier > 1 && (
              <Text style={{ color: '#ff4d4f', fontSize: 11 }}>
                +{Math.round((record.surgeMultiplier - 1) * 100)}%
              </Text>
            )}
          </Space>
        )
      },
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
      width: 160,
      render: (phone: string) => phone ? (
        <span style={{ whiteSpace: 'nowrap' }}>
          <PhoneOutlined style={{ marginRight: 4 }} />
          <Text copyable={{ text: phone }}>{phone}</Text>
        </span>
      ) : '—',
    },
    {
      title: 'Sender',
      key: 'senderStats',
      width: 100,
      render: (_: any, record: Order) => {
        const today = record.senderTodayAds || 0
        const total = record.senderTotalAds || 0
        const blocked = record.blockedByCount || 0
        return (
          <Space size={4} direction="vertical">
            {(today > 0 || total > 0) && (
              <Tag
                color={today > 10 ? 'red' : today > 5 ? 'orange' : 'blue'}
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation()
                  setSenderFilter(record.senderTelegramId || record.phone || '')
                  setSenderName(record.senderName || record.phone || 'Sender')
                }}
              >
                {today}/{total}
              </Tag>
            )}
            {blocked > 0 && (
              <Tooltip title={`${blocked} ta dispetcher bloklagan`}>
                <Tag color="red" icon={<StopOutlined />}>
                  {blocked}
                </Tag>
              </Tooltip>
            )}
          </Space>
        )
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: OrderStatus) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
    {
      title: 'Sana',
      dataIndex: 'messageDate',
      key: 'messageDate',
      width: 150,
      render: (date: string) => dayjs(date).format('DD.MM HH:mm:ss'),
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 200,
      render: (_: any, record: Order) => (
        <Space size="small">
          <Tooltip title="Batafsil">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={(e) => { e.stopPropagation(); showDetail(record) }}
            />
          </Tooltip>
          {record.status === 'NEW' || record.status === 'VIEWED' ? (
            <Tooltip title="Qabul qilish">
              <Button
                size="small"
                type="primary"
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
                icon={<LikeOutlined />}
                onClick={(e) => { e.stopPropagation(); handleAcceptOrder(record) }}
              />
            </Tooltip>
          ) : null}
          {record.status !== 'COMPLETED' && (
            <Tooltip title="Bajarildi">
              <Button
                size="small"
                type="primary"
                icon={<CheckOutlined />}
                onClick={(e) => { e.stopPropagation(); handleStatusChange(record.id, 'COMPLETED') }}
              />
            </Tooltip>
          )}
          <Tooltip title="Bloklash">
            <Button
              size="small"
              danger
              type="primary"
              icon={<StopOutlined />}
              onClick={(e) => { e.stopPropagation(); handleBlockSender(record) }}
            />
          </Tooltip>
          <Tooltip title="O'chirish">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => { e.stopPropagation(); handleDelete(record.id) }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  const typeTabItems = [
    { key: 'all', label: `Barchasi (${stats?.total || 0})` },
    { key: 'CARGO', label: `Yuk (${stats?.cargo || 0})` },
    { key: 'DRIVER', label: `Haydovchi (${stats?.driver || 0})` },
  ]

  const scopeTabItems = [
    { key: 'all', label: 'Barchasi' },
    { key: 'INTERNAL', label: `Ichki yuklar (${stats?.internal || 0})` },
    { key: 'IMPORT', label: `Import (${stats?.import || 0})` },
    { key: 'EXPORT', label: `Eksport (${stats?.export || 0})` },
  ]

  const statusTabItems = [
    { key: 'all', label: `Barchasi` },
    { key: 'NEW', label: <Badge count={stats?.new || 0} size="small" offset={[8, 0]}>Yangi</Badge> },
    { key: 'VIEWED', label: `Ko'rilgan (${stats?.viewed || 0})` },
    { key: 'CONTACTED', label: `Bog'lanilgan (${stats?.contacted || 0})` },
    { key: 'COMPLETED', label: `Bajarilgan (${stats?.completed || 0})` },
    { key: 'REJECTED', label: `Rad etilgan (${stats?.rejected || 0})` },
  ]

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          <ShoppingCartOutlined style={{ marginRight: 8 }} />
          Buyurtmalar
        </Title>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            Buyurtma yaratish
          </Button>
          <Input
            placeholder="Qidirish..."
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            allowClear
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
          />
        </Space>
      </Space>

      <StatsRow gutter={[12, 12]}>
        <Col span={4}>
          <SpeedCard $highlight={isLive}>
            <Statistic
              title={<span><LiveDot $active={isLive} />Tezlik</span>}
              value={hourlyRate}
              suffix="/soat"
              valueStyle={{ color: isLive ? '#52c41a' : '#8c8c8c' }}
              prefix={<ThunderboltOutlined />}
            />
            <div style={{ marginTop: 4, fontSize: 11, color: '#8c8c8c' }}>
              {recentCount > 0 ? `${recentCount} ta / 5 min` : 'Kutilmoqda...'}
              {lastOrderTime && (
                <span style={{ marginLeft: 8 }}>
                  Oxirgi: {dayjs(lastOrderTime).format('HH:mm:ss')}
                </span>
              )}
            </div>
          </SpeedCard>
        </Col>
        <Col span={3}>
          <StyledCard><Statistic title="Bugun" value={stats?.today || 0} valueStyle={{ color: '#1890ff' }} /></StyledCard>
        </Col>
        <Col span={3}>
          <StyledCard><Statistic title="Yangi" value={stats?.new || 0} valueStyle={{ color: '#1890ff' }} /></StyledCard>
        </Col>
        <Col span={3}>
          <StyledCard><Statistic title="Yuk" value={stats?.cargo || 0} valueStyle={{ color: '#2f54eb' }} prefix={<InboxOutlined />} /></StyledCard>
        </Col>
        <Col span={3}>
          <StyledCard><Statistic title="Haydovchi" value={stats?.driver || 0} valueStyle={{ color: '#fa8c16' }} prefix={<CarOutlined />} /></StyledCard>
        </Col>
        <Col span={2}>
          <StyledCard><Statistic title="Bog'lan" value={stats?.contacted || 0} valueStyle={{ color: '#722ed1', fontSize: 20 }} /></StyledCard>
        </Col>
        <Col span={3}>
          <StyledCard><Statistic title="Bajarilgan" value={stats?.completed || 0} valueStyle={{ color: '#52c41a' }} /></StyledCard>
        </Col>
        <Col span={3}>
          <StyledCard><Statistic title="Jami" value={stats?.total || 0} /></StyledCard>
        </Col>
      </StatsRow>

      <StyledCard>
        {/* SANA FILTRI */}
        <FilterRow>
          <CalendarOutlined style={{ color: '#8c8c8c' }} />
          <RangePicker
            onChange={(dates) => handleDateChange(dates as [Dayjs | null, Dayjs | null] | null)}
            format="DD.MM.YYYY"
            placeholder={['Boshlanish', 'Tugash']}
            style={{ width: 260 }}
          />
          {quickDates.map(qd => (
            <Button
              key={qd.label}
              size="small"
              onClick={() => {
                const [from, to] = qd.value()
                setFilters(prev => ({
                  ...prev,
                  dateFrom: from.toISOString(),
                  dateTo: to.toISOString(),
                  page: 1,
                }))
              }}
            >
              {qd.label}
            </Button>
          ))}
          {(filters.dateFrom || filters.dateTo) && (
            <Button
              size="small"
              type="link"
              danger
              onClick={() => setFilters(prev => ({ ...prev, dateFrom: undefined, dateTo: undefined, page: 1 }))}
            >
              Tozalash
            </Button>
          )}
        </FilterRow>

        {/* TUR VA SCOPE FILTRLARI */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
          <Tabs
            items={typeTabItems}
            size="small"
            onChange={(key) => {
              setFilters((prev) => ({
                ...prev,
                type: key === 'all' ? undefined : (key as OrderType),
                page: 1,
              }))
            }}
          />
          <Tabs
            items={scopeTabItems}
            size="small"
            onChange={(key) => {
              setFilters((prev) => ({
                ...prev,
                scope: key === 'all' ? undefined : (key as OrderScope),
                page: 1,
              }))
            }}
          />
        </div>
        <Tabs
          items={statusTabItems}
          size="small"
          onChange={(key) => {
            setFilters((prev) => ({
              ...prev,
              status: key === 'all' ? undefined : (key as OrderStatus),
              page: 1,
            }))
          }}
        />
        <Table
          columns={columns}
          dataSource={data?.data || []}
          loading={isLoading}
          rowKey="id"
          scroll={{ x: 1600 }}
          size="middle"
          pagination={{
            current: data?.pagination?.page || 1,
            total: data?.pagination?.total || 0,
            pageSize: data?.pagination?.limit || 20,
            showSizeChanger: true,
            showTotal: (total) => `Jami ${total} ta`,
            onChange: (page, pageSize) => setFilters((prev) => ({ ...prev, page, limit: pageSize })),
          }}
          locale={{ emptyText: "Buyurtmalar topilmadi" }}
          onRow={(record) => ({
            style: { cursor: 'pointer' },
            onClick: () => showDetail(record),
          })}
        />
      </StyledCard>

      {/* QO'LDA BUYURTMA YARATISH MODALI */}
      <Modal
        title="Buyurtma yaratish"
        open={createModalOpen}
        onCancel={() => { setCreateModalOpen(false); createForm.resetFields() }}
        footer={null}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateOrder}
          initialValues={{ type: 'CARGO', scope: 'INTERNAL', isForSale: false }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label="Turi" rules={[{ required: true }]}>
                <Select options={[
                  { value: 'CARGO', label: 'Yuk' },
                  { value: 'DRIVER', label: 'Haydovchi' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="scope" label="Ko'lami">
                <Select options={[
                  { value: 'INTERNAL', label: 'Ichki' },
                  { value: 'IMPORT', label: 'Import' },
                  { value: 'EXPORT', label: 'Eksport' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="cargoFrom" label="Qayerdan" rules={[{ required: true }]}>
                <Input
                  placeholder="Toshkent"
                  onChange={(e) => setEstimateFrom(e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="cargoTo" label="Qayerga" rules={[{ required: true }]}>
                <Input
                  placeholder="Samarqand"
                  onChange={(e) => setEstimateTo(e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* NARX TAXMINI (Testr) */}
          {priceEstimate && (
            <Card size="small" style={{ marginBottom: 16, background: '#f6ffed', borderColor: '#b7eb8f' }}>
              <Space>
                <ThunderboltOutlined style={{ color: '#52c41a' }} />
                <Text strong>Taxminiy narx:</Text>
                <Text>{priceEstimate.minPrice?.toLocaleString()} — {priceEstimate.maxPrice?.toLocaleString()} so'm</Text>
                <Text type="secondary">(o'rtacha: {priceEstimate.avgPrice?.toLocaleString()})</Text>
                <Text type="secondary">({priceEstimate.sampleCount} ta namuna)</Text>
              </Space>
            </Card>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="vehicleType" label="Mashina turi">
                <Input placeholder="Fura, Kamaz..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="cargoWeight" label="Og'irlik">
                <Input placeholder="20 tonn" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Telefon" rules={[{ required: true }]}>
                <Input placeholder="+998901234567" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="price" label="Narx">
                <Input placeholder="5 000 000" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="messageText" label="Xabar matni" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Buyurtma tavsifi..." />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="isForSale" label="Sotuvga qo'yish" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="salePrice" label="Sotuv narxi">
                <InputNumber style={{ width: '100%' }} placeholder="Sotuv narxi" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createManualMutation.isPending} block>
              Buyurtma yaratish
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* ORDER DETAIL DRAWER */}
      <Drawer
        title="Buyurtma tafsilotlari"
        width={600}
        open={detailDrawer}
        onClose={() => { setDetailDrawer(false); setSelectedOrder(null) }}
        extra={
          selectedOrder && (
            <Space>
              {(selectedOrder.status === 'NEW' || selectedOrder.status === 'VIEWED') && (
                <Button
                  type="primary"
                  style={{ background: '#52c41a', borderColor: '#52c41a' }}
                  icon={<LikeOutlined />}
                  onClick={() => handleAcceptOrder(selectedOrder)}
                >
                  Qabul qilish
                </Button>
              )}
              <Button
                danger
                type="primary"
                icon={<StopOutlined />}
                onClick={() => handleBlockSender(selectedOrder)}
              >
                Bloklash
              </Button>
              <Select
                value={selectedOrder.status}
                onChange={(value) => {
                  handleStatusChange(selectedOrder.id, value)
                  setSelectedOrder({ ...selectedOrder, status: value })
                }}
                style={{ width: 160 }}
                options={[
                  { value: 'NEW', label: 'Yangi' },
                  { value: 'VIEWED', label: "Ko'rilgan" },
                  { value: 'CONTACTED', label: "Bog'lanilgan" },
                  { value: 'COMPLETED', label: 'Bajarilgan' },
                  { value: 'REJECTED', label: 'Rad etilgan' },
                ]}
              />
            </Space>
          )
        }
      >
        {selectedOrder && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Turi">
                <Space>
                  {selectedOrder.type === 'DRIVER' ? (
                    <Tag color="orange" icon={<CarOutlined />}>Haydovchi</Tag>
                  ) : (
                    <Tag color="blue" icon={<InboxOutlined />}>Yuk</Tag>
                  )}
                  {selectedOrder.scope && (
                    <Tag color={selectedOrder.scope === 'INTERNAL' ? 'green' : selectedOrder.scope === 'IMPORT' ? 'blue' : 'purple'}>
                      {selectedOrder.scope === 'INTERNAL' ? 'Ichki' : selectedOrder.scope === 'IMPORT' ? 'Import' : 'Eksport'}
                    </Tag>
                  )}
                  {selectedOrder.surgeMultiplier && selectedOrder.surgeMultiplier > 1 && (
                    <Tag color="volcano" icon={<ThunderboltOutlined />}>
                      Surge {selectedOrder.surgeMultiplier}x
                    </Tag>
                  )}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Guruh">{selectedOrder.groupTitle}</Descriptions.Item>
              {(selectedOrder.cargoFrom || selectedOrder.cargoTo) && (
                <Descriptions.Item label="Yo'nalish">
                  <Space>
                    <EnvironmentOutlined style={{ color: '#52c41a' }} />
                    <Text strong>{selectedOrder.cargoFrom || '?'}</Text>
                    <Text type="secondary">→</Text>
                    <Text strong>{selectedOrder.cargoTo || '?'}</Text>
                    {selectedOrder.distance && <Tag color="cyan">{selectedOrder.distance} km</Tag>}
                  </Space>
                </Descriptions.Item>
              )}
              {selectedOrder.cargoType && (
                <Descriptions.Item label="Yuk turi">{selectedOrder.cargoType}</Descriptions.Item>
              )}
              {selectedOrder.cargoWeight && (
                <Descriptions.Item label="Og'irlik">{selectedOrder.cargoWeight}</Descriptions.Item>
              )}
              {selectedOrder.vehicleType && (
                <Descriptions.Item label="Mashina turi">{selectedOrder.vehicleType}</Descriptions.Item>
              )}
              {selectedOrder.vehicleCapacity && (
                <Descriptions.Item label="Sig'imi">{selectedOrder.vehicleCapacity}</Descriptions.Item>
              )}
              {selectedOrder.price && (
                <Descriptions.Item label="Narx">
                  <Text strong style={{ color: '#52c41a', fontSize: 16 }}>{selectedOrder.price}</Text>
                </Descriptions.Item>
              )}
              {selectedOrder.phone && (
                <Descriptions.Item label="Telefon">
                  <Text copyable>{selectedOrder.phone}</Text>
                </Descriptions.Item>
              )}
              {selectedOrder.senderName && (
                <Descriptions.Item label="Yuboruvchi">
                  <Space>
                    <UserOutlined />
                    {selectedOrder.senderName}
                    {selectedOrder.senderUsername && (
                      <Text type="secondary">@{selectedOrder.senderUsername}</Text>
                    )}
                    {(selectedOrder.blockedByCount ?? 0) > 0 && (
                      <Tag color="red" icon={<StopOutlined />}>
                        {selectedOrder.blockedByCount} ta bloklagan
                      </Tag>
                    )}
                  </Space>
                </Descriptions.Item>
              )}
              {selectedOrder.acceptedById && (
                <Descriptions.Item label="Qabul qilgan">
                  <Tag color="green">Qabul qilingan</Tag>
                  {selectedOrder.acceptedAt && (
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      {dayjs(selectedOrder.acceptedAt).format('DD.MM.YYYY HH:mm')}
                    </Text>
                  )}
                </Descriptions.Item>
              )}
              {selectedOrder.closedAmount && (
                <Descriptions.Item label="Yopilgan summa">
                  <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                    {selectedOrder.closedAmount.toLocaleString()} so'm
                  </Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Sana">
                {dayjs(selectedOrder.messageDate).format('DD.MM.YYYY HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={statusColors[selectedOrder.status]}>
                  {statusLabels[selectedOrder.status]}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <Text strong>
                <MessageOutlined style={{ marginRight: 8 }} />
                Xabar matni:
              </Text>
              <Card style={{ marginTop: 8, backgroundColor: '#f6f8fa', borderRadius: 8 }}>
                <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                  {selectedOrder.messageText}
                </Paragraph>
              </Card>
            </div>
          </>
        )}
      </Drawer>

      {/* Sender barcha e'lonlari Modal */}
      <SenderOrdersModal
        senderId={senderFilter}
        senderName={senderName}
        open={!!senderFilter}
        onClose={() => setSenderFilter('')}
      />

      {/* ═══════ UNIKAL RAQAMLAR ═══════ */}
      <UniqueSendersSection
        onViewOrders={(phone, name) => { setSenderFilter(phone); setSenderName(name) }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// Unikal yuboruvchilar — Orders sahifasi pastida
// ═══════════════════════════════════════════════════════
function UniqueSendersSection({ onViewOrders }: {
  onViewOrders: (phone: string, name: string) => void
}) {
  const [type, setType] = useState<string>('ALL')
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const blockMutation = useBlockSender()

  const params: Record<string, string> = {
    page: String(page),
    limit: String(pageSize),
  }
  if (type && type !== 'ALL' && type !== 'BLOCKED') params.type = type
  if (dateRange?.[0]) params.dateFrom = dateRange[0].startOf('day').toISOString()
  if (dateRange?.[1]) params.dateTo = dateRange[1].endOf('day').toISOString()

  const isBlockedMode = type === 'BLOCKED'
  const endpoint = isBlockedMode ? '/orders/blocked-phones' : '/orders/unique-phones'

  const { data, isLoading } = useQuery({
    queryKey: ['unique-senders-inline', type, dateRange?.map(d => d?.toISOString()), page, pageSize],
    queryFn: async () => {
      const res = await api.get(endpoint, { params })
      return res.data as {
        data: Array<{
          phone: string; adsCount: number; lastSenderName: string | null;
          lastUsername: string | null; lastType: string; lastDate: string;
          lastFrom: string | null; lastTo: string | null;
          isBlocked: boolean; blockCount: number;
        }>
        pagination: { total: number; page: number; limit: number; totalPages: number }
      }
    },
  })

  const handleBlock = (phone: string, name: string) => {
    Modal.confirm({
      title: 'Yuboruvchini bloklash',
      content: `${name || phone} bloklash va barcha orderlarini REJECTED qilishni xohlaysizmi?`,
      okText: 'Bloklash',
      okType: 'danger',
      cancelText: 'Bekor qilish',
      onOk: async () => {
        try {
          await blockMutation.mutateAsync({
            senderTelegramId: phone,
            phone,
            senderName: name || phone,
          })
          message.success('Yuboruvchi bloklandi')
        } catch {
          message.error('Bloklash xatosi')
        }
      },
    })
  }

  const columns: any[] = [
    {
      title: '#',
      key: 'idx',
      width: 45,
      render: (_: any, __: any, i: number) => (page - 1) * pageSize + i + 1,
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
      width: 160,
      render: (phone: string) => <Text strong copyable={{ text: phone }}>{phone}</Text>,
    },
    {
      title: "E'lonlar",
      dataIndex: 'adsCount',
      key: 'adsCount',
      width: 90,
      sorter: (a: any, b: any) => a.adsCount - b.adsCount,
      render: (count: number) => (
        <Tag color={count >= 10 ? 'red' : count >= 5 ? 'orange' : 'blue'}>{count} ta</Tag>
      ),
    },
    {
      title: 'Ism',
      dataIndex: 'lastSenderName',
      key: 'name',
      ellipsis: true,
      width: 150,
      render: (name: string | null, rec: any) => (
        <Space direction="vertical" size={0}>
          {name && <Text>{name}</Text>}
          {rec.lastUsername && <Text type="secondary" style={{ fontSize: 11 }}>@{rec.lastUsername}</Text>}
        </Space>
      ),
    },
    ...(!isBlockedMode ? [
      {
        title: 'Turi',
        dataIndex: 'lastType',
        key: 'type',
        width: 110,
        render: (t: string) => t === 'DRIVER'
          ? <Tag icon={<CarOutlined />} color="green">Haydovchi</Tag>
          : <Tag icon={<InboxOutlined />} color="blue">Yuk</Tag>,
      },
      {
        title: "Yo'nalish",
        key: 'route',
        width: 170,
        render: (_: any, rec: any) => rec.lastFrom || rec.lastTo
          ? <Text type="secondary" style={{ fontSize: 12 }}>{rec.lastFrom || '?'} → {rec.lastTo || '?'}</Text>
          : '—',
      },
    ] : []),
    {
      title: 'Holat',
      key: 'status',
      width: 130,
      render: (_: any, rec: any) => rec.isBlocked
        ? <Tag color="red" icon={<StopOutlined />}>Bloklangan ({rec.blockCount})</Tag>
        : <Tag color="green">Faol</Tag>,
    },
    {
      title: "So'nggi sana",
      dataIndex: 'lastDate',
      key: 'lastDate',
      width: 130,
      render: (d: string) => d ? dayjs(d).format('DD.MM.YYYY HH:mm') : '—',
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 140,
      render: (_: any, rec: any) => (
        <Space size="small">
          <Tooltip title="Orderlarini ko'rish">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onViewOrders(rec.phone, rec.lastSenderName || rec.phone)}
            />
          </Tooltip>
          {!rec.isBlocked && (
            <Tooltip title="Bloklash">
              <Button
                size="small"
                danger
                type="primary"
                icon={<StopOutlined />}
                onClick={() => handleBlock(rec.phone, rec.lastSenderName || rec.phone)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  return (
    <StyledCard style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>
          <PhoneOutlined style={{ marginRight: 8 }} />
          Unikal yuboruvchilar
          {data?.pagination?.total ? <Tag color="blue" style={{ marginLeft: 8 }}>{data.pagination.total}</Tag> : null}
        </Title>
        <Space>
          <Select
            value={type}
            onChange={(v: string) => { setType(v); setPage(1) }}
            style={{ width: 160 }}
            size="small"
            options={[
              { value: 'ALL', label: 'Barchasi' },
              { value: 'CARGO', label: 'Yuk egalari' },
              { value: 'DRIVER', label: 'Haydovchilar' },
              { value: 'BLOCKED', label: 'Bloklangan' },
            ]}
          />
          <RangePicker
            value={dateRange}
            onChange={(v: any) => { setDateRange(v as any); setPage(1) }}
            format="DD.MM.YYYY"
            size="small"
            placeholder={['Dan', 'Gacha']}
          />
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={data?.data || []}
        loading={isLoading}
        rowKey="phone"
        size="small"
        scroll={{ x: 1000 }}
        pagination={{
          current: page,
          pageSize,
          total: data?.pagination?.total || 0,
          showSizeChanger: true,
          pageSizeOptions: ['20', '50', '100'],
          showTotal: (total: number) => `Jami: ${total}`,
          onChange: (p: number, ps: number) => { setPage(p); setPageSize(ps) },
        }}
      />
    </StyledCard>
  )
}

// Sender barcha e'lonlari — alohida komponent
function SenderOrdersModal({ senderId, senderName, open, onClose }: {
  senderId: string
  senderName: string
  open: boolean
  onClose: () => void
}) {
  const { data, isLoading } = useOrders({ search: open ? senderId : '', limit: open ? 100 : 1 })
  const orders = data?.data || []

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <Space>
          <UserOutlined />
          <span>{senderName} — barcha e'lonlari</span>
          <Tag color="blue">{orders.length} ta</Tag>
        </Space>
      }
      footer={null}
      width={900}
    >
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Yuklanmoqda...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>E'lon topilmadi</div>
      ) : (
        <Table
          dataSource={orders}
          rowKey="id"
          size="small"
          pagination={false}
          scroll={{ y: 500 }}
          columns={[
            {
              title: "Yo'nalish",
              key: 'route',
              render: (_: any, r: any) => (
                <Space size={4}>
                  <EnvironmentOutlined style={{ color: '#6B46C1' }} />
                  <span>{r.cargoFrom || '—'}</span>
                  <span style={{ color: '#999' }}>→</span>
                  <span>{r.cargoTo || '—'}</span>
                  {r.distance && <Tag>{r.distance} km</Tag>}
                </Space>
              ),
            },
            {
              title: 'Mashina',
              dataIndex: 'vehicleType',
              width: 100,
              render: (v: string) => v || '—',
            },
            {
              title: 'Narx',
              dataIndex: 'price',
              width: 100,
              render: (p: string) => p ? <span style={{ color: '#16A34A', fontWeight: 600 }}>{p}</span> : '—',
            },
            {
              title: 'Telefon',
              dataIndex: 'phone',
              width: 130,
              render: (p: string) => p ? <a href={`tel:${p}`}>{p}</a> : '—',
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
              width: 140,
              render: (d: string) => d ? new Date(d).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—',
            },
          ]}
        />
      )}
    </Modal>
  )
}

export default Orders
