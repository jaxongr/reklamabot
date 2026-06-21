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
  Modal,
  Tooltip,
} from 'antd'
import {
  SendOutlined,
  HistoryOutlined,
  CarOutlined,
  ShoppingOutlined,
  StopOutlined,
  DashboardOutlined,
  SearchOutlined,
  UserOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  CloudServerOutlined,
  PhoneOutlined,
  PlusOutlined,
  DeleteOutlined,
  SafetyOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MessageOutlined,
} from '@ant-design/icons'
import styled from 'styled-components'
import type { ColumnsType } from 'antd/es/table'
import {
  useTgSmsSessions,
  useTgSmsStats,
  useTgSmsHistory,
  useTgSmsSendCode,
  useTgSmsSignIn,
  useTgSmsToggle,
  useTgSmsReconnect,
  useTgSmsCheckSpam,
  useTgSmsDelete,
  useTgSmsSend,
  useTgSmsAutoConfig,
  useTgSmsSaveAutoConfig,
  useTgSmsDriversList,
  useTgSmsOrdersList,
  useTgSmsBlockedList,
  useTgSmsAllTargets,
  useTgSmsSendDrivers,
  useTgSmsSendToOrders,
  useTgSmsSendToBlocked,
  useTgSmsSendToAll,
} from '../../hooks/useApi'
import dayjs from 'dayjs'

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

const StatusConfig: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'blue', label: 'Kutilmoqda' },
  SENT: { color: 'green', label: 'Yuborildi' },
  DELIVERED: { color: 'cyan', label: 'Yetkazildi' },
  READ: { color: 'geekblue', label: "O'qildi" },
  FAILED: { color: 'red', label: 'Xato' },
  SPAM_BLOCKED: { color: 'volcano', label: 'Spam bloklandi' },
}

const CategoryConfig: Record<string, { color: string; label: string; icon: any }> = {
  GENERAL: { color: 'default', label: 'Umumiy', icon: <MessageOutlined /> },
  DRIVER: { color: 'blue', label: 'Haydovchi', icon: <CarOutlined /> },
  ORDER: { color: 'green', label: 'Order', icon: <ShoppingOutlined /> },
  BLOCKED: { color: 'red', label: 'Bloklangan', icon: <StopOutlined /> },
}

const SessionStatusConfig: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'default', label: 'Kutilmoqda' },
  CONNECTING: { color: 'processing', label: 'Ulanmoqda' },
  ACTIVE: { color: 'success', label: 'Faol' },
  SPAM: { color: 'error', label: 'Spam' },
  FROZEN: { color: 'warning', label: 'Muzlatilgan' },
  BANNED: { color: 'error', label: 'Bloklangan' },
  DISCONNECTED: { color: 'default', label: 'Uzilgan' },
}

function formatDate(dateStr: string) {
  return dayjs(dateStr).format('DD.MM.YYYY HH:mm')
}

// ===================================================================
// MAIN COMPONENT
// ===================================================================

export default function TelegramSms() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <PageWrapper>
      <PageHeader>
        <Title level={3} style={{ margin: 0 }}>
          <SendOutlined style={{ marginRight: 8 }} />
          Telegram SMS
        </Title>
      </PageHeader>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'dashboard',
            label: <Space><DashboardOutlined /> Dashboard</Space>,
            children: <TgSmsDashboard />,
          },
          {
            key: 'sessions',
            label: <Space><CloudServerOutlined /> Sessionlar</Space>,
            children: <TgSmsSessions />,
          },
          {
            key: 'drivers',
            label: <Space><CarOutlined /> Haydovchilar</Space>,
            children: <TgSmsDrivers />,
          },
          {
            key: 'orders',
            label: <Space><ShoppingOutlined /> Orderlar</Space>,
            children: <TgSmsOrders />,
          },
          {
            key: 'blocked',
            label: <Space><StopOutlined /> Bloklangan</Space>,
            children: <TgSmsBlocked />,
          },
          {
            key: 'all',
            label: <Space><GlobalOutlined /> Hammaga</Space>,
            children: <TgSmsAll />,
          },
          {
            key: 'auto',
            label: <Space><ThunderboltOutlined /> Avto-TG SMS</Space>,
            children: <TgSmsAutoConfig />,
          },
          {
            key: 'history',
            label: <Space><HistoryOutlined /> Tarix</Space>,
            children: <TgSmsHistory />,
          },
        ]}
      />
    </PageWrapper>
  )
}

