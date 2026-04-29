# SKILL: AGNON.net — פרויקט אתר דיירים שי עגנון 12 ו-14

## סקירה כללית
אתר דיירים לשני בניינים מגורים ברחוב שי עגנון 12 ו-14, קריית אונו.
מנוהל על ידי ועד בית (ארז ברון ואחרים) בשיתוף חברת הניהול HIGH TOWER.
האתר משמש כהאב מרכזי למידע, שירותים, תקשורת עם הניהול ותצוגת לובי.

---

## פרטי תשתית

| פרמטר | ערך |
|--------|-----|
| GitHub | https://github.com/barons-117/agnon |
| אתר חי | https://agnon.net/ |
| Supabase URL | https://cwewsfuswiiliritikvh.supabase.co |
| Supabase Anon Key (Legacy JWT) | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3ZXdzZnVzd2lpbGlyaXRpa3ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDI0NzksImV4cCI6MjA4ODYxODQ3OX0.zr1tSyeqEI4NsOIE5YT1f6MC5jlLIbWKxrLYXh5Qa4o |
| Stack | React + Vite → GitHub Pages + Supabase + Resend |
| DNS | GoDaddy |
| Region Supabase | eu-central-1 |
| תיקיית עבודה | ~/Downloads/shay-agnon-app/ |
| Google Analytics | G-DEXTVT4Q5D (חשבון נפרד לאתר זה בלבד) |

---

## דיפלוי

```bash
# שמירת קוד בלבד — לא מעדכן האתר החי!
git add . && git commit -m "..." && git push

# עדכון האתר החי
npm run deploy
```

- `npm run deploy` = build (Vite) + gh-pages → מעדכן האתר
- `git push` בלבד = שומר קוד ב-GitHub, לא מעדכן האתר
- GitHub Actions **מושבת** — דיפלוי ידני בלבד
- `vite.config.js`: `base: '/agnon/'`
- כל קובץ מ-`public/` נגיש דרך `import.meta.env.BASE_URL + 'שם_קובץ'`

---

## מבנה קבצים מלא

