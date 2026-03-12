export default function Manage() {
  return (
    <section id="manage" className="tab-panel active">
      <div className="card">
        <div className="panel-title">
          <div className="icon">🏢</div>
          חברת ניהול HIGH TOWER
        </div>

        <div className="section-label">📞 יצירת קשר</div>

        <a href="tel:0364440424" className="contact-card">
          <div className="contact-icon" style={{background:'linear-gradient(135deg,#0f2540,#2a5a8c)'}}>🏢</div>
          <div className="contact-info">
            <div className="contact-label">משרד HIGH TOWER</div>
            <div className="contact-number">03-6440424</div>
          </div>
          <div className="contact-arrow">←</div>
        </a>

        <a href="tel:0505387076" className="contact-card">
          <div className="contact-icon" style={{background:'linear-gradient(135deg,#e8943a,#f5b86a)'}}>👤</div>
          <div className="contact-info">
            <div className="contact-label">אודי חסון – מנהל</div>
            <div className="contact-number">050-5387076</div>
          </div>
          <div className="contact-arrow">←</div>
        </a>

        <a href="tel:1800800751" className="contact-card">
          <div className="contact-icon" style={{background:'linear-gradient(135deg,#c0392b,#e74c3c)'}}>🚨</div>
          <div className="contact-info">
            <div className="contact-label">מוקד חירום 24/7 – HIGH TOWER</div>
            <div className="contact-number">1-800-800-751</div>
          </div>
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

        <a className="link-btn outline" href="הסכם_ניהול.pdf" target="_blank" rel="noopener" style={{display:'flex',marginBottom:'10px'}}>
          📄 &nbsp; הסכם ניהול היי טאואר
        </a>
        <a className="link-btn outline" href="נוהל_התנהגות.pdf" target="_blank" rel="noopener" style={{display:'flex',marginBottom:'10px'}}>
          📄 &nbsp; נוהל התנהגות במתחם
        </a>
        <a className="link-btn outline" href="נוהל_קבלנים.pdf" target="_blank" rel="noopener" style={{display:'flex'}}>
          📄 &nbsp; נוהל קבלנים
        </a>
      </div>
    </section>
  )
}
