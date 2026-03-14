import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const EMPTY = { building: '12', booker_name: '', date: '', signed_rules: false, paid_deposit: false, paid_committee: false }

const DAYS_HE = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']
const MONTHS_HE = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']

function MiniCalendar({ bookedDates }) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayStr = today.toISOString().split('T')[0]

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const fmtDate = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  return (
    <div style={{ background: '#f7f5f1', borderRadius: '14px', padding: '14px 16px', marginBottom: '18px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--primary)', padding: '2px 8px' }}>‹</button>
        <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--primary)' }}>
          {MONTHS_HE[month]} {year}
        </div>
        <button onClick={() => setViewDate(new Date(year, month + 1, 1))}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--primary)', padding: '2px 8px' }}>›</button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginBottom: '4px' }}>
        {DAYS_HE.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '10px', fontWeight: '700', color: 'var(--muted)', padding: '2px' }}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />
          const ds = fmtDate(day)
          const isBooked = bookedDates.includes(ds)
          const isToday = ds === todayStr
          const isPast = ds < todayStr
          return (
            <div key={ds} style={{
              textAlign: 'center', fontSize: '12px', padding: '5px 2px', borderRadius: '7px',
              fontWeight: isBooked ? '800' : '400',
              background: isBooked ? '#1B3A5C' : isToday ? '#e4edf8' : 'transparent',
              color: isBooked ? 'white' : isPast ? '#ccc' : isToday ? 'var(--primary)' : 'var(--text)',
              border: isToday && !isBooked ? '1.5px solid var(--primary)' : 'none',
            }}>
              {day}
              {isBooked && <div style={{ fontSize: '5px', marginTop: '1px', opacity: 0.7 }}>●</div>}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '10px', fontSize: '11px', color: 'var(--muted)' }}>
        <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '3px', background: '#1B3A5C', marginLeft: '4px' }}></span>תפוס</span>
        <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '3px', background: '#e4edf8', border: '1px solid var(--primary)', marginLeft: '4px' }}></span>היום</span>
      </div>
    </div>
  )
}

