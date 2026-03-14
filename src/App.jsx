import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Home from './pages/Home.jsx'
import Requests from './pages/Requests.jsx'
import Admin from './pages/Admin.jsx'
import Emergency from './pages/Emergency.jsx'
import ResidentsRoomCalendar from './pages/ResidentsRoomCalendar.jsx'
import Contractors from './pages/Contractors.jsx'
import Pros from './pages/Pros.jsx'
import ContactsPage from './pages/ContactsPage.jsx'
import GeneralInfoPage from './pages/GeneralInfoPage.jsx'
import UpdateProfile from './pages/UpdateProfile.jsx'
import DocumentsPage from './pages/DocumentsPage.jsx'
import { VaadNotices, Wifi, Cleaning } from './pages/BuildingPages.jsx'
import { Parking } from './pages/InfoPages.jsx'

export default function App() {
  const parseHash = () => {
    const raw = window.location.hash.replace('#','') || 'home'
    const [tab, subtab] = raw.split('~')
    return { tab, subtab: subtab || null }
  }

  const [activeTab, setActiveTab] = useState(() => parseHash().tab)
  const [activeSubtab, setActiveSubtab] = useState(() => parseHash().subtab)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const onHash = () => {
      const { tab, subtab } = parseHash()
      setActiveTab(tab)
      setActiveSubtab(subtab)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const handleTabChange = (tab) => {
    setActiveTab(tab.split('~')[0])
    setActiveSubtab(tab.split('~')[1] || null)
    window.location.hash = tab
  }

  const pages = {
    'home':           <Home onNavigate={handleTabChange} />,
    'vaad-notices':   <VaadNotices />,
    'requests':       <Requests />,
    'contacts':       <ContactsPage initialTab={activeSubtab} />,
    'parking':        <Parking />,
    'residents-room': <ResidentsRoomCalendar />,
    'cleaning':       <Cleaning />,
    'wifi':           <Wifi />,
    'pros':           <Pros />,
    'contractors':    <Contractors />,
    'general-info':     <GeneralInfoPage />,
    'emergency':        <Emergency />,
    'admin':            <Admin />,
    'update-profile':   <UpdateProfile />,
    'documents':        <DocumentsPage />,
  }

  return (
    <>
      <div className="topbar">
        <button className={`hamburger${sidebarOpen ? ' open' : ''}`}
          onClick={() => setSidebarOpen(o => !o)} aria-label="תפריט">
          <span/><span/><span/>
        </button>
        <div className="topbar-title" onClick={() => handleTabChange('home')} style={{cursor:'pointer'}}>
          שי עגנון <span>12 ו-14</span>
        </div>
      </div>

      <div className={`overlay${sidebarOpen ? ' show' : ''}`} onClick={() => setSidebarOpen(false)} />

      <div className="layout">
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange}
          isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="main">
          {Object.entries(pages).map(([id, component]) => (
            <section key={id} id={id} className={`tab-panel${activeTab === id ? ' active' : ''}`}>
              {activeTab === id && component}
            </section>
          ))}
          <footer className="site-footer">כל הזכויות שמורות © ארז ברון 2026</footer>
        </main>
      </div>
    </>
  )
}
