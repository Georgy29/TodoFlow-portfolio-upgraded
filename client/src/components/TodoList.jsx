// client/src/components/TodoList.jsx
export default function TodoList({ items, onToggle, onRemove, emptyText }) {
  if (!items.length) {
    return <p className="todo-empty">{emptyText ?? 'No tasks'}</p>
  }

  return (
    <ul className="todo-list">
      {items.map(t => (
        <li key={t.id} className="todo-item">
          <input type="checkbox" checked={t.done} onChange={() => onToggle(t.id)} />
          <span className={t.done ? 'todo-title todo-title--done' : 'todo-title'}>{t.title}</span>
          <button onClick={() => onRemove(t.id)} className="btn-danger">
            Delete
          </button>
        </li>
      ))}
    </ul>
  )
}
