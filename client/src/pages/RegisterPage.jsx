import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, Link } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage'
import LoadingDots from '../components/LoadingDots'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { register } = useAuth()

  const onSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(email, password)
      navigate('/todos', { replace: true })
      toast.success('Registered successfully')
    } catch (err) {
      const msg = err?.message || 'Registration failed'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="page">
        <h1 className="page-title">Register</h1>
        <ErrorMessage onDismiss={() => setError('')}>{error}</ErrorMessage>

        <form onSubmit={onSubmit} className="auth-form">
          <label className="form-label">
            Email
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              className="input"
              autoComplete="username"
            />
          </label>
          <label className="form-label">
            Password
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              className="input"
              autoComplete="new-password"
            />
          </label>
          <button type="submit" disabled={loading || !email || !password} className="btn-primary">
            {loading ? <LoadingDots label="Registering" /> : 'Register'}
          </button>
        </form>

        <p className="page-subtle-link">
          Already got an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </>
  )
}
