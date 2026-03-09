export default function Emergency() {
  const videos = [
    {
      title: 'פירוק חלונות אלומיניום וסגירה הרמטית – רב בריח',
      desc: 'פירוק חלונות האלומיניום של הממ"ד וסגירה הרמטית של חלונות רב בריח המורכבים בפרויקט.',
      url: 'https://www.youtube.com/embed/gLhJOaF99F0',
    },
    {
      title: 'סגירה ונעילה נכונה של דלת הממ"ד',
      desc: 'כיצד לסגור ולנעול את דלת הממ"ד בצורה נכונה.',
      url: 'https://www.youtube.com/embed/jEUMLEjPuDg',
    },
    {
      title: 'מערכת סינון האוויר',
      desc: 'הפעלה ותפעול מערכת סינון האוויר בממ"ד.',
      url: 'https://www.youtube.com/embed/92QJyd--Xx8',
    },
  ]

  return (
    <div className="card">
      <div className="panel-title">
        <div className="icon" style={{background:'linear-gradient(135deg,#c0392b,#e74c3c)'}}>🚨</div>
        שעת חירום
      </div>

      <div className="info-block" style={{marginBottom:'20px', borderRightColor:'#e74c3c'}}>
        להלן סרטונים שיסייעו לכם בתפעול מערכות הממ"ד בשעת הצורך.
        מומלץ להכיר אותם <strong>מראש</strong>, לפני שמגיעה הדרישה לכך.
      </div>

      {videos.map((v, i) => (
        <div key={i} style={{marginBottom:'28px'}}>
          <div style={{fontWeight:'700', fontSize:'15px', color:'var(--primary)', marginBottom:'4px'}}>{v.title}</div>
          <div style={{fontSize:'13px', color:'var(--muted)', marginBottom:'10px', lineHeight:'1.6'}}>{v.desc}</div>
          <div style={{position:'relative', paddingBottom:'56.25%', height:0, borderRadius:'12px', overflow:'hidden', background:'#000'}}>
            <iframe
              src={v.url}
              title={v.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{position:'absolute', top:0, right:0, width:'100%', height:'100%', border:'none'}}
            />
          </div>
        </div>
      ))}

      <div className="info-block amber">
        ⚠️ <strong>שימו לב:</strong> החניון בבניין <strong>איננו</strong> מרחב מוגן מאושר.
      </div>
    </div>
  )
}
