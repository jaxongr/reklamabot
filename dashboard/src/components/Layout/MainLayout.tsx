import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Typography, Space, Tag, Segmented } from 'antd'
import { useModule } from '../../contexts/ModuleContext'
import {
  DashboardOutlined,
  AppstoreOutlined,
  TeamOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  DollarOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  SendOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  StopOutlined,
  CarOutlined,
  BellOutlined,
  MessageOutlined,
  CustomerServiceOutlined,
  MobileOutlined,
  SafetyOutlined,
  TruckOutlined,
  PhoneOutlined,
  AccountBookOutlined,
  RobotOutlined,
} from '@ant-design/icons'
import styled from 'styled-components'
import { useAuthStore } from '../../stores/authStore'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const StyledLayout = styled(Layout)`
  min-height: 100vh;
`

const StyledHeader = styled(Header)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`

const StyledSider = styled(Sider)`
  background: #001529 !important;

  .ant-menu-dark .ant-menu-item-selected {
    background-color: #1890ff !important;
  }
`

const StyledContent = styled(Content)`
  margin: 24px;
  padding: 24px;
  background: #f0f2f5;
  border-radius: 8px;
  min-height: 280px;
  overflow: auto;
  max-width: calc(100vw - 280px);
`

// Logo removed — replaced by module selector

// Menyu elementlari — `section` field permission tekshirish uchun
const allMenuItems: any[] = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { type: 'divider' as const },
  {
    key: 'posting-group',
    icon: <SendOutlined />,
    label: "E'lon va tarqatish",
    sections: ['ads', 'posts', 'sessions', 'groups'],
    children: [
      { key: '/ads', icon: <AppstoreOutlined />, label: "E'lonlar", section: 'ads' },
      { key: '/posts', icon: <SendOutlined />, label: 'Tarqatish', section: 'posts' },
      { key: '/sessions', icon: <TeamOutlined />, label: 'Sessiyalar', section: 'sessions' },
      { key: '/groups', icon: <UserOutlined />, label: 'Guruhlar', section: 'groups' },
    ],
  },
  {
    key: 'orders-group',
    icon: <ShoppingCartOutlined />,
    label: 'Buyurtmalar',
    sections: ['orders', 'my-orders', 'accepted-orders', 'closed-deals', 'unique-phones'],
    children: [
      { key: '/orders', icon: <ShoppingCartOutlined />, label: 'Barcha buyurtmalar', section: 'orders' },
      { key: '/my-orders', icon: <ShoppingCartOutlined />, label: 'Mening buyurtmalarim', section: 'my-orders' },
      { key: '/accepted-orders', icon: <TruckOutlined />, label: 'Qabul qilinganlar', section: 'accepted-orders' },
      { key: '/closed-deals', icon: <CheckCircleOutlined />, label: 'Yopilgan yuklar', section: 'closed-deals' },
      { key: '/unique-phones', icon: <PhoneOutlined />, label: 'Unikal raqamlar', section: 'unique-phones' },
    ],
  },
  {
    key: 'monitor-group',
    icon: <EyeOutlined />,
    label: 'Monitoring',
    sections: ['monitor', 'blocked-users', 'telegram-sms', 'cargo-bot'],
    children: [
      { key: '/monitor', icon: <EyeOutlined />, label: 'Kuzatuv', section: 'monitor' },
      { key: '/blocked-users', icon: <StopOutlined />, label: 'Bloklangan', section: 'blocked-users' },
      { key: '/telegram-sms', icon: <SendOutlined />, label: 'Telegram SMS', section: 'telegram-sms' },
      { key: '/cargo-bot', icon: <RobotOutlined />, label: 'Yuk Bot', section: 'cargo-bot' },
    ],
  },
  { type: 'divider' as const },
  { key: '/drivers', icon: <CarOutlined />, label: 'Haydovchilar', section: 'drivers' },
  { key: '/locations', icon: <EnvironmentOutlined />, label: 'Lokatsiyalar', section: 'locations' },
  {
    key: 'users-group',
    icon: <UsergroupAddOutlined />,
    label: 'Foydalanuvchilar',
    sections: ['users', 'online-users', 'payments', 'accounting'],
    children: [
      { key: '/users', icon: <UsergroupAddOutlined />, label: 'Ro\'yxat', section: 'users' },
      { key: '/online-users', icon: <UserOutlined />, label: 'Online status', section: 'online-users' },
      { key: '/dispatchers/map', icon: <EnvironmentOutlined />, label: 'Dispetcherlar Xarita', adminOnly: true },
      { key: '/payments', icon: <DollarOutlined />, label: "To'lovlar", section: 'payments' },
      { key: '/accounting', icon: <AccountBookOutlined />, label: 'Buxgalteriya', section: 'accounting' },
    ],
  },
  {
    key: 'comm-group',
    icon: <MessageOutlined />,
    label: 'Kommunikatsiya',
    sections: ['chat', 'support', 'notifications'],
    children: [
      { key: '/notifications', icon: <BellOutlined />, label: 'Bildirishnomalar', section: 'notifications' },
      { key: '/chat', icon: <MessageOutlined />, label: 'Chat', section: 'chat' },
      { key: '/support', icon: <CustomerServiceOutlined />, label: 'Texpomish', section: 'support' },
    ],
  },
  { type: 'divider' as const },
  {
    key: 'yolda-group',
    icon: <PhoneOutlined />,
    label: "Yo'lda Dispatcher",
    sections: ['users'],
    children: [
      { key: '/yolda/dispatchers', icon: <UserOutlined />, label: 'Dispatcherlar', section: 'users' },
      { key: '/yolda/geozones', icon: <EnvironmentOutlined />, label: 'Geo zonalar', section: 'users' },
      { key: '/yolda/calls', icon: <PhoneOutlined />, label: "Qo'ng'iroqlar", section: 'users' },
      { key: '/yolda/blocklist', icon: <StopOutlined />, label: 'Bloklangan raqamlar', section: 'users' },
      { key: '/yolda/requests', icon: <TeamOutlined />, label: "So'rovlar", section: 'users' },
    ],
  },
  { type: 'divider' as const },
  {
    key: 'analytics-group',
    icon: <BarChartOutlined />,
    label: 'Statistika',
    sections: ['analytics'],
    children: [
      { key: '/analytics', label: 'Umumiy', section: 'analytics' },
      { key: '/analytics/routes', label: "Yo'nalishlar", section: 'analytics' },
      { key: '/analytics/vehicle-types', label: 'Mashina turlari', section: 'analytics' },
      { key: '/analytics/day-routes', label: "Kun-yo'nalish", section: 'analytics' },
      { key: '/analytics/top-groups', label: 'Top guruhlar', section: 'analytics' },
      { key: '/analytics/top-phones', label: 'Top raqamlar', section: 'analytics' },
      { key: '/analytics/session-stats', label: 'Session stats', section: 'analytics' },
      { key: '/analytics/sender-retention', label: 'Yangi vs Qaytgan', section: 'analytics' },
      { key: '/analytics/spam-detection', label: 'Spam deteksiya', section: 'analytics' },
      { key: '/analytics/group-efficiency', label: 'Guruh samaradorligi', section: 'analytics' },
      { key: '/analytics/user-activity', label: 'Foydalanuvchi faolligi', section: 'analytics' },
      { key: '/analytics/price-estimate', label: 'Narx taxmini', section: 'analytics' },
      { key: '/analytics/export', label: 'Eksport', section: 'analytics' },
    ],
  },
  {
    key: 'settings-group',
    icon: <SettingOutlined />,
    label: 'Sozlamalar',
    sections: ['settings', 'sms'],
    children: [
      { key: '/settings', label: 'Umumiy', section: 'settings' },
      { key: '/staff', label: 'Hodimlar', section: 'settings' },
      { key: '/sms', icon: <MobileOutlined />, label: 'SMS', section: 'sms' },
      { key: '/roles', icon: <SafetyOutlined />, label: 'Rollar', section: 'settings' },
    ],
  },
]

// Taksi moduli menyusi
const taksiMenuItems: any[] = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { type: 'divider' as const },
  {
    key: 'taksi-orders-group',
    icon: <ShoppingCartOutlined />,
    label: "Yo'lovchilar",
    children: [
      { key: '/orders', icon: <ShoppingCartOutlined />, label: "Barcha yo'lovchilar", section: 'orders' },
      { key: '/my-orders', icon: <ShoppingCartOutlined />, label: 'Mening mijozlarim', section: 'my-orders' },
      { key: '/accepted-orders', icon: <TruckOutlined />, label: 'Qabul qilinganlar', section: 'accepted-orders' },
      { key: '/unique-phones', icon: <PhoneOutlined />, label: 'Unikal raqamlar', section: 'unique-phones' },
    ],
  },
  {
    key: 'taksi-monitor-group',
    icon: <EyeOutlined />,
    label: 'Monitoring',
    children: [
      { key: '/monitor', icon: <EyeOutlined />, label: 'Kuzatuv', section: 'monitor' },
      { key: '/blocked-users', icon: <StopOutlined />, label: 'Bloklangan', section: 'blocked-users' },
    ],
  },
  { type: 'divider' as const },
  { key: '/drivers', icon: <CarOutlined />, label: 'Haydovchilar', section: 'drivers' },
  {
    key: 'taksi-analytics-group',
    icon: <BarChartOutlined />,
    label: 'Statistika',
    children: [
      { key: '/analytics', label: 'Umumiy', section: 'analytics' },
      { key: '/analytics/routes', label: "Yo'nalishlar", section: 'analytics' },
      { key: '/analytics/user-activity', label: 'Foydalanuvchi faolligi', section: 'analytics' },
    ],
  },
  {
    key: 'taksi-settings-group',
    icon: <SettingOutlined />,
    label: 'Sozlamalar',
    children: [
      { key: '/settings', label: 'Umumiy', section: 'settings' },
      { key: '/staff', label: 'Hodimlar', section: 'settings' },
    ],
  },
]

// Permission asosida menyu filtrlash
function filterMenuByPermissions(items: any[], allowedSections: Set<string>, isAdmin: boolean): any[] {
  if (isAdmin) return items // Admin/Super Admin hamma narsani ko'radi

  return items
    .map(item => {
      if (item.type === 'divider') return item
      // adminOnly — faqat admin ko'radi (non-admin bo'lgan bu joyga kirib, olib tashlaymiz)
      if (item.adminOnly) return null
      // Oddiy element
      if (item.section && !allowedSections.has(item.section)) return null
      // Guruh — children'larni filtrlash
      if (item.children) {
        const filteredChildren = item.children.filter((c: any) => {
          if (c.adminOnly) return false
          return !c.section || allowedSections.has(c.section)
        })
        if (filteredChildren.length === 0) return null
        return { ...item, children: filteredChildren }
      }
      return item
    })
    .filter(Boolean)
}

const roleLabels: Record<string, { label: string; color: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', color: 'red' },
  ADMIN: { label: 'Admin', color: 'blue' },
  DISPATCHER: { label: 'Dispetcher', color: 'green' },
  DRIVER: { label: 'Haydovchi', color: 'orange' },
  USER: { label: 'Foydalanuvchi', color: 'default' },
}

const MainLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'

  // Foydalanuvchi ruxsatlarini olish
  const { data: permsData } = useQuery({
    queryKey: ['my-permissions', user?.role],
    queryFn: async () => {
      if (isAdmin) return { sections: 'ALL' }
      try {
        const res = await api.get('/auth/permissions/my')
        return res.data
      } catch { return { sections: [] } }
    },
    staleTime: 5 * 60_000,
    enabled: !!user?.role,
  })

  // Ruxsat berilgan seksiyalar
  const allowedSections = new Set<string>()
  if (permsData?.sections === 'ALL') {
    // Admin — hamma narsa
  } else if (Array.isArray(permsData?.sections)) {
    for (const s of permsData.sections) {
      allowedSections.add(s)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const displayName = (user?.firstName || user?.username || 'Foydalanuvchi').slice(0, 15)
  const roleInfo = roleLabels[user?.role || 'USER']
  const { isTaksi, module, setModule } = useModule()

  // Permission asosida menyu filtrlash — modul bo'yicha (LOGISTIKA / TAKSI)
  const isFullAccess = isAdmin || permsData?.sections === 'ALL'
  const baseMenu = isTaksi ? taksiMenuItems : allMenuItems
  const menuItems = filterMenuByPermissions(baseMenu, allowedSections, isFullAccess)

  const defaultOpenKeys: string[] = []
  const path = location.pathname
  if (['/ads', '/posts', '/sessions', '/groups'].some(p => path.startsWith(p))) {
    defaultOpenKeys.push('posting-group')
  } else if (['/orders', '/my-orders', '/accepted-orders', '/closed-deals', '/unique-phones'].some(p => path.startsWith(p))) {
    defaultOpenKeys.push('orders-group')
  } else if (['/monitor', '/blocked-users', '/telegram-sms'].some(p => path.startsWith(p))) {
    defaultOpenKeys.push('monitor-group')
  } else if (['/users', '/payments', '/online-users', '/accounting'].some(p => path.startsWith(p))) {
    defaultOpenKeys.push('users-group')
  } else if (['/notifications', '/chat', '/support'].some(p => path.startsWith(p))) {
    defaultOpenKeys.push('comm-group')
  } else if (path.startsWith('/analytics')) {
    defaultOpenKeys.push('analytics-group')
  } else if (['/settings', '/sms', '/roles', '/staff'].some(p => path.startsWith(p))) {
    defaultOpenKeys.push('settings-group')
  }

  const menuItemsWithLogout = [
    ...menuItems,
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Chiqish',
      onClick: handleLogout,
    },
  ]

  const userMenuItems = [
    { key: 'profile', label: 'Profil', onClick: () => navigate('/settings') },
    { key: 'logout', label: 'Chiqish', onClick: handleLogout },
  ]

  return (
    <StyledLayout>
      <StyledSider width={256} theme="dark">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', color: '#fff', fontSize: 20, fontWeight: 600 }}>
          {isTaksi ? 'Taksi Pro' : 'Logistika Pro'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={defaultOpenKeys}
          items={menuItemsWithLogout}
          onClick={({ key }) => {
            if (key !== 'logout') {
              navigate(key)
            }
          }}
        />
      </StyledSider>
      <Layout>
        <StyledHeader>
          <Segmented
            value={module}
            onChange={(v) => { setModule(v as 'LOGISTIKA' | 'TAKSI'); navigate('/dashboard') }}
            options={[
              { label: '🚚 Logistika', value: 'LOGISTIKA' },
              { label: '🚕 Taksi', value: 'TAKSI' },
            ]}
          />
          <Space size="middle">
            <Tag color={roleInfo.color}>{roleInfo.label}</Tag>
            <Text strong>{displayName}</Text>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Avatar
                style={{ cursor: 'pointer', backgroundColor: '#1890ff' }}
                icon={<UserOutlined />}
              />
            </Dropdown>
          </Space>
        </StyledHeader>
        <StyledContent>
          <Outlet />
        </StyledContent>
      </Layout>
    </StyledLayout>
  )
}

export default MainLayout
