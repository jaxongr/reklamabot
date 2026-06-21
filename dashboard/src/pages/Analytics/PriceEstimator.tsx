import React, { useState } from 'react';
import {
  Card,
  Input,
  Select,
  Button,
  Statistic,
  Space,
  Typography,
  Divider,
  Alert,
  Row,
  Col,
} from 'antd';
import { SearchOutlined, DollarOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { usePriceEstimate } from '../../hooks/useApi';
import type { PriceEstimate } from '../../types';

const { Title, Text } = Typography;
const { Option } = Select;

// dayjs is imported for potential date formatting of lastCalculated
void dayjs;

const PageWrapper = styled.div`
  padding: 24px;
`;

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  max-width: 760px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: flex-end;
  margin-bottom: 24px;
`;

const FieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 160px;
  flex: 1;
`;

const ResultsBox = styled.div`
  background: linear-gradient(135deg, #f0f7ff 0%, #f5fff5 100%);
  border-radius: 10px;
  padding: 24px;
  margin-top: 8px;
  border: 1px solid #d6e8ff;
`;

const SampleText = styled.div`
  text-align: center;
  color: #888;
  font-size: 13px;
  margin-top: 12px;
`;

const LastCalcText = styled.div`
  text-align: center;
  color: #aaa;
  font-size: 11px;
  margin-top: 4px;
`;

const VEHICLE_TYPES = [
  'Fura',
  'Kamaz',
  'MAN',
  'Volvo',
  'Scania',
  'DAF',
  'Mercedes',
  'HOWO',
  'Shacman',
  'Isuzu',
  'Gazel',
  'Porter',
  'Labo',
  'Damas',
  'Tentli',
  'Refrijerator',
  'Samosval',
  'Konteyner',
  'Boshqa',
];

const PriceEstimator: React.FC = () => {
  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');
  const [vehicleType, setVehicleType] = useState<string | undefined>(undefined);

  // Query params — only enabled after first submission
  const [queryFrom, setQueryFrom] = useState('');
  const [queryTo, setQueryTo] = useState('');
  const [queryVehicle, setQueryVehicle] = useState<string | undefined>(undefined);
  const [hasSearched, setHasSearched] = useState(false);

  const { data, isLoading, error } = usePriceEstimate({
    from: queryFrom,
    to: queryTo,
    vehicleType: queryVehicle,
  });

  const result = data as PriceEstimate | undefined;

  const handleSearch = () => {
    if (!fromInput.trim() || !toInput.trim()) return;
    setQueryFrom(fromInput.trim());
    setQueryTo(toInput.trim());
    setQueryVehicle(vehicleType);
    setHasSearched(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const isReady = !!queryFrom && !!queryTo;
  const hasResult = hasSearched && isReady && !isLoading && !error && result && result.sampleCount > 0;
  const noData = hasSearched && isReady && !isLoading && !error && (!result || result.sampleCount === 0);

  return (
    <PageWrapper>
      <StyledCard
        title={
          <Title level={4} style={{ margin: 0 }}>
            Narx taxmini
          </Title>
        }
      >
        <FormRow>
          <FieldWrapper>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Qayerdan
            </Text>
            <Input
              placeholder="Masalan: Toshkent"
              value={fromInput}
              onChange={(e) => setFromInput(e.target.value)}
              onKeyDown={handleKeyDown}
              size="large"
              allowClear
            />
          </FieldWrapper>

          <FieldWrapper>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Qayerga
            </Text>
            <Input
              placeholder="Masalan: Samarqand"
              value={toInput}
              onChange={(e) => setToInput(e.target.value)}
              onKeyDown={handleKeyDown}
              size="large"
              allowClear
            />
          </FieldWrapper>

          <FieldWrapper>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Mashina turi (ixtiyoriy)
            </Text>
            <Select
              placeholder="Barcha turlar"
              value={vehicleType}
              onChange={setVehicleType}
              size="large"
              allowClear
              style={{ width: '100%' }}
            >
              {VEHICLE_TYPES.map((t) => (
                <Option key={t} value={t}>
                  {t}
                </Option>
              ))}
            </Select>
          </FieldWrapper>

          <Button
            type="primary"
            icon={<SearchOutlined />}
            size="large"
            loading={isLoading}
            onClick={handleSearch}
            disabled={!fromInput.trim() || !toInput.trim()}
            style={{ minWidth: 120 }}
          >
            Hisoblash
          </Button>
        </FormRow>

        {error && (
          <Alert
            type="error"
            message="Xatolik"
            description="Narx ma'lumotlarini olishda xatolik yuz berdi."
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {noData && (
          <Alert
            type="info"
            message="Ma'lumot topilmadi"
            description={`${queryFrom} → ${queryTo} yo'nalishi bo'yicha narx ma'lumoti mavjud emas.`}
            showIcon
          />
        )}

        {hasResult && result && (
          <ResultsBox>
            <Space style={{ marginBottom: 16 }}>
              <DollarOutlined style={{ fontSize: 18, color: '#1677ff' }} />
              <Text strong style={{ fontSize: 15 }}>
                {result.fromCity || queryFrom} → {result.toCity || queryTo}
                {result.vehicleType ? ` (${result.vehicleType})` : ''}
              </Text>
            </Space>

            <Row gutter={[24, 16]}>
              <Col xs={24} sm={8}>
                <Statistic
                  title="O'rtacha narx"
                  value={result.avgPrice}
                  suffix="so'm"
                  valueStyle={{ color: '#1677ff', fontWeight: 700 }}
                  formatter={(val) => Number(val).toLocaleString('uz-UZ')}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Minimal narx"
                  value={result.minPrice}
                  suffix="so'm"
                  valueStyle={{ color: '#52c41a', fontWeight: 700 }}
                  formatter={(val) => Number(val).toLocaleString('uz-UZ')}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Maksimal narx"
                  value={result.maxPrice}
                  suffix="so'm"
                  valueStyle={{ color: '#fa8c16', fontWeight: 700 }}
                  formatter={(val) => Number(val).toLocaleString('uz-UZ')}
                />
              </Col>
            </Row>

            <Divider style={{ margin: '16px 0 8px' }} />
            <SampleText>
              Hisob-kitob {result.sampleCount} ta buyurtma asosida amalga oshirildi
            </SampleText>
            {result.lastCalculated && (
              <LastCalcText>
                Oxirgi yangilanish: {dayjs(result.lastCalculated).format('DD.MM.YYYY HH:mm')}
              </LastCalcText>
            )}
          </ResultsBox>
        )}
      </StyledCard>
    </PageWrapper>
  );
};

export default PriceEstimator;
