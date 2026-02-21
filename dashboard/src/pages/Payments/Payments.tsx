import { useState } from 'react'
import {
  Table,
  Card,
  Typography,
  Tag,
  Button,
  Space,
  Modal,
  Input,
  Row,
  Col,
  Statistic,
  message,
  Tabs,
  Upload,
  Image,
  Radio,
} from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UploadOutlined,
  CreditCardOutlined,
  PictureOutlined,
  BankOutlined,
} from '@ant-design/icons'
import styled from 'styled-components'
import {
  usePayments,
  useApprovePayment,
  useRejectPayment,
  usePaymentStatistics,
  usePaymentCards,
  useSubscriptionPlans,
  useCreatePayment,
  useUploadReceipt,
} from '../../hooks/useApi'
import { useAuthStore } from '../../stores/authStore'
import type { Payment, SubscriptionPlan, PaymentCard } from '../../types'

const { Title, Text } = Typography

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`

const PlanCard = styled.div<{ $selected?: boolean }>`
  border: 2px solid ${(p) => (p.$selected ? '#1890ff' : '#f0f0f0')};
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(p) => (p.$selected ? '#e6f7ff' : '#fff')};
  text-align: center;

  &:hover {
    border-color: #1890ff;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
  }
`

const PlanPrice = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #1890ff;
  margin: 8px 0;
`

const PlanFeature = styled.div`
  color: #666;
  font-size: 13px;
  line-height: 1.8;
`

const PaymentCardDisplay = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 16px 20px;
  color: #fff;
  margin-bottom: 12px;
