import { useState } from 'react'
import {
  Card, Table, Button, Space, Tag, Modal, Form, Input, message,
  Typography, Row, Col, Statistic, Checkbox, Divider, Drawer,
} from 'antd'
import {
  TeamOutlined, PlusOutlined, LockOutlined, SettingOutlined, EditOutlined,
} from '@ant-design/icons'
import { useStaffList, useCreateStaff, useChangePassword } from '../../hooks/useApi'
import api from '../../services/api'

const { Title, Text } = Typography

// Guruhli bo'limlar — har bir menyu elementi alohida ruxsat
const SECTION_GROUPS = [
  {
    group: "E'lon va tarqatish",
    items: [
      { key: 'ads', label: "E'lonlar" },
      { key: 'posts', label: 'Tarqatish' },
      { key: 'sessions', label: 'Sessiyalar' },
      { key: 'groups', label: 'Guruhlar' },
    ],
  },
  {
    group: 'Buyurtmalar',
    items: [
      { key: 'orders', label: 'Barcha buyurtmalar' },
      { key: 'my-orders', label: 'Mening buyurtmalarim' },
      { key: 'accepted-orders', label: 'Qabul qilinganlar' },
      { key: 'closed-deals', label: 'Yopilgan yuklar' },
      { key: 'unique-phones', label: 'Unikal raqamlar' },
    ],
  },
  {
    group: 'Monitoring',
    items: [
      { key: 'monitor', label: 'Kuzatuv' },
      { key: 'blocked-users', label: 'Bloklangan' },
      { key: 'telegram-sms', label: 'Telegram SMS' },
    ],
  },
  {
    group: 'Asosiy',
    items: [
      { key: 'drivers', label: 'Haydovchilar' },
      { key: 'locations', label: 'Lokatsiyalar' },
    ],
  },
  {
    group: 'Foydalanuvchilar',
    items: [
      { key: 'users', label: "Ro'yxat" },
      { key: 'online-users', label: 'Online status' },
      { key: 'payments', label: "To'lovlar" },
      { key: 'accounting', label: 'Buxgalteriya' },
    ],
  },
  {
    group: 'Kommunikatsiya',
    items: [
      { key: 'notifications', label: 'Bildirishnomalar' },
      { key: 'chat', label: 'Chat' },
      { key: 'support', label: "Qo'llab-quvvatlash" },
    ],
  },
  {
    group: 'Statistika va sozlamalar',
    items: [
      { key: 'analytics', label: 'Statistika' },
      { key: 'sms', label: 'SMS sozlamalari' },
      { key: 'settings', label: 'Sozlamalar' },
    ],
  },
]

// Flat ro'yxat — save/load uchun
const ALL_SECTIONS = SECTION_GROUPS.flatMap(g => g.items)

// Ruxsatlarni API ga saqlash
async function savePermissions(role: string, sections: Set<string>) {
  const actions = ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT', 'MANAGE']
  const permissions: Array<{ section: string; action: string; enabled: boolean }> = []
  for (const s of ALL_SECTIONS) {
    const enabled = sections.has(s.key)
    for (const action of actions) {
      permissions.push({ section: s.key, action, enabled })
    }
  }
  await api.put('/auth/permissions', { role, permissions })
}

// Ruxsatlarni API dan yuklash
async function loadPermissions(role: string): Promise<Set<string>> {
  const res = await api.get('/auth/permissions', { params: { role } })
  const data = res.data
  const sections = new Set<string>()
  if (data && typeof data === 'object') {
    const rolePerms = data[role]
    if (rolePerms && typeof rolePerms === 'object') {
      for (const section of Object.keys(rolePerms)) {
        sections.add(section)
      }
    }
  }
  return sections
}

