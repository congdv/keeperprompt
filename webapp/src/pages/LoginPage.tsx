import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Form, Input, Button, Alert, Typography, Space, Divider } from 'antd'
import { GoogleOutlined, UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'

const { Title } = Typography

export default function LoginPage() {
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation() as any
  const from = location.state?.from?.pathname || '/dashboard'

  const onFinish = async (values: { email: string; password: string }) => {
    setError(null)
    setLoading(true)
    try {
      await login(values.email, values.password)
      navigate(from, { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const googleStart = () => {
    const base = import.meta.env.VITE_API_BASE_URL
    window.location.href = `${base}/auth/google/start`
  }

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '2rem' }}>
      <Title level={2}>Login</Title>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        name="login"
        onFinish={onFinish}
        layout="vertical"
        size="large"
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' }
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Enter your email" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Enter your password" />
        </Form.Item>

        <Form.Item>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Login
            </Button>

            <Divider>OR</Divider>

            <Button
              icon={<GoogleOutlined />}
              onClick={googleStart}
              block
            >
              Continue with Google
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  )
}