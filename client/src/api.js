// Вместо того чтобы в каждом месте вручную писать fetch(...), мы создали обёртку apiFetch
/* 
Подставляет правильный базовый адрес API: в продакшене берёт из .env.production, а в dev-режиме использует http://localhost:5000.

Автоматически добавляет в каждый запрос заголовок Authorization: Bearer ..., если пользователь залогинен и токен сохранён в localStorage.

Ставит заголовок Content-Type: application/json для запросов с телом, чтобы сервер понял формат данных.

Даёт функции getToken и setToken для удобной работы с токеном (сохраняем при логине, очищаем при логауте).

👉 В результате фронт становится чище: вместо длинных fetch с повторяющимися настройками мы пишем короткие вызовы apiFetch('/api/todos'), и всё остальное происходит автоматически.

*/
const API_BASE = import.meta.env.PROD
  ? import.meta.env.VITE_API_BASE // прод: Render
  : '' // dev: ходим на /api -> прокси 1

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

  // Глобальный авто-логаут на 401
  if (res.status === 401) {
    setToken('')
    if (!location.pathname.startsWith('/login')) {
      window.location.assign('/login') // в api.js нельзя useNavigate
    }
  }
  return res
}
