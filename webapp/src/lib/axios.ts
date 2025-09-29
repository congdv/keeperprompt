import axios from 'axios'
import { getAuth, setAuth } from '../context/AuthContext'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // allow sending/receiving cookies (refresh)
})

// Attach access token if present
api.interceptors.request.use((config) => {
  const { accessToken } = getAuth()
  if (accessToken) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// On 401, attempt refresh once
let isRefreshing = false
let pending: Array<() => void> = []

function subscribe(cb: () => void) {
  pending.push(cb)
}

function onRefreshed() {
  pending.forEach((cb) => cb())
  pending = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error
    if (!response) throw error
    if (response.status !== 401 || config.__isRetry) {
      throw error
    }

    if (isRefreshing) {
      await new Promise<void>((resolve) => subscribe(resolve))
      config.__isRetry = true
      return api(config)
    }

    isRefreshing = true
    try {
      const r = await api.post('/auth/refresh')
      const token = r.data?.access_token as string | undefined
      if (token) {
        setAuth({ accessToken: token, user: r.data.user, roles: r.data.roles })
      }
      onRefreshed()
      config.__isRetry = true
      return api(config)
    } catch (e) {
      onRefreshed()
      setAuth({ accessToken: null, user: null, roles: [] })
      throw e
    } finally {
      isRefreshing = false
    }
  }
)

export default api