import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

export default function Pros() {
  const [pros, setPros] = useState([])
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)
  const [activecat, setActivecat] = useState(null)
  const [showRecommend, setShowRecommend] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('pro_categories').select('*').order('label'),
      supabase.from('professionals').select('*').eq('active', true).order('id'),
    ]).then(([{ data: catData }, { data: proData }]) => {
      setCats(catData || [])
      setPros(proData || [])
      if (catData && proData) {
        const first = catData.find(c => proData.some(p => p.categories?.includes(c.id)))
        if (first) setActivecat(first.id)
      }
      setLoading(false)
    })
  }, [])

  const filtered = pros.filter(p => p.categories?.includes(activecat))
  const catsWithPros = cats.filter(c => pros.some(p => p.categories?.includes(c.id)))

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '8px' }}>
        <div className="panel-title" style={{ marginBottom: 0 }}><div className="icon">⭐</div>בעלי מקצוע מומלצים</div>
        <button onClick={() => setShowRecommend(v => !v)} style={{
          background: showRecommend ? '#f0ede8' : 'var(--primary)', color: showRecommend ? 'var(--muted)' : 'white',
          border: 'none', borderRadius: '100px', padding: '7px 16px', fontSize: '12px',
          fontWeight: '700', cursor: 'pointer', fontFamily: 'Heebo, sans-serif', whiteSpace: 'nowrap',
          transition: 'all 0.15s',
        }}>
          {showRecommend ? '✕ ביטול' : '💡 המלץ על איש מקצוע'}
        </button>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>המלצות שעלו מדיירי הבניין.</p>

      {showRecommend && <RecommendForm cats={cats} onClose={() => setShowRecommend(false)} />}

      {loading ? <div style={{ color: 'var(--muted)', fontSize: '14px' }}>טוען...</div> : <>
        <div className="ctab-bar">
          {catsWithPros.map(cat => (
            <button key={cat.id} className={`ctab-btn${activecat === cat.id ? ' active' : ''}`}
              onClick={() => setActivecat(cat.id)}>
              {cat.label}
            </button>
          ))}
        </div>
        <div className="ctab-body">
          {filtered.length === 0 ? (
            <div className="info-block" style={{ color: 'var(--muted)', fontSize: '14px' }}>
              עדיין אין המלצות בקטגוריה זו.
            </div>
          ) : filtered.map(p => (
            <div key={p.id} className="pro-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div className="pro-name">{p.name}</div>
                {p.lives_in_building && (
                  <span style={{ fontSize: '11px', background: '#fff3b0', color: '#7a5c00', padding: '2px 7px', borderRadius: '100px', fontWeight: '700' }}>
                    ⭐ גר/ה בבניין
                  </span>
                )}
              </div>
              {p.desc && <div className="pro-desc">{p.desc}</div>}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                {p.link_url && (
                  <a href={p.link_url} target="_blank" rel="noopener" className="pro-phone"
                    style={p.link_label?.includes('אינסטגרם') ? { background: '#c13584' } : {}}>
                    {p.link_label || p.link_url}
                  </a>
                )}
                {p.phone
                  ? <a href={`tel:${p.phone.replace(/-/g, '')}`} className="pro-phone">📞 {p.phone}</a>
                  : <span className="pro-phone-missing">📞 טלפון – בקרוב</span>
                }
              </div>
            </div>
          ))}
        </div>
      </>}
    </div>
  )
}

