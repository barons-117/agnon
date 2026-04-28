import { useState } from 'react'

const IconBuilding = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/>
    <path d="M9 9h1m4 0h1M9 13h1m4 0h1"/>
  </svg>
)

const IconGear = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

const IconSkyline = () => (
  <svg width="28" height="28" viewBox="0 0 100 80" fill="currentColor">
    <rect x="5" y="55" width="12" height="25" rx="1"/>
    <rect x="3" y="45" width="16" height="12" rx="1"/>
    <rect x="6" y="38" width="3" height="9"/>
    <rect x="13" y="38" width="3" height="9"/>
    <rect x="20" y="50" width="10" height="30" rx="1"/>
    <rect x="19" y="42" width="12" height="10" rx="1"/>
    <rect x="33" y="35" width="18" height="45" rx="1"/>
    <rect x="35" y="27" width="4" height="10"/>
    <rect x="43" y="27" width="4" height="10"/>
    <rect x="36" y="42" width="5" height="7" rx="1"/>
    <rect x="44" y="42" width="5" height="7" rx="1"/>
    <rect x="36" y="53" width="5" height="7" rx="1"/>
    <rect x="44" y="53" width="5" height="7" rx="1"/>
    <rect x="54" y="45" width="14" height="35" rx="1"/>
    <rect x="56" y="38" width="4" height="9"/>
    <rect x="62" y="38" width="4" height="9"/>
    <rect x="56" y="52" width="4" height="6" rx="1"/>
    <rect x="63" y="52" width="4" height="6" rx="1"/>
    <rect x="71" y="58" width="10" height="22" rx="1"/>
    <rect x="70" y="50" width="12" height="10" rx="1"/>
    <rect x="83" y="52" width="14" height="28" rx="1"/>
    <rect x="85" y="44" width="4" height="10"/>
    <rect x="91" y="44" width="4" height="10"/>
    <rect x="0" y="78" width="100" height="2" rx="1"/>
  </svg>
)

const IconInfo = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="8.01" strokeWidth="2.5"/>
    <line x1="12" y1="11" x2="12" y2="16"/>
  </svg>
)

const categories = [
  {
    id: 'property', label: 'פרטי הנכס', Icon: IconBuilding,
    tabs: [
      { id: 'postal',  label: 'מיקוד' },
      { id: 'gush',    label: 'גוש וחלקה' },
      { id: 'address', label: 'כתובות' },
    ]
  },
  {
    id: 'systems', label: 'מערכות בדירות', Icon: IconGear,
    tabs: [
      { id: 'ac',       label: 'מיזוג אוויר' },
      { id: 'heatpump', label: 'משאבת חום מים' },
      { id: 'intercom', label: 'אינטרקום' },
    ]
  },
  {
    id: 'municipal', label: 'עירוני', Icon: IconSkyline,
    tabs: [
      { id: 'arnona', label: 'ארנונה' },
    ]
  },
  {
    id: 'general', label: 'מידע כללי', Icon: IconInfo,
    tabs: [
      { id: 'elevator', label: 'מעלית' },
      { id: 'cellular', label: 'קליטה סלולרית' },
    ]
  },
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
    <div className="section-label">מידות מעליות</div>
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
    <div className="info-block">שלט שהומלץ על ידי דיירים – <strong>עובד מעולה בלי קידוד</strong>.</div>
    <a className="link-btn" href="https://a.aliexpress.com/_c3MVh3yL" target="_blank" rel="noopener">
      לקנות שלט ב-AliExpress
    </a>
    <div className="divider" style={{marginTop:'16px'}}></div>
    <div className="section-label">הוראות הפעלה — בקר מזגן קירי ELCO</div>
    <a className="link-btn outline" href={import.meta.env.BASE_URL + 'הוראות_הפעלה_בקר_מזגן_קירי_אלקו.pdf'} target="_blank" rel="noopener">
      📄 &nbsp; הוראות הפעלה בקר מזגן קירי ELCO
    </a>
  </>
}

