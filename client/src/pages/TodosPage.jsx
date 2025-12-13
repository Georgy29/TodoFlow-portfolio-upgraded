import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { apiFetch } from '../api'
import ErrorMessage from '../components/ErrorMessage'
import LoadingDots from '../components/LoadingDots'
import LoadingSpinner from '../components/LoadingSpinner'
import Navbar from '../components/Navbar'
import TodoList from '../components/TodoList'

export default function TodosPage() {
  const [msg, setMsg] = useState('...')
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // all | active | done
  const [saving, setSaving] = useState(false)

  const activeCount = useMemo(() => todos.filter(t => !t.done).length, [todos])
  const doneCount = todos.length - activeCount

  const ping = async () => {
    const res = await apiFetch('/api/ping')
    const t = await res.text()
    setMsg(t)
  }

  const loadTodos = async () => {
    setLoading(true)
    setError('')
    try {
      const r = await apiFetch('/api/todos')
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      setTodos(data)
    } catch (e) {
      setError(String(e.message))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTodos()
  }, [])

  const addTodo = async e => {
    e.preventDefault()
    if (!title.trim() || saving) return
    setSaving(true)
    try {
      const res = await apiFetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify({ title }),
      })
      const created = await res.json()
      setTodos(v => [...v, created])
      setTitle('')
      toast.success('Todo added')
    } catch {
      toast.error('Failed to add todo')
      return
    } finally {
      setSaving(false)
    }
  }

  const toggle = async id => {
    if (saving) return
    setSaving(true)
    try {
      const r = await apiFetch(`/api/todos/${id}`, { method: 'PATCH' })
      if (!r.ok) throw new Error()
      const upd = await r.json()
      setTodos(v => v.map(t => (t.id === id ? upd : t)))
    } catch {
      toast.error('Failed to toggle todo')
    } finally {
      setSaving(false)
    }
  }

  const remove = async id => {
    if (saving) return
    setSaving(true)
    try {
      const r = await apiFetch(`/api/todos/${id}`, { method: 'DELETE' })
      if (!r.ok) throw new Error()
      setTodos(v => v.filter(t => t.id !== id))
      toast.success('Todo deleted')
    } catch {
      toast.error('Failed to delete todo')
    } finally {
      setSaving(false)
    }
  }

  const computedTodos = useMemo(() => {
    if (filter === 'active') return todos.filter(t => !t.done)
    if (filter === 'done') return todos.filter(t => t.done)
    return todos
  }, [todos, filter])

  // бонус: отметить все как выполненные (клиентом по одному PATCH)
  const markAllDone = async () => {
    if (saving) return
    setSaving(true)
    setError('')
    const pending = todos.filter(t => !t.done)

    try {
      const results = await Promise.allSettled(
        pending.map(t =>
          apiFetch(`/api/todos/${t.id}`, { method: 'PATCH' }).then(async r => {
            if (!r.ok) throw new Error(`HTTP ${r.status} for id ${t.id}`)
            return r.json()
          })
        )
      )

      const updated = results.filter(r => r.status === 'fulfilled').map(r => r.value)
      setTodos(prev => prev.map(x => updated.find(u => u.id === x.id) || x))

      const failed = results.filter(r => r.status === 'rejected')
      if (failed.length) {
        setError(`Couldn't update: ${failed.length} из ${results.length}`)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="page">
        <h1 className="page-title">Mini Full-Stack (JWT)</h1>

        <div className="todo-toolbar">
          <button onClick={ping}>Ping API</button>
          <p>Response: {msg}</p>

          <button onClick={markAllDone} disabled={!activeCount || saving}>
            {saving ? <LoadingDots label="Working" /> : 'Mark all done'}
          </button>

          <div className="todo-toolbar__filters">
            <button
              onClick={() => setFilter('all')}
              aria-pressed={filter === 'all'}
              className={filter === 'all' ? 'todo-filters__button--active' : ''}
            >
              All ({todos.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              aria-pressed={filter === 'active'}
              className={filter === 'active' ? 'todo-filters__button--active' : ''}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setFilter('done')}
              aria-pressed={filter === 'done'}
              className={filter === 'done' ? 'todo-filters__button--active' : ''}
            >
              Done ({doneCount})
            </button>
          </div>
        </div>

        <form onSubmit={addTodo} className="todo-input-row">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="New todo..."
            className="input"
          />
          <button type="submit" disabled={!title.trim() || saving} className="btn-primary">
            {saving ? <LoadingDots label="Adding" /> : 'Add'}
          </button>
        </form>

        {loading && <LoadingSpinner label="Loading todos" />}
        <ErrorMessage onDismiss={() => setError('')}>{error && `Error: ${error}`}</ErrorMessage>

        <TodoList
          items={computedTodos}
          onToggle={toggle}
          onRemove={remove}
          emptyText={
            filter === 'done'
              ? 'You have 0 completed tasks'
              : filter === 'active'
                ? 'All tasks are completed'
                : 'No tasks yet. Add your first task!'
          }
        />
      </div>
    </>
  )
}
