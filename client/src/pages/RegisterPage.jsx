import { useId, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, Link } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage'
import LoadingDots from '../components/LoadingDots'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })
  const navigate = useNavigate()
  const { register } = useAuth()

  const emailTrimmed = email.trim()
  const emailValid = !emailTrimmed || EMAIL_REGEX.test(emailTrimmed)

  const passwordValid =
    password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password)

  const showEmailError = touched.email && !emailValid
  const showPasswordError = touched.password && !passwordValid

  const emailErrorId = useId()
  const passwordErrorId = useId()

  const canSubmit = emailTrimmed && password && emailValid && passwordValid && !loading

  const onSubmit = async e => {
    e.preventDefault()
    setError('')
    setTouched({ email: true, password: true })
    if (!emailTrimmed || !password || !emailValid || !passwordValid) {
      toast.error('Please fix the form errors')
      return
    }
    setLoading(true)
    try {
      await register(emailTrimmed, password)
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
              onBlur={() => setTouched(v => ({ ...v, email: true }))}
              placeholder="Email"
              type="email"
              required
              aria-invalid={showEmailError ? 'true' : 'false'}
              aria-describedby={showEmailError ? emailErrorId : undefined}
              className={`input ${showEmailError ? 'input--error' : ''}`}
              autoComplete="username"
            />
            {showEmailError ? (
              <div className="field-error" id={emailErrorId}>
                Enter a valid email
              </div>
            ) : null}
          </label>
          <label className="form-label">
            Password
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              onBlur={() => setTouched(v => ({ ...v, password: true }))}
              placeholder="Password"
              type="password"
              required
              minLength={8}
              aria-invalid={showPasswordError ? 'true' : 'false'}
              aria-describedby={showPasswordError ? passwordErrorId : undefined}
              className={`input ${showPasswordError ? 'input--error' : ''}`}
              autoComplete="new-password"
            />
            {showPasswordError ? (
              <div className="field-error" id={passwordErrorId}>
                Use 8+ chars with a letter and number
              </div>
            ) : null}
          </label>
          <button type="submit" disabled={!canSubmit} className="btn-primary">
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
