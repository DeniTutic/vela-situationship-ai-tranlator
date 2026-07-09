import { useState, forwardRef, useRef, useEffect } from 'react'
import { Send, ImagePlus, X, Mic, MicOff, AudioLines, Lock } from 'lucide-react'
 
const InputBar = forwardRef(({ onSend, onImageUpload, disabled, onOpenVoiceMode, voiceUnlocked = true }, ref) => {
  const [text, setText] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [listening, setListening] = useState(false)
  const fileRef = useRef(null)
  const recognitionRef = useRef(null)
 
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return
 
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
 
    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      setText(transcript)
    }
 
    recognition.onend = () => {
      setListening(false)
    }
 
    recognition.onerror = () => {
      setListening(false)
    }
 
    recognitionRef.current = recognition
  }, [])
 
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in this browser. Try Chrome.')
      return
    }
    if (listening) {
      recognitionRef.current.stop()
      setListening(false)
    } else {
      setText('')
      recognitionRef.current.start()
      setListening(true)
    }
  }
 
  const handleSend = () => {
    if ((!text.trim() && !imageFile) || disabled) return
    if (listening) {
      recognitionRef.current.stop()
      setListening(false)
    }
    if (imageFile) {
      onImageUpload(imageFile, text.trim())
      setImageFile(null)
      setImagePreview(null)
      setText('')
    } else {
      onSend(text.trim())
      setText('')
    }
  }
 
  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
 
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => setImagePreview(ev.target.result)
      reader.readAsDataURL(file)
      e.target.value = ''
    }
  }
 
  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }
 
  const canSend = (text.trim() || imageFile) && !disabled
 
  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '12px 24px' }}>
    <div style={{ maxWidth: '760px', margin: '0 auto' }}> 
      {/* Image preview */}
      {imagePreview && (
        <div style={{ marginBottom: '8px', position: 'relative', display: 'inline-block' }}>
          <img
            src={imagePreview}
            alt="preview"
            style={{ maxHeight: '120px', maxWidth: '200px', borderRadius: '10px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <button
            onClick={removeImage}
            style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', backgroundColor: '#374151', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={10} color="white" />
          </button>
        </div>
      )}
 
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', backgroundColor: listening ? 'rgba(168,85,247,0.08)' : 'rgba(255,255,255,0.05)', border: `1px solid ${listening ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '16px', padding: '12px 16px', transition: 'all 0.2s' }}>
        <textarea
          ref={ref}
          value={text}
          onChange={e => {
            setText(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
          }}
          onKeyDown={handleKey}
          placeholder={listening ? '🎙️ Listening...' : imageFile ? 'Add a message (optional)...' : "What's going on? Tell me everything..."}
          disabled={disabled}
          rows={1}
          style={{
            flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none',
            color: 'white', fontSize: '14px', resize: 'none', lineHeight: '1.5',
            fontFamily: 'inherit', maxHeight: '160px', overflow: 'auto'
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <span style={{ fontSize: '11px', color: text.length > 800 ? '#f87171' : '#4b5563' }}>
            {text.length}/1000
          </span>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
 
          {/* Upload screenshot */}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={disabled}
            title="Upload screenshot"
            style={{
              width: '32px', height: '32px',
              backgroundColor: imageFile ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.05)',
              border: 'none', borderRadius: '10px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: disabled ? 'default' : 'pointer', flexShrink: 0
            }}
          >
            <ImagePlus size={14} color={imageFile ? '#a855f7' : '#6b7280'} />
          </button>
 
          {/* Quick dictation — fills the text box, you still hit send */}
          <button
            onClick={toggleListening}
            disabled={disabled}
            title={listening ? 'Stop dictating' : 'Dictate a message'}
            style={{
              width: '32px', height: '32px',
              backgroundColor: listening ? 'rgba(236,72,153,0.2)' : 'rgba(255,255,255,0.05)',
              border: 'none', borderRadius: '10px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: disabled ? 'default' : 'pointer', flexShrink: 0,
              animation: listening ? 'pulse 1.5s infinite' : 'none'
            }}
          >
            {listening ? <MicOff size={14} color="#ec4899" /> : <Mic size={14} color="#6b7280" />}
          </button>
 
          {/* Live voice conversation with Vela — distinct icon from dictation */}
          {onOpenVoiceMode && (
            <button
              onClick={onOpenVoiceMode}
              disabled={disabled}
              title={voiceUnlocked ? 'Talk to Vela live' : 'Voice conversations are a Vela+ feature'}
              style={{
                width: '32px', height: '32px', position: 'relative',
                backgroundColor: 'rgba(168,85,247,0.12)',
                border: '1px solid rgba(168,85,247,0.25)', borderRadius: '10px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: disabled ? 'default' : 'pointer', flexShrink: 0
              }}
            >
              <AudioLines size={14} color="#c084fc" />
              {!voiceUnlocked && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '13px', height: '13px', borderRadius: '50%', backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={8} color="#6b7280" />
                </span>
              )}
            </button>
          )}
 
          {/* Send */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            style={{
              width: '32px', height: '32px',
              backgroundColor: canSend ? '#9333ea' : 'rgba(255,255,255,0.05)',
              border: 'none', borderRadius: '10px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: canSend ? 'pointer' : 'default',
              transition: 'background-color 0.2s', flexShrink: 0
            }}
          >
            <Send size={14} color={canSend ? 'white' : '#4b5563'} />
          </button>
        </div>
      </div>
      <p style={{ fontSize: '11px', color: '#374151', textAlign: 'center', marginTop: '8px' }}>
        Enter to send · Shift+Enter for new line · 🎙️ dictates, 🔊 talks live
      </p>
    </div>
    </div>
  )
})
 
InputBar.displayName = 'InputBar'
 
export default InputBar