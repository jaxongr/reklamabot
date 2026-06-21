import { useState } from 'react'
import { Card, Table, DatePicker, Typography, Tag, Progress, Tooltip } from 'antd'
import { TrophyOutlined, ThunderboltOutlined } from '@ant-design/icons'
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

const EfficiencyBadge = styled.div<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 16px;
  font-weight: 700;
  font-size: 14px;
  background: ${({ $color }) => $color}15;
  color: ${({ $color }) => $color};
`

const GroupEfficiency = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'days'),
    dayjs(),
  ])

  const { data: groups, isLoading } = useQuery({
    queryKey: ['groupEfficiency', dateRange[0]?.format('YYYY-MM-DD'), dateRange[1]?.format('YYYY-MM-DD')],
    queryFn: () =>
      api
        .get('/analytics/group-efficiency', {
          params: {
            dateFrom: dateRange[0]?.format('YYYY-MM-DD'),
            dateTo: dateRange[1]?.format('YYYY-MM-DD'),
            limit: 50,
          },
        })
        .then((r) => r.data),
  })

  const maxEfficiency = groups?.length ? Math.max(...groups.map((g: any) => g.efficiency)) : 1

  const columns = [
    {
      title: '#',
      width: 50,
      render: (_: any, __: any, i: number) => {
        const rank = i + 1
        const icon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}`
        return <span style={{ fontSize: rank <= 3 ? 18 : 14 }}>{icon}</span>
      },
    },
    {
      title: 'Guruh',
      dataIndex: 'groupTitle',
      ellipsis: true,
      render: (v: string, row: any) => (
        <div>
          <Text strong>{v}</Text>
          <div style={{ fontSize: 11, color: '#bbb', fontFamily: 'monospace' }}>{row.groupTelegramId}</div>
        </div>
      ),
    },
    {
      title: 'Samaradorlik',
      dataIndex: 'efficiency',
      width: 150,
      sorter: (a: any, b: any) => a.efficiency - b.efficiency,
      defaultSortOrder: 'descend' as const,
      render: (v: number) => {
        const color = v > maxEfficiency * 0.7 ? '#52c41a' : v > maxEfficiency * 0.3 ? '#1890ff' : '#d9d9d9'
        return (
          <EfficiencyBadge $color={color}>
            <ThunderboltOutlined /> {v.toFixed(2)}
          </EfficiencyBadge>
        )
      },
    },
    {
      title: 'Orderlar',
      dataIndex: 'totalOrders',
      width: 90,
      sorter: (a: any, b: any) => a.totalOrders - b.totalOrders,
      render: (v: number) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: 'Soatiga',
      dataIndex: 'ordersPerHour',
      width: 80,
      sorter: (a: any, b: any) => a.ordersPerHour - b.ordersPerHour,
      render: (v: number) => <span style={{ fontWeight: 600 }}>{v}/soat</span>,
    },
    {
      title: 'Unikal raqamlar',
      dataIndex: 'uniquePhones',
      width: 120,
      sorter: (a: any, b: any) => a.uniquePhones - b.uniquePhones,
      render: (v: number) => <Tag color="green">{v}</Tag>,
    },
    {
      title: "Yo'nalishlar",
      dataIndex: 'uniqueRoutes',
      width: 100,
      render: (v: number) => <Tag color="purple">{v} ta</Tag>,
    },
    {
      title: 'Unikallik',
      dataIndex: 'uniqueRatio',
      width: 120,
      sorter: (a: any, b: any) => a.uniqueRatio - b.uniqueRatio,
      render: (v: number) => (
        <Tooltip title="Unikal phone / jami orderlar">
          <Progress
            percent={v}
            size="small"
            strokeColor={v > 70 ? '#52c41a' : v > 40 ? '#faad14' : '#ff4d4f'}
          />
        </Tooltip>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}><TrophyOutlined style={{ color: '#faad14' }} /> Guruh Samaradorligi</Title>
        <RangePicker
          value={dateRange}
          onChange={(dates) => { if (dates?.[0] && dates?.[1]) setDateRange([dates[0], dates[1]]) }}
          format="DD/MM/YYYY"
        />
      </div>

      <StyledCard
        extra={
          <span style={{ fontSize: 12, color: '#999' }}>
            Samaradorlik = soatiga unikal order nisbati
          </span>
        }
      >
        <Table
          columns={columns}
          dataSource={groups || []}
          loading={isLoading}
          rowKey="groupTelegramId"
          pagination={{ pageSize: 25, showSizeChanger: true, showTotal: (t) => `Jami: ${t}` }}
          size="middle"
          scroll={{ x: 900 }}
        />
      </StyledCard>
    </div>
  )
}

export default GroupEfficiency
