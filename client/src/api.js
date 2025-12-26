const API_BASE = import.meta.env.PROD
  ? import.meta.env.VITE_API_BASE // prod: Render
  : '' // dev: /api proxy

export function getToken() {
  return localStorage.getItem('token') || ''
}

export function setToken(token) {
  if (token) localStorage.setItem('token', token)
  else localStorage.removeItem('token')
}

export async function apiFetch(path, opts = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  const headers = { ...(opts.headers || {}) }

  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (opts.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json'

  const res = await fetch(url, { ...opts, headers })

  // Global auto logout
  if (res.status === 401) {
    setToken('')
    if (!location.pathname.startsWith('/login')) {
      window.location.assign('/login') // в api.js нельзя useNavigate
    }
  }
  return res
}