function HeatPumpTab() {
  return <>
    <div className="section-label">משאבת חום לחימום מים</div>
    <div className="info-block" style={{marginBottom:'16px', lineHeight:'1.8'}}>
      בקומות <strong>1–10</strong> בבניין מופעלות <strong>משאבות חום</strong> לצורך חימום מי הדוד.
      מדובר במערכת יעילה אנרגטית המחממת מים חמים לשימוש ביתי.
    </div>
    <div className="section-label">הוראות הפעלה</div>
    <a className="link-btn" href={import.meta.env.BASE_URL + 'חוברת_הפעלה_משאבת_חום_מים.pdf'} target="_blank" rel="noopener">
      📄 &nbsp; חוברת הפעלה — משאבת חום מים
    </a>
  </>
}

function CellularTab() {
  return <>
    <div className="section-label">בעיית קליטה סלולרית באזור</div>
    <p style={{fontSize:'14px', color:'var(--text)', lineHeight:'1.8', marginBottom:'16px'}}>
      בקריית אונו בכלל, ובשכונה ובבניינים שלנו בפרט, קיימת בעיית קליטה סלולרית ידועה — וזה כמעט ללא הבדל בין חברות הסלולר.
      בחניון המצב חריף יותר: אין כלל רשת סלולרית, וניתן לתקשר שם רק דרך ה-WiFi של הבניין.
    </p>
    <div className="divider"></div>
    <div className="section-label">WiFi Calling — פתרון מובנה בטלפון</div>
    <p style={{fontSize:'14px', color:'var(--text)', lineHeight:'1.8', marginBottom:'12px'}}>
      WiFi Calling היא תכונה מובנית בכל סמארטפון מודרני המאפשרת לבצע שיחות טלפון ולשלוח הודעות SMS דרך רשת WiFi —
      בדיוק כמו שיחה רגילה, עם אותו מספר טלפון, ללא אפליקציה נוספת.
    </p>
    <p style={{fontSize:'14px', color:'var(--text)', lineHeight:'1.8', marginBottom:'16px'}}>
      הטלפון מזהה שאין קליטה סלולרית מספקת ומנתב אוטומטית את השיחה דרך האינטרנט אל ספק הסלולר — ומשם כרגיל.
      כשהקליטה הסלולרית חוזרת, הטלפון עובר אליה בצורה חלקה.
    </p>
    <div className="info-block" style={{marginBottom:'16px', lineHeight:'1.9'}}>
      <strong>כמה דברים חשוב לדעת:</strong>
      <br/>לא נדרשת אפליקציה — עובד עם מחייגן הטלפון הרגיל
      <br/>לא נצרך מדטה סלולרי — השיחה עוברת דרך ה-WiFi בלבד
      <br/>נדרש שחברת הסלולר שלכם תומכת בתכונה — רוב החברות בישראל תומכות
      <br/>מומלץ להשאיר פעיל תמיד — הטלפון יעבור בין WiFi לסלולר לפי הצורך
    </div>
    <div className="divider"></div>
    <div className="section-label">מדריכי הפעלה</div>
    <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
      <a className="link-btn" href="https://www.youtube.com/shorts/2HavdsT3n4I" target="_blank" rel="noopener">
        מדריך הפעלה — אנדרואיד
      </a>
      <a className="link-btn" href="https://www.youtube.com/watch?v=LakYc2w2sA8" target="_blank" rel="noopener">
        מדריך הפעלה — אייפון
      </a>
    </div>
  </>
}

