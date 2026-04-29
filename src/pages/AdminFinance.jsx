import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { generateAndStoreReceipt, getReceiptViewUrl } from '../lib/receiptPdf'
import { sendReceiptEmail } from '../lib/receiptEmail'

// ====================================================================
// AdminFinance — הנהלת חשבונות (תנועות יומן)
// ====================================================================

const PAYMENT_METHODS = [
  { id: 'cash',           label: 'מזומן' },
  { id: 'app',            label: 'אפליקציה' },
  { id: 'bank_transfer',  label: 'העברה בנקאית' },
  { id: 'check',          label: 'המחאה' },
  { id: 'other',          label: 'אחר' },
]

const STATUS_LABELS = {
  draft:     { text: 'טיוטה',  color: '#a06b00', bg: '#fdf6e0' },
  issued:    { text: 'הופקה', color: '#1a7a3a', bg: '#e9f7ee' },
  cancelled: { text: 'בוטלה', color: '#9a3a3a', bg: '#fbecec' },
}

const num = (v) => {
  const n = Number(v)
  return isNaN(n) ? 0 : n
}

const money = (n) => `₪${num(n).toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const today = () => new Date().toISOString().slice(0, 10)
const currentYear = () => new Date().getFullYear()

// ====================================================================
// MAIN COMPONENT
// ====================================================================
export default function AdminFinance() {
  const [entries, setEntries]       = useState([])
  const [categories, setCategories] = useState([])
  const [apartments, setApartments] = useState([])
  const [residents, setResidents]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [userEmail, setUserEmail]   = useState('')

  // filters
  const [buildingFilter, setBuildingFilter] = useState(12)   // 12 | 14
  const [yearFilter, setYearFilter]         = useState(currentYear())
  const [typeFilter, setTypeFilter]         = useState('all')   // all | income | expense | cancelled
  const [search, setSearch]                 = useState('')

  // modals
  const [editEntry, setEditEntry]     = useState(null)   // entry being edited or 'new'
  const [cancelEntry, setCancelEntry] = useState(null)   // entry to cancel
  const [pdfBusy, setPdfBusy]         = useState(null)   // entry id whose PDF is being generated
  const [emailBusy, setEmailBusy]     = useState(null)   // entry id whose email is being sent

  // ----- LOAD -----
  useEffect(() => { load() }, [])

  // ----- PDF actions -----
  async function viewPdf(entry) {
    if (!entry.receipt_url) return
    try {
      const url = await getReceiptViewUrl(entry.receipt_url)
      window.open(url, '_blank')
    } catch (err) {
      alert('שגיאה בפתיחת PDF: ' + (err.message || err))
    }
  }

  async function generatePdf(entry) {
    setPdfBusy(entry.id)
    try {
      await generateAndStoreReceipt(entry.id)
      await load()
      alert('PDF נוצר בהצלחה!')
    } catch (err) {
      console.error(err)
      alert('שגיאה ביצירת PDF: ' + (err.message || err))
    } finally {
      setPdfBusy(null)
    }
  }

  // ----- Email action -----
  async function sendEmail(entry) {
    const alreadySent = entry.receipt_sent_to && entry.receipt_sent_to.length > 0
    const confirmMsg = alreadySent
      ? `הקבלה כבר נשלחה ל: ${entry.receipt_sent_to.join(', ')}\n\nלשלוח שוב?`
      : `לשלוח את הקבלה במייל?` + (entry.payer_email
          ? `\n\nתישלח אל: ${entry.payer_email} + ועד הבית`
          : `\n\n(לא הוזן מייל למשלם — תישלח רק לוועד)`)

    if (!window.confirm(confirmMsg)) return

    setEmailBusy(entry.id)
    try {
      const { recipients } = await sendReceiptEmail(entry.id)
      await load()
      alert(`✉️ הקבלה נשלחה בהצלחה!\n\nנמענים:\n${recipients.map(r => `• ${r}`).join('\n')}`)
    } catch (err) {
      console.error(err)
      alert('שגיאה בשליחת מייל: ' + (err.message || err))
    } finally {
      setEmailBusy(null)
    }
  }

  async function load() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    setUserEmail(user?.email || '')

    const [eRes, cRes, aRes, rRes] = await Promise.all([
      supabase.from('journal_entries')
        .select('*, journal_entry_lines(*), journal_payment_methods(*), journal_categories(name)')
        .order('entry_date', { ascending: false })
        .order('created_at', { ascending: false }),
      supabase.from('journal_categories').select('*').eq('active', true).order('sort_order'),
      supabase.from('apartments').select('building, apt, floor').order('building').order('apt'),
      supabase.from('residents').select('*'),
    ])

    setEntries(eRes.data || [])
    setCategories(cRes.data || [])
    setApartments(aRes.data || [])
    setResidents(rRes.data || [])
    setLoading(false)
  }

  // ----- DERIVED -----
  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (e.building !== Number(buildingFilter)) return false
      if (yearFilter && e.year !== Number(yearFilter)) return false
      if (typeFilter === 'cancelled' && e.status !== 'cancelled') return false
      if (typeFilter !== 'all' && typeFilter !== 'cancelled') {
        if (e.entry_type !== typeFilter) return false
        if (e.status === 'cancelled') return false
      }
      if (typeFilter === 'all' && e.status === 'cancelled') {
        // when 'all' selected, show everything including cancelled
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        const hay = [
          e.receipt_number,
          e.payer_name,
          String(e.apt || ''),
          String(e.total_amount),
          e.notes,
        ].filter(Boolean).join(' ').toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [entries, buildingFilter, yearFilter, typeFilter, search])

  const summary = useMemo(() => {
    let income = 0, expense = 0
    for (const e of filtered) {
      if (e.status === 'cancelled') continue
      if (e.entry_type === 'income')  income  += num(e.total_amount)
      if (e.entry_type === 'expense') expense += num(e.total_amount)
    }
    return { income, expense, balance: income - expense }
  }, [filtered])

  const years = useMemo(() => {
    const ys = new Set(entries.map(e => e.year).filter(Boolean))
    ys.add(currentYear())
    return Array.from(ys).sort((a, b) => b - a)
  }, [entries])

  // ----- RENDER -----
  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>טוען...</div>

  return (
    <div style={{ padding: '0 4px' }}>
      <h2 className="panel-title">הנהלת חשבונות</h2>

      {/* Building filter — one building at a time */}
      <div className="ctab-bar" style={{ marginBottom: 14 }}>
        <button className={`ctab-btn ${buildingFilter === 12 ? 'active' : ''}`}
          onClick={() => setBuildingFilter(12)}>עגנון 12</button>
        <button className={`ctab-btn ${buildingFilter === 14 ? 'active' : ''}`}
          onClick={() => setBuildingFilter(14)}>עגנון 14</button>
      </div>

      {/* Top row: year + type tabs + search + new */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={yearFilter} onChange={e => setYearFilter(Number(e.target.value))}
          style={selStyle}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: 'all',       label: 'הכל' },
            { id: 'income',    label: 'הכנסות' },
            { id: 'expense',   label: 'הוצאות' },
            { id: 'cancelled', label: 'מבוטלות' },
          ].map(t => (
            <button key={t.id}
              className={`pro-tab-btn ${typeFilter === t.id ? 'active' : ''}`}
              onClick={() => setTypeFilter(t.id)}>{t.label}</button>
          ))}
        </div>

        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍  חיפוש..."
          style={{ flex: 1, minWidth: 160, padding: '9px 14px', borderRadius: 10,
            border: '1.5px solid var(--border)', fontSize: 13, background: '#fafaf8',
            fontFamily: 'Heebo, sans-serif', outline: 'none' }} />

        <button className="link-btn"
          onClick={() => setEditEntry({ _new: true })}>
          + תנועה חדשה
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 16 }}>
        <SummaryCard label="הכנסות"  value={money(summary.income)}  color="#1a7a3a" bg="#e9f7ee" />
        <SummaryCard label="הוצאות"  value={money(summary.expense)} color="#9a3a3a" bg="#fbecec" />
        <SummaryCard label="מאזן"     value={money(summary.balance)} color={summary.balance >= 0 ? '#1B3A5C' : '#9a3a3a'} bg="#f3f5f9" />
      </div>

      {/* Entries table */}
      {filtered.length === 0 ? (
        <div className="info-block" style={{ textAlign: 'center', color: 'var(--muted)' }}>
          אין תנועות להצגה לפי הסינון הנוכחי
        </div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 12, background: '#fff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'Heebo, sans-serif' }}>
            <thead>
              <tr style={{ background: '#f7f5f1', borderBottom: '1.5px solid var(--border)' }}>
                <th style={th}>מספר</th>
                <th style={th}>תאריך</th>
                <th style={th}>בניין</th>
                <th style={th}>דירה</th>
                <th style={th}>שם</th>
                <th style={th}>סוג</th>
                <th style={th}>קטגוריה</th>
                <th style={{ ...th, textAlign: 'left' }}>סכום</th>
                <th style={th}>סטטוס</th>
                <th style={th}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <EntryRow key={e.id} e={e} onEdit={setEditEntry} onCancel={setCancelEntry}
                  onViewPdf={viewPdf} onGeneratePdf={generatePdf} pdfBusy={pdfBusy === e.id}
                  onSendEmail={sendEmail} emailBusy={emailBusy === e.id} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {editEntry && (
        <EntryModal
          entry={editEntry._new ? null : editEntry}
          buildingDefault={Number(buildingFilter)}
          categories={categories}
          apartments={apartments}
          residents={residents}
          userEmail={userEmail}
          onClose={() => setEditEntry(null)}
          onSaved={() => { setEditEntry(null); load() }}
        />
      )}

      {cancelEntry && (
        <CancelModal
          entry={cancelEntry}
          userEmail={userEmail}
          onClose={() => setCancelEntry(null)}
          onCancelled={() => { setCancelEntry(null); load() }}
        />
      )}
    </div>
  )
}

// ====================================================================
// SUMMARY CARD
// ====================================================================
function SummaryCard({ label, value, color, bg }) {
  return (
    <div style={{ background: bg, padding: '12px 14px', borderRadius: 10, border: `1px solid ${color}22` }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
    </div>
  )
}

// ====================================================================
// ENTRY ROW
// ====================================================================
function EntryRow({ e, onEdit, onCancel, onViewPdf, onGeneratePdf, pdfBusy, onSendEmail, emailBusy }) {
  const status = STATUS_LABELS[e.status] || STATUS_LABELS.draft
  const isCancellable = e.status !== 'cancelled'
  const isEditable    = e.status === 'draft'
  const isIssued      = e.status === 'issued'
  const hasPdf        = !!e.receipt_url
  const wasSent       = Array.isArray(e.receipt_sent_to) && e.receipt_sent_to.length > 0

  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      <td style={td}><span style={{ fontFamily: 'monospace', fontSize: 12 }}>
        {e.receipt_number || <span style={{ color: 'var(--muted)' }}>—</span>}
      </span></td>
      <td style={td}>{new Date(e.entry_date).toLocaleDateString('he-IL')}</td>
      <td style={td}>{e.building}</td>
      <td style={td}>{e.is_external ? '🌐' : (e.apt || '—')}</td>
      <td style={{ ...td, fontWeight: 500 }}>{e.payer_name}</td>
      <td style={td}>
        <span style={{
          padding: '2px 8px', borderRadius: 8, fontSize: 11, fontWeight: 600,
          color: e.entry_type === 'income' ? '#1a7a3a' : '#9a3a3a',
          background: e.entry_type === 'income' ? '#e9f7ee' : '#fbecec',
        }}>
          {e.entry_type === 'income' ? 'הכנסה' : 'הוצאה'}
        </span>
      </td>
      <td style={td}>{e.journal_categories?.name || '—'}</td>
      <td style={{ ...td, textAlign: 'left', fontWeight: 600 }}>{money(e.total_amount)}</td>
      <td style={td}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
          <span style={{
            padding: '2px 8px', borderRadius: 8, fontSize: 11, fontWeight: 600,
            color: status.color, background: status.bg,
          }}>{status.text}</span>
          {wasSent && (
            <span title={`נשלח ל: ${e.receipt_sent_to.join(', ')}`}
              style={{ fontSize: 10, color: 'var(--muted)' }}>✉️ נשלח</span>
          )}
        </div>
      </td>
      <td style={td}>
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => onEdit(e)}
            style={miniBtn(isEditable ? '#1B3A5C' : 'var(--muted)')}>
            {isEditable ? 'ערוך' : 'הצג'}
          </button>
          {isIssued && hasPdf && (
            <button onClick={() => onViewPdf(e)}
              style={miniBtn('#1a7a3a')} title="צפה ב-PDF">📄 צפה</button>
          )}
          {isIssued && !hasPdf && (
            <button onClick={() => onGeneratePdf(e)}
              disabled={pdfBusy}
              style={miniBtn('#a06b00')} title="צור PDF">
              {pdfBusy ? '...' : '📄 צור'}
            </button>
          )}
          {isIssued && hasPdf && (
            <button onClick={() => onSendEmail(e)}
              disabled={emailBusy}
              style={miniBtn(wasSent ? 'var(--muted)' : '#1a5c8c')}
              title={wasSent ? 'שלח שוב' : 'שלח במייל'}>
              {emailBusy ? '...' : (wasSent ? '📧 שלח שוב' : '📧 שלח')}
            </button>
          )}
          {isCancellable && (
            <button onClick={() => onCancel(e)}
              style={miniBtn('#9a3a3a')}>בטל</button>
          )}
        </div>
      </td>
    </tr>
  )
}

// ====================================================================
// ENTRY MODAL — create / edit
// ====================================================================
function EntryModal({ entry, buildingDefault, categories, apartments, residents, userEmail, onClose, onSaved }) {
  const isNew = !entry
  const isLocked = entry && entry.status !== 'draft'

  // ----- form state -----
  const [form, setForm] = useState(() => {
    if (entry) {
      return {
        id: entry.id,
        entry_type:    entry.entry_type,
        building:      entry.building,
        apt:           entry.is_external ? 'external' : (entry.apt ? String(entry.apt) : ''),
        is_external:   entry.is_external,
        payer_name:    entry.payer_name || '',
        payer_address: entry.payer_address || '',
        payer_email:   entry.payer_email || '',
        payer_phone:   entry.payer_phone || '',
        entry_date:    entry.entry_date,
        category_id:   entry.category_id,
        notes:         entry.notes || '',
        lines: (entry.journal_entry_lines || []).sort((a, b) => a.line_order - b.line_order)
          .map(l => ({ description: l.description, quantity: l.quantity, unit_amount: l.unit_amount })),
        payments: (entry.journal_payment_methods || [])
          .map(p => ({ method: p.method, amount: p.amount, reference: p.reference || '' })),
        status: entry.status,
        receipt_number: entry.receipt_number,
      }
    }
    return {
      id: null,
      entry_type:    'income',
      building:      buildingDefault,
      apt:           '',
      is_external:   false,
      payer_name:    '',
      payer_address: '',
      payer_email:   '',
      payer_phone:   '',
      entry_date:    today(),
      category_id:   null,
      notes:         '',
      lines:         [{ description: '', quantity: 1, unit_amount: '' }],
      payments:      [],
      status:        'draft',
      receipt_number: null,
    }
  })

  const [saving, setSaving]     = useState(false)
  const [issuing, setIssuing]   = useState(false)
  const [confirmIssue, setConfirmIssue] = useState(false)
  const [error, setError]       = useState('')

  // ----- derived -----
  const aptsForBuilding = useMemo(() =>
    apartments.filter(a => a.building === Number(form.building)).sort((a, b) => a.apt - b.apt),
    [apartments, form.building])

  const total = useMemo(() =>
    form.lines.reduce((s, l) => s + num(l.quantity) * num(l.unit_amount), 0),
    [form.lines])

  const paymentsTotal = useMemo(() =>
    form.payments.reduce((s, p) => s + num(p.amount), 0),
    [form.payments])

  const filteredCategories = categories.filter(c => c.type === form.entry_type)

  // ----- handlers -----
  const setField = (field, value) => setForm(f => ({ ...f, [field]: value }))

  function onAptChange(aptValue) {
    if (aptValue === 'external') {
      setForm(f => ({
        ...f,
        apt: 'external',
        is_external: true,
        payer_name: '',
        payer_address: '',
        payer_email: '',
        payer_phone: '',
      }))
      return
    }
    const aptNum = Number(aptValue)
    if (!aptNum) {
      setForm(f => ({ ...f, apt: '', is_external: false }))
      return
    }
    // auto-fill from residents
    const res = residents.filter(r => r.building === Number(form.building) && r.apt === aptNum)
    const owner = res.find(r => r.role === 'owner' && !r.is_company)
                 || res.find(r => r.role === 'owner')
                 || res.find(r => r.role === 'tenant')
                 || res[0]
    setForm(f => ({
      ...f,
      apt: String(aptNum),
      is_external: false,
      payer_name:    owner?.name  || '',
      payer_address: `שי עגנון ${f.building}, דירה ${aptNum}, קריית אונו`,
      payer_email:   owner?.email || '',
      payer_phone:   owner?.phone || '',
    }))
  }

  function updateLine(idx, field, value) {
    setForm(f => ({
      ...f,
      lines: f.lines.map((l, i) => i === idx ? { ...l, [field]: value } : l)
    }))
  }
  function addLine() {
    setForm(f => ({ ...f, lines: [...f.lines, { description: '', quantity: 1, unit_amount: '' }] }))
  }
  function removeLine(idx) {
    setForm(f => ({ ...f, lines: f.lines.length > 1 ? f.lines.filter((_, i) => i !== idx) : f.lines }))
  }

  function togglePayment(method) {
    setForm(f => {
      const existing = f.payments.find(p => p.method === method)
      if (existing) {
        return { ...f, payments: f.payments.filter(p => p.method !== method) }
      }
      // default new payment to remaining unpaid balance
      const alreadyAllocated = f.payments.reduce((s, p) => s + num(p.amount), 0)
      const remaining = total - alreadyAllocated
      const defaultAmount = remaining > 0 ? Number(remaining.toFixed(2)) : 0
      return { ...f, payments: [...f.payments, { method, amount: defaultAmount, reference: '' }] }
    })
  }
  function updatePayment(method, field, value) {
    setForm(f => ({
      ...f,
      payments: f.payments.map(p => p.method === method ? { ...p, [field]: value } : p)
    }))
  }

  // ----- validate -----
  function validate({ requirePayments }) {
    if (!form.building)   return 'יש לבחור בניין'
    if (!form.apt)        return 'יש לבחור דירה'
    if (!form.payer_name?.trim()) return 'יש להזין שם'
    if (!form.entry_date) return 'יש לבחור תאריך'
    if (form.lines.length === 0)  return 'יש להוסיף לפחות שורה אחת'
    for (const l of form.lines) {
      if (!l.description?.trim()) return 'יש להזין תיאור לכל שורה'
      if (num(l.unit_amount) <= 0) return 'יש להזין סכום חיובי בכל שורה'
    }
    if (total <= 0) return 'הסכום הכולל חייב להיות גדול מאפס'
    if (requirePayments) {
      if (form.payments.length === 0) return 'יש לבחור לפחות אופן תשלום אחד להפקת קבלה'
      if (Math.abs(paymentsTotal - total) > 0.01) {
        return `סכום אופני התשלום (${money(paymentsTotal)}) לא שווה לסך הקבלה (${money(total)})`
      }
    }
    return null
  }

  // ----- save -----
  async function save({ issue }) {
    const err = validate({ requirePayments: issue })
    if (err) { setError(err); return }
    setError('')
    if (issue) setIssuing(true); else setSaving(true)

    try {
      const headerData = {
        entry_type:    form.entry_type,
        building:      Number(form.building),
        year:          new Date(form.entry_date).getFullYear(),
        entry_date:    form.entry_date,
        apt:           form.is_external ? null : Number(form.apt),
        is_external:   form.is_external,
        payer_name:    form.payer_name.trim(),
        payer_address: form.payer_address?.trim() || null,
        payer_email:   form.payer_email?.trim() || null,
        payer_phone:   form.payer_phone?.trim() || null,
        category_id:   form.category_id || null,
        notes:         form.notes?.trim() || null,
        total_amount:  total,
      }

      let entryId = form.id

      if (isNew) {
        headerData.created_by = userEmail
        const { data, error } = await supabase.from('journal_entries').insert(headerData).select().single()
        if (error) throw error
        entryId = data.id
      } else {
        const { error } = await supabase.from('journal_entries').update(headerData).eq('id', entryId)
        if (error) throw error
      }

      // replace lines
      await supabase.from('journal_entry_lines').delete().eq('entry_id', entryId)
      const lineRows = form.lines.map((l, i) => ({
        entry_id: entryId,
        line_order: i,
        description: l.description.trim(),
        quantity: num(l.quantity),
        unit_amount: num(l.unit_amount),
      }))
      if (lineRows.length > 0) {
        const { error: lErr } = await supabase.from('journal_entry_lines').insert(lineRows)
        if (lErr) throw lErr
      }

      // replace payment methods
      await supabase.from('journal_payment_methods').delete().eq('entry_id', entryId)
      const pmRows = form.payments
        .filter(p => num(p.amount) > 0)
        .map(p => ({
          entry_id: entryId, method: p.method, amount: num(p.amount), reference: p.reference?.trim() || null,
        }))
      if (pmRows.length > 0) {
        const { error: pErr } = await supabase.from('journal_payment_methods').insert(pmRows)
        if (pErr) throw pErr
      }

      // issue: assign receipt number + lock + generate PDF
      if (issue) {
        const { data: numData, error: numErr } = await supabase.rpc('get_next_receipt_number', {
          p_building: Number(form.building),
          p_year:     new Date(form.entry_date).getFullYear(),
        })
        if (numErr) throw numErr

        const { error: issErr } = await supabase.from('journal_entries').update({
          status: 'issued',
          receipt_number: numData,
          receipt_issued_at: new Date().toISOString(),
        }).eq('id', entryId)
        if (issErr) throw issErr

        // Generate PDF and upload (best-effort — issue still succeeds if PDF fails)
        let pdfOk = false
        try {
          await generateAndStoreReceipt(entryId)
          pdfOk = true
        } catch (pdfErr) {
          console.error('PDF generation failed:', pdfErr)
          alert(
            `הקבלה הופקה (מס׳ ${numData}) ⚠️\n\n` +
            `אך יצירת ה-PDF נכשלה:\n${pdfErr.message || pdfErr}\n\n` +
            `ניתן ליצור את ה-PDF שוב מהרשימה (כפתור "📄 צור PDF").`
          )
        }

        // Send email automatically (only if PDF succeeded)
        if (pdfOk) {
          try {
            const { recipients } = await sendReceiptEmail(entryId)
            const recipientLines = recipients.map(r => `• ${r}`).join('\n')
            alert(
              `הקבלה הופקה ונשלחה בהצלחה!\n` +
              `מספר קבלה: ${numData}\n\n` +
              `📧 נמענים:\n${recipientLines}`
            )
          } catch (emailErr) {
            console.error('Email send failed:', emailErr)
            alert(
              `הקבלה הופקה בהצלחה!\n` +
              `מספר קבלה: ${numData}\n\n` +
              `⚠️ שליחת המייל נכשלה:\n${emailErr.message || emailErr}\n\n` +
              `ניתן לשלוח שוב מהרשימה (כפתור "📧 שלח").`
            )
          }
        }
      }

      onSaved()
    } catch (err) {
      console.error(err)
      setError(err.message || 'שגיאה בשמירה')
    } finally {
      setSaving(false)
      setIssuing(false)
      setConfirmIssue(false)
    }
  }

  // ----- render -----
  return (
    <div style={modalBackdrop} onClick={onClose}>
      <div style={modalBox} onClick={e => e.stopPropagation()}>
        <div style={modalHeader}>
          <h3 style={{ margin: 0, fontSize: 17 }}>
            {isLocked ? `קבלה ${form.receipt_number} (נעולה)` :
              isNew ? 'תנועת יומן חדשה' : 'עריכת תנועה'}
          </h3>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        <div style={modalBody}>
          {isLocked && (
            <div className="info-block amber" style={{ marginBottom: 12 }}>
              ⚠️ קבלה זו הופקה ולא ניתן לערוך אותה. ניתן לבטלה ולהפיק חדשה במקומה.
            </div>
          )}

          {/* Type + building + apt + date row */}
          <div style={row}>
            <Field label="סוג תנועה" required>
              <select value={form.entry_type}
                onChange={e => setField('entry_type', e.target.value)}
                disabled={isLocked} style={inp}>
                <option value="income">הכנסה</option>
                <option value="expense">הוצאה</option>
              </select>
            </Field>

            <Field label="בניין" required>
              <select value={form.building}
                onChange={e => { setField('building', Number(e.target.value)); setField('apt', '') }}
                disabled={isLocked} style={inp}>
                <option value={12}>עגנון 12</option>
                <option value={14}>עגנון 14</option>
              </select>
            </Field>

            <Field label="דירה" required>
              <select value={form.apt} onChange={e => onAptChange(e.target.value)}
                disabled={isLocked} style={inp}>
                <option value="">— בחר דירה —</option>
                <option value="external">🌐 גורם חיצוני</option>
                {aptsForBuilding.map(a => (
                  <option key={a.apt} value={a.apt}>דירה {a.apt}</option>
                ))}
              </select>
            </Field>

            <Field label="תאריך" required>
              <input type="date" value={form.entry_date}
                onChange={e => setField('entry_date', e.target.value)}
                disabled={isLocked} style={inp} />
            </Field>
          </div>

          {/* Payer details */}
          <div style={row}>
            <Field label={form.entry_type === 'expense' ? 'שם הספק' : 'שם המשלם'} required wide>
              <input value={form.payer_name}
                onChange={e => setField('payer_name', e.target.value)}
                disabled={isLocked} style={inp} placeholder="שם מלא" />
            </Field>
            <Field label="מייל">
              <input type="email" value={form.payer_email}
                onChange={e => setField('payer_email', e.target.value)}
                disabled={isLocked} style={inp} placeholder="email@example.com" dir="ltr" />
            </Field>
            <Field label="טלפון">
              <input value={form.payer_phone}
                onChange={e => setField('payer_phone', e.target.value)}
                disabled={isLocked} style={inp} placeholder="050-..." dir="ltr" />
            </Field>
          </div>

          <Field label="כתובת" wide>
            <input value={form.payer_address}
              onChange={e => setField('payer_address', e.target.value)}
              disabled={isLocked} style={inp} />
          </Field>

          {/* Category */}
          <Field label="קטגוריה">
            <select value={form.category_id || ''}
              onChange={e => setField('category_id', e.target.value ? Number(e.target.value) : null)}
              disabled={isLocked} style={inp}>
              <option value="">— ללא —</option>
              {filteredCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          {/* Lines */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: 'var(--muted)' }}>שורות</div>
            <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f7f5f1' }}>
                    <th style={{ ...th, width: '50%' }}>תיאור</th>
                    <th style={{ ...th, width: '15%' }}>כמות</th>
                    <th style={{ ...th, width: '20%' }}>מחיר ליחידה</th>
                    <th style={{ ...th, width: '15%' }}>סכום</th>
                    {!isLocked && <th style={{ ...th, width: 40 }}></th>}
                  </tr>
                </thead>
                <tbody>
                  {form.lines.map((l, i) => (
                    <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={lineTd}>
                        <input value={l.description}
                          onChange={e => updateLine(i, 'description', e.target.value)}
                          disabled={isLocked} style={lineInp} placeholder="תיאור" />
                      </td>
                      <td style={lineTd}>
                        <input type="number" step="0.01" value={l.quantity}
                          onChange={e => updateLine(i, 'quantity', e.target.value)}
                          disabled={isLocked} style={lineInp} />
                      </td>
                      <td style={lineTd}>
                        <input type="number" step="0.01" value={l.unit_amount}
                          onChange={e => updateLine(i, 'unit_amount', e.target.value)}
                          disabled={isLocked} style={lineInp} placeholder="0" />
                      </td>
                      <td style={{ ...lineTd, textAlign: 'left', fontWeight: 600 }}>
                        {money(num(l.quantity) * num(l.unit_amount))}
                      </td>
                      {!isLocked && (
                        <td style={lineTd}>
                          <button onClick={() => removeLine(i)}
                            style={{ ...miniBtn('#9a3a3a'), padding: '3px 6px' }}>✕</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#f3f5f9', borderTop: '2px solid var(--border)' }}>
                    <td colSpan={3} style={{ ...lineTd, textAlign: 'left', fontWeight: 700 }}>סה"כ</td>
                    <td style={{ ...lineTd, textAlign: 'left', fontWeight: 700, fontSize: 15, color: '#1B3A5C' }}>{money(total)}</td>
                    {!isLocked && <td style={lineTd}></td>}
                  </tr>
                </tfoot>
              </table>
            </div>
            {!isLocked && (
              <button onClick={addLine}
                style={{ marginTop: 6, padding: '6px 12px', borderRadius: 8, border: '1.5px dashed var(--border)',
                  background: '#fafaf8', cursor: 'pointer', fontSize: 12, fontFamily: 'Heebo, sans-serif' }}>
                + הוסף שורה
              </button>
            )}
          </div>

          {/* Payment methods */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: 'var(--muted)' }}>אופני תשלום</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
              {PAYMENT_METHODS.map(pm => {
                const checked = form.payments.some(p => p.method === pm.id)
                const payment = form.payments.find(p => p.method === pm.id)
                return (
                  <div key={pm.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 8, background: checked ? '#f0fbf4' : '#fafaf8' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: isLocked ? 'default' : 'pointer', fontSize: 13 }}>
                      <input type="checkbox" checked={checked}
                        onChange={() => togglePayment(pm.id)} disabled={isLocked} />
                      <span style={{ fontWeight: 600 }}>{pm.label}</span>
                    </label>
                    {checked && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                        <input type="number" step="0.01" placeholder="סכום"
                          value={payment.amount}
                          onChange={e => updatePayment(pm.id, 'amount', e.target.value)}
                          disabled={isLocked}
                          style={{ ...lineInp, flex: 1 }} />
                        <input placeholder="אסמכתא" value={payment.reference}
                          onChange={e => updatePayment(pm.id, 'reference', e.target.value)}
                          disabled={isLocked}
                          style={{ ...lineInp, flex: 1 }} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            {form.payments.length > 0 && (
              <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 6,
                background: Math.abs(paymentsTotal - total) < 0.01 ? '#e9f7ee' : '#fdf6e0',
                fontSize: 12, fontWeight: 600,
                color: Math.abs(paymentsTotal - total) < 0.01 ? '#1a7a3a' : '#a06b00' }}>
                סך אופני התשלום: {money(paymentsTotal)}
                {Math.abs(paymentsTotal - total) >= 0.01 && (
                  <> &mdash; הפרש מסכום הקבלה: {money(total - paymentsTotal)}</>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <Field label="הערות">
            <textarea value={form.notes}
              onChange={e => setField('notes', e.target.value)}
              disabled={isLocked} rows={2}
              style={{ ...inp, resize: 'vertical', fontFamily: 'Heebo, sans-serif' }} />
          </Field>

          {error && (
            <div className="info-block" style={{ background: '#fbecec', color: '#9a3a3a', marginTop: 12 }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLocked && (
          <div style={modalFooter}>
            <button onClick={onClose}
              style={{ ...footerBtn, background: '#f7f5f1', color: 'var(--muted)' }}>
              ביטול
            </button>
            <button onClick={() => save({ issue: false })} disabled={saving || issuing}
              style={{ ...footerBtn, background: '#fff', border: '1.5px solid var(--border)', color: '#1B3A5C' }}>
              {saving ? 'שומר...' : 'שמור כטיוטה'}
            </button>
            <button onClick={() => setConfirmIssue(true)} disabled={saving || issuing}
              style={{ ...footerBtn, background: '#1a7a3a', color: '#fff' }}>
              {issuing ? 'מפיק...' : 'שמור והפק קבלה'}
            </button>
          </div>
        )}

        {/* Confirm issue dialog */}
        {confirmIssue && (
          <div style={modalBackdrop} onClick={() => setConfirmIssue(false)}>
            <div style={{ ...modalBox, maxWidth: 460 }} onClick={e => e.stopPropagation()}>
              <div style={modalHeader}>
                <h3 style={{ margin: 0, fontSize: 16 }}>אישור הפקת קבלה</h3>
                <button onClick={() => setConfirmIssue(false)} style={closeBtn}>✕</button>
              </div>
              <div style={modalBody}>
                <p style={{ margin: '0 0 10px 0' }}>
                  האם להוציא קבלה לבניין <strong>שי עגנון {form.building}</strong> על סך <strong>{money(total)}</strong>?
                </p>
                <div className="info-block amber" style={{ fontSize: 13 }}>
                  ⚠️ <strong>שים לב:</strong> לאחר הפקת הקבלה לא ניתן יהיה לערוך אותה.
                  לתיקון יהיה צורך לבטל ולהפיק חדשה.
                </div>
              </div>
              <div style={modalFooter}>
                <button onClick={() => setConfirmIssue(false)}
                  style={{ ...footerBtn, background: '#f7f5f1', color: 'var(--muted)' }}>
                  חזרה
                </button>
                <button onClick={() => save({ issue: true })} disabled={issuing}
                  style={{ ...footerBtn, background: '#1a7a3a', color: '#fff' }}>
                  {issuing ? 'מפיק...' : 'אישור והפקת קבלה'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ====================================================================
// CANCEL MODAL
// ====================================================================
function CancelModal({ entry, userEmail, onClose, onCancelled }) {
  const [reason, setReason] = useState('')
  const [busy, setBusy]     = useState(false)
  const [err, setErr]       = useState('')

  async function doCancel() {
    if (!reason.trim()) { setErr('יש להזין סיבה לביטול'); return }
    setBusy(true); setErr('')
    try {
      const { error } = await supabase.from('journal_entries').update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: userEmail,
        cancellation_reason: reason.trim(),
      }).eq('id', entry.id)
      if (error) throw error
      onCancelled()
    } catch (e) {
      setErr(e.message || 'שגיאה בביטול')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={modalBackdrop} onClick={onClose}>
      <div style={{ ...modalBox, maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <div style={modalHeader}>
          <h3 style={{ margin: 0, fontSize: 16 }}>ביטול תנועה</h3>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>
        <div style={modalBody}>
          <p style={{ margin: '0 0 10px 0', fontSize: 14 }}>
            ביטול תנועה {entry.receipt_number ? `מספר ${entry.receipt_number}` : 'טיוטה'} —
            {' '}<strong>{entry.payer_name}</strong> — <strong>{money(entry.total_amount)}</strong>
          </p>
          <Field label="סיבת הביטול" required>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
              style={{ ...inp, resize: 'vertical', fontFamily: 'Heebo, sans-serif' }}
              placeholder="לדוגמה: שגיאה בסכום, ביטול עסקה, וכו'" />
          </Field>
          {err && <div className="info-block" style={{ background: '#fbecec', color: '#9a3a3a', marginTop: 8 }}>{err}</div>}
        </div>
        <div style={modalFooter}>
          <button onClick={onClose}
            style={{ ...footerBtn, background: '#f7f5f1', color: 'var(--muted)' }}>חזרה</button>
          <button onClick={doCancel} disabled={busy}
            style={{ ...footerBtn, background: '#9a3a3a', color: '#fff' }}>
            {busy ? 'מבטל...' : 'בטל תנועה'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ====================================================================
// SHARED FIELD COMPONENT
// ====================================================================
function Field({ label, required, wide, children }) {
  return (
    <div style={{ flex: wide ? '2 1 220px' : '1 1 160px', minWidth: 140 }}>
      <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 4, fontWeight: 500 }}>
        {label}{required && <span style={{ color: '#9a3a3a' }}> *</span>}
      </label>
      {children}
    </div>
  )
}

// ====================================================================
// STYLES
// ====================================================================
const th = { padding: '10px 8px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: 'var(--muted)' }
const td = { padding: '8px', textAlign: 'right', fontSize: 13 }
const lineTd = { padding: '4px', textAlign: 'right' }
const lineInp = {
  width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)',
  fontSize: 13, fontFamily: 'Heebo, sans-serif', background: '#fff', outline: 'none',
}
const inp = {
  width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)',
  fontSize: 13, fontFamily: 'Heebo, sans-serif', background: '#fafaf8', outline: 'none',
  boxSizing: 'border-box',
}
const selStyle = {
  padding: '9px 12px', borderRadius: 10, border: '1.5px solid var(--border)',
  fontSize: 13, fontFamily: 'Heebo, sans-serif', background: '#fafaf8', cursor: 'pointer', outline: 'none',
}
const row = { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }
const miniBtn = (color) => ({
  padding: '4px 10px', borderRadius: 6, border: `1.5px solid ${color}`,
  background: '#fff', color, fontSize: 11, cursor: 'pointer', fontFamily: 'Heebo, sans-serif', fontWeight: 600,
})

const modalBackdrop = {
  position: 'fixed', inset: 0, background: 'rgba(20,20,30,0.55)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 1000,
}
const modalBox = {
  background: '#fff', borderRadius: 14, maxWidth: 880, width: '100%', maxHeight: '92vh',
  display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'Heebo, sans-serif',
}
const modalHeader = {
  padding: '14px 18px', borderBottom: '1.5px solid var(--border)',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  background: '#f7f5f1', flexShrink: 0,
}
const modalBody = { padding: 18, overflowY: 'auto', flex: 1 }
const modalFooter = {
  padding: '12px 18px', borderTop: '1.5px solid var(--border)',
  display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap',
  background: '#fafaf8', flexShrink: 0,
}
const footerBtn = {
  padding: '9px 18px', borderRadius: 10, border: 'none',
  fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
}
const closeBtn = {
  background: 'none', border: 'none', fontSize: 18, cursor: 'pointer',
  color: 'var(--muted)', padding: 4, lineHeight: 1,
}
