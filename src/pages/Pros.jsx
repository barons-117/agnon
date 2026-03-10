import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const CATEGORY_LABELS = {
  handyman:  '🔨 הנדימן',
  ac:        '❄️ מיזוג אוויר',
  carpenter: '🪚 נגרות',
  shower:    '🚿 מקלחונים',
  door:      '🚪 דלת ממ״ד',
  shelves:   '📦 מדפים',
  taxi:      '🚕 מונית',
  beauty:    '💆 קוסמטיקה',
  nails:     '💅 לק ג׳ל',
  pilates:   '🧘 פילאטיס',
}

export default function Pros() {
  const [pros, setPros] = useState([])
  const [loading, setLoading] = useState(true)
  const [activecat, setActivecat] = useState(null)

  useEffect(() => {
    supabase.from('professionals').select('*')
      .eq('active', true).order('id')
      .then(({ data }) => {
        setPros(data || [])
        if (data && data.length > 0) {
          const first = data[0].category
          setActivecat(first)
        }
        setLoading(false)
      })
  }, [])

  // Build categories list from actual data, preserving order
  const cats = []
  const seen = new Set()
  pros.forEach(p => {
    if (!seen.has(p.category)) {
      seen.add(p.category)
      cats.push({ id: p.category, label: CATEGORY_LABELS[p.category] || p.category })
    }
  })

  const filtered = pros.filter(p => p.category === activecat)

  return (
    <div className="card">
      <div className="panel-title"><div className="icon">⭐</div>בעלי מקצוע מומלצים</div>
      <p style={{fontSize:'13px', color:'var(--muted)', marginBottom:'16px'}}>המלצות שעלו מדיירי הבניין בקבוצת הוואטסאפ.</p>

      {loading ? (
        <div style={{color:'var(--muted)', fontSize:'14px'}}>טוען...</div>
      ) : <>
        <div className="pros-tabs">
          {cats.map(cat => (
            <button key={cat.id}
              className={`pro-tab-btn${activecat === cat.id ? ' active' : ''}`}
              onClick={() => setActivecat(cat.id)}>
              {cat.label}
            </button>
          ))}
        </div>

        <div className="pro-panel active">
          {filtered.length === 0 ? (
            <div className="info-block" style={{color:'var(--muted)', fontSize:'14px'}}>
              עדיין אין המלצות בקטגוריה זו.
            </div>
          ) : filtered.map(p => (
            <div key={p.id} className="pro-card">
              <div style={{display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap'}}>
                <div className="pro-name">{p.name}</div>
                {p.lives_in_building && (
                  <span style={{fontSize:'11px', background:'#fff3b0', color:'#7a5c00',
                    padding:'2px 7px', borderRadius:'100px', fontWeight:'700'}}>
                    ⭐ גר/ה בבניין
                  </span>
                )}
              </div>
              {p.desc && <div className="pro-desc">{p.desc}</div>}
              <div style={{display:'flex', gap:'8px', flexWrap:'wrap', marginTop:'6px'}}>
                {p.link_url && (
                  <a href={p.link_url} target="_blank" rel="noopener" className="pro-phone"
                    style={p.link_label?.includes('אינסטגרם') ? {background:'#c13584'} : {}}>
                    {p.link_label || p.link_url}
                  </a>
                )}
                {p.phone
                  ? <a href={`tel:${p.phone.replace(/-/g,'')}`} className="pro-phone">📞 {p.phone}</a>
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
