import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const CATEGORIES = {
  vaad:     { label: 'הודעות ועד',     icon: '📣', color: '#fef3e0', text: '#b35c00' },
  protocol: { label: 'פרוטוקולים',     icon: '📋', color: '#e8f4fd', text: '#1a5c8c' },
  meeting:  { label: 'סיכומי פגישות',  icon: '🤝', color: '#e8f9ee', text: '#1a6b3a' },
  legal:    { label: 'מסמכים משפטיים', icon: '⚖️', color: '#f3e8fd', text: '#5c1a8c' },
  general:  { label: 'כללי',           icon: '📄', color: '#f0ede8', text: '#5c4a3a' },
}

const BUILDINGS = [
  { id: 'all', label: 'שני הבניינים', emoji: '🏘️' },
  { id: '12',  label: 'עגנון 12',    emoji: '🔵' },
  { id: '14',  label: 'עגנון 14',    emoji: '🟢' },
]

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('he-IL', { day: '2-digit', month: 'long', year: 'numeric' })
}

function BuildingBadge({ building }) {
  if (building === 'both') return (
    <div style={{ display: 'flex', gap: '4px' }}>
      <span style={{ fontSize: '10px', background: '#dce8f5', color: '#1a3a5c', padding: '2px 8px', borderRadius: '100px', fontWeight: '700' }}>עגנון 12</span>
      <span style={{ fontSize: '10px', background: '#dceee2', color: '#1a4a2c', padding: '2px 8px', borderRadius: '100px', fontWeight: '700' }}>עגנון 14</span>
    </div>
  )
  if (building === '12') return (
    <span style={{ fontSize: '10px', background: '#dce8f5', color: '#1a3a5c', padding: '2px 8px', borderRadius: '100px', fontWeight: '700' }}>עגנון 12 בלבד</span>
  )
  return (
    <span style={{ fontSize: '10px', background: '#dceee2', color: '#1a4a2c', padding: '2px 8px', borderRadius: '100px', fontWeight: '700' }}>עגנון 14 בלבד</span>
  )
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [buildingFilter, setBuildingFilter] = useState('all')
  const [catFilter, setCatFilter] = useState('all')

  useEffect(() => {
    supabase.from('documents').select('*').order('publish_date', { ascending: false })
      .then(({ data }) => { setDocs(data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const afterBuilding = buildingFilter === 'all'
    ? docs
    : docs.filter(d => d.building === buildingFilter || d.building === 'both')

  const filtered = catFilter === 'all' ? afterBuilding : afterBuilding.filter(d => d.category === catFilter)
  const usedCategories = [...new Set(docs.map(d => d.category))]

  return (
    <section className="page-section">
      <div style={{ marginBottom: '22px' }}>
        <div className="section-title" style={{ marginBottom: '6px' }}>📁 סיכומים, פרוטוקולים ומסמכים</div>
        <p style={{ fontSize: '13.5px', color: 'var(--muted)', lineHeight: '1.7', margin: 0 }}>
          מאגר המסמכים הרשמיים של ועד הבית — פרוטוקולים, סיכומי פגישות, הודעות ועוד.
        </p>
      </div>

      {/* Building filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
        {BUILDINGS.map(b => (
          <button key={b.id} onClick={() => setBuildingFilter(b.id)} style={{
            padding: '7px 16px', borderRadius: '100px', border: 'none', cursor: 'pointer',
            fontFamily: 'Heebo, sans-serif', fontWeight: '700', fontSize: '13px',
            background: buildingFilter === b.id
              ? (b.id === '14' ? '#1a6b4a' : b.id === '12' ? 'var(--primary)' : '#2d3748')
              : '#f0ede8',
            color: buildingFilter === b.id ? 'white' : 'var(--muted)',
            transition: 'all 0.15s',
          }}>
            {b.emoji} {b.label}
          </button>
        ))}
      </div>

      {/* Category filter */}
      {usedCategories.length > 1 && (
        <div style={{ display: 'flex', gap: '6px', marginBottom: '22px', flexWrap: 'wrap' }}>
          <button onClick={() => setCatFilter('all')} style={{
            padding: '5px 13px', borderRadius: '100px',
            border: `1.5px solid ${catFilter === 'all' ? 'var(--primary)' : 'var(--border)'}`,
            background: catFilter === 'all' ? '#e4edf8' : 'white',
            color: catFilter === 'all' ? 'var(--primary)' : 'var(--muted)',
            fontFamily: 'Heebo, sans-serif', fontWeight: '600', fontSize: '12px', cursor: 'pointer',
          }}>הכל ({afterBuilding.length})</button>
          {usedCategories.map(cat => {
            const c = CATEGORIES[cat]
            const count = afterBuilding.filter(d => d.category === cat).length
            if (!count) return null
            return (
              <button key={cat} onClick={() => setCatFilter(cat)} style={{
                padding: '5px 13px', borderRadius: '100px',
                border: `1.5px solid ${catFilter === cat ? c.text : 'var(--border)'}`,
                background: catFilter === cat ? c.color : 'white',
                color: catFilter === cat ? c.text : 'var(--muted)',
                fontFamily: 'Heebo, sans-serif', fontWeight: '600', fontSize: '12px', cursor: 'pointer',
              }}>
                {c?.icon} {c?.label || cat} ({count})
              </button>
            )
          })}
        </div>
      )}

      {loading && <div style={{ color: 'var(--muted)', fontSize: '14px', padding: '20px 0' }}>טוען...</div>}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '15px', padding: '50px 20px' }}>
          📭 אין מסמכים בסינון הנוכחי.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map(doc => {
          const cat = CATEGORIES[doc.category] || CATEGORIES.general
          return (
            <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'white', border: '1.5px solid var(--border)', borderRadius: '16px',
                padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px',
                transition: 'all 0.18s', cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 5px 16px rgba(0,0,0,0.10)'; e.currentTarget.style.borderColor = 'var(--primary)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                {/* Category icon */}
                <div style={{
                  width: '48px', height: '48px', borderRadius: '13px', flexShrink: 0,
                  background: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
                }}>
                  {cat.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text)', marginBottom: '7px', lineHeight: '1.4' }}>
                    {doc.title}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>📅 {formatDate(doc.publish_date)}</span>
                    <span style={{ fontSize: '10px', background: cat.color, color: cat.text, padding: '2px 8px', borderRadius: '100px', fontWeight: '700' }}>
                      {cat.label}
                    </span>
                    <BuildingBadge building={doc.building} />
                  </div>
                </div>

                {/* Download */}
                <div style={{
                  flexShrink: 0, background: '#f0ede8', borderRadius: '10px',
                  padding: '9px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                }}>
                  <span style={{ fontSize: '18px' }}>📥</span>
                  <span style={{ fontSize: '9px', color: 'var(--muted)', fontWeight: '700' }}>PDF</span>
                </div>
              </div>
            </a>
          )
        })}
      </div>
    </section>
  )
}
