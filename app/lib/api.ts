export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000'

export const getToken = () => {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem('token')
}

export const getUser = () => {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem('user')
  return raw ? JSON.parse(raw) : null
}

export const setAuthStorage = (token: string, user: any) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem('token', token)
  window.localStorage.setItem('user', JSON.stringify(user))
}

export const clearAuthStorage = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem('token')
  window.localStorage.removeItem('user')
}

export const getAuthHeaders = () => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const authFetch = async (path: string, options: RequestInit = {}) => {
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  const authHeaders = getAuthHeaders()
  if (authHeaders.Authorization) {
    defaultHeaders.Authorization = authHeaders.Authorization
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {})
    }
  })

  return response
}

export const dispatchScanCompleted = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('scanCompleted'))
  }
}

export const dispatchAuthChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('authChanged'))
  }
}

export const addLocalScan = (scan: any) => {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem('scan_history') || '[]'
    const arr = JSON.parse(raw)
    arr.unshift(scan)
    // keep most recent 500
    window.localStorage.setItem('scan_history', JSON.stringify(arr.slice(0, 500)))
  } catch (e) {
    console.error('addLocalScan error', e)
  }
}

export const getLocalScans = () => {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(window.localStorage.getItem('scan_history') || '[]')
  } catch (e) {
    return []
  }
}
