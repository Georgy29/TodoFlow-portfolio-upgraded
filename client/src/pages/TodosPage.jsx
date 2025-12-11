import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../api'
import Navbar from '../components/Navbar'
import TodoList from '../components/TodoList'
import toast from 'react-hot-toast'
import ErrorMessage from '../components/ErrorMessage'

export default function TodosPage() {
  const [msg, setMsg] = useState('...')
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // all | active | done

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
    if (!title.trim()) return
    const res = await apiFetch('/api/todos', {
      method: 'POST',
      body: JSON.stringify({ title }),
    })
    if (!res.ok) {
      toast.error('Failed to add todo')
      return
    }
    const created = await res.json()
    setTodos(v => [...v, created])
    setTitle('')
    toast.success('Todo added')
  }

  const toggle = async id => {
    const r = await apiFetch(`/api/todos/${id}`, { method: 'PATCH' })
    if (!r.ok) {
      toast.error('Failed to toggle todo')
      return
    }
    const upd = await r.json()
    setTodos(v => v.map(t => (t.id === id ? upd : t)))
    toast.success('')
  }

  const remove = async id => {
    const r = await apiFetch(`/api/todos/${id}`, { method: 'DELETE' })
    if (!r.ok) {
      toast.error('Failed to delete todo')
      return
    }
    setTodos(v => v.filter(t => t.id !== id))
    toast.success('Todo deleted')
  }

  const computedTodos = useMemo(() => {
    if (filter === 'active') return todos.filter(t => !t.done)
    if (filter === 'done') return todos.filter(t => t.done)
    return todos
  }, [todos, filter])

  // бонус: отметить все как выполненные (клиентом по одному PATCH)
  const markAllDone = async () => {
    setError('')
    const pending = todos.filter(t => !t.done)

    const results = await Promise.allSettled(
      pending.map(t =>
        apiFetch(`/api/todos/${t.id}`, { method: 'PATCH' }).then(async r => {
          if (!r.ok) throw new Error(`HTTP ${r.status} for id ${t.id}`)
          return r.json() // обновлённый todo
        })
      )
    )

    // успешные обновления
    const updated = results.filter(r => r.status === 'fulfilled').map(r => r.value) // массив обновлённых todo

    // применяем только удачные
    setTodos(prev => prev.map(x => updated.find(u => u.id === x.id) || x))

    // если были провалы — покажем, сколько
    const failed = results.filter(r => r.status === 'rejected')
    if (failed.length) {
      setError(`Couldn't update: ${failed.length} из ${results.length}`)
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

          <button onClick={markAllDone} disabled={!activeCount}>
            Mark all done
          </button>

          {/* панель фильтров справа */}
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
          <button type="submit" disabled={!title.trim()} className="btn-primary">
            Add
          </button>
        </form>

        {loading && <p>Loading…</p>}
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
