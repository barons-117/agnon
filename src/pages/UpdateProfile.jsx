import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

function clean(v) { return v === null || v === undefined ? '' : String(v) }

const inp = (extra = {}) => ({
  width: '100%', padding: '10px 13px', borderRadius: '10px',
  border: '1.5px solid var(--border)', fontSize: '14px',
  fontFamily: 'Heebo, sans-serif', background: '#fafaf8',
  boxSizing: 'border-box', outline: 'none', ...extra,
})
const lbl = { fontSize: '12px', fontWeight: '700', color: 'var(--muted)', marginBottom: '5px', display: 'block' }
const actionBtn = (active) => ({
  width: '100%', padding: '13px 16px', borderRadius: '10px',
  border: `2px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
  background: active ? 'var(--primary)' : 'white',
  color: active ? 'white' : 'var(--text)',
  fontFamily: 'Heebo, sans-serif', fontWeight: '700', fontSize: '14px',
  cursor: 'pointer', textAlign: 'right', transition: 'all 0.15s',
})

export default function UpdateProfile() {
  // Steps: select → pending_warn → confirm → action_select → form → done
  const [step, setStep] = useState('select')
  const [building, setBuilding] = useState('')
  const [aptNum, setAptNum] = useState('')
  const [owners, setOwners] = useState([])
  const [tenants, setTenants] = useState([])
  const [pendingCount, setPendingCount] = useState(0)
  const [loadingApt, setLoadingApt] = useState(false)
  const [aptError, setAptError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Action: 'replace_all' | 'replace_one' | 'add_tenant'
  const [action, setAction] = useState(null)
  const [replacingTenant, setReplacingTenant] = useState(null) // name of tenant being replaced

  const [form, setForm] = useState({ name: '', phone: '', phone2: '', email: '', email2: '', notes: '' })
  const [errors, setErrors] = useState({})
  const ff = (k) => e => setForm(x => ({ ...x, [k]: e.target.value }))

  const lookupApt = async () => {
    if (!building || !aptNum.trim()) return
    setLoadingApt(true)
    setAptError('')
    const { data, error } = await supabase.rpc('get_apt_names', {
      p_building: parseInt(building),
      p_apt: parseInt(aptNum),
    })
    if (error || !data?.exists) {
      setAptError('לא נמצאה דירה — בדוק מספר דירה ובניין')
      setLoadingApt(false)
      return
    }
    setOwners((data.owners || []).map((name, i) => ({ id: i, name })))
    setTenants((data.tenants || []).map((name, i) => ({ id: i, name })))
    setPendingCount(data.pending_requests || 0)
    setLoadingApt(false)
    // If pending requests exist, warn first
    if ((data.pending_requests || 0) > 0) {
      setStep('pending_warn')
    } else {
      setStep('confirm')
    }
  }

  const chooseAction = (act, tenant = null) => {
    setAction(act)
    setReplacingTenant(tenant)
    setForm({ name: '', phone: '', phone2: '', email: '', email2: '', notes: '' })
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

    const request_type = action === 'add_tenant' ? 'add_tenant' : 'replace_tenant'

    await supabase.from('profile_update_requests').insert([{
      building: parseInt(building),
      apt: parseInt(aptNum),
      request_type,
      replace_tenant_name: action === 'replace_one' ? replacingTenant : null,
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
    setStep('select'); setBuilding(''); setAptNum('')
    setOwners([]); setTenants([]); setPendingCount(0)
    setAction(null); setReplacingTenant(null)
    setForm({ name: '', phone: '', phone2: '', email: '', email2: '', notes: '' })
    setErrors({})
  }

  const noticeBox = (
    <div style={{ background: '#fffbea', border: '1px solid #f0d060', borderRadius: '10px', padding: '11px 14px', fontSize: '12px', color: '#7a6000', marginBottom: '18px', lineHeight: '1.6' }}>
      ℹ️ הפרטים <strong>לא יעודכנו אוטומטית</strong> — הבקשה תועבר לועד הבית לאישור לפני שינוי כלשהו במערכת.
    </div>
  )

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
            <span style={lbl}>בחר בניין</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[['12', 'שי עגנון 12'], ['14', 'שי עגנון 14']].map(([val, lb]) => (
                <button key={val} onClick={() => setBuilding(val)} style={{
                  flex: 1, padding: '12px', borderRadius: '10px',
                  border: `2px solid ${building === val ? 'var(--primary)' : 'var(--border)'}`,
                  background: building === val ? 'var(--primary)' : 'white',
                  color: building === val ? 'white' : 'var(--text)',
                  fontFamily: 'Heebo, sans-serif', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.15s',
                }}>{lb}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <span style={lbl}>מספר דירה</span>
            <input value={aptNum} onChange={e => setAptNum(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => e.key === 'Enter' && building && aptNum && lookupApt()}
              placeholder="למשל: 42" style={inp()} inputMode="numeric" maxLength={3} />
            {aptError && <div style={{ color: '#e05555', fontSize: '12px', marginTop: '5px' }}>{aptError}</div>}
          </div>

          <button onClick={lookupApt} disabled={!building || !aptNum || loadingApt} style={{
            background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px',
            padding: '12px 28px', fontFamily: 'Heebo, sans-serif', fontWeight: '700', fontSize: '15px',
            cursor: !building || !aptNum ? 'not-allowed' : 'pointer',
            opacity: !building || !aptNum ? 0.5 : 1, width: '100%', transition: 'all 0.15s',
          }}>
            {loadingApt ? 'מחפש...' : 'חיפוש דירה →'}
          </button>
        </div>
      )}

      {/* ── STEP: PENDING WARN ── */}
      {step === 'pending_warn' && (
        <div style={{ maxWidth: '420px' }}>
          <div style={{ background: '#fff8e0', border: '2px solid #f0b840', borderRadius: '14px', padding: '20px 18px', marginBottom: '18px' }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>⚠️</div>
            <div style={{ fontWeight: '800', fontSize: '15px', color: '#7a5000', marginBottom: '8px' }}>
              יש בקשה ממתינה לדירה זו
            </div>
            <div style={{ fontSize: '13.5px', color: '#7a5000', lineHeight: '1.7' }}>
              קיימת בקשת עדכון פתוחה לדירה <strong>{aptNum}</strong> בבניין <strong>{building}</strong> שטרם אושרה על ידי הועד.
              <br/>האם ברצונך להמשיך ולשלוח בקשה נוספת?
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setStep('confirm')} style={{
              flex: 1, background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px',
              padding: '12px', fontFamily: 'Heebo, sans-serif', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
            }}>כן, המשך בכל זאת</button>
            <button onClick={reset} style={{
              flex: 1, background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '12px', fontFamily: 'Heebo, sans-serif', fontSize: '13px', cursor: 'pointer',
            }}>← ביטול</button>
          </div>
        </div>
      )}

      {/* ── STEP: CONFIRM ── */}
      {step === 'confirm' && (
        <div style={{ maxWidth: '420px' }}>
          {/* Owner confirmation */}
          <div style={{ background: '#f7f5f1', borderRadius: '12px', padding: '16px 18px', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)', marginBottom: '8px' }}>אימות דירה</div>
            {owners.length === 0
              ? <div style={{ fontSize: '14px', color: 'var(--text)' }}>לא נמצא בעל דירה רשום לדירה <strong>{aptNum}</strong> בבניין <strong>{building}</strong>.</div>
              : <div style={{ fontSize: '15px', color: 'var(--text)', lineHeight: '1.8' }}>האם הדירה שייכת ל<strong> {owners.map(o => clean(o.name)).join(' ו-')}</strong>?</div>
            }
          </div>

          {/* Current tenants - names only */}
          {tenants.length > 0 && (
            <div style={{ background: '#edf4fb', border: '1px solid #c4d4f0', borderRadius: '12px', padding: '16px 18px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)', marginBottom: '8px' }}>שוכרים נוכחיים</div>
              {tenants.map(t => (
                <div key={t.id} style={{ fontSize: '14px', color: 'var(--text)', padding: '4px 0', fontWeight: '600' }}>
                  {clean(t.name)}
                </div>
              ))}
            </div>
          )}

          {noticeBox}

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            {/* Replace all */}
            {tenants.length > 0 && (
              <button onClick={() => chooseAction('replace_all')} style={actionBtn(false)}>
                🔄 החלפת כל השוכרים בדירה
              </button>
            )}

            {/* Replace specific (only when multiple tenants) */}
            {tenants.length > 1 && tenants.map(t => (
              <button key={t.id} onClick={() => chooseAction('replace_one', clean(t.name))}
                style={{ ...actionBtn(false), paddingRight: '20px', fontSize: '13px' }}>
                ↩️ החלפת {clean(t.name)} בלבד
              </button>
            ))}

            {/* Add tenant (always available if there are owners) */}
            <button onClick={() => chooseAction('add_tenant')} style={actionBtn(false)}>
              ➕ {tenants.length > 0 ? 'הוספת שוכר נוסף' : 'הוספת שוכר לדירה'}
            </button>
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
            {action === 'add_tenant' && '➕ פרטי השוכר הנוסף'}
            {action === 'replace_all' && '🔄 פרטי השוכר החדש (יחליף את כולם)'}
            {action === 'replace_one' && `↩️ פרטי השוכר החדש (יחליף את ${replacingTenant})`}
            <div style={{ fontSize: '12px', opacity: 0.75, marginTop: '3px', fontWeight: '400' }}>בניין {building} · דירה {aptNum}</div>
          </div>

          {[
            { key: 'name',   label: 'שם מלא *',        placeholder: 'שם פרטי + שם משפחה', dir: 'rtl' },
            { key: 'phone',  label: 'טלפון ראשי *',     placeholder: '05x-xxxxxxx',         dir: 'ltr' },
            { key: 'phone2', label: 'טלפון נוסף',       placeholder: '(רשות)',               dir: 'ltr' },
            { key: 'email',  label: 'מייל ראשי *',      placeholder: 'email@example.com',    dir: 'ltr' },
            { key: 'email2', label: 'מייל נוסף',        placeholder: '(רשות)',               dir: 'ltr' },
          ].map(item => (
            <div key={item.key} style={{ marginBottom: '14px' }}>
              <span style={lbl}>{item.label}</span>
              <input value={form[item.key]} onChange={ff(item.key)}
                placeholder={item.placeholder} dir={item.dir}
                style={inp(errors[item.key] ? { borderColor: '#e05555' } : {})} />
              {errors[item.key] && <div style={{ color: '#e05555', fontSize: '12px', marginTop: '4px' }}>{errors[item.key]}</div>}
            </div>
          ))}

          <div style={{ marginBottom: '20px' }}>
            <span style={lbl}>הערות לועד הבית (רשות)</span>
            <textarea value={form.notes} onChange={ff('notes')}
              placeholder="רוצים להוסיף משהו לועד?"
              rows={3} style={{ ...inp(), resize: 'vertical', lineHeight: '1.6' }} />
          </div>

          {noticeBox}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setStep('confirm')} style={{
              background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '11px 18px', fontFamily: 'Heebo, sans-serif', fontSize: '13px', cursor: 'pointer',
            }}>← חזרה</button>
            <button onClick={submit} disabled={submitting} style={{
              flex: 1, background: '#1a7a3a', color: 'white', border: 'none', borderRadius: '10px',
              padding: '12px', fontFamily: 'Heebo, sans-serif', fontWeight: '700', fontSize: '15px',
              cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, transition: 'all 0.15s',
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
