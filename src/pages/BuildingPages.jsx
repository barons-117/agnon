import SecretField from '../components/SecretField.jsx'

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
  return (
    <div className="card">
      <div className="panel-title"><div className="icon">📣</div>הודעות וועד הבית</div>
      <div className="info-block" style={{textAlign:'center',color:'var(--muted)',fontSize:'15px',padding:'32px 18px'}}>
        📭 פה יתפרסמו הודעות וועד הבית.
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
  return (
    <div className="card">
      <div className="panel-title"><div className="icon">🧹</div>לוח ניקיון הבניין</div>
      <div className="clean-row">
        <div className="clean-area"><span className="clean-icon">🚪</span><span className="clean-name">לובי</span></div>
        <div className="clean-days"><span className="day-badge daily">כל יום</span></div>
      </div>
      <div className="clean-row">
        <div className="clean-area"><span className="clean-icon">🏠</span><span className="clean-name">קומות 1–10</span></div>
        <div className="clean-days"><span className="day-badge">ראשון</span><span className="day-badge">רביעי</span></div>
      </div>
      <div className="clean-row">
        <div className="clean-area"><span className="clean-icon">🏠</span><span className="clean-name">קומות 11–20</span></div>
        <div className="clean-days"><span className="day-badge">שני</span><span className="day-badge">חמישי</span></div>
      </div>
      <div className="clean-row">
        <div className="clean-area"><span className="clean-icon">🗑️</span><span className="clean-name">חדרי אשפה</span></div>
        <div className="clean-days"><span className="day-badge daily">כל יום</span></div>
      </div>
      <div className="clean-row" style={{borderBottom:'none'}}>
        <div className="clean-area"><span className="clean-icon">🚗</span><span className="clean-name">לובאים חניון</span></div>
        <div className="clean-days" style={{flexDirection:'column',alignItems:'flex-end',gap:'5px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'5px'}}>
            <span style={{fontSize:'11px',color:'var(--muted)'}}>סריקה ואשפה</span>
            <span className="day-badge daily">כל יום</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'5px'}}>
            <span style={{fontSize:'11px',color:'var(--muted)'}}>שטיפה</span>
            <span className="day-badge wash">שלישי</span>
            <span className="day-badge wash">שישי</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Trash() {
  return (
    <div className="card">
      <div className="panel-title"><div className="icon">🗑️</div>פחים ומחזור</div>
      <div className="section-label">🗑️ פיר אשפה קומתי</div>
      <div className="info-block">
        בכל קומה יש פיר אשפה. <strong>ביציאה מהמעלית פונים ימינה</strong>, שוב ימינה – יש דלת קטנה לפיר האשפה.
      </div>
      <div className="divider"></div>
      <div className="section-label">♻️ פחי מחזור</div>
      <div className="info-block amber">
        ♻️ המחזור הוא <strong>ידני</strong> – הפחים הכתום והכחול נמצאים <strong>בחזית הבניין</strong>.<br/>
        נא להוריד בעצמכם ולמיין לפח המתאים.
      </div>
    </div>
  )
}
