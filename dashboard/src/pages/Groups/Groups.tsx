import { useState } from 'react'
import { Table, Card, Typography, Tag, Button, Select, Space } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { useSessions, useGroups } from '../../hooks/useApi'
import type { Group } from '../../types'

const { Title } = Typography

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`

const Groups = () => {
  const [selectedSession, setSelectedSession] = useState<string>('')
  const { data: sessionsData } = useSessions()
  const { data: groupsData, isLoading, refetch } = useGroups(selectedSession)

  // Auto-select first session
  const sessions = sessionsData?.data || []
  if (sessions.length > 0 && !selectedSession) {
    setSelectedSession(sessions[0].id)
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id: string) => id.slice(0, 8) + '...',
    },
    { title: 'Nomi', dataIndex: 'title', key: 'title', ellipsis: true },
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
      width: 120,
      render: (isPriority: boolean) =>
        isPriority ? <Tag color="blue">Top 50</Tag> : null,
    },
    {
      title: 'Aktivlik',
      dataIndex: 'activityScore',
      key: 'activityScore',
      width: 100,
      sorter: (a: Group, b: Group) => a.activityScore - b.activityScore,
      render: (score: number) => score?.toFixed(1) || '0',
    },
  ]

  return (
    <div>
      <Title level={2}>Guruhlar</Title>

      <StyledCard
        title="Guruhlar Ro'yxati"
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
          dataSource={groupsData?.data || []}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 20 }}
          scroll={{ x: 1000 }}
        />
      </StyledCard>
    </div>
  )
}

export default Groups
