import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { ConfigProvider, Layout, Menu, Button, Space, Typography, Spin } from 'antd'
import { UserOutlined, LogoutOutlined, HomeOutlined, DashboardOutlined, SettingOutlined } from '@ant-design/icons'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import OAuthCallbackPage from './pages/OAuthCallbackPage'

const { Header, Content } = Layout
const { Text } = Typography

export default function App() {
  const { user, roles, logout, isLoading } = useAuth()

  if (isLoading) {
    return (
      <ConfigProvider>
        <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin size="large" />
        </Layout>
      </ConfigProvider>
    )
  }

  return (
    <ConfigProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Menu mode="horizontal" style={{ border: 'none', minWidth: 300 }}>
              <Menu.Item key="home" icon={<HomeOutlined />}>
                <Link to="/">Home</Link>
              </Menu.Item>
              <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
                <Link to="/dashboard">Dashboard</Link>
              </Menu.Item>
              <Menu.Item key="admin" icon={<SettingOutlined />}>
                <Link to="/admin">Admin</Link>
              </Menu.Item>
            </Menu>
          </div>
          <Space>
            {user ? (
              <Space>
                <Text type="secondary">
                  <UserOutlined /> {user.email} ({roles.join(', ') || 'no role'})
                </Text>
                <Button
                  type="text"
                  icon={<LogoutOutlined />}
                  onClick={logout}
                >
                  Logout
                </Button>
              </Space>
            ) : (
              <Space>
                <Link to="/login">
                  <Button type="link">Login</Button>
                </Link>
                <Link to="/register">
                  <Button type="link">Register</Button>
                </Link>
              </Space>
            )}
          </Space>
        </Header>

        <Content style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <Routes>
            <Route path="/" element={<div>Welcome! Try registering, logging in, or Google Sign-In.</div>} />
            <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
            <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requiredRoles={['admin']}>
                <AdminPage />
              </ProtectedRoute>
            } />
            <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
          </Routes>
        </Content>
      </Layout>
    </ConfigProvider>
  )
}