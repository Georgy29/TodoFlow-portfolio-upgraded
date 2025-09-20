import { useEffect, useLayoutEffect, useState } from "react"
import { apiFetch, setToken } from "../api"

export default function TodosPage() {
  const [msg, setMsg] = useState("...")
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const ping = async () => {
    const res = await apiFetch("/api/ping")
    const t = await res.text()
    setMsg(t)
  }

  const loadTodos = async () => {
    setLoading(true); setError("")
    try {
      const r = await apiFetch("/api/todos")
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      setTodos(data)
    } catch (e) {
      setError(String(e.message))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTodos() }, [])

  const addTodo = async (e) => {
    e.preventDefault() 
    if (!title.trim()) return
    const res = await apiFetch("/api/todos", {
      method: "POST",
      body: JSON.stringify({ title })
    })
    if (!res.ok) { alert("Failed to add"); return }
    const created = await res.json()
    setTodos(v => [...v, created])
    setTitle("")
  }

  const toggle = async (id) => {
    const r = await apiFetch(`/api/todos/${id}`, { method: "PATCH" })
    if (!r.ok) { alert("Failed to toggle"); return }
    const upd = await r.json()
    setTodos(v => v.map(t => t.id === id ? upd : t))
  }

  const remove = async (id) => {
    const r = await apiFetch(`/api/todos/${id}`, { method: "DELETE" })
    if (!r.ok) { alert("Failed to delete"); return }
    setTodos(v => v.filter(t => t.id !== id))
  }

  // бонус: отметить все как выполненные (клиентом по одному PATCH)
  const markAllDone = async () => {
    setError("")
    const pending = todos.filter(t => !t.done)

    const results = await Promise.allSettled(
        pending.map(t =>
        apiFetch(`/api/todos/${t.id}`, { method: "PATCH" })
            .then(async r => {
            if (!r.ok) throw new Error(`HTTP ${r.status} for id ${t.id}`)
            return r.json() // обновлённый todo
            })
        )
    )

    // успешные обновления
    const updated = results
        .filter(r => r.status === "fulfilled")
        .map(r => r.value) // массив обновлённых todo

    // применяем только удачные
    setTodos(prev =>
        prev.map(x => updated.find(u => u.id === x.id) || x)
    )

    // если были провалы — покажем, сколько
    const failed = results.filter(r => r.status === "rejected")
    if (failed.length) {
        setError(`Couldn't update: ${failed.length} из ${results.length}`)
    }
    }

    const navigate = useNavigate();
      const logout = () => {
        setToken("")
        navigate("/login", { replace: true })
      }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 640, margin: "0 auto" }}>
      <h1>Mini Full-Stack (JWT)</h1>

      <div style={{display:"flex", gap:8, alignItems:"center"}}>
        <button onClick={ping}>Ping API</button>
        <p>Response: {msg}</p>
        <button onClick={markAllDone}>Mark all done</button>
        <button onClick={logout} style={{ marginLeft: "auto" }}>Logout</button>
      </div>

      <form onSubmit={addTodo} style={{ margin: "16px 0" }}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="New todo..."
          style={{ padding: 8, width: "70%" }}
        />
        <button type="submit" disabled={!title.trim()} style={{ padding: 8, marginLeft: 8 }}>
          Add
        </button>
      </form>

      {loading && <p>Loading…</p>}
      {error && <p style={{color:"crimson"}}>Error: {error}</p>}

      <ul style={{ listStyle:"none", padding:0 }}>
        {todos.map(t => (
          <li key={t.id} style={{ display:"flex", alignItems:"center", gap:8, borderBottom:"1px solid #eee", padding:"8px 0" }}>
            <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
            <span style={{ flex:1, textDecoration: t.done ? "line-through" : "none" }}>{t.title}</span>
            <button onClick={() => remove(t.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
