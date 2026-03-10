import { useState } from 'react'

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic']

function isImage(url) {
  const ext = (url || '').split('.').pop().split('?')[0].toLowerCase()
  return IMAGE_EXTS.includes(ext)
}

export default function FileAttachment({ url, name }) {
  const [lightbox, setLightbox] = useState(false)
  if (!url) return null

  if (isImage(url)) {
    return (
      <>
        <div
          onClick={() => setLightbox(true)}
          style={{
            marginTop: '10px',
            cursor: 'pointer',
            display: 'inline-block',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1.5px solid var(--border)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform='scale(1.02)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.14)' }}
          onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)' }}
        >
          <img
            src={url}
            alt={name || 'תמונה מצורפת'}
            style={{ display: 'block', maxWidth: '220px', maxHeight: '160px', objectFit: 'cover' }}
          />
          <div style={{
            background: 'rgba(0,0,0,0.5)', color: 'white',
            fontSize: '11px', fontWeight: '700', padding: '4px 10px',
            textAlign: 'center',
          }}>🔍 לחץ להגדלה</div>
        </div>

        {/* Lightbox */}
        {lightbox && (
          <div
            onClick={() => setLightbox(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 9999, padding: '20px', boxSizing: 'border-box',
            }}
          >
            <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%' }}>
              <img
                src={url}
                alt={name || 'תמונה'}
                style={{
                  maxWidth: '90vw', maxHeight: '85vh',
                  borderRadius: '12px', display: 'block',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
                }}
              />
              <button
                onClick={() => setLightbox(false)}
                style={{
                  position: 'absolute', top: '-14px', left: '-14px',
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'white', border: 'none', cursor: 'pointer',
                  fontSize: '18px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  fontWeight: '700', color: '#333',
                }}
              >✕</button>
              {name && (
                <div style={{
                  textAlign: 'center', color: 'rgba(255,255,255,0.7)',
                  fontSize: '12px', marginTop: '10px',
                }}>{name}</div>
              )}
            </div>
          </div>
        )}
      </>
    )
  }

  // PDF or other file
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        marginTop: '10px', textDecoration: 'none',
        background: '#fff0f0', border: '1px solid #f0c0c0',
        borderRadius: '9px', padding: '7px 13px',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background='#ffe4e4'}
      onMouseLeave={e => e.currentTarget.style.background='#fff0f0'}
    >
      <div style={{
        background: '#e05555', color: 'white', borderRadius: '6px',
        padding: '3px 6px', fontSize: '10px', fontWeight: '800', letterSpacing: '0.5px',
      }}>PDF</div>
      <span style={{ fontSize: '13px', fontWeight: '600', color: '#c04444' }}>
        {name || 'פתח קובץ'}
      </span>
      <span style={{ fontSize: '14px', color: '#c04444' }}>↗</span>
    </a>
  )
}
