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
    <nav className="navbar">
      <Link
        to="/todos"
        className="navbar__link"
        data-discover="true"
        data-cursor-element-id="cursor-el-3"
      >
        Todos
      </Link>
      {!authed ? (
        <>
          <Link
            to="/login"
            className="navbar__link"
            data-discover="true"
            data-cursor-element-id="cursor-el-4"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="navbar__link"
            data-discover="true"
            data-cursor-element-id="cursor-el-5"
          >
            Register
          </Link>
        </>
      ) : (
        <button onClick={handleLogout} className="navbar__button navbar__spacer">
          Logout
        </button>
      )}
    </nav>
  )
}
