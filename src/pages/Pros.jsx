import { useState } from 'react'
import { categories, professionals } from '../data/professionals.js'

export default function Pros() {
  const [activecat, setActivecat] = useState('clean')
  const filtered = professionals.filter(p => p.category === activecat)

  return (
    <div className="card">
      <div className="panel-title"><div className="icon">⭐</div>בעלי מקצוע מומלצים</div>
      <p style={{fontSize:'13px',color:'var(--muted)',marginBottom:'16px'}}>המלצות שעלו מדיירי הבניין בקבוצת הוואטסאפ.</p>

      <div className="pros-tabs">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`pro-tab-btn${activecat === cat.id ? ' active' : ''}`}
            onClick={() => setActivecat(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="pro-panel active">
        {filtered.length === 0 ? (
          <div className="info-block" style={{color:'var(--muted)',fontSize:'14px'}}>
            עדיין אין המלצות בקטגוריה זו. מוזמנים לשתף בקבוצת הוואטסאפ!
          </div>
        ) : filtered.map((p, i) => (
          <div key={i} className="pro-card">
            <div className="pro-name">{p.name}</div>
            {p.desc && <div className="pro-desc">{p.desc}</div>}
            {p.link && (
              <a href={p.link.url} target="_blank" rel="noopener"
                className="pro-phone"
                style={p.link.label.includes('אינסטגרם') ? {background:'#c13584',marginLeft:'8px'} : {}}>
                {p.link.label}
              </a>
            )}
            {p.phone
              ? <a href={`tel:${p.phone.replace(/-/g,'')}`} className="pro-phone" style={{marginRight: p.link ? '8px' : '0'}}>📞 {p.phone}</a>
              : <span className="pro-phone-missing">📞 טלפון – בקרוב</span>
            }
          </div>
        ))}
      </div>
    </div>
  )
}
