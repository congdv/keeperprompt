import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'
import api from '../lib/axios'

type User = {
  id: string
  email: string
  created_at: string
  updated_at: string
}

type AuthState = {
  user: User | null
  roles: string[]
  accessToken: string | null
  isLoading: boolean
}

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  applySession: (data: { user: User, roles: string[], accessToken: string }) => void
}

let currentAuth: AuthState = { user: null, roles: [], accessToken: null, isLoading: true }

export function getAuth() {
  return currentAuth
}

export function setAuth(next: Partial<AuthState>) {
  currentAuth = { ...currentAuth, ...next }
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, roles: [], accessToken: null, isLoading: true })

  const sync = (next: Partial<AuthState>) => {
    setState((prev) => {
      const merged = { ...prev, ...next }
      currentAuth = merged
      return merged
    })
  }

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.post('/auth/refresh')
        sync({
          user: response.data.user,
          roles: response.data.roles ?? [],
          accessToken: response.data.access_token,
          isLoading: false,
        })
      } catch (error) {
        // No valid session, user needs to login
        sync({
          user: null,
          roles: [],
          accessToken: null,
          isLoading: false
        })
      }
    }

    checkSession()
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password })
    sync({
      user: res.data.user,
      roles: res.data.roles ?? [],
      accessToken: res.data.access_token,
      isLoading: false,
    })
  }

  const register = async (email: string, password: string) => {
    await api.post('/auth/register', { email, password })
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch { }
    sync({ user: null, roles: [], accessToken: null, isLoading: false })
  }

  const applySession = (data: { user: User, roles: string[], accessToken: string }) => {
    sync({ user: data.user, roles: data.roles, accessToken: data.accessToken, isLoading: false })
  }

  const value = useMemo<AuthContextValue>(() => ({
    ...state, login, register, logout, applySession
  }), [state])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}