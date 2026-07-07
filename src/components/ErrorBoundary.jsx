import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Vela crashed:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', backgroundColor: '#08080b', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '24px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '24px', fontWeight: '700' }}>Something went wrong</h1>
          <p style={{ color: '#9ca3af', fontSize: '14px', maxWidth: '360px' }}>Try refreshing the page. If this keeps happening, clear your cookies and log in again.</p>
          <button onClick={() => { window.location.href = '/' }} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #9333ea, #7c3aed)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Back to home</button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary