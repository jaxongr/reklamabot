import { useState } from 'react'
import { Card, Table, Tag, Space, Typography, Button, Modal, Form, Input, message, Select } from 'antd'
import { TeamOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { useYoldaRequests, useResolveYoldaRequest } from './useYoldaApi'
import dayjs from 'dayjs'

const { Title } = Typography

const YoldaRequests = () => {
  const [status, setStatus] = useState<string | undefined>()
  const { data, isLoading } = useYoldaRequests(status)
  const resolveMut = useResolveYoldaRequest()
  const [resolveOpen, setResolveOpen] = useState(false)
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [form] = Form.useForm()

  const submit = async () => {
    const v = await form.validateFields()
    try {
      await resolveMut.mutateAsync({ id: currentId, ...v })
      message.success('Javob yuborildi')
      setResolveOpen(false)
      form.resetFields()
    } catch {
      message.error('Xatolik')
    }
  }

  const columns = [
    {
      title: 'Vaqt',
      dataIndex: 'createdAt',
      render: (d: string) => dayjs(d).format('DD.MM.YY HH:mm'),
    },
    {
      title: 'Dispatcher',
      dataIndex: 'dispatcher',
      render: (d: any) => d?.fullName || d?.phone || '—',
    },
    {
      title: 'So\'ralgan telefon',
      dataIndex: 'requestedPhone',
      render: (p: string) => p ? <code>{p}</code> : '—',
    },
    {
      title: 'Order snapshot',
      dataIndex: 'orderSnapshot',
      render: (s: any) => s
        ? <span>{s.cargoFrom} → {s.cargoTo} ({s.vehicleType || '?'})</span>
        : '—',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s: string) => {
        const color = s === 'PENDING' ? 'orange'
          : s === 'APPROVED' ? 'green'
          : s === 'REJECTED' ? 'red' : 'default'
        return <Tag color={color}>{s}</Tag>
      },
    },
    {
      title: 'Admin izoh',
      dataIndex: 'adminNote',
      render: (n: string) => n || '—',
    },
    {
      title: 'Amal',
      render: (_: any, row: any) => row.status === 'PENDING' ? (
        <Button size="small" type="primary" onClick={() => { setCurrentId(row.id); setResolveOpen(true) }}>
          Javob berish
        </Button>
      ) : <Tag>Yopilgan</Tag>,
    },
  ]

  return (
    <div>
      <Title level={3} style={{ marginBottom: 16 }}>
        <TeamOutlined /> Haydovchi so'rovlar
      </Title>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Select
          placeholder="Status bo'yicha"
          style={{ width: 200 }}
          allowClear
          options={[
            { value: 'PENDING', label: 'Kutilmoqda' },
            { value: 'APPROVED', label: 'Tasdiqlangan' },
            { value: 'REJECTED', label: 'Rad etilgan' },
            { value: 'EXPIRED', label: 'Muddati o\'tgan' },
          ]}
          onChange={(v) => setStatus(v)}
        />
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={data || []}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 20 }}
        />
      </Card>

      <Modal
        title="So'rovga javob berish"
        open={resolveOpen}
        onOk={submit}
        onCancel={() => { setResolveOpen(false); form.resetFields() }}
        okText="Yuborish"
        cancelText="Bekor qilish"
        confirmLoading={resolveMut.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="status" label="Qaror" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'APPROVED', label: '✓ Tasdiqlash (haydovchi raqamini bering)' },
                { value: 'REJECTED', label: '✗ Rad etish' },
              ]}
            />
          </Form.Item>
          <Form.Item name="adminNote" label="Izoh (haydovchi raqami yoki sabab)">
            <Input.TextArea rows={3} placeholder="Masalan: Haydovchi: +998901234567 (Ali)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default YoldaRequests
