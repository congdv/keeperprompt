import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, message } from 'antd'
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

export default function RegisterPage() {
  const { register } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const onFinish = async (values: { email: string; password: string; confirmPassword: string }) => {
    setError(null)
    setLoading(true)
    try {
      await register(values.email, values.password)
      message.success('Account created successfully! Redirecting to login...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Registration failed')
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
            Create Account
          </StyledTitle>
        </TitleContainer>

        <Form
          name="register"
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
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 8, message: 'Password must be at least 8 characters!' }
            ]}
            validateStatus={error ? 'error' : ''}
          >
            <StyledPasswordInput
              placeholder="Password"
              size="large"
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item
            label={<FormLabel>Confirm Password</FormLabel>}
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Passwords do not match!'))
                },
              }),
            ]}
            validateStatus={error ? 'error' : ''}
            style={{ marginBottom: theme.spacing.sm }}
          >
            <StyledPasswordInput
              placeholder="Confirm Password"
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
              Create Account
            </PrimaryButton>
          </Form.Item>

          <LinkContainer>
            <span style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.sm }}>
              Already have an account?{' '}
            </span>
            <StyledLink
              onClick={(e) => {
                e.preventDefault()
                navigate('/login')
              }}
            >
              Sign In
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