import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Select,
  InputNumber,
  Switch,
  Space,
  Typography,
  Upload,
  message,
  Divider,
} from 'antd'
import { PlusOutlined, SendOutlined, SaveOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { useMutation } from '@tanstack/react-query'
import api from '../../services/api'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`

const AdsCreate = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [mediaFiles, setMediaFiles] = useState<any[]>([])
  const [selectedAds, setSelectedAds] = useState<string[]>([])

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/ads', data)
      return response.data
    },
    onSuccess: (data) => {
      message.success('E\'lon yaratildi!')
      navigate(`/ads/${data.id}/edit`)
    },
  })

  const handleSubmit = async (values: any) => {
    const formData = {
      ...values,
      status: 'DRAFT',
    }

    if (selectedAds.length > 0) {
      formData.combineWithAds = selectedAds
    }

    createMutation.mutate(formData)
  }

  const uploadProps = {
    multiple: true,
    fileList: mediaFiles,
    onChange: ({ fileList }: { fileList: any[] }) => {
      setMediaFiles(fileList)
    },
    beforeUpload: () => false,
    listType: 'picture-card' as const,
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        Yangi E\'lon Yaratish
      </Title>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <StyledCard title="Asosiy Ma\'lumotlar">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                currency: 'UZS',
                negotiable: false,
                brandAdEnabled: false,
                intervalMin: 300,
                intervalMax: 900,
                groupInterval: 3,
              }}
            >
              <Form.Item
                label="Sarlavha"
                name="title"
                rules={[
                  { required: true, message: 'Sarlavha kiriting!' },
                  { min: 5, message: 'Kamida 5 ta belgi!' },
                ]}
              >
                <Input placeholder="Masalan: iPhone 15 Pro 256GB" size="large" />
              </Form.Item>

              <Form.Item label="Qisqacha Tavsif" name="description">
                <TextArea
                  rows={4}
                  placeholder="Mahsulot haqida qo\'shimcha ma\'lumot..."
                />
              </Form.Item>

              <Form.Item
                label="E\'lon Matni"
                name="content"
                rules={[
                  { required: true, message: 'E\'lon matnini kiriting!' },
                  { min: 20, message: 'Kamida 20 ta belgi!' },
                ]}
              >
                <TextArea
                  rows={8}
                  placeholder="E\'loningiz asosiy matni..."
                  showCount
                  maxLength={5000}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Narx" name="price">
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="1000000"
                      size="large"
                      formatter={(value) => {
                        if (!value) return '';
                        return `${value}`.replace(/\B(?=(\d{3})+(?=\d))/g, ' ');
                      }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item label="Valyuta" name="currency">
                    <Select size="large">
                      <Option value="UZS">UZS</Option>
                      <Option value="USD">USD</Option>
                      <Option value="RUB">RUB</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Soni" name="totalQuantity">
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="10"
                      size="large"
                      min={1}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item label="Kelishuvchan" name="negotiable" valuePropName="checked">
                    <Switch checkedChildren="Ha / Yo\'q" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider>Media Fayllar</Divider>

              <Form.Item label="Rasmlar/Videolar" name="mediaUrls">
                <Upload {...uploadProps}>
                  {mediaFiles.length < 5 && (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Yuklash</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>

              <Form.Item label="Media Turi" name="mediaType">
                <Select size="large">
                  <Option value="TEXT">Matn</Option>
                  <Option value="PHOTO">Rasm</Option>
                  <Option value="VIDEO">Video</Option>
                  <Option value="DOCUMENT">Hujjat</Option>
                  <Option value="ALBUM">Albom</Option>
                </Select>
              </Form.Item>
            </Form>
          </StyledCard>
        </Col>

        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <StyledCard title="Tarqatish Sozlamalari">
              <Form form={form} layout="vertical">
                <Form.Item
                  label="Min Interval (daqiqa)"
                  name="intervalMin"
                  tooltip="Guruhlar orasidagi qisqa vaqti"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={300}
                    max={3600}
                    addonAfter="daqiqa"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label="Max Interval (daqiqa)"
                  name="intervalMax"
                  tooltip="Guruhlar orasidagi maksimal vaqti"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={300}
                    max={3600}
                    addonAfter="daqiqa"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label="Guruhlar Orasida (soniya)"
                  name="groupInterval"
                  tooltip="Guruhlar orasidagi vaqt"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0.5}
                    max={5}
                    step={0.5}
                    addonAfter="soniya"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label="Faxol Guruhlar"
                  name="selectedGroups"
                  tooltip="Guruhlarni tanlang"
                >
                  <Select
                    mode="multiple"
                    placeholder="Guruhlar tanlang..."
                    showSearch
                    filterOption={(input, option) =>
                      String(option?.label || '').toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    <Option value="group1">Guruh 1 (500+ a\'zo)</Option>
                    <Option value="group2">Guruh 2 (300+ a\'zo)</Option>
                    <Option value="group3">Guruh 3 (200+ a\'zo)</Option>
                  </Select>
                </Form.Item>
              </Form>
            </StyledCard>

            <StyledCard title="Brand Reklama">
              <Form form={form} layout="vertical">
                <Form.Item
                  label="Brand Reklama"
                  name="brandAdEnabled"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Yoqilish / O\'chirish" />
                </Form.Item>

                <Form.Item
                  label="Brand Matni"
                  name="brandAdText"
                  tooltip="Har bir e\'longa qo\'shiladigan reklamangiz"
                >
                  <TextArea
                    rows={4}
                    placeholder="Bizning telegram botimiz orqali: @reklama_bot"
                    disabled={!form.getFieldValue('brandAdEnabled')}
                  />
                </Form.Item>
              </Form>
            </StyledCard>

            <StyledCard title="Boshqa E\'lonlar Bilan Birlashtirish">
              <Form form={form} layout="vertical">
                <Form.Item
                  label="E\'lonlarni Tanlang"
                  name="combineWithAds"
                  tooltip="Bir nechta e\'lonni bitta xabarga yig\'ish"
                >
                  <Select
                    mode="multiple"
                    placeholder="E\'lonlar tanlang..."
                    showSearch
                    value={selectedAds}
                    onChange={setSelectedAds}
                  >
                    <Option value="ad1">iPhone 14 Pro</Option>
                    <Option value="ad2">Samsung Galaxy S24</Option>
                    <Option value="ad3">MacBook Pro 16"</Option>
                  </Select>
                </Form.Item>

                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">
                    E\'lonlar orasiga 3 qator bo\'shliq qo\'yiladi.
                    Har bir e\'lon alohida sarlavha bilan ko\'rsatiladi.
                  </Text>
                </div>
              </Form>
            </StyledCard>

            <StyledCard>
              <Space style={{ width: '100%' }} direction="vertical">
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  size="large"
                  block
                  onClick={() => form.submit()}
                  loading={createMutation.isPending}
                >
                  Qoralama Qilish
                </Button>

                <Button
                  icon={<SendOutlined />}
                  size="large"
                  type="default"
                  block
                  onClick={() => {
                    form.setFieldsValue({ status: 'ACTIVE' })
                    form.submit()
                  }}
                  loading={createMutation.isPending}
                >
                  Nashr Qilish
                </Button>

                <Button
                  size="large"
                  block
                  onClick={() => navigate('/ads')}
                >
                  Bekor Qilish
                </Button>
              </Space>
            </StyledCard>
          </Space>
        </Col>
      </Row>
    </div>
  )
}

export default AdsCreate
