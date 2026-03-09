import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Manage from './pages/Manage.jsx'
import Contractors from './pages/Contractors.jsx'
import Pros from './pages/Pros.jsx'
import {
  Boni, Vaad, VaadNotices, Wifi, Cleaning, Trash
} from './pages/BuildingPages.jsx'
import {
  Parking, Details, Arnona, Whatsapp, AC, ResidentsRoom
} from './pages/InfoPages.jsx'

const pages = {
  'manage':         <Manage />,
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
  'residents-room': <ResidentsRoom />,
}

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    return window.location.hash.replace('#','') || 'manage'
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    window.location.hash = tab
  }

  return (
    <>
      {/* Mobile topbar */}
      <div className="topbar">
        <div className="topbar-title">שי עגנון <span>12 ו-14</span></div>
        <button
          className={`hamburger${sidebarOpen ? ' open' : ''}`}
          onClick={() => setSidebarOpen(o => !o)}
          aria-label="תפריט"
        >
          <span/><span/><span/>
        </button>
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
          {/* Render active page – wrapped in tab-panel div */}
          {Object.entries(pages).map(([id, component]) => (
            <section
              key={id}
              id={id}
              className={`tab-panel${activeTab === id ? ' active' : ''}`}
            >
              {activeTab === id && component}
            </section>
          ))}
        </main>
      </div>
    </>
  )
}
