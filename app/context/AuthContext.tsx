'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { clearAuthStorage, getToken, getUser, setAuthStorage } from '../lib/api'

type AuthState = {
  user: any
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  login: (user: any, token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
  login: () => {},
  logout: () => {}
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = getToken()
    const storedUser = getUser()
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(storedUser)
    }
    setLoading(false)

    const handleAuthChanged = () => {
      const updatedToken = getToken()
      const updatedUser = getUser()
      setToken(updatedToken)
      setUser(updatedUser)
    }

    const handleLogout = () => {
      clearAuthStorage()
      setToken(null)
      setUser(null)
      router.push('/dashboard')
    }

    window.addEventListener('authChanged', handleAuthChanged)
    window.addEventListener('logout', handleLogout)

    return () => {
      window.removeEventListener('authChanged', handleAuthChanged)
      window.removeEventListener('logout', handleLogout)
    }
  }, [router])

  const login = (userData: any, authToken: string) => {
    setAuthStorage(authToken, userData)
    setToken(authToken)
    setUser(userData)
    window.dispatchEvent(new Event('authChanged'))
  }

  const logout = () => {
    clearAuthStorage()
    setToken(null)
    setUser(null)
    router.push('/dashboard')
  }

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    logout
  }), [user, token, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
