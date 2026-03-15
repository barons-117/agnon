import { useState, useEffect } from 'react'
import SearchBox from '../components/SearchBox.jsx'
import { supabase } from '../lib/supabase.js'
import FileAttachment from '../components/FileAttachment.jsx'

function linkify(text) {
  if (!text) return null
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)
  return parts.map((part, i) =>
    urlRegex.test(part)
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer"
          style={{ color: 'var(--primary)', textDecoration: 'underline', wordBreak: 'break-all' }}>{part}</a>
      : part
  )
}
function UrgentPopup({ notice, onClose }) {
  if (!notice) return null
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1000,
      background:'rgba(0,0,0,0.55)', backdropFilter:'blur(3px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'20px', animation:'fadeIn 0.2s ease',
    }} onClick={onClose}>
      <div style={{
        background:'white', borderRadius:'20px', maxWidth:'420px', width:'100%',
        boxShadow:'0 20px 60px rgba(0,0,0,0.3)', overflow:'hidden',
        animation:'slideUp 0.25s ease',
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          background:'linear-gradient(135deg,#c03030,#e05555)',
          padding:'18px 20px',
          display:'flex', alignItems:'center', justifyContent:'space-between',
        }}>
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
            <div style={{fontSize:'24px'}}>🔴</div>
            <div>
              <div style={{fontWeight:'800', fontSize:'15px', color:'white'}}>הודעה דחופה</div>
              <div style={{fontSize:'11px', color:'rgba(255,255,255,0.75)'}}>מועד הבית</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background:'rgba(255,255,255,0.2)', border:'none', color:'white',
            borderRadius:'50%', width:'30px', height:'30px', fontSize:'16px',
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'Heebo, sans-serif',
          }}>✕</button>
        </div>
        <div style={{padding:'20px'}}>
          <div style={{fontWeight:'800', fontSize:'17px', color:'#c03030', marginBottom:'10px', lineHeight:'1.4'}}>{notice.title}</div>
          <div style={{fontSize:'14px', lineHeight:'1.8', color:'var(--text)', whiteSpace:'pre-line', marginBottom:'14px'}}>{linkify(notice.text)}</div>
          {notice.file_url && <FileAttachment url={notice.file_url} name={notice.file_name} />}
          <div style={{fontSize:'11px', color:'var(--muted)', marginTop:'10px'}}>{notice.date}</div>
        </div>
        <div style={{padding:'0 20px 20px'}}>
          <button onClick={onClose} style={{
            width:'100%', background:'#c03030', color:'white', border:'none',
            borderRadius:'12px', padding:'12px', fontSize:'14px', fontWeight:'700',
            cursor:'pointer', fontFamily:'Heebo, sans-serif',
          }}>הבנתי ✓</button>
        </div>
      </div>
    </div>
  )
}

