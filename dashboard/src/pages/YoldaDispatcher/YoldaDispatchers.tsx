import { useState } from 'react'
import { Card, Button, Table, Tag, Modal, Form, Input, Select, Space, message, Popconfirm, Switch, Typography } from 'antd'
import { PlusOutlined, DeleteOutlined, UserOutlined, EditOutlined, PhoneOutlined } from '@ant-design/icons'
import {
  useYoldaDispatchers,
  useCreateYoldaDispatcher,
  useUpdateYoldaDispatcher,
  useDeleteYoldaDispatcher,
  useYoldaGeoZones,
} from './useYoldaApi'
import dayjs from 'dayjs'

const { Title } = Typography

const YoldaDispatchers = () => {
  const { data: dispatchers, isLoading } = useYoldaDispatchers()
  const { data: zones } = useYoldaGeoZones()
  const createMut = useCreateYoldaDispatcher()
  const updateMut = useUpdateYoldaDispatcher()
  const deleteMut = useDeleteYoldaDispatcher()

  const [modalOpen, setModalOpen] = useState(false)
  const [editRow, setEditRow] = useState<any>(null)
  const [form] = Form.useForm()

  const submit = async () => {
    const values = await form.validateFields()
    try {
      if (editRow) {
        await updateMut.mutateAsync({ id: editRow.id, ...values })
        message.success('Yangilandi')
      } else {
        await createMut.mutateAsync(values)
        message.success('Dispatcher yaratildi')
      }
      setModalOpen(false)
      setEditRow(null)
      form.resetFields()
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Xatolik')
    }
  }

  const openEdit = (row: any) => {
    setEditRow(row)
    form.setFieldsValue({
      phone: row.phone,
      fullName: row.fullName,
      workMode: row.workMode,
      isActive: row.isActive,
      zoneIds: row.zones?.map((z: any) => z.zone.id) || [],
    })
    setModalOpen(true)
  }

  const columns = [
    { title: 'Ism', dataIndex: 'fullName', render: (v: string) => v || '—' },
    { title: 'Telefon', dataIndex: 'phone', render: (v: string) => <code>{v}</code> },
    {
      title: 'Rejim',
      dataIndex: 'workMode',
      render: (m: string) => <Tag color={m === 'ANYWHERE' ? 'green' : 'blue'}>{m === 'ANYWHERE' ? 'Hamma joyda' : 'Zonada'}</Tag>,
    },
    {
      title: 'Zonalar',
      dataIndex: 'zones',
      render: (z: any[]) => z?.length || 0,
    },
    {
      title: 'Qo\'ng\'iroqlar',
      dataIndex: '_count',
      render: (c: any) => c?.calls || 0,
    },
    {
      title: 'Oxirgi ulanish',
      dataIndex: 'lastSeenAt',
      render: (d: string) => d ? dayjs(d).format('DD.MM HH:mm') : '—',
    },
    {
      title: 'Holat',
      dataIndex: 'isActive',
      render: (a: boolean) => (a ? <Tag color="green">Faol</Tag> : <Tag color="red">Deaktiv</Tag>),
    },
    {
      title: 'Amal',
      render: (_: any, row: any) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(row)}>Tahrir</Button>
          <Popconfirm title="Deaktivatsiya qilishni tasdiqlang" onConfirm={() => deleteMut.mutateAsync(row.id).then(() => message.success('Deaktivlandi'))}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          <UserOutlined /> Yo'lda Dispatcherlar
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditRow(null); form.resetFields(); setModalOpen(true) }}>
          Yangi dispatcher
        </Button>
      </Space>

      <Card>
        <Table
          columns={columns}
          dataSource={dispatchers || []}
          loading={isLoading}
          rowKey="id"
        />
      </Card>

      <Modal
        title={editRow ? 'Dispatcherni tahrirlash' : 'Yangi dispatcher'}
        open={modalOpen}
        onOk={submit}
        onCancel={() => { setModalOpen(false); setEditRow(null); form.resetFields() }}
        okText="Saqlash"
        cancelText="Bekor qilish"
        confirmLoading={createMut.isPending || updateMut.isPending}
      >
        <Form form={form} layout="vertical" initialValues={{ workMode: 'GEOFENCED', isActive: true }}>
          <Form.Item name="phone" label="Telefon raqam" rules={[{ required: true, message: 'Telefon kiriting' }]}>
            <Input prefix={<PhoneOutlined />} placeholder="+998901234567" disabled={!!editRow} />
          </Form.Item>
          <Form.Item name="fullName" label="Ism familya">
            <Input placeholder="Masalan: Jahongir Toshtemirov" />
          </Form.Item>
          <Form.Item name="workMode" label="Ish rejimi">
            <Select
              options={[
                { value: 'GEOFENCED', label: 'Faqat zona ichida' },
                { value: 'ANYWHERE', label: 'Hohlagan joyda' },
              ]}
            />
          </Form.Item>
          <Form.Item name="zoneIds" label="Zonalar">
            <Select
              mode="multiple"
              placeholder="Zonalar tanlash"
              options={(zones || []).map((z: any) => ({ value: z.id, label: z.name }))}
            />
          </Form.Item>
          {editRow && (
            <Form.Item name="isActive" label="Faol" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  )
}

export default YoldaDispatchers
