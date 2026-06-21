import { useState } from 'react'
import { Table, Card, Typography, Tag, Button, Input, Select, message, Modal, Badge, Space, Tooltip } from 'antd'
import {
  SearchOutlined,
  UserOutlined,
  LockOutlined,
  UnlockOutlined,
  MobileOutlined,
  TeamOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import styled from 'styled-components'
import { useUsers, useUpdateUserRole, useToggleUserActive } from '../../hooks/useApi'
import type { User, UserRole } from '../../types'

const { Title, Text } = Typography

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`

const FiltersRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`

const SessionCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
`

const roleOptions: Array<{ value: UserRole; label: string; color: string }> = [
  { value: 'SUPER_ADMIN', label: 'Super Admin', color: 'red' },
  { value: 'ADMIN', label: 'Admin', color: 'blue' },
  { value: 'DISPATCHER', label: 'Dispetcher', color: 'green' },
  { value: 'USER', label: 'Foydalanuvchi', color: 'default' },
]

const sessionStatusColors: Record<string, string> = {
  ACTIVE: 'green',
  INACTIVE: 'orange',
  FROZEN: 'blue',
  BANNED: 'red',
  DELETED: 'default',
}

const sessionStatusLabels: Record<string, string> = {
  ACTIVE: 'Faol',
  INACTIVE: 'Nofaol',
  FROZEN: 'Muzlatilgan',
  BANNED: 'Bloklangan',
  DELETED: "O'chirilgan",
}

interface UserSession {
  id: string
  name: string | null
  phone: string | null
  status: string
  isFrozen: boolean
  totalGroups: number
  activeGroups: number
  lastSyncAt: string | null
  createdAt: string
}

interface UserWithSessions extends User {
  sessions?: UserSession[]
  _count?: { ads: number; sessions: number; payments: number }
  subscription?: { planType: string; status: string; endDate: string | null } | null
}

const Users = () => {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)
  const pageSize = 15

  const { data, isLoading } = useUsers({
    search: search || undefined,
    role: roleFilter,
    skip: (page - 1) * pageSize,
    take: pageSize,
  })
  const updateRoleMutation = useUpdateUserRole()
  const toggleActiveMutation = useToggleUserActive()

  const handleRoleChange = (userId: string, newRole: string) => {
    Modal.confirm({
      title: "Rolni o'zgartirish",
      content: `Foydalanuvchi rolini "${roleOptions.find(r => r.value === newRole)?.label}" ga o'zgartirmoqchimisiz?`,
      okText: "Ha, o'zgartirish",
      cancelText: 'Bekor qilish',
      onOk: async () => {
        try {
          await updateRoleMutation.mutateAsync({ id: userId, role: newRole })
          message.success("Rol muvaffaqiyatli o'zgartirildi")
        } catch {
          message.error('Xatolik yuz berdi')
        }
      },
    })
  }

  const handleToggleActive = (user: User) => {
    const action = user.isActive ? 'bloklash' : 'faollashtirish'
    Modal.confirm({
      title: `Foydalanuvchini ${action}`,
      content: `${user.firstName || user.username || 'Foydalanuvchi'}ni ${action}moqchimisiz?`,
      okText: `Ha, ${action}`,
      okType: user.isActive ? 'danger' : 'primary',
      cancelText: 'Bekor qilish',
      onOk: async () => {
        try {
          await toggleActiveMutation.mutateAsync(user.id)
          message.success(`Foydalanuvchi ${user.isActive ? 'bloklandi' : 'faollashtirildi'}`)
        } catch {
          message.error('Xatolik yuz berdi')
        }
      },
    })
  }

  const columns = [
    {
      title: 'Telegram ID',
      dataIndex: 'telegramId',
      key: 'telegramId',
      width: 120,
      render: (id: string) => <span style={{ fontFamily: 'monospace' }}>{id}</span>,
    },
    {
      title: 'Ism',
      dataIndex: 'firstName',
      key: 'firstName',
      width: 120,
      ellipsis: true,
      render: (v: string) => <Tooltip title={v}>{v ? v.slice(0, 15) : '—'}</Tooltip>,
    },
    {
      title: 'Familiya',
      dataIndex: 'lastName',
      key: 'lastName',
      width: 120,
      ellipsis: true,
      render: (v: string) => <Tooltip title={v}>{v ? v.slice(0, 15) : '—'}</Tooltip>,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: 130,
      ellipsis: true,
      render: (username: string) => username ? <Tooltip title={`@${username}`}>@{username.slice(0, 15)}</Tooltip> : '—',
    },
    {
      title: 'Telefon',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 140,
      render: (phone: string) => phone || '—',
    },
    {
      title: 'Jins',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      render: (gender: string) => {
        if (gender === 'MALE') return <Tag color="blue">Erkak</Tag>
        if (gender === 'FEMALE') return <Tag color="pink">Ayol</Tag>
        return <Tag color="default">—</Tag>
      },
    },
    {
      title: 'Sessionlar',
      key: 'sessions',
      width: 120,
      render: (_: unknown, record: UserWithSessions) => {
        const sessions = record.sessions || []
        const activeSessions = sessions.filter(s => s.status === 'ACTIVE')
        const totalGroups = sessions.reduce((sum, s) => sum + (s.totalGroups || 0), 0)

        if (sessions.length === 0) {
          return <Tag color="default">Yo'q</Tag>
        }

        return (
          <Space direction="vertical" size={0}>
            <Tooltip title={`${activeSessions.length} faol / ${sessions.length} jami`}>
              <Tag color={activeSessions.length > 0 ? 'green' : 'orange'} icon={<MobileOutlined />}>
                {activeSessions.length}/{sessions.length}
              </Tag>
            </Tooltip>
            <Tooltip title="Jami guruhlar">
              <Tag color="blue" icon={<TeamOutlined />} style={{ marginTop: 2 }}>
                {totalGroups} guruh
              </Tag>
            </Tooltip>
          </Space>
        )
      },
    },
    {
      title: 'Obuna',
      key: 'subscription',
      width: 120,
      render: (_: unknown, record: UserWithSessions) => {
        const sub = record.subscription
        if (!sub) return <Tag color="default">Yo'q</Tag>

        const isActive = sub.status === 'ACTIVE'
        return (
          <Space direction="vertical" size={0}>
            <Tag color={isActive ? 'green' : 'red'}>{sub.planType}</Tag>
            {sub.endDate && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                {new Date(sub.endDate).toLocaleDateString('uz-UZ')}
              </Text>
            )}
          </Space>
        )
      },
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      width: 160,
      render: (role: UserRole, record: UserWithSessions) => (
        <Select
          value={role}
          size="small"
          style={{ width: 140 }}
          onChange={(value) => handleRoleChange(record.id, value)}
          loading={updateRoleMutation.isPending}
          options={roleOptions.map(r => ({
            value: r.value,
            label: <Tag color={r.color}>{r.label}</Tag>,
          }))}
        />
      ),
    },
    {
      title: 'Holat',
      key: 'status',
      width: 100,
      render: (_: unknown, record: UserWithSessions) => (
        <Badge
          status={record.isActive ? 'success' : 'error'}
          text={record.isActive ? 'Faol' : 'Blok'}
        />
      ),
    },
    {
      title: 'Sana',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 100,
      render: (date: string) => new Date(date).toLocaleDateString('uz-UZ'),
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: UserWithSessions) => (
        <Button
          size="small"
          danger={record.isActive}
          type={record.isActive ? 'default' : 'primary'}
          icon={record.isActive ? <LockOutlined /> : <UnlockOutlined />}
          onClick={() => handleToggleActive(record)}
          loading={toggleActiveMutation.isPending}
        >
          {record.isActive ? 'Blok' : 'Ochish'}
        </Button>
      ),
    },
  ]

  const expandedRowRender = (record: UserWithSessions) => {
    const sessions = record.sessions || []

    if (sessions.length === 0) {
      return <Text type="secondary">Bu foydalanuvchida sessionlar yo'q</Text>
    }

    return (
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <Text strong>
          <MobileOutlined style={{ marginRight: 4 }} />
          Sessionlar ({sessions.length} ta)
        </Text>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {sessions.map((s) => (
            <SessionCard key={s.id}>
              <div>
                <Text strong style={{ fontSize: 13 }}>
                  {s.name || s.phone || s.id.slice(0, 8)}
                </Text>
                {s.phone && (
                  <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                    {s.phone}
                  </Text>
                )}
              </div>
              <Tag color={sessionStatusColors[s.status] || 'default'}>
                {sessionStatusLabels[s.status] || s.status}
              </Tag>
              <Tooltip title="Faol / Jami guruhlar">
                <Tag icon={<TeamOutlined />} color="processing">
                  {s.activeGroups}/{s.totalGroups}
                </Tag>
              </Tooltip>
              {s.isFrozen && <Tag color="blue" icon={<LockOutlined />}>Muzlatilgan</Tag>}
              {s.lastSyncAt && (
                <Tooltip title={`Oxirgi sinxron: ${new Date(s.lastSyncAt).toLocaleString('uz-UZ')}`}>
                  <SyncOutlined style={{ color: '#1890ff', fontSize: 12 }} />
                </Tooltip>
              )}
            </SessionCard>
          ))}
        </div>
      </Space>
    )
  }

  return (
    <div>
      <Title level={2}>
        <UserOutlined style={{ marginRight: 8 }} />
        Foydalanuvchilar
      </Title>

      <StyledCard>
        <FiltersRow>
          <Input
            placeholder="Qidirish (ism, username, telefon)..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            placeholder="Rol bo'yicha filter"
            value={roleFilter}
            onChange={value => { setRoleFilter(value); setPage(1) }}
            allowClear
            style={{ width: 200 }}
            options={[
              { value: undefined, label: 'Barchasi' },
              ...roleOptions.map(r => ({ value: r.value, label: r.label })),
            ]}
          />
        </FiltersRow>

        <Table
          columns={columns}
          dataSource={data?.data || []}
          loading={isLoading}
          rowKey="id"
          expandable={{
            expandedRowRender,
            rowExpandable: (record: UserWithSessions) => (record.sessions?.length || 0) > 0,
          }}
          pagination={{
            current: page,
            pageSize,
            total: data?.meta?.total || 0,
            onChange: setPage,
            showTotal: (total) => `Jami: ${total} foydalanuvchi`,
            showSizeChanger: false,
          }}
          scroll={{ x: 1300 }}
          size="middle"
        />
      </StyledCard>
    </div>
  )
}

export default Users
