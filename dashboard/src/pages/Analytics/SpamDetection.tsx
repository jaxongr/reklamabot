import { useState } from 'react'
import { Card, Table, DatePicker, Typography, Tag, InputNumber, Space, Tooltip } from 'antd'
import { WarningOutlined, ClockCircleOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import dayjs from 'dayjs'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`

const SpamDetection = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(1, 'day'),
    dayjs(),
  ])
  const [minOrders, setMinOrders] = useState(5)

  const { data: phones, isLoading } = useQuery({
    queryKey: ['spamPhones', dateRange[0]?.format('YYYY-MM-DD'), dateRange[1]?.format('YYYY-MM-DD'), minOrders],
    queryFn: () =>
      api
        .get('/analytics/spam-phones', {
          params: {
            dateFrom: dateRange[0]?.format('YYYY-MM-DD'),
            dateTo: dateRange[1]?.format('YYYY-MM-DD'),
            minOrders,
          },
        })
        .then((r) => r.data),
  })

  const columns = [
    {
      title: 'Telefon',
      dataIndex: 'phone',
      width: 150,
      render: (v: string, row: any) => (
        <div>
          <Text strong copyable style={{ fontFamily: 'monospace' }}>{v}</Text>
          {row.senderName && (
            <div style={{ fontSize: 11, color: '#666' }}>
              {row.senderName}
              {row.senderUsername && <span style={{ color: '#1890ff' }}> @{row.senderUsername}</span>}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'E\'lonlar',
      dataIndex: 'count',
      width: 90,
      sorter: (a: any, b: any) => a.count - b.count,
      defaultSortOrder: 'descend' as const,
      render: (v: number) => (
        <Tag color={v >= 20 ? 'red' : v >= 10 ? 'orange' : 'gold'} style={{ fontSize: 14, fontWeight: 700 }}>
          {v}
        </Tag>
      ),
    },
    {
      title: 'Tezlik',
      dataIndex: 'ordersPerHour',
      width: 100,
      sorter: (a: any, b: any) => a.ordersPerHour - b.ordersPerHour,
      render: (v: number) => (
        <Tooltip title="Soatiga e'lon">
          <span style={{ color: v > 5 ? '#ff4d4f' : '#faad14' }}>
            <ClockCircleOutlined /> {v}/soat
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Vaqt oralig\'i',
      dataIndex: 'spanHours',
      width: 100,
      render: (v: number) => <span>{v} soat</span>,
    },
    {
      title: 'Guruhlar',
      dataIndex: 'uniqueGroups',
      width: 80,
      sorter: (a: any, b: any) => a.uniqueGroups - b.uniqueGroups,
      render: (v: number) => <Tag color="cyan">{v} ta</Tag>,
    },
    {
      title: "Yo'nalishlar",
      dataIndex: 'uniqueRoutes',
      width: 80,
      render: (v: number) => <Tag color="purple">{v} ta</Tag>,
    },
    {
      title: "Top yo'nalishlar",
      dataIndex: 'routes',
      render: (routes: string[]) =>
        routes?.map((r, i) => (
          <Tag key={i} style={{ margin: 2, fontSize: 11 }}>{r}</Tag>
        )) || '—',
    },
    {
      title: 'Xavf',
      width: 80,
      render: (_: any, row: any) => {
        const score = row.count >= 20 ? 'Yuqori' : row.count >= 10 ? "O'rta" : 'Past'
        const color = row.count >= 20 ? '#ff4d4f' : row.count >= 10 ? '#faad14' : '#52c41a'
        return <Tag color={color}>{score}</Tag>
      },
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}><WarningOutlined style={{ color: '#faad14' }} /> Spam Deteksiya</Title>
        <Space>
          <span style={{ fontSize: 13, color: '#666' }}>Min orderlar:</span>
          <InputNumber min={2} max={100} value={minOrders} onChange={(v) => setMinOrders(v || 5)} size="small" style={{ width: 70 }} />
          <RangePicker
            value={dateRange}
            onChange={(dates) => { if (dates?.[0] && dates?.[1]) setDateRange([dates[0], dates[1]]) }}
            format="DD/MM/YYYY"
          />
        </Space>
      </div>

      <StyledCard
        title={`${phones?.length || 0} ta raqam — ${minOrders}+ e'lon (${dateRange[0]?.format('DD.MM')} — ${dateRange[1]?.format('DD.MM')})`}
      >
        <Table
          columns={columns}
          dataSource={phones || []}
          loading={isLoading}
          rowKey="phone"
          pagination={{ pageSize: 20, showSizeChanger: true }}
          size="middle"
          scroll={{ x: 900 }}
        />
      </StyledCard>
    </div>
  )
}

export default SpamDetection
