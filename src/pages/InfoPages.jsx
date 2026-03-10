export function Parking() {
  return (
    <div className="card">
      <div className="panel-title"><div className="icon">🚗</div>חניון</div>

      <div className="section-label">🅿️ חניות אורחים</div>
      <div className="parking-badge">🅿️ &nbsp; חניות מספר 409–433</div>
      <div className="info-block">📍 החניות לאורחים נמצאות <strong>במפלס 4</strong> בחניון הבניין.</div>

      <div className="divider"></div>
      <div className="section-label">🔒 שער חשמלי – חדש</div>
      <div className="info-block amber">
        ⚙️ בתחילת מרץ 2026 מותקן <strong>שער חשמלי</strong> בכניסה לחניון, בין קומה מינוס ½ לקומה מינוס 1.<br/><br/>
        השער ייפתח באמצעות <strong>אפליקציה</strong>, <strong>שיחת טלפון</strong> או <strong>שלט</strong>.
      </div>
      <div className="note">
        📲 <strong>עדכונים בקרוב:</strong> הוראות התקנת האפליקציה, הזמנת שלט ומידע נוסף יתפרסמו כאן ברגע שיהיו זמינים.
      </div>
    </div>
  )
}

export function Details() {
  return (
    <div className="card">
      <div className="panel-title"><div className="icon">📋</div>פרטי הבניינים</div>

      <div className="section-label">מיקוד</div>
      <div className="info-row"><span className="label">עגנון 12</span><span className="value">5560622</span></div>
      <div className="info-row"><span className="label">עגנון 14</span><span className="value">5560624</span></div>

      <div className="divider"></div>
      <div className="section-label">גוש חלקה</div>
      <div className="info-row"><span className="label">עגנון 12</span><span className="value" style={{fontSize:'14px'}}>גוש 6496 &nbsp;|&nbsp; חלקה 519</span></div>
      <div className="info-row"><span className="label">עגנון 14</span><span className="value" style={{fontSize:'14px'}}>גוש 6496 &nbsp;|&nbsp; חלקה 520</span></div>

      <div className="divider"></div>
      <div className="section-label">🛗 מידות מעליות</div>
      <div className="info-row"><span className="label">מעלית משא – דלת</span><span className="value">2.10 × 0.90 מ׳</span></div>
      <div className="info-row"><span className="label">מעלית משא – פנים</span><span className="value">2.50 × 0.95 מ׳</span></div>
      <div className="info-row"><span className="label">מעלית רגילה – פתח</span><span className="value">רוחב 88 ס״מ &nbsp;|&nbsp; גובה 215 ס״מ</span></div>
      <div className="info-row"><span className="label">מעלית רגילה – תא פנים</span><span className="value">אורך 204 ס״מ &nbsp;|&nbsp; אלכסון ~290 ס״מ</span></div>

      <div className="divider"></div>
      <div className="section-label">כתובת על לוי אשכול</div>
      <div className="info-row"><span className="label">עגנון 12</span><span className="value">לוי אשכול 75</span></div>
      <div className="info-row" style={{borderBottom:'none'}}><span className="label">עגנון 14</span><span className="value">לוי אשכול 77</span></div>
    </div>
  )
}

export function Arnona() {
  return (
    <div className="card">
      <div className="panel-title"><div className="icon">🏙️</div>ארנונה</div>
      <p style={{fontSize:'13.5px',color:'var(--muted)',marginBottom:'14px'}}>
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
      <p style={{fontSize:'12.5px',color:'var(--muted)',marginBottom:'8px'}}>מתוך <strong>צו הארנונה 2026</strong> של עיריית קריית אונו:</p>
      <a className="link-btn outline" href="https://www.kiryatono.muni.il/uploads/n/1751522566.8385.pdf" target="_blank" rel="noopener">
        📄 &nbsp; צו הארנונה המלא
      </a>
    </div>
  )
}

