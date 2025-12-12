export default function LoadingSpinner({ size = 24, label = null }) {
  return (
    <div className="spinner" role="status" aria-live="polite">
      <div className="spinner-circle" style={{ width: size, height: size }} />
      {label ? <span className="spinner-label">{label}</span> : null}
    </div>
  )
}
