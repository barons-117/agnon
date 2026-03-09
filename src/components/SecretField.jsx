import { useState } from 'react'

export default function SecretField({ secret, dots = '••••••••', large = false }) {
  const [revealed, setRevealed] = useState(false)
  return (
    <span
      className="secret-field"
      onClick={() => setRevealed(r => !r)}
      style={large ? { fontSize: '32px', fontWeight: 800, letterSpacing: '3px', color: '#f5c97a' } : {}}
    >
      <span>{revealed ? secret : dots}</span>
      {!revealed && <span className="secret-hint">לחץ לחשיפה</span>}
    </span>
  )
}
