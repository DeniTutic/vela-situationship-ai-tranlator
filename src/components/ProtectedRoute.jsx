import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0f0f' }}>
      <div style={{ width: '32px', height: '32px', border: '2px solid #a855f7', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (!user) return <Navigate to="/login" />

  if (!user.onboardingCompleted && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" />
  }

  return children
}

export default ProtectedRoute