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

const emptyTenant = () => ({ name: '', phone: '', phone2: '', email: '', email2: '' })

export default function UpdateProfile() {
  // Steps: select → pending_warn → confirm → form → done
  const [step, setStep] = useState('select')
  const [building, setBuilding] = useState('')
  const [aptNum, setAptNum] = useState('')
  const [owners, setOwners] = useState([])
  const [tenants, setTenants] = useState([])           // existing tenants from DB
  const [pendingCount, setPendingCount] = useState(0)
  const [loadingApt, setLoadingApt] = useState(false)
  const [aptError, setAptError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Action: 'replace_all' | 'replace_one' | 'add_tenant'
  const [action, setAction] = useState(null)
  const [replacingTenant, setReplacingTenant] = useState(null)

  // NEW: array of tenant detail objects (1+)
  const [newTenants, setNewTenants] = useState([emptyTenant()])
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState({})  // keyed by `${idx}_${field}`

  const updateTenant = (idx, key, value) => {
    setNewTenants(prev => prev.map((t, i) => i === idx ? { ...t, [key]: value } : t))
    // Clear that specific error as user types
    if (errors[`${idx}_${key}`]) {
      setErrors(prev => {
        const n = { ...prev }
        delete n[`${idx}_${key}`]
        return n
      })
    }
  }

  const addAnotherTenant = () => {
    setNewTenants(prev => [...prev, emptyTenant()])
  }

  const removeTenant = (idx) => {
    setNewTenants(prev => prev.filter((_, i) => i !== idx))
    // Re-index errors so they don't end up pointing at the wrong row
    setErrors(prev => {
      const next = {}
      Object.entries(prev).forEach(([k, v]) => {
        const m = k.match(/^(\d+)_(.+)$/)
        if (!m) { next[k] = v; return }
        const i = parseInt(m[1])
        if (i === idx) return                  // drop errors for removed row
        next[`${i > idx ? i - 1 : i}_${m[2]}`] = v
      })
      return next
    })
  }

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
    if ((data.pending_requests || 0) > 0) {
      setStep('pending_warn')
    } else {
      setStep('confirm')
    }
  }

  const chooseAction = (act, tenant = null) => {
    setAction(act)
    setReplacingTenant(tenant)
    setNewTenants([emptyTenant()])
    setNotes('')
    setErrors({})
    setStep('form')
  }

  const validate = () => {
    const e = {}
    newTenants.forEach((t, idx) => {
      if (!t.name.trim()) e[`${idx}_name`] = 'שם מלא הוא שדה חובה'
      if (!t.phone.trim()) e[`${idx}_phone`] = 'טלפון הוא שדה חובה'
      else if (!/^[\d\-\+\s]{7,}$/.test(t.phone.trim())) e[`${idx}_phone`] = 'מספר טלפון לא תקין'
      if (!t.email.trim()) e[`${idx}_email`] = 'מייל הוא שדה חובה'
      else if (!/\S+@\S+\.\S+/.test(t.email.trim())) e[`${idx}_email`] = 'כתובת מייל לא תקינה'
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async () => {
    if (!validate()) return
    setSubmitting(true)

    const request_type = action === 'add_tenant' ? 'add_tenant' : 'replace_tenant'

    const rows = newTenants.map(t => ({
      building: parseInt(building),
      apt: parseInt(aptNum),
      request_type,
      replace_tenant_name: action === 'replace_one' ? replacingTenant : null,
      name: t.name.trim(),
      phone: t.phone.trim(),
      phone2: t.phone2.trim() || null,
      email: t.email.trim(),
      email2: t.email2.trim() || null,
      notes: notes.trim() || null,
      status: 'pending',
    }))

    const { error } = await supabase.from('profile_update_requests').insert(rows)
    setSubmitting(false)
    if (error) {
      alert('שליחת הבקשה נכשלה: ' + (error.message || ''))
      return
    }
    setStep('done')
  }

  const reset = () => {
    setStep('select'); setBuilding(''); setAptNum('')
    setOwners([]); setTenants([]); setPendingCount(0)
    setAction(null); setReplacingTenant(null)
    setNewTenants([emptyTenant()]); setNotes('')
    setErrors({})
  }

  const noticeBox = (
    <div style={{ background: '#fffbea', border: '1px solid #f0d060', borderRadius: '10px', padding: '11px 14px', fontSize: '12px', color: '#7a6000', marginBottom: '18px', lineHeight: '1.6' }}>
      ℹ️ הפרטים <strong>לא יעודכנו אוטומטית</strong> — הבקשה תועבר לועד הבית לאישור לפני שינוי כלשהו במערכת.
    </div>
  )

  // Headline text per action + tenant count
  const formHeadline = () => {
    const n = newTenants.length
    if (action === 'add_tenant') {
      return n === 1 ? '➕ פרטי השוכר הנוסף' : `➕ פרטי ${n} השוכרים הנוספים`
    }
    if (action === 'replace_all') {
      return n === 1 ? '🔄 פרטי השוכר החדש (יחליף את כולם)' : `🔄 פרטי ${n} השוכרים החדשים (יחליפו את כולם)`
    }
    if (action === 'replace_one') {
      return n === 1
        ? `↩️ פרטי השוכר החדש (יחליף את ${replacingTenant})`
        : `↩️ פרטי ${n} השוכרים החדשים (יחליפו את ${replacingTenant})`
    }
    return ''
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
            {formHeadline()}
            <div style={{ fontSize: '12px', opacity: 0.75, marginTop: '3px', fontWeight: '400' }}>בניין {building} · דירה {aptNum}</div>
          </div>

          {/* Per-tenant cards */}
          {newTenants.map((tenant, idx) => (
            <div key={idx} style={{
              background: 'white',
              border: '1.5px solid var(--border)',
              borderRadius: '12px',
              padding: '14px 14px 6px',
              marginBottom: '12px',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '1px dashed var(--border)',
              }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)' }}>
                  {newTenants.length === 1 ? 'פרטי השוכר' : `שוכר ${idx + 1}`}
                </div>
                {newTenants.length > 1 && (
                  <button type="button" onClick={() => removeTenant(idx)} style={{
                    background: 'transparent',
                    border: '1px solid #e05555',
                    color: '#e05555',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontFamily: 'Heebo, sans-serif',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}>✕ הסר</button>
                )}
              </div>

              {[
                { key: 'name',   label: 'שם מלא *',        placeholder: 'שם פרטי + שם משפחה', dir: 'rtl' },
                { key: 'phone',  label: 'טלפון ראשי *',     placeholder: '05x-xxxxxxx',         dir: 'ltr' },
                { key: 'phone2', label: 'טלפון נוסף',       placeholder: '(רשות)',               dir: 'ltr' },
                { key: 'email',  label: 'מייל ראשי *',      placeholder: 'email@example.com',    dir: 'ltr' },
                { key: 'email2', label: 'מייל נוסף',        placeholder: '(רשות)',               dir: 'ltr' },
              ].map(item => {
                const errKey = `${idx}_${item.key}`
                return (
                  <div key={item.key} style={{ marginBottom: '10px' }}>
                    <span style={lbl}>{item.label}</span>
                    <input value={tenant[item.key]}
                      onChange={e => updateTenant(idx, item.key, e.target.value)}
                      placeholder={item.placeholder} dir={item.dir}
                      style={inp(errors[errKey] ? { borderColor: '#e05555', background: '#fff' } : { background: '#fafaf8' })} />
                    {errors[errKey] && <div style={{ color: '#e05555', fontSize: '12px', marginTop: '4px' }}>{errors[errKey]}</div>}
                  </div>
                )
              })}
            </div>
          ))}

          {/* Add another tenant button */}
          <button type="button" onClick={addAnotherTenant} style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            border: '2px dashed var(--primary)',
            background: 'transparent',
            color: 'var(--primary)',
            fontFamily: 'Heebo, sans-serif',
            fontWeight: '700',
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: '18px',
            transition: 'all 0.15s',
          }}>
            ➕ {newTenants.length === 1 ? 'יש דייר נוסף? הוסף אותו' : 'הוסף עוד דייר'}
          </button>

          <div style={{ marginBottom: '20px' }}>
            <span style={lbl}>הערות לועד הבית (רשות)</span>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
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
              {submitting
                ? 'שולח...'
                : (newTenants.length === 1 ? '📨 שלח לאישור הועד' : `📨 שלח ${newTenants.length} בקשות לאישור הועד`)}
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
