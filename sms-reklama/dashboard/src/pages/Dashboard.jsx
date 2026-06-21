import { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Alert, Switch, Space, Tag, message } from 'antd'
import { MobileOutlined, PhoneOutlined, CheckCircleOutlined, ClockCircleOutlined, SendOutlined, CloudOutlined } from '@ant-design/icons'
import api from '../api'

export default function Dashboard() {
  const [s, setS] = useState({ sessions: 0, activeSessions: 0, phones: 0, sent: 0, sentToday: 0, due: 0, auto: false, cooldownDays: 3 })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try { const { data } = await api.get('/stats'); setS(data) } catch (e) {}
  }
  useEffect(() => {
    load()
    const t = setInterval(load, 10000)
    return () => clearInterval(t)
  }, [])

  const toggleAuto = async (on) => {
    setSaving(true)
    setS((p) => ({ ...p, auto: on }))
    try {
      await api.post('/config', { sms_auto_send: on })
      message.success(on ? 'Avto-yuborish YONIQ' : 'Avto-yuborish O\'CHIQ')
    } catch (e) { message.error('Xato'); load() } finally { setSaving(false) }
  }

  const cards = [
    { t: 'Sessiyalar (faol/jami)', v: `${s.activeSessions ?? 0} / ${s.sessions}`, i: <MobileOutlined />, c: '#1890ff' },
    { t: 'Yig\'ilgan raqamlar', v: s.phones, i: <PhoneOutlined />, c: '#722ed1' },
    { t: 'SMS yuborilgan (jami)', v: s.sent, i: <CheckCircleOutlined />, c: '#16A34A' },
    { t: 'Bugun yuborilgan', v: s.sentToday ?? 0, i: <SendOutlined />, c: '#0ea5e9' },
    { t: 'Hozir yuborishga tayyor', v: s.due ?? 0, i: <ClockCircleOutlined />, c: '#F59E0B' },
    ...(s.gateway ? [{
      t: 'Gateway kunlik limit', v: s.gateway.unlimited ? `${s.gateway.used ?? 0} / ∞` : `${s.gateway.used ?? 0} / ${s.gateway.limit ?? '∞'}`,
      i: <CloudOutlined />, c: (s.gateway.unlimited || (s.gateway.remaining ?? 1) > 0) ? '#16A34A' : '#EF4444',
    }] : []),
  ]

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Space size={24} wrap align="center">
          <Space>
            <span style={{ fontWeight: 600 }}>Avto-yuborish:</span>
            <Switch checked={!!s.auto} loading={saving} onChange={toggleAuto}
              checkedChildren="YONIQ" unCheckedChildren="O'CHIQ" />
            <Tag color={s.auto ? 'green' : 'default'}>{s.auto ? 'YANGI raqamlarga ketmoqda' : 'To\'xtatilgan'}</Tag>
          </Space>
          {s.auto && (
            <Space>
              <span style={{ fontWeight: 600 }}>Yoqilgandan keyingi yangi:</span>
              <Tag color="processing">{s.dueAuto ?? 0} ta</Tag>
            </Space>
          )}
          <Space>
            <span style={{ fontWeight: 600 }}>Rejim:</span>
            <Tag color="blue">bitta raqamga {s.cooldownDays} kunda 1 marta</Tag>
          </Space>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        {cards.map((c, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card>
              <Statistic title={c.t} value={c.v} prefix={<span style={{ color: c.c }}>{c.i}</span>} valueStyle={{ color: c.c }} />
            </Card>
          </Col>
        ))}
      </Row>

      {s.gateway && !s.gateway.unlimited && (s.gateway.remaining ?? 1) <= 0 && (
        <Alert
          style={{ marginTop: 16 }}
          type="warning"
          showIcon
          message="Gateway kunlik limiti tugadi"
          description={`SMS Gateway shu kalit uchun kuniga ${s.gateway.limit} ta limit qo'ygan (bugun ${s.gateway.used} ta ketgan). Bu sms-reklama emas — GATEWAY sozlamasi. Ko'proq yuborish uchun Gateway panelida (http://13.140.185.38:8085) shu API-kalit limitini ko'taring. Limit yangilangach tizim avtomatik davom etadi.`}
        />
      )}
      <Alert
        style={{ marginTop: 24 }}
        type="info"
        showIcon
        message="Qanday ishlaydi"
        description={`Sessiyalar Telegram guruhlarini kuzatib telefon raqamlarini yig'adi (har raqam unikal — dublikat saqlanmaydi). Avto-yuborish YONIQ qilingach FAQAT shu vaqtdan keyingi yangi raqamlarga reklama ketadi (eskilariga tegmaydi). Har raqamga ${s.cooldownDays} kunda faqat 1 marta yuboriladi. Soatlik limit yo'q — gateway imkoni boricha ketaveradi. Eski raqamlarga yubormoqchi bo'lsangiz 'SMS yuborish' sahifasidan qo'lda jo'nating.`}
      />
    </div>
  )
}
