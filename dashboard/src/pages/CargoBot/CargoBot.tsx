import { useState } from 'react'
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Switch,
  Tag,
  Popconfirm,
  Form,
  Statistic,
  Row,
  Col,
  Tabs,
  Select,
  Modal,
  message,
  Typography,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  RobotOutlined,
  PhoneOutlined,
  ReloadOutlined,
  EditOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'

const { Text } = Typography

const DAY_OPTIONS = [
  { value: 0, label: 'Muddatsiz' },
  { value: 1, label: '1 kun' },
  { value: 3, label: '3 kun' },
  { value: 7, label: '7 kun' },
  { value: 15, label: '15 kun' },
  { value: 30, label: '30 kun' },
  { value: 90, label: '90 kun' },
]

interface CargoBotUser {
  id: string
  telegramId: string
  name?: string | null
  isAllowed: boolean
  hasStarted: boolean
  expiresAt?: string | null
  createdAt: string
}

interface AcceptedOrder {
  id: string
  cargoFrom?: string
  cargoTo?: string
  cargoType?: string
  price?: string
  phone?: string
  acceptedByName?: string | null
  acceptedById?: string
  acceptedAt?: string
}

export default function CargoBot() {
  const qc = useQueryClient()
  const [form] = Form.useForm()
  const [tab, setTab] = useState('users')
  const [editUser, setEditUser] = useState<CargoBotUser | null>(null)
  const [editDays, setEditDays] = useState<number>(0)

  const { data: info } = useQuery({
    queryKey: ['cargo-bot', 'info'],
    queryFn: async () => (await api.get('/cargo-bot/info')).data,
    refetchInterval: 15000,
  })

  const { data: users = [], isLoading: usersLoading } = useQuery<CargoBotUser[]>({
    queryKey: ['cargo-bot', 'users'],
    queryFn: async () => (await api.get('/cargo-bot/users')).data,
    refetchInterval: 30000,
  })

  const { data: accepted = [], isLoading: acceptedLoading } = useQuery<AcceptedOrder[]>({
    queryKey: ['cargo-bot', 'accepted'],
    queryFn: async () => (await api.get('/cargo-bot/accepted')).data,
    enabled: tab === 'accepted',
    refetchInterval: tab === 'accepted' ? 10000 : false,
  })

  const addMut = useMutation({
    mutationFn: (body: { telegramId: string; name?: string; days?: number }) =>
      api.post('/cargo-bot/users', body),
    onSuccess: () => {
      message.success('Ruxsat berildi')
      form.resetFields()
      qc.invalidateQueries({ queryKey: ['cargo-bot'] })
    },
    onError: () => message.error('Xatolik'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, days }: { id: string; days: number }) =>
      api.put(`/cargo-bot/users/${id}`, { days }),
    onSuccess: () => {
      message.success('Muddat yangilandi')
      setEditUser(null)
      qc.invalidateQueries({ queryKey: ['cargo-bot'] })
    },
    onError: () => message.error('Xatolik'),
  })

  const removeMut = useMutation({
    mutationFn: (id: string) => api.delete(`/cargo-bot/users/${id}`),
    onSuccess: () => {
      message.success('Ruxsat olib tashlandi')
      qc.invalidateQueries({ queryKey: ['cargo-bot'] })
    },
  })

  const flowMut = useMutation({
    mutationFn: (active: boolean) => api.put('/cargo-bot/flow', { active }),
    onSuccess: (_d, active) => {
      message.success(active ? 'Yuklar oqimi yoqildi' : "Yuklar oqimi to'xtatildi")
      qc.invalidateQueries({ queryKey: ['cargo-bot', 'info'] })
    },
  })

  const renderExpiry = (r: CargoBotUser) => {
    if (!r.expiresAt) return <Tag>Muddatsiz</Tag>
    const exp = new Date(r.expiresAt)
    const expired = exp.getTime() <= Date.now()
    return (
      <Tag color={expired ? 'red' : 'gold'}>
        {expired ? 'Muddati tugagan' : `${exp.toLocaleDateString('uz')} gacha`}
      </Tag>
    )
  }

  const userColumns = [
    { title: 'Telegram ID', dataIndex: 'telegramId', key: 'telegramId' },
    {
      title: 'Ism',
      dataIndex: 'name',
      key: 'name',
      render: (v: string) => v || <Text type="secondary">—</Text>,
    },
    {
      title: 'Holat',
      key: 'status',
      render: (_: unknown, r: CargoBotUser) => (
        <Space>
          {r.isAllowed ? <Tag color="green">Ruxsat bor</Tag> : <Tag color="red">Ruxsat yo'q</Tag>}
          {r.hasStarted ? (
            <Tag color="blue">Botni ochgan</Tag>
          ) : (
            <Tag color="orange">Botni ochmagan</Tag>
          )}
        </Space>
      ),
    },
    { title: 'Muddat', key: 'expiry', render: (_: unknown, r: CargoBotUser) => renderExpiry(r) },
    {
      title: 'Amal',
      key: 'action',
      render: (_: unknown, r: CargoBotUser) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditUser(r)
              setEditDays(0)
            }}
          >
            Muddat
          </Button>
          <Popconfirm title="Ruxsatni olib tashlash?" onConfirm={() => removeMut.mutate(r.id)}>
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const acceptedColumns = [
    {
      title: "Yo'nalish",
      key: 'route',
      render: (_: unknown, r: AcceptedOrder) => `${r.cargoFrom || '—'} → ${r.cargoTo || '—'}`,
    },
    { title: 'Narx', dataIndex: 'price', key: 'price', render: (v: string) => v || '—' },
    {
      title: 'Mijoz raqami',
      dataIndex: 'phone',
      key: 'phone',
      render: (v: string) =>
        v ? (
          <a href={`tel:${v}`}>
            <PhoneOutlined /> {v}
          </a>
        ) : (
          '—'
        ),
    },
    {
      title: 'Qabul qilgan',
      key: 'acceptedBy',
      render: (_: unknown, r: AcceptedOrder) => r.acceptedByName || r.acceptedById || '—',
    },
    {
      title: 'Vaqt',
      dataIndex: 'acceptedAt',
      key: 'acceptedAt',
      render: (v: string) => (v ? new Date(v).toLocaleString('uz') : '—'),
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space size="large">
              <Statistic
                title="Bot"
                value={info?.username ? '@' + info.username : '...'}
                prefix={<RobotOutlined />}
              />
              <Statistic title="Ruxsatlilar" value={info?.allowedCount ?? 0} />
              <Statistic
                title="Holat"
                valueRender={() => (
                  <Tag color={info?.running ? 'green' : 'red'}>
                    {info?.running ? 'Ishlayapti' : "O'chiq"}
                  </Tag>
                )}
              />
            </Space>
          </Col>
          <Col>
            <Space>
              <Text strong>Yuklar oqimi:</Text>
              <Switch
                checked={info?.flowActive}
                checkedChildren="Yoniq"
                unCheckedChildren="To'xtatilgan"
                loading={flowMut.isPending}
                onChange={(v) => flowMut.mutate(v)}
              />
              <Button icon={<ReloadOutlined />} onClick={() => qc.invalidateQueries({ queryKey: ['cargo-bot'] })} />
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        <Tabs
          activeKey={tab}
          onChange={setTab}
          items={[
            {
              key: 'users',
              label: 'Ruxsat berilganlar',
              children: (
                <>
                  <Form
                    form={form}
                    layout="inline"
                    style={{ marginBottom: 16 }}
                    initialValues={{ days: 0 }}
                    onFinish={(v) => addMut.mutate(v)}
                  >
                    <Form.Item
                      name="telegramId"
                      rules={[{ required: true, message: 'Telegram ID kiriting' }]}
                    >
                      <Input placeholder="Telegram ID (masalan 123456789)" style={{ width: 220 }} />
                    </Form.Item>
                    <Form.Item name="name">
                      <Input placeholder="Ism (ixtiyoriy)" style={{ width: 160 }} />
                    </Form.Item>
                    <Form.Item name="days" label="Muddat">
                      <Select options={DAY_OPTIONS} style={{ width: 130 }} />
                    </Form.Item>
                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<PlusOutlined />}
                        loading={addMut.isPending}
                      >
                        Ruxsat berish
                      </Button>
                    </Form.Item>
                  </Form>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                    Eslatma: foydalanuvchi yuk olishi uchun botga kirib /start bosishi kerak. Muddat
                    tugagach ruxsat avtomatik o'chadi.
                  </Text>
                  <Table
                    rowKey="id"
                    loading={usersLoading}
                    columns={userColumns}
                    dataSource={users}
                    pagination={{ pageSize: 20 }}
                  />
                </>
              ),
            },
            {
              key: 'accepted',
              label: 'Qabul qilingan yuklar',
              children: (
                <Table
                  rowKey="id"
                  loading={acceptedLoading}
                  columns={acceptedColumns}
                  dataSource={accepted}
                  pagination={{ pageSize: 20 }}
                />
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={`Muddatni tahrirlash — ${editUser?.name || editUser?.telegramId || ''}`}
        open={!!editUser}
        onCancel={() => setEditUser(null)}
        onOk={() => editUser && updateMut.mutate({ id: editUser.id, days: editDays })}
        confirmLoading={updateMut.isPending}
        okText="Saqlash"
        cancelText="Bekor qilish"
      >
        <Text>Necha kun amal qilsin?</Text>
        <Select
          value={editDays}
          onChange={setEditDays}
          options={DAY_OPTIONS}
          style={{ width: '100%', marginTop: 8 }}
        />
        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
          Muddat bugundan boshlab hisoblanadi. "Muddatsiz" — cheksiz ruxsat.
        </Text>
      </Modal>
    </div>
  )
}
