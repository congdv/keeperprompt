import { useEffect, useState } from 'react'
import { Typography, Card, Spin, Alert } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import api from '../lib/axios'

const { Title, Paragraph } = Typography

export default function DashboardPage() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const run = async () => {
      try {
        const res = await api.get('/user/profile')
        setMessage(res.data.message)
      } catch {
        setMessage('Failed to load profile')
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  return (
    <div>
      <Title level={2}>
        <UserOutlined /> Dashboard
      </Title>

      <Card style={{ marginTop: 16 }}>
        {loading ? (
          <Spin size="large" style={{ display: 'block', textAlign: 'center', padding: '2rem' }} />
        ) : error ? (
          <Alert
            message="Error"
            description={message}
            type="error"
            showIcon
          />
        ) : (
          <Paragraph>{message}</Paragraph>
        )}
      </Card>
    </div>
  )
}