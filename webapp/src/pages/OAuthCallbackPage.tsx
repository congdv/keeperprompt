import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spin, Typography } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import api from '../lib/axios'
import { useAuth } from '../context/AuthContext'

const { Title } = Typography

export default function OAuthCallbackPage() {
  const navigate = useNavigate()
  const { applySession } = useAuth()

  useEffect(() => {
    const run = async () => {
      try {
        // Backend set the refresh cookie; use it to get access token + user
        const r = await api.post('/auth/refresh')
        applySession({
          user: r.data.user,
          roles: r.data.roles ?? [],
          accessToken: r.data.access_token,
        })
        navigate('/dashboard', { replace: true })
      } catch {
        navigate('/login', { replace: true })
      }
    }
    run()
  }, [navigate, applySession])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      textAlign: 'center'
    }}>
      <Spin
        indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
        size="large"
      />
      <Title level={3} style={{ marginTop: 16, color: '#666' }}>
        Signing you in...
      </Title>
    </div>
  )
}