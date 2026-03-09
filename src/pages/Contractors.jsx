import { contractors } from '../data/contractors.js'

export default function Contractors() {
  return (
    <div className="card" style={{padding:'24px 16px'}}>
      <div className="panel-title" style={{padding:'0 8px'}}>
        <div className="icon">🔧</div>
        קבלנים, ספקים ויועצים
      </div>
      <div style={{overflowX:'auto'}}>
        <table className="contractors-table">
          <thead>
            <tr>
              <th>מס׳</th><th>שם ספק / קבלן</th><th>דיסציפלינה</th>
              <th>איש קשר</th><th>טלפון</th><th>דוא״ל</th>
            </tr>
          </thead>
          <tbody>
            {contractors.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td><strong>{c.name}</strong></td>
                <td>{c.role}</td>
                <td>{c.contact}</td>
                <td><a href={`tel:${c.phone.replace(/-/g,'')}`}>{c.phone}</a></td>
                <td>{c.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
