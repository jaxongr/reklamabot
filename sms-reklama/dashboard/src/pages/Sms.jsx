import { useState } from 'react'
import { Card, InputNumber, Button, Alert, Space, message } from 'antd'
import { SendOutlined } from '@ant-design/icons'
import api from '../api'

export default function Sms() {
  const [count, setCount] = useState(50)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const send = async () => {
    setLoading(true); setResult(null)
    try {
      const { data } = await api.post('/sms/send', { count })
      if (data.started) {
        const base = `✅ Yuborildi: ${data.sent}, xato: ${data.failed}, tayyor qoldi: ${data.remaining}`
        if (data.limitReached) {
          setResult({ type: 'warning', msg: `${base}. ⚠️ Gateway kunlik limiti tugadi — ertaga davom etadi.` })
        } else {
          setResult({ type: 'success', msg: base })
        }
      } else {
        setResult({ type: 'warning', msg: `⚠️ ${data.reason}` })
      }
    } catch (e) {
      message.error(e.response?.data?.error || 'Xato')
    } finally { setLoading(false) }
  }

  return (
    <Card title="✉️ SMS reklama yuborish">
      <Space direction="vertical" size={16} style={{ width: '100%', maxWidth: 520 }}>
        <Alert
          type="info"
          showIcon
          message="Bu yer — qo'lda SMS jo'natish"
          description="Tugmani bossangiz, yig'ilgan raqamlardan yuborishga TAYYOR bo'lganlariga (cooldown vaqti kelganlarga) reklama SMS jo'natiladi. Har raqamga belgilangan kun ichida faqat 1 marta ketadi. Reklama matni va SMS Gateway tokeni — 'Sozlamalar' bo'limida. Avtomatik jo'natishni esa 'Boshqaruv' sahifasidagi YONIQ/O'CHIQ tugmasi bilan boshqarasiz."
        />
        <div>
          <div style={{ marginBottom: 6, color: '#00000073' }}>Shu safar nechta raqamga jo'natilsin</div>
          <InputNumber min={1} max={5000} value={count} onChange={setCount} style={{ width: 200 }} />
        </div>
        <Button type="primary" icon={<SendOutlined />} loading={loading} onClick={send}>Yuborish</Button>
        {result && <Alert type={result.type} showIcon message={result.msg} />}
      </Space>
    </Card>
  )
}
