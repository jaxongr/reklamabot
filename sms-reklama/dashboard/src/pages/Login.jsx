import { useState } from 'react'
import { Card, Input, Button, Typography, message } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { login } from '../api'

export default function Login() {
  const [pw, setPw] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const submit = async () => {
    setLoading(true)
    try {
      await login(pw)
      nav('/')
    } catch (e) {
      message.error(e.response?.data?.error || 'Parol noto\'g\'ri')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <Card style={{ width: 360, boxShadow: '0 4px 16px #00000014' }}>
        <Typography.Title level={3} style={{ marginBottom: 4 }}>📡 SMS Reklama</Typography.Title>
        <Typography.Text type="secondary">Boshqaruv paneliga kirish</Typography.Text>
        <Input.Password
          size="large"
          prefix={<LockOutlined />}
          placeholder="Parol"
          style={{ marginTop: 20 }}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onPressEnter={submit}
        />
        <Button type="primary" size="large" block style={{ marginTop: 16 }} loading={loading} onClick={submit}>
          Kirish
        </Button>
      </Card>
    </div>
  )
}
