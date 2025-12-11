export default function ErrorMessage({ children, onDismiss }) {
  if (!children) return null
  return (
    <div className="error-message">
      <span>{children}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="error-message__dismiss"
        >
          ×
        </button>
      )}
    </div>
  )
}
