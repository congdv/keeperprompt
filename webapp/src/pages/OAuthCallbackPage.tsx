import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import { useAuth } from '../context/AuthContext'

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

  return <div>Signing you in…</div>
}