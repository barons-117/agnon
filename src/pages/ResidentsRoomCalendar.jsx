import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

export default function ResidentsRoomCalendar() {
  const [bookings, setBookings] = useState([])
  const [activeBuilding, setActiveBuilding] = useState('12')
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    supabase.from('room_bookings').select('date,building')
      .then(({ data }) => setBookings(data || []))
  }, [])

  const bookedDates = new Set(
    bookings.filter(b => b.building === activeBuilding).map(b => b.date)
  )

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthName = new Date(year, month, 1).toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const toDateStr = (d) => {
    const dd = String(d).padStart(2, '0')
    const mm = String(month + 1).padStart(2, '0')
    return `${year}-${mm}-${dd}`
  }

  const isToday = (d) => {
    const t = new Date()
    return d === t.getDate() && month === t.getMonth() && year === t.getFullYear()
  }

  const days = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']

  return (
    <div className="card">
      <div className="panel-title"><div className="icon">🛋️</div>חדר דיירים – זמינות</div>

      {/* Building tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['12', '14'].map(b => (
          <button key={b}
            className={`pro-tab-btn${activeBuilding === b ? ' active' : ''}`}
            onClick={() => setActiveBuilding(b)}
          >🏠 עגנון {b}</button>
        ))}
      </div>

      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button onClick={nextMonth} style={navBtn}>→</button>
        <div style={{ fontWeight: '800', fontSize: '16px', color: 'var(--primary)' }}>{monthName}</div>
        <button onClick={prevMonth} style={navBtn}>←</button>
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '16px' }}>
        {/* Day headers */}
        {days.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '12px', fontWeight: '700', color: 'var(--muted)', padding: '6px 0' }}>{d}</div>
        ))}

        {/* Empty cells before first day */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e${i}`} />
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dateStr = toDateStr(day)
          const booked = bookedDates.has(dateStr)
          const today = isToday(day)
          const past = new Date(year, month, day) < new Date(new Date().setHours(0,0,0,0))

          return (
            <div key={day} style={{
              textAlign: 'center',
              padding: '8px 4px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: today ? '800' : booked ? '700' : '400',
              background: booked ? '#fde8e8' : today ? 'var(--primary)' : 'transparent',
              color: booked ? '#c04444' : today ? 'white' : past ? '#ccc' : 'var(--text)',
              border: booked ? '1.5px solid #f0b8b8' : today ? 'none' : '1px solid transparent',
              position: 'relative',
            }}>
              {day}
              {booked && <div style={{ fontSize: '8px', marginTop: '1px', color: '#c04444' }}>תפוס</div>}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--muted)' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#fde8e8', border: '1px solid #f0b8b8' }}></div>
          תפוס
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--muted)' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'var(--primary)' }}></div>
          היום
        </div>
      </div>

      <div className="note">
        📞 יש להתעדכן מול חברת הניהול לצורך הזמנת החדר או לוודא זמינות.<br/>
        <strong>HIGH TOWER</strong> · 03-6440424
      </div>

      <div className="divider"></div>
      <div style={{fontSize:'13px', color:'var(--muted)', marginBottom:'10px', fontWeight:'700'}}>📄 מסמכים</div>
      <a className="link-btn outline" href={import.meta.env.BASE_URL + 'תקנון_חדר_דיירים_עגנון_קרית_אונו.pdf'}
        target="_blank" rel="noopener" style={{display:'flex'}}>
        📄 &nbsp; תקנון חדר דיירים – עגנון 12
      </a>
    </div>
  )
}

const navBtn = {
  background: '#f0ede8', border: '1px solid var(--border)', borderRadius: '8px',
  padding: '6px 14px', cursor: 'pointer', fontSize: '16px',
  fontFamily: 'Heebo, sans-serif', color: 'var(--primary)', fontWeight: '700'
}