```
src/
├── App.jsx                      — ראוטינג לפי hash, זיהוי מסך לובי (fullscreen)
├── main.jsx
├── components/
│   ├── Sidebar.jsx              — תפריט ניווט צדדי עם סקציות מתקפלות
│   ├── SecretField.jsx          — שדה ••• עם כפתור חשיפה
│   ├── SearchBox.jsx            — חיפוש גלובלי מכל עמוד
│   └── FileAttachment.jsx       — הצגת קובץ מצורף (PDF/תמונה)
├── data/
│   ├── navigation.js            — מבנה התפריט הצדדי
│   ├── contractors.js           — קבלנים וספקים (נתונים סטטיים)
│   ├── professionals.js         — legacy, לא בשימוש פעיל
│   └── searchIndex.js           — אינדקס לחיפוש גלובלי
├── lib/
│   ├── supabase.js              — createClient
│   └── email.js                 — כל פונקציות שליחת מיילים (Resend)
└── pages/
    ├── Home.jsx                 — דף בית: הודעות ועד + פופאפ הודעה דחופה
    ├── BuildingPages.jsx        — VaadNotices + Wifi + Cleaning
    ├── InfoPages.jsx            — Parking + Whatsapp + AC + ResidentsRoom
    ├── GeneralInfoPage.jsx      — מידע כללי: ניווט 2 שכבות (קטגוריה → טאב)
    ├── ContactsPage.jsx         — אנשי קשר עם subtabs
    ├── Requests.jsx             — טופס פנייה לחברת הניהול
    ├── ResidentsRoomCalendar.jsx — לוח זמינות חדר דיירים (ציבורי, קריאה בלבד)
    ├── Pros.jsx                 — בעלי מקצוע + טופס המלצה ציבורי
    ├── Contractors.jsx          — קבלנים וספקים
    ├── DocumentsPage.jsx        — מסמכים להורדה
    ├── UpdateProfile.jsx        — עדכון פרטי שוכר (5 שלבים)
    ├── NavigationCard.jsx       — כרטיס ניווט לאורחים (PNG + overlay)
    ├── GatePhoneForm.jsx        — טופס הוספת מספרי טלפון לשער חשמלי
    ├── LobbyDisplay.jsx         — מסך לובי fullscreen
    ├── Emergency.jsx            — שעת חירום
    ├── Admin.jsx                — ממשק ניהול ראשי
    ├── AdminDashboard.jsx       — דשבורד ניהול
    ├── AdminNotices.jsx         — ניהול הודעות ועד
    ├── AdminPros.jsx            — ניהול בעלי מקצוע + אישור המלצות
    ├── AdminApartments.jsx      — ניהול דיירים + אישור בקשות עדכון שוכר
    ├── AdminProjects.jsx        — ניהול פרויקטים + delivered + ייצוא Excel
    ├── AdminDocuments.jsx       — ניהול מסמכים
    ├── AdminLobbyMedia.jsx      — ניהול מדיה ללובי
    ├── AdminGatePhones.jsx      — ניהול בקשות שער חשמלי
    └── RoomBookings.jsx         — ניהול הזמנות חדר דיירים (admin)

public/
├── nav-12.png, nav-14.png       — מפות ניווט 1600×1197 (ריקות, טקסט נוסף ב-overlay)
├── intercom.png                 — תמונת צג אינטרקום DACOM עם הסברים
├── intercom_ipus.mp4            — סרטון איפוס אינטרקום
├── מדריך_ביטול_נעילת_ילדים_בלוח_בקרה_קירי.mp4
├── הוראות_הפעלה_בקר_מזגן_קירי_אלקו.pdf
├── חוברת_הפעלה_משאבת_חום_מים.pdf
├── favicon.ico                  — כחול כהה + בניין לבן
├── favicon-32x32.png
├── apple-touch-icon.png         — 180×180
├── icon-192.png, icon-512.png   — PWA
└── CNAME                        → agnon.net

supabase/functions/
├── send-email/index.ts          — שליחת מיילים דרך Resend (JWT=ON)
├── ynet-rss/index.ts            — RSS חדשות ynet (JWT=OFF)
└── weekly-summary/index.ts      — סיכום שבועי אוטומטי (pg_cron)
```

---

## עיצוב ו-CSS

### צבעים (CSS Variables)
```css
--primary:   #1B3A5C   /* כחול כהה — כותרות, כפתורים ראשיים */
--accent:    #2563EB   /* כחול בהיר — גרדיאנט header */
--accent2:   #3B82F6   /* כחול בינוני */
--text:      #2d2926   /* טקסט ראשי */
--muted:     #8a8178   /* טקסט משני */
--border:    #e8e3de   /* גבולות */
--bg:        #f5f0eb   /* רקע כללי */
--card-bg:   #ffffff
```

### גופן
Heebo — נטען מ-Google Fonts ב-`index.html`. כל הטקסט העברי.

### CSS Classes מרכזיים
```
.card                   — כרטיס לבן עם צל עדין, border-radius 16px
.panel-title            — כותרת כרטיס עם אייקון
.ctab-bar / .ctab-btn   — שורת טאבים (כרטיסיות בניין 12/14)
.ctab-body              — גוף תוכן הטאב
.admin-nav / .admin-nav-btn — תפריט ממשק ניהול
.pro-tab-btn            — כפתורי טאב ישנים
.info-block             — תיבת מידע אפורה
.info-block.amber       — תיבת אזהרה צהובה
.info-block.green       — תיבת הצלחה ירוקה
.link-btn               — כפתור קישור כחול מלא
.link-btn.outline       — כפתור קישור עם מסגרת
.section-label          — תווית סקציה קטנה
.info-row               — שורת מידע (label + value)
.divider                — קו מפריד
.note                   — הערה קטנה
.rate-table             — טבלת תעריפים
.wa-card                — כרטיס קבוצת וואטסאפ
```

