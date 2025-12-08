import { Link, useNavigate } from 'react-router-dom'
import { getToken, setToken } from '../api'

export default function Navbar() {
  const navigate = useNavigate()
  const authed = !!getToken()

  const logout = () => {
    setToken('')
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
        <button onClick={logout} style={{ marginLeft: 'auto' }}>
          Logout
        </button>
      )}
    </nav>
  )
}
