import SearchBox from '../components/SearchBox.jsx'

export default function Home({ onNavigate }) {
  return (
    <div className="card" style={{maxWidth:'680px'}}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary), #1a3a5c)',
        borderRadius: '12px', padding: '32px 28px', marginBottom: '24px',
        color: 'white', textAlign: 'center'
      }}>
        <div style={{fontSize: '42px', marginBottom: '12px'}}>🏢</div>
        <div style={{fontSize: '22px', fontWeight: '800', marginBottom: '6px'}}>
          ברוכים הבאים לאתר הדיירים
        </div>
        <div style={{fontSize: '16px', color: '#f5c97a', fontWeight: '700', marginBottom: '12px'}}>
          שי עגנון 12 ו-14 · קריית אונו
        </div>
        <div style={{fontSize: '14px', opacity: '0.75', lineHeight: '1.7'}}>
          ריכזנו עבורכם את כל המידע החשוב על הבניין במקום אחד —
          פרטי ועד, חברת ניהול, קבלנים, בעלי מקצוע מומלצים ועוד.
        </div>
      </div>

      {/* Search */}
      <SearchBox />

      {/* Quick action buttons */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'24px'}}>
        <button onClick={() => { window.location.hash = 'requests' }} style={{
          background:'linear-gradient(135deg, var(--primary), #1a3a5c)',
          color:'white', border:'none', borderRadius:'14px', padding:'18px 12px',
          cursor:'pointer', fontFamily:'Heebo, sans-serif', textAlign:'center',
          boxShadow:'0 4px 16px rgba(15,37,64,0.2)', transition:'transform 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
        >
          <div style={{fontSize:'28px', marginBottom:'8px'}}>📝</div>
          <div style={{fontSize:'14px', fontWeight:'700', lineHeight:'1.4'}}>פתיחת פנייה<br/>לחברת הניהול</div>
        </button>

        <button onClick={() => { window.location.hash = 'vaad-notices' }} style={{
          background:'linear-gradient(135deg, #e8943a, #f5b86a)',
          color:'white', border:'none', borderRadius:'14px', padding:'18px 12px',
          cursor:'pointer', fontFamily:'Heebo, sans-serif', textAlign:'center',
          boxShadow:'0 4px 16px rgba(232,148,58,0.25)', transition:'transform 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
        >
          <div style={{fontSize:'28px', marginBottom:'8px'}}>📣</div>
          <div style={{fontSize:'14px', fontWeight:'700', lineHeight:'1.4'}}>הודעות<br/>ועד הבית</div>
        </button>
      </div>

      {/* How to use */}
      <div className="info-block green" style={{marginBottom: '16px'}}>
        <strong>📱 איך משתמשים באתר?</strong><br/>
        בצד ימין (או בכפתור התפריט במובייל) תמצאו את כל הקטגוריות.
        לחצו על כל טאב לקבלת המידע הרלוונטי.
      </div>

      {/* Divider */}
      <div className="divider"></div>

      {/* Call to action */}
      <div style={{fontSize: '15px', fontWeight: '700', color: 'var(--primary)', marginBottom: '12px'}}>
        💬 יש לכם מה להוסיף?
      </div>
      <div style={{fontSize: '14px', color: 'var(--muted)', lineHeight: '1.8', marginBottom: '20px'}}>
        אם שמתם לב לפרטים שגויים, יש לכם <strong>המלצה על בעל מקצוע</strong> שגר בבניין
        או שעבד אצלכם, מידע שחשוב שכולם ידעו, או כל הערה אחרת —
        תשמחו לכתוב לי ישירות:
      </div>

      <a
        href="https://wa.me/972542121021"
        target="_blank"
        rel="noopener"
        style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          background: '#f0fbf4', border: '1px solid #bce8cc',
          borderRadius: '13px', padding: '16px 20px',
          textDecoration: 'none', color: 'var(--text)',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
      >
        <div style={{
          width: '48px', height: '48px', background: '#25D366',
          borderRadius: '12px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '24px', flexShrink: 0
        }}>💬</div>
        <div style={{flex: 1}}>
          <div style={{fontWeight: '700', fontSize: '15px', color: 'var(--primary)'}}>כתבו לי בוואטסאפ</div>
          <div style={{fontSize: '13px', color: 'var(--muted)', marginTop: '2px'}}>ארז · ועד הבית עגנון 12</div>
        </div>
        <div style={{fontSize: '20px', color: '#25D366', fontWeight: '700'}}>←</div>
      </a>

      <div className="divider"></div>

      <div style={{fontSize:'12px', color:'var(--muted)', textAlign:'center', lineHeight:'1.7'}}>
        האתר מתעדכן מעת לעת. הודעות ועד הבית מופיעות בטאב <strong>הודעות וועד</strong>.
      </div>

    </div>
  )
}
