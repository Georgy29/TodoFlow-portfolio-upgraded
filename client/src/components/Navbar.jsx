import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const authed = !!user

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: '1px solid #eee',
      }}
    >
      <Link to="/todos">Todos</Link>
      {!authed ? (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      ) : (
        <button onClick={handleLogout} style={{ marginLeft: 'auto' }}>
          Logout
        </button>
      )}
    </nav>
  )
}
