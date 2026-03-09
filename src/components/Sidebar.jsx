import { navSections } from '../data/navigation.js'

export default function Sidebar({ activeTab, onTabChange, isOpen, onClose }) {
  return (
    <aside className={`sidebar${isOpen ? ' open' : ''}`} id="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-badge">קריית אונו</div>
        <div className="sidebar-title">שי עגנון <span>12 ו-14</span></div>
        <div className="sidebar-sub">מידע לדיירים</div>
      </div>

      <nav className="sidebar-nav">
        {navSections.map(section => (
          <div key={section.label}>
            <div className="nav-section-label">{section.label}</div>
            {section.items.map(item => (
              <button
                key={item.id}
                className={`nav-item${activeTab === item.id ? ' active' : ''}`}
                onClick={() => { onTabChange(item.id); onClose(); }}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}
