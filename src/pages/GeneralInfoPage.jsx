import { useState } from 'react'
import SecretField from '../components/SecretField.jsx'

const tabs = [
  { id: 'postal',    label: '📮 מיקוד' },
  { id: 'gush',      label: '📐 גוש וחלקה' },
  { id: 'address',   label: '🛣️ כתובות' },
  { id: 'elevator',  label: '🛗 מעלית' },
  { id: 'arnona',    label: '🏙️ ארנונה' },
  { id: 'ac',        label: '❄️ מיזוג' },
]

function PostalTab() {
  return <>
    <div className="section-label">מיקוד</div>
    <div className="info-row"><span className="label">עגנון 12</span><span className="value">5560622</span></div>
    <div className="info-row" style={{borderBottom:'none'}}><span className="label">עגנון 14</span><span className="value">5560624</span></div>
  </>
}

function GushTab() {
  return <>
    <div className="section-label">גוש חלקה</div>
    <div className="info-row"><span className="label">עגנון 12</span><span className="value" style={{fontSize:'14px'}}>גוש 6496 &nbsp;|&nbsp; חלקה 519</span></div>
    <div className="info-row" style={{borderBottom:'none'}}><span className="label">עגנון 14</span><span className="value" style={{fontSize:'14px'}}>גוש 6496 &nbsp;|&nbsp; חלקה 520</span></div>
  </>
}

function AddressTab() {
  return <>
    <div className="section-label">כתובת על לוי אשכול</div>
    <div className="info-row"><span className="label">עגנון 12</span><span className="value">לוי אשכול 75</span></div>
    <div className="info-row" style={{borderBottom:'none'}}><span className="label">עגנון 14</span><span className="value">לוי אשכול 77</span></div>
  </>
}

function ElevatorTab() {
  return <>
    <div className="section-label">🛗 מידות מעליות</div>
    <div className="info-row"><span className="label">מעלית משא – דלת</span><span className="value">2.10 × 0.90 מ׳</span></div>
    <div className="info-row"><span className="label">מעלית משא – פנים</span><span className="value">2.50 × 0.95 מ׳</span></div>
    <div className="info-row"><span className="label">מעלית רגילה – פתח</span><span className="value">רוחב 88 ס״מ &nbsp;|&nbsp; גובה 215 ס״מ</span></div>
    <div className="info-row" style={{borderBottom:'none'}}><span className="label">מעלית רגילה – תא פנים</span><span className="value">אורך 204 ס״מ &nbsp;|&nbsp; אלכסון ~290 ס״מ</span></div>
  </>
}

function ArnonaTab() {
  return <>
    <p style={{fontSize:'13.5px', color:'var(--muted)', marginBottom:'14px'}}>
      הבניין שלנו (מעל 3 דירות, <strong>אזור א׳</strong> בצו הארנונה):
    </p>
    <table className="rate-table">
      <thead><tr><th>גודל הדירה</th><th>תעריף למ״ר</th></tr></thead>
      <tbody>
        <tr><td>56–75 מ״ר</td><td>62.63 ₪</td></tr>
        <tr><td>76–95 מ״ר</td><td>65.60 ₪</td></tr>
        <tr><td>96–125 מ״ר</td><td>68.75 ₪</td></tr>
        <tr><td>מעל 125 מ״ר (סוג 2)</td><td>82.11 ₪</td></tr>
      </tbody>
    </table>
    <div className="info-block amber">
      📐 <strong>שטח לארנונה בקריית אונו כולל מרפסת.</strong><br/>
      לדוגמה: דירה 115 מ״ר + מרפסת 13 מ״ר = 128 מ״ר.
    </div>
    <div className="note">
      <strong>⚠️ שימו לב:</strong> הסכום הוא <strong>שנתי</strong>. חלקו ב-6 לתשלום דו-חודשי, או ב-12 לחודשי 😉
    </div>
    <div className="divider"></div>
    <p style={{fontSize:'12.5px', color:'var(--muted)', marginBottom:'8px'}}>מתוך <strong>צו הארנונה 2026</strong> של עיריית קריית אונו:</p>
    <a className="link-btn outline" href="https://www.kiryatono.muni.il/uploads/n/1751522566.8385.pdf" target="_blank" rel="noopener">
      📄 &nbsp; צו הארנונה המלא
    </a>
  </>
}

function ACTab() {
  return <>
    <div className="section-label">סרטון הדרכה: ביטול נעילת ילדים בלוח הבקרה</div>
    <video controls style={{width:'100%', borderRadius:'12px', marginBottom:'8px', background:'#000'}}
      src={import.meta.env.BASE_URL + 'מדריך_ביטול_נעילת_ילדים_בלוח_בקרה_קירי.mp4'}>
      הדפדפן שלך אינו תומך בהפעלת וידאו.
    </video>
    <div className="divider" style={{marginTop:'16px'}}></div>
    <div className="section-label">קישור לשלט למזגן (AliExpress)</div>
    <div className="info-block">🎛️ שלט שהומלץ על ידי דיירים – <strong>עובד מעולה בלי קידוד</strong>.</div>
    <a className="link-btn" href="https://a.aliexpress.com/_c3MVh3yL" target="_blank" rel="noopener">
      🛒 &nbsp; לקנות שלט ב-AliExpress
    </a>
  </>
}

export default function GeneralInfoPage() {
  const [active, setActive] = useState('postal')
  return (
    <div className="card">
      <div className="panel-title"><div className="icon">ℹ️</div>מידע כללי נוסף</div>
      <div style={{display:'flex', gap:'6px', marginBottom:'20px', flexWrap:'wrap', borderBottom:'1px solid var(--border)', paddingBottom:'14px'}}>
        {tabs.map(t => (
          <button key={t.id} className={`pro-tab-btn${active === t.id ? ' active' : ''}`}
            onClick={() => setActive(t.id)}>{t.label}</button>
        ))}
      </div>
      {active === 'postal'   && <PostalTab />}
      {active === 'gush'     && <GushTab />}
      {active === 'address'  && <AddressTab />}
      {active === 'elevator' && <ElevatorTab />}
      {active === 'arnona'   && <ArnonaTab />}
      {active === 'ac'       && <ACTab />}
    </div>
  )
}
