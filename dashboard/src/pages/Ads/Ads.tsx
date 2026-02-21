import { useState } from 'react'
import {
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Input,
  Select,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
  Statistic,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  CopyOutlined,
  SendOutlined,
  StopOutlined,
} from '@ant-design/icons'
import styled from 'styled-components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography
const { Search } = Input
const { Option } = Select

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`

const StatusTag = ({ status }: { status: string }) => {
  const statusMap: Record<string, { color: string; text: string }> = {
    DRAFT: { color: 'default', text: 'Qoralama' },
    ACTIVE: { color: 'green', text: 'Faol' },
    PAUSED: { color: 'orange', text: 'To\'xtatilgan' },
    CLOSED: { color: 'red', text: 'Yopilgan' },
    SOLD_OUT: { color: 'volcano', text: 'Sotilgan' },
    ARCHIVED: { color: 'default', text: 'Arxiv' },
  }

  const { color, text } = statusMap[status] || { color: 'default', text: status }

  return <Tag color={color}>{text}</Tag>
}

const Ads = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [_search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data, isLoading } = useQuery({
    queryKey: ['ads', page, pageSize, statusFilter],
    queryFn: async () => {
      const params: any = {
        skip: (page - 1) * pageSize,
        take: pageSize,
      }
      if (statusFilter) params.status = statusFilter
      const response = await api.get('/ads', { params })
      return response.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/ads/${id}`)
    },
    onSuccess: () => {
      message.success('E\'lon o\'chirildi')
      queryClient.invalidateQueries({ queryKey: ['ads'] })
    },
  })

  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/ads/${id}/publish`)
    },
    onSuccess: () => {
      message.success('E\'lon nashr qilindi')
      queryClient.invalidateQueries({ queryKey: ['ads'] })
    },
  })

  const pauseMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/ads/${id}/pause`)
    },
    onSuccess: () => {
      message.success('E\'lon to\'xtatildi')
      queryClient.invalidateQueries({ queryKey: ['ads'] })
    },
  })

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
  }

  const handlePublish = (id: string) => {
    publishMutation.mutate(id)
  }

  const handlePause = (id: string) => {
    pauseMutation.mutate(id)
  }

  const handleDuplicate = (id: string) => {
    navigate(`/ads/${id}/duplicate`)
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id: string) => id.slice(0, 8) + '...',
    },
    {
      title: 'Sarlavha',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Narx',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: number, record: any) =>
        price ? `${price?.toLocaleString()} ${record.currency}` : '-',
    },
    {
      title: 'Holat',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => <StatusTag status={status} />,
    },
    {
      title: 'Soni',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: 100,
      render: (total: number, record: any) =>
        total ? `${record.soldQuantity || 0}/${total}` : '-',
    },
    {
      title: 'Yaratildi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString('uz-UZ'),
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 250,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/ads/${record.id}`)}
          >
            Ko'rish
          </Button>
          <Button
            type="link"
            icon={<CopyOutlined />}
            onClick={() => handleDuplicate(record.id)}
          >
            Nusxa
          </Button>
          {record.status === 'DRAFT' || record.status === 'PAUSED' ? (
            <Button
              type="link"
              icon={<SendOutlined />}
              onClick={() => handlePublish(record.id)}
            >
              Nashr qilish
            </Button>
          ) : record.status === 'ACTIVE' ? (
            <Button
              type="link"
              icon={<StopOutlined />}
              onClick={() => handlePause(record.id)}
            >
              To'xtatish
            </Button>
          ) : null}
          <Popconfirm
            title="E\'lonni o\'chirishni tasdiqlaysizmi?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              O'chirish
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <Title level={2}>📣 E\'lonlar</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/ads/create')}
              size="large"
            >
              Yangi E'lon
            </Button>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <StyledCard>
            <Statistic
              title="Jami E\'lonlar"
              value={data?.meta?.total || 0}
              prefix="📣"
            />
          </StyledCard>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <StyledCard>
            <Statistic
              title="Faol E\'lonlar"
              value={data?.data?.filter((a: any) => a.status === 'ACTIVE').length || 0}
              prefix="✅"
              valueStyle={{ color: '#52c41a' }}
            />
          </StyledCard>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <StyledCard>
            <Statistic
              title="Qoralamalar"
              value={data?.data?.filter((a: any) => a.status === 'DRAFT').length || 0}
              prefix="📝"
            />
          </StyledCard>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <StyledCard>
            <Statistic
              title="Yopilgan"
              value={data?.data?.filter((a: any) => a.status === 'CLOSED').length || 0}
              prefix="🔒"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </StyledCard>
        </Col>
      </Row>

      <StyledCard style={{ marginTop: 24 }}>
        <Space style={{ width: '100%', marginBottom: 16 }} size="middle">
          <Search
            placeholder="Qidirish..."
            allowClear
            style={{ width: 300 }}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            placeholder="Holat bo'yicha"
            allowClear
            style={{ width: 200 }}
            onChange={(value) => setStatusFilter(value)}
          >
            <Option value="ACTIVE">Faol</Option>
            <Option value="DRAFT">Qoralama</Option>
            <Option value="PAUSED">To'xtatilgan</Option>
            <Option value="CLOSED">Yopilgan</Option>
            <Option value="ARCHIVED">Arxiv</Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={data?.data || []}
          loading={isLoading}
          rowKey="id"
          pagination={{
            current: page,
            pageSize: pageSize,
            total: data?.meta?.total || 0,
            onChange: (newPage, newPageSize) => {
              setPage(newPage)
              setPageSize(newPageSize || 10)
            },
            showSizeChanger: true,
            showTotal: (total) => `Jami ${total} ta`,
          }}
          scroll={{ x: 1200 }}
        />
      </StyledCard>
    </div>
  )
}

export default Ads
