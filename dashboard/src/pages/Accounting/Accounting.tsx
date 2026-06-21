import React, { useState, useMemo } from 'react'
import {
  Card, Tabs, Table, Button, Row, Col, Statistic, DatePicker, Select, Modal,
  Form, Input, InputNumber, Tag, Space, Popconfirm, message, Empty, Tooltip, Badge, Image, Avatar,
} from 'antd'
import {
  DollarOutlined, RiseOutlined, FallOutlined, SyncOutlined,
  PlusOutlined, DeleteOutlined, EditOutlined, DownloadOutlined,
  AccountBookOutlined, ArrowUpOutlined, ArrowDownOutlined,
  CreditCardOutlined, MobileOutlined, CheckCircleOutlined,
  CloseCircleOutlined, ClockCircleOutlined, UserOutlined,
  WalletOutlined, BankOutlined, SafetyOutlined,
} from '@ant-design/icons'
import styled from 'styled-components'
import dayjs, { Dayjs } from 'dayjs'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import {
  useAccountingSummary, useAccountingEntries, useAccountingCategories,
  useAccountingChartData, useCreateAccountingEntry, useUpdateAccountingEntry,
  useDeleteAccountingEntry, useCreateAccountingCategory, useDeleteAccountingCategory,
  useSyncAccounting, useExportAccounting,
} from '../../hooks/useApi'
import { usePaymentAnalytics } from '../../hooks/useAccounting'
import type { AccountingEntry, AccountingCategory, AccountingEntryType } from '../../types'
import type { PaymentItem } from '../../hooks/useAccounting'

const { RangePicker } = DatePicker

// ==================== STYLED ====================

const PageContainer = styled.div`
  .ant-card { border-radius: 12px; }
`
const SummaryCard = styled(Card)<{ $gradient: string }>`
  border-radius: 16px !important;
  background: ${p => p.$gradient};
  border: none;
  .ant-statistic-title { color: rgba(255,255,255,0.85); font-size: 14px; }
  .ant-statistic-content { color: #fff; }
  .ant-statistic-content-value { font-weight: 700; }
`
const ChartCard = styled(Card)`
  border-radius: 12px !important;
  margin-top: 16px;
`
const FilterBar = styled.div`
  display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; align-items: center;
`
const CategoryTag = styled(Tag)`
  border-radius: 6px; padding: 2px 10px; font-size: 13px;
`
const ChannelCard = styled(Card)`
  border-radius: 12px !important;
  text-align: center;
  .ant-statistic-content-value { font-size: 20px; }
`

// ==================== HELPERS ====================

const formatMoney = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} mln`
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)} ming`
  return n.toLocaleString()
}

const PIE_COLORS = ['#52c41a', '#1890ff', '#13c2c2', '#722ed1', '#fa541c', '#eb2f96', '#f5222d', '#fa8c16', '#2f54eb', '#8c8c8c']

const CHANNEL_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  'Dashboard': { color: '#1890ff', icon: <AccountBookOutlined />, label: 'Dashboard' },
  'Bot': { color: '#722ed1', icon: <MobileOutlined />, label: 'Telegram Bot' },
  'Click': { color: '#00b2ff', icon: <CreditCardOutlined />, label: 'Click' },
  'Payme': { color: '#00cccc', icon: <WalletOutlined />, label: 'Payme' },
  'Paynet': { color: '#ff6b00', icon: <BankOutlined />, label: 'Paynet' },
  'Uzum': { color: '#7b2ff7', icon: <SafetyOutlined />, label: 'Uzum' },
  'Karta': { color: '#52c41a', icon: <CreditCardOutlined />, label: 'Karta o\'tkazma' },
  "Noma'lum": { color: '#8c8c8c', icon: <DollarOutlined />, label: "Noma'lum" },
}

const STATUS_MAP: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
  APPROVED: { color: 'green', icon: <CheckCircleOutlined />, text: 'Tasdiqlangan' },
  REJECTED: { color: 'red', icon: <CloseCircleOutlined />, text: 'Rad etilgan' },
  PENDING: { color: 'orange', icon: <ClockCircleOutlined />, text: 'Kutilmoqda' },
  EXPIRED: { color: 'default', icon: <ClockCircleOutlined />, text: 'Muddati o\'tgan' },
}

// ==================== COMPONENT ====================

