import { createContext, useState } from 'react'
import api from '../utils/api'

export const ChatContext = createContext()

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [limitReached, setLimitReached] = useState(false)
  const [msUntilReset, setMsUntilReset] = useState(null)
  const [practiceLimit, setPracticeLimit] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')

  const fetchChats = async () => {
    const res = await api.get('/chat')
    setChats(res.data)
  }

  const createChat = async (responseStyle = 'gentle', isPractice = false, practiceTarget = '', practiceMode = 'realistic') => {
    try {
      const res = await api.post('/chat/new', { responseStyle, isPractice, practiceTarget, practiceMode })
      setChats(prev => [res.data, ...prev])
      setActiveChat(res.data)
      setMessages([])
      setLimitReached(false)
      return res.data
    } catch (err) {
      if (err.response?.status === 429 && err.response?.data?.practiceLimit) {
        setPracticeLimit(true)
        throw err
      }
      throw err
    }
  }

  const loadChat = async (chatId) => {
    setLoading(true)
    const res = await api.get(`/chat/${chatId}`)
    setActiveChat(res.data.chat)
    setMessages(res.data.messages)
    setLimitReached(false)
    setLoading(false)
  }

  const sendMessage = async (chatId, content, inputType = 'text') => {
    try {
      const userMsg = { role: 'user', content, _id: `temp-${Date.now()}`, inputType }
      setMessages(prev => [...prev, userMsg])
      setStreamingMessage('')

      const response = await fetch(`/api/chat/${chatId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content, inputType })
      })

      if (response.status === 429) {
        setMessages(prev => prev.filter(m => !m._id?.toString().startsWith('temp-')))
        const data = await response.json()
        setLimitReached(true)
        setMsUntilReset(data.msUntilReset || null)
        return
      }

      const contentType = response.headers.get('content-type')

      if (contentType?.includes('application/json')) {
        const data = await response.json()
        const chatRes = await api.get(`/chat/${chatId}`)
        setMessages(chatRes.data.messages)
        await fetchChats()
        return data.message
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.delta) {
                accumulated += data.delta
                setStreamingMessage(accumulated)
              }
              if (data.done) {
                const aiMsg = {
                  role: 'assistant',
                  content: accumulated,
                  _id: data.messageId || `ai-${Date.now()}`
                }
                setMessages(prev => {
                  const withoutTemp = prev.filter(m => !m._id?.toString().startsWith('temp-'))
                  return [...withoutTemp, userMsg, aiMsg]
                })
                setStreamingMessage('')
                await fetchChats()
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      throw err
    }
  }

  const deleteChat = async (chatId) => {
    await api.delete(`/chat/${chatId}`)
    setChats(prev => prev.filter(c => c._id !== chatId))
    if (activeChat?._id === chatId) {
      setActiveChat(null)
      setMessages([])
    }
  }

  return (
    <ChatContext.Provider value={{
      chats, activeChat, messages, loading, limitReached, msUntilReset,
      practiceLimit, setPracticeLimit, streamingMessage,
      fetchChats, createChat, loadChat, sendMessage, deleteChat, setActiveChat, setMessages, setStreamingMessage}}>
      {children}
    </ChatContext.Provider>
  )
}