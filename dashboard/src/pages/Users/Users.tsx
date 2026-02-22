import { useState } from 'react'
import { Table, Card, Typography, Tag, Button, Input, Select, message, Modal, Badge } from 'antd'
import {
  SearchOutlined,
  UserOutlined,
  LockOutlined,
  UnlockOutlined,
} from '@ant-design/icons'
import styled from 'styled-components'
import { useUsers, useUpdateUserRole, useToggleUserActive } from '../../hooks/useApi'
import type { User, UserRole } from '../../types'

const { Title } = Typography

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

const roleOptions: Array<{ value: UserRole; label: string; color: string }> = [
  { value: 'SUPER_ADMIN', label: 'Super Admin', color: 'red' },
  { value: 'ADMIN', label: 'Admin', color: 'blue' },
  { value: 'DISPATCHER', label: 'Dispetcher', color: 'green' },
  { value: 'USER', label: 'Foydalanuvchi', color: 'default' },
]

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
      key: 'name',
      width: 180,
      render: (_: unknown, record: User) => {
        const name = [record.firstName, record.lastName].filter(Boolean).join(' ')
        return name || '—'
      },
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: 150,
      render: (username: string) => username ? `@${username}` : '—',
    },
    {
      title: 'Telefon',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 150,
      render: (phone: string) => phone || '—',
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      width: 160,
      render: (role: UserRole, record: User) => (
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
      width: 120,
      render: (_: unknown, record: User) => (
        <Badge
          status={record.isActive ? 'success' : 'error'}
          text={record.isActive ? 'Faol' : 'Bloklangan'}
        />
      ),
    },
    {
      title: 'Yaratilgan',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => new Date(date).toLocaleDateString('uz-UZ'),
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: User) => (
        <Button
          size="small"
          danger={record.isActive}
          type={record.isActive ? 'default' : 'primary'}
          icon={record.isActive ? <LockOutlined /> : <UnlockOutlined />}
          onClick={() => handleToggleActive(record)}
          loading={toggleActiveMutation.isPending}
        >
          {record.isActive ? 'Bloklash' : 'Ochish'}
        </Button>
      ),
    },
  ]

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
          pagination={{
            current: page,
            pageSize,
            total: data?.meta?.total || 0,
            onChange: setPage,
            showTotal: (total) => `Jami: ${total} foydalanuvchi`,
            showSizeChanger: false,
          }}
          scroll={{ x: 1200 }}
        />
      </StyledCard>
    </div>
  )
}

export default Users
