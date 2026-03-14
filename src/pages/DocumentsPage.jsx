import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const CATEGORIES = {
  vaad:     { label: 'הודעות ועד',     icon: '📣' },
  protocol: { label: 'פרוטוקולים',     icon: '📋' },
  meeting:  { label: 'סיכומי פגישות',  icon: '🤝' },
  legal:    { label: 'מסמכים משפטיים', icon: '⚖️' },
  general:  { label: 'כללי',           icon: '📄' },
}

function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    supabase.from('documents').select('*').order('publish_date', { ascending: false })
      .then(({ data }) => { setDocs(data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? docs : docs.filter(d => d.category === filter)

  const usedCategories = [...new Set(docs.map(d => d.category))]

  return (
    <section className="page-section">
      <div className="section-title">📁 סיכומים, פרוטוקולים ומסמכים</div>

      <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '20px', lineHeight: '1.7' }}>
        מאגר המסמכים הרשמיים של ועד הבית — פרוטוקולים, סיכומי פגישות, הודעות ועוד.
      </p>

      {/* Category filter */}
      {usedCategories.length > 1 && (
        <div className="ctab-bar" style={{ marginBottom: '16px' }}>
          <button className={`ctab-btn${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>
            הכל ({docs.length})
          </button>
          {usedCategories.map(cat => (
            <button key={cat} className={`ctab-btn${filter === cat ? ' active' : ''}`} onClick={() => setFilter(cat)}>
              {CATEGORIES[cat]?.icon} {CATEGORIES[cat]?.label || cat} ({docs.filter(d => d.category === cat).length})
            </button>
          ))}
        </div>
      )}

      {loading && <div style={{ color: 'var(--muted)', fontSize: '14px', padding: '20px 0' }}>טוען...</div>}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '15px', padding: '40px 20px' }}>
          📭 אין מסמכים כרגע.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map(doc => (
          <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'white', border: '1.5px solid var(--border)', borderRadius: '14px',
              padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px',
              transition: 'all 0.15s', cursor: 'pointer',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = '#f7f9ff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'white' }}
            >
              {/* Icon */}
              <div style={{
                width: '42px', height: '42px', borderRadius: '10px', flexShrink: 0,
                background: '#f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px',
              }}>
                {CATEGORIES[doc.category]?.icon || '📄'}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--primary)', marginBottom: '4px', lineHeight: '1.4' }}>
                  {doc.title}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>📅 {formatDate(doc.publish_date)}</span>
                  <span style={{ fontSize: '11px', background: '#e4edf8', color: '#1a3a5c', padding: '1px 7px', borderRadius: '100px', fontWeight: '600' }}>
                    {CATEGORIES[doc.category]?.label || doc.category}
                  </span>
                  {doc.building !== 'both' && (
                    <span style={{ fontSize: '11px', background: doc.building === '12' ? '#e4edf8' : '#e4f0ea', color: doc.building === '12' ? '#1a3a5c' : '#1a4a2c', padding: '1px 7px', borderRadius: '100px', fontWeight: '600' }}>
                      עגנון {doc.building}
                    </span>
                  )}
                </div>
              </div>

              {/* Download arrow */}
              <div style={{ color: 'var(--primary)', fontSize: '18px', flexShrink: 0 }}>↓</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
