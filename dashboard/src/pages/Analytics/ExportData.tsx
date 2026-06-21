import React, { useState } from 'react';
import {
  Card,
  Select,
  DatePicker,
  Button,
  Space,
  Typography,
  Alert,
  Tag,
  message as antMessage,
} from 'antd';
import { DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import dayjs, { Dayjs } from 'dayjs';
import { useExportData } from '../../hooks/useApi';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { Option } = Select;

// dayjs used for date formatting and disabledDate
void dayjs;

const PageWrapper = styled.div`
  padding: 24px;
`;

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  max-width: 640px;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FieldBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InfoBox = styled.div`
  background: #f5f7fa;
  border-radius: 8px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-left: 3px solid #1677ff;
`;

const ENTITIES = [
  { value: 'orders', label: 'Buyurtmalar', color: 'blue' },
  { value: 'drivers', label: 'Haydovchilar', color: 'green' },
  { value: 'offers', label: 'Takliflar', color: 'purple' },
  { value: 'payments', label: "To'lovlar", color: 'gold' },
] as const;

type EntityValue = (typeof ENTITIES)[number]['value'];

const ExportData: React.FC = () => {
  const [entity, setEntity] = useState<EntityValue>('orders');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);

  // useExportData is a mutation
  const { mutateAsync, isPending, error } = useExportData();

  const selectedEntity = ENTITIES.find((e) => e.value === entity);

  const handleExport = async () => {
    try {
      const params: { entity: string; dateFrom?: string; dateTo?: string } = { entity };
      if (dateRange[0]) params.dateFrom = dateRange[0].startOf('day').toISOString();
      if (dateRange[1]) params.dateTo = dateRange[1].endOf('day').toISOString();

      const result = await mutateAsync(params);

      if (!result) {
        antMessage.warning("Eksport qilish uchun ma'lumot topilmadi");
        return;
      }

      const jsonString = JSON.stringify(result, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const fromStr = dateRange[0] ? dateRange[0].format('YYYYMMDD') : 'all';
      const toStr = dateRange[1] ? dateRange[1].format('YYYYMMDD') : 'all';
      const filename = `${entity}_${fromStr}_${toStr}.json`;

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const count = Array.isArray(result) ? result.length : 1;
      antMessage.success(`${count} ta yozuv muvaffaqiyatli yuklandi`);
    } catch {
      antMessage.error("Eksport qilishda xatolik yuz berdi");
    }
  };

  return (
    <PageWrapper>
      <StyledCard
        title={
          <Title level={4} style={{ margin: 0 }}>
            Ma&apos;lumot eksport
          </Title>
        }
      >
        <FormSection>
          <FieldBlock>
            <Text strong>Ma&apos;lumot turi</Text>
            <Select
              value={entity}
              onChange={(val: EntityValue) => setEntity(val)}
              size="large"
              style={{ width: '100%' }}
            >
              {ENTITIES.map((e) => (
                <Option key={e.value} value={e.value}>
                  <Space>
                    <Tag color={e.color} style={{ margin: 0 }}>
                      {e.label}
                    </Tag>
                  </Space>
                </Option>
              ))}
            </Select>
          </FieldBlock>

          <FieldBlock>
            <Text strong>Sana oralig&apos;i (ixtiyoriy)</Text>
            <RangePicker
              value={dateRange}
              onChange={(vals) =>
                setDateRange(vals ? [vals[0], vals[1]] : [null, null])
              }
              format="DD.MM.YYYY"
              placeholder={['Boshlanish', 'Tugash']}
              size="large"
              allowClear
              style={{ width: '100%' }}
              disabledDate={(d) => d.isAfter(dayjs())}
            />
          </FieldBlock>

          <InfoBox>
            <FileTextOutlined style={{ fontSize: 20, color: '#1677ff' }} />
            <div>
              <Text strong>{selectedEntity?.label}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {dateRange[0] && dateRange[1]
                  ? `${dateRange[0].format("DD.MM.YYYY")} — ${dateRange[1].format("DD.MM.YYYY")} oralig'i`
                  : "Barcha vaqt oralig'i"}{' '}
                · JSON formatida yuklanadi
              </Text>
            </div>
          </InfoBox>

          {error && (
            <Alert
              type="error"
              message="Xatolik"
              description="Ma'lumotlarni yuklashda xatolik yuz berdi. Qayta urinib ko'ring."
              showIcon
            />
          )}

          <Button
            type="primary"
            icon={<DownloadOutlined />}
            size="large"
            loading={isPending}
            onClick={handleExport}
            style={{ width: '100%', height: 48, fontSize: 15, fontWeight: 600 }}
          >
            JSON yuklab olish
          </Button>
        </FormSection>
      </StyledCard>
    </PageWrapper>
  );
};

export default ExportData;
