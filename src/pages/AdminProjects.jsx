import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase.js'

function clean(v) { return v === null || v === undefined ? '' : String(v) }

const btn = (extra = {}) => ({
  padding: '8px 14px', borderRadius: '9px', border: 'none',
  cursor: 'pointer', fontFamily: 'Heebo, sans-serif', fontWeight: '700',
  fontSize: '13px', transition: 'all 0.15s', ...extra,
})

// ─── ItemModal ─────────────────────────────────────────────
function ItemModal({ apt, projectId, pricePerUnit, unitLabel, residents, existingItem, onSave, onClose }) {
  const [quantity, setQuantity] = useState(existingItem?.quantity || 1)
  const [notes, setNotes] = useState(existingItem?.notes || '')
  const [saving, setSaving] = useState(false)
  const mainRes = residents.find(r => r.role === 'tenant') || residents.find(r => r.role === 'owner')
  const total = quantity * pricePerUnit

  const save = async () => {
    setSaving(true)
    const payload = {
      project_id: projectId, building: apt.building, apt: apt.apt,
      status: 'paid',
      quantity: parseInt(quantity) || 1,
      amount_paid: (parseInt(quantity) || 1) * pricePerUnit,
      notes: notes || null,
      paid_at: new Date().toISOString(),
    }
    if (existingItem?.id) {
      await supabase.from('apt_project_items').update(payload).eq('id', existingItem.id)
    } else {
      await supabase.from('apt_project_items').upsert([payload], { onConflict: 'project_id,building,apt' })
    }
    setSaving(false)
    onSave()
  }

  const del = async () => {
    if (!existingItem?.id) return
    if (!window.confirm('למחוק רשומה זו?')) return
    await supabase.from('apt_project_items').delete().eq('id', existingItem.id)
    onSave()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '360px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ background: 'var(--primary)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '15px', color: 'white' }}>בניין {apt.building} · דירה {apt.apt}</div>
            {mainRes && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', marginTop: '2px' }}>{mainRes.name}{mainRes.phone ? ` · ${mainRes.phone}` : ''}</div>}
          </div>
          <button onClick={onClose} style={btn({ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 10px' })}>✕</button>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)', marginBottom: '10px' }}>כמות {unitLabel}?</div>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              {[1,2,3,4].map(n => (
                <button key={n} onClick={() => setQuantity(n)} style={{
                  flex: 1, padding: '14px 0', border: 'none',
                  background: quantity === n ? 'var(--primary)' : 'white',
                  color: quantity === n ? 'white' : 'var(--text)',
                  fontWeight: '800', fontSize: '18px', cursor: 'pointer',
                  fontFamily: 'Heebo, sans-serif',
                  borderLeft: n > 1 ? '1px solid var(--border)' : 'none',
                  transition: 'all 0.15s',
                }}>{n}</button>
              ))}
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #e8f9ee, #f0fbf4)',
            border: '1.5px solid #bce8cc', borderRadius: '12px',
            padding: '14px 18px', marginBottom: '16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#1a7a3a', fontWeight: '600' }}>{quantity} {unitLabel} × ₪{pricePerUnit}</div>
              <div style={{ fontSize: '11px', color: '#1a7a3a', opacity: 0.7, marginTop: '2px' }}>סכום לתשלום</div>
            </div>
            <div style={{ fontWeight: '900', fontSize: '26px', color: '#1a7a3a' }}>₪{total}</div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)', marginBottom: '6px' }}>הערות (רשות)</div>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="למשל: שולם במזומן..."
              style={{ width: '100%', padding: '9px 12px', borderRadius: '9px', border: '1.5px solid var(--border)', fontSize: '14px', fontFamily: 'Heebo, sans-serif', background: '#fafaf8', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={save} disabled={saving} style={btn({ background: 'var(--primary)', color: 'white', flex: 1, padding: '11px', fontSize: '14px' })}>
              {saving ? 'שומר...' : `✅ אישור תשלום ₪${total}`}
            </button>
            {existingItem?.id && <button onClick={del} style={btn({ background: '#fdf0f0', color: '#e05555' })}>🗑️</button>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── SmartAddInput ─────────────────────────────────────────
function SmartAddInput({ onSearch, onSelect, items }) {
  const [input, setInput] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const search = (val) => {
    setInput(val)
    if (val.length >= 2) {
      setResults(onSearch(val))
      setOpen(true)
    } else {
      setResults([])
      setOpen(false)
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative', marginBottom: '14px' }}>
      <input value={input} onChange={e => search(e.target.value)}
        placeholder="🔍 חפש שם או טלפון להוספה מהירה..."
        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', fontSize: '14px', fontFamily: 'Heebo, sans-serif', background: '#fafaf8', boxSizing: 'border-box' }} />
      {open && results.length > 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, left: 0, background: 'white', border: '1px solid var(--border)', borderRadius: '12px', zIndex: 100, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
          {results.map((a, i) => {
            const alreadyPaid = items.find(it => it.building === a.building && it.apt === a.apt && (it.status === 'paid' || it.status === 'done'))
            return (
              <div key={i} onClick={() => { if (!alreadyPaid) { onSelect(a); setInput(''); setOpen(false) } }}
                style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: alreadyPaid ? 'default' : 'pointer', borderBottom: '1px solid var(--border)', background: alreadyPaid ? '#f7f5f1' : 'white' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: alreadyPaid ? 'var(--muted)' : 'var(--primary)' }}>
                    בנ׳ {a.building} · דירה {a.apt}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '1px' }}>{clean(a.resident?.name)} · {clean(a.resident?.phone)}</div>
                </div>
                {alreadyPaid
                  ? <span style={{ fontSize: '11px', color: '#1a7a3a', fontWeight: '700' }}>✅ שולם</span>
                  : <span style={{ fontSize: '11px', color: 'var(--accent2)', fontWeight: '700' }}>+ רשום</span>}
              </div>
            )
          })}
        </div>
      )}
      {open && results.length === 0 && input.length >= 2 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, left: 0, background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', textAlign: 'center', fontSize: '13px', color: 'var(--muted)' }}>
          לא נמצאה דירה תואמת
        </div>
      )}
    </div>
  )
}

