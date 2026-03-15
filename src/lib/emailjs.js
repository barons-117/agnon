// src/lib/emailjs.js
import emailjs from '@emailjs/browser'

export const EMAIL_SERVICE  = 'service_52pryva'
export const TEMPLATE_NEW   = 'template_1i4eu5b'   // פנייה חדשה → לחברת הניהול
export const TEMPLATE_MAIN  = 'template_jwuc1xs'   // מייל כללי לדייר (בטיפול + טופל)
export const EMAIL_PUBLIC   = '6wNMo9kxmNqk9FQGl'

emailjs.init(EMAIL_PUBLIC)

export function sendNewRequestEmail(request) {
  const now = new Date()
  return emailjs.send(EMAIL_SERVICE, TEMPLATE_NEW, {
    request_id: request.id,
    name:       request.name,
    phone:      request.phone,
    email:      request.email || 'לא הוזן',
    building:   request.building,
    apartment:  request.apartment,
    content:    request.content,
    date:       now.toLocaleDateString('he-IL') + ' ' + now.toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'}),
  })
}

export function sendInProgressEmail(request) {
  if (!request.email) return Promise.resolve()
  return emailjs.send(EMAIL_SERVICE, TEMPLATE_MAIN, {
    name:    request.name,
    email:   request.email,
    subject: `פנייתך בטיפול — שי עגנון ${request.building}`,
    body:
`פנייתך (מספר ${request.id}) התקבלה ועברה לטיפול חברת הניהול HIGH TOWER.

פרטי הפנייה:
${request.content}

נשלח לך עדכון נוסף כאשר הטיפול יושלם.
אם יידרש מידע נוסף, ניצור איתך קשר בפרטים שהשארת.`,
  })
}

export function sendDoneEmail(request, resolution) {
  if (!request.email) return Promise.resolve()
  const resolutionText = resolution
    ? `\nסיכום הטיפול:\n${resolution}`
    : ''
  return emailjs.send(EMAIL_SERVICE, TEMPLATE_MAIN, {
    name:    request.name,
    email:   request.email,
    subject: `פנייתך טופלה — שי עגנון ${request.building}`,
    body:
`פנייתך (מספר ${request.id}) טופלה על ידי חברת הניהול HIGH TOWER.

פרטי הפנייה:
${request.content}${resolutionText}

תודה על הפנייה!`,
  })
}
