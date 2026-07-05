import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import api from '../utils/api'
import toast from 'react-hot-toast'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/chat')
    } catch (err) {
      if (err.response?.data?.needsVerification) {
        navigate('/verify-email', { state: { email: form.email } })
        return
      }
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f0f0f', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', margin: '0 auto 16px', cursor: 'pointer' }} onClick={() => navigate('/')}>V</div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '6px' }}>Welcome back</h1>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>Log in to your account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
            required style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none' }} />
          <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
            required style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none' }} />
          
          <div style={{ textAlign: 'right' }}>
            <Link to="/forgot-password" style={{ color: '#9ca3af', fontSize: '13px', textDecoration: 'none' }}>Forgot password?</Link>
          </div>

          <button type="submit" disabled={loading}
            style={{ padding: '13px', background: 'linear-gradient(135deg, #9333ea, #7c3aed)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6b7280' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#a855f7', textDecoration: 'none', fontWeight: '600' }}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}

export default Login