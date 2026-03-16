import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const ACCESS_CODES = { 12: '3280', 14: '1973' }

// ── Positions measured from pixel analysis (% of 1600x1197) ─
// Blue box:   left=37.4% top=17% bot=34.8%  cx=60.2% cy=25.9%
// Purple box: left=23.4% right=37.2% top=17.1% bot=28.2%  cx=30.3%
//   דירה line: top=19%, קומה: top=22.6%, קוד: top=26.3%
// Bottom purple: left=52.6% right=1.6% top=89.6% bot=97.2% cx=75.5% cy=93.3%

export default function NavigationCard() {
  const [building, setBuilding] = useState('')
  const [aptNum, setAptNum] = useState('')
  const [aptData, setAptData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [scale, setScale] = useState(1)
  const cardRef = useRef()

  useEffect(() => {
    if (!aptData) return
    const obs = new ResizeObserver(entries => {
      setScale(entries[0].contentRect.width / 1600)
    })
    if (cardRef.current) obs.observe(cardRef.current)
    return () => obs.disconnect()
  }, [aptData])

  const lookup = async () => {
    if (!building || !aptNum.trim()) return
    setLoading(true); setError('')
    const { data } = await supabase
      .from('apartments').select('floor, apt, building')
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
        useCORS: true, scale: 2, backgroundColor: null, logging: false,
      })
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob)
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
        if (isMobile) {
          window.location.href = url
        } else {
          const link = document.createElement('a')
          link.download = `כניסה-עגנון-${building}-דירה-${aptNum}.png`
          link.href = url
          link.click()
        }
        setTimeout(() => URL.revokeObjectURL(url), 5000)
      }, 'image/png')
    } catch(e) { console.error(e) }
    setDownloading(false)
  }

  const b = parseInt(building)
  const code = ACCESS_CODES[b] || ''

  // font sizes in px at scale=1 (1600px wide)
  const fs = {
    buildingTitle: Math.round(48 * scale),  // "שי עגנון 12"
    purpleLine:    Math.round(26 * scale),  // דירה/קומה/קוד labels
    purpleVal:     Math.round(30 * scale),  // values
    parking:       Math.round(20 * scale),  // parking text
  }

  const txt = (top, left, text, fontSize, color = 'white', bold = true, align = 'center') => (
    <div style={{
      position: 'absolute',
      top: `${top}%`,
      left: `${left}%`,
      transform: 'translate(-50%, -50%)',
      fontSize: `${fontSize}px`,
      color,
      fontWeight: bold ? '800' : '500',
      fontFamily: "'Heebo', sans-serif",
      whiteSpace: 'nowrap',
      direction: 'rtl',
      textAlign: align,
      pointerEvents: 'none',
      lineHeight: 1.1,
    }}>{text}</div>
  )

  return (
    <section className="page-section">
      <div className="section-title">🗺️ כרטיס ניווט לאורחים</div>
      <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '20px', lineHeight: 1.7 }}>
        צור תמונת ניווט מותאמת אישית לשליחה לאורחים — עם מספר הדירה, הקומה וקוד הכניסה.
      </p>

      {/* Building selector */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', maxWidth: '460px' }}>
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

      {/* Apt input */}
      <div style={{ display: 'flex', gap: '10px', maxWidth: '460px', marginBottom: '8px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)', marginBottom: '5px' }}>מספר דירה</div>
          <input value={aptNum}
            onChange={e => { setAptNum(e.target.value.replace(/\D/g,'')); setAptData(null) }}
            onKeyDown={e => e.key === 'Enter' && lookup()}
            placeholder="למשל: 42" inputMode="numeric" maxLength={3}
            style={{ width: '100%', padding: '10px 13px', borderRadius: '10px',
              border: '1.5px solid var(--border)', fontSize: '14px',
              fontFamily: 'Heebo, sans-serif', background: '#fafaf8', boxSizing: 'border-box' }} />
        </div>
        <button onClick={lookup} disabled={!building || !aptNum || loading} style={{
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
          <div ref={cardRef} style={{ position: 'relative', width: '100%', lineHeight: 0 }}>
            <img src={`${import.meta.env.BASE_URL}nav-${building}.png`} alt="מפת ניווט"
              style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '12px' }}
            />

            {/* Blue box: שתי שורות — שי עגנון + קרית אונו */}
            <div style={{
              position: 'absolute',
              top: '23%', left: '45.9%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              fontFamily: "'Heebo', sans-serif",
              pointerEvents: 'none',
              direction: 'rtl',
              lineHeight: 1.2,
            }}>
              <div style={{ fontSize: `${fs.buildingTitle}px`, fontWeight: '800', color: 'white' }}>
                שי עגנון {b}
              </div>
              <div style={{ fontSize: `${Math.round(fs.buildingTitle * 0.55)}px`, fontWeight: '500', color: 'rgba(255,255,255,0.85)' }}>
                קריית אונו
              </div>
            </div>

            {/* Purple box lines */}
            {txt(19.0, 30.3, `דירה ${aptData.apt}`, fs.purpleLine, 'white', true)}
            {txt(22.6, 30.3, `קומה ${aptData.floor}`, fs.purpleLine, 'white', true)}
            {txt(26.3, 30.3, `קוד כניסה ${code}`, fs.purpleLine, 'white', true)}

            {/* Bottom purple box — two lines */}
            <div style={{
              position: 'absolute', top: '93%', left: '75.5%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center', fontFamily: "'Heebo', sans-serif",
              pointerEvents: 'none', direction: 'rtl', lineHeight: 1.25,
            }}>
              <div style={{ fontSize: `${fs.parking}px`, fontWeight: '800', color: 'white' }}>חניות אורחים 409–433</div>
              <div style={{ fontSize: `${fs.parking}px`, fontWeight: '800', color: 'white' }}>קומה מינוס 4 בחניון הבניין</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
            <button onClick={downloadPng} disabled={downloading} style={{
              background: '#1a7a3a', color: 'white', border: 'none',
              borderRadius: '10px', padding: '12px 28px',
              fontFamily: 'Heebo, sans-serif', fontWeight: '700', fontSize: '15px',
              cursor: downloading ? 'not-allowed' : 'pointer', opacity: downloading ? 0.7 : 1,
            }}>
              {downloading ? 'מכין...' : '📥 שמור תמונה'}
            </button>
            <button onClick={() => { setAptData(null); setAptNum('') }} style={{
              background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '12px 18px',
              fontFamily: 'Heebo, sans-serif', fontSize: '13px', cursor: 'pointer',
            }}>← חפש דירה אחרת</button>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7,
            background: '#f7f5f1', borderRadius: '10px', padding: '10px 14px' }}>
            📱 <strong>ממכשיר נייד:</strong> לחץ "שמור תמונה" — התמונה תיפתח בדפדפן. לחץ לחיצה ארוכה עליה ובחר <strong>"שמור תמונה"</strong> כדי להוסיף לאלבום.
          </div>
        </div>
      )}
    </section>
  )
}
