import React from 'react';
import { Card, Table, Progress, Tag, Typography } from 'antd';
import styled from 'styled-components';
import { useVehicleTypeStats } from '../../hooks/useApi';
import type { VehicleTypeStat } from '../../types';

const { Title, Text } = Typography;

const PageWrapper = styled.div`
  padding: 24px;
`;

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const SummaryRow = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const SummaryBox = styled.div`
  background: #f5f7fa;
  border-radius: 8px;
  padding: 12px 20px;
  min-width: 120px;
  text-align: center;
`;

const VEHICLE_COLOR_MAP: Record<string, string> = {
  Fura: 'purple',
  Kamaz: 'red',
  Gazel: 'orange',
  Porter: 'cyan',
  Labo: 'lime',
  Damas: 'gold',
  Tentli: 'geekblue',
  Refrijerator: 'blue',
  Samosval: 'volcano',
  Konteyner: 'magenta',
  MAN: 'processing',
  Volvo: 'success',
  Scania: 'warning',
};

function getTagColor(vehicleType: string): string {
  return VEHICLE_COLOR_MAP[vehicleType] ?? 'default';
}

const VehicleStats: React.FC = () => {
  const { data, isLoading, error } = useVehicleTypeStats();

  const rows: VehicleTypeStat[] = Array.isArray(data) ? data : [];
  const total = rows.reduce((sum, r) => sum + r.count, 0);

  const columns = [
    {
      title: 'Mashina turi',
      dataIndex: 'vehicleType',
      key: 'vehicleType',
      render: (val: string) => (
        <Tag color={getTagColor(val)} style={{ fontSize: 13, padding: '2px 12px' }}>
          {val || "Noma'lum"}
        </Tag>
      ),
    },
    {
      title: 'Buyurtmalar',
      dataIndex: 'count',
      key: 'count',
      sorter: (a: VehicleTypeStat, b: VehicleTypeStat) => a.count - b.count,
      defaultSortOrder: 'descend' as const,
      render: (val: number) => (
        <Text strong style={{ fontSize: 15 }}>
          {val.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Ulush (%)',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (val: number, record: VehicleTypeStat) => {
        const pct = val ?? (total > 0 ? Math.round((record.count / total) * 1000) / 10 : 0);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Progress
              percent={pct}
              showInfo={false}
              strokeColor="#52c41a"
              style={{ width: 140 }}
            />
            <Text style={{ minWidth: 44, textAlign: 'right' }}>{pct.toFixed(1)}%</Text>
          </div>
        );
      },
    },
  ];

  return (
    <PageWrapper>
      <StyledCard
        title={
          <Title level={4} style={{ margin: 0 }}>
            Mashina turlari
          </Title>
        }
      >
        {!isLoading && !error && rows.length > 0 && (
          <SummaryRow>
            <SummaryBox>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Jami tur
              </Text>
              <br />
              <Text strong style={{ fontSize: 20 }}>
                {rows.length}
              </Text>
            </SummaryBox>
            <SummaryBox>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Jami buyurtma
              </Text>
              <br />
              <Text strong style={{ fontSize: 20 }}>
                {total.toLocaleString()}
              </Text>
            </SummaryBox>
            <SummaryBox>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Eng ko&apos;p
              </Text>
              <br />
              <Text strong style={{ fontSize: 16 }}>
                {rows[0]?.vehicleType || '—'}
              </Text>
            </SummaryBox>
          </SummaryRow>
        )}

        {error && (
          <Text type="danger" style={{ display: 'block', marginBottom: 16 }}>
            Ma&apos;lumotlarni yuklashda xatolik yuz berdi.
          </Text>
        )}

        <Table
          dataSource={rows.map((r, i) => ({ ...r, key: i }))}
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

export default VehicleStats;
