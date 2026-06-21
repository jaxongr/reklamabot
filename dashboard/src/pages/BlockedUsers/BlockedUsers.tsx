import { useState } from 'react'
import {
  Table,
  Card,
  Typography,
  Tag,
  Button,
  Space,
  message,
  Input,
  Select,
  Statistic,
  Row,
  Col,
  Tooltip,
  Modal,
  Descriptions,
  Drawer,
} from 'antd'
import {
  StopOutlined,
  SearchOutlined,
  CheckOutlined,
  UserOutlined,
  PlusOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
} from '@ant-design/icons'
import styled from 'styled-components'
import {
  useBlockedUsers,
  useBlockedUsersStats,
  useUnblockUser,
  useBlockedWhitelist,
  useAddToWhitelist,
  useRemoveFromWhitelist,
} from '../../hooks/useApi'
import type { BlockedUser, BlockReason } from '../../types'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`

const StatsRow = styled(Row)`
  margin-bottom: 24px;
`

const reasonLabels: Record<BlockReason, { label: string; color: string }> = {
  DISPATCHER_NAME: { label: 'Dispetcher', color: 'red' },
  FEMALE_NAME: { label: 'Ayol ismi', color: 'pink' },
  REPEATED_CHARS: { label: 'Takror belgi', color: 'orange' },
  FOREIGN_DESTINATION: { label: 'Xorijiy manzil', color: 'volcano' },
  MULTIPLE_MENTIONS: { label: 'Ko\'p mention', color: 'gold' },
  LONG_MESSAGE: { label: 'Uzun xabar', color: 'lime' },
  EXCESSIVE_EMOJI: { label: 'Ko\'p emoji', color: 'cyan' },
  EXCESSIVE_NEWLINES: { label: 'Ko\'p qator', color: 'geekblue' },
  USER_MULTI_GROUP: { label: 'Ko\'p guruhda', color: 'purple' },
  USER_SPAM_RATE: { label: 'Spam tezlik', color: 'magenta' },
  PHONE_MULTI_GROUP: { label: 'Tel ko\'p guruh', color: 'red' },
  PHONE_SUPER_SPAM: { label: 'Super spam', color: '#f50' },
  MANUAL_BLOCK: { label: 'Qo\'lda', color: 'black' },
}

const BlockedUsers = () => {
  const [filters, setFilters] = useState<{
    search?: string
    reason?: string
    page: number
    limit: number
  }>({ page: 1, limit: 20 })

  const { data, isLoading } = useBlockedUsers(filters)
  const { data: stats } = useBlockedUsersStats()
  const unblockMutation = useUnblockUser()
  const { data: whitelist } = useBlockedWhitelist()
  const addWhitelistMutation = useAddToWhitelist()
  const removeWhitelistMutation = useRemoveFromWhitelist()

  const [selectedBlock, setSelectedBlock] = useState<BlockedUser | null>(null)
  const [detailDrawer, setDetailDrawer] = useState(false)
  const [whitelistModal, setWhitelistModal] = useState(false)
  const [newWhitelistId, setNewWhitelistId] = useState('')

  const handleUnblock = (id: string) => {
    Modal.confirm({
      title: 'Blokdan chiqarish',
      icon: <ExclamationCircleOutlined />,
      content: 'Bu foydalanuvchini blokdan chiqarmoqchimisiz?',
      okText: 'Ha',
      cancelText: 'Bekor qilish',
      onOk: async () => {
        try {
          await unblockMutation.mutateAsync(id)
          message.success('Blokdan chiqarildi')
        } catch {
          message.error('Xatolik yuz berdi')
        }
      },
    })
  }

  const handleAddWhitelist = async () => {
    if (!newWhitelistId.trim()) return
    try {
      await addWhitelistMutation.mutateAsync(newWhitelistId.trim())
      message.success("Oq ro'yxatga qo'shildi")
      setNewWhitelistId('')
    } catch {
      message.error('Xatolik yuz berdi')
    }
  }

  const handleRemoveWhitelist = async (id: string) => {
    try {
      await removeWhitelistMutation.mutateAsync(id)
      message.success("Oq ro'yxatdan o'chirildi")
    } catch {
      message.error('Xatolik yuz berdi')
    }
  }

  const topReasons = stats?.byReason
    ? Object.entries(stats.byReason)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 4)
    : []

  const columns = [
    {
      title: 'Foydalanuvchi',
      key: 'user',
      width: 180,
      ellipsis: true,
      render: (_: any, record: BlockedUser) => {
        const name = record.senderName || 'Nomalum'
        const shortName = name.length > 15 ? name.slice(0, 15) + '…' : name
        return (
          <Space>
            <UserOutlined />
            <div style={{ maxWidth: 140, overflow: 'hidden' }}>
              <div><Text strong ellipsis style={{ maxWidth: 140 }}>{shortName}</Text></div>
              {record.senderUsername && (
                <Text type="secondary" style={{ fontSize: 12 }}>@{record.senderUsername}</Text>
              )}
            </div>
          </Space>
        )
      },
    },
    {
      title: 'Telegram ID',
      dataIndex: 'senderTelegramId',
      key: 'senderTelegramId',
      width: 130,
      render: (id: string) => <Text copyable style={{ fontSize: 12 }}>{id}</Text>,
    },
    {
      title: 'Sabab',
      dataIndex: 'reason',
      key: 'reason',
      width: 150,
      render: (reason: BlockReason) => {
        const info = reasonLabels[reason] || { label: reason, color: 'default' }
        const isActive = filters.reason === reason
        return (
          <Tag
            color={isActive ? undefined : info.color}
            style={{
              cursor: 'pointer',
              fontWeight: isActive ? 700 : 400,
              border: isActive ? '2px solid #1890ff' : undefined,
            }}
            onClick={(e) => {
              e.stopPropagation()
              setFilters((prev) => ({
                ...prev,
                reason: prev.reason === reason ? undefined : reason,
                page: 1,
              }))
            }}
          >
            {info.label}
          </Tag>
        )
      },
    },
    {
      title: 'Qoida #',
      dataIndex: 'ruleNumber',
      key: 'ruleNumber',
      width: 70,
      render: (num: number) => <Tag>#{num}</Tag>,
    },
    {
      title: 'Guruh',
      dataIndex: 'groupTitle',
      key: 'groupTitle',
      width: 160,
      ellipsis: true,
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (phone: string) => phone ? (
        <Text copyable style={{ whiteSpace: 'nowrap' }}>{phone}</Text>
      ) : '—',
    },
    {
      title: 'Sana',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (date: string) => dayjs(date).format('DD.MM HH:mm'),
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 100,
      render: (_: any, record: BlockedUser) => (
        <Space size="small">
          <Tooltip title="Batafsil">
            <Button
              size="small"
              icon={<SearchOutlined />}
              onClick={() => { setSelectedBlock(record); setDetailDrawer(true) }}
            />
          </Tooltip>
          {record.isActive && (
            <Tooltip title="Blokdan chiqarish">
              <Button
                size="small"
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleUnblock(record.id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          <StopOutlined style={{ marginRight: 8 }} />
          Bloklangan foydalanuvchilar
        </Title>
        <Space>
          <Select
            placeholder="Sabab bo'yicha"
            style={{ width: 180 }}
            allowClear
            value={filters.reason || undefined}
            onChange={(value) => setFilters((prev) => ({ ...prev, reason: value, page: 1 }))}
            suffixIcon={<FilterOutlined />}
            options={Object.entries(reasonLabels).map(([key, val]) => ({
              value: key,
              label: val.label,
            }))}
          />
          <Button onClick={() => setWhitelistModal(true)}>
            Oq ro'yxat ({whitelist?.length || 0})
          </Button>
          <Input
            placeholder="Qidirish..."
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            allowClear
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
          />
        </Space>
      </Space>

      <StatsRow gutter={16}>
        <Col span={4}>
          <StyledCard>
            <Statistic
              title="Jami bloklangan"
              value={stats?.total || 0}
              valueStyle={{ color: '#f5222d' }}
              prefix={<StopOutlined />}
            />
          </StyledCard>
        </Col>
        <Col span={4}>
          <StyledCard>
            <Statistic title="Bugun" value={stats?.today || 0} valueStyle={{ color: '#fa8c16' }} />
          </StyledCard>
        </Col>
        <Col span={4}>
          <StyledCard>
            <Statistic title="Shu hafta" value={stats?.thisWeek || 0} valueStyle={{ color: '#1890ff' }} />
          </StyledCard>
        </Col>
        {topReasons.map(([reason, count]) => {
          const info = reasonLabels[reason as BlockReason] || { label: reason, color: 'default' }
          const isActive = filters.reason === reason
          return (
            <Col span={3} key={reason}>
              <StyledCard
                style={{
                  cursor: 'pointer',
                  border: isActive ? '2px solid #1890ff' : undefined,
                }}
                onClick={() => setFilters((prev) => ({
                  ...prev,
                  reason: prev.reason === reason ? undefined : reason,
                  page: 1,
                }))}
              >
                <Statistic title={info.label} value={count as number} />
              </StyledCard>
            </Col>
          )
        })}
      </StatsRow>

      <StyledCard>
        {filters.reason && (
          <div style={{ marginBottom: 12 }}>
            <Tag
              closable
              color="blue"
              onClose={() => setFilters((prev) => ({ ...prev, reason: undefined, page: 1 }))}
              style={{ fontSize: 14, padding: '4px 12px' }}
            >
              Filter: {reasonLabels[filters.reason as BlockReason]?.label || filters.reason}
            </Tag>
          </div>
        )}
        <Table
          columns={columns}
          dataSource={data?.data || []}
          loading={isLoading}
          rowKey="id"
          scroll={{ x: 1100 }}
          size="middle"
          pagination={{
            current: data?.pagination?.page || 1,
            total: data?.pagination?.total || 0,
            pageSize: data?.pagination?.limit || 20,
            showSizeChanger: true,
            showTotal: (total) => `Jami ${total} ta`,
            onChange: (page, pageSize) => setFilters((prev) => ({ ...prev, page, limit: pageSize })),
          }}
          locale={{ emptyText: "Bloklangan foydalanuvchilar topilmadi" }}
        />
      </StyledCard>

      {/* Detail Drawer */}
      <Drawer
        title="Bloklangan foydalanuvchi"
        width={550}
        open={detailDrawer}
        onClose={() => { setDetailDrawer(false); setSelectedBlock(null) }}
      >
        {selectedBlock && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Ism">
                {selectedBlock.senderName || 'Nomalum'}
              </Descriptions.Item>
              {selectedBlock.senderUsername && (
                <Descriptions.Item label="Username">
                  @{selectedBlock.senderUsername}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Telegram ID">
                <Text copyable>{selectedBlock.senderTelegramId}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Sabab">
                <Tag color={reasonLabels[selectedBlock.reason]?.color}>
                  {reasonLabels[selectedBlock.reason]?.label || selectedBlock.reason}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Qoida raqami">
                #{selectedBlock.ruleNumber}
              </Descriptions.Item>
              {selectedBlock.groupTitle && (
                <Descriptions.Item label="Guruh">
                  {selectedBlock.groupTitle}
                </Descriptions.Item>
              )}
              {selectedBlock.phone && (
                <Descriptions.Item label="Telefon">
                  <Text copyable>{selectedBlock.phone}</Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Holat">
                {selectedBlock.isActive ? (
                  <Tag color="red">Bloklangan</Tag>
                ) : (
                  <Tag color="green">Blokdan chiqarilgan</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Sana">
                {dayjs(selectedBlock.createdAt).format('DD.MM.YYYY HH:mm')}
              </Descriptions.Item>
            </Descriptions>

            {selectedBlock.messageText && (
              <div style={{ marginTop: 24 }}>
                <Text strong>Xabar matni:</Text>
                <Card style={{ marginTop: 8, backgroundColor: '#f6f8fa', borderRadius: 8 }}>
                  <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                    {selectedBlock.messageText}
                  </Paragraph>
                </Card>
              </div>
            )}

            {selectedBlock.isActive && (
              <Button
                type="primary"
                block
                style={{ marginTop: 24 }}
                onClick={() => handleUnblock(selectedBlock.id)}
              >
                Blokdan chiqarish
              </Button>
            )}
          </>
        )}
      </Drawer>

      {/* Whitelist Modal */}
      <Modal
        title="Oq ro'yxat (Whitelist)"
        open={whitelistModal}
        onCancel={() => setWhitelistModal(false)}
        footer={null}
        width={500}
      >
        <Space style={{ width: '100%', marginBottom: 16 }}>
          <Input
            placeholder="Telegram ID kiriting"
            value={newWhitelistId}
            onChange={(e) => setNewWhitelistId(e.target.value)}
            style={{ width: 300 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddWhitelist}
            loading={addWhitelistMutation.isPending}
          >
            Qo'shish
          </Button>
        </Space>

        {whitelist && whitelist.length > 0 ? (
          <div>
            {whitelist.map((id) => (
              <div
                key={id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <Text copyable>{id}</Text>
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveWhitelist(id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <Text type="secondary">Oq ro'yxat bo'sh</Text>
        )}
      </Modal>
    </div>
  )
}

export default BlockedUsers
