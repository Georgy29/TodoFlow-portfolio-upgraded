export default function LoadingDots({ label = '' }) {
  return (
    <span className="loading-dots" role="status" aria-live="polite">
      {label}
      <span className="loading-dots__dots" aria-hidden="true">
        <span className="loading-dots__dot">.</span>
        <span className="loading-dots__dot">.</span>
        <span className="loading-dots__dot">.</span>
      </span>
    </span>
  )
}
