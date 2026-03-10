import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const CATEGORY_OPTIONS = [
  { id: 'handyman',  label: '🔨 הנדימן' },
  { id: 'ac',        label: '❄️ מיזוג אוויר' },
  { id: 'carpenter', label: '🪚 נגרות' },
  { id: 'shower',    label: '🚿 מקלחונים' },
  { id: 'door',      label: '🚪 דלת ממ״ד' },
  { id: 'shelves',   label: '📦 מדפים' },
  { id: 'taxi',      label: '🚕 מונית' },
  { id: 'beauty',    label: '💆 קוסמטיקה' },
  { id: 'nails',     label: '💅 לק ג׳ל' },
  { id: 'pilates',   label: '🧘 פילאטיס' },
]

const EMPTY = { category: 'handyman', name: '', desc: '', phone: '', link_label: '', link_url: '', lives_in_building: false, active: true, customCategory: '' }

export default function AdminPros() {
  const [pros, setPros] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [filterCat, setFilterCat] = useState('all')
  const [isCustomCat, setIsCustomCat] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('professionals').select('*').order('category').order('id')
    setPros(data || [])
    setLoading(false)
  }

  const openNew = () => {
    setForm(EMPTY); setEditingId(null); setIsCustomCat(false); setShowForm(true)
  }

  const openEdit = (p) => {
    const known = CATEGORY_OPTIONS.find(c => c.id === p.category)
    setIsCustomCat(!known)
    setForm({
      category: known ? p.category : 'custom',
      name: p.name || '',
      desc: p.desc || '',
      phone: p.phone || '',
      link_label: p.link_label || '',
      link_url: p.link_url || '',
      lives_in_building: p.lives_in_building || false,
      active: p.active !== false,
      customCategory: !known ? p.category : '',
    })
    setEditingId(p.id); setShowForm(true)
  }

  const cancel = () => { setShowForm(false); setEditingId(null); setForm(EMPTY) }

  const save = async () => {
    if (!form.name || !form.category) return
    setSaving(true)
    const finalCat = isCustomCat ? form.customCategory : form.category
    const payload = {
      category: finalCat,
      name: form.name,
      "desc": form.desc || null,
      phone: form.phone || null,
      link_label: form.link_label || null,
      link_url: form.link_url || null,
      lives_in_building: form.lives_in_building,
      active: form.active,
    }
    if (editingId) {
      await supabase.from('professionals').update(payload).eq('id', editingId)
    } else {
      await supabase.from('professionals').insert([payload])
    }
    setSaving(false); cancel(); load()
  }

  const toggleActive = async (p) => {
    await supabase.from('professionals').update({ active: !p.active }).eq('id', p.id)
    setPros(ps => ps.map(x => x.id === p.id ? { ...x, active: !p.active } : x))
  }

  const deletePro = async (id) => {
    if (!window.confirm('למחוק בעל מקצוע זה?')) return
    await supabase.from('professionals').delete().eq('id', id)
    setPros(ps => ps.filter(x => x.id !== id))
  }

  const u = (f, v) => setForm(prev => ({ ...prev, [f]: v }))

  // Get all categories including custom ones
  const allCats = [...CATEGORY_OPTIONS]
  pros.forEach(p => {
    if (!CATEGORY_OPTIONS.find(c => c.id === p.category) && !allCats.find(c => c.id === p.category)) {
      allCats.push({ id: p.category, label: p.category })
    }
  })

  const displayed = filterCat === 'all' ? pros : pros.filter(p => p.category === filterCat)

  return (
    <div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px', flexWrap:'wrap', gap:'8px'}}>
        <div style={{fontWeight:'700', fontSize:'15px', color:'var(--primary)'}}>בעלי מקצוע מומלצים</div>
        {!showForm && (
          <button onClick={openNew} style={{
            background:'var(--primary)', color:'white', border:'none',
            borderRadius:'100px', padding:'8px 18px', fontSize:'13px',
            fontWeight:'700', cursor:'pointer', fontFamily:'Heebo, sans-serif'
          }}>+ הוסף</button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div style={{background:'#f7f5f1', border:'1.5px solid var(--border)', borderRadius:'13px', padding:'18px', marginBottom:'18px'}}>
          <div style={{fontWeight:'700', fontSize:'14px', color:'var(--primary)', marginBottom:'14px'}}>
            {editingId ? '✏️ עריכה' : '+ בעל מקצוע חדש'}
          </div>

          <div style={{marginBottom:'10px'}}>
            <div style={lbl}>קטגוריה *</div>
            <div style={{display:'flex', gap:'8px', flexWrap:'wrap', marginBottom: isCustomCat ? '8px' : 0}}>
              {CATEGORY_OPTIONS.map(c => (
                <button key={c.id}
                  className={`pro-tab-btn${form.category === c.id && !isCustomCat ? ' active' : ''}`}
                  onClick={() => { u('category', c.id); setIsCustomCat(false) }}
                  style={{fontSize:'12px', padding:'5px 10px'}}>{c.label}</button>
              ))}
              <button
                className={`pro-tab-btn${isCustomCat ? ' active' : ''}`}
                onClick={() => { u('category', 'custom'); setIsCustomCat(true) }}
                style={{fontSize:'12px', padding:'5px 10px'}}>➕ חדשה</button>
            </div>
            {isCustomCat && (
              <input value={form.customCategory} onChange={e => u('customCategory', e.target.value)}
                placeholder="שם הקטגוריה החדשה" style={{...inp, marginTop:'8px'}} />
            )}
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px'}}>
            <div>
              <div style={lbl}>שם *</div>
              <input value={form.name} onChange={e => u('name', e.target.value)} placeholder="שם העסק" style={inp} />
            </div>
            <div>
              <div style={lbl}>טלפון</div>
              <input value={form.phone} onChange={e => u('phone', e.target.value)} placeholder="050-0000000" style={inp} dir="ltr" />
            </div>
          </div>

          <div style={{marginBottom:'10px'}}>
            <div style={lbl}>תיאור</div>
            <textarea value={form.desc} onChange={e => u('desc', e.target.value)}
              placeholder="תיאור קצר..." rows={2}
              style={{...inp, resize:'vertical', minHeight:'60px'}} />
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'14px'}}>
            <div>
              <div style={lbl}>תווית קישור (אתר / אינסטגרם)</div>
              <input value={form.link_label} onChange={e => u('link_label', e.target.value)} placeholder="📷 אינסטגרם" style={inp} />
            </div>
            <div>
              <div style={lbl}>כתובת URL</div>
              <input value={form.link_url} onChange={e => u('link_url', e.target.value)} placeholder="https://..." style={inp} dir="ltr" />
            </div>
          </div>

          <div style={{display:'flex', gap:'20px', marginBottom:'16px', flexWrap:'wrap'}}>
            <label style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'14px'}}>
              <input type="checkbox" checked={form.lives_in_building}
                onChange={e => u('lives_in_building', e.target.checked)}
                style={{width:'16px', height:'16px'}} />
              ⭐ גר/ה בבניין
            </label>
            <label style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'14px'}}>
              <input type="checkbox" checked={form.active}
                onChange={e => u('active', e.target.checked)}
                style={{width:'16px', height:'16px'}} />
              פעיל (מוצג לדיירים)
            </label>
          </div>

          <div style={{display:'flex', gap:'10px'}}>
            <button onClick={save} disabled={saving} style={{
              background:'var(--primary)', color:'white', border:'none',
              borderRadius:'100px', padding:'9px 22px', fontSize:'13px',
              fontWeight:'700', cursor:'pointer', fontFamily:'Heebo, sans-serif'
            }}>{saving ? 'שומר...' : '💾 שמור'}</button>
            <button onClick={cancel} style={{
              background:'transparent', color:'var(--muted)', border:'1px solid var(--border)',
              borderRadius:'100px', padding:'9px 18px', fontSize:'13px',
              cursor:'pointer', fontFamily:'Heebo, sans-serif'
            }}>ביטול</button>
          </div>
        </div>
      )}

      {/* Filter by category */}
      {!showForm && (
        <div style={{display:'flex', gap:'6px', marginBottom:'14px', flexWrap:'wrap'}}>
          <button className={`pro-tab-btn${filterCat === 'all' ? ' active' : ''}`}
            onClick={() => setFilterCat('all')} style={{fontSize:'12px'}}>הכל ({pros.length})</button>
          {allCats.filter(c => pros.some(p => p.category === c.id)).map(c => (
            <button key={c.id}
              className={`pro-tab-btn${filterCat === c.id ? ' active' : ''}`}
              onClick={() => setFilterCat(c.id)} style={{fontSize:'12px'}}>{c.label}</button>
          ))}
        </div>
      )}

      {loading && <div style={{color:'var(--muted)', fontSize:'13px'}}>טוען...</div>}

      {displayed.map(p => (
        <div key={p.id} style={{
          background: p.active ? '#fafaf8' : '#f5f5f5',
          border: '1px solid var(--border)', borderRadius:'12px',
          padding:'12px 16px', marginBottom:'8px',
          opacity: p.active ? 1 : 0.6,
        }}>
          <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'8px'}}>
            <div style={{flex:1}}>
              <div style={{display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap', marginBottom:'4px'}}>
                <span style={{fontWeight:'700', fontSize:'14px', color:'var(--primary)'}}>{p.name}</span>
                <span style={{fontSize:'11px', background:'#e4edf8', color:'#1a3a5c', padding:'2px 7px', borderRadius:'100px', fontWeight:'700'}}>
                  {CATEGORY_OPTIONS.find(c => c.id === p.category)?.label || p.category}
                </span>
                {p.lives_in_building && <span style={{fontSize:'11px', background:'#fff3b0', color:'#7a5c00', padding:'2px 7px', borderRadius:'100px', fontWeight:'700'}}>⭐ גר/ה בבניין</span>}
                {!p.active && <span style={{fontSize:'11px', background:'#f0ede8', color:'var(--muted)', padding:'2px 7px', borderRadius:'100px'}}>מוסתר</span>}
              </div>
              {p.desc && <div style={{fontSize:'12px', color:'var(--muted)', lineHeight:'1.5', marginBottom:'4px'}}>{p.desc}</div>}
              <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
                {p.phone && <span style={{fontSize:'12px', color:'var(--accent2)', fontWeight:'600'}}>📞 {p.phone}</span>}
                {p.link_url && <span style={{fontSize:'12px', color:'var(--accent2)'}}>{p.link_label || p.link_url}</span>}
              </div>
            </div>
            <div style={{display:'flex', gap:'6px', flexShrink:0}}>
              <button onClick={() => openEdit(p)}
                style={{background:'#e4edf8', border:'none', borderRadius:'8px', padding:'6px 10px', cursor:'pointer', fontSize:'12px'}}>✏️</button>
              <button onClick={() => toggleActive(p)}
                style={{background:'#f0ede8', border:'none', borderRadius:'8px', padding:'6px 10px', cursor:'pointer', fontSize:'12px'}}
                title={p.active ? 'הסתר' : 'הצג'}>
                {p.active ? '🙈' : '👁️'}
              </button>
              <button onClick={() => deletePro(p.id)}
                style={{background:'#fdf0f0', border:'none', borderRadius:'8px', padding:'6px 10px', cursor:'pointer', fontSize:'12px'}}>🗑️</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const lbl = { fontSize:'12px', fontWeight:'700', color:'var(--muted)', marginBottom:'5px' }
const inp = {
  width:'100%', padding:'9px 12px', borderRadius:'9px',
  border:'1.5px solid var(--border)', fontSize:'13px',
  fontFamily:'Heebo, sans-serif', background:'#fafaf8',
  outline:'none', boxSizing:'border-box', color:'var(--text)',
}
