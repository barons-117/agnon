// src/lib/email.js — שליחת מיילים דרך Supabase Edge Function + Resend

const EDGE_URL = 'https://cwewsfuswiiliritikvh.supabase.co/functions/v1/send-email'
const ANON_KEY = 'sb_publishable_qIHIRr47iAqiYoTn9aQIuQ_qteCIHk0' // ← להחליף עם המפתח האמיתי מ-Supabase

async function sendEmail(to, subject, html) {
  if (!to) return
  const r = await fetch(EDGE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`, // ← זה מה שחסר!
    },
    body: JSON.stringify({ to, subject, html }),
  })
  if (!r.ok) console.warn('email error', await r.text())
}

// ── תבניות ──────────────────────────────────────────────────

function baseTemplate(content) {
  return `
    <div dir="rtl" style="font-family:'Heebo',Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
      <div style="background:linear-gradient(135deg,#1B3A5C,#2563EB);padding:24px 32px">
        <div style="color:white;font-size:20px;font-weight:800">🏢 שי עגנון 12 ו-14</div>
        <div style="color:rgba(255,255,255,0.7);font-size:13px;margin-top:4px">קריית אונו</div>
      </div>
      <div style="padding:28px 32px">
        ${content}
      </div>
      <div style="background:#f8fafc;padding:16px 32px;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0">
        מייל זה נשלח אוטומטית ממערכת ועד בית שי עגנון. לפרטים נוספים פנו לחברת הניהול HIGH TOWER · 03-6440424
      </div>
    </div>
  `
}

// מייל לחברת הניהול על פנייה חדשה
export function sendNewRequestEmail(req) {
  return sendEmail(
    ['erez@barons.co.il', 'Onone.finance@hightower.co.il', 'onone.mgr@hightower.co.il'],
    `פנייה חדשה #${req.id} — בניין ${req.building} דירה ${req.apartment}`,
    baseTemplate(`
      <h2 style="color:#1B3A5C;margin:0 0 20px">📝 פנייה חדשה התקבלה</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:8px 0;color:#64748b;width:120px">שם:</td><td style="font-weight:700">${req.name}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">טלפון:</td><td>${req.phone}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">מייל:</td><td>${req.email || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">בניין:</td><td>${req.building}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">דירה:</td><td>${req.apartment}</td></tr>
      </table>
      <div style="background:#f1f5f9;border-radius:8px;padding:16px;margin-top:16px;font-size:14px;line-height:1.7;white-space:pre-line">${req.content}</div>
      <div style="margin-top:16px;font-size:12px;color:#94a3b8">נשלח: ${new Date().toLocaleDateString('he-IL')} ${new Date().toLocaleTimeString('he-IL',{hour:'2-digit',minute:'2-digit'})}</div>
    `)
  )
}

// מייל לדייר — פנייה בטיפול
export function sendInProgressEmail(req) {
  if (!req.email) return Promise.resolve()
  return sendEmail(
    req.email,
    `פנייתך בטיפול — שי עגנון ${req.building}`,
    baseTemplate(`
      <h2 style="color:#1B3A5C;margin:0 0 16px">🔄 פנייתך עברה לטיפול</h2>
      <p style="color:#475569;line-height:1.8;margin:0 0 16px">שלום <strong>${req.name}</strong>,</p>
      <p style="color:#475569;line-height:1.8;margin:0 0 16px">
        פנייתך מספר <strong>${req.id}</strong> התקבלה ועברה לטיפול חברת הניהול <strong>HIGH TOWER</strong>.
      </p>
      <div style="background:#f1f5f9;border-radius:8px;padding:16px;font-size:14px;line-height:1.7;color:#475569;white-space:pre-line;margin-bottom:16px">${req.content}</div>
      <p style="color:#475569;line-height:1.8;margin:0">
        נשלח לך עדכון נוסף עם סיום הטיפול. אם נדרש מידע נוסף, ניצור איתך קשר בפרטים שהשארת.<br/>
        <strong>תודה!</strong>
      </p>
    `)
  )
}

// מייל לדייר — פנייה טופלה
export function sendDoneEmail(req, resolution) {
  if (!req.email) return Promise.resolve()
  const resolutionBlock = resolution ? `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0">
      <div style="font-weight:700;color:#166534;margin-bottom:8px">✅ סיכום הטיפול:</div>
      <div style="color:#166534;line-height:1.7;white-space:pre-line">${resolution}</div>
    </div>` : ''
  return sendEmail(
    req.email,
    `פנייתך טופלה — שי עגנון ${req.building}`,
    baseTemplate(`
      <h2 style="color:#1B3A5C;margin:0 0 16px">✅ פנייתך טופלה</h2>
      <p style="color:#475569;line-height:1.8;margin:0 0 16px">שלום <strong>${req.name}</strong>,</p>
      <p style="color:#475569;line-height:1.8;margin:0 0 16px">
        פנייתך מספר <strong>${req.id}</strong> טופלה על ידי חברת הניהול <strong>HIGH TOWER</strong>.
      </p>
      <div style="background:#f1f5f9;border-radius:8px;padding:16px;font-size:14px;line-height:1.7;color:#475569;white-space:pre-line">${req.content}</div>
      ${resolutionBlock}
      <p style="color:#475569;line-height:1.8;margin:16px 0 0"><strong>תודה על פנייתך!</strong></p>
    `)
  )
}
