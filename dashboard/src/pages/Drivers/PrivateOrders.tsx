import { useState } from 'react'
import { Card, Table, Tag, Button, Space, Modal, Form, Input, InputNumber, Select, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { usePrivateOrders, useCreatePrivateOrder } from '../../hooks/useApi'
import type { PrivateOrderItem } from '../../types'

const statusColors: Record<string, string> = {
  PENDING: 'orange',
  ACCEPTED: 'green',
  REJECTED: 'red',
  IN_PROGRESS: 'blue',
  COMPLETED: 'cyan',
  CANCELLED: 'default',
}

const PrivateOrders = () => {
  const [status, setStatus] = useState<string | undefined>()
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [form] = Form.useForm()

  const { data, isLoading } = usePrivateOrders({ status, page, limit: 20 })
  const createMutation = useCreatePrivateOrder()

  const columns = [
    {
      title: 'Yo\'nalish',
      key: 'route',
      render: (_: any, r: PrivateOrderItem) => (
        <span style={{ fontWeight: 500 }}>{r.fromCity} → {r.toCity}</span>
      ),
    },
    { title: 'Yuk turi', dataIndex: 'cargoType', key: 'cargoType', render: (v: string) => v || '—' },
    { title: 'Vazn', dataIndex: 'cargoWeight', key: 'cargoWeight', render: (v: string) => v || '—' },
    { title: 'Narx', dataIndex: 'price', key: 'price', render: (v: string) => v || '—' },
    { title: 'Telefon', dataIndex: 'phone', key: 'phone' },
    {
      title: 'Komissiya',
      dataIndex: 'commissionAmount',
      key: 'commissionAmount',
      render: (v: number) => `${(v || 0).toLocaleString()} UZS`,
    },
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

  const handleCreate = async () => {
    const values = await form.validateFields()
    await createMutation.mutateAsync(values)
    message.success('Maxsus buyurtma yaratildi')
    setCreateOpen(false)
    form.resetFields()
  }

  return (
    <Card>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          Yangi buyurtma
        </Button>
        <Select
          placeholder="Holat"
          value={status}
          onChange={v => { setStatus(v); setPage(1) }}
          style={{ width: 160 }}
          allowClear
          options={[
            { value: 'PENDING', label: 'Kutilmoqda' },
            { value: 'ACCEPTED', label: 'Qabul qilingan' },
            { value: 'REJECTED', label: 'Rad etilgan' },
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

      <Modal
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={handleCreate}
        title="Yangi maxsus buyurtma"
        okText="Yaratish"
        confirmLoading={createMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="fromCity" label="Qayerdan" rules={[{ required: true }]}>
            <Input placeholder="Toshkent" />
          </Form.Item>
          <Form.Item name="toCity" label="Qayerga" rules={[{ required: true }]}>
            <Input placeholder="Samarqand" />
          </Form.Item>
          <Form.Item name="cargoType" label="Yuk turi">
            <Input placeholder="Qurilish materiallari" />
          </Form.Item>
          <Form.Item name="cargoWeight" label="Vazn">
            <Input placeholder="20 tonna" />
          </Form.Item>
          <Form.Item name="price" label="Narx">
            <Input placeholder="3,000,000 UZS" />
          </Form.Item>
          <Form.Item name="phone" label="Telefon" rules={[{ required: true }]}>
            <Input placeholder="+998901234567" />
          </Form.Item>
          <Form.Item name="description" label="Izoh">
            <Input.TextArea rows={2} placeholder="Qo'shimcha ma'lumot..." />
          </Form.Item>
          <Form.Item name="commissionAmount" label="Komissiya (UZS)" initialValue={10000}>
            <InputNumber style={{ width: '100%' }} min={0} step={1000} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default PrivateOrders
