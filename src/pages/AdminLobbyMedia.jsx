import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase.js'

const btn = (extra = {}) => ({
  fontFamily: 'Heebo, sans-serif', border: 'none', borderRadius: '8px',
  padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
  transition: 'all 0.15s', ...extra,
})

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function AdminLobbyMedia() {
  const [building, setBuilding] = useState(12)
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [deleting, setDeleting] = useState(null)
  const fileRef = useRef()

  useEffect(() => { load() }, [building])

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('lobby_media')
      .select('*')
      .eq('building', building)
      .order('sort_order').order('created_at')
    setMedia(data || [])
    setLoading(false)
  }

  const upload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)

    for (const file of files) {
      const isVideo = file.type.startsWith('video/')
      const isImage = file.type.startsWith('image/')
      if (!isVideo && !isImage) continue

      setUploadProgress(`מעלה: ${file.name}`)
      const ext = file.name.split('.').pop().toLowerCase()
      const safeName = `${building}/${Date.now()}.${ext}`

      const { error: upErr } = await supabase.storage
        .from('lobby-media').upload(safeName, file, { contentType: file.type })
      if (upErr) { console.error(upErr); continue }

      const { data: urlData } = supabase.storage
        .from('lobby-media').getPublicUrl(safeName)

      await supabase.from('lobby_media').insert([{
        building,
        type: isVideo ? 'video' : 'image',
        file_url: urlData.publicUrl,
        file_name: file.name,
        duration: isVideo ? 0 : 8,
        sort_order: media.length + 1,
        active: true,
      }])
    }

    setUploading(false)
    setUploadProgress('')
    if (fileRef.current) fileRef.current.value = ''
    await load()
  }

  const deleteItem = async (item) => {
    if (!confirm(`למחוק "${item.file_name}"?`)) return
    setDeleting(item.id)
    const pathPart = item.file_url.split('/lobby-media/')[1]
    if (pathPart) await supabase.storage.from('lobby-media').remove([pathPart])
    await supabase.from('lobby_media').delete().eq('id', item.id)
    setMedia(m => m.filter(x => x.id !== item.id))
    setDeleting(null)
  }

  const toggleActive = async (item) => {
    await supabase.from('lobby_media').update({ active: !item.active }).eq('id', item.id)
    setMedia(m => m.map(x => x.id === item.id ? { ...x, active: !x.active } : x))
  }

  const updateDuration = async (item, val) => {
    const dur = parseInt(val) || 8
    await supabase.from('lobby_media').update({ duration: dur }).eq('id', item.id)
    setMedia(m => m.map(x => x.id === item.id ? { ...x, duration: dur } : x))
  }

  const moveOrder = async (item, dir) => {
    const sorted = [...media]
    const idx = sorted.findIndex(x => x.id === item.id)
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    const a = sorted[idx], b = sorted[swapIdx]
    await supabase.from('lobby_media').update({ sort_order: b.sort_order }).eq('id', a.id)
    await supabase.from('lobby_media').update({ sort_order: a.sort_order }).eq('id', b.id)
    await load()
  }

  const activeCount = media.filter(m => m.active).length

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--primary)' }}>
          📺 מדיה למסך לובי
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <a href={`#lobby-${building}`} target="_blank" rel="noopener"
            style={btn({ background: '#1B3A5C', color: 'white', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' })}>
            👁 תצוגה מקדימה
          </a>
        </div>
      </div>

      {/* Building tabs */}
      <div className="ctab-bar" style={{ marginBottom: '16px' }}>
        {[12, 14].map(b => (
          <button key={b} className={`ctab-btn${building === b ? ' active' : ''}`}
            onClick={() => setBuilding(b)}>
            לובי עגנון {b}
          </button>
        ))}
      </div>

      {/* Upload area */}
      <div style={{
        background: '#f7f9ff', border: '2px dashed #c4d4f0', borderRadius: '14px',
        padding: '24px', textAlign: 'center', marginBottom: '20px',
        cursor: 'pointer',
      }}
        onClick={() => fileRef.current?.click()}
      >
        <div style={{ fontSize: '28px', marginBottom: '8px' }}>📁</div>
        <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--primary)', marginBottom: '4px' }}>
          {uploading ? uploadProgress : 'גרור קבצים או לחץ להעלאה'}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
          תמונות (JPG, PNG, WebP) · וידאו (MP4, MOV) · ניתן לבחור כמה קבצים יחד
        </div>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={upload}
          style={{ display: 'none' }}
        />
        {uploading && (
          <div style={{ marginTop: '12px', height: '4px', background: '#e4edf8', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--primary)', borderRadius: '2px', animation: 'progressPulse 1.5s ease infinite' }} />
          </div>
        )}
      </div>

      {/* Stats */}
      {media.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', fontSize: '12px', color: 'var(--muted)' }}>
          <span>{media.length} פריטים סה"כ</span>
          <span>·</span>
          <span style={{ color: '#1a7a3a' }}>{activeCount} פעילים</span>
          {media.length - activeCount > 0 && <>
            <span>·</span>
            <span style={{ color: '#e05555' }}>{media.length - activeCount} מוסתרים</span>
          </>}
        </div>
      )}

      {/* Media list */}
      {loading && <div style={{ color: 'var(--muted)', padding: '20px', textAlign: 'center' }}>טוען...</div>}

      {!loading && media.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px', fontSize: '14px' }}>
          אין מדיה עדיין. העלה קבצים למעלה.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {media.map((item, idx) => (
          <div key={item.id} style={{
            background: item.active ? 'white' : '#f7f5f1',
            border: `1.5px solid ${item.active ? 'var(--border)' : '#e0dbd4'}`,
            borderRadius: '12px', padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: '12px',
            opacity: item.active ? 1 : 0.6,
            transition: 'all 0.15s',
          }}>
            {/* Thumbnail / icon */}
            <div style={{
              width: '56px', height: '40px', borderRadius: '8px',
              overflow: 'hidden', flexShrink: 0,
              background: '#f0ede8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {item.type === 'image' ? (
                <img src={item.file_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '20px' }}>🎬</span>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text)', marginBottom: '2px',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.file_name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ background: item.type === 'video' ? '#e8f4fd' : '#e8f9ee',
                  color: item.type === 'video' ? '#1a5c8c' : '#1a6b3a',
                  padding: '1px 7px', borderRadius: '100px', fontWeight: '700', fontSize: '10px' }}>
                  {item.type === 'video' ? '🎬 וידאו' : '🖼️ תמונה'}
                </span>
                {item.type === 'image' && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ⏱
                    <input
                      type="number" min="3" max="60"
                      value={item.duration}
                      onChange={e => updateDuration(item, e.target.value)}
                      style={{ width: '44px', padding: '2px 6px', borderRadius: '6px',
                        border: '1px solid var(--border)', fontSize: '12px',
                        fontFamily: 'Heebo, sans-serif', textAlign: 'center' }}
                    />
                    <span>שניות</span>
                  </span>
                )}
                {item.type === 'video' && <span>וידאו — עד סיום</span>}
              </div>
            </div>

            {/* Order buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button onClick={() => moveOrder(item, -1)} disabled={idx === 0}
                style={btn({ background: '#f0ede8', color: 'var(--muted)', padding: '3px 8px', opacity: idx === 0 ? 0.3 : 1 })}>▲</button>
              <button onClick={() => moveOrder(item, 1)} disabled={idx === media.length - 1}
                style={btn({ background: '#f0ede8', color: 'var(--muted)', padding: '3px 8px', opacity: idx === media.length - 1 ? 0.3 : 1 })}>▼</button>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              <button onClick={() => toggleActive(item)}
                title={item.active ? 'הסתר' : 'הצג'}
                style={btn({ background: item.active ? '#e8f9ee' : '#f0ede8', color: item.active ? '#1a6b3a' : 'var(--muted)', padding: '7px 10px' })}>
                {item.active ? '👁' : '🙈'}
              </button>
              <a href={item.file_url} target="_blank" rel="noopener"
                style={btn({ background: '#e4edf8', color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', padding: '7px 10px' })}>
                ↗
              </a>
              <button onClick={() => deleteItem(item)} disabled={deleting === item.id}
                style={btn({ background: '#fdf0f0', color: '#e05555', padding: '7px 10px' })}>
                {deleting === item.id ? '...' : '🗑️'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes progressPulse {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  )
}
