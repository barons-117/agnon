// src/data/navigation.js
export const navSections = [
  {
    label: 'ניהול',
    items: [
      { id: 'vaad-notices', icon: '📣', label: 'הודעות וועד' },
      { id: 'manage',       icon: '🏢', label: 'חברת ניהול' },
      { id: 'vaad',         icon: '👥', label: 'ועד הבית' },
      { id: 'boni',         icon: '🏗️', label: 'בוני התיכון' },
      { id: 'requests',     icon: '📝', label: 'פניות לחברת הניהול' },
    ],
  },
  {
    label: 'הבניין',
    items: [
      { id: 'wifi',           icon: '📶', label: 'WiFi וקודים' },
      { id: 'cleaning',       icon: '🧹', label: 'לוח ניקיון' },
      { id: 'residents-room', icon: '🛋️', label: 'חדר דיירים' },
      { id: 'parking',        icon: '🚗', label: 'חניות וחניון' },
    ],
  },
  {
    label: 'מידע נוסף',
    items: [
      { id: 'pros',        icon: '⭐', label: 'בעלי מקצוע מומלצים' },
      { id: 'arnona',      icon: '🏙️', label: 'ארנונה' },
      { id: 'contractors', icon: '🔧', label: 'קבלנים וספקים' },
      { id: 'details',     icon: '📋', label: 'מיקוד, גוש וכתובת' },
      { id: 'whatsapp',    icon: '💬', label: 'קבוצות וואטסאפ' },
      { id: 'ac',          icon: '❄️', label: 'מיזוג אוויר בדירות' },
      { id: 'emergency',   icon: '🚨', label: 'שעת חירום' },
    ],
  },
  {
    label: '',
    items: [
      { id: 'admin', icon: '🔒', label: 'ממשק ניהול', muted: true },
    ],
  },
]
