import { useState } from 'react'
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Radio,
  Tag,
  Space,
  message,
  Typography,
  Tooltip,
} from 'antd'
import { PlusOutlined, BellOutlined, SendOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import type { ColumnsType } from 'antd/es/table'
import { useAllNotifications, useSendNotification } from '../../hooks/useApi'
import type { Notification, NotificationTarget } from '../../types'

const { Title } = Typography
const { TextArea } = Input

const PageWrapper = styled.div`
  padding: 24px;
`

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`

const TargetTagMap: Record<NotificationTarget, { color: string; label: string }> = {
  ALL: { color: 'blue', label: 'Barchasi' },
  DRIVERS: { color: 'green', label: 'Haydovchilar' },
  DISPATCHERS: { color: 'orange', label: 'Dispetcherlar' },
}

export default function Notifications() {
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  const { data, isLoading } = useAllNotifications({ page, limit: 20 })
  const sendNotification = useSendNotification()

  const notifications = data?.data ?? []
  const total = data?.pagination?.total ?? 0

  const handleSend = async () => {
    try {
      const values = await form.validateFields()
      await sendNotification.mutateAsync({
        title: values.title,
        message: values.message,
        target: values.target as NotificationTarget,
      })
      message.success("Bildirishnoma muvaffaqiyatli yuborildi")
      form.resetFields()
      setIsModalOpen(false)
    } catch (err: any) {
      if (err?.errorFields) return
      message.error("Bildirishnoma yuborishda xato yuz berdi")
    }
  }

  const columns: ColumnsType<Notification> = [
    {
      title: 'Sarlavha',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title: string) => (
        <Space>
          <BellOutlined style={{ color: '#FC3F1D' }} />
          <strong>{title}</strong>
        </Space>
      ),
    },
    {
      title: 'Xabar',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (msg: string) => (
        <Tooltip title={msg}>
          <span style={{ maxWidth: 300, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {msg}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Maqsad',
      dataIndex: 'target',
      key: 'target',
      width: 160,
      render: (target: NotificationTarget) => {
        const info = TargetTagMap[target] ?? { color: 'default', label: target }
        return <Tag color={info.color}>{info.label}</Tag>
      },
    },
    {
      title: 'Qabul qilganlar',
      key: 'recipients',
      width: 160,
      render: (_, record) => (
        <span>{record._count?.userNotifications ?? 0} kishi</span>
      ),
    },
    {
      title: 'Sana',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) =>
        new Date(date).toLocaleString('uz-UZ', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
    },
  ]

  return (
    <PageWrapper>
      <PageHeader>
        <Title level={3} style={{ margin: 0 }}>
          Bildirishnomalar
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
          style={{ borderRadius: 8 }}
        >
          Bildirishnoma yuborish
        </Button>
      </PageHeader>

      <StyledCard>
        <Table<Notification>
          columns={columns}
          dataSource={notifications}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: 20,
            total,
            onChange: (p) => setPage(p),
            showTotal: (t) => `Jami: ${t} ta`,
          }}
          locale={{ emptyText: 'Bildirishnomalar topilmadi' }}
        />
      </StyledCard>

      <Modal
        title="Bildirishnoma yuborish"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        footer={null}
        width={520}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ target: 'ALL' }}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="title"
            label="Sarlavha"
            rules={[{ required: true, message: 'Sarlavha kiritish shart' }]}
          >
            <Input placeholder="Bildirishnoma sarlavhasi" maxLength={100} showCount />
          </Form.Item>

          <Form.Item
            name="message"
            label="Xabar matni"
            rules={[{ required: true, message: 'Xabar matni kiritish shart' }]}
          >
            <TextArea
              placeholder="Xabar matnini kiriting..."
              rows={4}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="target"
            label="Kimga yuborish"
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <Radio.Button value="ALL">Barchasi</Radio.Button>
              <Radio.Button value="DRIVERS">Haydovchilar</Radio.Button>
              <Radio.Button value="DISPATCHERS">Dispetcherlar</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => { setIsModalOpen(false); form.resetFields() }}>
                Bekor qilish
              </Button>
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={sendNotification.isPending}
                onClick={handleSend}
              >
                Yuborish
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </PageWrapper>
  )
}
