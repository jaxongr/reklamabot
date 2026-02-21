import { Form, Input, Button, Card, Typography, message, Space } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { useAuthStore } from '../../stores/authStore'
import { useNavigate } from 'react-router-dom'

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
  max-width: 420px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`

const Login = () => {
  const navigate = useNavigate()
  const { adminLogin, isLoading } = useAuthStore()

  const handleSubmit = async (values: { username: string; password: string }) => {
    try {
      await adminLogin(values.username, values.password)
      message.success('Muvaffaqiyatli kirishdingiz!')
      navigate('/dashboard')
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Login yoki parol noto\'g\'ri')
    }
  }

  return (
    <StyledContainer>
      <StyledCard>
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 0 }}>
            Reklama Bot
          </Title>
          <Paragraph type="secondary">
            Admin panelga kirish
          </Paragraph>
        </Space>

        <Form
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
          initialValues={{ username: '', password: '' }}
        >
          <Form.Item
            label="Login"
            name="username"
            rules={[{ required: true, message: 'Login kiriting!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="admin"
            />
          </Form.Item>

          <Form.Item
            label="Parol"
            name="password"
            rules={[{ required: true, message: 'Parol kiriting!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Parolni kiriting"
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

        <div style={{ textAlign: 'center', marginTop: 8, padding: '12px', background: '#f5f5f5', borderRadius: 8 }}>
          <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 0 }}>
            Default: <strong>admin</strong> / <strong>admin123</strong>
          </Paragraph>
        </div>
      </StyledCard>
    </StyledContainer>
  )
}

export default Login
