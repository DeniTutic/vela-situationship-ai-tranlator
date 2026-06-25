import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ChatBubble from '../components/ChatBubble'
import InputBar from '../components/InputBar'
import useChat from '../hooks/useChat'

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: "Hey, I'm Vela 💜 What's going on? Tell me everything — I won't judge, I'm just here to help you see things clearly.",
  _id: 'welcome'
}

const Chat = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { activeChat, messages, loadChat, sendMessage, createChat } = useChat()
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (id) loadChat(id)
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (text) => {
    if (!id) return
    setSending(true)
    try {
      await sendMessage(id, text)
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const displayMessages = messages.length === 0 ? [WELCOME_MESSAGE] : messages

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0f0f0f', color: 'white', overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
          <h2 className="text-sm font-medium text-gray-300 truncate">
            {activeChat?.title || 'New Chat'}
          </h2>
          {activeChat && (
            <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full capitalize shrink-0 ml-2">
              {activeChat.responseStyle}
            </span>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {!id ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold">V</div>
              <h3 className="text-xl font-semibold">What's on your mind?</h3>
              <p className="text-gray-500 text-sm max-w-sm">Start a new chat and tell Vela what's going on. No judgment, just clarity.</p>
              <button
                onClick={async () => {
                  const chat = await createChat()
                  navigate(`/chat/${chat._id}`)
                }}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl text-sm font-medium transition-colors"
              >
                Start a new chat
              </button>
            </div>
          ) : (
            <>
              {displayMessages.map((msg) => (
                <ChatBubble key={msg._id} message={msg} />
              ))}
              {sending && (
                <div className="flex justify-start mb-4">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold mr-2 mt-1 shrink-0">V</div>
                  <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1 items-center h-4">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Input */}
        {id && <InputBar onSend={handleSend} disabled={sending} />}
      </div>
    </div>
  )
}

export default Chat