import { useNavigate } from 'react-router-dom'

const LegalLayout = ({ title, lastUpdated, children }) => {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', color: 'white' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px 100px' }}>
        <div
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '40px', width: 'fit-content' }}
        >
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>V</div>
          <span style={{ fontWeight: '700', fontSize: '18px' }}>Vela</span>
        </div>

        <h1 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: '800', marginBottom: '8px' }}>{title}</h1>
        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '40px' }}>Last updated: {lastUpdated}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', fontSize: '15px', lineHeight: 1.7, color: '#d1d5db' }}>
          {children}
        </div>

        <div style={{ marginTop: '56px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '13px', color: '#4b5563' }}>
          © 2026 Vela. All rights reserved.
        </div>
      </div>
    </div>
  )
}

export const Section = ({ title, children }) => (
  <section>
    <h2 style={{ fontSize: '19px', fontWeight: '700', color: 'white', marginBottom: '10px' }}>{title}</h2>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{children}</div>
  </section>
)

export default LegalLayout
