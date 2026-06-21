import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, Row, Col, Statistic, Select, Typography, Space, Tag, Spin } from 'antd'
import {
  UserOutlined, TeamOutlined, ClockCircleOutlined,
  RiseOutlined, CarOutlined, TruckOutlined,
} from '@ant-design/icons'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import api from '../../services/api'

const { Title } = Typography

const UserActivity = () => {
  const [days, setDays] = useState(30)

  const { data, isLoading } = useQuery({
    queryKey: ['user-activity', days],
    queryFn: async () => {
      const res = await api.get('/analytics/user-activity', { params: { days } })
      return res.data as {
        summary: {
          nowOnline: number
          nowDispatchers: number
          nowDrivers: number
          totalRegistered: number
          totalActiveWeek: number
          activeUsersToday: number
          avgMinutesToday: number
        }
        daily: Array<{
          date: string
          onlineUsers: number
          dispatchers: number
          drivers: number
          admins: number
          orderCount: number
          cargoCount: number
          driverCount: number
        }>
      }
    },
    refetchInterval: 60_000,
  })

  const s = data?.summary
  const daily = data?.daily || []

  // Grafik uchun qisqa sana format
  const chartData = daily.map(d => ({
    ...d,
    date: d.date.slice(5), // "03-28" formatda
  }))

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  }

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          <TeamOutlined style={{ marginRight: 8 }} />
          Foydalanuvchi faolligi
        </Title>
        <Select value={days} onChange={setDays} style={{ width: 160 }} options={[
          { value: 7, label: 'Oxirgi 7 kun' },
          { value: 14, label: 'Oxirgi 14 kun' },
          { value: 30, label: 'Oxirgi 30 kun' },
          { value: 60, label: 'Oxirgi 60 kun' },
        ]} />
      </Space>

      {/* Statistika kartalar */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Hozir online"
              value={s?.nowOnline || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix={<Tag color="green" style={{ marginLeft: 4, fontSize: 10 }}>LIVE</Tag>}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="Dispetcherlar" value={s?.nowDispatchers || 0} prefix={<TruckOutlined />} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="Haydovchilar" value={s?.nowDrivers || 0} prefix={<CarOutlined />} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="Bugun faol" value={s?.activeUsersToday || 0} prefix={<RiseOutlined />} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="O'rtacha vaqt"
              value={s?.avgMinutesToday || 0}
              suffix="min"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="Haftalik faol" value={s?.totalActiveWeek || 0} suffix={`/ ${s?.totalRegistered || 0}`} />
          </Card>
        </Col>
      </Row>

      {/* Grafik 1: Ilovaga kirgan foydalanuvchilar */}
      <Card title="Kunlik ilovaga kirgan foydalanuvchilar" style={{ marginBottom: 24 }}>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" style={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="onlineUsers" name="Jami foydalanuvchilar" stroke="#1677ff" fill="#1677ff" fillOpacity={0.15} strokeWidth={2} />
            <Area type="monotone" dataKey="dispatchers" name="Dispetcherlar" stroke="#52c41a" fill="#52c41a" fillOpacity={0.1} strokeWidth={2} />
            <Area type="monotone" dataKey="drivers" name="Haydovchilar" stroke="#fa8c16" fill="#fa8c16" fillOpacity={0.1} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Grafik 2 + 3 */}
      <Row gutter={24}>
        <Col span={14}>
          <Card title="Dispetcherlar vs Haydovchilar (kunlik)" style={{ marginBottom: 24 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" style={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="dispatchers" name="Dispetcherlar" fill="#1677ff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="drivers" name="Haydovchilar" fill="#52c41a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={10}>
          <Card title="Kunlik buyurtmalar" style={{ marginBottom: 24 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" style={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cargoCount" name="Yuk" fill="#722ed1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="driverCount" name="Haydovchi" fill="#13c2c2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default UserActivity
