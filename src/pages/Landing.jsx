import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { useEffect, useRef, useState } from 'react'

const useReveal = () => {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

const Reveal = ({ children, delay = 0 }) => {
  const [ref, visible] = useReveal()
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`
    }}>
      {children}
    </div>
  )
}

const testimonials = [
  { name: 'M.', age: '24', text: 'I stopped spiraling over one-word replies. Vela helped me see what I was actually reacting to.' },
  { name: 'J.', age: '29', text: 'It gave me the words when I couldn\'t find them myself. Sent the text and felt good about it.' },
  { name: 'A.', age: '22', text: 'Honestly felt like texting a really perceptive friend at 1am. No judgment, just clarity.' },
  { name: 'K.', age: '31', text: 'It called out a pattern I couldn\'t see myself in. That reframe changed the whole conversation.' },
  { name: 'S.', age: '26', text: 'I use it before every hard text now. Cheaper than therapy for the small stuff.' },
  { name: 'R.', age: '27', text: 'Vela didn\'t just tell me what they meant - it helped me figure out what I actually wanted to say.' }
]

const steps = [
  { n: '01', title: 'Describe what happened', desc: 'Paste the text, explain the situation, or just vent - Vela listens without judgment.' },
  { n: '02', title: 'Vela reads between the lines', desc: 'It picks up on tone, patterns, and what\'s actually being communicated underneath the words.' },
  { n: '03', title: 'Get clarity and a plan', desc: 'Understand what\'s really going on, and get a suggestion for what to say next.' }
]

const problemCards = [
  { title: 'The 2am re-read', desc: 'Reading the same text for the tenth time, looking for a meaning that isn\'t there.' },
  { title: 'The read-with-no-reply', desc: 'Seen at 9:14. Still no answer. Your brain fills in the worst version of why.' },
  { title: 'The mixed signal', desc: 'Warm one day, distant the next. You can\'t tell if it\'s them or you.' }
]

const pricingTiers = [
  { name: 'Free', price: '$0', period: '', desc: 'Get a feel for how Vela reads a conversation.', features: ['Limited messages per day', 'Core translation and clarity', '1 response style'], cta: 'Start for free', featured: false },
  { name: 'Vela+', price: '$7', period: '/mo', desc: 'For when hard conversations come up often.', features: ['Unlimited messages', 'All response styles', 'Practice mode'], cta: 'Get Vela+', featured: true },
  { name: 'VelaPro', price: '$15', period: '/mo', desc: 'Full support for ongoing situations.', features: ['Everything in Vela+', 'Conversation history and patterns', 'Priority responses'], cta: 'Get VelaPro', featured: false }
]

const faqs = [
  { q: 'Is this just ChatGPT with a different name?', a: 'No. Vela is built specifically to read relationship and communication dynamics - tone, patterns, subtext - not general-purpose chat. The prompts, guardrails, and response styles are tuned for this one job.' },
  { q: 'Does this only work for dating, or also friends and family?', a: 'Any relationship where communication gets confusing - partners, situationships, friends, family, even coworkers. If you\'re trying to read between the lines, Vela can help.' },
  { q: 'What happens when I run out of free messages?', a: 'You can wait for your daily reset, or upgrade to Vela+ for unlimited messages. No surprise charges - you choose if and when to upgrade.' },
  { q: 'Who can see what I share with Vela?', a: 'Your conversations are private to your account. We don\'t sell your data or use your conversations to train models on other users\' behalf.' }
]

const words = ['complicated', 'confusing', 'unclear', 'loud']

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'none', border: 'none', padding: '20px 4px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', textAlign: 'left', color: 'white'
        }}
        aria-expanded={open}
      >
        <span style={{ fontSize: '15px', fontWeight: '600', fontFamily: "'Bricolage Grotesque', sans-serif" }}>{q}</span>
        <span style={{ fontSize: '20px', color: '#a855f7', transform: open ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease', flexShrink: 0, marginLeft: '16px' }}>+</span>
      </button>
      <div style={{
        maxHeight: open ? '200px' : '0px', overflow: 'hidden', transition: 'max-height 0.3s ease'
      }}>
        <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.6', padding: '0 4px 20px', margin: 0 }}>{a}</p>
      </div>
    </div>
  )
}

const Landing = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [wordIndex, setWordIndex] = useState(0)

  useEffect(() => {
    if (user) navigate('/chat')
  }, [user])

  useEffect(() => {
    const interval = setInterval(() => setWordIndex(i => (i + 1) % words.length), 2400)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#08080b', color: 'white', fontFamily: "'Inter', sans-serif", overflowX: 'hidden', position: 'relative' }}>
      <style>{`
        @keyframes drift1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(60px,-40px) scale(1.1); } }
        @keyframes drift2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-50px,50px) scale(1.05); } }
        @keyframes scanline { 0% { top: -10%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 110%; opacity: 0; } }
        @keyframes pulseDot { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .decode-card { transition: transform 0.4s ease; }
        .decode-card:hover { transform: rotateX(4deg) rotateY(-3deg) scale(1.01) !important; }
        .feature-card:hover { border-color: rgba(168,85,247,0.4) !important; background: rgba(168,85,247,0.06) !important; }
        .nav-link:hover { color: white !important; }
        .step-card:hover { transform: translateY(-4px); border-color: rgba(168,85,247,0.35) !important; background: rgba(168,85,247,0.05) !important; }
        .steps-wrap { display: flex; flex-direction: column; gap: 20px; align-items: center; }
        .step-arrow { display: none; }
        @media (min-width: 860px) {
          .steps-wrap { flex-direction: row; align-items: stretch; justify-content: center; gap: 0; }
          .step-arrow { display: flex !important; }
        }
        .marquee-track { animation: marquee 32s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
        .pricing-card:hover { border-color: rgba(168,85,247,0.35) !important; transform: translateY(-4px); }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
            scroll-behavior: auto !important;
          }
          .marquee-track { animation: none !important; }
        }
      `}</style>

      {/* Ambient background orbs */}
      <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.18), transparent 70%)', filter: 'blur(40px)', animation: 'drift1 14s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '200px', right: '-150px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.14), transparent 70%)', filter: 'blur(40px)', animation: 'drift2 18s ease-in-out infinite', pointerEvents: 'none' }} />

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 40px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', fontFamily: "'Bricolage Grotesque', sans-serif" }}>V</div>
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: '700', fontSize: '19px' }}>Vela</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="nav-link" onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', padding: '10px 16px', fontSize: '14px', color: '#9ca3af', cursor: 'pointer', transition: 'color 0.2s' }}>Log in</button>
          <button onClick={() => navigate('/signup')} style={{ padding: '10px 18px', fontSize: '14px', fontWeight: '600', background: 'linear-gradient(135deg, #9333ea, #7c3aed)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer' }}>Get started</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ position: 'relative', zIndex: 5, padding: '60px 24px 40px', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: '999px', padding: '7px 16px', fontSize: '13px', color: '#c084fc', marginBottom: '28px', fontFamily: "'Inter', sans-serif" }}>
          ✨ AI-powered relationship clarity
        </div>
        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(38px, 6vw, 68px)', fontWeight: '800', lineHeight: '1.08', margin: '0 0 20px' }}>
          Clarity when feelings get<br />
          <span style={{ position: 'relative', display: 'inline-block', height: '1.1em', width: '100%', textAlign: 'center' }}>
            {words.map((w, i) => (
              <span key={w} style={{
                background: 'linear-gradient(135deg, #c084fc, #f472b6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                position: 'absolute', left: 0, right: 0, top: 0,
                opacity: i === wordIndex ? 1 : 0,
                transition: 'opacity 0.5s ease'
              }}>{w}</span>
            ))}
          </span>
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '17px', lineHeight: '1.6', maxWidth: '520px', margin: '0 auto 16px' }}>
          Describe what's happening. Vela reads between the lines, spots the red flags, and tells you what to say next.
        </p>
        <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          🔒 Your conversations are private and never shared
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '80px' }}>
          <button onClick={() => navigate('/signup')} style={{ padding: '14px 28px', fontSize: '15px', fontWeight: '600', background: 'linear-gradient(135deg, #9333ea, #7c3aed)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer' }}>Start for free</button>
          <button onClick={() => navigate('/login')} style={{ padding: '14px 28px', fontSize: '15px', fontWeight: '600', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', cursor: 'pointer' }}>Log in</button>
        </div>

        {/* Signature: message decode panel */}
        <div style={{ perspective: '1400px' }}>
          <div className="decode-card" style={{
            transform: 'rotateX(6deg) rotateY(-4deg)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px', padding: '28px', maxWidth: '560px', margin: '0 auto',
            position: 'relative', overflow: 'hidden', textAlign: 'left',
            boxShadow: '0 40px 80px -20px rgba(147,51,234,0.35)'
          }}>
            <div style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #c084fc, transparent)', animation: 'scanline 3s ease-in-out infinite' }} />
            <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f87171' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fbbf24' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }} />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px 16px 16px 4px', padding: '14px 18px', fontSize: '14px', color: '#e5e7eb', marginBottom: '16px', maxWidth: '85%' }}>
              "hey, no worries if not, but... are you free later? no pressure lol"
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingLeft: '4px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a855f7', animation: 'pulseDot 1.4s ease infinite' }} />
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a855f7', animation: 'pulseDot 1.4s ease infinite 0.2s' }} />
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a855f7', animation: 'pulseDot 1.4s ease infinite 0.4s' }} />
              <span style={{ fontSize: '11px', color: '#a855f7', fontWeight: '600', letterSpacing: '0.02em' }}>VELA IS TRANSLATING</span>
            </div>
            <div style={{ background: 'linear-gradient(135deg, rgba(147,51,234,0.18), rgba(236,72,153,0.12))', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '16px 16px 4px 16px', padding: '14px 18px', fontSize: '14px', color: '#f3e8ff', marginLeft: 'auto', maxWidth: '85%' }}>
              They want to see you, but they're softening it so rejection won't sting.
            </div>
          </div>
        </div>
      </div>

      {/* Problem section */}
      <div style={{ position: 'relative', zIndex: 5, maxWidth: '900px', margin: '0 auto', padding: '100px 24px 40px' }}>
        <Reveal>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '700', textAlign: 'center', marginBottom: '16px' }}>
            Every good relationship has gotten lost in translation
          </h2>
          <p style={{ color: '#9ca3af', textAlign: 'center', fontSize: '16px', maxWidth: '560px', margin: '0 auto 56px' }}>
            You know the feeling. Vela was built for these exact moments.
          </p>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {problemCards.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.1}>
              <div className="feature-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', height: '100%', transition: 'all 0.3s' }}>
                <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '17px', fontWeight: '700', marginBottom: '8px' }}>{c.title}</h3>
                <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ position: 'relative', zIndex: 5, maxWidth: '1000px', margin: '0 auto', padding: '80px 24px 40px' }}>
        <Reveal>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '700', textAlign: 'center', marginBottom: '56px' }}>
            How Vela helps
          </h2>
        </Reveal>
        <div className="steps-wrap">
          {steps.map((s, i, arr) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center' }}>
              <Reveal delay={i * 0.12}>
                <div className="step-card" style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '18px', padding: '28px', width: '260px', minHeight: '210px',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(147,51,234,0.25), rgba(236,72,153,0.15))',
                    border: '1px solid rgba(168,85,247,0.3)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: '700', fontSize: '16px', color: '#c084fc', marginBottom: '18px'
                  }}>{s.n}</div>
                  <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>{s.title}</h3>
                  <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>{s.desc}</p>
                </div>
              </Reveal>
              {i < arr.length - 1 && (
                <div className="step-arrow" style={{ alignItems: 'center', padding: '0 6px' }}>
                  <svg width="44" height="24" viewBox="0 0 44 24">
                    <line x1="2" y1="12" x2="34" y2="12" stroke="#a855f7" strokeWidth="2" strokeDasharray="6 5" opacity="0.5">
                      <animate attributeName="stroke-dashoffset" from="22" to="0" dur="1s" repeatCount="indefinite" />
                    </line>
                    <path d="M28 6 L38 12 L28 18" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ position: 'relative', zIndex: 5, maxWidth: '100%', margin: '0 auto', padding: '80px 0 40px' }}>
        <Reveal>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: '700', textAlign: 'center', marginBottom: '48px', padding: '0 24px' }}>
            People trust Vela with the hard conversations
          </h2>
        </Reveal>
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '100px', background: 'linear-gradient(90deg, #08080b, transparent)', zIndex: 2, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '100px', background: 'linear-gradient(270deg, #08080b, transparent)', zIndex: 2, pointerEvents: 'none' }} />
          <div className="marquee-track" style={{ display: 'flex', gap: '16px', width: 'max-content', padding: '0 24px' }}>
            {[0, 1].flatMap((dup) =>
              testimonials.map((t, i) => (
                <div key={`${dup}-${i}`} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '22px', width: '300px', flexShrink: 0 }}>
                  <p style={{ fontSize: '14px', color: '#d1d5db', lineHeight: '1.6', marginBottom: '16px' }}>"{t.text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>{t.name}</div>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>Vela user, {t.age}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pricing teaser */}
      <div style={{ position: 'relative', zIndex: 5, maxWidth: '1000px', margin: '0 auto', padding: '80px 24px 40px' }}>
        <Reveal>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '700', textAlign: 'center', marginBottom: '12px' }}>
            Simple pricing
          </h2>
          <p style={{ color: '#9ca3af', textAlign: 'center', fontSize: '15px', marginBottom: '48px' }}>
            Start free. Upgrade only if you need more.
          </p>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', alignItems: 'stretch' }}>
          {pricingTiers.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 0.1}>
              <div className="pricing-card" style={{
                background: tier.featured ? 'linear-gradient(180deg, rgba(147,51,234,0.12), rgba(236,72,153,0.05))' : 'rgba(255,255,255,0.03)',
                border: tier.featured ? '1px solid rgba(168,85,247,0.4)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '18px', padding: '28px', height: '100%', display: 'flex', flexDirection: 'column',
                transition: 'all 0.3s ease', position: 'relative'
              }}>
                {tier.featured && (
                  <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #9333ea, #ec4899)', fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '999px', letterSpacing: '0.03em' }}>MOST POPULAR</span>
                )}
                <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>{tier.name}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '10px' }}>
                  <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '32px', fontWeight: '800' }}>{tier.price}</span>
                  <span style={{ color: '#9ca3af', fontSize: '14px' }}>{tier.period}</span>
                </div>
                <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '20px', minHeight: '36px' }}>{tier.desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  {tier.features.map(f => (
                    <li key={f} style={{ fontSize: '13px', color: '#d1d5db', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ color: '#a855f7', flexShrink: 0 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate('/signup')} style={{
                  padding: '12px', fontSize: '14px', fontWeight: '600', borderRadius: '12px', cursor: 'pointer',
                  background: tier.featured ? 'linear-gradient(135deg, #9333ea, #7c3aed)' : 'rgba(255,255,255,0.06)',
                  border: tier.featured ? 'none' : '1px solid rgba(255,255,255,0.1)', color: 'white'
                }}>{tier.cta}</button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ position: 'relative', zIndex: 5, maxWidth: '700px', margin: '0 auto', padding: '80px 24px 40px' }}>
        <Reveal>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '700', textAlign: 'center', marginBottom: '48px' }}>
            Common questions
          </h2>
        </Reveal>
        <Reveal>
          <div>
            {faqs.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </Reveal>
      </div>

      {/* Final CTA */}
      <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', padding: '100px 24px 60px' }}>
        <Reveal>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '800', marginBottom: '16px' }}>
            Stop guessing. Start knowing.
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '16px', marginBottom: '28px' }}>Free to start. No credit card needed.</p>
          <button onClick={() => navigate('/signup')} style={{ padding: '15px 32px', fontSize: '15px', fontWeight: '600', background: 'linear-gradient(135deg, #9333ea, #7c3aed)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer' }}>Start for free</button>
        </Reveal>
      </div>

      <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', padding: '24px', color: '#4b5563', fontSize: '13px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        © 2026 Vela. All rights reserved.
      </div>
    </div>
  )
}

export default Landing