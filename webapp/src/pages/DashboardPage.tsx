import { useEffect, useState } from 'react'
import api from '../lib/axios'

export default function DashboardPage() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    const run = async () => {
      try {
        const res = await api.get('/user/profile')
        setMessage(res.data.message)
      } catch {
        setMessage('Failed to load profile')
      }
    }
    run()
  }, [])

  return (
    <div>
      <h1 className="text-xl font-semibold mb-2">Dashboard</h1>
      <p>{message}</p>
    </div>
  )
}