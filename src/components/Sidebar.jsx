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

  return (
        <div style={{ minWidth: '256px', width: '256px' }} className="h-screen bg-[#111111] border-r border-white/5 flex flex-col shrink-0">      
        <div className="flex items-center gap-2 px-4 py-5 border-b border-white/5">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">V</div>
        <span className="font-semibold">Vela</span>
      </div>

      {/* New Chat */}
      <div className="px-3 py-3">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-2 px-3 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl text-sm font-medium transition-colors"
        >
          <MessageSquarePlus size={16} />
          New Chat
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-3 flex flex-col gap-1">
        {chats.length === 0 && (
          <p className="text-xs text-gray-600 text-center mt-4">No chats yet</p>
        )}
        {chats.map(chat => (
          <div
            key={chat._id}
            onClick={() => navigate(`/chat/${chat._id}`)}
            className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
              id === chat._id ? 'bg-white/10' : 'hover:bg-white/5'
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate text-gray-300">{chat.title}</p>
              <p className="text-xs text-gray-600 mt-0.5">
                {new Date(chat.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={(e) => handleDelete(e, chat._id)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* User */}
      <div className="border-t border-white/5 p-3 flex items-center justify-between">
        <div
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center">
            <User size={14} className="text-purple-400" />
          </div>
          <span className="text-sm text-gray-400 truncate max-w-[120px]">{user?.name}</span>
        </div>
        <button onClick={handleLogout} className="p-1.5 hover:text-red-400 text-gray-600 transition-colors">
          <LogOut size={15} />
        </button>
      </div>
    </div>
  )
}

export default Sidebar