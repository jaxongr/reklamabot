import { Table, Card, Typography, Tag, Button, Space, Progress, message } from 'antd'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import {
  usePosts,
  useStartPost,
  usePausePost,
  useResumePost,
  useCancelPost,
  useRetryPost,
} from '../../hooks/useApi'
import type { Post } from '../../types'

const { Title } = Typography

const Posts = () => {
  const { data, isLoading } = usePosts()
  const startMutation = useStartPost()
  const pauseMutation = usePausePost()
  const resumeMutation = useResumePost()
  const cancelMutation = useCancelPost()
  const retryMutation = useRetryPost()

  const handleAction = async (action: string, id: string) => {
    try {
      switch (action) {
        case 'start':
          await startMutation.mutateAsync(id)
          message.success('Tarqatish boshlandi')
          break
        case 'pause':
          await pauseMutation.mutateAsync(id)
          message.success("Tarqatish to'xtatildi")
          break
        case 'resume':
          await resumeMutation.mutateAsync(id)
          message.success('Tarqatish davom ettirildi')
          break
        case 'cancel':
          await cancelMutation.mutateAsync(id)
          message.success('Tarqatish bekor qilindi')
          break
        case 'retry':
          await retryMutation.mutateAsync(id)
          message.success('Qayta urinish boshlandi')
          break
      }
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
      title: "E'lon",
      key: 'ad',
      render: (_: unknown, record: Post) => record.ad?.title || '—',
    },
    {
      title: 'Holat',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: string) => {
        const colors: Record<string, string> = {
          PENDING: 'default',
          IN_PROGRESS: 'blue',
          PAUSED: 'orange',
          COMPLETED: 'green',
          FAILED: 'red',
          CANCELLED: 'default',
        }
        const labels: Record<string, string> = {
          PENDING: 'Kutilmoqda',
          IN_PROGRESS: 'Bormoqda',
          PAUSED: "To'xtatilgan",
          COMPLETED: 'Tugallangan',
          FAILED: 'Xatolik',
          CANCELLED: 'Bekor qilindi',
        }
        return <Tag color={colors[status]}>{labels[status]}</Tag>
      },
    },
    {
      title: 'Jarayon',
      key: 'progress',
      width: 200,
      render: (_: unknown, record: Post) => {
        const percent =
          record.totalGroups > 0
            ? Math.round((record.completedGroups / record.totalGroups) * 100)
            : 0
        return <Progress percent={percent} size="small" />
      },
    },
    {
      title: 'Muvaffaqiyat',
      dataIndex: 'completedGroups',
      key: 'completedGroups',
      width: 100,
    },
    {
      title: 'Xatolik',
      dataIndex: 'failedGroups',
      key: 'failedGroups',
      width: 100,
    },
    {
      title: 'Boshlangan',
      dataIndex: 'startedAt',
      key: 'startedAt',
      width: 180,
      render: (date: string) =>
        date ? new Date(date).toLocaleString('uz-UZ') : '—',
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 200,
      render: (_: unknown, record: Post) => {
        const actions: React.ReactNode[] = []

        if (record.status === 'PENDING') {
          actions.push(
            <Button
              key="start"
              type="primary"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleAction('start', record.id)}
              loading={startMutation.isPending}
            >
              Boshlash
            </Button>,
          )
        }
        if (record.status === 'IN_PROGRESS') {
          actions.push(
            <Button
              key="pause"
              size="small"
              icon={<PauseCircleOutlined />}
              onClick={() => handleAction('pause', record.id)}
              loading={pauseMutation.isPending}
            >
              Pauza
            </Button>,
          )
          actions.push(
            <Button
              key="cancel"
              danger
              size="small"
              icon={<StopOutlined />}
              onClick={() => handleAction('cancel', record.id)}
            />,
          )
        }
        if (record.status === 'PAUSED') {
          actions.push(
            <Button
              key="resume"
              type="primary"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleAction('resume', record.id)}
              loading={resumeMutation.isPending}
            >
              Davom
            </Button>,
          )
          actions.push(
            <Button
              key="cancel"
              danger
              size="small"
              icon={<StopOutlined />}
              onClick={() => handleAction('cancel', record.id)}
            />,
          )
        }
        if (record.status === 'FAILED' || record.status === 'COMPLETED') {
          if (record.failedGroups > 0) {
            actions.push(
              <Button
                key="retry"
                size="small"
                icon={<ReloadOutlined />}
                onClick={() => handleAction('retry', record.id)}
                loading={retryMutation.isPending}
              >
                Qayta
              </Button>,
            )
          }
        }

        return <Space size="small">{actions}</Space>
      },
    },
  ]

  return (
    <div>
      <Title level={2}>Tarqatishlar</Title>

      <Card
        loading={isLoading}
        title="Tarqatishlar Ro'yxati"
        extra={
          <Button type="primary" icon={<PlayCircleOutlined />}>
            Yangi Tarqatish
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          expandable={{
            expandedRowRender: (record: Post) => (
              <div style={{ padding: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <strong>Jami guruhlar:</strong> {record.totalGroups}
                  </div>
                  <div>
                    <strong>Muvaffaqiyatli:</strong> {record.completedGroups}
                  </div>
                  <div>
                    <strong>Xatoliklar:</strong> {record.failedGroups}
                  </div>
                  <div>
                    <strong>O'tkazildi:</strong> {record.skippedGroups}
                  </div>
                </Space>
              </div>
            ),
          }}
        />
      </Card>
    </div>
  )
}

export default Posts
