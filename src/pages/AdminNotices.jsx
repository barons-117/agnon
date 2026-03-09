import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const EMPTY = { title: '', text: '', date: '', building: 'both', file_url: null, file_name: null }

export default function AdminNotices() {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null) // {url, name}

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('notices').select('*').order('date', { ascending: false })
    setNotices(data || [])
    setLoading(false)
  }

  const today = () => {
    const d = new Date()
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
  }

  const openNew = () => {
    setForm({ ...EMPTY, date: today() })
    setUploadedFile(null)
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (n) => {
    setForm({ ...n })
    setUploadedFile(n.file_url ? { url: n.file_url, name: n.file_name } : null)
    setEditingId(n.id)
    setShowForm(true)
  }

  const cancel = () => { setShowForm(false); setEditingId(null); setForm(EMPTY); setUploadedFile(null) }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('notices-files').upload(path, file)
    if (error) { alert('שגיאה בהעלאת הקובץ'); setUploading(false); return }
    const { data: urlData } = supabase.storage.from('notices-files').getPublicUrl(path)
    setUploadedFile({ url: urlData.publicUrl, name: file.name })
    setUploading(false)
  }

  const removeFile = () => setUploadedFile(null)

  const save = async () => {
    if (!form.title || !form.text || !form.date) return
    setSaving(true)
    const payload = {
      title: form.title, text: form.text, date: form.date, building: form.building,
      file_url: uploadedFile?.url || null,
      file_name: uploadedFile?.name || null,
    }
    if (editingId) {
      await supabase.from('notices').update(payload).eq('id', editingId)
    } else {
      await supabase.from('notices').insert([payload])
    }
    setSaving(false)
    cancel()
    load()
  }

  const deleteNotice = async (id) => {
    if (!window.confirm('למחוק הודעה זו?')) return
    await supabase.from('notices').delete().eq('id', id)
    setNotices(n => n.filter(x => x.id !== id))
  }

  const buildingLabel = (b) => b === 'both' ? 'שני הבניינים' : `עגנון ${b}`

  return (
    <div>
      {!showForm && (
        <button onClick={openNew} style={{
          background:'var(--accent)', color:'white', border:'none',
          borderRadius:'100px', padding:'9px 20px', fontSize:'14px',
          fontWeight:'700', cursor:'pointer', fontFamily:'Heebo, sans-serif', marginBottom:'16px'
        }}>+ הודעה חדשה</button>
      )}

      {/* Form */}
      {showForm && (
        <div style={{background:'#f7f5f1', border:'1.5px solid var(--border)', borderRadius:'13px', padding:'18px', marginBottom:'18px'}}>
          <div style={{fontWeight:'700', fontSize:'15px', color:'var(--primary)', marginBottom:'14px'}}>
            {editingId ? '✏️ עריכת הודעה' : '+ הודעה חדשה'}
          </div>

          {/* Title + Date */}
          <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:'12px', marginBottom:'12px'}}>
            <div>
              <div style={lbl}>כותרת *</div>
              <input className="req-input" value={form.title}
                onChange={e => setForm(f=>({...f, title:e.target.value}))}
                placeholder="כותרת ההודעה" style={inp} />
            </div>
            <div>
              <div style={lbl}>תאריך *</div>
              <input className="req-input" value={form.date}
                onChange={e => setForm(f=>({...f, date:e.target.value}))}
                placeholder="DD/MM/YYYY" style={inp} dir="ltr" />
            </div>
          </div>

          {/* Building */}
          <div style={{marginBottom:'12px'}}>
            <div style={lbl}>לאיזה בניין?</div>
            <div style={{display:'flex', gap:'8px'}}>
              {[{v:'both',l:'🏢 שני הבניינים'},{v:'12',l:'🏠 עגנון 12'},{v:'14',l:'🏠 עגנון 14'}].map(opt => (
                <button key={opt.v}
                  className={`pro-tab-btn${form.building === opt.v ? ' active' : ''}`}
                  onClick={() => setForm(f=>({...f, building:opt.v}))}
                >{opt.l}</button>
              ))}
            </div>
          </div>

          {/* Text */}
          <div style={{marginBottom:'12px'}}>
            <div style={lbl}>תוכן ההודעה *</div>
            <textarea className="req-input" value={form.text}
              onChange={e => setForm(f=>({...f, text:e.target.value}))}
              placeholder="תוכן ההודעה..." rows={4}
              style={{...inp, resize:'vertical', minHeight:'100px'}} />
          </div>

          {/* File upload */}
          <div style={{marginBottom:'16px'}}>
            <div style={lbl}>קובץ מצורף (רשות)</div>
            {uploadedFile ? (
              <div style={{display:'flex', alignItems:'center', gap:'10px', background:'#f0fbf4', border:'1px solid #bce8cc', borderRadius:'10px', padding:'10px 14px'}}>
                <span style={{fontSize:'20px'}}>📎</span>
                <span style={{fontSize:'13px', fontWeight:'600', flex:1}}>{uploadedFile.name}</span>
                <button onClick={removeFile} style={{background:'none', border:'none', cursor:'pointer', color:'#e05555', fontSize:'18px'}}>✕</button>
              </div>
            ) : (
              <label style={{
                display:'flex', alignItems:'center', gap:'10px', background:'#fafaf8',
                border:'1.5px dashed var(--border)', borderRadius:'10px', padding:'12px 16px',
                cursor:'pointer', fontSize:'13px', color:'var(--muted)'
              }}>
                <span style={{fontSize:'20px'}}>📎</span>
                {uploading ? 'מעלה...' : 'לחצו להעלאת קובץ (PDF, תמונה וכד׳)'}
                <input type="file" style={{display:'none'}} onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif" disabled={uploading} />
              </label>
            )}
          </div>

          <div style={{display:'flex', gap:'10px'}}>
            <button onClick={save} disabled={saving} style={{
              background:'var(--primary)', color:'white', border:'none',
              borderRadius:'100px', padding:'9px 22px', fontSize:'14px',
              fontWeight:'700', cursor:'pointer', fontFamily:'Heebo, sans-serif'
            }}>{saving ? 'שומר...' : '💾 שמור'}</button>
            <button onClick={cancel} style={{
              background:'transparent', color:'var(--muted)', border:'1px solid var(--border)',
              borderRadius:'100px', padding:'9px 18px', fontSize:'14px',
              cursor:'pointer', fontFamily:'Heebo, sans-serif'
            }}>ביטול</button>
          </div>
        </div>
      )}

      {loading && <div style={{color:'var(--muted)'}}>טוען...</div>}
      {!loading && notices.length === 0 && (
        <div className="info-block" style={{textAlign:'center', color:'var(--muted)', padding:'28px'}}>📭 אין הודעות עדיין.</div>
      )}

      {notices.map(n => (
        <div key={n.id} style={{background:'#fafaf8', border:'1px solid var(--border)', borderRadius:'12px', padding:'14px 18px', marginBottom:'10px'}}>
          <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'12px'}}>
            <div style={{flex:1}}>
              <div style={{display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap', marginBottom:'5px'}}>
                <span style={{fontWeight:'700', fontSize:'15px', color:'var(--primary)'}}>{n.title}</span>
                <span style={{fontSize:'11px', background:'#e4edf8', color:'#1a3a5c', padding:'2px 8px', borderRadius:'100px', fontWeight:'700'}}>{buildingLabel(n.building)}</span>
                <span style={{fontSize:'12px', color:'var(--muted)'}}>{n.date}</span>
              </div>
              <div style={{fontSize:'13px', color:'var(--text)', lineHeight:'1.6', whiteSpace:'pre-line', marginBottom: n.file_url ? '8px' : 0}}>{n.text}</div>
              {n.file_url && (
                <a href={n.file_url} target="_blank" rel="noopener" style={{
                  display:'inline-flex', alignItems:'center', gap:'6px', fontSize:'12px',
                  color:'var(--accent2)', fontWeight:'600', textDecoration:'none'
                }}>📎 {n.file_name}</a>
              )}
            </div>
            <div style={{display:'flex', gap:'8px', flexShrink:0}}>
              <button onClick={() => openEdit(n)} style={{background:'#e4edf8', border:'none', borderRadius:'8px', padding:'7px 12px', cursor:'pointer', fontSize:'13px', fontFamily:'Heebo, sans-serif'}}>✏️</button>
              <button onClick={() => deleteNotice(n.id)} style={{background:'#fdf0f0', border:'none', borderRadius:'8px', padding:'7px 12px', cursor:'pointer', fontSize:'13px', fontFamily:'Heebo, sans-serif'}}>🗑️</button>
            </div>
          </div>
        </div>
      ))}
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
