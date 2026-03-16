import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { sendNewRequestEmail } from '../lib/email.js'

export default function Requests() {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', building: '', apartment: '', content: ''
  })
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState(null)

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }))

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.building || !form.apartment || !form.content) {
      setStatus('missing'); return
    }
    setStatus('sending')

    // העלאת קובץ אם יש
    let file_url = ''
    if (file) {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('request-files')
        .upload(fileName, file)
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('request-files').getPublicUrl(fileName)
        file_url = urlData.publicUrl
      }
    }

    const { data, error } = await supabase.from('requests')
      .insert([{ ...form, file_url, status: 'new' }]).select().single()

    if (error) { setStatus('error'); return }
    try { await sendNewRequestEmail(data) } catch(e) { console.warn(e) }
    setStatus('success')
    setForm({ name: '', phone: '', email: '', building: '', apartment: '', content: '' })
    setFile(null)
  }

  return (
    <div className="card">
      <style>{`.req-input::placeholder { color: #c0bab4; } .req-input:focus { border-color: var(--accent2); outline: none; }`}</style>
      <div className="panel-title"><div className="icon">📝</div>פנייה לחברת הניהול</div>
      <p style={{fontSize:'13.5px', color:'var(--muted)', marginBottom:'20px', lineHeight:'1.7'}}>
        מלאו את הטופס ונציג HIGH TOWER יטפל בפנייתכם בהקדם.
      </p>

      <div style={{marginBottom:'14px'}}>
        <div style={lbl}>שם מלא *</div>
        <input className="req-input" value={form.name} onChange={e => update('name', e.target.value)}
          placeholder="ישראל ישראלי" style={inp} />
      </div>

      <div style={{marginBottom:'14px'}}>
        <div style={lbl}>טלפון *</div>
        <input className="req-input" value={form.phone} onChange={e => update('phone', e.target.value)}
          placeholder="050-0000000" type="tel" style={inp} dir="ltr" />
      </div>

      <div style={{marginBottom:'14px'}}>
        <div style={lbl}>דוא״ל <span style={{fontWeight:'400', color:'#bbb'}}>(רשות)</span></div>
        <input className="req-input" value={form.email} onChange={e => update('email', e.target.value)}
          placeholder="example@gmail.com" type="email" style={inp} dir="ltr" />
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px'}}>
        <div>
          <div style={lbl}>בניין *</div>
          <select className="req-input" value={form.building} onChange={e => update('building', e.target.value)} style={inp}>
            <option value="">בחרו...</option>
            <option value="12">עגנון 12</option>
            <option value="14">עגנון 14</option>
          </select>
        </div>
        <div>
          <div style={lbl}>מספר דירה *</div>
          <input className="req-input" value={form.apartment} onChange={e => update('apartment', e.target.value)}
            placeholder="101" style={inp} dir="ltr" />
        </div>
      </div>

      <div style={{marginBottom:'14px'}}>
        <div style={lbl}>תוכן הפנייה *</div>
        <textarea className="req-input" value={form.content} onChange={e => update('content', e.target.value)}
          placeholder="תארו את הבעיה או הבקשה..." rows={5}
          style={{...inp, resize:'vertical', minHeight:'110px'}} />
      </div>

      {/* File upload */}
      <div style={{marginBottom:'20px'}}>
        <div style={lbl}>קובץ מצורף <span style={{fontWeight:'400', color:'#bbb'}}>(רשות — תמונה, PDF וכו׳)</span></div>
        <label style={{
          display:'flex', alignItems:'center', gap:'10px', cursor:'pointer',
          border:'1.5px dashed var(--border)', borderRadius:'10px', padding:'12px 14px',
          background:'#fafaf8', transition:'border-color 0.2s',
        }}>
          <span style={{fontSize:'20px'}}>📎</span>
          <span style={{fontSize:'13px', color: file ? 'var(--text)' : 'var(--muted)'}}>
            {file ? file.name : 'לחצו לבחירת קובץ'}
          </span>
          <input type="file" accept="image/*,.pdf,.doc,.docx" onChange={e => setFile(e.target.files[0])}
            style={{display:'none'}} />
        </label>
        {file && (
          <button onClick={() => setFile(null)} style={{
            fontSize:'12px', color:'var(--muted)', background:'none', border:'none',
            cursor:'pointer', marginTop:'4px', fontFamily:'Heebo, sans-serif'
          }}>✕ הסר קובץ</button>
        )}
      </div>

      {status === 'missing' && <div className="info-block amber" style={{marginBottom:'14px'}}>⚠️ נא למלא את כל השדות המסומנים ב-*</div>}
      {status === 'error' && <div className="info-block amber" style={{marginBottom:'14px'}}>❌ אירעה שגיאה, נסו שוב.</div>}
      {status === 'success' && <div className="info-block green" style={{marginBottom:'14px'}}>✅ הפנייה נשלחה בהצלחה! נחזור אליכם בהקדם.</div>}

      <button onClick={handleSubmit} disabled={status === 'sending'} style={{
        background: status === 'sending' ? 'var(--muted)' : 'var(--primary)',
        color:'white', border:'none', borderRadius:'100px',
        padding:'12px 28px', fontSize:'15px', fontWeight:'700',
        cursor: status === 'sending' ? 'default' : 'pointer',
        fontFamily:'Heebo, sans-serif', transition:'background 0.2s', width:'100%',
      }}>
        {status === 'sending' ? '⏳ שולח...' : '📨 שליחת פנייה'}
      </button>
    </div>
  )
}

const lbl = { fontSize:'12px', fontWeight:'700', color:'var(--muted)', marginBottom:'6px' }
const inp = {
  width:'100%', padding:'10px 14px', borderRadius:'10px',
  border:'1.5px solid var(--border)', fontSize:'14px',
  fontFamily:'Heebo, sans-serif', background:'#fafaf8',
  outline:'none', boxSizing:'border-box', color:'var(--text)',
  transition:'border-color 0.2s',
}
