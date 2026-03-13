import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

function clean(v) { return v === null || v === undefined ? '' : String(v) }

const inp = (extra = {}) => ({
  width: '100%', padding: '10px 13px', borderRadius: '10px',
  border: '1.5px solid var(--border)', fontSize: '14px',
  fontFamily: 'Heebo, sans-serif', background: '#fafaf8',
  boxSizing: 'border-box', outline: 'none', ...extra,
})

const label = { fontSize: '12px', fontWeight: '700', color: 'var(--muted)', marginBottom: '5px', display: 'block' }

export default function UpdateProfile() {
  const [step, setStep] = useState('select') // select | confirm | form | done
  const [building, setBuilding] = useState('')
  const [aptNum, setAptNum] = useState('')
  const [aptData, setAptData] = useState(null)
  const [owners, setOwners] = useState([])
  const [tenants, setTenants] = useState([])
  const [requestType, setRequestType] = useState(null) // 'replace_tenant' | 'add_tenant'
  const [loadingApt, setLoadingApt] = useState(false)
  const [aptError, setAptError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    name: '', phone: '', phone2: '', email: '', email2: '', notes: ''
  })
  const [errors, setErrors] = useState({})

  const f = (k) => e => setForm(x => ({ ...x, [k]: e.target.value }))

  const lookupApt = async () => {
    if (!building || !aptNum.trim()) return
    setLoadingApt(true)
    setAptError('')
    const aptInt = parseInt(aptNum)
    const { data: apt } = await supabase.from('apartments')
      .select('apt, building').eq('building', parseInt(building)).eq('apt', aptInt).single()
    if (!apt) { setAptError('לא נמצאה דירה — בדוק מספר דירה ובניין'); setLoadingApt(false); return }
    const { data: res } = await supabase.from('residents')
      .select('id, building, apt, role, name').eq('building', parseInt(building)).eq('apt', aptInt)
    setAptData(apt)
    setOwners((res || []).filter(r => r.role === 'owner'))
    setTenants((res || []).filter(r => r.role === 'tenant'))
    setStep('confirm')
    setLoadingApt(false)
  }

  const chooseAction = (type) => {
    setRequestType(type)
    // Pre-fill from existing tenant if replacing
    if (type === 'replace_tenant' && tenants.length > 0) {
      const t = tenants[0]
      setForm({ name: clean(t.name), phone: clean(t.phone), phone2: clean(t.phone2), email: clean(t.email), email2: clean(t.email2), notes: '' })
    } else {
      setForm({ name: '', phone: '', phone2: '', email: '', email2: '', notes: '' })
    }
    setErrors({})
    setStep('form')
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'שם מלא הוא שדה חובה'
    if (!form.phone.trim()) e.phone = 'טלפון הוא שדה חובה'
    else if (!/^[\d\-\+\s]{7,}$/.test(form.phone.trim())) e.phone = 'מספר טלפון לא תקין'
    if (!form.email.trim()) e.email = 'מייל הוא שדה חובה'
    else if (!/\S+@\S+\.\S+/.test(form.email.trim())) e.email = 'כתובת מייל לא תקינה'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async () => {
    if (!validate()) return
    setSubmitting(true)
    await supabase.from('profile_update_requests').insert([{
      building: parseInt(building),
      apt: parseInt(aptNum),
      request_type: requestType,
      name: form.name.trim(),
      phone: form.phone.trim(),
      phone2: form.phone2.trim() || null,
      email: form.email.trim(),
      email2: form.email2.trim() || null,
      notes: form.notes.trim() || null,
      status: 'pending',
    }])
    setSubmitting(false)
    setStep('done')
  }

  const reset = () => {
    setStep('select'); setBuilding(''); setAptNum(''); setAptData(null)
    setOwners([]); setTenants([]); setRequestType(null)
    setForm({ name: '', phone: '', phone2: '', email: '', email2: '', notes: '' })
    setErrors({})
  }

  return (
    <section className="page-section">
      <div className="section-title">✏️ עדכון פרטי שוכר</div>

      {/* ── STEP: SELECT ── */}
      {step === 'select' && (
        <div style={{ maxWidth: '420px' }}>
          <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '20px', lineHeight: '1.7' }}>
            מלא את פרטי הדירה כדי לאתר את הרשומה הקיימת, ולאחר מכן תוכל להגיש בקשת עדכון לועד הבית.
          </p>

          <div style={{ marginBottom: '14px' }}>
            <span style={label}>בחר בניין</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[['12', 'שי עגנון 12'], ['14', 'שי עגנון 14']].map(([val, lbl]) => (
                <button key={val} onClick={() => setBuilding(val)} style={{
                  flex: 1, padding: '12px', borderRadius: '10px', border: `2px solid ${building === val ? 'var(--primary)' : 'var(--border)'}`,
                  background: building === val ? 'var(--primary)' : 'white',
                  color: building === val ? 'white' : 'var(--text)',
                  fontFamily: 'Heebo, sans-serif', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>{lbl}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <span style={label}>מספר דירה</span>
            <input value={aptNum} onChange={e => setAptNum(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => e.key === 'Enter' && building && aptNum && lookupApt()}
              placeholder="למשל: 42" style={inp()} inputMode="numeric" maxLength={3} />
            {aptError && <div style={{ color: '#e05555', fontSize: '12px', marginTop: '5px' }}>{aptError}</div>}
          </div>

          <button onClick={lookupApt} disabled={!building || !aptNum || loadingApt} style={{
            background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px',
            padding: '12px 28px', fontFamily: 'Heebo, sans-serif', fontWeight: '700', fontSize: '15px',
            cursor: !building || !aptNum ? 'not-allowed' : 'pointer', opacity: !building || !aptNum ? 0.5 : 1,
            width: '100%', transition: 'all 0.15s',
          }}>
            {loadingApt ? 'מחפש...' : 'חיפוש דירה →'}
          </button>
        </div>
      )}

      {/* ── STEP: CONFIRM ── */}
      {step === 'confirm' && aptData && (
        <div style={{ maxWidth: '420px' }}>

          {/* Ownership confirmation - names only */}
          <div style={{ background: '#f7f5f1', borderRadius: '12px', padding: '16px 18px', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)', marginBottom: '10px' }}>אימות דירה</div>
            {owners.length === 0 ? (
              <div style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.7' }}>
                לא נמצא בעל דירה רשום לדירה <strong>{aptNum}</strong> בבניין <strong>{building}</strong>.
              </div>
            ) : (
              <div style={{ fontSize: '15px', color: 'var(--text)', lineHeight: '1.8' }}>
                האם הדירה שייכת ל
                <strong> {owners.map(o => clean(o.name)).join(' ו-')}</strong>?
              </div>
            )}
          </div>

          {/* Current tenant - name only */}
          {tenants.length > 0 && (
            <div style={{ background: '#edf4fb', border: '1px solid #c4d4f0', borderRadius: '12px', padding: '16px 18px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)', marginBottom: '10px' }}>שוכר/ים נוכחי/ים</div>
              <div style={{ fontSize: '15px', color: 'var(--text)', lineHeight: '1.8' }}>
                האם{tenants.length > 1 ? ' שוכרים ' : ' שוכר/ת '}
                <strong>{tenants.map(t => clean(t.name)).join(' ו-')}</strong>
                {' '}מוחל{tenants.length > 1 ? 'פים' : 'ף/ת'}?
              </div>
            </div>
          )}

          {/* Notice */}
          <div style={{ background: '#fffbea', border: '1px solid #f0d060', borderRadius: '10px', padding: '11px 14px', fontSize: '12px', color: '#7a6000', marginBottom: '18px', lineHeight: '1.6' }}>
            ℹ️ הפרטים <strong>לא יעודכנו אוטומטית</strong> — הבקשה תועבר לועד הבית לאישור לפני שינוי כלשהו במערכת.
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
            {tenants.length > 0 && (
              <button onClick={() => chooseAction('replace_tenant')} style={{
                background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px',
                padding: '13px', fontFamily: 'Heebo, sans-serif', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
              }}>
                🔄 כן, רוצה להחליף את השוכר/ים
              </button>
            )}
            {tenants.length === 0 && (
              <button onClick={() => chooseAction('add_tenant')} style={{
                background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px',
                padding: '13px', fontFamily: 'Heebo, sans-serif', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
              }}>
                ➕ כן, רוצה להוסיף שוכר לדירה זו
              </button>
            )}
          </div>

          <button onClick={reset} style={{
            background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)',
            borderRadius: '10px', padding: '10px', fontFamily: 'Heebo, sans-serif', fontSize: '13px',
            cursor: 'pointer', width: '100%',
          }}>← לא, חפש דירה אחרת</button>
        </div>
      )}

      {/* ── STEP: FORM ── */}
      {step === 'form' && (
        <div style={{ maxWidth: '420px' }}>
          <div style={{ background: 'var(--primary)', borderRadius: '12px', padding: '12px 18px', marginBottom: '18px', color: 'white', fontSize: '14px', fontWeight: '700' }}>
            {requestType === 'replace_tenant' ? '🔄 פרטי השוכר החדש' : '➕ פרטי השוכר'} — בניין {building} דירה {aptNum}
          </div>

          {[
            { key: 'name',   label: 'שם מלא *',        placeholder: 'שם פרטי + שם משפחה', dir: 'rtl' },
            { key: 'phone',  label: 'טלפון ראשי *',     placeholder: '05x-xxxxxxx', dir: 'ltr' },
            { key: 'phone2', label: 'טלפון נוסף',       placeholder: '(רשות)', dir: 'ltr' },
            { key: 'email',  label: 'מייל ראשי *',      placeholder: 'email@example.com', dir: 'ltr' },
            { key: 'email2', label: 'מייל נוסף',        placeholder: '(רשות)', dir: 'ltr' },
          ].map(f_item => (
            <div key={f_item.key} style={{ marginBottom: '14px' }}>
              <span style={label}>{f_item.label}</span>
              <input value={form[f_item.key]} onChange={f(f_item.key)}
                placeholder={f_item.placeholder} dir={f_item.dir}
                style={inp(errors[f_item.key] ? { borderColor: '#e05555' } : {})} />
              {errors[f_item.key] && <div style={{ color: '#e05555', fontSize: '12px', marginTop: '4px' }}>{errors[f_item.key]}</div>}
            </div>
          ))}

          <div style={{ marginBottom: '20px' }}>
            <span style={label}>הערות לועד הבית (רשות)</span>
            <textarea value={form.notes} onChange={f('notes')}
              placeholder="רוצים להוסיף משהו לועד?"
              rows={3}
              style={{ ...inp(), resize: 'vertical', lineHeight: '1.6' }} />
          </div>

          {/* Notice */}
          <div style={{ background: '#fffbea', border: '1px solid #f0d060', borderRadius: '10px', padding: '11px 14px', fontSize: '12px', color: '#7a6000', marginBottom: '18px', lineHeight: '1.6' }}>
            ℹ️ הפרטים <strong>לא יעודכנו אוטומטית</strong> — הבקשה תועבר לועד הבית לאישור לפני שינוי כלשהו במערכת.
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setStep('confirm')} style={{
              background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '11px 18px', fontFamily: 'Heebo, sans-serif', fontSize: '13px', cursor: 'pointer',
            }}>← חזרה</button>
            <button onClick={submit} disabled={submitting} style={{
              flex: 1, background: '#1a7a3a', color: 'white', border: 'none', borderRadius: '10px',
              padding: '12px', fontFamily: 'Heebo, sans-serif', fontWeight: '700', fontSize: '15px',
              cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
              transition: 'all 0.15s',
            }}>
              {submitting ? 'שולח...' : '📨 שלח לאישור הועד'}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP: DONE ── */}
      {step === 'done' && (
        <div style={{ maxWidth: '380px', textAlign: 'center', padding: '30px 20px' }}>
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>✅</div>
          <div style={{ fontWeight: '800', fontSize: '18px', color: 'var(--primary)', marginBottom: '10px' }}>הבקשה נשלחה!</div>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: '1.7', marginBottom: '24px' }}>
            הבקשה לעדכון פרטי הדירה התקבלה ותועבר לועד הבית לאישור.
            לאחר האישור הפרטים יעודכנו במערכת.
          </p>
          <button onClick={reset} style={{
            background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px',
            padding: '12px 28px', fontFamily: 'Heebo, sans-serif', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
          }}>שליחת בקשה נוספת</button>
        </div>
      )}
    </section>
  )
}
