import { useEffect, useState } from 'react'
import { Typography, Card, Spin, Alert } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import api from '../lib/axios'

const { Title, Paragraph, Text } = Typography

export default function AdminPage() {
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const run = async () => {
      try {
        const res = await api.get('/admin/secret')
        setMsg(res.data.message)
      } catch (e: any) {
        setMsg(e?.response?.data?.error ?? 'Access denied')
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
        <SettingOutlined /> Admin Panel
      </Title>

      <Card style={{ marginTop: 16 }}>
        {loading ? (
          <Spin size="large" style={{ display: 'block', textAlign: 'center', padding: '2rem' }} />
        ) : error ? (
          <Alert
            message="Access Denied"
            description={msg}
            type="error"
            showIcon
          />
        ) : (
          <Paragraph>{msg}</Paragraph>
        )}
      </Card>

      <Card title="Testing Instructions" style={{ marginTop: 16 }}>
        <Text type="secondary">
          To test admin access, assign your user the "admin" role in the database:
        </Text>
        <Paragraph code style={{ marginTop: 8 }}>
          INSERT INTO user_roles (user_id, role_id)<br />
          SELECT 'your-uuid', id FROM roles WHERE name='admin';
        </Paragraph>
      </Card>
    </div>
  )
}