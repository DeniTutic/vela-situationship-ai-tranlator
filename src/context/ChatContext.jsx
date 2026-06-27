import { createContext, useState } from 'react'
import api from '../utils/api'

export const ChatContext = createContext()

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchChats = async () => {
    const res = await api.get('/chat')
    setChats(res.data)
  }

  const createChat = async (responseStyle = 'gentle') => {
    const res = await api.post('/chat/new', { responseStyle })
    setChats(prev => [res.data, ...prev])
    setActiveChat(res.data)
    setMessages([])
    return res.data
  }

  const loadChat = async (chatId) => {
    setLoading(true)
    const res = await api.get(`/chat/${chatId}`)
    setActiveChat(res.data.chat)
    setMessages(res.data.messages)
    setLoading(false)
  }

  const sendMessage = async (chatId, content, inputType = 'text') => {
    const tempId = `temp-${Date.now()}`
    const userMsg = { role: 'user', content, _id: tempId, inputType }
    setMessages(prev => [...prev, userMsg])

    const res = await api.post(`/chat/${chatId}/message`, { content, inputType })
    
    // Replace temp message with real messages from DB
    const chatRes = await api.get(`/chat/${chatId}`)
    setMessages(chatRes.data.messages)
    
    await fetchChats()
    return res.data.message
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
      chats, activeChat, messages, loading,
      fetchChats, createChat, loadChat, sendMessage, deleteChat, setActiveChat, setMessages
    }}>
      {children}
    </ChatContext.Provider>
  )
}