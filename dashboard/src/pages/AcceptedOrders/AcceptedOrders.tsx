import { useState } from 'react'
import {
  Table,
  Card,
  Typography,
  Tag,
  Space,
  Input,
  Statistic,
  Row,
  Col,
  Tooltip,
  Drawer,
  Descriptions,
  Tabs,
} from 'antd'
import {
  CheckCircleOutlined,
  CarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
  ClockCircleOutlined,
  StopOutlined,
  SearchOutlined,
  TruckOutlined,
} from '@ant-design/icons'
import styled from 'styled-components'
import { useAllAcceptedOrders } from '../../hooks/useApi'
import { useSocketEvent } from '../../hooks/useSocket'
import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`

const RouteCell = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
`

const statusColors: Record<string, string> = {
  ACCEPTED: 'blue',
  ON_WAY: 'orange',
  ARRIVED: 'cyan',
  COMPLETED: 'green',
  CANCELLED: 'red',
}

const statusLabels: Record<string, string> = {
  ACCEPTED: 'Qabul qilindi',
  ON_WAY: "Yo'lda",
  ARRIVED: 'Yetib bordi',
  COMPLETED: 'Bajarildi',
  CANCELLED: 'Bekor',
}

export default function AcceptedOrders() {
  const [statusFilter, setStatusFilter] = useState<string>('active')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  const queryClient = useQueryClient()

  const { data, isLoading } = useAllAcceptedOrders({
    status: statusFilter || undefined,
    search: search || undefined,
    page,
    limit: 20,
  })

  // WebSocket — real-time yangilanish
  useSocketEvent('driver:orderAccepted', () => {
    queryClient.invalidateQueries({ queryKey: ['orders', 'all-accepted'] })
  })
  useSocketEvent('driver:trackingUpdate', () => {
    queryClient.invalidateQueries({ queryKey: ['orders', 'all-accepted'] })
  })

  const columns = [
    {
      title: 'Yo\'nalish',
      key: 'route',
      width: 220,
      render: (_: unknown, record: any) => (
        <RouteCell>
          <EnvironmentOutlined style={{ color: '#1890ff' }} />
          <Text strong style={{ fontSize: 13 }}>{record.cargoFrom || '—'}</Text>
          <Text type="secondary">→</Text>
          <Text strong style={{ fontSize: 13 }}>{record.cargoTo || '—'}</Text>
        </RouteCell>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'acceptedStatus',
      width: 130,
      render: (status: string) => (
        <Tag color={statusColors[status] || 'default'}>
          {statusLabels[status] || status}
        </Tag>
      ),
    },
    {
      title: 'Haydovchi',
      key: 'driver',
      width: 200,
      render: (_: unknown, record: any) => {
        const driver = record.driver
        if (!driver) return <Text type="secondary">—</Text>
        return (
          <Space direction="vertical" size={0}>
            <Space size={4}>
              <UserOutlined style={{ fontSize: 12 }} />
              <Text style={{ fontSize: 13 }}>{(driver.fullName || '—').slice(0, 15)}</Text>
              {driver.isVerified && (
                <Tooltip title="Tasdiqlangan">
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 12 }} />
                </Tooltip>
              )}
            </Space>
            {driver.phone && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                <PhoneOutlined /> {driver.phone}
              </Text>
            )}
            {driver.vehicleType && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                <CarOutlined /> {driver.vehicleType} {driver.vehicleNumber || ''}
              </Text>
            )}
          </Space>
        )
      },
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      width: 140,
      render: (phone: string) => phone ? (
        <a href={`tel:${phone}`} style={{ fontSize: 13 }}>
          <PhoneOutlined /> {phone}
        </a>
      ) : '—',
    },
    {
      title: 'Mashina',
      key: 'vehicle',
      width: 120,
      render: (_: unknown, record: any) => (
        <Text style={{ fontSize: 12 }}>
          {[record.vehicleType, record.vehicleCapacity].filter(Boolean).join(' ') || '—'}
        </Text>
      ),
    },
    {
      title: 'Yuboruvchi',
      dataIndex: 'senderName',
      width: 130,
      ellipsis: true,
      render: (name: string) => <Text style={{ fontSize: 12 }}>{(name || '—').slice(0, 15)}</Text>,
    },
    {
      title: 'Qabul vaqti',
      dataIndex: 'acceptedAt',
      width: 140,
      render: (date: string) => date ? (
        <Tooltip title={dayjs(date).format('DD.MM.YYYY HH:mm:ss')}>
          <Text style={{ fontSize: 12 }}>
            <ClockCircleOutlined /> {dayjs(date).format('DD.MM HH:mm')}
          </Text>
        </Tooltip>
      ) : '—',
    },
    {
      title: 'Tur',
      key: 'flags',
      width: 100,
      render: (_: unknown, record: any) => (
        <Space size={4}>
          {record.isAdditionalCargo && <Tag color="gold">Qo'shimcha</Tag>}
          <Tag color={record.type === 'CARGO' ? 'blue' : 'purple'}>
            {record.type === 'CARGO' ? 'Yuk' : 'Haydovchi'}
          </Tag>
        </Space>
      ),
    },
  ]

  const stats = data?.stats

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        <TruckOutlined /> Qabul qilingan zakazlar
      </Title>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <StyledCard>
            <Statistic
              title="Jami qabul qilingan"
              value={stats?.totalAccepted || 0}
              prefix={<CheckCircleOutlined />}
            />
          </StyledCard>
        </Col>
        <Col span={6}>
          <StyledCard>
            <Statistic
              title="Faol"
              value={stats?.activeCount || 0}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </StyledCard>
        </Col>
        <Col span={6}>
          <StyledCard>
            <Statistic
              title="Bajarilgan"
              value={stats?.completedCount || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </StyledCard>
        </Col>
        <Col span={6}>
          <StyledCard>
            <Statistic
              title="Bekor qilingan"
              value={stats?.cancelledCount || 0}
              prefix={<StopOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </StyledCard>
        </Col>
      </Row>

      {/* Filters */}
      <StyledCard style={{ marginBottom: 16 }}>
        <Space size={16} wrap>
          <Tabs
            activeKey={statusFilter}
            onChange={(key) => { setStatusFilter(key); setPage(1); }}
            items={[
              { key: 'active', label: 'Faol' },
              { key: 'completed', label: 'Bajarilgan' },
              { key: 'cancelled', label: 'Bekor' },
              { key: '', label: 'Barchasi' },
            ]}
            size="small"
          />
          <Input
            placeholder="Qidirish..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ width: 250 }}
            allowClear
          />
        </Space>
      </StyledCard>

      {/* Table */}
      <StyledCard>
        <Table
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          loading={isLoading}
          size="small"
          scroll={{ x: 1100 }}
          onRow={(record) => ({
            onClick: () => setSelectedOrder(record),
            style: { cursor: 'pointer' },
          })}
          pagination={{
            current: page,
            pageSize: 20,
            total: data?.pagination?.total || 0,
            onChange: setPage,
            showSizeChanger: false,
            showTotal: (total) => `Jami: ${total}`,
          }}
        />
      </StyledCard>

      {/* Detail Drawer */}
      <Drawer
        title="Zakaz tafsilotlari"
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        width={500}
      >
        {selectedOrder && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Yo'nalish">
                <Text strong>{selectedOrder.cargoFrom} → {selectedOrder.cargoTo}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={statusColors[selectedOrder.acceptedStatus] || 'default'}>
                  {statusLabels[selectedOrder.acceptedStatus] || selectedOrder.acceptedStatus}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Telefon">
                {selectedOrder.phone ? (
                  <a href={`tel:${selectedOrder.phone}`}>{selectedOrder.phone}</a>
                ) : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Mashina">
                {[selectedOrder.vehicleType, selectedOrder.vehicleCapacity].filter(Boolean).join(' ') || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Og'irlik">
                {selectedOrder.cargoWeight || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Narx">
                {selectedOrder.price || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Yuboruvchi">
                {selectedOrder.senderName || '—'}
                {selectedOrder.senderUsername && ` (@${selectedOrder.senderUsername})`}
              </Descriptions.Item>
              <Descriptions.Item label="Guruh">
                {selectedOrder.groupTitle || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Qabul vaqti">
                {selectedOrder.acceptedAt ? dayjs(selectedOrder.acceptedAt).format('DD.MM.YYYY HH:mm') : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Yaratilgan">
                {dayjs(selectedOrder.createdAt).format('DD.MM.YYYY HH:mm')}
              </Descriptions.Item>
              {selectedOrder.isAdditionalCargo && (
                <Descriptions.Item label="Tur">
                  <Tag color="gold">Qo'shimcha yuk</Tag>
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Haydovchi ma'lumotlari */}
            {selectedOrder.driver && (
              <Card title="Haydovchi" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Ism">
                    {selectedOrder.driver.fullName}
                    {selectedOrder.driver.isVerified && (
                      <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 6 }} />
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Telefon">
                    <a href={`tel:${selectedOrder.driver.phone}`}>{selectedOrder.driver.phone}</a>
                  </Descriptions.Item>
                  <Descriptions.Item label="Mashina">
                    {selectedOrder.driver.vehicleType} {selectedOrder.driver.vehicleNumber || ''}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {/* Xabar matni */}
            {selectedOrder.messageText && (
              <Card title="Xabar matni" size="small">
                <Text style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>
                  {selectedOrder.messageText}
                </Text>
              </Card>
            )}
          </Space>
        )}
      </Drawer>
    </div>
  )
}
