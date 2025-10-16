import { Navigate, Route, Routes } from 'react-router-dom'
import { ConfigProvider, Layout, Spin } from 'antd'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminPage from './pages/AdminPage'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/Layout/DashboardLayout'
import { useAuth } from './context/AuthContext'
import OAuthCallbackPage from './pages/OAuthCallbackPage'
import {
  HomePage,
  DiscoverPage,
  LibraryPage,
  TemplatesPage,
  DatabasePage,
  BatchesPage,
  ChainsPage
} from './pages/dashboard'

const { Content } = Layout

export default function App() {
  const { user, isLoading } = useAuth()

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
      <Routes>
        <Route path="/" element={!user ? <Navigate to="/login" replace /> : <Navigate to="/dashboard" replace />} />
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<HomePage />} />
          <Route path="discover" element={<DiscoverPage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="database" element={<DatabasePage />} />
          <Route path="batches" element={<BatchesPage />} />
          <Route path="chains" element={<ChainsPage />} />
        </Route>

        <Route path="/admin" element={
          <ProtectedRoute requiredRoles={['admin']}>
            <AdminPage />
          </ProtectedRoute>
        } />
      </Routes>
    </ConfigProvider>
  )
}