### Layout
- RTL (Hebrew)
- Mobile-first — רוחב מקסימלי ~480px
- Topbar (כחול כהה) + Sidebar + Main content
- מסך לובי: fullscreen, ללא topbar/sidebar

---

## ניווט (navigation.js)

```
סקציה: ניהול
  📣 הודעות ועד           → #vaad-notices
  📝 פניות לחברת הניהול   → #requests
  📇 אנשי קשר             → #contacts
  ✏️ עדכון פרטי שוכר      → #update-profile
  🗺️ כרטיס ניווט לאורחים  → #nav-card

סקציה: הבניין
  🚗 חניות וחניון          → #parking
  🔒 עדכון מספרי שער       → #gate-phones
  🛋️ חדר דיירים           → #residents-room
  🧹 לוח ניקיון            → #cleaning
  📶 קודים ו-WiFi           → #wifi

סקציה: מידע נוסף
  ⭐ בעלי מקצוע מומלצים   → #pros
  🔧 קבלנים וספקים         → #contractors
  ℹ️ מידע כללי נוסף        → #general-info
  🚨 שעת חירום             → #emergency

סקציה: (ללא כותרת)
  🔒 ממשק ניהול            → #admin (muted style)
```

---

## עמודים ציבוריים — פירוט

### Home (#home)
- הודעות ועד: 3 האחרונות
- פופאפ אוטומטי: הודעה `urgent=true` — מופיע בכניסה ראשונה

### VaadNotices (#vaad-notices)
- כל הודעות הועד ממסד הנתונים
- כרטיסיות בניין 12 / 14 / שניהם
- תמיכה בקבצים מצורפים + linkify לקישורים

### Requests (#requests)
- טופס: שם, טלפון, מייל (רשות), בניין, דירה, תוכן, קובץ מצורף
- שולח מייל לוועד + HIGH TOWER מיד עם שליחה
- Rate limit: פנייה אחת כל 60 שניות

### Contacts (#contacts)
- Subtabs: חברת הניהול | ועד הבית | בוני התיכון | קבוצות וואטסאפ

### Parking (#parking)
- מידע על החניון (קומות מינוס 1-4)
- כרטיס חניות אורחים: 409–433, מפלס 4
- כרטיס שער חשמלי:
  - שלט רחוק (תמיר שערים, רכישה פרטית, הקבוצתית נסגרה)
  - אפליקציית PALGATE: https://onelink.to/palgate
  - חיוג: 050-431-7336 (**כרגע לא פעיל** — בעיות SIM)
- חוקי החניון

### GatePhoneForm (#gate-phones)
- טופס: בניין, דירה, קומה (אוטומטי מ-DB), עד 4 שמות+טלפונים, מייל (רשות), הערה
- לחיצה "שלח" → INSERT לטבלה + מייל לכל הוועד
- הבקשה לא מבוצעת מיידית — ועד הבית מטפל

### ResidentsRoomCalendar (#residents-room)
- לוח זמינות ויזואלי (חודש) לכל בניין
- תאריכים תפוסים בצבע אדום
- אין אפשרות הזמנה מהאתר — פנייה לחברת הניהול
- בכל אחד מהבניינים (12 ו-14) יש חדר דיירים

### GeneralInfoPage (#general-info)
ניווט **דו-שכבתי**: קטגוריה (grid 2×2) → תת-טאבים → תוכן

**קטגוריות:**
1. **פרטי הנכס** (אייקון בניין SVG):
   - מיקוד: עגנון 12 → 5560622, עגנון 14 → 5560624
   - גוש וחלקה: גוש 6496, חלקות 519/520
   - כתובות: לוי אשכול 75/77

