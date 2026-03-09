import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { sendDoneEmail } from '../lib/emailjs.js'
import RoomBookings from './RoomBookings.jsx'
import AdminNotices from './AdminNotices.jsx'

const ADMIN_PASSWORD = 'hightower2026'

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)
  const [adminTab, setAdminTab] = useState('requests')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all') // all | open | done

  const login = () => {
    if (pw === ADMIN_PASSWORD) { setAuthed(true); loadRequests() }
    else { setPwError(true) }
  }

  const loadRequests = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false })
    setRequests(data || [])
    setLoading(false)
  }

  const toggleDone = async (id, current) => {
    await supabase.from('requests').update({ done: !current }).eq('id', id)
    const updated = requests.find(x => x.id === id)
    if (!current && updated) {
      try { await sendDoneEmail(updated) } catch(e) { console.warn('email error', e) }
    }
    setRequests(r => r.map(x => x.id === id ? { ...x, done: !current } : x))
  }

  const filtered = requests.filter(r => {
    if (filter === 'open') return !r.done
    if (filter === 'done') return r.done
    return true
  })

  const formatDate = iso => {
    const d = new Date(iso)
    return d.toLocaleDateString('he-IL') + ' ' + d.toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'})
  }

  if (!authed) return (
    <div className="card" style={{maxWidth:'400px'}}>
      <div className="panel-title"><div className="icon">🔐</div>ממשק ניהול</div>
      <p style={{fontSize:'13.5px', color:'var(--muted)', marginBottom:'16px'}}>כניסה לחברת HIGH TOWER בלבד.</p>
      <input
        type="password"
        value={pw}
        onChange={e => { setPw(e.target.value); setPwError(false) }}
        onKeyDown={e => e.key === 'Enter' && login()}
        placeholder="סיסמה"
        style={{
          width:'100%', padding:'10px 14px', borderRadius:'10px',
          border: pwError ? '1.5px solid #e05555' : '1.5px solid var(--border)',
          fontSize:'14px', fontFamily:'Heebo, sans-serif',
          background:'#fafaf8', outline:'none', boxSizing:'border-box',
          marginBottom:'10px'
        }}
        dir="ltr"
      />
      {pwError && <div style={{color:'#e05555', fontSize:'13px', marginBottom:'10px'}}>סיסמה שגויה</div>}
      <button onClick={login} style={{
        background:'var(--primary)', color:'white', border:'none',
        borderRadius:'100px', padding:'10px 24px', fontSize:'14px',
        fontWeight:'700', cursor:'pointer', fontFamily:'Heebo, sans-serif', width:'100%'
      }}>כניסה</button>
    </div>
  )

  return (
    <div className="card">
      <div className="panel-title" style={{marginBottom:'16px'}}><div className="icon">⚙️</div>ממשק ניהול</div>

      {/* Main admin tabs */}
      <div style={{display:'flex', gap:'8px', marginBottom:'24px', borderBottom:'1px solid var(--border)', paddingBottom:'16px', flexWrap:'wrap'}}>
        <button className={`pro-tab-btn${adminTab === 'requests' ? ' active' : ''}`} onClick={() => setAdminTab('requests')}>📝 מערכת פניות</button>
        <button className={`pro-tab-btn${adminTab === 'rooms' ? ' active' : ''}`} onClick={() => setAdminTab('rooms')}>🛋️ הזמנת חדרי דיירים</button>
        <button className={`pro-tab-btn${adminTab === 'notices' ? ' active' : ''}`} onClick={() => setAdminTab('notices')}>📣 הודעות ועד בית</button>
      </div>

      {adminTab === 'rooms' && <RoomBookings />}
      {adminTab === 'notices' && <AdminNotices />}

      {adminTab === 'requests' && <>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px'}}>
        <div style={{fontWeight:'700', fontSize:'16px', color:'var(--primary)'}}>פניות דיירים</div>
        <button onClick={loadRequests} style={{
          background:'#f0ede8', border:'1px solid var(--border)', borderRadius:'100px',
          padding:'7px 16px', fontSize:'13px', fontWeight:'600', cursor:'pointer',
          fontFamily:'Heebo, sans-serif', color:'var(--primary)'
        }}>🔄 רענן</button>
      </div>

      {/* Filter tabs */}
      <div style={{display:'flex', gap:'8px', marginBottom:'20px'}}>
        {[
          { id:'all',  label:`הכל (${requests.length})` },
          { id:'open', label:`פתוחות (${requests.filter(r=>!r.done).length})` },
          { id:'done', label:`טופלו (${requests.filter(r=>r.done).length})` },
        ].map(t => (
          <button key={t.id}
            className={`pro-tab-btn${filter === t.id ? ' active' : ''}`}
            onClick={() => setFilter(t.id)}
          >{t.label}</button>
        ))}
      </div>

      {loading && <div style={{color:'var(--muted)'}}>טוען...</div>}

      {!loading && filtered.length === 0 && (
        <div className="info-block" style={{textAlign:'center', color:'var(--muted)', padding:'32px'}}>
          📭 אין פניות להצגה.
        </div>
      )}

      {filtered.map(r => (
        <div key={r.id} style={{
          background: r.done ? '#f0fbf4' : '#fafaf8',
          border: `1px solid ${r.done ? '#bce8cc' : 'var(--border)'}`,
          borderRadius:'12px', padding:'16px 18px', marginBottom:'10px',
        }}>
          <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'12px'}}>
            <div style={{flex:1}}>
              <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px', flexWrap:'wrap'}}>
                <span style={{fontWeight:'700', fontSize:'15px', color:'var(--primary)'}}>{r.name}</span>
                <span style={{fontSize:'12px', background:'#e4edf8', color:'#1a3a5c', padding:'2px 8px', borderRadius:'100px', fontWeight:'700'}}>
                  עגנון {r.building} · דירה {r.apartment}
                </span>
                <span style={{fontSize:'11px', color:'var(--muted)'}}>{formatDate(r.created_at)}</span>
              </div>
              <a href={`tel:${r.phone}`} style={{fontSize:'13px', color:'var(--accent2)', fontWeight:'600', direction:'ltr', display:'inline-block', marginBottom:'8px'}}>
                📞 {r.phone}
              </a>
              <div style={{fontSize:'14px', lineHeight:'1.7', color:'var(--text)', whiteSpace:'pre-line'}}>{r.content}</div>
            </div>
            <button
              onClick={() => toggleDone(r.id, r.done)}
              style={{
                background: r.done ? '#25D366' : 'white',
                color: r.done ? 'white' : 'var(--muted)',
                border: `2px solid ${r.done ? '#25D366' : 'var(--border)'}`,
                borderRadius:'50%', width:'36px', height:'36px',
                fontSize:'18px', cursor:'pointer', flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center',
                transition:'all 0.2s'
              }}
              title={r.done ? 'סמן כפתוח' : 'סמן כטופל'}
            >✓</button>
          </div>
        </div>
      ))}
      </>}
    </div>
  )
}
