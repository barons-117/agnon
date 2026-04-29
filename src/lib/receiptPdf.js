import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { supabase } from './supabase'

const BASE = import.meta.env.BASE_URL

// ====================================================================
// HELPERS
// ====================================================================
const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]))

const fmtMoney = (n) => Number(n || 0).toLocaleString('he-IL', {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
})

const fmtDate = (iso) => new Date(iso).toLocaleDateString('he-IL')

const PAYMENT_LABELS = {
  cash: 'מזומן',
  app: 'אפליקציה',
  bank_transfer: 'העברה בנקאית',
  check: 'המחאה',
  other: 'אחר',
}

// ====================================================================
// HTML TEMPLATE (rendered to canvas → PDF)
// ====================================================================
function buildReceiptHtml({ entry, lines, payments }) {
  const buildingName = `ועד הבית שי עגנון ${entry.building}`

  const linesHtml = lines.map(l => {
    const lineTotal = Number(l.quantity) * Number(l.unit_amount)
    const showBreakdown = Number(l.quantity) !== 1
    return `
      <tr>
        <td style="padding:11px 14px; border-bottom:1px solid #d5d5d0;">
          ${escapeHtml(l.description)}
          ${showBreakdown ? `<span style="color:#777; font-size:11pt; margin-right:6px;">(${l.quantity} × ₪${fmtMoney(l.unit_amount)})</span>` : ''}
        </td>
        <td style="padding:11px 14px; border-bottom:1px solid #d5d5d0; text-align:left; white-space:nowrap; font-weight:600;">
          ₪${fmtMoney(lineTotal)}
        </td>
      </tr>
    `
  }).join('')

  const paymentsHtml = payments.map(p => `
    <tr>
      <td style="padding:9px 14px; border-bottom:1px solid #d5d5d0;">
        ${PAYMENT_LABELS[p.method] || p.method}
        ${p.reference ? `<span style="color:#777; font-size:11pt; margin-right:6px;">(אסמכתא: ${escapeHtml(p.reference)})</span>` : ''}
      </td>
      <td style="padding:9px 14px; border-bottom:1px solid #d5d5d0; text-align:left; white-space:nowrap; font-weight:600;">
        ₪${fmtMoney(p.amount)}
      </td>
    </tr>
  `).join('')

  const paymentsTotal = payments.reduce((s, p) => s + Number(p.amount || 0), 0)

  return `
    <div dir="rtl" lang="he" style="
      width: 794px;
      padding: 50px 60px;
      box-sizing: border-box;
      font-family: 'Heebo', 'Arial', sans-serif;
      font-size: 13pt;
      color: #1a1a1a;
      background: white;
      line-height: 1.5;
    ">

      <!-- Header: logo + name -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <img src="${BASE}logo-building.png"
             style="width: 90px; height: 90px; object-fit: contain;"
             crossorigin="anonymous" />
        <div style="text-align: left;">
          <div style="font-size: 22pt; font-weight: 700; color: #1B3A5C; line-height: 1.2;">
            ${buildingName}
          </div>
          <div style="font-size: 13pt; color: #666; margin-top: 4px;">קריית אונו</div>
        </div>
      </div>

      <hr style="border: none; border-top: 2.5px solid #1B3A5C; margin: 18px 0 24px 0;" />

      <!-- Receipt title + number + מקור stamp -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px;">
        <div>
          <div style="font-size: 28pt; font-weight: 700; color: #1B3A5C; line-height: 1;">
            קבלה
          </div>
          <div style="font-size: 14pt; color: #444; margin-top: 8px;">
            מס׳ <span style="font-weight: 700; letter-spacing: 1px;">${entry.receipt_number}</span>
          </div>
        </div>
        <div style="
          border: 2.5px solid #1B3A5C; padding: 8px 22px;
          font-size: 16pt; font-weight: 700; color: #1B3A5C;
          letter-spacing: 4px;
          margin-top: 6px;
        ">מקור</div>
      </div>

      <!-- Recipient details -->
      <table style="width: 100%; margin-bottom: 24px; font-size: 13pt; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; width: 80px; font-weight: 700; vertical-align: top;">לכבוד:</td>
          <td style="padding: 8px 0; border-bottom: 1.5px solid #aaa;">${escapeHtml(entry.payer_name)}</td>
        </tr>
        ${entry.payer_address ? `
        <tr>
          <td style="padding: 8px 0; font-weight: 700; vertical-align: top;">כתובת:</td>
          <td style="padding: 8px 0; border-bottom: 1.5px solid #aaa;">${escapeHtml(entry.payer_address)}</td>
        </tr>
        ` : ''}
        ${(!entry.is_external && entry.apt) ? `
        <tr>
          <td style="padding: 8px 0; font-weight: 700; vertical-align: top;">דירה:</td>
          <td style="padding: 8px 0; border-bottom: 1.5px solid #aaa;">${entry.apt}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; font-weight: 700; vertical-align: top;">תאריך:</td>
          <td style="padding: 8px 0; border-bottom: 1.5px solid #aaa;">${fmtDate(entry.entry_date)}</td>
        </tr>
      </table>

      <!-- Items table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13pt;">
        <thead>
          <tr style="background: #1B3A5C; color: white;">
            <th style="padding: 11px 14px; text-align: right; font-weight: 700;">עבור</th>
            <th style="padding: 11px 14px; text-align: left; width: 140px; font-weight: 700;">סכום</th>
          </tr>
        </thead>
        <tbody>${linesHtml}</tbody>
        <tfoot>
          <tr style="background: #f3f5f9;">
            <td style="padding: 13px 14px; text-align: left; font-weight: 700; font-size: 14pt;">סה"כ:</td>
            <td style="padding: 13px 14px; text-align: left; font-weight: 700; font-size: 15pt; color: #1B3A5C; white-space: nowrap;">
              ₪${fmtMoney(entry.total_amount)}
            </td>
          </tr>
        </tfoot>
      </table>

      ${payments.length > 0 ? `
      <!-- Payment methods -->
      <div style="font-size: 13pt; font-weight: 700; margin-bottom: 8px; color: #1B3A5C;">
        התקבל באמצעי תשלום:
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13pt; border: 1px solid #d5d5d0;">
        <tbody>${paymentsHtml}</tbody>
        <tfoot>
          <tr style="background: #f3f5f9;">
            <td style="padding: 11px 14px; text-align: left; font-weight: 700;">התקבל סה"כ:</td>
            <td style="padding: 11px 14px; text-align: left; font-weight: 700; color: #1B3A5C; white-space: nowrap;">
              ₪${fmtMoney(paymentsTotal)}
            </td>
          </tr>
        </tfoot>
      </table>
      ` : ''}

      ${entry.notes ? `
      <div style="
        background: #f7f5f1; border-right: 4px solid #1B3A5C;
        padding: 11px 14px; margin-bottom: 24px; font-size: 12pt;
      ">
        <span style="font-weight: 700;">הערות:</span> ${escapeHtml(entry.notes)}
      </div>
      ` : ''}

      <!-- Footer / signature -->
      <div style="margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; gap: 40px;">
        <div style="flex: 1; text-align: center;">
          <div style="height: 90px; display: flex; align-items: center; justify-content: center;">
            <img src="${BASE}signature.png"
                 style="max-height: 90px; max-width: 220px; object-fit: contain;"
                 crossorigin="anonymous" />
          </div>
          <div style="border-top: 1.5px solid #1a1a1a; padding-top: 6px; font-size: 12pt; color: #666;">
            חתימה דיגיטלית
          </div>
        </div>
        <div style="flex: 1; text-align: center;">
          <div style="height: 90px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 8px; font-size: 14pt; font-weight: 600;">
            ${fmtDate(entry.entry_date)}
          </div>
          <div style="border-top: 1.5px solid #1a1a1a; padding-top: 6px; font-size: 12pt; color: #666;">
            תאריך
          </div>
        </div>
      </div>

    </div>
  `
}

// ====================================================================
// PDF GENERATION
// ====================================================================
export async function generateReceiptPdf({ entry, lines, payments }) {
  const html = buildReceiptHtml({ entry, lines, payments })

  // Create offscreen container
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-99999px'
  container.style.top = '0'
  container.style.zIndex = '-1'
  container.innerHTML = html
  document.body.appendChild(container)

  try {
    const element = container.firstElementChild

    // Wait for fonts to load
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready
    }

    // Wait for images to load
    const images = element.querySelectorAll('img')
    await Promise.all(Array.from(images).map(img => {
      if (img.complete && img.naturalHeight > 0) return Promise.resolve()
      return new Promise(resolve => {
        img.onload = resolve
        img.onerror = () => {
          console.warn('Receipt logo failed to load:', img.src)
          resolve()
        }
        // safety timeout
        setTimeout(resolve, 3000)
      })
    }))

    // Render to canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    })

    // Build PDF
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    const imgData = canvas.toDataURL('image/jpeg', 0.92)
    const imgWidth = pageWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    if (imgHeight <= pageHeight) {
      // Single page
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight)
    } else {
      // Multi-page (overflow)
      let y = 0
      let pageNum = 0
      while (y < imgHeight - 0.1) {
        if (pageNum > 0) pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, -y, imgWidth, imgHeight)
        y += pageHeight
        pageNum++
      }
    }

    return pdf.output('blob')
  } finally {
    document.body.removeChild(container)
  }
}

// ====================================================================
// STORAGE OPS
// ====================================================================
export function buildReceiptPath(building, receiptNumber) {
  return `${building}/${receiptNumber}.pdf`
}

export async function uploadReceiptPdf(building, receiptNumber, blob) {
  const path = buildReceiptPath(building, receiptNumber)
  const { error } = await supabase.storage
    .from('receipts')
    .upload(path, blob, {
      contentType: 'application/pdf',
      upsert: true,
      cacheControl: '3600',
    })
  if (error) throw error
  return path
}

export async function getReceiptViewUrl(path, expiresInSec = 300) {
  const { data, error } = await supabase.storage
    .from('receipts')
    .createSignedUrl(path, expiresInSec)
  if (error) throw error
  return data.signedUrl
}

// Convenience: full flow — generate, upload, and update DB
export async function generateAndStoreReceipt(entryId) {
  // Re-fetch the entry with all related data
  const { data: entry, error: fetchErr } = await supabase
    .from('journal_entries')
    .select('*, journal_entry_lines(*), journal_payment_methods(*)')
    .eq('id', entryId)
    .single()
  if (fetchErr) throw fetchErr
  if (!entry.receipt_number) throw new Error('הקבלה טרם הופקה — אין מספר קבלה')

  const lines = (entry.journal_entry_lines || []).sort((a, b) => a.line_order - b.line_order)
  const payments = entry.journal_payment_methods || []

  const blob = await generateReceiptPdf({ entry, lines, payments })
  const path = await uploadReceiptPdf(entry.building, entry.receipt_number, blob)

  const { error: updErr } = await supabase
    .from('journal_entries')
    .update({ receipt_url: path })
    .eq('id', entryId)
  if (updErr) throw updErr

  return path
}
