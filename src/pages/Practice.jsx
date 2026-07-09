import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import useChat from '../hooks/useChat'
 
const MODES = [
  { key: 'easy', label: '😊 Easy', desc: 'They are cooperative and understanding' },
  { key: 'realistic', label: '😐 Realistic', desc: 'They react how they probably would' },
  { key: 'hard', label: '😤 Hard', desc: 'They are defensive and dismissive' },
  { key: 'worst', label: '💀 Worst Case', desc: 'Prepares you for absolutely anything' },
]
 
const Practice = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createChat, practiceLimit, setPracticeLimit } = useChat()
  const [target, setTarget] = useState('')
  const [mode, setMode] = useState('realistic')
  const [voiceGender, setVoiceGender] = useState('female')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
 
  const isPro = ['plus', 'pro'].includes(user?.subscriptionStatus)
  const freePracticeLimit = 2
 
  const handleStart = async () => {
    if (!target.trim()) return
    setLoading(true)
    setError('')
    try {
      const chat = await createChat(
        user?.defaultResponseStyle || 'gentle',
        true,
        target,
        mode
      )
      navigate(`/chat/${chat._id}`, { state: { voiceGender } })
    } catch (err) {
      if (err.response?.status === 429) {
        setError('practice_limit')
      }
    } finally {
      setLoading(false)
    }
  }
 
  if (error === 'practice_limit') {
    return (
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0f0f0f', color: 'white', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ maxWidth: '420px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '64px' }}>🎭</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Practice limit reached</h2>
          <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: 1.6 }}>
            Free users get <strong style={{ color: 'white' }}>2 practice sessions</strong>. Upgrade to Vela+ for unlimited practice, all difficulty modes, and full debrief scoring.
          </p>
          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <button
              onClick={() => navigate('/chat')}
              style={{ flex: 1, padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}
            >
              Back to chats
            </button>
            <button
              onClick={() => navigate('/pricing')}
              style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #9333ea, #ec4899)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
            >
              Upgrade ✨
            </button>
          </div>
        </div>
      </div>
    )
  }
 
  return (
    <div className="practice-layout" style={{ display: 'flex', height: '100vh', backgroundColor: '#0f0f0f', color: 'white', overflowY: 'auto' }}>
      <style>{`
        @media (max-width: 768px) {
          .practice-layout { flex-direction: column; height: auto; min-height: 100vh; }
          .practice-sidebar {
            width: 100% !important; min-width: 0 !important; height: auto !important;
            border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.05);
            display: flex !important; flex-direction: row !important; align-items: center !important;
            justify-content: space-between !important; gap: 12px; padding: 14px 16px !important;
          }
          .practice-upgrade-card { margin-top: 0 !important; flex-shrink: 0; }
          .practice-main { padding: 24px 20px !important; }
        }
      `}</style>
 
      <div className="practice-sidebar" style={{ width: '256px', minWidth: '256px', height: '100vh', backgroundColor: '#111111', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '20px 16px' }}>
        <button
          onClick={() => navigate('/chat')}
          style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px', padding: '8px', borderRadius: '8px' }}
        >
          ← Back to chats
        </button>
 
        {!isPro && (
          <div className="practice-upgrade-card" style={{ marginTop: '24px', padding: '12px', backgroundColor: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)', borderRadius: '10px', maxWidth: '260px' }}>
            <p style={{ fontSize: '12px', color: '#a855f7', fontWeight: '600', marginBottom: '4px' }}>Free Plan</p>
            <p style={{ fontSize: '11px', color: '#6b7280', lineHeight: 1.5 }}>
              {freePracticeLimit} practice sessions included. Upgrade for unlimited.
            </p>
            <button
              onClick={() => navigate('/pricing')}
              style={{ marginTop: '8px', width: '100%', padding: '6px', backgroundColor: '#9333ea', border: 'none', borderRadius: '6px', color: 'white', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
            >
              Upgrade ✨
            </button>
          </div>
        )}
      </div>
 
      <div className="practice-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>🎭 Practice Mode</h1>
            <p style={{ color: '#6b7280', fontSize: '15px' }}>Practice a real conversation before you have it. AI becomes the person, then gives you a full debrief.</p>
          </div>
 
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500' }}>Who do you need to talk to?</label>
            <input
              value={target}
              onChange={e => setTarget(e.target.value)}
              placeholder="e.g. my ex, my crush, my best friend, my boss..."
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>
 
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500' }}>Their voice</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setVoiceGender('female')}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                  border: voiceGender === 'female' ? '1px solid #9333ea' : '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: voiceGender === 'female' ? 'rgba(147,51,234,0.15)' : 'rgba(255,255,255,0.03)',
                  color: voiceGender === 'female' ? 'white' : '#9ca3af'
                }}
              >♀ Female</button>
              <button
                onClick={() => setVoiceGender('male')}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                  border: voiceGender === 'male' ? '1px solid #9333ea' : '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: voiceGender === 'male' ? 'rgba(147,51,234,0.15)' : 'rgba(255,255,255,0.03)',
                  color: voiceGender === 'male' ? 'white' : '#9ca3af'
                }}
              >♂ Male</button>
            </div>
          </div>
 
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500' }}>Difficulty</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {MODES.map(m => {
                const isLocked = (m.key === 'hard' || m.key === 'worst') && !isPro
                return (
                  <button
                    key={m.key}
                    onClick={() => isLocked ? navigate('/pricing') : setMode(m.key)}
                    style={{
                      padding: '12px 16px', borderRadius: '12px', cursor: 'pointer',
                      border: mode === m.key ? '1px solid #9333ea' : '1px solid rgba(255,255,255,0.08)',
                      backgroundColor: mode === m.key ? 'rgba(147,51,234,0.15)' : isLocked ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.03)',
                      color: isLocked ? '#4b5563' : 'white', textAlign: 'left',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>{m.label}</span>
                      <span style={{ fontSize: '12px', color: isLocked ? '#374151' : '#6b7280' }}>{m.desc}</span>
                    </div>
                    {isLocked && <span style={{ fontSize: '16px' }}>🔒</span>}
                  </button>
                )
              })}
            </div>
          </div>
 
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