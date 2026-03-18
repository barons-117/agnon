import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { sendGatePhoneDoneEmail } from '../lib/email.js'

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('he-IL') + ' ' + d.toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'})
}

export default function AdminGatePhones() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDone, setShowDone] = useState(false)
  const [doneModal, setDoneModal] = useState(null)
  const [doneNote, setDoneNote] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('gate_phone_requests')
      .select('*')
      .order('created_at', { ascending: false })
    setRequests(data || [])
    setLoading(false)
  }

  const openDoneModal = (r) => { setDoneModal(r); setDoneNote('') }

  const confirmDone = async () => {
    if (!doneModal) return
    const note = doneNote.trim()
    await supabase.from('gate_phone_requests')
      .update({ status: 'done', done_note: note || null })
      .eq('id', doneModal.id)
    try { await sendGatePhoneDoneEmail(doneModal, note) } catch(e) { console.warn(e) }
    setRequests(r => r.map(x => x.id === doneModal.id ? { ...x, status: 'done', done_note: note || null } : x))
    setDoneModal(null); setDoneNote('')
  }

  const deleteReq = async (id) => {
    if (!window.confirm('למחוק בקשה זו?')) return
    await supabase.from('gate_phone_requests').delete().eq('id', id)
    setRequests(r => r.filter(x => x.id !== id))
  }

  const visible = requests.filter(r => showDone ? true : r.status !== 'done')
  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
        <div style={{fontWeight:'700', fontSize:'15px', color:'var(--primary)', display:'flex', alignItems:'center', gap:'8px'}}>
          🔒 בקשות עדכון שער — טלפונים
          {pendingCount > 0 && (
            <span style={{background:'#e05555', color:'white', borderRadius:'100px',
              padding:'2px 8px', fontSize:'12px', fontWeight:'700'}}>{pendingCount} ממתינות</span>
          )}
        </div>
        <div style={{display:'flex', gap:'8px'}}>
          <button onClick={() => setShowDone(v => !v)} style={{
            background: showDone ? '#1B3A5C' : '#f0ede8',
            color: showDone ? 'white' : 'var(--muted)',
            border:'none', borderRadius:'100px', padding:'7px 14px', fontSize:'12px',
            cursor:'pointer', fontFamily:'Heebo, sans-serif', fontWeight:'600'
          }}>{showDone ? '✓ מציג הכל' : 'הצג בוצע'}</button>
          <button onClick={load} style={{
            background:'#f0ede8', border:'1px solid var(--border)', borderRadius:'100px',
            padding:'7px 14px', fontSize:'12px', cursor:'pointer',
            fontFamily:'Heebo, sans-serif', color:'var(--primary)'
          }}>🔄 רענן</button>
        </div>
      </div>

      {loading && <div style={{color:'var(--muted)'}}>טוען...</div>}

      {!loading && visible.length === 0 && (
        <div className="info-block" style={{textAlign:'center', color:'var(--muted)', padding:'28px'}}>
          {showDone ? '📭 אין בקשות.' : '✅ אין בקשות ממתינות.'}
        </div>
      )}

      {visible.map(r => (
        <div key={r.id} style={{
          background: r.status === 'done' ? '#f7f5f1' : 'white',
          border: `1.5px solid ${r.status === 'done' ? '#e0dbd4' : 'var(--border)'}`,
          borderRadius:'12px', padding:'16px 18px', marginBottom:'10px',
          opacity: r.status === 'done' ? 0.6 : 1, transition: 'all 0.15s',
        }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px'}}>
            <div style={{flex:1}}>
              <div style={{display:'flex', gap:'8px', alignItems:'center', marginBottom:'10px', flexWrap:'wrap'}}>
                <span style={{fontWeight:'800', fontSize:'15px', color:'var(--primary)'}}>
                  עגנון {r.building} · דירה {r.apt}
                  {r.floor !== null && r.floor !== undefined && ` · קומה ${r.floor}`}
                </span>
                <span style={{fontSize:'11px', color:'var(--muted)'}}>{formatDate(r.created_at)}</span>
                {r.email && (
                  <span style={{fontSize:'11px', background:'#e4edf8', color:'#1a3a5c',
                    padding:'2px 8px', borderRadius:'100px'}}>✉️ {r.email}</span>
                )}
                {r.status === 'done' && (
                  <span style={{fontSize:'11px', background:'#d6f0e4', color:'#1a5c38',
                    padding:'2px 8px', borderRadius:'100px', fontWeight:'700'}}>✅ בוצע</span>
                )}
              </div>

              <div style={{display:'flex', flexDirection:'column', gap:'6px', marginBottom:'8px'}}>
                {(r.entries || []).map((e, i) => (
                  <div key={i} style={{
                    background:'#f7f9ff', borderRadius:'8px', padding:'8px 14px',
                    display:'flex', gap:'16px', fontSize:'13px', alignItems:'center',
                    border:'1px solid #e4edf8',
                  }}>
                    <span style={{fontWeight:'700', color:'var(--primary)', minWidth:'100px'}}>{e.name}</span>
                    <span style={{color:'var(--muted)', direction:'ltr', fontFamily:'monospace'}}>{e.phone}</span>
                  </div>
                ))}
              </div>

              {r.notes && (
                <div style={{marginTop:'4px', fontSize:'13px', color:'#7a5c00',
                  background:'#fffbf0', border:'1px solid #f5c97a',
                  borderRadius:'8px', padding:'8px 12px'}}>
                  📌 {r.notes}
                </div>
              )}
              {r.done_note && (
                <div style={{marginTop:'6px', fontSize:'13px', color:'#166534',
                  background:'#f0fdf4', border:'1px solid #bbf7d0',
                  borderRadius:'8px', padding:'8px 12px'}}>
                  💬 {r.done_note}
                </div>
              )}
            </div>

            <div style={{display:'flex', flexDirection:'column', gap:'6px', flexShrink:0}}>
              {r.status !== 'done' && (
                <button onClick={() => openDoneModal(r)} style={{
                  background:'#1a7a3a', color:'white', border:'none', borderRadius:'8px',
                  padding:'8px 14px', cursor:'pointer', fontSize:'13px',
                  fontFamily:'Heebo, sans-serif', fontWeight:'700', whiteSpace:'nowrap'
                }}>✓ בוצע</button>
              )}
              <button onClick={() => deleteReq(r.id)} style={{
                background:'#fdf0f0', color:'#e05555', border:'none', borderRadius:'8px',
                padding:'8px 10px', cursor:'pointer', fontSize:'13px', fontFamily:'Heebo, sans-serif'
              }}>🗑️</button>
            </div>
          </div>
        </div>
      ))}

      {/* Done modal */}
      {doneModal && (
        <div style={{position:'fixed', inset:0, zIndex:500, background:'rgba(0,0,0,0.45)',
          display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}
          onClick={() => setDoneModal(null)}>
          <div style={{background:'white', borderRadius:'16px', width:'100%', maxWidth:'420px', overflow:'hidden'}}
            onClick={e => e.stopPropagation()}>
            <div style={{background:'#1a7a3a', padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{color:'white', fontWeight:'700', fontSize:'15px'}}>✓ סגירת בקשת שער</div>
              <button onClick={() => setDoneModal(null)}
                style={{background:'rgba(255,255,255,0.2)', border:'none', borderRadius:'8px',
                  color:'white', padding:'4px 10px', cursor:'pointer', fontFamily:'Heebo, sans-serif'}}>✕</button>
            </div>
            <div style={{padding:'20px'}}>
              <div style={{fontSize:'13px', color:'var(--muted)', marginBottom:'8px'}}>
                עגנון {doneModal.building} · דירה {doneModal.apt}
              </div>
              <div style={{fontSize:'13px', background:'#f7f5f1', borderRadius:'8px',
                padding:'10px 12px', marginBottom:'16px', lineHeight:'1.8', whiteSpace:'pre-line'}}>
                {(doneModal.entries || []).map(e => `${e.name} — ${e.phone}`).join('\n')}
              </div>
              <div style={{fontSize:'12px', fontWeight:'700', color:'var(--muted)', marginBottom:'6px'}}>
                הערה לדייר{' '}
                <span style={{fontWeight:'400'}}>
                  {doneModal.email ? `(יישלח ל-${doneModal.email})` : '(לא הוזן מייל — לא יישלח)'}
                </span>
              </div>
              <textarea
                value={doneNote}
                onChange={e => setDoneNote(e.target.value)}
                placeholder="למשל: המספרים עודכנו במערכת, ניתן להשתמש באפליקציה... (רשות)"
                rows={3}
                style={{width:'100%', padding:'10px 12px', borderRadius:'10px',
                  border:'1.5px solid var(--border)', fontSize:'14px',
                  fontFamily:'Heebo, sans-serif', resize:'vertical',
                  boxSizing:'border-box', marginBottom:'16px', lineHeight:'1.6'}}
              />
              <div style={{display:'flex', gap:'10px'}}>
                <button onClick={confirmDone}
                  style={{flex:1, background:'#1a7a3a', color:'white', border:'none',
                    borderRadius:'10px', padding:'12px', fontFamily:'Heebo, sans-serif',
                    fontWeight:'700', fontSize:'14px', cursor:'pointer'}}>
                  ✓ אשר וסגור
                </button>
                <button onClick={() => setDoneModal(null)}
                  style={{background:'#f0ede8', color:'var(--muted)', border:'none',
                    borderRadius:'10px', padding:'12px 16px', fontFamily:'Heebo, sans-serif', cursor:'pointer'}}>
                  ביטול
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
