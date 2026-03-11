import { useState } from 'react'
import SecretField from '../components/SecretField.jsx'

const tabs = [
  { id: 'manage',   label: 'חברת ניהול' },
  { id: 'vaad',     label: 'ועד הבית' },
  { id: 'boni',     label: 'בוני התיכון' },
  { id: 'whatsapp', label: 'וואטסאפ' },
]

function ManageTab() {
  return <>
    <div className="section-label">📞 יצירת קשר</div>
    <a href="tel:0364440424" className="contact-card">
      <div className="contact-icon" style={{background:'linear-gradient(135deg,#0f2540,#2a5a8c)'}}>🏢</div>
      <div className="contact-info"><div className="contact-label">משרד HIGH TOWER</div><div className="contact-number">03-6440424</div></div>
      <div className="contact-arrow">←</div>
    </a>
    <a href="tel:0505387076" className="contact-card">
      <div className="contact-icon" style={{background:'linear-gradient(135deg,#e8943a,#f5b86a)'}}>👤</div>
      <div className="contact-info"><div className="contact-label">אודי חסון – מנהל</div><div className="contact-number">050-5387076</div></div>
      <div className="contact-arrow">←</div>
    </a>
    <a href="tel:1800800751" className="contact-card">
      <div className="contact-icon" style={{background:'linear-gradient(135deg,#c0392b,#e74c3c)'}}>🚨</div>
      <div className="contact-info"><div className="contact-label">מוקד חירום 24/7</div><div className="contact-number">1-800-800-751</div></div>
      <div className="contact-arrow">←</div>
    </a>
    <div className="divider"></div>
    <div className="section-label">🏦 חשבון בנק לתשלום דמי ניהול</div>
    <div className="info-block">
      <strong>שם חשבון:</strong> היי טאוור אונו וואן בע״מ<br/>
      <strong>בנק:</strong> הפועלים (12) &nbsp;|&nbsp; <strong>סניף:</strong> 681 &nbsp;|&nbsp; <strong>חשבון:</strong> 689021
    </div>
    <div className="divider"></div>
    <div className="section-label">💰 תעריפים 2026</div>
    <div className="info-block green">
      חברת הניהול גובה <strong>5.16 ₪ למ״ר דירה בלבד.</strong><br/>
      <strong>דוגמה:</strong> דירה 115 מ״ר תשלם <strong>594 ₪ לחודש</strong>.
    </div>
    <div className="divider"></div>
    <div className="section-label">📄 מסמכים</div>
    <a className="link-btn outline" href="הסכם הי טאוור דיירים מתחם C.pdf" target="_blank" rel="noopener" style={{display:'flex',marginBottom:'10px'}}>📄 &nbsp; הסכם הי טאוור דיירים מתחם C</a>
    <a className="link-btn outline" href="נוהל התנהגות במתחם.pdf" target="_blank" rel="noopener" style={{display:'flex',marginBottom:'10px'}}>📄 &nbsp; נוהל התנהגות במתחם</a>
    <a className="link-btn outline" href="נוהל קבלנים.pdf" target="_blank" rel="noopener" style={{display:'flex'}}>📄 &nbsp; נוהל קבלנים</a>
  </>
}

function VaadTab() {
  return <>
    <div className="vaad-bldg-header">🏠 בניין עגנון 14</div>
    <div className="member-card"><div className="member-name">ערן</div><a href="tel:0544761051" className="member-phone">📞 054-4761051</a></div>
    <div className="member-card"><div className="member-name">ברוך</div><a href="tel:0522467061" className="member-phone">📞 052-2467061</a></div>
    <div className="vaad-bldg-header">🏠 בניין עגנון 12</div>
    <div className="member-card"><div className="member-name">סיגל</div><a href="tel:0545799774" className="member-phone">📞 054-5799774</a></div>
    <div className="member-card"><div className="member-name">ארז</div><a href="tel:0542121021" className="member-phone">📞 054-2121021</a></div>
    <div className="member-card"><div className="member-name">ואדים</div><a href="tel:0543098059" className="member-phone">📞 054-3098059</a></div>
    <div className="member-card"><div className="member-name">לילי</div><a href="tel:0542207522" className="member-phone">📞 054-2207522</a></div>
  </>
}

