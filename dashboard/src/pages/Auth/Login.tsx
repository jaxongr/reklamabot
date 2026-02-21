import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Typography, message, Space } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { useAuthStore } from '../../stores/authStore'

const { Title, Paragraph } = Typography

const StyledContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
`

const StyledCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`

const Login = () => {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()
  const [telegramId, setTelegramId] = useState('')
  const [authData, setAuthData] = useState('')

  const handleSubmit = async (values: any) => {
    try {
      await login(values.telegramId, values.authData)
      message.success('Muvaffaqiyatli kirishdingiz!')
      navigate('/dashboard')
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Kirishda xatolik yuz berdi')
    }
  }

  return (
    <StyledContainer>
      <StyledCard>
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          <Title level={2} style={{ color: '#1890ff' }}>
            🤖 Reklama Bot
          </Title>
          <Paragraph type="secondary">
            Telegram orqali tizimga kirish
          </Paragraph>
        </Space>

        <Form
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            label="Telegram ID"
            name="telegramId"
            rules={[
              { required: true, message: 'Telegram ID kiriting!' },
              { pattern: /^[0-9]+$/, message: 'Faqat raqamlar!' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="123456789"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            label="Auth Data"
            name="authData"
            rules={[{ required: true, message: 'Auth data kiriting!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Telegram auth data"
              value={authData}
              onChange={(e) => setAuthData(e.target.value)}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
              size="large"
            >
              Kirish
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Paragraph type="secondary" style={{ fontSize: '12px' }}>
            Telegram orqali kirish uchun botimizga: <br />
            <a href="https://t.me/your_bot" target="_blank" rel="noopener">
              @reklama_bot
            </a>
          </Paragraph>
        </div>
      </StyledCard>
    </StyledContainer>
  )
}

export default Login
