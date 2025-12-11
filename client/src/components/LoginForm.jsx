import { useState } from 'react'
import ErrorMessage from './ErrorMessage'

export default function LoginForm({
  onSubmit = () => {},
  loading = false,
  error = '',
  onClearError = () => {},
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const canSubmit = email && password && !loading

  const handleSubmit = e => {
    e.preventDefault()
    onSubmit({ email: email.trim(), password })
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <label className="form-label">
        Email
        <input
          placeholder='Email'
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoFocus
          autoComplete="username"
          className="input"
        />
      </label>

      <label className="form-label">
        Password
        <input
          placeholder='Password'
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="input"
        />
      </label>

      <ErrorMessage onDismiss={onClearError}>{error}</ErrorMessage>

      <button type="submit" disabled={!canSubmit} className="btn-primary">
        {loading ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  )
}
