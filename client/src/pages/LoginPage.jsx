import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { apiFetch, setToken } from "../api"
import Navbar from "../components/Navbar"
import LoginForm from "../components/LoginForm"

export default function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Функция, которую форма вызовет с { email, password }
  const handleLogin = async ({ email, password }) => {
    setError("")
    setLoading(true)
    try {
      const r = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`)

      setToken(data.token)
      navigate("/todos", { replace: true })
    } catch (err) {
      setError(String(err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 640, margin: "0 auto" }}>
        <h1>Sign in</h1>

        {/* Форма теперь — отдельный компонент */}
        <LoginForm onSubmit={handleLogin} loading={loading} error={error} />

        <p style={{ marginTop: 12 }}>
          No account? <Link to="/register">Click to register</Link>
        </p>
      </div>
    </>
  )
}
