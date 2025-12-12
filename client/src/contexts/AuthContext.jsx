import { createContext, useContext, useEffect, useState } from 'react'
import { apiFetch, getToken, setToken } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Auto-load current user on mount if token exists
  useEffect(() => {
    let cancelled = false

    async function loadUser() {
      const token = getToken()
      if (!token) {
        if (!cancelled) setLoading(false)
        return
      }

      try {
        const res = await apiFetch('/api/me')
        if (!res.ok) {
          // token invalid/expired
          if (!cancelled) {
            setToken('')
            setUser(null)
          }
        } else {
          const data = await res.json()
          if (!cancelled) setUser(data.user)
        }
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadUser()
    return () => {
      cancelled = true
    }
  }, [])

  const login = async (email, password) => {
    const r = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) {
      throw new Error(data.error || `HTTP ${r.status}`)
    }
    if (!data.token || !data.user) {
      throw new Error('Invalid response from server')
    }
    setToken(data.token)
    setUser(data.user)
  }

  const register = async (email, password) => {
    const r = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) {
      throw new Error(data.error || 'Register failed')
    }
    if (!data.token || !data.user) {
      throw new Error('Invalid response from server')
    }
    setToken(data.token)
    setUser(data.user)
  }

  const logout = () => {
    setToken('')
    setUser(null)
  }

  const value = { user, loading, login, register, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>')
  }
  return ctx
}