export default function RoomBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeBuilding, setActiveBuilding] = useState('12')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('room_bookings').select('*').order('date', { ascending: true })
    setBookings(data || [])
    setLoading(false)
  }

  const filtered = bookings
    .filter(b => b.building === activeBuilding)
    .sort((a, b) => a.date.localeCompare(b.date))

  const bookedDates = filtered.map(b => b.date)

  const openNew = () => { setForm({ ...EMPTY, building: activeBuilding }); setEditingId(null); setShowForm(true) }
  const openEdit = (b) => { setForm({ ...b }); setEditingId(b.id); setShowForm(true) }
  const cancel = () => { setShowForm(false); setEditingId(null); setForm(EMPTY) }

  const save = async () => {
    if (!form.booker_name || !form.date) return
    const duplicate = bookings.find(b => b.building === activeBuilding && b.date === form.date && b.id !== editingId)
    if (duplicate) {
      if (!window.confirm(`כבר יש אירוע בתאריך הזה (${formatDate(form.date)}).\nלשמור בכל זאת?`)) return
    }
    setSaving(true)
    if (editingId) {
      await supabase.from('room_bookings').update({
        booker_name: form.booker_name, date: form.date,
        signed_rules: form.signed_rules, paid_deposit: form.paid_deposit, paid_committee: form.paid_committee
      }).eq('id', editingId)
    } else {
      await supabase.from('room_bookings').insert([{
        building: activeBuilding, booker_name: form.booker_name, date: form.date,
        signed_rules: form.signed_rules, paid_deposit: form.paid_deposit, paid_committee: form.paid_committee
      }])
    }
    setSaving(false); setShowForm(false); setEditingId(null); setForm(EMPTY); load()
  }

  const deleteBooking = async (id) => {
    if (!window.confirm('למחוק הזמנה זו?')) return
    await supabase.from('room_bookings').delete().eq('id', id)
    setBookings(b => b.filter(x => x.id !== id))
  }

  const toggle = (field) => setForm(f => ({ ...f, [field]: !f[field] }))

  const formatDate = (d) => new Date(d + 'T12:00:00').toLocaleDateString('he-IL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  const isPast = (d) => new Date(d + 'T23:59:59') < new Date()

  return (
    <div>
      {/* Building tabs */}
      <div className="ctab-bar">
        {['12', '14'].map(b => (
          <button key={b} className={`ctab-btn${activeBuilding === b ? ' active' : ''}`}
            onClick={() => { setActiveBuilding(b); setShowForm(false) }}>
            עגנון {b}
          </button>
        ))}
      </div>
      <div className="ctab-body" style={{ paddingTop: '16px' }}>

      {/* Mini calendar */}
      {!loading && <MiniCalendar bookedDates={bookedDates} />}

      {/* Add button */}
      {!showForm && (
        <button onClick={openNew} style={{
          background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '100px',
          padding: '9px 20px', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
          fontFamily: 'Heebo, sans-serif', marginBottom: '16px'
        }}>+ הזמנה חדשה</button>
      )}

      {/* Form */}
      {showForm && (
        <div style={{ background: '#f7f5f1', border: '1.5px solid var(--border)', borderRadius: '13px', padding: '18px', marginBottom: '18px' }}>
          <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--primary)', marginBottom: '14px' }}>
            {editingId ? '✏️ עריכת הזמנה' : '+ הזמנה חדשה'} — עגנון {activeBuilding}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <div style={lbl}>שם המזמין *</div>
              <input value={form.booker_name} onChange={e => setForm(f => ({ ...f, booker_name: e.target.value }))}
                placeholder="ישראל ישראלי" style={inp} />
            </div>
            <div>
              <div style={lbl}>תאריך *</div>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                style={{ ...inp, direction: 'ltr' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {[
              { field: 'signed_rules', label: 'חתם על תקנון' },
              { field: 'paid_deposit', label: 'הביא המחאה לפיקדון' },
              { field: 'paid_committee', label: 'שילם 100 ₪ לוועד הבית' },
            ].map(({ field, label }) => (
              <label key={field} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
                <input type="checkbox" checked={form[field]} onChange={() => toggle(field)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                {label}
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={save} disabled={saving} style={{
              background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '100px',
              padding: '9px 22px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Heebo, sans-serif'
            }}>{saving ? 'שומר...' : '💾 שמור'}</button>
            <button onClick={cancel} style={{
              background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)',
              borderRadius: '100px', padding: '9px 18px', fontSize: '14px', cursor: 'pointer', fontFamily: 'Heebo, sans-serif'
            }}>ביטול</button>
          </div>
        </div>
      )}

      {loading && <div style={{ color: 'var(--muted)' }}>טוען...</div>}
      {!loading && filtered.length === 0 && (
        <div className="info-block" style={{ textAlign: 'center', color: 'var(--muted)', padding: '28px' }}>
          📭 אין הזמנות לחדר דיירים עגנון {activeBuilding}.
        </div>
      )}

      {filtered.map(b => (
        <div key={b.id} style={{
          background: isPast(b.date) ? '#f5f5f5' : 'white',
          border: `1.5px solid ${isPast(b.date) ? '#e0e0e0' : 'var(--border)'}`,
          borderRadius: '12px', padding: '14px 18px', marginBottom: '10px',
          opacity: isPast(b.date) ? 0.55 : 1,
          transition: 'opacity 0.15s',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', fontSize: '15px', color: isPast(b.date) ? 'var(--muted)' : 'var(--primary)' }}>{b.booker_name}</span>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>📅 {formatDate(b.date)}</span>
                {isPast(b.date) && <span style={{ fontSize: '11px', background: '#e8e8e8', color: '#888', padding: '2px 8px', borderRadius: '100px' }}>עבר</span>}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { ok: b.signed_rules, label: 'תקנון' },
                  { ok: b.paid_deposit, label: 'פיקדון' },
                  { ok: b.paid_committee, label: '100 ₪ לוועד' },
                ].map(({ ok, label }) => (
                  <span key={label} style={{
                    fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '100px',
                    background: ok ? '#d6f0e4' : '#fdf0f0',
                    color: ok ? '#1a5c38' : '#c04444',
                    border: `1px solid ${ok ? '#8ecfad' : '#f0b8b8'}`
                  }}>{ok ? '✓' : '✗'} {label}</span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button onClick={() => openEdit(b)} style={{ background: '#e4edf8', border: 'none', borderRadius: '8px', padding: '7px 12px', cursor: 'pointer', fontSize: '13px', fontFamily: 'Heebo, sans-serif' }}>✏️</button>
              <button onClick={() => deleteBooking(b.id)} style={{ background: '#fdf0f0', border: 'none', borderRadius: '8px', padding: '7px 12px', cursor: 'pointer', fontSize: '13px', fontFamily: 'Heebo, sans-serif' }}>🗑️</button>
            </div>
          </div>
        </div>
      ))}
      </div>
    </div>
  )
}

const lbl = { fontSize: '12px', fontWeight: '700', color: 'var(--muted)', marginBottom: '6px' }
const inp = {
  width: '100%', padding: '10px 14px', borderRadius: '10px',
  border: '1.5px solid var(--border)', fontSize: '14px',
  fontFamily: 'Heebo, sans-serif', background: '#fafaf8',
  outline: 'none', boxSizing: 'border-box', color: 'var(--text)',
}
