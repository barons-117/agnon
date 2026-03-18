import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

function avgHours(items, fromField, toField) {
  const valid = items.filter(r => r[fromField] && r[toField])
  if (!valid.length) return null
  const total = valid.reduce((acc, r) => {
    return acc + (new Date(r[toField]) - new Date(r[fromField]))
  }, 0)
  return Math.round(total / valid.length / 1000 / 3600 * 10) / 10
}

function formatHours(h) {
  if (h === null) return '—'
  if (h < 24) return `${h} שע'`
  const days = Math.round(h / 24 * 10) / 10
  return `${days} ימים`
}

function periodStart(period) {
  const now = new Date()
  if (period === 'week') { const d = new Date(now); d.setDate(d.getDate() - 7); return d }
  if (period === 'month') { const d = new Date(now); d.setDate(d.getDate() - 30); return d }
  if (period === 'year') { return new Date(now.getFullYear(), 0, 1) }
  return new Date(0)
}

const card = (extra = {}) => ({
  background: 'white',
  border: '1.5px solid var(--border)',
  borderRadius: '14px',
  padding: '18px 20px',
  marginBottom: '12px',
  ...extra,
})

const statNum = { fontSize: '22px', fontWeight: '800', color: 'var(--primary)' }
const statLabel = { fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }
const divider = { width: '1px', background: 'var(--border)', margin: '0 4px', alignSelf: 'stretch' }

