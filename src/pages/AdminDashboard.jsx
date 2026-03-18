import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

function avgHours(items, fromField, toField) {
  const valid = items.filter(r => r[fromField] && r[toField])
  if (!valid.length) return null
  const total = valid.reduce((acc, r) => acc + (new Date(r[toField]) - new Date(r[fromField])), 0)
  return Math.round(total / valid.length / 1000 / 3600 * 10) / 10
}

function formatHours(h) {
  if (h === null) return '—'
  if (h < 24) return `${h} שע'`
  return `${Math.round(h / 24 * 10) / 10} ימים`
}

function periodStart(period) {
  const now = new Date()
  if (period === 'week')  { const d = new Date(now); d.setDate(d.getDate() - 7); return d }
  if (period === 'month') { const d = new Date(now); d.setDate(d.getDate() - 30); return d }
  if (period === 'year')  { return new Date(now.getFullYear(), 0, 1) }
  return new Date(0)
}

const cardStyle = (extra = {}) => ({
  background: 'white', border: '1.5px solid var(--border)',
  borderRadius: '14px', padding: '18px 20px', marginBottom: '12px', ...extra,
})
const statNum   = { fontSize: '22px', fontWeight: '800', color: 'var(--primary)' }
const statLabel = { fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }
const divider   = { width: '1px', background: 'var(--border)', margin: '0 4px', alignSelf: 'stretch' }

