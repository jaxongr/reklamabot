import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Typography, Space, Tag } from 'antd'
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
} from '@ant-design/icons'
import styled from 'styled-components'
import { useAuthStore } from '../../stores/authStore'

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
`

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
`

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/ads', icon: <AppstoreOutlined />, label: "E'lonlar" },
  { key: '/sessions', icon: <TeamOutlined />, label: 'Sessiyalar' },
  { key: '/groups', icon: <UserOutlined />, label: 'Guruhlar' },
  { key: '/posts', icon: <SendOutlined />, label: 'Tarqatish' },
  { key: '/users', icon: <UsergroupAddOutlined />, label: 'Foydalanuvchilar' },
  { key: '/payments', icon: <DollarOutlined />, label: "To'lovlar" },
  { key: '/analytics', icon: <BarChartOutlined />, label: 'Statistika' },
  { key: '/settings', icon: <SettingOutlined />, label: 'Sozlamalar' },
]

const roleLabels: Record<string, { label: string; color: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', color: 'red' },
  ADMIN: { label: 'Admin', color: 'blue' },
  DISPATCHER: { label: 'Dispetcher', color: 'green' },
  USER: { label: 'Foydalanuvchi', color: 'default' },
}

const MainLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const displayName = user?.firstName || user?.username || 'Foydalanuvchi'
  const roleInfo = roleLabels[user?.role || 'USER']

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
        <Logo style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 24px' }}>
          Reklama Bot
        </Logo>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
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
          <div />
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
