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


export default api