function BoniTab() {
  return <>
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
      <div className="member-name">אורי – בדק ומנהל עבודה בפרויקט</div>
      <a href="tel:0546333228" className="member-phone">📞 054-633-3228</a>
    </div>
    <div className="divider"></div>
    <div className="section-label">🔧 אביחי ראובנס – שירות פרטי</div>
    <div className="member-card" style={{flexDirection:'column', alignItems:'flex-start', gap:'10px'}}>
      <div>
        <div className="member-name">אביחי ראובנס</div>
        <div style={{fontSize:'13px', color:'var(--muted)', marginTop:'3px', lineHeight:'1.6'}}>
          עבד על הפרויקט מטעם בוני התיכון ומכיר את הבניינים לעומק.<br/>נותן שירות פרטי בתשלום. מאוד מומלץ.
        </div>
      </div>
      <a href="tel:0528253807" className="member-phone">📞 052-8253807</a>
    </div>
  </>
}

function WhatsappTab() {
  const groups = [
    { href:'https://chat.whatsapp.com/CKr8PqKHoe16wd1ws6yplI?mode=gi_t', cls:'', icon:'🏠', title:'בעלי דירות – בניין 12', sub:'לבעלי דירות בלבד', arrow:'#25D366' },
    { href:'https://chat.whatsapp.com/K1J3NVgHZ8MIkllbnSTXPa', cls:'', icon:'🏠', title:'בעלי דירות – בניין 14', sub:'לבעלי דירות בלבד', arrow:'#25D366' },
    { href:'https://chat.whatsapp.com/DNF4sr76SmOCcbvk1yNUP7', cls:'wa-announce', icon:'📢', title:'קבוצת הודעות – בניין 14', sub:'תת-קבוצה להודעות בלבד', arrow:'#e8a020' },
    { href:'https://chat.whatsapp.com/KewzsKaHGB2DTwEnrrberL?mode=hqrt3', cls:'wa-open', icon:'👥', title:'דיירים 12 ו-14', sub:'פתוח לכל הדיירים, לא רק בעלי דירות', arrow:'#2a8fd6' },
    { href:'https://chat.whatsapp.com/KpvS4NOrJ4C9gjyL268erJ?mode=hq2tcli', cls:'wa-project', icon:'🏙️', title:'כל פרויקט אונו וואן', sub:'כולל כלל הבניינים המאוכלסים בפרויקט', arrow:'#7c5cbf' },
  ]
  return <>
    {groups.map(g => (
      <a key={g.title} href={g.href} target="_blank" rel="noopener" className={`wa-card ${g.cls}`}>
        <div className="wa-icon">{g.icon}</div>
        <div className="wa-info"><div className="wa-title">{g.title}</div><div className="wa-sub">{g.sub}</div></div>
        <div className="wa-arrow" style={{color:g.arrow}}>←</div>
      </a>
    ))}
  </>
}

export default function ContactsPage({ initialTab }) {
  const [active, setActive] = useState(initialTab || 'manage')
  return (
    <div className="card">
      <div className="panel-title"><div className="icon">📇</div>אנשי קשר</div>
      <div className="ctab-bar">
        {tabs.map(t => (
          <button key={t.id} className={`ctab-btn${active === t.id ? ' active' : ''}`}
            onClick={() => setActive(t.id)}>{t.label}</button>
        ))}
      </div>
      <div className="ctab-body">
        {active === 'manage'   && <ManageTab />}
        {active === 'vaad'     && <VaadTab />}
        {active === 'boni'     && <BoniTab />}
        {active === 'whatsapp' && <WhatsappTab />}
      </div>
    </div>
  )
}