function IntercomTab() {
  return <>
    <div className="section-label">הוראות הפעלה — צג האינטרקום בדירה</div>
    <p style={{fontSize:'13.5px', color:'var(--muted)', marginBottom:'16px', lineHeight:'1.7'}}>
      להלן הסבר על כפתורי צג האינטרקום של חברת DACOM המותקן בדירות הבניין.
    </p>
    <img src={import.meta.env.BASE_URL + 'intercom.png'} alt="צג אינטרקום DACOM"
      style={{width:'100%', borderRadius:'12px', marginBottom:'20px', border:'1px solid var(--border)'}}/>
    <div className="section-label">הפעלה</div>
    <div style={{fontSize:'14px', color:'var(--text)', lineHeight:'1.9', marginBottom:'16px'}}>
      <p style={{margin:'0 0 10px'}}>כאשר ישנה שיחה נכנסת נפתח המסך. למענה יש ללחוץ על לחצן 4 (מענה לשיחה).</p>
      <p style={{margin:'0 0 10px'}}>לפתיחת דלת יש ללחוץ על לחצן 5 (פתיחת דלת).</p>
      <p style={{margin:'0 0 10px'}}>בכדי לפתוח שיחה יזומה יש ללחוץ על לחצן 3 (פתיחת תמונה באופן יזום) ולאחר מכן על לחצן 4 (מענה לשיחה).</p>
      <p style={{margin:'0 0 10px'}}>לכיבוי המסך יש ללחוץ על לחצן 3 שתי לחיצות רצופות.</p>
    </div>
    <div className="info-block" style={{marginBottom:'16px', lineHeight:'1.9'}}>
      <strong>להנמכה/הגברה קול, כיוון בהירות וכו׳</strong><br/>
      יש ללחוץ על לחצן 3 ומיד לאחר מכן על לחצן 1 לדפדוף (למטה למעלה)<br/>
      לכיוון העוצמה לחץ על 4/5<br/>
      לאישור העוצמה לחץ על לחצן 3
    </div>
    <div className="info-block amber" style={{marginBottom:'20px'}}>
      <strong>הערה חשובה</strong> — יש ללחוץ על המקשים פעם אחת ובלחיצות קצרות בלבד.
    </div>
    <div className="divider"></div>
    <div className="section-label">סרטון: איפוס המכשיר לעבודה עם שפופרת / ללא שפופרת</div>
    <video controls style={{width:'100%', borderRadius:'12px', marginBottom:'16px', background:'#000'}}
      src={import.meta.env.BASE_URL + 'intercom_ipus.mp4'}>
      הדפדפן שלך אינו תומך בהפעלת וידאו.
    </video>
    <div className="divider"></div>
    <div className="section-label">תמיכה טכנית — חברת DACOM</div>
    <a className="link-btn" href="tel:0775040890">077-504-0890</a>
  </>
}

const tabComponents = {
  postal: PostalTab, gush: GushTab, address: AddressTab,
  elevator: ElevatorTab, arnona: ArnonaTab, ac: ACTab,
  heatpump: HeatPumpTab, cellular: CellularTab, intercom: IntercomTab,
}

export default function GeneralInfoPage() {
  const [activeCategory, setActiveCategory] = useState(null)
  const [activeTab, setActiveTab] = useState(null)

  const selectCategory = (cat) => {
    if (activeCategory === cat.id) {
      setActiveCategory(null)
      setActiveTab(null)
    } else {
      setActiveCategory(cat.id)
      setActiveTab(cat.tabs[0].id)
    }
  }

  const ActiveComponent = activeTab ? tabComponents[activeTab] : null
  const currentCat = categories.find(c => c.id === activeCategory)

  return (
    <div className="card">
      <div className="panel-title"><div className="icon">ℹ️</div>מידע כללי נוסף</div>

      {/* Category grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px', marginBottom: activeCategory ? '16px' : '0',
      }}>
        {categories.map(cat => {
          const isActive = activeCategory === cat.id
          return (
            <button key={cat.id} onClick={() => selectCategory(cat)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: '8px',
              padding: '16px 8px',
              background: isActive ? 'var(--primary)' : '#fafaf8',
              border: isActive ? '2px solid var(--primary)' : '1.5px solid var(--border)',
              borderRadius: '14px', cursor: 'pointer',
              color: isActive ? 'white' : 'var(--text)',
              transition: 'all 0.18s',
              fontFamily: 'Heebo, sans-serif',
            }}>
              <div style={{opacity: isActive ? 1 : 0.65}}>
                <cat.Icon />
              </div>
              <div style={{fontSize:'13px', fontWeight:'700', textAlign:'center'}}>
                {cat.label}
              </div>
            </button>
          )
        })}
      </div>

      {/* Sub-tabs — only if category has more than one tab */}
      {activeCategory && currentCat && currentCat.tabs.length > 1 && (
        <div className="ctab-bar" style={{marginBottom:'16px'}}>
          {currentCat.tabs.map(t => (
            <button key={t.id}
              className={`ctab-btn${activeTab === t.id ? ' active' : ''}`}
              onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {ActiveComponent && (
        <div className="ctab-body">
          <ActiveComponent />
        </div>
      )}
    </div>
  )
}
