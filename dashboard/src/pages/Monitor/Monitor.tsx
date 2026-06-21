import { useState } from 'react'
import {
  Table,
  Card,
  Typography,
  Tag,
  Button,
  Space,
  message,
  Modal,
  Input,
  Form,
  Statistic,
  Row,
  Col,
  Tooltip,
  Divider,
  List,
  Empty,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  WifiOutlined,
  DisconnectOutlined,
  PhoneOutlined,
  SafetyOutlined,
  StarOutlined,
  StopOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import styled from 'styled-components'
import {
  useMonitorSessions,
  useMonitorStats,
  useMonitorSendCode,
  useMonitorSignIn,
  useDeleteMonitorSession,
  usePriorityGroups,
  useAddPriorityGroup,
  useRemovePriorityGroup,
  useSyncPriorityGroupsToAll,
  useBlockedUsersStats,
} from '../../hooks/useApi'
import api from '../../services/api'
import { useModule } from '../../contexts/ModuleContext'
import type { MonitorSession } from '../../types'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`

const StatsRow = styled(Row)`
  margin-bottom: 24px;
`

const statusColors: Record<string, string> = {
  ACTIVE: 'green',
  CONNECTING: 'blue',
  PENDING: 'orange',
  INACTIVE: 'default',
  BANNED: 'red',
}

const statusLabels: Record<string, string> = {
  ACTIVE: 'Faol',
  CONNECTING: 'Ulanmoqda',
  PENDING: 'Kutilmoqda',
  INACTIVE: 'Nofaol',
  BANNED: 'Bloklangan',
}

const Monitor = () => {
  const { module } = useModule()
  const { data: sessions, isLoading } = useMonitorSessions(module)
  const { data: stats } = useMonitorStats(module)
  const sendCodeMutation = useMonitorSendCode()
  const signInMutation = useMonitorSignIn()
  const deleteMutation = useDeleteMonitorSession()

  // Priority groups
  const { data: priorityGroups } = usePriorityGroups()
  const addPriorityMutation = useAddPriorityGroup()
  const removePriorityMutation = useRemovePriorityGroup()
  const syncPriorityMutation = useSyncPriorityGroupsToAll()

  // Blocked users stats
  const { data: blockedStats } = useBlockedUsersStats()

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [codeModalOpen, setCodeModalOpen] = useState(false)
  const [pendingSessionId, setPendingSessionId] = useState<string>('')
  const [needPassword, setNeedPassword] = useState(false)
  const [form] = Form.useForm()
  const [codeForm] = Form.useForm()

  // Priority group
  const [priorityModalOpen, setPriorityModalOpen] = useState(false)
  const [newGroupId, setNewGroupId] = useState('')

  const handleSendCode = async () => {
    try {
      const values = await form.validateFields()
      const result = await sendCodeMutation.mutateAsync({
        phone: values.phone,
        name: values.name,
        module,
      })
      setPendingSessionId(result.monitorSessionId)
      setAddModalOpen(false)
      setCodeModalOpen(true)
      form.resetFields()
      message.success('Kod yuborildi!')
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Xatolik yuz berdi')
    }
  }

  const handleSignIn = async () => {
    try {
      const values = await codeForm.validateFields()
      const result = await signInMutation.mutateAsync({
        id: pendingSessionId,
        code: values.code,
        password: values.password,
      })

      if (result.needPassword) {
        setNeedPassword(true)
        message.info('2FA parol kerak')
        return
      }

      setCodeModalOpen(false)
      setNeedPassword(false)
      codeForm.resetFields()
      message.success('Kuzatuv session ulandi!')
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Xatolik yuz berdi')
    }
  }

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Kuzatuv sessionni o'chirish",
      content: "Rostdan ham shu sessionni o'chirmoqchimisiz?",
      okText: "Ha, o'chirish",
      okType: 'danger',
      cancelText: 'Bekor qilish',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id)
          message.success("Session o'chirildi")
        } catch {
          message.error('Xatolik yuz berdi')
        }
      },
    })
  }

  const handleSyncGroups = async (id: string) => {
    try {
      await api.post(`/monitor/sessions/${id}/sync-groups`)
      message.success("Guruhlar sinxronlandi")
    } catch {
      message.error('Sinxronlash xatolik')
    }
  }

  const handleAddPriorityGroup = async () => {
    if (!newGroupId.trim()) return
    try {
      await addPriorityMutation.mutateAsync(newGroupId.trim())
      message.success("Prioritet guruh qo'shildi")
      setNewGroupId('')
    } catch {
      message.error('Xatolik yuz berdi')
    }
  }

  const handleSyncPriorityGroups = async () => {
    try {
      const res = await syncPriorityMutation.mutateAsync()
      message.success(res.message || 'Auto-join boshlandi')
    } catch {
      message.error('Xatolik yuz berdi')
    }
  }

  const handleRemovePriorityGroup = (groupTelegramId: string) => {
    Modal.confirm({
      title: "Prioritet guruhni o'chirish",
      content: "Bu guruhni prioritet ro'yxatidan o'chirmoqchimisiz?",
      okText: "Ha",
      okType: 'danger',
      cancelText: 'Bekor qilish',
      onOk: async () => {
        try {
          await removePriorityMutation.mutateAsync(groupTelegramId)
          message.success("O'chirildi")
        } catch {
          message.error('Xatolik yuz berdi')
        }
      },
    })
  }

  const columns = [
    {
      title: 'Nomi',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => name || '—',
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Holat',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => (
        <Tag color={statusColors[status]} icon={status === 'ACTIVE' ? <WifiOutlined /> : status === 'INACTIVE' ? <DisconnectOutlined /> : undefined}>
          {statusLabels[status] || status}
        </Tag>
      ),
    },
    {
      title: 'Guruhlar',
      dataIndex: 'totalGroups',
      key: 'totalGroups',
      width: 90,
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: "O'qilgan",
      dataIndex: 'messagesRead',
      key: 'messagesRead',
      width: 90,
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: 'Topilgan',
      dataIndex: 'ordersFound',
      key: 'ordersFound',
      width: 90,
      render: (count: number) => <Text strong style={{ color: '#52c41a' }}>{count}</Text>,
    },
    {
      title: 'Bloklangan',
      dataIndex: 'blocksFound',
      key: 'blocksFound',
      width: 90,
      render: (count: number) => count ? <Text strong style={{ color: '#f5222d' }}>{count}</Text> : '0',
    },
    {
      title: "So'nggi xabar",
      dataIndex: 'lastMessageAt',
      key: 'lastMessageAt',
      width: 140,
      render: (date: string) => date ? dayjs(date).format('DD.MM HH:mm') : '—',
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 100,
      render: (_: any, record: MonitorSession) => (
        <Space>
          <Tooltip title="Guruhlarni sinxronlash">
            <Button
              size="small"
              icon={<SyncOutlined />}
              onClick={() => handleSyncGroups(record.id)}
            />
          </Tooltip>
          <Tooltip title="O'chirish">
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          <EyeOutlined style={{ marginRight: 8 }} />
          Kuzatuv sessionlari
        </Title>
        <Space>
          <Button
            icon={<StarOutlined />}
            onClick={() => setPriorityModalOpen(true)}
          >
            Prioritet guruhlar ({priorityGroups?.length || 0})
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddModalOpen(true)}
          >
            Session qo'shish
          </Button>
        </Space>
      </Space>

      <StatsRow gutter={16}>
        <Col span={4}>
          <StyledCard>
            <Statistic
              title="Jami sessionlar"
              value={stats?.totalSessions || 0}
              suffix="/ 20"
            />
          </StyledCard>
        </Col>
        <Col span={4}>
          <StyledCard>
            <Statistic
              title="Faol sessionlar"
              value={stats?.activeSessions || 0}
              valueStyle={{ color: '#52c41a' }}
            />
          </StyledCard>
        </Col>
        <Col span={4}>
          <StyledCard>
            <Statistic
              title="Jami buyurtmalar"
              value={stats?.totalOrders || 0}
            />
          </StyledCard>
        </Col>
        <Col span={4}>
          <StyledCard>
            <Statistic
              title="Yangi buyurtmalar"
              value={stats?.newOrders || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </StyledCard>
        </Col>
        <Col span={4}>
          <StyledCard>
            <Statistic
              title="Bloklangan"
              value={blockedStats?.total || 0}
              valueStyle={{ color: '#f5222d' }}
              prefix={<StopOutlined />}
            />
          </StyledCard>
        </Col>
        <Col span={4}>
          <StyledCard>
            <Statistic
              title="Prioritet guruhlar"
              value={priorityGroups?.length || 0}
              valueStyle={{ color: '#faad14' }}
              prefix={<StarOutlined />}
            />
          </StyledCard>
        </Col>
      </StatsRow>

      <StyledCard>
        <Table
          columns={columns}
          dataSource={sessions || []}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: "Kuzatuv session yo'q. Yangi session qo'shing." }}
        />
      </StyledCard>

      {/* Add Session Modal */}
      <Modal
        title="Kuzatuv session qo'shish"
        open={addModalOpen}
        onOk={handleSendCode}
        onCancel={() => { setAddModalOpen(false); form.resetFields() }}
        okText="Kod yuborish"
        cancelText="Bekor qilish"
        confirmLoading={sendCodeMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="phone"
            label="Telefon raqam"
            rules={[{ required: true, message: 'Telefon raqam kiriting' }]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="+998901234567"
            />
          </Form.Item>
          <Form.Item name="name" label="Nomi (ixtiyoriy)">
            <Input placeholder="Masalan: Kuzatuv 1" />
          </Form.Item>
        </Form>
        <Text type="secondary">
          Diqqat: Bu session serverda ishlaydi va guruhlardan kelgan xabarlarni kuzatib turadi.
          Maksimal 20 ta kuzatuv session ulash mumkin.
        </Text>
      </Modal>

      {/* Code Verification Modal */}
      <Modal
        title="Kodni kiriting"
        open={codeModalOpen}
        onOk={handleSignIn}
        onCancel={() => { setCodeModalOpen(false); setNeedPassword(false); codeForm.resetFields() }}
        okText="Tasdiqlash"
        cancelText="Bekor qilish"
        confirmLoading={signInMutation.isPending}
      >
        <Form form={codeForm} layout="vertical">
          <Form.Item
            name="code"
            label="Telegram kodi"
            rules={[{ required: true, message: 'Kodni kiriting' }]}
          >
            <Input
              prefix={<SafetyOutlined />}
              placeholder="12345"
              maxLength={6}
            />
          </Form.Item>
          {needPassword && (
            <Form.Item
              name="password"
              label="2FA parol"
              rules={[{ required: true, message: '2FA parolni kiriting' }]}
            >
              <Input.Password placeholder="2FA parol" />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Priority Groups Modal */}
      <Modal
        title={
          <Space>
            <StarOutlined style={{ color: '#faad14' }} />
            Prioritet guruhlar
          </Space>
        }
        open={priorityModalOpen}
        onCancel={() => setPriorityModalOpen(false)}
        footer={null}
        width={600}
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Prioritet guruhlarning barcha xabarlari filtrlanmasdan o'qiladi.
          Telefon raqam majburiy emas. Guruh Telegram ID sini kiriting.
        </Text>

        <Space style={{ width: '100%', marginBottom: 16, flexWrap: 'wrap' }}>
          <Input
            placeholder="Guruh Telegram ID (-100...)"
            value={newGroupId}
            onChange={(e) => setNewGroupId(e.target.value)}
            style={{ width: 300 }}
            onPressEnter={handleAddPriorityGroup}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddPriorityGroup}
            loading={addPriorityMutation.isPending}
          >
            Qo'shish
          </Button>
          <Tooltip title="Hech qaysi sessionda yo'q bo'lgan priority guruhlarga avto-qo'shiladi. Invite-link orqali. Flood'dan qochish uchun har qo'shilish orasida 45s kutiladi.">
            <Button
              icon={<SyncOutlined />}
              onClick={handleSyncPriorityGroups}
              loading={syncPriorityMutation.isPending}
            >
              Hammasini sync qilish
            </Button>
          </Tooltip>
        </Space>

        <Divider style={{ margin: '12px 0' }} />

        {priorityGroups && priorityGroups.length > 0 ? (
          <List
            size="small"
            dataSource={priorityGroups}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemovePriorityGroup(item.groupTelegramId)}
                  />,
                ]}
              >
                <List.Item.Meta
                  avatar={<StarOutlined style={{ color: '#faad14', fontSize: 18, marginTop: 4 }} />}
                  title={<Text copyable>{item.groupTelegramId}</Text>}
                  description={item.title || 'Nomi mavjud emas'}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="Prioritet guruhlar yo'q" />
        )}
      </Modal>
    </div>
  )
}

export default Monitor
