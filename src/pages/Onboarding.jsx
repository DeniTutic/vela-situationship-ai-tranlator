import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import api from '../utils/api'

const SLIDES = [
  {
    emoji: '💜',
    title: "You're not alone",
    subtitle: "Millions of people are navigating confusing relationships, mixed signals, and situations they can't figure out. Vela is here to help you make sense of it all."
  },
  {
    emoji: '🔍',
    title: "Tell me what's happening",
    subtitle: "Describe your situation in your own words. Vela will help you understand the signals, spot red flags, and figure out what to say next. No judgment, ever."
  },
  {
    emoji: '🔒',
    title: "Everything stays private",
    subtitle: "Your conversations are yours alone. Vela never shares, stores publicly, or judges what you share. This is a safe space to be completely honest."
  }
]

const CATEGORIES = [
  { key: 'dating', label: '💕 Dating' },
  { key: 'friendship', label: '🤝 Friendship' },
  { key: 'family', label: '👨‍👩‍👧 Family' },
  { key: 'work', label: '💼 Work' }
]

const STYLES = [
  { key: 'gentle', label: 'Gentle', desc: 'Warm, validating, soft honesty' },
  { key: 'analytical', label: 'Analytical', desc: 'Sharp, logical, pattern-focused' }
]

const TOTAL_STEPS = SLIDES.length + 1
const PERSONALIZE_STEP = SLIDES.length

const Onboarding = () => {
  const navigate = useNavigate()
  const { completeOnboarding } = useAuth()
  const [step, setStep] = useState(0)
  const [category, setCategory] = useState(null)
  const [responseStyle, setResponseStyle] = useState('gentle')

  const handleFinish = async () => {
    try {
      await api.patch('/auth/onboarding', { category, defaultResponseStyle: responseStyle })
    } catch (err) {
      console.error(err)
    } finally {
      completeOnboarding()
      navigate('/chat')
    }
  }

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1)
    } else {
      handleFinish()
    }
  }

  const isPersonalizeStep = step === PERSONALIZE_STEP
  const slide = !isPersonalizeStep ? SLIDES[step] : null

  return (
    <div style={{ height: '100vh', backgroundColor: 'var(--bg-elevated)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative' }}>
      {/* Skip */}
      <button
        onClick={handleFinish}
        style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#4b5563', fontSize: '14px', cursor: 'pointer' }}
      >
        Skip
      </button>

      {!isPersonalizeStep ? (
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <div style={{ fontSize: '72px', lineHeight: 1 }}>{slide.emoji}</div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', lineHeight: 1.2 }}>{slide.title}</h1>
          <p style={{ fontSize: '16px', color: '#9ca3af', lineHeight: 1.7, maxWidth: '380px' }}>{slide.subtitle}</p>
        </div>
      ) : (
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px' }}>
          <div style={{ fontSize: '56px', lineHeight: 1 }}>✨</div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', lineHeight: 1.2 }}>Let's personalize Vela</h1>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
            <label style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500' }}>What brings you here?</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {CATEGORIES.map(c => (
                <button
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  style={{
                    padding: '12px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
                    border: category === c.key ? '1px solid #9333ea' : '1px solid rgba(255,255,255,0.08)',
                    backgroundColor: category === c.key ? 'rgba(147,51,234,0.15)' : 'rgba(255,255,255,0.03)',
                    color: 'white'
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
            <label style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500' }}>How should Vela talk to you?</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {STYLES.map(s => (
                <button
                  key={s.key}
                  onClick={() => setResponseStyle(s.key)}
                  style={{
                    padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                    border: responseStyle === s.key ? '1px solid #9333ea' : '1px solid rgba(255,255,255,0.08)',
                    backgroundColor: responseStyle === s.key ? 'rgba(147,51,234,0.15)' : 'rgba(255,255,255,0.03)',
                    display: 'flex', flexDirection: 'column', gap: '2px'
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>{s.label}</span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>{s.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dots */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '40px' }}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            onClick={() => setStep(i)}
            style={{ width: i === step ? '24px' : '8px', height: '8px', borderRadius: '999px', backgroundColor: i === step ? '#9333ea' : 'rgba(255,255,255,0.15)', cursor: 'pointer', transition: 'all 0.3s' }}
          />
        ))}
      </div>

      {/* Button */}
      <button
        onClick={handleNext}
        style={{ marginTop: '28px', padding: '14px 48px', backgroundColor: '#9333ea', border: 'none', borderRadius: '14px', color: 'white', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
      >
        {step === TOTAL_STEPS - 1 ? "Let's go 💜" : 'Next'}
      </button>
    </div>
  )
}

export default Onboarding