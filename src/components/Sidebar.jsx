import { navSections } from '../data/navigation.js'

export default function Sidebar({ activeTab, onTabChange, isOpen, onClose }) {
  return (
    <aside className={`sidebar${isOpen ? ' open' : ''}`} id="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-badge">פרויקט Ono One</div>
        <div className="sidebar-title">שי עגנון <span>12 ו-14</span></div>
        <div className="sidebar-sub">מידע לדיירים</div>
      </div>

      <nav className="sidebar-nav">
        {navSections.map((section, si) => (
          <div key={si}>
            {section.label && <div className="nav-section-label">{section.label}</div>}
            {section.items.map(item => (
              <button
                key={item.id}
                className={`nav-item${activeTab === item.id ? ' active' : ''}${item.muted ? ' nav-muted' : ''}`}
                onClick={() => { onTabChange(item.id); onClose(); }}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        fontSize: '11px',
        color: 'rgba(255,255,255,0.25)',
        textAlign: 'center',
        flexShrink: 0,
      }}>
        © ארז ברון 2026
      </div>
    </aside>
  )
}
