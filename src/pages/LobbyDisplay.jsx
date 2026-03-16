import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase.js'

const REFRESH_INTERVAL = 5 * 60 * 1000

const HE_DAYS = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת']
const HE_MONTHS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']

// ── Clock ────────────────────────────────────────────────────
function Clock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const timeStr = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateStr = `יום ${HE_DAYS[now.getDay()]}, ${now.getDate()} ב${HE_MONTHS[now.getMonth()]} ${now.getFullYear()}`
  return (
    <div style={{ textAlign: 'center', color: 'white' }}>
      <div style={{
        fontSize: 'clamp(3.5rem, 7vw, 6rem)',
        fontFamily: "'Heebo', sans-serif", fontWeight: '900',
        lineHeight: 1, letterSpacing: '-2px',
        background: 'linear-gradient(135deg, #ffffff 0%, #a8d8f0 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0 0 30px rgba(168,216,240,0.4))',
      }}>{timeStr}</div>
      <div style={{
        fontSize: 'clamp(0.85rem, 1.5vw, 1.2rem)',
        fontFamily: "'Heebo', sans-serif", fontWeight: '400',
        color: 'rgba(255,255,255,0.65)', marginTop: '6px', letterSpacing: '0.5px',
      }}>{dateStr}</div>
    </div>
  )
}

