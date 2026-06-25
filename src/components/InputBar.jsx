import { useState } from 'react'
import { Send } from 'lucide-react'

const InputBar = ({ onSend, disabled }) => {
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
    <div className="border-t border-white/5 px-4 py-4">
      <div className="flex items-end gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="What's going on? Tell me everything..."
          rows={1}
          disabled={disabled}
          className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none resize-none max-h-40"
          style={{ height: 'auto' }}
          onInput={e => {
            e.target.style.height = 'auto'
            e.target.style.height = e.target.scrollHeight + 'px'
          }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className="w-8 h-8 bg-purple-600 hover:bg-purple-700 disabled:opacity-30 rounded-xl flex items-center justify-center transition-colors shrink-0"
        >
          <Send size={14} />
        </button>
      </div>
      <p className="text-xs text-gray-700 text-center mt-2">Press Enter to send · Shift+Enter for new line</p>
    </div>
  )
}

export default InputBar