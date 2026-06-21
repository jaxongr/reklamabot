import { useState } from 'react'
import { Card, DatePicker, Typography, Row, Col, Statistic, Table, Tag } from 'antd'
import { UserAddOutlined, UserSwitchOutlined, UsergroupAddOutlined } from '@ant-design/icons'
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

const BarContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 200px;
  padding: 16px 0;
  overflow-x: auto;
`

const BarGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 40px;
  flex: 1;
`

const Bar = styled.div<{ $height: number; $color: string }>`
  width: 100%;
  max-width: 30px;
  height: ${({ $height }) => Math.max(2, $height)}px;
  background: ${({ $color }) => $color};
  border-radius: 3px 3px 0 0;
  transition: height 0.3s;
`

const BarLabel = styled.div`
  font-size: 10px;
  color: #999;
  margin-top: 4px;
  white-space: nowrap;
`

const SenderRetention = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(14, 'days'),
    dayjs(),
  ])

  const { data, isLoading } = useQuery({
    queryKey: ['senderRetention', dateRange[0]?.format('YYYY-MM-DD'), dateRange[1]?.format('YYYY-MM-DD')],
    queryFn: () =>
      api
        .get('/analytics/sender-retention', {
          params: {
            dateFrom: dateRange[0]?.format('YYYY-MM-DD'),
            dateTo: dateRange[1]?.format('YYYY-MM-DD'),
          },
        })
        .then((r) => r.data),
  })

  const daily = data?.daily || []
  const summary = data?.summary || {}
  const maxCount = daily.length > 0 ? Math.max(...daily.map((d: any) => d.newCount + d.returningCount), 1) : 1

  const tableColumns = [
    {
      title: 'Sana',
      dataIndex: 'date',
      render: (v: string) => dayjs(v).format('DD.MM.YYYY (dd)'),
    },
    {
      title: 'Yangi',
      dataIndex: 'newCount',
      render: (v: number) => <Tag color="green">{v}</Tag>,
    },
    {
      title: 'Qaytgan',
      dataIndex: 'returningCount',
      render: (v: number) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: 'Jami orderlar',
      dataIndex: 'total',
    },
    {
      title: 'Yangilar ulushi',
      render: (_: any, row: any) => {
        const total = row.newCount + row.returningCount
        const pct = total > 0 ? Math.round((row.newCount / total) * 100) : 0
        return <span style={{ color: pct > 60 ? '#52c41a' : '#faad14' }}>{pct}%</span>
      },
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}><UserSwitchOutlined /> Yangi vs Qaytgan</Title>
        <RangePicker
          value={dateRange}
          onChange={(dates) => { if (dates?.[0] && dates?.[1]) setDateRange([dates[0], dates[1]]) }}
          format="DD/MM/YYYY"
        />
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <StyledCard>
            <Statistic title="Jami unikal" value={summary.totalUnique || 0} prefix={<UsergroupAddOutlined />} valueStyle={{ color: '#1890ff' }} />
          </StyledCard>
        </Col>
        <Col span={6}>
          <StyledCard>
            <Statistic title="Yangi raqamlar" value={summary.totalNew || 0} prefix={<UserAddOutlined />} valueStyle={{ color: '#52c41a' }} />
          </StyledCard>
        </Col>
        <Col span={6}>
          <StyledCard>
            <Statistic title="Qaytganlar" value={summary.totalReturning || 0} prefix={<UserSwitchOutlined />} valueStyle={{ color: '#722ed1' }} />
          </StyledCard>
        </Col>
        <Col span={6}>
          <StyledCard>
            <Statistic title="Yangilar ulushi" value={summary.newPercentage || 0} suffix="%" valueStyle={{ color: '#faad14' }} />
          </StyledCard>
        </Col>
      </Row>

      <StyledCard title="Kunlik grafik" loading={isLoading}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
          <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#52c41a', borderRadius: 2, marginRight: 4 }} />Yangi</span>
          <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#722ed1', borderRadius: 2, marginRight: 4 }} />Qaytgan</span>
        </div>
        <BarContainer>
          {daily.map((d: any) => (
            <BarGroup key={d.date}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Bar $height={(d.returningCount / maxCount) * 160} $color="#722ed1" />
                <Bar $height={(d.newCount / maxCount) * 160} $color="#52c41a" />
              </div>
              <BarLabel>{dayjs(d.date).format('DD.MM')}</BarLabel>
            </BarGroup>
          ))}
        </BarContainer>
      </StyledCard>

      <StyledCard title="Kunlik jadval" style={{ marginTop: 16 }} loading={isLoading}>
        <Table
          columns={tableColumns}
          dataSource={daily}
          rowKey="date"
          pagination={false}
          size="small"
        />
      </StyledCard>
    </div>
  )
}

export default SenderRetention
