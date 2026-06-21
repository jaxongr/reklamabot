import { useState, useMemo } from 'react'
import { Table, Card, Typography, Tag, Button, Select, Space, Switch, message, Badge, Tabs } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined, StopOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { useSessions, useGroups, useBlacklistedGroups, useAddToBlacklist, useRemoveFromBlacklist } from '../../hooks/useApi'
import type { Group } from '../../types'

const { Title } = Typography

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`

const Groups = () => {
  const [selectedSession, setSelectedSession] = useState<string>('')
  const [activeTab, setActiveTab] = useState<string>('all')
  const { data: sessionsData } = useSessions()
  const { data: groupsData, isLoading, refetch } = useGroups(selectedSession)
  const { data: blacklistedGroups = [], isLoading: blacklistLoading } = useBlacklistedGroups()
  const addToBlacklist = useAddToBlacklist()
  const removeFromBlacklist = useRemoveFromBlacklist()

  // Auto-select first session
  const sessions = sessionsData?.data || []
  if (sessions.length > 0 && !selectedSession) {
    setSelectedSession(sessions[0].id)
  }

  // Blacklisted group IDs set
  const blacklistedIds = useMemo(
    () => new Set(blacklistedGroups.map(g => g.groupTelegramId)),
    [blacklistedGroups],
  )

  const handleToggleBlacklist = async (group: Group) => {
    const isBlacklisted = blacklistedIds.has(group.telegramId)
    try {
      if (isBlacklisted) {
        await removeFromBlacklist.mutateAsync(group.telegramId)
        message.success(`"${group.title}" qora ro'yxatdan olib tashlandi`)
      } else {
        await addToBlacklist.mutateAsync({
          groupTelegramId: group.telegramId,
          title: group.title || 'Nomsiz',
          sessionId: selectedSession,
        })
        message.success(`"${group.title}" qora ro'yxatga qo'shildi`)
      }
    } catch {
      message.error('Xatolik yuz berdi')
    }
  }

  const allGroups = groupsData?.data || []
  const filteredGroups = activeTab === 'blacklisted'
    ? allGroups.filter(g => blacklistedIds.has(g.telegramId))
    : allGroups

  const columns = [
    {
      title: 'Nomi',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title: string, record: Group) => (
        <Space>
          {blacklistedIds.has(record.telegramId) && (
            <StopOutlined style={{ color: '#ef4444' }} />
          )}
          <span>{title || 'Nomsiz'}</span>
        </Space>
      ),
    },
    {
      title: 'Telegram ID',
      dataIndex: 'telegramId',
      key: 'telegramId',
      width: 160,
    },
    {
      title: 'Turi',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const labels: Record<string, string> = {
          GROUP: 'Guruh',
          SUPERGROUP: 'Super Guruh',
          CHANNEL: 'Kanal',
        }
        return <Tag>{labels[type] || type}</Tag>
      },
    },
    {
      title: "A'zolar",
      dataIndex: 'memberCount',
      key: 'memberCount',
      width: 120,
      sorter: (a: Group, b: Group) => (a.memberCount || 0) - (b.memberCount || 0),
      render: (count: number) => count?.toLocaleString() || '—',
    },
    {
      title: 'Holat',
      key: 'status',
      width: 120,
      render: (_: unknown, record: Group) => {
        if (record.isSkipped) {
          return (
            <Tag icon={<CloseCircleOutlined />} color="default">
              O'tkazilgan
            </Tag>
          )
        }
        return record.isActive ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Faol
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="default">
            Nofaol
          </Tag>
        )
      },
    },
    {
      title: 'Prioritet',
      dataIndex: 'isPriority',
      key: 'isPriority',
      width: 100,
      render: (isPriority: boolean) =>
        isPriority ? <Tag color="blue">Top 50</Tag> : null,
    },
    {
      title: 'Aktivlik',
      dataIndex: 'activityScore',
      key: 'activityScore',
      width: 90,
      sorter: (a: Group, b: Group) => a.activityScore - b.activityScore,
      render: (score: number) => score?.toFixed(1) || '0',
    },
    {
      title: "Qora ro'yxat",
      key: 'blacklist',
      width: 130,
      render: (_: unknown, record: Group) => (
        <Switch
          checked={blacklistedIds.has(record.telegramId)}
          onChange={() => handleToggleBlacklist(record)}
          loading={addToBlacklist.isPending || removeFromBlacklist.isPending}
          checkedChildren="Bloklangan"
          unCheckedChildren="Faol"
          style={blacklistedIds.has(record.telegramId) ? { backgroundColor: '#ef4444' } : {}}
        />
      ),
    },
  ]

  return (
    <div>
      <Title level={2}>Guruhlar</Title>

      <StyledCard
        title={
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              { key: 'all', label: `Barchasi (${allGroups.length})` },
              {
                key: 'blacklisted',
                label: (
                  <Badge count={blacklistedGroups.length} size="small" offset={[10, 0]}>
                    <span>Qora ro'yxat</span>
                  </Badge>
                ),
              },
            ]}
            style={{ marginBottom: -16 }}
          />
        }
        extra={
          <Space>
            <Select
              style={{ width: 200 }}
              placeholder="Sessiya tanlang"
              value={selectedSession || undefined}
              onChange={setSelectedSession}
              options={sessions.map((s) => ({
                value: s.id,
                label: s.name || s.phone || s.id.slice(0, 8),
              }))}
            />
            <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
              Yangilash
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredGroups}
          loading={isLoading || blacklistLoading}
          rowKey="id"
          pagination={{ pageSize: 20 }}
          scroll={{ x: 1200 }}
          rowClassName={(record) =>
            blacklistedIds.has(record.telegramId) ? 'blacklisted-row' : ''
          }
        />
        <style>{`
          .blacklisted-row {
            background-color: #fef2f2 !important;
          }
          .blacklisted-row:hover > td {
            background-color: #fee2e2 !important;
          }
        `}</style>
      </StyledCard>
    </div>
  )
}

export default Groups
