import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../utils/api'
 
// states: 'idle' | 'listening' | 'thinking' | 'speaking'
 
const VoiceMode = ({ onUserSpeech, onSessionEnd }) => {
  const [state, setState] = useState('idle')
  const [remaining, setRemaining] = useState(null)
  const recognitionRef = useRef(null)
  const activeRef = useRef(false) // tracks whether the conversation loop should continue
 
  const SpeechRecognitionAPI = typeof window !== 'undefined'
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : null
 
  useEffect(() => {
    return () => {
      activeRef.current = false
      recognitionRef.current?.abort()
      window.speechSynthesis?.cancel()
    }
  }, [])
 
  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI) {
      toast.error('Voice isn\'t supported in this browser — try Chrome')
      return
    }
    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'
 
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript
      if (!activeRef.current) return
      setState('thinking')
      try {
        const reply = await onUserSpeech(transcript)
        if (!activeRef.current) return
        speak(reply)
      } catch (err) {
        toast.error('Something went wrong, try again')
        setState('listening')
        recognitionRef.current?.start()
      }
    }
 
    recognition.onerror = (event) => {
      if (event.error === 'no-speech' && activeRef.current) {
        recognitionRef.current?.start() // keep listening quietly
        return
      }
      if (activeRef.current) {
        setState('listening')
      }
    }
 
    recognition.onend = () => {
      // only auto-restart if we're still meant to be listening (not mid-thinking/speaking, not stopped)
      if (activeRef.current && state !== 'thinking' && state !== 'speaking') {
        recognition.start()
      }
    }
 
    recognitionRef.current = recognition
    recognition.start()
    setState('listening')
  }, [SpeechRecognitionAPI, onUserSpeech, state])
 
  const speak = (text) => {
    setState('speaking')
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.pitch = 1
    utterance.onend = () => {
      if (activeRef.current) startListening()
    }
    utterance.onerror = () => {
      if (activeRef.current) startListening()
    }
    window.speechSynthesis.speak(utterance)
  }
 
  const handleStart = async () => {
    try {
      const { data } = await api.post('/voice/start-session')
      setRemaining(data.remaining)
      activeRef.current = true
      startListening()
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not start voice session'
      toast.error(msg)
    }
  }
 
  const handleStop = () => {
    activeRef.current = false
    recognitionRef.current?.abort()
    window.speechSynthesis.cancel()
    setState('idle')
    onSessionEnd?.()
  }
 
  const stateConfig = {
    idle: { emoji: '🎙️', label: 'Tap to talk', color: 'rgba(255,255,255,0.05)' },
    listening: { emoji: '🔴', label: 'Listening...', color: 'rgba(239,68,68,0.15)' },
    thinking: { emoji: '💭', label: 'Vela is thinking...', color: 'rgba(168,85,247,0.15)' },
    speaking: { emoji: '🔊', label: 'Vela is speaking...', color: 'rgba(168,85,247,0.25)' }
  }
  const current = stateConfig[state]
 
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <motion.button
          onClick={state === 'idle' ? handleStart : undefined}
          animate={state === 'listening' ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={state === 'listening' ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } : {}}
          whileHover={state === 'idle' ? { scale: 1.05 } : {}}
          whileTap={state === 'idle' ? { scale: 0.95 } : {}}
          style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: current.color,
            border: '1px solid rgba(255,255,255,0.15)',
            fontSize: '26px', cursor: state === 'idle' ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          {current.emoji}
        </motion.button>
 
        <AnimatePresence>
          {state !== 'idle' && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleStop}
              title="Stop conversation"
              style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                fontSize: '18px', cursor: 'pointer', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              ⏹️
            </motion.button>
          )}
        </AnimatePresence>
      </div>
 
      <span style={{ fontSize: '13px', color: '#9ca3af' }}>{current.label}</span>
 
      {state === 'idle' && remaining !== null && (
        <span style={{ fontSize: '11px', color: '#6b7280' }}>{remaining} voice session{remaining === 1 ? '' : 's'} left today</span>
      )}
    </div>
  )
}
 
export default VoiceMode