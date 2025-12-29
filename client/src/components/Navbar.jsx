import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/logo.png'

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
      <Link to="/todos" className="navbar__brand" aria-label="TodoFlow home">
        <img className="navbar__logo" src={logo} alt="" aria-hidden="true" />
        <span>TodoFlow</span>
      </Link>
      {!authed ? (
        <div className="navbar__right">
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
        </div>
      ) : (
        <div className="navbar__right">
          <span className="navbar__user" title={user?.email || ''}>
            {user?.email || 'Signed in'}
          </span>
          <button onClick={handleLogout} className="navbar__button">
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}
