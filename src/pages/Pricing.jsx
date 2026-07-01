import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import useAuth from '../hooks/useAuth'
import api from '../utils/api'

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    color: '#6b7280',
    features: [
      '30 messages every 3 hours',
      '2 practice sessions',
      '3 messages per practice',
      'Gentle & Analytical modes',
      'Basic chat history',
    ],
    locked: [
      'Debrief scoring',
      'Hard & Worst Case modes',
      'Voice & image input',
      'Unlimited practice',
    ],
    cta: 'Downgrade to Free',
    disabled: false
  },
  {
    key: 'plus',
    name: 'Vela+',
    price: '$7',
    period: 'per month',
    color: '#9333ea',
    gradient: 'linear-gradient(135deg, #9333ea, #7c3aed)',
    badge: 'Most Popular',
    features: [
      '150 messages per day',
      'Unlimited practice sessions',
      'All 5 response modes',
      'Hard & Worst Case difficulty',
      'Full debrief with scoring',
      'Image upload & analysis',
      'Voice input',
      'Full chat history',
    ],
    locked: [
      'Enhanced AI responses',
      'Priority speed',
    ],
    cta: 'Upgrade to Vela+',
    disabled: false
  },
  {
    key: 'pro',
    name: 'VelaPro',
    price: '$15',
    period: 'per month',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #9333ea)',
    badge: 'Best Experience',
    features: [
      'Unlimited messages',
      'Everything in Vela+',
      'Enhanced AI responses',
      'Deeper debrief analysis',
      'Pattern recognition across chats',
      'Voice output (Vela speaks back)',
      'Priority response speed',
      'Early access to new features',
    ],
    locked: [],
    cta: 'Upgrade to VelaPro',
    disabled: false
  }
]

const Pricing = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, refreshUser } = useAuth()
  const [successMsg, setSuccessMsg] = useState('')
  const [refreshed, setRefreshed] = useState(false)

  useEffect(() => {
    const init = async () => {
      await refreshUser()
      setRefreshed(true)
      if (searchParams.get('success') === 'true') {
        setSuccessMsg('🎉 Welcome to Vela+! Your account has been upgraded.')
      }
      if (searchParams.get('canceled') === 'true') {
        setSuccessMsg('Payment canceled — no charge was made.')
      }
    }
    init()
  }, [])

  if (!refreshed) return (
    <div style={{ height: '100vh', backgroundColor: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', border: '2px solid #a855f7', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )
  
  const handleUpgrade = async (plan) => {
    try {
      const res = await api.post('/stripe/create-checkout', { plan })
      window.location.href = res.data.url
    } catch (err) {
      console.error('Checkout failed', err)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f0f0f', color: 'white', padding: '40px 24px' }}>
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '14px', cursor: 'pointer', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        ← Back
      </button>

      {/* Success/cancel message */}
      {successMsg && (
        <div style={{ maxWidth: '600px', margin: '0 auto 32px', padding: '14px 20px', backgroundColor: successMsg.includes('🎉') ? 'rgba(168,85,247,0.1)' : 'rgba(239,68,68,0.08)', border: `1px solid ${successMsg.includes('🎉') ? 'rgba(168,85,247,0.3)' : 'rgba(239,68,68,0.2)'}`, borderRadius: '12px', textAlign: 'center', fontSize: '14px', color: successMsg.includes('🎉') ? '#c084fc' : '#f87171' }}>
          {successMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>V</div>
          <span style={{ fontWeight: '700', fontSize: '18px' }}>Vela</span>
        </div>
        <h1 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '12px' }}>
          Get the clarity you deserve
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px', maxWidth: '480px', margin: '0 auto' }}>
          Start free. Upgrade when you're ready for deeper insights and unlimited conversations.
        </p>
      </div>

      {/* Plans */}
      <div style={{ display: 'flex', gap: '20px', maxWidth: '1000px', margin: '0 auto', alignItems: 'stretch', flexWrap: 'wrap', justifyContent: 'center' }}>
        {PLANS.map(plan => {
          const isCurrentPlan = user?.subscriptionStatus === plan.key

          return (
            <div
              key={plan.key}
              style={{
                flex: '1', minWidth: '280px', maxWidth: '320px',
                backgroundColor: plan.key === 'plus' ? 'rgba(147,51,234,0.08)' : '#111111',
                border: plan.key === 'plus' ? '1px solid rgba(147,51,234,0.4)' : '1px solid rgba(255,255,255,0.06)',
                borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px',
                position: 'relative'
              }}
            >
              {plan.badge && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: plan.gradient, padding: '4px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                  {plan.badge}
                </div>
              )}

              <div>
                <p style={{ fontSize: '13px', fontWeight: '600', color: plan.color, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{plan.name}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '40px', fontWeight: '800' }}>{plan.price}</span>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>{plan.period}</span>
                </div>
              </div>

              <button
                onClick={() => isCurrentPlan ? null : handleUpgrade(plan.key)}
                disabled={isCurrentPlan || plan.key === 'free'}
                style={{
                  padding: '12px', borderRadius: '12px', fontWeight: '600', fontSize: '14px',
                  cursor: isCurrentPlan || plan.key === 'free' ? 'default' : 'pointer', border: 'none',
                  background: isCurrentPlan ? 'rgba(255,255,255,0.05)' : plan.key === 'free' ? 'rgba(255,255,255,0.03)' : plan.gradient || '#374151',
                  color: isCurrentPlan ? '#4b5563' : plan.key === 'free' ? '#374151' : 'white'
                }}
              >
                {isCurrentPlan ? '✓ Current plan' : plan.key === 'free' ? 'Free forever' : plan.cta}
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: '#a855f7', fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>✓</span>
                    <span style={{ fontSize: '13px', color: '#d1d5db', lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
                {plan.locked.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: '#374151', fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>✗</span>
                    <span style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <p style={{ textAlign: 'center', color: '#374151', fontSize: '13px', marginTop: '40px' }}>
        Cancel anytime. No hidden fees. Questions? Contact us at hello@vela.app
      </p>
    </div>
  )
}

export default Pricing