function RecommendForm({ cats, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', desc: '', category_id: '', recommender_name: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const f = k => e => setForm(x => ({ ...x, [k]: e.target.value }))

  const inp = { width: '100%', padding: '9px 12px', borderRadius: '9px', border: '1.5px solid var(--border)', fontSize: '14px', fontFamily: 'Heebo, sans-serif', background: '#fafaf8', boxSizing: 'border-box' }
  const lbl = { fontSize: '11px', fontWeight: '700', color: 'var(--muted)', marginBottom: '5px', display: 'block' }

  const submit = async () => {
    if (!form.name.trim() || !form.category_id) return
    setSubmitting(true)
    await supabase.from('pro_recommendations').insert([{
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      desc: form.desc.trim() || null,
      category_id: form.category_id,
      recommender_name: form.recommender_name.trim() || null,
      status: 'pending',
    }])
    setSubmitting(false)
    setDone(true)
  }

  if (done) return (
    <div style={{ background: '#e8f9ee', border: '1.5px solid #bce8cc', borderRadius: '12px', padding: '18px', marginBottom: '16px', textAlign: 'center' }}>
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
      <div style={{ fontWeight: '700', color: '#1a6b3a', marginBottom: '6px' }}>תודה! ההמלצה התקבלה</div>
      <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '14px' }}>ועד הבית יבדוק ויאשר לפני הוספה לרשימה.</div>
      <button onClick={onClose} style={{ background: '#1a6b3a', color: 'white', border: 'none', borderRadius: '100px', padding: '8px 20px', fontFamily: 'Heebo, sans-serif', fontWeight: '700', cursor: 'pointer' }}>סגור</button>
    </div>
  )

  return (
    <div style={{ background: '#fffbf0', border: '1.5px solid #f0d060', borderRadius: '12px', padding: '16px', marginBottom: '18px' }}>
      <div style={{ fontWeight: '700', fontSize: '14px', color: '#7a6000', marginBottom: '12px' }}>💡 המלצה על איש מקצוע</div>

      <div style={{ marginBottom: '10px' }}>
        <span style={lbl}>קטגוריה *</span>
        <select value={form.category_id} onChange={f('category_id')} style={{ ...inp, cursor: 'pointer' }}>
          <option value="">-- בחר קטגוריה --</option>
          {cats.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '140px' }}>
          <span style={lbl}>שם איש המקצוע *</span>
          <input value={form.name} onChange={f('name')} placeholder="ישראל ישראלי" style={inp} />
        </div>
        <div style={{ flex: 1, minWidth: '140px' }}>
          <span style={lbl}>טלפון</span>
          <input value={form.phone} onChange={f('phone')} placeholder="05x-xxxxxxx" dir="ltr" style={inp} />
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <span style={lbl}>תיאור קצר (רשות)</span>
        <textarea value={form.desc} onChange={f('desc')} placeholder="מה הוא עושה? למה אתה ממליץ?" rows={2}
          style={{ ...inp, resize: 'vertical', lineHeight: '1.6' }} />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <span style={lbl}>שמך (רשות)</span>
        <input value={form.recommender_name} onChange={f('recommender_name')} placeholder="כדי שהועד ידע מי ממליץ" style={inp} />
      </div>

      <div style={{ background: '#fffbea', border: '1px solid #f0d060', borderRadius: '8px', padding: '9px 12px', fontSize: '12px', color: '#7a6000', marginBottom: '14px' }}>
        ℹ️ ההמלצה <strong>לא תתפרסם אוטומטית</strong> — ועד הבית יבדוק ויאשר לפני הוספה לרשימה.
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={submit} disabled={submitting || !form.name.trim() || !form.category_id} style={{
          flex: 1, background: submitting || !form.name.trim() || !form.category_id ? '#ccc' : '#7a6000',
          color: 'white', border: 'none', borderRadius: '9px', padding: '10px',
          fontFamily: 'Heebo, sans-serif', fontWeight: '700', fontSize: '14px',
          cursor: submitting || !form.name.trim() || !form.category_id ? 'not-allowed' : 'pointer',
        }}>
          {submitting ? 'שולח...' : '📨 שלח להמלצה'}
        </button>
        <button onClick={onClose} style={{ background: '#f0ede8', color: 'var(--muted)', border: 'none', borderRadius: '9px', padding: '10px 16px', fontFamily: 'Heebo, sans-serif', cursor: 'pointer' }}>ביטול</button>
      </div>
    </div>
  )
}