2. **מערכות בדירות** (אייקון גלגל שיניים SVG):
   - מיזוג אוויר: סרטון ביטול נעילת ילדים + שלט AliExpress + הוראות ELCO PDF
   - משאבת חום מים: קומות 1-10, חוברת הפעלה PDF
   - אינטרקום: תמונת DACOM + הוראות + סרטון איפוס + 077-504-0890

3. **עירוני** (אייקון סקיילין SVG):
   - ארנונה: תעריפים לפי גודל + צו ארנונה 2026 קריית אונו

4. **מידע כללי** (אייקון i SVG):
   - מעלית: מידות מעלית משא ורגילה
   - קליטה סלולרית: בעיה ידועה + WiFi Calling + מדריכים אנדרואיד/אייפון

### NavigationCard (#nav-card)
- בחירת בניין + הזנת דירה → שליפת קומה מ-DB
- PNG overlay עם: שם בניין, דירה, קומה, חניות אורחים
- מיקומי overlay (%): כחול top=23% left=45.9%, סגול שורה1 top=19% left=30.3%, שורה2 top=22.6% left=30.3%, חניות top=95% left=75.5%
- הורדה: מחשב = download, נייד = blob URL בטאב חדש (html2canvas)
- חניות אורחים: 409–433, מינוס 4

### Pros (#pros)
- בעלי מקצוע מומלצים מ-Supabase (קטגוריות + חיפוש)
- טופס המלצת דייר → INSERT pro_recommendations, status=pending → ממתין לאישור

### UpdateProfile (#update-profile)
5 שלבים:
1. בחירת בניין + דירה
2. אזהרה אם יש בקשה ממתינה
3. הצגת דיירים נוכחיים (בעלים + שוכרים)
4. בחירת פעולה: החלפת כל השוכרים / החלפה ספציפית / הוספה
5. טופס פרטי שוכר חדש

### Emergency (#emergency)
מספרי חירום: אמבולנס, משטרה, כיבוי אש, בית חולים מקומי

---

## ממשק ניהול — פירוט מלא

### כניסה
Supabase Auth (email + password). Header מציג מייל + כפתור "התנתק".

### תפקידים
```javascript
const userRole = session?.user?.email === 'admin@agnon.net' ? 'mgmt' : 'admin'
```

| משתמש | תפקיד | גישה |
|--------|--------|------|
| `admin@agnon.net` | mgmt (HIGH TOWER) | פניות דיירים + חדר דיירים בלבד |
| `vaad@agnon.net` + כל שאר | admin (ועד) | הכל |

### דשבורד (AdminDashboard.jsx)
עמוד ראשי — כפתור 🏠 בכל מקום חוזר אליו.

**כרטיס 1 — פניות (שני תפקידים):**
- מונה: חדשות | בטיפול | טופלו השבוע/חודש/שנה
- זמני טיפול ממוצעים לפי תקופה (שבוע/30 יום/שנה):
  - ממוצע זמן עד תגובה (created_at → inprogress_at)
  - ממוצע זמן עד סיום (created_at → done_at)
- כפתור "לכל הפניות"

**כרטיס 2 — חדר דיירים (שני תפקידים):**
- לכל בניין: כמות אירועים החודש + אירוע הבא

**כרטיס 3 — הודעות ועד (ועד בלבד):**
- לכל בניין: פעילות | דחופות | מסך לובי

**כרטיס 4 — בעלי מקצוע (ועד בלבד):**
- מופיע רק אם יש המלצות ממתינות לאישור

**כרטיס 5 — שער חשמלי (ועד בלבד):**
- מופיע רק אם יש בקשות טלפון ממתינות

**כרטיס 6 — דיירים (ועד בלבד):**
- מופיע רק אם יש בקשות עדכון שוכר ממתינות

### קבוצת חברת הניהול (mgmt + admin)

**פניות דיירים:**
- רשימה עם פילטר: סטטוס + בניין + חיפוש חופשי
- כרטיס פנייה: שם, טלפון, מייל, בניין, דירה, תוכן, קובץ מצורף, הערה פנימית (admin_note)
- פעולות:
  - "בטיפול" → UPDATE inprogress + inprogress_at + שליחת מייל לדייר
  - "טופל" → חלונית עם שדה resolution → UPDATE done + done_at + מייל לדייר
  - מחיקה

