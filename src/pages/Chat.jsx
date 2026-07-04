import useAuth from '../hooks/useAuth'
import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ChatBubble from '../components/ChatBubble'
import InputBar from '../components/InputBar'
import useChat from '../hooks/useChat'
import api from '../utils/api'
import ReactMarkdown from 'react-markdown'

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: "Hey, I'm Vela 💜 What's going on? Tell me everything — I won't judge, I'm just here to help you see things clearly.",
  _id: 'welcome'
}

const LimitBanner = ({ msUntilReset, onUpgrade }) => {
  const [timeLeft, setTimeLeft] = useState(msUntilReset)

  useEffect(() => {
    if (!timeLeft) return
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1000) {
          clearInterval(interval)
          window.location.reload()
          return 0
        }
        return prev - 1000
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const hours = Math.floor(timeLeft / (1000 * 60 * 60))
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

  return (
    <div style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '12px', margin: '0 24px 12px', padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#f87171' }}>Free limit reached 🔒</p>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            {timeLeft > 0
              ? `Resets in ${hours}h ${minutes}m ${seconds}s — or upgrade for unlimited access`
              : 'Your limit has reset! Refresh to continue.'}
          </p>
        </div>
        <button
          onClick={onUpgrade}
          style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #9333ea, #ec4899)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer', flexShrink: 0, marginLeft: '16px' }}
        >
          Upgrade ✨
        </button>
      </div>
    </div>
  )
}

const Chat = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { activeChat, messages, loadChat, sendMessage, createChat, limitReached, msUntilReset, streamingMessage, setStreamingMessage, fetchChats, setMessages, setLimitReached } = useChat()
  const { user } = useAuth()
  const [sending, setSending] = useState(false)
  const [debriefing, setDebriefing] = useState(false)
  const [showDebriefUpgrade, setShowDebriefUpgrade] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const isPro = ['plus', 'pro'].includes(user?.subscriptionStatus)

  useEffect(() => {
    if (id) loadChat(id)
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingMessage])

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
    if (!isPro) {
      setShowDebriefUpgrade(true)
      return
    }
    setDebriefing(true)
    try {
      await sendMessage(id, '[[DEBRIEF_REQUEST]]', 'text')
    } catch (err) {
      console.error(err)
    } finally {
      setDebriefing(false)
    }
  }

  const handleImageUpload = async (file, caption = '') => {
    if (!id) return
    setSending(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      if (caption) formData.append('caption', caption)
  
      const response = await fetch(`/api/chat/${id}/upload-image`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
  
      if (response.status === 429) {
        setLimitReached(true)
        setSending(false)
        return
      }
  
      const data = await response.json()
      const aiContent = data.message.content
  
      // Load messages first (includes user image message + ai message)
      const chatRes = await api.get(`/chat/${id}`)
      const allMessages = chatRes.data.messages
  
      // Show all messages except the final AI one (we'll stream it)
      const withoutLastAi = allMessages.slice(0, -1)
      setMessages(withoutLastAi)
      setSending(false)
  
      // Stream the AI response character by character
      let displayed = ''
      for (let i = 0; i < aiContent.length; i++) {
        displayed += aiContent[i]
        setStreamingMessage(displayed)
        await new Promise(r => setTimeout(r, 15))
      }
  
      setStreamingMessage('')
      setMessages(allMessages)
      await fetchChats()
    } catch (err) {
      console.error('Image upload failed', err)
      setSending(false)
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

  const freeModes = ['gentle', 'analytical']
  const lockedModes = ['brutal', 'hype', 'therapist']
  const allModes = [...freeModes, ...lockedModes]

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0f0f0f', color: 'white', overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <h2 style={{ fontSize: '14px', fontWeight: '500', color: '#d1d5db', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeChat?.title || 'New Chat'}
          </h2>
        </div>
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' }}>
            {activeChat?.isPractice && (
              <button
                onClick={handleDebrief}
                disabled={debriefing || messages.length === 0}
                style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', border: 'none', backgroundColor: 'rgba(236,72,153,0.2)', color: '#f472b6', marginRight: '8px' }}
              >
                {debriefing ? 'Analyzing...' : '🏁 End & Get Debrief'}
              </button>
            )}
            {!activeChat?.isPractice && activeChat && allModes.map(style => {
              const isLocked = lockedModes.includes(style) && !isPro
              const isActive = activeChat.responseStyle === style
              return (
                <button
                  key={style}
                  onClick={() => isLocked ? navigate('/pricing') : handleStyleChange(style)}
                  style={{
                    padding: '4px 10px', borderRadius: '999px', fontSize: '11px',
                    fontWeight: '500', textTransform: 'capitalize', cursor: 'pointer',
                    border: isLocked ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    backgroundColor: isActive ? '#9333ea' : 'rgba(255,255,255,0.05)',
                    color: isActive ? 'white' : isLocked ? '#4b5563' : '#9ca3af',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  {isLocked && <span style={{ fontSize: '9px' }}>🔒</span>}
                  {style}
                </button>
              )
            })}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'stretch' }}>
              {displayMessages.map((msg) => (
                <ChatBubble key={msg._id} message={msg} />
              ))}

              {/* Streaming message */}
              {streamingMessage && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', marginRight: '8px', marginTop: '4px', flexShrink: 0 }}>V</div>
                  <div style={{ maxWidth: '75%', padding: '12px 16px', borderRadius: '18px 18px 18px 4px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#e5e7eb', fontSize: '14px', lineHeight: '1.6' }}>
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p style={{ margin: '0 0 8px 0' }}>{children}</p>,
                        strong: ({ children }) => <strong style={{ color: 'white', fontWeight: '600' }}>{children}</strong>,
                        ul: ({ children }) => <ul style={{ paddingLeft: '20px', margin: '0 0 8px 0' }}>{children}</ul>,
                        ol: ({ children }) => <ol style={{ paddingLeft: '20px', margin: '0 0 8px 0' }}>{children}</ol>,
                        li: ({ children }) => <li style={{ color: '#d1d5db', marginBottom: '4px' }}>{children}</li>,
                      }}
                    >
                      {streamingMessage}
                    </ReactMarkdown>
                    <span style={{ display: 'inline-block', width: '2px', height: '14px', backgroundColor: '#a855f7', marginLeft: '2px', animation: 'blink 1s infinite' }} />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Limit banner above input */}
        {id && limitReached && (
          <LimitBanner msUntilReset={msUntilReset} onUpgrade={() => navigate('/pricing')} />
        )}

        {/* Input */}
        {id && <InputBar ref={inputRef} onSend={handleSend} onImageUpload={handleImageUpload} disabled={sending || debriefing || limitReached} />}
        </div>

      {/* Debrief upgrade popup */}
      {showDebriefUpgrade && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '32px', maxWidth: '400px', width: '90%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '48px' }}>📊</div>
            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Debrief is a Vela+ feature</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: 1.6 }}>
              Get a full breakdown of your conversation — score, what you did well, what to improve, and a final verdict. Upgrade to unlock.
            </p>
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <button
                onClick={() => setShowDebriefUpgrade(false)}
                style={{ flex: 1, padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}
              >
                Maybe later
              </button>
              <button
                onClick={() => navigate('/pricing')}
                style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #9333ea, #ec4899)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
              >
                Upgrade ✨
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Chat