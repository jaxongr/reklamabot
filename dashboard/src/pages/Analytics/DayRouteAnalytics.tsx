import React from 'react';
import { Card, Spin, Typography, Tooltip } from 'antd';
import styled from 'styled-components';
import { useDayRouteAnalytics } from '../../hooks/useApi';
import type { DayRouteAnalytics as DayRouteData } from '../../types';

const { Title, Text } = Typography;

const PageWrapper = styled.div`
  padding: 24px;
`;

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow-x: auto;
`;

const HeatmapTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 4px;
  min-width: 600px;
`;

const HeaderCell = styled.th`
  padding: 8px 12px;
  font-weight: 600;
  font-size: 13px;
  color: #555;
  text-align: center;
  white-space: nowrap;
  background: #f5f7fa;
  border-radius: 6px;
`;

const RouteHeaderCell = styled.th`
  padding: 8px 12px;
  font-weight: 600;
  font-size: 13px;
  color: #333;
  text-align: left;
  white-space: nowrap;
  background: #f5f7fa;
  border-radius: 6px;
  min-width: 160px;
`;

const DataCell = styled.td<{ intensity: number }>`
  padding: 8px 6px;
  text-align: center;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: default;
  transition: transform 0.15s;
  background: ${({ intensity }) => {
    if (intensity === 0) return '#f9f9f9';
    const lightness = Math.round(95 - intensity * 45);
    return `hsl(130, 60%, ${lightness}%)`;
  }};
  color: ${({ intensity }) => (intensity > 0.55 ? '#fff' : '#333')};
  &:hover {
    transform: scale(1.08);
    z-index: 1;
    position: relative;
  }
`;

const RouteCell = styled.td`
  padding: 8px 12px;
  font-size: 13px;
  color: #333;
  white-space: nowrap;
  font-weight: 500;
`;

const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const LegendBox = styled.div<{ intensity: number }>`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: ${({ intensity }) => {
    if (intensity === 0) return '#f9f9f9';
    const lightness = Math.round(95 - intensity * 45);
    return `hsl(130, 60%, ${lightness}%)`;
  }};
  border: 1px solid #e0e0e0;
`;

const DAYS_UZ = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];

const DayRouteAnalytics: React.FC = () => {
  const { data, isLoading, error } = useDayRouteAnalytics();

  // data shape: { routes: string[], days: string[], data: Record<string, number[]> }
  const analyticsData = data as DayRouteData | undefined;

  const routes: string[] = analyticsData?.routes ?? [];
  const dayLabels: string[] = analyticsData?.days ?? DAYS_UZ;
  const cellData: Record<string, number[]> = analyticsData?.data ?? {};

  const allCounts = Object.values(cellData).flat();
  const maxCount = allCounts.length > 0 ? Math.max(...allCounts, 1) : 1;

  const getIntensity = (count: number): number => {
    if (!count || maxCount === 0) return 0;
    return Math.min(count / maxCount, 1);
  };

  return (
    <PageWrapper>
      <StyledCard
        title={
          <Title level={4} style={{ margin: 0 }}>
            Kun-yo&apos;nalish analitikasi
          </Title>
        }
      >
        <Legend>
          <Text type="secondary" style={{ fontSize: 12, marginRight: 4 }}>
            Zichlik:
          </Text>
          {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((v) => (
            <Tooltip key={v} title={v === 0 ? "Yo'q" : `${Math.round(v * 100)}%`}>
              <LegendBox intensity={v} />
            </Tooltip>
          ))}
          <Text type="secondary" style={{ fontSize: 12 }}>
            (past → yuqori)
          </Text>
        </Legend>

        {error && (
          <Text type="danger" style={{ display: 'block', marginBottom: 16 }}>
            Ma&apos;lumotlarni yuklashda xatolik yuz berdi.
          </Text>
        )}

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <Spin size="large" />
          </div>
        ) : routes.length === 0 ? (
          <Text type="secondary" style={{ display: 'block', textAlign: 'center', padding: '32px 0' }}>
            Ma&apos;lumot topilmadi
          </Text>
        ) : (
          <HeatmapTable>
            <thead>
              <tr>
                <RouteHeaderCell>Yo&apos;nalish</RouteHeaderCell>
                {dayLabels.map((d, i) => (
                  <HeaderCell key={i}>{d}</HeaderCell>
                ))}
              </tr>
            </thead>
            <tbody>
              {routes.map((route, ri) => {
                const counts: number[] = cellData[route] ?? Array(dayLabels.length).fill(0);
                return (
                  <tr key={ri}>
                    <RouteCell>{route}</RouteCell>
                    {counts.slice(0, dayLabels.length).map((count, di) => (
                      <Tooltip
                        key={di}
                        title={`${route} — ${dayLabels[di]}: ${count} ta buyurtma`}
                      >
                        <DataCell intensity={getIntensity(count)}>
                          {count > 0 ? count : ''}
                        </DataCell>
                      </Tooltip>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </HeatmapTable>
        )}
      </StyledCard>
    </PageWrapper>
  );
};

export default DayRouteAnalytics;
