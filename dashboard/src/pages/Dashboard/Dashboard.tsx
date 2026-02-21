import { Row, Col, Card, Statistic, Typography, Space, Skeleton, Button } from 'antd'
import { AppstoreOutlined, SendOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useDashboardStats } from '../../hooks/useApi'

const { Title } = Typography

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`

const GradientCard = styled(StyledCard)<{ $gradient: string }>`
  background: linear-gradient(135deg, ${(props) => props.$gradient});
  border: none;

  .ant-statistic-title {
    color: rgba(255, 255, 255, 0.9);
  }

  .ant-statistic-content {
    color: #ffffff;
  }
`

const Dashboard = () => {
  const navigate = useNavigate()
  const { data, isLoading } = useDashboardStats()

  if (isLoading) {
    return (
      <div>
        <Title level={2} style={{ marginBottom: 24 }}>Dashboard</Title>
        <Row gutter={[24, 24]}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <StyledCard><Skeleton active paragraph={{ rows: 1 }} /></StyledCard>
            </Col>
          ))}
        </Row>
      </div>
    )
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>Dashboard</Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <GradientCard $gradient="#667eea 0%, #764ba2 100%">
            <Statistic
              title="Jami Foydalanuvchilar"
              value={data?.totalUsers || 0}
              suffix="ta"
              valueStyle={{ color: '#fff' }}
            />
          </GradientCard>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <GradientCard $gradient="#f093fb 0%, #f5576c 100%">
            <Statistic
              title="Faol Foydalanuvchilar"
              value={data?.activeUsers || 0}
              suffix="ta"
              valueStyle={{ color: '#fff' }}
            />
          </GradientCard>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <GradientCard $gradient="#4facfe 0%, #00f2fe 100%">
            <Statistic
              title="Jami E'lonlar"
              value={data?.totalAds || 0}
              suffix="ta"
              valueStyle={{ color: '#fff' }}
            />
          </GradientCard>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <GradientCard $gradient="#43e97b 0%, #38f9d7 100%">
            <Statistic
              title="Faol E'lonlar"
              value={data?.activeAds || 0}
              suffix="ta"
              valueStyle={{ color: '#fff' }}
            />
          </GradientCard>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <GradientCard $gradient="#fa709a 0%, #fee140 100%">
            <Statistic
              title="Jami Tarqatishlar"
              value={data?.totalPosts || 0}
              suffix="ta"
              valueStyle={{ color: '#fff' }}
            />
          </GradientCard>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <GradientCard $gradient="#30cfd0 0%, #330867 100%">
            <Statistic
              title="Muvaffaqiyatli"
              value={data?.successRate || 0}
              suffix="%"
              valueStyle={{ color: '#fff' }}
            />
          </GradientCard>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <GradientCard $gradient="#a8edea 0%, #fed6e3 100%">
            <Statistic
              title="Jami Daromad"
              value={data?.totalRevenue || 0}
              suffix=" UZS"
              valueStyle={{ color: '#333' }}
            />
          </GradientCard>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <GradientCard $gradient="#ff9a9e 0%, #fecfef 100%">
            <Statistic
              title="Kutilayotgan To'lovlar"
              value={data?.pendingPayments || 0}
              suffix="ta"
              valueStyle={{ color: '#333' }}
            />
          </GradientCard>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <StyledCard title="So'ngi Oy Statistikasi" extra={<a href="/analytics">Batafsil</a>}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <div style={{ fontSize: 14, color: '#8c8c8c' }}>Yangi foydalanuvchilar</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: data?.trends?.users?.growth && data.trends.users.growth >= 0 ? '#52c41a' : '#ff4d4f' }}>
                  {data?.trends?.users?.growth !== undefined
                    ? `${data.trends.users.growth >= 0 ? '+' : ''}${data.trends.users.growth}%`
                    : '—'
                  }
                  {data?.trends?.users?.newUsers !== undefined && ` (${data.trends.users.newUsers} ta)`}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 14, color: '#8c8c8c' }}>Yangi e'lonlar</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: data?.trends?.ads?.growth && data.trends.ads.growth >= 0 ? '#52c41a' : '#ff4d4f' }}>
                  {data?.trends?.ads?.growth !== undefined
                    ? `${data.trends.ads.growth >= 0 ? '+' : ''}${data.trends.ads.growth}%`
                    : '—'
                  }
                  {data?.trends?.ads?.newAds !== undefined && ` (${data.trends.ads.newAds} ta)`}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 14, color: '#8c8c8c' }}>Daromad o'sishi</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: data?.trends?.revenue?.growth && data.trends.revenue.growth >= 0 ? '#52c41a' : '#ff4d4f' }}>
                  {data?.trends?.revenue?.growth !== undefined
                    ? `${data.trends.revenue.growth >= 0 ? '+' : ''}${data.trends.revenue.growth}%`
                    : '—'
                  }
                </div>
              </div>
            </Space>
          </StyledCard>
        </Col>

        <Col xs={24} lg={12}>
          <StyledCard title="Tezkor Harakatlar">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Button
                type="primary"
                size="large"
                block
                icon={<AppstoreOutlined />}
                onClick={() => navigate('/ads/create')}
              >
                Yangi E'lon Yaratish
              </Button>
              <Button
                size="large"
                block
                icon={<SendOutlined />}
                onClick={() => navigate('/posts')}
              >
                Tarqatish Boshlash
              </Button>
            </Space>
          </StyledCard>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
