import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase.js'

// ─── helpers ──────────────────────────────────────────────
const s = (v) => ({ fontFamily: 'Heebo, sans-serif', ...v })
const btn = (extra = {}) => ({
  fontFamily: 'Heebo, sans-serif', border: 'none', borderRadius: '8px',
  padding: '7px 14px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', ...extra
})
function clean(v) { return v === null || v === undefined ? '' : String(v) }
// Remove trailing .0 from numbers like "138.0" → "138"
function fmtNum(v) {
  if (!v) return ''
  return String(v).replace(/\.0$/, '')
}
// Normalize floor: "-1" stays "-1", "1-" becomes "-1" (for display keep as-is since DB is now fixed)
function fmtFloor(v) {
  if (!v) return ''
  v = String(v).trim()
  // "1-" → "-1"
  const m = v.match(/^(\d+)-$/)
  if (m) return `-${m[1]}`
  return v
}

// ─── ApartmentRow ──────────────────────────────────────────
function ApartmentRow({ apt, residents, projectItems, onEditResident, onAddResident }) {
  const [open, setOpen] = useState(false)
  const owners = residents.filter(r => r.role === 'owner')
  const tenants = residents.filter(r => r.role === 'tenant')
  const mainPerson = tenants[0] || owners[0]

  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 14px', cursor: 'pointer', background: open ? '#f7f5f1' : 'transparent',
          transition: 'background 0.15s',
        }}
      >
        {/* Apt number */}
        <div style={{
          minWidth: '52px', height: '42px', borderRadius: '10px',
          background: apt.is_unsold ? '#f0ede8'
            : apt.building === 12 ? 'var(--primary)'
            : '#1a6b4a',
          color: apt.is_unsold ? 'var(--muted)' : 'white',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          fontWeight: '800', flexShrink: 0,
        }}>
          <div style={{ fontSize: '15px', lineHeight: '1.1' }}>{apt.apt}</div>
          <div style={{ fontSize: '10px', fontWeight: '600', opacity: 0.75 }}>בנ׳ {apt.building}</div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--primary)' }}>
              {apt.is_unsold ? 'דירה לא מכורה' : clean(mainPerson?.name || '—')}
            </span>
            {tenants.length > 0 && (
              <span style={{ fontSize: '10px', background: '#e8f4fd', color: '#1a5c8c', padding: '1px 7px', borderRadius: '100px', fontWeight: '700' }}>שוכר</span>
            )}
            {owners[0]?.is_company && (() => {
              const cname = clean(owners[0].name || owners[0].company_name || '')
              const isHaziHinam = cname.includes('חצי חינם') || cname.includes('חצי-חינם')
              const isMagorit = cname.includes('מגוריט') || cname.includes('אמפא')
              if (isHaziHinam) return <span style={{ fontSize: '10px', background: '#fef3e0', color: '#b35c00', padding: '1px 7px', borderRadius: '100px', fontWeight: '700' }}>חצי חינם</span>
              if (isMagorit) return <span style={{ fontSize: '10px', background: '#e8f4fd', color: '#1a5c8c', padding: '1px 7px', borderRadius: '100px', fontWeight: '700' }}>מגוריט</span>
              return <span style={{ fontSize: '10px', background: '#fff3e0', color: '#b35c00', padding: '1px 7px', borderRadius: '100px', fontWeight: '700' }}>{cname || 'חברה'}</span>
            })()}
            {projectItems.length > 0 && projectItems.map(pi => (
              <span key={pi.id} style={{
                fontSize: '10px', padding: '1px 7px', borderRadius: '100px', fontWeight: '700',
                background: pi.status === 'paid' || pi.status === 'done' ? '#e8f9ee' : '#fef3e0',
                color: pi.status === 'paid' || pi.status === 'done' ? '#1a7a3a' : '#b35c00',
              }}>
                {pi.project_name}: {pi.status === 'paid' || pi.status === 'done' ? `✓ ${pi.quantity || 1}` : '⏳'}
              </span>
            ))}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
            קומה {apt.floor} · {apt.rooms} חדרים · {apt.area} מ"ר
            {mainPerson?.phone && ` · ${mainPerson.phone}`}
            {mainPerson?.phone2 && ` · ${mainPerson.phone2}`}
          </div>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</div>
      </div>

      {open && (
        <div style={{ background: '#fafaf8', padding: '14px 16px', borderTop: '1px solid var(--border)' }}>
          {residents.length === 0 && !apt.is_unsold && (
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '10px' }}>אין פרטי דיירים</div>
          )}
          {residents.map(r => (
            <div key={r.id} style={{
              display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px',
              background: 'white', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '11px', background: r.role === 'owner' ? '#e4edf8' : '#e8f4fd', color: '#1a3a5c', padding: '1px 7px', borderRadius: '100px', fontWeight: '700' }}>
                    {r.role === 'owner' ? 'בעלים' : r.role === 'tenant' ? 'שוכר' : 'אחר'}
                  </span>
                  <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--primary)' }}>{clean(r.name)}</span>
                  {r.is_company && <span style={{ fontSize: '11px', color: 'var(--muted)' }}>({r.company_name})</span>}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  {r.phone && <span>📞 {r.phone}</span>}
                  {r.phone2 && <span> · 📞 {r.phone2}</span>}
                  {(r.phone || r.phone2) && (r.email || r.email2) && <span> · </span>}
                  {r.email && <span>✉️ {r.email}</span>}
                  {r.email2 && <span> · ✉️ {r.email2}</span>}
                  {!r.phone && !r.phone2 && !r.email && !r.email2 && <span>אין פרטי קשר</span>}
                </div>
              </div>
              <button onClick={() => onEditResident(r)} style={btn({ background: '#e4edf8', color: 'var(--primary)' })}>✏️</button>
            </div>
          ))}
          <button onClick={() => onAddResident(apt)} style={btn({ background: 'var(--primary)', color: 'white', marginTop: '4px' })}>
            + הוסף דייר / בעלים
          </button>

          {/* Parking & Storage */}
          {(apt.parking1 || apt.storage1) && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              {apt.parking1 && (
                <div style={{ background: '#e8f0fb', border: '1px solid #c4d4f0', borderRadius: '8px', padding: '7px 12px', fontSize: '12px' }}>
                  <span style={{ fontWeight: '700', color: '#1a3a5c' }}>🚗 חניה </span>
                  <span style={{ color: '#1a3a5c' }}>{fmtNum(apt.parking1)}</span>
                  {apt.parking1_floor && <span style={{ color: 'var(--muted)' }}> · קומה {fmtFloor(apt.parking1_floor)}</span>}
                  {apt.parking2 && <>
                    <span style={{ color: '#1a3a5c' }}> + {fmtNum(apt.parking2)}</span>
                    {apt.parking2_floor && <span style={{ color: 'var(--muted)' }}> · קומה {fmtFloor(apt.parking2_floor)}</span>}
                  </>}
                </div>
              )}
              {apt.storage1 && (
                <div style={{ background: '#f5f0fb', border: '1px solid #d4c4f0', borderRadius: '8px', padding: '7px 12px', fontSize: '12px' }}>
                  <span style={{ fontWeight: '700', color: '#3a1a5c' }}>📦 מחסן </span>
                  <span style={{ color: '#3a1a5c' }}>{fmtNum(apt.storage1)}</span>
                  {apt.storage1_floor && <span style={{ color: 'var(--muted)' }}> · קומה {fmtFloor(apt.storage1_floor)}</span>}
                  {apt.storage2 && <>
                    <span style={{ color: '#3a1a5c' }}> + {fmtNum(apt.storage2)}</span>
                    {apt.storage2_floor && <span style={{ color: 'var(--muted)' }}> · קומה {fmtFloor(apt.storage2_floor)}</span>}
                  </>}
                </div>
              )}
            </div>
          )}

          {apt.notes && (
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px', fontStyle: 'italic' }}>📝 {apt.notes}</div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── ResidentModal ─────────────────────────────────────────
function ResidentModal({ resident, apt, onSave, onDelete, onClose }) {
  const isNew = !resident?.id
  const [form, setForm] = useState(resident || {
    building: apt?.building, apt: apt?.apt,
    role: 'tenant', name: '', phone: '', email: '', is_company: false, company_name: '', notes: '',
  })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    const payload = { building: form.building, apt: form.apt, role: form.role, name: form.name || null, phone: form.phone || null, email: form.email || null, is_company: form.is_company, company_name: form.company_name || null, notes: form.notes || null }
    if (isNew) await supabase.from('residents').insert([payload])
    else await supabase.from('residents').update(payload).eq('id', form.id)
    setSaving(false)
    onSave()
  }

  const del = async () => {
    if (!window.confirm('למחוק דייר זה?')) return
    await supabase.from('residents').delete().eq('id', form.id)
    onDelete()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '400px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ background: 'var(--primary)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: '700', fontSize: '15px', color: 'white' }}>{isNew ? `+ דייר חדש — דירה ${apt?.apt}` : `עריכה — ${form.name}`}</div>
          <button onClick={onClose} style={btn({ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 10px' })}>✕</button>
        </div>
        <div style={{ padding: '18px' }}>
          {[
            { key: 'role', label: 'תפקיד', type: 'select', options: [['owner', 'בעלים'], ['tenant', 'שוכר'], ['other', 'אחר']] },
            { key: 'name', label: 'שם', placeholder: 'שם מלא' },
            { key: 'phone', label: 'טלפון', placeholder: '05x-xxxxxxx', dir: 'ltr' },
            { key: 'email', label: 'מייל', placeholder: 'email@example.com', dir: 'ltr' },
            { key: 'notes', label: 'הערות', placeholder: '' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)', marginBottom: '5px' }}>{f.label}</div>
              {f.type === 'select' ? (
                <select value={form[f.key]} onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '9px', border: '1.5px solid var(--border)', fontSize: '14px', fontFamily: 'Heebo, sans-serif', background: '#fafaf8' }}>
                  {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              ) : (
                <input value={form[f.key] || ''} dir={f.dir || 'rtl'}
                  onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '9px', border: '1.5px solid var(--border)', fontSize: '14px', fontFamily: 'Heebo, sans-serif', background: '#fafaf8', boxSizing: 'border-box' }} />
              )}
            </div>
          ))}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_company} onChange={e => setForm(x => ({ ...x, is_company: e.target.checked }))} />
            <span style={{ fontSize: '13px' }}>חברה / גוף מוסדי</span>
          </label>
          {form.is_company && (
            <input value={form.company_name || ''} onChange={e => setForm(x => ({ ...x, company_name: e.target.value }))}
              placeholder="שם החברה" style={{ width: '100%', padding: '9px 12px', borderRadius: '9px', border: '1.5px solid var(--border)', fontSize: '14px', fontFamily: 'Heebo, sans-serif', background: '#fafaf8', boxSizing: 'border-box', marginBottom: '12px' }} />
          )}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={save} disabled={saving} style={btn({ background: 'var(--primary)', color: 'white', flex: 1, padding: '10px' })}>{saving ? 'שומר...' : '💾 שמור'}</button>
            {!isNew && <button onClick={del} style={btn({ background: '#fdf0f0', color: '#e05555' })}>🗑️</button>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ProjectsTab ───────────────────────────────────────────
function ProjectsTab({ apartments, residents }) {
  const [projects, setProjects] = useState([])
  const [activeProject, setActiveProject] = useState(null)
  const [items, setItems] = useState([])
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  const [buildingFilter, setBuildingFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [addModal, setAddModal] = useState(null) // apt data for adding
  const [editModal, setEditModal] = useState(null) // item data for editing

  useEffect(() => { loadProjects() }, [])

  const loadProjects = async () => {
    const { data } = await supabase.from('apt_projects').select('*').order('created_at', { ascending: false })
    setProjects(data || [])
    if (data?.length > 0 && !activeProject) setActiveProject(data[0])
  }

  const loadItems = async (projectId) => {
    const { data } = await supabase.from('apt_project_items').select('*').eq('project_id', projectId)
    setItems(data || [])
  }

  useEffect(() => {
    if (activeProject) loadItems(activeProject.id)
  }, [activeProject])

  const exportToExcel = () => {
    if (!activeProject) return
    const PRICE = 90
    const rows = []

    // Header
    rows.push(['בניין', 'דירה', 'קומה', 'שם', 'טלפון', 'הזמין', 'כמות שלטים', 'סכום (₪)', 'הערות', 'תאריך תשלום'])

    apartments
      .sort((a, b) => a.building - b.building || a.apt - b.apt)
      .forEach(a => {
        const item = getItem(a.building, a.apt)
        const res = residents.filter(r => r.building === a.building && r.apt === a.apt)
        const mainRes = res.find(r => r.role === 'tenant') || res.find(r => r.role === 'owner')
        const paid = item && (item.status === 'paid' || item.status === 'done')
        const qty = paid ? (item.quantity || 1) : 0
        const paidDate = item?.paid_at ? new Date(item.paid_at).toLocaleDateString('he-IL') : ''
        rows.push([
          `עגנון ${a.building}`,
          a.apt,
          a.floor,
          clean(mainRes?.name || ''),
          clean(mainRes?.phone || ''),
          paid ? 'כן' : 'לא',
          paid ? qty : '',
          paid ? qty * PRICE : '',
          clean(item?.notes || ''),
          paidDate,
        ])
      })

    // Summary rows
    const paidRows = rows.slice(1).filter(r => r[5] === 'כן')
    const totalQty = paidRows.reduce((s, r) => s + (r[6] || 0), 0)
    const totalMoney = paidRows.reduce((s, r) => s + (r[7] || 0), 0)
    rows.push([])
    rows.push(['', '', '', '', 'סה"כ שילמו:', paidRows.length, totalQty, totalMoney, '', ''])
    rows.push(['', '', '', '', 'טרם שילמו:', rows.slice(1, -2).filter(r => r[5] === 'לא').length, '', '', '', ''])

    // Build CSV (TSV actually — Excel opens it fine with .csv)
    const csv = rows.map(r =>
      r.map(cell => {
        const s = String(cell ?? '')
        return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s
      }).join(',')
    ).join('\n')

    const BOM = '\uFEFF' // UTF-8 BOM for Hebrew in Excel
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeProject.name}_${new Date().toLocaleDateString('he-IL').replace(/\//g, '-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const createProject = async () => {
    if (!newProjectName.trim()) return
    const { data } = await supabase.from('apt_projects').insert([{ name: newProjectName, description: newProjectDesc }]).select().single()
    setShowNewProject(false); setNewProjectName(''); setNewProjectDesc('')
    await loadProjects()
    if (data) setActiveProject(data)
  }

  // Smart lookup: find apartment by phone/name
  const findAptByInput = (input) => {
    const q = input.trim().replace(/-/g, '')
    if (!q) return []
    const matches = []
    for (const r of residents) {
      const phone = clean(r.phone).replace(/-/g, '')
      const name = clean(r.name).toLowerCase()
      if (phone.includes(q) || name.includes(q.toLowerCase())) {
        // check not already in items
        const apt = apartments.find(a => a.building === r.building && a.apt === r.apt)
        if (apt) matches.push({ ...apt, resident: r })
      }
    }
    return matches.slice(0, 5)
  }

  const filteredApts = apartments.filter(a => {
    if (buildingFilter !== 'all' && a.building !== parseInt(buildingFilter)) return false
    return true
  })

  const getItem = (building, apt) => items.find(i => i.building === building && i.apt === apt)

  const paidItems = items.filter(i => i.status === 'paid' || i.status === 'done')
  const paidCount = paidItems.length
  const totalRemotes = paidItems.reduce((sum, i) => sum + (i.quantity || 1), 0)
  const totalMoney = paidItems.reduce((sum, i) => sum + (i.amount_paid || 0), 0)
  const totalApts = filteredApts.length

  if (!activeProject && !showNewProject) {
    return (
      <div>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>📋</div>
          <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--primary)', marginBottom: '8px' }}>אין פרויקטים עדיין</div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px' }}>צור פרויקט ראשון לניהול גביה או מעקב</div>
          <button onClick={() => setShowNewProject(true)} style={btn({ background: 'var(--primary)', color: 'white', padding: '10px 22px', fontSize: '14px' })}>+ פרויקט חדש</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Project selector + new */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        {projects.map(p => (
          <button key={p.id} onClick={() => setActiveProject(p)}
            style={btn({ background: activeProject?.id === p.id ? 'var(--primary)' : '#f0ede8', color: activeProject?.id === p.id ? 'white' : 'var(--text)', fontSize: '13px' })}>
            {p.name}
          </button>
        ))}
        <button onClick={() => setShowNewProject(true)} style={btn({ background: '#e8f4fd', color: '#1a5c8c' })}>+ חדש</button>
      </div>

      {/* New project form */}
      {showNewProject && (
        <div style={{ background: '#f7f5f1', border: '1.5px solid var(--border)', borderRadius: '13px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '12px', color: 'var(--primary)' }}>פרויקט חדש</div>
          <input value={newProjectName} onChange={e => setNewProjectName(e.target.value)}
            placeholder="שם הפרויקט (למשל: שלטי חניון)" autoFocus
            style={{ width: '100%', padding: '9px 12px', borderRadius: '9px', border: '1.5px solid var(--border)', fontSize: '14px', fontFamily: 'Heebo, sans-serif', marginBottom: '8px', boxSizing: 'border-box' }} />
          <input value={newProjectDesc} onChange={e => setNewProjectDesc(e.target.value)}
            placeholder="תיאור (רשות)"
            style={{ width: '100%', padding: '9px 12px', borderRadius: '9px', border: '1.5px solid var(--border)', fontSize: '14px', fontFamily: 'Heebo, sans-serif', marginBottom: '12px', boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={createProject} style={btn({ background: 'var(--primary)', color: 'white' })}>צור פרויקט</button>
            <button onClick={() => setShowNewProject(false)} style={btn({ background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' })}>ביטול</button>
          </div>
        </div>
      )}

      {activeProject && (
        <>
          {/* Stats + export */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', flex: 1 }}>
              {[
                { label: 'דירות שהזמינו', val: paidCount, sub: `מתוך ${totalApts}`, color: '#1a7a3a', bg: '#e8f9ee' },
                { label: 'טרם הזמינו', val: totalApts - paidCount, sub: 'דירות', color: '#b35c00', bg: '#fff3e0' },
                { label: 'סה"כ שלטים', val: totalRemotes, sub: 'יחידות', color: 'var(--primary)', bg: '#e4edf8' },
                { label: 'סה"כ גבייה', val: `₪${totalMoney.toLocaleString()}`, sub: `צפי: ₪${(totalApts * 90).toLocaleString()}`, color: '#7a1a5c', bg: '#f5e8f4' },
              ].map(x => (
                <div key={x.label} style={{ background: x.bg, borderRadius: '12px', padding: '12px 14px' }}>
                  <div style={{ fontWeight: '900', fontSize: '22px', color: x.color }}>{x.val}</div>
                  <div style={{ fontSize: '12px', color: x.color, fontWeight: '700' }}>{x.label}</div>
                  <div style={{ fontSize: '11px', color: x.color, opacity: 0.6, marginTop: '1px' }}>{x.sub}</div>
                </div>
              ))}
            </div>
            <button onClick={exportToExcel}
              title="ייצוא לאקסל"
              style={btn({ background: '#f0fbf4', color: '#1a7a3a', border: '1.5px solid #bce8cc', padding: '10px 14px', fontSize: '20px', flexShrink: 0 })}>
              📊
            </button>
          </div>

          {/* Add payment input */}
          <SmartAddInput
            onSearch={findAptByInput}
            onSelect={(apt) => setAddModal(apt)}
            projectId={activeProject.id}
            items={items}
          />

          {/* Filters */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
            <select value={buildingFilter} onChange={e => setBuildingFilter(e.target.value)}
              style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', fontFamily: 'Heebo, sans-serif', background: '#fafaf8' }}>
              <option value="all">שני הבניינים</option>
              <option value="12">עגנון 12</option>
              <option value="14">עגנון 14</option>
            </select>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש שם / דירה..."
              style={{ flex: 1, padding: '7px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', fontFamily: 'Heebo, sans-serif', background: '#fafaf8' }} />
          </div>

          {/* Apartment grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
            {filteredApts
              .filter(a => {
                if (!search.trim()) return true
                const q = search.toLowerCase().trim()
                if (String(a.apt).includes(q)) return true
                const res = residents.filter(r => r.building === a.building && r.apt === a.apt)
                return res.some(r =>
                  clean(r.name).toLowerCase().includes(q) ||
                  clean(r.phone).replace(/-/g,'').includes(q.replace(/-/g,'')) ||
                  clean(r.phone2).replace(/-/g,'').includes(q.replace(/-/g,''))
                )
              })
              .map(a => {
                const item = getItem(a.building, a.apt)
                const res = residents.filter(r => r.building === a.building && r.apt === a.apt)
                // prefer tenant name, fall back to owner; skip company-only entries for display
                const tenant = res.find(r => r.role === 'tenant')
                const owner = res.find(r => r.role === 'owner' && !r.is_company)
                const companyOwner = res.find(r => r.role === 'owner' && r.is_company)
                const mainRes = tenant || owner || companyOwner || res[0]
                const displayName = (() => {
                  if (!mainRes) return a.is_unsold ? 'לא מכורה' : '—'
                  if (mainRes.is_company) return mainRes.company_name || mainRes.name || '—'
                  // show last name only (first word, or last word if Hebrew convention)
                  const parts = clean(mainRes.name || '').split(' ').filter(Boolean)
                  return parts.slice(0, 2).join(' ') || '—'
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
                    <div style={{ fontSize: '11px', color: a.is_unsold ? '#bbb' : 'var(--muted)', lineHeight: '1.4', marginBottom: paid ? '4px' : 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {displayName}
                    </div>
                    {paid && (
                      <div style={{ fontSize: '11px', color: '#1a7a3a', fontWeight: '700' }}>
                        ₪{(item.quantity || 1) * 90}
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        </>
      )}

      {/* Add/Edit modals */}
      {addModal && (
        <ItemModal
          apt={addModal}
          projectId={activeProject.id}
          residents={residents.filter(r => r.building === addModal.building && r.apt === addModal.apt)}
          existingItem={getItem(addModal.building, addModal.apt)}
          onSave={() => { setAddModal(null); loadItems(activeProject.id) }}
          onClose={() => setAddModal(null)}
        />
      )}
      {editModal && (
        <ItemModal
          apt={editModal.apt}
          projectId={activeProject.id}
          residents={residents.filter(r => r.building === editModal.apt.building && r.apt === editModal.apt.apt)}
          existingItem={editModal.item}
          onSave={() => { setEditModal(null); loadItems(activeProject.id) }}
          onClose={() => setEditModal(null)}
        />
      )}
    </div>
  )
}

// ─── SmartAddInput ─────────────────────────────────────────
function SmartAddInput({ onSearch, onSelect, projectId, items }) {
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
    if (val.trim().length < 2) { setResults([]); setOpen(false); return }
    const found = onSearch(val)
    setResults(found)
    setOpen(true)
  }

  return (
    <div ref={ref} style={{ position: 'relative', marginBottom: '14px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'white', border: '2px solid var(--accent2)',
        borderRadius: '12px', padding: '10px 16px',
      }}>
        <span style={{ fontSize: '16px' }}>🔍</span>
        <input value={input} onChange={e => search(e.target.value)}
          placeholder="הזן טלפון / שם לזיהוי דירה ורישום תשלום..."
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', fontFamily: 'Heebo, sans-serif' }} />
        {input && <button onClick={() => { setInput(''); setResults([]); setOpen(false) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '16px' }}>✕</button>}
      </div>
      {open && results.length > 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, left: 0, background: 'white', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden' }}>
          {results.map((a, i) => {
            const alreadyPaid = items.some(it => it.building === a.building && it.apt === a.apt && (it.status === 'paid' || it.status === 'done'))
            return (
              <div key={i} onMouseDown={() => { onSelect(a); setInput(''); setOpen(false) }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 16px', cursor: 'pointer', borderBottom: i < results.length - 1 ? '1px solid var(--border)' : 'none', background: 'white' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f7f5f1'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', flexShrink: 0 }}>
                  {a.apt}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--primary)' }}>בניין {a.building} · דירה {a.apt}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{clean(a.resident?.name)} · {clean(a.resident?.phone)}</div>
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

// ─── ItemModal ─────────────────────────────────────────────
const PRICE_PER_UNIT = 90

function ItemModal({ apt, projectId, residents, existingItem, onSave, onClose }) {
  const [quantity, setQuantity] = useState(existingItem?.quantity || 1)
  const [notes, setNotes] = useState(existingItem?.notes || '')
  const [saving, setSaving] = useState(false)
  const mainRes = residents.find(r => r.role === 'tenant') || residents.find(r => r.role === 'owner')
  const total = quantity * PRICE_PER_UNIT

  const save = async () => {
    setSaving(true)
    const payload = {
      project_id: projectId, building: apt.building, apt: apt.apt,
      status: 'paid',
      quantity: parseInt(quantity) || 1,
      amount_paid: (parseInt(quantity) || 1) * PRICE_PER_UNIT,
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
        {/* Header */}
        <div style={{ background: 'var(--primary)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '15px', color: 'white' }}>בניין {apt.building} · דירה {apt.apt}</div>
            {mainRes && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', marginTop: '2px' }}>{mainRes.name}{mainRes.phone ? ` · ${mainRes.phone}` : ''}</div>}
          </div>
          <button onClick={onClose} style={btn({ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 10px' })}>✕</button>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Quantity picker */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)', marginBottom: '10px' }}>כמה שלטים הוזמנו?</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0', border: '1.5px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
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

          {/* Auto-calculated total */}
          <div style={{
            background: 'linear-gradient(135deg, #e8f9ee, #f0fbf4)',
            border: '1.5px solid #bce8cc', borderRadius: '12px',
            padding: '14px 18px', marginBottom: '16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#1a7a3a', fontWeight: '600' }}>{quantity} שלטים × ₪{PRICE_PER_UNIT}</div>
              <div style={{ fontSize: '11px', color: '#1a7a3a', opacity: 0.7, marginTop: '2px' }}>סכום לתשלום</div>
            </div>
            <div style={{ fontWeight: '900', fontSize: '26px', color: '#1a7a3a' }}>₪{total}</div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)', marginBottom: '6px' }}>הערות (רשות)</div>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="למשל: שולם במזומן, ממתין לאיסוף..."
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

export default function AdminApartments() {
  const [apartments, setApartments] = useState([])
  const [residents, setResidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [buildingFilter, setBuildingFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [editResident, setEditResident] = useState(null)
  const [addResidentApt, setAddResidentApt] = useState(null)
  const [pendingRequests, setPendingRequests] = useState([])
  const [showPending, setShowPending] = useState(false)
  const [editingRequest, setEditingRequest] = useState(null)

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    const [{ data: apts }, { data: res }, { data: reqs }] = await Promise.all([
      supabase.from('apartments').select('*').order('building').order('apt'),
      supabase.from('residents').select('*').order('building').order('apt'),
      supabase.from('profile_update_requests').select('*').eq('status', 'pending').order('created_at'),
    ])
    setApartments(apts || [])
    setResidents(res || [])
    setPendingRequests(reqs || [])
    setLoading(false)
  }

  const approveRequest = async (req, overrides = null) => {
    const data = overrides || req
    if (req.request_type === 'replace_tenant') {
      if (req.replace_tenant_name) {
        // Delete only the specific tenant by name
        await supabase.from('residents').delete()
          .eq('building', req.building).eq('apt', req.apt)
          .eq('role', 'tenant').eq('name', req.replace_tenant_name)
      } else {
        // Delete all tenants
        await supabase.from('residents').delete()
          .eq('building', req.building).eq('apt', req.apt).eq('role', 'tenant')
      }
    }
    await supabase.from('residents').insert([{
      building: req.building, apt: req.apt, role: 'tenant',
      name: data.name, phone: data.phone, phone2: data.phone2 || null,
      email: data.email, email2: data.email2 || null,
      is_company: false,
    }])
    await supabase.from('profile_update_requests').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', req.id)
    await loadAll()
    setEditingRequest(null)
  }

  const dismissRequest = async (req) => {
    await supabase.from('profile_update_requests').update({ status: 'rejected', reviewed_at: new Date().toISOString() }).eq('id', req.id)
    await loadAll()
  }

  const filteredApts = apartments.filter(a => {
    if (buildingFilter !== 'all' && a.building !== parseInt(buildingFilter)) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    if (String(a.apt).includes(q)) return true
    if (clean(a.parking1).includes(q) || clean(a.parking2).includes(q)) return true
    if (clean(a.storage1).includes(q) || clean(a.storage2).includes(q)) return true
    const res = residents.filter(r => r.building === a.building && r.apt === a.apt)
    return res.some(r => clean(r.name).toLowerCase().includes(q) || clean(r.phone).includes(q) || clean(r.phone2).includes(q))
  })

  if (loading) return <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px', fontSize: '14px' }}>טוען...</div>

  return (
    <div>
      {/* ── Pending requests banner ── */}
      <div onClick={() => setShowPending(v => !v)} style={{
        background: pendingRequests.length > 0 ? '#fffbea' : '#f7f5f1',
        border: `1.5px solid ${pendingRequests.length > 0 ? '#f0d060' : 'var(--border)'}`,
        borderRadius: '12px', padding: '13px 16px', marginBottom: '16px',
        cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        transition: 'all 0.15s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>📬</span>
          <div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: pendingRequests.length > 0 ? '#7a6000' : 'var(--muted)' }}>
              {pendingRequests.length > 0
                ? `${pendingRequests.length} בקשות עדכון ממתינות לאישור`
                : 'אין כרגע בקשות עדכון ממתינות'}
            </div>
            {pendingRequests.length > 0 && <div style={{ fontSize: '11px', color: '#a08000', marginTop: '1px' }}>לחץ לפתיחה</div>}
          </div>
        </div>
        {pendingRequests.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: '#e05', color: 'white', borderRadius: '100px', padding: '1px 8px', fontSize: '13px', fontWeight: '800' }}>
              {pendingRequests.length}
            </span>
            <span style={{ fontSize: '12px', color: '#a08000' }}>{showPending ? '▲' : '▼'}</span>
          </div>
        )}
      </div>

      {/* ── Pending list ── */}
      {showPending && pendingRequests.length > 0 && (
        <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {pendingRequests.map(req => (
            <PendingRequestCard key={req.id} req={req}
              onApprove={() => approveRequest(req)}
              onEdit={() => setEditingRequest(req)}
              onDismiss={() => dismissRequest(req)} />
          ))}
        </div>
      )}

      {/* ── Edit request modal ── */}
      {editingRequest && (
        <EditRequestModal req={editingRequest}
          onApprove={(data) => approveRequest(editingRequest, data)}
          onClose={() => setEditingRequest(null)} />
      )}

      {/* ── Apartment list ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <select value={buildingFilter} onChange={e => setBuildingFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', fontFamily: 'Heebo, sans-serif', background: '#fafaf8' }}>
          <option value="all">שני הבניינים</option>
          <option value="12">עגנון 12</option>
          <option value="14">עגנון 14</option>
        </select>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="חיפוש שם / דירה / טלפון / חניה / מחסן..."
          style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', fontFamily: 'Heebo, sans-serif', background: '#fafaf8', minWidth: '140px' }} />
        <div style={{ fontSize: '12px', color: 'var(--muted)', alignSelf: 'center', whiteSpace: 'nowrap' }}>{filteredApts.length} דירות</div>
      </div>

      <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        {filteredApts.map(apt => (
          <ApartmentRow
            key={`${apt.building}-${apt.apt}`}
            apt={apt}
            residents={residents.filter(r => r.building === apt.building && r.apt === apt.apt)}
            projectItems={[]}
            onEditResident={(r) => setEditResident(r)}
            onAddResident={(a) => setAddResidentApt(a)}
          />
        ))}
      </div>

      {editResident && (
        <ResidentModal resident={editResident} apt={null}
          onSave={() => { setEditResident(null); loadAll() }}
          onDelete={() => { setEditResident(null); loadAll() }}
          onClose={() => setEditResident(null)} />
      )}
      {addResidentApt && (
        <ResidentModal resident={null} apt={addResidentApt}
          onSave={() => { setAddResidentApt(null); loadAll() }}
          onDelete={() => {}}
          onClose={() => setAddResidentApt(null)} />
      )}
    </div>
  )
}

// ─── PendingRequestCard ────────────────────────────────────
function PendingRequestCard({ req, onApprove, onEdit, onDismiss }) {
  const date = new Date(req.created_at).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })

  const actionLabel = () => {
    if (req.request_type === 'add_tenant') return { label: 'הוספת שוכר', bg: '#e8f9ee', color: '#1a7a3a' }
    if (req.replace_tenant_name) return { label: `החלפת ${req.replace_tenant_name}`, bg: '#fff3e0', color: '#b35c00' }
    return { label: 'החלפת כל השוכרים', bg: '#e8f4fd', color: '#1a5c8c' }
  }
  const al = actionLabel()

  return (
    <div style={{ background: 'white', border: '1.5px solid #f0d060', borderRadius: '12px', padding: '14px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div>
          <div style={{ fontWeight: '800', fontSize: '15px', color: 'var(--primary)' }}>
            בניין {req.building} · דירה {req.apt}
            <span style={{ marginRight: '8px', fontSize: '11px', background: al.bg, color: al.color, padding: '2px 7px', borderRadius: '100px', fontWeight: '700' }}>
              {al.label}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{date}</div>
        </div>
      </div>
      <div style={{ background: '#f7f5f1', borderRadius: '9px', padding: '10px 13px', fontSize: '13px', marginBottom: '12px' }}>
        <div style={{ fontWeight: '700' }}>{req.name}</div>
        <div style={{ color: 'var(--muted)', marginTop: '3px' }}>
          📞 {req.phone}{req.phone2 ? ` · ${req.phone2}` : ''}
        </div>
        <div style={{ color: 'var(--muted)' }}>
          ✉️ {req.email}{req.email2 ? ` · ${req.email2}` : ''}
        </div>
        {req.notes && <div style={{ color: 'var(--muted)', borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '8px', fontStyle: 'italic' }}>"{req.notes}"</div>}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={onApprove} style={btn({ background: '#1a7a3a', color: 'white', flex: 1, padding: '9px' })}>✅ אישור</button>
        <button onClick={onEdit} style={btn({ background: '#e8f4fd', color: '#1a5c8c', flex: 1, padding: '9px' })}>✏️ עריכה לפני אישור</button>
        <button onClick={onDismiss} style={btn({ background: '#fdf0f0', color: '#e05555', padding: '9px 12px' })}>✕</button>
      </div>
    </div>
  )
}

// ─── EditRequestModal ──────────────────────────────────────
function EditRequestModal({ req, onApprove, onClose }) {
  const [form, setForm] = useState({
    name: req.name || '', phone: req.phone || '', phone2: req.phone2 || '',
    email: req.email || '', email2: req.email2 || '', notes: req.notes || '',
  })
  const f = k => e => setForm(x => ({ ...x, [k]: e.target.value }))
  const inp = (extra = {}) => ({
    width: '100%', padding: '9px 12px', borderRadius: '9px', border: '1.5px solid var(--border)',
    fontSize: '14px', fontFamily: 'Heebo, sans-serif', background: '#fafaf8', boxSizing: 'border-box', ...extra
  })

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '400px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ background: 'var(--primary)', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>עריכת בקשה — בניין {req.building} דירה {req.apt}</div>
          <button onClick={onClose} style={btn({ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 10px' })}>✕</button>
        </div>
        <div style={{ padding: '18px' }}>
          {[
            { k: 'name',   l: 'שם מלא',      dir: 'rtl' },
            { k: 'phone',  l: 'טלפון ראשי',   dir: 'ltr' },
            { k: 'phone2', l: 'טלפון נוסף',   dir: 'ltr' },
            { k: 'email',  l: 'מייל ראשי',    dir: 'ltr' },
            { k: 'email2', l: 'מייל נוסף',    dir: 'ltr' },
            { k: 'notes',  l: 'הערות',        dir: 'rtl' },
          ].map(({ k, l, dir }) => (
            <div key={k} style={{ marginBottom: '11px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--muted)', marginBottom: '4px' }}>{l}</div>
              <input value={form[k]} onChange={f(k)} dir={dir} style={inp()} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button onClick={() => onApprove(form)} style={btn({ background: '#1a7a3a', color: 'white', flex: 1, padding: '10px', fontSize: '14px' })}>✅ אשר ושמור</button>
            <button onClick={onClose} style={btn({ background: '#fdf0f0', color: '#e05555' })}>ביטול</button>
          </div>
        </div>
      </div>
    </div>
  )
}
