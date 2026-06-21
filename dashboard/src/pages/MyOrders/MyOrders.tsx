import { useState } from 'react'
import {
  Card, Table, Button, Space, Tag, Modal, Form, Input, Select, InputNumber,
  Switch, message, Typography, Row, Col, Statistic, Tooltip, Drawer, Descriptions,
} from 'antd'
import {
  ShoppingCartOutlined, PlusOutlined, EyeOutlined, CheckOutlined,
  DollarOutlined, EnvironmentOutlined, PhoneOutlined, ThunderboltOutlined,
  CarOutlined, InboxOutlined, TagOutlined,
} from '@ant-design/icons'
import {
  useMyOrders, useMyOrderStats, useCreateManualOrder, useUpdateOrderStatus,
  useCloseDeal, usePriceEstimate,
} from '../../hooks/useApi'
import type { Order, OrderStatus } from '../../types'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography

const statusColors: Record<string, string> = {
  NEW: 'blue',
  VIEWED: 'orange',
  CONTACTED: 'purple',
  COMPLETED: 'green',
  REJECTED: 'red',
}

const statusLabels: Record<string, string> = {
  NEW: 'Yangi',
  VIEWED: "Ko'rilgan",
  CONTACTED: "Bog'lanilgan",
  COMPLETED: 'Yopilgan',
  REJECTED: 'Rad etilgan',
}

