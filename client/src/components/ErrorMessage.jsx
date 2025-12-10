
export default function ErrorMessage({ children, onDismiss }) {
  if (!children) return null
  return (
    <div
      style={{
        marginTop: 8,
        padding: '8px 12px',
        borderRadius: 4,
        backgroundColor: '#ffe5e5',
        color: '#b00020',
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      }}
    >
      <span>{children}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          style={{
            border: 'none',
            background: 'transparent',
            color: '#b00020',
            fontSize: 16,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}
