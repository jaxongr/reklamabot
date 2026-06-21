import { useState } from 'react'
import {
  Table,
  Card,
  Typography,
  Tag,
  Space,
  Row,
  Col,
  Statistic,
  Input,
  DatePicker,
} from 'antd'
import {
  CheckCircleOutlined,
  DollarOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons'
import styled from 'styled-components'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import dayjs from 'dayjs'

const { Title } = Typography
const { RangePicker } = DatePicker
const { Search } = Input

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`

const StatCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  .ant-statistic-title {
    font-size: 13px;
    color: #8c8c8c;
  }
  .ant-statistic-content-value {
    font-size: 24px;
    font-weight: 700;
  }
`

interface ClosedOrder {
  id: string
  cargoFrom: string | null
  cargoTo: string | null
  cargoType: string | null
  cargoWeight: string | null
  price: string | null
  phone: string | null
  vehicleType: string | null
  closedAmount: number | null
  closedAt: string | null
  acceptedAt: string | null
  createdAt: string
  messageText: string
  groupTitle: string
  senderName: string | null
  isManual: boolean
  distance: number | null
}

interface ClosedDealsResponse {
  data: ClosedOrder[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
  stats: {
    totalDeals: number
    totalAmount: number
    avgAmount: number
  }
}

const ClosedDeals = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)

  const { data, isLoading } = useQuery<ClosedDealsResponse>({
    queryKey: ['closedDeals', page, pageSize, search, dateRange],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        page,
        limit: pageSize,
      }
      if (search) params.search = search
      if (dateRange?.[0]) params.dateFrom = dateRange[0].toISOString()
      if (dateRange?.[1]) params.dateTo = dateRange[1].toISOString()
      const res = await api.get('/orders/closed-deals', { params })
      return res.data
    },
  })

  const stats = data?.stats
  const orders = data?.data || []
  const total = data?.pagination?.total || 0

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (_: unknown, __: unknown, index: number) => (page - 1) * pageSize + index + 1,
    },
    {
      title: 'Sana',
      dataIndex: 'closedAt',
      key: 'closedAt',
      width: 110,
      render: (v: string) => v ? dayjs(v).format('DD.MM.YYYY') : '—',
    },
    {
      title: 'Qayerdan',
      dataIndex: 'cargoFrom',
      key: 'cargoFrom',
      width: 120,
      render: (v: string | null) => v ? <Tag icon={<EnvironmentOutlined />} color="blue">{v}</Tag> : '—',
    },
    {
      title: 'Qayerga',
      dataIndex: 'cargoTo',
      key: 'cargoTo',
      width: 120,
      render: (v: string | null) => v ? <Tag icon={<EnvironmentOutlined />} color="green">{v}</Tag> : '—',
    },
    {
      title: 'Mashina',
      dataIndex: 'vehicleType',
      key: 'vehicleType',
      width: 100,
      render: (v: string | null) => v ? <Tag color="purple">{v}</Tag> : '—',
    },
    {
      title: 'Narx',
      dataIndex: 'price',
      key: 'price',
      width: 110,
      render: (v: string | null) => v || '—',
    },
    {
      title: 'Yopilgan summa',
      dataIndex: 'closedAmount',
      key: 'closedAmount',
      width: 140,
      render: (v: number | null) => v ? <b>{v.toLocaleString()} UZS</b> : '—',
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      render: (v: string | null) => v || '—',
    },
    {
      title: 'Yuboruvchi',
      dataIndex: 'senderName',
      key: 'senderName',
      width: 130,
      ellipsis: true,
      render: (v: string | null) => (v || '—').slice(0, 15),
    },
    {
      title: 'Manba',
      key: 'source',
      width: 90,
      render: (_: unknown, record: ClosedOrder) =>
        record.isManual
          ? <Tag color="cyan">Qo'lda</Tag>
          : <Tag color="geekblue">{record.groupTitle || 'Guruh'}</Tag>,
    },
  ]

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={3} style={{ margin: 0 }}>Yopilgan yuklar</Title>

      {/* Statistika */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <StatCard>
            <Statistic
              title="Jami yopilgan"
              value={stats?.totalDeals || 0}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              suffix="ta"
            />
          </StatCard>
        </Col>
        <Col xs={24} sm={8}>
          <StatCard>
            <Statistic
              title="Jami summa"
              value={stats?.totalAmount || 0}
              prefix={<DollarOutlined style={{ color: '#1890ff' }} />}
              suffix="UZS"
              formatter={(v) => Number(v).toLocaleString()}
            />
          </StatCard>
        </Col>
        <Col xs={24} sm={8}>
          <StatCard>
            <Statistic
              title="O'rtacha summa"
              value={stats?.avgAmount || 0}
              prefix={<DollarOutlined style={{ color: '#722ed1' }} />}
              suffix="UZS"
              formatter={(v) => Number(v).toLocaleString()}
            />
          </StatCard>
        </Col>
      </Row>

      {/* Filtrlar */}
      <StyledCard>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Qidirish..."
              allowClear
              onSearch={(v) => { setSearch(v); setPage(1) }}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['Boshlanish', 'Tugash']}
              onChange={(dates) => {
                setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)
                setPage(1)
              }}
            />
          </Col>
        </Row>
      </StyledCard>

      {/* Jadval */}
      <StyledCard>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `Jami: ${t} ta`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps) },
          }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </StyledCard>
    </Space>
  )
}

export default ClosedDeals
