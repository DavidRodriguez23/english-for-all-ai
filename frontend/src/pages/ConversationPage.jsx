import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { useVoiceInput } from '../hooks/useVoiceInput'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { api } from '../services/api'
import { v4 as uuidv4 } from 'uuid'

function SoundWave({ active }) {
  return (
    <div className="flex items-center gap-1 h-8">
      {[0.4, 0.7, 1, 0.8, 0.5, 0.9, 0.6, 1, 0.7, 0.4].map((h, i) => (
        <motion.div
          key={i}
          animate={active
            ? { scaleY: [h * 0.3, h, h * 0.5, h * 0.8, h * 0.3], opacity: 1 }
            : { scaleY: 0.15, opacity: 0.3 }
          }
          transition={active
            ? { duration: 0.8 + i * 0.05, repeat: Infinity, ease: 'easeInOut', delay: i * 0.08 }
            : { duration: 0.3 }
          }
          style={{ backgroundColor: '#6C63FF', height: 32 }}
          className="w-1 rounded-full"
          initial={{ scaleY: 0.15 }}
        />
      ))}
    </div>
  )
}

// Mic button — onClick is directly on the visible button, not a hidden overlay
function MicButton({ active, onPress, disabled }) {
  return (
    <button
      onClick={onPress}
      disabled={disabled}
      className="relative flex items-center justify-center focus:outline-none"
      aria-label={active ? 'Stop recording' : 'Start recording'}
    >
      {/* Pulse rings */}
      <AnimatePresence>
        {active && [1, 2, 3].map(i => (
          <motion.div
            key={i}
            className="absolute rounded-full border-2 border-red-400"
            initial={{ width: 80, height: 80, opacity: 0.6 }}
            animate={{ width: 80 + i * 28, height: 80 + i * 28, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* Main circle — this IS the button */}
      <motion.div
        whileTap={{ scale: 0.92 }}
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl z-10
          ${active ? 'bg-red-500 shadow-red-500/40' : 'bg-night-700 border-2 border-night-600 hover:border-violet-500/50'}
          ${disabled ? 'opacity-40' : ''}`}
      >
        {active ? (
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg className="w-8 h-8 text-cloud-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </motion.div>
    </button>
  )
}

const SCENARIOS = [
  { id: 'free',       emoji: '💬', label: 'Free conversation',  labelEs: 'Conversación libre',   prompt: "Let's have a natural English conversation. Start with a friendly greeting and ask me something interesting about my life." },
  { id: 'interview',  emoji: '💼', label: 'Job interview',      labelEs: 'Entrevista de trabajo', prompt: "You are a professional interviewer. Conduct a realistic job interview. Start by introducing yourself and asking me to tell you about myself." },
  { id: 'restaurant', emoji: '🍽️', label: 'At the restaurant',  labelEs: 'En el restaurante',    prompt: "You are a friendly waiter at a restaurant. Greet me and take my order in natural English." },
  { id: 'travel',     emoji: '✈️', label: 'Travel English',     labelEs: 'Inglés para viajes',   prompt: "You are an airport check-in agent. I am a passenger. Conduct a realistic check-in in English." },
  { id: 'doctor',     emoji: '🏥', label: "Doctor's office",    labelEs: 'Consultorio médico',   prompt: "You are a friendly doctor. I am a patient describing symptoms. Conduct the consultation in clear English." },
  { id: 'debate',     emoji: '🎤', label: 'Debate & opinions',  labelEs: 'Debate y opiniones',   prompt: "Let's practice expressing opinions in English. Pick an interesting topic and ask for my opinion." },
]

export default function ConversationPage() {
  const { userId, level, uiLanguage } = useStore()
  const sessionId = useRef(uuidv4())

  const [phase, setPhase] = useState('select')
  const [scenario, setScenario] = useState(null)
  const [transcript, setTranscript] = useState([])
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  const { speakBilingual, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis()

  const sendToTutor = useCallback(async (userText) => {
    setStatus('thinking')
    try {
      const data = await api.chat({
        sessionId: sessionId.current,
        userId,
        message: userText,
        level,
      })
      setTranscript(prev => [...prev, { role: 'assistant', text: data.response }])
      setStatus('speaking')
      speakBilingual(data.response, level)
    } catch {
      setError(uiLanguage === 'es' ? 'Error de conexión. Intenta de nuevo.' : 'Connection error. Try again.')
      setStatus('idle')
    }
  }, [userId, level, speakBilingual, uiLanguage])

  const { isListening, isSupported, start: startListening, stop: stopListening } = useVoiceInput({
    onResult: useCallback((text) => {
      if (!text.trim()) return
      setTranscript(prev => [...prev, { role: 'user', text }])
      sendToTutor(text)
    }, [sendToTutor]),
    language: 'en-US',
  })

  // Sync speaking status
  if (!isSpeaking && status === 'speaking') setStatus('idle')

  const handleMicPress = () => {
    if (status === 'thinking') return
    if (status === 'listening') {
      stopListening()
      setStatus('idle')
    } else if (status === 'speaking') {
      stopSpeaking()
      startListening()
      setStatus('listening')
    } else {
      setError(null)
      startListening()
      setStatus('listening')
    }
  }

  const startScenario = async (sc) => {
    setScenario(sc)
    setPhase('talking')
    setTranscript([])
    sessionId.current = uuidv4()
    setStatus('thinking')
    try {
      const data = await api.chat({
        sessionId: sessionId.current,
        userId,
        message: sc.prompt,
        level,
      })
      setTranscript([{ role: 'assistant', text: data.response }])
      setStatus('speaking')
      speakBilingual(data.response, level)
    } catch {
      setError('Could not start. Check your connection.')
      setStatus('idle')
    }
  }

  const endConversation = () => {
    stopSpeaking()
    stopListening()
    setPhase('select')
    setTranscript([])
    setStatus('idle')
    setError(null)
  }

  const statusLabel = {
    idle:     uiLanguage === 'es' ? 'Toca el micrófono para hablar' : 'Tap mic to speak',
    listening:uiLanguage === 'es' ? 'Escuchando... (toca para parar)' : 'Listening... (tap to stop)',
    thinking: uiLanguage === 'es' ? 'El tutor está pensando...' : 'Tutor is thinking...',
    speaking: uiLanguage === 'es' ? 'El tutor está hablando... (toca para interrumpir)' : 'Tutor speaking... (tap to interrupt)',
  }[status]

  // --- SCENARIO SELECTION ---
  if (phase === 'select') {
    return (
      <div className="min-h-screen bg-night-950 pb-24">
        <div className="glass border-b border-night-700 sticky top-0 z-30">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
            <h1 className="font-display font-bold text-cloud-100 text-lg">
              {uiLanguage === 'es' ? '🎙️ Habla con tu tutor' : '🎙️ Talk to your tutor'}
            </h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-cloud-400 text-sm text-center mb-8 max-w-xs mx-auto">
            {uiLanguage === 'es'
              ? 'Elige un escenario y practica inglés hablado en tiempo real.'
              : 'Choose a scenario and practice spoken English in real time.'}
          </motion.p>

          {!isSupported && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 text-sm text-red-300 text-center">
              ⚠️ {uiLanguage === 'es' ? 'Usa Safari en iOS o Chrome en Android.' : 'Use Safari on iOS or Chrome on Android.'}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            {SCENARIOS.map((sc, i) => (
              <motion.button key={sc.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => startScenario(sc)}
                disabled={!isSupported}
                className="flex items-center gap-4 text-left bg-night-800 hover:bg-night-700 border border-night-600 hover:border-violet-500/40 rounded-2xl px-5 py-4 transition-all duration-200 group disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="text-3xl">{sc.emoji}</span>
                <span className="font-semibold text-cloud-100 text-sm group-hover:text-white transition-colors flex-1">
                  {uiLanguage === 'es' ? sc.labelEs : sc.label}
                </span>
                <span className="text-cloud-600 group-hover:text-violet-400 transition-colors">→</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // --- CONVERSATION ---
  return (
    <div className="flex flex-col bg-night-950" style={{ height: '100dvh' }}>
      <div className="glass border-b border-night-700 z-30">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">{scenario?.emoji}</span>
            <span className="font-semibold text-cloud-100 text-sm">
              {uiLanguage === 'es' ? scenario?.labelEs : scenario?.label}
            </span>
          </div>
          <button onClick={endConversation}
            className="text-xs text-cloud-600 hover:text-cloud-200 bg-night-800 border border-night-600 px-3 py-1.5 rounded-xl transition-colors">
            {uiLanguage === 'es' ? 'Terminar' : 'End'}
          </button>
        </div>
      </div>

      {/* Transcript */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-3">
          <AnimatePresence initial={false}>
            {transcript.map((msg, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold
                  ${msg.role === 'user' ? 'bg-violet-500 text-white' : 'bg-gradient-to-br from-mint-400 to-violet-500 text-white'}`}>
                  {msg.role === 'user' ? '✦' : '🎓'}
                </div>
                <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-violet-500 text-white rounded-tr-sm'
                    : 'bg-night-800 text-cloud-200 border border-night-600 rounded-tl-sm'}`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {status === 'thinking' && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-mint-400 to-violet-500 flex items-center justify-center text-xs">🎓</div>
              <div className="bg-night-800 border border-night-600 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center h-4">
                  {[0,1,2].map(i => <div key={i} className="typing-dot" />)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Voice controls */}
      <div className="pb-20 pt-2">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-3 px-4">
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 text-center">
              {error}
            </p>
          )}

          <SoundWave active={status === 'speaking'} />

          <p className="text-xs text-cloud-500 text-center min-h-[16px]">{statusLabel}</p>

          {/* THE mic button — onClick directly on the element, no invisible overlay */}
          <MicButton
            active={status === 'listening'}
            onPress={handleMicPress}
            disabled={status === 'thinking'}
          />
        </div>
      </div>
    </div>
  )
}
