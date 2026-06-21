import { useState } from 'react'
import { Card, Table, DatePicker, Typography, Tag, Tooltip, Space } from 'antd'
import { PhoneOutlined, NodeIndexOutlined, TeamOutlined, CarOutlined } from '@ant-design/icons'
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

const StatBadge = styled.div<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $color }) => $color}15;
  color: ${({ $color }) => $color};
`

const RouteTag = styled(Tag)`
  margin: 2px;
  border-radius: 8px;
  font-size: 11px;
`

const TopPhones = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'days'),
    dayjs(),
  ])

  const { data: phones, isLoading } = useQuery({
    queryKey: ['topPhones', dateRange[0]?.format('YYYY-MM-DD'), dateRange[1]?.format('YYYY-MM-DD')],
    queryFn: () =>
      api
        .get('/analytics/top-phones', {
          params: {
            dateFrom: dateRange[0]?.format('YYYY-MM-DD'),
            dateTo: dateRange[1]?.format('YYYY-MM-DD'),
            limit: 50,
          },
        })
        .then((r) => r.data),
  })

  const columns = [
    {
      title: '#',
      dataIndex: 'rank',
      width: 50,
      render: (v: number) => (
        <span
          style={{
            fontWeight: 700,
            color: v === 1 ? '#faad14' : v === 2 ? '#8c8c8c' : v === 3 ? '#d48806' : '#999',
            fontSize: v <= 3 ? 16 : 14,
          }}
        >
          {v}
        </span>
      ),
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      width: 160,
      render: (v: string, row: any) => (
        <div>
          <Text strong copyable style={{ fontFamily: 'monospace' }}>
            {v}
          </Text>
          {row.senderName && (
            <div style={{ fontSize: 12, color: '#666' }}>
              {row.senderName}
              {row.senderUsername && (
                <span style={{ color: '#1890ff' }}> @{row.senderUsername}</span>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Jami orderlar',
      dataIndex: 'totalOrders',
      width: 120,
      sorter: (a: any, b: any) => a.totalOrders - b.totalOrders,
      defaultSortOrder: 'descend' as const,
      render: (v: number) => (
        <Tag color="blue" style={{ fontSize: 14, fontWeight: 600, padding: '2px 12px' }}>
          {v}
        </Tag>
      ),
    },
    {
      title: "Yo'nalishlar",
      dataIndex: 'uniqueRoutes',
      width: 110,
      sorter: (a: any, b: any) => a.uniqueRoutes - b.uniqueRoutes,
      render: (v: number) => (
        <StatBadge $color="#722ed1">
          <NodeIndexOutlined /> {v} ta
        </StatBadge>
      ),
    },
    {
      title: 'Guruhlar',
      dataIndex: 'uniqueGroups',
      width: 100,
      sorter: (a: any, b: any) => a.uniqueGroups - b.uniqueGroups,
      render: (v: number) => (
        <StatBadge $color="#13c2c2">
          <TeamOutlined /> {v} ta
        </StatBadge>
      ),
    },
    {
      title: 'Turi',
      width: 120,
      render: (_: any, row: any) => (
        <Space size={4}>
          {row.cargoCount > 0 && <Tag color="green">Yuk: {row.cargoCount}</Tag>}
          {row.driverCount > 0 && (
            <Tag color="orange">
              <CarOutlined /> {row.driverCount}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Top yo'nalishlar",
      dataIndex: 'topRoutes',
      render: (routes: string[]) =>
        routes?.length > 0 ? (
          <div style={{ maxWidth: 300 }}>
            {routes.map((r, i) => (
              <Tooltip key={i} title={r}>
                <RouteTag color="purple">{r}</RouteTag>
              </Tooltip>
            ))}
          </div>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
  ]

  // Summary stats
  const totalOrders = phones?.reduce((s: number, p: any) => s + p.totalOrders, 0) || 0
  const avgRoutes =
    phones?.length > 0
      ? (phones.reduce((s: number, p: any) => s + p.uniqueRoutes, 0) / phones.length).toFixed(1)
      : '0'

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Title level={2}>
          <PhoneOutlined /> Top Raqamlar
        </Title>
        <RangePicker
          value={dateRange}
          onChange={(dates) => {
            if (dates && dates[0] && dates[1]) setDateRange([dates[0], dates[1]])
          }}
          format="DD/MM/YYYY"
        />
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <StyledCard size="small" style={{ flex: 1 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1890ff' }}>{phones?.length || 0}</div>
            <div style={{ fontSize: 12, color: '#999' }}>Unikal raqamlar</div>
          </div>
        </StyledCard>
        <StyledCard size="small" style={{ flex: 1 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a' }}>{totalOrders}</div>
            <div style={{ fontSize: 12, color: '#999' }}>Jami orderlar</div>
          </div>
        </StyledCard>
        <StyledCard size="small" style={{ flex: 1 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#722ed1' }}>{avgRoutes}</div>
            <div style={{ fontSize: 12, color: '#999' }}>O'rtacha yo'nalish</div>
          </div>
        </StyledCard>
      </div>

      <StyledCard>
        <Table
          columns={columns}
          dataSource={phones || []}
          loading={isLoading}
          rowKey="phone"
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `Jami: ${t}` }}
          size="middle"
          scroll={{ x: 900 }}
        />
      </StyledCard>
    </div>
  )
}

export default TopPhones
