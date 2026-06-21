import { useState } from 'react'
import {
  Card,
  Table,
  Button,
  Form,
  Input,
  Tag,
  Space,
  message,
  Typography,
  Row,
  Col,
  Tabs,
  Statistic,
  Select,
  Badge,
  Switch,
  Alert,
  Popconfirm,
  Radio,
} from 'antd'
import {
  SendOutlined,
  HistoryOutlined,
  MobileOutlined,
  CarOutlined,
  ShoppingOutlined,
  StopOutlined,
  DashboardOutlined,
  SearchOutlined,
  UserOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import styled from 'styled-components'
import type { ColumnsType } from 'antd/es/table'
import {
  useSendSms,
  useSmsHistory,
  useSmsStats,
  useSmsDriversList,
  useSendSmsToDrivers,
  useSmsOrdersList,
  useSendSmsToOrders,
  useSmsBlockedList,
  useSendSmsToBlocked,
  useSmsAutoConfig,
  useSaveAutoConfig,
  useSmsAllPhones,
  useSendSmsToAll,
  useSmsProviders,
  useSetDefaultProvider,
  useSetSmsGatewayConfig,
  useTestSmsGateway,
  type SmsProviderName,
} from '../../hooks/useApi'
import type { SmsLog, SmsCategory } from '../../types'

// Provider tanlash — ikki rejimda: Form ichida (name="provider") yoki standalone (value/onChange)
function ProviderSelect({ value, onChange }: { value?: SmsProviderName; onChange?: (v: SmsProviderName) => void }) {
  const { data: providers } = useSmsProviders()
  const gatewayConfigured = providers?.providers?.sms_gateway?.configured ?? false
  const defaultProvider = providers?.defaultProvider || 'semysms'

  // Standalone rejim (value/onChange berilgan)
  if (onChange) {
    return (
      <Form.Item label="Provider">
        <Select value={value || defaultProvider} onChange={onChange}>
          <Select.Option value="semysms">SemySMS</Select.Option>
          <Select.Option value="sms_gateway" disabled={!gatewayConfigured}>
            SMS Gateway {!gatewayConfigured && '(sozlanmagan)'}
          </Select.Option>
        </Select>
      </Form.Item>
    )
  }

  // Form ichidagi rejim
  return (
    <Form.Item label="Provider" name="provider" initialValue={defaultProvider}>
      <Select>
        <Select.Option value="semysms">SemySMS</Select.Option>
        <Select.Option value="sms_gateway" disabled={!gatewayConfigured}>
          SMS Gateway {!gatewayConfigured && '(sozlanmagan)'}
        </Select.Option>
      </Select>
    </Form.Item>
  )
}

const { Title, Text } = Typography
const { TextArea } = Input

const PageWrapper = styled.div`
  padding: 24px;
`

const PageHeader = styled.div`
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`

const StatRow = styled(Row)`
  margin-bottom: 24px;
`

const SmsStatusConfig: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'blue', label: 'Kutilmoqda' },
  SENT: { color: 'green', label: 'Yuborilgan' },
  FAILED: { color: 'red', label: 'Xato' },
  DELIVERED: { color: 'cyan', label: 'Yetkazilgan' },
}

const CategoryConfig: Record<string, { color: string; label: string; icon: any }> = {
  GENERAL: { color: 'default', label: 'Umumiy', icon: <MobileOutlined /> },
  DRIVER: { color: 'blue', label: 'Haydovchi', icon: <CarOutlined /> },
  ORDER: { color: 'green', label: 'Order', icon: <ShoppingOutlined /> },
  BLOCKED_AD: { color: 'red', label: 'Bloklangan', icon: <StopOutlined /> },
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Ismni 15 belgiga qisqartirish — har joyda ishlatilsin
function shortName(name?: string | null, limit = 15): string {
  if (!name) return '—'
  const clean = String(name).trim()
  return clean.length > limit ? clean.slice(0, limit) + '…' : clean
}

// ===================================================================
// MAIN COMPONENT
// ===================================================================

export default function SmsSettings() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <PageWrapper>
      <PageHeader>
        <Title level={3} style={{ margin: 0 }}>
          <MobileOutlined style={{ marginRight: 8 }} />
          SMS boshqaruvi
        </Title>
      </PageHeader>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'dashboard',
            label: (
              <Space>
                <DashboardOutlined />
                Dashboard
              </Space>
            ),
            children: <SmsDashboard />,
          },
          {
            key: 'drivers',
            label: (
              <Space>
                <CarOutlined />
                Haydovchilar
              </Space>
            ),
            children: <SmsDrivers />,
          },
          {
            key: 'orders',
            label: (
              <Space>
                <ShoppingOutlined />
                Orderlar
              </Space>
            ),
            children: <SmsOrders />,
          },
          {
            key: 'blocked',
            label: (
              <Space>
                <StopOutlined />
                Bloklangan
              </Space>
            ),
            children: <SmsBlocked />,
          },
          {
            key: 'all',
            label: (
              <Space>
                <GlobalOutlined />
                Hammaga
              </Space>
            ),
            children: <SmsAll />,
          },
          {
            key: 'auto',
            label: (
              <Space>
                <ThunderboltOutlined />
                Avto-SMS
              </Space>
            ),
            children: <SmsAutoConfig />,
          },
          {
            key: 'providers',
            label: (
              <Space>
                <ApiOutlined />
                Providerlar
              </Space>
            ),
            children: <SmsProvidersTab />,
          },
          {
            key: 'history',
            label: (
              <Space>
                <HistoryOutlined />
                Tarix
              </Space>
            ),
            children: <SmsHistory />,
          },
        ]}
      />
    </PageWrapper>
  )
}

