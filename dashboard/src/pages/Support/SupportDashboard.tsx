import { useState } from 'react'
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  message,
  Drawer,
  Statistic,
  Select,
  Input,
  Typography,
  Avatar,
  Spin,
  Empty,
  Row,
  Col,
  Badge,
  Divider,
} from 'antd'
import {
  CustomerServiceOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons'
import styled from 'styled-components'
import type { ColumnsType } from 'antd/es/table'
import {
  useSupportTickets,
  useSupportTicket,
  useReplySupportTicket,
  useUpdateTicketStatus,
} from '../../hooks/useApi'
import type { SupportTicket, SupportTicketStatus, SupportMessage } from '../../types'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

const PageWrapper = styled.div`
  padding: 24px;
`

const PageHeader = styled.div`
  margin-bottom: 24px;
`

const StatsRow = styled(Row)`
  margin-bottom: 24px;
`

const StatCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  text-align: center;
`

const TableCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`

const MessageThread = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: calc(100vh - 380px);
`

const MessageItem = styled.div<{ $isStaff?: boolean }>`
  display: flex;
  flex-direction: ${({ $isStaff }) => ($isStaff ? 'row-reverse' : 'row')};
  gap: 10px;
  align-items: flex-end;
`

const MessageBubble = styled.div<{ $isStaff?: boolean }>`
  max-width: 75%;
  padding: 10px 14px;
  border-radius: ${({ $isStaff }) =>
    $isStaff ? '16px 16px 4px 16px' : '16px 16px 16px 4px'};
  background: ${({ $isStaff }) => ($isStaff ? '#FC3F1D' : '#f5f5f5')};
  color: ${({ $isStaff }) => ($isStaff ? '#fff' : '#333')};
  word-break: break-word;
  font-size: 13px;
`

const MessageMeta = styled.div`
  font-size: 11px;
  color: #bbb;
  margin-top: 3px;
`

const ReplyArea = styled.div`
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const StatusConfig: Record<SupportTicketStatus, { color: string; label: string; icon: React.ReactNode }> = {
  OPEN: { color: 'blue', label: 'Ochiq', icon: <ClockCircleOutlined /> },
  IN_PROGRESS: { color: 'orange', label: 'Jarayonda', icon: <ClockCircleOutlined /> },
  RESOLVED: { color: 'green', label: 'Hal qilingan', icon: <CheckCircleOutlined /> },
  CLOSED: { color: 'default', label: 'Yopilgan', icon: <CloseCircleOutlined /> },
}

const STATUS_OPTIONS: SupportTicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function SupportDashboard() {
  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [selectedTicketId, setSelectedTicketId] = useState<string>('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [replyText, setReplyText] = useState('')

  const { data: ticketsData, isLoading } = useSupportTickets({
    status: statusFilter,
    page,
    limit: 20,
  })
  const { data: ticketDetail, isLoading: detailLoading } = useSupportTicket(selectedTicketId)
  const reply = useReplySupportTicket()
  const updateStatus = useUpdateTicketStatus()

  const tickets = ticketsData?.data ?? []
  const total = ticketsData?.pagination?.total ?? 0
  const stats = ticketsData?.stats ?? {}

  const openTicket = (id: string) => {
    setSelectedTicketId(id)
    setDrawerOpen(true)
    setReplyText('')
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setSelectedTicketId('')
    setReplyText('')
  }

  const handleReply = async () => {
    const text = replyText.trim()
    if (!text || !selectedTicketId) return
    try {
      await reply.mutateAsync({ ticketId: selectedTicketId, message: text })
      message.success("Javob yuborildi")
      setReplyText('')
    } catch {
      message.error("Javob yuborishda xato")
    }
  }

  const handleStatusChange = async (status: SupportTicketStatus) => {
    if (!selectedTicketId) return
    try {
      await updateStatus.mutateAsync({ ticketId: selectedTicketId, status })
      message.success("Status yangilandi")
    } catch {
      message.error("Statusni yangilashda xato")
    }
  }

  const columns: ColumnsType<SupportTicket> = [
    {
      title: 'Mavzu',
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
      render: (subject: string) => <strong>{subject}</strong>,
    },
    {
      title: 'Foydalanuvchi',
      key: 'user',
      width: 180,
      render: (_, record) => {
        const u = record.user
        if (!u) return <Text type="secondary">—</Text>
        return (
          <Space>
            <Avatar size="small" icon={<UserOutlined />} />
            <span>{u.firstName || u.username || u.telegramId || '—'}</span>
          </Space>
        )
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: SupportTicketStatus) => {
        const cfg = StatusConfig[status]
        return (
          <Tag color={cfg?.color} icon={cfg?.icon}>
            {cfg?.label ?? status}
          </Tag>
        )
      },
    },
    {
      title: 'Xabarlar',
      key: 'messages',
      width: 100,
      render: (_, record) => (
        <Badge count={record._count?.messages ?? 0} showZero style={{ backgroundColor: '#8c8c8c' }} />
      ),
    },
    {
      title: 'Sana',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (d: string) => formatDate(d),
    },
    {
      title: 'Amal',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button type="link" onClick={() => openTicket(record.id)} style={{ padding: 0 }}>
          Ko'rish
        </Button>
      ),
    },
  ]

  return (
    <PageWrapper>
      <PageHeader>
        <Title level={3} style={{ margin: 0 }}>
          Qo'llab-quvvatlash
        </Title>
      </PageHeader>

      {/* Stats */}
      <StatsRow gutter={[16, 16]}>
        {[
          { key: 'OPEN', label: 'Ochiq', icon: <ClockCircleOutlined style={{ color: '#1677ff', fontSize: 24 }} />, color: '#e6f4ff' },
          { key: 'IN_PROGRESS', label: 'Jarayonda', icon: <ClockCircleOutlined style={{ color: '#fa8c16', fontSize: 24 }} />, color: '#fff7e6' },
          { key: 'RESOLVED', label: 'Hal qilingan', icon: <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />, color: '#f6ffed' },
          { key: 'CLOSED', label: 'Yopilgan', icon: <CloseCircleOutlined style={{ color: '#8c8c8c', fontSize: 24 }} />, color: '#fafafa' },
        ].map(({ key, label, icon, color }) => (
          <Col xs={24} sm={12} md={6} key={key}>
            <StatCard style={{ background: color }}>
              {icon}
              <Statistic
                title={label}
                value={stats[key] ?? 0}
                style={{ marginTop: 8 }}
              />
            </StatCard>
          </Col>
        ))}
      </StatsRow>

      {/* Filter + Table */}
      <TableCard>
        <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
          <Select
            placeholder="Status bo'yicha filtr"
            allowClear
            style={{ width: 200 }}
            onChange={(val) => { setStatusFilter(val); setPage(1) }}
          >
            {STATUS_OPTIONS.map((s) => (
              <Option key={s} value={s}>
                <Tag color={StatusConfig[s].color}>{StatusConfig[s].label}</Tag>
              </Option>
            ))}
          </Select>
        </div>

        <Table<SupportTicket>
          columns={columns}
          dataSource={tickets}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: 20,
            total,
            onChange: (p) => setPage(p),
            showTotal: (t) => `Jami: ${t} ta`,
          }}
          onRow={(record) => ({ onClick: () => openTicket(record.id), style: { cursor: 'pointer' } })}
          locale={{ emptyText: 'Murojatlar topilmadi' }}
        />
      </TableCard>

      {/* Ticket Drawer */}
      <Drawer
        title={
          ticketDetail ? (
            <Space>
              <CustomerServiceOutlined />
              <span>{ticketDetail.subject}</span>
            </Space>
          ) : 'Murojaat'
        }
        open={drawerOpen}
        onClose={closeDrawer}
        width={520}
        extra={
          ticketDetail && (
            <Select
              value={ticketDetail.status}
              style={{ width: 160 }}
              onChange={handleStatusChange}
              loading={updateStatus.isPending}
            >
              {STATUS_OPTIONS.map((s) => (
                <Option key={s} value={s}>
                  <Tag color={StatusConfig[s].color}>{StatusConfig[s].label}</Tag>
                </Option>
              ))}
            </Select>
          )
        }
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <Spin size="large" />
          </div>
        ) : ticketDetail ? (
          <>
            {/* Ticket Info */}
            <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
              <Space direction="vertical" size={4}>
                <Text type="secondary" style={{ fontSize: 12 }}>Foydalanuvchi</Text>
                <Space>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <Text>
                    {ticketDetail.user?.firstName ||
                      ticketDetail.user?.username ||
                      ticketDetail.user?.telegramId ||
                      'Noma\'lum'}
                  </Text>
                </Space>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Yaratilgan: {formatDate(ticketDetail.createdAt)}
                </Text>
              </Space>
            </Card>

            <Divider style={{ margin: '8px 0' }}>Xabarlar</Divider>

            {/* Message Thread */}
            <MessageThread>
              {!ticketDetail.messages || ticketDetail.messages.length === 0 ? (
                <Empty description="Xabarlar yo'q" />
              ) : (
                ticketDetail.messages.map((msg: SupportMessage) => {
                  const senderName = msg.sender?.firstName || 'Noma\'lum'
                  return (
                    <MessageItem key={msg.id} $isStaff={msg.isStaff}>
                      {!msg.isStaff && (
                        <Avatar size="small" icon={<UserOutlined />} style={{ flexShrink: 0 }} />
                      )}
                      <div>
                        {!msg.isStaff && (
                          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 2 }}>
                            {senderName}
                          </Text>
                        )}
                        <MessageBubble $isStaff={msg.isStaff}>
                          {msg.message}
                        </MessageBubble>
                        <MessageMeta style={{ textAlign: msg.isStaff ? 'right' : 'left' }}>
                          {formatDate(msg.createdAt)}
                        </MessageMeta>
                      </div>
                    </MessageItem>
                  )
                })
              )}
            </MessageThread>

            {/* Reply */}
            {ticketDetail.status !== 'CLOSED' && ticketDetail.status !== 'RESOLVED' && (
              <ReplyArea>
                <TextArea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Javob yozing..."
                  rows={3}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  loading={reply.isPending}
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  style={{ alignSelf: 'flex-end' }}
                >
                  Javob berish
                </Button>
              </ReplyArea>
            )}

            {(ticketDetail.status === 'CLOSED' || ticketDetail.status === 'RESOLVED') && (
              <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 12 }}>
                Bu murojaat yopilgan
              </Text>
            )}
          </>
        ) : (
          <Empty description="Ma'lumot topilmadi" />
        )}
      </Drawer>
    </PageWrapper>
  )
}