const Accounting: React.FC = () => {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'), dayjs(),
  ])
  const [groupBy, setGroupBy] = useState<'day' | 'month'>('day')
  const [activeTab, setActiveTab] = useState('overview')
  const [entryPage, setEntryPage] = useState(0)
  const [entryType, setEntryType] = useState<AccountingEntryType | undefined>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<AccountingEntry | null>(null)
  const [catModalOpen, setCatModalOpen] = useState(false)
  const [paymentChannel, setPaymentChannel] = useState<string>('')
  const [paymentStatus, setPaymentStatus] = useState<string>('')
  const [form] = Form.useForm()
  const [catForm] = Form.useForm()

  const dateParams = useMemo(() => ({
    startDate: dateRange[0].format('YYYY-MM-DD'),
    endDate: dateRange[1].format('YYYY-MM-DD'),
  }), [dateRange])

  // ===== API Hooks =====
  const { data: summary, isLoading: summaryLoading } = useAccountingSummary({ ...dateParams, groupBy })
  const { data: entriesData, isLoading: entriesLoading } = useAccountingEntries({
    ...dateParams, type: entryType, skip: entryPage * 50, take: 50,
  })
  const { data: chartData } = useAccountingChartData({ ...dateParams, groupBy })
  const { data: incomeCategories } = useAccountingCategories('INCOME')
  const { data: expenseCategories } = useAccountingCategories('EXPENSE')
  const { data: paymentData, isLoading: paymentsLoading } = usePaymentAnalytics(dateParams)
  const allCategories = useMemo(() => [...(incomeCategories || []), ...(expenseCategories || [])], [incomeCategories, expenseCategories])

  const createEntry = useCreateAccountingEntry()
  const updateEntry = useUpdateAccountingEntry()
  const deleteEntry = useDeleteAccountingEntry()
  const createCategory = useCreateAccountingCategory()
  const deleteCategory = useDeleteAccountingCategory()
  const syncAccounting = useSyncAccounting()
  const exportAccounting = useExportAccounting()

  // ===== Handlers =====
  const handleSync = async () => {
    const result = await syncAccounting.mutateAsync()
    message.success(`Sinxronlandi: ${result.synced} ta yangi yozuv`)
  }

  const handleExport = () => {
    exportAccounting.mutate({ ...dateParams, type: entryType })
    message.info('Eksport yuklanmoqda...')
  }

  const handleEntrySubmit = async () => {
    const values = await form.validateFields()
    if (editingEntry) {
      await updateEntry.mutateAsync({ id: editingEntry.id, ...values, date: values.date.format('YYYY-MM-DD') })
      message.success('Yangilandi')
    } else {
      await createEntry.mutateAsync({ ...values, date: values.date.format('YYYY-MM-DD') })
      message.success('Qo\'shildi')
    }
    setModalOpen(false)
    setEditingEntry(null)
    form.resetFields()
  }

  const handleCategorySubmit = async () => {
    const values = await catForm.validateFields()
    await createCategory.mutateAsync(values)
    message.success('Kategoriya qo\'shildi')
    setCatModalOpen(false)
    catForm.resetFields()
  }

  const openEditModal = (entry: AccountingEntry) => {
    setEditingEntry(entry)
    form.setFieldsValue({
      type: entry.type,
      categoryId: entry.categoryId,
      amount: entry.amount,
      description: entry.description,
      date: dayjs(entry.date),
    })
    setModalOpen(true)
  }

  const openNewModal = (type?: AccountingEntryType) => {
    setEditingEntry(null)
    form.resetFields()
    if (type) form.setFieldValue('type', type)
    setModalOpen(true)
  }

  // ===== Chart data =====
  const barData = summary?.breakdown || []
  const pieData = useMemo(() => {
    if (!chartData) return []
    const map = new Map<string, number>()
    chartData.forEach(d => {
      map.set(d.categoryName, (map.get(d.categoryName) || 0) + d.amount)
    })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [chartData])

  // ===== Filtered payments =====
  const filteredPayments = useMemo(() => {
    if (!paymentData?.payments) return []
    return paymentData.payments.filter(p => {
      if (paymentChannel && p.channel !== paymentChannel) return false
      if (paymentStatus && p.status !== paymentStatus) return false
      return true
    })
  }, [paymentData, paymentChannel, paymentStatus])

  // ===== Channel pie data =====
  const channelPieData = useMemo(() => {
    if (!paymentData?.channelStats) return []
    return Object.entries(paymentData.channelStats).map(([name, s]) => ({
      name: CHANNEL_CONFIG[name]?.label || name,
      value: s.total,
      count: s.count,
    }))
  }, [paymentData])

  // ===== Entry table columns =====
  const entryColumns = [
    {
      title: 'Sana', dataIndex: 'date', width: 110,
      render: (d: string) => dayjs(d).format('DD.MM.YYYY'),
    },
    {
      title: 'Turi', dataIndex: 'type', width: 90,
      render: (t: AccountingEntryType) => (
        <Tag color={t === 'INCOME' ? 'green' : 'red'} icon={t === 'INCOME' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}>
          {t === 'INCOME' ? 'Kirim' : 'Chiqim'}
        </Tag>
      ),
    },
    {
      title: 'Kategoriya', dataIndex: 'category',
      render: (cat: AccountingCategory) => <CategoryTag color={cat.color}>{cat.name}</CategoryTag>,
    },
    {
      title: 'Summa', dataIndex: 'amount', width: 150, align: 'right' as const,
      render: (a: number, r: AccountingEntry) => (
        <span style={{ fontWeight: 600, color: r.type === 'INCOME' ? '#52c41a' : '#f5222d' }}>
          {r.type === 'INCOME' ? '+' : '-'}{formatMoney(a)} so'm
        </span>
      ),
    },
    { title: 'Tavsif', dataIndex: 'description', ellipsis: true },
    {
      title: 'Manba', dataIndex: 'referenceType', width: 100,
      render: (t: string) => <Tag>{t || 'MANUAL'}</Tag>,
    },
    {
      title: '', width: 80,
      render: (_: unknown, record: AccountingEntry) => (
        <Space size={4}>
          <Tooltip title="Tahrirlash">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          </Tooltip>
          <Popconfirm title="O'chirish?" onConfirm={() => deleteEntry.mutate(record.id)}>
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  // ===== Payment table columns =====
  const paymentColumns = [
    {
      title: 'Sana', dataIndex: 'createdAt', width: 140,
      render: (d: string) => dayjs(d).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: 'Foydalanuvchi', dataIndex: 'user',
      render: (u: PaymentItem['user']) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <span>{u.name}</span>
          {u.username && <Tag style={{ fontSize: 11 }}>@{u.username}</Tag>}
        </Space>
      ),
    },
    {
      title: 'Kanal', dataIndex: 'channel', width: 140,
      render: (ch: string) => {
        const cfg = CHANNEL_CONFIG[ch] || CHANNEL_CONFIG["Noma'lum"]
        return <Tag icon={cfg.icon} color={cfg.color}>{cfg.label}</Tag>
      },
    },
    {
      title: 'Summa', dataIndex: 'amount', width: 140, align: 'right' as const,
      render: (a: number, r: PaymentItem) => (
        <span style={{ fontWeight: 600, color: r.status === 'APPROVED' ? '#52c41a' : r.status === 'REJECTED' ? '#f5222d' : '#fa8c16' }}>
          {formatMoney(a)} so'm
        </span>
      ),
    },
    {
      title: 'Tarif', dataIndex: 'planType', width: 110,
      render: (p: string | null) => p ? <Tag color="blue">{p}</Tag> : <Tag>-</Tag>,
    },
    {
      title: 'Holat', dataIndex: 'status', width: 140,
      render: (s: string) => {
        const st = STATUS_MAP[s] || STATUS_MAP.PENDING
        return <Tag icon={st.icon} color={st.color}>{st.text}</Tag>
      },
    },
    {
      title: 'Tasdiqlagan', width: 140,
      render: (_: unknown, r: PaymentItem) => {
        if (r.status === 'APPROVED' && r.verifiedBy) {
          return (
            <Tooltip title={r.verifiedAt ? dayjs(r.verifiedAt).format('DD.MM.YYYY HH:mm') : ''}>
              <Tag icon={<CheckCircleOutlined />} color="green">{r.verifiedBy}</Tag>
            </Tooltip>
          )
        }
        if (r.status === 'REJECTED') {
          return (
            <Tooltip title={r.rejectReason || 'Sabab ko\'rsatilmagan'}>
              <Tag icon={<CloseCircleOutlined />} color="red">Rad: {r.verifiedBy || '?'}</Tag>
            </Tooltip>
          )
        }
        return <Tag>Kutilmoqda</Tag>
      },
    },
    {
      title: 'Chek', width: 60, align: 'center' as const,
      render: (_: unknown, r: PaymentItem) => r.receiptImage ? (
        <Image src={r.receiptImage} width={32} height={32} style={{ borderRadius: 4, objectFit: 'cover', cursor: 'pointer' }} preview={{ mask: '...' }} />
      ) : '-',
    },
  ]

  const currentFormType = Form.useWatch('type', form)
  const filteredCategories = allCategories.filter(c => !currentFormType || c.type === currentFormType)

  return (
    <PageContainer>
      {/* ===== FILTER BAR ===== */}
      <FilterBar>
        <RangePicker
          value={dateRange}
          onChange={(v) => v && setDateRange(v as [Dayjs, Dayjs])}
          format="DD.MM.YYYY"
        />
        <Select value={groupBy} onChange={setGroupBy} style={{ width: 120 }}>
          <Select.Option value="day">Kunlik</Select.Option>
          <Select.Option value="month">Oylik</Select.Option>
        </Select>
        <Button icon={<SyncOutlined spin={syncAccounting.isPending} />} onClick={handleSync} loading={syncAccounting.isPending}>
          Sinxronlash
        </Button>
        <Button icon={<DownloadOutlined />} onClick={handleExport}>Eksport</Button>
      </FilterBar>

      {/* ===== MAIN TABS ===== */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" size="large">

        {/* ==================== TAB 1: UMUMIY ==================== */}
        <Tabs.TabPane tab={<span><AccountBookOutlined /> Umumiy</span>} key="overview">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <SummaryCard $gradient="linear-gradient(135deg, #52c41a 0%, #389e0d 100%)">
                <Statistic title="Jami kirim" value={summary?.totalIncome || 0}
                  formatter={(v) => `${formatMoney(Number(v))} so'm`}
                  prefix={<ArrowUpOutlined />} loading={summaryLoading} />
              </SummaryCard>
            </Col>
            <Col xs={24} sm={8}>
              <SummaryCard $gradient="linear-gradient(135deg, #f5222d 0%, #cf1322 100%)">
                <Statistic title="Jami chiqim" value={summary?.totalExpense || 0}
                  formatter={(v) => `${formatMoney(Number(v))} so'm`}
                  prefix={<ArrowDownOutlined />} loading={summaryLoading} />
              </SummaryCard>
            </Col>
            <Col xs={24} sm={8}>
              <SummaryCard $gradient={`linear-gradient(135deg, ${(summary?.profit || 0) >= 0 ? '#1890ff' : '#722ed1'} 0%, ${(summary?.profit || 0) >= 0 ? '#096dd9' : '#531dab'} 100%)`}>
                <Statistic title="Sof foyda" value={summary?.profit || 0}
                  formatter={(v) => `${formatMoney(Number(v))} so'm`}
                  prefix={<DollarOutlined />} loading={summaryLoading} />
              </SummaryCard>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} lg={16}>
              <ChartCard title="Kirim / Chiqim dinamikasi">
                {barData.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis tickFormatter={(v) => formatMoney(v)} />
                      <RTooltip formatter={(v) => `${formatMoney(Number(v || 0))} so'm`} />
                      <Legend />
                      <Bar dataKey="income" name="Kirim" fill="#52c41a" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" name="Chiqim" fill="#f5222d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <Empty description="Ma'lumot yo'q" />}
              </ChartCard>
            </Col>
            <Col xs={24} lg={8}>
              <ChartCard title="Kategoriyalar">
                {pieData.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <RTooltip formatter={(v) => `${formatMoney(Number(v || 0))} so'm`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <Empty description="Ma'lumot yo'q" />}
              </ChartCard>
            </Col>
          </Row>
        </Tabs.TabPane>

        {/* ==================== TAB 2: TO'LOVLAR ==================== */}
        <Tabs.TabPane tab={<span><CreditCardOutlined /> To'lovlar <Badge count={paymentData?.summary?.pending || 0} size="small" /></span>} key="payments">

          {/* Kanal bo'yicha statistika */}
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            {paymentData && Object.entries(paymentData.channelStats).map(([ch, stats]) => {
              const cfg = CHANNEL_CONFIG[ch] || CHANNEL_CONFIG["Noma'lum"]
              return (
                <Col xs={12} sm={8} md={6} lg={4} key={ch}>
                  <ChannelCard size="small" hoverable onClick={() => setPaymentChannel(paymentChannel === ch ? '' : ch)}
                    style={{ borderColor: paymentChannel === ch ? cfg.color : undefined, borderWidth: paymentChannel === ch ? 2 : 1 }}>
                    <div style={{ color: cfg.color, fontSize: 24, marginBottom: 4 }}>{cfg.icon}</div>
                    <div style={{ fontWeight: 600 }}>{cfg.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: cfg.color }}>{formatMoney(stats.total)} so'm</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                      {stats.count} ta | <span style={{ color: '#52c41a' }}>{stats.approved}</span> /
                      <span style={{ color: '#f5222d' }}> {stats.rejected}</span> /
                      <span style={{ color: '#fa8c16' }}> {stats.pending}</span>
                    </div>
                  </ChannelCard>
                </Col>
              )
            })}
            {/* Umumiy */}
            {paymentData && (
              <Col xs={12} sm={8} md={6} lg={4}>
                <ChannelCard size="small" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <div style={{ color: '#fff', fontSize: 24, marginBottom: 4 }}><DollarOutlined /></div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>Jami tushum</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{formatMoney(paymentData.summary.totalApproved)} so'm</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                    {paymentData.summary.total} ta to'lov
                  </div>
                </ChannelCard>
              </Col>
            )}
          </Row>

          {/* Filtrlar */}
          <Space style={{ marginBottom: 12 }}>
            <Select value={paymentChannel} onChange={setPaymentChannel} style={{ width: 160 }} allowClear placeholder="Barcha kanallar">
              {Object.entries(CHANNEL_CONFIG).map(([k, v]) => (
                <Select.Option key={k} value={k}><Tag color={v.color}>{v.label}</Tag></Select.Option>
              ))}
            </Select>
            <Select value={paymentStatus} onChange={setPaymentStatus} style={{ width: 160 }} allowClear placeholder="Barcha holatlar">
              {Object.entries(STATUS_MAP).map(([k, v]) => (
                <Select.Option key={k} value={k}><Tag color={v.color} icon={v.icon}>{v.text}</Tag></Select.Option>
              ))}
            </Select>
          </Space>

          {/* Kanallar pie chart + Table */}
          <Row gutter={16}>
            <Col xs={24} lg={8}>
              <Card title="Kanallar bo'yicha taqsimot" style={{ borderRadius: 12, marginBottom: 16 }}>
                {channelPieData.length ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={channelPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                        {channelPieData.map((d, i) => {
                          const ch = Object.entries(CHANNEL_CONFIG).find(([, v]) => v.label === d.name)
                          return <Cell key={i} fill={ch ? ch[1].color : PIE_COLORS[i % PIE_COLORS.length]} />
                        })}
                      </Pie>
                      <RTooltip formatter={(v) => `${formatMoney(Number(v || 0))} so'm`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <Empty description="To'lovlar yo'q" />}
              </Card>
            </Col>
            <Col xs={24} lg={16}>
              <Table
                dataSource={filteredPayments}
                columns={paymentColumns}
                rowKey="id"
                loading={paymentsLoading}
                pagination={{ pageSize: 20, showTotal: (t) => `Jami: ${t}` }}
                size="middle"
                scroll={{ x: 1100 }}
              />
            </Col>
          </Row>
        </Tabs.TabPane>

        {/* ==================== TAB 3: KIRIM / CHIQIM ==================== */}
        <Tabs.TabPane tab={<span><RiseOutlined /> Kirim-Chiqim</span>} key="entries">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <Space>
              <Select value={entryType || ''} onChange={(v) => setEntryType(v ? v as AccountingEntryType : undefined)} style={{ width: 140 }}>
                <Select.Option value="">Barchasi</Select.Option>
                <Select.Option value="INCOME"><Tag color="green">Kirim</Tag></Select.Option>
                <Select.Option value="EXPENSE"><Tag color="red">Chiqim</Tag></Select.Option>
              </Select>
            </Space>
            <Space>
              <Button type="primary" icon={<PlusOutlined />} style={{ background: '#52c41a', borderColor: '#52c41a' }}
                onClick={() => openNewModal('INCOME')}>Kirim</Button>
              <Button type="primary" danger icon={<PlusOutlined />}
                onClick={() => openNewModal('EXPENSE')}>Chiqim</Button>
            </Space>
          </div>
          <Table
            dataSource={entriesData?.data || []}
            columns={entryColumns}
            rowKey="id"
            loading={entriesLoading}
            pagination={{
              total: entriesData?.total || 0,
              pageSize: 50,
              current: entryPage + 1,
              onChange: (p) => setEntryPage(p - 1),
              showTotal: (t) => `Jami: ${t}`,
            }}
            size="middle"
            scroll={{ x: 900 }}
          />
        </Tabs.TabPane>

        {/* ==================== TAB 4: KATEGORIYALAR ==================== */}
        <Tabs.TabPane tab={<span><FallOutlined /> Kategoriyalar</span>} key="categories">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Card title={<span style={{ color: '#52c41a' }}><ArrowUpOutlined /> Kirim kategoriyalari</span>}
                extra={<Button size="small" icon={<PlusOutlined />} onClick={() => { catForm.setFieldValue('type', 'INCOME'); setCatModalOpen(true) }}>Qo'shish</Button>}
                style={{ borderRadius: 12 }}>
                {(incomeCategories || []).map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <span><Tag color={c.color}>{c.name}</Tag> {c.isSystem && <Tag>Tizim</Tag>}</span>
                    {!c.isSystem && (
                      <Popconfirm title="O'chirish?" onConfirm={() => deleteCategory.mutate(c.id)}>
                        <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    )}
                  </div>
                ))}
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title={<span style={{ color: '#f5222d' }}><ArrowDownOutlined /> Chiqim kategoriyalari</span>}
                extra={<Button size="small" icon={<PlusOutlined />} onClick={() => { catForm.setFieldValue('type', 'EXPENSE'); setCatModalOpen(true) }}>Qo'shish</Button>}
                style={{ borderRadius: 12 }}>
                {(expenseCategories || []).map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <span><Tag color={c.color}>{c.name}</Tag> {c.isSystem && <Tag>Tizim</Tag>}</span>
                    {!c.isSystem && (
                      <Popconfirm title="O'chirish?" onConfirm={() => deleteCategory.mutate(c.id)}>
                        <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    )}
                  </div>
                ))}
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>
      </Tabs>

      {/* ===== Entry Modal ===== */}
      <Modal
        title={editingEntry ? 'Yozuvni tahrirlash' : 'Yangi yozuv'}
        open={modalOpen}
        onOk={handleEntrySubmit}
        onCancel={() => { setModalOpen(false); setEditingEntry(null) }}
        confirmLoading={createEntry.isPending || updateEntry.isPending}
        okText="Saqlash" cancelText="Bekor"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="type" label="Turi" rules={[{ required: true }]}>
            <Select placeholder="Kirim yoki Chiqim">
              <Select.Option value="INCOME"><Tag color="green">Kirim</Tag></Select.Option>
              <Select.Option value="EXPENSE"><Tag color="red">Chiqim</Tag></Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="categoryId" label="Kategoriya" rules={[{ required: true }]}>
            <Select placeholder="Kategoriyani tanlang">
              {filteredCategories.map(c => (
                <Select.Option key={c.id} value={c.id}><Tag color={c.color}>{c.name}</Tag></Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="amount" label="Summa (so'm)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
              parser={(v) => Number(v!.replace(/\s/g, '')) as unknown as 1} />
          </Form.Item>
          <Form.Item name="date" label="Sana" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>
          <Form.Item name="description" label="Tavsif">
            <Input.TextArea rows={2} placeholder="Izoh..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* ===== Category Modal ===== */}
      <Modal
        title="Yangi kategoriya"
        open={catModalOpen}
        onOk={handleCategorySubmit}
        onCancel={() => setCatModalOpen(false)}
        confirmLoading={createCategory.isPending}
        okText="Qo'shish" cancelText="Bekor"
      >
        <Form form={catForm} layout="vertical">
          <Form.Item name="type" label="Turi" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="INCOME">Kirim</Select.Option>
              <Select.Option value="EXPENSE">Chiqim</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="name" label="Nomi" rules={[{ required: true }]}>
            <Input placeholder="Kategoriya nomi" />
          </Form.Item>
          <Form.Item name="color" label="Rang">
            <Input type="color" style={{ width: 80, height: 36 }} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}

export default Accounting
