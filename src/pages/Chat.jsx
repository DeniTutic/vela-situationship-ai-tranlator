import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ChatBubble from '../components/ChatBubble'
import InputBar from '../components/InputBar'
import useChat from '../hooks/useChat'
import api from '../utils/api'

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

  const handleStyleChange = async (style) => {
    if (!activeChat) return
    try {
      await api.patch(`/chat/${activeChat._id}/style`, { responseStyle: style })
      await loadChat(activeChat._id)
    } catch (err) {
      console.error(err)
    }
  }

  const displayMessages = messages.length === 0 ? [WELCOME_MESSAGE] : messages

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0f0f0f', color: 'white', overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <h2 style={{ fontSize: '14px', fontWeight: '500', color: '#d1d5db', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeChat?.title || 'New Chat'}
          </h2>
          {activeChat && (
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              {['gentle', 'analytical', 'brutal', 'hype', 'therapist'].map(style => (
                <button
                  key={style}
                  onClick={() => handleStyleChange(style)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: '500',
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: activeChat.responseStyle === style ? '#9333ea' : 'rgba(255,255,255,0.05)',
                    color: activeChat.responseStyle === style ? 'white' : '#9ca3af',
                  }}
                >
                  {style}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          {!id ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '16px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>V</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600' }}>What's on your mind?</h3>
              <p style={{ color: '#6b7280', fontSize: '14px', maxWidth: '320px' }}>Start a new chat and tell Vela what's going on. No judgment, just clarity.</p>
              <button
                onClick={async () => {
                  const chat = await createChat()
                  navigate(`/chat/${chat._id}`)
                }}
                style={{ padding: '10px 20px', backgroundColor: '#9333ea', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
              >
                Start a new chat
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              {displayMessages.map((msg) => (
                <ChatBubble key={msg._id} message={msg} />
              ))}
              {sending && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', marginRight: '8px', marginTop: '4px', flexShrink: 0 }}>V</div>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '18px 18px 18px 4px' }}>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '16px' }}>
                      <span style={{ width: '6px', height: '6px', backgroundColor: '#a855f7', borderRadius: '50%' }} />
                      <span style={{ width: '6px', height: '6px', backgroundColor: '#a855f7', borderRadius: '50%' }} />
                      <span style={{ width: '6px', height: '6px', backgroundColor: '#a855f7', borderRadius: '50%' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        {id && <InputBar onSend={handleSend} disabled={sending} />}
      </div>
    </div>
  )
}

export default Chat