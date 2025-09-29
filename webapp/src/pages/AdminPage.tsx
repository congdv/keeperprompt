import { useEffect, useState } from 'react'
import api from '../lib/axios'

export default function AdminPage() {
  const [msg, setMsg] = useState('Loading...')

  useEffect(() => {
    const run = async () => {
      try {
        const res = await api.get('/admin/secret')
        setMsg(res.data.message)
      } catch (e: any) {
        setMsg(e?.response?.data?.error ?? 'Access denied')
      }
    }
    run()
  }, [])

  return (
    <div>
      <h1 className="text-xl font-semibold mb-2">Admin</h1>
      <p>{msg}</p>
      <p className="text-sm text-gray-600 mt-2">
        To test, assign your user the "admin" role in DB:
        INSERT INTO user_roles (user_id, role_id)
        SELECT 'your-uuid', id FROM roles WHERE name='admin';
      </p>
    </div>
  )
}