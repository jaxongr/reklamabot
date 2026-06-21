import React, { useState } from 'react';
import { Card, Table, DatePicker, Space, Tag, Progress, Typography } from 'antd';
import styled from 'styled-components';
import type { Dayjs } from 'dayjs';
import { useTopRoutes } from '../../hooks/useApi';
import type { RouteAnalytics as RouteRow } from '../../types';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const PageWrapper = styled.div`
  padding: 24px;
`;

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const RankBadge = styled.div<{ rank: number }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  background: ${({ rank }) =>
    rank === 1
      ? '#FFD700'
      : rank === 2
      ? '#C0C0C0'
      : rank === 3
      ? '#CD7F32'
      : '#f0f0f0'};
  color: ${({ rank }) => (rank <= 3 ? '#333' : '#666')};
`;

const BarWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const RouteAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);

  const params: { dateFrom?: string; dateTo?: string; limit?: number } = { limit: 20 };
  if (dateRange[0]) params.dateFrom = dateRange[0].startOf('day').toISOString();
  if (dateRange[1]) params.dateTo = dateRange[1].endOf('day').toISOString();

  const { data, isLoading, error } = useTopRoutes(params);

  const routes: RouteRow[] = Array.isArray(data) ? data : [];
  const maxCount = routes.length > 0 ? Math.max(...routes.map((r) => r.count)) : 1;

  const columns = [
    {
      title: '#',
      dataIndex: 'rank',
      key: 'rank',
      width: 60,
      render: (rank: number) => <RankBadge rank={rank}>{rank}</RankBadge>,
    },
    {
      title: 'Qayerdan',
      dataIndex: 'from',
      key: 'from',
      render: (val: string) => (
        <Tag color="blue" style={{ fontSize: 13, padding: '2px 10px' }}>
          {val}
        </Tag>
      ),
    },
    {
      title: 'Qayerga',
      dataIndex: 'to',
      key: 'to',
      render: (val: string) => (
        <Tag color="green" style={{ fontSize: 13, padding: '2px 10px' }}>
          {val}
        </Tag>
      ),
    },
    {
      title: 'Buyurtmalar soni',
      dataIndex: 'count',
      key: 'count',
      render: (count: number) => (
        <BarWrapper>
          <Progress
            percent={Math.round((count / maxCount) * 100)}
            showInfo={false}
            strokeColor="#1677ff"
            style={{ width: 120 }}
          />
          <Text strong style={{ minWidth: 32 }}>
            {count}
          </Text>
        </BarWrapper>
      ),
    },
    {
      title: "O'rtacha masofa (km)",
      dataIndex: 'avgDistance',
      key: 'avgDistance',
      render: (val: number) =>
        val != null ? (
          <Text>{Math.round(val)} km</Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
  ];

  return (
    <PageWrapper>
      <StyledCard
        title={
          <Title level={4} style={{ margin: 0 }}>
            Top yo&apos;nalishlar
          </Title>
        }
      >
        <FilterRow>
          <Space>
            <Text type="secondary">Sana oralig&apos;i:</Text>
            <RangePicker
              value={dateRange}
              onChange={(vals) =>
                setDateRange(vals ? [vals[0], vals[1]] : [null, null])
              }
              format="DD.MM.YYYY"
              placeholder={['Boshlanish', 'Tugash']}
              allowClear
            />
          </Space>
        </FilterRow>

        {error && (
          <Text type="danger" style={{ display: 'block', marginBottom: 16 }}>
            Ma&apos;lumotlarni yuklashda xatolik yuz berdi.
          </Text>
        )}

        <Table
          dataSource={routes.map((r, i) => ({ ...r, key: i }))}
          columns={columns}
          loading={isLoading}
          pagination={{ pageSize: 20, showSizeChanger: false }}
          locale={{ emptyText: "Ma'lumot topilmadi" }}
          size="middle"
        />
      </StyledCard>
    </PageWrapper>
  );
};

export default RouteAnalytics;
