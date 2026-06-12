import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { useT } from '../hooks/useT'
import { useVoiceInput } from '../hooks/useVoiceInput'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { api } from '../services/api'
import { v4 as uuidv4 } from 'uuid'

// Animated sound wave — shows when tutor is speaking
function SoundWave({ active, color = '#6C63FF' }) {
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
          style={{ backgroundColor: color }}
          className="w-1 rounded-full"
          initial={{ scaleY: 0.15, height: 32 }}
        />
      ))}
    </div>
  )
}

// Pulsing mic ring — shows when user is speaking
function MicPulse({ active }) {
  return (
    <div className="relative flex items-center justify-center">
      <AnimatePresence>
        {active && (
          <>
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                className="absolute rounded-full border-2 border-red-400"
                initial={{ width: 80, height: 80, opacity: 0.6 }}
                animate={{ width: 80 + i * 30, height: 80 + i * 30, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: 'easeOut' }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
      <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl
        ${active
          ? 'bg-red-500 shadow-red-500/40'
          : 'bg-night-700 border-2 border-night-600'
        }`}>
        <svg className={`w-8 h-8 ${active ? 'text-white' : 'text-cloud-400'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </div>
    </div>
  )
}

const SCENARIOS = [
  { id: 'free',       emoji: '💬', label: 'Free conversation',  labelEs: 'Conversación libre',    prompt: 'Let\'s have a natural English conversation. Start with a friendly greeting and ask me something interesting about my life.' },
  { id: 'interview',  emoji: '💼', label: 'Job interview',      labelEs: 'Entrevista de trabajo',  prompt: 'You are a professional interviewer. Conduct a realistic job interview in English. Start by introducing yourself and asking me to tell you about myself.' },
  { id: 'restaurant', emoji: '🍽️', label: 'At the restaurant',  labelEs: 'En el restaurante',     prompt: 'You are a friendly waiter at an upscale restaurant. Greet me and take my order in natural English.' },
  { id: 'travel',     emoji: '✈️', label: 'Travel English',     labelEs: 'Inglés para viajes',    prompt: 'You are an airport check-in agent. I am a passenger checking in for my flight. Conduct a realistic check-in in English.' },
  { id: 'doctor',     emoji: '🏥', label: 'Doctor\'s office',   labelEs: 'Consultorio médico',    prompt: 'You are a friendly doctor. I am a patient describing symptoms. Conduct the consultation in natural, clear English.' },
  { id: 'debate',     emoji: '🎤', label: 'Debate & opinions',  labelEs: 'Debate y opiniones',    prompt: 'Let\'s practice expressing opinions in English. Pick an interesting topic and ask for my opinion, then respectfully share yours.' },
]

export default function ConversationPage() {
  const { userId, level, uiLanguage } = useStore()
  const t = useT()
  const sessionId = useRef(uuidv4())

  const [phase, setPhase] = useState('select')   // select | talking
  const [scenario, setScenario] = useState(null)
  const [transcript, setTranscript] = useState([]) // [{role, text}]
  const [status, setStatus] = useState('idle')    // idle | listening | thinking | speaking
  const [error, setError] = useState(null)

  const { speak, speakBilingual, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis()

  const sendToTutor = useCallback(async (userText) => {
    setStatus('thinking')
    try {
      const data = await api.chat({
        sessionId: sessionId.current,
        userId,
        message: userText,
        level,
      })
      const tutorText = data.response

      setTranscript(prev => [
        ...prev,
        { role: 'assistant', text: tutorText }
      ])

      setStatus('speaking')
      speakBilingual(tutorText, level)
    } catch {
      setError('Connection error. Please try again.')
      setStatus('idle')
    }
  }, [userId, level, speak])

  const { isListening, isSupported, start: startListening, stop: stopListening } = useVoiceInput({
    onResult: useCallback((text) => {
      if (!text.trim()) return
      setTranscript(prev => [...prev, { role: 'user', text }])
      setStatus('thinking')
      sendToTutor(text)
    }, [sendToTutor]),
    language: 'en-US',
  })

  // Sync status with hooks
  useEffect(() => {
    if (isListening) setStatus('listening')
  }, [isListening])

  useEffect(() => {
    if (!isSpeaking && status === 'speaking') setStatus('idle')
  }, [isSpeaking, status])

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
      const tutorText = data.response
      setTranscript([{ role: 'assistant', text: tutorText }])
      setStatus('speaking')
      speakBilingual(tutorText, level)
    } catch {
      setError('Could not start. Check your connection.')
      setStatus('idle')
    }
  }

  const handleMicPress = () => {
    if (status === 'listening') {
      stopListening()
      setStatus('idle')
    } else if (status === 'speaking') {
      stopSpeaking()
      setStatus('listening')
      startListening()
    } else if (status === 'idle') {
      setStatus('listening')
      startListening()
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
    idle:      uiLanguage === 'es' ? 'Toca el micrófono para hablar' : 'Tap mic to speak',
    listening: uiLanguage === 'es' ? 'Escuchando...' : 'Listening...',
    thinking:  uiLanguage === 'es' ? 'El tutor está pensando...' : 'Tutor is thinking...',
    speaking:  uiLanguage === 'es' ? 'El tutor está hablando...' : 'Tutor is speaking...',
  }[status]

  // --- SCENARIO SELECTION SCREEN ---
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
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8">
            <p className="text-cloud-400 text-sm max-w-xs mx-auto">
              {uiLanguage === 'es'
                ? 'Elige un escenario y practica inglés hablado en tiempo real con tu tutor IA.'
                : 'Choose a scenario and practice spoken English in real time with your AI tutor.'}
            </p>
          </motion.div>

          {!isSupported && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 text-sm text-red-300 text-center">
              {uiLanguage === 'es'
                ? '⚠️ Tu navegador no soporta voz. Usa Chrome o Safari.'
                : '⚠️ Your browser does not support voice. Use Chrome or Safari.'}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            {SCENARIOS.map((sc, i) => (
              <motion.button
                key={sc.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => startScenario(sc)}
                disabled={!isSupported}
                className="flex items-center gap-4 text-left bg-night-800 hover:bg-night-700 border border-night-600 hover:border-violet-500/40 rounded-2xl px-5 py-4 transition-all duration-200 group disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="text-3xl">{sc.emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold text-cloud-100 text-sm group-hover:text-white transition-colors">
                    {uiLanguage === 'es' ? sc.labelEs : sc.label}
                  </p>
                </div>
                <span className="text-cloud-600 group-hover:text-violet-400 transition-colors">→</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // --- CONVERSATION SCREEN ---
  return (
    <div className="flex flex-col bg-night-950" style={{ height: '100dvh' }}>
      {/* Header */}
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

      {/* Transcript scroll */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-3">
          <AnimatePresence initial={false}>
            {transcript.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold
                  ${msg.role === 'user' ? 'bg-violet-500 text-white' : 'bg-gradient-to-br from-mint-400 to-violet-500 text-white'}`}>
                  {msg.role === 'user' ? '✦' : '🎓'}
                </div>
                <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-violet-500 text-white rounded-tr-sm'
                    : 'bg-night-800 text-cloud-200 border border-night-600 rounded-tl-sm'
                  }`}>
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

      {/* Voice control center */}
      <div className="pb-20 pt-4">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-4 px-4">

          {/* Error */}
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
              {error}
            </p>
          )}

          {/* Tutor sound wave */}
          <div className="flex flex-col items-center gap-2">
            <SoundWave active={status === 'speaking'} />
            <span className="text-xs text-cloud-600">
              {uiLanguage === 'es' ? 'Tutor' : 'Tutor'}
            </span>
          </div>

          {/* Status label */}
          <p className="text-sm text-cloud-400 h-5 text-center">{statusLabel}</p>

          {/* Main mic button */}
          <MicPulse active={status === 'listening'} />

          {/* Tap instruction */}
          <p className="text-xs text-cloud-600 text-center">
            {status === 'idle'
              ? (uiLanguage === 'es' ? 'Toca para hablar' : 'Tap to speak')
              : status === 'listening'
              ? (uiLanguage === 'es' ? 'Toca para terminar' : 'Tap to stop')
              : status === 'speaking'
              ? (uiLanguage === 'es' ? 'Toca para interrumpir' : 'Tap to interrupt')
              : '...'}
          </p>

          {/* Invisible tap area over mic */}
          <button
            onClick={handleMicPress}
            disabled={status === 'thinking'}
            className="absolute w-28 h-28 rounded-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            style={{ marginTop: '-6rem' }}
            aria-label="Toggle microphone"
          />
        </div>
      </div>
    </div>
  )
}
