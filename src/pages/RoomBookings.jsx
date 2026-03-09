import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const EMPTY = { building: '12', booker_name: '', date: '', signed_rules: false, paid_deposit: false, paid_committee: false }

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

  const filtered = bookings.filter(b => b.building === activeBuilding)

  const openNew = () => {
    setForm({ ...EMPTY, building: activeBuilding })
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (b) => {
    setForm({ ...b })
    setEditingId(b.id)
    setShowForm(true)
  }

  const cancel = () => { setShowForm(false); setEditingId(null); setForm(EMPTY) }

  const save = async () => {
    if (!form.booker_name || !form.date) return
    setSaving(true)
    if (editingId) {
      await supabase.from('room_bookings').update({
        booker_name: form.booker_name, date: form.date,
        signed_rules: form.signed_rules, paid_deposit: form.paid_deposit,
        paid_committee: form.paid_committee
      }).eq('id', editingId)
    } else {
      await supabase.from('room_bookings').insert([{
        building: activeBuilding,
        booker_name: form.booker_name, date: form.date,
        signed_rules: form.signed_rules, paid_deposit: form.paid_deposit,
        paid_committee: form.paid_committee
      }])
    }
    setSaving(false)
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY)
    load()
  }

  const deleteBooking = async (id) => {
    if (!window.confirm('למחוק הזמנה זו?')) return
    await supabase.from('room_bookings').delete().eq('id', id)
    setBookings(b => b.filter(x => x.id !== id))
  }

  const toggle = (field) => setForm(f => ({ ...f, [field]: !f[field] }))

  const formatDate = (d) => {
    const dt = new Date(d + 'T12:00:00')
    return dt.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  const isPast = (d) => new Date(d + 'T23:59:59') < new Date()

  return (
    <div>
      {/* Building tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['12', '14'].map(b => (
          <button key={b}
            className={`pro-tab-btn${activeBuilding === b ? ' active' : ''}`}
            onClick={() => { setActiveBuilding(b); setShowForm(false) }}
          >🏠 עגנון {b}</button>
        ))}
      </div>

      {/* Add button */}
      {!showForm && (
        <button onClick={openNew} style={{
          background: 'var(--accent)', color: 'white', border: 'none',
          borderRadius: '100px', padding: '9px 20px', fontSize: '14px',
          fontWeight: '700', cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
          marginBottom: '16px'
        }}>+ הזמנה חדשה</button>
      )}

      {/* Form */}
      {showForm && (
        <div style={{
          background: '#f7f5f1', border: '1.5px solid var(--border)',
          borderRadius: '13px', padding: '18px', marginBottom: '18px'
        }}>
          <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--primary)', marginBottom: '14px' }}>
            {editingId ? '✏️ עריכת הזמנה' : '+ הזמנה חדשה'} — עגנון {activeBuilding}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <div style={lbl}>שם המזמין *</div>
              <input value={form.booker_name} onChange={e => setForm(f => ({ ...f, booker_name: e.target.value }))}
                placeholder="ישראל ישראלי" style={inp} className="req-input" />
            </div>
            <div>
              <div style={lbl}>תאריך *</div>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                style={{ ...inp, direction: 'ltr' }} className="req-input" />
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
              background: 'var(--primary)', color: 'white', border: 'none',
              borderRadius: '100px', padding: '9px 22px', fontSize: '14px',
              fontWeight: '700', cursor: 'pointer', fontFamily: 'Heebo, sans-serif'
            }}>{saving ? 'שומר...' : '💾 שמור'}</button>
            <button onClick={cancel} style={{
              background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)',
              borderRadius: '100px', padding: '9px 18px', fontSize: '14px',
              cursor: 'pointer', fontFamily: 'Heebo, sans-serif'
            }}>ביטול</button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading && <div style={{ color: 'var(--muted)' }}>טוען...</div>}

      {!loading && filtered.length === 0 && (
        <div className="info-block" style={{ textAlign: 'center', color: 'var(--muted)', padding: '28px' }}>
          📭 אין הזמנות לחדר דיירים עגנון {activeBuilding}.
        </div>
      )}

      {filtered.map(b => (
        <div key={b.id} style={{
          background: isPast(b.date) ? '#f9f9f9' : '#fff',
          border: `1px solid ${isPast(b.date) ? '#e8e8e8' : 'var(--border)'}`,
          borderRadius: '12px', padding: '14px 18px', marginBottom: '10px',
          opacity: isPast(b.date) ? 0.6 : 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--primary)' }}>{b.booker_name}</span>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>📅 {formatDate(b.date)}</span>
                {isPast(b.date) && <span style={{ fontSize: '11px', background: '#f0ede8', color: 'var(--muted)', padding: '2px 8px', borderRadius: '100px' }}>עבר</span>}
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
              <button onClick={() => openEdit(b)} style={{
                background: '#e4edf8', border: 'none', borderRadius: '8px',
                padding: '7px 12px', cursor: 'pointer', fontSize: '13px', fontFamily: 'Heebo, sans-serif'
              }}>✏️</button>
              <button onClick={() => deleteBooking(b.id)} style={{
                background: '#fdf0f0', border: 'none', borderRadius: '8px',
                padding: '7px 12px', cursor: 'pointer', fontSize: '13px', fontFamily: 'Heebo, sans-serif'
              }}>🗑️</button>
            </div>
          </div>
        </div>
      ))}
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
