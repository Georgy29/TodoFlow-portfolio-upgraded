import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, Link } from 'react-router-dom'
import LoginForm from '../components/LoginForm'
import Navbar from '../components/Navbar'

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
      toast.success('Logged in successfully')
      navigate('/todos', { replace: true })
    } catch (err) {
      const msg = err?.message || 'Login failed'
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
        <h1 className="page-title">Sign in</h1>
        <LoginForm
          onSubmit={handleLogin}
          loading={loading}
          error={error}
          onClearError={() => setError('')}
        />

        <p className="page-subtle-link">
          No account?{' '}
          <Link to="/register" data-discover="true" data-cursor-element-id="cursor-el-5">
            Click to register
          </Link>
        </p>
      </div>
    </>
  )
}
