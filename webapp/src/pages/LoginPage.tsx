import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation() as any
  const from = location.state?.from?.pathname || '/dashboard'

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Login failed')
    }
  }

  const googleStart = () => {
    const base = import.meta.env.VITE_API_BASE_URL
    window.location.href = `${base}/auth/google/start`
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div className="flex items-center gap-2">
          <Button type="submit">Login</Button>
          <Button type="button" variant="outline" onClick={googleStart}>
            Continue with Google
          </Button>
        </div>
      </form>
    </div>
  )
}