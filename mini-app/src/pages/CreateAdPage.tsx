import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createAd } from '../api'
import { tg, hapticSuccess } from '../telegram'

export default function CreateAdPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Back button
  useEffect(() => {
    tg?.BackButton?.show()
    const handler = () => navigate('/posting')
    tg?.BackButton?.onClick(handler)
    return () => {
      tg?.BackButton?.hide()
      tg?.BackButton?.offClick(handler)
    }
  }, [navigate])

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('Sarlavha kiriting')
      return
    }
    if (!content.trim()) {
      setError('E\'lon matnini kiriting')
      return
    }

    setLoading(true)
    setError('')
    try {
      await createAd({
        title: title.trim(),
        content: content.trim(),
        mediaUrls: [],
        mediaType: 'TEXT',
      })
      hapticSuccess()
      navigate('/posting')
    } catch (e: any) {
      setError(e.response?.data?.message || 'Yaratishda xatolik')
    }
    setLoading(false)
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">E'lon yaratish</h1>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="form-section">
        <div className="form-group">
          <label className="form-label">Sarlavha</label>
          <input
            className="form-input"
            type="text"
            placeholder="E'lon sarlavhasi"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">E'lon matni</label>
          <textarea
            className="form-input form-textarea"
            placeholder="E'lon matnini kiriting..."
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>
          {loading ? 'Yaratilmoqda...' : 'E\'lon yaratish'}
        </button>
      </div>
    </div>
  )
}
