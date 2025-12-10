import { useState } from 'react'
import ErrorMessage from './ErrorMessage'

export default function LoginForm({ onSubmit = () => {}, loading = false, error = '' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const canSubmit = email && password && !loading

  const handleSubmit = e => {
    e.preventDefault()
    onSubmit({ email: email.trim(), password })
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 360 }}>
      <label style={{ display: 'block', marginBottom: 8 }}>
        Email
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoFocus
          autoComplete="username"
          style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
        />
      </label>

      <label style={{ display: 'block', marginBottom: 8 }}>
        Password
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
        />
      </label>

      <ErrorMessage>{error}</ErrorMessage>

      <button type="submit" disabled={!canSubmit} style={{ padding: 8 }}>
        {loading ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  )
}