// ===================================================================
// DASHBOARD TAB
// ===================================================================

function TgSmsDashboard() {
  const { data: stats } = useTgSmsStats()
  const [form] = Form.useForm()
  const sendDm = useTgSmsSend()

  const handleSend = async () => {
    try {
      const values = await form.validateFields()
      const result = await sendDm.mutateAsync(values)
      if (result.success) {
        message.success('Telegram xabar yuborildi')
        form.resetFields()
      } else {
        message.error(result.error || 'Yuborishda xato')
      }
    } catch (err: any) {
      if (err?.errorFields) return
      message.error(err?.response?.data?.message || 'Xato')
    }
  }

  return (
    <>
      <StatRow gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <StyledCard>
            <Statistic
              title="Faol sessionlar"
              value={stats?.activeSessions || 0}
              suffix={`/ ${stats?.totalSessions || 0}`}
              prefix={<CloudServerOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </StyledCard>
        </Col>
        <Col xs={12} sm={6}>
          <StyledCard>
            <Statistic
              title="Yuborildi"
              value={stats?.sentCount || 0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </StyledCard>
        </Col>
        <Col xs={12} sm={6}>
          <StyledCard>
            <Statistic
              title="Xato"
              value={stats?.failedCount || 0}
              valueStyle={{ color: '#f5222d' }}
              prefix={<CloseCircleOutlined />}
            />
          </StyledCard>
        </Col>
        <Col xs={12} sm={6}>
          <StyledCard>
            <Statistic title="Bugun" value={stats?.todayCount || 0} prefix={<MessageOutlined />} />
          </StyledCard>
        </Col>
      </StatRow>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <StyledCard
            title={<Space><SendOutlined style={{ color: '#1890ff' }} /> Tezkor TG xabar yuborish</Space>}
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="targetTelegramId"
                label="Telegram ID"
                rules={[{ required: true, message: 'Telegram ID kiriting' }]}
              >
                <Input placeholder="123456789 yoki @username" prefix={<UserOutlined />} />
              </Form.Item>
              <Form.Item name="targetName" label="Ism (ixtiyoriy)">
                <Input placeholder="Ism..." />
              </Form.Item>
              <Form.Item
                name="message"
                label="Xabar matni"
                rules={[
                  { required: true, message: 'Xabar matni kiriting' },
                  { max: 4000, message: 'Xabar 4000 belgidan oshmasligi kerak' },
                ]}
              >
                <TextArea rows={4} maxLength={4000} showCount placeholder="Telegram xabar matni..." />
              </Form.Item>
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={sendDm.isPending}
                onClick={handleSend}
                block
              >
                TG xabar yuborish
              </Button>
            </Form>
          </StyledCard>
        </Col>

        <Col xs={24} md={12}>
          <StyledCard title="Statistika">
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <Card size="small" style={{ borderRadius: 8 }}>
                  <Statistic title="Spam bloklangan" value={stats?.spamCount || 0} prefix={<StopOutlined />} valueStyle={{ color: '#fa8c16' }} />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ borderRadius: 8 }}>
                  <Statistic title="Ulangan hozir" value={stats?.connectedNow || 0} prefix={<LinkOutlined />} valueStyle={{ color: '#52c41a' }} />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ borderRadius: 8 }}>
                  <Statistic title="Spam sessionlar" value={stats?.spamSessions || 0} prefix={<StopOutlined />} valueStyle={{ color: '#ff4d4f' }} />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ borderRadius: 8 }}>
                  <Statistic title="Jami xabarlar" value={stats?.totalMessages || 0} prefix={<MessageOutlined />} />
                </Card>
              </Col>
            </Row>
          </StyledCard>
        </Col>
      </Row>
    </>
  )
}

// ===================================================================
// SESSIONS TAB
// ===================================================================

