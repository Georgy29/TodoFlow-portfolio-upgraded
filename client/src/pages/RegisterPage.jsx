import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiFetch, setToken } from '../api'
import Navbar from '../components/Navbar'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const r = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      const data = await r.json()
      if (!r.ok) {
        setError(data.error || 'Register failed')
        return
      }
      setToken(data.token)
      navigate('/todos', { replace: true })
    } catch (err) {
      setError(String(err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div
        style={{
          padding: 24,
          fontFamily: 'system-ui, sans-serif',
          maxWidth: 640,
          margin: '0 auto',
        }}
      >
        <h1>Register</h1>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}

        <form onSubmit={onSubmit} style={{ margin: '16px 0' }}>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            style={{ padding: 8, width: '70%' }}
            autoComplete="username"
          />
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            style={{ padding: 8, width: '70%', display: 'block', marginTop: 8 }}
            autoComplete="new-password"
          />
          <button
            type="submit"
            disabled={loading || !email || !password}
            style={{ padding: 8, marginTop: 8 }}
          >
            {loading ? 'Registering…' : 'Register'}
          </button>
        </form>

        <p>
          Already got an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </>
  )
}