function NoticesWidget({ onNavigate }) {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeBuilding, setActiveBuilding] = useState('both')

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

  const allFiltered = notices
    .filter(n => activeBuilding === 'both' ? n.building === 'both' : (n.building === activeBuilding || n.building === 'both'))
    .sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0))

  const filtered = allFiltered.slice(0, 2)
  const total = allFiltered.length

  return (
    <div style={{
      background: 'white', border: '1px solid var(--border)',
      borderRadius: '16px', overflow: 'hidden', marginBottom: '20px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #e8943a, #f5b86a)',
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <span style={{fontSize:'22px'}}>📣</span>
          <div>
            <div style={{fontWeight:'800', fontSize:'15px', color:'white'}}>הודעות ועד הבית</div>
            <div style={{fontSize:'12px', color:'rgba(255,255,255,0.8)'}}>2 הודעות אחרונות</div>
          </div>
        </div>
        <button onClick={() => onNavigate('vaad-notices')} style={{
          background:'rgba(255,255,255,0.25)', color:'white', border:'none',
          fontSize:'12px', fontWeight:'700', padding:'6px 12px',
          borderRadius:'100px', cursor:'pointer', fontFamily:'Heebo, sans-serif',
        }}>כל ההודעות ←</button>
      </div>

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

      <div style={{padding:'14px 18px'}}>
        {loading && <div style={{textAlign:'center', color:'var(--muted)', padding:'20px', fontSize:'13px'}}>טוען...</div>}
        {!loading && filtered.length === 0 && (
          <div style={{textAlign:'center', color:'var(--muted)', padding:'20px', fontSize:'13px'}}>📭 אין הודעות כרגע</div>
        )}
        {filtered.map((n, i) => (
          <div key={n.id} style={{
            borderBottom: i < filtered.length-1 ? '1px solid var(--border)' : 'none',
            paddingBottom: i < filtered.length-1 ? '14px' : 0,
            marginBottom: i < filtered.length-1 ? '14px' : 0,
          }}>
            <div style={{
              background: n.urgent ? 'linear-gradient(135deg,#fff5f5,#fff8f8)' : 'transparent',
              border: n.urgent ? '1.5px solid #f0b0b0' : 'none',
              borderRadius: n.urgent ? '12px' : '0',
              padding: n.urgent ? '12px' : '0',
            }}>
              <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'8px', marginBottom:'8px'}}>
                <div style={{flex:1}}>
                  {n.urgent && (
                    <span style={{
                      display:'inline-block', fontSize:'10px', background:'#e05555', color:'white',
                      padding:'2px 8px', borderRadius:'100px', fontWeight:'700',
                      marginBottom:'6px', animation:'urgentPulse 2s infinite',
                    }}>🔴 דחוף</span>
                  )}
                  <div style={{fontWeight:'800', fontSize:'14px', color: n.urgent ? '#c03030' : 'var(--primary)', lineHeight:'1.4'}}>{n.title}</div>
                </div>
                <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px', flexShrink:0}}>
                  <div style={{fontSize:'11px', color:'var(--muted)', whiteSpace:'nowrap'}}>{n.date}</div>
                  <div style={{display:'flex', gap:'3px'}}>
                    {n.building === 'both' ? (
                      <>
                        <span style={{fontSize:'10px', background:'#e4edf8', color:'#1a3a5c', padding:'2px 7px', borderRadius:'100px', fontWeight:'700'}}>עגנון 12</span>
                        <span style={{fontSize:'10px', background:'#e4edf8', color:'#1a3a5c', padding:'2px 7px', borderRadius:'100px', fontWeight:'700'}}>עגנון 14</span>
                      </>
                    ) : (
                      <span style={{fontSize:'10px', background:'#e4edf8', color:'#1a3a5c', padding:'2px 7px', borderRadius:'100px', fontWeight:'700'}}>עגנון {n.building}</span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{fontSize:'13px', lineHeight:'1.8', color:'var(--text)', whiteSpace:'pre-line'}}>{linkify(n.text)}</div>
              <FileAttachment url={n.file_url} name={n.file_name} />
            </div>
          </div>
        ))}

        {total > 2 && (
          <button onClick={() => onNavigate('vaad-notices')} style={{
            marginTop:'12px', width:'100%', background:'#f7f4f0',
            border:'1px solid var(--border)', borderRadius:'10px',
            padding:'9px', fontSize:'12px', fontWeight:'700',
            color:'var(--muted)', cursor:'pointer', fontFamily:'Heebo, sans-serif',
          }}>עוד {total - 2} הודעות ישנות יותר ←</button>
        )}
      </div>
    </div>
  )
}

export default function Home({ onNavigate }) {
  const [urgentNotice, setUrgentNotice] = useState(null)
  const [popupDismissed, setPopupDismissed] = useState(true)

  useEffect(() => {
    const dismissed = sessionStorage.getItem('urgentDismissed')
    supabase.from('notices').select('*').eq('urgent', true).limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setUrgentNotice(data[0])
          if (!dismissed) setPopupDismissed(false)
        }
      })
  }, [])

  const dismissPopup = () => {
    sessionStorage.setItem('urgentDismissed', '1')
    setPopupDismissed(true)
  }

  return (
    <div style={{maxWidth:'680px'}}>
      {urgentNotice && !popupDismissed && (
        <UrgentPopup notice={urgentNotice} onClose={dismissPopup} />
      )}

      <div style={{
        background: 'linear-gradient(135deg, #0f2540 0%, #1a3a5c 60%, #1e4a7a 100%)',
        borderRadius: '20px', marginBottom: '20px',
        color: 'white', position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'stretch', minHeight: '130px',
      }}>
        <div style={{flex: 1, padding: '24px 22px', position: 'relative', zIndex: 1, display:'flex', flexDirection:'column', justifyContent:'center'}}>
          <div style={{fontSize:'11px', color:'#f5c97a', fontWeight:'700', letterSpacing:'1px', marginBottom:'6px', textTransform:'uppercase'}}>
            קריית אונו · Ono One
          </div>
          <div style={{fontSize:'20px', fontWeight:'800', marginBottom:'4px', lineHeight:'1.3'}}>
            שי עגנון 12 ו-14
          </div>
          <div style={{fontSize:'13px', opacity:'0.7', lineHeight:'1.6'}}>
            כל המידע החשוב לדיירים במקום אחד
          </div>
        </div>
        <div style={{width:'130px', flexShrink:0, position:'relative', overflow:'hidden', borderRadius:'0 20px 20px 0'}}>
          <img src={import.meta.env.BASE_URL + 'building.png'} alt="הבניין"
            style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top', opacity: 0.85}} />
          <div style={{position:'absolute', inset:0, background:'linear-gradient(to right, #1a3a5c 0%, transparent 40%)'}}/>
        </div>
      </div>

      <SearchBox onNavigate={onNavigate} />
      <NoticesWidget onNavigate={onNavigate} />

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

      <div className="info-block green" style={{marginBottom:'16px'}}>
        <strong>📱 איך משתמשים?</strong><br/>
        בתפריט הצד (או כפתור ☰ במובייל) תמצאו את כל המידע — WiFi, ועד, בעלי מקצוע ועוד.
      </div>

      <div className="divider"></div>

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