function TgSmsSessions() {
  const { data: sessions, isLoading } = useTgSmsSessions()
  const [addModal, setAddModal] = useState(false)
  const [codeModal, setCodeModal] = useState<{ sessionId: string; phone: string } | null>(null)
  const [addForm] = Form.useForm()
  const [codeForm] = Form.useForm()

  const sendCodeMut = useTgSmsSendCode()
  const signInMut = useTgSmsSignIn()
  const toggleMut = useTgSmsToggle()
  const reconnectMut = useTgSmsReconnect()
  const checkSpamMut = useTgSmsCheckSpam()
  const deleteMut = useTgSmsDelete()

  const handleAdd = async () => {
    try {
      const values = await addForm.validateFields()
      const result = await sendCodeMut.mutateAsync(values)
      setAddModal(false)
      addForm.resetFields()
      setCodeModal({ sessionId: result.sessionId, phone: values.phone })
      message.success('Kod yuborildi!')
    } catch (err: any) {
      message.error(err?.response?.data?.message || err?.message || 'Xatolik')
    }
  }

  const handleSignIn = async () => {
    try {
      const values = await codeForm.validateFields()
      await signInMut.mutateAsync({
        sessionId: codeModal!.sessionId,
        code: values.code,
        password: values.password,
      })
      setCodeModal(null)
      codeForm.resetFields()
      message.success('Session muvaffaqiyatli ulandi!')
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Xatolik'
      if (errMsg.includes('2FA')) message.warning('2FA parol kerak')
      else message.error(errMsg)
    }
  }

  const columns: ColumnsType<any> = [
    {
      title: 'Telefon',
      dataIndex: 'phone',
      width: 150,
      render: (phone: string) => <Text strong><PhoneOutlined /> {phone}</Text>,
    },
    { title: 'Nomi', dataIndex: 'name', width: 160, ellipsis: true },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 130,
      render: (status: string, record: any) => {
        const cfg = SessionStatusConfig[status] || { color: 'default', label: status }
        return (
          <Space direction="vertical" size={0}>
            <Tag color={cfg.color}>{cfg.label}</Tag>
            {record.spamType && (
              <Text type="danger" style={{ fontSize: 11 }}>
                {record.spamType}
                {record.spamExpectedEnd && ` (${dayjs(record.spamExpectedEnd).format('DD.MM HH:mm')})`}
              </Text>
            )}
          </Space>
        )
      },
    },
    {
      title: 'Yuborildi',
      dataIndex: 'messagesSent',
      width: 90,
      render: (v: number) => <Text type="success">{v}</Text>,
    },
    {
      title: 'Xato',
      dataIndex: 'messagesFailed',
      width: 80,
      render: (v: number) => v > 0 ? <Text type="danger">{v}</Text> : <Text type="secondary">0</Text>,
    },
    {
      title: "So'nggi",
      dataIndex: 'lastUsedAt',
      width: 130,
      render: (d: string) => d ? <Text style={{ fontSize: 12 }}>{dayjs(d).format('DD.MM HH:mm')}</Text> : '—',
    },
    {
      title: 'Yoqilgan',
      dataIndex: 'isEnabled',
      width: 80,
      render: (enabled: boolean, record: any) => (
        <Switch size="small" checked={enabled} loading={toggleMut.isPending}
          onChange={(checked) => toggleMut.mutate({ sessionId: record.id, enabled: checked })}
        />
      ),
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 150,
      render: (_: unknown, record: any) => (
        <Space size={4}>
          <Tooltip title="Qayta ulash">
            <Button size="small" icon={<LinkOutlined />}
              onClick={() => reconnectMut.mutate(record.id)} loading={reconnectMut.isPending} />
          </Tooltip>
          <Tooltip title="Spam tekshirish">
            <Button size="small" icon={<SafetyOutlined />}
              onClick={async () => {
                try {
                  const result = await checkSpamMut.mutateAsync(record.id)
                  result.spamStatus === 'CLEAN'
                    ? message.success("Toza — spam yo'q")
                    : message.warning(`Status: ${result.spamStatus}`)
                } catch (e: any) { message.error(e?.message || 'Xatolik') }
              }}
              loading={checkSpamMut.isPending} />
          </Tooltip>
          <Popconfirm title="O'chirishni tasdiqlaysizmi?" onConfirm={() => deleteMut.mutate(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Text type="secondary">Telegram orqali xabar yuborish uchun sessionlar</Text>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModal(true)}>
          Session qo'shish
        </Button>
      </div>

      <StyledCard>
        <Table columns={columns} dataSource={sessions || []} rowKey="id"
          loading={isLoading} size="small" scroll={{ x: 1000 }} pagination={false} />
      </StyledCard>

      <Modal title="Yangi TG SMS session" open={addModal} onOk={handleAdd}
        onCancel={() => { setAddModal(false); addForm.resetFields() }}
        confirmLoading={sendCodeMut.isPending} okText="Kod yuborish">
        <Form form={addForm} layout="vertical">
          <Form.Item name="phone" label="Telefon raqam" rules={[{ required: true }]}>
            <Input placeholder="+998901234567" prefix={<PhoneOutlined />} />
          </Form.Item>
          <Form.Item name="name" label="Nomi (ixtiyoriy)">
            <Input placeholder="SMS Bot 1" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={`Kodni kiriting (${codeModal?.phone || ''})`} open={!!codeModal}
        onOk={handleSignIn} onCancel={() => { setCodeModal(null); codeForm.resetFields() }}
        confirmLoading={signInMut.isPending} okText="Kirish">
        <Form form={codeForm} layout="vertical">
          <Form.Item name="code" label="Tasdiqlash kodi" rules={[{ required: true }]}>
            <Input placeholder="12345" maxLength={6} />
          </Form.Item>
          <Form.Item name="password" label="2FA parol (agar kerak bo'lsa)">
            <Input.Password placeholder="Parol" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

// ===================================================================
// DRIVERS TAB
// ===================================================================

function TgSmsDrivers() {
  const { data: drivers, isLoading } = useTgSmsDriversList()
  const sendToDrivers = useTgSmsSendDrivers()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [smsText, setSmsText] = useState('')

  const handleSend = async () => {
    if (!smsText.trim()) return message.warning('Xabar matni kiriting')
    try {
      const result = await sendToDrivers.mutateAsync({
        message: smsText,
        driverIds: selectedIds.length > 0 ? selectedIds : undefined,
      })
      const sent = Array.isArray(result) ? result.filter((r: any) => r.success).length : 0
      message.success(`${sent} ta haydovchiga TG xabar yuborildi`)
      setSmsText('')
      setSelectedIds([])
    } catch { message.error('Yuborishda xato') }
  }

  const columns: ColumnsType<any> = [
    { title: 'Ism', dataIndex: 'fullName', width: 150, ellipsis: true, render: (n: string) => { if (!n) return '—'; const s = String(n).trim(); return s.length > 15 ? s.slice(0, 15) + '…' : s; } },
    { title: 'Telefon', dataIndex: 'phone', render: (p: string) => p ? <Text code>{p}</Text> : '—' },
    { title: 'TG ID', key: 'tgId', render: (_: any, r: any) => <Text code style={{ fontSize: 11 }}>{r.user?.telegramId}</Text> },
    { title: 'Mashina', dataIndex: 'vehicleType', render: (v: string) => v ? <Tag>{v}</Tag> : '—' },
    { title: 'Shahar', dataIndex: 'lastCity', render: (c: string) => c || '—' },
  ]

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={10}>
        <StyledCard title={<Space><CarOutlined style={{ color: '#1677ff' }} /> Haydovchilarga TG xabar</Space>}>
          <Form layout="vertical">
            <Form.Item label="Xabar matni">
              <TextArea rows={4} maxLength={4000} showCount value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                placeholder="Haydovchilarga yuboriladigan Telegram xabar matni..." />
            </Form.Item>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary">
                {selectedIds.length > 0 ? `${selectedIds.length} ta tanlangan` : `Barcha haydovchilarga (${drivers?.length || 0} ta)`}
              </Text>
              <Button type="primary" icon={<SendOutlined />} loading={sendToDrivers.isPending}
                onClick={handleSend} disabled={!smsText.trim()} block>
                TG xabar yuborish
              </Button>
            </Space>
          </Form>
        </StyledCard>
      </Col>
      <Col xs={24} lg={14}>
        <StyledCard title={`Haydovchilar (${drivers?.length || 0})`}>
          <Table columns={columns} dataSource={drivers || []} rowKey="id" loading={isLoading} size="small"
            pagination={{ pageSize: 10, showTotal: (t) => `Jami: ${t}` }}
            rowSelection={{ selectedRowKeys: selectedIds, onChange: (keys) => setSelectedIds(keys as string[]) }}
            locale={{ emptyText: 'Haydovchi topilmadi' }} />
        </StyledCard>
      </Col>
    </Row>
  )
}

// ===================================================================
// ORDERS TAB
// ===================================================================

function TgSmsOrders() {
  const [search, setSearch] = useState('')
  const [orderType, setOrderType] = useState<string | undefined>()
  const { data: orders, isLoading } = useTgSmsOrdersList({ type: orderType, search, limit: 100 })
  const sendToOrders = useTgSmsSendToOrders()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [smsText, setSmsText] = useState('')

  const handleSend = async () => {
    if (!smsText.trim()) return message.warning('Xabar matni kiriting')
    if (selectedIds.length === 0) return message.warning('Kamida 1 ta order tanlang')
    try {
      const result = await sendToOrders.mutateAsync({ message: smsText, orderIds: selectedIds })
      const sent = Array.isArray(result) ? result.filter((r: any) => r.success).length : 0
      message.success(`${sent} ta raqamga TG xabar yuborildi`)
      setSmsText(''); setSelectedIds([])
    } catch { message.error('Yuborishda xato') }
  }

  const columns: ColumnsType<any> = [
    { title: 'TG ID', dataIndex: 'senderTelegramId', width: 120, render: (id: string) => <Text code style={{ fontSize: 11 }}>{id}</Text> },
    { title: 'Ism', dataIndex: 'senderName', width: 150, ellipsis: true, render: (n: string) => { if (!n) return '—'; const s = String(n).trim(); return s.length > 15 ? s.slice(0, 15) + '…' : s; } },
    {
      title: 'Marshrut', key: 'route',
      render: (_: any, r: any) => `${r.cargoFrom || '—'} → ${r.cargoTo || '—'}`,
    },
    {
      title: 'Tur', dataIndex: 'type', width: 100,
      render: (t: string) => <Tag color={t === 'DRIVER' ? 'blue' : 'green'}>{t === 'DRIVER' ? 'Haydovchi' : 'Yuk'}</Tag>,
    },
    { title: 'Sana', dataIndex: 'createdAt', width: 130, render: (d: string) => formatDate(d) },
  ]

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={10}>
        <StyledCard title={<Space><ShoppingOutlined style={{ color: '#52c41a' }} /> Orderlarga TG xabar</Space>}>
          <Form layout="vertical">
            <Form.Item label="Xabar matni">
              <TextArea rows={4} maxLength={4000} showCount value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                placeholder="Order egalariga yuboriladigan TG xabar..." />
            </Form.Item>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary">{selectedIds.length} ta order tanlangan</Text>
              <Button type="primary" icon={<SendOutlined />} loading={sendToOrders.isPending}
                onClick={handleSend} disabled={!smsText.trim() || selectedIds.length === 0} block>
                TG xabar yuborish ({selectedIds.length} ta)
              </Button>
            </Space>
          </Form>
        </StyledCard>
      </Col>
      <Col xs={24} lg={14}>
        <StyledCard title={`Orderlar (${orders?.length || 0})`}
          extra={
            <Space>
              <Select placeholder="Tur" allowClear style={{ width: 120 }} value={orderType} onChange={setOrderType}
                options={[{ value: 'CARGO', label: 'Yuk' }, { value: 'DRIVER', label: 'Haydovchi' }]} />
              <Input placeholder="Qidirish..." prefix={<SearchOutlined />} style={{ width: 180 }}
                value={search} onChange={(e) => setSearch(e.target.value)} allowClear />
            </Space>
          }>
          <Table columns={columns} dataSource={orders || []} rowKey="id" loading={isLoading} size="small"
            pagination={{ pageSize: 10, showTotal: (t) => `Jami: ${t}` }}
            rowSelection={{ selectedRowKeys: selectedIds, onChange: (keys) => setSelectedIds(keys as string[]) }}
            locale={{ emptyText: 'Order topilmadi' }} />
        </StyledCard>
      </Col>
    </Row>
  )
}

// ===================================================================
// BLOCKED TAB
// ===================================================================

function TgSmsBlocked() {
  const { data: blocked, isLoading } = useTgSmsBlockedList()
  const sendToBlocked = useTgSmsSendToBlocked()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [smsText, setSmsText] = useState('')

  const handleSend = async () => {
    if (!smsText.trim()) return message.warning('Xabar matni kiriting')
    try {
      const result = await sendToBlocked.mutateAsync({
        message: smsText,
        blockedIds: selectedIds.length > 0 ? selectedIds : undefined,
      })
      const sent = Array.isArray(result) ? result.filter((r: any) => r.success).length : 0
      message.success(`${sent} ta raqamga TG xabar yuborildi`)
      setSmsText(''); setSelectedIds([])
    } catch { message.error('Yuborishda xato') }
  }

  const columns: ColumnsType<any> = [
    { title: 'TG ID', dataIndex: 'senderTelegramId', width: 120, render: (id: string) => <Text code style={{ fontSize: 11 }}>{id}</Text> },
    { title: 'Ism', dataIndex: 'senderName', width: 150, ellipsis: true, render: (n: string) => { if (!n) return '—'; const s = String(n).trim(); return s.length > 15 ? s.slice(0, 15) + '…' : s; } },
    { title: 'Telefon', dataIndex: 'phone', render: (p: string) => p ? <Text code>{p}</Text> : '—' },
    { title: 'Username', dataIndex: 'senderUsername', render: (u: string) => u ? `@${u}` : '—' },
    { title: 'Sabab', dataIndex: 'reason', render: (r: string) => <Tag color="red">{r}</Tag> },
  ]

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={10}>
        <StyledCard title={<Space><StopOutlined style={{ color: '#f5222d' }} /> Bloklanganlarga TG xabar</Space>}>
          <Form layout="vertical">
            <Form.Item label="Xabar matni">
              <TextArea rows={4} maxLength={4000} showCount value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                placeholder="Bloklangan foydalanuvchilarga TG xabar..." />
            </Form.Item>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary">
                {selectedIds.length > 0 ? `${selectedIds.length} ta tanlangan` : `Barchasi (${blocked?.length || 0} ta)`}
              </Text>
              <Button type="primary" danger icon={<SendOutlined />} loading={sendToBlocked.isPending}
                onClick={handleSend} disabled={!smsText.trim()} block>
                TG xabar yuborish
              </Button>
            </Space>
          </Form>
        </StyledCard>
      </Col>
      <Col xs={24} lg={14}>
        <StyledCard title={`Bloklangan foydalanuvchilar (${blocked?.length || 0})`}>
          <Table columns={columns} dataSource={blocked || []} rowKey="id" loading={isLoading} size="small"
            pagination={{ pageSize: 10, showTotal: (t) => `Jami: ${t}` }}
            rowSelection={{ selectedRowKeys: selectedIds, onChange: (keys) => setSelectedIds(keys as string[]) }}
            locale={{ emptyText: 'Topilmadi' }} />
        </StyledCard>
      </Col>
    </Row>
  )
}

// ===================================================================
// ALL TAB
// ===================================================================

function TgSmsAll() {
  const { data: targets, isLoading } = useTgSmsAllTargets()
  const sendToAll = useTgSmsSendToAll()
  const [smsText, setSmsText] = useState('')

  const handleSend = async () => {
    if (!smsText.trim()) return message.warning('Xabar matni kiriting')
    try {
      const result = await sendToAll.mutateAsync({ message: smsText })
      const sent = Array.isArray(result) ? result.filter((r: any) => r.success).length : 0
      message.success(`${sent} ta foydalanuvchiga TG xabar yuborildi`)
      setSmsText('')
    } catch { message.error('Yuborishda xato') }
  }

  const sourceColors: Record<string, string> = {
    'Yuk order': 'green',
    'Haydovchi order': 'blue',
    Bloklangan: 'red',
    Haydovchi: 'cyan',
  }

  const columns: ColumnsType<any> = [
    { title: 'TG ID', dataIndex: 'telegramId', width: 120, render: (id: string) => <Text code style={{ fontSize: 11 }}>{id}</Text> },
    { title: 'Ism', dataIndex: 'name', ellipsis: true },
    { title: 'Telefon', dataIndex: 'phone', width: 150, render: (p: string) => p ? <Text code>{p}</Text> : '—' },
    { title: 'Manba', dataIndex: 'source', width: 150, render: (s: string) => <Tag color={sourceColors[s] || 'default'}>{s}</Tag> },
  ]

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={10}>
        <StyledCard title={<Space><GlobalOutlined style={{ color: '#722ed1' }} /> Hammaga TG xabar</Space>}>
          <Alert
            message={`Jami ${targets?.length || 0} ta noyob TG foydalanuvchi`}
            description="Orderlar, bloklangan foydalanuvchilar va haydovchilardan yig'ilgan barcha Telegram akkauntlar"
            type="info" showIcon style={{ marginBottom: 16 }}
          />
          <Form layout="vertical">
            <Form.Item label="Xabar matni">
              <TextArea rows={4} maxLength={4000} showCount value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                placeholder="Barcha Telegram foydalanuvchilarga yuboriladigan xabar..." />
            </Form.Item>
            <Popconfirm title={`${targets?.length || 0} ta foydalanuvchiga TG xabar yubormoqchimisiz?`}
              description="Bu jarayon biroz vaqt olishi mumkin" onConfirm={handleSend} okText="Ha" cancelText="Yo'q">
              <Button type="primary" icon={<SendOutlined />} loading={sendToAll.isPending}
                disabled={!smsText.trim()} block style={{ background: '#722ed1', borderColor: '#722ed1' }}>
                Hammaga TG xabar ({targets?.length || 0} ta)
              </Button>
            </Popconfirm>
          </Form>
        </StyledCard>
      </Col>
      <Col xs={24} lg={14}>
        <StyledCard title={`Barcha TG foydalanuvchilar (${targets?.length || 0})`}>
          <Table columns={columns} dataSource={targets || []} rowKey="telegramId" loading={isLoading} size="small"
            pagination={{ pageSize: 15, showTotal: (t) => `Jami: ${t}` }}
            locale={{ emptyText: 'Topilmadi' }} />
        </StyledCard>
      </Col>
    </Row>
  )
}

