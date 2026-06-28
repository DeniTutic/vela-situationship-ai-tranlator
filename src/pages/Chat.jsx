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
  const { activeChat, messages, loadChat, sendMessage, createChat, limitReached } = useChat()
  const [sending, setSending] = useState(false)
  const [debriefing, setDebriefing] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (id) loadChat(id)
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (id && !sending) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [id, sending])

  const handleSend = async (text) => {
    if (!id) return
    setSending(true)
    try {
      await sendMessage(id, text)
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
      setTimeout(() => inputRef.current?.focus(), 100)
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

  const handleDebrief = async () => {
    if (!id) return
    setDebriefing(true)
    try {
      await sendMessage(id, '[[DEBRIEF_REQUEST]]', 'text')
    } catch (err) {
      console.error(err)
    } finally {
      setDebriefing(false)
    }
  }

  const practiceWelcome = activeChat?.isPractice ? {
    role: 'assistant',
    content: `You're now talking to **${activeChat.practiceTarget}**. Say whatever you need to say — I'll respond as them. Good luck 💪`,
    _id: 'practice-welcome'
  } : WELCOME_MESSAGE

  const displayMessages = messages.length === 0
    ? [practiceWelcome]
    : messages.filter(m => m.content !== '[[DEBRIEF_REQUEST]]')

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0f0f0f', color: 'white', overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <h2 style={{ fontSize: '14px', fontWeight: '500', color: '#d1d5db', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeChat?.title || 'New Chat'}
          </h2>
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' }}>
            {activeChat?.isPractice && (
              <button
                onClick={handleDebrief}
                disabled={debriefing || messages.length === 0}
                style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', border: 'none', backgroundColor: 'rgba(236,72,153,0.2)', color: '#f472b6', marginRight: '8px' }}
              >
                {debriefing ? 'Analyzing...' : '📊 Get Debrief'}
              </button>
            )}
            {!activeChat?.isPractice && activeChat && (
              ['gentle', 'analytical', 'brutal', 'hype', 'therapist'].map(style => (
                <button
                  key={style}
                  onClick={() => handleStyleChange(style)}
                  style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '500', textTransform: 'capitalize', cursor: 'pointer', border: 'none', backgroundColor: activeChat.responseStyle === style ? '#9333ea' : 'rgba(255,255,255,0.05)', color: activeChat.responseStyle === style ? 'white' : '#9ca3af' }}
                >
                  {style}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Rate limit banner */}
        {limitReached && (
          <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', margin: '12px 24px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#f87171' }}>Daily limit reached</p>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>You've used all 10 free messages today. Upgrade for unlimited access.</p>
            </div>
            <button style={{ padding: '8px 16px', backgroundColor: '#9333ea', border: 'none', borderRadius: '8px', color: 'white', fontSize: '13px', fontWeight: '500', cursor: 'pointer', flexShrink: 0, marginLeft: '12px' }}>
              Upgrade
            </button>
          </div>
        )}

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
              {(sending || debriefing) && (
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
        {id && !limitReached && <InputBar ref={inputRef} onSend={handleSend} disabled={sending || debriefing} />}
      </div>
    </div>
  )
}

export default Chat