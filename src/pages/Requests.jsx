import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { sendNewRequestEmail } from '../lib/emailjs.js'

export default function Requests() {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', building: '', apartment: '', content: ''
  })
  const [status, setStatus] = useState(null)

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }))

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.building || !form.apartment || !form.content) {
      setStatus('missing')
      return
    }
    setStatus('sending')
    const { data, error } = await supabase.from('requests').insert([form]).select().single()
    if (error) { setStatus('error'); return }
    try { await sendNewRequestEmail(data) } catch(e) { console.warn('email error', e) }
    setStatus('success')
    setForm({ name: '', phone: '', email: '', building: '', apartment: '', content: '' })
  }

  return (
    <div className="card">
      <style>{`
        .req-input::placeholder { color: #c0bab4; }
        .req-input:focus { border-color: var(--accent2); outline: none; }
      `}</style>

      <div className="panel-title"><div className="icon">📝</div>פנייה לחברת הניהול</div>
      <p style={{fontSize:'13.5px', color:'var(--muted)', marginBottom:'20px', lineHeight:'1.7'}}>
        מלאו את הטופס ונציג HIGH TOWER יטפל בפנייתכם בהקדם.
      </p>

      {/* Name */}
      <div style={{marginBottom:'14px'}}>
        <div style={labelStyle}>שם מלא *</div>
        <input className="req-input" value={form.name} onChange={e => update('name', e.target.value)}
          placeholder="ישראל ישראלי" style={inputStyle} />
      </div>

      {/* Phone */}
      <div style={{marginBottom:'14px'}}>
        <div style={labelStyle}>טלפון *</div>
        <input className="req-input" value={form.phone} onChange={e => update('phone', e.target.value)}
          placeholder="050-0000000" type="tel" style={inputStyle} dir="ltr" />
      </div>

      {/* Email */}
      <div style={{marginBottom:'14px'}}>
        <div style={labelStyle}>דוא״ל <span style={{fontWeight:'400', color:'#bbb'}}>(רשות)</span></div>
        <input className="req-input" value={form.email} onChange={e => update('email', e.target.value)}
          placeholder="example@gmail.com" type="email" style={inputStyle} dir="ltr" />
      </div>

      {/* Building + Apartment */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px'}}>
        <div>
          <div style={labelStyle}>בניין *</div>
          <select className="req-input" value={form.building} onChange={e => update('building', e.target.value)} style={inputStyle}>
            <option value="">בחרו...</option>
            <option value="12">עגנון 12</option>
            <option value="14">עגנון 14</option>
          </select>
        </div>
        <div>
          <div style={labelStyle}>מספר דירה *</div>
          <input className="req-input" value={form.apartment} onChange={e => update('apartment', e.target.value)}
            placeholder="101" style={inputStyle} dir="ltr" />
        </div>
      </div>

      {/* Content */}
      <div style={{marginBottom:'20px'}}>
        <div style={labelStyle}>תוכן הפנייה *</div>
        <textarea className="req-input" value={form.content} onChange={e => update('content', e.target.value)}
          placeholder="תארו את הבעיה או הבקשה..." rows={5}
          style={{...inputStyle, resize:'vertical', minHeight:'110px'}} />
      </div>

      {status === 'missing' && (
        <div className="info-block amber" style={{marginBottom:'14px'}}>⚠️ נא למלא את כל השדות המסומנים ב-*</div>
      )}
      {status === 'error' && (
        <div className="info-block amber" style={{marginBottom:'14px'}}>❌ אירעה שגיאה, נסו שוב.</div>
      )}
      {status === 'success' && (
        <div className="info-block green" style={{marginBottom:'14px'}}>✅ הפנייה נשלחה בהצלחה! נחזור אליכם בהקדם.</div>
      )}

      <button onClick={handleSubmit} disabled={status === 'sending'} style={{
        background: status === 'sending' ? 'var(--muted)' : 'var(--primary)',
        color: 'white', border: 'none', borderRadius: '100px',
        padding: '12px 28px', fontSize: '15px', fontWeight: '700',
        cursor: status === 'sending' ? 'default' : 'pointer',
        fontFamily: 'Heebo, sans-serif', transition: 'background 0.2s', width: '100%',
      }}>
        {status === 'sending' ? '⏳ שולח...' : '📨 שליחת פנייה'}
      </button>
    </div>
  )
}

const labelStyle = { fontSize:'12px', fontWeight:'700', color:'var(--muted)', marginBottom:'6px' }

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: '10px',
  border: '1.5px solid var(--border)', fontSize: '14px',
  fontFamily: 'Heebo, sans-serif', background: '#fafaf8',
  outline: 'none', boxSizing: 'border-box', color: 'var(--text)',
  transition: 'border-color 0.2s',
}
