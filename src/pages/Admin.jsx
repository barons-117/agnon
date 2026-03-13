import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { sendDoneEmail } from '../lib/emailjs.js'
import RoomBookings from './RoomBookings.jsx'
import AdminNotices from './AdminNotices.jsx'
import AdminPros from './AdminPros.jsx'
import AdminApartments from './AdminApartments.jsx'
import AdminProjects from './AdminProjects.jsx'
import FileAttachment from '../components/FileAttachment.jsx'

export default function Admin() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [adminTab, setAdminTab] = useState('requests')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [buildingFilter, setBuildingFilter] = useState('all')
  const [noteEditing, setNoteEditing] = useState(null)
  const [noteText, setNoteText] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      if (s) loadRequests()
    })
    return () => subscription.unsubscribe()
  }, [])

  const login = async () => {
    setLoggingIn(true); setLoginError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
    if (error) setLoginError('מייל או סיסמה שגויים')
    setLoggingIn(false)
  }

  const logout = async () => { await supabase.auth.signOut(); setSession(null) }

  const loadRequests = async () => {
    setLoading(true)
    const { data } = await supabase.from('requests').select('*').order('created_at', { ascending: false })
    setRequests(data || [])
    setLoading(false)
  }

  const setStatus = async (id, status) => {
    await supabase.from('requests').update({ status, done: status === 'done' }).eq('id', id)
    if (status === 'done') {
      const req = requests.find(r => r.id === id)
      if (req) try { await sendDoneEmail(req) } catch(e) { console.warn(e) }
    }
    setRequests(r => r.map(x => x.id === id ? { ...x, status, done: status === 'done' } : x))
  }

  const saveNote = async (id) => {
    await supabase.from('requests').update({ admin_note: noteText }).eq('id', id)
    setRequests(r => r.map(x => x.id === id ? { ...x, admin_note: noteText } : x))
    setNoteEditing(null)
  }

  const deleteRequest = async (id) => {
    if (!window.confirm('למחוק פנייה זו לצמיתות?')) return
    await supabase.from('requests').delete().eq('id', id)
    setRequests(r => r.filter(x => x.id !== id))
  }

  const filtered = requests.filter(r => {
    if (filter === 'new' && !(r.status === 'new' || !r.status)) return false
    if (filter === 'inprogress' && r.status !== 'inprogress') return false
    if (filter === 'done' && r.status !== 'done') return false
    if (buildingFilter !== 'all' && r.building !== buildingFilter) return false
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      return (
        r.name?.toLowerCase().includes(q) ||
        r.apartment?.toString().includes(q) ||
        r.content?.toLowerCase().includes(q) ||
        r.id?.toString().includes(q)
      )
    }
    return true
  })

  const count = (s) => s === 'all' ? requests.length :
    requests.filter(r => s === 'new' ? (r.status === 'new' || !r.status) : r.status === s).length

  const formatDate = iso => {
    const d = new Date(iso)
    return d.toLocaleDateString('he-IL') + ' ' + d.toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'})
  }

  const statusStyle = (s) => ({
    new:        { bg: '#fafaf8', border: 'var(--border)', badge: '#e4edf8', badgeText: '#1a3a5c', label: 'חדשה' },
    inprogress: { bg: '#fffbf0', border: '#f5c97a', badge: '#fff3b0', badgeText: '#7a5c00', label: 'בטיפול' },
    done:       { bg: '#f0fbf4', border: '#bce8cc', badge: '#d6f0e4', badgeText: '#1a5c38', label: 'טופל' },
  })[s || 'new']

  // Login screen
  if (!session) return (
    <div className="card" style={{maxWidth:'400px'}}>
      <div className="panel-title"><div className="icon">🔐</div>ממשק ניהול</div>
      <p style={{fontSize:'13.5px', color:'var(--muted)', marginBottom:'16px'}}>כניסה לחברת HIGH TOWER בלבד.</p>
      <div style={{marginBottom:'12px'}}>
        <div style={{fontSize:'12px', fontWeight:'700', color:'var(--muted)', marginBottom:'6px'}}>דוא״ל</div>
        <input value={email} onChange={e => { setEmail(e.target.value); setLoginError('') }}
          onKeyDown={e => e.key === 'Enter' && login()}
          placeholder="" type="email" dir="ltr"
          style={loginInput(!!loginError)} />
      </div>
      <div style={{marginBottom:'12px'}}>
        <div style={{fontSize:'12px', fontWeight:'700', color:'var(--muted)', marginBottom:'6px'}}>סיסמה</div>
        <input value={pw} onChange={e => { setPw(e.target.value); setLoginError('') }}
          onKeyDown={e => e.key === 'Enter' && login()}
          placeholder="" type="password" dir="ltr"
          style={loginInput(!!loginError)} />
      </div>
      {loginError && <div style={{color:'#e05555', fontSize:'13px', marginBottom:'10px'}}>{loginError}</div>}
      <button onClick={login} disabled={loggingIn} style={{
        background:'var(--primary)', color:'white', border:'none',
        borderRadius:'100px', padding:'10px 24px', fontSize:'14px',
        fontWeight:'700', cursor:'pointer', fontFamily:'Heebo, sans-serif', width:'100%',
        marginBottom:'14px'
      }}>{loggingIn ? 'מתחבר...' : 'כניסה'}</button>
      <div style={{fontSize:'12px', color:'var(--muted)', textAlign:'center', lineHeight:'1.6'}}>
        עמוד זה מיועד לחברת הניהול ולוועד הבית בלבד.<br/>דיירים — אנא השתמשו בטאב "פנייה לניהול".
      </div>
    </div>
  )

  return (
    <div className="card">
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px'}}>
        <div className="panel-title" style={{marginBottom:0}}><div className="icon">⚙️</div>ממשק ניהול</div>
        <button onClick={logout} style={{
          background:'transparent', color:'var(--muted)', border:'1px solid var(--border)',
          borderRadius:'100px', padding:'6px 14px', fontSize:'12px', cursor:'pointer', fontFamily:'Heebo, sans-serif'
        }}>יציאה</button>
      </div>

      {/* Main tabs */}
      <div className="admin-nav">
        <button className={`admin-nav-btn${adminTab === 'requests' ? ' active' : ''}`} onClick={() => setAdminTab('requests')}>פניות דיירים</button>
        <button className={`admin-nav-btn${adminTab === 'rooms' ? ' active' : ''}`} onClick={() => setAdminTab('rooms')}>הזמנת חדרים</button>
        <button className={`admin-nav-btn${adminTab === 'notices' ? ' active' : ''}`} onClick={() => setAdminTab('notices')}>הודעות ועד</button>
        <button className={`admin-nav-btn${adminTab === 'pros' ? ' active' : ''}`} onClick={() => setAdminTab('pros')}>בעלי מקצוע</button>
        <button className={`admin-nav-btn${adminTab === 'apartments' ? ' active' : ''}`} onClick={() => setAdminTab('apartments')}>דירות</button>
        <button className={`admin-nav-btn${adminTab === 'projects' ? ' active' : ''}`} onClick={() => setAdminTab('projects')}>פרויקטים</button>
      </div>

      {adminTab === 'rooms' && <RoomBookings />}
      {adminTab === 'notices' && <AdminNotices />}
      {adminTab === 'pros' && <AdminPros />}
      {adminTab === 'apartments' && <AdminApartments />}
      {adminTab === 'projects' && <AdminProjects />}


      {adminTab === 'requests' && <>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px'}}>
          <div style={{fontWeight:'700', fontSize:'16px', color:'var(--primary)'}}>פניות דיירים</div>
          <button onClick={loadRequests} style={{
            background:'#f0ede8', border:'1px solid var(--border)', borderRadius:'100px',
            padding:'7px 16px', fontSize:'13px', fontWeight:'600', cursor:'pointer',
            fontFamily:'Heebo, sans-serif', color:'var(--primary)'
          }}>🔄 רענן</button>
        </div>

        {/* Filter tabs */}
        <div style={{display:'flex', gap:'8px', marginBottom:'12px', flexWrap:'wrap'}}>
          {[
            { id:'all', label:`הכל (${count('all')})` },
            { id:'new', label:`חדשות (${count('new')})` },
            { id:'inprogress', label:`בטיפול (${count('inprogress')})` },
            { id:'done', label:`טופלו (${count('done')})` },
          ].map(t => (
            <button key={t.id} className={`pro-tab-btn${filter === t.id ? ' active' : ''}`}
              onClick={() => setFilter(t.id)}>{t.label}</button>
          ))}
        </div>

        {/* Search + building filter */}
        <div style={{display:'flex', gap:'8px', marginBottom:'20px', flexWrap:'wrap'}}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍  חיפוש לפי שם, דירה, מספר פנייה או תוכן..."
            style={{flex:1, minWidth:'180px', padding:'9px 14px', borderRadius:'10px',
              border:'1.5px solid var(--border)', fontSize:'13px',
              fontFamily:'Heebo, sans-serif', background:'#fafaf8', outline:'none'}}
          />
          <select value={buildingFilter} onChange={e => setBuildingFilter(e.target.value)}
            style={{padding:'9px 12px', borderRadius:'10px', border:'1.5px solid var(--border)',
              fontSize:'13px', fontFamily:'Heebo, sans-serif', background:'#fafaf8',
              color:'var(--text)', cursor:'pointer'}}>
            <option value="all">כל הבניינים</option>
            <option value="12">עגנון 12</option>
            <option value="14">עגנון 14</option>
          </select>
        </div>

        {loading && <div style={{color:'var(--muted)'}}>טוען...</div>}
        {!loading && filtered.length === 0 && (
          <div className="info-block" style={{textAlign:'center', color:'var(--muted)', padding:'32px'}}>📭 אין פניות להצגה.</div>
        )}

        {filtered.map(r => {
          const st = statusStyle(r.status)
          const isEditingNote = noteEditing === r.id
          return (
            <div key={r.id} style={{
              background: st.bg, border: `1px solid ${st.border}`,
              borderRadius:'12px', padding:'16px 18px', marginBottom:'10px',
            }}>
              <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'12px'}}>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px', flexWrap:'wrap'}}>
                    <span style={{fontSize:'11px', background:'#f0ede8', color:'var(--muted)', padding:'2px 8px', borderRadius:'100px', fontWeight:'700', fontVariantNumeric:'tabular-nums'}}>
                      #{r.id}
                    </span>
                    <span style={{fontWeight:'700', fontSize:'15px', color:'var(--primary)'}}>{r.name}</span>
                    <span style={{fontSize:'12px', background:'#e4edf8', color:'#1a3a5c', padding:'2px 8px', borderRadius:'100px', fontWeight:'700'}}>
                      עגנון {r.building} · דירה {r.apartment}
                    </span>
                    <span style={{fontSize:'11px', color:'var(--muted)'}}>{formatDate(r.created_at)}</span>
                    <span style={{fontSize:'11px', background:st.badge, color:st.badgeText, padding:'2px 8px', borderRadius:'100px', fontWeight:'700'}}>
                      {st.label}
                    </span>
                  </div>

                  <div style={{display:'flex', gap:'12px', flexWrap:'wrap', marginBottom:'8px'}}>
                    <a href={`tel:${r.phone}`} style={{fontSize:'13px', color:'var(--accent2)', fontWeight:'600', direction:'ltr'}}>📞 {r.phone}</a>
                    {r.email && <a href={`mailto:${r.email}`} style={{fontSize:'13px', color:'var(--accent2)', fontWeight:'600'}}>✉️ {r.email}</a>}
                  </div>

                  <div style={{fontSize:'14px', lineHeight:'1.7', color:'var(--text)', whiteSpace:'pre-line', marginBottom:'8px'}}>{r.content}</div>

                  <FileAttachment url={r.file_url} name={r.file_url?.split('/').pop()} />

                  {/* Admin note */}
                  {!isEditingNote && (
                    <div style={{display:'flex', alignItems:'center', gap:'8px', marginTop:'8px'}}>
                      {r.admin_note && (
                        <div style={{fontSize:'13px', color:'#7a5c00', background:'#fffbf0',
                          border:'1px solid #f5c97a', borderRadius:'8px', padding:'6px 10px', flex:1}}>
                          📌 {r.admin_note}
                        </div>
                      )}
                      <button onClick={() => { setNoteEditing(r.id); setNoteText(r.admin_note || '') }}
                        style={{fontSize:'12px', background:'transparent', border:'1px solid var(--border)',
                          borderRadius:'8px', padding:'4px 10px', cursor:'pointer', fontFamily:'Heebo, sans-serif',
                          color:'var(--muted)', whiteSpace:'nowrap'}}>
                        {r.admin_note ? '✏️ ערוך הערה' : '+ הוסף הערה'}
                      </button>
                    </div>
                  )}
                  {isEditingNote && (
                    <div style={{display:'flex', gap:'8px', alignItems:'flex-start', marginTop:'8px'}}>
                      <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
                        placeholder="הערה פנימית..." rows={2}
                        style={{flex:1, padding:'8px', borderRadius:'8px', border:'1px solid var(--border)',
                          fontSize:'13px', fontFamily:'Heebo, sans-serif', resize:'vertical'}} />
                      <div style={{display:'flex', flexDirection:'column', gap:'6px'}}>
                        <button onClick={() => saveNote(r.id)} style={{...smallBtn, background:'var(--primary)', color:'white'}}>שמור</button>
                        <button onClick={() => setNoteEditing(null)} style={{...smallBtn}}>ביטול</button>
                      </div>
                    </div>
                  )}

                  {/* Action buttons - below content on mobile */}
                  <div style={{display:'flex', gap:'8px', marginTop:'12px', flexWrap:'wrap'}}>
                    <button onClick={() => setStatus(r.id, 'inprogress')}
                      disabled={r.status === 'inprogress'}
                      style={{...actionBtn, background: r.status === 'inprogress' ? '#fff3b0' : '#f7f5f1',
                        border: r.status === 'inprogress' ? '1.5px solid #f5c97a' : '1px solid var(--border)'}}>
                      🔄 בטיפול
                    </button>
                    <button onClick={() => setStatus(r.id, 'done')}
                      disabled={r.status === 'done'}
                      style={{...actionBtn, background: r.status === 'done' ? '#d6f0e4' : '#f7f5f1',
                        border: r.status === 'done' ? '1.5px solid #8ecfad' : '1px solid var(--border)'}}>
                      ✓ טופל
                    </button>
                    <button onClick={() => deleteRequest(r.id)}
                      style={{...actionBtn, background:'#fdf0f0', border:'1px solid #f0b8b8', color:'#c04444'}}>
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </>}
    </div>
  )
}

const loginInput = (err) => ({
  width:'100%', padding:'10px 14px', borderRadius:'10px',
  border: err ? '1.5px solid #e05555' : '1.5px solid var(--border)',
  fontSize:'14px', fontFamily:'Heebo, sans-serif',
  background:'#fafaf8', outline:'none', boxSizing:'border-box',
})

const actionBtn = {
  border:'none', borderRadius:'8px', padding:'7px 12px', cursor:'pointer',
  fontSize:'12px', fontFamily:'Heebo, sans-serif', fontWeight:'600',
  whiteSpace:'nowrap', transition:'all 0.15s',
}

const smallBtn = {
  background:'#f0ede8', border:'1px solid var(--border)', borderRadius:'8px',
  padding:'5px 10px', cursor:'pointer', fontSize:'12px', fontFamily:'Heebo, sans-serif',
}
