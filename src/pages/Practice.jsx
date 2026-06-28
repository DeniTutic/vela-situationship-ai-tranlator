import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import api from '../utils/api'

const MODES = [
  { key: 'easy', label: '😊 Easy', desc: 'They are cooperative and understanding' },
  { key: 'realistic', label: '😐 Realistic', desc: 'They react how they probably would' },
  { key: 'hard', label: '😤 Hard', desc: 'They are defensive and dismissive' },
  { key: 'worst', label: '💀 Worst Case', desc: 'Prepares you for absolutely anything' },
]

const Practice = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [target, setTarget] = useState('')
  const [mode, setMode] = useState('realistic')
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    if (!target.trim()) return
    setLoading(true)
    try {
      const res = await api.post('/chat/new', {
        responseStyle: user?.defaultResponseStyle || 'gentle',
        isPractice: true,
        practiceTarget: target,
        practiceMode: mode
      })
      navigate(`/chat/${res.data._id}`)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0f0f0f', color: 'white' }}>
      {/* Back */}
      <div style={{ width: '256px', minWidth: '256px', height: '100vh', backgroundColor: '#111111', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '20px 16px' }}>
        <button
          onClick={() => navigate('/chat')}
          style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px', padding: '8px', borderRadius: '8px' }}
        >
          ← Back to chats
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>🎭 Practice Mode</h1>
            <p style={{ color: '#6b7280', fontSize: '15px' }}>Practice a real conversation before you have it. AI becomes the person, then gives you a full debrief.</p>
          </div>

          {/* Who */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500' }}>Who do you need to talk to?</label>
            <input
              value={target}
              onChange={e => setTarget(e.target.value)}
              placeholder="e.g. my ex, my crush, my best friend, my boss..."
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>

          {/* Mode */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500' }}>Difficulty</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {MODES.map(m => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  style={{
                    padding: '12px 16px', borderRadius: '12px', cursor: 'pointer',
                    border: mode === m.key ? '1px solid #9333ea' : '1px solid rgba(255,255,255,0.08)',
                    backgroundColor: mode === m.key ? 'rgba(147,51,234,0.15)' : 'rgba(255,255,255,0.03)',
                    color: 'white', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '2px'
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{m.label}</span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Start */}
          <button
            onClick={handleStart}
            disabled={!target.trim() || loading}
            style={{
              padding: '14px', backgroundColor: target.trim() ? '#9333ea' : 'rgba(255,255,255,0.05)',
              border: 'none', borderRadius: '12px', color: target.trim() ? 'white' : '#4b5563',
              fontSize: '15px', fontWeight: '600', cursor: target.trim() ? 'pointer' : 'default'
            }}
          >
            {loading ? 'Starting...' : 'Start Practice'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Practice