// ===================================================================
// AUTO-TG SMS TAB
// ===================================================================

function TgSmsAutoConfig() {
  const { data: config, isLoading } = useTgSmsAutoConfig()
  const saveConfig = useTgSmsSaveAutoConfig()

  const [orderEnabled, setOrderEnabled] = useState(false)
  const [orderTemplate, setOrderTemplate] = useState('')
  const [driverOrderEnabled, setDriverOrderEnabled] = useState(false)
  const [driverOrderTemplate, setDriverOrderTemplate] = useState('')
  const [blockedEnabled, setBlockedEnabled] = useState(false)
  const [blockedTemplate, setBlockedTemplate] = useState('')
  const [loaded, setLoaded] = useState(false)

  if (config && !loaded) {
    setOrderEnabled(config.orderEnabled)
    setOrderTemplate(config.orderTemplate)
    setDriverOrderEnabled(config.driverOrderEnabled)
    setDriverOrderTemplate(config.driverOrderTemplate)
    setBlockedEnabled(config.blockedEnabled)
    setBlockedTemplate(config.blockedTemplate)
    setLoaded(true)
  }

  const handleSave = async () => {
    try {
      await saveConfig.mutateAsync({
        orderEnabled, orderTemplate,
        driverOrderEnabled, driverOrderTemplate,
        blockedEnabled, blockedTemplate,
      })
      message.success('Avto-TG SMS sozlamalari saqlandi')
    } catch { message.error('Saqlashda xato') }
  }

  if (isLoading) return <Card loading />

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24}>
        <Alert
          message="Avto-TG SMS — yangi topilgan foydalanuvchilarga Telegram orqali avtomatik xabar"
          description="Kuzatuv tizimi yangi order yoki bloklangan foydalanuvchi topganda, ularning Telegram akkauntiga avtomatik xabar yuboriladi."
          type="info" showIcon style={{ marginBottom: 24 }}
        />
      </Col>

      <Col xs={24} md={8}>
        <StyledCard title={<Space><ShoppingOutlined style={{ color: '#52c41a' }} /> Yuk orderlari <Switch checked={orderEnabled} onChange={setOrderEnabled} /></Space>}>
          <Form layout="vertical">
            <Form.Item label="Shablon" help="O'zgaruvchilar: {marshrut}, {tur}, {ism}">
              <TextArea rows={4} maxLength={2000} showCount value={orderTemplate}
                onChange={(e) => setOrderTemplate(e.target.value)} disabled={!orderEnabled}
                placeholder="Sizning yuk e'loningiz topildi! {marshrut}" />
            </Form.Item>
          </Form>
        </StyledCard>
      </Col>

      <Col xs={24} md={8}>
        <StyledCard title={<Space><CarOutlined style={{ color: '#1677ff' }} /> Haydovchi orderlari <Switch checked={driverOrderEnabled} onChange={setDriverOrderEnabled} /></Space>}>
          <Form layout="vertical">
            <Form.Item label="Shablon" help="O'zgaruvchilar: {marshrut}, {tur}, {ism}">
              <TextArea rows={4} maxLength={2000} showCount value={driverOrderTemplate}
                onChange={(e) => setDriverOrderTemplate(e.target.value)} disabled={!driverOrderEnabled}
                placeholder="Sizning haydovchi e'loningiz topildi! {marshrut}" />
            </Form.Item>
          </Form>
        </StyledCard>
      </Col>

      <Col xs={24} md={8}>
        <StyledCard title={<Space><StopOutlined style={{ color: '#f5222d' }} /> Bloklangan <Switch checked={blockedEnabled} onChange={setBlockedEnabled} /></Space>}>
          <Form layout="vertical">
            <Form.Item label="Shablon" help="O'zgaruvchilar: {ism}, {sabab}">
              <TextArea rows={4} maxLength={2000} showCount value={blockedTemplate}
                onChange={(e) => setBlockedTemplate(e.target.value)} disabled={!blockedEnabled}
                placeholder="Hurmatli {ism}, e'loningiz bloklandi." />
            </Form.Item>
          </Form>
        </StyledCard>
      </Col>

      <Col xs={24}>
        <Button type="primary" icon={<ThunderboltOutlined />} loading={saveConfig.isPending}
          onClick={handleSave} size="large" style={{ background: '#fa8c16', borderColor: '#fa8c16' }}>
          Sozlamalarni saqlash
        </Button>
      </Col>
    </Row>
  )
}