// ── Media rotator — loads from Supabase ──────────────────────
function MediaRotator({ building }) {
  const [media, setMedia] = useState([])
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  const videoRef = useRef()
  const timerRef = useRef()

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('lobby_media')
        .select('*').eq('building', building).eq('active', true)
        .order('sort_order').order('created_at')
      setMedia(data || [])
      setIdx(0)
    }
    load()
    const t = setInterval(load, REFRESH_INTERVAL)
    return () => clearInterval(t)
  }, [building])

  const advance = () => {
    setVisible(false)
    setTimeout(() => {
      setIdx(i => (i + 1) % Math.max(media.length, 1))
      setVisible(true)
    }, 700)
  }

  useEffect(() => {
    clearTimeout(timerRef.current)
    if (!media.length) return
    const item = media[idx]
    if (item?.type === 'image') {
      timerRef.current = setTimeout(advance, (item.duration || 8) * 1000)
    }
    return () => clearTimeout(timerRef.current)
  }, [idx, media])

  if (!media.length) return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
      <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '1.2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🖼️</div>
        אין מדיה — הוסף מממשק הניהול
      </div>
    </div>
  )

  const item = media[idx]

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', borderRadius: '16px' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: visible ? 1 : 0, transition: 'opacity 0.7s ease' }}>
        {item.type === 'video' ? (
          <video
            ref={videoRef}
            key={item.file_url}
            src={item.file_url}
            autoPlay muted playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onEnded={advance}
            onError={advance}
          />
        ) : (
          <img
            key={item.file_url}
            src={item.file_url}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>

      {/* Dot indicator */}
      {media.length > 1 && (
        <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: '6px', zIndex: 2 }}>
          {media.map((_, i) => (
            <div key={i} style={{
              width: i === idx ? '20px' : '6px', height: '6px', borderRadius: '3px',
              background: i === idx ? 'white' : 'rgba(255,255,255,0.35)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>
      )}

      {/* Type badge */}
      {item.type === 'video' && (
        <div style={{ position: 'absolute', top: '14px', right: '14px',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
          borderRadius: '8px', padding: '4px 10px', fontSize: '11px',
          color: 'rgba(255,255,255,0.7)', fontFamily: 'Heebo, sans-serif' }}>
          ▶ וידאו
        </div>
      )}
    </div>
  )
}

// ── Notices panel ────────────────────────────────────────────
function NoticesPanel({ building }) {
  const [notices, setNotices] = useState([])
  const [noticeIdx, setNoticeIdx] = useState(0)
  const [fade, setFade] = useState(true)

  const load = async () => {
    const { data } = await supabase.from('notices')
      .select('*').eq('show_in_lobby', true)
      .in('building', [String(building), 'both'])
      .order('date', { ascending: false }).limit(8)
    setNotices(data || [])
  }

  useEffect(() => {
    load()
    const t = setInterval(load, REFRESH_INTERVAL)
    return () => clearInterval(t)
  }, [building])

  useEffect(() => {
    if (notices.length <= 1) return
    const t = setInterval(() => {
      setFade(false)
      setTimeout(() => { setNoticeIdx(i => (i + 1) % notices.length); setFade(true) }, 400)
    }, 12000)
    return () => clearInterval(t)
  }, [notices])

  if (notices.length === 0) return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.9rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📋</div>
        אין הודעות לתצוגה
      </div>
    </div>
  )

  const n = notices[noticeIdx]
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px',
        paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80',
          boxShadow: '0 0 10px #4ade80', animation: 'pulse 2s infinite' }} />
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: '700',
          letterSpacing: '2px', textTransform: 'uppercase' }}>הודעות ועד</span>
        {notices.length > 1 && (
          <span style={{ marginRight: 'auto', color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem' }}>
            {noticeIdx + 1} / {notices.length}
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, opacity: fade ? 1 : 0, transition: 'opacity 0.4s ease', overflow: 'hidden' }}>
        <div style={{ fontSize: 'clamp(1rem, 1.8vw, 1.35rem)', fontWeight: '700', color: 'white',
          lineHeight: 1.4, marginBottom: '14px' }}>{n.title}</div>
        <div style={{ fontSize: 'clamp(0.8rem, 1.2vw, 1rem)', color: 'rgba(255,255,255,0.7)',
          lineHeight: 1.9, whiteSpace: 'pre-line',
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 9, WebkitBoxOrient: 'vertical' }}>{n.text}</div>
        <div style={{ marginTop: '18px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '1px' }}>
          {n.date}
        </div>
      </div>

      {/* Progress dots */}
      {notices.length > 1 && (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '14px' }}>
          {notices.map((_, i) => (
            <div key={i} style={{
              width: i === noticeIdx ? '20px' : '6px', height: '5px', borderRadius: '3px',
              background: i === noticeIdx ? '#4ade80' : 'rgba(255,255,255,0.15)',
              transition: 'all 0.4s ease',
            }} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main LobbyDisplay ────────────────────────────────────────
export default function LobbyDisplay({ building = 12 }) {
  useEffect(() => {
    const t = setTimeout(() => window.location.reload(), REFRESH_INTERVAL)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#080c18',
      backgroundImage: `
        radial-gradient(ellipse at 15% 50%, rgba(27,58,92,0.45) 0%, transparent 55%),
        radial-gradient(ellipse at 85% 20%, rgba(27,92,58,0.2) 0%, transparent 50%)
      `,
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Heebo', sans-serif",
      overflow: 'hidden', position: 'relative',
      direction: 'rtl',
    }}>
      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      {/* ── HEADER ── */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 48px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0,
      }}>
        {/* Building ID */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '180px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #1B3A5C, #2563EB)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', boxShadow: '0 4px 20px rgba(37,99,235,0.3)',
          }}>🏢</div>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'white', lineHeight: 1 }}>
              שי עגנון {building}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: '3px', letterSpacing: '1px' }}>
              קריית אונו
            </div>
          </div>
        </div>

        {/* Clock — center */}
        <Clock />

        {/* Right placeholder */}
        <div style={{ minWidth: '180px', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{
            fontSize: '0.65rem', color: 'rgba(255,255,255,0.15)',
            letterSpacing: '2px', textTransform: 'uppercase', textAlign: 'left',
          }}>
            ועד בית<br />שי עגנון {building}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{
        flex: 1, zIndex: 1,
        display: 'grid', gridTemplateColumns: '2fr 1fr',
        gap: '16px', padding: '16px 48px 28px',
        minHeight: 0,
      }}>
        {/* Media */}
        <div style={{
          borderRadius: '16px', overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.05)',
          minHeight: 0,
        }}>
          <MediaRotator building={building} />
        </div>

        {/* Notices */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px', padding: '24px',
          backdropFilter: 'blur(12px)',
          overflow: 'hidden', minHeight: 0,
        }}>
          <NoticesPanel building={building} />
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </div>
  )
}
