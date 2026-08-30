import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { motion } from 'framer-motion'
import { Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const ChatBubble = ({ message }) => {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    toast.success('Copied to clipboard!', { position: 'top-center' })
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      alignItems: 'flex-start',
      marginBottom: '16px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {!isUser && (
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #a855f7, #ec4899)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 'bold',
          color: 'white',
          marginRight: '8px',
          flexShrink: 0
        }}>V</div>
      )}

      {isUser ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          maxWidth: '70%',
          gap: '6px'
        }}>
          {message.imageUrl && (
            <img
              src={message.imageUrl}
              alt="shared screenshot"
              style={{
                maxWidth: '100%',
                maxHeight: '250px',
                borderRadius: '12px',
                objectFit: 'contain',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            />
          )}
          {message.content && message.content !== '📸 Shared a screenshot for analysis' && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '18px 18px 4px 18px',
              fontSize: '14px',
              lineHeight: '1.5',
              backgroundColor: '#9333ea',
              color: 'white',
              wordBreak: 'break-word'
            }}>
              {message.content}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '70%', gap: '4px' }}>
          <div style={{
            padding: '10px 14px',
            borderRadius: '18px 18px 18px 4px',
            fontSize: '14px',
            lineHeight: '1.6',
            backgroundColor: 'rgba(255,255,255,0.06)',
            color: '#e5e7eb',
            wordBreak: 'break-word'
          }}>
            <ReactMarkdown
              components={{
                p: ({ children }) => <p style={{ margin: '0 0 8px 0' }}>{children}</p>,
                strong: ({ children }) => <strong style={{ color: 'white', fontWeight: '600' }}>{children}</strong>,
                ul: ({ children }) => <ul style={{ paddingLeft: '20px', margin: '0 0 8px 0' }}>{children}</ul>,
                ol: ({ children }) => <ol style={{ paddingLeft: '20px', margin: '0 0 8px 0' }}>{children}</ol>,
                li: ({ children }) => <li style={{ color: '#d1d5db', marginBottom: '4px' }}>{children}</li>,
                h1: ({ children }) => <h1 style={{ color: 'white', fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px 0' }}>{children}</h1>,
                h2: ({ children }) => <h2 style={{ color: 'white', fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0' }}>{children}</h2>,
                h3: ({ children }) => <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>{children}</h3>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          <button
            onClick={handleCopy}
            style={{
              alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '4px',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '2px 6px', color: '#6b7280', fontSize: '11px'
            }}
          >
            {copied ? <Check size={11} color="#4ade80" /> : <Copy size={11} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
    </motion.div>
  )
}

export default ChatBubble