**חדר דיירים:**
- כרטיסיות בניין 12/14
- הוספה/מחיקה של הזמנות

### קבוצת ועד הבית (admin בלבד)

**הודעות ועד:**
- CRUD הודעות עם: כותרת, תוכן, תאריך, בניין, urgent, show_in_lobby, קובץ מצורף
- כפתור מהיר 📺 לשינוי show_in_lobby מהרשימה
- כפתור 🔴 לשינוי urgent מהרשימה

**בעלי מקצוע:**
- CRUD + קטגוריות
- המלצות ממתינות → אישור/דחייה

**פרויקטים:**
- יצירת פרויקט: שם, תיאור, price_per_unit, unit_label
- שיוך דירות עם: quantity, amount_paid, notes, status (paid/pending)
- כפתור "נמסר" (delivered) לכל דירה ששילמה — צבע ירוק אחרי לחיצה
- סטטיסטיקת מסירה: לכל בניין — X דירות (מתוך Y) · X יחידות (מתוך Y)
- ייצוא Excel + העברה לארכיון

**מסמכים:**
- העלאת PDF + כותרת + קטגוריה + בניין + תאריך

**מסך לובי:**
- בחירת בניין 12/14
- העלאת תמונות/וידאו
- סדר (▲▼), הסתרה, מחיקה, משך תמונה בשניות
- כפתור תצוגה מקדימה

**שער חשמלי:**
- רשימת בקשות ממתינות עם: בניין, דירה, קומה, מייל, טלפונים, הערה
- כפתור "בוצע" → חלונית עם שדה הערה → UPDATE done + מייל לדייר (אם מילא מייל)

### קבוצת ניהול אתר (admin בלבד)

**ניהול דיירים:**
- כל הדירות עם פילטר בניין + חיפוש
- CRUD דיירים (בעלים/שוכרים)
- בקשות עדכון שוכר ממתינות:
  - replace_all → DELETE tenants + INSERT חדש
  - replace_one → DELETE לפי שם + INSERT חדש
  - add_tenant → INSERT בלי מחיקה

---

## מערכת מיילים מלאה

### תשתית
- שולח: Resend API
- Edge Function: `send-email` (JWT=ON)
- מייל שולח: `vaad@agnon.net`
- DNS: DKIM ✅ SPF ✅ DMARC ✅ (p=quarantine, rua=erez@barons.co.il)

### כלל קריטי — שני headers חובה:
```javascript
'apikey': ANON_KEY,
'Authorization': `Bearer ${ANON_KEY}`
```
ANON_KEY = Legacy JWT (מתחיל ב-eyJ...), **לא** sb_publishable_...

### Edge Function — send-email
```typescript
// קלט: { to, subject, html }
// AbortSignal.timeout(10000) — מניע WallClockTime
// RESEND_API_KEY — secret ב-Supabase
```

### מיילים יזומים (על ידי משתמש)

| טריגר | פונקציה | נשלח אל |
|--------|----------|---------|
| פנייה חדשה מהאתר | `sendNewRequestEmail(req)` | erez@barons.co.il + HIGH TOWER |
| בקשת שער חדשה | `sendGatePhoneRequestEmail(req)` | כל הוועד (6 כתובות) |

### מיילים אוטומטיים (על ידי ממשק ניהול)

| טריגר | פונקציה | נשלח אל |
|--------|----------|---------|
| פנייה → "בטיפול" | `sendInProgressEmail(req)` | דייר (אם מילא מייל) |
| פנייה → "טופל" | `sendDoneEmail(req, resolution)` | דייר (אם מילא מייל) |
| שער → "בוצע" | `sendGatePhoneDoneEmail(req, note)` | דייר (אם מילא מייל) |

