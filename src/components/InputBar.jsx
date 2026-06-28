import { useState, forwardRef } from 'react'
import { Send } from 'lucide-react'

const InputBar = forwardRef(({ onSend, disabled }, ref) => {
  const [text, setText] = useState('')

  const handleSend = () => {
    if (!text.trim() || disabled) return
    onSend(text.trim())
    setText('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '16px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '12px 16px' }}>
        <textarea
          ref={ref}
          value={text}
          onChange={e => {
            setText(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
          }}
          onKeyDown={handleKey}
          placeholder="What's going on? Tell me everything..."
          disabled={disabled}
          rows={1}
          style={{
            flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none',
            color: 'white', fontSize: '14px', resize: 'none', lineHeight: '1.5',
            fontFamily: 'inherit', maxHeight: '160px', overflow: 'auto'
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span style={{ fontSize: '11px', color: text.length > 800 ? '#f87171' : '#4b5563' }}>
            {text.length}/1000
          </span>
          <button
            onClick={handleSend}
            disabled={!text.trim() || disabled}
            style={{
              width: '32px', height: '32px',
              backgroundColor: text.trim() && !disabled ? '#9333ea' : 'rgba(255,255,255,0.05)',
              border: 'none', borderRadius: '10px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: text.trim() && !disabled ? 'pointer' : 'default',
              transition: 'background-color 0.2s', flexShrink: 0
            }}
          >
            <Send size={14} color={text.trim() && !disabled ? 'white' : '#4b5563'} />
          </button>
        </div>
      </div>
      <p style={{ fontSize: '11px', color: '#374151', textAlign: 'center', marginTop: '8px' }}>
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  )
})

InputBar.displayName = 'InputBar'

export default InputBar