import { useState, useRef, useEffect } from 'react'
import { searchIndex } from '../data/searchIndex.js'

export default function SearchBox() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)
  const boxRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const search = (val) => {
    setQuery(val)
    if (!val.trim()) { setResults([]); setOpen(false); return }
    const q = val.toLowerCase()
    const found = searchIndex.filter(item =>
      item.text.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
    ).slice(0, 6)
    setResults(found)
    setOpen(found.length > 0)
  }

  const navigate = (tab) => {
    window.location.hash = tab
    setQuery('')
    setResults([])
    setOpen(false)
    inputRef.current?.blur()
  }

  const highlight = (text) => {
    if (!query) return text
    const idx = text.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <mark style={{ background: '#fff3b0', borderRadius: '3px', padding: '0 1px' }}>
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </>
    )
  }

  return (
    <div ref={boxRef} style={{ position: 'relative', maxWidth: '480px', margin: '0 auto 24px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'white',
        border: `2px solid ${focused ? 'var(--accent2)' : 'var(--border)'}`,
        borderRadius: '100px', padding: '10px 18px',
        boxShadow: focused ? '0 4px 20px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.2s',
      }}>
        <span style={{ fontSize: '16px', opacity: 0.5 }}>🔍</span>
        <input
          ref={inputRef}
          value={query}
          onChange={e => search(e.target.value)}
          onFocus={() => { setFocused(true); if (results.length) setOpen(true) }}
          onBlur={() => setFocused(false)}
          placeholder="חפשו בעל מקצוע, מידע, קוד כניסה..."
          style={{
            flex: 1, border: 'none', outline: 'none', fontSize: '14px',
            fontFamily: 'Heebo, sans-serif', background: 'transparent',
            color: 'var(--text)',
          }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); setOpen(false) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--muted)', padding: 0 }}>
            ✕
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, left: 0,
          background: 'white', borderRadius: '14px',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          zIndex: 100, overflow: 'hidden',
        }}>
          {results.map((r, i) => (
            <button
              key={i}
              onMouseDown={() => navigate(r.tab)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                width: '100%', padding: '11px 16px', border: 'none',
                background: 'transparent', cursor: 'pointer', textAlign: 'right',
                fontFamily: 'Heebo, sans-serif',
                borderBottom: i < results.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f7f5f1'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>
                  {highlight(r.text)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '1px' }}>
                  {highlight(r.desc)}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--accent2)', fontWeight: '600', flexShrink: 0 }}>
                עבור ←
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
