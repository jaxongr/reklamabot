import { useState } from 'react'
import { Card, Table, DatePicker, Typography, Progress, Tag, Modal, Spin } from 'antd'
import { TeamOutlined, CalendarOutlined } from '@ant-design/icons'
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

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-top: 12px;
`

const CalendarCell = styled.div<{ $intensity: number }>`
  aspect-ratio: 1;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  background: ${({ $intensity }) =>
    $intensity === 0
      ? '#f0f0f0'
      : $intensity <= 5
        ? '#d9f7be'
        : $intensity <= 15
          ? '#95de64'
          : $intensity <= 40
            ? '#52c41a'
            : $intensity <= 80
              ? '#237804'
              : '#135200'};
  color: ${({ $intensity }) => ($intensity > 15 ? '#fff' : '#333')};
  &:hover {
    opacity: 0.8;
    transform: scale(1.1);
  }
  transition: all 0.15s;
`

const DayHeader = styled.div`
  text-align: center;
  font-size: 11px;
  color: #999;
  font-weight: 500;
  padding-bottom: 4px;
`

const MonthLabel = styled.div`
  font-size: 12px;
  color: #666;
  font-weight: 600;
  margin: 8px 0 4px;
`

const LegendBar = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
  font-size: 12px;
  color: #666;
`

const LegendBox = styled.div<{ $color: string }>`
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background: ${({ $color }) => $color};
`

const TopGroups = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ])
  const [selectedGroup, setSelectedGroup] = useState<any>(null)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const { data: groups, isLoading } = useQuery({
    queryKey: ['topGroups', dateRange[0]?.format('YYYY-MM-DD'), dateRange[1]?.format('YYYY-MM-DD')],
    queryFn: () =>
      api
        .get('/analytics/top-groups', {
          params: {
            dateFrom: dateRange[0]?.format('YYYY-MM-DD'),
            dateTo: dateRange[1]?.format('YYYY-MM-DD'),
            limit: 50,
          },
        })
        .then((r) => r.data),
  })

  const { data: calendarData, isLoading: calLoading } = useQuery({
    queryKey: [
      'groupCalendar',
      selectedGroup?.groupTelegramId,
      dateRange[0]?.format('YYYY-MM-DD'),
      dateRange[1]?.format('YYYY-MM-DD'),
    ],
    queryFn: () =>
      api
        .get('/analytics/group-calendar', {
          params: {
            groupTelegramId: selectedGroup?.groupTelegramId,
            dateFrom: dateRange[0]?.format('YYYY-MM-DD'),
            dateTo: dateRange[1]?.format('YYYY-MM-DD'),
          },
        })
        .then((r) => r.data),
    enabled: !!selectedGroup?.groupTelegramId,
  })

  const maxCount = groups?.length ? Math.max(...groups.map((g: any) => g.count)) : 1

  const columns = [
    {
      title: '#',
      dataIndex: 'rank',
      width: 50,
      render: (v: number) => (
        <span style={{ fontWeight: 600, color: v <= 3 ? '#f5222d' : '#666' }}>{v}</span>
      ),
    },
    {
      title: 'Guruh nomi',
      dataIndex: 'groupTitle',
      ellipsis: true,
      render: (v: string, row: any) => (
        <div>
          <Text strong>{v}</Text>
          <div style={{ fontSize: 11, color: '#999', fontFamily: 'monospace' }}>{row.groupTelegramId}</div>
        </div>
      ),
    },
    {
      title: 'Orderlar',
      dataIndex: 'count',
      width: 120,
      sorter: (a: any, b: any) => a.count - b.count,
      render: (v: number) => <Tag color="blue">{v.toLocaleString()}</Tag>,
    },
    {
      title: 'Ulush',
      dataIndex: 'percentage',
      width: 200,
      render: (v: number, row: any) => (
        <div>
          <Progress
            percent={Math.round((row.count / maxCount) * 100)}
            size="small"
            format={() => `${v}%`}
            strokeColor={v > 10 ? '#52c41a' : v > 3 ? '#1890ff' : '#d9d9d9'}
          />
        </div>
      ),
    },
    {
      title: 'Kalendar',
      width: 80,
      render: (_: any, row: any) => (
        <a
          onClick={() => {
            setSelectedGroup(row)
            setCalendarOpen(true)
          }}
        >
          <CalendarOutlined /> Ko'rish
        </a>
      ),
    },
  ]

  // Build calendar view
  const renderCalendar = () => {
    if (!calendarData || calLoading) return <Spin />
    const dataMap: Record<string, number> = {}
    for (const d of calendarData) {
      dataMap[d.date] = d.count
    }

    // Generate date range
    const start = dateRange[0]
    const end = dateRange[1]
    const days: dayjs.Dayjs[] = []
    let cur = start.startOf('day')
    while (cur.isBefore(end) || cur.isSame(end, 'day')) {
      days.push(cur)
      cur = cur.add(1, 'day')
    }

    // Group by month
    const months: Record<string, dayjs.Dayjs[]> = {}
    for (const d of days) {
      const key = d.format('YYYY-MM')
      if (!months[key]) months[key] = []
      months[key].push(d)
    }

    const dayNames = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']

    return (
      <div>
        <LegendBar>
          <span>Kam</span>
          <LegendBox $color="#f0f0f0" />
          <LegendBox $color="#d9f7be" />
          <LegendBox $color="#95de64" />
          <LegendBox $color="#52c41a" />
          <LegendBox $color="#237804" />
          <LegendBox $color="#135200" />
          <span>Ko'p</span>
        </LegendBar>
        {Object.entries(months).map(([month, monthDays]) => (
          <div key={month}>
            <MonthLabel>{dayjs(month + '-01').format('MMMM YYYY')}</MonthLabel>
            <CalendarGrid>
              {dayNames.map((d) => (
                <DayHeader key={d}>{d}</DayHeader>
              ))}
              {/* Empty cells for first week alignment */}
              {Array.from({ length: monthDays[0].day() === 0 ? 6 : monthDays[0].day() - 1 }).map(
                (_, i) => (
                  <div key={`empty-${i}`} />
                ),
              )}
              {monthDays.map((d) => {
                const count = dataMap[d.format('YYYY-MM-DD')] || 0
                return (
                  <CalendarCell
                    key={d.format('YYYY-MM-DD')}
                    $intensity={count}
                    title={`${d.format('DD.MM')} — ${count} order`}
                  >
                    {count > 0 ? count : ''}
                  </CalendarCell>
                )
              })}
            </CalendarGrid>
          </div>
        ))}
      </div>
    )
  }

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
          <TeamOutlined /> Top Guruhlar
        </Title>
        <RangePicker
          value={dateRange}
          onChange={(dates) => {
            if (dates && dates[0] && dates[1]) setDateRange([dates[0], dates[1]])
          }}
          format="DD/MM/YYYY"
        />
      </div>

      <StyledCard>
        <Table
          columns={columns}
          dataSource={groups || []}
          loading={isLoading}
          rowKey="groupTelegramId"
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `Jami: ${t}` }}
          size="middle"
        />
      </StyledCard>

      <Modal
        open={calendarOpen}
        onCancel={() => setCalendarOpen(false)}
        title={
          <span>
            <CalendarOutlined /> {selectedGroup?.groupTitle} — Kunlik orderlar
          </span>
        }
        footer={null}
        width={600}
      >
        {renderCalendar()}
      </Modal>
    </div>
  )
}

export default TopGroups