export function Whatsapp() {
  const groups = [
    { href: 'https://chat.whatsapp.com/CKr8PqKHoe16wd1ws6yplI?mode=gi_t', cls: '', icon: '🏠', title: 'בעלי דירות – בניין 12', sub: 'לבעלי דירות בלבד', arrow: '#25D366' },
    { href: 'https://chat.whatsapp.com/K1J3NVgHZ8MIkllbnSTXPa', cls: '', icon: '🏠', title: 'בעלי דירות – בניין 14', sub: 'לבעלי דירות בלבד', arrow: '#25D366' },
    { href: 'https://chat.whatsapp.com/DNF4sr76SmOCcbvk1yNUP7', cls: 'wa-announce', icon: '📢', title: 'קבוצת הודעות – בניין 14', sub: 'תת-קבוצה להודעות בלבד', arrow: '#e8a020' },
    { href: 'https://chat.whatsapp.com/KewzsKaHGB2DTwEnrrberL?mode=hqrt3', cls: 'wa-open', icon: '👥', title: 'דיירים 12 ו-14', sub: 'פתוח לכל הדיירים, לא רק בעלי דירות', arrow: '#2a8fd6' },
    { href: 'https://chat.whatsapp.com/KpvS4NOrJ4C9gjyL268erJ?mode=hq2tcli', cls: 'wa-project', icon: '🏙️', title: 'כל פרויקט אונו וואן', sub: 'כולל כלל הבניינים המאוכלסים בפרויקט', arrow: '#7c5cbf' },
  ]
  return (
    <div className="card">
      <div className="panel-title"><div className="icon">💬</div>קבוצות וואטסאפ</div>
      {groups.map(g => (
        <a key={g.title} href={g.href} target="_blank" rel="noopener" className={`wa-card ${g.cls}`}>
          <div className="wa-icon">{g.icon}</div>
          <div className="wa-info">
            <div className="wa-title">{g.title}</div>
            <div className="wa-sub">{g.sub}</div>
          </div>
          <div className="wa-arrow" style={{color:g.arrow}}>←</div>
        </a>
      ))}
    </div>
  )
}

export function AC() {
  return (
    <div className="card">
      <div className="panel-title"><div className="icon">❄️</div>מיזוג אוויר בדירות</div>
      <div className="section-label">סרטון הדרכה: ביטול נעילת ילדים בלוח הבקרה</div>
      <video
        controls
        style={{ width: '100%', borderRadius: '12px', marginBottom: '8px', background: '#000' }}
        src={import.meta.env.BASE_URL + 'מדריך_ביטול_נעילת_ילדים_בלוח_בקרה_קירי.mp4'}
      >
        הדפדפן שלך אינו תומך בהפעלת וידאו.
      </video>
      <div className="divider" style={{marginTop:'16px'}}></div>
      <div className="section-label">קישור לשלט למזגן (AliExpress)</div>
      <div className="info-block">🎛️ שלט שהומלץ על ידי דיירים – <strong>עובד מעולה בלי קידוד</strong>.</div>
      <a className="link-btn" href="https://a.aliexpress.com/_c3MVh3yL" target="_blank" rel="noopener">
        🛒 &nbsp; לקנות שלט ב-AliExpress
      </a>
    </div>
  )
}

export function ResidentsRoom() {
  return (
    <div className="card">
      <div className="panel-title"><div className="icon">🛋️</div>חדר דיירים</div>
      <div className="info-block green">
        🏠 בכל בניין (עגנון 12 ו-14) קיים <strong>חדר דיירים</strong> לשימוש דיירי הבניין.<br/>
        שריון החדר נעשה מול <strong>חברת הניהול HIGH TOWER</strong>, בהתאם לתקנונים.
      </div>
      <div className="divider"></div>
      <div className="section-label">📄 תקנונים</div>
      <a className="link-btn" href="תקנון חדר דיירים עגנון 12 קרית אונו.pdf" target="_blank" rel="noopener">
        📄 &nbsp; תקנון חדר דיירים – עגנון 12
      </a>
    </div>
  )
}
