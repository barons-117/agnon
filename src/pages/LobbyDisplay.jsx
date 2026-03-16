import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase.js'

const REFRESH_INTERVAL  = 5 * 60 * 1000
const NEWS_INTERVAL     = 30 * 60 * 1000   // refresh news every 30 min
const WEATHER_INTERVAL  = 15 * 60 * 1000
const TICKER_SPEED      = 80               // px/sec — higher = faster

// Kiriat Ono coords
const LAT = 32.0325, LON = 34.8575

const HE_DAYS   = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת']
const HE_MONTHS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']

const WMO_ICONS = {
  0:'☀️', 1:'🌤️', 2:'⛅', 3:'☁️',
  45:'🌫️', 48:'🌫️',
  51:'🌦️', 53:'🌦️', 55:'🌧️',
  61:'🌧️', 63:'🌧️', 65:'🌧️',
  71:'🌨️', 73:'🌨️', 75:'❄️',
  80:'🌦️', 81:'🌧️', 82:'⛈️',
  95:'⛈️', 96:'⛈️', 99:'⛈️',
}

// ── Clock (slim) ─────────────────────────────────────────────
function SlimClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const t = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
  const s = String(now.getSeconds()).padStart(2, '0')
  const d = `יום ${HE_DAYS[now.getDay()]} ${now.getDate()} ${HE_MONTHS[now.getMonth()]}`
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
      <span style={{ fontSize: '2.2rem', fontWeight: '800', color: '#1B3A5C', lineHeight: 1, letterSpacing: '-1px' }}>
        {t}
      </span>
      <span style={{ fontSize: '1rem', fontWeight: '600', color: '#94a3b8', lineHeight: 1 }}>{s}</span>
      <span style={{ fontSize: '0.85rem', color: '#64748b', marginRight: '4px' }}>{d}</span>
    </div>
  )
}

// ── Weather ──────────────────────────────────────────────────
function Weather() {
  const [data, setData] = useState(null)

  const load = async () => {
    try {
      const r = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
        `&current=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min` +
        `&timezone=Asia/Jerusalem&forecast_days=1`
      )
      const j = await r.json()
      setData({
        temp:    Math.round(j.current.temperature_2m),
        code:    j.current.weathercode,
        max:     Math.round(j.daily.temperature_2m_max[0]),
        min:     Math.round(j.daily.temperature_2m_min[0]),
      })
    } catch(e) { console.warn('weather', e) }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, WEATHER_INTERVAL)
    return () => clearInterval(t)
  }, [])

  if (!data) return null
  const icon = WMO_ICONS[data.code] || '🌡️'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      background: 'rgba(241,245,249,0.8)', borderRadius: '12px',
      padding: '8px 16px', border: '1px solid #e2e8f0',
    }}>
      <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{icon}</span>
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1B3A5C', lineHeight: 1 }}>
          {data.temp}°
        </div>
        <div style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.2 }}>
          ↑{data.max}° ↓{data.min}°
        </div>
      </div>
      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginRight: '4px', lineHeight: 1.4 }}>
        קריית<br/>אונו
      </div>
    </div>
  )
}

