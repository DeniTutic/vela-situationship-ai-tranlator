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

const Onboarding = () => {
  const navigate = useNavigate()
  const { completeOnboarding } = useAuth()
  const [step, setStep] = useState(0)

  const handleFinish = async () => {
    try {
      await api.patch('/auth/onboarding')
    } catch (err) {
      console.error(err)
    } finally {
      completeOnboarding()
      navigate('/chat')
    }
  }

  const handleNext = () => {
    if (step < SLIDES.length - 1) {
      setStep(step + 1)
    } else {
      handleFinish()
    }
  }

  const slide = SLIDES[step]

  return (
    <div style={{ height: '100vh', backgroundColor: '#0f0f0f', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative' }}>
      {/* Skip */}
      <button
        onClick={handleFinish}
        style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#4b5563', fontSize: '14px', cursor: 'pointer' }}
      >
        Skip
      </button>

      {/* Slide */}
      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        <div style={{ fontSize: '72px', lineHeight: 1 }}>{slide.emoji}</div>
        <h1 style={{ fontSize: '32px', fontWeight: '700', lineHeight: 1.2 }}>{slide.title}</h1>
        <p style={{ fontSize: '16px', color: '#9ca3af', lineHeight: 1.7, maxWidth: '380px' }}>{slide.subtitle}</p>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '48px' }}>
        {SLIDES.map((_, i) => (
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
        style={{ marginTop: '32px', padding: '14px 48px', backgroundColor: '#9333ea', border: 'none', borderRadius: '14px', color: 'white', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
      >
        {step === SLIDES.length - 1 ? "Let's go 💜" : 'Next'}
      </button>
    </div>
  )
}

export default Onboarding