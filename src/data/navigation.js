// src/data/navigation.js
// ✏️ כאן מוסיפים / מסדרים טאבים בתפריט

export const navSections = [
  {
    label: 'ניהול',
    items: [
      { id: 'manage',       icon: '🏢', label: 'חברת ניהול' },
      { id: 'vaad',         icon: '👥', label: 'ועד הבית' },
      { id: 'vaad-notices', icon: '📣', label: 'הודעות וועד' },
    ],
  },
  {
    label: 'הבניין',
    items: [
      { id: 'wifi',     icon: '📶', label: 'WiFi וקודים' },
      { id: 'cleaning', icon: '🧹', label: 'לוח ניקיון' },
      { id: 'trash',    icon: '🗑️', label: 'פחים ומחזור' },
      { id: 'parking',  icon: '🚗', label: 'חניון' },
      { id: 'details',  icon: '📋', label: 'מיקוד, גוש וכתובת' },
    ],
  },
  {
    label: 'מידע נוסף',
    items: [
      { id: 'pros',           icon: '⭐', label: 'בעלי מקצוע מומלצים' },
      { id: 'arnona',         icon: '🏙️', label: 'ארנונה' },
      { id: 'contractors',    icon: '🔧', label: 'קבלנים וספקים' },
      { id: 'whatsapp',       icon: '💬', label: 'קבוצות וואטסאפ' },
      { id: 'ac',             icon: '❄️', label: 'מיזוג אוויר בדירות' },
      { id: 'residents-room', icon: '🛋️', label: 'חדר דיירים' },
    ],
  },
]
