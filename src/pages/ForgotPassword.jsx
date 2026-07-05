import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState('email') // email | code | password
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      toast.success('Reset code sent!')
      setStep('code')
    } catch {
      toast.error('Failed to send reset code')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { email, code, newPassword })
      toast.success('Password reset! Please log in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f0f0f', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', margin: '0 auto 16px' }}>V</div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>
            {step === 'email' ? 'Forgot password?' : step === 'code' ? 'Enter your code' : 'New password'}
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            {step === 'email' ? "We'll send a reset code to your email" : step === 'code' ? `Code sent to ${email}` : 'Choose a new password'}
          </p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none' }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '13px', background: 'linear-gradient(135deg, #9333ea, #7c3aed)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
            >
              {loading ? 'Sending...' : 'Send reset code'}
            </button>
          </form>
        )}

        {step === 'code' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              placeholder="6-digit code"
              value={code}
              onChange={e => setCode(e.target.value)}
              maxLength={6}
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', fontSize: '18px', fontWeight: '700', letterSpacing: '6px', outline: 'none', textAlign: 'center' }}
            />
            <input
              type="password"
              placeholder="New password (min 6 chars)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none' }}
            />
            <button
              onClick={handleReset}
              disabled={loading || !code || !newPassword}
              style={{ padding: '13px', background: 'linear-gradient(135deg, #9333ea, #7c3aed)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
            >
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6b7280' }}>
          <Link to="/login" style={{ color: '#a855f7', textDecoration: 'none' }}>← Back to login</Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword