import { useQuery } from '@tanstack/react-query'
import { Table, Tag, Typography, Badge, Select } from 'antd'
// icons removed — unused
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/uz-latn'
import api from '../../services/api'
import { useState } from 'react'

dayjs.extend(relativeTime)
dayjs.locale('uz-latn')

const { Title } = Typography

interface OnlineUser {
  id: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  role: string
  isOnline: boolean
  lastOnlineAt: string | null
  deviceType?: string
  hasApp: boolean
  createdAt?: string
  activityMinutes: number
}

const roleColors: Record<string, string> = {
  SUPER_ADMIN: 'red', ADMIN: 'blue', DISPATCHER: 'green', DRIVER: 'orange', USER: 'default',
}
const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin', ADMIN: 'Admin', DISPATCHER: 'Dispetcher', DRIVER: 'Haydovchi', USER: 'Foydalanuvchi',
}

export default function OnlineUsers() {
  const [roleFilter, setRoleFilter] = useState<string>('')

  const { data: allUsers = [], isLoading } = useQuery<OnlineUser[]>({
    queryKey: ['users-online-status', roleFilter],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (roleFilter && roleFilter !== 'HAS_APP') params.role = roleFilter
      const res = await api.get('/users/online-status', { params })
      return res.data
    },
    refetchInterval: 15_000,
  })

  const users = roleFilter === 'HAS_APP' ? allUsers.filter(u => u.hasApp) : allUsers
  const onlineCount = allUsers.filter(u => u.isOnline).length
  const hasAppCount = allUsers.filter(u => u.hasApp).length

  const columns = [
    {
      title: 'Holat',
      key: 'status',
      width: 70,
      render: (_: any, r: OnlineUser) => (
        <Badge status={r.isOnline ? 'success' : 'default'} text={r.isOnline ? 'On' : 'Off'} />
      ),
      sorter: (a: OnlineUser, b: OnlineUser) => (a.isOnline ? -1 : 1) - (b.isOnline ? -1 : 1),
      defaultSortOrder: 'ascend' as const,
    },
    {
      title: 'Ism',
      key: 'name',
      ellipsis: true,
      render: (_: any, r: OnlineUser) => [r.firstName, r.lastName].filter(Boolean).join(' ') || '—',
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      width: 120,
      ellipsis: true,
      render: (p: string) => p || '—',
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      width: 90,
      render: (role: string) => <Tag color={roleColors[role]}>{roleLabels[role] || role}</Tag>,
    },
    {
      title: 'Ilova',
      key: 'hasApp',
      width: 70,
      filters: [
        { text: 'Bor', value: true },
        { text: 'Yo\'q', value: false },
      ],
      onFilter: (value: any, r: OnlineUser) => r.hasApp === value,
      render: (_: any, r: OnlineUser) => r.hasApp
        ? <Tag color="green">Bor</Tag>
        : <Tag>Yo'q</Tag>,
    },
    {
      title: 'Qurilma',
      key: 'device',
      width: 70,
      render: (_: any, r: OnlineUser) => {
        if (!r.isOnline || !r.deviceType) return '—'
        const icons: Record<string, string> = { mobile: '📱', driver: '🚛', dashboard: '💻' }
        return icons[r.deviceType] || r.deviceType
      },
    },
    {
      title: 'Bugun',
      key: 'activity',
      width: 80,
      sorter: (a: OnlineUser, b: OnlineUser) => a.activityMinutes - b.activityMinutes,
      render: (_: any, r: OnlineUser) => {
        if (!r.activityMinutes) return '—'
        const h = Math.floor(r.activityMinutes / 60)
        const m = r.activityMinutes % 60
        if (h === 0) return `${m} min`
        return `${h}s ${m}m`
      },
    },
    {
      title: 'Oxirgi',
      key: 'lastOnline',
      width: 100,
      defaultSortOrder: 'descend' as const,
      sorter: (a: OnlineUser, b: OnlineUser) => {
        if (a.isOnline && !b.isOnline) return 1
        if (!a.isOnline && b.isOnline) return -1
        const at = a.lastOnlineAt ? new Date(a.lastOnlineAt).getTime() : 0
        const bt = b.lastOnlineAt ? new Date(b.lastOnlineAt).getTime() : 0
        return at - bt
      },
      render: (_: any, r: OnlineUser) => {
        if (r.isOnline) return <Tag color="green">Hozir</Tag>
        if (!r.lastOnlineAt) return '—'
        return <span style={{ fontSize: 12 }}>{dayjs(r.lastOnlineAt).fromNow()}</span>
      },
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Title level={4} style={{ margin: 0 }}>Online foydalanuvchilar</Title>
        <Badge status="success" text={`Online: ${onlineCount}`} />
        <Badge status="processing" text={`Ilova: ${hasAppCount}`} />
        <Badge status="default" text={`Jami: ${users.length}`} />
        <Select value={roleFilter} onChange={setRoleFilter} style={{ width: 160 }}
          options={[
            { value: '', label: 'Barchasi' },
            { value: 'HAS_APP', label: 'Ilovasi borlar' },
            { value: 'DISPATCHER', label: 'Dispetcherlar' },
            { value: 'DRIVER', label: 'Haydovchilar' },
          ]}
        />
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={isLoading}
        size="small"
        pagination={{ pageSize: 50, size: 'small' }}
        style={{ width: '100%' }}
      />
    </div>
  )
}
