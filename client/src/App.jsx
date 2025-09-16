import { useEffect, useState } from 'react'
import { apiFetch, setToken, getToken } from './api'

export default function App() {
  const [msg, setMsg] = useState('...')
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(!!getToken())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const ping = async () => {
    const res = await apiFetch('/api/ping')
    const t = await res.text()
    setMsg(t)
  }

  const loadTodos = async () => {
    setLoading(true); setError('')
    try {
      const r = await apiFetch('/api/todos')
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      setTodos(data)
    } catch (e) {
      setError(String(e.message))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authed) loadTodos()
  }, [authed])

  const addTodo = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    const res = await apiFetch('/api/todos', {
      method:'POST',
      body: JSON.stringify({ title })
    })
    if (!res.ok) return alert('Failed to add')
    const created = await res.json()
    setTodos(v => [...v, created])
    setTitle('')
  }

  const toggle = async (id) => {
    const r = await apiFetch(`/api/todos/${id}`, { method:'PATCH' })
    if (!r.ok) return alert('Failed to toggle')
    const upd = await r.json()
    setTodos(v => v.map(t => t.id === id ? upd : t))
  }

  const remove = async (id) => {
    const r = await apiFetch(`/api/todos/${id}`, { method:'DELETE' })
    if (!r.ok) return alert('Failed to delete')
    setTodos(v => v.filter(t => t.id !== id))
  }

  const register = async (e) => {
    e.preventDefault(); setError('')
    const r = await apiFetch('/api/auth/register', {
      method:'POST',
      body: JSON.stringify({ email, password })
    })
    const data = await r.json()
    if (!r.ok) { setError(data.error || 'Register failed'); return }
    setToken(data.token); setAuthed(true)
  }

  const login = async (e) => {
    e.preventDefault(); setError('')
    const r = await apiFetch('/api/auth/login', {
      method:'POST',
      body: JSON.stringify({ email, password })
    })
    const data = await r.json()
    if (!r.ok) { setError(data.error || 'Login failed'); return }
    setToken(data.token); setAuthed(true)
  }

  const logout = () => {
    setToken(''); setAuthed(false); setTodos([]); setEmail(''); setPassword('')
  }

  if (!authed) {
    return (
      <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', maxWidth: 640, margin: '0 auto' }}>
        <h1>Sign in</h1>
        {error && <p style={{color:'crimson'}}>{error}</p>}

        <form onSubmit={login} style={{ margin: '16px 0' }}>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" style={{ padding: 8, width:'70%' }} />
          <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" style={{ padding: 8, width:'70%', display:'block', marginTop:8 }} />
          <button type="submit" style={{ padding: 8, marginTop: 8 }}>Login</button>
        </form>

        <h3>or Register</h3>
        <form onSubmit={register} style={{ margin: '16px 0' }}>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" style={{ padding: 8, width:'70%' }} />
          <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" style={{ padding: 8, width:'70%', display:'block', marginTop:8 }} />
          <button type="submit" style={{ padding: 8, marginTop: 8 }}>Register</button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', maxWidth: 640, margin: '0 auto' }}>
      <h1>Mini Full-Stack (JWT)</h1>
      <div style={{display:'flex', gap:8, alignItems:'center'}}>
        <button onClick={ping}>Ping API</button>
        <p>Response: {msg}</p>
        <button onClick={logout} style={{ marginLeft: 'auto' }}>Logout</button>
      </div>

      <form onSubmit={addTodo} style={{ margin: '16px 0' }}>
        <input
          value={title}
          onChange={e=>setTitle(e.target.value)}
          placeholder="New todo..."
          style={{ padding: 8, width: '70%' }}
        />
        <button type="submit" style={{ padding: 8, marginLeft: 8 }}>Add</button>
      </form>

      {loading && <p>Loading…</p>}
      {error && <p style={{color:'crimson'}}>Error: {error}</p>}

      <ul style={{ listStyle:'none', padding:0 }}>
        {todos.map(t => (
          <li key={t.id} style={{ display:'flex', alignItems:'center', gap:8, borderBottom:'1px solid #eee', padding:'8px 0' }}>
            <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
            <span style={{ flex:1, textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</span>
            <button onClick={() => remove(t.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
