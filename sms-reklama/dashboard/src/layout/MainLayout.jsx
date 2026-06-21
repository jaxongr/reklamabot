import { Layout, Menu, Avatar, Dropdown, Typography } from 'antd'
import {
  DashboardOutlined, MobileOutlined, PhoneOutlined,
  SendOutlined, SettingOutlined, LogoutOutlined, UserOutlined, FileTextOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { logout } from '../api'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Boshqaruv' },
  { key: '/sessions', icon: <MobileOutlined />, label: 'Sessiyalar' },
  { key: '/phones', icon: <PhoneOutlined />, label: 'Raqamlar' },
  { key: '/sms', icon: <SendOutlined />, label: 'SMS yuborish' },
  { key: '/logs', icon: <FileTextOutlined />, label: 'SMS loglari' },
  { key: '/settings', icon: <SettingOutlined />, label: 'Sozlamalar' },
]

export default function MainLayout() {
  const nav = useNavigate()
  const loc = useLocation()
  const current = menuItems.find((m) => m.key === loc.pathname)

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={230} style={{ background: '#001529' }} breakpoint="lg" collapsedWidth={60}>
        <div style={{ height: 60, display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', color: '#fff', fontWeight: 700, fontSize: 16, borderBottom: '1px solid #ffffff14' }}>
          <span style={{ width: 28, height: 28, borderRadius: 6, background: '#1890ff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>📡</span>
          SMS Reklama
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[loc.pathname]}
          items={menuItems}
          onClick={(e) => nav(e.key)}
          style={{ background: '#001529' }}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', boxShadow: '0 1px 4px #00000012' }}>
          <Typography.Title level={4} style={{ margin: 0 }}>{current ? current.label : 'Boshqaruv'}</Typography.Title>
          <Dropdown
            menu={{ items: [{ key: 'out', icon: <LogoutOutlined />, label: 'Chiqish', onClick: logout }] }}
          >
            <span style={{ cursor: 'pointer' }}>
              <Avatar style={{ background: '#1890ff' }} icon={<UserOutlined />} /> <span style={{ marginLeft: 8 }}>Admin</span>
            </span>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, background: '#f0f2f5' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
