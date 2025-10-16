import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Form } from 'antd'
import { EyeInvisibleOutlined, EyeOutlined, GoogleOutlined } from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'
import { theme } from '../styles/theme'
import {
  PageContainer,
  StyledCard,
  TitleContainer,
  StyledTitle,
  FormLabel,
  StyledInput,
  StyledPasswordInput,
  ErrorMessage,
  PrimaryButton,
  LinkContainer,
  StyledLink,
  StyledDivider,
  GoogleButton,
  Footer,
} from '../styles/global'

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
    <PageContainer>
      <StyledCard>
        <TitleContainer>
          <StyledTitle level={2}>
            Keeper Prompt
          </StyledTitle>
        </TitleContainer>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            label={<FormLabel>Email Address</FormLabel>}
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
            validateStatus={error ? 'error' : ''}
          >
            <StyledInput
              placeholder="Email Address"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={<FormLabel>Password</FormLabel>}
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
            validateStatus={error ? 'error' : ''}
            style={{ marginBottom: theme.spacing.sm }}
          >
            <StyledPasswordInput
              placeholder="Password"
              size="large"
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Form.Item style={{ marginBottom: theme.spacing.sm }}>
            <PrimaryButton
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Sign In
            </PrimaryButton>
          </Form.Item>

          <LinkContainer>
            <span style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.sm }}>
              Don't have an account?{' '}
            </span>
            <StyledLink
              onClick={(e) => {
                e.preventDefault()
                navigate('/register')
              }}
            >
              Register
            </StyledLink>
          </LinkContainer>
        </Form>

        <StyledDivider>OR</StyledDivider>

        <GoogleButton
          icon={<GoogleOutlined />}
          onClick={googleStart}
          block
          size="large"
        >
          Continue with Google
        </GoogleButton>

        <Footer>
          © 2025 keeperprompt.com
        </Footer>
      </StyledCard>
    </PageContainer>
  )
}