import { useEffect, useState } from 'react'
import {
  Card,
  Form,
  Input,
  Typography,
  Button,
  Row,
  Col,
  Tag,
  Descriptions,
  message,
  Space,
  List,
  Popconfirm,
} from 'antd'
import {
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  CreditCardOutlined,
  BankOutlined,
} from '@ant-design/icons'
import styled from 'styled-components'
import {
  useProfile,
  useUpdateProfile,
  useMySubscription,
  usePaymentCards,
  useUpdatePaymentCards,
} from '../../hooks/useApi'
import { useAuthStore } from '../../stores/authStore'
import type { PaymentCard } from '../../types'

const { Title, Text } = Typography

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`

const CardItem = styled.div`
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const planLabels: Record<string, { label: string; color: string }> = {
  STARTER: { label: 'Starter', color: 'default' },
  BUSINESS: { label: 'Business', color: 'blue' },
  PREMIUM: { label: 'Premium', color: 'gold' },
  ENTERPRISE: { label: 'Enterprise', color: 'red' },
}

const Settings = () => {
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  const { data: profile, isLoading } = useProfile()
  const { data: subscription } = useMySubscription()
  const updateMutation = useUpdateProfile()

  // Karta boshqaruv
  const { data: paymentCards, isLoading: cardsLoading } = usePaymentCards()
  const updateCardsMutation = useUpdatePaymentCards()
  const [cards, setCards] = useState<PaymentCard[]>([])
  const [cardForm] = Form.useForm()

  const [form] = Form.useForm()

  useEffect(() => {
    if (profile) {
      form.setFieldsValue(profile)
    }
  }, [profile, form])

  useEffect(() => {
    if (paymentCards) {
      setCards(paymentCards)
    }
  }, [paymentCards])

  const handleSave = async (values: any) => {
    try {
      await updateMutation.mutateAsync(values)
      message.success('Saqlandi!')
    } catch {
      message.error('Xatolik yuz berdi')
    }
  }

  const handleAddCard = async (values: PaymentCard) => {
    const newCards = [...cards, values]
    try {
      await updateCardsMutation.mutateAsync(newCards)
      setCards(newCards)
      cardForm.resetFields()
      message.success('Karta qo\'shildi')
    } catch {
      message.error('Xatolik yuz berdi')
    }
  }

  const handleDeleteCard = async (index: number) => {
    const newCards = cards.filter((_, i) => i !== index)
    try {
      await updateCardsMutation.mutateAsync(newCards)
      setCards(newCards)
      message.success('Karta o\'chirildi')
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

          {/* Admin uchun — Karta boshqaruv */}
          {isAdmin && (
            <StyledCard
              title={
                <Space>
                  <CreditCardOutlined />
                  <span>To'lov Kartalari</span>
                </Space>
              }
              loading={cardsLoading}
              style={{ marginTop: 24 }}
            >
              {/* Mavjud kartalar */}
              {cards.length > 0 ? (
                <List
                  dataSource={cards}
                  renderItem={(card, index) => (
                    <CardItem key={index}>
                      <div>
                        <div>
                          <BankOutlined style={{ marginRight: 8 }} />
                          <Text strong>{card.bankName}</Text>
                        </div>
                        <div style={{ marginTop: 4 }}>
                          <Text code style={{ fontSize: 14 }}>{card.cardNumber}</Text>
                        </div>
                        <div style={{ marginTop: 2 }}>
                          <Text type="secondary">{card.cardHolder}</Text>
                        </div>
                        {card.description && (
                          <div style={{ marginTop: 2 }}>
                            <Text type="secondary" italic>{card.description}</Text>
                          </div>
                        )}
                      </div>
                      <Popconfirm
                        title="Kartani o'chirmoqchimisiz?"
                        onConfirm={() => handleDeleteCard(index)}
                        okText="Ha"
                        cancelText="Yo'q"
                      >
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          size="small"
                        />
                      </Popconfirm>
                    </CardItem>
                  )}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: 16, color: '#999', marginBottom: 16 }}>
                  Hali karta qo'shilmagan
                </div>
              )}

              {/* Yangi karta qo'shish formasi */}
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, marginTop: 8 }}>
                <Text strong style={{ marginBottom: 12, display: 'block' }}>Yangi karta qo'shish</Text>
                <Form
                  form={cardForm}
                  layout="vertical"
                  onFinish={handleAddCard}
                  size="small"
                >
                  <Row gutter={12}>
                    <Col span={12}>
                      <Form.Item
                        name="bankName"
                        label="Bank nomi"
                        rules={[{ required: true, message: 'Bank nomini kiriting' }]}
                      >
                        <Input placeholder="Uzcard, Humo, Visa..." />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="cardNumber"
                        label="Karta raqami"
                        rules={[{ required: true, message: 'Karta raqamini kiriting' }]}
                      >
                        <Input placeholder="8600 1234 5678 9012" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={12}>
                    <Col span={12}>
                      <Form.Item
                        name="cardHolder"
                        label="Karta egasi"
                        rules={[{ required: true, message: 'Karta egasini kiriting' }]}
                      >
                        <Input placeholder="ISMS FAMILIYA" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="description" label="Izoh">
                        <Input placeholder="Qo'shimcha ma'lumot..." />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    htmlType="submit"
                    loading={updateCardsMutation.isPending}
                    block
                  >
                    Karta qo'shish
                  </Button>
                </Form>
              </div>
            </StyledCard>
          )}
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
