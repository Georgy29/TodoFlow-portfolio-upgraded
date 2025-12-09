import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import LoginForm from '../components/LoginForm'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async ({ email, password }) => {
    setError('')
    setLoading(true)
    try {
      await login(email, password)
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
        <h1>Sign in</h1>

        <LoginForm onSubmit={handleLogin} loading={loading} error={error} />

        <p style={{ marginTop: 12 }}>
          No account? <Link to="/register">Click to register</Link>
        </p>
      </div>
    </>
  )
}
