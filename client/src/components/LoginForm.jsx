import { useId, useState } from 'react'
import ErrorMessage from './ErrorMessage'
import LoadingDots from './LoadingDots'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/


export default function LoginForm({
  onSubmit = () => {},
  loading = false,
  error = '',
  onClearError = () => {},
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({ email: false, password: false })

  const emailTrimmed = email.trim()
  const emailValid = !emailTrimmed || EMAIL_REGEX.test(emailTrimmed)
  const passwordValid = password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password)

  const showEmailError = touched.email && !emailValid
  const showPasswordError = touched.password && !passwordValid

  const emailErrorId = useId()
  const passwordErrorId = useId()

  const canSubmit = emailTrimmed && password && emailValid && passwordValid && !loading

  const handleSubmit = e => {
    e.preventDefault()
    setTouched({ email: true, password: true })
    if (!emailTrimmed || !password || !emailValid || !passwordValid) return
    onSubmit({ email: emailTrimmed, password })
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <label className="form-label">
        Email
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onBlur={() => setTouched(v => ({ ...v, email: true }))}
          required
          autoFocus
          autoComplete="username"
          aria-invalid={showEmailError ? 'true' : 'false'}
          aria-describedby={showEmailError ? emailErrorId : undefined}
          className={`input ${showEmailError ? 'input--error' : ''}`}
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
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onBlur={() => setTouched(v => ({ ...v, password: true }))}
          required
          minLength={8}
          autoComplete="current-password"
          aria-invalid={showPasswordError ? 'true' : 'false'}
          aria-describedby={showPasswordError ? passwordErrorId : undefined}
          className={`input ${showPasswordError ? 'input--error' : ''}`}
        />
        {showPasswordError ? (
          <div className="field-error" id={passwordErrorId}>
            Password must have 8+ characters with a letter and number
          </div>
        ) : null}
      </label>

      <ErrorMessage onDismiss={onClearError}>{error}</ErrorMessage>
      <button type="submit" disabled={!canSubmit} className="btn-primary">
        {loading ? <LoadingDots label="Logging in" /> : 'Log in'}
      </button>
    </form>
  )
}
