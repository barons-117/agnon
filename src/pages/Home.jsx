import { useState, useEffect } from 'react'
import SearchBox from '../components/SearchBox.jsx'
import { supabase } from '../lib/supabase.js'

function NoticesWidget() {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeBuilding, setActiveBuilding] = useState('both')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    supabase.from('notices').select('*').order('date', { ascending: false })
      .then(({ data }) => { setNotices(data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const tabs = [
    { id: 'both', label: 'שני הבניינים' },
    { id: '12',   label: 'עגנון 12' },
    { id: '14',   label: 'עגנון 14' },
  ]

  const filtered = notices.filter(n =>
    activeBuilding === 'both' ? n.building === 'both' : (n.building === activeBuilding || n.building === 'both')
  )

  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      overflow: 'hidden',
      marginBottom: '20px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    }}>
      {/* Widget header */}
      <div style={{
        background: 'linear-gradient(135deg, #e8943a, #f5b86a)',
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <span style={{fontSize:'22px'}}>📣</span>
          <div>
            <div style={{fontWeight:'800', fontSize:'15px', color:'white'}}>הודעות ועד הבית</div>
            <div style={{fontSize:'12px', color:'rgba(255,255,255,0.8)'}}>עדכונים אחרונים מהוועד</div>
          </div>
        </div>
        {!loading && <div style={{
          background:'rgba(255,255,255,0.25)', color:'white',
          fontSize:'12px', fontWeight:'700', padding:'4px 10px',
          borderRadius:'100px',
        }}>{filtered.length} הודעות</div>}
      </div>

      {/* Building tabs */}
      <div style={{display:'flex', borderBottom:'1px solid var(--border)', background:'#fafaf8'}}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveBuilding(t.id)} style={{
            flex:1, padding:'10px 6px', border:'none', background:'transparent',
            fontFamily:'Heebo, sans-serif', fontSize:'12px', fontWeight:'700',
            cursor:'pointer', color: activeBuilding === t.id ? 'var(--primary)' : 'var(--muted)',
            borderBottom: activeBuilding === t.id ? '2.5px solid var(--primary)' : '2.5px solid transparent',
            transition: 'all 0.15s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Notices list */}
      <div style={{padding:'12px 16px', maxHeight:'360px', overflowY:'auto'}}>
        {loading && <div style={{textAlign:'center', color:'var(--muted)', padding:'24px', fontSize:'13px'}}>טוען...</div>}
        {!loading && filtered.length === 0 && (
          <div style={{textAlign:'center', color:'var(--muted)', padding:'24px', fontSize:'13px'}}>📭 אין הודעות כרגע</div>
        )}
        {filtered.map((n, i) => {
          const isOpen = expanded === n.id
          return (
            <div key={n.id} style={{
              borderBottom: i < filtered.length-1 ? '1px solid var(--border)' : 'none',
              paddingBottom:'12px', marginBottom:'12px',
            }}>
              <div
                onClick={() => setExpanded(isOpen ? null : n.id)}
                style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'8px', cursor:'pointer'}}
              >
                <div style={{flex:1}}>
                  <div style={{fontWeight:'700', fontSize:'14px', color:'var(--primary)', marginBottom:'3px'}}>{n.title}</div>
                  {!isOpen && <div style={{fontSize:'12px', color:'var(--muted)', lineHeight:'1.5',
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'220px'}}>
                    {n.text}
                  </div>}
                </div>
                <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px', flexShrink:0}}>
                  <div style={{fontSize:'11px', color:'var(--muted)'}}>{n.date}</div>
                  <div style={{fontSize:'11px', color:'#888'}}>{isOpen ? '▲' : '▼'}</div>
                </div>
              </div>
              {isOpen && (
                <div style={{fontSize:'13px', lineHeight:'1.8', color:'var(--text)', whiteSpace:'pre-line', marginTop:'8px',
                  background:'#fafaf8', padding:'10px 12px', borderRadius:'8px', border:'1px solid var(--border)'}}>
                  {n.text}
                  {n.file_url && (
                    <a href={n.file_url} target="_blank" rel="noopener" style={{
                      display:'inline-flex', alignItems:'center', gap:'6px', fontSize:'12px',
                      color:'var(--accent2)', fontWeight:'600', textDecoration:'none',
                      background:'#eef4fb', padding:'5px 10px', borderRadius:'7px',
                      border:'1px solid #c8dcf0', marginTop:'8px'
                    }}>📎 {n.file_name}</a>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Home({ onNavigate }) {
  return (
    <div style={{maxWidth:'680px'}}>

      {/* Hero header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f2540 0%, #1a3a5c 60%, #1e4a7a 100%)',
        borderRadius: '20px', padding: '36px 28px 32px', marginBottom: '20px',
        color: 'white', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {/* decorative circles */}
        <div style={{position:'absolute', top:'-40px', left:'-40px', width:'160px', height:'160px',
          borderRadius:'50%', background:'rgba(255,255,255,0.04)'}}/>
        <div style={{position:'absolute', bottom:'-30px', right:'-30px', width:'120px', height:'120px',
          borderRadius:'50%', background:'rgba(245,184,106,0.1)'}}/>
        <div style={{position:'relative', zIndex:1}}>
          <div style={{fontSize:'48px', marginBottom:'10px'}}>🏢</div>
          <div style={{fontSize:'23px', fontWeight:'800', marginBottom:'6px', letterSpacing:'-0.5px'}}>
            ברוכים הבאים
          </div>
          <div style={{fontSize:'15px', color:'#f5c97a', fontWeight:'700', marginBottom:'14px'}}>
            שי עגנון 12 ו-14 · קריית אונו
          </div>
          <div style={{fontSize:'13px', opacity:'0.7', lineHeight:'1.8', maxWidth:'340px', margin:'0 auto'}}>
            כל המידע החשוב על הבניין במקום אחד —
            ועד הבית, חברת ניהול, קבלנים ועוד.
          </div>
        </div>
      </div>

      {/* Search */}
      <SearchBox />

      {/* Notices widget */}
      <NoticesWidget />

      {/* Request button */}
      <button onClick={() => { window.location.hash = 'requests' }} style={{
        width: '100%',
        background: 'linear-gradient(135deg, var(--primary), #1a4a7a)',
        color: 'white', border: 'none', borderRadius: '14px', padding: '18px 20px',
        cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
        display: 'flex', alignItems: 'center', gap: '14px',
        boxShadow: '0 4px 18px rgba(15,37,64,0.22)', transition: 'transform 0.15s',
        marginBottom: '20px',
      }}
        onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
      >
        <div style={{fontSize:'32px', flexShrink:0}}>📝</div>
        <div style={{textAlign:'right', flex:1}}>
          <div style={{fontWeight:'800', fontSize:'16px', marginBottom:'3px'}}>פתיחת פנייה לחברת הניהול</div>
          <div style={{fontSize:'12px', opacity:'0.75'}}>HIGH TOWER · ימי עבודה</div>
        </div>
        <div style={{fontSize:'20px', opacity:'0.7'}}>←</div>
      </button>

      {/* How to use */}
      <div className="info-block green" style={{marginBottom:'16px'}}>
        <strong>📱 איך משתמשים?</strong><br/>
        בתפריט הצד (או כפתור ☰ במובייל) תמצאו את כל המידע — WiFi, ועד, בעלי מקצוע ועוד.
      </div>

      <div className="divider"></div>

      {/* Contact */}
      <div style={{fontSize:'15px', fontWeight:'700', color:'var(--primary)', marginBottom:'12px'}}>
        💬 יש לכם מה להוסיף?
      </div>
      <div style={{fontSize:'14px', color:'var(--muted)', lineHeight:'1.8', marginBottom:'16px'}}>
        פרטים שגויים, המלצה על בעל מקצוע, מידע שחשוב שכולם ידעו — כתבו לי:
      </div>

      <a href="https://wa.me/972542121021" target="_blank" rel="noopener" style={{
        display:'flex', alignItems:'center', gap:'14px',
        background:'#f0fbf4', border:'1px solid #bce8cc',
        borderRadius:'13px', padding:'16px 20px',
        textDecoration:'none', color:'var(--text)', transition:'transform 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
      >
        <div style={{width:'48px', height:'48px', background:'#25D366', borderRadius:'12px',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', flexShrink:0}}>💬</div>
        <div style={{flex:1}}>
          <div style={{fontWeight:'700', fontSize:'15px', color:'var(--primary)'}}>כתבו לי בוואטסאפ</div>
          <div style={{fontSize:'13px', color:'var(--muted)', marginTop:'2px'}}>ארז · ועד הבית עגנון 12</div>
        </div>
        <div style={{fontSize:'20px', color:'#25D366', fontWeight:'700'}}>←</div>
      </a>
    </div>
  )
}