export default function AdminDashboard({ userRole, onNavigate }) {
  const [requests, setRequests]       = useState([])
  const [bookings, setBookings]       = useState([])
  const [notices, setNotices]         = useState([])
  const [pendingPros, setPendingPros] = useState(0)
  const [pendingGate, setPendingGate] = useState(0)
  const [pendingRes, setPendingRes]   = useState(0)
  const [period, setPeriod]           = useState('week')
  const [loading, setLoading]         = useState(true)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const [reqRes, bookRes, noticeRes, prosRes, gateRes, resRes] = await Promise.all([
      supabase.from('requests').select('*'),
      supabase.from('room_bookings').select('*'),
      supabase.from('notices').select('*'),
      supabase.from('pro_recommendations').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('gate_phone_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('profile_update_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
    ])
    setRequests(reqRes.data || [])
    setBookings(bookRes.data || [])
    setNotices(noticeRes.data || [])
    setPendingPros(prosRes.count || 0)
    setPendingGate(gateRes.count || 0)
    setPendingRes(resRes.count || 0)
    setLoading(false)
  }

  if (loading) return <div style={{color:'var(--muted)', padding:'20px'}}>טוען...</div>

  // ── Requests ──
  const newReqs    = requests.filter(r => r.status === 'new' || !r.status)
  const inprogReqs = requests.filter(r => r.status === 'inprogress')
  const now        = new Date()

  const startOfWeek  = new Date(now); startOfWeek.setDate(now.getDate() - 7)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfYear  = new Date(now.getFullYear(), 0, 1)

  const doneThisWeek  = requests.filter(r => r.status === 'done' && r.done_at && new Date(r.done_at) >= startOfWeek).length
  const doneThisMonth = requests.filter(r => r.status === 'done' && r.done_at && new Date(r.done_at) >= startOfMonth).length
  const doneThisYear  = requests.filter(r => r.status === 'done' && r.done_at && new Date(r.done_at) >= startOfYear).length

  const periodReqs  = requests.filter(r => new Date(r.created_at) >= periodStart(period))
  const avgResponse = avgHours(periodReqs, 'created_at', 'inprogress_at')
  const avgDone     = avgHours(periodReqs, 'created_at', 'done_at')

  // ── Room bookings ──
  const todayStr = now.toISOString().split('T')[0]
  const monthStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`

  const bookings12 = bookings.filter(b => b.building === 12)
  const bookings14 = bookings.filter(b => b.building === 14)

  const monthCount12 = bookings12.filter(b => b.date?.startsWith(monthStr)).length
  const monthCount14 = bookings14.filter(b => b.date?.startsWith(monthStr)).length

  const nextBook12 = bookings12.filter(b => b.date >= todayStr).sort((a,b) => a.date.localeCompare(b.date))[0]
  const nextBook14 = bookings14.filter(b => b.date >= todayStr).sort((a,b) => a.date.localeCompare(b.date))[0]

  const fmtDate = (d) => {
    if (!d) return '—'
    const [y, m, day] = d.split('-')
    return `${day}/${m}/${y}`
  }

  // ── Notices ──
  const countNotices = (b, field) => {
    if (field) return notices.filter(n => (n.building === b || n.building === 'both') && n[field]).length
    return notices.filter(n => n.building === b || n.building === 'both').length
  }

  const periodOptions = [
    { id: 'week',  label: 'שבוע אחרון' },
    { id: 'month', label: '30 יום' },
    { id: 'year',  label: 'השנה' },
  ]

  const NavBtn = ({ tab, label }) => (
    <button onClick={() => onNavigate(tab)} style={{
      background:'#f0ede8', border:'none', borderRadius:'100px',
      padding:'5px 12px', fontSize:'12px', cursor:'pointer',
      fontFamily:'Heebo, sans-serif', color:'var(--muted)'
    }}>{label} ←</button>
  )

  return (
    <div>
      <div style={{fontWeight:'700', fontSize:'16px', color:'var(--primary)', marginBottom:'16px'}}>דשבורד</div>

      {/* ── Card 1: Requests ── */}
      <div style={cardStyle()}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px'}}>
          <div style={{fontWeight:'700', fontSize:'14px', color:'var(--primary)'}}>פניות לחברת הניהול</div>
          <NavBtn tab="requests" label="לכל הפניות" />
        </div>

        {/* Status row */}
        <div style={{display:'flex', gap:'0', alignItems:'stretch', background:'#f7f9ff',
          borderRadius:'10px', padding:'12px 0', marginBottom:'16px', flexWrap:'wrap'}}>
          <div style={{flex:1, textAlign:'center', padding:'0 16px'}}>
            <div style={{...statNum, color:'#1a3a5c'}}>{newReqs.length}</div>
            <div style={statLabel}>חדשות</div>
          </div>
          <div style={divider} />
          <div style={{flex:1, textAlign:'center', padding:'0 16px'}}>
            <div style={{...statNum, color:'#7a5c00'}}>{inprogReqs.length}</div>
            <div style={statLabel}>בטיפול</div>
          </div>
          <div style={divider} />
          <div style={{flex:2, textAlign:'center', padding:'0 16px', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <div style={{fontSize:'12px', color:'var(--muted)', lineHeight:'2'}}>
              <div style={{fontSize:'11px', color:'var(--muted)', marginBottom:'2px', fontWeight:'600'}}>טופלו:</div>
              השבוע: <strong style={{color:'#1a5c38'}}>{doneThisWeek}</strong>
              &nbsp;·&nbsp; החודש: <strong style={{color:'#1a5c38'}}>{doneThisMonth}</strong>
              &nbsp;·&nbsp; השנה: <strong style={{color:'#1a5c38'}}>{doneThisYear}</strong>
            </div>
          </div>
        </div>

        {/* Timing */}
        <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px', flexWrap:'wrap'}}>
          <div style={{fontSize:'12px', fontWeight:'700', color:'var(--muted)'}}>זמני טיפול:</div>
          {periodOptions.map(p => (
            <button key={p.id} onClick={() => setPeriod(p.id)} style={{
              background: period === p.id ? 'var(--primary)' : '#f0ede8',
              color: period === p.id ? 'white' : 'var(--muted)',
              border:'none', borderRadius:'100px', padding:'4px 10px',
              fontSize:'11px', cursor:'pointer', fontFamily:'Heebo, sans-serif', fontWeight:'600',
            }}>{p.label}</button>
          ))}
        </div>
        <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
          <div style={{flex:1, minWidth:'130px', background:'#f7f9ff', borderRadius:'10px', padding:'10px 14px'}}>
            <div style={{fontSize:'11px', color:'var(--muted)', marginBottom:'4px'}}>ממוצע עד תגובה</div>
            <div style={{fontSize:'20px', fontWeight:'800', color:'var(--primary)'}}>{formatHours(avgResponse)}</div>
          </div>
          <div style={{flex:1, minWidth:'130px', background:'#f7f9ff', borderRadius:'10px', padding:'10px 14px'}}>
            <div style={{fontSize:'11px', color:'var(--muted)', marginBottom:'4px'}}>ממוצע עד סיום</div>
            <div style={{fontSize:'20px', fontWeight:'800', color:'var(--primary)'}}>{formatHours(avgDone)}</div>
          </div>
        </div>
      </div>

      {/* ── Card 2: Room bookings ── */}
      <div style={cardStyle()}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px'}}>
          <div style={{fontWeight:'700', fontSize:'14px', color:'var(--primary)'}}>חדר דיירים</div>
          <NavBtn tab="rooms" label="לניהול" />
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
          {[{b:12, count:monthCount12, next:nextBook12}, {b:14, count:monthCount14, next:nextBook14}].map(({b, count, next}) => (
            <div key={b} style={{background:'#f7f9ff', borderRadius:'10px', padding:'12px 14px'}}>
              <div style={{fontSize:'12px', fontWeight:'700', color:'var(--muted)', marginBottom:'8px'}}>עגנון {b}</div>
              <div style={{display:'flex', gap:'0', alignItems:'stretch'}}>
                <div style={{flex:1}}>
                  <div style={{...statNum, fontSize:'20px'}}>{count}</div>
                  <div style={statLabel}>אירועים החודש</div>
                </div>
                <div style={divider} />
                <div style={{flex:1, paddingRight:'10px'}}>
                  <div style={{fontSize:'14px', fontWeight:'800', color:'var(--primary)'}}>{fmtDate(next?.date)}</div>
                  <div style={statLabel}>אירוע הבא{next?.name ? ` · ${next.name}` : ''}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Card 3: Notices (ועד only) ── */}
      {userRole === 'admin' && (
        <div style={cardStyle()}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px'}}>
            <div style={{fontWeight:'700', fontSize:'14px', color:'var(--primary)'}}>הודעות ועד</div>
            <NavBtn tab="notices" label="לניהול" />
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
            {[
              { label:'פעילות', field:null, color:'var(--primary)' },
              { label:'דחופות', field:'urgent', color:'#e05555' },
              { label:'מסך לובי', field:'show_in_lobby', color:'#1a5c8c' },
            ].map(row => (
              <div key={row.label} style={{background:'#f7f9ff', borderRadius:'10px', padding:'10px 14px',
                display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                <div style={{fontSize:'12px', color:'var(--muted)', fontWeight:'600'}}>{row.label}</div>
                <div style={{display:'flex', gap:'16px'}}>
                  {['12','14'].map(b => (
                    <div key={b} style={{textAlign:'center', minWidth:'40px'}}>
                      <div style={{fontSize:'16px', fontWeight:'800', color: row.color}}>{countNotices(b, row.field)}</div>
                      <div style={{fontSize:'10px', color:'var(--muted)'}}>בניין {b}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Card 4: Pending pros (ועד only) ── */}
      {userRole === 'admin' && pendingPros > 0 && (
        <div style={cardStyle({ border:'1.5px solid #f5c97a', background:'#fffbf0' })}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <div style={{fontWeight:'700', fontSize:'14px', color:'#7a5c00', marginBottom:'4px'}}>בעלי מקצוע — ממתינות לאישור</div>
              <div style={{fontSize:'13px', color:'#a07820'}}><strong>{pendingPros}</strong> המלצות ממתינות</div>
            </div>
            <button onClick={() => onNavigate('pros')} style={{
              background:'#f5c97a', border:'none', borderRadius:'100px',
              padding:'7px 14px', fontSize:'12px', cursor:'pointer',
              fontFamily:'Heebo, sans-serif', fontWeight:'700', color:'#7a5c00'
            }}>לאישור ←</button>
          </div>
        </div>
      )}

      {/* ── Card 5: Pending gate (ועד only) ── */}
      {userRole === 'admin' && pendingGate > 0 && (
        <div style={cardStyle({ border:'1.5px solid #c8dcf0', background:'#f0f7ff' })}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <div style={{fontWeight:'700', fontSize:'14px', color:'#1a3a5c', marginBottom:'4px'}}>שער חשמלי — בקשות ממתינות</div>
              <div style={{fontSize:'13px', color:'#1a5c8c'}}><strong>{pendingGate}</strong> בקשות טלפון ממתינות</div>
            </div>
            <button onClick={() => onNavigate('gate')} style={{
              background:'#1B3A5C', border:'none', borderRadius:'100px',
              padding:'7px 14px', fontSize:'12px', cursor:'pointer',
              fontFamily:'Heebo, sans-serif', fontWeight:'700', color:'white'
            }}>לטיפול ←</button>
          </div>
        </div>
      )}

      {/* ── Card 6: Pending residents (ועד only) ── */}
      {userRole === 'admin' && pendingRes > 0 && (
        <div style={cardStyle({ border:'1.5px solid #c8e6c9', background:'#f1f8f1' })}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <div style={{fontWeight:'700', fontSize:'14px', color:'#1a5c38', marginBottom:'4px'}}>דיירים — בקשות עדכון ממתינות</div>
              <div style={{fontSize:'13px', color:'#2e7d52'}}><strong>{pendingRes}</strong> בקשות להחלפה/הוספת שוכר</div>
            </div>
            <button onClick={() => onNavigate('apartments')} style={{
              background:'#1a6b3a', border:'none', borderRadius:'100px',
              padding:'7px 14px', fontSize:'12px', cursor:'pointer',
              fontFamily:'Heebo, sans-serif', fontWeight:'700', color:'white'
            }}>לטיפול ←</button>
          </div>
        </div>
      )}
    </div>
  )
}
