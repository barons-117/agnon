import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase.js'

// ─── helpers ──────────────────────────────────────────────
const s = (v) => ({ fontFamily: 'Heebo, sans-serif', ...v })
const btn = (extra = {}) => ({
  fontFamily: 'Heebo, sans-serif', border: 'none', borderRadius: '8px',
  padding: '7px 14px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', ...extra
})
function clean(v) { return v === null || v === undefined ? '' : String(v) }

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
          minWidth: '42px', height: '42px', borderRadius: '10px',
          background: apt.is_unsold ? '#f0ede8' : 'var(--primary)',
          color: apt.is_unsold ? 'var(--muted)' : 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: '800', fontSize: '15px', flexShrink: 0,
        }}>{apt.apt}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--primary)' }}>
              {apt.is_unsold ? 'דירה לא מכורה' : clean(mainPerson?.name || '—')}
            </span>
            {tenants.length > 0 && (
              <span style={{ fontSize: '10px', background: '#e8f4fd', color: '#1a5c8c', padding: '1px 7px', borderRadius: '100px', fontWeight: '700' }}>שוכר</span>
            )}
            {owners[0]?.is_company && (
              <span style={{ fontSize: '10px', background: '#fff3e0', color: '#b35c00', padding: '1px 7px', borderRadius: '100px', fontWeight: '700' }}>{owners[0].company_name || 'חברה'}</span>
            )}
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
                  {r.phone && r.email && <span> · </span>}
                  {r.email && <span>✉️ {r.email}</span>}
                  {!r.phone && !r.email && <span>אין פרטי קשר</span>}
                </div>
              </div>
              <button onClick={() => onEditResident(r)} style={btn({ background: '#e4edf8', color: 'var(--primary)' })}>✏️</button>
            </div>
          ))}
          <button onClick={() => onAddResident(apt)} style={btn({ background: 'var(--primary)', color: 'white', marginTop: '4px' })}>
            + הוסף דייר / בעלים
          </button>
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

  const paidCount = items.filter(i => i.status === 'paid' || i.status === 'done').length
  const totalApts = filteredApts.filter(a => !a.is_unsold).length

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
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
            {[
              { label: 'שילמו', val: paidCount, color: '#1a7a3a', bg: '#e8f9ee' },
              { label: 'טרם שילמו', val: totalApts - paidCount, color: '#b35c00', bg: '#fff3e0' },
              { label: 'סה"כ דירות', val: totalApts, color: 'var(--primary)', bg: '#e4edf8' },
            ].map(x => (
              <div key={x.label} style={{ background: x.bg, borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontWeight: '800', fontSize: '22px', color: x.color }}>{x.val}</div>
                <div style={{ fontSize: '11px', color: x.color, fontWeight: '600' }}>{x.label}</div>
              </div>
            ))}
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
              .filter(a => !a.is_unsold)
              .filter(a => {
                if (!search.trim()) return true
                const q = search.toLowerCase()
                const item = getItem(a.building, a.apt)
                const res = residents.filter(r => r.building === a.building && r.apt === a.apt)
                return String(a.apt).includes(q) || res.some(r => clean(r.name).toLowerCase().includes(q) || clean(r.phone).includes(q))
              })
              .map(a => {
                const item = getItem(a.building, a.apt)
                const res = residents.filter(r => r.building === a.building && r.apt === a.apt)
                const mainRes = res.find(r => r.role === 'tenant') || res.find(r => r.role === 'owner')
                const paid = item && (item.status === 'paid' || item.status === 'done')
                return (
                  <div key={`${a.building}-${a.apt}`}
                    onClick={() => paid ? setEditModal({ item, apt: a }) : setAddModal(a)}
                    style={{
                      border: `1.5px solid ${paid ? '#bce8cc' : 'var(--border)'}`,
                      borderRadius: '12px', padding: '10px 12px', cursor: 'pointer',
                      background: paid ? '#f0fbf4' : 'white',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '800', fontSize: '15px', color: paid ? '#1a7a3a' : 'var(--primary)' }}>
                        {a.building}/{a.apt}
                      </span>
                      {paid && <span style={{ fontSize: '14px' }}>✅</span>}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: '1.4' }}>
                      {clean(mainRes?.name || '—').split(' ').slice(0, 2).join(' ')}
                    </div>
                    {paid && item.quantity > 1 && (
                      <div style={{ fontSize: '11px', color: '#1a7a3a', fontWeight: '700' }}>x{item.quantity}</div>
                    )}
                    {paid && item.amount_paid && (
                      <div style={{ fontSize: '11px', color: '#1a7a3a' }}>₪{item.amount_paid}</div>
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
function ItemModal({ apt, projectId, residents, existingItem, onSave, onClose }) {
  const [form, setForm] = useState(existingItem || { status: 'paid', quantity: 1, amount_paid: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const mainRes = residents.find(r => r.role === 'tenant') || residents.find(r => r.role === 'owner')

  const save = async () => {
    setSaving(true)
    const payload = {
      project_id: projectId, building: apt.building, apt: apt.apt,
      status: form.status, quantity: parseInt(form.quantity) || 1,
      amount_paid: form.amount_paid ? parseFloat(form.amount_paid) : null,
      notes: form.notes || null,
      paid_at: (form.status === 'paid' || form.status === 'done') ? new Date().toISOString() : null,
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
    await supabase.from('apt_project_items').delete().eq('id', existingItem.id)
    onSave()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '380px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ background: 'var(--primary)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '15px', color: 'white' }}>בניין {apt.building} · דירה {apt.apt}</div>
            {mainRes && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', marginTop: '2px' }}>{mainRes.name} · {mainRes.phone}</div>}
          </div>
          <button onClick={onClose} style={btn({ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 10px' })}>✕</button>
        </div>
        <div style={{ padding: '18px' }}>
          {[
            { key: 'status', label: 'סטטוס', type: 'select', options: [['paid', 'שולם ✅'], ['pending', 'ממתין ⏳'], ['done', 'הושלם ✓'], ['cancelled', 'בוטל']] },
            { key: 'quantity', label: 'כמות', placeholder: '1', type: 'number', dir: 'ltr' },
            { key: 'amount_paid', label: 'סכום ששולם (₪)', placeholder: '0', type: 'number', dir: 'ltr' },
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
                <input value={form[f.key] || ''} type={f.type || 'text'} dir={f.dir || 'rtl'}
                  onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))} placeholder={f.placeholder}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '9px', border: '1.5px solid var(--border)', fontSize: '14px', fontFamily: 'Heebo, sans-serif', background: '#fafaf8', boxSizing: 'border-box' }} />
              )}
            </div>
          ))}
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button onClick={save} disabled={saving} style={btn({ background: 'var(--primary)', color: 'white', flex: 1, padding: '10px' })}>{saving ? 'שומר...' : '💾 שמור'}</button>
            {existingItem?.id && <button onClick={del} style={btn({ background: '#fdf0f0', color: '#e05555' })}>🗑️</button>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────
export default function AdminApartments() {
  const [tab, setTab] = useState('projects')
  const [apartments, setApartments] = useState([])
  const [residents, setResidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [buildingFilter, setBuildingFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [editResident, setEditResident] = useState(null)
  const [addResidentApt, setAddResidentApt] = useState(null)

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    const [{ data: apts }, { data: res }] = await Promise.all([
      supabase.from('apartments').select('*').order('building').order('apt'),
      supabase.from('residents').select('*').order('building').order('apt'),
    ])
    setApartments(apts || [])
    setResidents(res || [])
    setLoading(false)
  }

  const filteredApts = apartments.filter(a => {
    if (buildingFilter !== 'all' && a.building !== parseInt(buildingFilter)) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    if (String(a.apt).includes(q)) return true
    const res = residents.filter(r => r.building === a.building && r.apt === a.apt)
    return res.some(r => clean(r.name).toLowerCase().includes(q) || clean(r.phone).includes(q))
  })

  if (loading) return <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px', fontSize: '14px' }}>טוען...</div>

  return (
    <div>
      {/* Sub-tab nav */}
      <div className="ctab-bar" style={{ marginBottom: 0 }}>
        {[['projects', 'פרויקטים'], ['apartments', 'דירות ודיירים']].map(([id, label]) => (
          <button key={id} className={`ctab-btn${tab === id ? ' active' : ''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      <div className="ctab-body">

        {/* ── PROJECTS TAB ── */}
        {tab === 'projects' && (
          <ProjectsTab apartments={apartments} residents={residents} />
        )}

        {/* ── APARTMENTS TAB ── */}
        {tab === 'apartments' && (
          <>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <select value={buildingFilter} onChange={e => setBuildingFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', fontFamily: 'Heebo, sans-serif', background: '#fafaf8' }}>
                <option value="all">שני הבניינים</option>
                <option value="12">עגנון 12</option>
                <option value="14">עגנון 14</option>
              </select>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="חיפוש שם / דירה / טלפון..."
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
          </>
        )}
      </div>

      {/* Modals */}
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
