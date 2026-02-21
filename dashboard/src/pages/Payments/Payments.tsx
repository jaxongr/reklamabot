import { useState } from 'react'
import { Table, Card, Typography, Tag, Button, Space, Modal, Input, Row, Col, Statistic, message } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { usePayments, useApprovePayment, useRejectPayment, usePaymentStatistics } from '../../hooks/useApi'
import type { Payment } from '../../types'

const { Title } = Typography

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`

const Payments = () => {
  const [rejectReason, setRejectReason] = useState('')
  const { data, isLoading } = usePayments()
  const { data: stats } = usePaymentStatistics()
  const approveMutation = useApprovePayment()
  const rejectMutation = useRejectPayment()

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id)
      message.success("To'lov tasdiqlandi")
    } catch {
      message.error('Xatolik yuz berdi')
    }
  }

  const handleReject = (id: string) => {
    Modal.confirm({
      title: 'Rad etish sababi',
      content: (
        <Input.TextArea
          placeholder="Sabab kiriting..."
          onChange={(e) => setRejectReason(e.target.value)}
          rows={3}
        />
      ),
      okText: 'Rad etish',
      okType: 'danger',
      cancelText: 'Bekor qilish',
      onOk: async () => {
        try {
          await rejectMutation.mutateAsync({ id, reason: rejectReason || 'Sababsiz' })
          message.success("To'lov rad etildi")
          setRejectReason('')
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
    {
      title: 'Foydalanuvchi',
      key: 'user',
      render: (_: unknown, record: Payment) =>
        record.user ? `${record.user.firstName || ''} ${record.user.lastName || ''}`.trim() || record.user.username || '—' : '—',
    },
    {
      title: 'Summa',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (amount: number, record: Payment) =>
        `${amount?.toLocaleString()} ${record.currency}`,
    },
    {
      title: 'Plan',
      dataIndex: 'planType',
      key: 'planType',
      width: 120,
      render: (plan: string) => plan ? <Tag color="blue">{plan}</Tag> : '—',
    },
    {
      title: 'Holat',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: string) => {
        const config: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
          PENDING: { color: 'orange', label: 'Kutilmoqda', icon: <ClockCircleOutlined /> },
          APPROVED: { color: 'green', label: 'Tasdiqlangan', icon: <CheckCircleOutlined /> },
          REJECTED: { color: 'red', label: 'Rad etilgan', icon: <CloseCircleOutlined /> },
          EXPIRED: { color: 'default', label: "Muddati o'tgan", icon: <ClockCircleOutlined /> },
        }
        const { color, label, icon } = config[status] || config.PENDING
        return (
          <Tag icon={icon} color={color}>
            {label}
          </Tag>
        )
      },
    },
    {
      title: 'Sana',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('uz-UZ'),
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 200,
      render: (_: unknown, record: Payment) => {
        if (record.status === 'PENDING') {
          return (
            <Space>
              <Button
                type="primary"
                size="small"
                onClick={() => handleApprove(record.id)}
                loading={approveMutation.isPending}
              >
                Tasdiqlash
              </Button>
              <Button
                danger
                size="small"
                onClick={() => handleReject(record.id)}
              >
                Rad etish
              </Button>
            </Space>
          )
        }
        if (record.status === 'REJECTED' && record.rejectReason) {
          return <span style={{ color: '#999' }}>{record.rejectReason}</span>
        }
        return null
      },
    },
  ]

  return (
    <div>
      <Title level={2}>To'lovlar</Title>

      {stats && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <StyledCard>
              <Statistic title="Jami" value={stats.total} />
            </StyledCard>
          </Col>
          <Col xs={12} sm={6}>
            <StyledCard>
              <Statistic title="Kutilmoqda" value={stats.pending} valueStyle={{ color: '#faad14' }} />
            </StyledCard>
          </Col>
          <Col xs={12} sm={6}>
            <StyledCard>
              <Statistic title="Tasdiqlangan" value={stats.approved} valueStyle={{ color: '#52c41a' }} />
            </StyledCard>
          </Col>
          <Col xs={12} sm={6}>
            <StyledCard>
              <Statistic
                title="Jami daromad"
                value={stats.totalRevenue}
                suffix=" UZS"
                precision={0}
                valueStyle={{ color: '#1890ff' }}
              />
            </StyledCard>
          </Col>
        </Row>
      )}

      <StyledCard loading={isLoading} title="To'lovlar Ro'yxati">
        <Table
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          pagination={{ pageSize: 20 }}
          scroll={{ x: 1200 }}
        />
      </StyledCard>
    </div>
  )
}

export default Payments
