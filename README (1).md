# שלב 1 — הנהלת חשבונות — הוראות התקנה

## קבצים בחבילה

```
01_journal_schema.sql    — סכמת DB + RLS + RPC + audit log triggers
02_journal_seed.sql      — קטגוריות ברירת מחדל + bucket receipts
AdminFinance.jsx         — עמוד הניהול (רשימה + מודאל הזנה + ביטול)
logo.png                 — לוגו הבניין (לשימוש ב-PDF בשלב 2)
```

## סדר ביצוע

### 1. הרצת SQL ב-Supabase

ב-Supabase Dashboard → SQL Editor:

1. הרץ את `01_journal_schema.sql` (טבלאות, אינדקסים, RLS, RPC, triggers)
2. הרץ את `02_journal_seed.sql` (קטגוריות ברירת מחדל + bucket)

לוודא שהכל עבר:
```sql
select count(*) from journal_categories;          -- 10
select * from storage.buckets where id='receipts'; -- 1 שורה
```

### 2. שמירת קבצים בפרויקט

```bash
cp AdminFinance.jsx ~/Downloads/shay-agnon-app/src/pages/
cp logo.png ~/Downloads/shay-agnon-app/public/logo-building.png
```

### 3. עדכון Admin.jsx

יש להוסיף שני שינויים:

**א. ייבוא הקומפוננטה (בראש הקובץ):**
```javascript
import AdminFinance from './AdminFinance'
```

**ב. הוספת הכפתור לקבוצת "ועד הבית":**

מצא את החלק של ה-vaad group ב-Admin.jsx (איפה שיש כפתור "הודעות ועד", "בעלי מקצוע" וכו') והוסף שורה:

```jsx
<button className={`admin-nav-btn ${page === 'finance' ? 'active' : ''}`}
  onClick={() => setPage('finance')}>
  💰 הנהלת חשבונות
</button>
```

**ג. הוספת תנאי הרינדור:**

מצא את החלק שבו מוצגות הקומפוננטות (`{page === 'notices' && <AdminNotices />}` וכדומה) והוסף:

```jsx
{page === 'finance' && <AdminFinance />}
```

### 4. בדיקה מקומית

```bash
cd ~/Downloads/shay-agnon-app
npm run dev
```

התחבר עם vaad@agnon.net (לא admin@agnon.net) ובדוק:
- כפתור "הנהלת חשבונות" מופיע בקבוצת "ועד הבית"
- ניתן ליצור תנועה חדשה
- בחירת בניין → דירה → מתמלא אוטומטית שם בעל הדירה
- אופציה "🌐 גורם חיצוני" מנקה את השדות ומאפשרת הזנה ידנית
- שמירה כטיוטה — ניתן לערוך
- שמירה והוצאת קבלה — מקבלת מספר ייחודי, נעולה לעריכה
- בדוק במסד שהמספר תקין: `select receipt_number, status from journal_entries`
- ביטול תנועה — דורש סיבה, משאיר את הרשומה

### 5. דיפלוי

```bash
git add . && git commit -m "feat: הנהלת חשבונות - שלב 1 (סכמה + ניהול תנועות)"
npm run deploy
```

## הערות חשובות

### גישה
- מסך **רק לוועד** — הוסתר מ-`admin@agnon.net` ברמת RLS וברמת UI
- כל הטבלאות מוגנות RLS — אנונימי לא יכול לראות שום דבר

### מספור
- מספר ניתן רק בעת לחיצה על "שמור והוצא קבלה"
- פורמט: `12-20260001` / `14-20260001`
- המספור מתחיל מחדש כל שנה
- כל בניין מנוהל בנפרד

### ביטול
- תנועה מבוטלת לא נמחקת — רק `status='cancelled'`
- חובה להזין סיבה
- מבוטלות מוצגות בטאב "מבוטלות" בלבד, לא בסיכומים

### Audit log
- כל יצירה / שינוי בשדות עיקריים / הוצאה / ביטול נרשמים אוטומטית בטבלת `journal_audit_log`
- כולל מי ומתי
- בשלב הבא נוסיף UI לצפייה ב-log

## מה אין כאן (יגיע בשלב 2)

- ❌ יצירת PDF של הקבלה
- ❌ שמירה ב-bucket receipts
- ❌ שליחת מייל אוטומטית

מי שלוחץ "הוצא קבלה" כרגע — מקבל רק מספר קבלה ונעילה. ה-PDF יווצר בשלב הבא.

## מה הלאה

לאחר שתאשר ששלב 1 עובד כמצופה — נעבור לשלב 2:
- pdfmake בלקוח
- העלאה ל-bucket receipts
- כפתור הורדה / צפייה בקבלה ברשימה
- אם יש זמן — שליחה במייל