`

const PLAN_COLORS: Record<string, string> = {
  STARTER: '#52c41a',
  BUSINESS: '#1890ff',
  PREMIUM: '#faad14',
  ENTERPRISE: '#f5222d',
}

const PLAN_LABELS: Record<string, string> = {
  STARTER: 'Starter',
  BUSINESS: 'Business',
  PREMIUM: 'Premium',
  ENTERPRISE: 'Enterprise',
}

const Payments = () => {
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  const [rejectReason, setRejectReason] = useState('')
  const [activeTab, setActiveTab] = useState('list')
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)

  const { data, isLoading } = usePayments()
  const { data: stats } = usePaymentStatistics()
  const { data: paymentCards } = usePaymentCards()
  const { data: plans } = useSubscriptionPlans()
  const approveMutation = useApprovePayment()
  const rejectMutation = useRejectPayment()
  const createPaymentMutation = useCreatePayment()
  const uploadMutation = useUploadReceipt()

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id)
      message.success("To'lov tasdiqlandi")
    } catch {
      message.error('Xatolik yuz berdi')
    }
  }

  const handleReject = (id: string) => {
    Modal.confirm({
      title: 'Rad etish sababi',
      content: (
        <Input.TextArea
          placeholder="Sabab kiriting..."
          onChange={(e) => setRejectReason(e.target.value)}
          rows={3}
        />
      ),
      okText: 'Rad etish',
      okType: 'danger',
      cancelText: 'Bekor qilish',
      onOk: async () => {
        try {
          await rejectMutation.mutateAsync({ id, reason: rejectReason || 'Sababsiz' })
          message.success("To'lov rad etildi")
          setRejectReason('')
        } catch {
          message.error('Xatolik yuz berdi')
        }
      },
    })
  }

  const handleUploadReceipt = async (file: File) => {
    try {
      const result = await uploadMutation.mutateAsync(file)
      setReceiptUrl(result.url)
      setReceiptPreview(URL.createObjectURL(file))
      message.success('Chek yuklandi')
    } catch {
      message.error('Chek yuklashda xatolik')
    }
    return false // prevent default upload
  }

  const handleCreatePayment = async () => {
    if (!selectedPlan) {
      message.warning('Tarifni tanlang')
      return
    }
    if (!receiptUrl) {
      message.warning('Chek rasmini yuklang')
      return
    }

    const plan = plans?.find((p) => p.type === selectedPlan)
    if (!plan) return

    try {
      await createPaymentMutation.mutateAsync({
        amount: plan.price,
        planType: selectedPlan,
      })

      message.success("To'lov so'rovi yuborildi! Admin tasdiqlashini kuting.")
      setSelectedPlan(null)
      setReceiptUrl(null)
      setReceiptPreview(null)
      setActiveTab('list')
    } catch {
      message.error('Xatolik yuz berdi')
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id: string) => id.slice(0, 8) + '...',
    },
    {
      title: 'Foydalanuvchi',
      key: 'user',
      render: (_: unknown, record: Payment) =>
        record.user ? `${record.user.firstName || ''} ${record.user.lastName || ''}`.trim() || record.user.username || '—' : '—',
    },
    {
      title: 'Summa',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (amount: number, record: Payment) =>
        `${amount?.toLocaleString()} ${record.currency}`,
    },
    {
      title: 'Plan',
      dataIndex: 'planType',
      key: 'planType',
      width: 120,
      render: (plan: string) => plan ? (
        <Tag color={PLAN_COLORS[plan] || 'blue'}>{PLAN_LABELS[plan] || plan}</Tag>
      ) : '—',
    },
    {
      title: 'Chek',
      dataIndex: 'receiptImage',
      key: 'receiptImage',
      width: 80,
      render: (url: string) => url ? (
        <Image
          src={url}
          width={40}
          height={40}
          style={{ objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }}
          preview={{ mask: <PictureOutlined /> }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA2ElEQVR4nO3YsQ3CQBAF0U2hKog+qII+KIMa6IMuXAAtOCABJPhk7cxIn/Tf6v7trrv7dwKf2AD7x/ZZ7ABh5xECA0ACiAsB5IkBEoUB0oQBGoUBcoQBaoQBSoQBKoQBCoQBcoQBMoQBUoQBEoQBYoQBIoQBQoQBwoQB/IQBXIQBbIQBDIQBLIQB9IQB1IQBXIQB/IQBHITBdnefA8t+nycOiKYAKPkHyLcA5IkB0oQBGoUBcoQBaoQBSoQBKoQBCoQBcoQBMoQBUoQBEoQBYoQBIoQBQoQBwoQB/IQB/A=="
        />
      ) : '—',
    },
    {
      title: 'Holat',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: string) => {
        const config: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
          PENDING: { color: 'orange', label: 'Kutilmoqda', icon: <ClockCircleOutlined /> },
          APPROVED: { color: 'green', label: 'Tasdiqlangan', icon: <CheckCircleOutlined /> },
          REJECTED: { color: 'red', label: 'Rad etilgan', icon: <CloseCircleOutlined /> },
          EXPIRED: { color: 'default', label: "Muddati o'tgan", icon: <ClockCircleOutlined /> },
        }
        const { color, label, icon } = config[status] || config.PENDING
        return (
          <Tag icon={icon} color={color}>
            {label}
          </Tag>
        )
      },
    },
    {
      title: 'Sana',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('uz-UZ'),
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 200,
      render: (_: unknown, record: Payment) => {
        if (record.status === 'PENDING' && isAdmin) {
          return (
            <Space>
              <Button
                type="primary"
                size="small"
                onClick={() => handleApprove(record.id)}
                loading={approveMutation.isPending}
              >
                Tasdiqlash
              </Button>
              <Button
                danger
                size="small"
                onClick={() => handleReject(record.id)}
              >
                Rad etish
              </Button>
            </Space>
          )
        }
        if (record.status === 'REJECTED' && record.rejectReason) {
          return <span style={{ color: '#999' }}>{record.rejectReason}</span>
        }
        return null
      },
    },
  ]

  const renderPaymentList = () => (
    <StyledCard loading={isLoading} title="To'lovlar Ro'yxati">
      <Table
        columns={columns}
        dataSource={data?.data || []}
        rowKey="id"
        pagination={{ pageSize: 20 }}
        scroll={{ x: 1200 }}
      />
    </StyledCard>
  )

  const renderNewPayment = () => (
    <Row gutter={[24, 24]}>
      {/* Tarif tanlash */}
      <Col span={24}>
        <StyledCard title="1. Tarifni tanlang">
          <Radio.Group
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            style={{ width: '100%' }}
          >
            <Row gutter={[16, 16]}>
              {(plans || []).map((plan) => (
                <Col xs={12} sm={12} md={6} key={plan.type}>
                  <PlanCard
                    $selected={selectedPlan === plan.type}
                    onClick={() => setSelectedPlan(plan.type as SubscriptionPlan)}
                  >
                    <Radio value={plan.type} style={{ display: 'none' }} />
                    <Tag color={PLAN_COLORS[plan.type] || 'blue'} style={{ fontSize: 13 }}>
                      {plan.name}
                    </Tag>
                    <PlanPrice>{plan.price.toLocaleString()} UZS</PlanPrice>
                    <PlanFeature>
                      <div>{plan.maxAds === -1 ? 'Cheksiz' : plan.maxAds} e'lon</div>
                      <div>{plan.maxSessions} session</div>
                      <div>{plan.maxGroups === -1 ? 'Cheksiz' : plan.maxGroups} guruh</div>
                      <div>{plan.durationDays} kun</div>
                    </PlanFeature>
                  </PlanCard>
                </Col>
              ))}
            </Row>
          </Radio.Group>
        </StyledCard>
      </Col>

      {/* Karta ma'lumotlari */}
      <Col xs={24} md={12}>
        <StyledCard
          title={
            <Space>
              <CreditCardOutlined />
              <span>2. Kartaga pul o'tkazing</span>
            </Space>
          }
        >
          {paymentCards && paymentCards.length > 0 ? (
            paymentCards.map((card: PaymentCard, i: number) => (
              <PaymentCardDisplay key={i}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <BankOutlined style={{ marginRight: 8 }} />
                  <Text style={{ color: '#fff', fontWeight: 600 }}>{card.bankName}</Text>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>
                  {card.cardNumber}
                </div>
                <div style={{ opacity: 0.9 }}>{card.cardHolder}</div>
                {card.description && (
                  <div style={{ opacity: 0.7, fontSize: 12, marginTop: 4 }}>{card.description}</div>
                )}
              </PaymentCardDisplay>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>
              Admin hali karta ma'lumotlarini kiritmagan
            </div>
          )}
        </StyledCard>
      </Col>

      {/* Chek yuklash */}
      <Col xs={24} md={12}>
        <StyledCard
          title={
            <Space>
              <UploadOutlined />
              <span>3. Chek rasmini yuklang</span>
            </Space>
          }
        >
          <Upload.Dragger
            accept="image/*,.pdf"
            maxCount={1}
            showUploadList={false}
            beforeUpload={(file) => {
              handleUploadReceipt(file)
              return false
            }}
          >
            {receiptPreview ? (
              <div style={{ padding: 8 }}>
                <img
                  src={receiptPreview}
                  alt="Chek"
                  style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }}
                />
                <div style={{ marginTop: 8, color: '#52c41a' }}>
                  <CheckCircleOutlined /> Yuklandi
                </div>
              </div>
            ) : (
              <div style={{ padding: 20 }}>
                <p><UploadOutlined style={{ fontSize: 32, color: '#999' }} /></p>
                <p>Chek rasmini bu yerga tashlang</p>
                <p style={{ color: '#999', fontSize: 12 }}>yoki bosib tanlang (JPG, PNG, PDF, max 10MB)</p>
              </div>
            )}
          </Upload.Dragger>

          <Button
            type="primary"
            size="large"
            block
            style={{ marginTop: 16 }}
            onClick={handleCreatePayment}
            loading={createPaymentMutation.isPending}
            disabled={!selectedPlan || !receiptUrl}
          >
            To'lov so'rovini yuborish
          </Button>

          {selectedPlan && (
            <div style={{ textAlign: 'center', marginTop: 8, color: '#666' }}>
              {PLAN_LABELS[selectedPlan]} — {plans?.find((p) => p.type === selectedPlan)?.price.toLocaleString()} UZS
            </div>
          )}
        </StyledCard>
      </Col>
    </Row>
  )

  return (
    <div>
      <Title level={2}>To'lovlar</Title>

      {stats && isAdmin && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <StyledCard>
              <Statistic title="Jami" value={stats.total} />
            </StyledCard>
          </Col>
          <Col xs={12} sm={6}>
            <StyledCard>
              <Statistic title="Kutilmoqda" value={stats.pending} valueStyle={{ color: '#faad14' }} />
            </StyledCard>
          </Col>
          <Col xs={12} sm={6}>
            <StyledCard>
              <Statistic title="Tasdiqlangan" value={stats.approved} valueStyle={{ color: '#52c41a' }} />
            </StyledCard>
          </Col>
          <Col xs={12} sm={6}>
            <StyledCard>
              <Statistic
                title="Jami daromad"
                value={stats.totalRevenue}
                suffix=" UZS"
                precision={0}
                valueStyle={{ color: '#1890ff' }}
              />
            </StyledCard>
          </Col>
        </Row>
      )}

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'list',
            label: "Barcha to'lovlar",
            children: renderPaymentList(),
          },
          {
            key: 'new',
            label: "Yangi to'lov",
            children: renderNewPayment(),
          },
        ]}
      />
    </div>
  )
}

export default Payments