// ── News Ticker ──────────────────────────────────────────────
function NewsTicker() {
  const [headlines, setHeadlines] = useState([])
  const tickerRef = useRef()
  const animRef = useRef()

  const load = async () => {
    try {
      const r = await fetch(
        'https://cwewsfuswiiliritikvh.supabase.co/functions/v1/ynet-rss'
      )
      const j = await r.json()
      if (j.titles?.length) setHeadlines(j.titles)
      else setHeadlines(['טוען חדשות...'])
    } catch(e) {
      console.warn('news ticker', e)
      setHeadlines(['חדשות ynet'])
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, NEWS_INTERVAL)
    return () => clearInterval(t)
  }, [])

  // CSS animation — infinite scroll
  const text = headlines.join('   ·   ') + '   ·   '

  return (
    <div style={{
      height: '40px', background: '#1B3A5C',
      display: 'flex', alignItems: 'center',
      overflow: 'hidden', flexShrink: 0, position: 'relative',
    }}>
      {/* Label */}
      <div style={{
        background: '#2563EB', height: '100%',
        display: 'flex', alignItems: 'center',
        padding: '0 16px', flexShrink: 0, zIndex: 2,
        borderLeft: '3px solid #60a5fa',
      }}>
        <span style={{ color: 'white', fontWeight: '800', fontSize: '0.75rem', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
          חדשות ynet
        </span>
      </div>

      {/* Scrolling text */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {headlines.length > 0 && (
          <div style={{
            display: 'inline-block',
            whiteSpace: 'nowrap',
            color: 'rgba(255,255,255,0.9)',
            fontSize: '0.85rem',
            fontWeight: '500',
            animation: `tickerScroll ${Math.max(headlines.join(' · ').length * 0.1, 20)}s linear infinite`,
          }}>
            &nbsp;&nbsp;&nbsp;{text}{text}
          </div>
        )}
        {headlines.length === 0 && (
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', paddingRight: '16px' }}>
            טוען...
          </div>
        )}
      </div>

      <style>{`
        @keyframes tickerScroll {
          0%   { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  )
}

// ── Media Rotator ────────────────────────────────────────────
function MediaRotator({ building }) {
  const [media, setMedia] = useState([])
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)
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
    }, 600)
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
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
      borderRadius: '16px', color: '#94a3b8',
    }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🖼️</div>
      <div style={{ fontSize: '1rem', fontWeight: '600' }}>הוסף תמונות וסרטונים</div>
      <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>ממשק ניהול ← מסך לובי</div>
    </div>
  )

  const item = media[idx]
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease' }}>
        {item.type === 'video' ? (
          <video key={item.file_url} src={item.file_url}
            autoPlay muted playsInline onEnded={advance} onError={advance}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <img key={item.file_url} src={item.file_url} alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>

      {/* Subtle vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.15) 100%)',
      }} />

      {/* Dots */}
      {media.length > 1 && (
        <div style={{
          position: 'absolute', bottom: '14px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: '6px', zIndex: 2,
        }}>
          {media.map((_, i) => (
            <div key={i} style={{
              width: i === idx ? '18px' : '6px', height: '6px', borderRadius: '3px',
              background: i === idx ? 'white' : 'rgba(255,255,255,0.45)',
              transition: 'all 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }} />
          ))}
        </div>
      )}

      {item.type === 'video' && (
        <div style={{
          position: 'absolute', top: '12px', right: '12px', zIndex: 2,
          background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)',
          borderRadius: '6px', padding: '3px 10px',
          color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem', fontFamily: 'Heebo, sans-serif',
        }}>▶ וידאו</div>
      )}
    </div>
  )
}

// ── Notices Panel ────────────────────────────────────────────
function NoticesPanel({ building }) {
  const [notices, setNotices] = useState([])
  const [idx, setIdx] = useState(0)
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
      setTimeout(() => { setIdx(i => (i + 1) % notices.length); setFade(true) }, 400)
    }, 12000)
    return () => clearInterval(t)
  }, [notices])

  if (!notices.length) return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📋</div>
      <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#94a3b8' }}>אין הודעות לתצוגה</div>
      <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>סמן הודעות ב"הצג בלובי"</div>
    </div>
  )

  const n = notices[idx]
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        marginBottom: '18px', paddingBottom: '14px',
        borderBottom: '2px solid #f1f5f9',
      }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: '#22c55e', boxShadow: '0 0 8px #22c55e',
          animation: 'livePulse 2s infinite',
        }} />
        <span style={{
          fontSize: '0.7rem', fontWeight: '800', letterSpacing: '2px',
          textTransform: 'uppercase', color: '#94a3b8',
        }}>הודעות ועד הבית</span>
        {notices.length > 1 && (
          <span style={{ marginRight: 'auto', fontSize: '0.7rem', color: '#cbd5e1', background: '#f8fafc',
            padding: '2px 8px', borderRadius: '100px', border: '1px solid #e2e8f0' }}>
            {idx + 1} / {notices.length}
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, opacity: fade ? 1 : 0, transition: 'opacity 0.4s ease', overflow: 'hidden' }}>
        <div style={{
          fontSize: 'clamp(1rem, 2vw, 1.4rem)',
          fontWeight: '800', color: '#1e293b',
          lineHeight: 1.35, marginBottom: '16px',
        }}>{n.title}</div>
        <div style={{
          fontSize: 'clamp(0.8rem, 1.3vw, 1.05rem)',
          color: '#475569', lineHeight: 1.85,
          whiteSpace: 'pre-line',
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 10, WebkitBoxOrient: 'vertical',
        }}>{n.text}</div>
        <div style={{
          marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '0.7rem', color: '#94a3b8',
        }}>
          <span style={{ background: '#f1f5f9', borderRadius: '100px', padding: '2px 10px',
            border: '1px solid #e2e8f0', fontWeight: '600' }}>{n.date}</span>
        </div>
      </div>

      {/* Progress */}
      {notices.length > 1 && (
        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginTop: '16px' }}>
          {notices.map((_, i) => (
            <div key={i} style={{
              width: i === idx ? '20px' : '6px', height: '4px', borderRadius: '2px',
              background: i === idx ? '#2563EB' : '#e2e8f0',
              transition: 'all 0.4s',
            }} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────
export default function LobbyDisplay({ building = 12 }) {
  useEffect(() => {
    const t = setTimeout(() => window.location.reload(), REFRESH_INTERVAL)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'linear-gradient(150deg, #f8fafc 0%, #eef2ff 50%, #f0f9ff 100%)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Heebo', sans-serif",
      overflow: 'hidden', direction: 'rtl',
    }}>
      {/* Subtle decorative bg circles */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%',
          width: '40vw', height: '40vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '-5%',
          width: '30vw', height: '30vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)' }} />
      </div>

      {/* ── SLIM HEADER BAR ── */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', alignItems: 'center',
        padding: '0 40px',
        height: '76px', flexShrink: 0,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(226,232,240,0.8)',
        boxShadow: '0 1px 20px rgba(0,0,0,0.04)',
        gap: '24px',
      }}>
        {/* Building identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg, #1B3A5C 0%, #2563EB 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
          }}>🏢</div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: '#1e293b', lineHeight: 1 }}>
              שי עגנון {building}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px', letterSpacing: '0.5px' }}>
              קריית אונו
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '36px', background: '#e2e8f0', flexShrink: 0 }} />

        {/* Clock */}
        <SlimClock />

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Weather */}
        <Weather />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{
        flex: 1, position: 'relative', zIndex: 1,
        display: 'grid', gridTemplateColumns: '2fr 1fr',
        gap: '20px', padding: '20px 40px 16px',
        minHeight: 0,
      }}>
        {/* Media */}
        <div style={{
          borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
          minHeight: 0,
        }}>
          <MediaRotator building={building} />
        </div>

        {/* Notices */}
        <div style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid rgba(226,232,240,0.8)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
          padding: '24px 22px',
          overflow: 'hidden', minHeight: 0,
        }}>
          <NoticesPanel building={building} />
        </div>
      </div>

      {/* ── NEWS TICKER ── */}
      <div style={{ position: 'relative', zIndex: 2, flexShrink: 0 }}>
        <NewsTicker />
      </div>

      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
    </div>
  )
}
