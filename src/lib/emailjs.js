// src/lib/emailjs.js
import emailjs from '@emailjs/browser'

export const EMAIL_SERVICE  = 'service_52pryva'
export const TEMPLATE_NEW   = 'template_1i4eu5b'  // פנייה חדשה → לחברת הניהול
export const TEMPLATE_DONE  = 'template_jwuc1xs'  // טיפול הושלם → לדייר
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

export function sendDoneEmail(request) {
  if (!request.email) return Promise.resolve()
  const now = new Date()
  return emailjs.send(EMAIL_SERVICE, TEMPLATE_DONE, {
    request_id: request.id,
    name:       request.name,
    email:      request.email,
    content:    request.content,
    done_date:  now.toLocaleDateString('he-IL') + ' ' + now.toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'}),
  })
}
