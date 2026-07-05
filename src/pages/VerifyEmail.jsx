import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import api from '../utils/api'
import toast from 'react-hot-toast'

const VerifyEmail = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login: setUser } = useAuth()
  const email = location.state?.email || ''
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const inputs = useRef([])

  useEffect(() => {
    if (!email) navigate('/signup')
    inputs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return
    const next = [...code]
    next[i] = val.slice(-1)
    setCode(next)
    if (val && i < 5) inputs.current[i + 1]?.focus()
    if (next.every(d => d) ) handleVerify(next.join(''))
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      inputs.current[i - 1]?.focus()
    }
  }

  const handleVerify = async (fullCode) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/verify-email', { email, code: fullCode || code.join('') })
      setUser && navigate('/onboarding')
      window.location.href = '/onboarding'
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code')
      setCode(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await api.post('/auth/resend-code', { email })
      toast.success('New code sent!')
      setCountdown(60)
      setCode(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    } catch {
      toast.error('Failed to resend')
    } finally {
      setResending(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f0f0f', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', margin: '0 auto 24px' }}>V</div>
        
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Check your email</h1>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '8px' }}>
          We sent a 6-digit code to
        </p>
        <p style={{ color: '#a855f7', fontSize: '14px', fontWeight: '600', marginBottom: '32px' }}>{email}</p>

        {/* Code inputs */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={el => inputs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              style={{
                width: '48px', height: '56px', textAlign: 'center',
                fontSize: '20px', fontWeight: '700',
                backgroundColor: digit ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.05)',
                border: `2px solid ${digit ? '#a855f7' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '12px', color: 'white', outline: 'none',
                transition: 'all 0.15s'
              }}
            />
          ))}
        </div>

        <button
          onClick={() => handleVerify()}
          disabled={loading || code.some(d => !d)}
          style={{
            width: '100%', padding: '14px',
            background: code.every(d => d) ? 'linear-gradient(135deg, #9333ea, #7c3aed)' : 'rgba(255,255,255,0.05)',
            border: 'none', borderRadius: '12px', color: code.every(d => d) ? 'white' : '#4b5563',
            fontSize: '15px', fontWeight: '600', cursor: code.every(d => d) ? 'pointer' : 'default',
            marginBottom: '16px'
          }}
        >
          {loading ? 'Verifying...' : 'Verify email'}
        </button>

        <div style={{ color: '#6b7280', fontSize: '13px' }}>
          Didn't get a code?{' '}
          {countdown > 0 ? (
            <span style={{ color: '#4b5563' }}>Resend in {countdown}s</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
            >
              {resending ? 'Sending...' : 'Resend code'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail