import { useState } from 'react'
import { Card, Button, Table, Space, Typography, Modal, Form, Input, message, Popconfirm } from 'antd'
import { StopOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useYoldaBlocklist, useAddYoldaBlocklist, useRemoveYoldaBlocklist } from './useYoldaApi'
import dayjs from 'dayjs'

const { Title } = Typography

const YoldaBlocklist = () => {
  const { data, isLoading } = useYoldaBlocklist()
  const addMut = useAddYoldaBlocklist()
  const removeMut = useRemoveYoldaBlocklist()
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()

  const submit = async () => {
    const v = await form.validateFields()
    try {
      await addMut.mutateAsync(v)
      message.success('Qo\'shildi')
      setOpen(false)
      form.resetFields()
    } catch {
      message.error('Xatolik')
    }
  }

  const columns = [
    { title: 'Telefon', dataIndex: 'phone', render: (p: string) => <code>{p}</code> },
    { title: 'Sabab', dataIndex: 'reason', render: (r: string) => r || '—' },
    { title: 'Qo\'shilgan', dataIndex: 'createdAt', render: (d: string) => dayjs(d).format('DD.MM.YY HH:mm') },
    {
      title: 'Amal',
      render: (_: any, row: any) => (
        <Popconfirm title="O'chirish" onConfirm={() => removeMut.mutateAsync(row.phone).then(() => message.success('O\'chirildi'))}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ]

  return (
    <div>
      <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          <StopOutlined /> Yozilmaydigan raqamlar
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
          Raqam qo'shish
        </Button>
      </Space>

      <Card>
        <Table
          columns={columns}
          dataSource={data || []}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 20 }}
        />
      </Card>

      <Modal
        title="Yozilmaydigan raqam qo'shish"
        open={open}
        onOk={submit}
        onCancel={() => { setOpen(false); form.resetFields() }}
        okText="Saqlash"
        cancelText="Bekor qilish"
        confirmLoading={addMut.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="phone" label="Telefon" rules={[{ required: true }]}>
            <Input placeholder="+998901234567" />
          </Form.Item>
          <Form.Item name="reason" label="Sabab">
            <Input.TextArea rows={2} placeholder="Masalan: O'z raqamim" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default YoldaBlocklist