// Galichkali bo'limlar komponenti — guruhli
function SectionCheckboxes({ selected, onChange }: {
  selected: Set<string>
  onChange: (sections: Set<string>) => void
}) {
  const toggle = (key: string) => {
    const next = new Set(selected)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    onChange(next)
  }

  const toggleGroup = (items: typeof ALL_SECTIONS, checked: boolean) => {
    const next = new Set(selected)
    for (const item of items) {
      if (checked) next.add(item.key)
      else next.delete(item.key)
    }
    onChange(next)
  }

  const toggleAll = (checked: boolean) => {
    onChange(checked ? new Set(ALL_SECTIONS.map(s => s.key)) : new Set())
  }

  const total = ALL_SECTIONS.length

  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <Checkbox
          checked={selected.size === total}
          indeterminate={selected.size > 0 && selected.size < total}
          onChange={(e) => toggleAll(e.target.checked)}
        >
          <Text strong>Barchasini belgilash</Text>
        </Checkbox>
        <Text type="secondary" style={{ marginLeft: 8 }}>({selected.size}/{total})</Text>
      </div>
      <div style={{ maxHeight: 500, overflowY: 'auto' }}>
        {SECTION_GROUPS.map(group => {
          const groupChecked = group.items.every(i => selected.has(i.key))
          const groupIndeterminate = group.items.some(i => selected.has(i.key)) && !groupChecked
          return (
            <div key={group.group} style={{ marginBottom: 12 }}>
              <div style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0', marginBottom: 6 }}>
                <Checkbox
                  checked={groupChecked}
                  indeterminate={groupIndeterminate}
                  onChange={(e) => toggleGroup(group.items, e.target.checked)}
                >
                  <Text strong style={{ fontSize: 13 }}>{group.group}</Text>
                </Checkbox>
              </div>
              {group.items.map(item => (
                <div
                  key={item.key}
                  style={{
                    padding: '6px 12px 6px 28px',
                    marginBottom: 2,
                    borderRadius: 6,
                    background: selected.has(item.key) ? '#f6ffed' : 'transparent',
                    cursor: 'pointer',
                  }}
                  onClick={() => toggle(item.key)}
                >
                  <Checkbox checked={selected.has(item.key)} style={{ marginRight: 8 }} />
                  <Text>{item.label}</Text>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </>
  )
}

const StaffManagement = () => {
  const { data: staff, isLoading } = useStaffList()
  const createMutation = useCreateStaff()
  const passwordMutation = useChangePassword()

  const [createModal, setCreateModal] = useState(false)
  const [createSections, setCreateSections] = useState<Set<string>>(new Set())
  const [passwordModal, setPasswordModal] = useState<{ id: string; username: string } | null>(null)
  const [editDrawer, setEditDrawer] = useState<any>(null)
  const [editSections, setEditSections] = useState<Set<string>>(new Set())
  const [editSaving, setEditSaving] = useState(false)
  const [createForm] = Form.useForm()
  const [passwordForm] = Form.useForm()

  // Hodim yaratish — ism, familiya, tel, login, parol + bo'limlar galichka
  const handleCreate = async (values: any) => {
    try {
      await createMutation.mutateAsync({
        ...values,
        role: 'DISPATCHER', // Hodimlar har doim DISPATCHER roli bilan yaratiladi
      })
      // Ruxsatlarni saqlash
      if (createSections.size > 0) {
        await savePermissions('DISPATCHER', createSections).catch(() => {})
      }
      message.success(`Hodim "${values.firstName}" yaratildi!`)
      setCreateModal(false)
      createForm.resetFields()
      setCreateSections(new Set())
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Yaratishda xatolik')
    }
  }

  const handleChangePassword = async (values: any) => {
    if (!passwordModal) return
    try {
      await passwordMutation.mutateAsync({ id: passwordModal.id, password: values.password })
      message.success('Parol o\'zgartirildi!')
      setPasswordModal(null)
      passwordForm.resetFields()
    } catch {
      message.error('Parol o\'zgartirishda xatolik')
    }
  }

  // Ruxsatlarni tahrirlash
  const openEdit = async (record: any) => {
    setEditDrawer(record)
    try {
      const sections = await loadPermissions(record.role)
      setEditSections(sections)
    } catch {
      setEditSections(new Set())
    }
  }

  const saveEdit = async () => {
    if (!editDrawer) return
    setEditSaving(true)
    try {
      await savePermissions(editDrawer.role, editSections)
      message.success(`${editDrawer.firstName || editDrawer.username} ruxsatlari saqlandi`)
      setEditDrawer(null)
    } catch {
      message.error('Saqlashda xato')
    } finally {
      setEditSaving(false)
    }
  }

  const staffList = staff || []
  const isAdmin = (role: string) => role === 'SUPER_ADMIN' || role === 'ADMIN'

  const columns = [
    {
      title: '#',
      key: 'idx',
      width: 45,
      render: (_: any, __: any, i: number) => i + 1,
    },
    {
      title: 'Hodim',
      key: 'name',
      render: (_: any, r: any) => (
        <div>
          <Text strong>{r.firstName || '—'} {r.lastName || ''}</Text>
          {r.username && <div><Text type="secondary" style={{ fontSize: 12 }}>@{r.username}</Text></div>}
        </div>
      ),
    },
    {
      title: 'Telefon',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (v: string) => v || '—',
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      width: 130,
      render: (role: string) => (
        <Tag color={isAdmin(role) ? 'red' : 'blue'}>
          {isAdmin(role) ? 'Admin' : 'Hodim'}
        </Tag>
      ),
    },
    {
      title: 'Holat',
      key: 'status',
      width: 80,
      render: (_: any, r: any) => (
        <Tag color={r.isActive ? 'green' : 'red'}>{r.isActive ? 'Faol' : 'Nofaol'}</Tag>
      ),
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 220,
      render: (_: any, r: any) => (
        <Space>
          {!isAdmin(r.role) && (
            <Button size="small" type="primary" icon={<SettingOutlined />} onClick={() => openEdit(r)}>
              Ruxsatlar
            </Button>
          )}
          <Button size="small" icon={<LockOutlined />} onClick={() => setPasswordModal({ id: r.id, username: r.username })}>
            Parol
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          <TeamOutlined style={{ marginRight: 8 }} />
          Hodimlar boshqaruvi
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModal(true)} size="large">
          Yangi hodim
        </Button>
      </Space>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card size="small"><Statistic title="Jami hodimlar" value={staffList.length} prefix={<TeamOutlined />} /></Card>
        </Col>
      </Row>

      <Card>
        <Table columns={columns} dataSource={staffList} rowKey="id" loading={isLoading} size="small" />
      </Card>

      {/* ═══════ YANGI HODIM YARATISH ═══════ */}
      <Modal
        title={<><PlusOutlined /> Yangi hodim yaratish</>}
        open={createModal}
        onCancel={() => { setCreateModal(false); createForm.resetFields(); setCreateSections(new Set()) }}
        footer={null}
        width={600}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="firstName" label="Ism" rules={[{ required: true, message: 'Ism kiriting' }]}>
                <Input placeholder="Ism" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastName" label="Familiya">
                <Input placeholder="Familiya" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="phoneNumber" label="Telefon raqam">
            <Input placeholder="+998901234567" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="username" label="Login" rules={[{ required: true, message: 'Login kiriting' }]}>
                <Input placeholder="masalan: hodim1" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="password" label="Parol" rules={[{ required: true, min: 4, message: 'Kamida 4 belgi' }]}>
                <Input.Password placeholder="Parol" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Ko'rish mumkin bo'lgan bo'limlar</Divider>
          <SectionCheckboxes selected={createSections} onChange={setCreateSections} />

          <Form.Item style={{ marginTop: 16 }}>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending} block size="large">
              Hodim yaratish
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* ═══════ PAROL O'ZGARTIRISH ═══════ */}
      <Modal
        title={`Parol o'zgartirish — ${passwordModal?.username || ''}`}
        open={!!passwordModal}
        onCancel={() => { setPasswordModal(null); passwordForm.resetFields() }}
        footer={null}
      >
        <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
          <Form.Item name="password" label="Yangi parol" rules={[{ required: true, min: 4, message: 'Kamida 4 belgi' }]}>
            <Input.Password placeholder="Yangi parol" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={passwordMutation.isPending} block>
              O'zgartirish
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* ═══════ RUXSATLAR TAHRIRLASH ═══════ */}
      <Drawer
        title={
          <Space>
            <SettingOutlined />
            <span>Ruxsatlar — {editDrawer?.firstName || editDrawer?.username || ''} {editDrawer?.lastName || ''}</span>
          </Space>
        }
        open={!!editDrawer}
        onClose={() => setEditDrawer(null)}
        width={480}
        extra={
          <Button type="primary" icon={<EditOutlined />} loading={editSaving} onClick={saveEdit}>
            Saqlash
          </Button>
        }
      >
        <SectionCheckboxes selected={editSections} onChange={setEditSections} />
      </Drawer>
    </div>
  )
}

export default StaffManagement
