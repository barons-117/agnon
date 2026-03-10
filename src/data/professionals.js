// src/data/professionals.js
// ✏️ כאן מוסיפים / מעדכנים בעלי מקצוע בקלות

export const categories = [
  { id: 'clean',     label: '🧹 ניקיון' },
  { id: 'handyman',  label: '🔨 הנדימן' },
  { id: 'ac',        label: '❄️ מיזוג אוויר' },
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
    name: 'אביחי ראובנס',
    desc: 'עבד על הפרויקט מטעם בוני התיכון וכך מכיר את הבניינים כולם לעומק. נותן שירות פרטי בתשלום. מאוד מומלץ.',
    phone: '052-8253807',
  },
    desc: 'גר בפרויקט. עבודות צבע, ריהוט, התקנת טלוויזיות, מדפים, וילונות ועוד. גופי תאורה, שקעים ותקשורת, ברזים ואינסטלציה.',
    phone: '054-573-7556',
  },
  {
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
    category: 'ac',
    name: 'שחר לוי – טכנאי מיזוג וקירור',
    desc: 'ניסיון של למעלה מ-20 שנה בתחום. גר בבניין 14.',
    phone: '058-665-5455',
  },
  {
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
    name: 'יוליאנה – קוסמטיקאית מוסמכת',
    desc: 'טיפולי פנים, גבות ושיזוף בהתזה. גרה בבניין 12, קומה 6.',
    phone: '054-4817652',
    link: { label: '📷 אינסטגרם', url: 'https://www.instagram.com/uliana_skin_expert?igsh=c25waTU2MDVja2V5&utm_source=qr' },
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