const MyOrders = () => {
  const [filters, setFilters] = useState<{ status?: string; page: number; limit: number }>({ page: 1, limit: 20 })
  const { data, isLoading } = useMyOrders(filters)
  const { data: stats } = useMyOrderStats()
  const createMutation = useCreateManualOrder()
  const updateStatusMutation = useUpdateOrderStatus()
  const closeDealMutation = useCloseDeal()

  const [createModal, setCreateModal] = useState(false)
  const [createForm] = Form.useForm()
  const [closeModal, setCloseModal] = useState<{ id: string; open: boolean }>({ id: '', open: false })
  const [closeAmount, setCloseAmount] = useState<number>(0)
  const [detailDrawer, setDetailDrawer] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Narx taxmini
  const [estimateFrom, setEstimateFrom] = useState('')
  const [estimateTo, setEstimateTo] = useState('')
  const { data: priceEstimate } = usePriceEstimate(
    estimateFrom && estimateTo ? { from: estimateFrom, to: estimateTo } : undefined
  )

  const handleCreate = async (values: any) => {
    try {
      await createMutation.mutateAsync(values)
      message.success('Buyurtma yaratildi!')
      setCreateModal(false)
      createForm.resetFields()
      setEstimateFrom('')
      setEstimateTo('')
    } catch {
      message.error('Yaratishda xatolik')
    }
  }

  const handleCloseDeal = async () => {
    if (!closeModal.id) return
    try {
      await closeDealMutation.mutateAsync({ orderId: closeModal.id, amount: closeAmount })
      message.success('Yuk yopildi!')
      setCloseModal({ id: '', open: false })
      setCloseAmount(0)
    } catch {
      message.error('Xatolik')
    }
  }

  const showDetail = (order: Order) => {
    setSelectedOrder(order)
    setDetailDrawer(true)
  }

  const totalRevenue = stats?.closedDealsTotal || 0
  const totalDeals = stats?.closedDealsCount || 0
  const manualTotal = stats?.total || 0
  const forSaleCount = data?.data?.filter((o: Order) => o.isForSale)?.length || 0

  const columns = [
    {
      title: 'Turi',
      key: 'type',
      width: 90,
      render: (_: any, r: Order) => (
        <Space direction="vertical" size={2}>
          {r.type === 'DRIVER' ? (
            <Tag color="orange" icon={<CarOutlined />}>Hayd</Tag>
          ) : (
            <Tag color="blue" icon={<InboxOutlined />}>Yuk</Tag>
          )}
          {r.isForSale && <Tag color="gold" icon={<TagOutlined />}>Sotuvda</Tag>}
          {r.surgeMultiplier && r.surgeMultiplier > 1 && (
            <Tag color="volcano" icon={<ThunderboltOutlined />}>{r.surgeMultiplier}x</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Yo'nalish",
      key: 'route',
      width: 200,
      render: (_: any, r: Order) => (
        <Space>
          <EnvironmentOutlined style={{ color: '#52c41a' }} />
          <Text strong>{r.cargoFrom || '?'}</Text>
          <Text type="secondary">→</Text>
          <Text strong>{r.cargoTo || '?'}</Text>
        </Space>
      ),
    },
    {
      title: 'Mashina',
      dataIndex: 'vehicleType',
      key: 'vehicleType',
      width: 100,
      render: (v: string) => v ? <Tag color="geekblue">{v}</Tag> : '—',
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
      width: 160,
      render: (phone: string) => phone ? (
        <Text copyable={{ text: phone }}><PhoneOutlined /> {phone}</Text>
      ) : '—',
    },
    {
      title: 'Narx',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (v: string) => v ? <Text strong>{v}</Text> : '—',
    },
    {
      title: 'Sotuv narxi',
      dataIndex: 'salePrice',
      key: 'salePrice',
      width: 100,
      render: (v: string) => v ? <Tag color="gold">{v}</Tag> : '—',
    },
    {
      title: 'Yopilgan summa',
      dataIndex: 'closedAmount',
      key: 'closedAmount',
      width: 120,
      render: (v: number) => v ? (
        <Text strong style={{ color: '#52c41a' }}>{v.toLocaleString()} so'm</Text>
      ) : '—',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={statusColors[status]}>{statusLabels[status] || status}</Tag>
      ),
    },
    {
      title: 'Sana',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (d: string) => dayjs(d).format('DD.MM HH:mm'),
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 200,
      render: (_: any, r: Order) => (
        <Space size="small">
          <Button size="small" icon={<EyeOutlined />} onClick={() => showDetail(r)} />
          {r.status !== 'COMPLETED' && (
            <Tooltip title="Yuk yopildi">
              <Button
                size="small"
                type="primary"
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
                icon={<DollarOutlined />}
                onClick={(e) => { e.stopPropagation(); setCloseModal({ id: r.id, open: true }) }}
              >
                Yopish
              </Button>
            </Tooltip>
          )}
          {r.status !== 'COMPLETED' && r.status !== 'REJECTED' && (
            <Button
              size="small"
              type="primary"
              icon={<CheckOutlined />}
              onClick={(e) => {
                e.stopPropagation()
                updateStatusMutation.mutate({ id: r.id, status: 'CONTACTED' as OrderStatus })
              }}
            >
              Bog'landim
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          <ShoppingCartOutlined style={{ marginRight: 8 }} />
          Mening buyurtmalarim
        </Title>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setCreateModal(true)}>
          Yangi buyurtma yaratish
        </Button>
      </Space>

      {/* STATISTIKA */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card size="small">
            <Statistic title="Jami yaratilgan" value={manualTotal} prefix={<ShoppingCartOutlined />} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="Sotuvdagilar" value={forSaleCount} prefix={<TagOutlined />} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="Yopilgan" value={totalDeals} prefix={<CheckOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="Umumiy daromad" value={totalRevenue} suffix="so'm" prefix={<DollarOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="O'rtacha summa"
              value={totalDeals > 0 ? Math.round(totalRevenue / totalDeals) : 0}
              suffix="so'm"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1400 }}
          size="middle"
          pagination={{
            current: data?.pagination?.page || 1,
            total: data?.pagination?.total || 0,
            pageSize: data?.pagination?.limit || 20,
            showSizeChanger: true,
            showTotal: (total) => `Jami ${total} ta`,
            onChange: (page, pageSize) => setFilters(prev => ({ ...prev, page, limit: pageSize })),
          }}
        />
      </Card>

      {/* BUYURTMA YARATISH MODALI */}
      <Modal
        title="Yangi buyurtma yaratish"
        open={createModal}
        onCancel={() => { setCreateModal(false); createForm.resetFields(); setEstimateFrom(''); setEstimateTo('') }}
        footer={null}
        width={640}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate} initialValues={{ type: 'CARGO', scope: 'INTERNAL', isForSale: false }}>
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
                <Input placeholder="Toshkent" onChange={e => setEstimateFrom(e.target.value)} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="cargoTo" label="Qayerga" rules={[{ required: true }]}>
                <Input placeholder="Samarqand" onChange={e => setEstimateTo(e.target.value)} />
              </Form.Item>
            </Col>
          </Row>

          {/* NARX TAXMINI (Testr) */}
          {priceEstimate && (
            <Card size="small" style={{ marginBottom: 16, background: '#f6ffed', borderColor: '#b7eb8f' }}>
              <Space>
                <ThunderboltOutlined style={{ color: '#52c41a' }} />
                <Text strong>Taxminiy narx (Testr):</Text>
                <Text>{priceEstimate.minPrice?.toLocaleString()} — {priceEstimate.maxPrice?.toLocaleString()} so'm</Text>
                <Text type="secondary">(o'rtacha: {priceEstimate.avgPrice?.toLocaleString()})</Text>
              </Space>
            </Card>
          )}

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="vehicleType" label="Mashina turi">
                <Input placeholder="Fura, Kamaz..." />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="cargoWeight" label="Og'irlik">
                <Input placeholder="20 tonn" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="phone" label="Telefon" rules={[{ required: true }]}>
                <Input placeholder="+998..." />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="price" label="Narx">
                <Input placeholder="5 000 000" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="isForSale" label="Sotuvga" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="salePrice" label="Sotuv narxi">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="messageText" label="Tavsif" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Buyurtma tavsifi..." />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={createMutation.isPending} block size="large">
            Buyurtma yaratish
          </Button>
        </Form>
      </Modal>

      {/* YUK YOPISH MODALI */}
      <Modal
        title="Yuk yopish — Qanchaga yopildi?"
        open={closeModal.open}
        onOk={handleCloseDeal}
        onCancel={() => setCloseModal({ id: '', open: false })}
        okText="Yopish"
        okButtonProps={{ loading: closeDealMutation.isPending }}
      >
        <InputNumber
          style={{ width: '100%' }}
          size="large"
          placeholder="Summani kiriting (so'm)"
          value={closeAmount}
          onChange={v => setCloseAmount(v || 0)}
          formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          min={0}
        />
      </Modal>

      {/* DETAIL DRAWER */}
      <Drawer
        title="Buyurtma tafsilotlari"
        width={550}
        open={detailDrawer}
        onClose={() => { setDetailDrawer(false); setSelectedOrder(null) }}
      >
        {selectedOrder && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Turi">
              <Space>
                {selectedOrder.type === 'DRIVER' ? <Tag color="orange">Haydovchi</Tag> : <Tag color="blue">Yuk</Tag>}
                {selectedOrder.scope && <Tag>{selectedOrder.scope}</Tag>}
                {selectedOrder.isForSale && <Tag color="gold">Sotuvda</Tag>}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Yo'nalish">
              {selectedOrder.cargoFrom} → {selectedOrder.cargoTo}
            </Descriptions.Item>
            {selectedOrder.vehicleType && <Descriptions.Item label="Mashina">{selectedOrder.vehicleType}</Descriptions.Item>}
            {selectedOrder.cargoWeight && <Descriptions.Item label="Og'irlik">{selectedOrder.cargoWeight}</Descriptions.Item>}
            {selectedOrder.phone && <Descriptions.Item label="Telefon"><Text copyable>{selectedOrder.phone}</Text></Descriptions.Item>}
            {selectedOrder.price && <Descriptions.Item label="Narx">{selectedOrder.price}</Descriptions.Item>}
            {selectedOrder.salePrice && <Descriptions.Item label="Sotuv narxi">{selectedOrder.salePrice}</Descriptions.Item>}
            {selectedOrder.closedAmount && (
              <Descriptions.Item label="Yopilgan summa">
                <Text strong style={{ color: '#52c41a' }}>{selectedOrder.closedAmount.toLocaleString()} so'm</Text>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Status">
              <Tag color={statusColors[selectedOrder.status]}>{statusLabels[selectedOrder.status]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Xabar">
              <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{selectedOrder.messageText}</Paragraph>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  )
}

export default MyOrders
