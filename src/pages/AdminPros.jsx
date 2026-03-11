import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const EMPTY_PRO = { name: '', desc: '', phone: '', link_label: '', link_url: '', lives_in_building: false, active: true, categories: [] }
const EMPTY_CAT = { id: '', label: '' }

export default function AdminPros() {
  const [pros, setPros] = useState([])
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('pros') // 'pros' | 'cats'

  // Pro form
  const [showProForm, setShowProForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_PRO)
  const [saving, setSaving] = useState(false)

  // Category form
  const [showCatForm, setShowCatForm] = useState(false)
  const [editingCatId, setEditingCatId] = useState(null)
  const [catForm, setCatForm] = useState(EMPTY_CAT)
  const [savingCat, setSavingCat] = useState(false)

  const [filterCat, setFilterCat] = useState('all')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const [{ data: catData }, { data: proData }] = await Promise.all([
      supabase.from('pro_categories').select('*').order('label'),
      supabase.from('professionals').select('*').order('id'),
    ])
    setCats(catData || [])
    setPros(proData || [])
    setLoading(false)
  }

  // ── Pro CRUD ──
  const openNewPro = () => { setForm(EMPTY_PRO); setEditingId(null); setShowProForm(true) }
  const openEditPro = (p) => {
    setForm({ name: p.name||'', desc: p.desc||'', phone: p.phone||'',
      link_label: p.link_label||'', link_url: p.link_url||'',
      lives_in_building: p.lives_in_building||false, active: p.active!==false,
      categories: p.categories||[] })
    setEditingId(p.id); setShowProForm(true)
  }
  const cancelPro = () => { setShowProForm(false); setEditingId(null); setForm(EMPTY_PRO) }

  const savePro = async () => {
    if (!form.name || form.categories.length === 0) return
    setSaving(true)
    const payload = {
      name: form.name, "desc": form.desc||null, phone: form.phone||null,
      link_label: form.link_label||null, link_url: form.link_url||null,
      lives_in_building: form.lives_in_building, active: form.active,
      categories: form.categories,
    }
    if (editingId) await supabase.from('professionals').update(payload).eq('id', editingId)
    else await supabase.from('professionals').insert([payload])
    setSaving(false); cancelPro(); load()
  }

  const toggleCatInForm = (catId) => {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(catId)
        ? f.categories.filter(c => c !== catId)
        : [...f.categories, catId]
    }))
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

  // ── Category CRUD ──
  const openNewCat = () => { setCatForm(EMPTY_CAT); setEditingCatId(null); setShowCatForm(true) }
  const openEditCat = (c) => { setCatForm({ id: c.id, label: c.label }); setEditingCatId(c.id); setShowCatForm(true) }
  const cancelCat = () => { setShowCatForm(false); setEditingCatId(null); setCatForm(EMPTY_CAT) }

  const saveCat = async () => {
    if (!catForm.label) return
    setSavingCat(true)
    if (editingCatId) {
      await supabase.from('pro_categories').update({ label: catForm.label }).eq('id', editingCatId)
    } else {
      const newId = catForm.label.trim().toLowerCase().replace(/\s+/g,'-').replace(/[^\w-]/g,'') || Date.now().toString()
      await supabase.from('pro_categories').insert([{ id: newId, label: catForm.label }])
    }
    setSavingCat(false); cancelCat(); load()
  }

  const deleteCat = async (id) => {
    if (!window.confirm('למחוק קטגוריה זו?')) return
    await supabase.from('pro_categories').delete().eq('id', id)
    load()
  }

  const u = (f, v) => setForm(p => ({ ...p, [f]: v }))

  const displayed = filterCat === 'all' ? pros : pros.filter(p => p.categories?.includes(filterCat))
  const catName = (id) => cats.find(c => c.id === id)?.label || id

  return (
    <div>
      {/* Sub-tabs */}
      <div className="ctab-bar">
        <button className={`ctab-btn${view === 'pros' ? ' active' : ''}`} onClick={() => setView('pros')}>⭐ בעלי מקצוע</button>
        <button className={`ctab-btn${view === 'cats' ? ' active' : ''}`} onClick={() => setView('cats')}>🏷️ קטגוריות</button>
      </div>
      <div className="ctab-body">

      {/* ── CATEGORIES VIEW ── */}
      {view === 'cats' && <>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px'}}>
          <div style={{fontWeight:'700', fontSize:'15px', color:'var(--primary)'}}>ניהול קטגוריות</div>
          {!showCatForm && (
            <button onClick={openNewCat} style={addBtn}>+ קטגוריה חדשה</button>
          )}
        </div>

        {showCatForm && (
          <div style={formBox}>
            <div style={{fontWeight:'700', fontSize:'14px', color:'var(--primary)', marginBottom:'12px'}}>
              {editingCatId ? '✏️ עריכת קטגוריה' : '+ קטגוריה חדשה'}
            </div>
            <div style={{marginBottom:'12px'}}>
              <div style={lbl}>שם הקטגוריה *</div>
              <input value={catForm.label} onChange={e => setCatForm(f => ({...f, label: e.target.value}))}
                placeholder="לדוגמה: חשמלאי" style={inp} />
            </div>
            <div style={{display:'flex', gap:'8px'}}>
              <button onClick={saveCat} disabled={savingCat} style={saveBtn}>{savingCat ? 'שומר...' : '💾 שמור'}</button>
              <button onClick={cancelCat} style={cancelBtnStyle}>ביטול</button>
            </div>
          </div>
        )}

        {loading ? <div style={{color:'var(--muted)'}}>טוען...</div> : (
          cats.map(c => (
            <div key={c.id} style={rowBox}>
              <div style={{fontWeight:'600', fontSize:'14px'}}>{c.label}</div>
              <div style={{display:'flex', gap:'6px'}}>
                <button onClick={() => openEditCat(c)} style={iconBtn}>✏️</button>
                <button onClick={() => deleteCat(c.id)} style={{...iconBtn, background:'#fdf0f0'}}>🗑️</button>
              </div>
            </div>
          ))
        )}
      </>}

      {/* ── PROS VIEW ── */}
      {view === 'pros' && <>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px', flexWrap:'wrap', gap:'8px'}}>
          <div style={{fontWeight:'700', fontSize:'15px', color:'var(--primary)'}}>בעלי מקצוע</div>
          {!showProForm && <button onClick={openNewPro} style={addBtn}>+ הוסף</button>}
        </div>

        {showProForm && (
          <div style={formBox}>
            <div style={{fontWeight:'700', fontSize:'14px', color:'var(--primary)', marginBottom:'14px'}}>
              {editingId ? '✏️ עריכה' : '+ בעל מקצוע חדש'}
            </div>

            <div style={{marginBottom:'12px'}}>
              <div style={lbl}>קטגוריות * (ניתן לבחור כמה)</div>
              <div style={{display:'flex', gap:'6px', flexWrap:'wrap'}}>
                {cats.map(c => (
                  <button key={c.id}
                    className={`pro-tab-btn${form.categories.includes(c.id) ? ' active' : ''}`}
                    onClick={() => toggleCatInForm(c.id)}
                    style={{fontSize:'12px', padding:'5px 10px'}}>
                    {c.label}
                  </button>
                ))}
              </div>
              {form.categories.length === 0 && (
                <div style={{fontSize:'11px', color:'#e05555', marginTop:'5px'}}>יש לבחור לפחות קטגוריה אחת</div>
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
                style={{...inp, resize:'vertical', minHeight:'56px'}} />
            </div>

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'14px'}}>
              <div>
                <div style={lbl}>תווית קישור</div>
                <input value={form.link_label} onChange={e => u('link_label', e.target.value)} placeholder="📷 אינסטגרם" style={inp} />
              </div>
              <div>
                <div style={lbl}>כתובת URL</div>
                <input value={form.link_url} onChange={e => u('link_url', e.target.value)} placeholder="https://..." style={inp} dir="ltr" />
              </div>
            </div>

            <div style={{display:'flex', gap:'20px', marginBottom:'16px', flexWrap:'wrap'}}>
              <label style={checkLabel}>
                <input type="checkbox" checked={form.lives_in_building} onChange={e => u('lives_in_building', e.target.checked)} style={{width:'16px',height:'16px'}} />
                ⭐ גר/ה בבניין
              </label>
              <label style={checkLabel}>
                <input type="checkbox" checked={form.active} onChange={e => u('active', e.target.checked)} style={{width:'16px',height:'16px'}} />
                פעיל (מוצג לדיירים)
              </label>
            </div>

            <div style={{display:'flex', gap:'10px'}}>
              <button onClick={savePro} disabled={saving} style={saveBtn}>{saving ? 'שומר...' : '💾 שמור'}</button>
              <button onClick={cancelPro} style={cancelBtnStyle}>ביטול</button>
            </div>
          </div>
        )}

        {/* Filter */}
        {!showProForm && (
          <div style={{display:'flex', gap:'6px', marginBottom:'14px', flexWrap:'wrap'}}>
            <button className={`pro-tab-btn${filterCat==='all'?' active':''}`}
              onClick={() => setFilterCat('all')} style={{fontSize:'12px'}}>הכל ({pros.length})</button>
            {cats.filter(c => pros.some(p => p.categories?.includes(c.id))).map(c => (
              <button key={c.id}
                className={`pro-tab-btn${filterCat===c.id?' active':''}`}
                onClick={() => setFilterCat(c.id)} style={{fontSize:'12px'}}>{c.label}</button>
            ))}
          </div>
        )}

        {loading && <div style={{color:'var(--muted)', fontSize:'13px'}}>טוען...</div>}

        {displayed.map(p => (
          <div key={p.id} style={{...rowBox, flexDirection:'column', alignItems:'stretch', opacity: p.active ? 1 : 0.6}}>
            <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'8px'}}>
              <div style={{flex:1}}>
                <div style={{display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap', marginBottom:'4px'}}>
                  <span style={{fontWeight:'700', fontSize:'14px', color:'var(--primary)'}}>{p.name}</span>
                  {(p.categories||[]).map(cid => (
                    <span key={cid} style={{fontSize:'11px', background:'#e4edf8', color:'#1a3a5c', padding:'2px 7px', borderRadius:'100px', fontWeight:'700'}}>
                      {catName(cid)}
                    </span>
                  ))}
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
                <button onClick={() => openEditPro(p)} style={iconBtn}>✏️</button>
                <button onClick={() => toggleActive(p)} style={iconBtn} title={p.active?'הסתר':'הצג'}>{p.active?'🙈':'👁️'}</button>
                <button onClick={() => deletePro(p.id)} style={{...iconBtn, background:'#fdf0f0'}}>🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </>}
      </div>
    </div>
  )
}

const lbl = { fontSize:'12px', fontWeight:'700', color:'var(--muted)', marginBottom:'5px' }
const inp = { width:'100%', padding:'9px 12px', borderRadius:'9px', border:'1.5px solid var(--border)', fontSize:'13px', fontFamily:'Heebo, sans-serif', background:'#fafaf8', outline:'none', boxSizing:'border-box', color:'var(--text)' }
const addBtn = { background:'var(--primary)', color:'white', border:'none', borderRadius:'100px', padding:'8px 18px', fontSize:'13px', fontWeight:'700', cursor:'pointer', fontFamily:'Heebo, sans-serif' }
const saveBtn = { background:'var(--primary)', color:'white', border:'none', borderRadius:'100px', padding:'9px 22px', fontSize:'13px', fontWeight:'700', cursor:'pointer', fontFamily:'Heebo, sans-serif' }
const cancelBtnStyle = { background:'transparent', color:'var(--muted)', border:'1px solid var(--border)', borderRadius:'100px', padding:'9px 18px', fontSize:'13px', cursor:'pointer', fontFamily:'Heebo, sans-serif' }
const iconBtn = { background:'#f0ede8', border:'none', borderRadius:'8px', padding:'6px 10px', cursor:'pointer', fontSize:'12px' }
const formBox = { background:'#f7f5f1', border:'1.5px solid var(--border)', borderRadius:'13px', padding:'18px', marginBottom:'18px' }
const rowBox = { display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px', background:'#fafaf8', border:'1px solid var(--border)', borderRadius:'12px', padding:'12px 16px', marginBottom:'8px' }
const checkLabel = { display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'14px' }
