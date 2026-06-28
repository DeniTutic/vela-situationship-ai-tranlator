import { createContext, useState } from 'react'
import api from '../utils/api'

export const ChatContext = createContext()

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [limitReached, setLimitReached] = useState(false)

  const fetchChats = async () => {
    const res = await api.get('/chat')
    setChats(res.data)
  }

  const createChat = async (responseStyle = 'gentle') => {
    const res = await api.post('/chat/new', { responseStyle })
    setChats(prev => [res.data, ...prev])
    setActiveChat(res.data)
    setMessages([])
    setLimitReached(false)
    return res.data
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
      const res = await api.post(`/chat/${chatId}/message`, { content, inputType })
      const chatRes = await api.get(`/chat/${chatId}`)
      setMessages(chatRes.data.messages)
      await fetchChats()
      return res.data.message
    } catch (err) {
      if (err.response?.status === 429) {
        setLimitReached(true)
      }
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
      chats, activeChat, messages, loading, limitReached,
      fetchChats, createChat, loadChat, sendMessage, deleteChat, setActiveChat, setMessages
    }}>
      {children}
    </ChatContext.Provider>
  )
}