import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendSessionCode, signInSession } from '../api'
import { tg, hapticSuccess } from '../telegram'

type Step = 'phone' | 'code' | 'password'

export default function AddSessionPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('+998')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Back button
  useEffect(() => {
    tg?.BackButton?.show()
    const handler = () => {
      if (step === 'code') setStep('phone')
      else if (step === 'password') setStep('code')
      else navigate('/sessions')
    }
    tg?.BackButton?.onClick(handler)
    return () => {
      tg?.BackButton?.hide()
      tg?.BackButton?.offClick(handler)
    }
  }, [navigate, step])

  const handleSendCode = async () => {
    if (phone.length < 12) {
      setError('Telefon raqamni to\'liq kiriting')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await sendSessionCode(phone, name || undefined)
      setSessionId(res.sessionId || res.id)
      setStep('code')
      hapticSuccess()
    } catch (e: any) {
      setError(e.response?.data?.message || 'Kod yuborishda xatolik')
    }
    setLoading(false)
  }

  const handleSignIn = async () => {
    if (step === 'code' && code.length < 5) {
      setError('Kodni to\'liq kiriting')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await signInSession(
        sessionId,
        step === 'code' ? code : undefined,
        step === 'password' ? password : undefined,
      )

      if (res.needPassword || res.status === 'NEED_PASSWORD') {
        setStep('password')
        setLoading(false)
        return
      }

      hapticSuccess()
      navigate('/sessions')
    } catch (e: any) {
      const msg = e.response?.data?.message || ''
      if (msg.includes('password') || msg.includes('2FA') || msg.includes('parol')) {
        setStep('password')
      } else {
        setError(msg || 'Kirishda xatolik')
      }
    }
    setLoading(false)
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Sessiya qo'shish</h1>
      </div>

      {/* Steps indicator */}
      <div className="steps">
        <div className={`step ${step === 'phone' ? 'step-active' : 'step-done'}`}>1. Telefon</div>
        <div className={`step ${step === 'code' ? 'step-active' : step === 'password' ? 'step-done' : ''}`}>2. Kod</div>
        <div className={`step ${step === 'password' ? 'step-active' : ''}`}>3. Parol</div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {step === 'phone' && (
        <div className="form-section">
          <div className="form-group">
            <label className="form-label">Sessiya nomi (ixtiyoriy)</label>
            <input
              className="form-input"
              type="text"
              placeholder="Masalan: Asosiy session"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Telefon raqam</label>
            <input
              className="form-input"
              type="tel"
              placeholder="+998901234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoFocus
            />
          </div>
          <button className="btn btn-primary" onClick={handleSendCode} disabled={loading}>
            {loading ? 'Yuborilmoqda...' : 'Kod yuborish'}
          </button>
        </div>
      )}

      {step === 'code' && (
        <div className="form-section">
          <div className="form-hint">
            Telegram ilovasiga kelgan kodni kiriting
          </div>
          <div className="form-group">
            <label className="form-label">Tasdiqlash kodi</label>
            <input
              className="form-input form-input-code"
              type="text"
              inputMode="numeric"
              placeholder="12345"
              maxLength={7}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              autoFocus
            />
          </div>
          <button className="btn btn-primary" onClick={handleSignIn} disabled={loading}>
            {loading ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
          </button>
        </div>
      )}

      {step === 'password' && (
        <div className="form-section">
          <div className="form-hint">
            Ikki bosqichli parolni kiriting (2FA)
          </div>
          <div className="form-group">
            <label className="form-label">Parol</label>
            <input
              className="form-input"
              type="password"
              placeholder="2FA parol"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          <button className="btn btn-primary" onClick={handleSignIn} disabled={loading}>
            {loading ? 'Tekshirilmoqda...' : 'Kirish'}
          </button>
        </div>
      )}
    </div>
  )
}
