import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

// קוד כניסה לפי בניין
const ACCESS_CODES = { 12: '3280', 14: '1973' }
// חניות אורחים
const GUEST_PARKING = '409 – 433 (קומת מינוס 4)'

// ── מימדי התמונה המקורית ───────────────────────────────────
const IMG_W = 1600, IMG_H = 1092

// ── מיקום הטקסט על התמונה (% מרוחב/גובה) ─────────────────
// Purple callout box:  X: 3%–35%, Y: 11%–27%
const POSITIONS = {
  buildingNum: { x: 58.5, y: 12.5, size: 5.2, color: 'white',  bold: true,  align: 'right' },
  apt:         { x: 33.5, y: 15.5, size: 3.2, color: 'white',  bold: true,  align: 'right' },
  floor:       { x: 33.5, y: 19.5, size: 3.2, color: 'white',  bold: true,  align: 'right' },
  code:        { x: 33.5, y: 23.5, size: 3.2, color: 'white',  bold: true,  align: 'right' },
  parking:     { x: 50,   y: 94,   size: 2.2, color: '#444',   bold: false, align: 'center' },
}

function TextOverlay({ pos, text, scale }) {
  if (!text) return null
  return (
    <div style={{
      position: 'absolute',
      right: `${pos.x}%`,
      top: `${pos.y}%`,
      fontSize: `${pos.size * scale}px`,
      color: pos.color,
      fontWeight: pos.bold ? '800' : '500',
      fontFamily: "'Heebo', sans-serif",
      whiteSpace: 'nowrap',
      lineHeight: 1,
      direction: 'rtl',
      textAlign: pos.align,
      pointerEvents: 'none',
      textShadow: pos.color === 'white' ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
    }}>
      {text}
    </div>
  )
}

export default function NavigationCard() {
  const [building, setBuilding] = useState('')
  const [aptNum, setAptNum] = useState('')
  const [aptData, setAptData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const cardRef = useRef()
  const [containerW, setContainerW] = useState(0)

  useEffect(() => {
    const update = () => {
      if (cardRef.current) setContainerW(cardRef.current.offsetWidth)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [aptData])

  const scale = containerW / IMG_W

  const lookup = async () => {
    if (!building || !aptNum.trim()) return
    setLoading(true); setError('')
    const { data } = await supabase
      .from('apartments')
      .select('floor, apt, building')
      .eq('building', parseInt(building))
      .eq('apt', parseInt(aptNum))
      .single()
    if (!data) { setError('דירה לא נמצאה'); setLoading(false); return }
    setAptData(data)
    setLoading(false)
  }

  const downloadPng = async () => {
    if (!aptData || !cardRef.current) return
    setDownloading(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: null,
      })
      const link = document.createElement('a')
      link.download = `כניסה-עגנון-${building}-דירה-${aptNum}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch(e) { console.error(e) }
    setDownloading(false)
  }

  const b = parseInt(building)
  const code = ACCESS_CODES[b] || ''

  return (
    <section className="page-section">
      <div className="section-title">🗺️ כרטיס ניווט לאורחים</div>
      <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '20px', lineHeight: 1.7 }}>
        צור תמונת ניווט מותאמת אישית לשליחה לאורחים — עם מספר הדירה, הקומה וקוד הכניסה.
      </p>

      {/* Form */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', maxWidth: '460px' }}>
        {[['12','שי עגנון 12'],['14','שי עגנון 14']].map(([val, lbl]) => (
          <button key={val} onClick={() => { setBuilding(val); setAptData(null) }} style={{
            flex: 1, padding: '11px', borderRadius: '10px',
            border: `2px solid ${building === val ? 'var(--primary)' : 'var(--border)'}`,
            background: building === val ? 'var(--primary)' : 'white',
            color: building === val ? 'white' : 'var(--text)',
            fontFamily: 'Heebo, sans-serif', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
          }}>{lbl}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', maxWidth: '460px', marginBottom: '8px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)', marginBottom: '5px' }}>מספר דירה</div>
          <input
            value={aptNum}
            onChange={e => { setAptNum(e.target.value.replace(/\D/g,'')); setAptData(null) }}
            onKeyDown={e => e.key === 'Enter' && lookup()}
            placeholder="למשל: 42" inputMode="numeric" maxLength={3}
            style={{ width: '100%', padding: '10px 13px', borderRadius: '10px',
              border: '1.5px solid var(--border)', fontSize: '14px',
              fontFamily: 'Heebo, sans-serif', background: '#fafaf8', boxSizing: 'border-box' }}
          />
        </div>
        <button onClick={lookup} disabled={!building || !aptNum || loading}
          style={{
            alignSelf: 'flex-end', padding: '10px 22px', borderRadius: '10px',
            background: !building || !aptNum ? '#ccc' : 'var(--primary)',
            color: 'white', border: 'none', fontFamily: 'Heebo, sans-serif',
            fontWeight: '700', fontSize: '14px', cursor: !building || !aptNum ? 'not-allowed' : 'pointer',
          }}>
          {loading ? 'טוען...' : 'הצג →'}
        </button>
      </div>
      {error && <div style={{ color: '#e05555', fontSize: '13px', marginBottom: '12px' }}>{error}</div>}

      {/* Card preview */}
      {aptData && (
        <div style={{ maxWidth: '700px', marginTop: '24px' }}>
          {/* Card with overlay */}
          <div ref={cardRef} style={{ position: 'relative', width: '100%', lineHeight: 0 }}>
            <img
              src={`/nav-${building}.png`}
              alt="מפת ניווט"
              style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '12px' }}
              onLoad={() => { if (cardRef.current) setContainerW(cardRef.current.offsetWidth) }}
            />

            {/* Building number after שי עגנון */}
            <TextOverlay pos={POSITIONS.buildingNum} text={String(b)} scale={scale} />

            {/* Apt */}
            <TextOverlay pos={POSITIONS.apt} text={String(aptData.apt)} scale={scale} />

            {/* Floor */}
            <TextOverlay pos={POSITIONS.floor} text={String(aptData.floor)} scale={scale} />

            {/* Code */}
            <TextOverlay pos={POSITIONS.code} text={code} scale={scale} />

            {/* Guest parking */}
            <TextOverlay pos={POSITIONS.parking}
              text={`חניות אורחים בקומת מינוס 4 — מספרי חניות: 409–433`}
              scale={scale} />
          </div>

          {/* Download button */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
            <button onClick={downloadPng} disabled={downloading} style={{
              background: '#1a7a3a', color: 'white', border: 'none',
              borderRadius: '10px', padding: '12px 28px',
              fontFamily: 'Heebo, sans-serif', fontWeight: '700', fontSize: '15px',
              cursor: downloading ? 'not-allowed' : 'pointer', opacity: downloading ? 0.7 : 1,
            }}>
              {downloading ? 'מכין...' : '📥 הורד תמונה'}
            </button>
            <button onClick={() => { setAptData(null); setAptNum('') }} style={{
              background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '12px 18px',
              fontFamily: 'Heebo, sans-serif', fontSize: '13px', cursor: 'pointer',
            }}>← חפש דירה אחרת</button>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            💡 ניתן לשתף את התמונה ישירות מהגלריה לאחר ההורדה
          </div>
        </div>
      )}
    </section>
  )
}