### מייל אוטומטי שבועי (pg_cron)
- **מתי:** כל יום שני 7:00 UTC (10:00 ישראל)
- **Edge Function:** `weekly-summary`
- **תוכן:** פניות חדשות / בטיפול / תקועות מעל 7 ימים + קישור לממשק
- **נשלח אל:** erez@barons.co.il + HIGH TOWER

### תבנית מייל (baseTemplate)
```
Header: גרדיאנט כחול (#1B3A5C → #2563EB) + "🏢 שי עגנון 12 ו-14"
Body: RTL, font Heebo/Arial
Footer: "HIGH TOWER · 03-6440424"
```

### נמענים

| קבוצה | כתובות |
|--------|---------|
| ועד בית | erez@barons.co.il, vpolyak@gmail.com, eran9maron@gmail.com, avlili2403@gmail.com, sigalsorgim@gmail.com, baruch.vipman@gmail.com |
| HIGH TOWER | Onone.finance@hightower.co.il, onone.mgr@hightower.co.il |
| פניות | erez@barons.co.il + שתי כתובות HIGH TOWER |

---

## טבלאות Supabase — מלא

### apartments
```
building (int) — 12 או 14
apt (int) — מספר דירה
floor (int) — קומה
parking_spots (text)
storage_unit (text)
UNIQUE: (building, apt)
```

### residents
```
building, apt
role (text) — 'owner' | 'tenant'
name, phone, phone2, email, email2
is_company (bool)
```

### requests
```
name, phone, email
building (text), apartment (text)
content (text), file_url (text)
status (text) — 'new' | 'inprogress' | 'done'
done (bool)
admin_note (text) — פנימי, לא נשלח לדייר
resolution (text) — נשלח לדייר במייל סיום
inprogress_at (timestamptz)
done_at (timestamptz)
updated_at (timestamptz) — trigger אוטומטי
created_at
```

### notices
```
title, text, date (text DD/MM/YYYY)
building (text) — '12' | '14' | 'both'
urgent (bool) — פופאפ בכניסה + הדגשה אדומה
show_in_lobby (bool) — מוצג במסך לובי
file_url, file_name
```

### room_bookings
```
building (int), date (text YYYY-MM-DD)
name, phone, notes
```

### professionals + pro_categories
```
name, phone, category_id (→ pro_categories)
description, address
```

### pro_recommendations
```
name, phone, category_id, description
submitted_by_name, submitted_by_phone
status (text) — 'pending' | 'approved' | 'rejected'
```

### apt_projects
```
name, description
price_per_unit (numeric), unit_label (text)
archived (bool)
```

### apt_project_items
```
project_id (→ apt_projects)
building (int), apt (int)
status (text) — 'paid' | 'pending'
quantity (int), amount_paid (numeric)
notes (text)
paid_at (timestamptz)
delivered (bool) — סומן כנמסר בממשק הניהול
UNIQUE: (project_id, building, apt)
```

### profile_update_requests
```
building (int), apt (int)
request_type (text) — 'replace_tenant' | 'add_tenant'
replace_tenant_name (text) — null = החלף כולם
name, phone, phone2, email, email2, notes
status (text) — 'pending' | 'approved' | 'dismissed'
```

### documents
```
title, file_url, file_name
category (text) — vaad | protocol | meeting | legal | general
building (text) — 'both' | '12' | '14'
publish_date (date)
show_in_lobby (bool)
```

### lobby_media
```
building (int)
type (text) — 'video' | 'image'
file_url, file_name
duration (int) — שניות לתמונה (0 לוידאו = עד הסוף)
sort_order (int)
active (bool)
```

### gate_phone_requests
```
building (int), apt (int), floor (int)
entries (jsonb) — [{name, phone}, ...]
email (text) — רשות
notes (text)
done_note (text) — הערת ועד עם סגירה
status (text) — 'pending' | 'done'
```

