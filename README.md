# שי עגנון 12 ו-14 – אתר מידע לדיירים

## 🛠 דרישות מקדימות (פעם אחת בלבד)

1. **Node.js** – הורד והתקן מ-https://nodejs.org (בחר "LTS")
2. **Git** – הורד והתקן מ-https://git-scm.com
3. **חשבון GitHub** – אם אין לך, צור ב-https://github.com

---

## 🚀 הגדרה ראשונה (פעם אחת בלבד)

### שלב 1 – צור Repository ב-GitHub
1. היכנס ל-GitHub
2. לחץ על **"New repository"** (הכפתור הירוק למעלה מימין)
3. תן לו שם, למשל: `shay-agnon`
4. סמן **"Public"**
5. לחץ **"Create repository"**
6. **שמור את הכתובת** – תיראה כך: `https://github.com/YOUR-USERNAME/shay-agnon`

### שלב 2 – עדכן את vite.config.js
פתח את הקובץ `vite.config.js` ושנה את השורה:
```js
base: '/YOUR-REPO-NAME/',
```
לשם ה-repository שיצרת, למשל:
```js
base: '/shay-agnon/',
```

### שלב 3 – פתח Terminal (שורת פקודה)
- **Mac:** Command + Space → כתוב "Terminal"
- **Windows:** לחץ Start → כתוב "cmd" או "PowerShell"

### שלב 4 – נווט לתיקיית הפרויקט
```bash
cd /path/to/shay-agnon-app
```
(החלף את הנתיב לנתיב האמיתי של התיקייה אצלך)

### שלב 5 – התקן תלויות
```bash
npm install
```
(רק פעם אחת, לוקח כדקה)

### שלב 6 – חבר ל-GitHub
```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/shay-agnon.git
git push -u origin main
```
(החלף YOUR-USERNAME בשם המשתמש שלך ב-GitHub)

### שלב 7 – העלה לאתר (GitHub Pages)
```bash
npm run deploy
```

### שלב 8 – הפעל GitHub Pages
1. היכנס ל-repository שלך ב-GitHub
2. לחץ **Settings** (בתפריט העליון)
3. בצד שמאל לחץ **Pages**
4. תחת **Branch** בחר: `gh-pages` ← `/ (root)`
5. לחץ **Save**

✅ **האתר יהיה זמין ב:**
`https://YOUR-USERNAME.github.io/shay-agnon/`

(לפעמים לוקח כ-2 דקות עד שהוא עולה)

---

## 🔄 כיצד מעדכנים תוכן בעתיד

### לעדכן בעל מקצוע:
פתח `src/data/professionals.js` – הוסף / שנה ערך במערך.

### לעדכן קבלן:
פתח `src/data/contractors.js` – הוסף / שנה שורה.

### לעדכן טאב שלם:
פתח את הקובץ המתאים ב-`src/pages/`

### אחרי כל עדכון – להעלות לאתר:
```bash
git add .
git commit -m "עדכון [תיאור מה שינית]"
git push
npm run deploy
```

---

## 🖥 להרצה מקומית (לפני העלאה)
```bash
npm run dev
```
פתח את הדפדפן ב: http://localhost:5173
