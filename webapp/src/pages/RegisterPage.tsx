import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

export default function RegisterPage() {
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setOk(false)
    try {
      await register(email, password)
      setOk(true)
      setTimeout(() => navigate('/login'), 800)
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Register failed')
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Register</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        {ok && <div className="text-sm text-green-700">Registered! Redirecting to login…</div>}
        <Button type="submit">Create account</Button>
      </form>
    </div>
  )
}