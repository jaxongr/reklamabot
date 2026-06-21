import { useState } from 'react'
import {
  Table,
  Card,
  Typography,
  Tag,
  Space,
  Row,
  Col,
  Input,
  InputNumber,
  Button,
  Modal,
  Form,
  Select,
  message,
  Popconfirm,
} from 'antd'
import {
  EnvironmentOutlined,
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import styled from 'styled-components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'

const { Title } = Typography

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`

const REGIONS = [
  'Toshkent shahri',
  'Toshkent viloyati',
  'Samarqand viloyati',
  'Buxoro viloyati',
  "Farg'ona viloyati",
  'Andijon viloyati',
  'Namangan viloyati',
  'Navoiy viloyati',
  'Qashqadaryo viloyati',
  'Surxondaryo viloyati',
  'Jizzax viloyati',
  'Sirdaryo viloyati',
  'Xorazm viloyati',
  "Qoraqalpog'iston Respublikasi",
]

interface Location {
  id: string
  name: string
  region: string
  type: string
  lat: number | null
  lng: number | null
  createdAt: string
}

const typeColors: Record<string, string> = {
  REGION: 'red',
  CITY: 'blue',
  DISTRICT: 'green',
}

const typeLabels: Record<string, string> = {
  REGION: 'Viloyat',
  CITY: 'Shahar',
  DISTRICT: 'Tuman',
}

const Locations = () => {
  const [regionFilter, setRegionFilter] = useState<string | undefined>()
  const [searchText, setSearchText] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: locations = [], isLoading } = useQuery<Location[]>({
    queryKey: ['locations', regionFilter],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (regionFilter) params.region = regionFilter
      const res = await api.get('/locations', { params })
      return res.data
    },
  })

  const createMutation = useMutation({
    mutationFn: (values: { name: string; region: string; type: string }) =>
      api.post('/locations', values),
    onSuccess: () => {
      message.success("Lokatsiya qo'shildi!")
      setModalOpen(false)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['locations'] })
    },
    onError: () => message.error('Xatolik yuz berdi'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/locations/${id}`),
    onSuccess: () => {
      message.success("Lokatsiya o'chirildi!")
      queryClient.invalidateQueries({ queryKey: ['locations'] })
    },
    onError: () => message.error('Xatolik yuz berdi'),
  })

  const filtered = searchText
    ? locations.filter(
        (l) =>
          l.name.toLowerCase().includes(searchText.toLowerCase()) ||
          l.region.toLowerCase().includes(searchText.toLowerCase()),
      )
    : locations

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: 'Nomi',
      dataIndex: 'name',
      key: 'name',
      render: (v: string) => <b>{v}</b>,
    },
    {
      title: 'Viloyat',
      dataIndex: 'region',
      key: 'region',
      render: (v: string) => (
        <Tag icon={<EnvironmentOutlined />} color="processing">
          {v}
        </Tag>
      ),
    },
    {
      title: 'Turi',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (v: string) => (
        <Tag color={typeColors[v] || 'default'}>{typeLabels[v] || v}</Tag>
      ),
    },
    {
      title: 'Koordinata',
      key: 'coords',
      width: 160,
      render: (_: unknown, record: Location) =>
        record.lat && record.lng ? (
          <a
            href={`https://www.google.com/maps?q=${record.lat},${record.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12 }}
          >
            {record.lat.toFixed(4)}, {record.lng.toFixed(4)}
          </a>
        ) : (
          <Tag color="warning">Yo'q</Tag>
        ),
    },
    {
      title: 'Amal',
      key: 'action',
      width: 80,
      render: (_: unknown, record: Location) => (
        <Popconfirm
          title="O'chirishni tasdiqlaysizmi?"
          onConfirm={() => deleteMutation.mutate(record.id)}
          okText="Ha"
          cancelText="Yo'q"
        >
          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ]

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            <EnvironmentOutlined style={{ marginRight: 8 }} />
            Lokatsiyalar
          </Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            Lokatsiya qo'shish
          </Button>
        </Col>
      </Row>

      <StyledCard>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Qidirish..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Viloyat bo'yicha filtr"
              allowClear
              style={{ width: '100%' }}
              value={regionFilter}
              onChange={(v) => setRegionFilter(v)}
              options={REGIONS.map((r) => ({ label: r, value: r }))}
            />
          </Col>
          <Col>
            <Tag color="blue">{filtered.length} ta lokatsiya</Tag>
          </Col>
        </Row>
      </StyledCard>

      <StyledCard>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 50,
            showSizeChanger: true,
            showTotal: (t) => `Jami: ${t} ta`,
          }}
          size="middle"
        />
      </StyledCard>

      <Modal
        title="Yangi lokatsiya qo'shish"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          form.resetFields()
        }}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
        okText="Qo'shish"
        cancelText="Bekor qilish"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => createMutation.mutate(values)}
        >
          <Form.Item
            name="name"
            label="Nomi"
            rules={[{ required: true, message: 'Nomini kiriting' }]}
          >
            <Input placeholder="Masalan: Toshkent" />
          </Form.Item>
          <Form.Item
            name="region"
            label="Viloyat"
            rules={[{ required: true, message: 'Viloyatni tanlang' }]}
          >
            <Select
              placeholder="Viloyatni tanlang"
              options={REGIONS.map((r) => ({ label: r, value: r }))}
              showSearch
            />
          </Form.Item>
          <Form.Item
            name="type"
            label="Turi"
            rules={[{ required: true, message: 'Turini tanlang' }]}
            initialValue="CITY"
          >
            <Select
              options={[
                { label: 'Viloyat', value: 'REGION' },
                { label: 'Shahar', value: 'CITY' },
                { label: 'Tuman', value: 'DISTRICT' },
              ]}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="lat"
                label="Kenglik (lat)"
                rules={[{ required: true, message: 'Google Maps dan oling' }]}
              >
                <InputNumber
                  placeholder="Masalan: 41.2995"
                  step={0.0001}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lng"
                label="Uzunlik (lng)"
                rules={[{ required: true, message: 'Google Maps dan oling' }]}
              >
                <InputNumber
                  placeholder="Masalan: 69.2401"
                  step={0.0001}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Google Maps da joyni toping → o'ng tugma → koordinatalarni nusxalang
          </Typography.Text>
        </Form>
      </Modal>
    </Space>
  )
}

export default Locations
