import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { sendGatePhoneRequestEmail } from '../lib/email.js'

const EMPTY_ENTRY = { name: '', phone: '' }

export default function GatePhoneForm() {
  const [building, setBuilding] = useState('')
  const [apt, setApt] = useState('')
  const [floor, setFloor] = useState(null)
  const [floorLoading, setFloorLoading] = useState(false)
  const [entries, setEntries] = useState([{ ...EMPTY_ENTRY }])
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState(null)

  const lookupFloor = async (b, a) => {
    if (!b || !a || isNaN(parseInt(a))) return
    setFloorLoading(true)
    const { data } = await supabase
      .from('apartments')
      .select('floor')
      .eq('building', parseInt(b))
      .eq('apt', parseInt(a))
      .single()
    setFloor(data?.floor ?? null)
    setFloorLoading(false)
  }

  const updateEntry = (i, field, val) => {
    setEntries(e => e.map((x, idx) => idx === i ? { ...x, [field]: val } : x))
  }

  const addEntry = () => {
    if (entries.length >= 4) return
    setEntries(e => [...e, { ...EMPTY_ENTRY }])
  }

  const removeEntry = (i) => {
    setEntries(e => e.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async () => {
    const validEntries = entries.filter(e => e.name.trim() && e.phone.trim())
    if (!building || !apt || validEntries.length === 0) {
      setStatus('missing'); return
    }
    setStatus('sending')
    const { data, error } = await supabase.from('gate_phone_requests').insert([{
      building: parseInt(building),
      apt: parseInt(apt),
      floor,
      entries: validEntries,
      email: email.trim() || null,
      notes: notes.trim() || null,
    }]).select().single()
    if (error) { setStatus('error'); return }
    try { await sendGatePhoneRequestEmail(data) } catch(e) { console.warn(e) }
    setStatus('success')
    setBuilding(''); setApt(''); setFloor(null)
    setEntries([{ ...EMPTY_ENTRY }]); setEmail(''); setNotes('')
  }

  return (
    <div className="card">
      <div className="panel-title"><div className="icon">🔒</div>הוספה או עדכון מספרי טלפון לשער</div>

      <p style={{fontSize:'13.5px', color:'var(--muted)', marginBottom:'20px', lineHeight:'1.7'}}>
        מלאו את הטופס ומספריכם יועברו לועד הבית לעדכון במערכת השער.<br/>
        <strong>הבקשה אינה מבוצעת מיידית</strong> — ועד הבית יטפל בה בהקדם.
      </p>

      {/* Building + Apt */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px'}}>
        <div>
          <div style={lbl}>בניין *</div>
          <select value={building}
            onChange={e => { setBuilding(e.target.value); lookupFloor(e.target.value, apt) }}
            style={inp}>
            <option value="">בחרו...</option>
            <option value="12">עגנון 12</option>
            <option value="14">עגנון 14</option>
          </select>
        </div>
        <div>
          <div style={lbl}>מספר דירה *</div>
          <input value={apt}
            onChange={e => setApt(e.target.value)}
            onBlur={() => lookupFloor(building, apt)}
            placeholder="101" style={inp} dir="ltr" />
        </div>
      </div>

      {/* Floor (auto) */}
      {apt && building && (
        <div style={{marginBottom:'14px'}}>
          <div style={lbl}>קומה (מולא אוטומטית)</div>
          <div style={{...inp, background:'#f0ede8', color: floor !== null ? 'var(--text)' : 'var(--muted)', display:'flex', alignItems:'center', cursor:'default'}}>
            {floorLoading ? 'מחפש...' : floor !== null ? `קומה ${floor}` : 'לא נמצא — בדקו את פרטי הדירה'}
          </div>
        </div>
      )}

      {/* Phone entries */}
      <div style={{marginBottom:'6px'}}>
        <div style={lbl}>שם ומספר טלפון * (עד 4)</div>
        {entries.map((entry, i) => (
          <div key={i} style={{display:'flex', gap:'8px', marginBottom:'8px', alignItems:'center'}}>
            <input value={entry.name}
              onChange={e => updateEntry(i, 'name', e.target.value)}
              placeholder="שם מלא"
              style={{...inp, flex:1}} />
            <input value={entry.phone}
              onChange={e => updateEntry(i, 'phone', e.target.value.replace(/\D/g,''))}
              placeholder="0501234567"
              style={{...inp, flex:1}} dir="ltr" type="tel" />
            {entries.length > 1 && (
              <button onClick={() => removeEntry(i)}
                style={{background:'#fdf0f0', border:'none', borderRadius:'8px',
                  padding:'8px 10px', cursor:'pointer', color:'#e05555',
                  fontSize:'16px', flexShrink:0, fontFamily:'Heebo, sans-serif'}}>✕</button>
            )}
          </div>
        ))}
        {entries.length < 4 && (
          <button onClick={addEntry}
            style={{background:'#f0f4ff', border:'1.5px dashed #a0b8f0', borderRadius:'10px',
              padding:'8px 16px', fontSize:'13px', color:'var(--primary)', cursor:'pointer',
              fontFamily:'Heebo, sans-serif', fontWeight:'600', width:'100%', marginTop:'4px'}}>
            + הוסף מספר נוסף
          </button>
        )}
      </div>

      {/* Email */}
      <div style={{marginBottom:'14px', marginTop:'14px'}}>
        <div style={lbl}>דוא״ל <span style={{fontWeight:'400', color:'#bbb'}}>(רשות — לקבלת אישור כשהבקשה תבוצע)</span></div>
        <input value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="example@gmail.com"
          style={inp} dir="ltr" type="email" />
      </div>

      {/* Notes */}
      <div style={{marginBottom:'20px'}}>
        <div style={lbl}>הערות <span style={{fontWeight:'400', color:'#bbb'}}>(רשות)</span></div>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="הערות נוספות..." rows={3}
          style={{...inp, resize:'vertical', minHeight:'80px'}} />
      </div>

      {status === 'missing' && <div className="info-block amber" style={{marginBottom:'14px'}}>⚠️ נא למלא בניין, דירה ולפחות שם ומספר טלפון אחד.</div>}
      {status === 'error'   && <div className="info-block amber" style={{marginBottom:'14px'}}>❌ אירעה שגיאה, נסו שוב.</div>}
      {status === 'success' && <div className="info-block green" style={{marginBottom:'14px'}}>✅ הבקשה נשלחה! ועד הבית יטפל בה בהקדם.</div>}

      <button onClick={handleSubmit} disabled={status === 'sending'} style={{
        background: status === 'sending' ? 'var(--muted)' : 'var(--primary)',
        color:'white', border:'none', borderRadius:'100px',
        padding:'12px 28px', fontSize:'15px', fontWeight:'700',
        cursor: status === 'sending' ? 'default' : 'pointer',
        fontFamily:'Heebo, sans-serif', width:'100%',
      }}>
        {status === 'sending' ? '⏳ שולח...' : '📋 שליחת הבקשה'}
      </button>

      <div style={{fontSize:'12px', color:'var(--muted)', textAlign:'center', marginTop:'12px', lineHeight:'1.6'}}>
        הבקשה תועבר לועד הבית ולא תבוצע מיידית.
      </div>
    </div>
  )
}

const lbl = { fontSize:'12px', fontWeight:'700', color:'var(--muted)', marginBottom:'6px' }
const inp = {
  width:'100%', padding:'10px 14px', borderRadius:'10px',
  border:'1.5px solid var(--border)', fontSize:'14px',
  fontFamily:'Heebo, sans-serif', background:'#fafaf8',
  outline:'none', boxSizing:'border-box', color:'var(--text)',
}
