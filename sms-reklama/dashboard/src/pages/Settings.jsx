import { useEffect, useState } from 'react'
import { Card, Input, Button, Form, message, InputNumber, Switch, Divider, Typography } from 'antd'
import api from '../api'

const { Text } = Typography

export default function Settings() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const load = () => api.get('/config').then(({ data }) => form.setFieldsValue(data)).catch(() => {})
  useEffect(() => { load() }, [])

  const save = async (vals) => {
    setLoading(true)
    try {
      await api.post('/config', vals)
      message.success('✓ Saqlandi')
    } catch (e) { message.error('Xato') } finally { setLoading(false) }
  }

  return (
    <Card title="⚙️ Sozlamalar" style={{ maxWidth: 680 }}>
      <Form form={form} layout="vertical" onFinish={save}>
        <Form.Item
          label="Avto-yuborish (ON/OFF)"
          name="sms_auto_send"
          valuePropName="checked"
          extra="Yoniq qilingach — FAQAT shu vaqtdan keyin yangi yig'iladigan raqamlarga avtomatik SMS yuboradi (eski/oldin yig'ilgan raqamlarga TEGMAYDI). O'chiq bo'lsa — yubormaydi. Eski raqamlarga yubormoqchi bo'lsangiz — 'SMS yuborish' sahifasidan qo'lda."
        >
          <Switch checkedChildren="YONIQ" unCheckedChildren="O'CHIQ" />
        </Form.Item>

        <Form.Item
          label="Bitta raqamga necha kunda 1 marta"
          name="sms_cooldown_days"
          extra="Masalan 3 — bir raqamga 3 kunda faqat 1 marta SMS ketadi. Shu muddat ichida qayta yuborilmaydi (unikal)."
        >
          <InputNumber min={1} max={365} addonAfter="kun" style={{ width: 200 }} />
        </Form.Item>

        <Divider />

        <Form.Item label="Reklama matni (SMS)" name="reklama_text">
          <Input.TextArea rows={3} placeholder="Assalomu alaykum! ..." showCount maxLength={480} />
        </Form.Item>

        <Form.Item
          label="SMS Gateway token (x-api-key)"
          name="sms_gateway_token"
          extra={<Text type="secondary">sk_... bilan boshlanadi. SMS Gateway panelidan olinadi.</Text>}
        >
          <Input.Password placeholder="sk_..." />
        </Form.Item>

        <Form.Item label="SMS Gateway URL" name="sms_gateway_url">
          <Input placeholder="http://localhost:3008" />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={loading}>Saqlash</Button>
      </Form>
    </Card>
  )
}