// ===================================================================
// DASHBOARD TAB — Stats + Quick Send
// ===================================================================

function SmsDashboard() {
  const { data: stats } = useSmsStats()
  const [form] = Form.useForm()
  const sendSms = useSendSms()

  const handleSend = async () => {
    try {
      const values = await form.validateFields()
      await sendSms.mutateAsync(values)
      message.success('SMS muvaffaqiyatli yuborildi')
      form.resetFields()
    } catch (err: any) {
      if (err?.errorFields) return
      message.error('SMS yuborishda xato')
    }
  }

  return (
    <>
      <StatRow gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <StyledCard>
            <Statistic title="Jami SMS" value={stats?.total || 0} prefix={<MobileOutlined />} />
          </StyledCard>
        </Col>
        <Col xs={12} sm={6}>
          <StyledCard>
            <Statistic
              title="Yuborilgan"
              value={stats?.sent || 0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<SendOutlined />}
            />
          </StyledCard>
        </Col>
        <Col xs={12} sm={6}>
          <StyledCard>
            <Statistic
              title="Xato"
              value={stats?.failed || 0}
              valueStyle={{ color: '#f5222d' }}
            />
          </StyledCard>
        </Col>
        <Col xs={12} sm={6}>
          <StyledCard>
            <Statistic title="Bugun" value={stats?.todayCount || 0} />
          </StyledCard>
        </Col>
      </StatRow>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <StyledCard
            title={
              <Space>
                <SendOutlined style={{ color: '#FC3F1D' }} />
                Tezkor SMS yuborish
              </Space>
            }
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="phone"
                label="Telefon raqami"
                rules={[
                  { required: true, message: 'Telefon raqami kiritish shart' },
                  { pattern: /^\+?[0-9]{9,15}$/, message: "Noto'g'ri format" },
                ]}
              >
                <Input placeholder="+998901234567" prefix={<MobileOutlined />} />
              </Form.Item>
              <Form.Item
                name="message"
                label="Xabar matni"
                rules={[
                  { required: true, message: 'Xabar matni kiritish shart' },
                  { max: 1000, message: 'Xabar 1000 belgidan oshmasligi kerak' },
                ]}
              >
                <TextArea rows={4} maxLength={1000} showCount placeholder="SMS matni..." />
              </Form.Item>
              <ProviderSelect />
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={sendSms.isPending}
                onClick={handleSend}
                block
              >
                SMS yuborish
              </Button>
            </Form>
          </StyledCard>
        </Col>

        <Col xs={24} md={12}>
          <StyledCard title="Kategoriya bo'yicha">
            <Row gutter={[12, 12]}>
              {Object.entries(CategoryConfig).map(([key, cfg]) => (
                <Col span={12} key={key}>
                  <Card size="small" style={{ borderRadius: 8 }}>
                    <Statistic
                      title={cfg.label}
                      value={stats?.byCategory?.[key] || 0}
                      prefix={cfg.icon}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </StyledCard>
        </Col>
      </Row>
    </>
  )
}

// ===================================================================
// DRIVERS TAB — Haydovchilarga SMS
// ===================================================================

function SmsDrivers() {
  const { data: drivers, isLoading } = useSmsDriversList()
  const sendToDrivers = useSendSmsToDrivers()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [smsText, setSmsText] = useState('')
  const [provider, setProvider] = useState<SmsProviderName | undefined>(undefined)

  const handleSend = async () => {
    if (!smsText.trim()) {
      message.warning('Xabar matni kiritish shart')
      return
    }
    try {
      const result = await sendToDrivers.mutateAsync({
        message: smsText,
        driverIds: selectedIds.length > 0 ? selectedIds : undefined,
        provider,
      })
      const sent = Array.isArray(result) ? result.filter((r: any) => r.success).length : 0
      message.success(`${sent} ta haydovchiga SMS yuborildi`)
      setSmsText('')
      setSelectedIds([])
    } catch {
      message.error('SMS yuborishda xato')
    }
  }

  const columns: ColumnsType<any> = [
    {
      title: 'Ism',
      dataIndex: 'fullName',
      width: 150,
      ellipsis: true,
      render: (name: string) => shortName(name),
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      render: (p: string) => <Text code>{p}</Text>,
    },
    {
      title: 'Mashina',
      dataIndex: 'vehicleType',
      render: (v: string) => v ? <Tag>{v}</Tag> : '—',
    },
    {
      title: 'Shahar',
      dataIndex: 'lastCity',
      render: (c: string) => c || '—',
    },
  ]

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={10}>
        <StyledCard
          title={
            <Space>
              <CarOutlined style={{ color: '#1677ff' }} />
              Haydovchilarga SMS
            </Space>
          }
        >
          <Form layout="vertical">
            <Form.Item label="Xabar matni">
              <TextArea
                rows={4}
                maxLength={1000}
                showCount
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                placeholder="Haydovchilarga yuboriladigan SMS matni..."
              />
            </Form.Item>
            <ProviderSelect value={provider} onChange={setProvider} />
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                type={selectedIds.length > 0 ? 'success' : 'info'}
                showIcon
                message={
                  selectedIds.length > 0
                    ? `${selectedIds.length} ta haydovchi tanlangan`
                    : `Barcha haydovchilarga yuboriladi (${drivers?.length || 0} ta)`
                }
                style={{ marginBottom: 8 }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={sendToDrivers.isPending}
                onClick={handleSend}
                disabled={!smsText.trim()}
                block
              >
                SMS yuborish
              </Button>
            </Space>
          </Form>
        </StyledCard>
      </Col>
      <Col xs={24} lg={14}>
        <StyledCard title={`Haydovchilar (${drivers?.length || 0})`}>
          <Space style={{ marginBottom: 12 }}>
            <Button size="small" onClick={() => setSelectedIds((drivers || []).map((d: any) => d.id))}>
              Barchasini tanlash ({drivers?.length || 0})
            </Button>
            <Button size="small" onClick={() => setSelectedIds([])} disabled={selectedIds.length === 0}>
              Tozalash
            </Button>
          </Space>
          <Table
            columns={columns}
            dataSource={drivers || []}
            rowKey="id"
            loading={isLoading}
            size="small"
            pagination={{ pageSize: 50, showSizeChanger: true, pageSizeOptions: ['20', '50', '100', '200'], showTotal: (t) => `Jami: ${t}` }}
            rowSelection={{
              selectedRowKeys: selectedIds,
              onChange: (keys) => setSelectedIds(keys as string[]),
              preserveSelectedRowKeys: true,
            }}
            locale={{ emptyText: 'Haydovchi topilmadi' }}
          />
        </StyledCard>
      </Col>
    </Row>
  )
}

// ===================================================================
// ORDERS TAB — Orderlarga SMS
// ===================================================================

function SmsOrders() {
  const [search, setSearch] = useState('')
  const [orderType, setOrderType] = useState<string | undefined>()
  const { data: orders, isLoading } = useSmsOrdersList({ type: orderType, search, limit: 100 })
  const sendToOrders = useSendSmsToOrders()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [smsText, setSmsText] = useState('')
  const [provider, setProvider] = useState<SmsProviderName | undefined>(undefined)

  const handleSend = async () => {
    if (!smsText.trim()) {
      message.warning('Xabar matni kiritish shart')
      return
    }
    if (selectedIds.length === 0) {
      message.warning('Kamida 1 ta order tanlash kerak')
      return
    }
    try {
      const result = await sendToOrders.mutateAsync({
        message: smsText,
        orderIds: selectedIds,
        provider,
      })
      const sent = Array.isArray(result) ? result.filter((r: any) => r.success).length : 0
      message.success(`${sent} ta raqamga SMS yuborildi`)
      setSmsText('')
      setSelectedIds([])
    } catch {
      message.error('SMS yuborishda xato')
    }
  }

  const columns: ColumnsType<any> = [
    {
      title: 'Telefon',
      dataIndex: 'phone',
      width: 150,
      render: (p: string) => <Text code>{p}</Text>,
    },
    {
      title: 'Marshrut',
      key: 'route',
      render: (_: any, r: any) => {
        const from = r.cargoFrom || '—'
        const to = r.cargoTo || '—'
        return `${from} → ${to}`
      },
    },
    {
      title: 'Tur',
      dataIndex: 'type',
      width: 100,
      render: (t: string) => (
        <Tag color={t === 'DRIVER' ? 'blue' : 'green'}>{t === 'DRIVER' ? 'Haydovchi' : 'Yuk'}</Tag>
      ),
    },
    {
      title: 'Sana',
      dataIndex: 'createdAt',
      width: 130,
      render: (d: string) => formatDate(d),
    },
  ]

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={10}>
        <StyledCard
          title={
            <Space>
              <ShoppingOutlined style={{ color: '#52c41a' }} />
              Orderlarga SMS
            </Space>
          }
        >
          <Form layout="vertical">
            <Form.Item label="Xabar matni">
              <TextArea
                rows={4}
                maxLength={1000}
                showCount
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                placeholder="Order egalariga yuboriladigan SMS matni..."
              />
            </Form.Item>
            <ProviderSelect value={provider} onChange={setProvider} />
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                type={selectedIds.length > 0 ? 'success' : 'warning'}
                showIcon
                message={`${selectedIds.length} ta order tanlangan`}
                style={{ marginBottom: 8 }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={sendToOrders.isPending}
                onClick={handleSend}
                disabled={!smsText.trim() || selectedIds.length === 0}
                block
              >
                SMS yuborish ({selectedIds.length} ta)
              </Button>
            </Space>
          </Form>
        </StyledCard>
      </Col>
      <Col xs={24} lg={14}>
        <StyledCard
          title={`Orderlar (${orders?.length || 0})`}
          extra={
            <Space>
              <Select
                placeholder="Tur"
                allowClear
                style={{ width: 120 }}
                value={orderType}
                onChange={setOrderType}
                options={[
                  { value: 'CARGO', label: 'Yuk' },
                  { value: 'DRIVER', label: 'Haydovchi' },
                ]}
              />
              <Input
                placeholder="Qidirish..."
                prefix={<SearchOutlined />}
                style={{ width: 180 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
              />
            </Space>
          }
        >
          <Space style={{ marginBottom: 12 }}>
            <Button size="small" onClick={() => setSelectedIds((orders || []).map((o: any) => o.id))}>
              Barchasini tanlash ({orders?.length || 0})
            </Button>
            <Button size="small" onClick={() => setSelectedIds([])} disabled={selectedIds.length === 0}>
              Tozalash
            </Button>
          </Space>
          <Table
            columns={columns}
            dataSource={orders || []}
            rowKey="id"
            loading={isLoading}
            size="small"
            pagination={{ pageSize: 50, showSizeChanger: true, pageSizeOptions: ['20', '50', '100', '200'], showTotal: (t) => `Jami: ${t}` }}
            rowSelection={{
              selectedRowKeys: selectedIds,
              onChange: (keys) => setSelectedIds(keys as string[]),
              preserveSelectedRowKeys: true,
            }}
            locale={{ emptyText: 'Order topilmadi' }}
          />
        </StyledCard>
      </Col>
    </Row>
  )
}

// ===================================================================
// BLOCKED TAB — Bloklangan dispetcherlarga SMS
// ===================================================================

function SmsBlocked() {
  const { data: blocked, isLoading } = useSmsBlockedList()
  const sendToBlocked = useSendSmsToBlocked()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [smsText, setSmsText] = useState('')
  const [provider, setProvider] = useState<SmsProviderName | undefined>(undefined)

  const handleSend = async () => {
    if (!smsText.trim()) {
      message.warning('Xabar matni kiritish shart')
      return
    }
    try {
      const result = await sendToBlocked.mutateAsync({
        message: smsText,
        blockedUserIds: selectedIds.length > 0 ? selectedIds : undefined,
        provider,
      })
      const sent = Array.isArray(result) ? result.filter((r: any) => r.success).length : 0
      message.success(`${sent} ta raqamga SMS yuborildi`)
      setSmsText('')
      setSelectedIds([])
    } catch {
      message.error('SMS yuborishda xato')
    }
  }

  const columns: ColumnsType<any> = [
    {
      title: 'Ism',
      dataIndex: 'senderName',
      width: 150,
      ellipsis: true,
      render: (name: string) => shortName(name),
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      render: (p: string) => <Text code>{p}</Text>,
    },
    {
      title: 'Username',
      dataIndex: 'senderUsername',
      render: (u: string) => u ? `@${u}` : '—',
    },
    {
      title: 'Sabab',
      dataIndex: 'reason',
      render: (r: string) => <Tag color="red">{r}</Tag>,
    },
  ]

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={10}>
        <StyledCard
          title={
            <Space>
              <StopOutlined style={{ color: '#f5222d' }} />
              Bloklangan dispetcherlarga SMS
            </Space>
          }
        >
          <Form layout="vertical">
            <Form.Item label="Xabar matni">
              <TextArea
                rows={4}
                maxLength={1000}
                showCount
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                placeholder="Bloklangan foydalanuvchilarga yuboriladigan SMS..."
              />
            </Form.Item>
            <ProviderSelect value={provider} onChange={setProvider} />
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                type={selectedIds.length > 0 ? 'success' : 'info'}
                showIcon
                message={
                  selectedIds.length > 0
                    ? `${selectedIds.length} ta tanlangan`
                    : `Barcha bloklanganlarga yuboriladi (${blocked?.length || 0} ta)`
                }
                style={{ marginBottom: 8 }}
              />
              <Button
                type="primary"
                danger
                icon={<SendOutlined />}
                loading={sendToBlocked.isPending}
                onClick={handleSend}
                disabled={!smsText.trim()}
                block
              >
                SMS yuborish
              </Button>
            </Space>
          </Form>
        </StyledCard>
      </Col>
      <Col xs={24} lg={14}>
        <StyledCard title={`Bloklangan foydalanuvchilar (${blocked?.length || 0})`}>
          <Space style={{ marginBottom: 12 }}>
            <Button size="small" onClick={() => setSelectedIds((blocked || []).map((b: any) => b.id))}>
              Barchasini tanlash ({blocked?.length || 0})
            </Button>
            <Button size="small" onClick={() => setSelectedIds([])} disabled={selectedIds.length === 0}>
              Tozalash
            </Button>
          </Space>
          <Table
            columns={columns}
            dataSource={blocked || []}
            rowKey="id"
            loading={isLoading}
            size="small"
            pagination={{ pageSize: 50, showSizeChanger: true, pageSizeOptions: ['20', '50', '100', '200'], showTotal: (t) => `Jami: ${t}` }}
            rowSelection={{
              selectedRowKeys: selectedIds,
              onChange: (keys) => setSelectedIds(keys as string[]),
              preserveSelectedRowKeys: true,
            }}
            locale={{ emptyText: 'Bloklangan foydalanuvchi topilmadi' }}
          />
        </StyledCard>
      </Col>
    </Row>
  )
}

// ===================================================================
// ALL TAB — Hammaga SMS
// ===================================================================

function SmsAll() {
  const { data: phones, isLoading } = useSmsAllPhones()
  const sendToAll = useSendSmsToAll()
  const [smsText, setSmsText] = useState('')
  const [provider, setProvider] = useState<SmsProviderName | undefined>(undefined)
  const handleSendAll = async () => {
    if (!smsText.trim()) {
      message.warning('Xabar matni kiritish shart')
      return
    }
    try {
      const result = await sendToAll.mutateAsync({ message: smsText, provider })
      const sent = Array.isArray(result) ? result.filter((r: any) => r.success).length : 0
      message.success(`${sent} ta raqamga SMS yuborildi`)
      setSmsText('')
    } catch {
      message.error('SMS yuborishda xato')
    }
  }

  const sourceColors: Record<string, string> = {
    'Yuk order': 'green',
    'Haydovchi order': 'blue',
    'Bloklangan': 'red',
    'Haydovchi': 'cyan',
  }

  const columns: ColumnsType<any> = [
    {
      title: 'Telefon',
      dataIndex: 'phone',
      width: 150,
      render: (p: string) => <Text code>{p}</Text>,
    },
    {
      title: 'Ism / Marshrut',
      dataIndex: 'name',
      width: 180,
      ellipsis: true,
      render: (n: string) => shortName(n, 20),
    },
    {
      title: 'Manba',
      dataIndex: 'source',
      width: 150,
      render: (s: string) => <Tag color={sourceColors[s] || 'default'}>{s}</Tag>,
    },
  ]

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={10}>
        <StyledCard
          title={
            <Space>
              <GlobalOutlined style={{ color: '#722ed1' }} />
              Hammaga SMS
            </Space>
          }
        >
          <Alert
            message={`Jami ${phones?.length || 0} ta noyob raqam topildi`}
            description="Orderlar, bloklangan foydalanuvchilar va haydovchilardan yig'ilgan barcha raqamlar"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Form layout="vertical">
            <Form.Item label="Xabar matni">
              <TextArea
                rows={4}
                maxLength={1000}
                showCount
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                placeholder="Barcha raqamlarga yuboriladigan SMS matni..."
              />
            </Form.Item>
            <ProviderSelect value={provider} onChange={setProvider} />
            <Popconfirm
              title={`${phones?.length || 0} ta raqamga SMS yubormoqchimisiz?`}
              description="Bu jarayon biroz vaqt olishi mumkin"
              onConfirm={handleSendAll}
              okText="Ha, yuborish"
              cancelText="Bekor qilish"
            >
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={sendToAll.isPending}
                disabled={!smsText.trim()}
                block
                style={{ background: '#722ed1', borderColor: '#722ed1' }}
              >
                Hammaga SMS yuborish ({phones?.length || 0} ta)
              </Button>
            </Popconfirm>
          </Form>
        </StyledCard>
      </Col>
      <Col xs={24} lg={14}>
        <StyledCard title={`Barcha raqamlar (${phones?.length || 0})`}>
          <Table
            columns={columns}
            dataSource={phones || []}
            rowKey="phone"
            loading={isLoading}
            size="small"
            pagination={{ pageSize: 15, showTotal: (t) => `Jami: ${t}` }}
            locale={{ emptyText: 'Raqam topilmadi' }}
          />
        </StyledCard>
      </Col>
    </Row>
  )
}

// ===================================================================
// AUTO-SMS TAB — Avtomatik SMS sozlamalari
// ===================================================================

function SmsAutoConfig() {
  const { data: config, isLoading } = useSmsAutoConfig()
  const saveConfig = useSaveAutoConfig()

  const [cargoOrderEnabled, setCargoOrderEnabled] = useState(false)
  const [cargoOrderTemplate, setCargoOrderTemplate] = useState('')
  const [driverOrderEnabled, setDriverOrderEnabled] = useState(false)
  const [driverOrderTemplate, setDriverOrderTemplate] = useState('')
  const [blockedEnabled, setBlockedEnabled] = useState(false)
  const [blockedTemplate, setBlockedTemplate] = useState('')
  const [loaded, setLoaded] = useState(false)

  // Config yuklanganda state ga to'ldirish
  if (config && !loaded) {
    setCargoOrderEnabled(config.cargoOrderEnabled)
    setCargoOrderTemplate(config.cargoOrderTemplate)
    setDriverOrderEnabled(config.driverOrderEnabled)
    setDriverOrderTemplate(config.driverOrderTemplate)
    setBlockedEnabled(config.blockedEnabled)
    setBlockedTemplate(config.blockedTemplate)
    setLoaded(true)
  }

  const handleSave = async () => {
    try {
      await saveConfig.mutateAsync({
        cargoOrderEnabled,
        cargoOrderTemplate,
        driverOrderEnabled,
        driverOrderTemplate,
        blockedEnabled,
        blockedTemplate,
      })
      message.success('Avto-SMS sozlamalari saqlandi')
    } catch {
      message.error('Saqlashda xato')
    }
  }

  if (isLoading) return <Card loading />

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24}>
        <Alert
          message="Avto-SMS — yangi topilgan raqamlarga avtomatik SMS yuborish"
          description="Kuzatuv tizimi yangi order yoki bloklangan foydalanuvchi topganda, shu raqamga avtomatik SMS yuboriladi. Har bir tur uchun alohida shablon va toggle."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      </Col>

      <Col xs={24} md={8}>
        <StyledCard
          title={
            <Space>
              <ShoppingOutlined style={{ color: '#52c41a' }} />
              Yuk orderlari
              <Switch checked={cargoOrderEnabled} onChange={setCargoOrderEnabled} />
            </Space>
          }
        >
          <Form layout="vertical">
            <Form.Item
              label="SMS shabloni"
              help="O'zgaruvchilar: {marshrut}, {tur}, {guruh}"
            >
              <TextArea
                rows={4}
                maxLength={500}
                showCount
                value={cargoOrderTemplate}
                onChange={(e) => setCargoOrderTemplate(e.target.value)}
                placeholder="Sizning yuk e'loningiz topildi! {marshrut}"
                disabled={!cargoOrderEnabled}
              />
            </Form.Item>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Yangi <b>yuk orderi</b> topilganda, telefon raqamga shu matn yuboriladi.
            </Text>
          </Form>
        </StyledCard>
      </Col>

      <Col xs={24} md={8}>
        <StyledCard
          title={
            <Space>
              <CarOutlined style={{ color: '#1677ff' }} />
              Haydovchi orderlari
              <Switch checked={driverOrderEnabled} onChange={setDriverOrderEnabled} />
            </Space>
          }
        >
          <Form layout="vertical">
            <Form.Item
              label="SMS shabloni"
              help="O'zgaruvchilar: {marshrut}, {tur}, {guruh}"
            >
              <TextArea
                rows={4}
                maxLength={500}
                showCount
                value={driverOrderTemplate}
                onChange={(e) => setDriverOrderTemplate(e.target.value)}
                placeholder="Sizning haydovchi e'loningiz topildi! {marshrut}"
                disabled={!driverOrderEnabled}
              />
            </Form.Item>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Yangi <b>haydovchi orderi</b> topilganda, telefon raqamga shu matn yuboriladi.
            </Text>
          </Form>
        </StyledCard>
      </Col>

      <Col xs={24} md={8}>
        <StyledCard
          title={
            <Space>
              <StopOutlined style={{ color: '#f5222d' }} />
              Bloklangan
              <Switch checked={blockedEnabled} onChange={setBlockedEnabled} />
            </Space>
          }
        >
          <Form layout="vertical">
            <Form.Item
              label="SMS shabloni"
              help="O'zgaruvchilar: {ism}, {sabab}"
            >
              <TextArea
                rows={4}
                maxLength={500}
                showCount
                value={blockedTemplate}
                onChange={(e) => setBlockedTemplate(e.target.value)}
                placeholder="Hurmatli {ism}, e'loningiz bloklandi. Sabab: {sabab}."
                disabled={!blockedEnabled}
              />
            </Form.Item>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Yangi <b>bloklangan foydalanuvchi</b> topilganda, telefon raqamiga shu matn yuboriladi.
            </Text>
          </Form>
        </StyledCard>
      </Col>

      <Col xs={24}>
        <Button
          type="primary"
          icon={<ThunderboltOutlined />}
          loading={saveConfig.isPending}
          onClick={handleSave}
          size="large"
          style={{ background: '#fa8c16', borderColor: '#fa8c16' }}
        >
          Sozlamalarni saqlash
        </Button>
      </Col>
    </Row>
  )
}

// ===================================================================
// HISTORY TAB — SMS logs
// ===================================================================

function SmsHistory() {
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState<SmsCategory | undefined>()
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [search, setSearch] = useState('')

  const { data: historyData, isLoading } = useSmsHistory({
    page,
    limit: 30,
    category,
    status: statusFilter,
    search: search || undefined,
  })

  const history = historyData?.data ?? []
  const total = historyData?.pagination?.total ?? 0

  const columns: ColumnsType<SmsLog> = [
    {
      title: 'Telefon',
      dataIndex: 'phone',
      width: 150,
      render: (phone: string) => <Text code>{phone}</Text>,
    },
    {
      title: 'Kimga',
      dataIndex: 'targetName',
      width: 160,
      ellipsis: true,
      render: (name?: string) => name ? (
        <Space>
          <UserOutlined />
          {shortName(name)}
        </Space>
      ) : <Text type="secondary">—</Text>,
    },
    {
      title: 'Xabar',
      dataIndex: 'message',
      ellipsis: true,
    },
    {
      title: 'Kategoriya',
      dataIndex: 'category',
      width: 130,
      render: (cat: string) => {
        const cfg = CategoryConfig[cat] ?? { color: 'default', label: cat, icon: null }
        return (
          <Tag color={cfg.color} icon={cfg.icon}>
            {cfg.label}
          </Tag>
        )
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (status: string) => {
        const cfg = SmsStatusConfig[status] ?? { color: 'default', label: status }
        return <Tag color={cfg.color}>{cfg.label}</Tag>
      },
    },
    {
      title: 'Xato',
      dataIndex: 'errorMessage',
      width: 180,
      ellipsis: true,
      render: (err?: string) =>
        err ? <Text type="danger" style={{ fontSize: 12 }}>{err}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: 'Sana',
      dataIndex: 'createdAt',
      width: 150,
      render: (d: string) => formatDate(d),
    },
  ]

  return (
    <StyledCard
      title={
        <Space>
          <HistoryOutlined style={{ color: '#1677ff' }} />
          SMS tarixi
          <Badge count={total} style={{ backgroundColor: '#1677ff' }} />
        </Space>
      }
      extra={
        <Space wrap>
          <Select
            placeholder="Kategoriya"
            allowClear
            style={{ width: 140 }}
            value={category}
            onChange={setCategory}
            options={Object.entries(CategoryConfig).map(([k, v]) => ({
              value: k,
              label: v.label,
            }))}
          />
          <Select
            placeholder="Status"
            allowClear
            style={{ width: 130 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={Object.entries(SmsStatusConfig).map(([k, v]) => ({
              value: k,
              label: v.label,
            }))}
          />
          <Input
            placeholder="Qidirish..."
            prefix={<SearchOutlined />}
            style={{ width: 180 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
        </Space>
      }
    >
      <Table<SmsLog>
        columns={columns}
        dataSource={history}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: page,
          pageSize: 30,
          total,
          onChange: (p) => setPage(p),
          showTotal: (t) => `Jami: ${t} ta SMS`,
          showSizeChanger: false,
        }}
        scroll={{ x: 900 }}
        size="small"
        locale={{ emptyText: 'SMS tarixi topilmadi' }}
      />
    </StyledCard>
  )
}

// ===================================================================
// PROVIDERS TAB — SMS providerlarni sozlash
// ===================================================================

function SmsProvidersTab() {
  const { data: providers, isLoading } = useSmsProviders()
  const setDefault = useSetDefaultProvider()
  const setGateway = useSetSmsGatewayConfig()
  const testGateway = useTestSmsGateway()
  const [gatewayForm] = Form.useForm()

  const handleSetDefault = async (provider: SmsProviderName) => {
    await setDefault.mutateAsync({ provider })
    message.success(`Default provider: ${provider}`)
  }

  const handleSaveGateway = async () => {
    try {
      const values = await gatewayForm.validateFields()
      await setGateway.mutateAsync(values)
      message.success('SMS Gateway sozlamalari saqlandi')
      gatewayForm.resetFields(['apiKey'])
    } catch (err: any) {
      if (err?.errorFields) return
      message.error('Saqlashda xato')
    }
  }

  const handleTestGateway = async () => {
    const result = await testGateway.mutateAsync()
    if (result.success) {
      message.success(`Ulanish muvaffaqiyatli! SMS bugun: ${result.data?.usage?.smsCount ?? 0}`)
    } else {
      message.error(`Xato: ${result.error}`)
    }
  }

  if (isLoading) return <div>Yuklanmoqda...</div>

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24}>
        <Alert
          type="info"
          showIcon
          message="Default providerni tanlang — SMS yuborayotganda boshqa provider tanlamasangiz shu ishlatiladi."
        />
      </Col>

      {/* Default provider */}
      <Col xs={24}>
        <StyledCard title="Default provider">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Radio.Group
              value={providers?.defaultProvider}
              onChange={(e) => handleSetDefault(e.target.value)}
            >
              <Space direction="vertical">
                <Radio value="semysms">
                  <Space>
                    SemySMS
                    <Tag color="green" icon={<CheckCircleOutlined />}>Sozlangan</Tag>
                  </Space>
                </Radio>
                <Radio value="sms_gateway" disabled={!providers?.providers?.sms_gateway?.configured}>
                  <Space>
                    SMS Gateway
                    {providers?.providers?.sms_gateway?.configured ? (
                      <Tag color="green" icon={<CheckCircleOutlined />}>Sozlangan</Tag>
                    ) : (
                      <Tag color="red" icon={<ExclamationCircleOutlined />}>Sozlanmagan</Tag>
                    )}
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>
          </Space>
        </StyledCard>
      </Col>

      {/* SemySMS — status only, token hard-coded backendda */}
      <Col xs={24} md={12}>
        <StyledCard title={<Space><ApiOutlined />SemySMS</Space>}>
          <Space direction="vertical">
            <Tag color="green" icon={<CheckCircleOutlined />}>Sozlangan</Tag>
            <Text type="secondary">Endpoint: semysms.net/api/3</Text>
            <Text type="secondary">Token backendda qattiq kiritilgan (eski).</Text>
          </Space>
        </StyledCard>
      </Col>

      {/* SMS Gateway — sozlanadigan */}
      <Col xs={24} md={12}>
        <StyledCard
          title={<Space><ApiOutlined />SMS Gateway (o'zimiz)</Space>}
          extra={
            <Button size="small" onClick={handleTestGateway} loading={testGateway.isPending}>
              Tekshirish
            </Button>
          }
        >
          <Form
            form={gatewayForm}
            layout="vertical"
            initialValues={{
              url: providers?.providers?.sms_gateway?.url,
              apiKey: '',
            }}
          >
            <Form.Item label="URL" name="url" rules={[{ required: true, message: 'URL kiriting' }]}>
              <Input placeholder="http://185.207.251.184:8086" />
            </Form.Item>
            <Form.Item
              label={
                <Space>
                  API Key
                  {providers?.providers?.sms_gateway?.configured && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      (joriy: {providers?.providers?.sms_gateway?.apiKey})
                    </Text>
                  )}
                </Space>
              }
              name="apiKey"
            >
              <Input.Password placeholder="sk_..." />
            </Form.Item>
            <Button type="primary" onClick={handleSaveGateway} loading={setGateway.isPending} block>
              Saqlash
            </Button>
          </Form>
        </StyledCard>
      </Col>
    </Row>
  )
}
