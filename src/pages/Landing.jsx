import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { useEffect } from 'react'

const Landing = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (user) navigate('/chat')
  }, [user])

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">V</div>
          <span className="font-semibold text-lg">Vela</span>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/login')} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
            Log in
          </button>
          <button onClick={() => navigate('/signup')} className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 gap-6">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 text-sm text-purple-400">
          ✨ AI-powered relationship clarity
        </div>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight max-w-3xl">
          Clarity when feelings get
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> complicated</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl">
          Describe what's happening. Vela helps you understand the signals, spot the red flags, and figure out what to say next.
        </p>
        <div className="flex gap-3 mt-2">
          <button onClick={() => navigate('/signup')} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-medium transition-colors">
            Start for free
          </button>
          <button onClick={() => navigate('/login')} className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-colors border border-white/10">
            Log in
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-gray-600 text-sm">
        © 2026 Vela. All rights reserved.
      </div>
    </div>
  )
}

export default Landing