// ===================================================================
// HISTORY TAB
// ===================================================================

function TgSmsHistory() {
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState<string | undefined>()
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [search, setSearch] = useState('')

  const { data: historyData, isLoading } = useTgSmsHistory({
    page, limit: 30, category, status: statusFilter as any, search: search || undefined,
  })

  const history = historyData?.data ?? []
  const total = historyData?.pagination?.total ?? 0

  const columns: ColumnsType<any> = [
    {
      title: 'Kimga', key: 'target', width: 180,
      render: (_: any, r: any) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 13 }}>{r.targetName || '—'}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>ID: {r.targetTelegramId || '—'}</Text>
        </Space>
      ),
    },
    { title: 'Xabar', dataIndex: 'message', ellipsis: true },
    {
      title: 'Kategoriya', dataIndex: 'category', width: 130,
      render: (cat: string) => {
        const cfg = CategoryConfig[cat] ?? { color: 'default', label: cat, icon: null }
        return <Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag>
      },
    },
    {
      title: 'Status', dataIndex: 'status', width: 130,
      render: (status: string) => {
        const cfg = StatusConfig[status] ?? { color: 'default', label: status }
        return <Tag color={cfg.color}>{cfg.label}</Tag>
      },
    },
    {
      title: 'Session', key: 'session', width: 120,
      render: (_: any, r: any) => r.session ? <Text style={{ fontSize: 12 }}>{r.session.phone}</Text> : '—',
    },
    {
      title: 'Xato', dataIndex: 'errorMessage', width: 160, ellipsis: true,
      render: (err?: string) => err ? <Text type="danger" style={{ fontSize: 12 }}>{err}</Text> : '—',
    },
    { title: 'Sana', dataIndex: 'createdAt', width: 140, render: (d: string) => formatDate(d) },
  ]

  return (
    <StyledCard
      title={<Space><HistoryOutlined style={{ color: '#1677ff' }} /> TG xabar tarixi <Badge count={total} style={{ backgroundColor: '#1677ff' }} /></Space>}
      extra={
        <Space wrap>
          <Select placeholder="Kategoriya" allowClear style={{ width: 140 }} value={category} onChange={setCategory}
            options={Object.entries(CategoryConfig).map(([k, v]) => ({ value: k, label: v.label }))} />
          <Select placeholder="Status" allowClear style={{ width: 140 }} value={statusFilter} onChange={setStatusFilter}
            options={Object.entries(StatusConfig).map(([k, v]) => ({ value: k, label: v.label }))} />
          <Input placeholder="Qidirish..." prefix={<SearchOutlined />} style={{ width: 180 }}
            value={search} onChange={(e) => setSearch(e.target.value)} allowClear />
        </Space>
      }
    >
      <Table columns={columns} dataSource={history} rowKey="id" loading={isLoading}
        pagination={{ current: page, pageSize: 30, total, onChange: setPage, showTotal: (t) => `Jami: ${t}`, showSizeChanger: false }}
        scroll={{ x: 1000 }} size="small" locale={{ emptyText: 'TG xabar tarixi topilmadi' }} />
    </StyledCard>
  )
}
