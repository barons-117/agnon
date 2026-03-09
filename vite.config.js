import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ⚠️ שנה את 'YOUR-REPO-NAME' לשם ה-repository שלך ב-GitHub
// לדוגמה: אם הכתובת היא github.com/john/shay-agnon → base: '/shay-agnon/'
export default defineConfig({
  plugins: [react()],
  base: '/agnon/',
})
