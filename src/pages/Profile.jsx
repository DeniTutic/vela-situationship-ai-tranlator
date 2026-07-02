import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import api from '../utils/api'
import toast from 'react-hot-toast'

const Profile = () => {
  const navigate = useNavigate()
  const { user, logout, refreshUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [loading, setLoading] = useState(false)

  const isPro = ['plus', 'pro'].includes(user?.subscriptionStatus)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await api.patch('/auth/profile', { name })
      await refreshUser()
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0f0f0f', color: 'white' }}>
      {/* Sidebar */}
      <div style={{ width: '256px', minWidth: '256px', height: '100vh', backgroundColor: '#111111', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '20px 16px', gap: '12px' }}>
        <button
          onClick={() => navigate('/chat')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px', padding: '8px', borderRadius: '8px' }}
        >
          ← Back to chats
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: '600', fontSize: '18px' }}>{user?.name}</p>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>{user?.email}</p>
            </div>
          </div>

          {/* Plan */}
          <div style={{ backgroundColor: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#a855f7' }}>
                {user?.subscriptionStatus === 'plus' ? '✨ Vela+' : user?.subscriptionStatus === 'pro' ? '🚀 VelaPro' : '🆓 Free Plan'}
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                {isPro ? 'Unlimited messages' : `${user?.messagesUsedToday || 0}/30 messages used`}
              </p>
            </div>
            {!isPro && (
              <button
                onClick={() => navigate('/pricing')}
                style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #9333ea, #ec4899)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Upgrade ✨
              </button>
            )}
          </div>

          {/* Edit name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: '#9ca3af' }}>Display name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: 'white', fontSize: '14px', outline: 'none' }}
            />
            <button
              onClick={handleSave}
              disabled={loading}
              style={{ padding: '10px', backgroundColor: '#9333ea', border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: '500', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
            >
              {loading ? 'Saving...' : 'Save changes'}
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{ padding: '10px', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '10px', color: '#f87171', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile