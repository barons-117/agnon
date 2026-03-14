import React from 'react'
import SecretField from '../components/SecretField.jsx'
import FileAttachment from '../components/FileAttachment.jsx'

export function Boni() {
  return (
    <div className="card">
      <div className="panel-title"><div className="icon">🏗️</div>בוני התיכון</div>

      <div className="section-label">👤 אנשי קשר</div>

      <div className="member-card" style={{flexDirection:'column', alignItems:'flex-start', gap:'10px'}}>
        <div>
          <div className="member-name">חן שושן – בדק בית</div>
          <div style={{fontSize:'13px', color:'var(--muted)', marginTop:'3px'}}>
            <a href="mailto:info@boh.co.il" style={{color:'var(--accent2)', textDecoration:'none'}}>info@boh.co.il</a>
            &nbsp;|&nbsp;
            <a href="mailto:bedek4u@boh.co.il" style={{color:'var(--accent2)', textDecoration:'none'}}>bedek4u@boh.co.il</a>
          </div>
        </div>
        <a href="tel:0545035577" className="member-phone">📞 054-503-5577</a>
      </div>

      <div className="member-card" style={{flexDirection:'column', alignItems:'flex-start', gap:'10px'}}>
        <div>
          <div className="member-name">אורי – בדק ומנהל עבודה בפרויקט</div>
        </div>
        <a href="tel:0546333228" className="member-phone">📞 054-633-3228</a>
      </div>

    </div>
  )
}

export function Vaad() {
  return (
    <div className="card">
      <div className="panel-title"><div className="icon">👥</div>חברי ועד הבית</div>
      <div className="vaad-bldg-header">🏠 בניין עגנון 14</div>
      <div className="member-card"><div className="member-name">ערן</div><a href="tel:0544761051" className="member-phone">📞 054-4761051</a></div>
      <div className="member-card"><div className="member-name">ברוך</div><a href="tel:0522467061" className="member-phone">📞 052-2467061</a></div>
      <div className="vaad-bldg-header">🏠 בניין עגנון 12</div>
      <div className="member-card"><div className="member-name">סיגל</div><a href="tel:0545799774" className="member-phone">📞 054-5799774</a></div>
      <div className="member-card"><div className="member-name">ארז</div><a href="tel:0542121021" className="member-phone">📞 054-2121021</a></div>
      <div className="member-card"><div className="member-name">ואדים</div><a href="tel:0543098059" className="member-phone">📞 054-3098059</a></div>
      <div className="member-card"><div className="member-name">לילי</div><a href="tel:0542207522" className="member-phone">📞 054-2207522</a></div>
    </div>
  )
}

export function VaadNotices() {
  const [notices, setNotices] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [activeBuilding, setActiveBuilding] = React.useState('both')

  React.useEffect(() => {
    import('../lib/supabase.js').then(({ supabase }) => {
      supabase.from('notices').select('*').order('date', { ascending: false })
        .then(({ data }) => { setNotices(data || []); setLoading(false) })
        .catch(() => setLoading(false))
    })
  }, [])

  const buildingTabs = [
    { id: 'both', label: 'שני הבניינים' },
    { id: '12',   label: 'עגנון 12' },
    { id: '14',   label: 'עגנון 14' },
  ]

  const filtered = notices.filter(n => {
    if (activeBuilding === 'both') return n.building === 'both'
    return n.building === activeBuilding || n.building === 'both'
  })

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '8px' }}>
        <div className="panel-title" style={{ marginBottom: 0 }}><div className="icon">📣</div>הודעות וועד הבית</div>
        <a href="#documents" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: '#f0ede8', border: '1px solid var(--border)',
          borderRadius: '100px', padding: '6px 14px',
          fontSize: '12px', fontWeight: '700', color: 'var(--primary)',
          textDecoration: 'none', transition: 'all 0.15s', whiteSpace: 'nowrap',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#e4edf8'}
          onMouseLeave={e => e.currentTarget.style.background = '#f0ede8'}
        >
          📁 פרוטוקולים ומסמכים
        </a>
      </div>

      <div className="ctab-bar">
        {buildingTabs.map(tab => (
          <button
            key={tab.id}
            className={`ctab-btn${activeBuilding === tab.id ? ' active' : ''}`}
            onClick={() => setActiveBuilding(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="ctab-body" style={{marginBottom:'8px'}}>

      {loading && <div style={{color:'var(--muted)',fontSize:'14px'}}>טוען...</div>}

      {!loading && filtered.length === 0 && (
        <div className="info-block" style={{textAlign:'center',color:'var(--muted)',fontSize:'15px',padding:'32px 18px'}}>
          📭 אין הודעות כרגע.
        </div>
      )}

      {filtered.map((n, i) => (
        <div key={n.id} style={{
          background: 'white',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '18px 20px',
          marginBottom: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          {/* Header row */}
          <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'10px', gap:'8px'}}>
            <div style={{fontWeight:'800', fontSize:'15px', color:'var(--primary)', lineHeight:'1.4'}}>{n.title}</div>
            <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px', flexShrink:0}}>
              <div style={{
                fontSize:'11px', background:'#f0ede8', color:'var(--muted)',
                padding:'3px 9px', borderRadius:'100px', fontWeight:'600', whiteSpace:'nowrap'
              }}>📅 {n.date}</div>
              {n.building === 'both' ? (
                <div style={{display:'flex', gap:'4px'}}>
                  <div style={{fontSize:'10px', background:'#e4edf8', color:'#1a3a5c', padding:'2px 7px', borderRadius:'100px', fontWeight:'700'}}>עגנון 12</div>
                  <div style={{fontSize:'10px', background:'#e4edf8', color:'#1a3a5c', padding:'2px 7px', borderRadius:'100px', fontWeight:'700'}}>עגנון 14</div>
                </div>
              ) : (
                <div style={{fontSize:'10px', background:'#e4edf8', color:'#1a3a5c', padding:'2px 7px', borderRadius:'100px', fontWeight:'700'}}>
                  עגנון {n.building}
                </div>
              )}
            </div>
          </div>
          {/* Divider */}
          <div style={{height:'1px', background:'var(--border)', marginBottom:'10px'}}></div>
          {/* Content */}
          <div style={{fontSize:'14px', lineHeight:'1.8', color:'var(--text)', whiteSpace:'pre-line'}}>{n.text}</div>
          <FileAttachment url={n.file_url} name={n.file_name} />
        </div>
      ))}
      </div>
    </div>
  )
}

export function Wifi() {
  return (
    <div className="card">
      <div className="panel-title"><div className="icon">📶</div>WiFi וקודי כניסה</div>
      <div className="section-label">רשת אלחוטית – חניון, לובי, חדר דיירים</div>
      <div className="wifi-box">
        <div className="wifi-label">שם הרשת</div>
        <div className="wifi-val">Shay Agnon 12-14</div>
        <div style={{height:'10px'}}></div>
        <div className="wifi-label">סיסמה</div>
        <div className="wifi-val">
          <SecretField secret="11223344" />
        </div>
        <div className="no-share">🔒 נא לא להפיץ</div>
      </div>
      <div className="divider"></div>
      <div className="section-label">קודי כניסה לבניינים</div>
      <div className="code-grid">
        <div className="code-card">
          <div className="bldg-name">בניין עגנון 12</div>
          <div className="bldg-code"><SecretField secret="3280" dots="••••" large /></div>
        </div>
        <div className="code-card">
          <div className="bldg-name">בניין עגנון 14</div>
          <div className="bldg-code"><SecretField secret="1973" dots="••••" large /></div>
        </div>
      </div>
      <div className="no-share dark" style={{textAlign:'center',marginTop:'6px'}}>🔒 נא לא להפיץ</div>
    </div>
  )
}

export function Cleaning() {
  const [tab, setTab] = React.useState('schedule')
  return (
    <div className="card">
      <div className="panel-title"><div className="icon">🧹</div>ניקיון ואשפה</div>
      <div className="ctab-bar">
        {[
          { id:'schedule', label:'ימי ניקיון' },
          { id:'gazem',    label:'פינוי גזם' },
          { id:'pit',      label:'פיר אשפה' },
          { id:'recycle',  label:'פחי מחזור' },
        ].map(t => (
          <button key={t.id} className={`ctab-btn${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>
      <div className="ctab-body">
      {tab === 'schedule' && <>
        <div className="clean-row"><div className="clean-area"><span className="clean-icon">🚪</span><span className="clean-name">לובי</span></div><div className="clean-days"><span className="day-badge daily">כל יום</span></div></div>
        <div className="clean-row"><div className="clean-area"><span className="clean-icon">🏠</span><span className="clean-name">קומות 1–10</span></div><div className="clean-days"><span className="day-badge">ראשון</span><span className="day-badge">רביעי</span></div></div>
        <div className="clean-row"><div className="clean-area"><span className="clean-icon">🏠</span><span className="clean-name">קומות 11–20</span></div><div className="clean-days"><span className="day-badge">שני</span><span className="day-badge">חמישי</span></div></div>
        <div className="clean-row"><div className="clean-area"><span className="clean-icon">🗑️</span><span className="clean-name">חדרי אשפה</span></div><div className="clean-days"><span className="day-badge daily">כל יום</span></div></div>
        <div className="clean-row" style={{borderBottom:'none'}}>
          <div className="clean-area"><span className="clean-icon">🚗</span><span className="clean-name">לובאים חניון</span></div>
          <div className="clean-days" style={{flexDirection:'column',alignItems:'flex-end',gap:'5px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'5px'}}><span style={{fontSize:'11px',color:'var(--muted)'}}>סריקה ואשפה</span><span className="day-badge daily">כל יום</span></div>
            <div style={{display:'flex',alignItems:'center',gap:'5px'}}><span style={{fontSize:'11px',color:'var(--muted)'}}>שטיפה</span><span className="day-badge wash">שלישי</span><span className="day-badge wash">שישי</span></div>
          </div>
        </div>
      </>}
      {tab === 'gazem' && <>
        <div className="info-block green" style={{marginBottom:'12px'}}>
          עיריית קריית אונו מפנה גזם ופסולת גדולה <strong>פעמיים בשבוע בלבד</strong> — בימי <strong>ראשון</strong> ו<strong>רביעי</strong>.<br/><br/>
          יש להניח את הגזם באזור המסומן בירוק — ליד הכניסה לחניון — <strong>רק בימים אלה</strong>.
        </div>
        <div style={{display:'flex', gap:'10px', marginBottom:'16px'}}>
          <div style={{flex:1, background:'#f0fbf4', border:'1.5px solid #bce8cc', borderRadius:'12px', padding:'14px', textAlign:'center'}}><div style={{fontSize:'22px', marginBottom:'4px'}}>☀️</div><div style={{fontWeight:'800', fontSize:'15px', color:'#1a5c38'}}>ראשון</div></div>
          <div style={{flex:1, background:'#f0fbf4', border:'1.5px solid #bce8cc', borderRadius:'12px', padding:'14px', textAlign:'center'}}><div style={{fontSize:'22px', marginBottom:'4px'}}>☀️</div><div style={{fontWeight:'800', fontSize:'15px', color:'#1a5c38'}}>רביעי</div></div>
        </div>
        <div style={{fontSize:'13px', color:'var(--muted)', marginBottom:'10px', fontWeight:'600'}}>📍 אזור ההנחה המאושר:</div>
        <div style={{borderRadius:'12px', overflow:'hidden', border:'1px solid var(--border)'}}>
          <img src={import.meta.env.BASE_URL + 'gazem-area.png'} alt="אזור פינוי גזם" style={{width:'100%', display:'block'}} />
        </div>
        <div style={{fontSize:'12px', color:'var(--muted)', marginTop:'8px', textAlign:'center'}}>האזור המסומן בירוק — ליד הכניסה לחניון</div>
      </>}
      {tab === 'pit' && <div className="info-block">בכל קומה יש פיר אשפה. <strong>ביציאה מהמעלית פונים ימינה</strong>, שוב ימינה – יש דלת קטנה לפיר האשפה.</div>}
      {tab === 'recycle' && <div className="info-block amber">♻️ המחזור הוא <strong>ידני</strong> – הפחים הכתום והכחול נמצאים <strong>בחזית הבניין</strong>.<br/>נא להוריד בעצמכם ולמיין לפח המתאים.</div>}
      </div>
    </div>
  )
}

export function Trash() { return null }
