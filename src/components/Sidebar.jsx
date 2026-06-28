import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MessageSquarePlus, Trash2, LogOut, User } from 'lucide-react'
import useAuth from '../hooks/useAuth'
import useChat from '../hooks/useChat'

const Sidebar = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user, logout } = useAuth()
  const { chats, fetchChats, createChat, deleteChat } = useChat()

  useEffect(() => {
    fetchChats()
  }, [])

  const handleNewChat = async () => {
    const chat = await createChat(user?.defaultResponseStyle || 'gentle')
    navigate(`/chat/${chat._id}`)
  }

  const handleDelete = async (e, chatId) => {
    e.stopPropagation()
    await deleteChat(chatId)
    if (id === chatId) navigate('/chat')
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const regularChats = chats.filter(c => !c.isPractice)
  const practiceChats = chats.filter(c => c.isPractice)

  return (
    <div style={{
      width: '256px', minWidth: '256px', height: '100vh',
      backgroundColor: '#111111', borderRight: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', flexDirection: 'column', flexShrink: 0
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: 'white' }}>V</div>
        <span style={{ fontWeight: '600', color: 'white' }}>Vela</span>
      </div>

      {/* Actions */}
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={handleNewChat}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', backgroundColor: '#9333ea', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
        >
          <MessageSquarePlus size={16} />
          New Chat
        </button>
        <button
          onClick={() => navigate('/practice')}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', backgroundColor: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.2)', borderRadius: '12px', color: '#f472b6', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
        >
          🎭 Practice Mode
        </button>
      </div>

      {/* Chat History */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>

        {/* Regular chats */}
        {regularChats.length > 0 && (
          <>
            <p style={{ fontSize: '11px', color: '#4b5563', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '8px 4px 4px' }}>Chats</p>
            {regularChats.map(chat => (
              <ChatItem key={chat._id} chat={chat} activeId={id} onNavigate={navigate} onDelete={handleDelete} />
            ))}
          </>
        )}

        {/* Practice chats */}
        {practiceChats.length > 0 && (
          <>
            <p style={{ fontSize: '11px', color: '#4b5563', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 4px 4px' }}>🎭 Practice</p>
            {practiceChats.map(chat => (
              <ChatItem key={chat._id} chat={chat} activeId={id} onNavigate={navigate} onDelete={handleDelete} />
            ))}
          </>
        )}

        {chats.length === 0 && (
          <p style={{ fontSize: '12px', color: '#4b5563', textAlign: 'center', marginTop: '16px' }}>No chats yet</p>
        )}
      </div>

      {/* User */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={14} color="#a855f7" />
          </div>
          <span style={{ fontSize: '14px', color: '#9ca3af', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</span>
        </div>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '6px' }}
          onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
          onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
        >
          <LogOut size={15} />
        </button>
      </div>
    </div>
  )
}

const ChatItem = ({ chat, activeId, onNavigate, onDelete }) => (
  <div
    onClick={() => onNavigate(`/chat/${chat._id}`)}
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '12px', cursor: 'pointer', backgroundColor: activeId === chat._id ? 'rgba(255,255,255,0.1)' : 'transparent' }}
    onMouseEnter={e => { if (activeId !== chat._id) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)' }}
    onMouseLeave={e => { if (activeId !== chat._id) e.currentTarget.style.backgroundColor = 'transparent' }}
  >
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: '13px', color: '#d1d5db', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.title}</p>
      <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{new Date(chat.updatedAt).toLocaleDateString()}</p>
    </div>
    <button
      onClick={(e) => onDelete(e, chat._id)}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px', opacity: 0 }}
      onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = '#f87171' }}
      onMouseLeave={e => { e.currentTarget.style.opacity = 0; e.currentTarget.style.color = '#6b7280' }}
    >
      <Trash2 size={13} />
    </button>
  </div>
)

export default Sidebar