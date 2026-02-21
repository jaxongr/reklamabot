import { useEffect } from 'react'
import { Card, Form, Input, Typography, Button, Row, Col, Tag, Descriptions, message } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { useProfile, useUpdateProfile, useMySubscription } from '../../hooks/useApi'
import { useAuthStore } from '../../stores/authStore'

const { Title } = Typography

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`

const planLabels: Record<string, { label: string; color: string }> = {
  STARTER: { label: 'Starter', color: 'default' },
  BUSINESS: { label: 'Business', color: 'blue' },
  PREMIUM: { label: 'Premium', color: 'gold' },
  ENTERPRISE: { label: 'Enterprise', color: 'red' },
}

const Settings = () => {
  const user = useAuthStore((state) => state.user)
  const { data: profile, isLoading } = useProfile()
  const { data: subscription } = useMySubscription()
  const updateMutation = useUpdateProfile()

  const [form] = Form.useForm()

  useEffect(() => {
    if (profile) {
      form.setFieldsValue(profile)
    }
  }, [profile, form])

  const handleSave = async (values: any) => {
    try {
      await updateMutation.mutateAsync(values)
      message.success('Saqlandi!')
    } catch {
      message.error('Xatolik yuz berdi')
    }
  }

  return (
    <div>
      <Title level={2}>Sozlamalar</Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <StyledCard
            title="Profil Sozlamalari"
            loading={isLoading}
            extra={
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={() => form.submit()}
                loading={updateMutation.isPending}
              >
                Saqlash
              </Button>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Ism" name="firstName">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Familiya" name="lastName">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Username" name="username">
                <Input />
              </Form.Item>

              <Form.Item label="Telefon" name="phoneNumber">
                <Input />
              </Form.Item>
            </Form>
          </StyledCard>
        </Col>

        <Col xs={24} lg={10}>
          <StyledCard title="Hisob Ma'lumotlari">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Telegram ID">
                {user?.telegramId || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Rol">
                <Tag color={user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? 'blue' : 'default'}>
                  {user?.role || '—'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Holat">
                <Tag color={user?.isActive ? 'green' : 'red'}>
                  {user?.isActive ? 'Faol' : 'Nofaol'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </StyledCard>

          <StyledCard title="Obuna" style={{ marginTop: 24 }}>
            {subscription ? (
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Plan">
                  <Tag color={planLabels[subscription.planType]?.color || 'default'}>
                    {planLabels[subscription.planType]?.label || subscription.planType}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Holat">
                  <Tag color={subscription.status === 'ACTIVE' ? 'green' : 'red'}>
                    {subscription.status === 'ACTIVE' ? 'Faol' : subscription.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tugash sanasi">
                  {subscription.endDate
                    ? new Date(subscription.endDate).toLocaleDateString('uz-UZ')
                    : '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Max e'lonlar">
                  {subscription.maxAds === -1 ? 'Cheksiz' : subscription.maxAds}
                </Descriptions.Item>
                <Descriptions.Item label="Max sessiyalar">
                  {subscription.maxSessions}
                </Descriptions.Item>
                <Descriptions.Item label="Max guruhlar">
                  {subscription.maxGroups === -1 ? 'Cheksiz' : subscription.maxGroups}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <div style={{ textAlign: 'center', padding: 16, color: '#999' }}>
                Obuna mavjud emas
              </div>
            )}
          </StyledCard>
        </Col>
      </Row>
    </div>
  )
}

export default Settings
