import { supabase } from './supabase'

// ====================================================================
// receiptEmail.js — שליחת קבלות במייל
// ====================================================================
// תלוי ב-Edge Function send-email הקיים (Resend, JWT=ON)
// ====================================================================

// כתובות נוספות לקבלת עותק של הקבלה (בנוסף למשלם, אם הוזן)
const RECEIPT_COPY_RECIPIENTS = ['erez@barons.co.il']

// ----- Build long-lived signed URL (10 years) for the PDF -----
async function getLongLivedPdfUrl(receiptPath) {
  const TEN_YEARS = 60 * 60 * 24 * 365 * 10  // ~315M seconds
  const { data, error } = await supabase.storage
    .from('receipts')
    .createSignedUrl(receiptPath, TEN_YEARS)
  if (error) throw error
  return data.signedUrl
}

// ----- Build the HTML body of the email -----
function buildEmailHtml({ entry, pdfUrl }) {
  const buildingName = `ועד הבית שי עגנון ${entry.building}`
  const dateStr = new Date(entry.entry_date).toLocaleDateString('he-IL')
  const amount = Number(entry.total_amount).toLocaleString('he-IL', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  })

  return `
    <div dir="rtl" style="font-family: 'Heebo', 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
      <div style="background: #1B3A5C; color: white; padding: 22px 20px; border-radius: 12px 12px 0 0; text-align: center;">
        <h2 style="margin: 0; font-size: 22px; font-weight: 700;">${buildingName}</h2>
        <div style="font-size: 14px; margin-top: 4px; opacity: 0.85;">קריית אונו</div>
      </div>

      <div style="background: white; padding: 30px 24px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; margin: 0 0 14px 0;">
          שלום ${entry.payer_name},
        </p>

        <p style="font-size: 14px; line-height: 1.7; margin: 0 0 22px 0; color: #444;">
          מצורפת קבלה רשמית עבור התשלום שהתקבל.
        </p>

        <table style="width: 100%; border-collapse: collapse; margin: 0 0 24px 0; font-size: 14px;">
          <tr>
            <td style="padding: 10px 12px; background: #f7f5f1; font-weight: 600; width: 130px; border-radius: 6px 0 0 6px;">מספר קבלה</td>
            <td style="padding: 10px 12px; background: #f7f5f1; font-family: monospace; font-weight: 600;">${entry.receipt_number}</td>
          </tr>
          <tr><td colspan="2" style="height: 4px;"></td></tr>
          <tr>
            <td style="padding: 10px 12px; background: #f7f5f1; font-weight: 600; border-radius: 6px 0 0 6px;">תאריך</td>
            <td style="padding: 10px 12px; background: #f7f5f1;">${dateStr}</td>
          </tr>
          <tr><td colspan="2" style="height: 4px;"></td></tr>
          <tr>
            <td style="padding: 10px 12px; background: #f3f5f9; font-weight: 600; border-radius: 6px 0 0 6px;">סכום</td>
            <td style="padding: 10px 12px; background: #f3f5f9; font-weight: 700; color: #1B3A5C; font-size: 16px;">₪${amount}</td>
          </tr>
        </table>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${pdfUrl}"
             style="display: inline-block; background: #1B3A5C; color: white; text-decoration: none; padding: 13px 30px; border-radius: 8px; font-weight: 600; font-size: 15px;">
            📄 לצפייה והורדת הקבלה
          </a>
        </div>

        <p style="font-size: 12px; color: #888; line-height: 1.7; margin-top: 28px; padding-top: 16px; border-top: 1px solid #eee; text-align: center;">
          זוהי הודעה ממוחשבת — אין צורך להשיב.<br>
          לכל שאלה ניתן לפנות לוועד הבית.
        </p>
      </div>
    </div>
  `
}

// ----- Resolve recipients -----
// returns { all, payer, copies } where:
//   all    = full unique list of recipients
//   payer  = payer email if provided
//   copies = list of vaad/copy emails
function resolveRecipients(entry) {
  const payer = entry.payer_email?.trim() || null
  const copies = [...RECEIPT_COPY_RECIPIENTS]
  const all = [...new Set([payer, ...copies].filter(Boolean))]
  return { all, payer, copies }
}

// ----- Main: send receipt email -----
export async function sendReceiptEmail(entryId) {
  // 1. Fetch the entry fresh
  const { data: entry, error: fetchErr } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('id', entryId)
    .single()
  if (fetchErr) throw fetchErr

  if (!entry.receipt_number) throw new Error('הקבלה טרם הופקה')
  if (!entry.receipt_url)    throw new Error('PDF לא נמצא — צור קודם PDF')

  // 2. Resolve recipients
  const { all: recipients, payer } = resolveRecipients(entry)
  if (recipients.length === 0) throw new Error('אין נמענים זמינים לשליחה')

  // 3. Generate long-lived signed URL for the PDF
  const pdfUrl = await getLongLivedPdfUrl(entry.receipt_url)

  // 4. Build email HTML
  const html = buildEmailHtml({ entry, pdfUrl })
  const subject = `קבלה מס׳ ${entry.receipt_number} — ועד הבית שי עגנון ${entry.building}`

  // 5. Call the existing send-email Edge Function
  // Read URL and key directly from the supabase client (avoids env-var name mismatches)
  const supabaseUrl = supabase.supabaseUrl
  const supabaseKey = supabase.supabaseKey

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase client not initialized properly (missing URL or key)')
  }

  const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ to: recipients, subject, html }),
  })

  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const text = await res.text()
      if (text) detail = `${detail} — ${text}`
    } catch {}
    console.error('send-email failed:', { status: res.status, recipients, url: `${supabaseUrl}/functions/v1/send-email` })
    throw new Error(`שליחת מייל נכשלה: ${detail}`)
  }

  let fnData = null
  try { fnData = await res.json() } catch {}
  console.log('send-email response:', fnData)

  // 6. Update receipt_sent_to in DB
  const { error: updErr } = await supabase
    .from('journal_entries')
    .update({ receipt_sent_to: recipients })
    .eq('id', entryId)
  if (updErr) console.warn('Failed to update receipt_sent_to:', updErr)

  return { recipients, payer, sentAt: new Date().toISOString() }
}
