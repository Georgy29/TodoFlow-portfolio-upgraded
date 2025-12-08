// client/src/components/TodoList.jsx
export default function TodoList({ items, onToggle, onRemove, emptyText }) {
  if (!items.length) {
    return <p style={{ color: '#666' }}>{emptyText ?? 'No tasks'}</p>
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {items.map(t => (
        <li
          key={t.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderBottom: '1px solid #eee',
            padding: '8px 0',
          }}
        >
          <input type="checkbox" checked={t.done} onChange={() => onToggle(t.id)} />
          <span
            style={{
              flex: 1,
              textDecoration: t.done ? 'line-through' : 'none',
            }}
          >
            {t.title}
          </span>
          <button onClick={() => onRemove(t.id)}>Delete</button>
        </li>
      ))}
    </ul>
  )
}
