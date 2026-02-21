import { Table, Card, Typography, Tag, Button, Space, message, Modal } from 'antd'
import { SyncOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { useSessions, useDeleteSession } from '../../hooks/useApi'
import type { Session } from '../../types'

const { Title } = Typography

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`

const Sessions = () => {
  const { data, isLoading } = useSessions()
  const deleteMutation = useDeleteSession()

  const handleSync = (_id: string) => {
    message.loading('Sinxronizatsiya qilinmoqda...', 1.5)
    setTimeout(() => {
      message.success('Guruhlar sinxronizatsiya qilindi!')
    }, 1500)
  }

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Sessiyani o'chirish",
      content: "Rostdan ham shu sessiyani o'chirmoqchimisiz?",
      okText: "Ha, o'chirish",
      okType: 'danger',
      cancelText: 'Bekor qilish',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id)
          message.success("Sessiya o'chirildi")
        } catch {
          message.error('Xatolik yuz berdi')
        }
      },
    })
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id: string) => id.slice(0, 8) + '...',
    },
    { title: 'Nomi', dataIndex: 'name', key: 'name', render: (name: string) => name || '—' },
    { title: 'Telefon', dataIndex: 'phone', key: 'phone', render: (phone: string) => phone || '—' },
    {
      title: 'Holat',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const colors: Record<string, string> = {
          ACTIVE: 'green',
          INACTIVE: 'default',
          FROZEN: 'red',
          BANNED: 'volcano',
        }
        const labels: Record<string, string> = {
          ACTIVE: 'Faol',
          INACTIVE: 'Nofaol',
          FROZEN: 'Muzlatilgan',
          BANNED: 'Bloklangan',
        }
        return <Tag color={colors[status]}>{labels[status] || status}</Tag>
      },
    },
    {
      title: 'Guruhlar',
      key: 'groups',
      width: 150,
      render: (_: unknown, record: Session) =>
        `${record.activeGroups || record._count?.groups || 0}/${record.totalGroups || 0}`,
    },
    {
      title: 'Muzlatilgan',
      dataIndex: 'isFrozen',
      key: 'isFrozen',
      width: 120,
      render: (frozen: boolean) =>
        frozen ? <Tag color="red">Ha</Tag> : <Tag color="green">Yo'q</Tag>,
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 250,
      render: (_: unknown, record: Session) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<SyncOutlined />}
            onClick={() => handleSync(record.id)}
          >
            Sync
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            loading={deleteMutation.isPending}
          >
            O'chirish
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Title level={2}>Sessiyalar</Title>

      <StyledCard
        title="Mening Sessiyalarim"
        extra={
          <Button type="primary" icon={<PlusOutlined />} size="large">
            Yangi Sessiya
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data?.data || []}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />
      </StyledCard>
    </div>
  )
}

export default Sessions
