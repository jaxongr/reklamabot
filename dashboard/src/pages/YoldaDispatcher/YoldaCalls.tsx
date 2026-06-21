import { useState } from 'react'
import { Card, Table, Tag, Space, Typography, DatePicker, Select, Input, Row, Col, Statistic } from 'antd'
import { PhoneOutlined, PhoneOutlined as IncomingIcon, PhoneFilled } from '@ant-design/icons'
import { useYoldaCalls, useYoldaCallStats, useYoldaDispatchers } from './useYoldaApi'
import dayjs from 'dayjs'

const { Title } = Typography
const { RangePicker } = DatePicker

const VEHICLE_COLORS: Record<string, string> = {
  FURA: 'purple',
  KAMAZ: 'blue',
  ISUZU: 'cyan',
  GAZEL: 'orange',
  LABO: 'geekblue',
  DAMAS: 'magenta',
  MAN: 'gold',
  MERCEDES: 'lime',
  SCANIA: 'red',
  VOLVO: 'green',
}

const YoldaCalls = () => {
  const [filters, setFilters] = useState<any>({})
  const { data, isLoading } = useYoldaCalls({ ...filters, limit: 100 })
  const { data: stats } = useYoldaCallStats({ days: 7 })
  const { data: dispatchers } = useYoldaDispatchers()

  const items = data?.items || []
  const total = data?.total || 0

  const columns = [
    {
      title: 'Vaqt',
      dataIndex: 'startedAt',
      render: (d: string) => dayjs(d).format('DD.MM.YY HH:mm'),
      width: 120,
    },
    {
      title: 'Yo\'nalish',
      dataIndex: 'direction',
      render: (d: string) => d === 'INBOUND'
        ? <Tag color="blue" icon={<PhoneOutlined />}>Kiruvchi</Tag>
        : <Tag color="green" icon={<PhoneFilled />}>Chiquvchi</Tag>,
      width: 120,
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      render: (p: string) => <code>{p}</code>,
    },
    {
      title: 'Dispatcher',
      dataIndex: 'dispatcher',
      render: (d: any) => d ? `${d.fullName || d.phone}` : '—',
    },
    {
      title: 'Davomiyligi',
      dataIndex: 'durationSec',
      render: (s: number) => s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : '—',
      width: 100,
    },
    {
      title: 'Mashina',
      dataIndex: 'vehicleType',
      render: (v: string) => v ? <Tag color={VEHICLE_COLORS[v] || 'default'}>{v}</Tag> : '—',
    },
    {
      title: 'Sig\'imi',
      dataIndex: 'vehicleCapacity',
      render: (v: string) => v || '—',
      width: 100,
    },
    {
      title: 'Rol',
      dataIndex: 'senderRole',
      render: (r: string) => r === 'CARGO_OWNER' ? <Tag color="gold">Yukchi</Tag>
        : r === 'DRIVER' ? <Tag color="cyan">Haydovchi</Tag>
        : r === 'SPAM' ? <Tag color="red">Spam</Tag>
        : r ? <Tag>{r}</Tag> : '—',
    },
    {
      title: 'Voice',
      dataIndex: 'voiceSent',
      render: (sent: boolean, row: any) => sent
        ? <Tag color="green">✓ Yuborilgan</Tag>
        : row.voiceError ? <Tag color="red">Xato</Tag> : <Tag>—</Tag>,
    },
  ]

  return (
    <div>
      <Title level={3} style={{ marginBottom: 16 }}>
        <PhoneOutlined /> Yo'lda Qo'ng'iroqlar
      </Title>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="7 kunlik jami" value={stats?.total || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Kiruvchi"
              value={stats?.byDirection?.find((d: any) => d.direction === 'INBOUND')?._count || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Chiquvchi"
              value={stats?.byDirection?.find((d: any) => d.direction === 'OUTBOUND')?._count || 0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Yuk sohiblari"
              value={stats?.byRole?.find((r: any) => r.senderRole === 'CARGO_OWNER')?._count || 0}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="Telefon"
            prefix={<PhoneOutlined />}
            style={{ width: 180 }}
            onChange={(e) => setFilters({ ...filters, phone: e.target.value || undefined })}
          />
          <Select
            placeholder="Dispatcher"
            style={{ width: 200 }}
            allowClear
            options={(dispatchers || []).map((d: any) => ({ value: d.id, label: d.fullName || d.phone }))}
            onChange={(v) => setFilters({ ...filters, dispatcherId: v })}
          />
          <Select
            placeholder="Mashina turi"
            style={{ width: 150 }}
            allowClear
            options={Object.keys(VEHICLE_COLORS).map((k) => ({ value: k, label: k }))}
            onChange={(v) => setFilters({ ...filters, vehicleType: v })}
          />
          <Select
            placeholder="Rol"
            style={{ width: 150 }}
            allowClear
            options={[
              { value: 'CARGO_OWNER', label: 'Yuk sohibi' },
              { value: 'DRIVER', label: 'Haydovchi' },
              { value: 'UNKNOWN', label: 'Noma\'lum' },
              { value: 'SPAM', label: 'Spam' },
            ]}
            onChange={(v) => setFilters({ ...filters, senderRole: v })}
          />
          <RangePicker
            showTime
            onChange={(dates) => {
              if (dates) {
                setFilters({
                  ...filters,
                  from: dates[0]?.toISOString(),
                  to: dates[1]?.toISOString(),
                })
              } else {
                setFilters({ ...filters, from: undefined, to: undefined })
              }
            }}
          />
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={items}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 20, total }}
          size="middle"
        />
      </Card>
    </div>
  )
}

export default YoldaCalls
