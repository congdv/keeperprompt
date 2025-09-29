import { Link, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import OAuthCallbackPage from './pages/OAuthCallbackPage'

export default function App() {
  const { user, roles, logout } = useAuth()

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <header className="flex justify-between items-center">
        <nav className="space-x-4">
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/admin">Admin</Link>
        </nav>
        <div className="space-x-2">
          {user ? (
            <>
              <span className="text-sm text-gray-600">{user.email} ({roles.join(', ') || 'no role'})</span>
              <button onClick={logout} className="text-sm underline">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm underline">Login</Link>
              <Link to="/register" className="text-sm underline">Register</Link>
            </>
          )}
        </div>
      </header>

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
    </div>
  )
}