### RPC: get_apt_names(p_building int, p_apt int)
מחזיר JSON: `{ exists, owners[], tenants[], pending_requests }`
גישה לanon ו-authenticated.

---

## הרשאות RLS — מלא

| טבלה | anon | authenticated |
|------|------|---------------|
| apartments | SELECT | ALL |
| residents | ❌ | ALL |
| requests | INSERT + SELECT | ALL |
| notices | SELECT | ALL |
| room_bookings | SELECT | ALL |
| professionals | SELECT | ALL |
| pro_categories | SELECT | ALL |
| pro_recommendations | INSERT | ALL |
| profile_update_requests | INSERT | ALL |
| documents | SELECT | ALL |
| lobby_media | SELECT | ALL |
| gate_phone_requests | INSERT + SELECT | ALL |
| apt_projects | SELECT | ALL |
| apt_project_items | SELECT | ALL |

### Storage Buckets (כולם public)
| Bucket | INSERT | DELETE |
|--------|--------|--------|
| request-files | anon + authenticated | authenticated |
| notices-files | authenticated בלבד | authenticated |
| documents | authenticated בלבד | authenticated |
| lobby-media | authenticated בלבד | authenticated |

---

## מסך לובי (LobbyDisplay)

**URLs:** `#lobby-12`, `#lobby-14` (fullscreen, ללא header/sidebar)
App.jsx מזהה ומחזיר את הרכיב ישירות.

**פריסה:**
```
┌─────────────────────────────────────┐
│ לוגו  |  שעון + תאריך עברי  |  מזג  │  ← 76px
├──────────────────────┬──────────────┤
│  MediaRotator (2/3)  │  Notices     │
│  תמונות + וידאו      │  Panel (1/3) │
├──────────────────────┴──────────────┤
│  טיקר חדשות ynet →                  │
└─────────────────────────────────────┘
```

**רקע:** `linear-gradient(150deg, #f8fafc, #eef2ff, #f0f9ff)` — בהיר, לא כהה!

**מזג אוויר:** Open-Meteo, lat=32.0325, lon=34.8575, מתעדכן כל 15 דקות

**MediaRotator:**
- טוען lobby_media (active=true, לפי building)
- וידאו: עד הסוף → הבא
- תמונה: duration שניות → הבא
- מתרענן כל 30 שניות (בודק שינויים לפי IDs)

**NoticesPanel:**
- notices עם show_in_lobby=true לבניין + both
- מתחלף כל 12 שניות

**ynet-rss:** Edge Function (JWT=OFF), מתעדכן כל 30 דקות

**רענון:** `window.location.reload()` כל 5 דקות

---

## כרטיס ניווט לאורחים

- תמונות: `nav-12.png`, `nav-14.png` — 1600×1197 פיקסלים, ריקות
- Overlay מיקומים (%): תיבה כחולה top=23% left=45.9%, סגול top=19% left=30.3%, קומה top=22.6% left=30.3%, חניות top=95% left=75.5%
- html2canvas: dynamic import (לא בbundle ראשי)
- הורדה נייד: blob URL בטאב חדש → לחיצה ארוכה → שמור תמונה

---

## שער חשמלי — זרימה מלאה

```
דייר → GatePhoneForm → INSERT → מייל לוועד
ועד → AdminGatePhones → "בוצע" → חלונית הערה → UPDATE + מייל לדייר
```

**שיטות פתיחה:**
1. שלט רחוק — תמיר שערים (073-365-6230), רכישה פרטית בלבד
2. PALGATE — אפליקציה, https://onelink.to/palgate
3. חיוג — 050-431-7336 (**כרגע לא פעיל** — בעיות SIM)

---

## פרויקטים — זרימה

1. יצירת פרויקט עם price_per_unit + unit_label
2. שיוך דירות (apt_project_items) עם quantity + amount_paid
3. סימון paid/pending לכל דירה
4. סימון delivered (bool) לכל דירה ששילמה
5. סטטיסטיקת מסירה לפי בניין: "נמסר ל-X דירות (מתוך Y) · X יחידות (מתוך Y)"
6. ייצוא Excel + ארכיון

