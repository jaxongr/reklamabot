import { useState } from 'react'
import { Card, Row, Col, Statistic, DatePicker, Typography } from 'antd'
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  UserOutlined,
  ShopOutlined,
  SendOutlined,
} from '@ant-design/icons'
import styled from 'styled-components'
import dayjs from 'dayjs'
import { useDashboardStats } from '../../hooks/useApi'

const { Title } = Typography
const { RangePicker } = DatePicker

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`

const Analytics = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ])

  const { data, isLoading } = useDashboardStats({
    startDate: dateRange[0]?.format('YYYY-MM-DD'),
    endDate: dateRange[1]?.format('YYYY-MM-DD'),
  })

  const renderGrowth = (value: number | undefined) => {
    if (value === undefined) return '—'
    const isPositive = value >= 0
    const Icon = isPositive ? ArrowUpOutlined : ArrowDownOutlined
    const color = isPositive ? '#52c41a' : '#ff4d4f'
    return (
      <span style={{ fontSize: 24, fontWeight: 600, color }}>
        {isPositive ? '+' : ''}{value}% <Icon style={{ color }} />
      </span>
    )
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Title level={2}>Statistika va Analitika</Title>
        <RangePicker
          value={dateRange}
          onChange={(dates) => {
            if (dates && dates[0] && dates[1]) {
              setDateRange([dates[0], dates[1]])
            }
          }}
          format="DD/MM/YYYY"
        />
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <StyledCard loading={isLoading}>
            <Statistic
              title="Jami Foydalanuvchilar"
              value={data?.totalUsers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </StyledCard>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StyledCard loading={isLoading}>
            <Statistic
              title="Jami E'lonlar"
              value={data?.totalAds || 0}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </StyledCard>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StyledCard loading={isLoading}>
            <Statistic
              title="Tarqatishlar"
              value={data?.totalPosts || 0}
              prefix={<SendOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </StyledCard>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StyledCard loading={isLoading}>
            <Statistic
              title="Jami Daromad"
              value={data?.totalRevenue || 0}
              prefix={<DollarOutlined />}
              suffix=" UZS"
              precision={0}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </StyledCard>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <StyledCard title="O'sish Tendensiyalari" loading={isLoading}>
            <Row gutter={16}>
              <Col span={8}>
                <div>
                  <div style={{ fontSize: 14, color: '#8c8c8c' }}>
                    Foydalanuvchilar o'sishi
                  </div>
                  {renderGrowth(data?.trends?.users?.growth)}
                  {data?.trends?.users?.newUsers !== undefined && (
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                      {data.trends.users.newUsers} ta yangi
                    </div>
                  )}
                </div>
              </Col>

              <Col span={8}>
                <div>
                  <div style={{ fontSize: 14, color: '#8c8c8c' }}>
                    E'lonlar o'sishi
                  </div>
                  {renderGrowth(data?.trends?.ads?.growth)}
                  {data?.trends?.ads?.newAds !== undefined && (
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                      {data.trends.ads.newAds} ta yangi
                    </div>
                  )}
                </div>
              </Col>

              <Col span={8}>
                <div>
                  <div style={{ fontSize: 14, color: '#8c8c8c' }}>
                    Daromad o'sishi
                  </div>
                  {renderGrowth(data?.trends?.revenue?.growth)}
                  {data?.trends?.revenue?.periodRevenue !== undefined && (
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                      {data.trends.revenue.periodRevenue.toLocaleString()} UZS
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </StyledCard>
        </Col>
      </Row>
    </div>
  )
}

export default Analytics