export default function AdminDashboard({ userRole, onNavigate }) {
  const [requests, setRequests] = useState([])
  const [bookings, setBookings] = useState([])
  const [notices, setNotices] = useState([])
  const [pendingPros, setPendingPros] = useState(0)
  const [pendingGate, setPendingGate] = useState(0)
  const [period, setPeriod] = useState('week')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    const [reqRes, bookRes, noticeRes, prosRes, gateRes] = await Promise.all([
      supabase.from('requests').select('*'),
      supabase.from('room_bookings').select('*'),
      supabase.from('notices').select('*'),
      supabase.from('pro_recommendations').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('gate_phone_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
    ])
    setRequests(reqRes.data || [])
    setBookings(bookRes.data || [])
    setNotices(noticeRes.data || [])
    setPendingPros(prosRes.count || 0)
    setPendingGate(gateRes.count || 0)
    setLoading(false)
  }

  if (loading) return <div style={{color:'var(--muted)', padding:'20px'}}>טוען...</div>

  // ── Requests stats ──
  const newReqs = requests.filter(r => r.status === 'new' || !r.status)
  const inprogReqs = requests.filter(r => r.status === 'inprogress')

  const now = new Date()
  const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - 7)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfYear = new Date(now.getFullYear(), 0, 1)

  const doneThisWeek  = requests.filter(r => r.status === 'done' && r.done_at && new Date(r.done_at) >= startOfWeek).length
  const doneThisMonth = requests.filter(r => r.status === 'done' && r.done_at && new Date(r.done_at) >= startOfMonth).length
  const doneThisYear  = requests.filter(r => r.status === 'done' && r.done_at && new Date(r.done_at) >= startOfYear).length

  const pStart = periodStart(period)
  const periodRequests = requests.filter(r => new Date(r.created_at) >= pStart)
  const avgResponse = avgHours(periodRequests, 'created_at', 'inprogress_at')
  const avgDone     = avgHours(periodRequests, 'created_at', 'done_at')

  // ── Room bookings ──
  const todayStr = now.toISOString().split('T')[0]
  const monthStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
  const bookingsThisMonth = bookings.filter(b => b.date && b.date.startsWith(monthStr)).length
  const nextBooking = bookings
    .filter(b => b.date && b.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))[0]

  const formatDate = (d) => {
    if (!d) return '—'
    const [y, m, day] = d.split('-')
    return `${day}/${m}/${y}`
  }

  // ── Notices ──
  const noticesByBuilding = (b) => notices.filter(n => n.building === b || n.building === 'both')
  const urgentByBuilding  = (b) => notices.filter(n => (n.building === b || n.building === 'both') && n.urgent)
  const lobbyByBuilding   = (b) => notices.filter(n => (n.building === b || n.building === 'both') && n.show_in_lobby)

  const periodOptions = [
    { id: 'week',  label: 'שבוע אחרון' },
    { id: 'month', label: '30 יום אחרונים' },
    { id: 'year',  label: 'מתחילת שנה' },
  ]

  return (
    <div>
      <div style={{fontWeight:'700', fontSize:'16px', color:'var(--primary)', marginBottom:'16px'}}>
        דשבורד
      </div>

      {/* ── Card 1: Requests ── */}
      <div style={card()}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px'}}>
          <div style={{fontWeight:'700', fontSize:'14px', color:'var(--primary)'}}>פניות לחברת הניהול</div>
          <button onClick={() => onNavigate('requests')} style={{
            background:'#f0ede8', border:'none', borderRadius:'100px',
            padding:'5px 12px', fontSize:'12px', cursor:'pointer',
            fontFamily:'Heebo, sans-serif', color:'var(--muted)'
          }}>לכל הפניות ←</button>
        </div>

        {/* Status row */}
        <div style={{display:'flex', gap:'0', alignItems:'stretch', background:'#f7f9ff',
          borderRadius:'10px', padding:'12px 0', marginBottom:'16px', flexWrap:'wrap'}}>
          <div style={{flex:1, textAlign:'center', padding:'0 16px'}}>
            <div style={{...statNum, color:'#1a3a5c'}}>{newReqs.length}</div>
            <div style={statLabel}>פניות חדשות</div>
          </div>
          <div style={divider} />
          <div style={{flex:1, textAlign:'center', padding:'0 16px'}}>
            <div style={{...statNum, color:'#7a5c00'}}>{inprogReqs.length}</div>
            <div style={statLabel}>בטיפול</div>
          </div>
          <div style={divider} />
          <div style={{flex:2, textAlign:'center', padding:'0 16px'}}>
            <div style={{fontSize:'13px', color:'var(--muted)', lineHeight:'1.9'}}>
              טופלו השבוע: <strong style={{color:'#1a5c38'}}>{doneThisWeek}</strong>
              &nbsp;·&nbsp;
              החודש: <strong style={{color:'#1a5c38'}}>{doneThisMonth}</strong>
              &nbsp;·&nbsp;
              השנה: <strong style={{color:'#1a5c38'}}>{doneThisYear}</strong>
            </div>
          </div>
        </div>

        {/* Timing */}
        <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px', flexWrap:'wrap'}}>
          <div style={{fontSize:'12px', fontWeight:'700', color:'var(--muted)'}}>זמני טיפול:</div>
          <div style={{display:'flex', gap:'6px'}}>
            {periodOptions.map(p => (
              <button key={p.id} onClick={() => setPeriod(p.id)} style={{
                background: period === p.id ? 'var(--primary)' : '#f0ede8',
                color: period === p.id ? 'white' : 'var(--muted)',
                border: 'none', borderRadius: '100px', padding: '4px 10px',
                fontSize: '11px', cursor: 'pointer', fontFamily: 'Heebo, sans-serif', fontWeight: '600',
              }}>{p.label}</button>
            ))}
          </div>
        </div>
        <div style={{display:'flex', gap:'12px', flexWrap:'wrap'}}>
          <div style={{flex:1, minWidth:'140px', background:'#f7f9ff', borderRadius:'10px', padding:'10px 14px'}}>
            <div style={{fontSize:'11px', color:'var(--muted)', marginBottom:'4px'}}>ממוצע עד תגובה</div>
            <div style={{fontSize:'20px', fontWeight:'800', color:'var(--primary)'}}>{formatHours(avgResponse)}</div>
          </div>
          <div style={{flex:1, minWidth:'140px', background:'#f7f9ff', borderRadius:'10px', padding:'10px 14px'}}>
            <div style={{fontSize:'11px', color:'var(--muted)', marginBottom:'4px'}}>ממוצע עד סיום</div>
            <div style={{fontSize:'20px', fontWeight:'800', color:'var(--primary)'}}>{formatHours(avgDone)}</div>
          </div>
        </div>
      </div>

      {/* ── Card 2: Room bookings ── */}
      <div style={card()}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px'}}>
          <div style={{fontWeight:'700', fontSize:'14px', color:'var(--primary)'}}>חדר דיירים</div>
          <button onClick={() => onNavigate('rooms')} style={{
            background:'#f0ede8', border:'none', borderRadius:'100px',
            padding:'5px 12px', fontSize:'12px', cursor:'pointer',
            fontFamily:'Heebo, sans-serif', color:'var(--muted)'
          }}>לניהול ←</button>
        </div>
        <div style={{display:'flex', gap:'0', alignItems:'stretch', background:'#f7f9ff',
          borderRadius:'10px', padding:'12px 0'}}>
          <div style={{flex:1, textAlign:'center', padding:'0 16px'}}>
            <div style={statNum}>{bookingsThisMonth}</div>
            <div style={statLabel}>אירועים החודש</div>
          </div>
          <div style={divider} />
          <div style={{flex:1, textAlign:'center', padding:'0 16px'}}>
            <div style={{...statNum, fontSize:'16px'}}>{nextBooking ? formatDate(nextBooking.date) : '—'}</div>
            <div style={statLabel}>אירוע הבא{nextBooking?.name ? ` · ${nextBooking.name}` : ''}</div>
          </div>
        </div>
      </div>

      {/* ── Card 3: Notices (ועד only) ── */}
      {userRole === 'admin' && (
        <div style={card()}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px'}}>
            <div style={{fontWeight:'700', fontSize:'14px', color:'var(--primary)'}}>הודעות ועד</div>
            <button onClick={() => onNavigate('notices')} style={{
              background:'#f0ede8', border:'none', borderRadius:'100px',
              padding:'5px 12px', fontSize:'12px', cursor:'pointer',
              fontFamily:'Heebo, sans-serif', color:'var(--muted)'
            }}>לניהול ←</button>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
            {[
              { label: 'פעילות בניין 12', val12: noticesByBuilding('12').length, val14: noticesByBuilding('14').length },
              { label: 'דחופות', val12: urgentByBuilding('12').length, val14: urgentByBuilding('14').length, color: '#e05555' },
              { label: 'מסך לובי', val12: lobbyByBuilding('12').length, val14: lobbyByBuilding('14').length, color: '#1a5c8c' },
            ].map((row, i) => (
              <div key={i} style={{gridColumn: i === 0 ? '1 / -1' : 'auto',
                background:'#f7f9ff', borderRadius:'10px', padding:'10px 14px',
                display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                <div style={{fontSize:'12px', color:'var(--muted)', fontWeight:'600'}}>{row.label}</div>
                <div style={{display:'flex', gap:'12px'}}>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:'16px', fontWeight:'800', color: row.color || 'var(--primary)'}}>{row.val12}</div>
                    <div style={{fontSize:'10px', color:'var(--muted)'}}>בניין 12</div>
                  </div>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:'16px', fontWeight:'800', color: row.color || 'var(--primary)'}}>{row.val14}</div>
                    <div style={{fontSize:'10px', color:'var(--muted)'}}>בניין 14</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Card 4: Pending pros (ועד only) ── */}
      {userRole === 'admin' && pendingPros > 0 && (
        <div style={card({ border: '1.5px solid #f5c97a', background: '#fffbf0' })}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <div style={{fontWeight:'700', fontSize:'14px', color:'#7a5c00', marginBottom:'4px'}}>
                בעלי מקצוע — המלצות ממתינות
              </div>
              <div style={{fontSize:'13px', color:'#a07820'}}>
                <strong>{pendingPros}</strong> המלצות ממתינות לאישור
              </div>
            </div>
            <button onClick={() => onNavigate('pros')} style={{
              background:'#f5c97a', border:'none', borderRadius:'100px',
              padding:'7px 14px', fontSize:'12px', cursor:'pointer',
              fontFamily:'Heebo, sans-serif', fontWeight:'700', color:'#7a5c00'
            }}>לאישור ←</button>
          </div>
        </div>
      )}

      {/* ── Card 5: Pending gate requests (ועד only) ── */}
      {userRole === 'admin' && pendingGate > 0 && (
        <div style={card({ border: '1.5px solid #c8dcf0', background: '#f0f7ff' })}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <div style={{fontWeight:'700', fontSize:'14px', color:'#1a3a5c', marginBottom:'4px'}}>
                שער חשמלי — בקשות ממתינות
              </div>
              <div style={{fontSize:'13px', color:'#1a5c8c'}}>
                <strong>{pendingGate}</strong> בקשות טלפון ממתינות לטיפול
              </div>
            </div>
            <button onClick={() => onNavigate('gate')} style={{
              background:'#1B3A5C', border:'none', borderRadius:'100px',
              padding:'7px 14px', fontSize:'12px', cursor:'pointer',
              fontFamily:'Heebo, sans-serif', fontWeight:'700', color:'white'
            }}>לטיפול ←</button>
          </div>
        </div>
      )}
    </div>
  )
}
