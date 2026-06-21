import { useState } from 'react'
import { Card, Table, DatePicker, Typography, Tag, Progress, Row, Col, Statistic, Tooltip } from 'antd'
import { ApiOutlined, ThunderboltOutlined, ClockCircleOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import dayjs from 'dayjs'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'

const { Title } = Typography
const { RangePicker } = DatePicker

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`

const HourBar = styled.div<{ $height: number; $color: string }>`
  width: 100%;
  height: ${({ $height }) => Math.max(2, $height)}px;
  max-height: 60px;
  background: ${({ $color }) => $color};
  border-radius: 2px 2px 0 0;
  transition: height 0.3s;
`

const HourChart = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 70px;
  padding-top: 10px;
`

const HourLabel = styled.div`
  font-size: 9px;
  color: #999;
  text-align: center;
  width: 100%;
`

const SessionStats = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'days'),
    dayjs(),
  ])

  const { data, isLoading } = useQuery({
    queryKey: ['sessionStats', dateRange[0]?.format('YYYY-MM-DD'), dateRange[1]?.format('YYYY-MM-DD')],
    queryFn: () =>
      api
        .get('/analytics/session-stats', {
          params: {
            dateFrom: dateRange[0]?.format('YYYY-MM-DD'),
            dateTo: dateRange[1]?.format('YYYY-MM-DD'),
          },
        })
        .then((r) => r.data),
  })

  const sessions = data?.sessions || []
  const hourlyData = data?.hourlyData || {}

  const totalOrders = sessions.reduce((s: number, ss: any) => s + ss.periodOrders, 0)
  const totalHourly = sessions.reduce((s: number, ss: any) => s + ss.hourlyOrders, 0)
  const activeSessions = sessions.filter((s: any) => s.status === 'ACTIVE')

  const columns = [
    {
      title: 'Session',
      width: 160,
      render: (_: any, row: any) => (
        <div>
          <Tag color={row.status === 'ACTIVE' ? 'green' : 'default'}>
            {row.status === 'ACTIVE' ? <CheckCircleOutlined /> : <StopOutlined />}
            {' '}{row.phone}
          </Tag>
          <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
            {row.id.slice(-8)}
          </div>
        </div>
      ),
    },
    {
      title: 'Soatlik',
      dataIndex: 'hourlyOrders',
      width: 80,
      sorter: (a: any, b: any) => a.hourlyOrders - b.hourlyOrders,
      render: (v: number) => (
        <span style={{ fontWeight: 700, fontSize: 18, color: v > 10 ? '#52c41a' : v > 0 ? '#1890ff' : '#d9d9d9' }}>
          {v}
        </span>
      ),
    },
    {
      title: 'Bugun',
      dataIndex: 'todayOrders',
      width: 80,
      sorter: (a: any, b: any) => a.todayOrders - b.todayOrders,
      render: (v: number) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: 'Davr',
      dataIndex: 'periodOrders',
      width: 80,
      sorter: (a: any, b: any) => a.periodOrders - b.periodOrders,
      render: (v: number) => <Tag>{v.toLocaleString()}</Tag>,
    },
    {
      title: 'Konversiya',
      dataIndex: 'conversionRate',
      width: 100,
      sorter: (a: any, b: any) => a.conversionRate - b.conversionRate,
      render: (v: number) => (
        <Progress
          percent={Math.min(100, v * 10)}
          size="small"
          format={() => `${v}%`}
          strokeColor={v > 5 ? '#52c41a' : v > 2 ? '#faad14' : '#ff4d4f'}
        />
      ),
    },
    {
      title: "O'qilgan",
      dataIndex: 'messagesRead',
      width: 100,
      render: (v: number) => <span style={{ color: '#666' }}>{v.toLocaleString()}</span>,
    },
    {
      title: 'Guruhlar',
      width: 90,
      render: (_: any, row: any) => (
        <Tooltip title={`Jami: ${row.totalGroups}, Aktiv: ${row.activeGroups}`}>
          <span>{row.activeGroups}/{row.totalGroups}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Oxirgi 24 soat',
      width: 250,
      render: (_: any, row: any) => {
        const hours = hourlyData[row.id.slice(-8)] || []
        if (!hours.length) return <span style={{ color: '#d9d9d9' }}>—</span>
        const max = Math.max(...hours, 1)
        return (
          <div>
            <HourChart>
              {hours.map((v: number, i: number) => (
                <Tooltip key={i} title={`${i}:00 — ${v} order`}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <HourBar $height={(v / max) * 60} $color={v > max * 0.7 ? '#52c41a' : v > 0 ? '#1890ff' : '#f0f0f0'} />
                    {i % 4 === 0 && <HourLabel>{i}</HourLabel>}
                  </div>
                </Tooltip>
              ))}
            </HourChart>
          </div>
        )
      },
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}><ApiOutlined /> Session Samaradorligi</Title>
        <RangePicker
          value={dateRange}
          onChange={(dates) => { if (dates?.[0] && dates?.[1]) setDateRange([dates[0], dates[1]]) }}
          format="DD/MM/YYYY"
        />
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <StyledCard>
            <Statistic title="Aktiv sessionlar" value={activeSessions.length} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} />
          </StyledCard>
        </Col>
        <Col span={6}>
          <StyledCard>
            <Statistic title="Soatlik orderlar" value={totalHourly} prefix={<ThunderboltOutlined />} valueStyle={{ color: '#1890ff' }} />
          </StyledCard>
        </Col>
        <Col span={6}>
          <StyledCard>
            <Statistic title="Davrdagi orderlar" value={totalOrders} prefix={<ClockCircleOutlined />} />
          </StyledCard>
        </Col>
        <Col span={6}>
          <StyledCard>
            <Statistic
              title="O'rtacha konversiya"
              value={activeSessions.length > 0 ? (activeSessions.reduce((s: number, ss: any) => s + ss.conversionRate, 0) / activeSessions.length).toFixed(2) : 0}
              suffix="%"
            />
          </StyledCard>
        </Col>
      </Row>

      <StyledCard>
        <Table
          columns={columns}
          dataSource={sessions}
          loading={isLoading}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </StyledCard>
    </div>
  )
}

export default SessionStats
