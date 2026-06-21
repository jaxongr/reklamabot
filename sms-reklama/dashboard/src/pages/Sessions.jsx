import { useEffect, useState } from 'react'
import { Card, Table, Input, Button, Space, Tag, Popconfirm, message, Steps, Row, Col } from 'antd'
import api from '../api'

export default function Sessions() {
  const [list, setList] = useState([])
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [pw2fa, setPw2fa] = useState('')
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    try { const { data } = await api.get('/sessions'); setList(data) } catch (e) {}
  }
  useEffect(() => { load(); const t = setInterval(load, 8000); return () => clearInterval(t) }, [])

  const sendCode = async () => {
    if (!phone) return message.warning('Telefon raqamni kiriting')
    setLoading(true)
    try {
      await api.post('/sessions/send-code', { phone, name })
      setStep(1)
      message.success('Kod yuborildi — Telegram ilovangizdan oling')
    } catch (e) { message.error(e.response?.data?.error || 'Xato') } finally { setLoading(false) }
  }

  const verify = async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/sessions/verify', { phone, code, password: pw2fa })
      if (data.ok) {
        message.success('✅ Session ulandi!')
        setStep(0); setPhone(''); setName(''); setCode(''); setPw2fa('')
        load()
      } else if (data.needPassword) {
        message.warning('2FA parolni kiriting')
      }
    } catch (e) { message.error(e.response?.data?.error || 'Xato') } finally { setLoading(false) }
  }

  const del = async (id) => {
    try { await api.delete(`/sessions/${id}`); message.success('O\'chirildi'); load() } catch (e) {}
  }

  const columns = [
    { title: 'Telefon', dataIndex: 'phone' },
    { title: 'Nom', dataIndex: 'name' },
    { title: 'Guruhlar', dataIndex: 'total_groups' },
    { title: 'Holat', dataIndex: 'active', render: (a) => (a ? <Tag color="green">faol</Tag> : <Tag>o'chiq</Tag>) },
    {
      title: 'Amal', render: (_, r) => (
        <Popconfirm title="O'chirilsinmi?" onConfirm={() => del(r.id)} okText="Ha" cancelText="Yo'q">
          <Button danger size="small">O'chirish</Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card title="➕ Telegram session qo'shish (20 tagacha)">
        <Steps current={step} size="small" style={{ maxWidth: 400, marginBottom: 20 }}
          items={[{ title: 'Telefon' }, { title: 'Kod' }]} />
        {step === 0 ? (
          <Row gutter={12}>
            <Col xs={24} sm={10}><Input placeholder="+998901234567" value={phone} onChange={(e) => setPhone(e.target.value)} /></Col>
            <Col xs={24} sm={8}><Input placeholder="Nom (ixtiyoriy)" value={name} onChange={(e) => setName(e.target.value)} /></Col>
            <Col xs={24} sm={6}><Button type="primary" block loading={loading} onClick={sendCode}>Kod yuborish</Button></Col>
          </Row>
        ) : (
          <Row gutter={12}>
            <Col xs={24} sm={8}><Input placeholder="Telegram kodi" value={code} onChange={(e) => setCode(e.target.value)} /></Col>
            <Col xs={24} sm={8}><Input.Password placeholder="2FA parol (bo'lsa)" value={pw2fa} onChange={(e) => setPw2fa(e.target.value)} /></Col>
            <Col xs={12} sm={4}><Button type="primary" block loading={loading} onClick={verify}>Tasdiqlash</Button></Col>
            <Col xs={12} sm={4}><Button block onClick={() => setStep(0)}>Bekor</Button></Col>
          </Row>
        )}
      </Card>

      <Card title="Ulangan sessiyalar">
        <Table rowKey="id" columns={columns} dataSource={list} pagination={false} size="middle"
          locale={{ emptyText: 'Hali session yo\'q' }} />
      </Card>
    </Space>
  )
}
