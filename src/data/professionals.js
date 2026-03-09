// src/data/professionals.js
// ✏️ כאן מוסיפים / מעדכנים בעלי מקצוע בקלות

export const categories = [
  { id: 'clean',     label: '🧹 ניקיון' },
  { id: 'handyman',  label: '🔨 הנדימן' },
  { id: 'carpenter', label: '🪚 נגרות' },
  { id: 'shower',    label: '🚿 מקלחונים' },
  { id: 'door',      label: '🚪 דלת ממ״ד' },
  { id: 'shelves',   label: '📦 מדפים' },
  { id: 'taxi',      label: '🚕 מונית' },
  { id: 'beauty',    label: '💆 קוסמטיקה' },
  { id: 'nails',     label: '💅 לק ג׳ל' },
  { id: 'pilates',   label: '🧘 פילאטיס' },
]

export const professionals = [
  {
    category: 'clean',
    name: 'עופר ניקיון',
    desc: 'ניקיון לאחר שיפוץ, פוליש וקרצוף. ממולץ בחום ע״י מספר דיירים.',
    phone: null,
  },
  {
    category: 'handyman',
    name: 'מאיר',
    desc: 'גופי תאורה, תלייה, טלוויזיות, ריהוט ועוד.',
    phone: '050-474-7800',
  },
  {
    category: 'handyman',
    name: 'אלכס',
    desc: 'גופי תאורה, תלייה, טלוויזיות, ריהוט איקאה. מקצועי ובחיוך. גר בבניינים.',
    phone: '052-807-8855',
    link: { label: 'alexhandyman.info', url: 'https://www.alexhandyman.info/' },
  },
  {
    category: 'carpenter',
    name: 'אמג׳ד – נגר',
    desc: 'נגרות כללית, תוספות ארונות. המלצת סיגל ועוד דיירים.',
    phone: '050-786-7119',
  },
  {
    category: 'shower',
    name: 'ניר ונג – גלאספיקס',
    desc: 'מקלחונים ואמבטיונים. המלצת אסף גרשון.',
    phone: '054-296-8531',
  },
  {
    category: 'shower',
    name: 'יובל – מקלחונים',
    phone: '053-888-7161',
  },
  {
    category: 'shower',
    name: 'דניאל – מקלחונים',
    phone: '052-642-6828',
  },
  {
    category: 'door',
    name: 'דור מאסטר – דלתות ממ״ד',
    phone: '054-900-8078',
  },
  {
    category: 'shelves',
    name: 'אבי – מדפים למחסן',
    desc: 'התקין בעשרות מחסנים בפרויקט. מקצועי ואמין.',
    phone: '052-540-5028',
  },
  {
    category: 'beauty',
    name: 'אוליאנה – קוסמטיקאית מוסמכת',
    desc: 'טיפולי גוף. גרה בבניין 12, קומה 6.',
    phone: null,
    link: { label: '📷 אינסטגרם', url: 'https://www.instagram.com/uliana_skin_care' },
  },
  {
    category: 'nails',
    name: 'אורלי – גבות ולק ג׳ל',
    desc: 'גרה בבניין 18 בפרויקט (אונו וואן).',
    phone: null,
  },
  {
    category: 'pilates',
    name: 'מרסלה – פילאטיס פאוור',
    desc: 'מאמנת פילאטיס פאוור לרקדנים ולכל מי שרוצה לשמור על גוף חזק ותנועתי. גרה בבניין 14.',
    phone: '054-277-9390',
  },
]
