export function Parking() {
  return (
    <div className="card">
      <div className="panel-title"><div className="icon">🚗</div>חניות וחניון</div>

      {/* Intro */}
      <div className="info-block" style={{marginBottom:'20px', lineHeight:'1.8'}}>
        החניון המשותף של הפרויקט נמצא ב<strong>קומות מינוס 1 עד מינוס 4</strong>.
        בכל קומה יש כניסה לכל אחד מהבניינים — <strong>הכניסות סגורות בקודן</strong>.
        <br/><br/>
        ⚠️ <strong>קומת מינוס ½</strong> מיועדת בעיקר לחניות מסחריות (חזית לוי אשכול) — ולכן השער החשמלי שלנו ממוקם בין מינוס ½ למינוס 1.
      </div>

      {/* Guest parking */}
      <div style={{
        background:'linear-gradient(135deg,#f0f7ff,#e4edf8)', border:'1.5px solid #c8dcf0',
        borderRadius:'16px', padding:'20px', marginBottom:'16px'
      }}>
        <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px'}}>
          <div style={{fontSize:'28px'}}>🅿️</div>
          <div>
            <div style={{fontWeight:'800', fontSize:'16px', color:'#1a3a5c'}}>חניות אורחים</div>
            <div style={{fontSize:'13px', color:'var(--muted)'}}>לשימוש אורחים בלבד</div>
          </div>
        </div>
        <div style={{
          background:'white', borderRadius:'12px', padding:'14px 18px',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          border:'1px solid #c8dcf0'
        }}>
          <div style={{fontSize:'13px', color:'var(--muted)'}}>מספרי חניות</div>
          <div style={{fontWeight:'800', fontSize:'18px', color:'#1a3a5c'}}>409 – 433</div>
        </div>
        <div style={{fontSize:'13px', color:'var(--muted)', marginTop:'10px', display:'flex', alignItems:'center', gap:'6px'}}>
          📍 מפלס 4 בחניון
        </div>
      </div>

      {/* Electric gate */}
      <div style={{
        background:'linear-gradient(135deg,#fffbf0,#fff3d6)', border:'1.5px solid #f5c97a',
        borderRadius:'16px', padding:'20px', marginBottom:'16px'
      }}>
        <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px'}}>
          <div style={{fontSize:'28px'}}>🔒</div>
          <div>
            <div style={{fontWeight:'800', fontSize:'16px', color:'#7a5c00'}}>שער חשמלי – חדש</div>
            <div style={{fontSize:'13px', color:'#a07820'}}>בין מינוס ½ למינוס 1</div>
          </div>
        </div>
        <div style={{fontSize:'14px', lineHeight:'1.8', color:'var(--text)', marginBottom:'12px'}}>
          השער נפתח באמצעות <strong>אפליקציה</strong>, <strong>שיחת טלפון</strong> או <strong>שלט רחוק</strong>.
        </div>
        <div className="info-block amber" style={{margin:0, fontSize:'13px'}}>
          📱 מי שמעוניין ב<strong>שלט רחוק</strong> בתשלום, או לעדכן מספרי טלפון לאפליקציה — פנו לוועד הבית.
        </div>
      </div>

      {/* Rules */}
      <div style={{
        background:'#fafaf8', border:'1px solid var(--border)',
        borderRadius:'16px', padding:'20px', marginBottom:'16px'
      }}>
        <div style={{fontWeight:'700', fontSize:'14px', color:'var(--primary)', marginBottom:'14px'}}>📋 חוקי החניון</div>
        {[
          { icon:'✅', text:'חנו רק בחניה הפרטית שלכם' },
          { icon:'🚫', text:'אין לחסום חניות אחרות או לפגוע בתנועה' },
          { icon:'📹', text:'בחניון פועלות מצלמות אבטחה' },
          { icon:'🧹', text:'שמרו על ניקיון החניון' },
          { icon:'🗑️', text:'בעת פינוי מחסן — זרקו לפחים, אל תשאירו בצד הדרך' },
        ].map((r,i) => (
          <div key={i} style={{
            display:'flex', alignItems:'flex-start', gap:'10px',
            padding:'8px 0',
            borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
            fontSize:'14px', color:'var(--text)', lineHeight:'1.6'
          }}>
            <span style={{fontSize:'16px', flexShrink:0}}>{r.icon}</span>
            {r.text}
          </div>
        ))}
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
