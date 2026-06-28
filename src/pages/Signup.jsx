import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import toast from 'react-hot-toast'

const Signup = () => {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await signup(form.name, form.email, form.password)
      navigate('/onboarding')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">V</div>
          <span className="font-semibold text-lg">Vela</span>
        </div>
        <h2 className="text-2xl font-bold text-center mb-2">Create your account</h2>
        <p className="text-gray-400 text-center text-sm mb-8">Start getting clarity today</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 transition-colors"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 transition-colors"
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 transition-colors"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl py-3 text-sm font-medium transition-colors"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300">Log in</Link>
        </p>
      </div>
    </div>
  )
}

export default Signup