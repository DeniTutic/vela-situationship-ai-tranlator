import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import api from '../utils/api'
import toast from 'react-hot-toast'
import GoogleButton from '../components/GoogleButton'
import { motion } from 'framer-motion'
 
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
}
 
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
}
 
const inputStyle = { backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none' }
 
const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
 
  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'google_email_unverified') {
      toast.error('Your Google email must be verified to sign in')
    } else if (error === 'google_auth_failed') {
      toast.error('Google sign-in failed. Please try again')
    }
  }, [searchParams])
 
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
      <motion.div variants={staggerContainer} initial="hidden" animate="show" style={{ width: '100%', maxWidth: '380px' }}>
        <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '32px' }}>
          <motion.div
            whileHover={{ scale: 1.08, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', margin: '0 auto 16px', cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >V</motion.div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '6px' }}>Welcome back</h1>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>Log in to your account</p>
        </motion.div>
 
        <motion.div variants={fadeUp}>
          <GoogleButton />
        </motion.div>
 
        <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <span style={{ color: '#6b7280', fontSize: '12px' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
        </motion.div>
 
        <motion.form variants={fadeUp} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
            required style={inputStyle} />
          <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
            required style={inputStyle} />
 
          <div style={{ textAlign: 'right' }}>
            <Link to="/forgot-password" style={{ color: '#9ca3af', fontSize: '13px', textDecoration: 'none' }}>Forgot password?</Link>
          </div>
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            style={{ padding: '13px', background: 'linear-gradient(135deg, #9333ea, #7c3aed)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </motion.button>
        </motion.form>
        <motion.p variants={fadeUp} style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6b7280' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#a855f7', textDecoration: 'none', fontWeight: '600' }}>Sign up</Link>
        </motion.p>
      </motion.div>
    </div>
  )
}
export default Login