// ─── Main AdminProjects ────────────────────────────────────
export default function AdminProjects() {
  const [projects, setProjects] = useState([])
  const [activeProject, setActiveProject] = useState(null)
  const [items, setItems] = useState([])
  const [apartments, setApartments] = useState([])
  const [residents, setResidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewProject, setShowNewProject] = useState(false)
  const [newForm, setNewForm] = useState({ name: '', description: '', price_per_unit: '90', unit_label: 'יחידות' })
  const [buildingFilter, setBuildingFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [addModal, setAddModal] = useState(null)
  const [editModal, setEditModal] = useState(null)
  const [showArchive, setShowArchive] = useState(false)

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    const [{ data: apts }, { data: res }, { data: projs }] = await Promise.all([
      supabase.from('apartments').select('*').order('building').order('apt'),
      supabase.from('residents').select('*'),
      supabase.from('apt_projects').select('*').order('created_at', { ascending: false }),
    ])
    setApartments(apts || [])
    setResidents(res || [])
    setProjects(projs || [])
    if (projs?.length > 0) {
      const active = projs.filter(p => !p.archived)
      setActiveProject(p => p || active[0] || null)
    }
    setLoading(false)
  }

  const archiveProject = async (p) => {
    if (!window.confirm(`להעביר את "${p.name}" לארכיון?`)) return
    await supabase.from('apt_projects').update({ archived: true }).eq('id', p.id)
    setActiveProject(null)
    await loadAll()
  }

  const unarchiveProject = async (p) => {
    if (!window.confirm(`להוציא את "${p.name}" מהארכיון?`)) return
    await supabase.from('apt_projects').update({ archived: false }).eq('id', p.id)
    await loadAll()
  }

  const deleteProjectPermanently = async (p) => {
    if (!window.confirm(`למחוק לצמיתות את "${p.name}"? פעולה זו אינה ניתנת לשחזור!`)) return
    await supabase.from('apt_project_items').delete().eq('project_id', p.id)
    await supabase.from('apt_projects').delete().eq('id', p.id)
    await loadAll()
  }

  const loadItems = async (projectId) => {
    const { data } = await supabase.from('apt_project_items').select('*').eq('project_id', projectId)
    setItems(data || [])
  }

  const toggleDelivered = async (e, item) => {
    e.stopPropagation()
    const newVal = !item.delivered
    await supabase.from('apt_project_items').update({ delivered: newVal }).eq('id', item.id)
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, delivered: newVal } : i))
  }

  useEffect(() => {
    if (activeProject) loadItems(activeProject.id)
  }, [activeProject])

  const createProject = async () => {
    const { name, description, price_per_unit, unit_label } = newForm
    if (!name.trim()) return
    const price = parseFloat(price_per_unit) || 90
    const { data } = await supabase.from('apt_projects')
      .insert([{ name: name.trim(), description: description.trim() || null, price_per_unit: price, unit_label: unit_label.trim() || 'יחידות' }])
      .select().single()
    setShowNewProject(false)
    setNewForm({ name: '', description: '', price_per_unit: '90', unit_label: 'יחידות' })
    await loadAll()
    if (data) setActiveProject(data)
  }

  const findAptByInput = (input) => {
    const q = input.trim().replace(/-/g, '')
    if (!q) return []
    const matches = []
    for (const r of residents) {
      const phone = clean(r.phone).replace(/-/g, '')
      const phone2 = clean(r.phone2).replace(/-/g, '')
      const name = clean(r.name).toLowerCase()
      if (phone.includes(q) || phone2.includes(q) || name.includes(q.toLowerCase())) {
        const apt = apartments.find(a => a.building === r.building && a.apt === r.apt)
        if (apt) matches.push({ ...apt, resident: r })
      }
    }
    return matches.slice(0, 5)
  }

  const getItem = (building, apt) => items.find(i => i.building === building && i.apt === apt)

  const pricePerUnit = activeProject?.price_per_unit || 90
  const unitLabel = activeProject?.unit_label || 'יחידות'

  const filteredApts = apartments.filter(a => {
    if (buildingFilter !== 'all' && a.building !== parseInt(buildingFilter)) return false
    if (!search.trim()) return true
    const q = search.toLowerCase().trim()
    if (String(a.apt).includes(q)) return true
    const res = residents.filter(r => r.building === a.building && r.apt === a.apt)
    return res.some(r => clean(r.name).toLowerCase().includes(q) || clean(r.phone).replace(/-/g,'').includes(q.replace(/-/g,'')))
  })

  const paidItems = items.filter(i => i.status === 'paid' || i.status === 'done')
  const paidCount = paidItems.length
  const totalUnits = paidItems.reduce((s, i) => s + (i.quantity || 1), 0)
  const totalMoney = paidItems.reduce((s, i) => s + (i.amount_paid || 0), 0)
  const totalApts = apartments.length

  const delivered12 = paidItems.filter(i => i.building === 12 && i.delivered)
  const delivered14 = paidItems.filter(i => i.building === 14 && i.delivered)
  const deliveredUnits12 = delivered12.reduce((s, i) => s + (i.quantity || 1), 0)
  const deliveredUnits14 = delivered14.reduce((s, i) => s + (i.quantity || 1), 0)

  const exportToExcel = () => {
    if (!activeProject) return
    const rows = [['בניין', 'דירה', 'קומה', 'שם', 'טלפון', 'שילם', `כמות ${unitLabel}`, 'סכום (₪)', 'הערות', 'תאריך']]
    apartments.sort((a,b) => a.building - b.building || a.apt - b.apt).forEach(a => {
      const item = getItem(a.building, a.apt)
      const res = residents.filter(r => r.building === a.building && r.apt === a.apt)
      const mainRes = res.find(r => r.role === 'tenant') || res.find(r => r.role === 'owner')
      const paid = item && (item.status === 'paid' || item.status === 'done')
      const qty = paid ? (item.quantity || 1) : 0
      rows.push([`עגנון ${a.building}`, a.apt, a.floor, clean(mainRes?.name || ''), clean(mainRes?.phone || ''),
        paid ? 'כן' : 'לא', paid ? qty : '', paid ? qty * pricePerUnit : '',
        clean(item?.notes || ''), item?.paid_at ? new Date(item.paid_at).toLocaleDateString('he-IL') : ''])
    })
    const paidR = rows.slice(1).filter(r => r[5] === 'כן')
    rows.push([], ['','','','','סה"כ שילמו:', paidR.length, totalUnits, totalMoney, '', ''])
    const csv = rows.map(r => r.map(c => { const s = String(c??''); return s.includes(',') ? `"${s}"` : s }).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `${activeProject.name}_${new Date().toLocaleDateString('he-IL').replace(/\//g, '-')}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  if (loading) return <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px', fontSize: '14px' }}>טוען...</div>

  const activeProjects = projects.filter(p => !p.archived)
  const archivedProjects = projects.filter(p => p.archived)

  if (showArchive) return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button onClick={() => setShowArchive(false)} style={btn({ background: '#f0ede8', color: 'var(--muted)' })}>← חזרה</button>
        <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--primary)' }}>🗄️ ארכיון פרויקטים</div>
      </div>
      {archivedProjects.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px', fontSize: '14px' }}>הארכיון ריק.</div>
      )}
      {archivedProjects.map(p => (
        <div key={p.id} style={{ background: '#f7f5f1', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', marginBottom: '10px' }}>
          <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--muted)', marginBottom: '4px' }}>📦 {p.name}</div>
          {p.description && <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '8px' }}>{p.description}</div>}
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>
            ₪{p.price_per_unit} / {p.unit_label}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => unarchiveProject(p)} style={btn({ background: '#e8f9ee', color: '#1a6b3a' })}>↩️ הוצא מארכיון</button>
            <button onClick={() => deleteProjectPermanently(p)} style={btn({ background: '#fdf0f0', color: '#e05555' })}>🗑️ מחק לצמיתות</button>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div>
      {/* Project selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        {activeProjects.map(p => (
          <button key={p.id} onClick={() => setActiveProject(p)}
            style={btn({ background: activeProject?.id === p.id ? 'var(--primary)' : '#f0ede8', color: activeProject?.id === p.id ? 'white' : 'var(--text)', fontSize: '13px' })}>
            {p.name}
          </button>
        ))}
        <button onClick={() => setShowNewProject(v => !v)} style={btn({ background: '#e8f4fd', color: '#1a5c8c' })}>+ פרויקט חדש</button>
        <button onClick={() => setShowArchive(true)} style={btn({ background: '#f0ede8', color: 'var(--muted)', fontSize: '12px' })}>
          🗄️ ארכיון {archivedProjects.length > 0 ? `(${archivedProjects.length})` : ''}
        </button>
      </div>

      {/* New project form */}
      {showNewProject && (
        <div style={{ background: '#f7f5f1', border: '1.5px solid var(--border)', borderRadius: '13px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '12px', color: 'var(--primary)' }}>פרויקט חדש</div>
          {[
            { key: 'name', label: 'שם הפרויקט', placeholder: 'למשל: שלטי חניון' },
            { key: 'description', label: 'תיאור (רשות)', placeholder: '' },
            { key: 'unit_label', label: 'שם היחידה', placeholder: 'שלטים / צ׳יפים / כרטיסים...' },
            { key: 'price_per_unit', label: 'מחיר ליחידה (₪)', placeholder: '90', type: 'number' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--muted)', marginBottom: '4px' }}>{f.label}</div>
              <input type={f.type || 'text'} value={newForm[f.key]} onChange={e => setNewForm(x => ({ ...x, [f.key]: e.target.value }))}
                placeholder={f.placeholder} autoFocus={f.key === 'name'}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '9px', border: '1.5px solid var(--border)', fontSize: '14px', fontFamily: 'Heebo, sans-serif', boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button onClick={createProject} style={btn({ background: 'var(--primary)', color: 'white' })}>✅ צור פרויקט</button>
            <button onClick={() => setShowNewProject(false)} style={btn({ background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' })}>ביטול</button>
          </div>
        </div>
      )}

      {!activeProject && !showNewProject && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>📋</div>
          <div style={{ fontWeight: '700', marginBottom: '8px' }}>אין פרויקטים עדיין</div>
          <button onClick={() => setShowNewProject(true)} style={btn({ background: 'var(--primary)', color: 'white', padding: '10px 22px', fontSize: '14px' })}>+ פרויקט חדש</button>
        </div>
      )}

      {activeProject && (
        <>
          {/* Stats */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', flex: 1 }}>
              {[
                { label: 'שילמו', val: paidCount, sub: `מתוך ${totalApts}`, color: '#1a7a3a', bg: '#e8f9ee' },
                { label: 'טרם שילמו', val: totalApts - paidCount, sub: 'דירות', color: '#b35c00', bg: '#fff3e0' },
                { label: `סה"כ ${unitLabel}`, val: totalUnits, sub: 'יחידות', color: 'var(--primary)', bg: '#e4edf8' },
                { label: 'סה"כ גבייה', val: `₪${totalMoney.toLocaleString()}`, sub: `₪${pricePerUnit} ליחידה`, color: '#7a1a5c', bg: '#f5e8f4' },
              ].map(x => (
                <div key={x.label} style={{ background: x.bg, borderRadius: '12px', padding: '12px 14px' }}>
                  <div style={{ fontWeight: '900', fontSize: '22px', color: x.color }}>{x.val}</div>
                  <div style={{ fontSize: '12px', color: x.color, fontWeight: '700' }}>{x.label}</div>
                  <div style={{ fontSize: '11px', color: x.color, opacity: 0.6, marginTop: '1px' }}>{x.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
              <button onClick={exportToExcel}
                style={btn({ background: '#f0fbf4', color: '#1a7a3a', border: '1.5px solid #bce8cc', padding: '8px 14px', fontSize: '13px' })}>
                ייצוא
              </button>
              <button onClick={() => archiveProject(activeProject)}
                style={btn({ background: '#f7f5f1', color: 'var(--muted)', border: '1px solid var(--border)', padding: '8px 14px', fontSize: '13px' })}>
                לארכיון
              </button>
            </div>
          </div>

          {/* Delivered stats */}
          {(delivered12.length > 0 || delivered14.length > 0) && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {[
                { building: 12, apts: delivered12.length, units: deliveredUnits12 },
                { building: 14, apts: delivered14.length, units: deliveredUnits14 },
              ].map(({ building, apts, units }) => apts > 0 ? (
                <div key={building} style={{
                  flex: 1, background: '#f0fbf4', border: '1.5px solid #bce8cc',
                  borderRadius: '10px', padding: '10px 14px',
                }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#1a7a3a', marginBottom: '3px' }}>
                    בניין {building} — נמסר
                  </div>
                  <div style={{ fontSize: '13px', color: '#1a5c38', lineHeight: '1.6' }}>
                    {apts} דירות · {units} {unitLabel}
                  </div>
                </div>
              ) : null)}
            </div>
          )}

          <SmartAddInput onSearch={findAptByInput} onSelect={apt => setAddModal(apt)} items={items} />

          {/* Filters */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <select value={buildingFilter} onChange={e => setBuildingFilter(e.target.value)}
              style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', fontFamily: 'Heebo, sans-serif', background: '#fafaf8' }}>
              <option value="all">שני הבניינים</option>
              <option value="12">עגנון 12</option>
              <option value="14">עגנון 14</option>
            </select>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש שם / דירה..."
              style={{ flex: 1, padding: '7px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', fontFamily: 'Heebo, sans-serif', background: '#fafaf8' }} />
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '8px' }}>
            {filteredApts.map(a => {
              const item = getItem(a.building, a.apt)
              const res = residents.filter(r => r.building === a.building && r.apt === a.apt)
              const mainRes = res.find(r => r.role === 'tenant') || res.find(r => r.role === 'owner' && !r.is_company) || res[0]
              const displayName = (() => {
                if (!mainRes) return a.is_unsold ? 'לא מכורה' : '—'
                if (mainRes.is_company) return mainRes.name || '—'
                return clean(mainRes.name).split(' ').slice(0, 2).join(' ') || '—'
              })()
              const paid = item && (item.status === 'paid' || item.status === 'done')
              return (
                <div key={`${a.building}-${a.apt}`}
                  onClick={() => paid ? setEditModal({ item, apt: a }) : setAddModal(a)}
                  style={{
                    border: `1.5px solid ${paid ? '#bce8cc' : a.is_unsold ? '#e0dbd4' : 'var(--border)'}`,
                    borderRadius: '12px', padding: '10px 12px', cursor: 'pointer',
                    background: paid ? '#f0fbf4' : a.is_unsold ? '#f7f5f1' : 'white',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '14px', color: paid ? '#1a7a3a' : a.is_unsold ? 'var(--muted)' : a.building === 12 ? 'var(--primary)' : '#1a6b4a' }}>
                        דירה {a.apt}
                      </div>
                      <div style={{ fontSize: '10px', fontWeight: '600', color: a.building === 12 ? '#7a9ec0' : '#4a9a7a', marginTop: '1px' }}>
                        בניין {a.building}
                      </div>
                    </div>
                    {paid
                      ? <span style={{ fontWeight: '800', fontSize: '13px', color: '#1a7a3a' }}>×{item.quantity || 1}</span>
                      : <span style={{ fontSize: '13px', color: 'var(--muted)' }}>—</span>
                    }
                  </div>
                  <div style={{ fontSize: '11px', color: a.is_unsold ? '#bbb' : 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: paid ? '4px' : 0 }}>
                    {displayName}
                  </div>
                  {paid && (
                    <div style={{ fontSize: '11px', color: '#1a7a3a', fontWeight: '700' }}>
                      ₪{(item.quantity || 1) * pricePerUnit}
                    </div>
                  )}
                  {paid && (
                    <button
                      onClick={e => toggleDelivered(e, item)}
                      style={{
                        marginTop: '6px', width: '100%', border: 'none', borderRadius: '6px',
                        padding: '4px 0', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                        fontFamily: 'Heebo, sans-serif', transition: 'all 0.15s',
                        background: item.delivered ? '#1a7a3a' : '#f0ede8',
                        color: item.delivered ? 'white' : 'var(--muted)',
                      }}>
                      {item.delivered ? '✓ נמסר' : 'נמסר?'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {addModal && (
        <ItemModal apt={addModal} projectId={activeProject.id}
          pricePerUnit={pricePerUnit} unitLabel={unitLabel}
          residents={residents.filter(r => r.building === addModal.building && r.apt === addModal.apt)}
          existingItem={getItem(addModal.building, addModal.apt)}
          onSave={() => { setAddModal(null); loadItems(activeProject.id) }}
          onClose={() => setAddModal(null)} />
      )}
      {editModal && (
        <ItemModal apt={editModal.apt} projectId={activeProject.id}
          pricePerUnit={pricePerUnit} unitLabel={unitLabel}
          residents={residents.filter(r => r.building === editModal.apt.building && r.apt === editModal.apt.apt)}
          existingItem={editModal.item}
          onSave={() => { setEditModal(null); loadItems(activeProject.id) }}
          onClose={() => setEditModal(null)} />
      )}
    </div>
  )
}
