import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase.js'

const CATEGORIES = {
  vaad:     'הודעות ועד',
  protocol: 'פרוטוקולים',
  meeting:  'סיכומי פגישות',
  legal:    'מסמכים משפטיים',
  general:  'כללי',
}

const btn = (extra = {}) => ({
  fontFamily: 'Heebo, sans-serif', border: 'none', borderRadius: '8px',
  padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', ...extra
})
const inp = (extra = {}) => ({
  width: '100%', padding: '9px 12px', borderRadius: '9px', border: '1.5px solid var(--border)',
  fontSize: '14px', fontFamily: 'Heebo, sans-serif', background: '#fafaf8',
  boxSizing: 'border-box', ...extra
})
const lbl = { fontSize: '11px', fontWeight: '700', color: 'var(--muted)', marginBottom: '5px', display: 'block' }

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function AdminDocuments() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const fileRef = useRef()

  const [form, setForm] = useState({
    title: '', publish_date: '', category: 'general', building: 'both'
  })
  const [file, setFile] = useState(null)
  const f = k => e => setForm(x => ({ ...x, [k]: e.target.value }))

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('documents').select('*').order('publish_date', { ascending: false })
    setDocs(data || [])
    setLoading(false)
  }

  const upload = async () => {
    if (!form.title.trim() || !form.publish_date || !file) return
    setUploading(true)
    try {
      // Upload file to storage
      const ext = file.name.split('.').pop()
      const safeName = `${Date.now()}-${file.name.replace(/[^א-תa-zA-Z0-9._-]/g, '_')}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents').upload(safeName, file, { contentType: file.type, upsert: false })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(safeName)

      // Insert record
      await supabase.from('documents').insert([{
        title: form.title.trim(),
        publish_date: form.publish_date,
        file_url: urlData.publicUrl,
        file_name: file.name,
        category: form.category,
        building: form.building,
      }])

      setShowForm(false)
      setForm({ title: '', publish_date: '', category: 'general', building: 'both' })
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      await load()
    } catch (err) {
      alert('שגיאה בהעלאה: ' + (err.message || err))
    }
    setUploading(false)
  }

  const deleteDoc = async (doc) => {
    if (!confirm(`למחוק את "${doc.title}"?`)) return
    setDeleting(doc.id)
    // Delete from storage
    const fileName = doc.file_url.split('/').pop()
    await supabase.storage.from('documents').remove([fileName])
    await supabase.from('documents').delete().eq('id', doc.id)
    await load()
    setDeleting(null)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--primary)' }}>📁 מסמכים ופרוטוקולים</div>
        <button onClick={() => setShowForm(v => !v)}
          style={btn({ background: 'var(--primary)', color: 'white', padding: '9px 18px' })}>
          {showForm ? '✕ ביטול' : '+ הוסף מסמך'}
        </button>
      </div>

      {/* Upload form */}
      {showForm && (
        <div style={{ background: '#f7f9ff', border: '1.5px solid #c4d4f0', borderRadius: '12px', padding: '18px', marginBottom: '20px' }}>
          <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--primary)', marginBottom: '14px' }}>📤 העלאת מסמך חדש</div>

          <div style={{ marginBottom: '12px' }}>
            <span style={lbl}>כותרת המסמך *</span>
            <input value={form.title} onChange={f('title')} placeholder="למשל: מכתב עדכון ועד בית – פברואר 2026"
              style={inp()} />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <span style={lbl}>תאריך פרסום *</span>
              <input type="date" value={form.publish_date} onChange={f('publish_date')} style={inp()} />
            </div>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <span style={lbl}>קטגוריה</span>
              <select value={form.category} onChange={f('category')}
                style={{ ...inp(), cursor: 'pointer' }}>
                {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '120px' }}>
              <span style={lbl}>בניין</span>
              <select value={form.building} onChange={f('building')}
                style={{ ...inp(), cursor: 'pointer' }}>
                <option value="both">שני הבניינים</option>
                <option value="12">עגנון 12</option>
                <option value="14">עגנון 14</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <span style={lbl}>קובץ (PDF) *</span>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx"
              onChange={e => setFile(e.target.files[0] || null)}
              style={{ ...inp(), padding: '7px 12px', cursor: 'pointer' }} />
            {file && <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>✅ {file.name} ({(file.size / 1024).toFixed(0)} KB)</div>}
          </div>

          <button onClick={upload} disabled={uploading || !form.title || !form.publish_date || !file}
            style={btn({
              background: uploading || !form.title || !form.publish_date || !file ? '#ccc' : '#1a7a3a',
              color: 'white', padding: '10px 24px', fontSize: '14px',
              cursor: uploading || !form.title || !form.publish_date || !file ? 'not-allowed' : 'pointer',
            })}>
            {uploading ? '📤 מעלה...' : '📤 העלה מסמך'}
          </button>
        </div>
      )}

      {/* Documents list */}
      {loading && <div style={{ color: 'var(--muted)', fontSize: '14px', padding: '20px 0' }}>טוען...</div>}

      {!loading && docs.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '14px', padding: '30px' }}>
          אין מסמכים עדיין. לחץ על "+ הוסף מסמך" להתחיל.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {docs.map(doc => (
          <div key={doc.id} style={{
            background: 'white', border: '1px solid var(--border)', borderRadius: '10px',
            padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <div style={{ fontSize: '22px', flexShrink: 0 }}>
              {{ vaad: '📣', protocol: '📋', meeting: '🤝', legal: '⚖️', general: '📄' }[doc.category] || '📄'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text)', marginBottom: '3px' }}>{doc.title}</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span>📅 {formatDate(doc.publish_date)}</span>
                <span>{CATEGORIES[doc.category] || doc.category}</span>
                <span>{doc.building === 'both' ? 'שני הבניינים' : `עגנון ${doc.building}`}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                style={btn({ background: '#e4edf8', color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' })}>
                👁️
              </a>
              <button onClick={() => deleteDoc(doc)} disabled={deleting === doc.id}
                style={btn({ background: '#fdf0f0', color: '#e05555' })}>
                {deleting === doc.id ? '...' : '🗑️'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
