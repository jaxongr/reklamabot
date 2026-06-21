import { useState } from 'react'
import {
  Card, Table, Tag, Button, Space, Input, Select, Statistic, Row, Col,
  Modal, Descriptions, Badge, message, InputNumber, Form, Tabs, Image, Empty,
} from 'antd'
import {
  CarOutlined, CheckCircleOutlined, DollarOutlined,
  SearchOutlined, UserOutlined, WifiOutlined,
  CameraOutlined, CloseCircleOutlined, LinkOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import api from '../../services/api'
import {
  useDrivers, useDriverStats, useDriver, useVerifyDriver,
  useUpdateDriverBalance, useToggleDriverSubscription,
  useAdminUpdateDriver, useGenerateDriverLoginCode,
  usePendingPhotos, useApprovePhoto, useRejectPhoto,
  useLinkDriverToOrder, useAvailableDrivers,
} from '../../hooks/useApi'
import type { DriverProfile, VehiclePhoto } from '../../types'
import { getVehicleTypeOptions, BODY_TYPES, getBrandOptions } from '../../constants/vehicles'
import DriverMap from './DriverMap'
import DriverOffers from './DriverOffers'
import PrivateOrders from './PrivateOrders'

const Drivers = () => {
  const [search, setSearch] = useState('')
  const [onlineFilter, setOnlineFilter] = useState<boolean | undefined>()
  const [verifiedFilter, setVerifiedFilter] = useState<boolean | undefined>()
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [balanceModal, setBalanceModal] = useState<{ id: string; open: boolean }>({ id: '', open: false })
  const [balanceForm] = Form.useForm()

  const { data: driversData, isLoading } = useDrivers({
    search: search || undefined,
    isOnline: onlineFilter,
    isVerified: verifiedFilter,
    page,
    limit: 20,
  })
  const { data: stats } = useDriverStats()
  const { data: driverDetail } = useDriver(selectedId || '')
  const verifyMutation = useVerifyDriver()
  const balanceMutation = useUpdateDriverBalance()
  const subscriptionMutation = useToggleDriverSubscription()
  const editDriverMutation = useAdminUpdateDriver()
  const [editModal, setEditModal] = useState<{ id: string; open: boolean }>({ id: '', open: false })
  const [editForm] = Form.useForm()

  // Foto kontrol
  const { data: pendingPhotos, isLoading: photosLoading } = usePendingPhotos()
  const approveMutation = useApprovePhoto()
  const rejectMutation = useRejectPhoto()
  const [rejectModal, setRejectModal] = useState<{ id: string; open: boolean }>({ id: '', open: false })
  const [createModal, setCreateModal] = useState(false)
  const [createForm] = Form.useForm()
  const [createLoading, setCreateLoading] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  // Login kod
  const loginCodeMutation = useGenerateDriverLoginCode()
  const [loginCodeModal, setLoginCodeModal] = useState<{ open: boolean; code: string; phone: string; fullName: string }>({
    open: false, code: '', phone: '', fullName: '',
  })

  // Haydovchi ulash
  const [linkOrderId, setLinkOrderId] = useState('')
  const { data: availableDrivers } = useAvailableDrivers()
  const linkMutation = useLinkDriverToOrder()

  const columns = [
    {
      title: 'Haydovchi',
      key: 'name',
      render: (_: any, r: DriverProfile) => (
        <Space>
          <Badge status={r.isOnline ? 'success' : 'default'} />
          <span style={{ fontWeight: 500 }}>{(r.fullName || r.user?.firstName || '—').slice(0, 15)}</span>
        </Space>
      ),
    },
    { title: 'Telefon', dataIndex: 'phone', key: 'phone', render: (v: string) => v || '—' },
    { title: 'Mashina', dataIndex: 'vehicleType', key: 'vehicleType', render: (v: string) => v || '—' },
    { title: 'Tonnaj', dataIndex: 'vehicleCapacity', key: 'vehicleCapacity', render: (v: string) => v || '—' },
    { title: 'Shahar', dataIndex: 'lastCity', key: 'lastCity', render: (v: string) => v || '—' },
    {
      title: 'Balans',
      dataIndex: 'balance',
      key: 'balance',
      render: (v: number) => <span style={{ fontWeight: 500 }}>{(v || 0).toLocaleString()} UZS</span>,
    },
    {
      title: 'Holat',
      key: 'status',
      render: (_: any, r: DriverProfile) => (
        <Space size={4}>
          {r.isVerified ? <Tag color="green">Tasdiqlangan</Tag> : <Tag color="orange">Kutilmoqda</Tag>}
          {r.subscriptionActive && <Tag color="blue">Obuna</Tag>}
        </Space>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 340,
      render: (_: any, r: DriverProfile) => (
        <Space size="small">
          <Button size="small" onClick={() => setSelectedId(r.id)}>Batafsil</Button>
          <Button size="small" onClick={() => openEditModal(r)}>Tahrirlash</Button>
          {!r.isVerified && (
            <Button size="small" type="primary" onClick={() => handleVerify(r.id)}>
              Tasdiqlash
            </Button>
          )}
          {r.isVerified && (
            <Button
              size="small"
              style={{ backgroundColor: '#6B46C1', color: 'white', borderColor: '#6B46C1' }}
              onClick={() => handleGenerateCode(r.id)}
              loading={loginCodeMutation.isPending}
            >
              Kod berish
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const handleCreateDriver = async (values: any) => {
    setCreateLoading(true)
    try {
      await api.post('/drivers/admin/create', values)
      message.success(`Haydovchi "${values.fullName}" qo'shildi!`)
      setCreateModal(false)
      createForm.resetFields()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Xatolik yuz berdi')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleVerify = async (id: string) => {
    await verifyMutation.mutateAsync(id)
    message.success('Haydovchi tasdiqlandi')
  }

  const handleGenerateCode = async (id: string) => {
    try {
      const result = await loginCodeMutation.mutateAsync(id)
      setLoginCodeModal({
        open: true,
        code: result.code,
        phone: result.phone || '',
        fullName: result.fullName || '',
      })
    } catch {
      message.error('Kod yaratishda xatolik')
    }
  }

  const handleApprovePhoto = async (id: string) => {
    await approveMutation.mutateAsync(id)
    message.success('Foto tasdiqlandi')
  }

  const handleRejectPhoto = async () => {
    await rejectMutation.mutateAsync({ id: rejectModal.id, reason: rejectReason })
    message.success('Foto rad etildi')
    setRejectModal({ id: '', open: false })
    setRejectReason('')
  }

  const handleLinkDriver = async (driverId: string) => {
    if (!linkOrderId) {
      message.warning('Buyurtma ID kiriting')
      return
    }
    try {
      await linkMutation.mutateAsync({ orderId: linkOrderId, driverProfileId: driverId })
      message.success('Haydovchi ulandi')
      setLinkOrderId('')
    } catch {
      message.error('Ulashda xatolik')
    }
  }

  const openEditModal = (driver: DriverProfile) => {
    editForm.setFieldsValue({
      fullName: driver.fullName || '',
      phone: driver.phone || '',
      vehicleType: driver.vehicleType || '',
      vehicleBrand: (driver as any).vehicleBrand || '',
      vehicleCapacity: driver.vehicleCapacity || '',
      vehicleNumber: driver.vehicleNumber || '',
      bodyType: (driver as any).bodyType || '',
    })
    setEditModal({ id: driver.id, open: true })
  }

  const handleEditSubmit = async () => {
    const values = await editForm.validateFields()
    await editDriverMutation.mutateAsync({ id: editModal.id, data: values })
    message.success('Haydovchi ma\'lumotlari yangilandi')
    setEditModal({ id: '', open: false })
    editForm.resetFields()
  }

  const handleBalanceSubmit = async () => {
    const values = await balanceForm.validateFields()
    await balanceMutation.mutateAsync({
      id: balanceModal.id,
      amount: values.amount,
      description: values.description || 'Admin tomonidan',
    })
    message.success('Balans yangilandi')
    setBalanceModal({ id: '', open: false })
    balanceForm.resetFields()
  }

  return (
    <div>
      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card size="small">
            <Statistic title="Jami" value={stats?.totalDrivers || 0} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="Online" value={stats?.onlineDrivers || 0} prefix={<WifiOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="Tasdiqlangan" value={stats?.verifiedDrivers || 0} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="Jami takliflar" value={stats?.totalOffers || 0} prefix={<CarOutlined />} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="Faol takliflar" value={stats?.activeOffers || 0} prefix={<CarOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="list" items={[
        {
          key: 'list',
          label: 'Haydovchilar',
          children: (
            <>
              {/* Filters */}
              <Card size="small" style={{ marginBottom: 16 }}>
                <Space wrap>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModal(true)}>
                    Haydovchi qo'shish
                  </Button>
                  <Input
                    placeholder="Qidirish..."
                    prefix={<SearchOutlined />}
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1) }}
                    style={{ width: 240 }}
                    allowClear
                  />
                  <Select
                    placeholder="Online holat"
                    value={onlineFilter}
                    onChange={v => { setOnlineFilter(v); setPage(1) }}
                    style={{ width: 140 }}
                    allowClear
                    options={[
                      { value: true, label: 'Online' },
                      { value: false, label: 'Offline' },
                    ]}
                  />
                  <Select
                    placeholder="Tasdiqlash"
                    value={verifiedFilter}
                    onChange={v => { setVerifiedFilter(v); setPage(1) }}
                    style={{ width: 160 }}
                    allowClear
                    options={[
                      { value: true, label: 'Tasdiqlangan' },
                      { value: false, label: 'Tasdiqlanmagan' },
                    ]}
                  />
                </Space>
              </Card>

              {/* Table */}
              <Card>
                <Table
                  columns={columns}
                  dataSource={driversData?.data || []}
                  rowKey="id"
                  loading={isLoading}
                  pagination={{
                    current: page,
                    pageSize: 20,
                    total: driversData?.pagination?.total || 0,
                    onChange: p => setPage(p),
                    showTotal: t => `Jami: ${t}`,
                  }}
                  size="small"
                />
              </Card>
            </>
          ),
        },
        {
          key: 'map',
          label: 'Xarita',
          children: <DriverMap />,
        },
        {
          key: 'offers',
          label: 'Takliflar',
          children: <DriverOffers />,
        },
        {
          key: 'private-orders',
          label: 'Maxsus buyurtmalar',
          children: <PrivateOrders />,
        },
        {
          key: 'photos',
          label: (
            <Badge count={pendingPhotos?.data?.length || 0} size="small" offset={[8, 0]}>
              <CameraOutlined style={{ marginRight: 4 }} />Foto kontrol
            </Badge>
          ),
          children: (
            <Card>
              {photosLoading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>Yuklanmoqda...</div>
              ) : !pendingPhotos?.data?.length ? (
                <Empty description="Kutilayotgan fotolar yo'q" />
              ) : (
                <Row gutter={[16, 16]}>
                  {pendingPhotos.data.map((photo: VehiclePhoto) => (
                    <Col key={photo.id} xs={24} sm={12} md={8} lg={6}>
                      <Card
                        size="small"
                        cover={
                          <Image
                            src={photo.url}
                            alt={photo.type}
                            style={{ height: 200, objectFit: 'cover' }}
                            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F/PQAJnAN2SGFQ+AAAAABJRU5ErkJggg=="
                          />
                        }
                        actions={[
                          <Button
                            key="approve"
                            type="primary"
                            size="small"
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleApprovePhoto(photo.id)}
                            loading={approveMutation.isPending}
                          >
                            Tasdiqlash
                          </Button>,
                          <Button
                            key="reject"
                            danger
                            size="small"
                            icon={<CloseCircleOutlined />}
                            onClick={() => setRejectModal({ id: photo.id, open: true })}
                          >
                            Rad etish
                          </Button>,
                        ]}
                      >
                        <Card.Meta
                          title={<Tag color="blue">{photo.type}</Tag>}
                          description={
                            <Space direction="vertical" size={2}>
                              <span>{photo.driverProfile?.fullName || 'Noma\'lum'}</span>
                              <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                                {photo.driverProfile?.vehicleType || ''} {photo.driverProfile?.phone || ''}
                              </span>
                            </Space>
                          }
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card>
          ),
        },
        {
          key: 'link',
          label: <><LinkOutlined style={{ marginRight: 4 }} />Haydovchi ulash</>,
          children: (
            <Card>
              <Space style={{ marginBottom: 16 }}>
                <Input
                  placeholder="Buyurtma ID..."
                  value={linkOrderId}
                  onChange={e => setLinkOrderId(e.target.value)}
                  style={{ width: 300 }}
                />
              </Space>
              <Table
                columns={[
                  {
                    title: 'Haydovchi',
                    key: 'name',
                    render: (_: any, r: any) => (
                      <Space>
                        <Badge status={r.isOnline ? 'success' : 'default'} />
                        <span style={{ fontWeight: 500 }}>{r.fullName || '—'}</span>
                      </Space>
                    ),
                  },
                  { title: 'Telefon', dataIndex: 'phone', key: 'phone', render: (v: string) => v || '—' },
                  { title: 'Mashina', dataIndex: 'vehicleType', key: 'vehicleType', render: (v: string) => v || '—' },
                  { title: 'Shahar', dataIndex: 'lastCity', key: 'lastCity', render: (v: string) => v || '—' },
                  {
                    title: 'Tasdiqlangan',
                    dataIndex: 'isVerified',
                    key: 'isVerified',
                    render: (v: boolean) => v ? <Tag color="green">Ha</Tag> : <Tag color="orange">Yo'q</Tag>,
                  },
                  {
                    title: '',
                    key: 'action',
                    render: (_: any, r: any) => (
                      <Button
                        type="primary"
                        size="small"
                        disabled={!linkOrderId}
                        loading={linkMutation.isPending}
                        onClick={() => handleLinkDriver(r.id)}
                      >
                        Ulash
                      </Button>
                    ),
                  },
                ]}
                dataSource={availableDrivers || []}
                rowKey="id"
                size="small"
                locale={{ emptyText: 'Online haydovchilar yo\'q' }}
              />
            </Card>
          ),
        },
      ]} />

      {/* Driver Detail Modal */}
      <Modal
        open={!!selectedId}
        onCancel={() => setSelectedId(null)}
        title="Haydovchi tafsilotlari"
        width={700}
        footer={
          driverDetail ? (
            <Space>
              {!driverDetail.isVerified && (
                <Button type="primary" onClick={() => { handleVerify(driverDetail.id); setSelectedId(null) }}>
                  Tasdiqlash
                </Button>
              )}
              <Button onClick={() => { openEditModal(driverDetail); setSelectedId(null) }}>
                Tahrirlash
              </Button>
              {driverDetail.isVerified && (
                <Button
                  style={{ backgroundColor: '#6B46C1', color: 'white', borderColor: '#6B46C1' }}
                  onClick={() => { handleGenerateCode(driverDetail.id); setSelectedId(null) }}
                  loading={loginCodeMutation.isPending}
                >
                  Kod berish
                </Button>
              )}
              <Button onClick={() => { setBalanceModal({ id: driverDetail.id, open: true }); setSelectedId(null) }}>
                <DollarOutlined /> Balans
              </Button>
              <Button onClick={() => {
                subscriptionMutation.mutate({
                  id: driverDetail.id,
                  active: !driverDetail.subscriptionActive,
                  days: 30,
                })
                setSelectedId(null)
              }}>
                {driverDetail.subscriptionActive ? 'Obuna o\'chirish' : 'Obuna berish (30 kun)'}
              </Button>
            </Space>
          ) : null
        }
      >
        {driverDetail && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Ism">{driverDetail.fullName || '—'}</Descriptions.Item>
            <Descriptions.Item label="Telefon">{driverDetail.phone || '—'}</Descriptions.Item>
            <Descriptions.Item label="Passport">{(driverDetail as any).passportNumber || '—'}</Descriptions.Item>
            <Descriptions.Item label="Tug'ilgan sana">{(driverDetail as any).birthDate || '—'}</Descriptions.Item>
            <Descriptions.Item label="Toifa">{driverDetail.vehicleType || '—'}</Descriptions.Item>
            <Descriptions.Item label="Marka">{(driverDetail as any).vehicleBrand || '—'}</Descriptions.Item>
            <Descriptions.Item label="Model">{(driverDetail as any).vehicleModel || '—'}</Descriptions.Item>
            <Descriptions.Item label="Rang">{(driverDetail as any).vehicleColor || '—'}</Descriptions.Item>
            <Descriptions.Item label="Davlat raqami">{driverDetail.vehicleNumber || '—'}</Descriptions.Item>
            <Descriptions.Item label="Yili">{(driverDetail as any).vehicleYear || '—'}</Descriptions.Item>
            <Descriptions.Item label="Sig'im">{driverDetail.vehicleCapacity || '—'}</Descriptions.Item>
            <Descriptions.Item label="Kuzov">{(driverDetail as any).bodyType || '—'}</Descriptions.Item>
            <Descriptions.Item label="Balans">
              <span style={{ fontWeight: 600 }}>{(driverDetail.balance || 0).toLocaleString()} UZS</span>
            </Descriptions.Item>
            <Descriptions.Item label="Shahar">{driverDetail.lastCity || '—'}</Descriptions.Item>
            <Descriptions.Item label="Online">
              <Badge status={driverDetail.isOnline ? 'success' : 'default'} text={driverDetail.isOnline ? 'Ha' : 'Yo\'q'} />
            </Descriptions.Item>
            <Descriptions.Item label="Tasdiqlangan">
              {driverDetail.isVerified ? <Tag color="green">Ha</Tag> : <Tag color="orange">Yo\'q</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="Obuna">
              {driverDetail.subscriptionActive ? <Tag color="blue">Faol</Tag> : <Tag>Yo\'q</Tag>}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Balance Modal */}
      <Modal
        open={balanceModal.open}
        onCancel={() => setBalanceModal({ id: '', open: false })}
        onOk={handleBalanceSubmit}
        title="Balans o'zgartirish"
        okText="Saqlash"
      >
        <Form form={balanceForm} layout="vertical">
          <Form.Item name="amount" label="Summa (musbat = qo'shish, manfiy = yechish)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} placeholder="Masalan: 50000 yoki -10000" />
          </Form.Item>
          <Form.Item name="description" label="Izoh">
            <Input placeholder="Sabab..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Driver Modal */}
      <Modal
        open={editModal.open}
        onCancel={() => { setEditModal({ id: '', open: false }); editForm.resetFields() }}
        onOk={handleEditSubmit}
        title="Haydovchi ma'lumotlarini tahrirlash"
        okText="Saqlash"
        confirmLoading={editDriverMutation.isPending}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="fullName" label="To'liq ism" rules={[{ required: true, message: 'Ismni kiriting' }]}>
            <Input placeholder="Ism familiya" />
          </Form.Item>
          <Form.Item name="phone" label="Telefon raqam" rules={[{ required: true, message: 'Telefon kiriting' }]}>
            <Input placeholder="+998901234567" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="vehicleType" label="Mashina turi">
                <Select placeholder="Tanlang" allowClear showSearch optionFilterProp="label" options={getVehicleTypeOptions()} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item noStyle shouldUpdate={(prev: any, cur: any) => prev.vehicleType !== cur.vehicleType}>
                {({ getFieldValue }: any) => (
                  <Form.Item name="vehicleBrand" label="Marka">
                    <Select placeholder="Tanlang" allowClear showSearch options={getBrandOptions(getFieldValue('vehicleType'))} />
                  </Form.Item>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="vehicleCapacity" label="Tonnaj">
                <Input placeholder="20" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="vehicleNumber" label="Davlat raqami">
                <Input placeholder="01 A 123 AA" style={{ textTransform: 'uppercase' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="bodyType" label="Kuzov turi">
                <Select placeholder="Tanlang" allowClear options={BODY_TYPES} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Login Code Modal */}
      <Modal
        open={loginCodeModal.open}
        onCancel={() => setLoginCodeModal({ open: false, code: '', phone: '', fullName: '' })}
        footer={[
          <Button key="copy" type="primary" onClick={() => {
            navigator.clipboard.writeText(loginCodeModal.code)
            message.success('Kod nusxalandi!')
          }}>
            Kodni nusxalash
          </Button>,
          <Button key="close" onClick={() => setLoginCodeModal({ open: false, code: '', phone: '', fullName: '' })}>
            Yopish
          </Button>,
        ]}
        title="Haydovchi login kodi"
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
            {loginCodeModal.fullName} ({loginCodeModal.phone})
          </p>
          <div style={{
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: 8,
            color: '#6B46C1',
            background: '#F3F0FF',
            padding: '16px 24px',
            borderRadius: 12,
            display: 'inline-block',
            fontFamily: 'monospace',
          }}>
            {loginCodeModal.code}
          </div>
          <p style={{ fontSize: 12, color: '#999', marginTop: 12 }}>
            Bu kod 24 soat amal qiladi. Haydovchiga yuboring — u ilovada telefon raqam + shu kodni kiritib kiradi.
          </p>
        </div>
      </Modal>

      {/* Reject Photo Modal */}
      <Modal
        open={rejectModal.open}
        onCancel={() => { setRejectModal({ id: '', open: false }); setRejectReason('') }}
        onOk={handleRejectPhoto}
        title="Fotoni rad etish"
        okText="Rad etish"
        okType="danger"
        okButtonProps={{ loading: rejectMutation.isPending }}
      >
        <Input.TextArea
          rows={3}
          placeholder="Rad etish sababi..."
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
        />
      </Modal>

      {/* HAYDOVCHI QO'SHISH */}
      <Modal
        title={<><PlusOutlined /> Yangi haydovchi qo'shish</>}
        open={createModal}
        onCancel={() => { setCreateModal(false); createForm.resetFields() }}
        footer={null}
        width={600}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateDriver}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="fullName" label="Ism Familiya" rules={[{ required: true, message: 'Ism kiriting' }]}>
                <Input placeholder="Ism Familiya" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="phone" label="Telefon" rules={[{ required: true, message: 'Telefon kiriting' }]}>
                <Input placeholder="+998..." />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="vehicleType" label="Mashina turi" rules={[{ required: true, message: 'Tanlang' }]}>
                <Select placeholder="Tanlang" showSearch optionFilterProp="label" options={getVehicleTypeOptions()} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="vehicleCapacity" label="Tonnaj">
                <Input placeholder="25" suffix="tonna" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="vehicleNumber" label="Davlat raqami">
                <Input placeholder="01 A 123 AA" style={{ textTransform: 'uppercase' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item noStyle shouldUpdate={(prev: any, cur: any) => prev.vehicleType !== cur.vehicleType}>
                {({ getFieldValue }: any) => (
                  <Form.Item name="vehicleBrand" label="Marka">
                    <Select placeholder="Tanlang" allowClear showSearch options={getBrandOptions(getFieldValue('vehicleType'))} />
                  </Form.Item>
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="bodyType" label="Kuzov turi">
                <Select placeholder="Tanlang" allowClear options={BODY_TYPES} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="region" label="Shahar/Viloyat">
                <Input placeholder="Toshkent" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createLoading} block size="large">
              Haydovchi qo'shish
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Drivers
