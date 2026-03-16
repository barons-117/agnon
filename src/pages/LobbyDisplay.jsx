import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase.js'

// ── Media items: video + images from Supabase storage ──────
// You can add more images by uploading to the 'lobby' bucket
const LOBBY_MEDIA = {
  12: [
    { type: 'video', src: '/building.mp4' },          // replace with actual video
    { type: 'image', src: '/building.png', duration: 8000 },
    // add more images here
  ],
  14: [
    { type: 'video', src: '/building.mp4' },
    { type: 'image', src: '/building.png', duration: 8000 },
  ],
}

const REFRESH_INTERVAL = 5 * 60 * 1000   // refresh data every 5 min
const IMAGE_DURATION   = 8000            // 8 seconds per image
const VIDEO_FALLBACK   = 15000           // fallback if video has no duration

// ── Helpers ─────────────────────────────────────────────────
const HE_DAYS = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת']
const HE_MONTHS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']

function formatClock(d) {
  return d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
function formatDate(d) {
  return `יום ${HE_DAYS[d.getDay()]}, ${d.getDate()} ב${HE_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

// ── Clock component ──────────────────────────────────────────
function Clock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{ textAlign: 'center', color: 'white' }}>
      <div style={{
        fontSize: 'clamp(4rem, 8vw, 7rem)',
        fontFamily: "'Heebo', sans-serif",
        fontWeight: '900',
        lineHeight: 1,
        letterSpacing: '-2px',
        background: 'linear-gradient(135deg, #ffffff 0%, #a8d8f0 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0 0 30px rgba(168,216,240,0.4))',
      }}>
        {formatClock(now)}
      </div>
      <div style={{
        fontSize: 'clamp(1rem, 2vw, 1.5rem)',
        fontFamily: "'Heebo', sans-serif",
        fontWeight: '400',
        color: 'rgba(255,255,255,0.7)',
        marginTop: '8px',
        letterSpacing: '0.5px',
      }}>
        {formatDate(now)}
      </div>
    </div>
  )
}

// ── Media rotator ────────────────────────────────────────────
function MediaRotator({ building }) {
  const media = LOBBY_MEDIA[building] || LOBBY_MEDIA[12]
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  const videoRef = useRef()
  const timerRef = useRef()

  const advance = () => {
    setVisible(false)
    setTimeout(() => {
      setIdx(i => (i + 1) % media.length)
      setVisible(true)
    }, 600)
  }

  useEffect(() => {
    const item = media[idx]
    if (item.type === 'image') {
      timerRef.current = setTimeout(advance, item.duration || IMAGE_DURATION)
    }
    return () => clearTimeout(timerRef.current)
  }, [idx])

  const item = media[idx]

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', borderRadius: '16px' }}>
      <div style={{
        position: 'absolute', inset: 0,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease',
      }}>
        {item.type === 'video' ? (
          <video
            ref={videoRef}
            src={item.src}
            autoPlay muted playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onEnded={advance}
            onError={advance}
          />
        ) : (
          <img
            src={item.src}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>

      {/* Dot indicator */}
      <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
        {media.map((_, i) => (
          <div key={i} style={{
            width: i === idx ? '20px' : '6px', height: '6px',
            borderRadius: '3px', background: i === idx ? 'white' : 'rgba(255,255,255,0.4)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>
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
      .select('*')
      .eq('show_in_lobby', true)
      .in('building', [String(building), 'both'])
      .order('date', { ascending: false })
      .limit(8)
    setNotices(data || [])
  }

  useEffect(() => {
    load()
    const t = setInterval(load, REFRESH_INTERVAL)
    return () => clearInterval(t)
  }, [building])

  // rotate notices every 12 seconds
  useEffect(() => {
    if (notices.length <= 1) return
    const t = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setNoticeIdx(i => (i + 1) % notices.length)
        setFade(true)
      }, 400)
    }, 12000)
    return () => clearInterval(t)
  }, [notices])

  if (notices.length === 0) return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1rem', textAlign: 'center' }}>
        אין הודעות לתצוגה
      </div>
    </div>
  )

  const n = notices[noticeIdx]
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        marginBottom: '20px', paddingBottom: '16px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: '#4ade80',
          boxShadow: '0 0 10px #4ade80',
          animation: 'pulse 2s infinite',
        }} />
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase' }}>
          הודעות ועד
        </span>
        {notices.length > 1 && (
          <span style={{ marginRight: 'auto', color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
            {noticeIdx + 1}/{notices.length}
          </span>
        )}
      </div>

      {/* Notice content */}
      <div style={{ flex: 1, opacity: fade ? 1 : 0, transition: 'opacity 0.4s ease', overflow: 'hidden' }}>
        <div style={{
          fontSize: 'clamp(1rem, 1.8vw, 1.4rem)',
          fontWeight: '700', color: 'white', lineHeight: 1.4,
          marginBottom: '16px',
        }}>
          {n.title}
        </div>
        <div style={{
          fontSize: 'clamp(0.8rem, 1.3vw, 1.05rem)',
          color: 'rgba(255,255,255,0.75)',
          lineHeight: 1.8,
          whiteSpace: 'pre-line',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 10,
          WebkitBoxOrient: 'vertical',
        }}>
          {n.text}
        </div>
        <div style={{
          marginTop: '20px',
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: '1px',
        }}>
          {n.date}
        </div>
      </div>

      {/* Progress dots */}
      {notices.length > 1 && (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '16px' }}>
          {notices.map((_, i) => (
            <div key={i} style={{
              width: i === noticeIdx ? '20px' : '6px', height: '6px',
              borderRadius: '3px',
              background: i === noticeIdx ? '#4ade80' : 'rgba(255,255,255,0.2)',
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
  // Auto-refresh page every 5 min
  useEffect(() => {
    const t = setTimeout(() => window.location.reload(), REFRESH_INTERVAL)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#0a0e1a',
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(26,58,92,0.4) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(26,92,58,0.2) 0%, transparent 50%)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Heebo', sans-serif",
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Subtle grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        zIndex: 0,
      }} />

      {/* ── TOP HEADER ── */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '28px 48px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Building identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #1B3A5C, #2563EB)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px',
          }}>
            🏢
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'white', lineHeight: 1 }}>
              שי עגנון {building}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '3px', letterSpacing: '1px' }}>
              קריית אונו
            </div>
          </div>
        </div>

        {/* Clock — center */}
        <Clock />

        {/* Logo/space right */}
        <div style={{ width: '140px', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{
            fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)',
            letterSpacing: '2px', textTransform: 'uppercase',
            textAlign: 'right',
          }}>
            ועד בית<br/>שי עגנון {building}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{
        flex: 1, zIndex: 1,
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '20px',
        padding: '20px 48px 28px',
        minHeight: 0,
      }}>
        {/* Left 2/3 — media */}
        <div style={{
          borderRadius: '16px',
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <MediaRotator building={building} />
        </div>

        {/* Right 1/3 — notices */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '24px',
          backdropFilter: 'blur(10px)',
          overflow: 'hidden',
        }}>
          <NoticesPanel building={building} />
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  )
}
