
export default function ErrorMessage({ children }) {
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
      }}
    >
      {children}
    </div>
  )
}
