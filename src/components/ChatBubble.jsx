import ReactMarkdown from 'react-markdown'

const ChatBubble = ({ message }) => {
  const isUser = message.role === 'user'

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '16px',
      width: '100%'
    }}>
      {!isUser && (
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #a855f7, #ec4899)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: 'bold', color: 'white',
          marginRight: '8px', marginTop: '4px', flexShrink: 0
        }}>V</div>
      )}
      <div style={{
        maxWidth: '75%',
        padding: '12px 16px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        fontSize: '14px',
        lineHeight: '1.6',
        backgroundColor: isUser ? '#9333ea' : 'rgba(255,255,255,0.05)',
        color: isUser ? 'white' : '#e5e7eb',
      }}>
        {isUser ? (
          <p style={{ margin: 0 }}>{message.content}</p>
        ) : (
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
        )}
      </div>
    </div>
  )
}

export default ChatBubble
