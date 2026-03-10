import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Home from './pages/Home.jsx'
import Manage from './pages/Manage.jsx'
import Requests from './pages/Requests.jsx'
import Admin from './pages/Admin.jsx'
import Emergency from './pages/Emergency.jsx'
import ResidentsRoomCalendar from './pages/ResidentsRoomCalendar.jsx'
import Contractors from './pages/Contractors.jsx'
import Pros from './pages/Pros.jsx'
import {
  Boni, Vaad, VaadNotices, Wifi, Cleaning, Trash
} from './pages/BuildingPages.jsx'
import {
  Parking, Details, Arnona, Whatsapp, AC, ResidentsRoom
} from './pages/InfoPages.jsx'

const pages = {
  'home':           <Home />,
  'manage':         <Manage />,
  'requests':       <Requests />,
  'admin':          <Admin />,
  'vaad':           <Vaad />,
  'vaad-notices':   <VaadNotices />,
  'boni':           <Boni />,
  'wifi':           <Wifi />,
  'cleaning':       <Cleaning />,
  'trash':          <Trash />,
  'parking':        <Parking />,
  'details':        <Details />,
  'pros':           <Pros />,
  'arnona':         <Arnona />,
  'contractors':    <Contractors />,
  'whatsapp':       <Whatsapp />,
  'ac':             <AC />,
  'emergency':      <Emergency />,
  'residents-room': <ResidentsRoomCalendar />,
}

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    return window.location.hash.replace('#','') || 'home'
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const onHash = () => {
      const tab = window.location.hash.replace('#','') || 'home'
      setActiveTab(tab)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    window.location.hash = tab
  }

  return (
    <>
      {/* Mobile topbar */}
      <div className="topbar">
        <button
          className={`hamburger${sidebarOpen ? ' open' : ''}`}
          onClick={() => setSidebarOpen(o => !o)}
          aria-label="תפריט"
        >
          <span/><span/><span/>
        </button>
        <div
          className="topbar-title"
          onClick={() => handleTabChange('home')}
          style={{cursor:'pointer'}}
        >שי עגנון <span>12 ו-14</span></div>
      </div>

      {/* Overlay */}
      <div
        className={`overlay${sidebarOpen ? ' show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="layout">
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="main">
          {Object.entries(pages).map(([id, component]) => (
            <section
              key={id}
              id={id}
              className={`tab-panel${activeTab === id ? ' active' : ''}`}
            >
              {activeTab === id && component}
            </section>
          ))}
          <footer className="site-footer">כל הזכויות שמורות © ארז ברון 2026</footer>
        </main>
      </div>
    </>
  )
}