---

## אוטומציות (pg_cron)

```sql
-- סיכום שבועי — כל שני 7:00 UTC
select cron.schedule('weekly-requests-summary', '0 7 * * 1', $$
  select net.http_post(
    url := 'https://cwewsfuswiiliritikvh.supabase.co/functions/v1/weekly-summary',
    headers := '{"Authorization": "Bearer eyJ..."}'::jsonb,
    body := '{}'::jsonb
  );
$$);
```

---

## favicon ו-PWA

- `favicon.ico` — מרובה גדלים (16/32/48)
- `apple-touch-icon.png` — 180×180 (שמירה למסך הבית iOS)
- `icon-192.png`, `icon-512.png` — PWA manifest
- `index.html` — meta tags: apple-mobile-web-app-capable, status-bar-style, title

---

## קודי גישה

| | בניין 12 | בניין 14 |
|--|---------|---------|
| קוד כניסה | 3280 | 1973 |
| WiFi | Shay Agnon 12-14 (סיסמה ב-SecretField) | |
| חניות אורחים | 409–433, מינוס 4 | |

---

## אנשי קשר

| תפקיד | שם | טלפון | מייל |
|--------|-----|--------|------|
| ועד (מנהל) | ארז ברון | 054-212-1021 | erez@barons.co.il |
| ועד | ערן מרון | 054-476-1051 | eran9maron@gmail.com |
| ועד | סיגל | 054-579-9774 | sigalsorgim@gmail.com |
| ועד | ולדימיר | — | vpolyak@gmail.com |
| ועד | לילי | — | avlili2403@gmail.com |
| ועד | ברוך | — | baruch.vipman@gmail.com |
| HIGH TOWER | — | 03-6440424 | Onone.finance@hightower.co.il |
| HIGH TOWER | — | — | onone.mgr@hightower.co.il |
| תמיר שערים | — | 073-365-6230 | — |
| DACOM (אינטרקום) | — | 077-504-0890 | — |
| PALGATE (שער) | — | — | https://onelink.to/palgate |

---

## עקרונות פיתוח קריטיים

1. **שני headers לכל Edge Function call:**
   ```javascript
   'apikey': ANON_KEY,
   'Authorization': `Bearer ${ANON_KEY}`
   ```

2. **ANON_KEY = Legacy JWT בלבד** — מתחיל `eyJhbGci...`, לא `sb_publishable_...`
   נמצא ב: Supabase → Settings → API → Legacy anon, service_role API keys

3. **AbortSignal.timeout(10000)** בכל fetch בתוך Edge Function (מניע WallClockTime)

4. **RLS** — לבדוק תמיד. `{public}` = unauthenticated + authenticated!

5. **import.meta.env.BASE_URL** — לכל קובץ מ-public:
   ```jsx
   src={import.meta.env.BASE_URL + 'שם_קובץ.mp4'}
   ```

6. **PDF עברי** — להשתמש ב-wkhtmltopdf עם HTML/CSS, **לא** reportlab
   - `page-break-inside: avoid` למניעת חיתוך טפסים

7. **הורדת תמונה נייד** — blob URL בטאב חדש (לא `download` attribute)

8. **timestamps** — requests מעדכן inprogress_at ו-done_at בכל שינוי סטטוס

9. **GitHub Actions מושבת** — דיפלוי רק עם `npm run deploy`

---

## הערות ידועות

- מיילים מגיעים לספאם בגלל דומיין חדש — ייפתר עם הזמן, למארק "Not Spam"
- חיוג לשער 050-431-7336 **לא פעיל** — בעיות SIM של השער
- כרטיס ניווט — overlay מכוייל ידנית, לבדוק אם תמונות ישתנו
- GeneralInfoPage — ניווט דו-שכבתי: grid קטגוריות → ctab-bar לתת-טאבים
